import axios from 'axios';
import { Comment } from '../models/Comment';
import { VITE_BACKEND_URL } from '../config';
import { AuthService, handleError } from './index';  


export class CommentService{
static async getPostComments(postId: number): Promise<Comment[]>{
    try {
      const response = await axios.get(`${VITE_BACKEND_URL}/comments/${postId}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };
  
  static async getReplies(commentId: number): Promise<Comment[]>{
    try {
      const response = await axios.get(`${VITE_BACKEND_URL}/comments/${commentId}/replies`);
      return response.data.replies;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };
  
  static async createComment(postId: number, content: string): Promise<Comment>{
    try {
      const response = await axios.post(`${VITE_BACKEND_URL}/comments/${postId}`, { content }, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`, 
        },
      });
  
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };
  
  static async createReply(commentId: number, content: string): Promise<Comment>{
    try {
      const response = await axios.post(`${VITE_BACKEND_URL}/comments/${commentId}/replies`, { content }, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
        },
      });
  
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };
  
  static async updateComment(commentId: number, content: string): Promise<Comment>{
    try {
      const response = await axios.put(`${VITE_BACKEND_URL}/comments/${commentId}`, { content }, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
        },
      });
  
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };
  
  static async deleteComment(commentId: number): Promise<void>{
    try {
      await axios.delete(`${VITE_BACKEND_URL}/comments/${commentId}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
        },
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  };
  
  static async getAllComments(): Promise<Comment[]>{
    try {
      const response = await axios.get(`${VITE_BACKEND_URL}/comments/`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`,
        },
      });
      
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };
}

