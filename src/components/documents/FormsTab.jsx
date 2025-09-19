import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiFileText, FiSearch, FiEye, FiTrash2, 
  FiEdit, FiDownload, FiUsers, FiRefreshCw 
} from 'react-icons/fi';
import FormTemplateManager from '../forms/FormTemplateManager';
import AccordFormFiller from '../forms/AccordFormFiller';
import PolicySelectModal from '../forms/PolicySelectModal';
import AccordFormSearchModal from '../forms/AccordFormSearchModal';
import { getFormTemplates, getFilledForms } from '../../services/api';
import { useToast } from '../../hooks/useToast';

function FormsTab() {
  const { showSuccess, showError, showInfo } = useToast();

  const [isFormTemplateManagerOpen, setIsFormTemplateManagerOpen] = useState(false);
  const [isAccordFormFillerOpen, setIsAccordFormFillerOpen] = useState(false);
  const [isPolicySelectOpen, setIsPolicySelectOpen] = useState(false);
  const [isAccordFormSearchOpen, setIsAccordFormSearchOpen] = useState(false);

  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [selectedAccordForm, setSelectedAccordForm] = useState(null);

  const [templates, setTemplates] = useState([]);
  const [filledForms, setFilledForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('templates'); // 'templates' or 'filled'

  useEffect(() => {
    fetchTemplates();
    fetchFilledForms();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await getFormTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showError('Failed to load form templates');
    }
  };

  const fetchFilledForms = async () => {
    try {
      // Replace with API call to fetch filled forms
      setFilledForms([]); 
    } catch (error) {
      console.error('Error fetching filled forms:', error);
    }
  };

  const handleNewAccordForm = () => {
    setIsPolicySelectOpen(true);
    setSelectedContact(null);
    setSelectedPolicies([]);
    setSelectedAccordForm(null);
  };

  const handlePoliciesSelected = (contact, policies) => {
    setSelectedContact(contact);
    setSelectedPolicies(policies);
    setIsPolicySelectOpen(false);
    setIsAccordFormSearchOpen(true);
  };

  const handleFormSelected = (accordForm, contact, policies) => {
    console.log('Form selected for PandaDoc:', accordForm);
  };

  const filteredTemplates = templates.filter(
    template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Form Templates</h3>
        <div className="flex space-x-3">
          <button
            onClick={handleNewAccordForm}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 flex items-center"
          >
            <FiFileText className="mr-2" /> New Accord Form
          </button>
          <button
            onClick={() => setIsFormTemplateManagerOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FiPlus className="mr-2" /> Add Template
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400 w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10 w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href={template.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium text-center flex items-center justify-center"
              >
                <FiEye className="mr-1 w-4 h-4" /> View
              </a>
              <button
                onClick={() => {
                  setSelectedContact(null);
                  setSelectedPolicies([]);
                  setIsAccordFormFillerOpen(true);
                }}
                className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center justify-center"
              >
                <FiEdit className="mr-1 w-4 h-4" /> Fill
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">Upload your first Accord form template to get started</p>
          <button
            onClick={() => setIsFormTemplateManagerOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Template
          </button>
        </div>
      )}
    </div>
  );

  const renderFilledForms = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Completed Documents</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              const session = localStorage.getItem('pandadoc_session');
              if (session) {
                showInfo('📄 Checking for completed documents from PandaDoc...');
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FiRefreshCw className="mr-2" /> Refresh from PandaDoc
          </button>
          <button
            onClick={handleNewAccordForm}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 flex items-center"
          >
            <FiFileText className="mr-2" /> New Accord Form
          </button>
          <button
            onClick={() => setActiveView('templates')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FiEye className="mr-2" /> View Templates
          </button>
        </div>
      </div>

      {filledForms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filledForms.map(form => (
            <div
              key={form.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Form #{form.id}</h4>
                  <p className="text-sm text-gray-600 mb-2">Template: {form.template_name}</p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(form.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {form.generated_pdf_url && (
                  <a
                    href={form.generated_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium text-center flex items-center justify-center"
                  >
                    <FiEye className="mr-1 w-4 h-4" /> View PDF
                  </a>
                )}
                <a
                  href={form.generated_pdf_url}
                  download
                  className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium text-center flex items-center justify-center"
                >
                  <FiDownload className="mr-1 w-4 h-4" /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No filled forms yet</h3>
          <p className="text-gray-600 mb-4">Start by filling your first Accord form</p>
          <button
            onClick={handleNewAccordForm}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Fill First Form
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveView('templates')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'templates'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveView('filled')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'filled'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Filled Forms ({filledForms.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'templates' && renderTemplates()}
      {activeView === 'filled' && renderFilledForms()}

      {/* Modals */}
      <FormTemplateManager
        isOpen={isFormTemplateManagerOpen}
        onClose={() => {
          setIsFormTemplateManagerOpen(false);
          fetchTemplates();
        }}
      />
      <AccordFormFiller
        isOpen={isAccordFormFillerOpen}
        onClose={() => {
          setIsAccordFormFillerOpen(false);
          fetchFilledForms();
        }}
        contact={selectedContact}
        policies={selectedPolicies}
        selectedAccordForm={selectedAccordForm}
      />
      <PolicySelectModal
        isOpen={isPolicySelectOpen}
        onClose={() => setIsPolicySelectOpen(false)}
        onPoliciesSelected={handlePoliciesSelected}
      />
      <AccordFormSearchModal
        isOpen={isAccordFormSearchOpen}
        onClose={() => setIsAccordFormSearchOpen(false)}
        contact={selectedContact}
        selectedPolicies={selectedPolicies}
        onFormSelected={handleFormSelected}
      />
    </div>
  );
}

export default FormsTab;
