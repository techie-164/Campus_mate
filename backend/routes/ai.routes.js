import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    chatWithAI,
    getChatHistory,
    clearChatHistory
} from "../controllers/ai.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getChatHistory).post(chatWithAI).delete(clearChatHistory);

export default router;
