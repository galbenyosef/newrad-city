// play-inline-572 01 — out
// Lines 23-186 of readable/play-inline-572.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;

  const IXM = () => (G.LAYOUT ? G.LAYOUT.INTERIOR_X_MIN : 2500);
  const fin = (v) => typeof v === "number" && isFinite(v);
  // NPC id prefixes of talking quest NPCs.
  const TALKERS =
    /^(neon_|gc_|rc_|cov_|con_|glow_|esb_|chr_|bb_|fl_|ws_|met_|bp_|comp_)/;
  const safe = (fn, dflt) => {
    try {
      return fn();
    } catch (e) {
      return dflt === undefined
        ? { __err: String((e && e.message) || e) }
        : dflt;
    }
  };

  /** Exterior doors leading into the interior cell around (x,z). */
  function doorsInto(x, z) {
    const out = [];
    for (const d of L.doors()) {
      const p = d.def && d.def.pos,
        t = d.def && d.def.target;
      if (!p || !t) continue;
      if (p.x >= IXM() || t.x < IXM()) continue;
      if (Math.hypot(t.x - x, t.z - z) <= 320) out.push(d);
    }
    return out;
  }
  /** Any door (from anywhere) whose target is within 320 m of (x,z) — for chained interiors. */
  function anyDoorInto(x, z) {
    for (const d of L.doors()) {
      const t = d.def && d.def.target;
      if (t && Math.hypot(t.x - x, t.z - z) <= 320) return d;
    }
    return null;
  }

  /**
   * Checks one resolved position (marker or NPC). Returns a list of problems
   * ('in_geometry', 'water', 'off_map', 'floating', 'buried', 'no_door').
   */
  function checkPos(p, opts) {
    opts = opts || {};
    const W = G.world,
      probs = [];
    if (!p || !fin(p.x) || !fin(p.z)) return ["bad_position"];
    const inside = p.x >= IXM();
    const y = fin(p.y) ? p.y : inside ? 0 : W.terrainHeight(p.x, p.z);
    if (!inside) {
      if (G.LAYOUT && G.LAYOUT.isLand && !G.LAYOUT.isLand(p.x, p.z) && y < 1) {
        const gh = W.groundHeight(p.x, p.z, y + 0.6, 0.3);
        if (!(gh > W.waterLevel + 0.2)) probs.push("water");
      }
    } else if (!opts.noDoorCheck) {
      if (!doorsInto(p.x, p.z).length && !anyDoorInto(p.x, p.z))
        probs.push("no_door");
    }
    const gy = W.groundHeight(p.x, p.z, y + 0.6, 0.3);
    if (opts.actor) {
      if (y < gy - 0.8) probs.push("buried");
      else if (y > gy + 2.5 && !opts.flyOk) probs.push("floating");
    }
    // Objectives often sit on a raised floor (library steps, ship decks, platforms) while the
    // marker spec only carries x/z: accept any walkable surface up to 12 m above the given height.
    let standY = Math.max(gy, y - 0.1);
    if (L.blocked(p.x, standY, p.z, opts.r || 0.3, 0.45) && !opts.actor) {
      const up = W.groundHeight(p.x, p.z, y + 12, 0.3);
      if (up > standY + 0.3 && !L.blocked(p.x, up, p.z, opts.r || 0.3, 0.45))
        standY = up;
    }
    if (probs[0] === "water" && standY > W.waterLevel + 0.2) probs.shift();
    if (L.blocked(p.x, standY, p.z, opts.r || 0.3, 0.45)) {
      // Markers on a target inside a building are fine as long as something walkable is near.
      const f = L.freeSpot(p.x, p.z, standY, {
        maxR: opts.maxR || 6,
        noCache: true,
      });
      probs.push(
        f && !f.forced
          ? "in_geometry(free " +
              Math.hypot(f.x - p.x, f.z - p.z).toFixed(1) +
              "m)"
          : "in_geometry(no free spot within " + (opts.maxR || 6) + "m)",
      );
    }
    return probs;
  }

  function lintDialogues(filter) {
    const out = { trees: 0, nodes: 0, responses: 0, problems: [] };
    if (G.isStub("dialogue") || !G.dialogue.list) return out;
    for (const id of G.dialogue.list()) {
      if (filter && !filter.test(id)) continue;
      const t = G.dialogue.get(id);
      if (!t || !t.nodes) continue;
      out.trees++;
      const s0 = safe(() =>
        typeof t.start === "function" ? t.start() : t.start,
      );
      if (s0 && s0.__err)
        out.problems.push(id + " start() throws: " + s0.__err);
      else if (s0 && !t.nodes[s0])
        out.problems.push(id + " start -> " + s0 + " missing");
      else if (!s0 && !t.nodes.start)
        out.problems.push(id + " has no start node");
      for (const nid in t.nodes) {
        const n = t.nodes[nid];
        out.nodes++;
        const tx = safe(() =>
          typeof n.text === "function" ? n.text() : n.text,
        );
        if (tx && tx.__err)
          out.problems.push(id + "." + nid + " text throws: " + tx.__err);
        const rs = safe(
          () =>
            typeof n.responses === "function" ? n.responses() : n.responses,
          [],
        );
        if (rs && rs.__err) {
          out.problems.push(
            id + "." + nid + " responses() throws: " + rs.__err,
          );
          continue;
        }
        for (const r of rs || []) {
          out.responses++;
          for (const k of ["next", "failNext"]) {
            const v = r[k];
            if (
              typeof v === "string" &&
              v !== "end" &&
              v !== "exit" &&
              v !== "close" &&
              !t.nodes[v]
            )
              out.problems.push(
                id + "." + nid + " " + k + " -> " + v + " missing",
              );
          }
          if (r.cond) {
            const c = safe(() => r.cond());
            if (c && c.__err)
              out.problems.push(id + "." + nid + " cond throws: " + c.__err);
          }
          if (typeof r.text === "function") {
            const c = safe(() => r.text());
            if (c && c.__err)
              out.problems.push(
                id + "." + nid + " response text throws: " + c.__err,
              );
          }
        }
      }
    }
    return out;
  }

  /**
   * opts: {filter: RegExp on quest id, npcs: true (check every quest NPC), dialogue: true|RegExp,
   *        maxR: free-spot radius for in-geometry markers}
   */
