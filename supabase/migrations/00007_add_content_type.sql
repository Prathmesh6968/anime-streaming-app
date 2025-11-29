/*
# Add Content Type Support

## 1. Changes
- Add `content_type` column to anime table
  - Type: text
  - Values: 'anime' or 'cartoon'
  - Default: 'anime'
  - Not null

## 2. Purpose
- Support both Anime and Cartoon content
- Allow filtering by content type
- Maintain backward compatibility

## 3. Migration Steps
1. Add content_type column with default 'anime'
2. Update existing records to 'anime'
3. Add index for better query performance

## 4. Notes
- All existing content will be marked as 'anime'
- New cartoon content can be added with content_type = 'cartoon'
- All features (episodes, watchlist, progress) work for both types
*/

-- Add content_type column to anime table
ALTER TABLE anime 
ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'anime' NOT NULL;

-- Add check constraint to ensure valid content types
ALTER TABLE anime 
ADD CONSTRAINT content_type_check 
CHECK (content_type IN ('anime', 'cartoon'));

-- Update existing records to be 'anime' (if any don't have it set)
UPDATE anime 
SET content_type = 'anime' 
WHERE content_type IS NULL;

-- Add index for better query performance when filtering by content_type
CREATE INDEX IF NOT EXISTS idx_anime_content_type ON anime(content_type);

-- Add comment to document the column
COMMENT ON COLUMN anime.content_type IS 'Type of content: anime or cartoon';
