// play-inline-402 03 — markers
// Lines 376-472 of readable/play-inline-402.pretty.js (statement-aligned).
  function quests() {
    if (G.isStub("quests") || !G.quests.define) return;
    G.quests.define({
      id: QC,
      name: "Contempt of Court",
      giver: "Lee Bedford",
      location: "Jefferson Market Courthouse",
      desc: "Fran Zielinski, Bedford's trader, was arrested by the courthouse robots for breaking a curfew from 1957. The Magistrate unit is still in session. Get her out — by law, by pardon, or with the bailiffs' own keys.",
      stages: [
        {
          id: "find",
          text: "Find out what happened to Fran at the Jefferson Market Courthouse.",
          markers: [
            () => {
              const c = ctxOf("jefferson_market");
              const a = c && c.anchors.door;
              return a
                ? { x: a.x, z: a.z, label: "Jefferson Market Courthouse" }
                : null;
            },
          ],
        },
        {
          id: "defend",
          text: "Free Fran: win her case before Magistrate MK-IX, issue a pardon from the judge's chambers, or break her out (spare cell keys in the evidence room, or the cell-control teletype).",
          markers: [
            marker(
              "jefferson_market",
              "judge",
              "Magistrate MK-IX",
              "jefferson_market",
            ),
            marker(
              "jefferson_market",
              "dot_cell",
              "Cell 2",
              "jefferson_market",
            ),
          ],
        },
        {
          id: "return",
          text: "Tell Lee at Bedford's that Fran is free.",
          markers: [{ npc: "pv3_lee", label: "Lee" }],
        },
      ],
      rewards: { xp: 250, scrip: 80 },
    });
    G.quests.define({
      id: QT,
      name: "Tower of Light",
      giver: "Hazel Adeyemi",
      location: "Five Boroughs Tower of Light",
      desc: "Hazel Adeyemi, an old lineman from Five Boroughs Local 3, says Transformer B in the Five Boroughs building is still energised. With an arc regulator in the tower's lantern, the Village could have power — or Manhattan could have its beacon back.",
      stages: [
        {
          id: "enter",
          text: "Get inside the Five Boroughs Power building on 15th Street.",
          markers: [
            () => {
              const c = ctxOf("five_boro_tower");
              const a = c && c.anchors.door;
              return a
                ? { x: a.x, z: a.z, label: "Five Boroughs Power Tower" }
                : null;
            },
          ],
        },
        {
          id: "regulator",
          text: "Recover an arc regulator from rack B in the transformer hall.",
          markers: [
            marker("five_boro_tower", "regulator", "Rack B", "five_boro_tower"),
          ],
        },
        {
          id: "crown",
          text: "Take the executive elevator to the tower and install the regulator in the lantern room.",
          markers: [
            marker(
              "five_boro_tower",
              "beacon",
              "Lantern Room",
              "five_boro_tower",
            ),
          ],
        },
        {
          id: "return",
          text: "Tell Hazel at Bedford's what you did with the power.",
          markers: [{ npc: "pv3_hazel", label: "Hazel" }],
        },
      ],
      rewards: { xp: 400, scrip: 120 },
    });
  }

