/*
# Add Seasons Support to Anime

## Changes:
1. Add `series_name` column to store the main series name
2. Add `season_number` column to store the season number (1, 2, 3, etc.)

## Purpose:
- Allow grouping anime by series
- Display all seasons when viewing an anime
- Enable season management in admin panel

## Example:
- Series Name: "Attack on Titan"
- Season 1: "Attack on Titan"
- Season 2: "Attack on Titan Season 2"
- Season 3: "Attack on Titan Season 3"

## Notes:
- series_name defaults to the anime title for backward compatibility
- season_number defaults to 1
- Existing anime will be treated as Season 1 of their respective series
*/

-- Add series_name column (defaults to title for existing records)
ALTER TABLE anime 
ADD COLUMN IF NOT EXISTS series_name text;

-- Add season_number column (defaults to 1)
ALTER TABLE anime 
ADD COLUMN IF NOT EXISTS season_number integer DEFAULT 1;

-- Update existing records to set series_name to title
UPDATE anime 
SET series_name = title 
WHERE series_name IS NULL;

-- Make series_name NOT NULL after setting defaults
ALTER TABLE anime 
ALTER COLUMN series_name SET NOT NULL;

-- Create index for faster season queries
CREATE INDEX IF NOT EXISTS idx_anime_series_name ON anime(series_name);
CREATE INDEX IF NOT EXISTS idx_anime_season_number ON anime(season_number);