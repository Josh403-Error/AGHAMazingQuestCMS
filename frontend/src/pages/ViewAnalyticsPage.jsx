import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function ViewAnalyticsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormat, setFilterFormat] = useState('all');
  const [sortBy, setSortBy] = useState('generated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedReports, setSelectedReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // table or grid

  const { setActiveTab } = useOutletContext() || {};

  useEffect(() => {
    if (setActiveTab) {
      setActiveTab('view');
    }
  }, [setActiveTab]);

  useEffect(() => {
    // Simulating data fetch
    setTimeout(() => {
      const mockReports = [
        { id: 1, title: 'Monthly Content Performance Report', format: 'pdf', metrics: ['views', 'engagement'], generated_at: '2023-05-15T10:30:00Z', status: 'completed', size: '2.4 MB' },
        { id: 2, title: 'User Engagement Analysis', format: 'excel', metrics: ['users', 'retention'], generated_at: '2023-05-10T14:15:00Z', status: 'completed', size: '1.8 MB' },
        { id: 3, title: 'Content Category Comparison', format: 'csv', metrics: ['categories', 'performance'], generated_at: '2023-05-05T09:45:00Z', status: 'completed', size: '0.9 MB' },
        { id: 4, title: 'Weekly Traffic Report', format: 'pdf', metrics: ['traffic', 'sources'], generated_at: '2023-04-28T16:20:00Z', status: 'completed', size: '3.1 MB' },
        { id: 5, title: 'AR Interaction Metrics', format: 'excel', metrics: ['interactions', 'completion'], generated_at: '2023-04-22T11:10:00Z', status: 'completed', size: '2.7 MB' },
      ];
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAndSortedReports = useMemo(() => {
    let result = [...reports];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(report => 
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.metrics?.some(metric => metric.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply format filter
    if (filterFormat !== 'all') {
      result = result.filter(report => report.format === filterFormat);
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
  }, [reports, searchTerm, filterFormat, sortBy, sortOrder]);

  // Pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredAndSortedReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPageCount = Math.ceil(filteredAndSortedReports.length / reportsPerPage);


  const handleSelectReport = (id) => {
    setSelectedReports(prev => {
      if (prev.includes(id)) {
        return prev.filter(reportId => reportId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedReports.length === currentReports.length && currentReports.length > 0) {
      setSelectedReports([]);
    } else {
      setSelectedReports(currentReports.map(report => report.id));
    }
  };

  const getFormatBadgeClass = (format) => {
    switch (format) {
      case 'pdf':
        return 'bg-danger';
      case 'excel':
        return 'bg-success';
      case 'csv':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewReport = (id) => {
    const report = reports.find(r => r.id === id);
    alert(`Viewing report: ${report.title}`);
    // In a real app, this would navigate to the report viewer
  };

  const deleteReport = (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setReports(reports.filter(report => report.id !== id));
      setSelectedReports(selectedReports.filter(reportId => reportId !== id));
    }
  };

  const bulkDelete = () => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedReports.length} reports?`)) {
      setReports(reports.filter(report => !selectedReports.includes(report.id)));
      setSelectedReports([]);
    }
  };

  return (
    <div className="analytics-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 mb-1">View Analytics Reports</h2>
          <p className="text-muted mb-0">Browse and view generated analytics reports</p>
        </div>
        <div className="d-flex gap-2">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('table')}
              title="Table view"
            >
              <i className="fas fa-table"></i>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <i className="fas fa-th"></i>
            </button>
          </div>
          <button className="btn btn-sm btn-outline-danger" onClick={bulkDelete} disabled={selectedReports.length === 0}>
            <i className="fas fa-trash me-1"></i>
            Delete Selected
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title or metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
              >
                <option value="all">All Formats</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="generated_at">Generation Date</option>
                <option value="title">Title</option>
                <option value="format">Format</option>
                <option value="size">Size</option>
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                Sort: {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Display */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Generated Reports</h5>
          <span className="badge bg-primary">{filteredAndSortedReports.length} reports</span>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 mb-0">Loading reports...</p>
            </div>
          ) : filteredAndSortedReports.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
              <h5 className="mb-2">No Reports Found</h5>
              <p className="text-muted mb-0">
                {searchTerm || filterFormat !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by generating your first analytics report'}
              </p>
            </div>
          ) : viewMode === 'table' ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '5%' }}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedReports.length === currentReports.length && currentReports.length > 0}
                            onChange={handleSelectAll}
                          />
                        </div>
                      </th>
                      <th onClick={() => handleSort('title')} className="cursor-pointer">
                        Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Metrics</th>
                      <th onClick={() => handleSort('format')} className="cursor-pointer">
                        Format {sortBy === 'format' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('size')} className="cursor-pointer">
                        Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('generated_at')} className="cursor-pointer">
                        Generated {sortBy === 'generated_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Status</th>
                      <th style={{ width: '15%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReports.map(report => (
                      <tr key={report.id} className={selectedReports.includes(report.id) ? 'table-active' : ''}>
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedReports.includes(report.id)}
                              onChange={() => handleSelectReport(report.id)}
                            />
                          </div>
                        </td>
                        <td className="fw-medium">{report.title}</td>
                        <td>
                          {report.metrics.map((metric, index) => (
                            <span key={index} className="badge bg-light text-dark me-1 mb-1">
                              {metric}
                            </span>
                          ))}
                        </td>
                        <td>
                          <span className={`badge ${getFormatBadgeClass(report.format)}`}>
                            {report.format.toUpperCase()}
                          </span>
                        </td>
                        <td>{report.size}</td>
                        <td>{formatDate(report.generated_at)}</td>
                        <td>
                          <span className="badge bg-success">Completed</span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => viewReport(report.id)}
                              title="View"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => deleteReport(report.id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPageCount > 1 && (
                <nav aria-label="Reports pagination">
                  <ul className="pagination justify-content-center mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPageCount)].map((_, i) => (
                      <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPageCount ? 'disabled' : ''}`}>
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
          ) : (
            // Grid view
            <div className="row g-4">
              {currentReports.map(report => (
                <div key={report.id} className="col-xl-3 col-lg-4 col-md-6">
                  <div className={`card h-100 border ${selectedReports.includes(report.id) ? 'border-primary border-2' : ''}`}>
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <span className={`badge ${getFormatBadgeClass(report.format)}`}>
                            {report.format.toUpperCase()}
                          </span>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedReports.includes(report.id)}
                            onChange={() => handleSelectReport(report.id)}
                          />
                        </div>
                      </div>
                      
                      <h5 className="card-title mb-2">{report.title}</h5>
                      
                      <div className="mb-3">
                        <div className="small text-muted mb-1">Metrics:</div>
                        <div>
                          {report.metrics.map((metric, index) => (
                            <span key={index} className="badge bg-light text-dark me-1 mb-1">
                              {metric}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between small text-muted">
                          <span>{report.size}</span>
                          <span>{formatDate(report.generated_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-footer bg-white">
                      <div className="d-flex justify-content-between">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => viewReport(report.id)}
                        >
                          <i className="fas fa-eye me-1"></i>
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteReport(report.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}