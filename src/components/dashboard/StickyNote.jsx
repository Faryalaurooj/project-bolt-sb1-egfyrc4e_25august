import React, { useState } from 'react';
import { FiX, FiEdit2, FiMove } from 'react-icons/fi';
import { updateNote, deleteNote } from '../../services/api';

function StickyNote({ note, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content || '');
  const [position, setPosition] = useState({
    x: note.x_position || 100,
    y: note.y_position || 100
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (isEditing) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isEditing) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 250;
    const maxY = window.innerHeight - 200;
    
    setPosition({
      x: Math.max(0, Math.min(newPosition.x, maxX)),
      y: Math.max(0, Math.min(newPosition.y, maxY))
    });
  };

  const handleMouseUp = async () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Save position to database
    try {
      await updateNote(note.id, {
        x_position: position.x,
        y_position: position.y
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating note position:', error);
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleSave = async () => {
    try {
      await updateNote(note.id, { content: editedContent });
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this sticky note?')) {
      try {
        await deleteNote(note.id);
        if (onDelete) onDelete(note.id);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditedContent(note.content || '');
    setIsEditing(false);
  };

  return (
    <div
      className={`fixed bg-yellow-200 border-2 border-yellow-300 rounded-lg shadow-lg p-4 w-64 min-h-48 z-30 ${
        isDragging ? 'cursor-grabbing shadow-2xl' : 'cursor-grab'
      } ${isEditing ? 'z-40' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isDragging ? 'rotate(2deg)' : 'rotate(1deg)'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FiMove className="w-4 h-4 text-yellow-700" />
          <span className="text-xs font-medium text-yellow-800">Sticky Note</span>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            className="text-yellow-700 hover:text-yellow-900 p-1 rounded"
            title="Edit"
          >
            <FiEdit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="text-red-600 hover:text-red-800 p-1 rounded"
            title="Delete"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {note.title && (
          <h4 className="font-semibold text-yellow-900 mb-2 text-sm">
            {note.title}
          </h4>
        )}
        
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-24 p-2 text-sm bg-yellow-100 border border-yellow-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter your note..."
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="text-sm text-yellow-900 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        )}
      </div>

      {/* Contact reference */}
      {note.contacts && (
        <div className="mt-3 pt-2 border-t border-yellow-300">
          <div className="text-xs text-yellow-700">
            📝 About: {note.contacts.first_name} {note.contacts.last_name}
          </div>
        </div>
      )}
    </div>
  );
}

export default StickyNote;