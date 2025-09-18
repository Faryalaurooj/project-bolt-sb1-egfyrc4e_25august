import React, { useState, useEffect } from 'react';
import { Dialog, Tab } from '@headlessui/react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiFileText, FiPlus, FiEdit2, FiTrash2, FiMessageSquare, FiSend, FiClock, FiDownload, FiUpload } from 'react-icons/fi';
import { format } from 'date-fns';
import { 
  getContactById, 
  updateContact, 
  deleteContact,
  createNote, 
  createPhoneCall,
  getPhoneCallsByContactId,
  getTextMessagesForContact,
  createTextMessage,
  getPoliciesByContactId,
  createPolicy,
  getHouseholdMembers,
  getPolicyDocumentsByContactId,
  createPolicyDocument,
  deletePolicyDocument,
  createCalendarEvent
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { sendOutlookEmail } from '../../services/outlookSync';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AddEventModal from '../common/AddEventModal';
import MakeCallModal from '../calls/MakeCallModal';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function FocusedViewModal({ isOpen, onClose, contact, onNoteSaved, onActionItemSaved, onPhoneCallSaved }) {
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
  
  // Data states
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [policyDocuments, setPolicyDocuments] = useState([]);
  const [phoneCalls, setPhoneCalls] = useState([]);
  const [textMessages, setTextMessages] = useState([]);
  const [policies, setPolicies] = useState([]);
  
  // Modal states
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isMakeCallModalOpen, setIsMakeCallModalOpen] = useState(false);
  const [selectedEventDate, setSelectedEventDate] = useState(new Date());
  const [uploadingDocument, setUploadingDocument] = useState(false);
  
  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isActionItem, setIsActionItem] = useState(false);
  
  // Phone call form state
  const [callTitle, setCallTitle] = useState('');
  const [callContent, setCallContent] = useState('');
  
  // Text message state
  const [textMessage, setTextMessage] = useState('');
  const [sendingText, setSendingText] = useState(false);
  
  // Policy state
  const [newPolicy, setNewPolicy] = useState({
    policy_type: '',
    company: '',
    policy_number: '',
    effective_date: null,
    expiration_date: null,
    premium: ''
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({});
      console.log('🔍 FocusedViewModal: Starting to fetch contact details...');

  useEffect(() => {
    console.log('🔍 FocusedViewModal: useEffect triggered with contact:', contact?.id);
    if (isOpen && contact) {
      fetchAllContactData();
    console.log('🔍 FocusedViewModal: fetchContactDetails started for contact ID:', contact?.id);
    }
      console.log('🔍 FocusedViewModal: No contact ID provided, skipping fetch');
  }, [isOpen, contact]);

  const fetchAllContactData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 FocusedViewModal: Setting loading to true, starting API calls...');
      
      const [
        contactDetails,
        householdData,
        policyDocsData,
        phoneCallsData,
        textMessagesData,
        policiesData
      ] = await Promise.all([
        getContactById(contact.id),
        getHouseholdMembers(contact.id),
        getPolicyDocumentsByContactId(contact.id),
        getPhoneCallsByContactId(contact.id),
        getTextMessagesForContact(contact.id),
        getPoliciesByContactId(contact.id)
      ]);
      
      console.log('🔍 FocusedViewModal: API calls completed, data received:', {
        contactData: !!contactData,
        householdCount: householdData?.length || 0,
        companiesCount: companiesData?.length || 0,
        documentsCount: documentsData?.length || 0,
        phoneCallsCount: phoneCallsData?.length || 0,
        textMessagesCount: textMessagesData?.length || 0
      });

      setContactData(contactDetails);
      setEditFormData(contactDetails);
      setHouseholdMembers(householdData || []);
      setPolicyDocuments(policyDocsData || []);
      setPhoneCalls(phoneCallsData || []);
      setTextMessages(textMessagesData || []);
      setPolicies(policiesData || []);
    } catch (err) {

      console.log('🔍 FocusedViewModal: All state updated successfully');
      console.error('Error fetching contact data:', err);
      console.error('🔍 FocusedViewModal: Error in fetchContactDetails:', err);
      setError('Failed to load contact details');
    } finally {
      setLoading(false);
      console.log('🔍 FocusedViewModal: Loading set to false');
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      alert('Please enter both title and content');
      return;
    }

    try {
      await createNote({
        title: noteTitle,
        content: noteContent,
        contact_id: contact.id,
        is_action_item: isActionItem,
        status: isActionItem ? 'pending' : null,
        visibility: 'all employees'
      });

      setNoteTitle('');
      setNoteContent('');
      setIsActionItem(false);
      
      if (onNoteSaved) onNoteSaved();
      if (isActionItem && onActionItemSaved) onActionItemSaved();
      
      alert('Note saved successfully!');
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note');
    }
  };

  const handleSavePhoneCall = async () => {
    if (!callTitle.trim() || !callContent.trim()) {
      alert('Please enter both title and content');
      return;
    }

    try {
      await createPhoneCall({
        title: callTitle,
        content: callContent,
        contact_id: contact.id,
        visibility: 'all employees'
      });

      setCallTitle('');
      setCallContent('');
      
      if (onPhoneCallSaved) onPhoneCallSaved();
      await fetchAllContactData(); // Refresh data
      
      alert('Phone call logged successfully!');
    } catch (err) {
      console.error('Error saving phone call:', err);
      alert('Failed to log phone call');
    }
  };

  const handleSendText = async () => {
    if (!textMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    if (!user?.contact_number) {
      alert('Your phone number is not set. Please update your profile.');
      return;
    }

    if (!contactData?.phone && !contactData?.cell_number) {
      alert('This contact does not have a phone number.');
      return;
    }

    if (contactData?.do_not_contact) {
      alert('This contact has opted out of text messages.');
      return;
    }

    try {
      setSendingText(true);
      console.log('📱 FocusedViewModal: Sending text to contact:', contactData.first_name, contactData.last_name);

      const messageData = {
        contact_id: contactData.id,
        sender_phone: user.contact_number,
        recipient_phone: contactData.phone || contactData.cell_number,
        content: textMessage,
        direction: 'outgoing',
        status: 'pending',
        sent_at: new Date().toISOString()
      };

      await createTextMessage(messageData);
      
      // Refresh text messages
      const updatedMessages = await getTextMessagesForContact(contactData.id);
      setTextMessages(updatedMessages || []);
      
      setTextMessage('');
      alert('Text message sent successfully!');
    } catch (err) {
      console.error('Error sending text:', err);
      alert(`Failed to send text: ${err.message}`);
    } finally {
      setSendingText(false);
    }
  };

  const handleSendEmail = () => {
    if (contactData?.email) {
      const subject = `Regarding your account - ${contactData.first_name} ${contactData.last_name}`;
      const body = `Hello ${contactData.first_name},\n\nI hope this email finds you well.\n\nBest regards,\n${user?.first_name || user?.email}`;
      
      sendOutlookEmail(contactData.email, subject, body).catch(() => {
        window.location.href = `mailto:${contactData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      });
    } else {
      alert('This contact does not have an email address.');
    }
  };

  const handleScheduleCall = () => {
    setSelectedEventDate(new Date());
    setIsAddEventModalOpen(true);
  };

  const handleMakeCall = () => {
    setIsMakeCallModalOpen(true);
  };

  const handleSavePolicy = async () => {
    if (!newPolicy.policy_type || !newPolicy.company) {
      alert('Please enter at least policy type and company');
      return;
    }

    try {
      await createPolicy({
        ...newPolicy,
        contact_id: contact.id,
        premium: newPolicy.premium ? parseFloat(newPolicy.premium) : null
      });

      setNewPolicy({
        policy_type: '',
        company: '',
        policy_number: '',
        effective_date: null,
        expiration_date: null,
        premium: ''
      });
      
      await fetchAllContactData();
      alert('Policy saved successfully!');
    } catch (err) {
      console.error('Error saving policy:', err);
      alert('Failed to save policy');
    }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingDocument(true);
      await createPolicyDocument(contact.id, file);
      await fetchAllContactData(); // Refresh data
      alert('Document uploaded successfully!');
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deletePolicyDocument(documentId);
        await fetchAllContactData(); // Refresh data
        alert('Document deleted successfully!');
      console.log('🔍 FocusedViewModal: Uploading document:', file.name);
      } catch (err) {
        console.error('Error deleting document:', err);
      console.log('🔍 FocusedViewModal: Document uploaded successfully');
        alert('Failed to delete document');
      console.error('🔍 FocusedViewModal: Error uploading document:', err);
      }
    }
  };

  const handleDeleteContact = async () => {
    if (window.confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      try {
    console.log('🔍 FocusedViewModal: handleDeleteDocument called for:', documentId);
        await deleteContact(contact.id);
        alert('Contact deleted successfully!');
        onClose();
        if (onNoteSaved) onNoteSaved(); // Trigger refresh in parent
        console.log('🔍 FocusedViewModal: Document deleted successfully');
      } catch (err) {
        console.error('🔍 FocusedViewModal: Error deleting document:', err);
        console.error('Error deleting contact:', err);
        alert('Failed to delete contact');
      }
    }
  };

    console.log('🔍 FocusedViewModal: handleScheduleCall called');
    console.log('🔍 FocusedViewModal: handleSave called with data:', editedContact);
  const handleSaveEdit = async () => {
    try {
    console.log('🔍 FocusedViewModal: handleDelete called for contact:', contact?.id);
      await updateContact(contact.id, editFormData);
    console.log('🔍 FocusedViewModal: handleSendEmail called for:', contactDetails?.email);
      setContactData(editFormData);
      setIsEditing(false);
        console.log('🔍 FocusedViewModal: Contact deleted successfully');
      console.log('🔍 FocusedViewModal: Contact updated successfully');
      alert('Contact updated successfully!');
        console.error('🔍 FocusedViewModal: Error deleting contact:', err);
      if (onNoteSaved) onNoteSaved(); // Trigger refresh in parent
    } catch (err) {
      console.error('🔍 FocusedViewModal: Error updating contact:', err);
      console.error('Error updating contact:', err);
      alert('Failed to update contact');
    }
    console.log('🔍 FocusedViewModal: handleMakeCall called');
    console.log('🔍 FocusedViewModal: handleDocumentUpload called');
  };

  const handleAddEvent = async (eventText, eventDate) => {
    console.log('🔍 FocusedViewModal: handleEventSave called:', { eventText, eventDate });
    try {
      const eventData = {
        event_text: `Call with ${contactData.first_name} ${contactData.last_name}: ${eventText}`,
        event_date: eventDate.toISOString().split('T')[0],
        color: '#10B981' // Green color for contact calls
      };
      
      await createCalendarEvent(eventData);
      console.log('🔍 FocusedViewModal: Calendar event created successfully');
      setIsAddEventModalOpen(false);
      alert('Call scheduled successfully! Check your dashboard calendar.');
    } catch (error) {
      console.error('🔍 FocusedViewModal: Error creating calendar event:', error);
      console.error('Error scheduling call:', error);
      alert('Failed to schedule call. Please try again.');
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

  console.log('🔍 FocusedViewModal: About to render, current state:', {
    isOpen,
    loading,
    error,
    hasContactDetails: !!contactDetails,
    isEditing
  });

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
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[relationship] || colors.other;
  };

  if (!contact) return null;

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white w-full max-w-7xl mx-4 rounded-lg shadow-xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-blue-600">
                    {contactData?.first_name?.[0]}{contactData?.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <Dialog.Title className="text-2xl font-semibold text-gray-900">
                    {contactData?.first_name} {contactData?.last_name}
                  </Dialog.Title>
                  <div className="flex items-center space-x-4 mt-2">
                    {contactData?.email && (
                      <span className="text-blue-600 text-sm">
                        <FiMail className="inline mr-1" />
                        {contactData.email}
                      </span>
                    )}
                    {(contactData?.phone || contactData?.cell_number) && (
                      <span className="text-blue-600 text-sm">
                        <FiPhone className="inline mr-1" />
                        {contactData.phone || contactData.cell_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <FiEdit2 className="mr-2" />
                  {isEditing ? 'Cancel Edit' : 'Edit'}
                </button>
                <button
                  onClick={handleDeleteContact}
                  className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  <FiTrash2 className="mr-2" />
                  Delete
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                  <p className="text-gray-600 ml-2">Loading contact details...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchAllContactData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && (
                <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                  <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
                    {['Overview', 'Communication', 'Family', 'Policies'].map((category, idx) => (
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

                  <Tab.Panels>
                    {/* Overview Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button
                              onClick={handleSendEmail}
                              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              <FiMail className="mr-2" />
                              Send Email
                            </button>
                            <button
                              onClick={() => setActiveTab(1)}
                              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                            >
                              <FiMessageSquare className="mr-2" />
                              Send Text
                            </button>
                            <button
                              onClick={handleMakeCall}
                              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              <FiPhone className="mr-2" />
                              Make Call
                            </button>
                            <button
                              onClick={handleScheduleCall}
                              className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                            >
                              <FiCalendar className="mr-2" />
                              Schedule Call
                            </button>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white border rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                            {isEditing ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                      type="text"
                                      value={editFormData.first_name || ''}
                                      onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                      type="text"
                                      value={editFormData.last_name || ''}
                                      onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Email</label>
                                  <input
                                    type="email"
                                    value={editFormData.email || ''}
                                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                                  <input
                                    type="tel"
                                    value={editFormData.phone || ''}
                                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                  <input
                                    type="date"
                                    value={editFormData.date_of_birth || ''}
                                    onChange={(e) => setEditFormData({...editFormData, date_of_birth: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  />
                                </div>
                                <div className="flex justify-end space-x-3">
                                  <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleSaveEdit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                  >
                                    Save Changes
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center">
                                  <FiMail className="mr-2 text-gray-400" />
                                  <span>{contactData?.email || 'No email'}</span>
                                </div>
                                <div className="flex items-center">
                                  <FiPhone className="mr-2 text-gray-400" />
                                  <span>{contactData?.phone || contactData?.cell_number || 'No phone'}</span>
                                </div>
                                <div className="flex items-center">
                                  <FiMapPin className="mr-2 text-gray-400" />
                                  <span>
                                    {contactData?.address ? 
                                      `${contactData.address}, ${contactData.city || ''} ${contactData.state || ''} ${contactData.zip || ''}`.trim() :
                                      'No address'
                                    }
                                  </span>
                                </div>
                                {contactData?.date_of_birth && (
                                  <div className="flex items-center">
                                    <FiCalendar className="mr-2 text-gray-400" />
                                    <span>
                                      Born: {new Date(contactData.date_of_birth).toLocaleDateString()}
                                      {calculateAge(contactData.date_of_birth) && (
                                        <span className="text-gray-500 ml-2">
                                          (Age {calculateAge(contactData.date_of_birth)})
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                )}
                                {contactData?.marital_status && (
                                  <div><strong>Marital Status:</strong> {contactData.marital_status}</div>
                                )}
                                {contactData?.gender && (
                                  <div><strong>Gender:</strong> {contactData.gender}</div>
                                )}
                                {contactData?.language && (
                                  <div><strong>Language:</strong> {contactData.language}</div>
                                )}
                                {contactData?.customer_type && (
                                  <div><strong>Customer Type:</strong> {contactData.customer_type}</div>
                                )}
                                {contactData?.contact_status && (
                                  <div><strong>Status:</strong> {contactData.contact_status}</div>
                                )}
                                {contactData?.source && (
                                  <div><strong>Source:</strong> {contactData.source}</div>
                                )}
                                {contactData?.created_at && (
                                  <div><strong>Client Since:</strong> {new Date(contactData.created_at).toLocaleDateString()}</div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Spouse Information */}
                          {(contactData?.spouse_first_name || contactData?.spouse_last_name) && (
                            <div className="bg-white border rounded-lg p-4">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spouse Information</h3>
                              <div className="space-y-2">
                                <div><strong>Name:</strong> {contactData.spouse_first_name} {contactData.spouse_last_name}</div>
                                {contactData.spouse_email && (
                                  <div><strong>Email:</strong> {contactData.spouse_email}</div>
                                )}
                                {contactData.spouse_phone && (
                                  <div><strong>Phone:</strong> {contactData.spouse_phone}</div>
                                )}
                                {contactData.spouse_date_of_birth && (
                                  <div>
                                    <strong>Date of Birth:</strong> {new Date(contactData.spouse_date_of_birth).toLocaleDateString()}
                                    {calculateAge(contactData.spouse_date_of_birth) && (
                                      <span className="text-gray-500 ml-2">
                                        (Age {calculateAge(contactData.spouse_date_of_birth)})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Notes Section */}
                        {contactData?.notes && (
                          <div className="bg-white border rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                            <p className="text-gray-600">{contactData.notes}</p>
                          </div>
                        )}
                      </div>
                    </Tab.Panel>

                    {/* Communication Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        {/* Add Note Section */}
                        <div className="bg-white border rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Note</h3>
                          <form onSubmit={(e) => { e.preventDefault(); handleSaveNote(); }}>
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
                                  type="submit"
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                  Save Note
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>

                        {/* Log Phone Call Section */}
                        <div className="bg-white border rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Phone Call</h3>
                          <form onSubmit={(e) => { e.preventDefault(); handleSavePhoneCall(); }}>
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
                                  type="submit"
                                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                  Log Phone Call
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>

                        {/* Text Messages Section */}
                        <div className="bg-white border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Text Messages</h3>
                            <span className="text-sm text-gray-500">
                              {textMessages.length} message{textMessages.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Message History */}
                          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto mb-4">
                            {textMessages.length === 0 ? (
                              <div className="text-center text-gray-500 py-8">
                                <FiMessageSquare className="mx-auto h-8 w-8 mb-2" />
                                <p>No text messages yet</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {textMessages.map((msg) => (
                                  <div
                                    key={msg.id}
                                    className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                                  >
                                    <div
                                      className={`max-w-xs px-4 py-2 rounded-lg ${
                                        msg.direction === 'outgoing'
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-white text-gray-900 border'
                                      }`}
                                    >
                                      <p className="text-sm">{msg.content || msg.message_text}</p>
                                      <div className="flex items-center justify-between mt-1">
                                        <p className={`text-xs ${
                                          msg.direction === 'outgoing' ? 'text-blue-100' : 'text-gray-500'
                                        }`}>
                                          {formatMessageTime(msg.sent_at || msg.created_at)}
                                        </p>
                                        {msg.direction === 'outgoing' && (
                                          <span className={`text-xs ml-2 ${
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

                          {/* Send New Message */}
                          <div className="flex space-x-4">
                            <input
                              type="text"
                              value={textMessage}
                              onChange={(e) => setTextMessage(e.target.value)}
                              placeholder={`Send a text to ${contactData?.first_name}...`}
                              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendText();
                                }
                              }}
                              disabled={sendingText || contactData?.do_not_contact}
                            />
                            <button
                              onClick={handleSendText}
                              disabled={sendingText || !textMessage.trim() || contactData?.do_not_contact}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              <FiSend className="mr-2" />
                              {sendingText ? 'Sending...' : 'Send'}
                            </button>
                          </div>
                          {contactData?.do_not_contact && (
                            <p className="text-sm text-red-600 mt-2">
                              This contact has opted out of text messages.
                            </p>
                          )}
                        </div>

                        {/* Call History Section */}
                        <div className="bg-white border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Call History</h3>
                            <span className="text-sm text-gray-500">
                              {phoneCalls.length} call{phoneCalls.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="space-y-3 max-h-80 overflow-y-auto">
                            {phoneCalls.length === 0 ? (
                              <div className="text-center text-gray-500 py-8">
                                <FiPhone className="mx-auto h-8 w-8 mb-2" />
                                <p>No phone calls logged yet</p>
                              </div>
                            ) : (
                              phoneCalls.map((call) => (
                                <div key={call.id} className="bg-gray-50 p-4 rounded-lg border">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-medium text-gray-900">{call.title}</h4>
                                      <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <FiClock className="mr-1" />
                                        <span>{format(new Date(call.created_at), 'MMM d, yyyy h:mm a')}</span>
                                      </div>
                                    </div>
                                    {call.is_action_item && (
                                      <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                        Action Item
                                      </span>
                                    )}
                                  </div>
                                  <div 
                                    className="text-sm text-gray-600 max-h-20 overflow-y-auto"
                                    dangerouslySetInnerHTML={{ 
                                      __html: call.content?.length > 200 
                                        ? `${call.content.slice(0, 200)}...` 
                                        : call.content 
                                    }}
                                  />
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </Tab.Panel>

                    {/* Family Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        {/* Spouse Information */}
                        {(contactData?.spouse_first_name || contactData?.spouse_last_name) && (
                          <div className="bg-white border rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spouse Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Name</p>
                                  <p className="font-medium">{contactData.spouse_first_name} {contactData.spouse_last_name}</p>
                                </div>
                                {contactData.spouse_date_of_birth && (
                                  <div>
                                    <p className="text-sm text-gray-500">Date of Birth</p>
                                    <p className="font-medium">
                                      {new Date(contactData.spouse_date_of_birth).toLocaleDateString()}
                                      {calculateAge(contactData.spouse_date_of_birth) && (
                                        <span className="text-gray-500 ml-2">
                                          (Age {calculateAge(contactData.spouse_date_of_birth)})
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                )}
                                {contactData.spouse_email && (
                                  <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <a
                                      href={`mailto:${contactData.spouse_email}`}
                                      className="font-medium text-blue-600 hover:text-blue-800"
                                    >
                                      {contactData.spouse_email}
                                    </a>
                                  </div>
                                )}
                                {contactData.spouse_phone && (
                                  <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <a
                                      href={`tel:${contactData.spouse_phone}`}
                                      className="font-medium text-blue-600 hover:text-blue-800"
                                    >
                                      {contactData.spouse_phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Household Members */}
                        <div className="bg-white border rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Members</h3>
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
                    {console.log('🔍 FocusedViewModal: Rendering Communication tab')}
                                        <div className="flex items-center space-x-2 mt-1">
                                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRelationshipColor(member.relationship)}`}>
                                            {member.relationship.charAt(0).toUpperCase() + member.relationship.slice(1)}
                                          </span>
                                          {member.date_of_birth && (
                                            <span className="text-sm text-gray-500">
                                              Age {calculateAge(member.date_of_birth)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {(member.email || member.phone || member.notes) && (
                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {member.email && (
                                        <div>
                                          <p className="text-sm text-gray-500">Email</p>
                                          <a
                                            href={`mailto:${member.email}`}
                                            className="text-blue-600 hover:text-blue-800"
                                          >
                                            {member.email}
                                          </a>
                                        </div>
                                      )}
                                      {member.phone && (
                                        <div>
                                          <p className="text-sm text-gray-500">Phone</p>
                                          <a
                                            href={`tel:${member.phone}`}
                                            className="text-blue-600 hover:text-blue-800"
                                          >
                                            {member.phone}
                                          </a>
                                        </div>
                                      )}
                                      {member.notes && (
                                        <div className="md:col-span-2">
                                          <p className="text-sm text-gray-500">Notes</p>
                                          <p className="text-gray-700">{member.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
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

                    {/* Policies Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        {/* Existing Policies */}
                        <div className="bg-white border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Insurance Policies</h3>
                            <span className="text-sm text-gray-500">
                              {policies.length} polic{policies.length !== 1 ? 'ies' : 'y'}
                    {console.log('🔍 FocusedViewModal: Rendering Family tab')}
                            </span>
                          </div>

                          {policies.length > 0 && (
                            <div className="space-y-3 mb-6">
                              {policies.map((policy) => (
                                <div key={policy.id} className="bg-gray-50 p-4 rounded-lg border">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="font-medium text-gray-900">{policy.policy_type}</h5>
                                      <p className="text-sm text-gray-600">{policy.company}</p>
                                      {policy.policy_number && (
                                        <p className="text-sm text-gray-500">Policy #: {policy.policy_number}</p>
                                      )}
                                      {policy.premium && (
                                        <p className="text-sm text-green-600">Premium: ${policy.premium.toLocaleString()}</p>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 text-right">
                                      {policy.effective_date && (
                                        <p>Effective: {new Date(policy.effective_date).toLocaleDateString()}</p>
                                      )}
                                      {policy.expiration_date && (
                                        <p>Expires: {new Date(policy.expiration_date).toLocaleDateString()}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add New Policy Form */}
                          <div className="border-t pt-6">
                            <h4 className="font-medium text-gray-900 mb-4">Add New Policy</h4>
                            <form onSubmit={(e) => { e.preventDefault(); handleSavePolicy(); }}>
                              <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type *</label>
                                <select
                                  value={newPolicy.policy_type}
                                  onChange={(e) => setNewPolicy({...newPolicy, policy_type: e.target.value})}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                  <option value="">Select type...</option>
                                  <option value="Auto">Auto Insurance</option>
                                  <option value="Home">Home Insurance</option>
                                  <option value="Life">Life Insurance</option>
                                  <option value="Business">Business Insurance</option>
                                  <option value="Health">Health Insurance</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                                <input
                                  type="text"
                                  value={newPolicy.company}
                                  onChange={(e) => setNewPolicy({...newPolicy, company: e.target.value})}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="Insurance company..."
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                                <input
                                  type="text"
                                  value={newPolicy.policy_number}
                                  onChange={(e) => setNewPolicy({...newPolicy, policy_number: e.target.value})}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="Policy number..."
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Premium ($)</label>
                                <input
                                  type="number"
                                  value={newPolicy.premium}
                                  onChange={(e) => setNewPolicy({...newPolicy, premium: e.target.value})}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="0.00"
                                  step="0.01"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                                <input
                                  type="date"
                                  value={newPolicy.effective_date}
                                  onChange={(e) => setNewPolicy({...newPolicy, effective_date: e.target.value})}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                                <input
                                  type="date"
                                  value={newPolicy.expiration_date}
                                  onChange={(e) => setNewPolicy({...newPolicy, expiration_date: e.target.value})}
                                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                              <div className="flex justify-end mt-4">
                                <button
                                  type="submit"
                                  disabled={!newPolicy.policy_type || !newPolicy.company}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Add Policy
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>

                        {/* Policy Documents */}
                        <div className="bg-white border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Policy Documents</h3>
                            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                              <FiUpload className="mr-2" />
                              {uploadingDocument ? 'Uploading...' : 'Upload Document'}
                    {console.log('🔍 FocusedViewModal: Rendering Policies tab')}
                              <input
                                type="file"
                                onChange={handleDocumentUpload}
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.accord"
                                className="hidden"
                                disabled={uploadingDocument}
                              />
                            </label>
                          </div>

                          {policyDocuments.length > 0 ? (
                            <div className="space-y-4">
                              {policyDocuments.map((document) => (
                                <div key={document.id} className="bg-gray-50 p-4 rounded-lg border">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <span className="text-blue-600 text-xs font-medium">
                                          {document.file_type?.split('/')[1]?.toUpperCase() || 'DOC'}
                                        </span>
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-900">{document.file_name}</h4>
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
                                        <FiDownload className="mr-1" />
                                        Open
                                      </a>
                                      <button
                                        onClick={() => handleDeleteDocument(document.id)}
                                        className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded-md text-sm"
                                      >
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
                              <p className="text-sm mt-2">Upload PDF, Word, ACCORD forms, or image files related to this contact's policies.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              )}
            </div>
          </div>
        </div>
      </Dialog>

      {/* Add Event Modal for Scheduling Calls */}
      <AddEventModal
  console.log('🔍 FocusedViewModal: Rendering main modal content');

        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        date={selectedEventDate}
        onSave={handleAddEvent}
        user={user}
        userColors={new Map([[user?.id, '#10B981']])}
      />

      {/* Make Call Modal */}
      <MakeCallModal
        isOpen={isMakeCallModalOpen}
        onClose={() => setIsMakeCallModalOpen(false)}
        onCallSaved={() => {
          fetchAllContactData();
          if (onPhoneCallSaved) onPhoneCallSaved();
        }}
      />
    </>
  );
}

export default FocusedViewModal;
                    {console.log('🔍 FocusedViewModal: Rendering Overview tab')}