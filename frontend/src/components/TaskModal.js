import { useState } from 'react';

function TaskModal({ task, projects, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'todo',
    deadline: task?.deadline ? task.deadline.slice(0, 10) : '',
    project: task?.project?._id || task?.project || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, deadline: form.deadline ? new Date(form.deadline) : null, project: form.project || null });
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'Create New Task'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Task Title *</label>
              <input placeholder="Enter task title" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input placeholder="Add description (optional)" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Priority</label>
                <select className="filter-select" style={{width:'100%',padding:'12px'}} value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="filter-select" style={{width:'100%',padding:'12px'}} value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Project</label>
                <select className="filter-select" style={{width:'100%',padding:'12px'}} value={form.project} onChange={e => set('project', e.target.value)}>
                  <option value="">No Project</option>
                  {projects?.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{task ? 'Update Task' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default TaskModal;
