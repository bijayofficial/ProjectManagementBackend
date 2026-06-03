import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js"
import jwt from "jsonwebtoken";

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


const logout = asyncHandler(async (req, res) => {
    const user = req.user;
    console.log(user);

    const loggedinuser = await User.findByIdAndUpdate(user._id, {
        $set: {
            refreshToken: ""
        }
    },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).
        clearCookie("refreshToken", options).json(
            new ApiResponse(200, "User Logged out.")
        )

})

const currentUser = asyncHandler(async (req, res) => {
    console.log(req.user)
    return res.status(200).json(
        new ApiResponse(200, req.user, "User fetched successfully.")
    )
})


const resendVerifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.param;

    if (!verificationToken) {
        throw new ApiError(400, "Email verification token is  required.")
    }

    let hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() }
    })
    if (!user) {
        throw new ApiError(400, "Token is invalid or expired!")
    }

    user.emailVerificationToken = undefined
    user.emailVerificationExpiry = undefined

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {
        isEmailVerified: true,
        message: "Email is verified."
    }))


})

const verifyEmail = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "user does not exist.");
    }

    if (user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified.");
    }
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

    return res.status(200).json(new ApiResponse(200, {}, "Mail  has  been sent to your Email ID."))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingrefreshtoken = req.cookie.refreshToken || req.body.refreshAccessToken;

    if (!incomingrefreshtoken) {
        throw new ApiError(401, "Unauthorized access.")
    }
    try {
        const decodedToken = jwt.verify(incomingrefreshtoken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token.")
        }

        if (incomingrefreshtoken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired.")
        }



        const options = {
            httpOnly: true,
            secure: true
        };


        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        user.refreshToken = refreshToken;
        //  refresh token again save to DB
        await user.save();
        // accesstoken sent to frontend
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refresfToken, options).json(
            new ApiResponse(200,
                {
                    accessToken,
                    refreshToken: refreshToken
                },
                "Access token refreshed."

            )
        )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token.");
    }
})


const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "user doesn't exist.")
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryTokens();


    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false })

    await sendEmail({
        to: user.email,
        subject: "Password reset request.",
        mailgenContent: forgotPasswordMailgenContent(
            user.username,
            `${req.protocol}://${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
        )
    });


    res.status(200).json(
        new ApiResponse(200, {}, "Password reset mail has been sent on your mail id.")
    )
})

const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;
    let hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");


    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: {
            $gt: Date.now()
        }
    })

    if (!user) {
        throw new ApiError(489, "Token is invalid or expired")
    }

    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successfully.")
    )
})




const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;


    const user = await User.findById(req.user?._id);

    const ispasswordvalid = await user.isPasswordCorrect(oldPassword)

    if (!ispasswordvalid) {
        throw new ApiError(400, "Invalid old Password.")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });



    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully.")
    )

})

export { registerUser, login, logout, currentUser, verifyEmail, resendVerifyEmail, refreshAccessToken, resetForgotPassword, changeCurrentPassword, forgotPasswordRequest };








