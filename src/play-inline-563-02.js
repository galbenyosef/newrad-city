// play-inline-563 02 — the
// Lines 354-656 of readable/play-inline-563.pretty.js (statement-aligned).
  function defineItems() {
    L.defineItem({
      id: FLYER,
      type: "note",
      name: "World's Fair Souvenir Map",
      title: "SOUVENIRS OF TOMORROW — COLLECT ALL 20!",
      text: flyerText(),
      desc: "A folded souvenir map from the 1964 World's Fair. Read it with your VIGIL goggles (NOTES).",
      weight: 0,
      value: 0,
    });
    L.defineItem({
      id: KEY,
      type: "key",
      name: "Grand Prize Vault Key",
      weight: 0,
      value: 0,
      quest: true,
      noLoot: true,
      mesh: "key",
      tags: ["key"],
      desc: "A long brass key on a blue-and-orange World's Fair lanyard, warm from twenty-four years in Gideon Tarbell's vest pocket. Stamped \"W.F. CORP. — GRAND PRIZE — PARAGRAPH 9\".",
    });
    L.defineItem({
      id: "md_fair_boater",
      type: "apparel",
      slot: "head",
      name: "Fair Host's Boater",
      weight: 0.5,
      value: 180,
      unique: true,
      noLoot: true,
      attrs: { presence: 1 },
      skills: { persuasion: 5, trade: 5 },
      tags: ["apparel", "hat", "unique", "souvenir"],
      mesh: "hat_boater",
      desc:
        "A stiff straw boater with the Fair's orange-and-blue ribbon, issued to the hosts who walked the grounds in 1964 answering questions with a smile. " +
        "People still trust the hat. +1 Presence, +5 Persuasion, +5 Trade.",
    });
    L.defineItem({
      id: "md_unisphere_blazer",
      type: "apparel",
      slot: "body",
      name: "Unisphere Blazer",
      weight: 2,
      value: 900,
      unique: true,
      noLoot: true,
      dr: 6,
      attrs: { presence: 1, wits: 1 },
      skills: { persuasion: 10, trade: 10 },
      outfit: "director_suit",
      tags: ["apparel", "clothing", "unique", "souvenir"],
      mesh: "wf_blazer",
      desc:
        'The Fair President\'s own blazer, Unisphere blue with orange piping and the Fair seal on the pocket, tailored for the 1966 national tour and sealed in the Grand Prize Vault with a note: "For the Winner." ' +
        'A lining of ballistic nylon "for the Southern leg." +1 Presence, +1 Wits, +10 Persuasion, +10 Trade.',
    });
    L.defineItem({
      id: "md_presentation_case",
      type: "misc",
      name: "Walnut Presentation Case",
      weight: 3,
      value: 1500,
      unique: true,
      noLoot: true,
      tags: ["valuable", "souvenir", "collectible"],
      mesh: "wf_case",
      desc:
        "The handsome walnut presentation case for the complete set of Souvenirs of Tomorrow, with twenty velvet hollows and the Fair seal in the lid. Sold separately. Never sold. " +
        "A collector at any market will pay a small fortune for it, which is the one promise the Fair ever kept.",
    });
    L.defineItem({
      id: REEL,
      type: "note",
      reel: true,
      name: 'Reel: "Closing Day, 1965"',
      title: "CLOSING DAY — OCTOBER 17, 1965",
      weight: 0,
      value: 20,
      text:
        "[A brass band, slightly flat. Rain on a microphone. A man's voice, the Fair President's, reading from a card:]\n\n" +
        '"Ladies and gentlemen, fifty-one million of you came. You rode the monorail and the sky ride, you shook hands with tomorrow, and you went home ' +
        "believing it. That is the only exhibit that ever mattered. The pavilions will come down. The idea will not.\n\n" +
        "To the lucky soul who someday opens this vault: the Fair Corporation salutes you. Everything in here was meant for a tour of forty-eight " +
        'states that will begin next spring. If you are hearing this and it did not, then keep the blazer. Keep the case. And keep the idea."\n\n' +
        '[Applause. The band starts again. Someone close to the microphone says, very quietly: "Gideon, you can turn it off now."]',
      desc: "A seven-inch tape reel in a World's Fair sleeve, found in the Grand Prize Vault.",
    });
    // Tarbell's 15-medallion prize: the shooting-gallery Grand Prize rifle (cloned from the hunting rifle so the
    // weapons module keeps its viewmodel; straightened sights, a little more punch).
    const base =
      !G.isStub("items") && G.items.get ? G.items.get("hunting_rifle") : null;
    if (base && base.weapon) {
      L.defineItem(
        Object.assign({}, base, {
          id: "md_grand_prize",
          name: "Grand Prize",
          value: 1300,
          unique: true,
          noLoot: true,
          desc:
            "The walnut-and-nickel rifle that hung over the shooting gallery at the Fair's Lake Amusement Area as its GRAND PRIZE, unclaimed in two seasons " +
            "because the gallery sights were bent. Gideon Tarbell straightened them. Every shot rings a little brass bell nobody else can hear.",
          weapon: Object.assign({}, base.weapon, {
            damage: Math.round((base.weapon.damage || 30) * 1.35),
            critChance: 4,
            spread: (base.weapon.spread || 0.02) * 0.6,
            adsSpread: (base.weapon.adsSpread || 0.0015) * 0.6,
            condDecay: (base.weapon.condDecay || 0.003) * 0.6,
          }),
        }),
      );
    } else {
      L.defineItem({
        id: "md_grand_prize",
        type: "misc",
        name: "Grand Prize",
        weight: 6,
        value: 1300,
        unique: true,
        noLoot: true,
        tags: ["valuable", "souvenir"],
        desc: "The walnut-and-nickel rifle from the Fair's shooting gallery. Without a gunsmith in the city, it is a very handsome ornament.",
      });
    }
  }

  L.hook("init", function () {
    defineItems();
    L.quest({
      id: QID,
      category: "misc",
      name: "Souvenirs of Tomorrow",
      giver: "Gideon Tarbell",
      location: "Grand Central Terminal (east balcony)",
      desc:
        "Twenty bronze medallions from the 1964 World's Fair were loaned to New York landmarks before the bombs. Gideon Tarbell, the Fair's last curator, " +
        "buys them back at Grand Central: 25 scrip apiece, a prize at every fifth one in his case, and for the complete set, the key to the Fair's Grand Prize Vault.",
      stages: [
        {
          id: "collect",
          text: () =>
            "Find the World's Fair medallions and bring them to Gideon Tarbell at Grand Central (found " +
            count() +
            "/20, in his case " +
            handed() +
            "/20).",
          markers: () => {
            const out = [];
            if (carried().length || !L.flag("md_met"))
              out.push({ npc: NPC, label: "Gideon Tarbell" });
            // Only the few nearest medallions whose landmark you've discovered.
            const P = G.player.pos,
              near = [];
            for (const s of SPOTS) {
              if (owned(s[1])) continue;
              const pk = L.pickups["md_" + s[0]];
              if (!pk) continue;
              const loc = G.LAYOUT.LOCATIONS.find(
                (l) =>
                  l.id === s[2] ||
                  (s[2] === "nyse" && l.id === "wall_street") ||
                  (s[2] === "statue_of_liberty" && l.id === "liberty"),
              );
              if (loc && !G.discovered.has(loc.id)) continue;
              near.push({
                x: pk.pos.x,
                z: pk.pos.z,
                y: pk.pos.y,
                label: "Medallion (" + s[0].replace(/_/g, " ") + ")",
                d: Math.hypot(P.x - pk.pos.x, P.z - pk.pos.z),
              });
            }
            return out.concat(near.sort((a, b) => a.d - b.d).slice(0, 3));
          },
        },
        {
          id: "vault",
          text: "Open the Grand Prize Vault behind Gideon Tarbell's stall at Grand Central.",
          markers: () => {
            const v = L.world.mdVault;
            return v && v.pos
              ? [
                  {
                    x: v.pos.x,
                    y: v.pos.y,
                    z: v.pos.z,
                    label: "Grand Prize Vault",
                  },
                ]
              : [{ npc: NPC, label: "Gideon Tarbell" }];
          },
        },
      ],
      rewards: { xp: 1000 },
      onComplete() {
        L.notify(
          "The complete set, and the Grand Prize. The walnut presentation case was sold separately after all: to you, for twenty medallions and a walk across a ruined city.",
        );
      },
    });
  });
  // The hero's name is read at runtime: refresh Zeke's note for each new game.
  L.hook("newGame", function () {
    if (G.isStub("items") || !G.items.get) return;
    const d = G.items.get(FLYER);
    if (d) d.text = flyerText();
  });

  // ------------------------------------------------------------------
  // Grand Central: Tarbell's stall, the vault, the man himself
  // ------------------------------------------------------------------
  const GCX = 240,
    GCZ = -226;
  function stallSpot() {
    const a = L.anchor("grand_central", ["east_balcony"], {
      x: 263,
      y: 6.5,
      z: GCZ,
    });
    if (!a) return null;
    return { x: a.x - 0.6, y: a.y, z: a.z + 2.2 };
  }
  L.hook("world", function () {
    const st = stallSpot();
    if (!st) return;
    // a display table with the presentation case (the real one is in the vault: this is the Corporation's sample)
    try {
      const tb = L.prop("table", {
        x: st.x - 1.1,
        y: st.y,
        z: st.z,
        yaw: Math.PI / 2,
        kind: "wood",
      });
      if (tb && !G.isStub("items") && G.items.createItemModel && G.scene) {
        const m = G.items.createItemModel("md_presentation_case");
        if (m) {
          m.position.set(st.x - 1.1, st.y + 0.78, st.z);
          m.rotation.y = -Math.PI / 2;
          m.scale.setScalar(1.4);
          G.scene.add(m);
          L.world.mdDisplay = m;
        }
      }
    } catch (e) {
      G.reportError("quests:md display", e);
    }
    // the Grand Prize Vault: a locked exhibition safe a few steps north of the stall
    if (!G.isStub("containers") && G.containers.create) {
      const vp = L.freeSpot(st.x + 0.4, st.z - 4.2, st.y, {
        maxR: 3,
        radius: 0.5,
      });
      try {
        const locksLive = !G.isStub("locks") && !!G.locks;
        L.world.mdVault = G.containers.create({
          id: "md_fair_vault",
          name: "Grand Prize Vault",
          kind: "safe",
          pos: { x: vp.x, y: vp.y, z: vp.z },
          yaw: -Math.PI / 2,
          items: [
            ["md_unisphere_blazer", 1],
            ["md_presentation_case", 1],
            ["gold_bar", 3],
            ["rally_tonic_extra", 3],
            ["scrip", 500],
            [REEL, 1],
          ],
          lock: locksLive ? Object.assign({}, VAULT_LOCK) : undefined,
          owner: null,
        });
        const c = L.world.mdVault;
        if (c && c.interactable && !locksLive) {
          const en = c.interactable.enabled;
          c.interactable.enabled = () => L.has(KEY) && (!en || en());
        }
      } catch (e) {
        G.reportError("quests:md vault", e);
      }
    }
  });
  L.hook("register", function () {
    if (!G.isStub("locks") && G.locks && G.locks.register) {
      try {
        G.locks.register(Object.assign({}, VAULT_LOCK));
      } catch (e) {
        G.reportError("quests:md vault lock", e);
      }
      try {
        if (G.locks.obtainableFrom)
          G.locks.obtainableFrom(
            KEY,
            "Gideon Tarbell at Grand Central (hand in all twenty World's Fair medallions)",
          );
      } catch (e) {
        /* optional */
      }
    }
  });
