// play-inline-299 05 — label
// Lines 901-1015 of readable/play-inline-299.pretty.js (statement-aligned).
  PM.quest({
    id: "pm2_q_critic",
    name: "Everyone's a Critic",
    giver: "Aldous Penrose",
    location: "The Algonquin Hotel",
    desc: 'Aldous Penrose, an old painter at the Algonquin\'s Round Table, wants his 1966 painting "Nocturne for a Dying City" back from the Museum of Modern Art — now home to Brute "art critics".',
    stages: [
      {
        id: "retrieve",
        text: 'Recover "Nocturne for a Dying City" from the Museum of Modern Art.',
        markers: () => {
          const a = PM.anchorOf("moma", "nocturne");
          const e = PM.anchorOf("moma", "exterior_entrance");
          return [
            e ? { x: e.x, z: e.z, label: "Museum of Modern Art" } : null,
            a
              ? {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Collection Storage",
                  interior: "moma",
                }
              : null,
          ].filter(Boolean);
        },
      },
      {
        id: "return",
        text: "Bring the painting to Aldous Penrose at the Algonquin.",
        markers: () => {
          const a = AN("seat_crane");
          const e = ALG();
          return [
            { x: e.x, z: e.z, label: "The Algonquin" },
            a
              ? {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Aldous Penrose",
                  interior: "algonquin",
                }
              : null,
          ].filter(Boolean);
        },
      },
    ],
    rewards: { xp: 300 },
  });
  PM.quest({
    id: "pm2_q_archivist",
    name: "Ink and Ash",
    giver: "Archivist Evangeline Park",
    location: "The Algonquin Hotel",
    desc: "Archivist Evangeline Park, who left the Iron Covenant to copy books that matter, wants a Gutenberg Bible from the rare-book vault beneath the Morgan Library.",
    stages: [
      {
        id: "vault",
        text: "Retrieve the Gutenberg Bible from the Morgan Library's Rare Book Vault.",
        markers: () => {
          const a = PM.anchorOf("morgan_library", "bible");
          const e = PM.anchorOf("morgan_library", "exterior_entrance");
          return [
            e ? { x: e.x, z: e.z, label: "The Morgan Library" } : null,
            a
              ? {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Rare Book Vault",
                  interior: "morgan_library",
                }
              : null,
          ].filter(Boolean);
        },
      },
      {
        id: "return",
        text: "Bring the Gutenberg Bible to Archivist Park at the Algonquin.",
        markers: () => {
          const a = AN("archivist");
          const e = ALG();
          return [
            { x: e.x, z: e.z, label: "The Algonquin" },
            a
              ? {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Archivist Park",
                  interior: "algonquin",
                }
              : null,
          ].filter(Boolean);
        },
      },
    ],
    rewards: { xp: 350 },
  });
  // item pickups advance (or start) the quests
  G.events.on("itemAdded", (id) => {
    if (id === "pm2_nocturne") {
      if (!PM.q.started("pm2_q_critic")) PM.q.start("pm2_q_critic");
      PM.q.advance("pm2_q_critic", "retrieve", "return");
    }
    if (id === "pm2_gutenberg") {
      if (!PM.q.started("pm2_q_archivist")) PM.q.start("pm2_q_archivist");
      PM.q.advance("pm2_q_archivist", "vault", "return");
    }
  });

  // -------------------------------------------------------------------
  // NPC roster (spawned on newGame / after load, stable ids)
  // -------------------------------------------------------------------
