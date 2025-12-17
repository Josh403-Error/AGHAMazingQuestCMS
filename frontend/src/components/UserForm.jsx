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
    password: '' 
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

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
      password: '' 
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
    
    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!initial && !user.password) {
      newErrors.password = 'Password is required for new users';
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
      if (!payload.password && initial) delete payload.password;
      const method = user.id ? 'PUT' : 'POST';
      const url = user.id ? `${API_BASE}/api/users/${user.id}/` : `${API_BASE}/api/users/`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Save failed');
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
      alert(String(err));
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
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="modal-overlay">
      <form onSubmit={submit} className="user-form-modal">
        <div className="modal-header">
          <h3>{user.id ? 'Edit User' : 'Create New User'}</h3>
          <button type="button" className="close-button" onClick={() => { if (onCancel) onCancel(); else if (onDone) onDone(); }}>
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input 
                id="username"
                value={user.username} 
                onChange={e => handleChange('username', e.target.value)} 
                required 
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                id="email"
                type="email"
                value={user.email} 
                onChange={e => handleChange('email', e.target.value)} 
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input 
                id="first_name"
                value={user.first_name} 
                onChange={e => handleChange('first_name', e.target.value)} 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input 
                id="last_name"
                value={user.last_name} 
                onChange={e => handleChange('last_name', e.target.value)} 
              />
            </div>
          </div>
          
          {!initial && (
            <div className="form-group">
              <label htmlFor="password">Password {initial ? '' : '*'}</label>
              <input 
                id="password"
                value={user.password} 
                onChange={e => handleChange('password', e.target.value)} 
                type="password" 
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
              <small className="form-text">Leave blank to keep current password</small>
            </div>
          )}
          
          <div className="form-group">
            <label className="checkbox-group">
              <input 
                type="checkbox" 
                checked={!!user.is_active} 
                onChange={e => handleChange('is_active', e.target.checked)} 
              />
              <span>Active</span>
            </label>
            
            <label className="checkbox-group">
              <input 
                type="checkbox" 
                checked={!!user.is_staff} 
                onChange={e => handleChange('is_staff', e.target.checked)} 
              />
              <span>Staff</span>
            </label>
            
            <label className="checkbox-group">
              <input 
                type="checkbox" 
                checked={!!user.is_superuser} 
                onChange={e => handleChange('is_superuser', e.target.checked)} 
              />
              <span>Superuser</span>
            </label>
          </div>
          
          <div className="form-group">
            <label>Roles</label>
            <div className="roles-selection">
              {roles.map(g => (
                <label key={g.name} className="role-checkbox">
                  <input 
                    type="checkbox" 
                    checked={(user.roles || []).includes(g.name)} 
                    onChange={() => toggleGroup(g.name)} 
                  /> 
                  <span className="checkmark"></span>
                  {g.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => { if (onCancel) onCancel(); else if (onDone) onDone(); }} 
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </form>
    </div>
  );
}