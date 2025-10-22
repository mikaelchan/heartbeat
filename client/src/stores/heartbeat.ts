import { defineStore } from 'pinia';
import axios from 'axios';
import type {
  Relationship,
  RelationshipSummary,
  Memory,
  Plan,
  BucketItem,
  Message,
  Milestone,
  PaginatedResult
} from '@/types';
import { useAuthStore } from './auth';
import type { UserGender } from '@/types/auth';
import { getPartnerName } from '@/utils/user';

interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface State {
  relationshipSummary: RelationshipSummary | null;
  milestones: Milestone[];
  milestoneMeta: PaginationMeta;
  milestoneLoading: boolean;
  memories: Memory[];
  memoriesLoading: boolean;
  plans: Plan[];
  plansLoading: boolean;
  bucket: BucketItem[];
  bucketLoading: boolean;
  messages: Message[];
  messageMeta: PaginationMeta;
  messagesLoading: boolean;
}

const createFallbackRelationship = (username: string, gender: UserGender): Relationship => ({
  coupleNames: [username, getPartnerName(gender)],
  startedOn: '2025-07-19T15:21:55.000Z',
  milestones: [
    { label: `${username} 与 ${getPartnerName(gender)} 第一次牵手`, date: '2021-07-03T00:00:00.000Z' },
    { label: '第一次旅行', date: '2022-05-03T00:00:00.000Z' },
    { label: '相伴同居', date: '2023-08-20T00:00:00.000Z' }
  ]
});

const createFallbackMemories = (username: string, gender: UserGender): Memory[] => [
  {
    title: '日落海边',
    description: `${username} 与 ${getPartnerName(gender)} 第一次一起看海的日落，约定以后每年都要来看一次。`,
    photoUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
    location: { lat: 22.5431, lng: 114.0579, placeName: '深圳·大梅沙' },
    happenedOn: '2022-10-02T10:00:00.000Z'
  },
  {
    title: '雪中的拥抱',
    description: `${username} 把 ${getPartnerName(gender)} 揽在怀里，看漫天雪花。`,
    photoUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80',
    location: { lat: 41.8057, lng: 123.4315, placeName: '沈阳·棋盘山' },
    happenedOn: '2023-01-15T08:00:00.000Z'
  }
];

const createFallbackPlans = (username: string, gender: UserGender): Plan[] => [
  {
    title: '一起去看极光',
    description: `${username} 想牵着 ${getPartnerName(gender)} 在极光下许愿。`,
    scheduledOn: '2024-12-15T18:00:00.000Z',
    attachments: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=200&q=80'],
    status: 'upcoming'
  },
  {
    title: '拍一组情侣写真',
    description: `${username} 想把这一年的故事做成一本相册送给 ${getPartnerName(gender)}。`,
    scheduledOn: '2024-05-20T09:00:00.000Z',
    attachments: [],
    status: 'in-progress'
  }
];

const createFallbackBucket = (username: string, gender: UserGender): BucketItem[] =>
  Array.from({ length: 12 }, (_, index) => ({
    order: index + 1,
    title: `${username} 和 ${getPartnerName(gender)} 的第 ${index + 1} 件小事`,
    completed: index < 3
  }));

const createFallbackMessages = (username: string, gender: UserGender): Message[] => [
  {
    author: 'me',
    content: `${username} 记录下今天的心动瞬间，期待与 ${getPartnerName(gender)} 的明天。`,
    createdAt: new Date().toISOString()
  },
  {
    author: 'partner',
    content: `${getPartnerName(gender)} 对 ${username} 说：谢谢你一直把我放在心上。`,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
  }
];

const createFallbackData = () => {
  const authStore = useAuthStore();
  const username = authStore.user?.username ?? '我';
  const gender = authStore.user?.gender ?? 'other';
  const relationship = createFallbackRelationship(username, gender);
  return {
    relationship,
    memories: createFallbackMemories(username, gender),
    plans: createFallbackPlans(username, gender),
    bucket: createFallbackBucket(username, gender),
    messages: createFallbackMessages(username, gender)
  };
};

export const useHeartbeatStore = defineStore('heartbeat', {
  state: (): State => ({
    relationshipSummary: null,
    milestones: [],
    milestoneMeta: { page: 1, pageSize: 5, totalItems: 0, totalPages: 1 },
    milestoneLoading: false,
    memories: [],
    memoriesLoading: false,
    plans: [],
    plansLoading: false,
    bucket: [],
    bucketLoading: false,
    messages: [],
    messageMeta: { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 },
    messagesLoading: false
  }),
  actions: {
    async fetchRelationshipSummary(force = false) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        this.reset();
        return;
      }

      if (this.relationshipSummary && !force) {
        return;
      }

      const fallback = createFallbackData();
      try {
        const response = await axios.get<RelationshipSummary>('/api/relationship/summary');
        this.relationshipSummary = response.data;
      } catch (error) {
        console.error('Failed to fetch relationship summary', error);
        this.relationshipSummary = {
          coupleNames: fallback.relationship.coupleNames,
          startedOn: fallback.relationship.startedOn,
          milestoneCount: fallback.relationship.milestones.length
        };
      }
    },
    async fetchMilestones(page = 1, pageSize = this.milestoneMeta.pageSize) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || this.milestoneLoading) {
        if (!authStore.isAuthenticated) {
          this.reset();
        }
        return;
      }

      this.milestoneLoading = true;
      const fallback = createFallbackData();
      try {
        const response = await axios.get<PaginatedResult<Milestone>>('/api/relationship/milestones', {
          params: { page, pageSize }
        });
        this.milestones = response.data.items;
        this.milestoneMeta = {
          page: response.data.page,
          pageSize: response.data.pageSize,
          totalItems: response.data.totalItems,
          totalPages: response.data.totalPages
        };
      } catch (error) {
        console.error('Failed to fetch milestones', error);
        const totalItems = fallback.relationship.milestones.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const currentPage = Math.min(page, totalPages);
        const start = (currentPage - 1) * pageSize;
        this.milestones = fallback.relationship.milestones.slice(start, start + pageSize);
        this.milestoneMeta = { page: currentPage, pageSize, totalItems, totalPages };
      } finally {
        this.milestoneLoading = false;
      }
    },
    async fetchMemories() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || this.memoriesLoading) {
        if (!authStore.isAuthenticated) {
          this.reset();
        }
        return;
      }

      this.memoriesLoading = true;
      const fallback = createFallbackData();
      try {
        const response = await axios.get<Memory[]>('/api/memories');
        this.memories = response.data;
      } catch (error) {
        console.error('Failed to fetch memories', error);
        this.memories = fallback.memories;
      } finally {
        this.memoriesLoading = false;
      }
    },
    async fetchPlans() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || this.plansLoading) {
        if (!authStore.isAuthenticated) {
          this.reset();
        }
        return;
      }

      this.plansLoading = true;
      const fallback = createFallbackData();
      try {
        const response = await axios.get<Plan[]>('/api/plans');
        this.plans = response.data;
      } catch (error) {
        console.error('Failed to fetch plans', error);
        this.plans = fallback.plans;
      } finally {
        this.plansLoading = false;
      }
    },
    async addMilestone(label: string, date: string) {
      const trimmedLabel = label.trim();
      if (!trimmedLabel || !date) return;
      const normalizedDate = new Date(date);
      if (Number.isNaN(normalizedDate.getTime())) return;

      const payload = { label: trimmedLabel, date: normalizedDate.toISOString() };

      try {
        const response = await axios.post<Milestone>('/api/relationship/milestones', payload);
        this.milestones = [response.data, ...this.milestones];
      } catch (error) {
        console.error('Failed to create milestone', error);
        this.milestones = [payload, ...this.milestones];
      } finally {
        this.milestones = this.milestones
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (this.milestones.length > this.milestoneMeta.pageSize) {
          this.milestones = this.milestones.slice(0, this.milestoneMeta.pageSize);
        }
        this.milestoneMeta.totalItems += 1;
        this.milestoneMeta.totalPages = Math.max(
          1,
          Math.ceil(this.milestoneMeta.totalItems / this.milestoneMeta.pageSize)
        );
        this.milestoneMeta.page = 1;
        if (this.relationshipSummary) {
          this.relationshipSummary.milestoneCount += 1;
        }
      }
    },
    async addMemory(memory: Omit<Memory, '_id'>) {
      const lat = Number(memory.location.lat);
      const lng = Number(memory.location.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return;
      }

      const normalizedMemory: Omit<Memory, '_id'> = {
        ...memory,
        happenedOn: new Date(memory.happenedOn).toISOString(),
        location: {
          ...memory.location,
          lat,
          lng
        }
      };

      try {
        const response = await axios.post<Memory>('/api/memories', normalizedMemory);
        this.memories = [response.data, ...this.memories];
      } catch (error) {
        console.error('Failed to create memory', error);
        this.memories = [normalizedMemory, ...this.memories];
      }
    },
    async addPlan(plan: Omit<Plan, '_id'>) {
      const normalizedPlan: Omit<Plan, '_id'> = {
        ...plan,
        scheduledOn: new Date(plan.scheduledOn).toISOString(),
        attachments: plan.attachments?.filter((item) => item.trim()) ?? [],
        status: plan.status
      };

      try {
        const response = await axios.post<Plan>('/api/plans', normalizedPlan);
        this.plans = [...this.plans, response.data].sort(
          (a, b) => new Date(a.scheduledOn).getTime() - new Date(b.scheduledOn).getTime()
        );
      } catch (error) {
        console.error('Failed to create plan', error);
        this.plans = [...this.plans, normalizedPlan].sort(
          (a, b) => new Date(a.scheduledOn).getTime() - new Date(b.scheduledOn).getTime()
        );
      }
    },
    async fetchBucket() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || this.bucketLoading) {
        if (!authStore.isAuthenticated) {
          this.reset();
        }
        return;
      }

      this.bucketLoading = true;
      const fallback = createFallbackData();
      try {
        const response = await axios.get<BucketItem[]>('/api/bucket');
        this.bucket = response.data;
      } catch (error) {
        console.error('Failed to fetch bucket list', error);
        this.bucket = fallback.bucket;
      } finally {
        this.bucketLoading = false;
      }
    },
    async fetchMessages(page = 1, pageSize = this.messageMeta.pageSize, { append = false } = {}) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || this.messagesLoading) {
        if (!authStore.isAuthenticated) {
          this.reset();
        }
        return;
      }

      this.messagesLoading = true;
      const fallback = createFallbackData();
      try {
        const response = await axios.get<PaginatedResult<Message>>('/api/messages', {
          params: { page, pageSize }
        });
        if (append && page > 1) {
          const existingIds = new Set(this.messages.map((message) => message._id ?? message.createdAt));
          this.messages = [
            ...this.messages,
            ...response.data.items.filter((item) => !existingIds.has(item._id ?? item.createdAt))
          ];
        } else {
          this.messages = response.data.items;
        }
        this.messageMeta = {
          page: response.data.page,
          pageSize: response.data.pageSize,
          totalItems: response.data.totalItems,
          totalPages: response.data.totalPages
        };
      } catch (error) {
        console.error('Failed to fetch messages', error);
        const totalItems = fallback.messages.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const currentPage = Math.min(page, totalPages);
        const start = (currentPage - 1) * pageSize;
        const fallbackItems = fallback.messages.slice(start, start + pageSize);
        if (append && currentPage > 1) {
          this.messages = [...this.messages, ...fallbackItems];
        } else {
          this.messages = fallbackItems;
        }
        this.messageMeta = { page: currentPage, pageSize, totalItems, totalPages };
      } finally {
        this.messagesLoading = false;
      }
    },
    async addMessage(author: Message['author'], content: string) {
      try {
        const response = await axios.post<Message>('/api/messages', { author, content });
        this.messages.unshift(response.data);
      } catch (error) {
        const optimisticMessage: Message = {
          author,
          content,
          createdAt: new Date().toISOString()
        };
        this.messages.unshift(optimisticMessage);
      } finally {
        this.messageMeta.totalItems += 1;
        this.messageMeta.totalPages = Math.max(1, Math.ceil(this.messageMeta.totalItems / this.messageMeta.pageSize));
        if (this.messages.length > this.messageMeta.pageSize) {
          this.messages = this.messages.slice(0, this.messageMeta.pageSize);
        }
      }
    },
    reset() {
      this.relationshipSummary = null;
      this.milestones = [];
      this.milestoneMeta = { page: 1, pageSize: 5, totalItems: 0, totalPages: 1 };
      this.milestoneLoading = false;
      this.memories = [];
      this.plans = [];
      this.plansLoading = false;
      this.bucket = [];
      this.bucketLoading = false;
      this.messages = [];
      this.messageMeta = { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 };
      this.messagesLoading = false;
      this.memoriesLoading = false;
    }
  }
});
