import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FiUpload, FiDownload } from 'react-icons/fi';

function IvansUpload({ onUpload }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const parseIvansData = async (content) => {
    try {
      // Split content into lines and remove empty lines
      const lines = content.split('\n').filter(line => line.trim());
      const data = [];
      let headers = [];

      // Try to detect the delimiter
      const firstLine = lines[0];
      let delimiter;
      if (firstLine.includes('???')) {
        delimiter = '???';
      } else if (firstLine.includes('|')) {
        delimiter = '|';
      } else if (firstLine.includes('\t')) {
        delimiter = '\t';
      } else {
        delimiter = /\s{2,}/; // Two or more spaces
      }

      // Process each line
      lines.forEach((line, index) => {
        const parts = (typeof delimiter === 'string' ? 
          line.split(delimiter) : 
          line.split(delimiter)
        ).map(part => part.trim()).filter(Boolean);

        if (parts.length > 0) {
          if (index === 0) {
            // Use first row as headers if it contains text fields
            if (parts.every(part => isNaN(part))) {
              headers = parts;
              return;
            }
          }
          data.push(parts);
        }
      });

      // If no headers were detected, generate numeric headers
      if (headers.length === 0) {
        const maxColumns = Math.max(...data.map(row => row.length));
        headers = Array.from({ length: maxColumns }, (_, i) => `Field ${i + 1}`);
      }

      return { headers, data };
    } catch (error) {
      console.error('Error parsing IVANS data:', error);
      throw new Error('Failed to parse the file content');
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

      // Add metadata
      pdf.setProperties({
        title: 'IVANS Policy Report',
        subject: 'Policy Information',
        creator: 'Modern CRM',
        author: 'System Generated'
      });

      // Add title
      pdf.setFontSize(16);
      pdf.text('IVANS Policy Report', pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

      // Add timestamp
      pdf.setFontSize(10);
      pdf.text(
        `Generated on ${new Date().toLocaleString()}`,
        pdf.internal.pageSize.getWidth() / 2,
        22,
        { align: 'center' }
      );

      // Calculate optimal column widths
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margins = 20; // 10mm margins on each side
      const availableWidth = pageWidth - (margins * 2);
      const minColWidth = 20; // Minimum column width in mm
      
      let columnWidths = {};
      headers.forEach((header, index) => {
        // Get maximum width needed for this column
        const maxContentLength = Math.max(
          header.length,
          ...data.map(row => (row[index] || '').toString().length)
        );
        
        // Calculate width (roughly 2mm per character)
        columnWidths[index] = Math.max(minColWidth, Math.min(maxContentLength * 2, availableWidth / headers.length));
      });

      // Add table
      pdf.autoTable({
        head: [headers],
        body: data,
        startY: 30,
        margin: { top: 30, right: 10, bottom: 10, left: 10 },
        columnStyles: columnWidths,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          font: 'helvetica'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'left'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        didDrawPage: function(data) {
          // Add page number at the bottom
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
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setPreviewUrl(null);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          const parsedData = await parseIvansData(content);
          
          if (parsedData.data.length === 0) {
            throw new Error('No valid data found in the file');
          }
          
          const pdf = generatePdf(parsedData);
          const pdfBlob = pdf.output('blob');
          const pdfUrl = URL.createObjectURL(pdfBlob);
          
          setPreviewUrl(pdfUrl);
          
          onUpload({
            name: file.name.replace(/\.(dat|txt)$/, '.pdf'),
            url: pdfUrl,
            type: 'application/pdf',
            blob: pdfBlob
          });
          
        } catch (err) {
          console.error('Processing error:', err);
          setError('Error processing the file: ' + err.message);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading the file');
      };
      
      // Try to detect the encoding
      const firstBytes = await file.slice(0, 4).arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      try {
        decoder.decode(firstBytes);
        reader.readAsText(file, 'utf-8');
      } catch {
        // If UTF-8 fails, try Windows-1252 (common for IVANS files)
        reader.readAsText(file, 'windows-1252');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Error processing the file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = 'ivans_report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors duration-200">
          <FiUpload className="w-8 h-8" />
          <span className="mt-2 text-base">Select IVANS file</span>
          <input
            type="file"
            className="hidden"
            accept=".dat,.txt"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
        </label>
      </div>
      
      {isProcessing && (
        <div className="text-center text-gray-600">
          <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <p>Processing file...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {previewUrl && (
        <div className="flex justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
          >
            <FiDownload className="mr-2" />
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default IvansUpload;