import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Post } from './Post';
import { Comment } from './Comment';

export enum LikeType {
    LIKE = 'like',
    DISLIKE = 'dislike',
}

@Table
export class Like extends Model {
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
        type: DataType.DATE,
        allowNull: false,
    })
    publishDate!: Date;

    @ForeignKey(() => Post)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        onDelete: 'CASCADE',
    })
    postId?: number;

    @BelongsTo(() => Post, { onDelete: 'CASCADE'})
    post?: Post;

    @ForeignKey(() => Comment)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        onDelete: 'CASCADE'
    })
    commentId?: number;

    @BelongsTo(() => Comment, {onDelete: 'CASCADE'})
    comment?: Comment;

    @Column({
        type: DataType.ENUM(...Object.values(LikeType)),
        allowNull: false,
    })
    type!: LikeType;
}
