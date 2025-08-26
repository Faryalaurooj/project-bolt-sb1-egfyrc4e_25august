import React, { useState, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiUsers, FiMail, FiCalendar, FiMessageSquare, FiClipboard,
  FiActivity, FiSettings, FiPieChart, FiDollarSign, FiCheckSquare,
  FiEdit2, FiUser, FiPhone, FiChevronLeft, FiChevronRight,
  FiChevronDown, FiChevronUp
} from 'react-icons/fi';

import EmailCampaignModal from '../components/campaigns/EmailCampaignModal';
import SocialMediaModal from '../components/campaigns/SocialMediaModal';
import TextCampaignModal from '../components/campaigns/TextCampaignModal';
import AddNoteModal from '../components/campaigns/AddNoteModal';
import NewContactModal from '../components/campaigns/NewContactModal';
import AddPhoneCallModal from '../components/campaigns/AddPhoneCallModal';
import AddActionItemModal from '../components/campaigns/AddActionItemModal';

const DashboardLayout = () => {
  const location = useLocation();

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

  const [openAutomations, setOpenAutomations] = useState(false);
  const [openReporting, setOpenReporting] = useState(false);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const isActive = useCallback(
    (path) =>
      location.pathname === path
        ? 'bg-white bg-opacity-30 text-green-950 font-semibold'
        : 'text-green-950 hover:bg-white hover:bg-opacity-20 hover:text-green-950',
    [location.pathname]
  );

  const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/taskboards', icon: FiCheckSquare, label: 'Task Boards' },
    { path: '/pipeline', icon: FiDollarSign, label: 'Sales Pipeline' },
    { path: '/contacts', icon: FiUsers, label: 'Contacts' },
    { path: '/texting', icon: FiMessageSquare, label: 'Texting' },
    { path: '/notes', icon: FiActivity, label: 'Notes & Actions' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(to bottom right, #F4FFD8, #E4FFB6)' }}>
      {/* Sidebar */}
      <aside
        className={`${isSidebarExpanded ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out relative text-green-950`}
        style={{ background: 'linear-gradient(to bottom right, #B1E693, #A8E05F)' }}
      >
        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-8 bg-white rounded-full p-1 shadow-lg"
        >
          {isSidebarExpanded ? <FiChevronLeft className="w-4 h-4 text-lime-800" /> : <FiChevronRight className="w-4 h-4 text-lime-800" />}
        </button>

        <nav className="mt-4">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path} className={`flex items-center px-4 py-2 mb-1 ${isActive(path)}`}>
              <Icon className="w-6 h-6" />
              {isSidebarExpanded && <span className="ml-3">{label}</span>}
            </Link>
          ))}

          {/* Automations */}
          <div
            className="px-4 py-2 mb-1 flex items-center justify-between cursor-pointer hover:bg-white hover:bg-opacity-20 rounded"
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

          {/* Reporting */}
          <div
            className="px-4 py-2 mb-1 flex items-center justify-between cursor-pointer hover:bg-white hover:bg-opacity-20 rounded"
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

      {/* Main Content */}
      <main className="flex-1 p-0 md:p-8 bg-gradient-to-tr from-[#F9FAF9] via-[#F5FFF9] to-white">
        <Outlet context={{ openAddNoteModal: () => setIsAddNoteModalOpen(true) }} />
      </main>

      {/* Slide-Out FAB on Right Side */}
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
            <button
              onClick={() => { setIsAddNoteModalOpen(true); setIsFabExpanded(false); }}
              className="flex items-center space-x-2 text-gray-800 hover:text-emerald-600 w-full"
            >
              <FiEdit2 /><span>Add Note</span>
            </button>
            <button
              onClick={() => { setIsEmailModalOpen(true); setIsFabExpanded(false); }}
              className="flex items-center space-x-2 text-gray-800 hover:text-emerald-600 w-full"
            >
              <FiMail /><span>Send Email</span>
            </button>
            <button
              onClick={() => { setIsTextModalOpen(true); setIsFabExpanded(false); }}
              className="flex items-center space-x-2 text-gray-800 hover:text-emerald-600 w-full"
            >
              <FiMessageSquare /><span>Send Text</span>
            </button>
            <button
              onClick={() => { setIsAddPhoneCallModalOpen(true); setIsFabExpanded(false); }}
              className="flex items-center space-x-2 text-gray-800 hover:text-emerald-600 w-full"
            >
              <FiPhone /><span>Phone Call</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <EmailCampaignModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
      <SocialMediaModal isOpen={isSocialModalOpen} onClose={() => setIsSocialModalOpen(false)} />
      <TextCampaignModal isOpen={isTextModalOpen} onClose={() => setIsTextModalOpen(false)} />
      <AddNoteModal isOpen={isAddNoteModalOpen} onClose={() => setIsAddNoteModalOpen(false)} onNoteSaved={triggerRefresh} />
      <NewContactModal isOpen={isNewContactModalOpen} onClose={() => setIsNewContactModalOpen(false)} onContactSaved={triggerRefresh} />
      <AddPhoneCallModal isOpen={isAddPhoneCallModalOpen} onClose={() => setIsAddPhoneCallModalOpen(false)} onPhoneCallSaved={triggerRefresh} />
      <AddActionItemModal isOpen={isAddActionItemModalOpen} onClose={() => setIsAddActionItemModalOpen(false)} onActionItemSaved={triggerRefresh} />
    </div>
  );
};

export default DashboardLayout;
