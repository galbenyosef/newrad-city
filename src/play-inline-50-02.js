// play-inline-50 02 — opts
// Lines 17-346 of readable/play-inline-50.pretty.js (statement-aligned).
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
