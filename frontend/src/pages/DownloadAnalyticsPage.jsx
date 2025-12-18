import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function DownloadAnalyticsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormat, setFilterFormat] = useState('all');
  const [sortBy, setSortBy] = useState('generated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedReports, setSelectedReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);

  const { setActiveTab } = useOutletContext() || {};

  useEffect(() => {
    if (setActiveTab) {
      setActiveTab('download');
    }
  }, [setActiveTab]);

  useEffect(() => {
    // Simulating data fetch
    setTimeout(() => {
      const mockReports = [
        { id: 1, title: 'Monthly Content Performance Report', format: 'pdf', metrics: ['views', 'engagement'], generated_at: '2023-05-15T10:30:00Z', size: '2.4 MB' },
        { id: 2, title: 'User Engagement Analysis', format: 'excel', metrics: ['users', 'retention'], generated_at: '2023-05-10T14:15:00Z', size: '1.8 MB' },
        { id: 3, title: 'Content Category Comparison', format: 'csv', metrics: ['categories', 'performance'], generated_at: '2023-05-05T09:45:00Z', size: '0.9 MB' },
        { id: 4, title: 'Weekly Traffic Report', format: 'pdf', metrics: ['traffic', 'sources'], generated_at: '2023-04-28T16:20:00Z', size: '3.1 MB' },
        { id: 5, title: 'AR Interaction Metrics', format: 'excel', metrics: ['interactions', 'completion'], generated_at: '2023-04-22T11:10:00Z', size: '2.7 MB' },
        { id: 6, title: 'User Demographics Report', format: 'pdf', metrics: ['demographics', 'location'], generated_at: '2023-04-18T08:30:00Z', size: '4.2 MB' },
        { id: 7, title: 'Content Performance Deep Dive', format: 'excel', metrics: ['performance', 'conversion'], generated_at: '2023-04-12T13:45:00Z', size: '3.6 MB' },
        { id: 8, title: 'Mobile vs Desktop Usage', format: 'csv', metrics: ['platform', 'usage'], generated_at: '2023-04-05T10:15:00Z', size: '1.2 MB' },
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

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

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

  const downloadReport = (id) => {
    const report = reports.find(r => r.id === id);
    alert(`Downloading report: ${report.title}.${report.format}`);
    // In a real app, this would trigger the actual download
  };

  const downloadSelected = () => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report to download');
      return;
    }

    alert(`Downloading ${selectedReports.length} reports`);
    // In a real app, this would trigger the bulk download
    setSelectedReports([]);
  };

  const downloadAll = () => {
    alert(`Downloading all ${filteredAndSortedReports.length} reports`);
    // In a real app, this would trigger the bulk download of all reports
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Download Analytics Reports</h5>
        <div>
          <button className="btn btn-sm btn-outline-primary me-2" onClick={downloadSelected}>
            <i className="fas fa-download me-1"></i>
            Download Selected
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={downloadAll}>
            <i className="fas fa-download me-1"></i>
            Download All
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Search Reports</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by title or metrics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Format</label>
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
            <div className="col-md-4 mb-3">
              <label className="form-label">Sort By</label>
              <div className="d-flex gap-2">
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

      {/* Reports Table */}
      <div className="card">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">Available Reports</h6>
          <span className="badge bg-primary">{filteredAndSortedReports.length} reports</span>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading reports...</p>
            </div>
          ) : filteredAndSortedReports.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-file-download fa-3x text-muted mb-3"></i>
              <h5>No reports available for download</h5>
              <p className="text-muted">
                {searchTerm || filterFormat !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by generating your first analytics report'}
              </p>
              <button className="btn btn-primary">
                <i className="fas fa-plus-circle me-2"></i>
                Generate Report
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
                      <th width="15%">Actions</th>
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
                        <td className="fw-bold">{report.title}</td>
                        <td>
                          {report.metrics.map((metric, index) => (
                            <span key={index} className="badge bg-light text-dark me-1">
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
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => downloadReport(report.id)}
                              title="Download"
                            >
                              <i className="fas fa-download"></i>
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
                  <ul className="pagination justify-content-center">
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
          )}
        </div>
      </div>
    </div>
  );
}