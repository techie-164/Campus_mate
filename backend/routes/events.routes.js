import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent
} from "../controllers/events.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getEvents).post(createEvent);
router.route("/:id").patch(updateEvent).delete(deleteEvent);

export default router;
