import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useToast } from '../../hooks/useToast';

function DepositSummaryReportModal({ isOpen, onClose }) {
  const { showInfo } = useToast();
  
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 29)); // August 29, 2025

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleMobileReportsMenu = () => {
    showInfo('📱 Returning to Mobile Reports Menu...');
    onClose();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const formatDateShort = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
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
              <h1 className="text-4xl font-bold text-blue-800 mb-4">Daily Breakdown</h1>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-gray-700">DAY:</span>
                  <span className="text-lg text-gray-900">{formatDate(currentDate)}</span>
                  <button
                    onClick={handleMobileReportsMenu}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Mobile Reports Menu
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <button
                  onClick={handlePreviousDay}
                  className="text-blue-600 hover:text-blue-800 underline flex items-center"
                >
                  <FiChevronLeft className="w-4 h-4 mr-1" />
                  &lt;{formatDateShort(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
                </button>
                
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded">
                  {formatDateShort(currentDate)}
                </div>
                
                <button
                  onClick={handleNextDay}
                  className="text-blue-600 hover:text-blue-800 underline flex items-center"
                >
                  {formatDateShort(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}&gt;
                  <FiChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* No Data Message */}
            <div className="text-center py-12">
              <p className="text-xl text-red-600 font-semibold">No data for this date range.</p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default DepositSummaryReportModal;