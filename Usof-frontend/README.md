# DZHO - Forum Application

A modern forum/discussion platform built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- User authentication and profile management
- Post creation, editing, and management
- Comments with likes/dislikes
- Favorite posts system
- Admin panel
- Password reset functionality
- Category management
- Responsive design with dynamic header adjustment
- Dark mode support

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Icons:** 
  - Lucide React
  - React Icons
- **Date Handling:** date-fns

## 🏗️ Project Structure

```
src/
├── components/
│   ├── adminPanel/
│   │   └── adminPanel.tsx
│   ├── auth/
│   │   ├── loginPage.tsx
│   │   ├── profile.tsx
│   │   ├── userPosts.tsx
│   │   ├── favoritePosts.tsx
│   │   ├── resetPassword.tsx
│   │   └── changePassword.tsx
│   ├── posts/
│   │   ├── createPost.tsx
│   │   ├── postPage.tsx
│   │   ├── updatePost.tsx
|   |   └── posts.tsx
│   ├── footer/
│   │   └── footer.tsx
│   ├── header/
│   │   └── header.tsx
│   └── notFoundPage.tsx
├── models/
│   ├── User.ts
│   ├── Post.ts
│   ├── Comment.ts
│   ├── Like.ts
│   ├── Category.ts
│   └── FavoritePost.ts
├── services/
│   ├── AuthService.ts
│   ├── CategoryService.ts
│   ├── CommentService.ts
│   ├── FavoritePostsService.ts
│   ├── LikeService.ts
│   ├── PostService.ts
│   └── UserService.ts
└── App.tsx
```

## 📥 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd dzho
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   Create a `.env` file in the root directory:
```env
VITE_BACKEND_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript compiler and Vite build)
- `npm run preview` - Preview production build
- `npm run lint` - Lint the codebase with ESLint

## 💻 Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 📋 Models

### User
- Role-based system (User/Admin)
- Profile management
- Rating system
- Posts and comments tracking

### Post
- Status management (Active/Inactive)
- Category assignment
- Comments and likes tracking
- Rating system

### Comment
- Nested replies support
- Like/Dislike functionality
- Author tracking

### Like
- Support for both posts and comments
- Type system (Like/Dislike)

### Category
- Title and description
- Post categorization

### FavoritePost
- User-specific post bookmarking

## 🔐 Authentication Features

- User login/logout
- Password reset
- Password change
- Profile management
- Role-based access control

## 📱 Responsive Design

- Dynamic header height adjustment
- Mobile-first approach
- Flexible layout system

## 🔒 Security Features

- Protected routes
- Role-based access control (User/Admin)
- Secure password reset system
- Token-based authentication

## 🏗️ Build Configuration

### Vite Config
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
});
```

### Tailwind Config
```javascript
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📦 Dependencies

### Main Dependencies
```json
{
  "autoprefixer": "^10.4.20",
  "axios": "^1.7.7",
  "date-fns": "^4.1.0",
  "lucide-react": "^0.462.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-icons": "^5.3.0",
  "react-router-dom": "^7.0.0"
}
```

### Dev Dependencies
```json
{
  "typescript": "~5.6.2",
  "vite": "^5.4.10",
  "tailwindcss": "^3.4.15",
  "eslint": "^9.13.0"
}
```