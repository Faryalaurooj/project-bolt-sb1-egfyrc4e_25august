import React, { useState, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiUsers, FiMail, FiCalendar, FiMessageSquare, FiClipboard,
  FiActivity, FiSettings, FiPieChart, FiDollarSign, FiCheckSquare,
  FiPlus, FiEdit2, FiUser, FiPhone, FiChevronLeft, FiChevronRight, FiUpload
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
  const [fabHoverLabel, setFabHoverLabel] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
  const [isAddPhoneCallModalOpen, setIsAddPhoneCallModalOpen] = useState(false);
  const [isAddActionItemModalOpen, setIsAddActionItemModalOpen] = useState(false);

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
    { path: '/campaigns', icon: FiMail, label: 'Marketing' },
    { path: '/calendar', icon: FiCalendar, label: 'Calendar' },
    { path: '/contacts', icon: FiUsers, label: 'Contacts' },
    { path: '/surveys', icon: FiClipboard, label: 'Feedback' },
    { path: '/texting', icon: FiMessageSquare, label: 'Texting' },
    { path: '/notes', icon: FiActivity, label: 'Notes & Actions' },
    { path: '/ivans-uploads', icon: FiUpload, label: 'IVANS Uploads' },
    { path: '/automations', icon: FiSettings, label: 'Automations' },
    { path: '/reporting', icon: FiPieChart, label: 'Reporting' },
  ];

  const fabActions = [
    { id: 'note', icon: FiEdit2, label: 'Add Note', action: () => setIsAddNoteModalOpen(true) },
    { id: 'contact', icon: FiUser, label: 'New Contact', action: () => setIsNewContactModalOpen(true) },
    { id: 'call', icon: FiPhone, label: 'Add Phone Call', action: () => setIsAddPhoneCallModalOpen(true) },
    { id: 'action', icon: FiEdit2, label: 'Add Action Item', action: () => setIsAddActionItemModalOpen(true) },
    { id: 'email', icon: FiMail, label: 'Send an Email', action: () => setIsEmailModalOpen(true) },
  ];

  const shouldShowFab = location.pathname !== '/calendar';

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

        <div className="p-4 flex items-center">
          <img src="/logo192.png" alt="Logo" className="h-8 w-8 rounded-lg" />
          {isSidebarExpanded && <h1 className="text-xl font-bold ml-2 text-green-950">Modern CRM</h1>}
        </div>

        <nav className="mt-4">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path} className={`flex items-center px-4 py-2 mb-1 ${isActive(path)}`}>
              <Icon className="w-6 h-6" />
              {isSidebarExpanded && <span className="ml-3">{label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-0 md:p-8 bg-gradient-to-tr from-[#F9FAF9] via-[#F5FFF9]  to-white">
        <Outlet />
      </main>

      {/* Floating Action Button */}
      {shouldShowFab && (
        <div
          className="fixed bottom-8 right-8 flex flex-col-reverse items-end space-y-reverse space-y-2"
          onMouseLeave={() => {
            setIsFabExpanded(false);
            setFabHoverLabel('');
          }}
        >
          {isFabExpanded && fabActions.map(({ id, icon: Icon, label, action }) => (
            <div key={id} className="flex items-center" onMouseEnter={() => setFabHoverLabel(id)}>
              {fabHoverLabel === id && (
                <span className="mr-2 py-1 px-2 bg-lime-700 text-white text-sm rounded">
                  {label}
                </span>
              )}
              <button
                onClick={action}
                className="w-12 h-12 rounded-full bg-teal-300 text-white flex items-center justify-center hover:bg-teal-400 transition-colors"
              >
                <Icon className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onMouseEnter={() => setIsFabExpanded(true)}
            className={`w-14 h-14 rounded-full bg-teal-300 text-white flex items-center justify-center hover:bg-teal-400 transition-all transform ${isFabExpanded ? 'rotate-45' : ''}`}
          >
            <FiPlus className="w-6 h-6" />
          </button>
        </div>
      )}

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
