import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    createProject,
    getProjects,
    getProjectDetails,
    joinProject,
    deleteProject
} from "../controllers/project.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getProjects).post(createProject);
router.route("/join").post(joinProject);
router.route("/:id").get(getProjectDetails).delete(deleteProject);

export default router;
