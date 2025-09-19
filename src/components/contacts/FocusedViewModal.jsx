import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiEdit2, FiPlus, FiFileText, FiEye } from 'react-icons/fi';
import { getFilledFormsByContactId, getPolicyDocumentsByContactId } from '../../services/api';
import AccordFormFiller from '../forms/AccordFormFiller';

function FocusedViewModal({ 
  isOpen, 
  onClose, 
  contact, 
  onNoteSaved, 
  onActionItemSaved, 
  onPhoneCallSaved,
  onMeetingScheduled 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState([]);
  const [phoneCalls, setPhoneCalls] = useState([]);
  const [filledForms, setFilledForms] = useState([]);
  const [policyDocuments, setPolicyDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAccordFormFillerOpen, setIsAccordFormFillerOpen] = useState(false);

  useEffect(() => {
    if (isOpen && contact) {
      fetchContactData();
    }
  }, [isOpen, contact]);

  const fetchContactData = async () => {
    if (!contact?.id) return;
    
    setLoading(true);
    try {
      // Simulate fetching contact data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setNotes([
        {
          id: 1,
          title: 'Initial consultation',
          content: 'Discussed insurance needs and current coverage',
          created_at: '2024-02-10T10:00:00Z',
          type: 'note'
        }
      ]);
      
      setPhoneCalls([
        {
          id: 1,
          title: 'Follow-up call',
          content: 'Discussed policy options and pricing',
          created_at: '2024-02-12T14:30:00Z',
          duration: '15 minutes'
        }
      ]);
      
      // Fetch filled forms for this contact
      if (contact?.id) {
        try {
          const forms = await getFilledFormsByContactId(contact.id);
          setFilledForms(forms || []);
          
          const documents = await getPolicyDocumentsByContactId(contact.id);
          setPolicyDocuments(documents || []);
        } catch (error) {
          console.error('Error fetching filled forms:', error);
          setFilledForms([]);
          setPolicyDocuments([]);
        }
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !contact) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiUser },
    { id: 'notes', label: 'Notes', icon: FiEdit2 },
    { id: 'calls', label: 'Phone Calls', icon: FiPhone },
    { id: 'meetings', label: 'Meetings', icon: FiCalendar },
    { id: 'forms', label: 'Forms', icon: FiFileText },
    { id: 'documents', label: 'Documents', icon: FiFileText }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">
              {contact.firstName?.[0]}{contact.lastName?.[0]}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {contact.firstName} {contact.lastName}
            </h3>
            <p className="text-gray-600">Primary Contact</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
          
          {contact.email && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiMail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{contact.email}</p>
              </div>
            </div>
          )}
          
          {contact.phone && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiPhone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{contact.phone}</p>
              </div>
            </div>
          )}
          
          {(contact.address || contact.city || contact.state) && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiMapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">
                  {[contact.address, contact.city, contact.state].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Quick Actions</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
              <FiPhone className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-blue-900">Call</span>
            </button>
            
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
              <FiMail className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-green-900">Email</span>
            </button>
            
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
              <FiEdit2 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-purple-900">Add Note</span>
            </button>
            
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
              <FiCalendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-orange-900">Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Notes</h4>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <FiPlus className="w-4 h-4" />
          <span>Add Note</span>
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      ) : notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map(note => (
            <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h5 className="font-semibold text-gray-900 mb-2">{note.title}</h5>
              <p className="text-gray-600 mb-3">{note.content}</p>
              <p className="text-xs text-gray-500">
                {new Date(note.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FiEdit2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No notes yet</p>
          <p className="text-gray-500 text-sm">Add your first note to get started</p>
        </div>
      )}
    </div>
  );

  const renderPhoneCalls = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Phone Calls</h4>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
          <FiPlus className="w-4 h-4" />
          <span>Log Call</span>
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading phone calls...</p>
        </div>
      ) : phoneCalls.length > 0 ? (
        <div className="space-y-3">
          {phoneCalls.map(call => (
            <div key={call.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-semibold text-gray-900">{call.title}</h5>
                <span className="text-xs text-gray-500">{call.duration}</span>
              </div>
              <p className="text-gray-600 mb-3">{call.content}</p>
              <p className="text-xs text-gray-500">
                {new Date(call.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FiPhone className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No phone calls logged</p>
          <p className="text-gray-500 text-sm">Log your first call to get started</p>
        </div>
      )}
    </div>
  );

  const renderMeetings = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Meetings</h4>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
          <FiPlus className="w-4 h-4" />
          <span>Schedule Meeting</span>
        </button>
      </div>
      
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <FiCalendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No meetings scheduled</p>
        <p className="text-gray-500 text-sm">Schedule your first meeting to get started</p>
      </div>
    </div>
  );

  const renderForms = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Accord Forms</h4>
        <button 
          onClick={() => setIsAccordFormFillerOpen(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <FiPlus className="w-4 h-4" />
          <span>Fill New Form</span>
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading forms...</p>
        </div>
      ) : filledForms.length > 0 ? (
        <div className="space-y-3">
          {filledForms.map(form => (
            <div key={form.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-semibold text-gray-900">Form #{form.id}</h5>
                <span className="text-xs text-gray-500">
                  {new Date(form.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 mb-3 text-sm">
                Template ID: {form.template_id}
              </p>
              <div className="flex space-x-2">
                {form.generated_pdf_url && (
                  <a
                    href={form.generated_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm flex items-center"
                  >
                    <FiEye className="mr-1 w-3 h-3" />
                    View PDF
                  </a>
                )}
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
                  View Data
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FiFileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No forms filled yet</p>
          <p className="text-gray-500 text-sm">Fill your first Accord form to get started</p>
        </div>
      )}
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Policy Documents</h4>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      ) : policyDocuments.length > 0 ? (
        <div className="space-y-3">
          {policyDocuments.map(document => (
            <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiFileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{document.file_name}</h5>
                    <p className="text-sm text-gray-500">
                      {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : ''} • 
                      {new Date(document.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
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
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FiFileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No policy documents found</p>
          <p className="text-gray-500 text-sm">Documents will appear here when uploaded</p>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'notes': return renderNotes();
      case 'calls': return renderPhoneCalls();
      case 'meetings': return renderMeetings();
      case 'forms': return renderForms();
      case 'documents': return renderDocuments();
      default: return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Contact Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderTabContent()}
        </div>
      </div>

      <AccordFormFiller
        isOpen={isAccordFormFillerOpen}
        onClose={() => setIsAccordFormFillerOpen(false)}
        contact={contact}
      />
    </div>
  );
}

export default FocusedViewModal;