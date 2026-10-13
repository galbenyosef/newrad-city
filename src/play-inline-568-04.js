// play-inline-568 04 — next
// Lines 888-1230 of readable/play-inline-568.pretty.js (statement-aligned).
  ms.dlg("dlg_ms_mq19_watch", "w1").add({
    wait: {
      speaker: "Liberty Island",
      text: () =>
        "It's " +
        clock() +
        ". Liberty Island sits on the water, grey and quiet: a searchlight on the pedestal, the torch dark. The boats move after midnight. The interesting ones move at two.",
      responses: [
        {
          text: "[Wait at the lens until two in the morning.]",
          action: () => {
            waitUntil(1.9, () =>
              ms.talk("dlg_ms_mq19_watch", "Liberty Island", "w1"),
            );
          },
        },
        { text: "[Come back later.]" },
      ],
    },
    w1: {
      speaker: "Liberty Island",
      text: () =>
        lensDesc() +
        "\n\nTwo in the morning. Liberty Island is a black hump on blacker water: searchlights sweeping the star fort, the Rotorcraft pad lit, the torch dark. Then a light low on the water, coming from the Jersey side. A skiff, one candle-lantern in the bow, rowed by a tall man in a hood.",
      responses: [{ text: "[Keep watching.]", next: "w2" }],
    },
    w2: {
      speaker: "Rose",
      text: () =>
        roseVia() +
        "That's Brother Taper's boat. He used to carry me on his shoulders.",
      responses: [
        { text: "[Keep watching.]", next: "w3" },
        { text: "You knew him?", next: "w2b" },
      ],
    },
    w2b: {
      speaker: "Rose",
      text: "Everybody down there knew him. He lit the tunnel lamps. He let me hold the taper. [A pause.] Watch the pier, not me.",
      responses: [{ text: "[Keep watching.]", next: "w3" }],
    },
    w3: {
      speaker: "Liberty Island",
      text: "[On the pier a single Continuity private walks down to meet the skiff alone. No cap, a flashlight he keeps pointed at his boots. The hooded man hands up a bundle wrapped in oilcloth. The private hands down something flat and white: paper. Before the skiff pushes off he touches his collar, and something small and brass catches the lantern light. A sun, with all its rays.]",
      responses: [{ text: "[Keep watching.]", next: "w4" }],
    },
    w4: {
      speaker: "Rose",
      text: () =>
        (ms.f("mq19_lens") === "skyeye" ? "[Over the radio:] " : "") +
        "Teague. Private, gate duty on the pier. He goes to the Dawn Hour on his leave days and thinks nobody notices. [The skiff turns for Jersey.] The Dawn has a man standing next to that key. Of course she does.",
      onEnter() {
        watchDone();
      },
      responses: [
        { text: "Then we report him.", next: "w5" },
        { text: "Then maybe we can use him.", next: "w5" },
        { text: "[Say nothing.]" },
      ],
    },
    w5: {
      speaker: "Rose",
      text: "Report it and they take Teague up the pedestal stairs and he doesn't come down. Keep it quiet and there's a man on Liberty who opens a gate for anybody who knows the word. [She shrugs.] I know the word. Your call.",
      responses: [{ text: "I'll think about it." }],
    },
  });

  // ==================================================================
  // mq20 NUMBERS GAME
  // ==================================================================
  const conKnowsNicole = () =>
    !!(L.flag("ms_con_knows_nicole") || L.flag("con_knows_nicole"));
  function mq20Done() {
    // quests_extra writes the outline names; the finale reads the ms_ names
    if (L.flag("qx_wayte_file_closed") || L.flag("ms_qx_wayte_file_closed"))
      ms.set("wayte_file_closed");
    if (L.flag("qx_pad_kept") || L.flag("ms_qx_pad_kept")) ms.set("pad_kept");
    if (L.flag("skyeye_jammed") && !ms.f("skyeye_jammed"))
      ms.set("skyeye_jammed");
    const note = conKnowsNicole() ? NOTE_NUMBERS_B : NOTE_NUMBERS;
    if (!L.has(NOTE_NUMBERS) && !L.has(NOTE_NUMBERS_B)) {
      L.give(note, 1);
      L.notify(
        "Static tears the decoded name list out of her notebook and folds it into your hand.",
        { duration: 5 },
      );
    }
  }

  // ==================================================================
  // mq21 PURE RECORDS
  // ==================================================================
  function ledgerPos() {
    // "Deposit R-10: Relief Station Ledgers ... see the desk": on desk R-9, beside the microfilm case
    const a = poiAnchor(
      "un_assembly",
      ["records", "tapes", "strongroom"],
      null,
    );
    if (!a) {
      const LI = G._li;
      const t = LI && LI.un && LI.un.anchors && LI.un.anchors.tapes;
      if (t) return { x: t.x + 0.6, y: t.y, z: t.z + 0.2 };
      return null;
    }
    return { x: a.x + 0.6, y: a.y, z: a.z + 0.2 };
  }
  ms.pickup({
    key: "ms_ledger_1968",
    item: NOTE_LEDGER,
    when: () => Q.isActive("mq21") && !ms.f("lock_truth"),
    get at() {
      return ledgerPos();
    },
  });
  /** The microfilm's fate (landmark_interiors writes li_un_tapes_to and, lately, ms_microfilm itself). */
  function syncMicrofilm() {
    const v = L.flag("li_un_tapes_to");
    if (!v) return;
    if (!ms.f("microfilm")) ms.set("microfilm", v);
    if (v === "continuity" && !ms.f("mq21_film_trust")) {
      ms.set("mq21_film_trust");
      ms.addTrust(
        -2,
        "You handed the Continuity the list with her name on it.",
      );
    }
  }
  const keelGone = () =>
    !!(
      ms.f("keel") ||
      L.flag("li_keel_dead") ||
      L.flag("dead_li_keel") ||
      (L.npc("li_keel") && L.npc("li_keel").dead)
    );
  function roseJoinsForKeel() {
    if (keelGone() && !ms.f("keel")) ms.set("keel", "dead");
    if (rose.mode() !== "follow") rose.place("follow");
    if (ms.once("mq21_rose_joins"))
      L.later(1.5, () =>
        rose.say(
          keelGone()
            ? "Keel's dead? [A long breath.] Then it's just the book. Show me."
            : "I said I'd never set foot on their ground. Show me the door. Show me her.",
        ),
      );
  }
  function mq21Poll() {
    if (Q.isStarted("mq21")) syncMicrofilm();
    if (at("mq21", "ledger") && ms.f("lock_truth")) Q.setStage("mq21", "keel");
  }
  G.events.on("noteRead", (id) => {
    if (id === NOTE_LEDGER && !ms.f("lock_truth")) {
      ms.set("lock_truth");
      L.setFlag("lock_truth");
      L.xp(40, "The padlock entry");
      L.later(0.5, () => {
        if (roseNear(18))
          rose.say(
            "Eleven. Behind a padlock. [Very quietly.] Nobody ever told me about the padlock.",
          );
      });
      if (at("mq21", "ledger"))
        L.later(1.5, () => {
          if (at("mq21", "ledger")) Q.setStage("mq21", "keel");
        });
      else refresh("mq21");
    }
    if (id === NOTE_MEMO && !ms.f("memo_read")) {
      ms.set("memo_read");
      if (roseNear(20) && !ms.f("mq22_rose_line")) {
        ms.set("mq22_rose_line");
        L.later(0.6, () =>
          rose.say(
            "That's it. That's what she preaches. A list, and a door, and the people on the wrong side of it.",
            6,
          ),
        );
      }
      if (at("mq22", "memo"))
        L.later(1.2, () => {
          if (at("mq22", "memo")) Q.setStage("mq22", "fate");
        });
    }
  });
  // The confrontation: walking up to Keel with the ledger at stage 'keel' (Rose beside you).
  L.trigger({
    id: "ms_mq21_keel",
    once: false,
    cooldown: 6,
    r: 9,
    pos: () => {
      const a = L.npc("li_keel");
      return a && !a.dead ? a.pos : null;
    },
    cond: () => at("mq21", "keel") && !keelGone() && !ms.f("keel_scene"),
    fire() {
      startKeelScene();
    },
  });
  function startKeelScene() {
    if (!at("mq21", "keel")) return;
    if (keelGone()) {
      ms.talk("dlg_ms_mq21_keel", "Rose", "gone");
      return;
    }
    ms.set("keel_scene");
    L.hostile("li_keel", false);
    ms.talk("dlg_ms_mq21_keel", "Major Keel", "k1");
  }
  function keelOutcome(v) {
    if (ms.f("keel") && ms.f("keel") !== "dead") {
      L.later(0.5, () => {
        if (Q.isActive("mq21")) Q.complete("mq21");
      });
      return;
    }
    ms.set("keel", v);
    if (v === "defects") {
      L.setFlag("keel_defects");
      ms.addTrust(+1, "You helped her forgive.");
      L.xp(80, "Keel will testify");
    }
    if (v === "dead") {
      L.setFlag("keel_dead");
      const a = L.npc("li_keel");
      if (a && !a.dead && a.kill) {
        try {
          a.kill({ silent: true });
        } catch (e) {
          /* */
        }
      }
      L.setFlag("dead_li_keel");
      L.setFlag("li_keel_dead");
    }
    if (v === "spared") L.setFlag("keel_spared");
    L.later(0.5, () => {
      if (Q.isActive("mq21")) Q.complete("mq21");
    });
  }
  ms.dlg("dlg_ms_mq21_keel", "k1").add({
    k1: {
      speaker: "Major Keel",
      text: "[Major Adelaide Keel is alone at the horseshoe table, a cold cup of something at her elbow. She sees the ledger in your hand first. Then she sees Rose: the rifle, the leather cuff, the age. It takes her a second to do the sum.] The Mead child. [Her voice doesn't change.] You lived.",
      responses: [{ text: "[Let Rose speak.]", next: "k2" }],
    },
    k2: {
      speaker: "Rose",
      text: "Eighteenth of February. Mead, Rose, infant, not enrolled, refused. A.K. [She doesn't raise the rifle. She doesn't lower it either.] That's me in your book, Major. And the fifth of March. Eighteen-forty. Padlocked, A.K. Eleven of them.",
      responses: [{ text: "[Wait for Keel.]", next: "k3" }],
    },
    k3: {
      speaker: "Major Keel",
      text: "I followed the list. I locked the door. I have followed it every day since. [She looks at her hands on the table.] Captain Crane kept the key. He went back in for it when the fire reached the counter. Nobody found him until morning. Nobody found any of them until morning.",
      responses: [
        {
          text: "Rose. She has carried that door for twenty-one years. Let her put it down.",
          check: { attr: "presence", value: 6 },
          next: "forgive",
          failNext: "hard",
        },
        { text: "Rose. It's your call.", next: "choice" },
        { text: "[Shoot Major Keel.]", next: "eli_fires" },
        { text: "We're leaving. Live with it, Major.", next: "spared" },
      ],
    },
    hard: {
      speaker: "Rose",
      text: "No. Don't do that. Don't make it sound like a kindness. [The rifle comes up an inch.]",
      responses: [
        { text: "Rose. It's your call.", next: "choice" },
        { text: "[Shoot Major Keel.]", next: "eli_fires" },
        {
          text: "[Put your hand on the barrel.] We're leaving.",
          next: "spared",
        },
      ],
    },
    forgive: {
      speaker: "Rose",
      text: "[A long silence. The rifle goes down an inch at a time until it points at the floor.] ...You'll say it. Out loud, to whoever needs to hear it. The list, the padlock, whose order, whose key. Every word.",
      responses: [{ text: "[Wait for Keel.]", next: "forgive2" }],
    },
    forgive2: {
      speaker: "Major Keel",
      text: "[She stands, slowly, and takes off her cap.] Every word. To anyone. I have been waiting twenty-one years for someone to ask me. [To Rose:] I am sorry. It is not enough. It is what there is.",
      onEnter() {
        keelOutcome("defects");
      },
      responses: [{ text: "[Leave her with it.]" }],
    },
    choice: {
      speaker: "Rose",
      text: "[Rose raises the rifle and puts the post of the sight on Keel's chest. Keel doesn't move. Nobody in the chamber moves.]",
      responses: [
        { text: "[Let her fire.]", next: "rose_fires" },
        {
          text: "[Put your hand on the barrel.] Not like this.",
          next: "spared",
        },
      ],
    },
    rose_fires: {
      speaker: "Rose",
      text: "[One shot. It is very loud under the dome. Keel sits down against the horseshoe table as if she is only tired.] [Rose works the bolt, picks the brass up off the carpet and puts it in her pocket.] That felt like nothing.",
      onEnter() {
        keelOutcome("dead");
      },
      responses: [{ text: "[Say nothing.]" }],
    },
    eli_fires: {
      speaker: "Rose",
      text: "[You fire before Rose can. Keel folds over the horseshoe table and the cold cup goes over with her.] [Rose looks at the body for a long time.] That felt like nothing. [She looks at you.] I thought it would feel like something.",
      onEnter() {
        keelOutcome("dead");
      },
      responses: [{ text: "[Say nothing.]" }],
    },
    spared: {
      speaker: "Rose",
      text: "[Rose lets you push the barrel down.] Fine. Live with it, Major. [At the door, without turning round:] I have.",
      onEnter() {
        keelOutcome("spared");
      },
      responses: [{ text: "[Leave.]" }],
    },
    gone: {
      speaker: "Rose",
      text: "[Rose reads the ledger standing up, both pages, twice. She closes it on her finger.] Keel's dead, and the Captain's been dead since the fire. So it's just the book. [She hands it back.] Keep it. Somebody should have to read it out loud one day.",
      onEnter() {
        if (!ms.f("keel")) ms.set("keel", "dead");
        L.later(0.5, () => {
          if (Q.isActive("mq21")) Q.complete("mq21");
        });
      },
      responses: [{ text: "Somebody will." }],
    },
  });

  // ==================================================================
  // mq22 CONTINUITY OF GOVERNMENT
  // ==================================================================
