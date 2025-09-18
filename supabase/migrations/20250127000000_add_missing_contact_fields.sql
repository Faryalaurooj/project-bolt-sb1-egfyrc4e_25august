/*
  # Add missing contact fields based on image analysis

  This migration adds fields that are visible in the Personal Lines Customer Details screen
  but missing from the current contacts table schema.

  New Fields Added:
    - customer_id: Unique customer identifier
    - mailing_address: Separate mailing address
    - mailing_city: Mailing address city
    - mailing_state: Mailing address state
    - mailing_zip: Mailing address zip
    - email2: Secondary email address
    - drivers_license: Driver's license number
    - dl_state: State that issued the driver's license
    - date_licensed: When the driver's license was issued
    - do_not_email: Communication preference
    - do_not_text: Communication preference
    - do_not_call: Communication preference
    - do_not_mail: Communication preference
    - do_not_market: Communication preference
    - do_not_capture_email: Communication preference
    - preferred_contact_method: How the customer prefers to be contacted
*/

-- Add customer ID field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE contacts ADD COLUMN customer_id text UNIQUE;
  END IF;
END $$;

-- Add mailing address fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'mailing_address'
  ) THEN
    ALTER TABLE contacts ADD COLUMN mailing_address text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'mailing_city'
  ) THEN
    ALTER TABLE contacts ADD COLUMN mailing_city text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'mailing_state'
  ) THEN
    ALTER TABLE contacts ADD COLUMN mailing_state text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'mailing_zip'
  ) THEN
    ALTER TABLE contacts ADD COLUMN mailing_zip text;
  END IF;
END $$;

-- Add secondary email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'email2'
  ) THEN
    ALTER TABLE contacts ADD COLUMN email2 text;
  END IF;
END $$;

-- Add driver's license fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'drivers_license'
  ) THEN
    ALTER TABLE contacts ADD COLUMN drivers_license text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'dl_state'
  ) THEN
    ALTER TABLE contacts ADD COLUMN dl_state text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'date_licensed'
  ) THEN
    ALTER TABLE contacts ADD COLUMN date_licensed date;
  END IF;
END $$;

-- Add communication preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'do_not_email'
  ) THEN
    ALTER TABLE contacts ADD COLUMN do_not_email boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'do_not_text'
  ) THEN
    ALTER TABLE contacts ADD COLUMN do_not_text boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'do_not_call'
  ) THEN
    ALTER TABLE contacts ADD COLUMN do_not_call boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'do_not_mail'
  ) THEN
    ALTER TABLE contacts ADD COLUMN do_not_mail boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'do_not_market'
  ) THEN
    ALTER TABLE contacts ADD COLUMN do_not_market boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'do_not_capture_email'
  ) THEN
    ALTER TABLE contacts ADD COLUMN do_not_capture_email boolean DEFAULT false;
  END IF;
END $$;

-- Add preferred contact method
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'preferred_contact_method'
  ) THEN
    ALTER TABLE contacts ADD COLUMN preferred_contact_method text;
  END IF;
END $$;

-- Create function to generate customer ID if not provided
CREATE OR REPLACE FUNCTION generate_customer_id()
RETURNS text AS $$
DECLARE
  new_id text;
  counter integer := 1;
BEGIN
  LOOP
    new_id := LPAD(counter::text, 8, '0');
    
    -- Check if this ID already exists
    IF NOT EXISTS (SELECT 1 FROM contacts WHERE customer_id = new_id) THEN
      RETURN new_id;
    END IF;
    
    counter := counter + 1;
    
    -- Prevent infinite loop (though unlikely with 8 digits)
    IF counter > 99999999 THEN
      RAISE EXCEPTION 'Unable to generate unique customer ID';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate customer_id if not provided
CREATE OR REPLACE FUNCTION set_customer_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NULL OR NEW.customer_id = '' THEN
    NEW.customer_id := generate_customer_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_customer_id_trigger
  BEFORE INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION set_customer_id();

