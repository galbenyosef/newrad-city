// play-inline-524 01 — math
// Lines 21-339 of readable/play-inline-524.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const K = G.ambient._;

  // weapon sound ids per side: [sfx, weight, fx kind, auto (0 single, 1 burst, 2 spray)]
  const GUNS = {
    raiders: [
      ["gun_pistol", 1, "pistol", 0],
      ["gun_smg", 1, "smg", 1],
      ["gun_shotgun", 0.7, "shotgun", 0],
      ["gun_pipe", 0.5, "rifle", 0],
    ],
    settlers: [
      ["gun_hunting", 1, "hunting", 0],
      ["gun_rifle", 1, "rifle", 1],
      ["gun_pistol", 0.6, "pistol", 0],
    ],
    covenant: [
      ["gun_gyrojet", 1.2, "gyro", 0],
      ["gun_rifle", 0.5, "rifle", 1],
      ["gun_minigun", 0.25, "minigun", 2],
    ],
    continuity: [
      ["gun_gyrojet", 1, "gyro", 0],
      ["gun_smg", 0.6, "smg", 1],
    ],
    brutes: [
      ["gun_rifle", 1, "rifle", 1],
      ["gun_minigun", 0.35, "minigun", 2],
      ["gun_hunting", 0.5, "hunting", 0],
    ],
    robots: [["gun_laser", 1, "ray", 0]],
  };
  const SCREAMS = {
    maniacs: ["maniac_scream", 1.0],
    creatures: ["brute_roar", 1],
    brutes: ["brute_roar", 0.9],
  };
  const PAIRS = [
    ["raiders", "settlers", 2],
    ["raiders", "covenant", 1],
    ["brutes", "covenant", 1.2],
    ["continuity", "covenant", 0.8],
    ["raiders", "brutes", 1],
    ["maniacs", "settlers", 0.8],
    ["brutes", "settlers", 0.8],
  ];
  const ENEMY_OF = {
    raiders: ["settlers", "covenant", "brutes"],
    brutes: ["covenant", "raiders", "settlers"],
    continuity: ["covenant"],
    maniacs: ["settlers", "raiders", "covenant", "brutes", "creatures"],
    robots: ["raiders", "settlers"],
    creatures: ["raiders", "settlers"],
  };
  const ACTOR_OF = {
    raiders: () => ({ type: "raider", faction: "raiders", voice: "raider" }),
    settlers: () => ({
      type: "human",
      outfit: K.pick([
        "settler",
        K.outfit("drifter", "settler"),
        "leather_armor",
      ]),
      faction: "settlers",
      name: "Scavenger",
      voice: "settler",
      weapon: K.pick(["hunting_rifle", "pistol_10mm", "combat_shotgun"]),
    }),
    covenant: () =>
      Math.random() < 0.35
        ? {
            type: "covenant_acolyte",
            faction: "covenant",
            voice: "covenant",
            name: "Covenant Acolyte",
          }
        : {
            type: "covenant_lancer",
            faction: "covenant",
            voice: "covenant",
            name: "Covenant Lancer",
          },
    continuity: () => ({
      type: "continuity_soldier",
      faction: "continuity",
      voice: "continuity",
      name: "Continuity Trooper",
    }),
    brutes: () => ({ type: "brute", faction: "brutes", voice: "brute" }),
    maniacs: () => ({ type: "maniac", faction: "maniacs" }),
    robots: () => ({ type: "patrolman", faction: "robots" }),
    creatures: () => ({
      type: K.pick(["burrow_rat", "dog"]),
      faction: "creatures",
    }),
  };

  // ------------------------------------------------------------------
  // Event pool
  // ------------------------------------------------------------------
  const EV = [];
  for (let i = 0; i < K.CFG.FIREFIGHT_MAX_EVENTS; i++)
    EV.push({
      on: false,
      t: 0,
      kind: 0,
      snd: "",
      fx: "",
      x: 0,
      y: 0,
      z: 0,
      x2: 0,
      y2: 0,
      z2: 0,
      vol: 1,
      pitch: 1,
    });
  const E_SHOT = 1,
    E_BOOM = 2,
    E_SOUND = 3;
  function schedule(t, kind) {
    for (const e of EV)
      if (!e.on) {
        e.on = true;
        e.t = t;
        e.kind = kind;
        return e;
      }
    return null;
  }
  function clearEvents() {
    for (const e of EV) e.on = false;
  }
  const _a = new THREE.Vector3(),
    _b = new THREE.Vector3(),
    _d = new THREE.Vector3();

  function fire(e) {
    _a.set(e.x, e.y, e.z);
    if (e.kind === E_SOUND) {
      K.sfx(e.snd, { pos: _a, distant: true, volume: e.vol, pitch: e.pitch });
      return;
    }
    if (e.kind === E_BOOM) {
      K.sfx("explosion", { pos: _a, distant: true, volume: 1 });
      if (!G.isStub("fx")) {
        try {
          G.fx.explosion(_a, 2.6, "grenade");
        } catch (err) {
          /* ignore */
        }
        try {
          const h = G.fx.smoke(_a, 2.2, { dark: true });
          if (h && h.expire) h.expire(35);
          else if (h && h.stop)
            setTimeout(() => {
              try {
                h.stop();
              } catch (x) {
                /* ignore */
              }
            }, 35000);
        } catch (err) {
          /* ignore */
        }
      }
      return;
    }
    // shot
    K.sfx(e.snd, { pos: _a, distant: true, volume: e.vol, pitch: e.pitch });
    if (G.isStub("fx")) return;
    _b.set(e.x2, e.y2, e.z2);
    try {
      if (e.fx === "ray")
        G.fx.laserBeam(_a, _b, "red", { width: 0.12, life: 0.12 });
      else if (e.fx === "arc")
        G.fx.laserBeam(_a, _b, "blue", { width: 0.18, life: 0.18 });
      else if (Math.random() < 0.45)
        G.fx.tracer(_a, _b, 0xffd890, { width: 0.09 });
      if (K.isDark() && typeof G.fx.muzzleFlash === "function") {
        _d.subVectors(_b, _a).normalize();
        G.fx.muzzleFlash(
          _a,
          _d,
          e.fx === "gyro" ? "gyro" : e.fx === "ray" ? "laser" : "rifle",
          { noLight: true, scale: 3.5 },
        );
      }
    } catch (err) {
      /* ignore */
    }
  }

  // ------------------------------------------------------------------
  // Firefight
  // ------------------------------------------------------------------
  let FF = null;
  let nextFightT = 0,
    nextSoundT = 0;
  function side(faction, x, z) {
    return {
      faction,
      x,
      y: G.world.groundHeight(x, z, 2, 0.2) + 1.3,
      z,
      guns: GUNS[faction] || null,
    };
  }
  function pickSite() {
    const P = G.player.pos,
      Ly = G.LAYOUT;
    if (Math.random() < 0.6) {
      const locs = Ly.LOCATIONS.filter(
        (l) => l.hostile && !l.interior && !l.sub && ENEMY_OF[l.faction],
      );
      const near = locs.filter((l) => {
        const d = Math.hypot(l.x - P.x, l.z - P.z);
        return d > 180 && d < 520;
      });
      if (near.length) {
        const l = K.pick(near);
        const s = K.streetSpot(l.x, l.z, 5, l.r + 25, { road: true, clear: 1 });
        if (s)
          return {
            x: s.x,
            z: s.z,
            a: l.faction,
            b: K.pick(ENEMY_OF[l.faction]),
            loc: l.id,
          };
      }
    }
    const s = K.streetSpot(P.x, P.z, 200, 450, {
      road: true,
      notSettlement: true,
      clear: 1,
    });
    if (!s) return null;
    const pair = K.weighted(PAIRS.map((p) => [p, p[2]]));
    return Math.random() < 0.5
      ? { x: s.x, z: s.z, a: pair[0], b: pair[1] }
      : { x: s.x, z: s.z, a: pair[1], b: pair[0] };
  }
  function startFight(site) {
    site = site || pickSite();
    if (!site) return null;
    const ang = Math.random() * 6.28,
      px = Math.cos(ang),
      pz = Math.sin(ang),
      sep = K.rand(11, 18);
    FF = {
      x: site.x,
      z: site.z,
      loc: site.loc || null,
      t: 0,
      dur: K.rand(18, 60),
      next: K.rand(0.3, 1.5),
      booms: K.randInt(0, 2),
      real: false,
      A: side(site.a, site.x - px * sep, site.z - pz * sep),
      B: side(site.b, site.x + px * sep, site.z + pz * sep),
      cries: 0,
    };
    K.log(
      "firefight",
      site.a,
      "vs",
      site.b,
      Math.round(K.distToPlayer(site.x, site.z)) + "m",
    );
    return FF;
  }
  function burst(from, to) {
    if (!from.guns) {
      const sc = SCREAMS[from.faction];
      if (sc) {
        const e = schedule(K.now() + Math.random() * 0.3, E_SOUND);
        if (e) {
          e.snd = sc[0];
          e.x = from.x;
          e.y = from.y;
          e.z = from.z;
          e.vol = 0.8;
          e.pitch = sc[1] * (0.9 + Math.random() * 0.2);
        }
      }
      return;
    }
    const g = K.weighted(from.guns.map((x) => [x, x[1]]));
    const auto = g[3];
    const n =
      auto === 2
        ? K.randInt(8, 16)
        : auto === 1
          ? K.randInt(3, 7)
          : K.randInt(1, 3);
    const gap =
      auto === 2 ? 0.055 : auto === 1 ? K.rand(0.08, 0.12) : K.rand(0.3, 0.7);
    let t = K.now();
    const jx = (Math.random() - 0.5) * 6,
      jz = (Math.random() - 0.5) * 6;
    for (let i = 0; i < n; i++) {
      const e = schedule(t, E_SHOT);
      if (!e) break;
      e.snd = g[0];
      e.fx = g[2] === "ray" || g[2] === "arc" ? g[2] : "ball";
      e.x = from.x + jx;
      e.y = from.y;
      e.z = from.z + jz;
      e.x2 = to.x + (Math.random() - 0.5) * 7;
      e.y2 = to.y + (Math.random() - 0.5) * 1.5;
      e.z2 = to.z + (Math.random() - 0.5) * 7;
      e.vol = 0.85;
      e.pitch = 0.95 + Math.random() * 0.1;
      t += gap * (0.85 + Math.random() * 0.3);
    }
  }
