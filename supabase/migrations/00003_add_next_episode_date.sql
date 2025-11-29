/*
# Add Next Episode Date Field

## Changes:
- Add `next_episode_date` field to anime table for countdown timer
- This field stores the estimated date/time when the next episode will be released
- Only relevant for ongoing anime series

## Usage:
- Admins can set this date through the admin dashboard
- Frontend will display a countdown timer showing time remaining
- Useful for keeping viewers engaged with ongoing series
*/

ALTER TABLE anime ADD COLUMN IF NOT EXISTS next_episode_date timestamptz;