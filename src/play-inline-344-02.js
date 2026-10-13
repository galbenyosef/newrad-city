// play-inline-344 02 — math
// Lines 31-339 of readable/play-inline-344.pretty.js (statement-aligned).
  const PC = G._pc;
  const K = PC.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // footprint & levels (world coords)
  const X0 = 130.4,
    X1 = 189.6,
    ZB = 542.4,
    ZW = 571.4,
    ZF = 572.8;
  const ZBW = 554; // back wall at the west (Centre St) end: the wedge
  const zb = (x) => ZB + ((ZBW - ZB) * (X1 - x)) / (X1 - X0); // back-wall z at x
  const BL = Math.hypot(X1 - X0, ZBW - ZB); // slanted back wall, run from (X1,ZB) to (X0,ZBW)
  const BU = [(X0 - X1) / BL, (ZBW - ZB) / BL]; // its direction (U), outward normal = (−U.z, U.x)
  const BN = [-BU[1], BU[0]];
  const BYAW = Math.atan2(-BU[1], BU[0]); // K.box yaw whose local +x runs along BU
  const PX0 = 148,
    PX1 = 172; // central pavilion
  const LX0 = 152,
    LX1 = 168,
    LZ = 568; // entrance loggia (back wall at LZ)
  const LY = 1.5; // loggia floor
  const G1 = 7.6,
    G2 = 17.2,
    ROOF = 20.6;
  const DC = { x: 160, z: 558.5 }; // dome centre (clear of the slanted back wall)
  PC.POLICE = { X0, X1, ZB, ZBW, ZW, ZF, LX0, LX1, LZ, LY, DC };

  const LIME = [0.88, 0.84, 0.75],
    LIME_D = [0.74, 0.7, 0.62],
    RUST_T = [0.9, 0.86, 0.78];

  // ------------------------------------------------------------------ art
  const frieze = () =>
    K.signCell("pc_pd_frieze", "POLICE  HEADQUARTERS", 1024, 96, {
      bg: "#c9bea4",
      fg: "#3a3226",
      font: 'Georgia, "Times New Roman", serif',
      weight: "bold",
    });
  const banner = () =>
    K.signCell(
      "pc_pd_curfew",
      "CURFEW IN EFFECT\n21:00 — 06:00 · COMPLY",
      512,
      256,
      {
        bg: "#b8261e",
        fg: "#f2e8d0",
        font: '"Arial Black", Arial, sans-serif',
        border: "#f2e8d0",
      },
    );
  const poster = (key, text, bg, fg, sub) =>
    K.signCell("pc_pd_p_" + key, text, 192, 256, {
      bg,
      fg,
      font: '"Arial Black", Arial, sans-serif',
      sub,
      border: fg,
    });
  const plaque = () =>
    K.signCell(
      "pc_pd_plaque",
      "CITY OF NEW YORK\nPOLICE DEPARTMENT\nMCMIX",
      256,
      192,
      {
        bg: "#5a4a2a",
        fg: "#d8c088",
        font: "Georgia, serif",
        border: "#d8c088",
      },
    );
  const tympanum = () =>
    K.paint("art", "pc_pd_tymp", 512, 160, function (x, X, Y, W, H) {
      x.fillStyle = "#b8ae98";
      x.fillRect(X, Y, W, H);
      // low-relief: a central shield (NYPD star) flanked by reclining allegorical figures
      const cx = X + W / 2;
      x.fillStyle = "#9a9080";
      x.beginPath();
      x.moveTo(cx - 34, Y + 26);
      x.lineTo(cx + 34, Y + 26);
      x.lineTo(cx + 34, Y + 90);
      x.quadraticCurveTo(cx, Y + 140, cx - 34, Y + 90);
      x.closePath();
      x.fill();
      x.fillStyle = "#d8ceb6";
      for (let k = 0; k < 7; k++) {
        const a = -HP + (k * PI * 2) / 7;
        x.beginPath();
        x.moveTo(cx, Y + 70);
        x.lineTo(cx + Math.cos(a) * 26, Y + 70 + Math.sin(a) * 26);
        x.lineTo(
          cx + Math.cos(a + 0.45) * 10,
          Y + 70 + Math.sin(a + 0.45) * 10,
        );
        x.fill();
      }
      for (const s of [-1, 1]) {
        x.fillStyle = "#a89e8a";
        x.beginPath();
        x.ellipse(cx + s * 130, Y + 112, 90, 22, s * -0.12, 0, PI * 2);
        x.fill(); // reclining body
        x.beginPath();
        x.arc(cx + s * 62, Y + 88, 15, 0, PI * 2);
        x.fill(); // head
        x.fillRect(cx + s * 200 - 10, Y + 60, 20, 60); // torch / fasces
      }
      K.stains(x, X, Y, W, H, 14, 1501, 0.4, [50, 40, 30]);
      K.streaks(x, X, Y, W, H, 12, 1502, 0.35);
    });

  /** The prow pavilion's clock (stopped at 9:47, like every clock in the Civic Center). */
  const clockFace = () =>
    K.paint("art", "pc_pd_clock", 256, 256, function (x, X, Y, W, H) {
      const cx = X + W / 2,
        cy = Y + H / 2,
        R0 = W * 0.47;
      x.fillStyle = "#b8ae98";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#e8e0c8";
      x.beginPath();
      x.arc(cx, cy, R0, 0, PI * 2);
      x.fill();
      x.strokeStyle = "#6a5a3a";
      x.lineWidth = 7;
      x.stroke();
      x.fillStyle = "#2a2418";
      x.font = "bold 26px Georgia, serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      const RN = [
        "XII",
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
      ];
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * PI * 2 - HP;
        x.fillText(
          RN[k],
          cx + Math.cos(a) * R0 * 0.78,
          cy + Math.sin(a) * R0 * 0.78,
        );
      }
      for (let k = 0; k < 60; k++) {
        const a = (k / 60) * PI * 2;
        x.fillRect(
          cx + Math.cos(a) * R0 * 0.93 - 1.5,
          cy + Math.sin(a) * R0 * 0.93 - 1.5,
          3,
          3,
        );
      }
      const hand = (a, l, w) => {
        x.save();
        x.translate(cx, cy);
        x.rotate(a);
        x.fillStyle = "#1a1612";
        x.fillRect(-w / 2, -l, w, l + 10);
        x.restore();
      };
      hand(((9 + 47 / 60) / 12) * PI * 2, R0 * 0.5, 9);
      hand((47 / 60) * PI * 2, R0 * 0.75, 6);
      x.beginPath();
      x.arc(cx, cy, 8, 0, PI * 2);
      x.fill();
      K.stains(x, X, Y, W, H, 10, 1531, 0.35, [60, 50, 30]);
      // a crack across the dial
      x.strokeStyle = "rgba(40,30,20,0.8)";
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(cx - R0 * 0.7, cy - R0 * 0.2);
      x.lineTo(cx - R0 * 0.2, cy + R0 * 0.1);
      x.lineTo(cx + R0 * 0.3, cy - R0 * 0.05);
      x.lineTo(cx + R0 * 0.6, cy + R0 * 0.4);
      x.stroke();
    });

  // ------------------------------------------------------------------ helpers
  /** Spandrel panel (area of a rect w×H above a semicircle of diameter w), facing +z, bottom centre at origin. */
  const _spand = {};
  function spandrelGeo(w, H) {
    const k = w.toFixed(2) + "x" + H.toFixed(2);
    if (_spand[k]) return _spand[k];
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(-w / 2, H);
    s.lineTo(w / 2, H);
    s.lineTo(w / 2, 0);
    for (let i = 1; i < 16; i++) {
      const a = (i / 16) * PI;
      s.lineTo((Math.cos(a) * w) / 2, (Math.sin(a) * w) / 2);
    }
    s.lineTo(-w / 2, 0);
    return (_spand[k] = new THREE.ShapeGeometry(s));
  }
  K.spandrelGeo = spandrelGeo;

  /** One façade: windows per bay & floor. f: {axis:'x'|'z', line, n:[nx,nz], bays:[centres]}
   *  or a slanted run: f.seg = [ax, az, bx, bz] with bays as fractions 0..1 along it. */
  function facade(b, f, r) {
    const [nx, nz] = f.n;
    const at = f.seg
      ? (t) => [
          f.seg[0] + (f.seg[2] - f.seg[0]) * t,
          f.seg[1] + (f.seg[3] - f.seg[1]) * t,
        ]
      : (t) => (f.axis === "x" ? [t, f.line] : [f.line, t]);
    const fy = Math.atan2(nx, nz); // K.box yaw whose local +x runs along the wall (tangent (nz, −nx))
    for (const t of f.bays) {
      const [x, z] = at(t);
      const st = () => {
        const v = r();
        return v < 0.45
          ? "broken"
          : v < 0.62
            ? "dark"
            : v < 0.8
              ? "glass"
              : "boarded";
      };
      // ground floor: round-headed, in the rustication
      K.archWin(b, x, 2.2, z, nx, nz, 1.7, 3.8, {
        state: st(),
        surround: "limestone",
        surroundTint: LIME,
        sillMat: "granite",
        frame: "paint_black",
        inset: 0.2,
      });
      // piano nobile: pedimented / hooded windows
      K.window(b, x, 10.1, z, nx, nz, 1.6, 3.0, {
        state: st(),
        surround: "limestone",
        surroundTint: LIME_D,
        lintel: 0.28,
        frame: "paint_black",
        inset: 0.2,
      });
      const hx = x + nx * 0.25,
        hz = z + nz * 0.25;
      if (f.pedHoods)
        K.pediment(b, hx, 11.9, hz, 2.2, 0.55, nx, nz, 0.3, { tint: LIME_D });
      else
        b.box("limestone", hx, 11.72, hz, 2.3, 0.22, 0.5, {
          tint: LIME_D,
          yaw: fy,
        });
      K.window(b, x, 14.3, z, nx, nz, 1.5, 2.4, {
        state: st(),
        surround: "limestone",
        surroundTint: LIME_D,
        frame: "paint_black",
        inset: 0.2,
      });
      // attic
      K.window(b, x, 18.8, z, nx, nz, 1.1, 1.2, {
        state: r() < 0.6 ? "dark" : "broken",
        surround: "limestone",
        surroundTint: LIME_D,
        sill: false,
        inset: 0.12,
      });
      // balconette under the piano-nobile window
      b.box("limestone", x + nx * 0.3, G1 + 0.8, z + nz * 0.3, 2.2, 0.2, 0.6, {
        tint: LIME,
        yaw: fy,
      });
    }
    // giant-order pilasters between bays (G1 → G2)
    for (let i = 0; i < f.bays.length - 1; i++) {
      const t = (f.bays[i] + f.bays[i + 1]) / 2,
        [x, z] = at(t);
      b.box(
        "limestone",
        x + nx * 0.17,
        G1,
        z + nz * 0.17,
        0.9,
        G2 - G1 - 0.7,
        0.34,
        { tint: LIME, yaw: fy },
      );
      b.box(
        "limestone",
        x + nx * 0.22,
        G2 - 0.7,
        z + nz * 0.22,
        1.15,
        0.7,
        0.46,
        { tint: LIME_D, yaw: fy },
      );
    }
  }

  // ------------------------------------------------------------------ EXTERIOR
