const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// GET all tasks for logged-in user (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, project, search } = req.query;
    const filter = { userId: req.user.id };

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    if (project && project !== 'all') {
      filter.project = project;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name color')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// ADD a new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, deadline, priority, status, project } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = new Task({
      title,
      description: description || '',
      deadline: deadline ? new Date(deadline) : null,
      priority: priority || 'medium',
      status: status || 'todo',
      project: project || null,
      userId: req.user.id
    });

    await task.save();
    const populatedTask = await Task.findById(task._id).populate('project', 'name color');
    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: "Failed to add task" });
  }
});

// UPDATE a task
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = { ...req.body };

    // If status is being set to completed, also set completed flag
    if (updates.status === 'completed') {
      updates.completed = true;
    } else if (updates.status) {
      updates.completed = false;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true }
    ).populate('project', 'name color');

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task" });
  }
});

// TOGGLE task completed
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = !task.completed;
    task.status = task.completed ? 'completed' : 'todo';
    await task.save();

    const populatedTask = await Task.findById(task._id).populate('project', 'name color');
    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle task" });
  }
});

// DELETE a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;