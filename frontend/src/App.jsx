import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import ContentManagementPage from './pages/ContentManagementPage.js';
import UploadContentPage from './pages/UploadContentPages.js';
import EditContentPage from './pages/EditContentPage.js';
import ApproveContentPage from './pages/ApproveContentPage.js';
import PublishContentPage from './pages/PublishContentPage.js';
import DeleteContentPage from './pages/DeleteContentPage.js';
import GenerateAnalyticsPage from './pages/GenerateAnalyticsPage.js';
import ViewAnalyticsPage from './pages/ViewAnalyticsPage.js';
import DownloadAnalyticsPage from './pages/DownloadAnalyticsPage.js';
import AnalyticsManagementPage from './pages/AnalyticsManagementPage.js';
import UserManagementPage from './pages/UserManagementPage.js';
import RolesPage from './pages/RolesPage.js';
import ForgotPassword from './ForgotPassword.jsx';
import ResetPassword from './ResetPassword.jsx';
import AccountSettings from './AccountSettings.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LoginWrapper />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard/*" element={<Dashboard />}>
            <Route index element={
              <div className="dashboard-content">
                <div className="welcome-section">
                  <h2>Welcome to AGHAMazing Quest CMS</h2>
                  <p>Select a section from the sidebar to get started.</p>
                </div>
                <div className="info-cards">
                  <div className="info-card">
                    <h3>Content Management</h3>
                    <p>Manage all your educational content in one place.</p>
                  </div>
                  <div className="info-card">
                    <h3>Analytics</h3>
                    <p>Track engagement and performance metrics.</p>
                  </div>
                  <div className="info-card">
                    <h3>User Management</h3>
                    <p>Control access and permissions for your team.</p>
                  </div>
                </div>
              </div>
            } />
            <Route path="content" element={<ContentManagementPage />} />
            <Route path="content/upload" element={<UploadContentPage />} />
            <Route path="content/edit/:id" element={<EditContentPage />} />
            <Route path="content/approve" element={<ApproveContentPage />} />
            <Route path="content/publish" element={<PublishContentPage />} />
            <Route path="content/delete" element={<DeleteContentPage />} />
            <Route path="analytics/generate" element={<GenerateAnalyticsPage />} />
            <Route path="analytics/view" element={<ViewAnalyticsPage />} />
            <Route path="analytics/download" element={<DownloadAnalyticsPage />} />
            <Route path="analytics" element={<AnalyticsManagementPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="users/roles" element={<RolesPage />} />
            <Route path="account" element={<AccountSettings />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function LoginWrapper() {
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <Login onLogin={(tokens) => {
          localStorage.setItem('access', tokens.access);
          localStorage.setItem('refresh', tokens.refresh);
          window.location.href = '/dashboard';
        }} />
      </div>
    </div>
  );
}

export default App;