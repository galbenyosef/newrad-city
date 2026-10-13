// play-inline-85 08 — baseh
// Lines 1761-1911 of readable/play-inline-85.pretty.js (statement-aligned).
  function buildApartment(lot, r) {
    let x0 = lot.x0 + (lot.front.w ? 0 : 0.15),
      x1 = lot.x1 - (lot.front.e ? 0 : 0.15),
      z0 = lot.z0 + (lot.front.n ? 0 : 0.15),
      z1 = lot.z1 - (lot.front.s ? 0 : 0.15);
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    let H = heightFor(lot, r);
    if (lot.district === "greenwich_village") H = Math.min(34, H * 1.6);
    if (lot.courtyard) H = Math.max(H, 30);
    const fmat =
      "facade/apartment/" + chunkVariant("apartment", cx, cz, r() < 0.5);
    const tint = r.pick(TINTS.apartment);
    const baseH = 7.2;
    const face = partyFaces(lot);
    const ruined = r() < 0.24;
    if (ruined) lot.ruined = true;
    // rusticated limestone base (2 floors)
    const bb = M.buf("stone_limestone", cx, cz);
    const baseC = M.mulc([0.92, 0.9, 0.84], 0.9 + r() * 0.1);
    const frP = frontSides(lot);
    const entK = frP.n ? "n" : frP.s ? "s" : frP.w ? "w" : frP.e ? "e" : null; // entranceCanopy's side (door at its centre)
    for (const [k, ax, az, bx, bz] of [
      ["n", x0, z0, x1, z0],
      ["e", x1, z0, x1, z1],
      ["s", x1, z1, x0, z1],
      ["w", x0, z1, x0, z0],
    ]) {
      if (face[k] === "x") continue;
      const len = Math.hypot(bx - ax, bz - az);
      if (k === entK && len > 7.5) {
        // the base wall opens round the entrance (the lobby behind it: entranceCanopy → lobbyEntrance)
        const ux = (bx - ax) / len,
          uz = (bz - az) / len,
          t0 = len / 2 - DOOR_HW,
          t1 = len / 2 + DOOR_HW;
        const A = [ax + ux * t0, az + uz * t0],
          B = [ax + ux * t1, az + uz * t1];
        M.wall(
          bb,
          ax,
          az,
          A[0],
          A[1],
          0,
          baseH,
          0,
          t0 / 3,
          0,
          baseH / 3,
          M.mulc(baseC, 0.7),
          baseC,
        );
        M.wall(
          bb,
          B[0],
          B[1],
          bx,
          bz,
          0,
          baseH,
          t1 / 3,
          len / 3,
          0,
          baseH / 3,
          M.mulc(baseC, 0.7),
          baseC,
        );
        M.wall(
          bb,
          A[0],
          A[1],
          B[0],
          B[1],
          DOOR_H,
          baseH,
          t0 / 3,
          t1 / 3,
          DOOR_H / 3,
          baseH / 3,
          M.mulc(baseC, 0.8),
          baseC,
        );
      } else
        M.wall(
          bb,
          ax,
          az,
          bx,
          bz,
          0,
          baseH,
          0,
          len / 3,
          0,
          baseH / 3,
          M.mulc(baseC, 0.7),
          baseC,
        );
      M.logWall(ax, az, bx, bz, 0, baseH, face[k], false);
      if (frP[k])
        M.graffitiWalls.push({
          ax,
          az,
          bx,
          bz,
          nx: k === "e" ? 1 : k === "w" ? -1 : 0,
          nz: k === "s" ? 1 : k === "n" ? -1 : 0,
          y0: 0.6,
          y1: 3.2,
        });
    }
    // windows in the base (dark recesses) + entrance on the main front
    baseWindows(lot, x0, z0, x1, z1, 1.2, baseH - 0.6, r);
    entranceCanopy(lot, x0, z0, x1, z1, r);
    belt(x0, z0, x1, z1, baseH, 0.3, 0.5, "stone_limestone");
    if (ruined) {
      const keep = baseH + (H - baseH) * r.range(0.35, 0.7);
      facadeWalls(x0, z0, x1, z1, baseH, keep, fmat, tint, {
        vBase: baseH,
        face,
      });
      jaggedTop(x0, z0, x1, z1, keep, H, fmat, tint, r, { vBase: baseH });
      M.box3(x0, 0, z0, x1, H * 0.8, z1, { tag: "building" });
      M.rubblePile(
        cx + r.range(-5, 5),
        lot.front.n ? z0 - 3.5 : z1 + 3.5,
        r.range(3, 7),
        r.range(1, 2.5),
        r,
      );
      return { h: H };
    }
    facadeWalls(x0, z0, x1, z1, baseH, H, fmat, tint, { vBase: baseH, face });
    // ornamental top: belt two floors below the cornice
    belt(x0, z0, x1, z1, H - 7.5, 0.2, 0.4, "stone_limestone");
    cornice(x0, z0, x1, z1, H - 1.4, 1.2, 1.6, "stone_limestone", TRIM_C, {
      brackets: true,
      sides: frontSides(lot),
    });
    roof(x0, z0, x1, z1, H + 0.2, { parapet: 0.7 });
    rooftop(x0, z0, x1, z1, H + 0.2, r, { tower: 0.8 });
    if (r() < 0.55)
      fireEscapesFor(lot, x0, z0, x1, z1, baseH + 0.5, H - 2, 3.5, r);
    if (r() < 0.42)
      randomHoles(x0, z0, x1, z1, 8.5, H - 4, r.int(1, 2), r, face);
    M.box3(x0, 0, z0, x1, H, z1, { tag: "building" });
    return { h: H };
  }

  /** Brownstone / rowhouse with stoop. */
