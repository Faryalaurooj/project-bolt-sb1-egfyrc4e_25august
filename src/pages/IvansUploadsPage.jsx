import React, { useState } from 'react';
import { FiUpload, FiDownload, FiUser, FiSearch, FiX, FiPlus } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { createPolicy, getContacts } from '../services/api';
import ContactSelectModal from '../components/contacts/ContactSelectModal';

function IvansUploadsPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [dataPdfUrl, setDataPdfUrl] = useState(null);
  const [summaryPdfUrl, setSummaryPdfUrl] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isContactSelectOpen, setIsContactSelectOpen] = useState(false);
  const [extractedPolicyData, setExtractedPolicyData] = useState(null);
  const [showPolicyPreview, setShowPolicyPreview] = useState(false);
  const [parsedTableData, setParsedTableData] = useState(null);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [editableData, setEditableData] = useState(null);

  const parseIvansData = async (content) => {
    try {
      // Split content and clean lines more thoroughly
      const lines = content.split(/\r?\n/).filter(line => line.trim());
      const data = [];
      let headers = [];

      // Enhanced delimiter detection
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
        // Look for consistent spacing patterns
        delimiter = /\s{3,}/; // Three or more spaces
      }

      lines.forEach((line, index) => {
        let parts;
        if (typeof delimiter === 'string') {
          parts = line.split(delimiter);
        } else {
          parts = line.split(delimiter);
        }
        
        // Clean and filter parts
        parts = parts
          .map(part => part.trim())
          .filter(part => part.length > 0);

        if (parts.length > 0) {
          if (index === 0) {
            // Check if first row contains headers (non-numeric values)
            if (parts.every(part => isNaN(parseFloat(part)) || part.length > 10)) {
              headers = parts;
              return;
            }
          }
          data.push(parts);
        }
      });

      // Generate headers if none were detected
      if (headers.length === 0 && data.length > 0) {
        const maxColumns = Math.max(...data.map(row => row.length));
        headers = Array.from({ length: maxColumns }, (_, i) => `Column ${i + 1}`);
      }

      // Ensure all data rows have the same number of columns as headers
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

  // Extract policy information from IVANS content
  const extractPolicyInfo = (content, filename) => {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const policyData = {
        policy_type: 'Homeowners', // Default, can be enhanced with parsing
        company: 'Unknown',
        policy_number: '',
        effective_date: null,
        expiration_date: null,
        premium: null,
        pfm_level: '',
        policy_forms: '',
        raw_data: { original_content: content, filename }
      };

      // Extract policy number from filename if it follows IVANS pattern
      const policyNumberMatch = filename.match(/([A-Z0-9]{6,})/);
      if (policyNumberMatch) {
        policyData.policy_number = policyNumberMatch[1];
      }

      // Parse content for key information
      for (const line of lines) {
        const upperLine = line.toUpperCase();
        
        // Look for company names
        if (upperLine.includes('IBM') || upperLine.includes('COMPANY')) {
          policyData.company = 'IBM';
        }
        
        // Look for premium amounts
        const premiumMatch = line.match(/\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (premiumMatch && !policyData.premium) {
          policyData.premium = parseFloat(premiumMatch[1].replace(',', ''));
        }
        
        // Look for dates (MM/DD/YYYY or YYYY-MM-DD format)
        const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/);
        if (dateMatch && !policyData.effective_date) {
          const dateStr = dateMatch[1];
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            policyData.effective_date = date.toISOString().split('T')[0];
            // Set expiration date to one year later
            const expDate = new Date(date);
            expDate.setFullYear(expDate.getFullYear() + 1);
            policyData.expiration_date = expDate.toISOString().split('T')[0];
          }
        }
        
        // Look for policy forms or coverage types
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
        
        // Look for PFM level or similar codes
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

      // Clean and prepare data for better readability
      const cleanedData = data.map(row => 
        row.map(cell => {
          if (typeof cell === 'string') {
            // Remove extra whitespace and normalize text
            return cell.trim().replace(/\s+/g, ' ');
          }
          return cell || '';
        })
      );

      // Calculate optimal column widths based on content
      const calculateColumnWidths = (headers, data) => {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margins = 20;
        const availableWidth = pageWidth - (margins * 2);
        
        // Calculate content-based widths
        const columnWidths = headers.map((header, index) => {
          const headerLength = header.length;
          const maxContentLength = Math.max(
            ...data.map(row => String(row[index] || '').length)
          );
          const maxLength = Math.max(headerLength, maxContentLength);
          
          // Base width calculation (roughly 2mm per character, with min/max limits)
          return Math.max(15, Math.min(maxLength * 1.8, availableWidth / headers.length * 1.5));
        });
        
        // Normalize widths to fit available space
        const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
        if (totalWidth > availableWidth) {
          const scaleFactor = availableWidth / totalWidth;
          return columnWidths.map(width => width * scaleFactor);
        }
        
        return columnWidths;
      };

      const columnWidths = calculateColumnWidths(headers, cleanedData);
      const columnStyles = {};
      columnWidths.forEach((width, index) => {
        columnStyles[index] = { cellWidth: width };
      });

      pdf.autoTable({
        head: [headers],
        body: cleanedData,
        startY: 30,
        margin: { top: 30, right: 10, bottom: 10, left: 10 },
        columnStyles: columnStyles,
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
        },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1,
        didDrawPage: function(data) {
          pdf.setFontSize(8);
          pdf.text(
            `Page ${data.pageNumber} of ${pdf.internal.getNumberOfPages()}`,
            pdf.internal.pageSize.getWidth() / 2,
            pdf.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
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

      // Title
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

      // Use extracted policy data or fallback to default
      const policyInfo = policyData ? {
        "Policy Type": policyData.policy_type || "Unknown",
        "Company": policyData.company || "Unknown",
        "Policy Number": policyData.policy_number || "Not found",
        "Effective Date": policyData.effective_date || "Not specified",
        "Expiration Date": policyData.expiration_date || "Not specified",
        "Total Written Premium": policyData.premium ? `$${policyData.premium.toLocaleString()}` : "Not specified",
        "PFM Level": policyData.pfm_level || "Not specified",
        "Policy Form(s)": policyData.policy_forms || "Not specified"
      } : {
        "Policy Type": "Homeowners",
        "Company": "IBM (placeholder)",
        "Policy Number": "IBMYX67JN9",
        "Effective Date": "July 15, 2025",
        "Expiration Date": "July 15, 2026",
        "Total Written Premium": "$1,347.00",
        "PFM Level": "BL (placeholder)",
        "Policy Form(s)": "Value Plus Property & Liability Coverages"
      };

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
      yPos += 15;

      // Add separator line
      pdf.setLineWidth(0.5);
      pdf.line(30, yPos, pdf.internal.pageSize.getWidth() - 30, yPos);
      yPos += 10;

      // Summary from content
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("Summary of Original Content:", 30, yPos);
      yPos += 10;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      const summaryText = originalContent.substring(0, 1000) + (originalContent.length > 1000 ? '...' : '');
      const splitText = pdf.splitTextToSize(summaryText, pdf.internal.pageSize.getWidth() - 60);
      pdf.text(splitText, 30, yPos);

      // Add footer
      pdf.setFontSize(8);
      pdf.text(
        `Page ${pdf.internal.getCurrentPageInfo().pageNumber}`,
        pdf.internal.pageSize.getWidth() / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );

      return pdf.output('blob');
    } catch (error) {
      console.error('Error generating summary PDF:', error);
      throw new Error('Failed to generate summary PDF');
    }
  };

  const handleSavePolicyData = async () => {
    if (!extractedPolicyData || !selectedContact) {
      alert('Please select a contact and ensure policy data is extracted');
      return;
    }

    try {
      const policyDataToSave = {
        ...extractedPolicyData,
        contact_id: selectedContact.id
      };

      await createPolicy(policyDataToSave);
      alert('Policy data saved successfully!');
      setShowPolicyPreview(false);
      setExtractedPolicyData(null);
      setSelectedContact(null);
    } catch (error) {
      console.error('Error saving policy data:', error);
      alert('Failed to save policy data: ' + error.message);
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
          
          // Extract policy information
          const policyData = extractPolicyInfo(content, file.name);
          setExtractedPolicyData(policyData);
          
          // Store parsed data for preview and editing
          setParsedTableData(parsedData);
          setEditableData(parsedData);
          setShowDataPreview(true);
          
          // Generate data PDF
          const dataPdf = generatePdf(parsedData);
          const dataPdfBlob = dataPdf.output('blob');
          const dataPdfUrl = URL.createObjectURL(dataPdfBlob);
          
          // Generate summary PDF
          const summaryPdfBlob = generateSummaryPdf(content, file.name, policyData);
          const summaryPdfUrl = URL.createObjectURL(summaryPdfBlob);
          
          setDataPdfUrl(dataPdfUrl);
          setSummaryPdfUrl(summaryPdfUrl);
          
          
          // Store the documents in localStorage
          const ivansDataDoc = {
            id: Date.now().toString(),
            name: file.name.replace(/\.(dat|txt|form|accord)$/, '_data.pdf'),
            url: dataPdfUrl,
            type: 'application/pdf',
            blob: dataPdfBlob,
            uploadDate: new Date().toISOString(),
            docType: 'data'
          };

          const ivansSummaryDoc = {
            id: (Date.now() + 1).toString(),
            name: file.name.replace(/\.(dat|txt|form|accord)$/, '_summary.pdf'),
            url: summaryPdfUrl,
            type: 'application/pdf',
            blob: summaryPdfBlob,
            uploadDate: new Date().toISOString(),
            docType: 'summary'
          };

          const existingDocs = JSON.parse(localStorage.getItem('ivansDocuments') || '[]');
          localStorage.setItem('ivansDocuments', JSON.stringify([...existingDocs, ivansDataDoc, ivansSummaryDoc]));
          
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

  const handleDownloadDataPdf = () => {
    if (dataPdfUrl) {
      const link = document.createElement('a');
      link.href = dataPdfUrl;
      link.download = 'ivans_data_report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadSummaryPdf = () => {
    if (summaryPdfUrl) {
      const link = document.createElement('a');
      link.href = summaryPdfUrl;
      link.download = 'ivans_summary_report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
  };

  const handleDataEdit = (rowIndex, colIndex, newValue) => {
    if (!editableData) return;
    
    const updatedData = { ...editableData };
    updatedData.data[rowIndex][colIndex] = newValue;
    setEditableData(updatedData);
  };

  const handleAddRow = () => {
    if (!editableData) return;
    
    const newRow = new Array(editableData.headers.length).fill('');
    const updatedData = {
      ...editableData,
      data: [...editableData.data, newRow]
    };
    setEditableData(updatedData);
  };

  const handleRegeneratePDF = () => {
    if (!editableData) return;
    
    try {
      const pdf = generatePdf(editableData);
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setDataPdfUrl(pdfUrl);
      
      // Update localStorage document
      const existingDocs = JSON.parse(localStorage.getItem('ivansDocuments') || '[]');
      const updatedDocs = existingDocs.map(doc => {
        if (doc.docType === 'data') {
          return { ...doc, url: pdfUrl, blob: pdfBlob };
        }
        return doc;
      });
      localStorage.setItem('ivansDocuments', JSON.stringify(updatedDocs));
      
      alert('PDF regenerated with your changes!');
    } catch (error) {
      console.error('Error regenerating PDF:', error);
      alert('Failed to regenerate PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">IVANS Uploads</h2>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload IVANS Document</h3>
            <p className="text-sm text-gray-500 mb-4">
              Select a .dat, .txt, .form, or .accord file downloaded from IVANS to convert it to PDF format.
              Two PDFs will be generated: a detailed data report and a summary document for easy understanding.
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
                    <button
                      onClick={handleDownloadDataPdf}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                    >
                      <FiDownload className="mr-2" />
                      Download Data PDF
                    </button>
                  </div>
                )}
                
                {summaryPdfUrl && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h5 className="font-medium text-purple-900 mb-2">📋 Summary Report</h5>
                    <p className="text-sm text-purple-700 mb-3">
                      Easy-to-read summary with policy information and content overview.
                    </p>
                    <button
                      onClick={handleDownloadSummaryPdf}
                      className="w-full flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors duration-200"
                    >
                      <FiDownload className="mr-2" />
                      Download Summary PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Preview and Edit Modal */}
      {showDataPreview && editableData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Review and Edit IVANS Data</h3>
              <button
                onClick={() => setShowDataPreview(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Review the extracted data below. You can edit any cell by clicking on it.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddRow}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    Add Row
                  </button>
                  <button
                    onClick={handleRegeneratePDF}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Regenerate PDF
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {editableData.headers.map((header, index) => (
                        <th
                          key={index}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editableData.data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {row.map((cell, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200"
                          >
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => handleDataEdit(rowIndex, colIndex, e.target.value)}
                              className="w-full border-none focus:ring-0 focus:outline-none bg-transparent"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDataPreview(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => setShowPolicyPreview(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Continue to Policy Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy Data Preview and Contact Selection Modal */}
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
                <h4 className="text-lg font-medium text-gray-900 mb-3">Extracted Policy Information</h4>
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
                <p className="text-xs text-gray-500 mt-2">
                  Review the extracted information. You can edit this data after saving if needed.
                </p>
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
    </div>
  );
}

export default IvansUploadsPage;