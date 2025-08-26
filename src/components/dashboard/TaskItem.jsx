import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { FiCalendar, FiUser, FiFolder, FiFlag, FiTrash2, FiPaperclip, FiMail, FiEdit2, FiClock, FiTarget, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { sendOutlookEmail } from '../../services/outlookSync';

export function TaskItem({ task, onDelete, onViewTask, getUserDisplayName }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'border-red-400 bg-gradient-to-r from-red-50 to-red-100 text-red-800',
      'Medium': 'border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-800',
      'Low': 'border-emerald-400 bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-800'
    };
    return colors[priority] || 'border-gray-400 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800';
  };

  const getPriorityBorderColor = (priority) => {
    const colors = {
      'High': 'border-l-red-500 border-l-8',
      'Medium': 'border-l-amber-500 border-l-8',
      'Low': 'border-l-emerald-500 border-l-8'
    };
    return colors[priority] || 'border-l-gray-500 border-l-8';
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return <FiAlertTriangle className="w-4 h-4" />;
      case 'Medium': return <FiFlag className="w-4 h-4" />;
      case 'Low': return <FiCheckCircle className="w-4 h-4" />;
      default: return <FiFlag className="w-4 h-4" />;
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onViewTask(task, true);
  };

  const handleSendEmail = (e) => {
    e.stopPropagation(); // Prevent triggering onViewTask
    if (task.assignedTo && task.assignedTo.includes('@')) { // Simple check for email format
      // Attempt to send via Outlook if possible, otherwise fallback to mailto
      sendOutlookEmail(
        task.assignedTo,
        `Task: ${task.title}`,
        `Details: ${task.description || 'No description.'}`
      ).catch(() => {
        window.location.href = `mailto:${task.assignedTo}?subject=${encodeURIComponent(`Task: ${task.title}`)}&body=${encodeURIComponent(`Details: ${task.description || 'No description.'}`)}`;
      });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onViewTask(task)}
      className={`bg-white p-4 rounded-xl shadow-md cursor-move hover:shadow-lg transition-all duration-300 hover:bg-mintyLemonGreen hover:border-mintyLemonGreen ${getPriorityBorderColor(task.priority)} border-r-2 border-t-2 border-b-2 border-gray-200 relative group transform hover:scale-105 hover:-translate-y-1 ${isDragging ? 'scale-105 shadow-xl' : ''}`}
    >
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex space-x-1">
        <button
          onClick={handleSendEmail}
          className="text-gray-600 hover:text-gray-800 p-1 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110 border border-gray-200"
          title="Send Email"
        >
          <FiMail className="w-3 h-3" />
        </button>
        <button
          onClick={handleEdit}
          className="text-gray-600 hover:text-gray-800 p-1 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110 border border-gray-200"
          title="Edit Task"
        >
          <FiEdit2 className="w-3 h-3" />
        </button>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 p-1 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110 border border-red-200"
          title="Delete Task"
        >
          <FiTrash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-8">
          <h4 className="font-semibold text-base text-gray-900 mb-2 leading-tight line-clamp-2">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
          )}
        </div>
        {task.attachments?.length > 0 && (
          <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
            <FiPaperclip className="w-3 h-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">{task.attachments.length}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <FiUser className="w-3 h-3 text-gray-600" />
            </div>
            <span className="font-medium">By: {task.createdBy}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <FiTarget className="w-3 h-3 text-gray-600" />
            </div>
            <span className="font-medium">To: {getUserDisplayName ? getUserDisplayName(task.assignedTo) : task.assignedTo}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <FiCalendar className="w-3 h-3 text-gray-600" />
            </div>
            <span className={`font-medium ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-600'}`}>
              Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </span>
            {isOverdue(task.dueDate) && (
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium shadow-md animate-pulse">
                OVERDUE
              </span>
            )}
          </div>
          <div className={`px-2 py-1 rounded-lg text-xs font-medium border shadow-sm ${getPriorityColor(task.priority)} flex items-center space-x-1`}>
            {getPriorityIcon(task.priority)}
            <span>{task.priority}</span>
          </div>
        </div>

        {task.project && (
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <FiFolder className="w-3 h-3 text-gray-600" />
            </div>
            <span className="font-medium">Project: {task.project}</span>
          </div>
        )}
      </div>

      {task.createdAt && (
        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 flex items-center space-x-2">
          <FiClock className="w-3 h-3" />
          <span className="font-medium">Created {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
        </div>
      )}
    </div>
  );
}

export default TaskItem;