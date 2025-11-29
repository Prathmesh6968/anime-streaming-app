/*
# Add Languages Support to Anime

## Changes:
1. Add `languages` column to anime table
   - Type: text[] (array of text)
   - Stores available audio languages/dubs for each anime
   - Examples: ['Hindi', 'English', 'Japanese', 'Tamil', 'Telugu']
   - Nullable: allows null for anime without specified languages

## Purpose:
- Allow admins to specify which language dubs are available
- Display language badges on anime cards
- Enable future language-based filtering

## Sample Languages:
- Hindi
- English
- Japanese (Original)
- Tamil
- Telugu
- Bengali
- Spanish
- French
- German
*/

-- Add languages column to anime table
ALTER TABLE anime 
ADD COLUMN languages text[] DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN anime.languages IS 'Available audio languages/dubs for this anime';

-- Update some existing anime with sample language data
UPDATE anime 
SET languages = ARRAY['Hindi', 'Japanese', 'English']
WHERE title IN ('Demon Slayer', 'My Hero Academia', 'Attack on Titan');

UPDATE anime 
SET languages = ARRAY['Hindi', 'Japanese']
WHERE title IN ('Jujutsu Kaisen', 'One Punch Man', 'Spy x Family');

UPDATE anime 
SET languages = ARRAY['Japanese', 'English']
WHERE title IN ('Death Note', 'Fullmetal Alchemist: Brotherhood');

UPDATE anime 
SET languages = ARRAY['Hindi', 'Tamil', 'Japanese', 'English']
WHERE title = 'Naruto';

UPDATE anime 
SET languages = ARRAY['Japanese']
WHERE languages IS NULL;