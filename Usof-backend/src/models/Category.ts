import { Table, Column, Model, DataType, BelongsToMany } from 'sequelize-typescript';
import { Post, PostCategory } from './Post';

@Table
export class Category extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    title!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    description!: string;

    @BelongsToMany(() => Post, () => PostCategory)
    posts!: Post[];
}
