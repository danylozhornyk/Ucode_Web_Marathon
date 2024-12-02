import { Router, RequestHandler } from 'express';
import { authenticateToken, isAdmin } from '../middlewares/auth';
import { UserService } from '../services/UserService';
import multer from 'multer';

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
        await UserService.deleteUser(userId, userRole);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: (error as Error).message });
    }
};

const addUserHandler: RequestHandler = async (req, res) => {
    const { login, role, profilePicture, fullName, email } = req.body;
    let { password } = req.body
    const userRole = req.user.role;
    if(!password){
        password="Qwerty123"
    }
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
    const { login, role, fullName, email } = req.body;
    try {
        const updatedUser = await UserService.updateUser(userRole, userId, fullName, email, login, role);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(400).json({ error: (error as Error).message });
    }
};

const getUserByTokenHandler: RequestHandler = async (req, res) => {
    const userId = req.user?.userId;
    try {
        const user = await UserService.getUserById(userId);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ error: (error as Error).message });
    }
};
const getUserByIdHandler: RequestHandler = async (req, res) => {
    const userId = parseInt(req.params.id, 10); 
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Invalid user ID' }); 
            return;
        }
    try {
        const user = await UserService.getUserById(userId);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ error: (error as Error).message });
    }
};

const updateUserProfileHandler: RequestHandler = async (req, res) => {
    try {
        const { userId } = req.user;
        const { login, fullName, email } = req.body;
        const user = await UserService.updateProfileUser(userId,  fullName, email, login);
        res.json(user);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(400).json({ error: (error as Error).message });
    }
};

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


const updateProfileImageHandler: RequestHandler = async (req, res) => {
    const { userId } = req.user;
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No image file provided' });
            return;
        }

        const base64Image = req.file.buffer.toString('base64');
        const image = `data:${req.file.mimetype};base64,${base64Image}`;

        
        const result = await UserService.updateProfileUserImage(userId, image);

        res.status(200).json(result);
    } catch (error) {
        console.error('Update profile image error:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

const verifyEmailChangeHandler: RequestHandler = async (req, res) => {
    try {
        const { userId } = req.user
        const { code } = req.body;

        await UserService.verifyEmailChange(code);
        const user = await UserService.getUserById(userId);
        res.status(200).json(user);
    } catch (error) {
        console.error('Verify email change error:', error);
        res.status(400).json({ error: (error as Error).message });
    }
};

router.post('/info/image', authenticateToken, upload.single('image'), updateProfileImageHandler);
router.put('/update', authenticateToken, updateUserProfileHandler);
router.post('/update/email/verify', authenticateToken, verifyEmailChangeHandler);
router.get('/', authenticateToken, isAdmin, getAllUsersHandler);
router.get('/info', authenticateToken, getUserByTokenHandler);
router.get('/info/:id',getUserByIdHandler);
router.delete('/:id', authenticateToken, isAdmin, deleteUserHandler);
router.post('/', authenticateToken, isAdmin, addUserHandler);
router.put('/:id', authenticateToken, isAdmin, updateUserHandler);

export default router;
