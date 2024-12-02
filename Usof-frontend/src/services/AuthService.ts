import axios from 'axios';
import { User } from '../models/User';
import { VITE_BACKEND_URL } from '../config';
import { handleError } from './index';

export class AuthService {

    static async register(
        login: string,
        password: string,
        email: string,
        fullName: string
    ): Promise<User> {
        try {
            const response = await axios.post(`${VITE_BACKEND_URL}/auth/register`, {
                login,
                password,
                email,
                fullName,
            });
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    static async verifyEmail(
        verificationCode: string
    ): Promise<User> {
        try {
            const response = await axios.post(`${VITE_BACKEND_URL}/auth/verify-email`, {
                verificationCode
            });
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    static async login(login: string, password: string): Promise<{
        user: User;
        token: string;
    }> {
        try {
            const response = await axios.post(`${VITE_BACKEND_URL}/auth/login`, {
                login,
                password,
            });
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    static async logout(): Promise<{ message: string }> {
        try {
            const response = await axios.post(`${VITE_BACKEND_URL}/auth/logout`, null, {
                headers: {
                    Authorization: `Bearer ${this.getToken()}`,
                },
            });
            this.clearToken();
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    static async resetPassword(
        token:string,
        newPassword: string,
        confirmPassword: string
    ): Promise<{ message: string }> {
        try {
            const response = await axios.post(`${VITE_BACKEND_URL}/auth/reset-password`, {
                token,
                newPassword,
                confirmPassword
            }, {
                headers: {
                    Authorization: `Bearer ${AuthService.getToken()}`,
                },
            });
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    static async changePassword(
        oldPassword:string,
        newPassword: string,
        confirmPassword: string
    ): Promise<{ message: string }> {
        try {
            const response = await axios.post(
                `${VITE_BACKEND_URL}/auth/change-password`,
                {
                    oldPassword,
                    newPassword,
                    confirmPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.getToken()}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    static async initiateChangePassword(){
        try {
            await axios.post(`${VITE_BACKEND_URL}/auth/initiate-password-change`,{},{
                headers: {
                    Authorization: `Bearer ${this.getToken()}`,
                },
            })
        }catch (error) {
            handleError(error);
            throw error;
        }
    }

    static getToken(): string | null {
        return localStorage.getItem('token');
    }

    static setToken(token: string): void {
        localStorage.setItem('token', token);
    }

    static clearToken(): void {
        localStorage.removeItem('token');
    }

}
