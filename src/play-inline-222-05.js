// play-inline-222 05 — def
// Lines 986-1141 of readable/play-inline-222.pretty.js (statement-aligned).
  function defineQuests() {
    const q = Q();
    if (!q || !q.define) return;
    const D = (def) => PH.safe("quest " + def.id, () => q.define(def));
    const ellisDesk = () => {
      const a = posOf("ph_augustine");
      if (a) return [Object.assign(a, { label: "Registrar Augustine" })];
      const v = A("ellis_island", "registrar");
      return v
        ? [{ x: v.x, z: v.z, y: v.y, label: "Registrar Augustine" }]
        : [];
    };
    D({
      id: "ph_q_huddled",
      name: "Huddled Masses",
      giver: "Registrar Augustine Vell",
      location: "Ellis Island",
      desc: "The Navy Yard Pirates seized The Registry's supply skiff and its pilot, Nadia Osei. Registrar Augustine Vell wants her brought home from the pirate battleship USS Hudson.",
      stages: [
        {
          id: "board",
          text: "Find Nadia Osei aboard the USS Hudson in the Brooklyn Navy Yard drydock.",
          markers: () => {
            const v = A("uss_hudson", "captive");
            return v
              ? [{ x: v.x, z: v.z, y: v.y, label: "USS Hudson — Brig" }]
              : [];
          },
        },
        {
          id: "hm_commodore",
          text: "(Optional) Deal with Commodore Hatch on the Hudson's bridge.",
          sideObjective: true,
          optional: true,
          showIf: () => !PH.flag("commodore_dead") && !qDone("ph_q_huddled"),
          doneIf: () => !!PH.flag("commodore_dead"),
          markers: () => {
            const v = A("uss_hudson", "boss");
            return v
              ? [{ x: v.x, z: v.z, y: v.y, label: "Commodore Hatch" }]
              : [];
          },
        },
        {
          id: "return",
          text: "Nadia is free. Return to Registrar Augustine at Ellis Island.",
          markers: ellisDesk,
        },
      ],
      rewards: { xp: 350, scrip: 150, standing: 40 },
    });
    D({
      id: "ph_q_sugar",
      name: "Sugar Rush",
      giver: "Doc Minh Tran",
      location: "Brooklyn Sugar Works",
      desc: "Doc Tran of The Registry needs uncontaminated old-world cane sugar to keep her ageing, radiation-sick patients from losing their minds and turning Maniac. A sealed \"Founder's Reserve\" should still be in the Brooklyn Sugar Works' Quality Control lab — now a brute den.",
      stages: [
        {
          id: "find",
          text: "Recover the Pure Cane Reserve from the Brooklyn Sugar Works' Quality Control lab.",
          markers: () => {
            const v = A("domino_sugar", "qc_crate");
            return v
              ? [{ x: v.x, z: v.z, y: v.y, label: "Pure Cane Reserve" }]
              : [];
          },
        },
        {
          id: "sr_key",
          text: "(Optional) Take the QC lab key from Sweet Tooth.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !PH.hasItem("ph_sugar_crate") && !PH.flag("domino_qc_open"),
          doneIf: () =>
            PH.hasItem("ph_key_domino_qc") || !!PH.flag("domino_qc_open"),
          markers: () => {
            const p = posOf("ph_sweet_tooth") || A("domino_sugar", "boss");
            return p ? [{ x: p.x, z: p.z, y: p.y, label: "Sweet Tooth" }] : [];
          },
        },
        {
          id: "return",
          text: "Bring the Pure Cane Reserve to Doc Tran at Ellis Island.",
          markers: () => {
            const a = posOf("ph_doc_tran") || A("ellis_island", "doctor");
            return a ? [{ x: a.x, z: a.z, y: a.y, label: "Doc Tran" }] : [];
          },
        },
      ],
      rewards: {
        xp: 300,
        scrip: 120,
        items: [
          [PH.item("rally_tonic_extra", "rally_tonic") || "rally_tonic", 2],
        ],
      },
    });
    D({
      id: "ph_q_quarantine",
      name: "Quarantine",
      giver: "Registrar Augustine Vell",
      location: "Ellis Island",
      desc: "Three Registry residents lost their minds to radiation sickness and were barricaded into Dormitory C above the Great Hall. The Registrar asks for a merciful end.",
      stages: [
        {
          id: "clear",
          text: "Clear the Maniacs from the quarantine ward (Dormitory C).",
          markers: () => {
            const v = A("ellis_island", "quarantine");
            return v
              ? [{ x: v.x, z: v.z, y: v.y, label: "Quarantine Ward" }]
              : [];
          },
        },
        {
          id: "report",
          text: "Tell Registrar Augustine the ward is clear.",
          markers: ellisDesk,
        },
      ],
      rewards: {
        xp: 150,
        scrip: 75,
        items: [[PH.item("ammo_10mm") || "scrip", 24]],
      },
    });
  }

  // =====================================================================
  // NPCs (spawned per game, deferred one frame after newGame / load)
  // =====================================================================
  const OUT = (poi, name, dx, dz) => {
    const v = A(poi, name);
    return v
      ? { x: v.x + (dx || 0), y: v.y, z: v.z + (dz || 0), yaw: v.yaw || 0 }
      : null;
  };
  function spawn(def) {
    if (G.isStub("actors") || !G.actors.spawn) return null;
    const ex = actor(def.id);
    if (ex && !ex.removed && !ex._removed) return ex;
    if (!def.pos) return null;
    const d = Object.assign({}, def);
    if (d.merchant && d.merchant.stock)
      d.merchant = Object.assign({}, d.merchant, {
        stock: stock(d.merchant.stock),
      });
    if (d.inventory) d.inventory = stock(d.inventory);
    if (d.weapon && !PH.itemExists(d.weapon)) delete d.weapon;
    const a = PH.safe("spawn " + def.id, () => G.actors.spawn(d));
    if (a && def.pos.yaw !== undefined) a.yaw = def.pos.yaw;
    return a;
  }
  const home = (p, r) => (p ? { x: p.x, z: p.z, r: r || 3 } : undefined);
