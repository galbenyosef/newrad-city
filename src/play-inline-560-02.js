// play-inline-560 02 — done
// Lines 366-551 of readable/play-inline-560.pretty.js (statement-aligned).
  const LEADS = [
    {
      id: "power",
      flags: ["neon_rumor_power", "neon_rumor_neon_pearl"],
      done: () => Q.isStarted("sq_neon_power"),
      text: "Ask Sparks Malloy why the Neon's lights keep failing.",
      npc: "neon_sparks",
      label: "Sparks Malloy",
    },
    {
      id: "opry",
      flags: ["neon_rumor_opry", "neon_rumor_neon_ruby"],
      done: () => Q.isStarted("sq_neon_opry"),
      text: "The Opry lost its leading man. See Lionel Fairweather.",
      npc: "neon_director",
      label: "Lionel Fairweather",
    },
    {
      id: "guard",
      flags: ["neon_rumor_guard", "neon_rumor_neon_nicky"],
      done: () => Q.isStarted("sq_neon_guard"),
      text: "Captain Kincaid is hiring for the Neon Guard.",
      npc: "neon_capt",
      label: "Captain Kincaid",
    },
    {
      id: "ball",
      flags: ["neon_rumor_ball"],
      done: () => Q.isStarted("sq_neon_ball"),
      text: "Mayor Crowe wants someone to fix the Times Square Ball.",
      npc: "neon_crowe",
      label: "Mayor Crowe",
    },
    {
      id: "escort",
      flags: ["neon_rumor_escort", "neon_rumor_neon_stan"],
      done: () => Q.isStarted("sq_neon_express1"),
      text: "Eustace Byrd pays escorts at the Neon Depot.",
      npc: "neon_wagon",
      label: "Eustace Byrd",
    },
    {
      id: "club",
      flags: ["neon_rumor_club"],
      done: () => Q.isStarted("sq_neon_club"),
      text: "Try to talk your way past Big Sal at the Cinder Club.",
      npc: "neon_sal",
      label: "Big Sal",
    },
    {
      id: "oracle",
      flags: ["neon_rumor_oracle", "neon_rumor_neon_dusty"],
      done: () =>
        L.flag("neon_oracle_day") !== undefined &&
        L.flag("neon_oracle_day") !== null,
      text: "Have your fortune told at the Ticker Oracle.",
      anchor: ["oracle_booth", "ticker_oracle"],
      label: "Ticker Oracle",
    },
    {
      id: "speakeasy",
      flags: ["neon_rumor_speakeasy"],
      done: () => !!L.flag("neon_speakeasy_lore"),
      text: "Find the secret Speakeasy down the 42nd Street subway stairs.",
      anchor: ["speakeasy_bar", "speakeasy_bartender"],
      label: "The Speakeasy",
    },
  ];
  const heard = (ld) => ld.flags.some((f) => !!L.flag(f));
  function leadMarker(ld) {
    if (ld.npc) return [npcM(ld.npc, ld.label)];
    const a = N() && N().has(ld.anchor);
    return a ? [{ x: a.x, z: a.z, y: a.y, label: ld.label }] : [];
  }
  function rumorsTick() {
    const any = LEADS.some(heard);
    if (!any) return;
    if (!Q.isStarted(RID)) {
      Q.start(RID);
      return;
    }
    if (
      Q.isActive(RID) &&
      LEADS.every((ld) => {
        try {
          return ld.done();
        } catch (e) {
          return false;
        }
      })
    )
      Q.complete(RID);
  }

  // ==================================================================
  // Quests, items
  // ==================================================================
  L.hook("init", function () {
    L.quest({
      id: QID,
      name: "Neon Guard Contract",
      giver: "Sergeant Otis Mulroney",
      location: "Guard Barracks (The Neon)",
      desc: () => {
        const c = C();
        return c
          ? "Contract #" +
              c.n +
              " off the Neon Guard's bounty board: " +
              c.what +
              " at " +
              c.place +
              '. "' +
              c.brief +
              '" Pay on proof: ' +
              c.pay +
              " scrip."
          : "A job off the Neon Guard's bounty board.";
      },
      stages: [
        {
          id: "hunt",
          text: () => {
            const c = C();
            if (!c) return "Clear the contract target.";
            const dead = c.ids.length - aliveTargets(c).length;
            return (
              "Clear out " +
              c.what +
              " at " +
              c.place +
              " (" +
              dead +
              "/" +
              c.ids.length +
              ")."
            );
          },
          markers: () => contractMarker(),
        },
        {
          id: "report",
          text: () =>
            L.alive("neon_sarge")
              ? "Report to Sergeant Mulroney in the Guard Barracks."
              : "Report to Captain Kincaid — Mulroney is off his post.",
          markers: () => [
            L.alive("neon_sarge")
              ? npcM("neon_sarge", "Sergeant Mulroney")
              : npcM("neon_capt", "Captain Kincaid"),
          ],
        },
      ],
      rewards: {},
    });
    L.quest({
      id: RID,
      name: "Word on the Street",
      giver: "The Neon",
      location: "The Neon (Times Square)",
      desc: "Everyone in the Neon talks. Some of it is even true. Rumours you've picked up in the square, the Rad Room and the market — follow them up, or don't.",
      stages: [
        {
          id: "listen",
          text: () =>
            LEADS.some((ld) => heard(ld) && !ld.done())
              ? "Follow up on the rumours going around the Neon."
              : "Keep your ears open around the Neon — the Rad Room, the market, the Ticker Oracle.",
        },
      ].concat(
        LEADS.map((ld) => ({
          id: "lead_" + ld.id,
          text: ld.text,
          sideObjective: true,
          showIf: () => heard(ld),
          doneIf: () => heard(ld) && !!ld.done(),
          markers: () => leadMarker(ld),
        })),
      ),
      rewards: { xp: 100 },
    });
  });

  // ==================================================================
  // Dialogues
  // ==================================================================
