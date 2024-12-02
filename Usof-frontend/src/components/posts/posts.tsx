import React, { useEffect, useState } from 'react';
import { Post, PostStatus } from '../../models/Post';
import { PostService } from '../../services/PostService';
import { CategoryService } from '../../services/CategoryService';
import { Category } from '../../models/Category';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiImage, FiMessageCircle, FiStar } from 'react-icons/fi';
import { format } from 'date-fns';
import { FaPlus } from 'react-icons/fa';
import { User } from '../../models/User';


interface UserProps {
  currentUser: User | null;
}
export const Posts: React.FC<UserProps> = ({ currentUser }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'rating' | 'publishDate'>('publishDate');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const pageSize = 9;

  const navigate = useNavigate(); 

  const fetchPostsWithComments = async () => {
    setLoading(true);
    try {
      const status = PostStatus.ACTIVE;
      const responsePaginated = await PostService.getPosts(
        {
          categoryIds: selectedCategories,
          startDate,
          endDate,
          status,
        },
        { page, pageSize },
        sortOrder,
        sortBy
      );
      const responseAll = await PostService.getPosts(
        {
          categoryIds: selectedCategories,
          startDate,
          endDate,
          status
        },
        { page: 1, pageSize: 10000000 },
        sortOrder,
        sortBy
      );
      const activePostsAllLength = responseAll.data.length;


      setPosts(responsePaginated.data);
      setTotalPosts(activePostsAllLength);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await CategoryService.getCategoriesWithActivePosts();
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
    setPage(1);
  };

  const handleStartDateChange = (date: string | undefined) => {
    setStartDate(date);
    setPage(1);
  };

  const handleEndDateChange = (date: string | undefined) => {
    setEndDate(date);
    setPage(1);
  };

  const handleSortByChange = (sortBy: 'rating' | 'publishDate') => {
    setSortBy(sortBy);
    setPage(1);
  };

  const handleSortOrderChange = (sortOrder: 'ASC' | 'DESC') => {
    setSortOrder(sortOrder);
    setPage(1);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MM/dd/yyyy'); 
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen -mt-5">
      <div className="container mx-auto px-4 py-10 mt-5">
        <div className="w-full flex justify-between">
          <h1 className="text-4xl font-extrabold text-center mb-8 text-white inline-block mr-4">
            Posts
          </h1>

          {/* Button to Create Post */}
          {currentUser ? (
            <div className=" flex items-center  mb-6">
              <button
                onClick={() => navigate('/createPost')}
                className="flex flex-row items-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-md px-6 py-2 transition-all duration-300"
              >
                <FaPlus className="w-5 h-5 mr-2" />
                Add New Post
              </button>
            </div>) : (<div className='hidden'></div>)}

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
                  </div>
                  <div className="inline mt-4 lg:hidden">
                    {post.categories.slice(0, 1).map((category, index) => (
                      <span key={index} className="bg-gray-600 text-white px-2 py-1 rounded-md mr-2">
                        {category.title}
                      </span>
                    ))}
                    {post.categories.length > 1 && (
                      <span className="bg-gray-600 text-white px-2 py-1 rounded-md">
                        +{post.categories.length - 1} more
                      </span>
                    )}
                  </div> 
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-blue-500">
                      <FiMessageCircle className="mr-2" />
                      <span>{post.commentsCount} <span className="hidden md:inline lg:inline">Comments</span></span>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <FiStar className="mr-2" />
                      <span>{post.rating} <span className="hidden md:inline lg:inline">Rating</span></span>
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
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md px-6 py-2 transition-all duration-300 disabled:bg-gray-600"
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
