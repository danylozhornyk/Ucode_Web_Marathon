import { Router, RequestHandler } from 'express';
import { FavoritePostService } from '../services/FavoritePostService'; 
import { authenticateToken } from '../middlewares/auth';
import { PostStatus } from '../models';

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
        const userId = req.user.userId;  
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
            startDate: startDate as string,
            endDate: endDate as string,
            status: status as PostStatus.ACTIVE,
        };

        const sorting = sortBy === 'publishDate' ? 'publishDate' : 'rating';
        const pagination = {
            page: parseInt(page as string, 10),
            pageSize: parseInt(pageSize as string, 10),
        };

        const favoritePosts = await FavoritePostService.getFavorites(userId, filters, sorting, pagination, order as 'ASC' | 'DESC');;
        res.json(favoritePosts);
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: (error as Error).message  });
    }
};

const getFavForUser: RequestHandler = async (req, res) => {
    try{
        const userId = req.user.userId;
        const {postId} = req.query;
        const favPost = await FavoritePostService.getFavPostForUser(userId,Number(postId));
        res.json(favPost);
    }catch(error){
        console.error('Get favorites error:', error);
        res.status(500).json({ error: (error as Error).message  });
    }

}

router.get('/isFav', authenticateToken, getFavForUser)
router.post('/add', authenticateToken, addToFavoritesHandler);
router.delete('/:id', authenticateToken, removeFromFavoritesHandler);
router.get('/', authenticateToken, getFavoritesHandler);

export default router;
