import React from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiMail } from 'react-icons/fi';

function AutomationModal({ isOpen, onClose }) {
  const automations = [
    {
      id: 'new-lead',
      title: 'New Lead Automation',
      description: '1 STEP - 6-DAY RUNTIME',
      icon: <FiMail className="w-8 h-8 text-white" />
    },
    {
      id: 'new-vehicle',
      title: 'New Vehicle Purchase',
      description: '1 STEP - 4-DAY RUNTIME',
      icon: <FiMail className="w-8 h-8 text-white" />
    },
    {
      id: 'new-prospect',
      title: 'New Prospect Automation',
      description: '5 STEPS - 361-DAY RUNTIME',
      icon: <FiMail className="w-8 h-8 text-white" />
    },
    {
      id: 'win-back',
      title: 'Win Back',
      description: '3 STEPS - 331-DAY RUNTIME',
      icon: <FiMail className="w-8 h-8 text-white" />
    }
  ];

  const handleSelect = (automationId) => {
    console.log('Selected automation:', automationId);
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

        <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="text-blue-500 mr-2">⚙️</span>
              Select an Automation Flow
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {automations.map(automation => (
              <div
                key={automation.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      {automation.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {automation.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {automation.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelect(automation.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default AutomationModal;