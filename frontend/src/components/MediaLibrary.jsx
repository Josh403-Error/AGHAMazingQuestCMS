import React, { useState, useEffect } from 'react';

const MediaLibrary = ({ onSelect, multiSelect = false }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('access');

  useEffect(() => {
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content/media/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load media items');
      const data = await res.json();
      setMediaItems(data);
    } catch (err) {
      console.error('Error fetching media items:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedItems = React.useMemo(() => {
    let result = [...mediaItems];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(item => 
        item.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(item => {
        if (filterType === 'image') {
          return item.mime_type?.startsWith('image/');
        } else if (filterType === 'video') {
          return item.mime_type?.startsWith('video/');
        } else if (filterType === 'audio') {
          return item.mime_type?.startsWith('audio/');
        }
        return true;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [mediaItems, searchTerm, filterType, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectItem = (item) => {
    if (onSelect) {
      if (multiSelect) {
        if (selectedItems.includes(item.id)) {
          setSelectedItems(selectedItems.filter(id => id !== item.id));
        } else {
          setSelectedItems([...selectedItems, item.id]);
        }
      } else {
        onSelect(item);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('description', uploadDescription);
      formData.append('tags', uploadTags);

      const res = await fetch('/api/content/media/upload/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const newItem = await res.json();
      setMediaItems([newItem, ...mediaItems]);
      setUploadModalOpen(false);
      resetUploadForm();
      alert('File uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadDescription('');
    setUploadTags('');
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) {
      return 'fas fa-image text-primary';
    } else if (mimeType?.startsWith('video/')) {
      return 'fas fa-video text-danger';
    } else if (mimeType?.startsWith('audio/')) {
      return 'fas fa-music text-info';
    } else if (mimeType === 'application/pdf') {
      return 'fas fa-file-pdf text-danger';
    } else {
      return 'fas fa-file text-muted';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="media-library">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Media Library</h5>
        <div>
          <button 
            className="btn btn-primary btn-sm me-2"
            onClick={() => setUploadModalOpen(true)}
          >
            <i className="fas fa-upload me-1"></i>
            Upload
          </button>
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-outline-secondary btn-sm ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <i className="fas fa-th"></i>
            </button>
            <button
              type="button"
              className={`btn btn-outline-secondary btn-sm ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <div className="col-md-4">
              <div className="d-flex">
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="created_at">Upload Date</option>
                  <option value="file_name">Name</option>
                  <option value="file_size">File Size</option>
                </select>
                <button 
                  className="btn btn-outline-secondary ms-2"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Items */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading media items...</p>
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-photo-video fa-3x text-muted mb-3"></i>
          <h5>No media items found</h5>
          <p className="text-muted">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by uploading your first media item'}
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setUploadModalOpen(true)}
          >
            <i className="fas fa-upload me-2"></i>
            Upload Media
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="row">
          {filteredAndSortedItems.map(item => (
            <div key={item.id} className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4">
              <div 
                className={`card h-100 media-item-card ${selectedItems.includes(item.id) ? 'border-primary border-2' : ''}`}
                onClick={() => handleSelectItem(item)}
              >
                <div className="card-img-top d-flex align-items-center justify-content-center" style={{ height: '100px', backgroundColor: '#f8f9fa' }}>
                  {item.mime_type?.startsWith('image/') ? (
                    <img 
                      src={item.file_path} 
                      alt={item.file_name} 
                      className="img-fluid" 
                      style={{ maxHeight: '90px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="text-center p-2">
                      <i className={`${getFileIcon(item.mime_type)} fa-lg`}></i>
                      <div className="mt-1 small text-muted">{item.file_name}</div>
                    </div>
                  )}
                </div>
                <div className="card-body p-2">
                  <div className="small fw-bold text-truncate" title={item.file_name}>
                    {item.file_name}
                  </div>
                  <div className="small text-muted">
                    {formatFileSize(item.file_size)}
                  </div>
                </div>
                <div className="card-footer p-2 small text-muted">
                  {formatDate(item.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="thead-light">
              <tr>
                {multiSelect && <th width="5%"></th>}
                <th onClick={() => handleSort('file_name')} className="cursor-pointer">
                  Name {sortBy === 'file_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Type</th>
                <th onClick={() => handleSort('file_size')} className="cursor-pointer">
                  Size {sortBy === 'file_size' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Tags</th>
                <th onClick={() => handleSort('created_at')} className="cursor-pointer">
                  Uploaded {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedItems.map(item => (
                <tr 
                  key={item.id} 
                  className={selectedItems.includes(item.id) ? 'table-active' : ''}
                  onClick={() => handleSelectItem(item)}
                >
                  {multiSelect && (
                    <td>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => e.stopPropagation()}
                        />
                      </div>
                    </td>
                  )}
                  <td>
                    <div className="d-flex align-items-center">
                      <i className={`${getFileIcon(item.mime_type)} me-1`}></i>
                      <span className="text-truncate" style={{ maxWidth: '180px' }}>
                        {item.file_name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-secondary">
                      {item.mime_type?.split('/')[1] || item.mime_type}
                    </span>
                  </td>
                  <td>{formatFileSize(item.file_size)}</td>
                  <td>
                    {item.tags && item.tags.map((tag, index) => (
                      <span key={index} className="badge bg-light text-dark me-1">
                        {tag}
                      </span>
                    ))}
                  </td>
                  <td>{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Media</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setUploadModalOpen(false);
                    resetUploadForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleUpload}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">File *</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      rows="2"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tags</label>
                    <input
                      type="text"
                      className="form-control"
                      value={uploadTags}
                      onChange={(e) => setUploadTags(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                    />
                    <div className="form-text">
                      Separate tags with commas
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setUploadModalOpen(false);
                      resetUploadForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload me-2"></i>
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;