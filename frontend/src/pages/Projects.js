import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  const { token } = useAuth();
  const { addToast } = useToast();
  const headers = { Authorization: `Bearer ${token}` };
  const colors = ['#6366f1','#06b6d4','#22c55e','#f59e0b','#ef4444','#f43f5e','#8b5cf6','#ec4899','#14b8a6','#f97316'];

  const fetchProjects = useCallback(async () => {
    try { const res = await axios.get('/api/projects', { headers }); setProjects(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openEdit = (p) => { setEditProject(p); setForm({ name: p.name, description: p.description || '', color: p.color }); setShowForm(true); };
  const openNew = () => { setEditProject(null); setForm({ name: '', description: '', color: '#6366f1' }); setShowForm(true); };

  const saveProject = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      if (editProject) {
        await axios.put(`/api/projects/${editProject._id}`, form, { headers });
        addToast('Project updated', 'success');
      } else {
        await axios.post('/api/projects', form, { headers });
        addToast('Project created', 'success');
      }
      setShowForm(false); setEditProject(null); fetchProjects();
    } catch (err) { addToast('Failed to save project', 'error'); }
  };

  const deleteProject = async (id) => {
    try { await axios.delete(`/api/projects/${id}`, { headers }); addToast('Project deleted', 'success'); fetchProjects(); }
    catch (err) { addToast('Failed to delete project', 'error'); }
  };

  return (
    <Layout title="Projects" subtitle={`${projects.length} projects`}>
      <div className="tasks-header">
        <h3>All Projects</h3>
        <button className="btn btn-primary" onClick={openNew}>+ New Project</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{editProject ? 'Edit Project' : 'New Project'}</h3><button className="btn-icon" onClick={() => setShowForm(false)}>✕</button></div>
            <form onSubmit={saveProject}>
              <div className="modal-body">
                <div className="form-group"><label>Project Name *</label><input placeholder="Enter project name" value={form.name} onChange={e => setForm(p=>({...p, name: e.target.value}))} required /></div>
                <div className="form-group"><label>Description</label><input placeholder="Project description" value={form.description} onChange={e => setForm(p=>({...p, description: e.target.value}))} /></div>
                <div className="form-group"><label>Color</label>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {colors.map(c => (<div key={c} onClick={() => setForm(p=>({...p, color: c}))} style={{width:32,height:32,borderRadius:8,background:c,cursor:'pointer',border: form.color===c?'3px solid var(--text)':'3px solid transparent',transition:'border .2s'}} />))}
                  </div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editProject ? 'Update' : 'Create'}</button></div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> :
        projects.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📁</div><h4>No projects yet</h4><p>Create your first project to organize your tasks</p><button className="btn btn-primary" onClick={openNew}>+ Create Project</button></div>
        ) : (
          <div className="projects-grid">
            {projects.map(p => {
              const pct = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0;
              return (
                <div className="project-card" key={p._id}>
                  <div className="color-stripe" style={{background: p.color}} />
                  <h4>{p.name}</h4>
                  {p.description && <p className="project-desc">{p.description}</p>}
                  <div className="project-stats">
                    <span className="task-count">{p.totalTasks} tasks · {p.completedTasks} done</span>
                    <span style={{fontSize:13,fontWeight:700,color: p.color}}>{pct}%</span>
                  </div>
                  <div className="project-progress"><div className="fill" style={{width:`${pct}%`, background: p.color}} /></div>
                  <div style={{display:'flex',gap:4,marginTop:12,justifyContent:'flex-end'}}>
                    <button className="btn-icon" onClick={() => openEdit(p)}>✏️</button>
                    <button className="btn-icon" onClick={() => deleteProject(p._id)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </Layout>
  );
}
export default Projects;
