import { useState, useEffect } from 'react';
import api from '../utils/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/users', { params });
      setUsers(res.data.data.data || []);
      setTotal(res.data.data.total || 0);
      setTotalPages(res.data.data.totalPages || 1);
    } catch { /* empty */ } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <h1>Users</h1>
      <div className="filters">
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <>
          <table className="data-table">
            <thead><tr><th>User ID</th><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th></tr></thead>
            <tbody>{users.map(u => (
              <tr key={u._id}><td>{u.userId}</td><td>{u.name}</td><td>{u.email}</td><td><span className={`badge badge-${u.role}`}>{u.role}</span></td><td>{u.department}</td><td><span className={`badge badge-${u.status}`}>{u.status}</span></td></tr>
            ))}</tbody>
          </table>
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span>Page {page} of {totalPages} ({total} total)</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Users;
