// play-inline-563 03 — next
// Lines 657-981 of readable/play-inline-563.pretty.js (statement-aligned).
  L.hook("spawn", function () {
    const st = stallSpot();
    if (st) {
      const p = L.freeSpot(st.x, st.z, st.y, { maxR: 2.5 });
      L.spawnNPC({
        id: NPC,
        type: "human",
        name: "Gideon Tarbell",
        outfit: "director_suit",
        gender: "m",
        faction: "settlers",
        ai: "static",
        pos: p,
        lookYaw: Math.atan2(GCX - p.x, GCZ - p.z) + Math.PI,
        dialogue: DLG,
        essential: true,
        age: 0.9,
        hair: "balding",
        hairColor: 0xe0dcd2,
        glasses: true,
        skinTone: 0.2,
        barks: [
          "Medallions! Bronze World's Fair medallions bought here! Twenty-five scrip apiece, per the schedule!",
          "The Fair closed on October seventeenth, 1965. Nobody told me to stop.",
          "Peace Through Understanding! That was the theme. I still think it was a good one.",
          "Mind the velvet.",
        ],
      });
    }
    // the medallions themselves
    for (const s of SPOTS) {
      if (owned(s[1])) continue;
      const site = G.LAYOUT.getSite(s[2]);
      if (!site) continue;
      const c = {
        x: (site.x0 + site.x1) / 2 + s[4][0],
        z: (site.z0 + site.z1) / 2 + s[4][1],
      };
      const p = L.anchor(s[2], s[3], c, { maxR: 10 });
      if (!p) continue;
      // nudge off the anchor so it doesn't sit inside an NPC standing there
      place(s, { x: p.x + 0.7, y: p.y, z: p.z + 0.5 });
    }
    // The souvenir map in the cryo unit's prep room.
    if (!L.has(FLYER)) {
      const f = flyerSpot();
      if (f) L.pickup("md_flyer", FLYER, 1, f);
    }
  });

  /** Place one medallion: the props stand when props has it, else a plain item pickup. */
  function place(s, pos) {
    const key = "md_" + s[0];
    pos = L.unburyPickup(pos);
    let h = null;
    if (!G.isStub("props") && G.props.spawn) {
      h = L.prop("medallion", {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        medallion: s[1],
        index: SPOTS.indexOf(s),
        collide: false,
        yaw: L.rng() * Math.PI * 2,
      });
      if (h && !h.interactable) {
        try {
          if (h.remove) h.remove();
        } catch (e) {
          /* */
        }
        h = null;
      }
    }
    if (h) {
      L.dyn(h);
      L.pickups[key] = { id: s[1], pos, handle: h };
      return;
    }
    L.pickup(key, s[1], 1, pos);
  }
  function flyerSpot() {
    let a = null;
    try {
      a = G.map.getAnchor && G.map.getAnchor("cryo_c9", "prep_room");
    } catch (e) {
      a = null;
    }
    if (a && isFinite(a.x) && isFinite(a.z)) {
      const f = L.freeSpot(a.x + 0.9, a.z + 0.4, a.y || 0, { maxR: 3 });
      return f || { x: a.x + 0.9, y: a.y || 0, z: a.z + 0.4 };
    }
    const C = L.cryo && L.cryo.spots;
    const base = C && (C.goggles || C.locker);
    return base ? { x: base.x + 0.9, y: base.y, z: base.z + 0.4 } : null;
  }

  // ------------------------------------------------------------------
  // Dialogue: Gideon Tarbell, Deputy Curator of Exhibits (ret., unofficially)
  // ------------------------------------------------------------------
  L.hook("register", function () {
    const handInR = {
      text: () => {
        const n = carried().length;
        return "I have medallions for you. [" + n + "]";
      },
      cond: () => carried().length > 0,
      action: () => {
        lastHandIn = handIn();
      },
      next: "thanks",
    };
    const vaultR = {
      text: "About that vault behind you.",
      cond: () => L.has(KEY) && !L.flag("md_vault_open"),
      next: "vault",
    };
    const bye = { text: "Goodbye, Mr. Tarbell.", end: true };
    L.dialogue(DLG, {
      start: () => (L.flag("md_met") ? "hello" : "first"),
      nodes: {
        first: {
          speaker: "Gideon Tarbell",
          text:
            "Ah! A visitor! Welcome, welcome to the New York World's Fair, Grand Central annex. Gideon Tarbell, Deputy Curator of Exhibits, World's Fair 1964–1965 Corporation. " +
            "[He offers a hand in a white cotton glove, gone grey at the fingertips.] The Fair closed on October seventeenth, 1965. Nobody ever told me to stop, and I have never been a man to presume.",
          onEnter() {
            L.setFlag("md_met", true);
            if (!Q.isStarted(QID)) Q.start(QID);
          },
          responses: [
            { text: "What are you doing up here?", next: "what" },
            { text: "You collect something?", next: "medals" },
            handInR,
            bye,
          ],
        },
        hello: {
          speaker: "Gideon Tarbell",
          text: () => {
            const h = handed();
            return (
              "Welcome back to the Fair! " +
              (h >= 20
                ? "The set is complete. I polish it every morning. It does not need it."
                : "The case shows " +
                  h +
                  " of twenty. " +
                  (h
                    ? "A fine start to a fine collection."
                    : "Empty velvet. It is waiting for you."))
            );
          },
          onEnter() {
            const extra = catchUpMilestones();
            if (extra.length)
              lastHandIn = { n: 0, paid: 0, after: handed(), lines: extra };
          },
          responses: [
            handInR,
            vaultR,
            { text: "What was in it for you, the Fair?", next: "fair" },
            { text: "Remind me about the medallions.", next: "medals" },
            {
              text: "Did I miss a prize?",
              cond: () =>
                !!(lastHandIn && lastHandIn.n === 0 && lastHandIn.lines.length),
              next: "thanks",
            },
            bye,
          ],
        },
        what: {
          speaker: "Gideon Tarbell",
          text:
            "Up here? Curating. In 1965 the great colour photograph hung on this balcony, sixty feet of it, and the Corporation kept an information stand below for visitors catching the train out to Flushing Meadows. " +
            "When the Fair closed they sent me here with the Grand Prize Vault to wait for the national tour train. Spring of '66, they said. [He looks at the safe beside him.] It has been a long spring.",
          responses: [
            { text: "The Grand Prize Vault?", next: "vault_lore" },
            { text: "You collect something?", next: "medals" },
            bye,
          ],
        },
        vault_lore: {
          speaker: "Gideon Tarbell",
          text:
            'The prize for the Souvenirs of Tomorrow promotion. Paragraph nine: "The holder of the complete set shall be entitled to the contents of the Grand Prize Vault." ' +
            "Nobody ever completed the set. I have the key. I have never opened it. That would be against paragraph nine, and paragraph nine is very nearly all I have left.",
          responses: [
            { text: "How do I complete the set?", next: "medals" },
            bye,
          ],
        },
        medals: {
          speaker: "Gideon Tarbell",
          text: () =>
            'Twenty bronze medallions, one for each wonder of the Fair, loaned to twenty great institutions of this city "for public display in perpetuity." Perpetuity turned out to be shorter than advertised. ' +
            "The Corporation buys them back: " +
            PRICE +
            " scrip apiece, per the 1965 buy-back schedule. For every fifth one in my case, a prize. For all twenty, the vault." +
            (count()
              ? " You have found " +
                count() +
                " so far, I see. The bulge in your pocket is very distinctive."
              : ""),
          onEnter() {
            if (!Q.isStarted(QID)) Q.start(QID);
          },
          responses: [
            handInR,
            { text: "What are the prizes?", next: "prizes" },
            bye,
          ],
        },
        prizes: {
          speaker: "Gideon Tarbell",
          text:
            "At five, an official Fair Host's boater. At ten, the first-aid pavilion's last good tonic. At fifteen, the shooting-gallery Grand Prize from the Lake Amusement Area. " +
            "And at twenty, paragraph nine. [He pats his vest pocket.] I will not say what is in the vault. I do not know. That is the beauty of a vault.",
          responses: [handInR, bye],
        },
        thanks: {
          speaker: "Gideon Tarbell",
          text: () => {
            const r = lastHandIn;
            if (!r)
              return "[He looks in your hands, then at you, kindly.] Nothing today? Perpetuity is patient.";
            let t = r.n
              ? "[He sets " +
                (r.n === 1 ? "the medallion" : "all " + r.n + " of them") +
                " into the velvet one at a time, with tweezers.] " +
                r.paid +
                " scrip, per the schedule. That makes " +
                r.after +
                " of twenty. "
              : "";
            if (r.lines.length) t += r.lines.join(" ");
            else {
              const nx = nextMilestone();
              if (nx) t += "Your next prize comes at " + nx + ".";
            }
            return t;
          },
          responses: [
            {
              text: "A pleasure doing business.",
              next: "hello",
              action: () => {
                lastHandIn = null;
              },
            },
            {
              text: "Goodbye.",
              end: true,
              action: () => {
                lastHandIn = null;
              },
            },
          ],
        },
        fair: {
          speaker: "Gideon Tarbell",
          text:
            "For me? I was thirty-eight. I had never been further than Albany. Then for two summers the whole world came to Queens and asked me where the restrooms were, and I knew. " +
            "Peace Through Understanding, that was the theme. Two years later the understanding ran out. [He straightens the velvet.] But the theme was a good one. Somebody ought to keep it on display.",
          responses: [handInR, bye],
        },
        vault: {
          speaker: "Gideon Tarbell",
          text: "It is right there, behind the stall. Go on. I would like to watch, if you do not mind. Twenty-four years is a long time to wonder about a box.",
          responses: [{ text: "Let's see what's inside.", end: true }, bye],
        },
      },
    });
  });

  // ------------------------------------------------------------------
  // Progress
  // ------------------------------------------------------------------
  function refresh(id) {
    const s = id && BY_ID[id];
    if (s && !L.flag("md_" + id)) {
      L.setFlag("md_" + id, true);
      L.later(1.2, () =>
        L.notify(s[6], { sub: "Souvenirs of Tomorrow", duration: 7 }),
      );
      if (L.once("md_hint_tarbell"))
        L.later(9, () =>
          L.hint(
            "medallions",
            "World's Fair medallions grant nothing by themselves: bring them to Gideon Tarbell on Grand Central's east balcony. He pays scrip, and a prize for every fifth one.",
          ),
        );
    }
    if (id === FLYER && !Q.isStarted(QID)) Q.start(QID);
    if (count() > 0 && !Q.isStarted(QID)) Q.start(QID);
    if (Q.isActive(QID) && s) L.refresh(QID);
  }
  function vaultOpened() {
    if (L.flag("md_vault_open")) return;
    L.setFlag("md_vault_open", true);
    L.later(0.8, () => L.say(NPC, "Oh. Oh, my. It was real. It was all real."));
    if (Q.isActive(QID)) Q.complete(QID);
  }
  G.events.on("itemAdded", (id) => refresh(id));
  G.events.on("medallionFound", (id) =>
    refresh(typeof id === "string" ? id : null),
  );
  G.events.on("lockOpened", (id) => {
    if (id === VAULT_LOCK.id) vaultOpened();
  });
  G.events.on("containerOpened", (c) => {
    if (c && (c.id === "md_fair_vault" || c === L.world.mdVault) && L.has(KEY))
      vaultOpened();
  });
  L.medallions = {
    count,
    handed,
    carried,
    handIn,
    SPOTS,
    MILESTONES,
    owned,
    PRICE,
  };
