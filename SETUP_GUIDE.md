# AnimeStream Hub - Setup Guide

## 🎉 Your Anime Streaming Website is Ready!

AnimeStream Hub is a fully functional anime streaming platform with user authentication, watchlist management, episode tracking, and an admin dashboard.

## 🚀 Getting Started

### First-Time Setup

1. **Sign In**: Click "Sign In" in the header to authenticate with Google SSO
2. **First User = Admin**: The first user to register automatically becomes an administrator
3. **Browse Anime**: Explore the featured and trending anime on the home page
4. **Add to Watchlist**: Click on any anime and add it to your personal watchlist

## 📋 Features Overview

### For All Users
- **Browse Anime**: Search and filter anime by genre, year, status, and more
- **Watch Episodes**: Stream anime episodes with an integrated video player
- **Track Progress**: Mark episodes as watched and resume where you left off
- **Watchlist**: Save your favorite anime for easy access
- **Rate & Review**: Share your thoughts and rate anime series

### For Administrators
- **Anime Management**: Add, edit, and delete anime series
- **Episode Management**: Upload and manage episodes for each series
- **User Management**: Manage user roles and permissions

## 🎨 Design Features

- **Dark Theme**: Modern dark interface with purple and cyan accents
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Smooth Animations**: Hover effects and transitions for a polished experience
- **Intuitive Navigation**: Easy-to-use interface with clear visual hierarchy

## 🔧 Admin Dashboard

Access the admin dashboard at `/admin` (only visible to administrators):

### Adding New Anime
1. Go to Admin Dashboard → Anime Management
2. Click "Add Anime"
3. Fill in the details:
   - Title (required)
   - Description
   - Thumbnail URL (300x450 recommended)
   - Banner URL (1920x400 recommended)
   - Genres (comma-separated)
   - Season (e.g., "Spring 2024")
   - Release Year
   - Status (Ongoing/Completed)
   - Total Episodes
4. Click "Create Anime"

### Adding Episodes
1. Go to Admin Dashboard → Episodes
2. Click "Add Episode"
3. Select the anime series
4. Enter episode details:
   - Episode Number (required)
   - Title
   - Video URL (required) - Use embeddable video URLs
   - Description
5. Click "Create Episode"

### Managing Users
1. Go to Admin Dashboard → Users
2. View all registered users
3. Change user roles between "User" and "Admin"

## 📝 Sample Data

The website comes with 6 sample anime series:
- Attack on Titan
- Demon Slayer
- My Hero Academia
- Jujutsu Kaisen
- Spy x Family
- One Punch Man

Each series includes 3 sample episodes. You can:
- **Keep them**: Use as demonstration data
- **Delete them**: Remove through the admin dashboard
- **Modify them**: Edit details to match your content

## 🎬 Video Integration

### Supported Video Sources
The video player uses iframe embedding and supports:
- YouTube (use embed URLs: `https://www.youtube.com/embed/VIDEO_ID`)
- Vimeo (use player URLs: `https://player.vimeo.com/video/VIDEO_ID`)
- Direct video files (MP4, WebM)
- Any embeddable video service

### Video URL Format Examples
```
YouTube: https://www.youtube.com/embed/dQw4w9WgXcQ
Vimeo: https://player.vimeo.com/video/123456789
Direct: https://example.com/videos/episode1.mp4
```

## 🔐 Authentication

- **Google SSO**: Users sign in with their Google accounts
- **Automatic Profile Creation**: User profiles are created automatically on first login
- **Role-Based Access**: Different permissions for users and administrators
- **Protected Routes**: Watchlist and admin features require authentication

## 🎯 Key Pages

- **Home** (`/`): Featured and trending anime
- **Browse** (`/browse`): Search and filter all anime
- **Anime Detail** (`/anime/:id`): View anime information, episodes, and reviews
- **Watch** (`/watch/:episodeId`): Video player with episode list
- **Watchlist** (`/watchlist`): Your saved anime (requires login)
- **Admin** (`/admin`): Management dashboard (admin only)

## 💡 Tips

1. **Image URLs**: Use high-quality images from free sources like Unsplash or Pexels
2. **Video URLs**: Ensure video URLs are embeddable and publicly accessible
3. **Genres**: Keep genre names consistent for better filtering
4. **Episode Numbers**: Number episodes sequentially for proper ordering
5. **Descriptions**: Write engaging descriptions to attract viewers

## 🎨 Customization

The design system uses semantic color tokens defined in `src/index.css`:
- **Primary**: Deep purple (#6B46C1) - Main brand color
- **Secondary**: Dark blue - Supporting elements
- **Accent**: Bright cyan (#00D9FF) - Highlights and CTAs

You can customize these colors by editing the CSS variables in `src/index.css`.

## 📱 Mobile Experience

The website is fully responsive with:
- Touch-friendly navigation
- Optimized layouts for small screens
- Mobile menu for easy access
- Smooth scrolling and transitions

## 🔄 Next Steps

1. **Add Your Content**: Replace sample anime with your actual content
2. **Customize Branding**: Update colors and styling to match your brand
3. **Configure Video Sources**: Set up your video hosting solution
4. **Invite Users**: Share the website and let users create accounts
5. **Monitor Usage**: Use the admin dashboard to manage content and users

## 📞 Support

For questions or issues:
- Check the code comments for implementation details
- Review the database schema in `supabase/migrations/`
- Examine component files in `src/components/` for UI logic

---

**Enjoy your anime streaming platform! 🎬✨**
