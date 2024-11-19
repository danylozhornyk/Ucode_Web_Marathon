import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { UserRole } from '../models/User';

export const CommentService = {
    async createComment(postId: number, userId: number, content: string) {
        if (!content) {
            throw new Error('Content is required');
        }

        const post = await Post.findByPk(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const comment = await Comment.create({
            content,
            authorId: userId,
            postId,
            publishDate: new Date(),
        });

        await comment.reload({
            include: [
                {
                    association: 'author',
                    attributes: ['id', 'login', 'fullName', 'profilePicture'],
                },
                'likes',
            ],
        });

        return comment;
    },

    async getPostComments(postId: number) {
        const comments = await Comment.findAll({
            where: { postId },
            include: [
                {
                    association: 'author',
                    attributes: ['id', 'login', 'fullName', 'profilePicture'],
                },
                'likes',
            ],
            order: [['publishDate', 'DESC']], 
        });

        return comments;
    },

    async deleteComment(commentId: number, userId: number, userRole: UserRole) {
        const comment = await Comment.findByPk(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        if (userRole !== 'admin' && comment.authorId !== userId) {
            throw new Error('Unauthorized to delete this comment');
        }

        await comment.destroy();
    },

    async updateComment(commentId: number, userId: number, userRole: UserRole, content: string) {
        if (!content) {
            throw new Error('Content is required');
        }

        const comment = await Comment.findByPk(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        if (userRole !== 'admin' && comment.authorId !== userId) {
            throw new Error('Unauthorized to update this comment');
        }

        await comment.update({ content });

        await comment.reload({
            include: [
                {
                    association: 'author',
                    attributes: ['id', 'login', 'fullName', 'profilePicture'],
                },
                'likes',
            ],
        });

        return comment;
    },

    async getAllComments(userRole: UserRole) {
        const comments = await Comment.findAll({
            include: [
                {
                    association: 'author',
                    attributes: ['id', 'login', 'fullName', 'profilePicture'],
                },
                'likes',
                {
                    association: 'post',
                    attributes: ['id', 'title'],
                },
            ],
            order: [['publishDate', 'DESC']],
        });

        return comments;
    }
}
