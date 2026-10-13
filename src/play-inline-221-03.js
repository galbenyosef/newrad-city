// play-inline-221 03 — ctx
// Lines 337-681 of readable/play-inline-221.pretty.js (statement-aligned).
  function drtTex() {
    return PH.canvasTex("ph_hudson_drt", 512, 256, (ctx, w, h) => {
      const r = PH.rng("drt");
      ctx.fillStyle = "#d6dccb";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b8c8a4";
      ctx.beginPath();
      ctx.moveTo(w * 0.62, 0);
      ctx.lineTo(w * 0.75, 0);
      ctx.lineTo(w * 0.72, h * 0.55);
      ctx.lineTo(w * 0.63, h * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.8, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h);
      ctx.lineTo(w * 0.85, h * 0.6);
      ctx.closePath();
      ctx.fill();
      for (const [x, y, rr] of [
        [0.3, 0.7, 14],
        [0.18, 0.86, 16],
      ]) {
        ctx.beginPath();
        ctx.arc(w * x, h * y, rr, 0, TAU);
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(60,90,70,0.28)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(60,90,70,0.5)";
      ctx.lineWidth = 1.5;
      for (let x = 0; x < w; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      // pencil tracks with time ticks
      ctx.strokeStyle = "rgba(30,30,30,0.8)";
      ctx.fillStyle = "rgba(30,30,30,0.85)";
      ctx.font = '10px "Courier New", monospace';
      const track = (pts, lbl) => {
        ctx.beginPath();
        ctx.moveTo(pts[0][0] * w, pts[0][1] * h);
        for (const p of pts) ctx.lineTo(p[0] * w, p[1] * h);
        ctx.stroke();
        pts.forEach((p, i) => {
          ctx.beginPath();
          ctx.arc(p[0] * w, p[1] * h, 2.5, 0, TAU);
          ctx.fill();
          ctx.fillText(String(600 + i * 15), p[0] * w + 4, p[1] * h - 4);
        });
        ctx.fillText(
          lbl,
          pts[pts.length - 1][0] * w + 6,
          pts[pts.length - 1][1] * h + 12,
        );
      };
      track(
        [
          [0.3, 0.64],
          [0.38, 0.58],
          [0.47, 0.55],
          [0.56, 0.6],
        ],
        "SKIFF A",
      );
      track(
        [
          [0.1, 0.3],
          [0.2, 0.34],
          [0.3, 0.33],
        ],
        "SKUNK C",
      );
      // grease-pencil annotations
      ctx.strokeStyle = "#c0281a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(w * 0.3, h * 0.68, 26, 20, 0.3, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.52, h * 0.48);
      ctx.lineTo(w * 0.6, h * 0.58);
      ctx.moveTo(w * 0.6, h * 0.48);
      ctx.lineTo(w * 0.52, h * 0.58);
      ctx.stroke();
      ctx.fillStyle = "#c0281a";
      ctx.font = 'bold 18px "Comic Sans MS", cursive';
      ctx.fillText("AMBUSH HERE", w * 0.42, h * 0.42);
      ctx.fillText("ELLIS", w * 0.22, h * 0.92);
      // coffee rings & smudges
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = "rgba(110,70,30,0.35)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(r() * w, r() * h, 16 + r() * 6, 0, TAU);
        ctx.stroke();
      }
      for (let k = 0; k < 14; k++) {
        ctx.fillStyle = "rgba(40,40,30," + (0.04 + r() * 0.08) + ")";
        ctx.beginPath();
        ctx.arc(r() * w, r() * h, 8 + r() * 30, 0, TAU);
        ctx.fill();
      }
    });
  }

  /** Material key of the PPI radar-scope face (used by 32_navy_int for the CIC & bridge consoles). */
  PH.hudsonPPI = () => PH.texMat("hudson_ppi", ppiTex(), { emissive: 1.1 });

  // =====================================================================
  // GEOMETRY HELPERS (local coords of the cell; b is framed by 32_navy_int)
  // =====================================================================
  const V = PH.v3;
  const cut = (iv, a, bb) => {
    const out = [];
    for (const [p, q] of iv) {
      if (bb <= p || a >= q) {
        out.push([p, q]);
        continue;
      }
      if (a > p) out.push([p, a]);
      if (bb < q) out.push([bb, q]);
    }
    return out;
  };
  /** Transverse I-section deck beams every 1.2 m + two deep longitudinal girders, under a ceiling at `top`. */
  function deckhead(b, c) {
    const z0 = c.z0 === undefined ? -8.8 : c.z0,
      z1 = c.z1 === undefined ? 8.8 : c.z1,
      sk = c.skip || [];
    for (let x = c.x0 + 0.6; x < c.x1 - 0.3; x += 1.2) {
      let iv = [[z0, z1]];
      for (const s of sk)
        if (x + 0.1 > s[0] && x - 0.1 < s[2]) iv = cut(iv, s[1], s[3]);
      for (const [a, q] of iv) {
        if (q - a < 0.3) continue;
        b.boxMM(
          "navyplate",
          x - 0.1,
          c.top - 0.3,
          a,
          x + 0.1,
          c.top - 0.265,
          q,
          { seg: false, grime: 0.55, c: 0xc4c8cc },
        );
        b.boxMM("navyplate", x - 0.017, c.top - 0.265, a, x + 0.017, c.top, q, {
          seg: false,
          grime: 0.5,
          c: 0xc4c8cc,
        });
      }
    }
    for (const gz of c.girders || [-3.2, 3.2]) {
      if (gz < z0 || gz > z1) continue;
      let iv = [[c.x0, c.x1]];
      for (const s of sk)
        if (gz + 0.15 > s[1] && gz - 0.15 < s[3]) iv = cut(iv, s[0], s[2]);
      for (const [a, q] of iv) {
        if (q - a < 0.3) continue;
        b.boxMM(
          "navyplate",
          a,
          c.top - 0.46,
          gz - 0.14,
          q,
          c.top - 0.42,
          gz + 0.14,
          { seg: false, grime: 0.6, c: 0x9ea2a6 },
        );
        b.boxMM("navyplate", a, c.top - 0.42, gz - 0.02, q, c.top, gz + 0.02, {
          seg: false,
          grime: 0.55,
          c: 0x9ea2a6,
        });
      }
    }
  }
  /** Pipe run along x at (y, z): flange collars, hangers to the deckhead, colour bands, a handwheel valve now and then. */
  function pipeX(b, x0, x1, y, z, rad, key, top, opts) {
    opts = opts || {};
    b.rod(key, V(x0, y, z), V(x1, y, z), rad, 8);
    const r = PH.rng("px" + x0 + y + z);
    for (let x = x0 + 1.2; x < x1 - 0.3; x += 2.4) {
      b.cyl("iron", x, y, z, rad * 1.45, rad * 1.45, 0.07, 8, {
        rz: HP,
        hSeg: 1,
      }); // flange
      if (top !== undefined)
        b.rod("iron", V(x + 0.3, y + rad, z), V(x + 0.3, top, z), 0.012, 3); // hanger
      if (opts.band && (((x - x0) / 2.4) | 0) % 2 === 0)
        b.cyl(opts.band, x + 0.6, y, z, rad * 1.08, rad * 1.08, 0.22, 8, {
          rz: HP,
          hSeg: 1,
          grime: 0.3,
        });
      if (opts.valves && r() < 0.18) {
        b.cyl("bronze", x - 0.5, y - rad - 0.12, z, 0.04, 0.04, 0.2, 6, {
          hSeg: 1,
        });
        b.add(
          opts.valveKey || "paint_red",
          new THREE.TorusGeometry(0.16, 0.022, 5, 14),
          { m: PH.m4(x - 0.5, y - rad - 0.14, z, 0, HP, 0) },
        );
      }
    }
  }
  /** Cable tray along x hung from the deckhead: channel + 4 cables + hangers. */
  function trayX(b, x0, x1, y, z, top) {
    b.boxMM("scratched", x0, y - 0.02, z - 0.22, x1, y, z + 0.22, {
      seg: false,
      c: 0x8a8a84,
      grime: 0.6,
    });
    for (const s of [-1, 1])
      b.boxMM(
        "scratched",
        x0,
        y,
        z + s * 0.22 - 0.01,
        x1,
        y + 0.08,
        z + s * 0.22 + 0.01,
        { seg: false, c: 0x8a8a84 },
      );
    [
      [-0.13, 0.035, "black"],
      [-0.04, 0.03, "rubber"],
      [0.05, 0.04, "black"],
      [0.14, 0.025, "paint_red"],
    ].forEach(([dz, rr, k]) =>
      b.rod(k, V(x0, y + rr, z + dz), V(x1, y + rr, z + dz), rr, 5),
    );
    for (let x = x0 + 0.8; x < x1; x += 1.6)
      for (const s of [-1, 1])
        b.rod("iron", V(x, y, z + s * 0.23), V(x, top, z + s * 0.23), 0.012, 3);
  }
  /** Rectangular galvanised vent duct along x with flange rings, hangers and a grille every few metres. */
  function ductX(b, x0, x1, y, z, w, h, top) {
    b.boxMM("scratched", x0, y, z - w / 2, x1, y + h, z + w / 2, {
      seg: false,
      c: 0xa8aaa4,
      grime: 0.55,
    });
    let k = 0;
    for (let x = x0 + 1.2; x < x1 - 0.2; x += 1.2, k++) {
      b.boxMM(
        "iron",
        x - 0.03,
        y - 0.03,
        z - w / 2 - 0.03,
        x + 0.03,
        y + h + 0.03,
        z + w / 2 + 0.03,
        { seg: false },
      );
      if (k % 3 === 1) {
        b.boxMM(
          "black",
          x + 0.25,
          y - 0.012,
          z - w * 0.35,
          x + 0.85,
          y,
          z + w * 0.35,
          { seg: false, noAO: true },
        );
        for (let g = 0; g < 5; g++)
          b.boxMM(
            "iron",
            x + 0.27 + g * 0.13,
            y - 0.02,
            z - w * 0.35,
            x + 0.31 + g * 0.13,
            y - 0.005,
            z + w * 0.35,
            { seg: false },
          );
      }
      if (top !== undefined && top > y + h + 0.02)
        b.rod("iron", V(x + 0.6, y + h, z), V(x + 0.6, top, z), 0.015, 3);
    }
  }
  /** Vertical riser pipe with a couple of flanges. */
  function riser(b, x, z, y0, y1, rad, key) {
    b.cyl(key, x, y0, z, rad, rad, y1 - y0, 8, { hSeg: 1 });
    for (let y = y0 + 1.1; y < y1 - 0.3; y += 2.2)
      b.cyl("iron", x, y, z, rad * 1.45, rad * 1.45, 0.07, 8, { hSeg: 1 });
    b.box("iron", x, y0 + (y1 - y0) * 0.55, z, 0.05, 0.12, 0.3, { seg: false });
  }
  // wall-mounted helpers: (x,z) on the wall surface, ry = direction the wall faces, local lx along the wall
  const W2 = (x, z, ry, lx, lz) => PH.rot(x, z, ry, lx, lz);
  let ATLAS = null;
  function label(b, text, x, y, z, ry, w, lz) {
    const i = LI[text];
    if (i === undefined) return;
    if (!ATLAS)
      ATLAS = PH.texMat("hudson_labels", labelAtlas(), { transparent: true });
    const c = i % 4,
      r = (i / 4) | 0,
      e = 0.002;
    const [qx, qz] = W2(x, z, ry, 0, lz === undefined ? 0.012 : lz);
    w = w || 1.0;
    b.quad(ATLAS, qx, y, qz, w, w / 4, {
      ry,
      uvRect: [c / 4 + e, 1 - (r + 1) / 8 + e, (c + 1) / 4 - e, 1 - r / 8 - e],
    });
  }
  /** WWII battle lantern: yellow box with a round lens on a bracket (unlit — ship's power is long gone). */
  function lantern(b, x, y, z, ry) {
    const [bx, bz] = W2(x, z, ry, 0, 0.06);
    b.box("navy_dark", bx, y - 0.2, bz, 0.12, 0.3, 0.12, { ry, seg: false });
    const [lx, lz] = W2(x, z, ry, 0, 0.2);
    b.box("paint_yellow", lx, y - 0.14, lz, 0.24, 0.28, 0.24, {
      ry,
      seg: false,
      grime: 0.5,
    });
    const [gx, gz] = W2(x, z, ry, 0, 0.33);
    b.cyl("glass", gx, y, gz, 0.09, 0.09, 0.03, 12, { ry, rx: HP, hSeg: 1 });
    b.cyl("black", gx, y, gz, 0.105, 0.105, 0.035, 12, {
      ry,
      rx: HP,
      hSeg: 1,
      open: true,
    });
    b.box("iron", lx, y + 0.14, lz, 0.1, 0.05, 0.05, { ry, seg: false });
  }
  /** Fire station: red backboard, hose on a reel, handwheel valve, brass nozzle, label. */
