// play-inline-578 03 — the
// Lines 700-978 of readable/play-inline-578.pretty.js (statement-aligned).
  QX.hook("spawn", function () {
    // ransom paid but the save happened inside the 2.5 s before the release: he is free all the same
    if (QX.flag("bell_paid") && !QX.flag("bell_freed") && QX.active(BELL)) {
      QX.setFlag("bell_freed");
      QX.setFlag("bell_how", "ransom");
      QX.setStage(BELL, "gc");
    }
    // Betty fell before anyone answered her broadcast: Harlan walked out in the confusion (qx_bell never starts, outline: gated on betty_dead).
    if (QX.qflag("betty_dead") && !QX.started(BELL) && !QX.flag("bell_freed")) {
      QX.setFlag("bell_freed");
      QX.setFlag("bell_how", "betty_fell");
    }
    const freed = QX.flag("bell_freed");
    const pos = freed ? harlanGCSpot() : harlanExchangeSpot();
    if (!pos) return;
    const a = QX.spawnNPC({
      id: "qx_harlan",
      type: "human",
      name: "Harlan Pruitt",
      outfit: freed ? "merchant" : "drifter",
      gender: "m",
      hair: "balding",
      beard: "full",
      skinTone: "tan",
      faction: "settlers",
      ai: freed ? "merchant" : "static",
      home: "here",
      homeR: freed ? 2 : 0.3,
      level: 5,
      hp: 90,
      noRespawn: true,
      essential: !freed,
      dialogue: "qx_dlg_harlan",
      pos: { x: pos.x, y: pos.y || 0, z: pos.z },
      voice: "merchant",
      merchant: freed
        ? { scrip: 450, stock: HARLAN_STOCK, restock: 2 }
        : undefined,
      barks: freed
        ? [
            "Pruitt and Sons! Freight, fair prices, and one opinion on oxen, free.",
            "Market's open. The good kind.",
            "You again! Best customer I ever had. Only customer who bought ME.",
          ]
        : [
            "Psst. You. You're not a raider. Raiders don't wash.",
            "Six days on this bell. Six.",
            "If you're buying, I'm cheap. Tell Betty I said that.",
          ],
    });
    if (a && !freed) {
      QX.safe("harlanPose", () => {
        if (a.char && a.char.setAnim) a.char.setAnim("cower", { loop: true });
      });
      if (a.setHostile) QX.safe("harlanCalm", () => a.setHostile(false));
    }
    // the pit boss, with the shackle key and (after a ransom) the Scrip
    if (!freed && !QX.flag("dead_qx_ticker")) {
      QX.spawnNPC({
        id: "qx_ticker",
        type: "human",
        name: 'Pit Boss "Ticker" Tate',
        outfit: "raider",
        gender: "m",
        hair: "mohawk",
        faction: "raiders",
        hostile: true,
        level: 8,
        hp: 150,
        noRespawn: true,
        ai: "guard",
        home: "here",
        homeR: 6,
        weapon: "combat_shotgun",
        inventory: [
          ["qx_shackle_key", 1],
          [QX.SCRIP_ID, 60],
          ["ammo_shotgun", 12],
          ["whiskey", 1],
        ],
        at: { fallback: { x: pos.x - 3, z: pos.z - 2.5, y: pos.y } },
        barks: [
          "Harlan's stock is DOWN, baby!",
          "Bid or get off the floor!",
          "SOLD! To the man with the... wait, that's not a bid, that's a gun.",
        ],
      });
    }
  });
  QX.hook("world", function () {
    const k = K();
    const p = QX.freeSpot(SP.dropBox.x, SP.dropBox.z, undefined, {
      maxR: 6,
      radius: 0.6,
    });
    SP.dropBox.x = p.x;
    SP.dropBox.z = p.z;
    SP.dropBox.y = p.y;
    QX.registerLock(SHACKLES);
    k.dropBox(p.x, p.y, p.z, Math.PI, "RANSOM\nDEPOSITS\nONLY");
    k.collider(p.x, p.z, 0.7, 0.6, p.y, p.y + 1.2, 0, "metal");
    QX.interact({
      pos: QX.V3(p.x, p.y + 1.0, p.z),
      radius: 0.7,
      label: "Ransom Drop Box",
      verb: "Pay Ransom",
      priority: 1,
      enabled: () =>
        QX.stage(BELL) === "find" &&
        QX.alive("qx_harlan") &&
        !QX.flag("bell_paid") &&
        !QX.qflag("betty_dead"),
      onInteract: () => B.dropBox(),
    });
  });

  const B = (QX.bell = {
    price() {
      return QX.flag("bell_haggled") ? RANSOM_HAGGLED : RANSOM;
    },
    dropBox() {
      if (QX.stage(BELL) !== "find") return;
      // Trade: a counter-offer note, once
      if (!QX.flag("bell_note") && QX.skill(SKILL_TRADE) >= 50) {
        QX.setFlag("bell_note");
        QX.setFlag("bell_haggled");
        QX.notify(
          '[Trade 50] You pin a counter-offer to the slot: "300, final. Your hostage eats more than he\'s worth." Ten minutes later, a scrawl comes back: "FINE."',
        );
        return;
      }
      const price = B.price();
      if (!QX.pay(price)) {
        QX.notify(
          "The slot is labelled " + price + " SCRIP. EXACT CHANGE. NO REFUNDS.",
        );
        return;
      }
      QX.setFlag("bell_paid");
      QX.setFlag("bell_ransom", price);
      QX.notify(
        "You feed " +
          price +
          " Scrip into the slot, note by note. Somewhere inside the Exchange, a bell rings. Twice.",
      );
      // Ticker carries the ransom now (optional: take it back)
      const t = QX.npc("qx_ticker");
      if (t && !t.dead && t.inventory)
        QX.safe("tickerScrip", () => {
          const e = t.inventory.find
            ? t.inventory.find((s) => s[0] === QX.SCRIP_ID)
            : null;
          if (e) e[1] += price;
          else t.inventory.push([QX.SCRIP_ID, price]);
        });
      QX.later(2.5, () => B.release("ransom"));
    },
    /** Harlan is free: he makes his own way to Grand Central. */
    release(how) {
      if (QX.flag("bell_freed")) return;
      QX.setFlag("bell_freed");
      QX.setFlag("bell_how", how);
      QX.say(
        "qx_harlan",
        how === "ransom"
          ? "They... they let me go? Somebody PAID for me? Grand Central — find me there, friend!"
          : "Free! Thank you, thank you! I'm not waiting to find out if Betty noticed. Grand Central — meet me there!",
        6,
      );
      QX.setStage(BELL, "gc");
      QX.later(5, relocateHarlan);
    },
    /** [Mechanics] the shackle's hinge pin is rusted half through: knock it out and the cuff falls open. */
    knockPin() {
      B.release("hinge");
    },
    /** The shackle is a key lock (G.locks): Ticker Tate carries the key. */
    useKey() {
      if (!QX.has("qx_shackle_key")) return;
      QX.openLock(SHACKLES, () => {
        QX.take("qx_shackle_key", 1);
        B.release("key");
      });
    },
    breakChain() {
      B.release("brawn");
    },
    reward() {
      if (QX.stage(BELL) !== "gc") return;
      QX.give("qx_pruitt_voucher", 1);
      const paid = QX.flag("bell_paid");
      QX.giveScrip(paid ? 150 : 250);
      QX.xp(paid ? 150 : 250, "The Closing Bell");
      QX.standing(paid ? 25 : 50, "Rescued Harlan Pruitt");
      QX.setFlag("bell_discount");
      QX.setStage(BELL, "done");
      QX.news(
        "Trade news: Harlan Pruitt is back in business at Grand Central, minus six days, one ransom and most of his dignity. Pruitt and Sons says the first opinion on oxen is free.",
      );
    },
  });
  function relocateHarlan() {
    const a = QX.npc("qx_harlan");
    if (!a || a.dead) return;
    const gc = harlanGCSpot();
    if (!gc) return;
    // walk off: only teleport when the player can't see the jump (far from both ends)
    if (QX.dist(a.pos.x, a.pos.z) < 40 && QX.dist(gc.x, gc.z) > 40) {
      if (a.moveTo)
        QX.safe("harlanWalk", () => a.moveTo(SP.dropBox.x, SP.dropBox.z - 12));
      if (a.char && a.char.setAnim)
        QX.safe("harlanRun", () => a.char.setAnim("run", { loop: true }));
      QX.later(5, relocateHarlan);
      return;
    }
    QX.removeNPC("qx_harlan");
    QX.later(0.1, () => {
      QX.run("spawnHarlanOnly");
    });
  }
  // Respawn Harlan at Grand Central as a trader (spawn hook re-reads the 'bell_freed' flag).
  QX.hook("spawnHarlanOnly", function () {
    const gc = harlanGCSpot();
    if (!gc) return;
    QX.spawnNPC({
      id: "qx_harlan",
      type: "human",
      name: "Harlan Pruitt",
      outfit: "merchant",
      gender: "m",
      hair: "balding",
      beard: "full",
      skinTone: "tan",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      homeR: 2,
      level: 5,
      hp: 90,
      noRespawn: true,
      dialogue: "qx_dlg_harlan",
      voice: "merchant",
      pos: { x: gc.x, y: gc.y || 0, z: gc.z },
      merchant: { scrip: 450, stock: HARLAN_STOCK, restock: 2 },
      barks: [
        "Pruitt and Sons! Freight, fair prices, and one opinion on oxen, free.",
        "Market's open. The good kind.",
      ],
    });
  });
  G.events.on("actorKilled", (a) => {
    if (!a) return;
    if (a.id === "qx_harlan" && QX.started(BELL) && !QX.done(BELL)) {
      QX.setStage(BELL, "failed");
      QX.standing(-10);
    }
    if (a.id === "qx_ticker" && QX.flag("bell_paid"))
      QX.setFlag("bell_ticker_dead");
  });
  // Optional objective: the ransom back (looting Ticker's Scrip after paying).
  G.events.on("itemAdded", (id, n) => {
    if (
      id === QX.SCRIP_ID &&
      QX.flag("bell_paid") &&
      QX.flag("bell_ticker_dead") &&
      !QX.flag("bell_refund")
    ) {
      const t = QX.npc("qx_ticker");
      if (t && t.dead && QX.dist(t.pos.x, t.pos.z) < 5) {
        QX.setFlag("bell_refund");
        QX.refresh(BELL);
      }
    }
    void n;
  });

  // ==================================================================
  // Dialogue
  // ==================================================================
