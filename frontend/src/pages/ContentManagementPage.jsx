import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import ContentForm from '../ContentForm';
import ContentPreview from '../components/ContentPreview';
import statusLabel from '../utils/statusLabels';

export default function ContentManagementPage() {
  const { user } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const token = localStorage.getItem('access');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content/content/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load items');
      const data = await res.json();
      // Only show items that are in an "editable" state on the Edit Content page.
      // Once an item moves to approval/publishing/published it should live in those
      // respective sections and not reappear here unless an approver denies it.
      const editableStatuses = new Set(['for_editing', 'uploaded', 'edited']);
      const visible = data.filter(i => {
        const s = (i.status || '').toLowerCase();
        if (!s) return false;
        if (s === 'deleted') return false;
        return editableStatuses.has(s);
      });
      setItems(visible);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`/api/content/content/${id}/${action}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to ${action} item`);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAction = async (action) => {
    for (const id of selectedItems) {
      try {
        await fetch(`/api/content/content/${id}/${action}/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error(`Failed to ${action} item ${id}:`, err);
      }
    }
    fetchItems();
    setSelectedItems([]);
  };

  const filterAndSortItems = useCallback(() => {
    let result = [...items];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(item => item.status === filterStatus);
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(item => item.content_type === filterType);
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
  }, [items, searchTerm, filterStatus, filterType, sortBy, sortOrder]);
  
  const filteredAndSortedItems = useMemo(() => filterAndSortItems(), [filterAndSortItems]);

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
      case 'for_editing':
        return 'bg-secondary';
      case 'pending_review':
      case 'for_approval':
        return 'bg-warning';
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 mb-0 text-gray-800">Content Management</h1>
          <p className="mb-0 text-muted">Create, edit, and manage your content</p>
        </div>
        <div className="col-auto">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
          >
            <i className="fas fa-plus-circle me-2"></i>
            Create New Content
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Content
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{items.length}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-file-alt fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Published
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {items.filter(i => i.status === 'approved').length}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-check-circle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Drafts
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {items.filter(i => i.status === 'draft').length}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-edit fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Pending Review
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {items.filter(i => i.status === 'pending_review').length}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clock fa-2x text-gray-300"></i>
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
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="for_editing">For Editing</option>
                <option value="uploaded">Uploaded</option>
                <option value="edited">Edited</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Content Type</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="ar_marker">AR Marker</option>
                <option value="video">Video</option>
                <option value="music">Music</option>
                <option value="image">Image</option>
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
                  <option value="created_at">Created Date</option>
                  <option value="updated_at">Updated Date</option>
                  <option value="title">Title</option>
                  <option value="content_type">Content Type</option>
                  <option value="status">Status</option>
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
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => handleBulkAction('publish')}
                >
                  <i className="fas fa-paper-plane me-1"></i>
                  Publish
                </button>
                <button 
                  className="btn btn-sm btn-outline-warning me-2"
                  onClick={() => handleBulkAction('send_for_review')}
                >
                  <i className="fas fa-share me-1"></i>
                  Send for Review
                </button>
                <button 
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleBulkAction('soft_delete')}
                >
                  <i className="fas fa-trash me-1"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="card shadow mb-4">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">Content Items</h6>
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
              <h5>No content items found</h5>
              <p className="text-muted">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Get started by creating your first content item'}
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreate(true)}
              >
                <i className="fas fa-plus-circle me-2"></i>
                Create Content
              </button>
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
                      <th onClick={() => handleSort('created_at')} className="cursor-pointer">
                        Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('status')} className="cursor-pointer">
                        Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                        <td>{formatDate(item.created_at)}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                            {statusLabel(item.status)}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => setEditing(item)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-outline-info"
                              onClick={() => setPreviewItem(item)}
                              title="Preview"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-outline-success"
                              onClick={() => doAction(item.id, 'send_for_review')}
                              title="Send for Review"
                            >
                              <i className="fas fa-share"></i>
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

      {/* Modals */}
      {showCreate && (
        <ContentForm 
          onCancel={() => setShowCreate(false)} 
          onSaved={() => { setShowCreate(false); fetchItems(); }} 
        />
      )}
      
      {editing && (
        <ContentForm 
          content={editing}
          onCancel={() => setEditing(null)} 
          onSaved={() => { setEditing(null); fetchItems(); }} 
        />
      )}
      
      {previewItem && (
        <ContentPreview 
          item={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  );
}