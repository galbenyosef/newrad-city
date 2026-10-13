// play-inline-337 05 — ctx
// Lines 2962-3206 of readable/play-inline-337.pretty.js (statement-aligned).
  function setVault(ctx, open, instant) {
    const v = ctx.vaultDoor;
    if (!v) return;
    if (!open) {
      v.opening = false;
      v.t = 0;
      v.pivot.rotation.y = 0;
      if (!v.col)
        v.col = G.world.addBox(
          ctx.O.x + VAULT.x - 0.85,
          ctx.O.y + CY,
          ctx.O.z + VAULT.z - 0.2,
          ctx.O.x + VAULT.x + 0.85,
          ctx.O.y + CY + 2.4,
          ctx.O.z + VAULT.z + 0.45,
          { tag: "poi_eastvillage", surface: "metal", walkable: false },
        );
      return;
    }
    if (v.col) {
      K.safe("vcol", () => G.world.removeCollider(v.col));
      v.col = null;
    }
    if (instant) {
      v.pivot.rotation.y = -1.9;
      v.opening = false;
    } else {
      v.opening = true;
      v.t = 0;
      K.sfx("cryo_door", K.world(ctx, VAULT.x, CY + 1.2, VAULT.z));
    }
  }
  function setCell(ctx, open) {
    const c = ctx.cellDoor;
    if (!c) return;
    if (!open) {
      c.pivot.rotation.y = 0;
      if (!c.col)
        c.col = G.world.addBox(
          ctx.O.x + ctx.harrietCellX - 0.55,
          ctx.O.y + CY,
          ctx.O.z - 16.1,
          ctx.O.x + ctx.harrietCellX + 0.55,
          ctx.O.y + CY + 2.9,
          ctx.O.z - 15.9,
          { tag: "poi_eastvillage", surface: "metal", walkable: false },
        );
      return;
    }
    if (c.col) {
      K.safe("ccol", () => G.world.removeCollider(c.col));
      c.col = null;
    }
    c.pivot.rotation.y = 1.4;
  }
  function openVault(ctx) {
    EV.setFlag("tam_vault_open", true);
    setVault(ctx, true, false);
    K.xp(50, "Opened the Wigwam strongroom");
    if (K.q.active("pev_honest_graft")) EV.setFlag("heard_ledger", true);
  }
  // the strongroom and the cells share the Wigwam key (the Boss's ring, or the spare in his secretary's drawer);
  // the Boss's teletype and the time-lock console can also release the strongroom
  const VAULT_LOCK = K.regLock({
    id: "pev_lk_tam_vault",
    label: "Tammany Strongroom",
    kind: "door",
    key: "pev_tam_vault_key",
    hint: "Boss Croke carries the Wigwam key; a spare sits in his secretary's drawer (her teletype unlocks it).",
  });
  const CELL_LOCK = K.regLock({
    id: "pev_lk_tam_cell",
    label: "Cell Door (Harriet Vance)",
    kind: "door",
    key: "pev_tam_vault_key",
    hint: "The Wigwam key fits the cellar cells too.",
  });
  function tryVault(ctx) {
    if (EV.flag("tam_vault_open")) return;
    K.lockOpen(VAULT_LOCK, () => {
      K.notify("The Wigwam key turns in the strongroom lock.");
      openVault(ctx);
    });
  }
  function tryCell(ctx) {
    if (EV.flag("harriet_cell_open")) return;
    const open = () => {
      EV.setFlag("harriet_cell_open", true);
      setCell(ctx, true);
      K.sfx("door_open", K.world(ctx, ctx.harrietCellX, CY + 1, -16));
    };
    K.lockOpen(CELL_LOCK, () => {
      K.notify("The Wigwam key fits the cell lock too.");
      open();
    });
  }
  EV.tamOpenVault = function () {
    const c = EV.ctxs.find((q) => q.id === "tammany");
    if (c && !EV.flag("tam_vault_open")) openVault(c);
  };

  // ==================================================================
  // TERMINALS
  // ==================================================================
  function termPatronage() {
    return {
      title: "FOURTH WARD — PATRONAGE OFFICE",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nSOCIETY OF TAMMANY — CONSTITUENT SERVICES",
      entries: [
        {
          title: "Jobs Available (1967)",
          text: "Sanitation inspector (no inspection required) — $14,000/yr\nBridge toll collector, Brooklyn (keep 10%) — $9,000/yr + 10%\nDeputy assistant to the Deputy Commissioner of Deputies — $22,000/yr\n\nApplicants must present: (1) proof of residence, (2) proof of voting, (3) an envelope.",
        },
        {
          title: "Memo from the Boss",
          text: "Plunkitt said it best: there's honest graft and there's dishonest graft. Honest graft is when you know the city is about to buy a lot, so you buy it first. Dishonest graft is when you get caught.\n\nWe do not get caught. — A.C.\n\nP.S. Kelly: my personal teletype answers to PLUNKITT. Stop asking.",
          learn: "pev_lk_tam_boss_term",
        },
        {
          title: "Office Safe",
          learn: "pev_lk_tam_patronage_safe",
          text: "Patronage safe combination: 1-8-6-8, the year the Hall moved to 14th Street. Change it after the election. (We never change it after the election.)",
        },
        {
          title: "Operations Since the Bombing",
          text: "Braves on the payroll: 14 (as of this week; 11 after Tuesday's \"misunderstanding\" with the Iron Covenant).\nWard tax collected: O'Rourke's (weekly, grudging), the Beer Garden (in hops), Katz's (pending roach removal).\nOpposition: 1 (H. Vance — detained pending \"reconsideration,\" cellar block).",
        },
      ],
    };
  }
  function termSecretary() {
    return {
      title: "OFFICE OF THE GRAND SACHEM — APPOINTMENTS",
      header:
        'KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\n"The Boss Will See You Now" (maybe)',
      lock: {
        id: "pev_lk_tam_secretary",
        passcode: "WIGWAM",
        hint: "Mrs. Kelly wrote it on her desk blotter.",
      },
      entries: [
        {
          title: "Today's Appointments",
          text: "9:00  Captain of the Braves (ward tax)\n9:15  Man from O'Rourke's (declined; the mustard is personal)\n9:30  H. Vance, opposition candidate (moved to cellar)\n10:00 Anyone with a gun (always make time for anyone with a gun)",
        },
        {
          title: "Key Custody Log",
          text: "Strongroom key: Boss's ring. Spare: secretary's desk, top drawer, under the stamps. DO NOT TELL THE BOSS THERE IS A SPARE.",
        },
        {
          title: "Unlock Desk Drawer",
          text: "The top drawer slides open. Under a sheet of three-cent stamps: a heavy brass key.",
          action: () => {
            EV.setFlag("tam_drawer", true);
            spawnKey();
          },
          cond: () => !EV.flag("tam_drawer"),
        },
      ],
    };
  }
  function termBoss() {
    return {
      title: "A. CROKE — PERSONAL",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nPROPERTY OF THE GRAND SACHEM. KEEP OUT. THIS MEANS YOU, KELLY.",
      lock: {
        id: "pev_lk_tam_boss_term",
        passcode: "PLUNKITT",
        hint: "The Boss left his passcode in a memo on the patronage-office teletype.",
      },
      entries: [
        {
          title: "The Black Book",
          learn: ["pev_lk_tam_boss_safe", "pev_lk_tam_timelock"],
          text: "Every favor, every envelope, every dead man who voted since 1951 is in the book. The book is in the strongroom. The strongroom is under the Wigwam. The time lock opens on Election Day — November 2, 1-1-0-2, the same as my safe, because a man should remember Election Day. Without the book I'm an old man in a nice suit. With the book I'm the Boss.",
        },
        {
          title: "Ward Tax: O'Rourke's",
          text: "Deck pays. Deck always pays. I don't need his scrip — I need him to pay. A ward is a ward.\n\n(I don't even like the dark.)",
        },
        {
          title: "On Harriet Vance",
          text: 'She ran against me. Nobody runs against me. Kept her in the cellar for six weeks so she can "reconsider." She has not reconsidered. She has, however, organized the other prisoners into a union. I respect it. I hate it, but I respect it.',
        },
        {
          title: "Open Strongroom Lock",
          text: "Strongroom bolts retracting... The door swings open with a groan.",
          action: () => EV.tamOpenVault(),
          cond: () => !EV.flag("tam_vault_open"),
        },
        {
          title: "Open Personal Safe",
          text: "The safe clicks.",
          action: () => {
            EV.unlockTagged("tammany", "bosssafe");
            K.notify("The Boss's safe is unlocked.");
          },
        },
      ],
    };
  }
  function termVault() {
    return {
      title: "WIGWAM STRONGROOM — TIME LOCK",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nMOSLER SAFE CO. TIME-LOCK INTERFACE",
      lock: {
        id: "pev_lk_tam_timelock",
        passcode: "1102",
        hint: "Election Day — the Boss's teletype says when that is.",
      },
      entries: [
        {
          title: "Time Lock Status",
          text: "TIME LOCK: ENGAGED\nNEXT OPENING: ELECTION DAY\n(ELECTION DAY IS WHEN THE BOSS SAYS IT IS.)",
        },
        {
          title: "Override Time Lock",
          text: "Override accepted.",
          action: () => EV.tamOpenVault(),
          cond: () => !EV.flag("tam_vault_open"),
        },
      ],
    };
  }
  function spawnKey() {
    if (EV.flag("tam_key_taken") || K.has("pev_tam_vault_key")) return;
    const a = EV.anchor("tammany", "vault_key");
    if (a)
      K.safe("key", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup(
            "pev_tam_vault_key",
            1,
            { x: a.x, y: a.y, z: a.z },
            { static: false, keepY: true, noSave: true },
          );
      });
  }

  // ==================================================================
  // DATA: items, quest, dialogues
  // ==================================================================
