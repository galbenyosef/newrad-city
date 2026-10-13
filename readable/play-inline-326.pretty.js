/* src/poi_chelsea/20_nabisco_ext.js */
/* =====================================================================
 * NEW RAD CITY — POI CHELSEA — 20_nabisco_ext.js
 * NATIONAL BISCUIT COMPANY FACTORY (Chelsea, 15th St & Tenth Ave).
 * Red-brown brick factory complex: a six-storey bakery block and an
 * eight-storey tower with a rooftop water tank, piered bays with big
 * Romanesque ground-floor arches, segmental steel-sash windows, round-
 * arched top storey, corbelled brick cornices, a smokestack, the carved
 * NATIONAL BISCUIT COMPANY portal and painted ghost signs, a canopied
 * loading dock with a Chocolate Zeppelin delivery truck, the High Line siding
 * portal on the Tenth Avenue side — and a giant-ant mound bursting out
 * of the sidewalk at the south-east corner.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pch) return;
  const PF = G._pch;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const NB = (PF.NB = {
    X0: -262,
    X1: -218,
    Z0: 227,
    Z1: 258,
    XT: -232, // split between the bakery block (west) and the tower (east)
    HA: 21.5,
    HT: 29, // roof heights
    F: [0, 4.0, 7.5, 11, 14.5, 18, 21.5, 25, 28.5], // floor levels
  });

  /** Semicircular-arch window/door opening: frame of voussoirs + recessed dark pane (+ optional sash). */
  function archBay(b, x, y, z, ry, w, h, opts) {
    opts = opts || {};
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    const springY = h - w / 2;
    // pane: rectangle + half disc
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2, 0);
    sh.lineTo(w / 2, 0);
    sh.lineTo(w / 2, springY);
    sh.absarc(0, springY, w / 2, 0, PI, false);
    sh.lineTo(-w / 2, 0);
    const g = PF.shapeGeo(sh, 10);
    b.add(opts.pane || "glass_dark", g, {
      m: PF.m4(x - s * 0.02, y, z - c * 0.02, ry),
      uv: "box",
      grime: 0.1,
      noAO: true,
    });
    // voussoirs (brick soldier ring) + keystone
    const N = 11,
      R = w / 2 + 0.16;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * PI;
      const p = P(Math.cos(a) * R, springY + Math.sin(a) * R, 0.06);
      b.add(
        opts.ring || "brick_nab_dk",
        new THREE.BoxGeometry(0.3, 0.46, 0.3),
        { m: PF.m4(p.x, p.y, p.z, ry, 0, a - HP), grime: 0.5 },
      );
    }
    if (opts.key) {
      const p = P(0, h + 0.18, 0.1);
      b.add(opts.key, new THREE.BoxGeometry(0.4, 0.6, 0.34), {
        m: PF.m4(p.x, p.y, p.z, ry),
        grime: 0.4,
      });
    }
    // mullions (steel sash) in the rectangle + fan bars in the arch
    if (opts.sash !== false) {
      for (const k of [-1, 0, 1]) {
        const p = P((k * w) / 4, 0, 0.03);
        b.box(
          "steel_win",
          p.x,
          y,
          p.z,
          0.06,
          springY + (w / 2) * Math.sqrt(1 - (k / 2) * (k / 2)),
          0.05,
          { ry, seg: false },
        );
      }
      for (let k = 1; k <= 3; k++) {
        const p = P(0, (springY * k) / 3.2, 0.03);
        b.box("steel_win", p.x, p.y, p.z, w, 0.05, 0.05, { ry, seg: false });
      }
    }
  }
  /** Segmental-arch industrial window: shallow brick arch lintel, stone sill, steel sash grid. */
  function segWindow(b, x, y, z, ry, w, h, pane) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    b.quad(pane, x + s * 0.01, y + h / 2, z + c * 0.01, w, h, {
      ry,
      uv: "box",
      grime: 0.1,
      noAO: true,
    });
    for (let k = 1; k < 4; k++) {
      const lx = -w / 2 + (k * w) / 4;
      b.box(
        "steel_win",
        x + lx * c + s * 0.04,
        y,
        z - lx * s + c * 0.04,
        0.05,
        h,
        0.05,
        { ry, seg: false },
      );
    }
    for (let k = 1; k < 3; k++)
      b.box(
        "steel_win",
        x + s * 0.04,
        y + (k * h) / 3,
        z + c * 0.04,
        w,
        0.05,
        0.05,
        { ry, seg: false },
      );
    // segmental arch lintel (shallow curve of soldier bricks)
    const N = 7,
      R = w * 0.9,
      rise = 0.28;
    for (let i = 0; i <= N; i++) {
      const t = i / N - 0.5,
        lx = t * (w + 0.3),
        ly = h + 0.12 + Math.cos(t * PI) * rise;
      b.box(
        "brick_nab_dk",
        x + lx * c + s * 0.05,
        y + ly - 0.2,
        z - lx * s + c * 0.05,
        (w + 0.3) / N + 0.02,
        0.4,
        0.22,
        { ry, rz: -t * 0.6, seg: false, grime: 0.4 },
      );
    }
    void R;
    b.box(
      "limestone",
      x + s * 0.1,
      y - 0.14,
      z + c * 0.1,
      w + 0.35,
      0.14,
      0.28,
      { ry, seg: false, grime: 0.5 },
    );
  }
  PF.archBay = archBay;
  PF.segWindow = segWindow;

  /** A full piered brick façade along one side. dir: outward normal ry. from a (along) to b. */
  function facade(b, side, a0, a1, fixed, floors, topY, opts) {
    opts = opts || {};
    const ry = { s: 0, n: PI, e: HP, w: -HP }[side];
    const along = side === "s" || side === "n" ? "x" : "z";
    const out = side === "s" || side === "e" ? 1 : -1;
    const bay = opts.bay || 4.3;
    const n = Math.max(1, Math.round((a1 - a0) / bay));
    const bw = (a1 - a0) / n;
    const r = PF.rng("fac" + side + a0 + fixed);
    const at = (t, o) =>
      along === "x" ? [t, fixed + out * o] : [fixed + out * o, t];
    // piers between bays (full height), with stone cappings at each string course
    for (let i = 0; i <= n; i++) {
      const t = a0 + i * bw;
      const [px, pz] = at(t, 0.2);
      b.box(
        "brick_nab",
        px,
        0.8,
        pz,
        along === "x" ? 0.8 : 0.4,
        topY - 0.8,
        along === "x" ? 0.4 : 0.8,
        { seg: false, grime: 0.6 },
      );
    }
    // granite water table
    {
      const [px, pz] = at((a0 + a1) / 2, 0.3);
      b.box(
        "granite_dark",
        px,
        0,
        pz,
        along === "x" ? a1 - a0 + 0.6 : 0.6,
        0.85,
        along === "x" ? 0.6 : a1 - a0 + 0.6,
        { seg: false, grime: 0.6 },
      );
    }
    // string courses
    for (const y of opts.courses || [NB.F[1], NB.F[2]]) {
      const [px, pz] = at((a0 + a1) / 2, 0.42);
      b.box(
        "limestone",
        px,
        y - 0.1,
        pz,
        along === "x" ? a1 - a0 + 0.3 : 0.25,
        0.28,
        along === "x" ? 0.25 : a1 - a0 + 0.3,
        { seg: false, grime: 0.5 },
      );
    }
    for (let i = 0; i < n; i++) {
      const t = a0 + (i + 0.5) * bw;
      // ground floor: big Romanesque arch (door/loading or window)
      const skip = opts.skipGround && opts.skipGround(t);
      if (!skip) {
        const [gx, gz] = at(t, 0.07);
        archBay(
          b,
          gx,
          0.85,
          gz,
          ry,
          Math.min(3.1, bw - 1.1),
          NB.F[1] - 0.85 + 0.9,
          { pane: r() < 0.3 ? "glass_broken" : "glass_dark", key: "limestone" },
        );
      }
      // upper floors: segmental windows, top floor round arches
      for (let f = 1; f < floors; f++) {
        const y = NB.F[f] + (f === 1 ? 1.0 : 0.8);
        if (opts.skipUpper && opts.skipUpper(t, f)) continue;
        const [wx, wz] = at(t, 0.07);
        const roll = r();
        const pane =
          roll < 0.28 ? "glass_broken" : roll < 0.34 ? "planks" : "glass_dark";
        if (f === floors - 1)
          archBay(b, wx, y, wz, ry, Math.min(2.2, bw - 1.2), 2.5, {
            pane,
            ring: "brick_nab_dk",
          });
        else segWindow(b, wx, y, wz, ry, Math.min(2.4, bw - 1.1), 2.1, pane);
      }
    }
    // corbelled brick cornice: three stepped courses + dentils + parapet with stone coping
    for (let k = 0; k < 3; k++) {
      const [px, pz] = at((a0 + a1) / 2, 0.35 + k * 0.18);
      b.box(
        "brick_nab_dk",
        px,
        topY - 1.2 + k * 0.3,
        pz,
        along === "x" ? a1 - a0 + 0.4 + k * 0.3 : 0.3,
        0.3,
        along === "x" ? 0.3 : a1 - a0 + 0.4 + k * 0.3,
        { seg: false, grime: 0.6 },
      );
    }
    for (let t = a0 + 0.3; t < a1; t += 0.7) {
      const [px, pz] = at(t, 0.55);
      b.box("brick_nab_dk", px, topY - 1.55, pz, 0.25, 0.3, 0.25, {
        seg: false,
      });
    }
    {
      const [px, pz] = at((a0 + a1) / 2, 0.2);
      b.box(
        "limestone",
        px,
        topY + 0.9,
        pz,
        along === "x" ? a1 - a0 + 0.5 : 0.7,
        0.18,
        along === "x" ? 0.7 : a1 - a0 + 0.5,
        { seg: false },
      );
    }
  }

  PF.addBuilder(
    "nabisco_factory",
    function (PF2, site, root) {
      const b = PF.batch("nabisco_ext");
      b.ground = 0;
      b.aoH = 5;
      const { X0, X1, Z0, Z1, XT, HA, HT } = NB;
      const anchors = {};
      // ---------------- masses (brick shells + parapets) ----------------
      b.boxMM("brick_nab", X0, 0, Z0, XT, HA + 0.9, Z1, {
        segLen: 5,
        grime: 0.55,
      });
      b.boxMM("brick_nab", XT, 0, Z0, X1, HT + 0.9, Z1, {
        segLen: 5,
        grime: 0.55,
      });
      PF.colMM(X0, 0, Z0, XT, HA + 0.9, Z1, { walkable: true });
      PF.colMM(XT, 0, Z0, X1, HT + 0.9, Z1, { walkable: true });
      // roofs (tar) slightly inside the parapets
      b.boxMM(
        "tar",
        X0 + 0.4,
        HA + 0.9,
        Z0 + 0.4,
        XT - 0.2,
        HA + 1.0,
        Z1 - 0.4,
        { segLen: 8 },
      );
      b.boxMM(
        "tar",
        XT + 0.4,
        HT + 0.9,
        Z0 + 0.4,
        X1 - 0.4,
        HT + 1.0,
        Z1 - 0.4,
        { segLen: 8 },
      );
      // ---------------- façades ----------------
      const floorsA = 6,
        floorsT = 8;
      const entranceX = -240; // south portal (door) on the bakery block
      const dockX0 = -258,
        dockX1 = -244;
      facade(b, "s", X0, XT, Z1, floorsA, HA, {
        skipGround: (t) =>
          Math.abs(t - entranceX) < 3 || (t > dockX0 && t < dockX1),
      });
      facade(b, "s", XT, X1, Z1, floorsT, HT, {
        courses: [NB.F[1], NB.F[2], NB.F[6]],
      });
      facade(b, "n", X0, XT, Z0, floorsA, HA, {});
      facade(b, "n", XT, X1, Z0, floorsT, HT, {
        courses: [NB.F[1], NB.F[2], NB.F[6]],
      });
      facade(b, "w", Z0, Z1, X0, floorsA, HA, {
        skipUpper: (t, f) => t > 234 && t < 248 && (f === 2 || f === 3),
        skipGround: () => false,
      });
      facade(b, "e", Z0, Z1, X1, floorsT, HT, {
        courses: [NB.F[1], NB.F[2], NB.F[6]],
        skipUpper: (t, f) => f >= 3 && f <= 5 && t > 232 && t < 254,
      });
      for (const f of [6, 7])
        for (let z = Z0 + 3; z < Z1 - 2; z += 4.4)
          segWindow(
            b,
            XT - 0.07,
            NB.F[f] + 0.8,
            z,
            -HP,
            2.2,
            2.0,
            (z * 7 + f) % 3 < 1 ? "glass_broken" : "glass_dark",
          );
      for (const [a, c] of [[Z0, Z1]]) {
        b.boxMM("brick_nab_dk", XT - 0.5, HT - 0.3, a, XT, HT + 0.9, c, {
          seg: false,
        });
        b.boxMM("limestone", XT - 0.6, HT + 0.9, a, XT + 0.1, HT + 1.08, c, {
          seg: false,
        });
      }
      // ---------------- south portal: NATIONAL BISCUIT COMPANY ----------------
      {
        const x = entranceX,
          z = Z1;
        b.boxMM("limestone", x - 2.6, 0, z, x + 2.6, 6.2, z + 0.7, {
          seg: false,
          grime: 0.5,
        });
        // arched doorway cut: dark recess + steel doors
        archBay(b, x, 0.02, z + 0.72, 0, 3.0, 4.6, {
          pane: "glass_broken",
          ring: "limestone",
          key: "limestone",
          sash: false,
        });
        b.boxMM("panel", x - 1.45, 0, z + 0.6, x - 0.05, 3.1, z + 0.75, {
          seg: false,
          grime: 0.8,
        });
        b.box("panel", x + 1.0, 0, z + 1.3, 1.4, 3.1, 0.12, {
          ry: -0.9,
          seg: false,
          grime: 0.8,
        }); // one leaf hanging open
        const nk = PF.texMat(
          "nb_portal",
          PF.signTex(
            "nb_portal",
            ["NATIONAL BISCUIT COMPANY"],
            "engraved",
            1024,
            110,
          ),
          { rough: 0.9 },
        );
        b.quad(nk, x, 5.55, z + 0.72, 5.0, 0.54, { ry: 0, grime: 0.3 });
        // the NBC emblem roundel above (the "cross with antennae" seal, stylised)
        const emb = PF.texMat(
          "nb_emblem",
          PF.canvasTex(
            "pch_nbc_emblem",
            256,
            256,
            (ctx, w, h) => {
              ctx.fillStyle = "#c8bca0";
              ctx.fillRect(0, 0, w, h);
              ctx.strokeStyle = "#5a4a38";
              ctx.lineWidth = 10;
              ctx.beginPath();
              ctx.ellipse(w / 2, h / 2, 110, 110, 0, 0, TAU);
              ctx.stroke();
              ctx.lineWidth = 12;
              ctx.beginPath();
              ctx.moveTo(w / 2, 50);
              ctx.lineTo(w / 2, 150);
              ctx.moveTo(w / 2 - 55, 150);
              ctx.lineTo(w / 2 + 55, 150);
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(w / 2, 90, 26, 0, TAU);
              ctx.stroke();
              ctx.fillStyle = "#5a4a38";
              ctx.font = "bold 34px Georgia, serif";
              ctx.textAlign = "center";
              ctx.fillText("N B C", w / 2, 200);
            },
            { clamp: true },
          ),
          { rough: 0.8 },
        );
        b.cyl("limestone", x, 6.2, z + 0.4, 1.0, 1.0, 0.3, 20, {
          rx: HP,
          hSeg: 1,
        });
        b.quad(emb, x, 6.2, z + 0.58, 1.8, 1.8, { ry: 0, grime: 0.3 });
        b.box("limestone", x, 5.9, z + 0.55, 5.6, 0.25, 0.5, { seg: false });
        PF.colMM(x - 2.6, 0, z, x + 2.6, 6.2, z + 0.75, { walkable: false });
        anchors.entrance = PF.anchor(x, 0, z + 2.6, 0);
        NB.door = V3(x, 1.6, z + 0.9);
      }
      // ---------------- loading dock + canopy (south, bakery block) ----------------
      {
        const z = Z1;
        b.boxMM("concrete", dockX0, 0, z, dockX1, 1.2, z + 3.0, {
          seg: false,
          grime: 0.7,
        });
        PF.colMM(dockX0, 0, z, dockX1, 1.2, z + 3.0, { surface: "concrete" });
        for (let x = dockX0 + 0.3; x < dockX1; x += 1.2)
          b.box("tire", x, 0.35, z + 3.05, 0.5, 0.5, 0.18, { seg: false }); // dock bumpers
        // steel canopy on tie rods
        b.boxMM(
          "corrugated",
          dockX0 - 0.5,
          4.3,
          z,
          dockX1 + 0.5,
          4.45,
          z + 4.6,
          { seg: false, rx: -0.05 },
        );
        b.boxMM(
          "steel",
          dockX0 - 0.5,
          4.1,
          z + 4.4,
          dockX1 + 0.5,
          4.35,
          z + 4.7,
          { seg: false },
        );
        for (let x = dockX0; x <= dockX1; x += 3.5)
          b.beam(
            "iron",
            V3(x, 4.4, z + 4.5),
            V3(x, 7.2, z + 0.3),
            0.05,
            0.05,
            {},
          );
        // roll-up doors in the dock bays (overriding the arches visually with steel)
        for (let i = 0; i < 7; i++) {
          const x = X0 + ((i + 0.5) * (XT - X0)) / 7;
          if (x < dockX0 || x > dockX1) continue;
          b.boxMM("corrugated", x - 1.5, 1.2, z + 0.03, x + 1.5, 3.9, z + 0.2, {
            seg: false,
            grime: 0.8,
          });
          b.boxMM("limestone", x - 1.7, 3.9, z + 0.03, x + 1.7, 4.2, z + 0.3, {
            seg: false,
          });
        }
        // Chocolate Zeppelin delivery truck backed up to the dock
        const tx = -251.5,
          tz = z + 8.2;
        const M = PF.m4(tx, 0, tz, 0.04);
        const add = (k, g, m) =>
          b.add(k, g, {
            m: new THREE.Matrix4().multiplyMatrices(M, m),
            grime: 0.6,
          });
        add(
          "paint_cream",
          new THREE.BoxGeometry(2.6, 2.7, 6.0),
          PF.m4(0, 2.45, -1.2),
        );
        add(
          "hl_steel_dk",
          new THREE.BoxGeometry(2.3, 0.4, 8.8),
          PF.m4(0, 0.9, 0),
        );
        add(
          "paint_red",
          new THREE.BoxGeometry(2.3, 1.5, 2.0),
          PF.m4(0, 1.85, 3.0),
        );
        add(
          "paint_red",
          new THREE.BoxGeometry(2.25, 0.9, 1.1),
          PF.m4(0, 1.5, 4.3, 0, -0.25),
        );
        const roof = new THREE.CylinderGeometry(
          1.15,
          1.15,
          2.0,
          12,
          1,
          false,
          0,
          PI,
        );
        roof.rotateX(HP);
        roof.rotateY(HP);
        roof.scale(1, 0.35, 1);
        add("paint_red", roof, PF.m4(0, 2.6, 3.0, HP));
        add(
          "glass_broken",
          new THREE.BoxGeometry(2.0, 0.6, 0.1),
          PF.m4(0, 2.35, 4.02),
        );
        add(
          "chrome",
          new THREE.BoxGeometry(2.4, 0.3, 0.2),
          PF.m4(0, 0.8, 4.35),
        );
        for (const wx of [-1.12, 1.12])
          for (const wz of [-3.2, -2.0, 3.0]) {
            const w = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 10);
            w.rotateZ(HP);
            add("tire", w, PF.m4(wx, 0.5, wz));
          }
        const fl = PF.brandMat("chocolate_zeppelin");
        for (const sx of [-1, 1])
          b.quad(fl, tx + sx * 1.32, 2.5, tz - 1.2, 5.2, 2.2, {
            ry: sx * HP,
            grime: 0.3,
          });
        PF.col(tx, tz, 2.7, 8.9, 0, 3.8, 0.04, { surface: "metal" });
        anchors.dock = PF.anchor(-251.5, 1.2, z + 1.5, 0);
      }
      // ---------------- High Line siding portal (west façade, floor 3) ----------------
      {
        const x = X0,
          zc = PF.HL ? (PF.HL.SPUR_Z0 + PF.HL.SPUR_Z1) / 2 : 241,
          y = 7.5;
        b.boxMM(
          "concrete_dark",
          x - 0.02,
          y - 0.3,
          zc - 3.2,
          x + 0.1,
          y + 5.2,
          zc + 3.2,
          { seg: false },
        );
        b.boxMM(
          "corrugated",
          x - 0.2,
          y + 2.6,
          zc - 3,
          x - 0.05,
          y + 5,
          zc + 3,
          { seg: false, grime: 0.8 },
        );
        b.quad("glass_broken", x - 0.12, y + 1.3, zc, 6, 2.6, {
          ry: -HP,
          noAO: true,
          grime: 0,
        });
        b.boxMM("steel", x - 0.5, y + 5, zc - 3.6, x + 0.2, y + 5.5, zc + 3.6, {
          seg: false,
        });
        for (const dz of [-3.4, 3.4])
          b.boxMM(
            "steel",
            x - 0.5,
            y - 0.3,
            zc + dz - 0.2,
            x + 0.1,
            y + 5.2,
            zc + dz + 0.2,
            { seg: false },
          );
        const fk = PF.texMat(
          "nb_siding",
          PF.signTex(
            "nb_siding",
            ["RECEIVING — FLOOR 3", "NO SMOKING — FLOUR DUST"],
            "enamel",
            512,
            160,
            { bg: "#6a2420" },
          ),
          {},
        );
        b.quad(fk, x - 0.55, y + 6.1, zc, 3.4, 1.06, { ry: -HP, grime: 0.3 });
        // ants got here too: dirt streaks + eggshell litter on the bridge end
        for (let i = 0; i < 8; i++)
          b.rock(
            "nest",
            x - 1 - Math.random() * 3,
            y - 0.1,
            zc + (Math.random() - 0.5) * 4,
            0.3 + Math.random() * 0.4,
            { flat: 0.3, detail: 0, seed: i + 70 },
          );
        NB.sidingDoor = V3(x - 0.6, y + 1.4, zc);
        anchors.siding = PF.anchor(x - 2.5, y, zc, -HP);
      }
      // ---------------- painted ghost signs ----------------
      {
        const big = PF.ghostKey("nbc_big", ["NATIONAL BISCUIT COMPANY"], {
          w: 1024,
          h: 128,
        });
        b.quad(big, (XT + X1) / 2 + 0.2, HT - 3.2, Z0 - 0.08, 13.2, 1.7, {
          ry: PI,
          grime: 0.1,
          noAO: true,
        });
        b.quad(big, X1 + 0.08, NB.F[6] + 3.5, (Z0 + Z1) / 2, 28, 3.4, {
          ry: HP,
          grime: 0.1,
          noAO: true,
        });
        const fl = PF.ghostKey(
          "nbc_zeppelin",
          ["Chocolate Zeppelin", "LIGHTER THAN AIR — BAKED FRESH IN CHELSEA"],
          {
            w: 1024,
            h: 320,
            colors: ["rgba(214,220,228,0.92)", "rgba(236,226,200,0.9)"],
            bg: "rgba(60,34,22,0.6)",
          },
        );
        b.quad(fl, X1 + 0.08, NB.F[3] + 3.0, (Z0 + Z1) / 2 + 1, 20, 6.2, {
          ry: HP,
          grime: 0.1,
          noAO: true,
        });
        const w2 = PF.ghostKey("nbc_west", ["N.B.C.  BAKERY No. 1"], {
          w: 1024,
          h: 128,
        });
        b.quad(w2, X0 - 0.08, HA - 3.2, (Z0 + Z1) / 2, 18, 2.2, {
          ry: -HP,
          grime: 0.1,
          noAO: true,
        });
      }
      // ---------------- rooftop: water tank, smokestack, penthouse, skylights ----------------
      {
        // water tank on the tower (cedar staves on a steel stand)
        const tx = -225,
          tz = 236,
          ty = HT + 1.0;
        for (const [dx, dz] of [
          [-1.6, -1.6],
          [1.6, -1.6],
          [-1.6, 1.6],
          [1.6, 1.6],
        ])
          b.box("hl_steel_dk", tx + dx, ty, tz + dz, 0.22, 4.0, 0.22, {
            seg: false,
          });
        for (const dx of [-1.6, 1.6]) {
          b.beam(
            "hl_steel_dk",
            V3(tx + dx, ty + 0.4, tz - 1.6),
            V3(tx + dx, ty + 3.6, tz + 1.6),
            0.06,
            0.06,
            {},
          );
          b.beam(
            "hl_steel_dk",
            V3(tx - 1.6, ty + 0.4, tz + dx),
            V3(tx + 1.6, ty + 3.6, tz + dx),
            0.06,
            0.06,
            {},
          );
        }
        b.box("planks", tx, ty + 4.0, tz, 4.4, 0.25, 4.4, { seg: false });
        b.cyl("rotten", tx, ty + 4.25, tz, 2.3, 2.3, 4.6, 20, {
          hSeg: 3,
          grime: 0.6,
        });
        for (let k = 0; k < 4; k++)
          b.cyl("iron", tx, ty + 4.6 + k * 1.1, tz, 2.33, 2.33, 0.08, 20, {
            hSeg: 1,
          });
        b.lathe(
          "rotten",
          [
            [2.4, 0],
            [1.4, 0.9],
            [0.2, 1.5],
            [0.05, 1.6],
          ],
          20,
          tx,
          ty + 8.85,
          tz,
          {},
        );
        // smokestack on the bakery block
        const sx = -249,
          sz = 236;
        b.box("brick_nab_dk", sx, HA + 0.9, sz, 3.4, 1.4, 3.4, { seg: false });
        b.cyl("brick_nab", sx, HA + 2.3, sz, 1.05, 1.45, 13, 16, {
          hSeg: 5,
          grime: 0.7,
        });
        for (const y of [HA + 6, HA + 11])
          b.cyl("iron", sx, y, sz, 1.32, 1.32, 0.15, 16, { hSeg: 1 });
        b.cyl("brick_nab_dk", sx, HA + 15.3, sz, 1.25, 1.1, 0.8, 16, {
          hSeg: 1,
        });
        PF.onInitDone.push(() => {
          try {
            if (PF.live("fx") && G.fx.smoke)
              G.fx.smoke(V3(sx, HA + 16.5, sz), 0.8, { dark: true });
          } catch (e) {
            /* optional */
          }
        });
        // stair/elevator penthouse + sawtooth skylights on the bakery roof
        b.boxMM("brick_nab", -236.5, HA + 0.9, 229, -232.3, HA + 4.4, 234, {
          seg: false,
        });
        for (let x = X0 + 3; x < -238; x += 5) {
          const g = new THREE.BoxGeometry(4.4, 0.12, 8);
          g.rotateZ(-0.35);
          b.add("corrugated", g, { m: PF.m4(x + 2, HA + 1.9, 247) });
          b.quad(
            x % 10 ? "glass_broken" : "glass_dark",
            x - 0.2,
            HA + 1.9,
            247,
            8,
            1.6,
            { ry: -HP, noAO: true, grime: 0.1 },
          );
        }
        // rooftop billboard (Chocolate Zeppelin) on the bakery block facing 10th Ave traffic
        PF.billboard(
          b,
          "chocolate_zeppelin",
          -258,
          HA + 1.0,
          250,
          -HP,
          10,
          4.6,
          2.0,
        );
      }
      // ---------------- fire escapes (north façade) ----------------
      for (const x of [-252, -238]) {
        for (let f = 2; f < 6; f++) {
          const y = NB.F[f] + 0.05;
          b.boxMM("steel_win", x - 2, y - 0.05, Z0 - 1.3, x + 2, y + 0.05, Z0, {
            seg: false,
          });
          PF.rail(b, x - 2, Z0 - 1.3, x + 2, Z0 - 1.3, y, {
            key: "steel_win",
            noCollide: true,
            h: 0.95,
          });
          b.beam(
            "steel_win",
            V3(x - 1.6, y, Z0 - 0.8),
            V3(x + 1.6, NB.F[f + 1] || y + 3.5, Z0 - 0.8),
            0.5,
            0.06,
            {},
          );
        }
      }
      // ---------------- ant infestation outside: mound at the SE corner, husks, sugar trail ----------------
      {
        const mx = -222.6,
          mz = 260.2;
        b.rock("nest", mx, -0.7, mz, 2.5, { flat: 0.5, rough: 0.45, seed: 91 });
        b.rock("nest_dk", mx - 1.2, -0.3, mz - 0.6, 1.5, {
          flat: 0.55,
          rough: 0.5,
          seed: 92,
        });
        b.rock("nest", mx + 0.4, -0.2, mz + 1.3, 1.1, { flat: 0.5, seed: 93 });
        // tunnel mouth facing east: dark ring
        b.cyl("nest_dk", mx + 1.9, 0.35, mz + 0.1, 0.9, 1.1, 0.5, 12, {
          rz: 1.0,
          hSeg: 1,
          open: true,
        });
        b.sphere("glass_broken", mx + 1.6, 0.55, mz + 0.1, 0.8, {
          sx: 0.6,
          ws: 10,
          hs: 6,
        });
        // cracked sidewalk slabs heaved up
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * TAU;
          b.box(
            "sidewalk",
            mx + Math.cos(a) * 2.9,
            0.05,
            mz + Math.sin(a) * 2.2,
            1.3,
            0.18,
            1.1,
            { ry: a, rx: 0.3, seg: false, grime: 0.7 },
          );
        }
        // husks of dead ants (bulbous segments) and egg shells
        for (const [x, z, ry] of [
          [-228, 261.5, 0.5],
          [-233.5, 260.4, 2.2],
        ]) {
          const M = PF.m4(x, 0.25, z, ry, 0, 0.3);
          const add = (g, m) =>
            b.add("resin", g, {
              m: new THREE.Matrix4().multiplyMatrices(M, m),
              grime: 0.6,
            });
          add(new THREE.SphereGeometry(0.35, 8, 6), PF.m4(0, 0, -0.5));
          add(new THREE.SphereGeometry(0.28, 8, 6), PF.m4(0, 0.05, 0));
          add(
            new THREE.SphereGeometry(0.5, 8, 6).scale(1, 0.85, 1.3),
            PF.m4(0, 0.1, 0.7),
          );
          for (let k = 0; k < 6; k++)
            add(
              new THREE.CylinderGeometry(0.03, 0.02, 0.9, 4),
              PF.m4(
                k % 2 ? 0.45 : -0.45,
                -0.1,
                -0.3 + (k >> 1) * 0.3,
                0,
                0,
                (k % 2 ? -1 : 1) * 1.1,
              ),
            );
        }
        const rE = PF.rng("nb_eggs");
        for (let i = 0; i < 9; i++)
          b.sphere(
            "ant_egg",
            mx - 2 + rE() * 4,
            0.12,
            mz - 1.5 + rE() * 3,
            0.14,
            {
              sy: 1.4,
              ws: 6,
              hs: 4,
              deform: (v) => {
                if (v.y > 0.05) v.y *= 0.4;
              },
            },
          );
        // warning sign stuck in the dirt
        b.box("rotten", mx - 3.2, 0, mz - 1.2, 0.08, 1.4, 0.08, { seg: false });
        const wk = PF.texMat(
          "nb_warn",
          PF.signTex(
            "nb_warn",
            ["ANTS!!", "BIG ONES. DONT"],
            "raider",
            256,
            128,
            { fg: "#e8d040" },
          ),
          {},
        );
        b.quad(wk, mx - 3.2, 1.35, mz - 1.15, 1.0, 0.5, {
          ry: 0.3,
          grime: 0.3,
        });
        PF.col(mx - 0.3, mz, 4.0, 3.6, 0, 1.2, 0, { surface: "dirt" });
        NB.moundDoor = V3(mx + 2.3, 0.8, mz + 0.1);
        anchors.ant_mound = PF.anchor(mx + 3.8, 0, mz + 0.1, -HP);
        // a sugar trail from the mound to a burst ground-floor arch (ants carrying off the stock)
        for (let i = 0; i < 26; i++) {
          const t = i / 25;
          b.box(
            "flour",
            mx - 2 - t * 10,
            0.01,
            mz - 1.2 + Math.sin(i) * 0.2,
            0.35,
            0.03,
            0.25,
            { ry: rE() * 3, seg: false, noAO: true, grime: 0.3 },
          );
        }
      }
      // sidewalk clutter, sandbag remains, skeleton of a delivery man, cars
      PF.skeleton(b, -236, 0.02, 262, 1.1);
      PF.car(b, -265.5, 0, 232, 0.05, { seed: 51, paint: "paint_teal" });
      PF.barrel(b, -259.6, 1.2, Z1 + 1.5, {});
      PF.dress.crates(b, -245, 1.2, Z1 + 1.5, 2, 52);
      PF.lampPost(b, -262.5, 0, 262, false);

      b.build(root);
      PF.flushGlows(root);
      PF.flushFires();
      NB.anchors = anchors;
    },
    20,
  );
})();
