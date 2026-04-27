import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import TaskModal from '../components/TaskModal';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', search: '' });
  const { token } = useAuth();
  const { addToast } = useToast();
  const headers = { Authorization: `Bearer ${token}` };

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      const res = await axios.get('/api/tasks', { headers, params });
      setTasks(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token, filters]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get('/api/projects', { headers });
      setProjects(res.data);
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => { fetchTasks(); fetchProjects(); }, [fetchTasks, fetchProjects]);

  const saveTask = async (data) => {
    try {
      if (editTask) {
        await axios.put(`/api/tasks/${editTask._id}`, data, { headers });
        addToast('Task updated successfully', 'success');
      } else {
        await axios.post('/api/tasks', data, { headers });
        addToast('Task created successfully', 'success');
      }
      setShowModal(false); setEditTask(null); fetchTasks();
    } catch (err) { addToast(err.response?.data?.message || 'Failed to save task', 'error'); }
  };

  const toggleTask = async (id) => {
    try {
      await axios.patch(`/api/tasks/${id}/toggle`, {}, { headers });
      fetchTasks();
    } catch (err) { addToast('Failed to update task', 'error'); }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`, { headers });
      addToast('Task deleted', 'success');
      fetchTasks();
    } catch (err) { addToast('Failed to delete task', 'error'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const isOverdue = (d) => d && new Date(d) < new Date() ;

  return (
    <Layout title="Tasks" subtitle={`${tasks.length} total tasks`}>
      <div className="tasks-header">
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input placeholder="Search tasks..." value={filters.search} onChange={e => setFilters(p=>({...p, search: e.target.value}))} />
          </div>
          <select className="filter-select" value={filters.status} onChange={e => setFilters(p=>({...p, status: e.target.value}))}>
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select className="filter-select" value={filters.priority} onChange={e => setFilters(p=>({...p, priority: e.target.value}))}>
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>+ New Task</button>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> :
        tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h4>No tasks found</h4>
            <p>Create your first task to get started with project management</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Task</button>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map(t => (
              <div className={`task-card ${t.status === 'completed' ? 'completed' : ''}`} key={t._id}>
                <button className={`task-checkbox ${t.status === 'completed' ? 'checked' : ''}`} onClick={() => toggleTask(t._id)}>
                  {t.status === 'completed' ? '✓' : ''}
                </button>
                <div className="task-info">
                  <h4 className={t.status === 'completed' ? 'done' : ''}>
                    {t.title}
                    <span className={`priority-badge priority-${t.priority}`}>{t.priority}</span>
                  </h4>
                  <div className="task-meta">
                    <span className={`status-badge status-${t.status}`}>{t.status === 'in-progress' ? 'In Progress' : t.status}</span>
                    {t.deadline && <span style={isOverdue(t.deadline) && t.status !== 'completed' ? {color:'var(--danger)'} : {}}>📅 {formatDate(t.deadline)}</span>}
                    {t.project && <span className="project-tag"><span className="dot" style={{background: t.project.color}} />{t.project.name}</span>}
                    {t.description && <span>💬 {t.description.slice(0, 40)}{t.description.length > 40 ? '...' : ''}</span>}
                  </div>
                </div>
                <div className="task-actions">
                  <button className="btn-icon" onClick={() => { setEditTask(t); setShowModal(true); }} title="Edit">✏️</button>
                  <button className="btn-icon" onClick={() => deleteTask(t._id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

      {showModal && <TaskModal task={editTask} projects={projects} onSave={saveTask} onClose={() => { setShowModal(false); setEditTask(null); }} />}
    </Layout>
  );
}
export default Tasks;
