import React, { useState, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiUsers, FiMail, FiCalendar, FiMessageSquare, FiClipboard,
  FiActivity, FiSettings, FiPieChart, FiDollarSign, FiCheckSquare,
  FiEdit2, FiUser, FiPhone, FiChevronLeft, FiChevronRight,
  FiChevronDown, FiChevronUp, FiSliders, FiFileText, FiPaperclip
} from 'react-icons/fi';

import EmailCampaignModal from '../components/campaigns/EmailCampaignModal';
import SocialMediaModal from '../components/campaigns/SocialMediaModal';
import TextCampaignModal from '../components/campaigns/TextCampaignModal';
import AddNoteModal from '../components/campaigns/AddNoteModal';
import NewContactModal from '../components/campaigns/NewContactModal';
import AddPhoneCallModal from '../components/campaigns/AddPhoneCallModal';
import AddActionItemModal from '../components/campaigns/AddActionItemModal';
import AddTaskModal from '../components/contacts/AddTaskModal';
import CustomizationSettingsModal from '../components/common/CustomizationSettingsModal';
import UserProfileModal from '../components/common/UserProfileModal';
import MakeCallModal from '../components/calls/MakeCallModal';
import { useCustomization } from '../context/CustomizationContext';

const DashboardLayout = () => {
  const location = useLocation();
  const { settings } = useCustomization();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
  const [isAddPhoneCallModalOpen, setIsAddPhoneCallModalOpen] = useState(false);
  const [isAddActionItemModalOpen, setIsAddActionItemModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isMakeCallModalOpen, setIsMakeCallModalOpen] = useState(false);


  const openEmailCampaignModal = () => {
    console.log('📧 DashboardLayout: Opening email campaign modal...');
    setIsEmailModalOpen(true);
  };

  const openTextCampaignModal = () => {
    console.log('📱 DashboardLayout: Opening text campaign modal...');
    setIsTextModalOpen(true);
  };

  const openAddNoteModal = () => {
    console.log('🔍 Opening add note modal...');
    setIsAddNoteModalOpen(true);
  };

  const openAddTaskModal = () => {
    console.log('📋 DashboardLayout: Opening add task modal...');
    setIsAddTaskModalOpen(true);
  };

  const openMakeCallModal = () => {
    console.log('📞 DashboardLayout: Opening make call modal...');
    setIsMakeCallModalOpen(true);
  };
  const [openAutomations, setOpenAutomations] = useState(false);
  const [openReporting, setOpenReporting] = useState(false);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const isActive = useCallback(
    (path) =>
      location.pathname === path
        ? 'bg-gradient-to-r from-green-200 to-yellow-100 text-green-900 font-semibold'
        : 'text-green-950 hover:bg-gradient-to-r hover:from-green-200 hover:to-yellow-100 hover:text-green-900',
    [location.pathname]
  );

  const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/taskboards', icon: FiCheckSquare, label: 'Task Boards' },
  
    { path: '/pipeline', icon: FiDollarSign, label: 'Sales Pipeline' },
    { path: '/contacts', icon: FiUsers, label: 'Contacts' },
  
    { path: '/attachments', icon: FiPaperclip, label: 'Attachments' },
    { path: '/documents', icon: FiClipboard, label: 'Documents' },
    { path: '/downloads', icon: FiPieChart, label: 'Downloads' },
    { path: '/texting', icon: FiMessageSquare, label: 'Texting' },
    { path: '/notes', icon: FiActivity, label: 'Notes & Actions' },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-lime-100 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <aside className={`${isSidebarExpanded ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out relative text-green-950 dark:text-green-100 bg-gradient-to-br from-green-400 to-lime-400 dark:from-gray-800 dark:to-gray-700`}>
        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-8 bg-white dark:bg-gray-700 rounded-full p-1 shadow-lg"
        >
          {isSidebarExpanded ? <FiChevronLeft className="w-4 h-4 text-lime-800 dark:text-lime-400" /> : <FiChevronRight className="w-4 h-4 text-lime-800 dark:text-lime-400" />}
        </button>

 <div className="p-4 border-b border-green-300 dark:border-gray-600">
  <button
    onClick={() => setIsUserProfileModalOpen(true)}
    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
  >
    Edit Profile
  </button>

  <button
    onClick={() => setIsCustomizationModalOpen(true)}
    className="flex items-center w-full px-2 py-2 text-green-950 dark:text-green-100 hover:bg-gradient-to-r hover:from-green-200 hover:to-yellow-100 rounded-md transition-colors"
  >
    <FiSliders className="w-5 h-5" />
    {isSidebarExpanded && <span className="ml-3">Customize</span>}
  </button>
</div>

<nav className="mt-4">
  {navItems.map(({ path, icon: Icon, label }) => (
    <Link
      key={path}
      to={path}
      className={`flex items-center px-4 py-2 mb-1 w-full rounded transition-colors ${isActive(path)}`}
    >
      <Icon className="w-6 h-6" />
      {isSidebarExpanded && <span className="ml-3">{label}</span>}
    </Link>
  ))}



   <div
     className="px-4 py-2 mb-1 flex items-center justify-between cursor-pointer hover:bg-gradient-to-r hover:from-green-200 hover:to-yellow-100 rounded   transition-colors"
            onClick={() => setOpenAutomations(!openAutomations)}
   >
  <div className="flex items-center">
              <FiSettings className="w-6 h-6" />
              {isSidebarExpanded && <span className="ml-3">Automations</span>}
            </div>
            {isSidebarExpanded && (openAutomations ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />)}
          </div>
          {isSidebarExpanded && openAutomations && (
            <div className="ml-10 text-sm">
              <Link to="/campaigns" className={`block px-2 py-1 rounded ${isActive('/campaigns')}`}>Campaigns</Link>
              <Link to="/surveys" className={`block px-2 py-1 rounded ${isActive('/surveys')}`}>Surveys</Link>
              <Link to="/calendar" className={`block px-2 py-1 rounded ${isActive('/calendar')}`}>Calendar</Link>
            </div>
          )}

          <div
            className="px-4 py-2 mb-1 flex items-center justify-between cursor-pointer hover:bg-gradient-to-r hover:from-green-200 hover:to-yellow-100 rounded transition-colors"
            onClick={() => setOpenReporting(!openReporting)}
          >
            <div className="flex items-center">
              <FiPieChart className="w-6 h-6" />
              {isSidebarExpanded && <span className="ml-3">Reporting</span>}
            </div>
            {isSidebarExpanded && (openReporting ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />)}
          </div>
          {isSidebarExpanded && openReporting && (
            <div className="ml-10 text-sm">
              <Link to="/ivans-uploads" className={`block px-2 py-1 rounded ${isActive('/ivans-uploads')}`}>IVANS Uploads</Link>
            </div>
          )}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 bg-gradient-to-tr from-[#F9FAF9] via-[#F5FFF9] to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">

        <Outlet context={{
          openAddNoteModal,
          openAddTaskModal,
          openEmailCampaignModal,
          openTextCampaignModal,
          openMakeCallModal
        }} />

        <div className="fixed top-1/2 right-0 transform -translate-y-1/2 z-50">
          <button
            onClick={() => setIsFabExpanded(!isFabExpanded)}
            className="bg-teal-500 text-white p-3 rounded-l-full shadow hover:bg-teal-600 transition"
            title="Quick Actions"
          >
            {isFabExpanded ? <FiChevronRight /> : <FiEdit2 />}
          </button>

          {isFabExpanded && (
            <div className="bg-white rounded-l-xl shadow-xl py-3 px-4 space-y-3 w-48 border border-gray-100">
              <button onClick={() => { setIsAddNoteModalOpen(true); setIsFabExpanded(false); }} className="flex items-center space-x-2 text-gray-800 hover:bg-green-200 hover:text-green-900 rounded w-full px-2 py-1">
                <FiEdit2 /><span>Add Note</span>
              </button>
              <button onClick={() => { setIsEmailModalOpen(true); setIsFabExpanded(false); }} className="flex items-center space-x-2 text-gray-800 hover:bg-green-200 hover:text-green-900 rounded w-full px-2 py-1">
                <FiMail /><span>Send Email</span>
              </button>
              <button onClick={() => { setIsTextModalOpen(true); setIsFabExpanded(false); }} className="flex items-center space-x-2 text-gray-800 hover:bg-green-200 hover:text-green-900 rounded w-full px-2 py-1">
                <FiMessageSquare /><span>Compose Text</span>
              </button>
              <button onClick={() => { setIsAddPhoneCallModalOpen(true); setIsFabExpanded(false); }} className="flex items-center space-x-2 text-gray-800 hover:bg-green-200 hover:text-green-900 rounded w-full px-2 py-1">
                <FiPhone /><span>Phone Call</span>
              </button>
              <button onClick={() => { setIsMakeCallModalOpen(true); setIsFabExpanded(false); }} className="flex items-center space-x-2 text-gray-800 hover:bg-green-200 hover:text-green-900 rounded w-full px-2 py-1">
                <FiPhone /><span>Make Call</span>
              </button>
            </div>
          )}
        </div>

        <EmailCampaignModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
        <SocialMediaModal isOpen={isSocialModalOpen} onClose={() => setIsSocialModalOpen(false)} />
        <TextCampaignModal isOpen={isTextModalOpen} onClose={() => setIsTextModalOpen(false)} />
        <AddNoteModal isOpen={isAddNoteModalOpen} onClose={() => setIsAddNoteModalOpen(false)} onNoteSaved={triggerRefresh} />
        <NewContactModal isOpen={isNewContactModalOpen} onClose={() => setIsNewContactModalOpen(false)} onContactSaved={triggerRefresh} />
        <AddPhoneCallModal isOpen={isAddPhoneCallModalOpen} onClose={() => setIsAddPhoneCallModalOpen(false)} onPhoneCallSaved={triggerRefresh} />
        <AddActionItemModal isOpen={isAddActionItemModalOpen} onClose={() => setIsAddActionItemModalOpen(false)} onActionItemSaved={triggerRefresh} />
        <AddTaskModal isOpen={isAddTaskModalOpen} onClose={() => setIsAddTaskModalOpen(false)} onTaskSaved={triggerRefresh} />
        <CustomizationSettingsModal isOpen={isCustomizationModalOpen} onClose={() => setIsCustomizationModalOpen(false)} />
        <UserProfileModal isOpen={isUserProfileModalOpen} onClose={() => setIsUserProfileModalOpen(false)} />
        <MakeCallModal isOpen={isMakeCallModalOpen} onClose={() => setIsMakeCallModalOpen(false)} onCallSaved={triggerRefresh} />
      </main>
    </div>
  );
};

export default DashboardLayout;