# Melora
A Spotify-style music app starter with YouTube music playback and original instrumental demos.

Live private app: https://melora-chandu.decentemu3.chatgpt.site
Source: https://github.com/chandu-badi/melora

## Music playback
The app uses YouTube's official IFrame Player API and a visible privacy-enhanced player. It does not extract audio, host YouTube recordings, remove ads, bypass playback restrictions, or provide offline YouTube downloads. YouTube availability and embedding permissions can change by uploader and region. There is an Open on YouTube fallback.

The starter collection includes Naatu Naatu, Kesariya, Heeriye, Shape of You and See You Again as YouTube video references, plus six original 32-second instrumental demos. This is a small starter collection, not an exhaustive catalogue or an independently licensed movie-music service. Add more songs or albums with the Save YouTube link dialog. YouTube playlist links play through the official player; the album's contents are not scraped or imported into Melora.

## Features
Telugu/Hindi/English/independent filters; local collection search; a link to search YouTube; video and album playlist link saving; playback/pause, queue, next/previous, seek, volume, shuffle and repeat; favourites; playlist create/rename/delete and track management; responsive layout.

Search inside Melora covers saved and starter items. Global search opens YouTube rather than scraping its service. If a YouTube album playlist is selected, next/previous control that playlist; the official player chooses and plays its videos.

## Privacy and security boundaries
The existing Sites deployment remains owner-private with platform authentication. GitHub repository visibility is separate from hosted app access.

Favourites, playlists and saved links stay in browser localStorage. No passwords, payments or Google credentials are collected by Melora. YouTube loads only after explicit player consent for that browser session. When loaded, Google/YouTube receives browser/playback data under its policies. Privacy-enhanced embedding does not eliminate all data collection. See https://policies.google.com/privacy and https://www.youtube.com/t/terms.

YouTube playback pauses when the page is hidden or the player is mostly outside the viewport. No background-audio bypass is implemented. Original local demos may play while the page is hidden.

CSP allows only same-origin app scripts and the YouTube API script; embeds are restricted to YouTube. User text renders through textContent. Imported URLs must be HTTPS links on explicitly permitted YouTube hosts, with validated video or playlist IDs; arbitrary sources and credential-bearing URLs are rejected. No API keys, secrets or external packages are needed. This is a starter, not a completed security audit or commercial licensing assessment.

## Development
WAV files are generated build outputs rather than committed to GitHub. Generate them before serving:

```sh
mkdir -p dist/assets
python generate_audio.py
node --check dist/app.js
node tests/app.test.cjs
python -m http.server 8000 --directory dist
```

Open http://localhost:8000. Python 3 and Node.js are needed for generation and checks; the application itself has no build dependencies. YouTube playback needs an internet connection and a browser that permits the embedded player. Browser playback, CSP/network compatibility and regional video availability must be verified on real devices.

GitHub Actions runs the checks, generates the demo audio and uploads `melora-static-app`, a complete ready-to-serve `dist/` artifact. It does not enable GitHub Pages or change sharing.

## Verification
`tests/app.test.cjs` exercises app logic against a simulated DOM and YouTube player. It checks filters, HTTPS link validation, literal user text, search, likes, playlist operations, consent gating, API controls/error messaging, hidden-page pause, demo selection and persistence of saved album references. These tests do not verify real browser rendering, ad playback or YouTube embedding availability.

## Future work
Server-side accounts and playlist sync, deployment-specific security and accessibility testing, native Android media controls, and a broader curated collection. Catalogue rights would require separate agreements if replacing YouTube embeds with hosted or licensed full-song streaming.
