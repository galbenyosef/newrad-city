// play-inline-568 01 — time
// Lines 22-142 of readable/play-inline-568.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const ms = L.ms;
  const rose = ms.rose;
  const first = () => String(L.heroName()).split(" ")[0];
  const faction = () => L.flag("mq_faction") || "none";
  const at = (q, s) => Q.isActive(q) && Q.stage(q) === s;
  const UN = { x: 313, z: -320 };

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  /** An anchor of a POI / interior cell (G.pois first: interiors such as un_assembly), else L.anchor. */
  function poiAnchor(key, names, fb) {
    if (G.pois && typeof G.pois.getAnchor === "function") {
      for (const n of names) {
        let a = null;
        try {
          a = G.pois.getAnchor(key, n);
        } catch (e) {
          a = null;
        }
        if (a && isFinite(a.x) && isFinite(a.z))
          return { x: a.x, y: a.y || 0, z: a.z };
      }
    }
    return L.anchor(key, names, fb || null);
  }
  /** Rose's actor within r metres of the player. */
  function roseNear(r) {
    const a = rose.actor();
    const P = G.player && G.player.pos;
    return !!(
      a &&
      !a.dead &&
      P &&
      Math.hypot(a.pos.x - P.x, a.pos.z - P.z) <= (r || 20) &&
      Math.abs(a.pos.y - P.y) < 8
    );
  }
  /** Pass game time until hour h (fade), then run then(). */
  function waitUntil(h, then) {
    const go = () => {
      const cur = G.time ? G.time.hour : 0;
      const d = (((h - cur) % 24) + 24) % 24;
      if (G.atmos && typeof G.atmos.advanceHours === "function") {
        try {
          G.atmos.advanceHours(d);
        } catch (e) {
          G.time.hour = h;
        }
      } else if (G.time) G.time.hour = h;
      if (then) L.later(0.8, then);
    };
    if (typeof G.fadeTransition === "function" && !G.SMOKE)
      G.fadeTransition(go, 0.8);
    else go();
  }
  const hourNow = () => (G.time ? G.time.hour : 12);
  const clock = () => {
    const h = hourNow();
    const hh = Math.floor(h),
      mm = Math.floor((h - hh) * 60);
    return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
  };
  /** Tell the main quest log to refresh without a jingle. */
  const refresh = (id) => {
    if (Q.isActive(id)) L.refresh(id);
  };

  // ------------------------------------------------------------------
  // Notes (personalised at load by the core)
  // ------------------------------------------------------------------
  const NOTE_LEDGER = ms.note({
    id: "ms_note_ledger_1968",
    name: "Relief Station Ledger, 1968",
    title:
      "OFFICE OF CIVIL DEFENSE — RELIEF STATION No. 3 (GRAND CENTRAL CONCOURSE) — DAILY LEDGER",
    text:
      "Station commander: Capt. L. Crane. Dispensary: Lt. A. Keel.\nPenicillin and sulfa to be issued against 1967 enrolment cards ONLY (OCD Circular 14).\n\n" +
      "12 Feb 1968: 40 rations, 6 penicillin courses issued, cards checked. Track 61 camp requests blankets: refused (not enrolled).\n" +
      "18 Feb 1968: MEAD, ROSE (infant), NOT ENROLLED, REFUSED. A.K.\n   [Margin, same hand:] Mother very insistent. Removed by guard.\n" +
      "20 Feb 1968: 38 rations issued. Crowd at the barrier, dispersed.\n" +
      "5 Mar 1968 (anniversary): crowd forming from 16:00. Capt. Crane orders the ration store secured for the duration.\n" +
      "5 Mar 1968, 18:40: ration store secured, padlocked (A.K.). 11 juveniles sheltering inside, to be released after the crowd disperses.\n   Padlock key held by Capt. Crane, per his order.\n" +
      "5 Mar 1968, 18:52: fire at the dispensary counter. Spread to the east stores.\n" +
      "6 Mar 1968: Capt. L. Crane, deceased. 11 juveniles, deceased, ration store. Door found locked. Penicillin stock missing.\n" +
      "   Instigator per witnesses: MEAD, N. (not enrolled). Presumed dead in the fire. Body not recovered. 1 adult female, burned, carried off down the tracks by persons unknown.\n\n" +
      "[Last entry, different ink:] Ledger to the UN Records Strongroom by order. Not to be read. A.K.",
  });
  const NOTE_NUMBERS = ms.note({
    id: "ms_note_numbers",
    name: "Static's Transcript (93.9, Group Three)",
    title: "93.9 — GROUP THREE (NAME READINGS), DECODED WITH SHEET 14",
    text:
      "[Static Okonkwo's pencil, block capitals, on the back of a ration chit.]\n\n" +
      "WAYTE, E.: PRIORITY ASSET. FILE C-9/WAYTE. RECOVER WITH THE KEY.\nMEAD, N.: STRUCK 1968.\nMEAD, R.: UNENROLLED, DIRECTIVE 7-A SCHEDULE C (STERILISE).\nSUN CULT EMISSARY REQUESTS KEY B: REFUSED.\n\n[Underneath, smaller:] Somebody's little girl. -S.",
  });
  const NOTE_NUMBERS_B = ms.note({
    id: "ms_note_numbers_b",
    name: "Static's Transcript (93.9, Group Three)",
    title: "93.9 — GROUP THREE (NAME READINGS), DECODED WITH SHEET 14",
    text:
      "[Static Okonkwo's pencil, block capitals, on the back of a ration chit.]\n\n" +
      "WAYTE, E.: PRIORITY ASSET. FILE C-9/WAYTE. RECOVER WITH THE KEY.\nMEAD, N.: STRUCK 1968.\nMEAD, N.: FILE REOPENED 1989, SLEEPER INQUIRING.\nMEAD, R.: UNENROLLED, DIRECTIVE 7-A SCHEDULE C (STERILISE).\nSUN CULT EMISSARY REQUESTS KEY B: REFUSED.\n\n[Underneath, smaller:] Somebody's little girl. -S.",
  });
  const NOTE_MEMO = ms.note({
    id: "ms_note_cog_memo",
    name: "Archive 7 Carbon: 4 March 1967",
    title: "CONTINUITY OF GOVERNMENT — ARCHIVE 7 — FLASH TRAFFIC (CARBON)",
    text:
      "DATE: 4 MARCH 1967, 0745 HOURS\nFROM: OFFICE OF THE DIRECTOR, OCD (M.)\nTO: NODE 7 (SUB-TREASURY) / OCD MANHATTAN / LIBERTY STATION\nPRECEDENCE: FLASH. EYES ONLY.\n\n" +
      "MOVE THE ROLLS AND ENROLLED STAFF TO LIBERTY TONIGHT. NO PUBLIC NOTICE. PROTECT THE SOURCE. M.\n\n" +
      "[Pencilled under it in a custodian's hand:] Filed 0810. Rolls crated 1500, launch at the Battery 2100. The source says Sunday morning. God help everybody else.",
  });

  // ------------------------------------------------------------------
  // QUESTS
  // ------------------------------------------------------------------
