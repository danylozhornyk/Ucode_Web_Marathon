import { Router, RequestHandler } from 'express';
import { AuthService } from '../services/AuthService';
import { authenticateToken } from '../middlewares/auth';
import { PasswordService } from '../services/PasswordService';
import { User } from '../models/User';
import bcrypt from 'bcrypt';

const router = Router();

const registerHandler: RequestHandler = async (req, res) => {
    try {
        const { login, password, email, fullName } = req.body;
        const user = await AuthService.register(login, password, email, fullName);
        res.status(201).json(user);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: (error as Error).message });
    }
};

const loginHandler: RequestHandler = async (req, res) => {
    try {
        const { login, password } = req.body;
        const { user, token } = await AuthService.login(login, password);
        res.json({ user, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: (error as Error).message });
    }
};

const logoutHandler: RequestHandler = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            await AuthService.logout(token);
            res.json({ message: 'Successfully logged out' });
        } else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const changePasswordHandler: RequestHandler = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        } 
        const token = authHeader.split(' ')[1];
        const { userId } = req.user;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid current password');
        }

        await PasswordService.changePassword(userId, newPassword, token);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(400).json({ error: (error as Error).message });
    }
};

router.post('/change-password', authenticateToken, changePasswordHandler);
router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/logout', authenticateToken, logoutHandler);

export default router;
