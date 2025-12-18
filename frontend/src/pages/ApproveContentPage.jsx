import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import ContentPreview from '../components/ContentPreview';

export default function ApproveContentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedItems, setSelectedItems] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const token = localStorage.getItem('access');

  const outlet = useOutletContext();
  const outletUser = outlet?.user || null;

  // Only Approver role and superuser can access the approve screen.
  const allowed = (outletUser && (outletUser.is_superuser || (outletUser.roles || []).includes('Approver') || (outletUser.roles || []).includes('Super Admin'))) || false;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content/content/?status=for_approval', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setItems(data);
      
      // Extract unique authors
      const uniqueAuthors = [...new Set(data.map(item => 
        `${item.author?.first_name} ${item.author?.last_name}|${item.author?.id}`
      ))].map(authorStr => {
        const [name, id] = authorStr.split('|');
        return { id, name };
      });
      setAuthors(uniqueAuthors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/content/content/${id}/approve_content/`, { 
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error('Failed to approve item');
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveSelected = async () => {
    for (const id of selectedItems) {
      try {
        await fetch(`/api/content/content/${id}/approve_content/`, { 
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` } 
        });
      } catch (err) {
        console.error(`Failed to approve item ${id}:`, err);
      }
    }
    fetchItems();
    setSelectedItems([]);
  };

  const handleDeny = async (id) => {
    try {
      const res = await fetch(`/api/content/content/${id}/deny_content/`, { 
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error('Failed to deny item');
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDenySelected = async () => {
    for (const id of selectedItems) {
      try {
        await fetch(`/api/content/content/${id}/deny_content/`, { 
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` } 
        });
      } catch (err) {
        console.error(`Failed to deny item ${id}:`, err);
      }
    }
    fetchItems();
    setSelectedItems([]);
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(item => item.content_type === filterType);
    }
    
    // Apply author filter
    if (filterAuthor !== 'all') {
      result = result.filter(item => item.author?.id === filterAuthor);
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
  }, [items, searchTerm, filterType, filterAuthor, sortBy, sortOrder]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === currentItems.length && currentItems.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item.id));
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'ar_marker':
        return 'bg-primary';
      case 'video':
        return 'bg-danger';
      case 'music':
        return 'bg-info';
      case 'image':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Move this check after all hooks are declared
  if (!allowed) return <div><h2>Access denied</h2><p>You don't have permission to approve or publish content.</p></div>;

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 mb-0 text-gray-800">Content Approval</h1>
          <p className="mb-0 text-muted">Review and approve content submissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Pending Approval
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{items.length}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clock fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Authors
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{authors.length}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-users fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Selected
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{selectedItems.length}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-check-square fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Filters & Search</h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by title, excerpt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Content Type</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="article">Article</option>
                <option value="ar_marker">AR Marker</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="music">Music/Audio</option>
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Author</label>
              <select
                className="form-select"
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
              >
                <option value="all">All Authors</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Sort By</label>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="created_at">Submission Date</option>
                  <option value="title">Title</option>
                  <option value="content_type">Content Type</option>
                  <option value="author">Author</option>
                </select>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="card shadow mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {selectedItems.length} item(s) selected
              </div>
              <div>
                <button 
                  className="btn btn-sm btn-outline-success me-2"
                  onClick={handleApproveSelected}
                >
                  <i className="fas fa-check me-1"></i>
                  Approve Selected
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleDenySelected}
                >
                  <i className="fas fa-times me-1"></i>
                  Deny Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">Pending Approvals</h6>
          <span className="badge bg-primary">{filteredAndSortedItems.length} items</span>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading content items...</p>
            </div>
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
              <h5>No content pending approval</h5>
              <p className="text-muted">
                {searchTerm || filterType !== 'all' || filterAuthor !== 'all'
                  ? 'Try adjusting your search or filter criteria' 
                  : 'All content has been reviewed'}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="thead-light">
                    <tr>
                      <th width="5%">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                            onChange={handleSelectAll}
                          />
                        </div>
                      </th>
                      <th onClick={() => handleSort('title')} className="cursor-pointer">
                        Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('content_type')} className="cursor-pointer">
                        Type {sortBy === 'content_type' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Excerpt</th>
                      <th onClick={() => handleSort('author')} className="cursor-pointer">
                        Author {sortBy === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('created_at')} className="cursor-pointer">
                        Submitted {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th width="15%">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(item => (
                      <tr key={item.id} className={selectedItems.includes(item.id) ? 'table-active' : ''}>
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                            />
                          </div>
                        </td>
                        <td className="fw-bold">{item.title}</td>
                        <td>
                          <span className={`badge ${getTypeBadgeClass(item.content_type)}`}>
                            {item.content_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '200px' }}>
                            {item.excerpt}
                          </div>
                        </td>
                        <td>
                          {item.author?.first_name} {item.author?.last_name}
                        </td>
                        <td>{formatDate(item.created_at)}</td>
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-info"
                              onClick={() => setPreviewItem(item)}
                              title="Preview"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-outline-success"
                              onClick={() => handleApprove(item.id)}
                              title="Approve"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDeny(item.id)}
                              title="Deny"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Content pagination">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <ContentPreview 
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          showApproveDeny={true}
          onApprove={() => {
            handleApprove(previewItem.id);
            setPreviewItem(null);
          }}
          onDeny={() => {
            handleDeny(previewItem.id);
            setPreviewItem(null);
          }}
        />
      )}
    </div>
  );
}