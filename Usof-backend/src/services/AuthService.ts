import bcrypt from 'bcrypt';
import { User, UserRole } from '../models/User';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { JWT_SECRET, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from '../config';
import { TokenBlacklist } from '../middlewares/auth';

function validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
}

function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

const verificationStore: Map<string, { login: string; password: string; email: string; fullName: string }> = new Map();

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

        if (login) {
            const existingUser = await User.findOne({ where: { login } });
            if (existingUser) {
                throw new Error('Login already in use');
            }
        }

        if (email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                throw new Error('Email already in use');
            }
        }

        const verificationCode = Math.random().toString(36).substr(2, 8); 

        verificationStore.set(verificationCode, { login, password, email, fullName });

        await transporter.sendMail({
            from: `"USOF" <${SMTP_USER}>`,
            to: email,
            subject: 'Email Verification',
            text: `Your verification code is: ${verificationCode}`,
            html: `<p>Your verification code is:</p><h3>${verificationCode}</h3>`,
        });

        return { message: 'Verification email sent. Please verify your email to complete registration.' };
    },

    async verifyEmail(verificationCode: string) {
        const pendingUser = verificationStore.get(verificationCode);

        if (!pendingUser) {
            throw new Error('Invalid or expired verification code');
        }

        const { login, password, email, fullName } = pendingUser;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            login,
            password: hashedPassword,
            email,
            fullName,
            role: UserRole.USER,
        });

        verificationStore.delete(verificationCode);

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
