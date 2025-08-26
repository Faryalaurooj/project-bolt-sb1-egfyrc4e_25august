import { Client } from "@microsoft/microsoft-graph-client";
import { PublicClientApplication } from "@azure/msal-browser";
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

const getGraphClient = async () => {
  const account = msalInstance.getAllAccounts()[0];
  if (!account) {
    throw new Error("No active account!");
  }

  const tokenResponse = await msalInstance.acquireTokenSilent({
    scopes: ["Calendars.ReadWrite", "Calendars.Read"],
    account: account,
  });

  return Client.init({
    authProvider: (done) => {
      done(null, tokenResponse.accessToken);
    },
  });
};

export const getOutlookCalendarEvents = async (startDate, endDate) => {
  try {
    const client = await getGraphClient();
    
    // Format dates for Microsoft Graph API
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    
    const events = await client
      .api('/me/calendarview')
      .query({
        startDateTime: start,
        endDateTime: end,
        $select: 'id,subject,start,end,location,bodyPreview,isAllDay',
        $orderby: 'start/dateTime'
      })
      .get();
    
    // Transform Outlook events to match our calendar event structure
    return events.value.map(event => ({
      id: `outlook-${event.id}`,
      event_text: event.subject || 'Outlook Event',
      event_date: event.start.dateTime.split('T')[0], // Extract date part
      color: '#0078D4', // Microsoft blue
      user_id: 'outlook', // Special identifier for Outlook events
      source: 'outlook',
      location: event.location?.displayName,
      bodyPreview: event.bodyPreview,
      isAllDay: event.isAllDay,
      startTime: event.start.dateTime,
      endTime: event.end.dateTime
    }));
  } catch (error) {
    console.error("Error fetching Outlook calendar events:", error);
    // Return empty array instead of throwing to prevent breaking the calendar
    return [];
  }
};

export const syncTaskWithOutlook = async (task) => {
  try {
    const client = await getGraphClient();
    
    const event = {
      subject: task.title,
      start: {
        dateTime: new Date(task.dueDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(task.dueDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      body: {
        contentType: "text",
        content: `Task: ${task.title}\nAssigned to: ${task.assignedTo}\nProject: ${task.project}\nPriority: ${task.priority}`,
      },
    };

    await client.api("/me/events").post(event);
  } catch (error) {
    console.error("Error syncing with Outlook:", error);
    throw error;
  }
};

export const syncMeetingWithOutlook = async (meetingData) => {
  try {
    const client = await getGraphClient();
    
    const event = {
      subject: meetingData.subject,
      start: {
        dateTime: meetingData.startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: meetingData.endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      body: {
        contentType: "HTML",
        content: `
          <div>
            <h3>Meeting with ${meetingData.contactName}</h3>
            ${meetingData.notes ? `<p><strong>Notes:</strong> ${meetingData.notes}</p>` : ''}
            ${meetingData.location ? `<p><strong>Location:</strong> ${meetingData.location}</p>` : ''}
            <p>This meeting was scheduled through your CRM system.</p>
          </div>
        `,
      },
      attendees: [
        {
          emailAddress: {
            address: meetingData.attendeeEmail,
            name: meetingData.contactName
          },
          type: "required"
        }
      ],
      location: meetingData.location ? {
        displayName: meetingData.location
      } : undefined,
      isReminderOn: true,
      reminderMinutesBeforeStart: 15
    };

    const createdEvent = await client.api("/me/events").post(event);
    console.log('Outlook meeting created:', createdEvent);
    return createdEvent;
  } catch (error) {
    console.error("Error syncing meeting with Outlook:", error);
    throw error;
  }
};

export const initializeOutlookSync = async () => {
  try {
    const loginResponse = await msalInstance.loginPopup({
      scopes: ["Calendars.ReadWrite", "Calendars.Read"],
    });
    return !!loginResponse.account;
  } catch (error) {
    console.error("Error initializing Outlook sync:", error);
    return false;
  }
};

export const sendOutlookEmail = async (to, subject, body) => {
  try {
    const client = await getGraphClient();

    const email = {
      message: {
        subject: subject,
        body: {
          contentType: "HTML",
          content: body,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
      },
      saveToSentItems: true,
    };
    await client.api('/me/sendMail').post(email);
  } catch (error) {
    throw new Error(`Failed to send email via Outlook: ${error.message}`);
  }
};