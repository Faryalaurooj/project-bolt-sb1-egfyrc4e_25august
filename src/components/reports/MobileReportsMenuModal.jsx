import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiArrowLeft } from 'react-icons/fi';
import DepositSummaryReportModal from './DepositSummaryReportModal';
import OwnersOverviewByOfficeReportModal from './OwnersOverviewByOfficeReportModal';
import OwnersOverviewByEmployeeReportModal from './OwnersOverviewByEmployeeReportModal';

function MobileReportsMenuModal({ isOpen, onClose }) {
  const [isDepositSummaryModalOpen, setIsDepositSummaryModalOpen] = useState(false);
  const [isOwnersOverviewByOfficeModalOpen, setIsOwnersOverviewByOfficeModalOpen] = useState(false);
  const [isOwnersOverviewByEmployeeModalOpen, setIsOwnersOverviewByEmployeeModalOpen] = useState(false);

  const handleReportClick = (reportType) => {
    switch (reportType) {
      case 'deposit-summary':
        setIsDepositSummaryModalOpen(true);
        break;
      case 'owners-overview-by-office':
        setIsOwnersOverviewByOfficeModalOpen(true);
        break;
      case 'owners-overview-by-employee':
        setIsOwnersOverviewByEmployeeModalOpen(true);
        break;
      default:
        console.log('Unknown report type:', reportType);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Mobile Reports Menu</h2>
              <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">
                <FiArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 text-center">
              {/* Agency Logo and Name */}
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-green-600 font-bold text-lg">THE</div>
                      <div className="text-green-600 font-bold text-sm">CUSMANO</div>
                      <div className="text-blue-800 font-bold text-lg">AGENCY</div>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-blue-600 mb-2">John J Cusmano Jr.</h3>
              </div>

              {/* Mobile Reports Section */}
              <div className="bg-blue-600 text-white p-4 rounded-lg mb-6">
                <h4 className="text-xl font-semibold">Mobile Reports</h4>
              </div>

              {/* Report Links */}
              <div className="space-y-4 text-left">
                <button
                  onClick={() => handleReportClick('deposit-summary')}
                  className="block w-full text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-3 rounded-lg transition-colors"
                >
                  • Deposit Summary
                </button>
                <button
                  onClick={() => handleReportClick('owners-overview-by-office')}
                  className="block w-full text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-3 rounded-lg transition-colors"
                >
                  • Owners Overview By Office
                </button>
                <button
                  onClick={() => handleReportClick('owners-overview-by-employee')}
                  className="block w-full text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-3 rounded-lg transition-colors"
                >
                  • Owners Overview By Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Nested Modals */}
      <DepositSummaryReportModal
        isOpen={isDepositSummaryModalOpen}
        onClose={() => setIsDepositSummaryModalOpen(false)}
      />
      
      <OwnersOverviewByOfficeReportModal
        isOpen={isOwnersOverviewByOfficeModalOpen}
        onClose={() => setIsOwnersOverviewByOfficeModalOpen(false)}
      />
      
      <OwnersOverviewByEmployeeReportModal
        isOpen={isOwnersOverviewByEmployeeModalOpen}
        onClose={() => setIsOwnersOverviewByEmployeeModalOpen(false)}
      />
    </>
  );
}

export default MobileReportsMenuModal;