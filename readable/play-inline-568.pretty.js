/* src/quests/64_ms_act3.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 64: MAIN STORY, ACT III "THE ROLLS"
 *   n17 mq19 Eyes on the Island        (absorbs li_rock_scope: the Covenant variant;
 *                                        the UN Sky-Eye room and the Chrysler nest are the
 *                                        Continuity and lone-path lenses)
 *   n18 mq20 Numbers Game              (proxy: qx_numbers, quests_extra)
 *   n19 mq21 Pure Records              (proxy: li_un_records, landmark_interiors; the 1968
 *                                        Relief Station ledger + the Keel confrontation)
 *   n21 mq22 Continuity of Government  (proxy: pf3_cog, poi_fidi3; the 4 March 1967 memo)
 *   n22 mq23 The Whispering Gallery    (new: Brother Taper, the Dawn's offer, Track 61)
 *   n23 mq24 Crossing                  (Lancers / Rotorcraft / Ossie's ferry; Shell Shock is
 *                                        the lone-path stage; hands off to Act IV through
 *                                        L.ms.liberty.arrive(how))
 * n16 mq04 and n20 mq05 live in 40_factions.js (rewired there); Rose's mq04 beats are here.
 * Every quest is started by the spine (61_ms_core.js); nothing here starts a main quest.
 * NPCs: ms_taper_gallery (Brother Taper, mq23), ms_lancer_muster / ms_lancer_muster2 (the
 * Covenant muster at the Battery, mq24). Rose = ms_rose (L.ms.rose).
 * Text only: no speech synthesis anywhere.
 * ===================================================================== */
(function () {
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
  L.hook("init", function () {
    // ================= n17 mq19 EYES ON THE ISLAND =================
    ms.quest({
      id: "mq19",
      name: "Eyes on the Island",
      giver: "Lancer Dalca / Lieutenant Hale / Rose",
      location: "Top of the Rock, the UN Sky-Eye room, the Chrysler crown",
      desc: () =>
        "Before the crossing somebody has to count the guns on Liberty Island, and the boats move at night. " +
        (faction() === "covenant"
          ? "The Covenant's long-range scope is on the Top of the Rock."
          : faction() === "continuity"
            ? "Lieutenant Hale can sign you into the Sky-Eye monitor room at the UN Plaza."
            : "Deadeye Dolores's nest in the Chrysler crown has the best view in Manhattan.") +
        (ms.f("teague_seen")
          ? " At two in the morning a Glowkeeper skiff met a Continuity private on Liberty's pier."
          : ""),
      stages: [
        {
          id: "lens",
          text: () => lensText(),
          markers: () => lensMarkers(),
          onEnter() {
            if (Q.isComplete("li_rock_scope"))
              L.later(1.2, () => {
                if (at("mq19", "lens")) setLens("rock");
              });
          },
        },
        {
          id: "watch",
          text: () =>
            "Keep watch on Liberty Island after midnight (" +
            LENS_NAME[ms.f("mq19_lens") || "chrysler"] +
            "). The boats move at two.",
          markers: () => {
            const p = lensPos(ms.f("mq19_lens"));
            return p
              ? [lensMarker(p, LENS_NAME[ms.f("mq19_lens")] || "Long lens")]
              : [];
          },
          onEnter() {
            placeRoseAtLens();
            // watched already (the Covenant scope's own night watch, before this quest began): Rose tells it later
            if (L.flag("ms_teague_seen"))
              L.later(1.0, () => {
                if (at("mq19", "watch")) {
                  ms.set("mq19_rose_taper_pending");
                  watchDone();
                }
              });
          },
        },
        {
          id: "report",
          text: () =>
            "Report the skiff (" +
            reportTo() +
            "), or tell Rose you will keep it quiet.",
          markers: () => reportMarkers(),
        },
        {
          id: "dalca",
          text: "(Optional) Give Lancer Dalca the gun count in the Rockefeller war room.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            Q.isActive("li_rock_scope") &&
            Q.stage("li_rock_scope") === "report",
          doneIf: () => Q.isComplete("li_rock_scope"),
          markers: () => [{ npc: "li_cov_dalca", label: "Lancer Dalca" }],
        },
      ],
      rewards: { xp: 420 },
      onComplete() {
        if (rose.mode() === "at") rose.place("home");
      },
    });
    L.absorb("li_rock_scope", "mq19");

    // ================= n18 mq20 NUMBERS GAME =================
    ms.quest({
      id: "mq20",
      name: "Numbers Game",
      giver: "Static Okonkwo",
      location: "Lexington Avenue listening post",
      desc: () =>
        "Static Okonkwo has written down the numbers on 93.9 for six years. With the Continuity's one-time pad she can read their name list." +
        (L.flag("ms_read_7a_schedule")
          ? " Your name is at the top of it. Rose is on Directive 7-A, Schedule C."
          : ""),
      stages: [
        ms.proxy("mq20", "qx_numbers", {
          id: "side",
          next: "rose",
          text: "Find Static Okonkwo's listening post on Lexington Avenue, by the First Journal.",
          reach: {
            site: "journal_bldg",
            anchors: ["lexington", "listening_post"],
            fallback: { x: 283, z: -262 },
            label: "Listening Post",
            r: 12,
          },
          onDone: mq20Done,
        }),
        {
          id: "rose",
          text: "Show Rose the decoded name list.",
          markers: () => rose.marker("Rose"),
          onEnter() {
            if (L.flag("ms_rose_read_schedule_c"))
              L.later(1.0, () => {
                if (at("mq20", "rose")) Q.complete("mq20");
              });
          },
        },
      ],
      rewards: { xp: 380 },
    });

    // ================= n19 mq21 PURE RECORDS =================
    ms.quest({
      id: "mq21",
      name: "Pure Records",
      giver: "Major Adelaide Keel",
      location: "UN General Assembly Hall, Records Strongroom",
      desc: () =>
        "Directive 7-A cannot run without the 1967 enrolment microfilm, kept in the UN Records Strongroom beside the Relief Station's 1968 ledger. " +
        (ms.f("lock_truth")
          ? "The ledger says the ration store was padlocked from outside, with eleven children in it, on Captain Crane's order. "
          : "") +
        (ms.f("keel")
          ? ""
          : "Major Keel signed that ledger. Rose wants to see her face."),
      stages: [
        ms.proxy("mq21", "li_un_records", {
          id: "records",
          next: "ledger",
          text: "Get into the UN Records Strongroom (Keel's pass, or the code on Ortiz's blotter), recover the enrolment microfilm and decide its fate.",
          reach: {
            site: "un_hq",
            anchors: ["entrance", "door", "gate"],
            fallback: { x: 314, z: -308 },
            label: "UN General Assembly",
            r: 14,
          },
          onDone: syncMicrofilm,
        }),
        {
          id: "ledger_opt",
          text: "(Optional) Read the Relief Station's 1968 ledger, shelved beside the microfilm.",
          sideObjective: true,
          optional: true,
          showIf: () => at("mq21", "records"),
          doneIf: () => !!ms.f("lock_truth"),
          markers: () => {
            const p = ledgerPos();
            return p && !L.has(NOTE_LEDGER)
              ? [
                  {
                    x: p.x,
                    z: p.z,
                    y: p.y,
                    label: "1968 Ledger",
                    interior: p.x >= 2500,
                  },
                ]
              : [];
          },
        },
        {
          id: "ledger",
          text: () =>
            L.has(NOTE_LEDGER)
              ? "Read the Relief Station's 1968 ledger (NOTES)."
              : "Find the Relief Station's 1968 ledger in the Records Strongroom, and read it.",
          markers: () => {
            const p = ledgerPos();
            return p && !L.has(NOTE_LEDGER)
              ? [
                  {
                    x: p.x,
                    z: p.z,
                    y: p.y,
                    label: "1968 Ledger",
                    interior: p.x >= 2500,
                  },
                ]
              : [];
          },
          onEnter() {
            if (ms.f("lock_truth")) {
              L.later(0.8, () => {
                if (at("mq21", "ledger")) Q.setStage("mq21", "keel");
              });
              return;
            }
            // no strongroom to find it in (module missing / anchor gone): the ledger comes out with the microfilm
            if (!L.has(NOTE_LEDGER) && !ledgerPos()) {
              L.give(NOTE_LEDGER, 1);
              L.notify(
                "Shelved beside the microfilm: a water-stained ledger stencilled RELIEF STATION No. 3. You take it.",
              );
            }
          },
        },
        {
          id: "keel",
          text: () =>
            keelGone()
              ? "Tell Rose what the ledger says."
              : "Confront Major Keel, with Rose.",
          markers: () => {
            const m = [];
            if (!keelGone() && L.npc("li_keel"))
              m.push({ npc: "li_keel", label: "Major Keel" });
            if (!roseNear(12)) m.push(...rose.marker("Rose"));
            return m;
          },
          onEnter() {
            roseJoinsForKeel();
          },
        },
      ],
      rewards: { xp: 480 },
      onComplete() {
        if (rose.mode() === "follow" && !L.flag("ms_rose_follow_ok"))
          rose.place("home");
      },
    });

    // ================= n21 mq22 CONTINUITY OF GOVERNMENT =================
    ms.quest({
      id: "mq22",
      name: "Continuity of Government",
      giver: "Lancer Halloran / decoded traffic",
      location: "Federal Hall, the Sub-Treasury strongroom",
      desc: () =>
        "A wounded Lancer is pinned under Federal Hall by the raider gang called the Congress. The Sub-Treasury's 1967 archive core holds the Continuity's last orders before the Bombing." +
        (ms.f("memo_read")
          ? ' One of them is dated the fourth of March: the day before. "Move the rolls and enrolled staff to Liberty tonight."'
          : ""),
      stages: [
        ms.proxy("mq22", "pf3_cog", {
          id: "side",
          next: "memo",
          text: "Reach Lancer Halloran under Federal Hall, get past Speaker Voss and recover the archive core from the Sub-Treasury strongroom.",
          reach: {
            site: "federal_hall",
            anchors: ["entrance", "door", "steps"],
            fallback: { x: 80, z: 826 },
            label: "Federal Hall",
            r: 14,
          },
        }),
        {
          id: "memo",
          text: "Read the memo filed with the archive core (NOTES).",
          markers: () => [],
          onEnter() {
            if (!L.has(NOTE_MEMO)) {
              L.give(NOTE_MEMO, 1);
              if (!L.has("pf3_cog_core"))
                L.notify(
                  "Archivist Ames had copied the core's index into her notebook. One carbon was folded inside the cover.",
                );
            }
            if (ms.f("memo_read"))
              L.later(0.8, () => {
                if (at("mq22", "memo")) Q.setStage("mq22", "fate");
              });
          },
        },
        {
          id: "fate",
          text: "Decide who gets the archive core: Rocky Delgado (to broadcast it), Lancer Halloran or Lieutenant Hale.",
          markers: () => coreMarkers(),
          onEnter() {
            L.later(0.8, coreSettled);
          },
        },
      ],
      rewards: { xp: 420 },
    });

    // ================= n22 mq23 THE WHISPERING GALLERY =================
    ms.quest({
      id: "mq23",
      name: "The Whispering Gallery",
      giver: "A whisper",
      location:
        "Grand Central: the Whispering Gallery, the lower level, the Track 61 bulkhead",
      desc: () =>
        "In the corner where you said goodbye to Nicole, a whisper from the opposite arch." +
        (ms.f("dawn_pact") === "agree"
          ? " You agreed: Key B for the truth about Nicole Mead."
          : ms.f("dawn_pact") === "refuse"
            ? " You told the Dawn no."
            : "") +
        (ms.f("heard_humming")
          ? " Behind the Track 61 bulkhead a woman was humming your song. You know that voice. You can't place it."
          : ""),
      stages: [
        {
          id: "gallery",
          text: "Go to the Whispering Gallery under Grand Central's west balcony and stand in the corner.",
          markers: () => {
            const p = galleryPos("a");
            return p
              ? [
                  {
                    x: p.x,
                    z: p.z,
                    y: p.y,
                    label: "Whispering Gallery",
                    exact: true,
                  },
                ]
              : [];
          },
          onEnter() {
            L.later(2, () => {
              if (at("mq23", "gallery"))
                L.notify(
                  "Moe, at the Oyster Bar, sent word: somebody keeps asking for you in the Whispering Gallery. Nobody saw who.",
                  { duration: 6 },
                );
            });
          },
        },
        {
          id: "answer",
          text: "Answer the whisper.",
          markers: () => [{ npc: "ms_taper_gallery", label: "The whisper" }],
        },
        {
          id: "follow",
          text: "Follow Brother Taper to the Track 61 bulkhead without being seen (or give it up and go back to the gallery corner).",
          markers: () => {
            const p = bulkheadPos();
            return p
              ? [{ x: p.x, z: p.z, y: p.y, label: "Track 61 Bulkhead" }]
              : [];
          },
        },
        { id: "rose", text: "Find Rose.", markers: () => rose.marker("Rose") },
      ],
      rewards: { xp: 400 },
      onComplete() {
        L.news(
          ms.f("dawn_pact") === "agree"
            ? "Night owls report candles in the Grand Central gallery, a whole row of them, lit all at once around midnight. The Glowkeepers say it's a feast day. Rocky checked: it isn't."
            : "A quiet night at Grand Central, Moe tells me. One fella in a hood stood in the Whispering Gallery till dawn, talking to the wall. The wall did not answer.",
        );
      },
    });

    // ================= n23 mq24 CROSSING =================
    ms.quest({
      id: "mq24",
      name: "Crossing",
      giver: "Lancer-Commander Stroud / Lieutenant Hale / Ossie",
      location: "Battery Park pier / UN Plaza",
      desc: () =>
        "With the core and the Liberty Key in hand, you need a way across the harbour to Liberty Island, where Zeke, Dr. Calloway and Key B are held. " +
        (ms.trust() >= 2
          ? "Rose wants to be there when the key is found."
          : "Rose will watch the crossing through her scope from the Battery."),
      stages: [
        {
          id: "route",
          text: "Find a way across the harbour.",
          hidden: true,
          onEnter() {
            L.later(0.4, routeCrossing);
          },
        },
        {
          id: "muster",
          text: "Muster with the Covenant Lancers at the Battery Park pier.",
          markers: () => [
            { npc: "ms_lancer_muster", label: "Covenant muster" },
            { npc: "bp_ossie", label: "Ossie's ferry" },
          ],
          onEnter() {
            placeRoseForCrossing("battery");
          },
        },
        {
          id: "rotorcraft",
          text: "Board the Continuity Rotorcraft with Lieutenant Hale at the UN Plaza.",
          markers: () => [{ npc: "con_hale", label: "Lieutenant Hale" }],
          onEnter() {
            placeRoseForCrossing("un");
          },
        },
        ms.proxy("mq24", "sq_shellshock", {
          id: "shells",
          next: "ferry",
          text: "Clear the shellbacks off Battery Park so Ossie's ferry can run.",
          reach: {
            site: "battery_park",
            anchors: ["ferryman", "pier", "dock"],
            fallback: { x: -40, z: 950 },
            label: "Battery Park",
            r: 25,
          },
          onEnter() {
            placeRoseForCrossing("battery");
          },
        }),
        {
          id: "ferry",
          text: "Cross to Liberty Island with Ossie from the Battery Park pier.",
          markers: () => [{ npc: "bp_ossie", label: "Ossie" }],
          onEnter() {
            placeRoseForCrossing("battery");
          },
        },
      ],
      rewards: { xp: 500 },
    });
  });

  // ==================================================================
  // mq19 EYES ON THE ISLAND
  // ==================================================================
  const LENS_NAME = {
    rock: "the long-range scope on the Top of the Rock",
    skyeye: "the Sky-Eye monitor room at the UN Plaza",
    chrysler: "the sniper's nest in the Chrysler crown",
  };
  function rockScopePos() {
    const LI = G._li;
    const W = LI && LI.rockWorld;
    if (W && W.anchors && W.anchors.scope) {
      const s = W.anchors.scope;
      return { x: s.x + 1.0, y: s.y, z: s.z - 1.2, high: true };
    }
    return null;
  }
  function lensPos(kind) {
    if (kind === "rock")
      return (
        rockScopePos() ||
        L.anchor(
          "rockefeller",
          ["scope", "observation_deck", "rooftop", "roof"],
          { x: 80, z: -306 },
        )
      );
    if (kind === "skyeye") {
      const a = L.anchor("un_hq", ["sky_eye_room", "command", "terminal"], {
        x: UN.x - 22,
        z: UN.z + 12,
      });
      return a ? { x: a.x + 1.6, y: a.y, z: a.z + 1.2 } : null;
    }
    if (kind === "chrysler") {
      const n = L.anchor("chrysler", ["sniper", "crown"], null);
      return n
        ? { x: n.x - 0.8, y: n.y, z: n.z + 0.8, high: n.y > 30 }
        : L.anchor("chrysler", ["rooftop", "entrance"], { x: 303, z: -186 });
    }
    return null;
  }
  function lensMarker(p, label) {
    if (p.high && L.chryslerMarker && Math.hypot(p.x - 309, p.z + 208) < 40)
      return L.chryslerMarker(p, label);
    // rooftops: a plan position (the engine points a street-level marker inside a building at its door)
    if (p.high && G.player.pos.y < p.y - 20) return { x: p.x, z: p.z, label };
    return { x: p.x, z: p.z, y: p.y, label, exact: true };
  }
  const pathLens = () =>
    faction() === "covenant"
      ? "rock"
      : faction() === "continuity"
        ? "skyeye"
        : "chrysler";
  function lensText() {
    const k = pathLens();
    if (k === "rock") {
      const v = Q.get("li_rock_scope");
      if (v && v.active && v.stageText) return v.stageText;
      return "Get a long lens on Liberty: the Covenant's scope on the Top of the Rock (Lancer Dalca, the war room) needs recalibrating.";
    }
    if (k === "skyeye")
      return ms.f("skyeye_room_ok")
        ? "Get a long lens on Liberty: Lieutenant Hale has signed you into the Sky-Eye monitor room at the UN Plaza."
        : "Get a long lens on Liberty: ask Lieutenant Hale for the Sky-Eye monitor room at the UN Plaza.";
    return "Get a long lens on Liberty: Deadeye Dolores's nest in the Chrysler crown has the best view in Manhattan (service elevator in the lobby).";
  }
  function lensMarkers() {
    const k = pathLens();
    if (k === "rock") {
      if (Q.isActive("li_rock_scope")) {
        const m = L.questMarkers("li_rock_scope");
        if (m && m.length)
          return m.map((x) => ({
            x: x.x,
            z: x.z,
            y: x.y,
            label: x.label,
            exact: true,
            interior: x.interior,
          }));
      }
      if (Q.get("li_rock_scope") && !Q.isStarted("li_rock_scope"))
        return [{ npc: "li_cov_dalca", label: "Lancer Dalca", x: 80, z: -320 }];
    }
    if (k === "skyeye" && !ms.f("skyeye_room_ok"))
      return [{ npc: "con_hale", label: "Lieutenant Hale" }];
    const p = lensPos(k);
    return p ? [lensMarker(p, LENS_NAME[k])] : [];
  }
  function setLens(kind) {
    if (!at("mq19", "lens")) return;
    ms.set("mq19_lens", kind);
    L.notify(
      "A long lens on Liberty: " +
        LENS_NAME[kind] +
        ". The boats move after midnight.",
      { duration: 5 },
    );
    Q.setStage("mq19", "watch");
  }
  function placeRoseAtLens() {
    if (
      rose.mode() === "follow" ||
      (rose.mode() === "gone" && !L.flag("ms_rose_met"))
    )
      return;
    const k = ms.f("mq19_lens");
    if (k === "skyeye") return; // she won't set foot on Continuity ground: she watches from her own roof
    const p = lensPos(k);
    if (!p) return;
    rose.place("at", { fallback: { x: p.x + 1.1, z: p.z + 0.9, y: p.y } });
  }
  function skyeyeAllowed() {
    return (
      !L.flag("con_hostile") &&
      !L.flag("hale_dead") &&
      (faction() === "continuity" || ms.f("skyeye_room_ok"))
    );
  }
  function useLens(kind) {
    if (at("mq19", "lens")) {
      if (kind === "skyeye" && !skyeyeAllowed()) {
        L.notify(
          'A Continuity sentry puts a gauntlet across the door. "Monitor room. Lieutenant Hale\'s authorisation, citizen. In writing."',
        );
        L.sfx("ui_error");
        return;
      }
      if (
        kind === "rock" &&
        Q.get("li_rock_scope") &&
        !(
          Q.reached("li_rock_scope", "watch") ||
          Q.reached("li_rock_scope", "report") ||
          Q.isComplete("li_rock_scope")
        )
      ) {
        L.notify(
          "The scope's image is a smear of yellow haze. It needs recalibrating first.",
        );
        return;
      }
      setLens(kind);
      return;
    }
    if (at("mq19", "watch") && ms.f("mq19_lens") === kind) startWatch();
  }
  function startWatch() {
    const h = hourNow();
    if (h >= 1.75 && h < 4.5) {
      ms.talk("dlg_ms_mq19_watch", "Liberty Island", "w1");
      return;
    }
    ms.talk("dlg_ms_mq19_watch", "Liberty Island", "wait");
  }
  function watchDone() {
    if (!at("mq19", "watch")) return;
    ms.set("mq19_watch_done");
    ms.set("teague_seen");
    L.setFlag("teague_seen");
    L.xp(60, "Night watch on Liberty");
    Q.setStage("mq19", "report");
  }
  function reportTo() {
    const out = [];
    if (faction() === "covenant" && !L.flag("stroud_dead"))
      out.push("Lancer-Commander Stroud");
    if (!L.flag("hale_dead") && !L.flag("con_hostile"))
      out.push("Lieutenant Hale");
    out.push("or Rocky Delgado, on the air");
    return out.join(", ");
  }
  function reportMarkers() {
    const m = [];
    if (faction() === "covenant" && !L.flag("stroud_dead"))
      m.push({ npc: "cov_stroud", label: "Lancer-Commander Stroud" });
    if (!L.flag("hale_dead") && !L.flag("con_hostile"))
      m.push({ npc: "con_hale", label: "Lieutenant Hale" });
    m.push({ npc: "rc_rocky", label: "Rocky Delgado" });
    m.push(...rose.marker("Rose"));
    return m;
  }
  function teagueReported(who) {
    if (!at("mq19", "report")) return;
    ms.set("teague", "arrested");
    L.setFlag("teague_arrested");
    L.later(3, () =>
      L.news(
        "Harbour gossip, folks: the Continuity hauled one of its own off the Liberty pier this morning. A private, they say, name of Teague. Rumour is he was selling candles. Rumour is the candles were selling him.",
      ),
    );
    Q.complete("mq19");
    if (who) L.xp(30, "Reported the skiff");
  }
  function teagueKept() {
    if (!at("mq19", "report")) return;
    ms.set("teague", "free");
    L.setFlag("teague_free");
    Q.complete("mq19");
  }
  // the lenses (examine spots); the Top of the Rock spot sits beside landmark_interiors' own calibration scope
  // (with landmark_interiors present its own scope interactable does the calibration AND the 02:00 watch: no second spot)
  ms.spot({
    id: "ms_lens_rock",
    label: "Long-Range Scope (night watch)",
    verb: "Look",
    when: () =>
      !rockScopePos() &&
      ((at("mq19", "lens") && pathLens() === "rock") ||
        (at("mq19", "watch") && ms.f("mq19_lens") === "rock")),
    get at() {
      const p = lensPos("rock");
      return p ? { x: p.x, y: p.y, z: p.z } : null;
    },
    use() {
      useLens("rock");
    },
  });
  ms.spot({
    id: "ms_lens_skyeye",
    label: "Sky-Eye Monitor Bank",
    verb: "Watch",
    when: () =>
      at("mq19", "lens") ||
      (at("mq19", "watch") && ms.f("mq19_lens") === "skyeye"),
    get at() {
      const p = lensPos("skyeye");
      return p ? { x: p.x, y: p.y, z: p.z } : null;
    },
    use() {
      useLens("skyeye");
    },
  });
  ms.spot({
    id: "ms_lens_chrysler",
    label: "The Long View (Liberty Island)",
    verb: "Look",
    when: () =>
      at("mq19", "lens") ||
      (at("mq19", "watch") && ms.f("mq19_lens") === "chrysler"),
    get at() {
      const p = lensPos("chrysler");
      return p ? { x: p.x, y: p.y, z: p.z } : null;
    },
    use() {
      useLens("chrysler");
    },
  });
  // the Covenant variant: calibrating the Top of the Rock scope (li_rock_scope) is the lens
  let lensT = 0;
  L.hook("update", function (dt, realDt) {
    lensT -= realDt;
    if (lensT > 0) return;
    lensT = 1.0;
    if (
      at("mq19", "lens") &&
      Q.get("li_rock_scope") &&
      (Q.reached("li_rock_scope", "watch") ||
        Q.reached("li_rock_scope", "report") ||
        Q.isComplete("li_rock_scope"))
    )
      setLens("rock");
    // the Covenant scope's own 02:00 watch (landmark_interiors sets ms_teague_seen): Rose's part of it
    const dlgOpen = () =>
      !!(
        G.dialogue &&
        typeof G.dialogue.isActive === "function" &&
        G.dialogue.isActive()
      );
    if (
      at("mq19", "watch") &&
      ms.f("mq19_li_watch") &&
      !ms.f("mq19_watch_done") &&
      G.time &&
      G.time.elapsed - ms.f("mq19_li_watch") > 8 &&
      !dlgOpen()
    ) {
      // the scene was closed early: finish the watch, Rose tells her part later
      ms.set("mq19_rose_taper_pending");
      watchDone();
    }
    if (
      at("mq19", "watch") &&
      L.flag("ms_teague_seen") &&
      !ms.f("mq19_watch_done") &&
      !ms.f("mq19_li_watch")
    ) {
      ms.set("mq19_li_watch", G.time ? G.time.elapsed || 0.001 : 0.001);
      const p = lensPos(ms.f("mq19_lens"));
      const near =
        p && Math.hypot(G.player.pos.x - p.x, G.player.pos.z - p.z) < 18;
      if (near)
        L.later(2.5, () => {
          if (at("mq19", "watch"))
            ms.talk("dlg_ms_mq19_watch", "Liberty Island", "w2");
        });
      else {
        ms.set("mq19_rose_taper_pending");
        watchDone();
      }
    }
    mq21Poll();
    mq22Poll();
    mq24Poll();
  });

  const lensDesc = () =>
    ({
      rock: "[You put your eye to the Covenant's brass scope. The prisms are true now, and the harbour comes up close enough to touch.]",
      skyeye: ms.f("skyeye_jammed")
        ? "[The monitor bank hums. Static's jamming has blinded most of the net; one drone still circles Liberty on a backup channel, its picture full of snow. The anthem plays very quietly from a speaker nobody can find the switch for.]"
        : '[The monitor bank hums. A drone\'s grey picture of the harbour wobbles on the centre screen: the "PATRIOT" unit, circling Liberty on its night loop. The anthem plays very quietly from a speaker nobody can find the switch for.]',
      chrysler:
        "[You lie flat on the gargoyle's steel neck seventy floors up and put your eye to the long scope bolted there. The whole harbour fits in the glass.]",
    })[ms.f("mq19_lens")] || "[You put your eye to the lens.]";
  const roseVia = () =>
    ms.f("mq19_lens") === "skyeye"
      ? "[Rose, over the VIGIL radio band from her own roof, where she has her own scope on the same water:] "
      : "[Rose has her own scope up beside you. She lowers it.] ";
  ms.dlg("dlg_ms_mq19_watch", "w1").add({
    wait: {
      speaker: "Liberty Island",
      text: () =>
        "It's " +
        clock() +
        ". Liberty Island sits on the water, grey and quiet: a searchlight on the pedestal, the torch dark. The boats move after midnight. The interesting ones move at two.",
      responses: [
        {
          text: "[Wait at the lens until two in the morning.]",
          action: () => {
            waitUntil(1.9, () =>
              ms.talk("dlg_ms_mq19_watch", "Liberty Island", "w1"),
            );
          },
        },
        { text: "[Come back later.]" },
      ],
    },
    w1: {
      speaker: "Liberty Island",
      text: () =>
        lensDesc() +
        "\n\nTwo in the morning. Liberty Island is a black hump on blacker water: searchlights sweeping the star fort, the Rotorcraft pad lit, the torch dark. Then a light low on the water, coming from the Jersey side. A skiff, one candle-lantern in the bow, rowed by a tall man in a hood.",
      responses: [{ text: "[Keep watching.]", next: "w2" }],
    },
    w2: {
      speaker: "Rose",
      text: () =>
        roseVia() +
        "That's Brother Taper's boat. He used to carry me on his shoulders.",
      responses: [
        { text: "[Keep watching.]", next: "w3" },
        { text: "You knew him?", next: "w2b" },
      ],
    },
    w2b: {
      speaker: "Rose",
      text: "Everybody down there knew him. He lit the tunnel lamps. He let me hold the taper. [A pause.] Watch the pier, not me.",
      responses: [{ text: "[Keep watching.]", next: "w3" }],
    },
    w3: {
      speaker: "Liberty Island",
      text: "[On the pier a single Continuity private walks down to meet the skiff alone. No cap, a flashlight he keeps pointed at his boots. The hooded man hands up a bundle wrapped in oilcloth. The private hands down something flat and white: paper. Before the skiff pushes off he touches his collar, and something small and brass catches the lantern light. A sun, with all its rays.]",
      responses: [{ text: "[Keep watching.]", next: "w4" }],
    },
    w4: {
      speaker: "Rose",
      text: () =>
        (ms.f("mq19_lens") === "skyeye" ? "[Over the radio:] " : "") +
        "Teague. Private, gate duty on the pier. He goes to the Dawn Hour on his leave days and thinks nobody notices. [The skiff turns for Jersey.] The Dawn has a man standing next to that key. Of course she does.",
      onEnter() {
        watchDone();
      },
      responses: [
        { text: "Then we report him.", next: "w5" },
        { text: "Then maybe we can use him.", next: "w5" },
        { text: "[Say nothing.]" },
      ],
    },
    w5: {
      speaker: "Rose",
      text: "Report it and they take Teague up the pedestal stairs and he doesn't come down. Keep it quiet and there's a man on Liberty who opens a gate for anybody who knows the word. [She shrugs.] I know the word. Your call.",
      responses: [{ text: "I'll think about it." }],
    },
  });

  // ==================================================================
  // mq20 NUMBERS GAME
  // ==================================================================
  const conKnowsNicole = () =>
    !!(L.flag("ms_con_knows_nicole") || L.flag("con_knows_nicole"));
  function mq20Done() {
    // quests_extra writes the outline names; the finale reads the ms_ names
    if (L.flag("qx_wayte_file_closed") || L.flag("ms_qx_wayte_file_closed"))
      ms.set("wayte_file_closed");
    if (L.flag("qx_pad_kept") || L.flag("ms_qx_pad_kept")) ms.set("pad_kept");
    if (L.flag("skyeye_jammed") && !ms.f("skyeye_jammed"))
      ms.set("skyeye_jammed");
    const note = conKnowsNicole() ? NOTE_NUMBERS_B : NOTE_NUMBERS;
    if (!L.has(NOTE_NUMBERS) && !L.has(NOTE_NUMBERS_B)) {
      L.give(note, 1);
      L.notify(
        "Static tears the decoded name list out of her notebook and folds it into your hand.",
        { duration: 5 },
      );
    }
  }

  // ==================================================================
  // mq21 PURE RECORDS
  // ==================================================================
  function ledgerPos() {
    // "Deposit R-10: Relief Station Ledgers ... see the desk": on desk R-9, beside the microfilm case
    const a = poiAnchor(
      "un_assembly",
      ["records", "tapes", "strongroom"],
      null,
    );
    if (!a) {
      const LI = G._li;
      const t = LI && LI.un && LI.un.anchors && LI.un.anchors.tapes;
      if (t) return { x: t.x + 0.6, y: t.y, z: t.z + 0.2 };
      return null;
    }
    return { x: a.x + 0.6, y: a.y, z: a.z + 0.2 };
  }
  ms.pickup({
    key: "ms_ledger_1968",
    item: NOTE_LEDGER,
    when: () => Q.isActive("mq21") && !ms.f("lock_truth"),
    get at() {
      return ledgerPos();
    },
  });
  /** The microfilm's fate (landmark_interiors writes li_un_tapes_to and, lately, ms_microfilm itself). */
  function syncMicrofilm() {
    const v = L.flag("li_un_tapes_to");
    if (!v) return;
    if (!ms.f("microfilm")) ms.set("microfilm", v);
    if (v === "continuity" && !ms.f("mq21_film_trust")) {
      ms.set("mq21_film_trust");
      ms.addTrust(
        -2,
        "You handed the Continuity the list with her name on it.",
      );
    }
  }
  const keelGone = () =>
    !!(
      ms.f("keel") ||
      L.flag("li_keel_dead") ||
      L.flag("dead_li_keel") ||
      (L.npc("li_keel") && L.npc("li_keel").dead)
    );
  function roseJoinsForKeel() {
    if (keelGone() && !ms.f("keel")) ms.set("keel", "dead");
    if (rose.mode() !== "follow") rose.place("follow");
    if (ms.once("mq21_rose_joins"))
      L.later(1.5, () =>
        rose.say(
          keelGone()
            ? "Keel's dead? [A long breath.] Then it's just the book. Show me."
            : "I said I'd never set foot on their ground. Show me the door. Show me her.",
        ),
      );
  }
  function mq21Poll() {
    if (Q.isStarted("mq21")) syncMicrofilm();
    if (at("mq21", "ledger") && ms.f("lock_truth")) Q.setStage("mq21", "keel");
  }
  G.events.on("noteRead", (id) => {
    if (id === NOTE_LEDGER && !ms.f("lock_truth")) {
      ms.set("lock_truth");
      L.setFlag("lock_truth");
      L.xp(40, "The padlock entry");
      L.later(0.5, () => {
        if (roseNear(18))
          rose.say(
            "Eleven. Behind a padlock. [Very quietly.] Nobody ever told me about the padlock.",
          );
      });
      if (at("mq21", "ledger"))
        L.later(1.5, () => {
          if (at("mq21", "ledger")) Q.setStage("mq21", "keel");
        });
      else refresh("mq21");
    }
    if (id === NOTE_MEMO && !ms.f("memo_read")) {
      ms.set("memo_read");
      if (roseNear(20) && !ms.f("mq22_rose_line")) {
        ms.set("mq22_rose_line");
        L.later(0.6, () =>
          rose.say(
            "That's it. That's what she preaches. A list, and a door, and the people on the wrong side of it.",
            6,
          ),
        );
      }
      if (at("mq22", "memo"))
        L.later(1.2, () => {
          if (at("mq22", "memo")) Q.setStage("mq22", "fate");
        });
    }
  });
  // The confrontation: walking up to Keel with the ledger at stage 'keel' (Rose beside you).
  L.trigger({
    id: "ms_mq21_keel",
    once: false,
    cooldown: 6,
    r: 9,
    pos: () => {
      const a = L.npc("li_keel");
      return a && !a.dead ? a.pos : null;
    },
    cond: () => at("mq21", "keel") && !keelGone() && !ms.f("keel_scene"),
    fire() {
      startKeelScene();
    },
  });
  function startKeelScene() {
    if (!at("mq21", "keel")) return;
    if (keelGone()) {
      ms.talk("dlg_ms_mq21_keel", "Rose", "gone");
      return;
    }
    ms.set("keel_scene");
    L.hostile("li_keel", false);
    ms.talk("dlg_ms_mq21_keel", "Major Keel", "k1");
  }
  function keelOutcome(v) {
    if (ms.f("keel") && ms.f("keel") !== "dead") {
      L.later(0.5, () => {
        if (Q.isActive("mq21")) Q.complete("mq21");
      });
      return;
    }
    ms.set("keel", v);
    if (v === "defects") {
      L.setFlag("keel_defects");
      ms.addTrust(+1, "You helped her forgive.");
      L.xp(80, "Keel will testify");
    }
    if (v === "dead") {
      L.setFlag("keel_dead");
      const a = L.npc("li_keel");
      if (a && !a.dead && a.kill) {
        try {
          a.kill({ silent: true });
        } catch (e) {
          /* */
        }
      }
      L.setFlag("dead_li_keel");
      L.setFlag("li_keel_dead");
    }
    if (v === "spared") L.setFlag("keel_spared");
    L.later(0.5, () => {
      if (Q.isActive("mq21")) Q.complete("mq21");
    });
  }
  ms.dlg("dlg_ms_mq21_keel", "k1").add({
    k1: {
      speaker: "Major Keel",
      text: "[Major Adelaide Keel is alone at the horseshoe table, a cold cup of something at her elbow. She sees the ledger in your hand first. Then she sees Rose: the rifle, the leather cuff, the age. It takes her a second to do the sum.] The Mead child. [Her voice doesn't change.] You lived.",
      responses: [{ text: "[Let Rose speak.]", next: "k2" }],
    },
    k2: {
      speaker: "Rose",
      text: "Eighteenth of February. Mead, Rose, infant, not enrolled, refused. A.K. [She doesn't raise the rifle. She doesn't lower it either.] That's me in your book, Major. And the fifth of March. Eighteen-forty. Padlocked, A.K. Eleven of them.",
      responses: [{ text: "[Wait for Keel.]", next: "k3" }],
    },
    k3: {
      speaker: "Major Keel",
      text: "I followed the list. I locked the door. I have followed it every day since. [She looks at her hands on the table.] Captain Crane kept the key. He went back in for it when the fire reached the counter. Nobody found him until morning. Nobody found any of them until morning.",
      responses: [
        {
          text: "Rose. She has carried that door for twenty-one years. Let her put it down.",
          check: { attr: "presence", value: 6 },
          next: "forgive",
          failNext: "hard",
        },
        { text: "Rose. It's your call.", next: "choice" },
        { text: "[Shoot Major Keel.]", next: "eli_fires" },
        { text: "We're leaving. Live with it, Major.", next: "spared" },
      ],
    },
    hard: {
      speaker: "Rose",
      text: "No. Don't do that. Don't make it sound like a kindness. [The rifle comes up an inch.]",
      responses: [
        { text: "Rose. It's your call.", next: "choice" },
        { text: "[Shoot Major Keel.]", next: "eli_fires" },
        {
          text: "[Put your hand on the barrel.] We're leaving.",
          next: "spared",
        },
      ],
    },
    forgive: {
      speaker: "Rose",
      text: "[A long silence. The rifle goes down an inch at a time until it points at the floor.] ...You'll say it. Out loud, to whoever needs to hear it. The list, the padlock, whose order, whose key. Every word.",
      responses: [{ text: "[Wait for Keel.]", next: "forgive2" }],
    },
    forgive2: {
      speaker: "Major Keel",
      text: "[She stands, slowly, and takes off her cap.] Every word. To anyone. I have been waiting twenty-one years for someone to ask me. [To Rose:] I am sorry. It is not enough. It is what there is.",
      onEnter() {
        keelOutcome("defects");
      },
      responses: [{ text: "[Leave her with it.]" }],
    },
    choice: {
      speaker: "Rose",
      text: "[Rose raises the rifle and puts the post of the sight on Keel's chest. Keel doesn't move. Nobody in the chamber moves.]",
      responses: [
        { text: "[Let her fire.]", next: "rose_fires" },
        {
          text: "[Put your hand on the barrel.] Not like this.",
          next: "spared",
        },
      ],
    },
    rose_fires: {
      speaker: "Rose",
      text: "[One shot. It is very loud under the dome. Keel sits down against the horseshoe table as if she is only tired.] [Rose works the bolt, picks the brass up off the carpet and puts it in her pocket.] That felt like nothing.",
      onEnter() {
        keelOutcome("dead");
      },
      responses: [{ text: "[Say nothing.]" }],
    },
    eli_fires: {
      speaker: "Rose",
      text: "[You fire before Rose can. Keel folds over the horseshoe table and the cold cup goes over with her.] [Rose looks at the body for a long time.] That felt like nothing. [She looks at you.] I thought it would feel like something.",
      onEnter() {
        keelOutcome("dead");
      },
      responses: [{ text: "[Say nothing.]" }],
    },
    spared: {
      speaker: "Rose",
      text: "[Rose lets you push the barrel down.] Fine. Live with it, Major. [At the door, without turning round:] I have.",
      onEnter() {
        keelOutcome("spared");
      },
      responses: [{ text: "[Leave.]" }],
    },
    gone: {
      speaker: "Rose",
      text: "[Rose reads the ledger standing up, both pages, twice. She closes it on her finger.] Keel's dead, and the Captain's been dead since the fire. So it's just the book. [She hands it back.] Keep it. Somebody should have to read it out loud one day.",
      onEnter() {
        if (!ms.f("keel")) ms.set("keel", "dead");
        L.later(0.5, () => {
          if (Q.isActive("mq21")) Q.complete("mq21");
        });
      },
      responses: [{ text: "Somebody will." }],
    },
  });

  // ==================================================================
  // mq22 CONTINUITY OF GOVERNMENT
  // ==================================================================
  function coreSettled() {
    if (!at("mq22", "fate")) return;
    if (!ms.f("core") && Q.isComplete("pf3_cog") && !L.has("pf3_cog_core")) {
      ms.set("core", "given");
      L.setFlag("core_given");
    }
    if (ms.f("core")) Q.complete("mq22");
  }
  function mq22Poll() {
    // the core in hand (with or without Halloran's blessing): read it, then decide
    if (at("mq22", "side") && L.has("pf3_cog_core")) Q.setStage("mq22", "memo");
    if (at("mq22", "memo") && ms.f("memo_read")) Q.setStage("mq22", "fate");
    if (at("mq22", "fate")) coreSettled();
  }
  G.events.on("itemAdded", (id) => {
    if (id === "pf3_cog_core" && Q.isStarted("mq22") && !L.has(NOTE_MEMO)) {
      L.give(NOTE_MEMO, 1, true);
      L.notify(
        "Taped inside the core's document sleeve: a carbon of the last flash traffic filed with it. (NOTES)",
        { duration: 5 },
      );
    }
  });
  function coreMarkers() {
    const m = [];
    if (L.has("pf3_cog_core")) {
      m.push({ npc: "rc_rocky", label: "Rocky Delgado (broadcast)" });
      if (Q.isActive("pf3_cog"))
        m.push({ npc: "pf3_halloran", label: "Lancer Halloran" });
      if (!L.flag("hale_dead") && !L.flag("con_hostile"))
        m.push({ npc: "con_hale", label: "Lieutenant Hale" });
    }
    return m;
  }
  function coreTo(who) {
    if (!L.has("pf3_cog_core")) return;
    L.take("pf3_cog_core", 1);
    if (Q.isActive("pf3_cog")) Q.fail("pf3_cog"); // the Covenant never gets it
    if (who === "rocky") {
      ms.set("core", "broadcast");
      L.setFlag("core_broadcast");
      L.standing(40, "Broadcast the 4 March memo");
      L.later(2, () =>
        L.news(
          "This is Radio Free Manhattan, and I'm going to read you something, and then I'm going to read it again every hour until my tubes melt. Fourth of March, nineteen sixty-seven. Flash traffic. \"Move the rolls and enrolled staff to Liberty tonight. No public notice.\" The day before, folks. They knew the day before.",
        ),
      );
    } else {
      ms.set("core", "given");
      L.setFlag("core_given");
      L.incFlag("hale_doubts", 1);
    }
    L.later(0.5, () => {
      if (at("mq22", "fate")) Q.complete("mq22");
    });
  }

  // ==================================================================
  // mq23 THE WHISPERING GALLERY
  // ==================================================================
  function galleryPos(which) {
    const name = which === "b" ? "whisper_corner_b" : "whisper_corner_a";
    const a = L.anchor("grand_central", [name, "whispering_gallery"], null);
    if (a) return a;
    return L.anchor("grand_central", ["oyster_bar_steps", "bar"], {
      x: 226,
      z: -238,
    });
  }
  function bulkheadPos() {
    // the tunnel side of the hatch (the lair's own 'bulkhead' anchor is on the far side, inside Track 61)
    return (
      L.anchor("grand_central", ["track61_bulkhead"], null) ||
      L.anchor("lair", ["bulkhead_outside", "tunnel_bulkhead"], null) ||
      L.anchor("grand_central", ["lower_stair"], { x: 218.5, z: -243.3 })
    );
  }
  ms.actor({
    id: "ms_taper_gallery",
    removeWhenOff: true,
    when: () =>
      at("mq23", "gallery") || at("mq23", "answer") || at("mq23", "follow"),
    def: () => {
      const p = at("mq23", "follow") ? bulkheadPos() : galleryPos("b");
      return {
        type: "brother_taper",
        name: "Brother Taper",
        gender: "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: false,
        essential: true,
        ai: "guard",
        home: "here",
        homeR: 0.6,
        dialogue: "dlg_ms_taper_gallery",
        noRespawn: true,
        at: {
          fallback: p ? { x: p.x, z: p.z, y: p.y } : { x: 215.5, z: -228 },
          maxR: 3,
        },
        barks: ["Keep the light on.", "...", "A dimanche."],
      };
    },
  });
  L.trigger({
    id: "ms_mq23_whisper",
    once: false,
    cooldown: 6,
    r: 3.2,
    pos: () => galleryPos("a"),
    cond: () =>
      at("mq23", "gallery") &&
      Math.abs(G.player.pos.y - (galleryPos("a") || { y: 0 }).y) < 3,
    fire() {
      L.notify(
        first() +
          ". [The whisper comes out of the tiles beside your ear, from the opposite corner, as close as a mouth.] Ninety days of winter, and then the spring. Turn round, sleeper. Answer me.",
        { duration: 7 },
      );
      Q.setStage("mq23", "answer");
    },
  });
  ms.spot({
    id: "ms_whisper_corner",
    label: "Whisper into the corner",
    verb: "Whisper",
    when: () => at("mq23", "answer") || at("mq23", "follow"),
    get at() {
      const p = galleryPos("a");
      return p ? { x: p.x, y: p.y, z: p.z } : null;
    },
    use() {
      ms.talk(
        "dlg_ms_taper_gallery",
        "Brother Taper",
        at("mq23", "follow") ? "again" : "t1",
      );
    },
  });
  L.trigger({
    id: "ms_mq23_hatch",
    once: false,
    cooldown: 8,
    r: 5,
    pos: () => bulkheadPos(),
    cond: () =>
      at("mq23", "follow") && !ms.f("heard_humming") && !ms.f("mq23_caught"),
    fire() {
      ms.talk("dlg_ms_mq23_hatch", "Track 61 bulkhead", "h1");
    },
  });

  function pactAgree() {
    if (ms.f("dawn_pact")) return;
    ms.set("dawn_pact", "agree");
    L.setFlag("dawn_pact");
    L.give("q_glowkeeper_vestments", 1);
    L.factionTruce("glowkeepers", undefined, undefined, 0, false);
    if (roseNear(25)) {
      ms.set("dawn_pact_known");
      ms.addTrust(-1, "She heard you make a deal with the Dawn.");
    }
  }
  function pactRefuse() {
    if (ms.f("dawn_pact")) return;
    ms.set("dawn_pact", "refuse");
    L.setFlag("dawn_refused");
    ms.addTrust(+1, "You told the Dawn no.");
  }
  function toRose() {
    L.later(1.0, () => {
      if (Q.isActive("mq23") && Q.stage("mq23") !== "rose")
        Q.setStage("mq23", "rose");
    });
  }
  function finishMq23() {
    if (Q.isActive("mq23")) Q.complete("mq23");
  }
  const offer = [
    { text: "Tell her yes. Key B, for the truth about Nicole.", next: "agree" },
    { text: "No. The key goes in the harbour.", next: "refuse" },
  ];
  ms.dlg("dlg_ms_taper_gallery", "t1")
    .when(() => (at("mq23", "follow") ? "again" : null))
    .when(() => (ms.f("dawn_pact") ? "after" : null))
    .add({
      t1: {
        speaker: "Brother Taper",
        text: "[The voice goes on in your ear, though the man who owns it stands in the far corner with his face to the tiles: tall, hooded, a candle-lantern hooked at his belt. Your tunnel watcher from Chambers Street.] You said goodbye in this corner once. She told us. She tells us everything about you, sleeper, the way other people tell about saints.",
        responses: [
          { text: "Who told you?", next: "t_who" },
          { text: "What do you want?", next: "t2" },
        ],
      },
      t_who: {
        speaker: "Brother Taper",
        text: "The Dawn. The one who keeps the light on. You will meet her when the door opens, and not before.",
        responses: [{ text: "What do you want?", next: "t2" }],
      },
      t2: {
        speaker: "Brother Taper",
        text: "There is a key on Liberty Island. European, brass, a navigator's key. The Continuity keep it in a locker and do not know what it opens. Bring it to the Dawn, and the Dawn will give you what you have been asking the whole city for: the truth about Nicole Mead. All of it. Where she went. What became of her.",
        responses: [
          { text: "What does the key open?", next: "t_key" },
          { text: "How would I know the key?", next: "t3" },
        ],
      },
      t_key: {
        speaker: "Brother Taper",
        text: "A door. Every key opens a door. [He turns his hooded head a little, as if listening to something behind the tiles.] That is all I am given to say.",
        responses: [{ text: "How would I know it?", next: "t3" }],
      },
      t3: {
        speaker: "Brother Taper",
        text: "She says you'll know the key when you see it. She says: A dimanche.",
        onEnter() {
          ms.set("mq23_offer_heard");
        },
        responses: offer.concat([
          { text: "I need to think.", next: "t_think" },
        ]),
      },
      t_think: {
        speaker: "Brother Taper",
        text: "Think, then. The light stays on. [He bows to the wall, steps out from under the arch and walks off toward the lower concourse, unhurried, the lantern swinging at his hip.]",
        responses: [
          {
            text: "[Let him go, then follow at a distance.]",
            check: { skill: "stealth", value: 40 },
            next: "follow_ok",
            failNext: "caught",
          },
          { text: "[Let him go.]", next: "leave" },
        ],
      },
      follow_ok: {
        speaker: "Brother Taper",
        text: "[You count ten and go after him, keeping a pillar between you. He never looks back. He goes past the dead clocks and the sealed stair and down, toward the tunnels under the tracks.]",
        onEnter() {
          L.later(0.3, () => {
            if (at("mq23", "answer")) Q.setStage("mq23", "follow");
          });
          L.later(6, () => {
            const p = bulkheadPos();
            if (p)
              L.moveNPC(
                "ms_taper_gallery",
                L.freeSpot(p.x + 1.2, p.z + 1.0, p.y, { maxR: 4 }),
              );
          });
        },
        responses: [{ text: "[Follow.]" }],
      },
      caught: {
        speaker: "Brother Taper",
        text: "[You have gone four steps when the hood turns.] Don't follow me, sleeper. The door is not open for you. Not yet. [He waits, very patient.] Your answer.",
        onEnter() {
          ms.set("mq23_caught");
        },
        responses: offer.concat([{ text: "No answer.", next: "leave" }]),
      },
      leave: {
        speaker: "Brother Taper",
        text: "Then keep the light on, and think. She has waited a long time. She can wait a little longer. [He is gone into the crowd at the foot of the stair.]",
        onEnter() {
          toRose();
        },
        responses: [{ text: "[Go and find Rose.]" }],
      },
      agree: {
        speaker: "Brother Taper",
        text: "[He lets out a breath, as if he has been holding it since 1967.] Then the Dawn will know. When you have it, come to this corner on any night and whisper. Somebody will always be listening. [He holds out a folded bundle of ivory cloth.] For the road. The Brothers will know you by it.",
        onEnter() {
          pactAgree();
          toRose();
        },
        responses: [{ text: "[Take the vestments.]" }],
      },
      refuse: {
        speaker: "Brother Taper",
        text: "[A long pause.] She said you might. She said you always did hate being told where to stand. [He bows to the wall.] The light stays on regardless, sleeper. A dimanche.",
        onEnter() {
          pactRefuse();
          toRose();
        },
        responses: [{ text: "[Let him go.]" }],
      },
      again: {
        speaker: "Brother Taper",
        text: "[A whisper, from somewhere under the stone:] You are not where you were told to stand, sleeper. Answer, and go home.",
        responses: offer.concat([{ text: "No answer.", next: "leave" }]),
      },
      after: {
        speaker: "Brother Taper",
        text: "Keep the light on, sleeper.",
        responses: [{ text: "[Leave.]" }],
      },
    });
  ms.dlg("dlg_ms_mq23_hatch", "h1").add({
    h1: {
      speaker: "Track 61 bulkhead",
      text: '[The bulkhead is a steel hatch in the tunnel wall, painted over so many times the rivets have gone soft. Taper knocks twice, and is let through, and the hatch swings shut behind him. You put your ear to the cold steel.]\n\nSomewhere beyond it, a woman is humming. "Two Bits and a Kiss". Then she reaches the verse that was never on any record, the one that only ever existed in pencil on a paper sleeve, and hums that too, every note of it, slow, the way you would hum a child to sleep. Her voice is low and roughened, an older woman\'s voice. You know that voice. You cannot think from where.',
      onEnter() {
        ms.set("heard_humming");
        L.setFlag("heard_humming");
        L.xp(40, "Two Bits and a Kiss");
      },
      responses: [{ text: "[Listen.]", next: "h2" }],
    },
    h2: {
      speaker: "Track 61 bulkhead",
      text: "[The humming stops in the middle of a bar, as if someone has come into the room. A man's voice, too low to make out. Footsteps. The hatch opens a hand's width and Brother Taper slips back out, and finds you there, and does not seem surprised.]",
      responses: [{ text: "[Face him.]", next: "h3" }],
    },
    h3: {
      speaker: "Brother Taper",
      text: "You followed. She thought you might. [He pulls the hatch shut behind him without looking.] Well, sleeper? Yes, or no.",
      responses: [
        {
          text: "Tell her yes. Key B, for the truth about Nicole.",
          action: () => {
            pactAgree();
            toRose();
          },
          next: "h_yes",
        },
        {
          text: "No. The key goes in the harbour.",
          action: () => {
            pactRefuse();
            toRose();
          },
          next: "h_no",
        },
        { text: "Who was singing?", next: "h_who" },
        { text: "No answer.", action: () => toRose(), next: "h_none" },
      ],
    },
    h_who: {
      speaker: "Brother Taper",
      text: "Nobody you know, sleeper. [He says it gently, the way you would tell a child there is nothing under the bed.] Yes, or no.",
      responses: [
        {
          text: "Yes. Key B, for the truth about Nicole.",
          action: () => {
            pactAgree();
            toRose();
          },
          next: "h_yes",
        },
        {
          text: "No.",
          action: () => {
            pactRefuse();
            toRose();
          },
          next: "h_no",
        },
        { text: "No answer.", action: () => toRose(), next: "h_none" },
      ],
    },
    h_yes: {
      speaker: "Brother Taper",
      text: "Then come to the gallery corner on any night, when you have it, and whisper. [He presses a folded bundle of ivory cloth into your hands.] For the road.",
      responses: [{ text: "[Go back up.]" }],
    },
    h_no: {
      speaker: "Brother Taper",
      text: "She said you always did hate being told where to stand. Go back up, sleeper. Mind the third rail. It is not live, but it remembers.",
      responses: [{ text: "[Go back up.]" }],
    },
    h_none: {
      speaker: "Brother Taper",
      text: "Then go back up and think. The light stays on.",
      responses: [{ text: "[Go back up.]" }],
    },
  });

  // ==================================================================
  // mq24 CROSSING
  // ==================================================================
  const BATTERY_ROSE = {
    site: "battery_park",
    anchors: ["pier", "dock"],
    fallback: { x: -40, z: 985 },
  };
  function routeCrossing() {
    if (!at("mq24", "route")) return;
    const f = faction();
    if (f === "covenant") Q.setStage("mq24", "muster");
    else if (
      f === "continuity" &&
      !L.flag("hale_dead") &&
      !L.flag("con_hostile")
    )
      Q.setStage("mq24", "rotorcraft");
    else Q.setStage("mq24", "shells");
  }
  function placeRoseForCrossing(where) {
    if (
      ms.f("rose_on_liberty") ||
      ms.f("rose_overwatch") ||
      rose.mode() === "follow"
    )
      return;
    if (where === "un") {
      rose.place("at", {
        site: "un_hq",
        anchors: ["plaza", "gate"],
        fallback: { x: 290, z: -300 },
      });
      return;
    }
    rose.place("at", BATTERY_ROSE);
  }
  function placeOverwatch() {
    rose.place("at", BATTERY_ROSE);
  }
  const howForPath = () =>
    faction() === "covenant"
      ? "lancers"
      : Q.stage("mq24") === "rotorcraft"
        ? "rotorcraft"
        : "ferry";
  let pendingHow = null;
  /** Leave for Liberty: Rose decides (or is decided for), then Act IV takes over. */
  function go(how) {
    if (!Q.isActive("mq24")) {
      if (L.ferryToLiberty) L.ferryToLiberty();
      return;
    }
    if (ms.f("rose_on_liberty") || ms.f("rose_overwatch")) {
      depart(how);
      return;
    }
    if (ms.trust() >= 2) {
      pendingHow = how;
      L.later(0.1, () => ms.talk("dlg_ms_mq24_rose", "Rose", "ask"));
      return;
    }
    ms.set("rose_overwatch");
    placeOverwatch();
    rose.say(
      "I'll be on the Battery wall with my scope. If they shoot at you, I'll shoot back. That's the deal.",
      6,
    );
    depart(how);
  }
  function roseComes() {
    ms.set("rose_on_liberty");
    L.setFlag("rose_on_liberty");
    rose.place("follow");
  }
  function roseStays() {
    ms.set("rose_overwatch");
    L.setFlag("rose_overwatch");
    placeOverwatch();
  }
  function depart(how) {
    ms.set("mq24_departed");
    L.later(0.3, () => {
      if (!Q.isActive("mq24")) return;
      const lib = ms.liberty;
      if (lib && typeof lib.arrive === "function") {
        try {
          lib.arrive(how);
          return;
        } catch (e) {
          G.reportError("quests:ms:mq24:arrive", e);
        }
      }
      // fallback: no Act IV hand-off yet
      Q.complete("mq24");
      if (how === "rotorcraft" && L.spots && L.spots.libertyDock) {
        const d = L.spots.libertyDock();
        if (d)
          L.travel(d.x, d.y || 0, d.z, 0, () =>
            L.notify(
              "The Rotorcraft banks low over the harbour and sets you down on Liberty Island in a storm of rotor-wash.",
            ),
          );
      } else if (L.ferryToLiberty) L.ferryToLiberty();
    });
  }
  ms.crossing = { go, depart, routeCrossing };
  ms.dlg("dlg_ms_mq24_rose", "ask").add({
    ask: {
      speaker: "Rose",
      text: () =>
        "[Rose is already there, rifle slung, cuff buckled tight.] You're going. [She checks the bolt without looking at it.] " +
        (pendingHow === "rotorcraft"
          ? "In their machine, on their list. Fine. If anybody checks my wrist, I'm shooting the pilot. "
          : "") +
        "I want to be in the room when they open that locker. I want to see the key with my own eyes before it goes in the water.",
      responses: [
        {
          text: "Come with me.",
          action: () => {
            roseComes();
            depart(pendingHow || howForPath());
          },
          next: "come",
        },
        {
          text: "Stay on the Battery. Cover the landing with your scope.",
          action: () => {
            roseStays();
            depart(pendingHow || howForPath());
          },
          next: "stay",
        },
      ],
    },
    come: {
      speaker: "Rose",
      text: "Good. Don't make a speech about it. [She falls in on your left, half a step behind, where she can see past you.]",
      responses: [{ text: "[Cross.]" }],
    },
    stay: {
      speaker: "Rose",
      text: "[A flicker of something, then nothing.] Fine. I'll be on the wall. If they shoot at you, I'll shoot back. [She is already walking away.] Don't make me watch you drown.",
      responses: [{ text: "[Cross.]" }],
    },
  });
  // the Covenant muster at the Battery pier
  const MUSTER_AT = (dx, dz) => ({
    site: "battery_park",
    anchors: ["ferryman", "pier", "dock"],
    fallback: { x: -124 + dx, z: 960 + dz },
    maxR: 6,
  });
  ms.actor({
    id: "ms_lancer_muster",
    when: () => at("mq24", "muster"),
    def: {
      type: "human",
      name: "Lancer Castillo",
      outfit: "covenant_exo_rig",
      gender: "f",
      faction: "covenant",
      ai: "guard",
      home: "here",
      homeR: 2,
      essential: true,
      level: 10,
      hp: 300,
      weapon: ["gyrojet_carbine", "assault_rifle"],
      dialogue: "dlg_ms_mq24_muster",
      noRespawn: true,
      at: MUSTER_AT(4, 3),
      barks: [
        "Iron keeps.",
        "Boat's loaded, sleeper.",
        "Mind the ferryman. He bites.",
      ],
    },
  });
  ms.actor({
    id: "ms_lancer_muster2",
    when: () => at("mq24", "muster"),
    def: {
      type: "human",
      name: "Lancer-Sergeant Albright",
      outfit: "covenant_exo_rig",
      gender: "m",
      faction: "covenant",
      ai: "guard",
      home: "here",
      homeR: 2,
      essential: true,
      level: 11,
      hp: 320,
      weapon: ["minigun", "belt_fed_mg"],
      dialogue: "dlg_ms_mq24_muster",
      noRespawn: true,
      at: MUSTER_AT(6, -2),
      barks: ["Checking the cannon. Again.", "File THIS, paper-pushers."],
    },
  });
  ms.dlg("dlg_ms_mq24_muster", "hello").add({
    hello: {
      speaker: () => "Lancer Castillo",
      text: () =>
        "The Lancer-Commander's compliments, sleeper. Two squads, one rotary cannon and an old ferryman who has called us every name in the harbour. " +
        (L.flag("stroud_dead")
          ? "We fly the Commander's colours anyway. "
          : "") +
        "Boat's loaded. Say the word.",
      responses: [
        { text: "[Cross to Liberty Island.]", action: () => go("lancers") },
        { text: "Not yet." },
      ],
    },
  });
  // the Rotorcraft: Hale's tree (the boarding moved here from the Act IV file)
  ms.inject("dlg_con_hale", {
    start: () => (at("mq24", "rotorcraft") ? "ms24_rotor" : null),
    nodes: {
      ms24_rotor: {
        text: () =>
          "The Rotorcraft is fuelled and the pilot is only mildly terrified. Liberty Island is ten minutes away. Last chance to change your mind, Mr. " +
          String(L.heroName()).split(" ").pop() +
          "." +
          (L.flag("hale_defects")
            ? " [Lower:] When you land, the Sky-Eye net will have a technical fault. I am told they are very common."
            : ""),
        responses: [
          { text: "Let's go.", action: () => go("rotorcraft") },
          { text: "Not yet." },
        ],
      },
    },
  });
  // Arrived on Liberty without the crossing's own exit (Ossie's plain ferry ride while mq24 ran): settle Rose.
  G.events.on("ferryArrived", (where) => {
    if (
      where !== "liberty" ||
      !Q.isStarted("mq24") ||
      ms.f("rose_on_liberty") ||
      ms.f("rose_overwatch")
    )
      return;
    if (rose.mode() === "follow" && ms.trust() >= 2) roseComes();
    else roseStays();
  });
  function mq24Poll() {
    if (!Q.isActive("mq24")) return;
    // no Hale, no Rotorcraft: Ossie's ferry, then
    if (
      Q.stage("mq24") === "rotorcraft" &&
      (L.flag("hale_dead") || L.flag("con_hostile"))
    ) {
      L.notify(
        "With Lieutenant Hale gone, the Rotorcraft isn't going anywhere. Ossie's ferry, then.",
      );
      Q.setStage("mq24", "shells");
      return;
    }
    // reached Liberty some other way (the Harbor Skiff, swimming): that is the crossing
    if (ms.f("mq24_departed")) return;
    const c = G.LAYOUT && G.LAYOUT.LIBERTY,
      p = G.player && G.player.pos;
    if (
      c &&
      p &&
      Math.hypot(p.x - c.x, p.z - c.z) < (c.r || 60) + 28 &&
      p.x < (G.LAYOUT.INTERIOR_X_MIN || 2500)
    ) {
      if (!ms.f("rose_on_liberty") && !ms.f("rose_overwatch")) {
        if (rose.mode() === "follow" && ms.trust() >= 2) roseComes();
        else roseStays();
      }
      const how = howForPath();
      const lib = ms.liberty;
      if (lib && typeof lib.arrive === "function") {
        try {
          lib.arrive(how);
          return;
        } catch (e) {
          G.reportError("quests:ms:mq24:arrive", e);
        }
      }
      Q.complete("mq24");
    }
  }

  // ==================================================================
  // Injections into existing trees (narrow conditions)
  // ==================================================================
  // ---- Lieutenant Hale: the Sky-Eye room, the skiff report, the archive core ----
  ms.inject("dlg_con_hale", {
    nodes: {
      ms19_skyeye: {
        text: () =>
          faction() === "continuity" ||
          L.flag("hale_knows") ||
          L.flag("hale_defects")
            ? "The Sky-Eye room? [She glances up at the tower.] The drones fly the harbour all night and nobody watches the monitors after midnight. Somebody should. I'll sign you in. Don't touch the anthem switch; there isn't one, and that's the problem."
            : "The monitor room is for cleared personnel, citizen. [She studies you.] Why would a civilian want to watch the harbour at night?",
        onEnter() {
          if (
            faction() === "continuity" ||
            L.flag("hale_knows") ||
            L.flag("hale_defects")
          )
            ms.set("skyeye_room_ok");
          refresh("mq19");
        },
        responses: [
          {
            text: "Because something is moving on Liberty that your Colonel doesn't know about.",
            cond: () => !ms.f("skyeye_room_ok"),
            check: { skill: "persuasion", value: 45 },
            next: "ms19_skyeye_ok",
            failNext: "ms19_skyeye_no",
          },
          {
            text: "Thank you, Lieutenant.",
            cond: () => !!ms.f("skyeye_room_ok"),
          },
          { text: "Never mind.", cond: () => !ms.f("skyeye_room_ok") },
        ],
      },
      ms19_skyeye_ok: {
        text: "[A long look.] If it's moving on Liberty, the Colonel should know about it. Fine. One night. I'll sign the log myself, in triplicate, God help me.",
        onEnter() {
          ms.set("skyeye_room_ok");
          refresh("mq19");
        },
        responses: [{ text: "Thank you." }],
      },
      ms19_skyeye_no: {
        text: "Then the Colonel will hear about it through channels. Good day, citizen. [There are other lenses in this city. The Chrysler crown, for one.]",
        responses: [{ text: "[Leave.]" }],
      },
      ms19_report: {
        text: "[You tell her: two in the morning, a candle-lantern skiff, a private on the pier with a brass sun at his collar.] [Her jaw sets.] Teague. I signed his leave chits. [She is quiet for a moment.] I'll pass it to the Colonel's adjutant. He will be arrested before breakfast. That is what we do.",
        onEnter() {
          teagueReported("hale");
        },
        responses: [{ text: "[Leave.]" }],
      },
      ms22_core: {
        text: "[She reads the carbon in the core's sleeve once, standing very still.] \"Move the rolls and enrolled staff to Liberty tonight. No public notice.\" Fourth of March. [She hands the carbon back and keeps the core.] My mother was on the platform at Track 61 that Sunday. She wasn't on any roll. Somebody decided that the day before. [Quietly.] I am going to find out who.",
        onEnter() {
          coreTo("hale");
        },
        responses: [{ text: "[Leave.]" }],
      },
    },
    add: [
      {
        node: "again",
        responses: [
          {
            text: "I need a long lens on Liberty tonight. The Sky-Eye room.",
            next: "ms19_skyeye",
            cond: () => at("mq19", "lens") && !ms.f("skyeye_room_ok"),
          },
          {
            text: "A skiff met one of your soldiers on the Liberty pier at two in the morning.",
            next: "ms19_report",
            cond: () => at("mq19", "report"),
          },
          {
            text: "[Give her the archive core.] Read what your government knew.",
            next: "ms22_core",
            cond: () => at("mq22", "fate") && L.has("pf3_cog_core"),
          },
        ],
      },
    ],
  });
  // ---- Lancer-Commander Stroud: the skiff report (Covenant) ----
  ms.inject("dlg_cov_stroud", {
    nodes: {
      ms19_report: {
        text: "[You tell him about the skiff.] A Continuity soldier selling to the sun cult on Liberty's own pier. [He turns a brass pin over in his gauntlet.] Then Crane will hear about it from us, through the usual channels. Nothing weakens a garrison like a hanging. Good work, sleeper.",
        onEnter() {
          teagueReported("stroud");
        },
        responses: [{ text: "Hold fast." }],
      },
    },
    add: [
      {
        node: "again",
        responses: [
          {
            text: "We watched Liberty after midnight. A Glowkeeper skiff met a Continuity private on the pier.",
            next: "ms19_report",
            cond: () => at("mq19", "report"),
          },
        ],
      },
    ],
  });
  // ---- Rocky Delgado: the skiff on the air (mq19), the archive core broadcast (mq22) ----
  ms.inject("dlg_rc_rocky", {
    nodes: {
      ms19_report: {
        text: "A Continuity private, two in the morning, a skiff full of candles? [He is already reaching for the microphone.] Pal, the Continuity listens to this station more than they listen to their own. You put it on my air, they'll have that boy in irons by lunch. You sure?",
        responses: [
          { text: "Put it on the air.", action: () => teagueReported("rocky") },
          { text: "Not yet." },
        ],
      },
      ms22_rocky: {
        text: "[Rocky reads the carbon in the core's sleeve, then reads it again with his lips moving.] \"Move the rolls and enrolled staff to Liberty tonight. No public notice.\" The fourth of March. The DAY BEFORE. [He puts it down very carefully, like it might go off.] Leave it with me, pal. I'm going to read this on the air every hour until my tubes melt.",
        onEnter() {
          coreTo("rocky");
        },
        responses: [{ text: "Read it loud, Rocky." }],
      },
    },
    add: [
      {
        node: "again",
        responses: [
          {
            text: "I have a story for you. A skiff, two in the morning, Liberty's pier.",
            next: "ms19_report",
            cond: () => at("mq19", "report"),
          },
          {
            text: "[Give him the archive core.] Put this on the air.",
            next: "ms22_rocky",
            cond: () => at("mq22", "fate") && L.has("pf3_cog_core"),
          },
        ],
      },
    ],
  });
  // ---- Deadeye Dolores: her view (mq19, lone path) ----
  ms.inject("dlg_chr_dolores", {
    nodes: {
      ms19_view: {
        text: "Liberty? [She grins without taking her eye off 42nd Street.] Two in the morning's when the boats move. Smugglers, Continuity relief, the odd fella in a bathrobe with a lantern. Bring a coat, Frosty. It's cold up here, and the gargoyle doesn't share.",
        responses: [{ text: "Thanks, Dolores." }],
      },
    },
    add: [
      {
        node: "again",
        responses: [
          {
            text: "I need your view of Liberty Island tonight.",
            next: "ms19_view",
            cond: () =>
              Q.isActive("mq19") &&
              (Q.stage("mq19") === "lens" || Q.stage("mq19") === "watch"),
          },
        ],
      },
      {
        node: "guard",
        responses: [
          {
            text: "Mind if I borrow your old nest tonight? I need a look at Liberty.",
            next: "ms19_view",
            cond: () =>
              Q.isActive("mq19") &&
              (Q.stage("mq19") === "lens" || Q.stage("mq19") === "watch"),
          },
        ],
      },
    ],
  });
  // ---- Moe: the hooded man in the gallery (mq23) ----
  ms.inject("dlg_gc_moe", {
    nodes: {
      ms23_gallery: {
        text: "Funny you ask. Tall fella in a hood's been standing in the far corner of the Whispering Gallery every night this week, face to the wall like a kid in detention. Doesn't drink. Doesn't buy. Just listens. [He polishes a glass that is already clean.] Asked for you by name, Popsicle. Your first name.",
        responses: [{ text: "Thanks, Moe." }],
      },
    },
    add: [
      {
        node: "bar",
        responses: [
          {
            text: "Anyone been hanging around the Whispering Gallery?",
            next: "ms23_gallery",
            cond: () => at("mq23", "gallery"),
          },
        ],
      },
    ],
  });

  // ==================================================================
  // Rose (dlg_ms_rose): Act III beats
  // ==================================================================
  const RD = ms.dlg("dlg_ms_rose");
  RD.when(() =>
    Q.isActive("mq04") &&
    L.flag("ms_rose_revealed") &&
    !L.flag("ms_mq04_rose_asked")
      ? "mq04_side"
      : null,
  )
    .when(() =>
      Q.isStarted("mq04") &&
      faction() === "continuity" &&
      !ms.f("mq04_con_seen")
        ? "mq04_con"
        : null,
    )
    .when(() =>
      ms.f("mq19_rose_taper_pending") && Q.isStarted("mq19")
        ? "mq19_taper"
        : null,
    )
    .when(() =>
      at("mq19", "report") && !ms.f("mq19_rose_talked") ? "mq19_report" : null,
    )
    .when(() => (at("mq20", "rose") ? "mq20_list" : null))
    .when(() => (at("mq21", "keel") ? "mq21_keel" : null))
    .when(() =>
      ms.f("memo_read") && !ms.f("mq22_rose_line") && Q.isStarted("mq22")
        ? "mq22_memo"
        : null,
    )
    .when(() => (at("mq23", "rose") ? "mq23_after" : null))
    .when(() =>
      Q.isActive("mq24") &&
      !ms.f("rose_on_liberty") &&
      !ms.f("rose_overwatch") &&
      !ms.f("mq24_rose_hello")
        ? "mq24_hello"
        : null,
    );
  // standing options on her idle node while a beat is open
  if (RD.nodes.idle && Array.isArray(RD.nodes.idle.responses)) {
    const r = RD.nodes.idle.responses;
    const i = Math.max(0, r.length - 1);
    r.splice(
      i,
      0,
      {
        text: "Who would you trust to take us across?",
        next: "mq04_side",
        cond: () => Q.isActive("mq04"),
      },
      {
        text: "About the skiff on Liberty's pier...",
        next: "mq19_report",
        cond: () => at("mq19", "report"),
      },
      {
        text: "Before we cross...",
        next: "mq24_hello",
        cond: () =>
          Q.isActive("mq24") &&
          !ms.f("rose_on_liberty") &&
          !ms.f("rose_overwatch"),
      },
    );
  }
  RD.add({
    // ---- mq04 ----
    mq04_side: {
      speaker: "Rose",
      text: "[Rose is cleaning the rifle's scope with the tail of her red neckerchief.] So. Who's taking you across? Stroud has boats and rules. Hale has a Rotorcraft and a list. Ossie has a bucket.",
      onEnter() {
        L.setFlag("ms_mq04_rose_asked");
        refresh("mq04");
      },
      responses: [
        { text: "Who would you trust?", next: "mq04_trust" },
        { text: "What do you know about Lieutenant Hale?", next: "mq04_hale" },
        {
          text: "We go alone. Ossie's bucket.",
          next: "mq04_alone",
          cond: () => !L.flag("mq_faction"),
        },
        { text: "I'll decide." },
      ],
    },
    mq04_trust: {
      speaker: "Rose",
      text: "Not the Continuity. Their list has my name on it, on the empty line. [She doesn't look up.] Stroud I can stand. He tells you to your face he'll take the machine away from you. The Continuity smiles, and files you.",
      responses: [
        { text: "What empty line?", next: "mq04_line" },
        {
          text: "We go alone, then.",
          next: "mq04_alone",
          cond: () => !L.flag("mq_faction"),
        },
        { text: "Understood." },
      ],
    },
    mq04_line: {
      speaker: "Rose",
      text: "Directive 7-A. It leaked last November, through people I don't talk to any more. Everybody not on the 1967 rolls gets sorted onto a schedule. Every kid born since. My line was empty for twenty-one years. [She snaps the lens cap back on.] Now it isn't.",
      responses: [
        { text: "Then we make sure they never run it." },
        { text: "Understood." },
      ],
    },
    mq04_hale: {
      speaker: "Rose",
      text: "Vesper Hale. We grew up a block apart on Tudor Place. She lent me books; I never gave one back. She doesn't know my real name. [A beat.] She believes them. That's the worst thing I can say about her, and it isn't very bad. If anybody over there could be turned, it's her. Play her the right reel.",
      responses: [
        { text: "Who would you trust?", next: "mq04_trust" },
        { text: "Understood." },
      ],
    },
    mq04_alone: {
      speaker: "Rose",
      text: "Then Ossie. He's old, he's cheap, and the shellbacks have eaten four of his boats. Fix his crab problem and he'll take us anywhere. [Almost a smile.] Nobody owns us. I like that.",
      onEnter() {
        if (!L.flag("mq_faction")) L.setFlag("mq_faction", "none");
        if (Q.isActive("mq04")) Q.complete("mq04");
      },
      responses: [{ text: "Nobody owns us." }],
    },
    mq04_con: {
      speaker: "Rose",
      text: "[She doesn't get up.] You signed their paper. [She keeps cleaning the rifle.] Fine. Don't ask me to stand on their helipad, and don't tell me what number they gave you.",
      onEnter() {
        ms.set("mq04_con_seen");
      },
      responses: [
        { text: "Rose...", next: "mq04_con2" },
        { text: "[Leave her be.]" },
      ],
    },
    mq04_con2: {
      speaker: "Rose",
      text: "I know why. You want across, and they've got the fastest boat. [She finally looks at you.] Just remember whose list it is.",
      responses: [{ text: "I will." }],
    },
    // ---- mq19 ----
    mq19_taper: {
      speaker: "Rose",
      text: "[You tell her what the lens showed at two in the morning: the skiff, the candle-lantern, the tall man rowing, the private on the pier.] A tall man in a hood, one lantern in the bow? [She is quiet for a moment.] That's Brother Taper's boat. He used to carry me on his shoulders. [Then, flatter:] And the private is Teague. Gate duty on the pier. He goes to the Dawn Hour on his leave days and thinks nobody notices. The Dawn has a man standing next to that key.",
      onEnter() {
        ms.set("mq19_rose_taper_pending", false);
      },
      responses: [
        {
          text: "What do we do about Teague?",
          next: "mq19_report",
          cond: () => at("mq19", "report"),
        },
        { text: "Understood." },
      ],
    },
    mq19_report: {
      speaker: "Rose",
      text: "You going to tell them about Taper's boat? [She doesn't wait for an answer.] Report it and Teague goes up the pedestal stairs and doesn't come down. Keep it quiet and there's a man on Liberty who opens a gate for anybody who knows the word.",
      onEnter() {
        ms.set("mq19_rose_talked");
      },
      responses: [
        { text: "We keep it quiet.", next: "mq19_quiet" },
        { text: "What's the word?", next: "mq19_word" },
        { text: "I'm going to report it.", next: "mq19_report2" },
      ],
    },
    mq19_word: {
      speaker: "Rose",
      text: 'A dimanche. [She says it like a swear word.] It\'s what they say down there instead of goodbye. "Until Sunday."',
      responses: [
        { text: "We keep it quiet.", next: "mq19_quiet" },
        { text: "I'm going to report it.", next: "mq19_report2" },
      ],
    },
    mq19_quiet: {
      speaker: "Rose",
      text: "Quiet, then. [She taps her temple.] Teague keeps his gate. We keep the word.",
      onEnter() {
        teagueKept();
      },
      responses: [{ text: "We keep the word." }],
    },
    mq19_report2: {
      speaker: "Rose",
      text: "Your call. It always is, with you. [She shrugs.] Hale, or Stroud, or Rocky's microphone. Any of them will do it.",
      responses: [{ text: "Understood." }],
    },
    // ---- mq20 ----
    mq20_list: {
      speaker: "Rose",
      text: () =>
        "[You hold out Static's transcript. Rose takes it without a word. Her eyes go down the column: WAYTE, E.: PRIORITY ASSET. MEAD, N.: STRUCK 1968." +
        (conKnowsNicole()
          ? " MEAD, N.: FILE REOPENED 1989, SLEEPER INQUIRING."
          : "") +
        " Then her own line: MEAD, R.: UNENROLLED, DIRECTIVE 7-A SCHEDULE C (STERILISE).]\n\n[She reads it twice. She folds the paper very small, puts it back in your hand, and says nothing at all.]",
      onEnter() {
        ms.set("rose_read_schedule_c");
      },
      responses: [
        {
          text: "[Say nothing either.]",
          action: () => {
            if (Q.isActive("mq20")) Q.complete("mq20");
          },
        },
        { text: "Rose...", next: "mq20_list2" },
      ],
    },
    mq20_list2: {
      speaker: "Rose",
      text: "[She shakes her head once. Not now. Not ever, maybe. She goes back to her rifle.]",
      onEnter() {
        if (Q.isActive("mq20")) Q.complete("mq20");
      },
      responses: [{ text: "[Leave it.]" }],
    },
    // ---- mq21 ----
    mq21_keel: {
      speaker: "Rose",
      text: () =>
        keelGone()
          ? "[She holds out her hand for the ledger.] Show me."
          : "[She looks at the ledger under your arm, at her own name in someone else's handwriting.] Eighteenth of February. That's me. I said I'd never set foot on their ground. [She slings the rifle.] Show me the door, and show me her.",
      responses: [
        {
          text: "Let's find Major Keel.",
          cond: () => !keelGone(),
          action: () => {
            const a = L.npc("li_keel");
            if (
              !a ||
              (a &&
                !a.dead &&
                Math.hypot(a.pos.x - G.player.pos.x, a.pos.z - G.player.pos.z) <
                  15)
            ) {
              startKeelScene();
              return null;
            }
            rose.place("follow");
            return null;
          },
        },
        {
          text: "[Hand her the ledger.]",
          cond: () => keelGone(),
          action: () => {
            ms.talk("dlg_ms_mq21_keel", "Rose", "gone");
          },
        },
        { text: "Give me a minute." },
      ],
    },
    // ---- mq22 ----
    mq22_memo: {
      speaker: "Rose",
      text: "[You show her the carbon from the archive core. She reads it once.] That's it. That's what she preaches. A list, and a door, and the people on the wrong side of it.",
      onEnter() {
        ms.set("mq22_rose_line");
      },
      responses: [
        { text: "Who preaches it?", next: "mq22_memo2" },
        { text: "[Say nothing.]" },
      ],
    },
    mq22_memo2: {
      speaker: "Rose",
      text: "The Dawn. Every morning at five forty-seven. [She hands the carbon back.] She's not wrong about the list. That's the worst part. She's only wrong about what to do with it.",
      responses: [{ text: "Understood." }],
    },
    // ---- mq23 ----
    mq23_after: {
      speaker: "Rose",
      text: "[She takes one look at your face and knows something happened.] Grand Central. You went to the gallery. Who was it?",
      responses: [
        {
          text: "Brother Taper. He offered me the truth about Nicole, for Key B.",
          next: "mq23_told",
        },
        {
          text: () =>
            "A woman behind the Track 61 bulkhead was humming our song. Mine and Nicole's.",
          cond: () => !!ms.f("heard_humming"),
          next: "mq23_hum",
        },
        { text: "Nobody. An echo.", next: "mq23_lie" },
      ],
    },
    mq23_told: {
      speaker: "Rose",
      text: () =>
        ms.f("dawn_pact") === "agree"
          ? "[Very still.] And you said yes. [She turns the cuff on her wrist, once, all the way round.] You said yes."
          : ms.f("dawn_pact") === "refuse"
            ? "And you told him no. [Something in her shoulders lets go.] Good."
            : "And you didn't answer. [She narrows her eyes.] Don't leave a door like that open.",
      onEnter() {
        if (ms.f("dawn_pact") === "agree" && !ms.f("dawn_pact_known")) {
          ms.set("dawn_pact_known");
          ms.addTrust(-1, "You made a deal with the Dawn.");
        }
      },
      responses: [{ text: "...", next: "mq23_line" }],
    },
    mq23_hum: {
      speaker: "Rose",
      text: "[Rose goes very still. Then she shrugs, a little too late.] Lots of people know that song. It was on the radio for a whole year.",
      responses: [
        {
          text: "Brother Taper offered me the truth about Nicole, for Key B.",
          next: "mq23_told",
        },
        { text: "I suppose.", next: "mq23_line" },
      ],
    },
    mq23_lie: {
      speaker: "Rose",
      text: "[She doesn't believe you, and lets you see she doesn't.]",
      responses: [{ text: "...", next: "mq23_line" }],
    },
    mq23_line: {
      speaker: "Rose",
      text: "They'll say anything. Don't listen.",
      onEnter() {
        L.later(0.5, finishMq23);
      },
      responses: [{ text: "I won't." }],
    },
    // ---- mq24 ----
    mq24_hello: {
      speaker: "Rose",
      text: () =>
        ms.trust() >= 2
          ? "When you go across, I'm going with you. Don't argue. I want to see that key with my own eyes."
          : "I'll be on the Battery wall with my scope when you cross. Somebody has to cover the landing. [She doesn't say: and I don't trust you enough to stand next to you yet. She doesn't have to.]",
      onEnter() {
        ms.set("mq24_rose_hello");
      },
      responses: [{ text: "Understood." }],
    },
  });

  // ==================================================================
  // Test solvers (forced stage walk: the default resolution of every stage)
  // ==================================================================
  ms.solver("mq19", {
    lens() {
      if (!ms.f("mq19_lens")) ms.set("mq19_lens", pathLens());
      Q.setStage("mq19", "watch");
    },
    watch() {
      watchDone();
    },
    report() {
      teagueKept();
    },
  });
  ms.solver("mq20", {
    side() {
      if (Q.get("qx_numbers")) {
        if (!Q.isStarted("qx_numbers")) Q.start("qx_numbers");
        Q.complete("qx_numbers");
      } else {
        mq20Done();
        Q.setStage("mq20", "rose");
      }
    },
    rose() {
      ms.set("rose_read_schedule_c");
      Q.complete("mq20");
    },
  });
  ms.solver("mq21", {
    records() {
      if (Q.get("li_un_records")) {
        if (!Q.isStarted("li_un_records")) Q.start("li_un_records");
        if (!L.flag("li_un_tapes_to")) L.setFlag("li_un_tapes_to", "burned");
        Q.complete("li_un_records");
      } else Q.setStage("mq21", "ledger");
    },
    ledger() {
      if (!L.has(NOTE_LEDGER)) L.give(NOTE_LEDGER, 1, true);
      ms.set("lock_truth");
      L.setFlag("lock_truth");
      Q.setStage("mq21", "keel");
    },
    keel() {
      if (keelGone()) {
        if (!ms.f("keel")) ms.set("keel", "dead");
        Q.complete("mq21");
        return;
      }
      ms.set("keel_scene");
      ms.set("keel", "spared");
      L.setFlag("keel_spared");
      Q.complete("mq21");
    },
  });
  ms.solver("mq22", {
    side() {
      if (Q.get("pf3_cog")) {
        if (!Q.isStarted("pf3_cog")) Q.start("pf3_cog");
        Q.complete("pf3_cog");
      } else Q.setStage("mq22", "memo");
    },
    memo() {
      if (!L.has(NOTE_MEMO)) L.give(NOTE_MEMO, 1, true);
      ms.set("memo_read");
      Q.setStage("mq22", "fate");
    },
    fate() {
      if (!ms.f("core")) {
        ms.set("core", "given");
        L.setFlag("core_given");
      }
      Q.complete("mq22");
    },
  });
  ms.solver("mq23", {
    gallery() {
      Q.setStage("mq23", "answer");
    },
    answer() {
      pactRefuse();
      Q.setStage("mq23", "rose");
    },
    follow() {
      ms.set("heard_humming");
      pactRefuse();
      Q.setStage("mq23", "rose");
    },
    rose() {
      Q.complete("mq23");
    },
  });
  ms.solver("mq24", {
    route() {
      routeCrossing();
    },
    muster() {
      solveCross("lancers");
    },
    rotorcraft() {
      solveCross("rotorcraft");
    },
    shells() {
      if (Q.get("sq_shellshock")) {
        if (!Q.isStarted("sq_shellshock")) Q.start("sq_shellshock");
        Q.complete("sq_shellshock");
      } else Q.setStage("mq24", "ferry");
    },
    ferry() {
      solveCross("ferry");
    },
  });
  function solveCross(how) {
    if (!ms.f("rose_on_liberty") && !ms.f("rose_overwatch")) {
      if (ms.trust() >= 2) roseComes();
      else roseStays();
    }
    const lib = ms.liberty;
    if (lib && typeof lib.arrive === "function") {
      try {
        lib.arrive(how);
      } catch (e) {
        G.reportError("quests:ms:mq24:solver", e);
      }
    }
    if (!Q.isComplete("mq24")) Q.complete("mq24");
  }
})();
