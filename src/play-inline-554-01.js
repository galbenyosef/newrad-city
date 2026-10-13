// play-inline-554 01 — locks
// Lines 15-115 of readable/play-inline-554.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const hero = () =>
    L.heroName ? L.heroName() : (G.HERO && G.HERO.name) || "Eli Wayte";
  const mister = () => "Mr. " + String(hero()).split(" ").pop();

  const ROCK = { x: 80, z: -320 },
    UN = { x: 313, z: -320 },
    ESB = { x: 80, z: -72 },
    NYPL = { x: 80, z: -162 };
  const faction = () => L.flag("mq_faction") || null; // 'covenant' | 'continuity' | 'none'

  // Faction, outfit and item ids used below.
  const SH = {
    conFaction: "continuity",
    covFaction: "covenant",
    bruteFaction: "brutes",
    conRig: "continuity_exo_rig",
    covRig: "covenant_exo_rig",
    bruteKing: "colossus",
    tonic: "rally_tonic",
    gyroRounds: "ammo_gyrojet",
    batteries: "ammo_dry_cell",
    gyroCarbine: "gyrojet_carbine",
    gyroPistol: "gyrojet_pistol",
  };
  const STOCK_COV = [
    [SH.gyroPistol, 1],
    [SH.gyroCarbine, 1],
    [SH.gyroRounds, 60],
    [SH.batteries, 10],
    [SH.tonic, 4],
    ["frag_grenade", 3],
    ["combat_armor", 1],
    ["prussian_blue", 2],
    ["ammo_556", 60],
  ];

  // ------------------------------------------------------------------
  // Locks (G.locks, guarded)
  // ------------------------------------------------------------------
  const LOCKS = {
    cov: {
      id: "q_cov_rock_terminal",
      label: "Rockefeller Hold Chronicle Teletype",
      kind: "terminal",
      passcode: "EXCELSIOR",
      hint: "Archivist Wexler knows it; Stroud picked the state motto.",
      learnedFrom: ["Archivist Wexler (Rockefeller Center)"],
    },
    un: {
      id: "q_un_command",
      label: "Continuity Forward Command Teletype",
      kind: "terminal",
      passcode: "TRIPLICATE",
      hint: "Every Continuity passcode was issued by Requisitions. Specialist Ortiz writes his down.",
      learnedFrom: [
        "Lieutenant Hale (UN Plaza)",
        "Ortiz's blotter note (UN Plaza)",
      ],
    },
    esb: {
      id: "q_esb_observatory",
      label: "Empire State Observatory Relay",
      kind: "terminal",
      passcode: "KONGISKING",
      hint: "KONG tells the talking box a secret word. Loudly.",
      learnedFrom: ["KONG (Empire State)", "Pete Ruiz (Empire State)"],
    },
  };
  function learn(id) {
    if (G.locks && G.locks.learn) {
      try {
        G.locks.learn(id);
      } catch (e) {
        /* */
      }
    }
  }
  function registerLocks() {
    if (G.locks && G.locks.register)
      for (const k in LOCKS) {
        try {
          G.locks.register(LOCKS[k]);
        } catch (e) {
          /* */
        }
      }
  }
  const termLock = (s) => ({ id: s.id, passcode: s.passcode });

  /** The Continuity stops treating you as a guest everywhere. */
  function setConHostile() {
    L.setFlag("con_hostile");
  }

  // ------------------------------------------------------------------
  // Quests
  // ------------------------------------------------------------------
