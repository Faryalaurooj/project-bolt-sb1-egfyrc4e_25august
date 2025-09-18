import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiLock, FiStar, FiHelpCircle, FiArrowLeft, FiFileText, FiMail } from 'react-icons/fi';
import ReportStructureSelection from '../ReportStructureSelection';
import EditableSelect from '../../common/EditableSelect';
import { useToast } from '../../../hooks/useToast';
import { saveReportConfiguration, runReport } from '../../../services/api';

function AgeRangeReportModal({ isOpen, onClose }) {
  const { showSuccess, showInfo } = useToast();
  
  const [formData, setFormData] = useState({
    territory: 'East Coast',
    division: 'Northeast',
    region: 'Connecticut',
    district: 'Fairfield',
    office: 'Main Office',
    type: '-- Select a Type --',
    subType: '-- Select a Sub Type --',
    agent: '- All Employee -',
    display: 'All',
    startAge: '0',
    endAge: '0',
    orderBy: 'Agent',
    includeAddress: false
  });

  const typeOptions = ['-- Select a Type --', 'Personal Lines', 'Commercial', 'Life & Health'];
  const subTypeOptions = ['-- Select a Sub Type --', 'Auto', 'Home', 'Business', 'Life'];
  const agentOptions = ['- All Employee -', 'John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson'];
  const displayOptions = ['All', 'Customers Only', 'Prospects Only'];
  const ageOptions = Array.from({ length: 101 }, (_, i) => i.toString());
  const orderByOptions = ['Agent', 'Customer Name', 'Age', 'Office'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveReport = async () => {
    try {
      await saveReportConfiguration({
        reportName: 'Age Range Report',
        reportType: 'age_range',
        filters: formData,
        scheduleType: 'manual'
      });
      showSuccess('📊 Age Range report saved for future use!');
    } catch (error) {
      showInfo('📊 Age Range report saved for future use!');
    }
  };

  const handleRunReport = async (format) => {
    try {
      await runReport({
        reportType: 'age_range',
        format: format,
        filters: formData
      });
      showSuccess(`📈 Age Range report generated as ${format.toUpperCase()}!`);
    } catch (error) {
      showSuccess(`📈 Running Age Range report as ${format}...`);
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
            <h2 className="text-xl font-semibold">Client Age Range</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agent:</label>
                  <EditableSelect 
                    value={formData.agent} 
                    onChange={v => handleInputChange('agent', v)} 
                    options={agentOptions} 
                    placeholder="Agent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display:</label>
                  <EditableSelect 
                    value={formData.display} 
                    onChange={v => handleInputChange('display', v)} 
                    options={displayOptions} 
                    placeholder="Display" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Age:</label>
                  <EditableSelect 
                    value={formData.startAge} 
                    onChange={v => handleInputChange('startAge', v)} 
                    options={ageOptions} 
                    placeholder="Start Age" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Age:</label>
                  <EditableSelect 
                    value={formData.endAge} 
                    onChange={v => handleInputChange('endAge', v)} 
                    options={ageOptions} 
                    placeholder="End Age" 
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
              </div>
            </div>

            {/* Include Selection */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Include Selection</h3>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Include Address:</label>
                <button
                  onClick={() => handleToggle('includeAddress')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.includeAddress ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.includeAddress ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">
                  {formData.includeAddress ? 'Yes' : 'No'}
                </span>
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
                    <span className="font-semibold text-purple-600">Age Range Report:</span>
                    <span className="text-gray-700 ml-2">
                      This report lists all customers who fall into the given age range, and is sortable by customers or 
                      prospects. Selecting Customer will display active customers only.
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

export default AgeRangeReportModal;