import React, { useEffect, useState } from "react";
import { UserService } from "../../services/UserService";
import { User, UserRole } from "../../models/User";
import { FaPlus, FaTrash, FaEdit, FaArrowLeft } from "react-icons/fa";
import { Category } from "../../models/Category";
import { CategoryService } from "../../services";
import { Link } from "react-router-dom";
import axios from "axios";

interface UserProps {
    currentUser: User | null;
}

export const AdminPanel: React.FC<UserProps> = ({ currentUser }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Partial<Category> | null>(null);
    const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
    const [selectedUserModalWindow, setUserModal] = useState<boolean>(true);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await UserService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await CategoryService.getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = () => {
        setError(null);
        setSelectedCategory(null);
        setShowCategoryModal(true);
    };
    const handleEditCategory = (category: Category) => {
        setError(null);
        setSelectedCategory(category);
        setShowCategoryModal(true);
    };
    const handleDeleteCategory = async (categoryId: number) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await CategoryService.deleteCategory(categoryId);
                setCategories(categories.filter((category) => category.id !== categoryId));
            } catch (error) {
                console.error("Error deleting category:", error);
            }
        }
    };

    const handleSaveCategory = async (category: Partial<Category>) => {
        try {
            if (category.id) {
                const updatedCategory = await CategoryService.updateCategory(category.id, category.title!, category.description!);
                setCategories(categories.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)));
            } else {
                const newCategory = await CategoryService.createCategory(category.title!, category.description!);
                setCategories([...categories, newCategory]);
            }
            setShowCategoryModal(false);
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                && error.response?.data?.error;
            setError(errorMessage);
        }
    };


    const handleDelete = async (userId: number) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await UserService.deleteUser(userId);
                setUsers(users.filter((user) => user.id !== userId));
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
        if (userId == currentUser?.id) { window.location.reload(); }
    };

    const handleEdit = (user: User) => {
        setError(null);
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleAddUser = () => {
        setError(null);
        setSelectedUser(null);
        setShowModal(true);
    };

    const handleSave = async (user: Partial<User>) => {
        try {
            if (user.id) {
                const updatedUser = await UserService.updateUserById(user.id, {
                    email: user.email,
                    fullName: user.fullName,
                    login: user.login,
                    role: user.role
                });
                setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
            } else {
                const newUser = await UserService.addUser({
                    ...user,
                    role: user.role || UserRole.USER,
                    rating: 0,
                    password: user.password,
                });
                setUsers([...users, newUser]);
            }
            setShowModal(false);
            if (user.id == currentUser?.id) { window.location.reload(); }
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                && error.response?.data?.error;
            setError(errorMessage);
        }
    };

    if (!currentUser || currentUser?.role !== UserRole.ADMIN) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
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

    return (
        <div className="bg-gray-900 text-gray-200 py-10">
            <div className="container mx-auto min-h-screen px-4 sm:px-6 lg:px-8">

                <h1 className="text-4xl font-bold text-center sm:mb-0">Admin Panel</h1>

                {/* Buttons to show Users or Categories */}
                <div className="flex justify-center my-6 gap-4">
                    <button
                        onClick={() => setUserModal(true)} 
                        className={`px-4 py-2 bg-indigo-500 text-white rounded-md transition-all hover:bg-indigo-600 ${selectedUserModalWindow ? "bg-indigo-600" : ""}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setUserModal(false)} 
                        className={`px-4 py-2 bg-indigo-500 text-white rounded-md transition-all hover:bg-indigo-600 ${!selectedUserModalWindow ? "bg-indigo-600" : ""}`}
                    >
                        Categories
                    </button>
                </div>

                {/* Conditional rendering based on selectedUserModalWindow */}
                {selectedUserModalWindow ? (
                    <div>
                        <div className="w-full flex flex-col sm:flex-row justify-between items-center my-6">
                            <h1 className="text-4xl font-bold text-center sm:text-left mb-4 sm:mb-0">Users</h1>
                            <button
                                onClick={handleAddUser}
                                className="flex items-center bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition-all"
                            >
                                <FaPlus className="mr-2" />
                                Add User
                            </button>
                        </div>
                        {loading ? (
                            <div className="text-center text-gray-400">Loading users...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full bg-gray-800 text-left text-gray-300 rounded-lg shadow-md">
                                    <thead>
                                        <tr className="bg-gray-700">
                                            <th className="px-4 py-2">Login</th>
                                            <th className="px-4 py-2">Full Name</th>
                                            <th className="px-4 py-2">Email</th>
                                            <th className="px-4 py-2">Role</th>
                                            <th className="px-4 py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id} className="border-b border-gray-700">
                                                <td className="px-4 py-2">{user.login}</td>
                                                <td className="px-4 py-2">{user.fullName}</td>
                                                <td className="px-4 py-2">{user.email}</td>
                                                <td className="px-4 py-2">{user.role}</td>
                                                <td className="px-4 py-2 flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-3 rounded-md"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-3 rounded-md"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="w-full flex flex-col sm:flex-row justify-between items-center my-6">
                            <h1 className="text-4xl font-bold text-center sm:text-left mb-4 sm:mb-0">Categories</h1>
                            <button
                                onClick={handleAddCategory}
                                className="flex items-center bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition-all"
                            >
                                <FaPlus className="mr-2" />
                                Add Category
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full bg-gray-800 text-left text-gray-300 rounded-lg shadow-md">
                                <thead>
                                    <tr className="bg-gray-700">
                                        <th className="px-4 py-2">Title</th>
                                        <th className="px-4 py-2">Description</th>
                                        <th className="px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category.id} className="border-b border-gray-700">
                                            <td className="px-4 py-2">{category.title}</td>
                                            <td className="px-4 py-2">{category.description}</td>
                                            <td className="px-4 py-2 flex items-center gap-4">
                                                <button
                                                    onClick={() => handleEditCategory(category)}
                                                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-3 rounded-md"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-3 rounded-md"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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

                {showModal && (
                    <UserModal user={selectedUser} onSave={handleSave} onClose={() => setShowModal(false)} error={error} />
                )}

                {showCategoryModal && (
                    <CategoryModal category={selectedCategory} onSave={handleSaveCategory} onClose={() => setShowCategoryModal(false)} error={error} />
                )}
            </div>
        </div>
    );
};


interface CategoryModalProps {
    category: Partial<Category> | null;
    onSave: (category: Partial<Category>) => void;
    onClose: () => void;
    error:string | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onSave, onClose, error }) => {
    const [formData, setFormData] = useState<Partial<Category>>(category || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-5">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md sm:max-w-lg">
                <h2 className="text-xl font-bold text-white mb-4">
                    {category?.id ? "Edit Category" : "Add Category"}
                </h2>
                {error && (
                    <div className="bg-red-600 text-white p-4 rounded-md mb-4 text-center">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title || ""}
                            placeholder="Enter title"
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-gray-300"
                            maxLength={20}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Description</label>
                        <input
                            type="text"
                            name="description"
                            placeholder="Enter description"
                            value={formData.description || ""}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-gray-300"
                            required
                        />
                    </div>
                    <div className="flex justify-between items-center mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-md"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface UserModalProps {
    user: Partial<User> | null;
    onSave: (user: Partial<User>) => void;
    onClose: () => void;
    error:string | null;
}

const UserModal: React.FC<UserModalProps> = ({ user, onSave, onClose,error }) => {
    const [formData, setFormData] = useState<Partial<User>>(user || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center mt-40 mg:mt-0 lg:mt-0 px-5">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md sm:max-w-lg">
                <h2 className="text-xl font-bold text-white mb-4">
                    {user?.id ? "Edit User" : "Add User"}
                </h2>
                {error && (
                    <div className="bg-red-600 text-white p-4 rounded-md mb-4 text-center">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Login</label>
                        <input
                            type="text"
                            name="login"
                            value={formData.login || ""}
                            placeholder="Enter login"
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-gray-300"
                            maxLength={15}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName || ""}
                            placeholder="Enter full name"
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-gray-300"
                            maxLength={50}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ""}
                            placeholder="Enter email"
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-gray-300"
                            required
                        />
                    </div>
                    {!user?.id &&
                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password || ""}
                                placeholder="Enter password"
                                onChange={handleChange}
                                className="w-full p-2 rounded bg-gray-700 text-gray-300"
                                required
                            />
                        </div>
                    }
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Role</label>
                        <select
                            name="role"
                            value={formData.role || ""}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-700 text-gray-300"
                        >
                            <option value={UserRole.USER}>User</option>
                            <option value={UserRole.ADMIN}>Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-md"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
