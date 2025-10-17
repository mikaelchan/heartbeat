import { defineStore } from 'pinia';
import axios from 'axios';
import type { Relationship, Memory, Plan, BucketItem, Message } from '@/types';
import { useAuthStore } from './auth';
import type { UserGender } from '@/types/auth';
import { getPartnerName } from '@/utils/user';

interface State {
  relationship: Relationship | null;
  memories: Memory[];
  plans: Plan[];
  bucket: BucketItem[];
  messages: Message[];
  loading: boolean;
}

const createFallbackRelationship = (username: string, gender: UserGender): Relationship => ({
  coupleNames: [username, getPartnerName(gender)],
  startedOn: '2021-06-19T00:00:00.000Z',
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
  return {
    relationship: createFallbackRelationship(username, gender),
    memories: createFallbackMemories(username, gender),
    plans: createFallbackPlans(username, gender),
    bucket: createFallbackBucket(username, gender),
    messages: createFallbackMessages(username, gender)
  };
};

export const useHeartbeatStore = defineStore('heartbeat', {
  state: (): State => ({
    relationship: null,
    memories: [],
    plans: [],
    bucket: [],
    messages: [],
    loading: false
  }),
  actions: {
    async fetchAll() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || this.loading) {
        if (!authStore.isAuthenticated) {
          this.reset();
        }
        return;
      }

      this.loading = true;
      const fallback = createFallbackData();
      try {
        const [relationshipRes, memoriesRes, plansRes, bucketRes, messagesRes] = await Promise.allSettled([
          axios.get<Relationship>('/api/relationship'),
          axios.get<Memory[]>('/api/memories'),
          axios.get<Plan[]>('/api/plans'),
          axios.get<BucketItem[]>('/api/bucket'),
          axios.get<Message[]>('/api/messages')
        ]);

        this.relationship =
          relationshipRes.status === 'fulfilled' ? relationshipRes.value.data : fallback.relationship;
        this.memories = memoriesRes.status === 'fulfilled' ? memoriesRes.value.data : fallback.memories;
        this.plans = plansRes.status === 'fulfilled' ? plansRes.value.data : fallback.plans;
        this.bucket = bucketRes.status === 'fulfilled' ? bucketRes.value.data : fallback.bucket;
        this.messages = messagesRes.status === 'fulfilled' ? messagesRes.value.data : fallback.messages;
      } finally {
        this.loading = false;
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
      }
    },
    reset() {
      this.relationship = null;
      this.memories = [];
      this.plans = [];
      this.bucket = [];
      this.messages = [];
    }
  }
});
