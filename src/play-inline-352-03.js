// play-inline-352 03 — pos
// Lines 33-366 of readable/play-inline-352.pretty.js (statement-aligned).
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

