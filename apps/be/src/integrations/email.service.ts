import {Injectable} from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
    }

    async sendOtp(email: string, otp: string) {
        await sgMail.send({
            to: email,
            from: process.env.SENDGRID_FROM as string,
            subject: 'Your TripVN OTP',
            html: `
                <p>Your OTP:</p>
                <h2>${otp}</h2>
                <p>Valid for 5 minutes</p>
            `,
        });
    }
}
