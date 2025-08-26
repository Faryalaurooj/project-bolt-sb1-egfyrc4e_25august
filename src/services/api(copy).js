import { supabase } from '../lib/supabase';

export const getAllNotes = async () => {
  const { data, error } = await supabase
    .from('notes')
    .select('*, contacts(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createNote = async (noteData, mediaFile = null) => {
  try {
    console.log('📝 createNote: Starting creation with data:', noteData);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) {
      console.error('📝 createNote: User error:', userError);
      throw userError;
    }
    if (!user) {
      console.error('📝 createNote: No authenticated user found');
      throw new Error('No authenticated user found');
    }

    let media_url = null;
    
    // Upload file if provided
    if (mediaFile) {
      console.log('📝 createNote: Uploading media file:', mediaFile.name);
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('note-attachments')
        .upload(fileName, mediaFile);
      
      if (uploadError) {
        console.error('📝 createNote: Upload error:', uploadError);
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('note-attachments')
        .getPublicUrl(fileName);
      
      media_url = publicUrl;
      console.log('📝 createNote: Media uploaded successfully:', media_url);
    }

    console.log('📝 createNote: Inserting note into database...');
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        ...noteData,
        media_url,
        created_by: user.id
      }])
      .select('*, contacts(*)')
      .single();

    if (error) {
      console.error('📝 createNote: Database error:', error);
      throw error;
    }
    
    console.log('📝 createNote: Note created successfully:', data);
    return data;
  } catch (error) {
    console.error('📝 createNote: Error occurred:', error);
    throw error;
  }
};

export const updateNote = async (id, updates) => {
  const { data, error } = await supabase
    .from('notes')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*, contacts(*)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteNote = async (id) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Phone Calls API
export const getAllPhoneCalls = async () => {
  const { data, error } = await supabase
    .from('phone_calls')
    .select('*, contacts(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createPhoneCall = async (callData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('phone_calls')
      .insert([{
        ...callData,
        created_by: user.id
      }])
      .select('*, contacts(*)')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updatePhoneCall = async (id, updates) => {
  const { data, error } = await supabase
    .from('phone_calls')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*, contacts(*)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deletePhoneCall = async (id) => {
  const { error } = await supabase
    .from('phone_calls')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Contacts API
export const createContact = async (contactData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        ...contactData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getContacts = async () => {
  try {
    console.log('📞 getContacts: Starting fetch...');
    const { data, error } = await supabase
      .from('contacts')
      .select('*, do_not_contact')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('📞 getContacts: Supabase error:', error);
      throw new Error(error.message);
    }

    console.log('📞 getContacts: Successfully fetched contacts:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('📞 getContacts: Error occurred:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

export const getContactById = async (id) => {
  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *, do_not_contact,
      household_members(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateContact = async (id, updates) => {
  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteContact = async (id) => {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Household Members API
export const getHouseholdMembers = async (contactId) => {
  const { data, error } = await supabase
    .from('household_members')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createHouseholdMember = async (memberData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('household_members')
      .insert([{
        ...memberData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateHouseholdMember = async (id, updates) => {
  const { data, error } = await supabase
    .from('household_members')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteHouseholdMember = async (id) => {
  const { error } = await supabase
    .from('household_members')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Companies API
export const createCompany = async (companyData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('companies')
      .insert([{
        ...companyData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getCompanies = async () => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getCompaniesByContactId = async (contactId) => {
  const { data, error } = await supabase
    .from('contact_companies')
    .select(`
      relationship_type,
      companies(*)
    `)
    .eq('contact_id', contactId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const linkContactToCompany = async (contactId, companyId, relationshipType = 'employee') => {
  const { data, error } = await supabase
    .from('contact_companies')
    .insert([{
      contact_id: contactId,
      company_id: companyId,
      relationship_type: relationshipType
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Policy Documents API
export const createPolicyDocument = async (contactId, file) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('policy-documents')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('policy-documents')
      .getPublicUrl(fileName);

    // Create policy document record
    const { data, error } = await supabase
      .from('policy_documents')
      .insert([{
        contact_id: contactId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getPolicyDocumentsByContactId = async (contactId) => {
  const { data, error } = await supabase
    .from('policy_documents')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deletePolicyDocument = async (documentId) => {
  try {
    // Get document info first to delete from storage
    const { data: document, error: fetchError } = await supabase
      .from('policy_documents')
      .select('file_url')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;

    // Extract file path from URL and delete from storage
    if (document.file_url) {
      const fileName = document.file_url.split('/').pop();
      await supabase.storage
        .from('policy-documents')
        .remove([fileName]);
    }

    // Delete document record
    const { error } = await supabase
      .from('policy_documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Text Campaigns API
export const createTextCampaign = async (campaignData, recipientIds = []) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    // Create the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('text_campaigns')
      .insert([{
        ...campaignData,
        created_by: user.id
      }])
      .select()
      .single();

    if (campaignError) throw campaignError;

    // Add recipients if provided
    if (recipientIds.length > 0) {
      const recipients = recipientIds.map(contactId => ({
        campaign_id: campaign.id,
        contact_id: contactId
      }));

      const { error: recipientsError } = await supabase
        .from('text_campaign_recipients')
        .insert(recipients);

      if (recipientsError) throw recipientsError;
    }

    return campaign;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getTextCampaigns = async () => {
  const { data, error } = await supabase
    .from('text_campaigns')
    .select(`
      *,
      text_campaign_recipients(
        contact_id,
        contacts(first_name, last_name, phone)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateTextCampaign = async (id, updates, recipientIds = null) => {
  try {
    // Update the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('text_campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (campaignError) throw campaignError;

    // Update recipients if provided
    if (recipientIds !== null) {
      // Delete existing recipients
      const { error: deleteError } = await supabase
        .from('text_campaign_recipients')
        .delete()
        .eq('campaign_id', id);

      if (deleteError) throw deleteError;

      // Add new recipients
      if (recipientIds.length > 0) {
        const recipients = recipientIds.map(contactId => ({
          campaign_id: id,
          contact_id: contactId
        }));

        const { error: recipientsError } = await supabase
          .from('text_campaign_recipients')
          .insert(recipients);

        if (recipientsError) throw recipientsError;
      }
    }

    return campaign;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteTextCampaign = async (id) => {
  const { error } = await supabase
    .from('text_campaigns')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Card Templates API
export const getCardTemplates = async () => {
  const { data, error } = await supabase
    .from('card_templates')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createCardTemplate = async (templateData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('card_templates')
      .insert([{
        ...templateData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Email Templates API
export const createEmailTemplate = async (templateData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('email_templates')
      .insert([{
        ...templateData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getEmailTemplates = async () => {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateEmailTemplate = async (id, updates) => {
  const { data, error } = await supabase
    .from('email_templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteEmailTemplate = async (id) => {
  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Email Signatures API
export const createEmailSignature = async (signatureData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('email_signatures')
      .insert([{
        ...signatureData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getEmailSignatures = async () => {
  const { data, error } = await supabase
    .from('email_signatures')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateEmailSignature = async (id, updates) => {
  const { data, error } = await supabase
    .from('email_signatures')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteEmailSignature = async (id) => {
  const { error } = await supabase
    .from('email_signatures')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Social Media Posts API
export const createSocialMediaPost = async (postData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('social_media_posts')
      .insert([{
        ...postData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getSocialMediaPosts = async () => {
  const { data, error } = await supabase
    .from('social_media_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateSocialMediaPost = async (id, updates) => {
  const { data, error } = await supabase
    .from('social_media_posts')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteSocialMediaPost = async (id) => {
  const { error } = await supabase
    .from('social_media_posts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Text Messages API
export const createTextMessage = async (messageData, mediaFile = null) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    let media_url = messageData.media_url;
    
    // Upload file if provided
    if (mediaFile) {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, mediaFile);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);
      
      media_url = publicUrl;
    }

    const { data, error } = await supabase
      .from('text_messages')
      .insert([{
        ...messageData,
        media_url,
        sender_id: user.id
      }])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getTextMessagesForContact = async (contactId) => {
  const { data, error } = await supabase
    .from('text_messages')
    .select('*, contacts(*)')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateTextMessage = async (id, updates) => {
  const { data, error } = await supabase
    .from('text_messages')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*, contacts(*)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteTextMessage = async (id) => {
  const { error } = await supabase
    .from('text_messages')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Get text messages for user-to-user conversations
export const getTextMessagesForUserConversation = async (userId) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('text_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getAllTextMessages = async () => {
  const { data, error } = await supabase
    .from('text_messages')
    .select('*, contacts(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Calendar Events API
export const getCalendarEvents = async () => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createCalendarEvent = async (eventData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('calendar_events')
      .insert([{
        ...eventData,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteCalendarEvent = async (id) => {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Users API
export const getUsers = async () => {
  try {
    console.log('👥 getUsers: Starting fetch...');
    
    // Get current session first
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('👥 getUsers: Session error:', sessionError);
      throw sessionError;
    }
    
    if (!session?.session?.access_token) {
      console.error('👥 getUsers: No access token found');
      throw new Error('No authentication token available');
    }
    
    console.log('👥 getUsers: Making API request with token...');
    // Fetch users from backend API
    const response = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${session.session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('👥 getUsers: Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('👥 getUsers: API error:', response.status, errorText);
      throw new Error('Failed to fetch users');
    }

    const users = await response.json();
    console.log('👥 getUsers: Successfully fetched users:', users?.length || 0);
    return users;
  } catch (error) {
    console.error('Error in getUsers:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

// Search Contacts and Users API
export const searchContactsAndUsers = async (searchTerm = '') => {
  try {
    console.log('🔍 searchContactsAndUsers: Starting search with term:', searchTerm);
    
    // Fetch contacts
    console.log('🔍 searchContactsAndUsers: Fetching contacts...');
    const contacts = await getContacts();
    console.log('🔍 searchContactsAndUsers: Contacts fetched:', contacts?.length || 0);
    
    // Fetch users
    console.log('🔍 searchContactsAndUsers: Fetching users...');
    const users = await getUsers();
    console.log('🔍 searchContactsAndUsers: Users fetched:', users?.length || 0);
    
    // Format contacts
    const formattedContacts = contacts.map(contact => ({
      ...contact,
      type: 'contact',
      name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 
             contact.email?.split('@')[0] || 
             'Unnamed Contact',
      phone: contact.cell_number || contact.phone || contact.home_phone_number || contact.work_number
    }));
    
    // Format users
    const formattedUsers = users.map(user => ({
      ...user,
      type: 'user',
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
             user.email?.split('@')[0] ||
             'Team Member'
    }));
    
    // Combine both lists
    const allRecipients = [...formattedContacts, ...formattedUsers];
    console.log('🔍 searchContactsAndUsers: Total recipients:', allRecipients.length);
    
    // Filter by search term if provided
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = allRecipients.filter(recipient => {
        const name = String(recipient.name || '').toLowerCase();
        const email = String(recipient.email || recipient.user_metadata?.email || '').toLowerCase();
        const phone = String(recipient.phone || recipient.contact_number || recipient.cell_number || '').toLowerCase();
        
        return name.includes(searchLower) || 
               email.includes(searchLower) || 
               phone.includes(searchLower);
      });
      console.log('🔍 searchContactsAndUsers: Filtered results:', filtered.length);
      return filtered;
    }
    
    console.log('🔍 searchContactsAndUsers: Returning all recipients:', allRecipients.length);
    return allRecipients;
  } catch (error) {
    console.error('❌ searchContactsAndUsers: Error occurred:', error);
    throw new Error(error.message);
  }
};

// User Profile API
export const updateUserProfile = async (profileData) => {
  try {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify(profileData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await fetch('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Policies API
export const createPolicy = async (policyData) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch('/api/policies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(policyData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create policy');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating policy:', error);
    throw error;
  }
};

export const getPoliciesByContactId = async (contactId) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch(`/api/policies/contact/${contactId}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch policies');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching policies:', error);
    throw error;
  }
};
