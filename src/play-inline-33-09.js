// play-inline-33 09 — concat
// Lines 2421-2754 of readable/play-inline-33.pretty.js (statement-aligned).
  function pron(word) {
    const L = lex();
    let w = word.toLowerCase().replace(/[^a-z']/g, "");
    if (!w) return [];
    if (L[w]) return parseArpa(L[w]);
    const w0 = w.replace(/'/g, "");
    if (L[w0]) return parseArpa(L[w0]);
    // contractions & suffixes on a known stem
    const tryStem = (stem, add) => {
      if (!stem || stem.length < 2) return null;
      const cands = [
        stem,
        stem + "e",
        stem.endsWith("i") ? stem.slice(0, -1) + "y" : null,
        stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2]
          ? stem.slice(0, -1)
          : null,
      ];
      for (const c of cands)
        if (c && L[c]) {
          const b = parseArpa(L[c]);
          return add(b);
        }
      return null;
    };
    const last = (b) => (b.length ? b[b.length - 1].p : "");
    const sfx = [
      [
        "'s",
        (b) =>
          b.concat(
            sibil(last(b))
              ? [
                  { p: "IH", st: 0 },
                  { p: "Z", st: -1 },
                ]
              : [{ p: VOICELESS[last(b)] ? "S" : "Z", st: -1 }],
          ),
      ],
      [
        "n't",
        (b) =>
          b.concat([
            { p: "AX", st: 0 },
            { p: "N", st: -1 },
            { p: "T", st: -1 },
          ]),
      ],
      ["'ll", (b) => b.concat([{ p: "L", st: -1 }])],
      ["'re", (b) => b.concat([{ p: "R", st: -1 }])],
      ["'ve", (b) => b.concat([{ p: "V", st: -1 }])],
      ["'d", (b) => b.concat([{ p: "D", st: -1 }])],
      ["'m", (b) => b.concat([{ p: "M", st: -1 }])],
      ["ies", (b) => b.concat([{ p: "Z", st: -1 }])],
      [
        "es",
        (b) =>
          b.concat(
            sibil(last(b))
              ? [
                  { p: "IH", st: 0 },
                  { p: "Z", st: -1 },
                ]
              : [{ p: VOICELESS[last(b)] ? "S" : "Z", st: -1 }],
          ),
      ],
      [
        "s",
        (b) =>
          b.concat(
            sibil(last(b))
              ? [
                  { p: "IH", st: 0 },
                  { p: "Z", st: -1 },
                ]
              : [{ p: VOICELESS[last(b)] ? "S" : "Z", st: -1 }],
          ),
      ],
      [
        "ed",
        (b) =>
          b.concat(
            last(b) === "T" || last(b) === "D"
              ? [
                  { p: "IH", st: 0 },
                  { p: "D", st: -1 },
                ]
              : [{ p: VOICELESS[last(b)] ? "T" : "D", st: -1 }],
          ),
      ],
      [
        "ing",
        (b) =>
          b.concat([
            { p: "IH", st: 0 },
            { p: "NG", st: -1 },
          ]),
      ],
      [
        "in",
        (b) =>
          b.concat([
            { p: "IH", st: 0 },
            { p: "N", st: -1 },
          ]),
      ],
      [
        "ly",
        (b) =>
          b.concat([
            { p: "L", st: -1 },
            { p: "IY", st: 0 },
          ]),
      ],
      [
        "ily",
        (b) =>
          b.concat([
            { p: "IH", st: 0 },
            { p: "L", st: -1 },
            { p: "IY", st: 0 },
          ]),
      ],
      [
        "ers",
        (b) =>
          b.concat([
            { p: "AXR", st: 0 },
            { p: "Z", st: -1 },
          ]),
      ],
      ["er", (b) => b.concat([{ p: "AXR", st: 0 }])],
      [
        "est",
        (b) =>
          b.concat([
            { p: "IH", st: 0 },
            { p: "S", st: -1 },
            { p: "T", st: -1 },
          ]),
      ],
      [
        "ness",
        (b) =>
          b.concat([
            { p: "N", st: -1 },
            { p: "AX", st: 0 },
            { p: "S", st: -1 },
          ]),
      ],
      [
        "ful",
        (b) =>
          b.concat([
            { p: "F", st: -1 },
            { p: "AX", st: 0 },
            { p: "L", st: -1 },
          ]),
      ],
      [
        "less",
        (b) =>
          b.concat([
            { p: "L", st: -1 },
            { p: "AX", st: 0 },
            { p: "S", st: -1 },
          ]),
      ],
      [
        "ment",
        (b) =>
          b.concat([
            { p: "M", st: -1 },
            { p: "AX", st: 0 },
            { p: "N", st: -1 },
            { p: "T", st: -1 },
          ]),
      ],
      ["y", (b) => b.concat([{ p: "IY", st: 0 }])],
      [
        "able",
        (b) =>
          b.concat([
            { p: "AX", st: 0 },
            { p: "B", st: -1 },
            { p: "AX", st: 0 },
            { p: "L", st: -1 },
          ]),
      ],
    ];
    for (const [suf, add] of sfx) {
      if (w.length > suf.length + 1 && w.endsWith(suf)) {
        const r = tryStem(w.slice(0, -suf.length).replace(/'$/, ""), add);
        if (r) return r;
      }
    }
    // compounds: two known halves ("rooftop", "somebody", "gunfire")
    for (let i = 3; i <= w0.length - 3; i++) {
      const a = w0.slice(0, i),
        b = w0.slice(i);
      if (L[a] && L[b]) {
        const pb = parseArpa(L[b]).map((x) =>
          x.st === 1 ? { p: x.p, st: 2 } : x,
        );
        return parseArpa(L[a]).concat(pb);
      }
    }
    // names: common English name endings on a spelled stem, stress on the first syllable ("Pemberton", "Hollisville")
    for (const [suf, arpa] of PN_END) {
      if (w0.length >= suf.length + 3 && w0.endsWith(suf)) {
        const stem = w0.slice(0, -suf.length);
        const sp = L[stem] ? parseArpa(L[stem]) : fromRules(stem);
        if (sp.some((x) => x.st >= 0) || /[aeiouy]/.test(stem)) {
          let first = true;
          const r = sp
            .map((x) => {
              if (x.st < 0) return x;
              const o = { p: x.p, st: first ? 1 : x.st === 1 ? 2 : x.st };
              first = false;
              return o;
            })
            .concat(parseArpa(arpa));
          r.rules = true;
          return r;
        }
      }
    }
    const r = fromRules(w0);
    r.rules = true;
    return r;
  }
  const PN_END = [
    ["ington", "IH0 NG T AH0 N"],
    ["ton", "T AH0 N"],
    ["town", "T AW2 N"],
    ["ville", "V IH2 L"],
    ["son", "S AH0 N"],
    ["sen", "S AH0 N"],
    ["berg", "B ER0 G"],
    ["burg", "B ER0 G"],
    ["ford", "F ER0 D"],
    ["field", "F IY2 L D"],
    ["wood", "W UH2 D"],
    ["land", "L AH0 N D"],
    ["stein", "S T AY2 N"],
    ["man", "M AH0 N"],
    ["ley", "L IY0"],
    ["ski", "S K IY0"],
    ["sky", "S K IY0"],
    ["worth", "W ER0 TH"],
    ["shire", "SH ER0"],
    ["bury", "B EH2 R IY0"],
    ["dale", "D EY2 L"],
    ["more", "M AO2 R"],
    ["wick", "W IH0 K"],
    ["well", "W EH2 L"],
  ];
  /** Words of `text` the lexicon doesn't cover (they fall back to spelling rules): for coverage checks. */
  function unknownWords(text) {
    const out = new Set();
    for (const ph of phrases(text))
      for (const w of ph.words) {
        const r = pron(w);
        if (r.rules) out.add(w);
      }
    return Array.from(out);
  }
  function sibil(p) {
    return (
      p === "S" ||
      p === "Z" ||
      p === "SH" ||
      p === "ZH" ||
      p === "CH" ||
      p === "JH"
    );
  }

  // ------------------------------------------------------------------
  // Planning: text → segments with durations → 5 ms parameter frames
  // ------------------------------------------------------------------
  // Weak (reduced) forms of function words inside a phrase — what a fast announcer actually says.
  const WEAK = {
    a: "AH0",
    an: "AH0 N",
    and: "AH0 N",
    the: "DH AH0",
    to: "T AH0",
    of: "AH0 V",
    for: "F ER0",
    from: "F R AH0 M",
    at: "AH0 T",
    can: "K AH0 N",
    was: "W AH0 Z",
    are: "ER0",
    your: "Y ER0",
    you: "Y UH0",
    them: "DH AH0 M",
    have: "HH AH0 V",
    has: "HH AH0 Z",
    had: "HH AH0 D",
    will: "W AH0 L",
    but: "B AH0 T",
    or: "ER0",
    as: "AH0 Z",
    some: "S AH0 M",
    there: "DH ER0",
    been: "B IH0 N",
    could: "K UH0 D",
    would: "W UH0 D",
    should: "SH UH0 D",
    just: "JH AH0 S T",
    her: "HH ER0",
    us: "AH0 S",
    than: "DH AH0 N",
    do: "D UH0",
    does: "D AH0 Z",
    were: "W ER0",
    into: "IH0 N T UH0",
    my: "M AY0",
    by: "B AY0",
  };
  const WEAK_V = { and: "AH0 N D", the: "DH IY0", to: "T UH0" }; // before a vowel
  const WH = new Set([
    "what",
    "who",
    "where",
    "when",
    "why",
    "how",
    "which",
    "whose",
  ]);
  /** Build the segment list of one phrase (Klatt duration rules + connected-speech processes). */
