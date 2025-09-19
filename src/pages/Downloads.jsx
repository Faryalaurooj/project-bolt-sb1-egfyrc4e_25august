import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { FiFileText, FiBarChart2, FiUpload } from 'react-icons/fi';
import IvansTab from '../components/downloads/IvansTab';
import ReportsTab from '../components/downloads/ReportsTab';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Downloads() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">⬇️ Downloads & Reports</h1>
            <p className="text-gray-600">Manage your IVANS documents, generated reports, and other files</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">IVANS</div>
              <div className="text-sm text-gray-500">Documents & Forms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Reports</div>
              <div className="text-sm text-gray-500">Custom Files</div>
            </div>
          </div>
        </div>
      </div>

      <Tab.Group onChange={setActiveTab}>
        {/* Enhanced Tab Navigation */}
        <Tab.List className="flex space-x-1 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 p-1 shadow-sm">
          <Tab className={({ selected }) =>
            classNames(
              'w-full rounded-lg py-3 px-6 text-sm font-semibold transition-all duration-200 focus:outline-none',
              selected
                ? 'bg-white text-blue-700 shadow-md transform scale-105'
                : 'text-blue-600 hover:bg-white hover:bg-opacity-50 hover:text-blue-800'
            )
          }>
            <div className="flex items-center justify-center space-x-2">
              <FiUpload className="w-4 h-4" />
              <span>IVANS</span>
            </div>
          </Tab>
          <Tab className={({ selected }) =>
            classNames(
              'w-full rounded-lg py-3 px-6 text-sm font-semibold transition-all duration-200 focus:outline-none',
              selected
                ? 'bg-white text-blue-700 shadow-md transform scale-105'
                : 'text-blue-600 hover:bg-white hover:bg-opacity-50 hover:text-blue-800'
            )
          }>
            <div className="flex items-center justify-center space-x-2">
              <FiBarChart2 className="w-4 h-4" />
              <span>Reports</span>
            </div>
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <IvansTab />
          </Tab.Panel>
          <Tab.Panel>
            <ReportsTab />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default Downloads;
