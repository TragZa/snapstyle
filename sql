CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    subscription_plan VARCHAR(50) NOT NULL DEFAULT 'free',
    profile_photo_url VARCHAR(255)
);