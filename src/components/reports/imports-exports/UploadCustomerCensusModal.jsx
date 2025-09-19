import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiStar, FiArrowLeft, FiUpload } from 'react-icons/fi';
import { useToast } from '../../../hooks/useToast';

function UploadCustomerCensusModal({ isOpen, onClose }) {
  const { showSuccess, showError, showInfo } = useToast();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      showInfo(`📁 File selected: ${file.name}`);
    }
  };

  const handleBrowse = () => {
    document.getElementById('file-input').click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      showError('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/imports-exports/upload-customer-census', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      showSuccess(`📤 Customer census uploaded successfully! ${result.recordsProcessed || 0} records processed.`);
      
      // Reset form
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error('Error uploading file:', error);
      showError('Failed to upload customer census file');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upload Customer Census</h2>
            <div className="flex items-center space-x-2">
              <FiStar className="w-5 h-5" />
              <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
                <FiArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Email Address Section */}
            <div className="flex items-center space-x-4">
              <label className="text-lg font-medium text-gray-700 min-w-[140px]">Email Address:</label>
              <div className="text-gray-600">
                No Email Set in <span className="font-semibold">Admin→System Settings</span>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="flex items-center space-x-4">
              <label className="text-lg font-medium text-gray-700 min-w-[140px]">File To Import:</label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBrowse}
                  className="px-6 py-2 bg-gray-200 border border-gray-400 rounded text-gray-700 hover:bg-gray-300 transition-colors font-medium"
                >
                  Browse...
                </button>
                <div className="flex-1 px-4 py-2 border border-gray-300 rounded bg-white text-gray-600">
                  {selectedFile ? selectedFile.name : 'No file selected.'}
                </div>
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".csv,.xlsx,.xls,.txt"
                />
              </div>
            </div>

            {selectedFile && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Selected File Details:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>Name: {selectedFile.name}</div>
                  <div>Size: {(selectedFile.size / 1024).toFixed(1)} KB</div>
                  <div>Type: {selectedFile.type || 'Unknown'}</div>
                  <div>Last Modified: {new Date(selectedFile.lastModified).toLocaleDateString()}</div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="bg-blue-600 p-4">
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || uploading}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white font-bold rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FiUpload className="w-5 h-5" />
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default UploadCustomerCensusModal;