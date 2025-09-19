import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useToast } from '../../hooks/useToast';

function OwnersOverviewByOfficeReportModal({ isOpen, onClose }) {
  const { showSuccess, showInfo } = useToast();
  
  const [formData, setFormData] = useState({
    startDate: '09/08/2025',
    endDate: '09/08/2025',
    office: 'Main Office'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRunReport = () => {
    showSuccess('📈 Running Owners Overview By Office report...');
  };

  const handleMobileReportsMenu = () => {
    showInfo('📱 Returning to Mobile Reports Menu...');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-blue-800 mb-4">Owners Overview</h1>
              
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleMobileReportsMenu}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Return to Mobile Reports Menu
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Report Controls */}
              <div className="flex items-center justify-between border-t border-b border-gray-300 py-4">
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-gray-700">Date Range:</span>
                  <input
                    type="text"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded"
                  />
                  <span className="text-gray-700">to</span>
                  <input
                    type="text"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded"
                  />
                  <span className="text-lg font-semibold text-gray-700">Office:</span>
                  <select
                    value={formData.office}
                    onChange={(e) => handleInputChange('office', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Main Office</option>
                    <option>Branch Office</option>
                    <option>Regional Office</option>
                  </select>
                </div>
                <button
                  onClick={handleRunReport}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
                >
                  RUN REPORT
                </button>
              </div>
            </div>

            {/* No Data Message */}
            <div className="py-12">
              <p className="text-lg text-blue-800">No data for this date range:</p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default OwnersOverviewByOfficeReportModal;