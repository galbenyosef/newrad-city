// play-inline-210 03 — out
// Lines 27-321 of readable/play-inline-210.pretty.js (statement-aligned).
  const IXM = () => (G.LAYOUT ? G.LAYOUT.INTERIOR_X_MIN : 2500);
  const fmt = (p) =>
    (p.x || 0).toFixed(1) +
    "," +
    (p.y || 0).toFixed(1) +
    "," +
    (p.z || 0).toFixed(1);

  function lib() {
    return (G.quests && G.quests.lib) || null;
  }
  function blocked(x, y, z, r) {
    const L = lib();
    if (L && L.blocked) return L.blocked(x, y, z, r || 0.3, 0.45);
    return false;
  }
  function free(x, z, y, maxR) {
    const L = lib();
    if (!L || !L.freeSpot) return { x, y, z };
    return L.freeSpot(x, z, y, { maxR: maxR || 2.5, noCache: true });
  }

  // Door pairs (enter ↔ exit) — the arrival of one must sit near the other, facing away.
  const PAIRS = [
    ["pf_tr_enter", "pf_tr_exit"],
    ["pf_tr_lookout_out", "pf_tr_lookout_in"],
    ["pf_fed_enter", "pf_fed_exit"],
    ["pf_ft_enter", "pf_ft_exit"],
    ["pf_ft_bulk_in", "pf_ft_bulk_out"],
    ["pf_sp_market_in", "pf_sp_market_out"],
    ["pf_sp_dock_in", "pf_sp_dock_out"],
    ["pf_sp_fore_in", "pf_sp_fore_out"],
    ["pf_sp_aft_in", "pf_sp_aft_out"],
  ];

  function physicalAudit() {
    const out = { issues: [], notes: [], doors: 0, npcs: 0 };
    const W = G.world;
    const doors = (W.doors || []).filter(
      (d) => d.def && /^pf_/.test(d.def.id || ""),
    );
    const byId = {};
    for (const d of doors) byId[d.def.id] = d;
    for (const [a, b] of PAIRS) {
      if (!byId[a]) out.issues.push("door " + a + " missing");
      if (!byId[b]) out.issues.push("door " + b + " missing");
    }
    const pairOf = {};
    for (const [a, b] of PAIRS) {
      pairOf[a] = b;
      pairOf[b] = a;
    }
    for (const d of doors) {
      out.doors++;
      const p = d.def.pos,
        t = d.def.target,
        name = d.def.id;
      if (!t) {
        out.issues.push("door " + name + " has no target");
        continue;
      }
      const ty = W.groundHeight(t.x, t.z, (t.y || 0) + 0.8, 0.3);
      if (!isFinite(ty) || ty < (t.y || 0) - 1.2)
        out.issues.push("door " + name + " target has no floor @" + fmt(t));
      else if (blocked(t.x, ty, t.z))
        out.issues.push("door " + name + " target inside geometry @" + fmt(t));
      else if (t.x < IXM() && ty < W.waterLevel + 0.2)
        out.issues.push("door " + name + " target in water");
      else {
        for (const s of [1.5, 3]) {
          const fx = t.x - Math.sin(t.yaw || 0) * s,
            fz = t.z - Math.cos(t.yaw || 0) * s;
          const fy = W.groundHeight(fx, fz, ty + 0.6, 0.3);
          if (blocked(fx, fy, fz) || Math.abs(fy - ty) > 0.8) {
            out.issues.push(
              "door " +
                name +
                " arrival faces a wall/drop " +
                s +
                " m ahead (yaw " +
                (t.yaw || 0).toFixed(2) +
                ") @" +
                fmt(t),
            );
            break;
          }
        }
      }
      const f = free(
        p.x,
        p.z,
        W.groundHeight(p.x, p.z, (p.y || 0) + 0.8, 0.3),
        2.5,
      );
      if (!f || f.forced)
        out.issues.push(
          "door " + name + " has no standing room within 2.5 m of " + fmt(p),
        );
      const pr = byId[pairOf[name]];
      if (pr) {
        const q = pr.def.pos,
          dd = Math.hypot(q.x - t.x, q.z - t.z);
        if (dd > 6)
          out.issues.push(
            "door " +
              name +
              " arrival is " +
              dd.toFixed(1) +
              " m from its return door " +
              pr.def.id,
          );
        const fx = -Math.sin(t.yaw || 0),
          fz = -Math.cos(t.yaw || 0);
        const ax = t.x - q.x,
          az = t.z - q.z,
          al = Math.hypot(ax, az) || 1;
        const dot = (fx * ax + fz * az) / al;
        if (dot < 0.2)
          out.issues.push(
            "door " +
              name +
              " arrival faces back toward " +
              pr.def.id +
              " (dot " +
              dot.toFixed(2) +
              ")",
          );
        out.notes.push(
          name +
            " → " +
            fmt(t) +
            " yaw " +
            (t.yaw || 0).toFixed(2) +
            ", return " +
            pr.def.id +
            " " +
            dd.toFixed(1) +
            " m, dot " +
            dot.toFixed(2),
        );
      }
    }
    // named NPCs
    const D = G.quests && G.quests.debug;
    for (const def of PF.npcDefs) {
      const a = PF.getNpc(def.id);
      if (!a || !a.pos || a.dead) {
        if (
          !def.hostile &&
          !/maniac|sexton|warden|shellback|robot|_m\d|_t\d|patrolman/i.test(
            def.id + " " + (def.type || ""),
          ) &&
          !def.when
        )
          out.notes.push("npc " + def.id + " not spawned");
        continue;
      }
      out.npcs++;
      if (D && D.checkPos) {
        const probs = D.checkPos(
          { x: a.pos.x, y: a.pos.y, z: a.pos.z },
          { actor: true, r: 0.25, maxR: 3, flyOk: !!a.flying },
        );
        if (probs.length)
          out.issues.push(
            "npc " + def.id + " @" + fmt(a.pos) + " " + probs.join(" "),
          );
      }
    }
    // quest markers + dialogue lint (quests module audit, our quests only)
    if (D && D.audit) {
      const r = D.audit({
        filter: /^pf_/,
        npcs: false,
        doors: false,
        dialogue: /^pf_/,
        maxR: 6,
      });
      out.markers = r.markers;
      for (const i of r.issues) {
        if (i.sev === "high" || i.sev === "med")
          out.issues.push(
            "marker " + i.quest + "/" + i.stage + " " + i.kind + ": " + i.msg,
          );
        else if (i.sev === "low")
          out.notes.push("marker " + i.quest + "/" + i.stage + ": " + i.msg);
      }
      if (r.dialogue)
        for (const p of r.dialogue.problems) out.issues.push("dialogue " + p);
    }
    return out;
  }

  // ------------------------------------------------------------------
  // playthrough helpers
  // ------------------------------------------------------------------
  function node(dlg, id) {
    const t = G.dialogue.get(dlg);
    if (!t) throw new Error("no dialogue " + dlg);
    const n = t.nodes[id];
    if (!n) throw new Error("no node " + dlg + "." + id);
    return n;
  }
  function startNode(dlg) {
    const t = G.dialogue.get(dlg);
    return typeof t.start === "function" ? t.start() : t.start;
  }
  /** enter a node (onEnter + text) and optionally pick the response whose text matches `pick` (RegExp) */
  function say(dlg, id, pick) {
    const n = node(dlg, id);
    if (n.onEnter) n.onEnter();
    if (typeof n.text === "function") n.text();
    if (pick === undefined) return null;
    const rs =
      (typeof n.responses === "function" ? n.responses() : n.responses) || [];
    const txt = (r) => (typeof r.text === "function" ? r.text() : r.text) || "";
    const r = rs.find((x) => pick.test(txt(x)) && (!x.cond || x.cond()));
    if (!r)
      throw new Error(
        "no available response " +
          pick +
          " in " +
          dlg +
          "." +
          id +
          " (have: " +
          rs
            .filter((x) => !x.cond || x.cond())
            .map(txt)
            .join(" / ") +
          ")",
      );
    if (r.action) r.action();
    if (r.next) {
      const nn = node(dlg, r.next);
      if (nn.onEnter) nn.onEnter();
    }
    return r.next || null;
  }
  function interact(labelRe, near) {
    const W = G.world;
    const cands = W.interactables.filter((it) => {
      const l = typeof it.label === "function" ? it.label() : it.label;
      return labelRe.test(l || "");
    });
    if (!cands.length) throw new Error("no interactable " + labelRe);
    let best = cands[0];
    if (near) {
      let bd = 1e9;
      for (const c of cands) {
        const p = c.getPos ? c.getPos() : c.pos;
        const d = Math.hypot(p.x - near.x, p.z - near.z);
        if (d < bd) {
          bd = d;
          best = c;
        }
      }
    }
    best.onInteract();
    return best;
  }
  function term(id, titleRe) {
    const rec = PF.termDefs.find((x) => x[0] === id);
    if (!rec) throw new Error("no terminal " + id);
    const e = rec[1].entries.find((x) =>
      titleRe.test(typeof x.title === "function" ? x.title() : x.title),
    );
    if (!e) throw new Error("no entry " + titleRe + " in " + id);
    return e.action();
  }
  /** teleport into a point and fire any PF trigger containing it (as the 5 Hz updater would) */
  function enter(p) {
    G.player.teleport(p.x, p.y, p.z);
    for (const t of PF.triggers) {
      if (t.fired && !t.repeat) continue;
      const b = t.box;
      if (p.x < b.x0 || p.x > b.x1 || p.z < b.z0 || p.z > b.z1) continue;
      if (b.y0 !== undefined && (p.y < b.y0 || p.y > b.y1)) continue;
      if (t.cond && !t.cond()) continue;
      t.fired = true;
      t.inside = true;
      t.fn();
    }
  }
  const A = (poi, n) => {
    const a = G.pois.getAnchor(poi, n);
    if (!a) throw new Error("no anchor " + poi + "." + n);
    return a;
  };
  const stage = (id) => G.quests.stage(id);
  const expect = (c, m) => {
    if (!c) throw new Error(m);
  };
  const has = (id) => (G.isStub("inventory") ? 1 : G.inventory.count(id));

