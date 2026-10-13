// play-inline-163 02 — pos
// Lines 16-146 of readable/play-inline-163.pretty.js (statement-aligned).
  const P = G._pu;

  // --------------------------------------------------------------
  // Combat's location spawns. Combat already places interior spawns on our spawn1..6 anchors
  // (poiAnchorSpawn → G.pois.getAnchor) with line-of-sight-checked jitter, so they are left where combat put
  // them. This pass only (a) puts the boss types on the `boss` anchor and names them, and (b) rescues an actor
  // that ended up somewhere invalid (inside a collider / over the cell void) by moving it to the nearest free
  // spawn anchor. (Round 2: the old per-type relocation table re-clustered every enemy onto hard-coded lists.)
  // --------------------------------------------------------------
  const BOSS = {
    amnh: { type: "ripjaw", name: "Ripjaw Matriarch", hp: 1.25 },
    dakota: { type: "maniac_bruiser", name: "The Superintendent", hp: 1 },
  };
  const KEYS = ["amnh", "dakota", "tiffany", "plaza_hotel", "carnegie_hall"];
  function invalidSpot(a) {
    const W = G.world,
      p = a.pos;
    const gy = W.groundHeight(p.x, p.z, p.y + 0.6, 0.2);
    if (gy < p.y - 2.5) return true; // nothing under its feet (cell void)
    const feet = p.y + W.stepHeight,
      head = p.y + 1.6;
    for (const c of W.query(p.x - 1, p.z - 1, p.x + 1, p.z + 1)) {
      if (c.maxY <= feet || c.minY >= head || c.tag === "poi_guard") continue;
      if (W.pointInCollider(c, p.x, p.z, -0.05)) return true; // centre inside a wall / furniture block
    }
    return false;
  }
  function place(a, an) {
    a.pos.set(an.x, an.y + 0.05, an.z);
    if (a.char && a.char.root && a.char.root.position !== a.pos)
      a.char.root.position.copy(a.pos);
    if (typeof an.yaw === "number") a.yaw = an.yaw;
  }
  function fixSpawns() {
    if (G.isStub("actors") || typeof G.actors.list !== "function") return;
    for (const key of KEYS) {
      if (!P.inCell(key)) continue;
      const poi = G.pois && G.pois[key];
      if (!poi) continue;
      const bs = BOSS[key];
      for (const a of G.actors.list()) {
        if (!a || a.dead || a._puPlaced || a.group !== key || !a.pos) continue;
        a._puPlaced = true;
        if (
          bs &&
          a.type === bs.type &&
          !G.actors
            .list()
            .some((o) => o && o !== a && !o.dead && o.name === bs.name)
        ) {
          const an = poi.anchors.boss;
          if (an) {
            place(a, an);
            a.home = { x: an.x, z: an.z, r: 8 };
          }
          a._puBoss = true;
          a.name = bs.name;
          a.isBoss = true;
          if (bs.hp !== 1) {
            a.maxHp = Math.round((a.maxHp || 300) * bs.hp);
            a.hp = a.maxHp;
          }
          continue;
        }
        if (!invalidSpot(a)) continue;
        let best = null,
          bd = 1e9;
        for (let k = 1; k <= 6; k++) {
          const an = poi.anchors["spawn" + k];
          if (!an) continue;
          const d =
            (an.x - a.pos.x) ** 2 +
            ((an.y - a.pos.y) * 3) ** 2 +
            (an.z - a.pos.z) ** 2;
          if (d < bd) {
            bd = d;
            best = an;
          }
        }
        if (best) {
          place(a, best);
          a.home = { x: best.x, z: best.z, r: 10 };
          P.rescued = (P.rescued || 0) + 1;
        }
      }
    }
  }

  // --------------------------------------------------------------
  // Hooks (lists defined by 90_main.js)
  // --------------------------------------------------------------
  P.onBuilt.push(() => {
    // clutter & decay pass over the finished interiors (96_decay_interior.js → G.poiClutter)
    {
      const t0 = performance.now();
      P.safe("decay", () => P.decay && P.decay());
      P.buildTimes = P.buildTimes || {};
      P.buildTimes.decay = Math.round(performance.now() - t0);
    }
    // interiors start hidden
    for (const it of P.interiors) it.root.visible = false;
  });
  P.onInitDone.push(() => {
    P.safe("voidGuard", () => {
      if (!G.poiVoidGuard) return;
      const doors = (G.world.doors || []).reduce((a, d) => {
        const f = d.def || d;
        if (f.pos) a.push(f.pos);
        if (f.target) a.push(f.target);
        return a;
      }, []);
      for (const it of P.interiors)
        G.poiVoidGuard(it.ox, it.oz, { parent: it.root, doors });
    });
  });
  P.preUpdate.push((pp) => {
    if (pp)
      for (const it of P.interiors) {
        const vis =
          Math.abs(pp.x - it.ox) < 170 && Math.abs(pp.z - it.oz) < 170;
        if (it.root.visible !== vis) it.root.visible = vis;
      }
  });
  let fixT = 0;
  P.midUpdate.push((pp, dt, realDt) => {
    fixT -= realDt;
    if (fixT <= 0) {
      fixT = 0.25;
      if (pp && pp.x >= G.LAYOUT.INTERIOR_X_MIN) P.safe("fixSpawns", fixSpawns);
    }
  });
