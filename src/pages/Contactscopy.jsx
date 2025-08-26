import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUser, FiUsers, FiTag, FiStar, FiBell, FiX, FiMail, FiMessageSquare } from 'react-icons/fi';
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

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Contacts() {
  const [activeTab, setActiveTab] = useState(0);
  const [contacts, setContacts] = useState([
    {
      id: '1',
      firstName: 'Martha',
      lastName: 'Crawford',
      email: 'mhz.crawford@gmail.com',
      phone: '(555) 123-4567',
      tags: ['All Contacts', 'Auto 6', 'Client'],
      creationDate: '2024-01-15'
    },
    {
      id: '2',
      firstName: 'Ricki',
      lastName: 'Reiner',
      email: 'ricki.reiner@example.com',
      phone: '(555) 987-6543',
      tags: ['All Contacts', 'Client', 'Auto'],
      creationDate: '2024-02-01'
    }
  ]);

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
  const [focusedContact, setFocusedContact] = useState(null);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(contact => contact.id !== id));
      setSelectedContacts(selectedContacts.filter(contactId => contactId !== id));
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

  const handleBulkAction = (action) => {
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
        setIsMergeModalOpen(true);
        break;
      case 'focused':
        if (selectedContacts.length === 1) {
          const contact = contacts.find(c => c.id === selectedContacts[0]);
          setFocusedContact(contact);
          setIsFocusedViewOpen(true);
        }
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
    setFocusedContact(contact);
    setIsFocusedViewOpen(true);
  };

  const filteredContacts = contacts.filter(contact => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTermLower) ||
      contact.email.toLowerCase().includes(searchTermLower) ||
      contact.phone.includes(searchTermLower)
    );
  });

  return (
    <div className="space-y-6">
      <Tab.Group onChange={setActiveTab}>
        <Tab.List className="flex space-x-4 border-b">
          <Tab className={({ selected }) =>
            classNames(
              'py-2 px-4 text-sm font-medium focus:outline-none',
              selected
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            )
          }>
            <div className="flex items-center">
              <FiUsers className="mr-2" />
              People
            </div>
          </Tab>
          <Tab className={({ selected }) =>
            classNames(
              'py-2 px-4 text-sm font-medium focus:outline-none',
              selected
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            )
          }>
            <div className="flex items-center">
              <FiUser className="mr-2" />
              Companies
            </div>
          </Tab>
          <Tab className={({ selected }) =>
            classNames(
              'py-2 px-4 text-sm font-medium focus:outline-none',
              selected
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            )
          }>
            <div className="flex items-center">
              <FiTag className="mr-2" />
              Tags
            </div>
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* People Tab Panel */}
          <Tab.Panel>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    <span className="mr-2">🎮</span>
                    Tagging Game
                  </button>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">{contacts.length} contacts</span>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setIsNewContactModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    New Contact
                  </button>
                  <button
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    Import from File
                  </button>
                </div>
              </div>

              <BulkActionsBar
                selectedCount={selectedContacts.length}
                onAction={handleBulkAction}
              />

              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <button className="text-blue-600 hover:text-blue-700">
                  Save Search
                </button>
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedContacts.length === filteredContacts.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creation Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => handleSelectContact(contact.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={() => handleContactClick(contact)}
                          >
                            {contact.firstName} {contact.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-gray-400 hover:text-gray-600"
                              title={contact.email}
                            >
                              <FiMail className="w-5 h-5" />
                            </a>
                            <a
                              href={`sms:${contact.phone}`}
                              className="text-gray-400 hover:text-gray-600"
                              title={contact.phone}
                            >
                              <FiMessageSquare className="w-5 h-5" />
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(contact.creationDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(contact.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Panel>

          {/* Companies Tab Panel */}
          <Tab.Panel>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{companies.length} companies</span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                  <FiPlus className="mr-2" />
                  New Company
                </button>
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companies.map((company) => (
                      <tr key={company.id}>
                        <td className="px-6 py-4">
                          <div className="text-blue-600 hover:text-blue-800 cursor-pointer">
                            {company.name}
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
                          {company.domain}
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
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{tags.length} tags</span>
                <div className="flex space-x-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Add Tag
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
                    Generate Report
                  </button>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Companies</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag Notifications</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tags.map((tag) => (
                      <tr key={tag.id}>
                        <td className="px-6 py-4">
                          <div className="text-blue-600 hover:text-blue-800 cursor-pointer">
                            {tag.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {tag.contactCount}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {tag.companyCount}
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-800">
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
      />
      
      <TextCampaignModal
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
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
        selectedContacts={selectedContacts.map(id => contacts.find(c => c.id === id))}
      />

      <FocusedViewModal
        isOpen={isFocusedViewOpen}
        onClose={() => setIsFocusedViewOpen(false)}
        contact={focusedContact}
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
      />
    </div>
  );
}

export default Contacts;