import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiCalendar, FiClock, FiUser, FiMail, FiSave } from 'react-icons/fi';
import { syncMeetingWithOutlook, sendOutlookEmail } from '../../services/outlookSync';
import { createCalendarEvent } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function ScheduleMeetingModal({ isOpen, onClose, contact, onMeetingScheduled }) {
  const { user } = useAuth();
  const [meetingData, setMeetingData] = useState({
    subject: '',
    date: '',
    time: '',
    duration: '30',
    notes: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeetingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleMeeting = async () => {
    if (!meetingData.subject || !meetingData.date || !meetingData.time) {
      setError('Please fill in all required fields');
      return;
    }

    if (!contact?.email) {
      setError('Contact does not have an email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Combine date and time
      const meetingDateTime = new Date(`${meetingData.date}T${meetingData.time}`);
      const endDateTime = new Date(meetingDateTime.getTime() + (parseInt(meetingData.duration) * 60000));

      // Create calendar event in CRM
      await createCalendarEvent({
        event_text: `Meeting: ${meetingData.subject} with ${contact.first_name} ${contact.last_name}`,
        event_date: meetingData.date,
        color: '#10B981' // Green color for meetings
      });

      // Sync with Outlook calendar if available
      try {
        await syncMeetingWithOutlook({
          subject: meetingData.subject,
          startDateTime: meetingDateTime,
          endDateTime: endDateTime,
          attendeeEmail: contact.email,
          location: meetingData.location,
          notes: meetingData.notes,
          contactName: `${contact.first_name} ${contact.last_name}`
        });
        console.log('Meeting synced with Outlook successfully');
      } catch (outlookError) {
        console.warn('Failed to sync with Outlook:', outlookError);
        // Continue even if Outlook sync fails
      }

      // Send email to contact
      const emailSubject = `Meeting Scheduled: ${meetingData.subject}`;
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Meeting Scheduled</h2>
          
          <p>Dear ${contact.first_name},</p>
          
          <p>I hope this email finds you well. I wanted to confirm that we have scheduled a meeting with the following details:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Meeting Details</h3>
            <p><strong>Subject:</strong> ${meetingData.subject}</p>
            <p><strong>Date:</strong> ${new Date(meetingDateTime).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Time:</strong> ${new Date(meetingDateTime).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}</p>
            <p><strong>Duration:</strong> ${meetingData.duration} minutes</p>
            ${meetingData.location ? `<p><strong>Location:</strong> ${meetingData.location}</p>` : ''}
            ${meetingData.notes ? `<p><strong>Notes:</strong> ${meetingData.notes}</p>` : ''}
          </div>
          
          <p>Please let me know if you need to reschedule or if you have any questions.</p>
          
          <p>Looking forward to our meeting!</p>
          
          <p>Best regards,<br>
          ${user?.first_name || user?.email?.split('@')[0] || 'Your Agent'}</p>
        </div>
      `;

      try {
        await sendOutlookEmail(contact.email, emailSubject, emailBody);
        console.log('Meeting confirmation email sent successfully');
      } catch (emailError) {
        console.warn('Failed to send email via Outlook, falling back to mailto:', emailError);
        // Fallback to mailto link
        const mailtoLink = `mailto:${contact.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody.replace(/<[^>]*>/g, ''))}`;
        window.open(mailtoLink, '_blank');
      }

      // Reset form
      setMeetingData({
        subject: '',
        date: '',
        time: '',
        duration: '30',
        notes: '',
        location: ''
      });

      alert('Meeting scheduled successfully! Calendar event created and email sent to contact.');
      
      if (onMeetingScheduled) {
        onMeetingScheduled();
      }
      
      onClose();
    } catch (err) {
      console.error('Error scheduling meeting:', err);
      setError('Failed to schedule meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-60 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white w-full max-w-2xl mx-4 rounded-lg shadow-xl">
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Schedule Meeting
                </Dialog.Title>
                <p className="text-sm text-gray-600">
                  with {contact?.first_name} {contact?.last_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={meetingData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Policy Review Meeting"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="inline w-4 h-4 mr-1" />
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={meetingData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiClock className="inline w-4 h-4 mr-1" />
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={meetingData.time}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    name="duration"
                    value={meetingData.duration}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={meetingData.location}
                    onChange={handleChange}
                    placeholder="Office, Online, etc."
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Notes
                </label>
                <textarea
                  name="notes"
                  value={meetingData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Agenda, topics to discuss, preparation notes..."
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 focus:ring-2"
                />
              </div>

              {/* Contact Information Display */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Meeting Attendee</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {contact?.first_name?.[0]}{contact?.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {contact?.first_name} {contact?.last_name}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <FiMail className="mr-1" />
                      {contact?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleMeeting}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </>
                )}
              </button>
            </div>
          </div>
          </div>
        </div>
      </Dialog>
    
  );
}

export default ScheduleMeetingModal;