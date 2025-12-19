import React, { useEffect, useState } from 'react';
import { fetchAuth } from '../api';

function fileTypeFromUrl(url) {
  if (!url) return 'none';
  const u = url.split('?')[0].toLowerCase();
  if (u.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) return 'image';
  if (u.match(/\.(mp4|webm|ogg|mov)$/)) return 'video';
  if (u.match(/\.(mp3|wav|m4a|aac)$/)) return 'audio';
  if (u.match(/\.(pdf)$/)) return 'pdf';
  return 'other';
}

export default function ContentPreview({ item: initialItem, id, onClose, showApproveDeny = false, onApprove, onDeny }) {
  const [item, setItem] = useState(initialItem || null);
  const [loading, setLoading] = useState(!initialItem && !!id);
  const [activeTab, setActiveTab] = useState('preview');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await fetchAuth(`/api/content/content/${id}/`);
        setItem(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id, fetchAuth]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Loading Content...</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2">Loading content preview...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Content Not Found</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center py-5">
              <i className="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
              <p>Could not load content preview.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{item.title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preview')}
                >
                  <i className="fas fa-eye me-1"></i>
                  Preview
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  <i className="fas fa-info-circle me-1"></i>
                  Details
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  <i className="fas fa-chart-bar me-1"></i>
                  Analytics
                </button>
              </li>
            </ul>

            {activeTab === 'preview' && (
              <div className="preview-content">
                <div className="row">
                  <div className="col-lg-8">
                    <div className="mb-3">
                      <span className="badge bg-primary me-2">
                        {item.content_type?.replace('_', ' ')}
                      </span>
                      <span className="badge bg-secondary">
                        {item.status}
                      </span>
                    </div>
                    
                    <h1 className="mb-3">{item.title}</h1>
                    <p className="lead mb-4">{item.excerpt}</p>
                    
                    {item.file_path && fileTypeFromUrl(item.file_path) === 'image' && (
                      <div className="mb-4 text-center">
                        <img 
                          src={item.file_path} 
                          alt={item.title} 
                          className="img-fluid rounded" 
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                    )}
                    
                    {item.file_path && fileTypeFromUrl(item.file_path) === 'video' && (
                      <div className="mb-4">
                        <video controls className="w-100 rounded">
                          <source src={item.file_path} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                    
                    {item.file_path && fileTypeFromUrl(item.file_path) === 'audio' && (
                      <div className="mb-4">
                        <audio controls className="w-100">
                          <source src={item.file_path} type="audio/mpeg" />
                          Your browser does not support the audio tag.
                        </audio>
                      </div>
                    )}
                    
                    <div 
                      dangerouslySetInnerHTML={{ __html: item.body }} 
                      className="content-body"
                    />
                  </div>
                  
                  <div className="col-lg-4">
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6 className="mb-0">Content Information</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <small className="text-muted">Author</small>
                          <div>
                            {item.author?.first_name} {item.author?.last_name}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <small className="text-muted">Published</small>
                          <div>
                            {item.published_at ? formatDate(item.published_at) : 'Not published'}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <small className="text-muted">Created</small>
                          <div>{formatDate(item.created_at)}</div>
                        </div>
                        
                        <div className="mb-3">
                          <small className="text-muted">Last Updated</small>
                          <div>{formatDate(item.updated_at)}</div>
                        </div>
                      </div>
                    </div>
                    
                    {item.analytics && (
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">Performance Metrics</h6>
                        </div>
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Views</span>
                            <strong>{item.analytics.view_count || 0}</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Engagement</span>
                            <strong>
                              {item.analytics.engagement_score ? 
                                `${item.analytics.engagement_score.toFixed(1)}%` : 'N/A'}
                            </strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Conversion</span>
                            <strong>
                              {item.analytics.conversion_rate ? 
                                `${item.analytics.conversion_rate.toFixed(1)}%` : 'N/A'}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'details' && (
              <div className="details-content">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Title</label>
                      <div>{item.title}</div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold">Excerpt</label>
                      <div>{item.excerpt}</div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold">Content Type</label>
                      <div>
                        <span className="badge bg-primary">
                          {item.content_type?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold">Status</label>
                      <div>
                        <span className="badge bg-secondary">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Author</label>
                      <div>
                        {item.author?.first_name} {item.author?.last_name}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold">Created</label>
                      <div>{formatDate(item.created_at)}</div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold">Last Updated</label>
                      <div>{formatDate(item.updated_at)}</div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold">Published</label>
                      <div>
                        {item.published_at ? formatDate(item.published_at) : 'Not published'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">Full Content</label>
                  <div className="border rounded p-3">
                    <div dangerouslySetInnerHTML={{ __html: item.body }} />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div className="analytics-content">
                {item.analytics ? (
                  <div className="row">
                    <div className="col-lg-4 mb-4">
                      <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                Total Views
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">
                                {item.analytics.view_count || 0}
                              </div>
                            </div>
                            <div className="col-auto">
                              <i className="fas fa-eye fa-sm text-gray-300"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-lg-4 mb-4">
                      <div className="card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                Engagement Score
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">
                                {item.analytics.engagement_score ? 
                                  `${item.analytics.engagement_score.toFixed(1)}%` : 'N/A'}
                              </div>
                            </div>
                            <div className="col-auto">
                              <i className="fas fa-percentage fa-sm text-gray-300"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-lg-4 mb-4">
                      <div className="card border-left-info shadow h-100 py-2">
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                Conversion Rate
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">
                                {item.analytics.conversion_rate ? 
                                  `${item.analytics.conversion_rate.toFixed(1)}%` : 'N/A'}
                              </div>
                            </div>
                            <div className="col-auto">
                              <i className="fas fa-chart-line fa-sm text-gray-300"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">Detailed Analytics</h6>
                        </div>
                        <div className="card-body">
                          <div className="table-responsive">
                            <table className="table">
                              <tbody>
                                <tr>
                                  <td>Last Viewed</td>
                                  <td>
                                    {item.analytics.last_viewed_at ? 
                                      formatDate(item.analytics.last_viewed_at) : 'Never'}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Report Generated</td>
                                  <td>{formatDate(item.analytics.report_generated_at)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                    <h5>No Analytics Data Available</h5>
                    <p className="text-muted">
                      Analytics data will be available after content is published and viewed.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            {showApproveDeny && (
              <>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={onApprove}
                >
                  <i className="fas fa-check fa-sm me-1"></i>
                  Approve
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={onDeny}
                >
                  <i className="fas fa-times fa-sm me-1"></i>
                  Deny
                </button>
              </>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}