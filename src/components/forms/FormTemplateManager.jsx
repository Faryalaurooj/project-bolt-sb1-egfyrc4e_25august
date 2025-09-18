import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiUpload, FiTrash2, FiEye, FiPlus, FiX } from 'react-icons/fi';
import { getFormTemplates, deleteFormTemplate, createFormTemplate } from '../../services/api';
import { useToast } from '../../hooks/useToast';

function FormTemplateManager({ isOpen, onClose }) {
  const { showSuccess, showError } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newTemplateData, setNewTemplateData] = useState({
    name: '',
    description: '',
    file: null,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const fetchedTemplates = await getFormTemplates();
      setTemplates(fetchedTemplates);
      setError(null);
    } catch (err) {
      console.error('Error fetching form templates:', err);
      showError('Failed to load form templates.');
      setError('Failed to load form templates.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    setNewTemplateData({ ...newTemplateData, file: e.target.files[0] });
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateData.name || !newTemplateData.file) {
      showError('Please provide a name and select a file for the template.');
      return;
    }
    setUploading(true);
    try {
      await createFormTemplate(newTemplateData, newTemplateData.file);
      showSuccess('Form template uploaded successfully!');
      setIsUploadModalOpen(false);
      setNewTemplateData({ name: '', description: '', file: null });
      fetchTemplates();
    } catch (err) {
      console.error('Error uploading form template:', err);
      showError('Failed to upload form template.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteFormTemplate(id);
        showSuccess('Form template deleted successfully!');
        fetchTemplates();
      } catch (err) {
        console.error('Error deleting form template:', err);
        showError('Failed to delete form template.');
      }
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="relative bg-white w-full max-w-3xl mx-4 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Manage Form Templates</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Upload New Template Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mb-4"
          >
            <FiPlus className="mr-2" /> Upload New Template
          </button>

          {loading && <div className="text-center py-4">Loading templates...</div>}
          {error && <div className="text-center py-4 text-red-600">{error}</div>}

          {!loading && !error && templates.length === 0 && (
            <div className="text-center py-4 text-gray-500">No form templates found.</div>
          )}

          {!loading && templates.length > 0 && (
            <div className="space-y-3">
              {templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={template.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="View Template"
                    >
                      <FiEye />
                    </a>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Delete Template"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white w-full max-w-md mx-4 rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Upload New Form Template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Template Name</label>
                <input
                  type="text"
                  value={newTemplateData.name}
                  onChange={(e) => setNewTemplateData({ ...newTemplateData, name: e.target.value })}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  value={newTemplateData.description}
                  onChange={(e) => setNewTemplateData({ ...newTemplateData, description: e.target.value })}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select File (PDF, ACCORD)</label>
                <input
                  type="file"
                  accept="application/pdf,application/octet-stream"
                  onChange={handleFileUpload}
                  className="w-full border rounded-md p-2"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-gray-700">
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                {uploading ? 'Uploading...' : 'Upload Template'}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </Dialog>
  );
}

export default FormTemplateManager;
