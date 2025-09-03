import React, { useState, useEffect } from 'react';
import { Dialog, Tab } from '@headlessui/react';
import { FiX, FiUser, FiUsers, FiBriefcase, FiFileText, FiMessageCircle, FiCalendar, FiPhone, FiMail, FiUpload, FiDownload, FiTrash2, FiClock, FiMapPin } from 'react-icons/fi';
import { format } from 'date-fns';
import { 
  getHouseholdMembers, 
  getCompaniesByContactId, 
  getPolicyDocumentsByContactId,
  createPolicyDocument,
  deletePolicyDocument,
  getAllNotes,
  getPhoneCallsByContactId,
  getTextMessagesForContact,
  getEmailsForContact
} from '../../services/api';
import ScheduleMeetingModal from './ScheduleMeetingModal';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function FocusedViewModal({ isOpen, onClose, contact, onNoteSaved, onActionItemSaved, onPhoneCallSaved, onMeetingScheduled }) {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data states
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [policyDocuments, setPolicyDocuments] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  
  // Meeting scheduling
  const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false);

  useEffect(() => {
    if (isOpen && contact?.id) {
      console.log('👤 FocusedViewModal: Loading data for contact:', contact.id);
      fetchAllContactData();
    }
  }, [isOpen, contact?.id]);

  const fetchAllContactData = async () => {
    if (!contact?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('👤 FocusedViewModal: Fetching all data for contact:', contact.id);
      
      const [
        householdData,
        companiesData,
        documentsData,
        notesData,
        phoneCallsData,
        textMessagesData,
        emailsData
      ] = await Promise.all([
        getHouseholdMembers(contact.id).catch(err => {
          console.error('Error fetching household members:', err);
          return [];
        }),
        getCompaniesByContactId(contact.id).catch(err => {
          console.error('Error fetching companies:', err);
          return [];
        }),
        getPolicyDocumentsByContactId(contact.id).catch(err => {
          console.error('Error fetching policy documents:', err);
          return [];
        }),
        getAllNotes().then(notes => notes.filter(note => note.contact_id === contact.id)).catch(err => {
          console.error('Error fetching notes:', err);
          return [];
        }),
        getPhoneCallsByContactId(contact.id).catch(err => {
          console.error('Error fetching phone calls:', err);
          return [];
        }),
        getTextMessagesForContact(contact.id).catch(err => {
          console.error('Error fetching text messages:', err);
          return [];
        }),
        getEmailsForContact(contact.id).catch(err => {
          console.error('Error fetching emails:', err);
          return [];
        })
      ]);

      setHouseholdMembers(householdData || []);
      setCompanies(companiesData || []);
      setPolicyDocuments(documentsData || []);
      
      // Combine all communications and sort by date
      const allCommunications = [
        ...(notesData || []).map(note => ({ ...note, type: 'note', date: note.created_at })),
        ...(phoneCallsData || []).map(call => ({ ...call, type: 'phone_call', date: call.created_at })),
        ...(textMessagesData || []).map(msg => ({ ...msg, type: 'text_message', date: msg.sent_at || msg.created_at })),
        ...(emailsData || []).map(email => ({ ...email, type: 'email', date: email.created_at }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setCommunications(allCommunications);
      
      console.log('👤 FocusedViewModal: Data loaded successfully');
    } catch (err) {
      console.error('👤 FocusedViewModal: Error loading data:', err);
      setError('Failed to load contact details');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingDocument(true);
      console.log('👤 FocusedViewModal: Uploading document:', file.name);
      
      await createPolicyDocument(contact.id, file);
      
      // Refresh policy documents
      const updatedDocuments = await getPolicyDocumentsByContactId(contact.id);
      setPolicyDocuments(updatedDocuments || []);
      
      console.log('👤 FocusedViewModal: Document uploaded successfully');
    } catch (err) {
      console.error('👤 FocusedViewModal: Error uploading document:', err);
      setError('Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deletePolicyDocument(documentId);
        
        // Refresh policy documents
        const updatedDocuments = await getPolicyDocumentsByContactId(contact.id);
        setPolicyDocuments(updatedDocuments || []);
        
        console.log('👤 FocusedViewModal: Document deleted successfully');
      } catch (err) {
        console.error('👤 FocusedViewModal: Error deleting document:', err);
        setError('Failed to delete document');
      }
    }
  };

  const handleMeetingScheduled = () => {
    console.log('👤 FocusedViewModal: Meeting scheduled, refreshing data...');
    if (onMeetingScheduled) {
      onMeetingScheduled();
    }
    setIsScheduleMeetingOpen(false);
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
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[relationship] || colors.other;
  };

  const getCommunicationIcon = (type) => {
    switch (type) {
      case 'note': return <FiFileText className="w-4 h-4 text-blue-600" />;
      case 'phone_call': return <FiPhone className="w-4 h-4 text-green-600" />;
      case 'text_message': return <FiMessageCircle className="w-4 h-4 text-purple-600" />;
      case 'email': return <FiMail className="w-4 h-4 text-red-600" />;
      default: return <FiFileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCommunicationTypeLabel = (type) => {
    switch (type) {
      case 'note': return 'Note';
      case 'phone_call': return 'Phone Call';
      case 'text_message': return 'Text Message';
      case 'email': return 'Email';
      default: return 'Communication';
    }
  };

  if (!contact) return null;

  const tabs = [
    { name: 'Personal Details', icon: FiUser },
    { name: 'Household', icon: FiUsers },
    { name: 'Connections', icon: FiBriefcase },
    { name: 'Policies', icon: FiFileText },
    { name: 'Communication', icon: FiMessageCircle }
  ];

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

          <div className="relative bg-white w-full max-w-6xl mx-4 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-mintyLemonGreen-500 to-green-500 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {contact.first_name?.[0]}{contact.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-white">
                      {contact.first_name} {contact.last_name}
                    </Dialog.Title>
                    <div className="flex items-center space-x-4 mt-2">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center text-green-100 hover:text-white transition-colors"
                        >
                          <FiMail className="mr-1" />
                          {contact.email}
                        </a>
                      )}
                      {(contact.phone || contact.cell_number) && (
                        <a
                          href={`tel:${contact.phone || contact.cell_number}`}
                          className="flex items-center text-green-100 hover:text-white transition-colors"
                        >
                          <FiPhone className="mr-1" />
                          {contact.phone || contact.cell_number}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() =>{
                      setIsScheduleMeetingOpen(true)
                      onClose()

                    } }
                    className="px-6 py-3 bg-white bg-opacity-20 text-white font-semibold rounded-lg hover:bg-opacity-30 transition-all duration-200 transform hover:scale-105 flex items-center"
                  >
                    <FiCalendar className="mr-2" />
                    Book an Appointment
                  </button>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-mintyLemonGreen-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-600 ml-4">Loading contact details...</p>
                </div>
              ) : (
                <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                  <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
                    {tabs.map((tab, index) => (
                      <Tab
                        key={tab.name}
                        className={({ selected }) =>
                          classNames(
                            'w-full rounded-lg py-3 px-4 text-sm font-medium leading-5 flex items-center justify-center space-x-2',
                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-mintyLemonGreen-400 focus:outline-none focus:ring-2',
                            selected
                              ? 'bg-white text-mintyLemonGreen-700 shadow'
                              : 'text-gray-600 hover:bg-white hover:bg-opacity-50 hover:text-mintyLemonGreen-600'
                          )
                        }
                      >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.name}</span>
                      </Tab>
                    ))}
                  </Tab.List>

                  <Tab.Panels>
                    {/* Personal Details Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                            <div className="space-y-3">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Full Name:</span>
                                <span className="ml-2 text-gray-900">{contact.first_name} {contact.last_name}</span>
                              </div>
                              {contact.date_of_birth && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Date of Birth:</span>
                                  <span className="ml-2 text-gray-900">
                                    {new Date(contact.date_of_birth).toLocaleDateString()}
                                    {calculateAge(contact.date_of_birth) && (
                                      <span className="text-gray-500 ml-2">
                                        (Age {calculateAge(contact.date_of_birth)})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                              {contact.gender && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Gender:</span>
                                  <span className="ml-2 text-gray-900">{contact.gender}</span>
                                </div>
                              )}
                              {contact.marital_status && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Marital Status:</span>
                                  <span className="ml-2 text-gray-900">{contact.marital_status}</span>
                                </div>
                              )}
                              {contact.language && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Language:</span>
                                  <span className="ml-2 text-gray-900">{contact.language}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                            <div className="space-y-3">
                              {contact.email && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Email:</span>
                                  <a href={`mailto:${contact.email}`} className="ml-2 text-blue-600 hover:text-blue-800">
                                    {contact.email}
                                  </a>
                                </div>
                              )}
                              {contact.cell_number && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Cell Phone:</span>
                                  <a href={`tel:${contact.cell_number}`} className="ml-2 text-blue-600 hover:text-blue-800">
                                    {contact.cell_number}
                                  </a>
                                </div>
                              )}
                              {contact.home_phone_number && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Home Phone:</span>
                                  <a href={`tel:${contact.home_phone_number}`} className="ml-2 text-blue-600 hover:text-blue-800">
                                    {contact.home_phone_number}
                                  </a>
                                </div>
                              )}
                              {contact.work_number && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Work Phone:</span>
                                  <a href={`tel:${contact.work_number}`} className="ml-2 text-blue-600 hover:text-blue-800">
                                    {contact.work_number}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Address Information */}
                        {(contact.address || contact.city || contact.state || contact.zip) && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                            <div className="space-y-2">
                              {contact.address && <p className="text-gray-900">{contact.address}</p>}
                              {(contact.city || contact.state || contact.zip) && (
                                <p className="text-gray-900">
                                  {contact.city}{contact.city && contact.state ? ', ' : ''}{contact.state} {contact.zip}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Business Information */}
                        {(contact.customer_type || contact.account_type || contact.contact_status) && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {contact.customer_type && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Customer Type:</span>
                                  <span className="ml-2 text-gray-900">{contact.customer_type}</span>
                                </div>
                              )}
                              {contact.account_type && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Account Type:</span>
                                  <span className="ml-2 text-gray-900">{contact.account_type}</span>
                                </div>
                              )}
                              {contact.contact_status && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Status:</span>
                                  <span className="ml-2 text-gray-900">{contact.contact_status}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                              {contact.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-mintyLemonGreen-100 text-mintyLemonGreen-800 rounded-full text-sm font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {contact.notes && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                            <p className="text-gray-700">{contact.notes}</p>
                          </div>
                        )}
                      </div>
                    </Tab.Panel>

                    {/* Household Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        {/* Spouse Information */}
                        {(contact.spouse_first_name || contact.spouse_last_name) && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spouse Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Name:</span>
                                <span className="ml-2 text-gray-900">{contact.spouse_first_name} {contact.spouse_last_name}</span>
                              </div>
                              {contact.spouse_date_of_birth && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Date of Birth:</span>
                                  <span className="ml-2 text-gray-900">
                                    {new Date(contact.spouse_date_of_birth).toLocaleDateString()}
                                    {calculateAge(contact.spouse_date_of_birth) && (
                                      <span className="text-gray-500 ml-2">
                                        (Age {calculateAge(contact.spouse_date_of_birth)})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                              {contact.spouse_email && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Email:</span>
                                  <a
                                    href={`mailto:${contact.spouse_email}`}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                  >
                                    {contact.spouse_email}
                                  </a>
                                </div>
                              )}
                              {contact.spouse_phone && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                                  <a
                                    href={`tel:${contact.spouse_phone}`}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                  >
                                    {contact.spouse_phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Household Members */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Members</h3>
                          {householdMembers.length > 0 ? (
                            <div className="space-y-4">
                              {householdMembers.map((member) => (
                                <div key={member.id} className="bg-white p-4 rounded-lg border">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 bg-mintyLemonGreen-100 rounded-full flex items-center justify-center mr-3">
                                        <FiUser className="text-mintyLemonGreen-600" />
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-gray-900">
                                          {member.first_name} {member.last_name}
                                        </h4>
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
                                          <span className="text-sm font-medium text-gray-700">Email:</span>
                                          <a
                                            href={`mailto:${member.email}`}
                                            className="ml-2 text-blue-600 hover:text-blue-800"
                                          >
                                            {member.email}
                                          </a>
                                        </div>
                                      )}
                                      {member.phone && (
                                        <div>
                                          <span className="text-sm font-medium text-gray-700">Phone:</span>
                                          <a
                                            href={`tel:${member.phone}`}
                                            className="ml-2 text-blue-600 hover:text-blue-800"
                                          >
                                            {member.phone}
                                          </a>
                                        </div>
                                      )}
                                      {member.notes && (
                                        <div className="md:col-span-2">
                                          <span className="text-sm font-medium text-gray-700">Notes:</span>
                                          <p className="ml-2 text-gray-700">{member.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <FiUsers className="mx-auto h-12 w-12 mb-4" />
                              <p>No family members added yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Tab.Panel>

                    {/* Connections Tab */}
                    <Tab.Panel>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Connections</h3>
                        {companies.length > 0 ? (
                          <div className="space-y-4">
                            {companies.map((connection) => (
                              <div key={connection.companies.id} className="bg-white p-4 rounded-lg border">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-mintyLemonGreen-100 rounded-full flex items-center justify-center mr-3">
                                      <FiBriefcase className="text-mintyLemonGreen-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">{connection.companies.name}</h4>
                                      <p className="text-sm text-gray-600 capitalize">{connection.relationship_type}</p>
                                      {connection.companies.industry && (
                                        <p className="text-sm text-gray-500">{connection.companies.industry}</p>
                                      )}
                                    </div>
                                  </div>
                                  {connection.companies.email && (
                                    <a
                                      href={`mailto:${connection.companies.email}`}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <FiMail className="w-5 h-5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <FiBriefcase className="mx-auto h-12 w-12 mb-4" />
                            <p>No company connections found.</p>
                          </div>
                        )}
                      </div>
                    </Tab.Panel>

                    {/* Policies Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-900">Policy Documents</h3>
                          <label className="flex items-center px-4 py-2 bg-mintyLemonGreen-500 text-white rounded-lg hover:bg-mintyLemonGreen-600 cursor-pointer transition-colors">
                            <FiUpload className="mr-2" />
                            {uploadingDocument ? 'Uploading...' : 'Upload Document'}
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
                              <div key={document.id} className="bg-white p-4 rounded-lg border hover:bg-mintyLemonGreen-50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-mintyLemonGreen-100 rounded-lg flex items-center justify-center mr-3">
                                      <span className="text-mintyLemonGreen-600 text-xs font-medium">
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
                                      className="flex items-center px-3 py-1 text-mintyLemonGreen-600 hover:text-mintyLemonGreen-800 border border-mintyLemonGreen-600 rounded-md text-sm transition-colors"
                                    >
                                      <FiDownload className="mr-1" />
                                      View
                                    </a>
                                    <button
                                      onClick={() => handleDeleteDocument(document.id)}
                                      className="flex items-center px-3 py-1 text-red-600 hover:text-red-800 border border-red-600 rounded-md text-sm transition-colors"
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
                            <FiFileText className="mx-auto h-12 w-12 mb-4" />
                            <p>No policy documents uploaded yet.</p>
                            <p className="text-sm mt-2">Upload PDF, Word, ACCORD forms, or image files related to this contact's policies.</p>
                          </div>
                        )}
                      </div>
                    </Tab.Panel>

                    {/* Communication Tab */}
                    <Tab.Panel>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-900">Communication History</h3>
                          <div className="text-sm text-gray-500">
                            {communications.length} total communications
                          </div>
                        </div>

                        {communications.length > 0 ? (
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {communications.map((comm) => (
                              <div key={`${comm.type}-${comm.id}`} className="bg-white p-4 rounded-lg border hover:bg-mintyLemonGreen-50 transition-colors">
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    {getCommunicationIcon(comm.type)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-900">
                                          {getCommunicationTypeLabel(comm.type)}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {format(new Date(comm.date), 'MMM d, yyyy h:mm a')}
                                        </span>
                                      </div>
                                      {comm.direction && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          comm.direction === 'outgoing' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-blue-100 text-blue-800'
                                        }`}>
                                          {comm.direction}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <h4 className="font-medium text-gray-900 mb-1">
                                      {comm.title || comm.subject || 'Communication'}
                                    </h4>
                                    
                                    <div 
                                      className="text-sm text-gray-600 line-clamp-3"
                                      dangerouslySetInnerHTML={{
                                        __html: comm.content?.length > 200 
                                          ? `${comm.content.slice(0, 200)}...` 
                                          : comm.content
                                      }}
                                    />
                                    
                                    {comm.media_url && (
                                      <div className="mt-2">
                                        <a
                                          href={comm.media_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                          <FiFileText className="mr-1" />
                                          View attachment
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <FiMessageCircle className="mx-auto h-12 w-12 mb-4" />
                            <p>No communication history found.</p>
                            <p className="text-sm mt-2">Notes, calls, texts, and emails will appear here.</p>
                          </div>
                        )}
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              )}
            </div>
          </div>
        </div>
      </Dialog>

      <ScheduleMeetingModal
        isOpen={isScheduleMeetingOpen}
        onClose={() => setIsScheduleMeetingOpen(false)}
        contact={contact}
        onMeetingScheduled={handleMeetingScheduled}
      />
    </>
  );
}

export default FocusedViewModal;