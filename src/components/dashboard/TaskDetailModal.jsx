import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiCalendar, FiUser, FiFolder, FiFlag, FiPaperclip, FiMail, FiEdit2, FiSave } from 'react-icons/fi';

function TaskDetailModal({ task, isOpen, onClose, onUpdate, isEditMode = false }) {
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [editedTask, setEditedTask] = useState(null);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setIsEditing(isEditMode);
    }
  }, [task, isEditMode]);

  if (!task) return null;

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'text-red-500',
      'Medium': 'text-yellow-500',
      'Low': 'text-green-500'
    };
    return colors[priority] || 'text-gray-500';
  };

  const handleOpenAttachment = (attachment) => {
    if (attachment.source === 'ivans') {
      window.open(attachment.url, '_blank');
    } else {
      console.log('Opening local file:', attachment.name);
    }
  };

  const handleSendEmail = () => {
    window.location.href = `mailto:${task.assignedTo.replace(' ', '.')}@example.com`;
  };

  const handleSave = () => {
    onUpdate(editedTask);
    setIsEditing(false);
  };

  const handleRemoveAttachment = (index) => {
    setEditedTask(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-10 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 p-6">
          <div className="flex justify-between items-start mb-4">
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-xl font-semibold text-gray-900 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            ) : (
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                {task.title}
              </Dialog.Title>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 hover:text-blue-700"
              >
                {isEditing ? <FiSave className="h-5 w-5" /> : <FiEdit2 className="h-5 w-5" />}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              {isEditing ? (
                <textarea
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-600">{task.description || 'No description provided.'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FiUser className="mr-2" />
                  <span className="font-medium">Assigned To</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTask.assignedTo}
                    onChange={(e) => setEditedTask({ ...editedTask, assignedTo: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900">{task.assignedTo}</p>
                    <button
                      onClick={handleSendEmail}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <FiMail className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FiCalendar className="mr-2" />
                  <span className="font-medium">Due Date</span>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedTask.dueDate}
                    onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FiFolder className="mr-2" />
                  <span className="font-medium">Project</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTask.project}
                    onChange={(e) => setEditedTask({ ...editedTask, project: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{task.project}</p>
                )}
              </div>

              <div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <FiFlag className={`mr-2 ${getPriorityColor(task.priority)}`} />
                  <span className="font-medium">Priority</span>
                </div>
                {isEditing ? (
                  <select
                    value={editedTask.priority}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <p className={`${getPriorityColor(task.priority)} font-medium`}>
                    {task.priority}
                  </p>
                )}
              </div>
            </div>

            {task.attachments?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Attachments</h3>
                <div className="space-y-2">
                  {task.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center">
                        <FiPaperclip className="mr-2 text-gray-400" />
                        <span className="text-sm text-gray-700">{attachment.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenAttachment(attachment)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {attachment.source === 'ivans' ? 'View' : 'Download'}
                        </button>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveAttachment(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex justify-end space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default TaskDetailModal;