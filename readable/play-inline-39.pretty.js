/* src/sound/60_ambience.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 60_ambience.js
 * Automatic world audio:
 *   - Ambience BEDS crossfaded by district / interior / altitude /
 *     time of day / weather / nearby water (wind, building whistle,
 *     city rumble, water lapping, crickets, cryo-unit hum, room tone,
 *     subway tunnel draft, rain, thunderstorm).
 *   - Positional SPOT sounds (distant gunfire exchanges & explosions,
 *     skyscraper steel groans, debris, crows, howls, Maniac screams,
 *     gulls & buoy bells near water, cryo-unit PA chimes, drips...).
 *   - Environment REVERB selection (canyon / street / open / room /
 *     hall / cryo / tunnel / stone) incl. "under a roof" detection.
 *   - Geiger counter driven by G.player.radRate (Poisson, clustered).
 *   - Low-health heartbeat + breathing and low-pass muffling.
 *   - Shell shock (explosions) & tinnitus, goggle display hum,
 *     teletype motor idle,
 *     footsteps & swimming.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const S = G._snd;

  const BEDS = [
    "amb_wind",
    "amb_whistle",
    "amb_city",
    "amb_water",
    "amb_crickets",
    "amb_cryo",
    "amb_room",
    "amb_tunnel",
    "amb_rain",
    "amb_storm",
    "amb_neon",
    "amb_neon_in",
  ];
  const A = (S.amb = {
    beds: {},
    target: {},
    level: {},
    envOverride: null,
    shock: null,
    hbT: 0,
    breathT: 0,
    gT: 0,
    envT: 0,
    spotT: 0,
    ctxInfo: {},
    lastWater: false,
    swimT: 0,
    BEDS,
  });
  BEDS.forEach((b) => {
    A.target[b] = 0;
    A.level[b] = 0;
  });
  /** More bed recipes the automatic mix may ask for (interior acoustics, 64_spaces.js). */
  A.addBeds = function (names) {
    for (const b of names)
      if (BEDS.indexOf(b) < 0) {
        BEDS.push(b);
        A.target[b] = 0;
        A.level[b] = 0;
      }
  };

  // ------------------------------------------------------------------
  // Context sampling
  // ------------------------------------------------------------------
  function isNight() {
    try {
      if (G.atmos && !G.isStub("atmos") && G.atmos.isNight)
        return !!G.atmos.isNight();
    } catch (e) {
      /* */
    }
    const h = G.time.hour;
    return h < 5.5 || h > 20.5;
  }
  function weather() {
    try {
      if (G.atmos && !G.isStub("atmos") && G.atmos.getWeather)
        return G.atmos.getWeather() || "clear";
    } catch (e) {
      /* */
    }
    return "clear";
  }
  const DIRS = [];
  for (let i = 0; i < 8; i++)
    DIRS.push([Math.cos((i * Math.PI) / 4), Math.sin((i * Math.PI) / 4)]);
  function waterFraction(p) {
    const L = G.LAYOUT;
    let w = 0;
    for (const d of DIRS) {
      if (L.isWater(p.x + d[0] * 30, p.z + d[1] * 30)) w += 1.5;
      if (L.isWater(p.x + d[0] * 70, p.z + d[1] * 70)) w += 1;
    }
    return Math.min(1, w / 12);
  }
  let roofProbe = { covered: false, h: 0 };
  function probeRoof(p) {
    try {
      const h = G.world.raycast(
        { x: p.x, y: p.y + 1.7, z: p.z },
        { x: 0, y: 1, z: 0 },
        60,
        { ignoreTags: ["actor", "prop_small"] },
      );
      roofProbe =
        h && h.collider
          ? { covered: true, h: h.dist }
          : { covered: false, h: 0 };
    } catch (e) {
      roofProbe = { covered: false, h: 0 };
    }
    return roofProbe;
  }
  function sampleContext() {
    // follow the ears (camera): in play they sit on the player, on the title screen they fly over the skyline
    const L = G.LAYOUT,
      lp = S.listenerPos;
    const useCam =
      G.state === "title" ||
      G.state === "chargen" ||
      G.state === "cutscene" ||
      !G.player;
    const p = useCam ? { x: lp.x, y: lp.y - 1.6, z: lp.z } : G.player.pos;
    const c = {
      px: p.x,
      pz: p.z,
      inside: L.isInterior(p.x),
      night: isNight(),
      weather: weather(),
      alt:
        p.y -
        Math.max(
          0,
          G.world.terrainHeight ? G.world.terrainHeight(p.x, p.z) : 0,
        ),
      district: "water",
      interior: null,
      water: 0,
      covered: false,
      roofH: 0,
      loc: null,
    };
    if (c.inside) {
      c.interior = S.music.nearestInterior(p);
      if (S.spaces) {
        try {
          S.spaces.sample(c, p);
        } catch (e) {
          G.reportError("sound:spaces", e);
        }
      }
    } else {
      if (S.spaces && S.spaces.key) S.spaces.outside();
      c.district = L.districtAt(p.x, p.z);
      c.water = waterFraction(p);
      const r = probeRoof(p);
      c.covered = r.covered;
      c.roofH = r.h;
      c.loc = L.locationAt(p.x, p.z);
      c.site = L.siteAt(p.x, p.z);
    }
    A.ctxInfo = c;
    return c;
  }

  function envFor(c) {
    if (A.envOverride) return A.envOverride;
    if (c.inside) {
      if (S.spaces) {
        const e = S.spaces.env(c);
        if (e && S.ENVS[e]) return e;
      }
      if (S.isStartLab(c.interior)) return "cryo";
      return (
        { subway: "tunnel", empire_lobby: "hall", liberty_pedestal: "stone" }[
          c.interior
        ] || "room"
      );
    }
    if (c.covered) return c.roofH > 12 ? "hall" : "room";
    if (c.alt > 40) return "open";
    if ((c.site && !c.site.height) || c.water > 0.45) return "open"; // parks, plazas, waterfront
    switch (c.district) {
      case "midtown":
      case "financial_district":
        return "canyon";
      case "central_park":
      case "harbor":
      case "water":
        return "open";
      default:
        return "outdoor";
    }
  }

  function computeTargets(c) {
    const t = {};
    BEDS.forEach((b) => (t[b] = 0));
    const st = G.state;
    if (c.inside) {
      if (S.isStartLab(c.interior)) {
        t.amb_cryo = 0.7;
      } else if (S.spaces && S.spaces.beds(c, t)) {
        /* per-archetype beds (64_spaces.js) */
      } else if (c.interior === "subway") {
        t.amb_tunnel = 0.85;
        t.amb_room = 0.2;
      } else {
        t.amb_room = 0.75;
        t.amb_wind = 0.06;
      }
      // The Neon's shops / clinic / club: the market is right outside the wall
      if (c.interior === "neon_interiors" && S.neonBusy)
        t.amb_neon_in = 0.5 * S.neonBusy();
    } else {
      const canyon =
        c.district === "midtown" || c.district === "financial_district";
      const openA =
        c.district === "central_park" ||
        c.district === "harbor" ||
        c.district === "water";
      const hi = S.clamp((c.alt - 15) / 60, 0, 1);
      let wind = 0.34 + (openA ? 0.14 : 0) + hi * 0.5 + c.water * 0.1;
      if (c.weather === "dust") wind += 0.3;
      if (c.weather === "thunderstorm") wind += 0.25;
      if (c.weather === "rain") wind += 0.1;
      t.amb_wind = wind;
      t.amb_whistle =
        (canyon ? 0.22 : 0.05) + hi * 0.35 + (c.weather === "dust" ? 0.15 : 0);
      t.amb_city = canyon
        ? 0.4
        : openA
          ? 0.08
          : c.district === "brooklyn"
            ? 0.3
            : 0.24;
      t.amb_water = c.water * 0.85;
      if (c.night && c.weather !== "rain" && c.weather !== "thunderstorm")
        t.amb_crickets =
          c.district === "central_park" ? 0.55 : 0.14 + c.water * 0.05;
      if (c.weather === "rain" || c.weather === "thunderstorm")
        t.amb_rain = 0.9;
      if (c.weather === "thunderstorm") t.amb_storm = 0.55;
      // The Neon (Times Square): the only crowd in New York — walla, trade and clatter, by the hour
      const nn = S.neonNear ? S.neonNear(c.px, c.pz) : 0;
      if (nn > 0) {
        t.amb_neon = 0.8 * nn * nn * S.neonBusy();
        t.amb_whistle *= 1 - 0.6 * nn;
        t.amb_wind *= 1 - 0.35 * nn;
        t.amb_crickets *= 1 - 0.8 * nn;
        if (c.covered) t.amb_neon *= 0.6;
      }
      if (c.covered) {
        t.amb_wind *= 0.4;
        t.amb_whistle *= 0.3;
        t.amb_rain *= 0.45;
        t.amb_crickets *= 0.4;
        t.amb_room = 0.25;
      }
    }
    // state-based damping
    let k = 1;
    if (st === "paused") k = 0.5;
    else if (st === "dead") k = 0.35;
    else if (st === "dialogue") k = 0.6;
    else if (st === "title" || st === "chargen") k = 0.35;
    else if (st === "loading") k = 0;
    for (const b in t) t[b] *= k;
    return t;
  }

  // ------------------------------------------------------------------
  // Spot sounds
  // ------------------------------------------------------------------
  function around(dMin, dMax, yMin, yMax) {
    const L = S.listenerPos,
      a = Math.random() * Math.PI * 2,
      d = S.rand(dMin, dMax);
    return {
      x: L.x + Math.cos(a) * d,
      y: L.y + S.rand(yMin || -2, yMax || 4),
      z: L.z + Math.sin(a) * d,
    };
  }
  function gunfireExchange() {
    const guns = [
      "gun_rifle",
      "gun_pistol",
      "gun_smg",
      "gun_hunting",
      "gun_laser",
      "gun_shotgun",
      "gun_rifle",
    ];
    const pos = around(160, 420, 0, 20);
    const pos2 = {
      x: pos.x + S.rand(-40, 40),
      y: pos.y,
      z: pos.z + S.rand(-40, 40),
    };
    const g1 = S.pick(guns),
      g2 = S.pick(guns);
    let t = 0;
    const n = 2 + ((Math.random() * 8) | 0);
    for (let i = 0; i < n; i++) {
      const auto = g1 === "gun_smg" || g1 === "gun_rifle";
      t += auto && Math.random() < 0.6 ? S.rand(0.08, 0.12) : S.rand(0.25, 0.9);
      const other = Math.random() < 0.35;
      S.play(other ? g2 : g1, {
        pos: other ? pos2 : pos,
        distant: true,
        noOcclusion: true,
        volume: 0.8,
        delay: t,
      });
    }
  }
  /** Spot definitions: rate = events per minute. */
  const SPOTS = [
    {
      id: "gunfire",
      rate: 1.1,
      when: (c) =>
        !c.inside && c.district !== "central_park" && c.district !== "water",
      fn: gunfireExchange,
    },
    {
      id: "gunfire_park",
      rate: 0.3,
      when: (c) => !c.inside && c.district === "central_park",
      fn: gunfireExchange,
    },
    {
      id: "explosion",
      rate: 0.12,
      when: (c) => !c.inside,
      fn: () =>
        S.play("explosion", {
          pos: around(300, 650, 0, 30),
          distant: true,
          noOcclusion: true,
          volume: 0.7,
        }),
    },
    {
      id: "creak",
      rate: 0.9,
      when: (c) =>
        !c.inside &&
        (c.district === "midtown" ||
          c.district === "financial_district" ||
          c.district === "midtown_south"),
      fn: () =>
        S.play("creak", { pos: around(25, 80, 15, 60), noOcclusion: true }),
    },
    {
      id: "debris",
      rate: 0.5,
      when: (c) =>
        !c.inside && c.district !== "central_park" && c.district !== "water",
      fn: () =>
        S.play("debris", {
          pos: around(20, 60, 0, 25),
          noOcclusion: true,
          volume: 0.7,
        }),
    },
    {
      id: "glass",
      rate: 0.1,
      when: (c) => !c.inside && c.district !== "water",
      fn: () =>
        S.play("glass_break", {
          pos: around(30, 80, 3, 30),
          noOcclusion: true,
          volume: 0.5,
        }),
    },
    {
      id: "crow",
      rate: 0.7,
      when: (c) => !c.inside && !c.night,
      fn: () =>
        S.play("crow", {
          pos: around(30, 90, 8, 30),
          noOcclusion: true,
          volume: 0.8,
        }),
    },
    {
      id: "bird",
      rate: 0.8,
      when: (c) =>
        !c.inside &&
        !c.night &&
        c.district === "central_park" &&
        c.weather === "clear",
      fn: () =>
        S.play("bird_chirp", { pos: around(15, 50, 3, 12), noOcclusion: true }),
    },
    {
      id: "howl",
      rate: 0.35,
      when: (c) => !c.inside && c.night,
      fn: () =>
        S.play("howl", {
          pos: around(150, 320, 0, 10),
          distant: true,
          noOcclusion: true,
        }),
    },
    {
      id: "maniac",
      rate: 0.3,
      when: (c) => !c.inside && c.night && c.district !== "water",
      fn: () =>
        S.play(Math.random() < 0.5 ? "maniac_scream" : "moan", {
          pos: around(90, 220, 0, 10),
          distant: true,
          noOcclusion: true,
          volume: 0.6,
        }),
    },
    {
      id: "gust",
      rate: 0.7,
      when: (c) => !c.inside,
      fn: (c) =>
        S.play("wind_gust", {
          volume: S.clamp(A.level.amb_wind * 1.3, 0.1, 1),
        }),
    },
    {
      id: "siren",
      rate: 0.03,
      when: (c) => !c.inside,
      fn: () => S.play("siren_distant", { volume: 0.5 }),
    },
    {
      id: "gull",
      rate: 1.0,
      when: (c) => !c.inside && c.water > 0.25 && !c.night,
      fn: () =>
        S.play("gull", {
          pos: around(40, 120, 10, 30),
          noOcclusion: true,
          volume: 0.7,
        }),
    },
    {
      id: "buoy",
      rate: 0.6,
      when: (c) => !c.inside && c.water > 0.3,
      fn: () =>
        S.play("buoy_bell", {
          pos: around(150, 300, 0, 2),
          noOcclusion: true,
          distant: true,
        }),
    },
    {
      id: "flies",
      rate: 0.25,
      when: (c) => !c.inside && !c.night && c.weather === "clear",
      fn: () =>
        S.play("fly_buzz", { pos: around(1, 3, 0, 1.5), noOcclusion: true }),
    },
    {
      id: "thunder",
      rate: 1.4,
      when: (c) =>
        !c.inside &&
        (c.weather === "rain" || c.weather === "thunderstorm") &&
        G.isStub("atmos"),
      /* atmosphere plays thunder synced to its lightning */ fn: () =>
        S.play("thunder", { volume: 0.5 + Math.random() * 0.5 }),
    },
    // the cryo unit
    {
      id: "pa",
      rate: 0.3,
      when: (c) => c.inside && S.isStartLab(c.interior),
      fn: () =>
        S.play("pa_chime", {
          pos: around(15, 30, 2, 4),
          noOcclusion: true,
          volume: 0.6,
        }),
    },
    {
      id: "vclank",
      rate: 1.0,
      when: (c) => c.inside && S.isStartLab(c.interior),
      fn: () =>
        S.play("machinery_clank", {
          pos: around(10, 35, -3, 3),
          noOcclusion: true,
          volume: 0.5,
        }),
    },
    {
      id: "vsteam",
      rate: 0.4,
      when: (c) => c.inside && S.isStartLab(c.interior),
      fn: () =>
        S.play("steam_hiss", {
          pos: around(6, 20, 0, 3),
          noOcclusion: true,
          volume: 0.5,
        }),
    },
    // subway & other interiors
    {
      id: "drip",
      rate: 5,
      when: (c) => !S.spaces && c.inside && !S.isStartLab(c.interior),
      fn: () => S.play("drip", { pos: around(3, 18, 0, 3), noOcclusion: true }),
    },
    {
      id: "rats",
      rate: 0.7,
      when: (c) => !S.spaces && c.inside && c.interior === "subway",
      fn: () =>
        S.play("burrowrat_squeak", {
          pos: around(6, 25, -1, 0),
          noOcclusion: true,
          pitch: 1.7,
          volume: 0.5,
        }),
    },
    {
      id: "imoan",
      rate: 0.35,
      when: (c) => !S.spaces && c.inside && c.interior === "subway",
      fn: () =>
        S.play("moan", {
          pos: around(25, 60, -1, 1),
          noOcclusion: true,
          volume: 0.5,
        }),
    },
    {
      id: "icreak",
      rate: 0.5,
      when: (c) => !S.spaces && c.inside && !S.isStartLab(c.interior),
      fn: () =>
        S.play("creak", {
          pos: around(8, 30, 2, 10),
          noOcclusion: true,
          volume: 0.5,
        }),
    },
    {
      id: "idebris",
      rate: 0.3,
      when: (c) => !S.spaces && c.inside && !S.isStartLab(c.interior),
      fn: () =>
        S.play("debris", {
          pos: around(8, 30, 0, 6),
          noOcclusion: true,
          volume: 0.5,
        }),
    },
  ];

  // ------------------------------------------------------------------
  // Effects: shell shock, tinnitus, low health
  // ------------------------------------------------------------------
  S.shellShock = function (amount, dur) {
    if (!S.ctx) return;
    const now = S.ctx.currentTime;
    const prev = A.shock && now < A.shock.t0 + A.shock.dur ? A.shock : null;
    if (prev && prev.amt > amount) return;
    A.shock = { amt: S.clamp(amount, 0, 1), t0: now, dur: Math.max(0.3, dur) };
  };
  S.tinnitus = function (amount, dur) {
    const ctx = S.ctx;
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.frequency.value = 3900 + Math.random() * 600;
    const o2 = ctx.createOscillator();
    o2.frequency.value = o.frequency.value * 1.005;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05 * amount, t + 0.15);
    g.gain.setTargetAtTime(0, t + dur * 0.3, dur / 3);
    o.connect(g);
    o2.connect(g);
    g.connect(S.bus.ui);
    o.start(t);
    o2.start(t);
    o.stop(t + dur + 1);
    o2.stop(t + dur + 1);
  };
  function worldCutoff() {
    let cut = 20000;
    const now = S.ctx.currentTime;
    if (A.shock) {
      const k = (now - A.shock.t0) / A.shock.dur;
      if (k >= 1) A.shock = null;
      else {
        const lo = 350 + (1 - A.shock.amt) * 2500;
        cut = Math.min(
          cut,
          Math.exp(
            Math.log(lo) + (Math.log(20000) - Math.log(lo)) * Math.pow(k, 1.6),
          ),
        );
      }
    }
    const P = G.player;
    if (P && P.alive && P.maxHp > 0 && G.state !== "title") {
      const r = P.hp / P.maxHp;
      if (r < 0.2) cut = Math.min(cut, 1400 + (r / 0.2) * 7000);
    }
    if (G.state === "dead") cut = Math.min(cut, 900);
    if (P && P.swimming && P.pos.y < G.world.waterLevel - 1.4)
      cut = Math.min(cut, 700); // head under water
    return cut;
  }

  // ------------------------------------------------------------------
  // Beds lifecycle
  // ------------------------------------------------------------------
  let bedsWanted = false;
  A.startBeds = function () {
    bedsWanted = true;
  };
  function ensureBed(name) {
    if (A.beds[name] && A.beds[name].playing === false) delete A.beds[name]; // stopped from outside: restart
    if (A.beds[name]) return A.beds[name];
    if (!S.cache[name]) {
      if (!A["q_" + name]) {
        A["q_" + name] = true;
        S.task(() => S.bakeNow(name));
      }
      return null;
    }
    const h = S.play(name, { loop: true, volume: 0.0001, randomStart: true });
    if (h && !h.isNull) {
      A.beds[name] = h;
      h._lvl = 0;
    }
    return A.beds[name] || null;
  }

  // ------------------------------------------------------------------
  // Footsteps / swimming
  // ------------------------------------------------------------------
  const SURF = (S.SURF = {
    concrete: "concrete",
    metal: "metal",
    grass: "grass",
    dirt: "dirt",
    wood: "wood",
    water: "water",
    carpet: "carpet",
    rubble: "rubble",
    asphalt: "concrete",
    stone: "concrete",
    tile: "concrete",
    sand: "dirt",
    mud: "dirt",
    gravel: "rubble",
    glass: "rubble",
  });
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
})();
