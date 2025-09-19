import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiLink, FiUser, FiPaperclip, FiTrash2, FiSave, FiEye } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../../context/AuthContext';
import { createNote, updateNote } from '../../services/api';
import ContactSelectModal from '../contacts/ContactSelectModal';
import { useToast } from '../../hooks/useToast';

function AddNoteModal({ isOpen, onClose, contact, onNoteSaved, isEditMode = false, initialData = null }) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // Enhanced logging
  console.log('📝 AddNoteModal: Rendered with props:', { 
    isOpen, 
    hasContact: !!contact, 
    isEditMode, 
    hasInitialData: !!initialData,
    userId: user?.id 
  });
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [visibility, setVisibility] = useState('all employees');
  const [addActionItem, setAddActionItem] = useState(initialData?.is_action_item || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(contact || initialData?.contacts || null);
  const [isContactSelectOpen, setIsContactSelectOpen] = useState(false);
  const [ccRecipients, setCcRecipients] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkData, setLinkData] = useState({ url: '', text: '', title: '' });
  const [attachedFile, setAttachedFile] = useState(null);
  const [isSticky, setIsSticky] = useState(false);

  // Update form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setAddActionItem(initialData.is_action_item || false);
      setSelectedContact(initialData.contacts || null);
      setVisibility(initialData.visibility || 'all employees');
    }
  }, [initialData]);

  const handleFileAttach = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

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

    console.log('📝 AddNoteModal: Starting save operation...', { isEditMode, title, hasContact: !!selectedContact });
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

      if (isEditMode && initialData?.id) {
        console.log('📝 AddNoteModal: Updating existing note:', initialData.id);
        await updateNote(initialData.id, noteData);
      } else {
        console.log('📝 AddNoteModal: Creating new note...');
        await createNote(noteData, attachedFile);
      }

      console.log('📝 AddNoteModal: Save successful, resetting form...');
      // Only reset form and close modal on successful save
      setTitle('');
      setContent('');
      setVisibility('all employees');
      setAddActionItem(false);
      setSelectedContact(contact || null);
      setCcRecipients('');
      setAttachedFile(null);
      setIsSticky(false);
      
      if (onNoteSaved) {
        onNoteSaved();
      }
      
      showSuccess(isEditMode ? 'Note updated successfully!' : 'Note saved successfully!');
      onClose();
    } catch (err) {
      console.error('Error saving note:', err);
      const errorMessage = 'Failed to save note. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      // Don't close modal on error - let user see the error and try again
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSelect = (contact) => {
    console.log('📝 AddNoteModal: Contact selected, closing contact modal first...');
    setIsContactSelectOpen(false);
    setTimeout(() => {
      console.log('📝 AddNoteModal: Setting selected contact:', contact);
      setSelectedContact(contact);
    }, 100);
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
        <div className="flex min-h-screen items-start justify-center p-4 pt-16">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

          <div className="relative bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-2xl overflow-hidden">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">📝</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {isEditMode ? 'Edit Note' : 'Add a Note'}
                    </h2>
                    <p className="text-blue-100 text-xs">
                      {isEditMode ? 'Update your note details' : 'Create a new note with rich content'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCcRecipients(ccRecipients ? '' : 'Add recipients...')}
                    className="text-white hover:text-blue-200 text-xs font-medium transition-colors px-2 py-1 rounded-md hover:bg-white hover:bg-opacity-10"
                  >
                    Add Cc
                  </button>
                  <button onClick={onClose} className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-10">
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Enhanced Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200 p-3 font-medium placeholder-gray-400"
                />
              </div>

              {/* Enhanced Contact Reference Section */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                  <FiUser className="mr-2 text-blue-600" />
                  Reference Contact
                </h3>
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
                      onClick={() => setIsContactSelectOpen(true)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsContactSelectOpen(true)}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                  >
                    <FiUser className="mr-2" />
                    <span className="font-medium">Select Contact to Reference</span>
                  </button>
                )}
              </div>
              {ccRecipients && (
                <div>
                  <input
                    type="text"
                    value={ccRecipients}
                    onChange={(e) => setCcRecipients(e.target.value)}
                    placeholder="Add Cc recipients (comma separated emails)..."
                    className="w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200 p-2"
                  />
                </div>
              )}

              {/* Enhanced File Attachment Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Attachment
                </label>
                {attachedFile ? (
                  <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiPaperclip className="text-green-600" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-green-800">{attachedFile.name}</span>
                        <div className="text-xs text-green-600">
                          {(attachedFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
                    <div className="flex items-center space-x-2 text-gray-600 group-hover:text-blue-600">
                      <FiPaperclip className="w-4 h-4" />
                      <span className="font-medium">Attach File</span>
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

              {/* Enhanced Visibility and Link Section */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-600">🔒</span>
                    </div>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="all employees">Visibility: all employees</option>
                      <option value="private">Visibility: private</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setIsLinkModalOpen(true)}
                  className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
                  title="Insert Link"
                >
                  <FiLink className="mr-2" />
                  Add Link
                </button>
              </div>

              {/* Sticky Note Option */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSticky}
                    onChange={(e) => setIsSticky(e.target.checked)}
                    className="w-4 h-4 rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500 focus:ring-2"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📌</span>
                    <div>
                      <span className="text-xs font-semibold text-yellow-800">Add as sticky note to dashboard</span>
                      <p className="text-xs text-yellow-700">This note will appear as a draggable sticky note</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Enhanced Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note Content
                </label>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20 transition-all duration-200">
                  <ReactQuill
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    className="h-32"
                    placeholder="Enter your note content here..."
                  />
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addActionItem}
                    onChange={(e) => setAddActionItem(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-gray-700 text-sm font-medium">Add as action item</span>
                </label>
                
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
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2" />
                        {isEditMode ? 'Update Note' : 'Save Note'}
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

      {/* Link Insert Modal */}
      <Dialog
        open={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        className="fixed inset-0 z-[60] overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

          <div className="relative bg-white w-full max-w-sm mx-4 rounded-lg shadow-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Insert Link</h3>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkData.url}
                  onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Text to Display</label>
                <input
                  type="text"
                  value={linkData.text}
                  onChange={(e) => setLinkData({ ...linkData, text: e.target.value })}
                  placeholder="Link text"
                  className="w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={linkData.title}
                  onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
                  placeholder="Link title"
                  className="w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertLink}
                disabled={!linkData.url || !linkData.text}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
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