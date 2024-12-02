import axios from 'axios';
import { Post, PostStatus } from '../models/Post';
import { AuthService, handleError } from './index';
import { VITE_BACKEND_URL } from '../config';


interface PostFilters {
  categoryIds?: number[];
  startDate?: string;
  endDate?: string;
  status?: PostStatus;
}

interface Pagination {
  page: number;
  pageSize: number;
}

interface GetPostsResponse {
  data: Post[];
  total: number;
}

export class PostService {

  static async getAllActivePosts(){
    try{
      const response = await axios.get(`${VITE_BACKEND_URL}/posts/all`);
      return response.data;
    }catch(error){
      handleError(error);
      throw error;
    }
  }
  static async createPost(
    title: string,
    content: string,
    image?: File,
    categoryIds?: number[]
  ): Promise<Post> {
    try {
      const formData = new FormData();

      formData.append('title', title);
      formData.append('content', content);
      if (image) formData.append('image', image);  
      if (categoryIds) {
        categoryIds.forEach(id => formData.append('categoryIds[]', id.toString())); 
      }

      const response = await axios.post(`${VITE_BACKEND_URL}/posts/createPost`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
          Authorization: `Bearer ${AuthService.getToken()}`, 
        },
      });

      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async updatePost(
    postId: number,
    title: string,
    content?: string,
    image?: File,
    categoryIds?: number[],
    status?:string
  ): Promise<Post> {
    try {
      const formData = new FormData();

      formData.append('title', title);
      if (content) formData.append('content', content);
      if (image) formData.append('image', image);
      if (categoryIds) {
        categoryIds.forEach(id => formData.append('categoryIds[]', id.toString())); 
      }
      if (status) formData.append('status', status); 

      const response = await axios.put(`${VITE_BACKEND_URL}/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });

      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }


  static async deletePost(postId: number): Promise<void> {
    try {
      await axios.delete(`${VITE_BACKEND_URL}/posts//${postId}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async getPosts(
    filters: PostFilters = {},
    pagination: Pagination = { page: 1, pageSize: 10000 },
    order: 'ASC' | 'DESC' = 'DESC',
    sortBy: 'rating' | 'publishDate' = 'rating'
  ): Promise<GetPostsResponse> {
    try {
      const response = await axios.get(`${VITE_BACKEND_URL}/posts/`, {
        params: {
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize,
          order,
          sortBy,
        },
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async getPostsForUser(
    filters: PostFilters = {},
    pagination: Pagination = { page: 1, pageSize: 10000 },
    order: 'ASC' | 'DESC' = 'DESC',
    sortBy: 'rating' | 'publishDate' = 'rating'
  ): Promise<GetPostsResponse> {
    try {
      const response = await axios.get(`${VITE_BACKEND_URL}/posts/myPosts`, {
        params: {
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize,
          order,
          sortBy,
        },
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async getPostById(postId: number): Promise<Post | null> {
    try {
      const response = await axios.get(`${VITE_BACKEND_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; 
      }
      handleError(error);
      throw error;
    }
  }
  
}
