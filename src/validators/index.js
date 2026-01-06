import { body } from "express-validator";



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

export {
    userRegisterValidator, userLoginValidator
}