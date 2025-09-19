import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSearch, FiUser } from 'react-icons/fi';
import { searchContactsAndUsers } from '../../services/api';

function ContactSelectModal({ isOpen, onClose, onContactSelect, multiSelect = false, shouldCloseOnSelect = true }) {
  const [allRecipients, setAllRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchAllRecipients();
    }
  }, [isOpen]);

  const fetchAllRecipients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('👥 ContactSelectModal: Starting to fetch all recipients...');
      console.log('👥 ContactSelectModal: Fetching contacts and users...');
      const data = await searchContactsAndUsers('');
      console.log('👥 ContactSelectModal: Search results:', data?.length || 0);
      setAllRecipients(data || []);
    } catch (err) {
      console.error('Error fetching contacts and users:', err);
      setError('Failed to load contacts and users');
      setAllRecipients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipients = allRecipients.filter(recipient => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = (recipient.name || recipient.full_name || '').toLowerCase();
    const email = (recipient.email || '').toLowerCase();
    const phone = (recipient.phone || recipient.contact_number || '').toLowerCase();
    return fullName.includes(searchLower) || 
           email.includes(searchLower) || 
           phone.includes(searchLower);
  });

  const handleContactClick = (recipient) => {
    console.log('📱 ContactSelectModal: Recipient clicked:', recipient);
    
    if (multiSelect) {
      const isSelected = selectedContacts.find(c => c.id === recipient.id && c.type === recipient.type);
      if (isSelected) {
        setSelectedContacts(selectedContacts.filter(c => !(c.id === recipient.id && c.type === recipient.type)));
      } else {
        setSelectedContacts([...selectedContacts, recipient]);
      }
    } else {
      console.log('📱 ContactSelectModal: Calling onContactSelect with:', recipient);
      onContactSelect(recipient);
      if (!multiSelect && shouldCloseOnSelect) {
        onClose();
        setSearchTerm('');
      }
    }
  };

  const handleSelectAll = () => {
    if (multiSelect) {
      if (selectedContacts.length === filteredRecipients.length) {
        setSelectedContacts([]);
      } else {
        setSelectedContacts([...filteredRecipients]);
      }
    }
  };

  const handleConfirmSelection = () => {
    if (multiSelect && selectedContacts.length > 0) {
      selectedContacts.forEach(recipient => onContactSelect(recipient));
      setSelectedContacts([]);
      onClose();
      setSearchTerm('');
    }
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return '';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getRecipientInitials = (recipient) => {
    if (recipient.type === 'user') {
      return getInitials(recipient.first_name, recipient.last_name) || 
             (recipient.email ? recipient.email.substring(0, 2).toUpperCase() : 'TM');
    } else {
      return getInitials(recipient.first_name, recipient.last_name);
    }
  };
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white w-full max-w-2xl mx-4 rounded-lg shadow-xl">
          <div className="flex justify-between items-center p-6 border-b">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Select Contact{multiSelect ? 's' : ''} or Team Member{multiSelect ? 's' : ''}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search contacts and team members by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
              {error && (
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchAllRecipients}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Try again
                  </button>
                </div>
              )}

            {multiSelect && (
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">
                  {selectedContacts.length} recipient{selectedContacts.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedContacts.length === filteredRecipients.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                  <p className="text-gray-600">Loading contacts and users...</p>
                </div>
              )}


              {!loading && !error && filteredRecipients.length === 0 && (
                <div className="text-center py-8">
                  <FiUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No contacts or users found matching your search.' : 'No contacts or users available.'}
                  </p>
                </div>
              )}

              {!loading && !error && filteredRecipients.length > 0 && (
                <div className="space-y-2">
                  {filteredRecipients.map((recipient) => {
                    const isSelected = multiSelect && selectedContacts.find(c => c.id === recipient.id && c.type === recipient.type);
                    return (
                      <div
                        key={`${recipient.type}-${recipient.id}`}
                        onClick={() => handleContactClick(recipient)}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        {multiSelect && (
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={() => {}} // Handled by onClick
                            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        )}
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {getRecipientInitials(recipient)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {recipient.name || recipient.full_name}
                            </p>
                            {recipient.type === 'user' && (
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                                Team
                              </span>
                            )}
                          </div>
                          {recipient.email && (
                            <p className="text-sm text-gray-500">{recipient.email}</p>
                          )}
                          {(recipient.phone || recipient.contact_number) && (
                            <p className="text-sm text-gray-500">{recipient.phone || recipient.contact_number}</p>
                          )}
                          {!recipient.phone && !recipient.contact_number && (
                            <p className="text-xs text-yellow-600">No phone number</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end p-6 border-t space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            {multiSelect && (
              <button
                onClick={handleConfirmSelection}
                disabled={selectedContacts.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add {selectedContacts.length} Recipient{selectedContacts.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default ContactSelectModal;