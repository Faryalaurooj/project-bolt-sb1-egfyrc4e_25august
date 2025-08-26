import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiArrowLeft, FiPlus, FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import ContactForm from '../components/contacts/ContactForm';
import { Tab } from '@headlessui/react';
import { getContactById, updateContact, deleteContact, getHouseholdMembers, createHouseholdMember, updateHouseholdMember, deleteHouseholdMember } from '../services/api';

function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [contact, setContact] = useState(null);
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [policyDocuments, setPolicyDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    fetchContactData();
  }, [id]);

  const fetchContactData = async () => {
    try {
      setLoading(true);
      const [contactData, membersData, companiesData, documentsData] = await Promise.all([
        getContactById(id),
        getHouseholdMembers(id),
        getCompaniesByContactId(id),
        getPolicyDocumentsByContactId(id)
      ]);
      setContact(contactData);
      setHouseholdMembers(membersData || []);
      setCompanies(companiesData || []);
      setPolicyDocuments(documentsData || []);
    } catch (err) {
      console.error('Error fetching contact:', err);
      setError('Failed to load contact details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      // Separate household members from contact data
      const { household_members, ...contactData } = data;
      
      // Update contact
      await updateContact(id, contactData);
      
      // Handle household members updates
      if (household_members) {
        // Get current members
        const currentMembers = await getHouseholdMembers(id);
        const currentMemberIds = currentMembers.map(m => m.id);
        
        // Process each member
        for (const member of household_members) {
          if (member.id && currentMemberIds.includes(member.id)) {
            // Update existing member
            await updateHouseholdMember(member.id, member);
          } else if (member.first_name && member.last_name) {
            // Create new member
            await createHouseholdMember({
              ...member,
              contact_id: id
            });
          }
        }
        
        // Remove members that are no longer in the list
        const updatedMemberIds = household_members.filter(m => m.id).map(m => m.id);
        const membersToDelete = currentMemberIds.filter(id => !updatedMemberIds.includes(id));
        
        for (const memberId of membersToDelete) {
          await deleteHouseholdMember(memberId);
        }
      }
      
      // Refresh data
      await fetchContactData();
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating contact:', err);
      setError('Failed to update contact');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id);
        navigate('/contacts');
      } catch (err) {
        console.error('Error deleting contact:', err);
        setError('Failed to delete contact');
      }
    }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingDocument(true);
      await createPolicyDocument(id, file);
      await fetchContactData(); // Refresh data
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deletePolicyDocument(documentId);
        await fetchContactData(); // Refresh data
      } catch (err) {
        console.error('Error deleting document:', err);
        setError('Failed to delete document');
      }
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getRelationshipColor = (relationship) => {
    const colors = {
      child: 'bg-blue-100 text-blue-800',
      parent: 'bg-green-100 text-green-800',
      sibling: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[relationship] || colors.other;
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
        <p className="text-gray-600 ml-2">Loading contact details...</p>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error || 'Contact not found'}</p>
        <button
          onClick={() => navigate('/contacts')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Contacts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/contacts')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" />
          Back to Contacts
        </button>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiEdit2 className="mr-2" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center text-red-600 hover:text-red-800"
          >
            <FiTrash2 className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {isEditing ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Contact</h2>
            <ContactForm 
              onSubmit={handleUpdate} 
              initialData={{
                ...contact,
                household_members: householdMembers
              }} 
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-blue-600">
                  {contact.first_name?.[0]}{contact.last_name?.[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {contact.first_name} {contact.last_name}
                </h2>
                <div className="flex items-center space-x-4 mt-2">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <FiMail className="mr-1" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <FiPhone className="mr-1" />
                      {contact.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    )
                  }
                >
                  Basic Info
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    )
                  }
                >
                  Household
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    )
                  }
                >
                  Connections
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    )
                  }
                >
                  Policy Documents
                </Tab>
                <Tab
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    )
                  }
                >
                  Timeline
                </Tab>
              </Tab.List>
              <Tab.Panels className="mt-6">
                <Tab.Panel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Email:</span> {contact.email || 'Not provided'}</p>
                        <p><span className="font-medium">Phone:</span> {contact.phone || 'Not provided'}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
                      <div className="space-y-2">
                        {contact.address && <p>{contact.address}</p>}
                        {(contact.city || contact.state || contact.zip) && (
                          <p>{contact.city}{contact.city && contact.state ? ', ' : ''}{contact.state} {contact.zip}</p>
                        )}
                        {!contact.address && !contact.city && !contact.state && !contact.zip && (
                          <p className="text-gray-500">No address provided</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {contact.tags && contact.tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {contact.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {contact.notes && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                      <p className="text-gray-600">{contact.notes}</p>
                    </div>
                  )}

                  {contact.keep_in_touch_interval && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Keep in Touch</h3>
                      <p className="text-gray-600">Reminder set for: {contact.keep_in_touch_interval}</p>
                    </div>
                  )}
                </Tab.Panel>

                <Tab.Panel>
                  <div className="space-y-6">
                    {/* Spouse Information */}
                    {(contact.spouse_first_name || contact.spouse_last_name) && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spouse Information</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Name</p>
                              <p className="font-medium">{contact.spouse_first_name} {contact.spouse_last_name}</p>
                            </div>
                            {contact.spouse_date_of_birth && (
                              <div>
                                <p className="text-sm text-gray-500">Date of Birth</p>
                                <p className="font-medium">
                                  {new Date(contact.spouse_date_of_birth).toLocaleDateString()}
                                  {calculateAge(contact.spouse_date_of_birth) && (
                                    <span className="text-gray-500 ml-2">
                                      (Age {calculateAge(contact.spouse_date_of_birth)})
                                    </span>
                                  )}
                                </p>
                              </div>
                            )}
                            {contact.spouse_email && (
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <a
                                  href={`mailto:${contact.spouse_email}`}
                                  className="font-medium text-blue-600 hover:text-blue-800"
                                >
                                  {contact.spouse_email}
                                </a>
                              </div>
                            )}
                            {contact.spouse_phone && (
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <a
                                  href={`tel:${contact.spouse_phone}`}
                                  className="font-medium text-blue-600 hover:text-blue-800"
                                >
                                  {contact.spouse_phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Household Members */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Family Members</h3>
                      </div>
                      {householdMembers.length > 0 ? (
                        <div className="space-y-4">
                          {householdMembers.map((member) => (
                            <div key={member.id} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <FiUser className="text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {member.first_name} {member.last_name}
                                    </h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRelationshipColor(member.relationship)}`}>
                                        {member.relationship.charAt(0).toUpperCase() + member.relationship.slice(1)}
                                      </span>
                                      {member.date_of_birth && (
                                        <span className="text-sm text-gray-500">
                                          Age {calculateAge(member.date_of_birth)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {(member.email || member.phone || member.notes) && (
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {member.email && (
                                    <div>
                                      <p className="text-sm text-gray-500">Email</p>
                                      <a
                                        href={`mailto:${member.email}`}
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        {member.email}
                                      </a>
                                    </div>
                                  )}
                                  {member.phone && (
                                    <div>
                                      <p className="text-sm text-gray-500">Phone</p>
                                      <a
                                        href={`tel:${member.phone}`}
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        {member.phone}
                                      </a>
                                    </div>
                                  )}
                                  {member.notes && (
                                    <div className="md:col-span-2">
                                      <p className="text-sm text-gray-500">Notes</p>
                                      <p className="text-gray-700">{member.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FiUser className="mx-auto h-12 w-12 mb-4" />
                          <p>No family members added yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Tab.Panel>

                <Tab.Panel>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Connections</h3>
                      {companies.length > 0 ? (
                        <div className="space-y-4">
                          {companies.map((connection) => (
                            <div key={connection.companies.id} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{connection.companies.name}</h4>
                                  <p className="text-sm text-gray-600 capitalize">{connection.relationship_type}</p>
                                  {connection.companies.industry && (
                                    <p className="text-sm text-gray-500">{connection.companies.industry}</p>
                                  )}
                                </div>
                                {connection.companies.email && (
                                  <a
                                    href={`mailto:${connection.companies.email}`}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <FiMail className="w-5 h-5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🏢</span>
                          </div>
                          <p>No company connections found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Tab.Panel>

                <Tab.Panel>
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Policy Documents</h3>
                      <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                        <FiPlus className="mr-2" />
                        {uploadingDocument ? 'Uploading...' : 'Upload Document'}
                        <input
                          type="file"
                          onChange={handleDocumentUpload}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          className="hidden"
                          disabled={uploadingDocument}
                        />
                      </label>
                    </div>

                    {policyDocuments.length > 0 ? (
                      <div className="space-y-4">
                        {policyDocuments.map((document) => (
                          <div key={document.id} className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                  <span className="text-blue-600 text-xs font-medium">
                                    {document.file_type?.split('/')[1]?.toUpperCase() || 'DOC'}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{document.file_name}</h4>
                                  <p className="text-sm text-gray-500">
                                    {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : ''} • 
                                    Uploaded {new Date(document.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <a
                                  href={document.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded-md text-sm"
                                >
                                  View
                                </a>
                                <button
                                  onClick={() => handleDeleteDocument(document.id)}
                                  className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded-md text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">📄</span>
                        </div>
                        <p>No policy documents uploaded yet.</p>
                        <p className="text-sm mt-2">Upload PDF, Word, or image files related to this contact's policies.</p>
                      </div>
                    )}
                  </div>
                </Tab.Panel>

                <Tab.Panel>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Timeline</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <p className="text-sm text-gray-500">
                          {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : 'Unknown date'}
                        </p>
                        <p className="text-gray-700">Contact created</p>
                      </div>
                      {contact.last_contacted_at && (
                        <div className="border-l-4 border-green-500 pl-4">
                          <p className="text-sm text-gray-500">
                            {new Date(contact.last_contacted_at).toLocaleDateString()}
                          </p>
                          <p className="text-gray-700">Last contacted</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactDetail;