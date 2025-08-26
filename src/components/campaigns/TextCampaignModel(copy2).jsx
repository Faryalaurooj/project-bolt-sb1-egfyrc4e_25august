import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSearch, FiArrowLeft, FiSend, FiChevronDown } from 'react-icons/fi';
import { createTextCampaign, getContacts, createTextMessage } from '../../services/api';
import ContactSelectModal from '../contacts/ContactSelectModal';
import EmployeeSelectModal from './EmployeeSelectModal';
import { useAuth } from '../../context/AuthContext';

function TextCampaignModal({ isOpen, onClose, preSelectedContacts = [] }) {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('Hi {first name},');
  const [sendFrom, setSendFrom] = useState('');
  const [selectedContacts, setSelectedContacts] = useState(preSelectedContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isContactSelectOpen, setIsContactSelectOpen] = useState(false);
  const [isEmployeeSelectOpen, setIsEmployeeSelectOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef();

  const popularTags = [
    { id: 'all', label: 'All Contacts' },
    { id: 'prospect', label: 'Prospect' },
    { id: 'personal', label: 'Personal Lines' },
    { id: 'client', label: 'Client' },
    { id: 'personal_tag', label: 'Personal' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      if (user?.email) {
        setSendFrom(user.email);
      }
    }
  }, [isOpen, user]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const contactsData = await getContacts();
      setContacts(contactsData || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendTest = () => {
    alert('Test message will be sent!');
  };

  const handleSaveAsDraft = async () => {
    if (!title.trim()) {
      setError('Please enter a campaign title');
      return;
    }
    try {
      setLoading(true);
      const campaign = await createTextCampaign(
        { title, message, status: 'draft' },
        selectedContacts.map((c) => c.id)
      );
      for (const contact of selectedContacts) {
        await createTextMessage({
          contact_id: contact.id,
          recipient_phone: contact.phone,
          sender_phone: '+00923475365823',
          content: message,
          status: 'draft',
          direction: 'outgoing',
          campaign_id: campaign.id
        });
      }
      alert('Campaign saved as draft!');
      setTitle('');
      setMessage('Hi {first name},');
      setSelectedContacts([]);
      onClose();
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Please enter both title and message');
      return;
    }
    if (selectedContacts.length === 0) {
      setError('Please select at least one recipient');
      return;
    }
    try {
      setLoading(true);
      const campaign = await createTextCampaign(
        {
          title,
          message,
          status: 'sent',
          scheduled_at: new Date().toISOString()
        },
        selectedContacts.map((c) => c.id)
      );
      for (const contact of selectedContacts) {
        await createTextMessage({
          contact_id: contact.id,
          recipient_phone: contact.phone,
          sender_phone: '+00923475365823',
          content: message.replace('{first name}', contact.first_name || contact.name?.split(' ')[0] || 'there'),
          status: 'sent',
          direction: 'outgoing',
          campaign_id: campaign.id,
          sent_at: new Date().toISOString()
        });
        if (contact.phone === '+00923475365823') {
          setTimeout(async () => {
            try {
              await createTextMessage({
                contact_id: contact.id,
                recipient_phone: '+00923475365823',
                sender_phone: contact.phone,
                content: `Thanks for your campaign message! This is an auto-reply from ${contact.first_name || contact.name}.`,
                status: 'received',
                direction: 'incoming',
                sent_at: new Date().toISOString()
              });
            } catch (err) {
              console.error('Error creating campaign auto-reply:', err);
            }
          }, 3000);
        }
      }
      alert('Campaign sent successfully!');
      setTitle('');
      setMessage('Hi {first name},');
      setSelectedContacts([]);
      onClose();
    } catch (err) {
      console.error('Error sending campaign:', err);
      setError('Failed to send campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSelect = (contact) => {
    const isAlreadySelected = selectedContacts.find((c) => c.id === contact.id);
    if (!isAlreadySelected) {
      setSelectedContacts([...selectedContacts, contact]);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleRemoveContact = (id) => {
    setSelectedContacts(selectedContacts.filter((c) => c.id !== id));
  };

  const handleSendFromChange = (val) => {
    if (val === 'select_employee') setIsEmployeeSelectOpen(true);
    else setSendFrom(val);
  };

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm)
  );

  const characterCount = message.length;
  const maxCharacters = 160;

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="relative bg-white w-full max-w-7xl mx-4 rounded-lg shadow-xl flex">
            <div className="flex-1 p-6 border-r">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <button onClick={onClose} className="mr-4 text-gray-500 hover:text-gray-700">
                    <FiArrowLeft className="h-6 w-6" />
                  </button>
                  <h2 className="text-xl font-semibold text-blue-600">New Texting Campaign</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add title..."
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Send from:</label>
                <div className="relative">
                  <select
                    value={sendFrom}
                    onChange={(e) => handleSendFromChange(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 appearance-none pr-10"
                  >
                    <option value={user?.email || 'Current User'}>{user?.email || 'Current User'}</option>
                    <option value="owner_of_recipient">Owner of the recipient</option>
                    <option value="select_employee">Select an employee</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Hi {first name},"
                  maxLength={maxCharacters}
                />
                <div className="flex justify-between items-center mt-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm">Use message template</button>
                  <span className="text-sm text-gray-500">
                    {characterCount} / {maxCharacters} characters
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-md mb-6">
                <div className="bg-blue-500 text-white px-3 py-1 rounded text-xs inline-block mb-2">Required by CAN-SPAM</div>
                <p>If you'd prefer not to hear from me by text message, please reply back with "Stop".</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button onClick={handleSaveAsDraft} disabled={loading} className="btn-interactive-hover-secondary px-4 py-2 disabled:opacity-50">
                  Save as draft
                </button>
                <button onClick={handleSend} disabled={loading} className="btn-interactive-hover-primary px-4 py-2 rounded-md disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Campaign'}
                </button>
              </div>
            </div>

            {/* Recipients Sidebar */}
            <div className="w-80 p-6 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-4">Recipients</h3>

              <span className="text-sm text-gray-600 mb-4 block">
                {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
              </span>

              <button onClick={handleSendTest} className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
                <FiSend className="mr-2" />
                Send a Test
              </button>

              {/* Search & Dropdown */}
              <div className="relative mb-4" ref={searchRef}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Add additional contacts"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {showSuggestions && searchTerm && (
                  <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto border border-gray-300 rounded-md bg-white shadow-md z-10">
                    {filteredContacts.length > 0 ? (
                      filteredContacts.slice(0, 10).map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => handleContactSelect(contact)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm border-b last:border-b-0"
                        >
                          <div className="font-medium">
                            {contact.first_name || contact.name} {contact.last_name}
                          </div>
                          <div className="text-xs text-gray-500">{contact.phone}</div>
                        </button>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 px-4 py-2">No matching contacts found.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Contacts */}
              <div className="mb-6">
                {selectedContacts.map((contact) => (
                  <div key={contact.id} className="flex justify-between items-center bg-white p-2 rounded border mb-2">
                    <div>
                      <div className="font-medium text-sm">
                        {contact.first_name || contact.name} {contact.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{contact.phone}</div>
                    </div>
                    <button onClick={() => handleRemoveContact(contact.id)} className="text-red-500 hover:text-red-700">
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <ContactSelectModal isOpen={isContactSelectOpen} onClose={() => setIsContactSelectOpen(false)} onContactSelect={handleContactSelect} />
              <EmployeeSelectModal
                isOpen={isEmployeeSelectOpen}
                onClose={() => setIsEmployeeSelectOpen(false)}
                onEmployeeSelect={(employee) => {
                  setSendFrom(employee);
                  setIsEmployeeSelectOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default TextCampaignModal;
