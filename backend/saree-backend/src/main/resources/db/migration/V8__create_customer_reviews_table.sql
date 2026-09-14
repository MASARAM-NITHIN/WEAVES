CREATE TABLE customer_reviews (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    saree_id BIGINT NOT NULL,
    customer_id BIGINT,
    order_item_id BIGINT,
    customer_name VARCHAR(255) NOT NULL,
    comment TEXT,
    rating SMALLINT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_saree FOREIGN KEY (saree_id) REFERENCES sarees(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    CONSTRAINT fk_reviews_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
);
