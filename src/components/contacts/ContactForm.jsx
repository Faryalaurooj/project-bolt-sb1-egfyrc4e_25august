import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ContactTags from './ContactTags';
import HouseholdMembersForm from './HouseholdMembersForm';
import { Tab } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function ContactForm({ onSubmit, initialData = {} }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      ...initialData,
      leadStatus: initialData.leadStatus || 'New',
      potentialValue: initialData.potentialValue || 0,
      tags: initialData.tags || [],
      spouse_first_name: initialData.spouse_first_name || '',
      spouse_last_name: initialData.spouse_last_name || '',
      spouse_email: initialData.spouse_email || '',
      spouse_phone: initialData.spouse_phone || '',
      spouse_date_of_birth: initialData.spouse_date_of_birth || '',
      keep_in_touch_interval: initialData.keep_in_touch_interval || '',
      household_members: initialData.household_members || []
    }
  });

  const leadStatuses = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed'];
  const keepInTouchIntervals = [
    { value: '', label: 'No reminder' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const tags = watch('tags');
  const householdMembers = watch('household_members');

  const handleAddTag = (tag) => {
    const newTags = [...tags, tag];
    setValue('tags', newTags);
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setValue('tags', newTags);
  };

  const handleHouseholdMembersChange = (members) => {
    setValue('household_members', members);
  };

  const tabs = [
    { name: 'Basic Info', id: 'basic' },
    { name: 'Household', id: 'household' },
    { name: 'Preferences', id: 'preferences' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {tabs.map((tab, index) => (
            <Tab
              key={tab.id}
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
              {tab.name}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-6">
          {/* Basic Info Tab */}
          <Tab.Panel>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    {...register('first_name', { required: 'First name is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    {...register('last_name', { required: 'Last name is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    {...register('email', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    {...register('phone', {
                      pattern: {
                        value: /^\+?[\d\s-()]+$/,
                        message: 'Invalid phone number'
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  id="address"
                  {...register('address')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    id="city"
                    {...register('city')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    id="state"
                    {...register('state')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    id="zip"
                    {...register('zip', {
                      pattern: {
                        value: /^\d{5}(-\d{4})?$/,
                        message: 'Invalid ZIP code'
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.zip && (
                    <p className="mt-1 text-sm text-red-600">{errors.zip.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <ContactTags
                  tags={tags}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  id="notes"
                  rows={4}
                  {...register('notes')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </Tab.Panel>

          {/* Household Tab */}
          <Tab.Panel>
            <div className="space-y-6">
              {/* Spouse Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Spouse Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="spouse_first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      id="spouse_first_name"
                      {...register('spouse_first_name')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="spouse_last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      id="spouse_last_name"
                      {...register('spouse_last_name')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="spouse_email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="spouse_email"
                      {...register('spouse_email')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="spouse_phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      id="spouse_phone"
                      {...register('spouse_phone')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="spouse_date_of_birth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      id="spouse_date_of_birth"
                      {...register('spouse_date_of_birth')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Household Members */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Family Members</h3>
                <HouseholdMembersForm
                  members={householdMembers}
                  onChange={handleHouseholdMembersChange}
                />
              </div>
            </div>
          </Tab.Panel>

          {/* Preferences Tab */}
          <Tab.Panel>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="leadStatus" className="block text-sm font-medium text-gray-700">Lead Status</label>
                  <select
                    id="leadStatus"
                    {...register('leadStatus')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {leadStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="potentialValue" className="block text-sm font-medium text-gray-700">Potential Value ($)</label>
                  <input
                    type="number"
                    id="potentialValue"
                    {...register('potentialValue', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'Value cannot be negative' }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.potentialValue && (
                    <p className="mt-1 text-sm text-red-600">{errors.potentialValue.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="keep_in_touch_interval" className="block text-sm font-medium text-gray-700">Keep in Touch Reminder</label>
                  <select
                    id="keep_in_touch_interval"
                    {...register('keep_in_touch_interval')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {keepInTouchIntervals.map(interval => (
                      <option key={interval.value} value={interval.value}>{interval.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <div className="flex justify-end pt-6 border-t">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Contact
        </button>
      </div>
    </form>
  );
}

export default ContactForm;