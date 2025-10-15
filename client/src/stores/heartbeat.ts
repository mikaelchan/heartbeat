import { defineStore } from 'pinia';
import axios from 'axios';
import type { Relationship, Memory, Plan, BucketItem, Message } from '@/types';

interface State {
  relationship: Relationship | null;
  memories: Memory[];
  plans: Plan[];
  bucket: BucketItem[];
  messages: Message[];
  loading: boolean;
}

const FALLBACK_RELATIONSHIP: Relationship = {
  coupleNames: ['我', '她'],
  startedOn: '2020-02-14T00:00:00.000Z',
  milestones: [
    { label: '第一次牵手', date: '2020-03-01T00:00:00.000Z' },
    { label: '第一次旅行', date: '2021-05-03T00:00:00.000Z' },
    { label: '相伴同居', date: '2022-08-20T00:00:00.000Z' }
  ]
};

const FALLBACK_MEMORIES: Memory[] = [
  {
    title: '日落海边',
    description: '第一次一起看海的日落，约定以后每年都要来看一次。',
    photoUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
    location: { lat: 22.5431, lng: 114.0579, placeName: '深圳·大梅沙' },
    happenedOn: '2021-10-02T10:00:00.000Z'
  },
  {
    title: '雪中的拥抱',
    description: '第一次北国旅行，被雪花包围的瞬间感受到了彼此的温度。',
    photoUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80',
    location: { lat: 41.8057, lng: 123.4315, placeName: '沈阳·棋盘山' },
    happenedOn: '2022-01-15T08:00:00.000Z'
  }
];

const FALLBACK_PLANS: Plan[] = [
  {
    title: '一起去看极光',
    description: '2024 年冬天，我们要去最北的地方，记录极光下的吻。',
    scheduledOn: '2024-12-15T18:00:00.000Z',
    attachments: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=200&q=80'],
    status: 'upcoming'
  },
  {
    title: '拍一组情侣写真',
    description: '记录这一年的成长，把故事做成一本相册。',
    scheduledOn: '2024-05-20T09:00:00.000Z',
    attachments: [],
    status: 'in-progress'
  }
];

const FALLBACK_BUCKET: BucketItem[] = Array.from({ length: 12 }, (_, index) => ({
  order: index + 1,
  title: `一起完成第 ${index + 1} 件小事`,
  completed: index < 3
}));

const FALLBACK_MESSAGES: Message[] = [
  {
    author: 'me',
    content: '今天又偷偷地看你笑了好久，想把这份心动永远记下来。',
    createdAt: new Date().toISOString()
  },
  {
    author: 'partner',
    content: '谢谢你总是把我捧在手心，未来我们一起去更多的地方吧！',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
  }
];

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
      if (this.loading) return;
      this.loading = true;
      try {
        const [relationshipRes, memoriesRes, plansRes, bucketRes, messagesRes] = await Promise.allSettled([
          axios.get<Relationship>('/api/relationship'),
          axios.get<Memory[]>('/api/memories'),
          axios.get<Plan[]>('/api/plans'),
          axios.get<BucketItem[]>('/api/bucket'),
          axios.get<Message[]>('/api/messages')
        ]);

        this.relationship = relationshipRes.status === 'fulfilled' ? relationshipRes.value.data : FALLBACK_RELATIONSHIP;
        this.memories = memoriesRes.status === 'fulfilled' ? memoriesRes.value.data : FALLBACK_MEMORIES;
        this.plans = plansRes.status === 'fulfilled' ? plansRes.value.data : FALLBACK_PLANS;
        this.bucket = bucketRes.status === 'fulfilled' ? bucketRes.value.data : FALLBACK_BUCKET;
        this.messages = messagesRes.status === 'fulfilled' ? messagesRes.value.data : FALLBACK_MESSAGES;
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
    }
  }
});
