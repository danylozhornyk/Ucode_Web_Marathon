import { Category } from '../models/Category';
import { Post, PostCategory, PostStatus } from '../models/Post';

export const CategoryService = {
    async createCategory(title: string, description: string): Promise<Category> {
        if (!title || !description) {
            throw new Error('Title and description are required');
        }

        if (title) {
            const existingCategory = await Category.findOne({ where: { title } });
            if (existingCategory) {
                throw new Error('Title with that name already exist');
            }
        }
        const category = await Category.create({
            title,
            description
        });

        return category;
    },

    async updateCategory(id: number, title: string, description: string): Promise<Category> {
        if (!title && !description) {
            throw new Error('At least one of title or description is required');
        }

        const category = await Category.findByPk(id);
        if (!category) {
            throw new Error('Category not found');
        }

        if (title && title !== category.title) {
            const existingCategory = await Category.findOne({ where: { title } });
            if (existingCategory && existingCategory.id !== category.id) {
                throw new Error('Title with that name already exist');
            }
            category.title = title;
        }

        if (description) category.description = description;
        await category.save();

        return category;
    },

    async deleteCategory(id: number): Promise<Category> {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new Error('Category not found');
        }

        await category.destroy();
        return category;
    },

    async getAllCategories(): Promise<Category[]> {
        const categories = await Category.findAll();
        return categories;
    },

    async getCategoriesForActivePosts(): Promise<Category[]> {
        const categories = await Category.findAll({
            include: [
                {
                    association: 'posts',
                    where: { status: PostStatus.ACTIVE },
                    attributes: [], 
                    through: { attributes: [] },
                },
            ],
            attributes: ['id', 'title', 'description'], 
            group: ['Category.id'], 
        });

        return categories;
    },



    async getCategoriesForPost(postId: number): Promise<Category[]> {
        const post = await Post.findByPk(postId, {
            include: [
                {
                    model: Category,
                    through: { attributes: [] },
                },
            ],
        });

        if (!post) {
            throw new Error('Post not found');
        }

        return post.categories;
    }

}
