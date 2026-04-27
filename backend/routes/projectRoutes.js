const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// GET all projects for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 });

    // Get task counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id, userId: req.user.id });
        const completedTasks = await Task.countDocuments({ project: project._id, userId: req.user.id, status: 'completed' });
        return {
          ...project.toObject(),
          totalTasks,
          completedTasks
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// CREATE a project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = new Project({
      name,
      description: description || '',
      color: color || '#6366f1',
      userId: req.user.id
    });

    await project.save();
    res.status(201).json({ ...project.toObject(), totalTasks: 0, completedTasks: 0 });
  } catch (err) {
    res.status(500).json({ message: "Failed to create project" });
  }
});

// UPDATE a project
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, description, color },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const totalTasks = await Task.countDocuments({ project: project._id, userId: req.user.id });
    const completedTasks = await Task.countDocuments({ project: project._id, userId: req.user.id, status: 'completed' });

    res.json({ ...project.toObject(), totalTasks, completedTasks });
  } catch (err) {
    res.status(500).json({ message: "Failed to update project" });
  }
});

// DELETE a project (and unlink tasks)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Unlink tasks from deleted project (don't delete them)
    await Task.updateMany(
      { project: req.params.id, userId: req.user.id },
      { $set: { project: null } }
    );

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete project" });
  }
});

module.exports = router;
