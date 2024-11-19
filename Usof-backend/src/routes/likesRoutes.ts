import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { LikeService } from '../services/LikeService';

const router = Router();

const getLikesHandler: RequestHandler = async (req, res) => {
	try {
		const { postId, commentId } = req.query;
		const likes = await LikeService.getLikes(Number(postId), Number(commentId));
		res.json(likes);
	} catch (error) {
		console.error('Get likes error:', error);
		res.status(500).json({ error: (error as Error).message });
	}
};

const createLikeHandler: RequestHandler = async (req, res) => {
	try {
		const userId = req.user.userId;
		const { postId, commentId, isLike } = req.body;
		const like = await LikeService.createLike(userId, postId, commentId, isLike);
		res.status(201).json(like);
	} catch (error) {
		console.error('Create like error:', error);
		res.status(500).json({ error: (error as Error).message });
	}
};

const deleteLikeHandler: RequestHandler = async (req, res) => {
	try {
		const likeId = parseInt(req.params.likeId);
		const userId = req.user.userId;
		const userRole = req.user.role;

		await LikeService.deleteLike(likeId, userId, userRole);
		res.status(204).send();
	} catch (error) {
		console.error('Delete like error:', error);
		res.status(500).json({ error: (error as Error).message });
	}
};

router.get('/', getLikesHandler);
router.post('/', authenticateToken, createLikeHandler);
router.delete('/:likeId', authenticateToken, deleteLikeHandler);

export default router;
