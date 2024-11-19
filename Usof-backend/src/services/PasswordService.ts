import { User } from '../models/User';
import bcrypt from 'bcrypt';
import nodemailer, { Transporter } from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } from '../config';
import { AuthService } from './AuthService';

export class PasswordService {
    private static transporter: Transporter;

    static async init() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });
    }

    static async changePassword(userId: number, newPassword: string, token: string) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await user.update({ password: hashedPassword });

        await this.sendPasswordChangeEmail(user.email, user.fullName);

        await AuthService.logout(token);
    }

    private static async sendPasswordChangeEmail(email: string, fullName: string) {
        await this.transporter.sendMail({
            from: 'your-email@example.com',
            to: email,
            subject: 'Password Changed',
            text: `Dear ${fullName},\n\nYour password has been changed successfully.\n\nIf you did not request this change, please contact our support team immediately.\n\nBest regards,\nYour App Team`
        });
    }
}

PasswordService.init();
