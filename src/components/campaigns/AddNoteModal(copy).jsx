import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiLink, FiUser, FiPaperclip, FiTrash2 } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../../context/AuthContext';
import { createNote } from '../../services/api';
import ContactSelectModal from '../contacts/ContactSelectModal';

function AddNoteModal({ isOpen, onClose, contact, onNoteSaved }) {
  const { user } = useAuth();
  
  // Debug logging
  console.log('📝 AddNoteModal rendered - isOpen:', isOpen);

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
  const [isSticky, setIsSticky] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [stickyPosition, setStickyPosition] = useState({
    x: Math.random() * 300 + 100,
    y: Math.random() * 200 + 100
  });

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
        is_sticky: isSticky,
        x_position: isSticky ? stickyPosition.x : null,
        y_position: isSticky ? stickyPosition.y : null,
        contact_id: selectedContact?.id,
        status: addActionItem ? 'pending' : null
      };

      await createNote(noteData, attachedFile);

      // Only reset form and close modal on successful save
      setTitle('');
      setContent('');
      setVisibility('all employees');
      setAddActionItem(false);
      setIsSticky(false);
      setAttachedFile(null);
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

  const handleFileAttach = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
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
        className="fixed inset-0 z-[9999] overflow-y-auto"
      >
        <div className="flex min-h-screen items-start justify-center p-4 pt-8">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

          <div className="relative bg-white w-full max-w-4xl mx-4 rounded-2xl shadow-2xl overflow-hidden">
            {/* Canva-inspired header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">📝</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">Add a note</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCcRecipients(ccRecipients ? '' : 'Add recipients...')}
                    className="text-white hover:text-gray-200 text-sm font-medium transition-colors"
                  >
                    Add Cc
                  </button>
                  <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {/* Title Input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  className="w-full rounded-lg border-2 border-purple-200 shadow-sm focus:border-purple-400 focus:ring-purple-300 focus:ring-2 transition-all p-3 text-lg font-medium"
                />
              </div>

              {/* Reference Contact Section */}
              <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Reference Contact</h3>
                {selectedContact ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {selectedContact.first_name?.[0]}{selectedContact.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedContact.first_name} {selectedContact.last_name}
                        </div>
                        {selectedContact.email && (
                          <div className="text-xs text-gray-500">{selectedContact.email}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsContactSelectOpen(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsContactSelectOpen(true)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <FiUser className="w-4 h-4" />
                    <span className="text-sm">Select contact</span>
                  </button>
                )}
              </div>

              {ccRecipients && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={ccRecipients}
                    onChange={(e) => setCcRecipients(e.target.value)}
                    placeholder="Add Cc recipients (comma separated emails)..."
                    className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-purple-400 focus:ring-purple-300 focus:ring-2 transition-all p-2"
                  />
                </div>
              )}

              {/* File Attachment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Attachment
                </label>
                {attachedFile ? (
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <FiPaperclip className="text-blue-600" />
                      <span className="text-sm text-blue-800 font-medium">{attachedFile.name}</span>
                      <span className="text-xs text-blue-600">
                        ({(attachedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiPaperclip className="w-4 h-4" />
                      <span className="text-sm">Attach file</span>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileAttach}
                      className="hidden"
                      accept="image/*,application/pdf,.doc,.docx,.txt,.xlsx,.csv"
                    />
                  </label>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">🔒</span>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="border-none text-gray-700 focus:ring-0 bg-transparent"
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
                className="h-48 mb-12 rounded-lg"
              />

              {/* Sticky Note Option */}
              <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSticky}
                    onChange={(e) => setIsSticky(e.target.checked)}
                    className="rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-600 text-lg">📌</span>
                    <span className="text-sm font-medium text-yellow-800">Add as sticky note to dashboard</span>
                  </div>
                </label>
                {isSticky && (
                  <p className="text-xs text-yellow-700 mt-2 ml-8">
                    This note will appear as a draggable sticky note on your dashboard
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <button 
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addActionItem}
                    onChange={(e) => setAddActionItem(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Add action item</span>
                </label>
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
