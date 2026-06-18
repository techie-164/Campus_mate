import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { sendMessage, getMessages } from "../controllers/chat.controller.js";

const router = Router({ mergeParams: true });

router.use(verifyJWT);

router.route("/").get(getMessages).post(sendMessage);

export default router;
