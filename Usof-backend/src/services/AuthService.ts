import bcrypt from 'bcrypt';
import { User, UserRole } from '../models/User';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { TokenBlacklist } from '../middlewares/auth';

function validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
}

function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export const AuthService = {
    async register(login: string, password: string, email: string, fullName: string) {
        if (!login || !password || !email || !fullName) {
            throw new Error('All fields are required');
        }

        if (!validateEmail(email)) {
            throw new Error('Invalid email format');
        }

        if (!validatePassword(password)) {
            throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
        }

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { login },
                    { email }
                ]
            }
        });

        if (existingUser) {
            throw new Error('User with this login or email already exists');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            login,
            password: hashedPassword,
            email,
            fullName,
            role: UserRole.USER
        });

        const { password: _, ...userWithoutPassword } = user.get({ plain: true });
        return userWithoutPassword;
    },

    async login(login: string, password: string) {
        if (!login || !password) {
            throw new Error('Login and password are required');
        }

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { login },
                    { email: login }
                ]
            }
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            {
                userId: user.id,
                login: user.login,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { password: _, ...userWithoutPassword } = user.get({ plain: true });
        return { user: userWithoutPassword, token };
    },

    async logout(token: string) {
        TokenBlacklist.add(token);
        return { message: 'Successfully logged out' };
    }
}
