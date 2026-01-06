import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefrestToken();
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access Token.")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body;

    const userExisted = await User.findOne({ $or: [{ email: email }, { username: username }] });
    console.log("userExisted", userExisted);
    if (userExisted) {
        console.log('APIerrror  class triggered');
        throw new ApiError(409, "User already exists");
    }
    const user = await User.create({
        email,
        password,
        username,
        role,
        isEmailVerified: false
    })

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryTokens();
    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false })

    try {
        await sendEmail({
            to: user.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
            )
        });
    } catch (error) {
        console.error("Email sending failed:", error.message);
    }


    const createduser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
    if (!createduser) {
        throw new ApiError(500, "Something  went wrong while registering user.")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, { user: createduser }, "User registered successfully. Verification email sent."));


})


const login = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Eamil is required.");
    }
    // const user = await User.findOne({ email });
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(400, "User doesnot exist.");
    }
    // const isPasswordvalid = await user.isPasswordCorrect();
    const isPasswordvalid = await user.isPasswordCorrect(password);

    if (!isPasswordvalid) {
        throw new ApiError(400, "Invalid Credentials.");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedinuser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");


    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, {
                user: loggedinuser,
                accessToken,
                refreshToken
            },
            "user Logged in successfully."
        )
    )

})



export { registerUser, login };








