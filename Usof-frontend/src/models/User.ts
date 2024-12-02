import { Like } from "./Like";
import { Post } from "./Post";


export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class User {
  id: number;
  login: string;
  password: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  rating: number;
  role: UserRole;
  posts: Post[];
  comments: Comment[];
  likes: Like[];

  constructor(
    id: number,
    login: string,
    password: string,
    fullName: string,
    email: string,
    profilePicture?: string,
    rating: number = 0,
    role: UserRole = UserRole.USER,
    posts: Post[] = [],
    comments: Comment[] = [],
    likes: Like[] = []
  ) {
    this.id = id;
    this.login = login;
    this.password = password;
    this.fullName = fullName;
    this.email = email;
    this.profilePicture = profilePicture;
    this.rating = rating;
    this.role = role;
    this.posts = posts;
    this.comments = comments;
    this.likes = likes;
  }
}