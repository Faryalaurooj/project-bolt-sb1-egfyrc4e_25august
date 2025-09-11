import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiPlus } from 'react-icons/fi';
import { createContact, createHouseholdMember, createPolicyDocument } from '../../services/api';

function NewContactModal({ isOpen, onClose, onContactSaved }) { // Accept onContactSaved prop
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: null,
    gender: '',
    maritalStatus: '',
    language: 'English',
    ssnTaxId: '',
    phone: '',
    cellNumber: '',
    homePhoneNumber: '',
    workNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    customerType: 'Individual',
    accountType: 'Standard',
    contactStatus: 'Active',
    customerSubStatus: '',
    customerAgentOfRecord: '',
    customerCsr: '',
    keyedBy: '',
    office: '',
    source: '',
    spouse_first_name: '',
    spouse_last_name: '',
    spouse_email: '',
    spouse_phone: '',
    spouse_date_of_birth: null,
    company_name: '',
    relationship_type: 'employee',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [policyDocuments, setPolicyDocuments] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newContact = await createContact({
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        marital_status: formData.maritalStatus || null,
        language: formData.language,
        ssn_tax_id: formData.ssnTaxId || null,
        email: formData.email,
        phone: formData.phone,
        cell_number: formData.cellNumber || null,
        home_phone_number: formData.homePhoneNumber || null,
        work_number: formData.workNumber || null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        customer_type: formData.customerType,
        account_type: formData.accountType,
        contact_status: formData.contactStatus,
        customer_sub_status: formData.customerSubStatus || null,
        customer_agent_of_record: formData.customerAgentOfRecord || null,
        customer_csr: formData.customerCsr || null,
        keyed_by: formData.keyedBy || null,
        office: formData.office || null,
        source: formData.source || null,
        notes: formData.notes,
        spouse_first_name: formData.spouse_first_name,
        spouse_last_name: formData.spouse_last_name,
        spouse_email: formData.spouse_email,
        spouse_phone: formData.spouse_phone,
        spouse_date_of_birth: formData.spouse_date_of_birth
      });

      // Create household members if any
      if (householdMembers.length > 0) {
        for (const member of householdMembers) {
          if (member.first_name && member.last_name) {
            await createHouseholdMember({
              ...member,
              contact_id: newContact.id
            });
          }
        }
      }

      // Upload policy documents if any
      if (policyDocuments.length > 0) {
        console.log('Uploading policy documents:', policyDocuments.length);
        for (const doc of policyDocuments) {
          try {
            console.log('Uploading document:', doc.file.name);
            await createPolicyDocument(newContact.id, doc.file);
            console.log('Document uploaded successfully:', doc.file.name);
          } catch (docError) {
            console.error('Failed to upload document:', doc.file.name, docError);
            setError(`Failed to upload document "${doc.file.name}": ${docError.message}`);
            setLoading(false);
            return;
          }
        }
      }

      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: null,
        gender: '',
        maritalStatus: '',
        language: 'English',
        ssnTaxId: '',
        phone: '',
        cellNumber: '',
        homePhoneNumber: '',
        workNumber: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        customerType: 'Individual',
        accountType: 'Standard',
        contactStatus: 'Active',
        customerSubStatus: '',
        customerAgentOfRecord: '',
        customerCsr: '',
        keyedBy: '',
        office: '',
        source: '',
        notes: '',
        spouse_first_name: '',
        spouse_last_name: '',
        spouse_email: '',
        spouse_phone: '',
        spouse_date_of_birth: null,
        company_name: '',
        relationship_type: 'employee'
      });
      setHouseholdMembers([]);
      setPolicyDocuments([]);
      onClose();
      if (onContactSaved) { // Call the callback if provided
        onContactSaved();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white w-full max-w-2xl mx-4 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">NEW CONTACT</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              <button
                onClick={() => setActiveTab(0)}
                className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                  activeTab === 0
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`}
              >
                Basic Info
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                  activeTab === 1
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`}
              >
                Household
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                  activeTab === 2
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`}
              >
                Company
              </button>
              <button
                onClick={() => setActiveTab(3)}
                className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                  activeTab === 3
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`}
              >
                Policies
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 0 && (
              <div className="space-y-4">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First Name *"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last Name *"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Separated">Separated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      name="ssnTaxId"
                      value={formData.ssnTaxId}
                      onChange={handleChange}
                      placeholder="SSN/Tax ID"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Contact Information Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        name="cellNumber"
                        value={formData.cellNumber}
                        onChange={handleChange}
                        placeholder="Cell Number"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <input
                        type="tel"
                        name="homePhoneNumber"
                        value={formData.homePhoneNumber}
                        onChange={handleChange}
                        placeholder="Home Phone"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        name="workNumber"
                        value={formData.workNumber}
                        onChange={handleChange}
                        placeholder="Work Number"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Address</h3>
                  
                  <div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Address"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-4"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        placeholder="ZIP"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Business Information</h3>
                  
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                    <select
                      name="customerType"
                      value={formData.customerType}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Individual">Individual</option>
                      <option value="Business">Business</option>
                      <option value="Family">Family</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                    <select
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="contactStatus"
                      value={formData.contactStatus}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Prospect">Prospect</option>
                      <option value="Lead">Lead</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      name="customerSubStatus"
                      value={formData.customerSubStatus}
                      onChange={handleChange}
                      placeholder="Customer Sub Status"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="customerAgentOfRecord"
                      value={formData.customerAgentOfRecord}
                      onChange={handleChange}
                      placeholder="Agent of Record"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="customerCsr"
                      value={formData.customerCsr}
                      onChange={handleChange}
                      placeholder="CSR"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="keyedBy"
                      value={formData.keyedBy}
                      onChange={handleChange}
                      placeholder="Keyed By"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="office"
                      value={formData.office}
                      onChange={handleChange}
                      placeholder="Office"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    placeholder="Source"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                </div>

                {/* Notes Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional notes about this contact..."
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="space-y-4">
                {/* Spouse Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Spouse Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="spouse_first_name"
                        value={formData.spouse_first_name}
                        onChange={handleChange}
                        placeholder="Spouse First Name"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="spouse_last_name"
                        value={formData.spouse_last_name}
                        onChange={handleChange}
                        placeholder="Spouse Last Name"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <input
                        type="email"
                        name="spouse_email"
                        value={formData.spouse_email}
                        onChange={handleChange}
                        placeholder="Spouse Email"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        name="spouse_phone"
                        value={formData.spouse_phone}
                        onChange={handleChange}
                        placeholder="Spouse Phone"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spouse Date of Birth</label>
                    <input
                      type="date"
                      name="spouse_date_of_birth"
                      value={formData.spouse_date_of_birth}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Family Members Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Family Members</h3>
                  <div className="space-y-3">
                    {householdMembers.map((member, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="First Name"
                            value={member.first_name || ''}
                            onChange={(e) => {
                              const updated = [...householdMembers];
                              updated[index] = { ...updated[index], first_name: e.target.value };
                              setHouseholdMembers(updated);
                            }}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Last Name"
                            value={member.last_name || ''}
                            onChange={(e) => {
                              const updated = [...householdMembers];
                              updated[index] = { ...updated[index], last_name: e.target.value };
                              setHouseholdMembers(updated);
                            }}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <select
                            value={member.relationship || 'child'}
                            onChange={(e) => {
                              const updated = [...householdMembers];
                              updated[index] = { ...updated[index], relationship: e.target.value };
                              setHouseholdMembers(updated);
                            }}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="child">Child</option>
                            <option value="parent">Parent</option>
                            <option value="sibling">Sibling</option>
                            <option value="other">Other</option>
                          </select>
                          <input
                            type="date"
                            placeholder="Date of Birth"
                            value={member.date_of_birth || ''}
                            onChange={(e) => {
                              const updated = [...householdMembers];
                              updated[index] = { ...updated[index], date_of_birth: e.target.value };
                              setHouseholdMembers(updated);
                            }}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            value={member.email || ''}
                            onChange={(e) => {
                              const updated = [...householdMembers];
                              updated[index] = { ...updated[index], email: e.target.value };
                              setHouseholdMembers(updated);
                            }}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={member.phone || ''}
                            onChange={(e) => {
                              const updated = [...householdMembers];
                              updated[index] = { ...updated[index], phone: e.target.value };
                              setHouseholdMembers(updated);
                            }}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = householdMembers.filter((_, i) => i !== index);
                            setHouseholdMembers(updated);
                          }}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setHouseholdMembers([...householdMembers, {
                          first_name: '',
                          last_name: '',
                          relationship: 'child',
                          date_of_birth: '',
                          email: '',
                          phone: '',
                          notes: ''
                        }]);
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <FiPlus className="mr-2" />
                      Add Family Member
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
                <div>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Company Name"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Type</label>
                  <select
                    name="relationship_type"
                    value={formData.relationship_type}
                    onChange={handleChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="client">Client</option>
                    <option value="vendor">Vendor</option>
                    <option value="partner">Partner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Policy Documents</h3>
                <p className="text-sm text-gray-600">Upload policy documents for this contact</p>
                
                <div className="space-y-3">
                  {policyDocuments.map((doc, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-xs font-medium">
                            {doc.file?.type?.split('/')[1]?.toUpperCase() || 'DOC'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.file?.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.file?.size ? `${(doc.file.size / 1024).toFixed(1)} KB` : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = policyDocuments.filter((_, i) => i !== index);
                          setPolicyDocuments(updated);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  <label className="flex items-center justify-center w-full h-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiPlus className="w-4 h-4" />
                      <span className="text-sm">Upload Policy Document</span>
                    </div>
                    <input
                      type="file"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 0) {
                          const newDocuments = files.map(file => ({ file }));
                          setPolicyDocuments([...policyDocuments, ...newDocuments]);
                        }
                        // Reset the input so the same file can be selected again
                        e.target.value = '';
                      }}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      multiple
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {activeTab > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab - 1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Previous
                </button>
              )}
              <div className="ml-auto">
                {activeTab < 3 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab + 1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Contact'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}

export default NewContactModal;
