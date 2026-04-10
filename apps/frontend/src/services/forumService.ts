import { api } from './api';
import { ForumPost } from 'shared-types';

export class WorkerForumService {
  async fetchPosts(): Promise<ForumPost[]> {
    const response = await api.get('/forum/posts');
    return response.data;
  }

  async createPost(data: Partial<ForumPost>): Promise<ForumPost> {
    const response = await api.post('/forum/posts', data);
    return response.data;
  }
}

export const ForumService = new WorkerForumService();
