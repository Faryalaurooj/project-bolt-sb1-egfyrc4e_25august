// import React, { useState, useEffect } from 'react';
// import { Dialog } from '@headlessui/react';
// import { FiX, FiSearch, FiArrowLeft, FiSend, FiSave, FiTrash2, FiImage, FiLink, FiSmile, FiTable, FiAlignLeft, FiAlignCenter, FiAlignRight, FiBold, FiItalic, FiUnderline, FiEye, FiSettings, FiUsers } from 'react-icons/fi';
// import ReactQuill, { Quill } from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
// import { getEmailTemplates, getEmailSignatures, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from '../../services/api';
// import TemplateSelectModal from './TemplateSelectModal';
// import { useToast } from '../../hooks/useToast';

// function EmailCampaignModal({ isOpen, onClose, preSelectedMedia = null }) {
//   const { showSuccess, showInfo, showWarning } = useToast();
  
//   console.log('📧 EmailCampaignModal: Rendered with isOpen:', isOpen);
  
//   const [subject, setSubject] = useState('');
//   const [content, setContent] = useState('');
//   const [mediaUrl, setMediaUrl] = useState(preSelectedMedia || '');
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [selectedSignatureId, setSelectedSignatureId] = useState('');
//   const [selectedTemplateId, setSelectedTemplateId] = useState(null);
//   const [sendFrom, setSendFrom] = useState('Alisha Hanif');
  
//   const [templates, setTemplates] = useState([]);
//   const [signatures, setSignatures] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   const [isTemplateSelectModalOpen, setIsTemplateSelectModalOpen] = useState(false);
//   const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
//   const [linkData, setLinkData] = useState({ url: '', text: '', title: '' });
//   const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

//   // Set pre-selected media when modal opens
//   useEffect(() => {
//     if (preSelectedMedia) {
//       setMediaUrl(preSelectedMedia);
//     }
//   }, [preSelectedMedia]);
//   useEffect(() => {
//     if (isOpen) {
//       console.log('📧 EmailCampaignModal: Modal opened, fetching data...');
//       fetchData();
//     }
//   }, [isOpen]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       console.log('📧 EmailCampaignModal: Starting to fetch templates and signatures...');
//       const [templatesData, signaturesData] = await Promise.all([
//         getEmailTemplates(),
//         getEmailSignatures()
//       ]);
//       console.log('📧 EmailCampaignModal: Data fetched:', {
//         templates: templatesData?.length || 0,
//         signatures: signaturesData?.length || 0
//       });
//       setTemplates(templatesData || []);
//       setSignatures(signaturesData || []);
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError('Failed to load templates and signatures');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const modules = {
//     toolbar: {
//       container: [
//         [{ 'header': [1, 2, 3, false] }],
//         ['bold', 'italic', 'underline', 'strike'],
//         [{ 'color': [] }, { 'background': [] }],
//         [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
//         [{ 'align': [] }],
//         [{ 'list': 'ordered'}, { 'list': 'bullet' }],
//         ['blockquote', 'code-block'],
//         ['link', 'image', 'video'],
//         ['better-table'],
//         ['clean']
//       ],
//       handlers: {
//         'better-table': function() {
//           try {
//             if (this.quill) {
//               const tableModule = this.quill.getModule('better-table');
//               if (tableModule && typeof tableModule.insertTable === 'function') {
//                 tableModule.insertTable(3, 3);
//               } else {
//                 console.warn('Better-table module not available');
//               }
//             }
//           } catch (error) {
//             console.error('Error inserting table:', error);
//           }
//         },
//         // The 'link' handler is correctly defined to access component state
//         'link': function() {
//           setIsLinkModalOpen(true);
//         }
//       }
//     },
//     'better-table': {
//       operationMenu: {
//         items: {
//           unmergeCells: {
//             text: 'Another unmerge cells name'
//           }
//         }
//       }
//     }
//   };

//   const popularTags = [
//     { id: 'all', label: 'All Contacts' },
//     { id: 'prospect', label: 'Prospect' },
//     { id: 'personal', label: 'Personal Lines' },
//     { id: 'client', label: 'Client' },
//     { id: 'personal_tag', label: 'Personal' }
//   ];

//   const handleTemplateSelect = (template) => {
//     console.log('📧 EmailCampaignModal: Template selected:', template);
//     setSelectedTemplateId(template.id);
//     setSubject(template.subject || '');
//     setContent(template.content || ''); // Ensure content is always a string
//     setIsTemplateSelectModalOpen(false);
//   };

//   const handleSignatureChange = (signatureId) => {
//     console.log('📧 EmailCampaignModal: Signature changed:', signatureId);
//     if (signatureId === 'add') {
//       showInfo('📝 Add signature functionality coming soon!');
//       return;
//     }
//     setSelectedSignatureId(signatureId);
//     const signature = signatures.find(s => s.id === signatureId);
//     if (signature && signature.content) {
//       setContent(prev => (prev || '') + '\n\n' + signature.content);
//     }
//   };

//   const handlePreview = () => {
//     if (!subject.trim() || !content.trim()) {
//       showWarning('⚠️ Please enter both subject and content to preview');
//       return;
//     }
//     setIsPreviewModalOpen(true);
//   };

//   const handleSaveAs = async () => {
//     if (!subject.trim() || !content.trim()) {
//       showWarning('⚠️ Please enter both subject and content');
//       return;
//     }

//     try {
//       const templateData = {
//         title: subject,
//         subject: subject,
//         content: content
//       };

//       if (selectedTemplateId) {
//         await updateEmailTemplate(selectedTemplateId, templateData);
//         showSuccess('✅ Template updated successfully!');
//       } else {
//         await createEmailTemplate(templateData);
//         showSuccess('✅ Template saved successfully!');
//       }
      
//       fetchData(); // Refresh templates
//     } catch (err) {
//       console.error('Error saving template:', err);
//       showError('❌ Failed to save template');
//     }
//   };

//   const handleDelete = async () => {
//     if (!selectedTemplateId) {
//       showWarning('⚠️ No template selected to delete');
//       return;
//     }

//     if (window.confirm('Are you sure you want to delete this template?')) {
//       try {
//         await deleteEmailTemplate(selectedTemplateId);
//         setSelectedTemplateId(null);
//         setSubject('');
//         setContent('');
//         showSuccess('✅ Template deleted successfully!');
//         fetchData(); // Refresh templates
//       } catch (err) {
//         console.error('Error deleting template:', err);
//         showError('❌ Failed to delete template');
//       }
//     }
//   };

//   const handleSendTest = () => {
//     if (!subject.trim() || !content.trim()) {
//       showWarning('⚠️ Please enter both subject and content before sending test');
//       return;
//     }
//     showSuccess('📧 Test email sent successfully! Check your inbox.');
//   };

//   const handleInsertLink = () => {
//     if (linkData.url && linkData.text) {
//       const linkHtml = `<a href="${linkData.url}" title="${linkData.title || linkData.text}" target="_blank" rel="noopener noreferrer">${linkData.text}</a>`;
//       setContent(content + linkHtml);
//       setLinkData({ url: '', text: '', title: '' });
//       setIsLinkModalOpen(false);
//       showSuccess('🔗 Link inserted successfully!');
//     }
//   };

//   const handleAIAssistant = () => {
//     showInfo('🤖 AI Assistant feature coming soon! This will help you write compelling email content automatically.');
//   };

//   const handleAdvancedSettings = () => {
//     showInfo('⚙️ Advanced Settings coming soon! Configure delivery options, A/B testing, scheduling, and more.');
//   };

//   const handleNextPreviewRecipients = () => {
//     showInfo('📋 Recipient preview and selection workflow coming soon! You\'ll be able to select specific contacts and preview how the email will look for each recipient.');
//   };

//   return (
//     <>
//       <Dialog
//         open={isOpen}
//         onClose={onClose}
//         className="fixed inset-0 z-50 overflow-y-auto"
//       >
//         <div className="flex min-h-screen items-start justify-center p-4 pt-8">
//           <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

//           <div className="relative bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl">
//             {/* Main Content */}
//             <div className="p-4">
//               <div className="flex justify-between items-center mb-4">
//                 <div>
//                   <h2 className="text-lg font-bold text-blue-600">📧 New Email Campaign</h2>
//                   <p className="text-gray-600 text-xs">Create and send email campaigns</p>
//                 </div>
//                 <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
//                   <FiX className="h-5 w-5" />
//                 </button>
//               </div>

//               {error && (
//                 <div className="mb-3 p-2 bg-red-50 text-red-700 rounded-lg text-sm">
//                   {error}
//                 </div>
//               )}

//               <div className="mb-3">
//                 <label className="block text-xs font-medium text-gray-700 mb-1">
//                   Send from:
//                 </label>
//                 <select 
//                   value={sendFrom}
//                   onChange={(e) => setSendFrom(e.target.value)}
//                   className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all p-2 text-sm"
//                 >
//                   <option>Alisha Hanif</option>
//                   <option>Owner of the recipient</option>
//                   <option>Select an employee</option>
//                 </select>
//               </div>

//               <div className="mb-3">
//                 <input
//                   type="text"
//                   placeholder="Subject *"
//                   value={subject}
//                   onChange={(e) => setSubject(e.target.value)}
//                   className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all p-2 text-sm font-medium"
//                 />
//               </div>

//               {/* Media URL Display */}
//               {mediaUrl && (
//                 <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       <FiImage className="text-blue-600" />
//                       <span className="text-xs font-medium text-blue-800">Media attached</span>
//                     </div>
//                     <button
//                       onClick={() => setMediaUrl('')}
//                       className="text-red-500 hover:text-red-700 transition-colors"
//                     >
//                       <FiX className="w-3 h-3" />
//                     </button>
//                   </div>
//                   <img src={mediaUrl} alt="Selected media" className="mt-2 h-16 w-full object-cover rounded border" />
//                 </div>
//               )}

//               <div className="mb-3">
//                 <button 
//                   onClick={handleAIAssistant}
//                   className="flex items-center text-blue-600 hover:text-blue-700 mb-2 font-medium transition-colors text-sm"
//                 >
//                   <span className="mr-2">✨</span>
//                   Write email with our AI assistant
//                 </button>
//                 <ReactQuill
//                   value={content}
//                   onChange={setContent}
//                   modules={modules}
//                   className="h-32 mb-8 rounded-lg"
//                   placeholder="Hi {first name},"
//                 />
//                 <div className="text-right text-xs text-gray-500 mt-1">
//                   {content.replace(/<[^>]*>/g, '').length} characters
//                 </div>
//               </div>

//               <div className="flex justify-between items-center mt-3">
//                 <button 
//                   onClick={() => setIsTemplateSelectModalOpen(true)}
//                   className="flex items-center text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
//                 >
//                   📄 Use existing email template
//                 </button>
//                 <div className="text-xs text-gray-500">
//                   (first name) is a placeholder for recipient names; actual names will be populated.
//                 </div>
//               </div>

//               <div className="mt-4">
//                 <select
//                   value={selectedSignatureId}
//                   onChange={(e) => handleSignatureChange(e.target.value)}
//                   className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all p-2 text-sm"
//                   disabled={loading}
//                 >
//                   <option value="">Alisha's Email Signatures</option>
//                   {signatures.map(signature => (
//                     <option key={signature.id} value={signature.id}>
//                       {signature.name}
//                     </option>
//                   ))}
//                   <option value="add">Add signature</option>
//                 </select>
//               </div>

//               <div className="mt-4 flex justify-between items-center">
//                 <button 
//                   onClick={handleAdvancedSettings}
//                   className="text-gray-600 hover:text-gray-800 text-xs flex items-center font-medium transition-colors"
//                 >
//                   <FiSettings className="mr-1 w-3 h-3" />
//                   Advanced Settings
//                 </button>
                
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={handlePreview}
//                     className="px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center"
//                   >
//                     <FiEye className="mr-1 w-3 h-3" />
//                     Preview
//                   </button>
//                   <button
//                     onClick={handleSaveAs}
//                     className="px-3 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center"
//                   >
//                     <FiSave className="mr-1 w-3 h-3" />
//                     Save Template
//                   </button>
//                   <button
//                     onClick={handleSendTest}
//                     className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md text-sm flex items-center"
//                   >
//                     <FiSend className="mr-1 w-3 h-3" />
//                     Send Test
//                   </button>
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>
//       </Dialog>

//       {/* Preview Modal */}
//       <Dialog
//         open={isPreviewModalOpen}
//         onClose={() => setIsPreviewModalOpen(false)}
//         className="fixed inset-0 z-[60] overflow-y-auto"
//       >
//         <div className="flex min-h-screen items-center justify-center p-4">
//           <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

//           <div className="relative bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl">
//             <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-t-2xl">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h3 className="text-lg font-bold text-white">📧 Email Preview</h3>
//                   <p className="text-blue-100 text-xs">Preview how your email will look</p>
//                 </div>
//                 <button
//                   onClick={() => setIsPreviewModalOpen(false)}
//                   className="text-white hover:text-gray-200 transition-colors"
//                 >
//                   <FiX className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>
            
//             <div className="p-4">
//               <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
//                 <div className="mb-3 pb-3 border-b border-gray-200">
//                   <div className="text-xs text-gray-600 mb-1">From: {sendFrom}</div>
//                   <div className="text-sm font-semibold text-gray-900">Subject: {subject}</div>
//                 </div>
//                 {mediaUrl && (
//                   <div className="mb-3">
//                     <img src={mediaUrl} alt="Email media" className="max-w-full h-24 object-cover rounded border" />
//                   </div>
//                 )}
//                 <div 
//                   className="prose prose-xs max-w-none"
//                   dangerouslySetInnerHTML={{ __html: content }}
//                 />
//               </div>
//             </div>
            
//             <div className="bg-gray-50 px-4 py-3 flex justify-between rounded-b-2xl">
//               <button
//                 onClick={() => setIsPreviewModalOpen(false)}
//                 className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-sm"
//               >
//                 Close Preview
//               </button>
//               <button
//                 onClick={handleNextPreviewRecipients}
//                 className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md text-sm flex items-center"
//               >
//                 <FiUsers className="mr-1 w-3 h-3" />
//                 Next: Select Recipients
//               </button>
//             </div>
//           </div>
//         </div>
//       </Dialog>
//       <TemplateSelectModal
//         isOpen={isTemplateSelectModalOpen}
//         onClose={() => setIsTemplateSelectModalOpen(false)}
//         onSelect={handleTemplateSelect}
//       />

//       {/* Link Insert Modal */}
//       <Dialog
//         open={isLinkModalOpen}
//         onClose={() => setIsLinkModalOpen(false)}
//         className="fixed inset-0 z-[60] overflow-y-auto"
//       >
//         <div className="flex min-h-screen items-center justify-center">
//           <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

//           <div className="relative bg-white w-full max-w-xs mx-4 rounded-xl shadow-xl p-3">
//             <div className="flex justify-between items-center mb-3">
//               <h3 className="text-sm font-semibold text-gray-900">🔗 Insert Link</h3>
//               <button
//                 onClick={() => setIsLinkModalOpen(false)}
//                 className="text-gray-400 hover:text-gray-500"
//               >
//                 <FiX className="h-4 w-4" />
//               </button>
//             </div>

//             <div className="space-y-3">
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
//                 <input
//                   type="url"
//                   value={linkData.url}
//                   onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
//                   placeholder="https://example.com"
//                   className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all p-2 text-xs"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">Text to Display</label>
//                 <input
//                   type="text"
//                   value={linkData.text}
//                   onChange={(e) => setLinkData({ ...linkData, text: e.target.value })}
//                   placeholder="Link text"
//                   className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all p-2 text-xs"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">Title (optional)</label>
//                 <input
//                   type="text"
//                   value={linkData.title}
//                   onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
//                   placeholder="Link title"
//                   className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all p-2 text-xs"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end space-x-2 mt-4">
//               <button
//                 onClick={() => setIsLinkModalOpen(false)}
//                 className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors text-xs"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleInsertLink}
//                 disabled={!linkData.url || !linkData.text}
//                 className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs"
//               >
//                 Insert Link
//               </button>
//             </div>
//           </div>
//         </div>
//       </Dialog>
//     </>
//   );
// }

// export default EmailCampaignModal;


// import React, { useState, useEffect } from 'react';
// import { Dialog } from '@headlessui/react';
// import { FiX, FiSend, FiSave, FiPaperclip, FiEye, FiSettings, FiUsers, FiChevronDown, FiChevronUp } from 'react-icons/fi';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
// import { getEmailTemplates, getEmailSignatures, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate, getUsers } from '../../services/api';
// import TemplateSelectModal from './TemplateSelectModal';
// import { useToast } from '../../hooks/useToast';
// import { use } from 'react';
// import { useAuth } from '../../context/AuthContext';


// function EmailCampaignModal({ isOpen, onClose, preSelectedMedia = null }) {
//   const { showSuccess, showInfo, showWarning, showError } = useToast();
//   const { user } = useAuth();
//   console.log("user from context:", user);

//   const [users, setUsers] = useState([]);
//   console.log("users",users);
//   const [usersLoading, setUsersLoading] = useState(false);
  
//   console.log('📧 EmailCampaignModal: Rendered with isOpen:', isOpen);
//     const fetchUsers = async () => {
//       try {
//         setUsersLoading(true);
//         console.log('📋 AddTaskModal: Starting to fetch users...');
//         const usersData = await getUsers();
//         console.log('📋 AddTaskModal: Users fetched:', usersData?.length || 0);
//         setUsers(usersData || []);
//       } catch (err) {
//         console.error('Error fetching users:', err);
//         setUsers([]);
//       } finally {
//         setUsersLoading(false);
//       }
//     };

//     useEffect(() => {
//       if (isOpen) {
//         fetchUsers();
//       }
//     }, [isOpen]);

//     useEffect(() => {
//       if (users.length > 0 && user) {
//         let userData=users.find(u => u.email === user.email);
//         console.log("userData",userData);
//         setSendFrom(user.email);
//       }
//     }, [users]);


  
//   // Email compose fields
//   const [to, setTo] = useState('');
//   const [cc, setCc] = useState('');
//   const [bcc, setBcc] = useState('');
//   const [subject, setSubject] = useState('');
//   const [content, setContent] = useState('');
//   const [attachments, setAttachments] = useState([]);
//   const [priority, setPriority] = useState('normal'); // normal, high, low
//   const [sendFrom, setSendFrom] = useState('');
  
//   // UI state
//   const [showCc, setShowCc] = useState(false);
//   const [showBcc, setShowBcc] = useState(false);
//   const [showAdvanced, setShowAdvanced] = useState(false);
  
//   // Template and signature state
//   const [selectedSignatureId, setSelectedSignatureId] = useState('');
//   const [selectedTemplateId, setSelectedTemplateId] = useState(null);
//   const [templates, setTemplates] = useState([]);
//   const [signatures, setSignatures] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   // Modal states
//   const [isTemplateSelectModalOpen, setIsTemplateSelectModalOpen] = useState(false);
//   const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

 

//   // Set pre-selected media when modal opens
//   useEffect(() => {
//     if (preSelectedMedia) {
//       setAttachments([{ id: 1, name: 'Selected Media', url: preSelectedMedia, type: 'image' }]);
//     }
//   }, [preSelectedMedia]);

//   useEffect(() => {
//     if (isOpen) {
//       console.log('📧 EmailCampaignModal: Modal opened, fetching data...');
//       fetchData();
//     }
//   }, [isOpen]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       console.log('📧 EmailCampaignModal: Starting to fetch templates and signatures...');
//       const [templatesData, signaturesData] = await Promise.all([
//         getEmailTemplates(),
//         getEmailSignatures()
//       ]);
//       console.log('📧 EmailCampaignModal: Data fetched:', {
//         templates: templatesData?.length || 0,
//         signatures: signaturesData?.length || 0
//       });
//       setTemplates(templatesData || []);
//       setSignatures(signaturesData || []);
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError('Failed to load templates and signatures');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Simplified ReactQuill modules
//   const modules = {
//     toolbar: [
//       [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
//       ['bold', 'italic', 'underline', 'strike'],
//       [{ 'color': [] }, { 'background': [] }],
//       [{ 'align': [] }],
//       [{ 'list': 'ordered'}, { 'list': 'bullet' }],
//       ['blockquote', 'code-block'],
//       ['link', 'image'],
//       ['clean']
//     ]
//   };

//   const formats = [
//     'font', 'size',
//     'bold', 'italic', 'underline', 'strike', 'blockquote',
//     'list', 'bullet', 'indent',
//     'link', 'image', 'color', 'background', 'align'
//   ];

//   const handleTemplateSelect = (template) => {
//     console.log('📧 EmailCampaignModal: Template selected:', template);
//     setSelectedTemplateId(template.id);
//     setSubject(template.subject || '');
//     setContent(template.content || '');
//     setIsTemplateSelectModalOpen(false);
//     showSuccess('✅ Template loaded successfully!');
//   };

//   const handleSignatureChange = (signatureId) => {
//     console.log('📧 EmailCampaignModal: Signature changed:', signatureId);
//     if (signatureId === 'add') {
//       showInfo('📝 Add signature functionality coming soon!');
//       return;
//     }
//     setSelectedSignatureId(signatureId);
//     const signature = signatures.find(s => s.id === signatureId);
//     if (signature && signature.content) {
//       setContent(prev => (prev || '') + '\n\n' + signature.content);
//       showSuccess('✅ Signature added to email!');
//     }
//   };

//   const handlePreview = () => {
//     if (!to.trim() || !subject.trim() || !content.trim()) {
//       showWarning('⚠️ Please fill in To, Subject and Message fields to preview');
//       return;
//     }
//     setIsPreviewModalOpen(true);
//   };

//   const handleSaveAsDraft = async () => {
//     if (!subject.trim() && !content.trim()) {
//       showWarning('⚠️ Please enter subject or content to save as draft');
//       return;
//     }

//     try {
//       const draftData = {
//         to,
//         cc,
//         bcc,
//         subject,
//         content,
//         from: sendFrom,
//         priority,
//         attachments,
//         isDraft: true
//       };

//       // Save as draft logic here
//       console.log('Saving draft:', draftData);
//       showSuccess('✅ Email saved as draft!');
//     } catch (err) {
//       console.error('Error saving draft:', err);
//       showError('❌ Failed to save draft');
//     }
//   };

//   const handleSendEmail = async () => {
//     if (!to.trim()) {
//       showWarning('⚠️ Please enter at least one recipient in the To field');
//       return;
//     }
//     if (!subject.trim()) {
//       showWarning('⚠️ Please enter a subject');
//       return;
//     }
//     if (!content.trim()) {
//       showWarning('⚠️ Please enter a message');
//       return;
//     }

//     try {
//       const emailData = {
//         to: to.split(',').map(email => email.trim()),
//         cc: cc ? cc.split(',').map(email => email.trim()) : [],
//         bcc: bcc ? bcc.split(',').map(email => email.trim()) : [],
//         subject,
//         content,
//         from: sendFrom,
//         priority,
//         attachments
//       };

//       console.log('Sending email:', emailData);
//       // API call to send email would go here
//       showSuccess('📧 Email sent successfully!');
//       onClose();
//     } catch (err) {
//       console.error('Error sending email:', err);
//       showError('❌ Failed to send email');
//     }
//   };

//   const handleAttachFile = () => {
//     showInfo('📎 File attachment functionality coming soon!');
//   };

//   const removeAttachment = (attachmentId) => {
//     setAttachments(prev => prev.filter(att => att.id !== attachmentId));
//   };

//   const validateEmailAddress = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const formatEmailField = (value) => {
//     return value.split(',').map(email => email.trim()).filter(email => email.length > 0);
//   };

//   return (
//     <>
//       <Dialog
//         open={isOpen}
//         onClose={onClose}
//         className="fixed inset-0 z-50 overflow-y-auto"
//       >
//         <div className="flex min-h-screen items-start justify-center p-4 pt-4">
//           <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

//           <div className="relative bg-white w-full max-w-4xl mx-4 rounded-lg shadow-2xl max-h-[95vh] overflow-hidden">
//             {/* Email Header */}
//             <div className="bg-white border-b border-gray-200 p-4">
//               <div className="flex justify-between items-center">
//                 <div className="flex items-center space-x-3">
//                   <h2 className="text-xl font-semibold text-gray-900">New Message</h2>
//                   <span className="text-sm text-gray-500">- Compose</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={() => setIsTemplateSelectModalOpen(true)}
//                     className="text-sm text-blue-600 hover:text-blue-800 font-medium"
//                   >
//                     📄 Use Template
//                   </button>
//                   <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//                     <FiX className="h-6 w-6" />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {error && (
//               <div className="mx-4 mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
//                 {error}
//               </div>
//             )}

//             <div className="flex flex-col h-full max-h-[calc(95vh-80px)] overflow-hidden">
//               {/* Email Fields */}
//               <div className="p-4 space-y-3 border-b border-gray-200">
//                 {/* From Field */}
//                 <div className="flex items-center">
//                   <label className="w-16 text-sm font-medium text-gray-700 flex-shrink-0">From:</label>
//                   <input
//                     value={sendFrom}
//                   readOnly
//                     className="flex-1 border-none focus:ring-0 focus:outline-none text-sm bg-transparent"
//                   >
//                   </input>
//                 </div>

//                 {/* To Field */}
//                 <div className="flex items-center">
//                   <label className="w-16 text-sm font-medium text-gray-700 flex-shrink-0">To:</label>
//                   <input
//                     type="text"
//                     value={to}
//                     onChange={(e) => setTo(e.target.value)}
//                     placeholder="Enter email addresses separated by commas"
//                     className="flex-1 border-none focus:ring-0 focus:outline-none text-sm bg-transparent"
//                   />
//                   <div className="flex items-center space-x-2 ml-2">
//                     <button
//                       onClick={() => setShowCc(!showCc)}
//                       className={`text-xs px-2 py-1 rounded ${showCc ? 'bg-blue-100 text-blue-700' : 'text-blue-600 hover:bg-blue-50'}`}
//                     >
//                       Cc
//                     </button>
//                     <button
//                       onClick={() => setShowBcc(!showBcc)}
//                       className={`text-xs px-2 py-1 rounded ${showBcc ? 'bg-blue-100 text-blue-700' : 'text-blue-600 hover:bg-blue-50'}`}
//                     >
//                       Bcc
//                     </button>
//                   </div>
//                 </div>

//                 {/* CC Field */}
//                 {showCc && (
//                   <div className="flex items-center">
//                     <label className="w-16 text-sm font-medium text-gray-700 flex-shrink-0">Cc:</label>
//                     <input
//                       type="text"
//                       value={cc}
//                       onChange={(e) => setCc(e.target.value)}
//                       placeholder="Enter email addresses separated by commas"
//                       className="flex-1 border-none focus:ring-0 focus:outline-none text-sm bg-transparent"
//                     />
//                   </div>
//                 )}

//                 {/* BCC Field */}
//                 {showBcc && (
//                   <div className="flex items-center">
//                     <label className="w-16 text-sm font-medium text-gray-700 flex-shrink-0">Bcc:</label>
//                     <input
//                       type="text"
//                       value={bcc}
//                       onChange={(e) => setBcc(e.target.value)}
//                       placeholder="Enter email addresses separated by commas"
//                       className="flex-1 border-none focus:ring-0 focus:outline-none text-sm bg-transparent"
//                     />
//                   </div>
//                 )}

//                 {/* Subject Field */}
//                 <div className="flex items-center">
//                   <label className="w-16 text-sm font-medium text-gray-700 flex-shrink-0">Subject:</label>
//                   <input
//                     type="text"
//                     value={subject}
//                     onChange={(e) => setSubject(e.target.value)}
//                     placeholder="Enter subject"
//                     className="flex-1 border-none focus:ring-0 focus:outline-none text-sm bg-transparent font-medium"
//                   />
//                   <div className="flex items-center space-x-2 ml-2">
//                     <select
//                       value={priority}
//                       onChange={(e) => setPriority(e.target.value)}
//                       className="text-xs border border-gray-300 rounded px-2 py-1"
//                     >
//                       <option value="low">Low Priority</option>
//                       <option value="normal">Normal</option>
//                       <option value="high">High Priority</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Attachments */}
//                 {attachments.length > 0 && (
//                   <div className="flex items-start">
//                     <label className="w-16 text-sm font-medium text-gray-700 flex-shrink-0 mt-1">Attached:</label>
//                     <div className="flex-1 space-y-1">
//                       {attachments.map(attachment => (
//                         <div key={attachment.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
//                           <div className="flex items-center space-x-2">
//                             <FiPaperclip className="text-gray-500 w-4 h-4" />
//                             <span className="text-sm">{attachment.name}</span>
//                           </div>
//                           <button
//                             onClick={() => removeAttachment(attachment.id)}
//                             className="text-red-500 hover:text-red-700"
//                           >
//                             <FiX className="w-4 h-4" />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Message Body */}
//               <div className="flex-1 flex flex-col overflow-hidden">
//                 <div className="p-4 flex-1 overflow-hidden">
//                   <ReactQuill
//                     value={content}
//                     onChange={setContent}
//                     modules={modules}
//                     formats={formats}
//                     className="h-full"
//                     placeholder="Type your message here..."
//                     style={{ height: 'calc(100% - 42px)' }}
//                   />
//                 </div>

//                 {/* Signature Selection */}
//                 <div className="px-4 pb-2">
//                   <select
//                     value={selectedSignatureId}
//                     onChange={(e) => handleSignatureChange(e.target.value)}
//                     className="text-sm border border-gray-300 rounded px-3 py-1"
//                     disabled={loading}
//                   >
//                     <option value="">Add Signature</option>
//                     {signatures.map(signature => (
//                       <option key={signature.id} value={signature.id}>
//                         {signature.name}
//                       </option>
//                     ))}
//                     <option value="add">Create New Signature</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Email Actions */}
//               <div className="bg-gray-50 p-4 border-t border-gray-200">
//                 <div className="flex justify-between items-center">
//                   <div className="flex items-center space-x-3">
//                     <button
//                       onClick={handleAttachFile}
//                       className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
//                     >
//                       <FiPaperclip className="mr-1 w-4 h-4" />
//                       Attach
//                     </button>
//                     <button
//                       onClick={handlePreview}
//                       className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
//                     >
//                       <FiEye className="mr-1 w-4 h-4" />
//                       Preview
//                     </button>
//                     <button
//                       onClick={() => setShowAdvanced(!showAdvanced)}
//                       className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
//                     >
//                       <FiSettings className="mr-1 w-4 h-4" />
//                       Options {showAdvanced ? <FiChevronUp className="ml-1 w-3 h-3" /> : <FiChevronDown className="ml-1 w-3 h-3" />}
//                     </button>
//                   </div>

//                   <div className="flex items-center space-x-3">
//                     <button
//                       onClick={handleSaveAsDraft}
//                       className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
//                     >
//                       <FiSave className="inline mr-1 w-4 h-4" />
//                       Save Draft
//                     </button>
//                     <button
//                       onClick={handleSendEmail}
//                       disabled={!to.trim() || !subject.trim() || !content.trim()}
//                       className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
//                     >
//                       <FiSend className="inline mr-1 w-4 h-4" />
//                       Send
//                     </button>
//                   </div>
//                 </div>

//                 {/* Advanced Options */}
//                 {showAdvanced && (
//                   <div className="mt-3 pt-3 border-t border-gray-200">
//                     <div className="grid grid-cols-2 gap-4 text-sm">
//                       <div>
//                         <label className="block text-gray-700 font-medium mb-1">Delivery Options:</label>
//                         <div className="space-y-1">
//                           <label className="flex items-center">
//                             <input type="checkbox" className="mr-2" />
//                             <span>Request read receipt</span>
//                           </label>
//                           <label className="flex items-center">
//                             <input type="checkbox" className="mr-2" />
//                             <span>Request delivery receipt</span>
//                           </label>
//                         </div>
//                       </div>
//                       <div>
//                         <label className="block text-gray-700 font-medium mb-1">Send Options:</label>
//                         <div className="space-y-1">
//                           <label className="flex items-center">
//                             <input type="checkbox" className="mr-2" />
//                             <span>Send as plain text</span>
//                           </label>
//                           <label className="flex items-center">
//                             <input type="checkbox" className="mr-2" />
//                             <span>Schedule send</span>
//                           </label>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </Dialog>

//       {/* Preview Modal */}
//       <Dialog
//         open={isPreviewModalOpen}
//         onClose={() => setIsPreviewModalOpen(false)}
//         className="fixed inset-0 z-[60] overflow-y-auto"
//       >
//         <div className="flex min-h-screen items-center justify-center p-4">
//           <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

//           <div className="relative bg-white w-full max-w-2xl mx-4 rounded-lg shadow-2xl">
//             <div className="bg-blue-600 p-4 rounded-t-lg">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h3 className="text-lg font-semibold text-white">📧 Email Preview</h3>
//                   <p className="text-blue-100 text-sm">Preview how your email will appear</p>
//                 </div>
//                 <button
//                   onClick={() => setIsPreviewModalOpen(false)}
//                   className="text-white hover:text-gray-200 transition-colors"
//                 >
//                   <FiX className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>
            
//             <div className="p-6">
//               <div className="border border-gray-300 rounded-lg overflow-hidden">
//                 {/* Email Header */}
//                 <div className="bg-gray-50 p-4 border-b border-gray-300">
//                   <div className="space-y-2 text-sm">
//                     <div><strong>From:</strong> {sendFrom}</div>
//                     <div><strong>To:</strong> {to}</div>
//                     {cc && <div><strong>Cc:</strong> {cc}</div>}
//                     {bcc && <div><strong>Bcc:</strong> {bcc}</div>}
//                     <div><strong>Subject:</strong> {subject}</div>
//                     {priority !== 'normal' && (
//                       <div><strong>Priority:</strong> <span className={priority === 'high' ? 'text-red-600' : 'text-blue-600'}>{priority.toUpperCase()}</span></div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Email Body */}
//                 <div className="p-4 bg-white">
//                   {attachments.length > 0 && (
//                     <div className="mb-4 p-3 bg-gray-50 rounded border">
//                       <div className="text-sm font-medium text-gray-700 mb-2">Attachments:</div>
//                       {attachments.map(attachment => (
//                         <div key={attachment.id} className="flex items-center text-sm text-gray-600">
//                           <FiPaperclip className="mr-2 w-4 h-4" />
//                           {attachment.name}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                   <div 
//                     className="prose prose-sm max-w-none"
//                     dangerouslySetInnerHTML={{ __html: content }}
//                   />
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
//               <button
//                 onClick={() => setIsPreviewModalOpen(false)}
//                 className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
//               >
//                 Close Preview
//               </button>
//               <button
//                 onClick={() => {
//                   setIsPreviewModalOpen(false);
//                   handleSendEmail();
//                 }}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//               >
//                 <FiSend className="inline mr-2 w-4 h-4" />
//                 Send Email
//               </button>
//             </div>
//           </div>
//         </div>
//       </Dialog>

//       <TemplateSelectModal
//         isOpen={isTemplateSelectModalOpen}
//         onClose={() => setIsTemplateSelectModalOpen(false)}
//         onSelect={handleTemplateSelect}
//       />
//     </>
//   );
// }

// export default EmailCampaignModal;


import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSend, FiSave, FiEye, FiSettings, FiChevronDown, FiChevronUp } from 'react-icons/fi';
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
    }
  }, [isOpen]);

  useEffect(() => {
    if (users.length > 0 && user) {
      let userData = users.find(u => u.email === user.email);
      console.log("users",users);
      setSendFrom(userData?.outlook_email);
      
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
        isHtml: true
      };

      await sendOutlookEmail(sendFrom, emailData);
      showSuccess('📧 Email sent successfully!');
      onClose();
    } catch (err) {
      console.error('Error sending email:', err);
      showError('❌ Failed to send email');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-start justify-center p-4 pt-4">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white w-full max-w-4xl mx-4 rounded-lg shadow-2xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">New Message</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col h-full max-h-[calc(95vh-80px)] overflow-hidden">
              {/* Fields */}
              <div className="p-4 space-y-3 border-b border-gray-200">
                <div className="flex items-center">
                  <label className="w-16 text-sm font-medium">From:</label>
                  <input value={sendFrom} readOnly className="flex-1 border-none text-sm bg-transparent" />
                </div>

                <div className="flex items-center">
                  <label className="w-16 text-sm font-medium">To:</label>
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Enter multiple emails separated by commas"
                    className="flex-1 border-none text-sm bg-transparent"
                  />
                  <button onClick={() => setShowCc(!showCc)} className="ml-2 text-xs text-blue-600">Cc</button>
                  <button onClick={() => setShowBcc(!showBcc)} className="ml-2 text-xs text-blue-600">Bcc</button>
                </div>

                {showCc && (
                  <div className="flex items-center">
                    <label className="w-16 text-sm font-medium">Cc:</label>
                    <input
                      type="text"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      placeholder="Enter multiple emails separated by commas"
                      className="flex-1 border-none text-sm bg-transparent"
                    />
                  </div>
                )}

                {showBcc && (
                  <div className="flex items-center">
                    <label className="w-16 text-sm font-medium">Bcc:</label>
                    <input
                      type="text"
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                      placeholder="Enter multiple emails separated by commas"
                      className="flex-1 border-none text-sm bg-transparent"
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <label className="w-16 text-sm font-medium">Subject:</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter subject"
                    className="flex-1 border-none text-sm bg-transparent"
                  />
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="ml-2 text-xs border rounded px-2 py-1"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  className="flex-1"
                  placeholder="Type your message here..."
                />
              </div>

              {/* Actions */}
              <div className="bg-gray-50 p-4 flex justify-between">
                <button onClick={() => setIsPreviewModalOpen(true)} className="text-sm text-gray-600">
                  <FiEye className="inline mr-1" /> Preview
                </button>
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
    </>
  );
}

export default EmailCampaignModal;
