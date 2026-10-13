// play-inline-85 02 — lot
// Lines 218-423 of readable/play-inline-85.pretty.js (statement-aligned).
  function planLots() {
    const lots = [];
    const blocks = subBlocks();
    for (const bl of blocks) {
      const cx = (bl.x0 + bl.x1) / 2,
        cz = (bl.z0 + bl.z1) / 2;
      // blocks cut by Broadway / a roundabout are filled with polygon lots flush to the kerb (41_fronts.js)
      if (M.claimCutBlock && M.claimCutBlock(bl)) continue;
      const r = M.rng("blk" + Math.round(bl.x0) + "," + Math.round(bl.z0));
      const W = bl.x1 - bl.x0,
        D = bl.z1 - bl.z0;
      const lot0 = lots.length;
      const d = bl.brooklyn ? "brooklyn" : styleFor(cx, cz);
      const mk = (x0, z0, x1, z1, kind, extra) => {
        const lcx = (x0 + x1) / 2,
          lcz = (z0 + z1) / 2;
        const dist = bl.brooklyn ? "brooklyn" : styleFor(lcx, lcz);
        if (!dist) return false;
        const lot = Object.assign(
          {
            x0,
            z0,
            x1,
            z1,
            kind,
            district: dist,
            block: bl,
            front: {
              n: Math.abs(z0 - bl.z0) < 0.01,
              s: Math.abs(z1 - bl.z1) < 0.01,
              w: Math.abs(x0 - bl.x0) < 0.01,
              e: Math.abs(x1 - bl.x1) < 0.01,
            },
          },
          extra || {},
        );
        if (lotValid(x0, z0, x1, z1)) {
          lots.push(lot);
          return true;
        } else if (kind !== "brownstone" && x1 - x0 > 14 && z1 - z0 > 14) {
          // pull back only the side(s) that hit something (shore, a landmark, an open space) so the
          // remaining street fronts stay flush with the kerb (round 1: was a 4 m shrink on all four sides)
          const fit = fitLot(x0, z0, x1, z1, 7);
          if (fit) {
            lot.front = {
              n: lot.front.n && fit.z0 === z0,
              s: lot.front.s && fit.z1 === z1,
              w: lot.front.w && fit.x0 === x0,
              e: lot.front.e && fit.x1 === x1,
            };
            if (fit.z0 !== z0) lot.faceN = false;
            if (fit.z1 !== z1) lot.faceS = false;
            lot.x0 = fit.x0;
            lot.x1 = fit.x1;
            lot.z0 = fit.z0;
            lot.z1 = fit.z1;
            lots.push(lot);
            return true;
          }
        }
        return false;
      };
      if (!d) {
        // shoreline blocks whose centre is in the water: sample a few land lots
        for (const [fx0, fx1] of [
          [0, 0.5],
          [0.5, 1],
        ])
          for (const [fz0, fz1] of [
            [0, 0.5],
            [0.5, 1],
          ]) {
            const x0 = bl.x0 + W * fx0,
              x1 = bl.x0 + W * fx1,
              z0 = bl.z0 + D * fz0,
              z1 = bl.z0 + D * fz1;
            const dd = styleFor((x0 + x1) / 2, (z0 + z1) / 2);
            if (!dd) continue;
            mk(x0, z0, x1, z1, kindFor(dd, r));
          }
        continue;
      }
      if (d === "midtown" || d === "financial_district") {
        const parts = splitLen(W, 18, 34, r);
        let x = bl.x0;
        for (const w of parts) {
          if (D > 48) {
            const dz = splitLen(D, 22, 36, r);
            let z = bl.z0;
            for (const h of dz) {
              mk(x, z, x + w, z + h, r() < 0.8 ? "tower" : "commercial");
              z += h;
            }
          } else
            mk(x, bl.z0, x + w, bl.z1, r() < 0.78 ? "tower" : "commercial");
          x += w;
        }
      } else if (d === "midtown_south") {
        const parts = splitLen(W, 14, 26, r);
        let x = bl.x0;
        for (const w of parts) {
          if (D > 26 && r() < 0.5) {
            const h = D * r.range(0.42, 0.58);
            mk(x, bl.z0, x + w, bl.z0 + h, "commercial");
            mk(
              x,
              bl.z0 + h,
              x + w,
              bl.z1,
              r() < 0.5 ? "commercial" : "tenement",
            );
          } else
            mk(x, bl.z0, x + w, bl.z1, r() < 0.25 ? "tower" : "commercial");
          x += w;
        }
      } else if (
        d === "upper_west_side" ||
        d === "upper_east_side" ||
        d === "greenwich_village"
      ) {
        const village = d === "greenwich_village";
        // corner buildings on the avenue ends, rowhouses in between on both street faces
        const endW = village ? r.range(10, 16) : r.range(16, 24);
        const hasW = W > 40,
          hasE = W > 40;
        let xa = bl.x0,
          xb = bl.x1;
        if (hasW) {
          mk(
            bl.x0,
            bl.z0,
            bl.x0 + endW,
            bl.z1,
            village ? (r() < 0.6 ? "tenement" : "commercial") : "apartment",
          );
          xa += endW;
        }
        if (hasE) {
          const ew = village ? r.range(10, 16) : r.range(16, 24);
          mk(
            bl.x1 - ew,
            bl.z0,
            bl.x1,
            bl.z1,
            village ? (r() < 0.6 ? "tenement" : "apartment") : "apartment",
          );
          xb -= ew;
        }
        if (D > 60 && !village) {
          // very deep blocks: a courtyard apartment block in the middle
          mk(xa + 2, bl.z0 + 16, xb - 2, bl.z1 - 16, "apartment", {
            courtyard: true,
          });
        }
        const rowD = Math.min(15, D / 2 - 1.5);
        let x = xa;
        const rowParts = splitLen(xb - xa, 5.8, 8.2, r);
        for (const w of rowParts) {
          const kind = village
            ? r() < 0.72
              ? "brownstone"
              : "tenement"
            : r() < 0.8
              ? "brownstone"
              : "tenement";
          mk(x, bl.z0, x + w, bl.z0 + rowD, kind, { faceN: true });
          x += w;
        }
        x = xa;
        for (const w of splitLen(xb - xa, 5.8, 8.2, r)) {
          const kind = village
            ? r() < 0.72
              ? "brownstone"
              : "tenement"
            : r() < 0.8
              ? "brownstone"
              : "tenement";
          mk(x, bl.z1 - rowD, x + w, bl.z1, kind, { faceS: true });
          x += w;
        }
      } else if (d === "brooklyn") {
        if (r() < 0.45)
          mk(bl.x0 + 1, bl.z0 + 1, bl.x1 - 1, bl.z1 - 1, "warehouse");
        else {
          const h = D * r.range(0.4, 0.6);
          mk(bl.x0 + 1, bl.z0 + 1, bl.x1 - 1, bl.z0 + h, "warehouse");
          mk(
            bl.x0 + 1,
            bl.z0 + h + 1,
            bl.x1 - 1,
            bl.z1 - 1,
            r() < 0.8 ? "warehouse" : "tenement",
          );
        }
      }
      if (d) fillFrontGaps(bl, lots, lot0, mk, d);
    }
    return lots;
  }
  /**
   * Round 2: close the holes in the street wall. The planners drop lots that clip a site / open space / the
   * shore (brownstone rows are dropped outright), which left bare paved strips along many kerbs. Walk each block
   * edge 1.5 m inside the building line; every uncovered run ≥ 6 m that is not a site / open space / park / water /
   * street gets an infill building flush to that kerb (depth 14 → 6 m until it fits), kind by district.
   * Deterministic, no draws from the block rng (hash-based kinds), so every existing building stays as it was.
   */
