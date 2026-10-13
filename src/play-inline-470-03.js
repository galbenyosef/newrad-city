// play-inline-470 03 — the
// Lines 363-526 of readable/play-inline-470.pretty.js (statement-aligned).
  const _rc = new THREE.Color();
  function updateRim() {
    const u = L.shared.uRim.value;
    let hemi = null;
    try {
      hemi = G.baseLights && G.baseLights.hemi;
    } catch (e) {
      hemi = null;
    }
    if (hemi && hemi.color && hemi.visible !== false) {
      _rc
        .copy(hemi.color)
        .multiplyScalar(Math.min(2.5, hemi.intensity || 0) * 0.085);
      const indoor =
        G.player &&
        G.player.pos &&
        G.LAYOUT &&
        G.LAYOUT.INTERIOR_X_MIN &&
        G.player.pos.x >= G.LAYOUT.INTERIOR_X_MIN;
      if (indoor) _rc.multiplyScalar(0.7);
      u.lerp(_rc, 0.1);
    }
  }

  // ------------------------------------------------------------------
  // Module
  // ------------------------------------------------------------------
  G.registerModule({
    name: "characters",
    order: 35,
    init() {
      L.atlas();
      L.envMap();
      // warm the template cache with the most common spawns (keeps first-contact hitch-free)
      const t0 = performance.now();
      for (const t of [
        "raider",
        "maniac",
        "giant_roach",
        "brute",
        "burrow_rat",
      ]) {
        if (performance.now() - t0 > 700) break;
        try {
          C.preload([t], 1);
        } catch (e) {
          G.reportError("init:characters", e);
        }
      }
      if (L.hookFaceEvents) L.hookFaceEvents(); // dialogue lip-sync / eye contact
      G.events.on("reset", () => {
        L.gibs.clear();
        // our own debug lineup never outlives a game
        for (const c of lineupChars) c.dispose();
        lineupChars.length = 0;
        L.resetGen = (L.resetGen || 0) + 1;
      });
      G.events.on("newGame", () => {
        try {
          spawnLineup();
        } catch (e) {
          G.reportError("chars.lineup", e);
        }
        // leak check: characters from the previous game that nobody disposed
        setTimeout(() => {
          let leaked = 0;
          for (const ch of L.live)
            if (!ch.disposed && (ch._gen || 0) < (L.resetGen || 0)) leaked++;
          if (leaked)
            console.warn(
              "[characters] " +
                leaked +
                " Character(s) from a previous game were never dispose()d (still in G.chars.list()).",
            );
        }, 0);
      });
    },
    update(dt) {
      L.gibs.update(dt);
      if (G.SHOT && lineupChars.length) focusLineupCam();
    },
    lateUpdate(dt, realDt) {
      updateRim();
      // crowd far tier (frozen per-template instances) + shadow-caster budget
      if (L.crowdUpdate) {
        try {
          L.crowdUpdate();
        } catch (e) {
          G.reportError("chars.crowd", e);
        }
      }
      // Face-cache bookkeeping + idle-frame prefetch. Every face within the
      // prefetch radius counts as "needed" (refreshed every 30 frames, well
      // inside the cache's 120-frame staleness window), so the soft-cap LRU
      // never evicts a prefetched face that prefetch would then repaint (the
      // old evict → repaint → evict wave through the 16–28 m band).
      const PREFETCH_D2 = 28 * 28;
      const fr = G.time ? G.time.frame : 0;
      if (fr % 30 === 0)
        for (const ch of L.live) {
          const t = ch.tpl;
          if (
            ch.face &&
            t &&
            t.faceTex &&
            !ch.disposed &&
            ch._visD2 !== undefined &&
            ch._visD2 < PREFETCH_D2
          )
            t._faceNeed = fr;
        }
      // Prefetch: when no face map was built this frame and the frame is cheap,
      // paint the nearest RENDERED faced character within 28 m so faces are
      // ready before anyone reaches dialogue distance (no pop-in / hitch at
      // 16 m). Never past the hard cap (that would evict a needed face).
      if (
        L.faceBuiltThisFrame &&
        !L.faceBuiltThisFrame() &&
        (realDt || dt) < 1 / 45 &&
        G.camera &&
        fr % 3 === 0 &&
        (!L.faceTexCount || L.faceTexCount() < L.MAX_FACE_TEX_HARD)
      ) {
        let best = null,
          bd = PREFETCH_D2,
          crowdBest = null,
          cbd = 60 * 60;
        const roomSoft = !L.faceTexCount || L.faceTexCount() < L.MAX_FACE_TEX;
        for (const ch of L.live) {
          if (!ch.face || ch.disposed || ch.dead || !ch.tpl || ch.tpl.faceTex)
            continue;
          const d2 = ch._visD2 === undefined ? Infinity : ch._visD2;
          if (ch.tpl.faceTexLo) {
            if (d2 < L.FACE_HI_D2 && d2 < bd) {
              bd = d2;
              best = ch;
            }
            continue;
          } // lo copy is enough beyond 8 m
          if (d2 < bd) {
            bd = d2;
            best = ch;
          }
          // crowd members out to 60 m are queued too (faces painted while the player walks up,
          // only into free soft-cap room so nothing needed is evicted)
          else if (roomSoft && ch.crowd && d2 < cbd) {
            cbd = d2;
            crowdBest = ch;
          }
        }
        if (best) best.ensureFaceTexture();
        else if (crowdBest) crowdBest.ensureFaceTexture(false, 0);
        else if (L.crowdWarmStep) L.crowdWarmStep(); // spare frame: crowd archetype templates (G.chars.warmCrowd)
      }
      // Auto-update characters nobody else is driving (lineups, cutscene props, stubs).
      // Detached / hidden rigs (streamed-out actors, unused stand-in avatars) cost nothing.
      const frame = G.time ? G.time.frame : 0;
      for (const ch of L.live) {
        if (!ch.autoUpdate || ch.disposed) continue;
        if (!ch.root.parent || !ch.root.visible) continue;
        if (frame - ch._extFrame > 2) ch._tick(dt);
      }
    },
  });
