import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function ReportDateSelection({ formData, onInputChange, showAsOfDate = false, showDisplayTotals = false, showAddOns = false }) {
  const dateRangeOptions = ['Date Range', 'Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month'];
  const displayTotalsOptions = ['Territory', 'Division', 'Region', 'District', 'Office'];
  const addOnsOptions = ['Include Add Ons', 'Exclude Add Ons'];

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Report Selection</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date:</label>
            <div className="flex space-x-2">
              <DatePicker 
                selected={formData.startDate} 
                onChange={d => onInputChange('startDate', d)} 
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2" 
              />
              <select 
                value={formData.dateRange || 'Date Range'}
                onChange={(e) => onInputChange('dateRange', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              >
                {dateRangeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date:</label>
            <DatePicker 
              selected={formData.endDate} 
              onChange={d => onInputChange('endDate', d)} 
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2" 
            />
          </div>
        </div>

        {showAsOfDate && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">As of Date:</label>
              <div className="flex space-x-2">
                <DatePicker 
                  selected={formData.asOfDate} 
                  onChange={d => onInputChange('asOfDate', d)} 
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2" 
                />
                <select 
                  value={formData.asOfDateRange || 'Date Range'}
                  onChange={(e) => onInputChange('asOfDateRange', e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                >
                  {dateRangeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {showDisplayTotals && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Totals:</label>
            <select 
              value={formData.displayTotals || 'Territory'}
              onChange={(e) => onInputChange('displayTotals', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            >
              {displayTotalsOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}

        {showAddOns && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add-Ons:</label>
            <select 
              value={formData.addOns || 'Include Add Ons'}
              onChange={(e) => onInputChange('addOns', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
            >
              {addOnsOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportDateSelection;