export interface Relationship {
  coupleNames: string[];
  startedOn: string;
  milestones: { label: string; date: string; imageUrl?: string }[];
}

export interface RelationshipSummary {
  coupleNames: string[];
  startedOn: string;
  milestoneCount: number;
}

export interface Milestone {
  label: string;
  date: string;
  imageUrl?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface Memory {
  _id?: string;
  title: string;
  description: string;
  photoUrl?: string;
  location: {
    lat: number;
    lng: number;
    placeName: string;
  };
  happenedOn: string;
}

export interface Plan {
  _id?: string;
  title: string;
  description: string;
  scheduledOn?: string;
  completedOn?: string;
  attachments?: string[];
  status: 'upcoming' | 'completed' | 'in-progress';
}

export interface BucketItem {
  _id?: string;
  order: number;
  title: string;
  completed: boolean;
  completedOn?: string;
  photoUrl?: string;
}

export interface Message {
  _id?: string;
  author: 'me' | 'partner';
  content: string;
  createdAt: string;
}
