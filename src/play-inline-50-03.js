// play-inline-50 03 — cur
// Lines 347-651 of readable/play-inline-50.pretty.js (statement-aligned).
  const SHELTER_IGNORE = [
    "actor",
    "interactable_self",
    "prop",
    "prop_car",
    "sign",
    "lamp",
    "tree",
    "railing",
    "fence",
    "cover",
    "barrier",
    "sandbags",
    "container",
    "planter",
    "skill_book",
    "food",
    "shiny",
    "weather_rad",
    "radstorm",
    "nuke_rad",
  ];
  const _rays = [
    [0, 1, 0],
    [0.34, 0.94, 0],
    [-0.34, 0.94, 0],
    [0, 0.94, 0.34],
    [0, 0.94, -0.34],
  ].map((d) => new THREE.Vector3(d[0], d[1], d[2]).normalize());
  const SHELTER_RANGE = 40; // a roof further up than this is "open sky" (deep canyons between towers don't count)
  /**
   * Returns the height of the roof above the eye (m) when sheltered, or 0 when exposed.
   * Straight-up must hit; then a LOW ceiling (≤ 8 m: storefronts, subway stairs, underpasses)
   * needs only 1 of the 4 tilted rays, a high one needs 2 — so you're safe a few steps inside a
   * doorway or under a bridge, but a lone girder overhead doesn't protect you.
   */
  function probeShelter(P) {
    const o = A.tmpV.set(P.pos.x, P.pos.y + 1.6, P.pos.z);
    const up = G.world.raycast(o, _rays[0], SHELTER_RANGE, {
      ignoreTags: SHELTER_IGNORE,
    });
    if (!up || !(up.dist > 0.05)) return 0;
    const need = up.dist <= 8 ? 1 : 2;
    let hits = 0;
    for (let i = 1; i < _rays.length; i++) {
      const h = G.world.raycast(o, _rays[i], SHELTER_RANGE, {
        ignoreTags: SHELTER_IGNORE,
      });
      if (h && h.dist > 0.05) hits++;
      if (hits >= need) return up.dist;
      if (hits + (_rays.length - 1 - i) < need) return 0;
    }
    return 0;
  }

  function updateFlash() {
    const now = A.animTime;
    let f = 0;
    for (let i = W.flashes.length - 1; i >= 0; i--) {
      const fl = W.flashes[i];
      const t = now - fl.t0;
      if (t < 0) continue;
      const v = fl.amp * Math.exp(-t * fl.decay);
      if (v < 0.003) {
        W.flashes.splice(i, 1);
        continue;
      }
      f += v;
    }
    W.cur.flash = Math.min(1.6, f);
  }

  // ------------------------------------------------------------------
  function update(dt, realDt, animDt) {
    const cur = W.cur,
      tgt = W.target;
    W.startT += dt;
    // blend params
    const k = W.blendRate > 1e6 ? 1 : 1 - Math.exp(-animDt * W.blendRate);
    for (const n in tgt) {
      const v = tgt[n];
      if (v && v.isColor) cur[n].lerp(v, k);
      else if (typeof v === "number") cur[n] = lerp(cur[n], v, k);
    }
    if (W.blendRate > 1e6) W.blendRate = 1 / 14;
    // wind veers slowly
    W.windAngle += animDt * 0.004 * Math.sin(A.animTime * 0.01);
    const gust =
      1 +
      0.35 * Math.sin(A.animTime * 0.37) * Math.sin(A.animTime * 0.11 + 1.3);
    cur.windX = Math.cos(W.windAngle) * cur.wind * gust;
    cur.windZ = Math.sin(W.windAngle) * cur.wind * gust;
    ATMOS.wind.set(cur.windX, 0, cur.windZ);
    // automatic rotation
    if (W.auto && dt > 0) {
      W.next -= dt;
      if (W.next <= 0) {
        // a scripted scene asked for calm: end a running storm early, don't start a new one
        if (W.suppress > 0 && (W.name === "thunderstorm" || W.name === "dust"))
          setWeather("overcast", { duration: 25 });
        else setWeather(pickNext(), { duration: 25 });
      }
    }
    // lightning
    const outdoors = !ATMOS.interior;
    const stormLightning = W.name === "thunderstorm" && cur.lightning > 0.08;
    if (
      (cur.lightning > 0.25 || stormLightning) &&
      tgt.lightning > 0.1 &&
      outdoors &&
      animDt > 0
    ) {
      W.lightningT -= animDt;
      if (W.lightningT <= 0) {
        W.lightningT =
          W.name === "thunderstorm"
            ? A.rr(2, 7.5)
            : A.rr(3.5, 13) / Math.max(0.3, cur.lightning);
        strike();
      }
    }
    updateFlash();
    if (!outdoors) cur.flash = 0;

    // wet streets: soak in over ~20 s of rain, dry out over ~90 s (world time, so it waits in menus)
    if (animDt > 0) {
      const wantWet = cur.rain > 0.35 ? cur.rain : 0;
      W.wet = A.damp(W.wet, wantWet, wantWet > W.wet ? 0.12 : 0.028, animDt);
      if (W.wet < 0.002 && wantWet === 0) W.wet = 0;
    }
    if (A.wetShared) {
      const wv = A.wetShared.nrcWet.value;
      wv.x = outdoors ? W.wet : 0; // interior cells are dry
      wv.y = clamp(W.wet * 1.2 - 0.2, 0, 1); // puddles spread once the ground is soaked
      wv.z = 45;
      // puddle tag for the post pass's screen-space reflections (only when it can use them)
      wv.w =
        outdoors &&
        A.post &&
        A.post.enabled &&
        A.post.depthValid &&
        ATMOS.perfTier < 2 &&
        A.post.puddleOpt !== false
          ? 1
          : 0;
      // raindrop rings in the puddles (x: ring clock, y: falling-rain strength)
      const rp = A.wetShared.nrcRip && A.wetShared.nrcRip.value;
      if (rp) {
        rp.x = (A.animTime * 1.35) % 997;
        rp.y = outdoors && !W.sheltered ? clamp(cur.rain, 0, 1) : 0;
      }
    }

    // shelter probe (is there a roof over the player?)
    const P = G.player;
    W.shelterT -= realDt;
    if (W.shelterT <= 0 && P && G.world && G.world.raycast) {
      W.shelterT = 0.5;
      let roof = 0;
      try {
        roof = A.isInteriorPos(P.pos.x) ? 3 : probeShelter(P);
      } catch (e) {
        roof = 0;
      }
      // a little hysteresis: two probes in a row must agree before the state flips (no flicker at doorways)
      const want = roof > 0;
      if (want === W.sheltered) W.shelterVotes = 0;
      else if (++W.shelterVotes >= 2 || A.envSnap) {
        W.sheltered = want;
        W.shelterVotes = 0;
      }
      if (roof > 0) W.roofH = roof;
    }
    // weather radiation on the player (only for a preset with rad > 0; none of the current weathers).
    // Ramps in over ~25 s and peaks at ~0.6 rads/s. Rad resistance is applied by the player/rpg side.
    const radOn = cur.rad > 0.2 && P && !A.isInteriorPos(P.pos.x);
    if (radOn) {
      if (!W.radSrc && G.world.addRadSource)
        W.radSrc = G.world.addRadSource({
          x: 0,
          y: 0,
          z: 0,
          radius: 60,
          strength: 0,
          tag: "weather_rad",
        });
      if (W.radSrc) {
        W.radT += dt;
        W.radSrc.x = P.pos.x;
        W.radSrc.y = P.pos.y + 1;
        W.radSrc.z = P.pos.z;
        const ramp = A.smooth(0, 25, W.radT);
        const want = W.sheltered ? 0 : cur.rad * RAD_PEAK * ramp;
        W.radSrc.strength = A.damp(W.radSrc.strength, want, 1.5, realDt);
      }
    } else {
      if (W.radSrc) {
        G.world.removeRadSource(W.radSrc);
        W.radSrc = null;
      }
      if (cur.rad < 0.05) W.radT = 0;
    }
    // wind gusts (dust storm / high wind)
    if (outdoors && animDt > 0 && (cur.dust > 0.3 || cur.wind > 8)) {
      W.gustT -= animDt;
      if (W.gustT <= 0) {
        W.gustT = A.rr(4, 10);
        try {
          G.sfx.play("wind_gust", {
            volume: clamp(0.25 + cur.dust * 0.5, 0, 0.8),
          });
        } catch (e) {
          /* ignore */
        }
      }
    }
  }

  function reset() {
    W.flashes.length = 0;
    W.cur.flash = 0;
    W.wet = W.cur.rain > 0.35 ? W.cur.rain : 0;
    W.sheltered = false;
    W.shelterT = 0;
    W.shelterVotes = 0;
    W.radT = 0;
    W.suppress = 0;
    if (W.radSrc) {
      G.world.removeRadSource(W.radSrc);
      W.radSrc = null;
    }
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  ATMOS.setWeather = (name, opts) => setWeather(name, opts);
  ATMOS.getWeather = () => W.name;
  ATMOS.weatherNames = () => NAMES.slice();
  ATMOS.setAutoWeather = (on) => {
    W.auto = !!on;
  };
  ATMOS.getWeatherParams = () => W.cur;
  /** Ground wetness 0..1 (rain soaks the streets, they dry slowly afterwards). */
  ATMOS.wetness = () => W.wet;
  /** Is the player under a roof (weather shelter; handy for others). */
  ATMOS.isSheltered = () => W.sheltered;
  /**
   * Hold back automatic thunderstorms / dust storms during scripted scenes (reference counted:
   * call suppressStorms(true) … suppressStorms(false)). A running storm is allowed to pass.
   */
  ATMOS.suppressStorms = (on) => {
    W.suppress = Math.max(0, W.suppress + (on === false ? -1 : 1));
    return W.suppress > 0;
  };
  /** Trigger a lightning strike (optionally at a world position). */
  ATMOS.lightning = (pos) =>
    strike(pos ? { pos: A.v3(pos) } : { close: false });

  function init() {
    // new game: begin with a clear (hazy) day so the reveal on leaving the cryo unit lands
    G.events.on("newGame", () => {
      W.startT = 0;
      const q = G.QS && G.QS.get("weather");
      if (q && PRESETS[ALIAS[q] || q])
        setWeather(q, { instant: true, auto: false, silent: true });
      else
        setWeather("clear", {
          instant: true,
          auto: true,
          silent: true,
          hold: A.rr(240, 420),
        });
    });
    G.save.register("atmos", {
      save: () => ({
        weather: W.name,
        next: +W.next.toFixed(1),
        auto: W.auto,
        startT: Math.round(W.startT),
        wind: +W.windAngle.toFixed(3),
        radT: Math.round(W.radT),
      }),
      load: (d) => {
        if (!d || typeof d !== "object") return; // old save / save made without atmosphere
        if (PRESETS[ALIAS[d.weather] || d.weather])
          setWeather(d.weather, {
            instant: true,
            silent: true,
            auto: d.auto !== false,
            hold: d.next || 200,
          });
        W.startT = d.startT || 999;
        if (isFinite(d.wind)) W.windAngle = d.wind;
        W.radT = isFinite(d.radT) ? d.radT : 30;
        if (W.name === "thunderstorm")
          A.after(1.2, () => {
            if (W.name === "thunderstorm" && G.state === "play")
              G.notify("A thunderstorm is raging overhead.");
          });
      },
    });
  }

  A.addSystem({ name: "weather", order: 5, init, update, reset });
