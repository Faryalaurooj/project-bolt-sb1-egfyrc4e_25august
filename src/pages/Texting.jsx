import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiSend, FiSearch, FiToggleLeft, FiToggleRight, FiUser, FiPhone, FiMail, FiPlus, FiEye } from 'react-icons/fi';
import { getContacts, createTextMessage, getTextMessagesForContact, updateContact, getUsers, searchContactsAndUsers, getTextMagicMessageHistory, getContactById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getTextMessagesForUserConversation } from '../services/api';
import TextCampaignModal from '../components/campaigns/TextCampaignModal';
import FocusedViewModal from '../components/contacts/FocusedViewModal';
// Main Texting component
function Texting() {
  const { user } = useAuth();
  const [allRecipients, setAllRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    showContacts: true,
    showTeamMembers: true,
    showActiveOnly: false
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isTextCampaignModalOpen, setIsTextCampaignModalOpen] = useState(false);
  const [isContactViewModalOpen, setIsContactViewModalOpen] = useState(false);
  const [selectedContactForView, setSelectedContactForView] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch all recipients (contacts and users) from Supabase
  useEffect(() => {
    const fetchAllRecipients = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📱 Texting: Fetching all recipients from Supabase...');
        
        // Fetch both contacts and users separately for better control
        console.log('📱 Texting: Fetching contacts and users...');
        const [contactsData, usersData] = await Promise.all([
          getContacts(),
          getUsers()
        ]);
        
        console.log('📱 Texting: Raw data fetched:', {
          contacts: contactsData?.length || 0,
          users: usersData?.length || 0
        });
        
        // Format contacts
        const formattedContacts = (contactsData || []).map(contact => ({
          ...contact,
          type: 'contact',
          name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 
                 contact.email?.split('@')[0] || 
                 'Unnamed Contact',
          phone: contact.cell_number || contact.phone || contact.home_phone_number || contact.work_number
        }));
        
        // Format users (team members) and filter out current user
        const formattedUsers = (usersData || [])
          .filter(recipient => recipient.id !== user?.id)
          .map(teamUser => ({
            ...teamUser,
            type: 'user',
            name: `${teamUser.first_name || ''} ${teamUser.last_name || ''}`.trim() ||
                   teamUser.email?.split('@')[0] ||
                   'Team Member',
            phone: teamUser.contact_number
          }));
        
        // Combine and add status information
        const allRecipientsData = [...formattedContacts, ...formattedUsers].map(recipient => ({
          ...recipient,
          status: recipient.type === 'user' 
            ? (recipient.phone || recipient.contact_number ? 'Team Member' : 'No Phone')
            : (recipient.do_not_contact ? 'Do Not Contact' : 
               (recipient.phone ? 'Active' : 'No Phone')),
          lastContact: recipient.last_contacted_at || recipient.created_at
        }));
        
        setAllRecipients(allRecipientsData);
        console.log('📱 Texting: Final recipients set:', allRecipientsData.length);
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

  // Filter recipients based on search term
  const filteredRecipients = allRecipients.filter(recipient => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const name = String(recipient.name || '').toLowerCase();
    const email = String(recipient.email || '').toLowerCase();
    const phone = String(recipient.phone || recipient.contact_number || '').toLowerCase();
    
    return name.includes(searchLower) || 
           email.includes(searchLower) || 
           phone.includes(searchLower);
  }).filter(recipient => {
    // Apply quick filters
    if (!quickFilters.showContacts && recipient.type === 'contact') return false;
    if (!quickFilters.showTeamMembers && recipient.type === 'user') return false;
    if (quickFilters.showActiveOnly && recipient.type === 'contact' && recipient.do_not_contact) return false;
    return true;
  });

  // Fetch message history when recipient is selected
  useEffect(() => {
    if (selectedRecipient) {
      // Since you only have one user type, we'll use the phone number directly
      const phoneNumber = selectedRecipient.phone || selectedRecipient.cell_number || selectedRecipient.contact_number;
      console.log('📱 useEffect: Selected recipient changed:', {
        recipient: selectedRecipient.name,
        phone: phoneNumber,
        allPhoneFields: {
          phone: selectedRecipient.phone,
          cell_number: selectedRecipient.cell_number,
          contact_number: selectedRecipient.contact_number
        }
      });
      if (phoneNumber) {
        fetchMessageHistoryFromTextMagic(phoneNumber);
      } else {
        console.log('📱 useEffect: No phone number found for recipient');
        setMessageHistory([]);
      }
    }
  }, [selectedRecipient, user?.id]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageHistory]);

  // Auto-refresh disabled to prevent unnecessary data loading
  // Messages are now updated in real-time without full refresh

  // Simplified function to fetch message history from TextMagic API
  const fetchMessageHistoryFromTextMagic = async (phoneNumber) => {
    try {
      setLoadingMessages(true);
      console.log('📱 Texting: Fetching message history from TextMagic for phone:', phoneNumber);
      console.log('📱 Texting: Phone number type:', typeof phoneNumber);
      console.log('📱 Texting: Phone number length:', phoneNumber?.length);
      
      // Get user's phone number for sender/receiver differentiation
      const userPhoneNumber = user?.contact_number || '18333875967'; // Fallback to default
      console.log('📱 Texting: User phone number:', userPhoneNumber);
      
      // Fetch from TextMagic API
      const messages = await getTextMagicMessageHistory(phoneNumber, userPhoneNumber);
      console.log('📱 Texting: TextMagic message history fetched:', messages?.length || 0, 'messages');
      
      // Debug: Log message directions and phone number matching
      console.log('📱 Debug: Phone number matching:');
      console.log('📱 - Selected recipient phone:', phoneNumber);
      console.log('📱 - User phone number:', userPhoneNumber);
      console.log('📱 - Messages received from API:', messages?.length || 0);
      
      // The API function already processes and filters the messages
      // Just set them directly
      console.log('📱 Setting message history:', messages);
      setMessageHistory(messages || []);
    } catch (err) {
      console.error('📱 Texting: Error fetching message history from TextMagic:', err);
      setMessageHistory([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Legacy function for backward compatibility
  const fetchMessageHistory = async (recipientId, type) => {
    try {
      setLoadingMessages(true);
      console.log('📱 Texting: Fetching message history for recipient:', recipientId, 'type:', type);
      
      // Get the phone number for TextMagic API
      let phoneNumber = null;
      if (type === 'contact') {
        const contact = allRecipients.find(r => r.id === recipientId && r.type === 'contact');
        phoneNumber = contact?.phone || contact?.cell_number;
      } else if (type === 'user') {
        const user = allRecipients.find(r => r.id === recipientId && r.type === 'user');
        phoneNumber = user?.phone || user?.contact_number;
      }
      
      if (!phoneNumber) {
        console.log('📱 Texting: No phone number found for recipient');
        setMessageHistory([]);
        return;
      }
      
      console.log('📱 Texting: Fetching from TextMagic API for phone:', phoneNumber);
      
      // Fetch from TextMagic API
      const messages = await getTextMagicMessageHistory(phoneNumber);
      console.log('📱 Texting: TextMagic message history fetched:', messages?.length || 0, 'messages');
      setMessageHistory(messages || []);
    } catch (err) {
      console.error('📱 Texting: Error fetching message history:', err);
      setMessageHistory([]);
    } finally {
      setLoadingMessages(false);
    }
  };
  
  
  const filteredContacts = filteredRecipients.filter(r => r.type === 'contact');
  const filteredUsers = filteredRecipients.filter(r => r.type === 'user');
  console.log("filteredContacts",filteredContacts);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedRecipient) return;

    // Check if user has phone number set
    // if (!user?.contact_number) {
    //   alert('Your phone number is not set. Please update your profile to send text messages.');
    //   return;
    // }

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

      // Create outgoing message - simplified for single user type
      const messageData = {
        contact_id: selectedRecipient.type === 'contact' ? selectedRecipient.id : null,
        recipient_id: selectedRecipient.type === 'user' ? selectedRecipient.id : null,
        recipient_phone: selectedRecipient.phone || selectedRecipient.cell_number || selectedRecipient.contact_number,
        sender_phone: user?.contact_number || '18333875967', // Use your number or fallback
        content: message,
        status: 'pending', // Changed to pending, API will update to sent
        direction: 'outgoing',
        sent_at: new Date().toISOString()
      };

      // Send message via API
      const sentMessage = await createTextMessage(messageData, attachedFile);
      console.log('📱 Texting: Message sent successfully:', sentMessage);
      
      // IMMEDIATELY add the message to the UI without waiting for API refresh
      const newMessage = {
        id: `temp-${Date.now()}`, // Temporary ID
        content: message,
        direction: 'outgoing',
        status: 'pending',
        sent_at: new Date().toISOString(),
        sender_phone: user?.contact_number || '18333875967',
        recipient_phone: selectedRecipient.phone || selectedRecipient.cell_number || selectedRecipient.contact_number
      };

      // Add message to the current message history immediately
      setMessageHistory(prevMessages => [...prevMessages, newMessage]);
      
      // Show success feedback
      console.log('✅ Message sent to', selectedRecipient.name);

      // Simulate incoming reply if sending to your test number
      const recipientPhone = selectedRecipient.phone || selectedRecipient.cell_number || selectedRecipient.contact_number;
      const senderPhone = user?.contact_number || '18333875967';
      
      if (recipientPhone === senderPhone) {
        setTimeout(async () => {
          try {
            const replyData = {
              contact_id: selectedRecipient.type === 'contact' ? selectedRecipient.id : null,
              recipient_id: selectedRecipient.type === 'user' ? selectedRecipient.id : null,
              recipient_phone: senderPhone,
              sender_phone: recipientPhone,
              content: `Thanks for your message! This is an auto-reply from ${selectedRecipient.name}.`,
              status: 'received',
              direction: 'incoming',
              sent_at: new Date().toISOString()
            };
            await createTextMessage(replyData);
            console.log('📱 Texting: Auto-reply sent');
            
            // Add auto-reply to UI immediately
            const autoReplyMessage = {
              id: `auto-reply-${Date.now()}`,
              content: `Thanks for your message! This is an auto-reply from ${selectedRecipient.name}.`,
              direction: 'incoming',
              status: 'received',
              sent_at: new Date().toISOString(),
              sender_phone: recipientPhone,
              recipient_phone: senderPhone
            };
            
            setMessageHistory(prevMessages => [...prevMessages, autoReplyMessage]);
          } catch (err) {
            console.error('Error creating auto-reply:', err);
          }
        }, 2000); // 2 second delay for realistic simulation
      }

      // Update message status to sent after a short delay (no need to refresh all data)
      setTimeout(() => {
        setMessageHistory(prevMessages => 
          prevMessages.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'sent' }
              : msg
          )
        );
      }, 1000);
      
      // Clear message input
      setMessage('');
      setAttachedFile(null);
      
    } catch (err) {
      console.error('📱 Texting: Error sending message:', err);
      alert(`Failed to send message: ${err.message || 'Please try again.'}`);
    } finally {
      setSending(false);
    }
  };

  // Helper function to refresh message history
  const refreshMessageHistory = async () => {
    if (selectedRecipient) {
      const phoneNumber = selectedRecipient.phone || selectedRecipient.cell_number || selectedRecipient.contact_number;
      if (phoneNumber) {
        await fetchMessageHistoryFromTextMagic(phoneNumber);
      }
    }
  };

  const handleRecipientSelect = (recipient) => {
    setMessage('');
    setSelectedRecipient(recipient);
    setMessageHistory([]);
    setAttachedFile(null);
  };

  const handleContactNameClick = async (recipient, e) => {
    e.stopPropagation(); // Prevent triggering recipient selection
    
    // Only show contact view for contacts, not team members
    if (recipient.type !== 'contact') {
      return;
    }

    try {
      console.log('👤 Texting: Opening contact view for:', recipient.id);
      
      // Fetch full contact details
      const contactDetails = await getContactById(recipient.id);
      console.log('👤 Texting: Contact details fetched:', contactDetails);
      
      setSelectedContactForView(contactDetails);
      setIsContactViewModalOpen(true);
    } catch (error) {
      console.error('👤 Texting: Error fetching contact details:', error);
      alert('Failed to load contact details. Please try again.');
    }
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
    try {
      // Handle TextMagic date format: "2025-09-09T06:19:27+0000"
      const date = new Date(timestamp);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'timestamp:', timestamp);
      return 'Invalid date';
    }
  };

  return (
    <div className="p-4">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">💬 Text Messaging</h2>
            <p className="text-gray-600 text-sm">Send messages to contacts and team members</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xl font-bold text-blue-600">{filteredRecipients.length}</div>
              <div className="text-xs text-gray-500">Available Recipients</div>
            </div>
            <button
              onClick={() => setIsTextCampaignModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-240px)]">
        {/* Enhanced Recipients Panel */}
        <div className="flex flex-col bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
          {/* Enhanced Search and Filters */}
          <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Recipients</h3>
              <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                {filteredRecipients.length} found
              </div>
            </div>
            
            {/* Enhanced Search Bar */}
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-2 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiToggleLeft className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setQuickFilters(prev => ({ ...prev, showContacts: !prev.showContacts }))}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  quickFilters.showContacts 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                Contacts
              </button>
              <button
                onClick={() => setQuickFilters(prev => ({ ...prev, showTeamMembers: !prev.showTeamMembers }))}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  quickFilters.showTeamMembers 
                    ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                Team
              </button>
              <button
                onClick={() => setQuickFilters(prev => ({ ...prev, showActiveOnly: !prev.showActiveOnly }))}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  quickFilters.showActiveOnly 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                Active Only
              </button>
            </div>
          </div>
          
          {/* Recipients List */}
          <div className="flex-1 overflow-y-auto">
            {/* Contacts Section */}
            {quickFilters.showContacts && (
              <div>
                <div className="p-3 border-b bg-green-50">
                  <h4 className="text-sm font-semibold text-green-800 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Contacts ({filteredContacts.length})
                  </h4>
                </div>
                <div className="max-h-[40%] overflow-y-auto">
                  {filteredContacts.map(recipient => (
                    <div
                      key={`${recipient.type}-${recipient.id}`}
                      onClick={() => handleRecipientSelect(recipient)}
                      className={`p-3 border-b cursor-pointer transition-all duration-200 ${
                        selectedRecipient?.id === recipient.id && selectedRecipient?.type === recipient.type 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <EnhancedRecipientCard 
                        recipient={recipient} 
                        handleToggleDoNotContact={handleToggleDoNotContact} 
                        getRecipientTypeColor={getRecipientTypeColor} 
                        getRecipientTypeLabel={getRecipientTypeLabel}
                        handleContactNameClick={handleContactNameClick}
                      />
                    </div>
                  ))}
                  {filteredContacts.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      {searchTerm ? 'No contacts found' : 'No contacts available'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Team Members Section */}
            {quickFilters.showTeamMembers && (
              <div>
                <div className="p-3 border-b bg-purple-50">
                  <h4 className="text-sm font-semibold text-purple-800 flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Team Members ({filteredUsers.length})
                  </h4>
                </div>
                <div className="max-h-[40%] overflow-y-auto">
                  {loading && (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Loading team members...</p>
                    </div>
                  )}
                  
                  {!loading && !error && filteredUsers.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      {searchTerm ? 'No team members found' : 'No team members available'}
                    </div>
                  )}
                  
                  {filteredUsers.map(recipient => (
                    <div
                      key={`${recipient.type}-${recipient.id}`}
                      onClick={() => handleRecipientSelect(recipient)}
                      className={`p-3 border-b cursor-pointer transition-all duration-200 ${
                        selectedRecipient?.id === recipient.id && selectedRecipient?.type === recipient.type 
                          ? 'bg-purple-50 border-l-4 border-l-purple-500' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <EnhancedRecipientCard 
                        recipient={recipient} 
                        handleToggleDoNotContact={handleToggleDoNotContact} 
                        getRecipientTypeColor={getRecipientTypeColor} 
                        getRecipientTypeLabel={getRecipientTypeLabel}
                        handleContactNameClick={handleContactNameClick}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Message Area */}
        <div className="col-span-2 flex flex-col bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
          {selectedRecipient ? (
            <>
              {/* Enhanced Chat Header */}
              <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {selectedRecipient.name?.[0]}{selectedRecipient.name?.split(' ')[1]?.[0] || ''}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedRecipient.name}</h2>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500">{selectedRecipient.phone || selectedRecipient.contact_number || 'No phone'}</p>
                        {selectedRecipient.type === 'user' && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                            Team Member
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedRecipient.type === 'user' ? 'bg-purple-500' :
                      selectedRecipient.do_not_contact ? 'bg-red-500' :
                      selectedRecipient.phone ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-xs text-gray-600 font-medium">
                      {getRecipientTypeLabel(selectedRecipient)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Message History */}
              <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                {loadingMessages ? (
                  <div className="text-center py-8">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
                    <p className="text-gray-600 font-medium">Loading conversation...</p>
                  </div>
                ) : messageHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiMessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium mb-2">No messages yet</p>
                    <p className="text-gray-400 text-sm">
                      {selectedRecipient.type === 'user' 
                        ? 'Start a conversation with this team member' 
                        : 'Send your first message to this contact'}
                    </p>
                   
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
                    {messageHistory.map((msg, index) => {
                      // Use the processed direction from the message
                      const isOutgoing = msg.direction === 'outgoing';
                      
                      console.log(`📱 Rendering message ${index + 1}:`, {
                        id: msg.id,
                        content: msg.content?.substring(0, 20) + '...',
                        direction: msg.direction,
                        isOutgoing,
                        sender: msg.sender_phone,
                        recipient: msg.recipient_phone
                      });
                      
                      return (
                        <div
                          key={msg.id || index}
                          className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                            {!isOutgoing && (
                              <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mb-1 shadow-sm">
                                <span className="text-xs font-bold text-white">
                                  {selectedRecipient?.name?.[0] || 'U'}
                                </span>
                              </div>
                            )}
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-sm ${
                                isOutgoing
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className={`text-xs ${
                                  isOutgoing ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {formatMessageTime(msg.sent_at || msg.created_at)}
                                </p>
                                {isOutgoing && (
                                  <div className="flex items-center space-x-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      msg.status === 'delivered' ? 'bg-green-400' :
                                      msg.status === 'failed' ? 'bg-red-400' :
                                      msg.status === 'pending' ? 'bg-yellow-400 animate-pulse' :
                                      'bg-blue-400'
                                    }`}></div>
                                    <span className={`text-xs ${
                                      msg.status === 'delivered' ? 'text-green-300' :
                                      msg.status === 'failed' ? 'text-red-300' :
                                      msg.status === 'pending' ? 'text-yellow-300' :
                                      'text-blue-300'
                                    }`}>
                                      {msg.status === 'delivered' ? 'delivered' :
                                       msg.status === 'failed' ? 'failed' :
                                       msg.status === 'pending' ? 'pending' : 'sent'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {isOutgoing && (
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-1 shadow-sm">
                                <span className="text-xs font-bold text-white">
                                  {user?.first_name?.[0] || user?.email?.[0] || 'You'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Enhanced Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Type your message to ${selectedRecipient.name}...`}
                      className="w-full rounded-full border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all px-4 py-3 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sending}
                    />
                    <div className="flex items-center justify-between mt-2 px-2">
                      <div className="text-xs text-gray-500">
                        Press Enter to send • Shift+Enter for new line
                      </div>
                      <div className="text-xs text-gray-500">
                        {message.length}/160 chars
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={(selectedRecipient.type === 'contact' && selectedRecipient.do_not_contact) || !selectedRecipient.phone || sending || !message.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg font-semibold"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        <span className="text-sm">Sending...</span>
                      </>
                    ) : (
                      <>
                        <FiSend className="mr-2 w-4 h-4" />
                        <span className="text-sm">Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-blue-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FiMessageSquare className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Conversation</h3>
                <p className="text-gray-500 text-sm">Choose a contact or team member to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text Campaign Modal */}
      <TextCampaignModal
        isOpen={isTextCampaignModalOpen}
        onClose={() => setIsTextCampaignModalOpen(false)}
        preSelectedContacts={selectedRecipient ? [selectedRecipient] : []}
      />

      {/* Contact View Modal */}
      <FocusedViewModal
        isOpen={isContactViewModalOpen}
        onClose={() => {
          setIsContactViewModalOpen(false);
          setSelectedContactForView(null);
        }}
        contact={selectedContactForView}
        onNoteSaved={() => {
          // Refresh contact data if needed
          console.log('Note saved for contact');
        }}
        onActionItemSaved={() => {
          // Handle action item saved
          console.log('Action item saved for contact');
        }}
        onPhoneCallSaved={() => {
          // Handle phone call saved
          console.log('Phone call saved for contact');
        }}
        onMeetingScheduled={() => {
          // Handle meeting scheduled
          console.log('Meeting scheduled for contact');
        }}
      />
    </div>
  );
}

// Enhanced Recipient Card Component
const EnhancedRecipientCard = ({ recipient, handleToggleDoNotContact, getRecipientTypeColor, getRecipientTypeLabel, handleContactNameClick }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-start">
      <div className="flex items-center space-x-3 flex-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          recipient.type === 'user' 
            ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
            : 'bg-gradient-to-br from-green-500 to-blue-500'
        }`}>
          <span className="text-white font-bold text-xs">
            {recipient.name?.[0]}{recipient.name?.split(' ')[1]?.[0] || ''}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {recipient.type === 'contact' ? (
                <button
                  onClick={(e) => handleContactNameClick(recipient, e)}
                  className="text-sm font-semibold text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                >
                  {recipient.name}
                </button>
              ) : (
                <h3 className="text-sm font-semibold text-gray-900">{recipient.name}</h3>
              )}
              {recipient.type === 'user' && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                  Team
                </span>
              )}
            </div>
            
            {/* View Icon Button - Only for contacts */}
            {recipient.type === 'contact' && (
              <button
                onClick={(e) => handleContactNameClick(recipient, e)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="View contact details"
              >
                <FiEye className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">{recipient.phone || recipient.contact_number || 'No phone'}</p>
          {recipient.email && recipient.email !== 'No email' && (
            <p className="text-xs text-gray-400 truncate max-w-[150px]">{recipient.email}</p>
          )}
        </div>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRecipientTypeColor(recipient)}`}>
        {getRecipientTypeLabel(recipient)}
      </span>
    </div>
    
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span>
        Last: {recipient.lastContact ? new Date(recipient.lastContact).toLocaleDateString() : 'Never'}
      </span>
      
      {/* Enhanced Do Not Contact Toggle - Only for contacts */}
      {recipient.type === 'contact' && (
        <button
          onClick={(e) => { 
            e.stopPropagation();
            handleToggleDoNotContact(recipient);
          }}
          className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
            recipient.do_not_contact 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {recipient.do_not_contact ? (
            <>
              <FiToggleRight className="w-3 h-3" />
              <span>Opted Out</span>
            </>
          ) : (
            <>
              <FiToggleLeft className="w-3 h-3" />
              <span>Active</span>
            </>
          )}
        </button>
      )}
    </div>
  </div>
);

// Keep the old component for backward compatibility
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