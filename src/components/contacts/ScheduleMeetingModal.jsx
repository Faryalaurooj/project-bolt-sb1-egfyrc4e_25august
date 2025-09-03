import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiCalendar, FiClock, FiMapPin, FiMail, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { getUsers } from '../../services/api';
import { sendOutlookEmail, syncEventWithOutlook } from '../../services/outlookSync';

function ScheduleMeetingModal({ isOpen, onClose, contact, onMeetingScheduled }) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    notes: '',
    duration: '60'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedInUserOutlookEmail, setLoggedInUserOutlookEmail] = useState(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  // Fetch logged-in user's Outlook email when modal opens
  useEffect(() => {
    const fetchLoggedInUserOutlookEmail = async () => {
      if (!user?.id) return;
      
      setIsLoadingUserData(true);
      try {
        
        const users = await getUsers();
        
        
        // Find the logged-in user by ID
        const loggedInUser = users.find(u => u.id === user.id);
        
        
        if (loggedInUser?.outlook_email) {
          setLoggedInUserOutlookEmail(loggedInUser.outlook_email);
        
        } else {
       
          setLoggedInUserOutlookEmail(null);
        }
      } catch (error) {
       
        setLoggedInUserOutlookEmail(null);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    if (isOpen && user?.id) {
      fetchLoggedInUserOutlookEmail();
    }
  }, [isOpen, user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time) {
      showError('Please fill in all required fields');
      return;
    }

    if (!loggedInUserOutlookEmail) {
      showError('Outlook email not found for logged-in user. Please check your profile settings.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const meetingData = {
        ...formData,
        contactId: contact.id,
        contactName: `${contact.first_name || contact.firstName} ${contact.last_name || contact.lastName}`,
        contactEmail: contact.email,
        scheduledBy: user?.first_name || user?.email || 'Unknown',
        scheduledByEmail: loggedInUserOutlookEmail
      };

   

      // Send email via Outlook if contact has email
      if (contact.email && loggedInUserOutlookEmail) {
        try {
         
          
          const emailSubject = `Meeting Scheduled - ${formData.title}`;
          const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                <h2 style="color: white; margin: 0;">Meeting Scheduled</h2>
              </div>
              
              <div style="padding: 30px; background: #f8f9fa;">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                  Hello ${contact.first_name || contact.firstName} ${contact.last_name || contact.lastName},
                </p>
                
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                  We have scheduled a meeting with you. Here are the details:
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
                  <h3 style="color: #667eea; margin-top: 0;">Meeting Details</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee;">
                      <strong style="color: #333;">📅 Date:</strong> 
                      <span style="color: #666;">${new Date(formData.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
                      })}</span>
                    </li>
                    <li style="margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee;">
                      <strong style="color: #333;">🕐 Time:</strong> 
                      <span style="color: #666;">${formData.time}</span>
                    </li>
                    <li style="margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee;">
                      <strong style="color: #333;">📋 Subject:</strong> 
                      <span style="color: #666;">${formData.title}</span>
                    </li>
                    <li style="margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee;">
                      <strong style="color: #333;">📍 Location:</strong> 
                      <span style="color: #666;">${formData.location || 'TBD'}</span>
                    </li>
                    <li style="margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee;">
                      <strong style="color: #333;">⏱️ Duration:</strong> 
                      <span style="color: #666;">${formData.duration} minutes</span>
                    </li>
                    ${formData.notes ? `
                    <li style="margin-bottom: 10px; padding: 8px 0;">
                      <strong style="color: #333;">📝 Notes:</strong> 
                      <span style="color: #666;">${formData.notes}</span>
                    </li>
                    ` : ''}
                  </ul>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                  Please let us know if you need to reschedule or if you have any questions.
                </p>
                
                <div style="text-align: center; padding: 20px; background: #e9ecef; border-radius: 8px;">
                  <p style="margin: 0; color: #666; font-size: 14px;">
                    Best regards,<br>
                    <strong style="color: #333;">${user?.first_name || user?.email || 'CRM Team'}</strong><br>
                    <span style="color: #667eea;">${loggedInUserOutlookEmail}</span>
                  </p>
                </div>
              </div>
              
              <div style="background: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #dee2e6;">
                <p style="margin: 0; color: #6c757d; font-size: 12px;">
                  This email was sent from your CRM system
                </p>
              </div>
            </div>
          `;

        
          await sendOutlookEmail(loggedInUserOutlookEmail, {
            to: contact.email,
            subject: emailSubject,
            body: emailBody,
            isHtml: true
          });

         
          
          // Now create the calendar event
          try {
      
            
            // Create the event data for Outlook calendar
            const eventData = {
              title: formData.title,
              dueDate: new Date(`${formData.date}T${formData.time}`),
              description: formData.notes || `Meeting with ${contact.first_name || contact.firstName} ${contact.last_name || contact.lastName}`,
              location: formData.location || 'TBD',
              duration: parseInt(formData.duration),
              priority: 'Normal'
            };
            
          
            
            const calendarResult = await syncEventWithOutlook(contact.email, eventData);
           
            
            showSuccess('Meeting scheduled, email sent, and calendar event created successfully!');
          } catch (calendarError) {
          
            // Enhanced error handling for calendar events
            let errorMessage = `Email sent but failed to create calendar event: ${calendarError.message}`;
            
            if (calendarError.message.includes('Authentication failed')) {
              errorMessage = `Email sent but calendar access failed. Please ensure you're logged in to your Outlook account and have granted calendar permissions.`;
            } else if (calendarError.message.includes('Permission denied') || calendarError.message.includes('admin consent') || calendarError.message.includes('admin approval')) {
              errorMessage = `Email sent but calendar permission denied. Your IT administrator needs to grant "Calendars.ReadWrite" permission to this app. Please contact your administrator or ask them to visit the Azure Portal to grant admin consent.`;
            } else if (calendarError.message.includes('Invalid date')) {
              errorMessage = `Email sent but invalid meeting date/time. Please check the date and time format.`;
            } else if (calendarError.message.includes('Rate limit')) {
              errorMessage = `Email sent but calendar rate limit exceeded. Please wait a moment and try again.`;
            } else if (calendarError.message.includes('unverified') || calendarError.message.includes('organization')) {
              errorMessage = `Email sent but admin approval required. Please contact your IT administrator to grant permission to this app in Azure AD.`;
            }
            
            showError(errorMessage);
          }
        } catch (emailError) {
       
          
          // Enhanced error handling for different types of email failures
          let errorMessage = `Meeting scheduled but failed to send email: ${emailError.message}`;
          
          if (emailError.message.includes('AADSTS') || emailError.message.includes('authentication')) {
            errorMessage = `Authentication failed. Please ensure your Outlook account (${loggedInUserOutlookEmail}) is properly configured and you have granted the necessary permissions.`;
          } else if (emailError.message.includes('consent') || emailError.message.includes('permission')) {
            errorMessage = `Permission denied. Please ensure the application has Mail.Send permission for your Outlook account.`;
          } else if (emailError.message.includes('tenant') || emailError.message.includes('organization')) {
            errorMessage = `Organization/tenant issue. Please contact your IT administrator to configure the application for your domain.`;
          } else if (emailError.message.includes('invalid') && emailError.message.includes('email')) {
            errorMessage = `Invalid email address format. Please check the contact's email address: ${contact.email}`;
          } else if (emailError.message.includes('quota') || emailError.message.includes('limit')) {
            errorMessage = `Email sending quota exceeded. Please try again later.`;
          } else if (emailError.message.includes('network') || emailError.message.includes('timeout')) {
            errorMessage = `Network error. Please check your internet connection and try again.`;
          }
          
          showError(errorMessage);
        }
      } else {
       
        
        // Still create calendar event even if no email
        try {
     
          
          const eventData = {
            title: formData.title,
            dueDate: new Date(`${formData.date}T${formData.time}`),
            description: formData.notes || `Meeting with ${contact.first_name || contact.firstName} ${contact.last_name || contact.lastName}`,
            location: formData.location || 'TBD',
            duration: parseInt(formData.duration),
            priority: 'Normal'
          };
          
         
          
          const calendarResult = await syncEventWithOutlook(loggedInUserOutlookEmail, eventData);
     
          
          showSuccess('Meeting scheduled and calendar event created successfully!');
        } catch (calendarError) {
       
          // Enhanced error handling for calendar events
          let errorMessage = `Meeting scheduled but failed to create calendar event: ${calendarError.message}`;
          
          if (calendarError.message.includes('Authentication failed')) {
            errorMessage = `Meeting scheduled but calendar access failed. Please ensure you're logged in to your Outlook account and have granted calendar permissions.`;
          } else if (calendarError.message.includes('Permission denied') || calendarError.message.includes('admin consent') || calendarError.message.includes('admin approval')) {
            errorMessage = `Meeting scheduled but calendar permission denied. Your IT administrator needs to grant "Calendars.ReadWrite" permission to this app. Please contact your administrator or ask them to visit the Azure Portal to grant admin consent.`;
          } else if (calendarError.message.includes('Invalid date')) {
            errorMessage = `Meeting scheduled but invalid meeting date/time. Please check the date and time format.`;
          } else if (calendarError.message.includes('Rate limit')) {
            errorMessage = `Meeting scheduled but calendar rate limit exceeded. Please wait a moment and try again.`;
          } else if (calendarError.message.includes('unverified') || calendarError.message.includes('organization')) {
            errorMessage = `Meeting scheduled but admin approval required. Please contact your IT administrator to grant permission to this app in Azure AD.`;
          }
          
          showError(errorMessage);
        }
      }

      // Call the parent component's handler
      await onMeetingScheduled(meetingData);

      // Reset form
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        notes: '',
        duration: '60'
      });
      
      onClose();
    } catch (error) {
     
      showError('Failed to schedule meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',
      notes: '',
      duration: '60'
    });
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white w-full max-w-2xl mx-4 rounded-lg shadow-xl">
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Schedule Meeting
                </Dialog.Title>
                <p className="text-sm text-gray-600">
                  with {contact?.first_name || contact?.firstName} {contact?.last_name || contact?.lastName}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {(contact?.first_name || contact?.firstName)?.[0]}{(contact?.last_name || contact?.lastName)?.[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {contact?.first_name || contact?.firstName} {contact?.last_name || contact?.lastName}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {contact?.email && (
                        <span className="flex items-center">
                          <FiMail className="w-4 h-4 mr-1" />
                          {contact.email}
                        </span>
                      )}
                      {(contact?.phone || contact?.cell_number || contact?.home_phone_number) && (
                        <span className="flex items-center">
                          <FiUser className="w-4 h-4 mr-1" />
                          {contact.phone || contact.cell_number || contact.home_phone_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meeting Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Project Discussion, Sales Meeting"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Duration and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="30">30 minutes</option>
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
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Conference Room A, Zoom, Office"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Add any additional notes or agenda items..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <FiCalendar className="mr-2" />
                {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </Dialog>
  );
}

export default ScheduleMeetingModal;