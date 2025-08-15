import { api, IS_MOCK_MODE } from './http';
import { Capture } from '../types';

const mockCaptures: Capture[] = [
  {
    id: 'cap-1',
    projectId: 'proj-1',
    userId: 'user-1',
    title: 'Sustainable Fashion Movement on TikTok',
    content: 'Young creators showcasing thrift finds and upcycling techniques',
    platform: 'tiktok',
    url: 'https://tiktok.com/@sustainablestyle/video/123',
    tags: ['sustainability', 'fashion', 'genz', 'thrifting'],
    status: 'new',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'cap-2',
    projectId: 'proj-1',
    userId: 'user-1',
    title: 'AI-Generated Fashion Design Tools',
    content: 'New tools enabling rapid prototyping of fashion items',
    platform: 'twitter',
    url: 'https://twitter.com/fashiontech/status/456',
    tags: ['ai', 'fashion', 'design', 'tools'],
    status: 'keep',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    createdAt: '2024-01-19T14:20:00Z',
    updatedAt: '2024-01-19T14:20:00Z',
  },
];

export interface CapturesListParams {
  projectId?: string;
  status?: 'new' | 'keep' | 'trash';
  q?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  platform?: string;
}

export interface CapturesListResponse {
  items: Capture[];
  total: number;
  page: number;
  limit: number;
}

export const capturesService = {
  async list(params: CapturesListParams): Promise<CapturesListResponse> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filtered = [...mockCaptures];
      
      if (params.projectId) {
        filtered = filtered.filter(c => c.projectId === params.projectId);
      }
      if (params.status) {
        filtered = filtered.filter(c => c.status === params.status);
      }
      if (params.q) {
        const query = params.q.toLowerCase();
        filtered = filtered.filter(c => 
          c.title.toLowerCase().includes(query) ||
          c.content.toLowerCase().includes(query)
        );
      }
      if (params.tags?.length) {
        filtered = filtered.filter(c => 
          params.tags!.some(tag => c.tags.includes(tag))
        );
      }
      if (params.platform) {
        filtered = filtered.filter(c => c.platform === params.platform);
      }
      
      return {
        items: filtered,
        total: filtered.length,
        page: params.page || 1,
        limit: params.limit || 20,
      };
    }

    const searchParams = new URLSearchParams();
    if (params.projectId) searchParams.set('projectId', params.projectId);
    if (params.status) searchParams.set('status', params.status);
    if (params.q) searchParams.set('q', params.q);
    if (params.tags?.length) searchParams.set('tags', params.tags.join(','));
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.platform) searchParams.set('platform', params.platform);

    return api.get<CapturesListResponse>(`/captures?${searchParams}`);
  },

  async get(id: string): Promise<Capture> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const capture = mockCaptures.find(c => c.id === id);
      if (!capture) throw new Error('Capture not found');
      return capture;
    }
    return api.get<Capture>(`/captures/${id}`);
  },

  async update(id: string, data: Partial<Capture>): Promise<Capture> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockCaptures.findIndex(c => c.id === id);
      if (index >= 0) {
        mockCaptures[index] = { ...mockCaptures[index], ...data, updatedAt: new Date().toISOString() };
        return mockCaptures[index];
      }
      throw new Error('Capture not found');
    }
    return api.patch<Capture>(`/captures/${id}`, data);
  },

  async updateStatus(id: string, status: Capture['status']): Promise<Capture> {
    return this.update(id, { status });
  },
};