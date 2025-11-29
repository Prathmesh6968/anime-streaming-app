/*
# Add Sample Anime Data

This migration adds sample anime series and episodes for demonstration purposes.

## Sample Data Includes:
- 6 popular anime series with complete information
- Multiple episodes for each series
- Variety of genres, statuses, and release years

## Note:
This is demonstration data. Admins can manage this through the admin dashboard.
*/

-- Insert sample anime
INSERT INTO anime (title, description, thumbnail_url, banner_url, genres, season, release_year, status, total_episodes) VALUES
(
  'Attack on Titan',
  'Humanity lives inside cities surrounded by enormous walls due to the Titans, gigantic humanoid creatures who devour humans seemingly without reason. The story follows Eren Yeager, who vows to exterminate the Titans after they bring about the destruction of his hometown.',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=450&fit=crop',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=400&fit=crop',
  ARRAY['Action', 'Fantasy', 'Drama'],
  'Spring 2013',
  2013,
  'Completed',
  75
),
(
  'Demon Slayer',
  'A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly. Tanjiro sets out to become a demon slayer to avenge his family and cure his sister.',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&h=450&fit=crop',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1920&h=400&fit=crop',
  ARRAY['Action', 'Adventure', 'Supernatural'],
  'Spring 2019',
  2019,
  'Ongoing',
  26
),
(
  'My Hero Academia',
  'In a world where people with superpowers are the norm, Izuku Midoriya is born without any powers. Despite this, he dreams of becoming a hero and is eventually scouted by the world''s greatest hero.',
  'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=300&h=450&fit=crop',
  'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1920&h=400&fit=crop',
  ARRAY['Action', 'Adventure', 'Comedy'],
  'Spring 2016',
  2016,
  'Ongoing',
  113
),
(
  'Jujutsu Kaisen',
  'A boy swallows a cursed talisman and becomes possessed by a powerful curse. He joins a secret organization of Jujutsu Sorcerers to kill the curse and save himself.',
  'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=300&h=450&fit=crop',
  'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=1920&h=400&fit=crop',
  ARRAY['Action', 'Supernatural', 'Fantasy'],
  'Fall 2020',
  2020,
  'Ongoing',
  24
),
(
  'Spy x Family',
  'A spy must create a fake family to execute a mission, not realizing that his adopted daughter is a telepath and his wife is a skilled assassin. Despite their hidden identities, they must learn to live together.',
  'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=300&h=450&fit=crop',
  'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=1920&h=400&fit=crop',
  ARRAY['Comedy', 'Action', 'Slice of Life'],
  'Spring 2022',
  2022,
  'Ongoing',
  25
),
(
  'One Punch Man',
  'The story of Saitama, a hero who can defeat any opponent with a single punch but seeks to find a worthy opponent after growing bored by a lack of challenge.',
  'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=300&h=450&fit=crop',
  'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=1920&h=400&fit=crop',
  ARRAY['Action', 'Comedy', 'Sci-Fi'],
  'Fall 2015',
  2015,
  'Ongoing',
  24
);

-- Get anime IDs for episode insertion
DO $$
DECLARE
  aot_id uuid;
  ds_id uuid;
  mha_id uuid;
  jjk_id uuid;
  sxf_id uuid;
  opm_id uuid;
BEGIN
  -- Get anime IDs
  SELECT id INTO aot_id FROM anime WHERE title = 'Attack on Titan';
  SELECT id INTO ds_id FROM anime WHERE title = 'Demon Slayer';
  SELECT id INTO mha_id FROM anime WHERE title = 'My Hero Academia';
  SELECT id INTO jjk_id FROM anime WHERE title = 'Jujutsu Kaisen';
  SELECT id INTO sxf_id FROM anime WHERE title = 'Spy x Family';
  SELECT id INTO opm_id FROM anime WHERE title = 'One Punch Man';

  -- Insert sample episodes for Attack on Titan
  INSERT INTO episodes (anime_id, episode_number, title, video_url, duration) VALUES
  (aot_id, 1, 'To You, in 2000 Years', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440),
  (aot_id, 2, 'That Day', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440),
  (aot_id, 3, 'A Dim Light Amid Despair', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440);

  -- Insert sample episodes for Demon Slayer
  INSERT INTO episodes (anime_id, episode_number, title, video_url, duration) VALUES
  (ds_id, 1, 'Cruelty', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440),
  (ds_id, 2, 'Trainer Sakonji Urokodaki', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440),
  (ds_id, 3, 'Sabito and Makomo', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440);

  -- Insert sample episodes for My Hero Academia
  INSERT INTO episodes (anime_id, episode_number, title, video_url, duration) VALUES
  (mha_id, 1, 'Izuku Midoriya: Origin', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440),
  (mha_id, 2, 'What It Takes to Be a Hero', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440),
  (mha_id, 3, 'Roaring Muscles', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440);

  -- Insert sample episodes for Jujutsu Kaisen
  INSERT INTO episodes (anime_id, episode_number, title, video_url, duration) VALUES
  (jjk_id, 1, 'Ryomen Sukuna', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440),
  (jjk_id, 2, 'For Myself', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440),
  (jjk_id, 3, 'Girl of Steel', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440);

  -- Insert sample episodes for Spy x Family
  INSERT INTO episodes (anime_id, episode_number, title, video_url, duration) VALUES
  (sxf_id, 1, 'Operation Strix', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440),
  (sxf_id, 2, 'Secure a Wife', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440),
  (sxf_id, 3, 'Prepare for the Interview', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440);

  -- Insert sample episodes for One Punch Man
  INSERT INTO episodes (anime_id, episode_number, title, video_url, duration) VALUES
  (opm_id, 1, 'The Strongest Man', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440),
  (opm_id, 2, 'The Lone Cyborg', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440),
  (opm_id, 3, 'The Obsessive Scientist', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1440);
END $$;