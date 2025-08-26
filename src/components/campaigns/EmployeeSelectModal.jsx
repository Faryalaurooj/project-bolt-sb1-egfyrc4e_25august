import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiSearch } from 'react-icons/fi';
import { getContacts } from '../../services/api';

function EmployeeSelectModal({ isOpen, onClose, onEmployeeSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch contacts when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const contactsData = await getContacts();
      // Transform contacts to employee format
      const employeeData = (contactsData || []).map(contact => ({
        id: contact.id,
        name: `${contact.first_name} ${contact.last_name}`,
        email: contact.email || 'No email',
        role: 'Contact'
      }));
      setEmployees(employeeData);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-60 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white w-full max-w-md mx-4 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Dialog.Title className="text-xl font-semibold text-blue-600">
                Select an Employee
              </Dialog.Title>
              <p className="text-sm text-gray-500 mt-1">
                Select a contact to send the message from. This will change who appears as the sender.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
              <p className="text-gray-600">Loading contacts...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchEmployees}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredEmployees.map(employee => (
                <div
                  key={employee.id}
                  onClick={() => onEmployeeSelect(employee.name)}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-600">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-500">{employee.email}</p>
                    <p className="text-xs text-gray-400">{employee.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No employees found matching your search.</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default EmployeeSelectModal;