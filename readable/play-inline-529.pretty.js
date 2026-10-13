/* src/ambient_life/95_stage.js */
/* =====================================================================
 * NEW RAD CITY — AMBIENT LIFE — 95: staging (screenshots / debug)
 *
 * `?ambstage=<scene>` (with tools/shot.py's ?shot=...) stages an ambient
 * scene in front of the camera right after the shot's newGame, so the
 * module's visuals can be reviewed headlessly:
 *   rotorcraft | rotorcraft_covenant | oxen | convoy | birds | crash |
 *   preacher | stranger | slavers | campfire | <any encounter kind>
 * Also `G.ambient.stage(scene)` from the console and
 * `G.ambient.encounterAt(kind, x, z)` (forces the encounter's spawn spot).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const K = G.ambient._;
  const A = G.ambient;
  const QS = G.QS || new URLSearchParams(location.search);

  const staged = []; // {obj, update(dt)} animated props
  let pending = QS.get("ambstage") || null;

  function ahead(d, side) {
    const P = G.player,
      yaw = P.yaw;
    const fx = -Math.sin(yaw),
      fz = -Math.cos(yaw);
    return {
      x: P.pos.x + fx * d + fz * (side || 0),
      z: P.pos.z + fz * d - fx * (side || 0),
      yaw,
    };
  }
  function ground(x, z) {
    const y = K.groundAt(x, z, 0.5);
    return y === null ? G.world.groundHeight(x, z, 2, 0.3) : y;
  }

  function encounterAt(kind, x, z) {
    K._forceSpot = { x, z, y: ground(x, z) };
    const E = K.encounters ? K.encounters.start(kind) : null;
    K._forceSpot = null;
    return E;
  }

  function stage(scene) {
    const P = G.player;
    const f = ahead(1);
    switch (scene) {
      case "rotorcraft":
      case "rotorcraft_covenant": {
        const rc = K.rotorcraft.create(
          scene === "rotorcraft" ? "continuity" : "covenant",
        );
        const p = ahead(30, 6);
        rc.root.position.set(p.x, P.pos.y + 11, p.z);
        rc.root.rotation.order = "YXZ";
        rc.root.rotation.y = f.yaw + Math.PI * 0.8;
        rc.root.rotation.z = 0.05;
        G.scene.add(rc.root);
        staged.push({
          obj: rc,
          update(dt) {
            rc.animate(dt, 3.6, 0.15, K.now());
          },
        });
        return rc;
      }
      case "oxen": {
        const out = [];
        for (let i = 0; i < 3; i++) {
          const p = ahead(6 + i * 2.2, (i - 1) * 3.2);
          const b = K.oxen.spawnActor({
            pos: { x: p.x, y: ground(p.x, p.z), z: p.z },
            yaw: f.yaw + Math.PI * (0.35 + i * 0.4),
            variant: i,
            pack: i !== 2,
            ai: "static",
          });
          if (b) out.push(b);
        }
        return out;
      }
      case "convoy": {
        const p = ahead(12);
        return K.convoys ? K.convoys.bringTo(3, p.x, p.z) : null;
      }
      case "birds": {
        const p = ahead(7);
        K.fauna.spawnFlock("pigeon", p.x, ground(p.x, p.z), p.z, 9, { r: 2 });
        const c = ahead(40);
        K.fauna.spawnFlock("crow", c.x, P.pos.y + 16, c.z, 8, { r: 9 });
        return true;
      }
      case "crash": {
        const p = ahead(24);
        return encounterAt("crash_site", p.x, p.z);
      }
      case "selftest":
        return selfTest();
      default: {
        if (K.encounters && K.encounters.kinds().indexOf(scene) >= 0) {
          const p = ahead(scene === "stranger" ? 16 : 10);
          return encounterAt(scene, p.x, p.z);
        }
        console.warn("[ambient] unknown stage", scene);
        return null;
      }
    }
  }

  /**
   * Headless self-test (?ambstage=selftest): starts every encounter kind at a forced spot, ticks it,
   * walks every ambient dialogue node's text/cond/label functions, forces a firefight to go real,
   * a Rotorcraft drop and a convoy; writes a JSON report into <pre id="amb-selftest">.
   */
  function selfTest() {
    const rep = { kinds: {}, dialogs: {}, errorsBefore: G.errors.length };
    const E0 = G.errors.length;
    const call = (f) => (typeof f === "function" ? f() : f);
    const P = G.player;
    for (const kind of K.encounters.kinds()) {
      if (kind === "hit_squad") continue;
      const p = ahead(28);
      let E = null;
      try {
        E = encounterAt(kind, p.x, p.z);
      } catch (e) {
        G.reportError("selftest " + kind, e);
      }
      const r = (rep.kinds[kind] = {
        started: !!E,
        actors: E && E.actors ? E.actors.filter(Boolean).length : 0,
      });
      if (E) {
        try {
          for (let i = 0; i < 6; i++) {
            const res = E.update(0.25, 0.25);
            if (res) {
              r.ended = res;
              break;
            }
          }
        } catch (e) {
          G.reportError("selftest update " + kind, e);
          r.err = String(e);
        }
        // walk the player up to it (triggers proximity logic: bait springs, citation, hails)
        try {
          if (!r.ended) {
            P.pos.x = E.x + 3;
            P.pos.z = E.z + 3;
            for (let i = 0; i < 4; i++) {
              const res = E.update(0.25, 0.25);
              if (res) {
                r.ended = res;
                break;
              }
            }
          }
        } catch (e) {
          G.reportError("selftest near " + kind, e);
          r.err = String(e);
        }
        r.after = E.state || null;
        try {
          K.encounters.end("selftest");
        } catch (e) {
          G.reportError("selftest end " + kind, e);
        }
      }
    }
    try {
      rep.hitSquad = !!K.encounters.hitSquad("merc");
      K.encounters.end("selftest");
    } catch (e) {
      G.reportError("selftest hitsquad", e);
    }
    // dialogues: evaluate every function field
    for (const id in K._dlg) {
      const T = K._dlg[id];
      let n = 0;
      try {
        call(T.start);
        for (const nid in T.nodes) {
          const nd = T.nodes[nid];
          call(nd.text);
          n++;
          for (const r of nd.responses || []) {
            call(r.text);
            if (typeof r.cond === "function") r.cond();
          }
        }
      } catch (e) {
        G.reportError("selftest dialog " + id, e);
      }
      rep.dialogs[id] = n;
    }
    // systems
    try {
      const p = ahead(60);
      const f = K.distant.startFight({
        x: p.x,
        z: p.z,
        a: "raiders",
        b: "settlers",
      });
      rep.firefight = !!f;
      rep.firefightActors = (K.distant.goReal() || []).length;
    } catch (e) {
      G.reportError("selftest firefight", e);
    }
    try {
      rep.rotorcraft = !!K.rotorcraft.fly("continuity", "deploy");
    } catch (e) {
      G.reportError("selftest rotorcraft", e);
    }
    try {
      const p = ahead(20);
      rep.convoy = !!(K.convoys && K.convoys.bringTo(0, p.x, p.z));
    } catch (e) {
      G.reportError("selftest convoy", e);
    }
    try {
      rep.march = !!K.synth.march;
    } catch (e) {
      /* ignore */
    }
    rep.stats = A.stats();
    rep.newErrors = G.errors
      .slice(E0)
      .map((e) => String(e.msg || e.message || e).slice(0, 200));
    const pre = document.createElement("pre");
    pre.id = "amb-selftest";
    pre.style.display = "none";
    pre.textContent = "AMBTEST_BEGIN" + JSON.stringify(rep) + "AMBTEST_END";
    document.body.appendChild(pre);
    return rep;
  }

  K.system({
    name: "stage",
    order: 99,
    reset() {
      for (const s of staged) {
        try {
          s.obj.dispose ? s.obj.dispose() : null;
        } catch (e) {
          /* ignore */
        }
      }
      staged.length = 0;
    },
    update(dt) {
      if (pending && G.state === "play" && K.playerOk()) {
        const s = pending;
        pending = null;
        // hold the timed ambient systems still so the staged scene is the only one
        try {
          stage(s);
        } catch (e) {
          G.reportError("ambient:stage " + s, e);
        }
      }
      for (const s of staged) s.update(dt);
    },
  });

  A.stage = stage;
  A.encounterAt = encounterAt;
})();
