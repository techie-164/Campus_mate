import crypto from 'crypto';
import mongoose from 'mongoose';
import { Message } from '../models/Message.js';
import { Project } from '../models/Project.js';

const memory = {
  projects: [],
  messages: [],
};

const isMongoConnected = () => mongoose.connection.readyState === 1;

const toId = (value) => value?.toString();

const serializeMaterial = (material) => {
  const object = material.toObject ? material.toObject() : material;

  return {
    ...object,
    id: toId(object._id || object.id),
  };
};

const serializeProject = (project) => {
  const object = project.toObject ? project.toObject({ virtuals: true }) : project;

  return {
    ...object,
    id: toId(object._id || object.id),
    materials: (object.materials || []).map(serializeMaterial),
  };
};

const createMemoryProject = ({ title, description = '', ownerName = 'Anonymous' }) => {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title,
    description,
    ownerName,
    collaborators: [],
    tasks: [],
    materials: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
};

export const getStorageMode = () => (isMongoConnected() ? 'mongodb' : 'memory');

export const getProjects = async () => {
  if (isMongoConnected()) {
    const projects = await Project.find().sort({ updatedAt: -1 });
    return projects.map(serializeProject);
  }

  return [...memory.projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

export const getProjectById = async (id) => {
  if (isMongoConnected()) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const project = await Project.findById(id);
    return project ? serializeProject(project) : null;
  }

  return memory.projects.find((project) => project.id === id) || null;
};

export const createProject = async ({ title, description, ownerName }) => {
  if (isMongoConnected()) {
    const project = await Project.create({ title, description, ownerName });
    return serializeProject(project);
  }

  const project = createMemoryProject({ title, description, ownerName });
  memory.projects.unshift(project);
  return project;
};

export const deleteProject = async (id) => {
  if (isMongoConnected()) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const project = await Project.findByIdAndDelete(id);
    if (!project) return null;
    await Message.deleteMany({ projectId: id });
    return serializeProject(project);
  }

  const index = memory.projects.findIndex((project) => project.id === id);
  if (index === -1) return null;

  const [project] = memory.projects.splice(index, 1);
  memory.messages = memory.messages.filter((message) => message.projectId !== id);
  return project;
};

export const addMaterial = async (projectId, data) => {
  if (isMongoConnected()) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return null;
    const project = await Project.findById(projectId);
    if (!project) return null;

    project.materials.unshift(data);
    await project.save();

    return {
      project: serializeProject(project),
      material: serializeProject(project).materials[0],
    };
  }

  const project = memory.projects.find((item) => item.id === projectId);
  if (!project) return null;

  const material = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
  };

  project.materials.unshift(material);
  project.updatedAt = new Date().toISOString();

  return { project, material };
};

export const deleteMaterial = async (projectId, materialId) => {
  if (isMongoConnected()) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return null;
    const project = await Project.findById(projectId);
    if (!project) return null;

    const material = project.materials.id(materialId);
    if (!material) return null;

    material.deleteOne();
    await project.save();

    return serializeProject(project);
  }

  const project = memory.projects.find((item) => item.id === projectId);
  if (!project) return null;

  const originalLength = project.materials.length;
  project.materials = project.materials.filter((material) => material.id !== materialId);

  if (project.materials.length === originalLength) return null;

  project.updatedAt = new Date().toISOString();
  return project;
};

export const addMessage = async ({ projectId, username, text }) => {
  if (isMongoConnected()) {
    const message = await Message.create({
      projectId,
      username,
      text,
      timestamp: new Date(),
    });

    return {
      id: message._id.toString(),
      projectId,
      username: message.username,
      text: message.text,
      timestamp: message.timestamp,
    };
  }

  const message = {
    id: crypto.randomUUID(),
    projectId,
    username,
    text,
    timestamp: new Date().toISOString(),
  };

  memory.messages.push(message);
  return message;
};

export const getMessages = async (projectId) => {
  if (isMongoConnected()) {
    const messages = await Message.find({ projectId })
      .sort({ timestamp: 1 })
      .limit(100);

    return messages.map((message) => ({
      id: message._id.toString(),
      projectId,
      username: message.username,
      text: message.text,
      timestamp: message.timestamp,
    }));
  }

  return memory.messages
    .filter((message) => message.projectId === projectId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .slice(-100);
};
