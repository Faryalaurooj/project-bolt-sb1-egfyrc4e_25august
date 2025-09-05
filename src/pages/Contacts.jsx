import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUser, FiUsers, FiTag, FiStar, FiBell, FiX, FiMail, FiMessageSquare, FiMoreVertical, FiDownload, FiFilter, FiCalendar, FiHome, FiFileText, FiClock } from 'react-icons/fi';
import BulkActionsBar from '../components/contacts/BulkActionsBar';
import EmailCampaignModal from '../components/campaigns/EmailCampaignModal';
import TextCampaignModal from '../components/campaigns/TextCampaignModal';
import SendCardModal from '../components/contacts/SendCardModal';
import ManageTagsModal from '../components/contacts/ManageTagsModal';
import MergeContactsModal from '../components/contacts/MergeContactsModal';
import FocusedViewModal from '../components/contacts/FocusedViewModal';
import AutomationModal from '../components/contacts/AutomationModal';
import ExportModal from '../components/contacts/ExportModal';
import KeepInTouchModal from '../components/contacts/KeepInTouchModal';
import NewContactModal from '../components/campaigns/NewContactModal';
import NewCompanyModal from '../components/contacts/NewCompanyModal';
import ScheduleMeetingModal from '../components/contacts/ScheduleMeetingModal';
import EditContactModal from '../components/contacts/EditContactModal';
import { getContacts, deleteContact, getUsers } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Contacts() {
  const [activeTab, setActiveTab] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  
  // New state for enhanced contact features
  const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false);
  const [selectedContactForMeeting, setSelectedContactForMeeting] = useState(null);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [householdDetails, setHouseholdDetails] = useState({});
  const [contactPolicies, setContactPolicies] = useState({});

  const [companies] = useState([
    { id: '1', name: '1212 Park Ave LLC', tags: [], domain: '' },
    { id: '2', name: '2200 LLC', tags: [], domain: '' },
    { id: '3', name: '234 East Ave', tags: [], domain: '' }
  ]);

  const [tags] = useState([
    { id: '1', name: 'All Contacts', contactCount: 3830, companyCount: 0 },
    { id: '2', name: 'Client', contactCount: 2456, companyCount: 0 },
    { id: '3', name: 'Prospect', contactCount: 1374, companyCount: 0 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isFocusedViewOpen, setIsFocusedViewOpen] = useState(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isKeepInTouchModalOpen, setIsKeepInTouchModalOpen] = useState(false);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
 const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false);
//  const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false);
  const [focusedContact, setFocusedContact] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Fetch contacts from Supabase with enhanced data
  useEffect(() => {
    const fetchContactsData = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const data = await getContacts();
        const formattedContacts = data.map(contact => ({
          id: contact.id,
          firstName: contact.first_name,
          lastName: contact.last_name,
          email: contact.email,
          phone: contact.phone || contact.cell_number || contact.home_phone_number,
          tags: contact.tags || [],
          creationDate: contact.created_at,
          // Enhanced contact data
          householdDetails: contact.household_details || {},
          policies: contact.policies || [],
          policyDocuments: contact.policy_documents || [],
          address: contact.address,
          company: contact.company,
          notes: contact.notes,
          // Additional contact fields from your object
          city: contact.city,
          state: contact.state,
          zip: contact.zip,
          spouse_first_name: contact.spouse_first_name,
          spouse_last_name: contact.spouse_last_name,
          spouse_email: contact.spouse_email,
          spouse_phone: contact.spouse_phone,
          date_of_birth: contact.date_of_birth,
          marital_status: contact.marital_status,
          gender: contact.gender,
          customer_type: contact.customer_type,
          account_type: contact.account_type,
          contact_status: contact.contact_status,
          // Keep original structure for compatibility
          first_name: contact.first_name,
          last_name: contact.last_name,
          cell_number: contact.cell_number,
          home_phone_number: contact.home_phone_number,
          work_number: contact.work_number
        }));
        setContacts(formattedContacts);
        
        // Extract household details and policies for easy access
        const householdMap = {};
        const policiesMap = {};
        formattedContacts.forEach(contact => {
          if (contact.householdDetails && Object.keys(contact.householdDetails).length > 0) {
            householdMap[contact.id] = contact.householdDetails;
          }
          if (contact.policies && contact.policies.length > 0) {
            policiesMap[contact.id] = contact.policies;
          }
        });
        setHouseholdDetails(householdMap);
        setContactPolicies(policiesMap);
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
        setFetchError('Failed to load contacts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchContactsData();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id);
        setContacts(contacts.filter(contact => contact.id !== id));
        setSelectedContacts(selectedContacts.filter(contactId => contactId !== id));
        showSuccess('Contact deleted successfully');
      } catch (err) {
        console.error('Error deleting contact:', err);
        showError('Failed to delete contact. Please try again.');
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (id) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(contactId => contactId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const getSelectedContactsData = () => {
    return contacts.filter(contact => selectedContacts.includes(contact.id));
  };

  const handleBulkAction = (action) => {
    const selectedContactsData = getSelectedContactsData();
    
    switch (action) {
      case 'email':
        setIsEmailModalOpen(true);
        break;
      case 'text':
        setIsTextModalOpen(true);
        break;
      case 'card':
        setIsCardModalOpen(true);
        break;
      case 'tag':
        setIsTagsModalOpen(true);
        break;
      case 'merge':
        if (selectedContacts.length < 2) {
          alert('Please select at least 2 contacts to merge');
          return;
        }
        setIsMergeModalOpen(true);
        break;
      case 'focused':
        if (selectedContacts.length !== 1) {
          alert('Please select exactly one contact for focused view');
          return;
        }
        const contact = contacts.find(c => c.id === selectedContacts[0]);
        setFocusedContact(contact);
        setIsFocusedViewOpen(true);
        break;
      case 'automations':
        setIsAutomationModalOpen(true);
        break;
      case 'export':
        setIsExportModalOpen(true);
        break;
      case 'keepInTouch':
        setIsKeepInTouchModalOpen(true);
        break;
      default:
        console.log('Unhandled action:', action);
    }
  };

  const handleContactClick = (contact) => {
    console.log('👤 Contacts: handleContactClick called with contact:', contact);
    
    // Validate contact object before proceeding
    if (!contact) {
      console.error('👤 Contacts: No contact provided to handleContactClick');
      alert('Error: No contact data available');
      return;
    }
    
    if (!contact.id) {
      console.error('👤 Contacts: Contact missing ID:', contact);
      alert('Error: Contact data is incomplete');
      return;
    }
    
    console.log('👤 Contacts: Setting focused contact and opening modal...');
    setFocusedContact(contact);
    setIsFocusedViewOpen(true);
    console.log('👤 Contacts: Modal state updated - focusedContact set, modal should open');
  };

  const handleMeetingScheduled = () => {
    console.log('👤 Contacts: Meeting scheduled, refreshing contact data...');
    setRefreshTrigger(prev => prev + 1);
  };

  // New handler functions for enhanced contact features
  const handleScheduleMeeting = (contact) => {
    console.log('📅 Scheduling meeting with contact:', contact);
    setSelectedContactForMeeting(contact);
    setIsScheduleMeetingOpen(true);
  };

  const handleEditContact = (contact) => {
    console.log('✏️ Editing contact:', contact);
    setContactToEdit(contact);
    setIsEditContactOpen(true);
  };

  const handleMeetingScheduledSuccess = async (meetingData) => {
    try {
      // Meeting scheduling is now handled in the ScheduleMeetingModal
      // This function just handles the cleanup and refresh
      console.log('📅 Meeting scheduled successfully:', meetingData);
      
      setIsScheduleMeetingOpen(false);
      setSelectedContactForMeeting(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error in meeting scheduled handler:', error);
      showError('Failed to complete meeting scheduling. Please try again.');
    }
  };

  const handleContactUpdated = async (updatedContact) => {
    try {
      // This would typically call an API to update the contact
      console.log('✏️ Updating contact:', updatedContact);
      
      // Update the local state
      setContacts(prev => prev.map(contact => 
        contact.id === updatedContact.id ? updatedContact : contact
      ));
      
      // Update household details and policies maps
      if (updatedContact.householdDetails && Object.keys(updatedContact.householdDetails).length > 0) {
        setHouseholdDetails(prev => ({
          ...prev,
          [updatedContact.id]: updatedContact.householdDetails
        }));
      }
      
      if (updatedContact.policies && updatedContact.policies.length > 0) {
        setContactPolicies(prev => ({
          ...prev,
          [updatedContact.id]: updatedContact.policies
        }));
      }
      
      showSuccess('Contact updated successfully!');
      setIsEditContactOpen(false);
      setContactToEdit(null);
    } catch (error) {
      console.error('Error updating contact:', error);
      showError('Failed to update contact. Please try again.');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTermLower) ||
      (contact.email || '').toLowerCase().includes(searchTermLower) ||
      (contact.phone || '').includes(searchTermLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contacts Management</h1>
            <p className="text-gray-600">Manage your contacts, companies, and tags in one place</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
              <div className="text-sm text-gray-500">Total Contacts</div>
            </div>
          </div>
        </div>
      </div>

      <Tab.Group onChange={setActiveTab}>
        {/* Enhanced Tab Navigation */}
        <Tab.List className="flex space-x-1 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 p-1 shadow-sm">
          <Tab className={({ selected }) =>
            classNames(
              'w-full rounded-lg py-3 px-6 text-sm font-semibold transition-all duration-200 focus:outline-none',
              selected
                ? 'bg-white text-blue-700 shadow-md transform scale-105'
                : 'text-blue-600 hover:bg-white hover:bg-opacity-50 hover:text-blue-800'
            )
          }>
            <div className="flex items-center justify-center space-x-2">
              <FiUsers className="mr-2" />
              <span>People</span>
            </div>
          </Tab>
          <Tab className={({ selected }) =>
            classNames(
              'w-full rounded-lg py-3 px-6 text-sm font-semibold transition-all duration-200 focus:outline-none',
              selected
                ? 'bg-white text-blue-700 shadow-md transform scale-105'
                : 'text-blue-600 hover:bg-white hover:bg-opacity-50 hover:text-blue-800'
            )
          }>
            <div className="flex items-center justify-center space-x-2">
              <FiUser className="mr-2" />
              <span>Companies</span>
            </div>
          </Tab>
          <Tab className={({ selected }) =>
            classNames(
              'w-full rounded-lg py-3 px-6 text-sm font-semibold transition-all duration-200 focus:outline-none',
              selected
                ? 'bg-white text-blue-700 shadow-md transform scale-105'
                : 'text-blue-600 hover:bg-white hover:bg-opacity-50 hover:text-blue-800'
            )
          }>
            <div className="flex items-center justify-center space-x-2">
              <FiTag className="mr-2" />
              <span>Tags</span>
            </div>
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* People Tab Panel */}
          <Tab.Panel>
            <div className="space-y-6">
              {/* Enhanced Controls Section */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                    <button className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-pink-200 transition-all duration-200 font-medium">
                    <span className="mr-2">🎮</span>
                    Tagging Game
                  </button>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">{contacts.length} contacts</span>
                    </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setIsNewContactModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    New Contact
                  </button>
                  <button
                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all duration-200 flex items-center"
                  >
                    <FiDownload className="mr-2" />
                    Import from File
                  </button>
                </div>
              </div>

                {/* Enhanced Search Section */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-400 w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search contacts by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-12 w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200 p-4 text-lg placeholder-gray-400"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <button className="flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                    <FiFilter className="mr-2" />
                    Filters
                  </button>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Save Search
                  </button>
                </div>
              </div>

              <BulkActionsBar
                selectedCount={selectedContacts.length}
                onAction={handleBulkAction}
              />

              {/* Enhanced Loading and Error States */}
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading contacts...</p>
                </div>
              )}
              
              {fetchError && (
                <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
                  <div className="text-red-500 text-4xl mb-4">⚠️</div>
                  <p className="text-red-600 font-medium mb-4">{fetchError}</p>
                  <button
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Enhanced Empty State */}
              {!loading && !fetchError && contacts.length === 0 && (
                <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-300">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No contacts yet</h3>
                  <p className="text-gray-600 mb-6">Get started by adding your first contact</p>
                  <button
                    onClick={() => setIsNewContactModalOpen(true)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <FiPlus className="mr-2" />
                    Add Your First Contact
                  </button>
                </div>
              )}

              {/* Enhanced Contacts Table */}
              {!loading && !fetchError && contacts.length > 0 && (
                <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                            onChange={handleSelectAll}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Household Details</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Policies & Documents</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tags</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact Info</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Creation Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedContacts.includes(contact.id)}
                              onChange={() => handleSelectContact(contact.id)}
                              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-sm">
                                  {contact.firstName?.[0]}{contact.lastName?.[0]}
                                </span>
                              </div>
                              <div
                                className="text-blue-600 hover:text-blue-800 cursor-pointer font-semibold transition-colors"
                                onClick={() => handleContactClick(contact)}
                              >
                                {contact.firstName} {contact.lastName}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {householdDetails[contact.id] ? (
                                <div className="flex items-center space-x-2">
                                  <FiHome className="w-4 h-4 text-green-600" />
                                  <div className="text-xs">
                                    <div className="font-medium text-gray-900">
                                      {householdDetails[contact.id].address || 'Address Available'}
                                    </div>
                                    {householdDetails[contact.id].family_size && (
                                      <div className="text-gray-500">
                                        Family: {householdDetails[contact.id].family_size}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No household details</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {/* Policies */}
                              {contactPolicies[contact.id] && contactPolicies[contact.id].length > 0 ? (
                                <div className="flex items-center space-x-2">
                                  <FiFileText className="w-4 h-4 text-blue-600" />
                                  <div className="text-xs">
                                    <div className="font-medium text-gray-900">
                                      {contactPolicies[contact.id].length} Policy(ies)
                                    </div>
                                    <div className="text-gray-500">
                                      {contactPolicies[contact.id].slice(0, 2).map((policy, index) => (
                                        <span key={index}>
                                          {policy.name || policy.type}
                                          {index < Math.min(contactPolicies[contact.id].length - 1, 1) && ', '}
                                        </span>
                                      ))}
                                      {contactPolicies[contact.id].length > 2 && '...'}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <FiFileText className="w-4 h-4 text-gray-400" />
                                  <span className="text-xs text-gray-400 italic">No policies</span>
                                </div>
                              )}
                              
                              {/* Policy Documents */}
                              {contact.policyDocuments && contact.policyDocuments.length > 0 ? (
                                <div className="flex items-center space-x-2 mt-1">
                                  <FiFileText className="w-4 h-4 text-green-600" />
                                  <div className="text-xs">
                                    <div className="font-medium text-gray-900">
                                      {contact.policyDocuments.length} Document(s)
                                    </div>
                                    <div className="text-gray-500">
                                      {contact.policyDocuments.slice(0, 2).map((doc, index) => (
                                        <span key={index}>
                                          {doc.file_name}
                                          {index < Math.min(contact.policyDocuments.length - 1, 1) && ', '}
                                        </span>
                                      ))}
                                      {contact.policyDocuments.length > 2 && '...'}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2 mt-1">
                                  <FiFileText className="w-4 h-4 text-gray-400" />
                                  <span className="text-xs text-gray-400 italic">No documents</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {contact.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {contact.email && (
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                                  title={contact.email}
                                >
                                  <FiMail className="w-5 h-5" />
                                </a>
                              )}
                              {contact.phone && (
                                <a
                                  href={`sms:${contact.phone}`}
                                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200"
                                  title={contact.phone}
                                >
                                  <FiMessageSquare className="w-5 h-5" />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="font-medium">
                              {new Date(contact.creationDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <button
                                onClick={() => setActionMenuOpen(actionMenuOpen === contact.id ? null : contact.id)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                              >
                                <FiMoreVertical className="w-5 h-5" />
                              </button>
                              
                              {actionMenuOpen === contact.id && (
                                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                                  <button
                                    onClick={() => {
                                      handleContactClick(contact);
                                      setActionMenuOpen(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center transition-colors"
                                  >
                                    <FiUser className="mr-2" />
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleEditContact(contact);
                                      setActionMenuOpen(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center transition-colors"
                                  >
                                    <FiEdit2 className="mr-2" />
                                    Edit Contact
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleScheduleMeeting(contact);
                                      setActionMenuOpen(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center transition-colors"
                                  >
                                    <FiCalendar className="mr-2" />
                                    Schedule Meeting
                                  </button>
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <button
                                    onClick={() => {
                                      handleDelete(contact.id);
                                      setActionMenuOpen(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center transition-colors"
                                  >
                                    <FiTrash2 className="mr-2" />
                                    Delete Contact
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Tab.Panel>

          {/* Companies Tab Panel */}
          <Tab.Panel>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 font-medium">{companies.length} companies</span>
                  </div>
                <button
                  onClick={() => setIsNewCompanyModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center"
                >
                  <FiPlus className="mr-2" />
                  New Company
                </button>
              </div>
              </div>

              <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Company Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tags</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Domain</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {companies.map((company) => (
                      <tr key={company.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-sm">🏢</span>
                            </div>
                            <div className="text-blue-600 hover:text-blue-800 cursor-pointer font-semibold transition-colors">
                            {company.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {company.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="font-medium">{company.domain}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Panel>

          {/* Tags Tab Panel */}
          <Tab.Panel>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 font-medium">{tags.length} tags</span>
                  </div>
                <div className="flex space-x-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105">
                    Add Tag
                  </button>
                    <button className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all duration-200">
                    Generate Report
                  </button>
                </div>
              </div>
              </div>

              <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-green-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tag</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contacts</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Companies</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tag Notifications</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {tags.map((tag) => (
                      <tr key={tag.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                              <FiTag className="text-white w-4 h-4" />
                            </div>
                            <div className="text-blue-600 hover:text-blue-800 cursor-pointer font-semibold transition-colors">
                            {tag.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="font-semibold">{tag.contactCount}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="font-semibold">{tag.companyCount}</div>
                        </td>
                        <td className="px-6 py-4">
                          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium">
                            Add Tag Notification
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <EmailCampaignModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        preSelectedContacts={getSelectedContactsData()}
      />
      
      <TextCampaignModal
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        preSelectedContacts={getSelectedContactsData()}
      />

      <SendCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        selectedContacts={selectedContacts}
      />

      <ManageTagsModal
        isOpen={isTagsModalOpen}
        onClose={() => setIsTagsModalOpen(false)}
        selectedContacts={selectedContacts}
      />

      <MergeContactsModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        selectedContacts={getSelectedContactsData()}
      />

      <FocusedViewModal
        isOpen={isFocusedViewOpen}
        onClose={() => setIsFocusedViewOpen(false)}
        contact={focusedContact}
        onNoteSaved={() => setRefreshTrigger(prev => prev + 1)}
        onActionItemSaved={() => setRefreshTrigger(prev => prev + 1)}
        onPhoneCallSaved={() => setRefreshTrigger(prev => prev + 1)}
        onMeetingScheduled={handleMeetingScheduled}
      />

      <AutomationModal
        isOpen={isAutomationModalOpen}
        onClose={() => setIsAutomationModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <KeepInTouchModal
        isOpen={isKeepInTouchModalOpen}
        onClose={() => setIsKeepInTouchModalOpen(false)}
      />

      <NewContactModal
        isOpen={isNewContactModalOpen}
        onClose={() => setIsNewContactModalOpen(false)}
        onContactSaved={() => setRefreshTrigger(prev => prev + 1)}
      />

      <NewCompanyModal
        isOpen={isNewCompanyModalOpen}
        onClose={() => setIsNewCompanyModalOpen(false)}
        onCompanySaved={() => setRefreshTrigger(prev => prev + 1)}
      />

      <ScheduleMeetingModal
        isOpen={isScheduleMeetingOpen}
        onClose={() => {
          setIsScheduleMeetingOpen(false);
          setSelectedContactForMeeting(null);
        }}
        contact={selectedContactForMeeting}
        onMeetingScheduled={handleMeetingScheduledSuccess}
      />

      <EditContactModal
        isOpen={isEditContactOpen}
        onClose={() => {
          setIsEditContactOpen(false);
          setContactToEdit(null);
        }}
        contact={contactToEdit}
        onContactUpdated={handleContactUpdated}
      />

    </div>
  );
}

export default Contacts;