/*
  # Set default values for contact fields to prevent NULL values
  
  This migration updates the contacts table to set default values for fields
  that are currently showing NULL in the database, making the data more consistent.
*/

-- Update drivers_license to have empty string default instead of NULL
DO $$
BEGIN
  -- First update existing NULL values to empty strings
  UPDATE contacts 
  SET drivers_license = '' 
  WHERE drivers_license IS NULL;
  
  -- Then alter the column to have a default value
  ALTER TABLE contacts ALTER COLUMN drivers_license SET DEFAULT '';
END $$;

-- Update dl_state to have empty string default instead of NULL
DO $$
BEGIN
  -- First update existing NULL values to empty strings
  UPDATE contacts 
  SET dl_state = '' 
  WHERE dl_state IS NULL;
  
  -- Then alter the column to have a default value
  ALTER TABLE contacts ALTER COLUMN dl_state SET DEFAULT '';
END $$;

-- Update preferred_contact_method to have empty string default instead of NULL
DO $$
BEGIN
  -- First update existing NULL values to empty strings
  UPDATE contacts 
  SET preferred_contact_method = '' 
  WHERE preferred_contact_method IS NULL;
  
  -- Then alter the column to have a default value
  ALTER TABLE contacts ALTER COLUMN preferred_contact_method SET DEFAULT '';
END $$;

-- Update mailing_address to have empty string default instead of NULL
DO $$
BEGIN
  -- First update existing NULL values to empty strings
  UPDATE contacts 
  SET mailing_address = '' 
  WHERE mailing_address IS NULL;
  
  -- Then alter the column to have a default value
  ALTER TABLE contacts ALTER COLUMN mailing_address SET DEFAULT '';
END $$;

-- Update mailing_city to have empty string default instead of NULL
DO $$
BEGIN
  -- First update existing NULL values to empty strings
  UPDATE contacts 
  SET mailing_city = '' 
  WHERE mailing_city IS NULL;
  
  -- Then alter the column to have a default value
  ALTER TABLE contacts ALTER COLUMN mailing_city SET DEFAULT '';
END $$;

-- Update mailing_state to have empty string default instead of NULL
DO $$
BEGIN
  -- First update existing NULL values to empty strings
  UPDATE contacts 
  SET mailing_state = '' 
  WHERE mailing_state IS NULL;
  
  -- Then alter the column to have a default value
  ALTER TABLE contacts ALTER COLUMN mailing_state SET DEFAULT '';
END $$;

-- Update mailing_zip to have empty string default instead of NULL
DO $$
BEGIN
  -- First update existing NULL values to empty strings
  UPDATE contacts 
  SET mailing_zip = '' 
  WHERE mailing_zip IS NULL;
  
  -- Then alter the column to have a default value
  ALTER TABLE contacts ALTER COLUMN mailing_zip SET DEFAULT '';
END $$;

-- Update company_name to have empty string default instead of NULL
DO $$
BEGIN
  -- First update existing NULL values to empty strings
  UPDATE contacts 
  SET company_name = '' 
  WHERE company_name IS NULL;
  
  -- Then alter the column to have a default value
  ALTER TABLE contacts ALTER COLUMN company_name SET DEFAULT '';
END $$;

-- Update other nullable text fields to have empty string defaults
DO $$
BEGIN
  -- Update customer_sub_status
  UPDATE contacts 
  SET customer_sub_status = '' 
  WHERE customer_sub_status IS NULL;
  
  ALTER TABLE contacts ALTER COLUMN customer_sub_status SET DEFAULT '';
END $$;

DO $$
BEGIN
  -- Update customer_agent_of_record
  UPDATE contacts 
  SET customer_agent_of_record = '' 
  WHERE customer_agent_of_record IS NULL;
  
  ALTER TABLE contacts ALTER COLUMN customer_agent_of_record SET DEFAULT '';
END $$;

DO $$
BEGIN
  -- Update customer_csr
  UPDATE contacts 
  SET customer_csr = '' 
  WHERE customer_csr IS NULL;
  
  ALTER TABLE contacts ALTER COLUMN customer_csr SET DEFAULT '';
END $$;

DO $$
BEGIN
  -- Update keyed_by
  UPDATE contacts 
  SET keyed_by = '' 
  WHERE keyed_by IS NULL;
  
  ALTER TABLE contacts ALTER COLUMN keyed_by SET DEFAULT '';
END $$;

DO $$
BEGIN
  -- Update office
  UPDATE contacts 
  SET office = '' 
  WHERE office IS NULL;
  
  ALTER TABLE contacts ALTER COLUMN office SET DEFAULT '';
END $$;

DO $$
BEGIN
  -- Update source
  UPDATE contacts 
  SET source = '' 
  WHERE source IS NULL;
  
  ALTER TABLE contacts ALTER COLUMN source SET DEFAULT '';
END $$;
