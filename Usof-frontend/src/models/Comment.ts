import { Like } from "./Like";
import { Post } from "./Post";
import { User } from "./User";

export class Comment {
  id: number;
  authorId: number;
  author: User;
  publishDate: Date;
  content: string;
  postId: number;
  post: Post;
  likes: Like[];
  replies: Comment[];

  constructor(
    id: number,
    authorId: number,
    author: User,
    publishDate: Date,
    content: string,
    postId: number,
    post: Post,
    likes: Like[] = [],
    replies: Comment[] = []
  ) {
    this.id = id;
    this.authorId = authorId;
    this.author = author;
    this.publishDate = publishDate;
    this.content = content;
    this.postId = postId;
    this.post = post;
    this.likes = likes;
    this.replies = replies;
  }
}

