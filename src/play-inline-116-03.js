// play-inline-116 03 — math
// Lines 300-3023 of readable/play-inline-116.pretty.js (statement-aligned).
  function build(rec) {
    const L = G.LAYOUT;
    K.shopfronts();
    const b = K.builder("ts_shell", { grime: 0.5 });
    const d = K.builder("ts_detail", { grime: 0.55 });
    const ads = K.builder("ts_ads", { grime: 0 });
    const glows = K.glowSet("ts");
    const flick = K.glowSet("ts_flicker");
    const P = K.parts;
    // Neon spill on the ground + wet-asphalt reflections: every glow placed below 26 m also throws a coloured
    // pool of light onto the plaza (bulbs thinned out) and — for lamps / neon / boards — a view-dependent
    // reflection streak. One draw call each (see K.spillSet / K.reflSet).
    const spill = K.spillSet("ts"),
      refl = K.reflSet("ts");
    const GY = 0.16; // just above the map's sidewalks (0.12)
    const SPILL = {
      s: [1.3, 0.07],
      m: [2.6, 0.2],
      l: [4.2, 0.24],
      xl: [6.5, 0.28],
    };
    let bulbN = 0;
    const throwLight = (x, y, z, col, cls) => {
      cls = cls || "m";
      if (y > 26 || y < 0.2) return;
      if (cls === "s" && bulbN++ % 3) return;
      if (cls === "m" && y > 7 && (bulbN++ % 2 || y > 13)) return; // board floodlights: low rows only, every other one
      const sp = SPILL[cls] || SPILL.m,
        fall = 1 / (1 + Math.max(0, y - 3) / 7);
      const rds = Math.min(7, sp[0] + y * 0.3);
      spill.add(x, z, col, rds, {
        y: GY,
        i: sp[1] * fall * (cls === "s" ? 1.6 : 1),
      });
      if (cls !== "s")
        refl.add(x, z, y, col, cls === "m" ? 0.6 : cls === "l" ? 1.2 : 2.0, {
          y: GY + 0.01,
          i: 0.32 * fall + 0.08,
        });
    };
    for (const gs of [glows, flick]) {
      const add0 = gs.add;
      gs.add = function (x, y, z, col, cls) {
        add0.call(gs, x, y, z, col, cls);
        throwLight(x, y, z, col, cls);
        return gs;
      };
    }
    rec.brandsUsed = new Set();

    // ================= THE BOW-TIE (round 1 layout refit) =================
    // Broadway crosses Seventh Avenue at (-40,-262). The carriageways (LAYOUT.isRoad(x,z,true)) stay OPEN ROAD:
    // nothing above kerb height and no colliders on them below 5 m (overhead gantries / signs are fine).
    // The buildings are pulled back from the corridors so the bow-tie opens into real pedestrian plazas
    // (the way the square reads in NYC), and The Neon lives on those plazas, on Duffy Square (north island)
    // and around One Times Square, which now stands on the south island at the apex of the bow-tie.
    //   NW  A1: Broadway face set back ~6 m       NE  B1: 7th Ave face set back 10 m (Rad Room + catwalk)
    //   W   A2: 7th Ave face set back 14 m (market) E   B2: Broadway face set back 9 m (clinic row)
    //   SW  A3: 7th Ave face set back 8 m          SE  B3: Broadway face set back ~5 m
    const lots = {
      A1: [
        [-94, -312],
        [-77.9, -312],
        [-64.6, -282],
        [-94, -282],
      ],
      B1: [
        [-20, -312],
        [15, -312],
        [15, -282],
        [-20, -282],
      ],
      A2: [
        [-94, -268],
        [-64, -268],
        [-64, -237],
        [-94, -237],
      ],
      B2: [
        [-24.1, -268],
        [15, -268],
        [15, -237],
        [-11.0, -237],
      ],
      A3: [
        [-94, -223],
        [-58, -223],
        [-58, -212.5],
        [-94, -212.5],
      ],
      B3: [
        [-9.5, -223],
        [15, -223],
        [15, -212.5],
        [-5.0, -212.5],
      ],
    };
    const buildings = [];
    const RR = { x0: -20, x1: -4, z0: -312, z1: -282, door: -293.5, GF: 5.2 }; // Rad Room (B1 west, ground floor)
    const split = (poly, cuts, heights, fac) => {
      let rest = poly;
      const parts = [];
      for (const c of cuts) {
        parts.push(clipX(rest, c, true));
        rest = clipX(rest, c, false);
      }
      parts.push(rest);
      parts.forEach((p, i) => {
        if (p.length >= 3)
          buildings.push({
            poly: p,
            h: heights[i],
            fac: fac[i % fac.length],
            cuts,
          });
      });
    };
    split(lots.A1, [-80], [34, 46], ["fac_ts_b", "fac_ts_a"]);
    split(lots.B1, [-4, 6], [56, 40, 48], ["fac_ts_c", "fac_ts_d", "fac_ts_b"]);
    split(lots.A2, [-79], [30, 42], ["fac_ts_d", "fac_ts_a"]);
    split(lots.B2, [0], [52, 36], ["fac_ts_b", "fac_ts_c"]);
    split(lots.A3, [-74], [24, 34], ["fac_ts_c", "fac_ts_a"]);
    split(lots.B3, [4], [38, 22], ["fac_ts_d", "fac_ts_b"]);
    // The Neon plan (41_neon_town.js): the A2 west building becomes the freight depot yard, and the façade bays of the
    // enterable places stay free of shopfront panels / awnings (their entrances are built there instead).
    const TOWN = typeof K.neonTown === "function";
    if (TOWN && K.neonIsYard) {
      const yi = buildings.findIndex((bd) => {
        const xs = bd.poly.map((p) => p[0]),
          zs = bd.poly.map((p) => p[1]);
        return K.neonIsYard(
          Math.min(...xs),
          Math.min(...zs),
          Math.max(...xs),
          Math.max(...zs),
        );
      });
      if (yi >= 0) buildings.splice(yi, 1);
    }
    const RES = TOWN ? K.neonReserve || [] : [];
    const reserved = (x, z) =>
      RES.some((r) => Math.hypot(x - r.x, z - r.z) < r.r);

    // brand queue: every brand at least once
    const brands = L.BRANDS.slice();
    let bi = 0;
    const nextBrand = () => {
      const br = brands[bi % brands.length];
      const v = Math.floor(bi / brands.length);
      bi++;
      return [br, v % 3];
    };

    const boardColors = [
      0xff3040, 0x40a0ff, 0x60ff80, 0xffd040, 0xff60d0, 0xffffff,
    ];
    let boardN = 0,
      screenN = 0,
      bladeN = 0;
    /** Billboard on a wall edge. (ax,az)->(bx,bz) edge, outward normal n; centre t along edge, width w, bottom y. */
    const billboard = (ax, az, bx, bz, nx, nz, t, w, y, kind) => {
      const ux = bx - ax,
        uz = bz - az,
        Lg = Math.hypot(ux, uz),
        dx = ux / Lg,
        dz = uz / Lg;
      const cx = ax + dx * t + nx * 0.55,
        cz = az + dz * t + nz * 0.55,
        h = w / 2;
      const face = Math.atan2(nx, nz);
      // steel frame + walkway + lamp arms
      d.box(
        "black_metal",
        cx - nx * 0.25,
        y - 0.15,
        cz - nz * 0.25,
        w + 0.4,
        h + 0.3,
        0.3,
        { yaw: face, grime: 0.4 },
      );
      d.box(
        "metal_dark",
        cx + nx * 0.3,
        y - 0.35,
        cz + nz * 0.3,
        w + 0.3,
        0.08,
        0.9,
        { yaw: face, grime: 0.5 },
      );
      for (let k = 0; k < 3; k++) {
        const lt = (k - 1) * w * 0.36;
        const lx = cx + dx * lt,
          lz = cz + dz * lt;
        d.beam(
          "black_metal",
          lx + nx * 0.2,
          y - 0.3,
          lz + nz * 0.2,
          lx + nx * 1.4,
          y - 0.1,
          lz + nz * 1.4,
          0.06,
        );
        d.box("metal", lx + nx * 1.45, y - 0.2, lz + nz * 1.45, 0.4, 0.2, 0.3, {
          yaw: face,
        });
        if ((boardN + k) % 4 !== 0)
          glows.add(lx + nx * 1.4, y - 0.05, lz + nz * 1.4, 0xfff0d0, "m");
      }
      let decay = null;
      if (kind === "screen") {
        ads.panel("ts_screen", cx, y + h / 2, cz, w, h, face, {
          rect: [0, 0, 1, 1],
        });
        screenN++;
        // the screen's light: a wash along its lower edge (no hovering 'xl' orb in front of it)
        for (const s2 of [-0.3, 0.3])
          glows.add(
            cx + dx * w * s2 + nx * 0.5,
            y + 0.4,
            cz + dz * w * s2 + nz * 0.5,
            0x9ac0ff,
            "m",
          );
      } else {
        // 22 years on: a third of the boards are torn, one in ten stripped to the backing (41_neon_town.js: K.tsBoardDecay)
        decay = K.tsBoardDecay ? K.tsBoardDecay(cx, y, cz) : null;
        if (decay !== "bare") {
          const [br, v] = nextBrand();
          ads.panel("atlas_ads", cx, y + h / 2, cz, w, h, face, {
            rect: K.ad(br, v),
          });
          rec.brandsUsed.add(br);
        }
      }
      if (K.tsBoardDress)
        K.tsBoardDress(d, cx, y, cz, w, h, face, decay, { wallOff: 0.55 });
      // neon frame on some boards
      if ((boardN % 3 === 0 && decay !== "bare") || kind === "screen") {
        const col = boardColors[boardN % boardColors.length];
        const fx = cx + nx * 0.06,
          fz = cz + nz * 0.06;
        for (const e of [
          [-w / 2, 0, w / 2, 0],
          [-w / 2, h, w / 2, h],
          [-w / 2, 0, -w / 2, h],
          [w / 2, 0, w / 2, h],
        ]) {
          d.beam(
            "neon_tube",
            fx + dx * e[0],
            y + e[1],
            fz + dz * e[0],
            fx + dx * e[2],
            y + e[3],
            fz + dz * e[2],
            0.12,
            { tint: col, grime: 0 },
          );
        }
        flick.add(cx + nx * 0.8, y + h / 2, cz + nz * 0.8, col, "l");
      }
      boardN++;
    };

    // orientation-robust outward normal of polygon edge i
    function outward(poly, i) {
      const a = poly[i],
        c = poly[(i + 1) % poly.length];
      const Lg = Math.hypot(c[0] - a[0], c[1] - a[1]);
      let nx = (c[1] - a[1]) / Lg,
        nz = -(c[0] - a[0]) / Lg;
      const cen = poly.reduce(
        (s, p) => [s[0] + p[0] / poly.length, s[1] + p[1] / poly.length],
        [0, 0],
      );
      const mx = (a[0] + c[0]) / 2,
        mz = (a[1] + c[1]) / 2;
      if ((mx - cen[0]) * nx + (mz - cen[1]) * nz < 0) {
        nx = -nx;
        nz = -nz;
      }
      return [nx, nz, Lg];
    }
    const grow = (poly, g) => {
      const cen = poly.reduce(
        (s, p) => [s[0] + p[0] / poly.length, s[1] + p[1] / poly.length],
        [0, 0],
      );
      return poly.map((p) => {
        const vx = p[0] - cen[0],
          vz = p[1] - cen[1],
          l = Math.hypot(vx, vz) || 1;
        return [p[0] + (vx / l) * g, p[1] + (vz / l) * g];
      });
    };
    const isSiteXEdge = (a, c) =>
      Math.abs(a[0] - c[0]) < 0.01 &&
      (Math.abs(a[0] + 94) < 0.5 || Math.abs(a[0] - 15) < 0.5);

    // ---- construct buildings ----
    for (const bd of buildings) {
      const poly = bd.poly;
      const xs = poly.map((p) => p[0]),
        zs = poly.map((p) => p[1]);
      const bx0 = Math.min(...xs),
        bx1 = Math.max(...xs),
        bz0 = Math.min(...zs),
        bz1 = Math.max(...zs);
      // the Rad Room: B1's west building keeps a walk-in ground floor (door on the NE plaza)
      const hollow =
        Math.abs(bx0 - RR.x0) < 0.01 &&
        Math.abs(bx1 - RR.x1) < 0.01 &&
        Math.abs(bz0 - RR.z0) < 0.01;
      bd.hollow = hollow;
      b.prism(bd.fac, poly, hollow ? RR.GF : 0, bd.h, { grime: 0.5 });
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i],
          c = poly[(i + 1) % poly.length];
        const doorEdge =
          hollow &&
          Math.abs(a[0] - RR.x0) < 0.01 &&
          Math.abs(c[0] - RR.x0) < 0.01;
        const ops = (
          doorEdge ? [{ at: Math.abs(RR.door - a[1]), w: 2.4, h: 3.1 }] : []
        ).concat(TOWN && K.neonWallOps ? K.neonWallOps(a, c) : []);
        K.colWall(a[0], a[1], c[0], c[1], 1.2, 0, bd.h, ops);
        if (hollow) {
          const [nx, nz] = outward(poly, i);
          b.wall(
            "limestone_dark",
            a[0] - nx * 0.25,
            a[1] - nz * 0.25,
            c[0] - nx * 0.25,
            c[1] - nz * 0.25,
            0,
            RR.GF,
            0.5,
            ops,
            { collide: false, grime: 0.6 },
          );
        }
      }
      const rect =
        poly.length === 4 &&
        poly.every(
          (p) =>
            (Math.abs(p[0] - bx0) < 0.01 || Math.abs(p[0] - bx1) < 0.01) &&
            (Math.abs(p[1] - bz0) < 0.01 || Math.abs(p[1] - bz1) < 0.01),
        );
      if (rect)
        K.colBox(
          bx0 + 1,
          hollow ? RR.GF - 0.2 : 0,
          bz0 + 1,
          bx1 - 1,
          bd.h,
          bz1 - 1,
        );
      // cornice + storefront cornice
      b.prism("limestone_dark", grow(poly, 0.5), bd.h - 1.2, bd.h - 0.4, {
        grime: 0.6,
      });
      b.prism("limestone_dark", grow(poly, 0.25), 5.2, 5.8, { grime: 0.6 });
      // storefront band: Neon-run shopfronts — boarded, smashed, shuttered, and a few lit ones spilling onto the plaza
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i],
          c = poly[(i + 1) % poly.length];
        const on = outward(poly, i),
          Lg = on[2];
        if (Lg < 4) continue;
        const dx = (c[0] - a[0]) / Lg,
          dz = (c[1] - a[1]) / Lg,
          nx = on[0],
          nz = on[1];
        if (
          isSiteXEdge(a, c) ||
          bd.cuts.some(
            (ct) => Math.abs(a[0] - ct) < 0.01 && Math.abs(c[0] - ct) < 0.01,
          )
        )
          continue;
        const face = Math.atan2(nx, nz);
        for (let t = 2.5; t < Lg - 2; t += 5) {
          const px = a[0] + dx * (t + 1.5) + nx * 0.03,
            pz = a[1] + dz * (t + 1.5) + nz * 0.03;
          if (
            bd.hollow &&
            Math.abs(px - RR.x0) < 0.2 &&
            Math.abs(pz - RR.door) < 3.2
          )
            continue; // the Rad Room door
          if (reserved(px, pz)) continue; // a Neon place's entrance
          const v = [1, 2, 3, 5, 4, 6, 0, 7, 2, 1][
            Math.floor(U.hash2(Math.round(px * 3), Math.round(pz * 3)) * 10)
          ];
          b.panel("shopfront", px, 2.4, pz, 3.6, 3.6, face, {
            rect: K.shopRect(v),
          });
          if (K.SHOP_LIT.indexOf(v) >= 0) {
            spill.add(
              px + nx * 2.2,
              pz + nz * 2.2,
              v === 6 ? 0x90ff90 : 0xffc070,
              3,
              { y: GY, i: 0.45 },
            );
            refl.add(
              px + nx * 0.3,
              pz + nz * 0.3,
              2.4,
              v === 6 ? 0x90ff90 : 0xffc070,
              2.4,
              { y: GY + 0.01, i: 0.45, len: 7 },
            );
          }
        }
      }
      // roof junk: water tower on some roofs, AC boxes
      const r = K.rng(bd.h * 13 + bx0);
      const nestRoof =
        TOWN && K.neonIsNestRoof && K.neonIsNestRoof(bx0, bz0, bx1); // the snipers' nest lives up there
      if (!nestRoof && r() < 0.6 && bx1 - bx0 > 10 && bz1 - bz0 > 9) {
        const wx = U.lerp(bx0 + 4, bx1 - 4, r()),
          wz = U.lerp(bz0 + 4, bz1 - 4, r());
        waterTower(d, wx, bd.h - 0.4, wz, 2.2 + r());
      }
      if (!nestRoof)
        for (let k = 0; k < 3; k++)
          d.box(
            "metal",
            U.lerp(bx0 + 3, bx1 - 3, r()),
            bd.h - 0.4,
            U.lerp(bz0 + 3, bz1 - 3, r()),
            1.6,
            1.1,
            1.2,
            { grime: 0.6 },
          );
      bd.bbox = { bx0, bx1, bz0, bz1 };
    }
    // ---- billboards, screens, blades on every plaza-facing wall ----
    for (const bd of buildings) {
      const poly = bd.poly;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i],
          c = poly[(i + 1) % poly.length];
        const [nx, nz, Lg] = outward(poly, i);
        if (Lg < 7) continue;
        const isCut = bd.cuts.some(
          (ct) => Math.abs(a[0] - ct) < 0.01 && Math.abs(c[0] - ct) < 0.01,
        );
        const isOuterZ =
          Math.abs(a[1] - c[1]) < 0.01 &&
          (Math.abs(a[1] + 312) < 0.5 || Math.abs(a[1] + 212.5) < 0.5);
        if (isSiteXEdge(a, c)) continue;
        let yMin = 7.5;
        if (isCut) {
          // side wall above a lower neighbour
          const nb = buildings.find(
            (o) =>
              o !== bd &&
              o.cuts === bd.cuts &&
              o.poly.some((p) => Math.abs(p[0] - a[0]) < 0.01),
          );
          if (!nb || nb.h > bd.h - 10) continue;
          yMin = nb.h + 1.5;
        }
        const cols = Math.max(1, Math.round(Lg / 13));
        const colW = Lg / cols;
        const w = Math.min(12, colW - 1.2);
        const h = w / 2;
        const rows = isOuterZ ? 1 : 3;
        let row = 0;
        for (
          let y = yMin;
          y + h < bd.h - 3 && row < rows;
          y += h + 2.2, row++
        ) {
          for (let k = 0; k < cols; k++) {
            const t = colW * (k + 0.5);
            const seedv = U.hash2(
              Math.round(a[0] * 7 + k * 3),
              Math.round(a[1] * 5 + row * 11),
            );
            if (seedv < 0.12 && row > 0) continue; // occasional gap showing the façade
            const kind = seedv > 0.9 && screenN < 4 ? "screen" : "ad";
            billboard(a[0], a[1], c[0], c[1], nx, nz, t, w, y, kind);
          }
        }
        // vertical neon blade at one end of long plaza walls
        if (!isCut && !isOuterZ && Lg > 18 && bd.h > 28) {
          // nine different blades, handed out in order so no two in view repeat (no mirrored BAR / BAR pair)
          const bladeKeys = [
            "ts_b_atomic",
            "ts_b_hotel",
            "ts_b_girls",
            "ts_b_eats",
            "ts_b_live",
            "ts_b_bar",
            "ts_b_dance",
            "ts_b_broadway",
            "ts_b_chems",
          ];
          const key = bladeKeys[bladeN++ % bladeKeys.length];
          const slot = K.atlases.neon.slots[key];
          const dx = (c[0] - a[0]) / Lg,
            dz = (c[1] - a[1]) / Lg;
          const bxp = a[0] + dx * 1.6 + nx * 1.4,
            bzp = a[1] + dz * 1.6 + nz * 1.4;
          const bh = Math.min(16, bd.h - 10),
            bw = (bh * slot.w) / slot.h;
          const face = Math.atan2(dx, dz); // blade plane faces along the wall
          d.box(
            "black_metal",
            bxp - nx * 0.2,
            6.5,
            bzp - nz * 0.2,
            0.25,
            bh + 0.4,
            2.6,
            { yaw: Math.atan2(nx, nz) },
          );
          d.panel("atlas_neon", bxp, 6.7 + bh / 2, bzp, bw, bh, face, {
            rect: slot.rect,
            off: 0.14,
          });
          d.panel(
            "atlas_neon",
            bxp,
            6.7 + bh / 2,
            bzp,
            bw,
            bh,
            face + Math.PI,
            { rect: slot.rect, off: 0.14 },
          );
          flick.add(
            bxp + nx * 0.5,
            6.7 + bh / 2,
            bzp + nz * 0.5,
            0xff80a0,
            "l",
          );
        }
      }
      // rooftop billboard scaffold (the big ones), turned toward the crossing
      if (bd.h < 50) {
        const bb = bd.bbox;
        const along = bb.bx1 - bb.bx0 > bb.bz1 - bb.bz0;
        const w = Math.min(16, (along ? bb.bx1 - bb.bx0 : bb.bz1 - bb.bz0) - 4),
          h = w / 2;
        if (w > 5) {
          const cx = (bb.bx0 + bb.bx1) / 2,
            cz = (bb.bz0 + bb.bz1) / 2;
          const face = along
            ? cz < -262
              ? 0
              : Math.PI
            : cx < -40
              ? Math.PI / 2
              : -Math.PI / 2;
          const fx = Math.sin(face),
            fz = Math.cos(face);
          const y0 = bd.h + 2;
          for (let k = -1; k <= 1; k += 2)
            for (const back of [0, 1.6]) {
              const px = cx + Math.cos(face) * k * w * 0.4 - fx * back,
                pz = cz - Math.sin(face) * k * w * 0.4 - fz * back;
              d.beam("rust", px, bd.h - 0.4, pz, px, y0 + h, pz, 0.18);
            }
          d.box(
            "rust",
            cx - fx * 0.8,
            y0 - 0.1,
            cz - fz * 0.8,
            w + 0.6,
            0.12,
            1.8,
            { yaw: face },
          );
          const [br, v] = nextBrand();
          ads.panel(
            "atlas_ads",
            cx + fx * 0.1,
            y0 + h / 2,
            cz + fz * 0.1,
            w,
            h,
            face,
            { rect: K.ad(br, v) },
          );
          if (K.tsBoardDress) {
            const st = K.tsBoardDecay(cx, y0 + 7, cz);
            if (st && st !== "bare")
              K.tsBoardDress(
                d,
                cx + fx * 0.1,
                y0,
                cz + fz * 0.1,
                w,
                h,
                face,
                st,
                { streaks: false },
              );
          }
          ads.panel(
            "atlas_ads",
            cx - fx * 0.1,
            y0 + h / 2,
            cz - fz * 0.1,
            w,
            h,
            face + Math.PI,
            { rect: K.ad(brands[(bi + 5) % brands.length], 1) },
          );
          rec.brandsUsed.add(br);
          for (let k = -1; k <= 1; k++)
            glows.add(
              cx + Math.cos(face) * k * w * 0.35 + fx * 1.2,
              y0 - 0.2,
              cz - Math.sin(face) * k * w * 0.35 + fz * 1.2,
              0xfff0d0,
              "l",
            );
        }
      }
    }

    // ================= ONE TIMES SQUARE (south island, apex of the bow-tie) =================
    // A slim wedge on the island between Seventh Avenue (west) and Broadway (east); above the 6.5 m soffit the
    // shaft cantilevers ~1.2 m over both kerbs. Its north face is the famous stack of screens looking up the
    // bow-tie; the New Year's ball rides the mast on the roof.
    {
      const base = [
        [-33.4, -224.9],
        [-30.45, -224.9],
        [-25.25, -212.5],
        [-33.4, -212.5],
      ];
      const up = [
        [-34.6, -225.3],
        [-29.15, -225.3],
        [-23.95, -212.5],
        [-34.6, -212.5],
      ];
      const Y1 = 6.5,
        TOP = 60,
        top2 = grow(up, -0.9);
      b.prism("granite", base, 0, Y1, { grime: 0.45 });
      b.prism("fac_ts_b", up, Y1, TOP - 8, { grime: 0.5 });
      b.prism("fac_ts_b", top2, TOP - 8, TOP, { grime: 0.5 });
      b.prism("limestone_dark", grow(up, 0.25), Y1 - 0.45, Y1 + 0.35, {
        grime: 0.5,
      }); // soffit band
      b.prism("limestone_dark", grow(up, 0.35), TOP - 8.8, TOP - 8, {
        grime: 0.6,
      });
      b.prism("limestone_dark", grow(top2, 0.35), TOP - 0.8, TOP, {
        grime: 0.6,
      });
      for (let i = 0; i < base.length; i++) {
        const a = base[i],
          c = base[(i + 1) % base.length];
        K.colWall(
          a[0],
          a[1],
          c[0],
          c[1],
          0.5,
          0,
          Y1 + 0.4,
          TOWN && K.neonWallOps ? K.neonWallOps(a, c) : [],
        );
      }
      for (let i = 0; i < up.length; i++) {
        const a = up[i],
          c = up[(i + 1) % up.length];
        K.colWall(a[0], a[1], c[0], c[1], 0.6, Y1, TOP, []);
      }
      // soffit lights under the cantilever + shopfronts on the island base
      for (const q of [
        [-34.0, -222],
        [-34.0, -217],
        [-34.0, -214],
        [-27.3, -219.5],
        [-25.9, -216],
      ]) {
        d.box("metal_dark", q[0], Y1 - 0.62, q[1], 0.5, 0.12, 0.5, {});
        glows.add(q[0], Y1 - 0.7, q[1], 0xfff0d0, "m");
      }
      b.panel("shopfront", -33.43, 2.4, -220.8, 3.6, 3.6, -Math.PI / 2, {
        rect: K.shopRect(6),
      });
      b.panel("shopfront", -33.43, 2.4, -216.4, 3.6, 3.6, -Math.PI / 2, {
        rect: K.shopRect(3),
      });
      spill.add(-35.5, -220.8, 0x90ff90, 3, { y: GY, i: 0.4 });
      {
        const ang = Math.atan2(5.2, 12.4); // east face runs (-30.45,-224.9) → (-25.25,-212.5)
        const nxE = Math.cos(ang),
          nzE = -Math.sin(ang),
          fE = Math.atan2(nxE, nzE);
        for (const t of [0.3, 0.68])
          b.panel(
            "shopfront",
            -30.45 + 5.2 * t + nxE * 0.03,
            2.4,
            -224.9 + 12.4 * t + nzE * 0.03,
            3.6,
            3.6,
            fE,
            { rect: K.shopRect(t < 0.5 ? 1 : 5) },
          );
      }
      // the prow: SHOWS TONITE neon over a steel door
      if (!TOWN) {
        // (with the Neon plan the prow is the Ticker Oracle's door + the Ball's winch: 41_neon_town.js)
        const pslot = K.atlases.neon.slots.ts_shows;
        d.panel(
          "atlas_neon",
          -31.9,
          4.9,
          -225.0,
          2.8,
          (2.8 * pslot.h) / pslot.w,
          Math.PI,
          { rect: pslot.rect, off: 0.02 },
        );
        d.boxMM("black_metal", -32.5, 0, -225.0, -31.3, 2.3, -224.9, {
          grime: 0.5,
        });
        flick.add(-31.9, 4.9, -226.2, 0xff4040, "m");
      }

      // north face: the screen stack (wider than the tower, like the real thing)
      const cx = -31.9,
        zf = -225.3,
        W = 12.6;
      d.box("black_metal", cx, 7.0, zf - 0.25, W + 0.5, 39.4, 0.5, {
        grime: 0.35,
      });
      const stack = TOWN
        ? [
            [7.4, 5.4, "ad"],
            [13.6, 8.8, "xscreen"],
            [23.6, 5.2, "ad"],
            [29.6, 5.2, "ad"],
            [35.8, 7.4, "screen"],
          ]
        : [
            [7.6, 6.0, "ad"],
            [14.4, 7.2, "screen"],
            [22.4, 6.0, "ad"],
            [29.2, 6.0, "ad"],
            [36.0, 7.2, "screen"],
          ];
      for (const s of stack) {
        if (s[2] === "xscreen") continue; // the Crossroads Screen hero frame: 41_neon_town.js
        if (s[2] === "screen") {
          ads.panel(
            "ts_screen",
            cx,
            s[0] + s[1] / 2,
            zf - 0.52,
            W,
            s[1],
            Math.PI,
            { rect: [0, 0, 1, 1] },
          );
          for (const s2 of [-4, 4])
            glows.add(cx + s2, s[0] + 0.4, zf - 0.9, 0xa0c8ff, "m");
        } else {
          const [br, v] = nextBrand();
          ads.panel(
            "atlas_ads",
            cx,
            s[0] + s[1] / 2,
            zf - 0.52,
            W,
            s[1],
            Math.PI,
            { rect: K.ad(br, v) },
          );
          rec.brandsUsed.add(br);
        }
        for (const e of [s[0], s[0] + s[1]])
          d.beam(
            "neon_tube",
            cx - W / 2,
            e,
            zf - 0.56,
            cx + W / 2,
            e,
            zf - 0.56,
            0.1,
            { tint: 0xfff4e0, grime: 0 },
          );
      }
      ads.panel("atlas_paint", cx, 44.6, zf - 0.52, W, W / 8, Math.PI, {
        rect: K.paint("ts_times", 1024, 128),
      });
      for (let k = -1; k <= 1; k++)
        glows.add(cx + k * 4.5, 7.3, zf - 1.6, 0xfff0d0, "m");
      // side faces: boards over Seventh Avenue and Broadway
      for (let i = 0; i < up.length; i++) {
        const a = up[i],
          c = up[(i + 1) % up.length];
        const [nx, nz, Lg] = outward(up, i);
        if (Math.abs(nz) > 0.9) continue; // north handled above; south abuts the next block
        for (const y of [10, 22])
          billboard(
            a[0],
            a[1],
            c[0],
            c[1],
            nx,
            nz,
            Lg / 2,
            Math.min(10, Lg - 2.5),
            y,
            y > 20 && nx > 0 ? "screen" : "ad",
          );
      }
      // ball mast + New Year's ball (glowing)
      const bc = top2.reduce(
          (s, p) => [s[0] + p[0] / top2.length, s[1] + p[1] / top2.length],
          [0, 0],
        ),
        top = TOP;
      if (!TOWN) {
        // (with the Neon plan: lattice mast + the moving Ball, 41_neon_town.js)
        b.cyl("black_metal", bc[0], top - 0.4, bc[1], 0.35, 0.25, 16, 8, {
          grime: 0.2,
        });
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2 + 0.78;
          d.beam(
            "black_metal",
            bc[0] + Math.cos(a) * 2.2,
            top - 0.4,
            bc[1] + Math.sin(a) * 2.2,
            bc[0],
            top + 10,
            bc[1],
            0.12,
          );
        }
        d.geo("lit_white", K.T.ico, {
          x: bc[0],
          y: top + 12.5,
          z: bc[1],
          s: 1.6,
        });
        d.geo("chrome", K.T.sphere, {
          x: bc[0],
          y: top + 12.5,
          z: bc[1],
          s: 1.52,
        });
        for (let k = 0; k < 18; k++) {
          const a = k * 2.399,
            yy = -1 + (k / 17) * 2;
          const rr = Math.sqrt(1 - yy * yy) * 1.65;
          flick.add(
            bc[0] + Math.cos(a) * rr,
            top + 12.5 + yy * 1.6,
            bc[1] + Math.sin(a) * rr,
            [0xff6060, 0x60a0ff, 0xffffff, 0xffd060][k % 4],
            "s",
          );
        }
        glows.add(bc[0], top + 12.5, bc[1], 0xfff4e0, "xl");
        rec.anchor("one_times_square", bc[0], top, bc[1], 0);
      }
    }

    // make sure every brand appears: extra rooftop boards turned toward the crossing
    brands
      .filter((br) => !rec.brandsUsed.has(br))
      .forEach((br, i) => {
        const bd = buildings[(i * 5 + 1) % buildings.length],
          bb = bd.bbox;
        const x = U.lerp(
            bb.bx0 + 3,
            bb.bx1 - 3,
            0.3 + (0.4 * ((i * 7) % 5)) / 4,
          ),
          z = U.lerp(bb.bz0 + 3, bb.bz1 - 3, 0.5);
        const face = Math.atan2(-40 - x, -262 - z),
          y = bd.h + 1.5;
        d.beam(
          "rust",
          x - Math.cos(face) * 2.4,
          bd.h - 0.3,
          z + Math.sin(face) * 2.4,
          x - Math.cos(face) * 2.4,
          y + 3.2,
          z + Math.sin(face) * 2.4,
          0.15,
        );
        d.beam(
          "rust",
          x + Math.cos(face) * 2.4,
          bd.h - 0.3,
          z - Math.sin(face) * 2.4,
          x + Math.cos(face) * 2.4,
          y + 3.2,
          z - Math.sin(face) * 2.4,
          0.15,
        );
        ads.panel("atlas_ads", x, y + 1.5, z, 6, 3, face, {
          rect: K.ad(br, 0),
        });
        rec.brandsUsed.add(br);
      });

    // ================= THE NEON (the Times Square settlement) =================
    const PI = Math.PI;
    /** Point on a building face a→b at distance t, `off` metres out on the plaza side (normal toward `toward`). */
    const onFace = (a, c, t, off, toward) => {
      const Lg = Math.hypot(c[0] - a[0], c[1] - a[1]),
        dx = (c[0] - a[0]) / Lg,
        dz = (c[1] - a[1]) / Lg;
      let nx = dz,
        nz = -dx;
      const mx = (a[0] + c[0]) / 2,
        mz = (a[1] + c[1]) / 2;
      if ((toward[0] - mx) * nx + (toward[1] - mz) * nz < 0) {
        nx = -nx;
        nz = -nz;
      }
      return {
        x: a[0] + dx * t + nx * off,
        z: a[1] + dz * t + nz * off,
        yaw: Math.atan2(nx, nz),
        nx,
        nz,
        dx,
        dz,
      };
    };
    const FACE_NW = [
        [-77.9, -312],
        [-64.6, -282],
      ],
      FACE_E = [
        [-24.1, -268],
        [-11.0, -237],
      ],
      FACE_SE = [
        [-9.5, -223],
        [-5.0, -212.5],
      ];
    const X0 = [-40, -262];

    // shacks
    const shack = (x, z, yaw, seed, sign) => {
      const door = P.shack(d, x, z, 5.5, 4.2, 2.9, yaw, { seed });
      if (sign) {
        const slot = K.atlases.neon.slots[sign];
        const fx = Math.sin(yaw),
          fz = Math.cos(yaw);
        d.panel(
          "atlas_neon",
          x + fx * 2.25,
          3.55,
          z + fz * 2.25,
          3.2,
          (3.2 * slot.h) / slot.w,
          yaw,
          { rect: slot.rect },
        );
        flick.add(x + fx * 2.6, 3.6, z + fz * 2.6, 0xa0ffc0, "m");
      }
      return door;
    };
    // market stall (lit) + anchors <name> / <name>_customer
    const stall = (name, x, z, yaw, col, sign) => {
      const cust = P.stall(d, x, z, 3.8, yaw, {
        seed: Math.round(x * 7 - z),
        color: col,
      });
      const c = Math.cos(yaw),
        sn = Math.sin(yaw),
        Wp = (lx, lz) => [x + lx * c + lz * sn, z - lx * sn + lz * c];
      const hb = Wp(0, -0.3);
      d.beam("black_metal", hb[0], 2.55, hb[1], hb[0], 2.2, hb[1], 0.02, {
        grime: 0,
      });
      d.geo("lit_warm", K.T.sphereLo, { x: hb[0], y: 2.12, z: hb[1], s: 0.1 });
      glows.add(hb[0], 2.1, hb[1], 0xffc878, "m");
      const lt = Wp(1.2, 0.45); // oil lantern on the counter
      d.cyl("black_metal", lt[0], 1.1, lt[1], 0.1, 0.1, 0.04, 6, {});
      d.cyl("lit_warm", lt[0], 1.14, lt[1], 0.08, 0.08, 0.2, 6, {
        tint: 0xffb050,
      });
      glows.add(lt[0], 1.3, lt[1], 0xffb050, "s");
      for (const lx of [-1.3, 1.3]) {
        const lp = Wp(lx, -0.9);
        d.geo("lit_warm", K.T.sphereLo, {
          x: lp[0],
          y: 1.95,
          z: lp[1],
          s: 0.06,
          tint: 0xffa040,
        });
        glows.add(lp[0], 1.95, lp[1], 0xffa040, "s");
      }
      const fp = Wp(0, 1.6);
      spill.add(fp[0], fp[1], 0xffc070, 3.2, {
        y: GY,
        i: 0.35,
        sx: 3.2,
        sz: 2.2,
        yaw,
      });
      if (sign) {
        const slot = K.atlases.neon.slots[sign];
        d.panel(
          "atlas_neon",
          x - sn * 1.0,
          3.3,
          z - c * 1.0,
          3.0,
          (3.0 * slot.h) / slot.w,
          yaw,
          { rect: slot.rect, both: true, off: 0.03 },
        );
      }
      rec.anchor(name, x - sn * 0.45, 0, z - c * 0.45, yaw);
      rec.anchor(name + "_customer", cust[0], 0, cust[2], yaw + PI);
    };
    /** Two-storey shack: ground shack, deck with front balcony + railing, side stair, upper shack. */
    const stackShack = (x, z, yaw, seed, sign) => {
      const c = Math.cos(yaw),
        sn = Math.sin(yaw);
      const W = (lx, lz) => [x + lx * c + lz * sn, z - lx * sn + lz * c];
      shack(x, z, yaw, seed, null);
      const DY = 3.25;
      const deck = (lx0, lx1, lz0, lz1) => {
        const p = W((lx0 + lx1) / 2, (lz0 + lz1) / 2);
        d.box("metal_dark", p[0], DY - 0.2, p[1], lx1 - lx0, 0.2, lz1 - lz0, {
          yaw,
          grime: 0.7,
        });
        K.colRot(p[0], p[1], lx1 - lx0, lz1 - lz0, DY - 0.2, DY, yaw, {
          surface: "metal",
        });
      };
      deck(-3, 3, -2.4, 3.4);
      deck(3, 4.2, -2.7, -1.2);
      for (const q of [
        [-2.9, 3.3],
        [2.9, 3.3],
        [4.1, -1.3],
      ]) {
        const p = W(q[0], q[1]);
        d.beam("rust", p[0], 0, p[1], p[0], DY - 0.2, p[1], 0.12);
      }
      const r0 = W(-3, 3.35),
        r1 = W(3, 3.35);
      d.beam("rust", r0[0], DY + 1.0, r0[1], r1[0], DY + 1.0, r1[1], 0.06);
      for (let t = 0; t <= 6.01; t += 1.5) {
        const p = W(-3 + t, 3.35);
        d.beam("rust", p[0], DY, p[1], p[0], DY + 1.0, p[1], 0.05);
      }
      K.colRot(
        (r0[0] + r1[0]) / 2,
        (r0[1] + r1[1]) / 2,
        6,
        0.15,
        DY,
        DY + 1.05,
        yaw,
        { walkable: false },
      );
      const sb = W(3.6, 3.7);
      d.stairs("metal_dark", sb[0], sb[1], -sn, -c, 1.1, 5.0, 0, DY, 9, {});
      const hr0 = W(4.2, 3.7),
        hr1 = W(4.2, -1.3);
      d.beam("rust", hr0[0], 1.0, hr0[1], hr1[0], DY + 1.0, hr1[1], 0.05);
      const upc = W(-0.4, -0.5);
      P.shack(d, upc[0], upc[1], 4.4, 3.2, 2.5, yaw, {
        seed: seed + 50,
        y: DY,
      });
      const sgn = W(-0.4, 1.2);
      if (sign) {
        const slot = K.atlases.neon.slots[sign];
        d.panel(
          "atlas_neon",
          sgn[0],
          DY + 3.1,
          sgn[1],
          3.4,
          (3.4 * slot.h) / slot.w,
          yaw,
          { rect: slot.rect, off: 0.05 },
        );
        flick.add(sgn[0] + sn * 0.6, DY + 3.1, sgn[1] + c * 0.6, 0xa0ffc0, "l");
      } else {
        d.panel("fabric", sgn[0], DY + 1.9, sgn[1], 2.4, 0.8, yaw, {
          tint: [0x8a2a22, 0x2a5a6a, 0x6a5a2a][seed % 3],
          grime: 0.4,
          off: 0.03,
        });
      }
      glows.add(sgn[0] + sn * 1.2, DY + 2.4, sgn[1] + c * 1.2, 0xffc070, "m");
    };
    // patched tarp canopy on four poles (slope along z)
    const tarp = (x0, z0, x1, z1, yA, yB, col) => {
      for (const p of [
        [x0, z0],
        [x1, z0],
        [x0, z1],
        [x1, z1],
      ])
        d.beam("wood", p[0], 0, p[1], p[0], Math.max(yA, yB) + 0.1, p[1], 0.09);
      const zm = (z0 + z1) / 2;
      d.quad(
        "fabric",
        [x0, yA, z0],
        [x1, yA, z0],
        [x1, (yA + yB) / 2 - 0.35, zm],
        [x0, (yA + yB) / 2 - 0.35, zm],
        { double: true, tint: col, grime: 0.5 },
      );
      d.quad(
        "fabric",
        [x0, (yA + yB) / 2 - 0.35, zm],
        [x1, (yA + yB) / 2 - 0.35, zm],
        [x1, yB, z1],
        [x0, yB, z1],
        { double: true, tint: K.shadeHex(col, 0.8), grime: 0.5 },
      );
    };
    const laundry = (a, b2, seed) => {
      const pts = d.cable(
        "rust",
        a[0],
        a[1],
        a[2],
        b2[0],
        b2[1],
        b2[2],
        0.45,
        0.025,
        10,
      );
      const r = K.rng(seed),
        cols = [0xd8d0b8, 0x8a2a22, 0x3a5a7a, 0xc8a040, 0x5a6a4a, 0xb8b0a0];
      const yaw = Math.atan2(b2[0] - a[0], b2[2] - a[2]) + PI / 2;
      for (let i = 1; i < pts.length - 1; i++) {
        if (r() < 0.3) continue;
        const w = 0.5 + r() * 0.6,
          h = 0.5 + r() * 0.7;
        d.panel(
          "fabric",
          pts[i][0],
          pts[i][1] - h / 2 - 0.03,
          pts[i][2],
          w,
          h,
          yaw,
          {
            tint: cols[Math.floor(r() * cols.length)],
            grime: 0.4,
            double: true,
          },
        );
      }
    };

    // ---- entry arches: posts on the pavements, a lit beam + neon sign ≥ 6 m over the road (roads stay open) ----
    const SIGN_COL = {
      ts_welcome: 0xff5ab4,
      ts_theneon: 0x5aff7a,
      ts_comeback: 0xff5ab4,
      ts_crossroads: 0xffd040,
    };
    const neonSign = (key, x, y, z, w, face) => {
      const slot = K.atlases.neon.slots[key];
      const h = (w * slot.h) / slot.w,
        sc = SIGN_COL[key] || 0xff80c0;
      const fx = Math.sin(face),
        fz = Math.cos(face),
        ux = Math.cos(face),
        uz = -Math.sin(face);
      d.box(
        "black_metal",
        x - fx * 0.12,
        y - 0.1,
        z - fz * 0.12,
        w + 0.3,
        h + 0.2,
        0.12,
        { yaw: face, grime: 0.4 },
      );
      d.panel("atlas_neon", x, y + h / 2, z, w, h, face, {
        rect: slot.rect,
        off: 0.02,
      });
      for (const s2 of [-1, 1])
        flick.add(
          x + ux * s2 * w * 0.28 + fx * 0.5,
          y + h / 2,
          z + uz * s2 * w * 0.28 + fz * 0.5,
          sc,
          "l",
        );
      return h;
    };
    const arch = (ax, az, bx, bz, signKey, face, o) => {
      o = o || {};
      const Lg = Math.hypot(bx - ax, bz - az),
        dx = (bx - ax) / Lg,
        dz = (bz - az) / Lg;
      const ox = Math.sin(face),
        oz = Math.cos(face),
        BY = 6.2;
      const posts = [];
      if (o.postA !== false) posts.push([ax, az]);
      if (o.postB !== false) posts.push([bx, bz]);
      for (const p of posts) {
        d.box("rust", p[0], 0, p[1], 0.42, BY + 0.5, 0.42, { grime: 0.6 });
        d.box("concrete", p[0], 0, p[1], 0.9, 0.7, 0.9, { grime: 0.7 });
        K.colBox(
          p[0] - 0.45,
          0,
          p[1] - 0.45,
          p[0] + 0.45,
          BY + 0.5,
          p[1] + 0.45,
          { surface: "metal" },
        );
        // caged sodium lamp hung out over the approach
        d.beam(
          "black_metal",
          p[0],
          5.6,
          p[1],
          p[0] + ox * 0.9,
          5.6,
          p[1] + oz * 0.9,
          0.07,
        );
        d.box(
          "black_metal",
          p[0] + ox * 1.0,
          5.25,
          p[1] + oz * 1.0,
          0.45,
          0.3,
          0.45,
          { yaw: face },
        );
        d.geo("lit_warm", K.T.sphereLo, {
          x: p[0] + ox * 1.0,
          y: 5.12,
          z: p[1] + oz * 1.0,
          s: 0.16,
          tint: 0xffb060,
        });
        glows.add(p[0] + ox * 1.0, 5.05, p[1] + oz * 1.0, 0xff9a40, "m");
      }
      d.box(
        "rust",
        (ax + bx) / 2,
        BY - 0.2,
        (az + bz) / 2,
        Lg + 0.4,
        0.45,
        0.35,
        { yaw: Math.atan2(dx, dz) + PI / 2, grime: 0.6 },
      );
      if (o.postA !== false)
        d.beam(
          "rust",
          ax,
          BY - 0.9,
          az,
          ax + dx * 1.4,
          BY - 0.2,
          az + dz * 1.4,
          0.1,
        );
      if (o.postB !== false)
        d.beam(
          "rust",
          bx,
          BY - 0.9,
          bz,
          bx - dx * 1.4,
          BY - 0.2,
          bz - dz * 1.4,
          0.1,
        );
      P.bulbs(
        d,
        glows,
        [
          [ax + ox * 0.25, BY - 0.25, az + oz * 0.25],
          [bx + ox * 0.25, BY - 0.25, bz + oz * 0.25],
        ],
        {
          spacing: 0.9,
          sag: 0.3,
          colors: [0xffd25a, 0xff5a5a, 0x5aff8a, 0xffb060],
          broken: 0.12,
        },
      );
      const mx = (ax + bx) / 2,
        mz = (az + bz) / 2,
        sw = Math.min(Lg - 1.5, o.w || 10);
      if (signKey)
        neonSign(signKey, mx + ox * 0.2, BY + 0.25, mz + oz * 0.2, sw, face);
      if (o.back)
        neonSign(
          o.back,
          mx - ox * 0.2,
          BY + 0.25,
          mz - oz * 0.2,
          sw * 0.9,
          face + PI,
        );
      const sc = SIGN_COL[signKey] || 0xff80c0;
      spill.add(mx + ox * 3.5, mz + oz * 3.5, sc, 6.0, {
        y: GY,
        i: 0.12,
        sx: Math.max(4, Lg * 0.45),
        sz: 3.5,
        yaw: face,
      });
      return [mx, mz];
    };
    const aW47 = arch(-93.4, -281.3, -93.4, -268.7, "ts_theneon", -PI / 2);
    const aE47 = arch(14.4, -281.3, 14.4, -268.7, "ts_theneon", PI / 2);
    const aW42 = arch(-93.4, -236.3, -93.4, -223.7, "ts_welcome", -PI / 2);
    const aE42 = arch(14.4, -236.3, 14.4, -223.7, "ts_welcome", PI / 2);
    const aS7 = arch(-48.0, -213.0, -33.6, -213.0, "ts_welcome", 0, {
      postB: false,
      back: "ts_comeback",
      w: 11,
    });
    const aSB = arch(-25.6, -213.0, -12.3, -213.0, "ts_theneon", 0, {
      postA: false,
      w: 9,
    });
    // sandbag nests beside the side-street arches (half across the pavement: the way in stays open)
    for (const sbx of [
      [-93.0, -282.0, -93.0, -280.5],
      [14.0, -268.0, 14.0, -269.5],
      [-93.0, -222.9, -93.0, -224.4],
      [14.0, -237.0, 14.0, -235.5],
    ])
      P.sandbags(d, sbx[0], sbx[1], sbx[2], sbx[3], 3, {
        seed: Math.round(sbx[0] * 3 + sbx[1]),
      });

    // ---- north gantry: a walkable scrap catwalk spanning Broadway, Duffy Square and Seventh Avenue at 5.6 m,
    //      carrying WELCOME TO THE NEON / THE NEON (north) and COME BACK ALIVE / CROSSROADS OF THE WORLD (south).
    const gz0 = -311.9,
      gz1 = -309.9,
      gy = 5.6,
      gxW = -69.9,
      gxE = -23.0;
    {
      d.boxMM("metal_dark", gxW, gy - 0.2, gz0, gxE, gy, gz1, { grime: 0.7 });
      K.colBox(gxW, gy - 0.2, gz0, gxE, gy, gz1, { surface: "metal" });
      d.boxMM("rust", gxW, gy - 0.5, gz0 - 0.05, gxE, gy - 0.2, gz0 + 0.1, {
        grime: 0.7,
      }); // fascia
      d.boxMM("rust", gxW, gy - 0.5, gz1 - 0.1, gxE, gy - 0.2, gz1 + 0.05, {
        grime: 0.7,
      });
      for (const px of [-69.2, -50.5, -32.0]) {
        d.box("rust", px, 0, (gz0 + gz1) / 2, 0.45, gy - 0.2, 0.45, {
          grime: 0.6,
        });
        d.box("concrete", px, 0, (gz0 + gz1) / 2, 0.95, 0.6, 0.95, {
          grime: 0.7,
        });
        K.colBox(px - 0.48, 0, gz0 + 0.5, px + 0.48, gy - 0.2, gz1 - 0.5, {
          surface: "metal",
        });
        for (const s of [-1, 1])
          d.beam(
            "rust",
            px,
            gy - 1.4,
            (gz0 + gz1) / 2,
            px + s * 1.2,
            gy - 0.5,
            (gz0 + gz1) / 2,
            0.08,
          );
      }
      // railings (north rail runs on over the catwalk's end; the catwalk joins the east end)
      for (const z of [gz0 + 0.05, gz1 - 0.05]) {
        const xe = z < -311 ? -20.1 : gxE;
        d.beam("rust", gxW, gy + 1.1, z, xe, gy + 1.1, z, 0.06);
        d.beam("rust", gxW, gy + 0.55, z, xe, gy + 0.55, z, 0.04);
        for (let x = gxW; x <= xe + 0.01; x += 2.4)
          d.beam("rust", x, gy, z, x, gy + 1.1, z, 0.05);
        K.colBox(gxW, gy, z - 0.06, xe, gy + 1.1, z + 0.06, {
          walkable: false,
        });
      }
      if (!TOWN) {
        d.beam("rust", gxW, gy + 1.1, gz0, gxW, gy + 1.1, gz1, 0.06);
        K.colBox(gxW - 0.06, gy, gz0, gxW + 0.06, gy + 1.1, gz1, {
          walkable: false,
        });
      } else
        for (const q of [
          [gz0, -311.55],
          [-310.15, gz1],
        ]) {
          d.beam("rust", gxW, gy + 1.1, q[0], gxW, gy + 1.1, q[1], 0.06);
          K.colBox(gxW - 0.06, gy, q[0], gxW + 0.06, gy + 1.1, q[1], {
            walkable: false,
          });
        } // (the plank to the north watchtower: 41)
      // corrugated patches on the rails
      for (const px of [-66.5, -61.4, -55.0, -44.2, -37.1, -27.5])
        d.geo("corrugated", K.T.box, {
          x: px,
          y: gy + 0.55,
          z: gz0 + 0.02,
          sx: 1.7,
          sy: 1.05,
          sz: 0.04,
          rz: (px % 2) * 0.04,
        });
      // signs on the north rail (face the arrivals from Columbus Circle), smaller backs facing the square
      neonSign("ts_welcome", -59.85, gy + 1.3, gz0 - 0.1, 13, PI);
      neonSign("ts_theneon", -41.25, gy + 1.3, gz0 - 0.1, 12, PI);
      neonSign("ts_comeback", -59.85, gy + 1.3, gz1 + 0.1, 11, 0);
      neonSign("ts_crossroads", -41.25, gy + 1.3, gz1 + 0.1, 12, 0);
      for (const sx of [-65.5, -54.2, -46.8, -35.7]) {
        d.beam(
          "black_metal",
          sx,
          gy + 1.1,
          gz0 + 0.1,
          sx,
          gy + 1.5,
          gz0 - 0.05,
          0.06,
        );
        d.beam(
          "black_metal",
          sx,
          gy + 1.1,
          gz1 - 0.1,
          sx,
          gy + 1.5,
          gz1 + 0.05,
          0.06,
        );
      }
      // bulbs under both fascias, a searchlight and sandbags over Duffy Square
      P.bulbs(
        d,
        glows,
        [
          [gxW, gy - 0.55, gz0 - 0.15],
          [gxE, gy - 0.55, gz0 - 0.15],
        ],
        {
          spacing: 1.0,
          sag: 0.25,
          colors: [0xffd25a, 0xff5a5a, 0x5aff8a, 0x5ab4ff],
          broken: 0.12,
        },
      );
      P.bulbs(
        d,
        glows,
        [
          [gxW, gy - 0.55, gz1 + 0.15],
          [gxE, gy - 0.55, gz1 + 0.15],
        ],
        {
          spacing: 1.0,
          sag: 0.25,
          colors: [0xffd25a, 0xff5a5a, 0x5aff8a, 0x5ab4ff],
          broken: 0.15,
        },
      );
      P.sandbags(d, -53.2, gz0 + 0.35, -47.8, gz0 + 0.35, 2, {
        y: gy,
        collide: false,
        seed: 331,
      });
      P.searchlight(d, glows, -62.5, gy, gz0 + 0.9, PI, 0.25);
      rec.anchor("bridge", -50.5, gy, (gz0 + gz1) / 2, PI);
    }

    // ---- NE plaza (B1 set back): the Rad Room bar under the lookout catwalk that feeds the gantry ----
    const cwx0 = -23.0,
      cwx1 = -20.1,
      cwy = gy,
      cwz0 = gz0,
      cwz1 = -291.0;
    {
      d.boxMM("metal_dark", cwx0, cwy - 0.2, cwz0, cwx1, cwy, cwz1, {
        grime: 0.6,
      });
      K.colBox(cwx0, cwy - 0.2, cwz0, cwx1, cwy, cwz1, { surface: "metal" });
      for (let z = cwz1; z >= gz1 - 0.01; z -= 3.6) {
        d.beam("rust", cwx0 + 0.12, 0, z, cwx0 + 0.12, cwy, z, 0.14);
        d.beam("rust", cwx0, cwy, z, cwx0, cwy + 1.1, z, 0.06);
      }
      d.beam("rust", cwx0, cwy + 1.05, gz1, cwx0, cwy + 1.05, cwz1, 0.06);
      d.beam("rust", cwx0, cwy + 0.55, gz1, cwx0, cwy + 0.55, cwz1, 0.04);
      K.colBox(cwx0 - 0.1, cwy, gz1, cwx0 + 0.1, cwy + 1.1, cwz1, {
        walkable: false,
      });
      d.stairs("metal_dark", -21.7, -282.8, 0, -1, 2.6, 8.2, 0, cwy, 14, {});
      for (const sx of [-23.0, -20.4])
        d.beam("rust", sx, 1.0, -282.8, sx, cwy + 1.0, -291.0, 0.05);
      P.sandbags(d, cwx0 + 0.2, -300, cwx0 + 0.2, -304.5, 2, {
        y: cwy,
        collide: false,
        seed: 332,
      });
      P.searchlight(d, glows, -21.6, cwy, -306.5, PI / 2 + 0.6, 0.25);
      P.bulbs(
        d,
        glows,
        [
          [cwx0, cwy + 1.2, gz1],
          [cwx0, cwy + 1.2, cwz1],
        ],
        {
          spacing: 1.1,
          sag: 0.25,
          colors: [0xff5050, 0xffd050, 0x50ff80, 0x50a0ff],
        },
      );
      // caged work lamps under the catwalk deck so the frontage under it is not a black hole
      for (const lz of [-308.2, -302.6, -297.0, -290.2]) {
        d.box("black_metal", -21.5, cwy - 0.5, lz, 0.4, 0.3, 0.4, {});
        d.geo("lit_warm", K.T.sphereLo, {
          x: -21.5,
          y: cwy - 0.62,
          z: lz,
          s: 0.13,
          tint: 0xffc070,
        });
        glows.add(-21.5, cwy - 0.7, lz, 0xffb060, "m");
      }
      // Rad Room patio under the catwalk: awning, tables, a lamp; the bar itself is inside (door at z -293.5)
      tarp(-27.8, -307.6, -23.3, -296.4, 3.3, 3.1, 0x3a4a6a);
      for (const t of [
        [-25.6, -304.2],
        [-25.6, -299.8],
      ]) {
        P.table(d, t[0], 0, t[1], 0.4, { w: 1, d: 1 });
        P.chair(d, t[0] - 0.9, 0, t[1], PI / 2);
        P.chair(d, t[0] + 0.9, 0, t[1], -PI / 2, { fallen: t[1] > -302 });
      }
      d.geo("lit_warm", K.T.sphereLo, { x: -25.6, y: 2.9, z: -302, s: 0.14 });
      glows.add(-25.6, 2.85, -302, 0xffc070, "m");
      // the door (west face of the B1-west building, opening onto the NE plaza / Broadway side): steel frame, a
      // bulb-studded marquee canopy, THE RAD ROOM neon UNDER the catwalk deck (reads from the plaza), a vertical
      // OPEN 24 HRS beside the door, a velvet rope for the doorman and a lit spill on the pavement.
      const DZ = RR.door;
      d.boxMM("black_metal", -20.35, 0, DZ - 1.45, -19.9, 3.35, DZ - 1.2, {
        grime: 0.5,
      });
      d.boxMM("black_metal", -20.35, 0, DZ + 1.2, -19.9, 3.35, DZ + 1.45, {
        grime: 0.5,
      });
      d.boxMM("black_metal", -20.35, 3.1, DZ - 1.45, -19.9, 3.4, DZ + 1.45, {
        grime: 0.5,
      });
      d.boxMM("brass", -20.42, 0, DZ - 1.5, -20.3, 3.45, DZ - 1.42, {});
      d.boxMM("brass", -20.42, 0, DZ + 1.42, -20.3, 3.45, DZ + 1.5, {});
      // canopy: 1.6 m deep, brass-edged, bulbs along its fascia and soffit
      d.boxMM("black_metal", -21.75, 3.5, DZ - 2.1, -20.0, 3.72, DZ + 2.1, {
        grime: 0.4,
      });
      d.boxMM("brass", -21.8, 3.45, DZ - 2.15, -21.7, 3.78, DZ + 2.15, {});
      for (let k = 0; k <= 10; k++) {
        const bz = DZ - 2.0 + k * 0.4;
        d.geo("lit_warm", K.T.sphereLo, {
          x: -21.82,
          y: 3.6,
          z: bz,
          s: 0.065,
          tint: k % 5 === 3 ? 0x553322 : 0xffe0a8,
        });
        if (k % 2 === 0) glows.add(-21.95, 3.6, bz, 0xffd090, "s");
      }
      for (const sz of [-1.2, 0, 1.2]) {
        d.geo("lit_warm", K.T.sphereLo, {
          x: -20.9,
          y: 3.44,
          z: DZ + sz,
          s: 0.1,
          tint: 0xffd8a0,
        });
        glows.add(-20.9, 3.35, DZ + sz, 0xffc880, "m");
      }
      // bulbs chasing up both door jambs
      for (let k = 0; k < 6; k++)
        for (const s of [-1, 1]) {
          const by = 0.35 + k * 0.52;
          d.geo("lit_warm", K.T.sphereLo, {
            x: -20.45,
            y: by,
            z: DZ + s * 1.46,
            s: 0.05,
            tint: 0xffe0a8,
          });
          if (k % 2 === 1) glows.add(-20.6, by, DZ + s * 1.46, 0xffd090, "s");
        }
      const rslot = K.atlases.neon.slots.ts_radroom;
      d.box("black_metal", -20.06, 3.84, DZ, 0.1, 1.04, 5.7, { grime: 0.4 });
      d.panel(
        "atlas_neon",
        -20.14,
        4.36,
        DZ,
        5.2,
        (5.2 * rslot.h) / rslot.w,
        -PI / 2,
        { rect: rslot.rect, off: 0.02 },
      );
      flick.add(-21.0, 4.4, DZ - 1.4, 0x6ac8ff, "l");
      flick.add(-21.0, 4.4, DZ + 1.4, 0x6ac8ff, "l");
      const oslot = K.atlases.neon.slots.ts_open;
      d.panel(
        "atlas_neon",
        -20.1,
        2.3,
        DZ + 3.2,
        1.9,
        (1.9 * oslot.h) / oslot.w,
        -PI / 2,
        { rect: oslot.rect, off: 0.02 },
      );
      glows.add(-20.6, 2.3, DZ + 3.2, 0xff4040, "s");
      // velvet rope on brass posts (south of the door, where the doorman stands)
      for (const pz of [DZ - 1.9, DZ - 3.6]) {
        d.cyl("brass", -21.3, 0, pz, 0.06, 0.05, 0.95, 6, {});
        d.geo("brass", K.T.sphereLo, { x: -21.3, y: 0.98, z: pz, s: 0.07 });
        d.cyl("brass", -21.3, 0, pz, 0.16, 0.18, 0.04, 8, {});
      }
      d.cable(
        "carpet",
        -21.3,
        0.9,
        DZ - 1.9,
        -21.3,
        0.9,
        DZ - 3.6,
        0.18,
        0.03,
        6,
      );
      spill.add(-21.8, DZ, 0xffb070, 3.2, { y: GY, i: 0.36, sx: 3.0, sz: 4.4 });
      spill.add(-22.5, DZ, 0x6ac8ff, 4.0, { y: GY, i: 0.22 });
      refl.add(-20.6, DZ, 3.6, 0xffc080, 1.6, { y: GY + 0.01, i: 0.4, len: 6 });
      rec.anchor("doorman", -22.3, 0, DZ - 1.5, -PI / 2);
      rec.anchor("lookout", -21.6, cwy, -309, PI);
    }

    // ---- THE RAD ROOM (walk-in ground floor of B1 west): 40_times_square_interior.js ----
    K.interior("times_square:rad_room", { rec, P, RR, PI });

    // ---- Duffy Square (north island): the red steps, Father Duffy before his Celtic cross, George M. Cohan ----
    const rsx = -49.4,
      rsz0 = -302.2,
      rsz1 = -309.4,
      rsw = 5.8,
      rsh = 3.6,
      nSteps = 9;
    {
      K.defineMat("red_glass", {
        basic: true,
        color: 0xff2a1a,
        toneMapped: false,
      });
      for (let i = 0; i < nSteps; i++) {
        const z0 = rsz0 - ((rsz0 - rsz1) * i) / nSteps,
          z1 = rsz0 - ((rsz0 - rsz1) * (i + 1)) / nSteps,
          top = (rsh * (i + 1)) / nSteps;
        d.boxMM(
          "red_glass",
          rsx - rsw / 2,
          top - 0.06,
          z1,
          rsx + rsw / 2,
          top,
          z0,
          { faces: "t", grime: 0.35 },
        );
        d.boxMM(
          "red_glass",
          rsx - rsw / 2,
          top - rsh / nSteps,
          z0 - 0.02,
          rsx + rsw / 2,
          top - 0.06,
          z0,
          { faces: "s", tint: 0x7a1010, grime: 0.3 },
        );
        for (const sx of [rsx - rsw / 2 - 0.18, rsx + rsw / 2])
          d.boxMM("black_metal", sx, 0, z1, sx + 0.18, top, z0, { grime: 0.4 });
        if (i % 2 === 0)
          for (let k = -1; k <= 1; k++)
            flick.add(rsx + k * 2, top + 0.1, (z0 + z1) / 2, 0xff3020, "m");
      }
      d.boxMM(
        "black_metal",
        rsx - rsw / 2 - 0.2,
        0,
        rsz1 - 0.4,
        rsx + rsw / 2 + 0.2,
        rsh + 1.1,
        rsz1,
        { grime: 0.4 },
      );
      for (const sx of [rsx - rsw / 2 - 0.1, rsx + rsw / 2 + 0.1])
        d.beam("black_metal", sx, 1.0, rsz0, sx, rsh + 1.0, rsz1, 0.06);
      K.colStairs(rsx, rsz0, 0, -1, rsw, rsz0 - rsz1, 0, rsh, nSteps);
      K.colBox(
        rsx - rsw / 2 - 0.2,
        0,
        rsz1 - 0.4,
        rsx + rsw / 2 + 0.2,
        rsh + 1.1,
        rsz1,
      );
      glows.add(rsx, 1.6, rsz0 + 1.2, 0xff3020, "l");
      const sslot = K.atlases.neon.slots.ts_shows; // the booth's sign on the back of the steps (seen from the north)
      d.panel(
        "atlas_neon",
        rsx,
        2.6,
        rsz1 - 0.42,
        4.6,
        (4.6 * sslot.h) / sslot.w,
        PI,
        { rect: sslot.rect, off: 0.02 },
      );
      // Father Duffy: bronze robed figure on a granite pedestal, the Celtic cross behind him
      const fdx = -48.0,
        fdz = -296.9;
      d.boxMM(
        "granite",
        fdx - 0.65,
        0,
        fdz - 0.65,
        fdx + 0.65,
        1.4,
        fdz + 0.65,
        { grime: 0.5 },
      );
      d.boxMM(
        "granite",
        fdx - 0.75,
        1.3,
        fdz - 0.75,
        fdx + 0.75,
        1.45,
        fdz + 0.75,
        { grime: 0.5 },
      );
      K.colBox(fdx - 0.65, 0, fdz - 0.65, fdx + 0.65, 1.45, fdz + 0.65, {
        surface: "concrete",
      });
      P.figure(d, "bronze", fdx, 1.45, fdz, 0, 1.1, "robed", { grime: 0.5 });
      const crz = -298.3;
      d.boxMM("granite", fdx - 0.45, 0, crz - 0.3, fdx + 0.45, 0.8, crz + 0.3, {
        grime: 0.6,
      });
      d.boxMM(
        "granite",
        fdx - 0.2,
        0.8,
        crz - 0.16,
        fdx + 0.2,
        5.6,
        crz + 0.16,
        { grime: 0.5 },
      );
      d.boxMM(
        "granite",
        fdx - 0.95,
        3.95,
        crz - 0.16,
        fdx + 0.95,
        4.35,
        crz + 0.16,
        { grime: 0.5 },
      );
      d.geo("granite", K.T.torus, {
        x: fdx,
        y: 4.15,
        z: crz,
        s: 0.62,
        grime: 0.5,
      });
      K.colBox(fdx - 0.45, 0, crz - 0.3, fdx + 0.45, 5.6, crz + 0.3, {
        surface: "concrete",
      });
      // George M. Cohan at the tip, cane in hand, looking down Broadway
      const gcx = -47.15,
        gcz = -292.8;
      d.boxMM(
        "granite",
        gcx - 0.45,
        0,
        gcz - 0.45,
        gcx + 0.45,
        1.2,
        gcz + 0.45,
        { grime: 0.5 },
      );
      K.colBox(gcx - 0.45, 0, gcz - 0.45, gcx + 0.45, 1.2, gcz + 0.45, {
        surface: "concrete",
      });
      const gf = P.figure(d, "bronze", gcx, 1.2, gcz, 0.15, 0.95, "stand", {
        grime: 0.5,
      });
      if (gf && gf.p) {
        const h0 = gf.p(0.32, 0.82, 0.08),
          h1 = gf.p(0.36, 0.0, 0.2);
        d.beam("bronze", h0[0], h0[1], h0[2], h1[0], h1[1], h1[2], 0.03);
      }
      spill.add(fdx, fdz + 1.2, 0xffc080, 2.2, { y: GY, i: 0.2 });
    }

    // ---- West plaza (A2 set back 14 m): the market — stacked shacks, the water purifier, the totem, stalls ----
    stackShack(-61.3, -262.0, PI / 2, 21, "ts_eats");
    stackShack(-61.3, -242.5, PI / 2, 22, null);
    stall("merchant1", -54.4, -264.3, PI / 2, 0x8a3a8a, "ts_scrip");
    stall("merchant2", -54.4, -241.6, PI / 2, 0x3a6a8a, "ts_chems");
    {
      const wx = -59.8,
        wz = -253.1;
      K.paint("ts_water", 512, 160, (x2, W, H2) => {
        x2.fillStyle = "#1e3a4a";
        x2.fillRect(0, 0, W, H2);
        x2.strokeStyle = "#e8e0c0";
        x2.lineWidth = 6;
        x2.strokeRect(8, 8, W - 16, H2 - 16);
        x2.fillStyle = "#e8e0c0";
        x2.font = "bold 58px Impact, sans-serif";
        x2.textAlign = "center";
        x2.textBaseline = "middle";
        x2.fillText("CLEAN WATER", W / 2, H2 * 0.4);
        x2.font = "bold 34px Impact, sans-serif";
        x2.fillStyle = "#ffd86a";
        x2.fillText("5 SCRIP A JUG · NO CREDIT", W / 2, H2 * 0.76);
        K.stains(x2, W, H2, 6, 77, 0.4);
      });
      d.cyl("concrete", wx, 0, wz, 2.6, 2.7, 0.35, 12, { grime: 0.7 });
      for (let k = 0; k < 4; k++) {
        const a = (k * PI) / 2 + PI / 4;
        d.beam(
          "rust",
          wx + Math.cos(a) * 1.4,
          0.35,
          wz + Math.sin(a) * 1.4,
          wx + Math.cos(a) * 1.3,
          2.2,
          wz + Math.sin(a) * 1.3,
          0.14,
        );
      }
      d.cyl("rust", wx, 2.2, wz, 1.6, 1.6, 2.6, 14, { grime: 0.7 });
      for (const y of [2.6, 3.6, 4.5])
        d.cyl("black_metal", wx, y, wz, 1.63, 1.63, 0.1, 14, { top: false });
      d.cyl("rust", wx, 4.8, wz, 1.65, 0.3, 0.7, 14, { grime: 0.6 });
      d.beam("rust", wx + 1.5, 2.6, wz, wx + 2.3, 1.0, wz, 0.12, { round: 6 });
      d.beam("metal", wx + 2.3, 1.0, wz, wx + 2.3, 0.6, wz, 0.1, { round: 6 });
      d.beam("rust", wx - 1.5, 4.2, wz, wx - 3.9, 5.6, wz, 0.1, { round: 6 }); // intake pipe up the façade to a roof catcher
      d.beam("rust", wx - 3.9, 5.6, wz, wx - 3.9, 11.5, wz, 0.1, { round: 6 });
      d.box("metal_dark", wx + 2.3, 0.35, wz + 0.8, 0.3, 1.2, 0.3, {});
      d.beam(
        "metal_dark",
        wx + 2.3,
        1.5,
        wz + 0.8,
        wx + 2.9,
        1.8,
        wz + 0.8,
        0.05,
      );
      for (const bp of [
        [wx + 2.8, wz - 1.2],
        [wx + 3.1, wz + 1.9],
        [wx - 2.4, wz + 1.5],
      ])
        P.barrel(d, bp[0], 0, bp[1], "blue", { collide: true });
      d.panel("atlas_paint", wx, 3.1, wz + 1.66, 2.6, 0.82, 0, {
        rect: K.paint("ts_water", 512, 160),
        off: 0.02,
      });
      d.panel("atlas_paint", wx, 3.1, wz - 1.66, 2.6, 0.82, PI, {
        rect: K.paint("ts_water", 512, 160),
        off: 0.02,
      });
      K.colRot(wx, wz, 3.6, 3.6, 0, 5.4, 0.785, { surface: "metal" });
      glows.add(wx, 5.9, wz, 0x9ad0ff, "m");
      rec.anchor("water", wx + 2.8, 0, wz, -PI / 2);
    }
    // the neon totem at the plaza's edge on Seventh Avenue, readable from the crossing
    const tx = -52.8,
      tz = -253.1;
    {
      d.cyl("rust", tx, 0, tz, 0.35, 0.25, 14, 8, { grime: 0.5 });
      d.cyl("concrete", tx, 0, tz, 1.4, 1.6, 0.8, 10, { grime: 0.6 });
      K.colBox(tx - 1.5, 0, tz - 1.5, tx + 1.5, 3, tz + 1.5);
      ["ts_fizzo", "ts_hioctane", "ts_open", "ts_radroom"].forEach((k, i) => {
        const slot = K.atlases.neon.slots[k];
        const yaw = i * 0.9 + 0.3;
        const w = 5,
          h = (w * slot.h) / slot.w;
        d.panel("atlas_neon", tx, 5 + i * 2.2, tz, w, h, yaw, {
          rect: slot.rect,
          both: true,
          off: 0.4,
        });
        d.box(
          "black_metal",
          tx + Math.sin(yaw) * 0.2,
          4.9 + i * 2.2 - h / 2,
          tz + Math.cos(yaw) * 0.2,
          w + 0.2,
          0.08,
          0.1,
          { yaw },
        );
      });
      d.geo("lit_green", K.T.sphereLo, { x: tx, y: 14.3, z: tz, s: 0.5 });
      d.geo("neon_tube", K.T.torus, {
        x: tx,
        y: 14.3,
        z: tz,
        s: 0.85,
        rx: PI / 2,
        tint: 0x60ff80,
      });
      flick.add(tx, 14.3, tz, 0x80ff90, "m");
      [
        [0xff5a5a, 0],
        [0x5aff8a, 1.6],
        [0xffd25a, 3.2],
        [0x5ab4ff, 4.7],
      ].forEach((q) =>
        spill.add(
          tx + Math.sin(q[1]) * 3.2,
          tz + Math.cos(q[1]) * 3.2,
          q[0],
          4.2,
          { y: GY, i: 0.32 },
        ),
      );
    }
    tarp(-57.6, -258.2, -54.6, -248.0, 3.5, 3.3, 0x7a6a4a); // queue shade beside the purifier
    laundry([-64, 7.6, -266.8], [-58.0, 4.3, -259.1], 301);
    laundry([-64, 7.6, -237.5], [-58.0, 4.3, -239.6], 302);
    P.bulbs(
      d,
      glows,
      [
        [-64, 6.8, -266.5],
        [-51.5, 6.2, -253.1],
        [-64, 6.8, -239.5],
      ],
      {
        spacing: 1.1,
        sag: 0.6,
        colors: [0xff5a5a, 0xffd25a, 0x5aff8a, 0x5ab4ff, 0xff7ae0],
        broken: 0.1,
      },
    );
    for (const t of [
      [-56.1, -256.8],
      [-56.1, -249.6],
    ]) {
      P.table(d, t[0], 0, t[1], 0.1, { w: 1.4, d: 0.8 });
      P.chair(d, t[0], 0, t[1] - 0.9, 0);
      P.chair(d, t[0], 0, t[1] + 0.9, PI, { fallen: t[1] > -252 });
    }

    // ---- NW plaza (A1 set back along Broadway): City Hall and the scrap exchange ----
    {
      const ch = onFace(FACE_NW[0], FACE_NW[1], 11.5, 2.5, X0);
      if (!TOWN) {
        // (the Neon plan: the Mayor sits in the old recruiting station, the Robo-Shop took the exchange's bay)
        shack(ch.x, ch.z, ch.yaw, 11, "ts_cityhall_n");
        d.panel(
          "atlas_paint",
          ch.x + ch.nx * 2.14 + ch.dx * 1.6,
          2.45,
          ch.z + ch.nz * 2.14 + ch.dz * 1.6,
          2.4,
          0.6,
          ch.yaw,
          { rect: K.paint("ts_cityhall", 512, 128), off: 0.03 },
        );
        rec.anchor("mayor", ch.x + ch.nx * 0.2, 0, ch.z + ch.nz * 0.2, ch.yaw);
        rec.anchor(
          "mayor_office",
          ch.x - ch.nx * 0.9 + ch.dx * 1.2,
          0,
          ch.z - ch.nz * 0.9 + ch.dz * 1.2,
          ch.yaw,
        );
        rec.anchor(
          "terminal",
          ch.x - ch.nx * 1.5 - ch.dx * 1.8,
          0,
          ch.z - ch.nz * 1.5 - ch.dz * 1.8,
          ch.yaw,
        );
        rec.anchor(
          "loot1",
          ch.x - ch.nx * 1.3 + ch.dx * 2.0,
          0,
          ch.z - ch.nz * 1.3 + ch.dz * 2.0,
          ch.yaw,
        );
        const cp = onFace(FACE_NW[0], FACE_NW[1], 21.5, 2.5, X0);
        shack(cp.x, cp.z, cp.yaw, 12, "ts_scrip");
        for (const cr of [
          [cp.x + cp.dx * 3.4, cp.z + cp.dz * 3.4, 0.5],
          [cp.x + cp.dx * 3.5 + 0.3, cp.z + cp.dz * 3.5 - 0.9, 1.4],
        ])
          P.crate(d, cr[0], 0, cr[1], 0.8, cr[2]);
      }
      const rb = onFace(FACE_NW[0], FACE_NW[1], 3.0, 2.2, X0);
      P.rubblePile(d, rb.x, rb.z, 1.7, 1.0, { seed: 41 });
      const fb = onFace(FACE_NW[0], FACE_NW[1], TOWN ? 5.0 : 6.5, 3.0, X0);
      P.barrel(d, fb.x, 0, fb.z, "fire", { glows, collide: true });
      P.car(d, -63.6, -285.8, 0.42, { seed: 313, tint: 0x3a3430 });
    }

    // ---- East plaza (B2 set back along Broadway): Doc's clinic, a chem shack, two stalls, a car-hulk wall ----
    {
      const cl = onFace(FACE_E[0], FACE_E[1], 7.5, 2.4, X0);
      if (!TOWN) {
        // (the Neon plan: Doc Broadway's box-office clinic and Annie's gallery took these bays)
        shack(cl.x, cl.z, cl.yaw, 15, null);
        d.panel(
          "atlas_paint",
          cl.x + cl.nx * 2.14,
          3.35,
          cl.z + cl.nz * 2.14,
          3.2,
          0.8,
          cl.yaw,
          { rect: K.paint("ts_clinic", 512, 128), off: 0.03 },
        );
        d.geo("lit_red", K.T.sphereLo, {
          x: cl.x + cl.nx * 2.3 + cl.dx * 1.9,
          y: 2.7,
          z: cl.z + cl.nz * 2.3 + cl.dz * 1.9,
          s: 0.14,
        });
        glows.add(
          cl.x + cl.nx * 2.5 + cl.dx * 1.9,
          2.7,
          cl.z + cl.nz * 2.5 + cl.dz * 1.9,
          0xff4040,
          "m",
        );
        rec.anchor("doctor", cl.x + cl.nx * 0.3, 0, cl.z + cl.nz * 0.3, cl.yaw);
        rec.anchor(
          "loot2",
          cl.x - cl.nx * 1.4 - cl.dx * 1.8,
          0,
          cl.z - cl.nz * 1.4 - cl.dz * 1.8,
          cl.yaw,
        );
        const ck = onFace(FACE_E[0], FACE_E[1], 15.5, 2.4, X0);
        shack(ck.x, ck.z, ck.yaw, 13, "ts_chems");
      }
      const m3 = onFace(FACE_E[0], FACE_E[1], 23.2, 1.9, X0);
      stall("merchant3", m3.x, m3.z, m3.yaw, 0xa06a2a, null);
      const m4 = onFace(FACE_E[0], FACE_E[1], 29.6, 1.9, X0);
      stall("merchant4", m4.x, m4.z, m4.yaw, 0x6a8a3a, "ts_eats");
      if (!TOWN)
        P.car(d, -26.9, -265.2, 0.39, {
          seed: 312,
          flipped: true,
          tint: 0x4a3a30,
        }); // (Neon plan: stall 12 stands here)
      P.barrel(d, -22.6, 0, -249.6, "fire", { glows, collide: true });
    }

    // ---- SW plaza (A3 set back) + SE plaza (B3 set back): the side-door vendors ----
    stall(
      "vendor1",
      -55.0,
      TOWN ? -220.0 : -216.2,
      PI / 2,
      0x8a6a2a,
      "ts_scrip",
    );
    {
      const v2 = onFace(FACE_SE[0], FACE_SE[1], 5.2, 1.9, X0);
      stall("vendor2", v2.x, v2.z, v2.yaw, 0x3a5a7a, null);
    }
    if (!TOWN) {
      // (the Neon plan: the south gate's guard booth + the Pawn Palace door are here)
      P.barrel(d, -52.0, 0, -214.2, "fire", { glows, collide: true });
      for (const cr of [
        [-57.2, -213.4, 0.3],
        [-56.5, -213.6, 1.2],
      ])
        P.crate(d, cr[0], 0, cr[1], 0.8, cr[2]);
    }
    P.skeleton(d, -57.2, 0.02, -219.2, 0.4);

    // ---- day dressing: the plazas read as a crowded market in daylight too (colour, painted boards, carts, fires) ----
    {
      const AWN = ["ts_awn_r", "ts_awn_g", "ts_awn_b"];
      /** Frame helper: local (lx across, lz forward) → world, forward = (sin yaw, cos yaw). */
      const fr = (x, z, yaw) => {
        const c = Math.cos(yaw),
          sn = Math.sin(yaw);
        return (lx, lz) => [x + lx * c + lz * sn, z - lx * sn + lz * c];
      };
      const board = (x, y, z, yaw, key, w) =>
        P.signBoard(
          d,
          "atlas_paint",
          K.paint(key, 512, 128),
          x,
          y,
          z,
          w,
          w / 4,
          yaw,
          { backMat: "wood_dark" },
        );
      const postSign = (x, z, yaw, key, w) => {
        const W = fr(x, z, yaw);
        for (const s of [-1, 1]) {
          const p = W(s * (w / 2 - 0.15), -0.1);
          d.beam("wood", p[0], 0, p[1], p[0], 2.2 + w / 4 + 0.1, p[1], 0.07);
        }
        board(x, 2.2 + w / 8, z, yaw, key, w);
      };
      /** Market cart: plank counter, goods, 4 posts, striped canvas roof, painted board on the back posts. */
      const cart = (x, z, yaw, awn, key, goods) => {
        const W = fr(x, z, yaw),
          rect = K.paint(awn, 128, 128);
        d.box("wood", x, 0, z, 2.6, 0.92, 1.0, { yaw, grime: 0.55 });
        d.box("wood_dark", x, 0.92, z, 2.8, 0.06, 1.15, { yaw, grime: 0.4 });
        K.colRot(x, z, 2.7, 1.1, 0, 0.98, yaw, { surface: "wood" });
        for (const q of [
          [-1.35, -0.9],
          [1.35, -0.9],
          [-1.35, 1.1],
          [1.35, 1.1],
        ]) {
          const p = W(q[0], q[1]);
          d.beam(
            "wood",
            p[0],
            0,
            p[1],
            p[0],
            q[1] < 0 ? 2.75 : 2.3,
            p[1],
            0.06,
          );
        }
        const p0 = W(-1.5, -1.0),
          p1 = W(1.5, -1.0),
          p2 = W(1.5, 1.35),
          p3 = W(-1.5, 1.35);
        d.quad(
          "atlas_paint",
          [p0[0], 2.78, p0[1]],
          [p1[0], 2.78, p1[1]],
          [p2[0], 2.28, p2[1]],
          [p3[0], 2.28, p3[1]],
          { rect, double: true, grime: 0.3 },
        );
        const v0 = W(-1.5, 1.36),
          v1 = W(1.5, 1.36);
        d.quad(
          "atlas_paint",
          [v0[0], 2.29, v0[1]],
          [v1[0], 2.29, v1[1]],
          [v1[0], 1.95, v1[1]],
          [v0[0], 1.95, v0[1]],
          {
            rect: [
              rect[0],
              rect[1],
              rect[2],
              rect[1] + (rect[3] - rect[1]) * 0.25,
            ],
            double: true,
            grime: 0.3,
          },
        );
        const bp = W(0, -0.95);
        board(bp[0], 3.2, bp[1], yaw, key, 2.6);
        const r = K.rng(Math.round(x * 13 + z));
        if (goods === "meat") {
          for (let k = 0; k < 4; k++) {
            const p = W(-1.0 + k * 0.66, 0.9);
            d.beam("black_metal", p[0], 2.3, p[1], p[0], 1.95, p[1], 0.015);
            d.geo("flesh", K.T.sphereLo, {
              x: p[0],
              y: 1.65,
              z: p[1],
              sx: 0.2,
              sy: 0.34,
              sz: 0.16,
            });
          }
          for (let k = 0; k < 3; k++) {
            const p = W(-0.8 + k * 0.8, 0.1);
            d.box("flesh", p[0], 0.98, p[1], 0.5, 0.14, 0.34, {
              yaw: yaw + r(),
              grime: 0.5,
            });
          }
        } else if (goods === "repair") {
          const p = W(-0.6, 0.1);
          d.box("paint_red", p[0], 0.98, p[1], 0.7, 0.3, 0.35, {
            yaw,
            grime: 0.5,
          });
          const q = W(0.6, 0.0);
          d.cyl("metal", q[0], 0.98, q[1], 0.22, 0.2, 0.25, 8, {});
          d.geo("paint_white", K.T.sphereLo, {
            x: q[0],
            y: 1.36,
            z: q[1],
            s: 0.2,
          });
          for (let k = 0; k < 5; k++) {
            const t = W(-1.1 + k * 0.55, -0.35);
            d.box("metal_dark", t[0], 0.98, t[1], 0.18, 0.05, 0.4, {
              yaw: yaw + r() * 0.6,
            });
          }
        } else {
          for (let k = 0; k < 5; k++) {
            const p = W(-1.0 + k * 0.5, 0.05);
            d.box(
              [
                "paint_yellow",
                "paint_green",
                "paint_red",
                "paint_white",
                "paint_blue",
              ][k],
              p[0],
              0.98,
              p[1],
              0.36,
              0.22 + r() * 0.1,
              0.3,
              { yaw: yaw + r() * 0.4, grime: 0.5 },
            );
          }
        }
        const lp = W(0, 0.2);
        d.geo("lit_warm", K.T.sphereLo, { x: lp[0], y: 2.2, z: lp[1], s: 0.1 });
        glows.add(lp[0], 2.15, lp[1], 0xffc070, "s");
        for (const q of [
          [-1.9, 0.3],
          [2.0, -0.2],
        ]) {
          const p = W(q[0], q[1]);
          P.crate(d, p[0], 0, p[1], 0.7, yaw + r());
        }
      };
      /** Striped awning off a wall at (x,z) facing yaw, top at yTop, projecting dep. */
      const awning = (x, z, yaw, w, dep, yTop, awn) => {
        const W = fr(x, z, yaw),
          rect = K.paint(awn, 128, 128);
        const p0 = W(-w / 2, 0),
          p1 = W(w / 2, 0),
          p2 = W(w / 2, dep),
          p3 = W(-w / 2, dep);
        d.quad(
          "atlas_paint",
          [p0[0], yTop, p0[1]],
          [p1[0], yTop, p1[1]],
          [p2[0], yTop - 0.75, p2[1]],
          [p3[0], yTop - 0.75, p3[1]],
          { rect, double: true, grime: 0.35 },
        );
        d.quad(
          "atlas_paint",
          [p3[0], yTop - 0.74, p3[1]],
          [p2[0], yTop - 0.74, p2[1]],
          [p2[0], yTop - 1.02, p2[1]],
          [p3[0], yTop - 1.02, p3[1]],
          {
            rect: [
              rect[0],
              rect[1],
              rect[2],
              rect[1] + (rect[3] - rect[1]) * 0.25,
            ],
            double: true,
            grime: 0.35,
          },
        );
        for (const s of [-1, 1]) {
          const a = W(s * (w / 2 - 0.1), 0),
            b2 = W(s * (w / 2 - 0.1), dep);
          d.beam(
            "black_metal",
            a[0],
            yTop - 1.3,
            a[1],
            b2[0],
            yTop - 0.72,
            b2[1],
            0.025,
          );
        }
      };
      // awnings over the shopfront bays facing the plazas (every other unlit bay)
      for (const bd of buildings) {
        const poly = bd.poly;
        for (let i = 0; i < poly.length; i++) {
          const a = poly[i],
            c = poly[(i + 1) % poly.length];
          const on = outward(poly, i),
            Lg = on[2];
          if (Lg < 4) continue;
          if (
            isSiteXEdge(a, c) ||
            bd.cuts.some(
              (ct) => Math.abs(a[0] - ct) < 0.01 && Math.abs(c[0] - ct) < 0.01,
            )
          )
            continue;
          if (
            Math.abs(a[1] - c[1]) < 0.01 &&
            (Math.abs(a[1] + 312) < 0.5 || Math.abs(a[1] + 212.5) < 0.5)
          )
            continue;
          const dx = (c[0] - a[0]) / Lg,
            dz = (c[1] - a[1]) / Lg,
            face = Math.atan2(on[0], on[1]);
          for (let t = 2.5; t < Lg - 2; t += 5) {
            const px = a[0] + dx * (t + 1.5),
              pz = a[1] + dz * (t + 1.5);
            if (
              bd.hollow &&
              Math.abs(px - RR.x0) < 0.2 &&
              Math.abs(pz - RR.door) < 4.5
            )
              continue;
            if (bd.hollow && px < RR.x0 + 0.3) continue; // under the catwalk: no room
            if (reserved(px, pz)) continue;
            const hv = U.hash2(Math.round(px * 5) + 7, Math.round(pz * 5) - 3);
            if (hv < 0.42) continue;
            awning(
              px + on[0] * 0.05,
              pz + on[1] * 0.05,
              face,
              3.8,
              1.5,
              4.95,
              AWN[Math.floor(hv * 97) % 3],
            );
          }
        }
      }
      // E plaza (9 m): an outer market row — butcher cart, a Power-Noodles-style noodle bar, a repair cart; laundry
      const eT = (t, off) => onFace(FACE_E[0], FACE_E[1], t, off, X0);
      {
        const q = eT(10.8, 6.5);
        cart(q.x, q.z, q.yaw, "ts_awn_r", "ts_p_meat", "meat");
        rec.anchor("butcher", q.x - q.nx * 1.2, 0, q.z - q.nz * 1.2, q.yaw);
      }
      {
        const q = eT(27.4, 6.5);
        cart(q.x, q.z, q.yaw, "ts_awn_b", "ts_p_repair", "repair");
        rec.anchor("repairman", q.x - q.nx * 1.2, 0, q.z - q.nz * 1.2, q.yaw);
      }
      {
        const q = eT(19.3, 6.0),
          x = q.x,
          z = q.z;
        d.cyl("paint_red", x, 0, z, 1.25, 1.25, 1.02, 16, { grime: 0.5 });
        d.cyl("metal", x, 1.02, z, 1.55, 1.55, 0.06, 16, {
          tint: 0xb8b0a0,
          grime: 0.3,
        });
        d.cyl("metal_dark", x, 1.08, z, 0.55, 0.55, 0.4, 10, {});
        d.cyl("metal", x, 1.08, z, 0.35, 0.32, 0.55, 10, { top: false }); // stove + pot
        d.cyl("rust", x, 1.08, z, 0.1, 0.1, 2.1, 6, {});
        d.cyl("fabric", x, 3.1, z, 2.5, 0.2, 0.9, 16, {
          tint: 0xb8261c,
          grime: 0.4,
          bottom: true,
        }); // cone roof
        d.cyl("fabric", x, 2.95, z, 2.5, 2.5, 0.18, 16, {
          tint: 0xe8d8b0,
          grime: 0.3,
          top: false,
        });
        for (let k = 0; k < 6; k++) {
          const a = (k * PI) / 3;
          d.cyl(
            "chrome",
            x + Math.cos(a) * 1.9,
            0,
            z + Math.sin(a) * 1.9,
            0.04,
            0.04,
            0.72,
            6,
            {},
          );
          d.cyl(
            "carpet",
            x + Math.cos(a) * 1.9,
            0.72,
            z + Math.sin(a) * 1.9,
            0.2,
            0.2,
            0.08,
            8,
            { tint: 0xd84040 },
          );
        }
        for (let k = 0; k < 8; k++) {
          const a = (k * PI) / 4 + 0.2;
          d.geo("lit_red", K.T.sphereLo, {
            x: x + Math.cos(a) * 2.35,
            y: 2.72,
            z: z + Math.sin(a) * 2.35,
            sx: 0.16,
            sy: 0.2,
            sz: 0.16,
          });
          if (k % 2 === 0)
            glows.add(
              x + Math.cos(a) * 2.35,
              2.72,
              z + Math.sin(a) * 2.35,
              0xff5030,
              "s",
            );
        }
        for (const s of [0, PI])
          board(
            x + Math.sin(q.yaw + s) * 0.12,
            4.35,
            z + Math.cos(q.yaw + s) * 0.12,
            q.yaw + s,
            "ts_p_noodles",
            2.6,
          );
        d.cyl("rust", x, 3.9, z, 0.06, 0.06, 0.8, 6, {});
        K.colBox(x - 1.3, 0, z - 1.3, x + 1.3, 1.1, z + 1.3, {
          surface: "metal",
        });
        spill.add(x, z, 0xff7040, 3.4, { y: GY, i: 0.35 });
        K.smoke && K.smoke(x, 1.7, z, 0.35);
        rec.anchor("noodles", x - q.nx * 1.55, 0, z - q.nz * 1.55, q.yaw + PI);
        rec.anchor(
          "noodles_customer",
          x + q.nx * 2.2,
          0,
          z + q.nz * 2.2,
          q.yaw + PI,
        );
      }
      {
        const q = eT(15.0, 7.2);
        P.barrel(d, q.x, 0, q.z, "fire", { glows, collide: true });
      }
      {
        const a = eT(4.0, 0.2),
          b2 = eT(4.0, 4.4);
        laundry([a.x, 6.8, a.z], [b2.x, 3.1, b2.z], 303);
      }
      {
        const a = eT(12.0, 0.2),
          b2 = eT(12.0, 4.4);
        laundry([a.x, 7.2, a.z], [b2.x, 3.1, b2.z], 304);
      }
      // W market: a gun shop board on the south stack shack's upper floor, a trash fire, crates, a bench row
      board(-60.2, 6.35, -242.1, PI / 2, "ts_p_guns", 3.0);
      P.barrel(d, -50.9, 0, -246.2, "fire", { glows, collide: true });
      for (const cr of [
        [-57.2, -245.4, 0.2],
        [-57.5, -244.6, 1.1],
        [-57.3, -245.0, 0.6, 0.72],
        [-51.2, -260.8, 0.4],
      ])
        P.crate(d, cr[0], cr[3] || 0, cr[1], 0.7, cr[2]);
      // NW: the barber's post sign by the scrap exchange; SE: IODINE · PRUSSIAN BLUE board behind vendor2
      {
        const q = onFace(FACE_NW[0], FACE_NW[1], TOWN ? 19.6 : 16.5, 1.2, X0);
        postSign(q.x, q.z, q.yaw, "ts_p_hair", 2.4);
        d.cyl(
          "paint_white",
          q.x + q.dx * 1.6,
          0,
          q.z + q.dz * 1.6,
          0.09,
          0.09,
          1.9,
          8,
          {},
        );
        d.cyl(
          "paint_red",
          q.x + q.dx * 1.6,
          1.9,
          q.z + q.dz * 1.6,
          0.11,
          0.11,
          0.16,
          8,
          {},
        );
      }
      {
        const q = onFace(FACE_SE[0], FACE_SE[1], 8.9, 0.8, X0);
        postSign(q.x, q.z, q.yaw, "ts_p_rads", 2.4);
      }
      {
        const q = onFace(FACE_NW[0], FACE_NW[1], TOWN ? 29.6 : 26.5, 2.8, X0);
        P.barrel(d, q.x, 0, q.z, "fire", { glows, collide: true });
      }
    }

    // string lights zig-zagging high over the crossing (≥ 6 m even at the sag)
    const cols = [0xff5a5a, 0xffd25a, 0x5aff8a, 0x5ab4ff, 0xff7ae0];
    P.bulbs(
      d,
      glows,
      [
        [-64.4, 8.6, -282.6],
        [-20, 8.6, -282.6],
      ],
      { spacing: 1.2, sag: 1.2, colors: cols, broken: 0.1 },
    );
    P.bulbs(
      d,
      glows,
      [
        [-64, 8.2, -238],
        [-11.8, 8.2, -238.5],
      ],
      { spacing: 1.2, sag: 1.0, colors: cols, broken: 0.15 },
    );
    P.bulbs(
      d,
      glows,
      [
        [-72.5, 8.6, -300],
        [-48, 5.7, -298.3],
      ],
      { spacing: 1.2, sag: 0.6, colors: cols },
    );
    P.bulbs(
      d,
      glows,
      [
        [-48, 5.7, -298.3],
        [-20, 8.6, -300],
      ],
      { spacing: 1.2, sag: 0.6, colors: cols },
    );
    P.bulbs(
      d,
      glows,
      [
        [-58, 8.0, -222],
        [-34.6, 8.0, -222],
        [-9, 8.0, -222],
      ],
      { spacing: 1.2, sag: 0.9, colors: cols, broken: 0.2 },
    );

    // lamps on the pavements and islands (no colliders), benches against the fronts
    for (const lp of [
      [-68.6, -297],
      [-48.8, -265.8],
      [-48.8, -239.6],
      [-31.2, -289.5],
      [-28.0, -250],
      [-48.8, -224.6],
      [-13.0, -224.4],
    ])
      P.lampPost(d, glows, lp[0], lp[1], 5, { color: 0xffd0a0 });
    if (!TOWN)
      for (const bnc of [
        [-62.5, -236.0, PI],
        [-2, -236.0, PI],
        [-80, -269.0, 0],
        [2, -281.0, PI],
      ])
        P.bench(d, bnc[0], bnc[1], bnc[2]); // (else: 41, validated + anchored)

    // ---- anchors ----
    rec.anchor("entrance", -68.6, 0, -307.5, PI);
    rec.anchor("entrance_south", aS7[0], 0, aS7[1] + 2.5, 0);
    rec.anchor("center", -40, 0, -262, 0);
    rec.anchor("plaza", -56.5, 0, -257.2, 0);
    rec.anchor("stage", rsx, rsh, rsz1 + 1, 0);
    rec.anchor("totem", tx - 2.2, 0, tz, -PI / 2);
    rec.anchor("guard1", -67.8, 0, -309.4, PI);
    rec.anchor("guard2", -47.6, 0, -214.6, 0);
    rec.anchor("guard3", -92.0, 0, -280.4, -PI / 2);
    rec.anchor("guard4", 13.2, 0, -224.4, PI / 2);
    rec.anchor("guard5", -21.6, cwy, -310.6, PI);
    rec.anchor("settler1", -57.8, 0, -248.6, 0);
    rec.anchor("settler2", -21.4, 0, -257.5, -PI / 2);
    rec.anchor("settler3", -53.8, 0, -219.8, 0);
    rec.anchor("settler4", -8.2, 0, -215.4, -PI / 2);
    rec.anchor("settler5", rsx - 1.2, rsh * 0.55, -306.2, 0);
    rec.anchor("settler6", -70.4, 0, -297.5, PI / 2);
    rec.anchor("subway", -56.2, 0, -222.0, 0);
    rec.anchor("loot3", -21.5, cwy, -295.5, 0);
    void aE47;
    void aW42;
    void aSB;

    // ---- THE NEON plan: gates, market, place façades, the Ball, the Crossroads Screen, the nest, the depot (41_neon_town.js);
    //      the enterable places' interior cell + street doors (41_neon_interior.js) ----
    if (TOWN) {
      try {
        K.neonTown({ rec, b, d, ads, glows, flick, spill, refl, P, buildings });
      } catch (e) {
        G.reportError("init:landmarks_a/neon_town", e);
      }
    }
    K.interior("times_square:neon_cell", { rec, P });

    // dev check (shot/survey pages only, ~20 ms): nothing solid below 5 m on the open carriageways → G.LMA.tsRoadHits
    if (G.SHOT || /[?&]survey=/.test(location.search)) {
      const W = G.world,
        hits = [];
      for (let x = -95; x <= 15; x += 0.5)
        for (let z = -312; z <= -212; z += 0.5) {
          if (!L.isRoad(x, z, true)) continue;
          for (const c of W.query(x - 0.01, z - 0.01, x + 0.01, z + 0.01))
            if (
              c.minY < 4.9 &&
              c.maxY > 0.35 &&
              W.pointInCollider(c, x, z, 0)
            ) {
              hits.push([x, z, +c.minY.toFixed(1), +c.maxY.toFixed(1)]);
              break;
            }
        }
      G.LMA.tsRoadHits = hits;
      if (hits.length)
        console.warn(
          "[landmarks_a] Times Square: " +
            hits.length +
            " carriageway cells blocked (incl. other modules): " +
            JSON.stringify(hits.slice(0, 16)),
        );
    }

    b.finish(rec.root);
    ads.finish(rec.root, { cast: false });
    d.finish(rec.root, { lod: 340 });
    const sets = {
      glows: glows.finish(rec.root, { dayOpacity: 0.35, nightOpacity: 1 }),
      flick: flick.finish(rec.root, {
        dayOpacity: 0.3,
        nightOpacity: 1,
        flicker: 0.35,
      }),
      spill: spill.finish(rec.root, { day: 0.05, night: 1 }),
      refl: refl.finish(rec.root, { day: 0.03, night: 1 }),
    };

    // animate screens: switch frame every few seconds with a static burst
    const tex = K.tsScreenTex;
    const sm = K.mat("ts_screen");
    const nt = K.mat("neon_tube");
    let frame = 0,
      next = 3.5;
    K.animate((dt, t, night) => {
      if (t > next) {
        frame = (frame + 1 + Math.floor(Math.random() * 2)) % 4;
        next = t + 3 + Math.random() * 4;
      }
      const glitch = next - t > 2.8 + Math.random() * 0.4;
      const f = glitch ? 1 : frame;
      tex.offset.set((f % 2) * 0.5, f < 2 ? 0.5 : 0);
      sm.color.setScalar(
        (0.6 + 0.4 * night) * (glitch ? 0.6 + Math.random() * 0.4 : 1),
      );
      nt.color.setScalar(0.55 + 0.45 * night);
    });
    // The Neon's power level (setPower): private clones of the shared materials on the square's meshes, applied after every
    // animator above has written the shared state for this frame (41_neon_town.js).
    if (TOWN && K.neonTownPost) {
      try {
        K.neonTownPost(rec, sets);
        if (rec.applyPower) K.animate(() => rec.applyPower());
      } catch (e) {
        G.reportError("init:landmarks_a/neon_town_post", e);
      }
    }
  }

  /** NYC rooftop water tower (wood tank on steel legs, conical roof). */
