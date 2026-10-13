// play-inline-217 02 — math
// Lines 18-225 of readable/play-inline-217.pretty.js (statement-aligned).
  const PH = G._pharbor;
  const TAU = Math.PI * 2;
  const SILO = { x: 20, z: 56, r: 10, h: 24 };

  /** Open steel catwalk slab (diamond plate) with collider. */
  function catwalk(b, x0, z0, x1, z1, y) {
    b.boxMM("diamond", x0, y - 0.08, z0, x1, y, z1, { seg: false, grime: 0.5 });
    b.boxMM("rust", x0, y - 0.3, z0, x1, y - 0.08, z0 + 0.12, { seg: false });
    b.boxMM("rust", x0, y - 0.3, z1 - 0.12, x1, y - 0.08, z1, { seg: false });
    PH.colMM(x0, y - 0.25, z0, x1, y, z1, { surface: "metal" });
  }
  /** Heap of sugar: several conveyor drop-points merged into one pile at the angle of repose, slump grooves,
   *  and a low spill apron; displaced polar grid, one merged mesh. */
  function sugarHeap(b, key, x, z, rx, h, rz, seed) {
    const rn = PH.rng("heap" + seed),
      RINGS = 16,
      SEG = 28,
      RMAX = 1.35;
    const peaks = [[0, 0, 1]];
    for (let k = 0; k < 2; k++)
      peaks.push([(rn() - 0.5) * 0.9, (rn() - 0.5) * 0.9, 0.55 + rn() * 0.3]);
    const hAt = (u, v) => {
      let y = 0;
      for (const [px, pz, ph] of peaks) {
        const d = Math.hypot(u - px, v - pz);
        y = Math.max(y, ph * Math.max(0, 1 - d / (0.95 * ph + 0.15)));
      }
      const d0 = Math.hypot(u, v);
      const apron = 0.06 * Math.max(0, 1 - Math.abs(d0 - 1.05) / 0.3);
      const a = Math.atan2(v, u),
        groove =
          Math.pow(Math.abs(Math.sin(a * 5 + seed)), 6) *
          0.05 *
          Math.min(1, d0 * 2);
      const n = (PH.U.fbm2(u * 3 + seed, v * 3 - seed) - 0.5) * 0.08;
      const top = y > 0.9 ? (y - 0.9) * -0.6 : 0; // conveyor-drop crater slightly flattens each peak
      return Math.max(0, y + apron - groove + n * Math.min(1, y * 4) + top);
    };
    const pos = [],
      idx = [];
    pos.push(0, hAt(0, 0) * h, 0);
    for (let i = 1; i <= RINGS; i++) {
      const t = (i / RINGS) * RMAX;
      for (let j = 0; j < SEG; j++) {
        const a = (j / SEG) * TAU,
          u = Math.cos(a) * t,
          v = Math.sin(a) * t;
        pos.push(u * rx, i === RINGS ? 0 : hAt(u, v) * h, v * rz);
      }
    }
    for (let j = 0; j < SEG; j++) idx.push(0, 1 + ((j + 1) % SEG), 1 + j);
    for (let i = 1; i < RINGS; i++)
      for (let j = 0; j < SEG; j++) {
        const a = 1 + (i - 1) * SEG + j,
          b2 = 1 + (i - 1) * SEG + ((j + 1) % SEG),
          c = a + SEG,
          d = b2 + SEG;
        idx.push(a, b2, c, b2, d, c);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    b.add(key, g, { m: PH.m4(x, 0.01, z), grime: 0.25 });
    // scattered spill: shovel scoops, a buried shovel & wheelbarrow, footprints of something big
    for (let k = 0; k < 6; k++) {
      const a = rn() * TAU,
        d = 1.1 + rn() * 0.25;
      b.mound(
        key,
        x + Math.cos(a) * rx * d,
        0,
        z + Math.sin(a) * rz * d,
        0.5 + rn() * 0.7,
        0.12 + rn() * 0.15,
        0.5 + rn() * 0.6,
        { seed: seed + k, ws: 10, hs: 4 },
      );
    }
    b.box("wood", x + rx * 0.7, 0.2, z - rz * 0.4, 0.05, 1.3, 0.05, {
      rz: 0.6,
      rx: 0.2,
      seg: false,
    });
  }
  /** Vacuum pan: copper vessel on a brick plinth with sight glasses, vapour pipe, valve wheels. */
  function vacuumPan(b, x, z, top) {
    b.cyl("brick_dark", x, 0, z, 3.6, 3.8, 1.5, 16, { hSeg: 1 });
    b.cyl("copper", x, 1.5, z, 3.2, 3.2, 8.5, 20, { hSeg: 4, grime: 0.35 });
    b.lathe(
      "copper",
      [
        [3.2, 0],
        [3.0, 0.9],
        [2.2, 1.9],
        [1.0, 2.5],
        [0.6, 2.6],
      ],
      20,
      x,
      10,
      z,
      {},
    );
    for (let k = 0; k < 5; k++)
      b.cyl("rust", x, 1.8 + k * 2, z, 3.28, 3.28, 0.2, 20, { hSeg: 1 }); // riveted bands
    b.cyl("rust", x, 12.4, z, 0.6, 0.6, top - 12.4, 10, { hSeg: 3 });
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU;
      b.cyl(
        "glass",
        x + Math.cos(a) * 3.22,
        5,
        z + Math.sin(a) * 3.22,
        0.3,
        0.3,
        0.06,
        10,
        { rz: Math.PI / 2, ry: -a, hSeg: 1 },
      );
    }
    b.cyl("iron", x + 3.4, 3.5, z, 0.45, 0.45, 0.06, 12, {
      rz: Math.PI / 2,
      hSeg: 1,
    });
    PH.col(x, z, 7.2, 7.2, 0, 12.5, 0, { walkable: false });
  }

  /**
   * Industrial steel-sash window glass: a grid of small panes in dark muntins — most grimed to a dull
   * green-grey, some broken out (bright), some painted over during the war (dark), soot and rain streaks.
   * 512×512 atlas = two window variants side by side (u 0..0.5, 0.5..1), each one window tall.
   */
  function sashGlassKey() {
    return PH.texMat(
      "domino_sash",
      PH.canvasTex("ph_domino_sash", 512, 512, (ctx, w, h) => {
        const r = PH.rng("sash");
        ctx.fillStyle = "#2a2620";
        ctx.fillRect(0, 0, w, h);
        const COLS = 5,
          ROWS = 12,
          pw = w / 2 / COLS,
          ph = h / ROWS;
        for (let v = 0; v < 2; v++)
          for (let c = 0; c < COLS; c++)
            for (let q = 0; q < ROWS; q++) {
              const x = (v * w) / 2 + c * pw + 3,
                y = q * ph + 3,
                t = r(),
                low = q / ROWS;
              let col;
              if (t < 0.12)
                col = [226, 230, 206]; // broken out: raw daylight
              else if (t < 0.24)
                col = [46, 56, 50]; // blackout paint
              else {
                const k = 150 + r() * 40 - low * 40;
                col = [k * 0.86, k * 0.92, k * 0.78];
              } // grimy glass
              ctx.fillStyle =
                "rgb(" +
                (col[0] | 0) +
                "," +
                (col[1] | 0) +
                "," +
                (col[2] | 0) +
                ")";
              ctx.fillRect(x, y, pw - 6, ph - 6);
              if (t >= 0.12 && r() < 0.18) {
                ctx.strokeStyle = "rgba(240,240,220,0.7)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x + r() * pw, y);
                ctx.lineTo(x + r() * pw, y + ph - 6);
                ctx.stroke();
              } // crack
            }
        // soot along the muntins and rain streaks from the sills
        for (let k = 0; k < 160; k++) {
          ctx.fillStyle = "rgba(30,26,18," + (0.08 + r() * 0.2) + ")";
          ctx.fillRect(r() * w, r() * h, 1 + r() * 3, 10 + r() * 60);
        }
        const g = ctx.createLinearGradient(0, h * 0.6, 0, h);
        g.addColorStop(0, "rgba(20,18,12,0)");
        g.addColorStop(1, "rgba(20,18,12,0.45)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#1e1a16";
        for (let v = 0; v <= 2; v++) ctx.fillRect((v * w) / 2 - 4, 0, 8, h); // heavy sash frames
      }),
      { emissive: 0.75 },
    );
  }
  /** Arched window pane (w × h, rise) with 0..1 UVs mapped onto one variant of the sash atlas. */
  function sashArch(b, w, h, rise, m, variant) {
    const g = new THREE.ShapeGeometry(PH.archShape(w, h, rise), 6);
    const p = g.attributes.position,
      uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++)
      uv.setXY(
        i,
        (variant ? 0.5 : 0) + ((p.getX(i) + w / 2) / w) * 0.5,
        p.getY(i) / h,
      );
    b.geo(sashGlassKey(), g, m, { grime: 0.1, noAO: true });
  }

