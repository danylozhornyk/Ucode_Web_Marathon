import { User } from '../models/User';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer, { Transporter } from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '../config';

interface PasswordResetToken {
    email: string;
    token: string;
    expiresAt: Date;
}

export const resetTokens = new Map<string, PasswordResetToken>();

export class PasswordService {
    private static transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });

    static async generateResetToken(email: string): Promise<string> {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        resetTokens.set(token, {
            email,
            token,
            expiresAt
        });

        return token;
    }

    static async sendPasswordResetEmail(email: string, resetToken: string) {
        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

        await this.transporter.sendMail({
            from: `"USOF" <${SMTP_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <p>Hello,</p>
                <p>We've received a request to reset your password.</p>
                <p>To reset your password, please click the link below:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This password reset link will expire in 24 hours.</p>
                <p>If you did not request a password reset, please disregard this email.</p>
                <p>Thank you,</p>
                <p>The USOF Team</p>

            `
        });
    }

    static async verifyResetToken(token: string): Promise<string | null> {
        const resetData = resetTokens.get(token);

        if (!resetData || resetData.expiresAt < new Date()) {
            resetTokens.delete(token);
            return null;
        }

        return resetData.email;
    }

    static async resetPassword(user: User, newPassword: string): Promise<boolean> {

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return true;
    }

    static async changePassword(user: User, oldPassword: string, newPassword: string): Promise<boolean> {
        const isValidPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid old password');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return true;
    }
}
