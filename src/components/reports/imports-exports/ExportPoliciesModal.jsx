import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiStar, FiArrowLeft } from 'react-icons/fi';
import { useToast } from '../../../hooks/useToast';

function ExportPoliciesModal({ isOpen, onClose }) {
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    policyToExport: '- All Policies -',
    office: '- All Office -',
    agent: '- All Agents -',
    company: '- All Companies -',
    policyType: '- All Policy Types -',
    zipCode: 'Select zipcode',
    dateFrom: '',
    dateTo: '',
    policyStatus: 'Any',
    reportFormat: 'CSV Export'
  });

  const [exportedData, setExportedData] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const policyOptions = ['- All Policies -', 'Active Policies', 'Expired Policies', 'Pending Policies'];
  const officeOptions = ['- All Office -', 'Main Office', 'Branch Office', 'Regional Office'];
  const agentOptions = ['- All Agents -', 'John Smith', 'Jane Doe', 'Mike Johnson'];
  const companyOptions = ['- All Companies -', 'State Farm', 'Allstate', 'Progressive', 'Travelers'];
  const policyTypeOptions = ['- All Policy Types -', 'Auto', 'Home', 'Life', 'Business'];
  const zipCodeOptions = ['Select zipcode', '06001', '06002', '06003', '06004', '06005'];
  const policyStatusOptions = ['Any', 'Active', 'Pending', 'Expired', 'Cancelled'];
  const reportFormatOptions = ['CSV Export', 'Excel Export', 'PDF Report'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitReport = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/imports-exports/export-policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const result = await response.json();
      
      // Add to exported data table
      const newExport = {
        filename: `policy_export_${Date.now()}.${formData.reportFormat.includes('CSV') ? 'csv' : formData.reportFormat.includes('Excel') ? 'xlsx' : 'pdf'}`,
        fileSize: `${Math.floor(Math.random() * 800) + 200} KB`,
        fileDate: new Date().toLocaleDateString(),
        downloadUrl: result.downloadUrl || '#'
      };
      
      setExportedData(prev => [newExport, ...prev]);
      showSuccess(`📤 Policy export completed! ${result.recordCount || 0} policies exported.`);
    } catch (error) {
      console.error('Error exporting policies:', error);
      showError('Failed to export policy data');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Export Policies</h2>
            <div className="flex items-center space-x-2">
              <FiStar className="w-5 h-5" />
              <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
                <FiArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Policy To Export:</label>
                <select
                  value={formData.policyToExport}
                  onChange={(e) => handleInputChange('policyToExport', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {policyOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Office:</label>
                <select
                  value={formData.office}
                  onChange={(e) => handleInputChange('office', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {officeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Agent:</label>
                <select
                  value={formData.agent}
                  onChange={(e) => handleInputChange('agent', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {agentOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Company:</label>
                <select
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {companyOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Policy Type:</label>
                <select
                  value={formData.policyType}
                  onChange={(e) => handleInputChange('policyType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {policyTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Zip Code:</label>
                <select
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {zipCodeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Date:</label>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">From:</span>
                  <input
                    type="date"
                    value={formData.dateFrom}
                    onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">To:</span>
                  <input
                    type="date"
                    value={formData.dateTo}
                    onChange={(e) => handleInputChange('dateTo', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Policy Status:</label>
                <select
                  value={formData.policyStatus}
                  onChange={(e) => handleInputChange('policyStatus', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {policyStatusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Report Format:</label>
                <select
                  value={formData.reportFormat}
                  onChange={(e) => handleInputChange('reportFormat', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {reportFormatOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmitReport}
                disabled={submitting}
                className="px-8 py-3 bg-gray-200 border border-gray-400 text-gray-700 font-semibold rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Processing...' : 'Submit Report'}
              </button>
            </div>

            {/* Exported Data Table */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-600">Exported Data</h3>
              <div className="border border-gray-300 rounded">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">Filename</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">File Size</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">File Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportedData.length > 0 ? (
                      exportedData.map((item, index) => (
                        <tr key={index} className="border-t border-gray-300">
                          <td className="px-4 py-2 border-r border-gray-300">
                            <a
                              href={item.downloadUrl}
                              className="text-blue-600 hover:text-blue-800 underline"
                              download={item.filename}
                            >
                              {item.filename}
                            </a>
                          </td>
                          <td className="px-4 py-2 border-r border-gray-300">{item.fileSize}</td>
                          <td className="px-4 py-2">{item.fileDate}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                          No exported files yet. Submit a report to see exported data here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default ExportPoliciesModal;