import { Category } from '../models/Category';

export const CategoryService = {
    async createCategory(title: string, description: string): Promise<Category> {
        if (!title || !description) {
            throw new Error('Title and description are required');
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

        if (title) category.title = title;
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
    }
}
