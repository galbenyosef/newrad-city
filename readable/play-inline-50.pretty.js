/* src/atmosphere/30_weather.js */
/* =====================================================================
 * ATMOSPHERE — weather
 * States: clear, overcast, rain, dust (dust storm), thunderstorm, fog.
 * Smoothly blends a parameter set (A.weather.cur) that the sky, lighting,
 * water, particles and post-fx read. Automatic weather rotation (weighted,
 * thunderstorms are announced), wind that slowly veers, lightning with
 * multi-flicker flashes, visible bolts and delayed thunder (frequent in a
 * thunderstorm). A preset's `rad` > 0 would irradiate the player under open
 * sky (roof probe); no current weather does. Emits `weatherChanged(name)`.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._,
    ATMOS = G.atmos;
  const { clamp, lerp } = A;

  const C = (h) => new THREE.Color(h);
  const PRESETS = {
    clear: {
      fogH: 70,
      haze: 0.12,
      cloud: 0.22,
      cloudDark: 0.0,
      fogMul: 1.0,
      fogTint: C("#b4b490"),
      fogTintAmt: 0.0,
      sunMul: 1.0,
      rain: 0,
      dust: 0,
      rad: 0,
      wind: 3,
      lightning: 0,
      flashColor: C("#d8e4ff"),
    },
    overcast: {
      fogH: 95,
      haze: 0.22,
      cloud: 0.78,
      cloudDark: 0.45,
      fogMul: 1.35,
      fogTint: C("#8c9084"),
      fogTintAmt: 0.18,
      sunMul: 0.5,
      rain: 0,
      dust: 0,
      rad: 0,
      wind: 5,
      lightning: 0,
      flashColor: C("#d8e4ff"),
    },
    rain: {
      fogH: 130,
      haze: 0.46,
      cloud: 0.96,
      cloudDark: 0.78,
      fogMul: 2.2,
      fogTint: C("#6c7672"),
      fogTintAmt: 0.32,
      sunMul: 0.28,
      rain: 1,
      dust: 0,
      rad: 0,
      wind: 7,
      lightning: 0.28,
      flashColor: C("#cad8ff"),
    },
    dust: {
      fogH: 260,
      haze: 0.9,
      cloud: 0.45,
      cloudDark: 0.2,
      fogMul: 4.3,
      fogTint: C("#a88a5e"),
      fogTintAmt: 0.62,
      sunMul: 0.55,
      rain: 0,
      dust: 1,
      rad: 0,
      wind: 13,
      lightning: 0,
      flashColor: C("#ffe0b0"),
    },
    // thunderstorm: black-bellied clouds, heavy rain, strong wind, frequent white-blue lightning and thunder
    thunderstorm: {
      fogH: 150,
      haze: 0.5,
      cloud: 1.0,
      cloudDark: 0.88,
      fogMul: 2.5,
      fogTint: C("#5c6670"),
      fogTintAmt: 0.36,
      sunMul: 0.2,
      rain: 1,
      dust: 0,
      rad: 0,
      wind: 11,
      lightning: 1,
      flashColor: C("#e2eaff"),
    },
    fog: {
      fogH: 38,
      haze: 0.1,
      cloud: 0.4,
      cloudDark: 0.2,
      fogMul: 3.6,
      fogTint: C("#9ca296"),
      fogTintAmt: 0.38,
      sunMul: 0.6,
      rain: 0,
      dust: 0,
      rad: 0,
      wind: 1,
      lightning: 0,
      flashColor: C("#d8e4ff"),
    },
  };
  const NAMES = Object.keys(PRESETS);
  const RAD_PEAK = 0.6; // rads/s at the storm's peak, unsheltered, before rad resistance
  const WEIGHTS = {
    clear: 0.36,
    overcast: 0.24,
    rain: 0.13,
    dust: 0.11,
    thunderstorm: 0.09,
    fog: 0.07,
  };
  /** Old saves / links may still name the retired weather. */
  const ALIAS = { radstorm: "thunderstorm" };

  function copyParams(dst, src) {
    for (const k in src) {
      if (src[k] && src[k].isColor) {
        dst[k] =
          dst[k] && dst[k].isColor ? dst[k].copy(src[k]) : src[k].clone();
      } else dst[k] = src[k];
    }
    return dst;
  }

  const W = (A.weather = {
    name: "clear",
    prev: "clear",
    cur: copyParams({ windX: 3, windZ: 1, flash: 0 }, PRESETS.clear),
    target: PRESETS.clear,
    blendRate: 1 / 14,
    auto: true,
    next: 240,
    windAngle: 0.4,
    flashes: [], // [{t0, amp, decay}]
    lightningT: 6,
    radSrc: null,
    sheltered: false,
    shelterT: 0,
    roofH: 0,
    shelterVotes: 0,
    radT: 0, // seconds weather radiation has been ramping in (rad > 0 presets only)
    suppress: 0, // >0: automatic thunderstorms/dust storms held back (quest scenes)
    gustT: 5,
    startT: 0,
    wet: 0, // ground wetness 0..1 (drives the wet-surface shader patch in 00_core.js)
  });

  // ------------------------------------------------------------------
  function setWeather(name, opts) {
    opts = opts || {};
    name = ALIAS[name] || name;
    if (!PRESETS[name]) return false;
    const changed = name !== W.name;
    W.prev = W.name;
    W.name = name;
    W.target = PRESETS[name];
    W.blendRate = opts.instant ? 1e9 : 1 / (opts.duration || 14);
    if (opts.instant) {
      copyParams(W.cur, PRESETS[name]);
      W.wet = PRESETS[name].rain;
    }
    if (opts.auto !== undefined) W.auto = !!opts.auto;
    W.next = opts.hold || A.rr(170, 380);
    if (changed) {
      // the storm announces itself: first lightning within a second or two
      if (name === "thunderstorm") W.lightningT = A.rr(0.4, 1.6);
      if (name === "thunderstorm" && !opts.silent && G.state === "play")
        G.notify("A thunderstorm is rolling in.");
      else if (W.prev === "thunderstorm" && !opts.silent && G.state === "play")
        G.notify("The storm has passed.");
      else if (name === "dust" && !opts.silent && G.state === "play")
        G.notify("A dust storm is rolling in.");
      G.events.emit("weatherChanged", name, W.prev);
    }
    return true;
  }

  function pickNext() {
    let tot = 0;
    const cand = [];
    for (const n of NAMES) {
      if (n === W.name) continue;
      let w = WEIGHTS[n];
      if (n === "thunderstorm" && W.startT < 300) w = 0; // no thunderstorm in the first minutes of a game
      if ((n === "thunderstorm" || n === "dust") && W.suppress > 0) w = 0; // quest scene in progress
      if (n === "fog" && !(G.time.hour > 4 && G.time.hour < 10)) w *= 0.3; // mist is a morning thing
      // main-quest ending flags (quests): a cleaned sky loses the storms, "the cleaning" brings more of them
      const qf = (f) => {
        try {
          return (
            !G.isStub("quests") &&
            typeof G.quests.flag === "function" &&
            !!G.quests.flag(f)
          );
        } catch (e) {
          return false;
        }
      };
      if (qf("sky_clean")) {
        if (n === "thunderstorm" || n === "dust") w = 0;
        else if (n === "clear") w *= 1.8;
      } else if (qf("the_cleaning")) {
        if (n === "thunderstorm") w *= 3;
        else if (n === "clear") w *= 0.5;
      }
      cand.push([n, w]);
      tot += w;
    }
    let r = Math.random() * tot;
    for (const c of cand) {
      r -= c[1];
      if (r <= 0) return c[0];
    }
    return "clear";
  }

  // ------------------------------------------------------------------
  // Lightning
  // ------------------------------------------------------------------
  function strike(opts) {
    opts = opts || {};
    const cam = A.camPos;
    const close =
      opts.close || Math.random() < (W.name === "thunderstorm" ? 0.07 : 0.03);
    const ang = Math.random() * Math.PI * 2;
    const dist = opts.pos
      ? Math.hypot(opts.pos.x - cam.x, opts.pos.z - cam.z)
      : close
        ? A.rr(45, 90)
        : A.rr(160, 650);
    const gx = opts.pos ? opts.pos.x : cam.x + Math.cos(ang) * dist;
    const gz = opts.pos ? opts.pos.z : cam.z + Math.sin(ang) * dist;
    const gy = opts.pos ? opts.pos.y : Math.max(0, A.groundAt(gx, gz));
    // flicker sequence
    const now = A.animTime,
      amp = clamp(1.4 - dist / 700, 0.35, 1.3);
    const n = 2 + ((Math.random() * 3) | 0);
    let t = 0;
    for (let i = 0; i < n; i++) {
      W.flashes.push({
        t0: now + t,
        amp: amp * (i === 0 ? 1 : A.rr(0.4, 0.9)),
        decay: A.rr(9, 16),
      });
      t += A.rr(0.05, 0.16);
    }
    // visible bolt
    if (A.lightningBolt) {
      try {
        A.lightningBolt(
          new THREE.Vector3(gx, 320 + Math.random() * 120, gz),
          new THREE.Vector3(gx, gy, gz),
          W.target.flashColor || W.cur.flashColor,
          dist,
        );
      } catch (e) {
        G.reportError("update:atmosphere/lightning", e);
      }
    }
    // close strike: light flash + sparks + scorch
    if (dist < 120 && !G.isStub("fx")) {
      try {
        G.fx.flash(
          new THREE.Vector3(gx, gy + 20, gz),
          W.cur.flashColor.getHex(),
          60,
          0.35,
          { range: 260 },
        );
        if (dist < 100) {
          G.fx.sparks(new THREE.Vector3(gx, gy + 0.3, gz), {
            count: 40,
            color: W.cur.flashColor,
          });
          G.fx.decal(
            new THREE.Vector3(gx, gy, gz),
            new THREE.Vector3(0, 1, 0),
            "scorch",
            { size: 3 },
          );
        }
      } catch (e) {
        /* ignore */
      }
    }
    // thunder (delayed by distance — speed of sound, capped). Runs on world-time
    // timers: it waits while the game is paused and is dropped on reset/load.
    const delay = Math.min(4, dist / 343);
    const vol = clamp(1.1 - dist / 800, 0.2, 1);
    G.events.emit("lightningStrike", {
      x: gx,
      y: gy,
      z: gz,
      dist,
      thunderDelay: delay,
      storm: W.name === "thunderstorm",
    });
    A.after(delay, () => {
      if (!G.worldRunning() || ATMOS.interior) return;
      playThunder(vol, dist);
      if (dist < 200 && G.player && G.player.shake)
        G.player.shake(0.25 * (1 - dist / 200), 0.6);
    });
  }
  /** Proper 'thunder' sample from the sound module when it has one; a pitched-down explosion otherwise. */
  function playThunder(vol, dist) {
    try {
      const S = G.sfx;
      const hasThunder =
        !G.isStub("sfx") && (typeof S.has !== "function" || S.has("thunder"));
      if (hasThunder)
        S.play("thunder", {
          volume: vol * (dist < 150 ? 1 : 0.8),
          pitch: dist < 150 ? A.rr(0.95, 1.1) : A.rr(0.78, 0.95),
        });
      else S.play("explosion", { volume: vol * 0.75, pitch: A.rr(0.32, 0.5) });
    } catch (e) {
      /* ignore */
    }
  }

  // ------------------------------------------------------------------
  // Shelter probe: several rays (straight up + 4 tilted) must mostly hit a
  // real roof. Small overhead clutter (lamp arms, signs, awnings, trees,
  // props) doesn't count, so standing under a street lamp is not "indoors",
  // while a roofless storefront shell stays exposed.
  // ------------------------------------------------------------------
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
})();
