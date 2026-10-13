// play-inline-39 02 — inside
// Lines 326-674 of readable/play-inline-39.pretty.js (statement-aligned).
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
