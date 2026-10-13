// play-inline-21 14 — math
// Lines 3963-4257 of readable/play-inline-21.pretty.js (statement-aligned).
  function autoDetect(m, obj) {
    if (!m.map || m.onBeforeCompile !== protoOBC || isSurfaceTile(m.map))
      return 0;
    const ud = m.userData || {};
    if (ud.txWin || ud.txWinGrid || ud.noAutoWindows) return 0;
    const nm = m.name || "";
    const src = m.map.source || m.map;
    let spec = autoBySource.get(src);
    if (spec === undefined) {
      const img = m.map.image;
      spec = null;
      if (
        img &&
        ((typeof HTMLCanvasElement !== "undefined" &&
          img instanceof HTMLCanvasElement) ||
          (typeof HTMLImageElement !== "undefined" &&
            img instanceof HTMLImageElement &&
            img.complete) ||
          (typeof ImageBitmap !== "undefined" && img instanceof ImageBitmap))
      ) {
        detectWindowGrid.why = "";
        try {
          spec = detectWindowGrid(
            img,
            AUTO_WIN_NAME.test(nm) ? nm : "",
            !!m.emissiveMap,
          );
        } catch (e) {
          spec = null;
          detectWindowGrid.why = "ERR " + e.message;
        }
        if (!spec && AUTO_WIN_NAME.test(nm) && X.autoWinRej.length < 40)
          X.autoWinRej.push(nm + ": " + detectWindowGrid.why);
      }
      autoBySource.set(src, spec);
    }
    if (!spec) return 0;
    MATS.trackWindows(m, spec);
    if (!m.userData.txWinGrid) return 0;
    if (X.autoWin.length < 64)
      X.autoWin.push({
        name: nm || "obj:" + ((obj && (obj.name || obj.type)) || ""),
        cells: spec.cells,
        win: spec.win,
        glass: spec.glass,
        score: spec.score,
        cons: spec.cons,
      });
    return 1;
  }
  /** Full sweep now (all subtrees, incl. hidden ones): patch foreign window-grid façades. Returns the count patched. */
  function autoWindows() {
    if (!G.scene || !winOK() || autoOff || Q.low) return 0;
    let n = 0;
    G.scene.traverse((o) => {
      const m = o.material;
      if (!m) return;
      if (Array.isArray(m)) {
        for (const mm of m) n += autoVisit(mm, o);
      } else n += autoVisit(m, o);
    });
    return n;
  }
  /** Load-time sweep (initDone / newGame): one traversal for clones (with macro install) + window grids. */
  function fullSweep() {
    if (!G.scene) return;
    const auto = winOK() && !autoOff && !Q.low;
    G.scene.traverse((o) => {
      const m = o.material;
      if (!m) return;
      const one = (mm) => {
        scanVisit(mm, true);
        if (auto) {
          try {
            autoVisit(mm, o);
          } catch (e) {
            /* optional */
          }
        }
      };
      if (Array.isArray(m)) m.forEach(one);
      else one(m);
    });
  }
  const autoOff = !!(G.QS && G.QS.get && G.QS.get("autowin") === "0");
  MATS.autoWindows = autoWindows;

  // ------------------------------------------------------------------
  // Night / flicker driver
  // ------------------------------------------------------------------
  let forcedNight = null,
    curNight = 0;
  function nightFromHour(h) {
    // 0 at midday, 1 at night; smooth dusk (18-20.5) & dawn (5-7)
    if (h >= 7 && h <= 18) return 0;
    if (h > 18 && h < 20.5) return (h - 18) / 2.5;
    if (h > 5 && h < 7) return 1 - (h - 5) / 2;
    return 1;
  }
  X.nightFromHour = nightFromHour;
  function computeNight() {
    if (forcedNight !== null) return forcedNight;
    // Prefer the atmosphere module's own factor so glow matches the sky exactly.
    try {
      if (!G.isStub("atmos") && typeof G.atmos.nightFactor === "function") {
        const v = G.atmos.nightFactor();
        if (typeof v === "number" && isFinite(v))
          return Math.max(0, Math.min(1, v));
      }
    } catch (e) {
      /* fall through */
    }
    // NB: hour 0 (midnight) is valid — never use `hour || 12`.
    const hr =
      G.time && typeof G.time.hour === "number" && isFinite(G.time.hour)
        ? G.time.hour
        : 12;
    return nightFromHour(((hr % 24) + 24) % 24);
  }
  X.computeNight = computeNight;

  let scanT = 0,
    trimT = 0;
  function update(dt, realDt) {
    let n = computeNight();
    // indoors, neon & lit windows read like night
    if (
      G.player &&
      G.player.pos &&
      G.LAYOUT &&
      G.player.pos.x >= G.LAYOUT.INTERIOR_X_MIN
    )
      n = Math.max(n, 0.8);
    // weather darkness (thunderstorm/overcast) boosts glow a little
    try {
      if (!G.isStub("atmos") && G.atmos.getWeather) {
        const w = G.atmos.getWeather();
        if (w === "thunderstorm" || w === "rain" || w === "overcast")
          n = Math.max(n, 0.35);
      }
    } catch (e) {
      /* ignore */
    }
    // ease towards the target so entering/leaving interiors or weather changes don't pop
    const k = Math.min(1, (realDt || 0.016) * 2.5);
    curNight += (n - curNight) * (Math.abs(n - curNight) < 0.002 ? 1 : k);
    // wet streets at night: neon and fire read brighter (the reflections themselves are the atmosphere module's nrcWet patch)
    let wet = 0;
    try {
      if (!G.isStub("atmos") && typeof G.atmos.wetness === "function") {
        const w = +G.atmos.wetness();
        if (isFinite(w)) wet = Math.max(0, Math.min(1, w));
      }
    } catch (e) {
      wet = 0;
    }
    const wetK = 1 + 0.18 * wet * curNight;
    // Flicker lives in the shader (per object, see FLK_*); the CPU only writes the day/night base value, and only when it
    // changes. Materials whose flicker patch is not compiled (driver fallback) keep the old CPU flicker.
    const t = (G.time && G.time.real) || now() / 1000;
    uTxTime.value = t % 3600;
    // falling rain (outdoors, not sheltered) for the ripple rings in the standing water
    let rain = 0;
    try {
      if (
        !G.isStub("atmos") &&
        typeof G.atmos.getWeatherParams === "function"
      ) {
        const wp = G.atmos.getWeatherParams();
        const r = wp ? +wp.rain : 0;
        if (isFinite(r)) rain = Math.max(0, Math.min(1, r));
        if (G.atmos.isSheltered && G.atmos.isSheltered()) rain = 0;
      }
    } catch (e) {
      rain = 0;
    }
    if (
      G.player &&
      G.player.pos &&
      G.LAYOUT &&
      G.player.pos.x >= G.LAYOUT.INTERIOR_X_MIN
    )
      rain = 0;
    uTxWet.value.set(
      WET_DEV >= 0 ? WET_DEV : wet,
      t % 3600,
      WET_DEV >= 0 ? Math.min(1, WET_DEV * 1.2) : rain,
      0,
    );
    for (let i = 0; i < glowList.length; i++) {
      const e = glowList[i];
      let v = e.d + (e.n - e.d) * curNight;
      if (e.f) {
        v *= wetK;
        if (!flkPatched.has(e.mat)) {
          const s =
            Math.sin(t * 13.1 * e.rate + e.ph) + Math.sin(t * 7.3 + e.ph * 2.1);
          v *= s > 1.82 ? 0.25 : 0.93 + 0.07 * Math.sin(t * 50 + e.ph);
        }
      }
      if (Math.abs(e.mat.emissiveIntensity - v) > 1e-3)
        e.mat.emissiveIntensity = v;
    }
    // quality tier (cheap: two property reads; a recompile only when crossing 'low')
    readQuality();
    updateSky();
    // periodic discovery of clones & window grids, time-sliced (<= 1.5 ms per frame)
    // (clones of our materials self-register at compile; this slow sweep only catches foreign copies)
    scanT += realDt || 0;
    if (sweep || scanT > 12) {
      if (!sweep) scanT = 0;
      try {
        sweepStep(1.5);
      } catch (e) {
        sweep = null; /* scene mid-rebuild */
      }
    }
    if (initDone) {
      trimT += realDt || 0;
      if (trimT > 6) {
        trimT = 0;
        trim(45000);
      }
    }
  }

  // ------------------------------------------------------------------
  // Install
  // ------------------------------------------------------------------
  G.tex = TEX;
  G.mats = MATS;

  G.registerModule({
    name: "textures",
    order: 10,
    init(G) {
      try {
        maxAniso = Math.min(8, G.renderer.capabilities.getMaxAnisotropy());
      } catch (e) {
        maxAniso = 4;
      }
      curNight = computeNight();
      try {
        installShaderGuard();
      } catch (e) {
        /* optional */
      }
      try {
        readQuality();
      } catch (e) {
        /* atmosphere not up yet: defaults */
      }
      try {
        // first CPU trim 2 s after init (textures uploaded by the first frames), then every 6 s of frame time
        G.events.on("initDone", () => {
          initDone = true;
          trimT = 4;
          readQuality();
          fullSweep();
        });
        G.events.on("newGame", () => {
          sweep = null;
          fullSweep();
        });
      } catch (e) {
        initDone = true;
      }
      // Give web fonts a brief chance to load before any lettering is rasterised.
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      let p = Promise.resolve();
      try {
        if (document.fonts && document.fonts.load) {
          p = Promise.race([
            Promise.all(
              [
                "700 20px Oswald",
                '20px "Special Elite"',
                "20px VT323",
                '20px "Share Tech Mono"',
              ].map((f) => document.fonts.load(f).catch(() => null)),
            ),
            wait(450),
          ]);
        }
      } catch (e) {
        /* ignore */
      }
      return p.then(() => {
        // Pre-generate the handful of surfaces virtually every module uses.
        TEX.prewarm(["concrete", "asphalt"]);
        if (X.debugInit) X.debugInit();
      });
    },
    update,
  });
