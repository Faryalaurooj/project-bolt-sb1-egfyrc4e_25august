import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  FiUser, FiMail, FiShield, FiShare2, FiCreditCard, 
  FiEdit, FiSettings, FiBriefcase, FiFileText, FiCalendar, 
  FiUsers, FiVolume2, FiVolumeX, FiChevronDown, FiSave,
  FiUpload, FiCamera, FiLock, FiBell, FiGlobe
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/api';
import { useSound } from '../hooks/useSound';
import { useToast } from '../hooks/useToast';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Settings() {
  const { user } = useAuth();
  const { isMuted, selectedSound, toggleMute, changeSound, playMessageSound } = useSound();
  const { showSuccess, showError } = useToast();
  
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    contact_number: user?.contact_number || '',
    outlook_email: user?.outlook_email || '',
    timezone: 'UTC-5 (Eastern)',
    avatar_url: user?.avatar_url || null
  });
  const [loading, setLoading] = useState(false);

  const soundOptions = [
    { value: 'default', label: 'Default', description: 'Classic notification sound' },
    { value: 'chime', label: 'Chime', description: 'Gentle chime sound' },
    { value: 'ding', label: 'Ding', description: 'Simple ding sound' },
    { value: 'bell', label: 'Bell', description: 'Bell notification' },
    { value: 'pop', label: 'Pop', description: 'Quick pop sound' }
  ];

  const handleSectionToggle = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await updateUserProfile(profileData);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      showError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real implementation, this would upload to Supabase storage
      const fileUrl = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, avatar_url: fileUrl }));
      showSuccess('Avatar uploaded! (Demo mode)');
    }
  };

  const testSound = (soundName) => {
    const originalSound = selectedSound;
    changeSound(soundName);
    setTimeout(() => {
      playMessageSound();
      changeSound(originalSound);
    }, 100);
  };

  const personalSections = [
    {
      id: 'profile',
      title: 'Profile',
      description: 'Change your name, contact info, and time zone.',
      icon: FiUser,
      content: (
        <div className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                {profileData.avatar_url ? (
                  <img
                    src={profileData.avatar_url}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {profileData.first_name?.[0]}{profileData.last_name?.[0]}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                <FiCamera className="w-3 h-3 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Profile Photo</h4>
              <p className="text-sm text-gray-600">Upload a photo to personalize your profile</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                value={profileData.first_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                value={profileData.last_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
            <input
              type="tel"
              value={profileData.contact_number}
              onChange={(e) => setProfileData(prev => ({ ...prev, contact_number: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Outlook Email</label>
            <input
              type="email"
              value={profileData.outlook_email}
              onChange={(e) => setProfileData(prev => ({ ...prev, outlook_email: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="your.outlook@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
            <select
              value={profileData.timezone}
              onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="UTC-5 (Eastern)">UTC-5 (Eastern)</option>
              <option value="UTC-6 (Central)">UTC-6 (Central)</option>
              <option value="UTC-7 (Mountain)">UTC-7 (Mountain)</option>
              <option value="UTC-8 (Pacific)">UTC-8 (Pacific)</option>
            </select>
          </div>

          <button
            onClick={handleProfileUpdate}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Notifications & Sounds',
      description: 'Manage notification preferences and alert sounds.',
      icon: FiBell,
      content: (
        <div className="space-y-6">
          {/* Sound Settings */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiVolume2 className="mr-2 text-blue-600" />
              Chat Sound Settings
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Message Alerts</h5>
                  <p className="text-sm text-gray-600">Play sound when new messages arrive</p>
                </div>
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isMuted 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {isMuted ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Alert Sound</label>
                <div className="space-y-2">
                  {soundOptions.map(option => (
                    <div
                      key={option.value}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSound === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => changeSound(option.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h6 className="font-medium text-gray-900">{option.label}</h6>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            testSound(option.value);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Other Notification Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Other Notifications</h4>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">Email Notifications</span>
                  <p className="text-sm text-gray-600">Receive email alerts for important updates</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </label>
              
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">Desktop Notifications</span>
                  <p className="text-sm text-gray-600">Show browser notifications for new messages</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </label>
              
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">Task Reminders</span>
                  <p className="text-sm text-gray-600">Get notified about upcoming task deadlines</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </label>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'keepintouch',
      title: 'Keep in Touch, Email & Calendar Settings',
      description: 'Adjust email frequency, recent meetings, and calendar settings.',
      icon: FiMail,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Email & Calendar Integration</h4>
            <p className="text-gray-600 mb-4">Configure your email and calendar preferences for better workflow integration.</p>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-gray-700">Sync Outlook Calendar</span>
                <input type="checkbox" className="w-5 h-5 text-green-600 rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-700">Auto-schedule follow-ups</span>
                <input type="checkbox" className="w-5 h-5 text-green-600 rounded" />
              </label>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Change your password and manage two-factor authentication settings.',
      icon: FiShield,
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 p-6 rounded-xl border border-red-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiLock className="mr-2 text-red-600" />
              Security Settings
            </h4>
            <div className="space-y-4">
              <button className="w-full p-4 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left">
                <h5 className="font-medium text-gray-900">Change Password</h5>
                <p className="text-sm text-gray-600">Update your account password</p>
              </button>
              <button className="w-full p-4 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left">
                <h5 className="font-medium text-gray-900">Two-Factor Authentication</h5>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'social',
      title: 'Social Media',
      description: 'Add or remove your social media accounts.',
      icon: FiShare2,
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Social Media Accounts</h4>
            <p className="text-gray-600 mb-4">Connect your social media accounts for integrated posting.</p>
            <div className="space-y-3">
              {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map(platform => (
                <div key={platform} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="font-medium text-gray-900">{platform}</span>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'cards',
      title: 'Cards Setting',
      description: 'Setup your card with personalization writing style, signature and logo.',
      icon: FiCreditCard,
      content: (
        <div className="space-y-6">
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Card Personalization</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Writing Style</label>
                <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500">
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Casual</option>
                  <option>Formal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Signature</label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Your default card signature..."
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'signature',
      title: 'Email Signature',
      description: 'Manage your email signature.',
      icon: FiEdit,
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Email Signature</h4>
            <textarea
              rows={6}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Create your professional email signature..."
            />
            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Save Signature
              </button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const adminSections = [
    {
      id: 'cards-admin',
      title: 'Cards Settings',
      description: 'Configure default settings for cards.',
      icon: FiCreditCard,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Company Card Settings</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Card Template</label>
                <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Professional Blue</option>
                  <option>Corporate Green</option>
                  <option>Modern Purple</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FiUpload className="w-6 h-6 text-gray-400" />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Upload Logo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'company',
      title: 'Company Settings',
      description: 'Manage company information.',
      icon: FiBriefcase,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  defaultValue="The Cusmano Agency"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
                  <option>Insurance</option>
                  <option>Financial Services</option>
                  <option>Real Estate</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'defaults',
      title: 'Default Settings',
      description: 'Set and manage default settings.',
      icon: FiSettings,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">System Defaults</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Contact Status</label>
                <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500">
                  <option>Active</option>
                  <option>Prospect</option>
                  <option>Lead</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Task Priority</label>
                <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500">
                  <option>Medium</option>
                  <option>High</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'meetings',
      title: 'Meeting Settings',
      description: 'Adjust meeting preferences and settings.',
      icon: FiCalendar,
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Meeting Preferences</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Meeting Duration</label>
                <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                  <option>60 minutes</option>
                </select>
              </div>
              <label className="flex items-center justify-between">
                <span className="text-gray-700">Auto-send meeting reminders</span>
                <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" defaultChecked />
              </label>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'users',
      title: 'Users & Billing',
      description: 'Manage user accounts, billing information, and subscription plans.',
      icon: FiUsers,
      content: (
        <div className="space-y-6">
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">User Management</h4>
            <div className="space-y-4">
              <button className="w-full p-4 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors text-left">
                <h5 className="font-medium text-gray-900">Invite Team Members</h5>
                <p className="text-sm text-gray-600">Add new users to your organization</p>
              </button>
              <button className="w-full p-4 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors text-left">
                <h5 className="font-medium text-gray-900">Manage Permissions</h5>
                <p className="text-sm text-gray-600">Control user access and roles</p>
              </button>
              <button className="w-full p-4 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors text-left">
                <h5 className="font-medium text-gray-900">Billing & Subscription</h5>
                <p className="text-sm text-gray-600">Manage your subscription and billing</p>
              </button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const renderSection = (section) => (
    <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => handleSectionToggle(section.id)}
        className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <section.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            <p className="text-sm text-gray-600">{section.description}</p>
          </div>
        </div>
        <FiChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform ${
            expandedSection === section.id ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {expandedSection === section.id && (
        <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
          <div className="pt-6">
            {section.content}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Settings</h1>
            <p className="text-gray-600">Manage your personal preferences and system configuration</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">AH</div>
              <div className="text-sm text-gray-500">{user?.first_name} {user?.last_name}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">🔧</div>
              <div className="text-sm text-gray-500">Cusmano Agency</div>
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
              <FiUser className="w-4 h-4" />
              <span>PERSONAL</span>
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
              <FiSettings className="w-4 h-4" />
              <span>ADMIN</span>
            </div>
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* Personal Tab */}
          <Tab.Panel>
            <div className="space-y-4">
              {personalSections.map(renderSection)}
            </div>
          </Tab.Panel>

          {/* Admin Tab */}
          <Tab.Panel>
            <div className="space-y-4">
              {adminSections.map(renderSection)}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default Settings;