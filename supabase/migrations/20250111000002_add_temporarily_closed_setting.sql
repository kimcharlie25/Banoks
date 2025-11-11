/*
  # Add Temporarily Closed Setting

  1. Add temporarily closed setting to site_settings table
    - is_temporarily_closed - Boolean flag to temporarily close the restaurant
*/

-- Insert temporarily closed setting
INSERT INTO site_settings (id, value, type, description) VALUES
  ('is_temporarily_closed', 'false', 'boolean', 'When true, customers will see a temporary closure notice and cannot order')
ON CONFLICT (id) DO NOTHING;

