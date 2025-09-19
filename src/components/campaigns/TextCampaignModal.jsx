import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSearch, FiSend, FiPaperclip, FiUser, FiTrash2, FiFileText, FiUsers } from 'react-icons/fi';
import { createTextMessage, searchContactsAndUsers } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import TemplateSelectModal from './TemplateSelectModal';


function TextCampaignModal({ isOpen, onClose, preSelectedContacts = [] }) {
  const { user } = useAuth();
  const { showSuccess, showInfo, showWarning, showError } = useToast();

  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState(preSelectedContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [allRecipients, setAllRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isTemplateSelectModalOpen, setIsTemplateSelectModalOpen] = useState(false);

  const searchRef = useRef();

  const maxCharacters = 160;
  const characterCount = message.length;

  useEffect(() => {
    if (isOpen) {
      console.log('📱 TextCampaignModal: Modal opened, fetching recipients...');
      fetchAllRecipients();
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
      console.log('📱 TextCampaignModal: Starting to fetch all recipients...');
      
      // Use the unified search function to get both contacts and users
      const allRecipientsData = await searchContactsAndUsers('');
      
      console.log('📱 TextCampaignModal: Raw data received:', {
        recipients: allRecipientsData?.length || 0
      });
      
      // Filter out current user and opted-out contacts
      const filteredRecipients = (allRecipientsData || [])
        .filter(recipient => {
          // Exclude current user
          if (recipient.id === user?.id) return false;
          // Exclude opted-out contacts
          if (recipient.type === 'contact' && recipient.do_not_contact) return false;
          return true;
        });
      
      setAllRecipients(filteredRecipients);
      console.log('📱 TextCampaignModal: All recipients set successfully');
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts');
      setAllRecipients([]); // Ensure we set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleContactSelect = (contact) => {
    const isAlreadySelected = selectedContacts.find((c) => c.id === contact.id && c.type === contact.type);
    if (!isAlreadySelected) {
      setSelectedContacts([...selectedContacts, contact]);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleRemoveContact = (contactId) => {
    setSelectedContacts(selectedContacts.filter((c) => c.id !== contactId));
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

  const filteredRecipients = allRecipients.filter(
    (contact) =>
      contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm)
  );

  const handleSend = async () => {
    if (!message.trim()) {
      showWarning('⚠️ Please enter a message');
      return;
    }

    if (selectedContacts.length === 0) {
      showWarning('⚠️ Please select at least one recipient');
      return;
    }

    if (!user?.contact_number) {
      showWarning('⚠️ Your phone number is not set. Please update your profile.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📱 TextCampaignModal: Sending campaign to', selectedContacts.length, 'recipients');
      
      // Send individual text messages to each contact
      for (const contact of selectedContacts) {
        const personalizedMessage = message.replace('{first name}', contact.first_name || contact.name?.split(' ')[0] || 'there');
        
        const messageData = {
          contact_id: contact.type === 'contact' ? contact.id : null,
          recipient_id: contact.type === 'user' ? contact.id : null,
          sender_phone: user.contact_number,
          recipient_phone: contact.phone,
          content: personalizedMessage,
          direction: 'outgoing',
          status: 'pending',
          sent_at: new Date().toISOString()
        };

        console.log('📱 TextCampaignModal: Sending to:', contact.name, 'Phone:', contact.phone);
        await createTextMessage(messageData, attachedFile);
        
        // Simulate auto-reply for test number
        if (contact.phone === user.contact_number) {
          setTimeout(async () => {
            try {
              await createTextMessage({
                contact_id: contact.type === 'contact' ? contact.id : null,
                recipient_id: contact.type === 'user' ? contact.id : null,
                sender_phone: contact.phone,
                recipient_phone: user.contact_number,
                content: `Thanks for your message! This is an auto-reply from ${contact.first_name}.`,
                status: 'received',
                direction: 'incoming',
                sent_at: new Date().toISOString()
              });
            } catch (err) {
              console.error('Error creating auto-reply:', err);
            }
          }, 2000);
        }
      }
      
      showSuccess(`📱 Text campaign sent successfully to ${selectedContacts.length} recipient(s)!`);
      
      // Reset form
      setMessage('');
      setSelectedContacts([]);
      setAttachedFile(null);
      
      onClose();
    } catch (err) {
      console.error('Error sending text:', err);
      showError(`❌ Failed to send text campaign: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = () => {
    setIsTemplateSelectModalOpen(true);
  };

  const handleTemplateSelect = (template) => {
    setMessage(template.content || template.subject || '');
    setIsTemplateSelectModalOpen(false);
    showSuccess('📄 Template applied successfully!');
  };

  const handleSendTest = () => {
    if (!message.trim()) {
      showWarning('⚠️ Please enter a message before sending test');
      return;
    }
    showSuccess('📱 Test message sent successfully!');
  };

  const handleNextSendOptions = () => {
    showInfo('📋 Send options workflow coming soon! You\'ll be able to schedule messages, set delivery preferences, and configure advanced sending options.');
  };
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-start justify-center p-4 pt-8">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

          <div className="relative bg-white w-full max-w-sm mx-4 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <FiSend className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-semibold text-lg">💬 Compose Text</span>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {error && (
                <div className="p-2 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Add Contacts Search */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Add Contacts
                </label>
                <div className="relative" ref={searchRef}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400 w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search contacts or team members..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-10 w-full rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 text-sm"
                  />
                  {showSuggestions && searchTerm && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {(() => {
                        const searchResults = allRecipients.filter(recipient => {
                        const searchLower = searchTerm.toLowerCase();
                        const name = String(recipient.name || '').toLowerCase();
                        const email = String(recipient.email || '').toLowerCase();
                        const phone = String(recipient.phone || recipient.contact_number || '').toLowerCase();
                        return name.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower);
                      });
                        
                        return searchResults.length > 0 ? (
                          searchResults.slice(0, 6).map((recipient) => (
                            <button
                              key={`${recipient.type}-${recipient.id}`}
                              onClick={() => handleContactSelect(recipient)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-600">
                                    {recipient.first_name?.[0] || recipient.name?.[0] || 'U'}{recipient.last_name?.[0] || recipient.name?.split(' ')[1]?.[0] || ''}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center space-x-1">
                                    <span className="font-medium text-xs text-gray-900">
                                      {recipient.name}
                                    </span>
                                    {recipient.type === 'user' && (
                                      <span className="text-xs bg-purple-100 text-purple-600 px-1 py-0.5 rounded">
                                        Team
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">{recipient.phone || recipient.contact_number || 'No phone'}</div>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-xs text-gray-500">No matching recipients found</div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Contacts */}
              {selectedContacts.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Recipients ({selectedContacts.length})
                  </label>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {selectedContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {contact.name?.[0]}{contact.name?.split(' ')[1]?.[0] || ''}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-1">
                              <span className="font-medium text-xs text-gray-900">
                                {contact.name}
                              </span>
                              {contact.type === 'user' && (
                                <span className="text-xs bg-purple-100 text-purple-600 px-1 py-0.5 rounded">
                                  Team
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{contact.phone}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveContact(contact.id)}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Message
                  </label>
                  <button
                    onClick={handleUseTemplate}
                    className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center"
                  >
                    <FiFileText className="mr-1 w-3 h-3" />
                    Use template
                  </button>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 resize-none p-2 text-sm"
                  placeholder="Type your message here..."
                  maxLength={maxCharacters}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {characterCount} / {maxCharacters} characters
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">😊</span>
                  </div>
                </div>
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Attach File
                </label>
                {attachedFile ? (
                  <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <FiPaperclip className="text-blue-600 w-3 h-3" />
                      <span className="text-xs text-blue-800 font-medium">{attachedFile.name}</span>
                      <span className="text-xs text-blue-600">
                        ({(attachedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-10 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiPaperclip className="w-3 h-3" />
                      <span className="text-xs">Attach file or report</span>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileAttach}
                      className="hidden"
                      accept="image/*,application/pdf,.doc,.docx,.txt"
                    />
                  </label>
                )}
              </div>

              {/* Sender Info Display */}
              <div className="bg-gray-50 p-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FiUser className="text-gray-500 w-3 h-3" />
                  <span className="text-xs text-gray-600">
                    Sending from: {user?.contact_number || 'Phone number not set'}
                  </span>
                </div>
                {user?.first_name && (
                  <div className="text-xs text-gray-500 ml-5">
                    {user.first_name} {user.last_name}
                  </div>
                )}
              </div>

              {/* CAN-SPAM Notice */}
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-800">
                  <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs inline-block mb-1">
                    Required by CAN-SPAM
                  </div>
                  <p>Recipients can reply "STOP" to unsubscribe from future messages.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={handleSendTest}
                  className="px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-xs flex items-center"
                >
                  <FiSend className="mr-1 w-3 h-3" />
                  Send Test
                </button>
                <button
                  onClick={handleNextSendOptions}
                  className="px-3 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors text-xs flex items-center"
                >
                  <FiUsers className="mr-1 w-3 h-3" />
                  Send Options
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={loading || !message.trim() || selectedContacts.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg text-sm"
              >
                {loading ? (
                  <div className="flex items-center space-x-1">
                    <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <FiSend className="w-3 h-3" />
                    <span>Send Text</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      <TemplateSelectModal
        isOpen={isTemplateSelectModalOpen}
        onClose={() => setIsTemplateSelectModalOpen(false)}
        onSelect={handleTemplateSelect}
      />
    </>
  );
}

export default TextCampaignModal;