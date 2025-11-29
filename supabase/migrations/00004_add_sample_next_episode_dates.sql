/*
# Add Sample Next Episode Dates

## Changes:
- Set next episode dates for ongoing anime series
- Dates are set to future times to demonstrate the countdown timer
- Only applies to anime with 'Ongoing' status

## Sample Data:
- Demon Slayer: 7 days from now
- My Hero Academia: 3 days from now
- Jujutsu Kaisen: 5 days from now
*/

-- Update ongoing anime with sample next episode dates
UPDATE anime 
SET next_episode_date = NOW() + INTERVAL '7 days'
WHERE title = 'Demon Slayer' AND status = 'Ongoing';

UPDATE anime 
SET next_episode_date = NOW() + INTERVAL '3 days'
WHERE title = 'My Hero Academia' AND status = 'Ongoing';

UPDATE anime 
SET next_episode_date = NOW() + INTERVAL '5 days'
WHERE title = 'Jujutsu Kaisen' AND status = 'Ongoing';

UPDATE anime 
SET next_episode_date = NOW() + INTERVAL '10 days'
WHERE title = 'Spy x Family' AND status = 'Ongoing';

UPDATE anime 
SET next_episode_date = NOW() + INTERVAL '14 days'
WHERE title = 'One Punch Man' AND status = 'Ongoing';