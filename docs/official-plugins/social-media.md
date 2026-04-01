---
sidebar_position: 5
title: Social Media Saver
---

# Social Media Saver Plugin

Save and organize content from Instagram, TikTok, YouTube, Twitter, and Spotify directly through WhatsApp.

## Overview

| Property | Value |
|----------|-------|
| **Slug** | `social-media` |
| **Category** | Social |
| **Author** | Hippo |
| **OAuth Required** | No |
| **Permissions** | `links:write`, `lists:write`, `documents:write` |

## Features

- Save content from major social media platforms
- Automatic metadata extraction (title, author, thumbnail)
- Organize saved content into collections
- Generate periodic digests of saved content
- Download-ready media information

## Supported Platforms

| Platform | Content Types | Status |
|----------|--------------|--------|
| Instagram | Posts, Reels, Stories | Supported |
| TikTok | Videos | Supported |
| YouTube | Videos, Shorts | Supported |
| Twitter/X | Tweets, Threads | Supported |
| Spotify | Tracks, Albums, Playlists | Supported |

## Tools

### `fetch_social_content`

Save content from a social media URL.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | Social media content URL |
| `collection` | string | No | Collection name to save to |
| `tags` | string[] | No | Tags for organization |
| `note` | string | No | Personal note about the content |

**Example Usage via WhatsApp:**

> "Save this: https://www.instagram.com/p/ABC123/"

> "Add this video to my favorites: https://www.tiktok.com/@user/video/123456"

> "Save this song: https://open.spotify.com/track/..."

---

### `get_social_media_digest`

Get a summary of your saved social media content.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | No | Time period: `today`, `week`, `month`, `all` |
| `platform` | string | No | Filter by platform |
| `collection` | string | No | Filter by collection |
| `limit` | number | No | Maximum items to return (default: 10) |

**Example Usage via WhatsApp:**

> "Show my saved videos"

> "What did I save this week?"

> "List my favorite TikToks"

## Setup

### Step 1: Install the Plugin

```bash
curl -X POST https://api.gethippo.ai/api/plugins/social-media/install \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "grantedPermissions": ["links:write", "lists:write", "documents:write"]
  }'
```

No OAuth required - the plugin extracts public content metadata.

## Usage Examples

### Saving Instagram Content

> User: "Save this: https://www.instagram.com/p/ABC123def/"
>
> Hippo: "Saved! Here's what I captured:
>
> **Platform:** Instagram
> **Author:** @photographer
> **Type:** Photo Post
> **Caption:** Beautiful sunset at the beach...
> **Likes:** 12.5K
>
> Added to your collection. Want me to add any tags?"

### Saving TikTok Videos

> User: "https://www.tiktok.com/@creator/video/7123456789"
>
> Hippo: "Got it! I've saved this TikTok:
>
> **Creator:** @creator
> **Title:** How to make the perfect coffee
> **Duration:** 0:45
> **Views:** 2.1M
> **Likes:** 450K
>
> Saved to your default collection."

### Saving YouTube Videos

> User: "Save this video to watch later: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
>
> Hippo: "Saved to your 'Watch Later' collection:
>
> **Title:** Never Gonna Give You Up
> **Channel:** Rick Astley
> **Duration:** 3:33
> **Views:** 1.4B
> **Published:** Oct 25, 2009"

### Saving Twitter Posts

> User: "Save: https://twitter.com/elonmusk/status/1234567890"
>
> Hippo: "Tweet saved:
>
> **Author:** @elonmusk
> **Content:** The quick brown fox...
> **Retweets:** 25K
> **Likes:** 150K
> **Posted:** 2 hours ago
>
> Added to your saved items."

### Saving Spotify Content

> User: "Save this playlist: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
>
> Hippo: "Spotify playlist saved:
>
> **Name:** Today's Top Hits
> **Owner:** Spotify
> **Tracks:** 50 songs
> **Followers:** 35M
> **Duration:** 2h 45m
>
> Want me to add it to a specific collection?"

### Viewing Saved Content

> User: "What did I save this week?"
>
> Hippo: "Here's your saved content from this week:
>
> **Instagram (3)**
> - @photographer - Sunset photo
> - @foodie - Recipe reel
> - @travel - Beach story
>
> **TikTok (2)**
> - @creator - Coffee tutorial
> - @comedian - Funny skit
>
> **YouTube (1)**
> - Documentary about space
>
> Total: 6 items saved"

### Organizing with Collections

> User: "Save this to my recipe collection: https://www.instagram.com/reel/ABC123/"
>
> Hippo: "Saved to your 'Recipes' collection:
>
> **Author:** @chef
> **Title:** 5-minute pasta recipe
> **Type:** Reel
>
> You now have 12 items in your Recipes collection."

## Supported URL Formats

### Instagram

```
https://www.instagram.com/p/ABC123def/           # Post
https://www.instagram.com/reel/ABC123def/        # Reel
https://www.instagram.com/stories/user/123/      # Story
https://instagr.am/p/ABC123def/                  # Short URL
```

### TikTok

```
https://www.tiktok.com/@user/video/7123456789
https://vm.tiktok.com/ABC123/                    # Short URL
https://m.tiktok.com/v/7123456789                # Mobile URL
```

### YouTube

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ                     # Short URL
https://www.youtube.com/shorts/ABC123            # Shorts
```

### Twitter/X

```
https://twitter.com/user/status/1234567890
https://x.com/user/status/1234567890             # X.com URL
https://t.co/ABC123                              # Short URL
```

### Spotify

```
https://open.spotify.com/track/ABC123            # Track
https://open.spotify.com/album/ABC123            # Album
https://open.spotify.com/playlist/ABC123         # Playlist
https://open.spotify.com/artist/ABC123           # Artist
```

## Content Metadata

### What Gets Saved

| Platform | Metadata Extracted |
|----------|-------------------|
| Instagram | Author, caption, likes, type, timestamp |
| TikTok | Creator, title, views, likes, duration |
| YouTube | Title, channel, views, duration, description |
| Twitter | Author, text, retweets, likes, timestamp |
| Spotify | Title, artist, album, duration, popularity |

### Storage

Saved content includes:

- Original URL
- Platform identifier
- Extracted metadata
- Thumbnail URL (when available)
- User's notes and tags
- Collection assignment
- Save timestamp

## Collections

Organize saved content into collections:

### Default Collections

- **Favorites** - Starred items
- **Watch Later** - Videos to watch
- **Read Later** - Articles and threads

### Custom Collections

Create your own collections by specifying a name when saving:

> "Save this to my Travel Inspiration collection"

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "URL not supported" | Platform not recognized | Check supported platforms list |
| "Content not found" | Content deleted or private | Verify the content is publicly accessible |
| "Unable to extract" | Page structure changed | Try again; if persistent, report the issue |
| "Rate limited" | Too many requests | Wait a few minutes before saving more |

## Privacy and Limitations

### Privacy

- Only public content can be saved
- No platform login required
- Saved metadata stored in your Hippo account
- Content itself is not downloaded (only metadata and URLs)

### Limitations

- Private/protected content cannot be accessed
- Instagram Stories expire and may become unavailable
- Some platforms may block metadata extraction temporarily
- Rate limits apply to prevent abuse

## Tips

1. **Use collections** - Organize saved content for easy retrieval
2. **Add tags** - Make content searchable with relevant tags
3. **Add notes** - Remember why you saved something
4. **Regular digests** - Ask for weekly digests to review saved content
5. **Clean up** - Periodically review and remove outdated saves

## Future Features

- Download media files (coming soon)
- Share collections
- Export saved content
- Smart categorization with AI
