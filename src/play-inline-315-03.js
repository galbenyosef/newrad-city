// play-inline-315 03 — math
// Lines 322-645 of readable/play-inline-315.pretty.js (statement-aligned).
  function schematicCell(i) {
    return K.paint("pics", "ny_schem_" + i, 256, 192, function (x, X, Y, W, H) {
      x.fillStyle = "#1c3a6a";
      x.fillRect(X, Y, W, H);
      x.strokeStyle = "rgba(210,230,255,0.85)";
      x.lineWidth = 1.5;
      x.strokeRect(X + 6, Y + 6, W - 12, H - 12);
      const r = K.rng("schem" + i);
      if (i % 3 === 0) {
        // Wardenclyffe tower
        const cx = X + W / 2;
        x.beginPath();
        x.moveTo(cx - 30, Y + H - 20);
        x.lineTo(cx - 12, Y + 60);
        x.lineTo(cx + 12, Y + 60);
        x.lineTo(cx + 30, Y + H - 20);
        x.stroke();
        x.beginPath();
        x.ellipse(cx, Y + 55, 45, 22, 0, Math.PI, 0);
        x.stroke();
        x.beginPath();
        x.moveTo(cx - 45, Y + 55);
        x.lineTo(cx + 45, Y + 55);
        x.stroke();
        for (let k = 0; k < 6; k++) {
          x.beginPath();
          x.moveTo(cx - 28 + k * 3, Y + H - 20 - k * 16);
          x.lineTo(cx + 28 - k * 3, Y + H - 20 - k * 16);
          x.stroke();
        }
      } else if (i % 3 === 1) {
        // coil
        const cx = X + W / 2;
        for (let k = 0; k < 14; k++) {
          x.beginPath();
          x.ellipse(cx, Y + 50 + k * 8, 18, 3, 0, 0, 6.3);
          x.stroke();
        }
        x.beginPath();
        x.ellipse(cx, Y + 40, 40, 12, 0, 0, 6.3);
        x.stroke();
        x.beginPath();
        x.moveTo(cx + 40, Y + 40);
        for (let k = 0; k < 6; k++)
          x.lineTo(cx + 50 + k * 10, Y + 30 + (k % 2) * 16);
        x.stroke();
      } else {
        // circuit
        for (let k = 0; k < 18; k++) {
          const a = X + 12 + r() * (W - 24),
            b = Y + 12 + r() * (H - 24);
          x.beginPath();
          x.moveTo(a, b);
          x.lineTo(a + (r() - 0.5) * 80, b);
          x.lineTo(a + (r() - 0.5) * 80, b + (r() - 0.5) * 50);
          x.stroke();
          x.beginPath();
          x.arc(a, b, 3, 0, 6.3);
          x.stroke();
        }
      }
      x.fillStyle = "rgba(210,230,255,0.85)";
      x.font = "10px monospace";
      x.fillText(
        ["WARDENCLYFFE — ELEV.", "MAGNIFYING TX — SEC.", "TELEFORCE — FIG. 7"][
          i % 3
        ],
        X + 12,
        Y + H - 10,
      );
      K.stains(x, X, Y, W, H, 8, 23 + i, 0.4, [60, 50, 30]);
    });
  }
  function plaqueCell(key, text, w, h) {
    return K.signCell(key, text, w || 512, h || 160, {
      bg: "#2e2410",
      fg: "#e0c070",
      font: "Georgia, serif",
      border: "#c8a050",
    });
  }
  function roomNo(n) {
    return K.signCell("ny_room_" + n, String(n), 128, 64, {
      bg: "#2a1c10",
      fg: "#d8b060",
      font: "Georgia, serif",
      border: "#b08a40",
    });
  }
  function inlayCell() {
    return K.paint("art", "ny_inlay", 512, 512, function (x, X, Y, W, H) {
      x.clearRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H / 2;
      x.fillStyle = "rgba(40,26,18,0.9)";
      x.beginPath();
      x.arc(cx, cy, W * 0.46, 0, 6.3);
      x.fill();
      for (let k = 0; k < 16; k++) {
        const a = (k * Math.PI) / 8,
          L = k % 2 ? W * 0.3 : W * 0.44;
        x.fillStyle = k % 4 === 0 ? "#c8a050" : k % 2 ? "#e8e0c8" : "#8a2a1e";
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(
          cx + Math.cos(a - 0.12) * W * 0.08,
          cy + Math.sin(a - 0.12) * W * 0.08,
        );
        x.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L);
        x.lineTo(
          cx + Math.cos(a + 0.12) * W * 0.08,
          cy + Math.sin(a + 0.12) * W * 0.08,
        );
        x.fill();
      }
      x.strokeStyle = "#c8a050";
      x.lineWidth = 6;
      x.beginPath();
      x.arc(cx, cy, W * 0.46, 0, 6.3);
      x.stroke();
      x.fillStyle = "#c8a050";
      x.font = "bold 34px Georgia, serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("NY", cx, cy);
      K.stains(x, X, Y, W, H, 10, 5, 0.35, [40, 30, 20]);
    });
  }

  // ==================================================================
  // FURNITURE / DRESSING HELPERS (deco)
  // ==================================================================
  /** Tiered deco chandelier: rings of glass beads, a crown, a chain. */
  function chandelier(b, x, y, z, s, ceil, col, inten, rad, box, dead) {
    b.pipe("brass", x, y + 0.9 * s, z, x, ceil, z, 0.02, 4);
    for (let t = 0; t < 3; t++) {
      const rr = (1.1 - t * 0.3) * s,
        yy = y + t * 0.32 * s;
      b.cyl("brass", x, yy, z, rr, rr, 0.07, 18, { top: false });
      b.cyl("brass", x, yy - 0.001, z, rr - 0.05, rr - 0.05, 0.07, 18, {
        top: false,
      });
      const n = Math.round(10 + rr * 8);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * PI * 2;
        b.pipe(
          "glass",
          x + Math.cos(a) * rr,
          yy - 0.02,
          z + Math.sin(a) * rr,
          x + Math.cos(a) * rr,
          yy - 0.34 * s,
          z + Math.sin(a) * rr,
          0.02,
          3,
          { tint: [0.85, 0.9, 0.9] },
        );
        if (!dead && k % 3 === 0)
          b.geo("lamp", K.sphereGeo(), {
            x: x + Math.cos(a) * rr,
            y: yy + 0.08,
            z: z + Math.sin(a) * rr,
            s: 0.05,
            tint: col,
          });
      }
    }
    b.cyl("glass", x, y - 0.5 * s, z, 0.05, 0.35 * s, 0.5 * s, 10, {
      tint: [0.8, 0.85, 0.85],
    });
    b.cyl("brass", x, ceil - 0.12, z, 0.35 * s, 0.25 * s, 0.12, 12, {
      tint: [0.7, 0.55, 0.3],
    });
    for (let k = 0; k < 4; k++) {
      const a = k * HP + 0.4;
      b.pipe(
        "brass",
        x,
        y + 0.9 * s,
        z,
        x + Math.cos(a) * 1.1 * s,
        y + 0.02,
        z + Math.sin(a) * 1.1 * s,
        0.012,
        3,
      );
    }
    if (!dead) {
      b.light(x, y - 0.2, z, col, inten, rad, { box });
      b.glow(
        x,
        y + 0.2 * s,
        z,
        [col[0] * 0.6, col[1] * 0.55, col[2] * 0.45],
        2.6 * s,
      );
    }
  }
  /** Fallen chandelier wreck on the floor. */
  function fallenChandelier(b, x, y, z, s, r) {
    for (let t = 0; t < 3; t++) {
      const rr = (1.1 - t * 0.3) * s;
      b.cyl(
        "brass",
        x + (r() - 0.5) * 0.6,
        y + 0.02 + t * 0.05,
        z + (r() - 0.5) * 0.6,
        rr,
        rr,
        0.06,
        18,
        { top: false, tint: [0.7, 0.6, 0.45] },
      );
    }
    for (let k = 0; k < 40; k++) {
      const a = r() * 6.28,
        d = r() * 2.6 * s;
      b.box(
        "glass",
        x + Math.cos(a) * d,
        y,
        z + Math.sin(a) * d,
        0.05 + r() * 0.08,
        0.02,
        0.1 + r() * 0.2,
        { yaw: r() * 3, tint: [0.8, 0.85, 0.85] },
      );
    }
    b.pipe("brass", x, y + 0.05, z, x + 2.6, y + 0.05, z - 1.4, 0.02, 4);
    b.hplate("decal", x, y + 0.012, z, 4 * s, 4 * s, 0.4, K.decal("crack", 3));
  }
  /** Potted dead palm. */
  function deadPalm(b, x, y, z, r) {
    b.cyl("bronze", x, y, z, 0.38, 0.3, 0.7, 12, { tint: [0.5, 0.38, 0.22] });
    b.cyl("dirt", x, y + 0.6, z, 0.34, 0.34, 0.04, 10);
    b.cyl("wood_rotten", x, y + 0.6, z, 0.06, 0.04, 1.4, 5, {
      tint: [0.45, 0.38, 0.28],
    });
    for (let k = 0; k < 6; k++) {
      const a = r() * 6.28,
        L = 0.7 + r() * 0.5;
      b.beam(
        "wood_rotten",
        x,
        y + 1.95,
        z,
        x + Math.cos(a) * L,
        y + 1.3 + r() * 0.5,
        z + Math.sin(a) * L,
        0.12,
        0.015,
        { tint: [0.5, 0.42, 0.26] },
      );
    }
  }
  /** Brass luggage cart with suitcases. */
  function luggageCart(b, x, y, z, yaw, r, tipped) {
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    const P = (lx, ly, lz) => [
      x + lx * c + lz * s,
      y + ly,
      z - lx * s + lz * c,
    ];
    if (tipped) {
      b.box("brass", x, y + 0.1, z, 1.6, 0.06, 0.8, {
        yaw: yaw + 0.3,
        tint: [0.6, 0.5, 0.3],
      });
    } else {
      b.box("bronze", x, y + 0.3, z, 1.5, 0.06, 0.7, {
        yaw,
        tint: [0.4, 0.3, 0.18],
      });
      for (const lx of [-0.72, 0.72]) {
        const a = P(lx, 0.3, -0.32),
          a2 = P(lx, 1.9, -0.32),
          bb = P(lx, 0.3, 0.32),
          b2 = P(lx, 1.9, 0.32);
        b.pipe("brass", a[0], a[1], a[2], a2[0], a2[1], a2[2], 0.02, 5);
        b.pipe("brass", bb[0], bb[1], bb[2], b2[0], b2[1], b2[2], 0.02, 5);
      }
      const t0 = P(-0.72, 1.9, 0),
        t1 = P(0.72, 1.9, 0);
      b.pipe("brass", t0[0], t0[1], t0[2], t1[0], t1[1], t1[2], 0.025, 6);
      for (let k = 0; k < 3; k++) {
        const p = P(-0.4 + k * 0.4, 0.33 + k * 0.12, (r() - 0.5) * 0.2);
        b.box(
          "leather",
          p[0],
          p[1],
          p[2],
          0.5 + r() * 0.2,
          0.3 + r() * 0.2,
          0.6,
          {
            yaw: yaw + (r() - 0.5) * 0.4,
            tint: r.pick([
              [0.5, 0.3, 0.2],
              [0.3, 0.3, 0.35],
              [0.6, 0.5, 0.35],
            ]),
          },
        );
      }
      for (const lx of [-0.6, 0.6])
        for (const lz of [-0.28, 0.28]) {
          const p = P(lx, 0.1, lz);
          b.cyl("rubber", p[0], p[1] - 0.1, p[2], 0.1, 0.1, 0.06, 8);
        }
      b.ocol(x, z, 1.5, 0.7, y, y + 1.2, yaw, {
        tag: "furniture",
        walkable: false,
      });
    }
  }
  function armchair(b, x, y, z, yaw, tint) {
    K.sofa(b, x, y, z, 1.0, yaw, {
      mat: "velvet",
      tint: tint || [0.55, 0.25, 0.2],
      d: 0.85,
    });
  }
  /** Elevator door (deco): bronze frame, sunburst leaves, floor dial. open = dark shaft. */
