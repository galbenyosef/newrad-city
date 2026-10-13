/* src/quests/63_ms_act2.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 63: MAIN STORY, ACT II "THE LONG NOON" (mq11–mq18)
 *   n8  mq11 "Paper Trail"            — Tobias Wren's Register (absorbs pc_records):
 *                                        the Sixty-One Camp pages; ROSE MEAD lives
 *   n9  mq12 "The Long Noon"          — Hollowell's isotope (absorbs sq_glow); the
 *                                        Book of the Kindling in the Dawn's words
 *   n10 mq13 "Neon Heart"             — Mayor Crowe saw the 1968 riot; the rig
 *                                        battery (absorbs sq_neon); the TRACK 61 bulkhead
 *   n11 mq14 "Jamming Season"         — Ruby Kehoe, the Waldorf jammer (absorbs
 *                                        pmid_q_deadair), the 1968 file, the M-61 shaft
 *   n12 mq15 "Sept Means Seven"       — Lys and LUMIERE (absorbs sq_bureau_sept)
 *   n13 mq16 "Ten Days in the Madhouse" — Nell Brady's reels (absorbs pr_tendays)
 *   n14 mq17 "The Dawn Hour"          — the direction-finder, 05:47, the First Journal
 *                                        relay, the cable under 42nd Street, a reply
 *   n15 mq18 "The Stone and the Girl" — the Kindling Garden; Flint is Rose; LIE 1;
 *                                        the Second Sun and the key on Liberty; the ring
 * Spec: story/outline.json quests[7..14]. Toolkit: L.ms (61_ms_core.js).
 * Flags set here: ms_knows_daughter, ms_token_rose_page, ms_book_read (+ms_book_*), ms_glow (via 45),
 *   ms_crowe_riot, ms_bulkhead_seen, ms_sun_battery (via 45), ms_waldorf_jammer_down, ms_waldorf_loud,
 *   ms_ruby_free, ms_file_1968_read, ms_m61_seen, ms_token_pass, ms_bureau (via 52), ms_codebook_on_liberty
 *   (via 52), ms_nell, ms_token_nell, ms_finder_built, ms_rose_mouthed, ms_dawn_relay ('replied'|'cut'|'left'),
 *   ms_eli_replied, ms_token_voice, ms_voice_reached, ms_dawn_relay_cut, ms_glow_wary, ms_stone_undug,
 *   ms_stone_dug, ms_rose_revealed, ms_rose_lie1, ms_ring ('rose'|'stone'|'kept'), ms_ring_to_rose,
 *   ms_ring_on_stone, ms_rose_follow_ok.
 * NPCs: ms_thimble, ms_ruby (Ruby Kehoe), ms_n13_acolyte1/2, ms_n17_acolyte1/2, ms_taper_relay.
 * Text only: no speech synthesis anywhere.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const ms = L.ms;
  if (!ms) return;
  const first = () => String(L.heroName()).split(" ")[0];
  const at = (id, s) => Q.isActive(id) && Q.stage(id) === s;
  const atAny = (id, list) => Q.isActive(id) && list.indexOf(Q.stage(id)) >= 0;
  const IX = (k) =>
    (G.LAYOUT &&
      G.LAYOUT.INTERIORS &&
      G.LAYOUT.INTERIORS[k] &&
      G.LAYOUT.INTERIORS[k].origin) ||
    null;
  const revealed = () => !!L.flag("ms_rose_revealed");
  const N = () => L.neon || {};
  const hasRing = () =>
    !!(
      ms.f("has_ring") ||
      ms.hasToken("ring") ||
      L.has("ms_ring") ||
      L.has("ms_grandmother_ring")
    ) && !ms.f("ring");
  const glowFriendly = () =>
    ["planted", "placebo", "convinced"].indexOf(L.flag("ms_glow")) >= 0 &&
    !ms.f("glow_wary");

  // ------------------------------------------------------------------
  // Places (anchors first, fallbacks after)
  // ------------------------------------------------------------------
  const TS = { x: -40, z: -262 };
  const P = {
    wrenDesk: {
      site: "municipal_building",
      anchors: ["register", "records_desk", "wren"],
      fallback: { x: 160, z: 600 },
    },
    hall: {
      site: "municipal_building",
      anchors: ["records_desk", "wren", "hall"],
      fallback: { x: 160, z: 600 },
    },
    stpAltar: {
      site: "st_patricks",
      anchors: ["terminal", "altar", "pulpit"],
      fallback: { x: 130, z: -334 },
    },
    garden: {
      site: "st_patricks",
      anchors: ["kindling_garden", "kindling_stone"],
      fallback: { x: 150, z: -330 },
    },
    stone: {
      site: "st_patricks",
      anchors: ["kindling_stone", "kindling_garden"],
      fallback: { x: 150, z: -330 },
    },
    market: {
      site: "times_square",
      anchors: ["market", "stall", "merchant3", "merchant2"],
      fallback: { x: TS.x + 8, z: TS.z - 6 },
    },
    waldorf: {
      site: "waldorf",
      anchors: ["radio", "roof", "entrance"],
      fallback: { x: 240, z: -342 },
    },
    // Waldorf interior fallbacks (poi_midtown/10_waldorf.js: lobby at origin+16, service elevator hall at origin-24, floor 1.5 m)
    rubyCell: () => {
      const o = IX("waldorf");
      return {
        site: "waldorf",
        anchors: ["ruby_cell", "holding", "suite"],
        fallback: o
          ? { x: o.x - 4, z: o.z + 14, y: (o.y || 0) + 1.5 }
          : { x: 236, z: -342 },
      };
    },
    rubyFile: () => {
      const o = IX("waldorf");
      return {
        site: "waldorf",
        anchors: ["ruby_cell", "holding", "suite"],
        fallback: o
          ? { x: o.x - 2.5, z: o.z + 14, y: (o.y || 0) + 1.5 }
          : { x: 236, z: -340 },
        dx: 1.4,
        dz: 0.6,
      };
    },
    m61: () => {
      const o = IX("waldorf");
      return {
        site: "waldorf",
        anchors: ["m61_door", "sub_basement", "freight_elevator"],
        fallback: o
          ? { x: o.x + 10.5, z: o.z - 22, y: (o.y || 0) + 1.5 }
          : { x: 240, z: -342 },
      };
    },
    radio: {
      site: "radio_city",
      anchors: ["rocky", "dj", "booth", "studio", "entrance"],
      fallback: { x: 0, z: -342 },
    },
    relay: {
      site: "journal_bldg",
      anchors: ["relay", "globe_room"],
      fallback: { x: 311, z: -252 },
    },
    relaySpot: {
      site: "journal_bldg",
      anchors: ["relay", "globe_room"],
      fallback: { x: 311, z: -252 },
      dx: 1.6,
      dz: 0.8,
    },
    relayGuard: (i) => ({
      site: "journal_bldg",
      anchors: ["globe_room", "relay"],
      fallback: { x: 311 + (i ? 3 : -3), z: -252 + 2 },
      maxR: 6,
    }),
    grate: {
      site: "grand_central",
      anchors: ["cable_grate"],
      fallback: { x: 270, z: -244 },
    },
    octagon: {
      site: "roosevelt_octagon",
      anchors: ["entrance", "gate"],
      fallback: { x: 406, z: -670 },
    },
    lys: {
      site: "grand_central",
      anchors: ["bar_patron2", "bar_patron1"],
      fallback: { x: 224, z: -238 },
    },
  };
  const R = (spec) => (typeof spec === "function" ? spec() : spec);
  const markAt = (spec, label) => () => {
    const s = R(spec);
    return [{ anchor: [s.site, s.anchors], fallback: s.fallback, label }];
  };
  const spotMark = (id, label) => () => {
    const p = ms.spotPos(id);
    return p ? [{ x: p.x, z: p.z, y: p.y, label, exact: true }] : [];
  };
  const npcOr = (npc, label, spec) => () =>
    L.alive(npc) ? [{ npc, label }] : markAt(spec, label)();
  /** The rig battery's spot in the 42nd St tunnels (45_neon_glow.js), memoised. */
  let coreMemo = null;
  function coreSpot() {
    const pk = L.pickups.neon_core;
    if (pk && pk.pos) return pk.pos;
    if (!coreMemo && N().coreSpot && L.isWorldBuilt()) {
      try {
        coreMemo = N().coreSpot();
      } catch (e) {
        coreMemo = null;
      }
    }
    return coreMemo;
  }
  L.hook("reset", function () {
    coreMemo = null;
  });

  // ------------------------------------------------------------------
  // Notes and items
  // ------------------------------------------------------------------
  ms.note({
    id: "ms_note_register_61",
    name: "The Register: Sixty-One Camp Pages",
    title:
      "THE SIXTY-ONE CAMP, under the Terminal, 1967– (three scorched leaves, lifted apart by T. Wren)",
    text:
      "[Births in black, deaths in red. The edges are brown where Big Ledger's fire got at them. Wren's hand, small and upright, in pencil and later in soot.]\n\n" +
      "Births, Sixty-One Camp, 1967: fourteen. Deaths, 1967: thirty-one.\n\n" +
      "MEAD, ROSE. f. Born 11 Nov 1967, at dawn, Track 61. Mother: Nicole Mead, interpreter, Canadian national. Father: E. W. (asleep, Civil Defense).\n" +
      "    [Smaller, beside it: \"Delivered by Hollis, medical student. Mother insisted on 'asleep'. Twice.\"]\n\n" +
      "18 Feb 1968: refused penicillin at the Relief Station (not enrolled).\n\n" +
      "5 Mar 1968: riot. Penicillin taken. ROSE MEAD lives. Eleven children dead in the ration store. MEAD, NICOLE: missing.\n" +
      "    [Eleven names follow in red, in a column. The youngest was four.]\n\n" +
      "[In the margin, in pencil, much later:]\n" +
      "1984: A girl of sixteen asked whether her father was in my book. I told her: asleep.",
  });
  ms.note({
    id: "ms_note_rose_page",
    name: "Certified Copy: MEAD, ROSE",
    title: "CITY OF NEW YORK — OFFICE OF THE CITY CLERK — CERTIFIED TRUE COPY",
    text:
      "CITY OF NEW YORK\nOFFICE OF THE CITY CLERK (T. WREN, LAST CLERK)\nCERTIFIED TRUE COPY OF AN ENTRY IN THE REGISTER OF BIRTHS\n\n" +
      "MEAD, ROSE. f. Born 11 Nov 1967, at dawn, Track 61, Grand Central Terminal.\nMother: Nicole Mead, interpreter, Canadian national.\nFather: E. W. (asleep, Civil Defense).\n\n" +
      "Issued March 1989, at the request of the father, who is awake.\n\n[A raised seal, pressed hard enough to tear the paper a little: CITY OF NEW YORK. Signed: T. Wren.]",
  });
  ms.note({
    id: "ms_note_kindling",
    name: "The Book of the Kindling (printed)",
    title: "THE BOOK OF THE KINDLING — as given by the Dawn",
    text: (function () {
      const B = (L.neon && L.neon.BOOK) || {};
      return (
        "[Teletype paper, torn from the cathedral's machine, or copied out in your own hand while Sister Noonday recited.]\n\n" +
        "THE PARABLE OF THE MATCH\n" +
        (B.match || "") +
        "\n\nTHE PARABLE OF THE ELEVEN\n" +
        (B.eleven || "") +
        "\n\nTHE PSALM OF THE SLEEPERS\n" +
        (B.psalm || "") +
        "\n\nTHE RULE OF THE KINDLING\n" +
        (B.rule || "")
      );
    })(),
  });
  ms.note({
    id: "ms_note_acolyte",
    name: "Acolyte's Prayer Card",
    title: "A Glowkeeper prayer card, pencil on the back",
    text:
      "[Front: a twelve-rayed sun, printed in orange, and THE SUN DOES NOT CHOOSE.]\n\n[Back, in pencil, in a hurry:]\n\n" +
      "Brother Wick — the tunnels by the dead car, the maintenance closet. The Dawn needs a heart for the Sun. Find it before the Neon does. Bring it down the long way, by Track 61. Keep the light on.",
  });
  ms.note({
    id: "ms_note_file_mead_1968",
    name: "OCD Incident File 68-0305 (MEAD)",
    title:
      "A fat buff folder, OCD stamps, Continuity forward post, the Waldorf-Astoria",
    text:
      'OFFICE OF CIVIL DEFENSE — RELIEF STATION, GRAND CENTRAL TERMINAL\nINCIDENT FILE 68-0305  ·  "THE RELIEF STATION RIOT"  ·  5 MARCH 1968\n\n' +
      "MEAD, NICOLE: WANTED, arson, 12 dead; child MEAD, ROSE (unenrolled); both PRESUMED DEAD.\n\n" +
      'DESCRIPTION: F, 29, dark hair, French accent (Canadian national; not enrolled 1967). Known in the shelter as "the Candle Lady". Burned in the fire (witnesses). Last seen carried south along Track 61 by persons in robes.\n' +
      "CASUALTIES: 12 (Capt. L. Crane, commanding; 11 juveniles, ration store).\n" +
      "ACTION TAKEN: Lower level closed by order. Freight shaft M-61 (Waldorf-Astoria service core to Track 61) welded 10 III 1968. Search of lower level suspended.\n" +
      "REWARD: 50 ration scrip for information. Unclaimed.\n\n" +
      "CROSS-REFERENCE: Bureau Sept source LUMIERE (since summer '66). See captured dossier HIVER.\n\n" +
      "ADDENDUM, 1989 (typed on a newer machine): Exhibit A, United Nations Secretariat pass, MEAD N., INTERPRETER (FRENCH), BOOTH 4, surrendered by KEHOE, RUBY, seamstress, the Neon, in support of a claim for the reward. Claimant detained for questioning as to the source. Claim denied. File remains OPEN.",
  });
  ms.item({
    id: "ms_un_pass",
    type: "misc",
    quest: true,
    name: "Nicole's UN Pass (1967)",
    weight: 0,
    value: 0,
    desc: "A United Nations Secretariat pass, the corners gone soft from twenty years in a coat lining: MEAD, NICOLE — INTERPRETER (FRENCH) — BOOTH 4. The photograph is of a young woman trying not to laugh at the photographer.",
  });
  ms.item({
    id: "ms_neon_coil",
    type: "misc",
    quest: true,
    name: "Neon Transformer Coil",
    weight: 2,
    value: 20,
    desc: 'A sign transformer from the Neon, its windings re-taped by somebody who loved it. Mayor Crowe swears it will "hear a mouse whisper in Jersey" if you wind it into a loop.',
  });
  ms.item({
    id: "ms_direction_finder",
    type: "misc",
    quest: true,
    name: "Rocky's Direction-Finder",
    weight: 3,
    value: 0,
    desc: 'A loop antenna on a broom handle, a compass card glued to a coffee-can lid, and one of Rocky\'s spare headsets. It points at whoever is talking. Rocky named it "Sugar Ray".',
  });

  // ==================================================================
  // mq11 — PAPER TRAIL
  // ==================================================================
  function readPages() {
    if (!L.has("ms_note_register_61")) L.give("ms_note_register_61", 1);
    if (!ms.f("knows_daughter")) {
      ms.set("knows_daughter");
      L.xp(60, "The Register");
    }
  }
  function takeCopy() {
    if (ms.hasToken("rose_page")) return;
    ms.token("rose_page");
    if (!L.has("ms_note_rose_page")) L.give("ms_note_rose_page", 1);
  }
  function finishMq11() {
    readPages();
    if (Q.isActive("mq11")) Q.complete("mq11");
  }

  const WREN = ms.dlg("dlg_ms_wren", "mq11_pages");
  WREN.add({
    mq11_pages: {
      speaker: "Tobias Wren",
      text: () =>
        L.has("ms_note_register_61")
          ? "The Sixty-One Camp pages again? I have them right here. I keep coming back to them myself."
          : "[Wren has the Register open on his desk and a kitchen knife warming over a candle. He slides the blade between two scorched leaves the way you would lift the skin off warm milk.] " +
            "There. The Sixty-One Camp, under the Terminal, 1967 and '68. I went down every Sunday with my book until they closed the stair. Who are you looking for?",
      responses: [
        { text: "Mead. Nicole Mead.", next: "mq11_e1" },
        { text: "Read me the births first.", next: "mq11_e1" },
      ],
    },
    mq11_e1: {
      speaker: "Tobias Wren",
      text:
        "[He runs a fingernail down the column of black ink, stops, and turns the book round so you can read it yourself.]\n\n" +
        '"MEAD, ROSE. f. Born 11 Nov 1967, at dawn, Track 61. Mother: Nicole Mead, interpreter, Canadian national. Father: E. W. (asleep, Civil Defense)."',
      responses: [
        {
          text: "E. W. ...That's me. Those are my initials.",
          next: "mq11_e1b",
        },
        { text: "[Read it again.]", next: "mq11_e1again" },
      ],
    },
    mq11_e1again: {
      text: "[MEAD, ROSE. Born at dawn. Father: E. W. (asleep). You read it a third time, and a fourth, and the words stay exactly where they are.]",
      responses: [{ text: "E. W. That's me.", next: "mq11_e1b" }],
    },
    mq11_e1b: {
      speaker: "Tobias Wren",
      text:
        '[Wren takes his glasses off.] Asleep, Civil Defense. She was very particular about that. I wrote "father unknown" and she made me cross it out. "Not unknown," she said. "Not dead. Asleep." She made me write it twice so the book would be sure. ' +
        "I thought she was out of her mind with the birth. [He looks at you over the desk for a long moment.] I am beginning to think she was the only sane person in the building.",
      responses: [
        { text: "A daughter. Rose. What happened to her?", next: "mq11_e2" },
      ],
    },
    mq11_e2: {
      speaker: "Tobias Wren",
      text:
        '[He turns the leaf. Red ink now, and black, crowded together.]\n\n"18 Feb 1968: refused penicillin at the Relief Station (not enrolled)."\n\n' +
        "The OCD gave out medicine against 1967 enrolment cards. No card, no medicine. Your Miss Mead was a Canadian; she had never been on anybody's list, and neither was a baby born in a railway tunnel.",
      responses: [{ text: "Keep going.", next: "mq11_e3" }],
    },
    mq11_e3: {
      speaker: "Tobias Wren",
      text:
        '"5 Mar 1968: riot. Penicillin taken. ROSE MEAD lives. Eleven children dead in the ration store. MEAD, NICOLE: missing."\n\n' +
        "[Under it, eleven names in red. Wren does not read them out. He puts his hand flat over them, as if to keep them warm.] The first anniversary of the Bombing. The Relief Station burned. I came down on the Sunday after with my book and wrote what people told me. " +
        "The baby lived. That one I underlined; you can see where the pencil went through.",
      responses: [
        { text: "She lived. Rose lived.", next: "mq11_margin" },
        { text: '"Missing." Not dead?', next: "mq11_missing" },
      ],
    },
    mq11_missing: {
      speaker: "Tobias Wren",
      text: "Missing is what I write when nobody saw a body and nobody will say. The Continuity, when it was still the OCD, wrote \"presumed dead\" on everything that went down those tracks. I don't presume. It isn't a clerk's job to presume.",
      responses: [{ text: "And Rose?", next: "mq11_margin" }],
    },
    mq11_margin: {
      speaker: "Tobias Wren",
      text:
        '[He hesitates, then points to the margin, where a much later pencil note sits sideways along the edge.]\n\n"1984: A girl of sixteen asked whether her father was in my book. I told her: asleep."\n\n' +
        'She came up the stairs here on her own, thin as a rail, soot on her fingers like a lamplighter, and asked for the Sixty-One Camp, 1967. I showed her the line. She read it for a long time. I said, "asleep." She said, "Still?" and I didn\'t have an answer for that. She wouldn\'t give a name. I never saw her again.',
      onEnter() {
        readPages();
      },
      responses: [
        {
          text: "She's alive. My daughter is alive, somewhere in this city.",
          next: "mq11_copy",
        },
      ],
    },
    mq11_copy: {
      speaker: "Tobias Wren",
      text: "Somewhere. People do turn up, you know. It's the one thing the book has taught me. [He squares the Register on the desk.] The City of New York doesn't have many offices left. I'm all of them. If you like, I can make you a certified copy of her entry. Properly. With the seal.",
      responses: [
        { text: "Please. I want it in writing.", next: "mq11_copy_yes" },
        {
          text: "Keep it in the book, where it belongs.",
          next: "mq11_copy_no",
        },
      ],
    },
    mq11_copy_yes: {
      speaker: "Tobias Wren",
      text: "[He copies the entry out in his best clerk's hand, blots it, and then leans his whole weight on the City Clerk's seal until the paper creaks.] \"Issued at the request of the father, who is awake.\" There. That's official. Nobody can say otherwise now.",
      onEnter() {
        takeCopy();
      },
      responses: [{ text: "Thank you, Tobias.", action: () => finishMq11() }],
    },
    mq11_copy_no: {
      speaker: "Tobias Wren",
      text: "As you like. It will be here. That's what the book is for. [He closes it gently.] Go and find her, Mister E. W. And if you do, bring her up the stairs. I'd like to cross out \"asleep.\"",
      responses: [{ text: "I will.", action: () => finishMq11() }],
    },
  });
  // Wren's own tree lives in poi_civic (registered straight with G.dialogue): add the Register beat to it while mq11 needs it.
  function patchWren() {
    if (G.isStub("dialogue") || !G.dialogue.get) return;
    const t = G.dialogue.get("pc_dlg_wren");
    if (!t || !t.nodes || t._ms11) return;
    t._ms11 = true;
    for (const k in WREN.nodes) if (!t.nodes[k]) t.nodes[k] = WREN.nodes[k];
    const s0 = t.start;
    t.start = (actor, A) =>
      at("mq11", "register61")
        ? "mq11_pages"
        : typeof s0 === "function"
          ? s0(actor, A)
          : s0;
  }
  G.events.on("initDone", patchWren);
  L.hook("spawn", function () {
    L.later(0.5, patchWren);
  });

  ms.spot({
    id: "ms_spot_register61",
    label: "The Register (Sixty-One Camp pages)",
    verb: "Ask Wren about",
    when: () => at("mq11", "register61"),
    at: P.wrenDesk,
    use() {
      ms.talk("dlg_ms_wren", "Tobias Wren");
    },
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq11",
      giver: "Tobias Wren, Last Clerk",
      location: "Manhattan Municipal Building, Hall of Records",
      desc: () =>
        Q.isComplete("mq11")
          ? "Tobias Wren's Register: MEAD, ROSE, born 11 November 1967 at dawn on Track 61. Father: E. W. (asleep). Refused penicillin in February 1968; alive after the riot of 5 March 1968. " +
            first() +
            " has a daughter, and she lived. In 1984 a girl of sixteen asked Wren whether her father was in his book."
          : "Since 1967 Tobias Wren, the Last Clerk, has kept a Register of every birth and death he could reach, the Sixty-One Camp under Grand Central included. The Brutes in the Hall of Records are burning it to cook with.",
      stages: [
        ms.proxy("mq11", "pc_records", {
          id: "records",
          text: "Free Tobias Wren and recover his Register from the Brutes in the Hall of Records.",
          next: "register61",
          reach: {
            site: P.hall.site,
            anchors: P.hall.anchors,
            fallback: P.hall.fallback,
            label: "Hall of Records",
            r: 18,
          },
        }),
        {
          id: "register61",
          text: "Read the Register's Sixty-One Camp entries with Tobias Wren at his desk.",
          markers: () =>
            L.alive("pc_mb_wren")
              ? [{ npc: "pc_mb_wren", label: "Tobias Wren" }]
              : markAt(P.wrenDesk, "Wren's Desk")(),
        },
        {
          id: "deed",
          text: "(Optional) Recover the Deed Ledger from the Surrogate's Strongroom.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq11", "records") && !!Q.get("pc_records"),
          doneIf: () => !!L.flag("ms_deed_ledger") || L.has("pc_mb_ledger"),
        },
      ],
      rewards: { xp: 350 },
      onComplete() {
        readPages();
      },
    });
  });
  ms.solver("mq11", {
    records() {
      if (Q.get("pc_records")) {
        if (!Q.isStarted("pc_records")) Q.start("pc_records");
        Q.complete("pc_records");
      } else Q.setStage("mq11", "register61");
    },
    register61() {
      readPages();
      takeCopy();
      finishMq11();
    },
  });

  // ==================================================================
  // mq12 — THE LONG NOON (sq_glow + the Book of the Kindling)
  // ==================================================================
  const BOOK_PARTS = ["match", "eleven", "psalm", "rule"];
  /** A part of the Book was read (terminal entry or Noonday's recitation). part: one of BOOK_PARTS or 'all'. */
  ms.kindlingRead = function (part, src) {
    const parts = part === "all" ? BOOK_PARTS : [part];
    for (const p of parts) {
      if (!L.flag("ms_book_" + p)) {
        L.setFlag("ms_book_" + p, true);
        if (p === "match" && src === "terminal")
          L.later(0.4, () =>
            L.notify(
              "The blackout. November '65. In the dark concourse a clerk broke open a supply locker full of candles, and a girl with a box of matches drew a sun on his box. You were the clerk.",
              { duration: 9 },
            ),
          );
      }
    }
    if (ms.f("book_read")) return;
    if (
      L.flag("ms_book_rule") ||
      BOOK_PARTS.every((p) => L.flag("ms_book_" + p))
    )
      bookDone(src);
  };
  function bookDone(src) {
    if (ms.f("book_read")) return;
    ms.set("book_read", src || true);
    if (!L.has("ms_note_kindling")) L.give("ms_note_kindling", 1);
    L.xp(40, "The Book of the Kindling");
    if (at("mq12", "book")) Q.setStage("mq12", "keeper");
  }
  function completeMq12() {
    if (N().glowMirror) N().glowMirror();
    if (Q.isActive("mq12")) Q.complete("mq12");
  }

  ms.inject("dlg_glow_sister", {
    start: () => (at("mq12", "book") ? "mq12_noonday" : null),
    nodes: {
      mq12_noonday: {
        speaker: "Sister Noonday",
        text: "The Book? Of course. The teletype by the altar will print it for you; the word is LONGNOON, all one word. Or sit with me a minute and I'll say it. I know it by heart. We all do. [She nudges a stool toward you with her foot.]",
        learn: "neon_glow_scripture",
        onEnter() {
          if (G.locks && G.locks.learn) {
            try {
              G.locks.learn("neon_glow_scripture");
            } catch (e) {
              /* */
            }
          }
        },
        responses: [
          { text: "Say it for me.", next: "mq12_n_match" },
          { text: "I'll read it at the altar." },
        ],
      },
      mq12_n_match: {
        speaker: "Sister Noonday",
        text: () =>
          "The Parable of the Match.\n\n" +
          ((L.neon && L.neon.BOOK && L.neon.BOOK.match) || ""),
        onEnter() {
          ms.kindlingRead("match", "noonday");
        },
        responses: [
          {
            text: "[That was the blackout. November '65. You were the clerk with the candles.] ...Go on.",
            next: "mq12_n_eleven",
          },
        ],
      },
      mq12_n_eleven: {
        speaker: "Sister Noonday",
        text: () =>
          "The Parable of the Eleven.\n\n" +
          ((L.neon && L.neon.BOOK && L.neon.BOOK.eleven) || ""),
        onEnter() {
          ms.kindlingRead("eleven", "noonday");
        },
        responses: [{ text: "Go on.", next: "mq12_n_psalm" }],
      },
      mq12_n_psalm: {
        speaker: "Sister Noonday",
        text: () =>
          "The Psalm of the Sleepers. We sing that one.\n\n" +
          ((L.neon && L.neon.BOOK && L.neon.BOOK.psalm) || ""),
        onEnter() {
          ms.kindlingRead("psalm", "noonday");
        },
        responses: [
          {
            text: "[Ninety days of winter. Your own joke, in a stranger's mouth.] Go on.",
            next: "mq12_n_rule",
          },
        ],
      },
      mq12_n_rule: {
        speaker: "Sister Noonday",
        text: () =>
          "And the Rule, which is short, because rules should be.\n\n" +
          ((L.neon && L.neon.BOOK && L.neon.BOOK.rule) || ""),
        onEnter() {
          ms.kindlingRead("rule", "noonday");
        },
        responses: [{ text: "Who wrote all this?", next: "mq12_n_candle" }],
      },
      mq12_n_candle: {
        speaker: "Sister Noonday",
        text:
          "The Dawn. Nobody says her name, not even me; I'm not sure I ever knew it. [She shields her candle jar from a draught that isn't there.] But I'll tell you a thing about her, because you've a face like a man who's been waiting on something. " +
          "Even the Dawn keeps a candle every February. For her sleeper.",
        onEnter() {
          L.setFlag("ms_noonday_candle");
          ms.kindlingRead("all", "noonday");
        },
        responses: [
          {
            text: "[Every February. You were frozen on the twentieth of February.] ...Thank you, Sister.",
          },
        ],
      },
    },
  });
  ms.inject("dlg_glow_ezra", {
    start: () => (at("mq12", "keeper") ? "mq12_keeper" : null),
    nodes: {
      mq12_keeper: {
        speaker: "Keeper Ezra Hollowell",
        text: () => {
          const g = L.flag("ms_glow");
          if (g === "planted")
            return "Bearer of the Light! I watched the market's tower from the bell loft. It glows like a second dawn. [His joy is entirely real, which is the worst of it.] And you have read the Book. Good. Good.";
          if (g === "convinced")
            return "[He looks tired, and lighter.] I have been praying on what you said. A Light that asks, instead of insisting. I am not sure the Dawn will like it. I am not sure I care. And you have read the Book.";
          if (g === "placebo")
            return "The market's tower glows a lovely blue, they tell me. [He beams.] And you have read the Book. You see now why we keep the Light.";
          return "[He folds his hands into his sleeves.] Grand Central's water is as clean as it ever was, and you have read our Book all the same. The Light does not hold a grudge, friend. I try not to.";
        },
        responses: [
          {
            text: "The match. The clerk. The candles. That's my story, Keeper. Mine and hers.",
            next: "mq12_book",
          },
        ],
      },
      mq12_book: {
        text: "It is everybody's story now, friend. That is what a scripture is: a private thing that was given away. [He touches the sun disc on his chest.] The Dawn gave us the words, in the first hard winters. Where she found them I never asked; you do not ask a lamp where it got its oil. I had the fire in me, and nothing to say with it. She had the words. I only ever stammered.",
        responses: [
          { text: "Who is the Dawn?", next: "mq12_dawn" },
          { text: "Is Nicole Mead one of your kindled?", next: "mq12_stone" },
        ],
      },
      mq12_dawn: {
        text: "The one who keeps the light on for all of us. She does not come up into the day, and we do not say the name she had before. [Gently.] Whatever it is you are hoping, sleeper, hope it gently. Hope breaks easily down here.",
        responses: [
          { text: "Is Nicole Mead one of your kindled?", next: "mq12_stone" },
        ],
      },
      mq12_stone: {
        text: "We do not keep the old names. We lay them down. [He nods toward the north side of the cathedral, where a garden has gone to seed inside the railings, full of flat grey stones.] If you must look for a name, look in the garden. But do not dig. The Rule is the Rule.",
        onEnter() {
          L.setFlag("ms_garden_hint");
        },
        responses: [
          { text: "[Leave him to his Light.]", action: () => completeMq12() },
        ],
      },
    },
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq12",
      giver: "Keeper Ezra Hollowell",
      location: "St. Patrick's Cathedral; Grand Central's water tower",
      desc: () =>
        "Keeper Hollowell's service: bless Grand Central's water tower with a Blessed Isotope. Whatever " +
        first() +
        " does with it decides who trusts him: the cult, the market, Flint. " +
        "The Book of the Kindling is read only to those who have served." +
        (ms.f("book_read")
          ? " It is written in Nicole's phrases: the match in the blackout, ninety days of winter, and one rule: the Sun does not choose."
          : ""),
      stages: [
        ms.proxy("mq12", "sq_glow", {
          id: "service",
          text: "Do Keeper Hollowell's service: the Blessed Isotope and Grand Central's water tower.",
          next: "book",
          reach: {
            site: "st_patricks",
            anchors: ["preacher", "altar", "entrance"],
            fallback: { x: 124, z: -342 },
            label: "Keeper Hollowell",
            r: 12,
          },
          onDone() {
            if (N().glowMirror) N().glowMirror();
          },
        }),
        {
          id: "book",
          text: "Read the Book of the Kindling: the teletype by St. Patrick's altar (passcode LONGNOON, from Sister Noonday), or ask Sister Noonday to recite it.",
          onEnter() {
            L.later(0.3, () => {
              if (ms.f("book_read") && at("mq12", "book"))
                Q.setStage("mq12", "keeper");
            });
          },
          markers: () =>
            ms
              .termMarker(
                "glow_scripture",
                "The Book of the Kindling (teletype)",
              )
              .concat([{ npc: "glow_sister", label: "Sister Noonday" }]),
        },
        {
          id: "keeper",
          text: "Return to Keeper Hollowell.",
          markers: () => [{ npc: "glow_ezra", label: "Keeper Hollowell" }],
        },
      ],
      rewards: { xp: 380 },
      onComplete() {
        if (N().glowMirror) N().glowMirror();
      },
    });
  });
  ms.solver("mq12", {
    service() {
      if (Q.get("sq_glow")) {
        L.setFlag("glow_told_delphine");
        if (N().refuseIsotope) N().refuseIsotope();
        else {
          if (!Q.isStarted("sq_glow")) Q.start("sq_glow");
          Q.complete("sq_glow");
        }
      } else Q.setStage("mq12", "book");
    },
    book() {
      ms.kindlingRead("all", "solver");
      if (at("mq12", "book")) Q.setStage("mq12", "keeper");
    },
    keeper() {
      L.setFlag("ms_garden_hint");
      completeMq12();
    },
  });

  // ==================================================================
  // mq13 — NEON HEART (Crowe's riot; sq_neon; the TRACK 61 bulkhead)
  // ==================================================================
  function heardRiot() {
    if (!L.flag("ms_crowe_riot")) {
      L.setFlag("ms_crowe_riot");
      ms.set("crowe_riot");
      L.xp(40, "An eyewitness");
    }
  }
  function toBattery() {
    heardRiot();
    if (at("mq13", "crowe")) Q.setStage("mq13", "battery");
  }
  ms.inject("dlg_neon_crowe", {
    start: () => (at("mq13", "crowe") ? "mq13_crowe" : null),
    nodes: {
      mq13_crowe: {
        speaker: "Mayor Lucius Crowe",
        text: '[You say "the Sixty-One Camp" and the Mayor\'s showman smile goes away entirely. What is left is an old man with a burned face.] Sit down, citizen. Not on the crate; the crate is the treasury.',
        onEnter() {
          L.setFlag("met_crowe");
        },
        responses: [
          {
            text: "Tobias Wren's Register says there was a riot at the Relief Station in '68. Were you there?",
            next: "mq13_riot1",
          },
        ],
      },
      mq13_riot1: {
        text:
          "I was there. Nobody without a card was let below, so we traded at the top of the ramp, by the Relief Station. OCD boys in clean helmets behind a counter, a ration store at the back with a steel door, and a line every morning. " +
          "Medicine for card-holders: enrolled in '67, card in your hand, or back down the stairs you went. [He turns his hat round in his hands.] There was a woman from below who handed out candles. Everybody knew her. That winter her baby got the cough. " +
          "She stood in that line every morning for two weeks with the baby inside her coat, and every morning the lieutenant behind the glass said the same word to her.",
        responses: [{ text: "What happened?", next: "mq13_riot2" }],
      },
      mq13_riot2: {
        text:
          "The fifth of March. A year to the day. Somebody had carried a crate of candles up for the anniversary, and the whole concourse was lit like a birthday. [A long pause.] " +
          "She walked up to that counter with a candle in one hand and a match in the other, and she set light to the paper on it. Then the crate. Then the place went up like a hay barn. People ran for the medicine, people ran for the store, the OCD boys ran for the doors.\n\n" +
          "[He is very quiet.] She came out of the fire with a baby in one arm and her hand on fire. Behind her, eleven kids didn't come out.",
        onEnter() {
          heardRiot();
        },
        responses: [
          { text: "The baby?", next: "mq13_riot3" },
          { text: "[Say nothing.]", next: "mq13_riot3" },
        ],
      },
      mq13_riot3: {
        text:
          "Alive. I heard it crying all the way down the stairs. The robes had her by then, Hollowell's lot, carrying her down the tracks into the dark with the baby still yelling. " +
          "The OCD wrote her up as dead in the morning and welded the lower level shut. Eleven kids in the ration store. Twelve dead, the Continuity says; they count their captain. " +
          "[He puts his hat back on, carefully.] I never once judged her, citizen. I've just never stopped hearing it.",
        responses: [{ text: "Thank you, Mayor.", next: "mq13_pivot" }],
      },
      mq13_pivot: {
        text: () =>
          "[The showman comes back, slowly, like a man getting into a cold coat.] Now. I've a problem of my own, and it's the opposite of fire. " +
          (Q.isComplete("sq_neon")
            ? "Except you've already seen to it, haven't you. The Neon owes you, and the Neon pays its debts, eventually."
            : "The Big Buzz is dying, and there's a spare rig battery down in the 42nd Street tunnels. Glowkeeper robes have been seen down there all week with lanterns, looking for something heavy. I'd like it to be us who finds it."),
        responses: [
          {
            text: "I'll find your battery before they do.",
            cond: () => !Q.isComplete("sq_neon"),
            action: () => toBattery(),
          },
          {
            text: "Glad it worked out, Mayor.",
            cond: () => Q.isComplete("sq_neon"),
            action: () => toBattery(),
          },
        ],
      },
    },
  });
  // Glowkeeper acolytes in the tunnels, after the same battery.
  for (let i = 1; i <= 2; i++) {
    const id = "ms_n13_acolyte" + i;
    ms.actor({
      id,
      removeWhenOff: false,
      when: () =>
        at("mq13", "battery") &&
        !L.has("q_neon_core") &&
        !L.flag("neon_core_resolved") &&
        !!coreSpot(),
      def: () => {
        const c = coreSpot() || { x: -60, z: -228 };
        return {
          type: "human",
          name: "Glowkeeper Acolyte",
          gender: i === 1 ? "m" : "f",
          outfit: "glowkeeper_robes",
          faction: "glowkeepers",
          hostile: !glowFriendly(),
          ai: "guard",
          home: "here",
          homeR: 5,
          level: 6,
          weapon: ["pipe_pistol", "bolt_rifle_32", "knife"],
          at: {
            fallback: {
              x: c.x + (i === 1 ? 3.5 : -3),
              z: c.z + (i === 1 ? 2 : -2.5),
              y: c.y,
            },
            maxR: 6,
          },
          barks: [
            "The Dawn needs it more than the Neon does.",
            "Go back up into the day, topsider.",
            "The Sun does not choose. We do.",
          ],
        };
      },
    });
  }
  // The card one of them carried ("on an acolyte's body"), by the fallen acolyte or by the battery.
  ms.pickup({
    key: "ms_acolyte_card",
    item: "ms_note_acolyte",
    when: () =>
      Q.isStarted("mq13") &&
      (L.isDead("ms_n13_acolyte1") ||
        L.has("q_neon_core") ||
        !!L.flag("neon_core_resolved")) &&
      !!coreSpot(),
    at: {
      get x() {
        return cardPos().x;
      },
      get z() {
        return cardPos().z;
      },
      get y() {
        return cardPos().y;
      },
    },
  });
  function cardPos() {
    const a = L.npc("ms_n13_acolyte1");
    if (a && a.pos) return { x: a.pos.x + 0.6, z: a.pos.z, y: a.pos.y };
    const c = coreSpot() || { x: -60, z: -228, y: 0 };
    return { x: c.x + 1.2, z: c.z + 0.4, y: c.y };
  }
  // The welded TRACK 61 bulkhead (the lair's own bulkhead anchor when src/lair has built it).
  function bulkheadAt() {
    try {
      if (G.lair && G.lair.getAnchor) {
        const a = G.lair.getAnchor("bulkhead");
        if (a && isFinite(a.x))
          return {
            site: "lair",
            anchors: ["bulkhead"],
            fallback: { x: a.x, z: a.z, y: a.y },
            dx: 1.3,
          };
      }
    } catch (e) {
      /* */
    }
    const c = coreSpot();
    return {
      site: "grand_central",
      anchors: ["track61_bulkhead"],
      fallback: c ? { x: c.x + 6, z: c.z - 4, y: c.y } : { x: 254, z: -214 },
    };
  }
  ms.spot({
    id: "ms_spot_bulkhead",
    label: "Welded bulkhead (TRACK 61)",
    verb: "Examine",
    radius: 1.3,
    when: () => Q.isStarted("mq13"),
    get at() {
      return bulkheadAt();
    },
    use() {
      const firstTime = !ms.f("bulkhead_seen");
      ms.set("bulkhead_seen");
      L.notify(
        "A steel bulkhead across the old service passage, welded along every seam, the beads gone brown with rust. Stencilled across it: TRACK 61. NO ADMITTANCE. OCD 1968.\n\n" +
          "Over the stencil, in chalk so fresh it comes off on your fingertip: suns with twelve rays, a dozen of them, and a candle stub melted to the floor in front of each.",
        { duration: 11 },
      );
      if (firstTime) L.xp(30, "TRACK 61");
    },
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq13",
      giver: "Mayor Lucius Crowe",
      location: "The Neon (Times Square); 42nd Street Subway Tunnels",
      desc: () =>
        "Mayor Crowe of the Neon was at the Relief Station Riot in 1968." +
        (L.flag("ms_crowe_riot")
          ? " He saw the Candle Lady strike the match, and come out of the fire with a baby in one arm and her hand on fire; behind her, eleven children didn't come out."
          : "") +
        " The Neon's generator is dying, and the spare rig battery in the 42nd Street tunnels is wanted by the Glowkeepers too. Who ends up holding it will matter.",
      stages: [
        {
          id: "crowe",
          text: "Ask Mayor Crowe in the Neon about the Sixty-One Camp and the 1968 riot.",
          markers: () => [{ npc: "neon_crowe", label: "Mayor Crowe" }],
        },
        ms.proxy("mq13", "sq_neon", {
          id: "battery",
          text: 'Recover "Big Buzz #2" from the 42nd Street tunnels, then decide who gets it: Crowe, the Covenant or the Glowkeepers.',
          next: null,
          reach: {
            site: "times_square",
            anchors: ["mayor", "stage"],
            fallback: TS,
            label: "The Neon",
            r: 15,
          },
          onDone() {
            if (N().neonMirror) N().neonMirror();
          },
        }),
        {
          id: "bulkhead",
          text: "(Optional) Inspect the welded TRACK 61 bulkhead in the tunnels.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq13", "battery"),
          doneIf: () => !!ms.f("bulkhead_seen"),
          markers: spotMark("ms_spot_bulkhead", "TRACK 61 Bulkhead"),
        },
      ],
      rewards: { xp: 400 },
      onComplete() {
        if (N().neonMirror) N().neonMirror();
      },
    });
  });
  ms.solver("mq13", {
    crowe() {
      toBattery();
    },
    battery() {
      if (Q.get("sq_neon") && N().neonResolve) {
        if (!Q.isStarted("sq_neon")) Q.start("sq_neon");
        N().neonResolve("crowe");
      } else Q.complete("mq13");
    },
  });

  // ==================================================================
  // mq14 — JAMMING SEASON (Ruby Kehoe; pmid_q_deadair; the 1968 file; M-61)
  // ==================================================================
  function heardStory() {
    L.setFlag("ms_ruby_story");
    if (at("mq14", "ruby_story")) Q.setStage("mq14", "jammer");
  }
  function freeRuby(loud) {
    if (ms.f("ruby_free")) return;
    ms.set("ruby_free");
    ms.set("waldorf_loud", !!loud);
    if (loud) {
      const p = G.player && G.player.pos;
      if (p) L.factionTruce("continuity", p.x, p.z, 45, true);
      L.notify("Every Continuity boot on the floor is coming your way.", {
        quiet: true,
      });
    } else L.xp(50, "Quietly does it");
    if (at("mq14", "ruby")) Q.setStage("mq14", "file");
  }
  function fileRead() {
    if (!ms.f("file_1968_read")) {
      ms.set("file_1968_read");
      L.setFlag("ms_lumiere_hint");
      L.xp(40, "File 68-0305");
    }
    if (at("mq14", "file")) Q.setStage("mq14", "pass");
  }
  function passTo(kind) {
    if (L.flag("ms_pass_done")) return;
    L.setFlag("ms_pass_done", kind);
    if (kind === "keep" || kind === "buy") {
      if (kind === "buy") L.pay(50);
      ms.token("pass");
      if (!L.has("ms_un_pass")) L.give("ms_un_pass", 1);
    } else {
      if (L.has("ms_un_pass")) L.take("ms_un_pass", 1);
      L.standing(10, "Gave Ruby back her find");
    }
    if (Q.isActive("mq14")) Q.complete("mq14");
    L.later(5, () => {
      L.setFlag("ms_ruby_home");
      ms.pollRoster();
    }); // back to her stall in the Neon (after the conversation)
  }
  G.events.on("itemAdded", (id) => {
    if (id === "ms_note_file_mead_1968") {
      if (!L.has("ms_un_pass") && !L.flag("ms_pass_done"))
        L.give("ms_un_pass", 1);
    }
    if (id === "ms_note_acolyte") L.setFlag("ms_acolyte_card");
  });
  G.events.on("noteRead", (id) => {
    if (
      id === "ms_note_file_mead_1968" &&
      (at("mq14", "file") || Q.isActive("mq14"))
    )
      fileRead();
    if (id === "ms_note_register_61" && at("mq11", "register61")) readPages();
  });
  G.events.on("questFlag", (name, v) => {
    if (name === "pmid_jammer_off" && v) ms.set("waldorf_jammer_down");
  });

  ms.actor({
    id: "ms_thimble",
    when: () => Q.isStarted("mq14"),
    def: {
      type: "human",
      name: "Thimble",
      gender: "f",
      age: 15,
      outfit: "settler",
      hair: "bob",
      faction: "settlers",
      hostile: false,
      essential: true,
      ai: "guard",
      home: "here",
      homeR: 1.5,
      level: 2,
      dialogue: "dlg_ms_thimble",
      at: Object.assign({ maxR: 6 }, P.market),
      barks: [
        "Coats. Mending. No credit.",
        "Ruby'd have that sleeve done by now.",
        "Hold still, I'm measuring the air.",
      ],
    },
  });
  const rubyDef = (where) => ({
    type: "ruby_kehoe",
    preset: "ruby",
    name: "Ruby Kehoe",
    gender: "f",
    age: 62,
    outfit: "settler",
    hair: "bun",
    faction: "settlers",
    hostile: false,
    essential: true,
    ai: "guard",
    home: "here",
    homeR: 1.5,
    level: 4,
    dialogue: "dlg_ms_ruby",
    at: Object.assign({ maxR: 5 }, R(where)),
    barks: [
      "Coats come with all sorts in the linings.",
      "Still winter, whatever the calendar says.",
    ],
  });
  // Held in the Waldorf while mq14 runs (ms_ruby); afterwards at her stall in the Neon market (ms_ruby_market, a second
  // stable id so the saved Waldorf position is never restored onto the market Ruby).
  ms.actor({
    id: "ms_ruby",
    when: () =>
      (Q.isActive("mq14") && Q.reached("mq14", "jammer")) ||
      (Q.isComplete("mq14") && !L.flag("ms_ruby_home")),
    def: () => rubyDef(P.rubyCell),
  });
  ms.actor({
    id: "ms_ruby_market",
    when: () => Q.isComplete("mq14") && !!L.flag("ms_ruby_home"),
    def: () => rubyDef(P.market),
  });
  ms.pickup({
    key: "ms_file_1968",
    item: "ms_note_file_mead_1968",
    when: () => !!ms.f("ruby_free") && Q.isStarted("mq14"),
    at: P.rubyFile,
  });
  ms.spot({
    id: "ms_spot_m61",
    label: "Freight elevator (M-61)",
    verb: "Examine",
    radius: 1.3,
    when: () => Q.isStarted("mq14"),
    get at() {
      return P.m61();
    },
    use() {
      const firstTime = !ms.f("m61_seen");
      ms.set("m61_seen");
      L.notify(
        "A service freight elevator, its doors welded shut along every seam. Stencilled on the lintel: M-61. A brass tag wired to the handle: SEALED BY ORDER — OCD — 10 III 1968.\n\n" +
          "You put your ear to the steel. Far below, so faint it might be your own blood, something hums.",
        { duration: 10 },
      );
      if (firstTime) L.xp(30, "The M-61 shaft");
    },
  });

  ms.dlg("dlg_ms_thimble", "idle")
    .when(() => (at("mq14", "ruby_story") ? "story" : null))
    .add({
      idle: {
        speaker: "Thimble",
        text: () =>
          Q.isComplete("mq14")
            ? "Ruby's back. She's been telling everybody you shot a door for her. [Pause.] Did you shoot a door?"
            : "Coats. Mending. No credit. Ruby's rule, not mine.",
        responses: [{ text: "See you, Thimble." }],
      },
      story: {
        speaker: "Thimble",
        text:
          "[A girl of fifteen or so sits cross-legged in a coat stall, a mouthful of pins, re-lining a sleeve with tent canvas. A hand-lettered sign: KEHOE — COATS — MENDING — NO CREDIT.] " +
          "You're the sleeper. Rocky said you might come. [She spits the pins into her palm.] They took Ruby. Three days ago. The Continuity, from the Waldorf.",
        responses: [
          { text: "Who's Ruby? Why did they take her?", next: "story2" },
        ],
      },
      story2: {
        speaker: "Thimble",
        text:
          "Ruby Kehoe. My boss. Best coat-woman in the Neon; she's been here since before I was born. This winter she was re-lining an old green coat, good wool, and there was a card sewn up inside the lining. A pass from the United Nations, from 1967. Some lady interpreter. " +
          "And Ruby knew the name, because it's on a bill the Continuity nailed up at their checkpoint on Park Avenue years and years ago. WANTED. With a reward. So she took the pass up there to claim it.",
        responses: [{ text: "What name?", next: "story3" }],
      },
      story3: {
        speaker: "Thimble",
        text:
          "Mead. Nicole Mead. [She watches your face change.] ...You knew her. " +
          'Ruby always told it the same way, about that coat. She swapped for it in March of \'68 "from a woman going with the sun people, a baby asleep in a sling. She said the Light would keep them warm." ' +
          "Ruby gave her two blankets and a pair of mittens for it and thought she'd cheated her.",
        responses: [
          { text: "I'll get Ruby out.", action: () => heardStory() },
          { text: "What happened at the Waldorf?", next: "story4" },
        ],
      },
      story4: {
        speaker: "Thimble",
        text: "They didn't pay her. They put her in a room. Rocky says the Continuity's got a jamming thing on the Waldorf roof stepping on his show, too, and he wants it gone. You go up there for one, you might as well do the other.",
        responses: [{ text: "I'll get her out.", action: () => heardStory() }],
      },
    });
  const RUBY = ms.dlg("dlg_ms_ruby", "idle");
  RUBY.when(() => (Q.isActive("mq14") && !ms.f("ruby_free") ? "held" : null));
  RUBY.when(() => (at("mq14", "jammer") ? "wait_jammer" : null));
  RUBY.when(() =>
    atAny("mq14", ["ruby", "file"])
      ? L.has("ms_note_file_mead_1968")
        ? "file_have"
        : "freed"
      : null,
  );
  RUBY.when(() => (at("mq14", "pass") ? "pass" : null));
  RUBY.add({
    idle: {
      speaker: "Ruby Kehoe",
      text: () =>
        Q.isComplete("mq14")
          ? "Ruby Kehoe, coats. You'll want something warmer than that suit, sleeper. It's still winter, whatever the calendar says."
          : "Mm?",
      responses: [{ text: "Take care, Ruby." }],
    },
    held: {
      speaker: "Ruby Kehoe",
      text:
        "[A grey-haired woman in her sixties sits on an upturned bucket in a locked linen room, a tape measure still round her neck. She looks at you through the wire glass in the door.] " +
        "If you're the Continuity, I've told you everything twice. If you're not, you've a funny way of knocking.",
      responses: [
        { text: "Thimble sent me. I'm getting you out.", next: "held2" },
        { text: "Hang on. I'll be back." },
      ],
    },
    held2: {
      speaker: "Ruby Kehoe",
      text: "Thimble. God love her. [She gets up.] The door's locked, the key's on the sergeant's belt, and the sergeant has a temper. How quiet can you be?",
      responses: [
        {
          text: "[Mechanics 35] Pick the lock. Quietly.",
          check: { skill: "mechanics", value: 35 },
          next: "free_quiet",
          failNext: "pick_fail",
        },
        {
          text: "[Stealth 40] Lift the key off the sergeant's belt.",
          check: { skill: "stealth", value: 40 },
          next: "free_quiet",
          failNext: "lift_fail",
        },
        { text: "[Shoot the lock off.]", next: "free_loud" },
        { text: "Hang on. I'll be back." },
      ],
    },
    pick_fail: {
      text: "[The pick snaps off in the lock with a ping that sounds very loud in the corridor.] ...That'll be a no, then.",
      responses: [
        { text: "[Shoot the lock off.]", next: "free_loud" },
        { text: "I'll find another way." },
      ],
    },
    lift_fail: {
      text: "[The sergeant turns round just as your hand gets there. You turn it into a friendly pat on the back. He looks at you like a man who will remember your face.]",
      responses: [
        { text: "[Shoot the lock off.]", next: "free_loud" },
        { text: "I'll find another way." },
      ],
    },
    free_quiet: {
      text: "[The door swings open without a sound.] Not bad for a man with frost in his eyebrows. [She steps out, rubbing her wrists.]",
      onEnter() {
        freeRuby(false);
      },
      responses: [{ text: "Are you hurt?", next: "freed" }],
    },
    free_loud: {
      text: "[Two shots, a great many splinters, and every boot on the floor turns your way.] Well. They know now. [Ruby is already out of the door, tape measure flying.]",
      onEnter() {
        freeRuby(true);
      },
      responses: [{ text: "Move!", next: "freed" }],
    },
    freed: {
      speaker: "Ruby Kehoe",
      text:
        "I've had worse fittings. Listen: they questioned me with a file. A fat old thing, OCD stamps all over it, with my pass clipped to the front. The pass I found. The lieutenant left it on the table by the door when the noise started. " +
        "If you want to know about your Nicole Mead, it's in there. I couldn't read most of it. They wouldn't let me.",
      responses: [{ text: "I'll get it." }],
    },
    wait_jammer: {
      speaker: "Ruby Kehoe",
      text: () =>
        "Go and shut that racket on the roof up first, the thing that hums. I'll keep. Nobody looks for a seamstress in a linen room." +
        (L.has("ms_note_file_mead_1968")
          ? " And read that file while you're at it. I know you're dying to."
          : " And the file they questioned me with is on the table by the door. Take it."),
      responses: [{ text: "Back soon." }],
    },
    file_have: {
      speaker: "Ruby Kehoe",
      text: "You've got it. Read it, then. I'll wait. I've waited in worse places than a hotel.",
      responses: [
        { text: "[Read the file here.]", next: "file_read" },
        { text: "Later." },
      ],
    },
    file_read: {
      speaker: "File 68-0305",
      text: () => {
        const d =
          G.items && G.items.get && G.items.get("ms_note_file_mead_1968");
        return d && d.text
          ? d.text
          : "MEAD, NICOLE: WANTED, arson, 12 dead; child MEAD, ROSE (unenrolled); both PRESUMED DEAD.";
      },
      onEnter() {
        fileRead();
      },
      responses: [{ text: "[Close the folder.]", next: "pass" }],
    },
    pass: {
      speaker: "Ruby Kehoe",
      text: "[Ruby looks at the pass clipped to the front of the folder: the young woman trying not to laugh at the photographer.] That's my reward you're holding. Not that they paid it. ...You knew her. You've got the look.",
      responses: [
        { text: "I'm keeping it. It was hers.", next: "pass_keep" },
        {
          text: "Here's fifty scrip for it. Fair's fair.",
          cond: () => L.scrip() >= 50,
          next: "pass_buy",
        },
        { text: "It's yours. You found it.", next: "pass_ruby" },
      ],
    },
    pass_keep: {
      speaker: "Ruby Kehoe",
      text: '[She shrugs.] Keep it, then. Coats come with all sorts in the linings. ...She was kind to me, you know. In \'68. Baby crying, her hand wrapped up in rags, and she called me "chérie". Nobody has, before or since.',
      onEnter() {
        passTo("keep");
      },
      responses: [{ text: "Get home safe, Ruby." }],
    },
    pass_buy: {
      speaker: "Ruby Kehoe",
      text: "[She folds the scrip into her tape-measure case.] Pleasure. Keep it somewhere dry; paper doesn't last out here. ...She was kind to me, you know. In '68. Called me \"chérie\".",
      onEnter() {
        passTo("buy");
      },
      responses: [{ text: "Get home safe, Ruby." }],
    },
    pass_ruby: {
      speaker: "Ruby Kehoe",
      text: "[She turns the pass over and over in her burned fingers.] I'll sew it back in the coat. Seems right. ...She was kind to me, you know. In '68.",
      onEnter() {
        passTo("ruby");
      },
      responses: [{ text: "Get home safe, Ruby." }],
    },
  });

  L.hook("spawn", function () {
    if (Q.isComplete("mq14") && !L.flag("ms_ruby_home"))
      L.setFlag("ms_ruby_home");
  });
  L.hook("init", function () {
    ms.quest({
      id: "mq14",
      giver: "Rocky / Ruby Kehoe's apprentice",
      location:
        "The Waldorf-Astoria (Continuity forward post); the Neon market",
      desc: () =>
        "The Continuity post in the Waldorf jams Rocky's broadcasts, and it has arrested Ruby Kehoe, a Neon seamstress who tried to claim a reward with Nicole's 1967 UN pass, found in the lining of a green coat." +
        (ms.f("file_1968_read")
          ? " The Continuity's 1968 file: MEAD, NICOLE: WANTED, arson, 12 dead; child MEAD, ROSE (unenrolled); both PRESUMED DEAD."
          : ""),
      stages: [
        {
          id: "ruby_story",
          text: "Hear Ruby Kehoe's story at her coat stall in the Neon market.",
          markers: npcOr("ms_thimble", "Ruby's stall (Thimble)", P.market),
          onEnter() {
            L.later(2, () =>
              L.news(
                "Rocky here, and if I sound like I'm talking through a sock, blame the Waldorf. The Continuity's got something on that roof eating my signal every night. " +
                  "And while I'm complaining: they picked up Ruby Kehoe, the coat lady from the Neon market. Her girl Thimble's asking everybody for help. Somebody help the kid.",
              ),
            );
          },
        },
        ms.proxy("mq14", "pmid_q_deadair", {
          id: "jammer",
          text: "Get into the Waldorf-Astoria and silence the Continuity's jamming array on the roof.",
          next: "ruby",
          reach: {
            site: P.waldorf.site,
            anchors: P.waldorf.anchors,
            fallback: P.waldorf.fallback,
            label: "Waldorf-Astoria",
            r: 14,
          },
          onDone() {
            if (L.flag("pmid_jammer_off") || Q.isComplete("pmid_q_deadair"))
              ms.set("waldorf_jammer_down");
          },
        }),
        {
          id: "ruby",
          text: "Free Ruby Kehoe from the Continuity's holding room in the Waldorf, quietly or loudly.",
          onEnter() {
            L.later(0.3, () => {
              if (ms.f("ruby_free") && at("mq14", "ruby"))
                Q.setStage("mq14", "file");
            });
          },
          markers: npcOr("ms_ruby", "Ruby Kehoe", P.rubyCell),
        },
        {
          id: "file",
          text: () =>
            L.has("ms_note_file_mead_1968")
              ? "Read the Continuity's 1968 file (goggles → NOTES), or read it beside Ruby."
              : "Take the Continuity's 1968 file from the table by Ruby's room.",
          onEnter() {
            L.later(0.3, () => {
              if (ms.f("file_1968_read") && at("mq14", "file"))
                Q.setStage("mq14", "pass");
            });
          },
          markers: () => {
            const pk = L.pickups.ms_file_1968;
            return pk && pk.pos && !L.has("ms_note_file_mead_1968")
              ? [
                  {
                    x: pk.pos.x,
                    z: pk.pos.z,
                    y: pk.pos.y,
                    label: "File 68-0305",
                  },
                ]
              : [{ npc: "ms_ruby", label: "Ruby Kehoe" }];
          },
        },
        {
          id: "pass",
          text: "Talk to Ruby about Nicole's UN pass.",
          markers: () => [{ npc: "ms_ruby", label: "Ruby Kehoe" }],
        },
        {
          id: "m61",
          text: "(Optional) Find the welded M-61 freight elevator in the Waldorf's service core.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq14", "jammer"),
          doneIf: () => !!ms.f("m61_seen"),
          markers: spotMark("ms_spot_m61", "M-61 Freight Elevator"),
        },
      ],
      rewards: { xp: 420, scrip: 80 },
      onComplete() {
        if (L.flag("pmid_jammer_off")) ms.set("waldorf_jammer_down");
      },
    });
  });
  ms.solver("mq14", {
    ruby_story() {
      heardStory();
    },
    jammer() {
      if (Q.get("pmid_q_deadair")) {
        L.setFlag("pmid_jammer_off", true);
        ms.set("waldorf_jammer_down");
        if (!Q.isStarted("pmid_q_deadair")) Q.start("pmid_q_deadair");
        Q.complete("pmid_q_deadair");
      } else Q.setStage("mq14", "ruby");
    },
    ruby() {
      freeRuby(false);
    },
    file() {
      if (!L.has("ms_note_file_mead_1968")) L.give("ms_note_file_mead_1968", 1);
      fileRead();
    },
    pass() {
      passTo("keep");
    },
  });

  // ==================================================================
  // mq15 — SEPT MEANS SEVEN (sq_bureau_sept, 52_french_spies.js)
  // ==================================================================
  L.hook("init", function () {
    ms.quest({
      id: "mq15",
      giver: "Mademoiselle Lys",
      location:
        "Grand Central (the Whistle Stop); Washington Square; Lexington & 47th; Battery Park pier",
      desc: () =>
        "Lys, a French agent posing as a letter-writer at the Whistle Stop, knew Nicole in 1966. She will tell " +
        first() +
        " what she knows if he empties her dead drop and reads the Continuity's signals cabinet. " +
        'Her Bureau\'s question is "who gave the order?"' +
        (L.flag("ms_lumiere_told")
          ? " In the Bureau's files Nicole is a source: LUMIERE. She never knew."
          : "") +
        (ms.f("attribution_on_liberty")
          ? " The sealed attribution file is kept on Liberty Island."
          : ""),
      stages: [
        ms.proxy("mq15", "sq_bureau_sept", {
          id: "bureau",
          text: "Talk to Mademoiselle Lys at the Whistle Stop bar in Grand Central.",
          next: null,
          markers: () => [
            {
              npc: "bs_lys",
              label: "Mademoiselle Lys",
              x: P.lys.fallback.x,
              z: P.lys.fallback.z,
            },
          ],
          onDone() {
            const o = L.flag("bs_outcome");
            if (o && !ms.f("bureau"))
              ms.set(
                "bureau",
                o === "exposed" ? "expose" : o === "left" ? "leave" : "sell",
              );
            if (o === "exposed") ms.set("codebook_on_liberty");
          },
        }),
        {
          id: "lumiere",
          text: "(Optional) Ask Lys how she knew Nicole.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !!L.flag("bs_photo_given") &&
            !L.flag("bs_outcome") &&
            !!L.flag("bs_relay_read"),
          doneIf: () => !!L.flag("ms_lumiere_told"),
          markers: () => [{ npc: "bs_lys", label: "Mademoiselle Lys" }],
        },
      ],
      rewards: { xp: 420 },
    });
  });
  ms.solver("mq15", {
    bureau() {
      if (Q.get("sq_bureau_sept") && G.quests.debug.spies)
        G.quests.debug.spies("sell");
      else if (Q.get("sq_bureau_sept")) {
        if (!Q.isStarted("sq_bureau_sept")) Q.start("sq_bureau_sept");
        Q.complete("sq_bureau_sept");
      } else Q.complete("mq15");
    },
  });

  // ==================================================================
  // mq16 — TEN DAYS IN THE MADHOUSE (pr_tendays, poi_roosevelt)
  // ==================================================================
  function nellMirror() {
    if (!L.flag("ms_nell")) L.setFlag("ms_nell", "broadcast");
    if (L.flag("ms_nell") === "kept" && !ms.hasToken("nell")) ms.token("nell");
  }
  G.events.on("questFlag", (name, v) => {
    if (name === "ms_nell" && v === "kept" && !ms.hasToken("nell"))
      ms.token("nell");
  });
  L.hook("init", function () {
    ms.quest({
      id: "mq16",
      giver: "Old Mac",
      location: "The Octagon, Blackwell's Island; Old Mac's lighthouse",
      desc: () =>
        "Nell Brady, Nicole's roommate, had herself committed to the Octagon asylum on 19 February 1967 to find out what Project Long Winter was, because Nicole was worried about " +
        first() +
        ". " +
        "Her three tape reels are still inside, and Old Mac, the lighthouse keeper on Blackwell's Island, wants them heard." +
        (Q.isComplete("mq16")
          ? L.flag("ms_nell") === "kept"
            ? " " + first() + " kept the reels."
            : " The reels went out over the beacon: the city has heard that someone knew."
          : ""),
      stages: [
        ms.proxy("mq16", "pr_tendays", {
          id: "tapes",
          text: "Find Nell Brady's three tape reels in the Octagon on Blackwell's Island.",
          next: null,
          reach: {
            site: P.octagon.site,
            anchors: P.octagon.anchors,
            fallback: P.octagon.fallback,
            label: "The Octagon",
            r: 18,
          },
          onEnter() {
            L.later(2, () =>
              L.news(
                "Message for the sleeper from Old Mac, the lighthouse fella out on Blackwell's Island. Says a reporter named Nell Brady hid three tape reels in the old Octagon asylum back in '67, " +
                  "and that Nell roomed on Tudor Place with a girl from the UN. Says you'd want to know. Says bring a flashlight. Says the Superintendent glows.",
              ),
            );
          },
          onDone: nellMirror,
        }),
      ],
      rewards: { xp: 420 },
      onComplete() {
        nellMirror();
        L.later(1.5, () =>
          L.notify(
            '"Nicky, if you hear this, get out of the city." She didn\'t. She went to Grand Central, and down.',
            { duration: 7 },
          ),
        );
      },
    });
  });
  ms.solver("mq16", {
    tapes() {
      if (Q.get("pr_tendays")) {
        if (!L.flag("ms_nell")) L.setFlag("ms_nell", "broadcast");
        if (!Q.isStarted("pr_tendays")) Q.start("pr_tendays");
        Q.complete("pr_tendays");
      } else {
        nellMirror();
        Q.complete("mq16");
      }
    },
  });

  // ==================================================================
  // mq17 — THE DAWN HOUR
  // ==================================================================
  const inWindow = () => {
    const h = G.time && G.time.hour;
    return typeof h === "number" && h >= 5.7 && h < 6.75;
  };
  const clock = () => {
    if (G.atmos && G.atmos.clockString) {
      try {
        return G.atmos.clockString();
      } catch (e) {
        /* */
      }
    }
    const h = (G.time && G.time.hour) || 0,
      hh = Math.floor(h),
      mm = Math.floor((h - hh) * 60);
    return hh + ":" + (mm < 10 ? "0" : "") + mm;
  };
  /** Wait on Rocky's couch until 05:47 (in-world clock). */
  function waitDawn() {
    L.overlay("#000000", 0.5, 0.8, 1.2, 0.95);
    const T = G.time;
    if (!T) return;
    if (G.atmos && G.atmos.setHour) {
      try {
        G.atmos.setHour(5.79, { advanceDay: true });
        return;
      } catch (e) {
        /* */
      }
    }
    if (T.hour > 5.79) T.day = (T.day || 1) + 1;
    T.hour = 5.79;
  }
  function nearRocky() {
    const a = L.npc("rc_rocky");
    if (a && a.pos && !a.dead)
      return { fallback: { x: a.pos.x + 2.2, z: a.pos.z + 1.4, y: a.pos.y } };
    return {
      site: P.radio.site,
      anchors: P.radio.anchors,
      fallback: P.radio.fallback,
    };
  }
  function buildFinder(src) {
    if (src === "coil") L.take("ms_neon_coil", 1);
    if (!L.has("ms_direction_finder")) L.give("ms_direction_finder", 1);
    if (!ms.f("finder_built")) {
      ms.set("finder_built", src || true);
      L.xp(
        40,
        src === "skill" ? "Electronics: Sugar Ray" : "The direction-finder",
      );
    }
    if (at("mq17", "finder")) Q.setStage("mq17", "bearings");
  }
  function sermonDone() {
    L.setFlag("ms_rose_mouthed");
    ms.set("dawn_bearing");
    if (at("mq17", "bearings")) Q.setStage("mq17", "relay");
  }
  function relayFound() {
    L.setFlag("ms_relay_found");
    if (at("mq17", "relay")) Q.setStage("mq17", "cable");
  }
  function cableFound() {
    L.setFlag("ms_cable_followed");
    if (at("mq17", "cable")) Q.setStage("mq17", "choice");
  }
  function relayChoice(kind) {
    if (ms.f("dawn_relay")) return;
    ms.set("dawn_relay", kind);
    if (kind === "replied") {
      ms.set("eli_replied");
      ms.token("voice");
      if (ms.f("waldorf_jammer_down") || L.skill("electronics") >= 50) {
        ms.set("voice_reached");
        L.news(
          "Funny thing on the dial last night, folks. The Dawn Hour's carrier came up at two in the morning all by itself, played eleven seconds of a man's voice, and went off again. Nobody up here sent it. Somebody down there played it back.",
        );
      }
    } else if (kind === "cut") {
      ms.set("dawn_relay_cut");
      ms.set("glow_wary");
      L.setFlag("ms_glow_wary");
      L.later(4, () =>
        L.news(
          "Quiet morning, folks. For the first time since 1979 there was no Dawn Hour at five forty-seven. Rocky slept in. Rocky doesn't know how to feel about that.",
        ),
      );
    } else ms.set("dawn_relay_left");
    if (Q.isActive("mq17")) Q.complete("mq17");
  }

  ms.inject("dlg_rc_rocky", {
    start: () =>
      at("mq17", "rocky")
        ? "mq17_job"
        : at("mq17", "finder")
          ? "mq17_finder"
          : at("mq17", "bearings")
            ? "mq17_bear"
            : atAny("mq17", ["relay", "cable", "choice"])
              ? "mq17_status"
              : null,
    nodes: {
      mq17_job: {
        speaker: '"Rocky" Delgado',
        text:
          "Popsicle. Sit. [He has a city map pinned over the sound board with three pencil lines on it that don't meet.] Every morning since 1979, five forty-seven on the dot, the Dawn Hour steps right on top of me. " +
          "Ten years I've been trying to find where she's coming from and ten years I get static and scripture. After that letter they sent you? I want to know. I think you want to know more.",
        responses: [{ text: "How do we find her?", next: "mq17_job2" }],
      },
      mq17_job2: {
        text:
          "Direction-finder. A loop antenna you turn till the signal goes quiet; the quiet points at her. Two of those from two places, and where the lines cross, that's your church. I've got the headset and the compass. I need the loop. " +
          "You good with a soldering iron, pal? If not, Crowe in the Neon has crates of sign transformers. Wind one of those right and it'll hear a mouse in Jersey.",
        onEnter() {
          if (at("mq17", "rocky")) Q.setStage("mq17", "finder");
        },
        responses: [
          {
            text: "[Electronics 30] Hand me the iron.",
            check: { skill: "electronics", value: 30 },
            next: "mq17_built",
            failNext: "mq17_burnt",
          },
          {
            text: "I brought one of Crowe's transformers.",
            cond: () => L.has("ms_neon_coil"),
            next: "mq17_coil_built",
          },
          { text: "I'll get a transformer from the Neon." },
        ],
      },
      mq17_finder: {
        speaker: '"Rocky" Delgado',
        text: "How's my loop coming, Popsicle?",
        responses: [
          {
            text: "[Electronics 30] Let me build it here.",
            check: { skill: "electronics", value: 30 },
            next: "mq17_built",
            failNext: "mq17_burnt",
          },
          {
            text: "I brought one of Crowe's transformers.",
            cond: () => L.has("ms_neon_coil"),
            next: "mq17_coil_built",
          },
          { text: "Still working on it." },
        ],
      },
      mq17_built: {
        text: "[An hour, a burnt thumb and a broom handle later, the loop turns smooth on its pivot and the headset hisses like the sea.] Look at that. Look at THAT. I'm calling her Sugar Ray. She points at whoever's doing the talking.",
        onEnter() {
          buildFinder("skill");
        },
        responses: [{ text: "Now what?", next: "mq17_bear" }],
      },
      mq17_coil_built: {
        text: "[Rocky unwraps Crowe's transformer like a Christmas present, strips the windings and coils them round a bicycle wheel.] Mayor's good for something after all. There. Sugar Ray. She points at whoever's doing the talking.",
        onEnter() {
          buildFinder("coil");
        },
        responses: [{ text: "Now what?", next: "mq17_bear" }],
      },
      mq17_burnt: {
        text: "[The iron slips. Something on the board goes pop, and the room smells of hot rosin and regret.] Okay. Okay! Nobody's hurt. Get me one of Crowe's transformers from the Neon, pal, and let the professionals hold the hot end.",
        responses: [{ text: "I'll get a transformer." }],
      },
      mq17_bear: {
        speaker: '"Rocky" Delgado',
        text: () =>
          inWindow()
            ? "She's on. Five forty-seven, right on time. Grab the loop. Jory's on the Chrysler roof with the spare set and a walkie-talkie, ready to take the second line."
            : "Now we wait. She's on at five forty-seven and not a minute before. It's " +
              clock() +
              ". Jory's going up the Chrysler with the spare set for the second line. Couch is there. It's clean. It's cleaner than it looks.",
        responses: [
          {
            text: "[Swing the loop and listen.]",
            cond: inWindow,
            next: "mq17_tune1",
          },
          {
            text: "[Wait on Rocky's couch until 05:47.]",
            cond: () => !inWindow(),
            action: () => waitDawn(),
            next: "mq17_tune1",
          },
          { text: "I'll come back before dawn." },
        ],
      },
      mq17_tune1: {
        speaker: "THE DAWN HOUR (radio)",
        text:
          "[The headset fills with a woman's voice, low and careful, wrapped in so much echo it could be coming from the bottom of a well.]\n\n" +
          '"Good morning, children. It is five forty-seven. The list has returned, and the Sun has been patient with us for one more night. Let me tell you about the sleeper."',
        responses: [
          { text: "[Turn the loop slowly. Listen.]", next: "mq17_tune2" },
        ],
      },
      mq17_tune2: {
        speaker: "THE DAWN HOUR (radio)",
        text: '"Wake me when it\'s spring, the sleeper said. And the Dawn said: I will keep the light on."',
        responses: [{ text: "[...]", next: "mq17_rocky" }],
      },
      mq17_rocky: {
        speaker: '"Rocky" Delgado',
        text: "[Rocky has stopped writing. He looks at you over the top of the headset.] Funny. That's your line, Popsicle.",
        responses: [{ text: "[Look at Flint.]", next: "mq17_flint" }],
      },
      mq17_flint: {
        speaker: " ",
        text: () =>
          '[Flint is sitting on Rocky\'s tube crate with a socket wrench forgotten in her hand. Her lips are moving, half a beat ahead of the radio: "...and the light was kept, every February, for the one who slept." ' +
          "Then the voice in the headset says it, word for word. Flint sees you watching. She shuts her mouth, finds something urgent to do with the tube rack, and does not look up again.]",
        onEnter() {
          L.setFlag("ms_rose_mouthed");
        },
        responses: [{ text: "[Take the bearing.]", next: "mq17_fix" }],
      },
      mq17_fix: {
        speaker: '"Rocky" Delgado',
        text:
          '[Rocky swings the loop until the voice drops to a whisper.] Null at zero-nine-seven. [The walkie-talkie crackles: "Chrysler, two-one-four, Jory out."] Two-one-four from the Chrysler... ' +
          "[He draws two lines on the map. They cross on Forty-Second Street, a block from the river side of Grand Central.] First Journal Building. The globe. She's not broadcasting from there, Popsicle: that's a relay. Something feeds it. Go see what.",
        onEnter() {
          sermonDone();
        },
        responses: [{ text: "On my way." }],
      },
      mq17_status: {
        speaker: '"Rocky" Delgado',
        text: () =>
          at("mq17", "relay")
            ? "First Journal Building, Popsicle. The globe room. Mind the robes."
            : at("mq17", "cable")
              ? "A cable? Going where? Follow it, pal. Rocky needs an ending."
              : "Your call, pal. Cut it, leave it, or say something into it. I'd know what I'd say. I just don't know if I'd want it heard.",
        responses: [{ text: "Right." }],
      },
    },
  });
  ms.inject("dlg_neon_crowe", {
    start: () =>
      at("mq17", "finder") &&
      !L.has("ms_neon_coil") &&
      !ms.f("finder_built") &&
      !L.flag("ms_coil_given")
        ? "mq17_coil"
        : null,
    nodes: {
      mq17_coil: {
        speaker: "Mayor Lucius Crowe",
        text:
          "A sign transformer? For a radio direction-finder? To find the Dawn Hour? [He is already rummaging in a crate behind the stage.] Citizen, every morning at five forty-seven that woman tells my people the Sun does not choose. " +
          "My people were chosen, in March of '67, by a sunrise over Yonkers. [He hands you a heavy coil wrapped in sacking.] Take it. Take two. Tell Rocky the Neon sends its regards and wants a request played.",
        onEnter() {
          L.setFlag("ms_coil_given");
          if (!L.has("ms_neon_coil")) L.give("ms_neon_coil", 1);
        },
        responses: [{ text: "Thanks, Mayor." }],
      },
    },
  });

  // The relay in the First Journal globe room: acolytes and Brother Taper.
  for (let i = 1; i <= 2; i++) {
    ms.actor({
      id: "ms_n17_acolyte" + i,
      removeWhenOff: false,
      when: () => atAny("mq17", ["relay", "cable"]),
      def: () => ({
        type: "human",
        name: "Glowkeeper Acolyte",
        gender: i === 1 ? "f" : "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: !glowFriendly(),
        ai: "guard",
        home: "here",
        homeR: 4,
        level: 7,
        weapon: ["bolt_rifle_32", "pipe_pistol", "knife"],
        at: P.relayGuard(i - 1),
        barks: [
          "The Dawn is speaking. Be quiet.",
          "This is a holy wire, stranger.",
          "Keep the light on.",
        ],
      }),
    });
  }
  ms.actor({
    id: "ms_taper_relay",
    when: () => atAny("mq17", ["relay", "cable", "choice"]),
    def: () => ({
      type: "human",
      preset: "taper",
      name: "Brother Taper",
      gender: "m",
      age: 50,
      outfit: "glowkeeper_robes",
      faction: "glowkeepers",
      hostile: false,
      essential: true,
      ai: "guard",
      home: "here",
      homeR: 2,
      level: 8,
      dialogue: "dlg_ms_taper_relay",
      at: Object.assign({ maxR: 6 }, P.relay),
      barks: [
        "Mind the wire, sleeper.",
        "She'll be on again at five forty-seven. She always is.",
      ],
    }),
  });
  ms.dlg("dlg_ms_taper_relay", "hello").add({
    hello: {
      speaker: "Brother Taper",
      text: () =>
        L.flag("ms_taper_relay_met")
          ? "Still here, sleeper. So is the wire."
          : "[A broad man in grey robes, a lantern at his feet though the room has daylight, sits beside a car battery and a tape deck with a microphone hung on a coat hanger. You know him: the robe with the lantern on Chambers Street, the morning you woke.] " +
            "You found our little candle on the air. Brother Taper. [He doesn't get up.] I am a messenger, sleeper, not a guard. The guards are the ones with the pipes.",
      onEnter() {
        L.setFlag("ms_taper_relay_met");
      },
      responses: [
        { text: "Where does the Dawn Hour come from?", next: "wire" },
        { text: "You were watching me on Chambers Street.", next: "chambers" },
        { text: "Tell the Dawn I'm looking for Nicole Mead.", next: "name" },
        { text: "Goodbye, Brother." },
      ],
    },
    wire: {
      text: "Down. [He points at the floor, where a lead-sheathed cable drops through a hole cut in the parquet.] She speaks below, the wire carries her up, the globe sends her out. Follow it if you like. It goes where the light is kept.",
      onEnter() {
        relayFound();
      },
      responses: [{ text: "I will." }],
    },
    chambers: {
      text: "Somebody had to. I was asked to see that you came out of that door all right, and you did. [He smiles.] A girl with a rifle disagreed with me about the watching. I used to carry a little girl on my shoulders, down below, a long time ago. Little Sun, we called her. She'd be grown now.",
      responses: [{ text: "Where does the wire go?", next: "wire" }],
    },
    name: {
      text: "We don't keep the old names, sleeper. [He picks up his lantern and looks at it.] But I'll tell her a sleeper asked. She will know which one.",
      responses: [{ text: "Where does the wire go?", next: "wire" }],
    },
  });
  ms.spot({
    id: "ms_spot_relay",
    radius: 1.2,
    at: P.relaySpot,
    verb: () => (at("mq17", "choice") ? "Decide" : "Examine"),
    label: () =>
      at("mq17", "choice")
        ? "The Dawn Hour relay (decide)"
        : "The Dawn Hour relay",
    when: () => atAny("mq17", ["relay", "cable", "choice"]),
    use() {
      if (at("mq17", "choice")) {
        ms.talk("dlg_ms_relay", "The Dawn Hour Relay");
        return;
      }
      if (at("mq17", "relay")) {
        L.notify(
          "Under the great dusty globe: a car battery, a reel-to-reel deck, a microphone hung from a coat hanger, and a lead-sheathed cable that drops through a hole in the floor and away down the stairwell, east under 42nd Street. Every morning the Dawn Hour comes up this wire and goes out from the old mast on the roof.",
          { duration: 10 },
        );
        relayFound();
        return;
      }
      L.notify(
        "The cable runs down the stairwell and out under the street. Follow it.",
      );
    },
  });
  ms.spot({
    id: "ms_spot_cable_grate",
    radius: 1.4,
    at: P.grate,
    label: "Storm grate (the cable)",
    verb: "Look down",
    when: () => at("mq17", "cable"),
    use() {
      L.notify(
        "The cable surfaces in a gutter on 42nd Street and goes down again through a storm grate, west, toward Grand Central. Warm air breathes up through the bars, and with it a smell you know from the cathedral: candle wax, a great deal of it. " +
          "Somewhere below, under the Terminal, the wire goes where the light is kept.",
        { duration: 10 },
      );
      cableFound();
    },
  });
  ms.dlg("dlg_ms_relay", "choose").add({
    choose: {
      text: "[The relay hums. The reel-to-reel has a RECORD key, and the wire goes down into the dark under 42nd Street. Whatever you put on this tape tonight goes down that wire before five forty-seven.]",
      responses: [
        { text: "[Record a reply.]", next: "reply" },
        { text: "[Cut the cable.]", next: "cut" },
        { text: "[Leave it be.]", next: "leave" },
        { text: "[Not yet.]" },
      ],
    },
    reply: {
      text: () =>
        "[You press RECORD. The tape hiss fills the little room. You have had twenty-two years and two weeks to think of something, and in the end you say what is true.]\n\n\"Nicky. It's " +
        first() +
        ". I'm awake.\"\n\n[You stop the tape. Your hand is shaking a little.]",
      responses: [
        {
          text: "[Let it go down the wire.]",
          action: () => relayChoice("replied"),
          next: "reply_out",
        },
      ],
    },
    reply_out: {
      text: () =>
        ms.f("voice_reached")
          ? (ms.f("waldorf_jammer_down")
              ? "[With the Waldorf jammer dead, the line is clean all the way down. "
              : "[The jam still gnaws at the carrier, but you know this kind of rig: you tune the playback under the noise. ") +
            "The needle on the line meter kicks, twice, the way a line kicks when somebody at the far end lifts a receiver. Then nothing.]"
          : "[The Waldorf's jammer chews the carrier into static. Whatever went down the wire went down in pieces. Maybe some of it got through. Maybe none.]",
      responses: [{ text: "[Step back from the relay.]" }],
    },
    cut: {
      text: "[You take the cable in both hands and cut it with Taper's own fire axe from the wall bracket. The lead sheath parts with a sound like a bone. The hum stops. Somewhere below, somebody is about to find out.]",
      onEnter() {
        relayChoice("cut");
      },
      responses: [{ text: "[Step back.]" }],
    },
    leave: {
      text: "[You leave the relay humming. Tomorrow, at five forty-seven, she will speak again, and you will know where the wire goes.]",
      onEnter() {
        relayChoice("left");
      },
      responses: [{ text: "[Step back.]" }],
    },
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq17",
      giver: '"Rocky" Delgado',
      location: "Radio City; the Chrysler roof; the First Journal Building",
      desc: () =>
        "Every morning at 05:47 the Glowkeepers' pirate Dawn Hour steps on Rocky's signal. " +
        first() +
        " and Rocky set out to trace it." +
        (ms.f("dawn_bearing")
          ? " The sermon used " +
            first() +
            "'s own words: \"Wake me when it's spring.\" The bearings cross at the First Journal Building."
          : "") +
        (L.flag("ms_cable_followed")
          ? " The relay there is fed by a cable that runs under 42nd Street toward Grand Central."
          : ""),
      stages: [
        {
          id: "rocky",
          text: "Talk to Rocky at Radio City about the Dawn Hour.",
          markers: () => [{ npc: "rc_rocky", label: '"Rocky" Delgado' }],
        },
        {
          id: "finder",
          text: () =>
            "Build a direction-finder with Rocky (Electronics 30), or bring him a sign transformer from Mayor Crowe in the Neon." +
            (L.has("ms_neon_coil") ? " You have the transformer." : ""),
          onEnter() {
            ms.rose.place("at", nearRocky());
          },
          markers: () =>
            [{ npc: "rc_rocky", label: '"Rocky" Delgado' }].concat(
              L.has("ms_neon_coil") || L.skill("electronics") >= 30
                ? []
                : [{ npc: "neon_crowe", label: "Mayor Crowe (transformer)" }],
            ),
        },
        {
          id: "bearings",
          text: () =>
            "Take a bearing on the Dawn Hour with Rocky when it airs at 05:47 (it is " +
            clock() +
            ").",
          onEnter() {
            if (ms.rose.mode() !== "at") ms.rose.place("at", nearRocky());
          },
          markers: () => [{ npc: "rc_rocky", label: '"Rocky" Delgado' }],
        },
        {
          id: "relay",
          text: "Find the relay in the First Journal Building's globe room.",
          markers: () =>
            L.alive("ms_taper_relay")
              ? [{ npc: "ms_taper_relay", label: "The Dawn Hour relay" }]
              : markAt(P.relay, "The Dawn Hour relay")(),
        },
        {
          id: "cable",
          text: "Follow the relay's cable under 42nd Street to where it goes down toward Grand Central.",
          markers: spotMark("ms_spot_cable_grate", "The cable (storm grate)"),
        },
        {
          id: "choice",
          text: "Decide the relay's fate: record a reply to Nicole, cut it, or leave it.",
          markers: spotMark("ms_spot_relay", "The Dawn Hour relay"),
        },
      ],
      rewards: { xp: 450 },
      onComplete() {
        ms.rose.place("home");
      },
    });
  });
  ms.solver("mq17", {
    rocky() {
      Q.setStage("mq17", "finder");
    },
    finder() {
      buildFinder("skill");
    },
    bearings() {
      sermonDone();
    },
    relay() {
      relayFound();
    },
    cable() {
      cableFound();
    },
    choice() {
      relayChoice("replied");
    },
  });

  // ==================================================================
  // mq18 — THE STONE AND THE GIRL
  // ==================================================================
  function startWalk() {
    ms.rose.place("follow");
    if (at("mq18", "flint")) Q.setStage("mq18", "garden");
  }
  function arriveGarden() {
    if (!at("mq18", "garden")) return;
    Q.setStage("mq18", "stone");
    L.later(0.8, () =>
      ms.rose.say("Third row from the wall. The one with the sun on it."),
    );
  }
  function readStone() {
    L.setFlag("ms_stone_read");
    if (at("mq18", "stone")) Q.setStage("mq18", "confront");
  }
  function reveal() {
    if (!L.flag("ms_rose_revealed")) {
      ms.set("rose_revealed");
      L.xp(100, "Rose");
    }
    ms.rose.apply();
  }
  function digGrave() {
    if (ms.f("stone_dug")) return;
    ms.set("stone_dug");
    ms.set("glow_wary");
    L.setFlag("ms_glow_wary");
    ms.set("eli_doubts");
    L.standing(-20, "Dug up a Kindling stone");
    L.later(2, () =>
      L.notify(
        "Two acolytes on the cathedral steps have stopped sweeping. They are watching you, and they do not look away.",
        { duration: 6 },
      ),
    );
  }
  function heardOut() {
    L.setFlag("ms_rose_heard_out");
    ms.set("knows_second_sun");
    if (!at("mq18", "roof")) return;
    if (hasRing()) Q.setStage("mq18", "ring");
    else Q.complete("mq18");
  }
  function ringTo(kind) {
    if (ms.f("ring")) return;
    ms.set("ring", kind);
    if (kind === "rose") {
      ms.set("ring_to_rose");
      ms.addTrust(2, "You gave her the ring");
    }
    if (kind === "stone") ms.set("ring_on_stone");
    if (kind !== "kept") {
      for (const id of ["ms_ring", "ms_grandmother_ring"])
        if (L.has(id)) L.take(id, 1);
    }
    if (Q.isActive("mq18")) Q.complete("mq18");
  }
  function nearRoof() {
    const p = ms.resolve(ms.rose.HOME);
    if (!p || !G.player) return false;
    const P0 = G.player.pos;
    if (Math.hypot(P0.x - p.x, P0.z - p.z) > 28) return false;
    return !p.anchored || P0.y > (p.y || 0) - 5;
  }
  L.trigger({
    id: "ms_mq18_garden",
    once: false,
    cooldown: 2,
    r: 12,
    pos: () => ms.resolve(P.garden),
    cond: () => at("mq18", "garden"),
    fire() {
      arriveGarden();
    },
  });

  ms.spot({
    id: "ms_spot_kindling_stone",
    label: "Kindling stone",
    verb: "Read",
    radius: 1.2,
    at: P.stone,
    when: () => Q.reached("mq18", "garden") || Q.isComplete("mq18"),
    use() {
      ms.talk("dlg_ms_stone", "Kindling Stone");
    },
  });
  ms.dlg("dlg_ms_stone", "read").add({
    read: {
      text: () =>
        "[A garden gone to seed inside the cathedral railings: rows of flat grey stones set in the grass, a hundred of them, more, each cut with the same twelve-rayed sun and a name. Under the sun on this one:]\n\n" +
        "NICOLE MEAD\nKINDLED 5 III 1968\n\n" +
        (revealed()
          ? "[Rose stands a little way off and does not look at it.]"
          : '[Behind you, very quietly, Flint says: "That\'s her."]'),
      onEnter() {
        readStone();
      },
      responses: [
        {
          text: "[Senses 6] Look at the ground around the stone.",
          check: { attr: "senses", value: 6 },
          next: "ground",
          failNext: "ground_fail",
          cond: () => !ms.f("stone_undug") && !L.flag("ms_stone_ground_failed"),
        },
        { text: "[Kneel by the stone.]", next: "kneel" },
        {
          text: "[Lay the ring on the stone.]",
          cond: () => at("mq18", "ring") && hasRing(),
          next: "ring_laid",
        },
        {
          text: "[Dig up the grave.]",
          cond: () => Q.reached("mq18", "confront") && !ms.f("stone_dug"),
          next: "dig",
        },
        { text: "[Step back.]" },
      ],
    },
    ground: {
      text: () =>
        "[You crouch. The grass over the plot is old and unbroken, matted with twenty years of roots, and the stone's edge is furred with moss right down into the sod. Nobody has ever cut this turf. Nobody was ever put under it.]" +
        (L.flag("ms_book_rule") || ms.f("book_read")
          ? "\n\n[The Rule of the Kindling: the old name is laid beneath a stone. A name. Not a woman.]"
          : "\n\n[A stone with nothing under it, like a signpost.]"),
      onEnter() {
        ms.set("stone_undug");
        L.xp(40, "Senses: the unbroken ground");
      },
      responses: [{ text: "[Stand up.]" }],
    },
    ground_fail: {
      text: "[Grass, moss, a stone. A grave like a hundred others in this city. You don't know what you expected.]",
      onEnter() {
        L.setFlag("ms_stone_ground_failed");
      },
      responses: [{ text: "[Stand up.]" }],
    },
    kneel: {
      text: "[You kneel. The granite is cold through your knee. You think about a girl laughing in the far corner of the Whispering Gallery, and about Sunday, and about spring.]",
      responses: [{ text: "[Stand up.]" }],
    },
    ring_laid: {
      text: "[You set your grandmother's ring on the stone, in the middle of the sun. It looks very small there. You leave it.]",
      onEnter() {
        ringTo("stone");
      },
      responses: [{ text: "[Step back.]" }],
    },
    dig: {
      text: () =>
        "[You pull up the sod with your hands and a bent trowel from the gardener's bucket. Under the turf the earth is packed hard and has never been turned. A hand's depth down: a flat tobacco tin. Inside it, a stub of candle, and a slip of paper with two words in a careful hand: NICOLE MEAD.]\n\n" +
        "[No box. No bones. A name, buried like a seed.]\n\n" +
        (revealed()
          ? "[Rose, behind you, flat:] Leave it. She's dead to me."
          : "[Flint, behind you, flat:] Leave it. She's dead to me."),
      onEnter() {
        digGrave();
      },
      responses: [{ text: "[Put the tin back. Press the sod down.]" }],
    },
  });

  // Rose's beats (dlg_ms_rose): mq18 first, then the Act II one-offs (each says its piece once).
  const RD = ms.dlg("dlg_ms_rose");
  RD.when(() =>
    at("mq18", "flint")
      ? "mq18_start"
      : at("mq18", "garden")
        ? "mq18_walk"
        : at("mq18", "stone")
          ? "mq18_atstone"
          : at("mq18", "confront")
            ? "mq18_confront"
            : at("mq18", "roof")
              ? nearRoof()
                ? "mq18_roof"
                : "mq18_roof_wait"
              : at("mq18", "ring")
                ? "mq18_ring"
                : null,
  );
  RD.when(() =>
    at("mq17", "finder") || at("mq17", "bearings")
      ? L.flag("ms_rose_mq17_rc")
        ? null
        : "mq17_rc"
      : null,
  );
  RD.when(() =>
    Q.isActive("mq17") &&
    L.flag("ms_rose_mouthed") &&
    !L.flag("ms_rose_mq17_after")
      ? "mq17_after"
      : null,
  );
  RD.when(() =>
    !revealed() &&
    L.flag("ms_glow") === "planted" &&
    Q.isStarted("mq13") &&
    !L.flag("ms_rose_said_planted")
      ? "mq13_planted"
      : null,
  );
  RD.when(() =>
    !revealed() &&
    (L.flag("ms_glow") === "warned" || L.flag("ms_glow") === "convinced") &&
    Q.isStarted("mq13") &&
    !L.flag("ms_rose_said_glow")
      ? "mq13_glow"
      : null,
  );
  RD.when(() =>
    !revealed() && L.flag("ms_crowe_riot") && !L.flag("ms_rose_said_riot")
      ? "mq13_riot"
      : null,
  );
  RD.when(() =>
    !revealed() &&
    ms.f("waldorf_jammer_down") &&
    Q.isStarted("mq14") &&
    !L.flag("ms_rose_said_jam")
      ? "mq14_jam"
      : null,
  );
  RD.when(() =>
    !revealed() && L.flag("ms_lys_chin") && !L.flag("ms_rose_said_chin")
      ? "mq15_chin"
      : null,
  );
  RD.when(() =>
    !revealed() && Q.isComplete("mq16") && !L.flag("ms_rose_said_nell")
      ? "mq16_nell"
      : null,
  );
  RD.add({
    // ---- one-offs (Act II) ----
    mq13_planted: {
      speaker: () => ms.roseName(),
      text: "[She doesn't get up.] Grand Central's taps glow. Okafor's got kids drinking river water out of buckets. [She looks at you, finally.] You're one of them.",
      onEnter() {
        L.setFlag("ms_rose_said_planted");
      },
      responses: [
        { text: "It's not what you think.", next: "mq13_planted2" },
        { text: "[Say nothing.]" },
      ],
    },
    mq13_planted2: {
      text: "It never is. [She goes back to cleaning her rifle.]",
      responses: [{ text: "[Leave her be.]" }],
    },
    mq13_glow: {
      speaker: () => ms.roseName(),
      text: () =>
        L.flag("ms_glow") === "convinced"
          ? "Heard the Keeper sent his lead box back down the stairs. Heard somebody talked him into it. [She almost smiles.] Hollowell doesn't change his mind. He must have liked you."
          : "Okafor's got two guards on her water tower and a third one guarding the guards. Word is a sleeper told her. [A shrug.] ...Okay. That was okay.",
      onEnter() {
        L.setFlag("ms_rose_said_glow");
      },
      responses: [{ text: "Thanks, Flint." }],
    },
    mq13_riot: {
      speaker: () => ms.roseName(),
      text:
        "[You tell her what Crowe told you: the line at the Relief Station, the match, eleven children. She checks the bolt of her rifle for much longer than a bolt needs checking.] " +
        "Everybody under Grand Central has a riot story. Mine's short. I was too young to have one.",
      onEnter() {
        L.setFlag("ms_rose_said_riot");
      },
      responses: [{ text: "[Let it go.]" }],
    },
    mq14_jam: {
      speaker: () => ms.roseName(),
      text: "Rocky's tubes stopped cooking. I've been swapping them every week since the Waldorf put that thing on the roof. [She looks at you sideways.] That you? ...Thanks. Don't tell him I said thanks; he'll want a hug.",
      onEnter() {
        L.setFlag("ms_rose_said_jam");
      },
      responses: [{ text: "Your secret's safe." }],
    },
    mq15_chin: {
      speaker: () => ms.roseName(),
      text:
        "[You tell her Lys said to ask whose chin she has. Her hand goes to her chin before she can stop it.] " +
        "Lys says a lot of things for five scrip a page. [She turns to the sign and starts checking connections that don't need checking.] She's French. They think everything's a love story.",
      onEnter() {
        L.setFlag("ms_rose_said_chin");
      },
      responses: [{ text: "[Let it go. For now.]" }],
    },
    mq16_nell: {
      speaker: () => ms.roseName(),
      text: "[You ask whether the name Nell Brady means anything to her.] Never heard of her. [Too fast. She hears it too, and doesn't fix it.]",
      onEnter() {
        L.setFlag("ms_rose_said_nell");
      },
      responses: [{ text: "[Let it go.]" }],
    },
    // ---- mq17 ----
    mq17_rc: {
      speaker: () => ms.roseName(),
      text:
        "[Flint is elbow-deep in the back of Rocky's transmitter, swapping tubes.] Don't look at me like that. I run his tubes. He pays in batteries and bad jokes. " +
        "...You're taking a bearing on the Dawn Hour. [A pause that goes on a little too long.] Five forty-seven. Don't be late. She never is.",
      onEnter() {
        L.setFlag("ms_rose_mq17_rc");
      },
      responses: [
        { text: "You listen to it?", next: "mq17_rc2" },
        { text: "See you at five forty-seven." },
      ],
    },
    mq17_rc2: {
      text: "I wake up for it. Every morning. Can't help it. It's like a dripping tap.",
      responses: [{ text: "[Leave her to the tubes.]" }],
    },
    mq17_after: {
      speaker: () => ms.roseName(),
      text: "[You tell her she knew that sermon before it came.] Everybody under Grand Central knows it by heart. It's on every morning. I don't sleep past five forty-seven. [She snaps a tube into its socket harder than she needs to.] Bad habit.",
      onEnter() {
        L.setFlag("ms_rose_mq17_after");
      },
      responses: [{ text: "[Let it go.]" }],
    },
    // ---- mq18 ----
    mq18_start: {
      speaker: () => ms.roseName(),
      text:
        "[Flint is sitting on the gantry under the red TUDOR CITY letters, her rifle across her knees. She doesn't look round.] " +
        "You've been busy. Wren's book. The Neon. The Waldorf. Blackwell's. Rocky's radio. [She slings the rifle.] There's something you ought to see. St. Patrick's. The garden, not the church. " +
        "I said I'd never go back there, so walk slow, and don't ask me anything on the way.",
      responses: [
        { text: "Lead the way.", action: () => startWalk() },
        { text: "Not now." },
      ],
    },
    mq18_walk: {
      speaker: () => ms.roseName(),
      text: "Garden's on the north side. Inside the railings. Keep walking.",
      responses: [{ text: "[Keep walking.]" }],
    },
    mq18_atstone: {
      speaker: () => ms.roseName(),
      text: "Go on. Read it.",
      responses: [{ text: "[Go to the stone.]" }],
    },
    mq18_confront: {
      speaker: () => ms.roseName(),
      text: "[Flint stands a little way off from the stone with her back to the cathedral, the leather cuff pulled down over her left wrist. She is watching you, not the stone.]",
      responses: [
        { text: "Your name isn't Flint.", next: "mq18_clues" },
        { text: "[Not yet.]" },
      ],
    },
    mq18_clues: {
      speaker: () => L.heroName(),
      text: () => {
        const parts = [];
        if (Q.isComplete("mq11") || L.has("ms_note_register_61"))
          parts.push(
            "Wren's Register. ROSE MEAD, born on Track 61 at dawn, the eleventh of November '67. Father: E. W., asleep. And a girl of sixteen who climbed his stairs in '84 to ask if her father was in the book.",
          );
        if (L.flag("ms_lys_chin"))
          parts.push("Lys told me to ask you whose chin you have.");
        if (L.flag("ms_rose_mouthed"))
          parts.push("You knew the Dawn Hour before she said it.");
        if (L.flag("ms_rose_said_nell"))
          parts.push("You'd never heard of Nell Brady. You said it too fast.");
        parts.push(
          "You looked at that photo strip in 9C like you'd seen it every night of your life. And Sol has never once said your name.",
        );
        return (
          "[You say it slowly, because you are working it out as you go.] " +
          parts.join(" ") +
          "\n\n[And you look at her face, and for the first time you let yourself see it: Nicky's eyes. And your own stubborn chin.] You're Rose."
        );
      },
      responses: [{ text: "[Wait.]", next: "mq18_brand" }],
    },
    mq18_brand: {
      speaker: () => "Flint",
      text: () =>
        "[For a long moment she does nothing at all. Then she unbuckles the leather cuff on her left wrist and turns the inside of her arm to the light. Burned into the skin, old and silver: a sun with twelve rays.]\n\n" +
        "Little Sun. The Dawn's child. I ran at sixteen. [She buckles the cuff again, carefully.] That's what they called me, down there. ...Rose. My name's Rose. Rose Mead. [The next word comes out like something she has carried in her mouth for years.] Hi, Dad.",
      onEnter() {
        reveal();
      },
      responses: [
        { text: "Your mother. Nicky. Where is she?", next: "mq18_lie" },
      ],
    },
    mq18_lie: {
      speaker: "Rose",
      text: "[Rose looks past you, at the stone with the sun on it.] My mother's dead. [Flat. Final. She doesn't blink.] The riot, the fire. They carried her down the tracks and she never came up again. That's her name, under that sun. That's all there is.",
      onEnter() {
        L.setFlag("ms_rose_lie1");
        ms.set("rose_lie1");
      },
      responses: [
        { text: "[Embrace her.]", next: "mq18_hug" },
        {
          text: "Why didn't you tell me? All this time you let me walk around this city—",
          next: "mq18_angry",
        },
        {
          text: "[Show her Wren's certified copy.]",
          cond: () => ms.hasToken("rose_page") && !L.flag("ms_rose_saw_page"),
          next: "mq18_page",
        },
        { text: "[Stand beside her. Say nothing.]", next: "mq18_quiet" },
      ],
    },
    mq18_page: {
      speaker: "Rose",
      text: '[She takes the copy and reads it twice. Father: E. W. (asleep). Her thumb rubs at the raised seal.] He kept it. Wren. I asked him in \'84 and he said "asleep" like it was a place you could go. [She folds it into her breast pocket without asking.]',
      onEnter() {
        L.setFlag("ms_rose_saw_page");
      },
      responses: [
        { text: "[Embrace her.]", next: "mq18_hug" },
        { text: "Why didn't you tell me?", next: "mq18_angry" },
        { text: "[Stand beside her. Say nothing.]", next: "mq18_quiet" },
      ],
    },
    mq18_hug: {
      speaker: "Rose",
      text: "Don't. ...[She stands stiff as a fence post for a second.] Okay. Fine. Once. [Her forehead bumps your shoulder, hard, the way you knock on a door. Then she steps back, wipes her face with the heel of her hand and looks furious about it.]",
      onEnter() {
        if (ms.once("mq18_hug")) ms.addTrust(1, "Once.");
      },
      responses: [{ text: "[...]", next: "mq18_nothere" }],
    },
    mq18_angry: {
      speaker: "Rose",
      text: "[Her jaw sets. That chin.] Tell you what? That I'm line eleven in a dead clerk's book? You'd have run. [She turns and walks to the railings and stands there with her back to you for a long, long minute. Then she comes back.] ...I didn't know how. Okay? There isn't a way.",
      onEnter() {
        if (ms.once("mq18_angry")) ms.addTrust(-1, "Why didn't you tell me?");
      },
      responses: [{ text: "[...]", next: "mq18_nothere" }],
    },
    mq18_quiet: {
      speaker: "Rose",
      text: "[You stand beside her and look at the stone, and after a while her shoulder is touching your arm, and neither of you mentions it.]",
      responses: [{ text: "[...]", next: "mq18_nothere" }],
    },
    mq18_nothere: {
      speaker: "Rose",
      text: "Not here. They watch this garden from the bell tower; they always did. [She jerks her chin north-east.] Roof. My roof. There's a reason I've been following you since Chambers Street, and it isn't just— [She stops.] It isn't just that. Come on.",
      onEnter() {
        if (at("mq18", "confront")) Q.setStage("mq18", "roof");
      },
      responses: [{ text: "Lead the way." }],
    },
    mq18_roof_wait: {
      speaker: "Rose",
      text: "Roof first. I'm not saying it in the street.",
      responses: [{ text: "Roof it is." }],
    },
    mq18_roof: {
      speaker: "Rose",
      text:
        "[Up here the TUDOR CITY sign hums over both of you, red letters taller than a man, and all of 42nd Street runs away west toward the river. Rose sits on the gantry with her boots over the drop.]\n\n" +
        "The Dawn keeps a bomb under Grand Central. When the list comes back, she lights it. The list is back. It needs two keys; one's on Liberty. Get your friend, get me that key, and nobody ever turns it.",
      responses: [
        { text: "A bomb? Under Grand Central?", next: "mq18_sun" },
        { text: "What list?", next: "mq18_list" },
        { text: "Why the key? Why me?", next: "mq18_why" },
        { text: "I'll get you the key.", next: "mq18_promise" },
      ],
    },
    mq18_sun: {
      speaker: "Rose",
      text:
        "Two planes came over in '67. One flash. The second one came down in the North Woods with its bomb still in its belly, and the bomb didn't go off. The Continuity looked for it for two years and gave up. The Glowkeepers didn't. " +
        "They dug it out in '71 and took it under Grand Central on a railway flatcar, and they've been praying to it ever since. They call it the Second Sun.",
      onEnter() {
        ms.set("knows_second_sun");
      },
      responses: [
        { text: "What list?", next: "mq18_list" },
        { text: "Why the key? Why me?", next: "mq18_why" },
        { text: "I'll get you the key.", next: "mq18_promise" },
      ],
    },
    mq18_list: {
      speaker: "Rose",
      text:
        "Directive 7-A. The Continuity's. Everybody who isn't on the 1967 enrolment rolls gets fixed so they can't have kids. Every kid born down there. Every kid born anywhere since the bombs. Me. [She smiles without any humour at all.] " +
        'It leaked last November. The Dawn read it out on the air at five forty-seven: "The list has returned." I\'ve known what that means since I was sixteen.',
      responses: [
        { text: "A bomb? Under Grand Central?", next: "mq18_sun" },
        { text: "Why the key? Why me?", next: "mq18_why" },
        { text: "I'll get you the key.", next: "mq18_promise" },
      ],
    },
    mq18_why: {
      speaker: "Rose",
      text:
        "Two keys, turned together. Pilot's and navigator's. The Dawn wears one round her neck. The other one is in a locker on Liberty Island, same place they're holding your friend Zeke. The Covenant wants Liberty, the Continuity is Liberty, " +
        "and you're the sleeper: every door in this city has been waiting for you to walk through it. [Quieter.] And you're the only one I'd trust to put it in my hand.",
      responses: [
        { text: "A bomb? Under Grand Central?", next: "mq18_sun" },
        { text: "What list?", next: "mq18_list" },
        { text: "I'll get you the key.", next: "mq18_promise" },
      ],
    },
    mq18_promise: {
      speaker: "Rose",
      text: "Bring it to me. I'll drop it in the river off the Battery and nobody ever turns it. [She holds out her hand, flat, like a deal at the market.] Deal?",
      responses: [
        {
          text: "[Shake her hand.] Deal.",
          action: () => {
            L.setFlag("ms_rose_deal");
            heardOut();
          },
          next: () => (at("mq18", "ring") ? "mq18_ring" : null),
        },
        {
          text: "One thing at a time. First Liberty.",
          action: () => heardOut(),
          next: () => (at("mq18", "ring") ? "mq18_ring" : null),
        },
      ],
    },
    mq18_ring: {
      speaker: "Rose",
      text: "[Your hand has found its way into your coat pocket, around the little box you have carried since Pod 7. Your grandmother's ring. You were going to give it to Nicky on the twenty-first of May, 1967, in the Whispering Gallery.]\n\n[Rose sees the box. She doesn't say anything.]",
      responses: [
        { text: "[Give the ring to Rose.]", next: "mq18_ring_rose" },
        {
          text: "This was hers. I'll leave it with her, on the stone.",
          next: "mq18_ring_plan",
        },
        { text: "[Keep it.]", next: "mq18_ring_keep" },
      ],
    },
    mq18_ring_rose: {
      speaker: "Rose",
      text: "[She looks at it in your palm for a long time, and doesn't take it, and then does.] This was for her. [She tries it on her little finger, then on her ring finger, where it fits.] ...I'll look after it. I'm good at looking after things. Ask the sign.",
      onEnter() {
        ringTo("rose");
      },
      responses: [{ text: "[...]" }],
    },
    mq18_ring_plan: {
      speaker: "Rose",
      text: "[She shrugs, and doesn't quite manage it.] Your ring. Your stone. ...Her stone. Third row from the wall.",
      onEnter() {
        L.setFlag("ms_ring_plan_stone");
      },
      responses: [{ text: "[...]" }],
    },
    mq18_ring_keep: {
      speaker: "Rose",
      text: "[You close your hand on it again. Rose watches the box go back into your pocket and doesn't say anything, which says plenty.]",
      onEnter() {
        ringTo("kept");
      },
      responses: [{ text: "[...]" }],
    },
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq18",
      giver: "Flint",
      location:
        "St. Patrick's Cathedral, the Kindling Garden; the Tudor City roof",
      desc: () => {
        if (Q.isComplete("mq18")) {
          return (
            "Flint is Rose Mead: " +
            first() +
            '\'s daughter, born on Track 61, raised by the Glowkeepers as "Little Sun", runaway at sixteen. The Glowkeepers keep an unexploded 1967 bomb, the Second Sun, under Grand Central. ' +
            "It takes two keys; one is held on Liberty Island, where Zeke is. Rose wants that key, so that nobody ever turns it.\n\nNICOLE MEAD: DECEASED (1968)?"
          );
        }
        return (
          "Flint wants to show " +
          first() +
          " something at St. Patrick's: the Kindling Garden, where the Glowkeepers lay down the old names."
        );
      },
      stages: [
        {
          id: "flint",
          text: "Meet Flint on the Tudor City roof.",
          markers: () => ms.rose.marker("Flint"),
          onEnter() {
            if (ms.rose.mode() === "gone") ms.rose.place("home");
          },
        },
        {
          id: "garden",
          text: "Go to the Kindling Garden at St. Patrick's with Flint.",
          markers: markAt(P.garden, "The Kindling Garden"),
        },
        {
          id: "stone",
          text: "Find the stone.",
          markers: spotMark("ms_spot_kindling_stone", "Kindling stone"),
        },
        {
          id: "ground",
          text: "(Senses 6) Look at the ground around the stone.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq18", "stone"),
          doneIf: () => !!ms.f("stone_undug"),
          failIf: () =>
            !!L.flag("ms_stone_ground_failed") && !ms.f("stone_undug"),
          markers: spotMark("ms_spot_kindling_stone", "Kindling stone"),
        },
        {
          id: "confront",
          text: () =>
            revealed()
              ? "Talk to Rose."
              : 'Confront Flint: "Your name isn\'t Flint."',
          markers: () => ms.rose.marker(),
        },
        {
          id: "roof",
          text: "Hear Rose out on the Tudor City roof.",
          markers: () =>
            markAt(ms.rose.HOME, "Rose's roof")().concat(
              ms.rose.marker("Rose"),
            ),
        },
        {
          id: "ring",
          text: "Decide what to do with your grandmother's ring: give it to Rose, lay it on the stone, or keep it.",
          markers: () =>
            ms.rose
              .marker("Rose")
              .concat(spotMark("ms_spot_kindling_stone", "Kindling stone")()),
        },
        {
          id: "dig",
          text: "(Optional) Dig up the grave.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!ms.f("stone_dug"),
        },
      ],
      rewards: { xp: 600 },
      onComplete() {
        reveal();
        if (ms.trust() >= 2) ms.set("rose_follow_ok");
        ms.rose.place("home");
        L.later(3, () =>
          L.notify("Quest log: NICOLE MEAD: DECEASED (1968)?", { duration: 6 }),
        );
      },
    });
  });
  ms.solver("mq18", {
    flint() {
      startWalk();
    },
    garden() {
      arriveGarden();
    },
    stone() {
      readStone();
    },
    confront() {
      reveal();
      L.setFlag("ms_rose_lie1");
      ms.set("rose_lie1");
      if (ms.once("mq18_hug")) ms.addTrust(1, "test");
      Q.setStage("mq18", "roof");
    },
    roof() {
      heardOut();
    },
    ring() {
      ringTo("rose");
    },
  });

  // ------------------------------------------------------------------
  // Debug: G.quests.debug.act2
  // ------------------------------------------------------------------
  G.quests.debug.act2 = {
    walk: (id) => ms.walk(id),
    flags: () => {
      const keys = [
        "knows_daughter",
        "token_rose_page",
        "book_read",
        "glow",
        "glow_warned",
        "crowe_riot",
        "bulkhead_seen",
        "sun_battery",
        "waldorf_jammer_down",
        "waldorf_loud",
        "ruby_free",
        "file_1968_read",
        "m61_seen",
        "token_pass",
        "bureau",
        "codebook_on_liberty",
        "nell",
        "token_nell",
        "finder_built",
        "dawn_relay",
        "eli_replied",
        "voice_reached",
        "token_voice",
        "stone_undug",
        "stone_dug",
        "rose_revealed",
        "rose_lie1",
        "ring",
        "rose_follow_ok",
        "rose_trust",
      ];
      const o = {};
      for (const k of keys) o["ms_" + k] = L.flag("ms_" + k);
      return o;
    },
    dawn: () => {
      waitDawn();
      return G.time && G.time.hour;
    },
  };
})();
