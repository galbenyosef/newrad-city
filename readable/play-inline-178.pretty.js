/* src/poi_midtown/30_penn.js */
/* =====================================================================
 * NEW RAD CITY — poi_midtown / 30_penn.js
 * PENNSYLVANIA STATION — the ORIGINAL McKim, Mead & White station (1910).
 * In this timeline it was never torn down; the bombs did the job instead.
 * Exterior: pink-granite block, the Seventh Avenue Doric colonnade with the
 *   central pavilion, attic clock and stone EAGLES, the waiting-room block
 *   rising behind with its semicircular THERMAL WINDOWS, glass concourse
 *   vaults on the Eighth Avenue side, fallen column drums on the avenue.
 * Interior (INTERIORS.penn_station, origin 5400,0,800) — Maniac dungeon:
 *   Seventh Avenue ARCADE (barrel vault, shopfronts, toppled statue) → grand
 *   stair DOWN → MAIN WAITING ROOM (Roman-bath coffered vault, giant
 *   Corinthian columns, Diocletian windows, benches, ticket office,
 *   departure board) → steel-and-glass CONCOURSE → three stairways DOWN →
 *   PLATFORMS (track beds, derailed GG1-style electric locomotive, an
 *   enterable coach bridging the platforms, east tunnel with the baggage car
 *   and the Conductor) → service stair UP → BAGGAGE ROOM → waiting room.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.PMID) return;
  const K = G.PMID.kit,
    F = K.f,
    T = K.T;
  const PI = Math.PI,
    HP = PI / 2;

  function art() {
    // McKim, Mead & White's granite: two monumental storeys per 13.2 m, tall multi-light windows between Doric pilasters
    K.facade("penn_stone", {
      bays: 4,
      floors: 2,
      bayW: 3.3,
      floorH: 6.6,
      wall: "#c9b4a4",
      seed: 71,
      blocks: true,
      win: { x0: 0.25, x1: 0.75, y0: 0.1, y1: 0.84 },
      frame: "#2e2a26",
      glass: "#1c2426",
      broken: 0.5,
      boarded: 0.2,
      mullions: 2,
      sill: "#dccab8",
      lintel: true,
    });
    K.paint("penn_name", 1600, 140, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      K.fitText(
        x,
        "PENNSYLVANIA  STATION",
        w / 2,
        h / 2 + 4,
        w - 40,
        116,
        "bold ",
        "#2e241c",
        "#e8dccc",
        3,
      );
    });
    K.litPaint("penn_clockdial", 256, 256, (x, w) => {
      const c = w / 2;
      x.fillStyle = "#2a241e";
      x.fillRect(0, 0, w, w);
      x.fillStyle = "#e8e2d0";
      x.beginPath();
      x.arc(c, c, c - 6, 0, 7);
      x.fill();
      x.strokeStyle = "#2a241e";
      x.lineWidth = 4;
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * PI * 2,
          r0 = i % 5 ? c - 18 : c - 30;
        x.beginPath();
        x.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
        x.lineTo(c + Math.cos(a) * (c - 10), c + Math.sin(a) * (c - 10));
        x.stroke();
      }
      x.lineCap = "round";
      x.lineWidth = 9;
      x.beginPath();
      x.moveTo(c, c);
      x.lineTo(
        c + Math.cos(-HP + (9.78 / 12) * PI * 2) * 58,
        c + Math.sin(-HP + (9.78 / 12) * PI * 2) * 58,
      );
      x.stroke();
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(c, c);
      x.lineTo(
        c + Math.cos(-HP + (47 / 60) * PI * 2) * 92,
        c + Math.sin(-HP + (47 / 60) * PI * 2) * 92,
      );
      x.stroke();
      K.stains(x, w, w, 5, 72, 0.3);
    });
    // Diocletian window: daylight seen through grimy panes with lead cames (self-lit)
    K.litPaint("penn_thermal", 512, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#c8d0a0");
      g.addColorStop(1, "#8a9a6a");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      K.stains(x, w, h, 20, 73, 0.5, "60,70,40");
      x.strokeStyle = "#2a2a22";
      x.lineWidth = 3;
      for (let i = 0; i < w; i += 32) {
        x.beginPath();
        x.moveTo(i, 0);
        x.lineTo(i, h);
        x.stroke();
      }
      for (let j = 0; j < h; j += 40) {
        x.beginPath();
        x.moveTo(0, j);
        x.lineTo(w, j);
        x.stroke();
      }
      x.fillStyle = "#1a1c16";
      for (let i = 0; i < 16; i++)
        x.fillRect(((i * 157) % 16) * 32 + 2, ((i * 71) % 6) * 40 + 2, 28, 36); // missing panes
    });
    K.litPaint("penn_sky", 256, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#b8c490");
      g.addColorStop(1, "#94a070");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      K.stains(x, w, h, 12, 74, 0.45, "50,60,30");
      x.strokeStyle = "#1e201a";
      x.lineWidth = 4;
      x.strokeRect(0, 0, w, h);
      x.beginPath();
      x.moveTo(w / 2, 0);
      x.lineTo(w / 2, h);
      x.moveTo(0, h / 2);
      x.lineTo(w, h / 2);
      x.stroke();
    });
    K.litPaint("penn_board", 1024, 512, (x, w, h) => {
      x.fillStyle = "#0c0e10";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#e8e0c8";
      x.font = "bold 34px " + K.SANS;
      x.textAlign = "left";
      x.fillText("PENNSYLVANIA RAILROAD  —  DEPARTURES", 30, 52);
      x.fillStyle = "#8a8a80";
      x.fillRect(30, 66, w - 60, 3);
      const rows = [
        ["9:40", "THE BROADWAY LIMITED", "CHICAGO", "CANCELLED"],
        ["9:45", "THE CONGRESSIONAL", "WASHINGTON", "CANCELLED"],
        ["9:50", "KEYSTONE EXPRESS", "PHILADELPHIA", "BOARDING  TRK 3"],
        ["9:55", "THE SPIRIT OF ST. LOUIS", "ST. LOUIS", "CANCELLED"],
        [
          "10:05",
          "CIVIL DEFENSE EXTRA",
          "SHELTER TRAIN (CIVIL DEF.)",
          "SEE AGENT",
        ],
        ["10:10", "THE PAN-AMERICAN", "MIAMI", "—  —  —"],
      ];
      rows.forEach((r, i) => {
        const y = 110 + i * 62;
        x.fillStyle = "#1a1c1e";
        x.fillRect(24, y - 34, w - 48, 50);
        x.font = "bold 28px monospace";
        x.fillStyle = "#ffd060";
        x.fillText(r[0], 36, y);
        x.fillStyle = "#e8e8e0";
        x.fillText(r[1], 140, y);
        x.fillText(r[2], 560, y);
        x.fillStyle = r[3].indexOf("CANC") >= 0 ? "#ff5a3a" : "#6aff7a";
        x.fillText(r[3], 800, y);
      });
      x.fillStyle = "#ff5a3a";
      x.font = "bold 24px monospace";
      x.fillText(
        "*** CIVIL DEFENSE: PROCEED CALMLY TO NEAREST SHELTER ***",
        60,
        h - 20,
      );
    });
    const shops = [
      "NEWS · CIGARS",
      "DRUGS",
      "SHOE SHINE",
      "LUNCHEONETTE",
      "FLOWERS",
      "BARBER",
      "TRAVEL AGENT",
      "FIZZO COLA BAR",
    ];
    shops.forEach((t, i) =>
      K.paint("penn_shop" + i, 512, 96, (x, w, h) => {
        x.fillStyle = ["#1e3a2a", "#3a1e1a", "#1a2a3a", "#3a321a"][i % 4];
        x.fillRect(0, 0, w, h);
        x.strokeStyle = "#c8a860";
        x.lineWidth = 5;
        x.strokeRect(4, 4, w - 8, h - 8);
        K.fitText(x, t, w / 2, h / 2 + 2, w - 40, 56, "bold ", "#e8d8a8", null);
        K.weather(x, w, h, 80 + i, 1);
      }),
    );
    K.litPaint("penn_tracks", 512, 128, (x, w, h) => {
      x.fillStyle = "#12161a";
      x.fillRect(0, 0, w, h);
      K.fitText(
        x,
        "TRACKS 1 · 2 · 3 · 4",
        w / 2,
        h / 2,
        w - 40,
        60,
        "bold ",
        "#f0e8d0",
        null,
      );
    });
    K.paint("penn_prr", 256, 256, (x, w) => {
      x.clearRect(0, 0, w, w);
      x.fillStyle = "#b8a060";
      x.beginPath();
      x.moveTo(w * 0.15, w * 0.1);
      x.lineTo(w * 0.85, w * 0.1);
      x.lineTo(w * 0.8, w * 0.55);
      x.lineTo(w * 0.5, w * 0.92);
      x.lineTo(w * 0.2, w * 0.55);
      x.closePath();
      x.fill();
      x.strokeStyle = "#3a2a10";
      x.lineWidth = 8;
      x.stroke();
      K.fitText(
        x,
        "PRR",
        w / 2,
        w * 0.45,
        w * 0.5,
        64,
        "bold ",
        "#3a2a10",
        null,
      );
    });
    K.paint("penn_coachside", 1024, 128, (x, w, h) => {
      x.fillStyle = "#5a2418";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#c8a860";
      x.fillRect(0, 10, w, 4);
      x.fillRect(0, h - 14, w, 4);
      K.fitText(
        x,
        "P E N N S Y L V A N I A",
        w / 2,
        h / 2 + 2,
        w * 0.7,
        54,
        "bold ",
        "#d8b868",
        null,
      );
      K.weather(x, w, h, 90, 1.4);
    });
  }

  // ------------------------------------------------------------------
  // EXTERIOR
  // ------------------------------------------------------------------
  function eagle(b, x, y, z, yaw, s) {
    const m = "limestone",
      tint = 0xb8aca0;
    b.box(m, x, y, z, 1.6 * s, 0.6 * s, 1.2 * s, { yaw, tint });
    b.geo(m, T.sphereLo, {
      x,
      y: y + 1.2 * s,
      z,
      sx: 0.5 * s,
      sy: 0.8 * s,
      sz: 0.45 * s,
      ry: yaw,
      tint,
    });
    const f = F.rot(x, z, yaw, 0, 0.35 * s);
    b.geo(m, T.sphereLo, {
      x: f[0],
      y: y + 2.05 * s,
      z: f[1],
      s: 0.26 * s,
      tint,
    });
    const bk = F.rot(x, z, yaw, 0, 0.62 * s);
    b.geo(m, T.cone4, {
      x: bk[0],
      y: y + 1.98 * s,
      z: bk[1],
      s: 0.1 * s,
      sy: 0.3 * s,
      rx: HP,
      ry: yaw,
      tint,
    });
    for (const sgn of [-1, 1]) {
      const a = F.rot(x, z, yaw, sgn * 0.3 * s, 0),
        w1 = F.rot(x, z, yaw, sgn * 1.9 * s, -0.2 * s),
        w2 = F.rot(x, z, yaw, sgn * 1.4 * s, -0.1 * s);
      b.quad(
        m,
        [a[0], y + 0.9 * s, a[1]],
        [w1[0], y + 1.6 * s, w1[1]],
        [w1[0], y + 2.9 * s, w1[1]],
        [a[0], y + 1.9 * s, a[1]],
        { tint, double: true, grime: 0.5 },
      );
      b.quad(
        m,
        [a[0], y + 0.7 * s, a[1]],
        [w2[0], y + 0.9 * s, w2[1]],
        [w1[0], y + 1.6 * s, w1[1]],
        [a[0], y + 0.9 * s, a[1]],
        { tint: 0xa89c90, double: true, grime: 0.5 },
      );
    }
  }
  function buildExterior(rec) {
    const s = K.site("penn_station");
    const b = K.builder("penn_ext", { grime: 0.6 });
    const glows = K.glowSet("penn_ext");
    const X0 = s.x0,
      X1 = s.x1,
      Z0 = s.z0,
      Z1 = s.z1; // -110..-50, -134..-56
    const cz = (Z0 + Z1) / 2,
      FX = X1;
    const stone = 0xd0bcac;
    const pr = K.paint("penn_prr", 256, 256);
    // base block
    K.block(b, "penn_stone", X0 + 2, Z0 + 2, FX, Z1 - 2, 0, 13.2, {
      roof: "concrete_dark",
      col: false,
    });
    K.colBox(X0 + 2, 0, Z0 + 2, FX, 13.2, Z1 - 2, { surface: "concrete" });
    K.band(b, "limestone", X0 + 2, Z0 + 2, FX, Z1 - 2, 12.4, 1.0, 0.45, {
      tint: stone,
    });
    K.band(b, "granite", X0 + 2, Z0 + 2, FX, Z1 - 2, 0, 1.0, 0.25, {
      tint: 0xb8a898,
      faces: "nsewt",
    });
    // --- Seventh Avenue colonnade ---
    const CX = FX + 2.6;
    K.slab(b, "granite", FX, Z0 + 3, FX + 4.2, Z1 - 3, 0.35, {
      th: 0.35,
      tint: 0xa89888,
      faces: "tnsew",
    });
    for (let k = 0; k < 10; k++)
      for (const sgn of [-1, 1]) {
        const z = cz + sgn * (1.65 + 3.3 * k);
        if (sgn < 0 && k >= 8) {
          // two columns toppled at the north end
          b.cyl("limestone", CX, 0.35, z, 0.68, 0.64, 3.6 - (k - 8) * 1.4, 16, {
            tint: stone,
          });
          for (let d = 0; d < 3; d++)
            b.geo("limestone", T.cyl12, {
              x: CX + 3 + d * 1.6,
              y: 0.62,
              z: z + 1.2 - d * 0.9,
              sx: 0.64,
              sy: 1.3,
              sz: 0.64,
              rz: HP,
              ry: 0.3 + d * 0.4,
              tint: stone,
            });
          K.colBox(CX + 2, 0, z - 2, CX + 7.5, 1.3, z + 2, {
            surface: "concrete",
          });
          continue;
        }
        F.column(b, CX, 0.35, z, 0.66, 11.2, {
          style: "doric",
          mat: "marble_t",
          tint: 0xe0cfc0,
        });
      }
    // entablature (architrave, triglyph frieze, cornice) — broken over the fallen columns
    const EZ0 = Z0 + 9.5,
      EZ1 = Z1 - 3;
    b.box("limestone", CX - 0.4, 11.55, (EZ0 + EZ1) / 2, 3.9, 0.9, EZ1 - EZ0, {
      tint: stone,
      faces: "nsewtb",
    });
    b.box("limestone", CX - 0.4, 12.45, (EZ0 + EZ1) / 2, 4.0, 0.8, EZ1 - EZ0, {
      tint: 0xc4b0a0,
      faces: "nsewt",
    });
    for (let z = EZ0 + 0.6; z < EZ1; z += 1.65)
      b.box("limestone", CX + 1.62, 12.5, z, 0.08, 0.7, 0.35, {
        tint: 0xa89484,
      });
    b.box(
      "limestone",
      CX - 0.3,
      13.25,
      (EZ0 + EZ1) / 2,
      4.6,
      0.45,
      EZ1 - EZ0 + 0.6,
      { tint: stone, faces: "nsewtb" },
    );
    b.geo("limestone", T.box, {
      x: CX,
      y: 12.2,
      z: EZ0 - 2.2,
      sx: 3.6,
      sy: 1.6,
      sz: 4.2,
      rx: 0.5,
      rz: 0.2,
      tint: stone,
    }); // broken end hanging down
    // --- central pavilion: attic with clock, name, eagles ---
    const PZ0 = cz - 11,
      PZ1 = cz + 11;
    b.box("limestone", FX + 1.6, 13.7, cz, 3.4, 6.2, PZ1 - PZ0, {
      tint: stone,
    });
    b.box("limestone", FX + 1.7, 19.9, cz, 3.8, 0.6, PZ1 - PZ0 + 0.6, {
      tint: 0xc4b0a0,
      faces: "nsewtb",
    });
    const nm = K.paint("penn_name", 1600, 140);
    b.panel("atlas_paint", FX + 3.32, 12.95, cz, 18, 0.95, HP, {
      rect: nm,
      grime: 0.3,
    });
    b.cyl("limestone", FX + 3.3, 15.6, cz, 2.2, 2.2, 0.4, 20, {
      rx: 0,
      tint: 0xb8a898,
    });
    b.geo("limestone", T.torusThick, {
      x: FX + 3.35,
      y: 16.9,
      z: cz,
      ry: HP,
      s: 1.7,
      tint: 0xb8a898,
    });
    const cd = K.litPaint("penn_clockdial", 256, 256);
    b.panel("atlas_lit", FX + 3.42, 16.9, cz, 2.8, 2.8, HP, {
      rect: cd,
      grime: 0,
    });
    // allegorical figures flanking the clock (stylised draped figures)
    for (const sgn of [-1, 1]) {
      const z = cz + sgn * 3.6;
      b.geo("limestone", T.cone8, {
        x: FX + 3.2,
        y: 15.3,
        z,
        sx: 0.8,
        sy: 3.2,
        sz: 0.7,
        tint: 0xb8aca0,
      });
      b.geo("limestone", T.sphereLo, {
        x: FX + 3.2,
        y: 17.2,
        z,
        s: 0.34,
        tint: 0xb8aca0,
      });
      b.beam(
        "limestone",
        FX + 3.2,
        16.4,
        z,
        FX + 3.4,
        16.9,
        cz + sgn * 2.3,
        0.22,
        { tint: 0xb8aca0 },
      );
    }
    eagle(b, FX + 2.4, 20.5, PZ0 + 1.2, -HP, 1.2);
    eagle(b, FX + 2.4, 20.5, PZ1 - 1.2, -HP, 1.2);
    eagle(b, FX + 2.4, 13.7, Z0 + 5, -HP, 1.0);
    eagle(b, FX + 2.4, 13.7, Z1 - 5, -HP, 1.0);
    // engaged Doric pilasters on the bay boundaries + 3D window surrounds (sills, hoods, jambs) on the
    // 31st St / 33rd St / Eighth Avenue faces; cornice band over the pilasters
    const pmx = (X0 + 2 + FX) / 2; // carriage-drive portal centre (x) on the side streets
    const pmz = cz; // Eighth Avenue portal centre (z)
    const skipPortal = (x, z, y, f) =>
      f === "n" || f === "s"
        ? Math.abs(x - pmx) < 6.2
        : f === "w" && Math.abs(z - pmz) < 6.2;
    K.reveals(b, "penn_stone", X0 + 2, Z0 + 2, FX, Z1 - 2, 0, 13.2, {
      faces: "nsw",
      tint: 0xd8c6b4,
      proj: 0.16,
      hood: "cornice",
      maxY: 12.6,
      skip: skipPortal,
      piers: {
        mat: "limestone",
        tint: stone,
        w: 1.1,
        d: 0.5,
        y0: 1.0,
        y1: 11.6,
        skip: (x, z, f) => skipPortal(x, z, 5, f),
      },
    });
    for (const zf of [Z0 + 2, Z1 - 2]) {
      const sgn = zf < cz ? -1 : 1;
      b.box(
        "limestone",
        (X0 + FX) / 2,
        11.6,
        zf + sgn * 0.3,
        FX - X0 - 4,
        1.0,
        0.6,
        { tint: 0xc4b0a0 },
      );
    }
    b.box("limestone", X0 + 1.7, 11.6, cz, 0.6, 1.0, Z1 - Z0 - 4, {
      tint: 0xc4b0a0,
    });
    // CARRIAGE-DRIVE PORTALS (31st & 33rd St, and the Eighth Avenue front): the station's triumphal-arch
    // motif — a deep coffered arch between paired Doric columns, attic tablet with the Pennsylvania keystone.
    const portal = (px, pz, yaw) => {
      const R = (lx, lz) => F.rot(px, pz, yaw, lx, lz);
      const nrm = F.rot(0, 0, yaw, 0, 1); // outward normal (x,z)
      // frame block + arch surround
      for (const sx of [-1, 1]) {
        const p = R(sx * 4.6, 0.55);
        b.box("limestone", p[0], 0, p[1], 2.6, 12.2, 1.1, { yaw, tint: stone });
      }
      const at = R(0, 0.55);
      b.box("limestone", at[0], 9.2, at[1], 12, 3.2, 1.1, {
        yaw,
        tint: stone,
        faces: "nsewtb",
      });
      // spandrels (face of the arch block, with the semicircle cut out) + archivolt moulding + intrados
      const sp = new THREE.Shape();
      sp.moveTo(-3.3, 5.4);
      sp.lineTo(-3.3, 9.2);
      sp.lineTo(3.3, 9.2);
      sp.lineTo(3.3, 5.4);
      sp.absarc(0, 5.4, 3.3, 0, PI, false);
      const spg = new THREE.ShapeGeometry(sp, 10);
      const sf = R(0, 1.1);
      b.geo("limestone", spg, {
        x: sf[0],
        y: 0,
        z: sf[1],
        ry: yaw,
        tint: stone,
      });
      spg.dispose();
      b.geo("limestone", new THREE.TorusGeometry(3.45, 0.3, 5, 16, PI), {
        x: at[0] + nrm[0] * 0.58,
        y: 5.4,
        z: at[1] + nrm[1] * 0.58,
        ry: yaw,
        sz: 1.9,
        tint: 0xc4b0a0,
      });
      for (let i = 0; i < 10; i++) {
        const a0 = (PI * i) / 10,
          a1 = (PI * (i + 1)) / 10;
        const A0 = R(3.3 * Math.cos(a0), 0.02),
          A1 = R(3.3 * Math.cos(a1), 0.02),
          B0 = R(3.3 * Math.cos(a0), 1.1),
          B1 = R(3.3 * Math.cos(a1), 1.1);
        b.quad(
          "limestone",
          [A0[0], 5.4 + 3.3 * Math.sin(a0), A0[1]],
          [A1[0], 5.4 + 3.3 * Math.sin(a1), A1[1]],
          [B1[0], 5.4 + 3.3 * Math.sin(a1), B1[1]],
          [B0[0], 5.4 + 3.3 * Math.sin(a0), B0[1]],
          { tint: 0x9a8a7a, grime: 0.5, double: true, rect: [0, 0, 0.4, 0.3] },
        );
      }
      // the opening: dark depth + a coffered soffit hint + iron gate half torn off
      const dp = R(0, 0.02);
      b.box("black", dp[0], 0, dp[1], 6.6, 5.4, 0.04, {
        yaw,
        faces: "s",
        grime: 0,
      });
      b.geo("black", new THREE.CircleGeometry(3.3, 16, 0, PI), {
        x: dp[0] + nrm[0] * 0.03,
        y: 5.4,
        z: dp[1] + nrm[1] * 0.03,
        ry: yaw,
        grime: 0,
      });
      for (let k = 0; k < 4; k++) {
        const cp = R(0, 0.2 + k * 0.25);
        b.geo("limestone", new THREE.TorusGeometry(3.3, 0.06, 3, 12, PI), {
          x: cp[0],
          y: 5.4,
          z: cp[1],
          ry: yaw,
          tint: 0x9a8a7a,
        });
      }
      for (let k = 0; k < 7; k++) {
        const gp = R(-3 + k * 0.5, 0.35 + (k > 3 ? (k - 3) * 0.35 : 0));
        b.beam(
          "black_metal",
          gp[0],
          0,
          gp[1],
          gp[0],
          k > 3 ? 3.2 - (k - 3) * 0.5 : 4.6,
          gp[1],
          0.05,
        );
      }
      // paired Doric columns either side of the arch
      for (const sx of [-1, 1])
        for (const dx of [0, 1.35]) {
          const cp = R(sx * (4.05 + dx), 1.15);
          F.column(b, cp[0], 0.35, cp[1], 0.42, 8.8, {
            style: "doric",
            mat: "marble_t",
            tint: 0xe0cfc0,
          });
        }
      const en = R(0, 1.15);
      b.box("limestone", en[0], 9.15, en[1], 12.2, 1.0, 1.2, {
        yaw,
        tint: 0xc4b0a0,
        faces: "nsewtb",
      });
      // attic tablet with the name + PRR keystone disc
      const tb = R(0, 1.12);
      b.panel("atlas_paint", tb[0], 10.75, tb[1], 9.4, 0.62, yaw, {
        rect: nmS,
        grime: 0.3,
      });
      const ks = R(0, 1.77);
      b.panel("atlas_paint", ks[0], 9.65, ks[1], 0.9, 0.9, yaw, {
        rect: pr,
        grime: 0.3,
      });
      // steps
      const st = R(0, 1.2);
      b.box("granite", st[0], 0, st[1], 8, 0.35, 1.6, { yaw, tint: 0xa89888 });
      K.colRot(st[0], st[1], 8, 1.6, 0, 0.35, yaw, { surface: "concrete" });
      for (const sx of [-1, 1])
        for (const dx of [0, 1.35]) {
          const cp = R(sx * (4.05 + dx), 1.15);
          K.colRot(cp[0], cp[1], 0.9, 0.9, 0, 9, 0, { surface: "concrete" });
        }
    };
    const nmS = K.paint("penn_name_s", 1100, 90, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      K.fitText(
        x,
        "PENNSYLVANIA  STATION",
        w / 2,
        h / 2 + 3,
        w - 30,
        74,
        "bold ",
        "#2e241c",
        "#e8dccc",
        2,
      );
    });
    portal(pmx, Z1 - 2, 0); // 31st Street (south)
    portal(pmx, Z0 + 2, PI); // 33rd Street (north)
    portal(X0 + 2, pmz, -HP); // Eighth Avenue (west)
    // PRR keystones over the side doors
    for (const sgn of [-1, 1])
      b.panel("atlas_paint", FX + 0.2, 8.4, cz + sgn * 14, 1.6, 1.6, HP, {
        rect: pr,
        grime: 0.3,
      });
    // entrance doors behind the colonnade
    for (let k = -2; k <= 2; k++) {
      const z = cz + k * 3.3;
      b.box("black", FX + 0.02, 0.35, z, 0.05, 6.2, 2.4, {
        faces: "e",
        grime: 0,
      });
      b.box("bronze", FX + 0.1, 0.35, z, 0.12, 0.2, 2.6, { tint: 0x6a5030 });
      b.box("bronze", FX + 0.1, 6.55, z, 0.2, 0.3, 2.8, { tint: 0x6a5030 });
      if (k !== 0)
        b.box("wood_rotten", FX + 0.18, 0.4, z, 0.08, 3.4, 2.3, {
          tint: 0x6a5642,
        });
    }
    // --- waiting room block with thermal windows ---
    const WX0 = X0 + 12,
      WX1 = FX - 12,
      WZ0 = Z0 + 16,
      WZ1 = Z1 - 16;
    K.block(b, "penn_stone", WX0, WZ0, WX1, WZ1, 13.2, 26, {
      roof: "concrete_dark",
      col: true,
      seg: 6,
    });
    K.band(b, "limestone", WX0, WZ0, WX1, WZ1, 25.2, 1.2, 0.6, { tint: stone });
    const tw = K.litPaint("penn_thermal", 512, 256);
    // low hipped roof in weathered lead (short ridge N-S over the 36 × 46 m block), with a skylight strip and a broken patch
    b.box(
      "limestone",
      (WX0 + WX1) / 2,
      26.0,
      (WZ0 + WZ1) / 2,
      WX1 - WX0 + 1.4,
      0.5,
      WZ1 - WZ0 + 1.4,
      { faces: "nsewtb", tint: stone },
    );
    K.hipRoof(
      b,
      "slate",
      WX0 - 0.2,
      WZ0 - 0.2,
      WX1 + 0.2,
      WZ1 + 0.2,
      26.5,
      5.5,
      { axis: "z", tint: 0x6a726c, grime: 0.6 },
    );
    b.box("black", (WX0 + WX1) / 2 + 6, 28.6, (WZ0 + WZ1) / 2 - 8, 5, 0.05, 4, {
      faces: "t",
      grime: 0,
    }); // hole
    for (let k = 0; k < 4; k++)
      b.beam(
        "rust",
        (WX0 + WX1) / 2 + 4 + k * 1.3,
        29.6 - k * 0.3,
        (WZ0 + WZ1) / 2 - 10,
        (WX0 + WX1) / 2 + 4.5 + k * 1.3,
        28.2,
        (WZ0 + WZ1) / 2 - 6,
        0.16,
      );
    // three thermal (Diocletian) windows on each long face too — the silhouette everyone remembers
    for (const zf of [WZ0, WZ1]) {
      const nz = zf === WZ1 ? 1 : -1,
        yaw = nz > 0 ? 0 : PI;
      for (let i = 0; i < 3; i++) {
        const xc = WX0 + 6 + i * 12;
        const geo = new THREE.CircleGeometry(4.9, 20, 0, PI);
        b.geo("atlas_lit", geo, {
          x: xc,
          y: 17.6,
          z: zf + nz * 0.05,
          ry: yaw,
          uv: "rect",
          rect: tw,
        });
        geo.dispose();
        b.geo("limestone", new THREE.TorusGeometry(5.2, 0.4, 5, 16, PI), {
          x: xc,
          y: 17.6,
          z: zf + nz * 0.12,
          ry: yaw,
          tint: 0xb8a898,
        });
        for (const dx of [-1.65, 1.65])
          b.box(
            "limestone",
            xc + dx,
            17.6,
            zf + nz * 0.1,
            0.35,
            Math.sqrt(4.9 * 4.9 - dx * dx),
            0.3,
            { tint: 0xb8a898 },
          );
        b.box("limestone", xc, 17.2, zf + nz * 0.2, 10.6, 0.45, 0.5, {
          tint: 0xb8a898,
        });
      }
    }
    for (const x of [WX0, WX1])
      for (const zc of [WZ0 + 11, WZ1 - 11]) {
        const nx = x === WX1 ? 1 : -1;
        const geo = new THREE.CircleGeometry(6.2, 24, 0, PI);
        b.geo("atlas_lit", geo, {
          x: x + nx * 0.04,
          y: 15.2,
          z: zc,
          ry: nx > 0 ? HP : -HP,
          uv: "rect",
          rect: tw,
        });
        geo.dispose();
        b.geo("limestone", new THREE.TorusGeometry(6.5, 0.45, 5, 18, PI), {
          x: x + nx * 0.1,
          y: 15.2,
          z: zc,
          ry: HP,
          tint: 0xb8a898,
        });
        for (const dz of [-2.1, 2.1])
          b.box(
            "limestone",
            x + nx * 0.1,
            15.2,
            zc + dz,
            0.3,
            Math.sqrt(6.2 * 6.2 - dz * dz),
            0.4,
            { tint: 0xb8a898 },
          );
        b.box("limestone", x + nx * 0.2, 14.8, zc, 0.5, 0.5, 13.6, {
          tint: 0xb8a898,
        });
      }
    // --- glass concourse vaults (Eighth Avenue side) ---
    const GX = X0 + 6.5,
      GR = 4.4;
    const sky = K.litPaint("penn_sky", 256, 256);
    for (let i = 0; i < 10; i++) {
      const a0 = (PI * i) / 10,
        a1 = (PI * (i + 1)) / 10;
      const p0 = [GX + Math.cos(a0) * GR, 13.2 + Math.sin(a0) * GR],
        p1 = [GX + Math.cos(a1) * GR, 13.2 + Math.sin(a1) * GR];
      for (let z = Z0 + 3; z < Z1 - 3; z += 4) {
        if ((i * 7 + z) % 5 === 0) continue; // missing panes
        b.quad(
          "glass_dirty",
          [p0[0], p0[1], z + 4],
          [p0[0], p0[1], z],
          [p1[0], p1[1], z],
          [p1[0], p1[1], z + 4],
          { tint: 0x6a7a70, grime: 0.3, double: true },
        );
      }
    }
    for (let z = Z0 + 3; z <= Z1 - 3; z += 4)
      for (let i = 0; i < 10; i++) {
        const a0 = (PI * i) / 10,
          a1 = (PI * (i + 1)) / 10;
        b.beam(
          "black_metal",
          GX + Math.cos(a0) * GR,
          13.2 + Math.sin(a0) * GR,
          z,
          GX + Math.cos(a1) * GR,
          13.2 + Math.sin(a1) * GR,
          z,
          0.14,
        );
      }
    void sky;
    // rubble & scorching
    F.debris(b, FX + 8, 0, cz - 26, 3, 16, { mound: true, col: true, colH: 1 });
    b.burn(FX, 8, cz + 20, 7, 0.7);
    b.burn(WX1, 20, WZ0 + 5, 8, 0.6);
    // sidewalk signage
    b.box("black_metal", FX + 5.2, 0, cz + 6, 0.1, 2.6, 0.1);
    b.panel("atlas_lit", FX + 5.3, 2.7, cz + 6, 1.5, 0.38, HP, {
      rect: K.litPaint("penn_tracks", 512, 128),
      grime: 0,
    });
    glows.add(FX + 3.3, 16.9, cz, 0xfff0d0, "m");
    b.finish(rec.root, { lod: 1200 });
    glows.finish(rec.root, { dayOpacity: 0.2, nightOpacity: 0.8 });
    rec.anchor("entrance", FX + 5, 0, cz, HP);
    return {
      doorPos: new THREE.Vector3(FX + 0.3, 1.6, cz),
      outside: { x: FX + 5.5, y: 0.35, z: cz, yaw: -HP },
    }; // face 7th Avenue (away from the door)
  }

  // ------------------------------------------------------------------
  // INTERIOR
  // ------------------------------------------------------------------
  function gg1(b, glows, x, y, z, yaw, tilt) {
    // stylised GG1-type streamlined electric locomotive: stepped hood profile extruded 3 m wide
    const L = 22,
      W = 3.0;
    const sh = new THREE.Shape();
    sh.moveTo(-L / 2, 0.9);
    sh.lineTo(L / 2, 0.9);
    sh.lineTo(L / 2, 1.8);
    sh.quadraticCurveTo(L / 2 - 0.3, 3.0, L / 2 - 2.2, 3.1);
    sh.lineTo(3.2, 3.2);
    sh.quadraticCurveTo(2.6, 4.4, 1.2, 4.5);
    sh.lineTo(-1.2, 4.5);
    sh.quadraticCurveTo(-2.6, 4.4, -3.2, 3.2);
    sh.lineTo(-L / 2 + 2.2, 3.1);
    sh.quadraticCurveTo(-L / 2 + 0.3, 3.0, -L / 2, 1.8);
    sh.lineTo(-L / 2, 0.9);
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: W,
      bevelEnabled: true,
      bevelThickness: 0.25,
      bevelSize: 0.25,
      bevelSegments: 2,
      curveSegments: 6,
    });
    g.translate(0, 0, -W / 2);
    b.geo("paint_green", g, {
      x,
      y,
      z,
      ry: yaw,
      rz: tilt,
      tint: 0x24382a,
      grime: 0.7,
    });
    g.dispose();
    const P = (lx, ly, lz) => {
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      const ct = Math.cos(tilt),
        st = Math.sin(tilt);
      const rx = lx * ct - ly * st,
        ry = lx * st + ly * ct;
      return [x + rx * c + lz * s, y + ry, z - rx * s + lz * c];
    };
    // five gold pinstripes ("cat whiskers") converging at the nose
    for (const sgn of [-1, 1])
      for (let k = 0; k < 5; k++) {
        const a = P(-7, 1.4 + k * 0.28, sgn * (W / 2 + 0.26)),
          c2 = P(-L / 2 + 0.1, 1.45 + k * 0.1, sgn * 0.2 * k);
        b.beam("gold", a[0], a[1], a[2], c2[0], c2[1], c2[2], 0.06, {
          grime: 0.3,
        });
        const a2 = P(7, 1.4 + k * 0.28, sgn * (W / 2 + 0.26)),
          c3 = P(L / 2 - 0.1, 1.45 + k * 0.1, sgn * 0.2 * k);
        b.beam("gold", a2[0], a2[1], a2[2], c3[0], c3[1], c3[2], 0.06, {
          grime: 0.3,
        });
      }
    // cab windows, headlights, running gear, pantographs
    for (const sgn of [-1, 1]) {
      const w = P(sgn * 1.8, 3.9, 0);
      b.box("glass_broken", w[0], w[1] - 0.35, w[2], 0.9, 0.7, W + 0.55, {
        yaw,
        grime: 0.2,
      });
    }
    for (const e of [-1, 1]) {
      const hl = P(e * (L / 2 + 0.2), 2.2, 0);
      b.geo("lamp_warm", T.sphereLo, {
        x: hl[0],
        y: hl[1],
        z: hl[2],
        s: 0.22,
        tint: 0x3a3a30,
        grime: 0,
      });
    }
    for (let k = -4; k <= 4; k++) {
      if (k === 0) continue;
      for (const sgn of [-1, 1]) {
        const wp = P(k * 2.3, 0.75, sgn * (W / 2 - 0.1));
        b.geo("black_metal", T.cyl12, {
          x: wp[0],
          y: wp[1],
          z: wp[2],
          sx: 0.62,
          sy: 0.18,
          sz: 0.62,
          rx: HP,
          ry: yaw,
          rz: 0,
        });
      }
    }
    const fr = P(0, 0.35, 0);
    b.box("black_metal", fr[0], fr[1], fr[2], L - 1, 0.55, W - 0.4, {
      yaw,
      rz: tilt,
    });
    for (const e of [-1, 1]) {
      const base = P(e * 3.6, 4.6, 0);
      b.box("black_metal", base[0], base[1], base[2], 1.2, 0.2, 1.4, { yaw });
      const top = P(e * 3.0, 5.9, 0),
        mid1 = P(e * 4.1, 5.3, 0);
      b.beam(
        "black_metal",
        base[0],
        base[1] + 0.2,
        base[2],
        mid1[0],
        mid1[1],
        mid1[2],
        0.06,
      );
      b.beam(
        "black_metal",
        mid1[0],
        mid1[1],
        mid1[2],
        top[0],
        top[1],
        top[2],
        0.06,
      );
      b.beam(
        "chrome",
        top[0] - Math.sin(yaw + HP) * 1,
        top[1],
        top[2] - Math.cos(yaw + HP) * 1,
        top[0] + Math.sin(yaw + HP) * 1,
        top[1],
        top[2] + Math.cos(yaw + HP) * 1,
        0.05,
      );
    }
    const nb = P(-L / 2 + 1.5, 2.6, W / 2 + 0.27);
    b.panel("atlas_paint", nb[0], nb[1], nb[2], 0.9, 0.9, yaw, {
      rect: K.paint("penn_prr", 256, 256),
      grime: 0.3,
    });
    K.colRot(x, z, L, W + 0.6, y, y + 4.2, yaw, { surface: "metal" });
    void glows;
  }
  function track(b, x0, x1, z, y) {
    for (const dz of [-0.72, 0.72])
      b.box("rust", (x0 + x1) / 2, y + 0.18, z + dz, x1 - x0, 0.14, 0.09, {
        tint: 0x6a5a4a,
        grime: 0.3,
      });
    for (let x = x0 + 0.3; x < x1; x += 0.8)
      b.box("wood_rotten", x, y, z, 0.25, 0.16, 2.4, {
        tint: 0x4a3a2a,
        grime: 0.7,
      });
  }
  function buildInterior(rec) {
    const O = G.LAYOUT.INTERIORS.penn_station.origin;
    const ox = O.x,
      oz = O.z;
    const b = K.builder("penn_int", {
      grime: 0.4,
      ambient: 1.0,
      maxLight: 2.8,
      gain: 1.3,
    });
    const glows = K.glowSet("penn_int");
    const WY = -4,
      PY = -12,
      BEDY = PY - 1.2;
    const stone = 0xd8c4b0,
      stone2 = 0xc8b4a0;
    // ---- baked lights ----
    b.light(ox, 6, oz + 34, 18, 0xe0e8c8, 1.0); // arcade skylight
    for (const x of [-26, 26]) b.light(ox + x, 12, oz - 4, 24, 0xd8e4b0, 1.3); // thermal windows
    b.light(ox, 12, oz - 4, 28, 0xe8e0c0, 1.0); // waiting-room ceiling
    b.light(ox + 26, 1, oz - 18, 10, 0xffd8a0, 0.6); // ticket office lamps
    for (const x of [-24, -8, 8, 24])
      for (const z of [-44, -28]) b.light(ox + x, 5, oz + z, 20, 0xd8e8b8, 1.0); // concourse glass
    for (let x = -34; x <= 34; x += 17)
      for (const z of [-40, -57])
        b.light(ox + x, PY + 4.5, oz + z, 13, 0xc8d8a0, 0.8); // platforms
    b.light(ox + 50, PY + 1, oz - 57, 16, 0x60ff60, 1.2); // the Conductor's tunnel (rad leak)
    b.light(ox + 40, WY + 3, oz - 15, 10, 0xffc880, 0.6); // baggage room

    // =========================== ARCADE ===========================
    const AX0 = ox - 6,
      AX1 = ox + 6,
      AZ0 = oz + 12,
      AZ1 = oz + 50,
      AH = 5;
    K.room(b, {
      x0: AX0,
      x1: AX1,
      z0: oz + 20,
      z1: AZ1,
      y: 0,
      h: AH,
      floor: "terrazzo",
      wall: "limestone",
      ceil: null,
      walls: "sew",
      doors: { s: [{ at: 6, w: 3, h: 3.6 }] },
      base: "marble_black",
      floorTint: 0xc0b098,
      wallTint: stone,
      grime: 0.5,
    });
    K.skin(b, "limestone", AX0, AZ0, AX0, oz + 20, WY, AH, [ox, oz + 16], [], {
      tint: stone,
    });
    K.skin(b, "limestone", AX1, AZ0, AX1, oz + 20, WY, AH, [ox, oz + 16], [], {
      tint: stone,
    });
    K.vault(b, "plaster", ox, AH, 6, AZ0, AZ1, {
      tint: 0xb8b0a0,
      tile: 3,
      ribMat: "limestone",
      ribStep: 4,
      ribTint: stone2,
      ribEvery: 1,
      ribW: 0.3,
      ribD: 0.35,
    });
    b.box("limestone", ox, AH, AZ1 - 0.15, 12, 6, 0.3, {
      faces: "n",
      tint: stone,
    });
    b.box("limestone", ox, AH, AZ0 + 0.15, 12, 6, 0.3, {
      faces: "s",
      tint: stone,
    });
    // skylight oculi in the vault
    for (let z = oz + 24; z < AZ1 - 3; z += 8) {
      b.geo("atlas_lit", new THREE.CircleGeometry(1.2, 16), {
        x: ox,
        y: AH + 5.95,
        z,
        rx: HP,
        uv: "rect",
        rect: K.litPaint("penn_sky", 256, 256),
      });
      glows.add(ox, AH + 5.8, z, 0xd8e0b0, "m");
      F.shaft(b, ox, AH + 5.9, z, 0.3, 2.2, 9, 0.18, { tint: 0x8a9a70 });
    }
    // shopfronts (niches with signs, dark glass, boarded)
    for (let i = 0; i < 8; i++) {
      const side = i % 2 ? 1 : -1,
        z = oz + 24 + Math.floor(i / 2) * 6.5;
      const x = side < 0 ? AX0 + 0.16 : AX1 - 0.16,
        face = side < 0 ? HP : -HP;
      b.panel("atlas_paint", x, 3.4, z, 3.6, 0.68, face, {
        rect: K.paint("penn_shop" + i, 512, 96),
        grime: 0.3,
        off: 0.02,
      });
      b.panel(
        i % 3 ? "glass_broken" : "wood_rotten",
        x,
        1.5,
        z,
        3.4,
        2.6,
        face,
        { tint: i % 3 ? 0x2a3430 : 0x6a5642, grime: 0.3, off: 0.03 },
      );
      b.box("bronze", x + side * -0.1, 0, z, 0.2, 0.4, 3.8, { tint: 0x6a5030 });
    }
    // toppled statue of the railroad president (pedestal + figure lying on the floor)
    b.box("granite", ox, 0, oz + 30, 2, 1.6, 2, { tint: 0x9a948c });
    K.colBox(ox - 1, 0, oz + 29, ox + 1, 1.6, oz + 31, { surface: "concrete" });
    b.geo("bronze", T.cyl8, {
      x: ox + 1.8,
      y: 0.45,
      z: oz + 32.5,
      sx: 0.45,
      sy: 2.6,
      sz: 0.4,
      rz: HP,
      ry: 0.6,
      tint: 0x4a6a58,
    });
    b.geo("bronze", T.sphereLo, {
      x: ox + 0.5,
      y: 0.35,
      z: oz + 33.4,
      s: 0.3,
      tint: 0x4a6a58,
    });
    F.debris(b, ox - 3, 0, oz + 40, 1.6, 12);
    F.papers(b, AX0, oz + 21, AX1, AZ1 - 1, 0, 28, { tint: 0xb0a488 });
    // grand stair down into the waiting room
    b.stairs("marble_t", ox, oz + 12, 0, 1, 11.4, 8, WY, 0, 10, {
      tint: 0xd8ccb8,
      solid: true,
    });
    for (const sgn of [-1, 1])
      F.railing(b, ox + sgn * 5.6, oz + 20, ox + sgn * 5.6, AZ0, 0, {
        mat: "bronze",
        h: 1,
        col: false,
      });
    // the great hanging clock at the head of the stair
    b.beam("black_metal", ox, AH + 5.8, oz + 18, ox, 4.2, oz + 18, 0.08);
    b.cyl("bronze", ox, 3.2, oz + 18, 0.9, 0.9, 0.35, 20, {
      rx: HP,
      tint: 0x6a5030,
      bottom: true,
    });
    const cd = K.litPaint("penn_clockdial", 256, 256);
    for (const f of [0, PI])
      b.panel("atlas_lit", ox, 3.2, oz + 18 + (f ? -0.19 : 0.19), 1.6, 1.6, f, {
        rect: cd,
        grime: 0,
      });
    glows.add(ox, 3.2, oz + 18, 0xfff0d0, "m");

    // =========================== MAIN WAITING ROOM ===========================
    const RX0 = ox - 32,
      RX1 = ox + 32,
      RZ0 = oz - 20,
      RZ1 = oz + 12,
      SPR = 10,
      RR = (RZ1 - RZ0) / 2;
    K.room(b, {
      x0: RX0,
      x1: RX1,
      z0: RZ0,
      z1: RZ1,
      y: WY,
      h: SPR - WY,
      floor: "marble_cream",
      wall: "limestone",
      ceil: null,
      doors: {
        s: [{ at: 32, w: 12, h: 9 }],
        n: [
          { at: 14, w: 10, h: 6.8, arch: true },
          { at: 32, w: 10, h: 6.8, arch: true },
          { at: 50, w: 10, h: 6.8, arch: true },
        ],
        e: [{ at: 15, w: 2, h: 2.6 }],
      },
      base: "marble_black",
      cornice: "limestone",
      corniceH: 1.2,
      floorTint: 0xd8ccb8,
      wallTint: stone,
      grime: 0.5,
    });
    // barrel vault along x, coffered
    const vcz = (RZ0 + RZ1) / 2;
    for (let i = 0; i < 20; i++) {
      const a0 = (PI * i) / 20,
        a1 = (PI * (i + 1)) / 20;
      const p0 = [vcz + Math.cos(a0) * RR, SPR + Math.sin(a0) * RR],
        p1 = [vcz + Math.cos(a1) * RR, SPR + Math.sin(a1) * RR];
      b.quad(
        "plaster",
        [RX0, p0[1], p0[0]],
        [RX0, p1[1], p1[0]],
        [RX1, p1[1], p1[0]],
        [RX1, p0[1], p0[0]],
        { tint: 0xc8b8a0, grime: 0.3, rect: [0, 0, 64 / 3, 2.5 / 3] },
      );
      if (i % 2 === 0)
        b.beam(
          "limestone",
          RX0,
          p0[1] - 0.2,
          p0[0],
          RX1,
          p0[1] - 0.2,
          p0[0],
          0.35,
          { tint: stone2 },
        );
    }
    for (let x = RX0 + 4; x < RX1; x += 4)
      for (let i = 0; i < 20; i++) {
        const a0 = (PI * i) / 20,
          a1 = (PI * (i + 1)) / 20;
        b.beam(
          "limestone",
          x,
          SPR + Math.sin(a0) * (RR - 0.3),
          vcz + Math.cos(a0) * (RR - 0.3),
          x,
          SPR + Math.sin(a1) * (RR - 0.3),
          vcz + Math.cos(a1) * (RR - 0.3),
          0.35,
          { tint: stone2 },
        );
      }
    // transverse arches dividing three bays
    for (const x of [RX0 + 21.3, RX1 - 21.3])
      for (let i = 0; i < 20; i++) {
        const a0 = (PI * i) / 20,
          a1 = (PI * (i + 1)) / 20;
        b.beam(
          "limestone",
          x,
          SPR + Math.sin(a0) * (RR - 1.2),
          vcz + Math.cos(a0) * (RR - 1.2),
          x,
          SPR + Math.sin(a1) * (RR - 1.2),
          vcz + Math.cos(a1) * (RR - 1.2),
          1.4,
          { d: 2.2, tint: stone },
        );
      }
    // end walls above the spring line with the Diocletian windows
    const tw = K.litPaint("penn_thermal", 512, 256);
    for (const sgn of [-1, 1]) {
      const x = sgn < 0 ? RX0 + 0.16 : RX1 - 0.16,
        face = sgn < 0 ? HP : -HP;
      const semi = new THREE.CircleGeometry(RR, 32, 0, PI);
      // wall lunette (stone ring) and window (smaller)
      const ring = new THREE.RingGeometry(RR - 3.4, RR, 32, 1, 0, PI);
      b.geo("limestone", ring, { x, y: SPR, z: vcz, ry: face, tint: stone });
      const win = new THREE.CircleGeometry(RR - 3.4, 32, 0, PI);
      b.geo("atlas_lit", win, {
        x: x + sgn * -0.02,
        y: SPR,
        z: vcz,
        ry: face,
        uv: "rect",
        rect: tw,
      });
      for (const dz of [-(RR - 3.4) / 3, (RR - 3.4) / 3])
        b.box(
          "limestone",
          x - sgn * 0.1,
          SPR,
          vcz + dz,
          0.4,
          Math.sqrt((RR - 3.4) ** 2 - dz * dz),
          0.8,
          { tint: stone2 },
        );
      b.box("limestone", x - sgn * 0.2, SPR - 0.6, vcz, 0.6, 0.6, RR * 2, {
        tint: stone2,
      });
      semi.dispose();
      ring.dispose();
      win.dispose();
      for (const dz of [-5, 0, 5])
        F.shaft(b, x - sgn * 0.5, SPR + 7, vcz + dz, face, 3.5, 24, 0.95, {
          tint: 0x7a8a60,
        });
    }
    // giant Corinthian columns along the long walls
    for (let x = RX0 + 5; x < RX1 - 2; x += 9)
      for (const z of [RZ0 + 1.6, RZ1 - 1.6]) {
        if (z > vcz && Math.abs(x - ox) < 8) continue; // arcade opening
        F.column(b, x, WY, z, 0.95, SPR - WY, {
          style: "corinthian",
          mat: "marble_t",
          tint: 0xe8d8c8,
          col: true,
        });
      }
    // benches (long, back-to-back) in two banks
    for (let bank = -1; bank <= 1; bank += 2)
      for (let r = 0; r < 4; r++) {
        const x = ox + bank * 16,
          z = oz - 12 + r * 5;
        F.bench(b, x - 3.5, WY, z, 0, 6.5, { mat: "oak", frame: "bronze" });
        F.bench(b, x - 3.5, WY, z - 0.75, PI, 6.5, {
          mat: "oak",
          frame: "bronze",
        });
        if ((r + bank) % 3 === 0)
          F.bench(b, x + 5, WY + 0.02, z, 0.4, 4.5, {
            mat: "oak",
            frame: "bronze",
          }); // shoved askew
      }
    // ticket office along the east wall: marble counter, brass grilles
    b.box("marble_black", RX1 - 3, WY, oz - 4, 1.4, 1.2, 20, {
      tint: 0x8a8480,
    });
    b.box("marble_t", RX1 - 3, WY + 1.2, oz - 4, 1.6, 0.08, 20.2, {
      tint: 0xd8ccb8,
    });
    for (let z = oz - 13.5; z < oz + 6; z += 2.4) {
      b.box("brass", RX1 - 3.6, WY + 1.28, z, 0.05, 1.3, 2.0, {
        tint: 0x9a7a40,
        faces: "w",
      });
      for (let k = -3; k <= 3; k++)
        b.beam(
          "brass",
          RX1 - 3.62,
          WY + 1.28,
          z + k * 0.28,
          RX1 - 3.62,
          WY + 2.58,
          z + k * 0.28,
          0.025,
        );
    }
    K.colBox(RX1 - 3.8, WY, oz - 14, RX1 - 2.2, WY + 2.6, oz + 6, {
      surface: "concrete",
    });
    b.panel("atlas_lit", RX1 - 0.2, WY + 6.4, oz - 4, 9, 4.5, -HP, {
      rect: K.litPaint("penn_board", 1024, 512),
      grime: 0,
    });
    glows.add(RX1 - 0.6, WY + 6.4, oz - 4, 0xffe0a0, "l");
    // newsstand kiosk (centre)
    b.box("mahogany", ox, WY, oz - 4, 3, 1.1, 2, { tint: 0x4a2a18 });
    b.box("mahogany", ox, WY + 2.5, oz - 4, 3.4, 0.2, 2.4, { tint: 0x4a2a18 });
    for (const c of [
      [-1.4, -0.9],
      [1.4, -0.9],
      [-1.4, 0.9],
      [1.4, 0.9],
    ])
      b.box("mahogany", ox + c[0], WY + 1.1, oz - 4 + c[1], 0.12, 1.4, 0.12);
    K.colBox(ox - 1.5, WY, oz - 5, ox + 1.5, WY + 1.2, oz - 3, {
      surface: "wood",
    });
    F.papers(b, ox - 3, oz - 7, ox + 3, oz - 1, WY, 22, { tint: 0xc8bca0 });
    // hanging iron lanterns
    for (const x of [-21, 0, 21]) {
      const lx = ox + x;
      b.beam("black_metal", lx, 22, vcz, lx, 7.5, vcz, 0.06);
      b.cyl("black_metal", lx, 6, vcz, 1.2, 0.8, 1.5, 8, {
        top: true,
        bottom: true,
        tint: 0x2a2a24,
      });
      b.geo("lamp_amber", T.sphereLo, {
        x: lx,
        y: 6.7,
        z: vcz,
        s: 0.5,
        grime: 0,
      });
      glows.add(lx, 6.7, vcz, 0xffc070, "l");
    }
    // collapse: one coffer section fell with the NW lantern (rubble mound + daylight hole)
    F.debris(b, ox - 20, WY, oz - 14, 3.4, 30, {
      mound: true,
      col: true,
      colH: 1.2,
      mats: ["plaster", "limestone", "rubble"],
    });
    F.shaft(b, ox - 20, 25, oz - 12, 0.2, 3, 29, 0.1, { tint: 0xa0aa80 });
    F.papers(b, RX0 + 2, RZ0 + 2, RX1 - 4, RZ1 - 2, WY, 60, { tint: 0xa89c80 });

    // =========================== CONCOURSE ===========================
    const CZ0 = oz - 52,
      CZ1 = RZ0,
      CH = 7;
    // floor with three stairwell openings (x = -20, 0, 20; z -44..-34)
    const holes = [-20, 0, 20];
    const fz0 = CZ0,
      fz1 = CZ1;
    const floorSeg = (x0, z0, x1, z1) =>
      K.slab(b, "terrazzo", ox + x0, z0, ox + x1, z1, WY, {
        th: 0.5,
        tint: 0xa8a090,
        faces: "tb",
      });
    floorSeg(-32, oz - 34, 32, fz1);
    floorSeg(-32, fz0, 32, oz - 44);
    let xa = -32;
    for (const hx of holes) {
      floorSeg(xa, oz - 44, hx - 2, oz - 34);
      xa = hx + 2;
    }
    floorSeg(xa, oz - 44, 32, oz - 34);
    K.room(b, {
      x0: RX0,
      x1: RX1,
      z0: CZ0,
      z1: CZ1,
      y: WY,
      h: CH,
      floor: null,
      wall: "brick_tan",
      ceil: null,
      doors: {
        s: [
          { at: 14, w: 10, h: 6.8, arch: true },
          { at: 32, w: 10, h: 6.8, arch: true },
          { at: 50, w: 10, h: 6.8, arch: true },
        ],
      },
      wallTint: 0xb8a890,
      base: "granite",
    });
    // steel lattice columns + arched glass vaults (four bays running north-south)
    const sky = K.litPaint("penn_sky", 256, 256);
    for (let bay = 0; bay < 4; bay++) {
      const bx = ox - 24 + bay * 16,
        R = 8;
      for (let i = 0; i < 12; i++) {
        const a0 = (PI * i) / 12,
          a1 = (PI * (i + 1)) / 12;
        const p0 = [bx + Math.cos(a0) * R, WY + CH + Math.sin(a0) * R * 0.75],
          p1 = [bx + Math.cos(a1) * R, WY + CH + Math.sin(a1) * R * 0.75];
        for (let z = CZ0; z < CZ1 - 0.1; z += 4) {
          const miss = (i * 13 + bay * 7 + Math.round(z)) % 7 === 0;
          b.quad(
            miss ? "black" : "atlas_lit",
            [p1[0], p1[1], z],
            [p0[0], p0[1], z],
            [p0[0], p0[1], z + 4],
            [p1[0], p1[1], z + 4],
            { rect: sky, grime: 0 },
          );
          b.beam("black_metal", p0[0], p0[1], z, p1[0], p1[1], z, 0.16);
        }
        b.beam("black_metal", p0[0], p0[1], CZ0, p0[0], p0[1], CZ1, 0.08);
      }
    }
    for (let x = -32; x <= 32; x += 16)
      for (let z = CZ0 + 4; z < CZ1; z += 8) {
        if (Math.abs(x) === 32) continue;
        const cx = ox + x,
          czz = z;
        for (const d of [
          [-0.3, -0.3],
          [0.3, -0.3],
          [-0.3, 0.3],
          [0.3, 0.3],
        ])
          b.beam(
            "black_metal",
            cx + d[0],
            WY,
            czz + d[1],
            cx + d[0] * 0.5,
            WY + CH,
            czz + d[1] * 0.5,
            0.12,
          );
        for (let y = WY + 0.8; y < WY + CH; y += 1.2) {
          b.beam(
            "black_metal",
            cx - 0.28,
            y,
            czz - 0.28,
            cx + 0.28,
            y + 0.6,
            czz + 0.28,
            0.05,
          );
          b.beam(
            "black_metal",
            cx + 0.28,
            y,
            czz - 0.28,
            cx - 0.28,
            y + 0.6,
            czz + 0.28,
            0.05,
          );
        }
        b.box("black_metal", cx, WY + CH - 0.3, czz, 1.6, 0.3, 1.6);
        K.colBox(cx - 0.4, WY, czz - 0.4, cx + 0.4, WY + CH, czz + 0.4, {
          surface: "metal",
        });
      }
    // gable walls closing the glass vaults at both ends
    b.box("brick_tan", ox, WY + CH, CZ0 + 0.15, 64, 6.2, 0.3, {
      faces: "s",
      tint: 0xa89880,
    });
    b.box("brick_tan", ox, WY + CH, CZ1 - 0.15, 64, 6.2, 0.3, {
      faces: "n",
      tint: 0xa89880,
    });
    // stairwell railings + signs + the stairs down
    for (const hx of holes) {
      const x = ox + hx;
      F.railing(b, x - 2, oz - 34, x - 2, oz - 44, WY, {
        mat: "black_metal",
        h: 1.0,
      });
      F.railing(b, x + 2, oz - 34, x + 2, oz - 44, WY, {
        mat: "black_metal",
        h: 1.0,
      });
      F.railing(b, x - 2, oz - 44, x + 2, oz - 44, WY, {
        mat: "black_metal",
        h: 1.0,
      });
      b.stairs("concrete", x, oz - 44, 0, 1, 3.8, 10, PY, WY, 20, {
        tint: 0x9a948a,
      });
      b.box("black_metal", x, WY + 2.6, oz - 33.4, 3.6, 0.8, 0.12);
      b.panel("atlas_lit", x, WY + 3.0, oz - 33.32, 3.2, 0.8, 0, {
        rect: K.litPaint("penn_tracks", 512, 128),
        grime: 0,
      });
      glows.add(x, WY + 3.0, oz - 33.2, 0xe8e0c8, "m");
    }
    // concourse clutter: overturned baggage carts, a gate sign, skeletons (props), Maniac nest bedding
    for (let k = 0; k < 3; k++) {
      const x = ox - 28 + k * 5,
        z = oz - 26 - k * 3;
      b.box("rust", x, 0.4 + WY, z, 2.4, 0.2, 1.2, {
        yaw: k * 0.7,
        rz: k === 1 ? 1.2 : 0,
      });
      for (const d of [-1, 1])
        b.geo("black_metal", T.cyl12, {
          x: x + d * 0.9,
          y: WY + 0.25,
          z,
          sx: 0.25,
          sy: 0.1,
          sz: 0.25,
          rx: HP,
        });
    }
    F.debris(b, ox + 10, WY, oz - 48, 2.6, 18, {
      mound: true,
      col: true,
      colH: 0.8,
      mats: ["glass_base", "rust", "rubble"],
    });
    for (let k = 0; k < 6; k++)
      b.box(
        "cloth_green",
        ox + 24 + (k % 3) * 1.2,
        WY + 0.01,
        oz - 26 - Math.floor(k / 3) * 2.2,
        1.0,
        0.1,
        1.9,
        { yaw: k * 0.6, tint: 0x5a5a3a, grime: 0.8 },
      );
    F.bones(b, ox + 25, WY, oz - 27, 8);
    F.bones(b, ox + 26.5, WY, oz - 29, 6, { skull: false });
    F.papers(b, RX0 + 2, CZ0 + 2, RX1 - 2, CZ1 - 2, WY, 40, { tint: 0x9a9078 });

    // =========================== PLATFORMS ===========================
    const PX0 = ox - 40,
      PX1 = ox + 40,
      PZ0 = oz - 70,
      PZ1 = oz - 34,
      PH = 6.4;
    K.room(b, {
      x0: PX0,
      x1: PX1,
      z0: PZ0,
      z1: PZ1,
      y: BEDY,
      h: PY + PH - BEDY,
      floor: "dirt",
      wall: "tile_cream",
      ceil: null,
      walls: "ns",
      doors: { s: [{ at: 75.5, w: 2.4, h: 2.6, y: 1.2 }] },
      floorTint: 0x4a4238,
      wallTint: 0xa8a088,
      ceilTint: 0x6a6a64,
      grime: 0.7,
      noFloorCol: false,
    });
    // end walls with tunnel portals (the track beds continue); west portal blocked by collapse
    for (const sgn of [-1, 1]) {
      const x = sgn < 0 ? PX0 : PX1;
      K.skin(
        b,
        "concrete_panel",
        x,
        PZ0,
        x,
        PZ1,
        BEDY,
        PY + PH,
        [ox, oz - 55],
        [
          { at: 20, w: 7.6, h: 5.2, arch: true },
          { at: 5, w: 7.6, h: 5.2, arch: true },
        ],
        { tint: 0x8a8478 },
      );
    }
    // ceiling (with the three stairwell holes from the concourse)
    {
      const cy = PY + PH,
        cz0 = oz - 44,
        cz1 = PZ1;
      let xa2 = -40;
      const ceil = (x0, z0, x1, z1) =>
        b.box(
          "concrete",
          ox + (x0 + x1) / 2,
          cy,
          (z0 + z1) / 2,
          x1 - x0,
          0.3,
          z1 - z0,
          { faces: "b", tint: 0x6a6a64, grime: 0.5, seg: 4 },
        );
      ceil(-40, PZ0, 40, cz0);
      for (const hx of [-20, 0, 20]) {
        ceil(xa2, cz0, hx - 2, cz1);
        xa2 = hx + 2;
      }
      ceil(xa2, cz0, 40, cz1);
    }
    // platforms P1 (z -46..-34) and P2 (z -60..-54), with yellow edge strips
    for (const p of [
      [oz - 46, oz - 34],
      [oz - 60, oz - 54],
    ]) {
      K.slab(b, "concrete", PX0, p[0], PX1, p[1], PY, {
        th: 1.2,
        tint: 0x9a948a,
        faces: "tnsew",
        surface: "concrete",
      });
      for (const ez of [p[0], p[1]])
        if (ez !== oz - 34)
          b.box(
            "paint_yellow",
            ox,
            PY,
            ez + (ez === p[0] ? 0.2 : -0.2),
            80,
            0.02,
            0.35,
            { faces: "t", tint: 0xb89830, grime: 0.6 },
          );
    }
    // track beds: tracks at z -52, -48 (bed A) and -66, -62 (bed B)
    for (const tz of [-52, -48, -66, -62])
      track(b, PX0 - 24, PX1 + 24, oz + tz, BEDY);
    // track-bed ladders (steps at the platform ends) so a fallen player can climb out
    for (const e of [
      [ox - 36, oz - 46.6, 1],
      [ox + 30, oz - 53.4, -1],
      [ox - 30, oz - 60.6, 1],
    ])
      b.stairs(
        "concrete",
        e[0],
        e[1] + e[2] * 0.0,
        0,
        e[2],
        1.4,
        1.2,
        BEDY,
        PY,
        3,
        { tint: 0x7a7468 },
      );
    // platform columns + hanging signs + dead lamps
    for (let x = PX0 + 6; x < PX1; x += 10)
      for (const z of [oz - 43, oz - 57]) {
        b.box("paint_green", x, PY, z, 0.5, PH, 0.5, { tint: 0x3a5a4a });
        K.colBox(x - 0.25, PY, z - 0.25, x + 0.25, PY + PH, z + 0.25, {
          surface: "metal",
        });
        if ((x - PX0) % 20 === 6) {
          b.box("lamp_white", x, PY + PH - 0.4, z, 0.2, 0.06, 2.4, {
            grime: 0,
          });
          glows.add(x, PY + PH - 0.5, z, 0xd8e8c0, "m");
        }
      }
    // the derailed locomotive (bed A, nose pitched up onto P2) and the enterable coach
    gg1(b, glows, ox - 14, BEDY + 0.2, oz - 50.5, 0.12, 0.07);
    // coach body on track z -48 (x 4..24), floor at PY, doors mid-car on both sides
    const CX0 = ox + 4,
      CX1 = ox + 24,
      CZa = oz - 49.6,
      CZb = oz - 46.4;
    K.room(b, {
      x0: CX0,
      x1: CX1,
      z0: CZa,
      z1: CZb,
      y: PY,
      h: 2.6,
      floor: "wood",
      wall: "walnut",
      ceil: "plaster",
      t: 0.12,
      doors: {
        n: [
          { at: 10, w: 1.2, h: 2.1 },
          { at: 3, w: 1.1, h: 0.8, y: 1.0 },
          { at: 6, w: 1.1, h: 0.8, y: 1.0 },
          { at: 14, w: 1.1, h: 0.8, y: 1.0 },
          { at: 17, w: 1.1, h: 0.8, y: 1.0 },
        ],
        s: [
          { at: 10, w: 1.2, h: 2.1 },
          { at: 3, w: 1.1, h: 0.8, y: 1.0 },
          { at: 6, w: 1.1, h: 0.8, y: 1.0 },
          { at: 14, w: 1.1, h: 0.8, y: 1.0 },
          { at: 17, w: 1.1, h: 0.8, y: 1.0 },
        ],
      },
      floorTint: 0x6a5238,
      wallTint: 0x6a4028,
      ceilTint: 0xc8b890,
      surface: "wood",
    });
    b.box(
      "paint_red",
      (CX0 + CX1) / 2,
      PY - 1.1,
      (CZa + CZb) / 2,
      CX1 - CX0 + 0.3,
      3.9,
      CZb - CZa + 0.3,
      { faces: "ew", tint: 0x6a2418 },
    );
    const cs = K.paint("penn_coachside", 1024, 128);
    for (const sgn of [-1, 1]) {
      const z = sgn < 0 ? CZa - 0.16 : CZb + 0.16;
      // outer skin: panels around the door and window holes are built as a skin facing outward
      K.skin(
        b,
        "paint_red",
        CX0,
        z,
        CX1,
        z,
        PY - 1.1,
        PY + 2.8,
        [(CX0 + CX1) / 2, z + sgn * 5],
        [
          { at: 10, w: 1.2, h: 3.2 },
          { at: 3, w: 1.1, h: 0.8, y: 2.1 },
          { at: 6, w: 1.1, h: 0.8, y: 2.1 },
          { at: 14, w: 1.1, h: 0.8, y: 2.1 },
          { at: 17, w: 1.1, h: 0.8, y: 2.1 },
        ],
        { t: 0.02, tint: 0x6a2418, col: false, reveal: false },
      );
      b.panel(
        "atlas_paint",
        (CX0 + CX1) / 2 - 5,
        PY + 2.5,
        z + sgn * 0.02,
        7,
        0.45,
        sgn < 0 ? PI : 0,
        { rect: cs, grime: 0.3 },
      );
    }
    // roof (curved) + bogies
    for (let i = 0; i < 6; i++) {
      const a0 = (PI * i) / 6,
        a1 = (PI * (i + 1)) / 6,
        R = 1.75,
        zc = (CZa + CZb) / 2;
      b.quad(
        "paint_red",
        [CX0 - 0.15, PY + 2.8 + Math.sin(a0) * 0.5, zc + Math.cos(a0) * R],
        [CX0 - 0.15, PY + 2.8 + Math.sin(a1) * 0.5, zc + Math.cos(a1) * R],
        [CX1 + 0.15, PY + 2.8 + Math.sin(a1) * 0.5, zc + Math.cos(a1) * R],
        [CX1 + 0.15, PY + 2.8 + Math.sin(a0) * 0.5, zc + Math.cos(a0) * R],
        { tint: 0x4a2018, grime: 0.7 },
      );
    }
    for (const x of [CX0 + 3, CX1 - 3])
      for (const dx of [-0.9, 0.9])
        for (const dz of [-0.72, 0.72])
          b.geo("black_metal", T.cyl12, {
            x: x + dx,
            y: BEDY + 0.6,
            z: oz - 48 + dz,
            sx: 0.45,
            sy: 0.12,
            sz: 0.45,
            rx: HP,
          });
    // coach interior: seat pairs both sides of the aisle, luggage racks
    for (let x = CX0 + 1.2; x < CX1 - 1; x += 1.6) {
      if (Math.abs(x - (CX0 + 10)) < 1.2) continue;
      for (const zs of [CZa + 0.55, CZb - 0.55]) {
        b.box("velvet_red", x, PY, zs, 0.55, 0.45, 0.9, {
          tint: 0x3a4a6a,
          grime: 0.6,
        });
        b.box("velvet_red", x - 0.25, PY + 0.45, zs, 0.1, 0.65, 0.9, {
          tint: 0x3a4a6a,
          grime: 0.6,
        });
      }
    }
    for (const zs of [CZa + 0.4, CZb - 0.4])
      b.box(
        "brass",
        (CX0 + CX1) / 2,
        PY + 2.0,
        zs,
        CX1 - CX0 - 0.6,
        0.04,
        0.45,
        { tint: 0x8a7040 },
      );
    b.box(
      "lamp_amber",
      (CX0 + CX1) / 2,
      PY + 2.55,
      (CZa + CZb) / 2,
      14,
      0.04,
      0.2,
      { grime: 0 },
    );
    glows.add(CX0 + 6, PY + 2.4, oz - 48, 0xffc070, "s");
    glows.add(CX1 - 6, PY + 2.4, oz - 48, 0xffc070, "s");
    // gangplanks: P1 ↔ coach door, coach door ↔ P2
    K.slab(b, "plate", CX0 + 9.4, CZb, CX0 + 10.6, oz - 46, PY, {
      th: 0.08,
      tint: 0x8a8a80,
      surface: "metal",
    });
    K.slab(b, "plate", CX0 + 9.4, oz - 54, CX0 + 10.6, CZa, PY, {
      th: 0.08,
      tint: 0x8a8a80,
      surface: "metal",
    });
    b.box("plate", CX0 + 10, PY - 0.3, oz - 52, 0.3, 0.3, 4, {
      tint: 0x5a5a50,
    });
    // west portal collapse, east tunnel continues to the baggage car & the Conductor
    F.debris(b, PX0 + 1.5, BEDY, oz - 50, 4, 30, {
      mound: true,
      col: true,
      colH: 3,
      mats: ["rubble", "concrete_dark", "rust"],
    });
    F.debris(b, PX0 + 1.5, BEDY, oz - 65, 4, 30, {
      mound: true,
      col: true,
      colH: 3,
      mats: ["rubble", "concrete_dark", "rust"],
    });
    const TX0 = PX1,
      TX1 = PX1 + 22;
    for (const tb of [
      [oz - 54, oz - 46, "n"],
      [oz - 69, oz - 61, "s"],
    ]) {
      K.room(b, {
        x0: TX0,
        x1: TX1,
        z0: tb[0],
        z1: tb[1],
        y: BEDY,
        h: 5.5,
        floor: "dirt",
        wall: "concrete_dark",
        ceil: "concrete_dark",
        walls: "nse",
        doors: { [tb[2]]: [{ at: 13.5, w: 3, h: 2.8 }] },
        floorTint: 0x3a3830,
        wallTint: 0x5a5850,
        grime: 0.8,
      });
    }
    // cross-passage between the two tunnel bores
    K.room(b, {
      x0: TX0 + 12,
      x1: TX0 + 15,
      z0: oz - 61,
      z1: oz - 54,
      y: BEDY,
      h: 3,
      floor: "dirt",
      wall: "concrete_dark",
      ceil: "concrete_dark",
      walls: "ew",
      floorTint: 0x3a3830,
      wallTint: 0x5a5850,
    });
    // baggage car in the north bore (loot), open side door
    b.box("paint_red", TX0 + 8, BEDY + 0.9, oz - 50, 12, 3.2, 3, {
      faces: "nsewt",
      tint: 0x4a2a1e,
      grime: 0.8,
    });
    K.colBox(TX0 + 2, BEDY, oz - 51.5, TX0 + 14, BEDY + 4.1, oz - 48.5, {
      surface: "metal",
    });
    b.box("black", TX0 + 8, BEDY + 1.4, oz - 48.48, 2.4, 2.2, 0.02, {
      faces: "s",
      grime: 0,
    });
    // glowing puddles (radiation) in the south bore
    for (const p of [
      [TX0 + 6, oz - 64],
      [TX0 + 12, oz - 62.5],
      [TX0 + 17, oz - 65],
    ]) {
      b.geo("lamp_fev", T.cyl12, {
        x: p[0],
        y: BEDY + 0.02,
        z: p[1],
        sx: 1.4,
        sy: 0.01,
        sz: 1.0,
        grime: 0,
      });
      glows.add(p[0], BEDY + 0.3, p[1], 0x60ff60, "l");
    }
    F.bones(b, TX0 + 15, BEDY, oz - 57, 10);
    F.bones(b, TX0 + 9, BEDY, oz - 66, 7);
    for (let k = 0; k < 5; k++)
      b.box(
        "cloth_green",
        TX0 + 13 + k * 0.7,
        BEDY + 0.01,
        oz - 58 + (k % 2) * 1.3,
        0.9,
        0.12,
        1.8,
        { yaw: k, tint: 0x4a4a30, grime: 0.9 },
      );
    // service stair: P1 east end → baggage room (y WY)
    K.room(b, {
      x0: ox + 34,
      x1: ox + 37,
      z0: oz - 34,
      z1: oz - 24,
      y: PY,
      h: WY - PY + 3,
      floor: null,
      wall: "concrete_panel",
      ceil: "concrete",
      walls: "ew",
      wallTint: 0x8a8478,
    });
    b.stairs("concrete", ox + 35.5, oz - 34, 0, 1, 2.8, 10, PY, WY, 20, {
      tint: 0x8a8478,
    });
    b.box("lamp_red", ox + 36.8, WY + 2.2, oz - 28, 0.05, 0.2, 0.3, {
      grime: 0,
    });
    glows.add(ox + 36.6, WY + 2.2, oz - 28, 0xff4030, "s");

    // =========================== BAGGAGE ROOM ===========================
    K.room(b, {
      x0: ox + 32,
      x1: ox + 48,
      z0: oz - 24,
      z1: oz,
      y: WY,
      h: 4.5,
      floor: "concrete",
      wall: "brick_tan",
      ceil: "ceil_tile",
      doors: {
        n: [{ at: 3.5, w: 2.8, h: 3.0 }],
        w: [{ at: 19, w: 2, h: 2.6 }],
      },
      floorTint: 0x8a8478,
      wallTint: 0xa89478,
    });
    for (let k = 0; k < 4; k++)
      F.shelf(b, ox + 46.8, WY, oz - 21 + k * 5, -HP, {
        mat: "wood",
        fill: "boxes",
        w: 3.6,
        h: 3,
        tint: 0x6a5238,
      });
    for (let k = 0; k < 9; k++) {
      const r = K.rng(700 + k);
      b.box(
        ["leather_brown", "fabric", "wood"][k % 3],
        ox + 36 + r() * 8,
        WY,
        oz - 18 + r() * 14,
        0.7 + r() * 0.4,
        0.35 + r() * 0.3,
        0.45,
        { yaw: r() * 3, tint: [0x5a3a26, 0x7a6a52, 0x6a5238][k % 3] },
      );
    }
    b.box("mahogany", ox + 40, WY, oz - 1, 6, 1.1, 0.8, { tint: 0x4a2a18 });
    K.colBox(ox + 37, WY, oz - 1.4, ox + 43, WY + 1.1, oz - 0.6, {
      surface: "wood",
    });
    b.box("lamp_amber", ox + 40, WY + 4.4, oz - 15, 0.3, 0.06, 3, { grime: 0 });
    glows.add(ox + 40, WY + 4.3, oz - 15, 0xffc070, "m");

    b.finish(rec.interiorRoot, { cast: false });
    glows.finish(rec.interiorRoot, {
      interior: true,
      nightOpacity: 0.95,
      flicker: 0.12,
    });

    const A = (n, x, y, z, yaw) => rec.anchor(n, x, y, z, yaw);
    A("entrance", ox, 0, oz + 47, 0);
    A("waiting_room", ox + 0.2, WY, oz - 2.6, 0);
    A("concourse", ox, WY, oz - 28, 0);
    A("platform", ox, PY, oz - 43, 0);
    A("boss", ox + 54, BEDY, oz - 64, HP);
    A("baggage_car", ox + 48, BEDY, oz - 47.8, 0);
    A("spawn1", ox - 12, WY, oz + 4, 0);
    A("spawn2", ox + 12, WY, oz - 14, 0);
    A("spawn3", ox - 18, WY, oz - 30, 0);
    A("spawn4", ox + 20, WY, oz - 46, 0);
    A("spawn5", ox - 20, PY, oz - 43, 0);
    A("spawn6", ox + 30, PY, oz - 57, 0);
    return {
      arrival: { x: ox, y: 0, z: oz + 47.5, yaw: 0 },
      exitPos: new THREE.Vector3(ox, 1.6, oz + 49.6),
      ox,
      oz,
      WY,
      PY,
      BEDY,
      TX0,
    };
  }

  function content(rec, I) {
    const C = K.content("penn_station", rec);
    const { ox, oz, WY, PY, BEDY, TX0 } = I;
    C.prop("cash_register", ox + 0.8, WY + 1.12, oz - 4, 0, {
      name: "Newsstand Till",
      mount: "bare",
    });
    C.prop("safe", ox + 31.6, WY + 0.9, oz - 9, -HP, {
      wall: true,
      name: "Ticket Office Safe",
      locked: 0,
      lock: K.LOCKS.penn_ticket_safe,
      loot: "safe",
    });
    C.prop("file_cabinet", ox + 31.4, WY, oz + 8, -HP, {
      name: "Stationmaster Files",
    });
    C.prop("first_aid", ox - 5.8, 1.4, oz + 40, HP, {
      name: "Arcade First Aid",
      loot: "first_aid",
    });
    C.prop("duffle_bag", ox + 8, PY, oz - 47.6, 0.4, {
      name: "Abandoned Luggage",
    });
    C.prop("footlocker", ox + 20, PY, oz - 48.6, 0, {
      name: "Porter's Trunk",
      loot: "luggage",
    });
    C.prop("safe", TX0 + 8, BEDY + 1.0, oz - 49.2, 0, {
      name: "Broadway Limited Payroll Box",
      locked: 0,
      lock: K.LOCKS.penn_payroll,
      items: [
        ["scrip", 260],
        ["old_dollars", 14],
        ["gold_bar", 1],
      ],
    });
    C.prop("ammo_box", ox + 44, WY, oz - 22.5, 0, {
      name: "Railroad Police Locker",
      loot: "ammo_box",
    });
    C.prop("toolbox", ox + 38.4, PY, oz - 36, 0, {
      name: "Track Crew Toolbox",
      loot: "toolbox",
    });
    C.prop("terminal", ox + 39, WY + 1.12, oz - 1, PI, {
      terminalId: "pmid_penn_station",
      mount: "bare",
    });
    C.prop("skeleton", ox - 12.5, WY + 0.45, oz - 11.8, PI, { pose: "seated" }); // commuters still waiting
    C.prop("skeleton", ox + 17, WY + 0.45, oz - 2, 0, { pose: "seated" });
    C.prop("skeleton", ox + 29.2, WY, oz - 6, -HP, { pose: "curled" }); // clerk behind the ticket counter
    C.prop("skeleton", ox + 12, PY, oz - 48, HP, { pose: "sitting" }); // in the coach
    C.prop("skeleton", ox - 6, WY, oz - 45, 0.5, { pose: "reaching" }); // fell short of the stairs
    C.prop("skeleton", ox - 2, BEDY + 4.3, oz - 50.2, 0.12, { pose: "lying" }); // engineer on the loco roof? (slumped at the cab)
    C.prop("barrel", TX0 + 16, BEDY, oz - 63, 0, { radioactive: true });
    C.rad(TX0 + 11, BEDY + 0.5, oz - 64, 9, 4);
    C.rad(ox - 20, WY + 0.5, oz - 14, 5, 0.6);
    C.tape("pmid_penn_conductor", ox + 12.6, PY + 0.5, oz - 47.4, {
      name: "Tape reel: Last Call",
      title: "Conductor Amos Whitlock — personal recording",
      text: "[Recording, heavy breathing]\nThis is Amos Whitlock, conductor, Broadway Limited, Track 3. It's — it's ten-fifteen. The sirens stopped a while ago. Then the lights.\nWe had the payroll box aboard for the Harrisburg yard. I locked it in the baggage car and put the key where I always do, on my watch chain. If anybody finds this: the combination is my daughter's birthday and I'm not telling you that.\nThe people in the waiting room just sat back down. Like the train might still come.\nI'm going to walk down the tunnel and see about the signal. Somebody has to.\n[End of recording]",
    });
    C.note("pmid_penn_ticket", ox - 1, WY + 1.12, oz - 4.3, {
      name: "Unused Ticket",
      title: "Pennsylvania Railroad — One Way, Coach",
      text: "PENNSYLVANIA RAILROAD\nONE WAY · COACH · NOT GOOD FOR PASSAGE AFTER MAR 5 1967\nNew York (Penn Sta.) → Harrisburg\nTrain 29 'The Broadway Limited' — Car 7, Seat 12\n\nScrawled on the back in pencil: 'Meet me under the clock. If I'm late it's because I'm bringing Ma.'",
    });
    C.note("pmid_penn_notice", ox + 40.2, WY + 1.12, oz - 1.2, {
      name: "Railroad Police Bulletin",
      title: "RAILROAD POLICE — BULLETIN 77-19",
      text: "To all station personnel:\nThe so-called 'track people' have been sighted again in the east tunnels beyond Track 4. They are NOT maintenance crew. Do NOT feed them. Do NOT follow the green light.\nAny employee reporting a 'screaming man in a conductor's cap' will be referred to the company physician.\n— Captain R. Doyle, PRR Police",
    });
    C.pickup("prussian_blue", 1, ox + 40.5, WY + 1.12, oz - 0.9);
    C.pickup("rally_tonic", 1, ox + 30.2, WY + 1.22, oz - 1);
    C.pickup("subway_token", 3, ox - 0.6, WY + 1.12, oz - 3.6);
    C.pickup("fizzo_cola", 2, ox + 5, 0.05, oz + 44);
  }

  K.defineSite("penn_station", 30, function () {
    art();
    const rec = K.record("penn_station", "penn_station");
    const ext = buildExterior(rec);
    // the interior is authored with the platforms below 0 and lifted so the track beds sit at y = 0
    const OFF = 13.2;
    K.yOff = OFF;
    let I;
    try {
      I = buildInterior(rec);
      content(rec, I);
    } finally {
      K.yOff = 0;
    }
    K.shiftY(I, OFF);
    K.door(rec, {
      id: "pmid_penn_front",
      pos: ext.doorPos,
      label: "Pennsylvania Station",
      verb: "Enter",
      target: I.arrival,
      onEnter: () => K.discover("penn_station"),
    });
    K.door(rec, {
      id: "pmid_penn_exit",
      pos: I.exitPos,
      label: "Seventh Avenue",
      verb: "Exit to",
      target: ext.outside,
    });
    G.PMID.pennInt = I;
  });
})();
