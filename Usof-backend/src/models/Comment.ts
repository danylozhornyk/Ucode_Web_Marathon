import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './User';
import { Post } from './Post';
import { Like } from './Like';

@Table
export class Comment extends Model {
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
    })
    authorId!: number;

    @BelongsTo(() => User)
    author!: User;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    publishDate!: Date;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    content!: string;

    @ForeignKey(() => Post)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    postId!: number;

    @BelongsTo(() => Post)
    post!: Post;

    @HasMany(() => Like)
    likes!: Like[];
}
