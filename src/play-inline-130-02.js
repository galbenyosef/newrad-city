// play-inline-130 02 — the
// Lines 14-338 of readable/play-inline-130.pretty.js (statement-aligned).
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
