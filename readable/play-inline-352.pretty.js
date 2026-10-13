/* src/poi_civic/95_probe.js */
/* =====================================================================
 * NEW RAD CITY — poi_civic / 95_probe.js
 * DEBUG-ONLY walkability probe (inactive unless the page URL has
 * ?pcprobe=1). Verifies, for every Civic Center POI, in code:
 *   * the street door is reachable on foot from the carriageway (props,
 *     railings, sandbags do not block it) and is interactable from there;
 *   * the interior spawn stands on a floor, clear of geometry, facing
 *     into the room (≥ 2 m of clear view ahead);
 *   * the interior exit door is reachable from the spawn;
 *   * the street spawn after leaving stands clear, on the ground, just
 *     outside the same entrance and facing away from the door;
 *   * every container / terminal / note / gate / quest anchor / named NPC
 *     is reachable (first with every gate closed — listing what sits
 *     behind a gate — then with every gate open: all must be reachable).
 * Result: <pre id="pc-probe"> with PCPROBE_BEGIN{json}PCPROBE_END.
 * Walk model = the player's: moveCircle r 0.34 h 1.78, step 0.55, fall
 * when the floor drops > 0.45 m; interaction = eye within 3.2 m + radius
 * and a clear line of sight.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pc) return;
  let on = false;
  try {
    on = new URLSearchParams(location.search).has("pcprobe");
  } catch (e) {
    /* */
  }
  if (!on) return;
  const PC = G._pc;
  const R = 0.34,
    H = 1.78,
    EYE = 1.64,
    STEP = 0.4;

  /** Flood fill of walkable positions from start, limited to a box. */
  function flood(start, box, maxNodes) {
    const W = G.world;
    const nodes = [],
      seen = new Set(),
      q = [];
    // keys relative to the start (a start on a half-cell made rounding collide neighbouring rows)
    const key = (x, z, y) =>
      Math.round((x - start.x) / STEP) +
      "," +
      Math.round((z - start.z) / STEP) +
      "," +
      Math.round(y * 2);
    const y0 = W.groundHeight(start.x, start.z, (start.y || 0) + 0.3, R * 0.6);
    q.push({ x: start.x, z: start.z, y: y0 });
    seen.add(key(start.x, start.z, y0));
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
    const pos = new THREE.Vector3();
    while (q.length && nodes.length < maxNodes) {
      const n = q.shift();
      nodes.push(n);
      for (const [dx, dz] of dirs) {
        const tx = n.x + dx * STEP,
          tz = n.z + dz * STEP;
        if (tx < box.x0 || tx > box.x1 || tz < box.z0 || tz > box.z1) continue;
        pos.set(n.x, n.y, n.z);
        // two half steps (the player moves in ≤ 0.2 m increments at walking speed)
        let r = W.moveCircle(pos, R, H, (dx * STEP) / 2, (dz * STEP) / 2);
        pos.x = r.x;
        pos.z = r.z;
        let gy = W.groundHeight(pos.x, pos.z, n.y + 0.05, R * 0.6);
        if (gy > n.y - 0.45) pos.y = gy;
        r = W.moveCircle(pos, R, H, tx - pos.x, tz - pos.z);
        if (Math.abs(r.x - tx) + Math.abs(r.z - tz) > 0.06) continue;
        gy = W.groundHeight(tx, tz, pos.y + 0.05, R * 0.6);
        if (gy < -20) continue;
        const k = key(tx, tz, gy);
        if (seen.has(k)) continue;
        seen.add(k);
        q.push({ x: tx, z: tz, y: gy, fell: gy < n.y - 0.45 ? n.y - gy : 0 });
      }
    }
    return { nodes, capped: nodes.length >= maxNodes };
  }

  /** Can the player activate something at p (radius rad) from one of the nodes? → the best node or null. */
  function reach(nodes, p, rad, range) {
    const lim = (range || 3.2) + (rad || 0.8);
    const eye = new THREE.Vector3();
    let tried = 0,
      best = null,
      bd = 1e9;
    const cands = [];
    for (const n of nodes) {
      const dx = n.x - p.x,
        dz = n.z - p.z,
        dy = n.y + EYE - p.y;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d <= lim) cands.push([d, n]);
    }
    cands.sort((a, b) => a[0] - b[0]);
    const W = G.world,
      pp = new THREE.Vector3();
    const ok = (x, y, z) => {
      eye.set(x, y + EYE, z);
      const d = eye.distanceTo(p);
      return d <= lim &&
        (d < 1.2 ||
          W.lineOfSight(eye, p, { ignoreTags: ["interactable_self", "actor"] }))
        ? d
        : -1;
    };
    for (let [, n] of cands) {
      if (tried++ > 40) break;
      let d = ok(n.x, n.y, n.z);
      if (d < 0) {
        // walk up to it like a player would (press against the furniture), then look again
        pp.set(n.x, n.y, n.z);
        for (let k = 0; k < 24; k++) {
          const dx = p.x - pp.x,
            dz = p.z - pp.z,
            L = Math.hypot(dx, dz);
          if (L < 0.05) break;
          const r = W.moveCircle(pp, R, H, (dx / L) * 0.08, (dz / L) * 0.08);
          if (Math.hypot(r.x - pp.x, r.z - pp.z) < 0.01) break;
          pp.x = r.x;
          pp.z = r.z;
          const gy = W.groundHeight(pp.x, pp.z, pp.y + 0.05, R * 0.6);
          if (gy > pp.y - 0.45 && gy < pp.y + 0.56) pp.y = gy;
          else break;
        }
        d = ok(pp.x, pp.y, pp.z);
        if (d >= 0) n = { x: pp.x, y: pp.y, z: pp.z };
      }
      if (d >= 0) {
        bd = d;
        best = n;
        break;
      }
    }
    return best
      ? {
          x: +best.x.toFixed(1),
          y: +best.y.toFixed(2),
          z: +best.z.toFixed(1),
          d: +bd.toFixed(2),
        }
      : null;
  }

  /** Spawn-point sanity: on a floor, capsule clear, clear view ahead. */
  function spawnCheck(t, label) {
    const W = G.world,
      out = {
        label,
        at: [+t.x.toFixed(2), +(t.y || 0).toFixed(2), +t.z.toFixed(2)],
        yaw: +(t.yaw || 0).toFixed(2),
        problems: [],
      };
    const gy = W.groundHeight(t.x, t.z, (t.y || 0) + 1.0, R);
    if (Math.abs(gy - (t.y || 0)) > 0.35)
      out.problems.push(
        "floor at " + gy.toFixed(2) + " (target y " + (t.y || 0) + ")",
      );
    const r = W.moveCircle(new THREE.Vector3(t.x, gy, t.z), R, H, 0, 0);
    if (r.blocked)
      out.problems.push(
        "capsule overlaps geometry (pushed to " +
          r.x.toFixed(2) +
          "," +
          r.z.toFixed(2) +
          ")",
      );
    const fwd = new THREE.Vector3(
      -Math.sin(t.yaw || 0),
      0,
      -Math.cos(t.yaw || 0),
    );
    const hit = W.raycast(new THREE.Vector3(t.x, gy + EYE, t.z), fwd, 20, {
      ignoreTags: ["actor"],
    });
    out.clearAhead = hit ? +hit.dist.toFixed(2) : 20;
    if (out.clearAhead < 2)
      out.problems.push("view blocked " + out.clearAhead + " m ahead");
    return out;
  }

  function doorsOf(ctx) {
    const inn = ctx.doors.find((d) => d.def && /_in$/.test(d.def.id || ""));
    const outd = ctx.doors.find((d) => d.def && /_out$/.test(d.def.id || ""));
    return { inn, outd };
  }

  /** Debug: walk a straight line (local coords) and report the first blocking colliders. */
  function walkLine(ctx, a, b) {
    const W = G.world,
      O = ctx.O;
    const pos = new THREE.Vector3(O.x + a[0], 0, O.z + a[2]);
    pos.y = W.groundHeight(pos.x, pos.z, O.y + a[1] + 0.3, R * 0.6);
    const tx = O.x + b[0],
      tz = O.z + b[2];
    const out = { from: a, to: b, steps: 0 };
    for (let i = 0; i < 600; i++) {
      const dx = tx - pos.x,
        dz = tz - pos.z,
        d = Math.hypot(dx, dz);
      if (d < 0.1) {
        out.ok = true;
        break;
      }
      const st = Math.min(0.2, d),
        sx = (dx / d) * st,
        sz = (dz / d) * st;
      const r = W.moveCircle(pos, R, H, sx, sz);
      if (Math.abs(r.x - (pos.x + sx)) + Math.abs(r.z - (pos.z + sz)) > 0.05) {
        const feet = pos.y + W.stepHeight,
          head = pos.y + H,
          qx = pos.x + sx,
          qz = pos.z + sz;
        out.blockedAt = [
          +(pos.x - O.x).toFixed(2),
          +(pos.y - O.y).toFixed(2),
          +(pos.z - O.z).toFixed(2),
        ];
        out.by = W.query(qx - R - 1, qz - R - 1, qx + R + 1, qz + R + 1)
          .filter(
            (c) =>
              c.maxY > feet && c.minY < head && W.pointInCollider(c, qx, qz, R),
          )
          .map((c) => ({
            tag: c.tag,
            x: [+(c.bb.x0 - O.x).toFixed(2), +(c.bb.x1 - O.x).toFixed(2)],
            z: [+(c.bb.z0 - O.z).toFixed(2), +(c.bb.z1 - O.z).toFixed(2)],
            y: [+(c.minY - O.y).toFixed(2), +(c.maxY - O.y).toFixed(2)],
            walk: c.walkable,
          }));
        break;
      }
      pos.x = r.x;
      pos.z = r.z;
      const gy = W.groundHeight(pos.x, pos.z, pos.y + 0.05, R * 0.6);
      pos.y = gy;
      out.steps++;
    }
    out.end = [
      +(pos.x - O.x).toFixed(2),
      +(pos.y - O.y).toFixed(2),
      +(pos.z - O.z).toFixed(2),
    ];
    return out;
  }
  // exterior walkways that must stay open (world coords): the Municipal arch (Worth St ↔ Chambers St), the police
  // steps and garden gate, St. Pat's yard gates
  const STREET_PATHS = {
    police_hq: [
      [
        [160, 0, 578],
        [160, 1.5, 569.5],
      ],
      [
        [135.2, 0, 540.5],
        [135.2, 0.16, 545],
      ],
    ],
    municipal_building: [
      [
        [160, 0, 585.5],
        [160, 0, 621],
      ],
      [
        [157, 0, 585.5],
        [157, 0, 610],
      ],
      [
        [163, 0, 610],
        [163, 0, 585.5],
      ],
      [
        [159.5, 0, 615],
        [159.5, 0, 621],
      ],
    ], // the barricade (z 612.5) leaves x 158.4..161.6
    old_st_patricks: [
      [
        [222, 0, 485.2],
        [217.5, 0, 485.2],
      ],
      [
        [217.5, 0, 485.2],
        [217.5, 0, 478],
      ],
      [
        [238, 0, 487],
        [238, 0.12, 483.4],
      ],
    ],
  };
  const MAPS = {
    municipal_building: [-20, 20, -30, 1],
    police_hq: [-32, 14, -30, 1],
  };
  const PATHS = {
    police_hq: [
      [
        [-6, 0, -15],
        [-8.1, 0, -17.3],
      ],
      [
        [-8.1, 0, -17.3],
        [-3.1, 5, -22.9],
      ],
      [
        [-26, 0, -15.2],
        [-12, -5, -15],
      ],
      [
        [26, 0, -15],
        [42, -5, -15],
      ],
      [
        [-12, 0, -15],
        [-12, 0, -22],
      ],
      [
        [-12, 0, -22],
        [-26, 0, -22.6],
      ],
    ],
    municipal_building: [
      [
        [0, 0, -12],
        [0, 0, -22],
      ],
    ],
    old_st_patricks: [
      [
        [0, 0.6, -34],
        [8, 0.6, -35],
      ],
      [
        [8, 0.6, -35],
        [13, 0.6, -35],
      ],
      [
        [13, 0.6, -35],
        [16.5, 0.6, -33],
      ],
      [
        [16.5, 0.6, -33],
        [16.5, -5, -47],
      ],
    ],
  };
  const STREET = {
    police_hq: { x: 160, z: 580 },
    municipal_building: { x: 160, z: 580 },
    old_st_patricks: { x: 238, z: 490 },
  };

  function probe(ctx) {
    const res = { id: ctx.id, problems: [] };
    const { inn, outd } = doorsOf(ctx);
    if (!inn || !outd) {
      res.problems.push("missing door");
      return res;
    }
    const t0 = performance.now();
    // ---- street side ----
    const st = STREET[ctx.id] || { x: outd.def.target.x, z: outd.def.target.z };
    const ext = flood(
      { x: st.x, y: 0, z: st.z },
      { x0: st.x - 50, x1: st.x + 50, z0: st.z - 50, z1: st.z + 50 },
      120000,
    );
    res.streetNodes = ext.nodes.length;
    res.doorFromStreet = reach(ext.nodes, inn.def.pos, inn.radius || 1.3);
    if (!res.doorFromStreet)
      res.problems.push(
        "street door not reachable from the carriageway at " +
          st.x +
          "," +
          st.z,
      );
    // the door must face the street: its position must be visible from the street spawn
    const exitSpawn = spawnCheck(outd.def.target, "street spawn after leaving");
    res.exitSpawn = exitSpawn;
    for (const p of exitSpawn.problems) res.problems.push("street spawn: " + p);
    const toDoor = new THREE.Vector3(
      inn.def.pos.x - outd.def.target.x,
      0,
      inn.def.pos.z - outd.def.target.z,
    );
    res.exitDistToDoor = +toDoor.length().toFixed(2);
    const f = new THREE.Vector3(
      -Math.sin(outd.def.target.yaw || 0),
      0,
      -Math.cos(outd.def.target.yaw || 0),
    );
    res.exitFacingAwayDot = +(-f.dot(toDoor.clone().normalize())).toFixed(2);
    if (res.exitFacingAwayDot < 0.5)
      res.problems.push("street spawn does not face away from the door");
    if (res.exitDistToDoor > 4.5)
      res.problems.push(
        "street spawn is " + res.exitDistToDoor + " m from the door",
      );
    const exitOnStreet = ext.nodes.some(
      (n) =>
        Math.abs(n.x - outd.def.target.x) < 0.5 &&
        Math.abs(n.z - outd.def.target.z) < 0.5,
    );
    if (!exitOnStreet)
      res.problems.push("street spawn is not connected to the street on foot");
    // ---- interior ----
    const entry = spawnCheck(inn.def.target, "interior spawn");
    res.entrySpawn = entry;
    for (const p of entry.problems) res.problems.push("interior spawn: " + p);
    const O = ctx.O,
      box = { x0: O.x - 150, x1: O.x + 150, z0: O.z - 150, z1: O.z + 150 };
    const closed = flood(inn.def.target, box, 400000);
    res.interiorNodes = closed.nodes.length;
    res.interiorCapped = closed.capped;
    res.falls = closed.nodes
      .filter((n) => n.fell > 1.2)
      .slice(0, 8)
      .map((n) => [
        +n.x.toFixed(1),
        +n.y.toFixed(1),
        +n.z.toFixed(1),
        +n.fell.toFixed(1),
      ]);
    res.exitReachable = !!reach(closed.nodes, outd.def.pos, outd.radius || 1.3);
    if (!res.exitReachable)
      res.problems.push("interior exit not reachable from the interior spawn");
    // targets
    const targets = [];
    for (const l of ctx.loot) {
      if (l.world || l.x > G.LAYOUT.INTERIOR_X_MIN === false) {
        /* exterior dressing */
      }
      if (l.x < G.LAYOUT.INTERIOR_X_MIN) continue;
      if (
        l.container === false &&
        l.type !== "terminal" &&
        l.type !== "skeleton"
      )
        continue;
      if (l.type === "skeleton" || l.type === "bones") continue;
      targets.push({
        what: l.type + (l.name ? ' "' + l.name + '"' : ""),
        p: new THREE.Vector3(l.x, l.y + (l.wall ? 0 : 0.7), l.z),
        rad: 0.9,
      });
    }
    for (const n of ctx.notes)
      if (n.x >= G.LAYOUT.INTERIOR_X_MIN)
        targets.push({
          what: "note " + n.id,
          p: new THREE.Vector3(n.x, n.y + 0.05, n.z),
          rad: 0.6,
        });
    for (const id in ctx.gates || {}) {
      const g = ctx.gates[id];
      targets.push({
        what: "gate " + id,
        p: new THREE.Vector3(g.closedPos.x, g.closedPos.y + 1.2, g.closedPos.z),
        rad: Math.max(0.8, g.w / 2),
        gate: id,
      });
    }
    for (const it of ctx.interactables || []) {
      const p = it.getPos ? it.getPos() : it.pos;
      if (p && p.x >= G.LAYOUT.INTERIOR_X_MIN)
        targets.push({
          what:
            "interactable " +
            (typeof it.label === "function" ? it.label() : it.label),
          p: p.clone(),
          rad: it.radius || 0.8,
        });
    }
    for (const a of ctx.actors || [])
      if (a && a.pos && a.pos.x >= G.LAYOUT.INTERIOR_X_MIN)
        targets.push({
          what: "actor " + (a.name || a.id),
          p: new THREE.Vector3(a.pos.x, a.pos.y + 1.2, a.pos.z),
          rad: 1.0,
        });
    for (const k in ctx.anchors) {
      const a = ctx.anchors[k];
      if (a.x >= G.LAYOUT.INTERIOR_X_MIN && !/^spawn|^loot/.test(k))
        targets.push({
          what: "anchor " + k,
          p: new THREE.Vector3(a.x, a.y + 1.0, a.z),
          rad: 1.2,
        });
    }
    // use the live interactable when one exists near the record (its real pos / radius / range)
    const IAS = G.world.interactables || [];
    for (const t of targets) {
      if (t.gate || /^anchor/.test(t.what)) continue;
      let best = null,
        bd = 1.6;
      for (const it of IAS) {
        const q = it.getPos ? it.getPos() : it.pos;
        if (!q) continue;
        const d = Math.hypot(q.x - t.p.x, q.z - t.p.z);
        if (d < bd && Math.abs(q.y - t.p.y) < 2.2) {
          bd = d;
          best = it;
        }
      }
      if (best) {
        const q = best.getPos ? best.getPos() : best.pos;
        t.p = q.clone();
        t.rad = best.radius || 0.8;
        t.range = best.range;
      } else t.noIA = true;
    }
    res.noInteractable = targets
      .filter((t) => t.noIA && !/^actor/.test(t.what))
      .map((t) => t.what);
    const behind = [];
    for (const t of targets) {
      t.closed = reach(closed.nodes, t.p, t.rad, t.range);
      if (!t.closed && !t.gate) behind.push(t.what);
    }
    // open every gate, flood again
    const gates = Object.values(ctx.gates || {});
    const cols = gates.map((g) => g.col).filter(Boolean);
    for (const c of cols) G.world.removeCollider(c);
    const open = flood(inn.def.target, box, 400000);
    for (const g of gates)
      if (g.col) {
        g.col = g.makeCol();
      }
    res.interiorNodesOpen = open.nodes.length;
    res.behindGates = [];
    for (const t of targets) {
      if (t.closed) continue;
      const o = reach(open.nodes, t.p, t.rad, t.range);
      if (o) res.behindGates.push(t.what);
      else {
        res.problems.push(
          "unreachable: " +
            t.what +
            " at " +
            t.p.x.toFixed(1) +
            "," +
            t.p.y.toFixed(1) +
            "," +
            t.p.z.toFixed(1) +
            " (local " +
            (t.p.x - O.x).toFixed(1) +
            "," +
            (t.p.y - O.y).toFixed(1) +
            "," +
            (t.p.z - O.z).toFixed(1) +
            ")",
        );
        // why: the 3 nearest reachable nodes and what the line of sight hits
        const near = open.nodes
          .map((n) => [
            Math.hypot(n.x - t.p.x, n.y + EYE - t.p.y, n.z - t.p.z),
            n,
          ])
          .sort((u, v) => u[0] - v[0])
          .slice(0, 3);
        res.why = res.why || [];
        res.why.push({
          what: t.what,
          lim: (t.range || 3.2) + t.rad,
          near: near.map(([d, n]) => {
            const eye = new THREE.Vector3(n.x, n.y + EYE, n.z),
              dir = t.p.clone().sub(eye);
            const L = dir.length();
            dir.normalize();
            const h = G.world.raycast(eye, dir, L, {
              ignoreTags: ["interactable_self", "actor"],
            });
            return {
              node: [
                +(n.x - O.x).toFixed(1),
                +(n.y - O.y).toFixed(1),
                +(n.z - O.z).toFixed(1),
              ],
              d: +d.toFixed(2),
              hit: h
                ? {
                    dist: +h.dist.toFixed(2),
                    tag: h.collider && h.collider.tag,
                    x: h.collider && [
                      +(h.collider.bb.x0 - O.x).toFixed(2),
                      +(h.collider.bb.x1 - O.x).toFixed(2),
                    ],
                    z: h.collider && [
                      +(h.collider.bb.z0 - O.z).toFixed(2),
                      +(h.collider.bb.z1 - O.z).toFixed(2),
                    ],
                    y: h.collider && [
                      +(h.collider.minY - O.y).toFixed(2),
                      +(h.collider.maxY - O.y).toFixed(2),
                    ],
                  }
                : null,
            };
          }),
        });
      }
    }
    // spawn anchors must be on reachable floor
    for (let i = 1; i <= 6; i++) {
      const a = ctx.anchors["spawn" + i];
      if (!a) {
        res.problems.push("missing spawn" + i);
        continue;
      }
      const ok = open.nodes.some(
        (n) =>
          Math.abs(n.x - a.x) < 0.6 &&
          Math.abs(n.z - a.z) < 0.6 &&
          Math.abs(n.y - a.y) < 0.6,
      );
      if (!ok)
        res.problems.push(
          "spawn" +
            i +
            " not on reachable floor (" +
            (a.x - O.x).toFixed(1) +
            "," +
            (a.y - O.y).toFixed(1) +
            "," +
            (a.z - O.z).toFixed(1) +
            ")",
        );
    }
    res.paths = (PATHS[ctx.id] || []).map(([a, b]) => walkLine(ctx, a, b));
    const Z0 = { O: { x: 0, y: 0, z: 0 } };
    res.streetPaths = (STREET_PATHS[ctx.id] || []).map(([a, b]) =>
      walkLine(Z0, a, b),
    );
    for (const w of res.streetPaths)
      if (!w.ok)
        res.problems.push(
          "street walk blocked " +
            JSON.stringify(w.from) +
            "→" +
            JSON.stringify(w.to) +
            " at " +
            JSON.stringify(w.blockedAt) +
            " by " +
            JSON.stringify(w.by),
        );
    if (ctx.id === "municipal_building")
      res.dbgNodes = closed.nodes
        .filter(
          (n) =>
            Math.abs(n.x - O.x) < 0.5 && n.z - O.z < -17 && n.z - O.z > -20,
        )
        .map((n) => [
          +(n.x - O.x).toFixed(2),
          +n.y.toFixed(2),
          +(n.z - O.z).toFixed(2),
        ]);
    const MR = MAPS[ctx.id];
    if (MR) {
      const set = new Set(
        closed.nodes.map(
          (n) =>
            Math.floor((n.x - O.x) / STEP + 0.25) +
            "," +
            Math.floor((n.z - O.z) / STEP + 0.25),
        ),
      );
      res.map = [];
      for (let z = MR[2]; z <= MR[3]; z += STEP) {
        let line = "";
        for (let x = MR[0]; x <= MR[1]; x += STEP)
          line += set.has(
            Math.floor(x / STEP + 0.25) + "," + Math.floor(z / STEP + 0.25),
          )
            ? "#"
            : ".";
        res.map.push(line);
      }
    }
    res.targets = targets.length;
    res.ms = Math.round(performance.now() - t0);
    return res;
  }

  let frames = 0,
    done = false;
  function run() {
    done = true;
    const out = { pois: [], errors: [] };
    for (const ctx of PC.ctxs || []) {
      try {
        out.pois.push(probe(ctx));
      } catch (e) {
        out.errors.push(ctx.id + ": " + ((e && e.stack) || e));
      }
    }
    out.gErrors = (G.errors || []).slice(0, 20);
    const pre = document.createElement("pre");
    pre.id = "pc-probe";
    pre.textContent =
      "PCPROBE_" + "BEGIN" + JSON.stringify(out) + "PCPROBE_" + "END";
    document.body.appendChild(pre);
    // also on the console (chunked), so a runner reading Chrome's --enable-logging can stop early
    try {
      const t = JSON.stringify(out);
      for (let k = 0; k < t.length; k += 30000)
        console.log(
          "PCPROBE_CHUNK " + encodeURIComponent(t.slice(k, k + 30000)),
        );
      console.log("[pcprobe] done PCPROBE_FIN");
    } catch (e) {
      /* */
    }
  }
  G.registerModule({
    name: "poi_civic_probe",
    order: 99,
    update() {
      if (done) return;
      if (G.state !== "play" && G.state !== "cutscene") {
        frames = 0;
        return;
      }
      if (++frames === 20) run();
    },
  });
})();
