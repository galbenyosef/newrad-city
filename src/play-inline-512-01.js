// play-inline-512 01 — pos
// Lines 36-379 of readable/play-inline-512.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const C = G.__cmb;
  const now = () => G.time.elapsed;
  const _a = new THREE.Vector3(),
    _b = new THREE.Vector3(),
    _c = new THREE.Vector3();

  const S = (C.reactStats = {
    evades: 0,
    knockdowns: 0,
    getups: 0,
    suppressed: 0,
    whizAlerts: 0,
    impactAlerts: 0,
    bodyFound: 0,
    retrieved: 0,
    sidearms: 0,
    unstuckInside: 0,
    unstuckFell: 0,
    unstuckStall: 0,
    arrivedOffscreen: 0,
  });

  // ------------------------------------------------------------------
  // Bark lines (ALL ORIGINAL). Merged into C.BARKS per voice.
  // ------------------------------------------------------------------
  const LINES = {
    raider: {
      spotGrenade: [
        "Grenade! Move your ass!",
        "Oh no no no — GRENADE!",
        "Hot potato! RUN!",
      ],
      nearMiss: [
        "Whoa! That one parted my hair!",
        "Missed me, sucker!",
        "Hey! I felt that one go by!",
      ],
      bodyFound: [
        "Somebody popped Jimmy! Find 'em!",
        "Wake up, boys — we got a shooter!",
        "Aw hell, he's dead! Where'd that come from?",
      ],
      getUp: [
        "Ugh... my everything...",
        "That all you got?",
        "Who turned the ground sideways?",
      ],
      retrieve: ["Mine! Mine mine mine!", "Come to mama..."],
      sidearm: ["Good thing I brought a backup!", "Plan B, baby!"],
    },
    brute: {
      spotGrenade: ["Boom-stone! Away!", "Little bomb! Move, move!"],
      nearMiss: ["Hah! Soft-skin misses!", "Bullet bounces off plate."],
      bodyFound: [
        "Kin is dead! Who did this?!",
        "Something broke kin. Find it. Break it!",
      ],
      getUp: ["Hrrnh... up. Break again.", "Hurt... not finished."],
      retrieve: ["Gun! Brute wants gun back!"],
      sidearm: ["Other gun. Bigger gun."],
    },
    continuity: {
      spotGrenade: ["Grenade! Clear the area!", "Frag out — take cover!"],
      nearMiss: ["Taking fire!", "Rounds incoming, stay low!"],
      bodyFound: [
        "Man down! Sniper, unknown position!",
        "Soldier down. Sweep the area!",
      ],
      getUp: ["Still operational.", "I'm up. Re-engaging."],
      retrieve: ["Recovering my weapon!"],
      sidearm: ["Switching to sidearm!"],
    },
    covenant: {
      spotGrenade: ["Grenade! Scatter!", "Explosive! Get clear!"],
      nearMiss: ["Contact! We're taking fire!", "Rounds close, stay on them!"],
      bodyFound: [
        "Sworn one down! Find that shooter!",
        "Lancer down, eyes on the rooftops!",
      ],
      getUp: ["Rig held. Moving.", "Iron remembers... ugh."],
      retrieve: ["Recovering my weapon!"],
      sidearm: ["Sidearm!"],
    },
    settler: {
      spotGrenade: ["Grenade! Get down!", "Oh lord, run!"],
      nearMiss: [
        "Hey! Watch where you're shooting!",
        "Whoa! That nearly took my ear off!",
      ],
      bodyFound: [
        "Someone's been shot! Oh lord!",
        "He's dead! Where did that come from?",
      ],
      getUp: ["Oof... I'm okay... I think."],
      retrieve: ["Where's my gun... there!"],
      sidearm: ["I've still got this!"],
    },
    neon: {
      spotGrenade: ["Grenade! Move them tired legs!", "Nope! Frag!"],
      nearMiss: [
        "Hey! I paid for this hat!",
        "Watch it! I need all my holes where they are!",
      ],
      bodyFound: [
        "Somebody's been shot! Who's out there?!",
        "Man down! Eyes on the rooftops!",
      ],
      getUp: [
        "I used to take falls for a living. Off Broadway. Way off.",
        "Ow. Everything's where I left it. Mostly.",
      ],
      retrieve: ["My iron! Come here, you."],
      sidearm: ["Always carry a spare, kid."],
    },
    guard: {
      spotGrenade: ["Grenade! Clear out!", "Frag! Everybody down!"],
      nearMiss: [
        "Shots fired! Where's it coming from?",
        "Rounds in the square! Take cover!",
      ],
      bodyFound: [
        "Man down! We got a shooter!",
        "Somebody just dropped! Eyes up!",
      ],
      getUp: ["I'm up. I'm up.", "Walls of the Neon don't fall that easy."],
      retrieve: ["Getting my rifle back!"],
      sidearm: ["Going to the pistol!"],
    },
    merchant: {
      spotGrenade: ["Grenade! Not near the stock!"],
      nearMiss: ["Watch the merchandise!", "Hey! You break it, you bought it!"],
      bodyFound: ["Somebody's dead! That's bad for business!"],
    },
    glowkeeper: {
      spotGrenade: ["The Light comes early! Run!"],
      bodyFound: ["A Glowkeeper has been put out! Find the heretic!"],
    },
  };
  (function mergeBarks() {
    for (const v in LINES) {
      const t = C.BARKS[v] || (C.BARKS[v] = {});
      for (const cat in LINES[v]) t[cat] = (t[cat] || []).concat(LINES[v][cat]);
    }
  })();
  function barkNow(a, cat, chance) {
    if (
      !a.voice ||
      a.isCreature ||
      (chance !== undefined && Math.random() > chance)
    )
      return false;
    const line =
      C.bark(a.voice, cat) ||
      (C.BARKS.settler[cat] ? C.pick(C.BARKS.settler[cat]) : null);
    if (!line) return false;
    a._lastBark = now();
    a.say(line, 2.6);
    return true;
  }
  const biped = (a) => !!(a.td.human || (a.char && a.char.kind === "biped"));

  // ------------------------------------------------------------------
  // 1. GRENADE! — see a live grenade land near you, get clear
  // ------------------------------------------------------------------
  let gScanT = 0;
  function predictedRest(p, out) {
    if (p.resting || p.stuck || p.vel.lengthSq() < 0.5) return out.copy(p.pos);
    // flat-ground flight time (ignores walls: good enough to pick a side to run to)
    const gy = G.world.groundHeight(p.pos.x, p.pos.z, p.pos.y + 0.5, 0.1);
    const h = Math.max(0, p.pos.y - gy),
      vy = p.vel.y,
      g = p.gravity || 9.8;
    const tf = Math.min(
      (vy + Math.sqrt(vy * vy + 2 * g * h)) / g,
      Math.max(0, p.fuse - p.t),
    );
    return out.set(
      p.pos.x + p.vel.x * tf * 0.8,
      gy,
      p.pos.z + p.vel.z * tf * 0.8,
    );
  }
  function scanGrenades(dt) {
    gScanT -= dt;
    if (gScanT > 0) return;
    gScanT = 0.15;
    let list = null;
    try {
      list = G.combat.projectiles();
    } catch (e) {
      list = null;
    }
    if (!list || !list.length) return;
    const t = now();
    for (const p of list) {
      if (p.kind !== "grenade" || p.mine || p.t < 0.2) continue;
      const left = p.fuse - p.t;
      if (left < 0.25) continue;
      const rest = predictedRest(p, _a);
      const danger = (p.radius || 5) + 1.5;
      let barked = !!p._barked;
      for (const a of C.list) {
        if (
          a.dead ||
          !a.inScene ||
          a.hover ||
          a.holdPos ||
          a.talking ||
          a.burrowed ||
          a.knockedOut
        )
          continue;
        if (
          a.state === "dormant" ||
          a.state === "knocked" ||
          a._down ||
          !biped(a)
        )
          continue;
        if (a._evade && a._evade.g === p) continue;
        const d = Math.hypot(a.pos.x - rest.x, a.pos.z - rest.z);
        if (d > danger || Math.abs(a.pos.y - rest.y) > 4) continue;
        // must notice it: in view (or close enough to hear it clatter), not the thrower mid-throw
        if (p.from === a && p.t < 0.8) continue;
        const dg = Math.hypot(a.pos.x - p.pos.x, a.pos.z - p.pos.z);
        if (
          dg > 3.5 &&
          !G.world.lineOfSight(
            a.eyePos(_b),
            _c.copy(p.pos).setY(p.pos.y + 0.15),
          )
        )
          continue;
        a._evade = {
          g: p,
          x: rest.x,
          z: rest.z,
          r: danger,
          start: t + 0.15 + Math.random() * 0.35,
          until: t + left + 0.4,
        };
        S.evades++;
        if (!barked && barkNow(a, "spotGrenade", 0.9))
          barked = p._barked = true;
      }
    }
  }
  function evadeUpdate(a, dt) {
    const e = a._evade,
      t = now();
    if (t > e.until) {
      a._evade = null;
      return 0;
    }
    if (t < e.start) return 0;
    const dx = a.pos.x - e.x,
      dz = a.pos.z - e.z,
      d = Math.hypot(dx, dz) || 0.01;
    a.faceTarget = false;
    a.pendingMelee = null;
    if (d < e.r + 1.2) {
      // sprint away (a little sideways if the grenade is right between us and the wall)
      C.steer(a, dx / d, dz / d, Math.max(a.runSpeed, 4.5) * 1.05, dt);
      return 1;
    }
    // clear of it: crouch and wait for the bang, facing it
    a.speed = 0;
    a.faceTarget = true;
    a.faceTowards(e.x, e.z, 6, dt);
    a.anim(a.td.human ? "stealth" : "idle");
    return 2;
  }

  // ------------------------------------------------------------------
  // 2. KNOCKDOWN — thrown off their feet, lie there, climb back up
  // ------------------------------------------------------------------
  /** strength 0..1 (explosion falloff / hit weight); dir = push direction (world). */
  C.tryKnockdown = function (a, strength, dir, opts) {
    if (!a || a.dead || !a.inScene || a._down || a.knockedOut || a.talking)
      return false;
    if (
      !biped(a) ||
      a.td.boss ||
      a.isRobot ||
      a.hover ||
      a.holdPos ||
      a.burrowed ||
      a.state === "dormant"
    )
      return false;
    if (!a.char || typeof a.char.setAnim !== "function" || a.char.placeholder)
      return false;
    const heavy =
      a.type === "brute" ||
      a.type === "covenant_warden" ||
      a.type === "continuity_soldier" ||
      a.maxHp > 300;
    const need = heavy ? 0.55 : 0.32;
    if (strength < need && !(opts && opts.force)) return false;
    const t = now();
    const dur =
      C.clamp(0.9 + strength * 1.6 + Math.random() * 0.6, 1.0, 3.0) *
      (heavy ? 0.8 : 1);
    const d = dir
      ? _a.set(dir.x, 0, dir.z)
      : _a.set(Math.sin(a.yaw), 0, Math.cos(a.yaw));
    if (d.lengthSq() < 1e-6) d.set(0, 0, 1);
    d.normalize();
    a._down = {
      until: t + dur,
      up: 0,
      vx: d.x * (2.5 + strength * 4),
      vz: d.z * (2.5 + strength * 4),
    };
    a.pendingMelee = null;
    a.lungeT = 0;
    a.chargeT = 0;
    a.speed = 0;
    a.ducked = false;
    a._evade = null;
    if (a.nav) {
      a.nav.path = null;
      a.nav.search = null;
    }
    try {
      if (a.char.setAim) a.char.setAim(false);
      a.char.setAnim("death", { dir: d.clone(), force: 20 + strength * 20 });
    } catch (e) {
      a._down = null;
      return false;
    }
    a._anim = "_down";
    S.knockdowns++;
    if (a.td.sounds && a.td.sounds.hurt)
      C.sfx(a.td.sounds.hurt, {
        pos: a.pos,
        volume: 0.8,
        pitch: 0.85 + Math.random() * 0.2,
      });
    return true;
  };
