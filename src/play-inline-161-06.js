// play-inline-161 06 — markers
// Lines 1586-1801 of readable/play-inline-161.pretty.js (statement-aligned).
  function defineQuests() {
    const q = Q();
    if (!q) return;
    const doorOf = (poi, name) => () => {
      const a = A(poi, name);
      return a ? [{ x: a.x, z: a.z, y: a.y, label: poi }] : [];
    };
    const mk = (poi, name, label) => () => {
      const a = A(poi, name);
      return a ? [{ x: a.x, z: a.z, y: a.y, label }] : [];
    };
    P.safe("quest:encore", () =>
      q.define({
        id: "pu_encore",
        name: "Lullaby for Ada",
        giver: "Maestro Bell",
        location: "Carnegie Hall",
        desc: 'Maestro Ignatius Bell of the Carnegie Consort means to give the first concert in twenty-two years: the premiere of Julius Hollis\'s Symphony No. 1, "Lullaby for Ada". He needs the score, power for his stage dynamo and an audience with standing.',
        stages: [
          {
            id: "talk",
            text: "Speak with Maestro Bell at Carnegie Hall.",
            markers: mk("carnegie_hall", "maestro", "Maestro Bell"),
          },
          {
            id: "gather",
            text: () => {
              const n = [
                F.scoreGiven || has("pu_score"),
                F.powerGiven ||
                  has("pu_planetarium_cell") ||
                  has("dry_cell", 3),
                F.patron,
              ].filter(Boolean).length;
              return (
                "Gather what the Carnegie Consort needs for the concert (" +
                n +
                "/3)."
              );
            },
          },
          {
            id: "g_score",
            text: 'Recover Julius Hollis\'s score of "Lullaby for Ada" from the Dakota.',
            sideObjective: true,
            doneIf: () => F.scoreGiven || has("pu_score"),
            showIf: () => qStage("pu_encore") === "gather",
            markers: () =>
              P.inCell("dakota")
                ? mk("dakota", "parlour", "The Hollis Apartment")()
                : mk("dakota", "exterior_entrance", "The Dakota")(),
          },
          {
            id: "g_power",
            text: "Find a power source for the stage dynamo — the Hayden Planetarium's projector cell, or three fission batteries.",
            sideObjective: true,
            doneIf: () =>
              F.powerGiven || has("pu_planetarium_cell") || has("dry_cell", 3),
            showIf: () => qStage("pu_encore") === "gather",
            markers: () =>
              P.inCell("amnh")
                ? mk("amnh", "projector", "Star Projector")()
                : mk(
                    "amnh",
                    "exterior_entrance",
                    "Museum of Natural History",
                  )(),
          },
          {
            id: "g_patron",
            text: "Win the patronage of the Plaza Society (Lady Constance, the Palm Court).",
            sideObjective: true,
            doneIf: () => !!F.patron,
            showIf: () => qStage("pu_encore") === "gather",
            markers: mk("plaza_hotel", "constance", "Lady Constance"),
          },
          {
            id: "deliver",
            text: "Return to Maestro Bell at Carnegie Hall.",
            markers: mk("carnegie_hall", "maestro", "Maestro Bell"),
          },
          {
            id: "dynamo",
            text: "Install the power source in Dynamo No. 2, backstage at Carnegie Hall.",
            markers: mk("carnegie_hall", "dynamo", "Dynamo No. 2"),
          },
          {
            id: "concert",
            text: "Take a seat in the Stern Auditorium for the concert.",
            markers: mk("carnegie_hall", "seat", "The Stern Auditorium"),
          },
        ],
        rewards: {
          xp: 500,
          scrip: 250,
          items: [["pu_maestro_tails", 1]],
          standing: 20,
        },
      }),
    );
    P.safe("quest:nursery", () =>
      q.define({
        id: "pu_nursery",
        name: "The Crying in 3B",
        giver: "Agnes Hollister",
        location: "The Dakota",
        desc: "For twenty-two years a baby has cried every night in the sealed Hollis apartment on the Dakota's third floor, and a woman has sung it a lullaby. Agnes Hollister, who has lived next door since 1961, wants to know why.",
        stages: [
          {
            id: "key",
            text: "Find the key to the sealed Hollis apartment (the superintendent's office, in the basement).",
            markers: () =>
              P.inCell("dakota")
                ? mk("dakota", "super_office", "Superintendent's Office")()
                : mk("dakota", "exterior_entrance", "The Dakota")(),
          },
          {
            id: "open",
            text: "Open the sealed door of the Hollis apartment on the third floor.",
            markers: mk("dakota", "sealed_door", "Apartment 3B"),
          },
          {
            id: "source",
            text: "Find the source of the crying.",
            markers: mk("dakota", "nursery", "The Nursery"),
          },
          {
            id: "nanny",
            text: "Decide what to do about Nanny.",
            markers: mk("dakota", "nanny", "Nanny"),
          },
          {
            id: "report",
            text: "Return to Mrs. Hollister in apartment 3A.",
            markers: () => {
              const a = actor("pu_agnes");
              return a
                ? [
                    {
                      npc: "pu_agnes",
                      label: "Mrs. Hollister",
                      x: a.pos.x,
                      z: a.pos.z,
                    },
                  ]
                : mk("dakota", "agnes", "Mrs. Hollister")();
            },
          },
        ],
        rewards: { xp: 350 },
      }),
    );
    P.safe("quest:heist", () =>
      q.define({
        id: "pu_heist",
        name: "The Great Tiffany Heist",
        giver: "",
        location: "Tiffany & Co.",
        desc: "On March 5th, 1967, three would-be jewel thieves were sealed into the Tiffany vault by its own time lock. The Atlas Diamond is still down there with them. So are the raiders who took the building.",
        stages: [
          {
            id: "in",
            text: "Get into the Tiffany & Co. vault (the Raider Boss's key, or the time-lock override on the security teletype).",
            markers: () =>
              F.vaultOpen
                ? []
                : P.inCell("tiffany")
                  ? mk("tiffany", "vault_door", "Vault Door")()
                  : mk("tiffany", "exterior_entrance", "Tiffany & Co.")(),
          },
          {
            id: "take",
            text: "Take the Atlas Diamond.",
            markers: mk("tiffany", "vault", "The Atlas Diamond"),
          },
          {
            id: "fence",
            text: "(Optional) Lady Constance at the Plaza would pay handsomely for the Atlas Diamond.",
            optional: true,
            markers: mk("plaza_hotel", "constance", "Lady Constance"),
          },
        ],
        rewards: { xp: 300 },
      }),
    );
    P.safe("quest:omelette", () =>
      q.define({
        id: "pu_omelette",
        name: "Omelette des Ruines",
        giver: "Chef Gaston",
        location: "The Plaza Hotel",
        desc: "Chef Gaston in the Plaza kitchens dreams of the perfect omelette. It requires one ripjaw egg. There is a nest in the Hall of Dinosaurs at the Museum of Natural History.",
        stages: [
          {
            id: "egg",
            text: "Find a ripjaw egg in the Hall of Dinosaurs (American Museum of Natural History).",
            markers: () =>
              has("pu_ripjaw_egg")
                ? mk("plaza_hotel", "chef", "Chef Gaston")()
                : P.inCell("amnh")
                  ? mk("amnh", "loot2", "Ripjaw Nest")()
                  : mk(
                      "amnh",
                      "exterior_entrance",
                      "Museum of Natural History",
                    )(),
          },
        ],
        rewards: { xp: 200 },
      }),
    );
  }

  // ==================================================================
  // NPCs
  // ==================================================================
