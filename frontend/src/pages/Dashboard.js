import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail");

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        'http://localhost:5000/api/tasks',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(res.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        navigate('/');
      } else {
        setError("Failed to fetch tasks");
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/');
    } else {
      fetchTasks();
    }
  }, [token, navigate, fetchTasks]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/tasks',
        { title, description, deadline: deadline ? new Date(deadline) : null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setDescription('');
      setDeadline('');
      setError('');
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add task");
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/tasks/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  const toggleTask = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/tasks/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate('/');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2>📋 Dashboard</h2>
          {userEmail && <p className="user-email">Logged in as: {userEmail}</p>}
        </div>
        <button className="btn-logout" onClick={logout}>Logout</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Add Task Form */}
      <form className="task-form" onSubmit={addTask}>
        <h3>Add New Task</h3>
        <input
          placeholder="Task Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <button type="submit" className="btn-primary">Add Task</button>
      </form>

      {/* Task List */}
      <div className="task-list">
        <h3>Your Tasks ({tasks.length})</h3>

        {loading && <p className="loading-text">Loading tasks...</p>}

        {!loading && tasks.length === 0 && (
          <p className="empty-text">No tasks yet. Add your first task above!</p>
        )}

        {tasks.map(t => (
          <div className={`task-card ${t.completed ? 'completed' : ''}`} key={t._id}>
            <div className="task-content">
              <div className="task-header">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleTask(t._id)}
                  className="task-checkbox"
                />
                <h4 className={t.completed ? 'task-done' : ''}>{t.title}</h4>
              </div>
              {t.description && <p className="task-desc">{t.description}</p>}
              {t.deadline && (
                <p className="task-deadline">📅 {formatDate(t.deadline)}</p>
              )}
            </div>
            <button className="btn-delete" onClick={() => deleteTask(t._id)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;