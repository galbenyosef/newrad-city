/* src/ui_hud/42_wait.js */
/* =====================================================================
 * NEW RAD CITY — UI_HUD : WAIT SCREEN (T)
 * A small goggles readout: an analog clock, the date/time and a 1–24 hour
 * slider. Enter/Wait passes the hours one at a time (the clock hands
 * visibly sweep, the world's time-of-day follows via G.atmos.advanceHours),
 * Esc cancels / stops early.
 *
 * Uses state 'paused' with data {wait:true} (world frozen, cursor free);
 * 40_menus.js leaves the pause menu closed for that case.
 * Refused while enemies are nearby / in combat, or while the player is dead.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const H = G.hud._;

  const WT = { open: false, hours: 1, busy: false, done: 0, acc: 0, el: null };
  H.WAIT = WT;
  H.waitOpen = () => WT.open;

  const HOUR_STEP = 0.16; // real seconds per waited hour (the sweep animation)

  function build() {
    const el = H.el("div", "menu-screen menu-wait", H.uiRoot);
    el.innerHTML =
      '<div class="menu-pause-bg light"></div>' +
      '<div class="menu-crt wait-box"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>' +
      '<div class="menu-crt-in">' +
      '<div class="wait-title">[ WAIT ]</div>' +
      '<div class="wait-row"><div class="wait-clock"></div>' +
      '<div class="wait-info"><div class="wait-date"></div><div class="wait-time"></div><div class="wait-place"></div></div></div>' +
      '<div class="wait-q"></div>' +
      '<div class="wait-slider"><span class="wait-arrow l">&#9664;</span><div class="wait-track"><i></i><b></b></div><span class="wait-arrow r">&#9654;</span></div>' +
      '<div class="wait-btns"><span class="wait-btn go">WAIT</span><span class="wait-btn no">CANCEL</span></div>' +
      '<div class="wait-foot"><b>&#9664; &#9654;</b> HOURS &nbsp; <b>ENTER</b> WAIT &nbsp; <b>ESC</b> CANCEL</div>' +
      '</div><div class="menu-crt-fx"></div></div>';
    el.style.display = "none";
    WT.el = el;
    WT.clock = el.querySelector(".wait-clock");
    WT.date = el.querySelector(".wait-date");
    WT.time = el.querySelector(".wait-time");
    WT.place = el.querySelector(".wait-place");
    WT.q = el.querySelector(".wait-q");
    WT.fill = el.querySelector(".wait-track i");
    WT.knob = el.querySelector(".wait-track b");
    WT.track = el.querySelector(".wait-track");
    el.querySelector(".wait-arrow.l").addEventListener("click", () =>
      adjust(-1),
    );
    el.querySelector(".wait-arrow.r").addEventListener("click", () =>
      adjust(1),
    );
    el.querySelector(".wait-btn.go").addEventListener("click", () => start());
    el.querySelector(".wait-btn.no").addEventListener("click", () => cancel());
    WT.track.addEventListener("mousedown", (e) => {
      const r = WT.track.getBoundingClientRect();
      setHours(
        Math.round(1 + H.clamp((e.clientX - r.left) / r.width, 0, 1) * 23),
      );
    });
    el.addEventListener(
      "wheel",
      (e) => {
        adjust(e.deltaY > 0 ? -1 : 1);
        e.preventDefault();
      },
      { passive: false },
    );
  }

  /** Analog clock face (SVG) for a fractional hour. */
  function clockSVG(hour) {
    const h12 = hour % 12,
      mm = (hour % 1) * 60;
    const ha = (h12 / 12) * 360 + (mm / 60) * 30,
      ma = (mm / 60) * 360;
    let ticks = "";
    for (let i = 0; i < 60; i++) {
      const big = i % 5 === 0,
        a = (i * 6 * Math.PI) / 180;
      const r0 = big ? 38 : 42,
        r1 = 46;
      ticks +=
        '<line x1="' +
        (50 + Math.sin(a) * r0).toFixed(1) +
        '" y1="' +
        (50 - Math.cos(a) * r0).toFixed(1) +
        '" x2="' +
        (50 + Math.sin(a) * r1).toFixed(1) +
        '" y2="' +
        (50 - Math.cos(a) * r1).toFixed(1) +
        '" stroke-width="' +
        (big ? 2.2 : 0.8) +
        '"/>';
    }
    let nums = "";
    for (let i = 1; i <= 12; i++) {
      const a = (i * 30 * Math.PI) / 180;
      nums +=
        '<text x="' +
        (50 + Math.sin(a) * 30).toFixed(1) +
        '" y="' +
        (50 - Math.cos(a) * 30 + 3.4).toFixed(1) +
        '">' +
        i +
        "</text>";
    }
    return (
      '<svg viewBox="0 0 100 100"><g stroke="currentColor" fill="none"><circle cx="50" cy="50" r="48" stroke-width="2"/>' +
      ticks +
      "</g>" +
      '<g fill="currentColor" font-size="9.5" text-anchor="middle" font-family="Share Tech Mono, monospace">' +
      nums +
      "</g>" +
      '<g stroke="currentColor" stroke-linecap="round"><line x1="50" y1="50" x2="50" y2="27" stroke-width="3.4" transform="rotate(' +
      ha.toFixed(1) +
      ' 50 50)"/>' +
      '<line x1="50" y1="50" x2="50" y2="14" stroke-width="1.8" transform="rotate(' +
      ma.toFixed(1) +
      ' 50 50)"/></g>' +
      '<circle cx="50" cy="50" r="3" fill="currentColor"/></svg>'
    );
  }

  function render() {
    const hr = (G.time && G.time.hour) || 0;
    WT.clock.innerHTML = clockSVG(hr);
    H.setText(WT.date, H.gameDate());
    H.setText(WT.time, H.gameClock());
    H.setText(WT.place, H.up(H.placeName()));
    const left = WT.busy ? WT.hours - WT.done : WT.hours;
    H.setText(
      WT.q,
      WT.busy
        ? "WAITING... " + left + (left === 1 ? " HOUR" : " HOURS") + " LEFT"
        : "WAIT FOR " + WT.hours + (WT.hours === 1 ? " HOUR" : " HOURS") + "?",
    );
    const f = (WT.hours - 1) / 23;
    WT.fill.style.width = (f * 100).toFixed(1) + "%";
    WT.knob.style.left = (f * 100).toFixed(1) + "%";
    WT.el.classList.toggle("busy", WT.busy);
  }
  function setHours(n) {
    n = H.clamp(n | 0, 1, 24);
    if (n !== WT.hours) {
      WT.hours = n;
      H.sfx("ui_hover", { volume: 0.35 });
    }
    render();
  }
  function adjust(d) {
    if (!WT.busy) setHours(WT.hours + d);
  }

  /** Why the player can't wait right now (or null). */
  function blocked() {
    if (!G.player.alive) return "You cannot wait now.";
    if (H.combatActive()) return "You cannot wait while enemies are nearby.";
    // hostile, alerted actor close by
    const list = H.call("actors", "list", [], []) || [];
    const P = G.player.pos;
    for (const a of list) {
      if (!a || a.dead || !a.pos || a.inScene === false) continue;
      let hostile = false;
      try {
        hostile = typeof a.hostile === "function" ? a.hostile() : !!a.hostile;
      } catch (e) {
        hostile = false;
      }
      if (!hostile) continue;
      const d = Math.hypot(a.pos.x - P.x, a.pos.z - P.z);
      if (
        d < 25 ||
        (d < 60 &&
          (a.inCombat || /combat|search|alert/.test(String(a.state || ""))))
      )
        return "You cannot wait while enemies are nearby.";
    }
    return null;
  }

  function open() {
    const why = blocked();
    if (why) {
      H.sfx("ui_error");
      G.notify(why);
      return false;
    }
    WT.open = true;
    WT.busy = false;
    WT.finishing = false;
    WT.done = 0;
    WT.acc = 0;
    G.setState("paused", { wait: true });
    WT.el.style.display = "";
    WT.el.classList.remove("in");
    void WT.el.offsetWidth;
    WT.el.classList.add("in");
    H.sfx("goggles_open", { volume: 0.5 });
    render();
    return true;
  }
  WT.hide = function () {
    hide();
  };
  function hide() {
    WT.open = false;
    WT.busy = false;
    WT.finishing = false;
    if (WT.el) WT.el.style.display = "none";
  }
  function close() {
    hide();
    if (G.state === "paused") G.setState("play");
  }
  function cancel() {
    if (WT.busy) {
      WT.busy = false;
      H.sfx("ui_back", { volume: 0.6 });
      finish();
      return;
    }
    H.sfx("ui_back", { volume: 0.6 });
    close();
  }
  function start() {
    if (WT.busy || WT.finishing) return;
    WT.busy = true;
    WT.done = 0;
    WT.acc = 0;
    H.sfx("ui_select", { volume: 0.7 });
    render();
  }
  function passHour() {
    if (!G.isStub("atmos") && G.atmos && G.atmos.advanceHours)
      G.atmos.advanceHours(1);
    else if (G.time) {
      G.time.hour += 1;
      if (G.time.hour >= 24) {
        G.time.hour -= 24;
        G.time.day = (G.time.day || 1) + 1;
      }
    }
    WT.done++;
    H.sfx("ui_click", { volume: 0.25 });
  }
  function finish() {
    const n = WT.done;
    close();
    if (n > 0) G.notify("You waited " + n + (n === 1 ? " hour." : " hours."));
    if (n > 0 && H.requestAutosave) H.requestAutosave("wait", 1.0);
  }

  function onKey(code) {
    if (!WT.open || G.state !== "paused") return;
    const I = G.input;
    if (WT.finishing) {
      I.consume(code);
      return;
    }
    if (WT.busy) {
      if (code === "Escape" || code === "KeyT" || code === "Enter") cancel();
      I.consume(code);
      return;
    }
    switch (code) {
      case "KeyA":
      case "ArrowLeft":
        adjust(-1);
        break;
      case "KeyD":
      case "ArrowRight":
        adjust(1);
        break;
      case "KeyW":
      case "ArrowUp":
        adjust(6);
        break;
      case "KeyS":
      case "ArrowDown":
        adjust(-6);
        break;
      case "Enter":
      case "KeyE":
      case "Space":
        start();
        break;
      case "Escape":
      case "Backspace":
      case "KeyT":
      case "Tab":
        cancel();
        break;
      default:
        return;
    }
    I.consume(code);
  }

  H.part({
    name: "wait",
    order: 55,
    init() {
      build();
      G.events.on("keydown", onKey);
      G.events.on("state", (s) => {
        if (WT.open && s !== "paused") hide();
      });
      G.events.on("reset", () => {
        if (WT.open) hide();
      });
    },
    update(dt, realDt) {
      if (
        G.SHOT &&
        G.QS &&
        G.QS.get("waitDemo") &&
        !WT.demo &&
        G.state === "play"
      ) {
        WT.demo = true;
        WT.hours = 8;
        open();
      }
      // open with T from normal play
      if (
        G.state === "play" &&
        H.prevState === "play" &&
        !G.SMOKE &&
        G.input.justPressed("KeyT")
      ) {
        G.input.consume("KeyT");
        open();
      }
      if (!WT.open) return;
      if (WT.busy) {
        WT.acc += realDt;
        while (WT.acc >= HOUR_STEP && WT.done < WT.hours) {
          WT.acc -= HOUR_STEP;
          passHour();
        }
        render();
        if (WT.done >= WT.hours) {
          WT.busy = false;
          WT.finishing = true;
          setTimeout(() => {
            if (WT.open && WT.finishing) finish();
          }, 350);
        }
      } else if (!WT.finishing) {
        WT.tick = (WT.tick || 0) - realDt;
        if (WT.tick <= 0) {
          WT.tick = 1;
          render();
        }
      }
    },
  });

  G.hud.openWait = open;
})();
