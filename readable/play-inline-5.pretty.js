/* src/core/bugreport.js */
/* =====================================================================
 * NEW RAD CITY — BUG REPORTER (cheat menu "Report a Bug", or F8 any time)
 * Owned by: CORE.
 * Sends a report (title, description, category, optional contact, auto diagnostics, screenshot of the
 * frame you were looking at) to the website's Netlify form 'bug-report' (no player file uploads)
 * (static twin of the form: site/bugform.html, written by tools/deploy.py). Offline (file://) it offers
 * "Copy report" instead.
 * API: G.bugReport.open({from}), G.bugReport.prime() (grab the current frame now; the cheat menu calls it on open).
 * State while open: 'cheats' (world paused, cursor free). Esc / Cancel closes.
 * ===================================================================== */
(function () {
  "use strict";
  const G = (window.G = window.G || {});

  const PRE_GAME_STATES = new Set(["title", "chargen", "dead"]);
  const CATEGORIES = [
    "Graphics",
    "Gameplay",
    "Quest",
    "Map / stuck",
    "Performance",
    "Crash / error",
    "Other",
  ];
  const COOLDOWN_MS = 30000;
  let el = null,
    prevState = null,
    shot = null,
    shotUrl = null,
    primed = null,
    lastSent = 0;

  const CSS = `
  #bug-report{position:fixed;inset:0;z-index:960;display:flex;align-items:center;justify-content:center;
    background:rgba(2,6,10,.78);font-family:'VT323','Share Tech Mono','Courier New',monospace;color:#cfeefa;
    text-shadow:0 0 6px rgba(150,220,240,.55)}
  #bug-report .br-box{width:min(760px,94vw);max-height:94vh;overflow:auto;border:2px solid #cfeefa;background:rgba(4,12,18,.95);
    padding:20px 26px 16px;box-shadow:0 0 24px rgba(150,220,240,.25), inset 0 0 40px rgba(150,220,240,.08)}
  #bug-report h2{margin:0 0 2px;font-size:32px;letter-spacing:4px;font-weight:normal}
  #bug-report .br-sub{font-size:18px;opacity:.7;margin-bottom:12px}
  #bug-report label{display:block;font-size:19px;margin:10px 0 4px;letter-spacing:1px}
  #bug-report input[type=text],#bug-report textarea,#bug-report select{width:100%;box-sizing:border-box;font:inherit;font-size:21px;
    color:#cfeefa;background:rgba(0,0,0,.45);border:1px solid rgba(150,220,240,.45);padding:6px 9px;text-shadow:inherit;outline:none}
  #bug-report input[type=text]:focus,#bug-report textarea:focus,#bug-report select:focus{border-color:#cfeefa;box-shadow:0 0 8px rgba(150,220,240,.4)}
  #bug-report textarea{height:120px;resize:vertical}
  #bug-report select option{background:#04121a}
  #bug-report .br-row{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}
  #bug-report .br-row > div{flex:1 1 240px}
  #bug-report .br-shot{display:flex;gap:12px;align-items:center;margin-top:6px;font-size:19px}
  #bug-report .br-shot img{width:220px;max-height:124px;object-fit:cover;border:1px solid rgba(150,220,240,.5)}
  #bug-report .br-shot .none{opacity:.6}
  #bug-report input[type=checkbox]{accent-color:#cfeefa;width:18px;height:18px;vertical-align:middle}
  #bug-report details{margin-top:10px;font-size:17px}
  #bug-report summary{cursor:pointer;font-size:19px}
  #bug-report pre{white-space:pre-wrap;font:15px/1.3 'Courier New',monospace;opacity:.85;max-height:170px;overflow:auto;
    background:rgba(0,0,0,.35);padding:8px;margin:6px 0 0}
  #bug-report .br-btns{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
  #bug-report button{padding:7px 16px;cursor:pointer;font:inherit;font-size:23px;color:#cfeefa;background:transparent;
    border:1px solid rgba(150,220,240,.5);text-shadow:inherit}
  #bug-report button:hover,#bug-report button:focus{background:#cfeefa;color:#04121a;text-shadow:none;outline:none}
  #bug-report button[disabled]{opacity:.45;cursor:default;background:transparent;color:#cfeefa}
  #bug-report .br-msg{margin-top:10px;font-size:20px;min-height:24px}
  #bug-report .br-msg.err{color:#ff6a4d;text-shadow:0 0 6px rgba(255,106,77,.5)}
  #bug-report .br-msg.ok{color:#fff}
  #bug-report .br-hp{position:absolute;left:-9999px}`;

  function injectCss() {
    if (document.getElementById("bug-css")) return;
    const s = document.createElement("style");
    s.id = "bug-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }
  const esc = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  const online = () => /^https?:$/.test(location.protocol);

  /** Grab the frame on screen right now (before any overlay opens); open() uses it. */
  function prime() {
    if (!G.captureFrame || !G.renderer) {
      primed = Promise.resolve(null);
      return primed;
    }
    primed = G.captureFrame(1600).catch(() => null);
    return primed;
  }

  // ---------------- diagnostics ----------------
  function where() {
    const P = G.player,
      L = G.LAYOUT || {};
    if (!P || !P.pos) return "unknown";
    const x = P.pos.x,
      z = P.pos.z;
    let best = null,
      bd = Infinity;
    if (x >= 2500 && L.INTERIORS) {
      for (const id of Object.keys(L.INTERIORS)) {
        const c = L.INTERIORS[id],
          o = c && c.origin;
        if (!o) continue;
        const d = Math.hypot(x - o.x, z - o.z);
        if (d < bd) {
          bd = d;
          best = "Interior: " + (c.name || id) + " [" + id + "]";
        }
      }
    } else if (L.LOCATIONS) {
      for (const l of L.LOCATIONS) {
        const d = Math.hypot(x - l.x, z - l.z);
        if (d < bd) {
          bd = d;
          best = "Near " + l.name + " [" + l.id + "] (" + Math.round(d) + " m)";
        }
      }
    }
    return best || "unknown";
  }
  function gpu() {
    try {
      const gl = G.renderer.getContext(),
        ext = gl.getExtension("WEBGL_debug_renderer_info");
      return ext
        ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);
    } catch (e) {
      return "unknown";
    }
  }
  function diagnostics() {
    const P = G.player || {},
      out = [];
    const safe = (label, fn) => {
      try {
        const v = fn();
        if (v !== undefined && v !== null && v !== "")
          out.push(label + ": " + v);
      } catch (e) {
        /* ignore */
      }
    };
    const B = window.G_BUILD || {};
    safe(
      "Build",
      () =>
        (B.hash || "dev") +
        (B.time ? " (" + B.time + ")" : "") +
        " v" +
        (G.VERSION || "?"),
    );
    safe("Page", () => location.href.split("?")[0]);
    safe("State", () => prevState || G.state);
    safe("Location", where);
    safe(
      "Position",
      () =>
        P.pos &&
        "x " +
          P.pos.x.toFixed(1) +
          ", y " +
          P.pos.y.toFixed(1) +
          ", z " +
          P.pos.z.toFixed(1) +
          ", yaw " +
          (P.yaw || 0).toFixed(2),
    );
    safe(
      "Time / weather",
      () =>
        (G.time
          ? "day " + (G.time.day || 1) + " " + G.time.hour.toFixed(2) + "h"
          : "") +
        (G.atmos && !G.isStub("atmos") && G.atmos.getWeather
          ? ", " + G.atmos.getWeather()
          : ""),
    );
    safe("Level", () =>
      !G.isStub("rpg") && G.rpg._state ? G.rpg._state().level : undefined,
    );
    safe("HP", () =>
      P.hp !== undefined
        ? Math.round(P.hp) + "/" + Math.round(P.maxHp)
        : undefined,
    );
    safe("Tracked quest", () => {
      if (G.isStub("quests") || !G.quests.tracked) return undefined;
      const q = G.quests.tracked();
      if (!q) return "none";
      const id = q.id || q;
      return id + " @ " + (G.quests.stage ? G.quests.stage(id) : "?");
    });
    safe("Active quests", () =>
      !G.isStub("quests") && G.quests.list
        ? G.quests
            .list()
            .filter((q) => q && (q.active || q.status === "active"))
            .map((q) => q.id)
            .join(", ")
        : undefined,
    );
    safe("Cheats", () => {
      const b = document.getElementById("cheat-badge");
      return b && b.style.display !== "none" ? b.textContent : "none";
    });
    safe("FPS", () =>
      G.stats
        ? G.stats.fps.toFixed(0) +
          " (" +
          G.stats.frameMs.toFixed(1) +
          " ms cpu)"
        : undefined,
    );
    safe("Render", () =>
      G.atmos && G.atmos.perfStats
        ? JSON.stringify(G.atmos.perfStats())
        : undefined,
    );
    safe("GPU", gpu);
    safe("Browser", () => navigator.userAgent);
    safe(
      "Screen",
      () =>
        innerWidth + "x" + innerHeight + " @" + (devicePixelRatio || 1) + "x",
    );
    const errs = (G.errors || []).slice(-20),
      warns = (G.warnings || []).slice(-10);
    out.push(
      "Errors (" +
        (G.errors || []).length +
        "):" +
        (errs.length ? "\n  " + errs.join("\n  ") : " none"),
    );
    out.push(
      "Warnings (" +
        (G.warnings || []).length +
        "):" +
        (warns.length ? "\n  " + warns.join("\n  ") : " none"),
    );
    return out.join("\n");
  }

  // ---------------- UI ----------------
  function open(opts) {
    if (el) return;
    opts = opts || {};
    injectCss();
    prevState = opts.from || G.state;
    if (G.state !== "cheats") G.setState("cheats", { from: prevState }); // world paused, cursor free
    try {
      G.input.exitLock();
    } catch (e) {
      /* ignore */
    }
    const diag = diagnostics();
    el = document.createElement("div");
    el.id = "bug-report";
    el.innerHTML = `<form class="br-box" novalidate>
      <h2>&gt; REPORT A BUG_</h2><div class="br-sub">VIGIL FIELD REPORT · goes straight to the developer</div>
      <p class="br-hp"><label>Leave empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
      <label for="br-title">Short title *</label>
      <input type="text" id="br-title" name="title" maxlength="120" placeholder="e.g. Door at the Chrysler Building sends me into a wall">
      <label for="br-desc">What happened? What did you expect? *</label>
      <textarea id="br-desc" name="description" maxlength="4000" placeholder="Steps to make it happen again help a lot."></textarea>
      <div class="br-row">
        <div><label for="br-cat">Category</label>
          <select id="br-cat" name="category">${CATEGORIES.map((c) => `<option>${esc(c)}</option>`).join("")}</select></div>
        <div><label for="br-contact">Your name / contact (optional)</label>
          <input type="text" id="br-contact" name="contact" maxlength="120" placeholder="only if you'd like a reply"></div>
      </div>
      <label>Screenshot</label>
      <div class="br-shot"><span id="br-thumb"><span class="none">capturing…</span></span>
        <span><input type="checkbox" id="br-useshot" checked> <label for="br-useshot" style="display:inline">include this screenshot</label></span></div>
      <details><summary>Technical details sent with your report</summary><pre id="br-diag">${esc(diag)}</pre></details>
      <div class="br-btns">
        <button type="submit" id="br-send">${online() ? "SEND REPORT" : "COPY REPORT"}</button>
        <button type="button" id="br-cancel">CANCEL [Esc]</button>
      </div>
      <div class="br-msg" id="br-msg">${online() ? "" : "You are playing a local copy: bug reports send from the website version. COPY REPORT puts the text on your clipboard."}</div>
    </form>`;
    document.body.appendChild(el);
    // keep typing inside the form away from the game's key handlers (they listen on window, bubble phase)
    for (const t of ["keydown", "keyup", "keypress"])
      el.addEventListener(t, (e) => {
        if (t === "keydown" && (e.key === "Escape" || e.code === "Escape")) {
          e.preventDefault();
          close();
        }
        e.stopPropagation();
      });
    const $ = (id) => el.querySelector("#" + id);
    $("br-cancel").onclick = () => close();
    el.querySelector("form").onsubmit = (e) => {
      e.preventDefault();
      submit();
    };
    const shotP = primed || prime();
    primed = null;
    shotP.then((b) => {
      shot = b;
      if (!el) return;
      if (shotUrl) URL.revokeObjectURL(shotUrl);
      shotUrl = b ? URL.createObjectURL(b) : null;
      $("br-thumb").innerHTML = b
        ? `<img src="${shotUrl}" alt="screenshot">`
        : '<span class="none">(no screenshot available)</span>';
      if (!b) $("br-useshot").checked = false;
    });
    G.sfx && G.sfx.play && G.sfx.play("goggles_open");
    setTimeout(() => {
      const t = $("br-title");
      if (t) t.focus();
    }, 30);
  }

  function close() {
    if (!el) return;
    el.remove();
    el = null;
    if (shotUrl) {
      URL.revokeObjectURL(shotUrl);
      shotUrl = null;
    }
    shot = null;
    G.sfx && G.sfx.play && G.sfx.play("goggles_close");
    G.setState(PRE_GAME_STATES.has(prevState) ? prevState : "play");
  }

  function msg(text, cls) {
    if (!el) return;
    const m = el.querySelector("#br-msg");
    m.className = "br-msg" + (cls ? " " + cls : "");
    m.textContent = text;
  }

  async function submit() {
    if (!el) return;
    const $ = (id) => el.querySelector("#" + id);
    const title = $("br-title").value.trim(),
      desc = $("br-desc").value.trim();
    if (!title || !desc) {
      msg("Please fill in the title and what happened.", "err");
      ($("br-title").value.trim() ? $("br-desc") : $("br-title")).focus();
      return;
    }
    const diag = diagnostics();
    const text =
      "Title: " +
      title +
      "\nCategory: " +
      $("br-cat").value +
      "\nContact: " +
      ($("br-contact").value.trim() || "-") +
      "\n\n" +
      desc +
      "\n\n--- diagnostics ---\n" +
      diag;
    if (!online()) {
      try {
        await navigator.clipboard.writeText(text);
        msg("Report copied to your clipboard.", "ok");
      } catch (e) {
        $("br-diag").textContent = text;
        el.querySelector("details").open = true;
        msg(
          'Copy failed: select the text under "Technical details" and copy it by hand.',
          "err",
        );
      }
      return;
    }
    const wait = lastSent + COOLDOWN_MS - Date.now();
    if (wait > 0) {
      msg(
        "Please wait " +
          Math.ceil(wait / 1000) +
          " s before sending another report.",
        "err",
      );
      return;
    }
    const fd = new FormData();
    fd.append("form-name", "bug-report");
    fd.append("bot-field", el.querySelector("input[name=bot-field]").value);
    fd.append("title", title);
    fd.append("category", $("br-cat").value);
    fd.append("description", desc);
    fd.append("contact", $("br-contact").value.trim());
    fd.append("diagnostics", diag);
    if (shot && $("br-useshot").checked)
      fd.append("screenshot", shot, "screenshot.jpg");
    const btn = $("br-send");
    btn.disabled = true;
    btn.textContent = "SENDING…";
    msg("");
    try {
      const r = await fetch("/", { method: "POST", body: fd }); // no Content-Type header: the browser sets the multipart boundary
      if (!r.ok) throw new Error("HTTP " + r.status);
      lastSent = Date.now();
      if (!el) return;
      msg("Report sent. Thank you, survivor! Closing…", "ok");
      btn.textContent = "SENT";
      setTimeout(() => {
        if (el) close();
      }, 1800);
    } catch (e) {
      if (!el) return;
      btn.disabled = false;
      btn.textContent = "RETRY";
      msg(
        "Could not send (" +
          e.message +
          "). Check your connection and press RETRY.",
        "err",
      );
    }
  }

  // F8 from anywhere (except while typing somewhere or loading)
  window.addEventListener(
    "keydown",
    (e) => {
      if (el && (e.code === "Escape" || e.key === "Escape")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
        return;
      } // focus may have left the form
      if (e.code !== "F8" || e.repeat) return;
      if (
        e.target &&
        (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
      )
        return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (el) {
        close();
        return;
      }
      if (G.state === "loading" || G.state === undefined) return;
      if (G.state === "cheats" && G.cheatMenu) {
        openFromCheats();
        return;
      }
      prime();
      open();
    },
    true,
  );

  /** From the cheat menu: the frame was captured when P was pressed; the menu hands over its previous state. */
  function openFromCheats() {
    const from =
      G.cheatMenu && G.cheatMenu._prevState ? G.cheatMenu._prevState() : "play";
    if (G.cheatMenu && G.cheatMenu._detach) G.cheatMenu._detach();
    open({ from });
  }

  G.events.on("state", (s) => {
    if (s !== "cheats" && el) {
      el.remove();
      el = null;
    }
  });

  G.bugReport = { open, close, prime, openFromCheats, diagnostics };
})();
