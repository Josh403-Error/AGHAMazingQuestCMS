import React, { useEffect, useState, useCallback } from 'react';
import UserForm from '../components/UserForm';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });

  const token = localStorage.getItem('access');

  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/users/${id}/`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (![204,200].includes(res.status)) throw new Error('Delete failed');
      fetchData();
    } catch (err) { 
      console.error(err); 
      alert(`Error deleting user: ${String(err)}`); 
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
    const sortableUsers = [...users];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const filteredUsers = React.useMemo(() => {
    return sortedUsers.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedUsers, searchTerm]);

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>User Management</h1>
        <button 
          onClick={() => { setShowCreate(true); setEditing(null); }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          + Add New User
        </button>
      </div>

      <div style={{ 
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label htmlFor="search-users" style={{ fontWeight: '500', color: '#333' }}>
            Search Users:
          </label>
          <input
            id="search-users"
            type="text"
            placeholder="Search by username, email, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '16px',
              flex: 1,
              maxWidth: '400px'
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading users...
        </div>
      ) : (
        <>
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th 
                    style={{ 
                      textAlign: 'left', 
                      padding: '16px', 
                      borderBottom: '2px solid #dee2e6',
                      cursor: 'pointer',
                      fontWeight: '600',
                      color: '#495057'
                    }}
                    onClick={() => handleSort('username')}
                  >
                    Username{getSortIndicator('username')}
                  </th>
                  <th 
                    style={{ 
                      textAlign: 'left', 
                      padding: '16px', 
                      borderBottom: '2px solid #dee2e6',
                      cursor: 'pointer',
                      fontWeight: '600',
                      color: '#495057'
                    }}
                    onClick={() => handleSort('email')}
                  >
                    Email{getSortIndicator('email')}
                  </th>
                  <th 
                    style={{ 
                      textAlign: 'left', 
                      padding: '16px', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: '600',
                      color: '#495057'
                    }}
                  >
                    Name
                  </th>
                  <th 
                    style={{ 
                      padding: '16px', 
                      borderBottom: '2px solid #dee2e6',
                      cursor: 'pointer',
                      fontWeight: '600',
                      color: '#495057'
                    }}
                    onClick={() => handleSort('is_active')}
                  >
                    Status{getSortIndicator('is_active')}
                  </th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #dee2e6', fontWeight: '600', color: '#495057' }}>
                    Roles
                  </th>
                  <th style={{ padding: '16px', borderBottom: '2px solid #dee2e6', fontWeight: '600', color: '#495057' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <tr 
                      key={u.id} 
                      style={{ 
                        borderTop: '1px solid #dee2e6',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '500', color: '#333' }}>{u.username}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: '#666' }}>{u.email || '-'}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: '#333' }}>
                          {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : '-'}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: u.is_active ? '#d4edda' : '#f8d7da',
                          color: u.is_active ? '#155724' : '#721c24',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ 
                          display: 'flex', 
                          gap: '4px', 
                          flexWrap: 'wrap' 
                        }}>
                          {(u.roles || []).slice(0, 3).map(role => (
                            <span 
                              key={role} 
                              style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                backgroundColor: '#e9ecef',
                                color: '#495057',
                                fontSize: '12px'
                              }}
                            >
                              {role}
                            </span>
                          ))}
                          {(u.roles || []).length > 3 && (
                            <span 
                              style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                backgroundColor: '#e9ecef',
                                color: '#495057',
                                fontSize: '12px'
                              }}
                            >
                              +{(u.roles || []).length - 3}
                            </span>
                          )}
                          {(u.roles || []).length === 0 && (
                            <span style={{ color: '#666', fontStyle: 'italic' }}>No roles</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => setEditing(u)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#fff',
                              color: '#3182ce',
                              border: '1px solid #3182ce',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => doDelete(u.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#fff',
                              color: '#e53e3e',
                              border: '1px solid #e53e3e',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      {searchTerm ? 'No users match your search criteria.' : 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ 
            marginTop: '16px', 
            textAlign: 'center', 
            color: '#666',
            fontSize: '14px'
          }}>
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </>
      )}

      {error && (
        <div style={{ 
          marginTop: '24px', 
          padding: '16px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {showCreate && (
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