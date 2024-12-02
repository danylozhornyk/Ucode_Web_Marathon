import { Op, Sequelize } from 'sequelize';
import { FavoritePost, PostStatus } from '../models/Post';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';

export const FavoritePostService = {

    async addToFavorites(userId: number, postId: number) {

        const post = await Post.findByPk(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const existingFavorite = await FavoritePost.findOne({ where: { userId, postId } });
        if (existingFavorite) {
            await FavoritePostService.removeFromFavorites(userId,postId);
            return;
        }

        await FavoritePost.create({ userId, postId });
    },


    async removeFromFavorites(userId: number, postId: number) {
        const favoritePost = await FavoritePost.findOne({ where: { userId, postId } });
        if (!favoritePost) {
            throw new Error('Post not found in favorites');
        }

        await favoritePost.destroy();
    },

    async getFavPostForUser(userId: number, postId: number) {
        const favoritePost = await FavoritePost.findOne({ where: { userId, postId } });
        return favoritePost;
    },

    async getFavorites(
        authorId: number,
        filters: {categoryIds?: number[];  startDate?: string; endDate?: string; status?: PostStatus },
        sortBy: 'rating' | 'publishDate' = 'rating',
        pagination: { page: number; pageSize: number },
        order: 'ASC' | 'DESC' = 'DESC'
    ): Promise<{ data: Post[]; total: number }> {
        try {
            const where: any = {};
            const include: any = [
                {
                    association: 'categories',
                    attributes: ['id', 'title', 'description'],
                    through: { attributes: [] }, 
                },
            ];
            if (filters.status) {
                where.status = filters.status;
            }

            if (filters.startDate && filters.endDate) {
                const adjustedEndDate = new Date(filters.endDate);
                adjustedEndDate.setHours(23, 59, 59, 999);
                where.publishDate = { [Op.between]: [new Date(filters.startDate), adjustedEndDate] };
            } else if (filters.startDate) {
                where.publishDate = { [Op.gte]: new Date(filters.startDate) };
            } else if (filters.endDate) {
                const adjustedEndDate = new Date(filters.endDate);
                adjustedEndDate.setHours(23, 59, 59, 999);
                where.publishDate = { [Op.lte]: adjustedEndDate };
            }

            if (filters.categoryIds && filters.categoryIds.length > 0) {
                include.push({
                    association: 'categories',
                    required: true,
                    where: { id: filters.categoryIds }, 
                });
            }

            const { page, pageSize } = pagination;
            const offset = (page - 1) * pageSize;
            const limit = pageSize;

            const userId = authorId;
            const favoritePosts = await FavoritePost.findAll({
                where: { userId },
                order: [['createdAt', 'DESC']]
            });

            const postIds = favoritePosts.map((favoritePost) => favoritePost.postId);
            where.id = postIds;
            const posts = await Post.findAll({
                where,
                include,
                order: [[sortBy, order]],
                offset,
                limit,
            });

            const commentCounts = await Comment.findAll({
                where: {
                    postId: posts.map((post) => post.id),
                },
                attributes: [
                    'postId',
                    [Sequelize.fn('COUNT', Sequelize.col('postId')), 'count'], 
                ],
                group: ['postId'],
                raw: true,
            });
    
            const commentCountMap = commentCounts.reduce((map: { [key: number]: number }, comment: any) => {
                map[comment.postId] = comment.count;
                return map;
            }, {});
    
            const data = posts.map((post) => {
                return {
                    ...post.toJSON(),
                    categories: post.categories.map((category) => ({
                        id: category.id,
                        title: category.title,
                        description: category.description,
                    })),
                    commentsCount: commentCountMap[post.id] || 0, 
                };
            });

            const total = data.length;
            return { data, total };
        } catch (error) {
            throw new Error(`No favorite posts found`);
        }
    },



    async getAllFavorites(userRole: string) {
        if (userRole !== "admin") {
            throw new Error('Forbidden: Admin access required');
        }
        const favoritePosts = await FavoritePost.findAll();

        return favoritePosts;
    }
}
