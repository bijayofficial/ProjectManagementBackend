import { Router } from "express";
import { login, logout, registerUser, currentUser, verifyEmail , resendVerifyEmail,  refreshAccessToken} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator, userLoginValidator } from "../validators/index.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(
    userRegisterValidator(), // collect all the date validate  it =>
    validate, // pass it to the middleware then call for controller
    registerUser);

router.route("/login").post(
    userLoginValidator(), // collect all the date validate  it =>
    validate, // pass it to the middleware then call for controller
    login)


router.route("/logout").post(
    verifyJWT,
    logout)


router.route("/currentuser").post(
    verifyJWT,
    currentUser)

router.route("/verifyEmail").post(
    verifyJWT,
    verifyEmail)

router.route("/verifyEmail").post(
    verifyJWT,
    resendVerifyEmail)

router.route("/verifyEmail").post(
    // verifyJWT,
    refreshAccessToken)


export default router;