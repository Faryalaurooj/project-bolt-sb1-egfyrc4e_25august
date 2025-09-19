import React, { useState } from 'react';
import { X, Lock, Star, HelpCircle, ArrowLeft, FileText, Mail, Download, BarChart } from 'lucide-react';

const DownloadNotesModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    territory: 'East Coast',
    division: 'Northeast',
    region: 'Connecticut',
    district: 'Fairfield',
    office: 'Main Office',
    type: '-- Select a Type --',
    subType: '-- Select a Sub Type --',
    startDate: '09/05/2025',
    endDate: '09/05/2025'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveReport = () => {
    console.log('Saving download notes report for future use...');
  };

  const handleRunReport = (format) => {
    console.log(`Running download notes report as ${format}...`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Download Notes</h2>
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5" />
            <div className="w-5 h-5 bg-white/20 rounded" />
            <Star className="w-5 h-5" />
            <HelpCircle className="w-5 h-5" />
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Structure Selection */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Structure Selection</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Territory:</label>
                <select 
                  value={formData.territory}
                  onChange={(e) => handleInputChange('territory', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>East Coast</option>
                  <option>West Coast</option>
                  <option>Central</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division:</label>
                <select 
                  value={formData.division}
                  onChange={(e) => handleInputChange('division', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>Northeast</option>
                  <option>Southeast</option>
                  <option>Northwest</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region:</label>
                <select 
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>Connecticut</option>
                  <option>New York</option>
                  <option>Massachusetts</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District:</label>
                <select 
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>Fairfield</option>
                  <option>Hartford</option>
                  <option>New Haven</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office:</label>
                <select 
                  value={formData.office}
                  onChange={(e) => handleInputChange('office', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>Main Office</option>
                  <option>Branch Office</option>
                  <option>Regional Office</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Type Selection */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Customer Type Selection</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type:</label>
                <select 
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>-- Select a Type --</option>
                  <option>Individual</option>
                  <option>Business</option>
                  <option>Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub Type:</label>
                <select 
                  value={formData.subType}
                  onChange={(e) => handleInputChange('subType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>-- Select a Sub Type --</option>
                  <option>Standard</option>
                  <option>Premium</option>
                  <option>VIP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Report Selection */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Report Selection</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date:</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <select className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                    <option>Date Range</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date:</label>
                <input
                  type="text"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* On Screen Help */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">On Screen Help</h3>
            <div className="bg-pink-50 border border-pink-200 rounded p-4">
              <div className="flex items-start space-x-2">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  7.7
                </div>
                <div>
                  <span className="font-semibold text-purple-600">Download Notes:</span>
                  <span className="text-gray-700 ml-2">
                    This report lists download notes that have been added by the system during the specified date 
                    range.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Reports Button */}
          <button
            onClick={handleSaveReport}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Save Reports For Future Use or Scheduled Report To Run Automatic
          </button>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-green-500 rounded-full p-2">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => handleRunReport('report')}
                className="bg-green-500 text-white px-6 py-2 rounded font-semibold hover:bg-green-600 transition-colors"
              >
                RUN REPORT
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleRunReport('csv')}
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                title="Export as CSV"
              >
                CSV
              </button>
              <button
                onClick={() => handleRunReport('email')}
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                title="Email Report"
              >
                <Mail className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRunReport('pdf')}
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                title="Export as PDF"
              >
                PDF
              </button>
              <button
                onClick={() => handleRunReport('email2')}
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                title="Email Report"
              >
                <Mail className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRunReport('chart')}
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                title="Chart View"
              >
                <BarChart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadNotesModal;