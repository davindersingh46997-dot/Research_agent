import axios from 'axios';
import { ChatApiRequest, ChatApiResponse, ApiResponse } from '@/types/index';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatApi = {
  sendMessage: async (payload: ChatApiRequest): Promise<ChatApiResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<ChatApiResponse>>(
        '/research/query',
        payload
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to send message');
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  },

  getSessions: async () => {
    try {
      const response = await apiClient.get('/research/sessions');
      return response.data.data || [];
    } catch (error) {
      console.error('Get Sessions Error:', error);
      throw error;
    }
  },

  createSession: async (title: string) => {
    try {
      const response = await apiClient.post('/research/sessions', { title });
      return response.data.data;
    } catch (error) {
      console.error('Create Session Error:', error);
      throw error;
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      await apiClient.delete(`/research/sessions/${sessionId}`);
    } catch (error) {
      console.error('Delete Session Error:', error);
      throw error;
    }
  },
};

export const voiceApi = {
  transcribe: async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      const response = await apiClient.post<ApiResponse<{ text: string }>>(
        '/research/transcribe',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.data?.text || '';
    } catch (error) {
      console.error('Transcribe Error:', error);
      throw error;
    }
  },

  synthesize: async (text: string): Promise<Blob> => {
    try {
      const response = await apiClient.post(
        '/research/synthesize',
        { text },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Synthesize Error:', error);
      throw error;
    }
  },
};
