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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginWrapper />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<div>Select a section from the sidebar.</div>} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function LoginWrapper() {
  return (
    <div style={{ padding: 20 }}>
      <h2>AGHAMazingQuestCMS — Demo Frontend</h2>
      <Login onLogin={(tokens) => {
        localStorage.setItem('access', tokens.access);
        localStorage.setItem('refresh', tokens.refresh);
        window.location.href = '/dashboard';
      }} />
    </div>
  );
}

export default App;