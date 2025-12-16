import React, { useState, useEffect } from 'react';
import { fetchAuth } from './api';

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await fetchAuth('/api/auth/me/');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setFormData({
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || '',
          });
        } else {
          setError('Failed to load user profile');
        }
      } catch (err) {
        setError('Failed to load user profile');
      }
    };

    loadUserProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetchAuth('/api/auth/me/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setMessage('Profile updated successfully');
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setPasswordMessage('');
    setPasswordError('');

    try {
      const response = await fetchAuth('/api/auth/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });

      if (response.ok) {
        setPasswordMessage('Password changed successfully');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_new_password: ''
        });
      } else {
        const data = await response.json();
        setPasswordError(data.detail || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError('An error occurred while changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return (
      <div className="dashboard-content">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <h2>Account Settings</h2>
      
      <div className="settings-section">
        <h3>Profile Information</h3>
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}
        
        <form onSubmit={handleProfileSubmit} className="form-container">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={user.username}
                disabled
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                id="first_name"
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={profileLoading}
          >
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
      
      <div className="settings-section">
        <h3>Change Password</h3>
        {passwordError && (
          <div className="alert alert-error">
            {passwordError}
          </div>
        )}
        {passwordMessage && (
          <div className="alert alert-success">
            {passwordMessage}
          </div>
        )}
        
        <form onSubmit={handlePasswordSubmit} className="form-container">
          <div className="form-group">
            <label htmlFor="current_password">Current Password</label>
            <input
              id="current_password"
              type="password"
              name="current_password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="new_password">New Password</label>
            <input
              id="new_password"
              type="password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              required
              minLength="8"
            />
            <small>Password must be at least 8 characters long</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm_new_password">Confirm New Password</label>
            <input
              id="confirm_new_password"
              type="password"
              name="confirm_new_password"
              value={passwordData.confirm_new_password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}