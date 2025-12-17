import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContentForm from '../ContentForm'; // Import the shared form

// SVG Icon Components
const DocumentIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
  </svg>
);

const HelpIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

export default function UploadContentPage() {
  const navigate = useNavigate();

  // Function to call when the form submission is successful
  const handleDone = () => {
    // Navigate back to the main content list or a landing page
    navigate('/dashboard/content');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="border-l-4 border-blue-500 pl-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Upload New Content</h1>
          <p className="text-gray-600 mt-2">Fill out the form below to create and upload new content.</p>
        </div>
        
        <div className="mt-8">
          {/* Pass the onDone handler. item=null triggers the 'POST' (Upload) mode. */}
          <ContentForm onDone={handleDone} />
        </div>
        
        <div className="mt-6 flex items-center">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-4 text-sm text-gray-500 bg-white">Content Management</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-800 flex items-center">
              <DocumentIcon />
              Content Guidelines
            </h3>
            <p className="mt-2 text-sm text-blue-700">Follow our guidelines to ensure your content meets quality standards.</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-semibold text-green-800 flex items-center">
              <UploadIcon />
              File Requirements
            </h3>
            <p className="mt-2 text-sm text-green-700">Supported formats: JPG, PNG, PDF. Max size: 10MB per file.</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 className="font-semibold text-purple-800 flex items-center">
              <HelpIcon />
              Need Help?
            </h3>
            <p className="mt-2 text-sm text-purple-700">Contact support if you have questions about content uploads.</p>
          </div>
        </div>
      </div>
    </div>
  );
}