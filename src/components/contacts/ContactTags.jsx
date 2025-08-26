import React, { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';

function ContactTags({ tags = [], onAddTag, onRemoveTag }) {
  const [newTag, setNewTag] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
      setIsAdding(false);
    }
  };

  const tagColors = {
    'VIP': 'bg-purple-100 text-purple-800',
    'Lead': 'bg-blue-100 text-blue-800',
    'Customer': 'bg-green-100 text-green-800',
    'Prospect': 'bg-yellow-100 text-yellow-800',
    'Newsletter': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
              tagColors[tag] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {tag}
            <button
              onClick={() => onRemoveTag(tag)}
              className="ml-1 p-1 hover:text-red-500"
            >
              <FiX className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          <FiPlus className="h-3 w-3 mr-1" />
          Add Tag
        </button>
      </div>
      {isAdding && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter tag name"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTag();
              }
            }}
          />
          <button
            onClick={handleAddTag}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add
          </button>
          <button
            onClick={() => setIsAdding(false)}
            className="px-3 py-1 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default ContactTags;