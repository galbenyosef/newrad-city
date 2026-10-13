// play-inline-572 02 — res
// Lines 187-537 of readable/play-inline-572.pretty.js (statement-aligned).
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
