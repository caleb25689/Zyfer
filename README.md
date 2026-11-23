# Zyfer

Zyfer is an ad-free music discovery web app prototype. Its feed searches Jamendo's catalog for independent music, plays available streams, and exposes a download action only when the catalog provides an allowed download URL.

## Run in GitHub Codespaces

Open the repository in a Codespace, then run:

```bash
npm install
cp .env.example .env.local
```

Register for a Jamendo API client ID at <https://developer.jamendo.com/v3.0>, then put it in `.env.local`:

```env
VITE_JAMENDO_CLIENT_ID=your_client_id
```

Start the Vite development server:

```bash
npm run dev -- --host 0.0.0.0
```

Open port **5173** from the Codespaces **Ports** tab. After changing `.env.local`, restart the dev server for Vite to load the value.

## Features

- Discover feed with popular tracks and keyword search
- Streaming playback, seek, and pause controls
- Favorites stored for the current browser session
- Direct download links only where the API returns a download URL and permits downloading
- Artist/track links and track-license links when supplied by the catalog
- Responsive layout

## Important licensing and security notes

The Jamendo client ID is included in browser requests; it is a public application identifier, not a secret. Do not put secret credentials in a `VITE_` variable. Review Jamendo's current API terms and obtain any required permissions for your intended audience and commercial use. Music licenses and download permissions vary by track. Preserve required attribution and license notices. A production service should use a backend for catalog integration, rate limiting, and policy enforcement.
