/* src/poi_uptown/98_dooraudit.js */
/* =====================================================================
 * NEW RAD CITY — POI UPTOWN · door audit (dev / test utility; no runtime cost unless called)
 *
 * G.poiDoorAudit({ids}) → report. For every street<->interior door of the given POI sites (default: ours)
 * it checks both directions the way a player uses them:
 *   · the door is REACHABLE: some clear standing spot on walkable ground within reach (≤ 2.6 m) with a
 *     line of sight to the door's hot-spot;
 *   · the ARRIVAL point is clear: a 0.4 m player cylinder fits, there is ground under it (no void, no
 *     fall > 0.6 m), and the player can walk ≥ 1.6 m straight ahead (facing into the room / the street);
 *   · the arrival FACES AWAY from the door it arrives by (the paired door within 7 m of the target), and
 *     stands 1.2..6 m from it (just outside the same entrance, not across the block).
 * Every problem is listed with its door label and coordinates. Used by the round-2 door pass.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pu) return;
  const P = G._pu;
  const R = 0.4,
    H = 1.7;

  function overlaps(x, y, z, r, ignoreTags) {
    const W = G.world,
      out = [];
    const feet = y + W.stepHeight,
      head = y + H;
    for (const c of W.query(x - r - 1, z - r - 1, x + r + 1, z + r + 1)) {
      if (c.maxY <= feet || c.minY >= head) continue;
      if (ignoreTags && ignoreTags.indexOf(c.tag) >= 0) continue;
      if (W.pointInCollider(c, x, z, r)) out.push(c);
    }
    return out;
  }
  /** Walk straight ahead in 0.2 m steps with the real player collision; returns distance achieved. */
  function walkAhead(x, y, z, yaw, dist) {
    const W = G.world,
      fx = -Math.sin(yaw),
      fz = -Math.cos(yaw);
    const p = new THREE.Vector3(x, y, z);
    let d = 0;
    for (let i = 0; i < dist / 0.2; i++) {
      const m = W.moveCircle(p, R, H, fx * 0.2, fz * 0.2);
      const adv = (m.x - p.x) * fx + (m.z - p.z) * fz;
      if (adv < 0.1) break;
      const gy = W.groundHeight(m.x, m.z, p.y + 0.5, 0.2);
      if (gy < p.y - 1.2) break; // walked off an edge
      p.set(m.x, gy, m.z);
      d += adv;
    }
    return d;
  }
  function reachable(pos) {
    const W = G.world;
    let best = null;
    for (let ring = 0.9; ring <= 2.6; ring += 0.3) {
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2,
          x = pos.x + Math.cos(a) * ring,
          z = pos.z + Math.sin(a) * ring;
        const gy = W.groundHeight(x, z, pos.y + 0.6, 0.2);
        if (gy < pos.y - 3 || gy > pos.y + 0.6) continue;
        if (overlaps(x, gy, z, R).length) continue;
        const eye = new THREE.Vector3(x, gy + 1.6, z),
          tgt = new THREE.Vector3(pos.x, pos.y, pos.z);
        const dir = tgt.clone().sub(eye);
        const len = dir.length();
        dir.normalize();
        const hit = W.raycast(eye, dir, len - 0.35);
        if (hit && hit.dist < len - 0.45) continue;
        if (!best || ring < best.ring)
          best = {
            x: +x.toFixed(2),
            y: +gy.toFixed(2),
            z: +z.toFixed(2),
            ring: +ring.toFixed(1),
          };
      }
      if (best) break;
    }
    return best;
  }

  /** Visual check (not colliders): rays from the arrival eye/knee height straight ahead (±0.25 rad) against the
   *  rendered meshes — catches decorative geometry (dados, rugs on edge, signs) drawn across a doorway. */
  const _rc = new THREE.Raycaster();
  function viewAhead(x, y, z, yaw) {
    const meshes = [];
    G.scene.traverse((m) => {
      if (!m.isMesh || m.isSprite || !m.geometry) return;
      const mt = Array.isArray(m.material) ? m.material[0] : m.material;
      if (mt && mt.transparent && (mt.opacity < 0.5 || mt.depthWrite === false))
        return;
      meshes.push(m);
    });
    let best = null;
    for (const h of [1.6, 0.9])
      for (const da of [-0.25, 0, 0.25]) {
        const a = yaw + da,
          dir = new THREE.Vector3(-Math.sin(a), 0, -Math.cos(a));
        _rc.set(new THREE.Vector3(x, y + h, z), dir);
        _rc.far = 6;
        _rc.near = 0.05;
        const hit = _rc.intersectObjects(meshes, false)[0];
        if (hit && (!best || hit.distance < best.d))
          best = {
            d: +hit.distance.toFixed(2),
            h,
            da,
            name:
              hit.object.name ||
              (hit.object.parent && hit.object.parent.name) ||
              "?",
          };
      }
    return best;
  }

  /**
   * G.poiHoleAudit({ids}) — every opening cut into a wall with S.wallX/wallZ (door holes, arches) is probed with short
   * horizontal rays straight through it (3 points across × 2 heights, 0.7 m either side of the wall plane) against the
   * rendered meshes of the same site. Anything hit is decorative geometry drawn across a doorway (a dado, a rail, a
   * sign, laundry…) — or an intended closed door/gate, which the report lists too so it can be checked by eye.
   */
  G.poiHoleAudit = function (o) {
    o = o || {};
    const out = { holes: 0, blocked: [] };
    for (const S of P.sites) {
      if (
        !S.holes ||
        (o.ids && !o.ids.some((id) => String(S.id).indexOf(id) === 0))
      )
        continue;
      const meshes = [];
      S.root.traverse((m) => {
        if (m.isMesh && !m.isSprite && m.geometry) {
          const mt = Array.isArray(m.material) ? m.material[0] : m.material;
          if (!(mt && mt.transparent && mt.opacity < 0.5)) meshes.push(m);
        }
      });
      S.root.updateMatrixWorld(true);
      for (const w of S.holes)
        for (const h of w.holes) {
          out.holes++;
          const hits = [];
          const us = [
            h[0] + Math.min(0.35, (h[1] - h[0]) / 4),
            (h[0] + h[1]) / 2,
            h[1] - Math.min(0.35, (h[1] - h[0]) / 4),
          ];
          const ys = [h[2] + 0.35, Math.min(h[2] + 1.2, h[3] - 0.15)];
          for (const u of us)
            for (const yy of ys) {
              const y = w.y0 + yy + S.oy;
              const o0 =
                w.axis === "x"
                  ? new THREE.Vector3(u + S.ox, y, w.c + S.oz - 0.7)
                  : new THREE.Vector3(w.c + S.ox - 0.7, y, u + S.oz);
              const dir =
                w.axis === "x"
                  ? new THREE.Vector3(0, 0, 1)
                  : new THREE.Vector3(1, 0, 0);
              _rc.set(o0, dir);
              _rc.near = 0;
              _rc.far = 1.4;
              const hit = _rc.intersectObjects(meshes, false)[0];
              if (hit)
                hits.push(
                  (hit.object.name || "?").replace(/^pu_/, "") +
                    "@" +
                    u.toFixed(1) +
                    "/" +
                    yy.toFixed(1),
                );
            }
          if (hits.length)
            out.blocked.push({
              site: S.id,
              wall: w.axis + "=" + w.c.toFixed(2),
              hole: h.map((v) => +v.toFixed(2)),
              y0: w.y0,
              hits: Array.from(new Set(hits)).slice(0, 6),
            });
        }
    }
    return out;
  };

  G.poiDoorAudit = function (o) {
    o = o || {};
    const W = G.world;
    const doors = [];
    for (const S of P.sites) {
      if (o.ids && !o.ids.some((id) => String(S.id).indexOf(id) === 0))
        continue;
      for (const d of S.doors || [])
        if (d && d.def) doors.push({ site: S.id, d });
    }
    const report = { doors: [], problems: [] };
    for (const { site, d } of doors) {
      const def = d.def,
        t = def.target || {};
      const r = {
        site,
        label: def.label,
        verb: def.verb,
        pos: [
          +def.pos.x.toFixed(2),
          +def.pos.y.toFixed(2),
          +def.pos.z.toFixed(2),
        ],
        target: [t.x, t.y, t.z, +(t.yaw || 0).toFixed(2)],
      };
      const bad = (msg) => {
        report.problems.push(site + ' "' + def.label + '": ' + msg);
        (r.issues = r.issues || []).push(msg);
      };
      // 1. reachability of the door itself
      const reach = reachable(def.pos);
      r.reach = reach;
      if (!reach)
        bad(
          "no clear standing spot within 2.6 m with line of sight to the door",
        );
      // 2. arrival point
      const gy = W.groundHeight(t.x, t.z, (t.y || 0) + 0.6, 0.3);
      r.groundAtTarget = +gy.toFixed(2);
      if (gy < (t.y || 0) - 0.6)
        bad(
          "no floor under the arrival point (ground " +
            gy.toFixed(2) +
            " vs y " +
            t.y +
            ")",
        );
      const ov = overlaps(t.x, Math.max(gy, (t.y || 0) - 0.6), t.z, R);
      if (ov.length)
        bad(
          "arrival point inside " +
            ov.length +
            " collider(s): " +
            ov
              .slice(0, 3)
              .map((c) => c.tag + "@" + c.cx.toFixed(1) + "," + c.cz.toFixed(1))
              .join(" "),
        );
      const ahead = walkAhead(t.x, gy, t.z, t.yaw || 0, 3);
      r.ahead = +ahead.toFixed(2);
      if (ahead < 1.6)
        bad(
          "only " +
            ahead.toFixed(2) +
            " m clear straight ahead of the arrival point",
        );
      const view = viewAhead(
        t.x,
        Math.max(gy, (t.y || 0) - 0.6),
        t.z,
        t.yaw || 0,
      );
      r.view = view ? view.d : ">6";
      if (view && view.d < 1.5)
        bad(
          "view blocked " +
            view.d +
            " m ahead of the arrival point (h " +
            view.h +
            ", " +
            view.name +
            ")",
        );
      // 3. paired door at the destination
      let pair = null,
        pd = 7;
      for (const w of W.doors) {
        if (w === d || !w.def || !w.def.pos) continue;
        const dd = Math.hypot(w.def.pos.x - t.x, w.def.pos.z - t.z);
        if (dd < pd && Math.abs(w.def.pos.y - (t.y || 0)) < 4) {
          pd = dd;
          pair = w;
        }
      }
      if (!pair) bad("no return door within 7 m of the arrival point");
      else {
        r.pair = pair.def.label;
        r.pairDist = +pd.toFixed(2);
        const fx = -Math.sin(t.yaw || 0),
          fz = -Math.cos(t.yaw || 0);
        const vx = t.x - pair.def.pos.x,
          vz = t.z - pair.def.pos.z,
          vl = Math.hypot(vx, vz) || 1;
        r.faceAway = +((vx * fx + vz * fz) / vl).toFixed(2);
        if (r.faceAway < 0.3)
          bad(
            'arrival does not face away from its door "' +
              pair.def.label +
              '" (dot ' +
              r.faceAway +
              ")",
          );
        if (pd < 1.2)
          bad(
            "arrival only " +
              pd.toFixed(2) +
              " m from its door (re-triggers / overlaps it)",
          );
      }
      report.doors.push(r);
    }
    report.ok = report.problems.length === 0;
    return report;
  };
})();
