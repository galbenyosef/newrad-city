// play-inline-37 01 — cur
// Lines 15-197 of readable/play-inline-37.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const S = G._snd;
  const R = S.radio;

  let enabled = true,
    lyricsOn = true;
  if (S.lsGet("radio_subs") === "0") enabled = false;
  if (S.lsGet("radio_lyrics") === "0") lyricsOn = false;
  let el = null,
    spk = null,
    txt = null,
    hideAt = 0,
    cur = null,
    shown = false;

  function ensureEl() {
    if (el || !document.body) return el;
    const st = document.createElement("style");
    st.textContent =
      ".nrc-radio-sub{position:fixed;left:50%;bottom:max(22vh,120px);transform:translateX(-50%);max-width:min(56vw,820px);z-index:120;" +
      'pointer-events:none;text-align:center;font-family:"Share Tech Mono","Courier New",monospace;font-size:clamp(12px,1.3vw,18px);' +
      "line-height:1.35;letter-spacing:.06em;color:var(--nrc-sub,#cfeefa);text-shadow:0 0 6px rgba(150,220,240,.5),0 1px 2px #000,0 0 2px #000;" +
      "background:rgba(4,10,14,.38);border-top:1px solid rgba(150,220,240,.35);border-bottom:1px solid rgba(150,220,240,.35);" +
      "padding:.35em .9em .4em;opacity:0;transition:opacity .35s ease}" +
      ".nrc-radio-sub.on{opacity:1}" +
      ".nrc-radio-sub.lyric span{font-style:italic;opacity:.82}" +
      ".nrc-radio-sub b{display:block;font-weight:normal;font-size:.72em;letter-spacing:.24em;opacity:.75;margin-bottom:.1em}" +
      '.nrc-radio-sub b:before{content:"[ ";}.nrc-radio-sub b:after{content:" ]";}';
    document.head.appendChild(st);
    el = document.createElement("div");
    el.className = "nrc-radio-sub";
    el.setAttribute("aria-live", "polite");
    spk = document.createElement("b");
    txt = document.createElement("span");
    el.appendChild(spk);
    el.appendChild(txt);
    document.body.appendChild(el);
    return el;
  }
  /** States in which a radio caption may appear (never over menus, dialogue, terminals or the title screen). */
  function stateOK() {
    const s = G.state;
    return s === "play" || s === "goggles";
  }
  /** Is the speaker audible to the player right now? */
  function audible(station) {
    if (station === "goggles") return true;
    if (!R.on || R.station !== station) return false;
    if (S.vol.master < 0.02 || S.radioGain() < 0.02) return false;
    return (S.radioPresence ? S.radioPresence() : 1) > 0.12;
  }

  /** Split a line into caption-sized pieces (whole sentences, ≤ ~120 characters where possible). */
  function pieces(text) {
    const sent = text.match(/[^.!?]+[.!?]+["')]*\s*|[^.!?]+$/g) || [text];
    const out = [];
    for (let s of sent) {
      s = s.trim();
      if (!s) continue;
      if (out.length && (out[out.length - 1] + " " + s).length <= 120)
        out[out.length - 1] += " " + s;
      else if (s.length > 150) {
        // very long sentence: break at a comma near the middle
        const mid = s.indexOf(", ", (s.length / 2 - 25) | 0);
        if (mid > 0) {
          out.push(s.slice(0, mid + 1));
          out.push(s.slice(mid + 2));
        } else out.push(s);
      } else out.push(s);
    }
    return out.length ? out : [text];
  }
  /** Lay the pieces out over [t0, t0+dur] (G.time.real seconds), proportionally to their length. */
  function layout(t0, dur) {
    if (!cur) return;
    const total = cur.pieces.reduce((a, p) => a + p.length + 8, 0);
    let t = t0;
    cur.times = [];
    for (const p of cur.pieces) {
      cur.times.push(t);
      t += (dur * (p.length + 8)) / total;
    }
    hideAt = t0 + dur + 0.6;
  }
  G.events.on("radioText", (e) => {
    if (!e || !e.text) return;
    cur = {
      station: e.station,
      speaker: e.speaker || "",
      text: String(e.text),
      t: G.time.real,
      pieces: pieces(String(e.text)),
      idx: -1,
      from: 0,
    };
    if (el) el.classList.remove("lyric");
    // default pacing (subtitle-only / TTS): ~14 characters per second; VOX re-times with S.subsTiming()
    layout(G.time.real, Math.max(2.2, cur.text.length / 14 + 0.8));
    if (enabled) ensureEl();
    if (spk) spk.textContent = String(cur.speaker).toUpperCase();
  });
  /**
   * Sung lyric line from a record ({station, speaker (artist), text, startIn (s from now), dur}). Shown as an italic
   * "♪ … ♪" caption while the singer sings it; never replaces a line the DJ is speaking. Only for the goggle radio
   * (a radio set across the room is ambience, not a karaoke screen).
   */
  S.subsLyric = function (e) {
    if (!lyricsOn || !enabled || !e || !e.text) return;
    if (R.speaking || (S.radioPresence && R.emitter)) return;
    const t0 = G.time.real + Math.max(0, e.startIn || 0);
    const text = "\u266A " + String(e.text).replace(/[,;]$/, "") + " \u266A";
    cur = {
      station: e.station,
      speaker: e.speaker || "",
      text,
      t: G.time.real,
      pieces: [text],
      idx: -1,
      from: t0 - 0.15,
      lyric: true,
    };
    cur.times = [t0];
    hideAt = t0 + Math.max(1.2, e.dur || 2) + 0.35;
    ensureEl();
    if (spk) spk.textContent = String(cur.speaker).toUpperCase();
  };
  S.setLyrics = function (on) {
    lyricsOn = !!on;
    S.lsSet("radio_lyrics", lyricsOn ? "1" : "0");
  };
  S.lyrics = function () {
    return lyricsOn;
  };
  /** The voice knows exactly when it starts and how long it lasts: re-time the captions to it. */
  S.subsTiming = function (text, startIn, dur) {
    if (cur && cur.text === text)
      layout(G.time.real + Math.max(0, startIn), Math.max(1, dur));
  };

  /** Called by the sound module update (cheap: one class toggle when the state changes). */
  S.subsUpdate = function () {
    if (!el) return;
    let want = false;
    if (enabled && cur && stateOK() && audible(cur.station)) {
      const speaking = R.speaking && R.lastText && R.lastText.text === cur.text;
      // up while the voice is speaking the line, plus a short read-out after it ends
      want = speaking || G.time.real < hideAt;
      if (cur.lyric) want = G.time.real >= cur.from && G.time.real < hideAt;
    }
    if (want && cur) {
      let i = 0;
      while (i + 1 < cur.pieces.length && G.time.real >= cur.times[i + 1]) i++;
      if (i !== cur.idx) {
        cur.idx = i;
        txt.textContent = cur.pieces[i];
        spk.textContent = String(cur.speaker).toUpperCase();
        el.classList.toggle("lyric", !!cur.lyric);
      }
    }
    if (want !== shown) {
      shown = want;
      el.classList.toggle("on", want);
    }
  };
  G.events.on("reset", () => {
    cur = null;
  });
  G.events.on("radioChanged", (id) => {
    if (!id) cur = null;
  });

  S.setSubtitles = function (on) {
    enabled = !!on;
    S.lsSet("radio_subs", enabled ? "1" : "0");
    if (!enabled && el) {
      shown = false;
      el.classList.remove("on");
    }
  };
  S.subtitles = function () {
    return enabled;
  };
