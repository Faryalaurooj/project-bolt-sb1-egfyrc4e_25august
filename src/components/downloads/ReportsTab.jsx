import React, { useState, useEffect } from 'react';
import { FiUpload, FiDownload, FiUser, FiSearch, FiX, FiEye, FiTrash2, FiMail, FiEdit, FiCalendar, FiFile, FiRefreshCw, FiBarChart2 } from 'react-icons/fi';
import { createReport, getReports, deleteReport } from '../../services/api';
import SendDocumentEmailModal from '../ivans/SendDocumentEmailModal'; // Re-use for reports
import { useToast } from '../../hooks/useToast';
import { openExistingDocumentInPandaDoc } from '../../services/api'; // Re-use for PandaDoc
import ReportsMenu from '../reports/ReportsMenu';

function ReportsTab() {
  const { showSuccess, showError, showInfo } = useToast();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showReportsMenu, setShowReportsMenu] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports.');
      showError('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      await createReport(file);
      showSuccess('Report uploaded successfully!');
      fetchReports(); // Refresh list
    } catch (err) {
      console.error('Error uploading report:', err);
      setError('Failed to upload report.');
      showError('Failed to upload report.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteReport(reportId);
        showSuccess('Report deleted successfully!');
        fetchReports(); // Refresh list
      } catch (err) {
        console.error('Error deleting report:', err);
        setError('Failed to delete report.');
        showError('Failed to delete report.');
      }
    }
  };

  const handleEmailReport = (report) => {
    setSelectedDocument({
      file_name: report.file_name,
      file_url: report.file_url,
      file_size: report.file_size,
      created_at: report.created_at,
      documentType: 'report'
    });
    setIsEmailModalOpen(true);
  };

  const handleOpenInPandaDoc = async (report) => {
    try {
      showInfo('🔄 Opening report in PandaDoc editor...');
      
      const documentName = `${report.file_name || 'Report'} - Edited - ${new Date().toLocaleDateString()}`;
      
      const response = await openExistingDocumentInPandaDoc(report.file_url, documentName);

      if (response.success && response.editor_url) {
        showSuccess('📄 Opening PandaDoc editor in new tab...');
        window.open(response.editor_url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Invalid response from PandaDoc API');
      }
      
    } catch (error) {
      console.error('Error opening document in PandaDoc:', error);
      showError('Failed to open document in PandaDoc');
    }
  };

  const filteredReports = reports.filter(report =>
    report.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.created_by_name && report.created_by_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Reports & Analytics</h3>
          <p className="text-gray-600 text-sm">Generate business reports and manage custom documents</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowReportsMenu(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105 flex items-center"
          >
            <FiBarChart2 className="mr-2" />
            Reports Menu
          </button>
          <label className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 flex items-center cursor-pointer">
            <FiUpload className="mr-2" />
            Upload Report
            <input
              type="file"
              className="hidden"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </label>
          <button
            onClick={fetchReports}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh reports"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Reports Menu Modal */}
      {showReportsMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Reports Menu</h2>
              <button
                onClick={() => setShowReportsMenu(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <ReportsMenu />
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400 w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search reports by name or uploader..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-3"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-xl">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchReports} className="px-4 py-2 bg-red-600 text-white rounded-lg">Try Again</button>
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-green-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Report</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiFile className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{report.file_name}</div>
                        <div className="text-sm text-gray-500">
                          {report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FiUser className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {report.created_by_name || 'System'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(report.created_at).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <a
                        href={report.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Report"
                      >
                        <FiEye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleOpenInPandaDoc(report)}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                        title="Edit/Sign in PandaDoc"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEmailReport(report)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                        title="Email Report"
                      >
                        <FiMail className="w-4 h-4" />
                      </button>
                      <a
                        href={report.file_url}
                        download={report.file_name}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download Report"
                      >
                        <FiDownload className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Report"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FiFile className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No custom reports found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'No reports match your search criteria' : 'Upload custom reports or use the Reports Menu to generate business reports'}
          </p>
          <button
            onClick={() => setShowReportsMenu(true)}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Reports Menu
          </button>
        </div>
      )}

      <SendDocumentEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        document={selectedDocument}
        onEmailSent={() => {
          setIsEmailModalOpen(false);
          setSelectedDocument(null);
          showSuccess('Report emailed successfully!');
        }}
      />
    </div>
  );
}

export default ReportsTab;
