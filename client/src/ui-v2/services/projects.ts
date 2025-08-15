import { api, IS_MOCK_MODE } from './http';
import { Project } from '../types';

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Q1 Fashion Trends',
    description: 'Analyzing emerging fashion trends for spring collection',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'proj-2',
    name: 'Gen Z Social Behavior',
    description: 'Understanding Gen Z engagement patterns across platforms',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
];

export const projectsService = {
  async list(): Promise<Project[]> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockProjects;
    }
    return api.get<Project[]>('/projects');
  },

  async create(data: { name: string; description?: string }): Promise<Project> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newProject: Project = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProjects.push(newProject);
      return newProject;
    }
    return api.post<Project>('/projects', data);
  },

  async update(id: string, data: Partial<Project>): Promise<Project> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockProjects.findIndex(p => p.id === id);
      if (index >= 0) {
        mockProjects[index] = { ...mockProjects[index], ...data, updatedAt: new Date().toISOString() };
        return mockProjects[index];
      }
      throw new Error('Project not found');
    }
    return api.patch<Project>(`/projects/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    if (IS_MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockProjects.findIndex(p => p.id === id);
      if (index >= 0) {
        mockProjects.splice(index, 1);
      }
      return;
    }
    await api.del(`/projects/${id}`);
  },
};