// play-inline-33 08 — out
// Lines 2260-2420 of readable/play-inline-33.pretty.js (statement-aligned).
  const ARPA_SING = {
    IY: ["i"],
    IH: ["ih"],
    EY: ["e", "ih"],
    EH: ["e"],
    AE: ["ae"],
    AA: ["a"],
    AO: ["aw"],
    AH: ["uh"],
    AX: ["schwa"],
    OW: ["o", "uu"],
    UH: ["uu"],
    UW: ["oo"],
    ER: ["er"],
    AXR: ["er"],
    AY: ["a", "ih"],
    AW: ["a", "uu"],
    OY: ["o", "ih"],
  };
  const OLD_V = {
    i: "IY",
    ih: "IH",
    e: "EH",
    ae: "AE",
    a: "AA",
    aw: "AO",
    o: "AO",
    uh: "AH",
    oo: "UW",
    uu: "UH",
    er: "ER",
    schwa: "AX",
  };
  const OLD_D = {
    "e-ih": "EY",
    "a-ih": "AY",
    "a-i": "AY",
    "a-uu": "AW",
    "o-uu": "OW",
    "o-ih": "OY",
    "o-uu ": "OW",
  };

  // ------------------------------------------------------------------
  // Pronunciation: lexicon → suffix stripping → spelling rules
  // ------------------------------------------------------------------
  let LEX = null;
  function lex() {
    if (LEX) return LEX;
    LEX = Object.create(null);
    const src = S.voxLexicon || "";
    for (const line of src.split("\n")) {
      const i = line.indexOf(" ");
      if (i < 1) continue;
      LEX[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
    return LEX;
  }
  /** ARPAbet string ("HH AH0 L OW1") → [{p, st}] (st: -1 consonant, 0/1/2 vowel stress). AH0 → AX, ER0 → AXR. */
  function parseArpa(s) {
    return s
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => {
        const m = /^([A-Z]+)([012])?$/.exec(t.toUpperCase());
        if (!m) return null;
        let p = m[1];
        const st = m[2] === undefined ? -1 : +m[2];
        if (p === "AH" && st === 0) p = "AX";
        else if (p === "ER" && st === 0) p = "AXR";
        return KP[p]
          ? {
              p,
              st: KP[p].c === "V" || KP[p].c === "D" ? (st < 0 ? 1 : st) : -1,
            }
          : null;
      })
      .filter(Boolean);
  }
  /** Old spelling-rule phones → ARPAbet list (first nucleus stressed unless a prefix takes it). */
  function fromRules(w) {
    const ph = wordPhones(w),
      out = [];
    let nv = 0;
    const nvTot = ph.filter((p) => p.k !== "C").length;
    const stressIdx =
      nvTot >= 2 &&
      /^(be|re|de|a|con|pro|com|in|un|en|ex|dis)/.test(w) &&
      w.length > 4
        ? 1
        : 0;
    for (const p of ph) {
      if (p.k === "C") {
        out.push({ p: p.p === "H" ? "HH" : p.p, st: -1 });
        continue;
      }
      const st = nv === stressIdx ? 1 : 0;
      nv++;
      if (p.k === "D") {
        const key = p.v.join("-");
        if (key === "ih-oo") {
          out.push({ p: "Y", st: -1 });
          out.push({ p: "UW", st });
          continue;
        }
        out.push({ p: OLD_D[key] || OLD_V[p.v[0]] || "AX", st });
      } else
        out.push({
          p: st
            ? OLD_V[p.v[0]] || "AX"
            : p.v[0] === "schwa" || p.v[0] === "uh"
              ? "AX"
              : OLD_V[p.v[0]] || "AX",
          st,
        });
    }
    // unstressed short vowels reduce to schwa; silent h after a vowel ("sarah", "john"); "chr"/"chl" = K
    for (let i = 0; i < out.length; i++) {
      const x = out[i];
      if (
        x.st === 0 &&
        (x.p === "AE" ||
          x.p === "AA" ||
          x.p === "EH" ||
          x.p === "AH" ||
          x.p === "AO")
      )
        x.p = "AX";
      if (
        x.p === "HH" &&
        i > 0 &&
        out[i - 1].st >= 0 &&
        !(out[i + 1] && out[i + 1].st >= 0)
      ) {
        out.splice(i, 1);
        i--;
      }
    }
    if (/^ch[rl]/.test(w) && out[0] && out[0].p === "T")
      out.splice(0, 2, { p: "K", st: -1 });
    // fold T SH → CH, D ZH → JH
    for (let i = 0; i < out.length - 1; i++) {
      if (out[i].p === "T" && out[i + 1].p === "SH")
        out.splice(i, 2, { p: "CH", st: -1 });
      else if (out[i].p === "D" && out[i + 1].p === "ZH")
        out.splice(i, 2, { p: "JH", st: -1 });
    }
    return out;
  }
  const VOICELESS = {
    P: 1,
    T: 1,
    K: 1,
    F: 1,
    TH: 1,
    S: 1,
    SH: 1,
    CH: 1,
    HH: 1,
  };
  /** Word → [{p, st}] */
