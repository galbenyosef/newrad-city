// play-inline-564 04 — flag
// Lines 978-1327 of readable/play-inline-564.pretty.js (statement-aligned).
  function placeZeke() {
    if (L.flag("dead_lib_zeke") || !ms()) return;
    const p0 = ms().resolve(zekeWhere());
    if (!p0) return;
    const p = L.freeSpot(p0.x, p0.z, p0.y, { maxR: 5 });
    const a = L.npc("lib_zeke");
    if (!a)
      L.spawnNPC({
        id: "lib_zeke",
        type: "human",
        name: "Zeke Marlow",
        outfit: SH.cryoSuit,
        gender: "m",
        faction: SH.sleeperFaction,
        ai: "static",
        essential: true,
        hostile: false,
        dialogue: "dlg_lib_zeke",
        hair: "grey",
        skinTone: 0.35,
        voice: "m_old",
        barks: [
          "Water pressure on this island is a crime.",
          first() + "? That you?",
        ],
        pos: p,
      });
    else if (Math.hypot(a.pos.x - p.x, a.pos.z - p.z) > 6)
      L.moveNPC("lib_zeke", p);
  }
  // Calloway: in her cell until freed; Grand Central after the torch. Act V may move her (ms.callowayPlace).
  function placeCalloway() {
    if (L.flag("dead_ms_calloway") || !ms()) return;
    let w;
    if (L.flag("ms_calloway_at")) w = L.flag("ms_calloway_at");
    else if (L.flag("ms_calloway_home"))
      w = {
        site: "grand_central",
        anchors: ["bar", "oyster_bar", "merchant2"],
        fallback: { x: 226, z: -238 },
        dx: -1.6,
        dz: 1.2,
      };
    else w = SPOTS.casemate();
    const p0 = ms().resolve(w);
    if (!p0) return;
    const p = L.freeSpot(p0.x, p0.z, p0.y, { maxR: 5 });
    const a = L.npc("ms_calloway");
    if (!a)
      L.spawnNPC({
        id: "ms_calloway",
        type: "director_calloway",
        preset: "calloway",
        name: "Dr. Ruth Calloway",
        outfit: "director_suit",
        gender: "f",
        age: 66,
        hair: "bun",
        hairColor: 0xc9c3b8,
        glasses: true,
        faction: SH.sleeperFaction,
        ai: "static",
        essential: true,
        hostile: false,
        dialogue: "dlg_ms_calloway",
        pos: p,
        barks: [
          "Coffee. Is there coffee? There is never coffee.",
          "Twenty-two years, and the paperwork still isn't done.",
        ],
      });
    else if (Math.hypot(a.pos.x - p.x, a.pos.z - p.z) > 6)
      L.moveNPC("ms_calloway", p);
  }
  L.hook("init", function () {
    const M = ms();
    if (!M) return;
    M.zekePlace = function (where) {
      L.setFlag("ms_zeke_at", where || null);
      placeZeke();
    };
    M.callowayPlace = function (where) {
      L.setFlag("ms_calloway_at", where || null);
      placeCalloway();
    };
    M.liberty = { arrive, landed };
    M.fireArray = fireArray;
    M.worldSlides = worldSlides;
  });

  // Teague at the side gate (only if he wasn't reported): the passphrase "A DIMANCHE".
  L.hook("init", function () {
    const M = ms();
    if (!M) return;
    M.actor({
      id: "ms_teague",
      when: () =>
        L.flag("ms_teague") === "free" &&
        (at("mq06", "pedestal") || at("mq06", "land")) &&
        !L.flag("ms_gate_opened"),
      def: () => ({
        type: "private_teague",
        preset: "teague",
        name: "Private Teague",
        gender: "m",
        age: 20,
        outfit: "continuity_uniform",
        faction: SH.conFaction,
        hostile: false,
        essential: true,
        ai: "guard",
        home: "here",
        homeR: 2,
        level: 6,
        dialogue: "dlg_ms_teague",
        at: SPOTS.gate(),
        barks: ["Halt. ...Password?"],
      }),
    });
    M.dlg("dlg_ms_teague", "gate").add({
      gate: {
        speaker: "Private Teague",
        text: "[A young private at the sally port of the star fort, rifle held wrong, eyes too bright. Under his collar you can see a cord with something round on it.] Halt. Who goes there. ...You have to say the word. I can't open it unless you say the word.",
        responses: [
          { text: '"A dimanche."', next: "open" },
          { text: '"Long Winter."', next: "wrong" },
          { text: "[Leave him.]" },
        ],
      },
      open: {
        text: "[He breathes out.] The Light keeps. [He unbolts the gate.] Through the casemates, up the stair, you'll come out under the command post. They're all down at the beach. Go. She said you'd come. She said you'd know the word.",
        onEnter() {
          L.setFlag("ms_gate_opened");
          L.xp(60, "Teague's gate");
          for (const id of ["lib_rourke", "lib_dunn"]) L.hostile(id, false);
          if (at("mq06", "pedestal")) Q.setStage("mq06", "command");
        },
        responses: [
          { text: "Who said?", next: "who" },
          { text: "[Go through.]" },
        ],
      },
      who: {
        text: "The Dawn. [He touches the round thing under his collar.] I can't say more. I already said more. Go.",
        responses: [{ text: "[Go through.]" }],
      },
      wrong: {
        text: "That's — no. No, that's the Colonel's word. [He looks like he might cry.] Please go away.",
        responses: [
          { text: "[Try again.]", next: "gate" },
          { text: "[Leave him.]" },
        ],
      },
    });
  });

  L.hook("world", function () {
    registerLocks();
    // landmarks_b places a teletype in the pedestal command room; it IS the torch control. Otherwise we place our own.
    const lb =
      !G.isStub("landmarks") && G.landmarks.getAnchor
        ? G.landmarks.getAnchor("statue_of_liberty", "terminal")
        : null;
    if (lb && isFinite(lb.x))
      L.world.term_liberty_torch = {
        pos: L.V3(lb.x, (lb.y || 0) + 1.1, lb.z),
        handle: null,
        external: true,
      };
    else {
      const t = torchTerminalSpot();
      if (t) L.spawnTerminal("liberty_torch", t, 0);
    }
  });
  L.hook("register", registerLocks);

  // Liberty set dressing the quests need: the duty log on the command desk, the evidence locker, Crane's safe.
  let libGen = -1;
  L.hook("spawn", function () {
    if (libGen === L.gen) return;
    libGen = L.gen;
    const cp = spot(["command_desk", "command_post", "commander"], 0.12, 15);
    if (cp && !L.has("ms_note_crane_duty"))
      L.pickup("ms_crane_duty", "ms_note_crane_duty", 1, {
        x: cp.x + 0.8,
        y: cp.y,
        z: cp.z + 0.4,
      });
    const ev0 = spot(["evidence_locker", "armory", "footlocker"], 0.45, 17);
    const ev = ev0 ? L.freeSpot(ev0.x, ev0.z, ev0.y, { maxR: 4 }) : null;
    liberty.evidence = ev;
    if (ev && !L.flag("ms_evidence_emptied")) {
      const items = [["ms_key_b", 1]];
      if (L.flag("ms_codebook_on_liberty") || L.flag("ms_bureau") === "expose")
        items.push(["ms_sirocco_codebook", 1]);
      const h = L.dyn(
        L.prop("locker", {
          x: ev.x,
          y: ev.y,
          z: ev.z,
          yaw: 0,
          items,
          name: "Evidence Locker",
          id: "ms_lib_evidence_locker",
          lock: Object.assign({}, LOCKS.evidence),
          noSave: false,
        }),
      );
      if (!h || (!h.container && !h.interactable))
        L.pickup("ms_keyb_fb", "ms_key_b", 1, {
          x: ev.x,
          y: (ev.y || 0) + 0.9,
          z: ev.z,
        });
    }
    const sf0 = spot(["crane_safe", "safe", "commander"], -0.2, 15);
    const sf = sf0 ? L.freeSpot(sf0.x + 1.2, sf0.z, sf0.y, { maxR: 4 }) : null;
    liberty.safe = sf;
    if (sf && !L.flag("ms_safe_emptied")) {
      const h = L.dyn(
        L.prop("safe", {
          x: sf.x,
          y: sf.y,
          z: sf.z,
          yaw: 0,
          items: [["ms_note_file_670305", 1]],
          name: "Colonel Crane's Safe",
          id: "ms_lib_crane_safe",
          lock: Object.assign({}, LOCKS.safe),
          noSave: false,
        }),
      );
      if (!h || (!h.container && !h.interactable))
        L.pickup("ms_file_fb", "ms_note_file_670305", 1, {
          x: sf.x,
          y: (sf.y || 0) + 0.9,
          z: sf.z,
        });
    }
  });
  L.hook("init", function () {
    const M = ms();
    if (!M) return;
    M.spot({
      id: "ms_spot_poster",
      label: "Noticeboard (wanted poster)",
      verb: "Read",
      when: () => Q.isStarted("mq06") && !M.hasToken("poster"),
      at: SPOTS.poster,
      use() {
        M.talk("dlg_ms_poster", "Noticeboard");
      },
    });
    M.dlg("dlg_ms_poster", "look").add({
      look: {
        speaker: "",
        text: "A wanted poster from 1968, yellow under its drawing pins: THE MATCH WOMAN. MEAD, N. — ARSON — 12 DEAD. A sketch of a woman of about twenty-nine with her chin up, drawn from memory by someone who mostly got it right. Pencilled underneath: PRESUMED DEAD. FILE CLOSED. And under that, in another hand: NOT BELIEVED. — A.C.",
        responses: [
          {
            text: "[Take the poster.]",
            action: () => {
              if (!L.has("ms_note_wanted_1968"))
                L.give("ms_note_wanted_1968", 1);
              M.token("poster");
              L.xp(15, "The Match Woman");
            },
          },
          { text: "[Leave it.]" },
        ],
      },
    });
    M.spot({
      id: "ms_spot_casemate",
      label: "Casemate cell door",
      verb: "Open",
      when: () => Q.isStarted("mq26") && !L.flag("ms_casemate_open"),
      at: SPOTS.casemate,
      use() {
        const open = () => {
          L.setFlag("ms_casemate_open");
          L.sfx("door_open");
          L.notify(
            "The cell door grinds open on a stone room, a cot, a bucket, and a grey-haired woman in a director's suit sitting very straight on the cot as if she were in a meeting.",
            { duration: 7 },
          );
          if (L.flag("ms_rose_detained") && !L.flag("ms_rose_freed")) {
            L.setFlag("ms_rose_freed");
            M.rose.place("follow");
            L.later(2, () =>
              M.rose.say(
                "Took you long enough. [Rose was in the next cell. She rubs her wrist.] He didn't get the cuff off. Nobody gets the cuff off.",
              ),
            );
          }
          placeCalloway();
        };
        if (G.locks && G.locks.open && !G.isStub("locks")) {
          try {
            G.locks.open(Object.assign({}, LOCKS.casemate), open);
          } catch (e) {
            open();
          }
        } else if (L.has("ms_casemate_key")) open();
        else
          L.notify(
            "Locked. A heavy old lock; the key must be somewhere on the island.",
          );
      },
    });
    // Lys and Corbeau, held since they were reported (bs_expose)
    M.actor({
      id: "ms_lys_cell",
      when: () =>
        L.flag("ms_bureau") === "expose" &&
        Q.isStarted("mq26") &&
        !L.flag("ms_sept_freed"),
      def: () => ({
        type: "human",
        name: "Mademoiselle Lys",
        gender: "f",
        outfit: "merchant",
        faction: SH.sleeperFaction,
        hostile: false,
        essential: true,
        ai: "static",
        dialogue: "dlg_ms_sept_cell",
        at: statueSpot(["cell2", "casemate_cell", "spawn_in3"], 1.35, 30),
      }),
    });
    M.dlg("dlg_ms_sept_cell", "hi").add({
      hi: {
        speaker: "Mademoiselle Lys",
        text: "[Lys sits on a cot with her coat folded beside her; Corbeau lies on the other with his hat over his face.] Monsieur. You reported us, and here you are anyway. The Continuity put Corbeau's codebook in the same locker as their precious key. Let us out, and take the book. I would rather you had it than the sun people.",
        responses: [
          {
            text: "[Unlock the cell.] Go. Both of you.",
            action: () => {
              L.setFlag("ms_sept_freed");
              L.xp(40, "Freed Lys and Corbeau");
              L.notify(
                "Lys and Corbeau slip out through the casemates toward the water. Corbeau tips his hat without a word.",
              );
            },
          },
          { text: "Not yet." },
        ],
      },
    });
  });

