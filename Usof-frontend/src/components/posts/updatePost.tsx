import React, { useState, useEffect } from 'react';
import { PostService } from '../../services/PostService';
import { CategoryService } from '../../services/CategoryService';
import { Category } from '../../models/Category';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { User } from '../../models/User';

interface UserProps {
    user: User | null;
}

export const EditPost: React.FC<UserProps> = ({ user }) => {
    const { postId } = useParams<{ postId: string }>(); 
    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [image, setImage] = useState<File | undefined>(undefined);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await CategoryService.getAllCategories();
                setCategories(categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Error fetching categories');
            }
        };

        const fetchPost = async () => {
            if (postId) {
                try {
                    const post = await PostService.getPostById(Number(postId));
                    if (post) {
                        setTitle(post.title);
                        setContent(post.content);
                        setSelectedCategories(post.categories.map((category) => category.id))
                        setStatus(post.status);
                    } else {
                        setError('Post not found');
                    }
                } catch (error) {
                    console.error('Error fetching post:', error);
                    setError('Error fetching post');
                }
            }
        };

        fetchCategories();
        fetchPost();
    }, [postId]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    const handleCategoryChange = (categoryId: number) => {
        setSelectedCategories((prevSelected) =>
            prevSelected.includes(categoryId)
                ? prevSelected.filter((id) => id !== categoryId)
                : [...prevSelected, categoryId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content || selectedCategories.length === 0) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (postId) {
                await PostService.updatePost(Number(postId), title, content, image, selectedCategories, status);
                navigate(`/posts/${postId}`);
            }
        } catch (err) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.error || 'Failed to upload an image choose right extension'
                : 'Failed to upload an image choose right extension';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
        }
    };

    const handleGoBack = () => {
        navigate(`/posts/${postId}`);
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
        <div className="w-full min-h-screen bg-gray-900 text-gray-200 flex justify-center items-center">
            <div className="container mx-auto px-4 py-6 bg-gray-800 rounded-lg shadow-lg space-y-6 w-full max-w-4xl">
                <h1 className="text-4xl font-extrabold text-center mb-8">Edit Post</h1>
                {error && (
                    <div className="bg-red-600 text-white p-4 rounded-md mb-4 text-center">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
                    <div className="space-y-4">
                        <label htmlFor="title" className="block text-xl text-gray-300">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={handleTitleChange}
                            className="w-full p-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            maxLength={30}
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <label htmlFor="content" className="block text-xl text-gray-300">Content</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={handleContentChange}
                            className="w-full p-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={6}
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <label htmlFor="categories" className="block text-xl text-gray-300">Categories</label>
                        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-4">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className={`flex items-center text-gray-400 bg-gray-700 rounded-md p-2 cursor-pointer hover:bg-gray-600 transition-colors
          ${category.title.length > 20 ? 'col-span-2' : ''}`}
                                    onClick={() => handleCategoryChange(category.id)}
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full mr-2 ${selectedCategories.includes(category.id)
                                            ? 'bg-blue-500'
                                            : 'bg-gray-500'
                                            }`}
                                    ></div>
                                    <label htmlFor={`category-${category.id}`} className="text-sm">
                                        {category.title}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label htmlFor="image" className="block text-xl text-gray-300">Image</label>
                        <input
                            type="file"
                            id="image"
                            onChange={uploadImage}
                            className="w-full p-3 bg-gray-600 text-gray-200 rounded-lg"
                        />
                    </div>
                    <div className="space-y-4">
                        <label htmlFor="status" className="block text-xl text-gray-300">Status</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full p-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex justify-between space-x-4">
                        <button
                            type="button"
                            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                            onClick={handleGoBack}
                        >
                            Go Back
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                            disabled={loading}
                        >
                            {loading ? 'Updating Post...' : 'Update Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
