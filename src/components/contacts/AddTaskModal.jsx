import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiUser, FiCalendar, FiFlag, FiUsers, FiSave } from 'react-icons/fi';
import ContactSelectModal from './ContactSelectModal';
import { format } from 'date-fns';
import { getUsers } from '../../services/api';
import { useToast } from '../../hooks/useToast';

function AddTaskModal({ isOpen, onClose, contact, onTaskSaved, initialDate }) {
  const { showSuccess, showError } = useToast();
  
  console.log('📋 AddTaskModal: Rendered with props:', { 
    isOpen, 
    hasContact: !!contact, 
    initialDate,
    hasOnTaskSaved: !!onTaskSaved 
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: initialDate ? format(initialDate, 'yyyy-MM-dd') : '',
    priority: 'Medium'
  });
  const [selectedContact, setSelectedContact] = useState(contact || null);
  const [isContactSelectOpen, setIsContactSelectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch contacts when modal opens
  React.useEffect(() => {
    if (isOpen) {
      console.log('📋 AddTaskModal: Modal opened, fetching users...');
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      console.log('📋 AddTaskModal: Starting to fetch users...');
      const usersData = await getUsers();
      console.log('📋 AddTaskModal: Users fetched:', usersData?.length || 0);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.assignedTo || !formData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    console.log('📋 AddTaskModal: Starting save operation...', formData);
    setIsSubmitting(true);
    setError(null);

    try {
      // Get existing tasks from localStorage
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '{"todo":[],"inProgress":[],"completed":[]}');
      
      const newTask = {
        id: Date.now().toString(),
        ...formData,
        contactId: selectedContact?.id,
        contactName: selectedContact ? `${selectedContact.first_name} ${selectedContact.last_name}` : null,
        attachments: [],
        createdBy: 'Admin User',
        createdAt: new Date().toISOString()
      };

      // Add to todo list
      const updatedTasks = {
        ...existingTasks,
        todo: [...existingTasks.todo, newTask]
      };

      // Save to localStorage
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));

      // Trigger storage event for other components
      window.dispatchEvent(new Event('storage'));

      console.log('📋 AddTaskModal: Task saved successfully');
      // Reset form
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: initialDate ? format(initialDate, 'yyyy-MM-dd') : '',
        priority: 'Medium'
      });
      setSelectedContact(contact || null);
      
      if (onTaskSaved) {
        onTaskSaved();
      }
      
      showSuccess('Task assigned successfully!');
      onClose();
    } catch (err) {
      console.error('Error saving task:', err);
      const errorMessage = 'Failed to save task. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSelect = (contact) => {
    console.log('📋 AddTaskModal: Contact selected, closing contact modal first...');
    // Close contact modal first to prevent interference
    setIsContactSelectOpen(false);
    
    // Use setTimeout to ensure contact modal closes before updating state
    setTimeout(() => {
      console.log('📋 AddTaskModal: Setting selected contact:', contact);
      setSelectedContact(contact);
    }, 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-start justify-center min-h-screen p-4 pt-16">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

          <div className="relative bg-white w-full max-w-lg mx-4 rounded-xl shadow-2xl overflow-hidden">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <FiFlag className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {initialDate ? `Add Task for ${format(initialDate, 'MMMM d, yyyy')}` : 'Assign Task'}
                    </h2>
                    <p className="text-green-100 text-xs">
                      Create and assign a new task to team members
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="text-white hover:text-green-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-10">
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Enhanced Task Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiFlag className="mr-2 text-green-600" />
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a clear, actionable task title..."
                  className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2 transition-all duration-200 p-3 font-medium placeholder-gray-400"
                  required
                  disabled={usersLoading}
                />
              </div>

              {/* Enhanced Contact Reference */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FiUser className="mr-2 text-blue-600" />
                  Who is this task about?
                </label>
                {selectedContact ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-xs">
                          {selectedContact.first_name?.[0]}{selectedContact.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {selectedContact.first_name} {selectedContact.last_name}
                        </div>
                        {selectedContact.email && (
                          <div className="text-xs text-gray-500">{selectedContact.email}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) =>{
                        e.preventDefault();
                        setSelectedContact(null)
                      } }
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(
                      e

                    ) =>{
                      e.preventDefault();
                      setIsContactSelectOpen(true);
                    } }
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                  >
                    <FiUser className="mr-2" />
                    <span className="font-medium">Click to select a contact</span>
                  </button>
                )}
              </div>

              {/* Enhanced Assignment and Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiUsers className="mr-2 text-purple-600" />
                    Assigned To *
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500 focus:ring-2 transition-all duration-200 p-2 font-medium text-sm"
                    required
                    disabled={usersLoading}
                  >
                    <option value="">
                      {usersLoading ? 'Loading team members...' : 'Select assignee...'}
                    </option>
                    {users.map(user => (
                      <option key={user.id} value={user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email?.split('@')[0] || 'Team Member'}>
                        {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email?.split('@')[0] || 'Team Member'}
                      </option>
                    ))}
                  </select>
                  {usersLoading && (
                    <div className="mt-1 flex items-center text-xs text-blue-600">
                      <div className="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                      Loading team members...
                    </div>
                  )}
                  {!usersLoading && users.length === 0 && (
                    <div className="mt-1 text-xs text-red-600 bg-red-50 p-2 rounded-md">
                      No team members found. Check your database connection.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FiCalendar className="mr-2 text-orange-600" />
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-orange-500 focus:ring-orange-500 focus:ring-2 transition-all duration-200 p-2 font-medium text-sm"
                    required
                  />
                </div>
              </div>

              {/* Enhanced Priority Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiFlag className="mr-2 text-red-600" />
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Low', 'Medium', 'High'].map((priority) => (
                    <label
                      key={priority}
                      className={`flex items-center justify-center p-2 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.priority === priority
                          ? priority === 'High' 
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : priority === 'Medium'
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={priority}
                        checked={formData.priority === priority}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          priority === 'High' ? 'bg-red-500' :
                          priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <span className="font-medium text-sm">{priority}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Enhanced Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide additional details about this task..."
                  rows={3}
                  className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200 p-3 placeholder-gray-400 text-sm"
                />
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  {selectedContact ? (
                    <span className="flex items-center">
                      <FiUser className="mr-1" />
                      Task about: <span className="font-medium ml-1">{selectedContact.first_name} {selectedContact.last_name}</span>
                    </span>
                  ) : (
                    <span>No contact selected</span>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center"
                    >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2" />
                        Assign Task
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <ContactSelectModal
        isOpen={isContactSelectOpen}
        onClose={() => setIsContactSelectOpen(false)}
        onContactSelect={handleContactSelect}
      />
    </>
  );
}

export default AddTaskModal;