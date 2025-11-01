-- Banok's Menu Items SQL
-- Insert menu items for Banok's restaurant
-- IDs are auto-generated using UUID functions

-- First, let's insert categories if they don't exist
INSERT INTO categories (id, name, icon, sort_order, active)
VALUES 
  ('banoks-signature-inasal', 'Signature Inasal', '🍗', 1, true),
  ('java-rice-series', 'Java Rice Series', '🍚', 2, true),
  ('datu-pastil', 'Datu Pastil', '🌯', 3, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- I. BANOK'S SIGNATURE INASAL
-- ============================================

-- 1. Paa (B1)
WITH inserted_paa AS (
  INSERT INTO menu_items (
    name,
    description,
    base_price,
    category,
    popular,
    available,
    image_url,
    discount_price,
    discount_active
  )
  VALUES (
    'Paa (B1)',
    'Banok''s Signature Chicken Leg - Grilled to perfection',
    137.00,
    'banoks-signature-inasal',
    true,
    true,
    null,
    null,
    false
  )
  RETURNING id
)
-- Insert variations for Paa
INSERT INTO variations (menu_item_id, name, price)
SELECT id, 'Solo Rice', 0.00 FROM inserted_paa
UNION ALL
SELECT id, 'Unli Rice', 10.00 FROM inserted_paa;

-- Insert add-on for Paa
WITH paa_item AS (
  SELECT id FROM menu_items WHERE name = 'Paa (B1)' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO add_ons (menu_item_id, name, price, category)
SELECT id, 'Pastil Toppings', 20.00, 'toppings' FROM paa_item;


-- 2. Pecho (B2)
WITH inserted_pecho AS (
  INSERT INTO menu_items (
    name,
    description,
    base_price,
    category,
    popular,
    available,
    image_url,
    discount_price,
    discount_active
  )
  VALUES (
    'Pecho (B2)',
    'Banok''s Signature Chicken Breast - Juicy and flavorful',
    147.00,
    'banoks-signature-inasal',
    true,
    true,
    null,
    null,
    false
  )
  RETURNING id
)
-- Insert variations for Pecho
INSERT INTO variations (menu_item_id, name, price)
SELECT id, 'Solo Rice', 0.00 FROM inserted_pecho
UNION ALL
SELECT id, 'Unli Rice', 10.00 FROM inserted_pecho;

-- Insert add-on for Pecho
WITH pecho_item AS (
  SELECT id FROM menu_items WHERE name = 'Pecho (B2)' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO add_ons (menu_item_id, name, price, category)
SELECT id, 'Pastil Toppings', 20.00, 'toppings' FROM pecho_item;


-- ============================================
-- II. JAVA RICE SERIES
-- ============================================

-- 1. Solo (Java Rice with one chicken piece)
INSERT INTO menu_items (
  name,
  description,
  base_price,
  category,
  popular,
  available,
  image_url,
  discount_price,
  discount_active
)
VALUES (
  'Solo',
  'Java Rice with one chicken piece - Perfect for one',
  169.00,
  'java-rice-series',
  false,
  true,
  null,
  null,
  false
);

-- 2. Kasalo (Large Java Rice in a tray with two chicken pieces)
INSERT INTO menu_items (
  name,
  description,
  base_price,
  category,
  popular,
  available,
  image_url,
  discount_price,
  discount_active
)
VALUES (
  'Kasalo',
  'Large Java Rice in a tray with two chicken pieces - Great for sharing',
  289.00,
  'java-rice-series',
  true,
  true,
  null,
  null,
  false
);

-- 3. Just Java (A serving of Java Rice only)
INSERT INTO menu_items (
  name,
  description,
  base_price,
  category,
  popular,
  available,
  image_url,
  discount_price,
  discount_active
)
VALUES (
  'Just Java',
  'A serving of Java Rice only - Flavorful rice side',
  49.00,
  'java-rice-series',
  false,
  true,
  null,
  null,
  false
);


-- ============================================
-- III. DATU PASTIL - CHICKEN PASTIL
-- ============================================

-- 1. Chicken Pastil in Annatto Oil
INSERT INTO menu_items (
  name,
  description,
  base_price,
  category,
  popular,
  available,
  image_url,
  discount_price,
  discount_active
)
VALUES (
  'Chicken Pastil in Annatto Oil',
  'Traditional chicken pastil served with rice - A Filipino favorite',
  49.00,
  'datu-pastil',
  false,
  true,
  null,
  null,
  false
);

-- Verify the insertions
SELECT 
  mi.name,
  mi.base_price,
  mi.category,
  c.name as category_name,
  COALESCE(
    (SELECT COUNT(*) FROM variations v WHERE v.menu_item_id = mi.id),
    0
  ) as variation_count,
  COALESCE(
    (SELECT COUNT(*) FROM add_ons a WHERE a.menu_item_id = mi.id),
    0
  ) as addon_count
FROM menu_items mi
LEFT JOIN categories c ON mi.category = c.id
WHERE mi.category IN ('banoks-signature-inasal', 'java-rice-series', 'datu-pastil')
ORDER BY c.sort_order, mi.created_at;

