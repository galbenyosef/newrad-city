/* src/poi_harbor/33_navy_int_dress.js */
/* =====================================================================
 * POI_HARBOR — USS Hudson interior DRESSING PASS (Rivet-City-grade detail)
 * Called from 32_navy_int.js just before its batch is merged, so all of
 * this shares the same per-material meshes (a handful of extra draw calls
 * at most) and the baked lamp light of every compartment.
 *
 *  · deckheads: transverse I-section deck beams every frame (1.2 m) and
 *    deep longitudinal girders, split around stair holes, lamps & trunks
 *  · overhead services: hull-side pipe runs with flanges, hangers, colour
 *    bands & handwheels; cable trays with cable bundles; galvanised vent
 *    ducts with flange rings and grilles; vertical risers
 *  · shipboard fittings: battle lanterns, fire stations (hose reel, valve,
 *    nozzle), sound-powered phone boxes, gauge boards, damage-control
 *    lockers & shoring timber, compartment ID / pipe-marker / zebra
 *    stencils (one label atlas), cabin door frames with open leaves
 *  · the CIC: a real dead-reckoning plot table (lit chart under glass),
 *    two edge-lit status boards (surface plot + the Commodore's bounty
 *    board), PPI radar scopes with sweep & blips
 *  · the bridge: the Commodore's throne (captain's chair on a dais of
 *    16" powder cans and shell-plate, flanked by two 16" shells with
 *    skulls, scrap backdrop), voice tubes, overhead gyro repeater
 *  · the pirates' squalor: litter, bottles, cans, blood & oil decals,
 *    graffiti in the label atlas
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._pharbor) return;
  const PH = G._pharbor;
  const TAU = Math.PI * 2,
    HP = Math.PI / 2;

  // =====================================================================
  // TEXTURES
  // =====================================================================
  // One 1024×512 atlas of 4×8 label cells (256×64 each).
  const LABELS = [
    ["3-110-0-E", "id"],
    ["4-72-0-E", "id"],
    ["4-58-0-E", "id"],
    ["4-40-0-M", "id"],
    ["2-110-0-L", "id"],
    ["2-52-0-L", "id"],
    ["2-36-0-L", "id"],
    ["1-120-0-L", "id"],
    ["1-80-0-L", "id"],
    ["1-40-0-L", "id"],
    ["01-50-0-C", "id"],
    ["04-44-0-C", "id"],
    ["FIRE STATION", "red"],
    ["DAMAGE CONTROL", "red"],
    ["BATTLE DRESSING STA.", "red"],
    ["SOUND PWR PHONE JV", "id"],
    ["STEAM  ▶", "pipe"],
    ["FIRE MAIN  ▶", "piper"],
    ["FUEL OIL  ▶", "pipe"],
    ["POTABLE WATER  ▶", "pipeb"],
    ["Ⓩ  ZEBRA", "zebra"],
    ["KEEP CLOSED", "id"],
    ["NO SMOKING", "red"],
    ["CAUTION: HIGH VOLTAGE", "pipe"],
    ["KEGS WAS HERE", "graf"],
    ["HATCH 4 EVER", "grafw"],
    ["NO QUARTER", "graf"],
    ["ELLIS IS SOFT", "grafw"],
    ["TOLL OR ROLL", "graf"],
    ["SHARKS BELOW", "grafw"],
    ["☠ MINE ☠", "graf"],
    ["DON'T NAP HERE", "grafw"],
  ];
  const LI = {};
  LABELS.forEach(([t], i) => {
    LI[t] = i;
  });
  function labelAtlas() {
    return PH.canvasTex(
      "ph_hudson_labels",
      1024,
      512,
      (ctx) => {
        ctx.clearRect(0, 0, 1024, 512);
        const r = PH.rng("hlabels");
        LABELS.forEach(([t, st], i) => {
          ctx.save();
          ctx.translate((i % 4) * 256, ((i / 4) | 0) * 64);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          if (st === "graf" || st === "grafw") {
            ctx.translate(128, 32);
            ctx.rotate((r() - 0.5) * 0.12);
            ctx.font = 'bold 40px Impact, "Arial Black", sans-serif';
            const col = st === "graf" ? "#c42a18" : "#e6ddc6";
            const mw = ctx.measureText(t).width,
              sx = Math.min(1, 232 / mw);
            ctx.scale(sx, 1);
            ctx.fillStyle = col;
            ctx.fillText(t, 0, 0);
            for (let k = 0; k < 7; k++)
              ctx.fillRect((r() - 0.5) * mw * 0.9, 8, 3, 6 + r() * 16); // paint drips
          } else {
            const bg = {
              id: "#e4dcc4",
              red: "#a82418",
              pipe: "#d8b020",
              piper: "#b8261a",
              pipeb: "#2a5a9a",
              zebra: "#e4dcc4",
            }[st];
            const fg = {
              id: "#141414",
              red: "#f2eee0",
              pipe: "#141414",
              piper: "#f2eee0",
              pipeb: "#f2eee0",
              zebra: "#141414",
            }[st];
            ctx.fillStyle = bg;
            ctx.fillRect(4, 6, 248, 52);
            ctx.strokeStyle = fg;
            ctx.lineWidth = 3;
            ctx.strokeRect(9, 11, 238, 42);
            let fs = 30;
            ctx.font = "bold " + fs + 'px "Arial Black", Impact, sans-serif';
            const mw = ctx.measureText(t).width;
            if (mw > 220) {
              fs = Math.floor((fs * 220) / mw);
              ctx.font = "bold " + fs + 'px "Arial Black", Impact, sans-serif';
            }
            ctx.fillStyle = fg;
            ctx.fillText(t, 128, 33);
            // weathering: paint chips & rust bleed
            for (let k = 0; k < 26; k++) {
              ctx.fillStyle =
                "rgba(" +
                ((90 + r() * 50) | 0) +
                "," +
                ((50 + r() * 20) | 0) +
                ",24," +
                (0.25 + r() * 0.45) +
                ")";
              ctx.fillRect(
                4 + r() * 246,
                6 + r() * 50,
                1 + r() * 4,
                1 + r() * 7,
              );
            }
            ctx.fillStyle = "rgba(40,30,20,0.18)";
            ctx.fillRect(4, 40 + r() * 10, 248, 18);
          }
          ctx.restore();
        });
      },
      { clamp: true },
    );
  }
  /** PPI radar scope face: range rings, bearing ticks, land clutter, a phosphor sweep and afterglow blips. */
  function ppiTex() {
    return PH.canvasTex("ph_hudson_ppi", 256, 256, (ctx, w, h) => {
      const cx = w / 2,
        cy = h / 2,
        R = w * 0.47,
        r = PH.rng("ppi");
      ctx.fillStyle = "#050805";
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, R);
      g.addColorStop(0, "#0e2a14");
      g.addColorStop(1, "#06140a");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.clip();
      // land returns (Manhattan / Brooklyn / the islands)
      for (let i = 0; i < 260; i++) {
        const a = -2.2 + r() * 1.9,
          d = R * (0.35 + r() * 0.7);
        ctx.fillStyle = "rgba(90,255,120," + (0.08 + r() * 0.22) + ")";
        ctx.fillRect(
          cx + Math.cos(a) * d,
          cy + Math.sin(a) * d,
          1 + r() * 3,
          1 + r() * 3,
        );
      }
      // sweep with phosphor afterglow (60° trailing wedge)
      const a0 = -0.6;
      for (let k = 0; k < 60; k++) {
        const a = a0 - k * 0.018;
        ctx.strokeStyle =
          "rgba(110,255,140," + 0.5 * Math.pow(1 - k / 60, 2) + ")";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(200,255,210,0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R);
      ctx.stroke();
      // contacts
      for (const [a, d] of [
        [0.6, 0.55],
        [2.4, 0.3],
        [-1.1, 0.72],
        [1.7, 0.8],
        [3.4, 0.45],
      ]) {
        const x = cx + Math.cos(a) * R * d,
          y = cy + Math.sin(a) * R * d;
        const gg = ctx.createRadialGradient(x, y, 0, x, y, 7);
        gg.addColorStop(0, "rgba(210,255,215,1)");
        gg.addColorStop(1, "rgba(90,255,120,0)");
        ctx.fillStyle = gg;
        ctx.fillRect(x - 8, y - 8, 16, 16);
      }
      ctx.restore();
      // range rings & bearing ticks
      ctx.strokeStyle = "rgba(90,255,120,0.35)";
      ctx.lineWidth = 1;
      for (let k = 1; k <= 4; k++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (R * k) / 4, 0, TAU);
        ctx.stroke();
      }
      for (let k = 0; k < 36; k++) {
        const a = (k / 36) * TAU,
          l = k % 9 === 0 ? 12 : 6;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.lineTo(cx + Math.cos(a) * (R - l), cy + Math.sin(a) * (R - l));
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - R, cy);
      ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R);
      ctx.lineTo(cx, cy + R);
      ctx.stroke();
    });
  }
  /** Two edge-lit plexiglass boards side by side: surface status plot | the Commodore's bounty board. */
  function boardsTex() {
    return PH.canvasTex(
      "ph_hudson_boards",
      1024,
      256,
      (ctx) => {
        const r = PH.rng("boards");
        const board = (x0, title, rows, foot) => {
          const g = ctx.createLinearGradient(x0, 0, x0 + 512, 256);
          g.addColorStop(0, "#0d1a1a");
          g.addColorStop(1, "#0a1414");
          ctx.fillStyle = g;
          ctx.fillRect(x0, 0, 512, 256);
          ctx.strokeStyle = "rgba(190,230,210,0.16)";
          ctx.lineWidth = 1;
          for (let y = 44; y < 240; y += 26) {
            ctx.beginPath();
            ctx.moveTo(x0 + 8, y);
            ctx.lineTo(x0 + 504, y);
            ctx.stroke();
          }
          ctx.fillStyle = "#e8f0e4";
          ctx.font = 'bold 22px "Arial Black", Impact, sans-serif';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(title, x0 + 256, 22);
          ctx.textAlign = "left";
          ctx.font = 'bold 17px "Comic Sans MS", "Segoe Print", cursive';
          rows.forEach((row, i) => {
            ctx.fillStyle = row[1] || "#ffd23a";
            ctx.fillText(row[0], x0 + 14, 58 + i * 26);
          });
          if (foot) {
            ctx.fillStyle = "#ff7a3a";
            ctx.fillText(foot, x0 + 14, 236);
          }
          // grease smears
          for (let k = 0; k < 20; k++) {
            ctx.fillStyle = "rgba(255,220,120," + (0.03 + r() * 0.05) + ")";
            ctx.beginPath();
            ctx.ellipse(
              x0 + r() * 512,
              r() * 256,
              10 + r() * 40,
              4 + r() * 12,
              r() * 3,
              0,
              TAU,
            );
            ctx.fill();
          }
          ctx.strokeStyle = "rgba(160,200,190,0.5)";
          ctx.lineWidth = 6;
          ctx.strokeRect(x0 + 3, 3, 506, 250);
        };
        board(
          0,
          "SURFACE STATUS",
          [
            ["TRK  BRG  RNG   ID"],
            ["A    245  3.2   SKIFF (ELLIS) - TAKE IT"],
            ["B    180  5.8   LIBERTY - ROBOTS. AVOID", "#ff9a5a"],
            ["C    310  1.1   SHELLBACKS?? (KEGS SAYS)"],
            ["D    015  0.4   COAL BARGE - OURS NOW"],
            ["E    200  2.6   BATTERY TOLL BOAT"],
          ],
          "SKIFFS TAKEN: |||| |||| ||",
        );
        board(
          512,
          "COMMODORE'S BOUNTY BOARD",
          [
            ["REGISTRAR VELL ........ 500 SCRIP"],
            ["DOC TRAN (ALIVE!) ..... 300"],
            ['"PUMPS" OKAFOR ........ 50'],
            ["SWEET TOOTH ........... DON'T", "#ff9a5a"],
            ["THE ICEBOX KID ........ ???", "#ff9a5a"],
            ["BOSUN KEGS (OWES ME) .. 20"],
          ],
          "PAYABLE IN SCRIP, RUM, OR TEETH",
        );
      },
      { clamp: true },
    );
  }
  /** Dead-reckoning tracer chart: grid paper under glass, pencil tracks with time ticks, grease-pencil circles. */
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
  function fireStation(b, x, y, z, ry) {
    const P = (lx, lz) => W2(x, z, ry, lx, lz);
    let [px, pz] = P(0, 0.02);
    b.box("paint_red", px, y, pz, 1.0, 1.25, 0.04, {
      ry,
      seg: false,
      grime: 0.45,
    });
    [px, pz] = P(0.05, 0.2);
    b.add("canvas", new THREE.TorusGeometry(0.3, 0.09, 6, 16), {
      m: PH.m4(px, y + 0.72, pz, ry),
      c: 0xc0a878,
    });
    b.cyl("paint_red", px, y + 0.72, pz, 0.12, 0.12, 0.34, 10, {
      ry,
      rx: HP,
      hSeg: 1,
    });
    [px, pz] = P(-0.38, 0.12);
    b.rod("paint_red", V(px, y + 0.1, pz), V(px, y + 1.2, pz), 0.05, 6);
    b.add("paint_red", new THREE.TorusGeometry(0.11, 0.018, 5, 12), {
      m: PH.m4(px, y + 1.05, pz + 0, ry, HP, 0),
    });
    [px, pz] = P(0.35, 0.16);
    b.rod("bronze", V(px, y + 0.2, pz), V(px, y + 0.62, pz), 0.035, 6, {
      r2: 0.018,
    });
    [px, pz] = P(0, 0.03);
    label(b, "FIRE STATION", px, y + 1.45, pz, ry, 0.9);
  }
  /** Sound-powered phone box with handset on its hook. */
  function phone(b, x, y, z, ry) {
    const [px, pz] = W2(x, z, ry, 0, 0.08);
    b.box("navy", px, y - 0.2, pz, 0.28, 0.4, 0.14, { ry, seg: false });
    const [hx, hz] = W2(x, z, ry, 0.05, 0.17);
    b.box("black", hx, y - 0.12, hz, 0.06, 0.26, 0.06, { ry, seg: false });
    const [cx, cz] = W2(x, z, ry, -0.1, 0.16);
    b.cyl("chrome", cx, y + 0.08, cz, 0.04, 0.04, 0.03, 8, {
      ry,
      rx: HP,
      hSeg: 1,
    });
  }
  /** Gauge board: grey panel with six dial gauges (white faces, black needles) and a tag line. */
  function gauges(b, x, y, z, ry, n) {
    n = n || 6;
    const [px, pz] = W2(x, z, ry, 0, 0.03);
    b.box("panel", px, y - 0.35, pz, n * 0.26 + 0.2, 0.7, 0.05, {
      ry,
      seg: false,
    });
    for (let i = 0; i < n; i++) {
      const lx = -((n - 1) * 0.26) / 2 + i * 0.26,
        ly = (i % 2) * 0.22 - 0.1;
      const [gx, gz] = W2(x, z, ry, lx, 0.08);
      b.cyl("chrome", gx, y + ly, gz, 0.1, 0.1, 0.05, 12, {
        ry,
        rx: HP,
        hSeg: 1,
      });
      const [fx, fz] = W2(x, z, ry, lx, 0.107);
      b.cyl("paint_white", fx, y + ly, fz, 0.082, 0.082, 0.005, 12, {
        ry,
        rx: HP,
        hSeg: 1,
        noAO: true,
      });
      const [nx, nz] = W2(x, z, ry, lx, 0.113);
      b.box("black", nx, y + ly - 0.005, nz, 0.012, 0.075, 0.004, {
        ry,
        rz: -1.2 + i * 0.5,
        seg: false,
        noAO: true,
      });
    }
  }
  /** Damage-control locker (red cabinet, collider) + optional shoring timber stack beside it. */
  function dcLocker(b, x, z, y, ry, shoring) {
    const [px, pz] = W2(x, z, ry, 0, 0.24);
    b.box("paint_red", px, y, pz, 0.95, 1.7, 0.46, {
      ry,
      seg: false,
      grime: 0.5,
    });
    const [dx, dz] = W2(x, z, ry, 0, 0.475);
    b.box("iron", dx, y + 0.2, dz, 0.02, 1.3, 0.02, { ry, seg: false });
    const [hx, hz] = W2(x, z, ry, 0.3, 0.5);
    b.box("chrome", hx, y + 0.9, hz, 0.04, 0.16, 0.04, { ry, seg: false });
    PH.col(px, pz, 0.95, 0.46, y, y + 1.7, ry, { walkable: false });
    const [lx, lz] = W2(x, z, ry, 0, 0.48);
    label(b, "DAMAGE CONTROL", lx, y + 1.45, lz, ry, 0.8);
    if (shoring) {
      for (let i = 0; i < 7; i++) {
        const [sx, sz] = W2(
          x,
          z,
          ry,
          -2.0 + (i % 3) * 0.12,
          0.2 + (i % 4) * 0.17,
        );
        b.box("wood", sx, y + ((i / 4) | 0) * 0.16, sz, 2.4, 0.15, 0.15, {
          ry,
          seg: false,
          grime: 0.6,
        });
      }
      const [sx, sz] = W2(x, z, ry, -2.0, 0.45);
      PH.col(sx, sz, 2.6, 0.75, y, y + 0.32, ry, {});
    }
  }
  /** Cabin door opening: jambs, head, coaming and an open steel leaf swung into the cabin. side = +1 (cabin toward +z) / -1. */
  function cabinDoor(b, x, y, zWall, side) {
    for (const s of [-1, 1])
      b.box("navy_dark", x + s * 0.6, y, zWall, 0.1, 2.15, 0.22, {
        seg: false,
      });
    b.box("navy_dark", x, y + 2.1, zWall, 1.3, 0.12, 0.22, { seg: false });
    b.box("navy_dark", x, y, zWall, 1.1, 0.08, 0.24, { seg: false });
    const hx = x - 0.55,
      a = 1.25; // hinge on the aft jamb, leaf ~70° open
    const cx = hx + Math.cos(a) * 0.52,
      cz = zWall + side * Math.sin(a) * 0.52;
    b.box("navy", cx, y + 0.04, cz, 1.04, 2.0, 0.05, {
      ry: -side * a,
      seg: false,
      grime: 0.5,
    });
    const kx = hx + Math.cos(a) * 0.92,
      kz = zWall + side * Math.sin(a) * 0.92;
    b.cyl("chrome", kx, y + 1.0, kz, 0.03, 0.03, 0.12, 6, {
      ry: -side * a,
      rx: HP,
      hSeg: 1,
    });
  }
  /** Floor litter: cans, bottles, paper, rags, a cardboard box or two. */
  function litter(b, x0, z0, x1, z1, y, n, seed) {
    const r = PH.rng("lit" + seed);
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0),
        z = z0 + r() * (z1 - z0),
        t = r();
      if (t < 0.3) {
        const lay = r() < 0.6;
        b.cyl("metal", x, lay ? y + 0.035 : y, z, 0.034, 0.034, 0.11, 7, {
          hSeg: 1,
          rz: lay ? HP : 0,
          ry: r() * 3,
          c: [0xc04030, 0xd0c8a0, 0x7090a0][(r() * 3) | 0],
        });
      } else if (t < 0.5) {
        const lay = r() < 0.5;
        b.cyl(
          r() < 0.5 ? "glass" : "paint_green",
          x,
          lay ? y + 0.045 : y,
          z,
          0.03,
          0.045,
          0.24,
          7,
          { hSeg: 1, rz: lay ? HP : 0, ry: r() * 3 },
        );
      } else if (t < 0.8)
        b.box("paper", x, y + 0.003, z, 0.21, 0.004, 0.28, {
          ry: r() * 3,
          seg: false,
          noAO: true,
        });
      else if (t < 0.93)
        b.box("fabric", x, y, z, 0.5, 0.06, 0.35, {
          ry: r() * 3,
          seg: false,
          c: [0x5a4a3a, 0x3a4a3a, 0x6a3a2a][(r() * 3) | 0],
        });
      else
        b.box("cardboard", x, y, z, 0.45, 0.3, 0.35, {
          ry: r() * 3,
          seg: false,
        });
    }
  }
  const decalKey = {};
  function decal(b, name, x, y, z, size, rot, wallRy) {
    if (decalKey[name] === undefined)
      decalKey[name] =
        PH.extMat("decal_" + name, () =>
          G.mats.decal ? G.mats.decal(name) : null,
        ) || null;
    const k = decalKey[name];
    if (!k) return;
    if (wallRy === undefined)
      b.quad(k, x, y + 0.012, z, size, size, { ry: rot || 0, rx: -HP });
    else {
      const [qx, qz] = W2(x, z, wallRy, 0, 0.015);
      b.quad(k, qx, y, qz, size, size, { ry: wallRy, rz: rot || 0 });
    }
  }

  // =====================================================================
  // THE PASS
  // =====================================================================
  PH.hudsonDress = function (b, D) {
    const { HOLD, SEC, MAIN, O1, BR } = D;
    const HULL = 8.84; // inner face of the shell plating
    const FR = (x0, k) => x0 + 1.2 * k; // mid-bay between hull frames

    // ---------------- deckheads ----------------
    const tubeX = (x, z, len) => [
      x - len / 2 - 0.05,
      z - 0.2,
      x + len / 2 + 0.05,
      z + 0.2,
    ];
    const COMPS = [
      { x0: -44, x1: -20, top: SEC - 0.3 }, // shaft alley
      { x0: -20, x1: 15, top: MAIN - 0.3 }, // engine room
      { x0: 15, x1: 22, top: SEC - 0.3, skip: [[15.5, 4.8, 21.7, 7.6]] }, // fire room (ladder hole)
      { x0: 22, x1: 44, top: SEC - 0.3, skip: [[37.1, 2.6, 38.9, 4.4]] }, // magazine (hoist trunk)
      { x0: -44, x1: -20, top: MAIN - 0.3, skip: [[-40.7, 3.4, -32.4, 7.0]] }, // berthing (quarterdeck stair)
      {
        x0: 15,
        x1: 36,
        top: MAIN - 0.3,
        skip: [
          [29.4, -9, 35.8, -4.7],
          tubeX(18, 0, 2.4),
          tubeX(23, 0, 2.4),
          tubeX(28, 0, 2.4),
          tubeX(33, 0, 2.4),
        ],
      }, // mess
      { x0: 36, x1: 44, top: MAIN - 0.3 }, // brig
      { x0: -44, x1: -32, top: MAIN + 4 }, // quarterdeck
      {
        x0: -32,
        x1: 20,
        top: MAIN + 3.4,
        skip: [
          [-23.3, -5.5, -22.7, -4.9],
          [11.6, -6.1, 12.4, -3.9],
        ].concat(
          [-28, -22, -16, -10, -4, 2, 8, 14].map((x) => tubeX(x, 0, 1.6)),
        ),
      }, // officers' passage
      {
        x0: 20,
        x1: 44,
        top: O1 - 0.3,
        skip: [
          [19.8, 2.8, 29, 8.4],
          [33.5, -4.6, 42.6, 5.8],
        ],
      }, // forward hall (trunk, barbette, hoist)
      {
        x0: 18,
        x1: 34,
        z0: -6.85,
        z1: 8.05,
        top: BR - 0.3,
        skip: [[21.1, 2.8, 29, 8.4], tubeX(24, 0, 2.4), tubeX(31, -4, 2.4)],
        girders: [-3.2, 1.6],
      }, // CIC
      {
        x0: 18,
        x1: 36,
        z0: -6.85,
        z1: 8.05,
        top: BR + 3.6,
        girders: [-3.2, 1.6],
      }, // bridge
    ];
    for (const c of COMPS) deckhead(b, c);

    // ---------------- hull-side services (pipes, cable trays) ----------------
    const RUNS = [
      // x0, x1, top, trays?, sides
      [-44, -20, SEC - 0.3, false],
      [-20, 15, MAIN - 0.3, true],
      [15, 22, SEC - 0.3, false],
      [22, 44, SEC - 0.3, false, [-1]],
      [-44, -20, MAIN - 0.3, true],
      [15, 36, MAIN - 0.3, true],
      [36, 44, MAIN - 0.3, false],
      [-44, -32, MAIN + 4, true],
      [-32, 20, MAIN + 3.4, false],
      [20, 44, O1 - 0.3, true],
    ];
    for (const [x0, x1, top, trays, sides] of RUNS) {
      for (const s of sides || [-1, 1]) {
        const z = s * 8.46;
        pipeX(
          b,
          x0 + 0.1,
          x1 - 0.1,
          top - 0.2,
          z,
          0.1,
          s < 0 ? "navy" : "paint_white",
          top,
          {
            band: s < 0 ? "paint_red" : "paint_blue",
            valves: true,
            valveKey: s < 0 ? "paint_red" : "paint_blue",
          },
        );
        pipeX(
          b,
          x0 + 0.1,
          x1 - 0.1,
          top - 0.36,
          s * 8.28,
          0.06,
          "iron",
          undefined,
          { band: "paint_yellow" },
        );
        if (trays) trayX(b, x0 + 0.2, x1 - 0.2, top - 0.42, s * 7.6, top);
      }
    }
    // pipe markers on the runs (one per compartment side)
    for (const [x, y, z, t] of [
      [-8, MAIN - 1.0, -8.3, "FIRE MAIN  ▶"],
      [-8, MAIN - 1.0, 8.3, "POTABLE WATER  ▶"],
      [25, MAIN - 1.0, -8.3, "FIRE MAIN  ▶"],
      [-30, MAIN - 1.0, 8.3, "STEAM  ▶"],
      [-38, MAIN + 3.2, -8.3, "FIRE MAIN  ▶"],
      [26, O1 - 1.0, 8.3, "FUEL OIL  ▶"],
    ]) {
      label(b, t, x, y, z, z < 0 ? 0 : Math.PI, 0.72);
    }
    // centreline vent ducts (berthing, mess, forward hall, engine room top)
    ductX(b, -43.6, -20.4, MAIN - 0.95, -1.6, 0.8, 0.45, MAIN - 0.3);
    ductX(b, 15.4, 29.2, MAIN - 0.95, -2.2, 0.7, 0.4, MAIN - 0.3);
    ductX(b, -19.6, 14.6, MAIN - 1.1, 4.4, 0.9, 0.5, MAIN - 0.3);
    ductX(b, 20.4, 33.2, O1 - 0.95, -2.0, 0.7, 0.4, O1 - 0.3);
    ductX(b, 18.4, 33.4, BR - 0.95, -5.0, 0.6, 0.38, BR - 0.3); // CIC (over the radar consoles)
    // risers
    for (const [x, z, y0, y1, k] of [
      [-36.8, 8.55, HOLD, SEC - 0.3, "paint_green"],
      [-30.8, 8.55, HOLD, SEC - 0.3, "iron"],
      [-15.2, 8.5, HOLD, MAIN - 0.3, "paint_white"],
      [-3.2, 8.5, HOLD, MAIN - 0.3, "paint_green"],
      [4.0, 8.5, HOLD, MAIN - 0.3, "iron"],
      [-11.6, -8.5, HOLD, SEC - 0.3, "paint_red"],
      [27.4, 8.5, SEC, MAIN - 0.3, "paint_white"],
      [-43.5, 8.5, MAIN, MAIN + 4, "paint_red"],
      [43.5, -8.5, MAIN, O1 - 0.3, "paint_white"],
    ])
      riser(b, x, z, y0, y1, 0.08, k);

    // ---------------- per-compartment fittings ----------------
    // SHAFT ALLEY
    lantern(b, -38, 2.9, -HULL, 0);
    lantern(b, -26, 2.9, -HULL, 0);
    label(b, "3-110-0-E", -43.84, 2.4, 5, HP, 0.9);
    gauges(b, -32, 2.3, -HULL, 0, 4);
    decal(b, "oil_stain", -30, HOLD + 0.32, 0.5, 2.2, 0.7);
    // ENGINE ROOM
    fireStation(b, FR(-20, 11), SEC + 0.3, HULL, Math.PI);
    gauges(b, -10.4, 2.3, -HULL, 0, 6);
    gauges(b, -1.4, 2.3, HULL, Math.PI, 6);
    phone(b, 1.6, SEC + 1.5, -HULL, 0);
    lantern(b, FR(-20, 4), SEC + 2.6, -HULL, 0);
    lantern(b, FR(-20, 23), SEC + 2.6, HULL, Math.PI);
    label(b, "4-72-0-E", -19.84, 6.5, -3, HP, 1.0);
    label(b, "CAUTION: HIGH VOLTAGE", 8.4, 2.9, -8.05, 0, 0.9);
    label(b, "DON'T NAP HERE", -19.83, 6.2, 3.5, HP, 1.6, 0.02);
    for (const [x, z, s, rt] of [
      [-2, 3.2, 2.4, 0.3],
      [6, -2.5, 1.8, 1.9],
      [-11, 5.5, 1.6, 2.6],
    ])
      decal(b, "oil_stain", x, HOLD, z, s, rt);
    litter(b, -1, -6, 12, 6, HOLD, 16, "eng");
    // FIRE ROOM
    lantern(b, FR(15, 5), 2.8, HULL, Math.PI);
    label(b, "4-58-0-E", 21.84, 2.6, 2.5, -HP, 0.9);
    label(b, "Ⓩ  ZEBRA", 21.84, 2.25, -1.7, -HP, 0.6);
    decal(b, "scorch", 18.5, HOLD, -3.5, 2.0, 0.4);
    // MAGAZINE
    label(b, "4-40-0-M", 22.16, 2.6, 3, HP, 0.9);
    label(b, "NO SMOKING", 22.16, 2.2, 3, HP, 0.9);
    lantern(b, 43.84, 3.0, 5.5, -HP);
    // BERTHING
    fireStation(b, -43.85, SEC + 0.3, 2.2, HP);
    label(b, "2-110-0-L", -43.84, 7.3, -1, HP, 0.9);
    lantern(b, FR(-44, 15), SEC + 2.95, HULL, Math.PI);
    lantern(b, FR(-44, 6), SEC + 2.95, HULL, Math.PI);
    decal(b, "graffiti_skull", -20.16, SEC + 1.7, 3.2, 1.6, 0, -HP);
    label(b, "KEGS WAS HERE", -20.17, SEC + 0.9, 5.4, -HP, 1.4, 0.02);
    for (const [x, z, s] of [
      [-29, -1.5, 1.4],
      [-34.5, 3.2, 1.0],
    ])
      decal(b, "blood_pool", x, SEC, z, s, x);
    litter(b, -43, -2.4, -21, 2.4, SEC, 34, "berth");
    // sea bags against the racks
    {
      const r = PH.rng("seabags");
      for (let i = 0; i < 6; i++)
        b.cyl(
          "canvas",
          -40 + i * 3.1 + r(),
          SEC + 0.25,
          -2.35 + (i % 2) * 4.6,
          0.24,
          0.24,
          0.8,
          8,
          { rx: HP, ry: r() * 3, hSeg: 1, c: 0x8a8468 },
        );
    }
    // MESS
    fireStation(b, FR(15, 12), SEC + 0.3, HULL, Math.PI);
    lantern(b, FR(15, 6), SEC + 2.95, HULL, Math.PI);
    label(b, "2-52-0-L", 15.16, 7.4, -3, HP, 0.9);
    phone(b, 15.16, SEC + 1.5, 3.5, HP);
    label(b, "HATCH 4 EVER", 15.17, SEC + 1.2, -6.5, HP, 1.6, 0.02);
    decal(b, "graffiti_raiders", 35.84, SEC + 3.25, -6.2, 1.5, 0, -HP);
    for (const [x, z, s] of [
      [26, -1.8, 1.6],
      [31.5, 4.2, 1.1],
    ])
      decal(b, "blood_pool", x, SEC, z, s, x);
    decal(b, "paper_litter", 24, SEC, 2.4, 2.0, 1.1);
    litter(b, 21.5, -4.4, 35, 7.5, SEC, 36, "mess");
    // BRIG
    label(b, "2-36-0-L", 36.16, 7.2, -2.6, HP, 0.9);
    decal(b, "blood_pool", 42.5, SEC, -5.5, 1.3, 2.2);
    decal(b, "blood_smear", 43.84, SEC + 1.1, -5.2, 1.4, 0.3, -HP);
    label(b, "SHARKS BELOW", 43.83, SEC + 1.8, 5.4, -HP, 1.3, 0.02);
    for (let g = 0; g < 4; g++)
      for (let i = 0; i < 5; i++) {
        // days scratched on the cell wall, in fives
        const zz = 4.6 - g * 0.42 - (i < 4 ? i * 0.06 : 0.09),
          yy = SEC + 1.35 + (g % 2) * 0.05;
        b.box("paint_white", 43.83, yy, zz, 0.004, 0.2, 0.016, {
          rx: i === 4 ? 1.1 : 0,
          seg: false,
          noAO: true,
        });
      }
    // QUARTERDECK
    fireStation(b, FR(-44, 5), MAIN + 0.3, HULL, Math.PI);
    lantern(b, FR(-44, 8), MAIN + 3.0, -HULL, 0);
    label(b, "1-120-0-L", -32.16, MAIN + 2.6, 2.2, -HP, 0.9);
    label(b, "KEEP CLOSED", -32.16, MAIN + 2.1, 0, -HP, 0.8);
    label(b, "TOLL OR ROLL", -43.83, MAIN + 2.9, 0, HP, 1.8, 0.02);
    litter(b, -41, -5, -33.5, 3.4, MAIN, 18, "qd");
    // OFFICERS' PASSAGE: cabin door frames & open leaves, fire station, phone, lanterns, labels
    for (const x of [-24, -6, 11]) {
      cabinDoor(b, x, MAIN, -1.3, -1);
      cabinDoor(b, x, MAIN, 1.3, 1);
    }
    fireStation(b, -10, MAIN + 0.3, -1.22, 0);
    phone(b, 0, MAIN + 1.5, 1.22, Math.PI);
    lantern(b, -18, MAIN + 2.7, 1.22, Math.PI);
    lantern(b, 15, MAIN + 2.7, -1.22, 0);
    label(b, "1-80-0-L", -31.84, MAIN + 2.2, 0, HP, 0.9);
    label(b, "BATTLE DRESSING STA.", 11, MAIN + 2.35, -1.22, 0, 1.0);
    label(b, "ELLIS IS SOFT", -20, MAIN + 1.3, 1.23, Math.PI, 1.7, 0.02);
    decal(b, "blood_smear", -3, MAIN + 1.0, -1.22, 1.3, 1.2, 0);
    litter(b, -31, -1.1, 19, 1.1, MAIN, 22, "pass");
    // FORWARD HALL
    dcLocker(b, FR(20, 6), -HULL, MAIN, 0, true);
    fireStation(b, FR(20, 11), MAIN + 0.3, HULL, Math.PI);
    lantern(b, FR(20, 19), MAIN + 3.0, HULL, Math.PI);
    phone(b, 20.16, MAIN + 1.5, -5.5, HP);
    label(b, "1-40-0-L", 20.16, MAIN + 2.9, -3, HP, 0.9);
    label(b, "☠ MINE ☠", 33.74, MAIN + 1.6, 0.6, -HP, 0.9, 0); // on the barbette's aft face, between the ribs
    decal(b, "blood_pool", 25, MAIN, -2.5, 1.5, 0.8);
    decal(b, "oil_stain", 31, MAIN, 1.5, 1.6, 2.1);
    litter(b, 21.5, -4.6, 32, 2.2, MAIN, 22, "fwd");
    PH.propAt("first_aid", 12.6, MAIN + 1.4, -1.22, 0, {
      loot: "first_aid",
      name: "Battle Dressing Station",
    });

    // ---------------- CIC ----------------
    {
      const y = O1;
      label(b, "01-50-0-C", 18.16, y + 3.0, -5.5, HP, 0.9);
      // DRT plotting table: steel cabinet, chart under glass lit from below, rim, parallel rulers
      b.boxMM("navy_dark", 23, y, -3.5, 29, y + 0.82, -0.5, {
        seg: false,
        grime: 0.5,
      });
      b.boxMM("black", 22.9, y + 0.82, -3.6, 29.1, y + 0.9, -0.4, {
        seg: false,
      });
      const drt = PH.texMat("hudson_drt", drtTex(), { emissive: 0.22 });
      b.quad(drt, 26, y + 0.905, -2, 5.9, 2.9, { rx: -HP });
      b.boxMM("glass", 23.05, y + 0.91, -3.45, 28.95, y + 0.925, -0.55, {
        seg: false,
        grime: 0.15,
      });
      b.boxMM("chrome", 24.6, y + 0.93, -2.6, 26.2, y + 0.945, -2.5, {
        seg: false,
      });
      b.boxMM("chrome", 24.6, y + 0.93, -2.3, 26.2, y + 0.945, -2.2, {
        seg: false,
      });
      for (let i = 0; i < 5; i++)
        b.box(
          i % 2 ? "paint_red" : "paint_yellow",
          27 + i * 0.25,
          y + 0.93,
          -1.0,
          0.02,
          0.02,
          0.14,
          { ry: 0.3 * i, seg: false, noAO: true },
        ); // grease pencils
      b.box("chrome", 28.2, y + 0.93, -3.0, 0.3, 0.02, 0.3, { seg: false });
      PH.colMM(22.9, y, -3.6, 29.1, y + 0.93, -0.4, {});
      b.addLight(26, y + 1.4, -2, 0xd8f0d0, 5.5, 0.3);
      // status boards (edge-lit plexiglass in steel frames): surface plot on the aft wall, bounty board free-standing forward
      const bK = PH.texMat("hudson_boards", boardsTex(), { emissive: 0.85 });
      b.quad(bK, 18.19, y + 2.15, -2.6, 4.2, 2.1, {
        ry: HP,
        uvRect: [0, 0, 0.5, 1],
      });
      for (const zz of [-4.75, -0.45])
        b.box("navy_dark", 18.22, y + 0.9, zz, 0.08, 2.6, 0.1, { seg: false });
      for (const yy of [y + 1.07, y + 3.22])
        b.box("navy_dark", 18.22, yy, -2.6, 0.08, 0.08, 4.4, { seg: false });
      for (let k = 0; k < 5; k++)
        b.box("lamp", 18.25, y + 3.16, -4.4 + k * 0.9, 0.03, 0.03, 0.5, {
          seg: false,
          noAO: true,
        }); // edge lights
      b.quad(bK, 31.4, y + 2.15, 3.02, 4.2, 2.1, {
        ry: Math.PI,
        uvRect: [0.5, 0, 1, 1],
      });
      b.quad(bK, 31.4, y + 2.15, 3.08, 4.2, 2.1, {
        ry: 0,
        uvRect: [0.5, 0, 1, 1],
      });
      for (const xx of [29.2, 33.6]) {
        b.box("navy_dark", xx, y, 3.05, 0.1, 3.9, 0.1, { seg: false });
        PH.col(xx, 3.05, 0.14, 0.14, y, y + 3.9, 0, { walkable: false });
      }
      for (const yy of [y + 1.07, y + 3.22])
        b.box("navy_dark", 31.4, yy, 3.05, 4.4, 0.08, 0.08, { seg: false });
      PH.col(31.4, 3.05, 4.3, 0.08, y + 1.05, y + 3.25, 0, { walkable: false });
      b.addLight(19.2, y + 2.2, -2.6, 0xffe0a0, 4.5, 0.4);
      b.addLight(31.4, y + 2.2, 2.2, 0xffe0a0, 4.5, 0.4);
      PH.readAt(
        18.6,
        y + 1.9,
        -2.6,
        "Surface Status Board",
        'Grease pencil on plexiglass, written backwards from behind by someone who was bad at it. Track A: "SKIFF (ELLIS) — TAKE IT." Track B, Liberty Island: "ROBOTS. AVOID." Track C: "SHELLBACKS?? (KEGS SAYS)." At the bottom a tally: SKIFFS TAKEN — twelve.',
      );
      PH.readAt(
        31.4,
        y + 1.9,
        2.6,
        "The Commodore's Bounty Board",
        'REGISTRAR VELL — 500 SCRIP. DOC TRAN (ALIVE!) — 300. "PUMPS" OKAFOR — 50. SWEET TOOTH — DON\'T. THE ICEBOX KID (C-9 SLEEPER) — ???. BOSUN KEGS (OWES ME) — 20. Payable in scrip, rum, or teeth.',
      );
      // cable trays & a battle lantern
      trayX(b, 18.4, 33.6, BR - 0.72, -6.2, BR - 0.3);
      lantern(b, 33.84, y + 3.0, 4.8, -HP);
      phone(b, 18.16, y + 1.5, 1.8, HP);
      litter(b, 19, -4.5, 33, 2.2, y, 14, "cic");
    }

    // ---------------- BRIDGE ----------------
    {
      const y = BR;
      label(b, "04-44-0-C", 18.16, y + 2.95, -5.2, HP, 0.9);
      // voice tubes: bronze pipes dropping from the deckhead to bell mouths at the helm & chart table
      for (const [x, z] of [
        [31.6, -0.9],
        [31.6, 0.9],
        [24.2, -4.0],
        [33.8, -5.2],
      ]) {
        b.rod("bronze", V(x, y + 3.6, z), V(x, y + 1.75, z), 0.045, 8);
        b.lathe(
          "bronze",
          [
            [0.045, 0],
            [0.07, -0.08],
            [0.12, -0.18],
            [0.125, -0.2],
          ],
          12,
          x,
          y + 1.75,
          z,
          {},
        );
        b.cyl("black", x, y + 1.55, z, 0.11, 0.11, 0.01, 12, { hSeg: 1 });
      }
      for (const z of [-0.9, 0.9])
        b.rod("bronze", V(31.6, y + 3.5, z), V(18.5, y + 3.5, z), 0.045, 8);
      // overhead gyro-compass repeater & clinometer over the helm
      b.cyl("navy_dark", 32.1, y + 2.75, 0, 0.32, 0.32, 0.14, 16, {
        rz: HP,
        hSeg: 1,
      });
      b.cyl("paint_white", 31.96, y + 2.75, 0, 0.26, 0.26, 0.02, 16, {
        rz: HP,
        hSeg: 1,
        noAO: true,
      });
      b.rod("iron", V(32.1, y + 2.9, 0), V(32.1, y + 3.6, 0), 0.03, 5);
      // engine-order telegraph dials (faces) on the existing pedestals
      for (const z of [-1.6, 1.6])
        b.cyl("paint_white", 33.05, y + 1.15, z, 0.24, 0.24, 0.01, 14, {
          rz: HP,
          hSeg: 1,
          noAO: true,
        });
      // ---- THE COMMODORE'S THRONE ----
      // dais: 16" powder cans and plate on the old deck, a salvaged captain's chair on top
      const r = PH.rng("throne");
      for (let i = 0; i < 12; i++) {
        const px = 27.25 + (i % 3) * 0.72,
          pz = -1.65 + ((i / 3) | 0) * 1.1;
        b.cyl("bronze", px, y, pz, 0.34, 0.34, 0.46, 12, {
          hSeg: 1,
          grime: 0.55,
          c: 0xb89868,
        });
      }
      b.boxMM("diamond", 26.9, y + 0.46, -2.05, 29.1, y + 0.52, 2.05, {
        seg: false,
        grime: 0.6,
      });
      PH.stairs(b, "crate", 29.55, 0, HP * -1, 1.4, 0.45, y, y + 0.5, {
        maxRise: 0.26,
      }); // two ammo-crate steps up to the dais
      const cx = 28.05;
      b.cyl("chrome", cx, y + 0.52, 0, 0.1, 0.18, 0.42, 10, { hSeg: 1 }); // pedestal
      b.box("leather", cx, y + 0.94, 0, 0.78, 0.16, 0.76, {
        seg: false,
        c: 0x8a1c18,
      }); // seat
      b.box("leather", cx - 0.4, y + 1.0, 0, 0.16, 1.55, 0.8, {
        seg: false,
        c: 0x8a1c18,
      }); // tall back
      b.box("bronze", cx - 0.48, y + 1.0, 0, 0.04, 1.62, 0.9, { seg: false }); // gilt frame
      for (const s of [-1, 1]) {
        b.box("bronze", cx - 0.05, y + 1.1, s * 0.44, 0.7, 0.06, 0.08, {
          seg: false,
        }); // armrests
        b.box("bronze", cx + 0.25, y + 0.94, s * 0.44, 0.06, 0.2, 0.06, {
          seg: false,
        });
      }
      b.cyl("bronze", cx - 0.44, y + 2.62, 0, 0.26, 0.26, 0.04, 16, {
        rz: HP,
        hSeg: 1,
      }); // crest disc
      b.sphere("bone", cx - 0.4, y + 2.66, 0, 0.12, { sx: 1.0, sy: 1.1 }); // skull on the crest
      for (const s of [-1, 1]) {
        // a 16" shell standing either side of the throne, a skull on each nose
        const sx = 28.4,
          sz = s * 1.6;
        b.cyl("navy_dark", sx, y + 0.52, sz, 0.2, 0.2, 1.0, 12, { hSeg: 1 });
        b.cyl("bronze", sx, y + 0.72, sz, 0.205, 0.205, 0.1, 12, { hSeg: 1 });
        b.lathe(
          "navy_dark",
          [
            [0.2, 0],
            [0.19, 0.25],
            [0.12, 0.5],
            [0.02, 0.64],
          ],
          12,
          sx,
          y + 1.52,
          sz,
          {},
        );
        b.sphere("bone", sx, y + 2.2, sz, 0.11, { sx: 1.0, sy: 1.12 });
        PH.col(sx, sz, 0.42, 0.42, y + 0.52, y + 2.2, 0, { walkable: false });
      }
      // scrap backdrop behind the throne (hull plate, a stop sign, pipe frame) and loot at its feet
      // patchwork of salvaged plate on a pipe frame (knee-to-shoulder high, so the bridge stays open)
      [
        [-1.2, 0.9, "navyplate", 0.05, 1.5],
        [-0.1, 1.1, "corrugated", -0.04, 1.8],
        [1.05, 1.0, "hull_red", 0.06, 1.4],
      ].forEach(([dz, w, k, rz, hh]) =>
        b.box(k, 26.88, y + 0.5, dz, 0.05, hh, w, {
          rx: rz,
          seg: false,
          grime: 0.6,
        }),
      );
      for (const s of [-1, 1])
        b.rod(
          "iron",
          V(26.95, y, s * 1.75),
          V(26.95, y + 2.6, s * 1.75),
          0.05,
          6,
        );
      b.rod("iron", V(26.95, y + 2.55, -1.8), V(26.95, y + 2.55, 1.8), 0.05, 6);
      const jolly = PH.texMat(
        "navy_jolly",
        PH.canvasTex("ph_jolly", 8, 8, () => {}),
        { double: true },
      );
      b.quad(jolly, 26.99, y + 1.85, 0, 1.6, 1.0, { ry: HP });
      b.quad(jolly, 26.77, y + 1.85, 0, 1.6, 1.0, { ry: -HP });
      PH.col(26.88, 0, 0.2, 3.5, y, y + 2.3, 0, { walkable: false });
      for (let i = 0; i < 9; i++) {
        const a = r() * TAU,
          d = 0.9 + r() * 0.5,
          px = 29.4 + Math.cos(a) * 0.4,
          pz = Math.sin(a) * d * 1.3;
        if (Math.abs(pz) < 0.8 && px > 29.1) continue;
        b.box(
          ["cardboard", "crate", "metal", "leather"][i % 4],
          px,
          y + (px < 29.05 ? 0.52 : 0),
          pz,
          0.34,
          0.26,
          0.34,
          { ry: r() * 3, seg: false },
        );
      }
      for (let i = 0; i < 30; i++)
        b.cyl(
          "chrome",
          28.3 + r() * 0.7,
          y + 0.53,
          -1.4 + r() * 2.8,
          0.03,
          0.03,
          0.006,
          8,
          { hSeg: 1 },
        ); // spilled scrip
      decal(b, "blood_pool", 30.4, y, 0.4, 1.4, 0.4);
      label(b, "HATCH 4 EVER", 18.17, y + 1.5, 1.4, HP, 1.4, 0.02);
      trayX(b, 18.4, 35.6, y + 3.1, 6.6, y + 3.6);
      litter(b, 20, -6, 26.4, 2.5, y, 14, "bridge");
    }
  };
})();
