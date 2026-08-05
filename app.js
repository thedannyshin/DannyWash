(() => {
  const comeBtn = document.getElementById("come-btn");
  const summon = document.getElementById("summon");
  const map = document.getElementById("map");
  const door = document.getElementById("door");
  const doorBehind = document.getElementById("door-behind");
  const doorDanny = document.getElementById("door-danny");
  const doorDannyZoom = document.getElementById("door-danny-zoom");
  const doorBtn = document.getElementById("door-btn");
  const dannyLeft = document.getElementById("danny-left");
  const wash = document.getElementById("wash");
  const bye = document.getElementById("bye");
  const byeBtn = document.getElementById("bye-btn");
  const byeTotal = document.getElementById("bye-total");
  const danny = document.getElementById("danny");
  const status = document.getElementById("status");
  const route = document.getElementById("route");
  const doorbellAudio = document.getElementById("doorbell-audio");
  const comingAudio = document.getElementById("coming-audio");
  const tipAudio = document.getElementById("tip-audio");
  const washingAudio = document.getElementById("washing-audio");
  const knockAudio = document.getElementById("knock-audio");
  const hello2Audio = document.getElementById("hello2-audio");
  const goodbyeAudio = document.getElementById("goodbye-audio");
  const goodbyeLowtipAudio = document.getElementById("goodbye-lowtip-audio");
  const lowtipAudio = document.getElementById("lowtip-audio");
  const hightipAudio = document.getElementById("hightip-audio");
  const tipBtn = document.getElementById("tip-btn");
  const tipBursts = document.getElementById("tip-bursts");
  const tipTotal = document.getElementById("tip-total");

  // Waypoints sit on the drawn road grid (x=22/48/74, y=18/42/66/88).
  const WAYPOINTS = [
    { x: 22, y: 88 },
    { x: 22, y: 66 },
    { x: 48, y: 66 },
    { x: 48, y: 42 },
    { x: 74, y: 42 },
    { x: 74, y: 66 },
  ];

  // Face focal point in the source photo (normalized 0–1).
  const FACE = { x: 0.5, y: 0.4 };

  const DURATION_MS = 6800;
  const DOOR_OPEN_MS = 1150;
  const DOOR_CLOSE_MS = 1150;
  const HEADSHOT_HOLD_MS = 1400;
  const DOOR_NUDGE_MS = 5000;
  const LEFT_AFTER_HELLO2_MS = 2000;
  const LEFT_HOLD_MS = 2000;
  const LOWTIP_DELAY_MS = 1000;
  const LOWTIP_TO_CLOSE_MS = 1800;
  const WASH_DURATION_MS = 10000;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let started = false;
  let doorOpened = false;
  let dannyGone = false;
  let sayingGoodbye = false;
  let audioUnlocked = false;
  let washTimer = null;
  let doorNudgeTimer = null;
  let doorNudge2Timer = null;
  let leftTimer = null;
  let lowtipTimer = null;
  let tipCents = 0;
  let audioCtx = null;
  const bufferCache = new Map();
  let activeSources = [];

  function ensureAudioContext() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  async function loadBuffer(key, url) {
    if (bufferCache.has(key)) return bufferCache.get(key);
    const ctx = ensureAudioContext();
    if (!ctx) return null;
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    const buffer = await ctx.decodeAudioData(data.slice(0));
    bufferCache.set(key, buffer);
    return buffer;
  }

  function preloadDelayedSounds() {
    ensureAudioContext();
    [
      ["knock", "assets/knock.mp3"],
      ["hello2", "assets/hello2.mp3"],
      ["doorbell", "assets/doorbell.mp3"],
      ["washing", "assets/washing.mp3"],
      ["lowtip", "assets/lowtip.mp3"],
      ["hightip", "assets/hightip.mp3"],
    ].forEach(([key, url]) => {
      loadBuffer(key, url).catch(() => {});
    });
  }

  function playBuffer(key) {
    const ctx = ensureAudioContext();
    const buffer = bufferCache.get(key);
    if (!ctx || !buffer) return false;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = 1;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
    activeSources.push(source);
    source.onended = () => {
      activeSources = activeSources.filter((s) => s !== source);
    };
    return true;
  }

  function stopBufferSources() {
    for (const source of activeSources) {
      try {
        source.stop();
      } catch {
        // Ignore
      }
    }
    activeSources = [];
  }

  // Must run synchronously inside the user tap — no awaits before this.
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    ensureAudioContext();
    preloadDelayedSounds();

    // Also warm HTML elements used during later taps (tip / goodbye).
    for (const el of [tipAudio, goodbyeAudio, goodbyeLowtipAudio]) {
      try {
        el.muted = true;
        const playPromise = el.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise
            .then(() => {
              el.pause();
              el.currentTime = 0;
              el.muted = false;
            })
            .catch(() => {
              el.muted = false;
            });
        } else {
          el.pause();
          el.currentTime = 0;
          el.muted = false;
        }
      } catch {
        el.muted = false;
      }
    }
  }

  function playHtmlFallback(el) {
    try {
      el.muted = false;
      el.volume = 1;
      try {
        el.currentTime = 0;
      } catch {
        // Ignore
      }
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } catch {
      // Ignore
    }
  }

  async function playDelayed(key, fallbackEl) {
    try {
      await loadBuffer(key, fallbackEl.currentSrc || fallbackEl.src);
      if (!playBuffer(key)) playHtmlFallback(fallbackEl);
    } catch {
      playHtmlFallback(fallbackEl);
    }
  }

  function playComing() {
    try {
      comingAudio.muted = false;
      comingAudio.volume = 1;
      const start = () => {
        try {
          comingAudio.currentTime = 0;
        } catch {
          // Ignore seek errors before ready
        }
        const playPromise = comingAudio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      };

      if (comingAudio.readyState >= 2) {
        start();
      } else {
        comingAudio.addEventListener("canplay", start, { once: true });
        comingAudio.load();
        const playPromise = comingAudio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      }
    } catch {
      // Ignore playback failures
    }
  }

  function stopComing() {
    try {
      comingAudio.pause();
      comingAudio.currentTime = 0;
    } catch {
      // Ignore
    }
  }

  function playDingDong() {
    stopComing();
    playDelayed("doorbell", doorbellAudio);
  }

  function playTip() {
    try {
      // Clone so rapid taps can overlap instead of cutting each other off.
      const sfx = tipAudio.cloneNode(true);
      sfx.muted = false;
      const playPromise = sfx.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            sfx.addEventListener("ended", () => sfx.remove(), { once: true });
          })
          .catch(() => {
            sfx.remove();
          });
      }
    } catch {
      // Ignore playback failures
    }
  }

  function playWashing() {
    playDelayed("washing", washingAudio);
  }

  function stopWashing() {
    stopBufferSources();
    try {
      washingAudio.pause();
      washingAudio.currentTime = 0;
    } catch {
      // Ignore
    }
  }

  function playKnock() {
    playDelayed("knock", knockAudio);
  }

  function playHello2() {
    // Stop first hello so the second one isn't blocked/interrupted.
    stopKnock();
    playDelayed("hello2", hello2Audio);
  }

  function playLowTip() {
    playDelayed("lowtip", lowtipAudio);
  }

  function playHighTip() {
    playDelayed("hightip", hightipAudio);
  }

  function clearDoorNudge() {
    if (doorNudgeTimer) {
      window.clearTimeout(doorNudgeTimer);
      doorNudgeTimer = null;
    }
    if (doorNudge2Timer) {
      window.clearTimeout(doorNudge2Timer);
      doorNudge2Timer = null;
    }
    if (leftTimer) {
      window.clearTimeout(leftTimer);
      leftTimer = null;
    }
  }

  function showDannyLeft() {
    if (sayingGoodbye) return;
    door.classList.add("is-left");
    doorBtn.disabled = true;
    dannyLeft.hidden = false;
    leftTimer = window.setTimeout(() => {
      leftTimer = null;
      resetToStart();
    }, reduceMotion ? 800 : LEFT_HOLD_MS);
  }

  function stopKnock() {
    stopBufferSources();
    try {
      knockAudio.pause();
      knockAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    try {
      hello2Audio.pause();
      hello2Audio.currentTime = 0;
    } catch {
      // Ignore
    }
  }

  function playGoodbye() {
    const el = tipCents < 100 ? goodbyeLowtipAudio : goodbyeAudio;
    const times = tipCents === 0 ? 2 : 1;

    const playOnce = () => {
      try {
        el.muted = false;
        el.currentTime = 0;
        const playPromise = el.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      } catch {
        // Ignore playback failures
      }
    };

    el.onended = null;
    if (times > 1) {
      let remaining = times - 1;
      el.onended = () => {
        if (remaining <= 0) {
          el.onended = null;
          return;
        }
        remaining -= 1;
        playOnce();
      };
    }
    playOnce();
  }

  function stopGoodbye() {
    for (const el of [goodbyeAudio, goodbyeLowtipAudio]) {
      try {
        el.onended = null;
        el.pause();
        el.currentTime = 0;
      } catch {
        // Ignore
      }
    }
  }

  function formatTipTotal(cents) {
    return `$${(cents / 100).toFixed(2)} given`;
  }

  function updateTipTotal() {
    tipTotal.textContent = formatTipTotal(tipCents);
    tipTotal.classList.remove("is-bump");
    void tipTotal.offsetWidth;
    tipTotal.classList.add("is-bump");
  }

  function spawnSixCents(clientX, clientY) {
    tipCents += 6;
    updateTipTotal();

    const bounds = tipBursts.getBoundingClientRect();
    const originX = clientX - bounds.left;
    const originY = clientY - bounds.top;
    const count = reduceMotion ? 1 : 5;

    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "tip-cent";
      el.textContent = "6¢";
      const drift = (Math.random() * 110 - 55) * (reduceMotion ? 0 : 1);
      const spin = `${Math.random() * 36 - 18}deg`;
      const delay = reduceMotion ? 0 : i * 55;
      el.style.setProperty("--x", `${originX + drift * 0.2}px`);
      el.style.setProperty("--y", `${originY - i * 10}px`);
      el.style.setProperty("--drift", `${drift}px`);
      el.style.setProperty("--spin", spin);
      el.style.animationDelay = `${delay}ms`;
      tipBursts.appendChild(el);
      window.setTimeout(() => el.remove(), 1300 + delay);
    }
  }

  function layoutDoorFace() {
    const iw = doorDanny.naturalWidth;
    const ih = doorDanny.naturalHeight;
    if (!iw || !ih) return;

    const cw = doorBehind.clientWidth;
    const ch = doorBehind.clientHeight;
    if (!cw || !ch) return;

    // Fit the photo inside the viewport (contain), centered on the face.
    const fit = Math.min(cw / iw, ch / ih);
    const w = iw * fit;
    const h = ih * fit;
    const left = cw / 2 - FACE.x * w;
    const top = ch / 2 - FACE.y * h;

    doorDanny.style.width = `${w}px`;
    doorDanny.style.height = `${h}px`;
    doorDanny.style.left = `${left}px`;
    doorDanny.style.top = `${top}px`;
  }

  function dist(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.hypot(dx, dy);
  }

  function buildRouteMetrics(points) {
    const segments = [];
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const length = dist(points[i], points[i + 1]);
      segments.push({ from: points[i], to: points[i + 1], length, start: total });
      total += length;
    }
    return { segments, total };
  }

  function pointAlongRoute(metrics, distance) {
    const d = Math.max(0, Math.min(distance, metrics.total));
    for (const seg of metrics.segments) {
      if (d <= seg.start + seg.length || seg === metrics.segments[metrics.segments.length - 1]) {
        const t = seg.length === 0 ? 0 : (d - seg.start) / seg.length;
        return {
          x: seg.from.x + (seg.to.x - seg.from.x) * t,
          y: seg.from.y + (seg.to.y - seg.from.y) * t,
        };
      }
    }
    return metrics.segments[metrics.segments.length - 1].to;
  }

  function buildRoutePath(points) {
    const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    route.setAttribute("d", d);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function setDannyPos(point) {
    danny.style.left = `${point.x}%`;
    danny.style.top = `${point.y}%`;
  }

  function animateDanny(metrics) {
    danny.classList.add("is-moving");
    const end = WAYPOINTS[WAYPOINTS.length - 1];

    if (reduceMotion) {
      setDannyPos(end);
      finishArrival();
      return;
    }

    const startTime = performance.now();

    function frame(now) {
      const raw = Math.min(1, (now - startTime) / DURATION_MS);
      const t = easeInOutCubic(raw);
      setDannyPos(pointAlongRoute(metrics, metrics.total * t));

      if (raw < 1) {
        requestAnimationFrame(frame);
      } else {
        finishArrival();
      }
    }

    requestAnimationFrame(frame);
  }

  function showDoor() {
    map.hidden = true;
    door.hidden = false;
    dannyGone = false;
    doorDannyZoom.style.animation = "none";
    // Force reflow so zoom can replay next open.
    void doorDannyZoom.offsetWidth;
    doorDannyZoom.style.animation = "";
    layoutDoorFace();
    requestAnimationFrame(layoutDoorFace);
    clearDoorNudge();
    doorNudgeTimer = window.setTimeout(() => {
      doorNudgeTimer = null;
      if (doorOpened) return;
      playKnock();
      doorNudge2Timer = window.setTimeout(() => {
        doorNudge2Timer = null;
        if (doorOpened) return;
        playHello2();
        leftTimer = window.setTimeout(() => {
          leftTimer = null;
          // Danny leaves — stay on the closed door until the user opens it.
          if (!doorOpened) dannyGone = true;
        }, LEFT_AFTER_HELLO2_MS);
      }, DOOR_NUDGE_MS);
    }, DOOR_NUDGE_MS);
  }

  function showWash() {
    door.hidden = true;
    wash.hidden = false;
    playWashing();
    if (washTimer) window.clearTimeout(washTimer);
    washTimer = window.setTimeout(showBye, reduceMotion ? 1500 : WASH_DURATION_MS);
  }

  function showBye() {
    if (washTimer) {
      window.clearTimeout(washTimer);
      washTimer = null;
    }
    stopWashing();
    tipBursts.replaceChildren();
    wash.hidden = true;
    byeTotal.textContent = `${formatTipTotal(tipCents).replace(" given", "")} tipped`;
    bye.hidden = false;

    if (tipCents < 100) {
      byeBtn.hidden = true;
      byeBtn.disabled = true;
      if (lowtipTimer) window.clearTimeout(lowtipTimer);
      lowtipTimer = window.setTimeout(() => {
        playLowTip();
        lowtipTimer = window.setTimeout(() => {
          lowtipTimer = null;
          closeDoorAndLeave();
        }, LOWTIP_TO_CLOSE_MS);
      }, LOWTIP_DELAY_MS);
    } else {
      byeBtn.hidden = false;
      byeBtn.disabled = false;
      if (tipCents > 200) {
        if (lowtipTimer) window.clearTimeout(lowtipTimer);
        lowtipTimer = window.setTimeout(() => {
          lowtipTimer = null;
          playHighTip();
        }, LOWTIP_DELAY_MS);
      }
    }
  }

  function resetToStart() {
    if (washTimer) {
      window.clearTimeout(washTimer);
      washTimer = null;
    }
    if (lowtipTimer) {
      window.clearTimeout(lowtipTimer);
      lowtipTimer = null;
    }

    wash.hidden = true;
    bye.hidden = true;
    door.hidden = true;
    map.hidden = true;
    summon.hidden = false;
    tipBursts.replaceChildren();
    tipBtn.classList.remove("is-pressed");
    tipCents = 0;
    tipTotal.textContent = formatTipTotal(0);
    tipTotal.classList.remove("is-bump");
    stopComing();
    stopWashing();
    stopKnock();
    stopGoodbye();
    clearDoorNudge();
    try {
      doorbellAudio.pause();
      doorbellAudio.currentTime = 0;
    } catch {
      // Ignore
    }

    door.classList.remove("is-open");
    door.classList.remove("is-left");
    doorBtn.setAttribute("aria-expanded", "false");
    doorBtn.disabled = false;
    dannyLeft.hidden = true;
    doorDannyZoom.style.animation = "none";
    danny.classList.remove("is-moving", "is-arrived");
    setDannyPos(WAYPOINTS[0]);
    status.textContent = "Danny is coming to wash!";
    status.classList.remove("is-arrived");
    route.removeAttribute("d");

    started = false;
    doorOpened = false;
    dannyGone = false;
    sayingGoodbye = false;
    comeBtn.disabled = false;
    comeBtn.classList.remove("is-pressed");
    byeBtn.classList.remove("is-pressed");
    byeBtn.disabled = false;
    byeBtn.hidden = false;
  }

  function closeDoorAndLeave() {
    if (sayingGoodbye) return;
    sayingGoodbye = true;
    if (lowtipTimer) {
      window.clearTimeout(lowtipTimer);
      lowtipTimer = null;
    }
    byeBtn.disabled = true;
    byeBtn.hidden = true;
    bye.hidden = true;
    door.hidden = false;
    door.classList.remove("is-left");
    dannyLeft.hidden = true;
    doorDannyZoom.style.animation = "none";
    door.classList.add("is-open");
    doorBtn.setAttribute("aria-expanded", "true");
    layoutDoorFace();

    // Start open, then slam shut with the goodbye clip.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        playGoodbye();
        door.classList.remove("is-open");
        doorBtn.setAttribute("aria-expanded", "false");
      });
    });

    if (tipCents === 0) {
      const closeWait = reduceMotion ? 500 : Math.max(DOOR_CLOSE_MS, 2600);
      window.setTimeout(() => {
        door.classList.add("is-left");
        doorBtn.disabled = true;
        dannyLeft.hidden = false;
        window.setTimeout(resetToStart, reduceMotion ? 800 : LEFT_HOLD_MS);
      }, closeWait);
      return;
    }

    const wait = reduceMotion ? 500 : Math.max(DOOR_CLOSE_MS, 1700);
    window.setTimeout(resetToStart, wait);
  }

  function finishArrival() {
    danny.classList.remove("is-moving");
    danny.classList.add("is-arrived");
    status.textContent = "He's here.";
    status.classList.add("is-arrived");
    playDingDong();
    window.setTimeout(showDoor, reduceMotion ? 400 : 1100);
  }

  function showMap() {
    summon.hidden = true;
    map.hidden = false;
    buildRoutePath(WAYPOINTS);
    const metrics = buildRouteMetrics(WAYPOINTS);
    setDannyPos(WAYPOINTS[0]);
    animateDanny(metrics);
  }

  function openDoor() {
    if (doorOpened || sayingGoodbye) return;
    clearDoorNudge();
    stopKnock();

    if (dannyGone) {
      doorOpened = true;
      showDannyLeft();
      return;
    }

    doorOpened = true;
    layoutDoorFace();
    door.classList.add("is-open");
    doorBtn.setAttribute("aria-expanded", "true");
    const wait = reduceMotion ? 600 : DOOR_OPEN_MS + HEADSHOT_HOLD_MS;
    window.setTimeout(showWash, wait);
  }

  comeBtn.addEventListener("pointerdown", () => {
    comeBtn.classList.add("is-pressed");
  });

  comeBtn.addEventListener("pointerup", () => {
    comeBtn.classList.remove("is-pressed");
  });

  comeBtn.addEventListener("pointerleave", () => {
    comeBtn.classList.remove("is-pressed");
  });

  comeBtn.addEventListener("click", () => {
    if (started) return;
    started = true;
    comeBtn.disabled = true;

    // Start the car/coming track first so mobile doesn't drop it
    // behind muted unlock plays for the other SFX.
    playComing();
    unlockAudio();
    showMap();
  });

  doorBtn.addEventListener("click", openDoor);

  tipBtn.addEventListener("pointerdown", () => {
    tipBtn.classList.add("is-pressed");
  });

  tipBtn.addEventListener("pointerup", () => {
    tipBtn.classList.remove("is-pressed");
  });

  tipBtn.addEventListener("pointerleave", () => {
    tipBtn.classList.remove("is-pressed");
  });

  tipBtn.addEventListener("pointercancel", () => {
    tipBtn.classList.remove("is-pressed");
  });

  tipBtn.addEventListener("click", (event) => {
    const rect = tipBtn.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    playTip();
    spawnSixCents(x, y);
  });

  byeBtn.addEventListener("pointerdown", () => {
    byeBtn.classList.add("is-pressed");
  });

  byeBtn.addEventListener("pointerup", () => {
    byeBtn.classList.remove("is-pressed");
  });

  byeBtn.addEventListener("pointerleave", () => {
    byeBtn.classList.remove("is-pressed");
  });

  byeBtn.addEventListener("click", closeDoorAndLeave);

  if (doorDanny.complete) {
    layoutDoorFace();
  } else {
    doorDanny.addEventListener("load", layoutDoorFace);
  }

  window.addEventListener("resize", layoutDoorFace);
  window.addEventListener("orientationchange", () => {
    window.setTimeout(layoutDoorFace, 100);
  });
})();
