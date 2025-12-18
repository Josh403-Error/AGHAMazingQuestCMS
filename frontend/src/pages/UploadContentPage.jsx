import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';

export default function UploadContentPage() {
  const navigate = useNavigate();
  
  // State to manage all form fields
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    body: '',
    contentType: 'article',
    categoryId: '',
    filePath: '',
    status: 'draft',
    arMarker: false,
    code: '',
    location: '',
    tags: '',
    scheduledPublish: false,
    publishAt: '',
    seoTitle: '',
    seoDescription: '',
    metaKeywords: '',
  });

  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewMode, setPreviewMode] = useState(false);
  const [seoScore, setSeoScore] = useState(0);

  // Fetch content categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('access');
        const res = await fetch('/api/content/categories/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  // Generic handler for all input changes
  const handleChange = useCallback((e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Update SEO score when relevant fields change
    if (name === 'title' || name === 'excerpt' || name === 'seoTitle' || name === 'seoDescription') {
      calculateSeoScore({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  }, [errors, formData, calculateSeoScore]);

  const handleImageFileChange = useCallback((e) => {
    setImageFile(e.target.files[0]);
  }, []);

  const handleMediaFilesChange = useCallback((e) => {
    setMediaFiles(Array.from(e.target.files));
  }, []);

  const handleBodyChange = useCallback((content) => {
    setFormData(prev => ({ ...prev, body: content }));
    calculateSeoScore({ ...formData, body: content });
  }, [formData, calculateSeoScore]);

  const calculateSeoScore = useCallback((data) => {
    let score = 0;
    const titleLength = data.title?.length || 0;
    const excerptLength = data.excerpt?.length || 0;
    const bodyLength = data.body?.length || 0;
    const seoTitleLength = data.seoTitle?.length || 0;
    const seoDescLength = data.seoDescription?.length || 0;
    
    // Title length scoring
    if (titleLength >= 30 && titleLength <= 60) score += 20;
    else if (titleLength > 0) score += 10;
    
    // Excerpt length scoring
    if (excerptLength >= 100 && excerptLength <= 160) score += 20;
    else if (excerptLength > 0) score += 10;
    
    // Body length scoring
    if (bodyLength >= 300) score += 20;
    else if (bodyLength > 0) score += 10;
    
    // SEO title scoring
    if (seoTitleLength >= 30 && seoTitleLength <= 60) score += 15;
    else if (seoTitleLength > 0) score += 5;
    
    // SEO description scoring
    if (seoDescLength >= 100 && seoDescLength <= 160) score += 15;
    else if (seoDescLength > 0) score += 5;
    
    // Keywords scoring
    if (data.metaKeywords?.length > 0) score += 10;
    
    setSeoScore(Math.min(score, 100));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length > 500) {
      newErrors.excerpt = 'Excerpt must be less than 500 characters';
    }
    
    if (!formData.body.trim()) {
      newErrors.body = 'Content body is required';
    }
    
    if (formData.contentType === 'ar_marker' && !formData.code.trim()) {
      newErrors.code = 'AR Marker code is required for AR content';
    }
    
    if (formData.scheduledPublish && !formData.publishAt) {
      newErrors.publishAt = 'Publish date and time are required for scheduled publishing';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      
      // Prepare form data
      const data = new FormData();
      data.append('title', formData.title);
      data.append('excerpt', formData.excerpt);
      data.append('body', formData.body);
      data.append('content_type', formData.contentType);
      data.append('status', formData.status);
      
      if (formData.categoryId) {
        data.append('category_id', formData.categoryId);
      }
      
      if (formData.arMarker && formData.code) {
        data.append('ar_marker_code', formData.code);
      }
      
      if (formData.location) {
        data.append('location', formData.location);
      }
      
      if (formData.tags) {
        data.append('tags', formData.tags);
      }
      
      if (formData.scheduledPublish && formData.publishAt) {
        data.append('scheduled_publish_at', formData.publishAt);
      }
      
      if (formData.seoTitle) {
        data.append('seo_title', formData.seoTitle);
      }
      
      if (formData.seoDescription) {
        data.append('seo_description', formData.seoDescription);
      }
      
      if (formData.metaKeywords) {
        data.append('meta_keywords', formData.metaKeywords);
      }
      
      // Add files
      if (imageFile) {
        data.append('featured_image', imageFile);
      }
      
      mediaFiles.forEach((file, index) => {
        data.append(`media_${index}`, file);
      });
      
      const res = await fetch('/api/content/upload/', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
      }
      
      // Success - redirect to content management
      navigate('/dashboard/content/manage');
    } catch (err) {
      console.error('Upload error:', err);
      alert(`Error uploading content: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [formData, imageFile, mediaFiles, validateForm, navigate]);

  const togglePreviewMode = useCallback(() => {
    setPreviewMode(prev => !prev);
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 mb-0 text-gray-800">Upload Content</h1>
          <p className="mb-0 text-muted">Create and upload new content items</p>
        </div>
        <div className="col-auto">
          <button 
            type="button"
            className="btn btn-outline-secondary me-2"
            onClick={togglePreviewMode}
          >
            <i className={`fas ${previewMode ? 'fa-edit' : 'fa-eye'} me-2`}></i>
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/dashboard/content/manage')}
          >
            <i className="fas fa-times me-2"></i>
            Cancel
          </button>
        </div>
      </div>

      {/* SEO Score Indicator */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">SEO Readiness Score</h5>
              <p className="mb-0 text-muted small">Optimize your content for search engines</p>
            </div>
            <div className="text-center">
              <div className="circular-progress">
                <svg width="80" height="80" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#eee" strokeWidth="8" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke={seoScore >= 80 ? "#28a745" : seoScore >= 50 ? "#ffc107" : "#dc3545"} 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray={`${seoScore * 2.83} 283`}
                    transform="rotate(-90 50 50)"
                  />
                  <text x="50" y="50" textAnchor="middle" dy=".3em" fontSize="20" fontWeight="bold">
                    {seoScore}
                  </text>
                </svg>
              </div>
              <div className="mt-2">
                <span className={`badge ${
                  seoScore >= 80 ? "bg-success" : 
                  seoScore >= 50 ? "bg-warning" : "bg-danger"
                }`}>
                  {seoScore >= 80 ? "Excellent" : 
                   seoScore >= 50 ? "Good" : "Needs Improvement"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Main Content Section */}
          <div className={previewMode ? "col-lg-12" : "col-lg-8"}>
            <div className="card shadow mb-4">
              <div className="card-header py-3 d-flex justify-content-between align-items-center">
                <h6 className="m-0 font-weight-bold text-primary">Content Details</h6>
                {previewMode && (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-primary"
                    onClick={togglePreviewMode}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Edit
                  </button>
                )}
              </div>
              <div className="card-body">
                {previewMode ? (
                  <div className="preview-content">
                    <h1 className="mb-3">{formData.title || "Content Title"}</h1>
                    <p className="lead mb-4">{formData.excerpt || "Content excerpt will appear here..."}</p>
                    <div 
                      dangerouslySetInnerHTML={{ __html: formData.body || "<p>Content body will appear here...</p>" }} 
                      className="content-body"
                    />
                  </div>
                ) : (
                  <>
                    {/* Title */}
                    <div className="mb-3">
                      <label className="form-label">Title *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter content title"
                        maxLength="100"
                      />
                      <div className="form-text">
                        {formData.title.length}/100 characters
                      </div>
                      {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                    </div>

                    {/* Excerpt */}
                    <div className="mb-3">
                      <label className="form-label">Excerpt *</label>
                      <textarea
                        className={`form-control ${errors.excerpt ? 'is-invalid' : ''}`}
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Brief description (max 500 characters)"
                        maxLength="500"
                      />
                      <div className="form-text text-end">
                        {formData.excerpt.length}/500 characters
                      </div>
                      {errors.excerpt && <div className="invalid-feedback">{errors.excerpt}</div>}
                    </div>

                    {/* Content Body */}
                    <div className="mb-3">
                      <label className="form-label">Content Body *</label>
                      <RichTextEditor 
                        value={formData.body} 
                        onChange={handleBodyChange} 
                      />
                      {errors.body && <div className="text-danger mt-1">{errors.body}</div>}
                    </div>
                  </>
                )}
              </div>
            </div>

            {!previewMode && (
              <>
                {/* AR Marker Section */}
                {formData.contentType === 'ar_marker' && (
                  <div className="card shadow mb-4">
                    <div className="card-header py-3">
                      <h6 className="m-0 font-weight-bold text-primary">AR Marker Settings</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">Marker Code *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                          name="code"
                          value={formData.code}
                          onChange={handleChange}
                          placeholder="Enter AR marker code"
                        />
                        {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                        <div className="form-text">
                          Unique identifier for the AR marker (alphanumeric, 6-20 characters)
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Location</label>
                        <input
                          type="text"
                          className="form-control"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="Enter location coordinates or description"
                        />
                        <div className="form-text">
                          Geographic location or description where this marker is placed
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Media Section */}
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Media Files</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">Featured Image</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageFileChange}
                      />
                      <div className="form-text">
                        Select a featured image for this content
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Additional Media</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*,video/*,audio/*"
                        onChange={handleMediaFilesChange}
                        multiple
                      />
                      <div className="form-text">
                        Select additional media files to include with this content
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          {!previewMode && (
            <div className="col-lg-4">
              <div className="card shadow mb-4">
                <div className="card-header py-3">
                  <h6 className="m-0 font-weight-bold text-primary">Publish Settings</h6>
                </div>
                <div className="card-body">
                  {/* Content Type */}
                  <div className="mb-3">
                    <label className="form-label">Content Type</label>
                    <select
                      className="form-select"
                      name="contentType"
                      value={formData.contentType}
                      onChange={handleChange}
                    >
                      <option value="article">Article</option>
                      <option value="ar_marker">AR Marker</option>
                      <option value="video">Video</option>
                      <option value="image">Image Gallery</option>
                      <option value="music">Music/Audio</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div className="mb-3">
                    <label className="form-label">Tags</label>
                    <input
                      type="text"
                      className="form-control"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="Enter tags separated by commas"
                    />
                    <div className="form-text">
                      Enter keywords related to this content, separated by commas
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="draft">Save as Draft</option>
                      <option value="for_approval">Send for Approval</option>
                      <option value="published">Publish Immediately</option>
                    </select>
                  </div>

                  {/* Scheduled Publishing */}
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="scheduledPublish"
                      checked={formData.scheduledPublish}
                      onChange={handleChange}
                      id="scheduledPublishCheck"
                    />
                    <label className="form-check-label" htmlFor="scheduledPublishCheck">
                      Schedule for later publishing
                    </label>
                  </div>

                  {formData.scheduledPublish && (
                    <div className="mb-3">
                      <label className="form-label">Publish At</label>
                      <input
                        type="datetime-local"
                        className={`form-control ${errors.publishAt ? 'is-invalid' : ''}`}
                        name="publishAt"
                        value={formData.publishAt}
                        onChange={handleChange}
                      />
                      {errors.publishAt && <div className="invalid-feedback">{errors.publishAt}</div>}
                    </div>
                  )}

                  {/* AR Marker Toggle */}
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="arMarker"
                      checked={formData.arMarker}
                      onChange={handleChange}
                      id="arMarkerCheck"
                    />
                    <label className="form-check-label" htmlFor="arMarkerCheck">
                      This content has an AR marker
                    </label>
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="card shadow mb-4">
                <div className="card-header py-3">
                  <h6 className="m-0 font-weight-bold text-primary">SEO Settings</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">SEO Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleChange}
                      placeholder="Enter SEO title"
                      maxLength="60"
                    />
                    <div className="form-text">
                      {formData.seoTitle.length}/60 characters
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">SEO Description</label>
                    <textarea
                      className="form-control"
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter SEO description"
                      maxLength="160"
                    />
                    <div className="form-text text-end">
                      {formData.seoDescription.length}/160 characters
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Meta Keywords</label>
                    <input
                      type="text"
                      className="form-control"
                      name="metaKeywords"
                      value={formData.metaKeywords}
                      onChange={handleChange}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <div className="form-text">
                      Enter keywords separated by commas
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="card shadow">
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-upload me-2"></i>
                          Upload Content
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/dashboard/content/manage')}
                    >
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}