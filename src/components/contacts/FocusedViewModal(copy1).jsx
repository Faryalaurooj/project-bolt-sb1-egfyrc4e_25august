import React, { useState, useEffect } from 'react';
import { Dialog, Tab } from '@headlessui/react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit2, FiTrash2, FiPlus, FiSave, FiFileText, FiMessageSquare, FiUpload, FiDownload, FiEye, FiClock, FiUsers } from 'react-icons/fi';
import ScheduleMeetingModal from './ScheduleMeetingModal';
import { useAuth } from '../../context/AuthContext';
import { 
  getContactById, 
  updateContact, 
  getHouseholdMembers, 
  createHouseholdMember, 
  updateHouseholdMember, 
  deleteHouseholdMember,
  getCompaniesByContactId,
  linkContactToCompany,
  getPolicyDocumentsByContactId,
  createPolicyDocument,
  deletePolicyDocument,
  createNote,
  createPhoneCall,
  getPhoneCallsByContactId,
  getTextMessagesForContact,
  getAllNotes,
  getAllPhoneCalls,
  getPoliciesByContactId
} from '../../services/api';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function FocusedViewModal({ 
  isOpen, 
  onClose, 
  contact, 
  onNoteSaved, 
  onActionItemSaved, 
  onPhoneCallSaved 
}) {
  console.log('🔍 FocusedViewModal: Component rendered with props:', {
    isOpen,
    hasContact: !!contact,
    contactId: contact?.id,
    contactName: contact ? `${contact.firstName} ${contact.lastName}` : 'None'
  });

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [contactData, setContactData] = useState(contact);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isScheduleMeetingModalOpen, setIsScheduleMeetingModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  
  // Contact details data
  const [contactDetails, setContactDetails] = useState(null);
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [policyDocuments, setPolicyDocuments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  
  // Form states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteVisibility, setNoteVisibility] = useState('all employees');
  const [isActionItem, setIsActionItem] = useState(false);
  const [callTitle, setCallTitle] = useState('');
  const [callContent, setCallContent] = useState('');
  const [callVisibility, setCallVisibility] = useState('all employees');
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false);

  // Household member form state
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    first_name: '',
    last_name: '',
    relationship: 'child',
    date_of_birth: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Fetch contact details when modal opens or contact changes
  useEffect(() => {
    console.log('🔍 FocusedViewModal: useEffect triggered', { isOpen, contactId: contact?.id });
    
    if (isOpen && contact?.id) {
      console.log('🔍 FocusedViewModal: Starting to fetch contact details for:', contact.id);
      fetchContactDetails(contact.id);
    } else if (!isOpen) {
      console.log('🔍 FocusedViewModal: Modal closed, resetting state');
      // Reset state when modal closes
      setContactDetails(null);
      setHouseholdMembers([]);
      setCompanies([]);
      setPolicyDocuments([]);
      setPolicies([]);
      setHistoryItems([]);
      setActiveTab(0);
      setIsEditing(false);
      setError(null);
    }
  }, [isOpen, contact?.id]);

  const fetchContactDetails = async (contactId) => {
    console.log('🔍 FocusedViewModal: fetchContactDetails started for:', contactId);
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 FocusedViewModal: Making API calls...');
      
      // Fetch all contact-related data in parallel
      const [
        contactDetailsData,
        householdMembersData,
        companiesData,
        policyDocumentsData,
        policiesData
      ] = await Promise.all([
        getContactById(contactId),
        getHouseholdMembers(contactId).catch(() => []), // Handle missing relationship gracefully
        getCompaniesByContactId(contactId).catch(() => []),
        getPolicyDocumentsByContactId(contactId).catch(() => []),
        getPoliciesByContactId(contactId).catch(() => [])
      ]);

      // Fetch history items (notes, phone calls, text messages)
      const [allNotes, allPhoneCalls, textMessages] = await Promise.all([
        getAllNotes().catch(() => []),
        getAllPhoneCalls().catch(() => []),
        getTextMessagesForContact(contactId).catch(() => [])
      ]);

      // Filter history items for this contact and combine them
      const contactNotes = allNotes.filter(note => note.contact_id === contactId);
      const contactPhoneCalls = allPhoneCalls.filter(call => call.contact_id === contactId);
      
      const combinedHistory = [
        ...contactNotes.map(note => ({
          ...note,
          type: note.is_action_item ? 'Action Item' : 'Note',
          timestamp: note.created_at,
          icon: '📝'
        })),
        ...contactPhoneCalls.map(call => ({
          ...call,
          type: 'Phone Call',
          timestamp: call.created_at,
          icon: '📞'
        })),
        ...textMessages.map(message => ({
          ...message,
          type: 'Text Message',
          timestamp: message.created_at || message.sent_at,
          icon: '💬'
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('🔍 FocusedViewModal: API responses received:', {
        contactDetails: !!contactDetailsData,
        householdMembers: householdMembersData?.length || 0,
        companies: companiesData?.length || 0,
        policyDocuments: policyDocumentsData?.length || 0,
        policies: policiesData?.length || 0,
        historyItems: combinedHistory?.length || 0
      });

      setContactDetails(contactDetailsData);
      setHouseholdMembers(householdMembersData || []);
      setCompanies(companiesData || []);
      setPolicyDocuments(policyDocumentsData || []);
      setPolicies(policiesData || []);
      setHistoryItems(combinedHistory);
      
      // Initialize edit form data
      setEditFormData(contactDetailsData || {});
      
      console.log('🔍 FocusedViewModal: All data set successfully');
    } catch (err) {
      console.error('🔍 FocusedViewModal: Error fetching contact details:', err);
      setError('Failed to load contact details');
    } finally {
      setLoading(false);
      console.log('🔍 FocusedViewModal: fetchContactDetails completed');
    }
  };

  const handleSaveContact = async () => {
    console.log('🔍 FocusedViewModal: Saving contact changes...');
    
    try {
      setLoading(true);
      await updateContact(contactDetails.id, editFormData);
      setContactDetails({ ...contactDetails, ...editFormData });
      setIsEditing(false);
      console.log('🔍 FocusedViewModal: Contact saved successfully');
    } catch (err) {
      console.error('🔍 FocusedViewModal: Error saving contact:', err);
      setError('Failed to save contact changes');
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingScheduled = () => {
    console.log('🔍 FocusedViewModal: Meeting scheduled, refreshing data...');
    fetchContactData(contact.id);
    // The 'onMeetingScheduled' function is not defined as a prop or locally, so it's removed.
  };

  const handleSaveNote = async () => {
    console.log('🔍 FocusedViewModal: Saving note...');
    
    if (!noteTitle || !noteContent) {
      setError('Please fill in note title and content');
      return;
    }

    try {
      const noteData = {
        title: noteTitle,
        content: noteContent,
        visibility: noteVisibility,
        is_action_item: isActionItem,
        contact_id: contactDetails.id,
        status: isActionItem ? 'pending' : null
      };

      await createNote(noteData);
      
      // Reset form and refresh history
      setNoteTitle('');
      setNoteContent('');
      setIsActionItem(false);
      await fetchContactDetails(contactDetails.id);
      
      if (onNoteSaved) {
        onNoteSaved();
      }
      
      console.log('🔍 FocusedViewModal: Note saved successfully');
    } catch (err) {
      console.error('🔍 FocusedViewModal: Error saving note:', err);
      setError('Failed to save note');
    }
  };

  const handleSavePhoneCall = async () => {
    console.log('🔍 FocusedViewModal: Saving phone call...');
    
    if (!callTitle || !callContent) {
      setError('Please fill in call title and content');
      return;
    }

    try {
      const callData = {
        title: callTitle,
        content: callContent,
        visibility: callVisibility,
        contact_id: contactDetails.id,
        is_action_item: false
      };

      await createPhoneCall(callData);
      
      // Reset form and refresh history
      setCallTitle('');
      setCallContent('');
      await fetchContactDetails(contactDetails.id);
      
      if (onPhoneCallSaved) {
        onPhoneCallSaved();
      }
      
      console.log('🔍 FocusedViewModal: Phone call saved successfully');
    } catch (err) {
      console.error('🔍 FocusedViewModal: Error saving phone call:', err);
      setError('Failed to save phone call');
    }
  };

  const handleDocumentUpload = async (event) => {
    console.log('🔍 FocusedViewModal: Uploading document...');
    
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingDocument(true);
      await createPolicyDocument(contactDetails.id, file);
      await fetchContactDetails(contactDetails.id); // Refresh data
      console.log('🔍 FocusedViewModal: Document uploaded successfully');
    } catch (err) {
      console.error('🔍 FocusedViewModal: Error uploading document:', err);
      setError('Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    console.log('🔍 FocusedViewModal: Deleting document:', documentId);
    
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deletePolicyDocument(documentId);
        await fetchContactDetails(contactDetails.id); // Refresh data
        console.log('🔍 FocusedViewModal: Document deleted successfully');
      } catch (err) {
        console.error('🔍 FocusedViewModal: Error deleting document:', err);
        setError('Failed to delete document');
      }
    }
  };

  const handleAddHouseholdMember = async () => {
    if (!newMember.first_name || !newMember.last_name) {
      setError('Please enter first and last name for the household member');
      return;
    }

    try {
      await createHouseholdMember({
        ...newMember,
        contact_id: contactDetails.id
      });
      
      // Reset form and refresh data
      setNewMember({
        first_name: '',
        last_name: '',
        relationship: 'child',
        date_of_birth: '',
        email: '',
        phone: '',
        notes: ''
      });
      setIsAddingMember(false);
      await fetchContactDetails(contactDetails.id);
    } catch (err) {
      console.error('Error adding household member:', err);
      setError('Failed to add household member');
    }
  };

  const handleDeleteHouseholdMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this household member?')) {
      try {
        await deleteHouseholdMember(memberId);
        await fetchContactDetails(contactDetails.id);
      } catch (err) {
        console.error('Error deleting household member:', err);
        setError('Failed to delete household member');
      }
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getRelationshipColor = (relationship) => {
    const colors = {
      child: 'bg-blue-100 text-blue-800',
      parent: 'bg-green-100 text-green-800',
      sibling: 'bg-purple-100 text-purple-800',
      spouse: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[relationship] || colors.other;
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

  const getFileTypeIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'txt': return '📃';
      case 'accord': return '📋';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      default: return '📎';
    }
  };

  const getFileTypeLabel = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return 'PDF Document';
      case 'doc':
      case 'docx': return 'Word Document';
      case 'txt': return 'Text Document';
      case 'accord': return 'Accord File';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'Image File';
      default: return 'Document';
    }
  };

  if (!isOpen) {
    console.log('🔍 FocusedViewModal: Modal not open, returning null');
    return null;
  }

  if (loading) {
    console.log('🔍 FocusedViewModal: Rendering loading state');
    return (
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">Loading contact details...</p>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  if (error && !contactDetails) {
    console.log('🔍 FocusedViewModal: Rendering error state:', { error, hasContactDetails: !!contactDetails });
    return (
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchContactDetails(contact?.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  console.log('🔍 FocusedViewModal: Rendering main modal content');

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white w-full max-w-7xl mx-4 rounded-lg shadow-xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold text-blue-600">
                    {contactData?.firstName?.[0] || contactDetails?.first_name?.[0] || 'C'}
                    {contactData?.lastName?.[0] || contactDetails?.last_name?.[0] || ''}
                  </span>
                </div>
                <div>
                  <Dialog.Title className="text-2xl font-semibold text-gray-900">
                    {contactData?.firstName || contactDetails?.first_name} {contactData?.lastName || contactDetails?.last_name}
                  </Dialog.Title>
                  <div className="flex items-center space-x-4 mt-2">
                    {(contactData?.email || contactDetails?.email) && (
                      <a
                        href={`mailto:${contactData?.email || contactDetails?.email}`}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <FiMail className="mr-1" />
                        {contactData?.email || contactDetails?.email}
                      </a>
                    )}
                    {(contactData?.phone || contactDetails?.phone) && (
                      <a
                        href={`tel:${contactData?.phone || contactDetails?.phone}`}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <FiPhone className="mr-1" />
                        {contactData?.phone || contactDetails?.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsScheduleMeetingModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Schedule Meeting
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsScheduleMeetingOpen(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FiCalendar className="mr-2" />
                  Schedule Meeting
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex h-[calc(95vh-120px)]">
              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto">
                <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                  <Tab.List className="flex space-x-1 bg-blue-900/20 p-1 m-6 rounded-xl">
                    {['Overview', 'History', 'Household', 'Companies', 'Policies'].map((category, idx) => (
                      <Tab
                        key={category}
                        className={({ selected }) =>
                          classNames(
                            'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                            selected
                              ? 'bg-white text-blue-700 shadow'
                              : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                          )
                        }
                      >
                        {category}
                      </Tab>
                    ))}
                  </Tab.List>

                  <Tab.Panels className="p-6">
                    {/* Overview Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                          <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            {isEditing ? <FiSave className="mr-2" /> : <FiEdit2 className="mr-2" />}
                            {isEditing ? 'Save Changes' : 'Edit Contact'}
                          </button>
                        </div>

                        {error && (
                          <div className="p-3 bg-red-50 text-red-700 rounded-md">
                            {error}
                          </div>
                        )}

                        {isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-gray-900">Personal Information</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <input
                                  type="text"
                                  value={editFormData.first_name || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                                  placeholder="First Name"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={editFormData.last_name || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                                  placeholder="Last Name"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <input
                                type="date"
                                value={editFormData.date_of_birth || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, date_of_birth: e.target.value })}
                                placeholder="Date of Birth"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                value={editFormData.ssn_tax_id || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, ssn_tax_id: e.target.value })}
                                placeholder="SSN/Tax ID"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <select
                                value={editFormData.gender || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                              </select>
                              <select
                                value={editFormData.marital_status || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, marital_status: e.target.value })}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              >
                                <option value="">Marital Status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                                <option value="Separated">Separated</option>
                              </select>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-gray-900">Contact Information</h4>
                              <input
                                type="email"
                                value={editFormData.email || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                placeholder="Email"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <input
                                type="tel"
                                value={editFormData.phone || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                placeholder="Primary Phone"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <input
                                type="tel"
                                value={editFormData.cell_number || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, cell_number: e.target.value })}
                                placeholder="Cell Number"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <input
                                type="tel"
                                value={editFormData.home_phone_number || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, home_phone_number: e.target.value })}
                                placeholder="Home Phone"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <input
                                type="tel"
                                value={editFormData.work_number || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, work_number: e.target.value })}
                                placeholder="Work Number"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>

                            {/* Address Information */}
                            <div className="space-y-4 md:col-span-2">
                              <h4 className="font-medium text-gray-900">Address Information</h4>
                              <input
                                type="text"
                                value={editFormData.address || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                                placeholder="Street Address"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <div className="grid grid-cols-3 gap-4">
                                <input
                                  type="text"
                                  value={editFormData.city || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                                  placeholder="City"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={editFormData.state || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                                  placeholder="State"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={editFormData.zip || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, zip: e.target.value })}
                                  placeholder="ZIP"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            {/* Business Information */}
                            <div className="space-y-4 md:col-span-2">
                              <h4 className="font-medium text-gray-900">Business Information</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <select
                                  value={editFormData.customer_type || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, customer_type: e.target.value })}
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                  <option value="">Customer Type</option>
                                  <option value="Individual">Individual</option>
                                  <option value="Business">Business</option>
                                  <option value="Family">Family</option>
                                </select>
                                <select
                                  value={editFormData.account_type || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, account_type: e.target.value })}
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                  <option value="">Account Type</option>
                                  <option value="Standard">Standard</option>
                                  <option value="Premium">Premium</option>
                                  <option value="VIP">VIP</option>
                                </select>
                                <select
                                  value={editFormData.contact_status || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, contact_status: e.target.value })}
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                  <option value="">Contact Status</option>
                                  <option value="Active">Active</option>
                                  <option value="Inactive">Inactive</option>
                                  <option value="Prospect">Prospect</option>
                                  <option value="Lead">Lead</option>
                                </select>
                                <input
                                  type="text"
                                  value={editFormData.customer_agent_of_record || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, customer_agent_of_record: e.target.value })}
                                  placeholder="Agent of Record"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={editFormData.customer_csr || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, customer_csr: e.target.value })}
                                  placeholder="CSR"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={editFormData.office || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, office: e.target.value })}
                                  placeholder="Office"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={editFormData.source || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value })}
                                  placeholder="Source"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={editFormData.keyed_by || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, keyed_by: e.target.value })}
                                  placeholder="Keyed By"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            {/* Notes */}
                            <div className="md:col-span-2">
                              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                              <textarea
                                value={editFormData.notes || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                placeholder="Additional notes..."
                                rows={3}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>

                            <div className="md:col-span-2 flex justify-end space-x-3">
                              <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveContact}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information Display */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                              <div className="space-y-2">
                                <p><span className="font-medium">Name:</span> {contactDetails?.first_name} {contactDetails?.last_name}</p>
                                <p><span className="font-medium">Date of Birth:</span> {contactDetails?.date_of_birth ? new Date(contactDetails.date_of_birth).toLocaleDateString() : 'Not provided'}</p>
                                {contactDetails?.date_of_birth && (
                                  <p><span className="font-medium">Age:</span> {calculateAge(contactDetails.date_of_birth)} years</p>
                                )}
                                <p><span className="font-medium">Gender:</span> {contactDetails?.gender || 'Not provided'}</p>
                                <p><span className="font-medium">Marital Status:</span> {contactDetails?.marital_status || 'Not provided'}</p>
                                <p><span className="font-medium">Language:</span> {contactDetails?.language || 'Not provided'}</p>
                                <p><span className="font-medium">SSN/Tax ID:</span> {contactDetails?.ssn_tax_id ? '***-**-****' : 'Not provided'}</p>
                              </div>
                            </div>

                            {/* Contact Information Display */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                              <div className="space-y-2">
                                <p><span className="font-medium">Email:</span> {contactDetails?.email || 'Not provided'}</p>
                                <p><span className="font-medium">Primary Phone:</span> {contactDetails?.phone || 'Not provided'}</p>
                                <p><span className="font-medium">Cell Number:</span> {contactDetails?.cell_number || 'Not provided'}</p>
                                <p><span className="font-medium">Home Phone:</span> {contactDetails?.home_phone_number || 'Not provided'}</p>
                                <p><span className="font-medium">Work Number:</span> {contactDetails?.work_number || 'Not provided'}</p>
                              </div>
                            </div>

                            {/* Address Information Display */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-3">Address</h4>
                              <div className="space-y-2">
                                <p><span className="font-medium">Address:</span> {contactDetails?.address || 'Not provided'}</p>
                                <p><span className="font-medium">City:</span> {contactDetails?.city || 'Not provided'}</p>
                                <p><span className="font-medium">State:</span> {contactDetails?.state || 'Not provided'}</p>
                                <p><span className="font-medium">ZIP:</span> {contactDetails?.zip || 'Not provided'}</p>
                              </div>
                            </div>

                            {/* Business Information Display */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-3">Business Information</h4>
                              <div className="space-y-2">
                                <p><span className="font-medium">Customer Type:</span> {contactDetails?.customer_type || 'Not provided'}</p>
                                <p><span className="font-medium">Account Type:</span> {contactDetails?.account_type || 'Not provided'}</p>
                                <p><span className="font-medium">Status:</span> {contactDetails?.contact_status || 'Not provided'}</p>
                                <p><span className="font-medium">Agent of Record:</span> {contactDetails?.customer_agent_of_record || 'Not provided'}</p>
                                <p><span className="font-medium">CSR:</span> {contactDetails?.customer_csr || 'Not provided'}</p>
                                <p><span className="font-medium">Office:</span> {contactDetails?.office || 'Not provided'}</p>
                                <p><span className="font-medium">Source:</span> {contactDetails?.source || 'Not provided'}</p>
                                <p><span className="font-medium">Keyed By:</span> {contactDetails?.keyed_by || 'Not provided'}</p>
                              </div>
                            </div>

                            {/* Notes Display */}
                            {contactDetails?.notes && (
                              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                                <p className="text-gray-600">{contactDetails.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Tab.Panel>

                    {/* History Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        {/* Add Note Form */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Note</h3>
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={noteTitle}
                              onChange={(e) => setNoteTitle(e.target.value)}
                              placeholder="Note title..."
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <ReactQuill
                              value={noteContent}
                              onChange={setNoteContent}
                              className="h-32 mb-12"
                              placeholder="Enter note content..."
                            />
                            <div className="flex items-center justify-between">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={isActionItem}
                                  onChange={(e) => setIsActionItem(e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Mark as action item</span>
                              </label>
                              <button
                                onClick={handleSaveNote}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Save Note
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Add Phone Call Form */}
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Phone Call</h3>
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={callTitle}
                              onChange={(e) => setCallTitle(e.target.value)}
                              placeholder="Call summary..."
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <ReactQuill
                              value={callContent}
                              onChange={setCallContent}
                              className="h-32 mb-12"
                              placeholder="Enter call details..."
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={handleSavePhoneCall}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                              >
                                Log Call
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* History Timeline */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact History</h3>
                          {historyItems.length > 0 ? (
                            <div className="space-y-4">
                              {historyItems.map((item) => (
                                <div key={`${item.type}-${item.id}`} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                      <div className="text-2xl">{item.icon}</div>
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                            {item.type}
                                          </span>
                                        </div>
                                        <div 
                                          className="text-sm text-gray-600 mb-2"
                                          dangerouslySetInnerHTML={{ 
                                            __html: item.content?.length > 200 
                                              ? `${item.content.slice(0, 200)}...` 
                                              : item.content 
                                          }}
                                        />
                                        <div className="flex items-center text-xs text-gray-500">
                                          <FiClock className="mr-1" />
                                          {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}
                                          {item.direction && (
                                            <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full">
                                              {item.direction === 'outgoing' ? 'Sent' : 'Received'}
                                            </span>
                                          )}
                                          {item.status && (
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                              item.status === 'completed' ? 'bg-green-100 text-green-800' :
                                              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-gray-100 text-gray-600'
                                            }`}>
                                              {item.status}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <FiFileText className="mx-auto h-12 w-12 mb-4" />
                              <p>No history items found for this contact.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Tab.Panel>

                    {/* Household Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        {/* Spouse Information */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spouse Information</h3>
                          {isEditing ? (
                            <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={editFormData.spouse_first_name || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, spouse_first_name: e.target.value })}
                                placeholder="Spouse First Name"
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                value={editFormData.spouse_last_name || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, spouse_last_name: e.target.value })}
                                placeholder="Spouse Last Name"
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <input
                                type="email"
                                value={editFormData.spouse_email || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, spouse_email: e.target.value })}
                                placeholder="Spouse Email"
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <input
                                type="tel"
                                value={editFormData.spouse_phone || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, spouse_phone: e.target.value })}
                                placeholder="Spouse Phone"
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <input
                                type="date"
                                value={editFormData.spouse_date_of_birth || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, spouse_date_of_birth: e.target.value })}
                                placeholder="Spouse Date of Birth"
                                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          ) : (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              {(contactDetails?.spouse_first_name || contactDetails?.spouse_last_name) ? (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{contactDetails.spouse_first_name} {contactDetails.spouse_last_name}</p>
                                  </div>
                                  {contactDetails.spouse_date_of_birth && (
                                    <div>
                                      <p className="text-sm text-gray-500">Date of Birth</p>
                                      <p className="font-medium">
                                        {new Date(contactDetails.spouse_date_of_birth).toLocaleDateString()}
                                        {calculateAge(contactDetails.spouse_date_of_birth) && (
                                          <span className="text-gray-500 ml-2">
                                            (Age {calculateAge(contactDetails.spouse_date_of_birth)})
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  )}
                                  {contactDetails.spouse_email && (
                                    <div>
                                      <p className="text-sm text-gray-500">Email</p>
                                      <a
                                        href={`mailto:${contactDetails.spouse_email}`}
                                        className="font-medium text-blue-600 hover:text-blue-800"
                                      >
                                        {contactDetails.spouse_email}
                                      </a>
                                    </div>
                                  )}
                                  {contactDetails.spouse_phone && (
                                    <div>
                                      <p className="text-sm text-gray-500">Phone</p>
                                      <a
                                        href={`tel:${contactDetails.spouse_phone}`}
                                        className="font-medium text-blue-600 hover:text-blue-800"
                                      >
                                        {contactDetails.spouse_phone}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-500">No spouse information provided</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Household Members */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Family Members</h3>
                            <button
                              onClick={() => setIsAddingMember(true)}
                              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                              <FiPlus className="mr-2" />
                              Add Member
                            </button>
                          </div>

                          {/* Add Member Form */}
                          {isAddingMember && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                              <h4 className="font-medium text-gray-900 mb-3">Add Family Member</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <input
                                  type="text"
                                  value={newMember.first_name}
                                  onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
                                  placeholder="First Name"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                  type="text"
                                  value={newMember.last_name}
                                  onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
                                  placeholder="Last Name"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <select
                                  value={newMember.relationship}
                                  onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                  <option value="child">Child</option>
                                  <option value="parent">Parent</option>
                                  <option value="sibling">Sibling</option>
                                  <option value="other">Other</option>
                                </select>
                                <input
                                  type="date"
                                  value={newMember.date_of_birth}
                                  onChange={(e) => setNewMember({ ...newMember, date_of_birth: e.target.value })}
                                  placeholder="Date of Birth"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                  type="email"
                                  value={newMember.email}
                                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                  placeholder="Email"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                  type="tel"
                                  value={newMember.phone}
                                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                  placeholder="Phone"
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div className="mt-4">
                                <textarea
                                  value={newMember.notes}
                                  onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                                  placeholder="Notes"
                                  rows={2}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                              <div className="flex justify-end space-x-3 mt-4">
                                <button
                                  onClick={() => setIsAddingMember(false)}
                                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleAddHouseholdMember}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                  Add Member
                                </button>
                              </div>
                            </div>
                          )}

                          {householdMembers.length > 0 ? (
                            <div className="space-y-4">
                              {householdMembers.map((member) => (
                                <div key={member.id} className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                        <FiUser className="text-blue-600" />
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-900">
                                          {member.first_name} {member.last_name}
                                        </h4>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRelationshipColor(member.relationship)}`}>
                                            {member.relationship?.charAt(0).toUpperCase() + member.relationship?.slice(1)}
                                          </span>
                                          {member.date_of_birth && (
                                            <span className="text-sm text-gray-500">
                                              Age {calculateAge(member.date_of_birth)}
                                            </span>
                                          )}
                                        </div>
                                        {(member.email || member.phone) && (
                                          <div className="mt-2 space-y-1">
                                            {member.email && (
                                              <p className="text-sm text-gray-600">📧 {member.email}</p>
                                            )}
                                            {member.phone && (
                                              <p className="text-sm text-gray-600">📱 {member.phone}</p>
                                            )}
                                          </div>
                                        )}
                                        {member.notes && (
                                          <p className="text-sm text-gray-500 mt-2">{member.notes}</p>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteHouseholdMember(member.id)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <FiTrash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <FiUser className="mx-auto h-12 w-12 mb-4" />
                              <p>No family members added yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Tab.Panel>

                    {/* Companies Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Company Connections</h3>
                        {companies.length > 0 ? (
                          <div className="space-y-4">
                            {companies.map((connection) => (
                              <div key={connection.companies.id} className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{connection.companies.name}</h4>
                                    <p className="text-sm text-gray-600 capitalize">{connection.relationship_type}</p>
                                    {connection.companies.industry && (
                                      <p className="text-sm text-gray-500">{connection.companies.industry}</p>
                                    )}
                                    {connection.companies.address && (
                                      <p className="text-sm text-gray-500 mt-2">{connection.companies.address}</p>
                                    )}
                                    <div className="flex items-center space-x-4 mt-2">
                                      {connection.companies.email && (
                                        <a
                                          href={`mailto:${connection.companies.email}`}
                                          className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                          📧 {connection.companies.email}
                                        </a>
                                      )}
                                      {connection.companies.phone && (
                                        <a
                                          href={`tel:${connection.companies.phone}`}
                                          className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                          📱 {connection.companies.phone}
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl">🏢</span>
                            </div>
                            <p>No company connections found.</p>
                          </div>
                        )}
                      </div>
                    </Tab.Panel>

                    {/* Policies Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-900">Policies & Documents</h3>
                          <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                            <FiUpload className="mr-2" />
                            {uploadingDocument ? 'Uploading...' : 'Upload Document'}
                            <input
                              type="file"
                              onChange={handleDocumentUpload}
                              accept=".pdf,.doc,.docx,.txt,.accord,.jpg,.jpeg,.png,.gif"
                              className="hidden"
                              disabled={uploadingDocument}
                            />
                          </label>
                        </div>

                        {/* Policy Records */}
                        {policies.length > 0 && (
                          <div>
                            <h4 className="text-md font-semibold text-gray-900 mb-3">Policy Records</h4>
                            <div className="space-y-3">
                              {policies.map((policy) => (
                                <div key={policy.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h5 className="font-medium text-gray-900">{policy.policy_type} Policy</h5>
                                      <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                        <p><span className="font-medium">Company:</span> {policy.company}</p>
                                        <p><span className="font-medium">Policy #:</span> {policy.policy_number}</p>
                                        <p><span className="font-medium">Effective:</span> {policy.effective_date ? new Date(policy.effective_date).toLocaleDateString() : 'N/A'}</p>
                                        <p><span className="font-medium">Expires:</span> {policy.expiration_date ? new Date(policy.expiration_date).toLocaleDateString() : 'N/A'}</p>
                                        {policy.premium && (
                                          <p><span className="font-medium">Premium:</span> ${policy.premium.toLocaleString()}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Policy Documents */}
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-3">Documents</h4>
                          {policyDocuments.length > 0 ? (
                            <div className="space-y-4">
                              {policyDocuments.map((document) => (
                                <div key={document.id} className="bg-gray-50 p-4 rounded-lg border">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <span className="text-2xl">{getFileTypeIcon(document.file_name)}</span>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-900">{document.file_name}</h4>
                                        <p className="text-sm text-gray-500">{getFileTypeLabel(document.file_name)}</p>
                                        <p className="text-sm text-gray-500">
                                          {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : ''} • 
                                          Uploaded {new Date(document.created_at).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <a
                                        href={document.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded-md text-sm"
                                      >
                                        <FiEye className="mr-1" />
                                        View
                                      </a>
                                      <a
                                        href={document.file_url}
                                        download={document.file_name}
                                        className="flex items-center text-green-600 hover:text-green-800 px-3 py-1 border border-green-600 rounded-md text-sm"
                                      >
                                        <FiDownload className="mr-1" />
                                        Download
                                      </a>
                                      <button
                                        onClick={() => handleDeleteDocument(document.id)}
                                        className="flex items-center text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded-md text-sm"
                                      >
                                        <FiTrash2 className="mr-1" />
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📄</span>
                              </div>
                              <p>No policy documents uploaded yet.</p>
                              <p className="text-sm mt-2">Upload PDF, Word, Accord, text files, or images related to this contact's policies.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <ScheduleMeetingModal
        isOpen={isScheduleMeetingOpen}
        onClose={() => setIsScheduleMeetingOpen(false)}
        contact={contactDetails}
        onMeetingScheduled={() => {
          setIsScheduleMeetingOpen(false);
          // Optionally refresh contact data or show success message
        }}
      />

      <ScheduleMeetingModal
        isOpen={isScheduleMeetingModalOpen}
        onClose={() => setIsScheduleMeetingModalOpen(false)}
        contact={contact}
        onMeetingScheduled={onMeetingScheduled}
      />
    </>
  );
}

export default FocusedViewModal;