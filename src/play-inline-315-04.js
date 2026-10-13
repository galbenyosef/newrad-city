// play-inline-315 04 — tint
// Lines 646-831 of readable/play-inline-315.pretty.js (statement-aligned).
  function elevatorDoor(b, x, y, z, nx, nz, open, label) {
    const rx = nz,
      rz = -nx;
    const P = (u, v, d) => [x + rx * u + nx * d, y + v, z + rz * u + nz * d];
    const yaw = Math.atan2(-rz, rx);
    const box = (u, v, W, H, D, mat, tint) => {
      const c = P(u, v, D / 2);
      b.box(mat, c[0], c[1], c[2], W, H, D, { yaw, tint });
    };
    box(-0.95, 0, 0.3, 3.0, 0.22, "bronze", [0.55, 0.4, 0.22]);
    box(0.95, 0, 0.3, 3.0, 0.22, "bronze", [0.55, 0.4, 0.22]);
    box(0, 2.8, 2.2, 0.5, 0.24, "bronze", [0.55, 0.4, 0.22]);
    if (open) {
      b.plate(
        "paint_black",
        P(0, 1.35, 0.01)[0],
        y + 1.35,
        P(0, 1.35, 0.01)[2],
        nx,
        nz,
        1.6,
        2.7,
        null,
        { tint: [0.02, 0.02, 0.02] },
      );
      box(-0.62, 0, 0.36, 2.7, 0.05, "bronze", [0.4, 0.3, 0.18]); // leaf pried half open
      b.plate(
        "art",
        P(-0.62, 1.35, 0.06)[0],
        y + 1.35,
        P(-0.62, 1.35, 0.06)[2],
        nx,
        nz,
        0.34,
        2.6,
        NY.sunburstCell(),
        { tint: [0.7, 0.6, 0.4] },
      );
    } else {
      b.plate(
        "art",
        P(-0.4, 1.35, 0.03)[0],
        y + 1.35,
        P(-0.4, 1.35, 0.03)[2],
        nx,
        nz,
        0.8,
        2.7,
        NY.sunburstCell(),
        { tint: [0.85, 0.75, 0.55] },
      );
      b.plate(
        "art",
        P(0.4, 1.35, 0.03)[0],
        y + 1.35,
        P(0.4, 1.35, 0.03)[2],
        nx,
        nz,
        0.8,
        2.7,
        NY.sunburstCell(),
        { tint: [0.85, 0.75, 0.55] },
      );
    }
    // floor indicator dial above
    const d = P(0, 3.35, 0.05);
    b.cyl("brass", d[0], d[1] - 0.25, d[2], 0.28, 0.28, 0.04, 14, {
      tint: [0.7, 0.55, 0.3],
    });
    if (label)
      b.plate(
        "art",
        P(0, 3.35, 0.26)[0],
        y + 3.35,
        P(0, 3.35, 0.26)[2],
        nx,
        nz,
        0.44,
        0.22,
        label,
        { off: 0.01 },
      );
  }
  /** Round banquet table with cloth, plates, glasses, candle; returns top y. */
  function banquetTable(b, x, y, z, r, rr) {
    K.roundTable(b, x, y, z, r, { mat: "wood_dark", cloth: [0.82, 0.78, 0.7] });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * PI * 2 + rr() * 0.2,
        px = x + Math.cos(a) * (r - 0.25),
        pz = z + Math.sin(a) * (r - 0.25);
      if (rr() < 0.8) b.cyl("ceramic", px, y + 0.76, pz, 0.13, 0.11, 0.02, 10);
      if (rr() < 0.6)
        b.cyl("glass", px + 0.15, y + 0.76, pz, 0.03, 0.03, 0.15, 6, {
          tint: [0.8, 0.85, 0.85],
        });
      const cx = x + Math.cos(a) * (r + 0.45),
        cz = z + Math.sin(a) * (r + 0.45);
      K.chair(b, cx, y, cz, -a + HP, {
        mat: "gold",
        seatMat: "velvet",
        seatTint: [0.55, 0.15, 0.15],
        fallen: rr() < 0.18,
      });
    }
    b.cyl("brass", x, y + 0.76, z, 0.06, 0.04, 0.3, 8);
    b.cyl("ceramic", x, y + 1.06, z, 0.02, 0.02, 0.08, 5, {
      tint: [0.9, 0.85, 0.7],
    });
    return y + 0.76;
  }

  /** Deco coffered ceiling: a grid of gilded beams under a plaster ceiling at height y. */
  function coffers(b, x0, z0, x1, z1, y, step, mat, tint) {
    for (let x = x0 + step; x < x1 - 0.1; x += step)
      b.boxMM(mat, x - 0.14, y - 0.32, z0, x + 0.14, y, z1, {
        tint,
        faces: "nsewb",
        grime: 0.25,
      });
    for (let z = z0 + step; z < z1 - 0.1; z += step)
      b.boxMM(mat, x0, y - 0.3, z - 0.14, x1, y - 0.02, z + 0.14, {
        tint,
        faces: "nsewb",
        grime: 0.25,
      });
    for (let x = x0 + step / 2; x < x1; x += step)
      for (let z = z0 + step / 2; z < z1; z += step)
        b.cyl(mat, x, y - 0.06, z, 0.3, 0.18, 0.06, 8, {
          tint,
          bottom: true,
          top: false,
        });
  }
  /** Frame bars only (no canvas) around a wall rectangle. */
  function frameOnly(b, x, y, z, nx, nz, w, h, mat, t) {
    const rx = nz,
      rz = -nx,
      d = 0.05;
    const P = (u, v) => [x + rx * u + nx * d, y + v, z + rz * u + nz * d];
    const bar = (u0, v0, u1, v1) => {
      const a = P(u0, v0),
        c = P(u1, v1);
      b.beam(mat, a[0], a[1], a[2], c[0], c[1], c[2], t, 0.08, { grime: 0.2 });
    };
    bar(-w / 2 - t / 2, -h / 2 - t / 2, w / 2 + t / 2, -h / 2 - t / 2);
    bar(-w / 2 - t / 2, h / 2 + t / 2, w / 2 + t / 2, h / 2 + t / 2);
    bar(-w / 2 - t / 2, -h / 2 - t, -w / 2 - t / 2, h / 2 + t);
    bar(w / 2 + t / 2, -h / 2 - t, w / 2 + t / 2, h / 2 + t);
  }
  function droppingsCell(i) {
    return K.paint(
      "art",
      "ny_droppings_" + i,
      128,
      128,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        const r = K.rng("drop" + i);
        for (let k = 0; k < 60; k++) {
          const px = X + W / 2 + (r() - 0.5) * W * 0.9,
            py = Y + H / 2 + (r() - 0.5) * H * 0.9;
          x.fillStyle =
            "rgba(" +
            ((200 + r() * 40) | 0) +
            "," +
            ((200 + r() * 40) | 0) +
            "," +
            ((190 + r() * 40) | 0) +
            "," +
            (0.5 + r() * 0.5).toFixed(2) +
            ")";
          x.beginPath();
          x.ellipse(px, py, 1 + r() * 4, 1 + r() * 3, r() * 3, 0, 6.3);
          x.fill();
        }
        for (let k = 0; k < 8; k++) {
          x.fillStyle = "rgba(60,60,55,0.5)";
          x.fillRect(X + r() * W, Y + r() * H, 2, 2);
        }
      },
    );
  }

  // ==================================================================
  // INTERIOR BUILD
  // ==================================================================
