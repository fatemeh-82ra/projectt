\c postgres

-- Create the database
CREATE DATABASE mydatabase;

-- Connect to the newly created database
\c mydatabase;

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Assuming hashed passwords
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the groups table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(200),
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Prevent deleting a user who owns groups
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a unique index for case-insensitive name check
CREATE UNIQUE INDEX groups_name_case_insensitive_idx ON groups (LOWER(name));

-- Create the group_members join table
CREATE TABLE group_members (
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, user_id)
);

-- Optional: Add some dummy data for testing
INSERT INTO users (full_name, email, password) VALUES
('Admin User', 'admin@example.com', 'password'),
('John Doe', 'john.doe@example.com', 'password'),
('Jane Smith', 'jane.smith@example.com', 'password');

