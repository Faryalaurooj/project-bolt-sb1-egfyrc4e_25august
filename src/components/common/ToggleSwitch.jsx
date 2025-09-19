import React from 'react';

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{label}:</span>
      <div className="flex items-center space-x-2">
        <span className={`text-xs font-medium ${checked ? 'text-green-600' : 'text-red-600'}`}>
          {checked ? 'Yes' : 'No'}
        </span>
        <button
          onClick={onChange}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            checked ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default ToggleSwitch;