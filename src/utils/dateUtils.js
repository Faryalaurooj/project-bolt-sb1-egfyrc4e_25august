// Date utility functions to completely avoid timezone issues

/**
 * Creates a date object that represents the exact date without timezone conversion
 * @param {Date|string} dateInput - The input date
 * @returns {Date} - A date object representing the exact date
 */
export const createExactDate = (dateInput) => {
  if (!dateInput) return new Date();
  
  let year, month, day;
  
  if (dateInput instanceof Date) {
    // Extract the exact date components from the input
    year = dateInput.getFullYear();
    month = dateInput.getMonth();
    day = dateInput.getDate();
  } else if (typeof dateInput === 'string') {
    // Parse string date (YYYY-MM-DD format)
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      day = parseInt(parts[2], 10);
    } else {
      // Fallback to parsing as regular date
      const parsed = new Date(dateInput);
      year = parsed.getFullYear();
      month = parsed.getMonth();
      day = parsed.getDate();
    }
  } else {
    return new Date();
  }
  
  // Create a new date object with the exact components
  // This ensures no timezone conversion happens
  return new Date(year, month, day, 12, 0, 0, 0); // Set to noon to avoid DST issues
};

/**
 * Converts a date to YYYY-MM-DD string format without timezone issues
 * @param {Date} date - The date to convert
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const toDateString = (date) => {
  if (!date) return new Date().toISOString().split('T')[0];
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Gets the day number from a date without timezone issues
 * @param {Date} date - The date
 * @returns {number} - The day number (1-31)
 */
export const getDayNumber = (date) => {
  if (!date) return new Date().getDate();
  return date.getDate();
};

/**
 * Creates a date range for Outlook API calls
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} - Object with start and end ISO strings
 */
export const createDateRange = (startDate, endDate) => {
  const start = createExactDate(startDate);
  const end = createExactDate(endDate);
  
  // Set start to beginning of day
  start.setHours(0, 0, 0, 0);
  // Set end to end of day
  end.setHours(23, 59, 59, 999);
  
  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
};

/**
 * Creates Outlook event times from a date
 * @param {Date} date - The event date
 * @param {number} duration - Duration in minutes (default 60)
 * @returns {Object} - Object with start and end times
 */
export const createOutlookEventTimes = (date, duration = 60) => {
  const eventDate = createExactDate(date);
  
  // Create start time at 9:00 AM
  const startTime = new Date(eventDate);
  startTime.setHours(9, 0, 0, 0);
  
  // Create end time
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);
  
  return {
    startTime,
    endTime,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};

/**
 * Parses Outlook event date without timezone issues
 * @param {string} dateTimeString - ISO date time string from Outlook
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const parseOutlookDate = (dateTimeString) => {
  if (!dateTimeString) return toDateString(new Date());
  
  const date = new Date(dateTimeString);
  return toDateString(date);
};

// Debug function to help troubleshoot date issues
export const debugDate = (label, date) => {
  console.log(`🔍 ${label}:`, {
    original: date,
    type: typeof date,
    day: date?.getDate?.() || 'N/A',
    month: date?.getMonth?.() || 'N/A',
    year: date?.getFullYear?.() || 'N/A',
    iso: date?.toISOString?.() || 'N/A',
    local: date?.toLocaleDateString?.() || 'N/A',
    dateString: toDateString(date)
  });
};
