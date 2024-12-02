import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../models/User';
import { UserService } from '../../services/index';
import { FaEdit, FaSave, FaUserCircle } from 'react-icons/fa';
import { MdCancel, MdEdit } from 'react-icons/md';
import { FiLock, FiStar } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6';
import axios from 'axios';

interface ProfileProps {
    user: User | null;
    setUser: (user: User | null) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, setUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [updatedUser, setUpdatedUser] = useState<User | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isAvatarHovered, setIsAvatarHovered] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const navigate = useNavigate(); // Initialize useNavigate


    useEffect(() => {
        if (user) {
            setUpdatedUser({ ...user });
        }
    }, [user]);

    useEffect(() => {
        if (imageFile) {
            try {
                handleImageSave();
            } catch (error) {
                const errorMessage = axios.isAxiosError(error)
                    ? error.response?.data?.error || 'Failed to change password'
                    : 'Failed to change password';
                setError(errorMessage);
            }
        }
    }, [imageFile]);

    const handleEdit = () => {
        setError(null);
        setEditMode(true);
    };

    const handleSave = async () => {
        setError(null);
        try {
            if (updatedUser) {
                updatedUser.profilePicture=undefined;
                if (updatedUser.email !== user?.email) {
                    try {
                        const shouldVerify = window.confirm(
                            "You have changed your email. Please verify it before saving the changes."
                        );
                        if (shouldVerify) {
                            setEditMode(true);
    
                            await handleVerifyEmail();

                           
                            await UserService.updateUser(updatedUser);
                        } else {
                            alert("Please verify your email to save the changes.");
                        }
                    } catch (error) {
                        const errorMessage = axios.isAxiosError(error)
                            ? error.response?.data?.error || 'Failed to change profile'
                            : 'Failed to change profile';
                        setModalError(errorMessage);
                    }
    
                } else {
                    const updatedUserData = await UserService.updateUser(updatedUser);
                    setUser(updatedUserData);
                    setEditMode(false); 
                }
            }
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.error || 'Failed to change profile'
                : 'Failed to change profile';
            setError(errorMessage);
        }
    };
    

    const handleVerifyEmail = async () => {
        setModalError(null)
        setIsModalOpen(true);
    };

    const handleSubmitVerificationCode = async (code: string) => {
        try {
            const updatedUserData = await UserService.verifyUserEmail(code);
            setUser(updatedUserData);
            setUpdatedUser(updatedUserData);
            setVerificationCode("");
            setEditMode(false);
            setIsModalOpen(false);
            alert("Email verified successfully!");

        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.error || 'Failed to verify email'
                : 'Failed to verify email';
            setModalError(errorMessage);
        }
    };



    const handleCancel = () => {
        setError(null);
        setEditMode(false);
        setUpdatedUser(user);
        setImageFile(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleImageSave = async () => {
        if (imageFile) {
            try {
                const updatedUser = await UserService.updateProfileImage(imageFile);
                setUser(updatedUser);
                setUpdatedUser(updatedUser);
                setEditMode(false);
            } catch (error) {
                const errorMessage = axios.isAxiosError(error)
                    ? error.response?.data?.error || 'Failed to change image'
                    : 'Failed to change image';
                setError(errorMessage);
            }
        }
    };

    const handlePasswordChange = async () => {
        navigate('/change-password');
    };

    const handleAvatarHover = () => {
        setIsAvatarHovered(!isAvatarHovered);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white ">
                <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mb-20 mt-20">
                    <div className="flex flex-col items-center">
                        <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
                        <p className="text-gray-400 mb-6 text-center">You do not have permission to view this content.</p>
                        <button
                            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md px-6 py-2 transition-all duration-300 flex flex-row items-center"
                            onClick={() => (window.location.href = '/')}
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const VerificationModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (code: string) => void }) => {
        const inputRef = useRef<HTMLInputElement | null>(null);

        useEffect(() => {
            if (isOpen && inputRef.current) {
                inputRef.current.focus();
            }
        }, [isOpen]);
    
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
                setVerificationCode(value);
        };
    
        if (!isOpen) return null;
    
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-gray-800 p-6 rounded-lg w-96">
                    <h2 className="text-2xl font-bold text-white mb-4">Enter Verification Code</h2>
                    {modalError && (
                        <div className="bg-red-600 text-white p-4 rounded-md mb-4 text-center">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{modalError}</span>
                        </div>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Enter code"
                        className="w-full p-2 mb-4 bg-gray-700 text-white rounded-md"
                        onChange={handleInputChange}
                        value={verificationCode}
                    />
                    <div className="flex justify-between">
                        <button
                            onClick={onClose}
                            className="bg-gray-500 text-white px-6 py-2 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSubmit(verificationCode)}
                            className="bg-indigo-500 text-white px-6 py-2 rounded-md"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        );
    };



    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen py-8 px-6 flex flex-col justify-top lg:justify-center">
            <div className="container mx-auto bg-gray-800 text-white p-8 rounded-lg shadow-2xl max-w-4xl">
                <h1 className="text-3xl font-extrabold text-center text-indigo-500 mb-6">Profile</h1>

                {/* Profile Picture Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                    <div className="flex items-center space-x-4 w-full sm:w-2/3">
                        <label htmlFor="profilePicture" className="relative cursor-pointer group">
                            <input type="file" id="profilePicture" className='hidden' onChange={handleImageUpload} />
                            <div
                                className={`relative transition-opacity duration-300'}`}
                                onMouseEnter={handleAvatarHover}
                                onMouseLeave={handleAvatarHover}
                            >
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt="User Avatar"
                                        className={`w-32 h-32 rounded-full object-cover border-4 border-indigo-600 shadow-lg transform transition-all duration-300 hover:scale-105 ${isAvatarHovered ? 'opacity-50' : 'opacity-100'}`}
                                    />
                                ) : (
                                    <FaUserCircle className={`w-32 h-32 ${isAvatarHovered ? 'opacity-50' : 'opacity-100'}`} />
                                )}
                                <MdEdit
                                    className={`absolute inset-0 m-auto h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-all`}
                                />
                            </div>
                        </label>
                        <div className="text-center sm:text-left">
                            <h2 className="text-xl font-semibold">{user.fullName}</h2>
                            <p className="text-gray-400">@{user.login} - {user.role}</p>
                            <div className="mt-2 flex justify-center sm:justify-start items-center text-yellow-500">
                                <FiStar className="mr-2" />
                                <span>{user.rating} Rating</span>
                            </div>
                        </div>
                    </div>
                    {error && (
                        <div className="hidden mg:inline lg:inline bg-red-600 text-white p-4 rounded-md mb-4 text-center">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                </div>

                {/* Profile Details */}
                <div className="space-y-6">
                    {error && (
                        <div className="mg:hidden lg:hidden bg-red-600 text-white p-4 rounded-md mb-4 text-center">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {editMode && updatedUser ? (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:space-x-6">
                                <div className="flex-1 mb-6">
                                    <label htmlFor="login" className="block text-lg font-semibold mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        id="login"
                                        value={updatedUser.login}
                                        onChange={(e) => setUpdatedUser({ ...updatedUser, login: e.target.value })}
                                        className="bg-gray-700 text-white rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        maxLength={15}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="email" className="block text-lg font-semibold mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={updatedUser.email}
                                        onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
                                        className="bg-gray-700 text-white rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:space-x-6">
                                <div className="flex-1">
                                    <label htmlFor="fullName" className="block text-lg font-semibold mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        value={updatedUser.fullName}
                                        onChange={(e) => setUpdatedUser({ ...updatedUser, fullName: e.target.value })}
                                        className="bg-gray-700 text-white rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        maxLength={40}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <button
                                    onClick={handleCancel}
                                    className="bg-gray-500 hover:bg-gray-600 text-white rounded-md px-6 py-2 transition-all duration-300 flex flex-row items-center"
                                >
                                    <MdCancel className="mr-2 w-5 h-5" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md px-6 py-2 transition-all duration-300 flex flex-row items-center"
                                >
                                    <FaSave className="mr-2" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="login" className="block text-lg font-semibold mb-2">
                                    Username
                                </label>
                                <p className="text-gray-400">{user.login}</p>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-lg font-semibold mb-2">
                                    Email
                                </label>
                                <p className="text-gray-400">{user.email}</p>
                            </div>
                            <div>
                                <label htmlFor="fullName" className="block text-lg font-semibold mb-2">
                                    Full Name
                                </label>
                                <p className="text-gray-400">{user.fullName}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit button at the bottom */}
                {!editMode && (
                    <div className="flex flex-row justify-between items-center">
                        <div className="mt-8 ">
                            <button
                                onClick={handlePasswordChange}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md px-6 py-2 transition-all duration-300 flex flex-row items-center w-full justify-center"
                            >
                                <FiLock className="mr-2" />
                                Change Password
                            </button>
                        </div>
                        <div className="mt-8 ">
                            <button
                                onClick={handleEdit}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md px-6 py-2 transition-all duration-300 flex flex-row items-center w-full justify-center"
                            >
                                <FaEdit className="mr-2" />
                                Edit
                            </button>
                        </div>
                    </div>

                )}
                <div className="mt-8 text-center">
                    <Link
                        to="/"
                        className="mt-6 flex items-center text-gray-300 hover:text-gray-100 transition-colors"
                    >
                        <FaArrowLeft className="w-5 h-5 mr-1" />
                        Back to Home
                    </Link>
                </div>
            </div>
            <VerificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitVerificationCode}
            />
        </div>
    );

};

