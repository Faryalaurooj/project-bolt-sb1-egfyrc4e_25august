import React from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiDownload } from 'react-icons/fi';

function ExportModal({ isOpen, onClose }) {
  const handleDownload = () => {
    console.log('Downloading CSV...');
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-md mx-4 p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Export to Spreadsheet (CSV)
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4">
              <img
                src="https://images.pexels.com/photos/3811082/pexels-photo-3811082.jpeg"
                alt="Export"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <p className="text-gray-600 mb-2">
              We are exporting the spreadsheet, and will email you when it's ready for download.
            </p>
            <p className="text-sm text-gray-500">
              The fields we'll export include: Name, Company, Job Title, Address, Phone Numbers, Email Address, OwnerID, and tags.
            </p>
          </div>

          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <FiDownload className="mr-2" />
            Download Now
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default ExportModal;