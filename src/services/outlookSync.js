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
  console.log(`🔑 Getting access token for user: ${userEmail}`);
  console.log(`🔑 Required scopes:`, scopes);
  
  let msalInstance = await getMSALInstance();
  let accounts = msalInstance.getAllAccounts();

  console.log(`👥 Available accounts:`, accounts.map(acc => ({
    username: acc.username,
    name: acc.name,
    localAccountId: acc.localAccountId
  })));

  // Find account matching user email
  let account = accounts.find(
    (acc) => acc.username.toLowerCase() === userEmail.toLowerCase()
  );

  if (!account) {
    console.log('🔐 No existing account found, initiating login popup');
    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      account = loginResponse.account;
      console.log('✅ Login successful, account:', {
        username: loginResponse.account.username,
        name: loginResponse.account.name,
        localAccountId: loginResponse.account.localAccountId
      });
    } catch (loginError) {
      console.error('❌ Login popup failed:', loginError);
      throw new Error(`Login failed: ${loginError.message}`);
    }
  } else {
    console.log('✅ Using existing account:', {
      username: account.username,
      name: account.name,
      localAccountId: account.localAccountId
    });
  }

  try {
    console.log('🔑 Attempting silent token acquisition...');
    const response = await msalInstance.acquireTokenSilent({ scopes, account });
    console.log('✅ Silent token acquisition successful');
    return response.accessToken;
  } catch (error) {
    console.warn("⚠️ Silent token acquisition failed, trying popup:", error);
    try {
      const response = await msalInstance.acquireTokenPopup({ scopes, account });
      console.log('✅ Token acquired via popup');
      return response.accessToken;
    } catch (popupError) {
      console.error('❌ Popup token acquisition failed:', popupError);
      throw new Error(`Token acquisition failed: ${popupError.message}`);
    }
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
    console.log(`🔍 Starting Outlook events fetch for ${userEmail}`);
    console.log(`📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Validate inputs
    if (!userEmail) {
      throw new Error('User email is required');
    }
    
    if (!startDate || !endDate) {
      throw new Error('Start and end dates are required');
    }
    
    console.log(`🔑 Getting Graph client for ${userEmail}...`);
    const client = await getGraphClientForUser(userEmail, [
      "Calendars.Read",
      "Calendars.ReadWrite",
    ]);
    console.log(`✅ Graph client obtained successfully`);
    
    const start = startDate.toISOString();
    const end = endDate.toISOString();

    console.log(`📅 Fetching Outlook events for ${userEmail} from ${start} to ${end}`);

    // Try to fetch events with more detailed error handling
    let events;
    try {
      events = await client
        .api("/me/calendarview")
        .query({
          startDateTime: start,
          endDateTime: end,
          $select: "id,subject,start,end,location,bodyPreview,isAllDay,body",
          $orderby: "start/dateTime",
        })
        .get();
      
      console.log(`📊 Raw API response:`, events);
    } catch (apiError) {
      console.error(`❌ Microsoft Graph API error:`, apiError);
      console.error(`❌ Error details:`, {
        message: apiError.message,
        code: apiError.code,
        statusCode: apiError.statusCode,
        body: apiError.body
      });
      throw apiError;
    }

    if (!events || !events.value) {
      console.warn(`⚠️ No events data in response:`, events);
      return [];
    }

    console.log(`✅ Found ${events.value.length} Outlook events`);

    const mappedEvents = events.value.map((event) => {
      console.log(`📝 Processing event:`, event);
      return {
        id: `outlook-${event.id}`,
        event_text: event.subject || "Outlook Event",
        event_date: event.start?.dateTime ? event.start.dateTime.split("T")[0] : new Date().toISOString().split("T")[0],
        color: "#0078D4", // Microsoft blue
        user_id: userEmail,
        source: "outlook",
        location: event.location?.displayName,
        bodyPreview: event.bodyPreview,
        body: event.body?.content,
        isAllDay: event.isAllDay,
        startTime: event.start?.dateTime,
        endTime: event.end?.dateTime,
        isOutlookEvent: true, // Flag to identify Outlook events
      };
    });

    console.log(`🎯 Final mapped events:`, mappedEvents);
    return mappedEvents;
  } catch (error) {
    console.error(`❌ Error fetching events for ${userEmail}:`, error);
    console.error(`❌ Error stack:`, error.stack);
    throw error; // Re-throw to let caller handle it
  }
};

// Sync Event to Outlook Calendar
export const syncEventWithOutlook = async (userEmail, eventData) => {
  try {
    console.log(`📅 Starting calendar event creation for ${userEmail}`);
    console.log(`📅 Event data received:`, eventData);
    
    const client = await getGraphClientForUser(userEmail, ["Calendars.ReadWrite"]);
    console.log(`✅ Graph client obtained for calendar operations`);
    
    // Parse the event date properly
    const eventDate = new Date(eventData.dueDate || eventData.eventDate);
    console.log(`📅 Parsed event date:`, eventDate);
    console.log(`📅 Event date string:`, eventData.dueDate || eventData.eventDate);
    
    // Validate the date
    if (isNaN(eventDate.getTime())) {
      throw new Error(`Invalid date format: ${eventData.dueDate || eventData.eventDate}`);
    }
    
    // Set event to be 1 hour long by default, or use provided duration
    const startTime = eventDate;
    const endTime = new Date(startTime.getTime() + (eventData.duration || 60) * 60 * 1000);
    
    console.log(`📅 Event timing:`, {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: eventData.duration || 60,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    
    // Create event data for Outlook
    const outlookEvent = {
      subject: eventData.title || eventData.eventText,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      body: {
        contentType: "HTML",
        content: `
          <div style="font-family: Arial, sans-serif;">
            <h3 style="color: #0078D4;">${eventData.title || eventData.eventText}</h3>
            ${eventData.description ? `<p><strong>Description:</strong> ${eventData.description}</p>` : ''}
            ${eventData.location ? `<p><strong>Location:</strong> ${eventData.location}</p>` : ''}
            ${eventData.priority ? `<p><strong>Priority:</strong> ${eventData.priority}</p>` : ''}
            <hr style="border: 1px solid #e1e1e1; margin: 10px 0;">
            <p style="color: #666; font-size: 12px;"><em>Created via CRM System</em></p>
          </div>
        `,
      },
      categories: ["CRM Event"], // Tag events from CRM
      isReminderOn: true,
      reminderMinutesBeforeStart: eventData.reminderMinutes || 15,
      showAs: eventData.showAs || "busy",
      importance: eventData.priority === "High" ? "high" : eventData.priority === "Low" ? "low" : "normal"
    };
    
    console.log(`📅 Creating Outlook calendar event for ${userEmail}:`, outlookEvent);
    console.log(`📅 Event structure:`, {
      subject: outlookEvent.subject,
      startDateTime: outlookEvent.start.dateTime,
      endDateTime: outlookEvent.end.dateTime,
      timeZone: outlookEvent.start.timeZone,
      hasLocation: !!eventData.location,
      hasDescription: !!eventData.description
    });
    
    const result = await client.api("/me/events").post(outlookEvent);
    console.log(`✅ Event created successfully in Outlook calendar:`, result);
    console.log(`✅ Event details:`, {
      id: result.id,
      subject: result.subject,
      start: result.start,
      end: result.end,
      webLink: result.webLink
    });
    
    return {
      success: true,
      outlookEventId: result.id,
      webLink: result.webLink,
      event: result
    };
  } catch (error) {
    console.error(`❌ Error creating Outlook calendar event for ${userEmail}:`, error);
    console.error(`❌ Error details:`, {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      body: error.body,
      stack: error.stack
    });
    
    // Enhanced error handling for calendar events
    let errorMessage = error.message;
    
    if (error.statusCode === 401) {
      errorMessage = `Authentication failed for calendar access. Please ensure you're logged in to your Outlook account (${userEmail}) and have granted Calendars.ReadWrite permission.`;
    } else if (error.statusCode === 403) {
      if (error.message.includes('admin consent') || error.message.includes('admin approval') || error.message.includes('unverified')) {
        errorMessage = `Admin approval required. Your IT administrator needs to grant "Calendars.ReadWrite" permission to this app. Please contact your administrator to visit the Azure Portal and grant admin consent for app ID: d49cebd1-a756-42c9-8d25-a8870739850a`;
      } else {
        errorMessage = `Permission denied. The application doesn't have Calendars.ReadWrite permission for your Outlook account. Please contact your administrator.`;
      }
    } else if (error.statusCode === 400) {
      if (error.message.includes('invalid') && error.message.includes('date')) {
        errorMessage = `Invalid date format. Please check the meeting date and time.`;
      } else if (error.message.includes('invalid') && error.message.includes('time')) {
        errorMessage = `Invalid time format. Please check the meeting time.`;
      } else {
        errorMessage = `Bad request. Please check the meeting details and try again.`;
      }
    } else if (error.statusCode === 429) {
      errorMessage = `Rate limit exceeded. Please wait a moment and try again.`;
    } else if (error.statusCode >= 500) {
      errorMessage = `Microsoft Graph API server error. Please try again later.`;
    }
    
    throw new Error(`Failed to sync event to Outlook: ${errorMessage}`);
  }
};

// Legacy function for backward compatibility
export const syncTaskWithOutlook = async (userEmail, task) => {
  return await syncEventWithOutlook(userEmail, {
    title: task.title,
    dueDate: task.dueDate,
    description: task.description,
    priority: task.priority,
    duration: 60 // 1 hour default
  });
};

// Delete Event from Outlook
export const deleteOutlookEvent = async (userEmail, eventId) => {
  try {
    const client = await getGraphClientForUser(userEmail, ["Calendars.ReadWrite"]);
    
    // Remove the 'outlook-' prefix if it exists
    const cleanEventId = eventId.replace('outlook-', '');
    
    console.log(`Deleting Outlook event ${cleanEventId} for ${userEmail}`);
    await client.api(`/me/events/${cleanEventId}`).delete();
    
    console.log(`Event deleted successfully from Outlook`);
    return { success: true, message: 'Event deleted from Outlook' };
  } catch (error) {
    console.error(`Error deleting Outlook event for ${userEmail}:`, error);
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
    attachments = [],
  }
) => {
  try {
    console.log(`📧 Starting email send process for ${userEmail}`);
    console.log(`📬 Email details:`, {
      from: userEmail,
      to: to,
      subject: subject,
      bodyLength: body?.length || 0,
      isHtml: isHtml
    });

    const client = await getGraphClientForUser(userEmail, ["Mail.Send"]);
    console.log(`✅ Graph client obtained for ${userEmail}`);

    // Helper to normalize recipients
    const normalizeRecipients = (recipients) => {
      if (!recipients) return [];
      if (Array.isArray(recipients)) {
        return recipients.map((email) => ({ emailAddress: { address: email } }));
      }
      return [{ emailAddress: { address: recipients } }];
    };

    // Convert File objects to Graph fileAttachment format
    const fileToBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const result = reader.result || '';
            const base64 = typeof result === 'string' ? result.split(',')[1] || result : '';
            resolve({
              '@odata.type': '#microsoft.graph.fileAttachment',
              name: file.name,
              contentType: file.type || 'application/octet-stream',
              contentBytes: base64,
            });
          } catch (e) {
            reject(e);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    let graphAttachments = [];
    if (attachments && attachments.length > 0) {
      const toConvert = attachments
        .map((att) => att?.file || att)
        .filter((f) => !!f && typeof File !== 'undefined' && f instanceof File);
      graphAttachments = await Promise.all(toConvert.map((f) => fileToBase64(f)));
    }

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
        ...(graphAttachments.length > 0 ? { attachments: graphAttachments } : {}),
      },
      saveToSentItems: true,
    };

    console.log(`📤 Sending email via Microsoft Graph API...`);
    console.log(`📧 Email structure:`, {
      subject: email.message.subject,
      toRecipients: email.message.toRecipients,
      bodyType: email.message.body.contentType,
      bodyLength: email.message.body.content.length,
      hasAttachments: graphAttachments.length > 0
    });

    let res = await client.api("/me/sendMail").post(email);
    console.log("✅ Send mail response:", res);

    return { success: true, message: `Email sent from ${userEmail}` };
  } catch (error) {
    console.error(`❌ Failed to send email as ${userEmail}:`, error);
    console.error(`❌ Error details:`, {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      body: error.body,
      stack: error.stack
    });
    
    // Enhanced error handling
    let errorMessage = error.message;
    
    if (error.statusCode === 401) {
      errorMessage = `Authentication failed. Please ensure you're logged in to your Outlook account (${userEmail}) and have granted the necessary permissions.`;
    } else if (error.statusCode === 403) {
      errorMessage = `Permission denied. The application doesn't have Mail.Send permission for your Outlook account. Please contact your administrator.`;
    } else if (error.statusCode === 400) {
      if (error.message.includes('invalid') && error.message.includes('email')) {
        errorMessage = `Invalid email address format. Please check the recipient email addresses.`;
      } else {
        errorMessage = `Bad request. Please check the email content and recipient addresses.`;
      }
    } else if (error.statusCode === 429) {
      errorMessage = `Rate limit exceeded. Please wait a moment and try again.`;
    } else if (error.statusCode >= 500) {
      errorMessage = `Microsoft Graph API server error. Please try again later.`;
    }
    
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
};

// Sync All Outlook Events to Local Calendar
export const syncOutlookEventsToLocal = async (userEmail, startDate, endDate, localEventCallback) => {
  try {
    console.log(`Syncing Outlook events to local calendar for ${userEmail}`);
    
    // Fetch Outlook events
    const outlookEvents = await getOutlookCalendarEvents(userEmail, startDate, endDate);
    
    console.log(`Found ${outlookEvents.length} Outlook events to sync`);
    
    // Process each event through the callback (to save locally)
    const syncedEvents = [];
    for (const event of outlookEvents) {
      try {
        if (localEventCallback && typeof localEventCallback === 'function') {
          const localEvent = await localEventCallback(event);
          syncedEvents.push(localEvent);
        } else {
          syncedEvents.push(event);
        }
      } catch (error) {
        console.warn(`Failed to sync individual event ${event.id}:`, error);
      }
    }
    
    return {
      success: true,
      syncedCount: syncedEvents.length,
      events: syncedEvents
    };
  } catch (error) {
    console.error(`Error syncing Outlook events to local for ${userEmail}:`, error);
    throw error;
  }
};

// Get User's Primary Calendar Info
export const getOutlookCalendarInfo = async (userEmail) => {
  try {
    const client = await getGraphClientForUser(userEmail, ["Calendars.Read"]);
    
    const calendar = await client.api("/me/calendar").get();
    
    return {
      id: calendar.id,
      name: calendar.name,
      color: calendar.color,
      owner: calendar.owner
    };
  } catch (error) {
    console.error(`Error fetching calendar info for ${userEmail}:`, error);
    throw error;
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
