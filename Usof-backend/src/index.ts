import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { Sequelize } from 'sequelize-typescript';
import { User, UserRole, Post, PostCategory, FavoritePost, Category, Comment, CommentReply, Like } from './models/index';
import routes from './routes';
import { postRatingTrigger, userRatingTrigger } from './models/Triggers';
import { JWT_SECRET } from './config';
import { CategoryService, AuthService, PostService, CommentService, LikeService, UserService, FavoritePostService } from './services/index';
import path from 'path';

const PORT: number = 3000;

const app = express();

app.use(express.json());
app.use(cors());

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
    models: [User, Post, Category, Comment, Like, PostCategory, FavoritePost, CommentReply],
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

function mockImage(fileName:string) {
    const filePath = path.join(__dirname, 'imagesMock', fileName);

    if (!fs.existsSync(filePath)) {
        throw new Error(`File ${fileName} does not exist in imagesMock folder.`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(filePath);

    if (!mimeType) {
        throw new Error(`Invalid file type for ${fileName}. Only JPEG, PNG, and GIF are allowed.`);
    }

    const base64Image = fileBuffer.toString('base64');
    return {
        buffer: fileBuffer,
        mimetype: mimeType,
        originalname: fileName,
        base64: `data:${mimeType};base64,${base64Image}`,
    };
}

function getMimeType(filePath:string) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpeg':
        case '.jpg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        default:
            return null;
    }
}

async function insertMockData() {
    try {
        const existingCategories = await Category.findAll();
        if (existingCategories.length > 0) {
            console.log('Categories already exist. Skipping category creation.');
            return;
        }

        const category1 = await CategoryService.createCategory('Games', 'For actual nerds');
        const category2 = await CategoryService.createCategory('Politics', 'Political discussions');
        const category3 = await CategoryService.createCategory('Sport', 'Sport topics and cool techniques');
        const category4 = await CategoryService.createCategory('TV', 'Brainwashing is a thing');
        const category5 = await CategoryService.createCategory('Science', 'All about modern researches');
        const category6 = await CategoryService.createCategory('Fiction', 'Review and discussions about films and series');
        const category7 = await CategoryService.createCategory('Music', 'Share yout great musical experience');
        const category8 = await CategoryService.createCategory('Dance', 'Cha-cha, one, two, three');

        const existingUsers = await User.findAll();
        if (existingUsers.length > 0) {
            console.log('Users already exist. Skipping user creation.');
            return;
        }

        const mockImage1 = mockImage('omar.jpg').base64
        const mockImage2 = mockImage('hikaru.jpg').base64
        const mockImage3 = mockImage('jinx.jpg').base64
        const mockImage4 = mockImage('admin.gif').base64

        const user1 = await UserService.addUser(UserRole.ADMIN, 'Omar Hayam', 'mathIsALife@gmail.com', 'omar', 'Password123', UserRole.USER, mockImage1);
        const user2 = await UserService.addUser(UserRole.ADMIN, 'Hikaru Nakamura', 'checkMate@gmail.com', 'hikaru', 'Password123', UserRole.USER, mockImage2);
        const user3 = await UserService.addUser(UserRole.ADMIN, 'Jinx', 'powder@gmail.com', 'jinx', 'Password123', UserRole.USER, mockImage3);
        const user4 = await UserService.addUser(UserRole.ADMIN, 'Kittie Cat', 'mainNerd@gmail.com', 'admin', 'Password123', UserRole.ADMIN, mockImage4);

        const mockImage5 = mockImage('arcane_release.jpg').base64
        const mockImage6 = mockImage('trump.jpg').base64
        const mockImage7 = mockImage('wow.jpg').base64
        const mockImage8 = mockImage('GPT-5.jpg').base64
        const mockImage9 = mockImage('arcane_merch.jpg').base64
        const mockImage10 = mockImage('patch.jpg').base64
        const mockImage11 = mockImage('mars-colonization.png').base64
        const mockImage12 = mockImage('drama.jpg').base64
        const mockImage13 = mockImage('future.jpg').base64
        const mockImage14 = mockImage('breaking_bad.jpg').base64
        const mockImage15 = mockImage('valorant.jpg').base64
        const mockImage16 = mockImage('jazz.jpg').base64
        const mockImage17 = mockImage('cha-cha.jpg').base64
        const mockImage18 = mockImage('ai_sports.jpg').base64
        const mockImage19 = mockImage('indie.jpg').base64
        const mockImage20 = mockImage('taylor.jpg').base64
        const mockImage21 = mockImage('meat.jpg').base64
        const mockImage22 = mockImage('anime.jpg').base64
        const mockImage23 = mockImage('election.jpg').base64
        const mockImage24 = mockImage('workout.jpg').base64
        const mockImage25 = mockImage('stranger.png').base64

        const post1 = await PostService.createPost(user3.id, 'Arcane release', 'I want to share that Arcane season 2 is finnaly released. That is a great news for League of Legends fans or just enjoyers of first season. Come and watch it on Netflix so we can discuss how well it was designed.', mockImage5, [category6.id, category1.id], new Date(2024, 11, 20, 14, 30));
        const post2 = await PostService.createPost(user1.id, 'Trump inauguration', 'Trump was recently chosen and i want your feedback', mockImage6, [category2.id], new Date(2024, 11, 5, 11, 24));
        const post3 = await PostService.createPost(user4.id, 'WoW 30 years anniversary', 'Finnaly my favorite game is shining right now there is so much stuff to do. I`m so glad i can enjoy my game!', mockImage7, [category1.id], new Date(2024, 10, 25, 0, 30));
        const post4 = await PostService.createPost(user2.id, 'AI Breakthrough: GPT-5 Released', 'OpenAI has released GPT-5, which promises even greater advancements in natural language processing and machine learning. Discuss its potential impact on society.', mockImage8, [category5.id, category2.id], new Date(2024, 11, 1, 10, 0));
        const post5 = await PostService.createPost(user3.id, 'Arcane Merchandise Available!', 'New Arcane-themed merchandise has just dropped. Fans of Jinx, Vi, and Caitlyn can now enjoy official collectibles and apparel.', mockImage9, [category6.id, category1.id], new Date(2024, 11, 15, 12, 45));
        const post6 = await PostService.createPost(user4.id, 'LoL: Patch Notes 10.15', 'The new update to League of Legends has shaken up the meta. Let’s talk about buffs, nerfs, and the best strategies for climbing the ranks!', mockImage10, [category1.id, category6.id], new Date(2024, 11, 3, 14, 15));
        const post7 = await PostService.createPost(user1.id, 'Mars Colonization Updates', 'SpaceX has launched its latest mission to Mars. What does this mean for the future of humanity and space exploration?', mockImage11, [category5.id], new Date(2024, 11, 12, 8, 30));
        const post8 = await PostService.createPost(user4.id, 'Chess Championship Drama', 'Hikaru Nakamura faces Magnus Carlsen in an epic showdown. Can Nakamura reclaim the title? Join the discussion!', mockImage12, [category3.id, category2.id], new Date(2024, 10, 22, 16, 0));
        const post9 = await PostService.createPost(user2.id, 'The Future of Renewable Energy', 'Solar panels, wind turbines, and hydroelectric power are becoming more efficient than ever. Let’s discuss how we can transition to a greener planet.', mockImage13, [category5.id, category2.id], new Date(2024, 11, 18, 10, 30));
        const post10 = await PostService.createPost(user1.id, 'Breaking Bad Returns?', 'Rumors are circulating about a Breaking Bad spinoff. Fans are divided on whether this is a good idea or not. What do you think?', mockImage14, [category6.id, category4.id], new Date(2024, 11, 8, 20, 0));
        const post11 = await PostService.createPost(user3.id, 'Valorant World Championship', 'The grand finals are here! Tune in to watch the top teams clash in one of the most intense FPS competitions of the year.', mockImage15, [category1.id, category3.id], new Date(2024, 11, 30, 15, 0));
        const post12 = await PostService.createPost(user4.id, 'The Renaissance of Jazz', 'Jazz is making a huge comeback, with new artists blending traditional and modern styles. Share your favorite tracks!', mockImage16, [category7.id], new Date(2024, 10, 18, 18, 0));
        const post13 = await PostService.createPost(user1.id, 'Cha-cha Dance Competition', 'The annual International Dance Championship showcased some of the best cha-cha routines. Let’s talk about the standout performances.', mockImage17, [category8.id, category3.id], new Date(2024, 10, 30, 19, 45));
        const post14 = await PostService.createPost(user2.id, 'AI in Sports Analytics', 'Sports teams are leveraging AI to gain competitive advantages. How will this trend shape the future of competitions?', mockImage18, [category5.id, category3.id], new Date(2024, 11, 10, 9, 0));
        const post15 = await PostService.createPost(user4.id, 'Indie Game Showcase', 'Discover some amazing indie games that are redefining the industry. Support small developers and share your recommendations!', mockImage19, [category1.id, category6.id], new Date(2024, 11, 7, 13, 15));
        const post16 = await PostService.createPost(user3.id, 'Taylor Swift’s Record-Breaking Tour', 'Taylor Swift’s latest tour has smashed all records. How does she keep captivating audiences?', mockImage20, [category7.id], new Date(2024, 11, 9, 17, 0));
        const post17 = await PostService.createPost(user2.id, 'Artificial Meat: The Future of Food', 'Lab-grown meat is hitting the shelves. What do you think about this revolution in food production?', mockImage21, [category5.id], new Date(2024, 11, 14, 12, 0));
        const post18 = await PostService.createPost(user4.id, 'Anime Awards Nominees Announced', 'The 2024 Anime Awards have revealed their nominees. Which shows and movies are you rooting for?', mockImage22, [category6.id, category1.id], new Date(2024, 11, 4, 21, 30));
        const post19 = await PostService.createPost(user1.id, 'Elections 2024: Candidate Platforms', 'As the 2024 elections approach, let’s dive into what each candidate is proposing for the country’s future.', mockImage23, [category2.id], new Date(2024, 10, 28, 10, 15));
        const post20 = await PostService.createPost(user2.id, 'Workout Hacks for Gamers', 'Gaming marathons can take a toll on your health. Here are some quick and effective exercises to stay in shape.', mockImage24, [category3.id, category1.id], new Date(2024, 10, 20, 8, 0));
        const post21 = await PostService.createPost(user3.id, 'Stranger Things Season 5', 'The long-awaited final season of Stranger Things is here. Let’s dive into the details and theories.', mockImage25, [category6.id, category4.id], new Date(2024, 11, 25, 22, 15));


        const comment9 = await CommentService.createComment(post1.id, user2.id, 'I can’t wait to watch it! Arcane season 1 was fantastic.');
        const comment10 = await CommentService.createComment(post1.id, user4.id, 'Finally! I hope they maintain the same animation quality.');

        const comment11 = await CommentService.createComment(post2.id, user3.id, 'This is going to spark some intense debates!');
        const comment12 = await CommentService.createComment(post2.id, user2.id, 'Let’s see how things unfold in the next few months.');

        const comment13 = await CommentService.createComment(post3.id, user1.id, 'WoW has come such a long way. Happy anniversary!');
        const comment14 = await CommentService.createComment(post3.id, user3.id, 'Time to relive the glory days with my guild.');

        const comment15 = await CommentService.createComment(post4.id, user4.id, 'GPT-5 sounds incredible. The possibilities are endless!');
        const comment16 = await CommentService.createComment(post4.id, user3.id, 'I’m excited but also a bit concerned about ethical implications.');

        const comment17 = await CommentService.createComment(post5.id, user1.id, 'I need that Jinx hoodie!');
        const comment18 = await CommentService.createComment(post5.id, user2.id, 'Great timing with season 2!');

        const comment19 = await CommentService.createComment(post6.id, user4.id, 'The buffs to my main champ are amazing!');
        const comment20 = await CommentService.createComment(post6.id, user1.id, 'Another meta shake-up...time to grind again.');

        const comment21 = await CommentService.createComment(post7.id, user3.id, 'Living on Mars still feels like science fiction to me.');
        const comment22 = await CommentService.createComment(post7.id, user4.id, 'This is what humanity needs to aim for.');

        const comment23 = await CommentService.createComment(post8.id, user1.id, 'Carlsen vs. Nakamura is always a treat for fans.');
        const comment24 = await CommentService.createComment(post8.id, user2.id, 'Nakamura is on fire this season!');

        const comment25 = await CommentService.createComment(post9.id, user3.id, 'This is crucial for the future of our planet.');
        const comment26 = await CommentService.createComment(post9.id, user4.id, 'Investing in green energy is the way forward.');

        const comment27 = await CommentService.createComment(post10.id, user2.id, 'A spinoff could work if it’s done carefully.');
        const comment28 = await CommentService.createComment(post10.id, user3.id, 'Breaking Bad is iconic, but does it really need more?');

        const comment29 = await CommentService.createComment(post11.id, user1.id, 'The finals are going to be epic!');
        const comment30 = await CommentService.createComment(post11.id, user2.id, 'Rooting for Team Liquid this time.');

        const comment31 = await CommentService.createComment(post12.id, user4.id, 'Jazz has such a timeless appeal.');
        const comment32 = await CommentService.createComment(post12.id, user3.id, 'I just discovered a new band blending jazz and hip-hop!');

        const comment33 = await CommentService.createComment(post13.id, user2.id, 'The winning routine was so elegant!');
        const comment34 = await CommentService.createComment(post13.id, user4.id, 'I’m inspired to try cha-cha now.');

        const comment35 = await CommentService.createComment(post14.id, user1.id, 'AI is making sports more competitive and data-driven.');
        const comment36 = await CommentService.createComment(post14.id, user2.id, 'It’s fascinating to see how AI is changing the game.');

        const comment37 = await CommentService.createComment(post15.id, user3.id, 'Indie developers are so creative!');
        const comment38 = await CommentService.createComment(post15.id, user4.id, 'Can’t wait to try out these hidden gems.');

        const comment39 = await CommentService.createComment(post16.id, user1.id, 'Her performance at the concert was phenomenal!');
        const comment40 = await CommentService.createComment(post16.id, user2.id, 'I wish I could attend one of her shows.');

        const comment41 = await CommentService.createComment(post17.id, user3.id, 'This could revolutionize how we produce food.');
        const comment42 = await CommentService.createComment(post17.id, user1.id, 'I’m curious about how it tastes compared to real meat.');

        const comment43 = await CommentService.createComment(post18.id, user4.id, 'I hope my favorite anime wins!');
        const comment44 = await CommentService.createComment(post18.id, user2.id, 'The competition is tough this year.');

        const comment45 = await CommentService.createComment(post19.id, user3.id, 'I’m closely following the debates.');
        const comment46 = await CommentService.createComment(post19.id, user1.id, 'It’s important to stay informed during elections.');

        const comment47 = await CommentService.createComment(post20.id, user2.id, 'These tips are super helpful for staying active!');
        const comment48 = await CommentService.createComment(post20.id, user4.id, 'I’ll definitely try these between matches.');

        const comment49 = await CommentService.createComment(post21.id, user3.id, 'Can’t wait to see how it all ends!');
        const comment50 = await CommentService.createComment(post21.id, user2.id, 'I hope they answer all the unresolved questions.');


        const comment51 = await CommentService.createReply(comment9.id, user1.id, 'I completely agree! Season 1 was top-notch.');
        const comment52 = await CommentService.createReply(comment9.id, user3.id, 'Let’s have a watch party!');
        const comment53 = await CommentService.createReply(comment10.id, user2.id, 'I’m sure they’ll exceed expectations.');

        const comment54 = await CommentService.createReply(comment11.id, user4.id, 'Debates are inevitable with such topics.');
        const comment55 = await CommentService.createReply(comment12.id, user3.id, 'It will be interesting to see public reactions.');

        const comment56 = await CommentService.createReply(comment13.id, user2.id, '30 years is such a milestone for any game.');
        const comment57 = await CommentService.createReply(comment14.id, user4.id, 'Guild nostalgia hits hard!');

        const comment58 = await CommentService.createReply(comment15.id, user2.id, 'Agreed! AI development is truly fascinating.');
        const comment59 = await CommentService.createReply(comment16.id, user4.id, 'Ethics will always be a challenge with AI.');

        const comment60 = await CommentService.createReply(comment17.id, user3.id, 'I’ve been eyeing the Ekko jacket!');
        const comment61 = await CommentService.createReply(comment18.id, user4.id, 'Perfect timing indeed!');

        const comment62 = await CommentService.createReply(comment19.id, user2.id, 'What’s your main?');
        const comment63 = await CommentService.createReply(comment20.id, user1.id, 'The grind is real.');

        const comment64 = await CommentService.createReply(comment21.id, user1.id, 'It’s becoming reality faster than we think!');
        const comment65 = await CommentService.createReply(comment22.id, user3.id, 'Mars is the future.');

        const comment66 = await CommentService.createReply(comment23.id, user4.id, 'Their games are so intense!');
        const comment67 = await CommentService.createReply(comment24.id, user3.id, 'Nakamura’s strategies are next-level.');

        const comment68 = await CommentService.createReply(comment25.id, user4.id, 'Couldn’t agree more.');
        const comment69 = await CommentService.createReply(comment26.id, user3.id, 'Green energy is the only sustainable option.');

        const comment70 = await CommentService.createReply(comment27.id, user1.id, 'Breaking Bad has such a legacy to live up to.');
        const comment71 = await CommentService.createReply(comment28.id, user4.id, 'Spinoffs can be tricky.');

        const comment72 = await CommentService.createReply(comment29.id, user3.id, 'Which team are you supporting?');
        const comment73 = await CommentService.createReply(comment30.id, user4.id, 'Liquid has been on fire lately.');

        const comment74 = await CommentService.createReply(comment31.id, user2.id, 'Jazz never goes out of style!');
        const comment75 = await CommentService.createReply(comment32.id, user1.id, 'Jazz-hop is such a cool genre.');

        const comment76 = await CommentService.createReply(comment33.id, user3.id, 'Dancing is truly an art.');
        const comment77 = await CommentService.createReply(comment34.id, user2.id, 'Let’s hit the dance floor!');

        const comment78 = await CommentService.createReply(comment35.id, user4.id, 'Data makes all the difference.');
        const comment79 = await CommentService.createReply(comment36.id, user3.id, 'I’d love to see AI analyze historical matches.');

        const comment80 = await CommentService.createReply(comment37.id, user1.id, 'Indie devs are the heart of innovation.');
        const comment81 = await CommentService.createReply(comment38.id, user2.id, 'So many gems waiting to be discovered.');

        const comment82 = await CommentService.createReply(comment39.id, user3.id, 'She never fails to impress.');
        const comment83 = await CommentService.createReply(comment40.id, user4.id, 'Her tours are always legendary.');

        const comment84 = await CommentService.createReply(comment41.id, user2.id, 'It’s the future of food.');
        const comment85 = await CommentService.createReply(comment42.id, user1.id, 'I’ve heard it’s surprisingly close to the real thing.');

        const comment86 = await CommentService.createReply(comment43.id, user3.id, 'I hope the best ones win!');
        const comment87 = await CommentService.createReply(comment44.id, user4.id, 'It’s hard to choose with so many great shows.');

        const comment88 = await CommentService.createReply(comment45.id, user1.id, 'Staying informed is crucial during elections.');
        const comment89 = await CommentService.createReply(comment46.id, user3.id, 'I’ll be watching closely.');

        const comment90 = await CommentService.createReply(comment47.id, user4.id, 'Staying active is important for gamers!');
        const comment91 = await CommentService.createReply(comment48.id, user3.id, 'Let me know how it works for you.');

        const comment92 = await CommentService.createReply(comment49.id, user2.id, 'It’s going to be bittersweet.');
        const comment93 = await CommentService.createReply(comment50.id, user4.id, 'I hope they tie up all loose ends.');



        await LikeService.createLike(user1.id, post1.id, undefined, true);
        await LikeService.createLike(user2.id, post1.id, undefined, false);

        await LikeService.createLike(user3.id, post2.id, undefined, true);
        await LikeService.createLike(user4.id, post2.id, undefined, false);

        await LikeService.createLike(user1.id, post3.id, undefined, true);
        await LikeService.createLike(user2.id, post3.id, undefined, true);

        await LikeService.createLike(user3.id, post4.id, undefined, false);
        await LikeService.createLike(user4.id, post4.id, undefined, true);

        await LikeService.createLike(user1.id, post5.id, undefined, true);
        await LikeService.createLike(user2.id, post5.id, undefined, false);

        await LikeService.createLike(user3.id, post6.id, undefined, true);
        await LikeService.createLike(user4.id, post6.id, undefined, true);

        await LikeService.createLike(user1.id, post7.id, undefined, false);
        await LikeService.createLike(user2.id, post7.id, undefined, true);

        await LikeService.createLike(user1.id, undefined, comment9.id, true);
        await LikeService.createLike(user2.id, undefined, comment9.id, false);

        await LikeService.createLike(user3.id, undefined, comment10.id, true);
        await LikeService.createLike(user4.id, undefined, comment10.id, true);

        await LikeService.createLike(user1.id, undefined, comment11.id, true);
        await LikeService.createLike(user2.id, undefined, comment11.id, true);

        await LikeService.createLike(user3.id, undefined, comment12.id, false);
        await LikeService.createLike(user4.id, undefined, comment12.id, true);

        await LikeService.createLike(user1.id, undefined, comment13.id, true);
        await LikeService.createLike(user2.id, undefined, comment13.id, true);

        await LikeService.createLike(user3.id, undefined, comment14.id, false);
        await LikeService.createLike(user4.id, undefined, comment14.id, true);

        await LikeService.createLike(user1.id, undefined, comment15.id, true);
        await LikeService.createLike(user2.id, undefined, comment15.id, false);

        await LikeService.createLike(user3.id, undefined, comment16.id, true);
        await LikeService.createLike(user4.id, undefined, comment16.id, true);

        await LikeService.createLike(user1.id, undefined, comment51.id, true);
        await LikeService.createLike(user2.id, undefined, comment51.id, false);

        await LikeService.createLike(user3.id, undefined, comment52.id, true);
        await LikeService.createLike(user4.id, undefined, comment52.id, true);

        await LikeService.createLike(user2.id, undefined, comment53.id, true);
        await LikeService.createLike(user3.id, undefined, comment53.id, false);

        await LikeService.createLike(user1.id, undefined, comment54.id, true);
        await LikeService.createLike(user4.id, undefined, comment54.id, true);

        await LikeService.createLike(user2.id, undefined, comment55.id, false);
        await LikeService.createLike(user3.id, undefined, comment55.id, true);

        await LikeService.createLike(user4.id, undefined, comment56.id, true);
        await LikeService.createLike(user1.id, undefined, comment56.id, true);

        await LikeService.createLike(user2.id, undefined, comment57.id, true);
        await LikeService.createLike(user3.id, undefined, comment57.id, false);

        await LikeService.createLike(user4.id, undefined, comment58.id, true);
        await LikeService.createLike(user1.id, undefined, comment58.id, true);

        await LikeService.createLike(user3.id, undefined, comment59.id, true);
        await LikeService.createLike(user2.id, undefined, comment59.id, false);

        await LikeService.createLike(user1.id, undefined, comment60.id, true);
        await LikeService.createLike(user4.id, undefined, comment60.id, true);

        await LikeService.createLike(user2.id, undefined, comment61.id, true);
        await LikeService.createLike(user3.id, undefined, comment61.id, false);

        await LikeService.createLike(user4.id, undefined, comment62.id, true);
        await LikeService.createLike(user1.id, undefined, comment62.id, true);

        await LikeService.createLike(user2.id, undefined, comment63.id, true);
        await LikeService.createLike(user3.id, undefined, comment63.id, false);

        await LikeService.createLike(user4.id, undefined, comment64.id, true);
        await LikeService.createLike(user1.id, undefined, comment64.id, true);

        await LikeService.createLike(user3.id, undefined, comment65.id, true);
        await LikeService.createLike(user2.id, undefined, comment65.id, false);



        await FavoritePostService.addToFavorites(user1.id, post1.id);
        await FavoritePostService.addToFavorites(user1.id, post3.id);
        await FavoritePostService.addToFavorites(user2.id, post2.id);
        await FavoritePostService.addToFavorites(user2.id, post4.id);
        await FavoritePostService.addToFavorites(user3.id, post1.id);
        await FavoritePostService.addToFavorites(user3.id, post5.id);
        await FavoritePostService.addToFavorites(user4.id, post6.id);
        await FavoritePostService.addToFavorites(user4.id, post2.id);
        await FavoritePostService.addToFavorites(user1.id, post7.id);
        await FavoritePostService.addToFavorites(user3.id, post8.id);
        await FavoritePostService.addToFavorites(user2.id, post9.id);
        await FavoritePostService.addToFavorites(user4.id, post10.id);
        await FavoritePostService.addToFavorites(user1.id, post11.id);
        await FavoritePostService.addToFavorites(user2.id, post12.id);
        await FavoritePostService.addToFavorites(user3.id, post13.id);
        await FavoritePostService.addToFavorites(user4.id, post14.id);
        await FavoritePostService.addToFavorites(user1.id, post15.id);
        await FavoritePostService.addToFavorites(user2.id, post16.id);
        await FavoritePostService.addToFavorites(user3.id, post17.id);
        await FavoritePostService.addToFavorites(user4.id, post18.id);

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
