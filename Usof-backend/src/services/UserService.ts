import { User, UserRole } from '../models/User';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { SMTP_USER, SMTP_PASS } from '../config';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

const emailVerificationStore = new Map();

export const UserService = {
    async getAllUsers(userRole: string): Promise<User[]> {
        if (userRole !== "admin") {
            throw new Error('Forbidden: Admin access required');
        }
        try {
            const users = await User.findAll();
            return users;
        } catch (error) {
            console.error('Get all users error:', error);
            throw new Error('Internal server error');
        }
    },

    async deleteUser(userId: string, userRole: string): Promise<void> {
        if (userRole !== "admin") {
            throw new Error('Forbidden: Admin access required');
        }
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }
            await user.destroy();
        } catch (error) {
            console.error('Delete user error:', error);
            throw new Error('Internal server error');
        }
    },

    async addUser(userRole: string, fullName: string, email: string, login: string, password: string, role: string, profilePicture?: string): Promise<User> {
        if (userRole !== "admin") {
            throw new Error('Forbidden: Admin access required');
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
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            login,
            password: hashedPassword,
            fullName,
            email,
            profilePicture,
            role,
        });
        return newUser;
    },

    async updateUser(userRole: string, userId: string, fullName?: string, email?: string, login?: string, role?: string): Promise<User> {
        if (userRole !== "admin") {
            throw new Error('Forbidden: Admin access required');
        }
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (login && login !== user.login) {
            const existingUser = await User.findOne({ where: { login } });
            if (existingUser && existingUser.id !== user.id) {
                throw new Error('Login already in use');
            }
            user.login = login;
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser && existingUser.id !== user.id) {
                throw new Error('Email already in use');
            }
            user.email = email;
        }
        if (fullName) {
            user.fullName = fullName;
        }
        if (UserRole.ADMIN === role || UserRole.USER === role) {
            user.role = role;
        }
        await user.save();
        return user;
    },

    async getUserById(userId: number): Promise<User> {
        try {
            const user = await User.findByPk(userId, {
                attributes: ['id', 'login', 'fullName', 'email', 'profilePicture', 'rating', 'role'],
            });
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            console.error('Get user by ID error:', error);
            throw new Error('Internal server error');
        }
    },

    async updateProfileUser(userId: number, fullName?: string, email?: string, login?: string): Promise<User> {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (login && login !== user.login) {
            const existingUser = await User.findOne({ where: { login } });
            if (existingUser && existingUser.id !== user.id) {
                throw new Error('Login already in use');
            }
            user.login = login;
        }
        
        if (fullName) {
            user.fullName = fullName;
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser && existingUser.id !== user.id) {
                throw new Error('Email already in use');
            }

            const verificationCode = Math.random().toString(36).substr(2, 8);

            emailVerificationStore.set(verificationCode, { userId, newLogin:login, newFullName: fullName, newEmail: email });

            await transporter.sendMail({
                from: `"USOF" <${SMTP_USER}>`,
                to: email,
                subject: 'Email Change Verification',
                text: `Your email change verification code is: ${verificationCode}`,
                html: `<p>Your email change verification code is:</p><h3>${verificationCode}</h3>`,
            });

            return { ...user.get(), message: 'Verification email sent. Please verify your new email to complete the change.' };
        }


        await user.save();
        return user;
    },

    async verifyEmailChange(verificationCode: string): Promise<User> {
        const pendingEmailChange = emailVerificationStore.get(verificationCode);

        if (!pendingEmailChange) {
            throw new Error('Invalid or expired verification code');
        }

        const { userId, newLogin, newFullName, newEmail } = pendingEmailChange;
        const user = await User.findByPk(userId);

        if (!user) {
            throw new Error('User not found');
        }

        if(newLogin){
            user.login =newLogin;
        }

        if(newFullName){
            user.fullName =newFullName;
        }
        user.email = newEmail;
        await user.save();

        emailVerificationStore.delete(verificationCode);

        return user;
    },

    async updateProfileUserImage(userId: number, image: string): Promise<User> {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        user.profilePicture = image;
        await user.save();
        return user;
    },

};
