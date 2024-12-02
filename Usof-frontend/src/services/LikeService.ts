
import axios from 'axios';
import { Like} from '../models/Like';
import { VITE_BACKEND_URL } from '../config';
import { AuthService, handleError } from './index';

export class LikeService {
    static async getLikes(postId?: number, commentId?: number): Promise<Like[]>{
        try {
          const response = await axios.get(`${VITE_BACKEND_URL}/likes/`, {
            params: {
              postId,
              commentId,
            },
          });
          return response.data;
        } catch (error) {
          handleError(error);
            throw error;
        }
      };
      
      static async createLike(
        isLike: boolean,
        postId?: number,
        commentId?: number
      ): Promise<Like>{
        try {
          const response = await axios.post(`${VITE_BACKEND_URL}/likes/`, {
            postId,
            commentId,
            isLike,
          }, {
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
      
      static async deleteLike(likeId: number): Promise<void>{
        try {
          await axios.delete(`${VITE_BACKEND_URL}/likes/${likeId}`, {
            headers: {
              'Authorization': `Bearer ${AuthService.getToken()}`,
            },
          });
        } catch (error) {
          handleError(error);
            throw error;
        }
      }
};
