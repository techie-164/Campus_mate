import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    createSubject,
    getSubjects,
    getSubjectDetails,
    markAttendance,
    deleteSubject
} from "../controllers/attendance.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getSubjects).post(createSubject);
router.route("/:id").get(getSubjectDetails).delete(deleteSubject);
router.route("/:id/mark").post(markAttendance);

export default router;
