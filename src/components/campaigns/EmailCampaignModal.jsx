import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSend, FiUsers, FiMail, FiSearch, FiSettings, FiEye, FiCalendar, FiUser, FiTag, FiEdit2 } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { createEmailTemplate, updateEmailTemplate, sendEmailCampaign, searchContactsAndUsers } from '../../services/api';

function EmailCampaignModal({ 
  isOpen, 
  onClose, 
  mode, // 'send', 'edit', 'saveAs', 'create', 'preview'
  initialTemplateData = null,
  onTemplateSaved = () => { },
  preSelectedMedia = null
}) {
  const { user } = useAuth();
  const { showSuccess, showInfo, showError } = useToast();
  
  // Internal modal mode state to handle transitions between preview, edit, and send
  const [currentModalMode, setCurrentModalMode] = useState(mode);
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    content: '',
    recipients: [],
    sendTime: 'now',
    scheduledDate: '',
    scheduledTime: '',
    category: 'MY TEMPLATES'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [availableContacts, setAvailableContacts] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const popularTags = [
    { id: 'all', label: 'All Contacts', count: 150 },
    { id: 'prospect', label: 'Prospect', count: 45 },
    { id: 'personal-lines', label: 'Personal Lines', count: 89 },
    { id: 'client', label: 'Client', count: 67 },
    { id: 'personal', label: 'Personal', count: 23 }
  ];

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  // Initialize form data when modal opens or template data changes
  useEffect(() => {
    if (isOpen) {
      setCurrentModalMode(mode); // Reset to initial mode when modal opens
      if (initialTemplateData) {
        const baseContent = initialTemplateData.content || '';
        const userSignature = generateUserSignature();
        
        setFormData({
          title: mode === 'saveAs' ? `${initialTemplateData.title} (Copy)` : initialTemplateData.title || '',
          subject: initialTemplateData.subject || '',
          content: baseContent.includes('Sincerely,') ? baseContent : `${baseContent}\n\n${userSignature}`,
          recipients: [],
          sendTime: 'now',
          scheduledDate: '',
          scheduledTime: '',
          category: initialTemplateData.category || 'MY TEMPLATES'
        });
      } else {
        // Reset form for new template
        setFormData({
          title: '',
          subject: '',
          content: generateUserSignature(),
          recipients: [],
          sendTime: 'now',
          scheduledDate: '',
          scheduledTime: '',
          category: 'MY TEMPLATES'
        });
      }
      setErrors({});
      fetchContacts();
    }
  }, [isOpen, initialTemplateData, mode, user]);

  const generateUserSignature = () => {
    const userName = user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}` 
      : user?.email?.split('@')[0] || 'Team Member';

    return `<div style="font-family: sans-serif; font-size: 12px; color: #555; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
Sincerely,<br>
${userName}<br>
Customer Service Manager at Cusmano Agency<br>
Phone 203-394-6645 Fax 203-394-6646<br>
Web www.cusmanoagency.com<br>
Email alisha@cusmanoagency.com<br>
425 Kings Hwy E, Fairfield, CT 06825</div>`;
  };

  const fetchContacts = async () => {
    try {
      setContactsLoading(true);
      const contacts = await searchContactsAndUsers('');
      setAvailableContacts(contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setAvailableContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.find(t => t.id === tag.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleRecipientAdd = (contact) => {
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, contact]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if ((mode === 'edit' || mode === 'saveAs' || mode === 'create') && !formData.title.trim()) {
      newErrors.title = 'Template title is required';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (mode === 'send' && formData.recipients.length === 0 && selectedTags.length === 0) {
      newErrors.recipients = 'Please select recipients or tags';
    }

    if (formData.sendTime === 'scheduled') {
      if (!formData.scheduledDate) {
        newErrors.scheduledDate = 'Scheduled date is required';
      }
      if (!formData.scheduledTime) {
        newErrors.scheduledTime = 'Scheduled time is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Handle preview mode transitions
    if (currentModalMode === 'preview') {
      setCurrentModalMode('send');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      if (currentModalMode === 'send') {
        // Send email campaign
        await sendEmailCampaign({
          subject: formData.subject,
          content: formData.content,
          recipients: formData.recipients,
          tags: selectedTags,
          sendTime: formData.sendTime,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime
        });
        showSuccess('📧 Email campaign sent successfully!');
      } else if (currentModalMode === 'edit') {
        // Update existing template
        await updateEmailTemplate(initialTemplateData.id, {
          title: formData.title,
          subject: formData.subject,
          content: formData.content,
          category: formData.category
        });
        showSuccess('📝 Template updated successfully!');
        onTemplateSaved();
      } else if (currentModalMode === 'saveAs' || currentModalMode === 'create') {
        // Create new template
        await createEmailTemplate({
          title: formData.title,
          subject: formData.subject,
          content: formData.content,
          category: formData.category
        });
        showSuccess('💾 Template saved successfully!');
        onTemplateSaved();
      }
      
      onClose();
    } catch (error) {
      console.error('Error processing request:', error);
      const action = currentModalMode === 'send' ? 'send email campaign' : 
                    currentModalMode === 'edit' ? 'update template' : 'save template';
      showError(`Failed to ${action}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (currentModalMode) {
      case 'preview': return initialTemplateData?.title || 'Email Template Preview';
      case 'edit': return 'Edit Email Template';
      case 'saveAs': return 'Save Template As';
      case 'create': return 'Create New Template';
      default: return initialTemplateData?.title || 'Send Email Campaign';
    }
  };

  const getSubmitButtonText = () => {
    if (isLoading) {
      switch (currentModalMode) {
        case 'preview': return 'Loading...';
        case 'edit': return 'Updating...';
        case 'saveAs': 
        case 'create': return 'Saving...';
        default: return 'Sending...';
      }
    }
    
    switch (currentModalMode) {
      case 'preview': return 'Send Email';
      case 'edit': return 'Update Template';
      case 'saveAs': 
      case 'create': return 'Save Template';
      default: return mode === 'send' ? 'Next: Preview Recipients' : 'Send Campaign';
    }
  };

  const filteredContacts = availableContacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    const name = String(contact.name || '').toLowerCase();
    const email = String(contact.email || '').toLowerCase();
    return name.includes(searchLower) || email.includes(searchLower);
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FiMail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{getModalTitle()}</h2>
                <p className="text-blue-100 text-sm">
                  {currentModalMode === 'preview' ? 'Preview and customize your email template' :
                    currentModalMode === 'send' ? 'Compose and send your email campaign' :
                      currentModalMode === 'edit' ? 'Edit your email template' :
                        'Create a new email template'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {(currentModalMode === 'preview' || currentModalMode === 'edit') && (
                <button onClick={() => setCurrentModalMode('saveAs')} className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                  <FiSave className="mr-2 w-4 h-4" />
                  <span className="text-sm">Save As</span>
                </button>
              )}
              {(currentModalMode === 'send' || currentModalMode === 'preview') && (
                <button
                  onClick={() => showInfo('📧 AI assistant feature coming soon!')}
                  className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <span className="mr-2">🤖</span>
                  <span className="text-sm">Write email with our AI assistant</span>
                </button>
              )}
              {currentModalMode === 'preview' && (
                <button
                  onClick={() => setCurrentModalMode('edit')}
                  className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <FiEdit2 className="mr-2 w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex h-[80vh]">
            {/* Left Column - Email Composition */}
            <div className="flex-1 p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Send From Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send from:
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user?.first_name && user?.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : user?.email?.split('@')[0] || 'Team Member'}
                      </div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                </div>

                {/* Template Title - Show for template operations */}
                {(currentModalMode === 'edit' || currentModalMode === 'saveAs' || currentModalMode === 'create') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter template title..."
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>
                )}

                {/* Template Category - Show for template operations */}
                {(currentModalMode === 'edit' || currentModalMode === 'saveAs' || currentModalMode === 'create') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="MY TEMPLATES">My Templates</option>
                      <option value="KEEP-IN-TOUCH">Keep-in-Touch</option>
                    </select>
                  </div>
                )}

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email subject..."
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20 transition-all duration-200">
                    <ReactQuill
                      value={formData.content}
                      onChange={(value) => handleInputChange('content', value)}
                      readOnly={currentModalMode === 'preview'}
                      modules={modules}
                      className="h-64"
                      placeholder="Enter your email content here..."
                    />
                  </div>
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                  )}
                </div>

                {/* Send Time - Only show for send mode */}
                {currentModalMode === 'send' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Send Time
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="sendTime"
                          value="now"
                          checked={formData.sendTime === 'now'}
                          onChange={(e) => handleInputChange('sendTime', e.target.value)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        Send Now
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="sendTime"
                          value="scheduled"
                          checked={formData.sendTime === 'scheduled'}
                          onChange={(e) => handleInputChange('sendTime', e.target.value)}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        Schedule for Later
                      </label>
                    </div>

                    {formData.sendTime === 'scheduled' && (
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={formData.scheduledDate}
                            onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {errors.scheduledDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time
                          </label>
                          <input
                            type="time"
                            value={formData.scheduledTime}
                            onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {errors.scheduledTime && (
                            <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
 
                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-3 font-bold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center ${
                      currentModalMode === 'send' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        {currentModalMode === 'edit' ? 'Updating...' : currentModalMode === 'send' ? 'Sending...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        {currentModalMode === 'send' ? <FiEye className="mr-2" /> : <FiSettings className="mr-2" />}
                        {getSubmitButtonText()}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column - Recipients Selection (Only for send mode) */}
            {currentModalMode === 'send' && (
              <div className="w-96 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Select Recipients to Send:</h3>
                    <button
                      onClick={() => showInfo('📧 Send test functionality coming soon!')}
                      className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <FiSend className="mr-1 w-3 h-3" />
                      Send a Test
                    </button>
                  </div>

                  {/* Search Recipients */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-400 w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search tags or contacts"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-3"
                    />
                  </div>

                  {/* Popular Tags */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Popular Tags</h4>
                    <div className="space-y-2">
                      {popularTags.map(tag => (
                        <label
                          key={tag.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedTags.find(t => t.id === tag.id) !== undefined}
                              onChange={() => handleTagToggle(tag)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-900">{tag.label}</span>
                              <div className="text-xs text-gray-500">{tag.count} contacts</div>
                            </div>
                          </div>
                          <FiTag className="w-4 h-4 text-gray-400" />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Selected Recipients */}
                  {(formData.recipients.length > 0 || selectedTags.length > 0) && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Selected ({formData.recipients.length + selectedTags.length})
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedTags.map(tag => (
                          <div key={tag.id} className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FiTag className="w-3 h-3 text-blue-600" />
                              <span className="text-sm text-blue-800 font-medium">{tag.label}</span>
                              <span className="text-xs text-blue-600">({tag.count})</span>
                            </div>
                            <button
                              onClick={() => handleTagToggle(tag)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {formData.recipients.map(recipient => (
                          <div key={recipient.id} className="flex items-center justify-between bg-green-50 p-2 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FiUser className="w-3 h-3 text-green-600" />
                              <span className="text-sm text-green-800 font-medium">{recipient.name}</span>
                            </div>
                            <button
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                recipients: prev.recipients.filter(r => r.id !== recipient.id)
                              }))}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contacts Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Contacts</h4>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                      <FiUsers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        You can use the search to add individual contacts to your campaign.
                      </p>
                      {contactsLoading ? (
                        <div className="text-xs text-blue-600">Loading contacts...</div>
                      ) : (
                        <div className="text-xs text-gray-500">
                          {availableContacts.length} contacts available
                        </div>
                      )}
                    </div>
                  </div>

                  {errors.recipients && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {errors.recipients}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default EmailCampaignModal;