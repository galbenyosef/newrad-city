/* src/sound/58_skyeye.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 58_skyeye.js
 * Continuity Sky-Eye drones broadcast Continuity Radio as they patrol.
 *
 * One shared "drone feed" — the Continuity Radio programme (band marches and
 * Acting President Marsh's addresses) through a tinny loudspeaker-horn
 * chain — runs only while a drone is within earshot. Each audible drone
 * gets a positional emitter fed from it. Virtualised: living drones are
 * polled once a second (G.actors.list(), Sky-Eye actor types); only the 2
 * nearest within EAR metres are real, the rest are silent until they come
 * closer. Emitters follow their actor every frame, fade in/out, and fall
 * silent when the drone is shot down or despawns. The world bus carries
 * them, so pause, low-health filtering and distance apply.
 * Speech goes out only in the 'radio' voice mode (the default is
 * subtitles-only, so the drones then play the marches alone).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const S = G._snd;
  const T = S.radioText;
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  const MAX_REAL = 2; // at most two drones broadcasting at once
  const EAR = 60; // m: start the emitter inside this range
  const EAR_OFF = 72; // m: drop it beyond this (hysteresis)
  const E = { feed: null, emitters: new Map(), pollT: 0, idleSince: 0 };

  // ------------------------------------------------------------------
  // The feed: Continuity Radio through a drone's loudspeaker horn
  // ------------------------------------------------------------------
  function makeFeed() {
    const ctx = S.ctx;
    const out = ctx.createGain();
    out.gain.value = 0;
    const grille = ctx.createBiquadFilter();
    grille.type = "peaking";
    grille.frequency.value = 1700;
    grille.Q.value = 1.6;
    grille.gain.value = 7;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 420;
    hp.Q.value = 0.8;
    const chain = S.inst.radioChain(ctx, grille, {
      crackle: 0.1,
      hiss: 0.006,
      lp: 3000,
      hp: 380,
      out: 0.9,
    });
    grille.connect(hp);
    hp.connect(out);
    const f = {
      out,
      chain,
      cue: null,
      vox: null,
      voxTimer: null,
      next: "march",
      marches: 0,
      nextAt: 0,
      dead: false,
    };
    const t = ctx.currentTime;
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(1, t + 1.2);
    return f;
  }
  function stopVox(f) {
    clearInterval(f.voxTimer);
    f.voxTimer = null;
    if (f.vox) {
      try {
        f.vox.stop(0.1);
      } catch (e) {
        /* */
      }
      f.vox = null;
    }
  }
  function disposeFeed(f) {
    f.dead = true;
    stopVox(f);
    if (f.cue) {
      f.cue.stop(0.4);
      f.cue = null;
    }
    const t = S.ctx.currentTime;
    f.out.gain.setTargetAtTime(0, t, 0.2);
    setTimeout(() => {
      try {
        f.chain.dispose();
        f.out.disconnect();
      } catch (e) {
        /* */
      }
    }, 1500);
  }
  /** Programme: two or three marches, then the Acting President (VOX) — the same running order as Continuity Radio. */
  function feedTick(f) {
    const ctx = S.ctx,
      now = ctx.currentTime;
    if (f.cue) {
      f.cue.tick(now, now + 1.2);
      if (f.cue.stopped) {
        f.cue = null;
        f.nextAt = G.time.real + 1.5;
      }
      return;
    }
    if (f.vox || G.time.real < f.nextAt) return;
    const wantSpeech = f.next === "speech" && S.vox && S.voxOK && S.voxOK();
    if (wantSpeech) {
      const text = pick(T.continuitySpeeches) + " " + pick(T.continuitySignoff);
      try {
        const ctl = S.vox.say(ctx, f.chain.input, text, "president", {
          start: now + 0.15,
          gain: 1,
        });
        f.vox = ctl;
        f.voxTimer = setInterval(() => {
          if (f.dead || f.vox !== ctl) {
            clearInterval(f.voxTimer);
            return;
          }
          ctl.pump(ctx.currentTime + 1.6);
          if (ctx.currentTime >= ctl.plannedEnd + 0.2) {
            stopVox(f);
            f.next = "march";
            f.marches = 0;
            f.nextAt = G.time.real + 1;
          }
        }, 250);
      } catch (e) {
        G.reportError("sound:skyeye", e);
        f.vox = null;
        f.next = "march";
      }
      return;
    }
    const needs = ["drums"];
    if (!S.inst.allReady(needs)) {
      needs.forEach(S.inst.ensure);
      f.nextAt = G.time.real + 1;
      return;
    }
    const song = pick(T.continuityMarches);
    const gen = S.songs.make(song);
    const cue = new S.Cue("skyeye:" + song.title, gen, {
      dest: f.chain.input,
      reverb: 0,
    });
    cue.out.gain.value = S.songs.gainFor(song);
    // a first drone usually drifts in mid-march
    const join = f.marches === 0 && Math.random() < 0.8;
    cue.start(now + 0.1, join ? 0.8 : 0.2);
    if (join) cue.seek(Math.floor(Math.random() * S.songs.lengthOf(gen) * 0.6));
    f.cue = cue;
    f.marches++;
    f.next = f.marches >= 2 + ((Math.random() * 2) | 0) ? "speech" : "march";
  }

  // ------------------------------------------------------------------
  // Emitters
  // ------------------------------------------------------------------
  function emitterPos(a) {
    return { x: a.pos.x, y: a.pos.y + (a.hover ? 0.35 : 2.3), z: a.pos.z };
  } // the rig may carry the hover height itself
  function makeEmitter(a) {
    const ctx = S.ctx;
    const g = ctx.createGain();
    g.gain.value = 0;
    const pan = ctx.createPanner();
    pan.panningModel = "equalpower";
    pan.distanceModel = "inverse";
    pan.refDistance = 2.2;
    pan.rolloffFactor = 1.25;
    pan.maxDistance = 400;
    S.setPannerPos(pan, emitterPos(a));
    const send = ctx.createGain();
    send.gain.value = 0.35;
    E.feed.out.connect(g);
    g.connect(pan);
    pan.connect(S.bus.world);
    pan.connect(send);
    send.connect(S.bus.revSend);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.55, t + 0.8);
    return { a, g, pan, send };
  }
  function dropEmitter(id, fade) {
    const e = E.emitters.get(id);
    if (!e) return;
    E.emitters.delete(id);
    const t = S.ctx.currentTime;
    e.g.gain.cancelScheduledValues(t);
    e.g.gain.setValueAtTime(e.g.gain.value, t);
    e.g.gain.linearRampToValueAtTime(0, t + (fade || 0.6));
    setTimeout(
      () => {
        try {
          e.g.disconnect();
          e.pan.disconnect();
          e.send.disconnect();
        } catch (err) {
          /* */
        }
      },
      ((fade || 0.6) + 0.3) * 1000,
    );
  }
  function clearAll() {
    for (const id of Array.from(E.emitters.keys())) dropEmitter(id, 0.2);
    if (E.feed) {
      disposeFeed(E.feed);
      E.feed = null;
    }
  }
  const alive = (a) =>
    a &&
    !a.dead &&
    !a.removed &&
    a.pos &&
    (a.inScene === undefined || a.inScene);
  /** Once a second: choose the (at most 2) nearest living drones within earshot. */
  function poll() {
    let list = [];
    try {
      list =
        G.actors && !G.isStub("actors") && G.actors.list ? G.actors.list() : [];
    } catch (e) {
      list = [];
    }
    const L = S.listenerPos;
    const cands = [];
    for (const a of list) {
      if (!a || S.kindOf(a.type) !== "skyeye" || !alive(a)) continue;
      const d = Math.hypot(a.pos.x - L.x, a.pos.z - L.z);
      const key = a.id || a;
      if (d < (E.emitters.has(key) ? EAR_OFF : EAR)) cands.push({ a, d, key });
    }
    cands.sort((x, y) => x.d - y.d);
    const keep = new Set(cands.slice(0, MAX_REAL).map((c) => c.key));
    for (const [id, e] of E.emitters)
      if (!keep.has(id) || !alive(e.a))
        dropEmitter(id, e.a && e.a.dead ? 0.15 : 0.8);
    if (keep.size && !E.feed) E.feed = makeFeed();
    for (const c of cands.slice(0, MAX_REAL))
      if (!E.emitters.has(c.key)) E.emitters.set(c.key, makeEmitter(c.a));
    if (E.emitters.size) E.idleSince = G.time.real;
    else if (E.feed && G.time.real - E.idleSince > 8) {
      disposeFeed(E.feed);
      E.feed = null;
    } // keep the programme running briefly between drones
  }

  S.skyeye = {
    /** Called from the sound module's scheduler tick (also while rAF is throttled). */
    update(realDt) {
      const ctx = S.ctx;
      if (!ctx || ctx.state !== "running" || !S.bus) return;
      if (G.state === "title" || G.state === "dead" || G.state === "chargen") {
        if (E.feed || E.emitters.size) clearAll();
        return;
      }
      E.pollT -= realDt;
      if (E.pollT <= 0) {
        E.pollT = 1;
        try {
          poll();
        } catch (e) {
          G.reportError("sound:skyeye", e);
        }
      }
      if (E.feed) feedTick(E.feed);
    },
    /** Per frame: emitters follow their drones. */
    follow() {
      if (!E.emitters.size) return;
      for (const [id, e] of E.emitters) {
        if (alive(e.a)) S.setPannerPos(e.pan, emitterPos(e.a));
        else dropEmitter(id, 0.15);
      }
    },
    stats() {
      return { feed: !!E.feed, emitters: E.emitters.size };
    },
  };
  G.events.on("reset", clearAll);
  G.events.on("actorKilled", (a) => {
    if (a && S.kindOf(a.type) === "skyeye") dropEmitter(a.id || a, 0.12);
  });
})();
