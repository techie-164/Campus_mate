import * as store from '../store/collaborationStore.js';

export const getProjects = async (req, res, next) => {
  try {
    res.json(await store.getProjects());
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await store.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const title = req.body.title?.trim();

    if (!title) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const project = await store.createProject({
      title,
      description: req.body.description?.trim() || '',
      ownerName: req.body.ownerName?.trim() || 'Anonymous',
    });

    req.app.get('io')?.emit('project-created', project);

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await store.deleteProject(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    req.app.get('io')?.emit('project-deleted', { id: req.params.id });

    res.json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

export const addMaterial = async (req, res, next) => {
  try {
    const title = req.body.title?.trim() || req.body.fileName?.trim();
    if (!title) {
      return res.status(400).json({ message: 'Material title or file name is required' });
    }

    const result = await store.addMaterial(req.params.id, {
      title,
      desc: req.body.desc?.trim() || '',
      fileName: req.body.fileName || null,
      fileType: req.body.fileType || null,
      fileSize: req.body.fileSize || null,
      fileData: req.body.fileData || null,
      createdBy: req.body.createdBy?.trim() || 'Anonymous',
    });

    if (!result) {
      return res.status(404).json({ message: 'Project not found' });
    }

    req.app.get('io')?.to(`project-${req.params.id}`).emit('material-added', {
      projectId: req.params.id,
      material: result.material,
    });
    req.app.get('io')?.emit('project-updated', result.project);

    res.status(201).json(result.material);
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const project = await store.deleteMaterial(req.params.id, req.params.materialId);
    if (!project) {
      return res.status(404).json({ message: 'Project or material not found' });
    }

    req.app.get('io')?.to(`project-${req.params.id}`).emit('material-deleted', {
      projectId: req.params.id,
      materialId: req.params.materialId,
    });
    req.app.get('io')?.emit('project-updated', project);

    res.json({ id: req.params.materialId });
  } catch (error) {
    next(error);
  }
};
