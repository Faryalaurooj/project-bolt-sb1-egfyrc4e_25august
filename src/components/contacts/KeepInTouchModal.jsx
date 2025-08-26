import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiClock } from 'react-icons/fi';

function KeepInTouchModal({ isOpen, onClose }) {
  const [interval, setInterval] = useState('month');

  const intervals = [
    { value: 'month', label: 'Every month' },
    { value: '2months', label: 'Every 2 months' },
    { value: '3months', label: 'Every 3 months' },
    { value: '6months', label: 'Every 6 months' },
    { value: 'year', label: 'Every year' }
  ];

  const handleSave = () => {
    console.log('Setting keep in touch interval:', interval);
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
            <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center">
              <FiClock className="mr-2 text-blue-500" />
              Keep in Touch
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {intervals.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  value={value}
                  checked={interval === value}
                  onChange={(e) => setInterval(e.target.value)}
                  className="mr-3"
                />
                <span className="text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default KeepInTouchModal;