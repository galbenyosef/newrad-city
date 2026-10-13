// play-inline-39 03 — math
// Lines 675-860 of readable/play-inline-39.pretty.js (statement-aligned).
  G.events.on("footstep", (e) => {
    if (!e) return;
    const s = SURF[e.surface] || "concrete";
    const vol = e.sneaking ? 0.35 : e.sprinting ? 1.0 : 0.72;
    S.play("footstep_" + s, { volume: vol, pitch: e.sprinting ? 1.04 : 1 });
    // webbing / canteen / buckle rattle when running (never coins)
    if (e.sprinting && Math.random() < 0.45)
      S.play("gear_rattle", { volume: 0.55 + Math.random() * 0.35 });
    else if (!e.sneaking && Math.random() < 0.08)
      S.play("gear_rattle", { volume: 0.3 });
  });

  // ------------------------------------------------------------------
  // Update
  // ------------------------------------------------------------------
  let gogHum = null,
    termHum = null,
    lastState = null;
  A.update = function (dt, realDt) {
    const ctx = S.ctx;
    if (!ctx || !S.bus || ctx.state !== "running" || !G.player || !G.LAYOUT)
      return;
    const st = G.state;
    const P = G.player;
    // --- context & env (2 Hz)
    A.envT -= realDt;
    if (A.envT <= 0) {
      A.envT = 0.5;
      const c = sampleContext();
      S.setEnvironment(envFor(c));
      A.target = computeTargets(c);
      // bake rare, long sounds ahead of the moment they become likely
      if (c.inside && S.isStartLab(c.interior)) {
        S.hintBake("cryo_door", 1);
        S.hintBake("cryo_alarm", 1);
      }
      if (c.weather === "rain" || c.weather === "thunderstorm")
        S.hintBake("thunder", 2);
      if (c.water > 0.3) S.hintBake("buoy_bell", 3);
      if (
        S.neon &&
        (c.interior === "neon_interiors" ||
          (!c.inside && Math.hypot(c.px + 40, c.pz + 262) < 280))
      )
        S.neon.hint(1); // bake the Neon on approach
    }
    // --- beds
    if (bedsWanted) {
      for (const b of BEDS) {
        const tgt = A.target[b] || 0;
        if (tgt <= 0.001 && !A.beds[b]) continue;
        const h = ensureBed(b);
        if (!h) continue;
        if (Math.abs(h._lvl - tgt) > 0.005) {
          h._lvl = tgt;
          h.setVolume(Math.max(0.0001, tgt), 1.2);
        }
        A.level[b] = tgt;
        // a bed that has been silent for a while is released (frees its voice; its buffer becomes evictable)
        if (tgt <= 0.001) {
          h._zero = (h._zero || 0) + realDt;
          if (h._zero > 25) {
            h.stop(0.5);
            delete A.beds[b];
          }
        } else h._zero = 0;
      }
    }
    // --- world muffle
    const cut = worldCutoff();
    const wf = S.bus.worldFilter.frequency;
    if (Math.abs(wf.value - cut) > 50)
      wf.setTargetAtTime(cut, ctx.currentTime, cut < wf.value ? 0.03 : 0.25);
    // --- goggle display hum
    if (gogHum && !gogHum.playing) gogHum = null;
    if (termHum && !termHum.playing) termHum = null;
    if (st === "goggles" && !gogHum) {
      gogHum = S.play("goggles_hum", { loop: true, volume: 0.9 });
      if (gogHum.isNull) gogHum = null;
    }
    if (st !== "goggles" && gogHum) {
      gogHum.stop(0.3);
      gogHum = null;
    }
    // --- teletype terminal: the motor idling while the paper is up
    if (st === "terminal" && !termHum) {
      termHum = S.play("teletype_idle", { loop: true, volume: 1.1 });
      if (termHum.isNull) termHum = null;
    }
    if (st !== "terminal" && termHum) {
      termHum.stop(0.3);
      termHum = null;
    }
    lastState = st;
    const inWorld = st === "play" || st === "goggles" || st === "cutscene";
    if (!inWorld || !P.alive) {
      A.hbT = 0;
      return;
    }
    // --- spots
    if (st === "play" || st === "goggles") {
      const c = A.ctxInfo;
      if (S.spaces) {
        try {
          if (c.inside) S.spaces.spots(c, realDt);
          else S.spaces.outdoorSpots(c, realDt);
        } catch (e) {
          G.reportError("sound:spaces:spots", e);
        }
      }
      for (const sp of SPOTS) {
        if (!sp.when(c)) continue;
        if (Math.random() < (sp.rate / 60) * realDt) {
          try {
            sp.fn(c);
          } catch (e) {
            G.reportError("sound:spot:" + sp.id, e);
          }
        }
      }
    }
    // --- Geiger counter
    const rr = P.radRate || 0;
    if (rr > 0.02 && st !== "dead") {
      const lambda = Math.min(110, 2.5 + 11 * Math.pow(rr, 0.85));
      let n = 0,
        L = lambda * realDt;
      // Poisson sample
      let p = Math.exp(-L),
        k = 1;
      while (k > p && n < 20) {
        k *= Math.random();
        n++;
      }
      n = Math.max(0, n - 1);
      for (let i = 0; i < n; i++) {
        const d = Math.random() * realDt;
        S.play("geiger", { delay: d, volume: 0.55 + Math.random() * 0.45 });
        if (Math.random() < 0.3)
          S.play("geiger", {
            delay: d + 0.004 + Math.random() * 0.012,
            volume: 0.4,
          });
      }
    }
    // --- swimming / splashing
    if (P.inWater && !A.lastWater && (P.vel.y < -3 || P.swimming))
      S.play("splash", { volume: S.clamp(-P.vel.y / 8, 0.3, 1) });
    A.lastWater = P.inWater;
    if (P.swimming && P.moveSpeed > 0.4) {
      A.swimT -= realDt;
      if (A.swimT <= 0) {
        A.swimT = 0.85;
        S.play("footstep_water", { volume: 0.7, pitch: 0.8 });
      }
    }
    // --- heartbeat & breath
    const ratio = P.maxHp > 0 ? P.hp / P.maxHp : 1;
    if (ratio < 0.3 && P.hp > 0) {
      A.hbT -= realDt;
      if (A.hbT <= 0) {
        const sev = (0.3 - ratio) / 0.3;
        A.hbT = 60 / (68 + sev * 62);
        A.breathT -= A.hbT;
        if (ratio < 0.15 && A.breathT <= 0) {
          A.breathT = 6 + Math.random() * 3;
          S.play("low_health", { volume: 0.6 + sev * 0.4 });
        } else S.play("heartbeat", { volume: 0.45 + sev * 0.55 });
      }
    } else {
      A.hbT = 0;
      A.breathT = 0;
    }
  };

  /** Stop all beds (e.g. context teardown). */
  A.stopBeds = function () {
    for (const b in A.beds) {
      A.beds[b].stop(1);
    }
    A.beds = {};
  };
  S.setEnvironmentOverride = function (name) {
    A.envOverride = name && S.ENVS[name] ? name : null;
    A.envT = 0;
  };
