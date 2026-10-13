// play-inline-220 02 — ctx
// Lines 24-227 of readable/play-inline-220.pretty.js (statement-aligned).
  const PH = G._pharbor;
  const TAU = Math.PI * 2;
  const HOLD = 0,
    SEC = 4.5,
    MAIN = 9,
    O1 = 13.5,
    BR = 18;
  const hw = (x0, x1) => Math.min(hwAt(x0), hwAt(x1));
  function hwAt(x) {
    void x;
    return 9;
  }
  /** Deck plating: thin top surface + navy-plate underside (the ceiling of the space below) + collider. */
  function deck(b, key, x0, z0, x1, z1, y) {
    b.boxMM(key, x0, y - 0.06, z0, x1, y, z1, { seg: false, grime: 0.45 });
    b.boxMM("navyplate", x0, y - 0.3, z0, x1, y - 0.06, z1, {
      seg: false,
      grime: 0.5,
    });
    PH.colMM(x0, y - 0.3, z0, x1, y, z1, {
      surface:
        key === "diamond" ? "metal" : key === "wood" ? "wood" : "concrete",
    });
  }

  /** Watertight door frame (rounded-corner opening surround + open leaf) in a transverse bulkhead at x. */
  function wtDoor(b, x, y, z, facing) {
    b.box("navy_dark", x, y, z - 0.55, 0.36, 2.0, 0.12, { seg: false });
    b.box("navy_dark", x, y, z + 0.55, 0.36, 2.0, 0.12, { seg: false });
    b.box("navy_dark", x, y + 1.9, z, 0.36, 0.14, 1.2, { seg: false });
    b.box("navy_dark", x, y, z, 0.36, 0.22, 1.2, { seg: false }); // coaming (a step)
    const [lx, lz] = [x + facing * 0.5, z + 0.95];
    b.box("navy", lx, y + 0.12, lz, 0.9, 1.8, 0.1, {
      ry: facing * 0.35,
      seg: false,
    });
    for (let k = 0; k < 3; k++)
      b.box("rust", lx, y + 0.4 + k * 0.6, lz + 0.07, 0.2, 0.05, 0.05, {
        ry: facing * 0.35,
        seg: false,
      });
  }
  /** Transverse bulkhead (at x) spanning ±halfW, y..y+h, with door openings at z centres. */
  function bulkhead(b, x, y, h, halfW, doorZs, key) {
    PH.wall(
      b,
      key || "navyplate",
      x,
      -halfW,
      x,
      halfW,
      y,
      y + h,
      (doorZs || []).map((z) => ({ c: z + halfW, w: 1.0, h: 1.9 })),
      { t: 0.25 },
    );
    for (const z of doorZs || []) wtDoor(b, x, y, z, 1);
  }
  /** Outboard hull wall (z = side·halfW) between x0..x1 with frames and portholes. */
  function hullSide(b, x0, x1, y, h, side, halfW, ports) {
    const z = side * halfW;
    PH.wall(b, "navyplate", x0, z, x1, z, y, y + h, [], { t: 0.3, ext: 0 });
    for (let x = x0 + 0.6; x < x1; x += 1.2)
      b.box("navy", x, y, z - side * 0.2, 0.14, h, 0.2, {
        seg: false,
        grime: 0.4,
      });
    if (ports)
      for (let x = x0 + 2; x < x1 - 1; x += 3.6) {
        b.cyl("bronze", x, y + 1.9, z - side * 0.16, 0.24, 0.24, 0.06, 12, {
          rx: Math.PI / 2,
          hSeg: 1,
        });
        b.cyl("daylight", x, y + 1.9, z - side * 0.19, 0.18, 0.18, 0.02, 12, {
          rx: Math.PI / 2,
          hSeg: 1,
          noAO: true,
        });
      }
  }
  /** Overhead pipe run along x at height y, z. */
  function pipeRun(b, x0, x1, y, z, r, key) {
    b.rod(key || "iron", PH.v3(x0, y, z), PH.v3(x1, y, z), r || 0.08, 8);
    for (let x = x0 + 1; x < x1; x += 2.5)
      b.box("rust", x, y - 0.02, z, 0.06, 0.25, 0.06, { seg: false });
  }
  /** Three-high pipe-frame rack (Navy canvas bunks). */
  function rack(b, x, y, z, used) {
    const r = PH.rng("rack" + x + z);
    for (const [lx, lz] of [
      [-0.95, -0.4],
      [0.95, -0.4],
      [-0.95, 0.4],
      [0.95, 0.4],
    ])
      b.cyl("chrome", x + lx, y, z + lz, 0.025, 0.025, 2.3, 5, { hSeg: 1 });
    for (const ly of [0.35, 1.05, 1.75]) {
      b.box("iron", x, y + ly - 0.04, z, 1.95, 0.04, 0.84, { seg: false });
      b.box("canvas", x, y + ly, z, 1.85, 0.08, 0.76, {
        seg: false,
        c: 0x9a9480,
      });
      if (used && r() < 0.6)
        b.box(
          "fabric",
          x + (r() - 0.5) * 0.4,
          y + ly + 0.08,
          z,
          1.0,
          0.1,
          0.7,
          {
            ry: (r() - 0.5) * 0.3,
            seg: false,
            c: [0x5a4a3a, 0x3a4a3a, 0x6a2a2a][(r() * 3) | 0],
          },
        );
    }
    PH.col(x, z, 2.0, 0.9, y, y + 2.3, 0, { walkable: false });
  }

  /** Old-world harbor chart with the pirates' grease-pencil annotations. */
  function harborChartTex() {
    return PH.canvasTex("ph_harbor_chart", 512, 288, (ctx, w, h) => {
      ctx.fillStyle = "#d8cfae";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#a8c0b8";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.35);
      ctx.bezierCurveTo(w * 0.3, h * 0.5, w * 0.5, h * 0.2, w, h * 0.45);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();
      ctx.fillStyle = "#c8b890";
      ctx.beginPath();
      ctx.moveTo(w * 0.55, 0);
      ctx.lineTo(w * 0.72, 0);
      ctx.lineTo(w * 0.7, h * 0.5);
      ctx.lineTo(w * 0.6, h * 0.62);
      ctx.closePath();
      ctx.fill(); // Manhattan
      ctx.beginPath();
      ctx.moveTo(w * 0.78, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h * 0.5);
      ctx.lineTo(w * 0.8, h * 0.55);
      ctx.closePath();
      ctx.fill(); // Brooklyn
      for (const [x, y, rr] of [
        [0.32, 0.72, 10],
        [0.24, 0.88, 12],
      ]) {
        ctx.beginPath();
        ctx.arc(w * x, h * y, rr, 0, TAU);
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(40,60,80,0.35)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "#b01a10";
      ctx.lineWidth = 3;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.ellipse(
          w * 0.32,
          h * 0.72,
          18 + k * 5,
          14 + k * 4,
          0.2 * k,
          0,
          TAU,
        );
        ctx.stroke();
      }
      ctx.fillStyle = "#b01a10";
      ctx.font = 'bold 16px "Comic Sans MS", cursive';
      ctx.fillText("ELLIS SKIFFS - DAWN", w * 0.06, h * 0.6);
      ctx.fillText("TOLL", w * 0.58, h * 0.72);
      ctx.fillText("HOME", w * 0.84, h * 0.3);
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 13px Georgia, serif";
      ctx.fillText("UPPER NEW YORK BAY — U.S.C.&G.S. 1958", w * 0.03, h * 0.08);
      ctx.fillText("DO NOT GO NEAR (ROBOTS)", w * 0.08, h * 0.97);
      const r = PH.rng("chart");
      for (let i = 0; i < 18; i++) {
        ctx.fillStyle = "rgba(90,60,30," + (0.05 + r() * 0.15) + ")";
        ctx.beginPath();
        ctx.arc(r() * w, r() * h, 6 + r() * 30, 0, TAU);
        ctx.fill();
      }
    });
  }

