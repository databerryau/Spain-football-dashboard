# ¿De qué equipo eres? 🔥

**A hot-pink, flame-powered guide to picking your Spanish football team.**

Live site: **https://databerryau.github.io/Spain-football-dashboard/**

Moving to Spain? Within a week someone will ask *"¿de qué equipo eres?"* ("which team are you?"). This dashboard compares all 20 LaLiga clubs for 2026-27 so you have an answer.

## What's inside

| Section | What it does |
|---|---|
| **Matchmaker** | Pick the city you're moving to, set 10 priority sliders (or tap a preset like *Glory hunter*, *Hipster* or *Masochist*) and get every club ranked by fit, with reasons and red flags. A map of Spain glows by match. |
| **Performance** | 2025-26 final table, five-season trend lines, a 0–100 Power index and an all-time trophy cabinet. |
| **Random attitudes** | A heatmap scoring each club on nine very serious metrics (atmosphere, party, drama, underdog romance, newcomer welcome, rivalry, sun, food, street cred), a head-to-head radar and a random fan-folklore generator. |
| **Ticket prices** | Cheapest normal-game seat against the big-game price, price against power, season-ticket prices and how easy it is for a newcomer to get in. |
| **Club files** | A deep-dive card for every club: stats, prices, attitude fingerprint, a phrase to shout and a newcomer tip. |
| **Wheel of fate** | Can't decide? Spin it. (It leans towards your best matches.) |

## About the data

- **Results and honours:** public sources (Wikipedia season pages, LaLiga, club sites and the Spanish sports press), checked on 28 September 2026. The 2025-26 LaLiga table was cross-checked for internal consistency. For the three promoted clubs (Racing, Deportivo, Málaga) the 2025-26 records are from Segunda and partly incomplete.
- **Ticket prices:** season-ticket figures are the clubs' published 2026-27 prices. Single-match prices vary by opponent and seat, and some clubs don't publish them. Values shown with **≈** (hollow dots in the charts) are estimates based on comparable clubs. Always check the official club site before buying.
- **Attitude scores, taglines, "pick them if / avoid if" and quirks** are affectionate opinion, not science.
- **Power index:** 65% last season's points per game plus 35% five-year league history, scaled 0–100. Promoted clubs get 17th-place form for last season.
- The map outline comes from [Natural Earth](https://www.naturalearthdata.com/) (public domain) via `world-atlas`.

This is a fan project with no connection to LaLiga or any club. Club names are used for identification only, and the badges are generic colour discs, not official crests.

## Run it locally

It's a static site with no build step and no dependencies:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly from disk also works.)

## Project layout

```
index.html              page structure
assets/css/style.css    hot pink flame theme
assets/js/data.js       club data (facts + editorial content): edit this to update numbers
assets/js/app.js        matchmaker, charts, map, heatmap, modal, flame animation
assets/js/spain-map.js  pre-projected SVG outline of Spain and neighbours
.github/workflows/      publishes the site to the gh-pages branch on every push to main
```

## Updating

Edit `assets/js/data.js` and push to `main`. The deploy workflow republishes the site automatically.
