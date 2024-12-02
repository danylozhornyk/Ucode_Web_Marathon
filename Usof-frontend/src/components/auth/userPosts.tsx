import React, { useEffect, useState } from 'react';
import { Post } from '../../models/Post';
import { PostService } from '../../services/PostService';
import { CommentService } from '../../services';
import { CategoryService } from '../../services/CategoryService';
import { Category } from '../../models/Category';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiImage, FiMessageCircle, FiStar } from 'react-icons/fi';
import { format } from 'date-fns';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import { User } from '../../models/User';

interface PostWithComments extends Post {
  commentsCount: number;
}

interface UserProps {
  currentUser: User | null;
}

export const UserPosts: React.FC<UserProps> = ({ currentUser }) => {
  const [posts, setPosts] = useState<PostWithComments[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'rating' | 'publishDate'>('rating');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const pageSize = 9;

  const navigate = useNavigate(); // Initialize the navigate hook

  const fetchPostsWithComments = async () => {
    setLoading(true);
    try {
      const responsePaginated = await PostService.getPostsForUser(
        {
          categoryIds: selectedCategories,
          startDate,
          endDate,
        },
        { page, pageSize },
        sortOrder,
        sortBy
      );
      const responseAll = await PostService.getPostsForUser(
        {
          categoryIds: selectedCategories,
          startDate,
          endDate,
        },
        { page: 1, pageSize: 10000000 },
        sortOrder,
        sortBy
      );
      const activePosts = responsePaginated.data.filter((post) => post);

      const postsWithComments = await Promise.all(
        activePosts.map(async (post) => {
          const comments = await CommentService.getPostComments(post.id);
          return {
            ...post,
            commentsCount: comments.length,
          };
        })
      );

      setPosts(postsWithComments);
      setTotalPosts(responseAll.total);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await CategoryService.getAllCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchPostsWithComments();
  }, [page, selectedCategories, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const totalPages = Math.ceil(totalPosts / pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return; 
    setPage(newPage);
  };

  const handleCategoryChange = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleStartDateChange = (date: string | undefined) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: string | undefined) => {
    setEndDate(date);
  };

  const handleSortByChange = (sortBy: 'rating' | 'publishDate') => {
    setSortBy(sortBy);
  };

  const handleSortOrderChange = (sortOrder: 'ASC' | 'DESC') => {
    setSortOrder(sortOrder);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MM/dd/yyyy'); 
  };

  if (!currentUser) {
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

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen">
      <div className="container mx-auto px-4 py-10 ">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-white inline-block mr-4">
          My posts
        </h1>
        <div className="w-full flex justify-between">
          <div className="mb-8 text-center">
            <Link
              to="/"
              className="mt-6 flex items-center text-gray-300 hover:text-gray-100 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5 mr-1" />
              Back to Home
            </Link>
          </div>

          {/* Button to Create Post */}
          <div className=" flex items-center mb-6">
            <button
              onClick={() => navigate('/createPost')}
              className="flex flex-row items-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-md px-6 py-2 transition-all duration-300"
            >
              <FaPlus className="w-5 h-5 mr-2" />
              Add New Post
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center text-lg text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Filter Section */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Categories */}
                <div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className={`flex items-center text-gray-400 bg-gray-700 rounded-md p-2 cursor-pointer hover:bg-gray-600 transition-colors`}
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

                {/* Date Filters */}
                <div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">Date Range</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <label htmlFor="start-date" className="text-gray-400 text-sm w-28">
                        Start Date:
                      </label>
                      <input
                        type="date"
                        id="start-date"
                        value={startDate || ''}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="p-2 rounded bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="end-date" className="text-gray-400 text-sm w-28">
                        End Date:
                      </label>
                      <input
                        type="date"
                        id="end-date"
                        value={endDate || ''}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="p-2 rounded bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h3 className="text-xl font-medium text-gray-300 mb-2">Sort</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <label htmlFor="sort-by" className="text-gray-400 text-sm w-28">
                        Sort By:
                      </label>
                      <select
                        id="sort-by"
                        value={sortBy}
                        onChange={(e) => handleSortByChange(e.target.value as 'rating' | 'publishDate')}
                        className="p-2 rounded bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full"
                      >
                        <option value="rating">Rating</option>
                        <option value="publishDate">Publish Date</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="sort-order" className="text-gray-400 text-sm w-28">
                        Order:
                      </label>
                      <select
                        id="sort-order"
                        value={sortOrder}
                        onChange={(e) => handleSortOrderChange(e.target.value as 'ASC' | 'DESC')}
                        className="p-2 rounded bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full"
                      >
                        <option value="ASC">Ascending</option>
                        <option value="DESC">Descending</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Posts List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link to={`/posts/${post.id}`} key={post.id} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition duration-300 flex flex-col h-full">
                  <div className="relative mb-4">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-500 rounded-lg flex items-center justify-center text-gray-300">
                        <FiImage size={24} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{post.title}</h3>
                  <p className="text-gray-400 mt-2 line-clamp-3">{post.content}</p> {/* Truncated content */}
                  <div className="flex-grow"></div>
                  <div className="hidden mt-4 lg:inline">
                    {post.categories.slice(0, 3).map((category, index) => (
                      <span key={index} className="bg-gray-600 text-white px-2 py-1 rounded-md mr-2">
                        {category.title}
                      </span>
                    ))}
                    {post.categories.length > 3 && (
                      <span className="bg-gray-600 text-white px-2 py-1 rounded-md">
                        +{post.categories.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="inline mt-4 lg:hidden">
                    {post.categories.slice(0, 2).map((category, index) => (
                      <span key={index} className="bg-gray-600 text-white px-2 py-1 rounded-md mr-2">
                        {category.title}
                      </span>
                    ))}
                    {post.categories.length > 2 && (
                      <span className="bg-gray-600 text-white px-2 py-1 rounded-md">
                        +{post.categories.length - 2} more
                      </span>
                    )}
                  </div> {/* Flex-grow to push the comments and rating to the bottom */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-blue-500">
                      <FiMessageCircle className="mr-2" />
                      <span>{post.commentsCount} <span className="hidden mg:inline lg:inline">Comments</span></span>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <FiStar className="mr-2" />
                      <span>{post.rating} <span className="hidden mg:inline lg:inline">Rating</span></span>
                    </div>
                    <div className="flex items-center text-white">
                      <FiCalendar className="mr-2" />
                      <span>{formatDate(post.publishDate)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>


            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-400">{(totalPages !== 0 ? page : 0)} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || totalPages === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
