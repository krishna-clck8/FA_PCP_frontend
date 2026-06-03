import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { authUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'active' });

  useEffect(() => { fetchProjects(); }, [page, search, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/projects', { params });
      setProjects(res.data.data.data || []);
      setTotal(res.data.data.total || 0);
      setTotalPages(res.data.data.totalPages || 1);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProject) {
        await api.patch(`/projects/${editProject._id}`, form);
      } else {
        await api.post('/projects', form);
      }
      setShowModal(false);
      setEditProject(null);
      setForm({ title: '', description: '', status: 'active' });
      fetchProjects();
    } catch { /* empty */ }
  };

  const handleEdit = (project) => {
    setEditProject(project);
    setForm({ title: project.title, description: project.description, status: project.status });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try { await api.delete(`/projects/${id}`); fetchProjects(); } catch { /* empty */ }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => { setEditProject(null); setForm({ title: '', description: '', status: 'active' }); setShowModal(true); }}>Create Project</button>
      </div>
      <div className="filters">
        <input type="text" placeholder="Search projects..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Title</th><th>Owner</th><th>Members</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{projects.map(p => (
              <tr key={p._id}><td>{p.projectId}</td><td>{p.title}</td><td>{p.owner?.name || 'N/A'}</td><td>{p.members?.length || 0}</td><td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
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
            <h2>{editProject ? 'Edit Project' : 'Create Project'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-group"><label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editProject ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
