// play-inline-33 04 — push
// Lines 965-1233 of readable/play-inline-33.pretty.js (statement-aligned).
  function phrases(text) {
    const res = [];
    const clean = String(text)
      .replace(/(\d),(\d{3})/g, "$1$2")
      .replace(/[“”"()]/g, "")
      .replace(/[’']/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\*([^*]+?)([.,!?;:…]+)\*/g, "*$1*$2"); // "*roof,*" → "*roof*,"
    // split out the vocalisation marks first
    const parts = clean.split(/\[([a-z]+)\]/i);
    for (let pi = 0; pi < parts.length; pi++) {
      if (pi % 2 === 1) {
        const v = parts[pi].toLowerCase();
        if (VOCS[v]) res.push({ voc: v, words: [], emph: [], end: "v" });
        continue;
      }
      const part = parts[pi].trim();
      if (!part) continue;
      const re = /([^.,!?;:—…]+)([.,!?;:—…]+|$)/g;
      let m;
      while ((m = re.exec(part))) {
        if (!m[0]) {
          re.lastIndex++;
          if (re.lastIndex > part.length) break;
          continue;
        }
        // *word* = emphasis (the DJ leans on it: bigger pitch accent, longer, louder)
        const words = [],
          emph = [];
        let inEm = false;
        for (const tok of m[1].split(/\s+/)) {
          if (!tok) continue;
          if (!/[a-z0-9]/i.test(tok)) {
            if (tok.indexOf("*") >= 0) inEm = false;
            continue;
          }
          const open = tok[0] === "*",
            close = tok.length > 1 && /\*[^a-z0-9*]*$/i.test(tok);
          const em = inEm || open;
          if (open && !close) inEm = true;
          else if (close) inEm = false;
          const sub = tok
            .replace(/(\d+)/g, (x) => " " + spellNumber(x) + " ")
            .replace(/-/g, " ")
            .toLowerCase()
            .split(/\s+/)
            .map((w) => w.replace(/[^a-z']/g, ""))
            .filter((w) => /[a-z]/.test(w));
          for (const w of sub) {
            words.push(w);
            emph.push(em);
          }
        }
        const p = m[2] || ".";
        const end =
          p.indexOf("?") >= 0
            ? "?"
            : p.indexOf("!") >= 0
              ? "!"
              : p.indexOf("…") >= 0 || p.indexOf("..") >= 0
                ? "…"
                : p[0] === ","
                  ? ","
                  : p[0] === ";" || p[0] === ":" || p[0] === "—"
                    ? ";"
                    : ".";
        if (words.length) res.push({ words, emph, end });
        if (re.lastIndex >= part.length) break;
      }
    }
    return res;
  }
  /** Caption / TTS text: vocalisation marks and emphasis asterisks removed. */
  function stripMarks(text) {
    return String(text)
      .replace(/\s*\[(laugh|chuckle|whoop|sigh|breath)\]\s*/gi, " ")
      .replace(/\*([^*\s][^*]*?)\*/g, "$1")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  /**
   * Build the segment plan for one phrase. Each segment: {t, d, F:[4], v, a, fr:[f,q,amp]|null, burst, f0pts:[[t,mul]]}
   * times relative to phrase start (seconds). Returns {segs, dur, f0:[[t, mul]]}.
   */
  function planPhrase(ph, P, rnd, isFirst) {
    const segs = [],
      f0 = [];
    let t = 0,
      prevF = VF.schwa;
    const rate = P.rate;
    // syllable bookkeeping for intonation
    const sylls = [];
    ph.words.forEach((w, wi) => {
      const phones = wordPhones(w.replace(/'/g, ""));
      const func = FUNC.has(w) && ph.words.length > 1;
      let vi = 0;
      const nv = phones.filter((p) => p.k !== "C").length;
      phones.forEach((p, pi) => {
        if (p.k === "C") {
          const q = PH[p.p];
          if (!q) return;
          const next = phones.slice(pi + 1).find((x) => x.k !== "C");
          const nextF = next ? VF[next.v[0]] : prevF;
          let d = (q.d / rate) * (func ? 0.8 : 1);
          let F = q.F ? q.F.slice() : nextF.slice();
          if (!q.F && q.F2) {
            F = [
              Math.min(nextF[0], 350),
              q.F2 * 0.6 + nextF[1] * 0.4,
              nextF[2] * 0.96,
              nextF[3],
            ];
          }
          if (q.c === "P") {
            // closure (silence / voice bar) → burst → optional aspiration
            const cl = (q.cl / rate) * (func ? 0.75 : 1);
            segs.push({
              t,
              d: cl,
              F: [220, F[1], F[2], F[3]],
              v: q.v,
              a: 0,
              fr: null,
            });
            t += cl;
            segs.push({
              t,
              d: 0.012,
              F,
              v: q.v * 1.5,
              a: 0.1,
              fr: q.b,
              burst: true,
            });
            t += 0.012;
            if (q.asp) {
              const ad = q.asp / rate;
              segs.push({ t, d: ad, F: nextF, v: 0.05, a: 0.3, fr: null });
              t += ad;
            }
            return;
          }
          if (q.c === "H") {
            segs.push({ t, d, F: nextF, v: 0, a: q.a, fr: null });
            t += d;
            return;
          }
          segs.push({
            t,
            d,
            F,
            v: q.v,
            a: q.c === "F" ? 0.02 : 0,
            fr: q.fr || null,
            nasal: q.c === "N",
          });
          t += d;
          prevF = F;
          return;
        }
        // vowel / diphthong nucleus
        const stressed =
          !func &&
          (nv === 1
            ? true
            : vi === 0 ||
              (nv >= 3 &&
                vi === 1 &&
                /^(be|re|de|a|con|pro|com|in|un|en|ex|dis)/.test(w)));
        const finalSyl = wi === ph.words.length - 1 && vi === nv - 1;
        let d =
          ((stressed ? 0.13 : func ? 0.055 : 0.075) *
            (p.k === "D" ? 1.35 : 1)) /
          rate;
        if (finalSyl) d *= ph.end === "," ? 1.3 : 1.55; // phrase-final lengthening
        if (p.v[0] === "schwa" && !stressed) d *= 0.8;
        d *= 0.9 + rnd() * 0.22;
        const Fa = VF[p.v[0]] || VF.schwa,
          Fb = p.k === "D" ? VF[p.v[1]] || Fa : null;
        const seg = {
          t,
          d,
          F: Fa,
          F2: Fb,
          v: stressed ? 1 : func ? 0.72 : 0.85,
          a: P.breath,
          fr: null,
          syl: sylls.length,
        };
        segs.push(seg);
        sylls.push({ t, d, stressed, finalSyl, word: wi });
        t += d;
        prevF = Fb || Fa;
        vi++;
      });
      t += (func ? 0.008 : 0.02) / rate; // word juncture (connected speech)
    });
    // --- intonation: declination + pitch accents + boundary tone
    const N = sylls.length,
      R = P.range * P.accent;
    const emph = ph.end === "!" ? 1.45 : 1;
    let lastAcc = -1;
    for (let i = 0; i < N; i++) if (sylls[i].stressed) lastAcc = i;
    for (let i = 0; i < N; i++) {
      const s = sylls[i];
      const base =
        1.07 - 0.17 * (N > 1 ? i / (N - 1) : 0) + (isFirst ? 0.02 : 0);
      if (s.finalSyl) {
        const startM = base + (s.stressed ? R * 0.5 * emph : 0);
        let endM;
        if (ph.end === "?") endM = 1.08 + R * 1.3;
        else if (ph.end === "," || ph.end === ";" || ph.end === "…")
          endM = base + R * 0.25; // continuation rise
        else endM = 0.8 - R * 0.25; // declarative fall
        f0.push([s.t, startM], [s.t + s.d * 0.85, endM]);
        continue;
      }
      if (s.stressed) {
        const acc = R * (0.55 + rnd() * 0.6) * emph * (i === lastAcc ? 1.2 : 1);
        f0.push(
          [s.t, base + acc * 0.35],
          [s.t + s.d * 0.35, base + acc],
          [s.t + s.d, base + acc * 0.45],
        );
      } else f0.push([s.t, base - R * 0.08], [s.t + s.d, base - R * 0.12]);
    }
    const pause =
      ({ ".": 0.36, "!": 0.38, "?": 0.42, ",": 0.17, ";": 0.26, "…": 0.55 }[
        ph.end
      ] || 0.3) *
      P.pause *
      (0.85 + rnd() * 0.3);
    return { segs, f0, dur: t, pause, breath: ph.end !== "," && rnd() < 0.55 };
  }

  /** Plan a whole line (pure data — used by the live voice and by tests). */
  function plan(text, profileId, rnd) {
    const P = PROFILES[profileId] || PROFILES.announcer;
    rnd = rnd || Math.random;
    return phrases(text)
      .filter((ph) => !ph.voc)
      .map((ph, i) => planPhrase(ph, P, rnd, i === 0));
  }

  // ------------------------------------------------------------------
  // The synth
  // ------------------------------------------------------------------
  function bq(ctx, type, f, q, g) {
    const b = ctx.createBiquadFilter();
    b.type = type;
    b.frequency.value = f;
    b.Q.value = q;
    if (g !== undefined) b.gain.value = g;
    return b;
  }
  // Lowpass-biquad resonators: WebAudio's lowpass Q is the resonance peak in dB, so a formant of bandwidth B at F
  // is Q = 20·log10(F/B). Cascading them (Klatt's cascade branch) gives natural relative formant amplitudes.
  const BW = [70, 95, 150, 230];
  const NORM = 0.115; // calibrated: a line ≈ the loudness of a record through the same AM chain
  const qdb = (f, k) => Math.max(1, 20 * Math.log10(f / BW[k]));

  /**
   * Speak `text` on `dest` with a voice profile. opts: {start (ctx time), gain}.
   * Returns a controller: pump(untilTime) schedules phrases up to that time (call ~4×/s live;
   * pass Infinity offline), stop(fade), end (ctx time when the line is over — grows as phrases are planned),
   * plannedEnd (full estimate).
   */
