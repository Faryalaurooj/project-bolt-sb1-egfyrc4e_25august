import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiSearch, FiX, FiUser } from 'react-icons/fi';
import { getUsers } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

function UserSelectModal({ isOpen, onClose, onUserSelected, placeholder = "Search team members..." }) {
  const { user: currentUser } = useAuth();
  const { showError } = useToast();
  
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('👥 UserSelectModal: Fetching team members...');
      const usersData = await getUsers();
      console.log('👥 UserSelectModal: Users fetched:', usersData?.length || 0);
      
      // Filter out current user
      const filteredUsers = (usersData || []).filter(teamUser => teamUser.id !== currentUser?.id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to load team members');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = query.toLowerCase();
    const firstName = String(user.first_name || '').toLowerCase();
    const lastName = String(user.last_name || '').toLowerCase();
    const fullName = (firstName + ' ' + lastName).trim();
    const email = String(user.email || '').toLowerCase();

    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  const handleSelect = (user) => {
    onUserSelected(user);
    setQuery('');
    onClose();
  };

  const getUserDisplayName = (user) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
           user.email?.split('@')[0] || 
           'Team Member';
  };

  const getUserInitials = (user) => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || 'T';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <Dialog.Title className="text-xl font-bold text-gray-900">
                Start Team Chat
              </Dialog.Title>
              <p className="text-gray-600 text-sm">Select a team member to chat with</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Search input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* User list */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading team members...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className="flex items-center w-full px-3 py-3 text-left rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mr-3 shadow-md group-hover:scale-110 transition-transform">
                    {getUserInitials(user)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {getUserDisplayName(user)}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Available</span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <FiUser className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  {query ? 'No team members found' : 'No team members available'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default UserSelectModal;