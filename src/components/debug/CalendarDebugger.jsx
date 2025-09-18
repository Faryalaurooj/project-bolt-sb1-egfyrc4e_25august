import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarDebugger = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [clickedDate, setClickedDate] = useState(null);

  const handleDateClick = (date) => {
    console.log('📅 CalendarDebugger - Date clicked:', date);
    console.log('📅 CalendarDebugger - Date local string:', date.toLocaleDateString());
    console.log('📅 CalendarDebugger - Date ISO string:', date.toISOString());
    console.log('📅 CalendarDebugger - Date day number:', date.getDate());
    
    // Create a new date object to avoid timezone issues
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    console.log('📅 CalendarDebugger - Local date created:', localDate);
    console.log('📅 CalendarDebugger - Local date string:', localDate.toLocaleDateString());
    console.log('📅 CalendarDebugger - Local date day number:', localDate.getDate());
    
    setClickedDate(localDate);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Calendar Debugger</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Selected Date:</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Last Clicked Date:</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {clickedDate ? clickedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : 'No date clicked yet'}
        </p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Date String Format:</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {clickedDate ? clickedDate.toISOString().split('T')[0] : 'No date clicked yet'}
        </p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Day Number:</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {clickedDate ? clickedDate.getDate() : 'No date clicked yet'}
        </p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Timezone Info:</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {clickedDate ? (
            <>
              <div>ISO: {clickedDate.toISOString()}</div>
              <div>Local: {clickedDate.toLocaleDateString()}</div>
              <div>Day: {clickedDate.getDate()}</div>
            </>
          ) : 'No date clicked yet'}
        </p>
      </div>

      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        onClickDay={handleDateClick}
        className="w-full"
      />

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Instructions:</h4>
        <ol className="text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1">
          <li>Click on any date in the calendar above</li>
          <li>Check the browser console for debug logs</li>
          <li>Verify the date format matches your events</li>
          <li>Compare with the main calendar behavior</li>
        </ol>
      </div>
    </div>
  );
};

export default CalendarDebugger;
