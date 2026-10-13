// play-inline-183 03 — fight
// Lines 367-674 of readable/play-inline-183.pretty.js (statement-aligned).
  function endFight(won, reason) {
    if (!fight || fight.over) return;
    fight.over = true;
    const R = BOUTS[fight.round];
    for (const a of fight.opps) {
      try {
        if (a.dead) continue;
        a.setHostile(false);
        a.setHostile(undefined);
        if (R.champ) {
          a.heal && a.heal(a.maxHp);
          const h = an("champ");
          if (h) {
            a.home = { x: h.x, z: h.z, r: 1.5 };
            a.moveTo && a.moveTo(h.x, h.z);
          }
        } else {
          G.actors.remove(a);
        }
      } catch (e) {
        /* ignore */
      }
    }
    bell();
    if (won) {
      S.pitWins = Math.max(S.pitWins || 0, fight.round + 1);
      K.inv.addScrip(R.prize);
      let msg = "You win the bout! +" + R.prize + " scrip purse.";
      if (fight.bet > 0) {
        const pay = fight.bet * R.odds;
        K.inv.addScrip(pay);
        msg += " Ondine pays out " + pay + " scrip on your bet.";
      }
      K.say(msg);
      K.xp(40 + fight.round * 40, "Won a bout at The Pit");
      crowd(
        ["WHAT A FIGHT!", "The kid's got hands!", "Pay up, pay up!"][
          fight.round % 3
        ],
      );
      if (fight.round === 0) K.q.set("pmid_q_pit", "r2");
      else if (fight.round === 1) K.q.set("pmid_q_pit", "r3");
      else {
        K.q.setFlag("pmid_pit_champion", true);
        K.q.complete("pmid_q_pit");
        K.news(
          "Sports news from Madison Square Garden: Brick Bruno, fifty-seven and oh, is now fifty-seven and ONE. There's a new champion of The Pit, folks, and I hear they slept through the whole war on ice. Mama always said, get your rest.",
        );
      }
    } else {
      K.say(reason || "The ref stops the fight. You lose.");
      crowd("Boooo!");
      try {
        const p = player();
        if (p.hp < p.maxHp * 0.3) p.heal(p.maxHp * 0.3 - p.hp);
      } catch (e) {
        /* */
      }
    }
    const f = fight;
    fight = null;
    void f;
  }
  K.animate((dt) => {
    if (!fight || fight.over || !dt) return;
    fight.t += dt;
    const p = player();
    const ring = an("ring");
    if (!p || !ring) return;
    if (p.hp < p.maxHp * 0.15 || p.alive === false) {
      endFight(false, "You hit the canvas! The ref waves it off — you lose.");
      return;
    }
    if (Math.hypot(p.pos.x - ring.x, p.pos.z - ring.z) > 7.5 && fight.t > 2) {
      endFight(false, "You left the ring. Forfeit!");
      return;
    }
    let alive = 0;
    for (const a of fight.opps) {
      if (a.dead) continue;
      if (a.hp < a.maxHp * (BOUTS[fight.round].champ ? 0.25 : 0.2)) {
        try {
          a.say(
            BOUTS[fight.round].champ
              ? "Okay... okay! Enough! You got it, kid."
              : "I yield! I YIELD!",
            3,
          );
        } catch (e) {
          /* */
        }
        a._yielded = true;
      }
      if (!a._yielded) alive++;
    }
    if (!alive) endFight(true);
  });
  G.events.on("weaponFired", (def) => {
    if (!fight || fight.over) return;
    const w = def && (def.weapon || def);
    const skill = w && w.skill;
    if (skill && skill !== "melee" && skill !== "melee")
      endFight(
        false,
        "GUNS IN THE RING?! Disqualified! The whole Garden is booing you.",
      );
  });
  A.resets = A.resets || [];
  A.resets.push(() => {
    fight = null;
  });

  // ------------------------------------------------------------------
  // Quests
  // ------------------------------------------------------------------
  const ringMarker = () => {
    const r = an("ring");
    return r
      ? [{ x: r.x, z: r.z, y: r.y, label: "The Pit — Ring", interior: "msg" }]
      : [];
  };
  K.questDef({
    id: "pmid_q_pit",
    name: "The Pit",
    giver: 'Mickey "Two-Count" Brannigan',
    location: "Madison Square Garden",
    desc: "Mickey Brannigan runs fist fights in the ruins of the old Garden. Three bouts stand between a newcomer and the championship belt — and no guns in the ring.",
    stages: [
      {
        id: "talk",
        text: "Talk to Mickey Brannigan at The Pit (Madison Square Garden).",
        markers: () => {
          const m = an("promoter");
          return m
            ? [
                {
                  x: m.x,
                  z: m.z,
                  y: m.y,
                  label: "Mickey Brannigan",
                  interior: "msg",
                },
              ]
            : [
                {
                  x: MSG_OUT().x,
                  z: MSG_OUT().z,
                  label: "Madison Square Garden",
                },
              ];
        },
      },
      {
        id: "r1",
        text: "Tell Mickey you're ready, then beat Scrapper Sully in the ring. (Optional: bet on yourself at Ondine's window.)",
        markers: ringMarker,
      },
      {
        id: "r2",
        text: "Survive the Burrow Rat Melee. Talk to Mickey when you're ready.",
        markers: ringMarker,
      },
      {
        id: "r3",
        text: "Go the distance with the champion, Brick Bruno.",
        markers: ringMarker,
      },
    ],
    rewards: {
      xp: 300,
      items: [
        ["pmid_champion_belt", 1],
        ["pmid_twocount_brass", 1],
      ],
    },
  });
  K.questDef({
    id: "pmid_q_claim",
    name: "Act of God",
    giver: "Old Hector Pfeiffer",
    location: "Metropolitan Life Tower",
    desc: 'Old Hector paid Metropolitan Life for twelve years. Then the bomb fell, he came off Pier 64 burned too badly to work, and his claim was denied as an "Act of God". He wants his appeal heard — by whatever is still running the tower.',
    stages: [
      {
        id: "find",
        text: "Find Hector's policy (No. 7741-P) in the Records Vault on the MetLife Tower's executive floor.",
        markers: () => {
          const v = K.anchor("metlife_tower", "records");
          return v
            ? [
                {
                  x: v.x,
                  z: v.z,
                  y: v.y,
                  label: "Records Vault",
                  interior: "metlife_tower",
                },
              ]
            : [loc("metlife_tower")];
        },
      },
      {
        id: "approve",
        text: 'Get the claim approved by the actuarial engine "Prudence" in the clock room at the top of the tower.',
        markers: () => {
          const v =
            K.anchor("metlife_tower", "mainframe") ||
            K.anchor("metlife_tower", "clockroom");
          return v
            ? [
                {
                  x: v.x,
                  z: v.z,
                  y: v.y,
                  label: 'Actuarial Engine "Prudence"',
                  interior: "metlife_tower",
                },
              ]
            : [];
        },
      },
      {
        id: "return",
        text: "Bring the certified cheque to Old Hector at The Pit.",
        markers: () => {
          const v = an("hector");
          return v
            ? [{ x: v.x, z: v.z, y: v.y, label: "Old Hector", interior: "msg" }]
            : [];
        },
      },
    ],
    rewards: { xp: 250 },
  });
  K.questDef({
    id: "pmid_q_bellevue",
    name: "Second Opinion",
    giver: "Cutman Ike",
    location: "Bellevue Hospital",
    desc: "Cutman Ike patches up The Pit's fighters with rags and moonshine. Bellevue Hospital's pharmacy might still hold real medicine — if you can get past whatever moved into the psychiatric wards.",
    stages: [
      {
        id: "meds",
        text: "Recover the pharmacy cache from Bellevue Hospital's psychiatric wards.",
        markers: () => {
          const v = K.anchor("bellevue", "pharmacy");
          return v
            ? [
                {
                  x: v.x,
                  z: v.z,
                  y: v.y,
                  label: "Bellevue Pharmacy",
                  interior: "bellevue",
                },
              ]
            : [loc("bellevue")];
        },
      },
      {
        id: "lab",
        text: "(Optional) Find out what Kessler-Haas was doing in the sealed annex beneath Bellevue.",
        optional: true,
        markers: () => {
          const v = K.anchor("bellevue", "lab");
          return v
            ? [
                {
                  x: v.x,
                  z: v.z,
                  y: v.y,
                  label: "Kessler-Haas Annex",
                  interior: "bellevue",
                },
              ]
            : [];
        },
      },
      {
        id: "return",
        text: "Bring the medicine back to Cutman Ike at The Pit.",
        markers: () => {
          const v = an("doctor");
          return v
            ? [{ x: v.x, z: v.z, y: v.y, label: "Cutman Ike", interior: "msg" }]
            : [];
        },
      },
    ],
    rewards: { xp: 300, items: [["rally_tonic", 3]] },
  });
  G.events.on("itemAdded", (id) => {
    if (
      id === "q_pmid_ml_policy" &&
      K.q.active("pmid_q_claim") &&
      K.q.stage("pmid_q_claim") === "find"
    )
      K.q.set("pmid_q_claim", "approve");
    if (id === "q_pmid_bv_meds" && K.q.active("pmid_q_bellevue"))
      K.q.set("pmid_q_bellevue", "return");
    if (id === "pmid_bv_hasselby") K.q.setFlag("pmid_bv_truth", true);
  });

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
  const R = (text, next, o) => Object.assign({ text, next }, o || {});
  const wins = () => S.pitWins || 0;
