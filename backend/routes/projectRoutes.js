import express from 'express';
import {
  addMaterial,
  createProject,
  deleteMaterial,
  deleteProject,
  getProjectById,
  getProjects,
} from '../controllers/projectController.js';

const router = express.Router();

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.delete('/:id', deleteProject);
router.post('/:id/materials', addMaterial);
router.delete('/:id/materials/:materialId', deleteMaterial);

export default router;
