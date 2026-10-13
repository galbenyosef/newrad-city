/* src/sound/52_radio_story.js */
/* =====================================================================
 * NEW RAD CITY — SOUND MODULE · 52_radio_story.js
 * The main story on the radio (S.radioStory, used by 50_radio.js):
 *   · THE DAWN HOUR — Sister Dawn's pirate sermon at 05:47 game time
 *     (station 'dawn', 97.1, on the dial for ~40 game minutes). It steps on
 *     Radio Free Manhattan (whistle + static, then the sermon in captions,
 *     then Rocky grumbling). Captions only: never voiced in any voice mode.
 *     The sermon is picked by story progress (new clues first); after the
 *     Torch is set it seizes every frequency for the Second Dawn proclamation.
 *     Silent while the First Journal relay is cut (until mq29) and forever once
 *     the finale has been played.
 *   · Rocky's story patter + bulletins, Continuity Radio's Directive 7-A /
 *     Liberty lines, gates on stock lines the story has overtaken, and Radio
 *     Free Manhattan's dead air after the Second Sun (ending C).
 * Progress is read from the quests module at call time and degrades to "Act 1"
 * without it: a main quest counts as done when G.quests.isComplete(id) or flag
 * `ms_<id>` / `ms_<id>_done` is set (mq01..mq36 per story/outline.json).
 * Events: dawnHour({phase:'start'|'heard'|'end', id, station}).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const S = G._snd;
  const T = S.radioText;
  const DT = S.dawnText;
  const R = S.radio;
  const pick = (a) => a[(Math.random() * a.length) | 0];

  // ------------------------------------------------------------------
  // Story progress (read-only, all guarded)
  // ------------------------------------------------------------------
  function Q() {
    return R._questsLive ? R._questsLive() : null;
  }
  function raw(k) {
    return R._qFlag ? R._qFlag(k) : undefined;
  }
  /**
   * A story flag by its outline name, read from the main line's own flags (src/quests/NOTES.md: the `ms_*` list) first,
   * then the bare name. Value-coded flags are mapped (ms_notice 'sundays', ms_nell 'broadcast', ms_core 'broadcast' …).
   */
  const MAP = {
    notice_sundays: () => raw("ms_notice") === "sundays",
    notice_plain: () => raw("ms_notice") === "plain",
    dawn_relay_cut: () =>
      raw("ms_dawn_relay_cut") || raw("ms_dawn_relay") === "cut",
    nell_broadcast: () => raw("ms_nell") === "broadcast",
    core_broadcast: () => raw("ms_core") === "broadcast",
    evacuation_called: () => raw("ms_evacuation_called") || raw("ms_evac_gc"),
    crane_dead: () => raw("ms_crane") === "dead",
    zeke_free: () => raw("ms_zeke_free"),
    read_7a: () => raw("ms_read_7a_schedule") || raw("ms_rose_read_schedule_c"),
    waldorf_jammer_down: () =>
      raw("ms_waldorf_jammer_down") || raw("pmid_jammer_off"),
  };
  function flag(k) {
    if (/^ms_/.test(k)) return raw(k);
    const m = MAP[k] ? MAP[k]() : raw("ms_" + k);
    if (m !== undefined && m !== null && m !== false && m !== "") return m;
    return raw(k);
  }
  function done(id) {
    return (
      !!(R._qDone && R._qDone(id)) ||
      !!flag("ms_" + id) ||
      !!flag("ms_" + id + "_done")
    );
  }
  function active(id) {
    return !!(R._qActive && R._qActive(id));
  }
  function started(id) {
    if (done(id) || active(id)) return true;
    const q = Q();
    try {
      return !!(q && q.isStarted && q.isStarted(id));
    } catch (e) {
      return false;
    }
  }
  /** Play order of the main line (outline n = index + 1). */
  const ORDER = [
    "mq01",
    "mq02",
    "mq03",
    "mq07",
    "mq08",
    "mq09",
    "mq10",
    "mq11",
    "mq12",
    "mq13",
    "mq14",
    "mq15",
    "mq16",
    "mq17",
    "mq18",
    "mq04",
    "mq19",
    "mq20",
    "mq21",
    "mq05",
    "mq22",
    "mq23",
    "mq24",
    "mq06",
    "mq25",
    "mq26",
    "mq27",
    "mq28",
    "mq29",
    "mq30",
    "mq31",
    "mq32",
    "mq33",
    "mq34",
    "mq35",
    "mq36",
  ];
  /** Highest main quest done, as outline n (0 = none). */
  function stage() {
    let n = 0;
    ORDER.forEach((id, i) => {
      if (done(id)) n = i + 1;
    });
    const f = +flag("ms_stage") || 0;
    return Math.max(n, f);
  }
  /** Finale ending letter+variant ('A1' … 'C2') or null. */
  function ending() {
    const e =
      raw("ms_ending") ||
      raw("lair_ending") ||
      raw("finale_ending") ||
      raw("ending_choice") ||
      R.flags.ending ||
      null;
    return e && /^[ABC][123]?$/i.test(String(e))
      ? String(e).toUpperCase()
      : null;
  }
  function finaleOver() {
    return !!ending() || done("mq36");
  }
  /** The Torch program chosen in mq28: reclamation | selective | charter | destroyed | null. */
  function torch() {
    const t = raw("ms_torch") || raw("torch") || raw("torch_mode");
    if (typeof t === "string" && t) return t.toLowerCase();
    if (flag("sky_clean")) return "reclamation";
    if (flag("the_cleaning")) return "selective";
    return null;
  }
  const any = (...ks) => ks.some((k) => !!flag(k));

  // ------------------------------------------------------------------
  // The Dawn Hour
  // ------------------------------------------------------------------
  const START = 5 + 47 / 60,
    END = 6.45; // on the air 05:47 → ~06:27 game time
  const dawn = {
    on: false,
    forced: false,
    until: 0,
    id: null,
    serial: 0,
    played: -1,
  };
  function heardN(id) {
    return R.flags["dawn_h_" + id] || 0;
  }
  /** The main line plays its own captioned Dawn Hour scene this morning (mq10's 'dawnhour' stage): stay off the air. */
  function questScene() {
    if (raw("ms_dh_playing")) return true;
    const q = Q();
    try {
      return !!(
        q &&
        q.stage &&
        q.isActive &&
        q.isActive("mq10") &&
        q.stage("mq10") === "dawnhour"
      );
    } catch (e) {
      return false;
    }
  }
  function silenced() {
    if (finaleOver()) return true;
    if (flag("dawn_relay_cut") && !started("mq29")) return true; // the First Journal relay is cut (mq17) until the Second Dawn
    return false;
  }
  /** Which sermon goes out this morning: the story's newest clue first, then the standing pool. */
  function chooseSermon(force) {
    if (force && DT.sermons[force]) return force;
    if (started("mq35") && !done("mq36")) return "last";
    // the Second Dawn proclamation itself is the main line's scene (mq29 at Grand Central); it re-airs once after that
    if (raw("ms_dawn_broadcast_heard") && !heardN("secondDawn"))
      return "secondDawn";
    if (flag("eli_replied") && !heardN("reply")) return "reply";
    if (started("mq17") && !heardN("spring")) return "spring";
    if (done("mq03") && !done("mq10") && !heardN("notice")) return "notice";
    if (
      any("nell_broadcast", "core_broadcast", "attribution_broadcast") &&
      !heardN("theyknew")
    )
      return "theyknew";
    if (flag("rose_captive") && !heardN("littleSun")) return "littleSun";
    const fresh = [];
    if (done("mq08")) fresh.push("interpreter");
    if (done("mq09")) fresh.push("eleven");
    if (done("mq07")) fresh.push("song");
    const firstNew = fresh.find((id) => !heardN(id));
    if (firstNew) return firstNew;
    if (started("mq29"))
      return Math.random() < 0.6
        ? "vigil"
        : pick(["nochoose", "list", "february", "spring"]);
    const pool = [
      "match",
      "psalm",
      "nochoose",
      "list",
      "february",
      "kindling",
    ].concat(fresh);
    if (started("mq17")) pool.push("spring");
    const recent = R.flags.dawnRecent || [];
    const ok = pool.filter((id) => !recent.includes(id));
    return pick(ok.length ? ok : pool);
  }
  function heroFirst() {
    return String(S.heroName()).split(" ")[0];
  }
  /** Caption lines of one broadcast: [[speaker, text], …] (placeholders filled at say time, speakers here). */
  function sermonLines(id) {
    const sp = DT.speaker,
      out = [];
    let body = (DT.sermons[id] || DT.sermons.match).slice();
    if (id === "notice" && flag("notice_sundays"))
      body.splice(body.length - 1, 0, DT.sermons.noticeSundays);
    if (id === "secondDawn") {
      const t = torch();
      body = body.map((l) =>
        l === "{torch}" ? DT.sermons.torch[t] || DT.sermons.torch.def : l,
      );
    }
    const bare = id === "secondDawn" || id === "last" || id === "notice";
    if (!bare) out.push([sp, pick(DT.open)]);
    for (const l of body)
      out.push(
        Array.isArray(l)
          ? [
              l[0]
                .replace("{name}", S.heroName())
                .replace("{first}", heroFirst()),
              l[1],
            ]
          : [sp, l],
      );
    if (!bare) out.push([sp, pick(DT.close)]);
    return out;
  }
  /** As talk-runner lines for 50_radio.js (text-only), ending in a '#mark' that records the sermon as heard. */
  function talkLines(id) {
    return sermonLines(id)
      .map((l) => [l[0], "dj", l[1], { textOnly: true, dawn: id }])
      .concat([["#mark", id]]);
  }
  /** Rocky's grumble after the Dawn Hour stepped on Radio Free Manhattan. */
  function rockyAfter(id) {
    const st = T.story;
    if (id === "secondDawn" || started("mq29")) return pick(st.dawnAfterSecond);
    if (done("mq17")) return pick(st.dawnBleedKnown);
    return pick(st.dawnBleed);
  }
  /** Interrupt whatever the tuned station is doing and put `lines` on the air next. */
  function cutIn(lines, then) {
    if (R._cancel) R._cancel(false);
    if (R.cue) {
      try {
        R.cue.stop(0.5);
      } catch (e) {
        /* */
      }
      R.cue = null;
    }
    R.busy = false;
    R.talk = null;
    R.sig = null;
    R.pending = { kind: "talk", lines, then: then || null };
    R.nextAt = G.time.real + 0.4;
  }
  function inWindow() {
    const h = G.time.hour;
    return h >= START && h < END;
  }
  function notify(t) {
    try {
      G.notify(t);
    } catch (e) {
      /* */
    }
  }
  /** Start this morning's Dawn Hour (or a forced one: quests / debug). */
  function startDawn(opts) {
    opts = opts || {};
    if (silenced() && !opts.force) return false;
    const id = chooseSermon(opts.id);
    dawn.on = true;
    dawn.id = id;
    dawn.serial++;
    dawn.forced = !!opts.force;
    dawn.until = G.time.real + (opts.force ? 150 : 0);
    if (!opts.force) R.flags.dawnDay = G.time.day;
    const recent = (R.flags.dawnRecent || []).concat([id]).slice(-3);
    R.flags.dawnRecent = recent;
    G.events.emit("dawnHour", { phase: "start", id, station: "dawn" });
    const seize = !!opts.seize;
    if (R.on && R.station === "dawn") {
      cutIn([["#sting", "pirate"]].concat(talkLines(id)), { kind: "deadair" });
      dawn.played = dawn.serial;
    } else if (R.on && (R.station === "rfm" || seize)) {
      const lines = [["#sting", "pirate"]].concat(talkLines(id));
      if (R.station === "rfm" && !S.radioStory.rfmDead())
        lines.push([T.djName, "dj", rockyAfter(id)]);
      cutIn(lines);
      dawn.played = dawn.serial;
    } else if (!R.on && seize && R._tune) {
      R._tune("dawn");
      notify("Every frequency: THE DAWN HOUR");
    } else if (
      R.flags.heard_dawn &&
      (active("mq10") || active("mq17") || started("mq29"))
    ) {
      // (the very first time, 50_radio.js already announces "New radio signal: The Dawn Hour")
      notify("Pirate broadcast on the dial: The Dawn Hour (97.1).");
    }
    return true;
  }
  function endDawn() {
    if (!dawn.on) return;
    dawn.on = false;
    dawn.forced = false;
    G.events.emit("dawnHour", { phase: "end", id: dawn.id, station: "dawn" });
  }
  /** Mornings the Dawn is silent: Rocky notices (Radio Free Manhattan only). */
  function quietMorning() {
    if (!R.on || R.station !== "rfm" || S.radioStory.rfmDead()) return;
    const st = T.story;
    const line = finaleOver()
      ? pick(st.dawnQuiet)
      : flag("dawn_relay_cut")
        ? pick(st.dawnCut)
        : null;
    if (line) cutIn([[T.djName, "dj", line]]);
  }
  let lastHour = null;
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
})();
