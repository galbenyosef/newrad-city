/* src/poi_harbor/82_ellis_yard.js */
/* =====================================================================
 * POI_HARBOR — Ellis Island yard life: the Registry's farmer and water
 * seller working the new grounds behind the building (11_ellis_grounds).
 *   Bess Ahearn  — farmer (potatoes & gnarlberry, a little gossip,
 *                    a small favour: 3 dirty water → a Potato basket)
 *   "Pumps" Eze — runs the water tower (sells purified water)
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._pharbor) return;
  const PH = G._pharbor;
  const actor = (id) => {
    try {
      return G.isStub("actors") ? null : G.actors.get(id);
    } catch (e) {
      return null;
    }
  };
  const stock = (list) => list.filter((e) => PH.itemExists(e[0]));
  const count = (id) => {
    try {
      return G.isStub("inventory") ? 0 : G.inventory.count(id);
    } catch (e) {
      return 0;
    }
  };

  function defineContent() {
    if (!G.isStub("items") && G.items.define) {
      PH.safe("item ph_tato", () =>
        G.items.define({
          id: "ph_tato",
          name: "Potato",
          weight: 0.3,
          value: 6,
          tags: ["food", "forage"],
          mesh: "gnarlberry",
          sound: "eat",
          effects: { hpOverTime: [8, 4], rads: 1 },
          desc: 'A lumpy, purple-veined tuber with a tomato\'s ambitions. Grown behind the Registry by Bess Ahearn, who will tell you it tastes "fine."',
        }),
      );
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    PH.safe("dlg hattie", () =>
      G.dialogue.register("ph_dlg_hattie", {
        start: () => (PH.flag("hattie_water_done") ? "hello2" : "hello"),
        nodes: {
          hello: {
            speaker: "Bess Ahearn",
            text: "Mind the rows, stranger! Those are potatoes. Every one of 'em I know by name. That one's Gerald. Don't step on Gerald.",
            responses: [
              { text: "You grow food out here?", next: "grow" },
              { text: "Anything for sale?", barter: true },
              { text: "Need a hand with anything?", next: "favor" },
              { text: "I'll leave you to it." },
            ],
          },
          hello2: {
            speaker: "Bess Ahearn",
            text: "My water-bringer! Gerald's never looked better. Well. He's a potato. But he's a GLOSSY potato.",
            responses: [
              { text: "Anything for sale?", barter: true },
              { text: "How's the island?", next: "gossip" },
              { text: "See you, Bess." },
            ],
          },
          grow: {
            text: "Lawn used to be for tourists to eat hot dogs on. I dug it up in '72, the first spring the ash let anything grow. Soil's half ash, but I've got nothing but time. Gnarlberry on the left, potatoes on the right, and the glasshouse for the fussy ones.",
            responses: [
              { text: "Anything for sale?", barter: true },
              { text: "What's the news on the island?", next: "gossip" },
              { text: "Good luck with the harvest." },
            ],
          },
          gossip: {
            text: "Pumps says the tower's leaking again. Sal says someone's coming back for trunk eighteen ninety-two. And the Powerhouse chimney — somebody's been burning something in it at night. Not me. I'd have said.",
            responses: [
              {
                text: "Need a hand with anything?",
                next: "favor",
                cond: () => !PH.flag("hattie_water_done"),
              },
              { text: "Take care, Bess." },
            ],
          },
          favor: {
            text: "The tower water's for drinking — Pumps counts every cup. The garden drinks whatever's left, and that's nothing. Bring me three bottles of dirty water, any dirty water, and I'll pack you a basket. Rads? Potatoes LOVE rads.",
            responses: [
              {
                text: "[Give 3 Dirty Water] Here you go.",
                cond: () => count("dirty_water") >= 3,
                next: "thanks",
                action: () => {
                  PH.take("dirty_water", 3);
                  PH.setFlag("hattie_water_done");
                  PH.give(PH.item("ph_tato") || "gnarlberry", 4);
                  PH.give("gnarlberry", 2);
                  PH.xp(40, "Watered the Registry garden");
                  PH.standing(5);
                },
              },
              { text: "I'll keep an eye out." },
            ],
          },
          thanks: {
            text: "Look at 'em drink! Here — four potatoes and two gnarlberry. Don't eat 'em all in one sitting. Or do. You're not my patient.",
            responses: [{ text: "Thanks, Bess." }],
          },
        },
      }),
    );
    PH.safe("dlg pumps", () =>
      G.dialogue.register("ph_dlg_pumps", {
        start: "hello",
        nodes: {
          hello: {
            speaker: '"Pumps" Eze',
            text: "Two scrip a cup, ten a bottle, and don't lean on the ladder — the ladder is load-bearing. Everything on this tower is load-bearing. Including me.",
            responses: [
              { text: "I'll take some water.", barter: true },
              { text: "Where does the water come from?", next: "src" },
              { text: "Never mind." },
            ],
          },
          src: {
            text: "Rain on the Registry roof, down the gutters, through three filters I built from gas masks, into the tank. The Doc tests it every Sunday. I test it every morning. By drinking it. Still here.",
            responses: [
              { text: "I'll take some water.", barter: true },
              { text: "Bye." },
            ],
          },
        },
      }),
    );
  }

  function spawnYard() {
    if (G.isStub("actors") || !G.actors.spawn) return;
    const townsfolk = { type: "human", faction: "settlers", hostile: false };
    const at = (name, dx, dz) => {
      const v = PH.getAnchor("ellis_island", name);
      return v
        ? { x: v.x + (dx || 0), y: v.y, z: v.z + (dz || 0), yaw: v.yaw || 0 }
        : null;
    };
    const sp = (def) => {
      const ex = actor(def.id);
      if (ex && !ex.removed && !ex._removed) return;
      if (!def.pos) return;
      const d = Object.assign({}, def);
      if (d.merchant)
        d.merchant = Object.assign({}, d.merchant, {
          stock: stock(d.merchant.stock),
        });
      const a = PH.safe("spawn " + def.id, () => G.actors.spawn(d));
      if (a && def.pos.yaw !== undefined) a.yaw = def.pos.yaw;
    };
    const fp = at("farm", 0, 1.6),
      wp = at("water_tower");
    if (fp)
      sp(
        Object.assign({}, townsfolk, {
          id: "ph_hattie",
          name: "Bess Ahearn",
          outfit: "settler",
          gender: "f",
          pos: fp,
          ai: "wander",
          home: { x: fp.x, z: fp.z + 5, r: 5 },
          essential: true,
          dialogue: "ph_dlg_hattie",
          level: 4,
          merchant: {
            scrip: 90,
            restock: 2,
            stock: [
              ["ph_tato", 6],
              ["gnarlberry", 4],
              ["dirty_water", 3],
            ],
          },
          barks: [
            "Morning, Gerald.",
            "Grow, you lumpy little miracles.",
            "Mind the rows!",
          ],
        }),
      );
    if (wp)
      sp(
        Object.assign({}, townsfolk, {
          id: "ph_pumps",
          name: '"Pumps" Eze',
          outfit: "survivor_layers",
          gender: "m",
          pos: wp,
          ai: "merchant",
          home: { x: wp.x, z: wp.z, r: 2 },
          essential: true,
          dialogue: "ph_dlg_pumps",
          level: 5,
          merchant: {
            scrip: 120,
            restock: 2,
            stock: [
              ["purified_water", 8],
              ["dirty_water", 6],
              ["fizzo_cola", 1],
            ],
          },
          barks: ["Water! Clean-ish water!", "Tower's holding. Probably."],
        }),
      );
  }

  let pending = false;
  PH.onReady.push(defineContent);
  PH.onNewGame.push(() => {
    pending = true;
  });
  PH.onLoaded.push(() => {
    pending = true;
  });
  PH.updaters.push(function () {
    if (!pending) return;
    if (
      G.state === "play" ||
      G.state === "loading" ||
      (G.worldRunning && G.worldRunning())
    ) {
      pending = false;
      PH.safe("spawnYard", spawnYard);
    }
  });
})();
