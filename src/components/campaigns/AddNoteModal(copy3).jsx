import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { FiX } from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Select from "react-select";
import { useAuth } from "../../context/AuthContext";
import { createNote, searchContactsAndUsers } from "../../services/api";

export default function AddNoteModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [noteContent, setNoteContent] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactOptions, setContactOptions] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // 🔍 Search both contacts & users from backend
  const handleSearch = async (inputValue) => {
    if (!inputValue.trim()) return;
    setLoadingContacts(true);
    try {
      const results = await searchContactsAndUsers(inputValue);
      const options = results.map((item) => ({
        value: item.id,
        label: item.name || item.full_name || item.email,
        type: item.type, // 'contact' or 'user'
      }));
      setContactOptions(options);
    } catch (error) {
      console.error("Error searching contacts/users:", error);
    }
    setLoadingContacts(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please enter both title and content');
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
        x_position: isSticky ? Math.round(Math.random() * 300 + 100) : null,
        y_position: isSticky ? Math.round(Math.random() * 200 + 100) : null,
        contact_id: selectedContact?.data?.id || selectedContact?.id,
        status: addActionItem ? 'pending' : null
      };

      await createNote(noteData, attachedFile);

      // Reset form
      setTitle('');
      setContent('');
      setVisibility('all employees');
      setAddActionItem(false);
      setIsSticky(false);
      setAttachedFile(null);
      setSelectedContact(contact || null);
      setContactOptions([]);
      
      if (onNoteSaved) {
        onNoteSaved();
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating note:', error);
      setError('Failed to save note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true"></div>

      {/* Modal Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
          <div className="flex justify-between items-center border-b px-4 py-2">
            <h2 className="text-lg font-semibold">Add Note</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <FiX size={20} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Contact/User
              </label>
              <Select
                placeholder="Search contacts or users..."
                isLoading={loadingContacts}
                onInputChange={(value) => handleSearch(value)}
                options={contactOptions}
                value={selectedContact}
                onChange={setSelectedContact}
                isClearable
                isSearchable
                filterOption={null}
                className="z-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note Content
              </label>
              <ReactQuill value={noteContent} onChange={setNoteContent} />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t px-4 py-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
