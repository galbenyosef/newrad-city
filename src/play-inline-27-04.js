// play-inline-27 04 — peak
// Lines 1043-1389 of readable/play-inline-27.pretty.js (statement-aligned).
  D("terminal_type", {
    dur: 0.14,
    variants: 6,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.015,
    maxVoices: 6,
    priority: 1,
    pitchVar: 0.08,
    build(k) {
      k.burst({
        a: 0.0003,
        d: 0.006,
        peak: 0.6,
        type: "bandpass",
        f: k.rr(1800, 2400),
        q: 2,
      });
      k.burst({
        start: 0.018,
        a: 0.0002,
        d: 0.012,
        peak: 1,
        type: "bandpass",
        f: k.rr(900, 1300),
        q: 2.5,
      });
      k.tone({
        type: "sine",
        start: 0.018,
        f: k.rr(150, 200),
        a: 0.001,
        d: 0.03,
        peak: 0.35,
      });
    },
  });
  /** Carriage return + line feed. */
  D("terminal_enter", {
    dur: 0.45,
    variants: 1,
    gain: 0.35,
    bus: "ui",
    dedupe: 0.05,
    priority: 1,
    build(k) {
      k.burst({
        a: 0.0003,
        d: 0.01,
        peak: 0.9,
        type: "bandpass",
        f: 1100,
        q: 2,
      });
      k.burst({
        start: 0.03,
        a: 0.03,
        d: 0.18,
        peak: 0.3,
        type: "bandpass",
        f: 1500,
        f2: 600,
        fT: 0.18,
        q: 1.4,
      });
      click(k, 0.24, 1700, 0.7);
      click(k, 0.28, 1500, 0.5);
    },
  });
  /** Accepted: the teletype bell, then a short burst of printing. */
  D("terminal_success", {
    dur: 1.2,
    variants: 1,
    gain: 0.35,
    bus: "ui",
    dedupe: 0.3,
    priority: 2,
    build(k) {
      bell(k, 0, 88, 0.9, 0.3);
      bell(k, 0.004, 95, 0.7, 0.12);
      for (let i = 0; i < 6; i++)
        k.burst({
          start: 0.35 + i * 0.07,
          a: 0.0002,
          d: 0.01,
          peak: 0.7,
          type: "bandpass",
          f: k.rr(900, 1400),
          q: 2.2,
        });
    },
  });
  /** Refused: the motor stalls on a jammed typebar, a dull double buzz. */
  D("terminal_fail", {
    dur: 0.8,
    variants: 1,
    gain: 0.35,
    bus: "ui",
    dedupe: 0.3,
    priority: 2,
    build(k) {
      k.burst({
        a: 0.0003,
        d: 0.02,
        peak: 0.9,
        type: "bandpass",
        f: 800,
        q: 2,
      });
      beep(k, 0.06, 196, 0.16, 0.45, "sawtooth");
      beep(k, 0.28, 147, 0.3, 0.45, "sawtooth");
    },
  });
  /** Power-up: the mains switch, the motor spinning up, a test line chattering out, the bell. */
  D("terminal_boot", {
    dur: 2.4,
    variants: 1,
    gain: 0.35,
    bus: "ui",
    dedupe: 0.5,
    priority: 2,
    build(k) {
      k.burst({ a: 0.001, d: 0.08, peak: 0.8, type: "lowpass", f: 500 }); // power switch thunk
      const mot = k.noise("brown", 0.05, 2.2),
        mf = k.filt("bandpass", 120, 1.4),
        mg = k.gain(0); // motor spin-up
      k.env(mf.frequency, [
        [0.05, 60],
        [0.9, 240],
      ]);
      k.env(mg.gain, [
        [0.05, 0.0001],
        [0.8, 0.22],
        [2.1, 0.18, "l"],
        [2.3, 0.0001],
      ]);
      k.chain(mot, mf, mg, k.out);
      k.tone({
        type: "sine",
        f: 30,
        f2: 60,
        glide: 0.8,
        a: 0.1,
        d: 1.8,
        peak: 0.25,
      });
      for (let i = 0; i < 12; i++)
        k.burst({
          start: 1.0 + i * 0.06 + k.rr(-0.005, 0.005),
          a: 0.0002,
          d: 0.01,
          peak: k.rr(0.5, 0.9),
          type: "bandpass",
          f: k.rr(900, 1400),
          q: 2.2,
        });
      bell(k, 1.85, 88, 0.6, 0.18);
    },
  });

  /** Power-down: the mains switch, the motor winding down, a last ratchet of the platen. */
  D("teletype_off", {
    dur: 1.2,
    variants: 1,
    gain: 0.33,
    bus: "ui",
    dedupe: 0.4,
    priority: 2,
    build(k) {
      k.burst({ a: 0.001, d: 0.07, peak: 0.8, type: "lowpass", f: 450 }); // power switch thunk
      const mot = k.noise("brown", 0, 1.1),
        mf = k.filt("bandpass", 240, 1.4),
        mg = k.gain(0); // motor spin-down
      k.env(mf.frequency, [
        [0, 240],
        [1.0, 50],
      ]);
      k.env(mg.gain, [
        [0, 0.0001],
        [0.03, 0.2],
        [1.0, 0.0001],
      ]);
      k.chain(mot, mf, mg, k.out);
      k.tone({
        type: "sine",
        f: 60,
        f2: 24,
        glide: 0.9,
        a: 0.01,
        d: 1.0,
        peak: 0.22,
      });
      click(k, 0.62, 1600, 0.4);
      click(k, 0.68, 1400, 0.3);
    },
  });
  /** The teletype bell: one small, bright ding on the bell stand. */
  D("teletype_bell", {
    dur: 0.9,
    variants: 1,
    gain: 0.32,
    bus: "ui",
    dedupe: 0.12,
    priority: 2,
    build(k) {
      k.burst({ a: 0.0002, d: 0.004, peak: 0.5, type: "highpass", f: 2500 });
      bell(k, 0, 88, 0.8, 0.32);
    },
  });

  // ------------------------------------------------------------------
  // Keys & keypads (locked doors open with a key, a keypad code or a passcode)
  // ------------------------------------------------------------------
  /** A keypad key: plastic key click and a short two-oscillator beep (pitch varies per key). */
  D("keypad_beep", {
    dur: 0.16,
    variants: 6,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.03,
    maxVoices: 3,
    priority: 1,
    build(k, v) {
      const lo = [697, 770, 852, 941, 697, 852][v % 6],
        hi = [1209, 1336, 1477, 1209, 1477, 1336][v % 6];
      click(k, 0, 2600, 0.6);
      k.tone({
        type: "sine",
        start: 0.005,
        f: lo,
        a: 0.002,
        d: 0.09,
        peak: 0.28,
        curve: "lin",
      });
      k.tone({
        type: "sine",
        start: 0.005,
        f: hi,
        a: 0.002,
        d: 0.09,
        peak: 0.22,
        curve: "lin",
      });
    },
  });
  /** Code accepted: two rising beeps and the door solenoid pulling the bolt. */
  D("keypad_accept", {
    dur: 0.8,
    variants: 1,
    gain: 0.42,
    bus: "ui",
    dedupe: 0.3,
    priority: 2,
    build(k) {
      beep(k, 0, 1047, 0.07, 0.3, "sine");
      beep(k, 0.09, 1568, 0.12, 0.3, "sine");
      k.burst({
        start: 0.26,
        a: 0.0005,
        d: 0.03,
        peak: 0.9,
        type: "lowpass",
        f: 900,
      }); // solenoid
      k.tone({
        type: "sine",
        start: 0.26,
        f: 160,
        f2: 80,
        glide: 0.05,
        a: 0.001,
        d: 0.09,
        peak: 0.5,
      });
      k.burst({
        start: 0.32,
        a: 0.02,
        d: 0.12,
        peak: 0.25,
        type: "bandpass",
        f: 1500,
        f2: 2400,
        fT: 0.12,
        q: 1.5,
      }); // bolt slides
    },
  });
  /** Code refused: a low double buzz. */
  D("keypad_deny", {
    dur: 0.6,
    variants: 1,
    gain: 0.36,
    bus: "ui",
    dedupe: 0.3,
    priority: 2,
    build(k) {
      beep(k, 0, 233, 0.13, 0.45, "square");
      beep(k, 0.18, 233, 0.2, 0.45, "square");
    },
  });
  /** The goggle keypad overlay comes up: a relay clack and a short rising CRT chirp. */
  D("keypad_open", {
    dur: 0.35,
    variants: 1,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.2,
    priority: 1,
    build(k) {
      relay(k, 0, 0.7);
      k.tone({
        type: "sine",
        start: 0.03,
        f: 900,
        f2: 1800,
        glide: 0.08,
        a: 0.004,
        d: 0.12,
        peak: 0.18,
        curve: "lin",
      });
      k.tone({
        type: "sine",
        start: 0.03,
        f: 15700,
        a: 0.01,
        d: 0.25,
        peak: 0.02,
      }); // CRT whine
    },
  });
  /** Entry cleared: two quick falling blips. */
  D("keypad_clear", {
    dur: 0.3,
    variants: 1,
    gain: 0.3,
    bus: "ui",
    dedupe: 0.1,
    priority: 1,
    build(k) {
      click(k, 0, 2400, 0.5);
      beep(k, 0.01, 1175, 0.05, 0.25, "sine");
      beep(k, 0.08, 784, 0.07, 0.25, "sine");
    },
  });
  /** A code or passcode written into the goggles' NOTES: a relay tick and three soft ascending data blips. */
