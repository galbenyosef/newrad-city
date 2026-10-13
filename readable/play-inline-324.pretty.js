/* src/poi_chelsea/10_highline_ext.js */
/* =====================================================================
 * NEW RAD CITY — POI CHELSEA — 10_highline_ext.js
 * THE HIGH LINE (West Side Improvement, 1934): the elevated freight
 * railway on riveted steel columns running north–south above the West
 * Side between the blocks. Walkable ballast deck with two tracks, Art
 * Deco steel railings, stranded New York Central boxcars, twenty-two
 * years of self-seeded meadow, a raider toll gate, access stairs at both
 * ends, a truss spur into the National Biscuit Company factory and the
 * St. John's Park Freight Terminal headhouse at the south end (doors to
 * the interior at deck level and at street level).
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

  // ---- geometry constants (world) ----
  const HL = (PF.HL = {
    X0: -312,
    X1: -299, // deck edges
    GW: -311.2,
    GE: -299.8, // girder lines (columns)
    DY: 7.5, // walkable deck top
    ZN: -38,
    ZS: 273, // north end / headhouse north wall
    TW: -308.5,
    TE: -302.5, // track centre lines
    HZ0: 273,
    HZ1: 290, // headhouse (freight terminal) footprint
    SPUR_Z0: 236.5,
    SPUR_Z1: 245.5,
    SPUR_X1: -262,
  });
  HL.RAIL = HL.DY + 0.3; // rail top
  const STREETS = [];
  for (let i = 0; i < 31; i++) STREETS.push(-410 + i * 45);
  /** Is z within a street corridor (plus margin)? */
  function inStreet(z, m) {
    for (const s of STREETS) if (Math.abs(z - s) < 7 + (m || 0)) return true;
    return false;
  }
  HL.inStreet = inStreet;

  // -------------------------------------------------------------------
  // Boxcar (New York Central 40-ft steel boxcar), local frame: length along
  // local Z. y = rail top. opts: {mat, tipped, doorOpen, num, reefer, flat}
  // -------------------------------------------------------------------
  function boxcar(b, cx, y, cz, ry, opts) {
    opts = opts || {};
    const r = PF.rng("car" + cx + cz);
    const body = opts.mat || "boxcar";
    const M = PF.m4(cx, y, cz, ry, 0, opts.tipped || 0);
    const add = (key, geo, m, o) =>
      b.add(
        key,
        geo,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.7 },
          o || {},
        ),
      );
    const L = 12.4,
      W = 3.0;
    // trucks (bogies): side frames, bolster, wheels
    for (const tz of [-4.3, 4.3]) {
      for (const sx of [-0.78, 0.78]) {
        add(
          "hl_steel_dk",
          new THREE.BoxGeometry(0.16, 0.42, 2.5),
          PF.m4(sx, 0.45, tz),
        );
        for (const wz of [-0.85, 0.85]) {
          const w = new THREE.CylinderGeometry(0.42, 0.42, 0.14, 12);
          w.rotateZ(HP);
          add("rust", w, PF.m4(sx - Math.sign(sx) * 0.06, 0.42, tz + wz));
        }
      }
      add(
        "hl_steel_dk",
        new THREE.BoxGeometry(2.2, 0.3, 0.5),
        PF.m4(0, 0.7, tz),
      );
    }
    // underframe: centre sill + side sills + coupler boxes
    add("hl_steel_dk", new THREE.BoxGeometry(0.5, 0.4, L), PF.m4(0, 0.95, 0));
    for (const sz of [-1, 1]) {
      add(
        "hl_steel_dk",
        new THREE.BoxGeometry(0.35, 0.35, 0.8),
        PF.m4(0, 0.9, sz * (L / 2 + 0.3)),
      );
      add(
        "rust",
        new THREE.BoxGeometry(0.3, 0.25, 0.4),
        PF.m4(0, 0.9, sz * (L / 2 + 0.75)),
      );
    }
    if (opts.flat) {
      // flatcar: deck + stake pockets
      add("tie_wood", new THREE.BoxGeometry(W, 0.18, L), PF.m4(0, 1.25, 0));
      add(
        body,
        new THREE.BoxGeometry(W + 0.1, 0.35, L + 0.1),
        PF.m4(0, 1.02, 0),
      );
      for (let k = -5; k <= 5; k++)
        for (const sx of [-1, 1])
          add(
            "rust",
            new THREE.BoxGeometry(0.1, 0.25, 0.14),
            PF.m4(sx * (W / 2 + 0.05), 1.1, k * 1.1),
          );
      return;
    }
    const H = 3.3,
      y0 = 1.15;
    add(body, new THREE.BoxGeometry(W, H, L, 1, 2, 4), PF.m4(0, y0 + H / 2, 0));
    // roof (slight crown) + running board
    const roof = new THREE.CylinderGeometry(
      4.5,
      4.5,
      L + 0.1,
      24,
      1,
      false,
      -0.34,
      0.68,
    );
    roof.rotateX(HP);
    roof.rotateZ(HP);
    roof.rotateY(HP);
    add(body, roof, PF.m4(0, y0 + H - 4.5 * Math.cos(0.34) + 0.02, 0, 0, 0, 0));
    add(
      "tie_wood",
      new THREE.BoxGeometry(0.55, 0.06, L),
      PF.m4(0, y0 + H + 0.2, 0),
    );
    // vertical ribs (the pressed-steel side posts) and end ribs
    for (let k = 0; k < 13; k++) {
      const z = -L / 2 + 0.45 + (k * (L - 0.9)) / 12;
      if (Math.abs(z) < 1.9) continue; // door opening
      for (const sx of [-1, 1])
        add(
          body,
          new THREE.BoxGeometry(0.08, H - 0.1, 0.14),
          PF.m4(sx * (W / 2 + 0.03), y0 + H / 2, z),
        );
    }
    for (const sz of [-1, 1])
      for (let k = 0; k < 4; k++)
        add(
          body,
          new THREE.BoxGeometry(W - 0.2, 0.12, 0.08),
          PF.m4(0, y0 + 0.5 + k * 0.85, sz * (L / 2 + 0.03)),
        );
    // sliding doors (one side may be open) + door tracks
    for (const sx of [-1, 1]) {
      const open = opts.doorOpen && sx === opts.doorOpen;
      add(
        "rust",
        new THREE.BoxGeometry(0.06, 0.1, 6),
        PF.m4(sx * (W / 2 + 0.1), y0 + H - 0.15, 0),
      );
      add(
        "rust",
        new THREE.BoxGeometry(0.06, 0.1, 6),
        PF.m4(sx * (W / 2 + 0.1), y0 + 0.1, 0),
      );
      add(
        body,
        new THREE.BoxGeometry(0.09, H - 0.35, 3.0),
        PF.m4(sx * (W / 2 + 0.07), y0 + H / 2 - 0.05, open ? 2.9 : 0),
        { c: 0xd8c8c0 },
      );
      for (let k = 0; k < 3; k++)
        add(
          "rust",
          new THREE.BoxGeometry(0.05, H - 0.4, 0.07),
          PF.m4(sx * (W / 2 + 0.13), y0 + H / 2, (open ? 2.9 : 0) - 1.0 + k),
        );
      if (open)
        add(
          "glass_broken",
          new THREE.PlaneGeometry(2.9, H - 0.3),
          PF.m4(sx * (W / 2 + 0.005), y0 + H / 2, 0, sx * HP),
          { uv: "keep", noAO: true, grime: 0 },
        );
      // herald + reporting marks
      const hk = PF.texMat(
        "herald_" + (opts.num || 1),
        PF.heraldTex(opts.mark || "NYC", opts.num || 174022),
        { transparent: true, noShadow: true },
      );
      add(
        hk,
        new THREE.PlaneGeometry(4.2, 2.1),
        PF.m4(sx * (W / 2 + 0.03), y0 + H * 0.55, sx * 3.9, sx * HP),
        { uv: "keep", grime: 0.1, noAO: true },
      );
      // corner ladders
      for (const sz of [-1, 1]) {
        for (let k = 0; k < 7; k++)
          add(
            "rust",
            new THREE.BoxGeometry(0.05, 0.05, 0.45),
            PF.m4(
              sx * (W / 2 + 0.12),
              y0 + 0.4 + k * 0.42,
              sz * (L / 2 - 0.35),
            ),
          );
      }
    }
    // brake wheel on one end
    const bw = new THREE.TorusGeometry(0.3, 0.03, 4, 12);
    add("rust", bw, PF.m4(0.4, y0 + H - 0.2, L / 2 + 0.2));
    void r;
  }
  PF.boxcar = boxcar;

  // -------------------------------------------------------------------
  // Meadow: grass blades, goldenrod stalks, low shrubs, soil beds
  // -------------------------------------------------------------------
  const bladeGeo = () => new THREE.ConeGeometry(0.035, 1, 3, 1, true);
  function meadow(b, x0, z0, x1, z1, y, density, seed) {
    const r = PF.rng(seed);
    // grass cards (crossed alpha quads) for density, then a few 3D blades & flowers for parallax
    const cards = Math.round((x1 - x0) * (z1 - z0) * density * 0.85);
    for (let i = 0; i < cards; i++) {
      const cx = x0 + r() * (x1 - x0),
        cz = z0 + r() * (z1 - z0);
      const key = PF.grassCardKey(r() < 0.6 ? 0 : r() < 0.6 ? 1 : 2);
      const sw = 0.9 + r() * 0.8,
        sh = 0.45 + r() * 0.55,
        a = r() * PI;
      for (let k = 0; k < 2; k++)
        b.quad(key, cx, y + sh / 2 - 0.03, cz, sw, sh, {
          ry: a + k * HP,
          grime: 0.05,
          noAO: true,
        });
    }
    density *= 0.35;
    const area = (x1 - x0) * (z1 - z0);
    const clumps = Math.round(area * density);
    for (let i = 0; i < clumps; i++) {
      const cx = x0 + r() * (x1 - x0),
        cz = z0 + r() * (z1 - z0);
      const n = 3 + ((r() * 5) | 0),
        h0 = 0.35 + r() * 0.6;
      const key = r() < 0.7 ? "weeds" : "leaf";
      for (let k = 0; k < n; k++) {
        const h = h0 * (0.6 + r() * 0.6);
        const g = bladeGeo();
        g.translate(0, 0.5, 0);
        g.scale(1, h, 1);
        b.add(key, g, {
          m: PF.m4(
            cx + (r() - 0.5) * 0.35,
            y,
            cz + (r() - 0.5) * 0.35,
            r() * TAU,
            (r() - 0.5) * 0.7,
            (r() - 0.5) * 0.7,
          ),
          grime: 0.15,
          noAO: true,
        });
      }
      if (r() < 0.12) {
        // goldenrod / aster flower head on a stalk
        const h = 0.8 + r() * 0.5,
          fx = cx + (r() - 0.5) * 0.2,
          fz = cz + (r() - 0.5) * 0.2;
        b.beam(
          "leaf",
          V3(fx, y, fz),
          V3(fx + (r() - 0.5) * 0.2, y + h, fz + (r() - 0.5) * 0.2),
          0.02,
          0.02,
          { noAO: true, grime: 0 },
        );
        b.sphere(
          r() < 0.6 ? "flower_y" : "flower_w",
          fx,
          y + h + 0.05,
          fz,
          0.08,
          { ws: 4, hs: 2, sy: 1.8, noAO: true, grime: 0.1 },
        );
      }
    }
  }
  function shrub(b, x, y, z, s, seed, key) {
    const r = PF.rng(seed);
    const n = 3 + ((r() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = r() * s * 0.5;
      b.sphere(
        key || (r() < 0.75 ? "leaf" : "leaf_red"),
        x + Math.cos(a) * d,
        y + s * (0.3 + r() * 0.25),
        z + Math.sin(a) * d,
        s * (0.35 + r() * 0.25),
        {
          ws: 7,
          hs: 5,
          sy: 0.7,
          grime: 0.2,
          noAO: true,
          deform: (v) => {
            const k =
              1 + Math.sin(v.x * 9 + seed) * Math.cos(v.z * 7 + v.y * 5) * 0.18;
            v.multiplyScalar(k);
          },
        },
      );
    }
  }
  /** Sumac / ailanthus tree: leaning trunk + clusters of leaf blobs. */
  function tree(b, x, y, z, h, seed) {
    const r = PF.rng(seed);
    const top = V3(x + (r() - 0.5) * 1.2, y + h * 0.7, z + (r() - 0.5) * 1.2);
    b.rod("bark", V3(x, y - 0.2, z), top, 0.12 + h * 0.012, 6, {
      r2: 0.07,
      grime: 0.2,
    });
    for (let i = 0; i < 4; i++) {
      const a = r() * TAU,
        len = h * (0.25 + r() * 0.2);
      const tip = V3(
        top.x + Math.cos(a) * len,
        top.y + len * (0.3 + r() * 0.5),
        top.z + Math.sin(a) * len,
      );
      b.rod("bark", top, tip, 0.06, 4, { r2: 0.03, grime: 0.1 });
      shrub(
        b,
        tip.x,
        tip.y - h * 0.18,
        tip.z,
        h * 0.42,
        seed * 7 + i,
        r() < 0.35 ? "leaf_red" : "leaf",
      );
    }
  }
  PF.hlMeadow = meadow;
  PF.hlShrub = shrub;
  PF.hlTree = tree;

  Object.assign(PF.MAT_DEFS, {
    flower_y: {
      color: 0xc8a030,
      rough: 0.9,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    flower_w: {
      color: 0xd8d0c0,
      rough: 0.9,
      uv: 1,
      plain: true,
      noShadow: true,
    },
  });

  // -------------------------------------------------------------------
  // BUILDER
  // -------------------------------------------------------------------
  PF.addBuilder(
    "high_line",
    function (PF2, site, root) {
      HL.root = root;
      const b = PF.batch("high_line_ext");
      b.ground = 0;
      b.aoH = 4;
      const DY = HL.DY;
      const anchors = {};

      // ---------------- columns ----------------
      // free (non-street) intervals along the deck; columns at their ends and ≤ 10.5 m apart inside
      const colZ = [];
      {
        let z = HL.ZN + 1.5;
        const end = HL.ZS - 1;
        let run = [];
        for (let t = HL.ZN; t <= end; t += 0.5) {
          const free = !inStreet(t, 1.2);
          if (free) run.push(t);
          if ((!free || t >= end) && run.length) {
            const a = run[0] + 0.8,
              c = run[run.length - 1] - 0.8;
            if (c - a > 2) {
              const n = Math.max(1, Math.ceil((c - a) / 10.5));
              for (let k = 0; k <= n; k++) colZ.push(a + ((c - a) * k) / n);
            } else colZ.push((a + c) / 2);
            run = [];
          }
        }
        void z;
      }
      HL.colZ = colZ;
      const GIR_B = DY - 2.45; // girder bottom
      for (const z of colZ) {
        for (const x of [HL.GW, HL.GE]) {
          // concrete footing + riveted base plate
          b.box("concrete", x, -0.2, z, 1.3, 0.55, 1.3, {
            seg: false,
            grime: 0.7,
          });
          b.box("hl_steel_dk", x, 0.35, z, 0.95, 0.12, 0.95, { seg: false });
          // built-up column: core + four angle flanges
          b.box("hl_steel", x, 0.45, z, 0.46, GIR_B - 0.45, 0.46, {
            seg: false,
            grime: 0.55,
          });
          for (const [dx, dz] of [
            [-0.24, -0.24],
            [0.24, -0.24],
            [-0.24, 0.24],
            [0.24, 0.24],
          ])
            b.box("hl_steel", x + dx, 0.45, z + dz, 0.1, GIR_B - 0.45, 0.1, {
              seg: false,
              grime: 0.55,
            });
          // lattice lacing on the column faces
          for (let y = 1.2; y < GIR_B - 0.8; y += 0.9)
            for (const sx of [-1, 1])
              b.beam(
                "hl_steel",
                V3(x + sx * 0.25, y, z - 0.22),
                V3(x + sx * 0.25, y + 0.9, z + 0.22),
                0.05,
                0.02,
                {},
              );
          // knee braces up to the girder
          for (const sz of [-1, 1])
            b.beam(
              "hl_steel",
              V3(x, GIR_B - 1.6, z + sz * 0.25),
              V3(x, GIR_B, z + sz * 1.7),
              0.14,
              0.14,
              {},
            );
          PF.col(x, z, 0.75, 0.75, 0, GIR_B, 0, {
            walkable: false,
            surface: "metal",
          });
        }
        // transverse strut + X-bracing between the column pair
        b.box(
          "hl_steel",
          (HL.GW + HL.GE) / 2,
          GIR_B - 0.55,
          z,
          HL.GE - HL.GW,
          0.45,
          0.3,
          { seg: false },
        );
        b.beam(
          "hl_steel",
          V3(HL.GW + 0.3, GIR_B - 2.6, z),
          V3(HL.GE - 0.3, GIR_B - 0.6, z),
          0.1,
          0.1,
          {},
        );
        b.beam(
          "hl_steel",
          V3(HL.GE - 0.3, GIR_B - 2.6, z),
          V3(HL.GW + 0.3, GIR_B - 0.6, z),
          0.1,
          0.1,
          {},
        );
      }

      // ---------------- girders, deck, fascia ----------------
      const segs = [];
      for (let z = HL.ZN; z < HL.ZS; z += 22)
        segs.push([z, Math.min(HL.ZS, z + 22)]);
      for (const [za, zb] of segs) {
        const len = zb - za,
          zc = (za + zb) / 2;
        for (const x of [HL.GW, HL.GE]) {
          b.box("hl_steel", x, GIR_B, zc, 0.14, 1.95, len, {
            seg: false,
            grime: 0.6,
          }); // web
          b.box("hl_steel", x, GIR_B - 0.05, zc, 0.7, 0.12, len, {
            seg: false,
          }); // bottom flange
          b.box("hl_steel", x, GIR_B + 1.9, zc, 0.7, 0.12, len, { seg: false }); // top flange
          for (let k = 0; k <= len; k += 1.6)
            for (const sx of [-1, 1])
              b.box(
                "hl_steel",
                x + sx * 0.12,
                GIR_B + 0.05,
                za + k,
                0.1,
                1.85,
                0.22,
                { seg: false },
              ); // stiffeners
        }
        // outer fascia plates (the High Line's deep riveted edge beam) with cornice lip
        for (const [x, sx] of [
          [HL.X0, -1],
          [HL.X1, 1],
        ]) {
          b.box("hl_steel", x + sx * 0.05, DY - 1.35, zc, 0.12, 1.2, len, {
            seg: false,
            grime: 0.7,
          });
          b.box("hl_steel_dk", x + sx * 0.12, DY - 0.18, zc, 0.3, 0.2, len, {
            seg: false,
          });
          b.box("hl_steel_dk", x + sx * 0.12, DY - 1.42, zc, 0.26, 0.12, len, {
            seg: false,
          });
        }
        // floor beams + concrete deck + ballast
        for (let k = 0; k < len; k += 2.2)
          b.box(
            "hl_steel_dk",
            (HL.X0 + HL.X1) / 2,
            DY - 1.0,
            za + k + 1.1,
            HL.X1 - HL.X0 - 0.2,
            0.5,
            0.25,
            { seg: false },
          );
        b.boxMM("concrete_dark", HL.X0, DY - 0.55, za, HL.X1, DY - 0.28, zb, {
          segLen: 8,
          grime: 0.8,
        });
        b.boxMM("ballast", HL.X0 + 0.25, DY - 0.28, za, HL.X1 - 0.25, DY, zb, {
          segLen: 8,
          grime: 0.4,
        });
        PF.colMM(HL.X0, DY - 0.6, za, HL.X1, DY, zb, { surface: "rubble" });
      }
      // painted "NEW YORK CENTRAL" lettering on the fascia over every street crossing (both faces)
      const nycKey = PF.ghostKey("nyc_fascia", ["NEW YORK CENTRAL SYSTEM"], {
        w: 1024,
        h: 96,
        bg: "rgba(0,0,0,0)",
        fg: "rgba(230,222,200,0.9)",
      });
      for (const s of STREETS) {
        if (s < HL.ZN + 4 || s > HL.ZS - 4) continue;
        b.quad(nycKey, HL.X1 + 0.12, DY - 0.95, s, 11, 1.0, {
          ry: HP,
          grime: 0.1,
          noAO: true,
        });
        b.quad(nycKey, HL.X0 - 0.12, DY - 0.95, s, 11, 1.0, {
          ry: -HP,
          grime: 0.1,
          noAO: true,
        });
      }
      // north end: bumper post + fence, crossing south: headhouse wall
      b.box(
        "hl_steel_dk",
        (HL.X0 + HL.X1) / 2,
        DY - 1.4,
        HL.ZN - 0.1,
        HL.X1 - HL.X0,
        1.4,
        0.2,
        { seg: false },
      );
      for (const tx of [HL.TW, HL.TE]) {
        b.box("rust", tx, DY, HL.ZN + 1.0, 2.2, 0.9, 0.5, {
          seg: false,
          grime: 0.7,
        });
        b.box("paint_red", tx, DY + 0.9, HL.ZN + 1.0, 2.2, 0.12, 0.5, {
          seg: false,
        });
        PF.col(tx, HL.ZN + 1.0, 2.2, 0.5, DY, DY + 1.0, 0, {
          walkable: false,
          surface: "metal",
        });
      }

      // ---------------- tracks ----------------
      const rT = PF.rng("hl_ties");
      for (const tx of [HL.TW, HL.TE]) {
        for (let z = HL.ZN + 2.5; z < HL.ZS - 0.5; z += 0.62) {
          if (rT() < 0.08) continue; // missing tie
          b.box(
            "tie_wood",
            tx + (rT() - 0.5) * 0.1,
            DY - 0.08,
            z,
            2.5,
            0.2,
            0.22,
            { ry: (rT() - 0.5) * 0.08, seg: false, grime: 0.6 },
          );
        }
        for (const sx of [-0.72, 0.72]) {
          for (let z = HL.ZN + 2.5; z < HL.ZS - 0.5; z += 12) {
            const z2 = Math.min(HL.ZS - 0.5, z + 12);
            if (rT() < 0.06) continue; // pulled rail length (scavenged)
            b.boxMM(
              "rail",
              tx + sx - 0.04,
              DY + 0.1,
              z,
              tx + sx + 0.04,
              DY + 0.28,
              z2 - 0.05,
              { seg: false, grime: 0.3 },
            );
            b.boxMM(
              "rail",
              tx + sx - 0.07,
              DY + 0.1,
              z,
              tx + sx + 0.07,
              DY + 0.14,
              z2 - 0.05,
              { seg: false, grime: 0.3 },
            );
          }
        }
      }

      // ---------------- Art Deco railings (both edges) ----------------
      const gapsE = [
        [-31.2, -27.4],
        [HL.SPUR_Z0, HL.SPUR_Z1],
        [194.0, 197.8],
      ]; // stair landings + spur
      const inGap = (z, gaps) =>
        gaps.some((g) => z > g[0] - 0.05 && z < g[1] + 0.05);
      for (const [x, gaps] of [
        [HL.X0 + 0.15, []],
        [HL.X1 - 0.15, gapsE],
      ]) {
        for (let z = HL.ZN; z < HL.ZS - 0.1; z += 2) {
          const z2 = Math.min(HL.ZS, z + 2);
          if (inGap((z + z2) / 2, gaps)) continue;
          // bent rail: posts, top and bottom rails, sunburst diagonals, centre ring
          b.box("hl_steel_dk", x, DY, z, 0.1, 1.25, 0.1, {
            seg: false,
            grime: 0.3,
          });
          b.box("hl_steel_dk", x, DY + 1.18, (z + z2) / 2, 0.12, 0.08, z2 - z, {
            seg: false,
          });
          b.box("hl_steel_dk", x, DY + 0.18, (z + z2) / 2, 0.08, 0.06, z2 - z, {
            seg: false,
          });
          const zm = (z + z2) / 2;
          b.beam(
            "hl_steel_dk",
            V3(x, DY + 0.2, z + 0.1),
            V3(x, DY + 1.15, zm),
            0.035,
            0.035,
            {},
          );
          b.beam(
            "hl_steel_dk",
            V3(x, DY + 0.2, z2 - 0.1),
            V3(x, DY + 1.15, zm),
            0.035,
            0.035,
            {},
          );
          b.beam(
            "hl_steel_dk",
            V3(x, DY + 0.2, zm),
            V3(x, DY + 1.15, zm),
            0.035,
            0.035,
            {},
          );
          const ring = new THREE.TorusGeometry(0.2, 0.025, 3, 10);
          ring.rotateY(HP);
          b.add("hl_steel_dk", ring, {
            m: PF.m4(x, DY + 0.68, zm),
            grime: 0.3,
          });
        }
        // colliders in long runs between gaps
        let za = HL.ZN;
        const cuts = gaps.slice().sort((p, q) => p[0] - q[0]);
        for (const g of cuts.concat([[HL.ZS, HL.ZS]])) {
          if (g[0] - za > 0.5)
            PF.colMM(x - 0.12, DY - 0.2, za, x + 0.12, DY + 1.4, g[0], {
              walkable: false,
              surface: "metal",
            });
          za = g[1];
        }
      }

      // ---------------- overgrowth: meadow beds, shrubs, trees, vines ----------------
      const rG = PF.rng("hl_green");
      for (let z = HL.ZN + 3; z < HL.ZS - 3; z += 6) {
        // edge planting strips between the rails and the railings, and patches over the tracks
        // grassy soil beds (low mounds textured with dead grass) under the blades: the Line's self-sown meadow
        b.rock("weeds", (HL.X0 + HL.TW - 1.1) / 2, DY - 0.12, z + 3, 1, {
          ry: 0.001,
          sx: 1.25,
          sy: 0.22,
          sz: 3.4,
          rough: 0.35,
          detail: 1,
          seed: z * 3 + 1,
          grime: 0.25,
        });
        b.rock("weeds", (HL.TE + 1.1 + HL.X1) / 2, DY - 0.12, z + 3, 1, {
          ry: 0.001,
          sx: 1.25,
          sy: 0.22,
          sz: 3.4,
          rough: 0.35,
          detail: 1,
          seed: z * 3 + 2,
          grime: 0.25,
        });
        if (rG() < 0.5)
          b.rock("weeds", (HL.TW + HL.TE) / 2, DY - 0.15, z + 3, 1, {
            ry: 0.001,
            sx: 1.6,
            sy: 0.2,
            sz: 2.2 + rG() * 1.6,
            rough: 0.4,
            detail: 1,
            seed: z * 3 + 3,
            grime: 0.3,
          });
        if (rG() < 0.3)
          b.rock("weeds", HL.TW + (rG() - 0.5) * 1.2, DY - 0.12, z + 3, 1, {
            ry: 0.001,
            sx: 1.3,
            sy: 0.24,
            sz: 2.4,
            rough: 0.4,
            detail: 1,
            seed: z * 3 + 4,
            grime: 0.3,
          });
        if (rG() < 0.3)
          b.rock("weeds", HL.TE + (rG() - 0.5) * 1.2, DY - 0.12, z + 3, 1, {
            ry: 0.001,
            sx: 1.3,
            sy: 0.24,
            sz: 2.4,
            rough: 0.4,
            detail: 1,
            seed: z * 3 + 5,
            grime: 0.3,
          });
        meadow(b, HL.X0 + 0.3, z, HL.TW - 1.4, z + 6, DY, 1.0, "m" + z);
        meadow(b, HL.TE + 1.4, z, HL.X1 - 0.3, z + 6, DY, 1.0, "n" + z);
        if (rG() < 0.55)
          meadow(b, HL.TW - 1.5, z, HL.TE + 1.5, z + 6, DY, 0.6, "c" + z);
        if (rG() < 0.35)
          b.rock(
            "nest",
            HL.X0 + 1 + rG() * 11,
            DY - 0.18,
            z + rG() * 6,
            1.3 + rG(),
            { flat: 0.18, rough: 0.3, detail: 1, seed: z },
          );
        if (rG() < 0.7)
          shrub(
            b,
            HL.X0 + 0.9 + rG() * 1.2,
            DY,
            z + rG() * 5,
            0.9 + rG() * 0.9,
            3000 + z,
          );
        if (rG() < 0.7)
          shrub(
            b,
            HL.X1 - 0.9 - rG() * 1.2,
            DY,
            z + rG() * 5,
            0.9 + rG() * 0.9,
            4000 + z,
          );
      }
      for (let i = 0; i < 26; i++) {
        const z = HL.ZN + 6 + i * 11.5 + rG() * 5;
        if (z > HL.ZS - 6) break;
        if (z > 104 && z < 128) continue; // toll gate clearing
        tree(
          b,
          rG() < 0.5 ? HL.X0 + 1.2 : HL.X1 - 1.2,
          DY,
          z,
          3.2 + rG() * 2.8,
          500 + i,
        );
      }
      for (let i = 0; i < 70; i++) {
        // vines trailing over the fascia
        const z = HL.ZN + 2 + rG() * (HL.ZS - HL.ZN - 4);
        const x = rG() < 0.5 ? HL.X0 - 0.18 : HL.X1 + 0.18;
        const L = 0.8 + rG() * 3.2;
        for (let k = 0; k < 3; k++)
          b.beam(
            "leaf",
            V3(x, DY + 0.2, z + k * 0.25),
            V3(
              x + (rG() - 0.5) * 0.2,
              DY - L * (0.6 + rG() * 0.4),
              z + k * 0.25 + (rG() - 0.5) * 0.4,
            ),
            0.06,
            0.03,
            { noAO: true, grime: 0.1 },
          );
      }

      // ---------------- stranded freight cars ----------------
      boxcar(b, HL.TW, HL.RAIL, 64, 0, { num: 174022, doorOpen: 1 });
      boxcar(b, HL.TW, HL.RAIL, 77.4, 0, { num: 174387 });
      boxcar(b, HL.TE, HL.RAIL, 150, 0, { flat: true });
      D_crates(b, HL.TE, HL.RAIL + 1.35, 150);
      boxcar(b, HL.TE - 0.6, HL.RAIL + 0.35, 212, 0.06, {
        num: 170911,
        tipped: 0.22,
        mat: "rust",
      });
      boxcar(b, HL.TW, HL.RAIL, 252, 0, {
        num: 88,
        mark: "NBC",
        mat: "boxcar_yel",
        doorOpen: 1,
      });
      for (const [x, z, w, l] of [
        [HL.TW, 64, 3.1, 12.6],
        [HL.TW, 77.4, 3.1, 12.6],
        [HL.TE, 150, 3.1, 12.6],
        [HL.TE - 0.6, 212, 3.2, 12.6],
        [HL.TW, 252, 3.1, 12.6],
      ]) {
        PF.col(x, z, w, l, DY, z === 150 ? DY + 1.6 : DY + 4.6, 0, {
          surface: "metal",
        });
      }
      // Chocolate Zeppelin reefer car sign
      const reeferKey = PF.ghostKey(
        "reefer_nbc",
        ["Chocolate Zeppelin", "LIGHTER THAN AIR"],
        { w: 1024, h: 256, bg: "rgba(0,0,0,0)", fg: "rgba(84,46,28,0.95)" },
      );
      b.quad(reeferKey, HL.TW + 1.58, HL.RAIL + 3.0, 249.5, 5.2, 1.3, {
        ry: HP,
        grime: 0.2,
        noAO: true,
      });
      b.quad(reeferKey, HL.TW - 1.58, HL.RAIL + 3.0, 254.5, 5.2, 1.3, {
        ry: -HP,
        grime: 0.2,
        noAO: true,
      });

      // ---------------- raider toll gate (z ≈ 116) ----------------
      const TZ = 116;
      PF.scrapWall(b, HL.X0 + 0.3, TZ, -306.4, TZ, 2.9, { y: DY, seed: 71 });
      PF.scrapWall(b, -303.4, TZ, HL.X1 - 0.3, TZ, 2.9, { y: DY, seed: 72 });
      // gate frame with a hanging sign + chained skeleton
      for (const x of [-306.3, -303.5])
        b.box("rust", x, DY, TZ, 0.25, 4.2, 0.25, { seg: false });
      b.box("rust", -304.9, DY + 4.0, TZ, 3.4, 0.25, 0.3, { seg: false });
      const tollKey = PF.texMat(
        "hl_toll",
        PF.signTex(
          "hl_toll",
          ["HIGH LINE TOLL", "20 SCRIP OR WALK DOWN"],
          "raider",
          512,
          192,
        ),
        { rough: 0.9 },
      );
      b.quad(tollKey, -304.9, DY + 3.35, TZ + 0.2, 2.8, 1.05, {
        ry: 0,
        grime: 0.3,
      });
      b.quad(tollKey, -304.9, DY + 3.35, TZ - 0.2, 2.8, 1.05, {
        ry: PI,
        grime: 0.3,
      });
      // watch platform on scaffold
      const WX = -310.2,
        WZ = TZ + 3.2;
      for (const [dx, dz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        b.box("rust", WX + dx * 0.9, DY, WZ + dz * 0.9, 0.12, 3.2, 0.12, {
          seg: false,
        });
      b.box("planks", WX, DY + 3.0, WZ, 2.2, 0.12, 2.2, { seg: false });
      PF.col(WX, WZ, 2.2, 2.2, DY + 2.9, DY + 3.12, 0, { surface: "wood" });
      for (let k = 0; k < 9; k++)
        b.box(
          "rust",
          WX + 1.02,
          DY + 0.3 + k * 0.33,
          WZ - 0.6 + 0 * k,
          0.05,
          0.05,
          0.5,
          { seg: false },
        ); // ladder rungs
      PF.stairs(b, "rust", WX + 1.4, WZ + 1.2, PI, 0.6, 2.4, DY, DY + 3.0, {
        noCollide: false,
        base: DY - 0.05,
      });
      PF.sandbags(b, WX - 1.1, WZ - 1.1, WX + 1.1, WZ - 1.1, 2, {
        y: DY + 3.12,
        noCollide: true,
      });
      // barrels, fire, sandbag nest, mattresses, graffiti
      PF.barrel(b, -306.9, DY, TZ - 1.4, { fire: true });
      PF.barrel(b, -302.6, DY, TZ + 1.5, { fire: true });
      PF.sandbags(b, -307.4, TZ - 3.2, -305.6, TZ - 3.2, 3, { y: DY });
      PF.sandbags(b, -304.0, TZ - 3.2, -302.2, TZ - 3.2, 3, { y: DY });
      PF.dress.mattress(b, -310.8, DY, TZ + 7, 0.2);
      PF.dress.mattress(b, -309.4, DY, TZ + 8.6, -0.1, 0x8a7060);
      PF.dress.crates(b, -300.5, DY, TZ + 6, 2, 11);
      // hanging skeleton on the fascia (warning to toll dodgers)
      {
        const x = HL.X1 + 0.4,
          z = TZ - 6,
          top = DY + 1.2;
        b.beam(
          "rope",
          V3(x - 0.3, top, z),
          V3(x, top - 1.6, z),
          0.03,
          0.03,
          {},
        );
        const M = PF.m4(x, top - 3.4, z, HP);
        const add = (geo, m) =>
          b.add("bone", geo, {
            m: new THREE.Matrix4().multiplyMatrices(M, m),
            grime: 0.3,
          });
        add(new THREE.SphereGeometry(0.11, 7, 5), PF.m4(0, 1.62, 0));
        for (let i = 0; i < 5; i++)
          add(
            new THREE.TorusGeometry(0.13 - i * 0.008, 0.012, 3, 8, PI),
            PF.m4(0, 1.35 - i * 0.07, 0, 0, HP),
          );
        add(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4), PF.m4(0, 1.15, 0));
        add(new THREE.BoxGeometry(0.28, 0.1, 0.14), PF.m4(0, 0.85, 0));
        for (const sx of [-1, 1]) {
          add(
            new THREE.CylinderGeometry(0.022, 0.018, 0.85, 4),
            PF.m4(sx * 0.1, 0.4, 0),
          );
          add(
            new THREE.CylinderGeometry(0.018, 0.015, 0.6, 4),
            PF.m4(sx * 0.22, 1.1, 0, 0, 0, sx * 0.2),
          );
        }
        const dodger = PF.texMat(
          "hl_dodger",
          PF.signTex("hl_dodger", ["DIDNT PAY"], "raider", 256, 96),
          {},
        );
        b.quad(dodger, x + 0.16, top - 2.3, z, 0.8, 0.3, {
          ry: HP,
          grime: 0.3,
        });
      }
      // raider graffiti on the girder web at the gate and on columns
      const graf1 = PF.texMat(
        "hl_graf1",
        PF.graffitiTex("hl_graf1", ["CONDUCTORS"], 512, 160, {
          color: "#d8302a",
          outline: "#1a0e08",
          tag: "skull",
        }),
        { transparent: true, noShadow: true },
      );
      const graf2 = PF.texMat(
        "hl_graf2",
        PF.graffitiTex("hl_graf2", ["ALL ABOARD", "OR ELSE"], 512, 200, {
          color: "#e8d040",
          outline: "#1a0e08",
        }),
        { transparent: true, noShadow: true },
      );
      b.quad(graf1, HL.X1 + 0.2, DY - 1.0, 100, 4, 1.25, {
        ry: HP,
        noAO: true,
        grime: 0,
      });
      b.quad(graf2, HL.X0 - 0.2, DY - 1.0, 128, 4, 1.5, {
        ry: -HP,
        noAO: true,
        grime: 0,
      });
      b.quad(graf1, HL.TW - 1.58 + 0.03, HL.RAIL + 2.3, 80, 3.2, 1.0, {
        ry: -HP,
        noAO: true,
        grime: 0,
      });
      anchors.toll_gate = PF.anchor(-304.9, DY, TZ + 2, 0);
      anchors.sniper = PF.anchor(WX, DY + 3.12, WZ, PI);

      // raider camp near the south end: lean-to under a tarp, cook fire, loot
      {
        const cz = 262;
        for (const [x, z] of [
          [-310.8, cz - 3],
          [-306.8, cz - 3],
          [-310.8, cz + 3],
          [-306.8, cz + 3],
        ])
          b.box("rust", x, DY, z, 0.12, 2.6, 0.12, { seg: false });
        b.box("tent", -308.8, DY + 2.5, cz, 4.4, 0.06, 6.4, {
          rz: 0.08,
          seg: false,
          grime: 0.7,
        });
        PF.dress.mattress(b, -310, DY, cz - 1, 0);
        PF.dress.mattress(b, -307.6, DY, cz + 1.2, 0.1, 0x9a7a60);
        PF.barrel(b, -304.3, DY, cz - 1.6, { fire: true });
        PF.dress.crates(b, -300.6, DY, cz + 4.5, 3, 31);
        anchors.camp = PF.anchor(-306, DY, cz, PI);
      }

      // ---------------- access stairs (north + south) ----------------
      const stair = (zBase, dir, landZ0, landZ1) => {
        const sx = -297.6,
          w = 2.3;
        // steel stair climbing in +Z (dir=1) or -Z (dir=-1)
        const run = 25 * 0.34;
        PF.steelStair(b, sx, zBase, dir > 0 ? 0 : PI, w, run, 0.02, DY, {
          key: "hl_steel",
          tread: "diamond",
          railKey: "hl_steel_dk",
        });
        // support posts under the stringers
        for (let k = 1; k <= 3; k++) {
          const t = k / 4;
          for (const ox of [-w / 2, w / 2])
            b.box(
              "hl_steel",
              sx + ox,
              0,
              zBase + dir * run * t,
              0.14,
              DY * t - 0.1,
              0.14,
              { seg: false },
            );
        }
        // landing to the deck
        b.boxMM("diamond", -299.2, DY - 0.08, landZ0, -296.3, DY, landZ1, {
          seg: false,
        });
        b.boxMM(
          "hl_steel",
          -299.2,
          DY - 0.45,
          landZ0,
          -296.3,
          DY - 0.08,
          landZ1,
          { seg: false },
        );
        PF.colMM(-299.2, DY - 0.5, landZ0, -296.3, DY, landZ1, {
          surface: "metal",
        });
        for (const x of [-296.4])
          PF.rail(b, x, landZ0, x, landZ1, DY, { key: "hl_steel_dk" });
        PF.rail(
          b,
          -296.4,
          dir > 0 ? landZ1 : landZ0,
          -299.2,
          dir > 0 ? landZ1 : landZ0,
          DY,
          { key: "hl_steel_dk" },
        );
        for (const z of [landZ0, landZ1])
          b.box("hl_steel", -296.5, 0, z, 0.16, DY - 0.45, 0.16, {
            seg: false,
          });
        // street-level gate (raider chain across, sign)
        const gz = zBase - dir * 0.6;
        for (const ox of [-1.35, 1.35])
          b.box("rust", sx + ox, 0, gz, 0.14, 2.2, 0.14, { seg: false });
        b.box("rust", sx, 2.1, gz, 2.9, 0.16, 0.16, { seg: false });
        const sk = PF.texMat(
          "hl_stair_sign",
          PF.signTex(
            "hl_stair_sign",
            ["HIGH LINE", "STAIR — TRACK LEVEL"],
            "enamel",
            512,
            192,
            { bg: "#1e3a2a" },
          ),
          {},
        );
        b.quad(sk, sx, 2.65, gz - dir * 0.1, 1.9, 0.72, {
          ry: dir > 0 ? PI : 0,
          grime: 0.3,
        });
        b.box("rust", sx, 2.2, gz, 0.1, 0.1, 0.1, { seg: false });
      };
      // north: base at z = -39.6 climbing south to z = -31.1, landing -31.1 .. -27.6
      stair(-39.6, 1, -31.2, -27.4);
      // south: base at z = 185.6 climbing south to 194.1, landing 194.0 .. 197.8
      stair(185.6, 1, 194.0, 197.8);
      anchors.stair_north = PF.anchor(-297.6, 0, -41, PI);
      anchors.stair_south = PF.anchor(-297.6, 0, 184, PI);
      anchors.deck_north = PF.anchor(-305.5, DY, -30, PI);
      anchors.deck_south = PF.anchor(-305.5, DY, 266, 0);

      // ---------------- spur truss into the Nabisco factory ----------------
      {
        const z0 = HL.SPUR_Z0,
          z1 = HL.SPUR_Z1,
          xa = HL.X1,
          xb = HL.SPUR_X1,
          zc = (z0 + z1) / 2;
        b.boxMM(
          "concrete_dark",
          xa,
          DY - 0.55,
          z0 + 0.4,
          xb,
          DY - 0.28,
          z1 - 0.4,
          { segLen: 8 },
        );
        b.boxMM("ballast", xa, DY - 0.28, z0 + 0.6, xb, DY, z1 - 0.6, {
          segLen: 8,
        });
        PF.colMM(xa - 0.5, DY - 0.6, z0 + 0.4, xb, DY, z1 - 0.4, {
          surface: "rubble",
        });
        // single track curving off the east main track
        for (let x = xa + 0.4; x < xb - 0.3; x += 0.62)
          b.box("tie_wood", x, DY - 0.08, zc, 0.22, 0.2, 2.5, {
            seg: false,
            grime: 0.6,
          });
        for (const sz of [-0.72, 0.72])
          b.boxMM(
            "rail",
            xa - 2,
            DY + 0.1,
            zc + sz - 0.04,
            xb - 0.2,
            DY + 0.28,
            zc + sz + 0.04,
            { seg: false },
          );
        // Warren through-truss: bottom chords, top chords, diagonals, portal bracing
        const TH = 4.6;
        for (const z of [z0 + 0.3, z1 - 0.3]) {
          b.boxMM("hl_steel", xa, DY - 1.4, z - 0.2, xb, DY + 0.35, z + 0.2, {
            segLen: 6,
          });
          b.boxMM(
            "hl_steel",
            xa + 3,
            DY + TH - 0.35,
            z - 0.25,
            xb - 3,
            DY + TH,
            z + 0.25,
            { segLen: 6 },
          );
          const n = 6,
            dx = (xb - xa) / n;
          for (let i = 0; i < n; i++) {
            const x0 = xa + i * dx,
              x1 = x0 + dx;
            const up =
              i === 0 ? V3(x0 + 3, DY + TH - 0.2, z) : V3(x0, DY + TH - 0.2, z);
            b.beam(
              "hl_steel",
              V3(x0, DY + 0.3, z),
              i === 0 ? up : V3(x0, DY + TH - 0.2, z),
              0.28,
              0.32,
              {},
            );
            b.beam(
              "hl_steel",
              V3(i === 0 ? x0 + 3 : x0, DY + TH - 0.2, z),
              V3(x1, DY + 0.3, z),
              0.22,
              0.28,
              {},
            );
            if (i === n - 1)
              b.beam(
                "hl_steel",
                V3(x1, DY + 0.3, z),
                V3(x1 - 3, DY + TH - 0.2, z),
                0.28,
                0.32,
                {},
              );
          }
          PF.colMM(xa, DY, z - 0.25, xb, DY + 1.3, z + 0.25, {
            walkable: false,
            surface: "metal",
          });
        }
        for (let x = xa + 4; x < xb - 3; x += 5.2) {
          b.boxMM(
            "hl_steel",
            x - 0.12,
            DY + TH - 0.3,
            z0 + 0.3,
            x + 0.12,
            DY + TH,
            z1 - 0.3,
            { seg: false },
          );
          b.beam(
            "hl_steel",
            V3(x, DY + TH - 0.3, z0 + 0.4),
            V3(x + 2.6, DY + TH - 0.3, z1 - 0.4),
            0.08,
            0.08,
            {},
          );
        }
        // portal sign over the spur
        const spurKey = PF.texMat(
          "hl_spur",
          PF.signTex(
            "hl_spur",
            ["NATIONAL BISCUIT CO.", "PRIVATE SIDING — CLEARANCE 15 FT"],
            "enamel",
            768,
            160,
            { bg: "#2a2e2a" },
          ),
          {},
        );
        b.quad(spurKey, xa - 3 + 0.2 + 3.5, DY + TH + 0.55, zc, 7.5, 1.55, {
          ry: -HP,
          grime: 0.3,
        });
        // under-bridge girder supports at the building end + the deck side column
        for (const zz of [z0 + 1, z1 - 1]) {
          b.box("hl_steel", xb - 1.6, 0, zz, 0.5, DY - 1.4, 0.5, {
            seg: false,
          });
          PF.col(xb - 1.6, zz, 0.6, 0.6, 0, DY - 1.4, 0, {
            walkable: false,
            surface: "metal",
          });
        }
        anchors.spur = PF.anchor(xb + 3, DY, zc, -HP);
        // the vines love the truss
        for (let i = 0; i < 18; i++) {
          const x = xa + 2 + rG() * (xb - xa - 4),
            z = rG() < 0.5 ? z0 + 0.3 : z1 - 0.3;
          b.beam(
            "leaf",
            V3(x, DY + TH - 0.2, z),
            V3(x + (rG() - 0.5) * 0.4, DY + TH - 1.5 - rG() * 2.5, z),
            0.07,
            0.04,
            { noAO: true, grime: 0.1 },
          );
        }
      }

      // ---------------- headhouse: St. John's Park Freight Terminal ----------------
      const hh = buildHeadhouse(b, anchors);

      // street-level clutter beneath the viaduct (between the columns, off the roads)
      const rS = PF.rng("hl_street");
      for (let i = 0; i < 12; i++) {
        const z = HL.ZN + 6 + rS() * (HL.ZS - HL.ZN - 12);
        if (inStreet(z, 3)) continue;
        const x = -305 + (rS() - 0.5) * 8;
        const k = rS();
        if (k < 0.3) PF.car(b, x, 0, z, (rS() - 0.5) * 0.5, { seed: i + 9 });
        else if (k < 0.6)
          PF.dress.rubble(b, x, 0, z, 0.9 + rS() * 0.8, 6, 100 + i);
        else if (k < 0.8) PF.barrel(b, x, 0, z, {});
        else PF.dress.crates(b, x, 0, z, 1 + ((rS() * 2) | 0), 200 + i);
      }
      PF.skeleton(b, -304.2, 0.02, 30, 0.6);
      PF.skeleton(b, -307.4, DY + 0.02, 172, 2.1);
      // a pair of lovers' skeletons on a bench looking out over the river (the High Line was a view, even then)
      PF.bench(b, HL.X0 + 0.8, DY, 40, HP);
      PF.skeleton(b, HL.X0 + 1.4, DY + 0.02, 41.4, HP + 0.3);

      b.build(root);
      PF.flushGlows(root);
      PF.flushFires();

      // ---------------- doors ----------------
      HL.anchors = anchors;
      HL.hh = hh;
    },
    10,
  );

  /** A few crates on the flatcar. */
  function D_crates(b, x, y, z) {
    const r = PF.rng("flatcrates");
    for (let i = 0; i < 6; i++) {
      const s = 0.9 + r() * 0.4;
      b.box(
        r() < 0.5 ? "crate" : "army",
        x + (r() - 0.5) * 1.6,
        y,
        z - 4.5 + i * 1.6,
        s,
        s * 0.85,
        s,
        { ry: (r() - 0.5) * 0.4, seg: false, grime: 0.5 },
      );
    }
    b.box("tent", x, y + 1.0, z + 2, 2.6, 0.05, 4.2, {
      rz: 0.1,
      rx: 0.05,
      seg: false,
      grime: 0.6,
    });
  }

  /**
   * The freight terminal headhouse the High Line runs into (south end): an Art Deco
   * brick-and-limestone block straddling the tracks with a track portal at deck level and a
   * truck dock at street level (door to the interior on each level).
   */
  function buildHeadhouse(b, anchors) {
    const x0 = -314,
      x1 = -296,
      z0 = HL.HZ0,
      z1 = HL.HZ1,
      top = 17.5,
      DY = HL.DY;
    const xc = (x0 + x1) / 2;
    // shell walls with openings: north face has the track portal; south face has dock doors + personnel door
    const W = PF.wall;
    const T = 0.6;
    // north wall (z0): portal for the two tracks (x -310.5..-300.5 at deck level)
    W(b, "brick_nab", "x", x0, x1, z0, z0 + T, 0, top, [
      { c: -305.5, w: 10.2, y0: DY - 0.6, h: 6.2 },
      { c: -299, w: 1.4, y0: DY + 7.6, h: 1.8 },
      { c: -312, w: 1.4, y0: DY + 7.6, h: 1.8 },
    ]);
    // south wall (z1): two truck doors + personnel door, windows above
    W(b, "brick_nab", "x", x0, x1, z1 - T, z1, 0, top, [
      { c: -310.2, w: 4, y0: 1.2, h: 3.2 },
      { c: -299.8, w: 4, y0: 1.2, h: 3.2 },
      { c: -305, w: 1.6, y0: 1.2, h: 2.5 },
      { c: -310.2, w: 2.2, y0: 6.2, h: 2.6 },
      { c: -305, w: 2.2, y0: 6.2, h: 2.6 },
      { c: -299.8, w: 2.2, y0: 6.2, h: 2.6 },
      { c: -310.2, w: 2.2, y0: 10.6, h: 2.6 },
      { c: -305, w: 2.2, y0: 10.6, h: 2.6 },
      { c: -299.8, w: 2.2, y0: 10.6, h: 2.6 },
    ]);
    W(b, "brick_nab", "z", z0, z1, x0, x0 + T, 0, top, [
      { c: 281.5, w: 2.4, y0: 6.2, h: 2.6 },
      { c: 281.5, w: 2.4, y0: 10.6, h: 2.6 },
      { c: 281.5, w: 2.4, y0: 14.2, h: 2.0 },
    ]);
    W(b, "brick_nab", "z", z0, z1, x1 - T, x1, 0, top, [
      { c: 277.5, w: 2.4, y0: 6.2, h: 2.6 },
      { c: 285.5, w: 2.4, y0: 6.2, h: 2.6 },
      { c: 277.5, w: 2.4, y0: 10.6, h: 2.6 },
      { c: 285.5, w: 2.4, y0: 10.6, h: 2.6 },
      { c: 281.5, w: 2.4, y0: 14.2, h: 2.0 },
    ]);
    // interior blockers (the real interior is in its own cell): dark back planes behind openings
    b.boxMM(
      "concrete_dark",
      x0 + T,
      0,
      z0 + T + 1.5,
      x1 - T,
      top - 0.5,
      z0 + T + 1.7,
      { segLen: 8 },
    );
    b.boxMM(
      "concrete_dark",
      x0 + T,
      0,
      z1 - T - 1.7,
      x1 - T,
      top - 0.5,
      z1 - T - 1.5,
      { segLen: 8 },
    );
    for (const x of [x0 + T + 0.2, x1 - T - 0.4])
      b.boxMM("concrete_dark", x, 0, z0 + T, x + 0.2, top - 0.5, z1 - T, {
        segLen: 8,
      });
    // roof + parapet with stepped Deco crown and coping
    b.boxMM("tar", x0, top - 0.4, z0, x1, top, z1, { segLen: 8 });
    PF.colMM(x0, top - 0.4, z0, x1, top, z1, { surface: "concrete" });
    for (const [a, c, zz] of [
      [x0, x1, z0],
      [x0, x1, z1 - 0.5],
    ])
      b.boxMM("limestone", a, top, zz, c, top + 1.1, zz + 0.5, { seg: false });
    for (const xx of [x0, x1 - 0.5])
      b.boxMM("limestone", xx, top, z0, xx + 0.5, top + 1.1, z1, {
        seg: false,
      });
    b.boxMM(
      "limestone",
      xc - 4,
      top + 1.1,
      z1 - 0.55,
      xc + 4,
      top + 2.4,
      z1 + 0.05,
      { seg: false },
    );
    b.boxMM(
      "limestone",
      xc - 2.2,
      top + 2.4,
      z1 - 0.55,
      xc + 2.2,
      top + 3.4,
      z1 + 0.05,
      { seg: false },
    );
    b.boxMM(
      "limestone",
      xc - 4,
      top + 1.1,
      z0 - 0.05,
      xc + 4,
      top + 2.4,
      z0 + 0.55,
      { seg: false },
    );
    // limestone string courses, base and pilasters (Deco vertical ribs)
    for (const y of [DY - 0.9, DY + 6.1, 13.6]) {
      b.boxMM(
        "limestone",
        x0 - 0.15,
        y,
        z0 - 0.15,
        x1 + 0.15,
        y + 0.4,
        z0 + 0.1,
        { seg: false },
      );
      b.boxMM(
        "limestone",
        x0 - 0.15,
        y,
        z1 - 0.1,
        x1 + 0.15,
        y + 0.4,
        z1 + 0.15,
        { seg: false },
      );
      b.boxMM("limestone", x0 - 0.15, y, z0, x0 + 0.1, y + 0.4, z1, {
        seg: false,
      });
      b.boxMM("limestone", x1 - 0.1, y, z0, x1 + 0.15, y + 0.4, z1, {
        seg: false,
      });
    }
    b.boxMM("granite_dark", x0 - 0.2, 0, z1 - 0.1, x1 + 0.2, 1.0, z1 + 0.25, {
      seg: false,
    });
    for (const x of [x0 + 0.1, -307.6, -302.4, x1 - 0.5])
      b.boxMM("limestone", x, DY + 6.5, z1 - 0.05, x + 0.4, top, z1 + 0.25, {
        seg: false,
      });
    // name band + clock on the south face, railroad name over the north portal
    const nameKey = PF.texMat(
      "hh_name",
      PF.signTex(
        "hh_name",
        ["ST. JOHN'S PARK FREIGHT TERMINAL"],
        "engraved",
        1024,
        96,
      ),
      { rough: 0.9 },
    );
    b.quad(nameKey, xc, 14.6, z1 + 0.27, 16, 1.4, { ry: 0, grime: 0.3 });
    const nycKey = PF.texMat(
      "hh_nyc",
      PF.signTex(
        "hh_nyc",
        ["NEW YORK CENTRAL RAILROAD", "WEST SIDE IMPROVEMENT — 1934"],
        "engraved",
        1024,
        160,
      ),
      { rough: 0.9 },
    );
    b.quad(nycKey, -305.5, DY + 6.95, z0 - 0.17, 12.5, 1.9, {
      ry: PI,
      grime: 0.3,
    });
    // clock (stopped) on the north face above the portal
    {
      const cz = z0 - 0.2,
        cy = 15.0;
      b.cyl("limestone", -305.5, cy - 0.1, cz, 1.35, 1.35, 0.2, 20, {
        rx: HP,
        hSeg: 1,
      });
      const ck = PF.texMat(
        "hh_clock",
        PF.canvasTex(
          "pch_clock",
          256,
          256,
          (ctx, w, h) => {
            ctx.fillStyle = "#d8d0b8";
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, w / 2 - 4, 0, TAU);
            ctx.fill();
            ctx.strokeStyle = "#2a2420";
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.fillStyle = "#2a2420";
            for (let i = 0; i < 12; i++) {
              const a = (i / 12) * TAU;
              ctx.fillRect(
                w / 2 + Math.cos(a) * 100 - 4,
                h / 2 + Math.sin(a) * 100 - 4,
                8,
                8,
              );
            }
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(w / 2, h / 2);
            ctx.lineTo(
              w / 2 + Math.cos(-HP + (9.78 / 12) * TAU) * 60,
              h / 2 + Math.sin(-HP + (9.78 / 12) * TAU) * 60,
            );
            ctx.stroke();
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(w / 2, h / 2);
            ctx.lineTo(
              w / 2 + Math.cos(-HP + (47 / 60) * TAU) * 92,
              h / 2 + Math.sin(-HP + (47 / 60) * TAU) * 92,
            );
            ctx.stroke();
            ctx.fillStyle = "rgba(60,40,20,0.35)";
            ctx.beginPath();
            ctx.arc(w * 0.62, h * 0.4, 50, 0, TAU);
            ctx.fill();
          },
          { clamp: true },
        ),
        { rough: 0.6 },
      );
      b.quad(ck, -305.5, cy, cz - 0.12, 2.3, 2.3, { ry: PI, grime: 0.2 });
    }
    // industrial steel windows (dark panes + mullions) in the openings
    const winPane = (x, y, z, ry, w, h) => {
      b.quad(
        Math.random() < 0.35 ? "glass_broken" : "glass_dark",
        x,
        y + h / 2,
        z,
        w,
        h,
        { ry, noAO: true, grime: 0.1, uv: "box" },
      );
      const c = Math.cos(ry),
        s = Math.sin(ry);
      for (let k = 1; k < 4; k++) {
        const lx = -w / 2 + (k * w) / 4;
        b.box(
          "steel_win",
          x + lx * c + s * 0.03,
          y,
          z - lx * s + c * 0.03,
          0.05,
          h,
          0.05,
          { ry, seg: false },
        );
      }
      for (let k = 1; k < 4; k++)
        b.box(
          "steel_win",
          x + s * 0.03,
          y + (k * h) / 4,
          z + c * 0.03,
          w,
          0.05,
          0.05,
          { ry, seg: false },
        );
    };
    for (const y of [6.2, 10.6])
      for (const x of [-310.2, -305, -299.8])
        winPane(x, y, z1 + 0.02, 0, 2.2, 2.6);
    for (const y of [6.2, 10.6]) winPane(x0 - 0.02, y, 281.5, -HP, 2.4, 2.6);
    for (const y of [6.2, 10.6])
      for (const z of [277.5, 285.5]) winPane(x1 + 0.02, y, z, HP, 2.4, 2.6);
    // track portal: steel roll-up door half open, dark void, bumper lights
    b.boxMM(
      "concrete_dark",
      -310.6,
      DY - 0.6,
      z0 + T,
      -300.4,
      DY + 5.6,
      z0 + T + 0.2,
      { seg: false },
    );
    b.boxMM(
      "corrugated",
      -310.5,
      DY + 2.9,
      z0 + 0.05,
      -300.5,
      DY + 5.6,
      z0 + 0.25,
      { seg: false, grime: 0.8 },
    );
    b.boxMM("rust", -310.8, DY + 5.5, z0 - 0.3, -300.2, DY + 6.0, z0 + 0.3, {
      seg: false,
    });
    b.quad("glass_broken", -305.5, DY + 1.4, z0 + 0.62, 10, 2.8, {
      ry: PI,
      noAO: true,
      grime: 0,
    });
    PF.colMM(-310.6, DY - 0.6, z0 - 0.05, -300.4, DY + 5.6, z0 + T + 0.2, {
      walkable: false,
      surface: "metal",
    });
    // scrap barricade across the portal leaving a man-door gap (raiders' front door)
    PF.scrapWall(b, -310.4, z0 - 0.8, -306.4, z0 - 0.8, 2.4, {
      y: DY,
      seed: 91,
      noSpikes: false,
    });
    PF.scrapWall(b, -304.6, z0 - 0.8, -300.6, z0 - 0.8, 2.4, {
      y: DY,
      seed: 92,
    });
    const keepOut = PF.texMat(
      "hh_keep",
      PF.signTex(
        "hh_keep",
        ["CONDUCTORS ONLY", "TICKETS PLEASE"],
        "raider",
        512,
        192,
        { fg: "#e8d040" },
      ),
      {},
    );
    b.quad(keepOut, -308.4, DY + 1.8, z0 - 0.95, 2.4, 0.9, {
      ry: PI,
      grime: 0.3,
    });
    // street level: truck dock with canopy, roll doors (one jammed half-open), personnel door
    for (const x of [-310.2, -299.8]) {
      b.boxMM(
        "corrugated",
        x - 2,
        x < -305 ? 2.6 : 1.2,
        z1 - 0.2,
        x + 2,
        4.4,
        z1 - 0.05,
        { seg: false, grime: 0.8 },
      );
      b.boxMM("concrete_dark", x - 2, 1.2, z1 - T - 0.1, x + 2, 4.4, z1 - T, {
        seg: false,
      });
      PF.colMM(x - 2, 1.2, z1 - T, x + 2, 4.4, z1 + 0.05, {
        walkable: false,
        surface: "metal",
      });
    }
    b.boxMM("concrete", x0 - 0.2, 0, z1, x1 + 0.2, 1.2, z1 + 2.2, {
      seg: false,
      grime: 0.7,
    });
    PF.colMM(x0 - 0.2, 0, z1, x1 + 0.2, 1.2, z1 + 2.2, { surface: "concrete" });
    // steps up to the dock at the personnel door
    PF.stairs(b, "concrete", -305, z1 + 3.4, PI, 2.2, 1.2, 0, 1.2, {});
    b.boxMM("rust", x0 - 0.3, 4.5, z1, x1 + 0.3, 4.7, z1 + 3.2, { seg: false });
    for (const x of [x0 + 1, xc, x1 - 1])
      b.beam(
        "iron",
        V3(x, 4.6, z1 + 3.1),
        V3(x, 6.4, z1 + 0.1),
        0.05,
        0.05,
        {},
      );
    b.boxMM("panel", -305.8, 1.2, z1 + 0.02, -304.2, 3.6, z1 + 0.14, {
      seg: false,
      grime: 0.8,
    }); // steel door
    const dockKey = PF.texMat(
      "hh_dock",
      PF.signTex("hh_dock", ["RECEIVING — DOCK 3"], "enamel", 512, 96, {
        bg: "#6a2a20",
      }),
      {},
    );
    b.quad(dockKey, -305, 4.0, z1 + 0.16, 2.8, 0.52, { ry: 0, grime: 0.3 });
    PF.lampPost(b, -313, 1.2, z1 + 1.6, false);
    PF.skeleton(b, -301.5, 1.22, z1 + 1.2, 2.4);
    // colliders: shell (outer walls are already solid); the building volume is not walkable inside
    PF.colMM(x0, 0, z0, x1, DY - 0.6, z1, { walkable: false }); // below the portal: solid base
    PF.colMM(x0, DY - 0.6, z0 + T + 1.5, x1, top - 0.4, z1 - T, {
      walkable: false,
    });
    PF.colMM(x0, DY - 0.6, z0 + T, x1, DY, z0 + T + 1.6, {
      surface: "concrete",
    }); // portal floor
    const ext = {
      portal: V3(-305.5, DY, z0 - 0.4),
      dock: V3(-305, 1.2, z1 + 0.6),
    };
    anchors.entrance = PF.anchor(-305.5, DY, z0 - 2.5, 0);
    anchors.street_door = PF.anchor(-305, 1.2, z1 + 1.2, PI);
    return ext;
  }
})();
