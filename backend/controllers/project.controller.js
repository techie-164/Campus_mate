import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { Project } from "../models/Project.model.js";
import { v4 as uuidv4 } from "uuid";

const createProject = asynchandler(async (req, res) => {
    const { project_name, description } = req.body;
    
    if (!project_name) {
        throw new ApiError(400, "Project name is required");
    }

    const newProject = await Project.create({
        project_id: uuidv4().slice(0, 8),
        project_name,
        description: description || "",
        owner_id: req.user._id,
        members: [req.user._id]
    });

    return res.status(201).json(new ApiResponse(201, newProject, "Project created successfully"));
});

const getProjects = asynchandler(async (req, res) => {
    const projects = await Project.find({ members: req.user._id })
        .populate("owner_id", "name username email")
        .populate("members", "name username email");
        
    return res.status(200).json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

const getProjectDetails = asynchandler(async (req, res) => {
    const { id } = req.params;
    const project = await Project.findOne({ project_id: id, members: req.user._id })
        .populate("owner_id", "name username email")
        .populate("members", "name username email");
    
    if (!project) {
        throw new ApiError(404, "Project not found or you are not a member");
    }
    
    return res.status(200).json(new ApiResponse(200, project, "Project details fetched"));
});

const joinProject = asynchandler(async (req, res) => {
    const { project_id } = req.body;
    
    if (!project_id) {
        throw new ApiError(400, "Project ID is required");
    }

    const project = await Project.findOne({ project_id });
    
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (project.members.includes(req.user._id)) {
        return res.status(200).json(new ApiResponse(200, project, "Already a member of this project"));
    }

    project.members.push(req.user._id);
    await project.save();

    return res.status(200).json(new ApiResponse(200, project, "Joined project successfully"));
});

const deleteProject = asynchandler(async (req, res) => {
    const { id } = req.params;
    
    const project = await Project.findOne({ project_id: id });
    
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    
    if (project.owner_id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the project owner can delete the project");
    }

    await Project.findOneAndDelete({ project_id: id });
    
    return res.status(200).json(new ApiResponse(200, {}, "Project deleted"));
});

export {
    createProject,
    getProjects,
    getProjectDetails,
    joinProject,
    deleteProject
};
