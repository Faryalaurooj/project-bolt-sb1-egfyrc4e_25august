import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiPlus, FiChevronDown, FiFileText, FiPaperclip, FiUpload, FiDownload, FiTrash2, FiEye, FiEdit3, FiUser, FiUsers, FiBriefcase, FiPhone } from 'react-icons/fi';
import { createContact, createHouseholdMember, createPolicyDocument, getCompanies, createPolicy } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function NewContactModal({ isOpen, onClose, onContactSaved }) { // Accept onContactSaved prop
  const { user } = useAuth();
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
    email2: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    mailingAddress: '',
    mailingCity: '',
    mailingState: '',
    mailingZip: '',
    customerType: 'Individual',
    accountType: 'Standard',
    contactStatus: 'Active',
    customerSubStatus: '',
    customerAgentOfRecord: '',
    customerCsr: '',
    keyedBy: '',
    office: '',
    source: '',
    driversLicense: '',
    dlState: '',
    dateLicensed: null,
    preferredContactMethod: '',
    doNotEmail: false,
    doNotText: false,
    doNotCall: false,
    doNotMail: false,
    doNotMarket: false,
    doNotCaptureEmail: false,
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
  const [attachments, setAttachments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [policyData, setPolicyData] = useState({
    policyEntry: 'New Business',
    company: '',
    product: '',
    paymentPlan: '',
    policyNumber: '',
    purePremium: '',
    paymentDueDay: '',
    effDate: '09/11/2025',
    expDate: '',
    source: '',
    subSource: '',
    policyAgentOfRecord: 'Alisha Hanif',
    policyCSR: 'Alisha Hanif',
    priorPolicyNumber: '',
    memo: '',
    commissionSplit: '100.00%'
  });
  const [dropdownsOpen, setDropdownsOpen] = useState({
    policyEntry: false,
    company: false,
    product: false,
    paymentPlan: false,
    source: false,
    subSource: false,
    policyAgentOfRecord: false,
    policyCSR: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePolicyChange = (field, value) => {
    setPolicyData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDropdown = (field) => {
    setDropdownsOpen(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleDropdownSelect = (field, value) => {
    handlePolicyChange(field, value);
    setDropdownsOpen(prev => ({ ...prev, [field]: false }));
  };

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newAttachments = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        file: file,
        uploadedDate: new Date().toISOString().split('T')[0],
        category: 'General'
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    e.target.value = '';
  };

  const handleAttachmentDelete = (id) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  // Fetch companies when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchCompanies = async () => {
        try {
          const companiesData = await getCompanies();
          setCompanies(companiesData);
        } catch (error) {
          console.error('Error fetching companies:', error);
        }
      };
      fetchCompanies();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      setLoading(false);
      return;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

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
        email2: formData.email2 || null,
        phone: formData.phone,
        cell_number: formData.cellNumber || null,
        home_phone_number: formData.homePhoneNumber || null,
        work_number: formData.workNumber || null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        mailing_address: formData.mailingAddress || '',
        mailing_city: formData.mailingCity || '',
        mailing_state: formData.mailingState || '',
        mailing_zip: formData.mailingZip || '',
        customer_type: formData.customerType,
        account_type: formData.accountType,
        contact_status: formData.contactStatus,
        customer_sub_status: formData.customerSubStatus || '',
        customer_agent_of_record: formData.customerAgentOfRecord || '',
        customer_csr: formData.customerCsr || '',
        keyed_by: formData.keyedBy || '',
        office: formData.office || '',
        source: formData.source || '',
        drivers_license: formData.driversLicense || '',
        dl_state: formData.dlState || '',
        date_licensed: formData.dateLicensed || null,
        preferred_contact_method: formData.preferredContactMethod || '',
        do_not_email: formData.doNotEmail,
        do_not_text: formData.doNotText,
        do_not_call: formData.doNotCall,
        do_not_mail: formData.doNotMail,
        do_not_market: formData.doNotMarket,
        do_not_capture_email: formData.doNotCaptureEmail,
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

      // Create policy if policy number is provided and not empty
      if (policyData.policyNumber && policyData.policyNumber.trim() !== '') {
        try {
          console.log('Creating policy for contact:', newContact.id);
          await createPolicy({
            ...policyData,
            created_by: user.id,
            contact_id: newContact.id
          });
          console.log('Policy created successfully');
        } catch (policyError) {
          console.error('Failed to create policy:', policyError);
          setError(`Failed to create policy: ${policyError.message}`);
          setLoading(false);
          return;
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
        email2: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        mailingAddress: '',
        mailingCity: '',
        mailingState: '',
        mailingZip: '',
        customerType: 'Individual',
        accountType: 'Standard',
        contactStatus: 'Active',
        customerSubStatus: '',
        customerAgentOfRecord: '',
        customerCsr: '',
        keyedBy: '',
        office: '',
        source: '',
        driversLicense: '',
        dlState: '',
        dateLicensed: null,
        preferredContactMethod: '',
        doNotEmail: false,
        doNotText: false,
        doNotCall: false,
        doNotMail: false,
        doNotMarket: false,
        doNotCaptureEmail: false,
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
      setAttachments([]);
      setPolicyData({
        policyEntry: 'New Business',
        company: '',
        product: '',
        paymentPlan: '',
        policyNumber: '',
        purePremium: '',
        paymentDueDay: '',
        effDate: '09/11/2025',
        expDate: '',
        source: '',
        subSource: '',
        policyAgentOfRecord: 'Alisha Hanif',
        policyCSR: 'Alisha Hanif',
        priorPolicyNumber: '',
        memo: '',
        commissionSplit: '100.00%'
      });
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

        <div className="relative bg-white w-full max-w-4xl mx-4 rounded-2xl shadow-2xl overflow-hidden">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <FiPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create New Contact</h2>
                  <p className="text-blue-100 text-sm">Add a new contact to your CRM system</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-8">
            <div className="flex space-x-1 rounded-xl bg-gradient-to-r from-gray-100 to-blue-50 p-1 shadow-sm">
              {[
                { id: 0, name: 'Basic Info', icon: FiUser, description: 'Personal details' },
                { id: 1, name: 'Household', icon: FiUsers, description: 'Family members' },
                { id: 2, name: 'Company', icon: FiBriefcase, description: 'Work information' },
                { id: 3, name: 'Policy', icon: FiFileText, description: 'Insurance details' },
                { id: 4, name: 'Attachments', icon: FiPaperclip, description: 'Documents' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full rounded-lg py-3 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-700 shadow-md transform scale-105'
                      : 'text-gray-600 hover:bg-white hover:bg-opacity-70 hover:text-blue-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-500">
                {activeTab === 0 && 'Enter the contact\'s personal information and contact details'}
                {activeTab === 1 && 'Add spouse information and family members'}
                {activeTab === 2 && 'Specify company and work relationship details'}
                {activeTab === 3 && 'Create insurance policies and coverage information'}
                {activeTab === 4 && 'Upload documents and attachments for this contact'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 0 && (
              <div className="space-y-8">
                {/* Personal Information Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <FiPhone className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
                  </div>

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
                        type="email"
                        name="email2"
                        value={formData.email2}
                        onChange={handleChange}
                        placeholder="Email 2"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
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

                {/* Mailing Address Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Mailing Address</h3>

                  <div>
                    <input
                      type="text"
                      name="mailingAddress"
                      value={formData.mailingAddress}
                      onChange={handleChange}
                      placeholder="Mailing Address"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-4"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        name="mailingCity"
                        value={formData.mailingCity}
                        onChange={handleChange}
                        placeholder="Mailing City"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="mailingState"
                        value={formData.mailingState}
                        onChange={handleChange}
                        placeholder="Mailing State"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="mailingZip"
                        value={formData.mailingZip}
                        onChange={handleChange}
                        placeholder="Mailing ZIP"
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

                {/* Driver's License Information Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Driver's License Information</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <input
                        type="text"
                        name="driversLicense"
                        value={formData.driversLicense}
                        onChange={handleChange}
                        placeholder="Driver's License Number"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="dlState"
                        value={formData.dlState}
                        onChange={handleChange}
                        placeholder="DL State"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Licensed</label>
                    <input
                      type="date"
                      name="dateLicensed"
                      value={formData.dateLicensed}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Communication Preferences Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Communication Preferences</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</label>
                      <select
                        name="preferredContactMethod"
                        value={formData.preferredContactMethod}
                        onChange={handleChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Select Preferred Method</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="text">Text</option>
                        <option value="mail">Mail</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Do Not Contact Preferences</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="doNotEmail"
                          checked={formData.doNotEmail}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Do Not Email</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="doNotText"
                          checked={formData.doNotText}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Do Not Text</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="doNotCall"
                          checked={formData.doNotCall}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Do Not Call</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="doNotMail"
                          checked={formData.doNotMail}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Do Not Mail</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="doNotMarket"
                          checked={formData.doNotMarket}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Do Not Market</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="doNotCaptureEmail"
                          checked={formData.doNotCaptureEmail}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Do Not Capture Email</span>
                      </label>
                    </div>
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Policy Information</h3>

                <div className="space-y-4">
                  {/* Policy Entry */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Policy Entry:</label>
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => toggleDropdown('policyEntry')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                      >
                        <span>{policyData.policyEntry}</span>
                        <FiChevronDown className="w-4 h-4" />
                      </button>
                      {dropdownsOpen.policyEntry && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                          {['New Business', 'Rewrite', 'Re-Issue', 'Renewal', 'Rollover'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleDropdownSelect('policyEntry', option)}
                              className={`w-full px-3 py-2 text-left hover:bg-blue-50 ${policyData.policyEntry === option ? 'bg-blue-100' : ''
                                }`}
                            >
                              {option === 'New Business' && <span className="mr-2">✓</span>}
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Company: <span className="text-red-500">*</span></label>
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => toggleDropdown('company')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                      >
                        <span>{policyData.company || '- Select Company -'}</span>
                        <FiChevronDown className="w-4 h-4" />
                      </button>
                      {dropdownsOpen.company && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          <div className="px-3 py-2 text-gray-500 border-b">- Select Company -</div>
                          {companies.map((company) => (
                            <button
                              key={company.id}
                              type="button"
                              onClick={() => handleDropdownSelect('company', company.name)}
                              className={`w-full px-3 py-2 text-left hover:bg-blue-50 ${policyData.company === company.name ? 'bg-blue-100' : ''
                                }`}
                            >
                              {company.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Product: <span className="text-red-500">*</span></label>
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => toggleDropdown('product')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                      >
                        <span>{policyData.product || '- Select Product -'}</span>
                        <FiChevronDown className="w-4 h-4" />
                      </button>
                      {dropdownsOpen.product && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          <div className="px-3 py-2 text-gray-500 border-b">- Select Product -</div>
                          {[
                            'auto 12 month - AUTOP - 12 Month',
                            'AUTOP - AUTOP - 6 Month - Nationwide General Insurance Company - NAIC:23760N',
                            'AUTOP - AUTOP - 6 Month - Nationwide Mutual Insurance Company - NAIC:23787N',
                            'AUTOP - AUTOP - 6 Month - Nationwide Insurance Company of America - NAIC:25453N',
                            'AUTOP - AUTOP - 6 Month - Nationwide Affinity Insurance Company of America - NAIC:26093N',
                            'AUTOP - AUTOP - 6 Month - ALLIED - NAIC:10723N',
                            'BOAT - BOAT - 12 Month - ALLIED - NAIC:37877N',
                            'Bond - ADD-ON - 12 Month - Nationwide',
                            'DFIRE - DFIRE - 12 Month - Nationwide Mutual Fire Insurance Company - NAIC:23779N',
                            'Farm Owners - HOME - 12 Month',
                            'HOME - HOME - 12 Month - Nationwide Mutual Property and Casualty - NAIC:37877N',
                            'HOME - HOME - 12 Month - Nationwide Mutual Fire Insurance Company - NAIC:23779N',
                            'HOME - HOME - 12 Month - Nationwide General Insurance Company - NAIC:23760N',
                            'INMRP - INMRP - 12 Month - Nationwide Mutual Fire Insurance Company - NAIC:23779N',
                            'Life Ins - ADD-ON - 12 Month - Nationwide',
                            'Motorcycle - ADD-ON - 12 Month',
                            'PUMBR - PUMBR - 12 Month - Nationwide Mutual Insurance Company - NAIC:23787N'
                          ].map((product) => (
                            <button
                              key={product}
                              type="button"
                              onClick={() => handleDropdownSelect('product', product)}
                              className={`w-full px-3 py-2 text-left hover:bg-blue-50 ${policyData.product === product ? 'bg-blue-100' : ''
                                }`}
                            >
                              {product}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Plan */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Payment Plan:</label>
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => toggleDropdown('paymentPlan')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                      >
                        <span>{policyData.paymentPlan || '- Select Payment Plan -'}</span>
                        <FiChevronDown className="w-4 h-4" />
                      </button>
                      {dropdownsOpen.paymentPlan && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                          <div className="px-3 py-2 text-gray-500 border-b">- Select Payment Plan -</div>
                          {['Final', 'Monthly', 'Quarterly'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleDropdownSelect('paymentPlan', option)}
                              className={`w-full px-3 py-2 text-left hover:bg-blue-50 ${policyData.paymentPlan === option ? 'bg-blue-100' : ''
                                }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Policy Number */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Policy Number: <span className="text-red-500">*</span></label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={policyData.policyNumber}
                        onChange={(e) => handlePolicyChange('policyNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Premium */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Premium:</label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={policyData.purePremium}
                        onChange={(e) => handlePolicyChange('purePremium', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Payment Due Day */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Payment Due Day:</label>
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={policyData.paymentDueDay}
                        onChange={(e) => handlePolicyChange('paymentDueDay', e.target.value)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-500">(1-31)</span>
                    </div>
                  </div>

                  {/* Eff Date */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Eff Date:</label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={policyData.effDate}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Exp Date */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Exp Date:</label>
                    <div className="flex-1">
                      <input
                        type="date"
                        value={policyData.expDate}
                        onChange={(e) => handlePolicyChange('expDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Source */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Source:</label>
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => toggleDropdown('source')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                      >
                        <span>{policyData.source || '- Select Source -'}</span>
                        <FiChevronDown className="w-4 h-4" />
                      </button>
                      {dropdownsOpen.source && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          <div className="px-3 py-2 text-gray-500 border-b">✓ - Select Source -</div>
                          {['Acord XML Import', 'Arthur Szfranski', 'Bill Bartiet', 'BOR', 'CT Electricians',
                            'Current Policy Holder', 'Download', 'GFA', 'Google ad words', 'Hub Spot policyholder',
                            'Mike Gzyms', 'Phone', 'Referral', 'Sales Genie', 'SGenie Restaurants',
                            'Siding Contractors NY', 'Transfer', 'Walk-In', 'Web Lead'].map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleDropdownSelect('source', option)}
                                className={`w-full px-3 py-2 text-left hover:bg-blue-50 ${policyData.source === option ? 'bg-blue-100' : ''
                                  }`}
                              >
                                {option}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sub Source */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Sub Source:</label>
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => toggleDropdown('subSource')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                      >
                        <span>{policyData.subSource || '- Select Sub Source -'}</span>
                        <FiChevronDown className="w-4 h-4" />
                      </button>
                      {dropdownsOpen.subSource && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                          <div className="px-3 py-2 text-gray-500 border-b">- Select Sub Source -</div>
                          {['Arthur Szafranski', 'Bill Flanagan', 'Ken Camaro'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleDropdownSelect('subSource', option)}
                              className={`w-full px-3 py-2 text-left hover:bg-blue-50 ${policyData.subSource === option ? 'bg-blue-100' : ''
                                }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Policy Agent of Record */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Policy Agent of Record: <span className="text-red-500">*</span></label>
                    <div className="flex items-center space-x-2 flex-1">
                      <div className="relative flex-1">
                        <button
                          type="button"
                          onClick={() => toggleDropdown('policyAgentOfRecord')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                        >
                          <span>{policyData.policyAgentOfRecord}</span>
                          <FiChevronDown className="w-4 h-4" />
                        </button>
                        {dropdownsOpen.policyAgentOfRecord && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                            <div className="px-3 py-2 text-gray-500 border-b">- Select Agent of Record -</div>
                            {['Alisha Hanif', 'Bill Bartiet', 'James Eagan', 'John J Cusmano Jr.', 'Kaynat Malik'].map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleDropdownSelect('policyAgentOfRecord', option)}
                                className={`w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center ${policyData.policyAgentOfRecord === option ? 'bg-blue-100' : ''
                                  }`}
                              >
                                {policyData.policyAgentOfRecord === option && <span className="mr-2">✓</span>}
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">{policyData.commissionSplit}</span>
                        <button
                          type="button"
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Split Commission
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Policy CSR */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Policy CSR:</label>
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => toggleDropdown('policyCSR')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                      >
                        <span>{policyData.policyCSR}</span>
                        <FiChevronDown className="w-4 h-4" />
                      </button>
                      {dropdownsOpen.policyCSR && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                          <div className="px-3 py-2 text-gray-500 border-b">- Select CSR -</div>
                          {['Alisha Hanif', 'Bill Bartiet', 'James Eagan', 'John J Cusmano Jr.', 'Kaynat Malik'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleDropdownSelect('policyCSR', option)}
                              className={`w-full px-3 py-2 text-left hover:bg-blue-50 ${policyData.policyCSR === option ? 'bg-blue-100' : ''
                                }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prior Policy Number */}
                  <div className="flex items-center space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700">Prior Policy Number:</label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={policyData.priorPolicyNumber}
                        onChange={(e) => handlePolicyChange('priorPolicyNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Memo */}
                  <div className="flex items-start space-x-4">
                    <label className="w-48 text-sm font-medium text-gray-700 pt-2">Memo:</label>
                    <div className="flex-1">
                      <textarea
                        value={policyData.memo}
                        onChange={(e) => handlePolicyChange('memo', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter memo..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
                <p className="text-sm text-gray-600 mb-4">Upload and manage files for this contact</p>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="text-sm text-gray-600 mb-2">
                    <label htmlFor="attachment-upload" className="cursor-pointer">
                      <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                    </label>
                    <input
                      id="attachment-upload"
                      type="file"
                      onChange={handleAttachmentUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
                      multiple
                    />
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT, JPG, PNG, XLSX up to 10MB each</p>
                </div>

                {/* Attachments List */}
                {attachments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-900">Uploaded Files ({attachments.length})</h4>
                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="bg-gray-50 p-3 rounded-lg border flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-blue-600 text-xs font-medium">
                                {attachment.type}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-xs text-gray-500">
                                {attachment.size} • {attachment.uploadedDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-800"
                              title="View"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="text-green-600 hover:text-green-800"
                              title="Download"
                            >
                              <FiDownload className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="text-gray-600 hover:text-gray-800"
                              title="Edit"
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttachmentDelete(attachment.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {attachments.length === 0 && (
                  <div className="text-center py-8">
                    <FiPaperclip className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No attachments uploaded yet</p>
                    <p className="text-sm text-gray-400">Upload files to get started</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                {activeTab > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab - 1)}
                    className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
                  >
                    <FiChevronDown className="w-4 h-4 mr-2 rotate-90" />
                    Previous
                  </button>
                )}
                <div className="text-sm text-gray-500">
                  Step {activeTab + 1} of 5
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                {activeTab < 4 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab + 1)}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
                  >
                    Next
                    <FiChevronDown className="w-4 h-4 ml-2 -rotate-90" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Creating Contact...
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-4 h-4 mr-2" />
                        Create Contact
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default NewContactModal;
