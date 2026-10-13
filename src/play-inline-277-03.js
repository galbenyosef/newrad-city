// play-inline-277 03 — the
// Lines 265-478 of readable/play-inline-277.pretty.js (statement-aligned).
  function defineItems() {
    if (G.isStub("items") || typeof G.items.define !== "function") return;
    const d = (def) =>
      P.safe("item:" + def.id, () => {
        if (!G.items.get(def.id)) G.items.define(def);
      });
    const note = (id, name, title, text, extra) =>
      d(
        Object.assign(
          {
            id,
            type: "note",
            name,
            title,
            text,
            weight: 0,
            value: 0,
            tags: ["note"],
          },
          extra || {},
        ),
      );
    const tape = (id, name, title, text, extra) =>
      d(
        Object.assign(
          {
            id,
            type: "tape",
            name,
            title,
            text,
            weight: 0,
            value: 0,
            tags: ["tape"],
          },
          extra || {},
        ),
      );
    // ---- Ansonia ----
    note(
      "uw_note_ans_fall",
      "Scrap of Paper",
      "Found beneath the grand staircase",
      "ELEVATOR OUT AGAIN. Taking the stairs to 14. Doctor says the exercise will do me good.\n\nIf found, please return this note to Mrs. R. Abelard, 14C, and tell her the doctor was wrong.",
    );
    note(
      "uw_note_seals",
      "Seal Keeper's Log",
      "The Ansonia — Lobby Fountain, Keeper's Book",
      'MAR 1 — Bartholomew off his feed again. Residents keep throwing him cocktail onions.\nMAR 3 — New seal delivered from the Coney Island aquarium, "Duchess". Bites.\nMAR 4 — Management asks if the seals can be taught to bark during fire drills. The seals already bark during fire drills. The seals bark during everything.\n' +
        "MAR 5 — Sirens. Doorman says the building is sealing. Nobody told me what to do about the seals. I am not leaving them.\n\n[much later, pencil] The water stopped. I gave them everything in the kitchen. Duchess still bites. Good girl.",
    );
    tape(
      "uw_reel_stokes",
      'Tape reel: "A Self-Sufficient Ansonia"',
      "W.E.D. Stokes III — address to the residents' board, 1966",
      "\"Gentlemen. My grandfather kept cows on this roof when the Board of Health said he couldn't. Chickens, geese, a bear, briefly. The papers laughed. Well, I have seen the Pentagon's projections, and nobody will be laughing at a man with his own eggs.\n\n" +
        "I propose we restore the farm. Raised beds, hydroponics, a seed bank — heirloom stock, sealed, the whole Eastern Seaboard's vegetable heritage in a steel box on our roof. If the worst happens, the Ansonia eats. Everybody else can eat their stock certificates. Motion to approve? ...Motion carried. Somebody fetch me a goat.\"",
    );
    note(
      "uw_note_baths",
      "Attendant's Note",
      "Pinned to a towel",
      "To whoever finds us: Leo and I came down to the Baths when the sirens started, same as every Sunday. Figured the deepest room in the building was the safest. The water went warm, then it went green. Leo says it's pretty. It is pretty.\n\nWe're going to sit by the pool a while. Please don't move us. We like the view.",
    );
    tape(
      "uw_reel_castellano",
      'Tape reel: "Castellano — Final Aria"',
      "Signor E. Castellano — home recording, 03/05/1967",
      '[A piano introduction, unsteady. A great tenor voice, older now, begins an aria of the clown who must go on laughing while his heart breaks. He does not reach the end. There is a long silence, then the sound of the piano lid closing.]\n\n"Two hundred performances and I always cracked on that note. Tonight I did not crack. Tonight there is no one to hear it. Of course. Of course that is how it goes."',
    );
    note(
      "uw_note_herman",
      'Letter to "Georgie"',
      "On league stationery, unsent",
      "Georgie —\n\nThe Commissioner says you can't keep the bat. The Hall says you can't keep the bat. The Yankees, frankly, would like the bat back and an apology for what you said on the radio.\n\nI say keep the bat. You hit sixty with it, you can hit a Commie with it. Keep it in the case and if the worst happens, you know where it is.\n\n— Mac\n\nP.S. Stop feeding the seals hot dogs.",
    );
    // ---- San Remo ----
    note(
      "uw_note_sr_notice",
      "Commune Notice",
      "Torn from the lobby notice board",
      "SAN REMO COMMUNE — HOUSE RULES\n1. Wipe your feet. Wipe your gun. Wipe your mouth.\n2. The elevator is for residents, guests and cargo. Not for \"joyrides\", DENNIS.\n3. Nobody goes to Bellamy's. NOBODY. The Mannequins are not a sale.\n4. Seeds, soil, anything that grows: bring it to Adeline. There's a reward.\n5. Birdie is on the north tower. If Birdie waves, wave back. If Birdie does not wave, take cover.\n6. The ledger teletype password is SEEDLING. It is a password so Dennis stops writing in the ledger, not because the ledger is secret.",
      { learn: "uw_sr_office" },
    );
    // ---- Bellamy's ----
    note(
      "uw_note_fitting",
      "Fitting Room Ticket",
      "Bellamy's — Fitting Room 4 — 3 items",
      "On the back, in a shaky hand: \"The man with the pins keeps asking what size I am. I told him I'm not buying anything. He says that's all right. He says I'll be on display. Toby if you read this, run.\"",
    );
    tape(
      "uw_reel_bride",
      'Tape reel: "Bridal Appointment, 10:30"',
      "Bellamy's Bridal Salon — customer dictation",
      "\"—the sweetheart neckline, the cathedral train, and the veil from the display. Yes, the display one. The wedding is Saturday. The sirens? Oh, they test them every month. ...That's not the test tone, is it. ...Well. I'm not taking it off. I waited three years for Harold to ask. If the world ends, it ends with me in this dress.\"",
    );
    note(
      "uw_note_memo",
      "Window Dresser's Rules",
      "Nailed to the manager's desk",
      "RULES OF THE HOUSE — by order of the WINDOW DRESSER\n\n1. Everybody gets a mannequin face. Faces are for customers.\n2. We do not sell. We DISPLAY.\n3. Anything that walks in off 59th Street is merchandise.\n4. The kid in the cage stays in the cage until he stops crying. Then he gets a window.\n5. Nobody touches my throne.\n6. Nobody touches the manager's teletype. (Password DRESSUP. The old manager wrote it on the blotter, under the slogan. The old manager is now in Housewares.)",
      { learn: "uw_bl_manager" },
    );
    // ---- keys / quest / uniques ----
    d({
      id: "uw_key_stokes",
      type: "key",
      name: "Stokes Farm Key",
      weight: 0,
      value: 0,
      noLoot: true,
      tags: ["key"],
      desc: 'A green-painted key on a leather thong: "SEED BANK — W.E.D.S."',
    });
    d({
      id: "uw_key_cage",
      type: "key",
      name: "Stockroom Cage Key",
      weight: 0,
      value: 0,
      noLoot: true,
      tags: ["key"],
      desc: 'A brass key tagged "STOCK — HOLD CAGE". Somebody has painted a tiny smiling face on it.',
    });
    d({
      id: "uw_seed_bank",
      type: "misc",
      name: "Stokes Heirloom Seed Bank",
      weight: 4,
      value: 400,
      quest: true,
      tags: ["quest"],
      desc: 'A welded steel case of sealed glass vials: beans, squash, tomatoes, corn, "Ansonia Greens". Two decades of patience in a box.',
    });
    d({
      id: "uw_mannequin_mask",
      type: "apparel",
      slot: "head",
      name: "Mannequin Mask",
      weight: 1,
      value: 120,
      dr: 2,
      attrs: { presence: -1 },
      skills: { stealth: 10 },
      tags: ["apparel", "hat", "unique"],
      desc: "A smooth, faceless plastic face with eye holes drilled out. Raiders find it unsettling. So does everybody else.",
    });
    d({
      id: "uw_greens",
      type: "aid",
      name: "Ansonia Greens",
      weight: 0.2,
      value: 12,
      sound: "eat",
      tags: ["food"],
      effects: { hp: 18, rads: -2 },
      desc: "Leafy, bitter, and grown from twenty-year-old seed on a penthouse floor. Tastes like hope and slightly like pennies.",
    });
    // unique weapons built from the weapons module's defs (fallback to misc if absent)
    const uniq = (id, baseId, name, value, desc, mod) =>
      d(
        (() => {
          const base = !G.isStub("items") ? G.items.get(baseId) : null;
          const w =
            base && base.weapon
              ? Object.assign({}, base.weapon, mod(base.weapon))
              : undefined;
          return {
            id,
            type: w ? "weapon" : "misc",
            name,
            weight: base ? base.weight : 3,
            value,
            unique: true,
            icon: base ? base.icon : undefined,
            desc,
            weapon: w,
          };
        })(),
      );
    uniq(
      "uw_sultan_bat",
      "baseball_bat",
      "The Sultan's Bat",
      700,
      "Forty ounces of Louisville ash, signed across the barrel by the man who hit sixty. Kept in a glass case at the Ansonia for twenty-two years. Swing it like you mean it.",
      (w) => ({
        damage: Math.round((w.damage || 14) * 1.6),
        critChance: 1.6,
        critMult: 1.5,
        condDecay: (w.condDecay || 0.002) * 0.5,
      }),
    );
    uniq(
      "uw_crows_nest",
      "hunting_rifle",
      "Crow's Nest",
      1100,
      "Birdie's father's rifle: a hunting rifle with a cheek rest carved from a San Remo banister and a scope she swears was once on a lighthouse. Steadier, deadlier, patient.",
      (w) => ({
        damage: Math.round((w.damage || 40) * 1.2),
        spread: (w.spread || 0.01) * 0.6,
        adsSpread: (w.adsSpread || 0.004) * 0.5,
        critChance: 2,
        condDecay: (w.condDecay || 0.002) * 0.6,
      }),
    );
  }

  // ==================================================================
  // TERMINALS
  // ==================================================================
