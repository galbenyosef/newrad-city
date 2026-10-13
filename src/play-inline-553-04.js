// play-inline-553 04 — label
// Lines 829-1113 of readable/play-inline-553.pretty.js (statement-aligned).
  L.hook("init", function () {
    const items = [
      {
        id: "q_garden_belt",
        type: "misc",
        quest: true,
        name: "Garden Championship Belt",
        weight: 3,
        value: 0,
        desc: 'Gold plate over tin, a leather strap gone stiff as wood. "MADISON SQUARE GARDEN — HEAVYWEIGHT — 1967." The name plate was never engraved.',
      },
      {
        id: "q_garden_belt_trophy",
        type: "misc",
        name: "Garden Championship Belt (Trophy)",
        weight: 3,
        value: 400,
        desc: "The heavyweight belt nobody won. Worth a fortune to a collector. Worth something else entirely to one old prizefighter at the Neon.",
      },
      {
        id: "q_press_core",
        type: "misc",
        quest: true,
        name: "Autotype Press Core",
        weight: 5,
        value: 0,
        desc: "A chrome drum etched with the words THE PRINTED WORD — GUGGENHEIM 1967. It hums faintly, as if it is reading something.",
      },
      {
        id: "q_press_core_kept",
        type: "misc",
        name: "Autotype Press Core",
        weight: 5,
        value: 350,
        desc: "A working old-world printing core. Somebody could print a library with this. You could also sell it.",
      },
      {
        id: "q_rook_lockbox",
        type: "misc",
        quest: true,
        name: "Rook's Lockbox",
        weight: 4,
        value: 0,
        desc: 'A steel cashbox with a skull painted on the lid, a four-dial combination lock, and "ROOK — TOUCH IT AND DIE" scratched underneath. It rattles like money.',
      },
      {
        id: "q_note_fight_card",
        type: "note",
        name: "Fight Card: Malone vs. Kearns",
        weight: 0,
        value: 0,
        title: "MADISON SQUARE GARDEN — SUNDAY MORNING, MAR. 5, 1967",
        text:
          'BREAKFAST CARD — LIVE VIA SATELLITE TO EUROPEAN TELEVISION\nMAIN EVENT — 12 ROUNDS — HEAVYWEIGHT CHAMPIONSHIP OF THE EASTERN SEABOARD\n\n"GENTLEMAN" JIM MALONE (29-3, Hell\'s Kitchen)\nvs.\nDANNY "THE KID" KEARNS (18-0, Bay Ridge)\n\n' +
          'Doors 8 a.m. · Fizzo Cola is the official refreshment of the Garden · No re-entry after the anthem\n\n[Handwritten on the back, in pencil: "Round 6. Kid dropped his left every time he threw the right. I had him. Then the sirens. — J.M."]',
      },
      {
        id: "q_note_tull_expulsion",
        type: "note",
        name: "Order of Expulsion (Tull)",
        weight: 0,
        value: 0,
        title: "THE IRON COVENANT — THE KEEP AT ROCKEFELLER",
        text:
          "ORDER OF EXPULSION\n\nSUBJECT: Archivist Ambrose Tull\nOFFENCE: Unauthorised dissemination of restricted technical material (Field Surgery Manual FM 8-10, one (1) copy) to persons outside the Covenant (Grand Central Market).\n\n" +
          'SENTENCE: Stripped of rank, sigil and Archive access. Banned from the Keep.\n\nLancer-Commander Stroud\n\n[In the margin, in tiny, careful handwriting: "41 patients treated as of this morning. 39 survived. Footnote that." — A.T.]',
      },
      {
        id: "q_note_rook_bounty",
        type: "note",
        name: "Torn Bounty Notice",
        weight: 0,
        value: 0,
        title: "WANTED — BY GUTTER (WOOLWORTH BLDG)",
        text: 'WANTED\nROOK\n(the skinny one with the red hair and the knives)\n\nFOR: running out on the crew, three dead brothers, one stolen Fizzo machine key\n\nREWARD: 50 SCRIP\n\n[Someone has crossed out 50 and written 5. Underneath, in a different hand: "Come and get it, Gutter. — R."]',
      },
    ];
    for (const d of items) L.defineItem(Object.assign({}, d));

    L.quest({
      id: "sq_malone",
      name: "The Rematch",
      giver: "Jim Malone",
      location: "Madison Square Garden",
      desc: "Jim Malone's last fight at Madison Square Garden was stopped in the sixth round by the '67 War. His opponent, Danny \"The Kid\" Kearns, is still out there in the ruins — a Maniac now, and wearing the belt they never finished fighting for.",
      stages: [
        {
          id: "find",
          text: 'Find Danny "The Kid" Kearns in the ruins of Madison Square Garden, 34th Street west of 7th Avenue.',
          onEnter: () => spawnQuestActors(),
          markers: () => {
            const a = L.npc("msg_kid");
            return a && !a.dead
              ? [{ npc: "msg_kid", label: "The Kid" }]
              : [
                  {
                    x: KID_SPOT.x,
                    z: KID_SPOT.z,
                    label: "Madison Square Garden",
                  },
                ];
          },
        },
        {
          id: "belt",
          text: "Take the championship belt from the Kid's body.",
          markers: () => {
            const a = L.npc("msg_kid");
            return a ? [{ x: a.pos.x, z: a.pos.z, label: "The Kid" }] : [];
          },
        },
        {
          id: "return",
          text: "Bring the Garden championship belt to Jim Malone.",
          markers: () => [{ npc: "comp_malone", label: "Malone" }],
        },
        {
          id: "done",
          text: () =>
            L.flag("malone_belt_given")
              ? "You gave Malone the belt. After twenty-two years, the fight is over."
              : L.flag("malone_belt_sold")
                ? "You sold Malone the belt he never got to win."
                : "You kept the Garden championship belt for yourself.",
          complete: true,
        },
      ],
      rewards: { xp: 200 },
    });
    L.quest({
      id: "sq_tull",
      name: "Chapter and Verse",
      giver: "Ambrose Tull",
      location: "Guggenheim Museum",
      desc: 'Ambrose Tull was expelled from the Iron Covenant for giving a medical manual to Grand Central. Now he wants to give books to everyone — and for that he needs the Autotype press core from the Guggenheim\'s 1967 exhibition, "The Printed Word."',
      stages: [
        {
          id: "fetch",
          text: "Recover the Autotype press core from the top of the Guggenheim's spiral.",
          onEnter: () => spawnQuestActors(),
          markers: () =>
            L.pickups.tull_press
              ? [
                  {
                    x: L.pickups.tull_press.pos.x,
                    z: L.pickups.tull_press.pos.z,
                    y: L.pickups.tull_press.pos.y,
                    label: "Press Core",
                  },
                ]
              : [{ x: 160, z: -755, label: "Guggenheim Museum" }],
        },
        {
          id: "return",
          text: "Bring the press core to Ambrose Tull.",
          markers: () => [{ npc: "comp_tull", label: "Tull" }],
        },
        {
          id: "done",
          text: () =>
            L.flag("tull_library")
              ? "The Grand Central Free Reading Room is open to anyone who can read — and Tull is teaching the rest."
              : "You kept the press core. Tull went back to copying books by hand.",
          complete: true,
        },
      ],
      rewards: { xp: 250 },
    });
    L.quest({
      id: "sq_rook",
      name: "Severance Package",
      giver: "Rook",
      location: "Woolworth Building",
      desc: "Rook walked out on Gutter's raider crew at the Woolworth Building, and Gutter kept six months of her cut. She wants it back. She is prepared to share. Somewhat.",
      stages: [
        {
          id: "stash",
          text: "Recover Rook's lockbox from the raiders in the Woolworth Building.",
          onEnter: () => spawnQuestActors(),
          markers: () =>
            L.pickups.rook_lockbox
              ? [
                  {
                    x: L.pickups.rook_lockbox.pos.x,
                    z: L.pickups.rook_lockbox.pos.z,
                    label: "Rook's Lockbox",
                  },
                ]
              : [{ x: 0, z: 603, label: "Woolworth Building" }],
        },
        {
          id: "gutter",
          text: "(Optional) Kill Gutter.",
          sideObjective: true,
          optional: true,
          doneIf: () => L.isDead("comp_gutter"),
          markers: () =>
            L.alive("comp_gutter")
              ? [{ npc: "comp_gutter", label: "Gutter" }]
              : [],
        },
        {
          id: "return",
          text: "Bring the lockbox to Rook.",
          markers: () => [{ npc: "comp_rook", label: "Rook" }],
        },
        {
          id: "done",
          text: () =>
            L.flag("rook_paid")
              ? "You split Rook's severance with her. She almost looked grateful."
              : L.flag("rook_lied")
                ? "You told Rook her lockbox was empty. She believed you. For now."
                : "You kept Rook's money. Rook did not take it well.",
          complete: true,
        },
      ],
      rewards: { xp: 200 },
    });
  });

  // ------------------------------------------------------------------
  // Spawning
  // ------------------------------------------------------------------
  function spawnCompanion(k) {
    const c0 = cfg[k];
    const s = st(k);
    const inv = ensureInv(k);
    let at;
    const P = G.player.pos;
    if (s.rec && !s.wait && !s.hostile)
      at = { fallback: { x: P.x + 1.5, z: P.z + 1.5, y: P.y }, maxR: 6 };
    else if (s.rec && s.wait)
      at = { fallback: { x: s.wait.x, z: s.wait.z, y: s.wait.y }, maxR: 4 };
    else {
      const h = homeOf(k);
      at = { fallback: { x: h.x, z: h.z, y: h.y }, maxR: 3 };
    }
    const followingNow = s.rec && !s.wait && !s.hostile;
    const a = L.spawnNPC(
      Object.assign({}, c0.look, {
        id: c0.id,
        name: c0.name,
        faction: s.hostile
          ? "raiders"
          : followingNow || s.rec
            ? "player"
            : c0.faction,
        ai: followingNow ? "follow" : "guard",
        home: "here",
        homeR: 2,
        at,
        hostile: s.hostile ? true : false,
        essential: !s.hostile,
        dialogue: s.hostile ? undefined : c0.dlg,
        inventory: inv.map((e) => [e[0], e[1]]),
        weapon: "none",
        noRespawn: true,
        barks: {
          idle: s.rec ? c0.idle : c0.ambient,
          greet: c0.greet,
          alert: c0.combat,
          kill: c0.kill,
        },
      }),
    );
    if (!a) return;
    a.inventory = inv.map((e) => [e[0], e[1]]);
    a.essential = !s.hostile;
    ensureWeapon(k, true);
    if (followingNow) startFollow(k);
    else if (s.rec && s.wait) setGuard(a, s.wait.x, s.wait.z, 1.5);
    else if (!s.hostile) {
      const h = homeOf(k);
      a.faction = c0.faction;
      setGuard(a, h.x, h.z, 2);
    } else {
      a.faction = "raiders";
      try {
        a.setHostile(true);
      } catch (e) {
        /* */
      }
    }
  }
