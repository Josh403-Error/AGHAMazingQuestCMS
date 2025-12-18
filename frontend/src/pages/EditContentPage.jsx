import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentForm from '../ContentForm'; // Import the shared form

export default function EditContentPage() {
  const navigate = useNavigate();
  // Get the 'id' parameter from the URL (e.g., /dashboard/content/edit/123 -> id = '123')
  const { id } = useParams(); 
  const [contentToEdit, setContentToEdit] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('access');

  // --- Fetch Content Item ---
  useEffect(() => {
    if (!id) {
        setLoading(false);
        setError("No content ID provided in the URL.");
        return;
    }
    
    // API call to fetch the specific item details
    const fetchItem = async () => {
        try {
            const res = await fetch(`/api/content/content/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to load content: ${res.status} ${errorText}`);
            }
            
            const data = await res.json();
            setContentToEdit(data);
        } catch (err) {
            console.error(err);
            setError(err.message || 'An error occurred while fetching content.');
        } finally {
            setLoading(false);
        }
    };

    fetchItem();
  }, [id, token]);
  // --- End Fetch Content Item ---


  // Function to call when the form submission is successful
  const handleDone = () => {
    // Navigate back to the main content list
    navigate('/dashboard/content');
  };

  if (loading) {
      return (
          <div className="card">
              <h2>Edit Content</h2>
              <p>Loading content ID: {id}...</p>
          </div>
      );
  }

  if (error) {
      return (
          <div className="card" style={{ borderLeft: '4px solid red' }}>
              <h2>Error Loading Content</h2>
              <p>{error}</p>
          </div>
      );
  }

  if (!contentToEdit) {
      return (
          <div className="card">
              <h2>Content Not Found</h2>
              <p>The content item with ID **{id}** could not be loaded.</p>
          </div>
      );
  }

  return (
    <div className="card">
      <h2>Edit Content ID: {id}</h2>
      <p>Modify the details of the selected content item.</p>
      {/* Pass the fetched item to ContentForm. ContentForm handles PATCH request. */}
      <ContentForm item={contentToEdit} onDone={handleDone} />
    </div>
  );
}