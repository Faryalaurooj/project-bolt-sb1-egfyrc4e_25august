import React, { useState } from 'react';
import { X, Lock, Star, HelpCircle, ArrowLeft, FileText, Mail, Download } from 'lucide-react';

const DownloadTransactionsModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    startDate: '09/05/2025',
    endDate: '09/05/2025',
    dateRange: 'Date Range'
  });

  const dateRangeOptions = [
    'Date Range',
    'Today',
    'Yesterday', 
    'Tomorrow',
    'Next 90 Days',
    'Last 90 Days',
    'This Week',
    'Last Week',
    'Next Week',
    'This Month',
    'Last Month',
    'Next Month',
    'This Quarter',
    'Last Quarter',
    'This Year',
    'Last Year'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-populate dates based on selection
    if (field === 'dateRange') {
      const today = new Date();
      const formatDate = (date) => {
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
      };

      let startDate = '';
      let endDate = '';

      switch (value) {
        case 'Today':
          startDate = endDate = formatDate(today);
          break;
        case 'Yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          startDate = endDate = formatDate(yesterday);
          break;
        case 'Tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          startDate = endDate = formatDate(tomorrow);
          break;
        case 'Last 90 Days':
          const last90 = new Date(today);
          last90.setDate(today.getDate() - 90);
          startDate = formatDate(last90);
          endDate = formatDate(today);
          break;
        case 'Next 90 Days':
          const next90 = new Date(today);
          next90.setDate(today.getDate() + 90);
          startDate = formatDate(today);
          endDate = formatDate(next90);
          break;
        case 'This Week':
          const thisWeekStart = new Date(today);
          thisWeekStart.setDate(today.getDate() - today.getDay());
          const thisWeekEnd = new Date(thisWeekStart);
          thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
          startDate = formatDate(thisWeekStart);
          endDate = formatDate(thisWeekEnd);
          break;
        case 'Last Week':
          const lastWeekStart = new Date(today);
          lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
          const lastWeekEnd = new Date(lastWeekStart);
          lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
          startDate = formatDate(lastWeekStart);
          endDate = formatDate(lastWeekEnd);
          break;
        case 'Next Week':
          const nextWeekStart = new Date(today);
          nextWeekStart.setDate(today.getDate() - today.getDay() + 7);
          const nextWeekEnd = new Date(nextWeekStart);
          nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
          startDate = formatDate(nextWeekStart);
          endDate = formatDate(nextWeekEnd);
          break;
        case 'This Month':
          const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          startDate = formatDate(thisMonthStart);
          endDate = formatDate(thisMonthEnd);
          break;
        case 'Last Month':
          const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
          startDate = formatDate(lastMonthStart);
          endDate = formatDate(lastMonthEnd);
          break;
        default:
          return;
      }

      setFormData(prev => ({
        ...prev,
        startDate,
        endDate
      }));
    }
  };

  const handleSaveReport = () => {
    console.log('Saving download transactions report for future use...');
  };

  const handleRunReport = (format) => {
    console.log(`Running download transactions report as ${format}...`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Download Transactions</h2>
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5" />
            <div className="w-5 h-5 bg-white/20 rounded" />
            <Star className="w-5 h-5" />
            <HelpCircle className="w-5 h-5" />
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Selection */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Report Selection</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date:</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <select 
                    value={formData.dateRange}
                    onChange={(e) => handleInputChange('dateRange', e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    {dateRangeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date:</label>
                <input
                  type="text"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* On Screen Help */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">On Screen Help</h3>
            <div className="bg-pink-50 border border-pink-200 rounded p-4">
              <div className="flex items-start space-x-2">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  7.7
                </div>
                <div>
                  <span className="font-semibold text-purple-600">Download Transactions:</span>
                  <span className="text-gray-700 ml-2">
                    This report will display all AL1 files sent by the carrier through downloads. This will give 
                    you all your underwriting notices.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Reports Button */}
          <button
            onClick={handleSaveReport}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Save Reports For Future Use or Scheduled Report To Run Automatic
          </button>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-green-500 rounded-full p-2">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => handleRunReport('report')}
                className="bg-green-500 text-white px-6 py-2 rounded font-semibold hover:bg-green-600 transition-colors"
              >
                RUN REPORT
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleRunReport('csv')}
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                title="Export as CSV"
              >
                CSV
              </button>
              <button
                onClick={() => handleRunReport('email')}
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                title="Email Report"
              >
                <Mail className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRunReport('pdf')}
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                title="Export as PDF"
              >
                PDF
              </button>
              <button
                onClick={() => handleRunReport('email2')}
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                title="Email Report"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadTransactionsModal;