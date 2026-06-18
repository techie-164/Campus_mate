import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { AiChat } from "../models/AiChat.model.js";
import { Attendance } from "../models/Attendance.model.js";
import { Event } from "../models/Events.model.js";
import { Project } from "../models/Project.model.js";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const getSystemContext = async (userId) => {
    try {
        const attendance = await Attendance.find({ user_id: userId });
        const events = await Event.find({ user_id: userId, target_date: { $gte: new Date() } });
        const projects = await Project.find({ members: userId });

        let context = "You are CampusMate AI, a helpful student productivity mentor. Here is the student's current data:\n\n";
        
        if (attendance.length > 0) {
            context += "ATTENDANCE:\n";
            attendance.forEach(a => {
                const percent = a.total_class > 0 ? ((a.total_present / a.total_class) * 100).toFixed(1) : 0;
                context += `- ${a.subject}: ${percent}% (${a.total_present}/${a.total_class} classes attended)\n`;
            });
        }

        if (events.length > 0) {
            context += "\nUPCOMING EVENTS & TASKS:\n";
            events.forEach(e => {
                context += `- ${e.title} due on ${new Date(e.target_date).toDateString()}\n`;
            });
        }

        if (projects.length > 0) {
            context += "\nACTIVE PROJECTS:\n";
            projects.forEach(p => {
                context += `- ${p.project_name}\n`;
            });
        }

        context += "\nUse this information to provide personalized advice, remind them of deadlines, and motivate them. If they ask a general question, answer it normally.";
        return context;
    } catch {
        return "You are CampusMate AI, a helpful student productivity mentor.";
    }
}

const chatWithAI = asynchandler(async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        throw new ApiError(400, "Message is required");
    }

    if (!process.env.OPENAI_API_KEY) {
        throw new ApiError(500, "OpenAI API key is missing. Please add it to your .env file.");
    }

    let chatHistory = await AiChat.findOne({ user_id: req.user._id });
    
    if (!chatHistory) {
        chatHistory = await AiChat.create({
            user_id: req.user._id,
            messages: []
        });
    }

    // Add user message to history
    chatHistory.messages.push({ role: "user", content: message });
    
    const systemContext = await getSystemContext(req.user._id);

    const model = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-3.5-turbo",
        temperature: 0.7
    });

    const prompt = PromptTemplate.fromTemplate(
        `{system_context}
        
        Recent conversation history:
        {history}
        
        User: {message}
        Assistant:`
    );

    const historyText = chatHistory.messages.slice(-5).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    let response;
    try {
        response = await chain.invoke({
            system_context: systemContext,
            history: historyText,
            message
        });
    } catch (error) {
        const rawMessage = error.message || "";
        const statusCode = error.status || error.statusCode || (rawMessage.startsWith("429") ? 429 : 500);
        const message = statusCode === 429
            ? "OpenAI quota exceeded. Please check your OpenAI billing or use an API key with available credits."
            : rawMessage || "AI request failed";
        throw new ApiError(statusCode, message);
    }

    chatHistory.messages.push({ role: "assistant", content: response });
    await chatHistory.save();

    return res.status(200).json(new ApiResponse(200, { response, messages: chatHistory.messages }, "AI Response"));
});

const getChatHistory = asynchandler(async (req, res) => {
    const chatHistory = await AiChat.findOne({ user_id: req.user._id });
    const messages = chatHistory ? chatHistory.messages : [];
    return res.status(200).json(new ApiResponse(200, messages, "Chat history fetched"));
});

const clearChatHistory = asynchandler(async (req, res) => {
    await AiChat.findOneAndDelete({ user_id: req.user._id });
    return res.status(200).json(new ApiResponse(200, [], "Chat history cleared"));
});

export {
    chatWithAI,
    getChatHistory,
    clearChatHistory
};
