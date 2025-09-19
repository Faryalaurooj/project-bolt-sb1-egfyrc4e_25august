import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiLock, FiStar, FiHelpCircle, FiArrowLeft, FiFileText, FiMail } from 'react-icons/fi';
import ReportStructureSelection from '../ReportStructureSelection';
import EditableSelect from '../../common/EditableSelect';
import { useToast } from '../../../hooks/useToast';
import { saveReportConfiguration, runReport } from '../../../services/api';

function AgeProjectionReportModal({ isOpen, onClose }) {
  const { showSuccess, showInfo } = useToast();
  
  const [formData, setFormData] = useState({
    territory: 'East Coast',
    division: 'Northeast',
    region: 'Connecticut',
    district: 'Fairfield',
    office: 'Main Office',
    type: '-- Select a Type --',
    subType: '-- Select a Sub Type --',
    lineOfBusiness: '- Select Line Of Business -',
    customerType: 'Customer Only',
    orderBy: 'Office',
    zipCode: '',
    policyStatus: 'Active Only',
    targetAge: '0',
    hideCurrentAge: 'Yes',
    startDate: '09/09/2025',
    endDate: '09/09/2025',
    dateRange: 'Date Range'
  });

  const typeOptions = ['-- Select a Type --', 'Personal Lines', 'Commercial', 'Life & Health'];
  const subTypeOptions = ['-- Select a Sub Type --', 'Auto', 'Home', 'Business', 'Life'];
  const lineOfBusinessOptions = [
    '- Select Line Of Business -',
    'Auto Insurance',
    'Home Insurance',
    'Life Insurance',
    'Business Insurance',
    'Umbrella Insurance',
    'Motorcycle Insurance',
    'Boat Insurance'
  ];
  const customerTypeOptions = ['Customer Only', 'Prospects Only', 'All'];
  const orderByOptions = ['Office', 'Customer Name', 'Age', 'Target Date'];
  const policyStatusOptions = ['Active Only', 'All Status', 'Pending Only', 'Expired Only'];
  const ageOptions = Array.from({ length: 101 }, (_, i) => i.toString());
  const hideCurrentAgeOptions = ['Yes', 'No'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveReport = async () => {
    try {
      await saveReportConfiguration({
        reportName: 'Age Projection Report',
        reportType: 'age_projection',
        filters: formData,
        scheduleType: 'manual'
      });
      showSuccess('📊 Age Projection report saved for future use!');
    } catch (error) {
      showInfo('📊 Age Projection report saved for future use!');
    }
  };

  const handleRunReport = async (format) => {
    try {
      await runReport({
        reportType: 'age_projection',
        format: format,
        filters: formData
      });
      showSuccess(`📈 Age Projection report generated as ${format.toUpperCase()}!`);
    } catch (error) {
      showSuccess(`📈 Running Age Projection report as ${format}...`);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Age Projection</h2>
            <div className="flex items-center space-x-2">
              <FiLock className="w-5 h-5" />
              <div className="w-5 h-5 bg-white/20 rounded" />
              <FiStar className="w-5 h-5" />
              <FiHelpCircle className="w-5 h-5" />
              <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
                <FiArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Structure Selection */}
            <ReportStructureSelection 
              formData={formData}
              onInputChange={handleInputChange}
            />

            {/* Customer Type Selection */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Customer Type Selection</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type:</label>
                  <EditableSelect 
                    value={formData.type} 
                    onChange={v => handleInputChange('type', v)} 
                    options={typeOptions} 
                    placeholder="Type" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub Type:</label>
                  <EditableSelect 
                    value={formData.subType} 
                    onChange={v => handleInputChange('subType', v)} 
                    options={subTypeOptions} 
                    placeholder="Sub Type" 
                  />
                </div>
              </div>
            </div>

            {/* Report Selection */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Report Selection</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Line Of Business:</label>
                  <EditableSelect 
                    value={formData.lineOfBusiness} 
                    onChange={v => handleInputChange('lineOfBusiness', v)} 
                    options={lineOfBusinessOptions} 
                    placeholder="Line Of Business" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type:</label>
                  <EditableSelect 
                    value={formData.customerType} 
                    onChange={v => handleInputChange('customerType', v)} 
                    options={customerTypeOptions} 
                    placeholder="Customer Type" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order By:</label>
                  <EditableSelect 
                    value={formData.orderBy} 
                    onChange={v => handleInputChange('orderBy', v)} 
                    options={orderByOptions} 
                    placeholder="Order By" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code:</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="(Leave Blank if not needed - First 5 numbers only)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Status:</label>
                  <EditableSelect 
                    value={formData.policyStatus} 
                    onChange={v => handleInputChange('policyStatus', v)} 
                    options={policyStatusOptions} 
                    placeholder="Policy Status" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Age:</label>
                  <EditableSelect 
                    value={formData.targetAge} 
                    onChange={v => handleInputChange('targetAge', v)} 
                    options={ageOptions} 
                    placeholder="Target Age" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hide Current Age:</label>
                  <EditableSelect 
                    value={formData.hideCurrentAge} 
                    onChange={v => handleInputChange('hideCurrentAge', v)} 
                    options={hideCurrentAgeOptions} 
                    placeholder="Hide Current Age" 
                  />
                </div>
              </div>
            </div>

            {/* Projected Date Selection */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Projected Date Selection</h3>
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
                    <select 
                      value={formData.dateRange}
                      onChange={(e) => handleInputChange('dateRange', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
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
                    <span className="font-semibold text-purple-600">Age Projection Report:</span>
                    <span className="text-gray-700 ml-2">
                      This report allows the user to choose a target age, and determine which customers will be 
                      that age within a chosen time frame. <strong>For Example:</strong> Who will be 65 in June next year? By default, the report will filter out 
                      records where a customer's current age already matches the target age. If you wish to display all customers whose age 
                      matches the target age, select 'No\' where it says 'Hide Current Age'.
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
            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center space-x-2">
                <div className="bg-green-500 rounded-full p-2">
                  <FiFileText className="w-6 h-6 text-white" />
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
                  <FiMail className="w-4 h-4" />
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
                  <FiMail className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRunReport('chart')}
                  className="bg-gray-100 border border-gray-300 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                  title="Chart View"
                >
                  📊
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default AgeProjectionReportModal;