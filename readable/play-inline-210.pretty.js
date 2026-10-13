/* src/poi_financial/95_selftest.js */
/* =====================================================================
 * NEW RAD CITY — POI FINANCIAL — 95: SELF-TEST (?pftest)
 * With ?pftest in the URL (together with ?smoke=1) this, after the new
 * game starts:
 *   1. PHYSICAL audit — every load door this module owns, BOTH directions:
 *      the door has standing room, its arrival has floor, is clear of
 *      geometry, looks into open space (1.5 m / 3 m ahead) and — for
 *      paired doors — lands near the return door facing AWAY from it;
 *      every named NPC stands on free floor; every quest marker of the
 *      module resolves (quests module's audit, filter /^pf_/).
 *   2. PLAYTHROUGH — every quest of the module is driven to completion
 *      through the real dialogue trees, terminals, interactables, area
 *      triggers and item events (fades are run synchronously).
 * Results: console + G.warnings ('[pftest] ...') + window.PF_TEST +
 * <pre id="pftest-out"> (for --dump-dom). Failures → G.reportError.
 * Never runs in normal play.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G._pf) return;
  const PF = G._pf;
  const ON = /[?&]pftest\b/.test(location.search);
  if (!ON) return;

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

  function run() {
    const res = { ok: true, steps: [], fails: [], physical: null };
    try {
      res.physical = physicalAudit();
    } catch (e) {
      res.physical = {
        issues: ["audit threw " + ((e && e.stack) || e)],
        notes: [],
      };
    }
    if (res.physical.issues.length) {
      res.ok = false;
      res.fails.push(
        "physical: " +
          res.physical.issues.length +
          " issue(s): " +
          res.physical.issues.join(" | "),
      );
    }
    const step = (name, fn) => {
      try {
        fn();
        res.steps.push("ok " + name);
      } catch (e) {
        res.ok = false;
        res.fails.push(name + ": " + (e && e.message));
      }
    };
    const live =
      !G.isStub("quests") && !G.isStub("dialogue") && !G.isStub("inventory");
    if (live) {
      const fade0 = G.fadeTransition;
      G.fadeTransition = (fn) => {
        fn();
      };
      const P0 = G.player.pos.clone(),
        Y0 = G.player.yaw;
      try {
        step("quests defined", () => {
          for (const id of [
            "pf_dust",
            "pf_gold",
            "pf_deep",
            "pf_shellback_omelette",
            "pf_seeds",
          ])
            expect(G.quests.get ? G.quests.get(id) : true, "missing " + id);
        });
        step("npcs spawned", () => {
          if (G.isStub("actors")) return;
          for (const id of [
            "pf_tr_reverend",
            "pf_tr_doctor",
            "pf_ft_vane",
            "pf_ft_nan",
            "pf_ft_dilly",
            "pf_ft_hollis",
            "pf_sp_lottie",
            "pf_tr_sexton",
            "pf_fed_warden",
          ])
            expect(PF.getNpc(id), "no npc " + id);
        });

        // ---- Dust to Dust
        step("dust: Pell → key", () => {
          const s = startNode("pf_dlg_pell");
          say("pf_dlg_pell", s);
          say("pf_dlg_pell", "problem", /take a look/);
          expect(stage("pf_dust") === "key", "stage " + stage("pf_dust"));
          expect(has("pf_crypt_key"), "no key");
        });
        step("dust: unlock crypt gate", () => {
          interact(/^Crypt Gate$/, A("trinity_church", "crypt_door"));
          expect(PF.flag("tr_crypt_open"), "gate not open");
          expect(stage("pf_dust") === "crypt", "stage " + stage("pf_dust"));
        });
        step("dust: descend → clear", () => {
          const c = A("trinity_church", "crypt");
          enter({ x: c.x, y: c.y + 0.1, z: c.z });
          expect(stage("pf_dust") === "clear", "stage " + stage("pf_dust"));
        });
        step("dust: kill the Sexton → breach", () => {
          const a = PF.getNpc("pf_tr_sexton");
          if (a && a.kill) a.kill({});
          else G.events.emit("actorKilled", { id: "pf_tr_sexton" });
          expect(stage("pf_dust") === "breach", "stage " + stage("pf_dust"));
        });
        step("dust: seal breach (dialogue) → report", () => {
          const b = A("trinity_church", "breach");
          G.player.teleport(b.x, b.y + 0.05, b.z);
          expect(
            G.world.interactables.some(
              (it) =>
                (typeof it.label === "function" ? it.label() : it.label) ===
                "The Breach",
            ),
            "no breach interactable",
          );
          say("pf_dlg_breach", startNode("pf_dlg_breach"), /rubble/i);
          expect(stage("pf_dust") === "report", "stage " + stage("pf_dust"));
        });
        step("dust: report → Weehawken", () => {
          expect(
            startNode("pf_dlg_pell") === "report",
            "Pell start " + startNode("pf_dlg_pell"),
          );
          say("pf_dlg_pell", "report", /at rest/);
          expect(
            G.quests.isComplete("pf_dust"),
            "not complete " + stage("pf_dust"),
          );
          expect(has("pf_weehawken"), "no Weehawken");
        });

        // ---- The Gold Standard
        step("gold: Vane → enter", () => {
          say("pf_dlg_vane", startNode("pf_dlg_vane"), /Federal Reserve/);
          say("pf_dlg_vane", "job", /^I'm in/);
          expect(stage("pf_gold") === "enter", "stage " + stage("pf_gold"));
        });
        step("gold: street door → hall → power", () => {
          const d = G.world.doors.find(
            (x) => x.def && x.def.id === "pf_fed_enter",
          );
          expect(d, "no door");
          d._locked = 0;
          d.onInteract();
          const p = G.player.pos;
          enter({ x: p.x, y: p.y, z: p.z });
          expect(stage("pf_gold") === "power", "stage " + stage("pf_gold"));
        });
        step("gold: security terminal → descend", () => {
          term("pf_fed_security", /Vault Elevator/);
          expect(stage("pf_gold") === "descend", "stage " + stage("pf_gold"));
        });
        step("gold: elevator → door", () => {
          interact(
            /Vault Elevator \(Level V\)/,
            A("federal_reserve", "elevator_up"),
          );
          expect(stage("pf_gold") === "door", "stage " + stage("pf_gold"));
          const d = A("federal_reserve", "elevator_down");
          expect(
            Math.abs(G.player.pos.y - d.y) < 1.5,
            "not on Level V: y " + G.player.pos.y.toFixed(1),
          );
        });
        step("gold: control → cylinder turns → ledger", () => {
          term("pf_fed_vault", /Cylinder Door/);
          for (let i = 0; i < 90; i++)
            for (const fn of PF.updaters) {
              try {
                fn(0.1, 0.1);
              } catch (e) {
                /* ignore */
              }
            }
          expect(stage("pf_gold") === "ledger", "stage " + stage("pf_gold"));
        });
        step("gold: ledger → return → Vane", () => {
          const L = A("federal_reserve", "ledger");
          expect(
            PF.pickupQ.some(
              (p) =>
                p.id === "pf_reserve_ledger" &&
                Math.hypot(p.pos.x - L.x, p.pos.z - L.z) < 3,
            ),
            "ledger pickup not at its anchor",
          );
          G.inventory.add("pf_reserve_ledger", 1);
          expect(stage("pf_gold") === "return", "stage " + stage("pf_gold"));
          expect(
            startNode("pf_dlg_vane") === "ledger",
            "Vane start " + startNode("pf_dlg_vane"),
          );
          say("pf_dlg_vane", "ledger", /As agreed/);
          expect(G.quests.isComplete("pf_gold"), "not complete");
        });

        // ---- Low Tide
        step("deep: knock → talk → ship", () => {
          G.quests.start("pf_deep");
          interact(/Barricaded Office/, A("seaport", "mezz"));
          expect(stage("pf_deep") === "talk", "stage " + stage("pf_deep"));
          say("pf_dlg_lottie", startNode("pf_dlg_lottie"), /look for Cal/);
          expect(stage("pf_deep") === "ship", "stage " + stage("pf_deep"));
        });
        step("deep: hold → nest", () => {
          const h = A("seaport", "hold_fore");
          const n = A("seaport", "nest");
          enter({ x: (h.x + n.x) / 2, y: n.y + 0.2, z: n.z });
          enter({ x: n.x, y: n.y + 0.2, z: n.z });
          expect(
            ["nest", "ship"].indexOf(stage("pf_deep")) >= 0,
            "stage " + stage("pf_deep"),
          );
        });
        step("deep: harvest + destroy the nest → report", () => {
          const s = startNode("pf_dlg_nest");
          say("pf_dlg_nest", s, /Harvest/);
          expect(
            has("pf_shellback_egg") >= 6 || G.isStub("inventory"),
            "no eggs",
          );
          say("pf_dlg_nest", "root", /Smash/);
          expect(stage("pf_deep") === "report", "stage " + stage("pf_deep"));
        });
        step("deep: Cal tape reel → optional done", () => {
          G.inventory.add("pf_reel_cal", 1);
          expect(PF.flag("sp_cal"), "flag");
        });
        step("deep: report → complete", () => {
          expect(
            startNode("pf_dlg_lottie") === "report",
            "Lottie start " + startNode("pf_dlg_lottie"),
          );
          say("pf_dlg_lottie", "report", /sorry/);
          expect(G.quests.isComplete("pf_deep"), "not complete");
          expect(PF.flag("sp_market"), "market flag");
        });

        // ---- A Taste of the Sea (eggs already in the pack when the quest starts)
        step("omelette: Nan → start with eggs in pack → bring", () => {
          say("pf_dlg_nan", "root", /anything for the kitchen/);
          say("pf_dlg_nan", "need", /Five shellback/);
          expect(G.quests.isActive("pf_shellback_omelette"), "not started");
          expect(
            stage("pf_shellback_omelette") === "bring",
            "stage " +
              stage("pf_shellback_omelette") +
              " with " +
              has("pf_shellback_egg") +
              " eggs",
          );
          say("pf_dlg_nan", "eggs", /omelette/);
          expect(G.quests.isComplete("pf_shellback_omelette"), "not complete");
        });

        // ---- Victory Garden
        step("seeds: Dilly → cold store tin → bring", () => {
          say("pf_dlg_dilly", startNode("pf_dlg_dilly"), /What would help/);
          say("pf_dlg_dilly", "need", /get your seeds/);
          expect(stage("pf_seeds") === "find", "stage " + stage("pf_seeds"));
          const c = A("seaport", "cold_store");
          expect(
            PF.pickupQ.some(
              (p) =>
                p.id === "pf_seed_tin" &&
                Math.hypot(p.pos.x - c.x, p.pos.z - c.z) < 4,
            ),
            "tin pickup not in the cold store",
          );
          G.inventory.add("pf_seed_tin", 1);
          expect(stage("pf_seeds") === "bring", "stage " + stage("pf_seeds"));
          say("pf_dlg_dilly", "root", /seed tin/);
          say("pf_dlg_dilly", "tin", /Plant them/);
          expect(G.quests.isComplete("pf_seeds"), "not complete");
        });
      } finally {
        G.fadeTransition = fade0;
        try {
          G.player.teleport(P0.x, P0.y, P0.z, Y0);
        } catch (e) {
          /* ignore */
        }
      }
    } else
      res.steps.push("skip playthrough (quests/dialogue/inventory stubbed)");

    const summary =
      "[pftest] " +
      (res.ok ? "PASS" : "FAIL") +
      " " +
      res.steps.length +
      " ok, " +
      res.fails.length +
      " failed" +
      (res.fails.length ? ": " + res.fails.join(" || ") : "");
    console.log(summary);
    if (G.warnings) G.warnings.unshift(summary.slice(0, 2000));
    if (!res.ok)
      G.reportError(
        "poi_financial:selftest",
        new Error(res.fails.join(" || ").slice(0, 3000)),
      );
    window.PF_TEST = res;
    try {
      const pre = document.createElement("pre");
      pre.id = "pftest-out";
      pre.style.display = "none";
      pre.textContent = JSON.stringify(res, null, 1);
      document.body.appendChild(pre);
    } catch (e) {
      /* ignore */
    }
    return res;
  }
  PF.selfTest = run;

  let done = false;
  G.events.on("newGame", () => {
    if (done) return;
    done = true;
    setTimeout(() => {
      try {
        run();
      } catch (e) {
        G.reportError("poi_financial:selftest", e);
      }
    }, 600);
  });
})();
