// play-inline-39 01 — math
// Lines 21-325 of readable/play-inline-39.pretty.js (statement-aligned).
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
