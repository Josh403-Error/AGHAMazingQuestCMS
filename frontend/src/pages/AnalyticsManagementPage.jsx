import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export default function AnalyticsManagementPage() {
  const [activeTab, setActiveTab] = useState('generate');
  const navigate = useNavigate();

  useEffect(() => {
    // Set default route when accessing the main analytics page
    if (window.location.pathname === '/dashboard/analytics') {
      navigate('/dashboard/analytics/generate');
    }
  }, [navigate]);

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 mb-0 text-gray-800">Analytics Management</h1>
          <p className="mb-0 text-muted">Generate, view, and download content analytics reports</p>
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
                    Reports Generated
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">24</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-chart-bar fa-2x text-gray-300"></i>
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
                    Data Points
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">1,248</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-database fa-2x text-gray-300"></i>
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
                    Active Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">1,234</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-users fa-2x text-gray-300"></i>
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
                    Avg. Engagement
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">72%</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-percentage fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'generate' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('generate');
                  navigate('/dashboard/analytics/generate');
                }}
              >
                <i className="fas fa-plus-circle me-2"></i>
                Generate Reports
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'view' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('view');
                  navigate('/dashboard/analytics/view');
                }}
              >
                <i className="fas fa-eye me-2"></i>
                View Reports
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'download' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('download');
                  navigate('/dashboard/analytics/download');
                }}
              >
                <i className="fas fa-download me-2"></i>
                Download Reports
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-0">
          <div className="p-4">
            <Outlet context={{ setActiveTab }} />
          </div>
        </div>
      </div>
    </div>
  );
}