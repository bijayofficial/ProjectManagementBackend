import { Router } from "express";
import { login, registerUser } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator , userLoginValidator} from "../validators/index.js";


const router = Router();

router.route("/register").post(
    userRegisterValidator(), // collect all the date validate  it =>
    validate, // pass it to the middleware then call for controller
    registerUser);

router.route("/login").post(
    userLoginValidator(), // collect all the date validate  it =>
    validate, // pass it to the middleware then call for controller
    login)
export default router;