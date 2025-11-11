/*
  # Add Welcome Section Settings

  1. Add welcome section settings to site_settings table
    - welcome_greeting - Main greeting text (e.g., "Maayong adlaw!")
    - welcome_description - Description text shown below greeting
*/

-- Insert welcome section settings
INSERT INTO site_settings (id, value, type, description) VALUES
  ('welcome_greeting', 'Maayong adlaw!', 'text', 'Main greeting text shown at the top of the menu page'),
  ('welcome_description', 'Known as the Manukan Original, Banok''s serve dishes marinated in special local spices and grilled the traditional way. It''s smoky, juicy, and full of Bisaya flavor  —  traditional, grilled with passion, and shared with love. Proudly local.🔥', 'text', 'Description text shown below the greeting on menu page')
ON CONFLICT (id) DO NOTHING;

