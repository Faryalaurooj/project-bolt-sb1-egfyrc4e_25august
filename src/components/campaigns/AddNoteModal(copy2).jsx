import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiLink, FiUser } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../../context/AuthContext';
import { createNote } from '../../services/api';
import ContactSelectModal from '../contacts/ContactSelectModal';

function AddNoteModal({ isOpen, onClose, contact, onNoteSaved }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('all employees');
  const [addActionItem, setAddActionItem] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(contact || null);
  const [isContactSelectOpen, setIsContactSelectOpen] = useState(false);
  const [ccRecipients, setCcRecipients] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkData, setLinkData] = useState({ url: '', text: '', title: '' });

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
      const noteData = {
        title,
        content,
        visibility,
        is_action_item: addActionItem,
        contact_id: selectedContact?.id,
        status: addActionItem ? 'pending' : null
      };

      await createNote(noteData);

      // Only reset form and close modal on successful save
      setTitle('');
      setContent('');
      setVisibility('all employees');
      setAddActionItem(false);
      setSelectedContact(contact || null);
      setCcRecipients('');
      
      if (onNoteSaved) {
        onNoteSaved();
      }
      
      onClose();
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Failed to save note. Please try again.');
      // Don't close modal on error - let user see the error and try again
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
  };

  const handleInsertLink = () => {
    if (linkData.url && linkData.text) {
      const linkHtml = `<a href="${linkData.url}" title="${linkData.title || linkData.text}" target="_blank" rel="noopener noreferrer">${linkData.text}</a>`;
      setContent(content + linkHtml);
      setLinkData({ url: '', text: '', title: '' });
      setIsLinkModalOpen(false);
    }
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
                <h2 className="text-xl font-semibold">Add a note</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCcRecipients(ccRecipients ? '' : 'Add recipients...')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  >
                    Add Cc
                  </button>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
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
                  placeholder="Note title..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {ccRecipients && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={ccRecipients}
                    onChange={(e) => setCcRecipients(e.target.value)}
                    placeholder="Add Cc recipients (comma separated emails)..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}

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
                  <button
                    onClick={() => setIsLinkModalOpen(true)}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm transition-colors"
                    title="Insert Link"
                  >
                    <FiLink className="mr-1" />
                    Link
                  </button>
                </div>
              </div>

              <ReactQuill
                value={content}
                onChange={setContent}
                modules={modules}
                className="h-64 mb-12"
              />

              <div className="flex justify-between items-center mt-6">
                <button 
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Who is this note about?</h3>
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
                      Reference contacts so you can find notes related to that contact easily. This will not send the contacts any notifications.
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

      {/* Link Insert Modal */}
      <Dialog
        open={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        className="fixed inset-0 z-60 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white w-full max-w-md mx-4 rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Insert Link</h3>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkData.url}
                  onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text to Display</label>
                <input
                  type="text"
                  value={linkData.text}
                  onChange={(e) => setLinkData({ ...linkData, text: e.target.value })}
                  placeholder="Link text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={linkData.title}
                  onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
                  placeholder="Link title"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertLink}
                disabled={!linkData.url || !linkData.text}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default AddNoteModal;