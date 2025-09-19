import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSearch, FiUser, FiFileText } from 'react-icons/fi';
import { getContacts } from '../../services/api';
import { useToast } from '../../hooks/useToast';

function PolicySelectModal({ isOpen, onClose, onPoliciesSelected }) {
  const { showSuccess, showError } = useToast();
  
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [policies, setPolicies] = useState([
    {
      id: '1',
      company: 'Progressive',
      status: 'ACTIVE',
      type: 'Renewal',
      class: 'BOAT',
      policy: '663022563',
      due: '0',
      effDate: '06/26/2025',
      expDate: '06/26/2026'
    },
    {
      id: '2',
      company: 'Travelers',
      status: 'ACTIVE',
      type: 'Renewal',
      class: 'HOME',
      policy: '613711878631',
      due: '0',
      effDate: '04/17/2025',
      expDate: '04/17/2026'
    },
    {
      id: '3',
      company: 'Travelers',
      status: 'ACTIVE',
      type: 'Renewal',
      class: 'AUTO',
      policy: '613711876201',
      due: '0',
      effDate: '04/17/2025',
      expDate: '04/17/2026'
    },
    {
      id: '4',
      company: 'State Farm',
      status: 'ACTIVE',
      type: 'New Business',
      class: 'LIFE',
      policy: 'SF789456123',
      due: '0',
      effDate: '01/15/2025',
      expDate: '01/15/2026'
    },
    {
      id: '5',
      company: 'Allstate',
      status: 'PENDING',
      type: 'Renewal',
      class: 'UMBRELLA',
      policy: 'AL456789012',
      due: '15',
      effDate: '03/01/2025',
      expDate: '03/01/2026'
    }
  ]);
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [step, setStep] = useState(1); // 1: Select Contact, 2: Select Policies

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      setStep(1);
      setSelectedContact(null);
      setSelectedPolicies([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  const fetchContacts = async () => {
    try {
      setContactsLoading(true);
      const contactsData = await getContacts();
      setContacts(contactsData || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      showError('Failed to load contacts');
    } finally {
      setContactsLoading(false);
    }
  };

  const fetchPoliciesForContact = async (contactId) => {
    try {
      // For now, use dummy data. In production, this would fetch from getPoliciesByContactId(contactId)
      const dummyPolicies = [
        {
          id: '1',
          company: 'Progressive',
          status: 'ACTIVE',
          type: 'Renewal',
          class: 'BOAT',
          policy: '663022563',
          due: '0',
          effDate: '06/26/2025',
          expDate: '06/26/2026'
        },
        {
          id: '2',
          company: 'Travelers',
          status: 'ACTIVE',
          type: 'Renewal',
          class: 'HOME',
          policy: '613711878631',
          due: '0',
          effDate: '04/17/2025',
          expDate: '04/17/2026'
        },
        {
          id: '3',
          company: 'Travelers',
          status: 'ACTIVE',
          type: 'Renewal',
          class: 'AUTO',
          policy: '613711876201',
          due: '0',
          effDate: '04/17/2025',
          expDate: '04/17/2026'
        }
      ];
      
      setPolicies(dummyPolicies);
      if (dummyPolicies.length === 0) {
        showError('No policies found for this contact');
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      showError('Failed to load policies');
      setPolicies([]);
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setStep(2);
    fetchPoliciesForContact(contact.id);
  };

  const handlePolicyToggle = (policy) => {
    setSelectedPolicies(prev => {
      const isSelected = prev.find(p => p.id === policy.id);
      if (isSelected) {
        return prev.filter(p => p.id !== policy.id);
      } else {
        return [...prev, policy];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPolicies.length === policies.length) {
      setSelectedPolicies([]);
    } else {
      setSelectedPolicies([...policies]);
    }
  };

  const handleContinue = () => {
    if (selectedPolicies.length === 0) {
      showError('Please select at least one policy');
      return;
    }
    
    onPoliciesSelected(selectedContact, selectedPolicies);
    onClose();
  };

  const handleBack = () => {
    setStep(1);
    setSelectedContact(null);
    setPolicies([]);
    setSelectedPolicies([]);
  };

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
    const email = (contact.email || '').toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'RENEWAL': return 'bg-blue-100 text-blue-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'AUTO': return 'bg-blue-100 text-blue-800';
      case 'AUTOP': return 'bg-blue-100 text-blue-800';
      case 'HOME': return 'bg-green-100 text-green-800';
      case 'BOAT': return 'bg-cyan-100 text-cyan-800';
      case 'LIFE': return 'bg-purple-100 text-purple-800';
      case 'UMBRELLA': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

        <div className="relative bg-white w-full max-w-6xl mx-4 rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex justify-between items-center">
              <div>
                <Dialog.Title className="text-xl font-bold text-white">
                  {step === 1 ? 'Select Contact' : 'Select Policy(s)'}
                </Dialog.Title>
                <p className="text-blue-100 text-sm mt-1">
                  {step === 1 
                    ? 'Choose a contact to create an Accord form for'
                    : `Choose policies for ${selectedContact?.first_name} ${selectedContact?.last_name}`
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {step === 1 ? (
              // Step 1: Contact Selection
              <div className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search contacts by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-3"
                  />
                </div>

                {/* Contacts List */}
                {contactsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-gray-600">Loading contacts...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {filteredContacts.map(contact => (
                      <div
                        key={contact.id}
                        onClick={() => handleContactSelect(contact)}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold">
                              {contact.first_name?.[0]}{contact.last_name?.[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                              {contact.first_name} {contact.last_name}
                            </h3>
                            {contact.email && (
                              <p className="text-sm text-gray-500">{contact.email}</p>
                            )}
                            {contact.phone && (
                              <p className="text-sm text-gray-500">{contact.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!contactsLoading && filteredContacts.length === 0 && (
                  <div className="text-center py-12">
                    <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'Try adjusting your search terms' : 'Add contacts to get started'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Step 2: Policy Selection
              <div className="space-y-6">
                {/* Selected Contact Info */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {selectedContact?.first_name?.[0]}{selectedContact?.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedContact?.first_name} {selectedContact?.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedContact?.address && `${selectedContact.address}, `}
                        {selectedContact?.city && `${selectedContact.city}, `}
                        {selectedContact?.state} {selectedContact?.zip}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Policy Selection Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Select Policy(s)</h3>
                  {policies.length > 0 && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {selectedPolicies.length} of {policies.length} selected
                      </span>
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {selectedPolicies.length === policies.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Policies Table */}
                {policies.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="min-w-full">
                      <thead className="bg-gray-800 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={selectedPolicies.length === policies.length && policies.length > 0}
                              onChange={handleSelectAll}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Company</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Class</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Policy</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Due</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Eff Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Exp Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {policies.map((policy) => {
                          const isSelected = selectedPolicies.find(p => p.id === policy.id);
                          return (
                            <tr
                              key={policy.id}
                              onClick={() => handlePolicyToggle(policy)}
                              className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                                isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                              }`}
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={!!isSelected}
                                  onChange={() => {}} // Handled by row click
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {policy.company}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.status)}`}>
                                  {policy.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(policy.type)}`}>
                                  {policy.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {policy.class}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                {policy.policy}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {policy.due}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {policy.effDate}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {policy.expDate}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : step === 2 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
                    <p className="text-gray-600">This contact doesn't have any policies yet</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {step === 2 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  ← Back to Contacts
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                CANCEL
              </button>
              
              {step === 2 && (
                <button
                  onClick={handleContinue}
                  disabled={selectedPolicies.length === 0}
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  NEXT
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default PolicySelectModal;