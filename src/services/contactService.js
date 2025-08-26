import { getContacts as apiGetContacts, getContactById as apiGetContactById } from './api';

export const getContacts = async () => {
  try {
    return await apiGetContacts();
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
};

export const getContactByName = async (firstName, lastName) => {
  try {
    const contacts = await apiGetContacts();
    return contacts.find(
      contact => 
        contact.first_name.toLowerCase() === firstName.toLowerCase() &&
        contact.last_name.toLowerCase() === lastName.toLowerCase()
    );
  } catch (error) {
    console.error('Error finding contact by name:', error);
    return null;
  }
};

export const getContactById = async (id) => {
  try {
    return await apiGetContactById(id);
  } catch (error) {
    console.error('Error fetching contact by id:', error);
    return null;
  }
};