import { api, IS_MOCK_MODE } from './http';
import { Feed } from '../types';

const mockFeeds: Feed[] = [
  {
    id: 'feed-1',
    userId: 'user-1',
    projectId: 'proj-1',
    feedUrl: 'https://www.vogue.com/rss',
    title: 'Vogue Fashion News',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'feed-2',
    userId: 'user-1',
    projectId: 'proj-2',
    feedUrl: 'https://techcrunch.com/feed/',
    title: 'TechCrunch',
    isActive: false,
    createdAt: '2024-01-12T15:30:00Z',
    updatedAt: '2024-01-18T09:15:00Z',
  },
];

export const feedsService = {
  async list(): Promise<Feed[]> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [...mockFeeds];
    }
    return api.get<Feed[]>('/feeds');
  },

  async create(data: { feedUrl: string; title?: string; projectId?: string }): Promise<Feed> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newFeed: Feed = {
        id: Date.now().toString(),
        userId: 'user-1',
        projectId: data.projectId || null,
        feedUrl: data.feedUrl,
        title: data.title || new URL(data.feedUrl).hostname,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockFeeds.push(newFeed);
      return newFeed;
    }
    return api.post<Feed>('/feeds', data);
  },

  async update(id: string, data: Partial<Feed>): Promise<Feed> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockFeeds.findIndex(f => f.id === id);
      if (index >= 0) {
        mockFeeds[index] = { ...mockFeeds[index], ...data, updatedAt: new Date().toISOString() };
        return mockFeeds[index];
      }
      throw new Error('Feed not found');
    }
    return api.patch<Feed>(`/feeds/${id}`, data);
  },

  async toggle(id: string, isActive: boolean): Promise<Feed> {
    return this.update(id, { isActive });
  },

  async delete(id: string): Promise<void> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockFeeds.findIndex(f => f.id === id);
      if (index >= 0) {
        mockFeeds.splice(index, 1);
      }
      return;
    }
    await api.del(`/feeds/${id}`);
  },
};