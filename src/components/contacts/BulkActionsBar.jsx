import React from 'react';
import { FiMail, FiMessageSquare, FiCreditCard, FiTag, FiGitMerge, FiEye, FiSettings, FiDownload, FiClock, FiX } from 'react-icons/fi';

function BulkActionsBar({ selectedCount, onAction }) {
  const actions = [
    { id: 'email', icon: FiMail, label: 'Email', color: 'text-blue-600' },
    { id: 'text', icon: FiMessageSquare, label: 'Text', color: 'text-green-600' },
    { id: 'card', icon: FiCreditCard, label: 'Card', color: 'text-purple-600' },
    { id: 'tag', icon: FiTag, label: 'Tag', color: 'text-orange-600' },
    { id: 'merge', icon: FiGitMerge, label: 'Merge', color: 'text-red-600' },
    { id: 'focused', icon: FiEye, label: 'Focused View', color: 'text-teal-600' },
    { id: 'automations', icon: FiSettings, label: 'Automations', color: 'text-indigo-600' },
    { id: 'export', icon: FiDownload, label: 'Export', color: 'text-gray-600' },
    { id: 'keepInTouch', icon: FiClock, label: 'Keep in Touch', color: 'text-pink-600' }
  ];

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white shadow-2xl rounded-2xl border border-gray-200 p-6 flex items-center justify-between min-w-[600px] backdrop-blur-sm bg-opacity-95">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">{selectedCount}</span>
          </div>
          <div>
            <div className="text-gray-900 font-semibold">
              {selectedCount} contact{selectedCount !== 1 ? 's' : ''} selected
            </div>
            <div className="text-sm text-gray-500">Choose an action to perform</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={`flex items-center px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 ${action.color} group`}
              title={action.label}
            >
              <action.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="ml-2 text-sm font-medium hidden lg:inline">{action.label}</span>
            </button>
          ))}
          
          <div className="w-px h-8 bg-gray-300 mx-2"></div>
          
          <button
            onClick={() => {
              // Clear selection - this would need to be passed as a prop
              window.location.reload(); // Temporary solution
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear Selection"
          >
            <FiX className="w-5 h-5" />
          </button>
      </div>
      </div>
    </div>
  );
}

export default BulkActionsBar;