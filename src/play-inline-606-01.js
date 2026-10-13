// play-inline-606 01 — right
// Lines 12-306 of readable/play-inline-606.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const H = G.hud._;

  function textOf(d) {
    return typeof d.text === "function"
      ? d.text()
      : d.text || d.transcript || d.desc || "";
  }
  function titleOf(e) {
    const d = e.def || {};
    return d.title || d.name || H.itemName(e.id);
  }
  function itemsOfType(t) {
    return (H.call("inventory", "list", [t], []) || []).filter(
      (e) => e && e.count > 0,
    );
  }

  // ------------------------------------------------------------------
  // NOTES
  // ------------------------------------------------------------------
  H.ggPage("notes", "notes", {
    render(body) {
      const notes = itemsOfType("note");
      notes.sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
      const cols = H.el("div", "gg-cols", body);
      const left = H.el("div", "gg-col-l", cols);
      const right = H.el("div", "gg-col-r", cols);
      H.ggList(
        left,
        notes.map((n) => ({ label: titleOf(n) })),
        "notes/notes",
        {
          empty: "No notes.",
          onSelect(i) {
            const d = notes[i].def || {};
            right.innerHTML =
              '<div class="gg-dtitle">' +
              H.esc(H.up(titleOf(notes[i]))) +
              '</div><div class="gg-rule"></div><div class="gg-notebody"></div>';
            right.querySelector(".gg-notebody").textContent = textOf(d);
            // reading a note can teach a code: the locks module listens for 'noteRead'
            G.events.emit("noteRead", notes[i].id);
            if (d.lock || d.code) {
              const id = d.lock || d.code;
              H.call("locks", "learn", [id]);
            }
          },
        },
      );
      if (!notes.length)
        right.innerHTML =
          '<div class="gg-empty">' +
          H.glyph("note") +
          " NOTES YOU PICK UP ARE FILED HERE.</div>";
    },
    hints() {
      return [];
    },
  });

  // ------------------------------------------------------------------
  // CODES
  // ------------------------------------------------------------------
  /** Learned codes/passcodes from the locks registry (several API spellings accepted). */
  function knownCodes() {
    let v = H.callAny(
      "locks",
      ["known", "learned", "knownCodes", "codes"],
      [],
      null,
    );
    if (!Array.isArray(v)) {
      const all = H.callAny("locks", ["list", "all"], [], null);
      v = Array.isArray(all)
        ? all.filter((l) => l && (l.learned || l.known))
        : [];
    }
    return v.filter((l) => l && (l.code || l.passcode));
  }
  H.knownCodes = knownCodes;
  function isOpen(l) {
    if (typeof l.open === "boolean") return l.open;
    if (typeof l.opened === "boolean") return l.opened;
    return !!H.call("locks", "isOpen", [l.id], false);
  }
  H.ggPage("notes", "codes", {
    render(body) {
      // review hook (screenshots only): &learnCodes=N logs the first N coded locks
      if (G.SHOT && G.QS && G.QS.get("learnCodes") && !H._learned) {
        H._learned = true;
        const all = (H.call("locks", "list", [], []) || [])
          .filter((l) => l && (l.code || l.passcode))
          .slice(0, Number(G.QS.get("learnCodes")) || 4);
        for (const l of all)
          H.call("locks", "learn", [l.id, "review", { silent: true }]);
      }
      const codes = knownCodes()
        .slice()
        .sort((a, b) =>
          String(a.label || a.id).localeCompare(String(b.label || b.id)),
        );
      const keys = itemsOfType("key");
      const rows = [];
      if (codes.length) rows.push({ head: true, label: "Codes & passcodes" });
      for (const c of codes)
        rows.push({
          label: c.label || c.id,
          right: isOpen(c) ? "OPENED" : c.code ? "KEYPAD" : "TERMINAL",
          dim: isOpen(c),
          kind: "code",
          c,
        });
      if (keys.length) rows.push({ head: true, label: "Keys carried" });
      for (const k of keys)
        rows.push({ label: titleOf(k), right: "KEY", kind: "key", k });
      const cols = H.el("div", "gg-cols", body);
      const left = H.el("div", "gg-col-l", cols);
      const right = H.el("div", "gg-col-r", cols);
      H.ggList(left, rows, "notes/codes", {
        empty: "No codes found yet.",
        onSelect(i, it) {
          if (it.kind === "code") {
            const c = Object.assign(
              {},
              H.call("locks", "get", [it.c.id], null) || {},
              it.c,
            );
            const hh =
              typeof c.hour === "number"
                ? String(Math.floor(c.hour)).padStart(2, "0") +
                  ":" +
                  String(Math.floor((c.hour % 1) * 60)).padStart(2, "0")
                : "";
            right.innerHTML =
              H.ggHead(c.code ? "Keypad code" : "Terminal passcode") +
              '<div class="gg-dtitle">' +
              H.esc(H.up(c.label || c.id)) +
              (isOpen(c) ? '<span class="gg-tag">OPENED</span>' : "") +
              "</div>" +
              '<div class="gg-code' +
              (c.code ? "" : " word") +
              '">' +
              H.esc(c.code || c.passcode) +
              "</div>" +
              (c.source || c.foundIn
                ? H.ggStat("Found in", c.source || c.foundIn)
                : "") +
              (c.where || c.location
                ? H.ggStat("Lock at", c.where || c.location)
                : "") +
              (c.day
                ? H.ggStat("Logged", "Day " + c.day + (hh ? " · " + hh : ""))
                : "") +
              (c.hint
                ? '<div class="gg-desc sm">' + H.esc(c.hint) + "</div>"
                : "");
          } else {
            const d = it.k.def || {};
            right.innerHTML =
              H.ggHead("Key") +
              '<div class="gg-itemplate">' +
              H.itemIcon(d) +
              '</div><div class="gg-dtitle">' +
              H.esc(H.up(titleOf(it.k))) +
              "</div>" +
              (d.desc
                ? '<div class="gg-desc sm">' + H.esc(d.desc) + "</div>"
                : "");
          }
        },
      });
      if (!rows.length)
        right.innerHTML =
          '<div class="gg-empty">' +
          H.glyph("code") +
          " CODES FROM NOTES, TAPES, TERMINALS AND CONVERSATIONS ARE LOGGED HERE AUTOMATICALLY.</div>";
    },
    hints() {
      return [];
    },
  });

  // ------------------------------------------------------------------
  // TAPE REELS
  // ------------------------------------------------------------------
  function drawReels(cv, t, playing) {
    const g = cv.getContext("2d"),
      W = cv.width,
      Hh = cv.height,
      col = H.tint().c;
    g.clearRect(0, 0, W, Hh);
    g.strokeStyle = col;
    g.fillStyle = col;
    g.lineWidth = 1.5;
    g.shadowColor = col;
    g.shadowBlur = 5;
    const r = Hh * 0.38;
    for (const cx of [W * 0.27, W * 0.73]) {
      const cy = Hh * 0.46;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
      g.stroke();
      for (let k = 0; k < 3; k++) {
        const a = (playing ? t * 2.4 : 0) + (k * Math.PI * 2) / 3;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * r * 0.3, cy + Math.sin(a) * r * 0.3);
        g.lineTo(cx + Math.cos(a) * r * 0.85, cy + Math.sin(a) * r * 0.85);
        g.stroke();
      }
    }
    g.beginPath();
    g.moveTo(W * 0.27, Hh * 0.46 + r);
    g.lineTo(W * 0.5, Hh * 0.96);
    g.lineTo(W * 0.73, Hh * 0.46 + r);
    g.stroke();
    g.shadowBlur = 0;
  }
  H.ggPage("notes", "reels", {
    render(body) {
      const reels = itemsOfType("tape");
      reels.sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
      const cols = H.el("div", "gg-cols", body);
      const left = H.el("div", "gg-col-l", cols);
      const right = H.el("div", "gg-col-r", cols);
      const self = this;
      self.type = null;
      H.ggList(
        left,
        reels.map((n) => ({ label: titleOf(n), mark: "&#9673;" })),
        "notes/reels",
        {
          empty: "No tape reels.",
          onSelect(i) {
            const d = reels[i].def || {};
            right.innerHTML =
              '<div class="gg-reel"><canvas width="180" height="92"></canvas><div><div class="gg-dtitle">' +
              H.esc(H.up(titleOf(reels[i]))) +
              "</div>" +
              '<div class="gg-hint-sm">' +
              H.esc(H.up(d.speaker || d.author || "Audio reel")) +
              (d.date ? " &middot; " + H.esc(d.date) : "") +
              ' &middot; TRANSCRIPT</div></div></div><div class="gg-rule"></div><div class="gg-notebody"></div>';
            self.type = {
              el: right.querySelector(".gg-notebody"),
              cv: right.querySelector("canvas"),
              text: String(textOf(d)),
              i: 0,
              t: 0,
            };
            H.sfx("ui_type", { volume: 0.5 });
            G.events.emit("noteRead", reels[i].id);
            if (d.lock || d.code) H.call("locks", "learn", [d.lock || d.code]);
          },
        },
      );
      if (!reels.length)
        right.innerHTML =
          '<div class="gg-empty">' +
          H.glyph("tape") +
          " AUDIO REELS YOU FIND CAN BE PLAYED BACK HERE.</div>";
    },
    update(dt) {
      const t = this.type;
      if (!t || !t.el || !t.el.isConnected) return;
      t.t += dt;
      const playing = t.i < t.text.length;
      if (playing) {
        t.i = Math.min(t.text.length, t.i + Math.max(1, Math.round(dt * 55)));
        t.el.textContent = t.text.slice(0, t.i) + "█";
        if (t.i >= t.text.length) t.el.textContent = t.text;
      }
      drawReels(t.cv, t.t, playing);
    },
    onKey(code) {
      const t = this.type;
      if ((code === "Enter" || code === "Space") && t) {
        if (t.i < t.text.length) {
          t.i = t.text.length;
          t.el.textContent = t.text;
        } else {
          t.i = 0;
        }
        return true;
      }
      return false;
    },
    hints() {
      return [["Enter", "Skip / replay"]];
    },
  });
