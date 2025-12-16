import React, { useState, useEffect } from 'react';

const ContentManagementPage = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching content data
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        const mockData = [
          { id: 1, title: 'Introduction to Science', status: 'Published', author: 'Admin', date: '2023-05-15' },
          { id: 2, title: 'Mathematics Basics', status: 'Draft', author: 'Editor', date: '2023-05-18' },
          { id: 3, title: 'History of Philippines', status: 'Pending Approval', author: 'Contributor', date: '2023-05-20' },
          { id: 4, title: 'Geography Overview', status: 'Published', author: 'Admin', date: '2023-05-10' },
        ];
        setContents(mockData);
      } catch (err) {
        setError('Failed to load content data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'status-published';
      case 'draft':
        return 'status-draft';
      case 'pending approval':
        return 'status-pending';
      default:
        return 'status-default';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="header-section">
        <h2>Content Management</h2>
        <button className="btn btn-primary">Add New Content</button>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Author</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contents.map((content) => (
              <tr key={content.id}>
                <td>{content.title}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(content.status)}`}>
                    {content.status}
                  </span>
                </td>
                <td>{content.author}</td>
                <td>{content.date}</td>
                <td>
                  <button className="btn btn-secondary btn-sm">Edit</button>
                  <button className="btn btn-danger btn-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="pagination">
        <button className="btn btn-secondary">Previous</button>
        <span>Page 1 of 3</span>
        <button className="btn btn-secondary">Next</button>
      </div>
    </div>
  );
};

export default ContentManagementPage;