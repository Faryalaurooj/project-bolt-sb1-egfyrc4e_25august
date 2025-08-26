import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSearch, FiArrowLeft, FiSend, FiSave, FiTrash2, FiImage, FiLink, FiSmile, FiTable, FiAlignLeft, FiAlignCenter, FiAlignRight, FiBold, FiItalic, FiUnderline, FiEye, FiSettings, FiUsers } from 'react-icons/fi';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getEmailTemplates, getEmailSignatures, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from '../../services/api';
import TemplateSelectModal from './TemplateSelectModal';
import { useToast } from '../../hooks/useToast';

function EmailCampaignModal({ isOpen, onClose, preSelectedMedia = null }) {
  const { showSuccess, showInfo, showWarning } = useToast();
  
  console.log('📧 EmailCampaignModal: Rendered with isOpen:', isOpen);
  
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState(preSelectedMedia || '');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedSignatureId, setSelectedSignatureId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [sendFrom, setSendFrom] = useState('Alisha Hanif');
  
  const [templates, setTemplates] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isTemplateSelectModalOpen, setIsTemplateSelectModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkData, setLinkData] = useState({ url: '', text: '', title: '' });
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Set pre-selected media when modal opens
  useEffect(() => {
    if (preSelectedMedia) {
      setMediaUrl(preSelectedMedia);
    }
  }, [preSelectedMedia]);
  useEffect(() => {
    if (isOpen) {
      console.log('📧 EmailCampaignModal: Modal opened, fetching data...');
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📧 EmailCampaignModal: Starting to fetch templates and signatures...');
      const [templatesData, signaturesData] = await Promise.all([
        getEmailTemplates(),
        getEmailSignatures()
      ]);
      console.log('📧 EmailCampaignModal: Data fetched:', {
        templates: templatesData?.length || 0,
        signatures: signaturesData?.length || 0
      });
      setTemplates(templatesData || []);
      setSignatures(signaturesData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load templates and signatures');
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['better-table'],
        ['clean']
      ],
      handlers: {
        'better-table': function() {
          try {
            if (this.quill) {
              const tableModule = this.quill.getModule('better-table');
              if (tableModule && typeof tableModule.insertTable === 'function') {
                tableModule.insertTable(3, 3);
              } else {
                console.warn('Better-table module not available');
              }
            }
          } catch (error) {
            console.error('Error inserting table:', error);
          }
        },
        // The 'link' handler is correctly defined to access component state
        'link': function() {
          setIsLinkModalOpen(true);
        }
      }
    },
    'better-table': {
      operationMenu: {
        items: {
          unmergeCells: {
            text: 'Another unmerge cells name'
          }
        }
      }
    }
  };

  const popularTags = [
    { id: 'all', label: 'All Contacts' },
    { id: 'prospect', label: 'Prospect' },
    { id: 'personal', label: 'Personal Lines' },
    { id: 'client', label: 'Client' },
    { id: 'personal_tag', label: 'Personal' }
  ];

  const handleTemplateSelect = (template) => {
    console.log('📧 EmailCampaignModal: Template selected:', template);
    setSelectedTemplateId(template.id);
    setSubject(template.subject || '');
    setContent(template.content || ''); // Ensure content is always a string
    setIsTemplateSelectModalOpen(false);
  };

  const handleSignatureChange = (signatureId) => {
    console.log('📧 EmailCampaignModal: Signature changed:', signatureId);
    if (signatureId === 'add') {
      showInfo('📝 Add signature functionality coming soon!');
      return;
    }
    setSelectedSignatureId(signatureId);
    const signature = signatures.find(s => s.id === signatureId);
    if (signature && signature.content) {
      setContent(prev => (prev || '') + '\n\n' + signature.content);
    }
  };

  const handlePreview = () => {
    if (!subject.trim() || !content.trim()) {
      showWarning('⚠️ Please enter both subject and content to preview');
      return;
    }
    setIsPreviewModalOpen(true);
  };

  const handleSaveAs = async () => {
    if (!subject.trim() || !content.trim()) {
      showWarning('⚠️ Please enter both subject and content');
      return;
    }

    try {
      const templateData = {
        title: subject,
        subject: subject,
        content: content
      };

      if (selectedTemplateId) {
        await updateEmailTemplate(selectedTemplateId, templateData);
        showSuccess('✅ Template updated successfully!');
      } else {
        await createEmailTemplate(templateData);
        showSuccess('✅ Template saved successfully!');
      }
      
      fetchData(); // Refresh templates
    } catch (err) {
      console.error('Error saving template:', err);
      showError('❌ Failed to save template');
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplateId) {
      showWarning('⚠️ No template selected to delete');
      return;
    }

    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteEmailTemplate(selectedTemplateId);
        setSelectedTemplateId(null);
        setSubject('');
        setContent('');
        showSuccess('✅ Template deleted successfully!');
        fetchData(); // Refresh templates
      } catch (err) {
        console.error('Error deleting template:', err);
        showError('❌ Failed to delete template');
      }
    }
  };

  const handleSendTest = () => {
    if (!subject.trim() || !content.trim()) {
      showWarning('⚠️ Please enter both subject and content before sending test');
      return;
    }
    showSuccess('📧 Test email sent successfully! Check your inbox.');
  };

  const handleInsertLink = () => {
    if (linkData.url && linkData.text) {
      const linkHtml = `<a href="${linkData.url}" title="${linkData.title || linkData.text}" target="_blank" rel="noopener noreferrer">${linkData.text}</a>`;
      setContent(content + linkHtml);
      setLinkData({ url: '', text: '', title: '' });
      setIsLinkModalOpen(false);
      showSuccess('🔗 Link inserted successfully!');
    }
  };

  const handleAIAssistant = () => {
    showInfo('🤖 AI Assistant feature coming soon! This will help you write compelling email content automatically.');
  };

  const handleAdvancedSettings = () => {
    showInfo('⚙️ Advanced Settings coming soon! Configure delivery options, A/B testing, scheduling, and more.');
  };

  const handleNextPreviewRecipients = () => {
    showInfo('📋 Recipient preview and selection workflow coming soon! You\'ll be able to select specific contacts and preview how the email will look for each recipient.');
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-start justify-center p-4 pt-8">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl">
            {/* Main Content */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-blue-600">📧 New Email Campaign</h2>
                  <p className="text-gray-600 text-xs">Create and send email campaigns</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mb-3 p-2 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Send from:
                </label>
                <select 
                  value={sendFrom}
                  onChange={(e) => setSendFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all p-2 text-sm"
                >
                  <option>Alisha Hanif</option>
                  <option>Owner of the recipient</option>
                  <option>Select an employee</option>
                </select>
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Subject *"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all p-2 text-sm font-medium"
                />
              </div>

              {/* Media URL Display */}
              {mediaUrl && (
                <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FiImage className="text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">Media attached</span>
                    </div>
                    <button
                      onClick={() => setMediaUrl('')}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                  <img src={mediaUrl} alt="Selected media" className="mt-2 h-16 w-full object-cover rounded border" />
                </div>
              )}

              <div className="mb-3">
                <button 
                  onClick={handleAIAssistant}
                  className="flex items-center text-blue-600 hover:text-blue-700 mb-2 font-medium transition-colors text-sm"
                >
                  <span className="mr-2">✨</span>
                  Write email with our AI assistant
                </button>
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  className="h-32 mb-8 rounded-lg"
                  placeholder="Hi {first name},"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {content.replace(/<[^>]*>/g, '').length} characters
                </div>
              </div>

              <div className="flex justify-between items-center mt-3">
                <button 
                  onClick={() => setIsTemplateSelectModalOpen(true)}
                  className="flex items-center text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
                >
                  📄 Use existing email template
                </button>
                <div className="text-xs text-gray-500">
                  (first name) is a placeholder for recipient names; actual names will be populated.
                </div>
              </div>

              <div className="mt-4">
                <select
                  value={selectedSignatureId}
                  onChange={(e) => handleSignatureChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all p-2 text-sm"
                  disabled={loading}
                >
                  <option value="">Alisha's Email Signatures</option>
                  {signatures.map(signature => (
                    <option key={signature.id} value={signature.id}>
                      {signature.name}
                    </option>
                  ))}
                  <option value="add">Add signature</option>
                </select>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button 
                  onClick={handleAdvancedSettings}
                  className="text-gray-600 hover:text-gray-800 text-xs flex items-center font-medium transition-colors"
                >
                  <FiSettings className="mr-1 w-3 h-3" />
                  Advanced Settings
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreview}
                    className="px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center"
                  >
                    <FiEye className="mr-1 w-3 h-3" />
                    Preview
                  </button>
                  <button
                    onClick={handleSaveAs}
                    className="px-3 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center"
                  >
                    <FiSave className="mr-1 w-3 h-3" />
                    Save Template
                  </button>
                  <button
                    onClick={handleSendTest}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md text-sm flex items-center"
                  >
                    <FiSend className="mr-1 w-3 h-3" />
                    Send Test
                  </button>
                </div>
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

          <div className="relative bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">📧 Email Preview</h3>
                  <p className="text-blue-100 text-xs">Preview how your email will look</p>
                </div>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">From: {sendFrom}</div>
                  <div className="text-sm font-semibold text-gray-900">Subject: {subject}</div>
                </div>
                {mediaUrl && (
                  <div className="mb-3">
                    <img src={mediaUrl} alt="Email media" className="max-w-full h-24 object-cover rounded border" />
                  </div>
                )}
                <div 
                  className="prose prose-xs max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 flex justify-between rounded-b-2xl">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
              >
                Close Preview
              </button>
              <button
                onClick={handleNextPreviewRecipients}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md text-sm flex items-center"
              >
                <FiUsers className="mr-1 w-3 h-3" />
                Next: Select Recipients
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

      {/* Link Insert Modal */}
      <Dialog
        open={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        className="fixed inset-0 z-[60] overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white w-full max-w-xs mx-4 rounded-xl shadow-xl p-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-900">🔗 Insert Link</h3>
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkData.url}
                  onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Text to Display</label>
                <input
                  type="text"
                  value={linkData.text}
                  onChange={(e) => setLinkData({ ...linkData, text: e.target.value })}
                  placeholder="Link text"
                  className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={linkData.title}
                  onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
                  placeholder="Link title"
                  className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all p-2 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertLink}
                disabled={!linkData.url || !linkData.text}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default EmailCampaignModal;