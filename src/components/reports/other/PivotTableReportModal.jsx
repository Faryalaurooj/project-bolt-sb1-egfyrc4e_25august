import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiLock, FiStar, FiHelpCircle, FiArrowLeft, FiUpload } from 'react-icons/fi';
import { useToast } from '../../../hooks/useToast';

function PivotTableReportModal({ isOpen, onClose }) {
  const { showSuccess, showError, showInfo } = useToast();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        showInfo(`📁 CSV file selected: ${file.name}`);
      } else {
        showError('Please select a CSV file');
        setSelectedFile(null);
      }
    }
  };

  const handleBrowse = () => {
    document.getElementById('csv-file-input').click();
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showError('Please select a CSV file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/reports/other/pivot-table', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const result = await response.json();
      showSuccess(`📊 CSV file imported successfully! ${result.recordsProcessed || 0} records processed for pivot table analysis.`);
      
      setSelectedFile(null);
    } catch (error) {
      console.error('Error importing CSV:', error);
      showError('Failed to import CSV file for pivot table');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Reports - Pivot Table</h2>
            <div className="flex items-center space-x-2">
              <FiLock className="w-5 h-5" />
              <div className="w-5 h-5 bg-white/20 rounded" />
              <FiStar className="w-5 h-5" />
              <FiHelpCircle className="w-5 h-5" />
              <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
                <FiArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Import a CSV file Section */}
            <div className="border border-gray-300 rounded-lg p-6 mb-8">
              <h3 className="text-blue-600 font-semibold text-lg mb-6 border-b border-gray-200 pb-2">Import a CSV file</h3>
              
              <div className="flex items-center space-x-4">
                <label className="text-lg font-medium text-gray-700 min-w-[120px]">Browse a file:</label>
                <div className="flex items-center space-x-4 flex-1">
                  <button
                    onClick={handleBrowse}
                    disabled={uploading}
                    className="px-6 py-2 bg-gray-200 border border-gray-400 rounded text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition-colors font-medium"
                  >
                    Browse...
                  </button>
                  <div className="flex-1 px-4 py-2 border border-gray-300 rounded bg-white text-gray-600">
                    {selectedFile ? selectedFile.name : 'No file selected.'}
                  </div>
                  <input
                    id="csv-file-input"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".csv"
                  />
                </div>
              </div>

              {selectedFile && (
                <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Selected File Details:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>Name: {selectedFile.name}</div>
                    <div>Size: {(selectedFile.size / 1024).toFixed(1)} KB</div>
                    <div>Type: {selectedFile.type}</div>
                    <div>Last Modified: {new Date(selectedFile.lastModified).toLocaleDateString()}</div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || uploading}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <FiUpload className="w-5 h-5" />
                      <span>Import CSV for Pivot Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default PivotTableReportModal;