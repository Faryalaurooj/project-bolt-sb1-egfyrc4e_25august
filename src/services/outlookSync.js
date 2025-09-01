// // import { Client } from "@microsoft/microsoft-graph-client";
// // import { PublicClientApplication } from "@azure/msal-browser";
// // // const msalConfig = {
// // //   auth: {
// // //     clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
// // //     authority: "https://login.microsoftonline.com/common",
// // //     redirectUri: window.location.origin,
// // //   },
// // // };
// // const msalConfig = {
// //   auth: {
// //     // clientId: process.env.REACT_APP_AZURE_CLIENT_ID,
// //       clientId: "7e7988e4-c70c-4052-8beb-93e9f037b22f",
// //     authority: 'https://login.microsoftonline.com/common',
// //     redirectUri: window.location.origin,
// //   },
// //   cache: {
// //     cacheLocation: 'sessionStorage',
// //     storeAuthStateInCookie: false,
// //   }
// // };
// // export const loginRequest = {
// //   scopes: [
// //     'openid',
// //     'profile',
// //     'User.Read',
// //     'Calendars.Read',
// //     'Calendars.ReadWrite',
// //     'Mail.Read',
// //     'offline_access'
// //   ]
// // };
// // let msalInstance = null;

// // msalInstance = new PublicClientApplication(msalConfig);

// // let isInitializing = false;
// // let initializationPromise = null;

// // // Singleton pattern for MSAL initialization
// // export const initializeMSAL = async () => {
// //   if (msalInstance) {
// //     return msalInstance;
// //   }

// //   if (isInitializing) {
// //     return initializationPromise;
// //   }

// //   isInitializing = true;
// //   initializationPromise = new Promise(async (resolve, reject) => {
// //     try {
// //       // msalInstance = new PublicClientApplication(msalConfig);
      
// //       // MSAL requires this initialization to complete before any other API calls
// //       await msalInstance.initialize();
      
// //       console.log('MSAL initialized successfully');
// //       resolve(msalInstance);
// //     } catch (error) {
// //       console.error('MSAL initialization failed:', error);
// //       msalInstance = null;
// //       reject(error);
// //     } finally {
// //       isInitializing = false;
// //     }
// //   });
// //   return initializationPromise;
// // };
// // export const getMSALInstance = () => {
// //   if (!msalInstance) {
// //     throw new Error('MSAL not initialized. Call initializeMSAL() first.');
// //   }
// //   return msalInstance;
// // };

// // export const isMSALInitialized = () => {
// //   return msalInstance !== null;
// // };
// // export const ensureMSALInitialized = async (maxRetries = 3) => {
// //   for (let attempt = 1; attempt <= maxRetries; attempt++) {
// //     try {
// //       if (isMSALInitialized()) {
// //         return getMSALInstance();
// //       }
      
// //       return await initializeMSAL();
// //     } catch (error) {
// //       console.warn(`MSAL initialization attempt ${attempt} failed:`, error);
      
// //       if (attempt === maxRetries) {
// //         throw new Error(`MSAL initialization failed after ${maxRetries} attempts: ${error.message}`);
// //       }
      
// //       // Wait before retrying
// //       await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
// //     }
// //   }
// // };

// // export const initializeOutlookSync = async (userEmail) => {
// //   let msalInstance;
  
// //   try {
// //     // Ensure MSAL is properly initialized before proceeding
// //     msalInstance = await ensureMSALInitialized();
    
// //     console.log('MSAL instance ready for Outlook sync');

// //     // Check if user is already signed in
// //     const accounts = msalInstance.getAllAccounts();
// //     let account = accounts.find(acc => acc.username.toLowerCase() === userEmail.toLowerCase());

// //     if (!account) {
// //       console.log('No existing account found, initiating login popup');
// //       // If no account found, trigger login
// //       const loginResponse = await msalInstance.loginPopup(loginRequest);
// //       account = loginResponse.account;
// //       console.log('Login successful, account:', account.username);
// //     } else {
// //       console.log('Using existing account:', account.username);
// //     }

// //     // Get access token silently first
// //     try {
// //       const tokenResponse = await msalInstance.acquireTokenSilent({
// //         ...loginRequest,
// //         account: account
// //       });

// //       if (tokenResponse && tokenResponse.accessToken) {
// //         console.log('Access token acquired silently');
// //         // Now sync the data
// //         // await syncOutlookData(tokenResponse.accessToken, userEmail);
// //         return { 
// //           success: true, 
// //           message: 'Outlook sync completed successfully',
// //           account: account.username,
// //           token:tokenResponse.accessToken
// //         };
// //       }
// //     } catch (silentError) {
// //       console.log('Silent token acquisition failed, trying interactive:', silentError);
      
// //       // If silent token acquisition fails, try interactive
// //       const tokenResponse = await msalInstance.acquireTokenPopup(loginRequest);
      
// //       if (tokenResponse && tokenResponse.accessToken) {
// //         console.log('Access token acquired via popup');
// //         // await syncOutlookData(tokenResponse.accessToken, userEmail);
// //         return { 
// //           success: true, 
// //           message: 'Outlook sync completed after interactive login',
// //           account: tokenResponse.account.username,
// //           token:tokenResponse.accessToken
// //         };
// //       }
// //     }

// //     throw new Error('Failed to acquire access token');

// //   } catch (error) {
// //     console.error('Outlook sync error:', error);
    
// //     // Enhanced error handling
// //     let errorMessage = 'Outlook sync failed';
    
// //     if (error.errorCode === 'user_cancelled') {
// //       errorMessage = 'Outlook sync cancelled by user';
// //     } else if (error.errorCode === 'login_required') {
// //       errorMessage = 'Please sign in to your Outlook account';
// //     } else if (error.message?.includes('popup_window_error')) {
// //       errorMessage = 'Please allow popups for Outlook authentication';
// //     } else {
// //       errorMessage = `Outlook sync failed: ${error.message}`;
// //     }
    
// //     throw new Error(errorMessage);
// //   }
// // };


// // const getGraphClient = async () => {
// //   const account = msalInstance.getAllAccounts()[0];
// //   if (!account) {
// //     throw new Error("No active account!");
// //   }

// //   const tokenResponse = await msalInstance.acquireTokenSilent({
// //     scopes: ["Calendars.ReadWrite", "Calendars.Read"],
// //     account: account,
// //   });

// //   return Client.init({
// //     authProvider: (done) => {
// //       done(null, tokenResponse.accessToken);
// //     },
// //   });
// // };

// // export const getOutlookCalendarEvents = async (startDate, endDate) => {
// //   try {
// //     const client = await getGraphClient();
    
// //     // Format dates for Microsoft Graph API
// //     const start = startDate.toISOString();
// //     const end = endDate.toISOString();
    
// //     const events = await client
// //       .api('/me/calendarview')
// //       .query({
// //         startDateTime: start,
// //         endDateTime: end,
// //         $select: 'id,subject,start,end,location,bodyPreview,isAllDay',
// //         $orderby: 'start/dateTime'
// //       })
// //       .get();
    
// //     // Transform Outlook events to match our calendar event structure
// //     return events.value.map(event => ({
// //       id: `outlook-${event.id}`,
// //       event_text: event.subject || 'Outlook Event',
// //       event_date: event.start.dateTime.split('T')[0], // Extract date part
// //       color: '#0078D4', // Microsoft blue
// //       user_id: 'outlook', // Special identifier for Outlook events
// //       source: 'outlook',
// //       location: event.location?.displayName,
// //       bodyPreview: event.bodyPreview,
// //       isAllDay: event.isAllDay,
// //       startTime: event.start.dateTime,
// //       endTime: event.end.dateTime
// //     }));
// //   } catch (error) {
// //     console.error("Error fetching Outlook calendar events:", error);
// //     // Return empty array instead of throwing to prevent breaking the calendar
// //     return [];
// //   }
// // };

// // export const syncTaskWithOutlook = async (task) => {
// //   try {
// //     const client = await getGraphClient();
    
// //     const event = {
// //       subject: task.title,
// //       start: {
// //         dateTime: new Date(task.dueDate).toISOString(),
// //         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
// //       },
// //       end: {
// //         dateTime: new Date(task.dueDate).toISOString(),
// //         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
// //       },
// //       body: {
// //         contentType: "text",
// //         content: `Task: ${task.title}\nAssigned to: ${task.assignedTo}\nProject: ${task.project}\nPriority: ${task.priority}`,
// //       },
// //     };

// //     await client.api("/me/events").post(event);
// //   } catch (error) {
// //     console.error("Error syncing with Outlook:", error);
// //     throw error;
// //   }
// // };

// // export const syncMeetingWithOutlook = async (meetingData) => {
// //   try {
// //     const client = await getGraphClient();
    
// //     const event = {
// //       subject: meetingData.subject,
// //       start: {
// //         dateTime: meetingData.startDateTime.toISOString(),
// //         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
// //       },
// //       end: {
// //         dateTime: meetingData.endDateTime.toISOString(),
// //         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
// //       },
// //       body: {
// //         contentType: "HTML",
// //         content: `
// //           <div>
// //             <h3>Meeting with ${meetingData.contactName}</h3>
// //             ${meetingData.notes ? `<p><strong>Notes:</strong> ${meetingData.notes}</p>` : ''}
// //             ${meetingData.location ? `<p><strong>Location:</strong> ${meetingData.location}</p>` : ''}
// //             <p>This meeting was scheduled through your CRM system.</p>
// //           </div>
// //         `,
// //       },
// //       attendees: [
// //         {
// //           emailAddress: {
// //             address: meetingData.attendeeEmail,
// //             name: meetingData.contactName
// //           },
// //           type: "required"
// //         }
// //       ],
// //       location: meetingData.location ? {
// //         displayName: meetingData.location
// //       } : undefined,
// //       isReminderOn: true,
// //       reminderMinutesBeforeStart: 15
// //     };

// //     const createdEvent = await client.api("/me/events").post(event);
// //     console.log('Outlook meeting created:', createdEvent);
// //     return createdEvent;
// //   } catch (error) {
// //     console.error("Error syncing meeting with Outlook:", error);
// //     throw error;
// //   }
// // };

// // // export const initializeOutlookSync = async () => {
// // //   try {
// // //     const loginResponse = await msalInstance.loginPopup({
// // //       scopes: ["Calendars.ReadWrite", "Calendars.Read"],
// // //     });
// // //     return !!loginResponse.account;
// // //   } catch (error) {
// // //     console.error("Error initializing Outlook sync:", error);
// // //     return false;
// // //   }
// // // };

// // export const sendOutlookEmail = async (to, subject, body) => {
// //   try {
// //     const client = await getGraphClient();

// //     const email = {
// //       message: {
// //         subject: subject,
// //         body: {
// //           contentType: "HTML",
// //           content: body,
// //         },
// //         toRecipients: [
// //           {
// //             emailAddress: {
// //               address: to,
// //             },
// //           },
// //         ],
// //       },
// //       saveToSentItems: true,
// //     };
// //     await client.api('/me/sendMail').post(email);
// //   } catch (error) {
// //     throw new Error(`Failed to send email via Outlook: ${error.message}`);
// //   }
// // };

// // src/services/outlookSync.js
// import { Client } from "@microsoft/microsoft-graph-client";
// import { PublicClientApplication } from "@azure/msal-browser";

// // MSAL configuration
// const msalConfig = {
//   auth: {
//     clientId: "d49cebd1-a756-42c9-8d25-a8870739850a", // Your client ID
//     authority: 'https://login.microsoftonline.com/common',
//     redirectUri: window.location.origin,
//   },
//   cache: {
//     cacheLocation: 'sessionStorage',
//     storeAuthStateInCookie: false,
//   }
// };

// export const loginRequest = {
//   scopes: [
//     'openid',
//     'profile',
//     'User.Read',
//     'Calendars.Read',
//     'Calendars.ReadWrite',
//     'Mail.Read',
//     'Mail.Send', // Added Mail.Send for sending emails
//     'offline_access'
//   ]
// };

// let msalInstance = null;
// let isInitializing = false;

// // Singleton pattern for MSAL initialization
// export const initializeMSAL = async () => {
//   if (msalInstance) {
//     return msalInstance;
//   }

//   if (isInitializing) {
//     // Wait for ongoing initialization
//     return new Promise((resolve) => {
//       const checkInitialization = setInterval(() => {
//         if (msalInstance) {
//           clearInterval(checkInitialization);
//           resolve(msalInstance);
//         }
//       }, 100);
//     });
//   }

//   isInitializing = true;
  
//   try {
//     console.log('Initializing MSAL...');
//     msalInstance = new PublicClientApplication(msalConfig);
    
//     // CRITICAL: This must be awaited before any other MSAL API calls
//     await msalInstance.initialize();
    
//     console.log('MSAL initialized successfully');
//     isInitializing = false;
//     return msalInstance;
//   } catch (error) {
//     console.error('MSAL initialization failed:', error);
//     msalInstance = null;
//     isInitializing = false;
//     throw error;
//   }
// };

// export const getMSALInstance = async () => {
//   if (!msalInstance) {
//     return await initializeMSAL();
//   }
//   return msalInstance;
// };

// export const isMSALInitialized = () => {
//   return msalInstance !== null;
// };

// export const ensureMSALInitialized = async (maxRetries = 3) => {
//   for (let attempt = 1; attempt <= maxRetries; attempt++) {
//     try {
//       if (isMSALInitialized()) {
//         return getMSALInstance();
//       }
      
//       return await initializeMSAL();
//     } catch (error) {
//       console.warn(`MSAL initialization attempt ${attempt} failed:`, error);
      
//       if (attempt === maxRetries) {
//         throw new Error(`MSAL initialization failed after ${maxRetries} attempts: ${error.message}`);
//       }
      
//       await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
//     }
//   }
// };

// // Outlook Sync Function
// export const initializeOutlookSync = async (userEmail) => {
//   let msalInstance;
  
//   try {
//     // Ensure MSAL is properly initialized before proceeding
//     msalInstance = await ensureMSALInitialized();
    
//     console.log('MSAL instance ready for Outlook sync');

//     // Check if user is already signed in
//     const accounts = msalInstance.getAllAccounts();
//     let account = accounts.find(acc => acc.username.toLowerCase() === userEmail.toLowerCase());
//     console.log("account",account)

//     if (!account) {
//       console.log('No existing account found, initiating login popup');
//       const loginResponse = await msalInstance.loginPopup(loginRequest);
//       account = loginResponse.account;
//       console.log('Login successful, account:', loginResponse);
//     } else {
//       console.log('Using existing account:', account.username);
//     }

//     // Get access token
//     const tokenResponse = await msalInstance.acquireTokenSilent({
//       ...loginRequest,
//       account: account
//     });
//     console.log('Token response:', tokenResponse);

//     if (tokenResponse && tokenResponse.accessToken) {
//       console.log('Access token acquired successfully');
//       return {
//         success: true,
//         message:'Outlook sync completed successfully',
//         account: account.username,
//         token: tokenResponse.accessToken,
//         refreshToken: tokenResponse.refresh_token
//       };
//     }

//     throw new Error('Failed to acquire access token');

//   } catch (error) {
//     console.error('Outlook sync error:', error);
    
//     let errorMessage = 'Outlook sync failed';
    
//     if (error.errorCode === 'user_cancelled') {
//       errorMessage = 'Outlook sync cancelled by user';
//     } else if (error.errorCode === 'login_required') {
//       errorMessage = 'Please sign in to your Outlook account';
//     } else if (error.message?.includes('popup_window_error')) {
//       errorMessage = 'Please allow popups for Outlook authentication';
//     } else if (error.message?.includes('uninitialized_public_client_application')) {
//       errorMessage = 'Authentication system not ready. Please try again.';
//     } else {
//       errorMessage = `Outlook sync failed: ${error.message}`;
//     }
    
//     throw new Error(errorMessage);
//   }
// };

// // Graph Client Helper
// const getGraphClient = async () => {
//   const msalInstance = await getMSALInstance();
//   const accounts = msalInstance.getAllAccounts();
  
//   if (!accounts || accounts.length === 0) {
//     throw new Error("No active account! Please sign in first.");
//   }

//   const account = accounts[0];
//   const tokenResponse = await msalInstance.acquireTokenSilent({
//     scopes: ["Calendars.ReadWrite", "Calendars.Read", "Mail.Send"],
//     account: account,
//   });

//   return Client.init({
//     authProvider: (done) => {
//       done(null, tokenResponse.accessToken);
//     },
//   });
// };

// // Calendar Events
// export const getOutlookCalendarEvents = async (startDate, endDate) => {
//   try {
//     const client = await getGraphClient();
    
//     const start = startDate.toISOString();
//     const end = endDate.toISOString();
    
//     const events = await client
//       .api('/me/calendarview')
//       .query({
//         startDateTime: start,
//         endDateTime: end,
//         $select: 'id,subject,start,end,location,bodyPreview,isAllDay',
//         $orderby: 'start/dateTime'
//       })
//       .get();
    
//     return events.value.map(event => ({
//       id: `outlook-${event.id}`,
//       event_text: event.subject || 'Outlook Event',
//       event_date: event.start.dateTime.split('T')[0],
//       color: '#0078D4',
//       user_id: 'outlook',
//       source: 'outlook',
//       location: event.location?.displayName,
//       bodyPreview: event.bodyPreview,
//       isAllDay: event.isAllDay,
//       startTime: event.start.dateTime,
//       endTime: event.end.dateTime
//     }));
//   } catch (error) {
//     console.error("Error fetching Outlook calendar events:", error);
//     return [];
//   }
// };

// // Sync Task with Outlook
// export const syncTaskWithOutlook = async (task) => {
//   try {
//     const client = await getGraphClient();
    
//     const event = {
//       subject: task.title,
//       start: {
//         dateTime: new Date(task.dueDate).toISOString(),
//         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       },
//       end: {
//         dateTime: new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
//         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       },
//       body: {
//         contentType: "text",
//         content: `Task: ${task.title}\nDescription: ${task.description || ''}\nPriority: ${task.priority || 'Normal'}`,
//       },
//     };

//     const createdEvent = await client.api("/me/events").post(event);
//     return createdEvent;
//   } catch (error) {
//     console.error("Error syncing task with Outlook:", error);
//     throw error;
//   }
// };

// // Sync Meeting with Outlook
// export const syncMeetingWithOutlook = async (meetingData) => {
//   try {
//     const client = await getGraphClient();
    
//     const event = {
//       subject: meetingData.subject,
//       start: {
//         dateTime: meetingData.startDateTime.toISOString(),
//         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       },
//       end: {
//         dateTime: meetingData.endDateTime.toISOString(),
//         timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       },
//       body: {
//         contentType: "HTML",
//         content: `
//           <div>
//             <h3>${meetingData.subject}</h3>
//             ${meetingData.notes ? `<p><strong>Notes:</strong> ${meetingData.notes}</p>` : ''}
//             ${meetingData.location ? `<p><strong>Location:</strong> ${meetingData.location}</p>` : ''}
//           </div>
//         `,
//       },
//       attendees: meetingData.attendees ? meetingData.attendees.map(attendee => ({
//         emailAddress: {
//           address: attendee.email,
//           name: attendee.name
//         },
//         type: "required"
//       })) : [],
//       location: meetingData.location ? {
//         displayName: meetingData.location
//       } : undefined,
//       isReminderOn: true,
//       reminderMinutesBeforeStart: 15
//     };

//     const createdEvent = await client.api("/me/events").post(event);
//     console.log('Outlook meeting created:', createdEvent);
//     return createdEvent;
//   } catch (error) {
//     console.error("Error syncing meeting with Outlook:", error);
//     throw error;
//   }
// };

// // Send Email via Outlook
// export const sendOutlookEmail = async (to, subject, body, isHtml = true) => {
//   try {
//     const client = await getGraphClient();

//     const email = {
//       message: {
//         subject: subject,
//         body: {
//           contentType: isHtml ? "HTML" : "Text",
//           content: body,
//         },
//         toRecipients: Array.isArray(to) ? to.map(email => ({
//           emailAddress: { address: email }
//         })) : [{
//           emailAddress: { address: to }
//         }],
//       },
//       saveToSentItems: true,
//     };

//     await client.api('/me/sendMail').post(email);
//     return { success: true, message: 'Email sent successfully' };
//   } catch (error) {
//     console.error('Failed to send email via Outlook:', error);
//     throw new Error(`Failed to send email: ${error.message}`);
//   }
// };

// // Pre-initialize MSAL on app load
// export const preInitializeMSAL = async () => {
//   try {
//     await initializeMSAL();
//     return true;
//   } catch (error) {
//     console.warn('MSAL pre-initialization failed:', error.message);
//     return false;
//   }
// };



import { Client } from "@microsoft/microsoft-graph-client";
import { PublicClientApplication } from "@azure/msal-browser";

// =========================
// MSAL CONFIGURATION
// =========================
const msalConfig = {
  auth: {
    clientId: "d49cebd1-a756-42c9-8d25-a8870739850a", // Your Azure AD App Client ID
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [
    "openid",
    "profile",
    "User.Read",
    "Calendars.Read",
    "Calendars.ReadWrite",
    "Mail.Read",
    "Mail.Send", // For sending emails
    "offline_access", // Required for refresh tokens
  ],
};

let msalInstance = null;
let isInitializing = false;

// =========================
// INIT HELPERS
// =========================
export const initializeMSAL = async () => {
  if (msalInstance) return msalInstance;

  if (isInitializing) {
    return new Promise((resolve) => {
      const checkInitialization = setInterval(() => {
        if (msalInstance) {
          clearInterval(checkInitialization);
          resolve(msalInstance);
        }
      }, 100);
    });
  }

  isInitializing = true;
  try {
    console.log("Initializing MSAL...");
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
    console.log("MSAL initialized successfully");
    isInitializing = false;
    return msalInstance;
  } catch (error) {
    console.error("MSAL initialization failed:", error);
    msalInstance = null;
    isInitializing = false;
    throw error;
  }
};

export const getMSALInstance = async () => {
  if (!msalInstance) return await initializeMSAL();
  return msalInstance;
};

// =========================
// TOKEN HELPERS
// =========================

// Acquire token for a specific user (by email)
const getAccessTokenForUser = async (userEmail, scopes = loginRequest.scopes) => {
  let msalInstance = await getMSALInstance();
  let accounts = msalInstance.getAllAccounts();

  // Find account matching user email
  let account = accounts.find(
    (acc) => acc.username.toLowerCase() === userEmail.toLowerCase()
  );

  if (!account) {
          console.log('No existing account found, initiating login popup');
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      account = loginResponse.account;
      console.log('Login successful, account:', loginResponse);
  }

  try {
    const response = await msalInstance.acquireTokenSilent({ scopes, account });
    return response.accessToken;
  } catch (error) {
    console.warn("Silent token acquisition failed, trying popup:", error);
    const response = await msalInstance.acquireTokenPopup({ scopes, account });
    return response.accessToken;
  }
};

// Create Graph Client for a specific user
const getGraphClientForUser = async (userEmail, scopes = loginRequest.scopes) => {
  const token = await getAccessTokenForUser(userEmail, scopes);
  return Client.init({
    authProvider: (done) => {
      done(null, token);
    },
  });
};

// =========================
// LOGIN / SYNC INIT
// =========================
export const loginUser = async () => {
  const msalInstance = await getMSALInstance();
  const response = await msalInstance.loginPopup(loginRequest);
  return response.account;
};

export const initializeOutlookSync = async (userEmail) => {
  try {
    const token = await getAccessTokenForUser(userEmail, loginRequest.scopes);
    return {
      success: true,
      message: "Outlook sync completed successfully",
      account: userEmail,
      token,
    };
  } catch (error) {
    console.error("Outlook sync error:", error);
    throw new Error(`Outlook sync failed: ${error.message}`);
  }
};

// =========================
// OUTLOOK ACTIONS (Per User)
// =========================

// Fetch Calendar Events
export const getOutlookCalendarEvents = async (userEmail, startDate, endDate) => {
  try {
    const client = await getGraphClientForUser(userEmail, [
      "Calendars.Read",
      "Calendars.ReadWrite",
    ]);
    const start = startDate.toISOString();
    const end = endDate.toISOString();

    const events = await client
      .api("/me/calendarview")
      .query({
        startDateTime: start,
        endDateTime: end,
        $select: "id,subject,start,end,location,bodyPreview,isAllDay",
        $orderby: "start/dateTime",
      })
      .get();

    return events.value.map((event) => ({
      id: `outlook-${event.id}`,
      event_text: event.subject || "Outlook Event",
      event_date: event.start.dateTime.split("T")[0],
      color: "#0078D4",
      user_id: userEmail,
      source: "outlook",
      location: event.location?.displayName,
      bodyPreview: event.bodyPreview,
      isAllDay: event.isAllDay,
      startTime: event.start.dateTime,
      endTime: event.end.dateTime,
    }));
  } catch (error) {
    console.error(`Error fetching events for ${userEmail}:`, error);
    return [];
  }
};

// Sync Task
export const syncTaskWithOutlook = async (userEmail, task) => {
  try {
    const client = await getGraphClientForUser(userEmail, ["Calendars.ReadWrite"]);
    const event = {
      subject: task.title,
      start: {
        dateTime: new Date(task.dueDate).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(
          new Date(task.dueDate).getTime() + 60 * 60 * 1000
        ).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      body: {
        contentType: "text",
        content: `Task: ${task.title}\nDescription: ${
          task.description || ""
        }\nPriority: ${task.priority || "Normal"}`,
      },
    };
    return await client.api("/me/events").post(event);
  } catch (error) {
    console.error(`Error syncing task for ${userEmail}:`, error);
    throw error;
  }
};

// Sync Meeting
export const syncMeetingWithOutlook = async (userEmail, meetingData) => {
  try {
    const client = await getGraphClientForUser(userEmail, ["Calendars.ReadWrite"]);
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
            <h3>${meetingData.subject}</h3>
            ${
              meetingData.notes
                ? `<p><strong>Notes:</strong> ${meetingData.notes}</p>`
                : ""
            }
            ${
              meetingData.location
                ? `<p><strong>Location:</strong> ${meetingData.location}</p>`
                : ""
            }
          </div>
        `,
      },
      attendees: meetingData.attendees
        ? meetingData.attendees.map((attendee) => ({
            emailAddress: { address: attendee.email, name: attendee.name },
            type: "required",
          }))
        : [],
      location: meetingData.location
        ? { displayName: meetingData.location }
        : undefined,
      isReminderOn: true,
      reminderMinutesBeforeStart: 15,
    };
    return await client.api("/me/events").post(event);
  } catch (error) {
    console.error(`Error syncing meeting for ${userEmail}:`, error);
    throw error;
  }
};

// Send Email
// export const sendOutlookEmail = async (
//   userEmail,
//   to,
//   subject,
//   body,
//   isHtml = true
// ) => {
//   try {
//     const client = await getGraphClientForUser(userEmail, ["Mail.Send"]);
//     const email = {
//       message: {
//         subject,
//         body: {
//           contentType: isHtml ? "HTML" : "Text",
//           content: body,
//         },
//         toRecipients: Array.isArray(to)
//           ? to.map((email) => ({ emailAddress: { address: email } }))
//           : [{ emailAddress: { address: to } }],
//       },
//       saveToSentItems: true,
//     };
//     await client.api("/me/sendMail").post(email);
//     return { success: true, message: `Email sent from ${userEmail}` };
//   } catch (error) {
//     console.error(`Failed to send email as ${userEmail}:`, error);
//     throw new Error(`Failed to send email: ${error.message}`);
//   }
// };
export const sendOutlookEmail = async (
  userEmail,
  {
    to,
    cc = [],
    bcc = [],
    subject,
    body,
    isHtml = true,
  }
) => {
  try {
    const client = await getGraphClientForUser(userEmail, ["Mail.Send"]);

    // Helper to normalize recipients
    const normalizeRecipients = (recipients) => {
      if (!recipients) return [];
      if (Array.isArray(recipients)) {
        return recipients.map((email) => ({ emailAddress: { address: email } }));
      }
      return [{ emailAddress: { address: recipients } }];
    };

    const email = {
      message: {
        subject,
        body: {
          contentType: isHtml ? "HTML" : "Text",
          content: body,
        },
        toRecipients: normalizeRecipients(to),
        ccRecipients: normalizeRecipients(cc),
        bccRecipients: normalizeRecipients(bcc),
      },
      saveToSentItems: true,
    };

   let res= await client.api("/me/sendMail").post(email);
   console.log("send mail response",res)

    return { success: true, message: `Email sent from ${userEmail}` };
  } catch (error) {
    console.error(`Failed to send email as ${userEmail}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};


// =========================
// AUTO INIT
// =========================
export const preInitializeMSAL = async () => {
  try {
    await initializeMSAL();
    return true;
  } catch (error) {
    console.warn("MSAL pre-initialization failed:", error.message);
    return false;
  }
};
