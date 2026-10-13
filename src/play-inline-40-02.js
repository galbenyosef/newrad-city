// play-inline-40 02 — math
// Lines 376-710 of readable/play-inline-40.pretty.js (statement-aligned).
  const CHAT = {
    loop: true,
    dur: 13,
    sr: 16000,
    gain: 0.7,
    ref: 4,
    rolloff: 1.1,
    priority: 3,
    pitchVar: 0.02,
    wet: 0.7,
    maxVoices: 2,
    lazy: true,
  };
  ["a", "b", "c", "d"].forEach((id, k) =>
    D(
      "neon_chatter_" + id,
      Object.assign({}, CHAT, {
        gen(d, sr, r, n) {
          const a = d[0],
            ppl = 3 + (r() < 0.5 ? 1 : 0);
          for (let p = 0; p < ppl; p++) {
            const fem = r() < 0.45;
            nyTalker(a, sr, r, n, {
              f0: fem ? 170 + r() * 70 : 88 + r() * 50,
              fem,
              rasp: r() < 0.3,
              gain: 0.5 + r() * 0.5,
              lp: 3000 + r() * 1500,
              laugh: 0.12,
              talk: 0.3 + r() * 0.25,
              rate: 0.9 + r() * 0.25,
            });
          }
          nyClatter(a, sr, r, n, 0.25, 0.05);
        },
      }),
    ),
  );
  // neon tube buzz (positional, on the signs)
  D("neon_buzz", {
    dur: 3,
    loop: true,
    sr: 22050,
    gain: 0.32,
    ref: 3.5,
    rolloff: 1.35,
    priority: 4,
    pitchVar: 0.03,
    wet: 0.35,
    maxVoices: 8,
    lazy: true,
    gen(d, sr, r, n) {
      nyNeonBuzz(d[0], sr, r, n, {
        strike: 0.28 + r() * 0.1,
        bp: 2200 + r() * 900,
      });
    },
  });
  // a tube that won't strike: stuttering buzz, arc ticks, ballast relay
  D("neon_sputter", {
    dur: 1.4,
    variants: 3,
    sr: 22050,
    gain: 0.5,
    ref: 5,
    rolloff: 1.2,
    priority: 5,
    dedupe: 0,
    wet: 0.5,
    lazy: true,
    gen(d, sr, r, n) {
      const a = d[0],
        tmp = new Float32Array(n);
      nyNeonBuzz(tmp, sr, r, n, { strike: 0.2, crackle: 0.002, bp: 3000 });
      let on = 1,
        next = 0;
      for (let i = 0; i < n; i++) {
        if (i >= next) {
          on = on ? 0 : 1;
          next =
            i + Math.floor(sr * (on ? 0.03 + r() * 0.16 : 0.02 + r() * 0.12));
          if (on) a[i] += (r() - 0.5) * 1.2;
        }
        a[i] += tmp[i] * on * (1.2 - (i / n) * 0.4);
      }
    },
  });
  // market register: keys, crank ratchet, drawer thump, bell
  D("cash_register", {
    dur: 1.6,
    variants: 3,
    sr: 22050,
    gain: 0.55,
    ref: 4,
    rolloff: 1.1,
    priority: 5,
    dedupe: 0,
    wet: 0.8,
    lazy: true,
    gen(d, sr, r, n) {
      const a = d[0],
        bp = biquad("bp", 1700, 3, sr);
      const click = (at, g, f) => {
        const b = biquad("bp", f, 4, sr);
        for (let k = 0; k < sr * 0.03 && at + k < n; k++)
          a[at + k] += b((r() * 2 - 1) * Math.exp(-k / (sr * 0.004))) * g;
      };
      let t = Math.floor(sr * 0.02);
      const keys = 2 + ((r() * 2) | 0);
      for (let k = 0; k < keys; k++) {
        click(t, 0.8, 1300 + r() * 600);
        t += Math.floor(sr * (0.1 + r() * 0.08));
      }
      for (let k = 0; k < 7; k++) {
        click(t, 0.35, 2600 + r() * 400);
        t += Math.floor(sr * 0.022);
      } // crank ratchet
      for (let k = 0; k < sr * 0.18 && t + k < n; k++) {
        const e = Math.exp(-k / (sr * 0.05));
        a[t + k] +=
          (Math.sin((2 * Math.PI * 110 * k) / sr) * 0.7 +
            bp(r() * 2 - 1) * 0.4) *
          e;
      }
      const bf = 2050 + r() * 250,
        bt = t + Math.floor(sr * 0.01);
      for (let k = 0; bt + k < n; k++) {
        const s = k / sr;
        a[bt + k] +=
          (Math.sin(2 * Math.PI * bf * s) * Math.exp(-s * 2.2) +
            Math.sin(2 * Math.PI * bf * 2.76 * s) * 0.5 * Math.exp(-s * 4) +
            Math.sin(2 * Math.PI * bf * 5.4 * s) * 0.25 * Math.exp(-s * 7)) *
          0.45;
      }
    },
  });
  D("market_clatter", {
    dur: 1.2,
    variants: 4,
    sr: 22050,
    gain: 0.45,
    ref: 4,
    rolloff: 1.1,
    priority: 6,
    dedupe: 0,
    wet: 0.8,
    lazy: true,
    gen(d, sr, r, n) {
      nyClatter(d[0], sr, r, Math.floor(n * 0.6), 2.2, 0.8);
    },
  });
  D("crowd_laugh", {
    dur: 2.2,
    variants: 4,
    sr: 16000,
    gain: 0.55,
    ref: 4,
    rolloff: 1.1,
    priority: 5,
    dedupe: 0,
    wet: 0.8,
    lazy: true,
    gen(d, sr, r, n) {
      const a = d[0],
        ppl = 2 + ((r() * 3) | 0);
      for (let p = 0; p < ppl; p++) {
        const fem = r() < 0.45,
          sub = new Float32Array(n),
          off = Math.floor(r() * sr * 0.25);
        nyTalker(sub, sr, r, n, {
          f0: fem ? 200 + r() * 60 : 105 + r() * 45,
          fem,
          rasp: r() < 0.3,
          gain: 0.5 + r() * 0.5,
          lp: 4000,
          laugh: 1,
          talk: 0.9,
          now: true,
        });
        for (let i = 0; i + off < n; i++)
          a[i + off] += sub[i] * Math.min(1, (n - i - off) / (sr * 0.4));
      }
    },
  });
  // jukebox record change: motor whirr, carriage clunks, tone-arm drop, run-in crackle
  D("jukebox_mech", {
    dur: 3.6,
    sr: 22050,
    gain: 0.5,
    ref: 3,
    rolloff: 1.2,
    priority: 5,
    dedupe: 0.5,
    wet: 0.7,
    lazy: true,
    gen(d, sr, r, n) {
      const a = d[0],
        lp = biquad("lp", 600, 0.8, sr),
        bp = biquad("bp", 1500, 2, sr);
      let ph = 0;
      for (let i = 0; i < n; i++) {
        const t = i / sr,
          run =
            t < 2.6 ? Math.min(1, t / 0.2) * Math.min(1, (2.6 - t) / 0.2) : 0;
        ph += (48 + 40 * Math.min(1, t / 1.2)) / sr;
        a[i] += lp((ph % 1) * 2 - 1 + (r() * 2 - 1) * 0.4) * run * 0.5;
        if (t > 2.75) {
          const k = t - 2.75;
          a[i] +=
            bp(r() * 2 - 1) * 0.12 * Math.min(1, k * 3) +
            (r() < 0.0015 ? (r() - 0.5) * 1.5 : 0);
        }
      }
      for (const ct of [0.25, 1.35, 2.2, 2.7]) {
        const at = Math.floor(ct * sr),
          f = ct === 2.7 ? 90 : 160 + r() * 80;
        for (let k = 0; k < sr * 0.12 && at + k < n; k++) {
          const s = k / sr;
          a[at + k] +=
            (Math.sin(2 * Math.PI * f * s) * 0.9 +
              (r() * 2 - 1) * 0.5 * Math.exp(-s * 80)) *
            Math.exp(-s * 30);
        }
      }
    },
  });

  // ------------------------------------------------------------------
  // The Neon: where, how busy
  // ------------------------------------------------------------------
  const N = (S.neon = {
    active: false,
    near: 0,
    busy: 1,
    chat: [],
    buzz: [],
    built: false,
    jb: null,
    barks: [],
    lastBarkT: 0,
    spotsT: 0,
    tickT: 0,
    glowT: 0,
  });
  const SITE = { x0: -95, x1: 15, z0: -312, z1: -212 };
  const JUKEBOX_FALLBACK = { x: -6.45, y: 1.0, z: -283.3 };
  function siteRect() {
    try {
      const s =
        G.LAYOUT &&
        G.LAYOUT.SITES &&
        G.LAYOUT.SITES.find &&
        G.LAYOUT.SITES.find((q) => q.id === "times_square");
      if (s) return s;
    } catch (e) {
      /* */
    }
    return SITE;
  }
  /** 0..1: 1 inside the Neon's rectangle, fading to 0 at 70 m outside it. */
  S.neonNear = function (x, z) {
    const s = siteRect(),
      dx = Math.max(s.x0 - x, 0, x - s.x1),
      dz = Math.max(s.z0 - z, 0, z - s.z1);
    return clamp(1 - Math.hypot(dx, dz) / 70, 0, 1);
  };
  /** Crowd level by the hour: market day, a lively evening, near-empty small hours. */
  S.neonBusy = function () {
    const h = G.time ? G.time.hour : 12;
    if (h >= 7 && h < 21) return 1;
    if (h >= 21 || h < 1) return 0.8;
    if (h >= 5) return 0.45 + (h - 5) * 0.27;
    return 0.3;
  };
  function isNight() {
    try {
      if (G.atmos && !G.isStub("atmos") && G.atmos.isNight)
        return !!G.atmos.isNight();
    } catch (e) {
      /* */
    }
    const h = G.time ? G.time.hour : 12;
    return h < 5.5 || h > 20.5;
  }
  function anchors() {
    try {
      const L = G.landmarks && G.landmarks.times_square;
      if (L && L.anchors) return L.anchors;
    } catch (e) {
      /* */
    }
    return null;
  }
  /** Conversation pocket spots: stall / plaza / customer anchors ≥ 13 m apart (at most 6), else a fixed spread. */
  function pocketSpots() {
    const out = [],
      A = anchors(),
      s = siteRect();
    const push = (x, z) => {
      for (const p of out) if (Math.hypot(p.x - x, p.z - z) < 13) return;
      out.push({ x, y: 1.6, z });
    };
    if (A) {
      const pref = [
        "plaza",
        "center",
        "noodles_customer",
        "butcher",
        "repairman",
        "stage",
      ];
      for (const k of pref) {
        const v = A[k];
        if (v && Math.abs(v.y || 0) < 2) push(v.x, v.z);
      }
      for (const k in A) {
        if (out.length >= 6) break;
        if (/stall|customer|settler|hawker|crowd|bench/.test(k)) {
          const v = A[k];
          if (v && Math.abs(v.y || 0) < 2 && v.x > s.x0 && v.x < s.x1)
            push(v.x, v.z);
        }
      }
    }
    if (out.length < 3)
      [
        [-56.5, -257.2],
        [-40, -262],
        [-30, -290],
        [-45, -230],
        [-70, -280],
      ].forEach((p) => push(p[0], p[1]));
    return out.slice(0, 6);
  }
  /** Sign glows of the square (the landmark's additive glow Points): clustered into ≤ 7 buzz emitters. */
