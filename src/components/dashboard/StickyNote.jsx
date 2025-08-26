import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { FiX, FiPaperclip, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { updateNote, deleteNote } from '../../services/api';

function StickyNote({ note, onUpdate, onDelete }) {
  const [position, setPosition] = useState({ x: note.x_position || 100, y: note.y_position || 100 });
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStop = async (e, data) => {
    const newPosition = { x: Math.round(data.x), y: Math.round(data.y) };
    setPosition(newPosition);
    setIsDragging(false);
    
    try {
      await updateNote(note.id, {
        x_position: Math.round(data.x),
        y_position: Math.round(data.y)
      });
      if (onUpdate) {
        onUpdate(note.id, newPosition);
      }
    } catch (error) {
      console.error('Error updating note position:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this sticky note?')) {
      try {
        await deleteNote(note.id);
        if (onDelete) {
          onDelete(note.id);
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleFileClick = () => {
    if (note.media_url) {
      window.open(note.media_url, '_blank');
    }
  };

  const getContactName = () => {
    if (note.contacts) {
      return `${note.contacts.first_name} ${note.contacts.last_name}`;
    }
    return null;
  };

  return (
    <Draggable
      position={position}
      onStart={() => setIsDragging(true)}
      onStop={handleDragStop}
      bounds="parent"
      handle=".drag-handle"
    >
      <div className={`absolute w-64 bg-yellow-100 border-l-4 border-yellow-400 rounded-lg shadow-lg transition-all duration-200 ${
        isDragging ? 'shadow-2xl scale-105 z-50' : 'hover:shadow-xl z-40'
      }`}>
        {/* Header */}
        <div className="drag-handle cursor-move bg-yellow-200 px-4 py-2 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-xs font-medium text-yellow-800">Sticky Note</span>
          </div>
          <button
            onClick={handleDelete}
            className="text-yellow-600 hover:text-red-600 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">{note.title}</h4>
          
          <div 
            className="text-sm text-gray-700 mb-3 max-h-20 overflow-y-auto"
            dangerouslySetInnerHTML={{ 
              __html: note.content?.length > 100 
                ? `${note.content.slice(0, 100)}...` 
                : note.content 
            }}
          />

          {/* Contact Reference */}
          {getContactName() && (
            <div className="flex items-center text-xs text-blue-600 mb-2">
              <FiUser className="w-3 h-3 mr-1" />
              <span>{getContactName()}</span>
            </div>
          )}

          {/* File Attachment */}
          {note.media_url && (
            <div className="mb-2">
              <button
                onClick={handleFileClick}
                className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                <FiPaperclip className="w-3 h-3 mr-1" />
                <span>View attachment</span>
              </button>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center text-xs text-gray-500">
            <FiClock className="w-3 h-3 mr-1" />
            <span>{format(new Date(note.created_at), 'MMM d, h:mm a')}</span>
          </div>
        </div>
      </div>
    </Draggable>
  );
}

export default StickyNote;