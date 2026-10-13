// play-inline-561 02 — flag
// Lines 129-470 of readable/play-inline-561.pretty.js (statement-aligned).
  L.hook("init", function () {
    L.quest({
      id: "sq_sniper",
      name: "Eagle's Nest",
      giver: "Stationmaster Okafor",
      location: "Chrysler Building",
      desc: "Someone in the Chrysler Building has been sniping the pack-bots on Grand Central's supply runs along 42nd Street. Delphine Okafor wants it stopped.",
      stages: [
        {
          id: "find",
          text: "Find the sniper in the Chrysler Building's crown. The raiders' service elevator is in the lobby.",
          markers: () => {
            const d = L.npc("chr_dolores");
            return [
              d && !d.dead
                ? chryslerMarker(d.pos, "The Sniper")
                : { x: CHRYSLER.x, z: CHRYSLER.z, label: "Chrysler Building" },
            ];
          },
        },
        // Solutions (optional lines; ticked off with the path actually taken)
        {
          id: "sn_talk",
          text: "(Optional) Convince the sniper to guard Grand Central's supply runs instead.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("met_dolores") && !sniperDone(),
          doneIf: () => !!L.flag("dolores_recruited"),
        },
        {
          id: "sn_pay",
          text: "(Optional) Pay the sniper 150 scrip to leave Manhattan.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("met_dolores") && !sniperDone(),
          doneIf: () => !!L.flag("dolores_left"),
        },
        {
          id: "sn_kill",
          text: "(Optional) Kill the sniper.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("met_dolores") && !sniperDone(),
          doneIf: () => !!L.flag("dolores_dead"),
        },
        {
          id: "report",
          text: () =>
            L.flag("dolores_recruited")
              ? "Deadeye Dolores has agreed to watch over the supply runs. Tell Stationmaster Okafor she'll need a window."
              : L.flag("dolores_left")
                ? "The sniper took your scrip and left for Jersey. Report back to Stationmaster Okafor."
                : "The sniper in the Chrysler Building is dead. Report back to Stationmaster Okafor.",
          markers: () => [
            { npc: "gc_delphine", label: "Stationmaster Okafor" },
          ],
        },
      ],
      rewards: { xp: 250, scrip: 200 },
    });
    L.quest({
      id: "sq_bridge",
      name: "Bridge and Tunnel",
      giver: "Stationmaster Okafor",
      location: "Brooklyn Bridge",
      desc: "Tollbooth Tony's gang controls the Brooklyn Bridge and has raised the toll so high that Brooklyn's traders have stopped crossing.",
      stages: [
        {
          id: "tony",
          text: "Deal with Tollbooth Tony at the Brooklyn Bridge.",
          markers: () => [
            { npc: "bb_tony", label: "Tollbooth Tony", x: 269, z: 636 },
          ],
        },
        {
          id: "br_legit",
          text: "(Optional) Convince Tony to run the bridge as a legitimate toll authority.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("met_tony") && !L.flag("bridge_resolved"),
          doneIf: () => !!L.flag("bridge_legit"),
        },
        {
          id: "br_pay",
          text: "(Optional) Pay Tony 200 scrip to lower the wagon toll.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("met_tony") && !L.flag("bridge_resolved"),
          doneIf: () => !!L.flag("bridge_paid"),
        },
        {
          id: "br_charges",
          text: "(Optional) Point out the frayed demolition charges wired under the toll booth.",
          sideObjective: true,
          optional: true,
          // only a player who could spot them is told they're there
          showIf: () =>
            !!L.flag("met_tony") &&
            !L.flag("bridge_resolved") &&
            L.skill("explosives") >= 45,
          doneIf: () => !!L.flag("bridge_charges"),
        },
        {
          id: "br_fight",
          text: "(Optional) Kill Tollbooth Tony.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("met_tony") && !L.flag("bridge_resolved"),
          doneIf: () => !!L.flag("tony_dead"),
        },
        {
          id: "report",
          text: () =>
            L.flag("bridge_legit")
              ? "Tony is now Commissioner of the Brooklyn Bridge Toll Authority. Tell Stationmaster Okafor the bridge is open."
              : L.flag("bridge_charges")
                ? 'Tony\'s gang dropped the toll to five scrip after your "safety inspection". Report back to Stationmaster Okafor.'
                : L.flag("bridge_paid")
                  ? "You paid Tony to lower the wagon toll. Report back to Stationmaster Okafor."
                  : "Tollbooth Tony is dead and the bridge is open. Report back to Stationmaster Okafor.",
          markers: () => [
            { npc: "gc_delphine", label: "Stationmaster Okafor" },
          ],
        },
      ],
      rewards: { xp: 250, scrip: 150 },
    });
    L.quest({
      id: "sq_wagon",
      name: "Lost in Transit",
      giver: "Hattie Caldwell",
      location: "Flatiron Trading Post",
      desc: "Hattie Caldwell's trade wagon — two drivers and a pack-bot called Dolly — never arrived at Grand Central from the Flatiron.",
      stages: [
        {
          id: "wreck",
          text: "Search for the Caldwell wagon along Broadway near Madison Square.",
          markers: [{ x: WRECK.x, z: WRECK.z, label: "Wagon Route" }],
        },
        {
          id: "woolworth",
          text: "Recover the Caldwell strongbox from the raiders at the Woolworth Building.",
          markers: () =>
            L.pickups.strongbox && !L.has("q_caldwell_strongbox")
              ? [
                  {
                    x: L.pickups.strongbox.pos.x,
                    z: L.pickups.strongbox.pos.z,
                    label: "Caldwell Strongbox",
                  },
                ]
              : [{ x: 0, z: 625, label: "Woolworth Building" }],
        },
        {
          id: "cv_pete",
          text: "(Optional) Follow the drag marks and find the missing driver, Pete Ruiz.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !!L.flag("pete_trail") &&
            !L.flag("pete_rescued") &&
            !L.flag("dead_esb_pete"),
          doneIf: () => !!L.flag("pete_rescued"),
          markers: () => [{ npc: "esb_pete", label: "Pete Ruiz" }],
        },
        {
          id: "return",
          text: "Return the strongbox to Hattie Caldwell at the Flatiron.",
          markers: () => [{ npc: "fl_hattie", label: "Hattie Caldwell" }],
        },
        {
          id: "cv_honest",
          text: "(Optional) Hand over the payroll untouched.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("wagon_honest"),
        },
        {
          id: "cv_skim",
          text: "(Optional) Skim a little off the top.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("wagon_skimmed"),
        },
      ],
      rewards: { xp: 300 },
    });
    L.quest({
      id: "sq_exhibit",
      name: "Exhibit A",
      giver: "CURATOR-7",
      location: "Metropolitan Museum of Art",
      desc: "CURATOR-7, the Met's last robotic docent, reports that the museum's security Patrolmen have been \"expelling patrons with excessive enthusiasm\" since the morning of the Bombing.",
      stages: [
        {
          id: "security",
          text: "Deal with the Metropolitan Museum's security robots.",
          // robots scrapped before CURATOR-7 asked (the kill counter already reads 2+): the job is done — report back
          onEnter() {
            if (L.counter("met_bots") >= 2 && !L.flag("met_closed")) {
              L.setFlag("met_bots_destroyed");
              Q.setStage("sq_exhibit", "report");
            }
          },
          // the marker sits on the robots themselves once they are about; before that, on the Met's steps
          markers: () => {
            const b = metBots().slice(0, 3);
            return b.length
              ? b.map((a) => ({
                  x: a.pos.x,
                  z: a.pos.z,
                  y: a.pos.y,
                  label: "Security Patrolman",
                }))
              : [
                  {
                    anchor: ["met", ["entrance", "steps", "curator"]],
                    fallback: { x: MET.x + 36, z: MET.z },
                    label: "Metropolitan Museum",
                  },
                ];
          },
        },
        {
          id: "ex_terminal",
          text: '(Optional) Engage the "MUSEUM CLOSED" protocol from the security teletype. CURATOR-7 may know the passcode.',
          sideObjective: true,
          optional: true,
          showIf: () => !L.flag("met_bots_destroyed"),
          doneIf: () => !!L.flag("met_closed"),
          markers: () => {
            const p = L.termPos("met_security");
            return p ? [{ x: p.x, z: p.z, label: "Security Teletype" }] : [];
          },
        },
        {
          id: "ex_destroy",
          text: () =>
            "(Optional) Destroy the security robots (" +
            Math.min(L.counter("met_bots"), 2) +
            "/2).",
          sideObjective: true,
          optional: true,
          showIf: () => !L.flag("met_closed"),
          doneIf: () => !!L.flag("met_bots_destroyed"),
        },
        {
          id: "report",
          text: () =>
            (L.flag("met_closed")
              ? "The security robots are asleep in their alcoves. "
              : "The security robots have been scrapped. ") +
            "Return to CURATOR-7.",
          markers: () => [{ npc: "met_curator", label: "CURATOR-7" }],
        },
      ],
      rewards: { xp: 250, scrip: 150, items: [["q_curator_monocle", 1]] },
    });
    L.quest({
      id: "sq_shellshock",
      name: "Shell Shock",
      giver: "Ossie",
      location: "Battery Park",
      desc: "Shellbacks have been crawling out of the harbour at Battery Park and trying to eat Ossie's ferry. Ossie would like them to stop, permanently.",
      stages: [
        {
          id: "hunt",
          text: "Stop the shellbacks attacking Ossie's ferry at Battery Park.",
          onEnter() {
            if (L.counter("shellbacks") >= 4) {
              L.setFlag("shell_culled");
              Q.setStage("sq_shellshock", "report");
            }
          },
          markers: () => {
            const shells =
              G.isStub("actors") || !G.actors.list
                ? []
                : G.actors
                    .list()
                    .filter(
                      (a) =>
                        a &&
                        !a.dead &&
                        !a.removed &&
                        isShellback(a) &&
                        Math.hypot(a.pos.x + 40, a.pos.z - 950) < 160,
                    )
                    .slice(0, 3);
            return shells.length
              ? shells.map((a) => ({
                  x: a.pos.x,
                  z: a.pos.z,
                  y: a.pos.y,
                  label: "Shellback",
                }))
              : [{ x: -40, z: 950, label: "Shellback Nests" }];
          },
        },
        {
          id: "sh_kill",
          text: () =>
            "(Optional) Kill shellbacks around Battery Park and the harbour (" +
            Math.min(L.counter("shellbacks"), 4) +
            "/4).",
          sideObjective: true,
          optional: true,
          showIf: () => !L.flag("shell_net"),
          doneIf: () => !!L.flag("shell_culled"),
        },
        {
          id: "sh_net",
          text: "(Optional) Repair the old-world shark-net generator on the pier.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ossie_net_known") && !L.flag("shell_culled"),
          doneIf: () => !!L.flag("shell_net"),
          markers: () => {
            const g = L.world.sharkNet;
            return g ? [{ x: g.x, z: g.z, label: "Shark-Net Generator" }] : [];
          },
        },
        {
          id: "report",
          text: () =>
            (L.flag("shell_net")
              ? "The harbour net is humming again. "
              : "The shellbacks have been thinned out. ") +
            "Return to Ossie at the Battery Park pier.",
          markers: () => [{ npc: "bp_ossie", label: "Ossie" }],
        },
      ],
      rewards: { xp: 250, scrip: 120, items: [["q_ferry_token", 1]] },
    });
  });

  // ------------------------------------------------------------------
  // Events & triggers
  // ------------------------------------------------------------------
  /** living security robots at the Met (location spawns + the quest's own) */
