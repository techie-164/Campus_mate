import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { Event } from "../models/Events.model.js";
import { v4 as uuidv4 } from "uuid";

const createEvent = asynchandler(async (req, res) => {
    const { title, description, target_date } = req.body;
    
    if (!title || !target_date) {
        throw new ApiError(400, "Title and target date are required");
    }

    const newEvent = await Event.create({
        id: uuidv4(),
        title,
        description: description || "",
        target_date: new Date(target_date),
        user_id: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, newEvent, "Event/Task created successfully"));
});

const getEvents = asynchandler(async (req, res) => {
    const events = await Event.find({ user_id: req.user._id }).sort({ target_date: 1 });
    return res.status(200).json(new ApiResponse(200, events, "Events fetched successfully"));
});

const updateEvent = asynchandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, target_date, complete } = req.body;

    const event = await Event.findOneAndUpdate(
        { id, user_id: req.user._id },
        { 
            $set: { 
                ...(title && { title }), 
                ...(description !== undefined && { description }), 
                ...(target_date && { target_date: new Date(target_date) }),
                ...(complete !== undefined && { complete })
            } 
        },
        { new: true }
    );

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    return res.status(200).json(new ApiResponse(200, event, "Event updated"));
});

const deleteEvent = asynchandler(async (req, res) => {
    const { id } = req.params;
    await Event.findOneAndDelete({ id, user_id: req.user._id });
    return res.status(200).json(new ApiResponse(200, {}, "Event deleted"));
});

export {
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent
};
