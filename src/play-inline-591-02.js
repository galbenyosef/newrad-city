// play-inline-591 02 — clock
// Lines 31-380 of readable/play-inline-591.pretty.js (statement-aligned).
  const HP = K.HP,
    PI = K.PI;
  const LR = G.lair;

  const QID = "mq36";
  const Q = () => K.Q();
  const L = () => K.L();
  K.fin = () => {
    if (!K.state.fin) K.state.fin = { phase: "pre" };
    return K.state.fin;
  };
  const F = () => K.fin();
  const stage = () => (Q() ? Q().stage(QID) : null);
  const active = () => !!(Q() && Q().isActive(QID));
  const first = () => K.heroFirst();
  const anchor = (n) => K.anchors[n];
  const inSun = () => K.cellAt(G.player && G.player.pos) === "lair_m42";
  const skill = (id) => {
    if (K.testSkills && K.testSkills[id] !== undefined) return K.testSkills[id];
    const l = L();
    return l ? l.skill(id) : 0;
  };
  const attr = (id) => {
    if (K.testSkills && K.testSkills[id] !== undefined) return K.testSkills[id];
    const l = L();
    return l ? l.attr(id) : 5;
  };
  const later = (s, fn) => {
    if (K.testMode) {
      K.safe("later", fn);
      return;
    }
    const l = L();
    if (l) l.later(s, fn, "lair_fin");
    else fn();
  };

  // ------------------------------------------------------------------
  // The clock (09:31 → 09:47). Scene beats set it; Ending A lets it run.
  // ------------------------------------------------------------------
  K.onClock = (min) => {
    if (K.sun && K.sun.clock) K.sun.clock.set(min);
    F().clock = min;
  };
  function clockTo(min) {
    if (!K.clock.shown() && inSun()) K.clock.show(min);
    else K.clock.set(min);
  }

  // ------------------------------------------------------------------
  // Decisions the Reckoning can be won with
  // ------------------------------------------------------------------
  const I = () => K.in();
  const persuasionNeed = (base) => Math.max(20, base - 5 * K.tokenBonus());
  const presenceNeed = (base) => Math.max(3, base - K.tokenBonus());
  const roseState = () => I().roseState;
  const rosePresent = () =>
    K.alive("rose") &&
    !F().roseGone &&
    (roseState() !== "alone" || !!F().roseArrived);
  const selective = () => I().torch === "selective";
  /** Rose can be talked down: trust >= 3, Presence 8, or Presence 6 with her promise. */
  function talkDownHow() {
    const i = I();
    if (i.roseTrust >= 3) return "trust";
    if (attr("presence") >= presenceNeed(8)) return "presence";
    if (i.rosePromise && attr("presence") >= presenceNeed(6)) return "promise";
    return null;
  }
  const allWon = () =>
    F().guilt === true && F().list === true && F().roseArg === true;
  const bPossible = () =>
    !selective() &&
    allWon() &&
    !F().violence &&
    (F().roseStood === "talk" || F().roseStood === "shield" || !rosePresent());
  /** The second key: Key B (kept) or Tinder's drilled keyway (Tinder alive to finish it, on her order). */
  const cPossible = () => I().keyB !== "destroyed" || K.alive("tinder");
  K.finale = { bPossible, cPossible, talkDownHow, allWon };

  // ------------------------------------------------------------------
  // Flavour: one memory line per token beyond the first
  // ------------------------------------------------------------------
  const TOKEN_LINES = {
    ring: "[Your grandmother's ring. You bought it back with the Long Winter bonus, to give her on thaw day.]",
    record:
      "[On its crate the record reaches the bridge, and she mouths the extra verse, the one she wrote herself, without seeming to know she is doing it.]",
    booth:
      "Booth Four. [She looks at your hands.] You went and sat in my chair, didn't you.",
    rose_page:
      "[In your coat, the certified page from Wren's Register: ROSE. Born at dawn, Track 61. Father: E. W., asleep.]",
    pass: "[Her old pass is in your pocket, the one from the lining of Ruby's green coat: N. MEAD, INTERPRETER, and her face at twenty-eight.]",
    nell: "You found Nell's tapes. [A breath.] Nell always did talk too much. No. Don't tell me where she is.",
    voice:
      '[She says "sleeper" the way the Dawn Hour says it, and you hear now that it was always your name.]',
    poster:
      "[You think of the poster from the crossing, folded in your coat: her younger face, printed over a sun.]",
  };
  function tokenLine(slot) {
    const t = I().tokens.slice(1);
    const k = t[slot];
    return k && TOKEN_LINES[k] ? "\n\n" + TOKEN_LINES[k] : "";
  }

  // ==================================================================
  // THE QUEST
  // ==================================================================
  function defineQuest() {
    const def = {
      id: QID,
      name: "The Second Sun",
      giver: "Sunday, 09:30",
      location: "The M42 substation under Grand Central",
      desc: () =>
        F().ending
          ? "It is over. " + endingSummary()
          : "The M42 substation, the old secret power basement ten storeys under Grand Central, is the Glowkeepers' Sun Room. The Second Sun is set to rise at 09:47. Somebody has to keep the light on.",
      stages: [
        {
          id: "enter",
          text: "Open the M42 door.",
          markers: () => mk("m42_door_face", "The M42 Door"),
          onEnter() {
            later(1.0, () =>
              K.notify("09:30. Behind the M42 door a record is playing.", {
                duration: 5,
              }),
            );
          },
        },
        {
          id: "face",
          text: () => (F().phase === "pre" ? "Face Sister Dawn." : "Nicole."),
          markers: () => [
            {
              npc: "lair_nicole",
              label: F().phase === "pre" ? "Sister Dawn" : "Nicole",
            },
          ],
        },
        {
          id: "stop",
          text: () =>
            "Stop the Second Sun before 09:47." +
            (F().clock
              ? " (09:" + String(F().clock).padStart(2, "0") + ")"
              : ""),
          markers: () =>
            mk("firing_set", "Firing Set").concat(
              mk("breaker", "M42 Main Breaker"),
            ),
        },
        {
          id: "keys",
          text: "Turn the second key on her count.",
          markers: () => mk("plate", "The Keyways"),
        },
        { id: "ending", text: "The Second Sun." },
        {
          id: "fight",
          text: "(Optional) Deal with Brother Tinder and the zealots.",
          sideObjective: true,
          optional: true,
          showIf: () => stage() === "stop",
          doneIf: () => !hostilesLeft(),
        },
      ],
      rewards: { xp: 2000 },
      onComplete() {
        G.events.emit("lairFinaleComplete", F().variant);
      },
    };
    const ms = K.msLib();
    if (ms && ms.quest) ms.quest(def);
    else {
      def.main = true;
      def.category = "main";
      def.act = 5;
      def.order = 36;
      def.actLabel = "Act V: The Second Sun";
      G.quests.define(def);
    }
  }
  function mk(name, label) {
    const a = anchor(name);
    return a ? [{ x: a.x, z: a.z, y: a.y, label, interior: true }] : [];
  }
  function setStage(s) {
    if (!Q()) return;
    if (!Q().isStarted(QID)) Q().start(QID, { stage: s });
    else Q().setStage(QID, s);
  }

  // ==================================================================
  // ENTERING THE SUN ROOM → the recognition
  // ==================================================================
  K.onEnterSunRoom = function () {
    K.sunDress();
    if (Q() && !Q().isStarted(QID) && K.m42Open()) Q().start(QID);
    if (!active()) {
      if (F().ending) K.spawnSunCast();
      return;
    }
    K.releaseStoryRose();
    K.spawnSunCast();
    if (stage() === "enter" || F().phase === "pre") later(0.7, recognition);
    else {
      clockTo(F().clock || 32);
      later(1.2, resumeTalk);
    }
  };
  K.finaleLocksDoor = function () {
    if (!active()) return null;
    const s = stage();
    if (s === "face" || s === "keys")
      return "Not now. Not with her standing there.";
    return null;
  };

  function freeze(v) {
    if (G.player) G.player.frozen = !!v;
    F()._frozen = !!v;
  }
  function lookAt(x, z, y) {
    const P = G.player;
    if (!P) return;
    const dx = x - P.pos.x,
      dz = z - P.pos.z;
    P.yaw = Math.atan2(-dx, -dz);
    P.pitch = Math.atan2((y || 1.4) - (P.pos.y + 1.6), Math.hypot(dx, dz));
  }
  function musterLine() {
    const NAMES = {
      lancers: "the Lancers",
      hale: "Hale's defectors",
      keel: "Major Keel",
      kong: "KONG's Brutes",
      neon: "Kincaid's Neon Guard",
      gc_guards: "the Grand Central guards",
      lys: "Mademoiselle Lys",
      zeke: "Zeke",
      calloway: "Dr. Calloway",
    };
    const m = I()
      .musters.map((id) => NAMES[id])
      .filter(Boolean);
    return m.length
      ? "Behind you, " +
          m.join(", ") +
          " put their backs to the M42 door. Allies hold it. Whatever happens in here is yours."
      : "The M42 door groans shut behind you. Nobody is holding it. Whatever happens in here is yours.";
  }
  function recognition() {
    const f = F();
    if (f.phase !== "pre" || !active()) return;
    f.phase = "cards";
    setStage("face");
    clockTo(31);
    K.setFlag("ms_fin_started", true);
    G.events.emit("lairRecognition");
    const n = K.npc("lair_nicole");
    const np = n ? n.pos : anchor("nicole");
    // pan to her back while the room settles
    const P = G.player,
      y0 = P.yaw,
      p0 = P.pitch;
    const dx = np.x - P.pos.x,
      dz = np.z - P.pos.z,
      y1 = Math.atan2(-dx, -dz),
      p1 = -0.08;
    const lib = L();
    const cards = () => {
      freeze(true);
      const st = roseState();
      const roseCard =
        st === "with_eli"
          ? "Rose is beside you. Her rifle is up, and it isn't pointed at anything yet."
          : st === "captive"
            ? "By the cradle, Rose sits on the floor with her wrists bound, her rifle gone. She doesn't look at you."
            : null;
      const list = [
        musterLine(),
        'The Sun Room. Nine dead machines stand in a ring like black standing stones. In the middle, on a railway flatcar, the Second Sun: a pale casing stencilled SIROCCO 2. A dosimeter clicks. A record turns "Two Bits and a Kiss". The clock from the information booth hangs on a converter and says 09:31.',
        roseCard,
        I().hollowell === "ally" && K.alive("hollowell")
          ? "Keeper Hollowell comes in behind you and stops. His hands are shaking."
          : null,
        "The Glowkeepers kneel. A woman in grey robes, her back to you, is lighting a candle by a small wooden cradle. On the card table beside her lies a gilt mask with twelve rays.",
        "She shakes the match out, with a flick of the wrist you have seen exactly once before, by candlelight, in the dark concourse in November 1965. And she turns.",
        {
          text: "Grey through the dark hair. A burn scar from the left jaw down the neck. Older, thinner: fifty. The gap in her front teeth. And the eyes. Nobody else in the world.",
          onShow: () => turnNicole(),
        },
        { who: first(), text: '"Nicky."' },
        "The Glowkeepers look up. Nobody has ever heard the Dawn called by a name.",
      ];
      K.cards(list, () => {
        freeze(false);
        const a = K.npc("lair_nicole");
        if (a) a.name = "Nicole";
        f.phase = "hello";
        clockTo(32);
        later(0.2, startTalk);
      });
    };
    if (lib && lib.cinematic && !G.SMOKE)
      lib.cinematic(
        2.4,
        (e) => {
          P.yaw = y0 + G.util.wrapAngle(y1 - y0) * e;
          P.pitch = p0 + (p1 - p0) * e;
        },
        cards,
      );
    else {
      P.yaw = y1;
      cards();
    }
  }
  function turnNicole() {
    const a = K.npc("lair_nicole");
    if (!a) return;
    a.name = "Nicole";
    K.face("lair_nicole", G.player.pos.x, G.player.pos.z);
  }
  function startTalk() {
    if (K.testMode) return;
    const a = K.npc("lair_nicole");
    if (!K.live("dialogue")) return;
    K.safe("dlg.start", () =>
      G.dialogue.start("lair_dlg_dawn", a || null, { name: "Nicole" }),
    );
  }
  function resumeTalk() {
    if (
      !active() ||
      stage() !== "face" ||
      !inSun() ||
      F().phase === "pre" ||
      F().phase === "cards"
    )
      return;
    if (G.state === "play" && !(K.live("dialogue") && G.dialogue.isActive()))
      startTalk();
  }

  // ==================================================================
  // THE CONVERSATION (Nicole) — recognition, Reckoning, Rose's moment, the choice
  // ==================================================================
  const nicole = () => "Nicole";
