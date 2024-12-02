import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Post } from './Post';
import { Comment } from './Comment';
import { Like } from './Like';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

@Table
export class User extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    login!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    fullName!: string;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    email!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    profilePicture?: string;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0, 
    })
    rating!: number;

    @Column({
        type: DataType.ENUM(...Object.values(UserRole)),
        defaultValue: UserRole.USER,
    })
    role!: UserRole;

    @HasMany(() => Post)
    posts!: Post[];

    @HasMany(() => Comment)
    comments!: Comment[];

    @HasMany(() => Like)
    likes!: Like[];
}