import React, { useState, useEffect } from 'react';
import { FiUpload, FiDownload, FiTrash2, FiEye, FiUser, FiCalendar, FiFile, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { createPolicy, createPolicyDocument, getPolicyDocuments, deletePolicyDocument, getFilledForms, initiatePandaDocEditorSession, openExistingDocumentInPandaDoc } from '../../services/api';
import ContactSelectModal from '../contacts/ContactSelectModal';
import SendDocumentEmailModal from '../ivans/SendDocumentEmailModal';
import { useToast } from '../../hooks/useToast';

function IvansTab() {
  const { showSuccess, showError, showInfo } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [dataPdfUrl, setDataPdfUrl] = useState(null);
  const [summaryPdfUrl, setSummaryPdfUrl] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isContactSelectOpen, setIsContactSelectOpen] = useState(false);
  const [extractedPolicyData, setExtractedPolicyData] = useState(null);
  const [showPolicyPreview, setShowPolicyPreview] = useState(false);
  const [editableData, setEditableData] = useState(null);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [policyDocuments, setPolicyDocuments] = useState([]);
  const [filledForms, setFilledForms] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'documents', 'forms'
  const [searchTerm, setSearchTerm] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchAllDocuments();
  }, []);

  const fetchAllDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const [documents, forms] = await Promise.all([
        getPolicyDocuments(),
        getFilledForms()
      ]);
      setPolicyDocuments(documents || []);
      setFilledForms(forms || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      showError('Failed to load documents');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const parseIvansData = async (content) => {
    try {
      const lines = content.split(/\r?\n/).filter(line => line.trim());
      const data = [];
      let headers = [];

      let delimiter;
      const firstLine = lines[0];
      if (firstLine.includes('???')) {
        delimiter = '???';
      } else if (firstLine.includes('|')) {
        delimiter = '|';
      } else if (firstLine.includes(',')) {
        delimiter = ',';
      } else if (firstLine.includes('\t')) {
        delimiter = '\t';
      } else {
        delimiter = /\s{3,}/;
      }

      lines.forEach((line, index) => {
        let parts;
        if (typeof delimiter === 'string') {
          parts = line.split(delimiter);
        } else {
          parts = line.split(delimiter);
        }
        
        parts = parts
          .map(part => part.trim())
          .filter(part => part.length > 0);

        if (parts.length > 0) {
          if (index === 0) {
            if (parts.every(part => isNaN(parseFloat(part)) || part.length > 10)) {
              headers = parts;
              return;
            }
          }
          data.push(parts);
        }
      });

      if (headers.length === 0 && data.length > 0) {
        const maxColumns = Math.max(...data.map(row => row.length));
        headers = Array.from({ length: maxColumns }, (_, i) => `Column ${i + 1}`);
      }

      const normalizedData = data.map(row => {
        const normalizedRow = [...row];
        while (normalizedRow.length < headers.length) {
          normalizedRow.push('');
        }
        return normalizedRow.slice(0, headers.length);
      });

      return { headers, data: normalizedData };
    } catch (error) {
      console.error('Error parsing IVANS data:', error);
      throw new Error('Failed to parse the file content');
    }
  };

  const extractPolicyInfo = (content, filename) => {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const policyData = {
        policy_type: 'Homeowners',
        company: 'Unknown',
        policy_number: '',
        effective_date: null,
        expiration_date: null,
        premium: null,
        pfm_level: '',
        policy_forms: '',
        raw_data: { 
          original_content: content.length > 10240 ? content.substring(0, 10240) + '...[TRUNCATED]' : content, 
          filename 
        }
      };

      const policyNumberMatch = filename.match(/([A-Z0-9]{6,})/);
      if (policyNumberMatch) {
        policyData.policy_number = policyNumberMatch[1];
      }

      for (const line of lines) {
        const upperLine = line.toUpperCase();
        
        if (upperLine.includes('IBM') || upperLine.includes('COMPANY')) {
          policyData.company = 'IBM';
        }
        
        const premiumMatch = line.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (premiumMatch && !policyData.premium) {
          policyData.premium = parseFloat(premiumMatch[1].replace(',', ''));
        }
        
        const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/);
        if (dateMatch && !policyData.effective_date) {
          const dateStr = dateMatch[1];
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            policyData.effective_date = date.toISOString().split('T')[0];
            const expDate = new Date(date);
            expDate.setFullYear(expDate.getFullYear() + 1);
            policyData.expiration_date = expDate.toISOString().split('T')[0];
          }
        }
        
        if (upperLine.includes('HOMEOWNER') || upperLine.includes('PROPERTY')) {
          policyData.policy_type = 'Homeowners';
          policyData.policy_forms = 'Value Plus Property & Liability Coverages';
        } else if (upperLine.includes('AUTO') || upperLine.includes('VEHICLE')) {
          policyData.policy_type = 'Auto';
          policyData.policy_forms = 'Auto Coverage';
        } else if (upperLine.includes('LIFE')) {
          policyData.policy_type = 'Life';
          policyData.policy_forms = 'Life Insurance Coverage';
        }
        
        const pfmMatch = line.match(/\b([A-Z]{1,3})\b/);
        if (pfmMatch && !policyData.pfm_level) {
          policyData.pfm_level = pfmMatch[1];
        }
      }

      return policyData;
    } catch (error) {
      console.error('Error extracting policy info:', error);
      return null;
    }
  };

  const generatePdf = (parsedData) => {
    try {
      const { headers, data } = parsedData;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      pdf.setProperties({
        title: 'IVANS Data Report',
        subject: 'Policy Data Information',
        creator: 'Modern CRM',
        author: 'System Generated'
      });

      pdf.setFontSize(16);
      pdf.text('IVANS Data Report', pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

      pdf.setFontSize(10);
      pdf.text(
        `Generated on ${new Date().toLocaleString()}`,
        pdf.internal.pageSize.getWidth() / 2,
        22,
        { align: 'center' }
      );

      const cleanedData = data.map(row => 
        row.map(cell => {
          if (typeof cell === 'string') {
            return cell.trim().replace(/\s+/g, ' ');
          }
          return cell || '';
        })
      );

      pdf.autoTable({
        head: [headers],
        body: cleanedData,
        startY: 30,
        margin: { top: 30, right: 10, bottom: 10, left: 10 },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak',
          font: 'helvetica',
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left',
          valign: 'middle'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        bodyStyles: {
          valign: 'top',
          halign: 'left'
        }
      });

      return pdf;
    } catch (error) {
      console.error('Error generating data PDF:', error);
      throw new Error('Failed to generate data PDF');
    }
  };

  const generateSummaryPdf = (originalContent, filename, policyData = null) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      pdf.setProperties({
        title: `IVANS Policy Summary - ${filename}`,
        subject: 'Policy Information Summary',
        creator: 'Modern CRM',
        author: 'System Generated'
      });

      let yPos = 20;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("IVANS Policy Summary", pdf.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`For file: ${filename}`, pdf.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
      yPos += 5;
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, pdf.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
      yPos += 20;

      const policyInfo = policyData ? {
        "Policy Type": policyData.policy_type || "Unknown",
        "Company": policyData.company || "Unknown",
        "Policy Number": policyData.policy_number || "Not found",
        "Effective Date": policyData.effective_date || "Not specified",
        "Expiration Date": policyData.expiration_date || "Not specified",
        "Total Written Premium": policyData.premium ? `$${policyData.premium.toLocaleString()}` : "Not specified",
        "PFM Level": policyData.pfm_level || "Not specified",
        "Policy Form(s)": policyData.policy_forms || "Not specified"
      } : {};

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("Insurance Policy Information:", 30, yPos);
      yPos += 10;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      for (const [key, value] of Object.entries(policyInfo)) {
        pdf.text(`${key}:`, 30, yPos);
        pdf.text(value, 80, yPos);
        yPos += 7;
      }

      return pdf.output('blob');
    } catch (error) {
      console.error('Error generating summary PDF:', error);
      throw new Error('Failed to generate summary PDF');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setDataPdfUrl(null);
    setSummaryPdfUrl(null);
    setExtractedPolicyData(null);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          const parsedData = await parseIvansData(content);
          
          if (parsedData.data.length === 0) {
            throw new Error('No valid data found in the file');
          }
          
          const policyData = extractPolicyInfo(content, file.name);
          setExtractedPolicyData(policyData);
          setEditableData(parsedData);
          setShowDataPreview(true);
          
          const dataPdf = generatePdf(parsedData);
          const dataPdfBlob = dataPdf.output('blob');
          const dataPdfUrl = URL.createObjectURL(dataPdfBlob);
          
          const summaryPdfBlob = generateSummaryPdf(content, file.name, policyData);
          const summaryPdfUrl = URL.createObjectURL(summaryPdfBlob);
          
          setDataPdfUrl(dataPdfUrl);
          setSummaryPdfUrl(summaryPdfUrl);
          
          // Auto-save generated documents to database
          if (selectedContact) {
            try {
              const dataFile = new File([dataPdfBlob], `${file.name}_data_report.pdf`, { type: 'application/pdf' });
              const summaryFile = new File([summaryPdfBlob], `${file.name}_summary_report.pdf`, { type: 'application/pdf' });
              
              await createPolicyDocument(selectedContact.id, dataFile);
              await createPolicyDocument(selectedContact.id, summaryFile);
              
              showSuccess('Documents generated and saved successfully!');
              fetchAllDocuments(); // Refresh the documents list
            } catch (saveError) {
              console.warn('Failed to auto-save documents:', saveError);
              showSuccess('Documents generated successfully! Please save manually.');
            }
          }
          
        } catch (err) {
          console.error('Processing error:', err);
          setError('Error processing the file: ' + err.message);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading the file');
      };
      
      const firstBytes = await file.slice(0, 4).arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      try {
        decoder.decode(firstBytes);
        reader.readAsText(file, 'utf-8');
      } catch {
        reader.readAsText(file, 'windows-1252');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Error processing the file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavePolicyData = async () => {
    if (!extractedPolicyData || !selectedContact) {
      showError('Please select a contact and ensure policy data is extracted');
      return;
    }

    try {
      const policyDataToSave = {
        ...extractedPolicyData,
        contact_id: selectedContact.id
      };

      await createPolicy(policyDataToSave);
      
      // Save the generated PDFs as policy documents
      if (dataPdfUrl && summaryPdfUrl) {
        const dataResponse = await fetch(dataPdfUrl);
        const dataBlob = await dataResponse.blob();
        const dataFile = new File([dataBlob], `${extractedPolicyData.policy_number || 'policy'}_data.pdf`, { type: 'application/pdf' });
        
        const summaryResponse = await fetch(summaryPdfUrl);
        const summaryBlob = await summaryResponse.blob();
        const summaryFile = new File([summaryBlob], `${extractedPolicyData.policy_number || 'policy'}_summary.pdf`, { type: 'application/pdf' });
        
        await createPolicyDocument(selectedContact.id, dataFile);
        await createPolicyDocument(selectedContact.id, summaryFile);
        
        await fetchAllDocuments();
      }
      
      showSuccess('Policy data and documents saved successfully!');
      setShowPolicyPreview(false);
      setExtractedPolicyData(null);
      setSelectedContact(null);
      setDataPdfUrl(null);
      setSummaryPdfUrl(null);
    } catch (error) {
      console.error('Error saving policy data:', error);
      showError('Failed to save policy data: ' + error.message);
    }
  };

  const handleDeleteDocument = async (documentId, documentType) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        if (documentType === 'policy') {
          await deletePolicyDocument(documentId);
        } else {
          // Implement deleteFilledForm if needed
          showInfo('Delete filled form functionality coming soon');
          return;
        }
        await fetchAllDocuments();
        showSuccess('Document deleted successfully');
      } catch (error) {
        console.error('Error deleting document:', error);
        showError('Failed to delete document');
      }
    }
  };

  const handleEmailDocument = (document, documentType) => {
    setSelectedDocument({ ...document, documentType });
    setIsEmailModalOpen(true);
  };

  const handleOpenInPandaDoc = async (document) => {
    try {
      showInfo('🔄 Opening document in PandaDoc editor...');
      
      const documentName = `${document.file_name || 'Document'} - Edited - ${new Date().toLocaleDateString()}`;
      
      // This would call a new API function to open existing document in PandaDoc
      // For now, we'll show a placeholder
      showInfo('📄 PandaDoc integration for existing documents coming soon! This will allow you to edit and sign existing PDFs in PandaDoc.');
      
      // Placeholder for future implementation:
      // const response = await openExistingDocumentInPandaDoc(document.file_url, documentName, document.contact_id);
      // window.open(response.editor_url, '_blank');
      
    } catch (error) {
      console.error('Error opening document in PandaDoc:', error);
      showError('Failed to open document in PandaDoc');
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setIsContactSelectOpen(false);
  };

  const filteredDocuments = policyDocuments.filter(doc =>
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.contact_name && doc.contact_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredForms = filledForms.filter(form =>
    (form.template_name && form.template_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (form.contact_name && form.contact_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderUploadTab = () => (
    <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload IVANS Document</h3>
          <p className="text-sm text-gray-500 mb-4">
            Select a .dat, .txt, .form, or .accord file downloaded from IVANS to convert it to PDF format.
            Two PDFs will be generated: a detailed data report and a summary document.
          </p>
        </div>

        <div className="flex items-center justify-center w-full">
          <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-200">
            <FiUpload className="w-8 h-8" />
            <span className="mt-2 text-base">Select IVANS file</span>
            <input
              type="file"
              className="hidden"
              accept=".dat,.txt,.form,.accord"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
          </label>
        </div>
        
        {isProcessing && (
          <div className="text-center text-gray-600">
            <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
            <p>Processing file and generating PDFs...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {(dataPdfUrl || summaryPdfUrl) && (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Documents Generated Successfully!</h4>
              <p className="text-sm text-gray-500 mb-4">
                Two PDF documents have been created from your IVANS file.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataPdfUrl && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">📊 Data Report</h5>
                  <p className="text-sm text-blue-700 mb-3">
                    Complete tabular data with all columns and rows from your IVANS file.
                  </p>
                  <a
                    href={dataPdfUrl}
                    download="ivans_data_report.pdf"
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                  >
                    <FiDownload className="mr-2" />
                    Download Data PDF
                  </a>
                </div>
              )}
              
              {summaryPdfUrl && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h5 className="font-medium text-purple-900 mb-2">📋 Summary Report</h5>
                  <p className="text-sm text-purple-700 mb-3">
                    Easy-to-read summary with policy information and content overview.
                  </p>
                  <a
                    href={summaryPdfUrl}
                    download="ivans_summary_report.pdf"
                    className="w-full flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors duration-200"
                  >
                    <FiDownload className="mr-2" />
                    Download Summary PDF
                  </a>
                </div>
              )}
            </div>
            
            {extractedPolicyData && (
              <div className="text-center">
                <button
                  onClick={() => setShowPolicyPreview(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Policy Data
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Policy Documents</h3>
          <p className="text-gray-600 text-sm">Generated and uploaded policy documents</p>
        </div>
        <button
          onClick={fetchAllDocuments}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh documents"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400 w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search documents by name or contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all p-3"
        />
      </div>

      {documentsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Document</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <tr key={document.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiFile className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{document.file_name}</div>
                        <div className="text-sm text-gray-500">
                          {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </div>
                      </div>
                      </div>
                    </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {document.contact_name || 'No contact'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FiUser className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {document.uploaded_by_name || 'System'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(document.created_at).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <a
                        href={document.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View Document"
                      >
                        <FiEye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleOpenInPandaDoc(document)}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                        title="Edit/Sign in PandaDoc"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEmailDocument(document, 'policy')}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                        title="Email Document"
                      >
                        <FiMail className="w-4 h-4" />
                      </button>
                      <a
                        href={document.file_url}
                        download={document.file_name}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download Document"
                      >
                        <FiDownload className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(document.id, 'policy')}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Document"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FiFile className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'No documents match your search criteria' : 'Upload your first IVANS file to generate documents'}
          </p>
        </div>
      )}
    </div>
  );

  const renderFormsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Filled Forms</h3>
          <p className="text-gray-600 text-sm">Completed Accord forms and templates</p>
        </div>
        <button
          onClick={fetchAllDocuments}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh forms"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>
      </div>

      {documentsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full mb-2"></div>
          <p className="text-gray-600">Loading forms...</p>
        </div>
      ) : filteredForms.length > 0 ? (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Form</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Template</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredForms.map((form) => (
                <tr key={form.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiFile className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Form #{form.id}</div>
                        <div className="text-sm text-gray-500">Filled Form</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {form.template_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {form.contact_name || 'No contact'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FiUser className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">System</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(form.created_at).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {form.generated_pdf_url && (
                        <a
                          href={form.generated_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Form"
                        >
                          <FiEye className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleOpenInPandaDoc(form)}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                        title="Edit/Sign in PandaDoc"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEmailDocument(form, 'form')}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                        title="Email Form"
                      >
                        <FiMail className="w-4 h-4" />
                      </button>
                      {form.generated_pdf_url && (
                        <a
                          href={form.generated_pdf_url}
                          download={`form_${form.id}.pdf`}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download Form"
                        >
                          <FiDownload className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteDocument(form.id, 'form')}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Form"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FiFile className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No filled forms found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'No forms match your search criteria' : 'Complete your first Accord form to see it here'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📄 IVANS Document Management</h1>
            <p className="text-gray-600">Upload IVANS files, manage generated reports, and work with Accord forms</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{policyDocuments.length}</div>
              <div className="text-sm text-gray-500">Policy Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{filledForms.length}</div>
              <div className="text-sm text-gray-500">Filled Forms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiUpload className="w-4 h-4" />
              <span>Upload IVANS Files</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'documents'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiFile className="w-4 h-4" />
              <span>Policy Documents ({policyDocuments.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'forms'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiFile className="w-4 h-4" />
              <span>Filled Forms ({filledForms.length})</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && renderUploadTab()}
      {activeTab === 'documents' && renderDocumentsTab()}
      {activeTab === 'forms' && renderFormsTab()}

      {/* Policy Data Preview Modal */}
      {showPolicyPreview && extractedPolicyData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Review Extracted Policy Data</h3>
              <button
                onClick={() => setShowPolicyPreview(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Contact Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Associate with Contact
                </label>
                {selectedContact ? (
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {selectedContact.first_name?.[0]}{selectedContact.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {selectedContact.first_name} {selectedContact.last_name}
                        </div>
                        {selectedContact.email && (
                          <div className="text-xs text-gray-500">{selectedContact.email}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsContactSelectOpen(true)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsContactSelectOpen(true)}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <FiUser className="mr-2" />
                    Select Contact for this Policy
                  </button>
                )}
              </div>

              {/* Extracted Policy Data Preview */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Extracted Policy Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Policy Type:</span>
                      <span className="text-sm text-gray-900 ml-2">{extractedPolicyData.policy_type}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Company:</span>
                      <span className="text-sm text-gray-900 ml-2">{extractedPolicyData.company}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Policy Number:</span>
                      <span className="text-sm text-gray-900 ml-2">{extractedPolicyData.policy_number || 'Not found'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Premium:</span>
                      <span className="text-sm text-gray-900 ml-2">
                        {extractedPolicyData.premium ? `$${extractedPolicyData.premium.toLocaleString()}` : 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Effective Date:</span>
                      <span className="text-sm text-gray-900 ml-2">{extractedPolicyData.effective_date || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Expiration Date:</span>
                      <span className="text-sm text-gray-900 ml-2">{extractedPolicyData.expiration_date || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPolicyPreview(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Skip Saving
                </button>
                <button
                  onClick={handleSavePolicyData}
                  disabled={!selectedContact}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Policy Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Selection Modal */}
      <ContactSelectModal
        isOpen={isContactSelectOpen}
        onClose={() => setIsContactSelectOpen(false)}
        onContactSelect={handleContactSelect}
      />

      {/* Email Document Modal */}
      <SendDocumentEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        document={selectedDocument}
        onEmailSent={() => {
          setIsEmailModalOpen(false);
          setSelectedDocument(null);
          showSuccess('Document emailed successfully!');
        }}
      />
    </div>
  );
}

export default IvansTab;
