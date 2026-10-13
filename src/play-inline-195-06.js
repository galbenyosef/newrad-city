// play-inline-195 06 — title
// Lines 2260-2448 of readable/play-inline-195.pretty.js (statement-aligned).
  function termBooking() {
    return {
      title: "MANHATTAN HOUSE OF DETENTION — BOOKING",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\n-NYC Dept. of Correction-",
      entries: [
        {
          title: "Intake Log — March 1967",
          text: '06:10 — 14 transfers from Rikers (overcrowding).\n08:55 — 2 walk-ins: "Russian spies" (they are a Ukrainian bakery family; released).\n09:40 — ALERT CONDITION RED. Lockdown ordered.\n09:41 — Staff evacuating to the Courts building shelter.\n09:42 — Who has the keys to Block C?\n09:42 — Who has the keys to Block C??',
        },
        {
          title: "1988 — New Management",
          text: 'BOOKED BY WARDEN MADDOX (self-appointed):\n- one (1) wagon guard, "looked at me funny"\n- one (1) Vanguard girl, "sings too loud"\n- one (1) old man, "for being old"\nBAIL: 100 scrip each, payable to the Gallowglass Company.',
        },
      ],
    };
  }
  function termControl() {
    return {
      title: "CELL CONTROL — BLOCKS A/B/C",
      header: "KESTREL TELETYPE CORP. — DOOR CONTROL SUBSYSTEM",
      lock: LK.control,
      entries: [
        {
          title: "Block Status",
          text: () =>
            "BLOCK A: 0/30 occupied\nBLOCK B: 0/30 occupied\nBLOCK C: " +
            (PV.flag("tombs_prisoners") === "freed"
              ? "0/30 — DOORS OPEN"
              : PV.flag("tombs_prisoners") === "sold"
                ? '0/30 — "TRANSFERRED"'
                : "3/30 occupied — LOCKED"),
        },
        {
          title: "RELEASE BLOCK C",
          text: "Solenoids engaged. Block C cell doors open.",
          cond: () => !PV.flag("tombs_prisoners"),
          action: () => {
            K.lockUnlock(LK.blockc.id);
            releasePrisoners("terminal");
          },
        },
      ],
    };
  }
  function termWarden() {
    // Maddox never set a password ("who'd dare?")
    return {
      title: 'WARDEN — "MADDOX"',
      header: "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\n-PERSONAL-",
      entries: [
        {
          title: "Log",
          learn: LK.control.id,
          text: () => {
            K.learn(LK.control.id);
            return "Day 1 of my reign: took the Tombs from the Worth Street Rats. Cells work, walls are thick, the bridge is a great place to hang people. Figuratively. Also literally.\n\nDay 2: Control room word is GALLOWS. Rourke picked it. Rourke thinks he's funny.\n\nDay 40: Robbed the artist hotel on 23rd. Got a painting of a little girl on a swing. Nice frame. Hung it in the office. Use it for darts.\n\nDay 90: Gallowglass slavers pay 100 scrip a head. Three heads in Block C. Contract below — just sign it and they'll collect.";
          },
        },
        {
          title: "Gallowglass Contract — SIGN",
          text: "You sign over the three prisoners of Block C to the Gallowglass slavers. A runner will bring the 300 scrip to the Warden's safe. Your conscience will bring nothing.",
          cond: () => !PV.flag("tombs_prisoners"),
          action: () => sellPrisoners(),
        },
        {
          title: "Safe Combination",
          learn: LK.wsafe.id,
          text: () => {
            K.learn(LK.wsafe.id);
            return 'Twelve, seven, sixty-seven: 1-2-7-6-7. "The year the world ended, and my birthday." Nobody forgets a birthday like that.';
          },
        },
      ],
    };
  }

  // ------------------------------------------------------------------
  // prisoners: release / sell
  // ------------------------------------------------------------------
  const PRISONERS = [
    {
      id: "pv_prisoner_rosa",
      name: "Carmen Medina",
      gender: "f",
      outfit: "settler",
      cell: 6,
      bark: "Thank you! We'll make for the Vanguard — tell Mags to pour three.",
    },
    {
      id: "pv_prisoner_ike",
      name: 'Ike "Wagon" Mbeki',
      gender: "m",
      outfit: "combat_armor",
      cell: 7,
      bark: "Owe you one. Owe you a lot, actually.",
    },
    {
      id: "pv_prisoner_elias",
      name: "Old Elias",
      gender: "m",
      outfit: "survivor",
      cell: 8,
      bark: "Out! At my age! Hah!",
    },
  ];
  function openDoor(d, instant) {
    if (!d || d.open) return;
    d.open = true;
    d.t = instant ? 1 : 0;
    if (d.col) {
      G.world.removeCollider(d.col);
      d.col = null;
    }
    if (instant) d.group.position.z = d.z0 - 1.1;
    else
      K.sfx("door_open", d.group.getWorldPosition(new THREE.Vector3()), {
        pitch: 0.5,
      });
  }
  function closeDoor(d) {
    d.open = false;
    d.t = 0;
    d.group.position.z = d.z0;
    if (!d.col) {
      const O = d.O,
        xf = d.xf,
        side = d.side;
      d.col = G.world.addBox(
        O.x + Math.min(xf, xf + side * 0.08) - 0.03,
        O.y + d.y,
        O.z + d.z0,
        O.x + Math.max(xf, xf + side * 0.08) + 0.03,
        O.y + d.y + 2.55,
        O.z + d.z1,
        { tag: "interactable_self", walkable: false },
      );
    }
  }
  function releasePrisoners(how) {
    if (PV.flag("tombs_prisoners")) return;
    PV.setFlag("tombs_prisoners", "freed");
    for (const d of cellDoors) openDoor(d);
    K.standing(50, "Freed the Tombs prisoners");
    K.xp(150, "Jailbreak");
    PRISONERS.forEach((p, i) => {
      const a = !G.isStub("actors") && G.actors.get ? G.actors.get(p.id) : null;
      if (a && !a.dead) {
        K.safe("say", () => a.say && a.say(p.bark, 4));
        const ent = PV.anchor("tombs", "entrance");
        setTimeout(
          () =>
            K.safe("flee", () => {
              if (!a.dead && ent) {
                a.aiMode = "wander";
                a.ai = "wander";
                if (a.moveTo) a.moveTo(ent.x + i * 0.6, ent.z - 2);
              }
            }),
          1500 + i * 400,
        );
      }
    });
    if (!K.q.started("pv_jailbreak")) K.q.start("pv_jailbreak");
    K.q.complete("pv_jailbreak");
    K.notify(
      how === "terminal"
        ? "Block C cell doors open."
        : "The cell door swings open.",
    );
  }
  function sellPrisoners() {
    if (PV.flag("tombs_prisoners")) return;
    PV.setFlag("tombs_prisoners", "sold");
    K.standing(-100, "Sold prisoners to slavers");
    K.scrip(300);
    PRISONERS.forEach((p) => {
      const a = !G.isStub("actors") && G.actors.get ? G.actors.get(p.id) : null;
      if (a && G.actors.remove) K.safe("rm", () => G.actors.remove(a));
    });
    if (!K.q.started("pv_jailbreak")) K.q.start("pv_jailbreak");
    K.q.set("pv_jailbreak", "sold");
    K.q.complete("pv_jailbreak");
    K.notify("300 scrip. The Gallowglass runner will collect them tonight.");
  }

  // ==================================================================
  // DATA & SPAWN & UPDATE
  // ==================================================================
