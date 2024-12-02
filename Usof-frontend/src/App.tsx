import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Header, Footer, LoginPage, Profile, Posts } from './components/index';
import { User } from './models/User';
import { UserService } from './services/index';
import { CreatePost } from './components/posts/createPost';
import { PostPage } from './components/posts/postPage';
import { UserPosts } from './components/auth/userPosts';
import { EditPost } from './components/posts/updatePost';
import { ResetPasswordPage } from './components/auth/resetPassword';
import { ChangePasswordPage } from './components/auth/changePassword';
import { FavoritePosts } from './components/auth/favoritePosts';
import { AdminPanel } from './components/adminPanel/adminPanel';
import NotFoundPage from './components/notFoundPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      setUser(await UserService.getUser());
    };
    fetchUser();

    const handleResize = () => {
      const header = document.querySelector('header');
      setHeaderHeight(header?.offsetHeight || 0);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const header = document.querySelector('header');
    setHeaderHeight(header?.offsetHeight || 0);
  }, [user]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header user={user} setUser={setUser} />
        <main className="flex-grow" style={{ paddingTop: `${headerHeight}px` }}>
          <Routes>
            <Route path="/" element={<Posts currentUser={user} />} />
            <Route path="/adminPanel" element={<AdminPanel currentUser={user} />} />
            <Route path="/favorites/:userId" element={<FavoritePosts currentUser={user} />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage user={user} />} />
            <Route path="/change-password" element={<ChangePasswordPage user={user} />} />
            <Route path="/posts/update/:postId" element={<EditPost user={user} />}></Route>
            <Route path="/myPosts" element={<UserPosts currentUser={user} />} />
            <Route path="/posts/:postId" element={<PostPage currentUser={user}/>} />
            <Route path="/createPost" element={<CreatePost user={user} />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
