# Easy Basketball Training 🏀

**One tap makes a full 60-minute junior basketball training session.** Built for a brand-new coach running a brand-new Under 12 girls' team on a half court with one hoop.

Live site: **https://databerryau.github.io/Spain-football-dashboard/basketball-training/**

## What it does

| | |
|---|---|
| **Make today's session** | One button. You get a 60-minute plan in the same six parts every time: warm-up game, skill 1, water break, skill 2, team game, huddle. |
| **Today's focus** | Each session works on one problem from games (bunching, turnovers, scoring or defence). The focus rotates automatically. |
| **Animated drills** | Every drill has a little half-court animation, numbered steps, "what to say" coaching cues and the equipment needed. |
| **Swap** | Don't like a drill? Swap it for another one that fits the same slot. |
| **Start session** | At the court: one part per screen, a big countdown timer, beeps when time's up, and the screen stays on. |
| **Coach help** | New coach basics, simple rules, basketball words and game-day tips. |

The full spec (from the interview) is in [SPEC.md](SPEC.md).

## Run it locally

It's a static site with no build step and no dependencies:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/basketball-training/
```

## Files

```
index.html             page structure
SPEC.md                the spec
assets/css/style.css   bright, friendly theme
assets/js/court.js     half-court drawing and animation engine
assets/js/drills.js    every drill: steps, cues, equipment, animation
assets/js/help.js      Coach help content
assets/js/app.js       generator, session view, Start session mode
```

## Adding or changing a drill

Everything lives in `assets/js/drills.js`. Each drill has:

- `slot`: `warmup`, `skill` or `game`
- `theme`: `sense`, `ball`, `score` or `defence` (skills and games)
- `steps` and `say`: plain-English steps and 2–3 short cues
- `need`: balls, cones, bibs
- `anim`: the animation. Players move between keyframes `[time, x, y]`. Time runs from 0 to 1 over the loop, and the half court is 500 wide × 467 deep with the basket at the top. The format is explained at the top of `court.js`.

## Moving it to its own repo

This folder is self-contained (all paths are relative). To give it its own link, copy the folder's contents into a new repo, turn on GitHub Pages, and it will work as-is.
