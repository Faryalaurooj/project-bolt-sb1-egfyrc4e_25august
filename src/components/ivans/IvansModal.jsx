import React from 'react';
import { Dialog } from '@headlessui/react';
import IvansUpload from './IvansUpload';

function IvansModal({ isOpen, onClose, onUpload }) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-10 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
            Upload IVANS Document
          </Dialog.Title>

          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Select a .dat file downloaded from IVANS to convert it to PDF format.
              The converted file will be attached to your note.
            </p>
          </div>

          <IvansUpload onUpload={(file) => {
            onUpload(file);
            onClose();
          }} />

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default IvansModal;