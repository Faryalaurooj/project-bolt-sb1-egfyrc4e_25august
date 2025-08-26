import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TasksOverview from '../components/dashboard/TasksOverview';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { getCalendarEvents, createCalendarEvent, deleteCalendarEvent, getUsers } from '../services/api';
import {
  FiRefreshCcw,
  FiFileText,
  FiPlus,
  FiUsers,
  FiMail,
  FiCheckSquare,
  FiPhoneCall,
  FiTrendingUp,
  FiMove,
  FiTrash2
} from 'react-icons/fi';
import { MdSms } from 'react-icons/md';
import cusmanoLogo from '../assets/cusmano-logo.png';
import AddEventModal from '../components/common/AddEventModal';

import { useAuth } from '../context/AuthContext';
import CalendarSection from '../components/dashboard/CalendarSection';
import { useCustomization } from '../context/CustomizationContext';
import useDashboardKPI from '../hooks/useDashboardKPI'; // KPI Hook
import { supabase } from '../lib/supabaseClient';

function SortableDashboardSection({ id, children, className = "" }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`relative group ${className}`}
    >
      <div
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md"
        title="Drag to reorder"
      >
        <FiMove className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>
      {children}
    </div>
  );
}


function Dashboard() {
  const { user, logout } = useAuth();
  const { settings, updateSectionOrder, getVisibleSections } = useCustomization();
  const { kpi, loading, error } = useDashboardKPI(); // Still keeping the hook in case used elsewhere
  const { openAddNoteModal, openAddTaskModal, openEmailCampaignModal, openTextCampaignModal } = useOutletContext();

  // Debug logging
  console.log('🏠 Dashboard rendered - KPI data:', { kpi, loading, error });
  console.log('🏠 Dashboard context functions:', { openAddNoteModal, openAddTaskModal, openEmailCampaignModal, openTextCampaignModal });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const renewals = [
    { id: 1, customerName: 'Acme Corp', policyType: 'Business Insurance', renewalDate: '2024-03-01', status: 'pending' },
    { id: 2, customerName: 'Tech Solutions Inc', policyType: 'Liability Insurance', renewalDate: '2024-03-15', status: 'pending' },
  ];

  const recentNotes = [
    { id: 1, author: 'John Doe', date: '2024-02-10', content: 'Called client regarding policy update' },
    { id: 2, author: 'Jane Smith', date: '2024-02-09', content: 'Updated contact information' },
  ];

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const visibleSections = getVisibleSections();
      const oldIndex = visibleSections.indexOf(active.id);
      const newIndex = visibleSections.indexOf(over.id);
      const newOrder = arrayMove(visibleSections, oldIndex, newIndex);
      updateSectionOrder(newOrder);
    }
  };

  const renderSection = (sectionId) => {
    const sectionComponents = {
      kpiCards: (
        <SortableDashboardSection id="kpiCards" key="kpiCards">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              { label: 'Total Contacts', value: kpi.totalContacts, icon: FiUsers, color: 'emerald' },
              { label: 'Campaigns', value: kpi.totalCampaigns, icon: FiMail, color: 'blue' },
              { label: 'Texts Sent', value: kpi.textsSent, icon: MdSms, color: 'purple' },
              { label: 'Calls Made', value: kpi.callsMade, icon: FiPhoneCall, color: 'orange' },
              { label: 'Total Touchpoints', value: kpi.totalTouchpoints, icon: FiCheckSquare, color: 'pink' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-green-100 hover:to-green-200 dark:hover:from-gray-700 dark:hover:to-gray-600 p-6 rounded-xl shadow hover:shadow-xl ring-1 ring-transparent hover:ring-green-400 dark:hover:ring-green-500 transform hover:scale-105 transition-all duration-300 ease-in-out"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">{item.label}</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{item.value?.toLocaleString?.() || 0}</h3>
                  </div>
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                    <item.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SortableDashboardSection>
      ),
      quickActions: (
        <SortableDashboardSection id="quickActions" key="quickActions" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button onClick={openAddNoteModal} className="flex items-center justify-center p-4 btn-interactive-hover dark:bg-gray-700 dark:border-gray-600 rounded-lg dark:hover:bg-gray-600">
              <FiFileText className="mr-2 text-yellow-600 dark:text-yellow-400" />
              <span className="text-gray-900 dark:text-gray-100 font-medium">Add Note</span>
            </button>
            <button onClick={openAddTaskModal} className="flex items-center justify-center p-4 btn-interactive-hover dark:bg-gray-700 dark:border-gray-600 rounded-lg dark:hover:bg-gray-600">
              <FiCheckSquare className="mr-2 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-900 dark:text-gray-100 font-medium">Create New Task</span>
            </button>
            <button onClick={openEmailCampaignModal} className="flex items-center justify-center p-4 btn-interactive-hover dark:bg-gray-700 dark:border-gray-600 rounded-lg dark:hover:bg-gray-600">
              <FiMail className="mr-2 text-purple-600 dark:text-purple-400" />
              <span className="text-gray-900 dark:text-gray-100 font-medium">Send Email</span>
            </button>
            <button onClick={openTextCampaignModal} className="flex items-center justify-center p-4 btn-interactive-hover dark:bg-gray-700 dark:border-gray-600 rounded-lg dark:hover:bg-gray-600">
              <MdSms className="mr-2 text-cyan-600 dark:text-cyan-400" />
              <span className="text-gray-900 dark:text-gray-100 font-medium">Send Text</span>
            </button>
          </div>
        </SortableDashboardSection>
      ),
      engagementStats: (
        <SortableDashboardSection id="engagementStats" key="engagementStats" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Engagement Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Average Open Rate</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{kpi.openRate}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg">
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Average Reply Rate</p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{kpi.replyRate}</p>
            </div>
          </div>
        </SortableDashboardSection>
      ),
      tasksOverview: (
        <SortableDashboardSection id="tasksOverview" key="tasksOverview">
          <TasksOverview />
        </SortableDashboardSection>
      ),
      upcomingRenewals: (
        <SortableDashboardSection id="upcomingRenewals" key="upcomingRenewals" className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming Renewals</h3>
            <FiRefreshCcw className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="space-y-4">
            {renewals.map((renewal) => (
              <div key={renewal.id} className="border-b border-gray-200 dark:border-gray-600 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{renewal.customerName}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{renewal.policyType}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                    {renewal.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Renewal: {new Date(renewal.renewalDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </SortableDashboardSection>
      ),
      recentNotes: (
        <SortableDashboardSection id="recentNotes" key="recentNotes" className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Notes</h3>
            <FiFileText className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="space-y-4">
            {recentNotes.map(note => (
              <div key={note.id} className="border-b border-gray-200 dark:border-gray-600 pb-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{note.author}</h4>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(note.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{note.content}</p>
              </div>
            ))}
          </div>
        </SortableDashboardSection>
      ),
      calendarSection: (
        <SortableDashboardSection id="calendarSection" key="calendarSection">
          <CalendarSection />
        </SortableDashboardSection>
      )
    };

    return sectionComponents[sectionId] || null;
  };

  const visibleSections = getVisibleSections();
  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-3 py-1 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-2">
          <img
            src={cusmanoLogo}
            alt="Cusmano Agency Logo"
            className="w-42 h-24 rounded-full"
          />
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-800 dark:text-gray-200 font-semibold">
            {user?.email || 'Guest'}
          </span>
          <button
            onClick={logout}
            className="text-sm text-emerald-700 dark:text-emerald-400 bg-white dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-gray-600 border border-emerald-500 dark:border-emerald-400 px-2 py-0.5 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Welcome */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900 dark:to-green-900 p-4 rounded-xl">
        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-2">
          <FiTrendingUp className="w-4 h-4" />
          <h2 className="text-xl font-semibold">Welcome to your CRM Dashboard</h2>
        </div>
        <p className="text-emerald-800 dark:text-emerald-200">Manage your business relationships and grow your success</p>
      </div>

      {/* Dynamic Dashboard Sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={visibleSections} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">
            {visibleSections.map(sectionId => renderSection(sectionId))}
          </div>
        </SortableContext>
      </DndContext>

    </div>
  );
}

export default Dashboard;