import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { Chat } from "../models/Chat.model.js";
import { Project } from "../models/Project.model.js";
import { v4 as uuidv4 } from "uuid";
import { getIO } from "../utils/socket.js";

const sendMessage = asynchandler(async (req, res) => {
    const { project_id } = req.params;
    const { text } = req.body;
    
    if (!text) {
        throw new ApiError(400, "Message text is required");
    }

    const project = await Project.findOne({ project_id });
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.members.includes(req.user._id)) {
        throw new ApiError(403, "You are not a member of this project");
    }

    const newChat = await Chat.create({
        chat_id: uuidv4(),
        project_id: project._id,
        sender_id: req.user._id,
        text
    });

    const populatedChat = await Chat.findById(newChat._id).populate("sender_id", "name username avatar");

    // Emit via Socket.io
    const io = getIO();
    io.to(`project-${project.project_id}`).emit("new-message", populatedChat);

    return res.status(201).json(new ApiResponse(201, populatedChat, "Message sent successfully"));
});

const getMessages = asynchandler(async (req, res) => {
    const { project_id } = req.params;
    
    const project = await Project.findOne({ project_id });
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.members.includes(req.user._id)) {
        throw new ApiError(403, "You are not a member of this project");
    }

    const messages = await Chat.find({ project_id: project._id })
        .populate("sender_id", "name username avatar")
        .sort({ createdAt: 1 });

    return res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

export {
    sendMessage,
    getMessages
};
