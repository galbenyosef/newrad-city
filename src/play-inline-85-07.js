// play-inline-85 07 — lot
// Lines 1464-1760 of readable/play-inline-85.pretty.js (statement-aligned).
  function crown(x0, z0, x1, z1, y, r, trimMat, fmat, tint, H) {
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const w = x1 - x0,
      d = z1 - z0;
    const k = r();
    lastCrown = null;
    roof(x0, z0, x1, z1, y, { parapet: 1.2, trim: trimMat });
    if (k < 0.34) {
      // stepped ziggurat with a spire
      let ix0 = x0,
        ix1 = x1,
        iz0 = z0,
        iz1 = z1,
        yy = y;
      const bs = M.buf(trimMat, cx, cz);
      for (let i = 0; i < 3; i++) {
        const s = Math.min(w, d) * 0.12;
        ix0 += s;
        ix1 -= s;
        iz0 += s;
        iz1 -= s;
        if (ix1 - ix0 < 2) break;
        const hh = r.range(2.5, 4.5);
        M.box(bs, ix0, yy, iz0, ix1, yy + hh, iz1, {
          s: 2,
          c: M.mulc(TRIM_C, 0.95 - i * 0.05),
        });
        // vertical deco fins
        const fb = M.buf("chrome", cx, cz, "detail");
        for (const t of [0.25, 0.5, 0.75]) {
          M.box(
            fb,
            ix0 + (ix1 - ix0) * t - 0.1,
            yy,
            iz0 - 0.15,
            ix0 + (ix1 - ix0) * t + 0.1,
            yy + hh + 0.6,
            iz0,
            { s: 1 },
          );
          M.box(
            fb,
            ix0 + (ix1 - ix0) * t - 0.1,
            yy,
            iz1,
            ix0 + (ix1 - ix0) * t + 0.1,
            yy + hh + 0.6,
            iz1 + 0.15,
            { s: 1 },
          );
        }
        yy += hh;
      }
      const sp = M.buf("chrome", cx, cz);
      const sh = Math.min(28, H * r.range(0.1, 0.2));
      lastCrown = {
        kind: "spire",
        x: cx,
        z: cz,
        y: yy,
        h: sh,
        r: 0.9,
        base: [ix0, iz0, ix1, iz1],
        by: y,
      };
      M.cyl(sp, cx, yy, cz, 0.9, 0.05, sh, 8, { c: [0.8, 0.8, 0.78] });
      M.cyl(sp, cx, yy, cz, 1.4, 1.2, 1.2, 8, {
        c: [0.7, 0.7, 0.7],
        capTop: true,
      });
    } else if (k < 0.55) {
      // copper pyramid roof
      const bp = M.buf("metal_painted", cx, cz);
      const ph = Math.min(w, d) * r.range(0.35, 0.6);
      const c = [0.5, 0.78, 0.66];
      lastCrown = {
        kind: "pyramid",
        x: cx,
        z: cz,
        y: y + 1.2,
        h: ph,
        base: [x0, z0, x1, z1],
      };
      M.tri(
        bp,
        [x0, y + 1.2, z0],
        [x1, y + 1.2, z0],
        [cx, y + 1.2 + ph, cz],
        [0, 0.6, -0.8],
        [0, 0, 1, 0, 0.5, 1],
        c,
      );
      M.tri(
        bp,
        [x1, y + 1.2, z0],
        [x1, y + 1.2, z1],
        [cx, y + 1.2 + ph, cz],
        [0.8, 0.6, 0],
        [0, 0, 1, 0, 0.5, 1],
        M.mulc(c, 0.9),
      );
      M.tri(
        bp,
        [x1, y + 1.2, z1],
        [x0, y + 1.2, z1],
        [cx, y + 1.2 + ph, cz],
        [0, 0.6, 0.8],
        [0, 0, 1, 0, 0.5, 1],
        c,
      );
      M.tri(
        bp,
        [x0, y + 1.2, z1],
        [x0, y + 1.2, z0],
        [cx, y + 1.2 + ph, cz],
        [-0.8, 0.6, 0],
        [0, 0, 1, 0, 0.5, 1],
        M.mulc(c, 0.85),
      );
      M.cyl(M.buf("chrome", cx, cz), cx, y + 1.2 + ph, cz, 0.2, 0.05, 6, 6, {
        c: [0.6, 0.6, 0.6],
      });
    } else if (k < 0.75) {
      // mechanical penthouse + antenna mast (radio tower look)
      const bs = M.buf("concrete_dark", cx, cz);
      M.box(
        bs,
        cx - w * 0.3,
        y,
        cz - d * 0.3,
        cx + w * 0.3,
        y + 5,
        cz + d * 0.3,
        { s: 3, c: [0.7, 0.68, 0.65] },
      );
      const bm = M.buf("rust", cx, cz);
      const mh = r.range(12, 30);
      lastCrown = { kind: "mast", x: cx, z: cz, y: y + 5, h: mh, r: 0.8 };
      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ])
        M.beam(
          bm,
          cx + sx * 1.6,
          y + 5,
          cz + sz * 1.6,
          cx + sx * 0.25,
          y + 5 + mh,
          cz + sz * 0.25,
          0.18,
          0.18,
          { c: [0.8, 0.45, 0.35] },
        );
      for (let hh = 3; hh < mh; hh += 3.5) {
        const s = 1.6 * (1 - hh / mh) + 0.25;
        M.box(
          bm,
          cx - s,
          y + 5 + hh,
          cz - s,
          cx + s,
          y + 5 + hh + 0.15,
          cz + s,
          { s: 1, c: [0.8, 0.45, 0.35] },
        );
      }
      // aircraft warning light (red lamp)
      M.cyl(
        M.buf("neon_red@lampr", cx, cz, "main"),
        cx,
        y + 5 + mh,
        cz,
        0.3,
        0.3,
        0.5,
        6,
        { capTop: true },
      );
    } else {
      // enclosed water tank / penthouse with deco lantern
      const bs = M.buf(fmat, cx, cz);
      const pw = Math.min(w, d) * 0.45;
      facadeWalls(
        cx - pw / 2,
        cz - pw / 2,
        cx + pw / 2,
        cz + pw / 2,
        y,
        y + 8,
        fmat,
        M.mulc(tint, 0.95),
        { vBase: 0 },
      );
      roof(cx - pw / 2, cz - pw / 2, cx + pw / 2, cz + pw / 2, y + 8, {
        parapet: 0.8,
      });
      void bs;
      if (r() < 0.6) M.waterTower(cx, y + 8.8, cz, 0.9, r() < 0.2);
    }
  }

  /** Commercial / office block (midtown south etc.) */
  function buildCommercial(lot, r) {
    let x0 = lot.x0 + (lot.front.w ? 0 : 0.15),
      x1 = lot.x1 - (lot.front.e ? 0 : 0.15),
      z0 = lot.z0 + (lot.front.n ? 0 : 0.15),
      z1 = lot.z1 - (lot.front.s ? 0 : 0.15);
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const dist = lot.district;
    let H = heightFor(lot, r);
    if (dist === "midtown" || dist === "financial_district")
      H = Math.min(H, 70);
    if (dist === "greenwich_village") H = Math.min(H * 1.4, 32);
    const style = r() < 0.55 ? "office" : "apartment";
    const fmat =
      "facade/" + style + "/" + chunkVariant(style, cx, cz, r() < 0.5);
    const tint = r.pick(TINTS[style]);
    const gf = 5;
    const face = partyFaces(lot);
    const ruined = r() < 0.27;
    if (ruined) lot.ruined = true;
    storefrontBand(lot, x0, z0, x1, z1, gf, { style: "shop", r, ruined });
    const setback = H > 45 && r() < 0.45;
    const h1 = setback ? H * r.range(0.6, 0.75) : H;
    if (ruined) {
      const keep = h1 * r.range(0.45, 0.8);
      facadeWalls(x0, z0, x1, z1, gf, keep, fmat, tint, { vBase: gf, face });
      jaggedTop(x0, z0, x1, z1, keep, h1, fmat, tint, r, { vBase: gf });
      M.box3(x0, 0, z0, x1, h1 * 0.85, z1, { tag: "building" });
      M.rubblePile(
        cx + r.range(-4, 4),
        lot.front.n ? z0 - 3 : z1 + 3,
        r.range(3, 6),
        r.range(1, 2.2),
        r,
      );
      return { h: h1 };
    }
    if (h1 > 22 && r() < 0.12) {
      const by0 = r.range(10, h1 - 10);
      facadeWalls(x0, z0, x1, z1, gf, by0, fmat, tint, { vBase: gf, face });
      blownBand(x0, z0, x1, z1, by0, by0 + 3.6);
      facadeWalls(x0, z0, x1, z1, by0 + 3.95, h1, fmat, tint, {
        vBase: gf,
        face,
      });
    } else facadeWalls(x0, z0, x1, z1, gf, h1, fmat, tint, { vBase: gf, face });
    belt(x0, z0, x1, z1, gf - 0.3, 0.2, 0.45, "stone_limestone");
    cornice(x0, z0, x1, z1, h1 - 1.2, 0.9, 1.3, "stone_limestone", TRIM_C, {
      brackets: h1 < 40,
      sides: frontSides(lot),
    });
    let topY = h1;
    let tb = [x0, z0, x1, z1];
    if (setback) {
      const s = r.range(3, 5);
      const nx0 = x0 + s,
        nx1 = x1 - s,
        nz0 = z0 + s,
        nz1 = z1 - s;
      if (nx1 - nx0 > 8 && nz1 - nz0 > 8) {
        roof(x0, z0, x1, z1, h1 + 0.1, { parapet: 0.9 });
        facadeWalls(nx0, nz0, nx1, nz1, h1, H, fmat, tint, { vBase: gf });
        cornice(nx0, nz0, nx1, nz1, H - 0.8, 0.6, 0.9);
        M.box3(nx0, h1, nz0, nx1, H, nz1, { tag: "building" });
        topY = H;
        tb = [nx0, nz0, nx1, nz1];
      }
    }
    roof(tb[0], tb[1], tb[2], tb[3], topY + 0.1, { parapet: 0.8 });
    rooftop(tb[0], tb[1], tb[2], tb[3], topY + 0.1, r, {
      tower: topY < 75 ? 0.65 : 0.25,
    });
    if (topY < 55 && r() < 0.45)
      fireEscapesFor(lot, x0, z0, x1, z1, gf + 0.5, h1 - 1.5, 3.6, r);
    if (r() < 0.5)
      randomHoles(
        x0,
        z0,
        x1,
        z1,
        6.5,
        Math.max(10, h1 - 4),
        r.int(1, 2),
        r,
        face,
      );
    M.box3(x0, 0, z0, x1, h1, z1, { tag: "building" });
    return { h: topY };
  }

  /** Old-world apartment house (UWS/UES & scattered). */
