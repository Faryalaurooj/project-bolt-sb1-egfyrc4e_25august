import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiUser } from 'react-icons/fi';

function HouseholdMembersForm({ members = [], onChange }) {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    first_name: '',
    last_name: '',
    relationship: 'child',
    date_of_birth: '',
    email: '',
    phone: '',
    notes: ''
  });

  const relationships = [
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'other', label: 'Other' }
  ];

  const handleAddMember = () => {
    if (newMember.first_name && newMember.last_name) {
      const memberWithId = {
        ...newMember,
        id: Date.now().toString() // Temporary ID for new members
      };
      onChange([...members, memberWithId]);
      setNewMember({
        first_name: '',
        last_name: '',
        relationship: 'child',
        date_of_birth: '',
        email: '',
        phone: '',
        notes: ''
      });
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    onChange(updatedMembers);
  };

  const handleUpdateMember = (index, field, value) => {
    const updatedMembers = members.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    );
    onChange(updatedMembers);
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

  return (
    <div className="space-y-4">
      {/* Existing Members */}
      {members.map((member, index) => (
        <div key={member.id || index} className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-start justify-between mb-3">
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
                    {relationships.find(r => r.value === member.relationship)?.label || member.relationship}
                  </span>
                  {member.date_of_birth && (
                    <span className="text-sm text-gray-500">
                      Age {calculateAge(member.date_of_birth)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleRemoveMember(index)}
              className="text-red-500 hover:text-red-700"
              title="Remove member"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={member.first_name}
                onChange={(e) => handleUpdateMember(index, 'first_name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={member.last_name}
                onChange={(e) => handleUpdateMember(index, 'last_name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Relationship</label>
              <select
                value={member.relationship}
                onChange={(e) => handleUpdateMember(index, 'relationship', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {relationships.map(rel => (
                  <option key={rel.value} value={rel.value}>{rel.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                value={member.date_of_birth}
                onChange={(e) => handleUpdateMember(index, 'date_of_birth', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={member.email}
                onChange={(e) => handleUpdateMember(index, 'email', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={member.phone}
                onChange={(e) => handleUpdateMember(index, 'phone', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={member.notes}
                onChange={(e) => handleUpdateMember(index, 'notes', e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add New Member Form */}
      {isAddingMember ? (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-gray-900 mb-3">Add Family Member</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name *</label>
              <input
                type="text"
                value={newMember.first_name}
                onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name *</label>
              <input
                type="text"
                value={newMember.last_name}
                onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Relationship</label>
              <select
                value={newMember.relationship}
                onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {relationships.map(rel => (
                  <option key={rel.value} value={rel.value}>{rel.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                value={newMember.date_of_birth}
                onChange={(e) => setNewMember({ ...newMember, date_of_birth: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={newMember.notes}
                onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={() => setIsAddingMember(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddMember}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Member
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingMember(true)}
          className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          Add Family Member
        </button>
      )}
    </div>
  );
}

export default HouseholdMembersForm;