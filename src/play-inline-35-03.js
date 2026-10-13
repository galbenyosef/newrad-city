// play-inline-35 03 — lines
// Lines 708-1039 of readable/play-inline-35.pretty.js (statement-aligned).
  function ampOn() {
    if (R.flags.amp) return true;
    if (!questsLive()) return true;
    if (qDone("mq03")) {
      R.flags.amp = true;
      return true;
    }
    return false;
  }
  /** Captions of a weak broadcast: words lost in the static (never the first few). */
  /** Weak-signal dropouts, word-exact: returns the caption with the lost words and their VOX word indices. */
  function garbleSync(text) {
    const w = text.split(" ");
    const counts = S.vox && S.vox.tokenWords ? S.vox.tokenWords(text) : null;
    const drop = new Set();
    let lost = 0,
      gi = 0;
    for (let i = 0; i < w.length; i++) {
      const n = counts ? counts[i] : 1;
      if (
        i >= 3 &&
        n > 0 &&
        w[i] !== "—" &&
        Math.random() < 0.11 &&
        lost < w.length * 0.2
      ) {
        for (let k = 0; k < n; k++) drop.add(gi + k);
        w[i] = "—";
        lost++;
      }
      gi += n;
    }
    return {
      text: w
        .join(" ")
        .replace(/(— )+—/g, "—")
        .replace(/ — /g, " … "),
      drop: counts ? drop : null,
    };
  }
  /** Pick a line not heard recently (on-air repetition is what makes a radio feel canned). */
  function pickFresh(arr) {
    if (!arr || !arr.length) return "";
    const fresh = arr.filter((l) => !R.recent.includes(l));
    const l = pick(fresh.length ? fresh : arr);
    R.recent.push(l);
    if (R.recent.length > 24) R.recent.shift();
    return l;
  }
  /** Story gate for stock lines (52_radio_story.js: e.g. no Betty banter once she is dead). */
  function okLine(l) {
    try {
      return !S.radioStory || S.radioStory.allowed(l);
    } catch (e) {
      return true;
    }
  }
  function okLines(arr) {
    const f = arr.filter(okLine);
    return f.length ? f : arr;
  }
  function sleeperOut() {
    return !!(R.flags.sleeperOut || qFlag("left_cryo"));
  }
  /** Patter that reacts to what the hero has done: name & standing title, faction choice, Kong's fate. */
  function storyLines() {
    const out = [];
    if (sleeperOut() && T.djPlayer) {
      const tier = standingTier();
      out.push(
        ...(tier <= 1
          ? T.djPlayer.good
          : tier >= 3
            ? T.djPlayer.evil
            : T.djPlayer.neutral),
      );
    }
    if (questsLive()) {
      const fac = qFlag("mq_faction");
      if (fac && T.djFaction[fac])
        out.push(...T.djFaction[fac], ...T.djFaction[fac]); // weighted: it's the big news
      else if (qActive("mq04")) out.push(...T.djFaction.pending);
      const K = T.djKong;
      if (qFlag("kong_friend")) out.push(...K.friend);
      else if (qFlag("kong_dead")) out.push(...K.dead);
      else if (qFlag("kong_resolution") === "speech") out.push(...K.speech);
      else if (qFlag("kong_resolution") === "trick") out.push(...K.trick);
    }
    if (S.radioStory) {
      try {
        out.push(...S.radioStory.patter());
      } catch (e) {
        G.reportError("sound:radioStory", e);
      }
    }
    return out.filter((l) => !R.recent.includes(l) && okLine(l));
  }
  /**
   * On-air stings through the station chain. 'news' = teletype chatter + a three-note brass fanfare,
   * 'id' = the Radio Free Manhattan vibes chime. Returns the duration (s).
   */
  function playSting(kind, dest, t) {
    const ctx = S.ctx,
      I = S.inst;
    if (!ctx || !dest) return 0;
    if (kind === "pirate") {
      // another carrier walks onto the frequency: a heterodyne whistle sliding down to zero beat under a burst of
      // static, then three small handbell notes (the Dawn Hour's call)
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(2600, t);
      o.frequency.exponentialRampToValueAtTime(70, t + 1.5);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0, t);
      og.gain.linearRampToValueAtTime(0.16, t + 0.12);
      og.gain.setValueAtTime(0.16, t + 1.3);
      og.gain.linearRampToValueAtTime(0, t + 1.7);
      o.connect(og);
      og.connect(dest);
      o.start(t);
      o.stop(t + 1.8);
      const n = ctx.createBufferSource();
      n.buffer = S.noiseBufs.white;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1700;
      bp.Q.value = 0.7;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0, t);
      ng.gain.linearRampToValueAtTime(0.32, t + 0.05);
      ng.gain.exponentialRampToValueAtTime(0.002, t + 1.2);
      n.connect(bp);
      bp.connect(ng);
      ng.connect(dest);
      n.start(t, Math.random());
      n.stop(t + 1.3);
      [76, 72, 79].forEach((m, i) => {
        tone(dest, S.mtof(m), t + 1.8 + i * 0.42, 0.6, 0.07, "sine");
        tone(dest, S.mtof(m) * 2.76, t + 1.8 + i * 0.42, 0.25, 0.015, "sine");
      });
      return 3.4;
    }
    if (kind === "news") {
      // teletype: bursts of tiny filtered clicks
      let tt = t;
      while (tt < t + 1.25) {
        const src = ctx.createBufferSource();
        src.buffer = S.noiseBufs.white;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 2400 + Math.random() * 1600;
        bp.Q.value = 3;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, tt);
        g.gain.linearRampToValueAtTime(0.5, tt + 0.002);
        g.gain.exponentialRampToValueAtTime(0.001, tt + 0.03);
        src.connect(bp);
        bp.connect(g);
        g.connect(dest);
        src.start(tt, Math.random());
        src.stop(tt + 0.04);
        tt += Math.random() < 0.2 ? 0.14 : 0.045 + Math.random() * 0.03;
      }
      const f = t + 1.3;
      I.synth(ctx, dest, "trumpet", 67, f, 0.16, 0.34);
      I.synth(ctx, dest, "trumpet", 72, f + 0.2, 0.16, 0.34);
      I.synth(ctx, dest, "trumpet", 76, f + 0.4, 0.75, 0.38);
      [60, 64, 67].forEach((m) =>
        I.synth(ctx, dest, "brass", m, f + 0.4, 0.75, 0.2, { bright: 2600 }),
      );
      if (I.ready.drums) I.drum(ctx, dest, "crash", f + 0.4, 0.16);
      return 2.6;
    }
    // station ID chime
    [72, 76, 79, 84].forEach((m, i) => {
      if (I.ready.vibes) I.sample(ctx, dest, "vibes", m, t + i * 0.2, 0.8, 0.4);
      else I.synth(ctx, dest, "flute", m, t + i * 0.2, 0.3, 0.25);
    });
    return 1.3;
  }

  // ------------------------------------------------------------------
  // Station programming
  // ------------------------------------------------------------------
  function chooseSong(list) {
    const fresh = list.filter((s) => !R.playedRecent.includes(s.title));
    const s = pick(fresh.length ? fresh : list);
    R.playedRecent.push(s.title);
    if (R.playedRecent.length > Math.min(8, list.length - 1))
      R.playedRecent.shift();
    return s;
  }
  /** Returns next program item for station: {kind:'song', song, startBar?} | {kind:'talk', lines:[[speaker, profile, text]]} */
  function nextItem(id) {
    const P = R.progress[id];
    const prev =
      R.nowPlaying && R.nowPlaying.station === id ? R.nowPlaying : null;
    if (id === "rfm" && S.radioStory && S.radioStory.rfmDead())
      return { kind: "deadair" }; // off the air after the Second Sun
    if (id === "dawn")
      return S.radioStory ? S.radioStory.dawnItem() : { kind: "deadair" };
    if (id === "rfm") {
      const dj = T.djName,
        amp = ampOn();
      const outro = () =>
        prev && prev.kind === "song"
          ? [
              dj,
              "dj",
              fill(
                pickFresh(
                  prev.vocal && Math.random() < 0.7
                    ? T.djOutroVocal
                    : T.djOutro,
                ),
                prev,
              ),
            ]
          : null;
      const intro = (song) => [
        dj,
        "dj",
        fill(
          pickFresh(
            song.vocal && Math.random() < 0.6 ? T.djIntroVocal : T.djIntro,
          ),
          song,
        ),
      ];
      if (!P.greeted) {
        P.greeted = true;
        return {
          kind: "talk",
          lines: [
            ["#sting", "id"],
            [dj, "dj", pickFresh(amp ? T.djGreet : T.djGreetWeak)],
          ],
        };
      }
      // news bulletins go out right after the record that was playing when they came in (never more than 1–2 songs late)
      if (R.newsQueue.length && (P.lastWasSong || P.newsWait >= 1)) {
        P.lastWasSong = false;
        P.newsWait = 0;
        const items = R.newsQueue.splice(0, 2);
        const lines = [];
        const o = outro();
        if (o && Math.random() < 0.5) lines.push(o);
        lines.push(["#sting", "news"]);
        lines.push([
          dj,
          "dj",
          pickFresh(T.djNewsIntro) +
            items.join(" Also: ") +
            " " +
            pickFresh(T.djNewsOutro),
          { news: true },
        ]);
        G.events.emit("radioNews", { text: items.join(" ") });
        const song = chooseSong(T.rfmSongs);
        lines.push(intro(song));
        return { kind: "talk", lines, then: { kind: "song", song } };
      }
      if (R.newsQueue.length) P.newsWait = (P.newsWait || 0) + 1;
      if (P.lastWasSong && Math.random() < 0.65) {
        P.lastWasSong = false;
        const lines = [];
        const o = outro();
        if (o && Math.random() < 0.65) lines.push(o);
        const r = Math.random(),
          story = storyLines();
        if (story.length && r < 0.35) lines.push([dj, "dj", pickFresh(story)]);
        else if (!amp && r < 0.6)
          lines.push([dj, "dj", pickFresh(okLines(T.djBanterWeak))]);
        else if (r < 0.7)
          lines.push([dj, "dj", pickFresh(okLines(T.djBanter))]);
        else if (r < 0.88) lines.push([dj, "dj", pickFresh(T.djPSA)]);
        const song = chooseSong(T.rfmSongs);
        lines.push(intro(song));
        return { kind: "talk", lines, then: { kind: "song", song } };
      }
      return { kind: "song", song: chooseSong(T.rfmSongs) };
    }
    const st = STATIONS.find((x) => x.id === id);
    if (st && st.signal) return { kind: "signal", station: st };
    if (id === "continuity") {
      if (!P.greeted || (P.sinceSpeech >= 2 && Math.random() < 0.8)) {
        P.greeted = true;
        P.sinceSpeech = 0;
        const speeches = S.radioStory
          ? S.radioStory.continuitySpeeches()
          : T.continuitySpeeches;
        return {
          kind: "talk",
          lines: [
            ["Announcer", "announcer", pick(T.continuityAnnouncer)],
            [
              "Acting President Marsh",
              "president",
              pickFresh(speeches) + " " + pick(T.continuitySignoff),
            ],
          ],
        };
      }
      P.sinceSpeech++;
      return { kind: "song", song: chooseSong(T.continuityMarches) };
    }
    if (id === "ebs") return { kind: "ebs" };
    if (id === "classical") {
      if (!P.greeted || (P.lastWasSong && Math.random() < 0.5)) {
        P.greeted = true;
        P.lastWasSong = false;
        const song = chooseSong(T.classicalPieces);
        const lines = [];
        if (prev)
          lines.push([
            "Classical NYC",
            "classical",
            fill(pick(T.classicalOutro), prev),
          ]);
        lines.push([
          "Classical NYC",
          "classical",
          fill(pick(T.classicalIntro), song),
        ]);
        return { kind: "talk", lines, then: { kind: "song", song } };
      }
      P.lastWasSong = true;
      return { kind: "song", song: chooseSong(T.classicalPieces) };
    }
    return null;
  }

