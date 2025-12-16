// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupScreen from './SignupScreen.jsx';
import GoogleAuthScreen from './GoogleAuthScreen.jsx';
import SignInScreen from './SignInScreen.jsx';
import Dashboard from './Dashboard.jsx';
import React from 'react';
import './styles.css'; // Global CSS import

// 🔑 ADDED: Placeholder imports for the new nested routes
// NOTE: You must create these files in src/pages/ for the app to compile.
const PlaceholderPage = ({ name }) => <h1>{name} Page Content</h1>;

const UploadContentPage = () => <PlaceholderPage name="Upload Content" />;
const EditContentPage = () => <PlaceholderPage name="Edit Content" />;
const ApproveContentPage = () => <PlaceholderPage name="Approve Content" />;
const PublishContentPage = () => <PlaceholderPage name="Publish Content" />;
const DeleteContentPage = () => <PlaceholderPage name="Delete Content" />;
const GenerateAnalyticsPage = () => <PlaceholderPage name="Generate Analytics" />;
const ViewAnalyticsPage = () => <PlaceholderPage name="View Analytics" />;
const DownloadAnalyticsPage = () => <PlaceholderPage name="Download Analytics" />;
const UserManagementPage = () => <PlaceholderPage name="User Management" />;
const RolesPage = () => <PlaceholderPage name="User Roles" />;
// You can remove these placeholder components once you create the real files.


function App() {
return (
<Router>
  <Routes>
    {/* Authentication Routes (Keep the flat structure for auth) */}
    <Route path="/" element={<SignupScreen />} />
    <Route path="/signup" element={<SignupScreen />} />
    <Route path="/google-auth" element={<GoogleAuthScreen />} />
    <Route path="/signin" element={<SignInScreen />} />
    
    {/* 🔑 MODIFIED: Nested Dashboard Route */}
    <Route path="/dashboard" element={<Dashboard />}>
      {/* Dashboard Index: Shown when URL is exactly /dashboard */}
      <Route index element={<h2 style={{ padding: '20px' }}>Welcome! Select a section from the sidebar.</h2>} />

      {/* Content Management Sub-Routes */}
      <Route path="content/upload" element={<UploadContentPage />} />
      <Route path="content/edit" element={<EditContentPage />} />
      <Route path="content/approve" element={<ApproveContentPage />} />
      <Route path="content/publish" element={<PublishContentPage />} />
      <Route path="content/delete" element={<DeleteContentPage />} />
      
      {/* Analytics Management Sub-Routes */}
      <Route path="analytics/generate" element={<GenerateAnalyticsPage />} />
      <Route path="analytics/view" element={<ViewAnalyticsPage />} />
      <Route path="analytics/download" element={<DownloadAnalyticsPage />} />

      {/* User Management Sub-Routes */}
      <Route path="users" element={<UserManagementPage />} />
      <Route path="users/roles" element={<RolesPage />} />

      {/* Optional: Catch-all for /dashboard/* pages */}
      <Route path="*" element={<h1 style={{ padding: '20px' }}>404 Dashboard Content Not Found</h1>} />
    </Route>

    {/* Optional: General 404/Catch-all route */}
    <Route path="*" element={<h1>404 Not Found</h1>} />
  </Routes>
</Router>
);
}

export default App;