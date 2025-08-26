import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiUser, FiMail, FiPhone, FiSave, FiRefreshCcw } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, getUserProfile } from '../../services/api';
import { initializeOutlookSync } from '../../services/outlookSync';

function UserProfileModal({ isOpen, onClose }) {
  const { user, updateUserInContext } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    contact_number: '',
    email: '',
    outlook_email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      // Initialize form with current user data
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        contact_number: user.contact_number || '',
        email: user.email || '',
        outlook_email: user.outlook_email || ''
      });
      fetchUserProfile();
    }
  }, [isOpen, user]);

  const fetchUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        contact_number: profile.contact_number || '',
        email: profile.email || user?.email || '',
        outlook_email: profile.outlook_email || ''
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedProfile = await updateUserProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        contact_number: formData.contact_number,
        outlook_email: formData.outlook_email
      });

      // Update the auth context with new data immediately
      updateUserInContext({
        first_name: formData.first_name,
        last_name: formData.last_name,
        contact_number: formData.contact_number,
        outlook_email: formData.outlook_email
      });
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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

        <div className="relative bg-white w-full max-w-md mx-4 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-semibold text-white">
                    Edit Profile
                  </Dialog.Title>
                  <p className="text-blue-100 text-sm">Update your contact information</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline w-4 h-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiPhone className="inline w-4 h-4 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
                  placeholder="Enter phone number (e.g., +1234567890)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required for sending text messages
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline w-4 h-4 mr-2" />
                  Outlook Email Address
                </label>
                <input
                  type="email"
                  name="outlook_email"
                  value={formData.outlook_email}
                  onChange={handleChange}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2"
                  placeholder="your.outlook@company.com"
                />
                {formData.outlook_email && (
                  <button
                    type="button"
                    onClick={initializeOutlookSync}
                    className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                  >
                    <FiRefreshCcw className="w-3 h-3 mr-1" /> Reconnect Outlook
                  </button>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Link your Outlook calendar to sync events
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default UserProfileModal;