import api from '@/lib/api';
import { Configuration } from '@/components/Configurator';

export interface QuoteItem {
  id?: string;
  componentId?: string;
  category: string;
  name: string;
  spec: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  userId: string;
  status: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  totalPrice: number;
  configuration: Configuration;
  items: QuoteItem[];
  notes?: string;
  adminNotes?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    company?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuoteData {
  configuration: Configuration;
  items: Omit<QuoteItem, 'id'>[];
  totalPrice: number;
  notes?: string;
}

export interface QuotesResponse {
  quotes: Quote[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QuoteStatsResponse {
  totalQuotes: number;
  pendingQuotes: number;
  approvedQuotes: number;
  rejectedQuotes: number;
  totalRevenue: number;
}

export const quoteService = {
  async create(data: CreateQuoteData): Promise<Quote> {
    const response = await api.post<{ quote: Quote }>('/quotes', data);
    return response.data.quote;
  },

  async getAll(params?: { page?: number; limit?: number; status?: string }): Promise<QuotesResponse> {
    const response = await api.get<QuotesResponse>('/quotes', { params });
    return response.data;
  },

  async getById(id: string): Promise<Quote> {
    const response = await api.get<{ quote: Quote }>(`/quotes/${id}`);
    return response.data.quote;
  },

  async updateStatus(id: string, status: Quote['status'], adminNotes?: string): Promise<Quote> {
    const response = await api.put<{ quote: Quote }>(`/quotes/${id}/status`, {
      status,
      adminNotes,
    });
    return response.data.quote;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/quotes/${id}`);
  },

  async getStats(): Promise<QuoteStatsResponse> {
    const response = await api.get<QuoteStatsResponse>('/quotes/stats/summary');
    return response.data;
  },
};
