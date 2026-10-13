// play-inline-424 06 — ctx
// Lines 1450-1718 of readable/play-inline-424.pretty.js (statement-aligned).
  function data() {
    K.defineItem({
      id: "ph2_clock_key",
      type: "key",
      name: "Pier A Clock Key",
      weight: 0,
      value: 0,
      tags: ["key"],
      desc: "A heavy brass winding crank with a square socket, tagged MEMORIAL CLOCK — HARBOR MASTER ONLY. Wound once a week, every week, from 1919 to 1967.",
    });
    K.defineItem({
      id: "ph2_fdny_helmet",
      type: "misc",
      name: "Marine Company 1 Helmet",
      weight: 2,
      value: 90,
      tags: ["valuable", "unique"],
      desc: "A leather fire helmet with the brass front piece MARINE 1 — F.D.N.Y. The inside band has twelve names scratched into it, each one crossed out but the last.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ph2_947",
        name: "Nine Forty-Seven",
        giver: "Harbor Master's log",
        location: "Pier A",
        desc: "The memorial clock on Pier A stopped at 9:47 on the morning of the Bombing. The harbor master's log says it was wound every Sunday for nearly fifty years before that, since the memorial was dedicated in 1919. Somebody should wind it again.",
        stages: [
          {
            id: "key",
            text: "Find the clock key (the harbor master kept it) — or force the mechanism.",
            markers: [
              () => {
                const a = PV.anchor("pier_a", "keysafe");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Harbor master's office",
                      interior: "pier_a",
                    }
                  : null;
              },
            ],
          },
          {
            id: "wind",
            text: "Wind the clock in the Pier A tower.",
            markers: [
              () => {
                const a = PV.anchor("pier_a", "crank");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Clock mechanism",
                      interior: "pier_a",
                    }
                  : null;
              },
            ],
          },
        ],
        rewards: { xp: 150 },
      });
    }
    // Stage sync: picking up the clock key (safe, or the harbor master's body in the boathouse slip) moves the quest
    // to 'wind' — starting it if the player found the key before reading the log.
    const keySync = () =>
      K.safe("947 sync", () => {
        if (!K.has("ph2_clock_key") || PV.flag("pa_clock_wound")) return;
        const q = K.q;
        if (!q.started("ph2_947")) {
          if (!G.isStub("quests")) G.quests.start("ph2_947", { stage: "wind" });
          return;
        }
        if (q.active("ph2_947") && q.stage("ph2_947") === "key")
          q.set("ph2_947", "wind");
      });
    G.events.on("itemAdded", (id) => {
      if (id === "ph2_clock_key") keySync();
    });
    G.events.on("questStarted", (v) => {
      if (v && v.id === "ph2_947") setTimeout(keySync, 0);
    });
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors,
      S = PV;
    // shellbacks basking on the west apron (outside the interior population)
    [
      ["ph2_pa_lurk1", -250.5, 890.5],
      ["ph2_pa_lurk2", -243, 903.2],
    ].forEach(([id, x, z], i) => {
      if (S.flag("pa_dead_" + id)) return;
      PV.spawnActor(ctx, {
        id,
        type: "shellback",
        name: "Shellback",
        faction: "creatures",
        level: 5 + i,
        pos: { x, y: PA.PY, z },
        yaw: i ? PI : 0,
        ai: "guard",
        home: { x, z, r: 6 },
        noRespawn: true,
        onDeath: () => S.setFlag("pa_dead_" + id, true),
      });
    });
    // the interior boss (Old Barnacle), if not already dead
    if (A.boss && !S.flag("pa_boss_dead")) {
      PV.spawnActor(ctx, {
        id: "ph2_pa_boss",
        type: "shellback",
        name: "Old Barnacle",
        faction: "creatures",
        level: 12,
        hp: 420,
        scale: 1.45,
        pos: { x: A.boss.x, y: A.boss.y, z: A.boss.z },
        yaw: -HP,
        ai: "guard",
        home: { x: A.boss.x, z: A.boss.z, r: 7 },
        noRespawn: true,
        inventory: [
          ["ph2_fdny_helmet", 1],
          ["shellback_meat", 3],
        ],
        onDeath: () => {
          S.setFlag("pa_boss_dead", true);
          K.xp(120, "Old Barnacle");
        },
      });
    }
  }
  function ambush(ctx) {
    if (PV.flag("pa_ambush")) return;
    PV.setFlag("pa_ambush", true);
    K.notify("Something heavy stirs in the water beside the fireboat...");
    [
      ["ph2_pa_amb1", "ambush1"],
      ["ph2_pa_amb2", "ambush2"],
    ].forEach(([id, an], i) => {
      const a = ctx.anchors[an];
      if (!a) return;
      const act = PV.spawnActor(ctx, {
        id,
        type: "shellback",
        name: i ? "Shellback" : "Shellback Hunter",
        faction: "creatures",
        level: 6 + i * 2,
        hp: i ? undefined : 150,
        scale: i ? 1 : 1.15,
        pos: { x: a.x, y: a.y, z: a.z },
        yaw: HP,
        ai: "guard",
        home: { x: a.x + 6, z: a.z + 4, r: 10 },
        noRespawn: true,
      });
      K.safe("aggro", () => {
        if (act && act.setHostile) act.setHostile(true);
      });
    });
    K.sfx("shellback_click", ctx.anchors.ambush1);
  }

  // ==================================================================
  // UPDATE: clock hands, the ambush trigger
  // ==================================================================
  let chk = 0;
  function update(dt, realDt, ctx) {
    if (PV.flag("pa_clock_wound") && G.time && PA.handMeshes)
      PA.setHands(G.time.hour || 0);
    chk -= realDt;
    if (chk > 0) return;
    chk = 0.5;
    const p = G.player && G.player.pos;
    if (!p || p.x > G.LAYOUT.INTERIOR_X_MIN) return;
    const bt = ctx.anchors.boat;
    if (
      bt &&
      !PV.flag("pa_ambush") &&
      Math.hypot(p.x - bt.x, p.z - bt.z) < 9 &&
      p.y > -0.5
    )
      ambush(ctx);
  }

  PV.define({
    id: "pier_a",
    name: "Pier A",
    interior: "pier_a",
    order: 20,
    build(ctx) {
      exterior(ctx);
      if (PV.paInterior) PV.paInterior(ctx);
      const A = ctx.anchors;
      // engine hatch: the pump governor (quest item) — take it any time
      ctx.interactables.push(
        G.world.addInteractable({
          pos: A.hatch,
          radius: 1.0,
          label: "Fireboat Engine Hatch",
          verb: "Search",
          priority: 1,
          enabled: () => !PV.flag("pa_governor"),
          onInteract: () => {
            PV.setFlag("pa_governor", true);
            K.give("ph2_pump_governor", 1);
            K.notify(
              "You reach into the flooded engine room and unbolt the pump governor.",
            );
            K.sfx("pickup_metal", A.hatch);
            const q = K.q;
            if (q.active("ph2_slack_water")) q.set("ph2_slack_water", "return");
            K.xp(40, "Salvaged the pump governor");
            const c = PV.ctxs && PV.ctxs.find((x) => x.id === "pier_a");
            if (c) ambush(c);
          },
        }),
      );
      K.loot(ctx, "locker", A.locker.x, A.locker.y, A.locker.z, HP, {
        world: true,
        loot: "locker",
        name: "FDNY Gear Locker",
      });
      K.loot(
        ctx,
        "skeleton",
        A.boat.x - 2,
        A.boat.y + 0.05,
        A.boat.z + 1.2,
        0.6,
        { world: true, pose: "lying", container: true, loot: "skeleton" },
      );
      K.loot(ctx, "first_aid", -214.2, PA.PF + 1.4, 890.2, 0, {
        world: true,
        loot: "first_aid",
      });
      K.loot(ctx, "barrel", -249, PA.PY, 885.6, 0, {
        world: true,
        container: false,
        radioactive: false,
        tipped: true,
      });
      K.note(
        ctx,
        "ph2_note_pa_duggan",
        A.boat.x + 1.2,
        A.boat.y + 0.1,
        A.boat.z + 2.6,
        {
          type: "note",
          name: "Waterlogged Logbook Page",
          title: "F/B Patrick Duggan — deck log",
          text: 'Mar 5. 0931. Recall from Governors Island drill, all hands.\n0940. Radio says air raid. Capt. says "drill."\n0946. Capt. says it is not a drill.\n0947. —\n\n[The rest of the page is ink and salt.]\n\n[On the back, in pencil:] Engine room flooding. Pumps holding. Got the governor rebuilt last week, God bless Worthington. If anybody finds this — she can still pump. She could put out the whole city if anyone was left to ask.',
        },
        { world: true },
      );
    },
    data,
    spawn,
    update,
  });
