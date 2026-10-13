/* src/poi_midtown3/06_mats.js */
/* =====================================================================
 * NEW RAD CITY — POI MIDTOWN 3 · 06 extra materials & textures
 * Materials the wave-3 midtown POIs need on top of the shared kit:
 * racing-silk paints for the '52' lawn jockeys, red-check tablecloths,
 * mahogany, canvas, Continuity black steel, gilt copper for the Helmsley
 * crown, plus canvas-texture helpers (window-bay facade atlas, clock
 * face, Continuity flag, New York Central rail map, spray-painted sheets).
 * All art original.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._m3) return;
  const P = G._m3;
  const TAU = P.TAU,
    HP = P.HP;
  const M = P.MAT,
    C = P.CUSTOM;

  // ---- plain paints (own MeshStandardMaterial with vertex colours) ----
  Object.assign(M, {
    silk_red: { color: 0xa8281e, rough: 0.55, uv: 1 },
    silk_yellow: { color: 0xd6a820, rough: 0.55, uv: 1 },
    silk_green: { color: 0x236f36, rough: 0.55, uv: 1 },
    silk_blue: { color: 0x24449a, rough: 0.55, uv: 1 },
    silk_orange: { color: 0xcc5f22, rough: 0.55, uv: 1 },
    silk_purple: { color: 0x5e3280, rough: 0.55, uv: 1 },
    silk_white: { color: 0xe4ded0, rough: 0.6, uv: 1 },
    jockey_black: { color: 0x141412, rough: 0.45, metal: 0.2, uv: 1 },
    jockey_face: { color: 0x6c655c, rough: 0.7, metal: 0.25, uv: 1 },
    check_red: { custom: "check_red", color: 0xb03028, uv: 0.8, rough: 0.95 },
    mahogany: { custom: "mahogany", color: 0x4a2418, uv: 1.8, rough: 0.5 },
    canvas_green: { src: "fabric", tint: 0x2e4a30, color: 0x2e4a30, uv: 1 },
    canvas_red: { src: "fabric", tint: 0x7a2420, color: 0x7a2420, uv: 1 },
    sheet: { src: "fabric", tint: 0xcfc6ae, color: 0xbab094, uv: 1 },
    continuity_black: {
      src: "metal_painted",
      tint: 0x2a2c2e,
      color: 0x222426,
      uv: 2,
      metal: 0.4,
    },
    continuity_panel: {
      src: "metal_panel",
      tint: 0x5c6266,
      color: 0x4a5054,
      uv: 2,
    },
    gilt: { color: 0xc89a3a, rough: 0.35, metal: 0.75, uv: 1 },
    gilt_dull: { color: 0x9a7a38, rough: 0.55, metal: 0.55, uv: 1 },
    copper_roof: {
      src: "copper_patina",
      tint: 0xb8c890,
      color: 0x7a9a6a,
      uv: 3,
    },
    copper_gilt: {
      src: "copper_patina",
      tint: 0xf0c060,
      color: 0xa88a40,
      uv: 4,
      rough: 0.5,
      metal: 0.25,
    }, // the Helmsley's gilded roof, patina bleeding through
    travertine: { src: "marble", tint: 0xeadcc0, color: 0xc8b890, uv: 2.5 },
    marble_rouge: {
      src: "marble_dark",
      tint: 0xe09a80,
      color: 0x8a4a38,
      uv: 2,
    },
    lamp_amber: {
      color: 0xffc070,
      emissive: 0xffa040,
      ei: 1.6,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    lamp_gold: {
      color: 0xffe0a0,
      emissive: 0xffc860,
      ei: 1.3,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    holo: {
      color: 0x103a20,
      emissive: 0x40ff90,
      ei: 0.8,
      rough: 0.2,
      plain: true,
      noShadow: true,
      uv: 1,
      opacity: 0.55,
    },
    core_blue: {
      color: 0x284a78,
      emissive: 0x5aa0ff,
      ei: 1.6,
      rough: 0.2,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    // one vertex-tinted material for every racing silk (was 7 materials = 7 draw calls per site): b.geo('silk', g, m, {c: P.SILK_COL[k]})
    silk: { color: 0xffffff, rough: 0.55, uv: 1 },
    frame_dirty: { src: "paint_white", tint: 0x8e887a, color: 0x8a8476, uv: 2 },
    frame_cream_dirty: {
      src: "paint_cream",
      tint: 0x948a70,
      color: 0x8a8068,
      uv: 2,
    },
    travertine_v: {
      custom: "travertine_v",
      color: 0xd8c8a4,
      uv: 2.4,
      rough: 0.55,
    },
    terrazzo_polish: {
      src: "terrazzo",
      tint: 0xe8dcc4,
      color: 0xb8b0a0,
      uv: 2,
      rough: 0.28,
    },
    lacquer_red: { custom: "lacquer_red", color: 0x3a1410, uv: 2, rough: 0.35 },
    tin_ceiling: {
      custom: "tin_ceiling",
      color: 0x8a8070,
      uv: 1.2,
      rough: 0.5,
      metal: 0.3,
    },
    linoleum: { custom: "linoleum", color: 0x6a6450, uv: 2.4, rough: 0.6 },
    frost: { color: 0xdce8ee, rough: 0.3, uv: 1 },
    meat: { color: 0x5a1a14, rough: 0.5, uv: 0.5 },
    chalk: {
      color: 0xe8e4d8,
      emissive: 0x303030,
      ei: 0.3,
      plain: true,
      noShadow: true,
      uv: 1,
    },
  });
  P.SILK_COL = {
    silk_red: 0xa8281e,
    silk_yellow: 0xd6a820,
    silk_green: 0x236f36,
    silk_blue: 0x24449a,
    silk_orange: 0xcc5f22,
    silk_purple: 0x5e3280,
    silk_white: 0xe4ded0,
  };
  /** Material key + options for a silk colour key: ['silk', {c}] (or the key untouched if it isn't a silk). */
  P.silkKey = (k) =>
    P.SILK_COL[k] !== undefined ? ["silk", P.SILK_COL[k]] : [k, undefined];

  C.travertine_v = [
    512,
    512,
    (ctx, w, h) => {
      const r = P.rng("trav");
      ctx.fillStyle = "#e4d6b8";
      ctx.fillRect(0, 0, w, h);
      // horizontal sedimentary banding + pitting, cut in ashlar blocks (2 courses per tile)
      for (let y = 0; y < h; y += 2) {
        ctx.fillStyle =
          "rgba(" +
          ((150 + r() * 60) | 0) +
          "," +
          ((120 + r() * 40) | 0) +
          ",80," +
          (0.04 + r() * 0.08) +
          ")";
        ctx.fillRect(0, y, w, 1 + r() * 3);
      }
      for (let i = 0; i < 26; i++) {
        const y = r() * h;
        ctx.strokeStyle = "rgba(150,110,60," + (0.12 + r() * 0.2) + ")";
        ctx.lineWidth = 1 + r() * 3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 32)
          ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 6 + (r() - 0.5) * 4);
        ctx.stroke();
      }
      for (let i = 0; i < 700; i++) {
        ctx.fillStyle = "rgba(90,70,40," + (0.2 + r() * 0.4) + ")";
        ctx.fillRect(r() * w, r() * h, 1 + r() * 4, 1 + r() * 1.6);
      }
      ctx.strokeStyle = "rgba(120,96,60,0.55)";
      ctx.lineWidth = 2;
      for (let j = 0; j < 2; j++) {
        const y = (j * h) / 2;
        ctx.beginPath();
        ctx.moveTo(0, y + 1);
        ctx.lineTo(w, y + 1);
        ctx.stroke();
        const jx = (j % 2 ? w / 2 : 0) + 1;
        ctx.beginPath();
        ctx.moveTo(jx, y);
        ctx.lineTo(jx, y + h / 2);
        ctx.stroke();
      }
      P.blotches(ctx, w, h, r, 16, 0.12);
    },
  ];
  C.lacquer_red = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("lacq");
      ctx.fillStyle = "#5a1a12";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) {
        const g = ctx.createRadialGradient(
          r() * w,
          r() * h,
          0,
          r() * w,
          r() * h,
          20 + r() * 60,
        );
        g.addColorStop(0, "rgba(20,4,2,0.25)");
        g.addColorStop(1, "rgba(20,4,2,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.strokeStyle = "rgba(200,150,60,0.25)";
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      P.speckle(ctx, w, h, r, 500, 0.2, 0.05);
    },
  ];
  C.tin_ceiling = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("tin");
      ctx.fillStyle = "#9a9080";
      ctx.fillRect(0, 0, w, h);
      const n = 2,
        s = w / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const x = i * s,
            y = j * s;
          ctx.strokeStyle = "rgba(40,34,26,0.7)";
          ctx.lineWidth = 4;
          ctx.strokeRect(x + 6, y + 6, s - 12, s - 12);
          ctx.strokeStyle = "rgba(230,220,200,0.35)";
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 12, y + 12, s - 24, s - 24);
          ctx.beginPath();
          ctx.arc(x + s / 2, y + s / 2, s * 0.22, 0, TAU);
          ctx.stroke();
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * TAU;
            ctx.beginPath();
            ctx.arc(
              x + s / 2 + Math.cos(a) * s * 0.3,
              y + s / 2 + Math.sin(a) * s * 0.3,
              5,
              0,
              TAU,
            );
            ctx.fillStyle = "rgba(40,34,26,0.45)";
            ctx.fill();
          }
        }
      P.blotches(ctx, w, h, r, 30, 0.35);
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = "rgba(110,60,30," + r() * 0.4 + ")";
        ctx.fillRect(r() * w, r() * h, 4 + r() * 20, 3 + r() * 14);
      }
    },
  ];
  C.linoleum = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("lino");
      ctx.fillStyle = "#7a735a";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1400; i++) {
        ctx.fillStyle =
          r() < 0.5 ? "rgba(40,36,24,0.25)" : "rgba(200,190,150,0.18)";
        ctx.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3);
      }
      ctx.strokeStyle = "rgba(30,26,18,0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
      for (let i = 0; i < 14; i++) {
        const g = ctx.createRadialGradient(
          r() * w,
          r() * h,
          0,
          r() * w,
          r() * h,
          30 + r() * 50,
        );
        g.addColorStop(0, "rgba(30,24,14,0.3)");
        g.addColorStop(1, "rgba(30,24,14,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    },
  ];

  C.check_red = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("check");
      ctx.fillStyle = "#e8e0cc";
      ctx.fillRect(0, 0, w, h);
      const n = 8,
        s = w / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const a = (i % 2) + (j % 2);
          ctx.fillStyle =
            a === 2
              ? "rgba(150,28,24,0.95)"
              : a === 1
                ? "rgba(170,50,44,0.55)"
                : "rgba(0,0,0,0)";
          ctx.fillRect(i * s, j * s, s, s);
        }
      P.blotches(ctx, w, h, r, 26, 0.35);
      P.speckle(ctx, w, h, r, 900, 0.3, 0.06);
    },
  ];
  C.mahogany = [
    512,
    512,
    (ctx, w, h) => {
      const r = P.rng("mahog");
      ctx.fillStyle = "#4a2216";
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) {
        ctx.fillStyle =
          "rgba(" +
          ((100 + r() * 50) | 0) +
          "," +
          ((40 + r() * 20) | 0) +
          ",22," +
          (0.1 + r() * 0.2) +
          ")";
        ctx.fillRect(0, y, w, 1 + r() * 2);
      }
      // raised panels + a rail
      for (let i = 0; i < 2; i++) {
        const x0 = (i * w) / 2 + 20,
          pw = w / 2 - 40;
        ctx.strokeStyle = "rgba(15,6,2,0.75)";
        ctx.lineWidth = 6;
        ctx.strokeRect(x0, 40, pw, h - 110);
        ctx.strokeStyle = "rgba(210,140,90,0.22)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x0 + 5, 45, pw - 10, h - 120);
      }
      ctx.fillStyle = "rgba(20,8,3,0.6)";
      ctx.fillRect(0, h - 44, w, 8);
      P.blotches(ctx, w, h, r, 24, 0.22);
    },
  ];

  // =====================================================================
  // texture helpers
  // =====================================================================
  /**
   * Window-bay facade atlas: nx × ny bays per tile (uv 0..1 = one tile). o: {wall, trim, win (0..1 of bay width), winH, sill,
   * arch, spandrel, lit (0..1 chance), cold (share of lit bays with cold-white Continuity light), broken, boarded, burnt (0..1
   * chance a whole ROW is a burnt-out floor), res} — every bay gets its own state so the repeat is hard to read.
   * P.bayLitTex(key, o) = the matching emissive mask (lit panes only) for a night-glow material.
   */
  const bayStateCache = {};
  function bayStates(key, o) {
    if (bayStateCache[key]) return bayStateCache[key];
    const r = P.rng("baystate" + key),
      nx = o.nx || 4,
      ny = o.ny || 4,
      st = [];
    const burntRow = [];
    for (let j = 0; j < ny; j++) burntRow.push(r() < (o.burnt || 0));
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < ny; j++) {
        const roll = r();
        let kind = "dark";
        if (burntRow[j] && r() < 0.85) kind = "burnt";
        else if (roll < (o.lit || 0)) kind = "lit";
        else if (roll < (o.lit || 0) + (o.broken || 0.25)) kind = "broken";
        st.push({
          i,
          j,
          kind,
          cold: r() < (o.cold || 0),
          boarded: kind !== "lit" && r() < (o.boarded || 0.08),
          blind: r(),
          soot: r() < 0.6,
          tint: r(),
        });
      }
    return (bayStateCache[key] = { st, burntRow, nx, ny });
  }
  function bayGeom(o, W, H, nx, ny, s) {
    const bw = W / nx,
      bh = H / ny;
    const ww = bw * (o.win || 0.52),
      wh = bh * (o.winH || 0.62);
    const wx = s.i * bw + (bw - ww) / 2,
      wy = s.j * bh + bh * (o.winTop || 0.16);
    return { bw, bh, ww, wh, wx, wy, x0: s.i * bw, y0: s.j * bh };
  }
  P.bayTex = function (key, o) {
    o = o || {};
    const nx = o.nx || 4,
      ny = o.ny || 4,
      W = o.res || 512,
      H = o.res || 512;
    return P.canvasTex("m3_bay_" + key, W, H, (ctx) => {
      const r = P.rng("bay" + key);
      const B = bayStates(key, o),
        k = W / 512;
      ctx.fillStyle = o.wall || "#b8a07a";
      ctx.fillRect(0, 0, W, H);
      // brick / stone texture: coursing + per-brick tone
      ctx.strokeStyle = o.joint || "rgba(60,44,30,0.28)";
      ctx.lineWidth = 1;
      const ch = (o.course || 6) * k;
      for (let y = 0; y < H; y += ch) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      for (let y = 0, row = 0; y < H; y += ch, row++)
        for (let x = (row % 2) * ch * 1.5; x < W; x += ch * 3) {
          ctx.fillStyle =
            "rgba(" +
            (r() < 0.5 ? "40,28,18," : "250,235,210,") +
            r() * 0.07 +
            ")";
          ctx.fillRect(x, y, ch * 3 - 1, ch - 1);
        }
      for (const s of B.st) {
        const g0 = bayGeom(o, W, H, nx, ny, s),
          { bw, bh, ww, wh, wx, wy } = g0;
        if (o.spandrel) {
          ctx.fillStyle = o.spandrel;
          ctx.fillRect(wx - 2 * k, wy + wh + 4 * k, ww + 4 * k, bh * 0.12);
        }
        // reveal (deep shadow on the top/left = recessed window) + glass
        ctx.fillStyle = "rgba(20,16,12,0.85)";
        ctx.fillRect(wx - 3 * k, wy - 3 * k, ww + 6 * k, wh + 6 * k);
        let glass;
        if (s.kind === "lit") {
          const g = ctx.createLinearGradient(0, wy, 0, wy + wh);
          if (s.cold) {
            g.addColorStop(0, "#dfe8f0");
            g.addColorStop(1, "#6a7a88");
          } else {
            g.addColorStop(0, "#f0c070");
            g.addColorStop(1, "#8a5a24");
          }
          glass = g;
        } else if (s.kind === "broken" || s.kind === "burnt") glass = "#07090a";
        else {
          const g = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
          const t = 0.8 + s.tint * 0.4;
          g.addColorStop(
            0,
            "rgb(" +
              ((60 * t) | 0) +
              "," +
              ((74 * t) | 0) +
              "," +
              ((80 * t) | 0) +
              ")",
          );
          g.addColorStop(0.5, "#1c2428");
          g.addColorStop(1, "#2c363a");
          glass = g;
        }
        ctx.fillStyle = glass;
        ctx.fillRect(wx, wy, ww, wh);
        if (o.arch) {
          ctx.beginPath();
          ctx.arc(wx + ww / 2, wy, ww / 2, Math.PI, 0);
          ctx.fill();
        }
        // reveal shadow inside the opening (reads as depth)
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(wx, wy, ww, wh * 0.12);
        ctx.fillRect(wx, wy, ww * 0.1, wh);
        // pulled blinds on some intact panes
        if (s.kind === "dark" && s.blind < 0.4) {
          ctx.fillStyle = "rgba(200,190,160,0.55)";
          ctx.fillRect(wx, wy, ww, wh * (0.2 + s.blind));
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          for (let y = wy + 3 * k; y < wy + wh * (0.2 + s.blind); y += 4 * k)
            ctx.fillRect(wx, y, ww, 1);
        }
        if (s.kind === "lit") {
          ctx.fillStyle = "rgba(40,24,10,0.5)";
          ctx.fillRect(wx + ww * 0.15, wy + wh * 0.55, ww * 0.3, wh * 0.45);
        }
        // broken pane shards
        if (s.kind === "broken") {
          ctx.strokeStyle = "rgba(160,180,180,0.5)";
          ctx.lineWidth = 1.2 * k;
          for (let q = 0; q < 3; q++) {
            ctx.beginPath();
            ctx.moveTo(wx + r() * ww, wy);
            ctx.lineTo(wx + r() * ww, wy + r() * wh * 0.6);
            ctx.lineTo(wx + r() * ww, wy + wh * 0.2);
            ctx.stroke();
          }
        }
        // mullions / sash (burnt-out floors lost theirs)
        if (s.kind !== "burnt") {
          ctx.fillStyle = o.frame || "#2a241c";
          ctx.fillRect(wx + ww / 2 - 1.5 * k, wy, 3 * k, wh);
          ctx.fillRect(wx, wy + wh * 0.5 - 1.5 * k, ww, 3 * k);
        } else {
          ctx.fillStyle = "#2a1e14";
          ctx.fillRect(wx + r() * ww * 0.6, wy + wh * 0.3, ww * 0.35, 2.5 * k);
        }
        if (s.boarded) {
          ctx.fillStyle = "#5a4630";
          for (let q = 0; q < 4; q++) {
            ctx.save();
            ctx.translate(wx + ww / 2, wy + ((q + 0.6) * wh) / 4.4);
            ctx.rotate((r() - 0.5) * 0.25);
            ctx.fillRect(-ww / 2 - 3 * k, -4 * k, ww + 6 * k, 8 * k);
            ctx.restore();
          }
        }
        // sill + lintel
        ctx.fillStyle = o.trim || "#d8ccb0";
        ctx.fillRect(wx - 5 * k, wy + wh + 1 * k, ww + 10 * k, 5 * k);
        if (!o.arch) ctx.fillRect(wx - 4 * k, wy - 8 * k, ww + 8 * k, 6 * k);
        // soot above broken windows; heavy scorch plumes above burnt floors
        if (s.kind === "broken" && s.soot) {
          const g = ctx.createLinearGradient(0, wy - bh * 0.4, 0, wy);
          g.addColorStop(0, "rgba(10,8,6,0)");
          g.addColorStop(1, "rgba(10,8,6,0.55)");
          ctx.fillStyle = g;
          ctx.fillRect(wx - 4 * k, wy - bh * 0.4, ww + 8 * k, bh * 0.4);
        }
        if (s.kind === "burnt") {
          const g = ctx.createLinearGradient(0, wy - bh * 0.9, 0, wy + wh);
          g.addColorStop(0, "rgba(8,6,4,0)");
          g.addColorStop(0.6, "rgba(8,6,4,0.7)");
          g.addColorStop(1, "rgba(8,6,4,0.9)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(wx - 6 * k, wy + wh);
          ctx.lineTo(wx - bw * 0.25, wy - bh * 0.9);
          ctx.lineTo(wx + ww + bw * 0.25, wy - bh * 0.9);
          ctx.lineTo(wx + ww + 6 * k, wy + wh);
          ctx.fill();
        }
      }
      // pier shading between bays
      const bw = W / nx;
      for (let i = 0; i <= nx; i++) {
        const g = ctx.createLinearGradient(
          i * bw - 6 * k,
          0,
          i * bw + 6 * k,
          0,
        );
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(0.5, "rgba(0,0,0,0.12)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(i * bw - 6 * k, 0, 12 * k, H);
      }
      // streaks & grime
      for (let i = 0; i < (16 * nx) / 4; i++) {
        const x = r() * W,
          g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(30,24,16," + (0.05 + r() * 0.12) + ")");
        g.addColorStop(1, "rgba(30,24,16,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x, r() * H * 0.5, (3 + r() * 10) * k, H);
      }
      P.blotches(ctx, W, H, r, (30 * nx) / 4, 0.2);
      P.speckle(ctx, W, H, r, 1500 * k * k, 0.2, 0.05);
    });
  };
  P.bayLitTex = function (key, o) {
    o = o || {};
    const nx = o.nx || 4,
      ny = o.ny || 4,
      W = (o.res || 512) / 2,
      H = (o.res || 512) / 2;
    return P.canvasTex("m3_baylit_" + key, W, H, (ctx) => {
      const B = bayStates(key, o),
        k = W / 512;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      for (const s of B.st) {
        if (s.kind !== "lit") continue;
        const { ww, wh, wx, wy } = bayGeom(o, W, H, nx, ny, s);
        const g = ctx.createLinearGradient(0, wy, 0, wy + wh);
        if (s.cold) {
          g.addColorStop(0, "#b8d0e8");
          g.addColorStop(1, "#40586a");
        } else {
          g.addColorStop(0, "#ffc870");
          g.addColorStop(1, "#7a4a18");
        }
        ctx.fillStyle = g;
        ctx.fillRect(wx, wy + wh * 0.12, ww, wh * 0.88);
        ctx.fillStyle = "#000";
        ctx.fillRect(wx + ww / 2 - 1.5 * k, wy, 3 * k, wh);
        ctx.fillRect(wx, wy + wh * 0.5 - 1.5 * k, ww, 3 * k);
        ctx.fillRect(wx + ww * 0.15, wy + wh * 0.55, ww * 0.3, wh * 0.45);
      }
    });
  };

  /**
   * Soot / grime decal sheet (transparent). uv regions: [0,0.5]×[0,1] = fire-scorch plume (bottom = window line),
   * [0.5,1]×[0,1] = water & rust streaks hanging from a cornice (top edge = cornice line).
   */
  P.sootTex = function () {
    return P.canvasTex(
      "m3_soot",
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("soot");
        ctx.clearRect(0, 0, w, h);
        // plume: several overlapping soft blobs rising from the bottom
        for (let i = 0; i < 60; i++) {
          const t = r(),
            x = w * 0.25 + (r() - 0.5) * w * 0.3 * (0.4 + t),
            y = h * (1 - t * 0.95),
            rad = w * (0.05 + (1 - t) * 0.1 + r() * 0.05);
          const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
          g.addColorStop(0, "rgba(12,9,6," + 0.28 * (1 - t * 0.7) + ")");
          g.addColorStop(1, "rgba(12,9,6,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
        {
          ctx.save();
          ctx.translate(w * 0.25, h);
          ctx.scale(1, 0.45);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.22);
          g.addColorStop(0, "rgba(8,6,4,0.8)");
          g.addColorStop(1, "rgba(8,6,4,0)");
          ctx.fillStyle = g;
          ctx.fillRect(-w * 0.25, -w * 0.25, w * 0.5, w * 0.25);
          ctx.restore();
        }
        // streaks
        for (let i = 0; i < 70; i++) {
          const x = w * 0.5 + r() * w * 0.5,
            len = h * (0.2 + r() * 0.8),
            ww = 2 + r() * 9;
          const g = ctx.createLinearGradient(0, 0, 0, len);
          const rust = r() < 0.3;
          g.addColorStop(
            0,
            rust ? "rgba(90,50,20,0.45)" : "rgba(20,16,12,0.5)",
          );
          g.addColorStop(1, "rgba(20,16,12,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, ww, len);
        }
        const g2 = ctx.createLinearGradient(0, 0, 0, h * 0.12);
        g2.addColorStop(0, "rgba(15,12,8,0.6)");
        g2.addColorStop(1, "rgba(15,12,8,0)");
        ctx.fillStyle = g2;
        ctx.fillRect(w * 0.5, 0, w * 0.5, h * 0.12);
      },
      { clamp: true },
    );
  };
  /** Shared soot material key (soft-blended, no depth write). */
  P.sootMat = () =>
    P.texMat("m3_soot", P.sootTex(), {
      transparent: true,
      alphaTest: 0.01,
      depthWrite: false,
      rough: 1,
    });

  /** Clock face (stopped at 9:47). o: {bg, fg, roman} */
  P.clockTex = function (key, o) {
    o = o || {};
    return P.canvasTex(
      "m3_clock_" + key,
      256,
      256,
      (ctx, w, h) => {
        const g = ctx.createRadialGradient(
          w / 2,
          h / 2,
          8,
          w / 2,
          h / 2,
          w / 2,
        );
        g.addColorStop(0, o.bg0 || "#f2e8c8");
        g.addColorStop(1, o.bg1 || "#c0aa78");
        ctx.fillStyle = "#1a1208";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, w / 2 - 6, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#8a6a28";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, w / 2 - 8, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = o.fg || "#2a2014";
        ctx.font = "bold 24px " + P.FONTS.SERIF;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const R = [
          "XII",
          "I",
          "II",
          "III",
          "IIII",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
        ];
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU - HP;
          ctx.fillText(
            R[i],
            w / 2 + Math.cos(a) * 94,
            h / 2 + Math.sin(a) * 94,
          );
        }
        ctx.strokeStyle = "#18120a";
        ctx.lineCap = "round";
        ctx.lineWidth = 8;
        const ah = ((9 + 47 / 60) / 12) * TAU - HP;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 + Math.cos(ah) * 52, h / 2 + Math.sin(ah) * 52);
        ctx.stroke();
        ctx.lineWidth = 5;
        const am = (47 / 60) * TAU - HP;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 + Math.cos(am) * 80, h / 2 + Math.sin(am) * 80);
        ctx.stroke();
        // a bullet crack
        ctx.strokeStyle = "rgba(40,30,20,0.6)";
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.moveTo(w * 0.36, h * 0.66);
          ctx.lineTo(
            w * 0.36 + Math.cos(i * 0.8) * 50,
            h * 0.66 + Math.sin(i * 0.8) * 50,
          );
          ctx.stroke();
        }
      },
      { clamp: true },
    );
  };

  /** Continuity flag: stars in a ring on blue canton, red & white stripes (original take). */
  P.continuityFlagTex = function (vertical) {
    return P.canvasTex(
      "m3_continuity_flag" + (vertical ? "_v" : ""),
      vertical ? 256 : 512,
      vertical ? 512 : 256,
      (ctx, w, h) => {
        const r = P.rng("eflag");
        ctx.save();
        if (vertical) {
          ctx.translate(w, 0);
          ctx.rotate(HP);
        }
        const W = vertical ? h : w,
          H = vertical ? w : h;
        for (let i = 0; i < 13; i++) {
          ctx.fillStyle = i % 2 ? "#e8e0cc" : "#9a2420";
          ctx.fillRect(0, (i * H) / 13, W, H / 13 + 1);
        }
        const cw = W * 0.42,
          chh = (H * 7) / 13;
        ctx.fillStyle = "#1c2a5a";
        ctx.fillRect(0, 0, cw, chh);
        ctx.fillStyle = "#ece6d4";
        const star = (x, y, s) => {
          ctx.beginPath();
          for (let k = 0; k < 10; k++) {
            const a = (k / 10) * TAU - HP,
              rr = k % 2 ? s * 0.42 : s;
            ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
          }
          ctx.closePath();
          ctx.fill();
        };
        for (let k = 0; k < 13; k++) {
          const a = (k / 13) * TAU;
          star(
            cw / 2 + Math.cos(a) * chh * 0.33,
            chh / 2 + Math.sin(a) * chh * 0.33,
            chh * 0.055,
          );
        }
        star(cw / 2, chh / 2, chh * 0.12);
        ctx.restore();
        P.blotches(ctx, w, h, r, 20, 0.25);
        P.speckle(ctx, w, h, r, 700, 0.25, 0.06);
      },
      { clamp: true },
    );
  };

  /** Spray-painted bedsheet banner (transparent edges, ragged). */
  P.sheetTex = function (key, lines, fg) {
    return P.canvasTex(
      "m3_sheet_" + key,
      512,
      256,
      (ctx, w, h) => {
        const r = P.rng("sheet" + key);
        ctx.fillStyle = "#d4ccb4";
        ctx.fillRect(0, 0, w, h);
        P.blotches(ctx, w, h, r, 30, 0.35);
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = "rgba(90,70,40,0.2)";
          ctx.fillRect(0, r() * h, w, 2 + r() * 4);
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const L = lines.length;
        let fs = Math.floor((h * 0.7) / L);
        ctx.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
        let mw = 0;
        for (const t of lines) mw = Math.max(mw, ctx.measureText(t).width);
        if (mw > w * 0.9) {
          fs = Math.floor((fs * w * 0.9) / mw);
          ctx.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
        }
        lines.forEach((t, i) => {
          const y = h / 2 + (i - (L - 1) / 2) * fs;
          ctx.save();
          ctx.translate(w / 2, y);
          ctx.rotate((r() - 0.5) * 0.08);
          ctx.fillStyle = fg || "#a01c14";
          ctx.fillText(t, 0, 0);
          for (let k = 0; k < 12; k++)
            ctx.fillRect(
              (r() - 0.5) * w * 0.8,
              fs * 0.25,
              2 + r() * 2,
              5 + r() * fs * 0.7,
            );
          ctx.restore();
        });
        // ragged holes (alpha)
        ctx.globalCompositeOperation = "destination-out";
        for (let i = 0; i < 7; i++) {
          ctx.beginPath();
          ctx.arc(
            r() * w,
            r() < 0.5 ? r() * 20 : h - r() * 20,
            6 + r() * 16,
            0,
            TAU,
          );
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      },
      { clamp: true },
    );
  };

  /** New York Central System rail map (office wall). */
  P.railMapTex = function () {
    return P.canvasTex(
      "m3_railmap",
      1024,
      512,
      (ctx, w, h) => {
        const r = P.rng("rail");
        ctx.fillStyle = "#d8ccaa";
        ctx.fillRect(0, 0, w, h);
        // coastline / lakes
        ctx.fillStyle = "#9ab0b0";
        ctx.beginPath();
        ctx.moveTo(w * 0.86, h);
        ctx.bezierCurveTo(w * 0.9, h * 0.7, w * 0.96, h * 0.5, w, h * 0.3);
        ctx.lineTo(w, h);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w * 0.3, h * 0.28, w * 0.12, h * 0.08, -0.2, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(w * 0.52, h * 0.2, w * 0.1, h * 0.05, 0.1, 0, TAU);
        ctx.fill();
        // rail lines
        const cities = [
          ["NEW YORK", 0.86, 0.78],
          ["ALBANY", 0.8, 0.5],
          ["SYRACUSE", 0.66, 0.42],
          ["ROCHESTER", 0.58, 0.38],
          ["BUFFALO", 0.5, 0.4],
          ["CLEVELAND", 0.4, 0.5],
          ["TOLEDO", 0.3, 0.52],
          ["DETROIT", 0.3, 0.42],
          ["CHICAGO", 0.12, 0.5],
          ["CINCINNATI", 0.3, 0.78],
          ["ST. LOUIS", 0.08, 0.82],
          ["BOSTON", 0.95, 0.4],
          ["PITTSBURGH", 0.52, 0.66],
        ];
        ctx.strokeStyle = "#1a1410";
        ctx.lineWidth = 5;
        const at = (n) => cities.find((c) => c[0] === n);
        const line = (list) => {
          ctx.beginPath();
          list.forEach((n, i) => {
            const c = at(n);
            if (i) ctx.lineTo(c[1] * w, c[2] * h);
            else ctx.moveTo(c[1] * w, c[2] * h);
          });
          ctx.stroke();
        };
        line([
          "NEW YORK",
          "ALBANY",
          "SYRACUSE",
          "ROCHESTER",
          "BUFFALO",
          "CLEVELAND",
          "TOLEDO",
          "CHICAGO",
        ]);
        ctx.lineWidth = 3;
        line(["ALBANY", "BOSTON"]);
        line(["TOLEDO", "DETROIT"]);
        line(["CLEVELAND", "CINCINNATI", "ST. LOUIS"]);
        line(["BUFFALO", "PITTSBURGH"]);
        ctx.fillStyle = "#9a1c14";
        ctx.font = "bold 15px " + P.FONTS.SANS;
        ctx.textAlign = "left";
        for (const c of cities) {
          ctx.beginPath();
          ctx.arc(c[1] * w, c[2] * h, 7, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#1a1410";
          ctx.fillText(c[0], c[1] * w + 10, c[2] * h - 8);
          ctx.fillStyle = "#9a1c14";
        }
        ctx.fillStyle = "#1a1410";
        ctx.font = "bold 42px " + P.FONTS.SERIF;
        ctx.textAlign = "center";
        ctx.fillText("NEW YORK CENTRAL SYSTEM", w * 0.42, 60);
        ctx.font = "italic 20px " + P.FONTS.SERIF;
        ctx.fillText('"The Water Level Route — You Can Sleep"', w * 0.42, 92);
        // Continuity grease-pencil annotations
        ctx.strokeStyle = "rgba(30,50,140,0.85)";
        ctx.lineWidth = 3;
        for (const c of [at("NEW YORK"), at("ALBANY"), at("CHICAGO")]) {
          ctx.beginPath();
          ctx.arc(c[1] * w, c[2] * h, 18, 0, TAU);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(30,50,140,0.9)";
        ctx.font = "bold 18px " + P.FONTS.SANS;
        ctx.fillText(
          "RELAY 7 — ACTIVE",
          at("NEW YORK")[1] * w - 60,
          at("NEW YORK")[2] * h + 40,
        );
        P.blotches(ctx, w, h, r, 40, 0.3);
        P.speckle(ctx, w, h, r, 2000);
      },
      { clamp: true },
    );
  };
})();
