// play-inline-85 06 — tx0
// Lines 1245-1463 of readable/play-inline-85.pretty.js (statement-aligned).
  function buildTower(lot, r) {
    const pad = {
      x0: lot.front.w ? 0 : 0.2,
      x1: lot.front.e ? 0 : 0.2,
      z0: lot.front.n ? 0 : 0.2,
      z1: lot.front.s ? 0 : 0.2,
    };
    let x0 = lot.x0 + pad.x0,
      x1 = lot.x1 - pad.x1,
      z0 = lot.z0 + pad.z0,
      z1 = lot.z1 - pad.z1;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const H = Math.max(40, heightFor(lot, r));
    const style = r() < 0.72 ? "artdeco" : "office";
    const fmat =
      "facade/" + style + "/" + chunkVariant(style, cx, cz, r() < 0.5);
    const tint = r.pick(TINTS[style]);
    const trimMat = r() < 0.7 ? "stone_limestone" : "granite";
    const gf = 6;
    const ruined = r() < 0.34,
      leaning = !ruined && H < 110 && r() < 0.06;
    const colliders = [];
    if (leaning) {
      const ang = r.range(0.035, 0.075) * (r() < 0.5 ? 1 : -1);
      const axisZ = r() < 0.5;
      // rotate around the footprint edge at ground level
      const px = axisZ ? (ang > 0 ? x0 : x1) : cx,
        pz = axisZ ? cz : ang > 0 ? z1 : z0;
      const m = new THREE.Matrix4()
        .makeTranslation(px, 0, pz)
        .multiply(
          new THREE.Matrix4().makeRotationFromEuler(
            new THREE.Euler(axisZ ? 0 : ang, 0, axisZ ? ang : 0),
          ),
        )
        .multiply(new THREE.Matrix4().makeTranslation(-px, 0, -pz));
      M.pushXF(m);
    }
    if (ruined) lot.ruined = true;
    // ---- base podium ----
    const baseH = Math.min(H * 0.35, r.range(14, 26));
    storefrontBand(lot, x0, z0, x1, z1, gf, {
      style: "deco",
      r,
      trim: trimMat,
      ruined,
    });
    facadeWalls(x0, z0, x1, z1, gf, baseH, fmat, tint, { vBase: gf });
    belt(x0, z0, x1, z1, gf - 0.4, 0.25, 0.6, trimMat);
    piers(x0, z0, x1, z1, 0, baseH, 1.2, 0.2, trimMat);
    colliders.push([x0, z0, x1, z1, 0, baseH]);
    // ---- tiers ----
    let tx0 = x0,
      tx1 = x1,
      tz0 = z0,
      tz1 = z1,
      y = baseH;
    const nTiers = H > 90 ? r.int(2, 4) : H > 55 ? r.int(1, 3) : 1;
    let remaining = H - baseH;
    const tierTops = [];
    for (let t = 0; t < nTiers; t++) {
      // parapet/setback terrace at this level
      const inset = r.range(1.8, 4.5);
      const nx0 = tx0 + inset,
        nx1 = tx1 - inset,
        nz0 = tz0 + inset,
        nz1 = tz1 - inset;
      if (nx1 - nx0 < 9 || nz1 - nz0 < 9) break;
      roof(tx0, tz0, tx1, tz1, y, { parapet: 1.1, trim: trimMat });
      if (r() < 0.5) roofClutter(tx0, tz0, tx1, tz1, y, nx0, nz0, nx1, nz1, r);
      tx0 = nx0;
      tx1 = nx1;
      tz0 = nz0;
      tz1 = nz1;
      const th = t === nTiers - 1 ? remaining : remaining * r.range(0.45, 0.65);
      const isTop = t === nTiers - 1;
      if (isTop && ruined) {
        const keep = th * r.range(0.3, 0.7);
        facadeWalls(tx0, tz0, tx1, tz1, y, y + keep, fmat, tint, { vBase: gf });
        jaggedTop(tx0, tz0, tx1, tz1, y + keep, y + th, fmat, tint, r, {
          vBase: gf,
        });
        colliders.push([tx0, tz0, tx1, tz1, y, y + th * 0.8]);
        y += th;
        remaining -= th;
        tierTops.push(y);
        break;
      }
      // chamfered-corner shaft (art-deco slab towers) on some upper tiers
      const chamfer =
        style === "artdeco" &&
        t > 0 &&
        isTop &&
        Math.min(tx1 - tx0, tz1 - tz0) > 14 &&
        r() < 0.45;
      if (chamfer) {
        const c = Math.min(tx1 - tx0, tz1 - tz0) * 0.16;
        chamferShaft(tx0, tz0, tx1, tz1, c, y, y + th, fmat, tint, gf, trimMat);
        colliders.push([tx0, tz0, tx1, tz1, y, y + th]);
        y += th;
        remaining -= th;
        tierTops.push(y);
        tx0 += c * 0.5;
        tx1 -= c * 0.5;
        tz0 += c * 0.5;
        tz1 -= c * 0.5; // crown sits on the inscribed square
        continue;
      }
      // blown-out band?
      if (th > 20 && r() < 0.18) {
        const by0 = y + r.range(4, th - 12),
          by1 = by0 + 7;
        facadeWalls(tx0, tz0, tx1, tz1, y, by0, fmat, tint, { vBase: gf });
        blownBand(tx0, tz0, tx1, tz1, by0, by1);
        facadeWalls(tx0, tz0, tx1, tz1, by1 + 0.35, y + th, fmat, tint, {
          vBase: gf,
        });
      } else
        facadeWalls(tx0, tz0, tx1, tz1, y, y + th, fmat, tint, { vBase: gf });
      piers(tx0, tz0, tx1, tz1, y, y + th, 0.9, 0.15, trimMat);
      colliders.push([tx0, tz0, tx1, tz1, y, y + th]);
      y += th;
      remaining -= th;
      tierTops.push(y);
    }
    if (tierTops.length === 0) {
      // no room for setbacks: straight shaft
      const th = H - baseH;
      if (ruined) {
        facadeWalls(x0, z0, x1, z1, baseH, baseH + th * 0.5, fmat, tint, {
          vBase: gf,
        });
        jaggedTop(x0, z0, x1, z1, baseH + th * 0.5, H, fmat, tint, r, {
          vBase: gf,
        });
      } else facadeWalls(x0, z0, x1, z1, baseH, H, fmat, tint, { vBase: gf });
      colliders.push([x0, z0, x1, z1, baseH, H]);
      y = H;
    }
    // ---- crown ----
    if (!ruined) {
      crown(tx0, tz0, tx1, tz1, y, r, trimMat, fmat, tint, H);
      lot.crown = lastCrown;
    }
    if (r() < 0.55)
      randomHoles(
        x0,
        z0,
        x1,
        z1,
        8,
        Math.min(H - 5, 45),
        r.int(1, 3) + (ruined ? 1 : 0),
        r,
      );
    if (leaning) M.popXF();
    for (const c of colliders)
      M.box3(c[0], c[4], c[1], c[2], c[5], c[3], { tag: "building" });
    return { h: y, top: [tx0, tz0, tx1, tz1] };
  }

  /** Octagonal (chamfered-corner) shaft with façade walls, corner piers and a roof slab. */
  function chamferShaft(x0, z0, x1, z1, c, y0, y1, fmat, tint, vBase, trimMat) {
    const pts = [
      [x0 + c, z0],
      [x1 - c, z0],
      [x1, z0 + c],
      [x1, z1 - c],
      [x1 - c, z1],
      [x0 + c, z1],
      [x0, z1 - c],
      [x0, z0 + c],
    ];
    const tile = TILE();
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const bf = M.buf(fmat, cx, cz);
    const lowC = M.mulc(tint, 0.8),
      topC = M.mulc(tint, 0.92);
    let run = 0;
    for (let i = 0; i < 8; i++) {
      const a = pts[i],
        b = pts[(i + 1) % 8];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      M.wall(
        bf,
        a[0],
        a[1],
        b[0],
        b[1],
        y0,
        y1,
        run / tile.w,
        (run + l) / tile.w,
        (y0 - vBase) / tile.h,
        (y1 - vBase) / tile.h,
        lowC,
        topC,
      );
      run += Math.round(l / M.FACADE.bayW) * M.FACADE.bayW;
      // limestone pier on every corner
      const pb = M.buf(trimMat, cx, cz);
      M.box(pb, a[0] - 0.4, y0, a[1] - 0.4, a[0] + 0.4, y1 + 0.6, a[1] + 0.4, {
        s: 2,
        c: TRIM_C,
        skip: 8,
      });
    }
    M.poly(M.buf("roof_tar", cx, cz), pts, y1, {
      s: 4,
      c: [0.8, 0.78, 0.75],
      convex: true,
    });
    M.polySides(M.buf(trimMat, cx, cz), pts, y1, y1 + 1.0, { s: 2, c: TRIM_C });
  }
  M.chamferShaft = chamferShaft;
  let lastCrown = null; // silhouette info for the far impostor
  /** Tower crowns: ziggurat + spire, pyramid, mast, penthouse + water tank. */
