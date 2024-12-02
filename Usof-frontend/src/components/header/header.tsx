import { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaHome, FaHeart, FaListAlt, FaUserShield } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AuthService, PostService } from "../../services";
import { User, UserRole } from "../../models/User";
import { Post } from "../../models/Post";

interface HeaderProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>();
  const navigation = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null); // To track the menu element

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  const handleFocus = () => {
    setIsFilterOpen(true); // Open the filter results when the input is focused
  };

  const handleBlur = () => {
    // Delay closing the filter so the user can click on a result
    setTimeout(() => setIsFilterOpen(false), 100);
  };

  useEffect(() => {
    // Fetch posts once when the component mounts
    const fetchPosts = async () => {
      try {
        const response = await PostService.getAllActivePosts();
        setPosts(response);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts?.filter(post =>
    post.title.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLogin = async () => {
    navigation('/login');
  };

  const handleProfile = () => {
    navigation('/profile');
    window.location.reload()
  };

  const handleAvatarHover = () => {
    setIsAvatarHovered(!isAvatarHovered);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  return (
    <header className="bg-gray-800 text-white py-4 fixed top-0 w-full z-10">
      <div className="container mx-auto flex flex-col justify-between items-center md:flex-row h-full">
        <div className="text-xl font-bold mb-4 md:mb-0">
          <Link to="/">Usof</Link>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end w-full md:flex-row ">
          <div className="relative mx-4 mt-6 mb-4 md:mb-0 ld:mb-0 order-2 md:order-1 ld:order-1 md:mt-0 ld:mt-0 w-72">
            <input
              type="text"
              placeholder="Search by post title"
              value={filter}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="bg-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 w-full"
            />
            {isFilterOpen && filter && filteredPosts && filteredPosts.length > 0 && (
              <div className="absolute bg-gray-700 rounded-md p-4 mt-2 w-full md:mx-0 shadow-lg max-h-48 overflow-auto">
                <ul>
                  {filteredPosts.map((post) => (
                    <Link to={`/posts/${post.id}`} className="block">
                      <li
                        key={post.id}
                        className="bg-gray-600 rounded-md hover:bg-gray-500 p-2 flex justify-between mt-2"
                      >
                        <p className="text-white">
                          {post.title}
                          <p className="text-gray-400">@{post.author.login}</p>
                        </p>
                      </li>
                    </Link>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {user ? (
            <div className="flex items-center justify-between order-1 md:order-2">
              <div
                className={`mr-4 cursor-pointer relative`}
                onMouseEnter={handleAvatarHover}
                onMouseLeave={handleAvatarHover}
                onClick={handleProfile}
              >
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="User Avatar"
                    className={`w-16 h-16 rounded-full object-cover object-center ${isAvatarHovered ? 'opacity-50' : 'opacity-100'}`}
                  />
                ) : (
                  <FaUserCircle className={`w-16 h-16 ${isAvatarHovered ? 'opacity-50' : 'opacity-100'}`} />
                )}
                <FaHome
                  className={`h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isAvatarHovered ? 'opacity-100' : 'opacity-0'}`}
                />
              </div>
              <div className="mr-4">
                <span className="font-bold">{user.login}</span>
                <span className="ml-2 text-gray-400">{user.role}</span>
              </div>
              <button
                className="bg-gray-700 rounded-md px-4 py-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="bg-gray-700 rounded-md px-4 py-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 order-2"
              onClick={handleLogin}
            >
              Login
            </button>
          )}
          <div className="flex flex-row justify-between items-center mt-4 order-3">
            {user ? (<div
              className="ml-0 md:pb-4 md:ml-4 cursor-pointer relative"
              onClick={toggleMenu}
              ref={menuRef}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {isMenuOpen && (
                <div className="absolute bg-gray-800 rounded-md p-4 mt-2 -ml-40 w-48 shadow-lg">
                  <ul className="space-y-2"> 
                    {user.role == UserRole.ADMIN && (
                      <li>
                        <a href="/adminPanel" className="flex items-center hover:text-gray-400">
                          <FaUserShield className="mr-2 text-yellow-400" />
                          Admin Panel
                        </a>
                      </li>
                    )}
                    <li>
                      <a href="/myPosts" className="flex items-center hover:text-gray-400">
                        <FaListAlt className="mr-2 text-blue-400" />
                        My Posts
                      </a>
                    </li>
                    <li>
                      <a href={`/favorites/${user.id}`} className="flex items-center hover:text-gray-400">
                        <FaHeart className="mr-2 text-pink-500" /> 
                        Favorites
                      </a>
                    </li>
                    <li>
                      <a href="/profile" className="flex items-center hover:text-gray-400">
                        <FaUserCircle className="mr-2 text-green-400" />
                        Profile page
                      </a>
                    </li>
                  </ul>
                </div>

              )}

            </div>) : (<div className='hidden'></div>)}

          </div>
        </div>
      </div>
    </header>
  );
};
