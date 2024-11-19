import { Router } from 'express';
import authRoutes from './authRoutes';
import postRoutes from './postsRoutes';
import likesRoutes from './likesRoutes';
import categoriesRoutes from './categoriesRoutes';
import userRoutes from './usersRoutes'
import commentRoutes from './commentsRoutes'
import favoriteRoutes from './favoritePostsRoutes'

const router = Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/likes', likesRoutes);
router.use('/categories', categoriesRoutes);
router.use('/users', userRoutes);
router.use('/comments', commentRoutes);
router.use('/favorites', favoriteRoutes);

export default router;
