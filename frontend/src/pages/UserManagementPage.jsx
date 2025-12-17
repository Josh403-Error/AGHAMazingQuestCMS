import React, { useEffect, useState } from 'react';
import UserForm from '../components/UserForm';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const token = localStorage.getItem('access');

  const [error, setError] = React.useState(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch current user info
      const currentUserRes = await fetch('/api/auth/me/', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (currentUserRes.ok) {
        const currentUserData = await currentUserRes.json();
        setCurrentUser(currentUserData);
      }

      const uRes = await fetch('/api/users/', { headers: { Authorization: `Bearer ${token}` } });
      if (uRes.status === 401) {
        // not authenticated
        setError('Not authenticated. Please log in again.');
        // redirect to login after clearing tokens
        localStorage.removeItem('access'); localStorage.removeItem('refresh');
        window.location.href = '/';
        return;
      }
      if (!uRes.ok) {
        const text = await uRes.text();
        throw new Error(`Failed to load users: ${uRes.status} ${text}`);
      }
      const uData = await uRes.json();
      setUsers(uData);

      const gRes = await fetch('/api/users/roles/', { headers: { Authorization: `Bearer ${token}` } });
      if (!gRes.ok) {
        const text = await gRes.text();
        throw new Error(`Failed to load roles: ${gRes.status} ${text}`);
      }
      const gData = await gRes.json();
      setRoles(gData);
    } catch (err) {
      console.error(err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const doDelete = async (id) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/users/${id}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (![204,200].includes(res.status)) throw new Error('Delete failed');
      fetchData();
    } catch (err) { console.error(err); alert(String(err)); }
  };

  // Check if current user is a superuser
  const isSuperuser = currentUser?.is_superuser;

  return (
    <div className="user-management-page">
      <div className="page-header">
        <h2>User Management</h2>
        <p>Manage users and their roles within the system</p>
      </div>
      
      {isSuperuser && (
        <div className="action-bar">
          <button className="btn btn-primary" onClick={() => { setShowCreate(true); setEditing(null); }}>
            Create New User
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Name</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td data-label="Username">{u.username}</td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Name">{u.first_name} {u.last_name}</td>
                  <td data-label="Roles">
                    <div className="roles-container">
                      {(u.roles || []).map((role, index) => (
                        <span key={index} className="role-tag">{role}</span>
                      ))}
                    </div>
                  </td>
                  <td data-label="Status">
                    <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="action-buttons">
                      <button className="btn btn-secondary" onClick={() => setEditing(u)}>Edit</button>
                      {isSuperuser && (
                        <button className="btn btn-danger" onClick={() => doDelete(u.id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="empty-state">
              <p>No users found</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {showCreate && isSuperuser && (
        <UserForm 
          roles={roles} 
          onCancel={() => setShowCreate(false)} 
          onSaved={() => { setShowCreate(false); fetchData(); }} 
        />
      )}
      
      {editing && (
        <UserForm 
          user={editing} 
          roles={roles} 
          onCancel={() => setEditing(null)} 
          onSaved={() => { setEditing(null); fetchData(); }} 
        />
      )}
    </div>
  );
}