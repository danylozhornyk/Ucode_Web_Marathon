import React, { useState } from 'react';
import { AuthService } from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { User } from '../../models/User';
import axios from 'axios';

interface LoginPageProps {
    setUser: (user: User | null) => void
};

export const LoginPage: React.FC<LoginPageProps> = ({ setUser }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigation = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            let auth;
            if (isRegistering) {
                AuthService.register(login, password, email, fullName);
                setIsRegistering(false);
                setIsVerifying(true);
                setSuccessMessage('Registration successful! Please check your email to verify it.');
            } else {
                auth = await AuthService.login(login, password);
                AuthService.setToken(auth.token);
                setUser(auth.user);
                navigation('/');
            }
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                && error.response?.data?.error;
            setError(errorMessage);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await AuthService.verifyEmail(verificationCode);
            setSuccessMessage('Email verified successfully! You can now log in.');
            setSuccessMessage(null);
            setIsVerifying(false);
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) && error.response?.data?.error;
            setError(errorMessage || 'Verification failed. Please try again.');
            setSuccessMessage(null);
        }
    };

    const toggleRegistration = () => {
        setSuccessMessage(null)
        setIsVerifying(false);
        setIsRegistering(!isRegistering);
        setLogin('');
        setPassword('');
        setEmail('');
        setFullName('');
        setError('');
    };

    async function handleView() {
        navigation('/');
    }

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen py-8 px-6 flex flex-col justify-top lg:justify-center">
            <div className="container mx-auto bg-gray-800 text-white p-8 rounded-lg shadow-2xl max-w-md">
                <h1 className="text-3xl font-extrabold text-center text-indigo-500 mb-6">
                    {isVerifying ? 'Verify Email' : isRegistering ? 'Register' : 'Login'}
                </h1>

                {error && (
                    <div className="bg-red-600 text-white p-4 rounded-md mb-4 text-center">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-600 text-white p-4 rounded-md mb-4 text-center">
                        <strong className="font-bold">Success: </strong>
                        <span className="block sm:inline">{successMessage}</span>
                    </div>
                )}

                {!isVerifying ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-lg font-semibold mb-2">Username:</label>
                            <input
                                type="text"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                placeholder="Enter your username"
                                className="bg-gray-700 text-white rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                maxLength={15}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-semibold mb-2">Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="bg-gray-700 text-white rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        {isRegistering && (
                            <>
                                <div>
                                    <label className="block text-lg font-semibold mb-2">Email:</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className="bg-gray-700 text-white rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-lg font-semibold mb-2">Full Name:</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="bg-gray-700 text-white rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        maxLength={50}
                                        required
                                    />
                                </div>
                            </>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                        >
                            {isRegistering ? 'Register' : 'Login'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-lg font-semibold mb-2">Verification Code:</label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter your verification code"
                                className="bg-gray-700 text-white rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                        >
                            Verify Email
                        </button>
                    </form>
                )}
                <div className="flex justify-between text-sm mt-4">
                    <div
                        className="text-indigo-500 hover:text-indigo-400 cursor-pointer"
                        onClick={toggleRegistration}
                    >
                        {isRegistering ? 'Switch to Login' : (!isVerifying ?'Switch to Register': 'Come back to Registration')}
                    </div>
                    <div
                        className="text-indigo-500 hover:text-indigo-400 cursor-pointer"
                        onClick={handleView}
                    >
                        View without account
                    </div>
                </div>
            </div>
        </div>

    );
};

