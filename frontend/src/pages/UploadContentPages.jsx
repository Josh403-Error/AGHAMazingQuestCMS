// src/pages/UploadContentPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';

export default function UploadContentPage() {
  const navigate = useNavigate();
  
  // State to manage all form fields
  const [formData, setFormData] = useState({
    arMarker: false,
    quiz: false,
    enableBadges: false,
    code: '',
    shortTitle: '',
    contentTitle: '',
    slugIntro: '',
    topicTags: '',
    description: '', 
    metaKeywords: '',
    metaDescription: '',
    building: '',
    facility: '',
    location: '',
    photoCaption: '',
    author: '',
    highlights: '', 
    chatBotAllow: true, 
    excludeAudio: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generic handler for all input changes
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handlePdfFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Create FormData object for file uploads
    const formDataToSend = new FormData();
    
    // Append text fields
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    // Append files if they exist
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }
    
    if (pdfFile) {
      formDataToSend.append('pdf', pdfFile);
    }

    // Log the data being sent (for debugging purposes)
    console.log('Submitting Data:', formData, 'Image:', imageFile, 'PDF:', pdfFile);
    
    // TODO: Replace with actual API call
    setTimeout(() => {
      setLoading(false);
      // Navigate away after successful submission
      navigate('/dashboard/content'); 
    }, 1500);
  };

  return (
    // The 'card' class provides the main container styling matching your design
    // The router renders this component directly into the main content area of the layout.
    <div className="card">
      <h2 className="card-title">Upload Content</h2> {/* Use H2 for the main title */}
      <p>Fill out the form below to create and upload new content.</p>

      <form onSubmit={handleSubmit} className="content-form-layout">
        
        {/* Top Controls: Checkboxes and Action Buttons */}
        <div className="form-header-controls">
          <div className="checkbox-group">
            {/* Checkbox 1: AR Marker */}
            <label className="role-checkbox">
              <input
                type="checkbox"
                name="arMarker"
                checked={formData.arMarker}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              AR Marker
            </label>
            {/* Checkbox 2: Quiz */}
            <label className="role-checkbox">
              <input
                type="checkbox"
                name="quiz"
                checked={formData.quiz}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Quiz
            </label>
            {/* Checkbox 3: Enable Badges */}
            <label className="role-checkbox">
              <input
                type="checkbox"
                name="enableBadges"
                checked={formData.enableBadges}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Enable Badges
            </label>
          </div>
          <div className="action-buttons">
            <button type="button" className="btn btn-secondary">
              Save as Draft
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Main Form Grid Layout */}
        <div className="form-grid">
          
          {/* Row 1: Code, Short Title, Content Title (3 columns) */}
          <div className="form-group grid-item-1-2">
            <label htmlFor="code">Unity Access Token (Script) *</label>
            <div className="input-with-icon">
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="Code"
                required
              />
              <span className="material-icons icon-right" aria-hidden="true">delete</span>
            </div>
          </div>
          <div className="form-group grid-item-3-4">
            <label htmlFor="shortTitle">Short Title *</label>
            <input
              type="text"
              id="shortTitle"
              name="shortTitle"
              value={formData.shortTitle}
              onChange={handleChange}
              placeholder=""
              required
            />
          </div>
          <div className="form-group grid-item-5-6">
            <label htmlFor="contentTitle">Content Title *</label>
            <input
              type="text"
              id="contentTitle"
              name="contentTitle"
              value={formData.contentTitle}
              onChange={handleChange}
              placeholder=""
              required
            />
          </div>

          {/* Row 2: Slug Intro (Full Width) */}
          <div className="form-group grid-item-1-6">
            <label htmlFor="slugIntro">Slug Intro *</label>
            <input
              type="text"
              id="slugIntro"
              name="slugIntro"
              value={formData.slugIntro}
              onChange={handleChange}
              placeholder=""
              required
            />
          </div>
          
          {/* Row 3: Topic Tags (Full Width) */}
          <div className="form-group grid-item-1-6">
            <label htmlFor="topicTags">Topic Tags (1-2 tags in english) *</label>
            <input
              type="text"
              id="topicTags"
              name="topicTags"
              value={formData.topicTags}
              onChange={handleChange}
              placeholder=""
              required
            />
          </div>

          {/* Row 4: Description (Rich Text Editor Placeholder, Full Width) */}
          <div className="form-group grid-item-1-6">
            <label htmlFor="description">Description</label>
            <RichTextEditor
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter content description..."
            />
          </div>

          {/* Row 5: Meta Keywords & Meta Description (2 columns) */}
          <div className="form-group grid-item-1-3">
            <label htmlFor="metaKeywords">Meta Keywords *</label>
            <textarea
              id="metaKeywords"
              name="metaKeywords"
              value={formData.metaKeywords}
              onChange={handleChange}
              rows="4"
              placeholder=""
              required
            ></textarea>
          </div>
          <div className="form-group grid-item-4-6">
            <label htmlFor="metaDescription">Meta Description *</label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              rows="4"
              placeholder=""
              required
            ></textarea>
          </div>

          {/* Row 6: Image Upload & Dropdowns (2 columns) */}
          <div className="grid-item-1-3">
            <div className="file-upload-box">
              <input
                type="file"
                id="imageFile"
                name="imageFile"
                className="file-upload-input"
                onChange={handleImageFileChange}
                accept="image/*"
              />
              <label htmlFor="imageFile" className="file-upload-label">
                <span className="material-icons upload-icon" aria-hidden="true">image</span>
                <p>Drag and drop an image, or <span>Browse</span></p>
                <p className="upload-hint">Minimum 800px width recommended. Max 10MB each</p>
              </label>
            </div>
          </div>
          <div className="grid-item-4-6">
            <div className="form-group">
              <label htmlFor="building">Building</label>
              <select
                id="building"
                name="building"
                value={formData.building}
                onChange={handleChange}
              >
                <option value="">Select Building</option>
                <option value="buildingA">Building A</option>
                <option value="buildingB">Building B</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="facility">Facility *</label>
              <select
                id="facility"
                name="facility"
                value={formData.facility}
                onChange={handleChange}
                required
              >
                <option value="">Select Facility</option>
                <option value="facilityX">Facility X</option>
                <option value="facilityY">Facility Y</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              >
                <option value="">Select Location</option>
                <option value="loc1">Location 1</option>
                <option value="loc2">Location 2</option>
              </select>
            </div>
          </div>

          {/* Row 7: Photo Caption and Author (2 columns) */}
          <div className="form-group grid-item-1-3">
            <label htmlFor="photoCaption">Photo Caption</label>
            <input
              type="text"
              id="photoCaption"
              name="photoCaption"
              value={formData.photoCaption}
              onChange={handleChange}
              placeholder=""
            />
          </div>
          <div className="form-group grid-item-4-6">
            <label htmlFor="author">Author</label>
            <select
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
            >
              <option value="">Select Author</option>
              <option value="author1">Author One</option>
              <option value="author2">Author Two</option>
            </select>
          </div>

          {/* Row 8: Highlights (Rich Text Editor Placeholder, Full Width) */}
          <div className="form-group grid-item-1-6">
            <label htmlFor="highlights">Highlights</label>
            <RichTextEditor
              id="highlights"
              name="highlights"
              value={formData.highlights}
              onChange={handleChange}
              placeholder="Enter content highlights..."
            />
          </div>

          {/* Row 9: Chat Bot & Exclude Audio (Full Width control) */}
          <div className="form-group grid-item-1-6 chatbot-controls">
            <label className="chat-bot-label">Chat Bot</label>
            <div className="radio-group">
              <label className="radio-container">
                <input
                  type="radio"
                  name="chatBotAllow"
                  value="true"
                  checked={formData.chatBotAllow === true}
                  onChange={() => setFormData(prev => ({ ...prev, chatBotAllow: true }))}
                />
                <span className="radio-custom"></span>
                Allow
              </label>
              <label className="radio-container">
                <input
                  type="radio"
                  name="chatBotAllow"
                  value="false"
                  checked={formData.chatBotAllow === false}
                  onChange={() => setFormData(prev => ({ ...prev, chatBotAllow: false }))}
                />
                <span className="radio-custom"></span>
                Disallow
              </label>
            </div>
            <label className="role-checkbox">
              <input
                type="checkbox"
                name="excludeAudio"
                checked={formData.excludeAudio}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Exclude Audio
            </label>
          </div>

          {/* Row 10: PDF Upload (Full Width) */}
          <div className="grid-item-1-6">
            <div className="file-upload-box pdf-upload-box">
              <input
                type="file"
                id="pdfFile"
                name="pdfFile"
                className="file-upload-input"
                onChange={handlePdfFileChange}
                accept="application/pdf"
              />
              <label htmlFor="pdfFile" className="file-upload-label">
                <span className="material-icons upload-icon" aria-hidden="true">picture_as_pdf</span>
                <p>Drag and drop PDF file here, or <span>Browse</span></p>
                <p className="upload-hint">Max PDF file size is 10MB</p>
              </label>
            </div>
          </div>

        </div> {/* End form-grid */}
      </form>
    </div>
  );
}