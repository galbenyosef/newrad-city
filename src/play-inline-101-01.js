// play-inline-101 01 — ctx
// Lines 13-196 of readable/play-inline-101.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;
  const LAYER = "subway"; // default layer of the shared sign emitter (the station cell)
  M.anchors = M.anchors || {};

  // -------------------------------------------------------------------
  // Street entrances (planned before the ground is built)
  // -------------------------------------------------------------------
  // cx,cz = centre of the opening; the stairs descend toward -x from the east end (top).
  M.subwayEntrances = [
    { id: "ts_north", cx: -62, cz: -224.45, len: 8.6, w: 2.7 },
    { id: "ts_west", cx: -102.5, cz: -224.45, len: 8.6, w: 2.7 },
  ];
  const LANDING = 3.8,
    LAND_END = 5.3,
    DEPTH1 = -1.1,
    DEPTH2 = -4.4;
  M.subwayHoles = function () {
    return M.subwayEntrances.map((e) => [
      [e.cx - e.len / 2, e.cz - e.w / 2],
      [e.cx + e.len / 2, e.cz - e.w / 2],
      [e.cx + e.len / 2, e.cz + e.w / 2],
      [e.cx - e.len / 2, e.cz + e.w / 2],
    ]);
  };
  /** Terrain height inside a stairwell: sloped first flight, flat landing. */
  M.stairHeight = function (x, z) {
    for (const e of M.subwayEntrances) {
      if (
        Math.abs(z - e.cz) > e.w / 2 + 0.6 ||
        x < e.cx - e.len / 2 - 0.6 ||
        x > e.cx + e.len / 2 + 0.6
      )
        continue;
      const t = e.cx + e.len / 2 - x; // distance down the stairs from the top
      if (t <= 0) return 0.12;
      if (t < LANDING) return 0.12 + (DEPTH1 - 0.12) * (t / LANDING);
      return DEPTH1;
    }
    return 0;
  };

  // -------------------------------------------------------------------
  // Atlases: subway tiles (repeating) & subway signs
  // -------------------------------------------------------------------
  M.defineAtlas("subwaytile", function () {
    const S2 = 256,
      cv = M.canvas(S2, S2),
      ctx = cv.getContext("2d");
    const r = M.rng("subwaytile");
    ctx.fillStyle = "#6d6a60";
    ctx.fillRect(0, 0, S2, S2);
    const tw = S2 / 8,
      th = S2 / 16;
    for (let j = 0; j < 16; j++)
      for (let i = 0; i < 8; i++) {
        const off = ((j % 2) * tw) / 2;
        const v = (200 + r() * 30) | 0;
        ctx.fillStyle =
          r() < 0.04
            ? "#3a3a34"
            : "rgb(" + v + "," + (v - 4) + "," + (v - 16) + ")";
        ctx.fillRect(i * tw + off + 1, j * th + 1, tw - 2, th - 2);
        ctx.fillRect(i * tw + off + 1 - S2, j * th + 1, tw - 2, th - 2);
      }
    // grime gradient & streaks
    const g = ctx.createLinearGradient(0, 0, 0, S2);
    g.addColorStop(0, "rgba(40,36,28,0.15)");
    g.addColorStop(1, "rgba(40,36,28,0.45)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S2, S2);
    for (let k = 0; k < 30; k++) {
      ctx.fillStyle = "rgba(60,45,25," + r() * 0.25 + ")";
      ctx.fillRect(r() * S2, r() * S2 * 0.3, 1 + r() * 3, 40 + r() * 200);
    }
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    return { texture: t, roughness: 0.45 };
  });
  const SSIGNS = [
    "TIMES SQ — 42 ST",
    "UPTOWN & THE BRONX",
    "DOWNTOWN & BROOKLYN",
    "TOKENS",
    "SUBWAY",
    "EXIT TO 42 ST",
    "NO SMOKING · NO SPITTING",
    "MAINTENANCE — KEEP OUT",
    "TO ALL TRAINS",
    "42",
    "TIMES SQ",
    "SHELTER — CAPACITY 200",
  ];
  M.defineAtlas("subwaysigns", function () {
    const cols = 2,
      rows = 8,
      CW = 512,
      CH = 128;
    const cv = M.canvas(cols * CW, rows * CH),
      ctx = cv.getContext("2d");
    const r = M.rng("ssigns");
    SSIGNS.forEach((txt, i) => {
      const x = (i % cols) * CW,
        y = Math.floor(i / cols) * CH;
      if (i === 0 || i === 9 || i === 10) {
        // mosaic tablet: tesserae border, cream field, dark lettering
        for (let yy = 0; yy < CH; yy += 8)
          for (let xx = 0; xx < CW; xx += 8) {
            const edge = yy < 16 || yy >= CH - 16 || xx < 16 || xx >= CW - 16;
            const v = r() * 20;
            ctx.fillStyle = edge
              ? ((xx + yy) / 8) % 3 === 0
                ? "rgb(" + ((150 + v) | 0) + "," + ((60 + v) | 0) + ",40)"
                : "rgb(" +
                  ((40 + v) | 0) +
                  "," +
                  ((90 + v) | 0) +
                  "," +
                  ((70 + v) | 0) +
                  ")"
              : "rgb(" +
                ((215 + v) | 0) +
                "," +
                ((205 + v) | 0) +
                "," +
                ((180 + v) | 0) +
                ")";
            ctx.fillRect(x + xx, y + yy, 7, 7);
          }
        ctx.fillStyle = "#2a2622";
        ctx.font = "bold 58px Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(txt, x + CW / 2, y + CH / 2 + 3, CW - 60);
      } else if (i === 4) {
        ctx.fillStyle = "#1e6a3a";
        ctx.fillRect(x, y, CW, CH);
        ctx.fillStyle = "#f0f0d8";
        ctx.font = "bold 80px Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SUBWAY", x + CW / 2, y + CH / 2 + 4, CW - 40);
      } else {
        const warn = /KEEP OUT|SHELTER/.test(txt);
        ctx.fillStyle = warn ? "#d8b020" : "#151515";
        ctx.fillRect(x, y, CW, CH);
        ctx.fillStyle = warn ? "#151515" : "#f2f2ea";
        ctx.font = "bold 44px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(txt, x + CW / 2, y + CH / 2 + 2, CW - 40);
      }
      for (let k = 0; k < 40; k++) {
        ctx.fillStyle = "rgba(30,25,20," + r() * 0.3 + ")";
        ctx.fillRect(x + r() * CW, y + r() * CH, 2 + r() * 10, 1 + r() * 5);
      }
    });
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, roughness: 0.5 };
  });
  function ssign(text, x, y, z, nx, nz, w, layer, cx, cz) {
    const i = Math.max(0, SSIGNS.indexOf(text)),
      uv = M.cellUV(i, 2, 8);
    const rx = nz,
      rz = -nx,
      h = w / 4;
    const bb = M.buf("my/subwaysigns", cx || 0, cz || 0, layer || LAYER);
    M.quad(
      bb,
      [x - (rx * w) / 2 + nx * 0.02, y - h / 2, z - (rz * w) / 2 + nz * 0.02],
      [x + (rx * w) / 2 + nx * 0.02, y - h / 2, z + (rz * w) / 2 + nz * 0.02],
      [x + (rx * w) / 2 + nx * 0.02, y + h / 2, z + (rz * w) / 2 + nz * 0.02],
      [x - (rx * w) / 2 + nx * 0.02, y + h / 2, z - (rz * w) / 2 + nz * 0.02],
      [nx, 0, nz],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
    );
  }
  M.subwaySign = ssign;

  // -------------------------------------------------------------------
  // Street entrance
  // -------------------------------------------------------------------
