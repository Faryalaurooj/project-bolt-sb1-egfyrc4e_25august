import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiSend, FiSearch, FiToggleLeft, FiToggleRight, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { getContacts, createTextMessage, getTextMessagesForContact, updateContact, getUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getTextMessagesForUserConversation } from '../services/api';
import { sendTextMessage } from "../services/textmagic";
// Main Texting component
function Texting() {
  const { user } = useAuth();
  const [allRecipients, setAllRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  // Fetch all recipients (contacts and users) from Supabase
  useEffect(() => {
    const fetchAllRecipients = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📱 Texting: Fetching all recipients from Supabase...');
        
        // Use the unified search function to get both contacts and users
        console.log('📱 Texting: Calling searchContactsAndUsers...');
        const allRecipientsData = await searchContactsAndUsers('');
        
        console.log('📱 Texting: Fetched all recipients:', allRecipientsData);
        
        // Filter out current user from the results
        const filteredRecipients = (allRecipientsData || [])
          .filter(recipient => recipient.id !== user?.id)
          .map(recipient => ({
            ...recipient,
            status: recipient.type === 'user' 
              ? (recipient.phone || recipient.contact_number ? 'Team Member' : 'No Phone')
              : (recipient.do_not_contact ? 'Do Not Contact' : 
                 (recipient.phone ? 'Active' : 'No Phone')),
            lastContact: recipient.last_contacted_at || recipient.created_at
          }));
        
        setAllRecipients(filteredRecipients);
        console.log('📱 Texting: Final filtered recipients set:', filteredRecipients.length);
      } catch (err) {
        console.error('📱 Texting: Error fetching recipients:', err);
        setError('Failed to load recipients. Please try again.');
        setAllRecipients([]); // Ensure we set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecipients();
  }, [user?.id]); // Add user.id as dependency

  // Fetch message history when recipient is selected
  useEffect(() => {
    if (selectedRecipient) {
      if (selectedRecipient.type === 'contact') {
        fetchMessageHistory(selectedRecipient.id, 'contact');
      } else if (selectedRecipient.type === 'user') {
        fetchMessageHistory(selectedRecipient.id, 'user');
      }
    }
  }, [selectedRecipient, user?.id]); // Added user.id as dependency for user conversations

  const fetchMessageHistory = async (recipientId, type) => {
    try {
      setLoadingMessages(true);
      console.log('📱 Texting: Fetching message history for recipient:', recipientId);
      let messages;
      if (type === 'contact') {
        messages = await getTextMessagesForContact(recipientId);
      } else if (type === 'user') {
        messages = await getTextMessagesForUserConversation(user.id, recipientId);
      }
      console.log('📱 Texting: Message history:', messages);
      setMessageHistory(messages || []);
    } catch (err) {
      console.error('📱 Texting: Error fetching message history:', err);
      setMessageHistory([]);
    } finally {
      setLoadingMessages(false);
    }
  };
  
  const filteredRecipients = allRecipients.filter(recipient => {
    const searchLower = searchTerm.toLowerCase();
    const name = String(recipient.name || '').toLowerCase();
    const phone = String(recipient.phone || recipient.contact_number || '').toLowerCase();
    const email = String(recipient.email || '').toLowerCase();
    return name.includes(searchLower) ||
           phone.includes(searchLower) ||
           email.includes(searchLower);
  });

  const filteredContacts = filteredRecipients.filter(r => r.type === 'contact');
  const filteredUsers = filteredRecipients.filter(r => r.type === 'user');

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedRecipient) return;

    // Check if user has phone number set
    if (!user?.contact_number) {
      alert('Your phone number is not set. Please update your profile to send text messages.');
      return;
    }

    // Check if recipient has opted out (only for contacts, not team members)
    if (selectedRecipient.type === 'contact' && selectedRecipient.do_not_contact) {
      alert('This contact has opted out of text messages.');
      return;
    }

    // Check if recipient has phone number
    if (!selectedRecipient.phone) {
      alert(`This ${selectedRecipient.type === 'user' ? 'team member' : 'contact'} does not have a phone number.`);
      return;
    }

    try {
      setSending(true);
      console.log('📱 Texting: Sending message to:', selectedRecipient.name, 'Message:', message);

      // Create outgoing message
      const messageData = {
        contact_id: selectedRecipient.type === 'contact' ? selectedRecipient.id : null,
        recipient_id: selectedRecipient.type === 'user' ? selectedRecipient.id : null,
        recipient_phone: selectedRecipient.phone,
        sender_phone: user.contact_number,
        content: message,
        status: 'sent',
        direction: 'outgoing',
        sent_at: new Date().toISOString()
      };

      await createTextMessage(messageData, attachedFile);

      // Simulate incoming reply if sending to your test number or team member
      if (selectedRecipient.phone === user.contact_number) {
        setTimeout(async () => {
          try { // eslint-disable-next-line
            const replyData = {
              contact_id: selectedRecipient.type === 'contact' ? selectedRecipient.id : null,
              recipient_id: selectedRecipient.type === 'user' ? selectedRecipient.id : null,
              recipient_phone: user.contact_number,
              sender_phone: selectedRecipient.phone,
              content: `Thanks for your message! This is an auto-reply from ${selectedRecipient.name}.`,
              status: 'received',
              direction: 'incoming',
              sent_at: new Date().toISOString()
            };
            await createTextMessage(replyData); // eslint-disable-next-line
            // Refresh message history
            if (selectedRecipient.type === 'contact') {
              fetchMessageHistory(selectedRecipient.id, 'contact');
            }
          } catch (err) {
            console.error('Error creating auto-reply:', err);
          }
        }, 2000); // 2 second delay for realistic simulation
      }

      // Refresh message history
      if (selectedRecipient.type === 'contact') {
        await fetchMessageHistory(selectedRecipient.id, 'contact');
      }
      
      // Clear message input
      setMessage('');
      
    } catch (err) {
      console.error('📱 Texting: Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleRecipientSelect = (recipient) => {
    setMessage('');
    setSelectedRecipient(recipient);
    setMessageHistory([]);
    setAttachedFile(null);
  };

  const handleToggleDoNotContact = async (recipient) => {
    if (recipient.type === 'user') {
      alert('Team members cannot be marked as "Do Not Contact"');
      return;
    }

    try {
      const newStatus = !recipient.do_not_contact;
      await updateContact(recipient.id, { do_not_contact: newStatus });
      
      // Update local state  
      setAllRecipients(prevRecipients =>
        prevRecipients.map(r =>
          r.id === recipient.id && r.type === 'contact'
            ? {
                ...r,
                do_not_contact: newStatus,
                status: newStatus ? 'Do Not Contact' : 
                        r.phone ? 'Active' : 'No Phone'
              }
            : r
        )
      );
      
      // Update selected recipient if it's the same one
      if (selectedRecipient && selectedRecipient.id === recipient.id && selectedRecipient.type === 'contact') {
        setSelectedRecipient(prev => ({
          ...prev,
          do_not_contact: newStatus,
          status: newStatus ? 'Do Not Contact' : 
                  prev.phone ? 'Active' : 'No Phone'
        }));
      }
      
      alert(`Contact ${newStatus ? 'opted out of' : 'opted back into'} text messages.`);
    } catch (err) {
      console.error('Error updating contact status:', err);
      alert('Failed to update contact status. Please try again.');
    }
  };

  const getRecipientTypeLabel = (recipient) => {
    if (recipient.type === 'user') return 'Team Member';
    return recipient.status;
  };

  const getRecipientTypeColor = (recipient) => {
    if (recipient.type === 'user') {
      return recipient.phone ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800';
    }
    
    switch (recipient.status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Do Not Contact': return 'bg-red-100 text-red-800';
      case 'No Phone': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="grid grid-cols-3 h-[calc(100vh-12rem)]">
        {/* Recipients List Panel */}
        <div className="border-r">
          <div className="overflow-y-auto h-full">
            {/* Contacts Section */}
            <div className="p-4 border-b">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Contacts</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="max-h-[45%] overflow-y-auto border-b">
              {filteredContacts.map(recipient => (
                <div
                  key={`${recipient.type}-${recipient.id}`}
                  onClick={() => handleRecipientSelect(recipient)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedRecipient?.id === recipient.id && selectedRecipient?.type === recipient.type ? 'bg-blue-50' : ''
                  }`}
                >
                  <RecipientCard recipient={recipient} handleToggleDoNotContact={handleToggleDoNotContact} getRecipientTypeColor={getRecipientTypeColor} getRecipientTypeLabel={getRecipientTypeLabel} />
                </div>
              ))}
              {!loading && !error && filteredContacts.length === 0 && searchTerm && <div className="p-4 text-center text-gray-500">No contacts found.</div>}
              {!loading && !error && filteredContacts.length === 0 && !searchTerm && <div className="p-4 text-center text-gray-500">No contacts available.</div>}
            </div>
          </div>

          {/* Team Members Section */}
          <div className="p-4 border-b">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Team Members</h3>
            <p className="text-sm text-gray-500">Use the search above to find team members</p>
          </div>
          <div className="max-h-[45%] overflow-y-auto">
            {loading && (
              <div className="p-4 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                <p className="text-gray-600">Loading recipients...</p>
              </div>
            )}
            
            {error && (
              <div className="p-4 text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Retry
                </button>
              </div>
            )}
            
            {!loading && !error && filteredUsers.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No team members found matching your search.' : 'No team members available.'}
              </div>
            )}
            
            {filteredUsers.map(recipient => (
              <div
                key={`${recipient.type}-${recipient.id}`}
                onClick={() => handleRecipientSelect(recipient)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedRecipient?.id === recipient.id && selectedRecipient?.type === recipient.type ? 'bg-blue-50' : ''
                }`}
              >
                <RecipientCard recipient={recipient} handleToggleDoNotContact={handleToggleDoNotContact} getRecipientTypeColor={getRecipientTypeColor} getRecipientTypeLabel={getRecipientTypeLabel} />
              </div>
            ))}
          </div>
        </div>

        {/* Message Area */}
        <div className="col-span-2 flex flex-col border-l">
          {selectedRecipient ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold text-gray-900">{selectedRecipient.name}</h2>
                  {selectedRecipient.type === 'user' && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      Team Member
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{selectedRecipient.phone || selectedRecipient.contact_number || 'No phone'}</p>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {loadingMessages ? (
                  <div className="text-center py-4">
                    <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                    <p className="text-gray-600">Loading messages...</p>
                  </div>
                ) : messageHistory.length === 0 && selectedRecipient.type === 'user' ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    No previous messages with this team member.
                    <p className="text-xs text-gray-400 mt-2">
                      (Note: Team member conversations are stored separately from contact messages.)
                    </p>
                  </div>
                ) : messageHistory.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    No previous messages
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
                    {messageHistory.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.direction === 'outgoing'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className={`text-xs ${
                              msg.direction === 'outgoing' ? 'text-blue-100' : 'text-gray-500'
                            } text-right w-full`}>
                              {formatMessageTime(msg.sent_at || msg.created_at)}
                            </p>
                            {msg.direction === 'outgoing' && (
                              <span className={`text-xs ${
                                msg.status === 'sent' ? 'text-blue-100' :
                                msg.status === 'delivered' ? 'text-green-200' :
                                msg.status === 'failed' ? 'text-red-200' :
                                'text-gray-300'
                              }`}>
                                {msg.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Type your message to ${selectedRecipient.name}...`}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={(selectedRecipient.type === 'contact' && selectedRecipient.do_not_contact) || !selectedRecipient.phone || sending || !message.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiSend className="mr-2" />
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Press Enter to send • Shift+Enter for new line
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FiMessageSquare className="mx-auto h-12 w-12 mb-4" />
                <p>Select a contact or team member to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for recipient card display
const RecipientCard = ({ recipient, handleToggleDoNotContact, getRecipientTypeColor, getRecipientTypeLabel }) => (
  <>
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">{recipient.name}</h3>
          {recipient.type === 'user' && (
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Team
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{recipient.phone || recipient.contact_number || 'No phone'}</p>
        {recipient.email && recipient.email !== 'No email' && (
          <p className="text-xs text-gray-400">{recipient.email}</p>
        )}
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${getRecipientTypeColor(recipient)}`}>
        {getRecipientTypeLabel(recipient)}
      </span>
    </div>
    <p className="text-xs text-gray-500 mt-1">
      Last contacted: {recipient.lastContact ? new Date(recipient.lastContact).toLocaleDateString() : 'Never'}
    </p>

    {/* Do Not Contact Toggle - Only for contacts, not team members */}
    {recipient.type === 'contact' && (
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-600">Opt-out status:</span>
        <button
          onClick={(e) => { 
            e.stopPropagation();
            handleToggleDoNotContact(recipient);
          }}
          className={`flex items-center ${recipient.do_not_contact ? 'text-red-600' : 'text-green-600'}`}
        >
          {recipient.do_not_contact ? (
            <> <FiToggleRight className="w-4 h-4 mr-1" /> <span className="text-xs">Opted Out</span> </>
          ) : (
            <> <FiToggleLeft className="w-4 h-4 mr-1" /> <span className="text-xs">Active</span> </>
          )}
        </button>
      </div>
    )}
  </>
);

export default Texting;