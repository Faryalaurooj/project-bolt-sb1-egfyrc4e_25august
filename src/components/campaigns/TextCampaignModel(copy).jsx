import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSearch, FiArrowLeft, FiSend, FiUser, FiChevronDown } from 'react-icons/fi';
import { createTextCampaign, getContacts, createTextMessage } from '../../services/api';
import ContactSelectModal from '../contacts/ContactSelectModal';
import EmployeeSelectModal from './EmployeeSelectModal';
import { useAuth } from '../../context/AuthContext';

function TextCampaignModal({ isOpen, onClose, preSelectedContacts = [] }) {
  const { user } = useAuth();
  
  // Debug logging
  console.log('📱 TextCampaignModal rendered - isOpen:', isOpen);

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
      // Set default send from to logged in user's email
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
      
      // Save as text campaign
      const campaign = await createTextCampaign({
        title,
        message,
        status: 'draft'
      }, selectedContacts.map(c => c.id));
      
      // Also save as individual draft messages for each contact
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
      
      // Reset form
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
      
      // Create text campaign
      const campaign = await createTextCampaign({
        title,
        message,
        status: 'sent',
        scheduled_at: new Date().toISOString()
      }, selectedContacts.map(c => c.id));
      
      // Create individual text messages for each contact
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
        
        // Simulate auto-reply for your test number
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
      
      // Reset form
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
    console.log('📱 TextCampaignModal: Contact selected:', contact);
    
    // Check if contact is already selected
    const isAlreadySelected = selectedContacts.find(c => c.id === contact.id);
    if (!isAlreadySelected) {
      const newSelectedContacts = [...selectedContacts, contact];
      setSelectedContacts(newSelectedContacts);
      console.log('📱 TextCampaignModal: Updated selected contacts:', newSelectedContacts);
    }
  };

  const handleRemoveContact = (contactId) => {
    setSelectedContacts(selectedContacts.filter(c => c.id !== contactId));
  };

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSendFromChange = (value) => {
    if (value === 'select_employee') {
      setIsEmployeeSelectOpen(true);
    } else {
      setSendFrom(value);
    }
  };

  const characterCount = message.length;
  const maxCharacters = 160;

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-[9999] overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

          <div className="relative bg-white w-full max-w-7xl mx-4 rounded-lg shadow-xl flex">
            {/* Main Content */}
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

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send from:
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Hi {first name},"
                  maxLength={maxCharacters}
                />
                <div className="flex justify-between items-center mt-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    Use message template
                  </button>
                  <span className="text-sm text-gray-500">
                    {characterCount} / {maxCharacters} characters
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-md mb-6">
                <div className="bg-blue-500 text-white px-3 py-1 rounded text-xs inline-block mb-2">
                  Required by CAN-SPAM
                </div>
                <p>If you'd prefer not to hear from me by text message, please reply back with "Stop".</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleSaveAsDraft}
                  disabled={loading}
                  className="btn-interactive-hover-secondary px-4 py-2 disabled:opacity-50 disabled:hover:transform-none disabled:hover:scale-100"
                >
                  Save as draft
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="btn-interactive-hover-primary px-4 py-2 rounded-md disabled:opacity-50 disabled:hover:transform-none disabled:hover:scale-100"
                >
                  {loading ? 'Sending...' : 'Send Campaign'}
                </button>
              </div>
            </div>

            {/* Recipients Sidebar */}
            <div className="w-80 p-6 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-4">Recipients</h3>
              
              <div className="mb-4">
                <span className="text-sm text-gray-600">
                  {selectedContacts.length} out of {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} with phone numbers
                </span>
              </div>

              <button
                onClick={handleSendTest}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
              >
                <FiSend className="mr-2" />
                Send a Test
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Add additional contacts"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Selected Contacts */}
              {selectedContacts.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Contacts</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedContacts.map(contact => (
                      <div key={contact.id} className="flex items-center justify-between bg-white p-2 rounded border">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-blue-600">
                              {contact.first_name?.[0] || contact.name?.[0] || 'C'}{contact.last_name?.[0] || contact.name?.split(' ')[1]?.[0] || ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm">{contact.first_name ? `${contact.first_name} ${contact.last_name}` : contact.name}</span>
                            {contact.phone && (
                              <div className="text-xs text-gray-500">{contact.phone}</div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveContact(contact.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Tags</h4>
                <div className="space-y-2">
                  {popularTags.map(tag => (
                    <label key={tag.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{tag.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Contacts</h4>
                <p className="text-sm text-gray-500 mb-2">
                  You can use the search to add individual contacts to your campaign.
                </p>
                {loading && (
                  <p className="text-sm text-gray-500">Loading contacts...</p>
                )}
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <button
                  onClick={() => setIsContactSelectOpen(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Browse all contacts ({contacts.length})
                </button>
              </div>

              <div className="mt-auto">
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Recipients selected:</span>
                    <span className="text-sm font-medium">{selectedContacts.length}</span>
                  </div>
                  <label className="flex items-center text-xs text-gray-500">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    I agree that the recipients have opted in to receive texts and this is not a marketing campaign.
                  </label>
                </div>
                <button className="w-full btn-interactive-hover-primary px-4 py-2 rounded-md mt-4">
                  Next: Send Options
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <ContactSelectModal
        isOpen={isContactSelectOpen}
        onClose={() => setIsContactSelectOpen(false)}
        onContactSelect={handleContactSelect}
      />

      <EmployeeSelectModal
        isOpen={isEmployeeSelectOpen}
        onClose={() => setIsEmployeeSelectOpen(false)}
        onEmployeeSelect={(employee) => {
          setSendFrom(employee);
          setIsEmployeeSelectOpen(false);
        }}
      />
    </>
  );
}

export default TextCampaignModal;