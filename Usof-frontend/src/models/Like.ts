import { Post } from "./Post";
import { User } from "./User";


export enum LikeType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export class Like {
  id: number;
  authorId: number;
  author: User;
  publishDate: Date;
  type: LikeType;
  postId?: number;
  post?: Post;
  commentId?: number;
  comment?: Comment;

  constructor(
    id: number,
    authorId: number,
    author: User,
    publishDate: Date,
    type: LikeType,
    postId?: number,
    post?: Post,
    commentId?: number,
    comment?: Comment
  ) {
    this.id = id;
    this.authorId = authorId;
    this.author = author;
    this.publishDate = publishDate;
    this.postId = postId;
    this.post = post;
    this.commentId = commentId;
    this.comment = comment;
    this.type = type;
  }
}
