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
  const [items, setItems] = useState([]);

  // Derived stats from current items
  const publishedCount = items.filter(i => (i.status === 'published' || (i.status && i.status.toLowerCase() === 'published'))).length;
  const pendingApprovalCount = items.filter(i => (i.status === 'for_approval' || (i.status && (i.status.toLowerCase() === 'for approval' || i.status.toLowerCase() === 'for_approval')))).length;

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('access');
      if (!token) {
        navigate('/');
        return;
      }
      const API_BASE = process.env.REACT_APP_API_URL || ((window.location.hostname === 'localhost' && window.location.port === '3000') ? 'http://localhost:8000' : '');
      try {
        const res = await fetch(`${API_BASE}/api/auth/me/`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          const text = await res.text();
          console.error('Auth/me returned non-OK:', res.status, text);
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          navigate('/');
          return;
        }
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (!ct.includes('application/json')) {
          const text = await res.text();
          throw new Error(`Expected JSON from /api/auth/me/ but received HTML/text. Response starts with: ${text.substring(0,200)}`);
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Failed to load current user for dashboard', err);
        try { localStorage.removeItem('access'); localStorage.removeItem('refresh'); } catch(e){}
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  // Load content items for the table once user is known
  useEffect(() => {
    if (!user) return; // wait until authenticated user is loaded
    let mounted = true;
    const loadItems = async () => {
      try {
        const res = await fetchAuth('/api/content/items/');
        if (!res.ok) {
          console.error('Failed to fetch content items', res.status);
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        // If the API uses DRF pagination, the list may be in data.results
        const list = Array.isArray(data) ? data : (data.results || []);
        setItems(list);
      } catch (e) {
        console.error('Error loading content items', e);
      }
    };
    loadItems();
    return () => { mounted = false; };
  }, [user]);

  const StatCard = ({ iconClass, value, label, color }) => ( 
    <div className="stat-card">
      <div className="stat-icon-circle" style={{ backgroundColor: color }}>
        <span className="material-icons">{iconClass}</span>
      </div>
      <div className="stat-details">
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
    
  const TableRow = ({ id, title, timeStamp, encodedBy, toBeReviewedBy, status, statusRaw }) => {
    // determine dot color by raw status key
    let dotColor = '#999';
    try {
      const key = (statusRaw || '').toString().toLowerCase();
      if (key === 'for_approval' || key === 'for approval') dotColor = '#FFC107'; // yellow
      else if (key === 'for_publishing' || key === 'for publishing') dotColor = '#FF9800'; // orange
      else if (key === 'published') dotColor = '#4CAF50';
    } catch (e) { /* ignore and use default */ }

    return (
      <tr className="table-row">
        <td>{id}</td>
        <td className="table-title">{title}</td>
        <td>{timeStamp}</td>
        <td>{encodedBy}</td>
        <td>{toBeReviewedBy}</td>
        <td className={`status-cell status-${(status || '').toLowerCase().replace(' ', '-')}`}>
          <span className="status-dot" style={{ backgroundColor: dotColor }}></span>
          {status}
        </td>
      </tr>
    );
  };

  if (loading) return <div>Loading dashboard...</div>;

  return ( 
    <div className="dashboard-layout">
      <Sidebar user={user} /> 

      <div className="main-content">
        <div className="main-header">
          <h1>{isIndexRoute ? 'Dashboard' : 'Management Page'}</h1> 
          <div className="header-controls">
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="Search by Title or ID" className="search-input" />
              <span className="material-icons search-icon">search</span>
            </div>
            
            <div className="filter-dropdown">
              <span>Content</span>
              <span className="material-icons">arrow_drop_down</span>
            </div>

            <div className="filter-dropdown">
              <span>Status</span>
              <span className="material-icons">arrow_drop_down</span>
            </div>
          </div>
        </div>

  <Outlet context={{ user }} /> 

        {isIndexRoute && (
          <React.Fragment>
            <div className="filter-row">
              <div className="date-filter">
                <input type="text" value="01-June-2025" readOnly />
                <span className="material-icons calendar-icon">calendar_today</span>
              </div>
              <div className="date-filter">
                <input type="text" value="30-June-2025" readOnly />
                <span className="material-icons calendar-icon">calendar_today</span>
              </div>
              <div className="product-type-filter">
                <input type="text" value="AR Marker" readOnly />
                <span className="material-icons">arrow_drop_down</span>
              </div>
              <button className="get-data-btn">Get Data</button>
            </div>

            <div className="stat-cards-container">
              <StatCard iconClass="article" value={publishedCount} label="Published" color="#4CAF50" />
              <StatCard iconClass="schedule" value={pendingApprovalCount} label="Pending Approval" color="#FFC107" />
              <StatCard iconClass="group" value="12" label="Active Users" color="#2196F3" />
              <StatCard iconClass="notifications" value="1" label="Notifications" color="#FF9800" />
            </div>

            <div className="data-table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Time Stamp</th>
                    <th>Encoded By</th>
                    <th>Reviewed By</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr><td colSpan={6}>No content found.</td></tr>
                  )}
                  {items.map(item => {
                    // created_by may be an id or an object depending on serializer
                    let encodedBy = '-';
                    try {
                      if (!item.created_by) encodedBy = '-';
                      else if (typeof item.created_by === 'object') {
                        encodedBy = `${item.created_by.first_name || ''} ${item.created_by.last_name || ''}`.trim() || item.created_by.username || (`User ${item.created_by.id || ''}`);
                      } else {
                        encodedBy = `User ${item.created_by}`;
                      }
                    } catch (e) { encodedBy = `User ${item.created_by}`; }

                    // Reviewed By: only show when item is 'for_publishing' (approved) or 'published'
                    let toBeReviewedBy = '-';
                    try {
                      const st = (item.status || '').toLowerCase();
                      if (st === 'for_publishing' || st === 'for publishing') {
                        const v = item.approved_by;
                        if (v) {
                          toBeReviewedBy = (typeof v === 'object') ? (`${v.first_name || ''} ${v.last_name || ''}`.trim() || v.username || `User ${v.id}`) : `User ${v}`;
                        }
                      } else if (st === 'published') {
                        const v = item.published_by;
                        if (v) {
                          toBeReviewedBy = (typeof v === 'object') ? (`${v.first_name || ''} ${v.last_name || ''}`.trim() || v.username || `User ${v.id}`) : `User ${v}`;
                        }
                      } else {
                        toBeReviewedBy = '-';
                      }
                    } catch (e) { toBeReviewedBy = '-'; }

                    const fmt = (iso) => {
                      if (!iso) return '-';
                      try {
                        const d = new Date(iso);
                        const day = d.getDate();
                        const month = d.toLocaleString(undefined, { month: 'long' });
                        const year = d.getFullYear();
                        let hour = d.getHours();
                        const ampm = hour >= 12 ? 'pm' : 'am';
                        hour = hour % 12 || 12;
                        const min = String(d.getMinutes()).padStart(2, '0');
                        return `${day}-${month}-${year} | ${hour}:${min} ${ampm}`;
                      } catch (e) { return iso; }
                    };

                    const statusLabel = item.status ? item.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '-';

                    return (
                      <TableRow
                        key={item.id}
                        id={item.id}
                        title={item.title || item.slug || 'Untitled'}
                        timeStamp={fmt(item.created_at)}
                        encodedBy={encodedBy}
                        toBeReviewedBy={toBeReviewedBy}
                        status={statusLabel}
                        statusRaw={item.status}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default Dashboard;