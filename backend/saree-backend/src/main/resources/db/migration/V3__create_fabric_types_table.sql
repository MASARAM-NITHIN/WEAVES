CREATE TABLE fabric_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fabric_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(255)
);
