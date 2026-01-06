// import { validationResult } from "express-validator";
// import { ApiError } from "../utils/api-error.js";

// export const validate = (req, res, next) => {
//     const errors = validationResult(req);

//     if (errors.isEmpty()) {
//         return next();
//     }

//     const extractedErrors = [];

//     errors.array().forEach(err => {
//         extractedErrors.push({
//             [err.path]: err.msg
//         });
//     });

//     throw new ApiError(400, "Validation failed", extractedErrors);
// };
import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    const extractedErrors = errors.array().map(err => ({
        [err.path]: err.msg
    }));

    return next(
        new ApiError(400, "Validation failed", extractedErrors)
    );
};
