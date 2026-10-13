// play-inline-548 02 — best
// Lines 376-718 of readable/play-inline-548.pretty.js (statement-aligned).
  function pickNextTracked() {
    let best = null;
    for (const [id, s] of STATE) {
      if (s.status !== "active" || hiddenNow(id)) continue;
      const q = DEFS.get(id);
      if (!q) continue;
      if (
        !best ||
        (q.main && !DEFS.get(best).main) ||
        (s.t > getState(best).t && !!q.main === !!DEFS.get(best).main)
      )
        best = id;
    }
    return best;
  }

  function isActive(id) {
    const s = STATE.get(id);
    return !!s && s.status === "active";
  }
  function isComplete(id) {
    const s = STATE.get(id);
    return !!s && s.status === "completed";
  }
  function isFailed(id) {
    const s = STATE.get(id);
    return !!s && s.status === "failed";
  }
  function isStarted(id) {
    const s = STATE.get(id);
    return !!s && s.status !== "inactive";
  }
  function stage(id) {
    const s = STATE.get(id);
    return s && s.status !== "inactive" ? s.stage : null;
  }
  /** Has the quest ever reached this stage (it's in the log)? */
  function reached(id, stageId) {
    const s = STATE.get(id);
    return !!s && s.log.indexOf(stageId) >= 0;
  }

  function list() {
    const out = [];
    for (const id of DEFS.keys()) {
      const s = STATE.get(id);
      if (s && s.status !== "inactive" && !hiddenNow(id)) out.push(view(id));
    }
    // Main quests first (in story order), then active before completed, then newest first.
    const rank = (v) =>
      (v.active ? 0 : v.completed ? 2 : 3) + (v.main ? 0 : 0.5);
    out.sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (a.main && b.main ? a.order - b.order : 0) ||
        b.startedAt - a.startedAt,
    );
    return out;
  }

  // ---- markers --------------------------------------------------------
  const IXM = () => (G.LAYOUT ? G.LAYOUT.INTERIOR_X_MIN : 2500);
  const doorCache = { n: -1, map: new Map() };
  const anchorCache = new Map(); // lib.anchor() memo (static world)   // redirect(): candidate doors per (player cell → target cell)
  function rawMarkers(id) {
    const q = DEFS.get(id);
    const s = STATE.get(id);
    if (!q || !s || s.status !== "active") return [];
    const sd = stageDef(q, s.stage);
    if (!sd) return [];
    let ms = sd.markers;
    if (typeof ms === "function") ms = safe("markers:" + id, ms);
    const out = [];
    if (Array.isArray(ms))
      for (const m of ms) {
        const r = resolveMarkerSpec(m);
        if (r)
          out.push(
            Object.assign(r, {
              questId: id,
              questName: q.name,
              main: !!q.main,
            }),
          );
      }
    // open side objectives may carry markers too
    for (const so of q.stages) {
      if (!so.sideObjective || !so.markers || s.log.indexOf(so.id) >= 0)
        continue;
      if (sideDone(so) || (so.failIf && safe("failIf", so.failIf))) continue;
      if (so.showIf && !safe("showIf", so.showIf)) continue;
      let mm = so.markers;
      if (typeof mm === "function") mm = safe("markers:" + id, mm);
      if (Array.isArray(mm))
        for (const m of mm) {
          const r = resolveMarkerSpec(m);
          if (r)
            out.push(
              Object.assign(r, {
                questId: id,
                questName: q.name,
                optional: true,
              }),
            );
        }
    }
    return out;
  }
  /** Marker spec may be {x,z,label}, {npc:'id', label}, {anchor:[site,name], fallback:{x,z}, label}, or a function. */
  function resolveMarkerSpec(m) {
    if (!m) return null;
    if (typeof m === "function") m = safe("marker", m);
    if (!m) return null;
    if (m.npc) {
      const a = lib.npc(m.npc);
      if (a && !a.dead && a.pos)
        return {
          x: a.pos.x,
          z: a.pos.z,
          y: a.pos.y,
          label: m.label || a.name,
          interior: a.pos.x >= IXM(),
        };
      if (m.x === undefined) return null;
    }
    if (m.anchor) {
      // Anchors are static: resolve once (the fallback path runs a spiral free-spot
      // search with dozens of collider queries — far too slow for every compass poll).
      const key =
        m.anchor[0] +
        "|" +
        [].concat(m.anchor[1]).join(",") +
        "|" +
        (m.fallback ? m.fallback.x + "," + m.fallback.z : "");
      let p = lib.markerCache.get(key);
      if (p === undefined) {
        p = lib.anchor(m.anchor[0], [].concat(m.anchor[1]), m.fallback) || null;
        lib.markerCache.set(key, p);
      }
      if (p)
        return snapOut(
          { x: p.x, z: p.z, y: p.y, label: m.label, interior: p.x >= IXM() },
          m,
        );
    }
    if (m.pos)
      return {
        x: m.pos.x,
        z: m.pos.z,
        y: m.pos.y || 0,
        label: m.label,
        interior: m.pos.x >= IXM(),
      };
    if (m.x === undefined || m.z === undefined) return null;
    return snapOut(
      {
        x: m.x,
        z: m.z,
        y: m.y || 0,
        label: m.label || "",
        interior: m.interior || m.x >= IXM(),
      },
      m,
    );
  }
  /**
   * A street-level objective given as a point INSIDE a solid building footprint (a site centre, an
   * anchor on a sealed façade) points at that building's door instead — or at the nearest spot a player can
   * stand. Only static street-level markers (not NPCs, not rooftops, not interiors, not {exact:true}); memoised.
   */
  const snapCache = new Map();
  function snapOut(r, spec) {
    if (
      !r ||
      r.interior ||
      spec.exact ||
      spec.npc ||
      (r.y || 0) > 2.5 ||
      !worldBuilt ||
      !G.world ||
      !G.world.query
    )
      return r;
    const key = Math.round(r.x * 2) + "," + Math.round(r.z * 2);
    let s = snapCache.get(key);
    if (s === undefined) {
      s = null;
      const W = G.world,
        gy = W.groundHeight(r.x, r.z, (r.y || 0) + 0.6, 0.3);
      const up = W.groundHeight(r.x, r.z, (r.y || 0) + 12, 0.3);
      const raised = up > gy + 0.3 && !lib.blocked(r.x, up, r.z, 0.3, 0.45); // library steps, a deck: fine as it is
      if (!raised && lib.blocked(r.x, gy, r.z, 0.3, 0.45)) {
        let best = null,
          bd = 30;
        for (const d of lib.doors()) {
          const p = d.def && d.def.pos,
            t = d.def && d.def.target;
          if (!p || !t || p.x >= IXM() || t.x < IXM()) continue;
          const dd = Math.hypot(p.x - r.x, p.z - r.z);
          if (dd < bd) {
            bd = dd;
            best = d;
          }
        }
        if (best)
          s = {
            x: best.def.pos.x,
            z: best.def.pos.z,
            y: best.def.pos.y || 0,
            viaDoor: true,
            doorLabel: best.def.label || "",
          };
        else {
          const f = lib.freeSpot(r.x, r.z, gy, { maxR: 30, noCache: true });
          if (f && !f.forced) s = { x: f.x, z: f.z, y: f.y };
        }
      }
      snapCache.set(key, s);
    }
    return s ? Object.assign({}, r, s, { trueX: r.x, trueZ: r.z }) : r;
  }
  /**
   * Door-aware redirection: when the objective is on the other
   * side of a load door, the compass points at the door instead.
   */
  function redirect(m) {
    const P = G.player && G.player.pos;
    if (!P) return m;
    const pIn = P.x >= IXM(),
      mIn = m.x >= IXM();
    if (!pIn && !mIn) return m;
    if (pIn && mIn && Math.hypot(P.x - m.x, P.z - m.z) < 320) return m;
    const doors = (G.world && G.world.doors) || [];
    // Candidate doors depend only on (player cell, target cell): cache them and just
    // pick the nearest candidate per poll. Invalidated when the door list changes.
    if (doorCache.n !== doors.length) {
      doorCache.n = doors.length;
      doorCache.map.clear();
    }
    const cell = (x, z) => Math.round(x / 150) + "," + Math.round(z / 150);
    const key =
      (pIn ? "in:" + cell(P.x, P.z) : "out") +
      ">" +
      (mIn ? cell(m.x, m.z) : "out:" + Math.round(m.x) + "," + Math.round(m.z));
    let cands = doorCache.map.get(key);
    if (!cands) {
      cands = [];
      if (pIn) {
        // leave the current interior cell: any door inside this cell leading elsewhere
        let direct = null;
        for (const d of doors) {
          const dp = d.def && d.def.pos,
            t = d.def && d.def.target;
          if (!dp || !t) continue;
          if (Math.hypot(dp.x - P.x, dp.z - P.z) > 320) continue;
          if (mIn && Math.hypot(t.x - m.x, t.z - m.z) < 320) {
            direct = d;
            break;
          } // direct link to target cell
          if (t.x >= IXM()) continue;
          cands.push(d);
        }
        if (direct) cands = [direct];
      } else {
        // outside, target inside: the exterior door(s) leading into the target cell
        for (const d of doors) {
          const dp = d.def && d.def.pos,
            t = d.def && d.def.target;
          if (!dp || !t) continue;
          if (dp.x >= IXM() || t.x < IXM()) continue;
          if (Math.hypot(t.x - m.x, t.z - m.z) > 320) continue;
          cands.push(d);
        }
      }
      doorCache.map.set(key, cands);
    }
    let best = null,
      bd = 1e9;
    for (const d of cands) {
      const dp = d.def.pos;
      const dd = Math.hypot(dp.x - P.x, dp.z - P.z);
      if (dd < bd) {
        bd = dd;
        best = d;
      }
    }
    if (!best) return m;
    return Object.assign({}, m, {
      x: best.def.pos.x,
      z: best.def.pos.z,
      y: best.def.pos.y || 0,
      viaDoor: true,
      doorLabel: best.def.label || "",
      trueX: m.x,
      trueZ: m.z,
    });
  }
  /** Markers for the HUD tracker / minimap: the tracked quest's objective(s). all=true → every active quest. */
  function activeMarkers(all) {
    const ids = [];
    if (all || !TRACKED || !isActive(TRACKED)) {
      for (const [id, s] of STATE)
        if (s.status === "active" && !hiddenNow(id)) ids.push(id);
    } else ids.push(TRACKED);
    const out = [];
    for (const id of ids) for (const m of rawMarkers(id)) out.push(redirect(m));
    return out;
  }
  function allMarkers() {
    return activeMarkers(true);
  }

  function setTracked(id) {
    if (id && hiddenNow(id)) id = ABSORB[id];
    if (id === null || isActive(id)) {
      TRACKED = id;
      G.events.emit("questTracked", id);
      return true;
    }
    return false;
  }
  function tracked() {
    return TRACKED;
  }

  // ---- flags ------------------------------------------------------------
  function flag(name) {
    return FLAGS[name];
  }
  function setFlag(name, v) {
    FLAGS[name] = v === undefined ? true : v;
    G.events.emit("questFlag", name, FLAGS[name]);
    return FLAGS[name];
  }
  function incFlag(name, n) {
    FLAGS[name] = (Number(FLAGS[name]) || 0) + (n === undefined ? 1 : n);
    return FLAGS[name];
  }

  // ---- endings ----------------------------------------------------------
  function defineEnding(id, fn) {
    ENDINGS.set(id, fn);
  }
