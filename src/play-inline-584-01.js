// play-inline-584 01 — push
// Lines 13-279 of readable/play-inline-584.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const QX = G.qx;
  const ON = /[?&]qxtest\b/.test(location.search);

  /** Static walk of every registered dialogue tree. Returns a list of problems. */
  function lintDialogues() {
    const bad = [];
    for (const [id, tree] of QX.DIALOGUES) {
      const nodes = tree.nodes || {};
      try {
        const s = typeof tree.start === "function" ? tree.start() : tree.start;
        if (!nodes[s]) bad.push(id + ": start → missing node " + s);
      } catch (e) {
        bad.push(id + ": start threw " + e.message);
      }
      for (const nid in nodes) {
        const n = nodes[nid];
        try {
          const t = typeof n.text === "function" ? n.text() : n.text;
          const ok = (v) => typeof v === "string" && !!v;
          if (Array.isArray(t) ? !t.length || !t.every(ok) : !ok(t))
            bad.push(id + "." + nid + ": empty text");
        } catch (e) {
          bad.push(id + "." + nid + ": text threw " + e.message);
        }
        for (const r of n.responses || []) {
          if (r.cond) {
            try {
              r.cond();
            } catch (e) {
              bad.push(id + "." + nid + ": cond threw " + e.message);
            }
          }
          for (const k of ["next", "failNext"])
            if (r[k] && !nodes[r[k]])
              bad.push(id + "." + nid + ": " + k + " → missing node " + r[k]);
        }
      }
    }
    return bad;
  }
  /** Run a node's onEnter + one response action (as the dialogue engine would). */
  function say(dlg, node, respIdx) {
    const tree = QX.DIALOGUES.get(dlg);
    if (!tree) throw new Error("no dialogue " + dlg);
    const n = tree.nodes[node];
    if (!n) throw new Error("no node " + dlg + "." + node);
    if (n.onEnter) n.onEnter();
    if (typeof n.text === "function") n.text();
    if (respIdx !== undefined) {
      const r = n.responses[respIdx];
      if (r && r.action) r.action();
      return r && r.next;
    }
    return null;
  }

  /**
   * PHYSICAL audit (run before the scripted playthrough mutates anything):
   *   - every qx_ quest stage marker through the quests module's audit (in geometry / water / no door)
   *   - every qx_ NPC: grounded, not buried in geometry, not standing in the water
   *   - every quest pickup: reachable
   *   - every door this module owns, BOTH directions: the door is reachable, its target has floor,
   *     is clear of geometry, faces into open space, and an exit puts the player back within a few
   *     metres of the entrance it pairs with, facing AWAY from it.
   * Returns {issues:[...], ...} — issues are hard failures, notes are informational.
   */
  function physicalAudit() {
    const out = {
      issues: [],
      notes: [],
      npcs: 0,
      doors: 0,
      markers: 0,
      pickups: 0,
    };
    const W = G.world;
    const D = G.quests && G.quests.debug;
    const checkPos = D && D.checkPos;
    const fmt = (p) =>
      (p.x || 0).toFixed(1) +
      "," +
      (p.y || 0).toFixed(1) +
      "," +
      (p.z || 0).toFixed(1);
    // 1. quest markers (quests module's audit, only our quests)
    if (D && D.audit) {
      const a = D.audit({
        filter: /^qx_/,
        npcs: false,
        doors: false,
        dialogue: /^qx_/,
        maxR: 6,
      });
      out.markers = a.markers;
      for (const i of a.issues) {
        if (i.sev === "high" || i.sev === "med")
          out.issues.push(
            "marker " + i.quest + "/" + i.stage + " " + i.kind + ": " + i.msg,
          );
        else if (i.sev === "low")
          out.notes.push("marker " + i.quest + "/" + i.stage + ": " + i.msg);
      }
      if (a.dialogue && a.dialogue.problems.length)
        for (const p of a.dialogue.problems) out.issues.push("dialogue " + p);
    }
    // 2. NPCs
    for (const id of QX.roster) {
      const a = QX.npc(id);
      if (!a || !a.pos || a.dead) continue;
      out.npcs++;
      if (checkPos) {
        const probs = checkPos(
          { x: a.pos.x, y: a.pos.y, z: a.pos.z },
          { actor: true, r: 0.25, maxR: 3, flyOk: !!a.flying },
        );
        if (probs.length)
          out.issues.push(
            "npc " + id + " @" + fmt(a.pos) + " " + probs.join(" "),
          );
      }
    }
    // 2b. no duplicate copies of our named NPCs (new game / load must never double them up)
    if (QX.live("actors") && G.actors.list) {
      const seen = {};
      for (const a of G.actors.list())
        if (a && a.id && /^qx_/.test(a.id) && !a.removed)
          seen[a.id] = (seen[a.id] || 0) + 1;
      for (const id in seen)
        if (seen[id] > 1)
          out.issues.push("npc " + id + " spawned " + seen[id] + " times");
      // named street NPCs from other modules sharing a display name with ours
      const names = {};
      for (const a of G.actors.list())
        if (a && a.name && !a.hostile && !a.removed)
          (names[a.name] = names[a.name] || []).push(a.id);
      for (const id of QX.roster) {
        const a = QX.npc(id);
        if (
          a &&
          a.name &&
          names[a.name] &&
          names[a.name].some((o) => !/^qx_/.test(o || ""))
        )
          out.notes.push(
            'display name "' +
              a.name +
              '" also used by ' +
              names[a.name].filter((o) => !/^qx_/.test(o || "")).join(","),
          );
      }
    }
    // 3. pickups
    for (const k in QX.pickups) {
      const pk = QX.pickups[k];
      if (!pk || !pk.pos || QX.flag("got_" + k)) continue;
      out.pickups++;
      if (checkPos) {
        const probs = checkPos(pk.pos, { maxR: 3 });
        if (probs.length)
          out.issues.push(
            "pickup " + k + " @" + fmt(pk.pos) + " " + probs.join(" "),
          );
      }
    }
    // 4. our doors, both directions
    const doors = ((W && W.doors) || []).filter(
      (d) => d.def && /^qx_/.test(d.def.id || ""),
    );
    const blocked = (x, y, z) => QX.blocked(x, y, z, 0.3, 0.45);
    for (const d of doors) {
      out.doors++;
      const p = d.def.pos,
        t = d.def.target,
        name = d.def.id;
      const ty = W.groundHeight(t.x, t.z, (t.y || 0) + 0.8, 0.3);
      if (!isFinite(ty) || ty < (t.y || 0) - 1.2)
        out.issues.push("door " + name + " target has no floor");
      else if (blocked(t.x, ty, t.z))
        out.issues.push("door " + name + " target inside geometry @" + fmt(t));
      else if (
        t.x < (G.LAYOUT ? G.LAYOUT.INTERIOR_X_MIN : 2500) &&
        ty < W.waterLevel + 0.2
      )
        out.issues.push("door " + name + " target in water");
      else {
        // 1.5 m and 3 m ahead of the arrival must be open floor (spawn faces into the room / street)
        for (const s of [1.5, 3]) {
          const fx = t.x - Math.sin(t.yaw) * s,
            fz = t.z - Math.cos(t.yaw) * s;
          const fy = W.groundHeight(fx, fz, ty + 0.6, 0.3);
          if (blocked(fx, fy, fz) || Math.abs(fy - ty) > 0.8) {
            out.issues.push(
              "door " +
                name +
                " arrival faces a wall/drop " +
                s +
                " m ahead (yaw " +
                t.yaw.toFixed(2) +
                ")",
            );
            break;
          }
        }
      }
      const f = QX.freeSpot(
        p.x,
        p.z,
        W.groundHeight(p.x, p.z, (p.y || 0) + 0.8, 0.3),
        { maxR: 2.5 },
      );
      if (!f || f.forced)
        out.issues.push(
          "door " + name + " has no standing room within 2.5 m of " + fmt(p),
        );
      // pairing: the door whose position is nearest this door's target is its return door;
      // this door's arrival must be near that pair and face away from it.
      let pair = null,
        best = 1e9;
      for (const e of doors) {
        if (e === d) continue;
        const q = e.def.pos;
        const dd = Math.hypot(q.x - t.x, q.z - t.z);
        if (dd < best) {
          best = dd;
          pair = e;
        }
      }
      if (!pair || best > 6)
        out.issues.push(
          "door " +
            name +
            " arrival is " +
            best.toFixed(1) +
            " m from its return door (want < 6)",
        );
      else {
        const q = pair.def.pos,
          fx = -Math.sin(t.yaw),
          fz = -Math.cos(t.yaw);
        const ax = t.x - q.x,
          az = t.z - q.z,
          al = Math.hypot(ax, az) || 1;
        if ((fx * ax + fz * az) / al < 0.2)
          out.issues.push(
            "door " + name + " arrival faces back toward " + pair.def.id,
          );
        out.notes.push(
          "door " +
            name +
            " → " +
            fmt(t) +
            " yaw " +
            t.yaw.toFixed(2) +
            ", return door " +
            pair.def.id +
            " " +
            best.toFixed(1) +
            " m behind",
        );
      }
    }
    return out;
  }
  QX.physicalAudit = physicalAudit;

