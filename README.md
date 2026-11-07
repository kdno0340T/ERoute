# RoutER

RoutER is a local tourism itinerary planner for discovering places around Mangaluru and assembling a thoughtful day plan. The web application now runs on Next.js App Router while preserving its existing discovery, map, and itinerary behavior.

## Run locally

Use Node.js 20.9 or newer. From this directory, install dependencies and start the Next.js development server:

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://127.0.0.1:3000`. For a production build, run `npm.cmd run build` and then `npm.cmd start`.

The older `node server.js` static preview remains available on port 4173 for comparison. Use the Next.js URL on port 3000 for the App Router application.

## Next.js structure

- `app/layout.jsx` provides the root document and metadata.
- `app/page.jsx` serves the existing app markup through the Next.js home route.
- `app/api/destinations/route.js` and `app/api/health/route.js` provide the app's API endpoints.
- `public/data/destinations.json` remains the source for the curated destination data.
- `app/LegacyApp.jsx` loads the existing client interactions while they are migrated into React components in manageable stages.

## MVP behavior

- Search, filter, and sort a curated pilot list of beaches, heritage sites, nature places, and a market.
- Open destination details, save favourites, and add up to six stops to a day.
- Suggest a stop order using nearby coordinates, show an illustrative map, and estimate distance and travel time.
- Save plans in browser local storage or share them with a URL.
- Suggest nearby destinations from editorial proximity notes.
- Present a three-part coastal story in a scroll-pinned reel with pointer cues and motion preferences.

## Data and routing limits

Visit durations and coordinates are approximate; attraction hours, current access, event schedules, prices, and accessibility details are not verified. Destination-card and story-reel photos are illustrative stock imagery, not verified views of the named places. Verify details with local sources before travelling.

The map is an illustrative SVG, not a live road map. Stop ordering is a nearest-neighbor estimate based on coordinates, and distance/time figures are not road directions or live traffic. This project has no booking partners, account system, server-side trip storage, or live event feed configured.
