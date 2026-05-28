import { Router } from "express";
import { login, logout, registerUser, currentUser, verifyEmail, resendVerifyEmail, refreshAccessToken, forgotPasswordRequest, resetForgotPassword, changeCurrentPassword } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator, userLoginValidator, userForgotPasswordValidator, userResetForgotPassword, userChangeCurrentPasswordValidator } from "../validators/index.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

// unsecured Route
router.route("/register").post(
    userRegisterValidator(), // collect all the date validate  it =>
    validate, // pass it to the middleware then call for controller
    registerUser);

router.route("/login").post(
    userLoginValidator(), // collect all the date validate  it =>
    validate, // pass it to the middleware then call for controller
    login)

router.route("/verify-email/:verificationToken")
    .get(verifyEmail);

router.route("/refresh-token")
    .post(refreshAccessToken);

router.route("/forgot-password")
    .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);

router.route("/reset-password/:resetToken")
    .post(userResetForgotPassword(), validate, resetForgotPassword);


// secured Route
router.route("/logout").post(
    verifyJWT,
    logout)


router.route("/currentuser").post(
    verifyJWT,
    currentUser)

router.route("/change-password")
    .post(userChangeCurrentPasswordValidator(), validate, changeCurrentPassword)

// router.route("/verifyEmail").post(
//     verifyJWT,
//     verifyEmail)

router.route("/resend-email-verification").post(
    verifyJWT,
    resendVerifyEmail);

// router.route("/verifyEmail").post(
//     // verifyJWT,
//     refreshAccessToken)


export default router;