// play-inline-78 08 — ctx
// Lines 2191-2528 of readable/play-inline-78.pretty.js (statement-aligned).
  M.defineAtlas("rock", function () {
    const S = 512,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const r = M.rng("schist");
    // periodic value-noise lattice → tileable fBm
    function lattice(n) {
      const a = new Float32Array(n * n);
      for (let i = 0; i < a.length; i++) a[i] = r();
      return a;
    }
    const oct = [
      [4, lattice(4)],
      [8, lattice(8)],
      [16, lattice(16)],
      [32, lattice(32)],
      [64, lattice(64)],
    ];
    const sm = (t) => t * t * (3 - 2 * t);
    function vn(L, n, x, y) {
      // x,y in [0,1)
      const fx = x * n,
        fy = y * n,
        ix = Math.floor(fx),
        iy = Math.floor(fy),
        tx = sm(fx - ix),
        ty = sm(fy - iy);
      const i0 = ((ix % n) + n) % n,
        i1 = (i0 + 1) % n,
        j0 = ((iy % n) + n) % n,
        j1 = (j0 + 1) % n;
      const a = L[j0 * n + i0],
        b = L[j0 * n + i1],
        c = L[j1 * n + i0],
        d = L[j1 * n + i1];
      return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
    }
    function fbm(x, y, from) {
      let v = 0,
        amp = 0.5,
        tot = 0;
      for (let k = from || 0; k < oct.length; k++) {
        v += vn(oct[k][1], oct[k][0], x, y) * amp;
        tot += amp;
        amp *= 0.55;
      }
      return v / tot;
    }
    const img = ctx.createImageData(S, S),
      d = img.data;
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const u = x / S,
          v = y / S;
        const warp = fbm(u, v, 1);
        const band = Math.sin(
          2 * Math.PI * (6 * v + 0.9 * warp + 0.15 * vn(oct[1][1], 8, u, v)),
        ); // foliation (6 bands / tile)
        const fine = Math.sin(2 * Math.PI * (23 * v + 2.2 * warp));
        const n = fbm(u + 0.37, v + 0.11, 0);
        let k = 0.52 + (n - 0.5) * 0.55 + band * 0.07 + fine * 0.035;
        // rusty iron staining in the low bands, cool grey in the high ones
        const rr = k * (band > 0.4 ? 0.98 : 1.05),
          gg = k * 0.97,
          bb = k * (band > 0.4 ? 0.95 : 0.86);
        const i = (y * S + x) * 4;
        d[i] = Math.min(255, rr * 205);
        d[i + 1] = Math.min(255, gg * 199);
        d[i + 2] = Math.min(255, bb * 188);
        d[i + 3] = 255;
        if (r() < 0.004) {
          d[i] = d[i + 1] = d[i + 2] = 215;
        } // mica glint
      }
    ctx.putImageData(img, 0, 0);
    const wrap = (fn) => {
      for (const ox of [-S, 0, S])
        for (const oy of [-S, 0, S]) {
          ctx.save();
          ctx.translate(ox, oy);
          fn();
          ctx.restore();
        }
    };
    // cracks along and across the foliation
    ctx.lineCap = "round";
    for (let c = 0; c < 26; c++) {
      let x = r() * S,
        y = r() * S;
      const along = r() < 0.6;
      const pts = [[x, y]];
      for (let s2 = 0; s2 < 12; s2++) {
        x += along ? 10 + r() * 16 : (r() - 0.5) * 16;
        y += along ? (r() - 0.5) * 8 : 8 + r() * 14;
        pts.push([x, y]);
      }
      const w = 0.8 + r() * 2.2;
      wrap(() => {
        ctx.strokeStyle = "rgba(20,18,16,0.75)";
        ctx.lineWidth = w;
        ctx.beginPath();
        pts.forEach((p, i) =>
          i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]),
        );
        ctx.stroke();
        ctx.strokeStyle = "rgba(200,196,186,0.18)";
        ctx.lineWidth = w * 0.6;
        ctx.beginPath();
        pts.forEach((p, i) =>
          i
            ? ctx.lineTo(p[0] + 1.5, p[1] + 1.5)
            : ctx.moveTo(p[0] + 1.5, p[1] + 1.5),
        );
        ctx.stroke();
      });
    }
    // lichen & rust blooms
    for (let i = 0; i < 70; i++) {
      const x = r() * S,
        y = r() * S,
        rds = 3 + r() * 12;
      const col =
        r() < 0.55
          ? "rgba(150,152,120,"
          : r() < 0.6
            ? "rgba(160,110,50,"
            : "rgba(60,64,44,";
      const a = (0.25 + r() * 0.35).toFixed(2);
      wrap(() => {
        for (let k = 0; k < 6; k++) {
          ctx.fillStyle = col + a + ")";
          ctx.beginPath();
          ctx.arc(
            x + (r() - 0.5) * rds,
            y + (r() - 0.5) * rds,
            rds * (0.3 + r() * 0.5),
            0,
            7,
          );
          ctx.fill();
        }
      });
    }
    const t = finishTex(new THREE.CanvasTexture(cv));
    return { texture: t, roughness: 0.93 };
  });

  // --- Fake light: additive shafts / cones / floor pools (unlit, 4 cells in a row) ---
  //   0 vertical shaft (bright top, soft sides)  1 radial pool  2 horizontal beam (bright left)  3 soft square glow
  M.defineAtlas("lightfx", function () {
    const S = 256,
      cv = M.canvas(S * 4, S),
      ctx = cv.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, S * 4, S);
    // 0: shaft — brightness falls off downward, sides fade (drawn column by column)
    for (let y = 0; y < S; y++) {
      const vy = Math.pow(1 - y / S, 1.6);
      const g = ctx.createLinearGradient(0, 0, S, 0);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(
        0.3,
        "rgb(" +
          ((vy * 255) | 0) +
          "," +
          ((vy * 255) | 0) +
          "," +
          ((vy * 255) | 0) +
          ")",
      );
      g.addColorStop(
        0.7,
        "rgb(" +
          ((vy * 255) | 0) +
          "," +
          ((vy * 255) | 0) +
          "," +
          ((vy * 255) | 0) +
          ")",
      );
      g.addColorStop(1, "rgba(0,0,0,1)");
      ctx.fillStyle = g;
      ctx.fillRect(0, y, S, 1);
    }
    // 1: radial pool
    let g = ctx.createRadialGradient(S * 1.5, S / 2, 0, S * 1.5, S / 2, S / 2);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.35, "#8a8a8a");
    g.addColorStop(1, "#000");
    ctx.fillStyle = g;
    ctx.fillRect(S, 0, S, S);
    // 2: horizontal beam (bright at u=0)
    for (let x = 0; x < S; x++) {
      const vx = Math.pow(1 - x / S, 1.4);
      const gg = ctx.createLinearGradient(0, 0, 0, S);
      const c =
        "rgb(" +
        ((vx * 255) | 0) +
        "," +
        ((vx * 255) | 0) +
        "," +
        ((vx * 255) | 0) +
        ")";
      gg.addColorStop(0, "#000");
      gg.addColorStop(0.35, c);
      gg.addColorStop(0.65, c);
      gg.addColorStop(1, "#000");
      ctx.fillStyle = gg;
      ctx.fillRect(S * 2 + x, 0, 1, S);
    }
    // 3: soft square glow
    g = ctx.createRadialGradient(
      S * 3.5,
      S / 2,
      S * 0.1,
      S * 3.5,
      S / 2,
      S * 0.62,
    );
    g.addColorStop(0, "#fff");
    g.addColorStop(1, "#000");
    ctx.fillStyle = g;
    ctx.fillRect(S * 3, 0, S, S);
    const t = finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, basic: true, additive: true };
  });
  M.lightUV = (i) => [i * 0.25 + 0.004, 0.004, (i + 1) * 0.25 - 0.004, 0.996];
  /**
   * Fake light cone / shaft between a source line (centre s, half-width ws) and a target line (centre t,
   * half-width wt), crossed ('X') so it reads from any side. c = colour × intensity (additive!).
   */
  M.lightCone = function (buf, sx, sy, sz, tx, ty, tz, ws, wt, c, crossed) {
    const uv = M.lightUV(0);
    const dirs =
      crossed === false
        ? [[1, 0]]
        : [
            [1, 0],
            [0, 1],
          ];
    for (const [ax, az] of dirs) {
      M.quad(
        buf,
        [tx - ax * wt, ty, tz - az * wt],
        [tx + ax * wt, ty, tz + az * wt],
        [sx + ax * ws, sy, sz + az * ws],
        [sx - ax * ws, sy, sz - az * ws],
        [az, 0, -ax],
        [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
        c,
        c,
      );
    }
  };
  /** Additive floor pool of light (radius r) at (x,y,z). */
  M.lightPool = function (buf, x, y, z, rx, rz, c) {
    const uv = M.lightUV(1);
    M.quad(
      buf,
      [x - rx, y, z + rz],
      [x + rx, y, z + rz],
      [x + rx, y, z - rz],
      [x - rx, y, z - rz],
      [0, 1, 0],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
      c,
      c,
    );
  };

  /**
   * Flat ground decal quad (horizontal) centred at (x,z), size w×d, rotated yaw,
   * atlas cell i. y = surface height (the material has polygon offset).
   */
  M.decal = function (b, x, y, z, w, d, yaw, cell, c, flip) {
    const uv = M.markUV(cell);
    const cs = Math.cos(yaw),
      sn = Math.sin(yaw);
    const hx = w / 2,
      hz = d / 2;
    const P = (lx, lz) => [x + lx * cs + lz * sn, y, z - lx * sn + lz * cs];
    const u0 = flip ? uv[2] : uv[0],
      u1 = flip ? uv[0] : uv[2];
    M.quad(
      b,
      P(-hx, hz),
      P(hx, hz),
      P(hx, -hz),
      P(-hx, -hz),
      [0, 1, 0],
      [u0, uv[1], u1, uv[1], u1, uv[3], u0, uv[3]],
      c || W,
    );
  };

  // -------------------------------------------------------------------
  // Chunked output + HLOD
  // -------------------------------------------------------------------
  // Layers:
  //   always  – single mesh per material, never LOD'ed (ground plates, sea walls, park terrain)
  //   far     – single mesh per material, no shadows (distant skyline filler)
  //   main    – 120 m chunks; shown while the chunk's 240 m LOD cell is within R_NEAR
  //   imp     – building impostors per 240 m cell; shown exactly when its cell's main chunks are hidden
  //   mid     – 120 m chunks; LOD 900 m (park trees)
  //   detail  – 120 m chunks; LOD 300 m (fire escapes, railings, signs, awnings …)
  //   fine    – 120 m chunks; LOD 150 m (decals, clutter)
  //   cryo / subway – interior cells (grouped per cell, toggled by the module)
  const chunkMap = new Map();
  M.chunkMap = chunkMap;
  M.R_NEAR = 560;
  M.CELL = 240;
  M.LAYER_LOD = { detail: 300, fine: 150, mid: 900, near: 330 };
  // start-interior cell layer: 'cryo'
  const START_LAYERS = { cryo: 1 };
  M.START_LAYERS = START_LAYERS;
  const SINGLE = Object.assign({ always: 1, far: 1, subway: 1 }, START_LAYERS);
  /** Interior cell layers: the start interior ('cryo'), 'subway' and every dungeon cell 'int_<key>' (one root per cell, toggled by 90_module). */
  M.isIntLayer = (l) =>
    !!START_LAYERS[l] ||
    l === "subway" ||
    (typeof l === "string" && l.startsWith("int_"));
  const isSingle = (l) => !!SINGLE[l] || M.isIntLayer(l);
  // Material consolidation for outdoor layers: key → [targetKey, colourMultiplier]
  M.REMAP = {
    concrete_dark: ["concrete", [0.6, 0.6, 0.6]],
    roof_tar: ["roof_tar", [1, 1, 1]],
    brick_brown: ["brick_red", [0.72, 0.66, 0.62]],
    chrome: ["metal_painted", [1.35, 1.35, 1.35]],
    wood_planks: ["wood_rotten", [1.2, 1.12, 1.05]],
    metal_panel: ["metal_painted", [1.05, 1.05, 1.05]],
    paint_red: ["metal_painted", [1.6, 0.45, 0.4]],
    paint_teal: ["metal_painted", [0.6, 1.2, 1.1]],
    // shop interiors (dim rooms behind the storefronts): plaster reads the same as tinted concrete in the dark,
    // and concrete is in every chunk already → one draw call less per chunk (interior cells keep real plaster)
    plaster_stained: ["concrete", [1.12, 1.08, 0.98]],
  };
  /** A tinted view onto a GeoBuf (lets remapped materials keep their look via vertex colours). */
