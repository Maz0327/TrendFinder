export type ID = string;

export interface User {
  id: ID;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface Project {
  id: ID;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Capture {
  id: ID;
  projectId: ID;
  userId: ID;
  title: string;
  content: string;
  platform?: string | null;
  url?: string | null;
  tags: string[];
  status: 'new' | 'keep' | 'trash';
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Moment {
  id: ID;
  title: string;
  description: string;
  intensity: number;
  tags: string[];
  platforms: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Brief {
  id: ID;
  projectId: ID;
  title: string;
  status: 'draft' | 'in_review' | 'final';
  tags: string[];
  slideCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface BriefDetail extends Brief {
  slides: Slide[];
}

export interface Slide {
  id: ID;
  title?: string | null;
  blocks: Block[];
  captureRefs?: ID[];
}

export interface Block {
  id: ID;
  type: 'text' | 'image' | 'note';
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
  text?: string;
  src?: string;
  alt?: string | null;
  align?: 'left' | 'center' | 'right';
  fontSize?: number;
  weight?: number;
  sourceCaptureId?: ID | null;
}

export interface Feed {
  id: ID;
  userId: ID;
  projectId?: ID | null;
  feedUrl: string;
  title?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: ID;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}