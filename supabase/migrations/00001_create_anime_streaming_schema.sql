/*
# Create Anime Streaming Database Schema

## 1. New Tables

### profiles
- `id` (uuid, primary key, references auth.users)
- `email` (text, unique)
- `username` (text, unique)
- `avatar_url` (text, nullable)
- `role` (user_role enum: 'user', 'admin')
- `created_at` (timestamptz, default: now())

### anime
- `id` (uuid, primary key)
- `title` (text, not null)
- `description` (text)
- `thumbnail_url` (text)
- `banner_url` (text)
- `genres` (text array)
- `season` (text, e.g., "Spring 2024")
- `release_year` (integer)
- `status` (text: 'Ongoing', 'Completed')
- `total_episodes` (integer)
- `rating` (numeric, average rating)
- `created_at` (timestamptz, default: now())

### episodes
- `id` (uuid, primary key)
- `anime_id` (uuid, references anime)
- `episode_number` (integer, not null)
- `title` (text)
- `description` (text)
- `video_url` (text, not null)
- `duration` (integer, duration in seconds)
- `thumbnail_url` (text)
- `created_at` (timestamptz, default: now())

### watchlist
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `anime_id` (uuid, references anime)
- `added_at` (timestamptz, default: now())
- Unique constraint on (user_id, anime_id)

### watch_progress
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `episode_id` (uuid, references episodes)
- `anime_id` (uuid, references anime)
- `watched` (boolean, default: false)
- `last_position` (integer, position in seconds)
- `updated_at` (timestamptz, default: now())
- Unique constraint on (user_id, episode_id)

### reviews
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `anime_id` (uuid, references anime)
- `rating` (integer, 1-10)
- `comment` (text)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())
- Unique constraint on (user_id, anime_id)

## 2. Security

- Enable RLS on all tables
- Public read access for anime and episodes (non-authenticated users can browse)
- Authenticated users can manage their own watchlist, progress, and reviews
- Admins have full access to all tables
- First registered user becomes admin automatically

## 3. Helper Functions

- `is_admin(uid uuid)`: Check if user is admin
- `handle_new_user()`: Trigger to create profile and assign admin role to first user
- `update_anime_rating()`: Trigger to update anime average rating when reviews change

## 4. Notes

- All IDs use UUID with gen_random_uuid()
- Timestamps use timestamptz with timezone support
- RLS policies ensure data security while allowing public browsing
*/

-- Create user role enum
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  username text UNIQUE,
  avatar_url text,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create anime table
CREATE TABLE IF NOT EXISTS anime (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  banner_url text,
  genres text[] DEFAULT '{}',
  season text,
  release_year integer,
  status text DEFAULT 'Ongoing' CHECK (status IN ('Ongoing', 'Completed')),
  total_episodes integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create episodes table
CREATE TABLE IF NOT EXISTS episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id uuid NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
  episode_number integer NOT NULL,
  title text,
  description text,
  video_url text NOT NULL,
  duration integer,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(anime_id, episode_number)
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anime_id uuid NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, anime_id)
);

-- Create watch_progress table
CREATE TABLE IF NOT EXISTS watch_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  episode_id uuid NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  anime_id uuid NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
  watched boolean DEFAULT false,
  last_position integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, episode_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anime_id uuid NOT NULL REFERENCES anime(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, anime_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Trigger function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    SELECT COUNT(*) INTO user_count FROM profiles;
    INSERT INTO profiles (id, email, username, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger to update anime rating when reviews change
CREATE OR REPLACE FUNCTION update_anime_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE anime
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews
    WHERE anime_id = COALESCE(NEW.anime_id, OLD.anime_id)
  )
  WHERE id = COALESCE(NEW.anime_id, OLD.anime_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_anime_rating();

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for anime (public read, admin write)
CREATE POLICY "Anime viewable by everyone" ON anime
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert anime" ON anime
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update anime" ON anime
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete anime" ON anime
  FOR DELETE USING (is_admin(auth.uid()));

-- RLS Policies for episodes (public read, admin write)
CREATE POLICY "Episodes viewable by everyone" ON episodes
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert episodes" ON episodes
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update episodes" ON episodes
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete episodes" ON episodes
  FOR DELETE USING (is_admin(auth.uid()));

-- RLS Policies for watchlist (users manage their own)
CREATE POLICY "Users can view own watchlist" ON watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own watchlist" ON watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own watchlist" ON watchlist
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all watchlists" ON watchlist
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for watch_progress (users manage their own)
CREATE POLICY "Users can view own progress" ON watch_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON watch_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON watch_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON watch_progress
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON watch_progress
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for reviews (public read, users manage their own)
CREATE POLICY "Reviews viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews" ON reviews
  FOR ALL USING (is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_episodes_anime_id ON episodes(anime_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_anime_id ON watchlist(anime_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_user_id ON watch_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_episode_id ON watch_progress(episode_id);
CREATE INDEX IF NOT EXISTS idx_reviews_anime_id ON reviews(anime_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_anime_genres ON anime USING gin(genres);
CREATE INDEX IF NOT EXISTS idx_anime_status ON anime(status);
CREATE INDEX IF NOT EXISTS idx_anime_release_year ON anime(release_year);