import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany, HasMany } from 'sequelize-typescript';
import { User } from './User';
import { Category } from './Category';
import { Comment } from './Comment';
import { Like } from './Like';

export enum PostStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

@Table
export class Post extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
    })
    authorId!: number;

    @BelongsTo(() => User, { onDelete: 'CASCADE' })
    author!: User;


    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    title!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    publishDate!: Date;

    @Column({
        type: DataType.ENUM(...Object.values(PostStatus)),
        defaultValue: PostStatus.ACTIVE,
    })
    status!: PostStatus;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    content!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    image?: string;

    @BelongsToMany(() => Category, () => PostCategory)
    categories!: Category[];

    @HasMany(() => Comment)
    comments!: Comment[];

    @HasMany(() => Like)
    likes!: Like[];

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    rating!: number;
}

@Table
export class PostCategory extends Model {
    @ForeignKey(() => Post)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE'
    })
    postId!: number;

    @BelongsTo(() => Post, { onDelete: 'CASCADE' })
    post!: Post;

    @ForeignKey(() => Category)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE'
    })
    categoryId!: number;

    @BelongsTo(() => Category, { onDelete: 'CASCADE' })
    category!: Category;
}

@Table
export class FavoritePost extends Model {
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
    })
    userId!: number;
    
    @BelongsTo(() => User, { onDelete: 'CASCADE' })
    user!: User;
    

    @ForeignKey(() => Post)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
    })
    postId!: number;

    @BelongsTo(() => Post, { onDelete: 'CASCADE' })
    post!: Post;
}
