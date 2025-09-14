-- Skill Swap Platform Database Schema

-- Users table with enhanced auth
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    location TEXT,
    profile_photo_url TEXT,
    availability TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills table
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('offered', 'wanted')) NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Swap requests table
CREATE TABLE swap_requests (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_offered VARCHAR(100) NOT NULL,
    skill_requested VARCHAR(100) NOT NULL,
    status VARCHAR(10) CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    swap_id INTEGER REFERENCES swap_requests(id) ON DELETE CASCADE,
    rated_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rated_user INTEGER REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 1 AND score <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform messages table (for admin announcements)
CREATE TABLE platform_messages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'update', 'maintenance')),
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin logs table
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table for in-app messaging
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    swap_id INTEGER REFERENCES swap_requests(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_banned ON users(is_banned);
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_type ON skills(type);
CREATE INDEX idx_skills_approved ON skills(is_approved);
CREATE INDEX idx_swap_requests_sender ON swap_requests(sender_id);
CREATE INDEX idx_swap_requests_receiver ON swap_requests(receiver_id);
CREATE INDEX idx_swap_requests_status ON swap_requests(status);
CREATE INDEX idx_ratings_swap_id ON ratings(swap_id);
CREATE INDEX idx_platform_messages_active ON platform_messages(is_active);
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_messages_swap_id ON messages(swap_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);