const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// GET dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalTasks = await Task.countDocuments({ userId });
    const completedTasks = await Task.countDocuments({ userId, status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ userId, status: 'in-progress' });
    const todoTasks = await Task.countDocuments({ userId, status: 'todo' });
    const overdueTasks = await Task.countDocuments({
      userId,
      status: { $ne: 'completed' },
      deadline: { $lt: new Date() }
    });

    // Tasks by priority
    const tasksByPriority = {
      low: await Task.countDocuments({ userId, priority: 'low' }),
      medium: await Task.countDocuments({ userId, priority: 'medium' }),
      high: await Task.countDocuments({ userId, priority: 'high' }),
      urgent: await Task.countDocuments({ userId, priority: 'urgent' })
    };

    // Recent tasks (last 5)
    const recentTasks = await Task.find({ userId })
      .populate('project', 'name color')
      .sort({ updatedAt: -1 })
      .limit(5);

    // Projects count
    const totalProjects = await Project.countDocuments({ userId });

    // Completion rate
    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    res.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      totalProjects,
      completionRate,
      tasksByPriority,
      recentTasks
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;
