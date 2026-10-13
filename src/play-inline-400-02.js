// play-inline-400 02 — tint
// Lines 23-302 of readable/play-inline-400.pretty.js (statement-aligned).
  const PV = G._pv3;
  const K = PV.kit;
  const PI = Math.PI;
  PV.EXT = PV.EXT || {};

  const X0 = 162,
    X1 = 189,
    Z0 = 232,
    Z1 = 255; // base block
  const BH = 36; // base block height (setback)
  const CX = 175.5,
    CZ = 243.5,
    TW = 14; // tower centre & width
  const DOOR = { x: CX, z: Z1 };
  PV.CE_DOOR = DOOR;
  const LIME = [0.86, 0.83, 0.76],
    GRAN = [0.52, 0.5, 0.5];

  /**
   * Office façade: limestone wall, projecting piers, and per bay a framed window (jambs, head, projecting sill,
   * steel mullions) over a recessed spandrel panel with a carved rosette. A handful of windows glow a faint
   * terminal-green (the robots never turn the monitors off). skip(cx,y,cz) leaves a bay out (blast hole).
   * o: {pier (width), pierDepth, arch (top floor gets round heads), glowChance}
   */
  function officeFace(
    b,
    r,
    ax,
    az,
    bx,
    bz,
    nx,
    nz,
    y0,
    y1,
    bays,
    floorH,
    skip,
    o,
  ) {
    o = o || {};
    const len = Math.hypot(bx - ax, bz - az),
      ux = (bx - ax) / len,
      uz = (bz - az) / len;
    const cross = [-uz, 0, ux];
    if (cross[0] * nx + cross[2] * nz > 0)
      b.face("limestone", ax, y0, az, ux, 0, uz, 0, 1, 0, len, y1 - y0, {
        tint: LIME,
      });
    else
      b.face("limestone", bx, y0, bz, -ux, 0, -uz, 0, 1, 0, len, y1 - y0, {
        tint: LIME,
      });
    const bw = len / bays,
      pw = o.pier || 0.62,
      pd = o.pierDepth || 0.42,
      dd = o.d || b; // dd: far-culled detail builder
    for (let i = 0; i <= bays; i++) {
      const t = i * bw,
        px = ax + ux * t + (nx * pd) / 2,
        pz = az + uz * t + (nz * pd) / 2;
      const corner = i === 0 || i === bays;
      b.beam(
        "limestone",
        px,
        y0,
        pz,
        px,
        y1,
        pz,
        corner ? pw * 1.6 : pw,
        corner ? pd * 1.3 : pd,
        { tint: LIME.map((v) => v * (corner ? 1.02 : 0.97)) },
      );
    }
    const floors = [];
    for (let y = y0 + floorH; y < y1 - 0.5; y += floorH) floors.push(y);
    floors.forEach((y, fi) => {
      // floor band between the piers
      b.beam(
        "limestone",
        ax + nx * 0.12,
        y - 0.1,
        az + nz * 0.12,
        bx + nx * 0.12,
        y - 0.1,
        bz + nz * 0.12,
        0.22,
        0.24,
        { tint: LIME.map((v) => v * 0.93) },
      );
      const top = o.arch && fi === floors.length - 1;
      for (let i = 0; i < bays; i++) {
        const t = (i + 0.5) * bw,
          cx = ax + ux * t,
          cz = az + uz * t;
        if (skip && skip(cx, y, cz)) continue;
        const u = r(),
          st =
            u < 0.22
              ? "broken"
              : u < 0.32
                ? "boarded"
                : u < 0.9
                  ? "dark"
                  : "glass";
        const w = bw - pw - 0.55,
          h = floorH - 1.35,
          yb = y + 0.55;
        // spandrel panel below the sill (recess reads as a darker, flat panel) + rosette
        b.plate("limestone", cx, y + 0.25, cz, nx, nz, w + 0.2, 0.42, null, {
          off: 0.01,
          tint: LIME.map((v) => v * 0.78),
          grime: 0.5,
        });
        dd.box(
          "limestone",
          cx + nx * 0.04,
          y + 0.14,
          cz + nz * 0.04,
          0.24,
          0.22,
          0.08,
          { yaw: Math.atan2(nx, nz), tint: LIME.map((v) => v * 0.9) },
        );
        if (top) {
          K.archWin(b, cx, yb, cz, nx, nz, w, h, {
            state: st === "glass" ? "dark" : st,
            surround: "limestone",
            surroundTint: LIME.map((v) => v * 1.02),
            fw: 0.14,
            depth: 0.14,
            keystone: true,
            sill: true,
            frame: "metal_dark",
          });
          continue;
        }
        const glow = st === "dark" && r() < (o.glowChance || 0);
        const back = glow
          ? "lamp"
          : st === "glass"
            ? "glass"
            : st === "boarded"
              ? "wood_rotten"
              : "paint_black";
        b.plate(back, cx, yb + h / 2, cz, nx, nz, w, h, null, {
          off: 0.03,
          tint: glow
            ? [0.035, 0.09, 0.05]
            : st === "glass"
              ? [0.3, 0.36, 0.38]
              : st === "boarded"
                ? [0.5, 0.44, 0.36]
                : [0.03, 0.03, 0.035],
          grime: 0.2,
        });
        // jambs + head + sill (the frame gives the window a real reveal)
        for (const s of [-1, 1]) {
          const jx = cx + ux * s * (w / 2 + 0.07) + nx * 0.08,
            jz = cz + uz * s * (w / 2 + 0.07) + nz * 0.08;
          b.beam("limestone", jx, yb, jz, jx, yb + h, jz, 0.14, 0.16, {
            tint: LIME.map((v) => v * 1.03),
          });
        }
        b.beam(
          "limestone",
          cx - ux * (w / 2 + 0.2) + nx * 0.1,
          yb + h + 0.1,
          cz - uz * (w / 2 + 0.2) + nz * 0.1,
          cx + ux * (w / 2 + 0.2) + nx * 0.1,
          yb + h + 0.1,
          cz + uz * (w / 2 + 0.2) + nz * 0.1,
          0.2,
          0.2,
          { tint: LIME.map((v) => v * 1.04) },
        );
        b.beam(
          "limestone",
          cx - ux * (w / 2 + 0.18) + nx * 0.14,
          yb - 0.06,
          cz - uz * (w / 2 + 0.18) + nz * 0.14,
          cx + ux * (w / 2 + 0.18) + nx * 0.14,
          yb - 0.06,
          cz + uz * (w / 2 + 0.18) + nz * 0.14,
          0.12,
          0.28,
          { tint: LIME.map((v) => v * 0.98) },
        );
        if (st !== "boarded") {
          // steel casement: centre mullion + transom
          dd.beam(
            "metal_dark",
            cx + nx * 0.06,
            yb,
            cz + nz * 0.06,
            cx + nx * 0.06,
            yb + h,
            cz + nz * 0.06,
            0.06,
            0.05,
            { tint: [0.22, 0.22, 0.21] },
          );
          dd.beam(
            "metal_dark",
            cx - (ux * w) / 2 + nx * 0.06,
            yb + h * 0.66,
            cz - (uz * w) / 2 + nz * 0.06,
            cx + (ux * w) / 2 + nx * 0.06,
            yb + h * 0.66,
            cz + (uz * w) / 2 + nz * 0.06,
            0.05,
            0.05,
            { tint: [0.22, 0.22, 0.21] },
          );
        }
        if (st === "broken" && r() < 0.6)
          dd.plate(
            "glass",
            cx - ux * w * 0.22,
            yb + 0.35,
            cz - uz * w * 0.22,
            nx,
            nz,
            w * 0.4,
            0.55,
            null,
            { off: 0.05, tint: [0.45, 0.52, 0.52] },
          );
        if (st === "boarded" && r() < 0.5)
          dd.plate(
            "decal",
            cx,
            yb + h * 0.5,
            cz,
            nx,
            nz,
            w * 0.9,
            h * 0.35,
            K.tag(r() < 0.5 ? "ROBOTS INSIDE" : "NO!", "#c02818", 192, 72),
            { off: 0.2 },
          );
      }
    });
  }

  /** Balustrade (plinth, turned balusters, handrail) along A→B at height y (for ledges and the loggia). */
  function balustrade(b, ax, az, bx, bz, y, o) {
    o = o || {};
    const len = Math.hypot(bx - ax, bz - az),
      ux = (bx - ax) / len,
      uz = (bz - az) / len,
      h = o.h || 1.0,
      t = o.tint || LIME;
    b.beam("limestone", ax, y + 0.08, az, bx, y + 0.08, bz, 0.4, 0.16, {
      tint: t,
    });
    b.beam(
      "limestone",
      ax,
      y + h - 0.08,
      az,
      bx,
      y + h - 0.08,
      bz,
      0.42,
      0.16,
      { tint: t },
    );
    const n = Math.max(1, Math.floor(len / (o.step || 0.5)));
    for (let i = 0; i <= n; i++) {
      const px = ax + (ux * len * i) / n,
        pz = az + (uz * len * i) / n;
      b.cyl("limestone", px, y + 0.16, pz, 0.1, 0.07, h - 0.32, 6, {
        tint: t,
        top: false,
      });
    }
  }

