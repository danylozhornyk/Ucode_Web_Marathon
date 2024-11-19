import { Router, RequestHandler } from 'express';
import { CategoryService } from '../services/CategoryService';
import { authenticateToken, isAdmin } from '../middlewares/auth';

const router = Router();

const createCategoryHandler: RequestHandler = async (req, res) => {
    try {
        const { title, description } = req.body;
        const category = await CategoryService.createCategory(title, description);
        res.status(201).json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(400).json({ error: (error as Error).message });
    }
};

const updateCategoryHandler: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const category = await CategoryService.updateCategory(Number(id), title, description);
        res.status(200).json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(400).json({ error: (error as Error).message });
    }
};

const deleteCategoryHandler: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        await CategoryService.deleteCategory(Number(id));
        res.status(204).send();
    } catch (error) {
        console.error('Create category error:', error);
        res.status(400).json({ error: (error as Error).message });
    }
};

const getAllCategoriesHandler: RequestHandler = async (req, res) => {
    try {
        const categories = await CategoryService.getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

router.post('/', authenticateToken, isAdmin, createCategoryHandler);
router.put('/:id', authenticateToken, isAdmin, updateCategoryHandler);
router.delete('/:id', authenticateToken, isAdmin, deleteCategoryHandler);
router.get('/', authenticateToken, isAdmin, getAllCategoriesHandler);

export default router;
