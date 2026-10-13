/* src/ambient_life/50_distant.js */
/* =====================================================================
 * NEW RAD CITY — AMBIENT LIFE — 50: distant firefights & sounds
 *
 * The city is never quiet: somewhere 200–500 m away raiders shoot it out
 * with settlers, an Iron Covenant patrol burns out a Brute nest, a
 * Continuity squad trades arc-rifle fire with Covenant Lancers. Heard as
 * positional, distant gunfire (per-faction weapon sounds in bursts), seen
 * as tracers, ray and arc beams, muzzle flashes at night and the odd
 * grenade fireball with a lingering smoke column.
 *
 * Walk toward it (inside ~150 m while it's still going) and it becomes
 * real: the two sides are spawned as combat actors and keep fighting:
 * join in, pick a side, or loot the winners.
 *
 * Plus sparse far-off life: dogs barking and howling at night, a siren
 * wailing somewhere, a building groaning and giving way.
 * All scheduled shots come from a fixed pool of 64 events.
 * ===================================================================== */
(function () {
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
  function goReal() {
    const f = FF;
    f.real = true;
    clearEvents();
    const actors = [];
    const lvl = K.level();
    for (const S of [f.A, f.B]) {
      const mk = ACTOR_OF[S.faction];
      if (!mk) continue;
      const n =
        S.faction === "maniacs" || S.faction === "creatures"
          ? K.randInt(3, 4)
          : K.randInt(2, 3);
      for (let i = 0; i < n; i++) {
        const sp = K.freeSpotNear(
          S.x + (Math.random() - 0.5) * 6,
          S.z + (Math.random() - 0.5) * 6,
          4,
          10,
        );
        if (!sp) continue;
        const other = S === f.A ? f.B : f.A;
        const def = Object.assign(
          {
            level: Math.max(2, lvl + K.randInt(-2, 1)),
            pos: sp,
            yaw: K.yawTo(sp.x, sp.z, other.x, other.z),
            ai: "patrol",
            patrol: [{ x: other.x, z: other.z }],
            noRespawn: true,
          },
          mk(),
        );
        if (def.weapon && !K.itemExists(def.weapon)) delete def.weapon;
        const a = K.spawnActor(def);
        if (a) actors.push(a);
      }
    }
    if (K.encounters) K.encounters.adopt(actors, "firefight");
    K.log("firefight is real:", actors.length, "actors");
    return actors;
  }
  function updateFight(dt) {
    const f = FF;
    if (!f) return;
    f.t += dt;
    const d = K.distToPlayer(f.x, f.z);
    if (!f.real) {
      if (d < 150 && K.playerOutdoors() && K.hasActors() && f.t < f.dur - 3) {
        goReal();
        FF = null;
        nextFightT = K.now() + K.rand(120, 260);
        return;
      }
      f.next -= dt;
      if (f.next <= 0 && f.t < f.dur) {
        f.next = K.rand(0.4, 2.6);
        if (Math.random() < 0.55) burst(f.A, f.B);
        else burst(f.B, f.A);
        if (f.booms > 0 && f.t > 4 && Math.random() < 0.08) {
          f.booms--;
          const tgt = Math.random() < 0.5 ? f.A : f.B;
          const e = schedule(K.now() + 0.5, E_BOOM);
          if (e) {
            e.x = tgt.x + (Math.random() - 0.5) * 8;
            e.y = tgt.y - 1.2;
            e.z = tgt.z + (Math.random() - 0.5) * 8;
          }
        }
      }
    }
    if (f.t > f.dur + 4 || d > 700 || K.isInterior(G.player.pos.x)) {
      FF = null;
      nextFightT = K.now() + K.rand(100, 260);
    }
  }

  // ------------------------------------------------------------------
  // Far-off life
  // ------------------------------------------------------------------
  function farSound() {
    const dark = K.isDark();
    const kind = K.weighted([
      ["dog", dark ? 1.4 : 0.8],
      ["howl", dark ? 0.8 : 0.05],
      ["siren", 0.12],
      ["collapse", 0.18],
      ["creak", 0.4],
      ["scream", dark ? 0.3 : 0.1],
    ]);
    const P = G.player.pos,
      a = Math.random() * 6.28,
      r = K.rand(130, 340);
    const x = P.x + Math.sin(a) * r,
      z = P.z + Math.cos(a) * r;
    const add = (dt, snd, vol, pitch) => {
      const e = schedule(K.now() + dt, E_SOUND);
      if (e) {
        e.snd = snd;
        e.x = x;
        e.y = 2;
        e.z = z;
        e.vol = vol;
        e.pitch = pitch || 1;
      }
    };
    if (kind === "dog") {
      const n = K.randInt(2, 5),
        p = K.rand(0.85, 1.15);
      for (let i = 0; i < n; i++)
        add(i * K.rand(0.35, 0.8), "dog_bark", 0.7, p);
    } else if (kind === "howl") {
      add(0, "howl", 0.75, K.rand(0.9, 1.1));
      if (Math.random() < 0.5)
        add(K.rand(1.5, 3), "howl", 0.5, K.rand(1.05, 1.25));
    } else if (kind === "siren") add(0, "siren_distant", 0.5);
    else if (kind === "collapse") {
      add(0, "creak", 0.8, 0.6);
      add(1.2, "debris", 1, 0.7);
      add(1.6, "explosion", 0.35, 0.5);
    } else if (kind === "creak") add(0, "creak", 0.6, K.rand(0.6, 0.9));
    else {
      const k = K.pick([
        ["moan", 1.35],
        ["brute_roar", 1],
        ["hurt_human", 1],
      ]);
      add(0, k[0], 0.55, k[1] * K.rand(0.85, 1.05));
    }
  }

  function update(dt) {
    if (dt <= 0) return;
    const t = K.now();
    // pending events
    for (const e of EV)
      if (e.on && t >= e.t) {
        e.on = false;
        try {
          fire(e);
        } catch (err) {
          G.reportError("ambient:distant", err);
        }
      }
    if (!K.playerOk()) return;
    updateFight(dt);
    const outdoors = K.playerOutdoors();
    if (!FF && outdoors && G.state === "play") {
      if (!nextFightT) nextFightT = t + K.rand(45, 140);
      if (t > nextFightT) {
        nextFightT = t + K.rand(60, 150);
        if (
          !K.isStormy() &&
          !K.inCombat() &&
          !K.friendlyLocAt(G.player.pos.x, G.player.pos.z, 0)
        )
          startFight();
      }
    }
    if (outdoors && G.state === "play") {
      if (!nextSoundT) nextSoundT = t + K.rand(15, 40);
      if (t > nextSoundT) {
        nextSoundT = t + K.rand(22, 65);
        farSound();
      }
    }
  }

  K.system({
    name: "distant",
    order: 50,
    reset() {
      clearEvents();
      FF = null;
      nextFightT = 0;
      nextSoundT = 0;
    },
    update,
  });

  K.distant = {
    startFight,
    goReal: () => (FF && !FF.real ? goReal() : null),
    current: () => FF,
    pending: () => EV.filter((e) => e.on).length,
    farSound,
  };
})();
