import { useState, useEffect } from 'react';
import api from '../utils/api';
 
//create the frontend issues page to display the list the issues 
const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editIssue, setEditIssue] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', project: '', assignedTo: '', priority: 'medium', severity: 'major' });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignee, setAssignee] = useState('');

  useEffect(() => {
    fetchIssues();
    fetchProjects();
    fetchUsers();
  }, [page, search, statusFilter, priorityFilter, severityFilter]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (severityFilter) params.severity = severityFilter;
      const res = await api.get('/issues', { params });
      setIssues(res.data.data.data || []);
      setTotal(res.data.data.total || 0);
      setTotalPages(res.data.data.totalPages || 1);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  const fetchProjects = async () => {
    try { const res = await api.get('/projects?limit=100'); setProjects(res.data.data.data || []); } catch { /* empty */ }
  };

  const fetchUsers = async () => {
    try { const res = await api.get('/users?limit=100'); setUsers(res.data.data.data || []); } catch { /* empty */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editIssue) {
        await api.patch(`/issues/${editIssue._id}`, { title: form.title, description: form.description, priority: form.priority, severity: form.severity });
      } else {
        await api.post('/issues', form);
      }
      setShowModal(false);
      setEditIssue(null);
      setForm({ title: '', description: '', project: '', assignedTo: '', priority: 'medium', severity: 'major' });
      fetchIssues();
    } catch { /* empty */ }
  };

  const handleEdit = (issue) => {
    setEditIssue(issue);
    setForm({ title: issue.title, description: issue.description, project: issue.project?._id || '', assignedTo: issue.assignedTo?._id || '', priority: issue.priority, severity: issue.severity });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this issue?')) return;
    try { await api.delete(`/issues/${id}`); fetchIssues(); } catch { /* empty */ }
  };

  const handleStatusChange = async (id, newStatus) => {
    try { await api.patch(`/issues/${id}/status`, { status: newStatus }); fetchIssues(); } catch { /* empty */ }
  };

  const openAssignModal = (issue) => {
    setAssignTarget(issue);
    setAssignee(issue.assignedTo?._id || '');
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    try { await api.patch(`/issues/${assignTarget._id}/assign`, { assignedTo: assignee }); setShowAssignModal(false); fetchIssues(); } catch { /* empty */ }
  };

  const getStatusActions = (status, issueId) => {
    const actions = [];
    if (status === 'open') actions.push({ label: 'Start', next: 'in-progress' });
    if (status === 'in-progress') { actions.push({ label: 'To Testing', next: 'testing' }); actions.push({ label: 'Reopen', next: 'open' }); }
    if (status === 'testing') { actions.push({ label: 'Resolve', next: 'resolved' }); actions.push({ label: 'Reopen', next: 'in-progress' }); }
    if (status === 'resolved') actions.push({ label: 'Close', next: 'closed' });
    return actions.map(a => (
      <button key={a.next} className="btn btn-sm btn-outline" onClick={() => handleStatusChange(issueId, a.next)}>{a.label}</button>
    ));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Issues</h1>
        <button className="btn btn-primary" onClick={() => { setEditIssue(null); setForm({ title: '', description: '', project: '', assignedTo: '', priority: 'medium', severity: 'major' }); setShowModal(true); }}>Create Issue</button>
      </div>
      <div className="filters">
        <input type="text" placeholder="Search issues..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="open">Open</option><option value="in-progress">In Progress</option><option value="testing">Testing</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
        </select>
        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}>
          <option value="">All Priority</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
        <select value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}>
          <option value="">All Severity</option><option value="minor">Minor</option><option value="major">Major</option><option value="critical">Critical</option>
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Title</th><th>Project</th><th>Assigned To</th><th>Priority</th><th>Severity</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{issues.map(i => (
              <tr key={i._id}><td>{i.issueId}</td><td>{i.title}</td><td>{i.project?.title || 'N/A'}</td><td>{i.assignedTo?.name || 'Unassigned'}</td>
                <td><span className={`badge badge-${i.priority}`}>{i.priority}</span></td>
                <td><span className={`badge badge-${i.severity}`}>{i.severity}</span></td>
                <td><span className={`badge badge-${i.status}`}>{i.status}</span></td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => handleEdit(i)}>Edit</button>
                  <button className="btn btn-sm" onClick={() => openAssignModal(i)}>Assign</button>
                  {getStatusActions(i.status, i._id)}
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(i._id)}>Del</button>
                </td></tr>
            ))}</tbody>
          </table>
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span>Page {page} of {totalPages} ({total} total)</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </>
      )}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editIssue ? 'Edit Issue' : 'Create Issue'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              {!editIssue && <div className="form-group"><label>Project</label>
                <select value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} required>
                  <option value="">Select Project</option>{projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>}
              <div className="form-group"><label>Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
              <div className="form-group"><label>Severity</label>
                <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                  <option value="minor">Minor</option><option value="major">Major</option><option value="critical">Critical</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editIssue ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Assign Issue</h2>
            <div className="form-group"><label>Assign To</label>
              <select value={assignee} onChange={e => setAssignee(e.target.value)}>
                <option value="">Unassigned</option>{users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssign}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Issues;
