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

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/requests/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setAlert({ type: 'success', message: `Request ${status.toLowerCase()} successfully.` });
      fetchRequests();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update request' });
    }
    setTimeout(() => setAlert(null), 4000);
  };

  const getBadgeClass = (status) => {
    if (status === 'Accepted') return 'badge-accepted';
    if (status === 'Rejected') return 'badge-rejected';
    return 'badge-pending';
  };

  // Show a popup/alert specifically if a user's request is rejected
  const rejectedRequestsCount = requests.filter(r => r.status === 'Rejected').length;

  return (
    <>
      <Navbar />
      <div className="container">
        {alert && (
          <div className="error-msg" style={{background: alert.type === 'success' ? '#d1fae5' : '#fee2e2', color: alert.type === 'success' ? '#059669' : '#dc2626', borderColor: alert.type === 'success' ? '#10b981' : '#ef4444', marginBottom:'2rem'}}>
            {alert.message}
          </div>
        )}
        
        {user.role === 'user' && rejectedRequestsCount > 0 && (
          <div className="error-msg" style={{marginBottom:'2rem', display:'flex', alignItems:'center', gap:'1rem'}}>
            <span style={{fontSize:'1.5rem'}}>⚠️</span>
            <div>
              <strong>Update on your applications:</strong>
              <p>Your request was rejected. Please send a request to another company.</p>
            </div>
          </div>
        )}

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
          <h1>{user.role === 'company_admin' ? 'Manage Applications' : 'My Requests'}</h1>
          {user.role === 'user' && (
            <Link to="/companies" className="btn btn-primary">Find Companies</Link>
          )}
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding:'4rem'}}>Loading...</div>
        ) : requests.length === 0 ? (
          <div style={{textAlign:'center', padding:'4rem', background:'white', borderRadius:'1rem', border:'1px dashed var(--border)'}}>
            <h3>No requests found</h3>
            <p style={{color:'var(--text-muted)', marginTop:'0.5rem'}}>
              {user.role === 'user' ? 'You haven\'t sent any company requests yet.' : 'There are no pending requests for your companies.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{user.role === 'user' ? 'Company' : 'Candidate'}</th>
                  <th>Date</th>
                  <th>Status</th>
                  {user.role === 'company_admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req._id}>
                    <td style={{fontWeight:500}}>
                      {user.role === 'user' ? req.companyId?.name : (
                        <div>
                          <div>{req.userId?.name}</div>
                          <div style={{fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:400}}>{req.userId?.email}</div>
                          <div style={{fontSize:'0.75rem', color:'var(--primary)', fontWeight:600, marginTop:'0.25rem'}}>Applying to: {req.companyId?.name}</div>
                        </div>
                      )}
                    </td>
                    <td style={{color:'var(--text-muted)'}}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${getBadgeClass(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    {user.role === 'company_admin' && (
                      <td>
                        {req.status === 'Pending' ? (
                          <div style={{display:'flex', gap:'0.5rem'}}>
                            <button className="btn btn-success" style={{padding:'0.25rem 0.75rem', fontSize:'0.875rem'}} onClick={() => updateStatus(req._id, 'Accepted')}>Accept</button>
                            <button className="btn btn-danger" style={{padding:'0.25rem 0.75rem', fontSize:'0.875rem'}} onClick={() => updateStatus(req._id, 'Rejected')}>Reject</button>
                          </div>
                        ) : (
                          <span style={{color:'var(--text-muted)', fontSize:'0.875rem'}}>Resolved</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;