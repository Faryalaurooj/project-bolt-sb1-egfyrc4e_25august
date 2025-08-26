import React, { useState, useCallback } from 'react';
import {
  FiEdit2,
  FiMail,
  FiMessageSquare,
  FiPhone,
  FiHome, FiUsers, FiCalendar, FiClipboard,
  FiActivity, FiSettings, FiPieChart, FiDollarSign, FiCheckSquare,
  FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

import EmailCampaignModal from '@/components/campaigns/EmailCampaignModal';
import TextCampaignModal from '@/components/campaigns/TextCampaignModal';
import AddNoteModal from '@/components/campaigns/AddNoteModal';
import AddPhoneCallModal from '@/components/campaigns/AddPhoneCallModal';

const Dashboard = () => {
  const location = useLocation();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isAddPhoneCallModalOpen, setIsAddPhoneCallModalOpen] = useState(false);
  const [openAutomations, setOpenAutomations] = useState(false);
  const [openReporting, setOpenReporting] = useState(false);

  const isActive = (path) =>
    location.pathname === path
      ? 'bg-white bg-opacity-30 text-green-950 font-semibold'
      : 'text-green-950 hover:bg-white hover:bg-opacity-20 hover:text-green-950';

  const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/taskboards', icon: FiCheckSquare, label: 'Task Boards' },
    { path: '/pipeline', icon: FiDollarSign, label: 'Sales Pipeline' },
    { path: '/contacts', icon: FiUsers, label: 'Contacts' },
    { path: '/notes', icon: FiActivity, label: 'Notes & Actions' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(to bottom right, #F4FFD8, #E4FFB6)' }}>
      {/* Sidebar */}
      <aside className={`${isSidebarExpanded ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out relative text-green-950`} style={{ background: 'linear-gradient(to bottom right, #B1E693, #A8E05F)' }}>
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
          <div className="px-4 py-2 mb-1 flex items-center justify-between cursor-pointer hover:bg-white hover:bg-opacity-20 rounded" onClick={() => setOpenAutomations(!openAutomations)}>
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
          <div className="px-4 py-2 mb-1 flex items-center justify-between cursor-pointer hover:bg-white hover:bg-opacity-20 rounded" onClick={() => setOpenReporting(!openReporting)}>
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
      <main className="flex-1 p-4 md:p-8">
        {/* Header with Logo */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow">
          <img src="/logo.png" alt="Cusmano Agency Logo" className="h-12" />
          <div className="text-sm text-gray-700">admin_user@test.com <button className="ml-4 border border-green-600 text-green-600 px-3 py-1 rounded hover:bg-green-50">Logout</button></div>
        </div>

        {/* Welcome Section */}
        <div className="bg-green-50 rounded-xl px-6 py-4 border border-green-100 shadow-sm mt-6">
          <h2 className="text-lg font-semibold text-green-800">📈 Welcome to your CRM Dashboard</h2>
          <p className="text-sm text-green-700 mt-1">Manage your business relationships and grow your success</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow border border-gray-100 mt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded shadow hover:bg-green-200"
            >
              <FiEdit2 /> <span>Add Note</span>
            </button>

            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded shadow hover:bg-blue-200"
            >
              <FiMail /> <span>Send Email</span>
            </button>

            <button
              onClick={() => setIsTextModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-100 text-purple-800 rounded shadow hover:bg-purple-200"
            >
              <FiMessageSquare /> <span>Send Text</span>
            </button>

            <button
              onClick={() => setIsAddPhoneCallModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded shadow hover:bg-yellow-200"
            >
              <FiPhone /> <span>Phone Call</span>
            </button>
          </div>
        </div>

        {/* Engagement Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <p className="text-gray-600 text-sm mb-2">Average Open Rate</p>
            <p className="text-3xl font-bold text-green-700">0%</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
            <p className="text-gray-600 text-sm mb-2">Average Reply Rate</p>
            <p className="text-3xl font-bold text-indigo-700">0%</p>
          </div>
        </div>

        {/* Modals */}
        <EmailCampaignModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
        <TextCampaignModal isOpen={isTextModalOpen} onClose={() => setIsTextModalOpen(false)} />
        <AddNoteModal isOpen={isAddNoteModalOpen} onClose={() => setIsAddNoteModalOpen(false)} />
        <AddPhoneCallModal isOpen={isAddPhoneCallModalOpen} onClose={() => setIsAddPhoneCallModalOpen(false)} />
      </main>
    </div>
  );
};

export default Dashboard;
