import React from 'react';
import { Link } from 'react-router-dom';
import TasksOverview from '../components/dashboard/TasksOverview';
import { FiRefreshCcw, FiFileText, FiPlus, FiUsers, FiDollarSign, FiMail, FiCheckSquare, FiTrendingUp } from 'react-icons/fi';

function Dashboard() {
  const renewals = [
    { id: 1, customerName: 'Acme Corp', policyType: 'Business Insurance', renewalDate: '2024-03-01', status: 'pending' },
    { id: 2, customerName: 'Tech Solutions Inc', policyType: 'Liability Insurance', renewalDate: '2024-03-15', status: 'pending' },
  ];

  const recentNotes = [
    { id: 1, author: 'John Doe', date: '2024-02-10', content: 'Called client regarding policy update' },
    { id: 2, author: 'Jane Smith', date: '2024-02-09', content: 'Updated contact information' },
  ];

  const kpiData = {
    totalContacts: 4661,
    totalLeads: 45,
    emailsSent: 35150,
    textsSent: 882,
    openRate: '56%',
    replyRate: '1%',
    totalTouchpoints: 36032
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl">
        <div className="flex items-center space-x-2 text-emerald-600 mb-2">
          <FiTrendingUp className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Welcome to your CRM Dashboard</h2>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-emerald-800">Manage your business relationships and grow your success</p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-emerald-600">Cusmano Agency</span>
            <img 
              src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Total Contacts</p>
              <h3 className="text-3xl font-bold text-white">{kpiData.totalContacts.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-400 bg-opacity-30 rounded-full">
              <FiUsers className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Emails Sent</p>
              <h3 className="text-3xl font-bold text-white">{kpiData.emailsSent.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
              <FiMail className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Texts Sent</p>
              <h3 className="text-3xl font-bold text-white">{kpiData.textsSent.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
              <FiMail className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100">Total Touchpoints</p>
              <h3 className="text-3xl font-bold text-white">{kpiData.totalTouchpoints.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-pink-400 bg-opacity-30 rounded-full">
              <FiCheckSquare className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/contacts"
            className="flex items-center justify-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg hover:from-emerald-100 hover:to-emerald-200 transition-colors"
          >
            <FiUsers className="mr-2 text-emerald-600" />
            <span className="text-emerald-900">Add New Contact</span>
          </Link>
          <Link
            to="/taskboards"
            className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-colors"
          >
            <FiCheckSquare className="mr-2 text-blue-600" />
            <span className="text-blue-900">Create New Task</span>
          </Link>
          <Link
            to="/campaigns"
            className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-colors"
          >
            <FiMail className="mr-2 text-purple-600" />
            <span className="text-purple-900">Start Campaign</span>
          </Link>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-600 mb-1">Average Open Rate</p>
            <p className="text-2xl font-bold text-emerald-900">{kpiData.openRate}</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-600 mb-1">Average Reply Rate</p>
            <p className="text-2xl font-bold text-indigo-900">{kpiData.replyRate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksOverview />

        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Renewals</h3>
            <FiRefreshCcw className="text-emerald-500" />
          </div>
          <div className="space-y-4">
            {renewals.map(renewal => (
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