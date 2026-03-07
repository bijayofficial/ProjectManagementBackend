import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: Number(process.env.MAILTRAP_SMTP_PORT),
    auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS
    }
});

const sendEmail = async ({ to, subject, mailgenContent }) => {
    if (!to) {
        throw new Error("Recipient email (to) is required");
    }

    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "https://taskmanagelink.com"
        }
    });

    const emailHtml = mailGenerator.generate(mailgenContent);
    const emailText = mailGenerator.generatePlaintext(mailgenContent);

    const message = {
        from: "Task Manager <no-reply@taskmanager.com>",
        to,
        subject,
        html: emailHtml,
        text: emailText
    };

    try {
        await transport.sendMail(message);
        console.log(`📧 Email sent successfully to ${to}`);
    } catch (error) {
        console.error("❌ Email sending failed.");
        console.error("Reason:", error.message);
    }
};


const emailVerificationMailgenContent = (username, verificationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to Task Manager! We’re excited to have you on board.",
            action: {
                instructions: "To verify your email address, please click the button below:",
                button: {
                    color: "#5b560f",
                    text: "Verify Email",
                    link: verificationURL
                }
            },
            outro: "If you did not create this account, you can safely ignore this email."
        }
    };
};

const forgotPasswordMailgenContent = (username, resetPasswordURL) => {
    return {
        body: {
            name: username,
            intro: "We received a request to reset your password.",
            action: {
                instructions: "Click the button below to reset your password. This link is valid for a limited time.",
                button: {
                    color: "#d28089",
                    text: "Reset Password",
                    link: resetPasswordURL
                }
            },
            outro: "If you didn’t request a password reset, please ignore this email."
        }
    };
};

export {
    sendEmail,
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent
};
