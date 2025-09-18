import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiSend, FiSearch, FiUser, FiEdit2, FiTrash2, FiSmile, FiMoreVertical, FiCheck, FiX, FiPaperclip } from 'react-icons/fi';
import { getUsers, createTextMessage, getTextMessagesForUserConversation, updateTextMessage, deleteTextMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { useSound } from '../hooks/useSound';

function InternalChat() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { isMuted, playMessageSound, toggleMute } = useSound();
  const messagesEndRef = useRef(null);
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '✅', '❌', '⚡', '🚀', '💡', '📝', '📞', '📧', '💼', '🏆'];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
    
    // Play sound for new messages (but not on initial load)
    if (messages.length > previousMessageCount && previousMessageCount > 0) {
      const newMessages = messages.slice(previousMessageCount);
      const hasNewIncomingMessages = newMessages.some(msg => msg.sender_id !== user?.id);
      if (hasNewIncomingMessages) {
        playMessageSound();
      }
    }
    setPreviousMessageCount(messages.length);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('💬 InternalChat: Fetching team members...');
      const usersData = await getUsers();
      console.log('💬 InternalChat: Raw users data from getUsers():', usersData);
      console.log('💬 InternalChat: Users fetched:', usersData?.length || 0);
      
      // Filter out current user
      const filteredUsers = (usersData || []).filter(teamUser => teamUser.id !== user?.id);
      setUsers(filteredUsers);
      console.log('💬 InternalChat: Filtered users (excluding current user):', filteredUsers.length);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.log('💬 InternalChat: Error details:', error.message);
      showError('Failed to load team members');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedUser?.id) return;
    
    try {
      setMessagesLoading(true);
      console.log('💬 InternalChat: Calling getTextMessagesForUserConversation for user:', selectedUser.id);
      console.log('💬 InternalChat: Calling getTextMessagesForUserConversation for user:', selectedUser.id);
      console.log('💬 InternalChat: Fetching messages for user:', selectedUser.id);
      const messagesData = await getTextMessagesForUserConversation(selectedUser.id); // Fetch messages
      console.log('💬 InternalChat: Messages fetched:', messagesData?.length || 0);
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showError('Failed to load conversation');
      setMessages([]);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || sending) return;


    try {
      setSending(true);
      console.log('💬 InternalChat: Sending message to:', selectedUser.id);

      const messageData = {
        recipient_id: selectedUser.id,
        sender_phone: null, // Internal messages don't need phone numbers
        recipient_phone: null, // Internal messages don't need phone numbers
        content: newMessage,
        direction: 'outgoing',
        status: 'sent',
        sent_at: new Date().toISOString()
      };

      console.log('💬 InternalChat: Message data:', messageData);
      await createTextMessage(messageData, attachedFile);
      setNewMessage('');
      setAttachedFile(null);
      setShowEmojiPicker(false);
      await fetchMessages(); // Refresh messages
      showSuccess('Message sent!');
    } catch (error) {
      console.log('💬 InternalChat: Error sending message details:', error.message);
      console.error('Error sending message:', error);
      showError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editContent.trim()) return;

    try {
      await updateTextMessage(messageId, { content: editContent });
      setEditingMessage(null);
      setEditContent('');
      console.log('💬 InternalChat: Message updated successfully.');
      await fetchMessages();
      showSuccess('Message updated!');
    } catch (error) {
      console.error('Error updating message:', error);
      showError('Failed to update message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteTextMessage(messageId);
        console.log('💬 InternalChat: Message deleted successfully.');
        await fetchMessages();
        showSuccess('Message deleted!');
      } catch (error) {
        console.error('Error deleting message:', error);
        showError('Failed to delete message');
      }
    }
  };

  const startEditing = (message) => {
    setEditingMessage(message.id);
    setEditContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
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

  const filteredUsers = users.filter(teamUser => {
    if (!teamUser) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const firstName = String(teamUser.first_name || '').toLowerCase();
    const lastName = String(teamUser.last_name || '').toLowerCase();
    const fullName = (firstName + ' ' + lastName).trim();
    const email = String(teamUser.email || '');
    const contactNumber = String(teamUser.contact_number || '').toLowerCase();

    console.log('💬 InternalChat: Filtering user:', {
      id: teamUser.id,
      fullName,
      email,
      contactNumber,
      searchTerm: searchLower,
      matches: fullName.includes(searchLower) || email.toLowerCase().includes(searchLower) || contactNumber.includes(searchLower)
    });

    return fullName.includes(searchLower) || 
           email.toLowerCase().includes(searchLower) || 
           contactNumber.includes(searchLower);
  });

  const getUserDisplayName = (teamUser) => {
    return `${teamUser.first_name || ''} ${teamUser.last_name || ''}`.trim() || 
           teamUser.email?.split('@')[0] || 
           'Team Member';
  };

  const getUserInitials = (teamUser) => {
    const firstName = teamUser.first_name || '';
    const lastName = teamUser.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return teamUser.email?.[0]?.toUpperCase() || 'T';
  };

  return (
    <div className="h-[calc(100vh-120px)] flex bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Users Sidebar */}
      <div className="w-80 bg-gradient-to-b from-blue-50 to-purple-50 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FiMessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Team Chat</h2>
              <p className="text-blue-100 text-sm">Internal messaging</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-white opacity-70 w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 transition-all p-2 text-sm"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading team members...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-2">
              {filteredUsers.map(teamUser => (
                <div
                  key={teamUser.id}
                  onClick={() => setSelectedUser(teamUser)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedUser?.id === teamUser.id
                      ? 'bg-white shadow-md border-2 border-blue-300'
                      : 'hover:bg-white hover:bg-opacity-50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        {teamUser.avatar_url ? (
                          <img
                            src={teamUser.avatar_url}
                            alt={getUserDisplayName(teamUser)}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {getUserInitials(teamUser)}
                          </span>
                        )}
                      </div>
                      {/* Online status indicator */}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {getUserDisplayName(teamUser)}
                      </h3>
                      <p className="text-xs text-gray-500">{teamUser.email}</p>
                      {teamUser.contact_number && (
                        <p className="text-xs text-gray-400">{teamUser.contact_number}</p>
                      )}
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">Online</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiUser className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">
                {searchTerm ? 'No team members found' : 'No team members available'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold">
                      {getUserInitials(selectedUser)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {getUserDisplayName(selectedUser)}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Online</span>
                      <span className="text-sm text-gray-500">• {selectedUser.email}</span>
                      {selectedUser.contact_number && (
                        <span className="text-sm text-gray-500">• {selectedUser.contact_number}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiMoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
              {messagesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading conversation...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No messages yet</h3>
                  <p className="text-gray-500">Start a conversation with {getUserDisplayName(selectedUser)}</p>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender_id === user?.id;
                    const isEditing = editingMessage === message.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-end space-x-2 max-w-xs lg:max-w-md group">
                          {!isOwnMessage && (
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mb-1 shadow-sm">
                              <span className="text-white font-bold text-xs">
                                {getUserInitials(selectedUser)}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex flex-col">
                            {/* Sender name */}
                            {!isOwnMessage && (
                              <div className="text-xs text-gray-500 mb-1 px-2">
                                {message.sender_first_name && message.sender_last_name 
                                  ? `${message.sender_first_name} ${message.sender_last_name}`
                                  : getUserDisplayName(selectedUser)
                                }
                              </div>
                            )}
                            
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-sm relative ${
                                isOwnMessage
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                              }`}
                            >
                              {isEditing ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-2 text-sm bg-white text-gray-900 border border-gray-300 rounded-md resize-none"
                                    rows={2}
                                    autoFocus
                                  />
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditMessage(message.id)}
                                      className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                    >
                                      <FiCheck className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={cancelEditing}
                                      className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                    >
                                      <FiX className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm leading-relaxed">{message.content}</p>
                                  
                                  {/* File attachment display */}
                                  {message.media_url && (
                                    <div className="mt-2">
                                      {message.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                        <img
                                          src={message.media_url}
                                          alt="Attachment"
                                          className="max-w-full h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                          onClick={() => window.open(message.media_url, '_blank')}
                                        />
                                      ) : (
                                        <a
                                          href={message.media_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`inline-flex items-center px-3 py-2 rounded-lg border transition-colors ${
                                            isOwnMessage 
                                              ? 'bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30' 
                                              : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                                          }`}
                                        >
                                          <FiPaperclip className="w-3 h-3 mr-2" />
                                          <span className="text-xs">View Attachment</span>
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Message Actions */}
                              {isOwnMessage && !isEditing && (
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => startEditing(message)}
                                      className="p-1 text-white hover:text-blue-200 rounded"
                                      title="Edit message"
                                    >
                                      <FiEdit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMessage(message.id)}
                                      className="p-1 text-white hover:text-red-200 rounded"
                                      title="Delete message"
                                    >
                                      <FiTrash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Timestamp and Status */}
                            <div className={`flex items-center justify-between mt-1 px-2 ${
                              isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                            }`}>
                              <span className={`text-xs ${
                                isOwnMessage ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                                {formatMessageTime(message.sent_at || message.created_at)}
                              </span>
                              {isOwnMessage && (
                                <div className="flex items-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${
                                    message.status === 'sent' ? 'bg-blue-500' :
                                    message.status === 'delivered' ? 'bg-green-500' :
                                    message.status === 'failed' ? 'bg-red-500' :
                                    'bg-gray-400'
                                  }`}></div>
                                  <span className="text-xs text-gray-500 capitalize">
                                    {message.status || 'sent'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Add emoji"
                    >
                      <FiSmile className="w-5 h-5" />
                    </button>
                    <label className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Attach file">
                      <FiPaperclip className="w-5 h-5" />
                      <input
                        type="file"
                        onChange={handleFileAttach}
                        className="hidden"
                        accept="image/*,application/pdf,.doc,.docx,.txt,.xlsx,.csv"
                      />
                    </label>
                    <span className="text-xs text-gray-500">
                      Messaging {getUserDisplayName(selectedUser)}
                    </span>
                  </div>
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                      <div className="grid grid-cols-10 gap-1">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => addEmoji(emoji)}
                            className="p-1 hover:bg-gray-100 rounded text-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
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
                  
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${getUserDisplayName(selectedUser)}...`}
                    className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-3 resize-none"
                    rows={2}
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
                      {newMessage.length}/500 chars
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !attachedFile) || sending}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg font-semibold flex items-center"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      <span className="text-sm">Sending...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4 mr-2" />
                      <span className="text-sm">Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FiMessageSquare className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Team Member</h3>
              <p className="text-gray-500">Choose someone from your team to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InternalChat;