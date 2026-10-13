// play-inline-33 17 — out
// Lines 4982-5025 of readable/play-inline-33.pretty.js (statement-aligned).
  function singPhones(w) {
    const pr = pron(w),
      out = [];
    const MAP = { HH: ["H"], CH: ["T", "SH"], JH: ["D", "ZH"], DX: ["D"] };
    for (const x of pr) {
      if (x.st >= 0) {
        const v = ARPA_SING[x.p] || ["schwa"];
        out.push({ k: v.length > 1 ? "D" : "V", v: v.slice(), st: x.st });
      } else (MAP[x.p] || [x.p]).forEach((p) => out.push({ k: "C", p }));
    }
    return out;
  }

  S.vox = {
    say: say2,
    sayFormant: say,
    tokenWords,
    plan,
    plan2,
    renderLine,
    pron,
    phrases,
    wordPhones,
    PROFILES,
    syllables,
    singer: singer2,
    singerFormant: singer,
    onsetDur,
    stripMarks,
    unknownWords,
    lexiconSize: () => Object.keys(lex()).length,
    workerStats: () => ({
      worker: !!VW.w,
      failed: VW.failed,
      chunks: VW.chunks,
      live: VW.h.size,
      lexicon: Object.keys(lex()).length,
    }),
  };
  // ------------------------------------------------------------------
  // Pronouncing lexicon (ARPAbet, stress 1/2/0) for every word the radio
  // scripts, lyrics and quest news use, plus common English. Inflections
  // (-s, -ed, -ing, -er, -ly, 's, n't …) and compounds resolve on the stem.
  // ------------------------------------------------------------------
