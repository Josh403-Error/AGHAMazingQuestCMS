import React, { useState, useEffect } from 'react';

export default function RoleForm({ role: initialRole, onCancel, onSaved }) {
  const [role, setRole] = useState(initialRole || { name: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem('access');
  const API_BASE = process.env.REACT_APP_API_URL || ((window.location.hostname === 'localhost' && window.location.port === '3000') ? 'http://localhost:8000' : '');

  useEffect(() => {
    setRole(initialRole || { name: '' });
    setErrors({});
  }, [initialRole]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!role.name.trim()) {
      newErrors.name = 'Role name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setRole({ ...role, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      // Since Django's Group model is used directly, we need to use the Django admin API
      // For now, we'll just show an alert that this is a read-only view
      alert('Role management is currently read-only. In a full implementation, you would be able to create/edit roles here.');
      
      // Call the callback to close the form
      if (onSaved) onSaved();
    } catch (err) {
      alert(`Error: ${String(err)}`);
    } finally {
      setSaving(false);
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
        maxWidth: '500px',
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
          {role.id ? 'Edit Role' : 'Create New Role'}
        </h2>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#333'
          }}>
            Role Name *
          </label>
          <input 
            value={role.name} 
            onChange={e => handleChange('name', e.target.value)} 
            required 
            style={{
              width: '100%',
              padding: '10px',
              border: errors.name ? '1px solid #e53e3e' : '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter role name"
            disabled={!!role.id} // Disable editing since we're using Django's built-in Group model
          />
          {errors.name && (
            <div style={{ color: '#e53e3e', fontSize: '14px', marginTop: '4px' }}>
              {errors.name}
            </div>
          )}
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
            onClick={onCancel}
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
            {saving ? 'Saving...' : (role.id ? 'Update Role' : 'Create Role')}
          </button>
        </div>
        
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: '4px',
          color: '#856404'
        }}>
          <strong>Note:</strong> Role management is currently read-only as it uses Django's built-in Group model. 
          In a full implementation, you would be able to create and edit roles.
        </div>
      </form>
    </div>
  );
}