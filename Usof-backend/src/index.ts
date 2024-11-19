import express from 'express';
import { Sequelize } from 'sequelize-typescript';
import { User, UserRole } from './models/User';
import { Post, PostCategory, FavoritePost } from './models/Post';
import { Category } from './models/Category';
import { Comment } from './models/Comment';
import { Like } from './models/Like';
import routes from './routes';
import { postRatingTrigger , userRatingTrigger} from './models/Triggers';
import { JWT_SECRET } from './config';
import { CategoryService } from './services/CategoryService';
import { AuthService } from './services/AuthService';
import { PostService } from './services/PostService';
import { CommentService } from './services/CommentService';
import LikeService from './services/LikeService';
import { UserService } from './services/UserService';
import { FavoritePostService } from './services/FavoritePostService';

const PORT: number = 3000;

const app = express();

app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('The server is running, check the README.md file to understand how to check this Task!');
});

if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set. The server cannot start.');
    process.exit(1);
}

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'Usof',
    models: [User, Post, Category, Comment, Like, PostCategory, FavoritePost],
    logging: true,
});

async function initializeDatabase() {
    try {
        await sequelize.sync();
        await postRatingTrigger(sequelize);
        await userRatingTrigger(sequelize);
        console.log('Database synchronized');
    } catch (error) {
        console.error('Unable to synchronize the database:', error);
    }
}

async function insertMockData() {
    try {
        const existingCategories = await Category.findAll();
        if (existingCategories.length > 0) {
            console.log('Categories already exist. Skipping category creation.');
            return; 
        }

        const category1 = await CategoryService.createCategory('Technology', 'All about tech');
        const category2 = await CategoryService.createCategory('Health', 'Health and wellness topics');
        const category3 = await CategoryService.createCategory('Sport', 'Running 100mph all the time');
        const category4 = await CategoryService.createCategory('TV', 'Brainwashing is a thing');

        const existingUsers = await User.findAll();
        if (existingUsers.length > 0) {
            console.log('Users already exist. Skipping user creation.');
            return;
        }

        const user1 = await AuthService.register('user1', 'Password123', 'user1@gmail.com', 'User One');
        const user2 = await AuthService.register('user2', 'Password123', 'user2@gmail.com', 'User Two');
        const user3 = await UserService.addUser(UserRole.ADMIN,'User three','user3@gmail.com','user3', 'Password123', UserRole.USER);
        const user4 = await UserService.addUser(UserRole.ADMIN,'User four','user4@gmail.com','user4', 'Password123', UserRole.ADMIN);

        const post1 = await PostService.createPost(user1.id, 'First Post', 'This is the content of the first post', undefined, [category1.id]);
        const post2 = await PostService.createPost(user2.id, 'Second Post', 'This is the content of the second post', undefined, [category2.id]);
        const post3 = await PostService.createPost(user2.id, 'Second Post', 'This is the content of the second post', undefined, [category1.id,category2.id,category3.id]);
        const post4 = await PostService.createPost(user2.id, 'Second Post', 'This is the content of the second post', undefined, [category2.id,category4.id]);

        const comment1 = await CommentService.createComment(post1.id, user2.id, 'Great post!');
        const comment2 = await CommentService.createComment(post2.id, user1.id, 'Thanks for sharing!');
        const comment3 = await CommentService.createComment(post1.id, user3.id, 'Okay!');
        const comment4 = await CommentService.createComment(post2.id, user4.id, 'Cool!');
        const comment5 = await CommentService.createComment(post3.id, user2.id, 'Wow!');
        const comment6 = await CommentService.createComment(post4.id, user1.id, 'Super!');
        const comment7 = await CommentService.createComment(post1.id, user3.id, 'Like That!');
        const comment8 = await CommentService.createComment(post3.id, user4.id, 'Broo!');

        await LikeService.createLike(user1.id, post1.id, undefined, true); 
        await LikeService.createLike(user1.id, undefined, comment1.id, false);
        await LikeService.createLike(user2.id, post2.id, undefined, true);
        await LikeService.createLike(user2.id, post3.id, undefined, true); 
        await LikeService.createLike(user3.id, post1.id, undefined, false);
        await LikeService.createLike(user3.id, post2.id, undefined, true);
        await LikeService.createLike(user4.id, post4.id, undefined, true); 
        await LikeService.createLike(user4.id, post3.id, undefined, false);
        await LikeService.createLike(user3.id, undefined, comment3.id, true);

        await FavoritePostService.addToFavorites(user1.id,post1.id);
        await FavoritePostService.addToFavorites(user1.id,post2.id);
        await FavoritePostService.addToFavorites(user1.id,post3.id);
        await FavoritePostService.addToFavorites(user2.id,post1.id);
        await FavoritePostService.addToFavorites(user3.id,post1.id);

        console.log('Mock data inserted successfully');
    } catch (error) {
        console.error('Error inserting mock data:', error);
    }
}

sequelize.authenticate()
    .then(async () => {
        console.log('Connected to database');

        await initializeDatabase();

        await insertMockData();

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}/`);
        });
    })
    .catch((error) => console.log('Error connecting to database:', error));
