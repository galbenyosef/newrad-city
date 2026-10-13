// play-inline-40 04 — accent
// Lines 1050-1297 of readable/play-inline-40.pretty.js (statement-aligned).
  if (VP) {
    const base = VP.announcer;
    const mk = (o) =>
      Object.assign({}, base, { ta: 0.0001, patter: 0, pe: 2.2 }, o);
    VP.human_m = mk({
      f0: 112,
      range: 0.3,
      rate: 1.04,
      fs: 1.0,
      breath: 0.06,
      accent: 1.05,
      pause: 0.9,
      vib: 0.006,
      warmth: 4,
      fry: 0.5,
      tilt: 0.3,
      oq: 0.55,
      jitter: 0.01,
      shimmer: 0.04,
    });
    VP.human_f = mk({
      f0: 196,
      range: 0.3,
      rate: 1.04,
      fs: 1.16,
      breath: 0.09,
      accent: 1.0,
      pause: 0.9,
      vib: 0.006,
      gain: 0.9,
      warmth: 2,
      fry: 0.3,
      tilt: 0.36,
      oq: 0.63,
      jitter: 0.008,
      shimmer: 0.035,
    });
    VP.old_m = mk({
      f0: 104,
      range: 0.24,
      rate: 0.9,
      fs: 1.0,
      breath: 0.12,
      accent: 0.9,
      pause: 1.15,
      vib: 0.02,
      warmth: 4,
      fry: 1.0,
      tilt: 0.5,
      oq: 0.64,
      jitter: 0.025,
      shimmer: 0.08,
    });
    VP.raider_f = mk({
      f0: 185,
      range: 0.4,
      rate: 1.15,
      fs: 1.13,
      breath: 0.1,
      accent: 1.35,
      pause: 0.75,
      vib: 0.004,
      gain: 0.95,
      warmth: 3,
      fry: 0.5,
      tilt: 0.25,
      oq: 0.55,
      jitter: 0.02,
      shimmer: 0.06,
    });
    VP.brute = mk({
      f0: 66,
      range: 0.26,
      rate: 0.86,
      fs: 0.8,
      breath: 0.08,
      accent: 1.3,
      pause: 1.1,
      vib: 0.004,
      gain: 1.05,
      warmth: 8,
      fry: 1.2,
      tilt: 0.3,
      oq: 0.5,
      jitter: 0.03,
      shimmer: 0.1,
    });
    VP.soldier = mk({
      f0: 104,
      range: 0.2,
      rate: 1.02,
      fs: 0.98,
      breath: 0.05,
      accent: 0.9,
      pause: 0.85,
      vib: 0.004,
      warmth: 5,
      fry: 0.6,
      tilt: 0.3,
      oq: 0.52,
      jitter: 0.008,
      shimmer: 0.03,
    });
    VP.bot = mk({
      f0: 118,
      range: 0.03,
      rate: 0.92,
      fs: 1.02,
      breath: 0.0,
      accent: 0.3,
      pause: 1.1,
      vib: 0,
      gain: 0.95,
      warmth: 1,
      fry: 0,
      tilt: 0.2,
      oq: 0.45,
      jitter: 0.0,
      shimmer: 0.0,
    });
    VP.bot_posh = mk({
      f0: 150,
      range: 0.34,
      rate: 1.08,
      fs: 1.05,
      breath: 0.0,
      accent: 1.2,
      pause: 0.9,
      vib: 0.002,
      gain: 0.9,
      warmth: 1,
      fry: 0,
      tilt: 0.25,
      oq: 0.5,
      jitter: 0.002,
      shimmer: 0.01,
      patter: 0.05,
    });
  }
  function actorGender(a) {
    const g =
      a.gender ||
      (a.def && a.def.gender) ||
      (a.char && (a.char.gender || (a.char.opts && a.char.opts.gender))) ||
      (a.opts && a.opts.gender);
    if (g) return String(g)[0].toLowerCase() === "f" ? "f" : "m";
    return /(^f_|_f$|female)/.test(String(a.voice || "")) ? "f" : "m";
  }
  S.barkProfile = function (a) {
    const v = String(a.voice || ""),
      ty = String(a.type || ""),
      both = v + " " + ty;
    const kind = S.kindOf(ty);
    if (
      a.isRobot ||
      /robot|patrolman|valet|striker|bulwark|thinker|turret/.test(both) ||
      kind === "skyeye"
    )
      return kind === "skyeye" || /turret/.test(both)
        ? null
        : /posh|valet/.test(both)
          ? "bot_posh"
          : "bot";
    if (kind === "brute") return "brute";
    if (
      a.isCreature ||
      kind === "ripjaw" ||
      kind === "shellback" ||
      kind === "maniac" ||
      /amb_none/.test(both)
    )
      return null;
    const f = actorGender(a) === "f";
    if (v === "raider" || ty === "raider") return f ? "raider_f" : "raider";
    if (
      !f &&
      /continuity|covenant|warden|lancer|soldier|officer|marshal|guard/.test(
        both,
      )
    )
      return "soldier";
    if (!f && /m_old|preacher/.test(v)) return "old_m";
    return f ? "human_f" : "human_m";
  };
  let npcVox = false; // no spoken NPC barks by default (user preference); captions unaffected
  npcVox = S.lsGet("npcvox2") === "1";
  S.setNpcVoices = function (on) {
    npcVox = !!on;
    S.lsSet("npcvox2", npcVox ? "1" : "0");
    if (!npcVox) N.barks.slice().forEach((b) => endBark(b, 0.1));
  };
  S.npcVoices = () => npcVox;
  const BARK_MAX = 3;
  function cleanBark(text) {
    let t = String(text || "")
      .replace(/\*[^*]*\*/g, " ")
      .replace(/\[[^\]]*\]/g, " ")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, " ")
      .trim();
    if (!t || t.indexOf("♪") >= 0) return ""; // sung lines are not spoken
    if (!/[a-z]/i.test(t)) return ""; // "…", "?!"
    if (t.length > 170) {
      const cut = t.slice(0, 170);
      const e = Math.max(
        cut.lastIndexOf(". "),
        cut.lastIndexOf("! "),
        cut.lastIndexOf("? "),
      );
      t = e > 40 ? cut.slice(0, e + 1) : cut.replace(/\s+\S*$/, "…");
    }
    return t;
  }
  function endBark(b, fade) {
    if (b.done) return;
    b.done = true;
    try {
      if (b.ctl) b.ctl.stop(fade === undefined ? 0.12 : fade);
    } catch (e) {
      /* */
    }
    const nodes = b.nodes;
    setTimeout(
      () =>
        nodes.forEach((n) => {
          try {
            if (n.stop) n.stop();
          } catch (e) {
            /* */
          }
          try {
            n.disconnect();
          } catch (e) {
            /* */
          }
        }),
      900,
    );
    const i = N.barks.indexOf(b);
    if (i >= 0) N.barks.splice(i, 1);
  }
  function headPos(a, out) {
    out.x = a.pos.x;
    out.z = a.pos.z;
    out.y = a.pos.y + (a.height || (a.td && a.td.height) || 1.75) * 0.92;
    return out;
  }
  /** Perform one bark line from an actor's head. */
