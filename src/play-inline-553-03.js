// play-inline-553 03 — dyn
// Lines 670-828 of readable/play-inline-553.pretty.js (statement-aligned).
  cfg.rook = {
    id: "comp_rook",
    dlg: "dlg_comp_rook",
    short: "Rook",
    name: "Rook",
    faction: "settlers",
    quest: "sq_rook",
    look: {
      type: "human",
      outfit: "raider",
      gender: "f",
      hair: "mohawk",
      hairColor: "#b8342a",
      skinTone: "tan",
      voice: "raider",
      level: 8,
      hp: 200,
      dr: 8,
    },
    startInv: [
      [["hunting_rifle", "bolt_rifle_32", "pistol_32"], 1],
      [["switchblade", "combat_knife", "lead_pipe"], 1],
      [["ammo_308", "ammo_32"], 24],
      [["rush"], 1],
      [["rally_tonic"], 1],
    ],
    home() {
      const b = L.anchor("washington_square", ["arch", "entrance"], {
        x: 80,
        z: 415,
      });
      return L.freeSpot(b.x + 3.2, b.z + 1.5, b.y, { maxR: 6 });
    },
    canHire: () => tier() >= 3,
    leaves: () => tier() <= 1,
    talent() {
      const trust = !!L.flag("rook_paid");
      return trust
        ? {
            name: "Companion: Honour Among Thieves",
            mods: { skills: { stealth: 15, trade: 15 }, crit: 3 },
            desc: "Stealth +15, Trade +15, Crit +3%",
          }
        : {
            name: "Companion: Street Smarts",
            mods: { skills: { stealth: 10, trade: 10 } },
            desc: "Stealth +10, Trade +10",
          };
    },
    ambient: [
      "Walk on, snowsuit.",
      "Charlie! Rematch later. Bring scrip.",
      "Sharp enough to shave a burrow rat. Want to see?",
    ],
    idle: [
      "You ever notice how nobody in this city looks up? Easiest marks in the world.",
      "Nobody in this town can remember a combination. They all write it down somewhere. Bless 'em.",
      "Gutter used to say I had no loyalty. I've got loyalty. It's just expensive.",
      "Stop humming. You hum when you're nervous. Marks can hear it.",
      "If we see a Fizzo machine, dibs.",
    ],
    combat: [
      "Fresh meat!",
      "Let's get messy.",
      "Oh, I've been waiting for this.",
      "Flank 'em! Or don't. I'm flanking.",
    ],
    kill: [
      "Called it.",
      "Hah! Dibs on the boots.",
      "Should've run.",
      "Night night.",
    ],
    hurt: [
      "You're leaking, boss. Knock back a tonic before you embarrass me.",
      "Don't you dare die, I'm not carrying you.",
    ],
    good: [
      "Ugh. Were you raised by nuns?",
      "You're going soft. I can smell it.",
    ],
    bad: ["Now THAT'S how it's done.", "Heh. Cold. I like cold."],
    newWeapon: (n) => "Ooh, a " + n + ". Somebody's gonna regret meeting this.",
    wait: [
      "Fine. I'll count pigeons.",
      "Don't take too long, I get bored. Bored gets bloody.",
    ],
    follow: ["Finally.", "Let's go make some enemies."],
    loc: {
      washington_square:
        "Home, such as it is. Charlie cheats at chess, by the way. I cheat better.",
      woolworth:
        "Woolworth. Gutter's place. Smell that? That's six months of my money, rotting.",
      wall_street:
        "Betty's crew. We don't go through the front. We never go through the front.",
      brooklyn_bridge:
        "Tollbooth Tony. I dated him for a week. Worst week of his life.",
      grand_central:
        "Market town. Lots of pockets. Relax, I'm not gonna. Probably.",
      times_square:
        "The Neon. Showfolk don't scare me. They don't steal, either, which is kind of suspicious.",
      rockefeller:
        "Tin cans. Stay close. They shoot raiders on sight and I still look like one.",
      chrysler:
        "Dolores used to run with us, back when. Best shot on the island. Worst jokes.",
      city_hall:
        "City Hall. Robots still write parking tickets in there. I have forty.",
      flatiron: "Trading post. I'm banned from three stalls. Don't ask which.",
      battery_park: "Water. Shellbacks. Hate it.",
      empire_state: "Brutes. Brutes don't pay. Why are we here?",
      liberty:
        "The Statue. When I was a kid I thought she was holding an ice-cream cone the size of a bus.",
      st_patricks:
        "Glow freaks. I robbed their collection plate once. It was all glowing rocks.",
      central_park:
        "Too many trees. Anything could be in there. Mostly something is.",
      un_hq:
        "Continuity. Pressed uniforms and clipboards. Those guys scare ME. Think about that.",
    },
    greet: ["What.", "Yeah?", "Make it quick, I'm bored."],
    farewell:
      "[Rook stops dead in the street and spits.] Nope. I'm done. I signed up with somebody who got their hands dirty, and now you're out there helping old ladies across the rubble. You're a SAINT now. Saints get people killed. [She shoulders her rifle.] I'm going back to the Arch. Don't follow me, and don't come looking unless you remember who you are.",
    farewellReply: "[Let her go.]",
  };

  // Grand Central free reading room (Tull's quest outcome) — a table + chairs + lamp.
  function libSpot() {
    const b = L.anchor("grand_central", ["waiting_room", "lobby"], {
      x: 240,
      z: -199,
    });
    return L.freeSpot(b.x + 9, b.z + 4, b.y, { maxR: 7 });
  }
  function dressLibrary() {
    if (L.world.tullLibrary) return;
    const p = libSpot();
    if (!p) return;
    L.world.tullLibrary = true;
    L.dyn(L.prop("table", { x: p.x, y: p.y, z: p.z, yaw: 0 }));
    L.dyn(L.prop("chair", { x: p.x - 1.1, y: p.y, z: p.z, yaw: Math.PI / 2 }));
    L.dyn(L.prop("chair", { x: p.x + 1.1, y: p.y, z: p.z, yaw: -Math.PI / 2 }));
    L.dyn(L.prop("lamp", { x: p.x, y: p.y + 0.8, z: p.z + 0.2, kind: "desk" }));
    L.dyn(L.prop("shelf", { x: p.x, y: p.y, z: p.z - 1.8, yaw: 0 }));
  }
  function dressRookCamp() {
    if (L.world.rookCamp) return;
    const h = homeOf("rook");
    if (!h) return;
    L.world.rookCamp = true;
    L.dyn(L.prop("mattress", { x: h.x + 1.6, y: h.y, z: h.z + 0.8, yaw: 0.4 }));
    L.dyn(L.prop("campfire", { x: h.x - 1.4, y: h.y, z: h.z + 1.2 }));
    L.dyn(
      L.prop("crate", { x: h.x + 0.2, y: h.y, z: h.z - 1.2, kind: "army" }),
    );
  }

  // ------------------------------------------------------------------
  // Items & quests
  // ------------------------------------------------------------------
