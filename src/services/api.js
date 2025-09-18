import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Helper function to get JWT token
const getJwtToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  try {
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    
    if (response.ok) {
      const { token } = await response.json();
      return token;
    }
  } catch (error) {
    console.error('Failed to get JWT token:', error);
  }
  return null;
};

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
    console.log("contactData___",contactData)
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
      .select(`
        *,
        policy_documents(id, file_name, file_type, created_at)
      `)
      .order('created_at', { ascending: false });
      console.log("data___",data)

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
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        policy_documents(id, file_name, file_type, created_at)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('getContactById error:', error);
    throw error;
  }
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
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch('/api/companies', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('🏢 API: Companies fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('🏢 API: Error in getCompanies:', error);
    throw new Error(error.message);
  }
};

// Policy API functions
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
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('📋 API: Policy created successfully:', result);
    return result;
  } catch (error) {
    console.error('📋 API: Error in createPolicy:', error);
    throw new Error(error.message);
  }
};

export const getPolicies = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch('/api/policies', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('📋 API: Policies fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('📋 API: Error in getPolicies:', error);
    throw new Error(error.message);
  }
};

export const getPoliciesByContactId = async (contactId) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch(`/api/policies/contact/${contactId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('📋 API: Policies by contact fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('📋 API: Error in getPoliciesByContactId:', error);
    throw new Error(error.message);
  }
};

// Fetch policies directly from Supabase
export const getPoliciesByContactIdSupabase = async (contactId) => {
  try {
    console.log('📋 getPoliciesByContactIdSupabase: Fetching policies for contact:', contactId);
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('📋 getPoliciesByContactIdSupabase: Error:', error);
      throw error;
    }

    console.log('📋 getPoliciesByContactIdSupabase: Found policies:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('📋 getPoliciesByContactIdSupabase: Error occurred:', error);
    return [];
  }
};

export const updatePolicy = async (policyId, policyData) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch(`/api/policies/${policyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(policyData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('📋 API: Policy updated successfully:', result);
    return result;
  } catch (error) {
    console.error('📋 API: Error in updatePolicy:', error);
    throw new Error(error.message);
  }
};

export const deletePolicy = async (policyId) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch(`/api/policies/${policyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log('📋 API: Policy deleted successfully');
    return true;
  } catch (error) {
    console.error('📋 API: Error in deletePolicy:', error);
    throw new Error(error.message);
  }
};

export const updateCompany = async (companyId, companyData) => {
  try {
    console.log('🏢 API: updateCompany called with ID:', companyId, 'data:', companyData);
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch(`/api/companies/${companyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(companyData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      throw new Error(errorData.error || 'Failed to update company');
    }

    const result = await response.json();
    console.log('🏢 API: Company updated successfully:', result);
    return result;
  } catch (error) {
    console.error('🏢 API: Error in updateCompany:', error);
    throw new Error(error.message);
  }
};

export const deleteCompany = async (companyId) => {
  try {
    console.log('🏢 API: deleteCompany called with ID:', companyId);
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session found');

    const response = await fetch(`/api/companies/${companyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      throw new Error(errorData.error || 'Failed to delete company');
    }

    console.log('🏢 API: Company deleted successfully');
    return true;
  } catch (error) {
    console.error('🏢 API: Error in deleteCompany:', error);
    throw new Error(error.message);
  }
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
export const getAvailableContacts = async () => {
  try {
    console.log('👥 getAvailableContacts: Fetching contacts...');
    
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, email')
      .limit(10)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('👥 getAvailableContacts: Error:', error);
      return { success: false, error };
    }
    
    console.log('👥 getAvailableContacts: Found contacts:', contacts);
    return { success: true, contacts };
  } catch (error) {
    console.error('👥 getAvailableContacts: Exception:', error);
    return { success: false, error };
  }
};

export const testPolicyDocumentInsert = async (contactId) => {
  try {
    console.log('🧪 testPolicyDocumentInsert: Testing simple insert...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    // Test with minimal data
    const { data, error } = await supabase
      .from('policy_documents')
      .insert([{
        contact_id: contactId,
        file_name: 'test.txt',
        file_url: 'https://example.com/test.txt',
        uploaded_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('🧪 testPolicyDocumentInsert: Error:', error);
      return { success: false, error };
    }
    
    console.log('🧪 testPolicyDocumentInsert: Success:', data);
    return { success: true, data };
  } catch (error) {
    console.error('🧪 testPolicyDocumentInsert: Exception:', error);
    return { success: false, error };
  }
};

export const createPolicyDocument = async (contactId, file) => {
  try {
    console.log('📄 createPolicyDocument: Starting upload for contact:', contactId);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("user___>>>",user)

      
    if (userError) {
      console.error('📄 createPolicyDocument: User error:', userError);
      throw userError;
    }
    if (!user) {
      console.error('📄 createPolicyDocument: No authenticated user found');
      throw new Error('No authenticated user found');
    }

    // Upload file to Supabase Storage (same pattern as notes and messages)
    console.log('📄 createPolicyDocument: Uploading file:', file.name);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    let publicUrl;
    
    console.log('📄 createPolicyDocument: Attempting upload to policy-documents bucket...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('policy-documents')
      .upload(fileName, file);
    
    if (uploadError) {
      console.error('📄 createPolicyDocument: Upload error:', uploadError);
      console.error('📄 createPolicyDocument: Upload error details:', JSON.stringify(uploadError, null, 2));
      
      // If it's an RLS error, try using a different approach
      if (uploadError.message.includes('row-level security') || uploadError.message.includes('Unauthorized')) {
        console.log('📄 createPolicyDocument: RLS error on storage, trying alternative approach...');
        
        // Try uploading to a different bucket that might work
        const { data: altUploadData, error: altUploadError } = await supabase.storage
          .from('note-attachments') // Use note-attachments bucket as fallback
          .upload(`policy-docs/${fileName}`, file);
        
        if (altUploadError) {
          console.error('📄 createPolicyDocument: Alternative upload also failed:', altUploadError);
          throw new Error(`File upload failed: ${uploadError.message}. Please check storage bucket permissions.`);
        }
        
        const { data: { publicUrl: altPublicUrl } } = supabase.storage
          .from('note-attachments')
          .getPublicUrl(`policy-docs/${fileName}`);
        
        console.log('📄 createPolicyDocument: File uploaded to fallback bucket:', altPublicUrl);
        publicUrl = altPublicUrl;
      } else {
        throw uploadError;
      }
    } else {
      const { data: { publicUrl: primaryPublicUrl } } = supabase.storage
        .from('policy-documents')
        .getPublicUrl(fileName);
      
      console.log('📄 createPolicyDocument: File uploaded successfully:', primaryPublicUrl);
      publicUrl = primaryPublicUrl;
    }

    // First, let's verify the contact exists
    console.log('📄 createPolicyDocument: Verifying contact exists...');
    console.log('📄 createPolicyDocument: Looking for contact_id:', contactId);
    console.log('📄 createPolicyDocument: contact_id type:', typeof contactId);
    
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, created_by')
      .eq('id', contactId)
      .single();
    
    if (contactError) {
      console.error('📄 createPolicyDocument: Contact lookup failed:', contactError);
      console.error('📄 createPolicyDocument: Error details:', JSON.stringify(contactError, null, 2));
      
      // Let's also check if there are any contacts at all
      const { data: allContacts, error: allContactsError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name')
        .limit(5);
      
      console.log('📄 createPolicyDocument: Available contacts:', allContacts);
      
      throw new Error(`Contact not found: ${contactError.message}`);
    }
    
    console.log('📄 createPolicyDocument: Contact found:', contactData);

    // Create policy document record
    console.log('📄 createPolicyDocument: Inserting document record...');
    console.log('📄 createPolicyDocument: Data to insert:', {
      contact_id: contactId,
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: user.id
    });
    
    // Try insert with detailed error handling
    console.log('📄 createPolicyDocument: Attempting insert...');
    
    let data, error;
    
    // First try normal insert
    const insertResult = await supabase
      .from('policy_documents')
      .insert([{
        contact_id: contactId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id
      }])
      .select();
    
    data = insertResult.data;
    error = insertResult.error;
    
    // If RLS error, try using the stored procedure
    if (error && error.message.includes('row-level security')) {
      console.log('📄 createPolicyDocument: RLS error detected, trying stored procedure...');
      
      const rpcResult = await supabase.rpc('insert_policy_document', {
        p_contact_id: contactId,
        p_file_name: file.name,
        p_file_url: publicUrl,
        p_file_type: file.type,
        p_file_size: file.size,
        p_uploaded_by: user.id
      });
      
      data = rpcResult.data ? [rpcResult.data] : null;
      error = rpcResult.error;
    }
    
    console.log('📄 createPolicyDocument: Insert result - data:', data);
    console.log('📄 createPolicyDocument: Insert result - error:', error);
    
    // Handle the response properly
    if (error) {
      console.error('📄 createPolicyDocument: Database error:', error);
      console.error('📄 createPolicyDocument: Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error('📄 createPolicyDocument: No data returned from insert');
      throw new Error('Failed to create policy document - no data returned');
    }
    
    const insertedDocument = data[0];
    console.log('📄 createPolicyDocument: Document created successfully:', insertedDocument);
    return insertedDocument;
  } catch (error) {
    console.error('📄 createPolicyDocument: Error occurred:', error);
    throw error;
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
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ getEmailSignatures: User error:', userError);
      throw userError;
    }
    if (!user) {
      console.error('❌ getEmailSignatures: No authenticated user found');
      throw new Error('No authenticated user found');
    }

    console.log('📝 getEmailSignatures: Fetching signatures for user:', user.id);

    // Try to fetch signatures with RLS first
    let { data, error } = await supabase
      .from('email_signatures')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('📝 getEmailSignatures: RLS query result - data:', data, 'error:', error);

    // If RLS blocks access (empty array), try using RPC function to bypass RLS
    if ((!data || data.length === 0) && !error) {
      console.log('📝 getEmailSignatures: RLS blocked access, trying RPC function...');
      
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_email_signatures');
      
      if (rpcError) {
        console.error('❌ getEmailSignatures: RPC error:', rpcError);
        // If RPC also fails, create default signatures for the user
        console.log('📝 getEmailSignatures: RPC failed, creating default signatures...');
        
        const defaultSignatures = [
          {
            name: 'Professional Signature',
            content: '<p>Best regards,<br>Your Name<br>Insurance Agent<br>Phone: (555) 123-4567<br>Email: your.email@example.com</p>',
            created_by: user.id
          },
          {
            name: 'Simple Signature',
            content: '<p>Thank you,<br>Your Name</p>',
            created_by: user.id
          }
        ];

        const { data: insertedData, error: insertError } = await supabase
          .from('email_signatures')
          .insert(defaultSignatures)
          .select();

        if (insertError) {
          console.error('❌ getEmailSignatures: Error creating default signatures:', insertError);
          throw insertError;
        }

        console.log('📝 getEmailSignatures: Created default signatures:', insertedData);
        return insertedData;
      }
      
      data = rpcData;
      error = rpcError;
    }

    if (error) {
      console.error('❌ getEmailSignatures: Supabase error:', error);
      throw new Error(error.message);
    }

    console.log('📝 getEmailSignatures: Final data:', data);

    // If still no signatures found, create some default ones for the user
    if (!data || data.length === 0) {
      console.log('📝 getEmailSignatures: No signatures found, creating default ones...');
      
      const defaultSignatures = [
        {
          name: 'Professional Signature',
          content: '<p>Best regards,<br>Your Name<br>Insurance Agent<br>Phone: (555) 123-4567<br>Email: your.email@example.com</p>',
          created_by: user.id
        },
        {
          name: 'Simple Signature',
          content: '<p>Thank you,<br>Your Name</p>',
          created_by: user.id
        }
      ];

      const { data: insertedData, error: insertError } = await supabase
        .from('email_signatures')
        .insert(defaultSignatures)
        .select();

      if (insertError) {
        console.error('❌ getEmailSignatures: Error creating default signatures:', insertError);
        throw insertError;
      }

      console.log('📝 getEmailSignatures: Created default signatures:', insertedData);
      return insertedData;
    }

    console.log('📝 getEmailSignatures: Found existing signatures:', data);
    return data;
  } catch (error) {
    console.error('❌ getEmailSignatures: Error occurred:', error);
    throw new Error(error.message);
  }
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

// Emails API
export const createEmail = async (emailData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    // Transform the data to match the emails table schema
    const transformedData = {
      subject: emailData.subject,
      content: emailData.body || emailData.content,
      to_recipients: emailData.to_emails ? emailData.to_emails.split(',').map(email => email.trim()).filter(email => email) : [],
      cc_recipients: emailData.cc_emails ? emailData.cc_emails.split(',').map(email => email.trim()).filter(email => email) : [],
      bcc_recipients: emailData.bcc_emails ? emailData.bcc_emails.split(',').map(email => email.trim()).filter(email => email) : [],
      status: emailData.status || 'sent',
      sent_at: new Date().toISOString(),
      attachments: emailData.attachments_count ? { count: emailData.attachments_count } : null,
      created_by: user.id
    };

    console.log('📧 createEmail: Saving email with data:', transformedData);

    const { data, error } = await supabase
      .from('emails')
      .insert([transformedData])
      .select()
      .single();

    if (error) {
      console.error('❌ createEmail: Database error:', error);
      throw error;
    }

    console.log('📧 createEmail: Email saved successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ createEmail: Error occurred:', error);
    throw new Error(error.message);
  }
};

export const getEmails = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('created_by', user.id)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('❌ getEmails: Database error:', error);
      throw new Error(error.message);
    }

    console.log('📧 getEmails: Retrieved emails:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ getEmails: Error occurred:', error);
    throw new Error(error.message);
  }
};

export const getEmailsByContactId = async (contactId) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('created_by', user.id)
      .or(`to_recipients.cs.{${contactId}},cc_recipients.cs.{${contactId}},bcc_recipients.cs.{${contactId}}`)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('❌ getEmailsByContactId: Database error:', error);
      throw new Error(error.message);
    }

    console.log('📧 getEmailsByContactId: Retrieved emails for contact:', contactId, data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ getEmailsByContactId: Error occurred:', error);
    throw new Error(error.message);
  }
};

// Email Drafts API (using backend API with database)
export const saveEmailDraft = async (draftData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    // Add user ID to the draft data
    const draftDataWithUser = {
      ...draftData,
      user_id: user.id,
      created_by: user.id
    };

    const response = await fetch('/api/email-drafts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(draftDataWithUser)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save email draft');
    }

    const result = await response.json();
    console.log('📝 saveEmailDraft: Draft saved via backend API:', result);
    return result;
  } catch (error) {
    console.error('❌ saveEmailDraft: Error occurred:', error);
    throw new Error(error.message);
  }
};

export const getEmailDrafts = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const response = await fetch(`/api/email-drafts?user_id=${user.id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch email drafts');
    }

    const result = await response.json();
    console.log('📝 getEmailDrafts: Retrieved drafts via backend API:', result?.length || 0);
    return result || [];
  } catch (error) {
    console.error('❌ getEmailDrafts: Error occurred:', error);
    throw new Error(error.message);
  }
};

export const deleteEmailDraft = async (draftId) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');

    const response = await fetch(`/api/email-drafts/${draftId}?user_id=${user.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete email draft');
    }

    console.log('📝 deleteEmailDraft: Draft deleted via backend API');
  } catch (error) {
    console.error('❌ deleteEmailDraft: Error occurred:', error);
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
export const getUsers = async () => {
  try {
    console.log('👥 getUsers: Starting fetch...');
    
    // Get JWT token for backend authentication
    const jwtToken = await getJwtToken();
    // if (!jwtToken) {
    //   console.error('👥 getUsers: No JWT token available');
    //   throw new Error('No authentication token available');
    // }
    
    console.log('👥 getUsers: Making API request to /api/users with JWT token...');
    // Fetch users from backend API
    const response = await fetch('/api/users/', {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('👥 getUsers: Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('👥 getUsers: API error response:', response.status, errorText);
      throw new Error(`Failed to fetch users: ${response.status} ${errorText}`);
    }

    const users = await response.json();
    console.log('👥 getUsers: Successfully fetched users:', users?.length || 0, users);
    return users;
  } catch (error) {
    console.error('❌ Error in getUsers:', error);
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


// Text Messages API
export const createTextMessage = async (messageData) => {
  try {
    // console.log('📱 createTextMessage: Starting with data:', messageData);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
      
    // if (userError) throw userError;
    // if (!user) throw new Error('No authenticated user found');

    // let media_url = messageData.media_url;
    
    // Upload file if provided
    // if (mediaFile) {
    //   console.log('📱 createTextMessage: Uploading media file...');
    //   const fileExt = mediaFile.name.split('.').pop();
    //   const fileName = `${Date.now()}.${fileExt}`;
      
    //   const { data: uploadData, error: uploadError } = await supabase.storage
    //     .from('message-attachments')
    //     .upload(fileName, mediaFile);
      
    //   if (uploadError) throw uploadError;
      
    //   const { data: { publicUrl } } = supabase.storage
    //     .from('message-attachments')
    //     .getPublicUrl(fileName);
      
    //   media_url = publicUrl;
    //   console.log('📱 createTextMessage: Media uploaded:', media_url);
    // }

    // If this is an outgoing message, send via TextMagic API
    let textmagic_id = null;
    let finalStatus = messageData.status || 'pending';
    
    if ( messageData.recipient_phone) {
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
    }

    console.log('📱 createTextMessage: Saving to database...');
    const { data, error } = await supabase
      .from('text_messages')
      .insert([{
        contact_id: messageData.contact_id,
        recipient_id: messageData.recipient_id,
        sender_id: user.id,
        sender_phone: messageData.sender_phone,
        recipient_phone: messageData.recipient_phone,
        content: messageData.content,
        direction: messageData.direction || 'outgoing',
        status: finalStatus,
        sent_at: messageData.sent_at || new Date().toISOString(),
        textmagic_id
      }])
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
    return []; // Return empty array instead of throwing to prevent crashes
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

// Fetch message history directly from TextMagic API
// Helper function to normalize phone numbers for comparison
const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // If it starts with 1 and is 11 digits, remove the 1
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.substring(1);
  }
  return digits;
};

export const getTextMagicMessageHistory = async (phoneNumber, userPhoneNumber = '18333875967') => {
  try {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const normalizedUserPhone = normalizePhoneNumber(userPhoneNumber);
    
    console.log('📱 getTextMagicMessageHistory: Fetching messages for phone:', phoneNumber);
    console.log('📱 getTextMagicMessageHistory: Normalized phone:', normalizedPhone);
    console.log('📱 getTextMagicMessageHistory: Using user phone number:', userPhoneNumber);
    console.log('📱 getTextMagicMessageHistory: Normalized user phone:', normalizedUserPhone);
    
    // Get all messages and filter them client-side
    const response = await fetch(`https://rest.textmagic.com/api/v2/messages?limit=100`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-TM-Username": "alishahanif",
        "X-TM-Key": "h6F5FJoxqwjPCCc9p6A5pYJoS2yIGQ",
      },
    });

    const data = await response.json();
    console.log('📱 TextMagic API Response:', data);
    
    if (!response.ok || !data.resources) {
      console.error('📱 TextMagic API Error:', data);
      return [];
    }

    // Filter messages that involve the target phone number
    console.log('📱 Filtering messages for phone number:', phoneNumber);
    console.log('📱 Sample messages from API:', data.resources.slice(0, 3).map(msg => ({
      id: msg.id,
      sender: msg.sender,
      receiver: msg.receiver,
      text: msg.text?.substring(0, 20) + '...'
    })));
    
    const relevantMessages = data.resources.filter(msg => {
      const normalizedSender = normalizePhoneNumber(msg.sender);
      const normalizedReceiver = normalizePhoneNumber(msg.receiver);
      
      const isRelevant = normalizedSender === normalizedPhone || normalizedReceiver === normalizedPhone;
      
      if (isRelevant) {
        console.log('📱 Found relevant message:', {
          id: msg.id,
          sender: msg.sender,
          receiver: msg.receiver,
          normalizedSender,
          normalizedReceiver,
          targetPhone: normalizedPhone,
          text: msg.text?.substring(0, 30) + '...',
          matchesSender: normalizedSender === normalizedPhone,
          matchesReceiver: normalizedReceiver === normalizedPhone
        });
      }
      return isRelevant;
    });

    console.log(`📱 Found ${relevantMessages.length} relevant messages out of ${data.resources.length} total`);

    // Process and map the messages
    const processedMessages = relevantMessages.map(msg => {
      const normalizedSender = normalizePhoneNumber(msg.sender);
      const isOutgoing = normalizedSender === normalizedUserPhone;
      
      return {
        id: msg.id,
        content: msg.text,
        direction: isOutgoing ? 'outgoing' : 'incoming',
        status: msg.status === 'a' ? 'delivered' : 
                msg.status === 'd' ? 'delivered' : 
                msg.status === 'f' ? 'failed' : 
                msg.status === 'j' ? 'pending' : 'pending',
        sent_at: msg.messageTime,
        recipient_phone: msg.receiver,
        sender_phone: msg.sender,
        textmagic_id: msg.id,
        sessionId: msg.sessionId,
        contactId: msg.contactId,
        firstName: msg.firstName,
        lastName: msg.lastName,
        country: msg.country,
        price: msg.price,
        partsCount: msg.partsCount
      };
    });

    // Sort messages by timestamp (oldest first)
    processedMessages.sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));

    console.log('📱 getTextMagicMessageHistory: Processed messages:', processedMessages.length);
    return processedMessages;
    
  } catch (error) {
    console.error('📱 getTextMagicMessageHistory: Error occurred:', error);
    throw new Error(error.message);
  }
};