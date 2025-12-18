import React, { useState, useEffect } from 'react';

export default function UserForm({ user: initial, roles = [], onCancel, onSaved, onDone }) {
  const [user, setUser] = useState(initial || { 
    username: '', 
    email: '', 
    first_name: '', 
    last_name: '', 
    is_active: true, 
    is_staff: false, 
    is_superuser: false, 
    roles: [], 
    password: '',
    confirm_password: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // normalize roles to an array of role names (backend may return objects or strings)
    const base = initial || { 
      username: '', 
      email: '', 
      first_name: '', 
      last_name: '', 
      is_active: true, 
      is_staff: false, 
      is_superuser: false, 
      roles: [], 
      password: '',
      confirm_password: ''
    };
    const normRoles = Array.isArray(base.roles) ? base.roles.map(r => (typeof r === 'string' ? r : (r && r.name) || '')).filter(Boolean) : [];
    setUser({ ...base, roles: normRoles });
    setErrors({});
  }, [initial]);

  const token = localStorage.getItem('access');
  const API_BASE = process.env.REACT_APP_API_URL || ((window.location.hostname === 'localhost' && window.location.port === '3000') ? 'http://localhost:8000' : '');

  const validateForm = () => {
    const newErrors = {};
    
    if (!user.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (user.email && !/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation only for new users or when changing password
    if (!user.id && !user.password) {
      newErrors.password = 'Password is required for new users';
    }
    
    if (user.password && user.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (user.password && user.password !== user.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      const payload = { ...user };
      // Remove confirm_password from payload
      delete payload.confirm_password;
      
      // Only include password if it's set
      if (!payload.password) delete payload.password;
      
      const method = user.id ? 'PUT' : 'POST';
      const url = user.id ? `${API_BASE}/api/users/${user.id}/` : `${API_BASE}/api/users/`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Save failed with status ${res.status}`);
      }
      
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (!ct.includes('application/json')) {
        const txt = await res.text();
        throw new Error(`Expected JSON response from save but received: ${txt.substring(0,200)}`);
      }
      
      const data = await res.json();
      // Call saved/done callbacks (support older prop name onDone)
      if (onSaved) onSaved(data);
      else if (onDone) onDone(data);
    } catch (err) {
      alert(`Error: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleGroup = (name) => {
    const cur = new Set(user.roles || []);
    if (cur.has(name)) cur.delete(name); else cur.add(name);
    setUser({ ...user, roles: Array.from(cur) });
  };

  const handleChange = (field, value) => {
    setUser({ ...user, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      left: 0, 
      top: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.5)', 
      zIndex: 9999, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      overflowY: 'auto',
      padding: '20px'
    }}>
      <form onSubmit={submit} style={{ 
        background: '#fff', 
        padding: '24px', 
        borderRadius: '8px', 
        width: '95%', 
        maxWidth: '700px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: '24px', 
          color: '#333',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          {user.id ? 'Edit User' : 'Create New User'}
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#333'
            }}>
              Username *
            </label>
            <input 
              value={user.username} 
              onChange={e => handleChange('username', e.target.value)} 
              required 
              style={{
                width: '100%',
                padding: '10px',
                border: errors.username ? '1px solid #e53e3e' : '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter username"
            />
            {errors.username && (
              <div style={{ color: '#e53e3e', fontSize: '14px', marginTop: '4px' }}>
                {errors.username}
              </div>
            )}
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#333'
            }}>
              Email
            </label>
            <input 
              value={user.email} 
              onChange={e => handleChange('email', e.target.value)} 
              type="email"
              style={{
                width: '100%',
                padding: '10px',
                border: errors.email ? '1px solid #e53e3e' : '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="user@example.com"
            />
            {errors.email && (
              <div style={{ color: '#e53e3e', fontSize: '14px', marginTop: '4px' }}>
                {errors.email}
              </div>
            )}
          </div>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#333'
            }}>
              First Name
            </label>
            <input 
              value={user.first_name} 
              onChange={e => handleChange('first_name', e.target.value)} 
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="First name"
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#333'
            }}>
              Last Name
            </label>
            <input 
              value={user.last_name} 
              onChange={e => handleChange('last_name', e.target.value)} 
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Last name"
            />
          </div>
        </div>
        
        {!user.id && (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Password {user.id ? '' : '*'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    value={user.password} 
                    onChange={e => handleChange('password', e.target.value)} 
                    type={showPassword ? "text" : "password"}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: errors.password ? '1px solid #e53e3e' : '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#333'
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && (
                  <div style={{ color: '#e53e3e', fontSize: '14px', marginTop: '4px' }}>
                    {errors.password}
                  </div>
                )}
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Confirm Password
                </label>
                <input 
                  value={user.confirm_password} 
                  onChange={e => handleChange('confirm_password', e.target.value)} 
                  type="password"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.confirm_password ? '1px solid #e53e3e' : '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Confirm password"
                />
                {errors.confirm_password && (
                  <div style={{ color: '#e53e3e', fontSize: '14px', marginTop: '4px' }}>
                    {errors.confirm_password}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#333'
          }}>
            Status
          </label>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={!!user.is_active} 
                onChange={e => handleChange('is_active', e.target.checked)} 
                style={{ marginRight: '8px' }}
              /> 
              Active
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={!!user.is_staff} 
                onChange={e => handleChange('is_staff', e.target.checked)} 
                style={{ marginRight: '8px' }}
              /> 
              Staff
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={!!user.is_superuser} 
                onChange={e => handleChange('is_superuser', e.target.checked)} 
                style={{ marginRight: '8px' }}
              /> 
              Superuser
            </label>
          </div>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#333'
          }}>
            Roles
          </label>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap',
            padding: '12px',
            border: '1px solid #eee',
            borderRadius: '4px',
            backgroundColor: '#fafafa'
          }}>
            {roles.length > 0 ? (
              roles.map(g => (
                <label 
                  key={g.name} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={(user.roles || []).includes(g.name)} 
                    onChange={() => toggleGroup(g.name)} 
                    style={{ marginRight: '8px' }}
                  /> 
                  {g.name}
                </label>
              ))
            ) : (
              <div style={{ color: '#666', fontStyle: 'italic' }}>
                No roles available
              </div>
            )}
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid #eee'
        }}>
          <button 
            type="button" 
            onClick={() => { if (onCancel) onCancel(); else if (onDone) onDone(); }} 
            disabled={saving}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f7fafc',
              color: '#4a5568',
              border: '1px solid #cbd5e0',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </form>
    </div>
  );
}