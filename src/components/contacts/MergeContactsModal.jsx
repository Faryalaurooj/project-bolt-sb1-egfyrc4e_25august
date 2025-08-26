import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiX, FiCheck } from 'react-icons/fi';

function MergeContactsModal({ isOpen, onClose, selectedContacts }) {
  const [primaryContact, setPrimaryContact] = useState(selectedContacts[0]?.id);

  const handleMerge = () => {
    console.log('Merging contacts with primary:', primaryContact);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Merge Contacts
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              Select the primary contact. Their information will be kept while merging data from other contacts.
            </p>

            <div className="space-y-2">
              {selectedContacts.map(contact => (
                <label
                  key={contact.id}
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="primaryContact"
                    value={contact.id}
                    checked={primaryContact === contact.id}
                    onChange={(e) => setPrimaryContact(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleMerge}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              >
                <FiCheck className="mr-2" />
                Merge Contacts
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default MergeContactsModal;