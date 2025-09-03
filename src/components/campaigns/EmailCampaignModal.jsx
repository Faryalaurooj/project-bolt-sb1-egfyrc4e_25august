import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSend, FiSave, FiEye, FiSettings, FiChevronDown, FiChevronUp, FiPaperclip, FiTrash2 } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getEmailTemplates, getEmailSignatures, getUsers } from '../../services/api';
import TemplateSelectModal from './TemplateSelectModal';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { sendOutlookEmail } from '../../services/outlookSync';


function EmailCampaignModal({ isOpen, onClose }) {
  const { showSuccess, showInfo, showWarning, showError } = useToast();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [sendFrom, setSendFrom] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Email compose fields
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [attachments, setAttachments] = useState([]);

  // UI state
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Template and signature state
  const [selectedSignatureId, setSelectedSignatureId] = useState('');
  const [templates, setTemplates] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isTemplateSelectModalOpen, setIsTemplateSelectModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const usersData = await getUsers();
        console.log('Fetched users data:', usersData);
        setUsers(usersData || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    } else {
      // Clear states when modal is closed
      clearAllStates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (users.length > 0 && user) {
      let userData = users.find(u => u.email === user.email);
      console.log("users",users);
      setSendFrom(userData?.outlook_email || userData?.email || user?.email || '');
      
    }
  }, [users, user]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [templatesData, signaturesData] = await Promise.all([
        getEmailTemplates(),
        getEmailSignatures()
      ]);
      setTemplates(templatesData || []);
      setSignatures(signaturesData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ]
  };

  const formats = [
    'font', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'link', 'image', 'color', 'background', 'align'
  ];

  const handleSendEmail = async () => {
    if (!to.trim()) {
      showWarning('⚠️ Please enter at least one recipient');
      return;
    }
    if (!subject.trim()) {
      showWarning('⚠️ Please enter a subject');
      return;
    }
    if (!content.trim()) {
      showWarning('⚠️ Please enter a message');
      return;
    }

    try {
      const emailData = {
        to: to.split(',').map((e) => e.trim()),
        cc: cc ? cc.split(',').map((e) => e.trim()) : [],
        bcc: bcc ? bcc.split(',').map((e) => e.trim()) : [],
        subject,
        body: content,
        isHtml: true,
        attachments: attachments
      };

      await sendOutlookEmail(sendFrom, emailData);
      showSuccess('📧 Email sent successfully!');
      
      // Clear all states after successful send
      clearAllStates();
      
      onClose();
    } catch (err) {
      console.error('Error sending email:', err);
      showError('❌ Failed to send email');
    }
  };

  // Function to clear all form states
  const clearAllStates = () => {
    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setContent('');
    setPriority('normal');
    setAttachments([]);
    setShowCc(false);
    setShowBcc(false);
    setShowAdvanced(false);
    setSelectedSignatureId('');
  };

  // User selection handlers
  const handleUserSelect = (field, selectedUser) => {
    console.log('handleUserSelect called with:', field, selectedUser);
    
    if (!selectedUser) {
      console.log('Invalid user:', selectedUser);
      return;
    }
    const selectedEmail = selectedUser.outlook_email || selectedUser.email;
    if (!selectedEmail) {
      console.log('Missing both outlook_email and email on user:', selectedUser);
      return;
    }
    
    const currentEmails = field === 'to' ? to : field === 'cc' ? cc : bcc;
    console.log('Current emails for field', field, ':', currentEmails);
    
    const emailList = currentEmails ? currentEmails.split(',').map(e => e.trim()).filter(e => e) : [];
    console.log('Parsed email list:', emailList);
    
    if (!emailList.includes(selectedEmail)) {
      const newEmailList = [...emailList, selectedEmail];
      const newValue = newEmailList.join(', ');
      console.log('New email value:', newValue);
      
      if (field === 'to') {
        console.log('Setting TO field to:', newValue);
        setTo(newValue);
      } else if (field === 'cc') {
        console.log('Setting CC field to:', newValue);
        setCc(newValue);
      } else if (field === 'bcc') {
        console.log('Setting BCC field to:', newValue);
        setBcc(newValue);
      }
    } else {
      console.log('Email already exists in list');
    }
  };

  const removeEmail = (field, emailToRemove) => {
    const currentEmails = field === 'to' ? to : field === 'cc' ? cc : bcc;
    const emailList = currentEmails.split(',').map(e => e.trim()).filter(e => e !== emailToRemove);
    const newValue = emailList.join(', ');
    
    if (field === 'to') setTo(newValue);
    else if (field === 'cc') setCc(newValue);
    else if (field === 'bcc') setBcc(newValue);
  };

  const handleUserDropdownChange = (field, event) => {
    const selectedUserId = event.target.value;
    console.log('Selected user ID (raw):', selectedUserId);
    console.log('Available users:', users);
    
    if (selectedUserId && selectedUserId !== '') {
      // Try to find user by ID (handle both string and number IDs)
      const selectedUser = users.find(u => u.id == selectedUserId || u.id === selectedUserId);
      console.log('Found selected user:', selectedUser);
      
      if (selectedUser) {
        console.log('Calling handleUserSelect with:', field, selectedUser);
        handleUserSelect(field, selectedUser);
      } else {
        console.log('No user found with ID:', selectedUserId);
      }
    }
    // Reset dropdown to default option
    event.target.value = '';
  };

  const handleTemplateSelect = (template) => {
    if (template) {
      setSubject(template.subject || '');
      setContent(template.content || '');
    }
  };

  // Attachment handlers
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024; // ~3MB per Graph API request limit

    const oversized = files.filter((f) => f.size > MAX_ATTACHMENT_BYTES);
    const allowed = files.filter((f) => f.size <= MAX_ATTACHMENT_BYTES);

    if (oversized.length > 0) {
      showWarning(`Some files exceed 3MB and were skipped: ${oversized.map(f => f.name).join(', ')}`);
    }

    const newAttachments = allowed.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    
    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments]);
      showSuccess(`📎 ${newAttachments.length} file(s) attached`);
    }
  };

  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    showInfo('📎 Attachment removed');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  

  const renderEmailField = (field, value, setter, placeholder, label) => {
    const emailList = value ? value.split(',').map(e => e.trim()).filter(e => e) : [];
    
    return (
      <div className="flex items-start space-x-3">
        <label className="w-16 text-sm font-medium text-gray-700 mt-2">{label}:</label>
        <div className="flex-1 space-y-3">
          {/* Email Input Field */}
          <input
            type="text"
            value={value}
            onChange={(e) => setter(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          
          {/* User Selection Dropdown */}
          <div className="flex items-center space-x-3">
            <select
              onChange={(e) => handleUserDropdownChange(field, e)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[200px]"
              disabled={usersLoading}
            >
              <option value="">👥 Select user to add...</option>
              {users.map(user => {
               
                return (
                  <option key={user.id} value={user.id}>
                    {user.outlook_email || user.email || 'No email available'}
                  </option>
                );
              })}
            </select>
            
            {usersLoading && (
              <span className="text-sm text-gray-500">Loading users...</span>
            )}
          </div>

          {/* Selected Emails Display */}
          {emailList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {emailList.map((email, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full border border-blue-200"
                >
                  <span className="mr-2">📧</span>
                  {email}
                  <button
                    onClick={() => removeEmail(field, email)}
                    className="ml-2 text-blue-600 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-blue-200"
                    title="Remove email"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-start justify-center p-2 sm:p-4 pt-4">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white w-full mx-2 sm:mx-4 rounded-lg shadow-2xl max-h-[95vh] overflow-hidden max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">New Message</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col h-full max-h-[calc(95vh-80px)]">
              <div className="flex-1 overflow-y-auto">
                {/* Fields */}
                <div className="p-4 space-y-3 border-b border-gray-200">
                <div className="flex items-center">
                  <label className="w-16 text-sm font-medium">From:</label>
                  <input value={sendFrom} readOnly className="flex-1 border-none text-sm bg-transparent" />
                </div>

                {renderEmailField('to', to, setTo, 'Enter multiple emails separated by commas', 'To')}

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowCc(!showCc)} 
                    className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                      showCc 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'text-blue-600 hover:bg-blue-50 border border-transparent'
                    }`}
                  >
                    Cc
                  </button>
                  <button 
                    onClick={() => setShowBcc(!showBcc)} 
                    className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                      showBcc 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'text-blue-600 hover:bg-blue-50 border border-transparent'
                    }`}
                  >
                    Bcc
                  </button>
                </div>

                {showCc && renderEmailField('cc', cc, setCc, 'Enter multiple emails separated by commas', 'Cc')}
                {showBcc && renderEmailField('bcc', bcc, setBcc, 'Enter multiple emails separated by commas', 'Bcc')}

                <div className="flex items-center">
                  <label className="w-16 text-sm font-medium">Subject:</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter subject"
                    className="flex-1 border-none text-sm bg-transparent font-medium"
                  />
                  <div className="flex items-center space-x-2 ml-2">
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="low">Low Priority</option>
                      <option value="normal">Normal</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="flex items-start">
                  <label className="w-16 text-sm font-medium text-gray-700 mt-2">Attach:</label>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm px-4 py-2 rounded-lg border border-blue-200 transition-colors">
                        <FiPaperclip className="inline mr-2" />
                        Choose Files
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-sm text-gray-500">
                        Max file size per attachment: 3MB (Graph API inline)
                      </span>
                    </div>
                    
                    {/* Attachments Display */}
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map(attachment => (
                          <div key={attachment.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              <FiPaperclip className="text-gray-500 w-4 h-4" />
                              <div>
                                <div className="text-sm font-medium">{attachment.name}</div>
                                <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeAttachment(attachment.id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                              title="Remove attachment"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor */}
                <div className="flex flex-col">
                  <ReactQuill
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    formats={formats}
                    className="min-h-[200px]"
                    placeholder="Type your message here..."
                  />
                </div>
              </div>
            </div>

              {/* Actions */}
              <div className="bg-gray-50 p-4 flex justify-between">
                <div className="flex space-x-2">
                  <button onClick={() => setIsPreviewModalOpen(true)} className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <FiEye className="inline mr-1" /> Preview
                  </button>
                  <button 
                    onClick={clearAllStates} 
                    className="text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Clear all fields"
                  >
                    <FiSettings className="inline mr-1" /> Clear
                  </button>
                </div>
                <button
                  onClick={handleSendEmail}
                  disabled={!to.trim() || !subject.trim() || !content.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  <FiSend className="inline mr-1" /> Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Preview Modal */}
      <Dialog
        open={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        className="fixed inset-0 z-[60] overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white w-full max-w-2xl mx-4 rounded-lg shadow-2xl">
            <div className="bg-blue-600 p-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">📧 Email Preview</h3>
                  <p className="text-blue-100 text-sm">Preview how your email will appear</p>
                </div>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                {/* Email Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-300">
                  <div className="space-y-2 text-sm">
                    <div><strong>From:</strong> {sendFrom}</div>
                    <div><strong>To:</strong> {to}</div>
                    {cc && <div><strong>Cc:</strong> {cc}</div>}
                    {bcc && <div><strong>Bcc:</strong> {bcc}</div>}
                    <div><strong>Subject:</strong> {subject}</div>
                    {priority !== 'normal' && (
                      <div><strong>Priority:</strong> <span className={priority === 'high' ? 'text-red-600' : 'text-blue-600'}>{priority.toUpperCase()}</span></div>
                    )}
                  </div>
                </div>

                                  {/* Attachments */}
                  {attachments.length > 0 && (
                    <div className="bg-gray-50 p-4 border-b border-gray-300">
                      <div className="text-sm font-medium text-gray-700 mb-2">Attachments:</div>
                      {attachments.map(attachment => (
                        <div key={attachment.id} className="flex items-center text-sm text-gray-600">
                          <FiPaperclip className="mr-2 w-4 h-4" />
                          {attachment.name} ({formatFileSize(attachment.size)})
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Email Body */}
                  <div className="p-4 bg-white">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  handleSendEmail();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FiSend className="inline mr-2 w-4 h-4" />
                Send Email
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

export default EmailCampaignModal;
