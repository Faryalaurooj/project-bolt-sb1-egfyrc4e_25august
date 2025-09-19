import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { FiFileText, FiDatabase } from 'react-icons/fi';
import FormsTab from '../components/documents/FormsTab';
import AegisTab from '../components/documents/AegisTab';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Documents() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📄 Documents Management</h1>
            <p className="text-gray-600">Manages ACORD forms , Templates, Agency Letterhead & E-Signatures</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">Forms</div>
              <div className="text-sm text-gray-500">ACORD Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">AEGIS</div>
              <div className="text-sm text-gray-500">Cloud Documents</div>
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
              <FiFileText className="w-4 h-4" />
              <span>Forms</span>
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
              <FiDatabase className="w-4 h-4" />
              <span>AEGIS</span>
            </div>
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <FormsTab />
          </Tab.Panel>
          <Tab.Panel>
            <AegisTab />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default Documents;