import axios from "axios";
export { AuthService } from './AuthService'
export { UserService } from './UserService'
export { CategoryService } from './CategoryService'
export {PostService } from './PostService'
export {LikeService } from './LikeService'
export {CommentService } from './CommentService'


export const handleError = (error: any): Error =>{
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.message;
        return new Error(`${message}`);
    }
    return new Error('An unexpected error occurred');
}