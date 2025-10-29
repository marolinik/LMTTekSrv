import api from '@/lib/api';
import { Component, ComponentCategory } from '@/types/components';

export interface ComponentResponse {
  components: Component[];
}

export const componentService = {
  async getAll(): Promise<Component[]> {
    const response = await api.get<ComponentResponse>('/components');
    return response.data.components;
  },

  async getByCategory(category: ComponentCategory): Promise<Component[]> {
    const response = await api.get<ComponentResponse>(`/components/category/${category}`);
    return response.data.components;
  },

  async create(data: Omit<Component, 'id'>): Promise<Component> {
    const response = await api.post<{ component: Component }>('/components', data);
    return response.data.component;
  },

  async update(id: string, data: Partial<Component>): Promise<Component> {
    const response = await api.put<{ component: Component }>(`/components/${id}`, data);
    return response.data.component;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/components/${id}`);
  },
};
