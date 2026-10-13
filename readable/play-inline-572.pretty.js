/* src/quests/75_audit.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 75: QUEST AUDIT
 * `G.quests.debug.audit(opts)` walks EVERY quest registered with the engine
 * (this module's and every POI / landmark / extra module's) and reports what
 * would stop it being completed in play:
 *   - stages whose markers do not resolve (missing NPC / anchor / bad spec)
 *   - exterior markers inside solid geometry, in the water or off the map
 *   - interior markers with no street door leading into their cell
 *   - quest NPCs that are missing, dead on a new game, buried in geometry,
 *     fallen through the floor or standing in the water
 *   - dialogue trees with dangling `next` / `failNext` or throwing conds/texts
 *   - quests with no way to finish (no `complete` stage — only a hint; code
 *     may still call complete())
 *   - every lock in G.locks (key / code / passcode) that its audit flags:
 *     a key nobody can obtain, a code nobody can learn (res.locks)
 * It never runs stage `onEnter` code and restores the quest state afterwards,
 * so it is safe from the dev console mid-game. Returns
 * `{quests, stages, markers, issues:[{sev, quest, stage, kind, msg}], npcs, dialogue, locks}`.
 * Also used by the headless quest harness (see NOTES.md "Testing").
 * ===================================================================== */
(function () {
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
  function audit(opts) {
    opts = opts || {};
    const issues = [];
    const add = (sev, quest, stage, kind, msg) =>
      issues.push({ sev, quest, stage, kind, msg });
    const res = { quests: 0, stages: 0, markers: 0, issues, perQuest: {} };
    // Snapshot quest state (never run onEnter — only states are faked).
    const snap = new Map();
    for (const [id, s] of L.STATE) snap.set(id, JSON.parse(JSON.stringify(s)));
    try {
      for (const [id, q] of L.DEFS) {
        if (opts.filter && !opts.filter.test(id)) continue;
        res.quests++;
        const row = (res.perQuest[id] = {
          name: q.name,
          stages: (q.stages || []).length,
          markers: 0,
          issues: 0,
          complete: false,
        });
        if (!q.stages || !q.stages.length) {
          add("high", id, null, "no_stages", "quest has no stages");
          continue;
        }
        const ids = new Set();
        for (const sd of q.stages) {
          if (ids.has(sd.id))
            add("med", id, sd.id, "dup_stage", "duplicate stage id");
          ids.add(sd.id);
        }
        row.complete = q.stages.some((sd) => sd.complete) || !!q.completeByCode;
        const log = [];
        for (const sd of q.stages) {
          res.stages++;
          if (!sd.sideObjective) log.push(sd.id);
          L.STATE.set(id, {
            status: "active",
            stage: sd.sideObjective ? log[log.length - 1] || sd.id : sd.id,
            log: log.slice(),
            t: 0,
          });
          L.markerCache.clear();
          let specs = sd.markers;
          if (typeof specs === "function") specs = safe(specs, null);
          if (specs && specs.__err) {
            add(
              "high",
              id,
              sd.id,
              "marker_throws",
              "markers() throws: " + specs.__err,
            );
            continue;
          }
          if (!Array.isArray(specs) || !specs.length) {
            if (!sd.complete && !sd.sideObjective && !sd.noMarker && !sd.hidden)
              add(
                "info",
                id,
                sd.id,
                "no_marker",
                "stage has no marker: " +
                  String(
                    safe(
                      () =>
                        typeof sd.text === "function" ? sd.text() : sd.text,
                      "",
                    ),
                  ).slice(0, 80),
              );
            continue;
          }
          for (let spec of specs) {
            res.markers++;
            row.markers++;
            if (typeof spec === "function") spec = safe(spec, null);
            if (!spec) continue; // conditional marker switched off
            if (spec.__err) {
              add(
                "high",
                id,
                sd.id,
                "marker_throws",
                "marker fn throws: " + spec.__err,
              );
              continue;
            }
            if (spec.npc) {
              const a = L.npc(spec.npc);
              // NPCs that a previous stage's onEnter (or an event) spawns can't exist in a static audit: only a hint then
              const spawnedLater =
                q.stages.some((x) => x.onEnter) || !!q.onStart;
              // a quest that is really over (before the audit faked its stages) may have sent its NPCs home
              const real = snap.get(id),
                ended = !!(
                  real &&
                  (real.status === "completed" || real.status === "failed")
                );
              if (!a) {
                add(
                  spawnedLater || ended
                    ? "info"
                    : spec.x === undefined && !spec.anchor
                      ? "high"
                      : "med",
                  id,
                  sd.id,
                  "npc_missing",
                  'marker NPC "' +
                    spec.npc +
                    '" is not spawned' +
                    (ended
                      ? " (the quest is over)"
                      : spawnedLater
                        ? " (may be spawned by a stage onEnter)"
                        : ""),
                );
              } else if (a.dead)
                add(
                  "info",
                  id,
                  sd.id,
                  "npc_dead",
                  'marker NPC "' + spec.npc + '" is dead',
                );
            }
            const r = safe(() => L.resolveMarker(spec), null);
            if (!r || r.__err) {
              if (!spec.npc)
                add(
                  "high",
                  id,
                  sd.id,
                  "marker_unresolved",
                  'marker "' + (spec.label || "") + '" does not resolve',
                );
              continue;
            }
            const probs = checkPos(r, { maxR: opts.maxR, flyOk: true });
            const label =
              '"' +
              (r.label || spec.label || spec.npc || "") +
              '" @' +
              r.x.toFixed(0) +
              "," +
              (r.y || 0).toFixed(1) +
              "," +
              r.z.toFixed(0);
            for (const p of probs) {
              const sev =
                p === "no_door" ||
                p === "water" ||
                p === "bad_position" ||
                /no free spot/.test(p)
                  ? "high"
                  : "low";
              add(
                sev,
                id,
                sd.id,
                p.replace(/\(.*$/, ""),
                "marker " + label + " " + p,
              );
            }
          }
        }
        row.issues = issues.filter(
          (i) => i.quest === id && i.sev !== "info",
        ).length;
        if (!row.complete)
          add(
            "info",
            id,
            null,
            "no_complete_stage",
            "no stage has complete:true (relies on code calling complete())",
          );
      }
    } finally {
      // restore
      for (const id of Array.from(L.STATE.keys()))
        if (!snap.has(id)) L.STATE.delete(id);
      for (const [id, s] of snap) L.STATE.set(id, s);
      L.markerCache.clear();
    }
    // Quest NPCs: where are they standing?
    if (opts.npcs !== false) {
      res.npcs = { total: 0, problems: [] };
      for (const nid in L.npcs) {
        const a = L.npc(nid);
        if (!a || !a.pos) continue;
        res.npcs.total++;
        if (a.dead) continue;
        const probs = checkPos(
          { x: a.pos.x, y: a.pos.y, z: a.pos.z },
          {
            actor: true,
            r: 0.25,
            maxR: 3,
            noDoorCheck: false,
            flyOk: !!a.flying,
          },
        );
        if (probs.length)
          res.npcs.problems.push(
            nid +
              " @" +
              a.pos.x.toFixed(1) +
              "," +
              a.pos.y.toFixed(1) +
              "," +
              a.pos.z.toFixed(1) +
              " " +
              probs.join(" "),
          );
        if (
          !a.dialogue &&
          !a.hostile &&
          TALKERS.test(nid) &&
          !/raid|exp_|nc\d|maniac|_m\d/.test(nid)
        )
          res.npcs.problems.push(nid + " has no dialogue");
        else if (
          a.dialogue &&
          !G.isStub("dialogue") &&
          G.dialogue.get &&
          !G.dialogue.get(a.dialogue)
        )
          res.npcs.problems.push(
            nid + ' dialogue "' + a.dialogue + '" is not registered',
          );
      }
    }
    // Quest pickups and terminals placed by this module
    res.pickups = { total: 0, problems: [] };
    for (const k in L.pickups) {
      const pk = L.pickups[k];
      if (!pk || !pk.pos || L.flag("got_" + k)) continue;
      res.pickups.total++;
      const probs = checkPos(pk.pos, { maxR: 3 });
      if (probs.length)
        res.pickups.problems.push(
          k +
            " (" +
            pk.id +
            ") @" +
            pk.pos.x.toFixed(1) +
            "," +
            (pk.pos.y || 0).toFixed(1) +
            "," +
            pk.pos.z.toFixed(1) +
            " " +
            probs.join(" "),
        );
    }
    for (const k in L.world) {
      if (!/^term_/.test(k)) continue;
      const t = L.world[k];
      if (!t || !t.pos) continue;
      res.pickups.total++;
      const f = L.freeSpot(t.pos.x, t.pos.z, t.pos.y || 0, {
        maxR: 2.2,
        noCache: true,
      });
      if (!f || f.forced)
        res.pickups.problems.push(
          k +
            " @" +
            t.pos.x.toFixed(1) +
            "," +
            (t.pos.y || 0).toFixed(1) +
            "," +
            t.pos.z.toFixed(1) +
            " no standing room within 2.2 m",
        );
      else if (t.pos.x >= IXM() && !anyDoorInto(t.pos.x, t.pos.z))
        res.pickups.problems.push(
          k + " interior terminal with no door into its cell",
        );
    }
    // Every load door in the game (street <-> interior): where does it put the player?
    if (opts.doors !== false) {
      res.doors = { total: 0, problems: [] };
      const W = G.world;
      for (const d of L.doors()) {
        const p = d.def && d.def.pos,
          t = d.def && d.def.target;
        if (!p || !t) continue;
        res.doors.total++;
        const name =
          '"' +
          (d.def.label || "?") +
          '" @' +
          p.x.toFixed(0) +
          "," +
          p.z.toFixed(0) +
          " -> " +
          t.x.toFixed(0) +
          "," +
          (t.y || 0).toFixed(1) +
          "," +
          t.z.toFixed(0);
        const ty = W.groundHeight(t.x, t.z, (t.y || 0) + 0.8, 0.3);
        if (!isFinite(ty) || ty < (t.y || 0) - 1.2)
          res.doors.problems.push(name + " target has no floor");
        else if (L.blocked(t.x, ty, t.z, 0.3, 0.45))
          res.doors.problems.push(name + " target inside geometry");
        else if (t.x < IXM() && ty < W.waterLevel + 0.2)
          res.doors.problems.push(name + " target in water");
        else if (isFinite(t.yaw)) {
          // the player should face away from the door into open space: 1.5 m ahead must be walkable
          const fx = t.x - Math.sin(t.yaw) * 1.5,
            fz = t.z - Math.cos(t.yaw) * 1.5;
          const fy = W.groundHeight(fx, fz, ty + 0.6, 0.3);
          if (L.blocked(fx, fy, fz, 0.3, 0.45) || Math.abs(fy - ty) > 0.8)
            res.doors.problems.push(
              name + " target faces a wall/drop (yaw " + t.yaw.toFixed(2) + ")",
            );
        }
        // the door itself must be reachable: some free standing spot within 2.5 m of it on its own floor
        const f = L.freeSpot(
          p.x,
          p.z,
          W.groundHeight(p.x, p.z, (p.y || 0) + 0.8, 0.3),
          { maxR: 2.5, noCache: true },
        );
        if (!f || f.forced)
          res.doors.problems.push(
            name + " door has no standing room within 2.5 m",
          );
      }
    }
    if (opts.dialogue !== false)
      res.dialogue = lintDialogues(
        opts.dialogue instanceof RegExp ? opts.dialogue : null,
      );
    // Every lock (key / code / passcode) must have a reachable unlock: the locks module's own audit.
    if (opts.locks !== false) res.locks = auditLocks(issues);
    const sevRank = { high: 0, med: 1, low: 2, info: 3 };
    issues.sort(
      (a, b) => sevRank[a.sev] - sevRank[b.sev] || (a.quest < b.quest ? -1 : 1),
    );
    res.counts = { high: 0, med: 0, low: 0, info: 0 };
    for (const i of issues) res.counts[i.sev]++;
    return res;
  }

  /**
   * G.locks.audit() (when the locks module is loaded) → issues of kind 'lock' (high: no unlock at all /
   * a key nobody can get / a code nobody can learn) + a summary {total, problems:[...]}.
   */
  function auditLocks(issues) {
    const out = { total: 0, problems: [] };
    if (G.isStub("locks") || !G.locks || typeof G.locks.audit !== "function") {
      out.skipped = "locks module not loaded";
      return out;
    }
    const rows = safe(() => G.locks.audit(), []);
    if (!Array.isArray(rows)) {
      out.error =
        rows && rows.__err ? rows.__err : "G.locks.audit() returned no list";
      return out;
    }
    out.total = rows.length;
    for (const r of rows) {
      const probs = (r && r.problems) || [];
      if (!probs.length) continue;
      out.problems.push(
        (r.id || "?") +
          (r.label ? " (" + r.label + ")" : "") +
          ": " +
          probs.join("; "),
      );
      issues.push({
        sev: "high",
        quest: null,
        stage: null,
        kind: "lock",
        msg: 'lock "' + (r.id || "?") + '" ' + probs.join("; "),
      });
    }
    return out;
  }

  G.quests.debug.audit = audit;
  G.quests.debug.auditLocks = () => auditLocks([]);
  G.quests.debug.checkPos = checkPos;
  G.quests.debug.lintDialogues = lintDialogues;
})();
