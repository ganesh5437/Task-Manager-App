import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const { token, user } = useAuth();
  
  // Custom alert state
  const [alert, setAlert] = useState(null);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await axios.get('/api/companies', { headers: { Authorization: `Bearer ${token}` } });
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const sendRequest = async (companyId) => {
    try {
      await axios.post('/api/requests', { companyId }, { headers: { Authorization: `Bearer ${token}` } });
      setAlert({ type: 'success', message: 'Request sent successfully!' });
      setModalOpen(false);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to send request' });
      setModalOpen(false);
    }
    
    // Auto clear alert
    setTimeout(() => setAlert(null), 4000);
  };

  const openCompany = (company) => {
    setSelectedCompany(company);
    setModalOpen(true);
  };

  if (loading) return <><Navbar /><div style={{padding:'4rem',textAlign:'center'}}>Loading companies...</div></>;

  return (
    <>
      <Navbar />
      <div className="container">
        {alert && (
          <div className="error-msg" style={{background: alert.type === 'success' ? '#d1fae5' : '#fee2e2', color: alert.type === 'success' ? '#059669' : '#dc2626', borderColor: alert.type === 'success' ? '#10b981' : '#ef4444', marginBottom:'2rem'}}>
            {alert.message}
          </div>
        )}
        
        <h1 style={{marginBottom:'2rem'}}>Explore Companies</h1>
        
        <div className="grid">
          {companies.map(company => (
            <div className="card" key={company._id}>
              <div className="card-header">
                <span style={{fontSize:'2.5rem'}}>{company.logo}</span>
                <div>
                  <h3 style={{fontSize:'1.25rem'}}>{company.name}</h3>
                  <div style={{color:'var(--text-muted)', fontSize:'0.875rem'}}>{company.industry}</div>
                </div>
              </div>
              <div className="card-body">
                <p style={{color:'var(--text-muted)', fontSize:'0.875rem', marginBottom:'1rem', minHeight:'40px'}}>
                  {company.description}
                </p>
                <div style={{fontSize:'0.875rem', fontWeight:600}}>
                  {company.employees?.length || 0} Employees
                </div>
              </div>
              <div className="card-footer">
                <button className="btn btn-outline" onClick={() => openCompany(company)}>View Details</button>
                {user?.role === 'user' && (
                  <button className="btn btn-primary" onClick={() => sendRequest(company._id)}>Send Request</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && selectedCompany && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:'500px', textAlign:'left'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
              <h2 style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                <span>{selectedCompany.logo}</span> {selectedCompany.name}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer'}}>✕</button>
            </div>
            
            <p style={{color:'var(--text-muted)', marginBottom:'1.5rem'}}>{selectedCompany.description}</p>
            
            <h3 style={{fontSize:'1.1rem', marginBottom:'1rem'}}>Employees</h3>
            {selectedCompany.employees?.length > 0 ? (
              <ul className="employee-list">
                {selectedCompany.employees.map(emp => (
                  <li className="employee-item" key={emp._id}>
                    <span style={{fontWeight:500}}>{emp.name}</span>
                    <span>{emp.position}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{color:'var(--text-muted)'}}>No employees listed.</p>
            )}
            
            {user?.role === 'user' && (
              <button className="btn btn-primary" style={{width:'100%', marginTop:'2rem', padding:'0.75rem'}} onClick={() => sendRequest(selectedCompany._id)}>
                Send Application Request
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Companies;
