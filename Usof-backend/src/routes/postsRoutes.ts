import { Router, RequestHandler } from 'express';
import { PostService } from '../services/PostService';
import { authenticateToken } from '../middlewares/auth';
import { PostStatus } from '../models/Post';
import multer from 'multer';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed'));
        }
    }
});

const createPostHandler: RequestHandler = async (req, res) => {
    try {
        const { title, content, categoryIds } = req.body;
        const userId = req.user.userId; 

        if (!req.file) {
            const post = await PostService.createPost(userId, title, content, undefined, categoryIds);
            res.status(201).json(post);
            return;
        }

        const base64Image = req.file.buffer.toString('base64');
        const imageHandled = `data:${req.file.mimetype};base64,${base64Image}`;

        const post = await PostService.createPost(userId, title, content, imageHandled, categoryIds);

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
        const { title, content, categoryIds, status } = req.body;

        let imageHandled = undefined;
        if (req.file) {
            const base64Image = req.file.buffer.toString('base64');
            imageHandled = `data:${req.file.mimetype};base64,${base64Image}`;
        }

        const post = await PostService.updatePost(
            postId,
            userId,
            title,
            content,
            imageHandled, 
            categoryIds,
            status
        );

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
        const { categoryIds, startDate, endDate, status, sortBy, page = '1', pageSize = '10000', order = 'DESC' } = req.query;

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
            startDate: startDate as string,
            endDate: endDate as string,
            status: status as PostStatus,
        };

        const sorting = sortBy === 'publishDate' ? 'publishDate' : 'rating';
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

const getPostsForUserHandler: RequestHandler = async (req, res) => {
    try {
        const { categoryIds, startDate, endDate, status, sortBy, page = '1', pageSize = '10000', order = 'DESC' } = req.query;
        const user = req.user.userId;

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
            startDate: startDate as string,
            endDate: endDate as string,
            status: status as PostStatus,
        };

        const sorting = sortBy === 'publishDate' ? 'publishDate' : 'rating';
        const pagination = {
            page: parseInt(page as string, 10),
            pageSize: parseInt(pageSize as string, 10),
        };

        const posts = await PostService.getPostsForUser(filters, sorting, pagination, order as 'ASC' | 'DESC', user);
        res.json(posts);
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

const getPostsByIdHandler: RequestHandler = async (req, res) => {
    try {
        const postId = parseInt(req.params.id, 10);
        if (isNaN(postId)) {
            res.status(400).json({ error: 'Invalid post ID' });
            return;
        }

        const post = await PostService.getPostById(postId);

        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        res.json(post);
    } catch (error) {
        console.error('Get post by ID error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

const getAllPostsHandler: RequestHandler = async(req,res)=>{
    try{
        const posts = await PostService.getAllActivePosts();
        res.json(posts);
    }catch(error){
        console.error('Get all posts error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
}

router.get('/myPosts', authenticateToken, getPostsForUserHandler)
router.get('/all', getAllPostsHandler);
router.get('/:id', getPostsByIdHandler);
router.post('/createPost', authenticateToken, upload.single('image'), createPostHandler);
router.put('/:id', authenticateToken, upload.single('image'), updatePostHandler);
router.delete('/:id', authenticateToken, deletePostHandler);
router.get('/', getPostsHandler);

export default router;
