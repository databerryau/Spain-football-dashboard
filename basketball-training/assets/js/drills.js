/* =========================================================
   Drill library. Edit this file to add or change drills.

   Each drill:
     id, name
     slot    'warmup' | 'skill' | 'game'
     theme   'ball' | 'score' | 'defence' | 'sense' (skills and games)
     need    { balls: 'each' | 'some', cones: n, bibs: true }
     steps   numbered "how it works" steps (keep them short!)
     say     2–3 coaching cues to shout
     anim    animated diagram data (format explained in court.js)

   Court positions: basket at the top (250, 52), half-way line
   at the bottom (y = 467). Width 0–500.
   ========================================================= */

const THEMES = {
  sense:   { name: 'Spread out & get open', short: 'Game sense', fixes: 'Everyone chases the ball', icon: '↔️' },
  ball:    { name: 'Look after the ball',   short: 'Ball skills', fixes: 'Lots of turnovers',       icon: '🤲' },
  score:   { name: 'Put it in the hoop',    short: 'Scoring',     fixes: "Can't score",             icon: '🎯' },
  defence: { name: 'Stop them scoring',     short: 'Defence',     fixes: 'Defence is lost',         icon: '🛡️' },
};
// The focus rotates in this order, one per session.
const FOCUS_ORDER = ['sense', 'ball', 'score', 'defence'];

// Handy spots on the half court
const TOP = [250, 330], LW = [85, 230], RW = [415, 230], LC = [45, 75], RC = [455, 75];

const DRILLS = [
  /* ---------------- WARM-UP GAMES ---------------- */
  {
    id: 'dribble-tag', name: 'Dribble Tag', slot: 'warmup',
    need: { balls: 'each', bibs: true },
    steps: [
      'Everyone has a ball and stays inside the half court.',
      'Pick 2 taggers. Give each one a bib to hold.',
      'Everyone dribbles all the time, taggers too. Taggers try to tag someone.',
      'If you get tagged, take the bib. Now you\'re a tagger.',
      'Lose your ball or step out? Do 5 dribbles on the spot, then join back in.',
    ],
    say: ['Eyes up!', 'Use your fingertips', 'Keep it low when they\'re close'],
    anim: {
      dur: 7,
      paths: false,
      p: [
        { b: 1, k: [[0, 120, 150], [0.25, 200, 250], [0.5, 150, 380], [0.75, 90, 260], [1, 120, 150]] },
        { b: 1, k: [[0, 380, 140], [0.25, 300, 200], [0.5, 400, 330], [0.75, 440, 220], [1, 380, 140]] },
        { b: 1, k: [[0, 250, 300], [0.25, 340, 400], [0.5, 250, 250], [0.75, 170, 330], [1, 250, 300]] },
        { b: 1, k: [[0, 200, 100], [0.33, 300, 110], [0.66, 250, 180], [1, 200, 100]] },
        { b: 1, k: [[0, 330, 300], [0.33, 420, 410], [0.66, 360, 250], [1, 330, 300]] },
        { b: 1, team: 'd', n: 'T', k: [[0, 250, 430], [0.25, 290, 370], [0.5, 270, 280], [0.75, 190, 360], [1, 250, 430]] },
      ],
      cap: [[0, 0.5, 'Everyone dribbles, all the time'], [0.5, 1, 'Tagger (T) chases. Tagged? You take the bib']],
    },
  },
  {
    id: 'red-light', name: 'Red Light, Green Light', slot: 'warmup',
    need: { balls: 'each' },
    steps: [
      'Everyone has a ball and lines up on the baseline (the end line under the hoop).',
      'You stand at half way, facing them.',
      '"Green light!" = dribble towards you. "Red light!" = JUMP STOP: both feet land at the same time, and hold the ball.',
      'Anyone who moves on red light goes back 3 big steps.',
      'Add "Yellow light!" = dribble slowly and low.',
    ],
    say: ['Land on two feet!', 'Eyes on me, not the ball', 'Stop strong'],
    anim: {
      dur: 7,
      p: [
        { team: 'c', k: [250, 445] },
        { b: 1, k: [[0, 90, 30], [0.3, 90, 190], [0.47, 90, 190], [0.75, 90, 340], [1, 90, 340]] },
        { b: 1, k: [[0, 170, 30], [0.3, 170, 210], [0.47, 170, 210], [0.75, 170, 370], [1, 170, 370]] },
        { b: 1, k: [[0, 250, 30], [0.3, 250, 200], [0.47, 250, 200], [0.75, 250, 355], [1, 250, 355]] },
        { b: 1, k: [[0, 330, 30], [0.3, 330, 225], [0.47, 330, 225], [0.75, 330, 380], [1, 330, 380]] },
        { b: 1, k: [[0, 410, 30], [0.3, 410, 195], [0.47, 410, 195], [0.75, 410, 345], [1, 410, 345]] },
      ],
      cap: [[0, 0.3, '"Green light!" Dribble'], [0.3, 0.47, '"Red light!" Jump stop, hold the ball'], [0.47, 0.75, '"Green light!"'], [0.75, 1, '"Red light!"']],
    },
  },
  {
    id: 'sharks', name: 'Sharks and Minnows', slot: 'warmup',
    need: { balls: 'each' },
    steps: [
      'Minnows (most of the team) each have a ball and line up on one sideline.',
      'Pick 1 or 2 sharks. They have no ball and stand in the middle.',
      'Shout "Go!" Minnows dribble across to the other sideline. Sharks try to knock their balls away.',
      'If a shark knocks your ball away, you become a shark too.',
      'Keep going until 1 or 2 minnows are left. They\'re the winners! Start again with new sharks.',
    ],
    say: ['Protect it with your body', 'Push the ball out in front', 'Head up, find the gap'],
    anim: {
      dur: 6,
      p: [
        { b: 1, k: [[0, 25, 90], [0.12, 25, 90], [0.4, 230, 70], [0.72, 475, 100], [1, 475, 100]] },
        { b: 1, k: [[0, 25, 170], [0.15, 25, 170], [0.42, 240, 140], [0.75, 475, 180], [1, 475, 180]] },
        { b: 1, k: [[0, 25, 250], [0.1, 25, 250], [0.4, 210, 300], [0.7, 475, 260], [1, 475, 260]] },
        { b: 1, k: [[0, 25, 330], [0.14, 25, 330], [0.45, 260, 370], [0.76, 475, 330], [1, 475, 330]] },
        { b: 1, k: [[0, 25, 410], [0.12, 25, 410], [0.42, 230, 420], [0.73, 475, 405], [1, 475, 405]] },
        { team: 'd', k: [[0, 250, 250], [0.25, 250, 180], [0.45, 270, 300], [0.7, 250, 250], [1, 250, 250]] },
      ],
      cap: [[0, 0.14, 'Ready... GO!'], [0.14, 0.75, 'Dribble across, past the shark'], [0.75, 1, 'Made it!']],
    },
  },
  {
    id: 'coach-says', name: 'Coach Says', slot: 'warmup',
    need: { balls: 'each' },
    steps: [
      'Everyone has a ball and spreads out facing you. Arms out: nobody can touch anyone else.',
      'Call out moves starting with "Coach says...": "dribble with your right hand", "now your left", "dribble low", "ball around your waist", "jump stop!"',
      'If you DON\'T say "Coach says" and someone does the move anyway, they do 3 star jumps and keep playing. Nobody is out.',
      'Speed up as they get better.',
    ],
    say: ['Spread out!', 'Weak hand too!', 'Eyes up on me'],
    anim: {
      dur: 4,
      p: [
        { team: 'c', k: [250, 440] },
        { b: 1, k: [[0, 130, 170], [0.25, 118, 170], [0.5, 130, 170], [0.75, 142, 170], [1, 130, 170]] },
        { b: 1, k: [[0, 250, 170], [0.25, 238, 170], [0.5, 250, 170], [0.75, 262, 170], [1, 250, 170]] },
        { b: 1, k: [[0, 370, 170], [0.25, 358, 170], [0.5, 370, 170], [0.75, 382, 170], [1, 370, 170]] },
        { b: 1, k: [[0, 130, 290], [0.25, 142, 290], [0.5, 130, 290], [0.75, 118, 290], [1, 130, 290]] },
        { b: 1, k: [[0, 250, 290], [0.25, 262, 290], [0.5, 250, 290], [0.75, 238, 290], [1, 250, 290]] },
        { b: 1, k: [[0, 370, 290], [0.25, 382, 290], [0.5, 370, 290], [0.75, 358, 290], [1, 370, 290]] },
      ],
      cap: [[0, 0.5, '"Coach says: dribble with your right hand"'], [0.5, 1, '"Coach says: now your left!"']],
    },
  },
  {
    id: 'ball-busters', name: 'Ball Busters', slot: 'warmup',
    need: { balls: 'each' },
    steps: [
      'Everyone has a ball and stays inside the 3-point line.',
      'Everyone dribbles and tries to tap other players\' balls out of the area.',
      'Protect your own ball with your body and your free arm.',
      'If your ball goes out, do 10 crossovers outside the line, then come straight back in.',
      'Make the area smaller (just the key) to make it harder.',
    ],
    say: ['Free arm up like a shield', 'Keep it low', 'Never stop dribbling'],
    anim: {
      dur: 6,
      paths: false,
      p: [
        { b: 1, k: [[0, 150, 120], [0.33, 220, 180], [0.66, 170, 230], [1, 150, 120]] },
        { b: 1, k: [[0, 330, 110], [0.33, 290, 200], [0.66, 360, 190], [1, 330, 110]] },
        { b: 1, k: [[0, 250, 250], [0.33, 190, 170], [0.66, 280, 140], [1, 250, 250]] },
        { b: 1, k: [[0, 100, 200], [0.5, 150, 255], [1, 100, 200]] },
        { b: 1, k: [[0, 400, 210], [0.5, 340, 250], [1, 400, 210]] },
      ],
      cap: [[0, 1, 'Keep your ball, tap theirs out!']],
    },
  },
  {
    id: 'dribble-relay', name: 'Dribble Relay', slot: 'warmup',
    need: { balls: 'each', cones: 3 },
    steps: [
      'Make 3 teams. Each team lines up on the half-way line. Put a cone near the hoop end in front of each team.',
      'The first player dribbles to the cone with her RIGHT hand, goes around it, and comes back with her LEFT hand.',
      'High-five the next player, who goes next.',
      'First team to have everyone finish wins. Race again with a new move: speed dribble, or a crossover at the cone.',
    ],
    say: ['Right hand there, left hand back', 'Push it out in front', 'Head up!'],
    anim: {
      dur: 7,
      cones: [[130, 150], [250, 150], [370, 150]],
      p: [130, 250, 370].flatMap((x, j) => {
        const d = [0, 0.03, -0.02][j];
        return [
          { b: 1, k: [[0, x, 420], [0.05 + d, x, 420], [0.38 + d, x - 24, 160], [0.44 + d, x, 124], [0.5 + d, x + 24, 160], [0.85 + d, x + 4, 400], [1, x + 4, 400]] },
          { b: 1, k: [x, 452] },
          { b: 1, k: [x, 484] },
        ];
      }),
      cap: [[0, 0.42, 'Right hand to the cone'], [0.42, 0.85, 'Around it, left hand back'], [0.85, 1, 'High five! Next player goes']],
    },
  },

  /* ---------------- SKILLS: LOOK AFTER THE BALL ---------------- */
  {
    id: 'cone-weave', name: 'Cone Weave', slot: 'skill', theme: 'ball',
    need: { balls: 'each', cones: 8 },
    steps: [
      'Set out 2 lines of 4 cones, about 2 big steps apart.',
      'Make 2 lines of players, one at the start of each line of cones.',
      'Dribble in and out of the cones. Swap hands as you go past each cone, so the ball is always on the side away from the cone.',
      'At the end, speed dribble back down the outside and join the back of your line.',
      'Then try it: left hand only, then with crossovers, then as fast as you can without hitting a cone.',
    ],
    say: ['Ball away from the cone', 'Swap hands as you pass it', 'Eyes up, find the next cone'],
    anim: {
      dur: 7,
      cones: [[140, 130], [140, 200], [140, 270], [140, 340], [360, 130], [360, 200], [360, 270], [360, 340]],
      p: [
        { b: 1, k: [[0, 140, 420], [0.12, 110, 340], [0.24, 170, 270], [0.36, 110, 200], [0.48, 170, 130], [0.58, 140, 70], [0.7, 60, 150], [0.92, 60, 400], [1, 60, 400]] },
        { b: 1, k: [140, 455] },
        { b: 1, k: [140, 490] },
        { b: 1, k: [[0, 360, 420], [0.04, 360, 420], [0.16, 390, 340], [0.28, 330, 270], [0.4, 390, 200], [0.52, 330, 130], [0.62, 360, 70], [0.74, 440, 150], [0.95, 440, 400], [1, 440, 400]] },
        { b: 1, k: [360, 455] },
        { b: 1, k: [360, 490] },
      ],
      cap: [[0, 0.6, 'Weave in and out, swap hands at each cone'], [0.6, 1, 'Speed dribble back down the outside']],
    },
  },
  {
    id: 'jump-stop', name: 'Jump Stop and Pivot', slot: 'skill', theme: 'ball',
    need: { balls: 'each' },
    steps: [
      'Everyone has a ball and lines up on the baseline (the end line).',
      'Dribble forward. When you blow the whistle: JUMP STOP. Both feet land at the same time.',
      'Hold the ball tight at your chin, elbows out.',
      'Keep one foot glued to the floor. Step around with the other foot to turn and face the baseline (that\'s a pivot).',
      'Keep going to half way and back. Change which foot is glued each time.',
    ],
    say: ['Two feet, one bang!', 'Glue one foot down', 'Chin it: ball at your chin, elbows out'],
    anim: {
      dur: 7,
      p: [
        { team: 'c', k: [505, 250] },
        { b: 1, k: [[0, 110, 30], [0.32, 110, 200], [0.58, 110, 200], [0.62, 104, 210], [0.66, 110, 200], [0.9, 110, 360], [1, 110, 360]] },
        { b: 1, k: [[0, 200, 30], [0.32, 200, 200], [0.58, 200, 200], [0.62, 194, 210], [0.66, 200, 200], [0.9, 200, 360], [1, 200, 360]] },
        { b: 1, k: [[0, 300, 30], [0.32, 300, 200], [0.58, 300, 200], [0.62, 306, 210], [0.66, 300, 200], [0.9, 300, 360], [1, 300, 360]] },
        { b: 1, k: [[0, 390, 30], [0.32, 390, 200], [0.58, 390, 200], [0.62, 396, 210], [0.66, 390, 200], [0.9, 390, 360], [1, 390, 360]] },
      ],
      cap: [[0, 0.32, 'Dribble forward'], [0.32, 0.47, 'Whistle! JUMP STOP: both feet together'], [0.47, 0.68, 'Glue one foot, pivot around'], [0.68, 1, 'Dribble on to the next whistle']],
    },
  },
  {
    id: 'partner-passing', name: 'Partner Passing', slot: 'skill', theme: 'ball',
    need: { balls: 'some' },
    steps: [
      'Get into pairs with one ball. Stand facing each other, about 3 big steps apart.',
      'Chest pass: thumbs behind the ball, step towards your partner, push, and finish with your thumbs pointing down.',
      'Catch with "target hands": hands up, fingers spread, ready before the ball comes.',
      'Do 10 chest passes, then 10 bounce passes (bounce it about two-thirds of the way to your partner).',
      'Every time you get 10 in a row with no drops, both take one step back.',
    ],
    say: ['Step and push!', 'Show your target hands', 'Thumbs down at the finish'],
    anim: {
      dur: 4,
      p: [
        { k: [[0, 150, 140], [0.08, 150, 150], [0.2, 150, 140], [1, 150, 140]] },
        { k: [[0, 150, 330], [0.58, 150, 330], [0.66, 150, 320], [0.78, 150, 330], [1, 150, 330]] },
        { k: [[0, 350, 140], [0.08, 350, 150], [0.2, 350, 140], [1, 350, 140]] },
        { k: [[0, 350, 330], [0.58, 350, 330], [0.66, 350, 320], [0.78, 350, 330], [1, 350, 330]] },
      ],
      balls: [
        [[0, 0], [0.08, 0], [0.3, 1], [0.62, 1], [0.84, 0], [1, 0]],
        [[0, 2], [0.08, 2], [0.19, [362, 255]], [0.3, 3], [0.62, 3], [0.73, [362, 225]], [0.84, 2], [1, 2]],
      ],
      cap: [[0, 0.5, 'Left: chest pass. Right: bounce pass'], [0.5, 1, 'Catch with target hands']],
    },
  },
  {
    id: 'pass-follow', name: 'Pass and Follow', slot: 'skill', theme: 'ball',
    need: { balls: 'some' },
    steps: [
      'Make 2 lines facing each other, about 5 big steps apart. The first player in one line has the ball.',
      'Pass to the first player in the other line, then run and join the back of THAT line.',
      'The catcher does the same: pass across, then follow your pass.',
      'Count the passes out loud as a team. Can you get to 20 with no drops?',
      'Then try: bounce passes only, or catch with a jump stop before you pass.',
    ],
    say: ['Call her name, then pass', 'Target hands up', 'Pass, then run!'],
    anim: {
      dur: 7,
      p: [
        { k: [[0, 150, 260], [0.25, 150, 260], [0.4, 250, 320], [0.6, 455, 260], [1, 455, 260]] },
        { k: [[0, 115, 260], [0.3, 115, 260], [0.45, 150, 260], [1, 150, 260]] },
        { k: [[0, 80, 260], [0.32, 80, 260], [0.47, 115, 260], [1, 115, 260]] },
        { k: [[0, 350, 260], [0.78, 350, 260], [0.88, 250, 205], [1, 80, 260]] },
        { k: [[0, 385, 260], [0.8, 385, 260], [0.92, 350, 260], [1, 350, 260]] },
        { k: [[0, 420, 260], [0.82, 420, 260], [0.94, 385, 260], [1, 385, 260]] },
      ],
      balls: [[[0, 0], [0.08, 0], [0.25, 3], [0.62, 3], [0.78, 1], [1, 1]]],
      cap: [[0, 0.25, 'Pass across'], [0.25, 0.62, 'Follow your pass to the back of the other line'], [0.62, 1, 'Next pass comes back. Count them!']],
    },
  },
  {
    id: 'piggy', name: 'Piggy in the Middle', slot: 'skill', theme: 'ball',
    need: { balls: 'some', bibs: true },
    steps: [
      'Groups of 3 with one ball: 2 passers stand 4 big steps apart, 1 defender (in a bib) stands in the middle.',
      'Passers can\'t dribble. Pivot and fake to get the ball past the defender.',
      'No passes higher than your head.',
      'If the defender touches the ball, she swaps places with the passer who threw it.',
      'Swap the defender every minute anyway, so everyone gets a turn.',
    ],
    say: ['Pivot, don\'t run', 'Fake one way, pass the other', 'Pass past her hip'],
    anim: {
      dur: 6,
      p: [
        { k: [[0, 130, 260], [0.12, 130, 260], [0.17, 124, 276], [0.22, 130, 285], [0.3, 130, 260], [1, 130, 260]] },
        { team: 'd', k: [[0, 250, 260], [0.15, 195, 250], [0.25, 190, 236], [0.45, 250, 260], [0.6, 310, 262], [0.7, 312, 284], [0.9, 250, 260], [1, 250, 260]] },
        { k: [[0, 370, 260], [0.62, 370, 260], [0.67, 376, 244], [0.72, 370, 236], [0.78, 370, 260], [1, 370, 260]] },
      ],
      balls: [[[0, 0], [0.27, 0], [0.42, 2], [0.75, 2], [0.9, 0], [1, 0]]],
      cap: [[0, 0.27, 'Pivot and fake'], [0.27, 0.45, 'Pass past her hip'], [0.45, 1, 'Now the other side']],
    },
  },

  /* ---------------- SKILLS: PUT IT IN THE HOOP ---------------- */
  {
    id: 'layup-steps', name: 'Layup Steps: Right-Left-Up', slot: 'skill', theme: 'score',
    need: { balls: 'each' },
    steps: [
      'Everyone lines up on the right side of the hoop, about 3 big steps away, each holding a ball.',
      'Step with your RIGHT foot, then your LEFT foot, then jump UP off your left foot and lift your right knee.',
      'Shoot with your right hand. Aim for the top corner of the small square on the backboard.',
      'Get your own rebound and go to the back of the line.',
      'Once they\'ve got it walking, add one dribble first, then two. Left side: left foot, right foot, up, left hand.',
    ],
    say: ['Right, left, UP!', 'Hit the top corner of the square', 'Right knee up high'],
    anim: {
      dur: 6,
      p: [
        { k: [[0, 400, 250], [0.15, 400, 250], [0.3, 350, 195], [0.42, 312, 145], [0.55, 285, 102], [0.62, 285, 102], [0.72, 255, 90], [0.84, 425, 100], [0.96, 470, 318], [1, 470, 318]] },
        { b: 1, k: [[0, 432, 282], [0.62, 432, 282], [0.8, 400, 250], [1, 400, 250]] },
        { b: 1, k: [[0, 464, 314], [0.64, 464, 314], [0.82, 432, 282], [1, 432, 282]] },
      ],
      balls: [[[0, 0, 'h'], [0.55, 0], [0.64, 'hoop'], [0.68, 'hoop'], [0.72, 0], [1, 0]]],
      cap: [[0.15, 0.3, 'RIGHT foot'], [0.3, 0.42, 'LEFT foot'], [0.42, 0.58, 'UP! Right knee high'], [0.58, 0.7, 'Soft off the backboard'], [0.7, 1, 'Grab your rebound, back of the line']],
    },
  },
  {
    id: 'layup-lines', name: 'Layup Lines', slot: 'skill', theme: 'score',
    need: { balls: 'some' },
    steps: [
      'Make 2 lines near the top of the key: a shooting line on the right (with the balls) and a rebound line on the left.',
      'The first shooter dribbles in and does a right-side layup: right, left, UP.',
      'The first rebounder catches the ball (even if it goes in) and dribbles it to the back of the shooting line.',
      'The shooter goes to the back of the rebound line. Keep it moving!',
      'After 3 minutes, swap sides: left side, left hand, left-right-UP.',
    ],
    say: ['Right, left, UP!', 'Soft off the backboard', 'Rebounders: two hands, every time'],
    anim: {
      dur: 7,
      p: [
        { k: [[0, 390, 330], [0.1, 390, 330], [0.3, 322, 185], [0.42, 285, 102], [0.48, 285, 102], [0.58, 240, 170], [0.92, 30, 425], [1, 30, 425]] },
        { b: 1, k: [[0, 420, 362], [0.42, 420, 362], [0.58, 390, 330], [1, 390, 330]] },
        { b: 1, k: [[0, 450, 394], [0.44, 450, 394], [0.6, 420, 362], [1, 420, 362]] },
        { k: [[0, 110, 330], [0.3, 110, 330], [0.5, 218, 112], [0.56, 222, 118], [0.92, 470, 430], [1, 470, 430]] },
        { k: [[0, 80, 362], [0.5, 80, 362], [0.65, 110, 330], [1, 110, 330]] },
        { k: [[0, 50, 394], [0.52, 50, 394], [0.67, 80, 362], [1, 80, 362]] },
      ],
      balls: [[[0, 0], [0.42, 0], [0.5, 'hoop'], [0.53, 'hoop'], [0.57, 3], [1, 3]]],
      cap: [[0, 0.42, 'Dribble in: right, left, UP!'], [0.42, 0.6, 'Rebounder grabs it with two hands'], [0.6, 1, 'Swap lines']],
    },
  },
  {
    id: 'around-hoop', name: 'Around the Hoop', slot: 'skill', theme: 'score',
    need: { balls: 'some', cones: 5 },
    steps: [
      'Put 5 cones in a curve about 2 big steps from the hoop.',
      'Pairs: one shooter, one rebounder (one pair per cone if you can, or take turns).',
      'Shoot from the first cone. Make it, move to the next cone. Miss? Try again (3 tries, then move on anyway).',
      'The rebounder passes the ball back every time. Swap jobs after going round all 5 cones.',
      'Shoot with BEEF: Balance, Eyes on the hoop, Elbow under the ball, Follow through.',
    ],
    say: ['Elbow under the ball', 'Wave goodbye: follow through!', 'Bend your knees, use your legs'],
    anim: {
      dur: 7,
      cones: [[340, 52], [314, 116], [250, 142], [186, 116], [160, 52]],
      p: [
        { k: [[0, 340, 52], [0.27, 340, 52], [0.34, 314, 116], [0.6, 314, 116], [0.67, 250, 142], [1, 250, 142]] },
        { team: 'w', k: [[0, 270, 82], [0.6, 270, 82], [0.66, 232, 80], [1, 232, 80]] },
      ],
      balls: [[[0, 0], [0.06, 0], [0.12, 'hoop'], [0.15, 'hoop'], [0.2, 1], [0.27, 1], [0.36, 0], [0.4, 0], [0.46, 'hoop'], [0.49, 'hoop'], [0.54, 1], [0.62, 1], [0.7, 0], [0.74, 0], [0.8, 'hoop'], [0.83, 'hoop'], [0.88, 1], [1, 1]]],
      cap: [[0, 0.33, 'Make it? Move to the next cone'], [0.33, 0.66, 'Elbow under, follow through'], [0.66, 1, 'Rebounder (green) passes it back']],
    },
  },
  {
    id: 'hot-spots', name: 'Hot Spots', slot: 'skill', theme: 'score',
    need: { balls: 'some', cones: 2, bibs: true },
    steps: [
      'Split into 2 teams (one in bibs), one team on each side of the key. Each team gets 1 ball and 1 cone, about 2–3 big steps from the hoop.',
      'The first player shoots from the cone, grabs her own rebound, and passes to the next teammate.',
      'Then she runs to the back of her line.',
      '1 point for every basket. Count out loud as a team! First team to 10 wins.',
      'Play 3 rounds. Move the cones back one step each round.',
    ],
    say: ['Grab your rebound, fast!', 'Bend and shoot', 'Count out loud!'],
    anim: {
      dur: 6,
      cones: [[175, 150], [325, 150]],
      p: [
        { k: [[0, 175, 150], [0.16, 175, 150], [0.26, 215, 95], [0.33, 215, 95], [0.6, 60, 270], [1, 60, 270]] },
        { k: [[0, 135, 190], [0.42, 135, 190], [0.55, 175, 150], [1, 175, 150]] },
        { k: [[0, 95, 230], [0.5, 95, 230], [0.62, 135, 190], [1, 135, 190]] },
        { team: 'w', k: [[0, 325, 150], [0.26, 325, 150], [0.36, 285, 95], [0.43, 285, 95], [0.7, 440, 270], [1, 440, 270]] },
        { team: 'w', k: [[0, 365, 190], [0.52, 365, 190], [0.65, 325, 150], [1, 325, 150]] },
        { team: 'w', k: [[0, 405, 230], [0.6, 405, 230], [0.72, 365, 190], [1, 365, 190]] },
      ],
      balls: [
        [[0, 0], [0.08, 0], [0.15, 'hoop'], [0.18, 'hoop'], [0.26, 0], [0.32, 0], [0.42, 1], [0.62, 1], [0.7, 'hoop'], [0.74, 'hoop'], [0.8, [230, 110]], [1, [230, 110]]],
        [[0, 3], [0.18, 3], [0.25, 'hoop'], [0.28, 'hoop'], [0.36, 3], [0.42, 3], [0.52, 4], [0.72, 4], [0.8, 'hoop'], [0.84, 'hoop'], [0.9, [270, 110]], [1, [270, 110]]],
      ],
      cap: [[0, 0.3, 'Shoot, then grab your own rebound'], [0.3, 0.55, 'Pass to the next player'], [0.55, 1, '1 point for every basket!']],
    },
  },
  {
    id: 'jump-stop-finish', name: 'Jump Stop Finish', slot: 'skill', theme: 'score',
    need: { balls: 'each' },
    steps: [
      'One line at the top of the key, everyone with a ball.',
      'Dribble straight at the hoop. Jump stop just in front of it: both feet land together.',
      'Ball to your chin, then jump up off both feet and lay it in off the backboard.',
      'Get your rebound and dribble back to the line around the outside.',
      'Harder: a teammate walks behind you waving her arms. Stay strong and finish!',
    ],
    say: ['Stop strong on two feet', 'Chin, then UP!', 'Use the backboard'],
    anim: {
      dur: 6,
      p: [
        { k: [[0, 250, 330], [0.1, 250, 330], [0.35, 250, 122], [0.5, 250, 122], [0.56, 252, 112], [0.68, 262, 88], [0.85, 390, 250], [1, 300, 420]] },
        { b: 1, k: [[0, 250, 365], [0.32, 250, 365], [0.46, 250, 330], [1, 250, 330]] },
        { b: 1, k: [[0, 250, 400], [0.34, 250, 400], [0.48, 250, 365], [1, 250, 365]] },
      ],
      balls: [[[0, 0], [0.35, 0], [0.5, 0, 'h'], [0.56, 0], [0.62, 'hoop'], [0.65, 'hoop'], [0.7, 0], [1, 0]]],
      cap: [[0.08, 0.35, 'Dribble at the hoop'], [0.35, 0.5, 'JUMP STOP! Ball to your chin'], [0.5, 0.66, 'Up off two feet, off the backboard'], [0.66, 1, 'Rebound, dribble back around the outside']],
    },
  },

  /* ---------------- SKILLS: STOP THEM SCORING ---------------- */
  {
    id: 'mirror', name: 'Defence Mirror', slot: 'skill', theme: 'defence',
    need: {},
    steps: [
      'Pairs, facing each other, about 2 big steps apart. No ball yet.',
      'One player is the leader and shuffles side to side. The other copies her, like a mirror.',
      'The defender stays low: feet wide, knees bent, hands up and out. Slide your feet. Don\'t cross them.',
      'Go for 20 seconds, then swap.',
      'Then give the leader a ball to dribble while the defender mirrors her.',
    ],
    say: ['Low and wide, like sitting on a chair', 'Slide, don\'t cross', 'Busy hands!'],
    anim: {
      dur: 5,
      p: [
        { k: [[0, 150, 190], [0.2, 95, 190], [0.45, 200, 190], [0.7, 115, 190], [1, 150, 190]] },
        { team: 'd', k: [[0, 146, 270], [0.06, 150, 270], [0.26, 95, 270], [0.51, 200, 270], [0.76, 115, 270], [1, 146, 270]] },
        { k: [[0, 350, 190], [0.25, 410, 190], [0.5, 300, 190], [0.75, 385, 190], [1, 350, 190]] },
        { team: 'd', k: [[0, 346, 270], [0.06, 350, 270], [0.31, 410, 270], [0.56, 300, 270], [0.81, 385, 270], [1, 346, 270]] },
      ],
      cap: [[0, 0.5, 'Leader (blue) shuffles side to side'], [0.5, 1, 'Defender (red) copies: low and wide']],
    },
  },
  {
    id: 'zigzag', name: 'Zig-Zag Slides', slot: 'skill', theme: 'defence',
    need: { cones: 5 },
    steps: [
      'Set out 5 cones in a zig-zag up the court, about 3 big steps apart.',
      'Start at the first cone in your defence stance: feet wide, knees bent, hands out.',
      'Slide to the next cone without crossing your feet. Turn, then slide to the next one.',
      'Jog back down the side and go again. Start the next player when the one in front reaches the second cone.',
      'Harder: add a partner who dribbles the zig-zag slowly while you guard her.',
    ],
    say: ['Push off your back foot', 'Stay low, don\'t bounce up', 'Never cross your feet'],
    anim: {
      dur: 7,
      cones: [[130, 420], [300, 350], [130, 280], [300, 210], [130, 140]],
      p: [
        { team: 'd', k: [[0, 130, 420], [0.15, 300, 350], [0.3, 130, 280], [0.45, 300, 210], [0.6, 130, 140], [0.72, 50, 220], [0.95, 50, 440], [1, 50, 440]] },
        { team: 'd', k: [[0, 100, 470], [0.15, 100, 470], [0.25, 130, 420], [0.4, 300, 350], [0.55, 130, 280], [0.7, 300, 210], [0.85, 130, 140], [1, 130, 140]] },
      ],
      cap: [[0, 0.6, 'Slide, don\'t cross your feet'], [0.6, 1, 'Jog back down the side']],
    },
  },
  {
    id: 'find-player', name: 'Find Your Player', slot: 'skill', theme: 'defence',
    need: { bibs: true },
    steps: [
      'Split into 2 teams (one in bibs). Number the players in each team 1, 2, 3, 4.',
      'Each defender guards the attacker with the SAME number.',
      'Attackers walk around the half court (no ball yet). Defenders stay between their player and the hoop, pointing at her.',
      'Shout "Freeze!" Everyone stops. Check: is every defender between her player and the basket?',
      'Then add a ball: attackers pass (no dribbling) and defenders stay with their number.',
    ],
    say: ['Ball, you, hoop: stay in between!', 'Point at your player', 'Talk: "I\'ve got 2!"'],
    anim: {
      dur: 8,
      p: [
        { n: 1, k: [[0, 85, 230], [0.28, 60, 110], [0.56, 140, 300], [0.82, 85, 230], [1, 85, 230]] },
        { n: 2, k: [[0, 415, 230], [0.28, 440, 110], [0.56, 360, 320], [0.82, 415, 230], [1, 415, 230]] },
        { n: 3, k: [[0, 250, 340], [0.28, 180, 260], [0.56, 320, 270], [0.82, 250, 340], [1, 250, 340]] },
        { n: 4, k: [[0, 330, 120], [0.28, 210, 110], [0.56, 170, 170], [0.82, 330, 120], [1, 330, 120]] },
        { team: 'd', n: 1, guard: 0, lag: 0.03 },
        { team: 'd', n: 2, guard: 1, lag: 0.03 },
        { team: 'd', n: 3, guard: 2, lag: 0.03 },
        { team: 'd', n: 4, guard: 3, lag: 0.03 },
      ],
      cap: [[0, 0.82, 'Red 1 guards blue 1, red 2 guards blue 2...'], [0.82, 1, 'FREEZE! Is everyone between her player and the hoop?']],
    },
  },
  {
    id: 'closeouts', name: 'Closeouts', slot: 'skill', theme: 'defence',
    need: { balls: 'some' },
    steps: [
      'Defenders line up on the baseline next to the hoop. The first one has a ball. One attacker stands on the wing.',
      'The defender passes to the attacker, then sprints out towards her.',
      'Halfway there, switch to short, quick "chop chop" steps with one hand up high.',
      'Stop in your stance, an arm\'s length away. The attacker counts "1, 2, 3" then tries to dribble past. Stay in front!',
      'The defender becomes the next attacker. The attacker goes to the back of the defender line.',
    ],
    say: ['Sprint, then chop-chop-chop', 'High hand!', 'Stop an arm\'s length away'],
    anim: {
      dur: 7,
      p: [
        { team: 'd', k: [[0, 330, 25], [0.12, 330, 25], [0.3, 180, 140], [0.43, 128, 188], [0.55, 128, 188], [0.8, 195, 248], [1, 195, 248]] },
        { team: 'd', k: [[0, 365, 25], [0.3, 365, 25], [0.45, 330, 25], [1, 330, 25]] },
        { team: 'd', k: [[0, 400, 25], [0.32, 400, 25], [0.47, 365, 25], [1, 365, 25]] },
        { k: [[0, 85, 230], [0.58, 85, 230], [0.82, 160, 290], [1, 160, 290]] },
      ],
      balls: [[[0, 0], [0.08, 0], [0.2, 3], [1, 3]]],
      cap: [[0, 0.12, 'Pass out to the wing'], [0.12, 0.3, 'Sprint!'], [0.3, 0.45, 'Chop, chop, chop. High hand!'], [0.45, 0.58, 'Stance: an arm\'s length away'], [0.58, 1, 'She dribbles. Stay in front!']],
    },
  },
  {
    id: 'box-out', name: 'Box Out Battle', slot: 'skill', theme: 'defence',
    need: { balls: 'some', bibs: true },
    steps: [
      'Pairs near the key: one attacker and one defender (in a bib). The defender stands between her attacker and the hoop.',
      'You (the coach) shoot from the top.',
      'When the shot goes up, the defender turns, puts her back against the attacker, bends her knees and spreads her arms wide.',
      'Hold her out until the ball bounces, then grab it with 2 hands. No pushing with your hands!',
      'Swap jobs after every shot.',
    ],
    say: ['Find her, turn, sit!', 'Arms out wide like wings', 'Grab it with two hands'],
    anim: {
      dur: 6,
      p: [
        { team: 'c', k: [250, 330] },
        { k: [[0, 150, 190], [0.2, 150, 190], [0.32, 165, 175], [0.45, 180, 182], [0.55, 168, 186], [1, 168, 186]] },
        { team: 'd', k: [[0, 176, 154], [0.2, 176, 154], [0.3, 186, 150], [0.45, 196, 154], [0.55, 196, 150], [0.64, 228, 126], [1, 228, 126]] },
        { k: [[0, 360, 200], [0.2, 360, 200], [0.35, 345, 182], [0.5, 330, 190], [1, 330, 190]] },
        { team: 'd', k: [[0, 333, 164], [0.2, 333, 164], [0.35, 322, 152], [0.5, 310, 158], [1, 310, 158]] },
      ],
      balls: [[[0, 0], [0.15, 0], [0.3, 'hoop'], [0.35, 'hoop'], [0.45, [240, 118]], [0.56, [240, 118]], [0.64, 2], [1, 2]]],
      cap: [[0, 0.2, 'Coach shoots'], [0.2, 0.52, 'Find her, turn, sit: BOX OUT!'], [0.52, 1, 'Ball bounces. Grab it with 2 hands']],
    },
  },

  /* ---------------- SKILLS: SPREAD OUT & GET OPEN ---------------- */
  {
    id: 'spacing-spots', name: 'Spacing Spots', slot: 'skill', theme: 'sense',
    need: { balls: 'some', cones: 5 },
    steps: [
      'Put 5 cones out: 1 at the top, 1 on each wing, 1 in each corner. These are the "spots".',
      '4 players stand on a spot each, so one spot is empty. One player has the ball. Others wait and swap in.',
      'Pass the ball to a teammate. Then run to the EMPTY spot.',
      'Keep going: pass, then run to the empty spot. No dribbling. Never stand next to a teammate.',
      'Shout "Freeze!" now and then. Is everyone on a different spot? Then add 1 or 2 defenders.',
    ],
    say: ['Find the empty spot!', 'Two big steps apart, never bunch', 'Hands up, call for it'],
    anim: {
      dur: 7,
      cones: [TOP, LW, RW, LC, RC],
      p: [
        { k: [[0, ...TOP], [0.22, ...TOP], [0.32, 330, 190], [0.45, ...RC], [1, ...RC]] },
        { k: LW },
        { k: [[0, ...RW], [0.67, ...RW], [0.85, ...TOP], [1, ...TOP]] },
        { k: LC },
      ],
      balls: [[[0, 0], [0.1, 0], [0.22, 2], [0.55, 2], [0.67, 0], [1, 0]]],
      cap: [[0, 0.22, 'Pass'], [0.22, 0.5, 'Run to the empty spot'], [0.5, 0.67, 'Pass again'], [0.67, 1, 'Run to the empty spot']],
    },
  },
  {
    id: 'give-and-go', name: 'Give-and-Go', slot: 'skill', theme: 'sense',
    need: { balls: 'some' },
    steps: [
      'Make 2 lines: one at the top of the key (with the balls) and one on the right wing.',
      'The first player at the top passes to the wing.',
      'Then she cuts (runs fast) straight to the hoop with her hand up.',
      'The wing passes it back. The cutter catches it and does a layup.',
      'The passer goes to the back of the top line. The cutter grabs her rebound and goes to the wing line. After a few minutes, use the left wing.',
    ],
    say: ['Pass and GO!', 'Hand up: show where you want it', 'Cut hard, not a jog'],
    anim: {
      dur: 7,
      p: [
        { k: [[0, ...TOP], [0.2, ...TOP], [0.28, 268, 290], [0.45, 288, 122], [0.52, 278, 98], [0.62, 278, 98], [0.7, 252, 92], [0.95, 445, 262], [1, 445, 262]] },
        { b: 1, k: [[0, 250, 365], [0.3, 250, 365], [0.45, 250, 330], [1, 250, 330]] },
        { b: 1, k: [[0, 250, 400], [0.32, 250, 400], [0.47, 250, 365], [1, 250, 365]] },
        { k: [[0, ...RW], [0.45, ...RW], [0.8, 250, 400], [1, 250, 400]] },
        { k: [[0, 445, 262], [0.5, 445, 262], [0.65, ...RW], [1, ...RW]] },
      ],
      balls: [[[0, 0], [0.08, 0], [0.2, 3], [0.33, 3], [0.45, 0], [0.52, 0], [0.6, 'hoop'], [0.64, 'hoop'], [0.7, 0], [1, 0]]],
      cap: [[0, 0.2, 'Pass to the wing'], [0.2, 0.45, 'Cut to the hoop, hand up!'], [0.45, 0.66, 'Catch it back, lay it up'], [0.66, 1, 'Swap lines']],
    },
  },
  {
    id: 'two-v-one', name: '2 v 1', slot: 'skill', theme: 'sense',
    need: { balls: 'some', bibs: true },
    steps: [
      '2 attackers start at half way with a ball, spread wide. 1 defender (in a bib) waits at the free-throw line.',
      'The player with the ball dribbles straight at the hoop.',
      'If the defender comes to stop her, PASS to the open teammate. If the defender doesn\'t, keep going and lay it up.',
      'Play until there\'s a basket or the defender gets the ball. Then rotate: an attacker becomes the defender.',
      'When they\'ve got it, play 3 v 2.',
    ],
    say: ['Make her stop you, then pass', 'Stay wide, don\'t come to the ball', 'Go hard to the hoop'],
    anim: {
      dur: 6,
      p: [
        { k: [[0, 180, 440], [0.38, 215, 240], [1, 215, 240]] },
        { k: [[0, 360, 440], [0.45, 345, 220], [0.55, 328, 168], [0.65, 282, 102], [1, 282, 102]] },
        { team: 'd', k: [[0, 250, 200], [0.3, 236, 214], [0.4, 222, 205], [0.55, 252, 188], [0.7, 270, 140], [1, 270, 140]] },
      ],
      balls: [[[0, 0], [0.42, 0], [0.55, 1], [0.65, 1], [0.72, 'hoop'], [0.76, 'hoop'], [0.82, [250, 88]], [1, [250, 88]]]],
      cap: [[0, 0.4, 'Dribble straight at the hoop'], [0.4, 0.55, 'Defender stops her? PASS!'], [0.55, 1, 'Open player scores']],
    },
  },
  {
    id: 'keepings-off', name: 'No-Dribble Keepings Off', slot: 'skill', theme: 'sense',
    need: { balls: 'some', bibs: true },
    steps: [
      'Split into 2 teams with bibs: 3 v 3 or 4 v 4 on the half court.',
      'No dribbling allowed. Pass only!',
      'The team with the ball tries to make 5 passes in a row. That\'s 1 point.',
      'Without the ball, move into empty space and call for it. The defence tries to intercept.',
      'If you\'re standing next to a teammate, one of you must move away.',
    ],
    say: ['Move to empty space!', 'Pass and move', 'Call her name'],
    anim: {
      dur: 7,
      p: [
        { k: [[0, 150, 300], [0.3, 105, 200], [0.6, 165, 360], [1, 150, 300]] },
        { k: [[0, 350, 300], [0.3, 405, 380], [0.6, 330, 210], [1, 350, 300]] },
        { k: [[0, 250, 150], [0.3, 300, 125], [0.6, 200, 120], [1, 250, 150]] },
        { team: 'd', guard: 0, lag: 0.05 },
        { team: 'd', guard: 1, lag: 0.05 },
        { team: 'd', guard: 2, lag: 0.05 },
      ],
      balls: [[[0, 0], [0.15, 0], [0.25, 1], [0.4, 1], [0.5, 2], [0.65, 2], [0.75, 0], [1, 0]]],
      cap: [[0, 0.25, 'Pass only, no dribbling'], [0.25, 0.5, '1 pass... move to empty space'], [0.5, 0.75, '2 passes...'], [0.75, 1, '3 passes... keep going to 5!']],
    },
  },
  {
    id: 'throw-in', name: 'Throw-in Practice', slot: 'skill', theme: 'sense',
    need: { balls: 'some', bibs: true },
    steps: [
      'One player takes the ball out over the sideline. 2 teammates are on the court, with 2 defenders (in bibs).',
      'The thrower has 5 seconds. Everyone counts out loud. She can\'t step on the line.',
      'Teammates: run away from the ball first, then come back to it fast (a "V" cut). Hand up!',
      'Catch with 2 hands, turn and face the hoop.',
      'Swap the thrower and defenders every 3 throw-ins. Practise from the baseline too.',
    ],
    say: ['Count to 5!', 'Fake away, then come back hard', 'Two hands on the catch'],
    anim: {
      dur: 6,
      p: [
        { k: [508, 260] },
        { k: [[0, 380, 270], [0.25, 300, 330], [0.45, 438, 250], [1, 438, 250]] },
        { k: [[0, 260, 210], [0.5, 320, 110], [1, 320, 110]] },
        { team: 'd', guard: 1, lag: 0.06 },
        { team: 'd', guard: 2, lag: 0.06 },
      ],
      balls: [[[0, 0, 'h'], [0.45, 0], [0.58, 1], [1, 1]]],
      cap: [[0, 0.22, 'Thrower counts: 1, 2, 3...'], [0.22, 0.45, 'Run away, then come back hard'], [0.45, 1, 'Two-hand catch, face the hoop']],
    },
  },

  /* ---------------- TEAM GAMES ---------------- */
  {
    id: 'three-pass', name: 'Three-Pass Game', slot: 'game', theme: 'sense',
    need: { balls: 'some', bibs: true },
    steps: [
      '2 teams with bibs: 4 v 4 (or 5 v 5) on the half court. Swap extra players in every 2 minutes.',
      'Normal basketball, with one rule: your team must make 3 passes before anyone can shoot.',
      'Everyone counts the passes out loud.',
      'When the defence gets the ball, they take it out past the 3-point line before they attack.',
      'Basket = 2 points. Keep score out loud so everyone knows.',
    ],
    say: ['Count the passes out loud!', 'Spread out, give her space', 'Hands up on defence'],
    anim: {
      dur: 8,
      p: [
        { k: [[0, 250, 320], [0.4, 280, 330], [1, 280, 330]] },
        { k: [[0, ...LW], [0.32, ...LW], [0.5, 190, 140], [1, 190, 140]] },
        { k: [[0, ...RW], [0.3, ...RW], [0.5, 385, 280], [1, 385, 280]] },
        { k: [[0, 440, 75], [0.28, 420, 112], [1, 420, 112]] },
        { team: 'd', guard: 0, lag: 0.04 },
        { team: 'd', guard: 1, lag: 0.08 },
        { team: 'd', guard: 2, lag: 0.04 },
        { team: 'd', guard: 3, lag: 0.04 },
      ],
      balls: [[[0, 0], [0.08, 0], [0.18, 2], [0.28, 2], [0.38, 3], [0.48, 3], [0.58, 1], [0.62, 1], [0.7, 'hoop'], [0.74, 'hoop'], [0.8, [250, 92]], [1, [250, 92]]]],
      cap: [[0.08, 0.28, 'Pass 1!'], [0.28, 0.48, 'Pass 2!'], [0.48, 0.62, 'Pass 3!'], [0.62, 1, 'Now you can shoot']],
    },
  },
  {
    id: 'freeze-game', name: 'Freeze Game', slot: 'game', theme: 'sense',
    need: { balls: 'some', bibs: true },
    steps: [
      '2 teams with bibs: 4 v 4 on the half court. Swap extra players in every 2 minutes.',
      'Play normal basketball.',
      'Every 30–60 seconds, blow your whistle and shout "FREEZE!" Everyone stops like a statue.',
      'Check: are 2 attackers close enough to touch? Then the other team gets the ball. Is every defender between her player and the hoop? Defence gets a point.',
      'Fix it ("Move away from your teammate"), then play on.',
    ],
    say: ['FREEZE!', 'Could you touch a teammate? Move!', 'Find your space'],
    anim: {
      dur: 8,
      p: [
        { k: [[0, 250, 330], [0.62, 228, 250], [1, 228, 250]] },
        { k: [[0, ...LW], [0.62, 190, 268], [0.8, 190, 268], [0.96, 80, 205], [1, 80, 205]] },
        { k: [[0, ...RW], [0.62, 400, 200], [1, 400, 200]] },
        { k: [[0, 60, 80], [0.62, 125, 70], [1, 125, 70]] },
        { team: 'd', guard: 0, lag: 0.04 },
        { team: 'd', guard: 1, lag: 0.04 },
        { team: 'd', guard: 2, lag: 0.04 },
        { team: 'd', guard: 3, lag: 0.04 },
      ],
      balls: [[[0, 0], [0.62, 0], [1, 0, 'h']]],
      cap: [[0, 0.62, 'Play normal basketball'], [0.62, 0.8, 'FREEZE! Two blues too close together'], [0.8, 1, 'Move apart, then play on']],
    },
  },
  {
    id: 'matchup-game', name: 'Matchup Game', slot: 'game', theme: 'defence',
    need: { balls: 'some', bibs: true },
    steps: [
      '2 teams with bibs: 4 v 4 on the half court. Give everyone a number, 1 to 4, in each team.',
      'You can only guard the player with the SAME number as you.',
      'Before each attack, defenders point at their player and shout her number.',
      'Play normal basketball. Defence gets a point for every steal or stop. Basket = 2 points.',
      'Swap extra players in every 2 minutes. They take the number of the player they replace.',
    ],
    say: ['Point and shout!', 'Ball, you, hoop', 'Stay with your number'],
    anim: {
      dur: 8,
      p: [
        { n: 1, k: [[0, 250, 320], [0.5, 230, 300], [1, 250, 320]] },
        { n: 2, k: [[0, ...LW], [0.35, 185, 135], [0.7, 120, 300], [1, ...LW]] },
        { n: 3, k: [[0, ...RW], [0.4, 440, 110], [0.8, ...RW], [1, ...RW]] },
        { n: 4, k: [[0, 55, 80], [0.5, 115, 60], [1, 55, 80]] },
        { team: 'd', n: 1, guard: 0, lag: 0.03 },
        { team: 'd', n: 2, guard: 1, lag: 0.03 },
        { team: 'd', n: 3, guard: 2, lag: 0.03 },
        { team: 'd', n: 4, guard: 3, lag: 0.03 },
      ],
      balls: [[[0, 0], [0.3, 0], [0.38, 1], [0.5, 1], [0.6, 0], [1, 0]]],
      cap: [[0, 0.2, 'Point and shout your number'], [0.2, 1, 'Stay with your number!']],
    },
  },
  {
    id: 'inside-points', name: 'Inside Points', slot: 'game', theme: 'score',
    need: { balls: 'some', bibs: true },
    steps: [
      '2 teams with bibs: 4 v 4 on the half court. Swap extra players in every 2 minutes.',
      'Normal basketball, but a basket from INSIDE the key = 2 points. Any other basket = 1 point.',
      'Attack the hoop: dribble or cut to the basket for layups.',
      'Defence: stop the layup by staying between your player and the hoop. Hands up. Don\'t hit arms.',
    ],
    say: ['Attack the hoop!', 'Right, left, UP!', 'Stay between her and the basket'],
    anim: {
      dur: 8,
      p: [
        { k: [[0, ...TOP], [1, ...TOP]] },
        { k: LW },
        { k: [[0, ...RW], [0.2, 440, 262], [0.45, 300, 128], [0.55, 278, 100], [1, 278, 100]] },
        { k: LC },
        { team: 'd', guard: 0 },
        { team: 'd', guard: 1 },
        { team: 'd', guard: 2, lag: 0.12 },
        { team: 'd', guard: 3 },
      ],
      balls: [[[0, 0], [0.35, 0, 'h'], [0.47, 2], [0.55, 2], [0.63, 'hoop'], [0.68, 'hoop'], [0.75, [250, 90]], [1, [250, 90]]]],
      cap: [[0, 0.47, 'Cut to the key'], [0.47, 0.75, 'Basket inside the key = 2 points'], [0.75, 1, 'Anywhere else = 1 point']],
    },
  },
  {
    id: 'rotating-3v3', name: 'Rotating 3 v 3', slot: 'game', theme: 'ball',
    need: { balls: 'some', bibs: true },
    steps: [
      'Make 3 teams of 3 (with 8 players, play 4 v 4 and swap 2 players at a time instead).',
      '2 teams play 3 v 3 on the half court. The third team waits at half way, dribbling on the spot.',
      'Special rule: no more than 3 bounces, then you must pass or shoot.',
      'After every basket (or every 2 minutes), the waiting team comes on and the team that has been on longest goes off.',
      'Basket = 2 points. Keep a running team score.',
    ],
    say: ['3 bounces max, then pass or shoot', 'Spread out!', 'Next team, get ready!'],
    anim: {
      dur: 8,
      p: [
        { k: [[0, 250, 320], [0.2, 230, 262], [1, 230, 262]] },
        { k: [[0, 90, 210], [0.35, 100, 205], [0.55, 172, 112], [1, 172, 112]] },
        { k: [[0, 420, 150], [1, 420, 150]] },
        { team: 'd', guard: 0, lag: 0.04 },
        { team: 'd', guard: 1, lag: 0.08 },
        { team: 'd', guard: 2 },
        { team: 'w', b: 1, k: [[0, 170, 490], [0.25, 162, 490], [0.5, 170, 490], [0.75, 178, 490], [1, 170, 490]] },
        { team: 'w', b: 1, k: [[0, 250, 490], [0.25, 258, 490], [0.5, 250, 490], [0.75, 242, 490], [1, 250, 490]] },
        { team: 'w', b: 1, k: [[0, 330, 490], [0.25, 322, 490], [0.5, 330, 490], [0.75, 338, 490], [1, 330, 490]] },
      ],
      balls: [[[0, 0], [0.22, 0, 'h'], [0.32, 1], [0.58, 1], [0.66, 'hoop'], [0.7, 'hoop'], [0.76, [250, 90]], [1, [250, 90]]]],
      cap: [[0, 0.22, '1, 2, 3 bounces...'], [0.22, 0.6, '...then pass or shoot'], [0.6, 1, 'Basket! Green team comes on next']],
    },
  },
];

/* The huddle is the same every session; the question and home
   challenge change with the focus. */
const HUDDLE = {
  id: 'huddle', name: 'Huddle and Cheer',
  steps: [
    'Everyone grabs a drink and sits in a circle.',
    'Ask today\'s question (below). Let a few girls answer.',
    'Shout-out: "Who saw a teammate do something great today?"',
    'Give them the home challenge (below).',
    'Hands in the middle: "1, 2, 3... TEAM!"',
  ],
  byTheme: {
    sense:   { q: 'What should you do if you\'re standing right next to a teammate?', a: 'Move away and find empty space.', home: 'Watch 5 minutes of any basketball game. Spot the players spreading out.' },
    ball:    { q: 'What do your feet do when you stop dribbling?', a: 'Jump stop: both feet land together. Then pivot on one foot.', home: '50 dribbles with each hand, eyes up, while the TV is on.' },
    score:   { q: 'What are the layup steps on the right side?', a: 'Right, left, UP!', home: 'Practise "right, left, UP" steps in the hallway. No ball needed!' },
    defence: { q: 'Where should a defender stand?', a: 'Between her player and the hoop.', home: 'Hold your defence stance for 30 seconds while you brush your teeth.' },
  },
  anim: {
    dur: 5,
    paths: false,
    p: [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
      const ang = (i / 8) * Math.PI * 2;
      const start = [[70, 120], [430, 140], [120, 400], [380, 410], [250, 120], [60, 300], [440, 300], [250, 420]][i];
      return { k: [[0, ...start], [0.5, 250 + Math.cos(ang) * 72, 270 + Math.sin(ang) * 72], [1, 250 + Math.cos(ang) * 72, 270 + Math.sin(ang) * 72]] };
    }).concat([{ team: 'c', k: [250, 270] }]),
    cap: [[0, 0.5, 'Bring it in!'], [0.5, 1, '"1, 2, 3... TEAM!"']],
  },
};
