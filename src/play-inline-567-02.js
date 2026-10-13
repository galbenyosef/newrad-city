// play-inline-567 02 — anchors
// Lines 36-317 of readable/play-inline-567.pretty.js (statement-aligned).
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
