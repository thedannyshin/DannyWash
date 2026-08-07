(() => {
  const comeBtn = document.getElementById("come-btn");
  const tryCrashBtn = document.getElementById("try-crash-btn");
  const summon = document.getElementById("summon");
  const map = document.getElementById("map");
  const door = document.getElementById("door");
  const doorBehind = document.getElementById("door-behind");
  const doorDanny = document.getElementById("door-danny");
  const doorDannyZoom = document.getElementById("door-danny-zoom");
  const doorWave = document.getElementById("door-wave");
  const doorBtn = document.getElementById("door-btn");
  const doorHello = document.getElementById("door-hello");
  const dannyLeft = document.getElementById("danny-left");
  const died = document.getElementById("died");
  const diedWipe = document.getElementById("died-wipe");
  const flowersBtn = document.getElementById("flowers-btn");
  const flowerBursts = document.getElementById("flower-bursts");
  const wash = document.getElementById("wash");
  const bye = document.getElementById("bye");
  const byeBtn = document.getElementById("bye-btn");
  const byeTotal = document.getElementById("bye-total");
  const rate = document.getElementById("rate");
  const rateForm = document.getElementById("rate-form");
  const rateOutcome = document.getElementById("rate-outcome");
  const rateStars = document.getElementById("rate-stars");
  const rateComment = document.getElementById("rate-comment");
  const rateSubmit = document.getElementById("rate-submit");
  const rateRejected = document.getElementById("rate-rejected");
  const rateThanks = document.getElementById("rate-thanks");
  const rateBurst = document.getElementById("rate-burst");
  const danny = document.getElementById("danny");
  const status = document.getElementById("status");
  const route = document.getElementById("route");
  const doorbellAudio = document.getElementById("doorbell-audio");
  const comingAudio = document.getElementById("coming-audio");
  const tipAudio = document.getElementById("tip-audio");
  const washingAudio = document.getElementById("washing-audio");
  const knockAudio = document.getElementById("knock-audio");
  const helloKnockAudio = document.getElementById("hello-knock-audio");
  const hello2Audio = document.getElementById("hello2-audio");
  const goodbyeAudio = document.getElementById("goodbye-audio");
  const goodbyeLowtipAudio = document.getElementById("goodbye-lowtip-audio");
  const lowtipAudio = document.getElementById("lowtip-audio");
  const hightipAudio = document.getElementById("hightip-audio");
  const hightip2Audio = document.getElementById("hightip2-audio");
  const slamAudio = document.getElementById("slam-audio");
  const washLine1Audio = document.getElementById("wash-line1-audio");
  const washLine2Audio = document.getElementById("wash-line2-audio");
  const arriveAudio = document.getElementById("arrive-audio");
  const doorKnockAudio = document.getElementById("door-knock-audio");
  const openDoorAudio = document.getElementById("open-door-audio");
  const crashAudio = document.getElementById("crash-audio");
  const plateBreakAudio = document.getElementById("plate-break-audio");
  const dannyLeftAudio = document.getElementById("danny-left-audio");
  const celebrateAudio = document.getElementById("celebrate-audio");
  const washGif = document.getElementById("wash-gif");
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
  const CRASH_CHANCE = 0.18;
  // Coast until the black screen (~2.5s into crash SFX).
  const CRASH_MS = 2500;
  const CRASH_SLOWDOWN_MS = CRASH_MS;
  const CRASH_CROSSFADE_MS = 700;
  const DIED_CRASH_HOLD_MS = 2600;
  const DIED_FACE_FADE_MS = 1400;
  const DIED_WIPE_DELAY_MS = 400;
  const DIED_WIPE_MS = 14000;
  const DOOR_OPEN_MS = 1150;
  const DOOR_CLOSE_MS = 1150;
  const DOOR_SLAM_AT_MS = 420;
  const HEADSHOT_HOLD_MS = 1400;
  const HELLO_GAP_MIN_MS = 2000;
  const HELLO_GAP_MAX_MS = 5000;
  const HELLO_KNOCK_MS = 1350;
  const DOORBELL_MS = 3500;
  const ARRIVE_LINE_MS = 1500;
  const DOOR_KNOCK_MS = 4300;
  const DOOR_KNOCK_CLIP_MS = 1150;
  const RETHINK_OPEN_DOOR_GAP_MS = 2000;
  const ANGRY_LEAVE_THRESHOLD = 3;
  const LEAVE_AFTER_FIRST_MIN_MS = 500;
  const LEAVE_AFTER_FIRST_MAX_MS = 12000;
  const LEFT_HOLD_MS = 2000;
  const LEFT_STING_HOLD_MS = 9500;
  const LEFT_STING_DELAY_MS = 500;
  const LEFT_STING_FADE_MS = 1200;
  const LOWTIP_DELAY_MS = 1000;
  const LOWTIP_TO_CLOSE_MS = 1800;
  const LOWTIP_MS = 1600;
  const HIGHTIP_DELAY_MS = 350;
  const HIGHTIP_MS = 1050;
  const CELEBRATE_MS = 16000;
  const WASH_DURATION_MS = 10000;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let started = false;
  let doorOpened = false;
  let dannyGone = false;
  let hello2Done = false;
  let angryVisit = false;
  let sayingGoodbye = false;
  let audioUnlocked = false;
  let washTimer = null;
  let washEnterTimer = null;
  let canRethinkDoor = false;
  let rethinkKnockTimer = null;
  let doorNudgeTimer = null;
  let doorNudge2Timer = null;
  let helloKnockTimer = null;
  let leftTimer = null;
  let dannyLeftStingTimer = null;
  let dannyLeftFadeRaf = null;
  let lowtipTimer = null;
  let tipCents = 0;
  let ratingStars = 0;
  let dannyLeftCount = 0;
  let lowtipPlayed = false;
  let lowtipStartedAt = 0;
  let tipVolume = 1;
  let washLineTimers = [];
  let washLineDuckCount = 0;
  let gifHightipDuckCount = 0;
  let activeTipSfx = [];
  let tripId = 0;
  let crashResetTimer = null;
  let diedWipeTimer = null;
  let forceCrashNext = false;
  let comingFadeRaf = null;
  let audioCtx = null;
  const bufferCache = new Map();
  let activeSources = [];
  let activeGains = [];

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
      ["helloknock", "assets/hello-knock.mp3"],
      ["hello2", "assets/hello2.mp3"],
      ["doorbell", "assets/doorbell.mp3"],
      ["washing", "assets/washing.mp3"],
      ["lowtip", "assets/lowtip.mp3"],
      ["hightip", "assets/hightip.mp3"],
      ["hightip2", "assets/hightip2.mp3"],
      ["slam", "assets/slam.mp3"],
      ["washline1", "assets/wash-line1.mp3"],
      ["washline2", "assets/wash-line2.mp3"],
      ["arrive", "assets/arrive.mp3"],
      ["doorknock", "assets/door-knock.mp3"],
      ["opendoor", "assets/open-door.mp3"],
      ["crash", "assets/crash.mp3"],
      ["platebreak", "assets/plate-break.mp3"],
      ["dannyleft", "assets/danny-left.mp3"],
    ].forEach(([key, url]) => {
      loadBuffer(key, url).catch(() => {});
    });
  }

  function playBuffer(key, { volume = 1, duckable = true } = {}) {
    const ctx = ensureAudioContext();
    const buffer = bufferCache.get(key);
    if (!ctx || !buffer) return false;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const bedLevel = duckable && gifHightipDuckCount > 0 ? 0.12 : 1;
    gain.gain.value = volume * bedLevel;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
    activeSources.push(source);
    if (duckable) activeGains.push(gain);
    source.onended = () => {
      activeSources = activeSources.filter((s) => s !== source);
      activeGains = activeGains.filter((g) => g !== gain);
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
    activeGains = [];
  }

  function setBedVolume(level) {
    washLine1Audio.volume = level;
    washLine2Audio.volume = level;
    for (const gain of activeGains) {
      try {
        gain.gain.value = level;
      } catch {
        // Ignore
      }
    }
    setTipVolume(washLineDuckCount > 0 || gifHightipDuckCount > 0 ? Math.min(level, 0.12) : level);
  }

  function duckBedForGifHightip(on) {
    if (on) {
      gifHightipDuckCount += 1;
      setBedVolume(0.12);
    } else {
      gifHightipDuckCount = Math.max(0, gifHightipDuckCount - 1);
      if (gifHightipDuckCount === 0) {
        washLine1Audio.volume = 1;
        washLine2Audio.volume = 1;
        for (const gain of activeGains) {
          try {
            gain.gain.value = 1;
          } catch {
            // Ignore
          }
        }
        setTipVolume(washLineDuckCount > 0 ? 0.12 : 1);
      }
    }
  }

  function playGifHightip() {
    try {
      // Clone so spam-clicks can overlap instead of cutting each other off.
      const sfx = hightipAudio.cloneNode(true);
      sfx.muted = false;
      sfx.volume = 0.45;
      const cleanup = () => sfx.remove();
      const playPromise = sfx.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            sfx.addEventListener("ended", cleanup, { once: true });
          })
          .catch(cleanup);
      } else {
        cleanup();
      }
    } catch {
      // Ignore
    }
  }

  function playPlateBreak() {
    playDelayed("platebreak", plateBreakAudio, { volume: 0.4, duckable: false });
    try {
      plateBreakAudio.volume = 0.4;
    } catch {
      // Ignore
    }
  }

  // Must run synchronously inside the user tap — no awaits before this.
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    ensureAudioContext();
    preloadDelayedSounds();

    // Also warm HTML elements used during later taps (tip / goodbye).
    for (const el of [tipAudio, goodbyeAudio, goodbyeLowtipAudio, slamAudio, washLine1Audio, washLine2Audio, arriveAudio, hightipAudio, plateBreakAudio, dannyLeftAudio, celebrateAudio]) {
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

  async function playDelayed(key, fallbackEl, opts) {
    try {
      await loadBuffer(key, fallbackEl.currentSrc || fallbackEl.src);
      if (!playBuffer(key, opts)) playHtmlFallback(fallbackEl);
    } catch {
      playHtmlFallback(fallbackEl);
    }
  }

  function playComing() {
    cancelComingFade();
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

  function cancelComingFade() {
    if (comingFadeRaf) {
      cancelAnimationFrame(comingFadeRaf);
      comingFadeRaf = null;
    }
  }

  function stopComing() {
    cancelComingFade();
    try {
      comingAudio.pause();
      comingAudio.currentTime = 0;
      comingAudio.volume = 1;
    } catch {
      // Ignore
    }
  }

  function crossfadeComingToCrash() {
    cancelComingFade();
    const fadeMs = reduceMotion ? 0 : CRASH_CROSSFADE_MS;

    try {
      crashAudio.pause();
      crashAudio.muted = false;
      crashAudio.volume = fadeMs <= 0 ? 1 : 0;
      crashAudio.currentTime = 0;
      const playPromise = crashAudio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } catch {
      // Ignore
    }

    if (fadeMs <= 0) {
      stopComing();
      try {
        crashAudio.volume = 1;
      } catch {
        // Ignore
      }
      return;
    }

    const start = performance.now();
    let comingStartVol = 1;
    try {
      comingStartVol = Math.max(0.001, comingAudio.volume || 1);
    } catch {
      // Ignore
    }

    const tick = (now) => {
      const t = Math.min(1, (now - start) / fadeMs);
      const eased = t * t * (3 - 2 * t);
      try {
        if (!comingAudio.paused) comingAudio.volume = comingStartVol * (1 - eased);
        crashAudio.volume = eased;
      } catch {
        // Ignore
      }
      if (t < 1) {
        comingFadeRaf = requestAnimationFrame(tick);
      } else {
        comingFadeRaf = null;
        try {
          comingAudio.pause();
          comingAudio.currentTime = 0;
          comingAudio.volume = 1;
        } catch {
          // Ignore
        }
      }
    };
    comingFadeRaf = requestAnimationFrame(tick);
  }

  function playDingDong() {
    stopComing();
    playDelayed("doorbell", doorbellAudio);
  }

  function setTipVolume(level) {
    tipVolume = level;
    tipAudio.volume = level;
    for (const sfx of activeTipSfx) {
      try {
        sfx.volume = level;
      } catch {
        // Ignore
      }
    }
  }

  function duckTipForWashLine(on) {
    if (on) {
      washLineDuckCount += 1;
      setTipVolume(0.12);
    } else {
      washLineDuckCount = Math.max(0, washLineDuckCount - 1);
      if (washLineDuckCount === 0) setTipVolume(1);
    }
  }

  function clearWashLineTimers() {
    for (const id of washLineTimers) window.clearTimeout(id);
    washLineTimers = [];
    washLineDuckCount = 0;
    gifHightipDuckCount = 0;
    washingAudio.volume = 1;
    washLine1Audio.volume = 1;
    washLine2Audio.volume = 1;
    setTipVolume(1);
  }

  function playTip() {
    try {
      // Clone so rapid taps can overlap instead of cutting each other off.
      const sfx = tipAudio.cloneNode(true);
      sfx.muted = false;
      sfx.volume = tipVolume;
      activeTipSfx.push(sfx);
      const cleanup = () => {
        activeTipSfx = activeTipSfx.filter((s) => s !== sfx);
        sfx.remove();
      };
      const playPromise = sfx.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            sfx.addEventListener("ended", cleanup, { once: true });
          })
          .catch(cleanup);
      }
    } catch {
      // Ignore playback failures
    }
  }

  function playWashing() {
    // Keep wash BGM unduckable so GIF clicks don't lower it.
    try {
      washingAudio.volume = 1;
    } catch {
      // Ignore
    }
    playDelayed("washing", washingAudio, { duckable: false, volume: 1.75 });
  }

  function stopWashing() {
    clearWashLineTimers();
    stopBufferSources();
    try {
      washingAudio.pause();
      washingAudio.currentTime = 0;
    } catch {
      // Ignore
    }
  }

  async function playWashLine(key, fallbackEl, durationMs) {
    duckTipForWashLine(true);
    try {
      await playDelayed(key, fallbackEl);
    } catch {
      // Ignore
    }
    window.setTimeout(() => {
      duckTipForWashLine(false);
    }, durationMs);
  }

  function scheduleWaveLines() {
    // Wash line voice clips disabled.
  }

  function showDoorWave() {
    if (!doorWave) return;
    doorWave.hidden = false;
    if (!reduceMotion) doorWave.classList.add("is-waving");
    scheduleWaveLines();
  }

  function flashDoorHello() {
    if (!doorHello || doorOpened || door.hidden) return;
    const angle = Math.round(-22 + Math.random() * 44);
    doorHello.style.setProperty("--hello-rot", `${angle}deg`);
    doorHello.classList.remove("is-on");
    // Restart the pop so rapid hellos still animate.
    void doorHello.offsetWidth;
    doorHello.classList.add("is-on");
  }

  function clearDoorHello() {
    if (!doorHello) return;
    doorHello.classList.remove("is-on");
  }

  function clearHelloKnockTimer() {
    if (helloKnockTimer) {
      window.clearTimeout(helloKnockTimer);
      helloKnockTimer = null;
    }
  }

  function playHelloDoorKnock() {
    playDelayed("helloknock", helloKnockAudio);
  }

  function playKnock() {
    clearHelloKnockTimer();
    playHelloDoorKnock();
    helloKnockTimer = window.setTimeout(() => {
      helloKnockTimer = null;
      playDelayed("knock", knockAudio);
      flashDoorHello();
    }, HELLO_KNOCK_MS);
  }

  function playHello2() {
    // Stop first hello so the second one isn't blocked/interrupted.
    stopKnock();
    playHelloDoorKnock();
    helloKnockTimer = window.setTimeout(() => {
      helloKnockTimer = null;
      playDelayed("hello2", hello2Audio);
      flashDoorHello();
    }, HELLO_KNOCK_MS);
  }

  function playDoorKnock() {
    playDelayed("doorknock", doorKnockAudio);
  }

  function playOpenDoorLine() {
    playDelayed("opendoor", openDoorAudio);
  }

  function playCrash() {
    playDelayed("crash", crashAudio);
  }

  function playLowTip() {
    lowtipPlayed = true;
    lowtipStartedAt = performance.now();
    playDelayed("lowtip", lowtipAudio);
  }

  function whenLowtipDone(callback) {
    if (!lowtipPlayed) {
      lowtipPlayed = true;
      lowtipStartedAt = performance.now();
      try {
        lowtipAudio.onended = null;
        lowtipAudio.muted = false;
        lowtipAudio.currentTime = 0;
        const playPromise = lowtipAudio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      } catch {
        // Ignore
      }
      lowtipAudio.onended = () => {
        lowtipAudio.onended = null;
        callback();
      };
      return;
    }

    const remaining = Math.max(0, LOWTIP_MS - (performance.now() - lowtipStartedAt));
    window.setTimeout(callback, remaining);
  }

  function playGoodbyeLowtipVoice() {
    const el = goodbyeLowtipAudio;

    const playOnce = (audioEl) => {
      try {
        audioEl.muted = false;
        audioEl.currentTime = 0;
        const playPromise = audioEl.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      } catch {
        // Ignore
      }
    };

    el.onended = null;
    lowtipAudio.onended = null;

    // $0 leave: lowtip then goodbye-lowtip — skip lowtip if it already played this round.
    if (tipCents === 0 && !lowtipPlayed) {
      lowtipPlayed = true;
      lowtipAudio.onended = () => {
        lowtipAudio.onended = null;
        playOnce(el);
      };
      playOnce(lowtipAudio);
      return;
    }

    playOnce(el);
  }

  function playHighTip() {
    playDelayed("hightip", hightipAudio);
  }

  function playHighTipIntro() {
    playDelayed("hightip2", hightip2Audio);
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
    clearHelloKnockTimer();
    clearRethinkKnockTimer();
    if (leftTimer) {
      window.clearTimeout(leftTimer);
      leftTimer = null;
    }
  }

  function clearRethinkKnockTimer() {
    if (rethinkKnockTimer) {
      window.clearTimeout(rethinkKnockTimer);
      rethinkKnockTimer = null;
    }
  }

  function randomMs(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  function markDannyGone() {
    if (doorOpened || dannyGone) return;
    dannyGone = true;
    // Cancel any pending hellos so nothing plays after he leaves.
    if (doorNudge2Timer) {
      window.clearTimeout(doorNudge2Timer);
      doorNudge2Timer = null;
    }
  }

  function scheduleRepeatedHello2() {
    let hello2Count = 0;
    const maxHello2 = 2;

    function scheduleNext() {
      if (hello2Count >= maxHello2) return;
      doorNudge2Timer = window.setTimeout(() => {
        doorNudge2Timer = null;
        if (doorOpened || dannyGone) return;
        playHello2();
        hello2Count += 1;
        if (hello2Count >= maxHello2) {
          // Both second hellos played and he's still here — he stayed.
          hello2Done = true;
          if (leftTimer) {
            window.clearTimeout(leftTimer);
            leftTimer = null;
          }
          return;
        }
        scheduleNext();
      }, randomMs(HELLO_GAP_MIN_MS, HELLO_GAP_MAX_MS));
    }

    scheduleNext();
  }

  function scheduleDannyLeave() {
    leftTimer = window.setTimeout(() => {
      leftTimer = null;
      markDannyGone();
    }, randomMs(LEAVE_AFTER_FIRST_MIN_MS, LEAVE_AFTER_FIRST_MAX_MS));
  }

  function playArrive() {
    playDelayed("arrive", arriveAudio);
  }

  function startAngryDoorKnocks() {
    clearDoorNudge();
    dannyGone = false;
    hello2Done = false;
    angryVisit = true;
    // One angry visit per streak — reset so it won't repeat until 3 leaves again.
    dannyLeftCount = 0;
    // First knock as soon as the door shows, then wait 2–5s, second knock, then lowtip.
    playDoorKnock();
    doorNudgeTimer = window.setTimeout(() => {
      doorNudgeTimer = null;
      if (doorOpened || sayingGoodbye) return;
      playDoorKnock();
      doorNudgeTimer = window.setTimeout(() => {
        doorNudgeTimer = null;
        if (doorOpened || sayingGoodbye) return;
        playLowTip();
      }, DOOR_KNOCK_MS);
    }, DOOR_KNOCK_MS + randomMs(HELLO_GAP_MIN_MS, HELLO_GAP_MAX_MS));
  }

  function startDoorHellos() {
    clearDoorNudge();
    dannyGone = false;
    hello2Done = false;
    angryVisit = false;
    if (dannyLeftCount >= ANGRY_LEAVE_THRESHOLD) {
      startAngryDoorKnocks();
      return;
    }
    // Doorbell, then immediately "Danny Wash here", then the usual wait, then first hello.
    playDingDong();
    doorNudgeTimer = window.setTimeout(() => {
      doorNudgeTimer = null;
      if (doorOpened) return;
      playArrive();
      doorNudgeTimer = window.setTimeout(() => {
        doorNudgeTimer = null;
        if (doorOpened) return;
        playKnock();
        scheduleDannyLeave();
        scheduleRepeatedHello2();
      }, ARRIVE_LINE_MS + randomMs(HELLO_GAP_MIN_MS, HELLO_GAP_MAX_MS));
    }, DOORBELL_MS);
  }

  function playDannyLeftSting({ delayMs = LEFT_STING_DELAY_MS, onEnded = null } = {}) {
    stopDannyLeftSting();
    dannyLeftAudio.onended = null;
    dannyLeftStingTimer = window.setTimeout(() => {
      dannyLeftStingTimer = null;
      try {
        dannyLeftAudio.muted = false;
        dannyLeftAudio.volume = 0;
        dannyLeftAudio.currentTime = 0;
        if (typeof onEnded === "function") {
          dannyLeftAudio.onended = () => {
            dannyLeftAudio.onended = null;
            onEnded();
          };
        }
        const playPromise = dannyLeftAudio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      } catch {
        // Ignore
      }

      const fadeMs = reduceMotion ? 0 : LEFT_STING_FADE_MS;
      if (fadeMs <= 0) {
        dannyLeftAudio.volume = 1;
        return;
      }

      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / fadeMs);
        try {
          dannyLeftAudio.volume = t;
        } catch {
          // Ignore
        }
        if (t < 1) {
          dannyLeftFadeRaf = requestAnimationFrame(tick);
        } else {
          dannyLeftFadeRaf = null;
        }
      };
      dannyLeftFadeRaf = requestAnimationFrame(tick);
    }, Math.max(0, delayMs));
  }

  function stopDannyLeftSting() {
    if (dannyLeftStingTimer) {
      window.clearTimeout(dannyLeftStingTimer);
      dannyLeftStingTimer = null;
    }
    if (dannyLeftFadeRaf) {
      cancelAnimationFrame(dannyLeftFadeRaf);
      dannyLeftFadeRaf = null;
    }
    try {
      dannyLeftAudio.onended = null;
      dannyLeftAudio.pause();
      dannyLeftAudio.currentTime = 0;
      dannyLeftAudio.volume = 1;
    } catch {
      // Ignore
    }
  }

  function showDannyLeft({ countLeave = false, playSting = false } = {}) {
    if (sayingGoodbye) return;
    // Only door no-shows count toward the angry-visit streak.
    if (countLeave) dannyLeftCount += 1;
    door.classList.add("is-left");
    doorBtn.disabled = true;
    dannyLeft.classList.remove("is-fading");
    dannyLeft.hidden = false;
    // Restart entrance, then fade out over the sting.
    dannyLeft.style.animation = "none";
    void dannyLeft.offsetWidth;
    dannyLeft.style.animation = "";
    if (playSting) {
      playDannyLeftSting();
      if (!reduceMotion) {
        window.setTimeout(() => {
          if (dannyLeft.hidden) return;
          dannyLeft.classList.add("is-fading");
        }, 900);
      }
    }
    leftTimer = window.setTimeout(() => {
      leftTimer = null;
      resetToStart();
    }, reduceMotion ? 800 : playSting ? LEFT_STING_HOLD_MS : LEFT_HOLD_MS);
  }

  function stopKnock() {
    clearDoorHello();
    clearHelloKnockTimer();
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
    try {
      helloKnockAudio.pause();
      helloKnockAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    try {
      doorKnockAudio.pause();
      doorKnockAudio.currentTime = 0;
    } catch {
      // Ignore
    }
  }

  function playSlam() {
    playDelayed("slam", slamAudio);
  }

  function playSlamNearClosed() {
    window.setTimeout(() => {
      playSlam();
    }, reduceMotion ? 80 : DOOR_SLAM_AT_MS);
  }

  function playGoodbye() {
    if (tipCents < 100) {
      playGoodbyeLowtipVoice();
      playSlamNearClosed();
      return;
    }

    try {
      goodbyeAudio.muted = false;
      goodbyeAudio.currentTime = 0;
      const playPromise = goodbyeAudio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } catch {
      // Ignore playback failures
    }
  }

  function stopGoodbye() {
    for (const el of [goodbyeAudio, goodbyeLowtipAudio, slamAudio, lowtipAudio]) {
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

  function spawnHearts(clientX, clientY) {
    const bounds = tipBursts.getBoundingClientRect();
    const originX = clientX - bounds.left;
    const originY = clientY - bounds.top;
    const count = reduceMotion ? 1 : 5;
    const hearts = ["❤️", "💕", "💗", "💖", "💓"];

    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "tip-heart";
      el.textContent = hearts[i % hearts.length];
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

  function spawnFlowers(clientX, clientY) {
    const bounds = flowerBursts.getBoundingClientRect();
    const originX = clientX - bounds.left;
    const originY = clientY - bounds.top;
    const maxLift = Math.max(200, originY - 20);
    const count = reduceMotion ? 2 : 12;
    const flowers = ["🌸", "🌺", "🌻", "🌷", "🌹", "🌼", "💐"];
    const faceGap = Math.min(bounds.width * 0.34, Math.max(130, bounds.width * 0.28));
    const narrowOut = bounds.width * 0.32;
    const wideOut = bounds.width * 0.52;
    const roomBelow = Math.max(36, bounds.height - originY - 12);

    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "tip-flower";
      el.textContent = flowers[(Math.random() * flowers.length) | 0];
      const goLeft = i % 2 === 0;
      const useWide = Math.random() < 0.55;
      const maxOut = useWide ? wideOut : narrowOut;
      const inner = faceGap / 2;
      const minX = goLeft ? originX - maxOut : originX + inner;
      const maxX = goLeft ? originX - inner : originX + maxOut;
      const targetX = minX + Math.random() * Math.max(1, maxX - minX);
      const spread = targetX - originX;

      // Mix high / mid / bottom-side arcs around the face.
      const lane = Math.random();
      let dy;
      if (lane < 0.3) {
        // Bottom sides: mostly sideways, a little up or slightly down.
        dy = Math.random() < 0.55
          ? -(18 + Math.random() * 70)
          : 12 + Math.random() * Math.min(56, roomBelow);
      } else if (lane < 0.6) {
        dy = -(maxLift * (0.35 + Math.random() * 0.28));
      } else {
        dy = -(maxLift * (0.65 + Math.random() * 0.4));
      }

      const spin = `${Math.random() * 42 - 21}deg`;
      const flight = reduceMotion ? 1.2 : 2.4 + Math.random() * 1.1;
      const delay = reduceMotion ? 0 : Math.random() * 80;
      el.style.setProperty("--x", `${originX}px`);
      el.style.setProperty("--y", `${originY}px`);
      el.style.setProperty("--drift", `${spread}px`);
      el.style.setProperty("--dy", `${dy}px`);
      el.style.setProperty("--spin", spin);
      el.style.setProperty("--flight", `${flight}s`);
      el.style.animationDelay = `${delay}ms`;
      flowerBursts.appendChild(el);
      window.setTimeout(() => el.remove(), flight * 1000 + delay + 80);
    }
  }

  function clearDiedWipeTimer() {
    if (diedWipeTimer) {
      window.clearTimeout(diedWipeTimer);
      diedWipeTimer = null;
    }
  }

  function resetDiedWipe() {
    clearDiedWipeTimer();
    died.classList.remove("is-wiping");
    died.style.removeProperty("--died-wipe-ms");
    if (diedWipe) {
      diedWipe.style.setProperty("--died-wipe-angle", "0deg");
      void diedWipe.offsetWidth;
    }
  }

  function showDied() {
    map.hidden = true;
    died.hidden = false;
    died.classList.remove("is-in", "is-wiping");
    resetDiedWipe();
    void died.offsetWidth;
    window.setTimeout(() => {
      if (died.hidden) return;
      died.classList.add("is-in");
      playDannyLeftSting({
        delayMs: 0,
        onEnded: () => {
          if (!died.hidden) resetToStart();
        },
      });
      // After the face has faded in, clock-wipe black from the right edge down over the photo.
      diedWipeTimer = window.setTimeout(() => {
        diedWipeTimer = null;
        if (died.hidden) return;
        died.style.setProperty("--died-wipe-ms", `${reduceMotion ? 0 : DIED_WIPE_MS}ms`);
        died.classList.add("is-wiping");
      }, reduceMotion ? 0 : DIED_FACE_FADE_MS + DIED_WIPE_DELAY_MS);
    }, reduceMotion ? 0 : DIED_CRASH_HOLD_MS);
  }

  function sendFlowers(event) {
    if (died.hidden) return;
    const point = event && "clientX" in event
      ? event
      : flowersBtn.getBoundingClientRect();
    const x = "clientX" in point ? point.clientX : point.left + point.width / 2;
    const y = "clientY" in point ? point.clientY : point.top + point.height / 2;
    spawnFlowers(x, y);
  }

  function playGifClickSound(event) {
    if (wash.hidden) return;

    // Restart the GIF from the first frame.
    const src = washGif.getAttribute("src") || washGif.src;
    washGif.src = "";
    washGif.src = src;

    const rect = washGif.getBoundingClientRect();
    const x = event?.clientX || rect.left + rect.width / 2;
    const y = event?.clientY || rect.top + rect.height / 2;
    spawnHearts(x, y);

    duckBedForGifHightip(true);
    playGifHightip();
    // While spamming hightip, plates can smash on top at random.
    if (Math.random() < 0.08) {
      playPlateBreak();
    }
    window.setTimeout(() => {
      duckBedForGifHightip(false);
    }, HIGHTIP_MS);
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
    const myTrip = ++tripId;
    danny.classList.add("is-moving");
    const end = WAYPOINTS[WAYPOINTS.length - 1];

    if (reduceMotion) {
      setDannyPos(end);
      finishArrival();
      return;
    }

    const willCrash = forceCrashNext || Math.random() < CRASH_CHANCE;
    const crashAt = willCrash ? 0.32 + Math.random() * 0.2 : null;
    forceCrashNext = false;
    const startTime = performance.now();
    let crashing = false;
    let crashStart = 0;
    let crashFromT = 0;

    function frame(now) {
      if (myTrip !== tripId) return;

      if (crashing) {
        const raw = Math.min(1, (now - crashStart) / CRASH_SLOWDOWN_MS);
        // Keep rolling for most of the crash SFX, then ease to a stop.
        const coast = crashFromT + (1 - Math.pow(1 - raw, 2.4)) * 0.14;
        setDannyPos(pointAlongRoute(metrics, metrics.total * Math.min(coast, 0.99)));
        if (raw < 1) {
          requestAnimationFrame(frame);
        } else {
          finishCrash();
        }
        return;
      }

      const raw = Math.min(1, (now - startTime) / DURATION_MS);
      const t = easeInOutCubic(raw);

      if (crashAt !== null && raw >= crashAt) {
        crashing = true;
        crashStart = now;
        crashFromT = t;
        crossfadeComingToCrash();
        if (crashResetTimer) window.clearTimeout(crashResetTimer);
        crashResetTimer = window.setTimeout(() => {
          crashResetTimer = null;
          showDied();
        }, reduceMotion ? 500 : CRASH_MS);
        requestAnimationFrame(frame);
        return;
      }

      setDannyPos(pointAlongRoute(metrics, metrics.total * t));

      if (raw < 1) {
        requestAnimationFrame(frame);
      } else {
        finishArrival();
      }
    }

    requestAnimationFrame(frame);
  }

  function finishCrash() {
    danny.classList.remove("is-moving");
  }

  function hideDoorWave() {
    if (!doorWave) return;
    doorWave.classList.remove("is-waving");
    doorWave.hidden = true;
  }

  function clearWashEnterTimer() {
    if (washEnterTimer) {
      window.clearTimeout(washEnterTimer);
      washEnterTimer = null;
    }
  }

  function setDoorRethink(on) {
    canRethinkDoor = on;
    door.classList.toggle("is-rethink", on);
    if (doorDanny) {
      doorDanny.title = on ? "Close the door" : "";
    }
  }

  function closeDoorChangeMind() {
    if (!doorOpened || !canRethinkDoor || sayingGoodbye || angryVisit) return;
    setDoorRethink(false);
    clearWashEnterTimer();
    clearDoorNudge();
    clearDoorHello();
    stopKnock();
    hideDoorWave();

    // Stay "opened" so the door can't be opened again this visit.
    door.classList.remove("is-open");
    doorBtn.disabled = true;
    doorBtn.setAttribute("aria-expanded", "false");
    doorBtn.setAttribute("aria-label", "Door closed");
    doorDannyZoom.style.animation = "none";
    void doorDannyZoom.offsetWidth;
    doorDannyZoom.style.animation = "";

    // After the door finishes closing: knock → lowtip → wait → knock → "open the door".
    clearRethinkKnockTimer();
    rethinkKnockTimer = window.setTimeout(() => {
      rethinkKnockTimer = null;
      if (sayingGoodbye || door.hidden) return;
      playDoorKnock();
      rethinkKnockTimer = window.setTimeout(() => {
        rethinkKnockTimer = null;
        if (sayingGoodbye || door.hidden) return;
        playLowTip();
        rethinkKnockTimer = window.setTimeout(() => {
          rethinkKnockTimer = null;
          if (sayingGoodbye || door.hidden) return;
          playDoorKnock();
          rethinkKnockTimer = window.setTimeout(() => {
            rethinkKnockTimer = null;
            if (sayingGoodbye || door.hidden) return;
            playOpenDoorLine();
          }, DOOR_KNOCK_CLIP_MS);
        }, LOWTIP_MS + RETHINK_OPEN_DOOR_GAP_MS);
      }, DOOR_KNOCK_CLIP_MS);
    }, reduceMotion ? 80 : DOOR_CLOSE_MS);
  }

  function showDoor() {
    map.hidden = true;
    door.hidden = false;
    dannyGone = false;
    hello2Done = false;
    hideDoorWave();
    doorDannyZoom.style.animation = "none";
    // Force reflow so zoom can replay next open.
    void doorDannyZoom.offsetWidth;
    doorDannyZoom.style.animation = "";
    layoutDoorFace();
    requestAnimationFrame(layoutDoorFace);
    startDoorHellos();
  }

  function showWash() {
    clearWashEnterTimer();
    setDoorRethink(false);
    hideDoorWave();
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
      if (tipCents > 300) {
        if (lowtipTimer) window.clearTimeout(lowtipTimer);
        lowtipTimer = window.setTimeout(() => {
          lowtipTimer = null;
          playHighTipIntro();
        }, HIGHTIP_DELAY_MS);
      } else if (tipCents > 200) {
        if (lowtipTimer) window.clearTimeout(lowtipTimer);
        lowtipTimer = window.setTimeout(() => {
          lowtipTimer = null;
          playHighTip();
        }, HIGHTIP_DELAY_MS);
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
    rate.hidden = true;
    door.hidden = true;
    map.hidden = true;
    died.hidden = true;
    died.classList.remove("is-in");
    resetDiedWipe();
    summon.hidden = false;
    tipBursts.replaceChildren();
    rateBurst.replaceChildren();
    if (flowerBursts) flowerBursts.replaceChildren();
    tipBtn.classList.remove("is-pressed");
    tipCents = 0;
    ratingStars = 0;
    lowtipPlayed = false;
    tipTotal.textContent = formatTipTotal(0);
    tipTotal.classList.remove("is-bump");
    stopComing();
    stopWashing();
    stopKnock();
    stopGoodbye();
    stopDannyLeftSting();
    stopCelebrate();
    clearDoorNudge();
    tripId += 1;
    if (crashResetTimer) {
      window.clearTimeout(crashResetTimer);
      crashResetTimer = null;
    }
    cancelComingFade();
    try {
      crashAudio.pause();
      crashAudio.currentTime = 0;
      crashAudio.volume = 1;
    } catch {
      // Ignore
    }
    try {
      comingAudio.volume = 1;
    } catch {
      // Ignore
    }
    try {
      doorbellAudio.pause();
      doorbellAudio.currentTime = 0;
    } catch {
      // Ignore
    }

    door.classList.remove("is-open");
    door.classList.remove("is-left");
    doorBtn.style.transition = "";
    doorBtn.setAttribute("aria-expanded", "false");
    doorBtn.disabled = false;
    dannyLeft.classList.remove("is-fading");
    dannyLeft.style.animation = "";
    dannyLeft.hidden = true;
    hideDoorWave();
    clearWashEnterTimer();
    setDoorRethink(false);
    doorDannyZoom.style.animation = "none";
    danny.classList.remove("is-moving", "is-arrived");
    setDannyPos(WAYPOINTS[0]);
    status.textContent = "Danny is coming to wash!";
    status.classList.remove("is-arrived");
    route.removeAttribute("d");

    started = false;
    doorOpened = false;
    dannyGone = false;
    hello2Done = false;
    angryVisit = false;
    sayingGoodbye = false;
    comeBtn.disabled = false;
    if (tryCrashBtn) tryCrashBtn.disabled = false;
    comeBtn.classList.remove("is-pressed");
    byeBtn.classList.remove("is-pressed");
    byeBtn.disabled = false;
    byeBtn.hidden = false;
    resetRatingUI();
  }

  function resetRatingUI() {
    ratingStars = 0;
    rate.classList.remove("is-celebrate");
    rateForm.hidden = false;
    rateOutcome.hidden = true;
    rateRejected.hidden = true;
    rateThanks.hidden = true;
    const thanksText = rateThanks.querySelector(".rate-thanks__text");
    const thanksCheck = rateThanks.querySelector(".rate-thanks__check");
    if (thanksText) thanksText.textContent = "Thanks for your comment";
    if (thanksCheck) thanksCheck.hidden = false;
    rateComment.value = "";
    rateComment.disabled = false;
    rateSubmit.disabled = true;
    for (const star of rateStars.querySelectorAll(".rate-star")) {
      star.classList.remove("is-on", "is-preview", "is-dancing");
      star.disabled = false;
    }
    if (!rateForm.contains(rateStars)) {
      rateForm.insertBefore(rateStars, rateForm.querySelector(".rate-comment-label"));
    }
    rateBurst.replaceChildren();
  }

  function showRateOutcome({ rejected = false, thanks = false, support = false, danceStars = false } = {}) {
    rateForm.hidden = true;
    rateOutcome.hidden = false;
    rateRejected.hidden = true;
    rateThanks.hidden = true;

    const thanksText = rateThanks.querySelector(".rate-thanks__text");
    const thanksCheck = rateThanks.querySelector(".rate-thanks__check");

    if (rejected) {
      rateRejected.hidden = false;
    } else if (support || thanks) {
      rateThanks.hidden = false;
      if (thanksText) {
        thanksText.textContent = support ? "Thanks for your support!" : "Thanks for your comment";
      }
      if (thanksCheck) thanksCheck.hidden = support;
    }

    if (danceStars) {
      if (!rateOutcome.contains(rateStars)) {
        rateOutcome.insertBefore(rateStars, rateOutcome.firstChild);
      }
      danceRatingStars();
    } else if (!rateForm.contains(rateStars)) {
      rateForm.insertBefore(rateStars, rateForm.querySelector(".rate-comment-label"));
    }
  }

  function setRatingPreview(n) {
    for (const star of rateStars.querySelectorAll(".rate-star")) {
      const value = Number(star.dataset.star);
      star.classList.toggle("is-preview", value <= n);
    }
  }

  function setRating(n) {
    ratingStars = n;
    for (const star of rateStars.querySelectorAll(".rate-star")) {
      const value = Number(star.dataset.star);
      star.classList.toggle("is-on", value <= n);
      star.classList.remove("is-preview");
    }
    rateSubmit.disabled = n < 1;
  }

  function showRating() {
    sayingGoodbye = false;
    door.hidden = true;
    bye.hidden = true;
    wash.hidden = true;
    map.hidden = true;
    summon.hidden = true;
    resetRatingUI();
    rate.hidden = false;
  }

  function playCelebrate() {
    try {
      celebrateAudio.muted = false;
      celebrateAudio.volume = 1;
      celebrateAudio.currentTime = 0;
      const playPromise = celebrateAudio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } catch {
      // Ignore
    }
  }

  function stopCelebrate() {
    try {
      celebrateAudio.pause();
      celebrateAudio.currentTime = 0;
    } catch {
      // Ignore
    }
  }

  function danceRatingStars() {
    for (const star of rateStars.querySelectorAll(".rate-star")) {
      star.classList.add("is-on", "is-dancing");
      star.disabled = true;
    }
  }

  function submitRating() {
    if (ratingStars < 1 || rateSubmit.disabled) return;
    rateSubmit.disabled = true;
    for (const star of rateStars.querySelectorAll(".rate-star")) {
      star.disabled = true;
    }
    rateComment.disabled = true;

    // Rejected only when tip was under $1 and rating isn't 5 stars.
    if (tipCents < 100 && ratingStars < 5) {
      showRateOutcome({ rejected: true });
      window.setTimeout(resetToStart, reduceMotion ? 900 : 2200);
      return;
    }

    // Celebration only when tip over $3 and 5 stars.
    if (tipCents > 300 && ratingStars === 5) {
      rate.classList.add("is-celebrate");
      showRateOutcome({ support: true, danceStars: true });
      playCelebrate();
      window.setTimeout(resetToStart, reduceMotion ? 1200 : CELEBRATE_MS);
      return;
    }

    showRateOutcome({ thanks: true });
    window.setTimeout(resetToStart, reduceMotion ? 800 : 2200);
  }

  function closeDoorAndLeave() {
    if (sayingGoodbye) return;
    sayingGoodbye = true;
    if (lowtipTimer) {
      window.clearTimeout(lowtipTimer);
      lowtipTimer = null;
    }
    const wasDoorVisible = !door.hidden;
    const fromAngry = angryVisit;
    byeBtn.disabled = true;
    byeBtn.hidden = true;
    bye.hidden = true;
    rate.hidden = true;
    door.hidden = false;
    door.classList.remove("is-left");
    dannyLeft.classList.remove("is-fading");
    dannyLeft.hidden = true;
    doorDannyZoom.style.animation = "none";
    doorBtn.setAttribute("aria-expanded", "true");
    layoutDoorFace();

    // From bye, door was hidden so it appears open then slams.
    // From an already-visible door (angry visit), snap open — no full swing-in.
    if (wasDoorVisible) {
      doorBtn.style.transition = "none";
      door.classList.add("is-open");
      void doorBtn.offsetWidth;
      doorBtn.style.transition = "";
    } else {
      door.classList.add("is-open");
    }

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
        window.setTimeout(() => {
          if (fromAngry) resetToStart();
          else showRating();
        }, reduceMotion ? 800 : LEFT_HOLD_MS);
      }, closeWait);
      return;
    }

    const wait = reduceMotion ? 500 : Math.max(DOOR_CLOSE_MS, 1700);
    window.setTimeout(showRating, wait);
  }

  function finishArrival() {
    danny.classList.remove("is-moving");
    danny.classList.add("is-arrived");
    status.textContent = "He's here.";
    status.classList.add("is-arrived");
    stopComing();
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
    clearDoorHello();

    if (dannyGone) {
      doorOpened = true;
      showDannyLeft({ countLeave: true, playSting: true });
      return;
    }

    // Angry visit: snap open, wait for lowtip to finish, then slam like under-$1 goodbye.
    if (angryVisit) {
      doorOpened = true;
      layoutDoorFace();
      doorBtn.style.transition = "none";
      door.classList.add("is-open");
      void doorBtn.offsetWidth;
      doorBtn.style.transition = "";
      doorBtn.setAttribute("aria-expanded", "true");

      whenLowtipDone(() => {
        if (sayingGoodbye) return;
        closeDoorAndLeave();
      });
      return;
    }

    doorOpened = true;
    layoutDoorFace();
    door.classList.add("is-open");
    doorBtn.setAttribute("aria-expanded", "true");

    // Stayed through both second hellos — reverse shut as soon as half open.
    if (hello2Done) {
      const halfOpenMs = reduceMotion ? 100 : Math.round(DOOR_OPEN_MS / 2);
      window.setTimeout(() => {
        try {
          goodbyeLowtipAudio.muted = false;
          goodbyeLowtipAudio.currentTime = 0;
          const playPromise = goodbyeLowtipAudio.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        } catch {
          // Ignore
        }
        door.classList.remove("is-open");
        doorBtn.setAttribute("aria-expanded", "false");
        playSlamNearClosed();
      }, halfOpenMs);
      window.setTimeout(() => {
        showDannyLeft({ countLeave: true });
      }, reduceMotion ? 700 : halfOpenMs + DOOR_CLOSE_MS + 200);
      return;
    }

    showDoorWave();
    setDoorRethink(true);
    const wait = reduceMotion ? 600 : DOOR_OPEN_MS + HEADSHOT_HOLD_MS;
    clearWashEnterTimer();
    washEnterTimer = window.setTimeout(() => {
      washEnterTimer = null;
      setDoorRethink(false);
      showWash();
    }, wait);
  }

  function startVisit({ forceCrash = false } = {}) {
    if (started) return;
    started = true;
    forceCrashNext = forceCrash;
    comeBtn.disabled = true;
    if (tryCrashBtn) tryCrashBtn.disabled = true;

    // Start the car/coming track first so mobile doesn't drop it
    // behind muted unlock plays for the other SFX.
    playComing();
    unlockAudio();
    showMap();
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
    startVisit();
  });

  if (tryCrashBtn) {
    tryCrashBtn.addEventListener("click", () => {
      startVisit({ forceCrash: true });
    });
  }

  doorBtn.addEventListener("click", openDoor);
  doorDanny.addEventListener("click", closeDoorChangeMind);
  flowersBtn.addEventListener("click", sendFlowers);

  washGif.addEventListener("click", playGifClickSound);
  washGif.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      playGifClickSound();
    }
  });

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

  rateStars.addEventListener("pointerover", (event) => {
    const btn = event.target.closest(".rate-star");
    if (!btn || btn.disabled) return;
    setRatingPreview(Number(btn.dataset.star));
  });

  rateStars.addEventListener("pointerleave", () => {
    for (const star of rateStars.querySelectorAll(".rate-star")) {
      star.classList.remove("is-preview");
    }
  });

  rateStars.addEventListener("click", (event) => {
    const btn = event.target.closest(".rate-star");
    if (!btn || btn.disabled) return;
    setRating(Number(btn.dataset.star));
  });

  rateSubmit.addEventListener("click", submitRating);

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
