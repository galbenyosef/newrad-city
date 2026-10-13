// play-inline-91 01 — ctx
// Lines 9-282 of readable/play-inline-91.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;

  // -------------------------------------------------------------------
  // Neon blade signs atlas (8 vertical cells, 128×512 each)
  // -------------------------------------------------------------------
  const BLADES = [
    ["HOTEL", "#ff4a3a"],
    ["BAR", "#40c8ff"],
    ["DINER", "#ff66cc"],
    ["ROOMS", "#ffd040"],
    ["EAT", "#60ff80"],
    ["LIQUOR", "#ff8a30"],
    ["CAFE", "#b070ff"],
    ["RADIO", "#40ffd0"],
  ];
  M.defineAtlas("neonblades", function () {
    const CW = 128,
      CH = 512,
      cv = M.canvas(CW * 8, CH),
      ctx = cv.getContext("2d");
    const r = M.rng("neonblades");
    BLADES.forEach(([txt, col], i) => {
      const x = i * CW;
      ctx.fillStyle = "#16120f";
      ctx.fillRect(x, 0, CW, CH);
      ctx.strokeStyle = "#3a302a";
      ctx.lineWidth = 6;
      ctx.strokeRect(x + 4, 4, CW - 8, CH - 8);
      // tube border
      ctx.shadowColor = col;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = col;
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 14, 14, CW - 28, CH - 28);
      // stacked letters
      const n = txt.length,
        lh = (CH - 60) / n;
      ctx.font = "bold " + Math.min(90, lh * 0.9) + "px Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let k = 0; k < n; k++) {
        const dead = r() < 0.2;
        ctx.fillStyle = dead ? "#3a2f28" : col;
        ctx.shadowBlur = dead ? 0 : 18;
        ctx.fillText(txt[k], x + CW / 2, 30 + lh * (k + 0.5));
      }
      ctx.shadowBlur = 0;
      for (let k = 0; k < 40; k++) {
        ctx.fillStyle = "rgba(20,15,10," + r() * 0.4 + ")";
        ctx.fillRect(x + r() * CW, r() * CH, 2 + r() * 8, 2 + r() * 20);
      }
    });
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return {
      texture: t,
      roughness: 0.5,
      emissive: 0.85,
      glow: [0.6, 2.6],
      flicker: true,
    };
  });

  // -------------------------------------------------------------------
  // Graffiti atlas (4×4 cells, transparent)
  // -------------------------------------------------------------------
  const TAGS = [
    "REPENT",
    "NO SCRIP\nNO SERVICE",
    "MANIACS\nINSIDE",
    "CIVIL DEFENSE\nLIED",
    "THE END\nWAS NIGH",
    "KEEP OUT",
    "COVENANT\nTERRITORY",
    "42ND ST\nKINGS",
    "CONTINUITY\nLIES",
    "WATER?",
    "TRADERS\nWELCOME",
    "☢",
    "RAIDERS\nRULE",
    "HELP US",
    "BLESSED\nBE THE GLOW",
    "WHY\nEUROPE?",
  ];
  M.defineAtlas("graffiti", function () {
    const S = 1024,
      C = 256,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const r = M.rng("graffiti");
    const cols = [
      "#d02a20",
      "#e8e0d0",
      "#30b0e0",
      "#f0c020",
      "#40d060",
      "#e050b0",
      "#1a1a1a",
    ];
    ctx.clearRect(0, 0, S, S);
    TAGS.forEach((txt, i) => {
      const x = (i % 4) * C,
        y = Math.floor(i / 4) * C;
      ctx.save();
      ctx.translate(x + C / 2, y + C / 2);
      ctx.rotate(r.range(-0.18, 0.18));
      const col = r.pick(cols);
      if (txt === "☢") {
        ctx.fillStyle = "#e8c020";
        ctx.beginPath();
        ctx.arc(0, 0, 90, 0, 7);
        ctx.fill();
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, 7);
        ctx.fill();
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, 80, k * 2.094 - 0.52, k * 2.094 + 0.52);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        const lines = txt.split("\n");
        ctx.font =
          "bold " +
          (lines.length > 1 ? 54 : 70) +
          'px Impact, "Arial Black", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 8;
        ctx.strokeStyle = r() < 0.5 ? "#111" : "#f0f0f0";
        lines.forEach((ln, k) => {
          const yy = (k - (lines.length - 1) / 2) * 62;
          ctx.strokeText(ln, 0, yy, C - 20);
          ctx.fillStyle = col;
          ctx.fillText(ln, 0, yy, C - 20);
        });
        // drips
        ctx.fillStyle = col;
        for (let k = 0; k < 10; k++)
          ctx.fillRect(
            r.range(-C / 2 + 20, C / 2 - 20),
            r.range(-10, 40),
            3,
            r.range(10, 60),
          );
      }
      ctx.restore();
      // fade/wear
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      for (let k = 0; k < 120; k++) {
        ctx.globalAlpha = r() * 0.6;
        ctx.fillRect(x + r() * C, y + r() * C, 2 + r() * 10, 2 + r() * 6);
      }
      ctx.restore();
    });
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, transparent: true, roughness: 0.9 };
  });

  /** Vertical neon blade sign mounted on a wall (a→b wall line, outward n) at distance t along it. */
  function blade(x, z, nx, nz, y0, h, idx, r) {
    const uv = M.cellUV(idx, 8, 1);
    const w = h / 4;
    const px = x + nx * (w / 2 + 0.25),
      pz = z + nz * (w / 2 + 0.25);
    const b = M.buf("my/neonblades", px, pz, "main");
    // the blade sticks out perpendicular to the wall: its faces point along ±(wall tangent)
    const tx = -nz,
      tz = nx;
    const x0 = px - (nx * w) / 2,
      z0 = pz - (nz * w) / 2,
      x1 = px + (nx * w) / 2,
      z1 = pz + (nz * w) / 2;
    // both faces (readable from up- and down-street)
    M.quad(
      b,
      [x0 + tx * 0.1, y0, z0 + tz * 0.1],
      [x1 + tx * 0.1, y0, z1 + tz * 0.1],
      [x1 + tx * 0.1, y0 + h, z1 + tz * 0.1],
      [x0 + tx * 0.1, y0 + h, z0 + tz * 0.1],
      [tx, 0, tz],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
    );
    M.quad(
      b,
      [x1 - tx * 0.1, y0, z1 - tz * 0.1],
      [x0 - tx * 0.1, y0, z0 - tz * 0.1],
      [x0 - tx * 0.1, y0 + h, z0 - tz * 0.1],
      [x1 - tx * 0.1, y0 + h, z1 - tz * 0.1],
      [-tx, 0, -tz],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
    );
    // sheet-metal box edges & brackets
    const bm = M.buf("metal_painted", px, pz, "detail");
    M.obox(
      bm,
      px,
      y0 + h / 2,
      pz,
      w + 0.05,
      h + 0.1,
      0.18,
      Math.atan2(tx, tz),
      { skip: 1 + 2, c: [0.25, 0.22, 0.2] },
    );
    for (const yy of [y0 + h * 0.15, y0 + h * 0.85])
      M.beam(bm, x, yy, z, px, yy, pz, 0.05, 0.05, { c: [0.3, 0.28, 0.25] });
    void r;
  }

  M.buildSignage = function () {
    const r = M.rng("signage");
    // neon blades on commercial / tenement / shell buildings at avenue-facing corners
    let nBlade = 0;
    for (const l of M.lots || []) {
      if (nBlade >= 60) break;
      if (
        !(
          l.kind === "commercial" ||
          l.kind === "tenement" ||
          l.kind === "shell"
        ) ||
        !(l.h > 12)
      )
        continue;
      if (r() < 0.55) continue;
      const fr = { n: l.front.n || l.faceN, s: l.front.s || l.faceS };
      const side = fr.n ? "n" : fr.s ? "s" : null;
      if (!side) continue;
      const nz = side === "n" ? -1 : 1;
      const z = side === "n" ? l.z0 : l.z1;
      const x = r() < 0.5 ? l.x0 + 1.2 : l.x1 - 1.2;
      const h = Math.min(l.h - 6, r.range(6, 11));
      if (h < 4) continue;
      blade(x, z, 0, nz, 5.2, h, r.int(0, BLADES.length - 1), r);
      nBlade++;
    }
    // graffiti on street-facing ground floors & blank walls
    let nG = 0;
    for (const sf of M.graffitiWalls || []) {
      if (r() < 0.55) continue;
      const len = Math.hypot(sf.bx - sf.ax, sf.bz - sf.az);
      if (len < 5) continue;
      const w = r.range(2.2, Math.min(3.6, len - 1)),
        t = r.range(w / 2 + 0.4, len - w / 2 - 0.4);
      const ux = (sf.bx - sf.ax) / len,
        uz = (sf.bz - sf.az) / len;
      const cx = sf.ax + ux * t + sf.nx * 0.05,
        cz = sf.az + uz * t + sf.nz * 0.05;
      const y = r.range(sf.y0, Math.max(sf.y0, sf.y1 - w * 0.9));
      const uv = M.cellUV(r.int(0, TAGS.length - 1), 4, 4);
      const b = M.buf("my/graffiti", cx, cz, "detail");
      // wall traversal a→b runs right-to-left seen from outside → u runs b→a
      M.quad(
        b,
        [cx - (ux * w) / 2, y, cz - (uz * w) / 2],
        [cx + (ux * w) / 2, y, cz + (uz * w) / 2],
        [cx + (ux * w) / 2, y + w * 0.9, cz + (uz * w) / 2],
        [cx - (ux * w) / 2, y + w * 0.9, cz - (uz * w) / 2],
        [sf.nx, 0, sf.nz],
        [uv[2], uv[1], uv[0], uv[1], uv[0], uv[3], uv[2], uv[3]],
      );
      nG++;
    }
    M.signageStats = { blades: nBlade, graffiti: nG };
  };
