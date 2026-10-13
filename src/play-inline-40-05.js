// play-inline-40 05 — ctx
// Lines 1298-1609 of readable/play-inline-40.pretty.js (statement-aligned).
  S.voiceBark = function (a, text) {
    const ctx = S.ctx;
    if (
      !npcVox ||
      !ctx ||
      ctx.state !== "running" ||
      !S.bus ||
      !S.vox ||
      !S.vox.say ||
      G.SMOKE ||
      G.SHOT
    )
      return false;
    if (!a || !a.pos || a.dead || !isFinite(a.pos.x)) return false;
    if (G.state !== "play") return false;
    const prof = S.barkProfile(a);
    if (!prof) return false;
    const L = S.listenerPos,
      dist = Math.hypot(a.pos.x - L.x, a.pos.y + 1.5 - L.y, a.pos.z - L.z);
    if (!(dist < 26)) return false;
    const t = cleanBark(text);
    if (!t) return false;
    const nowR = performance.now();
    for (const b of N.barks.slice()) if (b.a === a) endBark(b, 0.08); // a new line replaces the actor's last one
    if (nowR - N.lastBarkT < 220) return false; // one VOX plan per ~frame burst (main-thread budget)
    if (N.barks.length >= BARK_MAX) {
      // steal the farthest if this one is nearer
      let far = null;
      for (const b of N.barks) if (!far || b.dist > far.dist) far = b;
      if (!far || far.dist < dist) return false;
      endBark(far, 0.15);
    }
    N.lastBarkT = nowR;
    const h = G.util.hashStr(String(a.id || a.name || "npc"));
    const pitch = 0.9 + (h % 23) / 100; // every NPC keeps their own voice
    const nodes = [];
    const g = ctx.createGain();
    g.gain.value = 1.35 * (prof === "brute" ? 1.15 : 1);
    nodes.push(g);
    let tail = g;
    if (prof === "bot" || prof === "bot_posh") {
      // robot speaker: tinny band, a short metallic comb, and part ring-modulated
      const bot = prof === "bot";
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = bot ? 380 : 260;
      const dl = ctx.createDelay(0.05);
      dl.delayTime.value = bot ? 0.0045 : 0.0031;
      const fb = ctx.createGain();
      fb.gain.value = 0.55;
      const mix = ctx.createGain();
      const rm = ctx.createGain();
      rm.gain.value = 0;
      const osc = ctx.createOscillator();
      osc.frequency.value = bot ? 55 : 92;
      const og = ctx.createGain();
      og.gain.value = bot ? 0.5 : 0.3;
      const dry = ctx.createGain();
      dry.gain.value = 0.6;
      const sum = ctx.createGain();
      nodes.push(hp, dl, fb, mix, rm, osc, og, dry, sum);
      g.connect(hp);
      hp.connect(mix);
      hp.connect(dl);
      dl.connect(fb);
      fb.connect(dl);
      dl.connect(mix);
      osc.connect(og);
      og.connect(rm.gain);
      mix.connect(rm);
      mix.connect(dry);
      rm.connect(sum);
      dry.connect(sum);
      try {
        osc.start();
      } catch (e) {
        /* */
      }
      tail = sum;
    }
    const air = ctx.createBiquadFilter();
    air.type = "lowpass";
    air.frequency.value = clamp(20000 * Math.exp(-dist / 150), 2500, 20000);
    const pan = ctx.createPanner();
    pan.panningModel = dist < 12 ? "HRTF" : "equalpower";
    pan.distanceModel = "inverse";
    pan.refDistance = 1.8;
    pan.rolloffFactor = 1.15;
    pan.maxDistance = 10000;
    const send = ctx.createGain();
    send.gain.value = S.env.wet * clamp(1 + dist / 25, 1, 2.2) * 0.8;
    nodes.push(air, pan, send);
    S.setPannerPos(pan, headPos(a, { x: 0, y: 0, z: 0 }));
    tail.connect(air);
    air.connect(pan);
    pan.connect(S.bus.world);
    pan.connect(send);
    send.connect(S.bus.revSend);
    let ctl = null;
    try {
      ctl = S.vox.say(ctx, g, t, prof, {
        start: ctx.currentTime + 0.12,
        head: 0.16,
        pitch,
      });
    } catch (e) {
      G.reportError("sound:bark", e);
    }
    if (!ctl) {
      nodes.forEach((n) => {
        try {
          n.disconnect();
        } catch (e) {
          /* */
        }
      });
      return false;
    }
    const b = {
      a,
      ctl,
      nodes,
      dist,
      done: false,
      pan,
      air,
      hp: { x: 0, y: 0, z: 0 },
      end: ctl.end + 0.4,
    };
    N.barks.push(b);
    return true;
  };
  function barksUpdate() {
    if (!N.barks.length) return;
    const ctx = S.ctx,
      now = ctx.currentTime,
      L = S.listenerPos;
    for (const b of N.barks.slice()) {
      const a = b.a;
      if (b.ctl.pump) {
        try {
          b.ctl.pump(now + 0.6);
        } catch (e) {
          /* */
        }
      }
      if (
        now > b.end ||
        b.ctl.stopped ||
        !a ||
        a.dead ||
        !a.pos ||
        !isFinite(a.pos.x) ||
        G.state === "title" ||
        G.state === "dead"
      ) {
        endBark(b, a && a.dead ? 0.05 : 0.2);
        continue;
      }
      headPos(a, b.hp);
      S.setPannerPos(b.pan, b.hp);
      const d = Math.hypot(b.hp.x - L.x, b.hp.y - L.y, b.hp.z - L.z);
      b.dist = d;
      if (d > 45) {
        endBark(b, 0.4);
        continue;
      }
    }
  }
  // TEMPORARY BRIDGE: combat's bark captions (C.showBark) have no event yet — wrap them at call time, once.
  function installBarkBridge() {
    const C = G.combat;
    if (
      !C ||
      G.isStub("combat") ||
      typeof C.showBark !== "function" ||
      C.showBark.__vox
    )
      return !!(C && C.showBark && C.showBark.__vox);
    if (S.barkEvent) return true; // combat emits actorBark itself (see NOTES): no wrapping needed
    const orig = C.showBark;
    const wrapped = function (actor, text, dur) {
      const r = orig.apply(this, arguments);
      try {
        if (!S.barkEvent) S.voiceBark(actor, text);
      } catch (e) {
        G.reportError("sound:barkBridge", e);
      }
      return r;
    };
    wrapped.__vox = true;
    wrapped.__orig = orig;
    C.showBark = wrapped;
    return true;
  }
  G.events.on("actorBark", (e) => {
    S.barkEvent = true;
    if (e && e.actor) S.voiceBark(e.actor, e.text);
  });
  G.events.on("dialogueStart", () =>
    N.barks.slice().forEach((b) => endBark(b, 0.15)),
  );
  G.events.on("reset", () => {
    N.barks.slice().forEach((b) => endBark(b, 0.05));
    stopEmitters();
    jbStop(0.2);
  });

  // ------------------------------------------------------------------
  // Update (called from 90_main)
  // ------------------------------------------------------------------
  let bridgeT = 0;
  N.update = function (dt, realDt) {
    const ctx = S.ctx;
    if (!ctx || !S.bus || ctx.state !== "running" || !G.LAYOUT) return;
    bridgeT -= realDt;
    if (bridgeT <= 0) {
      bridgeT = 2;
      try {
        installBarkBridge();
      } catch (e) {
        /* */
      }
    }
    barksUpdate();
    const st = G.state;
    if (st === "title" || st === "chargen" || st === "loading" || !G.player) {
      stopEmitters();
      if (JB.on) jbStop(1);
      return;
    }
    try {
      jbUpdate(realDt);
    } catch (e) {
      G.reportError("sound:jukebox", e);
      jbStop(0.5);
    }
    N.tickT -= realDt;
    if (N.tickT > 0) return;
    N.tickT = 1;
    const P = G.player.pos,
      inside = G.LAYOUT.isInterior && G.LAYOUT.isInterior(P.x);
    N.near = inside ? 0 : S.neonNear(P.x, P.z);
    N.busy = S.neonBusy();
    if (N.near <= 0) {
      stopEmitters();
      return;
    }
    startEmitters();
    // re-read the sign glows once the landmark has streamed in
    if (!N.glowFound && (N.glowT -= 1) <= 0) {
      N.glowT = 10;
      const bz = buzzSpots();
      if (bz.length) {
        N.buzz.forEach((e) => e.h && e.h.stop(0.5));
        N.buzz = bz.map((p) => ({
          p,
          h: S.play("neon_buzz", { pos: p, loop: true, volume: 0.0001 }),
          lvl: 0,
          n: p.n,
        }));
        N.glowFound = bz.length;
      }
    }
    const night = isNight();
    for (const e of N.chat) {
      const ppl = peopleNear(e.p);
      const lvl = (ppl < 0 ? 0.55 : clamp(0.18 + ppl * 0.2, 0.18, 1)) * N.busy;
      if (Math.abs(lvl - e.lvl) > 0.02 && e.h) {
        e.lvl = lvl;
        e.h.setVolume(Math.max(0.0001, lvl), 1.5);
      }
    }
    for (const e of N.buzz) {
      const lvl = (night ? 1 : 0.55) * clamp(0.5 + e.n / 30, 0.5, 1);
      if (Math.abs(lvl - e.lvl) > 0.02 && e.h) {
        e.lvl = lvl;
        e.h.setVolume(lvl, 2);
      }
    }
    // market life (per second chances)
    if (st === "play" || st === "goggles") {
      const k = N.near * N.busy,
        pk = N.chat.length ? S.pick(N.chat).p : null;
      if (Math.random() < 0.035 * k && pk) spot("crowd_laugh", pk, 0.8);
      if (Math.random() < 0.02 * k && pk) spot("cash_register", pk, 0.9);
      if (Math.random() < 0.045 * k && pk) spot("market_clatter", pk, 0.8);
      if (N.buzz.length && Math.random() < (night ? 0.03 : 0.012) * N.near) {
        const b = S.pick(N.buzz);
        S.play("neon_sputter", { pos: b.p, volume: 0.9 });
      }
    }
  };
  // bake the Neon's sounds ahead of arrival (they're lazy)
  let hinted = false;
  N.hint = function (near) {
    if (hinted || near <= 0) return;
    hinted = true;
    [
      "amb_neon",
      "neon_chatter_a",
      "neon_chatter_b",
      "neon_chatter_c",
      "neon_chatter_d",
      "neon_buzz",
      "crowd_laugh",
      "cash_register",
      "market_clatter",
      "neon_sputter",
      "jukebox_mech",
    ].forEach((nm, i) => S.hintBake(nm, 2 + i * 0.1));
  };
