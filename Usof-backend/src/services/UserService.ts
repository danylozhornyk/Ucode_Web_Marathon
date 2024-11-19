import { User, UserRole } from '../models/User';
import bcrypt from 'bcrypt';

export const UserService = {
    async getAllUsers(userRole:string): Promise<User[]> {
        if(userRole !== "admin"){
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

    async deleteUser(userId: string,userRole:string): Promise<void> {
        if(userRole !== "admin"){
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

    async addUser(userRole:string, fullName: string, email: string, login: string, password: string, role: string, profilePicture?: string): Promise<User> {
        if(userRole !== "admin"){
            throw new Error('Forbidden: Admin access required');
        }
        try {
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
        } catch (error) {
            console.error('Add user error:', error);
            throw new Error('Internal server error');
        }
    },

    async updateUser(userRole:string, userId: string, fullName?: string, email?: string, login?: string,  role?: string, profilePicture?: string): Promise<User> {
        if(userRole !== "admin"){
            throw new Error('Forbidden: Admin access required');
        }
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }
            if (login) {
                user.login = login;
            }
            if (fullName) {
                user.fullName = fullName;
            }
            if (email) {
                user.email = email;
            }
            if (UserRole.ADMIN === role || UserRole.USER === role) {
                user.role = role;
            }
            if (profilePicture) {
                user.profilePicture = profilePicture;
            }
            await user.save();
            return user;
        } catch (error) {
            console.error('Update user error:', error);
            throw new Error('Internal server error');
        }
    },
};
