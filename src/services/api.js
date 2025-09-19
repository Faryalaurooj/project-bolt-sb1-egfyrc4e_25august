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

// Get sticky notes for dashboard
export const getStickyNotes = async () => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*, contacts(*)')
      .eq('is_sticky', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error fetching sticky notes:', error);
    return [];
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

export const getPhoneCallsByContactId = async (contactId) => {
  try {
    console.log('📞 getPhoneCallsByContactId: Fetching for contact:', contactId);
    
    const { data, error } = await supabase
      .from('phone_calls')
      .select('*, contacts(*)')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('📞 getPhoneCallsByContactId: Error:', error);
      throw new Error(error.message);
    }

    console.log('📞 getPhoneCallsByContactId: Found calls:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('📞 getPhoneCallsByContactId: Error occurred:', error);
    throw new Error(error.message);
  }
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
    .select('*')
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
    console.log('🏢 API: createCompany called with data:', companyData);
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    console.log('🏢 API: Session obtained, making request to /api/companies');
    console.log('🏢 API: Request payload:', JSON.stringify(companyData, null, 2));
    
    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(companyData)
    });

    console.log('🏢 API: Response status:', response.status);
    console.log('🏢 API: Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🏢 API: Error response text:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        console.error('🏢 API: Failed to parse error response as JSON:', parseError);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      throw new Error(errorData.error || 'Failed to create company');
    }
    
    const result = await response.json();
    console.log('🏢 API: Company created successfully:', result);
    return result;
  } catch (error) {
    console.error('🏢 API: Error in createCompany:', error);
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

// Get all policy documents
export const getPolicyDocuments = async () => {
  try {
    const { data, error } = await supabase
      .from('policy_documents')
      .select('*, contacts(first_name, last_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the data to include contact names
    return (data || []).map(doc => ({
      ...doc,
      contact_name: doc.contacts ? `${doc.contacts.first_name} ${doc.contacts.last_name}` : null,
      uploaded_by_name: 'System'
    }));
  } catch (error) {
    console.error('Error fetching policy documents:', error);
    throw new Error(error.message);
  }
};

// Get all filled forms
export const getFilledForms = async () => {
  try {
    const { data, error } = await supabase
      .from('filled_forms')
      .select(`
        *,
        form_templates(name),
        contacts(first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(form => ({
      ...form,
      template_name: form.form_templates?.name || 'Unknown Template',
      contact_name: form.contacts ? `${form.contacts.first_name} ${form.contacts.last_name}` : null
    }));
  } catch (error) {
    console.error('Error fetching filled forms:', error);
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
// Send email campaign
export const sendEmailCampaign = async (campaignData) => {
  try {
    // In a real implementation, this would send emails to recipients
    // For now, we'll create email records for tracking
    const { recipients, tags, subject, content, sendTime, scheduledDate, scheduledTime } = campaignData;
    
    // Calculate send time
    let scheduledAt = null;
    if (sendTime === 'scheduled' && scheduledDate && scheduledTime) {
      scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    }
    
    // Create email records for each recipient
    const emailPromises = recipients.map(recipient => {
      return supabase
        .from('emails')
        .insert({
          subject,
          content,
          scheduled_at: scheduledAt,
          status: sendTime === 'now' ? 'sent' : 'scheduled',
          sent_at: sendTime === 'now' ? new Date().toISOString() : null
        });
    });
    
    await Promise.all(emailPromises);
    
    return {
      success: true,
      message: `Email campaign ${sendTime === 'now' ? 'sent' : 'scheduled'} successfully`,
      recipientCount: recipients.length
    };
  } catch (error) {
    console.error('Error sending email campaign:', error);
    throw error;
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
export const getUsers = async (searchQuery = '') => {
  try {
    console.log('👥 getUsers: Starting fetch...');
    
    let dbQuery = supabase
      .from('users')
      .select('id, email, first_name, last_name, contact_number, outlook_email, created_at')
      .order('created_at', { ascending: false });

    if (searchQuery) {
      dbQuery = dbQuery.or(`
        first_name.ilike.%${searchQuery}%,
        last_name.ilike.%${searchQuery}%,
        email.ilike.%${searchQuery}%
      `);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('👥 getUsers: Supabase error:', error);
      throw new Error(error.message);
    }

    console.log('👥 getUsers: Fetched users:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ getUsers: Error occurred:', error);
    return [];
  }
};
// Search Contacts and Users API
export const searchContactsAndUsers = async (searchTerm = '') => {
  try {
    console.log('🔍 searchContactsAndUsers: Starting search with term:', searchTerm);
    
    // Fetch contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (contactsError) throw contactsError;

    // Fetch users with search query
    const users = await getUsers(searchTerm);

    // Format contacts
    const formattedContacts = (contacts || []).map(contact => ({
      ...contact,
      type: 'contact',
      name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 
             contact.email?.split('@')[0] || 
             'Unnamed Contact',
      phone: contact.cell_number || contact.phone || contact.home_phone_number || contact.work_number
    }));

    // Format users
    const formattedUsers = (users || []).map(user => ({
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
        const email = String(recipient.email || '').toLowerCase();
        const phone = String(recipient.phone || '').toLowerCase();
        
        return name.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower);
      });

      console.log('🔍 searchContactsAndUsers: Filtered results:', filtered.length);
      return filtered;
    }

    return allRecipients;
  } catch (error) {
    console.error('❌ searchContactsAndUsers: Error occurred:', error);
    throw new Error(error.message);
  }
};

// Update text message
export const updateTextMessage = async (id, updates) => {
  const { data, error } = await supabase
    .from('text_messages')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Delete text message
export const deleteTextMessage = async (id) => {
  const { error } = await supabase
    .from('text_messages')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Emails API (represented as notes with email type)
export const getEmailsForContact = async (contactId) => {
  try {
    console.log('📧 getEmailsForContact: Fetching for contact:', contactId);
    
    const { data, error } = await supabase
      .from('notes')
      .select('*, contacts(*)')
      .eq('contact_id', contactId)
      .eq('type', 'email')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('📧 getEmailsForContact: Error:', error);
      throw new Error(error.message);
    }

    console.log('📧 getEmailsForContact: Found emails:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('📧 getEmailsForContact: Error occurred:', error);
    return []; // Return empty array instead of throwing to prevent crashes
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
      method: 'POST', // Ensure this is a POST request for creation
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

// Text Messages API
export const createTextMessage = async (messageData, mediaFile = null) => {
  try {
    console.log('📱 createTextMessage: Starting with data:', messageData);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    let media_url = messageData.media_url;
    
    // Upload file if provided
    if (mediaFile) {
      console.log('📱 createTextMessage: Uploading media file...');
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
      console.log('📱 createTextMessage: Media uploaded:', media_url);
    }

    // Determine if this is an internal team message
    const isInternalMessage = messageData.recipient_id || messageData.recipient_phone === 'internal';
    console.log('📱 createTextMessage: Is internal message:', isInternalMessage);
    
    // If this is an outgoing message to an external contact, send via TextMagic API
    let textmagic_id = null;
    let finalStatus = messageData.status || 'pending';
    
    if (messageData.direction === 'outgoing' && messageData.recipient_phone && !isInternalMessage && messageData.recipient_phone !== 'internal') {
      try {
        console.log('📱 createTextMessage: Sending via TextMagic API...');
        const { data: session } = await supabase.auth.getSession();
        
        const response = await fetch('/api/texting/send-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session?.access_token}`
          },
          body: JSON.stringify({
            to: messageData.recipient_phone,
            message: messageData.content,
            contact_id: messageData.contact_id,
            recipient_id: messageData.recipient_id
          })
        });
        
        const result = await response.json();
        console.log('📱 createTextMessage: TextMagic result:', result);
        
        if (result.success) {
          textmagic_id = result.textmagic_id;
          finalStatus = 'sent';
        } else {
          finalStatus = 'failed';
          console.error('📱 createTextMessage: TextMagic failed:', result.error);
        }
      } catch (apiError) {
        console.error('📱 createTextMessage: TextMagic API error:', apiError);
        finalStatus = 'failed';
      }
    } else if (isInternalMessage || messageData.recipient_id) {
      // For internal team messages, mark as sent immediately
      console.log('📱 createTextMessage: Internal team message, marking as sent');
      finalStatus = 'sent';
    }

    console.log('📱 createTextMessage: Final status:', finalStatus);
    console.log('📱 createTextMessage: Saving to database...');
    
    // For internal messages, ensure phone numbers are null
    const finalMessageData = {
      contact_id: messageData.contact_id,
      recipient_id: messageData.recipient_id,
      sender_id: user.id,
      sender_phone: isInternalMessage ? null : messageData.sender_phone,
      recipient_phone: isInternalMessage ? null : messageData.recipient_phone,
      content: messageData.content,
      direction: messageData.direction || 'outgoing',
      status: finalStatus,
      sent_at: messageData.sent_at || new Date().toISOString(),
      media_url,
      textmagic_id
    };
    
    console.log('📱 createTextMessage: Final message data:', finalMessageData);
    
    const { data, error } = await supabase
      .from('text_messages')
      .insert([finalMessageData])
      .select('*')
      .single();

    if (error) throw error;
    console.log('📱 createTextMessage: Message saved successfully:', data);
    return data;
  } catch (error) {
    console.error('📱 createTextMessage: Error occurred:', error);
    throw new Error(error.message);
  }
};

export const getTextMessagesForContact = async (contactId) => {
  console.log('📱 getTextMessagesForContact: Fetching for contact:', contactId);
  
  const { data, error } = await supabase
    .from('text_messages')
    .select(`
      *,
      contacts(first_name, last_name, email, phone)
    `)
    .eq('contact_id', contactId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('📱 getTextMessagesForContact: Error:', error);
    throw new Error(error.message);
  }

  console.log('📱 getTextMessagesForContact: Found messages:', data?.length || 0);
  return data;
};

export const getTextMessagesForUserConversation = async (userId) => {
  try {
    console.log('📱 getTextMessagesForUserConversation: Fetching for user:', userId);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('text_messages')
      .select(`
        *,
        contacts(first_name, last_name, email, phone)
      `)
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('📱 getTextMessagesForUserConversation: Error:', error);
      throw new Error(error.message);
    }

    console.log('📱 getTextMessagesForUserConversation: Found messages:', data?.length || 0);
    return data;
  } catch (error) {
    console.error('📱 getTextMessagesForUserConversation: Error occurred:', error);
    throw new Error(error.message);
  }
};

export const getAllTextMessages = async () => {
  console.log('📱 getAllTextMessages: Fetching all messages...');
  
  const { data, error } = await supabase
    .from('text_messages')
    .select(`
      *,
      contacts(first_name, last_name, email, phone)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('📱 getAllTextMessages: Error:', error);
    throw new Error(error.message);
  }

  console.log('📱 getAllTextMessages: Found messages:', data?.length || 0);
  return data;
};


// Form Templates API
export const createFormTemplate = async (templateData, file) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('form-templates')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('form-templates')
      .getPublicUrl(fileName);

    // Send metadata to backend API
    const response = await fetch('/api/form-templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        name: templateData.name,
        description: templateData.description,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create form template');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating form template:', error);
    throw new Error(error.message);
  }
};

export const getFormTemplates = async () => {
  try {
    const response = await fetch('/api/form-templates', {
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch form templates');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching form templates:', error);
    throw new Error(error.message);
  }
};

export const deleteFormTemplate = async (id) => {
  try {
    const response = await fetch(`/api/form-templates/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete form template');
    }
    return true;
  } catch (error) {
    console.error('Error deleting form template:', error);
    throw new Error(error.message);
  }
};


// Filled Forms API
export const createFilledForm = async (formData) => {
  try {
    const response = await fetch('/api/filled-forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify(formData)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create filled form');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating filled form:', error);
    throw new Error(error.message);
  }
};

export const getFilledFormsByContactId = async (contactId) => {
  try {
    const response = await fetch(`/api/filled-forms/contact/${contactId}`, {
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch filled forms');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching filled forms:', error);
    throw new Error(error.message);
  }
};

// ... existing functions
// ... existing imports and functions

// PandaDoc Integration
export const initiatePandaDocEditorSession = async (templateFileUrl, documentName, contactData = null) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch('/api/pandadoc/editor-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        template_file_url: templateFileUrl,
        document_name: documentName,
        contact_data: contactData
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to initiate PandaDoc editor session.');
    }
    return await response.json();
  } catch (error) {
    console.error('Error initiating PandaDoc editor session:', error);
    throw new Error(error.message);
  }
};

export const getPandaDocDocumentStatus = async (documentId) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch(`/api/pandadoc/document-status/${documentId}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get document status.');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting PandaDoc document status:', error);
    throw new Error(error.message);
  }
};

export const sendDocumentForSignature = async (documentUrl, recipientEmail, recipientFirstName, recipientLastName, documentName) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch('/api/pandadoc/send-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        document_url: documentUrl,
        recipient_email: recipientEmail,
        recipient_first_name: recipientFirstName,
        recipient_last_name: recipientLastName,
        document_name: documentName
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send document for signature.');
    }
    return await response.json();
  } catch (error) {
    console.error('Error sending document for signature:', error);
    throw new Error(error.message);
  }
};

// ... existing functions

// PandaDoc Integration for Existing Documents
export const openExistingDocumentInPandaDoc = async (documentUrl, documentName, contactId = null) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch('/api/pandadoc/open-existing-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        document_url: documentUrl,
        document_name: documentName,
        contact_id: contactId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to open document in PandaDoc');
    }
    return await response.json();
  } catch (error) {
    console.error('Error opening document in PandaDoc:', error);
    throw new Error(error.message);
  }
};

// Delete Filled Form
export const deleteFilledForm = async (id) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch(`/api/filled-forms/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete filled form');
    }
    return true;
  } catch (error) {
    console.error('Error deleting filled form:', error);
    throw new Error(error.message);
  }
};

// Reports API
export const createReport = async (file) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports-storage')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('reports-storage')
      .getPublicUrl(fileName);

    // Send metadata to backend API
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create report');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating report:', error);
    throw new Error(error.message);
  }
};

export const getReports = async () => {
  try {
    const response = await fetch('/api/reports', {
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw new Error(error.message);
  }
};

export const deleteReport = async (id) => {
  try {
    const response = await fetch(`/api/reports/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete report');
    }
    return true;
  } catch (error) {
    console.error('Error deleting report:', error);
    throw new Error(error.message);
  }
};

// Report Management API
export const saveReportConfiguration = async (reportData) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch('/api/reports/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(reportData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save report configuration');
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving report configuration:', error);
    throw new Error(error.message);
  }
};

export const runReport = async (reportData) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch('/api/reports/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(reportData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to run report');
    }
    return await response.json();
  } catch (error) {
    console.error('Error running report:', error);
    throw new Error(error.message);
  }
};

// Production Reports API
export const runProductionReport = async (reportType, format, filters) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch(`/api/reports/production/${reportType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ filters, format })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to run production report');
    }
    return await response.json();
  } catch (error) {
    console.error('Error running production report:', error);
    throw new Error(error.message);
  }
};

// Imports/Exports API
export const uploadCustomerCensus = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/imports-exports/upload-customer-census', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload customer census');
    }
    return await response.json();
  } catch (error) {
    console.error('Error uploading customer census:', error);
    throw new Error(error.message);
  }
};

export const exportCustomerData = async (exportData) => {
  try {
    const response = await fetch('/api/imports-exports/export-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(exportData)
    });

    if (!response.ok) {
      throw new Error('Failed to export customer data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error exporting customer data:', error);
    throw new Error(error.message);
  }
};

export const exportPolicyData = async (exportData) => {
  try {
    const response = await fetch('/api/imports-exports/export-policies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(exportData)
    });

    if (!response.ok) {
      throw new Error('Failed to export policy data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error exporting policy data:', error);
    throw new Error(error.message);
  }
};