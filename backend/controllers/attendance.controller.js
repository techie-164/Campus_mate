import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { Attendance } from "../models/Attendance.model.js";
import { v4 as uuidv4 } from "uuid";

const createSubject = asynchandler(async (req, res) => {
    const { subject } = req.body;
    
    if (!subject) {
        throw new ApiError(400, "Subject name is required");
    }

    const newAttendance = await Attendance.create({
        attendance_id: uuidv4(),
        subject,
        user_id: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, newAttendance, "Subject created successfully"));
});

const getSubjects = asynchandler(async (req, res) => {
    const attendances = await Attendance.find({ user_id: req.user._id });
    return res.status(200).json(new ApiResponse(200, attendances, "Subjects fetched successfully"));
});

const getSubjectDetails = asynchandler(async (req, res) => {
    const { id } = req.params;
    const attendance = await Attendance.findOne({ attendance_id: id, user_id: req.user._id });
    
    if (!attendance) {
        throw new ApiError(404, "Subject not found");
    }
    
    return res.status(200).json(new ApiResponse(200, attendance, "Subject details fetched"));
});

const markAttendance = asynchandler(async (req, res) => {
    const { id } = req.params;
    const { date, flag } = req.body;

    if (!date || !flag) {
        throw new ApiError(400, "Date and flag (P, A, C) are required");
    }

    const attendance = await Attendance.findOne({ attendance_id: id, user_id: req.user._id });
    if (!attendance) {
        throw new ApiError(404, "Subject not found");
    }

    const existingRecordIndex = attendance.status.findIndex(
        (record) => new Date(record.date).toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );

    if (existingRecordIndex > -1) {
        // Update existing
        const oldFlag = attendance.status[existingRecordIndex].flag;
        attendance.status[existingRecordIndex].flag = flag;
        
        if (oldFlag === 'P' && flag !== 'P') attendance.total_present -= 1;
        if (oldFlag !== 'P' && flag === 'P') attendance.total_present += 1;
    } else {
        // Add new
        attendance.status.push({ date: new Date(date), flag });
        attendance.total_class += 1;
        if (flag === 'P') attendance.total_present += 1;
    }

    await attendance.save();

    return res.status(200).json(new ApiResponse(200, attendance, "Attendance marked"));
});

const deleteSubject = asynchandler(async (req, res) => {
    const { id } = req.params;
    await Attendance.findOneAndDelete({ attendance_id: id, user_id: req.user._id });
    return res.status(200).json(new ApiResponse(200, {}, "Subject deleted"));
});

export {
    createSubject,
    getSubjects,
    getSubjectDetails,
    markAttendance,
    deleteSubject
};
