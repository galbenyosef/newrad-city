/* src/textures/20_facades.js */
/* =====================================================================
 * NEW RAD CITY — TEXTURES: building facade atlases & storefronts
 * Owned by: textures.
 *
 * FACADES (tileable in U and V): each texture is a grid of `bays` window
 * columns × `floors` storeys. G.tex.facadeInfo(style) returns the
 * physical size of one tile so the map module can set UV repeats:
 *     repeatU = wallWidth / tileW,  repeatV = wallHeight / tileH
 * Every floor row is a complete storey (lintel → window → sill), so the
 * tile can start at any floor boundary. Window states are randomised per
 * tile: intact grimy glass (with blinds/curtains), broken, boarded,
 * burnt-out (soot plume), empty, warm-lit (also written to an emissive
 * map, used at night by G.mats.facade), plus 1950s window A/C units.
 *
 * STOREFRONTS (storefront_1..N): 512×256 ground-floor shop fronts
 * (one tile = 8 m × 4 m, tileable in U) with faded shop signs.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const X = G._tx;
  const TAU = Math.PI * 2;

  // Every style shares ONE physical tile (4 bays × 6 storeys of 3.5 m = 14 m × 21 m) so that a
  // building can switch style without re-UVing and storeys line up across the whole city.
  // `cols` is the number of window columns actually drawn (office curtain walls use 2 per bay).
  const TILE = { bays: 4, floors: 6, bayW: 3.5, floorH: 3.5, w: 512, h: 768 };
  const STYLES = {
    tenement: Object.assign({ cols: 4, variants: 4 }, TILE),
    artdeco: Object.assign({ cols: 4, variants: 4 }, TILE),
    brownstone: Object.assign({ cols: 4, variants: 3 }, TILE),
    warehouse: Object.assign({ cols: 4, variants: 2 }, TILE),
    office: Object.assign({ cols: 8, variants: 3 }, TILE),
  };
  X.FACADE_STYLES = STYLES;
  const emissiveCanvas = {}; // facade name -> half-res emissive canvas
  const emissiveTex = {};
  const wantE = {}; // facade name -> true while an emissive re-paint is in progress
  // Interior-mapping window mask (half-res, linear): R = how much of the room shows through (glass ≈0.55–0.85,
  // holes 1, blinds/curtains/boards/frames 0), G = no glass (broken/empty/burnt hole, gaps between boards),
  // B = charred interior (burnt-out window). Read by the fake-room parallax branch of the façade shader (90_api.js).
  const maskCanvas = {},
    maskTex = {},
    wantM = {};
  /** Keep freshly painted emissive/mask canvases only if nobody has consumed them yet (or a re-paint asked for them). */
  let curE = null; // canvases of the façade being painted (paintWall snapshot → wall field)
  function storeE(name, E) {
    if (curE === E) curE = null;
    if (emissiveTex[name] === undefined || wantE[name])
      emissiveCanvas[name] = E.c;
    if (E.m && (maskTex[name] === undefined || wantM[name]))
      maskCanvas[name] = E.m.c;
  }
  // Mask colours: [R, G, B] as above.
  const MK_GLASS = "rgb(184,0,0)",
    MK_GLASS_LIT = "rgb(214,0,0)",
    MK_HOLE = "rgb(255,255,0)",
    MK_BURNT = "rgb(255,255,255)",
    MK_SHARD = "rgb(150,0,0)",
    MK_WIRED = "rgb(96,0,0)",
    MK_NONE = "#000";

  // ------------------------------------------------------------------
  // Wall fill at facade scale (≈ 30–40 px per metre)
  // ------------------------------------------------------------------
  // Ashlar kinds use a REGULAR grid (rows per 21 m tile × blocks per 14 m tile, running bond unless stagger:false) so the
  // façade shader's procedural wall detail (X.facadeWallSpec) can draw crisp joints exactly on top of the painted ones.
  const WALLS = {
    brick_red: {
      base: "#7e3a2a",
      var: 0.16,
      course: 3,
      joint: 8,
      mortar: "rgba(170,160,145,0.22)",
    },
    brick_tan: {
      base: "#a58c66",
      var: 0.12,
      course: 3,
      joint: 8,
      mortar: "rgba(90,80,65,0.22)",
    },
    brick_brown: {
      base: "#5a3e2e",
      var: 0.16,
      course: 3,
      joint: 8,
      mortar: "rgba(150,140,125,0.2)",
    },
    brick_cream: {
      base: "#b9ae94",
      var: 0.1,
      course: 3,
      joint: 8,
      mortar: "rgba(80,75,65,0.2)",
    },
    brick_dark: {
      base: "#3e2e26",
      var: 0.18,
      course: 3,
      joint: 8,
      mortar: "rgba(140,130,115,0.18)",
    },
    limestone: {
      base: "#b3aa92",
      var: 0.07,
      rows: 32,
      cols: 12,
      joint: "rgba(40,36,30,0.35)",
    },
    granite: {
      base: "#7a746e",
      var: 0.08,
      rows: 28,
      cols: 12,
      joint: "rgba(25,22,20,0.4)",
      speck: true,
    },
    brownstone: {
      base: "#5a3a2c",
      var: 0.1,
      rows: 24,
      cols: 10,
      joint: "rgba(25,15,10,0.35)",
    },
    stucco: { base: "#9a9282", var: 0.1 },
    concrete: {
      base: "#86837a",
      var: 0.1,
      rows: 12,
      cols: 4,
      stagger: false,
      joint: "rgba(30,28,24,0.3)",
    },
  };
  // Procedural wall detail for the façade shader (90_api.js): [kind (1 brick, 2 ashlar/panels, 3 render), units per tile U,
  // courses per tile V, stagger] and [offset U, offset V (cell units, aligns with the painted joints), joint half-width m, relief m].
  const WALL_SPEC = {
    brick: [
      [1, 64, 256, 1],
      [0.0625, -1 / 6, 0.0055, 0.009],
    ],
    limestone: [
      [2, 12, 32, 1],
      [0, 0, 0.0035, 0.007],
    ],
    granite: [
      [2, 12, 28, 1],
      [0, 0, 0.003, 0.006],
    ],
    brownstone: [
      [2, 10, 24, 1],
      [0, 0, 0.004, 0.008],
    ],
    concrete: [
      [2, 4, 12, 0],
      [0, 0, 0.008, 0.008],
    ],
    stucco: [
      [3, 1, 1, 0],
      [0, 0, 0, 0.0035],
    ],
  };
  const FACADE_TILE_PX = 768; // ashlar block height is defined per 768-px façade tile (trims share the px scale)
  function paintWall(ctx, x0, y0, w, h, kind, r, seed) {
    const K = WALLS[kind] || WALLS.stucco;
    const W = ctx.canvas.width,
      H = ctx.canvas.height;
    const n = X.fbm(W, H, { scale: 4, octaves: 5, seed: seed || 7 }),
      n2 = X.fbm(W, H, { scale: 48, octaves: 2, seed: (seed || 7) + 1 });
    const c = X.hex(K.base);
    const img = ctx.getImageData(x0, y0, w, h),
      d = img.data;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = (y0 + y) * W + (x0 + x),
          o = (y * w + x) * 4;
        const k =
          1 +
          (n[i] - 0.5) * K.var * 2.2 +
          (n2[i] - 0.5) * K.var +
          (r() - 0.5) * 0.06;
        d[o] = c[0] * k;
        d[o + 1] = c[1] * k;
        d[o + 2] = c[2] * k;
        d[o + 3] = 255;
      }
    ctx.putImageData(img, x0, y0);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y0, w, h);
    ctx.clip();
    if (K.course) {
      // brick coursing & per-brick tone
      for (let y = y0; y < y0 + h; y += K.course) {
        ctx.fillStyle = K.mortar;
        ctx.fillRect(x0, y, w, 1);
        const off = ((y / K.course) | 0) % 2 ? K.joint / 2 : 0;
        for (let x = x0 - off; x < x0 + w; x += K.joint) {
          if (r() < 0.35) {
            ctx.fillStyle =
              r() < 0.5 ? "rgba(0,0,0,0.12)" : "rgba(255,230,200,0.08)";
            ctx.fillRect(x, y + 1, K.joint - 1, K.course - 1);
          }
        }
      }
    }
    if (K.rows) {
      // regular ashlar / panel joints (per-block tone first, then the joints on top)
      const bh = FACADE_TILE_PX / K.rows,
        bw = W / K.cols;
      for (let k = Math.floor(y0 / bh); k * bh < y0 + h; k++) {
        const y = k * bh,
          off = K.stagger === false ? 0 : ((k % 2) * bw) / 2;
        for (let x = -off; x < W; x += bw) {
          const t = r();
          if (t < 0.6) {
            ctx.fillStyle =
              t < 0.3
                ? "rgba(0,0,0," + (0.03 + r() * 0.06).toFixed(3) + ")"
                : "rgba(255,245,225," + (0.02 + r() * 0.05).toFixed(3) + ")";
            ctx.fillRect(x, y, bw, bh);
          }
        }
        ctx.fillStyle = K.joint;
        ctx.fillRect(x0, y - 0.75, w, 1.5);
        for (let x = -off; x < W + bw; x += bw)
          ctx.fillRect(x - 0.75, y, 1.5, bh);
      }
    }
    if (K.speck)
      X.speckle(ctx, W, H, r, {
        count: (w * h) / 60,
        colors: ["#222", "#ddd", "#8a6a60"],
        min: 0.3,
        max: 0.9,
        alpha: 0.5,
      });
    ctx.restore();
    // façade atlases: remember the bare wall so weatherFacade can mark the untouched wall field in the window mask (B)
    if (curE && !curE.snap && x0 === 0 && y0 === 0 && w === W && h === H)
      curE.snap = ctx.getImageData(0, 0, W, H);
  }
  /**
   * Wall field → window-mask B channel (only where no window, R = G = 0): 255 where the atlas still shows the bare wall
   * painted by paintWall (or the same wall merely shaded/tinted), 0 on sills, lintels, frames, spandrels, AC units…
   * The façade shader draws procedural brick / ashlar joints and relief only on this field.
   */
  function markWallField(ctx, E, w, h) {
    const a = E.snap.data,
      b = ctx.getImageData(0, 0, w, h).data;
    const M = E.m,
      mw = M.w,
      mh = M.h,
      img = M.ctx.getImageData(0, 0, mw, mh),
      d = img.data;
    for (let y = 0; y < mh; y++)
      for (let x = 0; x < mw; x++) {
        const o = (y * mw + x) * 4;
        if (d[o] > 3 || d[o + 1] > 3) continue;
        let s = 0;
        for (let q = 0; q < 4; q++) {
          const i = (((y << 1) + (q >> 1)) * w + (x << 1) + (q & 1)) * 4;
          const kr = (b[i] + 2) / (a[i] + 2),
            kg = (b[i + 1] + 2) / (a[i + 1] + 2),
            kb = (b[i + 2] + 2) / (a[i + 2] + 2);
          const mx = Math.max(kr, kg, kb),
            mn = Math.min(kr, kg, kb);
          if (mn > 0.5 && mx < 1.4 && mx < mn * 1.16) s++;
        }
        d[o + 2] = s * 63.75;
      }
    M.ctx.putImageData(img, 0, 0);
  }
  X.paintWall = paintWall;

  // ------------------------------------------------------------------
  // Window renderer
  // ------------------------------------------------------------------
  const CURTAINS = [
    "#8a6a4a",
    "#6a7a5a",
    "#9a8a6a",
    "#7a4a3a",
    "#5a6a7a",
    "#a89a78",
    "#6a5a6a",
  ];
  /**
   * Cracked (but intact) pane. Three distinct shapes so a curtain wall never shows the same starburst twice:
   * a bullet spiderweb (radial + ring segments), a long stress crack corner-to-edge, or a small corner chip.
   */
  function crackPane(ctx, r, gx, gy, gw, gh) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(gx, gy, gw, gh);
    ctx.clip();
    ctx.strokeStyle = "rgba(215,225,215," + (0.35 + r() * 0.25) + ")";
    ctx.lineWidth = 0.6 + r() * 0.4;
    const kind = r();
    if (kind < 0.4) {
      // spiderweb from an impact point
      const cx = gx + gw * (0.2 + r() * 0.6),
        cy = gy + gh * (0.2 + r() * 0.6),
        n = 4 + ((r() * 5) | 0);
      const radius = Math.min(gw, gh) * (0.25 + r() * 0.5),
        ang = [];
      for (let k = 0; k < n; k++) ang.push((k / n) * TAU + (r() - 0.5) * 0.9);
      for (const a of ang) {
        // jagged radial legs
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        let px = cx,
          py = cy;
        const len = radius * (0.6 + r() * 0.9),
          seg = 3;
        for (let q = 1; q <= seg; q++) {
          px = cx + (Math.cos(a + (r() - 0.5) * 0.3) * len * q) / seg;
          py = cy + (Math.sin(a + (r() - 0.5) * 0.3) * len * q) / seg;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      for (let ring = 1; ring <= 2; ring++) {
        // concentric fracture segments
        const rr = radius * ring * 0.3;
        for (let k = 0; k < n; k++) {
          if (r() < 0.35) continue;
          const a0 = ang[k],
            a1 = ang[(k + 1) % n] + (k + 1 === n ? TAU : 0);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a0) * rr, cy + Math.sin(a0) * rr);
          ctx.lineTo(
            cx + Math.cos(a1) * rr * (0.85 + r() * 0.3),
            cy + Math.sin(a1) * rr * (0.85 + r() * 0.3),
          );
          ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(20,24,22,0.8)";
      ctx.beginPath();
      ctx.arc(cx, cy, 1.2, 0, TAU);
      ctx.fill();
    } else if (kind < 0.8) {
      // long meandering stress crack
      let x = r() < 0.5 ? gx : gx + gw,
        y = gy + r() * gh;
      const tx = x === gx ? gx + gw : gx,
        ty = gy + r() * gh;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let q = 1; q <= 7; q++) {
        const t = q / 7;
        ctx.lineTo(
          x + (tx - x) * t + (r() - 0.5) * gw * 0.12,
          y + (ty - y) * t + (r() - 0.5) * gh * 0.12,
        );
      }
      ctx.stroke();
      if (r() < 0.6) {
        const bx = gx + gw * (0.3 + r() * 0.4),
          by = gy + gh * (0.3 + r() * 0.4);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(
          bx + (r() - 0.5) * gw * 0.6,
          by + (r() < 0.5 ? -1 : 1) * gh * (0.2 + r() * 0.3),
        );
        ctx.stroke();
      }
    } else {
      // corner chip with a missing shard
      const cx = r() < 0.5 ? gx : gx + gw,
        cy = r() < 0.5 ? gy : gy + gh,
        sx = (cx === gx ? 1 : -1) * gw * (0.2 + r() * 0.25),
        sy = (cy === gy ? 1 : -1) * gh * (0.15 + r() * 0.2);
      ctx.fillStyle = "rgba(14,12,10,0.85)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + sx, cy);
      ctx.lineTo(cx + sx * 0.3, cy + sy * 0.4);
      ctx.lineTo(cx, cy + sy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + sx * 0.3, cy + sy * 0.4);
      ctx.lineTo(cx + sx * 1.6, cy + sy * 1.8);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Draw one window into ctx (colour), hc (height) and ec (emissive, half-res; coordinates scaled by 0.5).
   * o: {x,y,w,h, state, panes:[cols,rows], upperPanes?, frame:'#hex', sash:bool, arch:bool, reveal:px}
   */
  function drawWindow(ctx, hc, ec, r, o) {
    const { x, y, w, h } = o;
    const reveal = o.reveal === undefined ? Math.max(3, w * 0.07) : o.reveal;
    const frame = o.frame || "#d8d2c0";
    const state = o.state;
    const mc = ec && ec.txMask; // interior-mapping mask (façade atlases only)
    const path = (g, inset) => {
      g.beginPath();
      if (o.arch) {
        const rr = (w - inset * 2) / 2,
          top = y + inset + rr * 0.45;
        g.moveTo(x + inset, y + h - inset);
        g.lineTo(x + inset, top);
        g.quadraticCurveTo(
          x + w / 2,
          y + inset - rr * 0.25,
          x + w - inset,
          top,
        );
        g.lineTo(x + w - inset, y + h - inset);
        g.closePath();
      } else g.rect(x + inset, y + inset, w - inset * 2, h - inset * 2);
    };
    // reveal (deep shadowed jamb, light from upper-left)
    path(ctx, 0);
    ctx.fillStyle = "#1e1a16";
    ctx.fill();
    path(hc, 0);
    hc.fillStyle = "#383838";
    hc.fill();
    const gx = x + reveal,
      gy = y + reveal * 1.2,
      gw = w - reveal * 1.6,
      gh = h - reveal * 1.6;
    ctx.save();
    path(ctx, reveal * 0.8);
    ctx.clip();
    if (mc) {
      mc.save();
      path(mc, reveal * 0.8);
      mc.clip();
    }
    // --- pane content ---
    if (state === "boarded") {
      ctx.fillStyle = "#1a1612";
      ctx.fillRect(x, y, w, h);
      if (mc) {
        mc.fillStyle = MK_HOLE;
        mc.fillRect(x, y, w, h);
      } // slits between the planks show the dark room
      const planks = 3 + ((r() * 3) | 0),
        cols = ["#7a6a52", "#6a5c48", "#86765c", "#5e5242"];
      for (let i = 0; i < planks; i++) {
        const py = gy + (i * gh) / planks + (r() - 0.5) * 3,
          ph = gh / planks - 2;
        const rot = (r() - 0.5) * 0.12;
        if (mc) {
          mc.save();
          mc.translate(gx + gw / 2, py + ph / 2);
          mc.rotate(rot);
          mc.fillStyle = MK_NONE;
          mc.fillRect(-gw * 0.6, -ph / 2, gw * 1.2, ph);
          mc.restore();
        }
        ctx.save();
        ctx.translate(gx + gw / 2, py + ph / 2);
        ctx.rotate(rot);
        ctx.fillStyle = cols[(r() * cols.length) | 0];
        ctx.fillRect(-gw * 0.6, -ph / 2, gw * 1.2, ph);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(-gw * 0.6, ph / 2 - 1.5, gw * 1.2, 1.5);
        ctx.fillStyle = "rgba(40,30,20,0.5)";
        for (let k = 0; k < 3; k++)
          ctx.fillRect(
            -gw * 0.6 + r() * gw,
            -ph / 2 + r() * ph,
            6 + r() * 12,
            0.8,
          );
        ctx.fillStyle = "#2a2622";
        ctx.fillRect(-gw * 0.45, -1, 2, 2);
        ctx.fillRect(gw * 0.42, -1, 2, 2);
        ctx.restore();
      }
      hc.fillStyle = "#9a9a9a";
      hc.fillRect(gx, gy, gw, gh);
    } else if (state === "broken" || state === "burnt" || state === "empty") {
      const g = ctx.createLinearGradient(0, gy, 0, gy + gh);
      g.addColorStop(0, state === "burnt" ? "#0a0806" : "#16120e");
      g.addColorStop(1, state === "burnt" ? "#1a120c" : "#2c241c");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      if (mc) {
        mc.fillStyle = state === "burnt" ? MK_BURNT : MK_HOLE;
        mc.fillRect(x, y, w, h);
      }
      // suggestion of a room: ceiling line, hanging fixture, far wall (only seen where the parallax room fades out)
      ctx.fillStyle = "rgba(80,70,55,0.35)";
      ctx.fillRect(gx, gy + gh * 0.72, gw, gh * 0.28);
      if (r() < 0.5) {
        ctx.strokeStyle = "rgba(90,80,60,0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx + gw * 0.5, gy);
        ctx.lineTo(gx + gw * 0.5, gy + gh * 0.2);
        ctx.stroke();
      }
      if (state === "broken") {
        // 1–3 big shards still in the putty at a corner: straight fracture edges (glass breaks in lines, not saw teeth),
        // glass tone with the sky reflection, a bright fracture edge and a hairline crack; the rest is the dark room
        const corners = [
          [gx, gy],
          [gx + gw, gy],
          [gx + gw, gy + gh],
          [gx, gy + gh],
        ];
        const nS = 1 + ((r() * 2.6) | 0);
        const poly = (g, pts) => {
          g.beginPath();
          g.moveTo(pts[0][0], pts[0][1]);
          for (let q = 1; q < pts.length; q++) g.lineTo(pts[q][0], pts[q][1]);
          g.closePath();
        };
        for (let k = 0; k < nS; k++) {
          const ci = (r() * 4) | 0,
            cx0 = corners[ci][0],
            cy0 = corners[ci][1];
          const sx = ci === 0 || ci === 3 ? 1 : -1,
            sy = ci < 2 ? 1 : -1;
          const la = gw * (0.2 + r() * 0.6),
            lb = gh * (0.15 + r() * 0.5),
            m = 1 + ((r() * 3) | 0);
          const pts = [
            [cx0, cy0],
            [cx0 + sx * la, cy0],
          ];
          for (let q = 1; q <= m; q++) {
            const t = q / (m + 1),
              j = (r() - 0.35) * 0.5;
            pts.push([
              cx0 + sx * la * (1 - t) * (1 + j),
              cy0 + sy * lb * t * (1 + j),
            ]);
          }
          pts.push([cx0, cy0 + sy * lb]);
          const g2 = ctx.createLinearGradient(gx, gy, gx + gw * 0.4, gy + gh);
          g2.addColorStop(0, "rgba(124,140,132,0.92)");
          g2.addColorStop(0.45, "rgba(70,84,80,0.92)");
          g2.addColorStop(1, "rgba(34,40,38,0.92)");
          poly(ctx, pts);
          ctx.fillStyle = g2;
          ctx.fill();
          ctx.fillStyle = X.css("#5a4a30", 0.18 + r() * 0.15);
          ctx.fill(); // grime film
          if (mc) {
            poly(mc, pts);
            mc.fillStyle = MK_SHARD;
            mc.fill();
          }
          ctx.strokeStyle = "rgba(228,236,228,0.6)";
          ctx.lineWidth = 0.7;
          ctx.lineJoin = "miter";
          ctx.beginPath();
          ctx.moveTo(pts[1][0], pts[1][1]);
          for (let q = 2; q < pts.length; q++) ctx.lineTo(pts[q][0], pts[q][1]);
          ctx.stroke();
          if (r() < 0.6) {
            const p2 = pts[2];
            ctx.strokeStyle = "rgba(215,225,215,0.4)";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p2[0], p2[1]);
            ctx.lineTo(
              p2[0] + (cx0 - p2[0]) * (0.35 + r() * 0.4),
              p2[1] + (cy0 - p2[1]) * (0.3 + r() * 0.5) + (r() - 0.5) * 4,
            );
            ctx.stroke();
          }
        }
      }
    } else if (state === "lit") {
      const g = ctx.createRadialGradient(
        gx + gw * 0.5,
        gy + gh * 0.3,
        2,
        gx + gw / 2,
        gy + gh / 2,
        gh,
      );
      // by day a lived-in window is just (cleaner, warmer) glass — the room behind it comes from the interior shader and the
      // glow from the emissive map at night (the old orange paint read as a lit window at noon)
      g.addColorStop(0, "#9a988a");
      g.addColorStop(0.6, "#5e5a4c");
      g.addColorStop(1, "#2a2620");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      if (mc) {
        mc.fillStyle = MK_GLASS_LIT;
        mc.fillRect(x, y, w, h);
      }
      if (r() < 0.25) {
        ctx.fillStyle = "rgba(60,30,10,0.55)";
        if (mc) mc.fillStyle = "rgba(0,0,0,0.7)";
        for (let yy = gy; yy < gy + gh * (0.2 + r() * 0.4); yy += 4) {
          ctx.fillRect(gx, yy, gw, 2);
          if (mc) mc.fillRect(gx, yy, gw, 2);
        }
      }
      ctx.fillStyle = "rgba(40,25,12,0.3)";
      X.rrect(
        ctx,
        gx + gw * (0.1 + r() * 0.4),
        gy + gh * 0.55,
        gw * 0.4,
        gh * 0.45,
        5,
      );
      ctx.fill();
      if (ec) {
        const eg = ec.createRadialGradient(
          (gx + gw * 0.5) / 2,
          (gy + gh * 0.35) / 2,
          1,
          (gx + gw / 2) / 2,
          (gy + gh / 2) / 2,
          gh / 2,
        );
        eg.addColorStop(0, "#fff0c8");
        eg.addColorStop(0.7, "#a86020");
        eg.addColorStop(1, "#301006");
        ec.fillStyle = eg;
        ec.fillRect(gx / 2, gy / 2, gw / 2, gh / 2);
      }
    } else {
      // intact grimy glass reflecting a hazy sky
      const g = ctx.createLinearGradient(gx, gy, gx + gw * 0.4, gy + gh);
      g.addColorStop(0, "#7e8c84");
      g.addColorStop(0.35, "#4a5652");
      g.addColorStop(1, "#1e2422");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      if (mc) {
        mc.fillStyle = MK_GLASS;
        mc.fillRect(x, y, w, h);
      }
      ctx.fillStyle = "rgba(210,220,200,0.12)"; // diagonal highlight streak
      ctx.beginPath();
      ctx.moveTo(gx + gw * 0.2, gy);
      ctx.lineTo(gx + gw * 0.45, gy);
      ctx.lineTo(gx + gw * 0.05, gy + gh);
      ctx.lineTo(gx - gw * 0.2, gy + gh);
      ctx.fill();
      // o.dress (office tenants): a run of windows shares blinds at a similar height / no dressing
      // Dressing painted into the atlas repeats with every tile and hides the fake room — the interior shader adds per-window
      // curtains / blinds (~28 %, keyed on the world position), so only a few atlas windows keep painted ones.
      const dr = o.dress,
        rr = dr
          ? dr.kind === "blind"
            ? 0.1
            : dr.kind === "curtain"
              ? 0.5
              : 0.9
          : r() < 0.88
            ? 0.9
            : r() * 0.6;
      if (rr < 0.35) {
        // blinds partly drawn
        const bl = dr
          ? gh * Math.max(0.08, Math.min(0.6, dr.level + (r() - 0.5) * 0.1))
          : gh * (0.15 + r() * 0.35);
        ctx.fillStyle = X.css(
          dr ? dr.col : r() < 0.5 ? "#c8bc9a" : "#a8a08a",
          0.8,
        );
        ctx.fillRect(gx, gy, gw, bl);
        if (mc) {
          mc.fillStyle = "rgb(14,0,0)";
          mc.fillRect(gx, gy, gw, bl);
        }
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        for (let yy = gy; yy < gy + bl; yy += 3) ctx.fillRect(gx, yy, gw, 1);
        if (r() < (dr ? 0.07 : 0.4)) {
          ctx.save();
          ctx.translate(gx + gw, gy + bl);
          ctx.rotate(-0.25);
          ctx.fillStyle = "rgba(200,190,160,0.8)";
          ctx.fillRect(-gw * 0.6, -3, gw * 0.6, 4);
          ctx.restore();
        } // slipped blind
      } else if (rr < 0.6) {
        // curtains
        const cc = CURTAINS[(r() * CURTAINS.length) | 0];
        ctx.fillStyle = X.css(X.shade(cc, -0.1), 0.85);
        const cw = gw * (0.2 + r() * 0.2),
          cr = cw * (0.6 + r() * 0.6);
        ctx.fillRect(gx, gy, cw, gh);
        ctx.fillRect(gx + gw - cr, gy, cw * 1.2, gh);
        if (mc) {
          mc.fillStyle = "rgb(10,0,0)";
          mc.fillRect(gx, gy, cw, gh);
          mc.fillRect(gx + gw - cr, gy, cw * 1.2, gh);
        }
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        for (let xx = gx; xx < gx + gw; xx += 4) ctx.fillRect(xx, gy, 1, gh);
      }
      // grime film + cracks
      const grime = 0.15 + r() * 0.2;
      ctx.fillStyle = X.css("#5a4a30", grime);
      ctx.fillRect(gx, gy + gh * 0.6, gw, gh * 0.4);
      if (mc) {
        mc.fillStyle = "rgba(0,0,0," + (grime * 0.9).toFixed(3) + ")";
        mc.fillRect(gx, gy + gh * 0.6, gw, gh * 0.4);
      } // grime film: less see-through
      if (r() < (o.crack === undefined ? 0.2 : o.crack))
        crackPane(ctx, r, gx, gy, gw, gh);
      hc.fillStyle = "#404040";
      hc.fillRect(gx, gy, gw, gh);
    }
    ctx.restore();
    if (mc) mc.restore();
    // --- sash frames & muntins ---
    if (state !== "boarded" && state !== "empty" && state !== "burnt") {
      const [pc, pr] = o.panes || [1, 2];
      ctx.strokeStyle = X.css(frame);
      ctx.lineWidth = Math.max(1.5, w * 0.035);
      hc.strokeStyle = "#707070";
      hc.lineWidth = ctx.lineWidth;
      if (mc) {
        mc.strokeStyle = MK_NONE;
        mc.lineWidth = ctx.lineWidth;
      }
      const gs = mc ? [ctx, hc, mc] : [ctx, hc];
      const miss = state === "broken";
      for (let i = 1; i < pc; i++) {
        if (miss && r() < 0.4) continue;
        const xx = gx + (gw * i) / pc;
        for (const g of gs) {
          g.beginPath();
          g.moveTo(xx, gy);
          g.lineTo(xx, gy + gh);
          g.stroke();
        }
      }
      for (let j = 1; j < pr; j++) {
        if (miss && r() < 0.4) continue;
        const yy = gy + (gh * j) / pr;
        for (const g of gs) {
          g.beginPath();
          g.moveTo(gx, yy);
          g.lineTo(gx + gw, yy);
          g.stroke();
        }
      }
      if (o.sash) {
        ctx.lineWidth = Math.max(2.5, w * 0.06);
        ctx.beginPath();
        ctx.moveTo(gx, gy + gh * 0.5);
        ctx.lineTo(gx + gw, gy + gh * 0.5);
        ctx.stroke();
        if (mc) {
          mc.lineWidth = ctx.lineWidth;
          mc.beginPath();
          mc.moveTo(gx, gy + gh * 0.5);
          mc.lineTo(gx + gw, gy + gh * 0.5);
          mc.stroke();
        }
      }
      ctx.lineWidth = Math.max(2, w * 0.05);
      path(ctx, reveal * 0.8);
      ctx.stroke();
      if (mc) {
        mc.lineWidth = ctx.lineWidth;
        path(mc, reveal * 0.8);
        mc.stroke();
      }
      // peeling paint on frames
      ctx.fillStyle = "rgba(60,40,25,0.5)";
      for (let k = 0; k < 4; k++)
        ctx.fillRect(gx + r() * gw, gy + r() * gh, 2 + r() * 3, 1.5);
    }
    // --- 1950s window air-conditioner ---
    if (o.ac && state !== "boarded") {
      const aw = w * 0.62,
        ah = h * 0.2,
        ax = x + (w - aw) / 2,
        ay = y + h * 0.62;
      ctx.fillStyle = "#8c8a80";
      ctx.fillRect(ax, ay, aw, ah);
      if (mc) {
        mc.fillStyle = MK_NONE;
        mc.fillRect(ax, ay, aw, ah + 3);
      }
      ctx.fillStyle = "#5a5850";
      for (let yy = ay + 3; yy < ay + ah - 2; yy += 3)
        ctx.fillRect(ax + 3, yy, aw - 6, 1.2);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(ax, ay + ah, aw, 3);
      ctx.fillStyle = "rgba(110,50,20,0.45)";
      ctx.fillRect(ax + aw * 0.3, ay + ah, 3, h * 0.35); // rust drip
      hc.fillStyle = "#e0e0e0";
      hc.fillRect(ax, ay, aw, ah);
    }
    // soot plume above a burnt window
    if (state === "burnt") {
      const sg = ctx.createRadialGradient(
        x + w / 2,
        y,
        2,
        x + w / 2,
        y - h * 0.3,
        h * 0.9,
      );
      sg.addColorStop(0, "rgba(8,6,4,0.85)");
      sg.addColorStop(0.5, "rgba(15,12,10,0.4)");
      sg.addColorStop(1, "rgba(20,18,15,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(x - w * 0.1, y + h * 0.3);
      ctx.quadraticCurveTo(x - w * 0.3, y - h * 0.6, x + w / 2, y - h * 1.1);
      ctx.quadraticCurveTo(x + w * 1.3, y - h * 0.6, x + w * 1.1, y + h * 0.3);
      ctx.closePath();
      ctx.fill();
    }
  }
  X.drawWindow = drawWindow;

  function pickState(r, weights) {
    const t = r();
    let acc = 0;
    for (const k in weights) {
      acc += weights[k];
      if (t < acc) return k;
    }
    return "intact";
  }
  /** Sill (raised stone ledge) with shadow below and dirty runoff streaks. */
  function sill(ctx, hc, x, y, w, t, col, r, streak) {
    ctx.fillStyle = X.css(col);
    ctx.fillRect(x, y, w, t);
    ctx.fillStyle = "rgba(255,250,235,0.25)";
    ctx.fillRect(x, y, w, 1.5);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(x + 1, y + t, w - 2, Math.max(2, t * 0.6));
    hc.fillStyle = "#e8e8e8";
    hc.fillRect(x, y, w, t);
    if (streak) {
      // runoff streaks from sill ends
      for (const sx of [x + 2, x + w * (0.3 + r() * 0.4), x + w - 4]) {
        if (r() < 0.4) continue;
        const len = 20 + r() * 60,
          g = ctx.createLinearGradient(0, y + t, 0, y + t + len);
        g.addColorStop(0, "rgba(25,20,14,0.45)");
        g.addColorStop(1, "rgba(25,20,14,0)");
        ctx.fillStyle = g;
        ctx.fillRect(sx - 2, y + t, 4 + r() * 5, len);
      }
    }
  }
  function lintel(ctx, hc, x, y, w, t, col, keystone) {
    ctx.fillStyle = X.css(col);
    ctx.fillRect(x, y, w, t);
    ctx.fillStyle = "rgba(255,250,235,0.22)";
    ctx.fillRect(x, y, w, 1.5);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(x, y + t, w, 2);
    hc.fillStyle = "#d8d8d8";
    hc.fillRect(x, y, w, t);
    if (keystone) {
      ctx.fillStyle = X.css(X.shade(col, 0.08));
      ctx.beginPath();
      ctx.moveTo(x + w / 2 - t * 0.5, y - 1);
      ctx.lineTo(x + w / 2 + t * 0.5, y - 1);
      ctx.lineTo(x + w / 2 + t * 0.35, y + t + 3);
      ctx.lineTo(x + w / 2 - t * 0.35, y + t + 3);
      ctx.closePath();
      ctx.fill();
      hc.fillStyle = "#f4f4f4";
      hc.fillRect(x + w / 2 - t * 0.4, y, t * 0.8, t + 3);
    }
  }
  /** Shared finishing: rain streaks, soot, bullet pocks, cracks, macro grime (tile-safe). */
  function weatherFacade(ctx, hc, w, h, r, amt, pocks) {
    if (curE && curE.snap) {
      markWallField(ctx, curE, w, h);
      curE.snap = null;
    }
    X.streaks(ctx, w, h, r, {
      count: 26,
      color: "#1a1610",
      alpha: 0.16 * amt,
      minLen: 30,
      maxLen: h * 0.5,
      maxW: 14,
    });
    X.blotches(ctx, w, h, r, {
      count: 10,
      color: "#15120e",
      alpha: 0.2 * amt,
      rmin: 30,
      rmax: 120,
    });
    X.blotches(ctx, w, h, r, {
      count: 4,
      color: "#dcd4c0",
      alpha: 0.08,
      rmin: 30,
      rmax: 90,
    });
    // bullet strikes: sweeps & scatters of varied calibre, soft craters in irregular spalls (no symmetric dot clusters)
    X.bulletStrikes(
      ctx,
      w,
      h,
      r,
      {
        count: pocks === undefined ? 3 : Math.ceil(pocks * 0.75),
        spread: 60,
        size: 1.1,
      },
      hc,
    );
    X.cracks(
      ctx,
      w,
      h,
      r,
      { count: 2, width: 0.8, seg: 5, steps: 30, color: "rgba(20,16,12,0.45)" },
      hc,
    );
    // soot/dirt gathers under every ledge line & at the bottom of each storey; top-lit so upper parts bleach
    X.streaks(ctx, w, h, r, {
      count: 40,
      color: "#241e16",
      alpha: 0.1 * amt,
      minLen: 10,
      maxLen: 80,
      minW: 2,
      maxW: 30,
    });
    X.macroGrime(ctx, w, h, 0.34 * amt, 900 + ((r() * 100) | 0));
    X.desaturate(ctx, w, h, 0.18);
  }

  // ------------------------------------------------------------------
  // Style generators
  // ------------------------------------------------------------------
  function makeCanvases(S) {
    const E = X.canvas(S.w / 2, S.h / 2);
    curE = E;
    E.ctx.fillStyle = "#000";
    E.ctx.fillRect(0, 0, E.w, E.h);
    // window mask at the same half resolution, drawn in full-res coordinates (scaled context)
    const Mk = X.canvas(S.w / 2, S.h / 2);
    Mk.ctx.fillStyle = MK_NONE;
    Mk.ctx.fillRect(0, 0, Mk.w, Mk.h);
    Mk.ctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
    E.m = Mk;
    E.ctx.txMask = Mk.ctx; // drawWindow finds the mask through the emissive context it is handed
    return E;
  }
  const baseWeights = {
    intact: 0.5,
    broken: 0.22,
    boarded: 0.1,
    burnt: 0.05,
    empty: 0.1,
    lit: 0.03,
  };
  // "Inhabited" variants (settlements, squats, walled market towns): far more boarded-up but lit rooms,
  // so a lived-in block reads as a cluster of warm windows at night. Variant index is 0-based here.
  const settledWeights = {
    intact: 0.36,
    broken: 0.12,
    boarded: 0.2,
    burnt: 0.04,
    empty: 0.06,
    lit: 0.22,
  };
  const INHABITED = {
    tenement: 3,
    brownstone: 2,
    artdeco: 3,
    office: -1,
    warehouse: -1,
  };
  const weightsFor = (style, v) =>
    INHABITED[style] === v ? settledWeights : baseWeights;

  function genTenement(v) {
    const pal = [
      { wall: "brick_red", trim: "#b8b09a", frame: "#d8d2c0" },
      { wall: "brick_tan", trim: "#d0c6ae", frame: "#3a4a3a" },
      { wall: "brick_brown", trim: "#9a9486", frame: "#e0dccc" },
      { wall: "brick_cream", trim: "#8a8474", frame: "#5a2a1e" },
    ][v];
    return function (ctx, w, h, r, hc, def) {
      const S = STYLES.tenement,
        E = makeCanvases(S);
      paintWall(ctx, 0, 0, w, h, pal.wall, r, 300 + v);
      const bw = w / S.bays,
        fh = h / S.floors;
      const beltEvery = v % 2 ? 3 : 0;
      for (let f = 0; f < S.floors; f++) {
        const y0 = f * fh;
        if (beltEvery && f % beltEvery === 0) {
          // continuous string course
          ctx.fillStyle = X.css(pal.trim);
          ctx.fillRect(0, y0 + fh - 8, w, 7);
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.fillRect(0, y0 + fh - 1, w, 3);
          hc.fillStyle = "#e0e0e0";
          hc.fillRect(0, y0 + fh - 8, w, 7);
        }
        for (let b = 0; b < S.bays; b++) {
          const ww = bw * 0.46,
            wh = fh * 0.58,
            x = b * bw + (bw - ww) / 2,
            y = y0 + fh * 0.2;
          const st = pickState(r, weightsFor("tenement", v));
          lintel(
            ctx,
            hc,
            x - 5,
            y - 9,
            ww + 10,
            8,
            pal.trim,
            v === 0 || v === 2,
          );
          drawWindow(ctx, hc, E.ctx, r, {
            x,
            y,
            w: ww,
            h: wh,
            state: st,
            panes: v === 1 ? [2, 4] : [1, 2],
            sash: true,
            frame: pal.frame,
            ac: st === "intact" && r() < 0.18,
          });
          sill(ctx, hc, x - 4, y + wh, ww + 8, 5, pal.trim, r, true);
        }
      }
      weatherFacade(ctx, hc, w, h, r, 1);
      storeE(def.name, E);
    };
  }
  function genArtdeco(v) {
    const pal = [
      {
        wall: "limestone",
        pier: "#c4bba2",
        spand: "#3a3a36",
        motif: "#8a7a50",
        frame: "#2a2a28",
      },
      {
        wall: "brick_tan",
        pier: "#b89c72",
        spand: "#8a5a3a",
        motif: "#c8a060",
        frame: "#3a3228",
      },
      {
        wall: "granite",
        pier: "#8e8882",
        spand: "#52585a",
        motif: "#a8acac",
        frame: "#1e2224",
      },
      {
        wall: "brick_dark",
        pier: "#5a4234",
        spand: "#2a2420",
        motif: "#b08a40",
        frame: "#1a1612",
      },
    ][v];
    return function (ctx, w, h, r, hc, def) {
      const S = STYLES.artdeco,
        E = makeCanvases(S);
      paintWall(ctx, 0, 0, w, h, pal.wall, r, 320 + v);
      const bw = w / S.bays,
        fh = h / S.floors;
      // continuous vertical piers between window columns (the deco "verticality")
      for (let b = 0; b <= S.bays; b++) {
        const px = b * bw - bw * 0.14,
          pw = bw * 0.28;
        X.wrap(w, h, px + pw / 2, h / 2, pw, (cx) => {
          const g = ctx.createLinearGradient(cx - pw / 2, 0, cx + pw / 2, 0);
          g.addColorStop(0, X.css(X.shade(pal.pier, 0.15)));
          g.addColorStop(0.35, X.css(pal.pier));
          g.addColorStop(1, X.css(X.shade(pal.pier, -0.3)));
          ctx.fillStyle = g;
          ctx.globalAlpha = 0.9;
          ctx.fillRect(cx - pw / 2, 0, pw, h);
          ctx.globalAlpha = 1;
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.fillRect(cx - 1, 0, 2, h); // fluting
          hc.fillStyle = "#e8e8e8";
          hc.fillRect(cx - pw / 2, 0, pw, h);
        });
      }
      for (let f = 0; f < S.floors; f++) {
        const y0 = f * fh;
        for (let b = 0; b < S.bays; b++) {
          const x = b * bw + bw * 0.16,
            ww = bw * 0.68,
            wh = fh * 0.6,
            y = y0 + fh * 0.08;
          // recessed spandrel panel with chevron/zigzag motif
          const sy = y + wh + 2,
            sh = fh - wh - fh * 0.08 - 4;
          ctx.fillStyle = X.css(pal.spand);
          ctx.fillRect(x, sy, ww, sh);
          hc.fillStyle = "#505050";
          hc.fillRect(x, sy, ww, sh);
          ctx.strokeStyle = X.css(pal.motif, 0.8);
          ctx.lineWidth = 2;
          const motif = v % 2;
          if (motif === 0) {
            for (let k = 0; k < 3; k++) {
              ctx.beginPath();
              const yy = sy + sh * (0.25 + k * 0.25);
              ctx.moveTo(x + 4, yy + 5);
              ctx.lineTo(x + ww / 2, yy - 5);
              ctx.lineTo(x + ww - 4, yy + 5);
              ctx.stroke();
            }
          } else {
            ctx.beginPath();
            for (let k = 0; k <= 8; k++) {
              const xx = x + 4 + (k * (ww - 8)) / 8,
                yy = sy + sh / 2 + (k % 2 ? -sh * 0.28 : sh * 0.28);
              if (!k) ctx.moveTo(xx, yy);
              else ctx.lineTo(xx, yy);
            }
            ctx.stroke();
            ctx.fillStyle = X.css(pal.motif, 0.7);
            ctx.fillRect(x + 4, sy + 3, ww - 8, 2);
            ctx.fillRect(x + 4, sy + sh - 5, ww - 8, 2);
          }
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fillRect(x, sy, ww, 3);
          const st = pickState(r, weightsFor("artdeco", v));
          drawWindow(ctx, hc, E.ctx, r, {
            x,
            y,
            w: ww,
            h: wh,
            state: st,
            panes: [2, 3],
            frame: pal.frame,
            reveal: 5,
          });
        }
      }
      weatherFacade(ctx, hc, w, h, r, 1);
      storeE(def.name, E);
    };
  }
  function genBrownstone(v) {
    const pal = [
      { wall: "brownstone", trim: "#6a4636", frame: "#2a1e18" },
      { wall: "brick_red", trim: "#5a3a2c", frame: "#e0dccc" },
      { wall: "stucco", trim: "#7a7266", frame: "#2c3a30" },
    ][v];
    return function (ctx, w, h, r, hc, def) {
      const S = STYLES.brownstone,
        E = makeCanvases(S);
      paintWall(ctx, 0, 0, w, h, pal.wall, r, 340 + v);
      const bw = w / S.bays,
        fh = h / S.floors;
      for (let f = 0; f < S.floors; f++) {
        const y0 = f * fh;
        for (let b = 0; b < S.bays; b++) {
          const ww = bw * 0.5,
            wh = fh * 0.62,
            x = b * bw + (bw - ww) / 2,
            y = y0 + fh * 0.2;
          // carved pediment / eyebrow lintel
          ctx.fillStyle = X.css(pal.trim);
          ctx.beginPath();
          ctx.moveTo(x - 10, y - 6);
          ctx.lineTo(x + ww + 10, y - 6);
          ctx.lineTo(x + ww + 6, y - 20);
          ctx.lineTo(x - 6, y - 20);
          ctx.closePath();
          ctx.fill();
          if (f % 2 === 0) {
            ctx.beginPath();
            ctx.moveTo(x - 8, y - 20);
            ctx.lineTo(x + ww / 2, y - 34);
            ctx.lineTo(x + ww + 8, y - 20);
            ctx.closePath();
            ctx.fill();
          }
          ctx.fillStyle = "rgba(255,240,220,0.15)";
          ctx.fillRect(x - 6, y - 20, ww + 12, 2);
          ctx.fillStyle = "rgba(0,0,0,0.45)";
          ctx.fillRect(x - 10, y - 6, ww + 20, 3);
          hc.fillStyle = "#f0f0f0";
          hc.fillRect(x - 10, y - 20, ww + 20, 14);
          const st = pickState(
            r,
            INHABITED.brownstone === v
              ? settledWeights
              : {
                  intact: 0.5,
                  broken: 0.2,
                  boarded: 0.16,
                  burnt: 0.04,
                  empty: 0.06,
                  lit: 0.04,
                },
          );
          drawWindow(ctx, hc, E.ctx, r, {
            x,
            y,
            w: ww,
            h: wh,
            state: st,
            panes: [2, 4],
            sash: true,
            frame: pal.frame,
            arch: v === 1 && f % 2 === 1,
            ac: st === "intact" && r() < 0.15,
          });
          sill(ctx, hc, x - 6, y + wh, ww + 12, 7, pal.trim, r, true);
          // decorative iron window-box bracket (dead plants) occasionally
          if (r() < 0.12) {
            ctx.fillStyle = "#2a2420";
            ctx.fillRect(x, y + wh + 7, ww, 8);
            ctx.fillStyle = "#5a4a30";
            for (let k = 0; k < 6; k++)
              ctx.fillRect(x + 3 + (k * ww) / 6, y + wh + 1, 1.5, 7);
          }
        }
      }
      weatherFacade(ctx, hc, w, h, r, 1.1);
      storeE(def.name, E);
    };
  }
  function genWarehouse(v) {
    const pal = [
      { wall: "brick_red", trim: "#6a2c20", frame: "#2a2a28" },
      { wall: "brick_brown", trim: "#4a3226", frame: "#3a2a20" },
    ][v];
    return function (ctx, w, h, r, hc, def) {
      const S = STYLES.warehouse,
        E = makeCanvases(S);
      paintWall(ctx, 0, 0, w, h, pal.wall, r, 360 + v);
      const bw = w / S.bays,
        fh = h / S.floors;
      // brick pilasters
      for (let b = 0; b <= S.bays; b++) {
        X.wrap(w, h, b * bw, h / 2, 20, (cx) => {
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.fillRect(cx + 10, 0, 4, h);
          ctx.fillStyle = "rgba(255,230,210,0.06)";
          ctx.fillRect(cx - 12, 0, 22, h);
          hc.fillStyle = "#d0d0d0";
          hc.fillRect(cx - 12, 0, 24, h);
        });
      }
      for (let f = 0; f < S.floors; f++) {
        const y0 = f * fh;
        for (let b = 0; b < S.bays; b++) {
          const ww = bw * 0.7,
            wh = fh * 0.62,
            x = b * bw + (bw - ww) / 2,
            y = y0 + fh * 0.18;
          // segmental arch of soldier bricks
          ctx.fillStyle = X.css(pal.trim);
          ctx.beginPath();
          ctx.moveTo(x - 4, y + 6);
          ctx.quadraticCurveTo(x + ww / 2, y - 18, x + ww + 4, y + 6);
          ctx.lineTo(x + ww + 4, y + 14);
          ctx.quadraticCurveTo(x + ww / 2, y - 8, x - 4, y + 14);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.3)";
          ctx.lineWidth = 1;
          for (let k = 0; k <= 14; k++) {
            const t = k / 14,
              ax = x - 4 + t * (ww + 8),
              ay = y + 6 - Math.sin(t * Math.PI) * 12;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax, ay + 8);
            ctx.stroke();
          }
          // steel multi-pane factory sash: many individual panes broken/missing/painted
          ctx.fillStyle = "#3a3e3a";
          ctx.fillRect(x, y + 8, ww, wh - 8);
          const pc = 6,
            pr = 5,
            pw = ww / pc,
            ph = (wh - 8) / pr;
          // one sheet of wired/frosted glass reflecting the sky across the whole sash, then individual panes
          const gl = ctx.createLinearGradient(x, y + 8, x + ww * 0.5, y + wh);
          gl.addColorStop(0, "#8a968c");
          gl.addColorStop(0.5, "#5e6a64");
          gl.addColorStop(1, "#3a4440");
          // damage clusters: a few adjacent panes knocked out together (thrown bricks), not uniform noise
          const hole =
            r() < 0.55
              ? [(r() * pc) | 0, (r() * pr) | 0, 0.8 + r() * 1.4]
              : null;
          const painted = r() < 0.3; // whole lower rows painted over (blackout paint, 1940s)
          for (let i = 0; i < pc; i++)
            for (let j = 0; j < pr; j++) {
              const px = x + i * pw,
                py = y + 8 + j * ph,
                t = r();
              const dh = hole
                ? Math.hypot(i - hole[0], (j - hole[1]) * 1.3)
                : 99;
              let mk = MK_WIRED;
              if (dh < hole?.[2] || t < 0.04) {
                ctx.fillStyle = "#16140f";
                mk = MK_HOLE;
              } // missing
              else if (painted && j >= pr - 2) {
                ctx.fillStyle = "#5c6254";
                mk = MK_NONE;
              } // painted-over
              else if (t < 0.07) {
                ctx.fillStyle = "#6a5a44";
                mk = MK_NONE;
              } // plywood patch
              else {
                ctx.fillStyle = gl;
              }
              ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);
              E.m.ctx.fillStyle = mk;
              E.m.ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);
              if (ctx.fillStyle !== "#16140f" && r() < 0.12) {
                ctx.strokeStyle = "rgba(230,235,225,0.5)";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(px + 1, py + r() * ph);
                ctx.lineTo(px + pw - 1, py + r() * ph);
                ctx.stroke();
              }
              if (r() < 0.25) {
                ctx.fillStyle = "rgba(60,50,35,0.25)";
                ctx.fillRect(px + 1, py + ph * 0.5, pw - 2, ph * 0.5 - 1);
              } // grime
            }
          ctx.strokeStyle = X.css(pal.frame);
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y + 8, ww, wh - 8);
          hc.fillStyle = "#404040";
          hc.fillRect(x, y + 8, ww, wh - 8);
          // lit factory window glow (rare)
          if (r() < 0.03) {
            E.ctx.fillStyle = "#ffc070";
            E.ctx.fillRect(x / 2, (y + 8) / 2, ww / 2, (wh - 8) / 2);
            ctx.fillStyle = "rgba(255,190,110,0.5)";
            ctx.fillRect(x, y + 8, ww, wh - 8);
          }
          sill(ctx, hc, x - 3, y + wh, ww + 6, 6, "#8a8272", r, true);
        }
        // faded painted band
        if (v === 0 && f === 0) {
          ctx.fillStyle = "rgba(210,200,180,0.12)";
          ctx.fillRect(0, y0 + fh * 0.02, w, fh * 0.1);
        }
      }
      weatherFacade(ctx, hc, w, h, r, 1.2);
      storeE(def.name, E);
    };
  }
  function genOffice(v) {
    const pal = [
      { mull: "#a8aca8", spand: "#3e7a7a", glass: 1 }, // 50s teal spandrel curtain wall
      { mull: "#6a6e6c", spand: "#8a8a82", glass: 1 }, // grey aluminium
      { mull: "#c0bcb0", spand: "#a09a8a", glass: 0 }, // ribbon windows between concrete bands
    ][v];
    return function (ctx, w, h, r, hc, def) {
      const S = STYLES.office,
        E = makeCanvases(S);
      paintWall(ctx, 0, 0, w, h, v === 2 ? "concrete" : "stucco", r, 380 + v);
      const bw = w / S.cols,
        fh = h / S.floors;
      const blast = [r(), r()];
      let run = 0,
        dress = null;
      for (let f = 0; f < S.floors; f++) {
        const y0 = f * fh,
          wh = fh * (v === 2 ? 0.5 : 0.64),
          sp = fh - wh;
        // spandrel band
        const sg = ctx.createLinearGradient(0, y0 + wh, 0, y0 + fh);
        sg.addColorStop(0, X.css(X.shade(pal.spand, 0.1)));
        sg.addColorStop(1, X.css(X.shade(pal.spand, -0.2)));
        ctx.fillStyle = sg;
        ctx.fillRect(0, y0 + wh, w, sp);
        hc.fillStyle = v === 2 ? "#e0e0e0" : "#8a8a8a";
        hc.fillRect(0, y0 + wh, w, sp);
        for (let b = 0; b < S.cols; b++) {
          const x = b * bw,
            t = r();
          // panel tone variation + missing spandrel panels exposing structure
          if (v !== 2 && r() < 0.08) {
            ctx.fillStyle = "#1a1814";
            ctx.fillRect(x + 2, y0 + wh + 2, bw - 4, sp - 4);
            ctx.fillStyle = "#4a3a2a";
            ctx.fillRect(x + bw * 0.45, y0 + wh + 2, 3, sp - 4);
          } else {
            ctx.fillStyle = X.css(r() < 0.5 ? "#000" : "#fff", r() * 0.08);
            ctx.fillRect(x, y0 + wh, bw, sp);
          }
          // damage clusters around a blast point instead of uniform salt-and-pepper breakage (~35% overall)
          const dx = (b + 0.5) / S.cols - blast[0],
            dy = (f + 0.5) / S.floors - blast[1];
          const near = Math.exp(-(dx * dx * 24 + dy * dy * 14));
          const pb = 0.05 + near * 0.45;
          // a blown-out curtain-wall pane is mostly just an empty frame; only some keep jagged shards
          const st =
            t < pb
              ? r() < 0.12
                ? "burnt"
                : r() < 0.55
                  ? "empty"
                  : "broken"
              : t < pb + 0.04
                ? "boarded"
                : t < pb + 0.065
                  ? "lit"
                  : t < pb + 0.1
                    ? "empty"
                    : "intact";
          // tenants: runs of 3–8 windows share blinds (at about the same height) or bare glass — a calm, dusty curtain wall
          // instead of a mosaic of random cells
          if (run-- <= 0) {
            run = 2 + ((r() * 6) | 0);
            const k = r();
            dress = {
              kind: k < 0.3 ? "blind" : k < 0.36 ? "curtain" : "none",
              level: 0.12 + r() * 0.4,
              col: r() < 0.6 ? "#b8ae92" : "#a09a88",
            };
          }
          drawWindow(ctx, hc, E.ctx, r, {
            x: x + 1,
            y: y0 + 1,
            w: bw - 2,
            h: wh - 1,
            state: st,
            panes: [1, 1],
            frame: pal.mull,
            reveal: 2,
            crack: 0.1 + near * 0.3,
            dress,
          });
        }
        // mullions
        for (let b = 0; b <= S.cols; b++) {
          ctx.fillStyle = X.css(pal.mull);
          ctx.fillRect(b * bw - 2, y0, 4, wh);
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(b * bw + 2, y0, 2, wh);
          hc.fillStyle = "#c0c0c0";
          hc.fillRect(b * bw - 2, y0, 4, wh);
        }
        ctx.fillStyle = X.css(pal.mull);
        ctx.fillRect(0, y0 + wh - 2, w, 4);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, y0 + wh + 2, w, 3);
      }
      weatherFacade(ctx, hc, w, h, r, 0.9);
      storeE(def.name, E);
    };
  }

  const GENS = {
    tenement: genTenement,
    artdeco: genArtdeco,
    brownstone: genBrownstone,
    warehouse: genWarehouse,
    office: genOffice,
  };
  for (const s in STYLES) {
    const S = STYLES[s];
    for (let v = 0; v < S.variants; v++) {
      X.def("facade_" + s + "_" + (v + 1), {
        w: S.w,
        h: S.h,
        normal: 2.2,
        normalStep: 2,
        rough: 0.86,
        seed: v * 7919,
        meters: S.bays * S.bayW,
        metersV: S.floors * S.floorH,
        facade: {
          tileW: S.bays * S.bayW,
          tileH: S.floors * S.floorH,
          bays: S.bays,
          floors: S.floors,
          bayW: S.bayW,
          floorH: S.floorH,
          top: "facade_" + s + "_top",
          base: "facade_" + s + "_base",
          trimH: S.floorH,
          inhabited: INHABITED[s] === v,
        },
        desc:
          s + " facade tile (" + S.bays + " bays × " + S.floors + " floors)",
        gen: GENS[s](v),
      });
    }
  }

  // ==================================================================
  // TRIM STRIPS (non-repeating vertically): facade_<style>_top / _base
  // 512×128 = 14 m × 3.5 m (same px/m as the facade tiles), tileable in U only.
  //   _top  : cornice / parapet crown for the last storey (brackets, dentils, corbels, coping)
  //   _base : ground-floor band (rusticated stone, stoop & areaway, loading docks, granite plinth)
  // Listed in G.tex.facadeInfo(style).top/.base; material via G.mats.facadeTrim(style, 'top'|'base').
  // ==================================================================
  function rustication(ctx, hc, x0, y0, w, h, col, course, r) {
    ctx.fillStyle = X.css(X.shade(col, -0.55));
    ctx.fillRect(x0, y0, w, h); // deep channel joints
    hc.fillStyle = "#202020";
    hc.fillRect(x0, y0, w, h);
    for (let y = y0; y < y0 + h; y += course) {
      const off = (((y - y0) / course) | 0) % 2 ? course * 1.3 : 0;
      for (let x = x0 - off; x < x0 + w; x += course * 2.6) {
        const g = ctx.createLinearGradient(0, y, 0, y + course);
        g.addColorStop(0, X.css(X.shade(col, 0.12)));
        g.addColorStop(1, X.css(X.shade(col, -0.12 - r() * 0.1)));
        ctx.fillStyle = g;
        ctx.fillRect(x + 2, y + 2, course * 2.6 - 4, course - 4);
        ctx.fillStyle = "rgba(255,248,230,0.18)";
        ctx.fillRect(x + 2, y + 2, course * 2.6 - 4, 2); // lit top arris
        hc.fillStyle = "#d0d0d0";
        hc.fillRect(x + 2, y + 2, course * 2.6 - 4, course - 4);
      }
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(x0, y + course - 2, w, 2);
      hc.fillStyle = "#303030";
      hc.fillRect(x0, y + course - 3, w, 3);
    }
  }
  function brackets(ctx, hc, y, h, n, col, w, scroll) {
    for (let k = 0; k < n; k++) {
      const bx = ((k + 0.5) * w) / n;
      ctx.fillStyle = X.css(col);
      ctx.beginPath();
      if (scroll) {
        // console bracket: wide head tapering to a curled scroll foot
        ctx.moveTo(bx - 10, y);
        ctx.lineTo(bx + 10, y);
        ctx.lineTo(bx + 9, y + h * 0.25);
        ctx.quadraticCurveTo(bx + 4, y + h * 0.5, bx + 7, y + h * 0.78);
        ctx.arc(bx + 1, y + h * 0.82, 6, 0, Math.PI * 1.6);
        ctx.quadraticCurveTo(bx - 7, y + h * 0.45, bx - 9, y + h * 0.25);
        ctx.closePath();
      } else ctx.rect(bx - 5, y, 10, h);
      ctx.fill();
      ctx.fillStyle = "rgba(255,245,225,0.22)";
      ctx.fillRect(bx - 9, y, 4, h * 0.6);
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(bx + 10, y + 2, 5, h * 0.85); // cast shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(bx + 4, y, 3, h * 0.9);
      hc.fillStyle = "#f0f0f0";
      hc.fillRect(bx - 6, y, 12, h);
    }
  }
  function dentils(ctx, hc, y, h, col, w) {
    for (let x = 2; x < w; x += 12) {
      ctx.fillStyle = X.css(col);
      ctx.fillRect(x, y, 7, h);
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(x + 7, y, 5, h);
      hc.fillStyle = "#e8e8e8";
      hc.fillRect(x, y, 7, h);
    }
  }
  function ledge(ctx, hc, y, h, col, w) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, X.css(X.shade(col, 0.25)));
    g.addColorStop(0.5, X.css(col));
    g.addColorStop(1, X.css(X.shade(col, -0.35)));
    ctx.fillStyle = g;
    ctx.fillRect(0, y, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, y + h, w, Math.max(3, h * 0.4));
    hc.fillStyle = "#ffffff";
    hc.fillRect(0, y, w, h);
  }
  function rustRuns(ctx, y, w, h, r, n) {
    for (let k = 0; k < n; k++) {
      const x = r() * w,
        len = h * (0.3 + r() * 0.7),
        g = ctx.createLinearGradient(0, y, 0, y + len);
      g.addColorStop(0, "rgba(110,55,20,0.55)");
      g.addColorStop(1, "rgba(110,55,20,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, 2 + r() * 4, len);
    }
  }
  const TRIM_WALL = {
    tenement: ["brick_red", "brick_tan", "brick_brown", "brick_cream"],
    artdeco: ["limestone", "brick_tan", "granite", "brick_dark"],
    brownstone: ["brownstone", "brick_red", "stucco"],
    warehouse: ["brick_red", "brick_brown"],
    office: ["stucco", "stucco", "concrete"],
  };
  function genTrim(style, part) {
    return function (ctx, w, h, r, hc) {
      const wall = TRIM_WALL[style][0];
      paintWall(
        ctx,
        0,
        0,
        w,
        h,
        part === "base" && style !== "warehouse"
          ? style === "artdeco" || style === "office"
            ? "granite"
            : style === "brownstone"
              ? "brownstone"
              : "limestone"
          : wall,
        r,
        700 + (part === "top" ? 1 : 2) + style.length,
      );
      if (part === "top") {
        if (style === "tenement") {
          // pressed-metal cornice: crown moulding, modillion brackets, dentils, frieze
          ctx.fillStyle = "#6a6a62";
          ctx.fillRect(0, 0, w, 58);
          hc.fillStyle = "#e0e0e0";
          hc.fillRect(0, 0, w, 58);
          ledge(ctx, hc, 0, 16, "#8a8a80", w);
          brackets(ctx, hc, 16, 30, 16, "#7a7a72", w, true);
          dentils(ctx, hc, 46, 8, "#8a8a80", w);
          ctx.fillStyle = "#5a5a52";
          ctx.fillRect(0, 54, w, 6);
          rustRuns(ctx, 58, w, 60, r, 14);
          for (let x = 16; x < w; x += 64) {
            ctx.fillStyle = "rgba(200,190,160,0.35)";
            ctx.fillRect(x, 74, 36, 22);
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.strokeRect(x, 74, 36, 22);
          } // frieze panels
        } else if (style === "artdeco") {
          // stepped parapet + zigzag frieze + fluted pier tops
          ctx.fillStyle = "#c4bba2";
          for (let k = 0; k < 8; k++) {
            const x = k * 64;
            ctx.fillRect(x + 8, 0, 48, 20);
            ctx.fillRect(x + 16, 0, 32, 10);
          }
          ledge(ctx, hc, 20, 10, "#c4bba2", w);
          ctx.fillStyle = "#3a3a36";
          ctx.fillRect(0, 36, w, 34);
          hc.fillStyle = "#606060";
          hc.fillRect(0, 36, w, 34);
          ctx.strokeStyle = "#b09050";
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 16) ctx.lineTo(x, x % 32 ? 40 : 66);
          ctx.stroke();
          ctx.fillStyle = "#b09050";
          ctx.fillRect(0, 36, w, 3);
          ctx.fillRect(0, 67, w, 3);
          for (let k = 0; k <= 4; k++) {
            const x = (k * w) / 4;
            ctx.fillStyle = "#d0c8b0";
            ctx.fillRect(x - 18, 70, 36, h - 70);
            ctx.fillStyle = "rgba(0,0,0,0.15)";
            for (let f = -12; f <= 12; f += 6)
              ctx.fillRect(x + f, 74, 2, h - 74);
            hc.fillStyle = "#e8e8e8";
            hc.fillRect(x - 18, 70, 36, h - 70);
          }
        } else if (style === "brownstone") {
          // Italianate bracketed cornice
          ctx.fillStyle = "#3a2a22";
          ctx.fillRect(0, 0, w, 64);
          hc.fillStyle = "#e0e0e0";
          hc.fillRect(0, 0, w, 64);
          ledge(ctx, hc, 0, 14, "#5a4034", w);
          brackets(ctx, hc, 14, 44, 8, "#4a3228", w, true);
          for (let k = 0; k < 8; k++) {
            const x = k * 64 + 12;
            ctx.fillStyle = "rgba(120,90,70,0.5)";
            ctx.fillRect(x + 12, 22, 16, 26);
          } // recessed panels between brackets
          ctx.fillStyle = "#2a1e18";
          ctx.fillRect(0, 58, w, 8);
          rustRuns(ctx, 66, w, 50, r, 8);
        } else if (style === "warehouse") {
          // corbelled brick table + ghost sign
          for (let k = 0; k < 3; k++) {
            ctx.fillStyle = "rgba(0,0,0," + (0.18 + k * 0.08) + ")";
            ctx.fillRect(0, 22 + k * 9, w, 3);
          }
          for (let x = 0; x < w; x += 32) {
            ctx.fillStyle = "#6a2c20";
            ctx.fillRect(x + 4, 22, 24, 30);
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            ctx.fillRect(x + 4, 52, 24, 4);
            hc.fillStyle = "#e0e0e0";
            hc.fillRect(x + 4, 22, 24, 30);
          }
          ctx.fillStyle = "#8a8272";
          ctx.fillRect(0, 0, w, 10);
          hc.fillStyle = "#f0f0f0";
          hc.fillRect(0, 0, w, 10); // stone coping
          const ghost = [
            "STORAGE",
            "FIREPROOF",
            "& SONS",
            "WAREHOUSE",
            "MOVING",
          ][(r() * 5) | 0];
          X.text(ctx, ghost, w * 0.5, 92, {
            font: "impact",
            size: 44,
            color: "rgba(230,220,190,0.22)",
            spacing: 10,
            maxW: w * 0.9,
            noSafe: true,
          });
        } else {
          // office: aluminium coping + louvred mechanical band
          ledge(ctx, hc, 0, 10, "#a8aca8", w);
          ctx.fillStyle = "#4a4e4c";
          ctx.fillRect(0, 12, w, 60);
          hc.fillStyle = "#808080";
          hc.fillRect(0, 12, w, 60);
          for (let y = 16; y < 70; y += 5) {
            ctx.fillStyle = "rgba(0,0,0,0.45)";
            ctx.fillRect(0, y, w, 2);
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fillRect(0, y + 2, w, 1);
          }
          for (let x = 0; x < w; x += 64) {
            ctx.fillStyle = "#6a6e6c";
            ctx.fillRect(x, 12, 4, 60);
          }
          rustRuns(ctx, 72, w, 50, r, 10);
        }
      } else {
        // base
        if (style === "tenement") {
          // rusticated limestone base + water table
          rustication(ctx, hc, 0, 0, w, h - 18, "#a8a088", 22, r);
          ledge(ctx, hc, h - 20, 8, "#8a8474", w);
          ctx.fillStyle = "#5a564c";
          ctx.fillRect(0, h - 12, w, 12);
        } else if (style === "artdeco") {
          // polished granite plinth + bronze vent grilles
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#3a3a3c");
          g.addColorStop(1, "#1e1e20");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          X.speckle(ctx, w, h, r, {
            count: (w * h) / 25,
            colors: ["#8a8a8a", "#111", "#6a5a5a"],
            min: 0.3,
            max: 1,
            alpha: 0.5,
          });
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.fillRect(0, 0, w, 3);
          for (let x = 40; x < w; x += 128) {
            ctx.fillStyle = "#6a5228";
            ctx.fillRect(x, 60, 48, 36);
            ctx.fillStyle = "#2a2014";
            for (let k = 0; k < 6; k++) ctx.fillRect(x + 4, 64 + k * 5, 40, 2);
            hc.fillStyle = "#909090";
            hc.fillRect(x, 60, 48, 36);
          }
          for (let x = 0; x < w; x += 128) {
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(x, 0, 2, h);
          }
        } else if (style === "brownstone") {
          // rusticated basement + barred areaway windows + iron railing
          rustication(ctx, hc, 0, 0, w, h, "#5e4030", 20, r);
          for (let k = 0; k < 4; k++) {
            const x = k * 128 + 40,
              y = 36;
            drawWindow(ctx, hc, null, r, {
              x,
              y,
              w: 48,
              h: 40,
              state: r() < 0.5 ? "boarded" : "empty",
              panes: [2, 1],
              frame: "#1a1612",
              reveal: 4,
            });
            ctx.fillStyle = "#1a1612";
            for (let b = 0; b < 6; b++)
              ctx.fillRect(x + 3 + b * 8, y - 2, 2.5, 44);
          }
          ctx.fillStyle = "#141210";
          ctx.fillRect(0, h - 30, w, 3);
          for (let x = 0; x < w; x += 10) {
            ctx.fillRect(x, h - 30, 2, 30);
            ctx.beginPath();
            ctx.moveTo(x - 2, h - 30);
            ctx.lineTo(x + 1, h - 37);
            ctx.lineTo(x + 4, h - 30);
            ctx.fill();
          }
          hc.fillStyle = "#202020";
          hc.fillRect(0, h - 30, w, 3);
        } else if (style === "warehouse") {
          // loading docks: roll-up doors + concrete dock edge
          ctx.fillStyle = "#6e6a60";
          ctx.fillRect(0, h - 22, w, 22);
          hc.fillStyle = "#d0d0d0";
          hc.fillRect(0, h - 22, w, 22);
          for (let k = 0; k < 2; k++) {
            const x = k * 256 + 50,
              dw = 156,
              dy = 8,
              dh = h - 30;
            ctx.fillStyle = "#1a1814";
            ctx.fillRect(x - 6, dy - 4, dw + 12, dh + 4);
            const g = ctx.createLinearGradient(0, dy, 0, dy + dh);
            g.addColorStop(0, "#6e7068");
            g.addColorStop(1, "#4a4a44");
            const open = r() < 0.35 ? dh * (0.3 + r() * 0.5) : 0;
            ctx.fillStyle = g;
            ctx.fillRect(x, dy, dw, dh - open);
            for (let y = dy; y < dy + dh - open; y += 6) {
              ctx.fillStyle = "rgba(0,0,0,0.3)";
              ctx.fillRect(x, y, dw, 2);
              hc.fillStyle = "#808080";
              hc.fillRect(x, y, dw, 3);
            }
            if (open) {
              ctx.fillStyle = "#0c0a08";
              ctx.fillRect(x, dy + dh - open, dw, open);
            }
            X.blotches(ctx, w, h, r, {
              count: 3,
              color: "#6a3010",
              alpha: 0.3,
              rmin: 8,
              rmax: 24,
            });
            ctx.fillStyle = "#c8a020";
            for (let q = 0; q < 8; q++) {
              ctx.fillStyle = q % 2 ? "#1a1a18" : "#c8a020";
              ctx.fillRect(x + (q * dw) / 8, dy + dh, dw / 8, 6);
            }
          }
        } else {
          // office: dark granite + lobby glass band
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#2e3030");
          g.addColorStop(1, "#1a1c1c");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          for (let x = 0; x < w; x += 64)
            drawWindow(ctx, hc, null, r, {
              x: x + 3,
              y: 12,
              w: 58,
              h: h - 34,
              state: r() < 0.3 ? "empty" : r() < 0.4 ? "boarded" : "intact",
              panes: [1, 1],
              frame: "#a8aca8",
              reveal: 2,
            });
          ctx.fillStyle = "#a8aca8";
          ctx.fillRect(0, 8, w, 4);
          ctx.fillRect(0, h - 22, w, 4);
        }
      }
      weatherFacade(ctx, hc, w, h, r, part === "base" ? 0.9 : 0.8, 1);
      if (part === "base") {
        const bg = ctx.createLinearGradient(0, h - 50, 0, h);
        bg.addColorStop(0, "rgba(40,32,22,0)");
        bg.addColorStop(1, "rgba(40,32,22,0.6)");
        ctx.fillStyle = bg;
        ctx.fillRect(0, h - 50, w, 50);
      }
    };
  }
  for (const st in STYLES) {
    for (const part of ["top", "base"]) {
      X.def("facade_" + st + "_" + part, {
        w: 512,
        h: 128,
        normal: 2.4,
        normalStep: 1,
        rough: 0.85,
        meters: TILE.bays * TILE.bayW,
        metersV: TILE.floorH,
        macro: 0.7,
        desc:
          st +
          " " +
          (part === "top" ? "cornice/parapet" : "ground-floor") +
          " trim strip (14 m × 3.5 m, tiles in U)",
        gen: genTrim(st, part),
      });
    }
  }

  /**
   * Emissive (lit-window) texture for a facade name, or null. Static: night brightness is driven by the
   * material's emissiveIntensity through the clone-safe glow driver in 90_api.js (userData.txGlow), so no
   * per-dusk canvas redraws / re-uploads are needed and clones made by other modules glow too.
   */
  X.facadeEmissive = function (name) {
    if (emissiveTex[name] !== undefined) return emissiveTex[name];
    G.tex.get(name);
    let src = emissiveCanvas[name];
    if (!src) {
      const d = X.GEN[name];
      if (d && X.paintSurface) {
        X.paintSurface(name, d);
        src = emissiveCanvas[name];
      }
    }
    if (!src) {
      emissiveTex[name] = null;
      return null;
    }
    const regen = () => {
      const d = X.GEN[name];
      wantE[name] = true;
      try {
        X.paintSurface(name, d);
      } finally {
        wantE[name] = false;
      }
      const c = emissiveCanvas[name];
      delete emissiveCanvas[name];
      return c;
    };
    const tex = X.toTexture(src, { name: name + "_e", regen });
    delete emissiveCanvas[name]; // the texture owns it now (and can drop/re-paint it)
    emissiveTex[name] = tex;
    return tex;
  };
  /**
   * Interior-mapping window mask for a facade name (half-res, linear, NoColorSpace), or null. See maskCanvas above.
   * Trimmed from CPU RAM after upload like every other texture; re-painted deterministically if ever needed again.
   */
  X.facadeMask = function (name) {
    if (maskTex[name] !== undefined) return maskTex[name];
    if (!X.GEN[name] || !X.GEN[name].facade) {
      maskTex[name] = null;
      return null;
    }
    G.tex.get(name);
    let src = maskCanvas[name];
    if (!src) {
      const d = X.GEN[name];
      wantM[name] = true;
      try {
        X.paintSurface(name, d);
      } finally {
        wantM[name] = false;
      }
      src = maskCanvas[name];
    }
    if (!src) {
      maskTex[name] = null;
      return null;
    }
    const regen = () => {
      const d = X.GEN[name];
      wantM[name] = true;
      try {
        X.paintSurface(name, d);
      } finally {
        wantM[name] = false;
      }
      const c = maskCanvas[name];
      delete maskCanvas[name];
      return c;
    };
    const tex = X.toTexture(src, { name: name + "_win", regen, srgb: false });
    delete maskCanvas[name];
    maskTex[name] = tex;
    return tex;
  };
  /**
   * Window placement inside one room cell (bay × storey) for the interior shader, in cell units [-1, 1] (y up):
   * [window half-width, sill y, head y, windows per cell]. Mirrors the generator geometry above (glass rect incl. reveal).
   */
  const WIN_RECT = {
    tenement: [0.42, -0.53, 0.56, 1],
    artdeco: [0.63, -0.33, 0.8, 1],
    brownstone: [0.45, -0.6, 0.56, 1],
    warehouse: [0.68, -0.58, 0.49, 1],
    office: [0.9, -0.25, 0.97, 2],
    office_3: [0.9, 0.03, 0.97, 2],
  };
  X.facadeWinRect = function (name) {
    const m = /^facade_([a-z]+)_(\d+)$/.exec(name || "");
    if (!m) return null;
    return (
      (m[1] === "office" && m[2] === "3"
        ? WIN_RECT.office_3
        : WIN_RECT[m[1]]) || null
    );
  };
  /** Procedural wall-detail parameters for a façade atlas: {a:[kind,cols,rows,stagger], b:[offU,offV,jointHalfW,relief]} or null. */
  X.facadeWallSpec = function (name) {
    const m = /^facade_([a-z]+)_(\d+)$/.exec(name || "");
    if (!m || !TRIM_WALL[m[1]]) return null;
    const wall = TRIM_WALL[m[1]][(+m[2] - 1) % TRIM_WALL[m[1]].length];
    const sp = WALL_SPEC[/^brick_/.test(wall) ? "brick" : wall];
    return sp ? { a: sp[0], b: sp[1] } : null;
  };
  /** Legacy no-op (night is handled by the material glow driver). */
  X.setFacadeNight = function () {};

  // ==================================================================
  // STOREFRONTS
  // ==================================================================
  const SHOPS = [
    {
      name: "DELICATESSEN",
      font: "didone",
      band: "#2a4a3a",
      ink: "#e8d8a0",
      state: "broken",
      sub: "KOSHER · SANDWICHES",
    },
    {
      name: "Pharmacy",
      font: "script",
      band: "#7a1e1a",
      ink: "#f0e6c8",
      state: "intact",
      sub: "PRESCRIPTIONS · SODA FOUNTAIN",
    },
    {
      name: "HARDWARE",
      font: "slab",
      band: "#1e2e4a",
      ink: "#e0c060",
      state: "shutter",
      sub: "TOOLS · PAINT · KEYS CUT",
    },
    {
      name: "PAWN SHOP",
      font: "impact",
      band: "#3a2a1a",
      ink: "#e8c040",
      state: "boarded",
      sub: "LOANS · GOLD · RADIOS",
    },
    {
      name: "Bar & Grill",
      font: "script",
      band: "#1a1a1a",
      ink: "#ff5a3a",
      state: "broken",
      sub: "COCKTAILS · STEAKS",
    },
    {
      name: "LONLY TV",
      font: "deco",
      band: "#2a2a4a",
      ink: "#f0d060",
      state: "intact",
      sub: "SALES · SERVICE · TUBES",
    },
    {
      name: "LAUNDROMAT",
      font: "rounded",
      band: "#3a7a8a",
      ink: "#f8f4e8",
      state: "shutter",
      sub: "COIN-OP · 24 HRS",
    },
    {
      name: "DINER",
      font: "deco",
      band: "#b02a22",
      ink: "#fff4d0",
      state: "broken",
      sub: "BREAKFAST ALL DAY",
    },
    {
      name: "Bakery",
      font: "script",
      band: "#6a4a2a",
      ink: "#f4e4c0",
      state: "boarded",
      sub: "CHOCOLATE ZEPPELINS SOLD HERE",
    },
    {
      name: "LIQUORS",
      font: "impact",
      band: "#2a3a1a",
      ink: "#e8e0c0",
      state: "broken",
      sub: "WINES · SPIRITS",
    },
    {
      name: "BOOKS",
      font: "serif",
      band: "#4a2a3a",
      ink: "#e8d8b0",
      state: "intact",
      sub: "NEW & USED · COMICS",
    },
    {
      name: "BARBER",
      font: "copper",
      band: "#e8e0d0",
      ink: "#9a1e1a",
      state: "shutter",
      sub: "SHAVE & A HAIRCUT",
    },
  ];
  X.SHOPS = SHOPS;

  function genStorefront(idx) {
    const shop = SHOPS[idx];
    return function (ctx, w, h, r, hc) {
      // stone / cast-iron surround
      paintWall(
        ctx,
        0,
        0,
        w,
        h,
        idx % 3 === 0 ? "limestone" : idx % 3 === 1 ? "granite" : "brick_red",
        r,
        400 + idx,
      );
      const pil = 26,
        bandY = 8,
        bandH = h * 0.2,
        baseY = h - h * 0.12;
      // pilasters (tileable: split across the left/right edge)
      for (const px of [0, w]) {
        const g = ctx.createLinearGradient(px - pil, 0, px + pil, 0);
        g.addColorStop(0, "#3a3834");
        g.addColorStop(0.5, "#6e6a62");
        g.addColorStop(1, "#2a2824");
        ctx.fillStyle = g;
        ctx.fillRect(px - pil, 0, pil * 2, h);
        hc.fillStyle = "#e0e0e0";
        hc.fillRect(px - pil, 0, pil * 2, h);
      }
      // sign band
      const sx = pil + 4,
        sw = w - pil * 2 - 8;
      ctx.fillStyle = X.css(shop.band);
      ctx.fillRect(sx, bandY, sw, bandH);
      ctx.strokeStyle = "rgba(210,190,140,0.6)";
      ctx.lineWidth = 3;
      ctx.strokeRect(sx + 4, bandY + 4, sw - 8, bandH - 8);
      X.text(ctx, shop.name, w / 2 + 2, bandY + bandH * 0.45 + 2, {
        font: shop.font,
        size: bandH * 0.62,
        maxW: sw - 30,
        color: "rgba(0,0,0,0.5)",
      });
      X.text(ctx, shop.name, w / 2, bandY + bandH * 0.45, {
        font: shop.font,
        size: bandH * 0.62,
        maxW: sw - 30,
        color: shop.ink,
      });
      X.text(ctx, shop.sub, w / 2, bandY + bandH * 0.84, {
        font: "condensed",
        size: bandH * 0.15,
        maxW: sw - 40,
        color: X.css(shop.ink, 0.85),
        weight: "bold",
        spacing: 2,
      });
      // sun-bleach and peel the sign
      X.wearPaint ? null : null;
      ctx.save();
      ctx.beginPath();
      ctx.rect(sx, bandY, sw, bandH);
      ctx.clip();
      ctx.fillStyle = "rgba(230,220,190,0.18)";
      ctx.fillRect(sx, bandY, sw, bandH);
      X.blotches(ctx, w, h, r, {
        count: 6,
        color: "#1a140e",
        alpha: 0.35,
        rmin: 10,
        rmax: 40,
      });
      for (let k = 0; k < 5; k++) {
        ctx.fillStyle = "rgba(90,80,60,0.7)";
        X.blobPath(
          ctx,
          sx + r() * sw,
          bandY + r() * bandH,
          5 + r() * 14,
          r,
          8,
          0.7,
        );
        ctx.fill();
      }
      ctx.restore();
      hc.fillStyle = "#a0a0a0";
      hc.fillRect(sx, bandY, sw, bandH);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(sx, bandY + bandH, sw, 4);
      // shop opening
      const oy = bandY + bandH + 6,
        oh = baseY - oy;
      const doorW = w * 0.17,
        doorX = idx % 2 ? w / 2 - doorW / 2 : w - pil - 10 - doorW;
      if (shop.state === "shutter") {
        // roll-down corrugated steel shutter with graffiti
        const g = ctx.createLinearGradient(0, oy, 0, h);
        g.addColorStop(0, "#7a7c78");
        g.addColorStop(1, "#4a4a46");
        ctx.fillStyle = g;
        ctx.fillRect(sx, oy, sw, h - oy);
        for (let y = oy; y < h; y += 6) {
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fillRect(sx, y, sw, 2);
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.fillRect(sx, y + 2, sw, 1);
          hc.fillStyle = "#909090";
          hc.fillRect(sx, y, sw, 3);
        }
        X.blotches(ctx, w, h, r, {
          count: 8,
          color: "#6a3010",
          alpha: 0.3,
          rmin: 10,
          rmax: 40,
        });
        const tags = [
          "KILROY",
          "REPENT",
          "FIZZO 4 LIFE",
          "THE END",
          "SLEEPERS LIE",
          "NO SCRIP",
          "COUNT ME OUT",
        ];
        const tcol = ["#d02a2a", "#2a8ad0", "#e8e8e8", "#f0c020", "#30c060"];
        for (let k = 0; k < 2; k++)
          X.text(
            ctx,
            tags[(r() * tags.length) | 0],
            sx + sw * (0.3 + k * 0.4),
            oy + oh * (0.35 + k * 0.3),
            {
              font: "marker",
              size: 34,
              color: tcol[(r() * tcol.length) | 0],
              skew: -0.2,
              maxW: sw * 0.45,
              stroke: "#111",
              strokeW: 3,
            },
          );
        ctx.fillStyle = "#2a2a28";
        ctx.fillRect(sx, oy, sw, 10); // shutter box
      } else {
        // kick plate
        ctx.fillStyle = "#3a342c";
        ctx.fillRect(sx, baseY, sw, h - baseY);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(sx, baseY, sw, 2);
        hc.fillStyle = "#909090";
        hc.fillRect(sx, baseY, sw, h - baseY);
        // display windows
        const win = [
          [sx + 4, doorX - 6],
          [doorX + doorW + 6, sx + sw - 4],
        ].filter((a) => a[1] - a[0] > 20);
        for (const [a, b] of win) {
          const st =
            shop.state === "boarded"
              ? "boarded"
              : shop.state === "broken"
                ? r() < 0.7
                  ? "broken"
                  : "intact"
                : r() < 0.25
                  ? "broken"
                  : "intact";
          drawWindow(ctx, hc, null, r, {
            x: a,
            y: oy,
            w: b - a,
            h: oh,
            state: st,
            panes: [2, 1],
            frame: "#2a2622",
            reveal: 4,
          });
          if (st === "intact") {
            // window lettering
            X.text(
              ctx,
              shop.name.toUpperCase().split(" ")[0],
              (a + b) / 2,
              oy + oh * 0.3,
              {
                font: "serif",
                size: 18,
                maxW: (b - a) * 0.8,
                color: "rgba(230,200,120,0.75)",
              },
            );
            // merchandise silhouettes
            ctx.fillStyle = "rgba(20,16,12,0.7)";
            for (let k = 0; k < 5; k++) {
              const bx = a + 8 + r() * (b - a - 30),
                bh2 = 10 + r() * 26;
              ctx.fillRect(bx, baseY - bh2, 8 + r() * 14, bh2);
            }
          }
          if (st === "boarded") {
            // plywood + posters
            const br =
              X.BRANDS &&
              X.BRANDS[G.LAYOUT.BRANDS[(r() * G.LAYOUT.BRANDS.length) | 0]];
            if (br) {
              // quick pasted-up handbill in the brand's colours
              ctx.save();
              ctx.translate(a + (b - a) * 0.5, oy + oh * 0.45);
              ctx.rotate((r() - 0.5) * 0.2);
              ctx.fillStyle = X.css(br.colors[0]);
              ctx.fillRect(-28, -40, 56, 80);
              ctx.fillStyle = X.css(br.colors[1], 0.9);
              ctx.fillRect(-28, 18, 56, 14);
              X.text(ctx, br.name.split(" ")[0], 0, -18, {
                font: "impact",
                size: 14,
                maxW: 50,
                color: br.colors[1],
              });
              ctx.fillStyle = "rgba(230,220,190,0.35)";
              ctx.fillRect(-28, -40, 56, 80);
              ctx.restore();
            }
            X.text(
              ctx,
              r() < 0.5 ? "KEEP OUT" : "CLOSED",
              (a + b) / 2,
              oy + oh * 0.8,
              {
                font: "marker",
                size: 22,
                maxW: (b - a) * 0.8,
                color: "#e8e0d0",
                skew: -0.15,
              },
            );
          }
        }
        // recessed door: glass upper half, push bar
        ctx.fillStyle = "#16120e";
        ctx.fillRect(doorX, oy, doorW, h - oy);
        ctx.fillStyle = "#4a3a2a";
        ctx.fillRect(doorX + 5, oy + 5, doorW - 10, h - oy - 10);
        const dg = ctx.createLinearGradient(
          doorX,
          oy,
          doorX + doorW,
          oy + oh * 0.5,
        );
        dg.addColorStop(0, shop.state === "broken" ? "#0e0c0a" : "#5a6a64");
        dg.addColorStop(1, "#141816");
        ctx.fillStyle = dg;
        ctx.fillRect(doorX + 10, oy + 10, doorW - 20, oh * 0.5);
        ctx.fillStyle = "#9a9488";
        ctx.fillRect(doorX + 10, oy + oh * 0.62, doorW - 20, 4);
        hc.fillStyle = "#303030";
        hc.fillRect(doorX, oy, doorW, h - oy);
        X.text(
          ctx,
          shop.state === "intact" ? "OPEN" : "CLOSED",
          doorX + doorW / 2,
          oy + oh * 0.25,
          { font: "helv", size: 10, color: "rgba(200,40,30,0.8)" },
        );
      }
      // awning bracket stubs + transom
      ctx.fillStyle = "#1e1c18";
      for (const bx of [sx + 10, sx + sw / 2, sx + sw - 14])
        ctx.fillRect(bx, bandY + bandH, 5, 12);
      weatherFacade(ctx, hc, w, h, r, 0.8);
      // street-level dirt splash at the bottom
      const bg = ctx.createLinearGradient(0, h - 40, 0, h);
      bg.addColorStop(0, "rgba(40,32,22,0)");
      bg.addColorStop(1, "rgba(40,32,22,0.55)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, h - 40, w, 40);
    };
  }
  SHOPS.forEach((s, i) =>
    X.def("storefront_" + (i + 1), {
      w: 512,
      h: 256,
      meters: 8,
      metersV: 4,
      normal: 1.8,
      rough: 0.8,
      desc: "storefront: " + s.name,
      gen: genStorefront(i),
    }),
  );
})();
