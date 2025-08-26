import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiClock, FiUser, FiTag } from 'react-icons/fi';
import { createNote, updateNote, getUsers } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ContactSelectModal from '../contacts/ContactSelectModal';

function AddActionItemModal({ isOpen, onClose, contact, onActionItemSaved, isEditMode = false, initialData = null }) {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [visibility, setVisibility] = useState('all employees');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState(initialData?.assignee || '');
  const [tags, setTags] = useState([]);
  const [selectedContact, setSelectedContact] = useState(contact || initialData?.contacts || null);
  const [isContactSelectOpen, setIsContactSelectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Update form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setSelectedContact(initialData.contacts || null);
      setVisibility(initialData.visibility || 'all employees');
      // Extract assignee from content if it exists
      const assigneeMatch = initialData.content?.match(/Assigned to: ([^\n]+)/);
      if (assigneeMatch) {
        setAssignee(assigneeMatch[1]);
      }
    }
  }, [initialData]);

  // Fetch users when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      console.log('👥 AddActionItemModal: Fetching users...');
      const usersData = await getUsers();
      console.log('👥 AddActionItemModal: Users fetched:', usersData?.length || 0);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !dueDate || !assignee) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Include assignee information in the content
      const contentWithAssignee = `${content}\n\nAssigned to: ${assignee}\nDue date: ${new Date(dueDate).toLocaleDateString()}`;
      
      const actionItemData = {
        title,
        content: contentWithAssignee,
        visibility,
        is_action_item: true,
        status: 'pending',
        contact_id: selectedContact?.id
      };

      if (isEditMode && initialData?.id) {
        await updateNote(initialData.id, actionItemData);
      } else {
        await createNote(actionItemData);
      }

      // Reset form
      setTitle('');
      setContent('');
      setVisibility('all employees');
      setDueDate('');
      setAssignee('');
      setTags([]);
      setSelectedContact(contact || null);
      
      if (onActionItemSaved) {
        onActionItemSaved();
      }
      
      onClose();
    } catch (err) {
      console.error('Error saving action item:', err);
      setError('Failed to save action item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white w-full max-w-6xl mx-4 rounded-lg shadow-xl flex">
            <div className="flex-1 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{isEditMode ? 'Edit action item' : 'Add an action item'}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="border-none text-gray-700 focus:ring-0"
                  >
                    <option value="all employees">Visibility: all employees</option>
                    <option value="private">Visibility: private</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-2 p-2 border rounded-md">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Action item title..."
                    className="flex-1 border-none focus:ring-0"
                  />
                </div>
              </div>

              <div className="mb-6">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add details..."
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <FiClock className="w-5 h-5" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="border-none focus:ring-0"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 text-gray-700">
                  <FiUser className="w-5 h-5" />
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="border-none focus:ring-0 bg-transparent"
                    required
                    disabled={usersLoading}
                  >
                    <option value="">
                      {usersLoading ? 'Loading team members...' : 'Assign to an employee'}
                    </option>
                    {!usersLoading && users.map(teamUser => (
                      <option key={teamUser.id} value={`${teamUser.first_name || ''} ${teamUser.last_name || ''}`.trim() || teamUser.email?.split('@')[0] || 'Team Member'}>
                        {`${teamUser.first_name || ''} ${teamUser.last_name || ''}`.trim() || teamUser.email?.split('@')[0] || 'Team Member'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2 text-gray-700">
                  <FiTag className="w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Add tags (comma separated)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        e.preventDefault();
                        const newTags = e.target.value.split(',').map(tag => tag.trim());
                        setTags([...new Set([...tags, ...newTags])]);
                        e.target.value = '';
                      }
                    }}
                    className="border-none focus:ring-0"
                  />
                </div>
              </div>

              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                    >
                      {tag}
                      <button
                        onClick={() => setTags(tags.filter((_, i) => i !== index))}
                        className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Save')}
                </button>
              </div>
            </div>

            <div className="w-80 p-6 bg-gray-50 flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👥</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Who is this action item about?</h3>
                {selectedContact ? (
                  <div className="space-y-2">
                    <div className="text-blue-600 font-medium">
                      {selectedContact.first_name} {selectedContact.last_name}
                    </div>
                    {selectedContact.email && (
                      <div className="text-sm text-gray-500">{selectedContact.email}</div>
                    )}
                    <button
                      onClick={() => setIsContactSelectOpen(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Change Contact
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      Reference contacts so you can find action items related to that contact easily. This will not send the contacts any notifications.
                    </p>
                    <button 
                      onClick={() => setIsContactSelectOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Reference Contacts
                    </button>
                  </>
                )}
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

export default AddActionItemModal;