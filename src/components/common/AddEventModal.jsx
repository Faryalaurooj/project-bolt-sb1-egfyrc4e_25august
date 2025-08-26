import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiCalendar, FiUser } from 'react-icons/fi';

function AddEventModal({ date, isOpen, onClose, onSave, onDeleteEvent, user, userColors, getUserName, eventsForSelectedDay = [] }) {
  const [eventText, setEventText] = useState('');
  const [eventDate, setEventDate] = useState(date || new Date());
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (date) {
      setEventDate(date);
    }
  }, [date]);

  const handleSave = () => {
    if (eventText.trim()) {
      setLoading(true);
      onSave(eventText, eventDate);
      setEventText('');
      setLoading(false);
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

        <div className="relative bg-white dark:bg-gray-800 w-full max-w-md mx-4 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-purple-800 dark:text-purple-200 flex items-center">
              ✨ {eventsForSelectedDay.length > 0 ? 'Events for ' + eventDate.toLocaleDateString() : 'Add Team Event'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Show existing events for the selected date */}
          {eventsForSelectedDay.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-3 flex items-center">
                📋 Existing Events
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {eventsForSelectedDay.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg shadow-sm border-l-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600"
                    style={{ borderLeftColor: event.color || userColors?.get(event.user_id) }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: event.color || userColors?.get(event.user_id) }}
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {event.event_text}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          👤 Created by {getUserName ? getUserName(event.user_id) : 'Team Member'}
                        </div>
                      </div>
                    </div>
                    {event.user_id === user?.id && (
                      <button
                        onClick={() => {
                          if (onDeleteEvent) {
                            onDeleteEvent(event.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900 transition-all"
                        title="Delete your event"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-purple-200 dark:border-gray-600 my-4"></div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-purple-700 dark:text-purple-300 mb-2 flex items-center">
                📝 {eventsForSelectedDay.length > 0 ? 'Add New Event' : 'Event Description'}
              </label>
              <input
                type="text"
                value={eventText}
                onChange={(e) => setEventText(e.target.value)}
                placeholder="Enter event description..."
                className="w-full rounded-xl border-2 border-purple-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-purple-400 focus:ring-purple-300 focus:ring-2 transition-all p-3"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-purple-700 dark:text-purple-300 mb-2 flex items-center">
                📅 Date
              </label>
              <div className="flex items-center space-x-2">
                <FiCalendar className="text-purple-500 dark:text-purple-400" />
                <input
                  type="date"
                  value={eventDate.toISOString().split('T')[0]}
                  onChange={(e) => setEventDate(new Date(e.target.value))}
                  className="flex-1 rounded-xl border-2 border-purple-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-purple-400 focus:ring-purple-300 focus:ring-2 transition-all p-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-purple-700 dark:text-purple-300 mb-2 flex items-center">
                👤 Created by
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-purple-100 dark:border-gray-600">
                <div
                  className="w-5 h-5 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: getUserColor() }}
                />
                <FiUser className="text-purple-500 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                  {getCurrentUserName()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-all"
            >
              Cancel
            </button>
            {eventText.trim() && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-pink-600 hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:scale-100 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
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
