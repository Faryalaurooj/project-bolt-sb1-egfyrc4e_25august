import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSearch, FiMail, FiUser, FiUsers, FiSend } from 'react-icons/fi';
import { searchContactsAndUsers } from '../../services/api';
import { sendOutlookEmail } from '../../services/outlookSync';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

function SendDocumentEmailModal({ isOpen, onClose, document, onEmailSent }) {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && document) {
      fetchRecipients();
      setEmailSubject(`Document: ${document.file_name || 'IVANS Document'}`);
      setEmailMessage(`Hi,

I'm sharing a document with you: ${document.file_name || 'IVANS Document'}

You can view and download the document using the link below:
${document.file_url || document.generated_pdf_url}

Best regards,
${user?.first_name || user?.email?.split('@')[0] || 'Your Agent'}`);
    }
  }, [isOpen, document, user]);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const data = await searchContactsAndUsers('');
      setRecipients(data || []);
    } catch (error) {
      console.error('Error fetching recipients:', error);
      showError('Failed to load recipients');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientToggle = (recipient) => {
    const isSelected = selectedRecipients.find(r => r.id === recipient.id && r.type === recipient.type);
    if (isSelected) {
      setSelectedRecipients(selectedRecipients.filter(r => !(r.id === recipient.id && r.type === recipient.type)));
    } else {
      setSelectedRecipients([...selectedRecipients, recipient]);
    }
  };

  const handleSendEmail = async () => {
    if (selectedRecipients.length === 0) {
      showError('Please select at least one recipient');
      return;
    }

    if (!emailSubject.trim() || !emailMessage.trim()) {
      showError('Please provide email subject and message');
      return;
    }

    setSending(true);
    try {
      for (const recipient of selectedRecipients) {
        if (recipient.email) {
          const personalizedMessage = emailMessage.replace(
            '{recipient_name}', 
            recipient.name || `${recipient.first_name} ${recipient.last_name}`
          );
          
          try {
            await sendOutlookEmail(recipient.email, emailSubject, personalizedMessage);
          } catch (outlookError) {
            // Fallback to mailto if Outlook fails
            const mailtoLink = `mailto:${recipient.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(personalizedMessage)}`;
            window.open(mailtoLink, '_blank');
          }
        }
      }
      
      showSuccess(`Document emailed to ${selectedRecipients.length} recipient(s)!`);
      onEmailSent();
    } catch (error) {
      console.error('Error sending emails:', error);
      showError('Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  const filteredRecipients = recipients.filter(recipient => {
    const searchLower = searchTerm.toLowerCase();
    const name = String(recipient.name || '').toLowerCase();
    const email = String(recipient.email || '').toLowerCase();
    return name.includes(searchLower) || email.includes(searchLower);
  });

  if (!document) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

        <div className="relative bg-white w-full max-w-2xl mx-4 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <FiMail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-semibold text-white">
                    Email Document
                  </Dialog.Title>
                  <p className="text-green-100 text-sm">Send document to contacts or team members</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Document Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Document to Send</h4>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiFile className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{document.file_name}</p>
                  <p className="text-sm text-gray-500">
                    {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : ''} • 
                    {new Date(document.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2"
                  placeholder="Email subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2"
                  placeholder="Email message..."
                />
              </div>
            </div>

            {/* Recipients Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipients ({selectedRecipients.length} selected)
              </label>
              
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400 w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search contacts and team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2"
                />
              </div>

              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin inline-block w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading recipients...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredRecipients.map((recipient) => {
                      const isSelected = selectedRecipients.find(r => r.id === recipient.id && r.type === recipient.type);
                      return (
                        <div
                          key={`${recipient.type}-${recipient.id}`}
                          onClick={() => handleRecipientToggle(recipient)}
                          className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
                            isSelected ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={() => {}} // Handled by onClick
                            className="mr-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-gray-600">
                              {recipient.name?.[0]}{recipient.name?.split(' ')[1]?.[0] || ''}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">{recipient.name}</p>
                              {recipient.type === 'user' && (
                                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                                  Team
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{recipient.email}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedRecipients.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    Selected: {selectedRecipients.map(r => r.name).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={sending || selectedRecipients.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center"
            >
              {sending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <FiSend className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default SendDocumentEmailModal;