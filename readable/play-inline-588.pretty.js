/* src/lair/20_sunroom.js */
/* =====================================================================
 * NEW RAD CITY — lair / 20_sunroom.js
 * Cell 'lair_m42': the M42 substation, the Glowkeepers' Sun Room.
 * Cell-local coordinates (root group at the cell origin), floor y 0:
 *   hall x -22..22, z -26..26, walls to y 8, barrel vault (rise 9) with the
 *   twelve-ray sun painted across it; the M42 door in the west wall (z 0);
 *   Rose's handcar spur opens in the east wall (z 8..12).
 *   Nine dead 1913 rotary converters stand in a ring (r 13) like black
 *   standing stones; in the middle, on a railway flatcar, the Second Sun
 *   (pale casing stencilled SIROCCO 2), cabled to a firing set on a card
 *   table; the brass plate with the cipher wheel and two keyways (one fresh
 *   drilled); the cradle with the knitted blanket and the tin cup; the
 *   record player; the dosimeter; the information-booth clock (09:31) hung
 *   on a converter; the M42 main breaker; candles on every ledge.
 * Dynamic pieces (clock faces, record platter, breaker lever, firing-set
 * lamp, the battery / converter tap, the concrete of ending B) are kept in
 * K.sun so the finale can drive them.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  const K = G.lair && G.lair._;
  if (!K) return;
  const HP = K.HP,
    PI = K.PI;

  const D = (K.SUN = {
    X0: -22,
    X1: 22,
    Z0: -26,
    Z1: 26,
    YS: 8,
    RISE: 9,
    BOMB: { x: 0, y: 1.25, z: 0 }, // flatcar deck centre
    TABLE: { x: -3.3, z: 2.4 }, // card table: firing set + the mask
    PLATE: { x: -2.3, z: -0.8 }, // brass plate: cipher wheel + keyways
    CRADLE: { x: -3.2, z: 6.4 },
    CHAIR: { x: -5.4, z: 6.0 },
    RECORD: { x: -7.0, z: 9.4 },
    DOSI: { x: -2.6, z: -4.6 },
    BATTERY: { x: -5.4, z: 1.2 },
    BREAKER: { x: 8, z: -25.7 },
    SPUR: { x: 22, z: 10 },
    CONVERTERS: [20, 60, 95, 128, 160, 200, 232, 265, 300].map((a) => {
      const t = (a * PI) / 180;
      return { a, x: 13 * Math.cos(t), z: -13 * Math.sin(t) };
    }),
  });
  K.sun = K.sun || {};

  /** Draw the information-booth clock face for 09:MM. */
  function drawClock(c, min) {
    const x = c.getContext("2d"),
      S = c.width,
      R = S / 2;
    x.clearRect(0, 0, S, S);
    const g = x.createRadialGradient(R, R * 0.9, R * 0.1, R, R, R);
    g.addColorStop(0, "#fbf3dc");
    g.addColorStop(1, "#d8c89c");
    x.fillStyle = g;
    x.beginPath();
    x.arc(R, R, R - 2, 0, K.TAU);
    x.fill();
    x.strokeStyle = "#2a2014";
    x.lineWidth = S * 0.012;
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * K.TAU,
        l = i % 5 ? 0.06 : 0.13;
      x.lineWidth = i % 5 ? S * 0.006 : S * 0.016;
      x.beginPath();
      x.moveTo(R + Math.sin(a) * R * 0.86, R - Math.cos(a) * R * 0.86);
      x.lineTo(
        R + Math.sin(a) * R * (0.86 - l),
        R - Math.cos(a) * R * (0.86 - l),
      );
      x.stroke();
    }
    x.fillStyle = "#2a2014";
    x.font = "700 " + Math.round(S * 0.1) + "px Georgia, serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    for (let h = 1; h <= 12; h++) {
      const a = (h / 12) * K.TAU;
      x.fillText(
        String(h),
        R + Math.sin(a) * R * 0.62,
        R - Math.cos(a) * R * 0.62,
      );
    }
    const hand = (a, len, w) => {
      x.lineWidth = w;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(R, R);
      x.lineTo(R + Math.sin(a) * len, R - Math.cos(a) * len);
      x.stroke();
    };
    hand(((9 + min / 60) / 12) * K.TAU, R * 0.45, S * 0.035);
    hand((min / 60) * K.TAU, R * 0.72, S * 0.022);
    x.fillStyle = "#7a1a10";
    x.beginPath();
    x.arc(R, R, S * 0.03, 0, K.TAU);
    x.fill();
    x.strokeStyle = "rgba(80,60,20,0.35)";
    x.lineWidth = S * 0.02;
    x.beginPath();
    x.arc(R, R, R - S * 0.02, 0, K.TAU);
    x.stroke();
  }

  K.addBuild(20, function buildSunRoom() {
    const O = K.O2();
    if (!O) return;
    const root = new THREE.Group();
    root.name = "lair_m42";
    root.position.set(O.x, 0, O.z);
    G.scene.add(root);
    K.roots = K.roots || {};
    K.roots.m42 = root;
    const b = K.builder("m42", {
      ambient: 0.13,
      grime: 0.5,
      maxLight: 2.0,
      seg: 1.6,
      gain: 1.0,
    });
    const glows = K.glowSet();
    const r = K.rng("sunroom");
    const col = (x0, y0, z0, x1, y1, z1, o) =>
      K.col(O.x + x0, y0, O.z + z0, O.x + x1, y1, O.z + z1, o);
    const colR = (cx, cz, w, d, y0, y1, yaw, o) =>
      K.colRot(O.x + cx, O.z + cz, w, d, y0, y1, yaw, o);
    const anchor = (name, x, y, z, yaw) => K.anchor(name, K.w2(x, y, z), yaw);
    const { X0, X1, Z0, Z1, YS, RISE } = D;
    const flames = [];

    // ===============================================================
    // SHELL
    // ===============================================================
    b.boxMM("concrete_grey", X0, -0.2, Z0, X1, 0, Z1, {
      faces: "t",
      grime: 0.65,
      seg: 1.4,
      tint: 0x8a8478,
    });
    // old terrazzo ring under the converters (the 1913 floor)
    for (let i = 0; i < 48; i++) {
      const a0 = (i / 48) * K.TAU,
        a1 = ((i + 1) / 48) * K.TAU;
      const p = (rr, a) => [rr * Math.cos(a), 0.012, -rr * Math.sin(a)];
      b.quad("terrazzo", p(10.5, a0), p(16, a0), p(16, a1), p(10.5, a1), {
        grime: 0.4,
        tint: 0x9a9284,
      });
    }
    // walls: concrete dado to 1.2 with a stone ledge, soot brick above
    const wall = (ax, az, ux, uz, L, skip) => {
      // skip: [[from, to, height]] openings along the wall (metres from the start)
      let t = 0;
      const segs = (skip || []).slice().sort((p, q) => p[0] - q[0]);
      const seg = (t0, t1, y0, y1) => {
        if (t1 - t0 < 1e-3 || y1 - y0 < 1e-3) return;
        b.face(
          y0 < 1.2 ? "concrete_panel" : "brick_soot",
          ax + ux * t0,
          y0,
          az + uz * t0,
          ux,
          0,
          uz,
          0,
          1,
          0,
          t1 - t0,
          y1 - y0,
          { grime: 0.6, uo: t0 },
        );
      };
      for (const [s0, s1, h] of segs) {
        seg(t, s0, 0, 1.2);
        seg(t, s0, 1.2, YS);
        seg(s0, s1, Math.max(1.2, h), YS);
        if (h < 1.2) seg(s0, s1, h, 1.2);
        t = s1;
      }
      seg(t, L, 0, 1.2);
      seg(t, L, 1.2, YS);
    };
    wall(X0, Z1, 0, -1, Z1 - Z0, [[Z1 - 2.3, Z1 + 2.3, 4.6]]); // west (faces +x), door at z 0 (t = 26)
    wall(X1, Z0, 0, 1, Z1 - Z0, [[8 - Z0, 12 - Z0, 4.4]]); // east (faces -x), spur z 8..12
    wall(X0, Z0, 1, 0, X1 - X0); // north (faces +z)
    wall(X1, Z1, -1, 0, X1 - X0); // south (faces -z)
    col(X0 - 0.8, 0, Z0, X0, YS + RISE, -2.3);
    col(X0 - 0.8, 0, 2.3, X0, YS + RISE, Z1);
    col(X1, 0, Z0, X1 + 0.8, YS + RISE, 8);
    col(X1, 0, 12, X1 + 0.8, YS + RISE, Z1);
    col(X0, 0, Z0 - 0.8, X1, YS + RISE, Z0);
    col(X0, 0, Z1, X1, YS + RISE, Z1 + 0.8);
    // the ledge (candles on every ledge)
    const ledge = (ax, az, bx, bz, nx, nz) => {
      const L = Math.hypot(bx - ax, bz - az),
        yaw = Math.atan2(bx - ax, bz - az);
      b.box(
        "limestone",
        (ax + bx) / 2 + nx * 0.18,
        1.12,
        (az + bz) / 2 + nz * 0.18,
        0.36,
        0.1,
        L,
        { yaw, grime: 0.5, tint: 0xa8a090 },
      );
    };
    ledge(X0, Z0, X0, -2.3, 1, 0);
    ledge(X0, 2.3, X0, Z1, 1, 0);
    ledge(X1, Z0, X1, 8, -1, 0);
    ledge(X1, 12, X1, Z1, -1, 0);
    ledge(X0, Z0, X1, Z0, 0, 1);
    ledge(X0, Z1, X1, Z1, 0, -1);
    const ledgeCandles = (ax, az, bx, bz, nx, nz) => {
      for (const p of K.candleRow(
        b,
        glows,
        ax + nx * 0.18,
        1.22,
        az + nz * 0.18,
        bx + nx * 0.18,
        bz + nz * 0.18,
        0.2,
        r,
        { gaps: 0.35, hMin: 0.05, hMax: 0.3, jitter: 0.1 },
      ))
        flames.push(p);
    };
    ledgeCandles(X0, Z0 + 0.5, X0, -2.6, 1, 0);
    ledgeCandles(X0, 2.6, X0, Z1 - 0.5, 1, 0);
    ledgeCandles(X1, Z0 + 0.5, X1, 7.6, -1, 0);
    ledgeCandles(X1, 12.4, X1, Z1 - 0.5, -1, 0);
    ledgeCandles(X0 + 0.5, Z0, X1 - 0.5, Z0, 0, 1);
    ledgeCandles(X0 + 0.5, Z1, X1 - 0.5, Z1, 0, -1);
    // vault with the painted sun, lunettes at the ends
    b.vaultZ("sun_ceiling", X0, X1, Z0, Z1, YS, RISE, {
      segs: 28,
      rect: [0, 0, 1, 1],
      grime: 0.15,
      seg: 2.2,
    });
    K.lunette(b, "brick_soot", 0, YS, Z0, (X1 - X0) / 2, RISE, 0, {
      grime: 0.6,
    });
    K.lunette(b, "brick_soot", 0, YS, Z1, (X1 - X0) / 2, RISE, PI, {
      grime: 0.6,
    });
    // riveted pilasters + iron ribs following the vault
    for (let z = Z0 + 4; z < Z1 - 1; z += 6.5) {
      for (const s of [-1, 1]) {
        const x = s < 0 ? X0 + 0.22 : X1 - 0.22;
        b.box("iron", x, 0, z, 0.44, YS, 0.5, { grime: 0.6 });
        b.box("iron", x - s * 0.1, YS - 0.4, z, 0.65, 0.4, 0.6, { grime: 0.5 });
      }
      for (let i = 0; i < 20; i++) {
        const a0 = (PI * i) / 20,
          a1 = (PI * (i + 1)) / 20,
          hw = (X1 - X0) / 2 - 0.15;
        b.beam(
          "iron",
          hw * Math.cos(a0),
          YS + (RISE - 0.15) * Math.sin(a0),
          z,
          hw * Math.cos(a1),
          YS + (RISE - 0.15) * Math.sin(a1),
          z,
          0.22,
          { d: 0.18, grime: 0.6 },
        );
      }
    }
    // cable trays along the long walls, dead switchgear panels, stencils
    for (const s of [-1, 1]) {
      const x = s < 0 ? X0 + 0.5 : X1 - 0.5;
      b.box("iron", x, 5.4, 0, 0.5, 0.06, Z1 - Z0 - 2, { grime: 0.6 });
      for (let k = 0; k < 5; k++)
        b.beam(
          "rubber",
          x - s * 0.15 + (k - 2) * 0.07,
          5.5,
          Z0 + 1,
          x - s * 0.15 + (k - 2) * 0.07,
          5.5,
          Z1 - 1,
          0.06,
          { round: 6, grime: 0.5 },
        );
    }
    for (let x = X0 + 4; x < X1 - 3; x += 7)
      if (Math.abs(x - D.BREAKER.x) > 3) {
        b.box("paint_grey", x, 1.6, Z0 + 0.15, 2.0, 2.4, 0.3, { grime: 0.7 });
        for (let k = 0; k < 4; k++)
          b.cyl(
            "paint_black",
            x - 0.6 + k * 0.4,
            3.4,
            Z0 + 0.32,
            0.09,
            0.09,
            0.05,
            10,
            { top: true },
          );
      }
    b.wallDecal("danger", -10, 3.2, Z0 + 0.03, 4.4, 0.42, 0);
    b.wallDecal("danger", 10, 3.2, Z1 - 0.03, 4.4, 0.42, PI);
    b.wallDecal("creed", 0, YS + 2.4, Z0 + 0.03, 12, 1.4, 0);
    b.wallDecal("creed3", 0, YS + 2.4, Z1 - 0.03, 9, 1.0, PI);
    b.wallDecal("creed2", X1 - 0.03, 6.4, -12, 10, 0.9, -HP);
    // M42 door (inside face)
    {
      const dz = 0,
        dw = 4.6,
        dh = 4.6,
        dx = X0 + 0.12;
      b.box("iron", dx + 0.05, 0, dz, 0.3, dh + 0.35, dw + 0.7, { grime: 0.6 });
      for (const s of [-1, 1])
        b.box(
          "rust",
          dx + 0.22,
          0.02,
          dz + (s * dw) / 4,
          0.12,
          dh,
          dw / 2 - 0.03,
          { grime: 0.55 },
        );
      for (let k = 0; k < 4; k++)
        b.box("iron", dx + 0.3, 0.4 + k * 1.15, dz, 0.04, 0.08, dw, {
          grime: 0.4,
        });
      b.panel("decal", dx + 0.32, dh + 0.8, dz, 2.6, 0.55, HP, {
        rect: K.decal("m42"),
      });
      anchor("m42_arrival", X0 + 2.6, 0, 0, -HP);
      anchor("m42_exit", X0 + 0.5, 1.4, 0, HP);
    }
    // Rose's handcar spur opening (east wall, z 8..12) — a short dark tunnel with rails
    {
      const z0 = 8,
        z1 = 12,
        tx1 = X1 + 12;
      b.face("brick_soot", X1, 0, z0, 1, 0, 0, 0, 1, 0, tx1 - X1, 2.6, {
        grime: 0.75,
      });
      b.face("brick_soot", tx1, 0, z1, -1, 0, 0, 0, 1, 0, tx1 - X1, 2.6, {
        grime: 0.75,
      });
      b.vaultX("brick_soot", z0, z1, X1, tx1, 2.6, 1.8, { segs: 10 });
      b.boxMM("gravel", X1, -0.2, z0, tx1, 0.02, z1, {
        faces: "t",
        grime: 0.6,
      });
      for (let x = X1 + 0.3; x < tx1; x += 0.62)
        b.box("wood_dark", x, 0.0, (z0 + z1) / 2, 0.24, 0.12, 2.4, {
          grime: 0.7,
        });
      for (const s of [-0.72, 0.72])
        b.box(
          "rust_dark",
          (X1 + tx1) / 2 - 3,
          0.1,
          10 + s,
          tx1 - X1 + 6,
          0.1,
          0.08,
          { grime: 0.5 },
        );
      b.box("shade", tx1 - 0.2, 0, 10, 0.1, 4.6, 4.2, { faces: "w" });
      col(X1, 0, z0 - 0.6, tx1, 5, z0);
      col(X1, 0, z1, tx1, 5, z1 + 0.6);
      col(tx1 - 0.3, 0, z0, tx1, 5, z1);
      for (const z of [8.3, 11.7])
        for (const p of K.candleRow(
          b,
          glows,
          X1 + 0.5,
          0.0,
          z,
          X1 + 6,
          z,
          0.4,
          r,
          { gaps: 0.5 },
        ))
          flames.push(p);
      b.wallDecal("roses_chalk", X1 + 1.5, 1.6, z0 + 0.03, 0.8, 0.4, 0);
      b.light(X1 + 8, 2.0, 10, 6, 0x6a7a90, 0.25);
      anchor("spur_mouth", X1 - 2.0, 0, 10, HP);
      anchor("spur_deep", X1 + 8, 0, 10, HP);
    }

    // ===============================================================
    // THE CONVERTER RING (nine dead 1913 rotary converters)
    // ===============================================================
    for (const c of D.CONVERTERS) {
      const { x, z } = c,
        face = Math.atan2(-x, -z); // yaw that faces the centre
      b.box("concrete_grey", x, 0, z, 3.4, 0.55, 3.4, {
        yaw: face,
        grime: 0.6,
      });
      b.cyl("iron", x, 0.55, z, 1.35, 1.32, 3.2, 20, {
        grime: 0.7,
        top: false,
      });
      b.cyl("iron", x, 3.75, z, 1.32, 0.9, 0.35, 20, { grime: 0.6 });
      b.cyl("iron", x, 4.1, z, 0.5, 0.42, 0.45, 12, { grime: 0.5 });
      // commutator band (copper bars) and lifting rings
      b.cyl("bronze", x, 2.6, z, 1.38, 1.38, 0.42, 24, {
        grime: 0.5,
        top: false,
      });
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * K.TAU;
        b.box(
          "iron",
          x + Math.cos(a) * 1.39,
          2.6,
          z - Math.sin(a) * 1.39,
          0.04,
          0.42,
          0.04,
        );
      }
      b.cyl("iron", x, 1.3, z, 1.4, 1.4, 0.12, 20, { top: false });
      b.cyl("iron", x, 3.55, z, 1.4, 1.4, 0.12, 20, { top: false });
      // terminal box and cable conduit to the wall
      const ox2 = x + Math.sin(face + PI) * 1.4,
        oz2 = z + Math.cos(face + PI) * 1.4;
      b.box("paint_grey", ox2, 0.55, oz2, 0.6, 0.9, 0.6, {
        yaw: face,
        grime: 0.7,
      });
      // a white twelve-ray sun painted on every other drum, facing the flatcar
      if (Math.round(c.a / 10) % 2 === 0)
        b.panel(
          "decal",
          x + Math.sin(face) * 1.36,
          1.9,
          z + Math.cos(face) * 1.36,
          1.6,
          1.6,
          face,
          { rect: K.decal("sun_white") },
        );
      // candles on the plinth
      for (let k = 0; k < 14; k++) {
        const a = r() * K.TAU,
          rr = 1.45 + r() * 0.2;
        if (r() < 0.25) continue;
        const cx = x + Math.cos(a) * rr,
          cz = z - Math.sin(a) * rr;
        flames.push([
          cx,
          K.candle(
            b,
            glows,
            cx,
            0.55,
            cz,
            0.05 + r() * 0.3,
            0.025 + r() * 0.02,
          ),
          cz,
        ]);
      }
      b.floorDecal(
        "wax_pool",
        x + Math.sin(face) * 2.2,
        0.01,
        z + Math.cos(face) * 2.2,
        1.2,
        1.2,
        r() * 6,
      );
      colR(x, z, 3.4, 3.4, 0, 0.55, face);
      K.col(
        O.x + x - 1.35,
        0.55,
        O.z + z - 1.35,
        O.x + x + 1.35,
        4.5,
        O.z + z + 1.35,
      );
    }
    // the information-booth clock hung on the north converter (a = 95), facing the flatcar
    {
      const c = D.CONVERTERS.find((q) => q.a === 95);
      const face = Math.atan2(-c.x, -c.z);
      const cx = c.x + Math.sin(face) * 1.6,
        cz = c.z + Math.cos(face) * 1.6,
        cy = 4.6;
      b.beam(
        "iron",
        c.x + Math.sin(face) * 1.0,
        4.3,
        c.z + Math.cos(face) * 1.0,
        cx,
        cy + 0.65,
        cz,
        0.08,
      );
      b.beam("brass", cx, cy + 0.65, cz, cx, cy + 0.42, cz, 0.04, { round: 8 });
      // four-faced brass case (dynamic faces below)
      b.cyl("brass", cx, cy - 0.5, cz, 0.12, 0.22, 0.3, 12, { grime: 0.2 });
      b.geo("brass", K.T.sphere, { x: cx, y: cy, z: cz, s: 0.44, grime: 0.15 });
      b.geo("brass", K.T.sphere, {
        x: cx,
        y: cy + 0.48,
        z: cz,
        s: 0.08,
        grime: 0.1,
      });
      const cv = K.canvas(256, 256);
      drawClock(cv, 31);
      const tex = K.texFromCanvas(cv, { clamp: true });
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        emissive: 0x3a2a10,
        emissiveMap: tex,
        emissiveIntensity: 0.6,
        roughness: 0.5,
      });
      const grp = new THREE.Group();
      grp.position.set(cx, cy, cz);
      for (let k = 0; k < 4; k++) {
        const m = new THREE.Mesh(new THREE.CircleGeometry(0.3, 28), mat);
        const a = face + k * HP;
        m.position.set(Math.sin(a) * 0.45, 0, Math.cos(a) * 0.45);
        m.rotation.y = a;
        grp.add(m);
      }
      root.add(grp);
      K.sun.clock = {
        canvas: cv,
        tex,
        set(min) {
          drawClock(cv, min);
          tex.needsUpdate = true;
        },
      };
      b.light(
        cx + Math.sin(face) * 1.0,
        cy,
        cz + Math.cos(face) * 1.0,
        3.2,
        0xffd890,
        0.7,
      );
      anchor(
        "clock",
        cx + Math.sin(face) * 2.4,
        0,
        cz + Math.cos(face) * 2.4,
        face + PI,
      );
    }

    // ===============================================================
    // THE SECOND SUN on its flatcar
    // ===============================================================
    {
      const bz = D.BOMB.z,
        deck = 1.25;
      // embedded rails across the room centre
      for (const s of [-0.72, 0.72])
        b.box("steel", s, 0, 0, 0.08, 0.06, 26, { tint: 0x7a7670, grime: 0.4 });
      // trucks
      for (const zc of [bz - 4.4, bz + 4.4]) {
        b.boxMM("iron", -1.2, 0.35, zc - 1.2, 1.2, 0.8, zc + 1.2, {
          grime: 0.7,
        });
        for (const dz of [-0.8, 0.8])
          for (const s of [-0.72, 0.72])
            b.geo("iron", K.T.cyl16, {
              x: s * 1.05,
              y: 0.42,
              z: zc + dz,
              rz: HP,
              sx: 0.42,
              sy: 0.1,
              sz: 0.42,
            });
      }
      // deck: wooden planks over a steel frame
      b.boxMM("iron", -1.45, 0.8, bz - 6.2, 1.45, deck - 0.12, bz + 6.2, {
        grime: 0.7,
      });
      b.boxMM("wood_dark", -1.4, deck - 0.12, bz - 6.1, 1.4, deck, bz + 6.1, {
        faces: "nsewt",
        grime: 0.6,
      });
      for (let z = bz - 5.8; z < bz + 6; z += 1.2)
        for (const s of [-1.42, 1.42])
          b.box("iron", s, deck - 0.4, z, 0.06, 0.3, 0.12); // stake pockets
      col(-1.45, 0, bz - 6.2, 1.45, deck, bz + 6.2, { surface: "wood" });
      // wooden chocks + webbing straps
      for (const zc of [bz - 1.4, bz + 1.0]) {
        b.box("wood", -0.62, deck, zc, 0.36, 0.45, 0.5, { grime: 0.5 });
        b.box("wood", 0.62, deck, zc, 0.36, 0.45, 0.5, { grime: 0.5 });
      }
      // casing: cylinder (along z) + ogive nose (north, -z) + tail cone + four fins
      const cy = deck + 0.82,
        R = 0.76,
        L = 4.4,
        z0 = bz - 2.4,
        z1 = z0 + L;
      b.geo("casing", K.T.cyl16, {
        x: 0,
        y: cy,
        z: (z0 + z1) / 2,
        rx: HP,
        sx: R,
        sy: L,
        sz: R,
        uv: "keep",
        grime: 0.1,
        tint: 0x8a8474,
      });
      const nose = new THREE.LatheGeometry(
        Array.from({ length: 12 }, (_, i) => {
          const t = i / 11;
          return new THREE.Vector2(
            Math.max(0.001, R * Math.sqrt(1 - t * t) * (1 - t * 0.15)),
            t * 1.6,
          );
        }),
        18,
      );
      b.geo("paint_cream", nose, { x: 0, y: cy, z: z0, rx: -HP, grime: 0.3 });
      const tail = new THREE.LatheGeometry(
        [
          new THREE.Vector2(R, 0),
          new THREE.Vector2(R * 0.8, 0.5),
          new THREE.Vector2(R * 0.42, 1.3),
          new THREE.Vector2(R * 0.38, 1.45),
          new THREE.Vector2(0.001, 1.46),
        ],
        18,
      );
      b.geo("paint_cream", tail, { x: 0, y: cy, z: z1, rx: HP, grime: 0.35 });
      nose.dispose();
      tail.dispose();
      for (let k = 0; k < 4; k++) {
        const a = k * HP + PI / 4;
        b.box(
          "paint_cream",
          Math.cos(a) * 0.62,
          cy + Math.sin(a) * 0.62 - 0.03,
          z1 + 1.0,
          0.04,
          0.06,
          0.9,
          { grime: 0.4 },
        );
        b.geo("paint_cream", K.T.box, {
          x: Math.cos(a) * 0.62,
          y: cy + Math.sin(a) * 0.62,
          z: z1 + 1.05,
          rz: a,
          sx: 0.85,
          sy: 0.04,
          sz: 0.95,
          grime: 0.4,
        });
      }
      b.geo("iron", K.T.torus, {
        x: 0,
        y: cy,
        z: z1 + 1.55,
        s: 0.5,
        grime: 0.3,
      }); // tail ring
      for (const zl of [z0 + 1.0, z1 - 1.0]) {
        b.geo("iron", K.T.cyl16, {
          x: 0,
          y: cy,
          z: zl,
          rx: HP,
          sx: R + 0.03,
          sy: 0.12,
          sz: R + 0.03,
        });
        b.box("iron", 0, cy + R, zl, 0.14, 0.18, 0.12);
      }
      // the straps
      for (const zl of [z0 + 1.5, z1 - 1.6])
        for (let i = 0; i < 10; i++) {
          const a0 = PI + (i / 10) * PI,
            a1 = PI + ((i + 1) / 10) * PI;
          b.beam(
            "cloth_ivory",
            Math.cos(a0) * (R + 0.02),
            cy - Math.sin(a0) * (R + 0.02),
            zl,
            Math.cos(a1) * (R + 0.02),
            cy - Math.sin(a1) * (R + 0.02),
            zl,
            0.06,
            { d: 0.02, grime: 0.6 },
          );
        }
      // garlands of candles along the deck edges + wax down the stake pockets
      for (const s of [-1.25, 1.25])
        for (const p of K.candleRow(
          b,
          glows,
          s,
          deck,
          bz - 5.8,
          s,
          bz + 5.8,
          0.28,
          r,
          { gaps: 0.3 },
        ))
          flames.push(p);
      // the leak: a faint cold light at the tail seam
      glows.add(0, cy - 0.2, z1 + 0.25, 0xbcd0ff, 0.5, 0.3);
      // two caged work lamps clamped to the deck stakes, aimed at the casing (run off the firing set's supply)
      for (const [lx, lz] of [
        [-1.42, bz - 3.6],
        [1.42, bz + 3.0],
      ]) {
        b.beam("iron", lx, deck, lz, lx, deck + 2.1, lz, 0.05);
        b.box("iron", lx, deck + 2.1, lz, 0.32, 0.26, 0.32, { grime: 0.4 });
        b.box("lit", lx, deck + 2.05, lz, 0.22, 0.04, 0.22, {
          tint: 0xfff0d0,
          grime: 0,
        });
        glows.add(lx, deck + 2.02, lz, 0xfff2d8, 0.6, 0.04);
        b.light(lx, deck + 1.9, lz, 7, 0xfff0d8, 0.55);
      }
      b.light(-2.6, 2.4, bz, 7.5, 0xffc080, 0.7);
      K.sun.bombTail = K.w2(0, cy, z1);
      anchor("bomb", -2.2, 0, 0, HP);
      anchor("bomb_centre", 0, cy, 0, 0);
      // ending B: the concrete form that walls the Second Sun in (hidden until then)
      const bw = K.builder("m42_wall", { ambient: 0.14, grime: 0.5 });
      bw.boxMM("concrete_panel", -2.3, 0, bz - 7.0, 2.3, 3.6, bz + 7.0, {
        grime: 0.5,
        seg: 1.2,
      });
      for (let z = bz - 6.6; z < bz + 7; z += 1.2)
        bw.box("wood_light", 2.32, 0.1, z, 0.06, 3.4, 0.2, { grime: 0.4 });
      for (let z = bz - 6.6; z < bz + 7; z += 1.2)
        bw.box("wood_light", -2.32, 0.1, z, 0.06, 3.4, 0.2, { grime: 0.4 });
      bw.light(-5, 3, 0, 9, 0xffb060, 0.9);
      bw.light(5, 3, 0, 9, 0xffb060, 0.7);
      const gw = bw.finish(root);
      gw.visible = false;
      K.sun.wall = gw;
    }
    // ===============================================================
    // THE CARD TABLE (firing set + the gilt mask), THE BRASS PLATE
    // ===============================================================
    {
      const { x: tx, z: tz } = D.TABLE;
      b.box("paint_green", tx, 0.72, tz, 1.0, 0.04, 1.0, { grime: 0.4 });
      for (const [dx, dz] of [
        [-0.45, -0.45],
        [0.45, -0.45],
        [-0.45, 0.45],
        [0.45, 0.45],
      ])
        b.beam(
          "steel",
          tx + dx,
          0,
          tz + dz,
          tx + dx * 0.9,
          0.72,
          tz + dz * 0.9,
          0.025,
          { round: 6, tint: 0x8a8a84 },
        );
      // the firing set: a grey steel box with dials and toggles
      b.box("paint_grey", tx + 0.12, 0.76, tz - 0.12, 0.55, 0.32, 0.38, {
        grime: 0.4,
      });
      for (let k = 0; k < 3; k++) {
        b.cyl(
          "paint_black",
          tx + 0.4,
          0.95,
          tz - 0.25 + k * 0.13,
          0.04,
          0.04,
          0.02,
          10,
        );
      }
      for (let k = 0; k < 4; k++)
        b.box(
          "steel",
          tx - 0.1,
          1.08,
          tz - 0.25 + k * 0.08,
          0.02,
          0.05,
          0.015,
          { tint: 0x9a9a9a },
        );
      // the gilt sun mask, face up
      b.floorDecal("mask", tx - 0.22, 0.745, tz + 0.25, 0.32, 0.32, 0.4);
      b.cyl("gold", tx - 0.22, 0.742, tz + 0.25, 0.1, 0.1, 0.004, 14);
      colR(tx, tz, 1.0, 1.0, 0, 0.78, 0, { surface: "metal" });
      // the firing-set lamp (dynamic: amber armed → dark)
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xffa020, toneMapped: false }),
      );
      lamp.position.set(tx + 0.4, 1.0, tz + 0.06);
      root.add(lamp);
      K.sun.lamp = lamp;
      K.sun.lampGlow = { x: tx + 0.4, y: 1.0, z: tz + 0.06 };
      b.light(tx + 0.4, 1.4, tz, 2.6, 0xffa020, 0.7);
      // cables: firing set → bomb tail
      b.cable(
        "rubber",
        tx + 0.4,
        0.8,
        tz - 0.2,
        -0.6,
        2.0,
        D.BOMB.z + 2.2,
        0.5,
        0.035,
        10,
      );
      b.cable(
        "rubber",
        tx + 0.35,
        0.8,
        tz - 0.25,
        -0.5,
        1.9,
        D.BOMB.z + 1.6,
        0.6,
        0.03,
        10,
      );
      anchor("firing_set", tx - 1.1, 0, tz, -HP);
      // the brass plate on its pedestal: cipher wheel + keyway A + the freshly drilled keyway
      const { x: px, z: pz } = D.PLATE;
      b.box("iron", px, 0, pz, 0.35, 1.0, 0.35, { grime: 0.5 });
      b.box("brass", px - 0.05, 1.0, pz, 0.08, 0.5, 0.7, {
        grime: 0.15,
        yaw: 0,
      });
      b.geo("brass", K.T.cyl16, {
        x: px - 0.12,
        y: 1.25,
        z: pz,
        rz: HP,
        sx: 0.17,
        sy: 0.04,
        sz: 0.17,
        grime: 0.1,
      });
      for (let k = 0; k < 26; k++) {
        const a = (k / 26) * K.TAU;
        b.box(
          "paint_black",
          px - 0.145,
          1.25 + Math.sin(a) * 0.14,
          pz + Math.cos(a) * 0.14,
          0.01,
          0.018,
          0.012,
        );
      }
      b.cyl("paint_black", px - 0.1, 1.08, pz - 0.24, 0.025, 0.025, 0.01, 10); // keyway A (neat)
      b.geo("paint_black", K.T.cyl8, {
        x: px - 0.1,
        y: 1.08,
        z: pz + 0.24,
        rz: HP,
        sx: 0.03,
        sy: 0.02,
        sz: 0.03,
      }); // keyway B / drilled
      for (let i = 0; i < 14; i++)
        b.box(
          "brass",
          px - 0.3 + r() * 0.3,
          0.004,
          pz + 0.1 + r() * 0.4,
          0.025,
          0.004,
          0.01,
          { yaw: r() * 6, grime: 0 },
        );
      b.cable(
        "rubber",
        px,
        0.6,
        pz + 0.15,
        tx + 0.1,
        0.78,
        tz - 0.3,
        0.3,
        0.025,
        8,
      );
      colR(px, pz, 0.45, 0.8, 0, 1.4);
      anchor("plate", px - 1.0, 0, pz, -HP);
      // the battery ('Big Buzz No. 2') — present when the cult took it (dynamic visibility)
      const bb = K.builder("m42_batt", { ambient: 0.14 });
      const { x: bx, z: bz2 } = D.BATTERY;
      bb.box("paint_yellow", bx, 0, bz2, 0.9, 0.8, 0.6, { grime: 0.5 });
      bb.box("paint_black", bx, 0.8, bz2, 0.92, 0.06, 0.62);
      for (const s of [-0.25, 0.25])
        bb.cyl(
          s < 0 ? "paint_red" : "paint_black",
          bx + s,
          0.86,
          bz2,
          0.05,
          0.05,
          0.08,
          10,
        );
      bb.panel("decal", bx, 0.5, bz2 - 0.31, 0.8, 0.12, PI, {
        rect: K.decal("bigbuzz"),
      });
      bb.cable(
        "rubber",
        bx - 0.25,
        0.92,
        bz2,
        tx - 0.1,
        0.78,
        tz - 0.3,
        0.3,
        0.035,
        8,
      );
      bb.light(bx, 1.4, bz2 + 0.8, 3.5, 0xffc080, 0.8);
      K.sun.battery = bb.finish(root);
      K.sun.batteryCol = null;
      // the converter tap — a thick cable from the converter at a = 160 to the firing set (when there is no battery)
      const tb = K.builder("m42_tap", { ambient: 0.14 });
      const cv = D.CONVERTERS.find((q) => q.a === 160);
      tb.cable(
        "rubber",
        cv.x + 1.2,
        1.0,
        cv.z + 0.6,
        -6,
        0.1,
        cv.z + 1.0,
        0.2,
        0.07,
        8,
      );
      tb.cable(
        "rubber",
        -6,
        0.1,
        cv.z + 1.0,
        tx - 0.3,
        0.78,
        tz - 0.3,
        0.35,
        0.07,
        10,
      );
      tb.box("paint_grey", cv.x + 1.4, 0.6, cv.z + 0.6, 0.5, 0.6, 0.4, {
        grime: 0.5,
      });
      K.sun.tap = tb.finish(root);
    }
    // ===============================================================
    // THE CRADLE, Nicole's chair, the tin cup; the record player; the dosimeter
    // ===============================================================
    {
      const { x: cx, z: cz } = D.CRADLE;
      // cradle on rockers (kept twenty-one years)
      b.box("wood_light", cx, 0.28, cz, 0.55, 0.06, 1.0, { grime: 0.3 });
      for (const s of [-1, 1]) {
        b.box("wood_light", cx + s * 0.26, 0.28, cz, 0.04, 0.38, 1.0, {
          grime: 0.3,
        });
      }
      for (const s of [-1, 1])
        b.box("wood_light", cx, 0.28, cz + s * 0.48, 0.55, 0.5, 0.04, {
          grime: 0.3,
        });
      for (const s of [-0.4, 0.4]) {
        const rock = new THREE.TorusGeometry(0.62, 0.025, 6, 20, 0.9);
        b.geo("wood_light", rock, {
          x: cx + s * 0.6,
          y: 0.66,
          z: cz,
          ry: HP,
          rz: PI + (PI - 0.9) / 2,
          grime: 0.3,
        });
        rock.dispose();
      }
      for (let k = 0; k < 7; k++)
        b.beam(
          "wood_light",
          cx - 0.26,
          0.34,
          cz - 0.42 + k * 0.14,
          cx - 0.26,
          0.66,
          cz - 0.42 + k * 0.14,
          0.018,
          { round: 6 },
        );
      // the knitted blanket draped over the side
      b.quad(
        "knit",
        [cx - 0.24, 0.62, cz + 0.42],
        [cx + 0.24, 0.62, cz + 0.42],
        [cx + 0.24, 0.6, cz - 0.42],
        [cx - 0.24, 0.6, cz - 0.42],
        { double: true, grime: 0.1 },
      );
      b.quad(
        "knit",
        [cx + 0.26, 0.15, cz + 0.4],
        [cx + 0.26, 0.15, cz - 0.4],
        [cx + 0.26, 0.62, cz - 0.42],
        [cx + 0.26, 0.62, cz + 0.42],
        { double: true, grime: 0.1 },
      );
      // the tin cup on the floor beside it
      b.cyl("steel", cx + 0.55, 0, cz - 0.35, 0.045, 0.042, 0.09, 10, {
        tint: 0x9a9a94,
        grime: 0.4,
      });
      b.geo("steel", K.T.torus, {
        x: cx + 0.6,
        y: 0.05,
        z: cz - 0.35,
        s: 0.03,
        ry: HP,
        tint: 0x9a9a94,
      });
      // the candle she lights by the cradle + a cluster
      for (let k = 0; k < 8; k++) {
        const x = cx + 0.7 + r() * 0.4,
          z = cz + 0.2 + r() * 0.6;
        flames.push([
          x,
          K.candle(b, glows, x, 0, z, 0.08 + r() * 0.25, 0.035),
          z,
        ]);
      }
      b.light(cx + 0.4, 1.0, cz, 3.6, 0xffb060, 1.1);
      colR(cx, cz, 0.7, 1.1, 0, 0.7, 0, { surface: "wood" });
      // Nicole's chair (ladder-back), facing the cradle
      const { x: hx, z: hz } = D.CHAIR;
      b.box("wood_dark", hx, 0.45, hz, 0.45, 0.04, 0.45);
      for (const [dx, dz] of [
        [-0.2, -0.2],
        [0.2, -0.2],
        [-0.2, 0.2],
        [0.2, 0.2],
      ])
        b.box("wood_dark", hx + dx, 0, hz + dz, 0.04, 0.45, 0.04);
      for (const dz of [-0.2, 0.2])
        b.box("wood_dark", hx - 0.21, 0.45, hz + dz, 0.04, 0.6, 0.04);
      for (let k = 0; k < 3; k++)
        b.box("wood_dark", hx - 0.21, 0.6 + k * 0.15, hz, 0.03, 0.05, 0.42);
      colR(hx, hz, 0.5, 0.5, 0, 0.5, 0, { surface: "wood" });
      anchor("cradle", cx - 1.4, 0, cz - 0.4, -HP);
      anchor("nicole", cx - 1.0, 0, cz, -HP); // standing with her back to the door, lighting the candle
      anchor("nicole_chair", hx, 0, hz, -HP);
      anchor("rose_captive", cx + 0.4, 0, cz + 1.4, -HP * 0.5);
      // the record player on a crate
      const { x: rx, z: rz } = D.RECORD;
      b.box("crate", rx, 0, rz, 0.9, 0.7, 0.7, { grime: 0.4 });
      b.box("leather", rx, 0.7, rz, 0.52, 0.12, 0.42, {
        tint: 0x6a2a1e,
        grime: 0.2,
      });
      b.box("leather", rx + 0.24, 0.82, rz, 0.03, 0.4, 0.42, {
        tint: 0x6a2a1e,
        grime: 0.2,
      });
      b.panel("decal", rx + 0.22, 1.02, rz, 0.3, 0.15, -HP, {
        rect: K.decal("record"),
      });
      colR(rx, rz, 0.9, 0.7, 0, 0.9);
      const platter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.012, 24),
        new THREE.MeshStandardMaterial({
          color: 0x0c0c0c,
          roughness: 0.25,
          metalness: 0.2,
        }),
      );
      platter.position.set(rx - 0.04, 0.828, rz);
      root.add(platter);
      const label = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.014, 16),
        new THREE.MeshStandardMaterial({ color: 0xa83a2a, roughness: 0.7 }),
      );
      platter.add(label);
      K.sun.platter = platter;
      K.recordPlayer2 = K.w2(rx, 0.85, rz);
      for (let k = 0; k < 5; k++) {
        const x = rx - 0.35 + r() * 0.7,
          z = rz - 0.6;
        flames.push([
          x,
          K.candle(b, glows, x, 0, z, 0.06 + r() * 0.2, 0.03),
          z,
        ]);
      }
      anchor("record_player2", rx + 1.2, 0, rz, HP);
      // the dosimeter on its stand (needle + click handled at runtime)
      const { x: dx, z: dz } = D.DOSI;
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * K.TAU;
        b.beam(
          "iron",
          dx,
          1.0,
          dz,
          dx + Math.cos(a) * 0.35,
          0,
          dz + Math.sin(a) * 0.35,
          0.025,
          { round: 6 },
        );
      }
      b.box("paint_yellow", dx, 1.0, dz, 0.32, 0.2, 0.18, { grime: 0.4 });
      b.box("glass", dx, 1.08, dz + 0.091, 0.18, 0.09, 0.005, { grime: 0.1 });
      b.cable(
        "rubber",
        dx + 0.12,
        1.05,
        dz,
        dx + 0.5,
        0.9,
        dz - 0.6,
        0.2,
        0.015,
        6,
      );
      b.beam("steel", dx + 0.5, 0.9, dz - 0.6, dx + 0.75, 1.1, dz - 1.0, 0.04, {
        round: 8,
        tint: 0x9a9a9a,
      });
      const needle = new THREE.Mesh(
        new THREE.BoxGeometry(0.005, 0.07, 0.003),
        new THREE.MeshBasicMaterial({ color: 0x1a1a1a }),
      );
      needle.position.set(dx, 1.08, dz + 0.095);
      root.add(needle);
      K.sun.needle = needle;
      anchor("dosimeter", dx - 1.0, 0, dz + 0.6, -HP);
    }
    // ===============================================================
    // THE M42 MAIN BREAKER (north wall)
    // ===============================================================
    {
      const { x: bx, z: bz } = D.BREAKER;
      b.box(
        "slate" in K.MATDEF ? "slate" : "paint_black",
        bx,
        0.6,
        bz,
        2.4,
        2.8,
        0.18,
        { grime: 0.4 },
      );
      b.box("iron", bx, 0.5, bz + 0.05, 2.6, 0.1, 0.25);
      b.box("iron", bx, 3.4, bz + 0.05, 2.6, 0.1, 0.25);
      for (const s of [-0.5, 0, 0.5]) {
        b.box("bronze", bx + s, 1.6, bz + 0.12, 0.1, 0.25, 0.08);
        b.box("bronze", bx + s, 2.5, bz + 0.12, 0.1, 0.25, 0.08);
      }
      b.panel("decal", bx, 3.75, bz + 0.1, 3.0, 0.32, 0, {
        rect: K.decal("breaker"),
      });
      b.panel("decal", bx, 0.85, bz + 0.1, 2.4, 0.25, 0, {
        rect: K.decal("danger"),
      });
      colR(bx, bz + 0.1, 2.6, 0.45, 0, 3.5);
      // the knife-switch lever (dynamic): a bar joining the jaws, pivoting at the bottom jaws
      const lever = new THREE.Group();
      lever.position.set(bx, 1.7, bz + 0.25);
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.06, 0.06),
        new THREE.MeshStandardMaterial({
          color: 0xb08850,
          metalness: 0.7,
          roughness: 0.4,
        }),
      );
      bar.position.set(0, 0.85, 0);
      lever.add(bar);
      for (const s of [-0.5, 0, 0.5]) {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.9, 0.05),
          bar.material,
        );
        blade.position.set(s, 0.42, 0);
        lever.add(blade);
      }
      const grip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.35, 10),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 }),
      );
      grip.rotation.x = HP;
      grip.position.set(0, 0.85, 0.2);
      lever.add(grip);
      root.add(lever);
      K.sun.lever = lever;
      b.light(bx, 3.0, bz + 1.4, 4.0, 0xffc080, 0.6);
      for (let k = 0; k < 10; k++) {
        const x = bx - 1.4 + r() * 2.8,
          z = bz + 0.5 + r() * 0.5;
        flames.push([
          x,
          K.candle(b, glows, x, 0, z, 0.05 + r() * 0.2, 0.03),
          z,
        ]);
      }
      anchor("breaker", bx, 0, bz + 1.4, 0);
    }
    // kneeling cushions in arcs on the west side, facing the flatcar
    const kneel = [];
    for (let ring = 0; ring < 2; ring++)
      for (const deg of [128, 140, 152, 164, 196, 208, 218]) {
        const a = (deg * PI) / 180,
          rr = 6.4 + ring * 2.2,
          x = rr * Math.cos(a),
          z = -rr * Math.sin(a);
        b.box("robe_ochre", x, 0, z, 0.55, 0.1, 0.55, {
          yaw: Math.atan2(-x, -z),
          grime: 0.6,
        });
        kneel.push({ x, z, yaw: Math.atan2(-x, -z) });
      }
    K.SUN.KNEEL = kneel.map((p) => ({
      x: O.x + p.x,
      z: O.z + p.z,
      yaw: p.yaw,
    }));
    // floor candle drifts between the ring and the walls
    for (let i = 0; i < 120; i++) {
      const a = r() * K.TAU,
        rr = 15.6 + r() * 4.5,
        x = rr * Math.cos(a),
        z = -rr * Math.sin(a);
      if (Math.abs(z) < 3.5 && x < -16) continue;
      if (x > 16 && z > 6 && z < 14) continue;
      flames.push([
        x,
        K.candle(b, glows, x, 0, z, 0.05 + r() * 0.35, 0.025 + r() * 0.03),
        z,
      ]);
    }
    for (let i = 0; i < 40; i++)
      b.floorDecal(
        "wax_pool",
        (r() - 0.5) * 40,
        0.006,
        (r() - 0.5) * 48,
        0.6 + r(),
        0.6 + r(),
        r() * 6,
      );
    for (let i = 0; i < 10; i++)
      b.floorDecal(
        "soot",
        (r() - 0.5) * 36,
        0.004,
        (r() - 0.5) * 44,
        2 + r() * 3,
        2 + r() * 3,
        r() * 6,
      );

    // aggregate candle light
    const buckets = new Map();
    for (const f of flames) {
      const k =
        Math.round(f[0] / 2.5) +
        "," +
        Math.round(f[1] / 2) +
        "," +
        Math.round(f[2] / 2.5);
      const a = buckets.get(k);
      if (a) {
        a[0] += f[0];
        a[1] += f[1];
        a[2] += f[2];
        a[3]++;
      } else buckets.set(k, [f[0], f[1], f[2], 1]);
    }
    for (const a of buckets.values()) {
      const n = a[3];
      b.light(
        a[0] / n,
        a[1] / n + 0.3,
        a[2] / n,
        2.4 + Math.min(3.6, n * 0.3),
        0xffa850,
        Math.min(1.25, 0.35 + n * 0.07),
      );
    }
    // big soft fills: the vault catches the candlelight; the sun glows faintly gold
    for (const [x, z] of [
      [-12, -14],
      [12, -14],
      [-12, 14],
      [12, 14],
      [0, 0],
      [-16, 0],
      [16, 0],
    ])
      b.light(x, 5, z, 20, 0xff9a50, 0.3);
    b.light(0, YS + RISE - 2, 0, 26, 0xffc070, 0.55);
    for (const z of [-16, 16]) b.light(0, YS + RISE - 3, z, 18, 0xffb060, 0.5);

    K.m42stats = {
      tris: b.tris(),
      flames: flames.length,
      lights: b.lights.length,
    };
    b.finish(root, { receive: true });
    glows.finish(root);
    // the firing-set lamp glow (separate so it can go dark)
    const lg = K.glowSet();
    lg.add(
      K.sun.lampGlow.x,
      K.sun.lampGlow.y,
      K.sun.lampGlow.z,
      0xffa020,
      0.35,
      0.15,
    );
    K.sun.lampPts = lg.finish(root);
    root.visible = false;
  });

  /** Ending-state dressing of the Sun Room (called on newGame/load and by the finale). */
  K.sunDress = function () {
    const S = K.sun;
    if (!S || !S.lamp) return;
    const st = K.ms("second_sun"); // 'disarmed' | 'walled' | 'risen'
    const dark = st === "disarmed" || st === "walled" || st === "risen";
    S.lamp.material.color.setHex(dark ? 0x201810 : 0xffa020);
    if (S.lampPts) S.lampPts.visible = !dark;
    if (S.wall) S.wall.visible = st === "walled";
    // the battery is here when the cult took it (Eli defended Rose's roof in mq32), else the converter tap feeds the set
    const batteryHere = !K.ms("rose_captive") && !K.ms("battery_pulled");
    if (S.battery) S.battery.visible = batteryHere;
    if (S.tap) S.tap.visible = !batteryHere;
    if (S.lever) S.lever.rotation.x = K.ms("breaker_tripped") ? -1.2 : 0;
  };
})();
