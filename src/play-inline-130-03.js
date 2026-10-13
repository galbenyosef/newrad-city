// play-inline-130 03 — pos
// Lines 339-674 of readable/play-inline-130.pretty.js (statement-aligned).
  K.walkTest = function (pts) {
    const W = G.world,
      pos = new THREE.Vector3(pts[0][0], pts[0][1] || 0, pts[0][2]);
    for (let i = 1; i < pts.length; i++) {
      const tg = pts[i];
      let best = 1e9,
        stuck = 0;
      for (let it = 0; it < 1200; it++) {
        const dx = tg[0] - pos.x,
          dz = tg[2] - pos.z,
          dist = Math.hypot(dx, dz);
        if (dist < 0.35) break;
        const st = Math.min(0.12, dist),
          res = W.moveCircle(pos, 0.3, 1.7, (dx / dist) * st, (dz / dist) * st);
        pos.x = res.x;
        pos.z = res.z;
        pos.y = W.groundHeight(pos.x, pos.z, pos.y, 0.3);
        if (dist < best - 0.005) {
          best = dist;
          stuck = 0;
        } else if (++stuck > 30) {
          // who is in the way? (colliders touching a slightly bigger body, above step height)
          const by = [];
          for (const c of W.query(
            pos.x - 1.2,
            pos.z - 1.2,
            pos.x + 1.2,
            pos.z + 1.2,
          ))
            if (
              c.maxY > pos.y + (W.stepHeight || 0.55) &&
              c.minY < pos.y + 1.7 &&
              W.pointInCollider(
                c,
                pos.x + (dx / dist) * 0.25,
                pos.z + (dz / dist) * 0.25,
                0.45,
              )
            )
              by.push(
                (c.lma ? "lma" : c.tag) +
                  " c(" +
                  c.cx.toFixed(1) +
                  "," +
                  c.cz.toFixed(1) +
                  ") " +
                  (2 * c.hx).toFixed(1) +
                  "x" +
                  (2 * c.hz).toFixed(1) +
                  " y" +
                  c.minY.toFixed(1) +
                  ".." +
                  c.maxY.toFixed(1),
              );
          return {
            ok: false,
            leg: i,
            at: [+pos.x.toFixed(1), +pos.y.toFixed(2), +pos.z.toFixed(1)],
            left: +dist.toFixed(1),
            by: by.slice(0, 4),
          };
        }
      }
      if (
        tg[1] !== undefined &&
        tg[1] !== null &&
        Math.abs(pos.y - tg[1]) > 0.6
      )
        return {
          ok: false,
          leg: i,
          at: [+pos.x.toFixed(1), +pos.y.toFixed(2), +pos.z.toFixed(1)],
          why: "wrong level (y " + pos.y.toFixed(2) + ", wanted " + tg[1] + ")",
        };
    }
    return { ok: true };
  };
  K.walkAudit = function () {
    const out = [];
    const checks = K.walkChecks.concat([
      {
        label: "Rad Room (Times Square) door",
        pts: [
          [-24.5, 0, -293.5],
          [-19.0, 0, -293.5],
          [-12.0, 0, -293.5],
        ],
      },
      // walk-in landmark entrances (street → through the portal → the hall) and back out
      {
        label: "Grand Central: 42nd St doors → waiting room → concourse",
        pts: [
          [240, 0, -183.5],
          [236.8, null, -184.3],
          [237.4, null, -188.2],
          [240, null, -190.5],
          [240, null, -199],
          [235.5, null, -212],
          [235.5, null, -230],
          [235.5, null, -212],
          [240, null, -199],
          [240, null, -190.5],
          [237.4, null, -188.2],
          [236.8, null, -184.3],
        ],
      },
      {
        label: "NYPL: Fifth Ave steps → terrace → Astor Hall",
        pts: [
          [112, 0, -162.5],
          [106, null, -162.5],
          [103, 3, -162.5],
          [95, 3, -162.5],
          [103, 3, -162.5],
          [112, 0, -162.5],
        ],
      },
      {
        label: "Radio City: Sixth Ave door → Grand Foyer",
        pts: [
          [31.5, 0, -339.5],
          [28.5, null, -339.5],
          [19.0, null, -341.0],
          [28.5, null, -339.5],
          [31.5, 0, -339.5],
        ],
      },
      {
        label: "Sterling's: 34th St centre door → sales floor",
        pts: [
          [-3, 0, -91.5],
          [-3, null, -86],
          [-1, null, -81.1],
          [-3, null, -86],
          [-3, 0, -91.5],
        ],
      },
      {
        label: "Sterling's: 34th St west door → sales floor",
        pts: [
          [-17, 0, -91.5],
          [-17, null, -84],
          [-17, null, -91.5],
        ],
      },
      {
        label: "Sterling's: 34th St east door → sales floor",
        pts: [
          [11, 0, -91.5],
          [11, null, -84],
          [11, null, -91.5],
        ],
      },
      {
        label: "St Patrick's: Fifth Ave portal → nave → crossing",
        pts: [
          [127, 0, -341.5],
          [134, null, -341.5],
          [150, null, -341.5],
          [164, null, -341.5],
          [134, null, -341.5],
          [127, 0, -341.5],
        ],
      },
      {
        label: "Chrysler: Lexington portal → lobby",
        pts: [
          [286.8, 0, -207.5],
          [292, null, -207.5],
          [305, null, -207.5],
          [292, null, -207.5],
          [286.8, 0, -207.5],
        ],
      },
    ]);
    for (const c of checks) {
      let r;
      try {
        r = K.walkTest(c.pts);
      } catch (e) {
        r = { ok: false, why: String(e) };
      }
      out.push(Object.assign({ label: c.label }, r));
    }
    return out;
  };
  if (G.events) {
    G.events.on("initDone", () => {
      if (G.SHOT || G.SMOKE || /[?&]survey=/.test(location.search))
        try {
          K.auditDoors();
        } catch (e) {
          G.reportError("landmarks_a:doorAudit", e);
        }
    });
    G.events.on("newGame", () => {
      if (G.SHOT || G.SMOKE)
        setTimeout(() => {
          try {
            K.auditDoors();
          } catch (e) {
            /* ignore */
          }
        }, 0);
    });
  }

  // Walk-in entrances must never be blocked by street dressing (the walk audit found a prop on St Patrick's steps, one in
  // the Chrysler portal and two wrecks parked across Grand Central's centre doors). props (order 30, after us) refuses any
  // spot with a solid non-prop collider between 0.45 and 2.6 m — so while it dresses the city we hold thin head-height
  // slabs (2.25–2.55 m: over the player's head) over each approach, and take them away again on initDone.
  const KEEP_CLEAR = [
    [234, -186.5, 246, -178],
    [222.5, -186.5, 229.5, -178],
    [250.5, -186.5, 257.5, -178], // Grand Central: the three 42nd St doors
    [121.5, -347.5, 131, -335.5], // St Patrick's steps + portal
    [282.5, -210.5, 292, -204.5], // Chrysler: Lexington portal
    [26.5, -343.5, 35, -335.5], // Radio City: Sixth Ave door
    [-20, -96, -14, -88.5],
    [-6, -96, 0, -88.5],
    [8, -96, 14, -88.5], // Sterling's: the 34th St revolving doors
    [104, -167.5, 116, -157.5], // NYPL: Fifth Ave steps
  ];
  let keepSlabs = [];
  function keepEntrancesClear() {
    for (const r of KEEP_CLEAR) {
      try {
        keepSlabs.push(
          K.colBox(r[0], 2.25, r[1], r[2], 2.55, r[3], {
            walkable: false,
            tag: "lma_keepclear",
          }),
        );
      } catch (e) {
        /* ignore */
      }
    }
  }
  if (G.events)
    G.events.on("initDone", () => {
      for (const c of keepSlabs) {
        try {
          if (c) G.world.removeCollider(c);
        } catch (e) {
          /* ignore */
        }
      }
      keepSlabs = [];
    });

  async function init() {
    doorsFrom = (G.world.doors || []).length;
    const colFrom = (G.world.colliders || []).length;
    const t0 = performance.now();
    K.initAtlases();
    K.stdFlags();
    fallbackGround();
    const defs = A.defs.slice().sort((a, b) => a.order - b.order);
    const built = [];
    for (const d of defs) {
      const ts = performance.now();
      try {
        d.build(K);
        built.push(d.id);
      } catch (e) {
        G.reportError("init:landmarks_a/" + d.id, e);
      }
      A.timings = A.timings || {};
      A.timings[d.id] = Math.round(performance.now() - ts);
      if (G.events)
        G.events.emit(
          "loadingProgress",
          "Raising " + ((G.LAYOUT.getSite(d.id) || {}).name || d.id) + "…",
          0.3,
        );
    }
    for (const a of Object.values(K.atlases)) a.tex.needsUpdate = true;
    const missing = MINE().filter((id) => !G.landmarks[id]);
    if (missing.length)
      console.warn("[landmarks_a] sites not built: " + missing.join(", "));
    A.initMs = Math.round(performance.now() - t0);
    doorsTo = (G.world.doors || []).length;
    keepEntrancesClear();
    try {
      for (const c of G.world.colliders.slice(colFrom)) c.lma = true;
    } catch (e) {
      /* debug tag only */
    }
  }

  // ------------------------------------------------------------------
  // Dynamic dressing lifecycle
  // ------------------------------------------------------------------
  A.spawned = A.spawned || [];
  function clearDynamic() {
    for (const s of A.spawned) {
      try {
        if (s.object3d && s.object3d.parent)
          s.object3d.parent.remove(s.object3d);
        if (s.interactable) G.world.removeInteractable(s.interactable);
        if (s.collider) G.world.removeCollider(s.collider);
      } catch (e) {
        /* ignore */
      }
    }
    A.spawned.length = 0;
  }
  function spawnDynamic() {
    for (const fn of A.dynamic) {
      try {
        fn();
      } catch (e) {
        G.reportError("event:newGame/landmarks_a", e);
      }
    }
  }
  G.events.on("reset", () => {
    clearDynamic();
    K.stopFx();
  });
  G.events.on("newGame", () => {
    spawnDynamic();
    K.startFx();
  });
  G.events.on("loaded", () => {
    if (!A.spawned.length) spawnDynamic();
    K.startFx();
  });
  G.events.on("initDone", () => {
    K.startFx();
  });

  // ------------------------------------------------------------------
  // Per-frame animation
  // ------------------------------------------------------------------
  let t = 0;
