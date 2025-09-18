import React, { useState } from 'react';
import { FiUpload, FiDownload, FiFile, FiTrash2, FiEye, FiEdit3, FiPlus } from 'react-icons/fi';

const Attachments = () => {
  const [attachments, setAttachments] = useState([
    {
      id: 1,
      name: 'Policy Document Template.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadedDate: '2024-01-15',
      category: 'Policy Documents',
      description: 'Standard policy document template'
    },
    {
      id: 2,
      name: 'Commission Structure.xlsx',
      type: 'Excel',
      size: '156 KB',
      uploadedDate: '2024-01-14',
      category: 'Financial',
      description: 'Commission structure and rates'
    },
    {
      id: 3,
      name: 'Agent Training Manual.docx',
      type: 'Word',
      size: '3.2 MB',
      uploadedDate: '2024-01-13',
      category: 'Training',
      description: 'Comprehensive agent training manual'
    },
    {
      id: 4,
      name: 'Company Logo.png',
      type: 'Image',
      size: '45 KB',
      uploadedDate: '2024-01-12',
      category: 'Marketing',
      description: 'Company logo for documents'
    },
    {
      id: 5,
      name: 'Policy Add Form.pdf',
      type: 'PDF',
      size: '1.8 MB',
      uploadedDate: '2024-01-11',
      category: 'Forms',
      description: 'Policy addition form template'
    }
  ]);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newAttachment, setNewAttachment] = useState({
    name: '',
    category: '',
    description: ''
  });

  const categories = ['Policy Documents', 'Financial', 'Training', 'Marketing', 'Forms', 'Legal', 'Other'];

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleDelete = (fileId) => {
    setAttachments(prev => prev.filter(file => file.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  };

  const handleBulkDelete = () => {
    setAttachments(prev => prev.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (newAttachment.name && newAttachment.category) {
      const newFile = {
        id: Date.now(),
        name: newAttachment.name,
        type: 'PDF', // Default type
        size: '1.0 MB', // Default size
        uploadedDate: new Date().toISOString().split('T')[0],
        category: newAttachment.category,
        description: newAttachment.description
      };
      setAttachments(prev => [newFile, ...prev]);
      setNewAttachment({ name: '', category: '', description: '' });
      setShowUploadModal(false);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF':
        return <FiFile className="w-6 h-6 text-red-500" />;
      case 'Excel':
        return <FiFile className="w-6 h-6 text-green-500" />;
      case 'Word':
        return <FiFile className="w-6 h-6 text-blue-500" />;
      case 'Image':
        return <FiFile className="w-6 h-6 text-purple-500" />;
      default:
        return <FiFile className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Attachments</h1>
                <p className="text-gray-600 mt-1">Manage your documents and files</p>
              </div>
              <div className="flex space-x-3">
                {selectedFiles.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete Selected ({selectedFiles.length})</span>
                  </button>
                )}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiFile className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{attachments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiUpload className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiDownload className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-gray-900">48</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FiEdit3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Modified</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Files</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === attachments.length && attachments.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(attachments.map(file => file.id));
                        } else {
                          setSelectedFiles([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attachments.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleFileSelect(file.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(file.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{file.name}</div>
                          <div className="text-sm text-gray-500">{file.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {file.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {file.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {file.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {file.uploadedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <FiDownload className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-900"
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
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New File</h3>
                <form onSubmit={handleUpload}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Name
                    </label>
                    <input
                      type="text"
                      value={newAttachment.name}
                      onChange={(e) => setNewAttachment(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newAttachment.category}
                      onChange={(e) => setNewAttachment(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newAttachment.description}
                      onChange={(e) => setNewAttachment(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Upload
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attachments;
