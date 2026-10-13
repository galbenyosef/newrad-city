// play-inline-520 03 — math
// Lines 458-807 of readable/play-inline-520.pretty.js (statement-aligned).
  const LEGS = [
    [-0.28, 1.0, -0.6, 0],
    [0.28, 1.0, -0.6, Math.PI],
    [-0.29, 1.02, 0.62, Math.PI],
    [0.29, 1.02, 0.62, 0],
  ]; // FL FR HL HR (+phase)
  function createModel(opts) {
    if (!GEO) buildGeometry();
    opts = opts || {};
    const mat = K.vcMat("amb_ox", { roughness: 0.9 });
    const root = new THREE.Group();
    root.name = "amb_ox";
    const tilt = new THREE.Group();
    tilt.position.y = 1.05;
    root.add(tilt);
    const body = new THREE.Group();
    body.position.y = -1.05;
    tilt.add(body);
    const mesh = (geo, parent, shadow) => {
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = !!shadow;
      m.receiveShadow = false;
      parent.add(m);
      return m;
    };
    mesh(GEO.body, body, true);
    if (opts.pack !== false)
      mesh(GEO.packs[(opts.variant || 0) % GEO.packs.length], body, true);
    const legs = LEGS.map((l) => {
      const g = new THREE.Group();
      g.position.set(l[0], l[1], l[2]);
      body.add(g);
      mesh(GEO.leg, g, false);
      g.userData.ph = l[3];
      return g;
    });
    const neck = new THREE.Group();
    neck.position.set(0, 1.3, -0.98);
    neck.scale.setScalar(1.18);
    body.add(neck);
    mesh(GEO.head, neck, true);
    const tail = new THREE.Group();
    tail.position.set(0, 1.3, 1.02);
    tail.rotation.x = 0.18;
    body.add(tail);
    mesh(GEO.tail, tail, false);
    const sc = opts.scale || 0.95 + Math.random() * 0.12;
    root.scale.setScalar(sc);
    const M = {
      root,
      tilt,
      legs,
      neck,
      tail,
      ph: Math.random() * 6,
      t: Math.random() * 50,
      dead: false,
      deadT: 0,
      graze: 0,
      grazeT: K.rand(3, 9),
      seed: Math.random() * 10,
      /** Animate: speed in m/s along the ground. */
      update(dt, speed) {
        M.t += dt;
        const t = M.t;
        if (M.dead) {
          M.deadT = Math.min(1, M.deadT + dt / 0.85);
          const k = M.deadT * M.deadT;
          tilt.rotation.z = -1.52 * k + Math.sin(M.deadT * Math.PI) * 0.05;
          tilt.position.y = 1.05 - 0.55 * k;
          for (let i = 0; i < 4; i++)
            legs[i].rotation.x +=
              ((i < 2 ? -0.25 : 0.3) - legs[i].rotation.x) *
              Math.min(1, dt * 4);
          neck.rotation.x += (-0.35 - neck.rotation.x) * Math.min(1, dt * 3);
          tail.rotation.z *= 0.95;
          return;
        }
        const move = K.clamp(speed / 1.4, 0, 1.6);
        M.ph += ((dt * speed) / 1.2) * Math.PI;
        const amp = 0.42 * Math.min(1, move) + (move > 1 ? 0.12 : 0);
        for (const lg of legs)
          lg.rotation.x = Math.sin(M.ph + lg.userData.ph) * amp;
        tilt.position.y =
          1.05 + Math.abs(Math.sin(M.ph)) * 0.035 * Math.min(1, move);
        tilt.rotation.z = Math.sin(M.ph) * 0.025 * Math.min(1, move);
        tilt.rotation.x = Math.sin(M.ph * 2) * 0.01 * Math.min(1, move);
        // head: nods with the stride, looks around, grazes when standing
        M.grazeT -= dt;
        if (M.grazeT <= 0) {
          M.graze = move < 0.2 && M.graze === 0 && Math.random() < 0.6 ? 1 : 0;
          M.grazeT = M.graze ? K.rand(3, 7) : K.rand(4, 11);
        }
        const g = M.graze && move < 0.2;
        const wantX = g
          ? -0.78 + Math.sin(t * 7) * 0.035
          : -0.04 +
            Math.sin(t * 0.6 + M.seed) * 0.08 +
            Math.sin(M.ph * 2) * 0.06 * move;
        const wantY = g ? 0 : Math.sin(t * 0.27 + M.seed) * 0.32;
        neck.rotation.x += (wantX - neck.rotation.x) * Math.min(1, dt * 2.2);
        neck.rotation.y += (wantY - neck.rotation.y) * Math.min(1, dt * 1.5);
        tail.rotation.z =
          Math.sin(t * 1.7 + M.seed) * 0.22 +
          (Math.sin(t * 0.31) > 0.93 ? Math.sin(t * 13) * 0.3 : 0);
      },
      setDead(v) {
        if (v && !M.dead) {
          M.dead = true;
          M.deadT = 0;
        } else if (!v) {
          M.dead = false;
          tilt.rotation.set(0, 0, 0);
          tilt.position.y = 1.05;
        }
      },
      dispose() {
        if (root.parent) root.parent.remove(root);
      },
    };
    return M;
  }

  // ------------------------------------------------------------------
  // Actor attachment
  // ------------------------------------------------------------------
  const LIVE = [];
  const _pp = new THREE.Vector3();
  function attach(actor, opts) {
    const ch = actor && actor.char;
    if (!ch || !ch.root) return null;
    opts = opts || {};
    const hide = [];
    ch.root.traverse((o) => {
      if (o.isMesh || o.isSkinnedMesh || o.isPoints || o.isSprite || o.isLine)
        hide.push(o);
    });
    for (const o of hide) o.visible = false;
    ch.noFootIK = true;
    const model = createModel(opts);
    // the model faces -Z like every G.chars rig; undo any per-rig yaw offset
    model.root.rotation.y = -(ch.yawOffset || 0);
    ch.root.add(model.root);
    // An ox: no bear voice, no bite worth mentioning (shared type table untouched)
    try {
      if (actor.td)
        actor.td = Object.assign({}, actor.td, {
          sounds: null,
          name: "Ox",
          dormantChance: 0,
        });
    } catch (e) {
      /* ignore */
    }
    try {
      actor.natural = null;
    } catch (e) {
      /* ignore */
    }
    const h = {
      actor,
      model,
      hide,
      lx: actor.pos.x,
      lz: actor.pos.z,
      speed: 0,
      nextMoo: K.now() + K.rand(6, 25),
      pitch: 0.9 + Math.random() * 0.25,
    };
    actor._ambOx = h;
    LIVE.push(h);
    return h;
  }
  function tick(dt) {
    const P = G.player;
    for (let i = LIVE.length - 1; i >= 0; i--) {
      const h = LIVE[i],
        a = h.actor;
      if (!a || a.removed || a._ambGone) {
        h.model.dispose();
        LIVE.splice(i, 1);
        continue;
      }
      for (let k = 0; k < h.hide.length; k++)
        if (h.hide[k].visible) h.hide[k].visible = false;
      if (a.disintegrated) {
        h.model.root.visible = false;
        continue;
      }
      if (dt <= 0) continue;
      const dx = a.pos.x - h.lx,
        dz = a.pos.z - h.lz;
      h.lx = a.pos.x;
      h.lz = a.pos.z;
      const inst = Math.min(8, Math.hypot(dx, dz) / dt);
      h.speed += (inst - h.speed) * Math.min(1, dt * 6);
      if (a.dead) h.model.setDead(true);
      const d = P ? Math.hypot(P.pos.x - a.pos.x, P.pos.z - a.pos.z) : 0;
      if (d < 110 && a.char.root.visible !== false) h.model.update(dt, h.speed);
      // the odd bellow
      if (!a.dead && K.now() > h.nextMoo) {
        h.nextMoo = K.now() + K.rand(18, 55);
        if (d < 45) {
          _pp.set(a.pos.x, a.pos.y + 1.4, a.pos.z);
          K.synth.moo(_pp, h.pitch, Math.random() < 0.35);
        }
      }
    }
  }
  /** Pained bellow when an ox is hurt. */
  function onDamaged(actor) {
    const h = actor && actor._ambOx;
    if (!h || actor.dead) return;
    const t = K.now();
    if (h._hurtT && t - h._hurtT < 1.2) return;
    h._hurtT = t;
    _pp.set(actor.pos.x, actor.pos.y + 1.4, actor.pos.z);
    K.synth.moo(_pp, h.pitch * 1.35, false);
  }

  /** Spawn an ox actor. def: {pos:{x,y,z}, yaw, variant, pack, ai, follow(actor), name, home, level, hp} */
  function spawnActor(def) {
    const a = K.spawnActor({
      type: BODY_TYPE,
      name: def.name || "Pack Ox",
      faction: "amb_oxen",
      level: def.level || 3,
      hp: def.hp || 140,
      dr: 4,
      pos: def.pos,
      yaw: def.yaw || 0,
      ai: def.ai || "wander",
      home: def.home || { x: def.pos.x, z: def.pos.z, r: 4 },
      voice: "amb_none",
      damage: 0.05,
      aggroRange: 4,
      speed: 3.6,
      xp: 8,
      noRespawn: true,
      noLoot: true,
      inventory: K.stock([["ox_meat", 2]]),
      seed: Math.floor(Math.random() * 1e6),
    });
    if (!a) return null;
    if (!attach(a, { variant: def.variant || 0, pack: def.pack })) {
      K.removeActor(a);
      return null;
    }
    if (def.follow) {
      try {
        a.follow(def.follow);
      } catch (e) {
        /* ignore */
      }
    }
    return a;
  }

  K.oxen = {
    createModel,
    attach,
    spawnActor,
    live: () => LIVE.length,
    herds: () =>
      Array.from(herdLive.entries()).map(([h, a]) => h.loc + ":" + a.length),
  };

  // Hitched pack ox at the Flatiron Trading Post rail (landmarks_b left the rail empty "— yet")
  let hitched = null;
  function spawnHitched() {
    if (hitched && K.actorAlive(hitched)) return;
    if (G.isStub("landmarks") || !G.landmarks || !G.landmarks.flatiron) return;
    const y = G.world.groundHeight(141.1, 110, 0.6, 0.3);
    hitched = spawnActor({
      pos: { x: 141.1, y, z: 110 },
      yaw: Math.PI / 2,
      variant: 2,
      ai: "static",
      name: "Pack Ox",
      home: { x: 141.1, z: 110, r: 1 },
    });
  }

  // Settlement herds: a few unpacked oxen wander a pen by the farm-ish towns while the player is
  // near; they are plain actors, streamed in/out by distance.
  const HERDS = [
    { loc: "tavern_on_green", dx: 16, dz: -18, n: 3, r: 7 },
    { loc: "empire_stores", dx: 14, dz: -16, n: 2, r: 5 },
    { loc: "ellis_island", dx: 22, dz: -18, n: 3, r: 7 },
    { loc: "san_remo", dx: 28, dz: 14, n: 2, r: 5 },
  ];
  const herdLive = new Map(); // herd -> [actors]
  function updateHerds() {
    const P = G.player;
    if (!P || K.isInterior(P.pos.x)) {
      for (const [h, arr] of herdLive) {
        for (const a of arr) K.removeActor(a);
        herdLive.delete(h);
      }
      return;
    }
    for (const h of HERDS) {
      const L = G.LAYOUT.getLocation(h.loc);
      if (!L) continue;
      const cx = L.x + h.dx,
        cz = L.z + h.dz;
      const d = Math.hypot(P.pos.x - cx, P.pos.z - cz);
      const live = herdLive.get(h);
      if (live) {
        if (d > 240 || live.every((a) => !K.actorAlive(a))) {
          if (d > 240) for (const a of live) K.removeActor(a);
          herdLive.delete(h);
          h.cool = d > 240 ? 0 : K.gameHours() + 48;
        }
        continue;
      }
      if (
        d > 150 ||
        (h.cool && K.gameHours() < h.cool) ||
        (K.inView(cx, 1, cz, h.r, true) && d < 90)
      )
        continue;
      const arr = [];
      const y0 = G.world.terrainHeight ? G.world.terrainHeight(cx, cz) : 0;
      for (let i = 0; i < h.n; i++) {
        const sp = K.freeSpotNear(
          cx + (Math.random() - 0.5) * h.r,
          cz + (Math.random() - 0.5) * h.r,
          h.r * 0.6,
          14,
          y0,
        );
        if (!sp) continue;
        const b = spawnActor({
          pos: sp,
          yaw: Math.random() * 6.28,
          variant: i,
          pack: false,
          ai: "wander",
          name: "Ox",
          home: { x: cx, z: cz, r: h.r },
        });
        if (b) arr.push(b);
      }
      if (arr.length) herdLive.set(h, arr);
      else h.cool = K.gameHours() + 24;
    }
  }

  let herdT = 0;
