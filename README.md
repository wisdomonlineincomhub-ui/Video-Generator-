# Video-Generator

My personal Video Cut and Assembling Platform for **Wisdom Online Income Hub**.
This platform takes my script, my screen recording, and my voice,
cuts it, adds captions and B-roll marks, and assembles the final video.
100% free, no Shotstack, no watermark.

## What It Does
- Takes a script with [B-ROLL] marks
- Takes a screen recording from phone
- Adds voiceover (Boss cloned voice)
- Adds captions for each step
- Assembles with Remotion + FFmpeg
- Exports final video for TikTok / YouTube / Reels / Shorts

## My Content Pillars (Every video must fall inside these 4)
1. 💰 **Income Education** — how to make money online, freelancing, side hustles, digital skills
2. 🚨 **Scam Awareness Education** — how to spot scams, phishing, 419, ponzi schemes, fake investments
3. 📱 **Social Media Success Education** — how to grow on Instagram, TikTok, Facebook, YouTube, Threads
4. 📚 **Common How-To Tips** — practical "how to do this or that" that people search for

**Hard Rules:**
- NO breaking news
- NO politics, sports, celebrity, death, accidents
- Audience: People aged 18-35 who want to learn, earn money, and grow online
- Language: Simple, clear African-friendly English that everyone can understand, no complex grammar

## My Keywords (Must appear in every script)
- online income skills Nigeria
- how to earn money online as a Nigerian student
- best digital skills to learn 2026
- Wisdom Online Income Hub
- how to make money online in Nigeria

## Compliance (So platforms will not ban me)
- Do NOT use: "Buy", "Purchase", "GUARANTEED", "100%", "Risk-free", "Make money fast", "Get rich", "MLM", "Double your money"
- No fake earnings, no fake testimonials, no clickbait
- Professional, truthful, and platform-safe content only

## Video Templates (6 templates, mapped to my pillars)
| Template | Pillar | Structure |
|----------|--------|-----------|
| `scam` | Scam Awareness | Hook → Story → Clue → Verdict |
| `income` | Income Education | Hook → Problem → Solution → Proof → CTA |
| `list` | Common How-To Tips | Hook → Point 1 → Point 2 → Point 3 → CTA |
| `social` | Social Media Success | Hook → Mistake → Fix → Result → CTA |
| `story` | Storytelling | Hook → Story → Lesson → CTA |
| `quote` | Motivational | Quote → Meaning → CTA |

All templates: 1080x1920 (9:16), 30fps, dark background, bold animated text,
typewriter + pop-in captions, 15-30 seconds.

## How The Whole System Works
Cloudflare Worker → generates script (pillar + keyword + compliance enforced)
↓ POST /render → Render.com (Node 20 + FFmpeg + Chrome)
↓ Remotion renders the composition (1080x1920, 30fps)
↓ FFmpeg stitches + adds music (-20dB) + encodes (libx264, crf 23, yuv420p)
↓ returns { videoUrl }
↓ Worker downloads MP4 → posts to TikTok / Reels / Shorts

## BRANDING - AGENT MUST FOLLOW THIS COMPULSORILY (NO CHANGE)

### 1. Top Right Logo - Small Size Only
- Use file: `/assets/logo.png` (Wisdom Online Income Hub gold logo)
- Position: Top Right corner of video
- Size: SMALL - maximum 90px x 90px, 8% of video width only
- Opacity: 90%
- Must show for the FULL video, from start to end. Do not hide it.
- Do NOT make it big, do NOT put it in the center.

### 2. Bottom Corner Follow Text - NOT TOO BOLD
- Position: Bottom Left corner, small and soft
- Text:
- Under the text, show small icons for: Facebook | YouTube | LinkedIn
- Style: NOT TOO BOLD. Use normal weight, small font (22-26px), white colour with 70% opacity, soft shadow only.
- Must NOT cover captions. Keep it in the corner, low.
- Show it for the last 5 seconds of the video, and also small for the full video at 50% opacity if possible.

### 3. General Brand Rules
- Background: Dark navy #0A1931 (same as logo background)
- Text: Gold #D4AF37 for headings, White for body text
- No other logo, no other watermark, no Shotstack watermark
- Captions must NOT clash with Top Right Logo or Bottom Follow text. Keep captions in the center.

## Assets Needed
- `/assets/logo.png` - upload the Wisdom logo image
- `/assets/music.mp3` - background music
- `/assets/fonts/` - bold font for captions

## Status
Setting up - v1 in progress for Wisdom Online Income Hub
