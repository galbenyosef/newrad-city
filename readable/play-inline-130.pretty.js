/* src/landmarks_a/99_main.js */
/* =====================================================================
 * NEW RAD CITY — landmarks_a / 99_main.js
 * Module registration (order 24). Builds every SITES entry owned by
 * 'landmarks_a' (Midtown), exports G.landmarks.<id> = {id, root, anchors}
 * and G.landmarks.getAnchor(siteId, name), animates neon / clocks / flags
 * / screens, and (re)spawns dynamic dressing on newGame.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.LMA) return;
  const A = G.LMA,
    K = A.kit;

  // Shared namespace: ADD to it, never clobber landmarks_b's entries.
  G.landmarks = G.landmarks && !G.landmarks.__stub ? G.landmarks : {};
  if (typeof G.landmarks.getAnchor !== "function") {
    /** Named anchor of a landmark → a fresh Vector3 (with .yaw) or null. */
    G.landmarks.getAnchor = function (siteId, name) {
      const l = G.landmarks[siteId];
      const v = l && l.anchors ? l.anchors[name] : null;
      if (!v) return null;
      const c = v.clone();
      c.yaw = v.yaw || 0;
      if (v.w !== undefined) {
        c.w = v.w;
        c.h = v.h;
      }
      return c;
    };
  }
  if (typeof G.landmarks.list !== "function") {
    G.landmarks.list = function () {
      return Object.keys(G.landmarks)
        .filter((k) => G.landmarks[k] && G.landmarks[k].root)
        .map((k) => G.landmarks[k]);
    };
  }

  /**
   * Show/hide a static decorative turret (anchors turret1..n at rockefeller / un_hq). Combat can call
   * setStaticTurret(site, name, false) when it spawns a live turret at that anchor. Returns true if found.
   */
  if (typeof G.landmarks.setStaticTurret !== "function") {
    G.landmarks.setStaticTurret = function (siteId, name, visible) {
      const rec = G.landmarks[siteId];
      const t = rec && rec.staticTurrets ? rec.staticTurrets[name] : null;
      if (!t || t.visible === !!visible) return !!t;
      t.visible = !!visible;
      if (!visible) {
        if (t.group.parent) t.group.parent.remove(t.group);
        try {
          if (t.collider) G.world.removeCollider(t.collider);
        } catch (e) {
          /* ignore */
        }
        t.collider = null;
      } else {
        t.parent.add(t.group);
        t.collider = K.colBox(
          t.box[0],
          t.box[1],
          t.box[2],
          t.box[3],
          t.box[4],
          t.box[5],
          { surface: "metal" },
        );
      }
      return true;
    };
  }

  const MINE = () =>
    G.LAYOUT.SITES.filter((s) => s.owner === "landmarks_a").map((s) => s.id);

  /** When the map module is absent, lay a plain ground plate under each of my sites so they don't float. */
  function fallbackGround() {
    if (!G.isStub("map")) return;
    const b = K.builder("fallback_ground", { grime: 0.3 });
    for (const s of G.LAYOUT.SITES) {
      if (s.owner !== "landmarks_a") continue;
      b.box(
        "paving",
        (s.x0 + s.x1) / 2,
        -0.2,
        (s.z0 + s.z1) / 2,
        s.x1 - s.x0 + 40,
        0.2,
        s.z1 - s.z0 + 40,
        { faces: "t", grime: 0.4 },
      );
    }
    b.finish(G.scene, { cast: false });
  }

  // ------------------------------------------------------------------
  // Door audit (shot / smoke / survey runs only): every street↔interior door this module creates is checked both ways —
  // the arrival spot must be clear of geometry (a 0.35 m body), standing on a floor at the target height, facing open
  // space, with the return door right behind it (so "Exit" brings you back to the same façade, facing away from it).
  // Result: G.LMA.doorAudit = [{label, ok, problems[]}] (+ a hidden <pre id="lma-door-audit"> in shot mode).
  // ------------------------------------------------------------------
  let doorsFrom = 0,
    doorsTo = 0;
  K.auditDoors = function () {
    const W = G.world,
      out = [];
    const list = (W.doors || []).slice(doorsFrom, doorsTo);
    const blocked = (x, y, z, r) => {
      for (const c of W.query(
        x - r - 0.5,
        z - r - 0.5,
        x + r + 0.5,
        z + r + 0.5,
      )) {
        if (c.maxY <= y + (W.stepHeight || 0.35) || c.minY >= y + 1.75)
          continue;
        if (W.pointInCollider(c, x, z, r)) return c;
      }
      return null;
    };
    for (const d of list) {
      const t = d.def && d.def.target;
      if (!t) continue;
      const P = [],
        ty = t.y || 0,
        yaw = t.yaw || 0;
      if (blocked(t.x, ty, t.z, 0.35)) P.push("arrival inside geometry");
      const gh = W.groundHeight(t.x, t.z, ty + 0.5, 0.3);
      if (Math.abs(gh - ty) > 0.3)
        P.push(
          "arrival floor at " +
            gh.toFixed(2) +
            " (target y " +
            ty.toFixed(2) +
            ")",
        );
      const fx = -Math.sin(yaw),
        fz = -Math.cos(yaw);
      for (const k of [0.8, 1.6])
        if (blocked(t.x + fx * k, ty, t.z + fz * k, 0.3)) {
          P.push("faces geometry " + k + " m ahead");
          break;
        }
      // the way back: a door of ours whose interactable is within reach of the arrival point, leading back near this door
      const back = list.find(
        (o) =>
          o !== d &&
          o.def &&
          Math.hypot(o.def.pos.x - t.x, o.def.pos.z - t.z) < 2.6 &&
          Math.abs((o.def.pos.y || 0) - 1.5 - ty) < 1.2,
      );
      if (!back) P.push("no return door within 2.6 m of the arrival");
      else {
        const bt = back.def.target;
        if (Math.hypot(bt.x - d.def.pos.x, bt.z - d.def.pos.z) > 3.2)
          P.push(
            "return door leads " +
              Math.round(Math.hypot(bt.x - d.def.pos.x, bt.z - d.def.pos.z)) +
              " m away from this door",
          );
        // walk from the arrival spot to the return door: nothing in the way
        // can the player actually USE it? The core only focuses an interactable in line of sight (colliders), or within
        // 1.2 m of the eye: walk from the arrival toward it until blocked, then test LOS / distance from there.
        {
          const dp = back.def.pos,
            L1 = Math.hypot(dp.x - t.x, dp.z - t.z),
            ux = (dp.x - t.x) / (L1 || 1),
            uz = (dp.z - t.z) / (L1 || 1);
          let px = t.x,
            pz = t.z;
          for (let k = 0.1; k < L1; k += 0.1) {
            const qx = t.x + ux * k,
              qz = t.z + uz * k;
            if (blocked(qx, ty, qz, 0.3)) break;
            px = qx;
            pz = qz;
          }
          const eye = new THREE.Vector3(px, ty + 1.6, pz),
            dd = eye.distanceTo(dp);
          if (dd > (W.interactRange || 3.2) + (back.radius || 1.2))
            P.push("return door out of reach (" + dd.toFixed(1) + " m)");
          else if (
            dd > 1.2 &&
            !W.lineOfSight(eye, dp, {
              ignoreTags: ["interactable_self", "actor"],
            })
          )
            P.push(
              "return door hidden behind geometry (no focus from " +
                dd.toFixed(1) +
                " m)",
            );
        }
        // (the door leaf sits in the façade plane: stop 0.45 m short of it)
        const ex = back.def.pos.x,
          ez = back.def.pos.z,
          L0 = Math.hypot(ex - t.x, ez - t.z),
          n = 8;
        for (let i = 1; i <= n; i++) {
          const q = ((i / n) * Math.max(0, L0 - 0.45)) / Math.max(L0, 1e-3);
          const c = blocked(
            t.x + (ex - t.x) * q,
            ty,
            t.z + (ez - t.z) * q,
            0.25,
          );
          if (c) {
            P.push(
              "path to the return door is blocked (" +
                c.minY.toFixed(1) +
                ".." +
                c.maxY.toFixed(1) +
                " at " +
                (q * L0).toFixed(1) +
                " m)",
            );
            break;
          }
        }
      }
      out.push({
        label: d.def.label,
        at: [+t.x.toFixed(1), +ty.toFixed(1), +t.z.toFixed(1)],
        ok: !P.length,
        problems: P,
      });
    }
    A.doorAudit = out;
    try {
      A.auditExtra = {
        atlases: Object.values(K.atlases).map((a) => [
          a.name,
          a.W,
          a.H,
          Math.max.apply(
            null,
            a.sky.map((q) => q.y),
          ),
        ]),
        warn: (G.warnings || [])
          .filter((w) => /landmarks_a/.test(w))
          .slice(0, 12),
        walk: K.walkAudit ? K.walkAudit() : null,
        anchors: [
          "grand_central",
          "nypl",
          "radio_city",
          "sterlings",
          "st_patricks",
          "chrysler",
          "rockefeller",
          "un_hq",
        ].map((id) => {
          const l = G.landmarks[id];
          if (!l) return [id];
          const o = {};
          for (const k of [
            "entrance",
            "door",
            "portal",
            "door_center",
            "door_west",
            "door_east",
            "entrance_west",
            "entrance_east",
            "steps",
            "terrace",
            "hall",
            "foyer",
            "lobby",
            "concourse",
            "crossing",
            "throne",
            "boss",
            "cashier",
            "escalator",
            "waiting_room",
            "guard1",
          ]) {
            const v = l.anchors[k];
            if (v)
              o[k] = [
                +v.x.toFixed(1),
                +v.y.toFixed(1),
                +v.z.toFixed(1),
                +(v.yaw || 0).toFixed(2),
              ];
          }
          return [id, o];
        }),
        builders: Object.entries(A.buildStats || {})
          .sort((a, b) => b[1].tris - a[1].tris)
          .slice(0, 24)
          .map((e) => [e[0], e[1].tris, e[1].meshes, e[1].shadowTris]),
      };
    } catch (e) {
      /* ignore */
    }
    if (G.SHOT || G.SMOKE) {
      const bad = out.filter((o) => !o.ok);
      if (bad.length)
        console.warn(
          "[landmarks_a] door audit: " +
            bad.length +
            "/" +
            out.length +
            " doors with problems: " +
            JSON.stringify(bad.slice(0, 6)),
        );
      try {
        let pre = document.getElementById("lma-door-audit");
        if (!pre) {
          pre = document.createElement("pre");
          pre.id = "lma-door-audit";
          pre.style.display = "none";
          document.body.appendChild(pre);
        }
        pre.textContent =
          "LMA_AUDIT_BEGIN" +
          JSON.stringify({
            doors: out,
            roadHits: (A.tsRoadHits || []).length,
            roadHitList: (A.tsRoadHits || []).slice(0, 40),
            extra: A.auditExtra || null,
          }) +
          "LMA_AUDIT_END";
      } catch (e) {
        /* ignore */
      }
    }
    return out;
  };
  // Walk audit: a simulated player (0.3 m body, the core's moveCircle + groundHeight, stepping ≤ stepHeight) walks each
  // entrance route leg by leg; a route fails where the body gets stuck. Routes: K.walkChecks [{label, pts:[[x,y,z],...]}].
  K.walkChecks = K.walkChecks || [];
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
  function update(dt, realDt) {
    t += realDt;
    const night = K.night();
    K.updateGlows(t, night);
    K.updateNightMats(night);
    if (K.flagMat) K.flagMat.userData.uTime.value = t;
    // Billboards glow brighter at night (floodlit)
    const ads = K.mat("atlas_ads");
    if (ads.emissiveIntensity !== undefined)
      ads.emissiveIntensity = 0.12 + night * 0.55;
    const neon = K.mat("atlas_neon");
    const nf = 0.45 + night * 0.55;
    neon.color.setScalar(nf * (0.93 + 0.07 * Math.sin(t * 50)));
    for (const fn of A.animators) {
      try {
        fn(dt, t, night, realDt);
      } catch (e) {
        G.reportError("update:landmarks_a", e);
        A.animators.splice(A.animators.indexOf(fn), 1);
        break;
      }
    }
  }

  G.registerModule({ name: "landmarks_a", order: 24, init, update });
})();
