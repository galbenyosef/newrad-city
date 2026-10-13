// play-inline-573 01 — three
// Lines 26-69 of readable/play-inline-573.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  let FLAGS = {};
  const HOOKS = {
    items: [],
    quests: [],
    register: [],
    world: [],
    spawn: [],
    update: [],
    always: [],
    reset: [],
    loaded: [],
  };
  const DIALOGUES = new Map();
  const TERMINALS = new Map();
  const TRIGGERS = [];
  const LATER = [];
  const SESSION = []; // session-scoped handles (interactables / pickups) removed on reset
  let worldBuilt = false;
  let gen = 0;

  function safe(where, fn) {
    try {
      return fn();
    } catch (e) {
      G.reportError("quests_extra:" + where, e);
      return undefined;
    }
  }
  const live = (ns) => !!G[ns] && !G.isStub(ns);
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const IXM = () => (G.LAYOUT ? G.LAYOUT.INTERIOR_X_MIN : 2500);
  // Shared ids still owned by other modules (rpg / sound).
  const SCRIP = "scrip";
  const MONEY = "scrip",
    ADD_MONEY = "addScrip",
    PICKUP_MONEY_SFX = "pickup_scrip";

