/* =========================================================
   Half-court drawing + a tiny keyframe animation engine.

   Court units: a FIBA half court, 500 wide × 467 deep
   (1 m ≈ 33.3 units). The basket is at the top, the half-way
   line at the bottom.

   An animation is plain data (see drills.js):
     dur     seconds per loop
     cones   [[x, y], ...]
     p       players: { k: [[t, x, y], ...] | [x, y], team, n, b, guard, lag }
               team  'a' attacker (blue, default) · 'd' defender (red)
                     'c' coach (grey) · 'w' waiting team (green)
               n     label shown on the player
               b     1 = carries her own ball the whole time
               guard index of the attacker this defender guards
                     (she stays between that player and the hoop)
               lag   how far behind (0–1 of the loop) a guard reacts
     balls   [[[t, ref, flag], ...], ...]
               ref   player index · 'hoop' · [x, y]
               flag  'h' = held (no dribble) until the next keyframe
     cap     [[t0, t1, 'caption'], ...]
     paths   false = hide the dashed guide lines (busy games)
   Times are fractions of the loop (0–1).
   ========================================================= */
const Court = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const HOOP = [250, 52.5];
  const VIEW = '-30 -30 560 545';
  const COLORS = { a: '#2563EB', d: '#DC2626', c: '#475569', w: '#16A34A' };
  const LINE = '#C2410C';
  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function drawCourt(svg) {
    const g = el('g', { class: 'court' }, svg);
    el('rect', { x: -30, y: -30, width: 560, height: 545, fill: '#EDE3D3' }, g);
    el('rect', { x: 0, y: 0, width: 500, height: 515, fill: '#FFF3E0' }, g);
    const lines = el('g', { fill: 'none', stroke: LINE, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    // the key ("paint")
    el('rect', { x: 168.3, y: 0, width: 163.4, height: 193, fill: '#FFE1BF' }, lines);
    // free-throw circle: solid outside the key, dashed inside
    el('path', { d: 'M190 193 A60 60 0 0 0 310 193' }, lines);
    el('path', { d: 'M190 193 A60 60 0 0 1 310 193', 'stroke-dasharray': '8 8', opacity: 0.6 }, lines);
    // three-point line
    el('path', { d: 'M30 0 L30 99.7 A225 225 0 0 0 470 99.7 L470 0' }, lines);
    // no-charge semicircle
    el('path', { d: 'M208.3 52.5 A41.7 41.7 0 0 0 291.7 52.5', opacity: 0.6 }, lines);
    // boundary, half-way line, centre circle
    el('path', { d: 'M0 515 L0 0 L500 0 L500 515' }, lines);
    el('line', { x1: 0, y1: 467, x2: 500, y2: 467 }, lines);
    el('circle', { cx: 250, cy: 467, r: 60 }, lines);
    // backboard and rim
    el('line', { x1: 220, y1: 40, x2: 280, y2: 40, stroke: '#1E2A4A', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    el('line', { x1: 250, y1: 40, x2: 250, y2: 45, stroke: '#EA580C', 'stroke-width': 3 }, g);
    el('circle', { cx: HOOP[0], cy: HOOP[1], r: 7.5, fill: 'none', stroke: '#EA580C', 'stroke-width': 3.5 }, g);
  }

  const ease = u => u * u * (3 - 2 * u);
  const lerp = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  function track(k, t) {
    if (t <= k[0][0]) return [k[0][1], k[0][2]];
    for (let i = 0; i < k.length - 1; i++) {
      const a = k[i], b = k[i + 1];
      if (t <= b[0]) {
        const u = b[0] === a[0] ? 1 : ease((t - a[0]) / (b[0] - a[0]));
        return lerp([a[1], a[2]], [b[1], b[2]], u);
      }
    }
    const last = k[k.length - 1];
    return [last[1], last[2]];
  }

  function normalise(anim) {
    const players = (anim.p || []).map(p => {
      const k = p.k ? (typeof p.k[0] === 'number' ? [[0, p.k[0], p.k[1]]] : p.k) : null;
      return { ...p, k, team: p.team || 'a' };
    });
    return {
      dur: anim.dur || 6,
      cones: anim.cones || [],
      players,
      balls: anim.balls || [],
      cap: anim.cap || [],
      paths: anim.paths !== false,
    };
  }

  // Builds the position functions for one animation.
  function engine(a) {
    const playerPos = (i, t) => {
      const p = a.players[i];
      if (p.guard == null) return track(p.k, t);
      const lagT = Math.max(0, t - (p.lag || 0));
      const att = playerPos(p.guard, lagT);
      const len = dist(att, HOOP) || 1;
      const off = Math.min(len * 0.45, 42);
      return [att[0] + (HOOP[0] - att[0]) / len * off, att[1] + (HOOP[1] - att[1]) / len * off];
    };
    const moving = (i, t) => dist(playerPos(i, Math.max(0, t - 0.01)), playerPos(i, Math.min(1, t + 0.01))) > 1.2;
    const hand = (i, t) => {
      const pos = playerPos(i, t);
      return [pos[0] + 12, pos[1] + 9];
    };
    const resolve = (ref, t) => (typeof ref === 'number' ? hand(ref, t) : ref === 'hoop' ? HOOP : ref);

    // Returns { pos, scale, dribble } for a ball track at time t.
    const ballState = (k, t) => {
      let i = 0;
      while (i < k.length - 1 && t >= k[i + 1][0]) i++;
      const a0 = k[i], b0 = k[i + 1];
      const holding = (ref) => typeof ref === 'number';
      if (!b0 || t < a0[0] || a0[1] === b0[1]) {
        const ref = a0[1];
        const dribble = holding(ref) && a0[2] !== 'h' && moving(ref, t);
        return { pos: resolve(ref, t), scale: 1, dribble };
      }
      const u = (t - a0[0]) / (b0[0] - a0[0]);
      const from = resolve(a0[1], a0[0]);
      const to = resolve(b0[1], b0[0]);
      const shot = b0[1] === 'hoop';
      return { pos: lerp(from, to, shot ? ease(u) : u), scale: 1 + (shot ? 0.7 : 0.15) * Math.sin(Math.PI * u), dribble: false };
    };
    return { playerPos, moving, hand, ballState };
  }

  function needsFade(a, eng) {
    for (let i = 0; i < a.players.length; i++) {
      if (dist(eng.playerPos(i, 0), eng.playerPos(i, 1)) > 3) return true;
    }
    return a.balls.some(k => dist(eng.ballState(k, 0).pos, eng.ballState(k, 0.9999).pos) > 3);
  }

  function makeBall(parent) {
    const g = el('g', { class: 'ball' }, parent);
    el('circle', { r: 7, fill: '#F97316', stroke: '#7C2D12', 'stroke-width': 1.6 }, g);
    el('path', { d: 'M-7 0 H7 M0 -7 V7', stroke: '#7C2D12', 'stroke-width': 1, opacity: 0.6 }, g);
    return g;
  }

  /* Draws an animated diagram into `host`. Returns a small controller. */
  function create(host, rawAnim, opts = {}) {
    const a = normalise(rawAnim);
    const eng = engine(a);
    const fade = needsFade(a, eng);

    host.classList.add('diagram');
    host.innerHTML = '';
    const stage = document.createElement('div');
    stage.className = 'diagram-stage';
    host.appendChild(stage);
    const svg = el('svg', { viewBox: VIEW, role: 'img', 'aria-label': opts.label || 'Animated court diagram' }, stage);
    drawCourt(svg);

    const pathsG = el('g', { fill: 'none', 'stroke-width': 2.5, 'stroke-dasharray': '7 7', 'stroke-linecap': 'round', opacity: 0.4 }, svg);
    a.players.forEach(p => {
      if (!a.paths || !p.k || p.k.length < 2) return;
      const pts = [];
      p.k.forEach(([, x, y]) => {
        const last = pts[pts.length - 1];
        if (!last || dist(last, [x, y]) > 2) pts.push([x, y]);
      });
      if (pts.length > 1) el('polyline', { points: pts.map(q => q.join(',')).join(' '), stroke: COLORS[p.team] }, pathsG);
    });

    const conesG = el('g', {}, svg);
    a.cones.forEach(([x, y]) => {
      el('polygon', { points: `${x},${y - 11} ${x - 9},${y + 7} ${x + 9},${y + 7}`, fill: '#F59E0B', stroke: '#B45309', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, conesG);
    });

    const live = el('g', {}, svg);
    const playerNodes = a.players.map(p => {
      const g = el('g', {}, live);
      el('circle', { r: 15, cx: 1.5, cy: 2.5, fill: 'rgba(30,42,74,.18)' }, g);
      el('circle', { r: 15, fill: COLORS[p.team], stroke: '#fff', 'stroke-width': 2.5 }, g);
      const label = p.n != null ? p.n : p.team === 'c' ? 'C' : '';
      if (label !== '') {
        const tx = el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#fff', 'font-size': 15, 'font-weight': 800 }, g);
        tx.textContent = label;
      }
      return g;
    });
    const ownBalls = a.players.map((p, i) => (p.b ? { i, node: makeBall(live) } : null)).filter(Boolean);
    const trackBalls = a.balls.map(k => ({ k, node: makeBall(live) }));

    const caption = document.createElement('p');
    caption.className = 'diagram-caption';
    caption.setAttribute('aria-hidden', 'true');
    host.appendChild(caption);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'diagram-play';
    stage.appendChild(btn);

    let elapsed = 0, last = null, raf = null;
    let playing = opts.autoplay !== false && !reducedMotion();
    let visible = true;
    let lastCaption = null;

    function draw(t, clock) {
      a.players.forEach((p, i) => {
        const [x, y] = eng.playerPos(i, t);
        playerNodes[i].setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      });
      const bounce = 0.78 + 0.4 * Math.abs(Math.sin(clock * Math.PI * 2.4));
      ownBalls.forEach(({ i, node }) => {
        const [x, y] = eng.hand(i, t);
        const s = eng.moving(i, t) ? bounce : 1;
        node.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})`);
      });
      trackBalls.forEach(({ k, node }) => {
        const st = eng.ballState(k, t);
        const s = st.dribble ? bounce : st.scale;
        node.setAttribute('transform', `translate(${st.pos[0].toFixed(1)} ${st.pos[1].toFixed(1)}) scale(${s.toFixed(2)})`);
      });
      if (fade) {
        const o = t > 0.94 ? (1 - t) / 0.06 : t < 0.04 ? t / 0.04 : 1;
        live.setAttribute('opacity', o.toFixed(2));
      }
      let text = '';
      a.cap.forEach(([t0, t1, s]) => { if (t >= t0 && t < t1) text = s; });
      if (text !== lastCaption) {
        caption.textContent = text || ' ';
        lastCaption = text;
      }
    }

    function frame(now) {
      raf = null;
      if (!playing || !visible) { last = null; return; }
      if (last != null) elapsed += Math.min(0.1, (now - last) / 1000);
      last = now;
      draw((elapsed / a.dur) % 1, elapsed);
      raf = requestAnimationFrame(frame);
    }

    function sync() {
      btn.textContent = playing ? '❚❚' : '▶';
      btn.setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation');
      host.classList.toggle('is-paused', !playing);
      if (playing && visible && raf == null) raf = requestAnimationFrame(frame);
    }

    const toggle = () => { playing = !playing; sync(); };
    stage.addEventListener('click', toggle);

    let observer = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        sync();
      });
      observer.observe(host);
    }

    // first frame: a moment where things are already happening if paused
    draw(playing ? 0 : 0.05, 0);
    sync();

    return {
      play() { playing = true; sync(); },
      pause() { playing = false; sync(); },
      toggle,
      seek(t) { playing = false; sync(); draw(t, t * a.dur); },
      destroy() {
        playing = false;
        if (raf) cancelAnimationFrame(raf);
        if (observer) observer.disconnect();
      },
    };
  }

  return { create, HOOP };
})();
