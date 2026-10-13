// play-inline-523 02 — three
// Lines 366-630 of readable/play-inline-523.pretty.js (statement-aligned).
  function createRotorcraft(kind, opts) {
    opts = opts || {};
    if (!LIVERY[kind]) kind = "continuity";
    const g = buildGeo(kind);
    const hullMat = K.mat(
      "amb_rc_hull_" + (opts.crashed ? "burnt" : "ok"),
      () =>
        new THREE.MeshStandardMaterial({
          vertexColors: true,
          metalness: 0.45,
          roughness: 0.55,
          color: opts.crashed ? 0x6a625a : 0xffffff,
        }),
    );
    const glassMat = K.mat(
      "amb_rc_glass",
      () =>
        new THREE.MeshStandardMaterial({
          color: 0x1c282c,
          metalness: 0.85,
          roughness: 0.12,
          emissive: 0x0a1418,
          emissiveIntensity: 0.4,
        }),
    );
    const discMat = K.mat(
      "amb_rc_disc",
      () =>
        new THREE.MeshBasicMaterial({
          color: 0x202020,
          transparent: true,
          opacity: 0.14,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
    );
    const coneMat = K.mat(
      "amb_rc_cone",
      () =>
        new THREE.MeshBasicMaterial({
          color: 0xfff0c8,
          transparent: true,
          opacity: 0.075,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        }),
    );
    const decMat = K.mat(
      "amb_rc_decal_" + kind,
      () =>
        new THREE.MeshStandardMaterial({
          map: decalTex(kind),
          transparent: true,
          alphaTest: 0.1,
          roughness: 0.6,
          metalness: 0.2,
          polygonOffset: true,
          polygonOffsetFactor: -2,
        }),
    );
    const root = new THREE.Group();
    root.name = "amb_rotorcraft_" + kind;
    const hull = new THREE.Mesh(g.hull, hullMat);
    hull.castShadow = true;
    root.add(hull);
    root.add(new THREE.Mesh(g.glass, glassMat));
    for (const s of [-1, 1]) {
      const d = new THREE.Mesh(g.plane, decMat);
      d.position.set(s * 1.335, 0.2, 2.4);
      d.rotation.y = (s * Math.PI) / 2;
      root.add(d);
    }
    const rotors = [],
      discs = [];
    for (const hub of [FWD_HUB, AFT_HUB]) {
      const r = new THREE.Group();
      r.position.set(hub[0], hub[1], hub[2]);
      root.add(r);
      const rm = new THREE.Mesh(g.rotor, hullMat);
      rm.castShadow = true;
      r.add(rm);
      const dm = new THREE.Mesh(g.disc, discMat);
      dm.visible = false;
      r.add(dm);
      rotors.push(r);
      discs.push(dm);
    }
    const light = new THREE.Mesh(g.cone, coneMat);
    light.position.set(0, -1.3, -6.8);
    light.rotation.x = 0.45;
    light.visible = false;
    root.add(light);
    if (opts.crashed) {
      rotors[0].visible = false; // forward rotor torn off
      rotors[1].rotation.z = 0.3;
      rotors[1].rotation.x = -0.18;
    }
    const glows = [];
    const addGlow = (pos, col, size, parent) => {
      if (G.isStub("fx") || typeof G.fx.glowSprite !== "function") return null;
      try {
        const s = G.fx.glowSprite(pos, col, size, {
          parent: parent || root,
          dayFactor: 0.6,
          intensity: 2.2,
        });
        if (s) glows.push(s);
        return s;
      } catch (e) {
        return null;
      }
    };
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    let beacon = null;
    if (!opts.crashed) {
      addGlow(V(-1.9, -0.6, -2.6), 0xff2a1a, 0.9);
      addGlow(V(1.9, -0.6, -2.6), 0x2aff4a, 0.9);
      addGlow(V(0, 0.2, 7.9), 0xffffff, 0.7);
      beacon = addGlow(V(0, 3.15, 4.3), 0xff3020, 1.3);
    }
    return {
      root,
      kind,
      rotors,
      discs,
      light,
      beacon,
      glows,
      rot: 0,
      /** spin rotors (rev/s, counter-rotating); `pitch` tilts both rotor discs forward in cruise (0 = hover, 1 = cruise) */
      animate(dt, spin, pitch, t) {
        this.rot += dt * spin * Math.PI * 2;
        for (let i = 0; i < 2; i++) {
          this.rotors[i].rotation.y = this.rot * (i ? -1 : 1) + i * 0.5;
          this.rotors[i].rotation.x = -(pitch || 0) * 0.08;
          this.discs[i].visible = spin > 2;
        }
        if (this.beacon && this.beacon.setIntensity)
          this.beacon.setIntensity(Math.sin(t * 6) > 0.6 ? 3 : 0.05);
      },
      dispose() {
        for (const s of glows) {
          try {
            s.dispose();
          } catch (e) {
            /* ignore */
          }
        }
        if (root.parent) root.parent.remove(root);
      },
    };
  }

  // ------------------------------------------------------------------
  // Flight
  // ------------------------------------------------------------------
  let RC = null; // active flight
  let nextFlyT = 0,
    lastDeployDay = -99;
  const _pos = new THREE.Vector3(),
    _vel = new THREE.Vector3(),
    _tmp = new THREE.Vector3();

  function pickFaction() {
    let wC = 0.55,
      wV = 0.45;
    const side = K.qFlag("mq_faction");
    if (side === "covenant") {
      wV += 0.2;
    } else if (side === "continuity") {
      wC += 0.2;
    }
    return K.weighted([
      ["continuity", wC],
      ["covenant", wV],
    ]);
  }
  function canDeploy() {
    const P = G.player;
    if (K.level() < 6 || K.day() - lastDeployDay < 2) return false;
    if (K.relation("player", "continuity") !== "hostile") return false;
    if (K.inCombat() || K.friendlyLocAt(P.pos.x, P.pos.z, 60) || !K.hasActors())
      return false;
    return true;
  }
  /**
   * Start a flight. kind 'continuity'|'covenant'; mode 'flyover'|'deploy'.
   */
  function startFlight(kind, mode, opts) {
    if (RC) endFlight();
    opts = opts || {};
    if (!LIVERY[kind]) kind = "continuity";
    const P = G.player.pos;
    const rc = createRotorcraft(kind);
    G.scene.add(rc.root);
    const hd =
      opts.heading !== undefined ? opts.heading : Math.random() * Math.PI * 2;
    const dx = Math.sin(hd),
      dz = Math.cos(hd);
    const f = {
      rc,
      kind,
      mode,
      t: 0,
      phase: "cruise",
      dir: { x: dx, z: dz },
      speed: 40,
      alt: 0,
      spawned: 0,
      soldiers: [],
      hoverT: 0,
      dustT: 0,
      sound: K.synth.rotor(),
    };
    if (mode === "deploy") {
      const a = Math.random() * 6.28;
      const hp = K.streetSpot(P.x, P.z, 30, 48, {
        road: true,
        clear: 2.5,
        notSettlement: true,
      }) || { x: P.x + Math.sin(a) * 38, y: 0, z: P.z + Math.cos(a) * 38 };
      f.hover = { x: hp.x, y: (hp.y || 0) + 20, z: hp.z, gy: hp.y || 0 };
      f.pos = new THREE.Vector3(hp.x - dx * 900, 95, hp.z - dz * 900);
      f.alt = 95;
    } else {
      const off = (Math.random() < 0.5 ? -1 : 1) * K.rand(20, 170);
      const alt =
        opts.alt || (kind === "covenant" ? K.rand(60, 95) : K.rand(75, 130));
      f.pos = new THREE.Vector3(
        P.x - dx * 950 - dz * off,
        alt,
        P.z - dz * 950 + dx * off,
      );
      f.end = { x: P.x + dx * 950 - dz * off, z: P.z + dz * 950 + dx * off };
      f.alt = alt;
    }
    f.vel = new THREE.Vector3(dx * f.speed, 0, dz * f.speed);
    RC = f;
    placeRC(0);
    K.log("rotorcraft", kind, mode);
    return f;
  }
  function endFlight() {
    if (!RC) return;
    RC.sound.stop();
    RC.rc.dispose();
    RC = null;
  }
  function placeRC(dt) {
    const f = RC,
      rc = f.rc;
    rc.root.position.copy(f.pos);
    const h = Math.hypot(f.vel.x, f.vel.z);
    const yaw = h > 0.5 ? Math.atan2(-f.vel.x, -f.vel.z) : rc.root.rotation.y;
    rc.root.rotation.order = "YXZ";
    rc.root.rotation.y = yaw;
    const cruise = K.clamp(h / 30, 0, 1);
    rc.root.rotation.x = -0.07 * cruise + Math.sin(f.t * 0.7) * 0.012; // nose down in cruise
    rc.root.rotation.z = Math.sin(f.t * 0.45) * 0.04 * cruise;
    rc.animate(dt, 3.6, cruise, f.t);
    const night = K.isDark();
    rc.light.visible = night;
    if (night) rc.light.rotation.z = Math.sin(f.t * 0.5) * 0.35;
  }
