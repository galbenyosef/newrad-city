// play-inline-6 01 — tags
// Lines 20-316 of readable/play-inline-6.pretty.js (statement-aligned).
  "use strict";
  const G = (window.G = window.G || {});

  const PRE_GAME_STATES = new Set(["title", "chargen", "dead"]);
  let el = null,
    badge = null,
    prevState = null;
  const S = { maxed: false, allFound: false, codes: false }; // per-game cheat flags (reset on new game)
  const TG = { ammo: false, carry: false }; // toggles (persist across new game / load, like god mode)

  const CSS = `
  #cheat-menu{position:fixed;inset:0;z-index:950;display:flex;align-items:center;justify-content:center;
    background:rgba(2,8,14,.74);font-family:'Share Tech Mono','Courier New',monospace;text-transform:uppercase;letter-spacing:1px;color:#cfeefa;
    text-shadow:0 0 6px rgba(150,220,240,.55)}
  #cheat-menu .cm-box{min-width:420px;border:2px solid #cfeefa;background:rgba(4,14,22,.92);padding:22px 28px 18px;
    box-shadow:0 0 24px rgba(150,220,240,.25), inset 0 0 40px rgba(150,220,240,.08)}
  #cheat-menu h2{margin:0 0 4px;font-size:34px;letter-spacing:4px;font-weight:normal}
  #cheat-menu .cm-sub{font-size:18px;opacity:.7;margin-bottom:16px}
  #cheat-menu button{display:flex;justify-content:space-between;width:100%;margin:6px 0;padding:8px 12px;cursor:pointer;
    font:inherit;font-size:24px;color:#cfeefa;background:transparent;border:1px solid rgba(150,220,240,.35);text-align:left;
    text-shadow:inherit}
  #cheat-menu button:hover,#cheat-menu button:focus{background:#cfeefa;color:#041019;text-shadow:none;outline:none}
  #cheat-menu .on{color:#fff}
  #cheat-menu .cm-foot{margin-top:14px;font-size:17px;opacity:.65}
  #cheat-menu .cm-wrap{display:flex;gap:18px;align-items:flex-start;justify-content:center;flex-wrap:wrap;max-height:94vh;overflow:auto}
  #cheat-menu .cm-world{min-width:330px}
  #cheat-menu .cm-sec{margin:12px 0 4px;font-size:19px;opacity:.8;letter-spacing:2px}
  #cheat-menu .cm-now{font-size:21px;margin-bottom:6px}
  #cheat-menu .cm-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
  #cheat-menu .cm-grid button{margin:0;font-size:20px;padding:6px 10px}
  #cheat-menu button.sel{background:rgba(150,220,240,.22)}
  #cheat-menu .cm-all{margin-top:14px;border-color:#cfeefa;font-size:26px}
  #cheat-menu .cm-contact{margin-top:12px;padding-top:10px;border-top:1px solid rgba(150,220,240,.3);font-size:18px;display:flex;flex-wrap:wrap;gap:4px 14px}
  #cheat-menu .cm-contact span{width:100%;opacity:.7;letter-spacing:2px}
  #cheat-menu .cm-contact a{color:#cfeefa;text-decoration:underline;text-underline-offset:3px}
  #cheat-menu .cm-contact a:hover{color:#fff}
  #cheat-badge{position:fixed;top:10px;right:14px;z-index:940;pointer-events:none;font:16px 'Share Tech Mono','Courier New',monospace;
    color:#ffb347;text-shadow:0 0 6px rgba(255,179,71,.6);letter-spacing:2px}`;

  function injectCss() {
    if (document.getElementById("cheat-css")) return;
    const s = document.createElement("style");
    s.id = "cheat-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function inGame() {
    return !!G._gameStarted && !PRE_GAME_STATES.has(prevState);
  }

  function render() {
    if (!el) return;
    const P = G.player;
    const skipLabel = inGame()
      ? "Leave Cryo Unit C-9 (teleport outside)"
      : "Skip Intro &amp; Leave Cryo Unit C-9";
    const pre = inGame() ? "" : " <small>(starts game)</small>";
    el.innerHTML = `<div class="cm-wrap"><div class="cm-box">
      <h2>[ CHEATS ]</h2><div class="cm-sub">C-9 MAINTENANCE OVERRIDE</div>
      <button data-a="noclip"><span>[1] No Clip</span><span class="${P.noclip ? "on" : ""}">${P.noclip ? "ON" : "OFF"}</span></button>
      <button data-a="god"><span>[2] God Mode</span><span class="${P.godMode ? "on" : ""}">${P.godMode ? "ON" : "OFF"}</span></button>
      <button data-a="skip"><span>[3] ${skipLabel}</span><span>&gt;</span></button>
      <button data-a="maxlevel"><span>[4] Max Level, Attributes, Skills &amp; Talents${pre}</span><span class="${S.maxed ? "on" : ""}">${S.maxed ? "DONE" : "&gt;"}</span></button>
      <button data-a="discover"><span>[5] Discover All Locations${pre}</span><span class="${S.allFound ? "on" : ""}">${S.allFound ? "DONE" : "&gt;"}</span></button>
      <button data-a="codes"><span>[7] Reveal All Codes &amp; Keys${pre}</span><span class="${S.codes ? "on" : ""}">${S.codes ? "DONE" : "&gt;"}</span></button>
      <button data-a="ammo"><span>[9] Unlimited Ammo</span><span class="${TG.ammo ? "on" : ""}">${TG.ammo ? "ON" : "OFF"}</span></button>
      <button data-a="carry"><span>[0] Unlimited Carry Weight</span><span class="${TG.carry ? "on" : ""}">${TG.carry ? "ON" : "OFF"}</span></button>
      <button data-a="weapons"><span>[W] Add All Weapons (+ ammo)${pre}</span><span class="${S.armed ? "on" : ""}">${S.armed ? "DONE" : "&gt;"}</span></button>
      <button data-a="bug"><span>[B] Report a Bug (with screenshot)</span><span>&gt;</span></button>
      <button data-a="all" class="cm-all"><span>[6] ENABLE ALL CHEATS${pre}</span><span>&gt;&gt;</span></button>
      <div class="cm-foot">No Clip: WASD + mouse · Space up · C down · Shift fast<br>[P] / [Esc] close</div>
      <div class="cm-contact"><span>CONTACT THE DEVELOPER</span>
        <a href="mailto:its@chrisfirst.com">its@chrisfirst.com</a>
        <a href="https://x.com/chrisfirst" target="_blank" rel="noopener">X @chrisfirst</a>
        <a href="https://www.instagram.com/chrisfirstt/" target="_blank" rel="noopener">Instagram @chrisfirstt</a></div></div>
      ${worldPanel()}</div>`;
    el.querySelectorAll("button").forEach((b) => {
      b.onclick = () => act(b.dataset.a);
      b.onmouseenter = () => G.sfx.play("ui_hover");
    });
  }

  // ---------------- WORLD panel: time of day & weather ----------------
  const TIMES = [
    ["Dawn", 6],
    ["Morning", 9],
    ["Noon", 12],
    ["Afternoon", 15.5],
    ["Dusk", 19],
    ["Night", 22],
    ["Midnight", 0],
    ["Late Night", 3],
  ];
  const WEATHERS = [
    ["clear", "Clear"],
    ["overcast", "Overcast"],
    ["fog", "Fog"],
    ["rain", "Rain"],
    ["dust", "Dust Storm"],
    ["thunderstorm", "Thunderstorm"],
  ];
  const W = { frozen: false, fast: false, held: false, mps: null };
  function fmtHour(h) {
    h = ((h % 24) + 24) % 24;
    const hh = Math.floor(h),
      mm = Math.floor((h - hh) * 60);
    return (
      (hh % 12 || 12) +
      ":" +
      String(mm).padStart(2, "0") +
      (hh < 12 ? " AM" : " PM")
    );
  }
  function worldPanel() {
    const atm = !G.isStub("atmos"),
      wx = atm && G.atmos.getWeather ? G.atmos.getWeather() : "?";
    const hour = G.time.hour;
    return `<div class="cm-box cm-world"><h2>[ WORLD ]</h2><div class="cm-sub">TIME &amp; WEATHER CONTROL</div>
      <div class="cm-now">Time: ${fmtHour(hour)} · Day ${G.time.day || 1}<br>Weather: ${wx}${W.held ? " (held)" : " (auto)"}</div>
      <div class="cm-sec">TIME OF DAY</div>
      <div class="cm-grid">${TIMES.map(([n, h]) => `<button data-a="hour:${h}" class="${Math.abs(((hour - h + 36) % 24) - 12) > 11.4 ? "sel" : ""}"><span>${n}</span><span>${fmtHour(h).replace(":00", "")}</span></button>`).join("")}</div>
      <div class="cm-grid" style="margin-top:6px">
        <button data-a="hourstep:-1"><span>[ [ ] −1 hour</span></button><button data-a="hourstep:1"><span>[ ] ] +1 hour</span></button>
        <button data-a="freeze"><span>[T] Freeze Time</span><span class="${W.frozen ? "on" : ""}">${W.frozen ? "ON" : "OFF"}</span></button>
        <button data-a="fasttime"><span>Fast Time ×20</span><span class="${W.fast ? "on" : ""}">${W.fast ? "ON" : "OFF"}</span></button>
      </div>
      <div class="cm-sec">WEATHER</div>
      <div class="cm-grid">${WEATHERS.map(([id, n]) => `<button data-a="weather:${id}" class="${wx === id ? "sel" : ""}"><span>${n}</span></button>`).join("")}
        <button data-a="weather:auto" class="${W.held ? "" : "sel"}"><span>Auto (natural)</span></button></div>
      ${atm ? "" : '<div class="cm-foot">Atmosphere module not loaded.</div>'}</div>`;
  }
  function setTimeSpeed() {
    if (W.mps === null)
      W.mps =
        G.time.minutesPerSecond !== undefined ? G.time.minutesPerSecond : 0.5;
    G.time.minutesPerSecond = W.frozen ? 0 : W.fast ? W.mps * 20 : W.mps;
  }
  function worldAct(a) {
    const [k, v] = a.split(":");
    const atm = !G.isStub("atmos");
    if (k === "hour" || k === "hourstep") {
      const h = k === "hour" ? Number(v) : G.time.hour + Number(v);
      if (atm && G.atmos.setHour)
        G.atmos.setHour(h, { advanceDay: k === "hourstep" && Number(v) > 0 });
      else G.time.hour = ((h % 24) + 24) % 24;
      G.notify("Cheat: time set to " + fmtHour(G.time.hour) + ".");
    } else if (k === "freeze") {
      W.frozen = !W.frozen;
      if (W.frozen) W.fast = false;
      setTimeSpeed();
      G.notify("Time " + (W.frozen ? "frozen." : "running."));
    } else if (k === "fasttime") {
      W.fast = !W.fast;
      if (W.fast) W.frozen = false;
      setTimeSpeed();
      G.notify("Fast time " + (W.fast ? "on." : "off."));
    } else if (k === "weather") {
      if (!atm || !G.atmos.setWeather) return;
      if (v === "auto") {
        W.held = false;
        G.atmos.setWeather(G.atmos.getWeather(), { auto: true, silent: true });
        G.notify("Weather: natural cycle.");
      } else {
        W.held = true;
        G.atmos.setWeather(v, {
          instant: true,
          auto: false,
          silent: true,
          hold: 1e9,
        });
        G.notify("Cheat: weather set to " + v + ".");
      }
    }
    render();
    updateBadge();
  }

  function updateBadge() {
    const P = G.player,
      tags = [];
    if (P.noclip) tags.push("NOCLIP");
    if (P.godMode) tags.push("GOD");
    if (W.frozen) tags.push("TIME FROZEN");
    if (W.fast) tags.push("FAST TIME");
    if (W.held && !G.isStub("atmos"))
      tags.push("WX " + String(G.atmos.getWeather()).toUpperCase());
    if (TG.ammo) tags.push("AMMO");
    if (TG.carry) tags.push("CARRY");
    if (S.codes) tags.push("CODES");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "cheat-badge";
      document.body.appendChild(badge);
    }
    badge.textContent = tags.join(" · ");
    badge.style.display = tags.length && G.state !== "title" ? "block" : "none";
  }

  function open() {
    if (el || G.state === "loading" || G.state === "cheats") return;
    injectCss();
    prevState = G.state;
    if (G.bugReport) G.bugReport.prime(); // screenshot of the game as it was when P was pressed
    el = document.createElement("div");
    el.id = "cheat-menu";
    document.body.appendChild(el);
    render();
    G.sfx.play("goggles_open");
    G.setState("cheats", { from: prevState });
  }

  function close(nextState) {
    if (!el) return;
    el.remove();
    el = null;
    G.sfx.play("goggles_close");
    // Menus (goggles, dialogue, pause…) hide themselves when we open, so resume gameplay
    // rather than re-entering them; pre-game screens (title/chargen/dead) are restored as-is.
    const back = PRE_GAME_STATES.has(prevState) ? prevState : "play";
    G.setState(nextState || back);
    updateBadge();
  }

  function act(a) {
    const P = G.player;
    G.sfx.play("ui_select");
    if (a.indexOf(":") > 0 || a === "freeze" || a === "fasttime") {
      worldAct(a);
      return;
    }
    if (a === "bug") {
      if (G.bugReport) G.bugReport.openFromCheats();
      return;
    }
    if (a === "noclip") {
      P.noclip = !P.noclip;
      P.fly = P.noclip;
      if (!P.noclip) {
        // drop back onto the ground below
        P.pos.y = G.world.groundHeight(P.pos.x, P.pos.z, P.pos.y + 1, P.radius);
        P.vel.set(0, 0, 0);
      }
      G.notify("No Clip " + (P.noclip ? "enabled." : "disabled."));
      render();
      updateBadge();
    } else if (a === "god") {
      P.godMode = !P.godMode;
      if (P.godMode) {
        P.hp = P.maxHp;
        P.rads = 0;
      }
      G.notify("God Mode " + (P.godMode ? "enabled." : "disabled."));
      render();
      updateBadge();
    } else if (a === "skip") {
      skipToOutside();
    } else if (a === "ammo" || a === "carry") {
      setToggle(a, !TG[a]);
      render();
      updateBadge();
    } else if (
      a === "maxlevel" ||
      a === "discover" ||
      a === "all" ||
      a === "weapons" ||
      a === "codes"
    ) {
      if (!inGame()) {
        skipToOutside();
      } // unlocks need a running game
      if (a === "all") {
        if (!P.godMode) {
          P.godMode = true;
          P.hp = P.maxHp;
          P.rads = 0;
        }
        if (!P.noclip) {
          P.noclip = true;
          P.fly = true;
        }
        for (const k of Object.keys(TG)) if (!TG[k]) setToggle(k, true, true);
      }
      if (a === "maxlevel" || a === "all") maxEverything();
      if (a === "discover" || a === "all") discoverAll();
      if (a === "codes" || a === "all") revealCodesAndKeys();
      if (a === "weapons" || a === "all") addAllWeapons();
      if (a === "all") G.notify("Cheat: ALL cheats enabled.");
      if (el) {
        render();
      }
      updateBadge();
    }
  }

  /** Level cap, every attribute 10, every skill 100, every talent at full rank (choice talents rotate
   *  through attributes/skills) — everything applied automatically, nothing left to spend. */
