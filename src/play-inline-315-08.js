// play-inline-315 08 — ctx
// Lines 3955-4296 of readable/play-inline-315.pretty.js (statement-aligned).
  function data(ctx) {
    K.defineItem({
      id: "ph_ny_elev_key",
      type: "key",
      name: "Bell Captain's Elevator Key",
      weight: 0,
      value: 0,
      desc: 'A brass key on a red tassel, stamped "CAR 3 — EXPRESS". The tassel smells of pigeon.',
    });
    K.defineItem({
      id: "ph_ny_q_notebook",
      type: "misc",
      name: "Tesla's Last Notebook",
      weight: 0.5,
      value: 0,
      quest: true,
      desc: "Oilcloth cover, rubber band, two hundred pages of microscopic handwriting: resonance, wireless power, the Teleforce. A single white feather pressed between the last pages.",
    });
    K.defineItem({
      id: "ph_ny_pigeon_feather",
      type: "misc",
      name: "White Pigeon Feather",
      weight: 0,
      value: 5,
      desc: "Snow white. It crackles faintly with static when you hold it.",
    });
    // unique gyrojet, cloned from the gyrojet carbine
    K.safe("teleforce", () => {
      if (G.isStub("items") || !G.items.get || K.itemExists("ph_ny_teleforce"))
        return;
      const base = G.items.get("gyrojet_carbine");
      const w =
        base && base.weapon
          ? JSON.parse(
              JSON.stringify(base.weapon, (k, v) =>
                typeof v === "function" ? undefined : v,
              ),
            )
          : {
              skill: "firearms",
              rof: 2.0,
              magSize: 10,
              ammo: "ammo_gyrojet",
              reloadTime: 2.6,
              spread: 0.014,
              adsSpread: 0.0025,
              range: 300,
              sound: "gun_missile",
              viewmodel: "gyrojet_carbine",
              damageType: "ballistic",
              reloadType: "mag",
              flash: "gyro",
              customProj: "gyro",
              projectileSpeed: 300,
            };
      Object.assign(w, {
        damage: 48,
        rof: 2.0,
        magSize: 12,
        critMult: 2.5,
        critChance: 2,
        gyro: { min: 1, full: 1, over: 0.1 },
        sfxPitch: 0.7,
        condDecay: 0.0008,
      });
      G.items.define({
        id: "ph_ny_teleforce",
        type: "weapon",
        name: "Teleforce",
        weight: 9,
        value: 3500,
        unique: true,
        desc: "Prototype 7 of a projectile gun Nikola Tesla sketched in 1934, finished thirty-three years later in a hotel room on 34th Street around a gyrojet carbine. A coil in the barrel throws each rocket out already at full speed: no weak first metres. Smells like a thunderstorm.",
        weapon: w,
      });
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ph_room_3327",
        name: "The Pigeon Man of Room 3327",
        giver: "Archibald Pembroke",
        location: "Hotel New Yorker",
        desc: 'Archibald Pembroke, who was a bellhop at the Hotel New Yorker on the day the bombs fell, swears the "gentleman in 3327" kept working long after he died — and that the Stanhope Foundation hid something on the 33rd floor. Robots still guard it.',
        stages: [
          // inside the lobby the marker moves to Car 3, the express to 33 (its key is in the Bell Captain's lockbox; Stair B off the mezzanine is the long way)
          {
            id: "find",
            text: "Reach the 33rd floor of the Hotel New Yorker (8th Avenue & 34th Street).",
            markers: [
              () => {
                const c = PH.nyCtx,
                  d = c && c.inside && c.elevDoor,
                  p = d && d.def && d.def.pos;
                return p
                  ? {
                      x: p.x,
                      y: p.y - 1.3,
                      z: p.z,
                      label: "Elevator Car 3 — 33rd Floor",
                    }
                  : nyMarker("entrance", "Hotel New Yorker");
              },
            ],
          },
          {
            id: "suite",
            text: "Search Room 3327, the Tesla Suite.",
            markers: [() => nyMarker("suite", "Room 3327")],
          },
          {
            id: "lab",
            text: "Find the laboratory hidden behind the Tesla Suite.",
            markers: [() => nyMarker("wardrobe", "Wardrobe")],
          },
          {
            id: "coils",
            text: "Shut down the Tesla coils from the control booth.",
            markers: [() => nyMarker("booth", "Control Booth")],
          },
          {
            id: "notebook",
            text: "Take Tesla's last notebook from Dr. Stanhope's desk.",
            markers: [() => nyMarker("notebook", "Tesla's Notebook")],
          },
          {
            id: "tf",
            text: "(Optional) Claim the Teleforce from the Faraday cage.",
            sideObjective: true,
            optional: true,
            showIf: () => K.q.active("ph_room_3327"),
            doneIf: () => !!PH.flag("ny_teleforce"),
          },
          {
            id: "return",
            text: "Bring Tesla's notebook to Pembroke at the Penny & Price Automat.",
            markers: [{ npc: "ph_pembroke", label: "Pembroke" }],
          },
        ],
        rewards: { xp: 400 },
      });
    }
  }
  function nyMarker(name, label) {
    const a = PH.anchor("hotel_new_yorker", name);
    return a ? { x: a.x, y: a.y, z: a.z, label } : null;
  }
  const ORDER = ["find", "suite", "lab", "coils", "notebook", "return"];
  /** Advance the quest forward to `st` (never backwards); start it if needed. */
  PH.nyQuestTo = function (st) {
    const id = "ph_room_3327";
    if (K.q.done(id)) return;
    if (!K.q.active(id)) {
      K.q.start(id, { stage: st });
      if (K.q.active(id) && K.q.stage(id) !== st) K.q.set(id, st);
      return;
    }
    const cur = ORDER.indexOf(K.q.stage(id)),
      nxt = ORDER.indexOf(st);
    if (nxt > cur) K.q.set(id, st);
  };
  PH.nyOnFloor33 = function () {
    PH.setFlag("ny_f33", true);
    if (K.q.active("ph_room_3327")) PH.nyQuestTo("suite");
  };

  // ==================================================================
  // SPAWN (newGame / loaded)
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    applyState(ctx);
    if (!PH.flag("ny_boss_dead")) {
      const boss = PH.spawnActor(ctx, {
        id: "ph_ny_sentinel",
        type: "bulwark",
        name: "Teleforce Sentinel",
        faction: "robots",
        level: 11,
        hostile: true,
        pos: v(A.boss),
        yaw: PI,
        ai: "guard",
        home: "here",
        homeR: 9,
        noRespawn: true,
        hp: 420,
        xp: 260,
        aggroRange: 26,
        inventory: [
          ["ammo_gyrojet", 18],
          ["dry_cell", 2],
          ["relay_board", 1],
        ],
        onDeath: () => {
          PH.setFlag("ny_boss_dead", true);
          K.notify("The Teleforce Sentinel grinds to a halt.");
        },
      });
      if (boss && PH.flag("ny_bots_passive") && boss.setHostile)
        boss.setHostile(false);
    }
    // notebook + Teleforce pickups (quest-state gated)
    if (!PH.flag("ny_notebook") && !K.has("ph_ny_q_notebook"))
      K.safe("nb", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("ph_ny_q_notebook", 1, v(A.notebook), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
    if (!PH.flag("ny_teleforce"))
      K.safe("tf", () => {
        if (
          !G.isStub("items") &&
          G.items.spawnPickup &&
          K.itemExists("ph_ny_teleforce")
        )
          G.items.spawnPickup("ph_ny_teleforce", 1, v(A.teleforce), {
            static: false,
            keepY: true,
            noSave: true,
            yaw: HP,
          });
      });
  }
  function applyState(ctx) {
    if (ctx.freightUp && PH.flag("ny_freight")) ctx.freightUp.unbar(true);
    if (PH.flag("ny_wardrobe")) openWardrobe(ctx, true);
    else closeWardrobe(ctx);
    if (PH.flag("ny_gate")) {
      ctx.dyn.gate.target = 1;
      ctx.dyn.gate.open = 1;
      ctx.dyn.gate.obj.position.y = ctx.O.y + 3.4;
      if (ctx.dyn.gateCol) {
        G.world.removeCollider(ctx.dyn.gateCol);
        ctx.dyn.gateCol = null;
      }
    } else closeGate(ctx);
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  G.events.on("itemAdded", (id) => {
    if (id === "ph_ny_q_notebook") {
      PH.setFlag("ny_notebook", true);
      PH.nyQuestTo("return");
    }
    if (id === "ph_ny_teleforce") {
      PH.setFlag("ny_teleforce", true);
      K.xp(100, "Claimed the Teleforce");
    }
    if (
      id === "ph_ny_elev_key" &&
      PH.nyCtx &&
      PH.nyCtx.elevDoor &&
      !PH.flag("ny_elev")
    ) {
      /* the key opens car 3 when used */
    }
  });

  // ==================================================================
  // UPDATE
  // ==================================================================
  function update(dt, realDt, ctx) {
    if (!ctx.inside) {
      if (ctx.arcs && ctx.arcs.hum) {
        K.safe("hum", () => ctx.arcs.hum.stop());
        ctx.arcs.hum = null;
      }
      if (ctx.arcs) ctx.arcs.core.visible = ctx.arcs.halo.visible = false;
      return;
    }
    if (!dt) return;
    const P = G.player.pos,
      O = ctx.O;
    const lx = P.x - O.x,
      lz = P.z - O.z;
    // wardrobe slide / gate lift animation
    const w = ctx.dyn.wardrobe;
    if (w && w.open !== w.target) {
      w.open = Math.min(1, w.open + dt * 0.8);
      w.obj.position.x = w.base + 1.35 * w.open;
    }
    const g = ctx.dyn.gate;
    if (g && g.open !== g.target) {
      g.open = Math.min(1, g.open + dt * 0.6);
      g.obj.position.y = O.y + 3.4 * g.open;
    }
    if (ctx.arcs) {
      ctx.arcs.zapT -= dt;
      updateArcs(ctx, dt);
    }
    // the sparking cable in the corridor
    ctx.sparkT = (ctx.sparkT || 0) - dt;
    const sp = ctx.dyn.spark;
    if (sp && lz > 60 && ctx.sparkT <= 0) {
      ctx.sparkT = 0.4 + Math.random() * 1.2;
      const wp = new THREE.Vector3(O.x + sp.x, O.y + sp.y, O.z + sp.z);
      K.safe("spark", () => {
        if (!G.isStub("fx")) {
          if (G.fx.sparks) G.fx.sparks(wp);
          if (G.fx.flash && Math.random() < 0.4)
            G.fx.flash(wp, 0xa0c0ff, 1.2, 0.06);
        }
      });
      if (Math.hypot(lx - sp.x, lz - sp.z) < 1.3 && P.y - O.y < 1.5)
        K.safe("shock", () => {
          G.player.damage(5, { type: "energy", source: "live_wire" });
        });
    }
    // quest progression by position
    if (lz > 60 && lz < 92 && lx > -37 && lx < 31) {
      if (!PH.flag("ny_f33")) PH.nyOnFloor33();
      if (
        lx > -14 &&
        lx < 2 &&
        lz > 70 &&
        lz < 78 &&
        K.q.active("ph_room_3327")
      )
        PH.nyQuestTo("lab");
    }
    if (lz > LAB.z0 && lz < LAB.z1 - 0.5 && lx > LAB.x0 && lx < LAB.x1) {
      if (!PH.flag("ny_lab_seen")) {
        PH.setFlag("ny_lab_seen", true);
        PH.nyQuestTo(PH.flag("ny_coils_off") ? "notebook" : "coils");
      }
    }
  }

  function reset(ctx) {
    if (ctx.arcs && ctx.arcs.hum) {
      K.safe("hum", () => ctx.arcs.hum.stop());
      ctx.arcs.hum = null;
    }
    if (ctx.dyn && ctx.dyn.wardrobe) closeWardrobe(ctx);
    if (ctx.dyn && ctx.dyn.gate) closeGate(ctx);
    if (ctx.freightUp) ctx.freightUp.rebar();
  }

