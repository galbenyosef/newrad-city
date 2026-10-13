// play-inline-523 01 — hull
// Lines 20-365 of readable/play-inline-523.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const K = G.ambient._;

  const LIVERY = {
    continuity: {
      hull: 0x5a5f5c,
      panel: 0x6a706c,
      dark: 0x262a29,
      trim: 0xb8b8a8,
    },
    covenant: {
      hull: 0x3e3a36,
      panel: 0x4c4741,
      dark: 0x1c1a18,
      trim: 0x9a5a2a,
    },
  };
  const GEOS = {};
  const DECALS = {};

  // ------------------------------------------------------------------
  // Decal textures (original insignia)
  // ------------------------------------------------------------------
  function decalTex(kind) {
    if (DECALS[kind]) return DECALS[kind];
    const t = K.canvasTex(256, 256, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      const cx = w / 2,
        cy = h / 2;
      if (kind === "continuity") {
        // white ring on a slate disc, two stacked chevrons ("carry on"), a red bar with the name and the year it still believes in
        c.fillStyle = "#2c3a44";
        c.beginPath();
        c.arc(cx, cy, 112, 0, 6.283);
        c.fill();
        c.lineWidth = 10;
        c.strokeStyle = "#e8e6dc";
        c.beginPath();
        c.arc(cx, cy, 100, 0, 6.283);
        c.stroke();
        c.fillStyle = "#e8e6dc";
        for (const dy of [-46, -14]) {
          c.beginPath();
          c.moveTo(cx - 58, cy + dy + 22);
          c.lineTo(cx, cy + dy - 14);
          c.lineTo(cx + 58, cy + dy + 22);
          c.lineTo(cx + 58, cy + dy + 38);
          c.lineTo(cx, cy + dy + 2);
          c.lineTo(cx - 58, cy + dy + 38);
          c.closePath();
          c.fill();
        }
        c.fillStyle = "#a32a22";
        c.fillRect(cx - 86, cy + 30, 172, 30);
        c.fillStyle = "#f2f0e6";
        c.font = "bold 22px Oswald, Impact, sans-serif";
        c.textAlign = "center";
        c.fillText("CONTINUITY", cx, cy + 53);
        c.font = "bold 16px Oswald, Impact, sans-serif";
        c.fillStyle = "#e8e6dc";
        c.fillText("EST. 1967", cx, cy + 84);
      } else {
        // Iron Covenant: riveted iron shield, an anvil with a flame rising from it
        c.fillStyle = "#4a4540";
        c.strokeStyle = "#151311";
        c.lineWidth = 6;
        c.beginPath();
        c.moveTo(cx - 80, cy - 92);
        c.lineTo(cx + 80, cy - 92);
        c.lineTo(cx + 80, cy + 10);
        c.quadraticCurveTo(cx + 74, cy + 76, cx, cy + 108);
        c.quadraticCurveTo(cx - 74, cy + 76, cx - 80, cy + 10);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = "#8a8378";
        for (let i = 0; i < 7; i++) {
          c.beginPath();
          c.arc(cx - 66 + i * 22, cy - 80, 4, 0, 6.283);
          c.fill();
        }
        c.fillStyle = "#d9d2c2";
        c.beginPath();
        c.moveTo(cx - 54, cy + 4);
        c.lineTo(cx + 30, cy + 4);
        c.quadraticCurveTo(cx + 62, cy + 6, cx + 64, cy + 18);
        c.lineTo(cx + 22, cy + 22);
        c.lineTo(cx + 16, cy + 44);
        c.lineTo(cx + 34, cy + 58);
        c.lineTo(cx - 34, cy + 58);
        c.lineTo(cx - 16, cy + 44);
        c.lineTo(cx - 22, cy + 22);
        c.lineTo(cx - 54, cy + 18);
        c.closePath();
        c.fill();
        c.fillStyle = "#e07a2a";
        c.beginPath();
        c.moveTo(cx - 18, cy - 2);
        c.quadraticCurveTo(cx - 26, cy - 34, cx - 4, cy - 70);
        c.quadraticCurveTo(cx - 2, cy - 44, cx + 10, cy - 38);
        c.quadraticCurveTo(cx + 20, cy - 52, cx + 14, cy - 62);
        c.quadraticCurveTo(cx + 34, cy - 30, cx + 18, cy - 2);
        c.closePath();
        c.fill();
      }
    });
    DECALS[kind] = t;
    return t;
  }

  // ------------------------------------------------------------------
  // Geometry (forward is -Z; origin at the cabin centre)
  // ------------------------------------------------------------------
  const FWD_HUB = [0, 2.35, -5.7],
    AFT_HUB = [0, 3.45, 5.9]; // rotor hub positions (separation ≈11.6 m, discs overlap)
  function buildGeo(kind) {
    if (GEOS[kind]) return GEOS[kind];
    const C = LIVERY[kind];
    const P = (geo, col, pos, rot, sc, n) =>
      K.part(
        geo,
        col,
        pos,
        rot,
        sc,
        n === undefined ? 0.09 : n,
        pos ? pos[0] * 3 + pos[2] : 1,
      );
    const cyl = (rt, rb, h, s) =>
      new THREE.CylinderGeometry(rt, rb, h, s || 12);
    const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const oct = (rt, rb, h) =>
      new THREE.CylinderGeometry(rt, rb, h, 8, 1, false, Math.PI / 8); // flat-sided section
    const RX = [Math.PI / 2, 0, 0];
    const hull = [];
    // fuselage: an octagonal, almost square-section tube, flat floor
    hull.push(
      P(oct(1.38, 1.38, 12.6), C.hull, [0, 0, 0.4], RX, [1.0, 1, 0.94]),
    );
    hull.push(P(box(2.5, 0.3, 12.4), C.dark, [0, -1.2, 0.4], null, null, 0.04));
    // nose: tapered section + rounded cap, cockpit frames
    hull.push(
      P(oct(1.38, 1.0, 1.8), C.hull, [0, -0.05, -6.7], RX, [1.0, 1, 0.94]),
    );
    hull.push(
      P(
        new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        C.hull,
        [0, -0.15, -7.6],
        [-Math.PI / 2, 0, 0],
        [1.0, 0.85, 0.9],
      ),
    );
    hull.push(
      P(box(0.08, 0.9, 1.5), C.dark, [0, 0.62, -7.0], [0.5, 0, 0], null, 0),
    ); // windscreen centre post
    // chin turret
    hull.push(
      P(new THREE.SphereGeometry(0.34, 10, 8), C.dark, [0, -1.05, -7.6]),
    );
    hull.push(P(cyl(0.06, 0.06, 1.1, 6), 0x1a1a1a, [0.1, -1.1, -8.1], RX));
    hull.push(P(cyl(0.06, 0.06, 1.1, 6), 0x1a1a1a, [-0.1, -1.1, -8.1], RX));
    // forward rotor pylon (low hump over the cockpit) and its mast
    hull.push(P(box(1.3, 0.75, 2.6), C.panel, [0, 1.62, -5.4], [0.08, 0, 0]));
    hull.push(
      P(cyl(0.22, 0.3, 0.5, 10), C.dark, [
        FWD_HUB[0],
        FWD_HUB[1] - 0.35,
        FWD_HUB[2],
      ]),
    );
    // aft rotor pylon: tall, raked forward face
    hull.push(P(box(1.5, 2.1, 3.6), C.panel, [0, 2.05, 5.4]));
    hull.push(P(box(1.5, 1.2, 1.6), C.panel, [0, 1.7, 3.3], [-0.5, 0, 0]));
    hull.push(
      P(cyl(0.26, 0.34, 0.5, 10), C.dark, [
        AFT_HUB[0],
        AFT_HUB[1] - 0.35,
        AFT_HUB[2],
      ]),
    );
    // dorsal walkway between the pylons
    hull.push(P(box(0.9, 0.22, 7.0), C.panel, [0, 1.42, 0.0]));
    for (const s of [-1, 1]) {
      // twin engine pods on the aft pylon
      hull.push(P(cyl(0.48, 0.48, 2.9, 12), C.hull, [s * 1.25, 2.05, 5.0], RX));
      hull.push(
        P(
          cyl(0.36, 0.36, 0.12, 12),
          0x0e0e0e,
          [s * 1.25, 2.05, 3.5],
          RX,
          null,
          0,
        ),
      ); // intake
      hull.push(P(cyl(0.34, 0.26, 0.6, 10), C.dark, [s * 1.25, 2.05, 6.7], RX)); // exhaust
      hull.push(P(box(0.4, 0.3, 1.8), C.dark, [s * 0.95, 1.8, 5.0])); // pylon fairing
      // side fuel sponsons
      hull.push(P(box(0.62, 0.9, 6.4), C.hull, [s * 1.55, -0.72, 0.6]));
      hull.push(
        P(
          cyl(0.45, 0.45, 0.62, 10),
          C.hull,
          [s * 1.55, -0.72, -2.6],
          [0, 0, Math.PI / 2],
          [1, 1, 1],
        ),
      );
      // cabin windows (row of small square ports) and the crew door
      for (let k = 0; k < 6; k++)
        hull.push(
          P(
            box(0.05, 0.36, 0.36),
            0x101415,
            [s * 1.31, 0.42, -3.6 + k * 1.15],
            null,
            null,
            0.02,
          ),
        );
      hull.push(
        P(
          box(0.05, 1.5, 0.95),
          C.dark,
          [s * 1.3, -0.15, -4.8],
          null,
          null,
          0.03,
        ),
      );
      // landing gear: nose pair under the cockpit, main pair under the sponsons
      hull.push(P(cyl(0.07, 0.07, 0.75, 6), C.dark, [s * 0.9, -1.55, -5.2]));
      hull.push(
        P(
          cyl(0.34, 0.34, 0.22, 12),
          0x161616,
          [s * 0.9, -1.92, -5.2],
          [0, 0, Math.PI / 2],
          null,
          0.05,
        ),
      );
      hull.push(P(cyl(0.08, 0.08, 0.7, 6), C.dark, [s * 1.6, -1.45, 2.6]));
      hull.push(
        P(
          cyl(0.38, 0.38, 0.26, 12),
          0x161616,
          [s * 1.6, -1.88, 2.6],
          [0, 0, Math.PI / 2],
          null,
          0.05,
        ),
      );
      // trim stripe
      hull.push(
        P(
          box(0.04, 0.12, 9.5),
          C.trim,
          [s * 1.33, -0.62, 0.6],
          null,
          null,
          0.02,
        ),
      );
    }
    // panel seams round the fuselage
    for (const z of [-3.2, 0.4, 3.8])
      hull.push(
        P(oct(1.395, 1.395, 0.05), C.dark, [0, 0, z], RX, [1.0, 1, 0.94], 0),
      );
    // rear loading ramp (tail) and its hinge seam
    hull.push(P(box(2.3, 0.22, 2.0), C.panel, [0, -0.55, 7.25], [0.42, 0, 0]));
    hull.push(P(box(2.4, 0.06, 0.06), C.dark, [0, -1.2, 6.5], null, null, 0));
    // cockpit glazing: flat panes on the nose (front, sides, chin windows)
    const gl = [];
    const pane = (w, h, pos, rot) =>
      gl.push(
        G.util.bake(
          new THREE.BoxGeometry(w, h, 0.04),
          new THREE.Vector3(pos[0], pos[1], pos[2]),
          rot[1],
          1,
          rot[0],
          rot[2],
        ),
      );
    pane(0.85, 0.75, [0.45, 0.55, -7.15], [-0.55, 0.32, 0]);
    pane(0.85, 0.75, [-0.45, 0.55, -7.15], [-0.55, -0.32, 0]);
    pane(1.3, 0.6, [0.98, 0.45, -6.4], [0, Math.PI / 2 - 0.12, 0]);
    pane(1.3, 0.6, [-0.98, 0.45, -6.4], [0, -Math.PI / 2 + 0.12, 0]);
    pane(0.5, 0.4, [0.45, -0.55, -7.55], [0.6, 0.3, 0]);
    pane(0.5, 0.4, [-0.45, -0.55, -7.55], [0.6, -0.3, 0]);
    const glass = K.paint(G.util.mergeGeometries(gl), 0x9ab0b0);
    for (const g of gl) g.dispose();
    // rotor: three long blades + hub (one shared geometry for both rotors)
    const bl = [];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      bl.push(
        K.part(
          new THREE.BoxGeometry(0.42, 0.06, 5.4),
          0x1d1f20,
          [Math.sin(a) * 3.0, 0, Math.cos(a) * 3.0],
          [0.04, a, 0],
          null,
          0.05,
        ),
      );
      bl.push(
        K.part(
          new THREE.BoxGeometry(0.43, 0.062, 0.45),
          0xd8c040,
          [Math.sin(a) * 5.45, 0, Math.cos(a) * 5.45],
          [0.04, a, 0],
          null,
          0,
        ),
      );
    }
    bl.push(K.part(cyl(0.34, 0.34, 0.3, 10), C.dark, [0, 0, 0]));
    bl.push(
      K.part(
        new THREE.SphereGeometry(0.22, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        C.panel,
        [0, 0.15, 0],
      ),
    );
    const rotor = K.merge(bl);
    const disc = new THREE.CircleGeometry(5.7, 32);
    disc.rotateX(-Math.PI / 2);
    const cone = new THREE.ConeGeometry(9, 70, 20, 1, true);
    cone.translate(0, -35, 0);
    GEOS[kind] = {
      hull: K.merge(hull),
      glass,
      rotor,
      disc,
      cone,
      plane: new THREE.PlaneGeometry(1.8, 1.8),
    };
    return GEOS[kind];
  }

