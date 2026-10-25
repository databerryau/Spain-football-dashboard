/* =========================================================
   Easy Basketball Training: generator, plan view, run mode
   ========================================================= */
(() => {
  const SLOTS = [
    { key: 'warmup', label: 'Warm-up game', min: 10, icon: '🔥' },
    { key: 'skill1', label: 'Skill 1', min: 12, icon: '⭐' },
    { key: 'water',  label: 'Water break', min: 3, icon: '💧' },
    { key: 'skill2', label: 'Skill 2', min: 12, icon: '⭐' },
    { key: 'game',   label: 'Team game', min: 18, icon: '🏀' },
    { key: 'huddle', label: 'Huddle', min: 5, icon: '🙌' },
  ];
  const DRILL_SLOTS = ['warmup', 'skill1', 'skill2', 'game'];
  const byId = Object.fromEntries(DRILLS.map(d => [d.id, d]));
  const KEY_SESSION = 'ebt.session.v1';
  const KEY_HISTORY = 'ebt.history.v1';

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rand = arr => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- storage (optional: the page works without it) ---------- */
  const store = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode */ } },
  };

  /* ---------- generator ---------- */
  function poolFor(slot, focus) {
    if (slot === 'warmup') return DRILLS.filter(d => d.slot === 'warmup');
    if (slot === 'skill1') return DRILLS.filter(d => d.slot === 'skill' && d.theme === focus);
    if (slot === 'skill2') return DRILLS.filter(d => d.slot === 'skill' && d.theme !== focus);
    if (slot === 'game') return DRILLS.filter(d => d.slot === 'game');
    return [];
  }

  function pickFrom(pool, avoid) {
    const fresh = pool.filter(d => !avoid.includes(d.id));
    return rand(fresh.length ? fresh : pool);
  }

  function generate() {
    const hist = store.get(KEY_HISTORY) || {};
    const focus = FOCUS_ORDER[(FOCUS_ORDER.indexOf(hist.lastFocus) + 1) % FOCUS_ORDER.length];
    const recent = hist.recent || [];
    const warmup = pickFrom(poolFor('warmup'), recent);
    const skill1 = pickFrom(poolFor('skill1', focus), recent);
    const skill2 = pickFrom(poolFor('skill2', focus), recent);
    const games = poolFor('game');
    const matched = games.filter(g => g.theme === focus && !recent.includes(g.id));
    const game = matched.length ? rand(matched) : pickFrom(games, recent);
    const s = { v: 1, created: Date.now(), focus, slots: { warmup: warmup.id, skill1: skill1.id, skill2: skill2.id, game: game.id }, seen: {} };
    DRILL_SLOTS.forEach(k => { s.seen[k] = [s.slots[k]]; });
    return s;
  }

  // Replaces one drill with another that fits the same slot, cycling
  // through every option before repeating.
  function swap(s, slot) {
    const pool = poolFor(slot, s.focus);
    const inUse = Object.values(s.slots);
    let seen = s.seen[slot] || [];
    let options = pool.filter(d => !seen.includes(d.id) && !inUse.includes(d.id));
    if (!options.length) {
      seen = [s.slots[slot]];
      options = pool.filter(d => !inUse.includes(d.id));
    }
    if (!options.length) return;
    const next = rand(options);
    s.slots[slot] = next.id;
    s.seen[slot] = seen.concat(next.id);
  }

  function save(s) {
    store.set(KEY_SESSION, s);
    store.set(KEY_HISTORY, { lastFocus: s.focus, recent: Object.values(s.slots) });
  }

  function load() {
    const s = store.get(KEY_SESSION);
    if (!s || s.v !== 1 || !THEMES[s.focus] || !s.slots) return null;
    s.seen = s.seen || {};
    let fixed = false;
    DRILL_SLOTS.forEach(k => {
      if (!byId[s.slots[k]]) { s.slots[k] = pickFrom(poolFor(k, s.focus), []).id; fixed = true; }
    });
    if (fixed) save(s);
    return s;
  }

  /* ---------- shared bits ---------- */
  function needList(s) {
    const drills = DRILL_SLOTS.map(k => byId[s.slots[k]]);
    const items = [];
    if (drills.some(d => d.need.balls === 'each')) items.push('🏀 A ball for each player');
    else if (drills.some(d => d.need.balls)) items.push('🏀 Some balls');
    const cones = Math.max(0, ...drills.map(d => d.need.cones || 0));
    if (cones) items.push(`🔶 ${cones} cones`);
    if (drills.some(d => d.need.bibs)) items.push('🎽 Bibs (2 colours)');
    items.push('📣 Whistle', '💧 Water bottles');
    return items;
  }

  function needLine(d) {
    const n = [];
    if (d.need.balls === 'each') n.push('a ball each');
    else if (d.need.balls) n.push('some balls');
    if (d.need.cones) n.push(`${d.need.cones} cone${d.need.cones > 1 ? 's' : ''}`);
    if (d.need.bibs) n.push('bibs');
    return n.length ? n.join(' · ') : 'nothing! Just space';
  }

  const diagramLabel = d => `Animated diagram of ${d.name}. Blue circles are our players, red circles are defenders, the orange dot is the ball.`;

  // HTML for one part of the session. `opts.big` = run-mode sizing.
  function partHTML(s, slot, opts = {}) {
    if (slot.key === 'water') {
      return `
        <div class="water">
          <p class="water-emoji" aria-hidden="true">💧</p>
          <p class="lead">Drink up! Everyone gets water.</p>
          <ul class="tips">
            <li>Count heads. Is everyone OK?</li>
            <li>Set up the cones for the next drill now.</li>
            <li>Quickly tell them the name of the next drill.</li>
          </ul>
        </div>`;
    }
    if (slot.key === 'huddle') {
      const h = HUDDLE.byTheme[s.focus];
      return `
        <div class="diagram" data-anim="huddle"></div>
        <div class="callout">
          <p class="callout-label">Today's question</p>
          <p class="callout-q">"${esc(h.q)}"</p>
          <p class="callout-a"><b>Answer:</b> ${esc(h.a)}</p>
        </div>
        <div class="callout callout-home">
          <p class="callout-label">Home challenge</p>
          <p>${esc(h.home)}</p>
        </div>
        <h4 class="sub">How it works</h4>
        <ol class="steps">${HUDDLE.steps.map(st => `<li>${esc(st)}</li>`).join('')}</ol>`;
    }
    const d = byId[s.slots[slot.key]];
    const cues = `
      <h4 class="sub">What to say</h4>
      <ul class="cues">${d.say.map(c => `<li>“${esc(c)}”</li>`).join('')}</ul>`;
    const steps = `
      <h4 class="sub">How it works</h4>
      <ol class="steps">${d.steps.map(st => `<li>${esc(st)}</li>`).join('')}</ol>`;
    return `
      <div class="diagram" data-anim="${esc(d.id)}"></div>
      ${opts.big ? cues + steps : steps + cues}
      <p class="need-line"><b>You need:</b> ${esc(needLine(d))}</p>
      <button type="button" class="btn btn-swap" data-swap="${slot.key}">↻ Swap for a different drill</button>`;
  }

  function mountDiagrams(root, list) {
    root.querySelectorAll('[data-anim]').forEach(host => {
      const id = host.dataset.anim;
      const d = id === 'huddle' ? HUDDLE : byId[id];
      list.push(Court.create(host, d.anim, { label: diagramLabel(d) }));
    });
  }

  /* ---------- plan view ---------- */
  let session = load();
  const planDiagrams = {};
  const openParts = new Set(['warmup']);

  function partTitle(slot) {
    if (slot.key === 'water') return 'Water break';
    if (slot.key === 'huddle') return HUDDLE.name;
    return byId[session.slots[slot.key]].name;
  }

  function renderPlan() {
    const root = $('#session');
    Object.keys(planDiagrams).forEach(k => { planDiagrams[k].forEach(c => c.destroy()); delete planDiagrams[k]; });

    if (!session) {
      root.innerHTML = `
        <div class="card hero-card">
          <p class="hero-ball" aria-hidden="true">🏀</p>
          <h1>Ready for training?</h1>
          <p class="lead">One tap gives you a full <b>60-minute session</b>, with every drill explained and animated.</p>
          <button type="button" class="btn btn-big btn-primary" data-action="generate">Make today's session</button>
          <ol class="how">
            <li><b>Tap the orange button.</b> You get a 60-minute plan in 6 parts.</li>
            <li><b>Have a look at home.</b> Tap any drill to see how it works.</li>
            <li><b>At the court, tap “Start session”</b> and follow the timer.</li>
          </ol>
        </div>`;
      return;
    }

    const theme = THEMES[session.focus];
    const made = new Date(session.created).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
    const resume = run && !run.finished;
    let clock = 0;
    root.innerHTML = `
      <div class="card focus-card">
        <p class="eyebrow">Today's focus</p>
        <h1><span aria-hidden="true">${theme.icon}</span> ${esc(theme.name)}</h1>
        <p class="fixes">Fixes: <b>${esc(theme.fixes.toLowerCase())}</b></p>
        <div class="need">
          <p class="need-title">You'll need</p>
          <ul>${needList(session).map(n => `<li>${esc(n)}</li>`).join('')}</ul>
        </div>
        <button type="button" class="btn btn-big btn-go" data-action="run">${resume ? `▶ Back to the session (part ${run.i + 1} of 6)` : '▶ Start session'}</button>
        ${resume ? '<button type="button" class="btn btn-link" data-action="run-restart">Start again from the beginning</button>' : ''}
      </div>
      <h2 class="plan-title">The plan <span>60 minutes</span></h2>
      <ol class="plan">
        ${SLOTS.map((slot, i) => {
          const from = clock; clock += slot.min;
          const open = openParts.has(slot.key);
          return `
            <li class="part part-${slot.key}${open ? ' is-open' : ''}" data-part="${slot.key}">
              <button type="button" class="part-head" aria-expanded="${open}" aria-controls="body-${slot.key}">
                <span class="part-num" aria-hidden="true">${i + 1}</span>
                <span class="part-text">
                  <span class="part-slot">${slot.icon} ${esc(slot.label)} · ${slot.min} min</span>
                  <span class="part-name">${esc(partTitle(slot))}</span>
                </span>
                <span class="part-time" aria-hidden="true">${from}–${clock}</span>
                <span class="chev" aria-hidden="true"></span>
              </button>
              <div class="part-body" id="body-${slot.key}" ${open ? '' : 'hidden'}>${open ? partHTML(session, slot) : ''}</div>
            </li>`;
        }).join('')}
      </ol>
      <div class="plan-foot">
        <button type="button" class="btn btn-ghost" data-action="generate">↻ Make a new session</button>
        <p class="small">Made ${esc(made)}. Saved on this phone.</p>
      </div>`;

    SLOTS.forEach(slot => {
      if (!openParts.has(slot.key)) return;
      planDiagrams[slot.key] = [];
      mountDiagrams($(`#body-${slot.key}`), planDiagrams[slot.key]);
    });
  }

  function togglePart(key) {
    const li = $(`.part[data-part="${key}"]`);
    const body = $(`#body-${key}`);
    const head = $('.part-head', li);
    const slot = SLOTS.find(s => s.key === key);
    if (openParts.has(key)) {
      openParts.delete(key);
      (planDiagrams[key] || []).forEach(c => c.destroy());
      delete planDiagrams[key];
      body.hidden = true;
      body.innerHTML = '';
    } else {
      openParts.add(key);
      body.innerHTML = partHTML(session, slot);
      body.hidden = false;
      planDiagrams[key] = [];
      mountDiagrams(body, planDiagrams[key]);
    }
    li.classList.toggle('is-open', openParts.has(key));
    head.setAttribute('aria-expanded', openParts.has(key));
  }

  function newSession() {
    if (session && !window.confirm('Make a new session?\n\nThis one will be replaced.')) return;
    session = generate();
    save(session);
    run = null;
    openParts.clear();
    openParts.add('warmup');
    renderPlan();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- run mode (at the court) ---------- */
  let run = null;          // { i, remaining: [secs per part], running, endAt, beeped, finished }
  let runDiagrams = [];
  let ticker = null;
  let wakeLock = null;
  let audio = null;

  const fmt = secs => {
    const over = secs < 0;
    const a = Math.abs(Math.round(secs));
    return `${over ? '+' : ''}${Math.floor(a / 60)}:${String(a % 60).padStart(2, '0')}`;
  };

  function remainingNow() {
    if (!run.running) return run.remaining[run.i];
    return (run.endAt - Date.now()) / 1000;
  }

  function beep() {
    try {
      if (!audio) return;
      [0, 0.32, 0.64].forEach(off => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'square';
        osc.frequency.value = 880;
        const t = audio.currentTime + off;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        osc.connect(gain).connect(audio.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch (e) { /* no sound available */ }
    if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
  }

  async function keepAwake() {
    try {
      if ('wakeLock' in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      }
    } catch (e) { /* not allowed: fine */ }
  }
  function letSleep() {
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  }

  function startRun(fromStart) {
    if (!run || fromStart || run.finished) {
      run = { i: 0, remaining: SLOTS.map(s => s.min * 60), running: false, endAt: 0, beeped: false, started: false, finished: false };
    }
    $('#run').hidden = false;
    document.body.classList.add('running');
    renderRun();
    clearInterval(ticker);
    ticker = setInterval(tick, 250);
  }

  function exitRun() {
    if (run && run.running) setRunning(false);
    clearInterval(ticker);
    runDiagrams.forEach(c => c.destroy());
    runDiagrams = [];
    letSleep();
    $('#run').hidden = true;
    $('#run').innerHTML = '';
    document.body.classList.remove('running');
    renderPlan();
  }

  function setRunning(on) {
    if (on === run.running) return;
    if (on) {
      run.endAt = Date.now() + run.remaining[run.i] * 1000;
      run.running = true;
      run.started = true;
      keepAwake();
    } else {
      run.remaining[run.i] = remainingNow();
      run.running = false;
    }
    syncTimer();
  }

  function goTo(i) {
    if (run.running) run.remaining[run.i] = remainingNow();
    const wasStarted = run.started;
    run.running = false;
    if (i >= SLOTS.length) {
      run.finished = true;
      renderFinish();
      return;
    }
    run.i = Math.max(0, i);
    run.beeped = run.remaining[run.i] <= 0;
    renderRun();
    if (wasStarted) setRunning(true);
  }

  function tick() {
    if (!run || run.finished) return;
    const left = remainingNow();
    if (left <= 0 && !run.beeped) {
      run.beeped = true;
      beep();
    }
    syncTimer();
  }

  function syncTimer() {
    const t = $('#timer');
    if (!t) return;
    const left = remainingNow();
    t.textContent = fmt(left);
    t.classList.toggle('is-over', left <= 0);
    t.classList.toggle('is-paused', !run.running);
    const msg = $('#timerMsg');
    msg.textContent = left <= 0 ? 'Time\'s up! Tap Next ▶' : run.running ? '' : run.started ? 'Paused' : 'Tap Start when you\'re ready';
    msg.classList.toggle('is-over', left <= 0);
    const btn = $('#startBtn');
    btn.textContent = run.running ? '❚❚ Pause' : '▶ Start';
    btn.classList.toggle('btn-go', !run.running);
  }

  function renderRun() {
    runDiagrams.forEach(c => c.destroy());
    runDiagrams = [];
    const slot = SLOTS[run.i];
    const last = run.i === SLOTS.length - 1;
    const root = $('#run');
    root.innerHTML = `
      <div class="run-top">
        <button type="button" class="run-exit" data-action="exit" aria-label="Exit session">✕</button>
        <ol class="run-dots" aria-hidden="true">${SLOTS.map((s, i) => `<li class="${i < run.i ? 'done' : i === run.i ? 'now' : ''}"></li>`).join('')}</ol>
        <span class="run-count">Part ${run.i + 1} of ${SLOTS.length}</span>
      </div>
      <div class="run-body">
        <p class="run-slot">${slot.icon} ${esc(slot.label)} · ${slot.min} min</p>
        <h2 class="run-name">${esc(partTitle(slot))}</h2>
        <div class="timer-box">
          <p id="timer" class="timer" role="timer" aria-live="off"></p>
          <p id="timerMsg" class="timer-msg" aria-live="polite"></p>
          <div class="timer-btns">
            <button type="button" id="startBtn" class="btn btn-big" data-action="startstop"></button>
            <button type="button" class="btn btn-plus" data-action="plus1">+1 min</button>
          </div>
        </div>
        <div class="run-detail">${partHTML(session, slot, { big: true })}</div>
      </div>
      <div class="run-nav">
        <button type="button" class="btn btn-nav" data-action="back" ${run.i === 0 ? 'disabled' : ''}>◀ Back</button>
        <button type="button" class="btn btn-nav btn-primary" data-action="next">${last ? 'Finish 🎉' : 'Next ▶'}</button>
      </div>`;
    mountDiagrams(root, runDiagrams);
    $('.run-body', root).scrollTop = 0;
    syncTimer();
  }

  function renderFinish() {
    runDiagrams.forEach(c => c.destroy());
    runDiagrams = [];
    letSleep();
    $('#run').innerHTML = `
      <div class="finish">
        <p class="finish-emoji" aria-hidden="true">🎉</p>
        <h2>Great session!</h2>
        <p class="lead">Well done, coach. Next time you tap “Make a new session”, the focus moves on to the next skill.</p>
        <button type="button" class="btn btn-big btn-primary" data-action="exit">Done</button>
      </div>`;
  }

  /* ---------- coach help ---------- */
  function renderHelp() {
    $('#help').innerHTML = `
      <h1 class="help-title">Coach help</h1>
      <p class="lead">Quick reads for brand-new coaches. Tap a heading to open it.</p>
      ${HELP.map(sec => `
        <details class="card help-sec" id="help-${sec.id}">
          <summary><span class="help-icon" aria-hidden="true">${sec.icon}</span> ${esc(sec.title)}</summary>
          <p class="help-intro">${esc(sec.intro)}</p>
          <ul class="help-cards">
            ${sec.cards.map(c => `<li><h3>${esc(c.t)}</h3><p>${esc(c.d)}</p></li>`).join('')}
          </ul>
        </details>`).join('')}`;
  }

  /* ---------- tabs ---------- */
  function showTab(name) {
    const help = name === 'help';
    $('#view-session').hidden = help;
    $('#view-help').hidden = !help;
    document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === name));
    if (location.hash !== (help ? '#help' : '#session') && (help || location.hash)) {
      history.replaceState(null, '', help ? '#help' : '#session');
    }
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const tab = e.target.closest('[data-tab]');
    if (tab) { showTab(tab.dataset.tab); window.scrollTo(0, 0); return; }

    const head = e.target.closest('.part-head');
    if (head) { togglePart(head.closest('.part').dataset.part); return; }

    const swapBtn = e.target.closest('[data-swap]');
    if (swapBtn) {
      swap(session, swapBtn.dataset.swap);
      save(session);
      if (run && !$('#run').hidden) renderRun();
      else renderPlan();
      return;
    }

    const act = e.target.closest('[data-action]');
    if (!act) return;
    switch (act.dataset.action) {
      case 'generate': newSession(); break;
      case 'run': startRun(false); break;
      case 'run-restart': startRun(true); break;
      case 'exit': exitRun(); break;
      case 'startstop':
        if (!audio) {
          try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (err) { audio = null; }
        }
        if (audio && audio.state === 'suspended') audio.resume();
        setRunning(!run.running);
        break;
      case 'plus1':
        if (run.running) run.endAt += 60000;
        else run.remaining[run.i] += 60;
        if (remainingNow() > 0) run.beeped = false;
        syncTimer();
        break;
      case 'next': goTo(run.i + 1); break;
      case 'back': goTo(run.i - 1); break;
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && run && run.running) keepAwake();
  });

  renderPlan();
  renderHelp();
  showTab(location.hash === '#help' ? 'help' : 'session');
})();
