import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiSettings, FiDownload, FiSearch, FiBarChart2, FiUsers, FiFileText, FiGlobe, FiMessageSquare, FiTrendingUp, FiMoreHorizontal } from 'react-icons/fi';
import { useToast } from '../../hooks/useToast';
import CustomerReportModal from './CustomerReportModal';
import CustomerNewReportModal from './CustomerNewReportModal';
import DownloadTransactionsModal from './DownloadTransactionsModal';
import DownloadAttachmentsModal from './DownloadAttachmentsModal';
import DownloadNotesModal from './DownloadNotesModal';
import OwnerOverviewReportModal from './OwnerOverviewReportModal';
import ActivityRollupReportModal from './ActivityRollupReportModal';
import MobileReportsMenuModal from './MobileReportsMenuModal';
import MixedPoliciesReportModal from './investigative/MixedPoliciesReportModal';
import PoliciesWithPaymentsReportModal from './investigative/PoliciesWithPaymentsReportModal';
import PoliciesWithoutPaymentsReportModal from './investigative/PoliciesWithoutPaymentsReportModal';
import PoliciesWithoutAttachmentsReportModal from './investigative/PoliciesWithoutAttachmentsReportModal';
import ExpiredPoliciesWithPaymentsReportModal from './investigative/ExpiredPoliciesWithPaymentsReportModal';
import PoliciesInEffectReportModal from './investigative/PoliciesInEffectReportModal';
import ExpiredPoliciesReportModal from './investigative/ExpiredPoliciesReportModal';
import PendingPoliciesReportModal from './investigative/PendingPoliciesReportModal';
import ReceiptListReportModal from './investigative/ReceiptListReportModal';
import PremiumByCompanyReportModal from './investigative/PremiumByCompanyReportModal';
import PoliciesByCompanyReportModal from './investigative/PoliciesByCompanyReportModal';
import CustomerWithoutPoliciesReportModal from './investigative/CustomerWithoutPoliciesReportModal';
import CustomerViewsReportModal from './investigative/CustomerViewsReportModal';
import CrossSellingReportModal from './marketing/CrossSellingReportModal';
import DoNotContactReportModal from './marketing/DoNotContactReportModal';
import BlastHistoryReportModal from './marketing/BlastHistoryReportModal';
import DripMarketingCampaignReportModal from './marketing/DripMarketingCampaignReportModal';
import CompanyEmailHistoryReportModal from './marketing/CompanyEmailHistoryReportModal';
import AddOnsReportModal from './production/AddOnsReportModal';
import CompanyReportModal from './production/CompanyReportModal';
import NewBusinessReportModal from './production/NewBusinessReportModal';
import LineOfBusinessReportModal from './production/LineOfBusinessReportModal';
import BookOfBusinessReportModal from './production/BookOfBusinessReportModal';
import BookOfBusinessSummaryReportModal from './production/BookOfBusinessSummaryReportModal';
import UploadCustomerCensusModal from './imports-exports/UploadCustomerCensusModal';
import ExportCustomerModal from './imports-exports/ExportCustomerModal';
import ExportPoliciesModal from './imports-exports/ExportPoliciesModal';
import PivotTableReportModal from './other/PivotTableReportModal';
import EventTrackingReportModal from './other/EventTrackingReportModal';
import AgeRangeReportModal from './other/AgeRangeReportModal';
import AgeProjectionReportModal from './other/AgeProjectionReportModal';
import AORMatchingReportModal from './other/AORMatchingReportModal';
import BusinessStructureReportModal from './other/BusinessStructureReportModal';
import BrokerListReportModal from './other/BrokerListReportModal';
import CSRReportModal from './other/CSRReportModal';
import DueDatesReportModal from './other/DueDatesReportModal';
import FollowUpNotesReportModal from './other/FollowUpNotesReportModal';
import HiddenInactiveReportModal from './other/HiddenInactiveReportModal';
import NotesSystemAddedReportModal from './other/NotesSystemAddedReportModal';
import NotesUserAddedReportModal from './other/NotesUserAddedReportModal';

function ReportsMenu() {
  const navigate = useNavigate();
  const { showInfo } = useToast();
  
  // Modal state management
  const [isCustomerReportModalOpen, setIsCustomerReportModalOpen] = React.useState(false);
  const [isCustomerNewReportModalOpen, setIsCustomerNewReportModalOpen] = React.useState(false);
  const [isDownloadTransactionsModalOpen, setIsDownloadTransactionsModalOpen] = React.useState(false);
  const [isDownloadAttachmentsModalOpen, setIsDownloadAttachmentsModalOpen] = React.useState(false);
  const [isDownloadNotesModalOpen, setIsDownloadNotesModalOpen] = React.useState(false);
  const [isOwnerOverviewModalOpen, setIsOwnerOverviewModalOpen] = React.useState(false);
  const [isActivityRollupModalOpen, setIsActivityRollupModalOpen] = React.useState(false);
  const [isMobileReportsMenuModalOpen, setIsMobileReportsMenuModalOpen] = React.useState(false);
  
  // Investigative report modals
  const [isMixedPoliciesModalOpen, setIsMixedPoliciesModalOpen] = React.useState(false);
  const [isPoliciesWithPaymentsModalOpen, setIsPoliciesWithPaymentsModalOpen] = React.useState(false);
  const [isPoliciesWithoutPaymentsModalOpen, setIsPoliciesWithoutPaymentsModalOpen] = React.useState(false);
  const [isPoliciesWithoutAttachmentsModalOpen, setIsPoliciesWithoutAttachmentsModalOpen] = React.useState(false);
  const [isExpiredPoliciesWithPaymentsModalOpen, setIsExpiredPoliciesWithPaymentsModalOpen] = React.useState(false);
  const [isPoliciesInEffectModalOpen, setIsPoliciesInEffectModalOpen] = React.useState(false);
  const [isExpiredPoliciesModalOpen, setIsExpiredPoliciesModalOpen] = React.useState(false);
  const [isPendingPoliciesModalOpen, setIsPendingPoliciesModalOpen] = React.useState(false);
  const [isReceiptListModalOpen, setIsReceiptListModalOpen] = React.useState(false);
  const [isPremiumByCompanyModalOpen, setIsPremiumByCompanyModalOpen] = React.useState(false);
  const [isPoliciesByCompanyModalOpen, setIsPoliciesByCompanyModalOpen] = React.useState(false);
  const [isCustomerWithoutPoliciesModalOpen, setIsCustomerWithoutPoliciesModalOpen] = React.useState(false);
  const [isCustomerViewsModalOpen, setIsCustomerViewsModalOpen] = React.useState(false);
  
  // Marketing report modals
  const [isCrossSellingModalOpen, setIsCrossSellingModalOpen] = React.useState(false);
  const [isDoNotContactModalOpen, setIsDoNotContactModalOpen] = React.useState(false);
  const [isBlastHistoryModalOpen, setIsBlastHistoryModalOpen] = React.useState(false);
  const [isDripMarketingCampaignModalOpen, setIsDripMarketingCampaignModalOpen] = React.useState(false);
  const [isCompanyEmailHistoryModalOpen, setIsCompanyEmailHistoryModalOpen] = React.useState(false);
  
  // Production report modals
  const [isAddOnsReportModalOpen, setIsAddOnsReportModalOpen] = React.useState(false);
  const [isCompanyReportModalOpen, setIsCompanyReportModalOpen] = React.useState(false);
  const [isNewBusinessReportModalOpen, setIsNewBusinessReportModalOpen] = React.useState(false);
  const [isLineOfBusinessReportModalOpen, setIsLineOfBusinessReportModalOpen] = React.useState(false);
  const [isBookOfBusinessReportModalOpen, setIsBookOfBusinessReportModalOpen] = React.useState(false);
  const [isBookOfBusinessSummaryReportModalOpen, setIsBookOfBusinessSummaryReportModalOpen] = React.useState(false);
  
  // Imports/Exports modals
  const [isUploadCustomerCensusModalOpen, setIsUploadCustomerCensusModalOpen] = React.useState(false);
  const [isExportCustomerModalOpen, setIsExportCustomerModalOpen] = React.useState(false);
  const [isExportPoliciesModalOpen, setIsExportPoliciesModalOpen] = React.useState(false);
  
  // Other report modals
  const [isPivotTableReportModalOpen, setIsPivotTableReportModalOpen] = React.useState(false);
  const [isEventTrackingReportModalOpen, setIsEventTrackingReportModalOpen] = React.useState(false);
  const [isActivityRollupOtherReportModalOpen, setIsActivityRollupOtherReportModalOpen] = React.useState(false);
  const [isAgeRangeReportModalOpen, setIsAgeRangeReportModalOpen] = React.useState(false);
  const [isAgeProjectionReportModalOpen, setIsAgeProjectionReportModalOpen] = React.useState(false);
  const [isAORMatchingReportModalOpen, setIsAORMatchingReportModalOpen] = React.useState(false);
  
  const handleReportClick = (reportName, path = null) => {
    // Handle specific report modals
    switch (reportName) {
      case 'Customer':
        setIsCustomerReportModalOpen(true);
        break;
      case 'Customer New':
        setIsCustomerNewReportModalOpen(true);
        break;
      case 'Download Transactions':
        setIsDownloadTransactionsModalOpen(true);
        break;
      case 'Download Attachments':
        setIsDownloadAttachmentsModalOpen(true);
        break;
      case 'Download Notes':
        setIsDownloadNotesModalOpen(true);
        break;
      case 'Owner Overview':
        setIsOwnerOverviewModalOpen(true);
        break;
      case 'Activity Rollup - Prospects':
        setIsActivityRollupModalOpen(true);
        break;
      case 'Mobile Device Main Menu':
        setIsMobileReportsMenuModalOpen(true);
        break;
      case 'Mixed Policies':
        setIsMixedPoliciesModalOpen(true);
        break;
      case 'Policies With Payments':
        setIsPoliciesWithPaymentsModalOpen(true);
        break;
      case 'Policies W/O Payments':
        setIsPoliciesWithoutPaymentsModalOpen(true);
        break;
      case 'Policies W/O Attachments':
        setIsPoliciesWithoutAttachmentsModalOpen(true);
        break;
      case 'Expired Policies With Payments':
        setIsExpiredPoliciesWithPaymentsModalOpen(true);
        break;
      case 'Policies in Effect':
        setIsPoliciesInEffectModalOpen(true);
        break;
      case 'Expired Policies':
        setIsExpiredPoliciesModalOpen(true);
        break;
      case 'Pending Policies':
        setIsPendingPoliciesModalOpen(true);
        break;
      case 'Receipt List':
        setIsReceiptListModalOpen(true);
        break;
      case 'Premium By Company':
        setIsPremiumByCompanyModalOpen(true);
        break;
      case 'Policies By Company':
        setIsPoliciesByCompanyModalOpen(true);
        break;
      case 'Customer W/O Policies':
        setIsCustomerWithoutPoliciesModalOpen(true);
        break;
      case 'Customer Views':
        setIsCustomerViewsModalOpen(true);
        break;
      case 'Cross-Selling':
        setIsCrossSellingModalOpen(true);
        break;
      case 'Do Not Contact':
        setIsDoNotContactModalOpen(true);
        break;
      case 'Blast History':
        setIsBlastHistoryModalOpen(true);
        break;
      case 'Drip Marketing Campaign':
        setIsDripMarketingCampaignModalOpen(true);
        break;
      case 'Company Email History':
        setIsCompanyEmailHistoryModalOpen(true);
        break;
      case 'Add Ons':
        setIsAddOnsReportModalOpen(true);
        break;
      case 'Company':
        setIsCompanyReportModalOpen(true);
        break;
      case 'New Business':
        setIsNewBusinessReportModalOpen(true);
        break;
      case 'Line Of Business':
        setIsLineOfBusinessReportModalOpen(true);
        break;
      case 'Book Of Business':
        setIsBookOfBusinessReportModalOpen(true);
        break;
      case 'Book Of Business Summary':
        setIsBookOfBusinessSummaryReportModalOpen(true);
        break;
      case 'Upload Customer Census':
        setIsUploadCustomerCensusModalOpen(true);
        break;
      case 'Export Customer':
        setIsExportCustomerModalOpen(true);
        break;
      case 'Export Policies':
        setIsExportPoliciesModalOpen(true);
        break;
      case 'Pivot Table':
        setIsPivotTableReportModalOpen(true);
        break;
      case 'Event Tracking':
        setIsEventTrackingReportModalOpen(true);
        break;
      case 'Activity Rollup':
        setIsActivityRollupOtherReportModalOpen(true);
        break;
      case 'Age Range':
        setIsAgeRangeReportModalOpen(true);
        break;
      case 'Age Projection':
        setIsAgeProjectionReportModalOpen(true);
        break;
      case 'AOR Matching':
        setIsAORMatchingReportModalOpen(true);
        break;
      case 'Business Structure':
        setIsBusinessStructureReportModalOpen(true);
        break;
      case 'Broker List':
        setIsBrokerListReportModalOpen(true);
        break;
      case 'CSR':
        setIsCSRReportModalOpen(true);
        break;
      case 'Due Dates':
        setIsDueDatesReportModalOpen(true);
        break;
      case 'Follow Up Notes':
        setIsFollowUpNotesReportModalOpen(true);
        break;
      case 'Hidden & Inactive':
        setIsHiddenInactiveReportModalOpen(true);
        break;
      case 'Notes - System Added':
        setIsNotesSystemAddedReportModalOpen(true);
        break;
      case 'Notes - User Added':
        setIsNotesUserAddedReportModalOpen(true);
        break;
      case 'Business Structure':
        setIsBusinessStructureReportModalOpen(true);
        break;
      case 'Broker List':
        setIsBrokerListReportModalOpen(true);
        break;
      case 'CSR':
        setIsCSRReportModalOpen(true);
        break;
      case 'Due Dates':
        setIsDueDatesReportModalOpen(true);
        break;
      case 'Follow Up Notes':
        setIsFollowUpNotesReportModalOpen(true);
        break;
      case 'Hidden & Inactive':
        setIsHiddenInactiveReportModalOpen(true);
        break;
      case 'Notes - System Added':
        setIsNotesSystemAddedReportModalOpen(true);
        break;
      case 'Notes - User Added':
        setIsNotesUserAddedReportModalOpen(true);
        break;
      default:
        if (path) {
      navigate(path);
    } else {
      showInfo(`📊 ${reportName} report coming soon!`);
    }
        break;
    }
  };

  const reportSections = [
    {
      title: 'Mobile Reports',
      icon: FiFileText,
      color: 'bg-blue-100 text-blue-800',
      reports: [
        { name: 'Mobile Device Main Menu', path: null }
      ]
    },
    {
      title: 'Owner Reports',
      icon: FiUsers,
      color: 'bg-green-100 text-green-800',
      reports: [
        { name: 'Owner Overview', path: null },
        { name: 'Activity Rollup - Prospects', path: null }
      ]
    },
    {
      title: 'Download Reports',
      icon: FiDownload,
      color: 'bg-purple-100 text-purple-800',
      reports: [
        { name: 'Download Policy Activity', path: '/downloads/policy-activity' },
        { name: 'Download Transactions', path: null },
        { name: 'Download Attachments', path: null },
        { name: 'Download Notes', path: null }
      ]
    },
    {
      title: 'Investigative',
      icon: FiSearch,
      color: 'bg-orange-100 text-orange-800',
      reports: [
        { name: 'Mixed Policies', path: null },
        { name: 'Policies With Payments', path: null },
        { name: 'Policies W/O Payments', path: null },
        { name: 'Policies W/O Attachments', path: null },
        { name: 'Expired Policies With Payments', path: null },
        { name: 'Policies in Effect', path: null },
        { name: 'P.I Land Paid Policies', path: null },
        { name: 'Expired Policies', path: null },
        { name: 'Pending Policies', path: null },
        { name: 'Receipt List', path: null },
        { name: 'Premium By Company', path: null },
        { name: 'Policies By Company', path: null },
        { name: 'Customer W/O Policies', path: null },
        { name: 'Customer Views', path: null }
      ]
    },
    {
      title: 'Marketing',
      icon: FiTrendingUp,
      color: 'bg-pink-100 text-pink-800',
      reports: [
        { name: 'Customer', path: null },
        { name: 'Customer New', path: null },
        { name: 'Cross-Selling', path: null },
        { name: 'Do Not Contact', path: null },
        { name: 'Blast History', path: null },
        { name: 'Drip Marketing Campaign', path: null },
        { name: 'Company Email History', path: null }
      ]
    },
    {
      title: 'Production',
      icon: FiBarChart2,
      color: 'bg-indigo-100 text-indigo-800',
      reports: [
        { name: 'Add Ons', path: null },
        { name: 'Company', path: null },
        { name: 'New Business', path: null },
        { name: 'Line Of Business', path: null },
        { name: 'Book Of Business', path: null },
        { name: 'Book Of Business Summary', path: null }
      ]
    },
    {
      title: 'Employee / Broker',
      icon: FiUsers,
      color: 'bg-cyan-100 text-cyan-800',
      reports: [
        { name: 'Fee Commissions', path: null },
        { name: 'Production Summary', path: null },
        { name: 'Production Detail', path: null },
        { name: 'Written Premium', path: null },
        { name: 'Term Premium', path: null },
        { name: 'Employee Overview', path: null },
        { name: 'Time Reporting', path: null },
        { name: 'Employee Login', path: null },
        { name: 'Letter Communications', path: null },
        { name: 'Employee Listing', path: null },
        { name: 'Office Listing', path: null },
        { name: 'Employee Production', path: null }
      ]
    },
    {
      title: 'Auditing',
      icon: FiFileText,
      color: 'bg-yellow-100 text-yellow-800',
      reports: [
        { name: 'Data Integrity', path: null },
        { name: 'Data Validation', path: null },
        { name: 'Internal Note Tracking', path: null },
        { name: 'Receipts', path: null },
        { name: 'Saved Reports', path: null },
        { name: 'Time Clock IP', path: null },
        { name: 'Time Clock Editing', path: null }
      ]
    },
    {
      title: 'Imports / Exports',
      icon: FiMoreHorizontal,
      color: 'bg-gray-100 text-gray-800',
      reports: [
        { name: 'Upload Customer Census', path: null },
        { name: 'Export Customer', path: null },
        { name: 'Export Policies', path: null }
      ]
    },
    {
      title: 'Drip',
      icon: FiSettings,
      color: 'bg-emerald-100 text-emerald-800',
      reports: [
        { name: 'Schedule Agency Items', path: null },
        { name: 'Items Without Tasks', path: null }
      ]
    },
    {
      title: 'Website',
      icon: FiGlobe,
      color: 'bg-blue-100 text-blue-800',
      reports: [
        { name: 'Activity Logging', path: null }
      ]
    },
    {
      title: 'Texting',
      icon: FiMessageSquare,
      color: 'bg-green-100 text-green-800',
      reports: [
        { name: 'SMS Messaging', path: null }
      ]
    },
    {
      title: 'Statistics',
      icon: FiTrendingUp,
      color: 'bg-red-100 text-red-800',
      reports: [
        { name: 'Demographics', path: null },
        { name: 'Marketing Sources', path: null },
        { name: 'Browser Statistics', path: null },
        { name: 'Report Statistics', path: null },
        { name: 'Payment Report', path: null }
      ]
    },
    {
      title: 'Other',
      icon: FiMoreHorizontal,
      color: 'bg-gray-100 text-gray-800',
      reports: [
        { name: 'Pivot Table', path: null },
        { name: 'Event Tracking', path: null },
        { name: 'Activity Rollup', path: null },
        { name: 'Age Range', path: null },
        { name: 'Age Projection', path: null },
        { name: 'AOR Matching', path: null },
        { name: 'Alerts', path: null },
        { name: 'Attachments', path: null },
        { name: 'Balance Due', path: null },
        { name: 'Customer Write Off', path: null },
        { name: 'Barcodes', path: null },
        { name: 'Birthdays', path: null },
        { name: 'Business Structure', path: null },
        { name: 'Broker List', path: null },
        { name: 'CSR', path: null },
        { name: 'Due Dates', path: null },
        { name: 'Follow Up Notes', path: null },
        { name: 'Hidden & Inactive', path: null },
        { name: 'Notes - System Added', path: null },
        { name: 'Notes - User Added', path: null },
        { name: 'Policies by Lienholder', path: null },
        { name: 'Prospect List', path: null },
        { name: 'Renew/Cancel List', path: null },
        { name: 'Pending Cancel List', path: null },
        { name: 'Retention/Renewal List', path: null },
        { name: 'Tasks', path: null },
        { name: 'Thank You Letters', path: null }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FiBarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Reports Menu</h1>
              <p className="text-blue-100">Generate and download comprehensive business reports</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{reportSections.reduce((total, section) => total + section.reports.length, 0)}</div>
            <div className="text-sm text-blue-100">Available Reports</div>
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <FiStar className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Favorites</h2>
        </div>
        <div className="mt-3 bg-white bg-opacity-20 rounded-lg p-3">
          <p className="text-white text-sm">No favorite reports yet. Click the star icon next to any report to add it to favorites.</p>
        </div>
      </div>

      {/* General Section */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <FiSettings className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">General</h2>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {reportSections.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className={`p-4 ${section.color} border-b`}>
              <div className="flex items-center space-x-2">
                <section.icon className="w-5 h-5" />
                <h3 className="font-semibold text-sm">{section.title}</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {section.reports.map((report, reportIndex) => (
                  <button
                    key={reportIndex}
                    onClick={() => handleReportClick(report.name, report.path)}
                    className="w-full text-left p-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    {report.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Modals */}
      <CustomerReportModal
        isOpen={isCustomerReportModalOpen}
        onClose={() => setIsCustomerReportModalOpen(false)}
      />
      
      <CustomerNewReportModal
        isOpen={isCustomerNewReportModalOpen}
        onClose={() => setIsCustomerNewReportModalOpen(false)}
        onCreateReport={() => {
          setIsCustomerNewReportModalOpen(false);
          setIsCustomerReportModalOpen(true);
        }}
      />
      
      <DownloadTransactionsModal
        isOpen={isDownloadTransactionsModalOpen}
        onClose={() => setIsDownloadTransactionsModalOpen(false)}
      />
      
      <DownloadAttachmentsModal
        isOpen={isDownloadAttachmentsModalOpen}
        onClose={() => setIsDownloadAttachmentsModalOpen(false)}
      />
      
      <DownloadNotesModal
        isOpen={isDownloadNotesModalOpen}
        onClose={() => setIsDownloadNotesModalOpen(false)}
      />
      
      <OwnerOverviewReportModal
        isOpen={isOwnerOverviewModalOpen}
        onClose={() => setIsOwnerOverviewModalOpen(false)}
      />
      
      <ActivityRollupReportModal
        isOpen={isActivityRollupModalOpen}
        onClose={() => setIsActivityRollupModalOpen(false)}
      />
      
      <MobileReportsMenuModal
        isOpen={isMobileReportsMenuModalOpen}
        onClose={() => setIsMobileReportsMenuModalOpen(false)}
      />
      
      {/* Investigative Report Modals */}
      <MixedPoliciesReportModal
        isOpen={isMixedPoliciesModalOpen}
        onClose={() => setIsMixedPoliciesModalOpen(false)}
      />
      
      <PoliciesWithPaymentsReportModal
        isOpen={isPoliciesWithPaymentsModalOpen}
        onClose={() => setIsPoliciesWithPaymentsModalOpen(false)}
      />
      
      <PoliciesWithoutPaymentsReportModal
        isOpen={isPoliciesWithoutPaymentsModalOpen}
        onClose={() => setIsPoliciesWithoutPaymentsModalOpen(false)}
      />
      
      <PoliciesWithoutAttachmentsReportModal
        isOpen={isPoliciesWithoutAttachmentsModalOpen}
        onClose={() => setIsPoliciesWithoutAttachmentsModalOpen(false)}
      />
      
      <ExpiredPoliciesWithPaymentsReportModal
        isOpen={isExpiredPoliciesWithPaymentsModalOpen}
        onClose={() => setIsExpiredPoliciesWithPaymentsModalOpen(false)}
      />
      
      <PoliciesInEffectReportModal
        isOpen={isPoliciesInEffectModalOpen}
        onClose={() => setIsPoliciesInEffectModalOpen(false)}
      />
      
      <ExpiredPoliciesReportModal
        isOpen={isExpiredPoliciesModalOpen}
        onClose={() => setIsExpiredPoliciesModalOpen(false)}
      />
      
      <PendingPoliciesReportModal
        isOpen={isPendingPoliciesModalOpen}
        onClose={() => setIsPendingPoliciesModalOpen(false)}
      />
      
      <ReceiptListReportModal
        isOpen={isReceiptListModalOpen}
        onClose={() => setIsReceiptListModalOpen(false)}
      />
      
      <PremiumByCompanyReportModal
        isOpen={isPremiumByCompanyModalOpen}
        onClose={() => setIsPremiumByCompanyModalOpen(false)}
      />
      
      <PoliciesByCompanyReportModal
        isOpen={isPoliciesByCompanyModalOpen}
        onClose={() => setIsPoliciesByCompanyModalOpen(false)}
      />
      
      <CustomerWithoutPoliciesReportModal
        isOpen={isCustomerWithoutPoliciesModalOpen}
        onClose={() => setIsCustomerWithoutPoliciesModalOpen(false)}
      />
      
      <CustomerViewsReportModal
        isOpen={isCustomerViewsModalOpen}
        onClose={() => setIsCustomerViewsModalOpen(false)}
      />
      
      {/* Marketing Report Modals */}
      <CrossSellingReportModal
        isOpen={isCrossSellingModalOpen}
        onClose={() => setIsCrossSellingModalOpen(false)}
      />
      
      <DoNotContactReportModal
        isOpen={isDoNotContactModalOpen}
        onClose={() => setIsDoNotContactModalOpen(false)}
      />
      
      <BlastHistoryReportModal
        isOpen={isBlastHistoryModalOpen}
        onClose={() => setIsBlastHistoryModalOpen(false)}
      />
      
      <DripMarketingCampaignReportModal
        isOpen={isDripMarketingCampaignModalOpen}
        onClose={() => setIsDripMarketingCampaignModalOpen(false)}
      />
      
      <CompanyEmailHistoryReportModal
        isOpen={isCompanyEmailHistoryModalOpen}
        onClose={() => setIsCompanyEmailHistoryModalOpen(false)}
      />
      
      {/* Production Report Modals */}
      <AddOnsReportModal
        isOpen={isAddOnsReportModalOpen}
        onClose={() => setIsAddOnsReportModalOpen(false)}
      />
      
      <CompanyReportModal
        isOpen={isCompanyReportModalOpen}
        onClose={() => setIsCompanyReportModalOpen(false)}
      />
      
      <NewBusinessReportModal
        isOpen={isNewBusinessReportModalOpen}
        onClose={() => setIsNewBusinessReportModalOpen(false)}
      />
      
      <LineOfBusinessReportModal
        isOpen={isLineOfBusinessReportModalOpen}
        onClose={() => setIsLineOfBusinessReportModalOpen(false)}
      />
      
      <BookOfBusinessReportModal
        isOpen={isBookOfBusinessReportModalOpen}
        onClose={() => setIsBookOfBusinessReportModalOpen(false)}
      />
      
      <BookOfBusinessSummaryReportModal
        isOpen={isBookOfBusinessSummaryReportModalOpen}
        onClose={() => setIsBookOfBusinessSummaryReportModalOpen(false)}
      />
      
      {/* Imports/Exports Modals */}
      <UploadCustomerCensusModal
        isOpen={isUploadCustomerCensusModalOpen}
        onClose={() => setIsUploadCustomerCensusModalOpen(false)}
      />
      
      <ExportCustomerModal
        isOpen={isExportCustomerModalOpen}
        onClose={() => setIsExportCustomerModalOpen(false)}
      />
      
      <ExportPoliciesModal
        isOpen={isExportPoliciesModalOpen}
        onClose={() => setIsExportPoliciesModalOpen(false)}
      />
      
      {/* Other Report Modals */}
      <PivotTableReportModal
        isOpen={isPivotTableReportModalOpen}
        onClose={() => setIsPivotTableReportModalOpen(false)}
      />
      
      <EventTrackingReportModal
        isOpen={isEventTrackingReportModalOpen}
        onClose={() => setIsEventTrackingReportModalOpen(false)}
      />
      
      <ActivityRollupReportModal
        isOpen={isActivityRollupOtherReportModalOpen}
        onClose={() => setIsActivityRollupOtherReportModalOpen(false)}
      />
      
      <AgeRangeReportModal
        isOpen={isAgeRangeReportModalOpen}
        onClose={() => setIsAgeRangeReportModalOpen(false)}
      />
      
      <AgeProjectionReportModal
        isOpen={isAgeProjectionReportModalOpen}
        onClose={() => setIsAgeProjectionReportModalOpen(false)}
      />
      
      <AORMatchingReportModal
        isOpen={isAORMatchingReportModalOpen}
        onClose={() => setIsAORMatchingReportModalOpen(false)}
      />
      
      {/* Additional Other Report Modals */}
      <BusinessStructureReportModal
        isOpen={isBusinessStructureReportModalOpen}
        onClose={() => setIsBusinessStructureReportModalOpen(false)}
      />
      
      <BrokerListReportModal
        isOpen={isBrokerListReportModalOpen}
        onClose={() => setIsBrokerListReportModalOpen(false)}
      />
      
      <CSRReportModal
        isOpen={isCSRReportModalOpen}
        onClose={() => setIsCSRReportModalOpen(false)}
      />
      
      <DueDatesReportModal
        isOpen={isDueDatesReportModalOpen}
        onClose={() => setIsDueDatesReportModalOpen(false)}
      />
      
      <FollowUpNotesReportModal
        isOpen={isFollowUpNotesReportModalOpen}
        onClose={() => setIsFollowUpNotesReportModalOpen(false)}
      />
      
      <HiddenInactiveReportModal
        isOpen={isHiddenInactiveReportModalOpen}
        onClose={() => setIsHiddenInactiveReportModalOpen(false)}
      />
      
      <NotesSystemAddedReportModal
        isOpen={isNotesSystemAddedReportModalOpen}
        onClose={() => setIsNotesSystemAddedReportModalOpen(false)}
      />
      
      <NotesUserAddedReportModal
        isOpen={isNotesUserAddedReportModalOpen}
        onClose={() => setIsNotesUserAddedReportModalOpen(false)}
      />
      
      {/* Additional Other Report Modals */}
      <BusinessStructureReportModal
        isOpen={isBusinessStructureReportModalOpen}
        onClose={() => setIsBusinessStructureReportModalOpen(false)}
      />
      
      <BrokerListReportModal
        isOpen={isBrokerListReportModalOpen}
        onClose={() => setIsBrokerListReportModalOpen(false)}
      />
      
      <CSRReportModal
        isOpen={isCSRReportModalOpen}
        onClose={() => setIsCSRReportModalOpen(false)}
      />
      
      <DueDatesReportModal
        isOpen={isDueDatesReportModalOpen}
        onClose={() => setIsDueDatesReportModalOpen(false)}
      />
      
      <FollowUpNotesReportModal
        isOpen={isFollowUpNotesReportModalOpen}
        onClose={() => setIsFollowUpNotesReportModalOpen(false)}
      />
      
      <HiddenInactiveReportModal
        isOpen={isHiddenInactiveReportModalOpen}
        onClose={() => setIsHiddenInactiveReportModalOpen(false)}
      />
      
      <NotesSystemAddedReportModal
        isOpen={isNotesSystemAddedReportModalOpen}
        onClose={() => setIsNotesSystemAddedReportModalOpen(false)}
      />
      
      <NotesUserAddedReportModal
        isOpen={isNotesUserAddedReportModalOpen}
        onClose={() => setIsNotesUserAddedReportModalOpen(false)}
      />
    </div>
  );
}

export default ReportsMenu;