import { supabase } from '../lib/supabase';



export const addNote = async (note) => {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data[0];
};

// ... ✅ keep the rest of your existing api.js code below unchanged





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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    let media_url = null;
    
    // Upload file if provided
    if (mediaFile) {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('note-attachments')
        .upload(fileName, mediaFile);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('note-attachments')
        .getPublicUrl(fileName);
      
      media_url = publicUrl;
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([{
        ...noteData,
        media_url,
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
  const { data, error } = await supabase
    .from('contacts')
    .select('*, do_not_contact')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
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

// New function to get messages between two users (team members)
export const getTextMessagesForUserConversation = async (user1Id, user2Id) => {
  const { data, error } = await supabase
    .from('text_messages')
    .select('*')
    .or(`and(sender_id.eq.${user1Id},recipient_id.eq.${user2Id}),and(sender_id.eq.${user2Id},recipient_id.eq.${user1Id})`)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};


// Users API
export const getUsers = async () => {
  try {
    // Fetch users from backend API
    const response = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const users = await response.json();
    return users;
  } catch (error) {
    console.error('Error in getUsers:', error);
    throw error;
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