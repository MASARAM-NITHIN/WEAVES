CREATE TABLE customer_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_code VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    saree_interest VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
