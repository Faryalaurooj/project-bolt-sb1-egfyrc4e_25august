import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSearch } from 'react-icons/fi';
import { initiatePandaDocEditorSession } from '../../services/api';
import { useToast } from '../../hooks/useToast';

function AccordFormSearchModal({ isOpen, onClose, contact, selectedPolicies, onFormSelected }) {
  const { showSuccess, showError, showInfo } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedForms, setSelectedForms] = useState([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dummy Accord form data matching the screenshot
  const accordForms = [
    {
      id: '276',
      accord: '276',
      state: '',
      description: 'Aircraft Insurance Binder',
      file_url: '/accord-templates/sample-accord-276.pdf'
    },
    {
      id: '275',
      accord: '275',
      state: '',
      description: 'Aviation Insurance Binder',
      file_url: '/accord-templates/sample-accord-275.pdf'
    },
    {
      id: '76',
      accord: '76',
      state: '',
      description: 'Binder Log',
      file_url: '/accord-templates/sample-accord-76.pdf'
    },
    {
      id: '75',
      accord: '75',
      state: '',
      description: 'Insurance Binder',
      file_url: '/accord-templates/sample-accord-75.pdf'
    },
    {
      id: '25',
      accord: '25',
      state: 'NY',
      description: 'Certificate of Liability Insurance',
      file_url: '/accord-templates/Cancellation Request Acord Form 35.pdf'
    },
    {
      id: '27',
      accord: '27',
      state: 'CA',
      description: 'Evidence of Property Insurance',
      file_url: '/accord-templates/sample-accord-27.pdf'
    },
    {
      id: '28',
      accord: '28',
      state: 'TX',
      description: 'Evidence of Commercial Property Insurance',
      file_url: '/accord-templates/sample-accord-28.pdf'
    },
    {
      id: '130',
      accord: '130',
      state: '',
      description: 'Workers Compensation Application',
      file_url: '/accord-templates/sample-accord-130.pdf'
    },
    {
      id: '131',
      accord: '131',
      state: '',
      description: 'Commercial Auto Application',
      file_url: '/accord-templates/sample-accord-131.pdf'
    },
    {
      id: '140',
      accord: '140',
      state: '',
      description: 'Property Application',
      file_url: '/accord-templates/sample-accord-140.pdf'
    },
    {
      id: '126',
      accord: '126',
      state: 'CA',
      description: 'Commercial General Liability Application',
      file_url: '/accord-templates/sample-accord-126.pdf'
    },
    {
      id: '137',
      accord: '137',
      state: 'NY',
      description: 'Commercial Auto Application',
      file_url: '/accord-templates/sample-accord-137.pdf'
    },
    {
      id: '101',
      accord: '101',
      state: '',
      description: 'Summary of Insurance',
      file_url: '/accord-templates/sample-accord-101.pdf'
    },
    {
      id: '24',
      accord: '24',
      state: '',
      description: 'Certificate of Property Insurance',
      file_url: '/accord-templates/sample-accord-24.pdf'
    },
    {
      id: '23',
      accord: '23',
      state: '',
      description: 'Certificate of Property Insurance',
      file_url: '/accord-templates/sample-accord-23.pdf'
    },
    {
      id: '35',
      accord: '35',
      state: '',
      description: 'Cancellation Request',
      file_url: '/accord-templates/Cancellation Request Acord Form 35.pdf'
    },
    {
      id: 'homeowner',
      accord: 'Homeowner',
      state: '',
      description: 'Homeowner Application Template',
      file_url: '/accord-templates/Mike Thompson Homeowner application Utica template.pdf'
    },
    {
      id: 'hagerty',
      accord: 'BOR',
      state: '',
      description: 'Hagerty BOR Form',
      file_url: '/accord-templates/Hagerty BOR Form.pdf'
    }
  ];

  const filteredForms = accordForms.filter(form =>
    form.accord.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormSelect = (form) => {
    if (multiSelect) {
      const isSelected = selectedForms.find(f => f.id === form.id);
      if (isSelected) {
        setSelectedForms(selectedForms.filter(f => f.id !== form.id));
      } else {
        setSelectedForms([...selectedForms, form]);
      }
    } else {
      setSelectedForm(form);
    }
  };

  const handleSelectAll = () => {
    if (selectedForms.length === filteredForms.length) {
      setSelectedForms([]);
    } else {
      setSelectedForms([...filteredForms]);
    }
  };

  const handleNext = () => {
    const formsToProcess = multiSelect ? selectedForms : (selectedForm ? [selectedForm] : []);
    if (formsToProcess.length === 0) {
      showError('Please select an Accord form');
      return;
    }
    
    // Open the first selected form in PandaDoc
    handleOpenInPandaDoc(formsToProcess[0]);
  };

  const handleOpenInPandaDoc = async (selectedForm) => {
    if (!selectedForm.file_url) {
      showError('This form template does not have a file URL. Please upload the actual template first.');
      return;
    }

    setLoading(true);
    try {
      showInfo('🔄 Opening form in PandaDoc editor...');
      
      const documentName = `${selectedForm.description} - ${contact?.first_name || 'Client'} ${contact?.last_name || ''} - ${new Date().toLocaleDateString()}`;
      
      // Prepare contact data for pre-filling
      const contactData = contact ? {
        id: contact.id,
        email: contact.email,
        first_name: contact.first_name,
        last_name: contact.last_name,
        phone: contact.phone || contact.cell_number,
        address: contact.address,
        city: contact.city,
        state: contact.state,
        zip: contact.zip
      } : null;

      const response = await initiatePandaDocEditorSession(
        selectedForm.file_url,
        documentName,
        contactData
      );

      if (response.success && response.editor_url) {
        showSuccess('📄 Opening PandaDoc editor in new tab...');
        
        // Open PandaDoc editor in new tab
        window.open(response.editor_url, '_blank', 'noopener,noreferrer');
        
        // Store document info for tracking
        localStorage.setItem('pandadoc_session', JSON.stringify({
          document_id: response.document_id,
          document_name: documentName,
          contact_id: contact?.id,
          template_name: selectedForm.description,
          opened_at: new Date().toISOString()
        }));
        
        showInfo('💡 Complete the form in PandaDoc, then return here. The completed document will be automatically saved to your CRM.');
        
        onClose();
      } else {
        throw new Error('Invalid response from PandaDoc API');
      }
    } catch (error) {
      console.error('Error opening PandaDoc editor:', error);
      showError(`Failed to open PandaDoc editor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedForm(null);
    setSelectedForms([]);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

        <div className="relative bg-white w-full max-w-4xl mx-4 rounded-lg shadow-2xl overflow-hidden">
          {/* Header matching screenshot */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
            <div className="flex justify-between items-center">
              <Dialog.Title className="text-xl font-bold text-white">
                ACORD Form Search
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Search Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search forms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={multiSelect}
                      onChange={(e) => setMultiSelect(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Multi-select</span>
                  </label>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Reset
                </button>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Total Search Results: {filteredForms.length} | Selected: {multiSelect ? selectedForms.length : (selectedForm ? 1 : 0)}
              </div>
            </div>

            {/* Forms Table matching screenshot */}
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <table className="min-w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={multiSelect && selectedForms.length === filteredForms.length && filteredForms.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">ACORD</th>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">State</th>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredForms.map((form) => {
                    const isSelected = multiSelect 
                      ? selectedForms.find(f => f.id === form.id)
                      : selectedForm?.id === form.id;
                    return (
                      <tr
                        key={form.id}
                        onClick={() => handleFormSelect(form)}
                        className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                          isSelected ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={() => {}} // Handled by row click
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {form.accord}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {form.state || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {form.description}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredForms.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No forms found matching your search criteria.</p>
              </div>
            )}
          </div>

          {/* Footer with action buttons */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {multiSelect 
                ? `${selectedForms.length} form(s) selected`
                : selectedForm 
                  ? `Selected: ACORD ${selectedForm.accord} - ${selectedForm.description}` 
                  : 'No form selected'
              }
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                CANCEL
              </button>
              
              <button
                onClick={handleNext}
                disabled={multiSelect ? selectedForms.length === 0 : !selectedForm || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Opening...
                  </>
                ) : (
                  'OPEN IN PANDADOC'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default AccordFormSearchModal;