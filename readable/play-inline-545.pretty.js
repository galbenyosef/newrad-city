/* src/arcade/50_quests.js */
/* =====================================================================
 * arcade — 50_quests.js
 * The collections and the cabinets as misc quests (goggles → QUESTS):
 *   · "Keys to the City" — find the sixteen ceremonial gold keys (counter
 *     objective; the nearest missing key is a map marker, door-aware via
 *     quests), then take them to Gracie Mansion and open the Mayor's vault
 *     in the cellar (lock ues_gracie_vault, built by poi_ues). Starts with
 *     the first key or the "THE KEYS COME HOME" flyer (boards on Chambers
 *     Street and in Gracie Mansion's front hall).
 *   · "Souvenirs of the Big Apple" — landmark miniatures, counter, no markers.
 *   · "House Records" — starts at the first cabinet you play; beat the
 *     top score burned into each game's cabinet (Sky Patrol, Catacomb
 *     Crawl, Steelworks). Markers: the nearest cabinet of a game still to
 *     beat. Pays Scrip + XP on completion.
 * Collection rewards stay with the milestones in 00_core.js, so those quests
 * pay nothing twice. Everything is defensive: without the quests module the
 * collections and cabinets work exactly as before.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const AR = G.arcade._;

  const QK = "arc_keys_city",
    QM = "arc_landmark_minis",
    QR = "arc_house_records";
  const FLYER = "arc_note_keys_flyer";
  const RECORD_SCRIP = 300,
    RECORD_XP = 250;
  const NAMES = {
    keys: "Keys to the City",
    minis: "Souvenirs of the Big Apple",
    arcade: "House Records",
  };
  const QID = { keys: QK, minis: QM, arcade: QR };
  const Q = () =>
    G.isStub("quests") || typeof G.quests.define !== "function"
      ? null
      : G.quests;
  let defined = false;

  function define() {
    const q = Q();
    if (!q || defined) return;
    defined = true;
    if (!G.isStub("items") && G.items.define) {
      const list = AR.KEYS.map(
        (k) =>
          "No. " +
          k.no +
          " (" +
          k.year +
          "). " +
          k.who +
          ", " +
          k.title +
          ".\n    " +
          k.kept,
      ).join("\n");
      G.items.define({
        id: FLYER,
        type: "note",
        name: 'Flyer: "The Keys Come Home"',
        title: "THE KEYS COME HOME",
        weight: 0,
        value: 0,
        noLoot: true,
        noSell: true,
        tags: ["note", "collectible"],
        desc: "A cream card in navy and gold from the Office of the Mayor, February 1967. Somebody has pencilled in the margin.",
        text:
          "THE OFFICE OF THE MAYOR requests the pleasure of your company at\n\nTHE KEYS COME HOME\nAn exhibition at Gracie Mansion, Sunday, March 12, 1967, at two o'clock.\n\n" +
          "Since 1954 the City of New York has honored sixteen distinguished friends with its Key. This spring, for one afternoon only, " +
          "each of them has been asked to lend it back, so that all sixteen may be shown together in the house where the city keeps its welcome. " +
          "Couriers from the Office of the Mayor will call for the Keys during the week of March 6.\n\n" +
          "THE REGISTER OF KEYS, AND WHERE EACH WILL BE COLLECTED:\n" +
          list +
          "\n\n" +
          "Francis X. Delahunt, Mayor\n\n" +
          '[In pencil, along the margin: "Sixteen bits, sixteen locks. F. says the cellar door under the Mansion opens for all of them or for none of them. ' +
          'Do NOT tell the Board of Estimate."]',
      });
    }
    q.define({
      id: QK,
      name: NAMES.keys,
      category: "side",
      giver: 'Flyer: "The Keys Come Home"',
      location: "Manhattan; Gracie Mansion",
      desc:
        "Between 1954 and 1967 the Mayors of New York gave sixteen ceremonial Keys to the City to visiting dignitaries. Mayor Francis X. Delahunt " +
        "had every one of them cut with a working bit, and built a vault under Gracie Mansion with sixteen locks to match. In February 1967 he called the " +
        "keys home for an exhibition. The couriers never made their rounds. The keys are still where their owners left them.",
      stages: [
        {
          id: "collect",
          text: () =>
            "Recover the ceremonial Keys to the City (" +
            AR.STATE.keys.size +
            "/" +
            AR.KEYS.length +
            ")",
          markers: () => keyMarker(),
        },
        {
          id: "vault",
          text: "Take the Keys to the City to Gracie Mansion and open the Mayor's vault in the cellar.",
          markers: () => vaultMarker(),
        },
      ],
      rewards: { xp: 750 },
      onComplete() {
        try {
          G.notify("The Mayor's vault is open. The keys have come home.", {
            icon: "check",
            sub: NAMES.keys,
          });
        } catch (e) {
          /* hud */
        }
      },
    });
    q.define({
      id: QM,
      name: NAMES.minis,
      giver: "Landmark miniature",
      location: "Manhattan",
      desc:
        "Before the bombs every street vendor near a landmark sold die-cast miniatures to the tourists. A few survived, still " +
        "sitting on abandoned souvenir carts. Collectors in the city will pay handsomely for a complete set of eight.",
      stages: [
        {
          id: "collect",
          text: () =>
            "Collect the New York landmark miniatures (" +
            AR.STATE.minis.size +
            "/" +
            AR.MINIS.length +
            ")",
        },
      ],
      rewards: {},
    });
    q.define({
      id: QR,
      name: NAMES.arcade,
      giver: "Arcade cabinet",
      location: "Manhattan",
      desc:
        "A few arcade cabinets from before the bombs still light up. Each one remembers the best scores of 1967: initials " +
        "of people who played the Saturday night away, went home to bed, and never got their Sunday. Somebody ought to put a new name at the top.",
      stages: [
        {
          id: "records",
          text: () => recordsText(),
          markers: () => cabinetMarker(),
        },
      ],
      rewards: {},
      onComplete() {
        AR.addScrip(RECORD_SCRIP);
        AR.addXP(RECORD_XP, "Quest: " + NAMES.arcade);
        AR.notify("Every cabinet in the city has your initials on top.", {
          icon: "check",
          sub: NAMES.arcade + ": +" + RECORD_SCRIP + " Scrip",
        });
      },
    });
  }

  function recordsText() {
    const left = AR.GAME_DEFS.filter((g) => !AR.STATE.records.has(g.id)).map(
      (g) => AR.titleCase(g.title) + " (" + AR.houseRecord(g.id) + ")",
    );
    return (
      "Beat the house record on every arcade game (" +
      AR.STATE.records.size +
      "/" +
      AR.GAME_DEFS.length +
      ")" +
      (left.length ? ": " + left.join(", ") : "")
    );
  }

  /** The nearest missing key (its real spot: the quest engine routes the marker through doors). */
  function keyMarker() {
    if (!AR.world || !AR.world.nearestKeyEntry) return [];
    const e = AR.world.nearestKeyEntry();
    if (!e) return [];
    return [
      {
        x: e.x,
        z: e.z,
        y: e.y + 1,
        label: "Key to the City No. " + (e.def ? e.def.no : "?"),
        interior: !!e.interior,
      },
    ];
  }
  /** The vault door in Gracie Mansion's cellar (poi_ues anchor), else the Mansion's front door. */
  function vaultMarker() {
    let a = null;
    try {
      if (G.pois && typeof G.pois.getAnchor === "function")
        a = G.pois.getAnchor("gracie_mansion", "vault_door");
    } catch (e) {
      a = null;
    }
    if (a)
      return [
        {
          x: a.x,
          z: a.z,
          y: a.y + 1,
          label: "The Mayor's Vault",
          interior: true,
        },
      ];
    const h = AR.keyHint({ site: "gracie_mansion" });
    return [{ x: h.x, z: h.z, label: "Gracie Mansion" }];
  }
  const has = (id) => {
    try {
      return !G.isStub("inventory") && G.inventory.count(id) > 0;
    } catch (e) {
      return false;
    }
  };
  /** Has the hunt been picked up (flyer read / first key)? The flyer boards stop offering a copy then. */
  function flyerTaken() {
    const q = Q();
    try {
      return has(FLYER) || (!!q && q.isStarted(QK));
    } catch (e) {
      return has(FLYER);
    }
  }
  function takeFlyer() {
    define();
    if (!has(FLYER)) AR.addItem(FLYER, 1, false);
    AR.notify('Flyer: "The Keys Come Home"', {
      icon: "note",
      sub: "Sixteen Keys to the City. Press K for the Mayor's register.",
    });
    sync("key");
  }
  /** The nearest cabinet of each game whose house record still stands. */
  function cabinetMarker() {
    if (!AR.world || !AR.world.nearestCabinet) return [];
    const out = [];
    for (const g of AR.GAME_DEFS) {
      if (AR.STATE.records.has(g.id)) continue;
      const e = AR.world.nearestCabinet(g.id);
      if (e)
        out.push({
          x: e.x,
          z: e.z,
          y: e.y + 1.2,
          label: AR.titleCase(g.title) + " cabinet",
        });
    }
    return out;
  }

  /** Start / advance / complete the quests to match the collection state. */
  function sync(kind) {
    const q = Q();
    if (!q) return;
    define();
    const S = AR.STATE;
    try {
      if (!kind || kind === "key") {
        const n = S.keys.size,
          open = AR.vaultOpen();
        if (
          (n > 0 || has(FLYER) || open || has(AR.ITEM_KEYRING)) &&
          !q.isStarted(QK)
        )
          q.start(QK);
        if (q.isActive(QK)) {
          if (open) q.complete(QK);
          else if (
            (n >= AR.KEYS.length || has(AR.ITEM_KEYRING)) &&
            q.stage(QK) !== "vault"
          )
            q.setStage(QK, "vault");
        }
      }
      if (!kind || kind === "mini") {
        const n = S.minis.size;
        if (n > 0 && !q.isStarted(QM)) q.start(QM);
        if (q.isActive(QM) && n >= AR.MINIS.length) q.complete(QM);
      }
      if (!kind || kind === "arcade") {
        const played =
          S.cabinets.size > 0 ||
          Object.keys(S.plays).some((k) => S.plays[k] > 0);
        if (played && !q.isStarted(QR)) q.start(QR);
        if (q.isActive(QR) && AR.GAME_DEFS.every((g) => S.records.has(g.id)))
          q.complete(QR);
      }
    } catch (e) {
      G.reportError("arcade:quests", e);
    }
  }

  AR.quests = {
    define,
    sync,
    KEYS: QK,
    MINIS: QM,
    RECORDS: QR,
    FLYER,
    name: (kind) => NAMES[kind] || "",
    /** Is the collection's quest running (its final milestone is then presented by the quest completion)? */
    active: (kind) => {
      const q = Q();
      if (!q || !QID[kind]) return false;
      try {
        return q.isActive(QID[kind]);
      } catch (e) {
        return false;
      }
    },
    status: (kind) => {
      const q = Q();
      if (!q || !QID[kind]) return null;
      try {
        return q.isComplete(QID[kind])
          ? "COMPLETED"
          : q.isActive(QID[kind])
            ? "ACTIVE"
            : null;
      } catch (e) {
        return null;
      }
    },
    keyMarker,
    vaultMarker,
    cabinetMarker,
    flyerTaken,
    takeFlyer,
  };

  G.events.on("initDone", define);
  G.events.on("arcadeCollected", (kind) => {
    if (kind === "key" || kind === "mini") sync(kind);
  });
  G.events.on("lockOpened", (id) => {
    if (id === AR.VAULT_LOCK) sync("key");
  });
  G.events.on("arcadeCabinetFound", () => sync("arcade"));
  G.events.on("arcadeRecord", () => sync("arcade"));
  G.events.on("loaded", () => setTimeout(() => sync(), 0));
})();
