// src/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const LOGO_URL = "https://raw.githubusercontent.com/Marianne-101/pictures/main/dost-stii-logo.png";

export default function Sidebar({ user }) {
  const roles = (user && user.roles) || [];
  const isAdmin = user?.is_superuser || roles.includes('Admin') || roles.includes('Super Admin');
  
  const [contentOpen, setContentOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [userMgmtOpen, setUserMgmtOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const activeStyle = { 
    backgroundColor: '#3498db',
    color: '#fff', 
    borderLeft: '4px solid #fff',
    paddingLeft: '16px',
    fontWeight: '600'
  };

  const defaultStyle = {
    display: 'flex', 
    alignItems: 'center', 
    padding: '12px 20px', 
    textDecoration: 'none', 
    color: '#ecf0f1',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    borderLeft: '4px solid transparent',
    marginLeft: '0px'
  };

  const submenuStyle = {
    ...defaultStyle,
    fontSize: '0.9rem',
    paddingLeft: '30px',
    backgroundColor: 'rgba(0, 0, 0, 0.15)'
  };

  const activeSubmenuStyle = {
    ...activeStyle,
    fontSize: '0.9rem',
    paddingLeft: '30px',
    backgroundColor: 'rgba(52, 152, 219, 0.3)'
  };

  const handleContentToggle = (e) => {
    e.preventDefault();
    setContentOpen(!contentOpen);
  };

  const handleAnalyticsToggle = (e) => {
    e.preventDefault();
    setAnalyticsOpen(!analyticsOpen);
  };

  const handleUserMgmtToggle = (e) => {
    e.preventDefault();
    setUserMgmtOpen(!userMgmtOpen);
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!sidebarCollapsed && (
          <div className="logo-container">
            <img src={LOGO_URL} alt="Logo" className="logo" />
            <h2>AGHAMazing Quest CMS</h2>
          </div>
        )}
        <button className="toggle-btn" onClick={toggleSidebar}>
          {sidebarCollapsed ? '»' : '«'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink 
              to="/dashboard" 
              style={({ isActive }) => isActive ? activeStyle : defaultStyle}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              {!sidebarCollapsed && (
                <>
                  <span className="nav-icon">📊</span>
                  <span className="nav-text">Dashboard</span>
                </>
              )}
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/dashboard/account" 
              style={({ isActive }) => isActive ? activeStyle : defaultStyle}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              {!sidebarCollapsed && (
                <>
                  <span className="nav-icon">⚙️</span>
                  <span className="nav-text">Account Settings</span>
                </>
              )}
            </NavLink>
          </li>
          
          <li>
            <a 
              href="#content" 
              style={defaultStyle}
              onClick={handleContentToggle}
              className="nav-link parent-menu"
            >
              {!sidebarCollapsed && (
                <>
                  <span className="nav-icon">📝</span>
                  <span className="nav-text">Content Management</span>
                  <span className="arrow">{contentOpen ? '▲' : '▼'}</span>
                </>
              )}
            </a>
            {contentOpen && !sidebarCollapsed && (
              <ul className="submenu">
                <li>
                  <NavLink 
                    to="/dashboard/content" 
                    style={({ isActive }) => isActive ? activeSubmenuStyle : submenuStyle}
                    className={({ isActive }) => isActive ? "nav-link active submenu-link" : "nav-link submenu-link"}
                  >
                    Manage Content
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/dashboard/content/upload" 
                    style={({ isActive }) => isActive ? activeSubmenuStyle : submenuStyle}
                    className={({ isActive }) => isActive ? "nav-link active submenu-link" : "nav-link submenu-link"}
                  >
                    Upload Content
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/dashboard/content/approve" 
                    style={({ isActive }) => isActive ? activeSubmenuStyle : submenuStyle}
                    className={({ isActive }) => isActive ? "nav-link active submenu-link" : "nav-link submenu-link"}
                  >
                    Approve Content
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/dashboard/content/publish" 
                    style={({ isActive }) => isActive ? activeSubmenuStyle : submenuStyle}
                    className={({ isActive }) => isActive ? "nav-link active submenu-link" : "nav-link submenu-link"}
                  >
                    Publish Content
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/dashboard/content/delete" 
                    style={({ isActive }) => isActive ? activeSubmenuStyle : submenuStyle}
                    className={({ isActive }) => isActive ? "nav-link active submenu-link" : "nav-link submenu-link"}
                  >
                    Delete Content
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
          
          <li>
            <a 
              href="#analytics" 
              style={defaultStyle}
              onClick={handleAnalyticsToggle}
              className="nav-link parent-menu"
            >
              {!sidebarCollapsed && (
                <>
                  <span className="nav-icon">📈</span>
                  <span className="nav-text">Analytics</span>
                  <span className="arrow">{analyticsOpen ? '▲' : '▼'}</span>
                </>
              )}
            </a>
            {analyticsOpen && !sidebarCollapsed && (
              <ul className="submenu">
                <li>
                  <NavLink 
                    to="/dashboard/analytics" 
                    style={({ isActive }) => isActive ? activeSubmenuStyle : submenuStyle}
                    className={({ isActive }) => isActive ? "nav-link active submenu-link" : "nav-link submenu-link"}
                  >
                    Analytics Management
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/dashboard/analytics/generate" 
                    style={({ isActive }) => isActive ? activeSubmenuStyle : submenuStyle}
                    className={({ isActive }) => isActive ? "nav-link active submenu-link" : "nav-link submenu-link"}
                  >
                    Generate Reports
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/dashboard/analytics/view" 
                    style={({ isActive }) => isActive ? activeSubmenuStyle : submenuStyle}
                    className={({ isActive }) => isActive ? "nav-link active submenu-link" : "nav-link submenu-link"}
                  >
                    View Reports
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/dashboard/analytics/download" 
                    style={({ isActive }) => isActive ? activeSubmenuStyle : submenuStyle}
                    className={({ isActive }) => isActive ? "nav-link active submenu-link" : "nav-link submenu-link"}
                  >
                    Download Reports
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
          
          {(isAdmin || user?.is_staff) && !sidebarCollapsed && (
            <li>
              <a 
                href="#user-mgmt" 
                style={defaultStyle}
                onClick={handleUserMgmtToggle}
                className="nav-link parent-menu"
              >
                <span className="nav-icon">👥</span>
                <span className="nav-text">User Management</span>
                <span className="arrow">{userMgmtOpen ? '▲' : '▼'}</span>
              </a>
              {userMgmtOpen && (
                <ul className="submenu">
                  <li>
                    <NavLink 
                      to="/dashboard/users" 
                      style={({ isActive }) => isActive ? activeSubmenuStyle : submenuStyle}
                      className={({ isActive }) => isActive ? "nav-link active submenu-link" : "nav-link submenu-link"}
                    >
                      Manage Users
                    </NavLink>
                  </li>
                  <li>
                    <NavLink 
                      to="/dashboard/users/roles" 
                      style={({ isActive }) => isActive ? activeSubmenuStyle : submenuStyle}
                      className={({ isActive }) => isActive ? "nav-link active submenu-link" : "nav-link submenu-link"}
                    >
                      Manage Roles
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>
      
      {!sidebarCollapsed && (
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-details">
              <span className="username">{user?.username}</span>
              <span className="role">{isAdmin ? 'Administrator' : 'User'}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}