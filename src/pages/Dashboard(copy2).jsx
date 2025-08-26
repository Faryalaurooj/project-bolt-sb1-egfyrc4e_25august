import React from 'react';
import { Link } from 'react-router-dom';
import TasksOverview from '../components/dashboard/TasksOverview';
import {
  FiRefreshCcw,
  FiFileText,
  FiPlus,
  FiUsers,
  FiMail,
  FiCheckSquare,
  FiPhoneCall,
  FiTrendingUp
} from 'react-icons/fi';
import { MdSms } from 'react-icons/md';
import cusmanoLogo from '../assets/cusmano-logo.png';

import { useAuth } from '../context/AuthContext';
import useDashboardKPI from '../hooks/useDashboardKPI'; // KPI Hook

function Dashboard() {
  const { user, logout } = useAuth();
  const { kpi, loading, error } = useDashboardKPI(); // Use KPI Hook with loading and error states

  const renewals = [
    { id: 1, customerName: 'Acme Corp', policyType: 'Business Insurance', renewalDate: '2024-03-01', status: 'pending' },
    { id: 2, customerName: 'Tech Solutions Inc', policyType: 'Liability Insurance', renewalDate: '2024-03-15', status: 'pending' },
  ];

  const recentNotes = [
    { id: 1, author: 'John Doe', date: '2024-02-10', content: 'Called client regarding policy update' },
    { id: 2, author: 'Jane Smith', date: '2024-02-09', content: 'Updated contact information' },
  ];

  const kpiCards = [
    { label: 'Total Contacts', value: kpi.totalContacts, icon: FiUsers },
    { label: 'Campaigns', value: kpi.totalCampaigns, icon: FiMail },
    { label: 'Texts Sent', value: kpi.textsSent, icon: MdSms },
    { label: 'Calls Made', value: kpi.callsMade, icon: FiPhoneCall },
    { label: 'Total Touchpoints', value: kpi.totalTouchpoints, icon: FiCheckSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-3 py-1 bg-white border-b shadow-sm">
        <div className="flex items-center space-x-2">
          <img
            src={cusmanoLogo}
            alt="Cusmano Agency Logo"
            className="w-42 h-24 rounded-full"
          />
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-800 font-semibold">
            {user?.email || 'Guest'}
          </span>
          <button
            onClick={logout}
            className="text-sm text-emerald-700 bg-white hover:bg-emerald-100 border border-emerald-500 px-2 py-0.5 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Welcome */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
        <div className="flex items-center space-x-2 text-emerald-600 mb-2">
          <FiTrendingUp className="w-4 h-4" />
          <h2 className="text-xl font-semibold">Welcome to your CRM Dashboard</h2>
        </div>
        <p className="text-emerald-800">Manage your business relationships and grow your success</p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          <p>Error loading KPI data: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpiCards.map((item, i) => (
            <div
              key={i}
              className="bg-white hover:bg-gradient-to-br hover:from-green-100 hover:to-green-200 p-6 rounded-xl shadow hover:shadow-xl ring-1 ring-transparent hover:ring-green-400 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">{item.label}</p>
                  <h3 className="text-3xl font-bold text-gray-900">{item.value?.toLocaleString?.() || 0}</h3>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <item.icon className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/contacts" className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg transition-colors hover:bg-[#d1fae5]">
            <FiUsers className="mr-2 text-emerald-600" />
            <span className="text-gray-900 font-medium">Add New Contact</span>
          </Link>
          <Link to="/taskboards" className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg transition-colors hover:bg-[#dbeafe]">
            <FiCheckSquare className="mr-2 text-blue-600" />
            <span className="text-gray-900 font-medium">Create New Task</span>
          </Link>
          <Link to="/campaigns" className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg transition-colors hover:bg-[#ede9fe]">
            <FiMail className="mr-2 text-purple-600" />
            <span className="text-gray-900 font-medium">Start Campaign</span>
          </Link>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-600 mb-1">Average Open Rate</p>
            <p className="text-2xl font-bold text-emerald-900">{kpi.openRate}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-600 mb-1">Average Reply Rate</p>
            <p className="text-2xl font-bold text-indigo-900">{kpi.replyRate}</p>
          </div>
        </div>
      </div>

      {/* Tasks & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksOverview />

        {/* Upcoming Renewals */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Renewals</h3>
            <FiRefreshCcw className="text-emerald-500" />
          </div>
          <div className="space-y-4">
            {renewals.map((renewal) => (
              <div key={renewal.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{renewal.customerName}</h4>
                    <p className="text-sm text-gray-600">{renewal.policyType}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    {renewal.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Renewal: {new Date(renewal.renewalDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notes</h3>
            <FiFileText className="text-emerald-500" />
          </div>
          <div className="space-y-4">
            {recentNotes.map(note => (
              <div key={note.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900">{note.author}</h4>
                  <span className="text-sm text-gray-600">
                    {new Date(note.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-colors">
        <FiPlus className="h-6 w-6" />
      </button>
    </div>
  );
}

export default Dashboard;