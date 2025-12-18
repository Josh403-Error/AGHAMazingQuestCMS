import React, { useEffect, useState } from 'react';
import RoleForm from '../components/RoleForm';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  const token = localStorage.getItem('access');

  useEffect(() => {
    let mounted = true;
    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/users/roles/', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (res.status === 401) {
          // not authenticated
          setError('Not authenticated. Please log in again.');
          localStorage.removeItem('access'); 
          localStorage.removeItem('refresh');
          window.location.href = '/';
          return;
        }
        
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load roles: ${res.status} ${text}`);
        }
        
        const data = await res.json();
        if (mounted) setRoles(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchRoles();
    return () => { mounted = false; };
  }, [token]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRoles = React.useMemo(() => {
    const sortableRoles = [...roles];
    if (sortConfig !== null) {
      sortableRoles.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableRoles;
  }, [roles, sortConfig]);

  const filteredRoles = React.useMemo(() => {
    return sortedRoles.filter(role => 
      role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedRoles, searchTerm]);

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
        <h1 style={{ margin: 0, color: '#333' }}>Role Management</h1>
        <button 
          onClick={() => setShowCreate(true)}
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
          + Add New Role
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
          <label htmlFor="search-roles" style={{ fontWeight: '500', color: '#333' }}>
            Search Roles:
          </label>
          <input
            id="search-roles"
            type="text"
            placeholder="Search by role name..."
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
          Loading roles...
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
                    onClick={() => handleSort('name')}
                  >
                    Role Name{getSortIndicator('name')}
                  </th>
                  <th 
                    style={{ 
                      padding: '16px', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: '600',
                      color: '#495057'
                    }}
                  >
                    ID
                  </th>
                  <th 
                    style={{ 
                      padding: '16px', 
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: '600',
                      color: '#495057'
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.length > 0 ? (
                  filteredRoles.map(role => (
                    <tr 
                      key={role.id} 
                      style={{ 
                        borderTop: '1px solid #dee2e6',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '500', color: '#333' }}>{role.name}</div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ color: '#666' }}>{role.id}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => setEditingRole(role)}
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
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      {searchTerm ? 'No roles match your search criteria.' : 'No roles found.'}
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
            Showing {filteredRoles.length} of {roles.length} roles
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
        <RoleForm 
          onCancel={() => setShowCreate(false)} 
          onSaved={() => { setShowCreate(false); }} 
        />
      )}
      
      {editingRole && (
        <RoleForm 
          role={editingRole}
          onCancel={() => setEditingRole(null)} 
          onSaved={() => { setEditingRole(null); }} 
        />
      )}
    </div>
  );
}