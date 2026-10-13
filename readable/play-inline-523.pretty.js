/* src/ambient_life/40_rotorcraft.js */
/* =====================================================================
 * NEW RAD CITY — AMBIENT LIFE — 40: Rotorcraft flyovers
 *
 * A procedural Rotorcraft: a tandem twin-rotor transport helicopter (long
 * boxy fuselage, low forward rotor pylon over the cockpit, tall aft pylon
 * with twin engine pods, two counter-rotating three-blade rotors, side
 * fuel sponsons, fixed four-wheel gear, rear loading ramp, chin turret)
 * in Continuity grey or Iron Covenant gunmetal, with its own original
 * insignia decals, blinking nav lights (batched glow sprites) and, at
 * night, a sweeping searchlight cone.
 *
 * Every few minutes outdoors one crosses the sky over the player with a
 * positional, Doppler-shifted rotor wash (custom WebAudio chain). Later in
 * the game, when the Continuity is hostile, one of its birds may come in
 * low, hover, and drop a fire team, then leave.
 * Only one Rotorcraft exists at a time (≈9 draw calls).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const K = G.ambient._;

  const LIVERY = {
    continuity: {
      hull: 0x5a5f5c,
      panel: 0x6a706c,
      dark: 0x262a29,
      trim: 0xb8b8a8,
    },
    covenant: {
      hull: 0x3e3a36,
      panel: 0x4c4741,
      dark: 0x1c1a18,
      trim: 0x9a5a2a,
    },
  };
  const GEOS = {};
  const DECALS = {};

  // ------------------------------------------------------------------
  // Decal textures (original insignia)
  // ------------------------------------------------------------------
  function decalTex(kind) {
    if (DECALS[kind]) return DECALS[kind];
    const t = K.canvasTex(256, 256, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      const cx = w / 2,
        cy = h / 2;
      if (kind === "continuity") {
        // white ring on a slate disc, two stacked chevrons ("carry on"), a red bar with the name and the year it still believes in
        c.fillStyle = "#2c3a44";
        c.beginPath();
        c.arc(cx, cy, 112, 0, 6.283);
        c.fill();
        c.lineWidth = 10;
        c.strokeStyle = "#e8e6dc";
        c.beginPath();
        c.arc(cx, cy, 100, 0, 6.283);
        c.stroke();
        c.fillStyle = "#e8e6dc";
        for (const dy of [-46, -14]) {
          c.beginPath();
          c.moveTo(cx - 58, cy + dy + 22);
          c.lineTo(cx, cy + dy - 14);
          c.lineTo(cx + 58, cy + dy + 22);
          c.lineTo(cx + 58, cy + dy + 38);
          c.lineTo(cx, cy + dy + 2);
          c.lineTo(cx - 58, cy + dy + 38);
          c.closePath();
          c.fill();
        }
        c.fillStyle = "#a32a22";
        c.fillRect(cx - 86, cy + 30, 172, 30);
        c.fillStyle = "#f2f0e6";
        c.font = "bold 22px Oswald, Impact, sans-serif";
        c.textAlign = "center";
        c.fillText("CONTINUITY", cx, cy + 53);
        c.font = "bold 16px Oswald, Impact, sans-serif";
        c.fillStyle = "#e8e6dc";
        c.fillText("EST. 1967", cx, cy + 84);
      } else {
        // Iron Covenant: riveted iron shield, an anvil with a flame rising from it
        c.fillStyle = "#4a4540";
        c.strokeStyle = "#151311";
        c.lineWidth = 6;
        c.beginPath();
        c.moveTo(cx - 80, cy - 92);
        c.lineTo(cx + 80, cy - 92);
        c.lineTo(cx + 80, cy + 10);
        c.quadraticCurveTo(cx + 74, cy + 76, cx, cy + 108);
        c.quadraticCurveTo(cx - 74, cy + 76, cx - 80, cy + 10);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = "#8a8378";
        for (let i = 0; i < 7; i++) {
          c.beginPath();
          c.arc(cx - 66 + i * 22, cy - 80, 4, 0, 6.283);
          c.fill();
        }
        c.fillStyle = "#d9d2c2";
        c.beginPath();
        c.moveTo(cx - 54, cy + 4);
        c.lineTo(cx + 30, cy + 4);
        c.quadraticCurveTo(cx + 62, cy + 6, cx + 64, cy + 18);
        c.lineTo(cx + 22, cy + 22);
        c.lineTo(cx + 16, cy + 44);
        c.lineTo(cx + 34, cy + 58);
        c.lineTo(cx - 34, cy + 58);
        c.lineTo(cx - 16, cy + 44);
        c.lineTo(cx - 22, cy + 22);
        c.lineTo(cx - 54, cy + 18);
        c.closePath();
        c.fill();
        c.fillStyle = "#e07a2a";
        c.beginPath();
        c.moveTo(cx - 18, cy - 2);
        c.quadraticCurveTo(cx - 26, cy - 34, cx - 4, cy - 70);
        c.quadraticCurveTo(cx - 2, cy - 44, cx + 10, cy - 38);
        c.quadraticCurveTo(cx + 20, cy - 52, cx + 14, cy - 62);
        c.quadraticCurveTo(cx + 34, cy - 30, cx + 18, cy - 2);
        c.closePath();
        c.fill();
      }
    });
    DECALS[kind] = t;
    return t;
  }

  // ------------------------------------------------------------------
  // Geometry (forward is -Z; origin at the cabin centre)
  // ------------------------------------------------------------------
  const FWD_HUB = [0, 2.35, -5.7],
    AFT_HUB = [0, 3.45, 5.9]; // rotor hub positions (separation ≈11.6 m, discs overlap)
  function buildGeo(kind) {
    if (GEOS[kind]) return GEOS[kind];
    const C = LIVERY[kind];
    const P = (geo, col, pos, rot, sc, n) =>
      K.part(
        geo,
        col,
        pos,
        rot,
        sc,
        n === undefined ? 0.09 : n,
        pos ? pos[0] * 3 + pos[2] : 1,
      );
    const cyl = (rt, rb, h, s) =>
      new THREE.CylinderGeometry(rt, rb, h, s || 12);
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const oct = (rt, rb, h) =>
      new THREE.CylinderGeometry(rt, rb, h, 8, 1, false, Math.PI / 8); // flat-sided section
    const RX = [Math.PI / 2, 0, 0];
    const hull = [];
    // fuselage: an octagonal, almost square-section tube, flat floor
    hull.push(
      P(oct(1.38, 1.38, 12.6), C.hull, [0, 0, 0.4], RX, [1.0, 1, 0.94]),
    );
    hull.push(P(box(2.5, 0.3, 12.4), C.dark, [0, -1.2, 0.4], null, null, 0.04));
    // nose: tapered section + rounded cap, cockpit frames
    hull.push(
      P(oct(1.38, 1.0, 1.8), C.hull, [0, -0.05, -6.7], RX, [1.0, 1, 0.94]),
    );
    hull.push(
      P(
        new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        C.hull,
        [0, -0.15, -7.6],
        [-Math.PI / 2, 0, 0],
        [1.0, 0.85, 0.9],
      ),
    );
    hull.push(
      P(box(0.08, 0.9, 1.5), C.dark, [0, 0.62, -7.0], [0.5, 0, 0], null, 0),
    ); // windscreen centre post
    // chin turret
    hull.push(
      P(new THREE.SphereGeometry(0.34, 10, 8), C.dark, [0, -1.05, -7.6]),
    );
    hull.push(P(cyl(0.06, 0.06, 1.1, 6), 0x1a1a1a, [0.1, -1.1, -8.1], RX));
    hull.push(P(cyl(0.06, 0.06, 1.1, 6), 0x1a1a1a, [-0.1, -1.1, -8.1], RX));
    // forward rotor pylon (low hump over the cockpit) and its mast
    hull.push(P(box(1.3, 0.75, 2.6), C.panel, [0, 1.62, -5.4], [0.08, 0, 0]));
    hull.push(
      P(cyl(0.22, 0.3, 0.5, 10), C.dark, [
        FWD_HUB[0],
        FWD_HUB[1] - 0.35,
        FWD_HUB[2],
      ]),
    );
    // aft rotor pylon: tall, raked forward face
    hull.push(P(box(1.5, 2.1, 3.6), C.panel, [0, 2.05, 5.4]));
    hull.push(P(box(1.5, 1.2, 1.6), C.panel, [0, 1.7, 3.3], [-0.5, 0, 0]));
    hull.push(
      P(cyl(0.26, 0.34, 0.5, 10), C.dark, [
        AFT_HUB[0],
        AFT_HUB[1] - 0.35,
        AFT_HUB[2],
      ]),
    );
    // dorsal walkway between the pylons
    hull.push(P(box(0.9, 0.22, 7.0), C.panel, [0, 1.42, 0.0]));
    for (const s of [-1, 1]) {
      // twin engine pods on the aft pylon
      hull.push(P(cyl(0.48, 0.48, 2.9, 12), C.hull, [s * 1.25, 2.05, 5.0], RX));
      hull.push(
        P(
          cyl(0.36, 0.36, 0.12, 12),
          0x0e0e0e,
          [s * 1.25, 2.05, 3.5],
          RX,
          null,
          0,
        ),
      ); // intake
      hull.push(P(cyl(0.34, 0.26, 0.6, 10), C.dark, [s * 1.25, 2.05, 6.7], RX)); // exhaust
      hull.push(P(box(0.4, 0.3, 1.8), C.dark, [s * 0.95, 1.8, 5.0])); // pylon fairing
      // side fuel sponsons
      hull.push(P(box(0.62, 0.9, 6.4), C.hull, [s * 1.55, -0.72, 0.6]));
      hull.push(
        P(
          cyl(0.45, 0.45, 0.62, 10),
          C.hull,
          [s * 1.55, -0.72, -2.6],
          [0, 0, Math.PI / 2],
          [1, 1, 1],
        ),
      );
      // cabin windows (row of small square ports) and the crew door
      for (let k = 0; k < 6; k++)
        hull.push(
          P(
            box(0.05, 0.36, 0.36),
            0x101415,
            [s * 1.31, 0.42, -3.6 + k * 1.15],
            null,
            null,
            0.02,
          ),
        );
      hull.push(
        P(
          box(0.05, 1.5, 0.95),
          C.dark,
          [s * 1.3, -0.15, -4.8],
          null,
          null,
          0.03,
        ),
      );
      // landing gear: nose pair under the cockpit, main pair under the sponsons
      hull.push(P(cyl(0.07, 0.07, 0.75, 6), C.dark, [s * 0.9, -1.55, -5.2]));
      hull.push(
        P(
          cyl(0.34, 0.34, 0.22, 12),
          0x161616,
          [s * 0.9, -1.92, -5.2],
          [0, 0, Math.PI / 2],
          null,
          0.05,
        ),
      );
      hull.push(P(cyl(0.08, 0.08, 0.7, 6), C.dark, [s * 1.6, -1.45, 2.6]));
      hull.push(
        P(
          cyl(0.38, 0.38, 0.26, 12),
          0x161616,
          [s * 1.6, -1.88, 2.6],
          [0, 0, Math.PI / 2],
          null,
          0.05,
        ),
      );
      // trim stripe
      hull.push(
        P(
          box(0.04, 0.12, 9.5),
          C.trim,
          [s * 1.33, -0.62, 0.6],
          null,
          null,
          0.02,
        ),
      );
    }
    // panel seams round the fuselage
    for (const z of [-3.2, 0.4, 3.8])
      hull.push(
        P(oct(1.395, 1.395, 0.05), C.dark, [0, 0, z], RX, [1.0, 1, 0.94], 0),
      );
    // rear loading ramp (tail) and its hinge seam
    hull.push(P(box(2.3, 0.22, 2.0), C.panel, [0, -0.55, 7.25], [0.42, 0, 0]));
    hull.push(P(box(2.4, 0.06, 0.06), C.dark, [0, -1.2, 6.5], null, null, 0));
    // cockpit glazing: flat panes on the nose (front, sides, chin windows)
    const gl = [];
    const pane = (w, h, pos, rot) =>
      gl.push(
        G.util.bake(
          new THREE.BoxGeometry(w, h, 0.04),
          new THREE.Vector3(pos[0], pos[1], pos[2]),
          rot[1],
          1,
          rot[0],
          rot[2],
        ),
      );
    pane(0.85, 0.75, [0.45, 0.55, -7.15], [-0.55, 0.32, 0]);
    pane(0.85, 0.75, [-0.45, 0.55, -7.15], [-0.55, -0.32, 0]);
    pane(1.3, 0.6, [0.98, 0.45, -6.4], [0, Math.PI / 2 - 0.12, 0]);
    pane(1.3, 0.6, [-0.98, 0.45, -6.4], [0, -Math.PI / 2 + 0.12, 0]);
    pane(0.5, 0.4, [0.45, -0.55, -7.55], [0.6, 0.3, 0]);
    pane(0.5, 0.4, [-0.45, -0.55, -7.55], [0.6, -0.3, 0]);
    const glass = K.paint(G.util.mergeGeometries(gl), 0x9ab0b0);
    for (const g of gl) g.dispose();
    // rotor: three long blades + hub (one shared geometry for both rotors)
    const bl = [];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      bl.push(
        K.part(
          new THREE.BoxGeometry(0.42, 0.06, 5.4),
          0x1d1f20,
          [Math.sin(a) * 3.0, 0, Math.cos(a) * 3.0],
          [0.04, a, 0],
          null,
          0.05,
        ),
      );
      bl.push(
        K.part(
          new THREE.BoxGeometry(0.43, 0.062, 0.45),
          0xd8c040,
          [Math.sin(a) * 5.45, 0, Math.cos(a) * 5.45],
          [0.04, a, 0],
          null,
          0,
        ),
      );
    }
    bl.push(K.part(cyl(0.34, 0.34, 0.3, 10), C.dark, [0, 0, 0]));
    bl.push(
      K.part(
        new THREE.SphereGeometry(0.22, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        C.panel,
        [0, 0.15, 0],
      ),
    );
    const rotor = K.merge(bl);
    const disc = new THREE.CircleGeometry(5.7, 32);
    disc.rotateX(-Math.PI / 2);
    const cone = new THREE.ConeGeometry(9, 70, 20, 1, true);
    cone.translate(0, -35, 0);
    GEOS[kind] = {
      hull: K.merge(hull),
      glass,
      rotor,
      disc,
      cone,
      plane: new THREE.PlaneGeometry(1.8, 1.8),
    };
    return GEOS[kind];
  }

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
  function updateFlight(dt, realDt) {
    const f = RC;
    if (!f) return;
    const P = G.player;
    if (dt > 0) {
      f.t += dt;
      if (f.mode === "flyover") {
        f.pos.addScaledVector(f.vel, dt);
        const toEnd = Math.hypot(f.end.x - f.pos.x, f.end.z - f.pos.z);
        if (toEnd < 30 || f.t > 80) {
          endFlight();
          return;
        }
      } else {
        const H = f.hover;
        if (f.phase === "cruise") {
          const dx = H.x - f.pos.x,
            dz = H.z - f.pos.z,
            d = Math.hypot(dx, dz);
          const sp = Math.min(40, d * 0.35 + 1.5);
          f.vel.set(
            (dx / d) * sp,
            (H.y + 60 * K.clamp(d / 300, 0, 1) - f.pos.y) * 0.4,
            (dz / d) * sp,
          );
          f.pos.addScaledVector(f.vel, dt);
          if (d < 3) {
            f.phase = "hover";
            f.hoverT = 0;
          }
        } else if (f.phase === "hover") {
          f.hoverT += dt;
          f.vel.set(0, (H.y - f.pos.y) * 1.2, 0);
          f.pos.addScaledVector(f.vel, dt);
          f.pos.x = H.x + Math.sin(f.t * 0.8) * 0.4;
          f.pos.z = H.z + Math.cos(f.t * 0.6) * 0.4;
          // downwash dust + shake (two discs: a wider dust ring)
          f.dustT -= dt;
          if (
            f.dustT <= 0 &&
            !G.isStub("fx") &&
            typeof G.fx.dust === "function"
          ) {
            f.dustT = 0.3;
            _tmp.set(
              H.x + (Math.random() - 0.5) * 9,
              H.gy + 0.2,
              H.z + (Math.random() - 0.5) * 9,
            );
            try {
              G.fx.dust(_tmp);
            } catch (e) {
              /* ignore */
            }
          }
          if (
            Math.hypot(P.pos.x - H.x, P.pos.z - H.z) < 30 &&
            P.shake &&
            Math.random() < dt * 2
          )
            P.shake(0.08, 0.3);
          // drop the fire team down the rear ramp
          if (
            f.hoverT > 2.2 &&
            f.spawned < 3 &&
            f.hoverT > 2.2 + f.spawned * 0.9
          ) {
            f.spawned++;
            const s = K.freeSpotNear(
              H.x + (Math.random() - 0.5) * 5,
              H.z + (Math.random() - 0.5) * 5,
              3,
              10,
            );
            if (s) {
              const lvl = Math.max(8, K.level() + K.randInt(0, 2));
              const a = K.spawnActor({
                type: "continuity_soldier",
                faction: "continuity",
                voice: "continuity",
                name:
                  f.spawned === 1
                    ? "Continuity Sergeant"
                    : "Continuity Trooper",
                level: lvl,
                pos: s,
                yaw: K.yawTo(s.x, s.z, P.pos.x, P.pos.z),
                ai: "patrol",
                patrol: [{ x: P.pos.x, z: P.pos.z }],
                noRespawn: true,
              });
              if (a) {
                f.soldiers.push(a);
                if (f.spawned === 1)
                  K.say(
                    a,
                    K.pick([
                      "Boots on the ground! By the book, people!",
                      "Unregistered civilian sighted. Weapons free.",
                      "Deploying. Restore order to the sector.",
                    ]),
                    3.5,
                  );
              }
            }
          }
          if (f.hoverT > 7.5) {
            f.phase = "leave";
            f.leaveT = 0;
            if (K.encounters) K.encounters.adopt(f.soldiers, "rotorcraft_drop");
            f.soldiers = [];
          }
        } else {
          f.leaveT += dt;
          const up = f.leaveT < 4 ? 7 : 1;
          const fw = K.clamp((f.leaveT - 2) * 12, 0, 45);
          f.vel.set(f.dir.x * fw, up, f.dir.z * fw);
          f.pos.addScaledVector(f.vel, dt);
          if (f.leaveT > 30) {
            endFlight();
            return;
          }
        }
      }
      placeRC(dt);
    }
    // rotor wash (fades out in menus via the synth handle)
    _pos.copy(f.pos);
    _vel.copy(f.vel);
    const d = Math.hypot(
      P.pos.x - f.pos.x,
      P.pos.y - f.pos.y,
      P.pos.z - f.pos.z,
    );
    f.sound.update(
      _pos,
      _vel,
      K.clamp(1.3 - d / 1100, 0, 1) * (K.isInterior(P.pos.x) ? 0.25 : 1),
      realDt,
    );
  }

  function schedule(dt) {
    if (dt <= 0 || RC) return;
    const t = K.now();
    if (!nextFlyT) nextFlyT = t + K.rand(70, 200);
    if (t < nextFlyT) return;
    nextFlyT = t + K.rand(180, 420);
    if (!K.playerOutdoors() || K.isStormy() || G.state !== "play") return;
    const kind = pickFaction();
    if (kind === "continuity" && canDeploy() && Math.random() < 0.35) {
      lastDeployDay = K.day();
      startFlight("continuity", "deploy");
    } else startFlight(kind, "flyover");
  }

  K.system({
    name: "rotorcraft",
    order: 40,
    reset() {
      endFlight();
      nextFlyT = 0;
      lastDeployDay = -99;
    },
    update(dt, realDt) {
      schedule(dt);
      updateFlight(dt, realDt);
    },
    save: () => ({ deploy: lastDeployDay }),
    load(d) {
      lastDeployDay = d && typeof d.deploy === "number" ? d.deploy : -99;
    },
  });

  K.rotorcraft = {
    create: createRotorcraft,
    fly: (kind, mode, opts) =>
      startFlight(kind || "continuity", mode || "flyover", opts),
    end: endFlight,
    active: () => RC,
  };
})();
