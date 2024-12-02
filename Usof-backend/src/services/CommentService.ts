import { Comment, CommentReply } from '../models/Comment';
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

    async createReply(parentId: number, userId: number, content: string) {
        if (!content) {
            throw new Error('Content is required');
        }

        const parentComment = await Comment.findByPk(parentId);
        if (!parentComment) {
            throw new Error('Parent comment not found');
        }

        const reply = await Comment.create({
            content,
            authorId: userId,
            postId: parentComment.postId,
            publishDate: new Date(),
        });

        await CommentReply.create({
            parentId: parentComment.id,
            commentId: reply.id,
        });

        return reply;
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

    async getReplies(parentId: number) {
        const parentComment = await Comment.findByPk(parentId, {
            include: [
                {
                    association: 'author',
                    attributes: ['id', 'login', 'fullName', 'profilePicture'],
                },
                'likes',
            ],
        });
    
        if (!parentComment) {
            throw new Error('Parent comment not found');
        }
    
        const commentReplies = await CommentReply.findAll({
            where: { parentId },
            attributes: ['commentId'],
        });
    
        const commentIds = commentReplies.map(reply => reply.commentId);
    
        const replies = await Comment.findAll({
            where: { id: commentIds },
            include: [
                {
                    association: 'author',
                    attributes: ['id', 'login', 'fullName', 'profilePicture'],
                },
                'likes',
            ],
            order: [['publishDate', 'DESC']],
        });
    
        const result = {
            ...parentComment.toJSON(), 
            replies,
        };
    
        return result;
    },
    

    async deleteComment(commentId: number, userId: number, userRole: UserRole) {
        const comment = await Comment.findByPk(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }
    
        if (userRole !== 'admin' && comment.authorId !== userId) {
            throw new Error('Unauthorized to delete this comment');
        }
    
        const replies = await CommentReply.findAll({
            where: { parentId: commentId },
        });
    
        for (const reply of replies) {
            const commentToDelete = await Comment.findByPk(reply.commentId);
            if (commentToDelete) {
                await commentToDelete.destroy();
            }
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
    },
};
