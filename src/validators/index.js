import { body } from "express-validator";
import { AvailableUserRole } from "../utils/constants.js";

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),

        body("username")
            .trim()
            .notEmpty().withMessage("Username is required")
            .isLength({ min: 3 }).withMessage("Username must be at least 3 characters")
            .toLowerCase(),

        body("password")
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

        body("fullName")
            .optional()
            .trim()
            .notEmpty().withMessage("Full name cannot be empty")
    ];
};

const userLoginValidator = () => {
    return [
        body("email")
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),

        body("password")
            .notEmpty().withMessage("Password is required")
    ];
};


const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old password is required"),
        body("newPassword").notEmpty().withMessage("New password  is required")
        // check whether the new  and old password is  same ?
    ];
};

const userForgotPasswordValidator = () => {
    return [
        body("email")
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),
    ]
}

const userResetForgotPassword = () => {
    return [
        body("newPassword")
            .notEmpty()
            .withMessage("New password  is required.")
    ]
}

const createProjectValidator = () => {
    return [
        body("name")
            .notEmpty().withMessage("Project name is required.")
            .isLength({ min: 3 }).withMessage("Project name must be at least 3 characters."),
        body("description")
            .optional()
            .trim()
    ]
}

const addMembersToProjectValidator = () => {
    return [
        body("email")
            .notEmpty().withMessage("Email is required.")
            .isEmail().withMessage("Email is invalid."),
        body("role")
            .notEmpty().withMessage("Role is required.")
            .isIn(AvailableUserRole).withMessage("Role is invalid.")
    ]
}






export {
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPassword,
    createProjectValidator,
    addMembersToProjectValidator

}