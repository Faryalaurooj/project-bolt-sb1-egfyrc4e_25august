import React, { useState, useEffect } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TasksOverview from '../components/dashboard/TasksOverview';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { getCalendarEvents, createCalendarEvent, deleteCalendarEvent, getUsers } from '../services/api';
import { updateNote, deleteNote } from '../services/api';
import { getOutlookCalendarEvents, initializeOutlookSync } from '../services/outlookSync';
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
  FiTrash2,
  FiDollarSign,
  FiFileText as FiPolicy,
  FiBarChart2,
  FiArrowUpRight,
  FiArrowDownRight,
  FiMinus,
  FiExternalLink,
  FiMessageSquare
} from 'react-icons/fi';
import { MdSms } from 'react-icons/md';
import cusmanoLogo from '../assets/cusmano-logo.png';
import AddEventModal from '../components/common/AddEventModal';
import StickyNote from '../components/dashboard/StickyNote';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import DoughnutChart from '../components/charts/DoughnutChart';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

import { useAuth } from '../context/AuthContext';
import { useCustomization } from '../context/CustomizationContext';
import useDashboardKPI from '../hooks/useDashboardKPI'; // KPI Hook
import { createExactDate, toDateString, debugDate } from '../utils/dateUtils';

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

function CalendarSection({ refreshTrigger }) {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [outlookEvents, setOutlookEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [userColors, setUserColors] = useState(new Map());
  const [selectedDateForModal, setSelectedDateForModal] = useState(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const { user } = useAuth();

  // Use the new date utility function
  const createLocalDate = createExactDate;

  // Color palette for team members
  const colorPalette = [
    '#FF6B9D', // Cute Pink
    '#4ECDC4', // Turquoise
    '#45B7D1', // Sky Blue
    '#96CEB4', // Mint Green
    '#FFEAA7', // Soft Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Seafoam
    '#F7DC6F', // Light Gold
    '#BB8FCE', // Lavender
    '#85C1E9'  // Baby Blue
  ];

  useEffect(() => {
    // Re-fetch whenever refreshTrigger changes (or on mount)
    fetchEventsAndUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const fetchEventsAndUsers = async () => {
    try {
      setLoading(true);
      const [eventsData, usersData] = await Promise.all([
        getCalendarEvents(),
        getUsers()
      ]);
      
      setEvents(eventsData || []);
      setUsers(usersData || []);
      
      // Fetch Outlook events if user has outlook_email
      if (user?.outlook_email) {
        try {
          const startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);
          
          const outlookEventsData = await getOutlookCalendarEvents(startDate, endDate);
          setOutlookEvents(outlookEventsData || []);
          setOutlookConnected(true);
          console.log('Fetched Outlook events:', outlookEventsData);
        } catch (outlookError) {
          console.error('Error fetching Outlook events:', outlookError);
          setOutlookEvents([]);
          setOutlookConnected(false);
        }
      }
      
      // Assign colors to users
      const colorMap = new Map();
      (usersData || []).forEach((teamUser, index) => {
        colorMap.set(teamUser.id, colorPalette[index % colorPalette.length]);
      });
      // Add special color for Outlook events
      console.log('Setting Outlook color for user:', user?.id);
      colorMap.set('outlook', '#0078D4');
      setUserColors(colorMap);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setEvents([]);
      setOutlookEvents([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectOutlook = async () => {
    try {
      const success = await initializeOutlookSync();
      if (success) {
        setOutlookConnected(true);
        await fetchEventsAndUsers(); // Refresh to get Outlook events
        alert('Outlook calendar connected successfully!');
      }
    } catch (error) {
      console.error('Error connecting to Outlook:', error);
      alert('Failed to connect to Outlook. Please try again.');
    }
  };

  const handleAddEvent = async (eventText, eventDate) => {
    try {
      const eventData = {
        event_text: eventText,
        event_date: eventDate.toISOString().split('T')[0],
        color: userColors.get(user?.id) || colorPalette[0]
      };
      
      await createCalendarEvent(eventData);
      await fetchEventsAndUsers(); // Refresh events
      setIsAddEventModalOpen(false);
      setSelectedDateForModal(null);
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteCalendarEvent(eventId);
        await fetchEventsAndUsers(); // Refresh events
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  const getEventsForDate = (date) => {
    // Use the new date utility to create consistent date string
    const dateStr = toDateString(date);
    
    const crmEvents = events.filter(event => event.event_date === dateStr);
    const outlookEventsForDate = outlookEvents.filter(event => event.event_date === dateStr);
    
    return [...crmEvents, ...outlookEventsForDate];
  }; 

  const getUserName = (userId) => {
    if (userId === 'outlook') {
      return `${user?.first_name || user?.email?.split('@')[0] || 'You'} (Outlook)`;
    }
    const eventUser = users.find(u => u.id === userId);
    if (eventUser) {
      return eventUser.user_metadata?.first_name ||
             eventUser.first_name || 
             eventUser.email?.split('@')[0] || 
             'Team Member';
    }
    return 'Team Member';
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayEvents = getEventsForDate(date);
      if (dayEvents.length > 0) {
        return (
          <div className="flex flex-wrap justify-center gap-1 mt-1">
            {dayEvents.slice(0, 2).map((event, index) => (
              <div
                key={event.id}
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm" 
                style={{ backgroundColor: event.color || userColors.get(event.user_id) }}
                title={`${event.event_text} - ${getUserName(event.user_id)}`}
              />
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-600 font-medium bg-white rounded-full px-1">
                +{dayEvents.length - 2}
              </div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  const onClickDay = (clickedDate) => {
    debugDate('🔧 Dashboard - Clicked Date', clickedDate);
    
    // Create a local date using the utility function
    const localDate = createLocalDate(clickedDate);
    debugDate('🔧 Dashboard - Local Date Created', localDate);
    
    console.log('🔧 Dashboard - Date String:', toDateString(localDate));
    
    setSelectedDateForModal(localDate);
    setIsAddEventModalOpen(true);
  };

  return (
    <div className="bg-gradient-to-br from-white-50 to-white-10 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl shadow-lg border-2 border-white-100 dark:border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-Black-800 dark:text-Black-200 flex items-center">
          🗓️ Team Calendar
        </h3> 
        <div className="flex items-center space-x-2">
          {user?.outlook_email && !outlookConnected && (
            <button
              onClick={handleConnectOutlook}
              className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
            >
              Connect Outlook
            </button>
          )}
          <div className="text-sm text-Black-600 dark:text-Black-300 bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm"> 
            Click any date to add event
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mb-3"></div>
          <p className="text-purple-600 dark:text-purple-300 font-medium">Loading magical calendar...</p>
        </div>
      ) : (
        <>
          <div className="calendar-container mb-6">
            <Calendar 
              onChange={setDate}
              value={date} 
              className="cute-calendar w-full"
              tileContent={tileContent}
              onClickDay={onClickDay}
            />
          </div>
          
          {/* Team Legend */}
          <div className="mb-6 bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              👥 Team Members
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {/* Current user's Outlook calendar */}
              {user?.outlook_email && (
                <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: '#0078D4' }}
                  />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {user?.first_name || user?.email?.split('@')[0] || 'You'} (Outlook) 
                    {outlookConnected && <span className="text-xs ml-1">✓</span>}
                  </span>
                </div>
              )}
              {users.map((teamUser) => (
                <div key={teamUser.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: userColors.get(teamUser.id) }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {teamUser.user_metadata?.first_name ||
                     teamUser.first_name || 
                     teamUser.email?.split('@')[0] || 
                     'Team Member'}
                    {teamUser.outlook_email && <span className="text-xs text-gray-500 ml-1">(📧)</span>}
                  </span>
                </div>
              ))}
            </div>
            {user?.outlook_email && (
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                <p>📧 Outlook events are shown for the logged-in user only</p>
              </div>
            )}
          </div>
          
          {/* Events for selected date */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              📅 Events for {date.toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {getEventsForDate(date).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg shadow-sm border-l-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-600 dark:to-gray-700"
                  style={{ borderLeftColor: event.color || userColors.get(event.user_id) }}
                >
                  <div className="flex items-center space-x-3"> 
                    <div
                      className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: event.color || userColors.get(event.user_id) }}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {event.event_text}
                      </span> 
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        👤 {getUserName(event.user_id)}
                      </div>
                    </div>
                  </div>
                  {event.user_id === user?.id && (
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900 transition-all"
                      title="Delete your event"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                  {event.source === 'outlook' && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      📧 Outlook
                    </div>
                  )}
                </div>
              ))}
              {getEventsForDate(date).length === 0 && (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No events for this date</p>
                  <button
                    onClick={() => {
                      setSelectedDateForModal(date);
                      setIsAddEventModalOpen(true);
                    }}
                    className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                  >
                    Click to add an event
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => {
          setIsAddEventModalOpen(false);
          setSelectedDateForModal(null);
        }}
        date={selectedDateForModal}
        onSave={handleAddEvent}
        onDeleteEvent={handleDeleteEvent}
        user={user}
        userColors={userColors}
        getUserName={getUserName}
        eventsForSelectedDay={selectedDateForModal ? getEventsForDate(selectedDateForModal) : []}
      />
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { settings, updateSectionOrder, getVisibleSections } = useCustomization();
  const { kpi, loading, error } = useDashboardKPI(); // Still keeping the hook in case used elsewhere

  // safe outlet context access — in case this route is rendered without an Outlet context
  let outlet = {};
  try {
    outlet = useOutletContext() || {};
  } catch (e) {
    outlet = {};
  }
  const { openAddNoteModal, openAddTaskModal, openEmailCampaignModal, openTextCampaignModal, openMakeCallModal ,openSendTeamMessageModal} = outlet;

  const [stickyNotes, setStickyNotes] = useState([]);
  const [stickyNotesLoading, setStickyNotesLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);  // Add refreshTrigger state at the top
  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Debug logging
  useEffect(() => {
    console.log('🏠 Dashboard rendered - KPI data:', { kpi, loading, error });
    console.log('🏠 Dashboard context functions:', { openAddNoteModal, openAddTaskModal, openEmailCampaignModal, openTextCampaignModal, openMakeCallModal });
  }, [kpi, loading, error, openAddNoteModal, openAddTaskModal, openEmailCampaignModal, openTextCampaignModal, ,openSendTeamMessageModal]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mock trend data for KPI cards
  const getTrendData = (metric) => {
    const trends = {
      totalContacts: { change: 12, direction: 'up' },
      totalCampaigns: { change: 8, direction: 'up' },
      revenue: { change: 15, direction: 'up' },
      newPolicies: { change: 3, direction: 'down' },
      textsSent: { change: 22, direction: 'up' },
      callsMade: { change: 5, direction: 'up' },
      totalTouchpoints: { change: 18, direction: 'up' },
      weightedPipelineValue: { change: 7, direction: 'up' }
    };
    return trends[metric] || { change: 0, direction: 'neutral' };
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up': return <FiArrowUpRight className="w-3 h-3 text-green-500" />;
      case 'down': return <FiArrowDownRight className="w-3 h-3 text-red-500" />;
      default: return <FiMinus className="w-3 h-3 text-gray-400" />;
    }
  };

  const handleKPICardClick = (metric) => {
    switch (metric) {
      case 'totalContacts':
        navigate('/contacts');
        break;
      case 'totalCampaigns':
        navigate('/campaigns');
        break;
      case 'textsSent':
      case 'callsMade':
        navigate('/texting');
        break;
      case 'revenue':
      case 'newPolicies':
      case 'weightedPipelineValue':
        navigate('/reporting');
        break;
      default:
        console.log('No navigation defined for:', metric);
    }
  };

  const handleRenewalAction = (renewal, action) => {
    switch (action) {
      case 'contact':
        // Open contact modal or navigate to contact
        console.log('Contacting client for renewal:', renewal.customerName);
        break;
      case 'quote':
        // Generate quote functionality
        console.log('Generating quote for:', renewal.customerName);
        break;
      default:
        console.log('Unknown renewal action:', action);
    }
  };

  // Fetch sticky notes
  useEffect(() => {
    if (settings?.showStickyNotes) {
      // fetchStickyNotes(); // Commented out to prevent errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.showStickyNotes, refreshTrigger]);

  // const fetchStickyNotes = async () => {
  //   try {
  //     setStickyNotesLoading(true);
  //     const notes = await getStickyNotes();
  //     setStickyNotes(notes || []);
  //   } catch (error) {
  //     console.error('Error fetching sticky notes:', error);
  //     setStickyNotes([]);
  //   } finally {
  //     setStickyNotesLoading(false);
  //   }
  // };

  const handleStickyNoteUpdate = (noteId, newPosition) => {
    setStickyNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId
          ? { ...note, x_position: newPosition.x, y_position: newPosition.y }
          : note
      )
    );
  };

  const handleStickyNoteDelete = (noteId) => {
    setStickyNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };

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
    if (!over) return; // guard when dropped outside any drop zone

    if (active.id !== over.id) {
      const visibleSections = typeof getVisibleSections === 'function' ? getVisibleSections() : [];
      const oldIndex = visibleSections.indexOf(active.id);
      const newIndex = visibleSections.indexOf(over.id);
      if (oldIndex === -1 || newIndex === -1) return; // safety
      const newOrder = arrayMove(visibleSections, oldIndex, newIndex);
      if (typeof updateSectionOrder === 'function') updateSectionOrder(newOrder);
    }
  };

  const renderSection = (sectionId) => {
    const sectionComponents = {
      kpiCards: (
        <SortableDashboardSection id="kpiCards" key="kpiCards">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Total Contacts */}
            <button 
              onClick={() => handleKPICardClick('totalContacts')}
              className="bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-600 p-6 rounded-xl shadow hover:shadow-xl ring-1 ring-transparent hover:ring-emerald-300 dark:hover:ring-emerald-500 transform hover:scale-105 transition-all duration-300 ease-in-out border border-emerald-100 dark:border-gray-700 text-left w-full cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total Contacts</p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {kpi?.totalContacts?.toLocaleString() || 0}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(getTrendData('totalContacts').direction)}
                      <span className={`text-xs font-medium ${
                        getTrendData('totalContacts').direction === 'up' ? 'text-green-600' :
                        getTrendData('totalContacts').direction === 'down' ? 'text-red-600' :
                        'text-gray-400'
                      }`}>
                        {getTrendData('totalContacts').change}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full group-hover:scale-110 transition-transform">
                  <FiUsers className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">vs. last month</span>
                <FiExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="h-16 flex items-center justify-center">
                <div className="flex space-x-1">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-emerald-200 dark:bg-emerald-700 rounded-full"
                      style={{ height: `${Math.random() * 40 + 20}px` }}
                    />
                  ))}
                </div>
              </div>
            </button>

            {/* Campaigns */}
            <button 
              onClick={() => handleKPICardClick('totalCampaigns')}
              className="bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-600 p-6 rounded-xl shadow hover:shadow-xl ring-1 ring-transparent hover:ring-emerald-300 dark:hover:ring-emerald-500 transform hover:scale-105 transition-all duration-300 ease-in-out border border-emerald-100 dark:border-gray-700 text-left w-full cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Campaigns</p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {kpi?.totalCampaigns?.toLocaleString() || 0}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(getTrendData('totalCampaigns').direction)}
                      <span className={`text-xs font-medium ${
                        getTrendData('totalCampaigns').direction === 'up' ? 'text-green-600' :
                        getTrendData('totalCampaigns').direction === 'down' ? 'text-red-600' :
                        'text-gray-400'
                      }`}>
                        {getTrendData('totalCampaigns').change}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full group-hover:scale-110 transition-transform">
                  <FiMail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">vs. last month</span>
                <FiExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="h-16 flex items-center justify-center">
                <div className="flex space-x-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="w-3 bg-blue-200 dark:bg-blue-700 rounded-full"
                      style={{ height: `${Math.random() * 35 + 15}px` }}
                    />
                  ))}
                </div>
              </div>
            </button>

            {/* Revenue with Bar Chart */}
            <button 
              onClick={() => handleKPICardClick('revenue')}
              className="bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-600 p-6 rounded-xl shadow hover:shadow-xl ring-1 ring-transparent hover:ring-emerald-300 dark:hover:ring-emerald-500 transform hover:scale-105 transition-all duration-300 ease-in-out border border-emerald-100 dark:border-gray-700 text-left w-full cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Revenue</p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      ${kpi?.revenue?.toLocaleString() || '0'}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(getTrendData('revenue').direction)}
                      <span className={`text-xs font-medium ${
                        getTrendData('revenue').direction === 'up' ? 'text-green-600' :
                        getTrendData('revenue').direction === 'down' ? 'text-red-600' :
                        'text-gray-400'
                      }`}>
                        {getTrendData('revenue').change}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full group-hover:scale-110 transition-transform">
                  <FiDollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">vs. last month</span>
                <FiExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="h-16">
                {kpi?.revenueByMonthData && (
                  <Bar
                    data={kpi.revenueByMonthData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                      },
                      scales: {
                        x: { display: false },
                        y: { display: false }
                      },
                      elements: {
                        bar: {
                          borderRadius: 2,
                          backgroundColor: 'rgba(34, 197, 94, 0.6)',
                          borderColor: 'rgba(34, 197, 94, 1)',
                          borderWidth: 1
                        }
                      }
                    }}
                  />
                )}
              </div>
            </button>

            {/* New Policies with Icon Visualization */}
            <button 
              onClick={() => handleKPICardClick('newPolicies')}
              className="bg-gradient-to-br from-emerald-400 to-green-500 dark:from-emerald-600 dark:to-green-700 p-6 rounded-xl shadow hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out text-white text-left w-full cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-emerald-100 dark:text-emerald-200 text-sm">New Policies</p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-3xl font-bold text-white">
                      {kpi?.newPolicies?.toLocaleString() || 0}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getTrendData('newPolicies').direction === 'up' ? 
                        <FiArrowUpRight className="w-3 h-3 text-emerald-100" /> :
                        getTrendData('newPolicies').direction === 'down' ?
                        <FiArrowDownRight className="w-3 h-3 text-red-200" /> :
                        <FiMinus className="w-3 h-3 text-emerald-200" />
                      }
                      <span className={`text-xs font-medium ${
                        getTrendData('newPolicies').direction === 'up' ? 'text-emerald-100' :
                        getTrendData('newPolicies').direction === 'down' ? 'text-red-200' :
                        'text-emerald-200'
                      }`}>
                        {getTrendData('newPolicies').change}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full group-hover:scale-110 transition-transform">
                  <FiPolicy className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-100 dark:text-emerald-200">vs. last month</span>
                <FiExternalLink className="w-3 h-3 text-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="h-16 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <FiUsers className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                    <FiPolicy className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">+</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Claim Status with Doughnut Chart */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 dark:from-emerald-700 dark:to-green-800 p-6 rounded-xl shadow hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-emerald-100 dark:text-emerald-200 text-sm">Claim Status</p>
                  <h3 className="text-3xl font-bold text-white">
                    {kpi?.claimStatusData?.datasets?.[0]?.data?.reduce((a, b) => a + b, 0) || 0}
                  </h3>
                </div>
                <button className="text-emerald-100 hover:text-white">
                  <span className="text-lg">⋯</span>
                </button>
              </div>
              <div className="h-16 flex items-center justify-center">
                {kpi?.claimStatusData && (
                  <div className="w-16 h-16">
                    <Doughnut
                      data={kpi.claimStatusData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: { enabled: false }
                        },
                        cutout: '70%',
                        elements: {
                          arc: {
                            borderWidth: 0
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline Value with Percentage Circle */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6 rounded-xl shadow hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-100 dark:text-blue-200 text-sm">Pipeline</p>
                  <h3 className="text-3xl font-bold text-white">
                    ${kpi?.totalPipelineValue ? (kpi.totalPipelineValue / 1000).toFixed(0) + 'K' : '0'}
                  </h3>
                </div>
                <button className="text-blue-100 hover:text-white">
                  <span className="text-lg">⋯</span>
                </button>
              </div>
              <div className="h-16 flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="2"
                      strokeDasharray="67, 100"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">67%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Texts Sent with Line Chart */}
            <button 
              onClick={() => handleKPICardClick('textsSent')}
              className="bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-600 p-6 rounded-xl shadow hover:shadow-xl ring-1 ring-transparent hover:ring-emerald-300 dark:hover:ring-emerald-500 transform hover:scale-105 transition-all duration-300 ease-in-out border border-emerald-100 dark:border-gray-700 text-left w-full cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Texts Sent</p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {kpi?.textsSent?.toLocaleString() || 0}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(getTrendData('textsSent').direction)}
                      <span className={`text-xs font-medium ${
                        getTrendData('textsSent').direction === 'up' ? 'text-green-600' :
                        getTrendData('textsSent').direction === 'down' ? 'text-red-600' :
                        'text-gray-400'
                      }`}>
                        {getTrendData('textsSent').change}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full group-hover:scale-110 transition-transform">
                  <MdSms className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">vs. last month</span>
                <FiExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="h-16">
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                      data: [120, 150, 180, 200, 170, 220],
                      borderColor: 'rgba(34, 197, 94, 1)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 0,
                      borderWidth: 2
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: false }
                    },
                    scales: {
                      x: { display: false },
                      y: { display: false }
                    },
                    elements: {
                      point: { radius: 0 }
                    }
                  }}
                />
              </div>
            </button>

            {/* Calls Made */}
            <button 
              onClick={() => handleKPICardClick('callsMade')}
              className="bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-600 p-6 rounded-xl shadow hover:shadow-xl ring-1 ring-transparent hover:ring-emerald-300 dark:hover:ring-emerald-500 transform hover:scale-105 transition-all duration-300 ease-in-out border border-emerald-100 dark:border-gray-700 text-left w-full cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Calls Made</p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {kpi?.callsMade?.toLocaleString() || 0}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(getTrendData('callsMade').direction)}
                      <span className={`text-xs font-medium ${
                        getTrendData('callsMade').direction === 'up' ? 'text-green-600' :
                        getTrendData('callsMade').direction === 'down' ? 'text-red-600' :
                        'text-gray-400'
                      }`}>
                        {getTrendData('callsMade').change}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full group-hover:scale-110 transition-transform">
                  <FiPhoneCall className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">vs. last month</span>
                <FiExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="h-16 flex items-center justify-center">
                <div className="flex space-x-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-orange-200 dark:bg-orange-700 rounded-full"
                      style={{ height: `${Math.random() * 45 + 15}px` }}
                    />
                  ))}
                </div>
              </div>
            </button>

            {/* Total Touchpoints */}
            <button 
              onClick={() => handleKPICardClick('totalTouchpoints')}
              className="bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-600 p-6 rounded-xl shadow hover:shadow-xl ring-1 ring-transparent hover:ring-emerald-300 dark:hover:ring-emerald-500 transform hover:scale-105 transition-all duration-300 ease-in-out border border-emerald-100 dark:border-gray-700 text-left w-full cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total Touchpoints</p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {kpi?.totalTouchpoints?.toLocaleString() || 0}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(getTrendData('totalTouchpoints').direction)}
                      <span className={`text-xs font-medium ${
                        getTrendData('totalTouchpoints').direction === 'up' ? 'text-green-600' :
                        getTrendData('totalTouchpoints').direction === 'down' ? 'text-red-600' :
                        'text-gray-400'
                      }`}>
                        {getTrendData('totalTouchpoints').change}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full group-hover:scale-110 transition-transform">
                  <FiCheckSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">vs. last month</span>
                <FiExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="h-16 flex items-center justify-center">
                <div className="flex space-x-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-pink-200 dark:bg-pink-700 rounded-full"
                      style={{ height: `${Math.random() * 50 + 10}px` }}
                    />
                  ))}
                </div>
              </div>
            </button>

            {/* Weighted Pipeline with Area Chart */}
            <button 
              onClick={() => handleKPICardClick('weightedPipelineValue')}
              className="bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-700 dark:hover:to-gray-600 p-6 rounded-xl shadow hover:shadow-xl ring-1 ring-transparent hover:ring-emerald-300 dark:hover:ring-emerald-500 transform hover:scale-105 transition-all duration-300 ease-in-out border border-emerald-100 dark:border-gray-700 text-left w-full cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Weighted Pipeline</p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      ${kpi?.weightedPipelineValue ? (kpi.weightedPipelineValue / 1000).toFixed(0) + 'K' : '0'}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(getTrendData('weightedPipelineValue').direction)}
                      <span className={`text-xs font-medium ${
                        getTrendData('weightedPipelineValue').direction === 'up' ? 'text-green-600' :
                        getTrendData('weightedPipelineValue').direction === 'down' ? 'text-red-600' :
                        'text-gray-400'
                      }`}>
                        {getTrendData('weightedPipelineValue').change}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full group-hover:scale-110 transition-transform">
                  <FiBarChart2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">vs. last month</span>
                <FiExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="h-16">
                {kpi?.pipelineValueTrendData && (
                  <Line
                    data={{
                      labels: kpi.pipelineValueTrendData.labels,
                      datasets: [{
                        data: kpi.pipelineValueTrendData.datasets[1].data, // Use weighted pipeline data
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                      },
                      scales: {
                        x: { display: false },
                        y: { display: false }
                      },
                      elements: {
                        point: { radius: 0 }
                      }
                    }}
                  />
                )}
              </div>
            </button>
          </div>
        </SortableDashboardSection>
      ),
      quickActions: (
        <SortableDashboardSection id="quickActions" key="quickActions" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button onClick={openAddNoteModal} className="flex flex-col items-center justify-center p-6 btn-interactive-hover dark:bg-gray-700 dark:border-gray-600 rounded-lg dark:hover:bg-gray-600 group" aria-label="Add Note">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <FiFileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-gray-900 dark:text-gray-100 font-medium">Add Note</span>
            </button>
            <button onClick={openAddTaskModal} className="flex flex-col items-center justify-center p-6 btn-interactive-hover dark:bg-gray-700 dark:border-gray-600 rounded-lg dark:hover:bg-gray-600 group" aria-label="Create Task">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <FiCheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-gray-900 dark:text-gray-100 font-medium">Create New Task</span>
            </button>
            <button onClick={openEmailCampaignModal} className="flex flex-col items-center justify-center p-6 btn-interactive-hover dark:bg-gray-700 dark:border-gray-600 rounded-lg dark:hover:bg-gray-600 group" aria-label="Send Email">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <FiMail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-gray-900 dark:text-gray-100 font-medium">Send Email</span>
            </button>
            <button onClick={openTextCampaignModal} className="flex flex-col items-center justify-center p-6 btn-interactive-hover dark:bg-gray-700 dark:border-gray-600 rounded-lg dark:hover:bg-gray-600 group" aria-label="Send Text">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-900 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <MdSms className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-gray-900 dark:text-gray-100 font-medium">Send Text</span>
            </button>
            <button onClick={openMakeCallModal} className="flex flex-col items-center justify-center p-6 btn-interactive-hover dark:bg-gray-700 dark:border-gray-600 rounded-lg dark:hover:bg-gray-600 group" aria-label="Make Call">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <FiPhoneCall className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-900 dark:text-gray-100 font-medium">Make Call</span>
            </button>
            <button
              onClick={openSendTeamMessageModal}
              className="flex flex-col items-center justify-center p-6 btn-interactive-hover dark:bg-gray-700 dark:border-gray-600 rounded-lg dark:hover:bg-gray-600 group"
            >
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <FiMessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-purple-900">Team Chat</span>
            </button>
          </div>
        </SortableDashboardSection>
      ),
      engagementStats: (
        <SortableDashboardSection id="engagementStats" key="engagementStats" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Engagement Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Average Open Rate</p>
                <div className="flex items-center space-x-1">
                  {getTrendIcon('up')}
                  <span className="text-xs font-medium text-green-600">3%</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">{kpi?.openRate}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">vs. last month</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-indigo-600 dark:text-indigo-400">Average Reply Rate</p>
                <div className="flex items-center space-x-1">
                  {getTrendIcon('up')}
                  <span className="text-xs font-medium text-green-600">1%</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-1">{kpi?.replyRate}</p>
              <p className="text-xs text-indigo-700 dark:text-indigo-300">vs. last month</p>
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
            <button onClick={handleRefresh} aria-label="Refresh Renewals"><FiRefreshCcw className="text-emerald-500 dark:text-emerald-400" /></button>
          </div>
          <div className="space-y-4">
            {renewals.map((renewal) => (
              <div key={renewal.id} className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{renewal.customerName}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{renewal.policyType}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Renewal: {new Date(renewal.renewalDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                    {renewal.status}
                  </span>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleRenewalAction(renewal, 'contact')}
                    className="flex items-center px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <FiPhoneCall className="w-3 h-3 mr-1" />
                    Contact Client
                  </button>
                  <button
                    onClick={() => handleRenewalAction(renewal, 'quote')}
                    className="flex items-center px-3 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                  >
                    <FiFileText className="w-3 h-3 mr-1" />
                    Generate Quote
                  </button>
                </div>
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
              <div key={note.id} className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{note.author}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {note.content.length > 100 ? `${note.content.slice(0, 100)}...` : note.content}
                    </p>
                    {note.content.length > 100 && (
                      <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-1">
                        Read more
                      </button>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(note.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SortableDashboardSection>
      ),
      calendarSection: (
        <SortableDashboardSection id="calendarSection" key="calendarSection">
          <CalendarSection refreshTrigger={refreshTrigger} />
        </SortableDashboardSection>
      ),
    };

    return sectionComponents[sectionId] || null;
  };

  const visibleSections = typeof getVisibleSections === 'function' ? getVisibleSections() : [];
  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100 relative">
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

      {/* Sticky Notes */}
      {settings?.showStickyNotes && (
        <div className="fixed inset-0 pointer-events-none z-30">
          {stickyNotesLoading ? (
            <div className="absolute top-20 right-20 pointer-events-auto bg-yellow-100 p-4 rounded-lg shadow-lg">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full mr-2"></div>
              <span className="text-yellow-800 text-sm">Loading sticky notes...</span>
            </div>
          ) : (
            // render each note as its own pointer-events-auto element so it doesn't block the entire UI
            stickyNotes.map(note => (
              <div
                key={note.id}
                className="absolute pointer-events-auto"
                style={{
                  left: `${note.x_position || 0}px`,
                  top: `${note.y_position || 0}px`,
                  zIndex: 40
                }}
              >
                <StickyNote
                  note={note}
                  onUpdate={handleStickyNoteUpdate}
                  onDelete={handleStickyNoteDelete}
                />
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

export default Dashboard;
