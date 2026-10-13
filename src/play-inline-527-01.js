// play-inline-527 01 — spot
// Lines 25-369 of readable/play-inline-527.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const K = G.ambient._;

  const MAX_SLEEPERS = 16;
  const SCAN_R = 150;
  const OK_FACTIONS = { settlers: 1, glowkeepers: 1 };
  const NEON_SLEEP = [9, 15]; // the Neon's hours (they own the night in Times Square)
  const SLEEP_BARKS = {
    idle: [
      "Zzz…",
      "*snore*",
      "Mmh… five more minutes…",
      "…no, Ma, the other ox…",
      "Zzz… scrip… so much scrip…",
    ],
    greet: [
      "Hnh? Wha — it's the middle of the night. Go away.",
      "Mmph. Come back when the sun's up.",
      "Unless the place is on fire, let me sleep.",
      "Zzz… huh? No. Sleeping.",
    ],
  };
  const NEON_SLEEP_BARKS = {
    idle: ["Zzz…", "*wheezy snore*", "…turn the neon down…"],
    greet: [
      "Daytime's for topsiders. Let an old man sleep.",
      "Hrrn. Come back after dark, kid.",
    ],
  };
  const STORM_BARKS = {
    idle: [
      "Keep your head down till it blows over.",
      "That one hit close.",
      "Count the seconds after the flash. Under five, you stay put.",
      "Just wait it out. Just wait it out.",
    ],
    greet: [
      "Are you crazy? Get under cover!",
      "Not now — can't you hear the Geiger?",
    ],
  };
  const NIGHT_GUARD = {
    idle: [
      "Quiet night. Too quiet.",
      "Keep it down, people are sleeping.",
      "Eyes on the dark, eyes on the dark…",
      "Night shift again. Figures.",
      "Hear that? …No? Good.",
    ],
    greet: [
      "Evening. Keep your voice down, folks are asleep.",
      "Late to be walking around. Stay in the light.",
    ],
  };
  const WAKE_LINES = [
    "Morning already?",
    "*yawn* Another beautiful day in the apocalypse.",
    "Ugh. My back.",
    "Rise and shine, Manhattan.",
  ];

  // ------------------------------------------------------------------
  // Bedrolls (instanced)
  // ------------------------------------------------------------------
  let rolls = null;
  const rollUsed = new Uint8Array(MAX_SLEEPERS);
  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _p = new THREE.Vector3(),
    _s = new THREE.Vector3(1, 1, 1);
  const _zero = new THREE.Matrix4().makeScale(0, 0, 0);
  function buildRolls() {
    const g = K.merge([
      K.part(
        new THREE.BoxGeometry(0.78, 0.06, 1.9),
        0x5d5a3c,
        [0, 0.03, 0],
        null,
        null,
        0.18,
        1,
      ), // ground sheet
      K.part(
        new THREE.BoxGeometry(0.72, 0.08, 1.2),
        0x7a3a2a,
        [0, 0.08, 0.28],
        null,
        null,
        0.2,
        2,
      ), // blanket
      K.part(
        new THREE.BoxGeometry(0.74, 0.02, 0.09),
        0xc8b88a,
        [0, 0.125, -0.28],
        null,
        null,
        0.1,
        3,
      ), // blanket stripe
      K.part(
        new THREE.CylinderGeometry(0.12, 0.12, 0.62, 9),
        0x8a8468,
        [0, 0.12, -0.78],
        [0, 0, Math.PI / 2],
        null,
        0.15,
        4,
      ), // pillow roll
      K.part(
        new THREE.BoxGeometry(0.2, 0.18, 0.26),
        0x4a3524,
        [0.52, 0.09, -0.7],
        null,
        null,
        0.2,
        5,
      ), // pack
      K.part(
        new THREE.CylinderGeometry(0.04, 0.05, 0.14, 7),
        0x6d6d68,
        [0.5, 0.07, -0.35],
        null,
        null,
        0.2,
        6,
      ), // tin cup
    ]);
    rolls = new THREE.InstancedMesh(
      g,
      K.vcMat("amb_bedroll", { roughness: 0.95 }),
      MAX_SLEEPERS,
    );
    rolls.name = "amb_bedrolls";
    rolls.frustumCulled = false;
    rolls.castShadow = false;
    rolls.receiveShadow = true;
    for (let i = 0; i < MAX_SLEEPERS; i++) rolls.setMatrixAt(i, _zero);
    rolls.visible = false;
    G.scene.add(rolls);
  }
  function takeRoll(x, y, z, yaw) {
    if (!rolls) return -1;
    for (let i = 0; i < MAX_SLEEPERS; i++)
      if (!rollUsed[i]) {
        rollUsed[i] = 1;
        _e.set(0, yaw, 0);
        _q.setFromEuler(_e);
        _p.set(x, y + 0.01, z);
        _m.compose(_p, _q, _s);
        rolls.setMatrixAt(i, _m);
        rolls.instanceMatrix.needsUpdate = true;
        rolls.visible = true;
        return i;
      }
    return -1;
  }
  function freeRoll(i) {
    if (!rolls || i < 0 || !rollUsed[i]) return;
    rollUsed[i] = 0;
    rolls.setMatrixAt(i, _zero);
    rolls.instanceMatrix.needsUpdate = true;
    let any = false;
    for (let k = 0; k < MAX_SLEEPERS; k++)
      if (rollUsed[k]) {
        any = true;
        break;
      }
    rolls.visible = any;
  }

  // ------------------------------------------------------------------
  // Actor bookkeeping
  // ------------------------------------------------------------------
  const managed = new Map(); // actor -> record {mode:'bed'|'storm'|'guard', orig, spot, roll, phase:'walk'|'asleep', t}
  function eligibleResident(a) {
    if (
      !a ||
      a.dead ||
      a.removed ||
      a._ambGone ||
      a.stableId ||
      a.essential ||
      a.dialogue ||
      a.merchant ||
      a.onTalk
    )
      return false;
    if (a._ambConvoy || a._ambOx || a.following || a.isCreature || a.isRobot)
      return false;
    if (!OK_FACTIONS[a.faction] || a.hostile()) return false;
    return true;
  }
  function locOf(a) {
    return K.friendlyLocAt(a.pos.x, a.pos.z, 12);
  }
  function isNeonHome(a) {
    if (a.faction !== "settlers") return false;
    const l = locOf(a);
    return !!l && l.id === "times_square";
  }
  function jitterOf(a) {
    return (((a.uid || 7) * 0.618) % 1) * 1.6 - 0.8;
  } // ±0.8 h, stable per actor
  function wantsSleep(a) {
    if (isNeonHome(a)) {
      const h = (K.hour() + jitterOf(a) + 24) % 24;
      return h >= NEON_SLEEP[0] && h < NEON_SLEEP[1];
    }
    return K.isBedTime(jitterOf(a));
  }
  function stormCover(a) {
    return K.isStormy() && !isNeonHome(a);
  } // thunderstorm or dust storm (the Neon's people shelter under the marquees)

  function snapshot(a) {
    return {
      aiMode: a.aiMode,
      patrol: a.patrol,
      patrolIdx: a.patrolIdx,
      home: a.home ? { x: a.home.x, z: a.home.z, r: a.home.r } : null,
      barks: a.customBarks,
    };
  }
  function restore(a, r, quiet) {
    if (r.roll >= 0) {
      freeRoll(r.roll);
      r.roll = -1;
    }
    managed.delete(a);
    if (!a || a.removed || a._ambGone) return;
    const o = r.orig;
    a.customBarks = o.barks;
    if (r.mode === "guard") return;
    a.aiMode = o.aiMode;
    a.patrol = o.patrol;
    a.patrolIdx = o.patrolIdx || 0;
    if (o.home) a.home = o.home;
    if (
      !quiet &&
      !a.dead &&
      r.phase === "asleep" &&
      K.distToPlayer(a.pos.x, a.pos.z) < 25 &&
      Math.random() < 0.5
    )
      K.say(
        a,
        r.mode === "storm" ? "Storm's passed. Back to it." : K.pick(WAKE_LINES),
        3,
      );
  }
  function sleepSpot(a) {
    // near home, off the busy middle, not on top of another sleeper
    for (let k = 0; k < 14; k++) {
      const s = K.freeSpotNear(
        a.home ? a.home.x : a.pos.x,
        a.home ? a.home.z : a.pos.z,
        5,
        6,
        a.pos.y,
      );
      if (!s) continue;
      let clash = false;
      for (const r of managed.values())
        if (r.spot && Math.hypot(r.spot.x - s.x, r.spot.z - s.z) < 1.8) {
          clash = true;
          break;
        }
      if (!clash && !K.blocked(s.x, s.y, s.z, 0.9)) return s;
    }
    return null;
  }
  function goToBed(a, mode) {
    const spot = sleepSpot(a);
    if (!spot) return false;
    const r = {
      mode,
      orig: snapshot(a),
      spot,
      roll: -1,
      phase: "walk",
      t: 0,
      yaw: Math.random() * 6.28,
    };
    managed.set(a, r);
    // off-screen: no need to watch them walk there
    if (
      !K.inView(a.pos.x, a.pos.y + 1, a.pos.z, 1, true) ||
      K.distToPlayer(a.pos.x, a.pos.z) > 60
    ) {
      a.pos.set(spot.x, spot.y, spot.z);
      if (a.nav) {
        a.nav.path = null;
        a.nav.search = null;
      }
      lieDown(a, r);
    } else {
      a.aiMode = "patrol";
      a.patrol = [{ x: spot.x, z: spot.z }];
      a.patrolIdx = 0;
      if (mode === "storm" && K.distToPlayer(a.pos.x, a.pos.z) < 30)
        K.say(
          a,
          K.pick([
            "Storm's here! Get inside!",
            "Lightning! Get under something!",
          ]),
          3,
        );
      else if (K.distToPlayer(a.pos.x, a.pos.z) < 20 && Math.random() < 0.4)
        K.say(
          a,
          K.pick(["G'night.", "That's me done for the day.", "*yawn*"]),
          2.5,
        );
    }
    return true;
  }
  function lieDown(a, r) {
    r.phase = "asleep";
    a.aiMode = "sit";
    a.patrol = null;
    a.home = { x: r.spot.x, z: r.spot.z, r: 1 };
    try {
      a.faceTowards(r.spot.x + Math.sin(r.yaw), r.spot.z + Math.cos(r.yaw));
    } catch (e) {
      /* ignore */
    }
    a.customBarks =
      r.mode === "storm"
        ? STORM_BARKS
        : isNeonHome(a)
          ? NEON_SLEEP_BARKS
          : SLEEP_BARKS;
    if (r.mode === "bed")
      r.roll = takeRoll(r.spot.x, r.spot.y, r.spot.z, a.yaw + Math.PI);
  }

  // ------------------------------------------------------------------
  // Tick (1 Hz)
  // ------------------------------------------------------------------
  let tickT = 0;
