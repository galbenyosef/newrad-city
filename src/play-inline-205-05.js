// play-inline-205 05 — base
// Lines 3807-3976 of readable/play-inline-205.pretty.js (statement-aligned).
  function sealBreach(how) {
    PF.setFlag("tr_breach", how);
    PF.sfx(how === "blast" ? "explosion" : "melee_hit", PF.trBreachPos);
    if (how === "blast") {
      try {
        G.player.shake(0.8, 0.8);
      } catch (e) {
        /* optional */
      }
      try {
        G.fx.dust(PF.trBreachPos);
      } catch (e) {
        /* optional */
      }
    }
    if (how === "blast") PF.inv.remove("frag_grenade", 1);
    const msg = {
      brace:
        "You wedge old pew timbers across the breach and brace them with rubble. It'll hold.",
      blast:
        "The grenade brings the tunnel roof down in a roar of dust. Nothing is getting through that.",
      rubble:
        "An hour of hauling rubble later, the breach is packed tight. Your back will remember this.",
    }[how];
    G.notify(msg || "The breach is sealed.");
    if (how === "rubble") {
      try {
        if (PF.live("rpg") && G.rpg.wait) G.rpg.wait(1);
      } catch (e) {
        /* optional */
      }
    }
    PF.q.advance(
      "pf_dust",
      ["talk", "key", "crypt", "clear", "breach"],
      "report",
    );
  }
  PF.trSealBreach = sealBreach;

  // ===================================================================
  // CONTENT: items, notes, terminal, dialogue, quest, NPCs
  // ===================================================================
  // ---- locks: the crypt gate (key from Reverend Penhallow), the vestry teletype and safe (codes in Penhallow's dialogue / the parish ledger) ----
  const TR_LOCKS = (PF.trLocks = {
    crypt: PF.regLock({
      id: "pf_lk_tr_crypt",
      label: "Trinity Crypt Gate",
      key: "pf_crypt_key",
      kind: "gate",
      hint: 'Reverend Penhallow gives the key (and a spare) for "Dust to Dust".',
    }),
    parish: PF.regLock({
      id: "pf_lk_tr_parish",
      label: "Trinity Parish Teletype",
      passcode: "ALEXANDER",
      kind: "terminal",
      hint: "Reverend Penhallow mentions it when he talks about Hamilton.",
    }),
    safe: PF.regLock({
      id: "pf_lk_tr_vestry_safe",
      label: "Vestry Safe",
      code: "0711",
      kind: "safe",
      hint: "The settlement ledger on the parish teletype.",
    }),
  });
  PF.keyFrom("pf_crypt_key", "Reverend Penhallow (Dust to Dust)");
  PF.item({
    id: "pf_crypt_key",
    type: "key",
    name: "Trinity Crypt Key",
    weight: 0,
    value: 0,
    quest: true,
    desc: "A heavy iron key on a loop of purple ribbon. Reverend Penhallow handed it over like it was hot.",
  });
  PF.item({
    id: "pf_note_sexton",
    type: "note",
    name: "Sexton's Day-Book",
    title: "Day-Book of Silas Cobb, Sexton — Trinity Parish",
    text:
      "Mar 5. The sirens. Forty-one parishioners and I went down into the crypt and I barred the gate as the Rector asked. The ground shook like the end of the world, which the Rector says it was not, technically.\n\n" +
      "Mar 12. Air is thin. The old colonial tunnel behind the south wall has a draught in it. I have begun to dig.\n\n" +
      "Nov 12. We are through to the tunnel. It goes toward the river. The air that comes in is warm and tastes of pennies. Mrs. Okonjo's skin is peeling. Mine too.\n\n" +
      "Dec ?. The lamp oil is gone and I find I do not mind the dark. I have lost the words to the Psalms. The others have stopped talking and started screaming. I will stay with them. A sexton keeps the dead. That is the job.\n\n" +
      "[The last page is a list of names, forty-one of them, each crossed out, and a forty-second — Silas Cobb — not yet crossed out.]",
  });
  PF.item({
    id: "pf_note_organist",
    type: "note",
    name: "Organist's Programme",
    title: "Order of Service — Sunday 5 March 1967 (Fourth Sunday in Lent)",
    text:
      'PRELUDE: "A Mighty Fortress" (arr. for full swell)\nHYMN 1: "Eternal Father, Strong to Save"\nSERMON: "Render Unto Caesar: Faith and Your Shelter Card" — The Rev. H. Whitcombe\n\n' +
      "[Pencilled in the margin:] Sunday is cancelled. Everything is cancelled. I am staying up here to play anyway. If God is listening, the acoustics had better be good.",
  });
  PF.item({
    id: "pf_note_lookout",
    type: "note",
    name: "Lookout's Log",
    title: "Belfry Watch — Trinity Sanctuary",
    text: "Day 1: Wall Street quiet. Raider fires at the Exchange again.\nDay 3: Robots still marching around the Federal Reserve on Liberty Street. Round and round. Nobody goes in. Nobody comes out.\nDay 4: Shellbacks on the Seaport piers, big ones. Something hatching on the tall ship.\nDay 6: Lights in Fraunces Tavern. Tobin says rumours are free, drinks are not.\nDay 9: Scratching under the chancel again at night. Reverend says it's rats. Reverend has never met a rat.",
  });
  PF.item({
    id: "pf_reel_rector",
    type: "tape",
    name: 'Tape reel: "The Last Sermon"',
    title: "Trinity Parish — Recorded Sermon, 5 Mar 1967 (partial)",
    text: "[Organ, very faint. A cough.]\n\nRECTOR WHITCOMBE: ...and so when they tell us the Shelter is Tomorrow, remember that this church has stood through fire, through revolution, through the Panic of 1907 and the markets of last Tuesday. We do not need a reservation to be saved.\n\n[A siren begins outside.]\n\nRECTOR: ...Ah. Well. Silas, would you be so kind as to open the crypt. Ladies and gentlemen, please proceed downstairs in an orderly — no, walk, WALK —\n\n[Recording ends.]",
  });
  PF.item({
    id: "pf_weehawken",
    build() {
      const base = PF.live("items")
        ? G.items.get("pistol_32") || G.items.get("pistol_10mm")
        : null;
      const w =
        base && base.weapon
          ? Object.assign({}, base.weapon, {
              damage: Math.round((base.weapon.damage || 14) * 1.9),
              magSize: 5,
              critMult: 2.5,
              critChance: 2.0,
              spread: (base.weapon.spread || 0.02) * 0.6,
              skin: "gold",
              condDecay: (base.weapon.condDecay || 0.002) * 0.6,
            })
          : undefined;
      return {
        id: "pf_weehawken",
        type: w ? "weapon" : "misc",
        name: "Weehawken",
        weight: 2,
        value: 900,
        unique: true,
        icon: base ? base.icon : undefined,
        desc: 'A .32 revolver with a brass-inlaid grip engraved "A.H. — 1804". Reverend Penhallow swears it is a faithful copy of a certain pair of duelling pistols. The Reverend is a terrible liar. Superb critical hits.',
        weapon: w,
      };
    },
  });

  PF.terminal("pf_tr_parish", {
    title: "TRINITY PARISH OFFICE",
    header: "KESTREL TELETYPE CORP. — MODEL 40 — PARISH RECORDS SYSTEM v2.1",
    lock: TR_LOCKS.parish,
    entries: [
      {
        title: "Burial Register (Crypt)",
        text: 'CRYPT INTERMENTS SUSPENDED 1843.\nEXCEPTION: EMERGENCY SHELTER PROTOCOL (CIVIL DEFENSE ORDER CD-61-114) — "Parish crypts designated as public shelter where no private shelter space is held."\n\nSHELTER LOG: 42 persons admitted 03/05/1967. Sexton S. Cobb responsible.\n\nNO FURTHER ENTRIES.',
      },
      {
        title: "Memo: The South Wall",
        text: 'To: Rector Whitcombe\nFrom: Buildings & Grounds\n\nThe draught in the crypt\'s south wall is the old colonial tunnel (c. 1776) that ran to the river. It was bricked up in 1911. The bricks are "sort of" still there. Recommend we do not tell the insurance people.',
      },
      {
        title: "Sermon Draft (unfinished)",
        text: "RENDER UNTO CAESAR\n\nWhen the Office of Civil Defense asks for our faith, and the Federal Reserve asks for our gold, and the Stock Exchange asks for our souls, we must ask: which of these will still be standing on Monday?\n\n[Draft ends. Coffee ring.]",
      },
      {
        title: "Settlement Ledger (Rev. Penhallow)",
        text: "Water: 3 barrels. Potato beds: 5, doing well. Doc Obi: out of Prussian Blue again.\nDonations: 212 scrip, one old-world ten-dollar bill (Hamilton's grave — returned it), a live chicken (ate it).\n\nThe scratching under the chancel is getting louder. Must ask a stranger. Nobody here will go down.\n\nVestry safe reset to 0711 (the duel; the old Rector's joke, kept for his sake).",
        learn: "pf_lk_tr_vestry_safe",
      },
    ],
  });

  // --- dialogue: Reverend Josiah Penhallow -----------------------------------
