INSERT INTO fabric_types (fabric_name, description, image_url)
SELECT 'Pure Silk', 'Authentic traditional handloom pure silk.', 'https://images.unsplash.com/photo-1583391733958-d25e07fac044?auto=format&fit=crop&q=80&w=800'
WHERE NOT EXISTS (SELECT 1 FROM fabric_types WHERE fabric_name = 'Pure Silk');

INSERT INTO fabric_types (fabric_name, description, image_url)
SELECT 'Soft Silk', 'Lightweight and easy to drape soft silk sarees.', 'https://images.unsplash.com/photo-1610189044230-038c36829707?auto=format&fit=crop&q=80&w=800'
WHERE NOT EXISTS (SELECT 1 FROM fabric_types WHERE fabric_name = 'Soft Silk');

INSERT INTO fabric_types (fabric_name, description, image_url)
SELECT 'Organza Silk', 'Elegant sheer organza silk for a modern look.', 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&q=80&w=800'
WHERE NOT EXISTS (SELECT 1 FROM fabric_types WHERE fabric_name = 'Organza Silk');

INSERT INTO fabric_types (fabric_name, description, image_url)
SELECT 'Chanderi Silk', 'Traditional sheer texture with fine zari work.', 'https://images.unsplash.com/photo-1583391733958-d25e07fac044?auto=format&fit=crop&q=80&w=800'
WHERE NOT EXISTS (SELECT 1 FROM fabric_types WHERE fabric_name = 'Chanderi Silk');

INSERT INTO fabric_types (fabric_name, description, image_url)
SELECT 'Pure Cotton', 'Breathable and comfortable authentic pure cotton.', 'https://images.unsplash.com/photo-1610189044230-038c36829707?auto=format&fit=crop&q=80&w=800'
WHERE NOT EXISTS (SELECT 1 FROM fabric_types WHERE fabric_name = 'Pure Cotton');

INSERT INTO fabric_types (fabric_name, description, image_url)
SELECT 'Linen Silk', 'A perfect blend of linen comfort and silk elegance.', 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&q=80&w=800'
WHERE NOT EXISTS (SELECT 1 FROM fabric_types WHERE fabric_name = 'Linen Silk');

INSERT INTO fabric_types (fabric_name, description, image_url)
SELECT 'Gadwal Silk', 'Renowned for contrasting borders and heavy zari.', 'https://images.unsplash.com/photo-1583391733958-d25e07fac044?auto=format&fit=crop&q=80&w=800'
WHERE NOT EXISTS (SELECT 1 FROM fabric_types WHERE fabric_name = 'Gadwal Silk');
