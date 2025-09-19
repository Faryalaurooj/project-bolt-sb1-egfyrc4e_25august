import React, { useState } from 'react';
import { X, Lock, Star, HelpCircle, ArrowLeft, FileText, Mail, Download, Printer } from 'lucide-react';

const CustomerReportModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    territory: 'East Coast',
    division: 'Northeast',
    region: 'Connecticut',
    district: 'Fairfield',
    office: 'Main Office',
    reportTemplate: 'Current Default - Levitate Contact List',
    type: '-- Select a Type --',
    subType: '-- Select a Sub Type --',
    agentOfRecord: '- All Agent Of Record -',
    customerCSR: '- All Employee -',
    policyCSR: '- All Employee -',
    referralSources: '- Select Source -',
    policyCarrier: '- All Companies -',
    policyType: '- All Policy Types -',
    customerTag: '- Select A Tag -',
    customerType: 'Customers and Prospects',
    customerStatus: 'Any',
    orderBy: 'Office',
    emailFilter: 'No Preference',
    cellFilter: 'No Preference',
    withActivePolicies: true,
    withWebAccess: false,
    withVerifiedInformation: false,
    useDateRange: false,
    datesUsed: 'Use Conversion Date & Add Date',
    startDate: '09/05/2025',
    endDate: '09/05/2025'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveReport = () => {
    console.log('Saving report for future use...');
    // Implementation for saving report
  };

  const handleRunReport = (format) => {
    console.log(`Running report as ${format}...`);
    // Implementation for running report in different formats
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Customers</h2>
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

          {/* Template Selection */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Template Selection</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Template:</label>
              <select 
                value={formData.reportTemplate}
                onChange={(e) => handleInputChange('reportTemplate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option>Current Default - Levitate Contact List</option>
                <option>Standard Customer Report</option>
                <option>Detailed Customer Analysis</option>
              </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Of Record:</label>
                <select 
                  value={formData.agentOfRecord}
                  onChange={(e) => handleInputChange('agentOfRecord', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>- All Agent Of Record -</option>
                  <option>John Smith</option>
                  <option>Jane Doe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer CSR:</label>
                <select 
                  value={formData.customerCSR}
                  onChange={(e) => handleInputChange('customerCSR', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>- All Employee -</option>
                  <option>Employee 1</option>
                  <option>Employee 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy CSR:</label>
                <select 
                  value={formData.policyCSR}
                  onChange={(e) => handleInputChange('policyCSR', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>- All Employee -</option>
                  <option>Employee 1</option>
                  <option>Employee 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Sources:</label>
                <select 
                  value={formData.referralSources}
                  onChange={(e) => handleInputChange('referralSources', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>- Select Source -</option>
                  <option>Website</option>
                  <option>Referral</option>
                  <option>Advertisement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Carrier:</label>
                <select 
                  value={formData.policyCarrier}
                  onChange={(e) => handleInputChange('policyCarrier', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>- All Companies -</option>
                  <option>State Farm</option>
                  <option>Allstate</option>
                  <option>Progressive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type:</label>
                <select 
                  value={formData.policyType}
                  onChange={(e) => handleInputChange('policyType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>- All Policy Types -</option>
                  <option>Auto</option>
                  <option>Home</option>
                  <option>Life</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Tag:</label>
                <select 
                  value={formData.customerTag}
                  onChange={(e) => handleInputChange('customerTag', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>- Select A Tag -</option>
                  <option>VIP</option>
                  <option>New Customer</option>
                  <option>Renewal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type:</label>
                <select 
                  value={formData.customerType}
                  onChange={(e) => handleInputChange('customerType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>Customers and Prospects</option>
                  <option>Customers Only</option>
                  <option>Prospects Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Status:</label>
                <select 
                  value={formData.customerStatus}
                  onChange={(e) => handleInputChange('customerStatus', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>Any</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order By:</label>
                <select 
                  value={formData.orderBy}
                  onChange={(e) => handleInputChange('orderBy', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>Office</option>
                  <option>Name</option>
                  <option>Date</option>
                </select>
              </div>
            </div>
          </div>

          {/* Other Selection */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Other Selection</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Filter:</label>
                <select 
                  value={formData.emailFilter}
                  onChange={(e) => handleInputChange('emailFilter', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>No Preference</option>
                  <option>Has Email</option>
                  <option>No Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cell Filter:</label>
                <select 
                  value={formData.cellFilter}
                  onChange={(e) => handleInputChange('cellFilter', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>No Preference</option>
                  <option>Has Cell</option>
                  <option>No Cell</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">With Active Policies:</label>
                <button
                  onClick={() => handleToggle('withActivePolicies')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.withActivePolicies ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.withActivePolicies ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">
                  {formData.withActivePolicies ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">With Web Access:</label>
                <button
                  onClick={() => handleToggle('withWebAccess')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.withWebAccess ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.withWebAccess ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">
                  {formData.withWebAccess ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">With Verified Information:</label>
                <button
                  onClick={() => handleToggle('withVerifiedInformation')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.withVerifiedInformation ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.withVerifiedInformation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">
                  {formData.withVerifiedInformation ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Date Selection</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Use Date Range:</label>
                <button
                  onClick={() => handleToggle('useDateRange')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.useDateRange ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.useDateRange ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">
                  {formData.useDateRange ? 'Yes' : 'No'}
                </span>
                <span className="text-sm text-gray-500">
                  (You must select YES to include the optional Date Range menu item.)
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dates Used:</label>
                <select 
                  value={formData.datesUsed}
                  onChange={(e) => handleInputChange('datesUsed', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option>Use Conversion Date & Add Date</option>
                  <option>Use Add Date Only</option>
                  <option>Use Conversion Date Only</option>
                </select>
              </div>
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
                  <span className="font-semibold text-purple-600">Customers Report:</span>
                  <span className="text-gray-700 ml-2">
                    This report will return customers and prospects. Choosing any customer selection will return 
                    only those customers with policies. Choosing prospects will return everyone flagged as a prospect. When ordering by 
                    Email, only records with emails will be returned.
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
                onClick={() => handleRunReport('download')}
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRunReport('print')}
                className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReportModal;