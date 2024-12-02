import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PostService } from '../../services/PostService';
import { LikeService } from '../../services/LikeService';
import { CommentService } from '../../services/CommentService';
import { Post } from '../../models/Post';
import { Like, LikeType } from '../../models/Like';
import { Comment } from '../../models/Comment';
import { UserService } from '../../services/UserService';
import { FaThumbsUp, FaThumbsDown, FaUserCircle, FaTrashAlt, FaEdit } from 'react-icons/fa';
import { format } from 'date-fns';
import { FiCalendar } from 'react-icons/fi';
import { User, UserRole } from '../../models/User';
import { FaArrowLeft } from 'react-icons/fa6';
import { FavoritePostService } from '../../services/FavoritePostsService';

interface LikeData {
    likes: number;
    dislikes: number;
}

interface UserProps {
    currentUser: User | null;
}

export const PostPage: React.FC<UserProps> = ({ currentUser }) => {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post | null>(null);
    const [likes, setLikes] = useState<Like[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [replies, setReplies] = useState<{ [key: number]: Comment[] }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [newComment, setNewComment] = useState<string>('');
    const [authors, setAuthors] = useState<User | null>(null);
    const [isFav, setFav] = useState<boolean>(false);

    const [likesData, setLikesData] = useState<Record<number, LikeData>>({});


    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };
    useEffect(() => {
        const fetchLikes = async () => {
            const likesPromises = comments.map(async (comment) => {
                try {
                    const data = await handleCommentLikeDisplay(comment.id);
                    return [comment.id, data];
                } catch (error) {
                    console.error(`Error fetching likes for comment ${comment.id}:`, error);
                    return [comment.id, { likes: 0, dislikes: 0 }];
                }
            });
            const results = await Promise.all(likesPromises);
            setLikesData(Object.fromEntries(results));
        };
        fetchLikes();
    }, [comments, likes])

    useEffect(() => {
        const fetchPostDetails = async () => {
            try {
                setLoading(true);
                if (!postId) return;

                const fetchedPost = await PostService.getPostById(Number(postId));
                if (!fetchedPost) {
                    navigate('/posts'); 
                    return;
                }

                const [likes, comments, authors, isFavoriteForCurrentUser] = await Promise.all([
                    LikeService.getLikes(Number(postId), undefined),
                    CommentService.getPostComments(Number(postId)), 
                    UserService.getUserById(fetchedPost.authorId), 
                    currentUser ? FavoritePostService.isFavForUser(fetchedPost.id) : Promise.resolve(false)
                ]);

                setFav(isFavoriteForCurrentUser);
                setLikes(likes);
                setPost(fetchedPost);
                setComments(comments);
                setAuthors(authors);

                const repliesPromises = comments.map(comment =>
                    CommentService.getReplies(comment.id).then(replies => [comment.id, replies])
                );
                const resolvedReplies = await Promise.all(repliesPromises);

                const fetchedReplies = Object.fromEntries(resolvedReplies);
                setReplies(fetchedReplies);
            } catch (error) {
                console.error('Error fetching post details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPostDetails();
    }, [postId, navigate]);


    const handleLikeClick = async (isLike: boolean, commentId: number) => {
        await handleLikeDislike(isLike, commentId);
        try {
            const newData = await handleCommentLikeDisplay(commentId);
            setLikesData(prev => ({
                ...prev,
                [commentId]: newData
            }));
        } catch (error) {
            console.error('Error updating likes display:', error);
        }
    };

    const handleLikeDislike = async (isLike: boolean, commentId?: number) => {
        if (post && postId) {
            try {

                let likeData: Like;
                if (commentId) {
                    likeData = await LikeService.createLike(isLike, undefined, commentId);
                    setReplies((prevReplies) => ({
                        ...prevReplies,
                        [commentId]: prevReplies[commentId]?.map((reply) =>
                            reply.id === likeData.commentId ? { ...reply, like: likeData } : reply
                        ),
                    }));
                } else {
                    likeData = await LikeService.createLike(isLike, Number(postId), undefined);
                    const fetchedLikes = await LikeService.getLikes(Number(postId), undefined);
                    setLikes(fetchedLikes);
                }
            } catch (error) {
                console.error('Error adding like/dislike:', error);
            }
        }
    };

    const handleReply = async (commentId: number, content: string) => {
        try {
            const newReply = await CommentService.createReply(commentId, content);
            if (currentUser) {
                newReply.author = currentUser;
            } else {
                throw new Error("User not found. Cannot assign null to author.");
            }

            setComments((prevComments) => [newReply, ...prevComments]);
            setReplies((prevReplies) => ({
                ...prevReplies,
                [commentId]: [...(prevReplies[commentId] || []), newReply],
            }));
        } catch (error) {
            console.error('Error adding reply:', error);
        }
    };

    const handleAddComment = async () => {
        if (newComment.trim() === '') return;

        try {
            const newCommentData = await CommentService.createComment(Number(postId), newComment);
            setComments((prevComments) => [newCommentData, ...prevComments]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };
    const handleDelete = async (commentId: number, replyId?: number) => {
        try {
            if (replyId) {
                await CommentService.deleteComment(replyId);

                setComments((prevComments) => prevComments.filter((comment) => comment.id !== replyId));
                setReplies((prevReplies) => {
                    const updatedReplies = { ...prevReplies };
                    updatedReplies[commentId] = updatedReplies[commentId]?.filter((reply) => reply.id !== replyId);
                    return updatedReplies;
                });
            } else {
                await CommentService.deleteComment(commentId);
                setComments((prevComments) =>
                    prevComments.filter((comment) => {
                        const replyIds = replies[commentId]?.map((reply) => reply.id) || [];
                        return comment.id !== commentId && !replyIds.includes(comment.id);
                    }
                    ));
                setReplies((prevReplies) => {
                    const updatedReplies = { ...prevReplies };
                    delete updatedReplies[commentId]; 
                    return updatedReplies;
                });
            }
        } catch (error) {
            console.error('Error deleting comment/reply:', error);
        }
    };
    async function handleCommentLikeDisplay(commentId: number) {
        try {

            const likes = await LikeService.getLikes(undefined, commentId);


            const likesCount = likes.filter(like => like.type === LikeType.LIKE).length;
            const dislikesCount = likes.filter(like => like.type === LikeType.DISLIKE).length;

 
            return {
                likes: likesCount,
                dislikes: dislikesCount
            };
        } catch (error) {
            console.error("Error fetching likes/dislikes:", error);
            throw error; 
        }
    }

    async function handleEditPost() {
        navigate(`/posts/update/${post?.id}`)
    }

    async function handleDeletePost() {
        const confirmation = window.confirm("Are you sure you want to delete this post?");

        if (confirmation) {
            try {
                await PostService.deletePost(Number(postId));
                navigate('/')
                window.location.reload()
            } catch (error) {
                console.error("Error deleting post:", error);
            }
        }
    }

    async function handleAddToFav() {
        await FavoritePostService.addToFavorites(Number(postId));
        setFav(!isFav)
    }

    const formatDate = (date: Date) => {
        return format(new Date(date), 'MMMM dd, yyyy HH:mm'); 
    };

    if (loading) {
        return <div className="bg-gray-900 text-gray-200 min-h-screen flex justify-center  text-lg text-gray-400"><span className=" mt-20">Loading...</span></div>;
    }

    if (!post) {
        return <div>Post not found.</div>;
    }

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen">
            <div className="container mx-auto px-4 py-10">

                <h1 className="text-4xl font-extrabold text-center mb-8 text-white max-w-full break-words">
                    {post.title}
                </h1>


                <div className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-12 gap-2">
                        {post.categories.sort((a, b) => b.title.length - a.title.length).map((category, index) => (
                            <span
                                key={index}
                                className={`bg-gray-600 text-white px-2 py-1 rounded-md flex justify-center ${category.title.length > 15 ? 'col-span-2' : ''} ${category.title.length > 25 ? 'md:col-span-3' : ''}`}
                            >
                                {category.title}
                            </span>
                        ))}
                    </div>
                </div>


                <hr className='mt-4' />
                {post.image ? (
                    <div className="mt-4 inline-block w-full rounded-lg flex items-center justify-center text-gray-300 shadow-md">
                        <img src={post.image} alt={post.title} onClick={openModal} className="max-w-full md:max-w-[60%] max-h-full md:max-h-[500px] object-contain rounded-lg shadow-md cursor-pointer" />
                    </div>
                ) : (<div className='hidden'></div>)}

                {isModalOpen && post.image && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50" onClick={closeModal}>
                        <div className="relative max-w-4xl max-h-full">
                            <img src={post.image} alt={post.title} className="max-w-full max-h-full object-contain object-center rounded-lg" />
                        </div>
                    </div>
                )}
                <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 my-6 text-gray-300 px-5 py-4 rounded-lg shadow-lg">
                    {post.content.split('\n').map((paragraph, index) => (
                        <p key={index}>
                            {paragraph}
                        </p>
                    ))}
                </div>

                <div className="w-full text-sm text-gray-400 mb-6 inline-flex align-center justify-between">
                    <div className="inline-flex items-center">
                        <FiCalendar className="text-gray-500 mr-1" />
                        <span>{formatDate(post.publishDate)}</span>
                    </div>
                    <div className="flex flex-row items-center">
                        <p className="mx-2">Author: @{authors?.login}</p>
                        {authors?.profilePicture ? (
                            <img
                                src={authors.profilePicture}
                                alt="User Avatar"
                                className="ml-3 w-12 h-12 rounded-full object-cover object-center"
                            />
                        ) : (
                            <FaUserCircle className="w-12 h-12" />
                        )}
                    </div>
                </div>

                {/* Likes and dislikes for the post */}
                <div className="flex flex-row justify-between items-center gap-4">
                    <div className="flex flex-row">
                        <div className="flex items-center mr-2">
                            {currentUser ? (
                                <button onClick={() => handleLikeDislike(true)} className="flex items-center text-green-500">
                                    <FaThumbsUp className="text-green-500" />
                                    <span className="ml-2 text-sm text-gray-400">
                                        {likes.filter((like) => like.postId === post.id && like.type === LikeType.LIKE).length}
                                    </span>
                                </button>
                            ) :
                                (<div className="flex items-center">
                                    <FaThumbsUp className="text-green-500" />
                                    <span className="ml-2 text-sm text-gray-400">
                                        {likes.filter((like) => like.postId === post.id && like.type === LikeType.LIKE).length}
                                    </span></div>)
                            }
                        </div>
                        <div className="flex items-center ml-2">
                            {currentUser ? (
                                <button onClick={() => handleLikeDislike(false)} className=" flex items-center text-red-500">
                                    <FaThumbsDown className="text-red-500" />
                                    <span className="ml-2 text-sm text-gray-400">
                                        {likes.filter((like) => like.postId === post.id && like.type === LikeType.DISLIKE).length}
                                    </span>
                                </button>
                            ) :
                                (<div className="flex items-center ml-2">
                                    <FaThumbsDown className="text-red-500" />
                                    <span className="ml-2 text-sm text-gray-400">
                                        {likes.filter((like) => like.postId === post.id && like.type === LikeType.DISLIKE).length}
                                    </span>
                                </div>)
                            }
                        </div>
                    </div>

                    {currentUser &&
                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-md cursor-pointer ${isFav
                            ? 'bg-pink-500 text-gray-100 hover:bg-gray-100 hover:text-pink-500'
                            : 'bg-gray-100 text-pink-500 hover:bg-pink-500 hover:text-gray-100'
                            } transition-colors duration-300`}
                            onClick={handleAddToFav}>
                            <div
                                className={`flex items-center justify-center w-6 h-6 rounded-full`}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        fill-rule="evenodd"
                                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                        clip-rule="evenodd"
                                    ></path>
                                </svg>
                            </div>
                            <span
                                className={`font-medium`}
                            >
                                {isFav ? 'Delete from favorites' : 'Add to favorites'}
                            </span>
                        </div>

                    }
                </div>


                {/*Buttons for navigation*/}
                <div className="flex flex-col md:flex-row justify-between">
                    <Link
                        to="/"
                        className="mt-6 flex items-center text-gray-300 hover:text-gray-100 transition-colors"
                    >
                        <FaArrowLeft className="w-5 h-5 mr-1" />
                        Back to Home
                    </Link>
                    {authors && currentUser && (authors.id == currentUser.id || currentUser?.role === UserRole.ADMIN) ? (
                        <div className="mt-8 text-center flex flex-col md:flex-row">
                            <button
                                onClick={handleEditPost}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md px-6 py-2 transition-all duration-300 w-full md:w-auto flex items-center justify-center"
                            >
                                <FaEdit className="mr-2" />
                                Edit Post
                            </button>
                            <button
                                onClick={handleDeletePost}
                                className="ml-0 md:ml-4 mt-4 md:mt-0 bg-red-500 hover:bg-red-600 text-white rounded-md px-6 py-2 transition-all duration-300 w-full md:w-auto flex items-center justify-center"
                            >
                                <FaTrashAlt className="mr-2" />
                                Delete Post
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:block"></div>
                    )}
                </div>


                {/* Comments Section */}
                <div>
                    <h2 className="text-2xl font-semibold my-4 text-white">Comment <span className={`ml-2 text-gray-400 text-base font-normal ${currentUser && 'hidden'}`}>(login to comment)</span></h2>
                    <div className={`mb-4 flex gap-2 ${!currentUser && 'hidden'}`}>
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value) {
                                    handleAddComment();
                                    e.currentTarget.value = '';
                                }
                            }}
                            className="p-2 rounded bg-gray-700 text-gray-300 w-full"
                        />
                    </div>

                    {comments.length === 0 && <div>No comments yet.</div>}
                    {comments.filter(comment =>
                        !(
                            replies &&
                            Object.keys(replies).length > 0 &&
                            Object.values(replies).some(replyList =>
                            (
                                replyList &&
                                replyList.length > 0 &&
                                replyList.some(reply => reply.id === comment.id))
                            )
                        )
                    ).map((comment, index) => {

                        return (
                            <div key={comment.id} className={`mb-6 ${index === 0 ? 'border-t border-gray-600 pt-6' : ''}`}>
                                <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-600">
                                    <div className="flex flex-row items-center mt-2 text-sm text-gray-400">
                                        {comment.author.profilePicture ? (
                                            <img
                                                src={comment.author.profilePicture}
                                                alt="User Avatar"
                                                className="w-12 h-12 rounded-full object-cover object-center"
                                            />
                                        ) : (
                                            <FaUserCircle className="w-12 h-12" />
                                        )}
                                        <p className="ml-2">Author: @{comment.author?.login}</p>
                                        {(currentUser?.id === comment.authorId || currentUser?.role === UserRole.ADMIN) && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="ml-auto text-red-500"
                                            >
                                                <FaTrashAlt className="text-xl" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-2 text-sm text-gray-400 inline-flex">
                                        <FiCalendar className="text-gray-500 mr-1" />
                                        <span> {formatDate(comment.publishDate)}</span>
                                    </div>
                                    <div className="text-gray-300 break-words">{comment.content}</div>
                                    <div className="mt-2 text-sm text-gray-400">
                                        {replies[comment.id] && replies[comment.id].length} Replies
                                    </div>
                                    <div className="mt-2 flex gap-4">
                                        <div className="flex items-center">
                                            {currentUser ? (
                                                <button onClick={() => handleLikeClick(true, comment.id)} className="flex items-center text-green-500">
                                                    <FaThumbsUp className="mr-2 text-green-500" />
                                                    <span className="text-sm text-gray-400">{likesData[comment.id]?.likes || 0}</span>
                                                </button>
                                            ) : (<div className="flex items-center text-green-500">
                                                <FaThumbsUp className="mr-2 text-green-500" />
                                                <span className="text-sm text-gray-400">{likesData[comment.id]?.likes || 0}</span>
                                            </div>)
                                            }

                                        </div>
                                        <div className="flex items-center">
                                            {currentUser ? (
                                                <button onClick={() => handleLikeClick(false, comment.id)} className="flex items-center text-red-500">
                                                    <FaThumbsDown className="mr-2 text-red-500" />
                                                    <span className="text-sm text-gray-400">{likesData[comment.id]?.dislikes || 0}</span>
                                                </button>
                                            ) : (<div className="flex items-center text-red-500">
                                                <FaThumbsDown className="mr-2 text-red-500" />
                                                <span className="text-sm text-gray-400">{likesData[comment.id]?.dislikes || 0}</span>
                                            </div>)
                                            }

                                        </div>
                                    </div>

                                    {/* Reply Section */}
                                    <div className="mt-4">
                                        <div className={`flex gap-2  ${!currentUser && 'hidden'}`}>
                                            <input
                                                type="text"
                                                placeholder="Write a reply..."
                                                className="p-2 rounded bg-gray-700 text-gray-300"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && e.currentTarget.value) {
                                                        handleReply(comment.id, e.currentTarget.value);
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                        {replies[comment.id]?.map((reply) => (
                                            <div key={reply.id} className="mt-4 ml-6 border-l-4 border-blue-500 pl-4">
                                                <div className="bg-gray-700 p-4 rounded-lg shadow-lg border border-gray-600">
                                                    <div className="flex flex-row items-center mt-2 text-sm text-gray-400">
                                                        {reply.author?.profilePicture ? (
                                                            <img
                                                                src={reply.author.profilePicture}
                                                                alt="User Avatar"
                                                                className="w-12 h-12 rounded-full object-cover object-center"
                                                            />
                                                        ) : (
                                                            <FaUserCircle className="w-12 h-12" />
                                                        )}
                                                        <p className="ml-2">Author: @{reply.author?.login}</p>
                                                        {(currentUser?.id === reply.authorId || currentUser?.role === UserRole.ADMIN) && (
                                                            <button
                                                                onClick={() => handleDelete(comment.id, reply.id)} 
                                                                className="ml-auto text-red-500"
                                                            >
                                                                <FaTrashAlt className="text-xl" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 text-sm text-gray-400 inline-flex">
                                                        <FiCalendar className="text-gray-500 mr-1" />
                                                        <span> {formatDate(reply.publishDate)}</span>
                                                    </div>
                                                    <div className="break-words">{reply.content}</div>
                                                    <div className="mt-2 flex gap-4">
                                                        <div className="flex items-center">
                                                            {currentUser ? (
                                                                <button onClick={() => handleLikeClick(true, reply.id)} className="flex items-center text-green-500">
                                                                    <FaThumbsUp className="mr-2 text-green-500" />
                                                                    <span className="text-sm text-gray-400">{likesData[reply.id]?.likes || 0}</span>
                                                                </button>) : (
                                                                <div className="flex items-center text-green-500">
                                                                    <FaThumbsUp className="mr-2 text-green-500" />
                                                                    <span className="text-sm text-gray-400">{likesData[reply.id]?.likes || 0}</span>
                                                                </div>)
                                                            }
                                                        </div>
                                                        <div className="flex items-center">
                                                            {currentUser ? (
                                                                <button onClick={() => handleLikeClick(false, reply.id)} className="flex items-center text-red-500">
                                                                    <FaThumbsDown className="mr-2 text-red-500" />
                                                                    <span className="text-sm text-gray-400">{likesData[reply.id]?.dislikes || 0}</span>
                                                                </button>) : (
                                                                <div className="flex items-center text-red-500">
                                                                    <FaThumbsDown className="mr-2 text-red-500" />
                                                                    <span className="text-sm text-gray-400">{likesData[reply.id]?.dislikes || 0}</span>
                                                                </div>)}

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
