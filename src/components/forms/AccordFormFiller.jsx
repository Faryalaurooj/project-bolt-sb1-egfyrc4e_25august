import React, { useState, useEffect } from 'react';
import { getFormTemplates, createFilledForm, sendDocumentForSignature } from '../../services/api'; // Import sendDocumentForSignature
import { FiFileText, FiDownload, FiSave, FiX, FiChevronDown, FiChevronUp, FiEdit } from 'react-icons/fi'; // Import FiEdit
import { Dialog } from '@headlessui/react';
import { useToast } from '../../hooks/useToast';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.min.mjs';

function AccordFormFiller({ isOpen, onClose, contact, policies = [], selectedAccordForm = null }) {
  const { showSuccess, showError } = useToast();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isSendForSignatureModalOpen, setIsSendForSignatureModalOpen] = useState(false); // New state for signature modal
  const [signatureRecipient, setSignatureRecipient] = useState({ // New state for recipient details
    email: contact?.email || '',
    firstName: contact?.first_name || '',
    lastName: contact?.last_name || ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setFormData({});
      setPdfPreviewUrl(null);
      
      // If an Accord form was selected, show it in the interface
      if (selectedAccordForm) {
        setSelectedTemplate({
          id: selectedAccordForm.id,
          name: `ACORD ${selectedAccordForm.accord} - ${selectedAccordForm.description}`,
          description: selectedAccordForm.description,
          file_url: null // Will be populated when actual templates are uploaded
        });
      }
      
      // Pre-fill recipient details if contact is provided
      setSignatureRecipient({
        email: contact?.email || '',
        firstName: contact?.first_name || '',
        lastName: contact?.last_name || ''
      });
      
      // Pre-fill form data if policy is provided
      if (policies.length > 0) {
        const primaryPolicy = policies[0]; // Use first policy for pre-filling
        setFormData({
          policyHolderName: contact ? `${contact.first_name} ${contact.last_name}` : '',
          policyNumber: primaryPolicy.policy_number || '',
          effectiveDate: primaryPolicy.effective_date || '',
          policyType: primaryPolicy.policy_type || '',
          company: primaryPolicy.company || '',
          premium: primaryPolicy.premium || '',
          // Add additional fields for multiple policies if needed
          totalPolicies: policies.length,
          allPolicyNumbers: policies.map(p => p.policy_number).filter(Boolean).join(', ')
        });
      }
    }
  }, [isOpen, contact, policies]);

  // Dynamic form fields based on Accord form type
  const getFormFieldsForAccord = (accordNumber) => {
    switch (accordNumber) {
      case '25': // Certificate of Liability Insurance
        return [
          { name: 'certificateNumber', label: 'Certificate Number', type: 'text', required: true },
          { name: 'certificateHolder', label: 'Certificate Holder', type: 'text', required: true },
          { name: 'generalLiabilityLimit', label: 'General Liability Limit', type: 'text', required: false },
          { name: 'autoLiabilityLimit', label: 'Auto Liability Limit', type: 'text', required: false },
          { name: 'excessUmbrellaLimit', label: 'Excess/Umbrella Limit', type: 'text', required: false },
          { name: 'additionalInsured', label: 'Additional Insured', type: 'textarea', required: false }
        ];
      case '130': // Workers Compensation Application
        return [
          { name: 'employeeCount', label: 'Number of Employees', type: 'number', required: true },
          { name: 'annualPayroll', label: 'Annual Payroll', type: 'number', required: true },
          { name: 'businessDescription', label: 'Business Description', type: 'textarea', required: true },
          { name: 'classCode', label: 'Class Code', type: 'text', required: false },
          { name: 'experienceModifier', label: 'Experience Modifier', type: 'number', required: false }
        ];
      case '131': // Commercial Auto Application
        return [
          { name: 'fleetSize', label: 'Fleet Size', type: 'number', required: true },
          { name: 'businessUse', label: 'Business Use', type: 'select', options: ['Service', 'Retail', 'Commercial', 'Other'], required: true },
          { name: 'radiusOfOperation', label: 'Radius of Operation', type: 'select', options: ['Local (50 miles)', 'Intermediate (51-200 miles)', 'Long Distance (200+ miles)'], required: true },
          { name: 'garageLocation', label: 'Garage Location', type: 'text', required: false }
        ];
      case '140': // Property Application
        return [
          { name: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
          { name: 'buildingValue', label: 'Building Value', type: 'number', required: true },
          { name: 'contentsValue', label: 'Contents Value', type: 'number', required: true },
          { name: 'occupancyType', label: 'Occupancy Type', type: 'select', options: ['Office', 'Retail', 'Manufacturing', 'Warehouse', 'Other'], required: true },
          { name: 'constructionType', label: 'Construction Type', type: 'select', options: ['Frame', 'Masonry', 'Steel', 'Concrete'], required: false }
        ];
      case '276': // Aircraft Insurance Binder
        return [
          { name: 'aircraftMake', label: 'Aircraft Make', type: 'text', required: true },
          { name: 'aircraftModel', label: 'Aircraft Model', type: 'text', required: true },
          { name: 'aircraftYear', label: 'Year', type: 'number', required: true },
          { name: 'tailNumber', label: 'Tail Number', type: 'text', required: true },
          { name: 'hullValue', label: 'Hull Value', type: 'number', required: true },
          { name: 'liabilityLimit', label: 'Liability Limit', type: 'text', required: false }
        ];
      default:
        return [
          { name: 'policyHolderName', label: 'Policy Holder Name', type: 'text', required: true },
          { name: 'policyNumber', label: 'Policy Number', type: 'text', required: false },
          { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: false },
          { name: 'policyType', label: 'Policy Type', type: 'text', required: false },
          { name: 'company', label: 'Company', type: 'text', required: false },
          { name: 'premium', label: 'Premium', type: 'number', required: false }
        ];
    }
  };

  const renderFormField = (field) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleFormChange}
            className="w-full border rounded-md p-2"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            rows={3}
            required={field.required}
          />
        );
      case 'select':
        return (
          <select
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleFormChange}
            className="w-full border rounded-md p-2"
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleFormChange}
            className="w-full border rounded-md p-2"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleFormChange}
            className="w-full border rounded-md p-2"
            required={field.required}
          />
        );
      default:
        return (
          <input
            type="text"
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleFormChange}
            className="w-full border rounded-md p-2"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
    }
  };

  // Get form fields based on selected template
  const formFields = selectedTemplate ? getFormFieldsForAccord(selectedTemplate.accord_number) : [];

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const fetchedTemplates = await getFormTemplates();
      setTemplates(fetchedTemplates);
    } catch (err) {
      console.error('Error fetching form templates:', err);
      // Don't show error for template fetching when using Accord forms
      if (!selectedAccordForm) {
        showError('Failed to load form templates.');
      }
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (template) => {
    setSelectedTemplate(template);
    setFormData({});
    setPdfPreviewUrl(null);
    showSuccess(`Template "${template.name}" selected. Fill out the form.`);
  };

  const handleFormChange = (e) => {
    const { name, value = '' } = e.target; // Ensure value is not undefined
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateFilledPdf = async () => {
    if (!selectedTemplate) {
      showError('Please select a template first.');
      return;
    }

    setGeneratingPdf(true);
    try {
      // For demo purposes, create a simple PDF with form data
      // In production, this would use the actual Accord template
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // Standard letter size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Add header
      page.drawText(`ACORD ${selectedTemplate.accord_number || 'Form'}`, {
        x: 50,
        y: 750,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(selectedTemplate.description || 'Insurance Form', {
        x: 50,
        y: 730,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      // Add form data
      let yPosition = 700;
      for (const [key, value] of Object.entries(formData)) {
        if (value && value.toString().trim()) {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          page.drawText(`${label}: ${value}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          });
          yPosition -= 20;
        }
      }
      
      // Add contact information
      if (contact) {
        yPosition -= 20;
        page.drawText('Contact Information:', {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 20;
        
        page.drawText(`Name: ${contact.first_name} ${contact.last_name}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 15;
        
        if (contact.email) {
          page.drawText(`Email: ${contact.email}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          });
          yPosition -= 15;
        }
        
        if (contact.phone) {
          page.drawText(`Phone: ${contact.phone}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          });
        }
      }
      
      // Add footer
      page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: 50,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
      
      // Save to filled forms if contact is available
      if (contact) {
        try {
          const fileName = `${selectedTemplate.name || selectedTemplate.description}_${contact.first_name}_${contact.last_name}_${Date.now()}.pdf`;
          const file = new File([blob], fileName, { type: 'application/pdf' });
          
          // In a real implementation, you would upload to Supabase storage here
          // For now, we'll just create the filled form record
          await createFilledForm({
            template_id: selectedTemplate.id,
            contact_id: contact.id,
            filled_data: formData,
            generated_pdf_url: url // In production, this would be the Supabase storage URL
          });
          
          showSuccess('Form data saved successfully!');
        } catch (saveError) {
          console.warn('Failed to save filled form:', saveError);
          showSuccess('PDF generated successfully! (Note: Form data not saved to database)');
        }
      } else {
        showSuccess('PDF generated successfully!');
      }

    } catch (err) {
      console.error('Error generating PDF:', err);
      if (err.message.includes('Template file not found')) {
        showError('Template file not found. This is a demo form - in production, upload the actual Accord template first.');
      } else if (err.message.includes('Failed to parse')) {
        showError('Invalid PDF template. Please ensure the file is a valid PDF form.');
      } else {
        showError('Failed to generate PDF. Please try again or contact support.');
      }
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleSaveFilledForm = async () => {
    if (!selectedTemplate || !contact) {
      showError('Please select a template and contact.');
      return;
    }
    setLoading(true);
    try {
      await createFilledForm({
        template_id: selectedTemplate.id,
        contact_id: contact.id,
        filled_data: formData,
      });
      showSuccess('Filled form data saved successfully!');
      onClose();
    } catch (err) {
      console.error('Error saving filled form data:', err);
      showError('Failed to save filled form data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendForSignature = async () => {
    if (!pdfPreviewUrl) {
      showError('Please generate the PDF first.');
      return;
    }
    if (!signatureRecipient.email || !signatureRecipient.firstName || !signatureRecipient.lastName) {
      showError('Please provide recipient details for signature.');
      return;
    }

    setLoading(true);
    try {
      const documentName = `${selectedTemplate.name || selectedTemplate.description} - ${contact?.first_name || ''} ${contact?.last_name || ''} - Signed`;
      await sendDocumentForSignature(
        pdfPreviewUrl,
        signatureRecipient.email,
        signatureRecipient.firstName,
        signatureRecipient.lastName,
        documentName
      );
      showSuccess('Document sent for signature successfully!');
      setIsSendForSignatureModalOpen(false);
      onClose();
    } catch (err) {
      console.error('Error sending for signature:', err);
      showError(`Failed to send for signature: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white w-full max-w-4xl mx-4 rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Fill ACCORD Form</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500"><FiX className="w-6 h-6" /></button>
            </div>

            {/* Template Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Template:</label>
              {selectedAccordForm ? (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FiFileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">ACORD {selectedAccordForm.accord}</h4>
                      <p className="text-sm text-gray-600">{selectedAccordForm.description}</p>
                      {selectedAccordForm.state && (
                        <p className="text-xs text-gray-500">State: {selectedAccordForm.state}</p>
                      )}
                      {!selectedAccordForm.file_url && (
                        <p className="text-xs text-orange-600 mt-1">⚠️ Demo mode - actual template file not available</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : selectedTemplate ? (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <FiFileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedTemplate.name}</h4>
                      <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <select
                    onChange={(e) => handleTemplateSelect(templates.find(t => t.id === e.target.value))}
                    value={selectedTemplate?.id || ''}
                    className="w-full border rounded-md p-2"
                    disabled={loading}
                  >
                    <option value="">-- Choose a template --</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                  {loading && <p className="text-sm text-gray-500 mt-1">Loading templates...</p>}
                </>
              )}
            </div>

            {selectedTemplate && (
              <div className="border p-4 rounded-lg mb-4">
                {/* Contact Information Section */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Name:</span>
                      <span className="text-sm text-gray-900 ml-2">
                        {contact ? `${contact.first_name} ${contact.last_name}` : 'No contact selected'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Email:</span>
                      <span className="text-sm text-gray-900 ml-2">{contact?.email || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Phone:</span>
                      <span className="text-sm text-gray-900 ml-2">{contact?.phone || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Address:</span>
                      <span className="text-sm text-gray-900 ml-2">
                        {contact?.address ? `${contact.address}, ${contact.city}, ${contact.state} ${contact.zip}` : 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Policy Information Section */}
                {policies.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Selected Policies ({policies.length})</h4>
                    <div className="space-y-2">
                      {policies.map((policy, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{policy.company}</span>
                            <span className="text-sm text-gray-600 ml-2">({policy.class})</span>
                          </div>
                          <span className="text-xs text-gray-500">{policy.policy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Form Fields */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900">Form Fields</h4>
                  {formFields.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formFields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {renderFormField(field)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        ⚠️ This is a demo form. In production, specific form fields would be loaded based on the selected Accord template.
                      </p>
                      <div className="mt-3 space-y-3">
                        <input
                          type="text"
                          name="demoField1"
                          value={formData.demoField1 || ''}
                          onChange={handleFormChange}
                          className="w-full border rounded-md p-2"
                          placeholder="Demo Field 1"
                        />
                        <input
                          type="text"
                          name="demoField2"
                          value={formData.demoField2 || ''}
                          onChange={handleFormChange}
                          className="w-full border rounded-md p-2"
                          placeholder="Demo Field 2"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Form: ACORD {selectedTemplate.accord_number || 'Unknown'} - {selectedTemplate.description}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={generateFilledPdf}
                      disabled={generatingPdf || !selectedTemplate}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingPdf ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <FiDownload className="mr-2" />
                          Generate PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSaveFilledForm}
                      disabled={loading || !selectedTemplate || !contact}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="mr-2" />
                          Save Form Data
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {pdfPreviewUrl && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">PDF Preview:</h3>
                <iframe src={pdfPreviewUrl} width="100%" height="500px" className="border rounded-md"></iframe>
                <div className="mt-4 flex space-x-3">
                  <a
                    href={pdfPreviewUrl}
                    download={`${selectedTemplate.name || selectedTemplate.description}_${contact?.first_name || 'form'}_${Date.now()}.pdf`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <FiDownload className="mr-2" />
                    Download PDF
                  </a>
                  <button
                    onClick={() => setIsSendForSignatureModalOpen(true)}
                    disabled={loading || !pdfPreviewUrl}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiEdit className="mr-2" />
                    Send for Signature
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>

      {/* Send for Signature Modal */}
      <Dialog open={isSendForSignatureModalOpen} onClose={() => setIsSendForSignatureModalOpen(false)} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white w-full max-w-md mx-4 rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Send for Signature</h3>
              <button onClick={() => setIsSendForSignatureModalOpen(false)} className="text-gray-400 hover:text-gray-500"><FiX className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Recipient Email</label>
                <input
                  type="email"
                  value={signatureRecipient.email}
                  onChange={(e) => setSignatureRecipient({ ...signatureRecipient, email: e.target.value })}
                  className="w-full border rounded-md p-2"
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Recipient First Name</label>
                <input
                  type="text"
                  value={signatureRecipient.firstName}
                  onChange={(e) => setSignatureRecipient({ ...signatureRecipient, firstName: e.target.value })}
                  className="w-full border rounded-md p-2"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Recipient Last Name</label>
                <input
                  type="text"
                  value={signatureRecipient.lastName}
                  onChange={(e) => setSignatureRecipient({ ...signatureRecipient, lastName: e.target.value })}
                  className="w-full border rounded-md p-2"
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsSendForSignatureModalOpen(false)} className="px-4 py-2 text-gray-700">Cancel</button>
              <button onClick={handleSendForSignature} disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-md">
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default AccordFormFiller;