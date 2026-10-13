// play-inline-566 07 — setstage
// Lines 1946-2114 of readable/play-inline-566.pretty.js (statement-aligned).
  L.hook("update", function (dt, realDt) {
    dhT -= realDt;
    if (dhT > 0) return;
    dhT = 1;
    if (!at("mq10", "dawnhour") || L.flag("ms_dh_playing")) return;
    const h = G.time && G.time.hour;
    if (typeof h !== "number") return;
    if (h >= 5.7 && h < 6.6) {
      L.setFlag("ms_dh_playing");
      const t = ms.scene(
        [
          [
            "THE DAWN HOUR (pirate, 05:47)",
            "Good morning, children. It is five forty-seven, and the Sun has been patient with us for one more night.",
          ],
          [
            "THE DAWN HOUR",
            "Every one of you keeps something. A name. A photograph. A key you cannot use. The keeping is not a weight. It is a light.",
          ],
          ["THE DAWN HOUR", "Somebody has to keep the light on."],
          [
            "THE DAWN HOUR",
            "The sleepers sleep. We do not wake them. We keep the light on, and we wait. A dimanche, children.",
          ],
        ],
        5.2,
      );
      L.later(t + 1, () => {
        L.notify(
          "The signal drops back to static. Her voice was low and careful, like someone speaking a second language perfectly.",
          { duration: 6 },
        );
        dawnHourHeard("radio");
        L.setFlag("ms_dh_playing", false);
      });
    }
  });

  // ------------------------------------------------------------------
  // The Chambers Street spots need positions: patch them in once the layout is known.
  // ------------------------------------------------------------------
  L.hook("world", function () {
    const X = cryoOut();
    const w = { x: X.x - 4, z: X.z - 34 },
      f = { x: X.x + 12, z: X.z - 8 };
    const fw = L.freeSpot(w.x, w.z, undefined, { maxR: 10 }),
      ff = L.freeSpot(f.x, f.z, undefined, { maxR: 10 });
    spotAt.ms_spot_watcher = fw;
    spotAt.ms_spot_shooter = ff;
  });

  // ------------------------------------------------------------------
  // Test solvers (forced stage walk)
  // ------------------------------------------------------------------
  ms.solver("mq01", {
    "*"() {
      G.events.emit("cheatSkipStart");
    },
  });
  ms.solver("mq02", {
    travel() {
      Q.setStage("mq02", "gallery");
    },
    gallery() {
      if (L.ms.galleryMemory) L.ms.galleryMemory();
      Q.setStage("mq02", "ask");
    },
    ask() {
      L.give("q_reel_zeke_travel", 1, true);
      Q.complete("mq02");
    },
  });
  ms.solver("mq03", {
    rocky() {
      Q.setStage("mq03", "amp");
    },
    amp() {
      L.give("q_signal_amplifier", 1, true);
      if (Q.stage("mq03") === "amp") Q.setStage("mq03", "deliver");
    },
    deliver() {
      L.take("q_signal_amplifier", 1);
      L.setFlag("amp_delivered");
      Q.setStage("mq03", "notice");
    },
    notice() {
      L.setFlag("ms_notice", "sundays");
      Q.setStage("mq03", "listen");
    },
    listen() {
      L.give("q_reel_intercept", 1, true);
      Q.complete("mq03");
    },
  });
  ms.solver("mq07", {
    court() {
      passCourt("knelt");
    },
    apt() {
      L.give("ms_note_9c_calendar", 1);
      L.give("ms_record_two_bits", 1);
      if (at("mq07", "apt")) Q.setStage("mq07", "flint");
    },
    flint() {
      L.setFlag("ms_rose_lowered");
      ms.addTrust(1, "test");
      meetDone();
    },
    sol() {
      L.give("ms_note_nicole_1968", 1);
      L.setFlag("ms_sol_letter_given");
      Q.setStage("mq07", "letter");
    },
    letter() {
      readLetter();
    },
  });
  ms.solver("mq08", {
    hale() {
      L.setFlag("met_hale");
      Q.setStage("mq08", "ilse");
    },
    ilse() {
      Q.setStage("mq08", "booth");
    },
    booth() {
      Q.setStage("mq08", "steno");
    },
    steno() {
      L.give("ms_note_ilse_steno", 1);
      ms.token("booth");
      Q.complete("mq08");
    },
  });
  ms.solver("mq09", {
    delphine() {
      Q.setStage("mq09", "oldtimers");
    },
    oldtimers() {
      askedOldTimer("gc_doc");
      askedOldTimer("ms_mort");
    },
    grate() {
      L.give("ms_note_gc_grate", 1);
      L.setFlag("ms_grate_seen");
      Q.complete("mq09");
    },
  });
  ms.solver("mq10", {
    reply() {
      L.give("ms_note_dawn_reply", 1);
      if (at("mq10", "reply")) Q.setStage("mq10", "compare");
    },
    compare() {
      L.setFlag("ms_seal_matched");
      Q.setStage("mq10", "cathedral");
    },
    cathedral() {
      Q.setStage("mq10", "keeper");
    },
    keeper() {
      ms.set("glow_service");
      Q.setStage("mq10", "dawnhour");
    },
    dawnhour() {
      L.give("ms_note_dawn_hour_1", 1);
      dawnHourHeard("transcript");
    },
  });
