import React from 'react';

function ContactProfileSidebar({ contact }) {
  if (!contact) return null;

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-white border-l shadow-lg z-10 overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          {contact.first_name} {contact.last_name}
        </h2>
        <p className="text-sm text-gray-500">{contact.email || 'No email provided'}</p>
        <p className="text-sm text-gray-500">{contact.phone || 'No phone number'}</p>
      </div>

      <div className="p-4">
        {/* Tags */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {(contact.tags && contact.tags.length > 0) ? (
              contact.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">No tags</span>
            )}
          </div>
        </div>

        {/* Spouse Information */}
        {(contact.spouse_first_name || contact.spouse_last_name || contact.spouse_date_of_birth) && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Spouse Info</h3>
            <p className="text-sm text-gray-600">
              {contact.spouse_first_name || ''} {contact.spouse_last_name || ''}
            </p>
            {contact.spouse_date_of_birth && (
              <p className="text-sm text-gray-500">
                DOB: {new Date(contact.spouse_date_of_birth).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Keep in Touch */}
        {contact.keep_in_touch_interval && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Keep in Touch</h3>
            <p className="text-sm text-gray-600">
              Every {contact.keep_in_touch_interval} days
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactProfileSidebar;
