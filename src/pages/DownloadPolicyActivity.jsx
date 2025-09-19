import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiDownload, FiSettings, FiSave, FiClock, FiHelpCircle, FiX } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useToast } from "../hooks/useToast";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import PolicyActivityPDF from "../components/reports/PolicyActivityPDF";
import EditableSelect from "../components/common/EditableSelect";
import ToggleSwitch from "../components/common/ToggleSwitch";

function DownloadPolicyActivity() {
  const navigate = useNavigate();
  const { showSuccess, showInfo } = useToast();

  const [formData, setFormData] = useState({
    territory: "East Coast",
    division: "Northeast",
    region: "Connecticut",
    district: "Fairfield",
    office: "Main Office",
    type: "",
    subType: "",
    startDate: new Date(2025, 7, 1),
    endDate: new Date(2025, 7, 1),
    dateRange: "Date Range",
    includeOptions: {
      newBusiness: false,
      premiumAudit: false,
      policyChange: false,
      reinstatement: false,
      rewrite: false,
      reIssue: false,
      renewalOfNonRenewal: false,
      renewal: false,
      renewalQuote: false,
      nonRenewal: false,
      dataSync: false,
      cancellation: true,
      unexpectedCodeFromDownloads: false,
      rollover: false
    }
  });

  const [savedReports, setSavedReports] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [reportName, setReportName] = useState('');
  const [scheduleType, setScheduleType] = useState('none');

  const [isPDFOpen, setIsPDFOpen] = useState(false);
  const [reportType, setReportType] = useState('HTML link');
  const [nextRunDate, setNextRunDate] = useState(new Date());
  const [nextRunHour, setNextRunHour] = useState('12:00 AM');
  const [reportEmail, setReportEmail] = useState('');

  const hoursOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
    const ampm = i < 12 ? 'AM' : 'PM';
    return `${hour}:00 ${ampm}`;
  });

  const territoryOptions = ['East Coast', 'West Coast', 'Midwest', 'South', 'Central'];
  const divisionOptions = ['Northeast', 'Southeast', 'Northwest', 'Southwest', 'Central'];
  const regionOptions = ['Connecticut', 'New York', 'New Jersey', 'Massachusetts', 'Rhode Island'];
  const districtOptions = ['Fairfield', 'Hartford', 'New Haven', 'Litchfield', 'Windham'];
  const officeOptions = ['Main Office', 'Branch Office', 'Remote Office', 'Satellite Office'];
  const typeOptions = ['-Select a Type-', 'Personal Lines', 'Commercial', 'Life & Health', 'Specialty'];
  const subTypeOptions = ['-Select a Type-', 'Personal Lines', 'Commercial', 'Auto', 'Home', 'Umbrella', 'Motorcycle', 'Boat'];

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

  const handleRunReport = () => {
    setIsPDFOpen(true); // Open PDF modal
  };

  const handleSaveReport = () => {
    if (!reportName.trim()) {
      showInfo('Please enter a report name');
      return;
    }

    const newReport = {
      id: Date.now(),
      name: reportName,
      filters: formData,
      scheduleType,
      createdAt: new Date().toISOString(),
      lastRun: null
    };

    setSavedReports(prev => [...prev, newReport]);
    setShowSaveModal(false);
    setReportName('');
    setScheduleType('none');
    showSuccess('Report saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/downloads')}
            className="text-white hover:text-gray-200 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Download Policy Activity - John J Cusmano Jr.</h1>
        </div>
      </div>

      {/* Filters & Run Report */}
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: Structure & Type */}
          <div className="space-y-6">
            {/* Structure Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-blue-600 mb-4 border-b border-gray-200 pb-2">Structure Selection</h3>
              <div className="space-y-4">
                <EditableSelect value={formData.territory} onChange={v => handleInputChange('territory', v)} options={territoryOptions} placeholder="Territory" />
                <EditableSelect value={formData.division} onChange={v => handleInputChange('division', v)} options={divisionOptions} placeholder="Division" />
                <EditableSelect value={formData.region} onChange={v => handleInputChange('region', v)} options={regionOptions} placeholder="Region" />
                <EditableSelect value={formData.district} onChange={v => handleInputChange('district', v)} options={districtOptions} placeholder="District" />
                <EditableSelect value={formData.office} onChange={v => handleInputChange('office', v)} options={officeOptions} placeholder="Office" />
              </div>
            </div>

            {/* Customer Type */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-blue-600 mb-4 border-b border-gray-200 pb-2">Customer Type Selection</h3>
              <EditableSelect value={formData.type} onChange={v => handleInputChange('type', v)} options={typeOptions} placeholder="Type" />
              <EditableSelect value={formData.subType} onChange={v => handleInputChange('subType', v)} options={subTypeOptions} placeholder="SubType" />
            </div>
          </div>

          {/* Right column: Dates & Includes */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-blue-600 mb-4 border-b border-gray-200 pb-2">Report Selection</h3>
              <DatePicker selected={formData.startDate} onChange={d => handleInputChange('startDate', d)} className="w-full rounded-md border p-2 mb-2" />
              <DatePicker selected={formData.endDate} onChange={d => handleInputChange('endDate', d)} className="w-full rounded-md border p-2" />
            </div>

            {/* Include Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-blue-600 mb-4 border-b border-gray-200 pb-2">Include Selection</h3>
              {Object.keys(formData.includeOptions).map(option => (
                <ToggleSwitch key={option} label={option} checked={formData.includeOptions[option]} onChange={() => handleIncludeToggle(option)} />
              ))}
            </div>
          </div>
        </div>

        {/* Run Report */}
        <div className="flex justify-center">
          <button onClick={handleRunReport} className="bg-green-600 text-white font-bold py-4 px-12 rounded-xl shadow-lg hover:bg-green-700">
            <FiDownload className="inline-block mr-2" />
            RUN REPORT
          </button>
        </div>

        {/* Save Report */}
        <div className="flex justify-center">
          <button onClick={() => setShowSaveModal(true)} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 flex items-center space-x-2">
            <FiSave /> <span>Save Report</span>
          </button>
        </div>
      </div>

     {/* Save Report Modal */}
{showSaveModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
      <button
        onClick={() => setShowSaveModal(false)}
        className="absolute top-4 right-4 text-gray-700 hover:text-red-600 text-2xl"
      >
        <FiX />
      </button>
      <h3 className="text-lg font-semibold mb-4">Save Report</h3>
      <div className="space-y-3">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Report Name</label>
          <input
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Frequency</label>
          <select
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value)}
            className="w-full border rounded-md p-2"
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekends">Weekends</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full border rounded-md p-2"
          >
            <option>HTML link</option>
            <option>HTML - body</option>
            <option>CSV</option>
            <option>CSV-API</option>
            <option>PDF</option>
            <option>FTP-CSV</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Next Run Date</label>
          <DatePicker
            selected={nextRunDate}
            onChange={(d) => setNextRunDate(d)}
            className="w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Next Run Hour</label>
          <select
            value={nextRunHour}
            onChange={(e) => setNextRunHour(e.target.value)}
            className="w-full border rounded-md p-2"
          >
            {hoursOptions.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Report Email</label>
          <input
            type="email"
            value={reportEmail}
            onChange={(e) => setReportEmail(e.target.value)}
            className="w-full border rounded-md p-2"
            placeholder="Enter email"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6 space-x-3">
        <button
          onClick={() => setShowSaveModal(false)}
          className="px-4 py-2 border rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveReport}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}


      {/* PDF Modal */}
      {isPDFOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-full overflow-auto p-4 relative">
            <button onClick={() => setIsPDFOpen(false)} className="absolute top-4 right-4 text-red-600 text-2xl">&times;</button>
            <PDFViewer style={{ width: "100%", height: "80vh" }}>
              <PolicyActivityPDF filters={formData} />
            </PDFViewer>
            <div className="flex justify-end mt-4 space-x-3">
              <PDFDownloadLink document={<PolicyActivityPDF filters={formData} />} fileName={`PolicyActivity_${new Date().toISOString()}.pdf`} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                {({ loading }) => (loading ? "Preparing..." : "Download PDF")}
              </PDFDownloadLink>
              <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DownloadPolicyActivity;
