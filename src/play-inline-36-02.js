// play-inline-36 02 — out
// Lines 359-576 of readable/play-inline-36.pretty.js (statement-aligned).
  function tick() {
    if (G.state === "title" || !G.time) return;
    const h = G.time.hour,
      day = G.time.day;
    const crossed =
      lastHour !== null &&
      ((lastHour < START && h >= START) ||
        (lastHour > h && h >= START && h < END));
    lastHour = h;
    if (dawn.on) {
      if (dawn.forced ? G.time.real > dawn.until && !inWindow() : !inWindow())
        endDawn();
      else if (silenced() && !dawn.forced) endDawn();
      return;
    }
    if (inWindow() && R.flags.dawnDay !== day) {
      if (silenced() || questScene()) {
        R.flags.dawnDay = day;
        if (crossed && !questScene()) quietMorning();
        return;
      }
      startDawn({});
    }
  }

  // ------------------------------------------------------------------
  // Rocky's patter, stock-line gates, Continuity Radio
  // ------------------------------------------------------------------
  function patter() {
    const st = T.story,
      out = [];
    const end = ending();
    if (end && end[0] === "C") return out;
    if (done("mq03")) {
      out.push(...st.missingHour);
      if (!done("mq10")) {
        const n = flag("notice_sundays") ? st.noticeSundays : st.noticePlain;
        out.push(...n, ...n);
      }
    }
    if (done("mq10") && !started("mq29")) out.push(...st.reply);
    if (done("mq03") && !done("mq18")) out.push(...st.flint);
    if (done("mq11") && !finaleOver()) out.push(...st.wren);
    if (flag("waldorf_jammer_down") && !started("mq29")) out.push(...st.jammer);
    if (
      (done("mq20") ||
        any("read_7a", "directive_7a_read", "un_terminal_opened")) &&
      !finaleOver()
    )
      out.push(...st.directive);
    if (done("mq06") && !started("mq29")) out.push(...st.liberty);
    if (done("mq26") && !flag("zeke_dead") && !end) out.push(...st.zeke);
    const t = torch();
    if (t && st.torch[t] && !finaleOver())
      out.push(...st.torch[t], ...st.torch[t]);
    if (started("mq29") && !finaleOver())
      out.push(...st.secondSun, ...st.secondSun);
    if (flag("evacuation_called") && !finaleOver())
      out.push(...st.evacuation, ...st.evacuation);
    if (end && end[0] === "A") out.push(...st.endA, ...st.endA);
    if (end && end[0] === "B") {
      const c = end === "B1" ? "three" : "two";
      out.push(...st.endB.map((l) => l.replace("{count}", c)));
    }
    if (end && t === "reclamation") out.push(...st.blue);
    return out;
  }
  /** Stock lines the story has overtaken (exact phrases → still true?). */
  const GATES = [
    ["Bear Market Betty", () => !flag("betty_dead")],
    ["Tollbooth Tony", () => !flag("tony_dead")],
    ["Liberty Island's lit up", () => !done("mq06")],
    [
      "The Glowkeepers at Saint Patrick",
      () => !started("mq29") && !finaleOver(),
    ],
    ["Zeke Marlow came by the station", () => !done("mq26")],
    [
      "The Continuity's drones were buzzing",
      () => !(ending() && flag("hale_defects")),
    ],
  ];
  function allowed(line) {
    if (!line) return true;
    for (const g of GATES) if (line.indexOf(g[0]) >= 0 && !g[1]()) return false;
    return true;
  }
  function continuitySpeeches() {
    const C = T.continuityStory,
      out = T.continuitySpeeches.concat(C.base);
    if (done("mq06")) out.push(...C.liberty, ...C.liberty);
    if (flag("crane_dead")) out.push(...C.craneDead, ...C.craneDead);
    if (flag("attribution_broadcast")) out.push(...C.order, ...C.order);
    const t = torch();
    if (t && C.torch[t]) out.push(...C.torch[t], ...C.torch[t], ...C.torch[t]);
    return out;
  }

  // (Rocky's bulletins for the story's public events — the notice, Nell's tapes, the memo, File 67-03-05, the Second
  //  Dawn, the evacuation — are written by the main line itself via G.radio.addNews; this file only adds patter.)
  G.events.on("questFlag", (name, v) => {
    if (v && /^(ms_ending|lair_ending|finale_ending)$/.test(name)) endDawn();
  });
  G.events.on("questCompleted", (q) => {
    const id = q && (q.id || q);
    if (id === "mq36") endDawn();
  });
  G.events.on("ending", (slides, id) => {
    if (id && /^[ABC][123]?$/i.test(String(id))) {
      R.flags.ending = String(id).toUpperCase();
      endDawn();
    }
  });
  G.events.on("reset", () => {
    dawn.on = false;
    dawn.forced = false;
    dawn.id = null;
    dawn.played = -1;
    lastHour = null;
  });

  // ------------------------------------------------------------------
  // Hooks for 50_radio.js
  // ------------------------------------------------------------------
  S.radioStory = {
    tick,
    patter,
    allowed,
    continuitySpeeches,
    dawnLive() {
      return dawn.on && (dawn.forced || !silenced());
    },
    rfmDead() {
      const e = ending();
      return !!(e && e[0] === "C");
    },
    /** Program for station 'dawn': this morning's sermon once, then an open carrier. */
    dawnItem() {
      if (dawn.on && dawn.played !== dawn.serial) {
        dawn.played = dawn.serial;
        return {
          kind: "talk",
          lines: [["#sting", "pirate"]].concat(talkLines(dawn.id)),
          then: { kind: "deadair" },
        };
      }
      return { kind: "deadair" };
    },
    /** A broadcast reached its last caption on `station` while the player was tuned in. */
    mark(id, station) {
      R.flags["dawn_h_" + id] = heardN(id) + 1;
      R.flags.dawn_heard = (R.flags.dawn_heard || 0) + 1;
      G.events.emit("dawnHour", { phase: "heard", id, station });
    },
    stage,
    ending,
    torch,
    done,
  };

  // ------------------------------------------------------------------
  // Public: G.radio.dawnHour (quests / lair / debug)
  // ------------------------------------------------------------------
  function transcript(id) {
    id = id || dawn.id || "match";
    if (!DT.sermons[id] || !Array.isArray(DT.sermons[id])) return "";
    const fillT = R._fill || ((x) => x);
    return sermonLines(id)
      .map((l) => (l[0] === DT.speaker ? "" : "[" + l[0] + "] ") + fillT(l[1]))
      .join("\n\n");
  }
  function attach() {
    if (!G.radio || G.radio.dawnHour) return;
    G.radio.dawnHour = {
      /** Is the Dawn Hour on the dial right now? */
      onAir() {
        return S.radioStory.dawnLive();
      },
      /**
       * Put a Dawn Hour on the air now. opts: {id: sermon id, seize: true → also over whatever station is playing
       * and switches the goggle radio on}. Returns false while the Dawn is silenced (relay cut / finale over) unless force.
       */
      play(opts) {
        opts = Object.assign({ force: true }, opts || {});
        return startDawn(opts);
      },
      /** Times a sermon was heard to the end (id), or the total. */
      heard(id) {
        return id ? heardN(id) : R.flags.dawn_heard || 0;
      },
      /** Plain-text transcript of a sermon (for a note / tape reel item): 'match', 'spring', 'secondDawn' … */
      transcript,
      /** Sermon ids. */
      sermons() {
        return Object.keys(DT.sermons).filter((k) =>
          Array.isArray(DT.sermons[k]),
        );
      },
      /** The sermon the next Dawn Hour would read. */
      next() {
        return chooseSermon();
      },
      /** Game hours until the next 05:47. */
      hoursUntil() {
        const h = G.time.hour;
        return (((START - h) % 24) + 24) % 24;
      },
    };
    G.radio.story = {
      stage,
      ending,
      torch,
      done: (id) => done(id),
      patter: () => patter().slice(),
    };
  }
  attach();
  if (!G.radio || !G.radio.dawnHour) setTimeout(attach, 0);
