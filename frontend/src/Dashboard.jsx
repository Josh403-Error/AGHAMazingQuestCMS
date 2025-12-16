// src/Dashboard.jsx (The canonical Dashboard implementation)

import React from 'react';
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { fetchAuth } from './api.js';

const Dashboard = () => {
  const location = useLocation();
  const isIndexRoute = location.pathname === '/dashboard';
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('access');
      if (!token) {
        navigate('/');
        return;
      }
      const API_BASE = process.env.REACT_APP_API_URL || ((window.location.hostname === 'localhost' && window.location.port === '3000') ? 'http://localhost:8000' : '');
      try {
        const res = await fetch(`${API_BASE}/api/auth/me/`, { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          navigate('/');
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} />
      <main className="main-content">
        <div className="header">
          <h1>Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.username || 'User'}!</span>
          </div>
        </div>
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};

export default Dashboard;