import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContentForm from '../ContentForm'; // Import the shared form

export default function UploadContentPage() {
  const navigate = useNavigate();

  // Function to call when the form submission is successful
  const handleDone = () => {
    // Navigate back to the main content list or a landing page
    navigate('/dashboard/content');
  };

  return (
    <div className="card">
      <h2>Upload New Content</h2>
      <p>Fill out the form below to create and upload new content.</p>
      {/* Pass the onDone handler. item=null triggers the 'POST' (Upload) mode. */}
      <ContentForm onDone={handleDone} />
    </div>
  );
}