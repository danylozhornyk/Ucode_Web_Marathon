import { Router, RequestHandler } from 'express';
import { FavoritePostService } from '../services/FavoritePostService'; 
import { authenticateToken } from '../middlewares/auth';

const router = Router();

const addToFavoritesHandler: RequestHandler = async (req, res) => {
    try {
        const { postId } = req.body; 
        const userId = req.user.userId;  

        await FavoritePostService.addToFavorites(userId, postId);
        res.status(201).json({ message: 'Post added to favorites' });
    } catch (error) {
        console.error('Add to favorites error:', error);
        res.status(500).json({ error: (error as Error).message  });
    }
};


const removeFromFavoritesHandler: RequestHandler = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.userId;

        await FavoritePostService.removeFromFavorites(userId, postId);
        res.status(204).send();  
    } catch (error) {
        console.error('Remove from favorites error:', error);
        res.status(500).json({ error: (error as Error).message  });
    }
};


const getFavoritesHandler: RequestHandler = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);  

        const favoritePosts = await FavoritePostService.getFavorites(userId);
        res.json(favoritePosts);
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: (error as Error).message  });
    }
};

const getAllFavoritesHandler: RequestHandler = async (req, res) => {
    try {
        const userRole = req.user.role;  
        const favoritePosts = await FavoritePostService.getAllFavorites(userRole);
        res.json(favoritePosts);
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: (error as Error).message  });
    }
};

// Routes
router.post('/add', authenticateToken, addToFavoritesHandler);
router.delete('/:id', authenticateToken, removeFromFavoritesHandler);
router.get('/:userId', authenticateToken, getFavoritesHandler);
router.get('/', authenticateToken, getAllFavoritesHandler);

export default router;
