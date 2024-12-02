import { Post, PostStatus } from '../models/Post';
import { User, UserRole } from '../models/User';
import { Comment } from '../models';
import { Op, Sequelize } from 'sequelize';
import { CommentService } from './CommentService';

export const PostService = {

	async createPost(userId: number, title: string, content: string, image?: string, categoryIds?: number[], publishDateGiven?: Date): Promise<Post> {
		if (!title || !content) {
			throw new Error('Title and content are required');
		}

		const post = await Post.create({
			title,
			content,
			image,
			authorId: userId,
			publishDate: (publishDateGiven) ? publishDateGiven : new Date(),
		});

		if (categoryIds && Array.isArray(categoryIds)) {
			await post.$set('categories', categoryIds);
			await post.reload({ include: ['categories'] });
		}

		return post;
	},

	async updatePost(postId: number, userId: number, title: string, content?: string, image?: string, categoryIds?: number[], status?: string): Promise<Post> {
		const post = await Post.findByPk(postId);
		if (!post) {
			throw new Error('Post not found');
		}

		const user = await User.findByPk(userId);
		if (!user) {
			throw new Error('User not found');
		}

		if (status && (user.role === UserRole.ADMIN || user.id === post.authorId)) {
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
			title: title || post.title,
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

    async getAllActivePosts(){
		const include: any = [
			{
				association: 'author',
				attributes: ['id', 'login'],
			},
		]
		const posts = await Post.findAll({
			where: {status:PostStatus.ACTIVE},
			include,
		})
		return posts;
	},
	
	async getPosts(
		filters: { categoryIds?: number[]; startDate?: string; endDate?: string; status?: PostStatus },
		sortBy: 'rating' | 'publishDate' = 'rating',
		pagination: { page: number; pageSize: number },
		order: 'ASC' | 'DESC' = 'DESC'
	): Promise<{ data: Post[]; total: number }> {
		const where: any = { status: PostStatus.ACTIVE };
		const include: any = [
			{
				association: 'categories',
				attributes: ['id', 'title', 'description'],
				through: { attributes: [] }, 
			}
		];

		// Apply filters
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

		const posts = await Post.findAll({
			where,
			include,
			order: [[sortBy, order]],
			offset,
			limit,
			attributes: ['id', 'title', 'publishDate','content','rating','image'],
		});

		const total = await Post.count({
			where,
			include,
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

		return { data, total };
	},

	  

	async getPostsForUser(
		filters: { categoryIds?: number[]; startDate?: string; endDate?: string; status?: PostStatus },
		sortBy: 'rating' | 'publishDate' = 'rating',
		pagination: { page: number; pageSize: number },
		order: 'ASC' | 'DESC' = 'DESC',
		authorId:number
	): Promise<{ data: Post[]; total: number }> {
		const where: any = { authorId };
		const include: any = [
			{
				association: 'categories',
				attributes: ['id', 'title', 'description'],
				through: { attributes: [] }, 
			}
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

		const posts = await Post.findAll({
			where,
			include,
			order: [[sortBy, order]],
			offset,
			limit,
			attributes: ['id', 'title', 'publishDate','content','rating','image'],
		});

		const total = await Post.count({
			where,
			include,
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

		return { data, total };
	},

	async getPostById(postId: number): Promise<Post | null> {
		try {
			const post = await Post.findOne({
				where: { id: postId },
				include: [
					{
						association: 'author',
						attributes: ['id', 'login', 'fullName', 'profilePicture'],
					},
					{
						association: 'categories',
						attributes: ['id', 'title', 'description'],
						through: { attributes: [] },
					},
				],
			});

			if (post) {
				const postWithCategories = post.toJSON(); 
				postWithCategories.categories = post.categories.map((category: any) => ({
					id: category.id,
					title: category.title,
					description: category.description,
				}));

				return postWithCategories;
			} else {
				return null;
			}
		} catch (error) {
			console.error('Error fetching post by ID:', error);
			throw new Error('Error fetching post by ID');
		}
	}


}
