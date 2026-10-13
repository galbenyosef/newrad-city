// play-inline-337 07 — the
// Lines 3673-3977 of readable/play-inline-337.pretty.js (statement-aligned).
  function freeHarriet() {
    if (EV.flag("harriet_free")) return;
    EV.setFlag("harriet_free", true);
    K.standing(40, "Freed Harriet Vance");
    K.xp(100, "Freed the opposition");
    K.notify("Harriet Vance heads for O'Rourke's.");
    const a =
      !G.isStub("actors") && G.actors.get && G.actors.get("pev_harriet");
    if (a && !a.dead)
      K.safe("hmove", () => {
        const m = EV.anchor("mcs", "npc5");
        G.actors.remove(a);
        if (m) spawnHarrietAtMcs();
      });
    K.safe("news", () => {
      if (!G.isStub("radio") && G.radio.addNews)
        G.radio.addNews(
          "Election news from the East Village, folks: Harriet Vance, the only person in thirty-eight years to run against Boss Croke of Tammany Hall, is out of Croke's cellar and back on the campaign trail. Somebody sprang her. The Boss is not amused. The rest of us are delighted.",
        );
    });
  }
  function spawnHarrietAtMcs() {
    const c = EV.ctxs.find((x) => x.id === "mcs");
    if (!c) return;
    // her own seat (O'Rourke's npc5: the far end of the back-room long table, across from Abigail — never npc2, Abigail's chair)
    const p = c.anchors.npc5;
    if (!p) return;
    EV.spawnActor(c, {
      id: "pev_harriet",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Harriet Vance",
      faction: "settlers",
      level: 5,
      essential: true,
      pos: { x: p.x, y: p.y, z: p.z },
      yaw: HP,
      ai: "sit",
      home: { x: p.x, z: p.z, r: 0.4 },
      dialogue: "pev_dlg_harriet",
      barks: [
        "Vote Vance!",
        "First opponent in thirty-eight years. Remember the name.",
      ],
    });
  }
  EV.crokeLeave = function () {
    const a = !G.isStub("actors") && G.actors.get && G.actors.get("pev_croke");
    if (a && !a.dead)
      K.safe("leave", () => {
        K.notify("Boss Croke walks out of Tammany Hall.");
        setTimeout(() => K.safe("rm", () => G.actors.remove(a)), 1500);
      });
    const h =
      !G.isStub("actors") && G.actors.get && G.actors.get("pev_tam_heeler");
    if (h && !h.dead)
      K.safe("leave2", () =>
        setTimeout(() => K.safe("rm2", () => G.actors.remove(h)), 1500),
      );
  };

  // ==================================================================
  // THE MACHINE: a NEUTRAL faction until Croke is crossed
  // ------------------------------------------------------------------
  // Tammany is a political machine, not a raider den: its Braves shake the
  // ward down but let voters walk in, so "Honest Graft" can be settled with
  // speech, bribes, blackmail or betrayal (FO3's Tenpenny Tower / NV's
  // Freeside Kings model). Everyone in the hall — Croke, the Ward Heeler and
  // the Braves combat's population puts in the cell for the 'tammany_hall'
  // location (group id 'tammany_hall') — is moved into the 'tammany'
  // faction (combat's relation() is 'neutral' for any unlisted pair, so they
  // neither attack the player nor the settlers/Harriet) and kept non-hostile
  // until the 'croke_angry' flag is set: Croke's "BRAVES!" line, the player
  // attacking any Brave (combat's factionAngered), or killing one.
  // (Core request filed in NOTES.md: make the LOCATION itself non-hostile.)
  // ==================================================================
  const TAM_FACTION = "tammany";
  const TAM_GROUP = "tammany_hall";
  let tamT = 0;
  function tamAngry() {
    return !!EV.flag("croke_angry");
  }
  function isTam(a) {
    return (
      !!a &&
      (a._pevTam ||
        a.group === TAM_GROUP ||
        a.id === "pev_croke" ||
        a.id === "pev_tam_heeler")
    );
  }
  function tamClaim(a, angry) {
    if (!a._pevTam) {
      a._pevTam = true;
      a.faction = TAM_FACTION;
      if (
        a.group === TAM_GROUP &&
        a.id !== "pev_croke" &&
        a.id !== "pev_tam_heeler"
      ) {
        const td =
          G.__cmb && G.__cmb.typeDef
            ? K.safe("td", () => G.__cmb.typeDef(a.type))
            : null;
        a.name = td && td.boss ? "Tammany Precinct Captain" : "Tammany Brave";
        if (!a.customBarks)
          a.customBarks = [
            "Vote early, vote often.",
            "Wipe your feet, voter.",
            "The Boss is in session.",
            "You registered? Doesn't matter. You are now.",
          ];
      }
    }
    if (a.hostOverride !== angry) a.setHostile(angry);
  }
  function tamScan() {
    if (G.isStub("actors") || !G.actors.list) return;
    const angry = tamAngry();
    K.safe("tamScan", () => {
      for (const a of G.actors.list())
        if (a && !a.dead && isTam(a)) tamClaim(a, angry);
    });
  }
  /** Croke is crossed: the whole Machine turns on the player (idempotent). */
  EV.tamAnger = function (why) {
    if (!tamAngry()) {
      EV.setFlag("croke_angry", why || true);
      K.notify("Tammany Hall is hostile.");
    }
    tamScan();
  };
  G.events.on("factionAngered", (f) => {
    if (f === TAM_FACTION) K.safe("tamAnger", () => EV.tamAnger("attacked"));
  });
  G.events.on("actorKilled", (a, killer) => {
    if (!a || !a._pevTam || tamAngry()) return;
    const byPlayer =
      killer === "player" ||
      killer === G.player ||
      (killer &&
        (killer.isPlayer ||
          killer.faction === "player" ||
          killer.following === "player"));
    if (byPlayer) K.safe("tamKill", () => EV.tamAnger("killed"));
  });

  // ==================================================================
  // SPAWN / UPDATE
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    setVault(ctx, !!EV.flag("tam_vault_open"), true);
    setCell(ctx, !!EV.flag("harriet_cell_open"));
    if (EV.flag("tam_drawer") && !EV.flag("tam_key_taken")) spawnKey();
    if (!EV.flag("ledger_taken"))
      K.safe("ledger", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup(
            "pev_tam_ledger",
            1,
            { x: A.ledger.x, y: A.ledger.y, z: A.ledger.z },
            { static: false, keepY: true, noSave: true },
          );
      });
    if (!EV.flag("boss_dead") && !EV.flag("boss_resigned")) {
      EV.spawnActor(ctx, {
        id: "pev_croke",
        type: "human",
        gender: "m",
        outfit: "merchant",
        name: "Boss Croke",
        faction: TAM_FACTION,
        hostile: tamAngry(),
        level: 10,
        hp: 240,
        pos: v(A.boss),
        yaw: 0,
        ai: "guard",
        home: "here",
        homeR: 2.5,
        dialogue: "pev_dlg_croke",
        voice: "settler",
        noRespawn: true,
        xp: 200,
        weapon: K.itemExists("44_magnum")
          ? "44_magnum"
          : K.itemExists("10mm_pistol")
            ? "10mm_pistol"
            : undefined,
        inventory: [
          ["pev_tam_vault_key", 1],
          ["pev_croke_derby", 1],
          ["scrip", 180],
        ],
        barks: [
          "Vote early, vote often!",
          "I seen my opportunities and I took 'em.",
          "Every ward needs a captain, kid.",
          "The widows' fund thanks you.",
        ],
        onDeath: () => {
          EV.setFlag("boss_dead", true);
          K.notify("Boss Croke is dead. Tammany Hall has lost its Sachem.");
          if (
            K.q.active("pev_honest_graft") &&
            ["talk", "tg_ledger", "tg_harriet", "collect", "deliver"].indexOf(
              K.q.stage("pev_honest_graft"),
            ) >= 0
          ) {
            EV.setFlag("mcs_exempt", "dead");
            K.q.set("pev_honest_graft", "return");
          }
        },
      });
      EV.spawnActor(ctx, {
        id: "pev_tam_heeler",
        type: "human",
        gender: "m",
        outfit: "raider_heavy",
        name: "Ward Heeler",
        faction: TAM_FACTION,
        hostile: tamAngry(),
        level: 9,
        pos: v(A.bodyguard),
        yaw: -HP,
        ai: "guard",
        home: "here",
        homeR: 2,
        noRespawn: true,
        weapon: K.itemExists("combat_shotgun") ? "combat_shotgun" : undefined,
        barks: [
          "The Boss is busy.",
          "Hands where I can see 'em, voter.",
          "You got an appointment?",
        ],
      });
    }
    if (!EV.flag("harriet_free")) {
      EV.spawnActor(ctx, {
        id: "pev_harriet",
        type: "human",
        gender: "f",
        outfit: "settler",
        name: "Harriet Vance",
        faction: "settlers",
        level: 5,
        essential: true,
        pos: v(A.captive),
        yaw: 0,
        ai: "static",
        home: "here",
        homeR: 0.5,
        dialogue: "pev_dlg_harriet",
        barks: ["Hey! You! Not a Brave, are you?", "Vote Vance!"],
      });
    } else spawnHarrietAtMcs();
    tamScan();
  }
  function update(dt, realDt, ctx) {
    tamT -= realDt;
    if (tamT <= 0) {
      tamT = 1;
      tamScan();
    }
    const v2 = ctx.vaultDoor;
    if (v2 && v2.opening) {
      v2.t += realDt;
      v2.pivot.rotation.y = -Math.min(1.9, v2.t * 0.8);
      if (v2.t > 2.4) v2.opening = false;
    }
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }

  G.events.on("itemAdded", (id) => {
    if (id === "pev_tam_ledger") {
      EV.setFlag("ledger_taken", true);
      EV.setFlag("heard_ledger", true);
    }
    if (id === "pev_tam_vault_key") EV.setFlag("tam_key_taken", true);
    if (
      id === "pev_tax_envelope" &&
      K.q.active("pev_honest_graft") &&
      K.q.stage("pev_honest_graft") === "collect"
    )
      K.q.set("pev_honest_graft", "deliver");
  });

  EV.define({
    id: "tammany",
    name: "Tammany Hall",
    interior: "tammany_hall",
    order: 30,
    lift: 5,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
  });
