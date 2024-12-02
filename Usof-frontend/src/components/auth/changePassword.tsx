import React, { useState, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthService } from '../../services';
import { User } from '../../models/User';
import { FaArrowLeft} from 'react-icons/fa';

interface PasswordInputProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    label: string;
    name: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
    value,
    onChange,
    placeholder,
    label,
    name
}) => (
    <div>
        <label htmlFor={name} className="block text-lg font-semibold mb-2 text-gray-200">
            {label}
        </label>
        <input
            id={name}
            name={name}
            value={value}
            type="password"
            onChange={onChange}
            placeholder={placeholder}
            className="bg-gray-700 text-white rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
            required
        />
    </div>
);

interface UserProps {
    user: User | null;
}

export const ChangePasswordPage: React.FC<UserProps> = ({ user }) => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        if (formData.newPassword.length < 8) {
            setError('New password must be at least 8 characters long');
            return;
        }

        try {
            await AuthService.changePassword(formData.oldPassword, formData.newPassword, formData.confirmPassword);
            alert('Password changed successfully');
            await AuthService.logout();
            navigate('/login');
            window.location.reload();
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.error || 'Failed to change password'
                : 'Failed to change password';
            setError(errorMessage);
        }
    };

    const handlePasswordReset = async () => {
        alert('Check your email to reset the password. Ensure your email is valid and accessible.');
        await AuthService.initiateChangePassword();
    };

    if (!user) {
        return (
            <div className="bg-gray-900 text-gray-200 min-h-screen flex items-center justify-center">
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md text-center">
                    <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
                    <p className="text-gray-400 mb-6">You do not have permission to view this content.</p>
                    <button
                        className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                        onClick={() => (window.location.href = '/')}
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen py-8 px-6 flex flex-col justify-top lg:justify-center">
            <div className="container mx-auto bg-gray-800 text-white p-8 rounded-lg shadow-2xl max-w-md">
                <Link
                    to="/"
                    className="mb-6 flex items-center text-gray-300 hover:text-gray-100 transition-colors"
                >
                    <FaArrowLeft className="w-5 h-5 mr-1" />
                    Back to Home
                </Link>
                <h1 className="text-3xl font-extrabold text-center text-indigo-500 mb-6">Change Password</h1>

                {error && (
                    <div className="bg-red-600 text-white p-4 rounded-md mb-4 text-center">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <PasswordInput
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleInputChange}
                        placeholder="Enter old password"
                        label="Old Password"
                    />
                    <PasswordInput
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        label="New Password"
                    />
                    <PasswordInput
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                        label="Confirm New Password"
                    />
                    <button
                        type="submit"
                        className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                    >
                        Change Password
                    </button>
                    <div className="text-indigo-500 hover:text-indigo-400 cursor-pointer text-center mt-4" onClick={handlePasswordReset}>
                        Forgot Password?
                    </div>
                </form>
            </div>
        </div>
    );
};
