const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// GET all tasks for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// ADD a new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = new Task({
      title,
      description: description || '',
      deadline: deadline ? new Date(deadline) : null,
      userId: req.user.id
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to add task" });
  }
});

// UPDATE a task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

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
    await task.save();
    res.json(task);
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