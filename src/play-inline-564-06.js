// play-inline-564 06 — the
// Lines 1649-1985 of readable/play-inline-564.pretty.js (statement-aligned).
  L.hook("init", function () {
    const M = ms();
    if (!M) return;
    M.dlg("dlg_ms_file", "f").add({
      f: {
        speaker: "",
        text: "FILE 67-03-05. Brussels gave the order. Paris was outvoted. The OCD read it twenty-six hours early and moved the rolls instead of warning anyone. And SIROCCO TWO's weapon was never recovered. What do you do with it?",
        responses: [
          {
            text: "[Broadcast it over the torch relay.]",
            action: () => fileDecide("broadcast"),
          },
          {
            text: "[Keep it for Lys and Corbeau.]",
            action: () => fileDecide("sept"),
          },
          { text: "[Keep it.]", action: () => fileDecide("keep") },
        ],
      },
    });
    // The decision can be revisited from the goggles: re-reading the file re-opens the choice while mq27 waits.
    M.spot({
      id: "ms_spot_file_decide",
      label: "FILE 67-03-05",
      verb: "Decide",
      when: () => at("mq27", "decide"),
      at: SPOTS.command,
      use() {
        M.talk("dlg_ms_file", "FILE 67-03-05");
      },
    });
  });

  // ------------------------------------------------------------------
  // mq28: the torch
  // ------------------------------------------------------------------
  const hasKey = () => L.has("q_liberty_key");
  const hasCore = () => L.has("q_knickerbocker_core");
  const craneResolved = () =>
    L.flag("crane_dead") || L.flag("crane_surrendered") || L.flag("crane_ally");
  const microfilmHere = () =>
    L.flag("ms_microfilm") === "continuity" ||
    L.flag("li_un_tapes_to") === "continuity";
  const canChoose = () =>
    hasKey() &&
    hasCore() &&
    craneResolved() &&
    !L.flag("ms_torch") &&
    (at("mq28", "choose") || at("mq28", "climb"));
  function readyTorch() {
    if (!hasCore()) {
      L.give("q_knickerbocker_core", 1);
      L.notify(
        faction() === "covenant"
          ? 'Lancer Castillo presses the Knickerbocker core into your hands. "The Commander says you\'d better be the one to plug it in."'
          : faction() === "continuity"
            ? "A Continuity quartermaster signs the Knickerbocker core back out to you, in triplicate."
            : "You unpack the Knickerbocker core. It hums like it knows where it is.",
        { duration: 6 },
      );
    }
    if (!hasKey()) L.give("q_liberty_key", 1, true);
  }
  L.trigger({
    id: "ms_torch_climb",
    once: false,
    cooldown: 1.5,
    pos: () => L.termPos("liberty_torch"),
    r: 7,
    cond: () => at("mq28", "climb"),
    fire() {
      readyTorch();
      L.say(
        "lib_zeke",
        "Six days on the tide, " +
          first() +
          ". Whatever you load, she fires at noon on Sunday. Noon, Sunday. Choose like somebody's going to wake up after you.",
      );
      Q.setStage("mq28", "choose");
    },
  });
  G.events.on("terminalOpened", (id) => {
    if (
      (id === "liberty_torch" || id === "liberty_command") &&
      at("mq28", "climb")
    ) {
      readyTorch();
      Q.setStage("mq28", "choose");
    }
  });
  function choose(choice) {
    if (L.flag("ms_torch")) return;
    const M = ms();
    const t =
      {
        purify: "reclamation",
        selective: "selective",
        covenant: "charter",
        destroy: "destroyed",
      }[choice] || choice;
    L.setFlag("ms_torch", t);
    L.take("q_knickerbocker_core", 1);
    if (G.terminals && typeof G.terminals.close === "function") {
      try {
        G.terminals.close();
      } catch (e) {
        /* */
      }
    }
    if (G.state === "terminal" || G.state === "play") G.setState("cutscene");
    L.later(0.3, () => torchCinematic(t));
    if (t === "selective") {
      L.standing(-1000, "Loaded Directive 7-A");
      if (M) {
        M.setTrust(0);
        L.later(5, () => M.say(M.roseName(), "You just signed my name.", 6));
        L.setFlag("ms_rose_left_liberty");
        L.later(9, () => M.rose.place("home"));
      }
      L.setFlag("ms_zeke_wont_muster");
    } else if (t === "reclamation")
      L.standing(150, "Programmed the torch for everyone");
    else if (t === "charter") {
      L.standing(25, "Handed the Array to the Iron Covenant");
      L.setFlag("con_hostile");
    }
    if (L.flag("crane_ally") && t !== "selective" && L.alive("lib_crane"))
      L.setFlag("crane_betrayed");
  }
  L.finale = { choose };
  function torchCinematic(t) {
    const P = G.player,
      c = LIB();
    const torch = L.V3(c.x - 2, 88, c.z);
    const y0 = P.yaw,
      p0 = P.pitch,
      y1 = Math.atan2(-(c.x - P.pos.x), -(c.z - P.pos.z));
    L.cinematic(
      6.5,
      (e, k) => {
        const q = Math.min(1, k * 2.5),
          qe = q * q * (3 - 2 * q);
        P.yaw = y0 + G.util.wrapAngle(y1 - y0) * qe;
        P.pitch = p0 + (0.75 - p0) * qe;
      },
      () => {
        if (G.state === "cutscene") G.setState("play");
        const lines = {
          reclamation:
            "The Array accepts RECLAMATION. A dial on the teletype starts to turn: TIDAL CHARGE 2%. Six days of tide, and at noon on Sunday the sky gets scrubbed for everyone.",
          selective:
            "The Array accepts DIRECTIVE 7-A. The teletype prints the schedule in a neat column of names, and keeps printing. At noon on Sunday it will do what it was told.",
          charter:
            "The Array accepts the CHARTER OVERRIDE. The torch locks. At noon on Sunday, by design, nothing will happen at all.",
          destroyed:
            "The core screams. The torch above you comes apart in a ball of white fire, and brass and glass rain into the harbour for a full minute.",
        };
        L.notify(lines[t], { duration: 8 });
        L.later(2.5, () => {
          if (at("mq28", "choose") || at("mq28", "climb")) Q.complete("mq28");
        });
      },
    );
    L.sfx("hum_electric", { volume: 1 });
    if (t === "destroyed") {
      L.later(2.6, () => {
        if (!G.isStub("fx")) {
          try {
            G.fx.explosion(torch, 14, "normal");
          } catch (e) {
            /* */
          }
        }
        L.sfx("explosion_nuke");
        if (P.shake) P.shake(1, 2.5);
        L.overlay("#ffb050", 1.2, 0.6, 1.4, 0.9);
        try {
          G.player.damage(15, { type: "explosive" });
        } catch (e) {
          /* */
        }
        L.setFlag("ms_array_fired", "destroyed");
        L.news(
          "Did you see it? Did you HEAR it? Lady Liberty's torch went up like the Fourth of July we never got in '67. Whatever was up there is at the bottom of the harbour now. Nobody gets it. Maybe that's the only fair decision there is.",
        );
      });
    }
    // Crossing the Colonel at the last second: a line, and a one-way Rotorcraft ride.
    if (L.flag("crane_ally") && t !== "selective" && L.alive("lib_crane")) {
      L.later(3.4, () =>
        L.say(
          "lib_crane",
          "You — you absolute — I vouched for you. I put it in WRITING!",
        ),
      );
      L.later(5.2, () =>
        L.say("lib_rourke", "Colonel, the Rotorcraft. Now, sir."),
      );
      L.later(8, () => {
        L.setFlag("crane_gone");
        for (const id of ["lib_crane", "lib_rourke", "lib_dunn"])
          L.removeNPC(id);
      });
    }
  }

  // ------------------------------------------------------------------
  // "Noon, Sunday": the Array fires (after the finale). Lasting world consequences.
  // ------------------------------------------------------------------
  const SKY_POOLS = {
    purify: { clear: 0.62, overcast: 0.2, rain: 0.12, fog: 0.06 },
    selective: { thunderstorm: 0.4, dust: 0.25, overcast: 0.25, fog: 0.1 },
  };
  function skyMode() {
    return L.flag("sky_clean")
      ? "purify"
      : L.flag("the_cleaning")
        ? "selective"
        : null;
  }
  let wxT = 0;
  function applySky(opts) {
    const mode = skyMode();
    if (!mode || G.isStub("atmos") || !G.atmos.setWeather) return;
    opts = opts || {};
    const pool = SKY_POOLS[mode];
    let names = Object.keys(pool);
    try {
      const have = G.atmos.weatherNames ? G.atmos.weatherNames() : null;
      if (have && have.length)
        names = names.filter((n) => have.indexOf(n) >= 0);
    } catch (e) {
      /* */
    }
    if (!names.length) return;
    let name = opts.name;
    if (!name) {
      let tot = 0;
      for (const n of names) tot += pool[n];
      let r = Math.random() * tot;
      name = names[names.length - 1];
      for (const n of names) {
        r -= pool[n];
        if (r <= 0) {
          name = n;
          break;
        }
      }
    }
    try {
      G.atmos.setWeather(name, {
        auto: false,
        hold: 1e9,
        duration: opts.duration || 30,
        instant: !!opts.instant,
        silent: !!opts.silent,
      });
    } catch (e) {
      /* */
    }
    wxT = 240 + Math.random() * 300;
  }
  L.hook("update", function (dt) {
    if (!(dt > 0) || !skyMode()) return;
    wxT -= dt;
    let cur = null;
    try {
      cur = G.atmos.getWeather ? G.atmos.getWeather() : null;
    } catch (e) {
      cur = null;
    }
    const pool = SKY_POOLS[skyMode()];
    if (wxT <= 0 || (cur && pool[cur] === undefined)) applySky({});
  });
  L.hook("loaded", function () {
    if (skyMode())
      applySky({
        name: skyMode() === "purify" ? "clear" : "thunderstorm",
        instant: true,
        silent: true,
      });
  });

  /**
   * The Array fires at noon on Sunday (the finale's day). Idempotent. Called when mq36 completes, or by the
   * finale module (G.quests.lib.ms.fireArray()) when its epilogue reaches noon.
   */
  function fireArray() {
    const t = L.flag("ms_torch");
    if (!t || L.flag("consequences_applied")) return;
    L.setFlag("consequences_applied");
    L.setFlag("ms_array_fired", t);
    L.setFlag(
      "ending_choice",
      {
        reclamation: "purify",
        selective: "selective",
        charter: "covenant",
        destroyed: "destroy",
      }[t],
    );
    if (t === "reclamation") {
      L.setFlag("sky_clean");
      applySky({ name: "clear", duration: 6 });
    } else if (t === "selective") {
      L.setFlag("the_cleaning");
      applySky({ name: "thunderstorm", duration: 8 });
      if (!G.isStub("actors") && G.actors.list) {
        for (const a of G.actors.list().slice()) {
          if (a.dead || !isDoomed(a)) continue;
          if (a.essential) a.essential = false;
          try {
            a.kill();
          } catch (e) {
            /* */
          }
        }
      }
    }
    const n = {
      reclamation:
        "Folks... go outside. Put down whatever you're doing and go outside and look up. That's blue. That's BLUE. I was nineteen the last time I saw it. Somebody programmed the torch on Lady Liberty and at noon the sky came back. This one's for everybody.",
      selective:
        "This is Rocky Delgado. I... the Neon is dark. Times Square is quiet. Marigold used to call in every Thursday to request the slow one. She didn't call today. I'm going to play it anyway. I'm going to play it all night.",
      charter:
        "Noon on Sunday, folks, and the torch on Liberty sat there like a lamp with no bulb. The Covenant says that's the point. Sky's the same colour as yesterday. Safer, they tell me.",
    }[t];
    if (n) L.news(n);
  }
  G.events.on("questCompleted", (v) => {
    if (v && v.id === "mq36") L.later(2, fireArray);
  });

  // ------------------------------------------------------------------
  // The world slides for the finale's epilogue (the old torch slides, re-dated to spring 1989).
  // ms.worldSlides() → [{title, text, art}] — the finale module decides where they go.
  // ------------------------------------------------------------------
