CREATE TABLE theme_collections (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    collection_name VARCHAR(100) UNIQUE NOT NULL,
    badge VARCHAR(50),
    description TEXT,
    image_url VARCHAR(255),
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
