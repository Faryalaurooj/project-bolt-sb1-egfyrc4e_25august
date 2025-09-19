import React from 'react';

function EditableSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        list={`${placeholder}-options`}
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      <datalist id={`${placeholder}-options`}>
        {options.map(option => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </div>
  );
}

export default EditableSelect;