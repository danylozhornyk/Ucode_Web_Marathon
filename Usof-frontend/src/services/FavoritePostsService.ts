import axios from 'axios';
import { AuthService, handleError } from './index';
import { VITE_BACKEND_URL } from '../config';
import { PostStatus, Post } from '../models/Post';


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

export class FavoritePostService {
  static async addToFavorites(postId: number): Promise<void> {
    try {
      await axios.post(
        `${VITE_BACKEND_URL}/favorites/add`,
        { postId },
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`, 
          },
        }
      );
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async removeFromFavorites(postId: number): Promise<void> {
    try {
      await axios.delete(`${VITE_BACKEND_URL}/favorites/${postId}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async getFavorites(
    filters: PostFilters = {},
    pagination: Pagination = { page: 1, pageSize: 10000 },
    order: 'ASC' | 'DESC' = 'DESC',
    sortBy: 'rating' | 'publishDate' = 'rating'
  ): Promise<GetPostsResponse> {
    try {
      const response = await axios.get(`${VITE_BACKEND_URL}/favorites/`, {
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

  static async isFavForUser(postId: number) {
    try {
      const response = await axios.get(`${VITE_BACKEND_URL}/favorites/isFav`,
        {
          params: { postId }, 
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );
      return (response.data) ? true : false
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
}
