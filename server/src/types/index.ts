export interface Relationship {
  coupleNames: string[];
  startedOn: Date;
  milestones: { label: string; date: Date }[];
}

export interface Memory {
  title: string;
  description: string;
  photoUrl: string;
  location: {
    lat: number;
    lng: number;
    placeName: string;
  };
  happenedOn: Date;
}

export interface Plan {
  title: string;
  description: string;
  scheduledOn: Date;
  attachments: string[];
  status: 'upcoming' | 'completed' | 'in-progress';
}

export interface BucketItem {
  order: number;
  title: string;
  completed: boolean;
}

export interface Message {
  author: 'me' | 'partner';
  content: string;
  createdAt: Date;
}
