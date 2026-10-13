// play-inline-193 06 — ctx
// Lines 1677-1845 of readable/play-inline-193.pretty.js (statement-aligned).
  function termOffice() {
    return {
      // the office teletype was never given a password: Irv did not believe in them
      title: "KATZ'S DELICATESSEN — OFFICE",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\n-Inventory Management-",
      entries: [
        {
          title: "Brisket Schedule",
          learn: LK.safe.id,
          text: () => {
            K.learn(LK.safe.id);
            return "Brine: 11 days. Smoke: 3 days. Steam: 3 hours. Hand-cut: ALWAYS.\nMachine slicing is for people who have given up on life.\n\nThe family ledger with the brine recipe stays in the desk. Not the safe — the safe is for money. The desk is for things that matter.\n\n(Safe combination is the year over the door, 1-8-8-8. If you forget it, look up.)";
          },
        },
        {
          title: 'Memo: "Send a Salami"',
          text: 'Per the Department of the Army, salami shipments to troops in West Germany are SUSPENDED "for the duration."\n\nThe duration of what, they did not say. We are sending them anyway. Our boys deserve cured meat.',
        },
        {
          title: "Memo: Lost Tickets",
          text: "I don't care that the sirens are going. I don't care that the sky is a funny color. Lost ticket is fifty dollars. Rules are rules. That is how you know it is still Katz's. — Irv",
        },
        {
          title: "Pest Control Invoice",
          text: 'Big Apple Pest Control — Job #4471\nStatus: TECHNICIAN MISSING\nAmount due: $0.00 ("we\'ll call it even")',
        },
        {
          title: "Open Family Safe",
          text: "The safe's bolts retract with a thunk.",
          action: () => {
            PV.unlockTagged("katz", "safe");
            K.notify("The Katz family safe is unlocked.");
          },
        },
      ],
    };
  }

  // ==================================================================
  // DATA & SPAWN
  // ==================================================================
  function data() {
    K.defineItem({
      id: "pv_q_brine_ledger",
      type: "misc",
      name: "Katz's Brine Ledger",
      weight: 1,
      value: 0,
      quest: true,
      desc: "A grease-stained family ledger, 1888–1967. Eleven days of brining, in four generations of handwriting. Page one: \"DON'T RUSH THE BRISKET. DON'T RUSH THE CUSTOMER.\"",
    });
    K.defineItem({
      id: "pv_katz_ticket",
      type: "misc",
      name: "Katz's Ticket #0000001",
      weight: 0,
      value: 150,
      desc: "The very first ticket, framed. Lost ticket fee: fifty dollars. This one is worth considerably more.",
    });
    K.defineItem({
      id: "pv_queen_gland",
      type: "misc",
      name: "Roach Queen Pheromone Gland",
      weight: 1,
      value: 90,
      desc: "Squishy, glowing faintly, smells like old salami. Somebody will pay for this. Probably the Glowkeepers.",
    });
  }
  function spawn(ctx) {
    const A = ctx.anchors;
    // the ledger waits in the office (until delivered)
    if (!PV.flag("ledger_done") && !K.has("pv_q_brine_ledger")) {
      K.safe("ledger", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("pv_q_brine_ledger", 1, v(A.ledger), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
    }
    if (!PV.flag("ticket_taken"))
      K.safe("ticket", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup(
            "pv_katz_ticket",
            1,
            { x: A.hoard.x + 0.6, y: A.hoard.y + 0.02, z: A.hoard.z + 0.5 },
            { static: false, keepY: true, noSave: true },
          );
      });
    // the queen and her court
    if (!PV.flag("queen_dead")) {
      const q = PV.spawnActor(ctx, {
        id: "pv_katz_queen",
        type: "giant_roach",
        name: "Roach Queen",
        faction: "creatures",
        level: 7,
        hostile: true,
        hp: 220,
        dr: 12,
        damage: 3.2,
        speed: 4.5,
        pos: v(A.queen),
        yaw: 0.5,
        ai: "guard",
        home: "here",
        homeR: 7,
        noRespawn: true,
        aggroRange: 18,
        xp: 120,
        inventory: [["pv_queen_gland", 1]],
        onDeath: () => {
          PV.setFlag("queen_dead", true);
          K.notify("The Roach Queen is dead.");
        },
      });
      if (q && q.char && q.char.root) {
        q.char.root.scale.setScalar(3.2);
        q.radius = Math.max(q.radius || 0.35, 0.9);
      }
    }
    for (let i = 1; i <= 5; i++) {
      if (PV.flag("queen_dead") && i > 3) break;
      PV.spawnActor(ctx, {
        id: "pv_katz_roach" + i,
        type: "giant_roach",
        name: i === 1 ? "Royal Guard Roach" : "Giant Roach",
        faction: "creatures",
        level: i === 1 ? 4 : 2,
        hostile: true,
        pos: v(A["roach" + i]),
        yaw: i,
        ai: "wander",
        home: "here",
        homeR: 5,
        noRespawn: true,
      });
    }
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  G.events.on("itemAdded", (id) => {
    if (id === "pv_katz_ticket") PV.setFlag("ticket_taken", true);
    if (
      id === "pv_q_brine_ledger" &&
      K.q.active("pv_what_shes_having") &&
      K.q.stage("pv_what_shes_having") === "ledger"
    )
      K.q.set("pv_what_shes_having", "return");
    if (id === "pv_q_brine_ledger" && !K.q.started("pv_what_shes_having"))
      K.q.start("pv_what_shes_having", { stage: "return" });
  });

  PV.define({
    id: "katz",
    name: "Katz's Delicatessen",
    interior: "katz_deli",
    order: 30,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
  });
