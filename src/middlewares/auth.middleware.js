import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ProjectMember } from "../models/projectMember.models.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request.")
    }
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid Access Token.")
    }

});

const validateProjectPermission = (roles = []) => {
    asynchandler(async (req, res, next) => {
        const { projectId } = req.params;

        if (!projectId) {
            throw new ApiError(400, "Project ID is required.");
        }
        const project = await ProjectMember.findOne({
            project: Mongoose.Types.ObjectId(projectId),
            user: Mongoose.Types.ObjectId(req.user._id)
        });

        if (!project) {
            throw new ApiError(403, "Project not found.");
        }

        const givenRole = project.role;

        req.user.role = givenRole;

        if (roles.length && !roles.includes(givenRole)) {
            throw new ApiError(403, "Forbidden: You don't have permission to access this resource.");
        }
        next();

    });
}

export { verifyJWT, validateProjectPermission }

