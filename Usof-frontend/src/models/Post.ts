import {Category} from "./Category";
import { Like } from "./Like";
import { User } from "./User";
import {Comment} from './Comment'

export enum PostStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class Post {
  id: number;
  authorId: number;
  author: User;
  title: string;
  publishDate: Date;
  status: PostStatus;
  content: string;
  image?: string;
  categories: Category[];
  comments: Comment[];
  commentsCount:number;
  likes: Like[];
  rating: number;

  constructor(
    id: number,
    authorId: number,
    author: User,
    title: string,
    publishDate: Date,
    status: PostStatus,
    content: string,
    commentsCount:number,
    image?: string,
    categories: Category[] = [],
    comments: Comment[] = [],
    likes: Like[] = [],
    rating: number = 0
  ) {
    this.id = id;
    this.authorId = authorId;
    this.author = author;
    this.title = title;
    this.publishDate = publishDate;
    this.status = status;
    this.content = content;
    this.image = image;
    this.categories = categories;
    this.comments = comments;
    this.commentsCount = commentsCount;
    this.likes = likes;
    this.rating = rating;
  }
}
