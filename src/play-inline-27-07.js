// play-inline-27 07 — gain
// Lines 2038-2333 of readable/play-inline-27.pretty.js (statement-aligned).
  D("caution", {
    dur: 0.6,
    variants: 1,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.5,
    priority: 3,
    build(k) {
      beep(k, 0, 880, 0.09, 0.35, "triangle");
      beep(k, 0.13, 880, 0.09, 0.35, "triangle");
    },
  });
  D("heartbeat", {
    dur: 0.7,
    variants: 2,
    gain: 0.55,
    bus: "ui",
    dedupe: 0.2,
    priority: 2,
    pitchVar: 0.02,
    build(k) {
      k.tone({
        type: "sine",
        f: 62,
        f2: 42,
        glide: 0.1,
        a: 0.008,
        d: 0.13,
        peak: 1,
      });
      k.burst({ a: 0.004, d: 0.06, peak: 0.25, type: "lowpass", f: 180 });
      k.tone({
        type: "sine",
        start: 0.24,
        f: 55,
        f2: 40,
        glide: 0.1,
        a: 0.008,
        d: 0.12,
        peak: 0.7,
      });
    },
  });
  D("low_health", {
    dur: 2.0,
    variants: 2,
    gain: 0.4,
    bus: "ui",
    dedupe: 1.5,
    priority: 3,
    build(k) {
      // labored breath in … out
      k.voice({
        dur: 0.55,
        f0: [
          [0, 120],
          [0.55, 130],
        ],
        vowels: [
          [0, "hh"],
          [0.55, "uh"],
        ],
        breath: 1,
        gain: 0.3,
        attack: 0.15,
        release: 0.2,
      });
      k.voice({
        start: 0.7,
        dur: 0.8,
        f0: [
          [0, 125],
          [0.8, 95],
        ],
        vowels: [
          [0, "uh"],
          [0.8, "hh"],
        ],
        breath: 1,
        rough: 0.5,
        gain: 0.35,
        attack: 0.05,
        release: 0.4,
      });
      k.tone({
        type: "sine",
        f: 60,
        f2: 42,
        glide: 0.1,
        a: 0.008,
        d: 0.13,
        peak: 0.5,
      });
      k.tone({
        type: "sine",
        start: 0.24,
        f: 55,
        f2: 40,
        glide: 0.1,
        a: 0.008,
        d: 0.12,
        peak: 0.35,
      });
    },
  });
  /** A field repair: wrench ratchet, a tightened nut, a tap on the casing. */
  D("repair", {
    dur: 0.9,
    variants: 2,
    gain: 0.4,
    bus: "ui",
    dedupe: 0.3,
    priority: 3,
    pitchVar: 0.06,
    build(k) {
      k.grains({
        start: 0,
        span: 0.32,
        n: 9,
        f: k.rr(2800, 3600),
        q: 4,
        gain: 0.7,
        len: 0.006,
        peakMin: 0.5,
      }); // ratchet
      k.grains({
        start: 0.4,
        span: 0.2,
        n: 5,
        f: k.rr(2600, 3200),
        q: 4,
        gain: 0.6,
        len: 0.006,
        peakMin: 0.5,
      });
      const m = k.metal(1, [620, 1450, 2380, 3900], 22);
      k.chain(m.output, k.gain(0.5), k.out);
      k.burst({
        start: 0.7,
        a: 0.0003,
        d: 0.012,
        peak: 0.9,
        type: "highpass",
        f: 500,
        dest: m.input,
      }); // tap
      k.tone({
        type: "sine",
        start: 0.7,
        f: 210,
        f2: 140,
        glide: 0.04,
        a: 0.001,
        d: 0.08,
        peak: 0.35,
      });
    },
  });
  /** Steadying the aim: a short in-breath held behind the teeth. */
  D("breath_hold", {
    dur: 0.7,
    variants: 2,
    gain: 0.25,
    bus: "ui",
    dedupe: 0.5,
    priority: 4,
    pitchVar: 0.04,
    build(k) {
      const n = k.noise("pink", 0, 0.7),
        bp = k.filt("bandpass", 1100, 0.9),
        g = k.gain(0);
      k.env(bp.frequency, [
        [0, 800],
        [0.4, 1500],
      ]);
      k.env(g.gain, [
        [0, 0.0001],
        [0.32, 0.5],
        [0.42, 0.05],
        [0.6, 0.0001],
      ]);
      k.chain(n, bp, g, k.out);
    },
  });
  /** Letting the breath go after the shot. */
  D("breath_exhale", {
    dur: 1.0,
    variants: 2,
    gain: 0.25,
    bus: "ui",
    dedupe: 0.5,
    priority: 4,
    pitchVar: 0.05,
    build(k) {
      const n = k.noise("pink", 0, 1.0),
        bp = k.filt("bandpass", 1200, 0.8),
        g = k.gain(0);
      k.env(bp.frequency, [
        [0, 1300],
        [0.9, 650],
      ]);
      k.env(g.gain, [
        [0, 0.0001],
        [0.06, 0.45],
        [0.5, 0.2, "l"],
        [0.95, 0.0001],
      ]);
      k.chain(n, bp, g, k.out);
    },
  });
  /** A big bronze bell (clock towers, church belfries): hum, strike tone and a long ringing tail. */
  D("bell", {
    dur: 5,
    variants: 1,
    gain: 0.7,
    ref: 30,
    rolloff: 0.6,
    dedupe: 1,
    priority: 7,
    lazy: true,
    wet: 1.3,
    build(k) {
      k.burst({
        a: 0.0005,
        d: 0.03,
        peak: 0.6,
        type: "bandpass",
        f: 1800,
        q: 1,
      }); // clapper strike
      bell(k, 0, 55, 4.5, 0.55);
      k.tone({ type: "sine", f: mtof(43), a: 0.01, d: 4.8, peak: 0.3 }); // hum note
    },
  });
  D("geiger", {
    dur: 0.03,
    variants: 5,
    gain: 0.4,
    bus: "ui",
    dedupe: 0,
    maxVoices: 16,
    priority: 0,
    pitchVar: 0.15,
    norm: false,
    gen(d, sr, r, n) {
      const a = d[0];
      // one avalanche discharge: sharp impulse + tiny speaker ring
      const f = 2200 + r() * 1400;
      for (let i = 0; i < n; i++) {
        const t = i / sr;
        a[i] =
          (i < 3 ? (i === 0 ? 0.9 : -0.6) : 0) +
          Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 900) * 0.6 +
          (r() * 2 - 1) * Math.exp(-t * 2500) * 0.4;
      }
      // fixed-target peak (≤ 0.92): up to 16 overlapping clicks must not lean on the master limiter
      let pk = 0;
      for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(a[i]));
      if (pk > 0.92) {
        const k = 0.92 / pk;
        for (let i = 0; i < n; i++) a[i] *= k;
      }
    },
  });
  [
    ["ui_tab", "goggles_tab"],
    ["ui_scroll", "ui_hover"],
    ["ui_confirm", "ui_select"],
    ["ui_cancel", "ui_back"],
    ["talent_select", "ui_select"],
    ["notify", "ui_hover"],
    ["ui_drop", "pickup"],
    ["pickup_ammo", "pickup_weapon"],
    ["pickup_aid", "pickup"],
    ["pickup_note", "pickup"],
    ["pickup_metal", "pickup_weapon"],
    ["ui_tick", "ui_click"],
    ["trade_done", "barter_trade"],
    ["stealth_detected", "sneak_detected"],
    ["ui_open", "goggles_tab"],
    ["level_up", "levelup"],
    ["questComplete", "quest_complete"],
    ["discovery_sting", "discover_location"],
    ["levelup_chord", "levelup"],
    ["keypad_ok", "keypad_accept"],
    ["keypad_fail", "keypad_deny"],
    ["key_unlock", "key_turn"],
    ["keypad_key", "keypad_beep"],
    ["keypad_buzz", "keypad_deny"],
    ["lock_key", "key_turn"],
    ["teletype_on", "terminal_boot"],
    ["teletype_accept", "terminal_success"],
    ["terminal_unlock", "terminal_success"],
    ["teletype_return", "terminal_enter"],
    ["teletype_boot", "terminal_boot"],
  ].forEach((a) => S.aliasOf(a[0], a[1]));
