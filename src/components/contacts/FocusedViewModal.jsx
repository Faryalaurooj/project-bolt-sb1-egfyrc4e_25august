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
  getEmailsForContact,
  getPoliciesByContactIdSupabase
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
  const [policies, setPolicies] = useState([]);
  
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
        emailsData,
        policiesData
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
        }),
        getPoliciesByContactIdSupabase(contact.id).catch(err => {
          console.error('Error fetching policies:', err);
          return [];
        })
      ]);

      setHouseholdMembers(householdData || []);
      setCompanies(companiesData || []);
      setPolicyDocuments(documentsData || []);
      setPolicies(policiesData || []);
      
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

          <div className="relative bg-white w-full max-w-7xl mx-4 rounded-2xl shadow-2xl overflow-hidden">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-lime-500 p-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {contact.first_name?.[0]}{contact.last_name?.[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <Dialog.Title className="text-3xl font-bold text-white mb-2">
                      {contact.first_name} {contact.last_name}
                    </Dialog.Title>
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center px-3 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
                        >
                          <FiMail className="mr-2" />
                          {contact.email}
                        </a>
                      )}
                      {(contact.phone || contact.cell_number) && (
                        <a
                          href={`tel:${contact.phone || contact.cell_number}`}
                          className="flex items-center px-3 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
                        >
                          <FiPhone className="mr-2" />
                          {contact.phone || contact.cell_number}
                        </a>
                      )}
                      {contact.contact_status && (
                        <span className="px-3 py-2 bg-white bg-opacity-20 text-white rounded-lg backdrop-blur-sm text-sm font-medium">
                          {contact.contact_status}
                        </span>
                      )}
                    </div>
                    <div className="text-green-100 text-sm">
                      Created {new Date(contact.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() =>{
                      setIsScheduleMeetingOpen(true)
                      onClose()
                    }}
                    className="px-6 py-3 bg-white bg-opacity-20 text-white font-semibold rounded-xl hover:bg-opacity-30 transition-all duration-200 transform hover:scale-105 flex items-center backdrop-blur-sm shadow-lg"
                  >
                    <FiCalendar className="mr-2" />
                    Book Appointment
                  </button>
                  <button
                    onClick={onClose}
                    className="p-3 text-white hover:text-gray-200 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200"
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
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-600 ml-4">Loading contact details...</p>
                </div>
              ) : (
                <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                  <Tab.List className="flex space-x-1 rounded-xl bg-gradient-to-r from-gray-100 to-green-50 p-1 mb-8 shadow-sm">
                    {tabs.map((tab, index) => (
                      <Tab
                        key={tab.name}
                        className={({ selected }) =>
                          classNames(
                            'w-full rounded-lg py-4 px-6 text-sm font-medium leading-5 flex items-center justify-center space-x-3 transition-all duration-200',
                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-green-400 focus:outline-none focus:ring-2',
                            selected
                              ? 'bg-white text-green-700 shadow-lg transform scale-105'
                              : 'text-gray-600 hover:bg-white hover:bg-opacity-70 hover:text-green-600 hover:transform hover:scale-102'
                          )
                        }
                      >
                        <tab.icon className="w-5 h-5" />
                        <span className="font-semibold">{tab.name}</span>
                      </Tab>
                    ))}
                  </Tab.List>

                  <Tab.Panels>
                    {/* Personal Details Tab */}
                    <Tab.Panel>
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
                            <div className="flex items-center space-x-3 mb-6">
                              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                <FiUser className="w-5 h-5 text-white" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                            </div>
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

                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 shadow-sm">
                            <div className="flex items-center space-x-3 mb-6">
                              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                <FiPhone className="w-5 h-5 text-white" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                            </div>
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
                        {(contact.customer_type || contact.account_type || contact.contact_status || contact.customer_sub_status || contact.customer_agent_of_record || contact.customer_csr || contact.keyed_by || contact.office || contact.source) && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              {contact.customer_sub_status && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Customer Sub Status:</span>
                                  <span className="ml-2 text-gray-900">{contact.customer_sub_status}</span>
                                </div>
                              )}
                              {contact.customer_agent_of_record && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Agent of Record:</span>
                                  <span className="ml-2 text-gray-900">{contact.customer_agent_of_record}</span>
                                </div>
                              )}
                              {contact.customer_csr && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">CSR:</span>
                                  <span className="ml-2 text-gray-900">{contact.customer_csr}</span>
                                </div>
                              )}
                              {contact.keyed_by && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Keyed By:</span>
                                  <span className="ml-2 text-gray-900">{contact.keyed_by}</span>
                                </div>
                              )}
                              {contact.office && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Office:</span>
                                  <span className="ml-2 text-gray-900">{contact.office}</span>
                                </div>
                              )}
                              {contact.source && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Source:</span>
                                  <span className="ml-2 text-gray-900">{contact.source}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Driver's License Information */}
                        {(contact.drivers_license || contact.dl_state || contact.date_licensed) && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver's License Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {contact.drivers_license && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">License Number:</span>
                                  <span className="ml-2 text-gray-900">{contact.drivers_license}</span>
                                </div>
                              )}
                              {contact.dl_state && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">State:</span>
                                  <span className="ml-2 text-gray-900">{contact.dl_state}</span>
                                </div>
                              )}
                              {contact.date_licensed && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Date Licensed:</span>
                                  <span className="ml-2 text-gray-900">
                                    {new Date(contact.date_licensed).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Communication Preferences */}
                        {(contact.preferred_contact_method || contact.do_not_email || contact.do_not_text || contact.do_not_call || contact.do_not_mail || contact.do_not_market || contact.do_not_capture_email) && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Preferences</h3>
                            <div className="space-y-3">
                              {contact.preferred_contact_method && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Preferred Contact Method:</span>
                                  <span className="ml-2 text-gray-900 capitalize">{contact.preferred_contact_method}</span>
                                </div>
                              )}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {contact.do_not_email && (
                                  <div className="flex items-center">
                                    <span className="text-sm text-red-600 font-medium">Do Not Email</span>
                                  </div>
                                )}
                                {contact.do_not_text && (
                                  <div className="flex items-center">
                                    <span className="text-sm text-red-600 font-medium">Do Not Text</span>
                                  </div>
                                )}
                                {contact.do_not_call && (
                                  <div className="flex items-center">
                                    <span className="text-sm text-red-600 font-medium">Do Not Call</span>
                                  </div>
                                )}
                                {contact.do_not_mail && (
                                  <div className="flex items-center">
                                    <span className="text-sm text-red-600 font-medium">Do Not Mail</span>
                                  </div>
                                )}
                                {contact.do_not_market && (
                                  <div className="flex items-center">
                                    <span className="text-sm text-red-600 font-medium">Do Not Market</span>
                                  </div>
                                )}
                                {contact.do_not_capture_email && (
                                  <div className="flex items-center">
                                    <span className="text-sm text-red-600 font-medium">Do Not Capture Email</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional Contact Information */}
                        {(contact.email2 || contact.ssn_tax_id) && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                            <div className="space-y-3">
                              {contact.email2 && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Secondary Email:</span>
                                  <a href={`mailto:${contact.email2}`} className="ml-2 text-blue-600 hover:text-blue-800">
                                    {contact.email2}
                                  </a>
                                </div>
                              )}
                              {contact.ssn_tax_id && (
                                <div>
                                  <span className="text-sm font-medium text-gray-700">SSN/Tax ID:</span>
                                  <span className="ml-2 text-gray-900">{contact.ssn_tax_id}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Mailing Address */}
                        {(contact.mailing_address || contact.mailing_city || contact.mailing_state || contact.mailing_zip) && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mailing Address</h3>
                            <div className="space-y-2">
                              {contact.mailing_address && <p className="text-gray-900">{contact.mailing_address}</p>}
                              {(contact.mailing_city || contact.mailing_state || contact.mailing_zip) && (
                                <p className="text-gray-900">
                                  {contact.mailing_city}{contact.mailing_city && contact.mailing_state ? ', ' : ''}{contact.mailing_state} {contact.mailing_zip}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                              {contact?.tags?.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
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
                                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        <FiUser className="text-green-600" />
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
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                      <FiBriefcase className="text-green-600" />
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
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 shadow-sm">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                              <FiFileText className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Policy Information</h3>
                          </div>
                          
                          {policies.length > 0 ? (
                            <div className="space-y-6">
                              {policies.map((policy, index) => (
                                <div key={policy.id || index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">
                                      Policy #{index + 1}
                                    </h4>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                      {policy.policy_entry || 'New Business'}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Company:</span>
                                        <span className="ml-2 text-gray-900">{policy.company || 'Not specified'}</span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Product:</span>
                                        <span className="ml-2 text-gray-900">{policy.product || 'Not specified'}</span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Payment Plan:</span>
                                        <span className="ml-2 text-gray-900">{policy.payment_plan || 'Not specified'}</span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Policy Number:</span>
                                        <span className="ml-2 text-gray-900 font-mono">{policy.policy_number || 'Not specified'}</span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Premium:</span>
                                        <span className="ml-2 text-gray-900">{policy.pure_premium || 'Not specified'}</span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Payment Due Day:</span>
                                        <span className="ml-2 text-gray-900">{policy.payment_due_day || 'Not specified'}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Effective Date:</span>
                                        <span className="ml-2 text-gray-900">
                                          {policy.eff_date ? new Date(policy.eff_date).toLocaleDateString() : 'Not specified'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Expiration Date:</span>
                                        <span className="ml-2 text-gray-900">
                                          {policy.exp_date ? new Date(policy.exp_date).toLocaleDateString() : 'Not specified'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Source:</span>
                                        <span className="ml-2 text-gray-900">{policy.source || 'Not specified'}</span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Sub Source:</span>
                                        <span className="ml-2 text-gray-900">{policy.sub_source || 'Not specified'}</span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Agent of Record:</span>
                                        <span className="ml-2 text-gray-900">{policy.policy_agent_of_record || 'Not specified'}</span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">CSR:</span>
                                        <span className="ml-2 text-gray-900">{policy.policy_csr || 'Not specified'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Prior Policy Number:</span>
                                        <span className="ml-2 text-gray-900">{policy.prior_policy_number || 'Not specified'}</span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">Commission Split:</span>
                                        <span className="ml-2 text-gray-900">{policy.commission_split || '100.00%'}</span>
                                      </div>
                                    </div>
                                    
                                    {policy.memo && (
                                      <div className="mt-4">
                                        <span className="text-sm font-medium text-gray-700">Memo:</span>
                                        <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md">{policy.memo}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No Policy Data</h3>
                              <p className="text-gray-500">No policy information found for this contact.</p>
                            </div>
                          )}
                        </div>
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
                              <div key={`${comm.type}-${comm.id}`} className="bg-white p-4 rounded-lg border hover:bg-green-50 transition-colors">
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