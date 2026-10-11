# Melora
A Spotify-style music app starter with YouTube music playback and original instrumental demos.

Live private app: https://melora-chandu.decentemu3.chatgpt.site
Source: https://github.com/chandu-badi/melora

## Music playback
The app uses YouTube's official IFrame Player API and a visible privacy-enhanced player. It does not extract audio, host YouTube recordings, remove ads, bypass playback restrictions, or provide offline YouTube downloads. YouTube availability and embedding permissions can change by uploader and region. There is an Open on YouTube fallback.

The starter collection includes Naatu Naatu, Kesariya, Heeriye, Shape of You and See You Again as YouTube video references, plus six original 32-second instrumental demos. This is a small starter collection, not an exhaustive catalogue or an independently licensed movie-music service. Add more songs or albums with the Save YouTube link dialog. YouTube playlist links play through the official player; the album's contents are not scraped or imported into Melora.

## Features
Telugu/Hindi/English/independent filters; local collection search; a link to search YouTube; video and album playlist link saving; playback/pause, queue, next/previous, seek, volume, shuffle and repeat; favourites; playlist create/rename/delete and track management; responsive layout.

Search inside Melora covers saved and starter items. Global search uses the official YouTube Data API once its server key is configured; it does not scrape the service. If a YouTube album playlist is selected, next/previous control that playlist; the official player chooses and plays its videos.

## Privacy and security boundaries
The existing Sites deployment remains owner-private with platform authentication. GitHub repository visibility is separate from hosted app access.

Favourites, playlists and saved links stay in browser localStorage. No passwords, payments or Google credentials are collected by Melora. YouTube loads only after explicit player consent for that browser session. When loaded, Google/YouTube receives browser/playback data under its policies. Privacy-enhanced embedding does not eliminate all data collection. See https://policies.google.com/privacy and https://www.youtube.com/t/terms.

YouTube playback pauses when the page is hidden or the player is mostly outside the viewport. No background-audio bypass is implemented. Original local demos may play while the page is hidden.

The client CSP allows only same-origin app scripts and the YouTube API script; embeds are restricted to YouTube. User text renders through textContent. Imported URLs must be HTTPS links on explicitly permitted YouTube hosts, with validated video or playlist IDs; arbitrary sources and credential-bearing URLs are rejected. Existing collection playback needs no API key. Global search requires a server-only YouTube API key. The server runtime uses the supplied framework dependencies. This is a starter, not a completed security audit or commercial licensing assessment.

## Built-in global search
Melora now has a server-backed YouTube Data API search endpoint. The deployed app has no configured provider key, so global search shows a connection-needed state while collection search and starter playback remain available. Spotify and Amazon Music integrations are not configured.

To activate global search, create a Google Cloud project, enable YouTube Data API v3, and create an API key restricted to that API. Configure `YOUTUBE_API_KEY` as a secret in the hosted server environment. Never commit it or put it in browser code. For local work, use an ignored `.env` file. Official setup guide: https://developers.google.com/youtube/v3/getting-started. Provider quotas apply; the app does not enable billing or purchase anything.

Search requests require platform-authenticated identity. Queries are bounded to 2–100 characters, rate-limited to 12 searches per minute per identity per server isolate, and identical results are cached for five minutes. The rate limit is best-effort and not globally distributed. Query and result caches are in-memory, not durable. Search queries are sent to Google; no user tokens or API key are returned to the browser. Results are requested in the music category with embeddable/syndicated video filters and India region preferences. Language settings influence relevance but do not guarantee a result's language or official uploader status. The app displays each result's channel. Search results can be played through the official visible player and saved locally.

## Development
Python 3 and Node.js 22.13+ are required. The app uses the supplied Vinext/Cloudflare server integration; the original HTML/JS interface is served from `public/`.

```sh
npm ci
mkdir -p public/assets
python generate_audio.py
node --check public/app.js
node tests/app.test.cjs
node tests/music-search.test.mjs
npm run build
npm run dev
```

For browser-only collection playback, serve `public/` with a static server. Global search requires the server runtime. GitHub Actions installs dependencies, checks both app and search logic, generates demo audio and uploads the complete server build. It does not deploy or enable public sharing. Real browser playback, CSP/network compatibility and regional availability remain unverified in the current environment.

## Verification
`tests/app.test.cjs` exercises app logic against a simulated DOM and YouTube player. It checks filters, HTTPS link validation, literal user text, search, likes, playlist operations, consent gating, API controls/error messaging, hidden-page pause, demo selection and persistence of saved album references. These tests do not verify real browser rendering, ad playback or YouTube embedding availability.

`tests/music-search.test.mjs` verifies missing identity, malformed queries, missing configuration, provider filters, caching, best-effort rate limits and safe error messages without exposing the server key. Provider calls are mocked; live search cannot be tested until a valid key is configured.

## Future work
Server-side accounts and playlist sync, deployment-specific security and accessibility testing, native Android media controls, and a broader curated collection. Catalogue rights would require separate agreements if replacing YouTube embeds with hosted or licensed full-song streaming.
