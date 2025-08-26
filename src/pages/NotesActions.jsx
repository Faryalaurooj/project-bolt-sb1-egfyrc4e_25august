import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { FiSearch, FiMoreHorizontal, FiClock, FiUser, FiMail, FiList, FiGrid, FiEye, FiImage, FiEdit2, FiTrash2, FiX, FiPlus, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import FocusedViewModal from '../components/contacts/FocusedViewModal';
import { sendOutlookEmail } from '../services/outlookSync';
import { getContactByName } from '../services/contactService';
import { getAllNotes, getAllPhoneCalls, updateNote, updatePhoneCall, deleteNote, deletePhoneCall } from '../services/api';
import AddNoteModal from '../components/campaigns/AddNoteModal';
import AddActionItemModal from '../components/campaigns/AddActionItemModal';
import { useToast } from '../hooks/useToast';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function NotesActions() {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterByDate, setFilterByDate] = useState('all');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [focusedContact, setFocusedContact] = useState(null);
  const [isFocusedViewOpen, setIsFocusedViewOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState('list');
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isAddActionItemModalOpen, setIsAddActionItemModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchAllData();
  }, [refreshKey]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [notesData, phoneCallsData] = await Promise.all([
        getAllNotes(),
        getAllPhoneCalls()
      ]);

      // Combine notes and phone calls into a single array
      const combinedItems = [
        ...notesData.map(note => ({
          ...note,
          type: note.is_action_item ? 'Action Item' : 'Note',
          date: note.created_at,
          contactName: note.contacts ? `${note.contacts.first_name} ${note.contacts.last_name}` : null
        })),
        ...phoneCallsData.map(call => ({
          ...call,
          type: call.is_action_item ? 'Action Item' : 'Phone Call',
          date: call.created_at,
          contactName: call.contacts ? `${call.contacts.first_name} ${call.contacts.last_name}` : null
        }))
      ];

      setAllItems(combinedItems);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load notes and phone calls');
    } finally {
      setLoading(false);
    }
  };

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleContactClick = async (contactName) => {
    if (!contactName) return;
    
    const [firstName, lastName] = contactName.split(' ');
    const contact = await getContactByName(firstName, lastName);
    
    if (contact) {
      setFocusedContact(contact);
      setIsFocusedViewOpen(true);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleMarkComplete = async (itemId, itemType) => {
    try {
      const item = allItems.find(i => i.id === itemId);
      if (!item) return;

      const newStatus = item.status === 'completed' ? 'pending' : 'completed';
      
      if (itemType === 'Note' || itemType === 'Action Item') {
        await updateNote(itemId, { status: newStatus });
      } else if (itemType === 'Phone Call') {
        await updatePhoneCall(itemId, { status: newStatus });
      }

      // Update local state
      setAllItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error('Error updating item status:', err);
    }
  };

  const handleDeleteItem = async (itemId, itemType) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (itemType === 'Note' || itemType === 'Action Item') {
          await deleteNote(itemId);
        } else if (itemType === 'Phone Call') {
          await deletePhoneCall(itemId);
        }
        triggerRefresh();
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const handleEditItem = (item) => {
    console.log('📝 NotesActions: handleEditItem called with item:', item);
    console.log('📝 NotesActions: Item type:', item.type, 'Is action item:', item.is_action_item);
    
    setItemToEdit(item);
    setIsEditMode(true);
    if (item.is_action_item) {
      console.log('📝 NotesActions: Opening AddActionItemModal for editing');
      setIsAddActionItemModalOpen(true);
    } else {
      console.log('📝 NotesActions: Opening AddNoteModal for editing');
      setIsAddNoteModalOpen(true);
    }
  };

  const handleSendEmail = (item) => {
    if (item.contactName && item.contacts?.email) {
      // Attempt to send via Outlook if possible, otherwise fallback to mailto
      sendOutlookEmail(
        item.contacts.email,
        `Regarding your ${item.type}: ${item.title}`,
        `Details: ${item.content || 'No content.'}`
      ).catch(() => {
        window.location.href = `mailto:${item.contacts.email}?subject=${encodeURIComponent(`Regarding your ${item.type}: ${item.title}`)}&body=${encodeURIComponent(`Details: ${item.content || 'No content.'}`)}`;
      });
    }
  };

  const getFilteredItems = () => {
    let filtered = [...allItems];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    switch (selectedTab) {
      case 0: // Notes
        filtered = filtered.filter(item => 
          (item.type === 'Note' || item.type === 'Phone Call') && !item.is_action_item
        );
        break;
      case 1: // Action Items
        filtered = filtered.filter(item => 
          item.is_action_item && item.status !== 'completed'
        );
        break;
      case 2: // Completed
        filtered = filtered.filter(item => 
          item.is_action_item && item.status === 'completed'
        );
        break;
    }

    // Apply date filter
    if (filterByDate !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      switch (filterByDate) {
        case 'today':
          cutoff.setDate(now.getDate() - 1);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      filtered = filtered.filter(item => new Date(item.date) > cutoff);
    }

    // Apply "Show my notes only" filter
    if (showOnlyMine) {
      // This would need to be implemented based on your auth system
      // filtered = filtered.filter(item => item.created_by === currentUserId);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const renderNoteContent = (item) => {
    const initials = getInitials(item.contactName);
    const formattedDate = format(new Date(item.date), 'MMM d, yyyy');

    return (
      <div key={item.id} className="group bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300 relative overflow-hidden">
        {/* Colored accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.is_action_item ? 'bg-gradient-to-b from-green-400 to-emerald-500' : 'bg-gradient-to-b from-blue-400 to-indigo-500'}`}></div>
        
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
              item.is_action_item 
                ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                : 'bg-gradient-to-br from-blue-400 to-indigo-500'
            }`}>
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  item.is_action_item 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {item.type}
                </span>
                <span className="text-xs text-gray-500">{formattedDate}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {item.contactName && (
                  <span 
                    className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium"
                    onClick={() => handleContactClick(item.contactName)}
                  >
                    {item.contactName}
                  </span>
                )}
              </h3>
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => handleEditItem(item)}
              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <FiEdit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSendEmail(item)}
              className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              title="Send Email"
            >
              <FiMail className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDeleteItem(item.id, item.type)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <FiTrash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        <div className="mb-3">
          <h4 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h4>
          <div 
            className="text-sm text-gray-600 line-clamp-3"
            dangerouslySetInnerHTML={{
              __html: item.content?.length > 200 
                ? `${item.content.slice(0, 200)}...` 
                : item.content
            }}
          />
        </div>
        
        {/* Media indicator */}
        {item.media_url && (
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <FiImage className="w-3 h-3 mr-1" />
            <span>Has attachment</span>
          </div>
        )}
      </div>
    );
  };

  const renderActionItem = (item) => {
    const initials = getInitials(item.contactName);
    const formattedDate = format(new Date(item.date), 'MMM d, yyyy');

    return (
      <div key={item.id} className="group bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-green-300 relative overflow-hidden">
        {/* Colored accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-emerald-500"></div>
        
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={item.status === 'completed'}
            onChange={() => handleMarkComplete(item.id, item.type)}
            className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">{initials}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Action Item
                    </span>
                    <span className="text-xs text-gray-500">{formattedDate}</span>
                    {item.status === 'completed' && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                        Completed
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <div className="text-sm text-gray-600">
                    {item.contactName && (
                      <span 
                        className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium"
                        onClick={() => handleContactClick(item.contactName)}
                      >
                        {item.contactName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleEditItem(item)}
                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <FiEdit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleSendEmail(item)}
                  className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                  title="Send Email"
                >
                  <FiMail className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id, item.type)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <FiTrash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <div 
                className="text-sm text-gray-600 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            </div>
            
            {/* Media indicator */}
            {item.media_url && (
              <div className="flex items-center text-xs text-gray-500">
                <FiImage className="w-3 h-3 mr-1" />
                <span>Has attachment</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderNoteGridItem = (item) => {
    const initials = getInitials(item.contactName);
    const formattedDate = format(new Date(item.date), 'MMM d, yyyy');

    return (
      <div key={item.id} className="group bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-300 relative overflow-hidden">
        {/* Colored accent corner */}
        <div className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] ${
          item.is_action_item ? 'border-t-green-400' : 'border-t-blue-400'
        }`}></div>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
              item.is_action_item 
                ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                : 'bg-gradient-to-br from-blue-400 to-indigo-500'
            }`}>
              <span className="text-white font-bold text-xs">{initials}</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
              item.is_action_item 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {item.type}
            </span>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => handleEditItem(item)}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
              title="Edit"
            >
              <FiEdit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDeleteItem(item.id, item.type)}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <FiTrash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h4>
          {item.contactName && (
            <p 
              className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 mb-2 font-medium"
              onClick={() => handleContactClick(item.contactName)}
            >
              {item.contactName}
            </p>
          )}
          <div 
            className="text-xs text-gray-600 line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: item.content?.length > 80 
                ? `${item.content.slice(0, 80)}...` 
                : item.content
            }}
          />
        </div>

        {/* Media Preview */}
        {item.media_url && (
          <div className="mb-4">
            <div className="w-full h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
              <FiImage className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <FiClock className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
          <button
            onClick={() => handleContactClick(item.contactName)}
            className="text-blue-600 hover:text-blue-700 flex items-center font-medium"
          >
            <FiEye className="w-3 h-3 mr-1" />
            View
          </button>
        </div>
      </div>
    );
  };

  const renderActionGridItem = (item) => {
    const initials = getInitials(item.contactName);
    const formattedDate = format(new Date(item.date), 'MMM d, yyyy');

    return (
      <div key={item.id} className="group bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 hover:border-green-300 relative overflow-hidden">
        {/* Colored accent corner */}
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-green-400"></div>
        
        {/* Header with Checkbox */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={item.status === 'completed'}
              onChange={() => handleMarkComplete(item.id, item.type)}
              className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">{initials}</span>
              </div>
              <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Action Item
              </span>
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => handleEditItem(item)}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
              title="Edit"
            >
              <FiEdit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDeleteItem(item.id, item.type)}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <FiTrash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h4>
          {item.contactName && (
            <p 
              className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 mb-2 font-medium"
              onClick={() => handleContactClick(item.contactName)}
            >
              {item.contactName}
            </p>
          )}
          <div 
            className="text-xs text-gray-600 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <FiClock className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
          <button
            onClick={() => handleSendEmail(item)}
            className="text-blue-600 hover:text-blue-700 flex items-center font-medium"
          >
            <FiMail className="w-3 h-3 mr-1" />
            Email
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Enhanced Page Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Notes & Actions</h1>
              <p className="text-gray-600">Manage your notes, action items, and follow-ups</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">...</div>
              <div className="text-sm text-gray-500">Loading</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-64 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600 font-medium">Loading notes and actions...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Enhanced Page Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Notes & Actions</h1>
              <p className="text-gray-600">Manage your notes, action items, and follow-ups</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">!</div>
              <div className="text-sm text-gray-500">Error</div>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={fetchAllData}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center mx-auto"
          >
            <FiRefreshCw className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Notes & Actions</h1>
            <p className="text-gray-600">Manage your notes, action items, and follow-ups</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{allItems.filter(item => !item.is_action_item).length}</div>
              <div className="text-sm text-gray-500">Notes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{allItems.filter(item => item.is_action_item && item.status !== 'completed').length}</div>
              <div className="text-sm text-gray-500">Pending Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{allItems.filter(item => item.is_action_item && item.status === 'completed').length}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              <FiPlus className="mr-2 w-4 h-4" />
              Add Note
            </button>
            <button
              onClick={() => setIsAddActionItemModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              <FiPlus className="mr-2 w-4 h-4" />
              Add Action Item
            </button>
          </div>
          <button
            onClick={fetchAllData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Tab.Group onChange={setSelectedTab}>
        {/* Enhanced Tab Navigation */}
        <Tab.List className="flex space-x-1 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 p-1 shadow-sm">
          {['NOTES', 'ACTION ITEMS', 'COMPLETED'].map((category, idx) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-3 px-6 text-sm font-semibold transition-all duration-200 focus:outline-none',
                  selected
                    ? 'bg-white text-blue-700 shadow-md transform scale-105'
                    : 'text-blue-600 hover:bg-white hover:bg-opacity-50 hover:text-blue-800'
                )
              }
            >
              <div className="flex items-center justify-center space-x-2">
                {idx === 0 && <span className="text-blue-500">📝</span>}
                {idx === 1 && <span className="text-green-500">⚡</span>}
                {idx === 2 && <span className="text-gray-500">✅</span>}
                <span>{category}</span>
              </div>
            </Tab>
          ))}
        </Tab.List>

        {/* Enhanced Controls Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="List View"
                >
                  <FiList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Grid View"
                >
                  <FiGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Enhanced Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400 w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${selectedTab === 0 ? 'notes' : 'action items'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 w-64 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-2 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Enhanced Filters */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-2 text-sm"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>

                <select
                  value={filterByDate}
                  onChange={(e) => setFilterByDate(e.target.value)}
                  className="rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-2 text-sm"
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Enhanced Checkbox */}
              <label className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyMine}
                  onChange={(e) => setShowOnlyMine(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 font-medium">
                  My {selectedTab === 0 ? 'notes' : 'action items'} only
                </span>
              </label>
            </div>
          </div>
        </div>

        <Tab.Panels>
          <Tab.Panel>
            {viewMode === 'list' ? (
              <div className="space-y-3">
                {getFilteredItems().map(item => renderNoteContent(item))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getFilteredItems().map(item => renderNoteGridItem(item))}
              </div>
            )}
            {getFilteredItems().length === 0 && (
              <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-blue-300">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No notes found</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first note</p>
                <button
                  onClick={() => setIsAddNoteModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FiPlus className="mr-2" />
                  Create Your First Note
                </button>
              </div>
            )}
          </Tab.Panel>
          <Tab.Panel>
            {viewMode === 'list' ? (
              <div className="space-y-3">
                {getFilteredItems().map(item => renderActionItem(item))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getFilteredItems().map(item => renderActionGridItem(item))}
              </div>
            )}
            {getFilteredItems().length === 0 && (
              <div className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-dashed border-green-300">
                <div className="text-6xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No pending action items</h3>
                <p className="text-gray-600 mb-6">Create action items to track important tasks</p>
                <button
                  onClick={() => setIsAddActionItemModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FiPlus className="mr-2" />
                  Create Your First Action Item
                </button>
              </div>
            )}
          </Tab.Panel>
          <Tab.Panel>
            {viewMode === 'list' ? (
              <div className="space-y-3">
                {getFilteredItems().map(item => renderActionItem(item))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getFilteredItems().map(item => renderActionGridItem(item))}
              </div>
            )}
            {getFilteredItems().length === 0 && (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No completed action items</h3>
                <p className="text-gray-600 mb-6">Completed action items will appear here</p>
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <FocusedViewModal
        isOpen={isFocusedViewOpen}
        onClose={() => setIsFocusedViewOpen(false)}
        contact={focusedContact}
        onNoteSaved={triggerRefresh}
        onActionItemSaved={triggerRefresh}
        onPhoneCallSaved={triggerRefresh}
      />

      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => {
          setIsAddNoteModalOpen(false);
          setIsEditMode(false);
          setItemToEdit(null);
        }}
        contact={itemToEdit?.contacts}
        onNoteSaved={triggerRefresh}
        isEditMode={isEditMode}
        initialData={itemToEdit}
      />

      <AddActionItemModal
        isOpen={isAddActionItemModalOpen}
        onClose={() => {
          setIsAddActionItemModalOpen(false);
          setIsEditMode(false);
          setItemToEdit(null);
        }}
        contact={itemToEdit?.contacts}
        onActionItemSaved={triggerRefresh}
        isEditMode={isEditMode}
        initialData={itemToEdit}
      />
    </div>
  );
}

export default NotesActions;