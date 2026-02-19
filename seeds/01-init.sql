-- Seed script for PostgreSQL
-- This script will be automatically executed by docker-entrypoint-initdb.d

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- Insert seed data
-- Note: For production, passwords should be hashed. These are bcrypt hashes of 'password123'
INSERT INTO users (username, email, password_hash, role) VALUES
  ('user1', 'user1@example.com', '$2a$10$1234567890123456789012.abc', 'user'),
  ('user2', 'user2@example.com', '$2a$10$1234567890123456789012.def', 'user'),
  ('admin', 'admin@example.com', '$2a$10$1234567890123456789012.ghi', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO posts (title, content, author_id, published) VALUES
  ('First Post', 'This is the first post by user1', 1, true),
  ('Second Post', 'Another great post from user1', 1, true),
  ('User2 Post', 'A post from user2', 2, true),
  ('Admin Post', 'Post from the admin user', 3, false)
ON CONFLICT DO NOTHING;

INSERT INTO comments (content, author_id, post_id) VALUES
  ('Great post!', 2, 1),
  ('Thanks for sharing', 3, 1),
  ('I agree with this', 1, 3),
  ('Nice insights', 2, 2)
ON CONFLICT DO NOTHING;
