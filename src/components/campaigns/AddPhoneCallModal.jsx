import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiUser } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../../context/AuthContext';
import { createPhoneCall } from '../../services/api';
import ContactSelectModal from '../contacts/ContactSelectModal';

function AddPhoneCallModal({ isOpen, onClose, contact, onPhoneCallSaved }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('all employees');
  const [addActionItem, setAddActionItem] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(contact || null);
  const [isContactSelectOpen, setIsContactSelectOpen] = useState(false);

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'size': ['14px'] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'file'],
      ['clean']
    ]
  };

  const handleSave = async () => {
    if (!title || !content) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const callData = {
        title,
        content,
        visibility,
        is_action_item: addActionItem,
        contact_id: selectedContact?.id
      };

      await createPhoneCall(callData);

      setTitle('');
      setContent('');
      setVisibility('all employees');
      setAddActionItem(false);
      setSelectedContact(contact || null);
      
      if (onPhoneCallSaved) {
        onPhoneCallSaved();
      }
      
      onClose();
    } catch (err) {
      console.error('Error saving phone call:', err);
      setError('Failed to save phone call. Please try again.');
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
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white w-full max-w-6xl mx-4 rounded-lg shadow-xl flex">
            <div className="flex-1 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add Phone Call</h2>
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
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Call summary..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">🔒</span>
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
              </div>

              <ReactQuill
                value={content}
                onChange={setContent}
                modules={modules}
                className="h-64 mb-12"
                placeholder="Enter call details..."
              />

              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Log Phone Call'}
                </button>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addActionItem}
                    onChange={(e) => setAddActionItem(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Add action item</span>
                </label>
              </div>
            </div>

            <div className="w-80 p-6 bg-gray-50 flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUser className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Who was on this phone call?</h3>
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
                      Reference contacts so you can find phone calls related to that contact easily. This will not send the contacts any notifications.
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

export default AddPhoneCallModal;