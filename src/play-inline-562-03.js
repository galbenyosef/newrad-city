// play-inline-562 03 — title
// Lines 601-768 of readable/play-inline-562.pretty.js (statement-aligned).
  function spawnLys() {
    const o = outcome();
    if (o === "exposed" || o === "left") return;
    const pier = Q.stage(QID) === "passage" && Q.isActive(QID);
    const sp = spots();
    L.spawnNPC({
      id: "bs_lys",
      type: "human",
      name: "Mademoiselle Lys",
      outfit: "settler",
      gender: "f",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 1.5,
      hostile: false,
      essential: !o,
      level: 6,
      dialogue: "dlg_bs_lys",
      skinTone: 0.3,
      at:
        pier && sp.lysPier
          ? { fallback: sp.lysPier, maxR: 4 }
          : {
              site: "grand_central",
              anchors: ["bar_patron2", "bar_patron1"],
              fallback: LYS_FB,
            },
      barks:
        o === "sold"
          ? [
              "Letters written. Secrets bought. Both by the page.",
              "Bonsoir, sleeper. Not here, please. People watch.",
            ]
          : [
              "Letters written, five scrip a page. Love letters ten.",
              "A letter is a message nobody can answer. Very restful.",
              "The coffee here is a crime. I report it daily.",
            ],
    });
  }
  function spawnCorbeau() {
    if (solved() || Q.stage(QID) !== "passage") return;
    const p = spots().corbeau;
    if (!p) return;
    L.spawnNPC({
      id: "bs_corbeau",
      type: "human",
      name: "Corbeau",
      outfit: "drifter",
      gender: "m",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 2,
      hostile: false,
      essential: true,
      level: 7,
      dialogue: "dlg_bs_corbeau",
      pos: { x: p.x, y: p.y, z: p.z },
      skinTone: 0.25,
      barks: [
        "The tide does not care who started the war. I find that restful.",
        "Sainte-Odile, do not embarrass me now.",
      ],
    });
  }
  function spawnInspector() {
    if (Q.stage(QID) !== "expose" || solved()) return;
    const p = spots().inspector;
    if (!p) return;
    relayTruce();
    const a = L.spawnNPC({
      id: "bs_inspector",
      type: "continuity_soldier",
      name: "Inspector Harlan Pike",
      faction: "continuity",
      ai: "guard",
      home: "here",
      homeR: 2,
      hostile: false,
      essential: true,
      level: 12,
      dialogue: "dlg_bs_inspector",
      pos: { x: p.x, y: p.y, z: p.z },
      barks: [
        "Internal Security. Keep your hands where the Republic can see them.",
        "The date on my orders is March 1967. I intend to act like it.",
      ],
    });
    if (a && L.near(p.x, p.z, 40))
      L.notify("Boots on the pavement. Internal Security answers fast.", {
        quiet: true,
      });
  }
  /** Continuity actors near the cabinet stand down while the inspector is here. */
  function relayTruce() {
    const r = spots().relay;
    if (!r) return;
    L.factionTruce("continuity", r.x, r.z, 40, false, {
      id: "bs_relay_truce",
      cond: () =>
        (Q.stage(QID) === "expose" && !solved()) ||
        (outcome() === "exposed" && L.alive("bs_inspector")),
    });
  }

  // ------------------------------------------------------------------
  // Terminal: the Continuity signals cabinet
  // ------------------------------------------------------------------
  const RELAY_TERM = {
    title: "CONTINUITY SIGNALS — CABINET LX-47",
    header:
      "OFFICE OF THE ACTING PRESIDENT — INTERNAL SECURITY\nFIELD INTERCEPT RELAY LX-47 (LEXINGTON AT 47TH)\n>> DATE ON FILE: MARCH 7, 1967",
    lock: { id: LOCK_RELAY.id, passcode: LOCK_RELAY.passcode },
    entries: [
      {
        title: 'Intercept Log — "SEPT" Traffic',
        action: () => {
          readRelay();
        },
        text:
          "SOURCE: FOREIGN, SHORTWAVE, CIPHERED. CIPHER: BROKEN (SHIFT SEVEN — THEY NEVER CHANGE IT).\n\n" +
          "0214 — LYS TO C.: COURIER LATE. MAILBOX UNTOUCHED. WILL WAIT.\n0219 — C. TO LYS: WAIT. ALWAYS WAIT. WE ARE VERY GOOD AT IT.\n" +
          "0301 — LYS TO C.: PIVERT NOT AT THE ARCH. THREE DAYS.\n0302 — C. TO LYS: THEN WE NEED A FACE THEY DO NOT KNOW.\n\n" +
          'OPERATOR\'S NOTE: Subject "Pivert" detained 03/02, did not survive questioning. Mailbox left in place as bait. Bait not taken. ' +
          "Recommend patience. Recommend coffee.\n\n[You tear the printout off the roller.]",
      },
      {
        title: "Standing Order 19 — Foreign Nationals",
        action: () => {
          readRelay();
        },
        text:
          "BY ORDER OF THE ACTING PRESIDENT\n\nAll foreign nationals in the Manhattan district are to be detained on the first night of frost and " +
          'held pending the restoration of normal diplomatic relations.\n\nDate of restoration: TO BE ANNOUNCED.\n\nKnown subjects: "LYS" (female, ' +
          'forties, writes letters at the Grand Central market, location confirmed); "CORBEAU" (male, elderly, location unknown, believed to own a boat).',
      },
      {
        title: "File 67-10-23 / Attribution",
        action: () => {
          readRelay();
          msSet("attribution_on_liberty");
        },
        text:
          "FILE 67-10-23: WHO GAVE THE ORDER.\n\nSTATUS: SEALED BY ORDER OF THE ACTING PRESIDENT. ORIGINAL HELD AT LIBERTY STATION (EVIDENCE ROOM). NO COPIES.\n\nREQUESTS TO UNSEAL: 41. GRANTED: 0.\n\n" +
          "LAST REQUEST: FROM THIS CABINET'S OWN OPERATOR, 1988, HANDWRITTEN: \"Sir, if it wasn't them, who was it?\" STATUS: OPERATOR REASSIGNED.",
      },
      {
        title: "Captured Dossier HIVER — Sources",
        action: () => {
          readRelay();
        },
        text:
          'FROM BUREAU SEPT DOSSIER "HIVER" (RECOVERED 1967, PARTIAL)\n\nSUBJECT: PROJECT LONG WINTER (OCD).\n\nSOURCES:\n  LUMIERE (since summer \'66): civilian, UN interpretation staff, unwitting. Close to volunteer "E.W.".\n    Warrant signed 4 MARCH 1967. NOT SERVED.\n  PIVERT: plumber, Grand Central. Deceased 03/02/89.\n  (36 further sources redacted)\n\n' +
          'CELLS: "CORBEAU" (Manhattan), "LYS" (Manhattan), "POSTE DRAGON" (Chinatown; silent since 1974).',
      },
      {
        title: ">> TRANSMIT: Report foreign agents to Internal Security",
        cond: () => canExpose(),
        action: () => reportBureau(),
      },
    ],
  };

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
