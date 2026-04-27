import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  const [alert, setAlert] = useState(null);
  
  // Admin Assign Project Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', deadline: '' });

  const fetchRequests = useCallback(async () => {
    try {
      const endpoint = user.role === 'company_admin' ? '/api/requests/company-requests' : '/api/requests/my-requests';
      const res = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, user.role]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  }

  // --- Admin Actions ---
  const handleAdminReject = async (id) => {
    try {
      await axios.patch(`/api/requests/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showAlert('success', 'Candidate request rejected.');
      fetchRequests();
    } catch (err) {
      showAlert('error', 'Failed to reject request.');
    }
  };

  const openAssignModal = (req) => {
    setSelectedRequest(req);
    // Default deadline to 3 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    setProjectForm({ 
      title: '', 
      description: '', 
      deadline: defaultDate.toISOString().slice(0, 16) 
    });
    setAssignModalOpen(true);
  };

  const handleAdminOffer = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/api/requests/${selectedRequest._id}/offer`, {
        projectTitle: projectForm.title,
        projectDescription: projectForm.description,
        projectDeadline: projectForm.deadline
      }, { headers: { Authorization: `Bearer ${token}` } });
      showAlert('success', 'Project successfully offered to candidate.');
      setAssignModalOpen(false);
      fetchRequests();
    } catch (err) {
      showAlert('error', 'Failed to assign project.');
    }
  };

  // --- Candidate Actions ---
  const handleCandidateAction = async (id, action) => {
    try {
      await axios.patch(`/api/requests/${id}/candidate-action`, { action }, { headers: { Authorization: `Bearer ${token}` } });
      showAlert('success', `Successfully updated project status.`);
      fetchRequests();
    } catch (err) {
      showAlert('error', 'Failed to update project status.');
    }
  };

  const getBadgeClass = (status) => {
    const map = {
      'Pending': 'badge-pending',
      'Offered': 'badge-admin',
      'In_Progress': 'badge-admin',
      'Completed': 'badge-accepted',
      'Rejected': 'badge-rejected',
      'Candidate_Rejected': 'badge-rejected'
    };
    return map[status] || 'badge-pending';
  };

  const formatStatus = (status) => {
    const map = {
      'Pending': '⏳ Pending Review',
      'Offered': '🎯 Project Offered',
      'In_Progress': '💻 In Progress',
      'Completed': '✅ Completed',
      'Rejected': '❌ Rejected by Company',
      'Candidate_Rejected': '❌ Declined by You'
    };
    return map[status] || status;
  };

  const isOverdue = (deadline) => {
    return new Date() > new Date(deadline);
  };

  // Global Warnings for Candidates
  const rejectedRequestsCount = requests.filter(r => r.status === 'Rejected').length;
  const overdueRequests = requests.filter(r => r.status === 'In_Progress' && isOverdue(r.projectDeadline));

  return (
    <>
      <Navbar />
      <div className="container">
        
        {alert && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            <span style={{fontSize: '1.25rem'}}>{alert.type === 'success' ? '✅' : '⚠️'}</span> 
            {alert.message}
          </div>
        )}
        
        {/* Strict Overdue Warning */}
        {user.role === 'user' && overdueRequests.length > 0 && (
          <div className="alert alert-error" style={{padding: '1.5rem', marginBottom: '1.5rem', alignItems: 'flex-start', background: '#7f1d1d', color: 'white', borderColor: '#450a0a'}}>
            <span style={{fontSize: '2.5rem', marginTop: '-0.4rem'}}>🚨</span>
            <div>
              <strong style={{fontSize: '1.2rem', display: 'block', marginBottom: '0.25rem'}}>STRICT WARNING</strong>
              <p>You are not working properly. Please complete your assigned tasks in the given time immediately.</p>
            </div>
          </div>
        )}

        {/* Rejection Warning */}
        {user.role === 'user' && rejectedRequestsCount > 0 && (
          <div className="alert alert-error" style={{padding: '1.5rem', marginBottom: '2rem', alignItems: 'flex-start'}}>
            <span style={{fontSize: '2rem', marginTop: '-0.2rem'}}>⚠️</span>
            <div>
              <strong style={{fontSize: '1.1rem', display: 'block', marginBottom: '0.25rem'}}>Application Update</strong>
              <p style={{color: '#991b1b'}}>Your application was not selected. Please apply to another company which suits your level.</p>
            </div>
          </div>
        )}

        <div className="page-header">
          <div>
            <h1>{user.role === 'company_admin' ? 'Manage Applications' : 'My Requests'}</h1>
            <p>{user.role === 'company_admin' ? 'Review candidates and assign assessment projects.' : 'Track your applications and assigned projects.'}</p>
          </div>
          {user.role === 'user' && (
            <Link to="/companies" className="btn btn-primary">
              Explore Companies <span>→</span>
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: '4rem', color: 'var(--text-muted)'}}>
            <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⏳</div>
            Loading your data...
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state-hero">
            <div style={{fontSize: '4rem', marginBottom: '1.5rem'}}>🚀</div>
            <h2>{user.role === 'user' ? 'Ready to make your next big move?' : 'Your inbox is clear'}</h2>
            <p>
              {user.role === 'user' 
                ? 'You haven\'t sent any connection requests yet. Browse our curated list of industry leaders and submit your first application today.' 
                : 'There are currently no pending requests for the companies you manage. Check back later!'}
            </p>
            {user.role === 'user' && (
              <Link to="/companies" className="btn btn-primary" style={{padding: '0.875rem 1.5rem', fontSize: '1.05rem'}}>
                Browse Top Companies
              </Link>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{user.role === 'user' ? 'Target Company' : 'Candidate Details'}</th>
                  <th>Status & Project Details</th>
                  {user.role === 'company_admin' && <th style={{textAlign: 'right'}}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map(req => {
                  const isLate = req.status === 'In_Progress' && isOverdue(req.projectDeadline);
                  return (
                    <tr key={req._id} style={{background: isLate && user.role === 'user' ? '#fef2f2' : undefined}}>
                      <td style={{verticalAlign: 'top', paddingTop: '1.5rem'}}>
                        {user.role === 'user' ? (
                          <div className="td-company-info">
                            <span className="company-emoji" style={{width: '40px', height: '40px', fontSize: '1.5rem', borderRadius: '0.5rem'}}>{req.companyId?.logo}</span>
                            <div>
                              <div style={{fontWeight: 600, color: 'var(--secondary)', fontSize: '1.05rem'}}>{req.companyId?.name}</div>
                              <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{new Date(req.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{fontWeight: 600, color: 'var(--secondary)', fontSize: '1.05rem'}}>{req.userId?.name}</div>
                            <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem'}}>{req.userId?.email}</div>
                            <div style={{fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase'}}>
                              Applying to: {req.companyId?.name}
                            </div>
                            <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem'}}>Submitted: {new Date(req.createdAt).toLocaleDateString()}</div>
                          </div>
                        )}
                      </td>
                      
                      <td style={{verticalAlign: 'top', paddingTop: '1.5rem'}}>
                        <div style={{marginBottom: '0.75rem'}}>
                          <span className={`badge ${getBadgeClass(req.status)}`}>
                            {formatStatus(req.status)}
                          </span>
                        </div>
                        
                        {/* Render Project Details if available */}
                        {req.projectTitle && (
                          <div style={{background: 'var(--bg-main)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', maxWidth: '500px'}}>
                            <h4 style={{fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--secondary)'}}>Task: {req.projectTitle}</h4>
                            <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', whiteSpace: 'pre-wrap'}}>{req.projectDescription}</p>
                            
                            <div style={{fontSize: '0.85rem', fontWeight: 600, color: isLate && req.status === 'In_Progress' ? 'var(--danger)' : 'var(--secondary)'}}>
                              Deadline: {new Date(req.projectDeadline).toLocaleString()}
                              {isLate && req.status === 'In_Progress' && ' (OVERDUE)'}
                            </div>
                            
                            {/* Candidate Action Buttons inside project details */}
                            {user.role === 'user' && req.status === 'Offered' && (
                              <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
                                <button className="btn btn-success" style={{padding: '0.4rem 1rem', fontSize: '0.85rem'}} onClick={() => handleCandidateAction(req._id, 'accept')}>Accept Task</button>
                                <button className="btn btn-outline" style={{padding: '0.4rem 1rem', fontSize: '0.85rem', color: 'var(--danger)'}} onClick={() => handleCandidateAction(req._id, 'decline')}>Decline</button>
                              </div>
                            )}
                            
                            {user.role === 'user' && req.status === 'In_Progress' && (
                              <div style={{marginTop: '1rem'}}>
                                <button className="btn btn-primary" style={{padding: '0.4rem 1rem', fontSize: '0.85rem', width: '100%'}} onClick={() => handleCandidateAction(req._id, 'complete')}>
                                  Mark Task as Completed
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      
                      {user.role === 'company_admin' && (
                        <td style={{textAlign: 'right', verticalAlign: 'top', paddingTop: '1.5rem'}}>
                          {req.status === 'Pending' ? (
                            <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end'}}>
                              <button className="btn btn-primary" style={{padding: '0.4rem 1rem', width: '140px'}} onClick={() => openAssignModal(req)}>Assign Project</button>
                              <button className="btn btn-outline" style={{padding: '0.4rem 1rem', color: '#b91c1c', width: '140px'}} onClick={() => handleAdminReject(req._id)}>Reject</button>
                            </div>
                          ) : (
                            <span style={{color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic'}}>Action Complete</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Assign Project Modal */}
      {assignModalOpen && selectedRequest && (
        <div className="modal-overlay" onClick={() => setAssignModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{fontSize: '1.25rem'}}>Assign Project Task</h2>
                <p style={{color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem'}}>Candidate: {selectedRequest.userId.name}</p>
              </div>
              <button onClick={() => setAssignModalOpen(false)} style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)'}}>✕</button>
            </div>
            
            <div className="modal-body">
              <form id="assign-form" onSubmit={handleAdminOffer}>
                <div className="form-group">
                  <label>Project / Task Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Build a Landing Page" 
                    value={projectForm.title} 
                    onChange={e => setProjectForm({...projectForm, title: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Detailed Instructions</label>
                  <textarea 
                    style={{width: '100%', padding: '0.875rem', borderRadius: '0.5rem', border: '1.5px solid var(--border)', background: 'var(--bg-main)', outline: 'none', fontFamily: 'inherit', minHeight: '100px'}}
                    placeholder="Provide clear instructions for the candidate..." 
                    value={projectForm.description} 
                    onChange={e => setProjectForm({...projectForm, description: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Strict Deadline</label>
                  <input 
                    type="datetime-local" 
                    value={projectForm.deadline} 
                    onChange={e => setProjectForm({...projectForm, deadline: e.target.value})} 
                    required 
                  />
                </div>
              </form>
            </div>
            
            <div className="modal-footer" style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
              <button className="btn btn-outline" onClick={() => setAssignModalOpen(false)}>Cancel</button>
              <button type="submit" form="assign-form" className="btn btn-primary">Send Offer to Candidate</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;