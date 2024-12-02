import { Router, RequestHandler } from 'express';
import { AuthService } from '../services/AuthService';
import { authenticateToken } from '../middlewares/auth';
import { PasswordService } from '../services/PasswordService';
import { User } from '../models/User';
import { resetTokens } from '../services/PasswordService';
import { UserService } from '../services';

const router = Router();

function validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
}

const registerHandler: RequestHandler = async (req, res) => {
    try {
        const { login, password, email, fullName } = req.body;
        const response = await AuthService.register(login, password, email, fullName);
        res.status(201).json(response);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: (error as Error).message });
    }
};

const verifyEmailHandler: RequestHandler = async (req, res) => {
    try {
        const { verificationCode } = req.body;

        if (!verificationCode) {
            res.status(400).json({ error: 'Verification code is required' });
            return;
        }

        const user = await AuthService.verifyEmail(verificationCode);
        res.status(200).json({ message: 'Email verified successfully', user });
    } catch (error) {
        console.error('Email verification error:', error);
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

const resetPasswordHandler: RequestHandler = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            res.status(400).json({ error: 'New passwords do not match' });
            return;
        }

        const email = await PasswordService.verifyResetToken(token);
        if (!email) {
            res.status(400).json({ error: 'Invalid or expired reset token' });
            return;
        }

        if(!validatePassword(newPassword)){
            res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' });
            return;
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        await PasswordService.resetPassword(user, newPassword);

        resetTokens.delete(token);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(400).json({ error: (error as Error).message });
    }
};
const changePasswordHandler: RequestHandler = async (req, res) => {
    try {
        const {oldPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            res.status(400).json({ error: 'New passwords do not match' });
            return;
        }

        const id = req.user.userId;

        if(!validatePassword(newPassword)){
            res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' });
            return;
        }

        const user = await User.findOne({ where: { id } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        await PasswordService.changePassword(user,oldPassword, newPassword);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(400).json({ error: (error as Error).message });
    }
};


const initiatePasswordChangeHandler: RequestHandler = async (req, res) => {
    try {
        const user = await UserService.getUserById(req.user.userId);

        const resetToken = await PasswordService.generateResetToken(user.email);

        await PasswordService.sendPasswordResetEmail(user.email, resetToken);

        res.json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Password reset initiation error:', error);
        res.status(500).json({ error: 'Failed to initiate password reset' });
    }
};


router.post('/initiate-password-change', authenticateToken, initiatePasswordChangeHandler);
router.post('/reset-password', authenticateToken, resetPasswordHandler);
router.post('/change-password', authenticateToken, changePasswordHandler);
router.post('/verify-email', verifyEmailHandler);
router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/logout', authenticateToken, logoutHandler);

export default router;
