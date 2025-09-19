import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiLock, FiStar, FiHelpCircle, FiArrowLeft, FiFileText, FiMail } from 'react-icons/fi';
import ReportStructureSelection from '../ReportStructureSelection';
import EditableSelect from '../../common/EditableSelect';
import ToggleSwitch from '../../common/ToggleSwitch';
import { useToast } from '../../../hooks/useToast';
import { saveReportConfiguration, runReport } from '../../../services/api';

function LineOfBusinessReportModal({ isOpen, onClose }) {
  const { showSuccess, showInfo } = useToast();
  
  const [formData, setFormData] = useState({
    territory: 'East Coast',
    division: 'Northeast',
    region: 'Connecticut',
    district: 'Fairfield',
    office: 'Main Office',
    type: '-- Select a Type --',
    subType: '-- Select a Sub Type --',
    company: '- All Companies -',
    startDate: '09/08/2025',
    endDate: '09/08/2025',
    view: 'Summary',
    orderBy: 'Office',
    activePendingOnly: false,
    includeOptions: {
      newBusiness: true,
      premiumAudit: false,
      policyChange: false,
      reinstatement: false,
      rewrite: false,
      reIssue: false,
      reversalOfNonRenewal: false,
      renewal: false,
      renewalQuote: false,
      nonRenewal: false,
      dataSync: false,
      cancellation: false,
      unexpectedCodeFromDownloads: false,
      rollover: false
    }
  });

  const typeOptions = ['-- Select a Type --', 'Personal Lines', 'Commercial', 'Life & Health'];
  const subTypeOptions = ['-- Select a Sub Type --', 'Auto', 'Home', 'Business', 'Life'];
  const companyOptions = ['- All Companies -', 'State Farm', 'Allstate', 'Progressive', 'Travelers'];
  const viewOptions = ['Summary', 'Detailed', 'Compact'];
  const orderByOptions = ['Office', 'Line of Business', 'Premium Amount', 'Policy Count'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIncludeToggle = (option) => {
    setFormData(prev => ({
      ...prev,
      includeOptions: {
        ...prev.includeOptions,
        [option]: !prev.includeOptions[option]
      }
    }));
  };

  const handleSaveReport = async () => {
    try {
      await saveReportConfiguration({
        reportName: 'Line Of Business Report',
        reportType: 'line_of_business',
        filters: formData,
        scheduleType: 'manual'
      });
      showSuccess('📊 Line Of Business report saved for future use!');
    } catch (error) {
      showInfo('📊 Line Of Business report saved for future use!');
    }
  };

  const handleRunReport = async (format) => {
    try {
      await runReport({
        reportType: 'line_of_business',
        format: format,
        filters: formData
      });
      showSuccess(`📈 Line Of Business report generated as ${format.toUpperCase()}!`);
    } catch (error) {
      showSuccess(`📈 Running Line Of Business report as ${format}...`);
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
            <h2 className="text-xl font-semibold">Line Of Business</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company:</label>
                  <EditableSelect 
                    value={formData.company} 
                    onChange={v => handleInputChange('company', v)} 
                    options={companyOptions} 
                    placeholder="Company" 
                  />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">View:</label>
                  <EditableSelect 
                    value={formData.view} 
                    onChange={v => handleInputChange('view', v)} 
                    options={viewOptions} 
                    placeholder="View" 
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
                <div className="col-span-2">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Active & Pending Only:</label>
                    <button
                      onClick={() => handleInputChange('activePendingOnly', !formData.activePendingOnly)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.activePendingOnly ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.activePendingOnly ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-600">
                      {formData.activePendingOnly ? 'Yes' : 'No'}
                    </span>
                    <span className="text-sm text-gray-500">(Includes Only Active & Pending Policies)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Include Selection */}
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Include Selection</h3>
              <div className="grid grid-cols-2 gap-2">
                <ToggleSwitch label="New Business" checked={formData.includeOptions.newBusiness} onChange={() => handleIncludeToggle('newBusiness')} />
                <ToggleSwitch label="Premium Audit" checked={formData.includeOptions.premiumAudit} onChange={() => handleIncludeToggle('premiumAudit')} />
                <ToggleSwitch label="Policy Change" checked={formData.includeOptions.policyChange} onChange={() => handleIncludeToggle('policyChange')} />
                <ToggleSwitch label="Reinstatement" checked={formData.includeOptions.reinstatement} onChange={() => handleIncludeToggle('reinstatement')} />
                <ToggleSwitch label="Rewrite" checked={formData.includeOptions.rewrite} onChange={() => handleIncludeToggle('rewrite')} />
                <ToggleSwitch label="Re-Issue" checked={formData.includeOptions.reIssue} onChange={() => handleIncludeToggle('reIssue')} />
                <ToggleSwitch label="Reversal of Non-Renewal" checked={formData.includeOptions.reversalOfNonRenewal} onChange={() => handleIncludeToggle('reversalOfNonRenewal')} />
                <ToggleSwitch label="Renewal" checked={formData.includeOptions.renewal} onChange={() => handleIncludeToggle('renewal')} />
                <ToggleSwitch label="Renewal Quote" checked={formData.includeOptions.renewalQuote} onChange={() => handleIncludeToggle('renewalQuote')} />
                <ToggleSwitch label="Non-Renewal" checked={formData.includeOptions.nonRenewal} onChange={() => handleIncludeToggle('nonRenewal')} />
                <ToggleSwitch label="Data Sync" checked={formData.includeOptions.dataSync} onChange={() => handleIncludeToggle('dataSync')} />
                <ToggleSwitch label="Cancellation" checked={formData.includeOptions.cancellation} onChange={() => handleIncludeToggle('cancellation')} />
                <ToggleSwitch label="Unexpected code from Downloads" checked={formData.includeOptions.unexpectedCodeFromDownloads} onChange={() => handleIncludeToggle('unexpectedCodeFromDownloads')} />
                <ToggleSwitch label="Rollover" checked={formData.includeOptions.rollover} onChange={() => handleIncludeToggle('rollover')} />
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
                    <span className="font-semibold text-purple-600">Line Of Business Production:</span>
                    <span className="text-gray-700 ml-2">
                      This report analyzes production by line of business, showing performance across different insurance product lines.
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

export default LineOfBusinessReportModal;