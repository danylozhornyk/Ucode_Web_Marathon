import { Like, LikeType} from "../models/Like";
import { UserRole } from "../models/User";

export const LikeService = {
	async getLikes(postId: number, commentId: number) {
		if ((!postId && !commentId) || (postId && commentId)) {
			throw new Error('Please provide either postId or commentId query parameter');
		}

		const where = postId
			? { postId: postId }
			: { commentId: commentId };

		const likes = await Like.findAll({
			where,
			include: [
				{
					association: 'author',
					attributes: ['id', 'login', 'fullName', 'profilePicture'],
				},
			],
			order: [['publishDate', 'DESC']],
		});

		return likes;
	},

	async createLike(userId: number, postId: number | undefined, commentId: number | undefined, isLike: boolean) {
		if ((!postId && !commentId) || (postId && commentId)) {
			throw new Error('Please provide either postId or commentId');
		}

		if (typeof isLike !== 'boolean') {
			throw new Error('isLike must be a boolean value');
		}

		const existingLike = await Like.findOne({
			where: postId
				? { postId, authorId: userId }
				: { commentId, authorId: userId },
		});

		if (existingLike) {
			throw new Error('You have already liked/disliked this post/comment');
		}

		const like = await Like.create({
			authorId: userId,
			postId: postId || null,
			commentId: commentId || null,
			type:(isLike) ? LikeType.LIKE : LikeType.DISLIKE,
			publishDate: new Date(),
		});

		await like.reload({
			include: [
				{
					association: 'author',
					attributes: ['id', 'login', 'fullName', 'profilePicture'],
				},
			],
		});

		return like;
	},

	async deleteLike(likeId: number, userId: number, userRole: UserRole) {
		const like = await Like.findByPk(likeId);
		if (!like) {
			throw new Error('Like not found');
		}

		if (userRole !== 'admin' && like.authorId !== userId) {
			throw new Error('Unauthorized to delete this like');
		}

		await like.destroy();
	}
}

export default LikeService;
