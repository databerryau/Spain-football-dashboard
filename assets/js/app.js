/* ¿De qué equipo eres? — dashboard logic (vanilla JS, no dependencies) */
(() => {
  'use strict';

  const CLUBS = window.CLUBS;
  const META = window.META;
  const CITIES = window.CITIES;
  const MAP = window.SPAIN_MAP;
  const byId = Object.fromEntries(CLUBS.map(c => [c.id, c]));
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     Tiny DOM helpers
     --------------------------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const NS = 'http://www.w3.org/2000/svg';
  function setAttrs(el, attrs) {
    if (!attrs) return;
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') {
        for (const [sk, sv] of Object.entries(v)) {
          if (sk.startsWith('--')) el.style.setProperty(sk, sv); else el.style[sk] = sv;
        }
      } else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  function add(el, kids) {
    for (const k of kids.flat(Infinity)) {
      if (k == null || k === false) continue;
      el.append(k instanceof Node ? k : document.createTextNode(String(k)));
    }
    return el;
  }
  const h = (tag, attrs, ...kids) => { const el = document.createElement(tag); setAttrs(el, attrs); return add(el, kids); };
  const s = (tag, attrs, ...kids) => { const el = document.createElementNS(NS, tag); setAttrs(el, attrs); return add(el, kids); };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sum = arr => arr.reduce((a, b) => a + b, 0);
  const eur = v => (v == null ? '—' : '€' + Math.round(v).toLocaleString('en-GB'));
  const fmtInt = v => (v == null ? '—' : Math.round(v).toLocaleString('en-GB'));
  const signed = v => (v == null ? '—' : v > 0 ? '+' + v : String(v));
  const orDash = v => (v == null ? '—' : String(v));
  const wdl = r => (r.w == null ? '—' : `${r.w}-${r.d}-${r.l}`);
  const priceTxt = (c, v) => (v == null ? '—' : (c.tickets.est ? '≈' : '') + eur(v));
  const ordinal = n => {
    const m = n % 100;
    if (m >= 11 && m <= 13) return n + 'th';
    return n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  };
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  function niceTicks(min, max, count = 5) {
    const span = max - min || 1;
    const mag = Math.pow(10, Math.floor(Math.log10(span / count)));
    // smallest "nice" step that keeps us at or under `count` intervals
    const step = [1, 2, 2.5, 5, 10, 20].map(m => m * mag).find(st => Math.ceil(span / st - 1e-9) <= count) || 20 * mag;
    const out = [];
    const end = Math.ceil(max / step - 1e-9) * step;
    for (let v = Math.floor(min / step + 1e-9) * step; v <= end + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
    return out;
  }

  /* ---------------------------------------------------------------
     Colour: flame heat ramp (semantic heat, dark -> bright)
     --------------------------------------------------------------- */
  const RAMP = ['#241019', '#3b0f2a', '#58123e', '#7a1553', '#9e176a', '#c41c80', '#e62b93', '#ff4f8b', '#ff7a5c', '#ffa33d', '#ffd24a'];
  const hexToRgb = hx => [1, 3, 5].map(i => parseInt(hx.slice(i, i + 2), 16));
  const rgbToHex = rgb => '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  function heat(t) {
    const x = clamp(t, 0, 1) * (RAMP.length - 1);
    const i = Math.min(Math.floor(x), RAMP.length - 2);
    const f = x - i;
    const a = hexToRgb(RAMP[i]), b = hexToRgb(RAMP[i + 1]);
    return rgbToHex(a.map((v, k) => v + (b[k] - v) * f));
  }
  function lum(hx) {
    const c = hexToRgb(hx).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  const inkOn = bg => (lum(bg) > 0.28 ? '#1a0010' : '#fff1f8');
  const rampCss = () => `linear-gradient(90deg, ${RAMP.join(', ')})`;
  const C1 = '#ff2d95', C2 = '#d47414', C3 = '#8b6cff';

  /* ---------------------------------------------------------------
     Derived metrics
     --------------------------------------------------------------- */
  const pyramidRank = h => (h.div === 'LaLiga' ? h.pos : h.div === 'Segunda' ? 20 + (h.pos || 11) : 42 + (h.pos || 5));
  const liga2526 = CLUBS.filter(c => c.s2526.div === 'LaLiga');
  const minLigaPPG = Math.min(...liga2526.map(c => c.s2526.pts / c.s2526.p));
  const hasNow = CLUBS.every(c => c.s2627 && c.s2627.p > 0);

  CLUBS.forEach(c => {
    c.promoted = c.s2526.div !== 'LaLiga';
    c.ppgLast = c.promoted ? minLigaPPG : c.s2526.pts / c.s2526.p;
    c.ppgNow = hasNow ? c.s2627.pts / c.s2627.p : null;
    c.histRank = sum(c.history.map(pyramidRank)) / c.history.length;
    c.gd = c.s2526.gf != null && c.s2526.ga != null ? c.s2526.gf - c.s2526.ga : null;
    const hn = c.honours;
    c.euroTotal = (hn.ucl || 0) + (hn.uel || 0) + (hn.other || 0);
    c.honTotal = (hn.liga || 0) + (hn.copa || 0) + c.euroTotal;
    c.priceMin = c.tickets.min ?? c.tickets.typical;
    // "cheap tickets" = blend of the cheapest single ticket and the per-game cost of a season ticket you can actually get
    const perGame = c.tickets.season != null && c.tickets.access !== 'closed' ? c.tickets.season / 19 : null;
    c.valuePrice = perGame != null ? (c.priceMin + perGame) / 2 : c.priceMin;
  });

  function minmax(vals, invert = false) {
    const lo = Math.min(...vals), hi = Math.max(...vals);
    return vals.map(v => {
      const t = hi === lo ? 1 : (v - lo) / (hi - lo);
      return 0.1 + 0.9 * (invert ? 1 - t : t);
    });
  }
  (function computePower() {
    const nLast = minmax(CLUBS.map(c => c.ppgLast));
    const nHist = minmax(CLUBS.map(c => c.histRank), true);
    const nNow = hasNow ? minmax(CLUBS.map(c => c.ppgNow)) : null;
    CLUBS.forEach((c, i) => {
      const v = hasNow ? 0.5 * nLast[i] + 0.3 * nNow[i] + 0.2 * nHist[i] : 0.65 * nLast[i] + 0.35 * nHist[i];
      c.power = Math.round(v * 100);
    });
  })();

  const maxHon = Math.max(...CLUBS.map(c => c.honTotal));
  const prices = CLUBS.map(c => c.valuePrice).filter(v => v != null);
  const lpMin = Math.log(Math.min(...prices)), lpMax = Math.log(Math.max(...prices));

  function distKm(a, b) {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  /* ---------------------------------------------------------------
     Factors, vibes and presets
     --------------------------------------------------------------- */
  const FACTORS = [
    { key: 'glory', short: 'Trophies', emo: '🏆', label: 'Winning & trophies', hint: 'Power index plus the trophy cabinet', hi: 'Wins things. Regularly.', lo: 'Trophies are a distant rumour', meh: 'Unlikely to win much' },
    { key: 'value', short: 'Cheap tickets', emo: '💸', label: 'Cheap tickets', hint: 'Single tickets and season tickets you can actually get', hi: "Tickets won't wreck your rent", lo: 'Tickets cost a kidney', meh: 'Tickets on the pricey side' },
    { key: 'atmosphere', short: 'Atmosphere', emo: '🔥', label: 'Wild atmosphere', hint: 'Noise, passion, goosebumps', hi: 'The stadium goes absolutely nuclear', lo: 'Atmosphere can be… polite', meh: 'The atmosphere is hit and miss' },
    { key: 'underdog', short: 'Underdog', emo: '🥹', label: 'Underdog romance', hint: 'Lovable-loser energy', hi: 'Maximum underdog romance', lo: 'Zero underdog energy', meh: 'Not much of an underdog' },
    { key: 'party', short: 'Party & tapas', emo: '🍻', label: 'Party & tapas', hint: 'Nightlife and food around the game', hi: 'Elite bars and tapas round the ground', lo: 'Quiet night after the game', meh: 'Matchday scene is fairly quiet' },
    { key: 'drama', short: 'Drama', emo: '🎭', label: 'Appetite for drama', hint: 'Chaos, scandal, meltdowns', hi: 'Chaos guaranteed, bring popcorn', lo: 'Boringly well run', meh: 'Not much drama' },
    { key: 'sunshine', short: 'Sun & beach', emo: '☀️', label: 'Sun & beach', hint: 'Weather and a beach nearby', hi: 'Sun, sea and football', lo: 'Pack an umbrella', meh: 'Grey skies are common' },
    { key: 'easy', short: 'Easy to get in', emo: '🎟️', label: 'Easy to get a seat', hint: 'Tickets and memberships for newcomers', hi: 'Easy to actually get a ticket', lo: 'Good luck getting a seat', meh: 'Tickets can be hard to get' },
    { key: 'cred', short: 'Hipster cred', emo: '😎', label: 'Hipster cred', hint: 'Points for not being a glory hunter', hi: 'Instant street cred', lo: "Everyone will call you a glory hunter", meh: 'Not the edgiest choice' },
    { key: 'local', short: 'Close to home', emo: '📍', label: 'Close to home', hint: 'Counts triple. Full marks within ~30 km, half at 80 km', hintOff: 'Pick a city above to switch this on', hi: 'On your doorstep', lo: 'Every home game is an away day', meh: 'A bit of a trek', needsCity: true },
  ];
  const FBY = Object.fromEntries(FACTORS.map(f => [f.key, f]));

  const VIBES = [
    { key: 'atmosphere', emo: '🔥', label: 'Atmosphere', desc: 'Noise, passion and goosebumps on matchday' },
    { key: 'party', emo: '🎉', label: 'Party', desc: 'Nightlife and pre-match bar culture' },
    { key: 'drama', emo: '🎭', label: 'Drama', desc: 'Boardroom chaos, meltdowns, VAR rage' },
    { key: 'underdog', emo: '🥹', label: 'Underdog', desc: 'Suffering, loyalty and lovable-loser energy' },
    { key: 'welcome', emo: '🤝', label: 'Welcome', desc: 'How easily a newcomer (guiri!) fits in' },
    { key: 'rivalry', emo: '⚔️', label: 'Rivalry', desc: 'How spicy the derbies get' },
    { key: 'sunshine', emo: '☀️', label: 'Sun', desc: 'Weather and beach access' },
    { key: 'food', emo: '🥘', label: 'Food', desc: 'Tapas, pintxos and post-match feasting' },
    { key: 'cred', emo: '😎', label: 'Cred', desc: 'Anti-glory-hunter points for choosing them' },
  ];

  const PRESETS = [
    { id: 'balanced', emo: '⚖️', label: 'Balanced', w: { glory: 2, value: 3, atmosphere: 3, underdog: 2, party: 3, drama: 1, sunshine: 2, easy: 3, cred: 2, local: 4 } },
    { id: 'glory', emo: '🏆', label: 'Glory hunter', w: { glory: 5, value: 0, atmosphere: 2, underdog: 0, party: 1, drama: 1, sunshine: 0, easy: 1, cred: 0, local: 2 } },
    { id: 'hipster', emo: '😎', label: 'Hipster', w: { glory: 0, value: 2, atmosphere: 3, underdog: 4, party: 2, drama: 1, sunshine: 0, easy: 1, cred: 5, local: 1 } },
    { id: 'budget', emo: '💸', label: 'Budget baller', w: { glory: 1, value: 5, atmosphere: 1, underdog: 1, party: 1, drama: 0, sunshine: 0, easy: 4, cred: 0, local: 3 } },
    { id: 'party', emo: '🎉', label: 'Party animal', w: { glory: 1, value: 2, atmosphere: 4, underdog: 0, party: 5, drama: 1, sunshine: 4, easy: 1, cred: 1, local: 2 } },
    { id: 'masochist', emo: '🥹', label: 'Masochist', w: { glory: 0, value: 1, atmosphere: 3, underdog: 5, party: 1, drama: 5, sunshine: 0, easy: 0, cred: 3, local: 0 } },
    { id: 'local', emo: '📍', label: 'Local hero', w: { glory: 1, value: 1, atmosphere: 2, underdog: 1, party: 1, drama: 0, sunshine: 0, easy: 2, cred: 1, local: 5 } },
  ];

  const state = {
    weights: { ...PRESETS[0].w },
    preset: 'balanced',
    city: null,
    results: [],
    matchById: {},
    perfMetric: 'power',
    perfSort: { key: 'pos', asc: true },
    heatSort: { key: null, asc: false },
    ticketSort: { key: 'min', asc: true },
    lastQuirk: -1,
  };

  // Distance: straight line from your city to the stadium. Full marks within ~30 km,
  // half marks at 80 km, close to zero beyond 300 km.
  const proximity = km => 1 / (1 + Math.pow(km / 80, 2));
  // "Close to home" counts triple, so a 5 on that slider outweighs any other single slider.
  const LOCAL_BOOST = 3;
  const factorWeight = key => {
    if (key === 'local') return state.city ? state.weights.local * LOCAL_BOOST : 0;
    return state.weights[key];
  };

  function features(c) {
    const f = {
      glory: 0.65 * (c.power / 100) + 0.35 * (Math.log1p(c.honTotal) / Math.log1p(maxHon)),
      value: c.valuePrice == null ? 0.5 : 1 - (Math.log(c.valuePrice) - lpMin) / (lpMax - lpMin || 1),
      atmosphere: c.vibe.atmosphere / 10,
      underdog: c.vibe.underdog / 10,
      party: (c.vibe.party * 0.6 + c.vibe.food * 0.4) / 10,
      drama: c.vibe.drama / 10,
      sunshine: c.vibe.sunshine / 10,
      easy: c.easy / 10,
      cred: c.vibe.cred / 10,
      local: 0,
      km: null,
    };
    if (state.city) {
      f.km = distKm(state.city, c);
      f.local = proximity(f.km);
    }
    return f;
  }

  function computeMatches() {
    state.results = CLUBS.map(c => {
      const f = features(c);
      let num = 0, den = 0;
      for (const F of FACTORS) {
        const wt = factorWeight(F.key);
        if (!wt) continue;
        num += wt * f[F.key];
        den += wt;
      }
      const raw = den ? num / den : 0.5;
      return { club: c, f, raw, match: Math.round(raw * 100) };
    }).sort((a, b) => b.raw - a.raw || b.club.power - a.club.power);
    state.matchById = {};
    state.results.forEach((r, i) => { state.matchById[r.club.id] = { ...r, rank: i + 1 }; });
  }

  /* ---------------------------------------------------------------
     Tooltip
     --------------------------------------------------------------- */
  const tipEl = $('#tooltip');
  let tipAnchor = null;
  function placeTip(ev) {
    let x, y;
    if (ev && ev.clientX != null && ev.type !== 'focus') { x = ev.clientX; y = ev.clientY; }
    else if (tipAnchor) { const r = tipAnchor.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    else return;
    const tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
    let left = x + 16, top = y + 16;
    if (left + tw > window.innerWidth - 8) left = x - tw - 16;
    if (top + th > window.innerHeight - 8) top = y - th - 16;
    tipEl.style.left = Math.max(8, left) + 'px';
    tipEl.style.top = Math.max(8, top) + 'px';
  }
  function showTip(ev, build) {
    tipAnchor = ev.currentTarget || ev.target;
    tipEl.replaceChildren(...build());
    tipEl.hidden = false;
    placeTip(ev);
  }
  function hideTip() { tipEl.hidden = true; tipAnchor = null; }
  function bindTip(el, build) {
    el.addEventListener('pointerenter', e => showTip(e, build));
    el.addEventListener('pointermove', placeTip);
    el.addEventListener('pointerleave', hideTip);
    el.addEventListener('focus', e => showTip(e, build));
    el.addEventListener('blur', hideTip);
  }
  const ttTitle = t => h('p', { class: 'tt-title', text: t });
  const ttRow = (color, label, value) => h('div', { class: 'tt-row' },
    color ? h('i', { class: 'tt-key', style: { background: color } }) : h('i'),
    h('span', { class: 'tt-lbl', text: label }),
    h('span', { class: 'tt-val', text: value }));
  const ttNote = t => h('p', { class: 'tt-note', text: t });
  window.addEventListener('scroll', hideTip, { passive: true });

  /* ---------------------------------------------------------------
     Shared bits
     --------------------------------------------------------------- */
  function badge(c, size = '') {
    return h('span', {
      class: 'badge ' + size,
      'data-code': c.code,
      'aria-hidden': 'true',
      style: { '--a': c.colors[0], '--b': c.colors[1] },
    });
  }
  function stat(label, value, note, small) {
    return h('div', { class: 'stat' },
      h('p', { class: 'stat-label', text: label }),
      h('p', { class: 'stat-value' }, value, small ? h('small', { text: ' ' + small }) : null),
      note ? h('p', { class: 'stat-note', text: note }) : null);
  }
  function rowActivate(el, fn) {
    el.addEventListener('click', fn);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
  }
  const nowText = c => (c.s2627 ? `${ordinal(c.s2627.pos)} · ${c.s2627.pts} pts` : '—');
  const lastText = c => (c.promoted ? `${ordinal(c.s2526.pos)} in Segunda` : `${ordinal(c.s2526.pos)} in LaLiga`);
  const lastPts = c => (c.s2526.pts == null ? lastText(c) : `${lastText(c)}, ${c.s2526.pts} pts`);

  /* ---------------------------------------------------------------
     Hero stats
     --------------------------------------------------------------- */
  function renderHeroStats() {
    const cheapest = [...CLUBS].filter(c => c.priceMin != null && !c.tickets.est).sort((a, b) => a.priceMin - b.priceMin)[0];
    const loudest = [...CLUBS].sort((a, b) => b.vibe.atmosphere - a.vibe.atmosphere || (b.attendance || 0) - (a.attendance || 0))[0];
    const champ = CLUBS.find(c => c.s2526.div === 'LaLiga' && c.s2526.pos === 1);
    $('#heroStats').replaceChildren(
      stat('Clubs to choose from', '20', 'One decision. No pressure.'),
      stat('2025-26 champions', champ.short, `${champ.s2526.pts} points`),
      stat('Cheapest seat in the league', priceTxt(cheapest, cheapest.priceMin), cheapest.name),
      stat('Loudest ground (allegedly)', loudest.short, loudest.stadium),
    );
  }

  /* ---------------------------------------------------------------
     Matchmaker: controls
     --------------------------------------------------------------- */
  function renderCitySelect() {
    const sel = $('#citySelect');
    sel.replaceChildren(h('option', { value: '', text: 'Not sure yet / anywhere' }),
      ...[...CITIES].sort((a, b) => a.name.localeCompare(b.name)).map(ci => h('option', { value: ci.name, text: ci.name })));
    sel.addEventListener('change', () => {
      state.city = CITIES.find(ci => ci.name === sel.value) || null;
      renderSliders();
      update();
    });
  }

  function renderPresets() {
    const box = $('#presets');
    box.replaceChildren(...PRESETS.map(p => {
      const b = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(state.preset === p.id) }, p.emo + ' ' + p.label);
      b.addEventListener('click', () => {
        state.weights = { ...p.w };
        state.preset = p.id;
        renderPresets();
        renderSliders();
        update();
      });
      return b;
    }));
  }

  function renderSliders() {
    const box = $('#sliders');
    box.replaceChildren(...FACTORS.map(F => {
      const disabled = F.needsCity && !state.city;
      const id = 'w-' + F.key;
      const val = state.weights[F.key];
      const out = h('output', { for: id, text: disabled ? '–' : String(val) });
      const input = h('input', {
        type: 'range', id, min: 0, max: 5, step: 1, value: val, disabled,
        'aria-describedby': id + '-hint',
        style: { '--fill': (val / 5 * 100) + '%' },
      });
      input.addEventListener('input', () => {
        state.weights[F.key] = +input.value;
        input.style.setProperty('--fill', (input.value / 5 * 100) + '%');
        out.textContent = input.value;
        if (state.preset) { state.preset = null; renderPresets(); }
        update();
      });
      return h('div', { class: 'slider' + (disabled ? ' disabled' : '') },
        h('label', { for: id }, h('span', { class: 'emo', 'aria-hidden': 'true', text: F.emo }), F.label),
        out, input,
        h('span', { class: 'hint', id: id + '-hint', text: disabled && F.hintOff ? F.hintOff : F.hint }));
    }));
  }

  /* ---------------------------------------------------------------
     Matchmaker: results
     --------------------------------------------------------------- */
  const activeFactors = r => FACTORS.filter(F => factorWeight(F.key) > 0).map(F => ({ F, s: r.f[F.key], wt: factorWeight(F.key) }));
  const factorText = (r, i, hi) => {
    if (i.F.key === 'local' && r.f.km != null) {
      const km = Math.round(r.f.km);
      return hi ? (km < 15 ? 'Literally in your city' : `Just ${km} km away`) : `${km} km away: every home game is a road trip`;
    }
    if (hi) return i.F.hi;
    return i.s < 0.25 ? i.F.lo : i.F.meh;
  };

  function reasons(r) {
    return activeFactors(r).filter(i => i.s >= 0.6).sort((a, b) => b.wt * b.s - a.wt * a.s).slice(0, 3)
      .map(i => ({ emo: i.F.emo, text: factorText(r, i, true) }));
  }

  // Club-level red flags that are true whatever you care about (factual, from the data).
  function clubFlags(c) {
    const out = [];
    const t = c.tickets;
    if (t.access === 'closed') out.push({ key: 'easy', emo: '🎟️', text: 'No season tickets for newcomers this season' });
    else if (t.access === 'limited') out.push({ key: 'easy', emo: '🎟️', text: 'Season tickets only via a waiting list or small quota' });
    if (c.promoted) out.push({ key: 'glory', emo: '⬆️', text: 'Newly promoted: a relegation fight is likely' });
    else if (META.dropLine != null && c.s2526.pts - META.dropLine <= 3) {
      const gap = c.s2526.pts - META.dropLine;
      out.push({ key: 'glory', emo: '😬', text: gap <= 0 ? 'Stayed up in 2025-26 only on a tiebreak' : `Finished just ${gap} pt${gap > 1 ? 's' : ''} above the drop in 2025-26` });
    }
    if (c.priceMin >= 60 || (t.big != null && t.big >= 200)) {
      out.push({ key: 'value', emo: '💸', text: `Seats from ${eur(c.priceMin)}` + (t.big >= 200 ? `, big games from ${eur(t.big)}` : '') });
    }
    if (c.vibe.drama >= 9) out.push({ key: 'drama', emo: '🎭', text: 'Serious off-pitch chaos' });
    if (c.vibe.atmosphere <= 4) out.push({ key: 'atmosphere', emo: '😴', text: 'The atmosphere can be flat' });
    if (c.vibe.sunshine <= 3) out.push({ key: 'sunshine', emo: '🌧️', text: 'Pack a raincoat: one of the wettest cities in Spain' });
    if (c.vibe.cred <= 2) out.push({ key: 'cred', emo: '🙄', text: 'Expect endless glory-hunter jokes' });
    (c.extraFlags || []).forEach(text => out.push({ key: 'other', emo: '🏗️', text }));
    return out;
  }
  CLUBS.forEach(c => { c.flags = clubFlags(c); });

  // Red flags for YOU: your weighted priorities where this club scores badly, then the club-level flags.
  function redFlags(r) {
    const personal = activeFactors(r).filter(i => i.s < 0.45)
      .sort((a, b) => b.wt * (1 - b.s) - a.wt * (1 - a.s)).slice(0, 2)
      .map(i => {
        // prefer the club's concrete fact (e.g. "no season tickets") over the generic line
        const fact = r.club.flags.find(fl => fl.key === i.F.key);
        return fact ? { ...fact, personal: true } : { key: i.F.key, emo: i.F.emo, text: factorText(r, i, false), personal: true };
      });
    const seen = new Set(personal.map(p => p.key));
    // if you asked for drama, chaos isn't a red flag
    const general = r.club.flags.filter(fl => !seen.has(fl.key) && !(fl.key === 'drama' && state.weights.drama >= 3));
    return [...personal, ...general];
  }
  const lowerFirst = t => t.charAt(0).toLowerCase() + t.slice(1);
  const flagLi = x => h('li', null, h('span', { 'aria-hidden': 'true', text: x.emo }), h('span', { text: x.text }));

  function flagChip(r) {
    const fl = redFlags(r);
    const chip = h('span', { class: 'flag-chip' + (fl.length ? '' : ' none'), 'aria-label': fl.length ? `${fl.length} red flags: ` + fl.map(x => x.text).join('; ') : 'No red flags' }, fl.length ? '🚩 ' + fl.length : '✨');
    bindTip(chip, () => [ttTitle(`${r.club.short}: red flags`), ...(fl.length ? fl.map(x => ttNote(`${x.emo} ${x.text}`)) : [ttNote('Nothing to worry about. Suspicious.')])]);
    return chip;
  }

  // Transparent scoring: every active factor, its weight and this club's score.
  function howItWorks(r) {
    const items = activeFactors(r);
    const total = sum(items.map(i => i.wt)) || 1;
    return h('details', { class: 'how' },
      h('summary', null, 'How is this match % calculated?'),
      h('p', null, 'Every club gets a 0–100 score on each factor. Your sliders are the weights, and the match % is the weighted average. ',
        h('b', { text: 'Close to home' }), ' uses the straight-line distance from your city to the stadium: full marks within about 30 km, half at 80 km, close to zero past 300 km. It counts triple.'),
      h('div', { class: 'breakdown', role: 'table', 'aria-label': `Score breakdown for ${r.club.name}` },
        ...items.sort((a, b) => b.wt - a.wt).map(i => h('div', { class: 'bd-row', role: 'row' },
          h('span', { class: 'bd-lbl', role: 'cell', title: i.F.label }, `${i.F.emo} ${i.F.short}`),
          h('span', { class: 'bd-wt', role: 'cell', title: 'Share of the total weight', text: Math.round(i.wt / total * 100) + '%' }),
          h('span', { class: 'bd-bar', role: 'cell' }, h('i', { style: { width: Math.round(i.s * 100) + '%', background: heat(0.25 + 0.75 * i.s) } })),
          h('span', { class: 'bd-val', role: 'cell', text: Math.round(i.s * 100) + (i.F.key === 'local' && r.f.km != null ? ` · ${Math.round(r.f.km)} km` : '') })))),
      h('p', { class: 'muted bd-note', text: 'Middle column: how much of your total weighting that factor carries. Bar: how well this club scores on it.' }));
  }

  function renderTopMatch() {
    const r = state.results[0];
    const c = r.club;
    const good = reasons(r);
    const flags = redFlags(r).slice(0, 3);
    const li = flagLi;
    $('#topMatch').replaceChildren(
      h('div', { class: 'top-match' },
        h('p', { class: 'eyebrow top-label', text: state.city ? `Your perfect match in or near ${state.city.name}…` : 'Your perfect match' }),
        badge(c, 'lg'),
        h('div', null,
          h('h3', { class: 'top-name', text: c.name }),
          h('p', { class: 'top-meta', text: `${c.city} · “${c.nickname}” · ` + (r.f.km != null ? `${Math.round(r.f.km)} km from ${state.city.name}` : c.stadium) }))),
      h('div', { class: 'match-hero' },
        h('span', { class: 'match-num' }, String(r.match), h('small', { text: '%' })),
        h('span', { class: 'match-cap', text: 'fit with your priorities' })),
      h('div', { class: 'meter', role: 'img', 'aria-label': `Match ${r.match} percent` }, h('i', { style: { width: r.match + '%' } })),
      h('div', { class: 'why' },
        h('div', null, h('h4', { text: 'Why it works' }),
          h('ul', null, good.length ? good.map(li) : h('li', { text: "Honestly? It's a compromise." }))),
        h('div', { class: 'flags' }, h('h4', { text: '🚩 Red flags' }),
          h('ul', null, flags.length ? flags.map(li) : li({ emo: '🚩', text: 'Avoid if ' + lowerFirst(c.avoidIf) })))),
      howItWorks(r),
      h('p', { class: 'shout' }, 'Phrase to shout: ', h('b', { text: c.phrase })),
      h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => openClub(c.id) }, 'Open the full club file →'),
    );

    $('#runnersUp').replaceChildren(...state.results.slice(1, 7).map((x, i) => {
      const b = h('button', { type: 'button', class: 'runner', 'aria-label': `${x.club.name}, ${x.match} percent match. Open club file.` },
        h('span', { class: 'rank', text: '#' + (i + 2) }),
        badge(x.club),
        h('span', { class: 'rname' }, x.club.name, h('small', { text: x.club.city + (x.f.km != null ? ` · ${Math.round(x.f.km)} km` : '') })),
        flagChip(x),
        h('span', { class: 'rbar' }, h('i', { style: { width: x.match + '%' } })),
        h('span', { class: 'rpct', text: x.match + '%' }));
      b.addEventListener('click', () => openClub(x.club.id));
      return h('li', null, b);
    }));
  }

  /* ---------------------------------------------------------------
     Map
     --------------------------------------------------------------- */
  const project = (lat, lng) => [(lng - MAP.LON0) * MAP.COS * MAP.K, (MAP.LAT0 - lat) * MAP.K];

  function renderMap() {
    const box = $('#map');
    const W = box.clientWidth || 400;
    const k = W / MAP.W;
    const H = MAP.H * k;
    const R = W < 380 ? 6 : 7;
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'group', 'aria-label': 'Map of Spain with all 20 clubs', style: { overflow: 'hidden' } });
    const land = s('g', { transform: `scale(${k})` });
    for (const code of ['PRT', 'FRA', 'MAR', 'AND']) if (MAP.paths[code]) land.append(s('path', { d: MAP.paths[code], class: 'land-other' }));
    land.append(s('path', { d: MAP.paths.ESP, class: 'land-esp', 'stroke-width': 1 / k }));
    svg.append(land);

    if (state.city) {
      const [cx, cy] = project(state.city.lat, state.city.lng).map(v => v * k);
      const r100 = (100 / 111.2) * MAP.K * k;
      svg.append(s('circle', { cx, cy, r: r100, class: 'city-ring' }));
    }

    const matches = state.results.map(r => r.raw);
    const lo = Math.min(...matches), hi = Math.max(...matches);
    const pts = CLUBS.map(c => {
      const [x, y] = project(c.lat, c.lng).map(v => v * k);
      return { c, x0: x, y0: y, x, y };
    });
    // push overlapping dots apart (Madrid, Barcelona, Valencia and Seville have neighbours)
    const minD = R * 2 + 3;
    for (let it = 0; it < 80; it++) {
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        if (d < minD) {
          if (d < 0.01) { const ang = (i * 2.4 + j) % (Math.PI * 2); dx = Math.cos(ang); dy = Math.sin(ang); d = 1; }
          const push = (minD - d) / 2;
          a.x -= dx / d * push; a.y -= dy / d * push;
          b.x += dx / d * push; b.y += dy / d * push;
        }
      }
    }
    const top3 = new Set(state.results.slice(0, 3).map(r => r.club.id));
    const gl = s('g'), gd = s('g'), gt = s('g');
    const boxes = [];
    const overlaps = (a, b) => !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
    if (state.city) {
      const [cx, cy] = project(state.city.lat, state.city.lng).map(v => v * k);
      const cw = state.city.name.length * 7.6;
      boxes.push({ x: cx - cw / 2, y: cy - 36, w: cw, h: 36 });
    }
    pts.forEach(p => {
      const m = state.matchById[p.c.id];
      if (Math.hypot(p.x - p.x0, p.y - p.y0) > 2) gl.append(s('line', { x1: p.x0, y1: p.y0, x2: p.x, y2: p.y, class: 'leader' }));
      const t = hi === lo ? 1 : (m.raw - lo) / (hi - lo);
      const g = s('g', { tabindex: 0, role: 'button', 'aria-label': `${p.c.name}, ${m.match} percent match` });
      g.append(
        s('circle', { cx: p.x, cy: p.y, r: 13, class: 'dot-hit' }),
        s('circle', { cx: p.x, cy: p.y, r: top3.has(p.c.id) ? R + 1.5 : R, class: 'dot' + (m.rank === 1 ? ' is-top' : ''), fill: heat(0.25 + 0.75 * t) }));
      bindTip(g, () => [ttTitle(p.c.name),
        ttRow(null, 'Match', m.match + '%'),
        ttRow(null, 'Rank', '#' + m.rank + ' of 20'),
        m.f.km != null ? ttRow(null, 'Distance', Math.round(m.f.km) + ' km') : null,
        ttNote(`${p.c.city} · ${p.c.stadium}`)].filter(Boolean));
      rowActivate(g, () => openClub(p.c.id));
      gd.append(g);
    });
    // label the top three, trying right / left / below / above until nothing collides
    state.results.slice(0, 3).map(r => pts.find(p => p.c.id === r.club.id)).forEach(p => {
      const m = state.matchById[p.c.id];
      const label = `${m.rank}. ${p.c.short}`;
      const lw = label.length * 6.6, lh = 13;
      const cands = [
        [p.x + R + 5, p.y + 4, 'start', { x: p.x + R + 5, y: p.y - 8, w: lw, h: lh }],
        [p.x - R - 5, p.y + 4, 'end', { x: p.x - R - 5 - lw, y: p.y - 8, w: lw, h: lh }],
        [p.x, p.y + R + 14, 'middle', { x: p.x - lw / 2, y: p.y + R + 3, w: lw, h: lh }],
        [p.x, p.y - R - 6, 'middle', { x: p.x - lw / 2, y: p.y - R - 17, w: lw, h: lh }],
      ];
      const dotBoxes = pts.filter(o => o !== p).map(o => ({ x: o.x - R, y: o.y - R, w: 2 * R, h: 2 * R }));
      const fits = b => b.x >= 2 && b.x + b.w <= W - 2 && b.y >= 2 && b.y + b.h <= H - 2;
      const best = cands.find(([, , , b]) => fits(b) && !boxes.some(o => overlaps(o, b)) && !dotBoxes.some(o => overlaps(o, b)))
        || cands.find(([, , , b]) => fits(b) && !boxes.some(o => overlaps(o, b)))
        || cands[0];
      boxes.push(best[3]);
      gt.append(s('text', { x: best[0], y: best[1], 'text-anchor': best[2], class: 'dot-label', text: label }));
    });
    svg.append(gl, gd, gt);
    if (state.city) {
      const [cx, cy] = project(state.city.lat, state.city.lng).map(v => v * k);
      svg.append(s('path', { d: `M${cx} ${cy - 1}l-6 -12a7 7 0 1 1 12 0z`, class: 'city-pin' }),
        s('text', { x: cx, y: cy - 22, 'text-anchor': 'middle', class: 'city-label', text: state.city.name }));
    }
    box.replaceChildren(svg);
    $('#mapLegend').replaceChildren(h('span', { text: 'Worse fit' }), h('span', { class: 'ramp', style: { background: `linear-gradient(90deg, ${heat(0.25)}, ${heat(0.5)}, ${heat(0.75)}, ${heat(1)})` } }), h('span', { text: 'Better fit' }));
  }

  /* ---------------------------------------------------------------
     Performance
     --------------------------------------------------------------- */
  function renderPerfKpis() {
    const liga = CLUBS.filter(c => !c.promoted);
    const champ = liga.find(c => c.s2526.pos === 1);
    const attack = [...liga].sort((a, b) => b.s2526.gf - a.s2526.gf)[0];
    const defence = [...liga].sort((a, b) => a.s2526.ga - b.s2526.ga)[0];
    const leader = hasNow ? [...CLUBS].sort((a, b) => a.s2627.pos - b.s2627.pos)[0] : null;
    $('#perfKpis').replaceChildren(
      stat('2025-26 champions', champ.short, `${champ.s2526.pts} pts · ${champ.s2526.w}W ${champ.s2526.d}D ${champ.s2526.l}L`),
      stat('Most goals, 2025-26', String(attack.s2526.gf), attack.name),
      stat('Meanest defence, 2025-26', String(defence.s2526.ga), `${defence.name}, goals conceded`),
      leader ? stat(`Top of the table now (matchday ${META.matchday})`, leader.short, `${leader.s2627.pts} pts from ${leader.s2627.p} games`)
        : META.early ? stat('2026-27 early leaders', byId[META.early.club].short, META.early.note, META.early.value)
        : stat('Most league titles', 'Real Madrid', 'and it isn\'t close'),
    );
  }

  const PERF_METRICS = [
    { id: 'power', label: 'Power index', sub: hasNow ? 'Blend of last season (50%), this season so far (30%) and five-year league history (20%). Promoted clubs get 17th-place form for last season.' : 'Blend of last season’s points per game (65%) and five-year league history (35%), scaled 0–100. Promoted clubs are credited with 17th-place form for last season.', get: c => c.power, fmt: v => String(v) },
    { id: 'pts', label: '2025-26 points', sub: 'Final points total. Faded bars were promoted from Segunda (42 games in the second tier). Deportivo finished 2nd there; their full record is missing.', get: c => c.s2526.pts, fmt: v => String(v) },
    { id: 'now', label: '2026-27 so far', sub: '', get: c => (c.s2627 ? c.s2627.pts : 0), fmt: v => String(v) },
    { id: 'gd', label: 'Goal difference', sub: 'Goal difference in 2025-26 for the 17 clubs that were in LaLiga (records for the promoted clubs are incomplete).', get: c => (c.promoted ? null : c.gd), fmt: signed },
  ];

  function renderPerfMetricTabs() {
    const box = $('#perfMetric');
    const metrics = PERF_METRICS.filter(m => m.id !== 'now' || hasNow);
    box.replaceChildren(...metrics.map(m => {
      const b = h('button', { type: 'button', role: 'tab', 'aria-selected': String(state.perfMetric === m.id), text: m.id === 'power' ? 'Power' : m.id === 'pts' ? '25-26 pts' : m.id === 'now' ? '26-27 pts' : 'Goal diff' });
      b.addEventListener('click', () => { state.perfMetric = m.id; renderPerfMetricTabs(); renderPerfChart(); });
      return b;
    }));
  }

  function barPath(x0, x1, y, t, r = 4) {
    const len = Math.abs(x1 - x0);
    r = Math.min(r, len, t / 2);
    if (len < 0.5) return '';
    if (x1 >= x0) return `M${x0} ${y}H${x1 - r}Q${x1} ${y} ${x1} ${y + r}V${y + t - r}Q${x1} ${y + t} ${x1 - r} ${y + t}H${x0}Z`;
    return `M${x0} ${y}H${x1 + r}Q${x1} ${y} ${x1} ${y + r}V${y + t - r}Q${x1} ${y + t} ${x1 + r} ${y + t}H${x0}Z`;
  }

  let gradSeq = 0;
  function flameGradient(defs, x0, x1, negative = false) {
    const id = 'fg' + (++gradSeq);
    const g = s('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: x0, x2: x1, y1: 0, y2: 0 });
    const stops = negative ? [['0%', '#6d4ad8'], ['100%', C3]] : [['0%', '#b3126b'], ['55%', C1], ['85%', '#ff6a5c'], ['100%', '#ffa33d']];
    stops.forEach(([o, c]) => g.append(s('stop', { offset: o, 'stop-color': c })));
    defs.append(g);
    return `url(#${id})`;
  }

  function renderPerfChart() {
    const m = PERF_METRICS.find(x => x.id === state.perfMetric);
    $('#perfChartTitle').textContent = m.label;
    $('#perfChartSub').textContent = m.id === 'now' ? `Points after matchday ${META.matchday} of 38.` : m.sub;
    const rows = [...CLUBS].map(c => ({ c, v: m.get(c) })).filter(r => r.v != null).sort((a, b) => b.v - a.v || a.c.name.localeCompare(b.c.name));
    const box = $('#perfChart');
    const W = box.clientWidth || 600;
    const labelW = Math.min(150, Math.max(100, W * 0.3));
    const rowH = 26, bt = 14, top = 6, axisH = 26, padR = 44;
    const H = top + rows.length * rowH + axisH;
    const vals = rows.map(r => r.v);
    const vmin = Math.min(0, ...vals), vmax = Math.max(...vals);
    const ticks = niceTicks(vmin, vmax, Math.max(2, Math.floor((W - labelW - padR) / 70)));
    const dmin = Math.min(vmin, ticks[0]), dmax = Math.max(vmax, ticks[ticks.length - 1]);
    const x = v => labelW + (v - dmin) / (dmax - dmin || 1) * (W - labelW - padR);
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'group', 'aria-label': m.label + ' by club' });
    const defs = s('defs');
    svg.append(defs);
    const posFill = flameGradient(defs, x(0), x(dmax));
    const negFill = flameGradient(defs, x(0), x(dmin), true);
    const grid = s('g', { class: 'grid' });
    ticks.forEach(t => {
      grid.append(s('line', { x1: x(t), x2: x(t), y1: top, y2: top + rows.length * rowH }));
      grid.append(s('text', { x: x(t), y: H - 8, 'text-anchor': 'middle', class: 'tick', fill: 'currentColor', text: m.id === 'gd' ? signed(t) : t }));
    });
    svg.append(grid);
    const gRows = s('g');
    rows.forEach((r, i) => {
      const y = top + i * rowH;
      const dim = (m.id === 'pts' || m.id === 'gd') && r.c.promoted;
      const g = s('g', { class: 'row', tabindex: 0, role: 'button', 'aria-label': `${r.c.name}: ${m.fmt(r.v)}` });
      g.append(s('rect', { x: 0, y, width: W, height: rowH, class: 'row-hover', rx: 6 }));
      g.append(s('text', { x: labelW - 10, y: y + rowH / 2 + 4, 'text-anchor': 'end', class: 'cat-label' + (dim ? ' dim' : ''), text: r.c.short }));
      const d = barPath(x(0), x(r.v), y + (rowH - bt) / 2, bt);
      if (d) g.append(s('path', { d, fill: r.v < 0 ? negFill : posFill, opacity: dim ? 0.4 : 1 }));
      const lx = r.v < 0 ? x(r.v) - 6 : x(r.v) + 6;
      g.append(s('text', { x: lx, y: y + rowH / 2 + 4, 'text-anchor': r.v < 0 ? 'end' : 'start', class: 'bar-label', text: m.fmt(r.v) + (dim ? ' (Seg.)' : '') }));
      bindTip(g, () => [ttTitle(r.c.name),
        ttRow(C1, 'Power index', String(r.c.power)),
        ttRow(null, '2025-26', lastPts(r.c)),
        ttRow(null, 'W-D-L', wdl(r.c.s2526)),
        ttRow(null, 'Goals', `${orDash(r.c.s2526.gf)}:${orDash(r.c.s2526.ga)}`),
        hasNow ? ttRow(null, '2026-27 now', nowText(r.c)) : null].filter(Boolean));
      rowActivate(g, () => openClub(r.c.id));
      gRows.append(g);
    });
    svg.append(gRows);
    if (vmin < 0) svg.append(s('line', { x1: x(0), x2: x(0), y1: top, y2: top + rows.length * rowH, stroke: 'var(--line-strong)' }));
    box.replaceChildren(svg);
  }

  function renderTrophies() {
    const series = [
      { key: 'liga', label: 'LaLiga titles', color: C1, get: c => c.honours.liga || 0 },
      { key: 'copa', label: 'Copa del Rey', color: C2, get: c => c.honours.copa || 0 },
      { key: 'euro', label: 'European trophies', color: C3, get: c => c.euroTotal },
    ];
    $('#trophyLegend').replaceChildren(...series.map(se => h('span', null, h('i', { class: 'key', style: { background: se.color } }), se.label)));
    const rows = [...CLUBS].sort((a, b) => b.honTotal - a.honTotal || b.honours.liga - a.honours.liga || a.name.localeCompare(b.name));
    const box = $('#trophyChart');
    const W = box.clientWidth || 600;
    const labelW = Math.min(150, Math.max(100, W * 0.3));
    const rowH = 26, bt = 14, top = 6, axisH = 26, padR = 40;
    const H = top + rows.length * rowH + axisH;
    const max = Math.max(...rows.map(c => c.honTotal));
    const ticks = niceTicks(0, max, Math.max(2, Math.floor((W - labelW - padR) / 70)));
    const dmax = Math.max(max, ticks[ticks.length - 1]);
    const x = v => labelW + v / dmax * (W - labelW - padR);
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'group', 'aria-label': 'Major trophies by club' });
    const grid = s('g', { class: 'grid' });
    ticks.forEach(t => {
      grid.append(s('line', { x1: x(t), x2: x(t), y1: top, y2: top + rows.length * rowH }));
      grid.append(s('text', { x: x(t), y: H - 8, 'text-anchor': 'middle', class: 'tick', fill: 'currentColor', text: t }));
    });
    svg.append(grid);
    rows.forEach((c, i) => {
      const y = top + i * rowH;
      const g = s('g', { class: 'row', tabindex: 0, role: 'button', 'aria-label': `${c.name}: ${c.honours.liga} league titles, ${c.honours.copa} Copas, ${c.euroTotal} European trophies` });
      g.append(s('rect', { x: 0, y, width: W, height: rowH, class: 'row-hover', rx: 6 }));
      g.append(s('text', { x: labelW - 10, y: y + rowH / 2 + 4, 'text-anchor': 'end', class: 'cat-label' + (c.honTotal ? '' : ' dim'), text: c.short }));
      let acc = 0;
      const segs = series.map(se => ({ se, v: se.get(c) })).filter(v => v.v > 0);
      segs.forEach((sg, si) => {
        const gap = si > 0 ? 2 : 0;
        const x0 = x(acc) + gap, x1 = x(acc + sg.v);
        const last = si === segs.length - 1;
        const yy = y + (rowH - bt) / 2;
        if (x1 - x0 > 0.5) {
          g.append(s('path', { d: last ? barPath(x0, x1, yy, bt) : `M${x0} ${yy}H${x1}V${yy + bt}H${x0}Z`, fill: sg.se.color }));
        }
        acc += sg.v;
      });
      g.append(s('text', { x: x(c.honTotal) + 6, y: y + rowH / 2 + 4, class: 'bar-label', text: c.honTotal }));
      bindTip(g, () => [ttTitle(c.name), ...series.map(se => ttRow(se.color, se.label, String(se.get(c)))),
        c.honTotal === 0 ? ttNote('The cabinet is empty. The heart is full.') : null].filter(Boolean));
      rowActivate(g, () => openClub(c.id));
      svg.append(g);
    });
    box.replaceChildren(svg);
  }

  function sparkline(c) {
    const w = 92, hgt = 30, pad = 4;
    const ranks = c.history.map(pyramidRank);
    const maxR = 44;
    const y = r => pad + (Math.min(r, maxR) - 1) / (maxR - 1) * (hgt - pad * 2);
    const x = i => pad + i * (w - pad * 2) / (ranks.length - 1);
    const svg = s('svg', { width: w, height: hgt, viewBox: `0 0 ${w} ${hgt}`, 'aria-hidden': 'true' });
    svg.append(s('line', { x1: 0, x2: w, y1: y(20.5), y2: y(20.5), stroke: C1, 'stroke-opacity': 0.55, 'stroke-width': 1 }));
    svg.append(s('polyline', { points: ranks.map((r, i) => `${x(i)},${y(r)}`).join(' '), fill: 'none', stroke: '#ffd0e6', 'stroke-width': 1.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    ranks.forEach((r, i) => svg.append(s('circle', { cx: x(i), cy: y(r), r: i === ranks.length - 1 ? 3.5 : 2.2, fill: r > 20 ? '#ffa33d' : C1, stroke: 'var(--surface)', 'stroke-width': 1 })));
    return svg;
  }
  const histText = c => c.history.map(hh => `${hh.season}: ${hh.pos ? ordinal(hh.pos) : 'played'}${hh.div === 'LaLiga' ? '' : ' (' + hh.div + (hh.div === 'Primera RFEF' ? ', 3rd tier' : '') + ')'}`).join(', ');

  function sortableTable(table, cols, rows, sortState, onSort) {
    const thead = h('thead', null, h('tr', null, ...cols.map(col => {
      const th = h('th', { class: (col.num ? 'num ' : '') + (col.cls ? col.cls + ' ' : '') + (sortState.key === col.key ? 'sorted' + (sortState.asc ? ' asc' : '') : ''), scope: 'col', 'data-sort': col.sortable === false ? null : col.key, tabindex: col.sortable === false ? null : 0, 'aria-sort': sortState.key === col.key ? (sortState.asc ? 'ascending' : 'descending') : null, text: col.label });
      if (col.sortable !== false) {
        const act = () => {
          if (sortState.key === col.key) sortState.asc = !sortState.asc;
          else { sortState.key = col.key; sortState.asc = col.defaultAsc ?? !col.num; }
          onSort();
        };
        rowActivate(th, act);
      }
      return th;
    })));
    const col = cols.find(cc => cc.key === sortState.key);
    const sorted = col && col.sortVal ? [...rows].sort((a, b) => {
      const va = col.sortVal(a), vb = col.sortVal(b);
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
      return sortState.asc ? cmp : -cmp;
    }) : rows;
    const tbody = h('tbody', null, ...sorted.map(c => {
      const tr = h('tr', { tabindex: 0, 'aria-label': `Open ${c.name} club file` }, ...cols.map(cc => {
        const v = cc.cell(c);
        return h('td', { class: [cc.num ? 'num' : '', cc.cls || ''].join(' ').trim() || null }, v);
      }));
      rowActivate(tr, () => openClub(c.id));
      return tr;
    }));
    table.replaceChildren(thead, tbody);
  }

  const clubCell = c => h('span', { class: 'club-cell' }, badge(c), c.name);
  const euroTag = c => (c.europe ? h('span', { class: 'tag ' + c.europe.toLowerCase(), text: c.europe }) : h('span', { class: 'muted', text: '—' }));

  function renderPerfTable() {
    const cols = [
      { key: 'name', label: 'Club', cell: clubCell, sortVal: c => c.name },
      { key: 'pos', label: '2025-26', cell: c => (c.promoted ? h('span', null, ordinal(c.s2526.pos) + ' ', h('span', { class: 'tag promo', text: 'Segunda' })) : ordinal(c.s2526.pos)), sortVal: c => pyramidRank(c.history[c.history.length - 1]), defaultAsc: true },
      { key: 'pts', label: 'Pts', num: true, cell: c => orDash(c.s2526.pts), sortVal: c => (c.promoted ? -1 : c.s2526.pts) },
      { key: 'wdl', label: 'W-D-L', cell: c => wdl(c.s2526), sortable: false },
      { key: 'gd', label: 'GD', num: true, cell: c => signed(c.gd), sortVal: c => (c.promoted ? -99 : c.gd) },
      { key: 'trend', label: '5-season trend', cell: c => { const sp = sparkline(c); const wrap = h('span', { title: histText(c), 'aria-label': histText(c) }, sp); return wrap; }, sortVal: c => c.histRank, defaultAsc: true },
      ...(hasNow ? [{ key: 'now', label: `Now (MD${META.matchday})`, cell: c => nowText(c), sortVal: c => c.s2627.pos, defaultAsc: true }] : []),
      { key: 'europe', label: 'Europe 26-27', cell: euroTag, sortVal: c => ({ UCL: 0, UEL: 1, UECL: 2 }[c.europe] ?? 3), defaultAsc: true },
      { key: 'power', label: 'Power', num: true, cell: c => h('b', { text: c.power }), sortVal: c => c.power },
    ];
    sortableTable($('#perfTable'), cols, CLUBS, state.perfSort, renderPerfTable);
  }

  /* ---------------------------------------------------------------
     Attitudes
     --------------------------------------------------------------- */
  function renderHeatmap() {
    const table = $('#heatmap');
    const hs = state.heatSort;
    const rows = hs.key ? [...CLUBS].sort((a, b) => (hs.asc ? 1 : -1) * (a.vibe[hs.key] - b.vibe[hs.key]) || a.name.localeCompare(b.name))
      : [...CLUBS].sort((a, b) => a.name.localeCompare(b.name));
    const head = h('tr', null, h('th', { class: 'club-h', scope: 'col', text: 'Club' }), ...VIBES.map(v => {
      const th = h('th', { scope: 'col', tabindex: 0, class: hs.key === v.key ? 'sorted' : null, title: v.desc, 'aria-sort': hs.key === v.key ? (hs.asc ? 'ascending' : 'descending') : null },
        h('span', { class: 'emo', 'aria-hidden': 'true', text: v.emo }), v.label);
      rowActivate(th, () => {
        if (hs.key === v.key) hs.asc = !hs.asc; else { hs.key = v.key; hs.asc = false; }
        renderHeatmap();
      });
      return th;
    }));
    const body = rows.map(c => {
      const tr = h('tr', { tabindex: 0, 'aria-label': `Open ${c.name} club file` },
        h('td', { class: 'club-td' }, h('span', { class: 'club-cell' }, badge(c), c.name)),
        ...VIBES.map(v => {
          const val = c.vibe[v.key];
          const bg = heat(val / 10);
          const td = h('td', { style: { background: bg, color: inkOn(bg) }, text: val });
          bindTip(td, () => [ttTitle(`${c.name}: ${v.label}`), ttRow(null, v.emo + ' Rating', `${val}/10`), ttNote(v.desc)]);
          return td;
        }));
      rowActivate(tr, () => openClub(c.id));
      return tr;
    });
    table.replaceChildren(h('thead', null, head), h('tbody', null, ...body));
    $('#heatLegend').replaceChildren(h('span', { text: '0 · meh' }), h('span', { class: 'ramp', style: { background: rampCss() } }), h('span', { text: '10 · on fire' }));
  }

  function radarChart(box, series) {
    const W = box.clientWidth || 520;
    const R = Math.max(70, Math.min((W - 200) / 2, 150));
    const H = Math.round(R * 2 + 70), cx = W / 2, cy = H / 2;
    const n = VIBES.length;
    const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
    const pt = (i, v) => [cx + Math.cos(ang(i)) * R * v / 10, cy + Math.sin(ang(i)) * R * v / 10];
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Attitude radar: ' + series.map(se => se.label + ' ' + VIBES.map(v => v.label + ' ' + se.values[v.key]).join(', ')).join('; ') });
    [2, 4, 6, 8, 10].forEach(r => svg.append(s('polygon', { class: 'ring', points: VIBES.map((_, i) => pt(i, r).join(',')).join(' ') })));
    VIBES.forEach((v, i) => {
      const [x2, y2] = pt(i, 10);
      svg.append(s('line', { x1: cx, y1: cy, x2, y2, class: 'spoke' }));
      const [lx, ly] = pt(i, 12.6);
      const anchor = Math.abs(lx - cx) < 8 ? 'middle' : lx > cx ? 'start' : 'end';
      svg.append(s('text', { x: lx, y: ly + 4, 'text-anchor': anchor, class: 'axis-lbl', text: `${v.emo} ${v.label}` }));
    });
    series.forEach(se => {
      const pts = VIBES.map((v, i) => pt(i, se.values[v.key]).join(',')).join(' ');
      svg.append(s('polygon', { points: pts, fill: se.color, 'fill-opacity': 0.14, stroke: se.color, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    });
    series.forEach(se => VIBES.forEach((v, i) => {
      const [x, y] = pt(i, se.values[v.key]);
      svg.append(s('circle', { cx: x, cy: y, r: 4, fill: se.color, stroke: 'var(--surface)', 'stroke-width': 2 }));
    }));
    // hover hit areas per axis showing every series
    VIBES.forEach((v, i) => {
      const [x, y] = pt(i, 7);
      const hit = s('circle', { cx: x, cy: y, r: R * 0.32, class: 'hit', tabindex: 0, 'aria-label': v.label });
      bindTip(hit, () => [ttTitle(`${v.emo} ${v.label}`), ...series.map(se => ttRow(se.color, se.label, `${se.values[v.key]}/10`)), ttNote(v.desc)]);
      svg.append(hit);
    });
    box.replaceChildren(svg);
  }

  function renderCompare() {
    const a = byId[$('#cmpA').value], b = byId[$('#cmpB').value];
    radarChart($('#radar'), [
      { label: a.name, color: C1, values: a.vibe },
      { label: b.name, color: C3, values: b.vibe },
    ]);
  }
  function initCompare() {
    const opts = () => [...CLUBS].sort((a, b) => a.name.localeCompare(b.name)).map(c => h('option', { value: c.id, text: c.name }));
    const A = $('#cmpA'), B = $('#cmpB');
    A.replaceChildren(...opts()); B.replaceChildren(...opts());
    A.value = 'real-betis' in byId ? 'real-betis' : CLUBS[0].id;
    B.value = 'real-sociedad' in byId ? 'real-sociedad' : CLUBS[1].id;
    A.addEventListener('change', renderCompare);
    B.addEventListener('change', renderCompare);
    renderCompare();
  }

  const QUIRKS = CLUBS.flatMap(c => c.quirks.map(q => ({ c, q })));
  function randomAttitude() {
    let i;
    do { i = Math.floor(Math.random() * QUIRKS.length); } while (QUIRKS.length > 1 && i === state.lastQuirk);
    state.lastQuirk = i;
    const { c, q } = QUIRKS[i];
    const topVibe = [...VIBES].sort((x, y) => c.vibe[y.key] - c.vibe[x.key])[0];
    $('#randomAttitude').replaceChildren(h('div', { class: 'quirk' },
      badge(c, 'md'),
      h('div', null,
        h('p', { class: 'q-club', text: c.name }),
        h('p', { class: 'q-text', text: q }),
        h('span', { class: 'tag q-cat', text: `Signature attitude: ${topVibe.emo} ${topVibe.label} ${c.vibe[topVibe.key]}/10` }))));
  }

  /* ---------------------------------------------------------------
     Tickets
     --------------------------------------------------------------- */
  const ACCESS = {
    open: { icon: '✓', label: 'Open', cls: 'open' },
    limited: { icon: '!', label: 'Waiting list / quota', cls: 'limited' },
    closed: { icon: '✕', label: 'Closed this season', cls: 'closed' },
  };
  function renderTicketKpis() {
    const withMin = CLUBS.filter(c => c.tickets.min != null);
    const cheapest = [...withMin].filter(c => !c.tickets.est).sort((a, b) => a.tickets.min - b.tickets.min)[0];
    const withBig = CLUBS.filter(c => c.tickets.big != null);
    const priciest = [...withBig].sort((a, b) => b.tickets.big - a.tickets.big)[0];
    const withSeason = CLUBS.filter(c => c.tickets.season != null);
    const cheapSeason = [...withSeason].sort((a, b) => a.tickets.season - b.tickets.season)[0];
    const bang = [...withMin].filter(c => !c.tickets.est).sort((a, b) => b.power / b.tickets.min - a.power / a.tickets.min)[0];
    $('#ticketKpis').replaceChildren(
      stat('Cheapest normal-game seat', eur(cheapest.tickets.min), `${cheapest.name} (confirmed prices only)`),
      stat('Priciest “cheap” big-game seat', eur(priciest.tickets.big), priciest.name),
      stat('Cheapest adult season ticket', eur(cheapSeason.tickets.season), `${cheapSeason.name} · ${eur(cheapSeason.tickets.season / 19)} a game`),
      stat('Most power per euro', bang.short, `Power ${bang.power} from ${eur(bang.tickets.min)}`),
    );
  }

  function renderDumbbell() {
    const rows = CLUBS.filter(c => c.tickets.min != null).sort((a, b) => a.tickets.min - b.tickets.min || (a.tickets.big || 0) - (b.tickets.big || 0));
    const box = $('#dumbbell');
    const W = box.clientWidth || 600;
    const labelW = Math.min(150, Math.max(96, W * 0.28));
    const rowH = 26, top = 6, axisH = 26, padR = 48;
    const H = top + rows.length * rowH + axisH;
    const ends = rows.map(c => c.tickets.big || c.tickets.min).sort((a, b) => b - a);
    // one runaway price (hello, Clásico) would squash everyone else: break the axis instead
    const capped = ends[0] > ends[1] * 2;
    const max = capped ? ends[1] * 1.12 : ends[0];
    const ticks = niceTicks(0, max, Math.max(2, Math.floor((W - labelW - padR - (capped ? 70 : 0)) / 70)));
    const dmax = ticks[ticks.length - 1];
    const x = v => labelW + Math.min(v, dmax * 1.04) / (dmax * 1.04) * (W - labelW - padR - (capped ? 70 : 0));
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'group', 'aria-label': 'Ticket prices by club' });
    const grid = s('g', { class: 'grid' });
    ticks.forEach(t => {
      grid.append(s('line', { x1: x(t), x2: x(t), y1: top, y2: top + rows.length * rowH }));
      grid.append(s('text', { x: x(t), y: H - 8, 'text-anchor': 'middle', class: 'tick', fill: 'currentColor', text: '€' + t }));
    });
    svg.append(grid);
    rows.forEach((c, i) => {
      const y = top + i * rowH + rowH / 2;
      const t = c.tickets;
      const g = s('g', { class: 'row', tabindex: 0, role: 'button', 'aria-label': `${c.name}: normal game from ${eur(t.min)}, big game from ${eur(t.big)}` });
      g.append(s('rect', { x: 0, y: y - rowH / 2, width: W, height: rowH, class: 'row-hover', rx: 6 }));
      g.append(s('text', { x: labelW - 10, y: y + 4, 'text-anchor': 'end', class: 'cat-label', text: c.short }));
      if (t.big != null) g.append(s('line', { x1: x(t.min), x2: x(t.big), y1: y, y2: y, stroke: '#ffffff', 'stroke-opacity': 0.25, 'stroke-width': 2, 'stroke-linecap': 'round' }));
      const dot = (cx, col) => (t.est
        ? s('circle', { cx, cy: y, r: 4.5, fill: 'var(--surface)', stroke: col, 'stroke-width': 2 })
        : s('circle', { cx, cy: y, r: 5.5, fill: col, stroke: 'var(--surface)', 'stroke-width': 2 }));
      g.append(dot(x(t.min), C1));
      if (t.big != null) g.append(dot(x(t.big), C2));
      const endV = t.big ?? t.min;
      if (endV > dmax * 1.04) {
        const bx = x(endV) - 18;
        g.append(s('path', { d: `M${bx - 4} ${y - 6}l4 12M${bx + 2} ${y - 6}l4 12`, stroke: 'var(--ink-3)', 'stroke-width': 1.5 }));
      }
      g.append(s('text', { x: x(endV) + 10, y: y + 4, class: 'bar-label', text: (t.est ? '≈' : '') + (t.big != null ? `${eur(t.min)}–${eur(t.big)}` : eur(t.min)) + (endV > dmax * 1.04 ? ' (!)' : '') }));
      bindTip(g, () => [ttTitle(c.name),
        ttRow(C1, 'Normal game from', eur(t.min)),
        t.typical != null ? ttRow(null, 'Typical seat', eur(t.typical)) : null,
        ttRow(C2, 'Big game from', eur(t.big)),
        ttRow(null, 'Season ticket from', eur(t.season)),
        ttNote(t.est ? 'Single-match prices are an estimate based on comparable clubs.' : `Price confidence: ${t.conf}`)].filter(Boolean));
      rowActivate(g, () => openClub(c.id));
      svg.append(g);
    });
    box.replaceChildren(svg);
  }

  function renderScatter() {
    const rows = CLUBS.filter(c => c.tickets.min != null);
    const box = $('#scatter');
    const W = box.clientWidth || 600;
    const H = Math.round(Math.min(460, Math.max(320, W * 0.72)));
    const m = { l: 44, r: 20, t: 16, b: 40 };
    const xmax = Math.max(...rows.map(c => c.tickets.min));
    const xt = niceTicks(0, xmax * 1.05, Math.max(3, Math.floor((W - 64) / 64)));
    const dx = xt[xt.length - 1];
    const x = v => m.l + v / dx * (W - m.l - m.r);
    const y = v => m.t + (1 - v / 100) * (H - m.t - m.b);
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'group', 'aria-label': 'Scatter of cheapest ticket price against power index' });
    const grid = s('g', { class: 'grid' });
    xt.forEach(t => {
      grid.append(s('line', { x1: x(t), x2: x(t), y1: m.t, y2: H - m.b }));
      grid.append(s('text', { x: x(t), y: H - m.b + 18, 'text-anchor': 'middle', class: 'tick', fill: 'currentColor', text: '€' + t }));
    });
    [0, 25, 50, 75, 100].forEach(t => {
      grid.append(s('line', { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t) }));
      grid.append(s('text', { x: m.l - 8, y: y(t) + 4, 'text-anchor': 'end', class: 'tick', fill: 'currentColor', text: t }));
    });
    svg.append(grid);
    svg.append(s('text', { x: W - m.r, y: H - 6, 'text-anchor': 'end', class: 'axis-title', text: 'Cheapest normal-game ticket →' }));
    svg.append(s('text', { x: 12, y: m.t + 2, transform: `rotate(-90 12 ${m.t + 2})`, 'text-anchor': 'end', class: 'axis-title', text: 'Power index →' }));
    const medX = rows.map(c => c.tickets.min).sort((a, b) => a - b)[Math.floor(rows.length / 2)];
    svg.append(s('line', { x1: x(medX), x2: x(medX), y1: m.t, y2: H - m.b, stroke: 'var(--line-strong)' }));
    svg.append(s('line', { x1: m.l, x2: W - m.r, y1: y(50), y2: y(50), stroke: 'var(--line-strong)' }));
    const q = [
      ['Bargain glory', m.l + 8, m.t + 16, 'start'],
      ['Pay to win', W - m.r - 8, m.t + 16, 'end'],
      ['Cheap thrills', m.l + 8, H - m.b - 10, 'start'],
      ['Paying to suffer', W - m.r - 8, H - m.b - 10, 'end'],
    ];
    q.forEach(([t, qx, qy, a]) => svg.append(s('text', { x: qx, y: qy, 'text-anchor': a, class: 'quad-label', 'font-size': W < 480 ? 9 : 12, text: t })));
    const topId = state.results[0] && state.results[0].club.id;
    const placed = [];
    const labels = s('g');
    const dots = s('g');
    [...rows].sort((a, b) => (a.id === topId) - (b.id === topId)).forEach(c => {
      const px = x(c.tickets.min), py = y(c.power);
      const isTop = c.id === topId;
      const g = s('g', { tabindex: 0, role: 'button', 'aria-label': `${c.name}: from ${eur(c.tickets.min)}, power ${c.power}` });
      g.append(s('circle', { cx: px, cy: py, r: 14, class: 'hit' }));
      const col = isTop ? '#ffc53d' : C1;
      g.append(c.tickets.est
        ? s('circle', { cx: px, cy: py, r: isTop ? 6.5 : 5, fill: 'var(--surface)', stroke: col, 'stroke-width': 2 })
        : s('circle', { cx: px, cy: py, r: isTop ? 7.5 : 6, class: 'pt', fill: col }));
      bindTip(g, () => [ttTitle(c.name), ttRow(C1, 'Power index', String(c.power)), ttRow(null, 'Cheapest ticket', priceTxt(c, c.tickets.min)),
        ttRow(null, 'Your match', state.matchById[c.id].match + '%'), isTop ? ttNote('★ Your top match') : null].filter(Boolean));
      rowActivate(g, () => openClub(c.id));
      dots.append(g);
      // simple label collision avoidance
      const lw = 26, lh = 12;
      const cands = [[px + 9, py + 4, 'start'], [px - 9, py + 4, 'end'], [px, py - 10, 'middle'], [px, py + 17, 'middle']];
      for (const [lx, ly, an] of cands) {
        const bx = an === 'start' ? lx : an === 'end' ? lx - lw : lx - lw / 2;
        const box2 = { x: bx, y: ly - lh + 2, w: lw, h: lh };
        const hitsLabel = placed.some(p => !(box2.x + box2.w < p.x || p.x + p.w < box2.x || box2.y + box2.h < p.y || p.y + p.h < box2.y));
        const hitsDot = rows.some(o => o !== c && Math.hypot(x(o.tickets.min) - (box2.x + lw / 2), y(o.power) - (box2.y + lh / 2)) < 10);
        if (!hitsLabel && !hitsDot && box2.x > m.l - 4 && box2.x + lw < W) {
          placed.push(box2);
          labels.append(s('text', { x: lx, y: ly, 'text-anchor': an, class: 'pt-label', text: c.code, fill: isTop ? '#ffc53d' : null }));
          break;
        }
      }
    });
    svg.append(labels, dots);
    box.replaceChildren(svg);
  }

  function renderTicketTable() {
    const cols = [
      { key: 'name', label: 'Club', cell: clubCell, sortVal: c => c.name },
      { key: 'min', label: 'Normal game from', num: true, cell: c => priceTxt(c, c.tickets.min), sortVal: c => c.tickets.min ?? 9999, defaultAsc: true },
      { key: 'big', label: 'Big game from', num: true, cell: c => priceTxt(c, c.tickets.big), sortVal: c => c.tickets.big ?? 9999, defaultAsc: true },
      { key: 'season', label: 'Season ticket from', num: true, cell: c => eur(c.tickets.season), sortVal: c => c.tickets.season ?? 99999, defaultAsc: true },
      { key: 'access', label: 'Can a newcomer get in?', cell: c => { const a = ACCESS[c.tickets.access]; return h('span', { class: 'status ' + a.cls }, h('i', { 'aria-hidden': 'true', text: a.icon }), a.label); }, sortVal: c => ({ open: 0, limited: 1, closed: 2 }[c.tickets.access]), defaultAsc: true },
      { key: 'note', label: 'The deal', cls: 'wrap hide-sm', cell: c => h('span', { class: 'muted', text: c.tickets.note }), sortable: false },
      { key: 'att', label: 'Avg crowd 25-26', num: true, cls: 'hide-sm', cell: c => h('span', { title: c.attendanceNote || null }, fmtInt(c.attendance) + (c.attendanceNote ? '*' : '')), sortVal: c => c.attendance || 0 },
      { key: 'full', label: '% full', num: true, cls: 'hide-sm', cell: c => (c.full ? c.full + '%' : '—'), sortVal: c => c.full || 0 },
    ];
    sortableTable($('#ticketTable'), cols, CLUBS, state.ticketSort, renderTicketTable);
  }

  /* ---------------------------------------------------------------
     Club grid + modal
     --------------------------------------------------------------- */
  function renderClubGrid() {
    const q = $('#clubSearch').value.trim().toLowerCase();
    const sortBy = $('#clubSort').value;
    let rows = CLUBS.filter(c => !q || [c.name, c.city, c.nickname, c.region, c.stadium].join(' ').toLowerCase().includes(q));
    const sorters = {
      match: (a, b) => state.matchById[a.id].rank - state.matchById[b.id].rank,
      power: (a, b) => b.power - a.power,
      price: (a, b) => (a.priceMin ?? 999) - (b.priceMin ?? 999),
      atmosphere: (a, b) => b.vibe.atmosphere - a.vibe.atmosphere,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    rows = [...rows].sort(sorters[sortBy]);
    const grid = $('#clubGrid');
    if (!rows.length) { grid.replaceChildren(h('p', { class: 'muted', text: 'No club matches that search. Try a city like “Bilbao”.' })); return; }
    grid.replaceChildren(...rows.map(c => {
      const m = state.matchById[c.id];
      const b = h('button', { type: 'button', class: 'card club-card', 'aria-label': `${c.name}, ${m.match} percent match. Open club file.` },
        h('div', { class: 'cc-head' }, badge(c, 'md'),
          h('div', { class: 'cc-name' }, h('h3', { text: c.name }), h('p', { class: 'cc-city', text: `${c.city} · “${c.nickname}”` })),
          h('span', { class: 'cc-match', text: `${m.match}%` })),
        h('p', { class: 'cc-tag', text: c.tagline }),
        (() => { const fl = redFlags(m); return h('p', { class: 'cc-flag', text: fl.length ? `🚩 ${fl[0].text}` + (fl.length > 1 ? ` (+${fl.length - 1} more)` : '') : '✨ No red flags for you' }); })(),
        h('div', { class: 'cc-stats' },
          h('div', null, h('b', { text: String(c.power) }), 'Power'),
          h('div', null, h('b', { text: priceTxt(c, c.priceMin) }), 'Tickets from'),
          h('div', null, h('b', { text: `${c.vibe.atmosphere}/10` }), 'Atmosphere')));
      b.addEventListener('click', () => openClub(c.id));
      return b;
    }));
  }

  const modal = $('#clubModal');
  function openClub(id) {
    const c = byId[id];
    const m = state.matchById[id];
    hideTip();
    const avg = Object.fromEntries(VIBES.map(v => [v.key, Math.round(sum(CLUBS.map(x => x.vibe[v.key])) / CLUBS.length * 10) / 10]));
    const radarBox = h('div', { class: 'chart radar' });
    const t = c.tickets;
    const closeBtn = h('button', { type: 'button', class: 'modal-close', 'aria-label': 'Close', text: '×' });
    closeBtn.addEventListener('click', () => modal.close());
    $('#modalBody').replaceChildren(
      h('div', { class: 'modal-hero', style: { '--club-a': c.colors[0] + '55' } },
        badge(c, 'lg'),
        h('div', null,
          h('p', { class: 'eyebrow', text: `${m.match}% match for you · #${m.rank} of 20` }),
          h('h2', { id: 'modalTitle', text: c.name }),
          h('p', { text: `“${c.nickname}” · ${c.city}, ${c.region} · founded ${c.founded}` })),
        closeBtn),
      h('div', { class: 'modal-grid' },
        h('div', null,
          h('p', { class: 'shout' }, 'Phrase to shout: ', h('b', { text: c.phrase })),
          h('div', { class: 'mini-stats' },
            stat('Power index', String(c.power)),
            stat('2025-26', ordinal(c.s2526.pos), c.promoted ? 'in Segunda (promoted)' : `${c.s2526.pts} pts`),
            hasNow ? stat(`Now · MD${META.matchday}`, ordinal(c.s2627.pos), `${c.s2627.pts} pts`) : stat('Trophies', String(c.honTotal))),
          h('h3', { text: 'Quick facts' }),
          h('dl', { class: 'facts' },
            h('div', null, h('dt', { text: 'Stadium' }), h('dd', { text: c.stadium })),
            h('div', null, h('dt', { text: 'Capacity' }), h('dd', { text: fmtInt(c.capacity), title: c.capacityNote || null })),
            h('div', null, h('dt', { text: 'Average crowd 2025-26' }), h('dd', { text: fmtInt(c.attendance) + (c.attendanceNote ? ` (${c.attendanceNote.toLowerCase()})` : '') })),
            h('div', null, h('dt', { text: 'Europe 2026-27' }), h('dd', null, euroTag(c))),
            h('div', null, h('dt', { text: 'Trophy cabinet' }), h('dd', { text: `${c.honours.liga} Liga · ${c.honours.copa} Copa · ${c.euroTotal} European` })),
            h('div', null, h('dt', { text: 'Sworn enemies' }), h('dd', { text: c.rivals.join(', ') }))),
          h('h3', { text: 'Tickets' }),
          h('dl', { class: 'facts' },
            h('div', null, h('dt', { text: 'Normal game from' }), h('dd', { text: priceTxt(c, t.min) })),
            h('div', null, h('dt', { text: 'Big game from' }), h('dd', { text: priceTxt(c, t.big) })),
            h('div', null, h('dt', { text: 'Season ticket from' }), h('dd', { text: eur(t.season) })),
            h('div', null, h('dt', { text: 'Newcomer access' }), h('dd', null, (() => { const a = ACCESS[t.access]; return h('span', { class: 'status ' + a.cls }, h('i', { 'aria-hidden': 'true', text: a.icon }), a.label); })()))),
          h('p', { class: 'muted', style: { fontSize: '14px', marginTop: '-6px' }, text: t.note + (t.est ? ' Single-match prices marked ≈ are estimates.' : '') }),
          c.capacityNote ? h('p', { class: 'muted', style: { fontSize: '13px', marginTop: '-6px' }, text: 'Stadium note: ' + c.capacityNote + '.' }) : null,
          h('h3', { text: '🚩 Red flags' }),
          (() => { const fl = redFlags(m); return fl.length ? h('ul', { class: 'flag-list' }, ...fl.map(x => h('li', null, h('span', { 'aria-hidden': 'true', text: x.emo }), h('span', { text: x.text + (x.personal ? ' (based on your sliders)' : '') })))) : h('p', { class: 'muted', text: 'Nothing obvious. Suspiciously perfect.' }); })(),
          h('div', { class: 'pick-avoid' },
            h('div', null, h('b', { text: '💘 Pick them if…' }), c.pickIf),
            h('div', null, h('b', { text: '🚩 Avoid if…' }), c.avoidIf)),
          h('p', { class: 'tip' }, h('b', { text: 'Newcomer tip: ' }), c.tip)),
        h('div', null,
          h('h3', { text: 'Attitude fingerprint' }),
          h('div', { class: 'legend' },
            h('span', null, h('i', { class: 'key key-1' }), c.short),
            h('span', null, h('i', { class: 'key key-3' }), 'League average')),
          radarBox,
          h('h3', { text: 'Random attitudes' }),
          h('ul', { class: 'quirk-list' }, ...c.quirks.map(q => h('li', { text: q }))),
          h('h3', { text: 'Five-season story' }),
          h('p', { class: 'muted', style: { fontSize: '14px' }, text: histText(c) }))));
    if (!modal.open) modal.showModal();
    radarChart(radarBox, [{ label: c.short, color: C1, values: c.vibe }, { label: 'League average', color: C3, values: avg }]);
    modal.scrollTop = 0;
  }
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

  /* ---------------------------------------------------------------
     Wheel of fate
     --------------------------------------------------------------- */
  const overlay = $('#spinOverlay');
  let spinPick = null, spinTimer = null;
  function spin() {
    hideTip();
    overlay.hidden = false;
    // fate has a thumb on the scale: better matches are likelier
    const weights = state.results.map(r => Math.pow(Math.max(r.raw, 0.05), 4));
    let t = Math.random() * sum(weights);
    let chosen = state.results[state.results.length - 1].club;
    for (let i = 0; i < weights.length; i++) { t -= weights[i]; if (t <= 0) { chosen = state.results[i].club; break; } }
    spinPick = chosen;
    const reel = $('#spinReel'), res = $('#spinResult');
    res.replaceChildren();
    $('#spinOpen').disabled = true;
    const land = () => {
      reel.replaceChildren(badge(chosen, 'lg'));
      const m = state.matchById[chosen.id];
      res.replaceChildren(h('h3', { text: chosen.name }), h('p', { text: `${m.match}% match · ${chosen.city}` }), h('p', { class: 'muted', text: pick(chosen.quirks) }));
      $('#spinOpen').disabled = false;
      $('#spinOpen').focus();
    };
    clearTimeout(spinTimer);
    if (REDUCED) { land(); return; }
    let step = 0;
    const total = 22;
    const tick = () => {
      step++;
      if (step >= total) { land(); return; }
      const c = pick(CLUBS);
      reel.replaceChildren(badge(c, 'lg'));
      res.replaceChildren(h('p', { class: 'muted', text: c.name }));
      spinTimer = setTimeout(tick, 40 + Math.pow(step / total, 3) * 260);
    };
    tick();
  }
  function closeSpin() { clearTimeout(spinTimer); overlay.hidden = true; }
  document.querySelectorAll('[data-spin]').forEach(b => b.addEventListener('click', spin));
  $('#spinAgain').addEventListener('click', spin);
  $('#spinClose').addEventListener('click', closeSpin);
  $('#spinOpen').addEventListener('click', () => { closeSpin(); if (spinPick) openClub(spinPick.id); });
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSpin(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden) closeSpin(); });

  /* ---------------------------------------------------------------
     Canvas: hero flames + page embers
     --------------------------------------------------------------- */
  function makeSprites() {
    const stops = [[255, 244, 214], [255, 205, 96], [255, 140, 72], [255, 60, 120], [255, 45, 149], [200, 20, 120], [110, 8, 70]];
    return stops.map(([r, g, b]) => {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const x = c.getContext('2d');
      const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
      gr.addColorStop(0.35, `rgba(${r},${g},${b},.55)`);
      gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = gr;
      x.fillRect(0, 0, 64, 64);
      return c;
    });
  }

  function flames() {
    const cv = $('#flames');
    const ctx = cv.getContext('2d');
    const sprites = makeSprites();
    let W = 0, H = 0, parts = [], visible = true, raf = 0, t0 = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(time) {
      const n = Math.min(22, Math.round(W / 64));
      for (let i = 0; i < n; i++) {
        const x = Math.random() * W;
        // tongues: taller flames where a slow wave peaks
        const wave = 0.55 + 0.45 * Math.sin(x / W * Math.PI * 5 + time * 0.0012) * Math.sin(x / W * Math.PI * 2.3 - time * 0.0007);
        parts.push({ x, y: H + 8, vx: (Math.random() - 0.5) * 0.5, vy: -(1.1 + Math.random() * 1.8) * (0.6 + wave), life: 0, max: 45 + Math.random() * 60, size: (22 + Math.random() * 34) * (W < 700 ? 0.75 : 1) });
      }
    }
    function step(time) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      spawn(time);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        const t = p.life / p.max;
        if (t >= 1 || p.y < -40) { parts.splice(i, 1); continue; }
        p.x += p.vx + Math.sin(p.y * 0.03 + p.life * 0.1) * 0.35;
        p.y += p.vy;
        const si = Math.min(sprites.length - 1, Math.floor(t * sprites.length));
        const sz = p.size * (1 - t * 0.65);
        ctx.globalAlpha = (1 - t) * 0.5;
        ctx.drawImage(sprites[si], p.x - sz / 2, p.y - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
    }
    function loop(time) {
      if (!visible || document.hidden) { raf = 0; return; }
      step(time);
      raf = requestAnimationFrame(loop);
    }
    resize();
    window.addEventListener('resize', () => { resize(); if (REDUCED) staticFrame(); });
    function staticFrame() { parts = []; for (let i = 0; i < 110; i++) step(i * 16); }
    if (REDUCED) { staticFrame(); return; }
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }).observe(cv);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(loop); });
    t0 = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function embers() {
    if (REDUCED) return;
    const cv = $('#embers');
    const ctx = cv.getContext('2d');
    const sprites = makeSprites();
    let W = 0, H = 0, parts = [], raf = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(clamp(W * H / 26000, 18, 60));
      parts = Array.from({ length: n }, () => mk(Math.random() * H));
    }
    function mk(y) {
      return { x: Math.random() * W, y: y ?? H + 10, vy: -(0.25 + Math.random() * 0.7), r: 3 + Math.random() * 7, ph: Math.random() * 6.28, sp: 0.01 + Math.random() * 0.02, si: 2 + Math.floor(Math.random() * 3), a: 0.35 + Math.random() * 0.5 };
    }
    function loop() {
      if (document.hidden) { raf = 0; return; }
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of parts) {
        p.y += p.vy; p.ph += p.sp; p.x += Math.sin(p.ph) * 0.4;
        if (p.y < -20) Object.assign(p, mk());
        const flick = 0.75 + 0.25 * Math.sin(p.ph * 3);
        ctx.globalAlpha = p.a * flick * clamp(p.y / H + 0.2, 0, 1);
        ctx.drawImage(sprites[p.si], p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf) raf = requestAnimationFrame(loop); });
    raf = requestAnimationFrame(loop);
  }

  /* ---------------------------------------------------------------
     Wiring
     --------------------------------------------------------------- */
  function update() {
    computeMatches();
    renderTopMatch();
    renderMap();
    renderScatter();
    renderClubGrid();
  }

  function renderAllCharts() {
    renderMap();
    renderCompare();
    renderPerfChart();
    renderTrophies();
    renderDumbbell();
    renderScatter();
  }

  function init() {
    computeMatches();
    renderHeroStats();
    renderCitySelect();
    renderPresets();
    renderSliders();
    renderTopMatch();
    renderPerfKpis();
    renderPerfMetricTabs();
    renderPerfTable();
    renderHeatmap();
    initCompare();
    randomAttitude();
    renderTicketKpis();
    renderTicketTable();
    renderClubGrid();
    renderAllCharts();
    $('#randomBtn').addEventListener('click', randomAttitude);
    $('#clubSearch').addEventListener('input', renderClubGrid);
    $('#clubSort').addEventListener('change', renderClubGrid);
    $('#dataNote').textContent = META.note;
    $('#beerNote').textContent = META.beer;
    let lastW = window.innerWidth, rt = 0;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; renderAllCharts(); } }, 150);
    });
    flames();
    embers();
  }

  init();
})();
