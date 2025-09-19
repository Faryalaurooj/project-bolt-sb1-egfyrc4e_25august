import React, { useState, useEffect, useRef } from 'react';
import { FiMinus, FiX, FiSend, FiSmile, FiUser, FiPaperclip } from 'react-icons/fi';
import { getTextMessagesForUserConversation, createTextMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

function ChatWindow({ user, minimized, onMinimize, onClose, position = 0 }) {
  const { user: currentUser } = useAuth();
  const { showError, showSuccess } = useToast();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '✅', '❌', '⚡', '🚀', '💡', '📝', '📞', '📧', '💼', '🏆'];

  useEffect(() => {
    if (user && !minimized) {
      fetchMessages();
    }
  }, [user, minimized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const messagesData = await getTextMessagesForUserConversation(user.id);
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showError('Failed to load conversation');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachedFile) || sending) return;

    try {
      setSending(true);
      const messageData = {
        recipient_id: user.id,
        sender_phone: null,
        recipient_phone: null,
        content: newMessage || (attachedFile ? `📎 ${attachedFile.name}` : ''),
        direction: 'outgoing',
        status: 'sent',
        sent_at: new Date().toISOString(),
      };

      await createTextMessage(messageData, attachedFile);
      setNewMessage('');
      setAttachedFile(null);
      setShowEmojiPicker(false);
      await fetchMessages();
      showSuccess('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji);
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

  const getUserDisplayName = () => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Team Member';
  };

  const getUserInitials = () => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || 'T';
  };

  const rightOffset = 20 + position * 320;

  return (
    <div
      className={`fixed bottom-4 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col transition-all duration-300 z-40 ${
        minimized ? 'h-12 w-64' : 'h-96 w-80'
      }`}
      style={{ right: `${rightOffset}px` }}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg cursor-pointer">
        <div className="flex items-center space-x-3" onClick={onMinimize}>
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{getUserInitials()}</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">{getUserDisplayName()}</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-blue-100">Online</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={onMinimize}
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            <FiMinus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      {!minimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiUser className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No messages yet</p>
                <p className="text-gray-400 text-xs">Start a conversation with {getUserDisplayName()}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const isOwnMessage = message.sender_id === currentUser?.id;
                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex items-end space-x-2 max-w-xs">
                        {!isOwnMessage && (
                          <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mb-1 shadow-sm">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={getUserDisplayName()}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-xs">
                                {getUserInitials()}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col">
                          <div
                            className={`px-3 py-2 rounded-2xl shadow-sm ${
                              isOwnMessage
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>

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

                          <div
                            className={`text-xs mt-1 px-2 ${
                              isOwnMessage ? 'text-blue-600 text-right' : 'text-gray-500'
                            }`}
                          >
                            {formatMessageTime(message.sent_at || message.created_at)}
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
          <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
            {attachedFile && (
              <div className="mb-2 flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <FiPaperclip className="text-blue-600 w-4 h-4" />
                  <span className="text-sm text-blue-800 font-medium">{attachedFile.name}</span>
                  <span className="text-xs text-blue-600">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              {/* Emoji */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiSmile className="w-4 h-4" />
              </button>

              {/* File Upload */}
              <label
                className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Attach file"
              >
                <FiPaperclip className="w-4.5 h-4.5" />
                <input
                  type="file"
                  onChange={handleFileAttach}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.txt,.xlsx,.csv"
                />
              </label>

              {/* Input */}
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${getUserDisplayName()}...`}
                className="flex-1 rounded-full border border-gray-300 px-0.5 py-0.5 text-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending}
              />

              {/* Send */}
              <button
                onClick={handleSendMessage}
                disabled={(!newMessage.trim() && !attachedFile) || sending}
                className="p-0.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-md"
              >
                {sending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <FiSend className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-16 mb-2 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                <div className="grid grid-cols-10 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => addEmoji(emoji)}
                      className="p-0.5 hover:bg-gray-100 rounded text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ChatWindow;
