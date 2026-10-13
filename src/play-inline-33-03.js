// play-inline-33 03 — isv
// Lines 666-964 of readable/play-inline-33.pretty.js (statement-aligned).
  function wordPhones(w) {
    if (EXC[w]) return excPhones(EXC[w]);
    // past tense "-ed": "tuned" → T uh N D, "wanted" keeps its vowel
    if (
      w.length > 3 &&
      w.endsWith("ed") &&
      !isV(w[w.length - 3]) &&
      !/[td]/.test(w[w.length - 3])
    ) {
      const st = wordPhones(
        w.slice(0, -2) +
          (isV(w[w.length - 4]) && !isV(w[w.length - 5] || "a") ? "e" : ""),
      );
      st.push({ k: "C", p: /[pkfsx]|ch|sh/.test(w.slice(-4, -2)) ? "T" : "D" });
      return st;
    }
    w = w.replace(/dge/g, "j").replace(/tch/g, "ch");
    if (w.length === 2 && w[1] === "e" && !isV(w[0]))
      return [
        { k: "C", p: { b: "B", h: "H", m: "M", w: "W", s: "SH" }[w[0]] || "D" },
        { k: "V", v: ["i"] },
      ];
    const out = [];
    const V = (v, v2) =>
      out.push(v2 ? { k: "D", v: [v, v2] } : { k: "V", v: [v] });
    const C = (p) => {
      if (out.length && out[out.length - 1].p === p) return;
      out.push({ k: "C", p });
    };
    const n = w.length;
    // silent final e (magic e): "make", "time", "home", "cute"
    const magic =
      n > 2 &&
      w[n - 1] === "e" &&
      !isV(w[n - 2]) &&
      isV(w[n - 3]) &&
      w[n - 3] !== "e";
    const end = magic ? n - 1 : n;
    for (let i = 0; i < end; i++) {
      const c = w[i],
        d = w[i + 1] || "",
        tri = w.substr(i, 3),
        di = c + d;
      const last = i === end - 1;
      if (isV(c) && !(c === "y" && i === 0)) {
        // vowel digraphs
        if (tri === "igh") {
          V("a", "i");
          i += 2;
          continue;
        }
        if (
          di === "ee" ||
          di === "ea" ||
          di === "ie" ||
          (di === "ey" && last === false)
        ) {
          V("i");
          i++;
          continue;
        }
        if (di === "oo") {
          V("oo");
          i++;
          continue;
        }
        if (di === "ou" || di === "ow") {
          V("a", "uu");
          i++;
          continue;
        }
        if (di === "ai" || di === "ay" || di === "ei") {
          V("e", "ih");
          i++;
          continue;
        }
        if (di === "oa" || di === "oe") {
          V("o", "uu");
          i++;
          continue;
        }
        if (di === "au" || di === "aw") {
          V("aw");
          i++;
          continue;
        }
        if (di === "oi" || di === "oy") {
          V("o", "ih");
          i++;
          continue;
        }
        if (di === "ue" || di === "ew") {
          V("ih", "oo");
          i++;
          continue;
        }
        // r-coloured
        if (
          d === "r" &&
          (c === "e" || c === "i" || c === "u") &&
          !isV(w[i + 2] || "")
        ) {
          V("er");
          i++;
          continue;
        }
        if (d === "r" && c === "a" && !isV(w[i + 2] || "")) {
          V("a");
          C("R");
          i++;
          continue;
        }
        if (d === "r" && c === "o" && !isV(w[i + 2] || "")) {
          V("o");
          C("R");
          i++;
          continue;
        }
        // magic-e long vowels (vowel + single consonant + final e)
        if (magic && i === n - 3) {
          if (c === "a") V("e", "ih");
          else if (c === "i" || c === "y") V("a", "ih");
          else if (c === "o") V("o", "uu");
          else if (c === "u") V("ih", "oo");
          else V("e");
          continue;
        }
        // short vowels
        if (c === "a") V(last && n > 1 ? "schwa" : "ae");
        else if (c === "e") {
          if (last && n > 2) continue;
          V(i > 0 && !last && n > 5 && !isV(d) ? "ih" : "e");
        } else if (c === "i") V("ih");
        else if (c === "o") V(last ? "o" : "a");
        else if (c === "u")
          V(i === 0 || w[i - 1] === "p" || w[i - 1] === "b" ? "uh" : "uh");
        else if (c === "y") V(last ? "i" : "ih");
        continue;
      }
      // consonant digraphs
      if (di === "sh") {
        C("SH");
        i++;
        continue;
      }
      if (di === "ch") {
        C("T");
        C("SH");
        i++;
        continue;
      }
      if (di === "th") {
        C(FUNC.has(w) ? "DH" : "TH");
        i++;
        continue;
      }
      if (di === "ph") {
        C("F");
        i++;
        continue;
      }
      if (di === "ng") {
        C("NG");
        i++;
        if (w[i + 1] === "g") i++;
        continue;
      }
      if (di === "ck") {
        C("K");
        i++;
        continue;
      }
      if (di === "qu") {
        C("K");
        C("W");
        i++;
        continue;
      }
      if (di === "wh") {
        C("W");
        i++;
        continue;
      }
      if (di === "gh") {
        i++;
        continue;
      }
      if (di === "kn" && i === 0) {
        C("N");
        i++;
        continue;
      }
      if (di === "wr" && i === 0) {
        C("R");
        i++;
        continue;
      }
      if (tri === "tio" || tri === "sio") {
        C("SH");
        V("schwa");
        C("N");
        i += w[i + 3] === "n" ? 3 : 2;
        continue;
      }
      if (c === d && c !== "e" && c !== "o") continue; // doubled consonant
      switch (c) {
        case "b":
          C("B");
          break;
        case "d":
          C("D");
          break;
        case "f":
          C("F");
          break;
        case "g":
          C(d === "e" || d === "i" || d === "y" ? "ZH" : "G");
          if (d === "e" || d === "i" || d === "y") {
            out[out.length - 1].p = "D";
            C("ZH");
          }
          break;
        case "h":
          C("H");
          break;
        case "j":
          C("D");
          C("ZH");
          break;
        case "k":
          C("K");
          break;
        case "l":
          C("L");
          break;
        case "m":
          C("M");
          break;
        case "n":
          C("N");
          break;
        case "p":
          C("P");
          break;
        case "q":
          C("K");
          break;
        case "r":
          C("R");
          break;
        case "t":
          C("T");
          break;
        case "v":
          C("V");
          break;
        case "w":
          C("W");
          break;
        case "x":
          C("K");
          C("S");
          break;
        case "y":
          C("Y");
          break;
        case "z":
          C("Z");
          break;
        case "c":
          C(d === "e" || d === "i" || d === "y" ? "S" : "K");
          break;
        case "s":
          C(
            i > 0 && isV(w[i - 1]) && isV(d)
              ? "Z"
              : last && i > 0 && !"ptkf".includes(w[i - 1])
                ? "Z"
                : "S",
          );
          break;
        default:
          break;
      }
    }
    if (!out.some((p) => p.k !== "C"))
      out.splice(out.length ? 1 : 0, 0, { k: "V", v: ["schwa"] }); // "Mr", "hmm"
    return out;
  }

  // ------------------------------------------------------------------
  // Text → phrases → timed segments
  // ------------------------------------------------------------------
  /**
   * Split text into intonation phrases: [{words:[..], end:'.'|'?'|'!'|','|'—'|'…', pause}]
   */
  // Non-verbal vocalisations the scripts may use: "[laugh]", "[chuckle]", "[whoop]" (Vinnie's "Whoo-ee!"),
  // "[sigh]", "[breath]". They are performed by VOX 2 and stripped from captions / TTS (S.vox.stripMarks).
  const VOCS = { laugh: 1, chuckle: 1, whoop: 1, sigh: 1, breath: 1 };
