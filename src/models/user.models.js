import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
const userSchema = new mongoose.Schema(
    {
        avatar: {
            type: {
                url: String,
                localPath: String
            },
            default: {
                url: `https://placehold.co/200x200`,
                localPath: ""
            }
        },
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            index: true,
            minlength: 2
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email"]
        },

        fullname: {
            type: String,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false // password won't be returned by default
        },

        role: {
            type: String,
            enum: ["user", "admin"],

        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        refreshToken: {
            type: String
        },
        forgotPasswordToken: {
            type: String
        },
        forgotPasswordExpiry: {
            type: Date
        },
        emailVerificationToken: {
            type: String
        },
        emailVerificationExpiry: {
            type: Date
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true // adds createdAt & updatedAt
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}



export const User = mongoose.model("User", userSchema);


