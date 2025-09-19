import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSearch, FiSend, FiUser, FiUsers, FiPaperclip } from 'react-icons/fi';
import { createTextMessage, searchContactsAndUsers } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

function SendTeamMessageModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { showSuccess, showWarning, showError } = useToast();

  const [message, setMessage] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allRecipients, setAllRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const searchRef = useRef();

  const maxCharacters = 500;
  const characterCount = message.length;

  useEffect(() => {
    if (isOpen) {
      fetchAllRecipients();
      setMessage('');
      setSelectedRecipients([]);
      setSearchTerm('');
      setShowSuggestions(false);
      setAttachedFile(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAllRecipients = async () => {
    try {
      setLoading(true);
      const allUsersData = await searchContactsAndUsers('');

      // Filter out the current user and contacts (only show other team members)
      const filteredUsers = (allUsersData || []).filter(
        (recipient) => recipient.type === 'user' && recipient.id !== user?.id
      );
      setAllRecipients(filteredUsers);
    } catch (err) {
      console.error('Error fetching team members:', err);
      showError('Failed to load team members');
      setAllRecipients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientSelect = (recipient) => {
    const isAlreadySelected = selectedRecipients.find((c) => c.id === recipient.id);
    if (!isAlreadySelected) {
      setSelectedRecipients([...selectedRecipients, recipient]);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleRemoveRecipient = (recipientId) => {
    setSelectedRecipients(selectedRecipients.filter((r) => r.id !== recipientId));
  };

  const handleSend = async () => {
    if (!message.trim() && !attachedFile) {
      showWarning('Please enter a message or attach a file');
      return;
    }

    if (selectedRecipients.length === 0) {
      showWarning('Please select at least one recipient');
      return;
    }


    setSending(true);
    try {
      console.log('💬 SendTeamMessageModal: Sending to recipients:', selectedRecipients);
      
      for (const recipient of selectedRecipients) {
        const messageData = {
          recipient_id: recipient.id,
          sender_phone: null, // Internal messages don't need phone numbers
          recipient_phone: null, // Internal messages don't need phone numbers
          content: message || (attachedFile ? `📎 ${attachedFile.name}` : ''),
          direction: 'outgoing',
          status: 'sent',
          sent_at: new Date().toISOString(),
        };
        
        console.log('💬 SendTeamMessageModal: Message data for recipient:', recipient.name, messageData);
        await createTextMessage(messageData, attachedFile);
      }

      showSuccess(`Message sent to ${selectedRecipients.length} team member(s)!`);
      setMessage('');
      setSelectedRecipients([]);
      setAttachedFile(null);
      onClose();
    } catch (err) {
      console.error('Error sending message:', err);
      console.error('Error details:', err.message, err.stack);
      showError(`Failed to send message: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const filteredSuggestions = allRecipients.filter(
    (recipient) =>
      recipient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileAttach = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-4 pt-8">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

        <div className="relative bg-white w-full max-w-sm mx-4 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <FiSend className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold text-lg">💬 Send Team Message</span>
              </div>
              <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Recipient Search */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">To:</label>
              <div className="relative" ref={searchRef}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400 w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm"
                  disabled={loading}
                />
                {showSuggestions && searchTerm && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((recipient) => (
                        <button
                          key={recipient.id}
                          onClick={() => handleRecipientSelect(recipient)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {recipient.name?.[0]}{recipient.name?.split(' ')[1]?.[0] || ''}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-xs text-gray-900">{recipient.name}</span>
                              <div className="text-xs text-gray-500">{recipient.email}</div>
                              <div className="text-xs text-gray-400">
                                {recipient.contact_number || 'No phone number'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {recipient.contact_number || 'No phone number'}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-gray-500">No matching team members found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Recipients */}
            {selectedRecipients.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Selected:</label>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {selectedRecipients.map((recipient) => (
                    <div key={recipient.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {recipient.name?.[0]}{recipient.name?.split(' ')[1]?.[0] || ''}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-xs text-gray-900">{recipient.name}</span>
                          <div className="text-xs text-gray-500">{recipient.email}</div>
                        </div>
                      </div>
                      <div className="relative mr-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          {recipient.avatar_url ? (
                            <img
                              src={recipient.avatar_url}
                              alt={recipient.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-gray-600">
                              {recipient.name?.[0]}{recipient.name?.split(' ')[1]?.[0] || ''}
                            </span>
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
                      </div>
                      <button
                        onClick={() => handleRemoveRecipient(recipient.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Message:</label>
              
              {/* File attachment display */}
              {attachedFile && (
                <div className="mb-2 flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <FiPaperclip className="text-blue-600 w-4 h-4" />
                    <span className="text-sm text-blue-800 font-medium">{attachedFile.name}</span>
                    <span className="text-xs text-blue-600">
                      ({(attachedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-2 mb-2">
                <label className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Attach file">
                  <FiPaperclip className="w-4 h-4" />
                  <input
                    type="file"
                    onChange={handleFileAttach}
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.txt,.xlsx,.csv"
                  />
                </label>
                <span className="text-xs text-gray-500">
                  {attachedFile ? 'File attached' : 'Click paperclip to attach file'}
                </span>
              </div>
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none p-2 text-sm"
                placeholder="Type your message here..."
                maxLength={maxCharacters}
              />
              <div className="flex justify-end items-center mt-1">
                <span className="text-xs text-gray-500">
                  {characterCount} / {maxCharacters} characters
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 flex justify-end rounded-b-xl">
            <button
              onClick={handleSend}
              disabled={sending || (!message.trim() && !attachedFile) || selectedRecipients.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg text-sm flex items-center"
            >
              {sending ? (
                <div className="flex items-center space-x-1">
                  <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <FiSend className="w-3 h-3" />
                  <span>Send Message</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default SendTeamMessageModal;
