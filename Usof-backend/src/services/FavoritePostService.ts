import { FavoritePost } from '../models/Post'; 
import { Post } from '../models/Post';

export class FavoritePostService {
    
    static async addToFavorites(userId: number, postId: number) {

        const post = await Post.findByPk(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const existingFavorite = await FavoritePost.findOne({ where: { userId, postId } });
        if (existingFavorite) {
            throw new Error('Post already added to favorites');
        }

        await FavoritePost.create({ userId, postId });
    }


    static async removeFromFavorites(userId: number, postId: number) {
        const favoritePost = await FavoritePost.findOne({ where: { userId, postId } });
        if (!favoritePost) {
            throw new Error('Post not found in favorites');
        }

        await favoritePost.destroy();
    }

    static async getFavorites(userId: number) {
        try {
            const favoritePosts = await FavoritePost.findAll({
                where: { userId },
                order: [['createdAt', 'DESC']], 
            });
 
            if (!favoritePosts || favoritePosts.length === 0) {
                throw new Error('No favorite posts found');
            }
    
            return favoritePosts;
        } catch (error) {
            throw new Error(`No favorite posts found`);
        }
    }

    static async getAllFavorites(userRole: string) {
        if(userRole !== "admin"){
            throw new Error('Forbidden: Admin access required');
        }
        const favoritePosts = await FavoritePost.findAll();

        if (!favoritePosts || favoritePosts.length === 0) {
            throw new Error('No favorite posts found');
        }

        return favoritePosts; 
    }
}
