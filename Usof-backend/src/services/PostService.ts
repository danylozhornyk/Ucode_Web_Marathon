import { LikeType } from '../models/Like';
import { Post, PostStatus } from '../models/Post';
import { User, UserRole } from '../models/User';
import { Op, Sequelize } from 'sequelize';

export const PostService = {
	async createPost(userId: number,title: string,content: string,image?: string,categoryIds?: number[]): Promise<Post> {
		if (!title || !content) {
			throw new Error('Title and content are required');
		}

		const post = await Post.create({
			title,
			content,
			image,
			authorId: userId,
			publishDate: new Date(),
		});

		if (categoryIds && Array.isArray(categoryIds)) {
			await post.$set('categories', categoryIds);
			await post.reload({ include: ['categories'] });
		}

		return post;
	},

	async updatePost(postId: number,userId: number,content?: string,image?: string,categoryIds?: number[],status?:string): Promise<Post> {
		const post = await Post.findByPk(postId);
		if (!post) {
			throw new Error('Post not found');
		}

		const user = await User.findByPk(userId);
    	if (!user) {
        	throw new Error('User not found');
    	}

		if (status && user.role === UserRole.ADMIN) {
			if (status !== 'active' && status !== 'inactive') {
				throw new Error('Invalid status');
			}
			await post.update({
				status: status,
			});
		} else if (post.authorId !== userId) {
			throw new Error('You can only update your own posts or an admin can change the status');
		}
		

		await post.update({
			content: content || post.content,
			image: image !== undefined ? image : post.image,
		});

		if (categoryIds && Array.isArray(categoryIds)) {
			await post.$set('categories', categoryIds);
		}

		await post.reload({ include: ['categories'] });

		return post;
	},

	async deletePost(postId: number, userId: number, userRole: string): Promise<void> {
		const post = await Post.findByPk(postId);
		if (!post) {
			throw new Error('Post not found');
		}

		if (userRole !== 'admin' && post.authorId !== userId) {
			throw new Error('You can only delete your own posts');
		}

		await post.destroy();
	},

	async getPosts(
		filters: { categoryIds?: number[]; dateInterval?: { startDate: string; endDate: string }; status?: PostStatus },
		sortBy: 'rating' | 'publishDate' = 'rating',
		pagination: { page: number; pageSize: number },
		order: 'ASC' | 'DESC' = 'DESC'
	): Promise<{ data: Post[]; total: number }> {
		const where: any = { status: PostStatus.ACTIVE };
		const include: any = [
			{ association: 'author', attributes: ['id', 'login', 'fullName', 'profilePicture'] },
		];
	
		if (filters.status) {
			where.status = filters.status;
		}
	
		if (filters.dateInterval) {
			const { startDate, endDate } = filters.dateInterval;
			where.publishDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
		}
	
		if (filters.categoryIds && filters.categoryIds.length > 0) {
			include.push({
				association: 'categories',
				attributes: [],
				through: { attributes: [] },
				required: true,
			});
	
			where.id = {
				[Op.in]: Sequelize.literal(`(
					SELECT "postId"
					FROM "PostCategories"
					WHERE "categoryId" IN (${filters.categoryIds.join(',')})
					GROUP BY "postId"
					HAVING COUNT(DISTINCT "categoryId") = ${filters.categoryIds.length}
				)`),
			};
		}
	
		const { page, pageSize } = pagination;
		const offset = (page - 1) * pageSize;
		const limit = pageSize;
	
		const data = await Post.findAll({
			where,
			include,
			order: [[sortBy, order]],
			offset,
			limit,
		});
	

		const total = data.length;
	
		return { data, total };
	}
}	

export default PostService;
