// play-inline-192 09 — ctx
// Lines 2478-2784 of readable/play-inline-192.pretty.js (statement-aligned).
  function finishLedger() {
    if (!K.has("pv_q_brine_ledger")) return;
    K.take("pv_q_brine_ledger", 1);
    K.scrip(200 + (PV.flag("dot_bonus") || 0));
    K.give("pv_pastrami_sandwich", 3);
    PV.setFlag("ledger_done", true);
    K.q.complete("pv_what_shes_having");
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
  function spawn(ctx) {
    const A2 = ctx.anchors;
    const stock = K.stock(
      [
        ["beer", 6],
        ["whiskey", 4],
        ["scotch", 2],
        ["vodka", 3],
        ["wine", 2],
        ["fizzo_cola", 5],
        ["purified_water", 4],
        ["pv_egg_cream", 4],
      ].concat(PV.flag("ledger_done") ? [["pv_pastrami_sandwich", 4]] : []),
      "merchant_food",
      4,
    );
    PV.spawnActor(ctx, {
      id: "pv_dot",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Mags Kowalczyk",
      faction: "settlers",
      level: 7,
      essential: true,
      pos: v(A2.bartender),
      yaw: PI,
      ai: "merchant",
      home: "here",
      homeR: 1.8,
      dialogue: "pv_dlg_dot",
      merchant: { scrip: 380, stock, restock: 2 },
      barks: [
        "What'll it be, hon?",
        "Shh — piano solo.",
        "Tip the robots. They don't need it. Tip 'em anyway.",
      ],
    });
    const bots = [
      ["pv_hihat", "Sir Hi-Hat", A2.drums, "pv_dlg_hihat"],
      ["pv_ivory", "Ivory", A2.piano_bot, null],
      ["pv_lowtide", "Low Tide", A2.bass_bot, null],
    ];
    for (const [id, name, p, dlg] of bots) {
      PV.spawnActor(ctx, {
        id,
        type: "valet",
        name,
        faction: "settlers",
        level: 8,
        essential: true,
        hostile: false,
        pos: v(p),
        yaw: 0,
        ai: "static",
        home: "here",
        homeR: 0.2,
        dialogue: dlg || undefined,
        voice: "robot",
        barks: [
          "One, two, one two three four!",
          "Thank you, you've been a lovely audience for twenty-two years.",
          "Bum-ba-dum, tsss.",
        ],
      });
    }
    PV.spawnActor(ctx, {
      id: "pv_vv_patron1",
      type: "human",
      gender: "m",
      outfit: "survivor",
      name: "Regular",
      faction: "settlers",
      level: 3,
      pos: v(A2.npc1),
      ai: "sit",
      home: "here",
      homeR: 0.5,
      barks: [
        "Shh.",
        "Best seat in the house. Every seat is the best seat. Triangle.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv_vv_patron2",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Jazz Fan",
      faction: "settlers",
      level: 3,
      pos: v(A2.npc2),
      ai: "sit",
      home: "here",
      homeR: 0.5,
      barks: ["That drummer is a genius. A genius with a vacuum attachment."],
    });
    PV.spawnActor(ctx, {
      id: "pv_vv_bouncer",
      type: "human",
      gender: "m",
      outfit: "leather_armor",
      name: "Vanguard Bouncer",
      faction: "settlers",
      level: 7,
      pos: v(A2.npc3),
      ai: "guard",
      home: "here",
      homeR: 1.5,
      weapon: K.itemExists("lead_pipe") ? "lead_pipe" : undefined,
      barks: ["No guns on the bandstand.", "Keep it down during the solos."],
    });
    const door = A2.door;
    PV.spawnActor(ctx, {
      id: "pv_vv_doorman",
      type: "human",
      gender: "f",
      outfit: "combat_armor",
      name: "Vanguard Guard",
      faction: "settlers",
      level: 8,
      pos: { x: door.x + 1.5, y: 0, z: door.z + 3.2 },
      yaw: -HP,
      ai: "guard",
      home: "here",
      homeR: 1.5,
      weapon: K.itemExists("hunting_rifle") ? "hunting_rifle" : undefined,
      barks: [
        "Band's on. Go on down.",
        "Watch the stairs. Steepest in the Village.",
      ],
    });
    // Midge keeps the scrap stall in the yard market (round 2)
    const hs = VANGUARD_STALLS[1];
    if (hs) {
      const hstock = K.stock(
        [
          ["scrap_metal", 6],
          ["duct_tape", 2],
          ["tuff_bond", 1],
          ["rally_tonic", 2],
          ["ammo_10mm", 40],
          ["ammo_556", 20],
          ["purified_water", 3],
        ],
        "merchant_general",
        4,
      );
      PV.spawnActor(ctx, {
        id: "pv_vv_hattie",
        type: "human",
        gender: "f",
        outfit: "survivor",
        name: "Midge Sparks",
        faction: "settlers",
        level: 6,
        essential: true,
        pos: { x: hs.keeper[0], y: 0, z: hs.keeper[2] },
        lookYaw: Math.atan2(
          hs.front[0] - hs.keeper[0],
          hs.front[2] - hs.keeper[2],
        ),
        ai: "merchant",
        home: "here",
        homeR: 0.8,
        dialogue: "pv_dlg_hattie",
        merchant: { scrip: 260, stock: hstock, restock: 3 },
        barks: [
          "Scrap in, scrip out. Simple.",
          "Don't touch the fuses unless you're buying the fuses.",
          "Mags's robots? I built Low Tide's new elbow. Ask him.",
        ],
      });
    }
    const yard = A2.yard;
    PV.spawnActor(ctx, {
      id: "pv_vv_settler",
      type: "human",
      gender: "m",
      outfit: "settler",
      name: "Vanguard Settler",
      faction: "settlers",
      level: 3,
      pos: v(yard),
      ai: "wander",
      home: "here",
      homeR: 6,
    });
    // cellar tunnel roaches (until cleared)
    if (!PV.flag("vv_roaches_clear")) {
      ["roach1", "roach2", "roach3"].forEach((n, i) => {
        PV.spawnActor(ctx, {
          id: "pv_vv_" + n,
          type: "giant_roach",
          name: "Giant Roach",
          faction: "creatures",
          level: 2,
          hostile: true,
          pos: v(A2[n]),
          ai: "wander",
          home: "here",
          homeR: 3,
          noRespawn: true,
          onDeath: () => {
            const alive = ["roach1", "roach2", "roach3"].some((m) => {
              const a = G.actors.get && G.actors.get("pv_vv_" + m);
              return a && !a.dead;
            });
            if (!alive) {
              PV.setFlag("vv_roaches_clear", true);
              if (PV.flag("vv_roach_asked"))
                K.notify("The Vanguard's service tunnel is clear.");
            }
          },
        });
      });
    }
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }

  // ==================================================================
  // LIVE MUSIC — a small procedural jazz combo (WebAudio)
  // ==================================================================
  const M = {
    on: false,
    t: 0,
    beat: 0,
    next: 0,
    gain: null,
    ctx: null,
    chord: 0,
  };
  const PROG = [
    [53, 57, 60, 64],
    [48, 52, 55, 58],
    [53, 57, 60, 64],
    [53, 57, 60, 64],
    [57, 60, 64, 67],
    [50, 54, 57, 60],
    [55, 58, 62, 65],
    [48, 52, 55, 58],
  ]; // F: Fmaj7 C7 F F Am7 D7 Gm7 C7
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function audio() {
    const S = G._snd;
    const ac = S && S.ctx;
    if (!ac || ac.state !== "running") return null;
    if (M.ctx !== ac) {
      M.ctx = ac;
      M.gain = ac.createGain();
      M.gain.gain.value = 0;
      const dest =
        (S.bus && (S.bus.world || S.bus.sfx || S.bus.master)) || ac.destination;
      M.lp = ac.createBiquadFilter();
      M.lp.type = "lowpass";
      M.lp.frequency.value = 5000;
      M.gain.connect(M.lp);
      M.lp.connect(dest);
      M.noise = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
      const d = M.noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      M.next = ac.currentTime + 0.1;
    }
    return ac;
  }
  function note(ac, t, f, dur, type, vol, attack) {
    const o = ac.createOscillator(),
      g = ac.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(M.gain);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  function hit(ac, t, dur, vol, freq, type) {
    const s = ac.createBufferSource();
    s.buffer = M.noise;
    const f = ac.createBiquadFilter();
    f.type = type || "highpass";
    f.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(M.gain);
    s.start(t);
    s.stop(t + dur + 0.02);
  }
