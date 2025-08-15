import { api, IS_MOCK_MODE } from './http';
import { Brief, BriefDetail, Job } from '../types';

const mockBriefs: Brief[] = [
  {
    id: 'brief-1',
    projectId: 'proj-1',
    title: 'Sustainable Fashion Strategy Brief',
    status: 'draft',
    tags: ['sustainability', 'fashion', 'strategy'],
    slideCount: 5,
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-20T11:30:00Z',
  },
];

const mockBriefDetail: BriefDetail = {
  ...mockBriefs[0],
  slides: [
    {
      id: 'slide-1',
      title: 'Executive Summary',
      blocks: [
        {
          id: 'block-1',
          type: 'text',
          x: 100,
          y: 100,
          w: 600,
          h: 80,
          text: 'Sustainable Fashion: The New Consumer Imperative',
          align: 'center',
          fontSize: 32,
          weight: 600,
        },
      ],
      captureRefs: ['cap-1'],
    },
  ],
};

export interface BriefsListParams {
  projectId?: string;
  q?: string;
  tags?: string[];
}

export const briefsService = {
  async list(params: BriefsListParams): Promise<Brief[]> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filtered = [...mockBriefs];
      if (params.projectId) {
        filtered = filtered.filter(b => b.projectId === params.projectId);
      }
      if (params.q) {
        const query = params.q.toLowerCase();
        filtered = filtered.filter(b => b.title.toLowerCase().includes(query));
      }
      if (params.tags?.length) {
        filtered = filtered.filter(b => 
          params.tags!.some(tag => b.tags.includes(tag))
        );
      }
      return filtered;
    }

    const searchParams = new URLSearchParams();
    if (params.projectId) searchParams.set('projectId', params.projectId);
    if (params.q) searchParams.set('q', params.q);
    if (params.tags?.length) searchParams.set('tags', params.tags.join(','));

    return api.get<Brief[]>(`/briefs?${searchParams}`);
  },

  async create(data: { projectId: string; title: string; tags?: string[] }): Promise<Brief> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newBrief: Brief = {
        id: Date.now().toString(),
        projectId: data.projectId,
        title: data.title,
        status: 'draft',
        tags: data.tags || [],
        slideCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockBriefs.push(newBrief);
      return newBrief;
    }
    return api.post<Brief>('/briefs', data);
  },

  async get(id: string): Promise<BriefDetail> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      if (id === mockBriefDetail.id) {
        return mockBriefDetail;
      }
      throw new Error('Brief not found');
    }
    return api.get<BriefDetail>(`/briefs/${id}`);
  },

  async update(id: string, data: Partial<Brief>): Promise<Brief> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockBriefs.findIndex(b => b.id === id);
      if (index >= 0) {
        mockBriefs[index] = { ...mockBriefs[index], ...data, updatedAt: new Date().toISOString() };
        return mockBriefs[index];
      }
      throw new Error('Brief not found');
    }
    return api.patch<Brief>(`/briefs/${id}`, data);
  },

  async save(id: string, briefDetail: BriefDetail): Promise<BriefDetail> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return briefDetail;
    }
    return api.post<BriefDetail>(`/briefs/${id}/save`, briefDetail);
  },

  async export(id: string): Promise<{ jobId: string }> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { jobId: 'mock-job-123' };
    }
    return api.post<{ jobId: string }>(`/briefs/${id}/export`);
  },

  async delete(id: string): Promise<void> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockBriefs.findIndex(b => b.id === id);
      if (index >= 0) {
        mockBriefs.splice(index, 1);
      }
      return;
    }
    await api.del(`/briefs/${id}`);
  },
};

export const jobsService = {
  async get(id: string): Promise<Job> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        id,
        status: 'completed',
        result: { url: 'https://docs.google.com/presentation/d/mock-export-url' }
      };
    }
    return api.get<Job>(`/jobs/${id}`);
  },
};