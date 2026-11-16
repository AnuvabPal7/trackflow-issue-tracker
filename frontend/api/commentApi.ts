import { axiosClient } from './axiosClient';
import { Comment } from '../types';

export const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';

export const commentApi = {
  addComment: async (issueId: string, content: string, authorId: string): Promise<Comment> => {
    if (isMockMode) {
      return {
        id: `comm-${Date.now()}`,
        authorId,
        content,
        createdAt: new Date().toISOString(),
      };
    }

    const response = await axiosClient.post<Comment>(`/issues/${issueId}/comments`, { content });
    return response.data;
  },

  deleteComment: async (issueId: string, commentId: string): Promise<void> => {
    if (isMockMode) {
      return;
    }

    await axiosClient.delete(`/issues/${issueId}/comments/${commentId}`);
  },
};

