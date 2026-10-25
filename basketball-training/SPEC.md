# Easy Basketball Training: spec

A one-button training session generator for a **brand-new coach** of a **brand-new junior girls' team**. Everything has to be super basic and clear: if the coach has to think about how to use it, it's too complicated.

This spec comes from an interview with the team's parent helper (25 October 2026).

---

## 1. Who it's for

| | |
|---|---|
| **Coach** | Brand new to coaching. Uses the tool **on a phone, at the court**. |
| **Players** | Girls, **Under 12 (about 10–11 years old)** |
| **Squad size** | Usually **8–10 players** at training |
| **Experience** | Mostly beginners: **one or two girls** have played before |
| **Session length** | **60 minutes** |
| **Court** | **Half court, 1 hoop** |
| **Equipment** | **A ball for every player**, cones/markers, two sets of bibs |
| **Games** | Already playing **weekly games** |

### What's going wrong in games (all four)

1. **Everyone chases the ball**: they bunch up instead of spreading out.
2. **Lots of turnovers**: travelling, double dribbles, passes to the other team.
3. **Can't score**: missed layups, or not getting shots at all.
4. **Defence is lost**: they don't know who to guard or where to stand.

---

## 2. Goals and non-goals

**Goals**

- **One button.** Tap *Make today's session* and get a complete, sensible 60-minute plan. No settings, no choices.
- **Clear enough for someone who has never coached.** Short sentences, numbered steps, words a 10-year-old would understand.
- **Show, don't just tell.** Every drill has a small **animated court diagram** showing the movement.
- **Run it at the court.** A *Start session* mode with one drill per screen, a big countdown timer and a beep when time's up.
- **Fix the real problems.** Every session targets one of the four game problems above, and the focus rotates so all four get covered.
- **Help a new coach grow.** A *Coach help* section with the basics, simple rules, basketball words and game-day tips.

**Non-goals (deliberately left out to keep it simple)**

- No settings for age, squad size, session length or court. The tool is built for this team's setup.
- No accounts, logins, player names or personal data.
- No sharing links, printing or saved favourites. (They can be added later if wanted.)
- No Spanish or other languages. **English only, Australian spelling.**
- No drill editor.

---

## 3. The session

### 3.1 Same shape every time

Every session has the same six parts, so the girls learn the routine and the coach always knows what comes next.

| # | Part | Minutes | What it is |
|---|---|---|---|
| 1 | **Warm-up game** | 10 | A fun, active game. Everyone moving, lots of ball touches. |
| 2 | **Skill 1** | 12 | A drill on **today's focus**. |
| 3 | **Water break** | 3 | Drinks. The coach sets up the next drill. |
| 4 | **Skill 2** | 12 | A drill on a **different skill**, for variety. |
| 5 | **Team game** | 18 | A small-sided game with one special rule that works on today's focus. |
| 6 | **Huddle** | 5 | A question about today's focus, a shout-out, a home challenge, a team cheer. |
| | **Total** | **60** | |

### 3.2 Today's focus (fully automatic)

Each session picks **one focus**, and each focus fixes one of the game problems:

| Focus | Fixes | Skill drills about |
|---|---|---|
| **Spread out & get open** | Everyone chases the ball | Spacing, passing and cutting, 2 v 1, throw-ins |
| **Look after the ball** | Lots of turnovers | Dribbling, jump stops and pivots, passing and catching |
| **Put it in the hoop** | Can't score | Layups, close shots |
| **Stop them scoring** | Defence is lost | Stance, slides, "find your player", closeouts, boxing out |

- The focus **rotates** in that order. The first session ever is *Spread out & get open*, the most common beginner problem.
- The page remembers the last focus on that phone, so the next session moves on to the next one.

### 3.3 How a session is put together

1. **Focus** = the next one in the rotation.
2. **Warm-up game** = any warm-up game, avoiding the ones used last session.
3. **Skill 1** = a skill drill **for today's focus**.
4. **Skill 2** = a skill drill **from one of the other three skills**.
5. **Team game** = the team game that matches today's focus (or any team game if that one was used last session).
6. **Huddle** = always the same routine, with a question and home challenge that match today's focus.

Drills used in the last session are avoided where possible, so back-to-back sessions feel different.

### 3.4 Swap a drill

Every drill (warm-up, skills, team game) has a **Swap** button. It replaces that one drill with another that fits the same slot:

- **Skill 1** swaps to another drill on today's focus.
- **Skill 2** swaps to another drill on any other skill.
- Swapping cycles through all the options before repeating.

### 3.5 Remembering

- The current session is saved **on that phone**, so the coach can make it at home and open the same plan at the court.
- *Make a new session* replaces it. The page asks "Are you sure?" first.
- If saving isn't possible (private browsing), everything still works. It just won't be remembered.

---

## 4. What each drill shows

Every drill card has:

1. **Name**: short and fun (for example *Sharks and Minnows*, *Find Your Player*).
2. **Animated court diagram**: a half court seen from above, with:
   - blue circles = our attackers (numbered when it matters)
   - red circles = defenders / taggers
   - a grey **C** = the coach
   - an orange dot = the ball (it bounces when someone's dribbling and arcs when it's shot)
   - orange triangles = cones
   - faint dashed lines = where players run
   - a caption bar under the court saying what's happening right now ("Red light! Jump stop")
   - tap the diagram to pause or play. Animations loop. With *reduce motion* switched on, the diagram starts paused.
3. **How it works**: 3–5 numbered steps in plain English.
4. **What to say**: 2–3 short coaching cues to shout ("Eyes up!", "Right, left, UP!").
5. **You need**: balls, cones, bibs.
6. **Swap** button.

Distances are given in **"big steps"**, not metres.

### 4.1 Drill library (version 1)

| Slot | Focus | Drills |
|---|---|---|
| Warm-up game | (any) | Dribble Tag · Red Light, Green Light · Sharks and Minnows · Coach Says · Ball Busters · Dribble Relay |
| Skill | Look after the ball | Cone Weave · Jump Stop and Pivot · Partner Passing · Pass and Follow · Piggy in the Middle |
| Skill | Put it in the hoop | Layup Steps: Right-Left-Up · Layup Lines · Around the Hoop · Hot Spots · Jump Stop Finish |
| Skill | Stop them scoring | Defence Mirror · Zig-Zag Slides · Find Your Player · Closeouts · Box Out Battle |
| Skill | Spread out & get open | Spacing Spots · Give-and-Go · 2 v 1 · No-Dribble Keepings Off · Throw-in Practice |
| Team game | per focus | Three-Pass Game · Freeze Game · Matchup Game · Inside Points · Rotating 3 v 3 |
| Huddle | (fixed) | Huddle and Cheer |

Every drill must work for **8–10 players on a half court with 1 hoop**, using only balls, cones and bibs.

**Coaching principles built into the drills**

- Short lines (no more than 3 waiting), lots of touches, nobody sits out for long.
- No "you're out" elimination games. If you're caught, you do a quick task and come straight back in.
- Fun first. Competition is team-based and light ("first team to 10").

---

## 5. Start session (at the court)

A full-screen mode for running the session live.

- **One part per screen**: "Part 2 of 6 · Skill 1", the drill name, a big **countdown timer**, the animated diagram, *What to say* and *How it works*.
- **Timer**: starts when the coach taps **Start**. **Pause** and **+1 min** buttons.
- **Time's up**: three beeps, a buzz (on phones that support it), and a **"Time's up! Tap Next"** message. The timer then counts **overtime** in red (+0:23), so the coach knows they're running over. It never skips ahead by itself.
- **Next / Back**: big buttons at the bottom. Tapping **Next** starts the next part's timer straight away, because the time for each part includes setting up and explaining.
- **Swap this drill** is available here too, in case something isn't working.
- **Screen stays on** while the session is running (where the phone allows it).
- After the huddle: a **"Great session!"** screen.
- **Exit** (✕) goes back to the plan at any time.

---

## 6. Coach help

A second tab with four short sections. Each is a list of small cards, readable in under a minute.

1. **New coach basics**: getting their attention, explaining a drill in 30 seconds, keeping lines short, praising out loud and correcting quietly, one fix at a time, safety and water, what to do when a drill isn't working.
2. **Rules made simple**: travelling, double dribble, fouls, 3 seconds, out of bounds and throw-ins, backcourt, held balls, free throws, scoring. Plus a reminder that junior leagues often have their own rules.
3. **Basketball words**: a small glossary (layup, jump stop, pivot, triple threat, box out, give-and-go, key, wing, baseline and more).
4. **Game day**: before the game, fair minutes for everyone with simple sub patterns, what to say at time-outs, staying positive, the after-game huddle.

---

## 7. Look and feel

- **Bright and friendly**: basketball orange, warm cream background, white cards, navy text, big rounded buttons.
- **Phone first**: designed for one hand at arm's length. Body text at least 18px, buttons at least 48px tall. Comfortable up to tablet and desktop width.
- **Light theme only**, for readability under gym lights.
- **Generic**: no team name, so the coach can share it with other new coaches.
- Plain, encouraging language. No jargon without an explanation.

---

## 8. Technical

- **A static site**: plain HTML, CSS and JavaScript. No build step, no frameworks, no tracking, works offline once loaded.
- **Files**

  ```
  basketball-training/
    index.html             page structure
    SPEC.md                this document
    README.md              how to run and update it
    assets/css/style.css   bright, friendly theme
    assets/js/court.js     half-court drawing and animation engine
    assets/js/drills.js    every drill: steps, cues, equipment, animation
    assets/js/help.js      Coach help content
    assets/js/app.js       generator, session view, Start session mode
  ```

- **Animations** are data, not video. Each drill lists players, cones and the ball with keyframes (`[time, x, y]` on a 500 × 467 half court), and `court.js` draws and animates them with SVG. Defenders can be told to "guard" an attacker, which keeps them between that player and the hoop automatically.
- **Storage**: the current session and the last focus are kept in `localStorage`, wrapped so the page still works without it.
- **Hosting: GitHub Pages.** The plan was a separate repo (`databerryau/basketball-training`), but repos can't be created from this session. For now it's a self-contained folder published with the existing site:
  **https://databerryau.github.io/Spain-football-dashboard/basketball-training/**
  All paths are relative, so the folder can be copied as-is into its own repo later.

---

## 9. Done when

- [ ] Opening the page on a phone shows one big **Make today's session** button and a 3-step "how it works".
- [ ] One tap makes a 60-minute, six-part session with a clear focus and the problem it fixes.
- [ ] Every drill shows a working animated diagram, numbered steps, coaching cues and equipment.
- [ ] **Swap** changes one drill and keeps the slot's rules.
- [ ] The session is still there after closing and reopening the page.
- [ ] **Start session** runs every part with a timer, beeps at zero, shows overtime, and Next/Back work.
- [ ] **Coach help** has all four sections.
- [ ] No horizontal scrolling at 360px wide, and no console errors.
- [ ] Published on GitHub Pages.

## 10. Ideas for later

- Share a session link with an assistant coach.
- Printable one-page plan.
- Save favourite sessions.
- A short season plan (Week 1, 2, 3...) building skills in order.
- Optional settings for other teams (age, squad size, full court).
