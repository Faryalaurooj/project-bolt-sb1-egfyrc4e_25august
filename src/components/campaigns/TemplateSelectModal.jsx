import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { getEmailTemplates, deleteEmailTemplate } from '../../services/api';

function TemplateSelectModal({ isOpen, onClose, onSelect }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmailTemplates();
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteEmailTemplate(templateId);
        setTemplates(templates.filter(t => t.id !== templateId));
      } catch (err) {
        console.error('Error deleting template:', err);
        alert('Failed to delete template');
      }
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white w-full max-w-4xl mx-4 rounded-lg shadow-xl">
          <div className="flex justify-between items-center p-6 border-b">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Select Email Template
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                <p className="text-gray-600 ml-2">Loading templates...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchTemplates}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => onSelect(template)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {template.title}
                        </h3>
                        {template.subject && (
                          <p className="text-sm text-gray-600 mb-2">
                            Subject: {template.subject}
                          </p>
                        )}
                        <div 
                          className="text-sm text-gray-500 line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: template.content?.length > 100 
                              ? `${template.content.slice(0, 100)}...` 
                              : template.content
                          }}
                        />
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleDelete(template.id, e)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Template"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      {searchTerm ? 'No templates found matching your search.' : 'No templates available.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end p-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default TemplateSelectModal;