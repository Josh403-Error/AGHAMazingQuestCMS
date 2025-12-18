import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function GenerateAnalyticsPage() {
  const [reportConfig, setReportConfig] = useState({
    title: '',
    startDate: '',
    endDate: '',
    metrics: [],
    format: 'pdf',
    includeCharts: true,
    frequency: 'once',
    scheduleDate: '',
    scheduleTime: ''
  });
  
  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFrequency, setFilterFrequency] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedReports, setSelectedReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState('create');

  const { setActiveTab: setParentActiveTab } = useOutletContext() || {};

  useEffect(() => {
    if (setParentActiveTab) {
      setParentActiveTab('generate');
    }
  }, [setParentActiveTab]);

  const availableMetrics = [
    { id: 'views', name: 'Page Views', description: 'Total number of page views' },
    { id: 'unique_views', name: 'Unique Views', description: 'Number of unique visitors' },
    { id: 'engagement', name: 'Engagement Rate', description: 'Percentage of engaged users' },
    { id: 'avg_time', name: 'Avg. Time on Page', description: 'Average time spent on content' },
    { id: 'bounce_rate', name: 'Bounce Rate', description: 'Percentage of single-page visits' },
    { id: 'conversion', name: 'Conversion Rate', description: 'Percentage of conversions' },
    { id: 'traffic_sources', name: 'Traffic Sources', description: 'Where visitors are coming from' },
    { id: 'device_types', name: 'Device Types', description: 'Breakdown by device type' },
    { id: 'geolocation', name: 'Geographic Location', description: 'Visitor locations' },
    { id: 'content_performance', name: 'Content Performance', description: 'Performance by content type' }
  ];

  useEffect(() => {
    // Simulating loading saved reports
    setTimeout(() => {
      const mockReports = [
        { id: 1, title: 'Weekly Engagement Report', frequency: 'weekly', created_at: '2023-05-10T09:30:00Z', format: 'pdf', metrics: ['views', 'engagement'] },
        { id: 2, title: 'Monthly Traffic Analysis', frequency: 'monthly', created_at: '2023-05-01T14:15:00Z', format: 'excel', metrics: ['traffic_sources', 'device_types'] },
        { id: 3, title: 'Daily Performance Snapshot', frequency: 'daily', created_at: '2023-05-15T08:45:00Z', format: 'csv', metrics: ['views', 'conversion'] },
      ];
      setSavedReports(mockReports);
    }, 500);
  }, []);

  const filteredAndSortedReports = useMemo(() => {
    let result = [...savedReports];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(report => 
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.metrics?.some(metric => metric.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply frequency filter
    if (filterFrequency !== 'all') {
      result = result.filter(report => report.frequency === filterFrequency);
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
  }, [savedReports, searchTerm, filterFrequency, sortBy, sortOrder]);

  // Pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredAndSortedReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPageCount = Math.ceil(filteredAndSortedReports.length / reportsPerPage);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReportConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMetricToggle = (metricId) => {
    setReportConfig(prev => {
      const newMetrics = prev.metrics.includes(metricId)
        ? prev.metrics.filter(id => id !== metricId)
        : [...prev.metrics, metricId];
      
      return {
        ...prev,
        metrics: newMetrics
      };
    });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reportConfig.title.trim()) {
      alert('Please enter a report title');
      return;
    }
    
    if (reportConfig.metrics.length === 0) {
      alert('Please select at least one metric');
      return;
    }
    
    if (reportConfig.frequency === 'once' && (!reportConfig.startDate || !reportConfig.endDate)) {
      alert('Please select both start and end dates');
      return;
    }
    
    if (reportConfig.frequency !== 'once' && (!reportConfig.scheduleDate || !reportConfig.scheduleTime)) {
      alert('Please select schedule date and time');
      return;
    }
    
    setLoading(true);
    
    // Simulate report generation
    setTimeout(() => {
      alert(`Report "${reportConfig.title}" has been scheduled for generation!`);
      setLoading(false);
      
      // Reset form
      setReportConfig({
        title: '',
        startDate: '',
        endDate: '',
        metrics: [],
        format: 'pdf',
        includeCharts: true,
        frequency: 'once',
        scheduleDate: '',
        scheduleTime: ''
      });
    }, 1500);
  };

  const deleteReport = (id) => {
    if (window.confirm('Are you sure you want to delete this scheduled report?')) {
      setSavedReports(savedReports.filter(report => report.id !== id));
      setSelectedReports(selectedReports.filter(reportId => reportId !== id));
    }
  };

  const bulkDelete = () => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedReports.length} scheduled reports?`)) {
      setSavedReports(savedReports.filter(report => !selectedReports.includes(report.id)));
      setSelectedReports([]);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
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

  const getFrequencyBadgeClass = (frequency) => {
    switch (frequency) {
      case 'daily':
        return 'bg-primary';
      case 'weekly':
        return 'bg-success';
      case 'monthly':
        return 'bg-info';
      case 'once':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
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

  return (
    <div className="analytics-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 mb-1">Analytics Reports</h2>
          <p className="text-muted mb-0">Generate, schedule, and manage your analytics reports</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className={`btn btn-sm ${activeTab === 'create' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('create')}
          >
            <i className="fas fa-plus-circle me-1"></i>
            Create Report
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'scheduled' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('scheduled')}
          >
            <i className="fas fa-clock me-1"></i>
            Scheduled Reports
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">Report Configuration</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Report Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={reportConfig.title}
                      onChange={handleInputChange}
                      placeholder="Enter a descriptive report title"
                    />
                    <div className="form-text">Provide a clear and descriptive title for your report</div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Reporting Period</label>
                    <div className="row g-2">
                      <div className="col">
                        <label className="form-label small text-muted mb-1">Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="startDate"
                          value={reportConfig.startDate}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-auto align-self-end pb-1">
                        <span className="text-muted">to</span>
                      </div>
                      <div className="col">
                        <label className="form-label small text-muted mb-1">End Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="endDate"
                          value={reportConfig.endDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Metrics to Include *</label>
                    <div className="row g-2">
                      {availableMetrics.map(metric => (
                        <div key={metric.id} className="col-md-6">
                          <div className="card h-100">
                            <div className="card-body py-2">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`metric-${metric.id}`}
                                  checked={reportConfig.metrics.includes(metric.id)}
                                  onChange={() => handleMetricToggle(metric.id)}
                                />
                                <label className="form-check-label d-block" htmlFor={`metric-${metric.id}`}>
                                  <span className="fw-medium">{metric.name}</span>
                                  <div className="small text-muted">{metric.description}</div>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Output Format</label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="format"
                            id="formatPdf"
                            value="pdf"
                            checked={reportConfig.format === 'pdf'}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="formatPdf">
                            <span className="badge bg-danger">PDF</span>
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="format"
                            id="formatExcel"
                            value="excel"
                            checked={reportConfig.format === 'excel'}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="formatExcel">
                            <span className="badge bg-success">Excel</span>
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="format"
                            id="formatCsv"
                            value="csv"
                            checked={reportConfig.format === 'csv'}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="formatCsv">
                            <span className="badge bg-info">CSV</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Visualization</label>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="includeCharts"
                          id="includeCharts"
                          checked={reportConfig.includeCharts}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="includeCharts">
                          Include charts and graphs
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Report Frequency</label>
                    <select
                      className="form-select"
                      name="frequency"
                      value={reportConfig.frequency}
                      onChange={handleInputChange}
                    >
                      <option value="once">One-time report</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {reportConfig.frequency !== 'once' && (
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Schedule</label>
                      <div className="row g-2">
                        <div className="col">
                          <label className="form-label small text-muted mb-1">Date</label>
                          <input
                            type="date"
                            className="form-control"
                            name="scheduleDate"
                            value={reportConfig.scheduleDate}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="col">
                          <label className="form-label small text-muted mb-1">Time</label>
                          <input
                            type="time"
                            className="form-control"
                            name="scheduleTime"
                            value={reportConfig.scheduleTime}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Generating Report...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-chart-bar me-2"></i>
                          Generate Report
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">Quick Stats</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <div className="small text-muted">Reports Generated</div>
                        <div className="h4 mb-0">24</div>
                      </div>
                      <div className="text-primary">
                        <i className="fas fa-chart-bar fa-2x"></i>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <div className="small text-muted">Scheduled Reports</div>
                        <div className="h4 mb-0">3</div>
                      </div>
                      <div className="text-success">
                        <i className="fas fa-clock fa-2x"></i>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <div className="small text-muted">Avg. Processing Time</div>
                        <div className="h4 mb-0">2.4s</div>
                      </div>
                      <div className="text-info">
                        <i className="fas fa-tachometer-alt fa-2x"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="card-title mb-0">Report Tips</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="fas fa-lightbulb text-warning me-2"></i>
                    <small>Include at least 3 metrics for comprehensive insights</small>
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-lightbulb text-warning me-2"></i>
                    <small>Weekly reports work best for trend analysis</small>
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-lightbulb text-warning me-2"></i>
                    <small>PDF format is best for presentations and sharing</small>
                  </li>
                  <li>
                    <i className="fas fa-lightbulb text-warning me-2"></i>
                    <small>Enable charts for visual representation of data</small>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-header bg-white py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Scheduled Reports</h5>
              <button className="btn btn-sm btn-outline-danger" onClick={bulkDelete} disabled={selectedReports.length === 0}>
                <i className="fas fa-trash me-1"></i>
                Delete Selected
              </button>
            </div>
          </div>
          <div className="card-body">
            {/* Filters */}
            <div className="row mb-4 g-2">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={filterFrequency}
                  onChange={(e) => setFilterFrequency(e.target.value)}
                >
                  <option value="all">All Frequencies</option>
                  <option value="once">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="col-md-4">
                <div className="d-flex gap-2">
                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="created_at">Created Date</option>
                    <option value="title">Title</option>
                    <option value="frequency">Frequency</option>
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

            {filteredAndSortedReports.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-clock fa-3x text-muted mb-3"></i>
                <h5 className="mb-2">No Scheduled Reports</h5>
                <p className="text-muted mb-0">You haven't scheduled any reports yet.</p>
              </div>
            ) : (
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
                        <th>Title</th>
                        <th>Metrics</th>
                        <th>Format</th>
                        <th>Frequency</th>
                        <th>Created</th>
                        <th style={{ width: '10%' }}>Actions</th>
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
                            <span className="badge bg-light text-dark">
                              {report.metrics.length} metrics
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getFormatBadgeClass(report.format)}`}>
                              {report.format.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getFrequencyBadgeClass(report.frequency)}`}>
                              {report.frequency}
                            </span>
                          </td>
                          <td>{formatDate(report.created_at)}</td>
                          <td>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => deleteReport(report.id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}