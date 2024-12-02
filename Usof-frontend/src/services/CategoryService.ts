import axios from 'axios';
import { Category } from '../models/Category';
import { AuthService, handleError } from './index';
import { VITE_BACKEND_URL } from '../config';

export class CategoryService {
  static async getAllCategories(): Promise<Category[]> {
    try {
      const response = await axios.get(`${VITE_BACKEND_URL}/categories/`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data.map((category: any) => new Category(
        category.id,
        category.title,
        category.description
      ));
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
  static async getCategoriesForPost(postId: number): Promise<Category[]> {
    try {
      const response = await axios.get(`${VITE_BACKEND_URL}/categories/${postId}`);
      return response.data.map((category: any) => new Category(
        category.id,
        category.title,
        category.description
      ));
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async getCategoriesWithActivePosts(): Promise<Category[]> {
    try {
      const response = await axios.get(`${VITE_BACKEND_URL}/categories/with-active-posts`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async createCategory(title: string, description: string): Promise<Category> {
    try {
      const response = await axios.post(`${VITE_BACKEND_URL}/categories/`, { title, description }, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      const category = response.data;
      return new Category(category.id, category.title, category.description);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async updateCategory(id: number, title: string, description: string): Promise<Category> {
    try {
      const response = await axios.put(`${VITE_BACKEND_URL}/categories/${id}`, { title, description }, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      const category = response.data;
      return new Category(category.id, category.title, category.description);
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async deleteCategory(id: number): Promise<void> {
    try {
      await axios.delete(`${VITE_BACKEND_URL}/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
};
