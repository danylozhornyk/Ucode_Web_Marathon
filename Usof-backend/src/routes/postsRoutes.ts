import { Router, RequestHandler } from 'express';
import { PostService } from '../services/PostService';
import { authenticateToken } from '../middlewares/auth';
import { PostStatus } from '../models/Post';

const router = Router();

const createPostHandler: RequestHandler = async (req, res) => {
    try {
        const { title, content, image, categoryIds } = req.body;
        const userId = req.user.userId;

        const post = await PostService.createPost(userId, title, content, image, categoryIds);
        res.status(201).json(post);
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

const updatePostHandler: RequestHandler = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.userId;
        const { content, image, categoryIds,status } = req.body;

        const post = await PostService.updatePost(postId, userId, content, image, categoryIds,status);
        res.json(post);
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

const deletePostHandler: RequestHandler = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.userId;
        const userRole = req.user.role;

        await PostService.deletePost(postId, userId, userRole);
        res.status(204).send();
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

const getPostsHandler: RequestHandler = async (req, res) => {
    try {
        const { categoryIds, startDate, endDate, status, sortBy, page = '1', pageSize = '10', order = 'DESC' } = req.query;

        const parsedCategoryIds = (() => {
            if (!categoryIds) return undefined;
        
            if (Array.isArray(categoryIds)) {
                return categoryIds
                    .map((id) => parseInt(id as string, 10))
                    .filter((id) => !isNaN(id));
            }
        
            if (typeof categoryIds === 'string') {
                return categoryIds
                    .split(',')
                    .map((id) => parseInt(id, 10))
                    .filter((id) => !isNaN(id));
            }
        
            return undefined;
        })();

        const filters = {
            categoryIds: parsedCategoryIds,
            dateInterval: startDate && endDate ? { startDate: startDate as string, endDate: endDate as string } : undefined,
            status: status as PostStatus,
        };

        const sorting = sortBy === 'date' ? 'publishDate' : 'rating';
        const pagination = {
            page: parseInt(page as string, 10),
            pageSize: parseInt(pageSize as string, 10),
        };

        const posts = await PostService.getPosts(filters, sorting, pagination, order as 'ASC' | 'DESC');
        res.json(posts);
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};


router.post('/createPost', authenticateToken, createPostHandler);
router.put('/:id', authenticateToken, updatePostHandler);
router.delete('/:id', authenticateToken, deletePostHandler);
router.get('/', getPostsHandler);

export default router;
