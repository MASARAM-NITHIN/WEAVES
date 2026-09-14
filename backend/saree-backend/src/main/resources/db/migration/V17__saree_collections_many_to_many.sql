-- 1. Create the join table for Many-To-Many relationship between sarees and theme_collections
CREATE TABLE IF NOT EXISTS saree_collections (
    saree_id BIGINT NOT NULL,
    collection_id BIGINT NOT NULL,
    PRIMARY KEY (saree_id, collection_id),
    CONSTRAINT fk_saree_collections_saree FOREIGN KEY (saree_id) REFERENCES sarees (id) ON DELETE CASCADE,
    CONSTRAINT fk_saree_collections_collection FOREIGN KEY (collection_id) REFERENCES theme_collections (id) ON DELETE CASCADE
);

-- 2. Migrate existing data from sarees.collection_id to the new join table
INSERT INTO saree_collections (saree_id, collection_id)
SELECT id, collection_id 
FROM sarees 
WHERE collection_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Drop the old collection_id column from the sarees table
ALTER TABLE sarees DROP COLUMN collection_id;
