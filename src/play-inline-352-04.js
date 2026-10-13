// play-inline-352 04 — res
// Lines 367-699 of readable/play-inline-352.pretty.js (statement-aligned).
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
