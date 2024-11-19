import { Router, RequestHandler } from 'express';
import { authenticateToken, isAdmin } from '../middlewares/auth';
import { UserService } from '../services/UserService';

const router = Router();

const getAllUsersHandler: RequestHandler = async (req, res) => {
    try {
        const userRole = req.user.role;
        const users = await UserService.getAllUsers(userRole);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

const deleteUserHandler: RequestHandler = async (req, res) => {
    const userId = req.params.id;
    const userRole = req.user.role;
    try {
        await UserService.deleteUser(userId,userRole);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: (error as Error).message });
    }
};

const addUserHandler: RequestHandler = async (req, res) => {
    const { login, password, role, profilePicture, fullName, email } = req.body;
    const userRole = req.user.role;
    try {
        const newUser = await UserService.addUser(userRole, fullName, email, login, password, role, profilePicture);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

const updateUserHandler: RequestHandler = async (req, res) => {
    const userId = req.params.id;
    const userRole = req.user.role;
    const { login, role, profilePicture, fullName, email } = req.body;
    try {
        const updatedUser = await UserService.updateUser(userRole,userId, fullName, email, login, role, profilePicture);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

router.get('/', authenticateToken, isAdmin, getAllUsersHandler);
router.delete('/:id', authenticateToken, isAdmin, deleteUserHandler);
router.post('/', authenticateToken, isAdmin, addUserHandler); 
router.put('/:id', authenticateToken, isAdmin, updateUserHandler);

export default router;
