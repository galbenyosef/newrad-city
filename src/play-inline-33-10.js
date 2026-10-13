// play-inline-33 10 — segs
// Lines 2755-3054 of readable/play-inline-33.pretty.js (statement-aligned).
  function segPhrase(ph, P, rnd) {
    let segs = [];
    const nw = ph.words.length;
    const emphW = ph.emph || [];
    const prons = ph.words.map((w) => pron(w));
    ph.words.forEach((w, wi) => {
      const func = FUNC.has(w.replace(/'/g, "'")) && nw > 1;
      let pr = prons[wi];
      // weak forms inside the phrase (never phrase-final or emphasised: "what are you *for*?")
      if (func && wi < nw - 1 && !emphW[wi] && WEAK[w]) {
        const nx = prons[wi + 1] && prons[wi + 1][0];
        const vNext = nx && nx.st >= 0;
        pr = parseArpa(vNext && WEAK_V[w] ? WEAK_V[w] : WEAK[w]);
      }
      const nuc = pr.filter((x) => x.st >= 0).length;
      let vi = 0;
      pr.forEach((x, pi) => {
        const k = KP[x.p];
        const isV = x.st >= 0;
        const st = isV ? (func ? 0 : x.st) : -1;
        segs.push({
          p: x.p,
          k,
          st,
          w: wi,
          func,
          emph: !!emphW[wi],
          wInit: pi === 0,
          wFin: pi === pr.length - 1,
          vi: isV ? vi : -1,
          nucW: nuc,
          lastWord: wi === nw - 1,
        });
        if (isV) vi++;
      });
    });
    // connected speech: geminates across a word boundary merge ("this sound", "big game")
    for (let i = 0; i < segs.length - 1; i++) {
      const s = segs[i],
        n = segs[i + 1];
      if (s.st < 0 && n.st < 0 && s.p === n.p && s.w !== n.w) {
        s.gem = true;
        s.wFin = true;
        segs.splice(i + 1, 1);
      }
    }
    // American flapping: t/d between a vowel (or r) and an unstressed vowel ("better", "got a", "city")
    for (let i = 1; i < segs.length - 1; i++) {
      const s = segs[i],
        pv = segs[i - 1],
        nx = segs[i + 1];
      if (
        (s.p === "T" || s.p === "D") &&
        (pv.st >= 0 || pv.p === "R") &&
        nx.st === 0 &&
        (!s.wInit || s.func) &&
        !(
          segs[i + 2] &&
          segs[i + 2].p === "N" &&
          segs[i + 2].w === nx.w &&
          segs[i + 2].wFin
        )
      ) {
        s.p = "DX";
        s.k = KP.DX;
      }
    }
    // syllable of each segment: consonants belong to the next nucleus in the word, trailing ones to the last
    let nucLeft = 0;
    for (let i = segs.length - 1; i >= 0; i--) {
      const s = segs[i];
      if (s.st >= 0) nucLeft = s.vi;
      s.syl = s.st >= 0 ? s.vi : nucLeft;
    }
    // phrase-final syllable: from the last nucleus of the last word to the end
    let lastNuc = -1;
    for (let i = segs.length - 1; i >= 0; i--)
      if (segs[i].st >= 0 && segs[i].lastWord) {
        lastNuc = i;
        break;
      }
    const fast = P.patter ? 1 - P.patter : 1;
    // durations
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i],
        k = s.k,
        isV = s.st >= 0;
      const nx = segs[i + 1],
        pv = segs[i - 1];
      let pr = 1;
      const finalSyl =
        lastNuc >= 0 &&
        i >= lastNuc - 0 &&
        s.lastWord &&
        (isV ? i === lastNuc : i > lastNuc);
      if (finalSyl)
        pr *= ph.end === "," ? 1.25 : 1.4; // phrase-final lengthening
      else if (isV) pr *= 0.75; // non-final shortening (gentler than Klatt's 0.6: announcer pace)
      if (isV && s.nucW > 1 && s.vi < s.nucW - 1) pr *= 0.85; // non-word-final syllable
      if (isV && s.nucW > 1) pr *= 0.85; // polysyllabic shortening
      if (!isV && !s.wInit) pr *= 0.85; // non-initial consonant
      if (isV && s.st === 0) pr *= 0.55 * fast;
      else if (!isV && nx && nx.st === 0 && !s.wInit) pr *= 0.75; // unstressed (more so in patter)
      if (s.func) pr *= 0.8 * (P.patter ? fast : 1);
      if (s.emph) pr *= isV && s.st > 0 ? 1.3 : 1.1; // emphasis: the DJ leans on the word
      if (isV && nx && nx.w === s.w) {
        // post-vocalic context (same word)
        const c = nx.k.c;
        if (c === "S" || c === "A") pr *= nx.k.vc ? 1.1 : 0.72;
        else if (c === "F") pr *= nx.k.vc ? 1.2 : 0.9;
        else if (c === "N") pr *= 0.88;
      }
      if (!isV && nx && nx.st < 0 && pv && pv.st < 0)
        pr *= 0.7; // inside a consonant cluster
      else if (
        !isV &&
        ((nx && nx.st < 0 && nx.w === s.w) || (pv && pv.st < 0 && pv.w === s.w))
      )
        pr *= 0.82;
      if (s.gem) pr *= 1.5;
      let d = (k.dm + (k.di - k.dm) * pr) / 1000;
      if (!isV && pr < 0.75) d = Math.max(d * 0.95, (k.dm * 0.7) / 1000);
      s.d = (d / P.rate) * (0.94 + rnd() * 0.12);
      s.final = finalSyl;
    }
    return segs;
  }
  /** Non-verbal vocalisations as segments: laughs, chuckles, Vinnie's "Whoo-ee!", sighs, audible breaths. */
  function vocSegs(kind, P, rnd) {
    const segs = [],
      r = Math.sqrt(P.rate);
    const add = (p, d, o) =>
      segs.push(
        Object.assign(
          {
            p,
            k: KP[p],
            st: KP[p].c === "V" || KP[p].c === "D" ? 1 : -1,
            d: d / r,
            voc: kind,
            vi: 0,
            nucW: 1,
          },
          o || {},
        ),
      );
    if (kind === "laugh") {
      const n = 3 + ((rnd() * 3) | 0);
      for (let i = 0; i < n; i++) {
        add("HH", 0.04 + rnd() * 0.025);
        add(i % 2 ? "AH" : "AE", (i === n - 1 ? 0.14 : 0.07) + rnd() * 0.025, {
          av: 0.78 - i * 0.05,
          ah: 0.32,
          pulse: i,
          np: n,
        });
      }
      add("HH", 0.06, { ah: 0.3 });
    } else if (kind === "chuckle") {
      const n = 2 + ((rnd() * 2) | 0);
      for (let i = 0; i < n; i++) {
        add("HH", 0.035 + rnd() * 0.02);
        add("EH", 0.06 + rnd() * 0.02, {
          av: 0.5 - i * 0.06,
          ah: 0.22,
          pulse: i,
          np: n,
        });
      }
    } else if (kind === "whoop") {
      add("W", 0.07);
      add("UW", 0.15, { av: 1, pulse: 0, np: 2 });
      add("IY", 0.44, { av: 1.08, pulse: 1, np: 2 });
    } else if (kind === "sigh") {
      add("HH", 0.13, { ah: 0.4 });
      add("AA", 0.42, { av: 0.34, ah: 0.45, pulse: 0, np: 1 });
    } else if (kind === "breath") {
      segs.push({ p: "BR", k: { c: "BR" }, st: -1, d: 0.3 + rnd() * 0.1 });
    }
    return segs;
  }

  /** Expand stops/affricates into closure → burst → aspiration sub-segments and time everything. */
  function timeline(phrasesSegs, plans, rate) {
    const out = [];
    let t = 0;
    phrasesSegs.forEach((segs, pi) => {
      const pl = plans[pi];
      if (pl.breath) {
        out.push({ p: "BR", k: { c: "BR" }, t, d: pl.breath, st: -1 });
        t += pl.breath;
      }
      pl.t0 = t;
      segs.forEach((s, i) => {
        const k = s.k,
          nx = segs[i + 1],
          pv = segs[i - 1];
        if (k.c === "S" || k.c === "A") {
          const nxSon = nx && SON[nx.k.c] !== undefined;
          const afterS = pv && pv.p === "S" && pv.w === s.w;
          let asp = 0;
          if (
            !k.vc &&
            k.c === "S" &&
            nx &&
            (nxSon || nx.k.c === "G") &&
            !afterS
          )
            asp = nx.st > 0 ? 0.055 : 0.03;
          else if (k.vc) asp = 0.008;
          // "act", "big deal": the first stop is barely released; phrase-final stops are released (a clear
          // announcer's "that's that." — over AM the release is the only place cue left), a little softer
          const unreleased =
            nx && (s.wFin || nx.w === s.w) && (nx.k.c === "S" || nx.k.c === "A")
              ? 0.45
              : !nx
                ? 0.8
                : 0;
          const burst =
            k.c === "A"
              ? Math.max(0.05, s.d * 0.9)
              : k.pl === "vel"
                ? 0.016
                : k.pl === "alv"
                  ? 0.012
                  : 0.008;
          const cl = Math.max(0.03, s.d - (k.c === "A" ? burst * 0.4 : 0));
          out.push({ p: s.p, k, sub: "cl", t, d: cl, st: -1, src: s });
          t += cl;
          out.push({
            p: s.p,
            k,
            sub: "bu",
            t,
            d: burst,
            st: -1,
            src: s,
            weak: unreleased,
          });
          t += burst;
          if (asp) {
            asp /= rate;
            out.push({
              p: s.p,
              k,
              sub: "as",
              t,
              d: asp,
              st: -1,
              src: s,
              strong: nx && nx.st > 0,
            });
            t += asp;
          }
          return;
        }
        out.push(Object.assign({}, s, { t }));
        t += s.d;
      });
      pl.t1 = t;
      out.push({ p: "PAU", k: { c: "PAU" }, t, d: pl.pause, st: -1 });
      t += pl.pause;
    });
    return { segs: out, dur: t };
  }

  /** Piecewise-linear track builder: add(t, v) in time order; sample(frames) → Float32Array written with stride. */
  function Track() {
    this.t = [];
    this.v = [];
  }
  Track.prototype.add = function (t, v) {
    const n = this.t.length;
    if (n && t < this.t[n - 1]) t = this.t[n - 1];
    this.t.push(t);
    this.v.push(v);
  };
  Track.prototype.fill = function (arr, idx, nF, fa) {
    const T = this.t,
      V = this.v,
      n = T.length;
    let j = 0;
    fa = fa || 0;
    for (let f = fa; f < fa + nF; f++) {
      const t = f * FR;
      while (j < n - 1 && T[j + 1] <= t) j++;
      let v;
      if (!n) v = 0;
      else if (t <= T[0]) v = V[0];
      else if (j >= n - 1) v = V[n - 1];
      else {
        const a = T[j],
          b = T[j + 1];
        v = b > a ? V[j] + ((V[j + 1] - V[j]) * (t - a)) / (b - a) : V[j + 1];
      }
      arr[(f - fa) * NP + idx] = v;
    }
  };

  /** Formant, bandwidth, amplitude and frication tracks for a timed segment list (shared by speech and song). */
