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
import { getStickyNotes, updateNote, deleteNote } from '../services/api';
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
import StickyNote from '../components/dashboard/StickyNote';

import { useAuth } from '../context/AuthContext';
import { useCustomization } from '../context/CustomizationContext';
import useDashboardKPI from '../hooks/useDashboardKPI'; // KPI Hook

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
function CalendarSection() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [userColors, setUserColors] = useState(new Map());
  const [selectedDateForModal, setSelectedDateForModal] = useState(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
    fetchEventsAndUsers();
  }, []);

  const fetchEventsAndUsers = async () => {
    try {
      setLoading(true);
      const [eventsData, usersData] = await Promise.all([
        getCalendarEvents(),
        getUsers()
      ]);
      
      setEvents(eventsData || []);
      setUsers(usersData || []);
      
      // Assign colors to users
      const colorMap = new Map();
      (usersData || []).forEach((teamUser, index) => {
        colorMap.set(teamUser.id, colorPalette[index % colorPalette.length]);
      });
      setUserColors(colorMap);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setEvents([]);
      setUsers([]);
    } finally {
      setLoading(false);
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
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.event_date === dateStr);
  };

  const getUserName = (userId) => {
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
    setSelectedDateForModal(clickedDate);
    setIsAddEventModalOpen(true);
  };

  return (
    <div className="bg-gradient-to-br from-white-50 to-white-10 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl shadow-lg border-2 border-white-100 dark:border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-Black-800 dark:text-Black-200 flex items-center">
          🗓️ Team Calendar
        </h3>
        <div className="text-sm text-Black-600 dark:text-Black-300 bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm">
          Click any date to add event
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
                  </span>
                </div>
              ))}
            </div>
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
        user={user}
        userColors={userColors}
      />
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const { settings, updateSectionOrder, getVisibleSections } = useCustomization();
  const { kpi, loading, error } = useDashboardKPI(); // Still keeping the hook in case used elsewhere
  const { openAddNoteModal, openAddTaskModal, openEmailCampaignModal, openTextCampaignModal } = useOutletContext();

  const [stickyNotes, setStickyNotes] = useState([]);
  const [stickyNotesLoading, setStickyNotesLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);  // Add refreshTrigger state at the top
  const handleRefresh = () => {
       setRefreshTrigger(prev => prev + 1);
  };  // Example: function to refresh dashboard sections
  // Debug logging
  console.log('🏠 Dashboard rendered - KPI data:', { kpi, loading, error });
  console.log('🏠 Dashboard context functions:', { openAddNoteModal, openAddTaskModal, openEmailCampaignModal, openTextCampaignModal });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch sticky notes
  useEffect(() => {
    if (settings.showStickyNotes) {
      fetchStickyNotes();
    }
  }, [settings.showStickyNotes, refreshTrigger]);

  const fetchStickyNotes = async () => {
    try {
      setStickyNotesLoading(true);
      const notes = await getStickyNotes();
      setStickyNotes(notes || []);
    } catch (error) {
      console.error('Error fetching sticky notes:', error);
      setStickyNotes([]);
    } finally {
      setStickyNotesLoading(false);
    }
  };

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
      {settings.showStickyNotes && (
        <div className="fixed inset-0 pointer-events-none z-30">
          <div className="relative w-full h-full pointer-events-auto">
            {stickyNotesLoading ? (
              <div className="absolute top-20 right-20 bg-yellow-100 p-4 rounded-lg shadow-lg">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full mr-2"></div>
                <span className="text-yellow-800 text-sm">Loading sticky notes...</span>
              </div>
            ) : (
              stickyNotes.map(note => (
                <StickyNote
                  key={note.id}
                  note={note}
                  onUpdate={handleStickyNoteUpdate}
                  onDelete={handleStickyNoteDelete}
                />
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;