import { Router, RequestHandler } from 'express';
import { CommentService } from '../services/CommentService';
import { authenticateToken, isAdmin } from '../middlewares/auth';

const router = Router();

const createCommentHandler: RequestHandler = async (req, res) => {
	try {
		const postId = parseInt(req.params.postId);
		const userId = req.user.userId;
		const { content } = req.body;

		const comment = await CommentService.createComment(postId, userId, content);
		res.status(201).json(comment);
	} catch (error) {
		console.error('Create comment error:', error);
		res.status(500).json({ error: (error as Error).message });
	}
};

const getPostCommentsHandler: RequestHandler = async (req, res) => {
	try {
		const postId = parseInt(req.params.postId);
		const comments = await CommentService.getPostComments(postId);
		res.json(comments);
	} catch (error) {
		console.error('Get post comments error:', error);
		res.status(500).json({ error: (error as Error).message });
	}
};

const deleteCommentHandler: RequestHandler = async (req, res) => {
	try {
		const commentId = parseInt(req.params.commentId);
		const userId = req.user.userId;
		const userRole = req.user.role;

		await CommentService.deleteComment(commentId, userId, userRole);
		res.status(204).send();
	} catch (error) {
		console.error('Delete comment error:', error);
		res.status(500).json({ error: (error as Error).message });
	}
};

const updateCommentHandler: RequestHandler = async (req, res) => {
	try {
		const commentId = parseInt(req.params.commentId);
		const userId = req.user.userId;
		const userRole = req.user.role;
		const { content } = req.body;

		const comment = await CommentService.updateComment(commentId, userId, userRole, content);
		res.json(comment);
	} catch (error) {
		console.error('Update comment error:', error);
		res.status(500).json({ error: (error as Error).message });
	}
};

const getAllCommentsHandler: RequestHandler = async (req, res) => {
	try {
		const userRole = req.user.role;
		const comments = await CommentService.getAllComments(userRole);
		res.json(comments);
	} catch (error) {
		console.error('Get all comments error:', error);
		res.status(500).json({ error: (error as Error).message });
	}
};

router.post('/:postId', authenticateToken, createCommentHandler);
router.get('/:postId', getPostCommentsHandler);
router.delete('/:commentId', authenticateToken, deleteCommentHandler);
router.put('/:commentId', authenticateToken, updateCommentHandler);
router.get('/', authenticateToken, isAdmin, getAllCommentsHandler);

export default router;
