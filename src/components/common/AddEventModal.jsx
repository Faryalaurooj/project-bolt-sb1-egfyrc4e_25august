import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiCalendar, FiUser, FiTrash2, FiClock, FiMapPin } from 'react-icons/fi';
import { syncEventWithOutlook, syncTaskWithOutlook, deleteOutlookEvent, getOutlookCalendarEvents } from '../../services/outlookSync';
import { getUsers } from '../../services/api';

function AddEventModal({ date, isOpen, onClose, onSave, onDeleteEvent, user, userColors, getUserName, eventsForSelectedDay = [] }) {
  const [eventText, setEventText] = useState('');
  const [eventDate, setEventDate] = useState(date || new Date());
  const [loading, setLoading] = useState(false);
  const [outlookSync, setOutlookSync] = useState(false);
  const [outlookEvents, setOutlookEvents] = useState([]);
  const [loadingOutlookEvents, setLoadingOutlookEvents] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

  useEffect(() => {
    if (date) {
      setEventDate(date);
    }
  }, [date]);

  // Fetch users and match current user's email to find outlook_email
  useEffect(() => {
    const fetchAndMatchUser = async () => {
      if (user?.email && isOpen) {
        setLoadingUserData(true);
        try {
          console.log("🔍 Fetching users to match current user:", user.email);
          const allUsers = await getUsers();
          console.log("👥 All users fetched:", allUsers);
          
          // Find matching user by email
          const foundUser = allUsers.find(u => 
            u.email?.toLowerCase() === user.email?.toLowerCase()
          );
          
          if (foundUser) {
            console.log("✅ Matched user found:", foundUser);
            setMatchedUser(foundUser);
          } else {
            console.log("❌ No matching user found for email:", user.email);
            setMatchedUser(null);
          }
        } catch (error) {
          console.error('❌ Error fetching users:', error);
          setMatchedUser(null);
        } finally {
          setLoadingUserData(false);
        }
      } else {
        setMatchedUser(null);
      }
    };

    fetchAndMatchUser();
  }, [user?.email, isOpen]);

  console.log("user___", user);
  console.log("matchedUser___", matchedUser);

  // Fetch Outlook events when modal opens (using matched user's outlook_email)
  useEffect(() => {
    const fetchOutlookEvents = async () => {
      const outlookEmail = matchedUser?.outlook_email;
      
      if (isOpen && outlookEmail && eventDate) {
        setLoadingOutlookEvents(true);
        try {
          const startDate = new Date(eventDate);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(eventDate);
          endDate.setHours(23, 59, 59, 999);
          
          console.log(`📅 Fetching Outlook events for ${outlookEmail} on ${eventDate.toDateString()}`);
          console.log(`📅 Start date: ${startDate.toISOString()}`);
          console.log(`📅 End date: ${endDate.toISOString()}`);
          
          const events = await getOutlookCalendarEvents(outlookEmail, startDate, endDate);
          setOutlookEvents(events);
          console.log(`✅ Loaded ${events.length} Outlook events for ${eventDate.toDateString()}`);
          console.log(`📊 Events data:`, events);
        } catch (error) {
          console.error('❌ Failed to fetch Outlook events:', error);
          console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            outlookEmail,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          });
          setOutlookEvents([]);
          
          // Show user-friendly error message
          if (error.message?.includes('authentication')) {
            alert('Outlook authentication failed. Please try logging in again.');
          } else if (error.message?.includes('permission')) {
            alert('Calendar permission denied. Please check your Outlook permissions.');
          } else {
            alert(`Failed to load Outlook events: ${error.message}`);
          }
        } finally {
          setLoadingOutlookEvents(false);
        }
      } else {
        setOutlookEvents([]);
      }
    };

    fetchOutlookEvents();
  }, [isOpen, matchedUser?.outlook_email, eventDate]);

  const handleSave = async () => {
    if (eventText.trim()) {
      setLoading(true);
      
      try {
        // Save event locally first
        await onSave(eventText, eventDate);
        
        // Sync with Outlook if matched user has outlook_email
        const outlookEmail = matchedUser?.outlook_email;
        if (outlookSync && outlookEmail) {
          try {
            const eventData = {
              title: eventText,
              eventText: eventText,
              eventDate: eventDate,
              dueDate: eventDate,
              description: `Event created from CRM: ${eventText}`,
              priority: 'Normal',
              duration: 60, // 1 hour default
              reminderMinutes: 15,
              showAs: 'busy'
            };
            
            console.log(`📅 Syncing event to Outlook for ${outlookEmail}`);
            const result = await syncEventWithOutlook(outlookEmail, eventData);
            console.log('✅ Event synced to Outlook calendar successfully:', result);
            
            // Show success message to user
            if (result.webLink) {
              console.log(`🔗 Event created in Outlook: ${result.webLink}`);
            }
          } catch (outlookError) {
            console.error('❌ Failed to sync with Outlook:', outlookError);
            // Don't fail the entire operation if Outlook sync fails
            alert(`Event saved locally, but failed to sync with Outlook: ${outlookError.message}`);
          }
        } else if (outlookSync && !outlookEmail) {
          console.warn('⚠️ Outlook sync requested but no outlook_email found for user');
          alert('Outlook sync is enabled but no Outlook email found for your account.');
        }
        
        setEventText('');
        setOutlookSync(false);
      } catch (error) {
        console.error('Failed to save event:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getUserColor = () => {
    return userColors?.get(user?.id) || '#FF6B9D';
  };

  const getCurrentUserName = () => {
    if (user) {
      const firstName = user.user_metadata?.first_name || user.email?.split('@')[0];
      const lastName = user.user_metadata?.last_name || '';
      return `${firstName} ${lastName}`.trim() || user.email || 'You';
    }
    return 'You';
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg mx-4 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
              ✨ {eventsForSelectedDay.length > 0 ? 'Events for ' + eventDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'Add Team Event'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Show existing events for the selected date */}
          {eventsForSelectedDay.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 flex items-center">
                📋 CRM Events ({eventsForSelectedDay.length})
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {eventsForSelectedDay.map((event) => (
                  <div
                    key={event.id}
                    className="group flex items-center justify-between p-4 rounded-xl shadow-sm border-l-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200"
                    style={{ borderLeftColor: event.color || userColors?.get(event.user_id) }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: event.color || userColors?.get(event.user_id) }}
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {event.event_text}
                        </span>
                        <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center mt-1">
                          👤 {getUserName ? getUserName(event.user_id) : 'Team Member'}
                        </div>
                      </div>
                    </div>
                    {event.user_id === user?.id && (
                      <button
                        onClick={async () => {
                          if (onDeleteEvent) {
                            // Delete locally first
                            await onDeleteEvent(event.id);
                            
                            // If it's an Outlook event, also delete from Outlook
                            const outlookEmail = matchedUser?.outlook_email;
                            if (event.isOutlookEvent && outlookEmail) {
                              try {
                                await deleteOutlookEvent(outlookEmail, event.id);
                                console.log('✅ Event deleted from Outlook successfully');
                              } catch (outlookError) {
                                console.error('❌ Failed to delete from Outlook:', outlookError);
                                // Don't fail the entire operation if Outlook deletion fails
                              }
                            }
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                        title="Delete your event"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-purple-200 dark:border-purple-700 my-4"></div>
            </div>
          )}

          {/* Show Outlook events for the selected date */}
          {matchedUser?.outlook_email && (
            <div className="mb-6">
              <h4 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 flex items-center">
                📅 Outlook Calendar Events
                {loadingOutlookEvents && (
                  <div className="ml-3 animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                )}
              </h4>
              {loadingOutlookEvents ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Loading Outlook events...
                </div>
              ) : outlookEvents.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {outlookEvents.map((event) => (
                    <div
                      key={event.id}
                      className="group flex items-center justify-between p-4 rounded-xl shadow-sm border-l-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200"
                      style={{ borderLeftColor: '#0078D4' }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: '#0078D4' }}
                        />
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {event.event_text}
                          </span>
                          {event.startTime && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                              <FiClock className="w-3 h-3 mr-1" />
                              {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {event.location && (
                                <>
                                  <span className="mx-2">•</span>
                                  <FiMapPin className="w-3 h-3 mr-1" />
                                  {event.location}
                                </>
                              )}
                            </div>
                          )}
                          <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                            📧 From Outlook Calendar
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-3">📅</div>
                  <div className="text-sm font-medium mb-2">No Outlook events found</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
                    <div>📧 {matchedUser?.outlook_email}</div>
                    <div>📅 {eventDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</div>
                  </div>
                </div>
              )}
              <div className="border-t border-blue-200 dark:border-blue-700 my-4"></div>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="flex items-center text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                📝 {eventsForSelectedDay.length > 0 ? 'Add New Event' : 'Event Description'}
              </label>
              <input
                type="text"
                value={eventText}
                onChange={(e) => setEventText(e.target.value)}
                placeholder="Enter event description..."
                className="w-full rounded-xl border-2 border-purple-200 dark:border-purple-700 dark:bg-gray-700 dark:text-white shadow-sm focus:border-purple-400 focus:ring-purple-300 focus:ring-2 transition-all duration-200 p-4 text-base"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
            </div>

            <div>
              <label className="flex items-center text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                📅 Event Date
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                <FiCalendar className="text-purple-500 dark:text-purple-400 text-xl" />
                <input
                  type="date"
                  value={eventDate.toISOString().split('T')[0]}
                  onChange={(e) => setEventDate(new Date(e.target.value))}
                  className="flex-1 rounded-lg border-2 border-purple-200 dark:border-purple-700 dark:bg-gray-700 dark:text-white shadow-sm focus:border-purple-400 focus:ring-purple-300 focus:ring-2 transition-all duration-200 p-3 text-base bg-transparent"
                />
              </div>
              <div className="mt-2 text-sm text-purple-600 dark:text-purple-400">
                Selected: {eventDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            <div>
              <label className="flex items-center text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                👤 Created by
              </label>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: getUserColor() }}
                />
                <FiUser className="text-purple-500 dark:text-purple-400 text-lg" />
                <span className="text-base font-semibold text-purple-800 dark:text-purple-200">
                  {getCurrentUserName()}
                </span>
              </div>
            </div>

            {/* Outlook Sync Toggle */}
            {loadingUserData ? (
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Loading user data...
                </span>
              </div>
            ) : matchedUser?.outlook_email ? (
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200">
                <input
                  type="checkbox"
                  id="outlookSync"
                  checked={outlookSync}
                  onChange={(e) => setOutlookSync(e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="outlookSync" className="text-base font-medium text-blue-800 dark:text-blue-200 flex items-center cursor-pointer">
                  📅 Sync with Outlook Calendar
                </label>
                <div className="text-sm text-blue-600 dark:text-blue-400 ml-2">
                  ({matchedUser.outlook_email})
                </div>
              </div>
            ) : user?.email ? (
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
                <div className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</div>
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  No Outlook email found for {user.email}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={onClose}
              className="px-8 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-all duration-200 border border-gray-200 dark:border-gray-500"
            >
              Cancel
            </button>
            {eventText.trim() && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-pink-600 hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:scale-100 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    ✨ Add Event
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default AddEventModal;

