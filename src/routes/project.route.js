import { Router } from "express";
import {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMembersToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember
} from "../controllers/project.controller.js"
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js";
import { createProjectValidator } from "../validators/index.js";
import { AvailableUserRole, UserRolersEnum } from "../utils/constants.js";


const router = Router();
router.use(verifyJWT);

router.route("/")
    .get(getProjects)
    .post(createProjectValidator(), validate, createProject);

router.route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), getProjectById)
    .put(validateProjectPermission([UserRolersEnum.ADMIN, UserRolersEnum.MEMBER]), createProjectValidator(), validate, updateProject)
    .delete(validateProjectPermission([UserRolersEnum.ADMIN]), deleteProject);


router.route("/:projectId/members/:memberId")
    .get(validateProjectPermission(AvailableUserRole), getProjectMembers)
    .put(validateProjectPermission([UserRolersEnum.ADMIN]), addMembersToProjectValidator(), validate, updateMemberRole)
    .delete(validateProjectPermission([UserRolersEnum.ADMIN]), deleteMember);

export default router;