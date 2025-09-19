import React, { useState, useEffect } from 'react';
import { 
  FiX as X, 
  FiPlus as Plus, 
  FiSearch as Search, 
  FiFileText as FileText, 
  FiCalendar as Calendar 
} from 'react-icons/fi';
import { useToast } from '../../hooks/useToast';

function CustomerNewReportModal({ isOpen, onClose, onCreateReport }) {
  const { showSuccess, showInfo } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [savedReports, setSavedReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);

  // Mock data for saved reports
  useEffect(() => {
    const mockReports = [
      {
        id: 1,
        name: 'Monthly Sales Report',
        description: 'Comprehensive monthly sales analysis',
        lastModified: '2024-01-15',
        type: 'Sales'
      },
      {
        id: 2,
        name: 'Customer Satisfaction Survey',
        description: 'Q4 customer feedback analysis',
        lastModified: '2024-01-10',
        type: 'Customer'
      },
      {
        id: 3,
        name: 'Inventory Status Report',
        description: 'Current inventory levels and trends',
        lastModified: '2024-01-08',
        type: 'Inventory'
      }
    ];
    setSavedReports(mockReports);
    setFilteredReports(mockReports);
  }, []);

  // Filter reports based on search term
  useEffect(() => {
    const filtered = savedReports.filter(report =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [searchTerm, savedReports]);

  const handleUseTemplate = (report) => {
    showSuccess(`Using template: ${report.name}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Create New Report</h2>
              <p className="text-blue-100 mt-1">Start from scratch or use a saved template</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Create New Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Plus className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Create New Report</h3>
                    <p className="text-gray-600 mt-1">
                      Build a custom report from scratch with our report builder
                    </p>
                  </div>
                </div>
                <button
                  onClick={onCreateReport}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Start Building
                </button>
              </div>
            </div>
          </div>

          {/* Saved Templates Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Saved Templates</h3>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="text-blue-500" size={20} />
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                        {report.type}
                      </span>
                    </div>
                    <Calendar className="text-gray-400" size={16} />
                  </div>

                  <h4 className="font-semibold text-gray-800 mb-2">{report.name}</h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{report.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Modified: {new Date(report.lastModified).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleUseTemplate(report)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded hover:bg-blue-100 transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-8">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No templates found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerNewReportModal;
