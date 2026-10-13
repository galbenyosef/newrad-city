// play-inline-607 01 — math
// Lines 9-204 of readable/play-inline-607.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const H = G.hud._;
  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return (
      "rgba(" +
      ((n >> 16) & 255) +
      "," +
      ((n >> 8) & 255) +
      "," +
      (n & 255) +
      "," +
      a +
      ")"
    );
  }

  const DIAL0 = 7,
    DIAL1 = 93; // % of the dial width used by the 88–108 MHz scale
  function dialPos(f) {
    return (
      DIAL0 + ((H.clamp(Number(f) || 88, 88, 108) - 88) / 20) * (DIAL1 - DIAL0)
    );
  }
  H.ggPage("radio", "radio", {
    render(body, GG) {
      const st = H.call("radio", "stations", [], []) || [];
      const cur = H.call("radio", "current", [], null);
      const on = H.call("radio", "isOn", [], false);
      const curId = cur && (cur.id || cur);
      const cols = H.el("div", "gg-cols", body);
      const left = H.el("div", "gg-col-l", cols);
      const right = H.el("div", "gg-col-r gg-radio", cols);
      H.ggList(
        left,
        st.map((s) => ({
          label: s.name,
          right: s.freq ? Number(s.freq).toFixed(1) : "",
          cls: "radio-st",
          mark: on && s.id === curId ? "eq" : "",
        })),
        "radio/radio",
        {
          empty: "NO SIGNALS DETECTED.",
          onActivate(i) {
            const s = st[i];
            const playing =
              H.call("radio", "isOn", [], false) &&
              ((H.call("radio", "current", [], null) || {}).id ||
                H.call("radio", "current", [], null)) === s.id;
            H.call("radio", "tune", [playing ? null : s.id]);
            H.sfx("ui_click");
            GG.rerender();
          },
        },
      );
      right.innerHTML =
        H.ggHead("Receiver") +
        '<div class="gg-radio-now"></div><canvas class="gg-wave"></canvas><div class="gg-dial"><div class="gg-dial-scale"></div><i class="gg-dial-needle"></i></div>';
      this.now = right.querySelector(".gg-radio-now");
      this.wave = right.querySelector(".gg-wave");
      this.needle = right.querySelector(".gg-dial-needle");
      const scale = right.querySelector(".gg-dial-scale");
      let ticks = "";
      // scale is inset (DIAL0..DIAL1 %) so the end labels never sit under the needle's rest position
      for (let f = 88; f <= 108; f += 2)
        ticks +=
          "<span" +
          (f % 4 ? ' class="minor"' : "") +
          ' style="left:' +
          dialPos(f).toFixed(2) +
          '%">' +
          (f % 4 ? "" : f) +
          "</span>";
      scale.innerHTML = ticks;
      const s = st.find((x) => x.id === curId);
      H.setHTML(
        this.now,
        on && s
          ? "NOW RECEIVING<br><b>" +
              H.esc(H.up(s.name)) +
              "</b>" +
              (s.freq ? " &middot; " + Number(s.freq).toFixed(1) + " MC" : "")
          : 'RECEIVER IDLE<br><span class="gg-hint-sm">SELECT A SIGNAL TO TUNE IN</span>',
      );
      this.freq = on && s && s.freq ? s.freq : 88;
      this.on = !!(on && s);
      this.t = 0;
      this.acc = 1;
      this.sizeWave();
      this.needle.style.left =
        (this.on ? dialPos(this.freq) : 2).toFixed(2) + "%";
      this.paint();
    },
    hints() {
      return [["Enter", "Tune / off"]];
    },
    sizeWave() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(10, Math.round(this.wave.offsetWidth * dpr)),
        h = Math.max(10, Math.round(this.wave.offsetHeight * dpr));
      if (this.wave.width !== w || this.wave.height !== h) {
        this.wave.width = w;
        this.wave.height = h;
      }
      this.dpr = dpr;
    },
    update(dt) {
      if (!this.wave) return;
      this.t += dt;
      this.acc += dt;
      if (this.acc < 1 / 30) return; // the scope animates at 30 Hz: plenty for a CRT trace, half the canvas work
      this.acc = 0;
      this.paint();
    },
    paint() {
      this.sizeWave();
      this.needle.style.left =
        (this.on ? dialPos(this.freq) : 2).toFixed(2) + "%"; // off: needle rests on the end stop
      const g = this.wave.getContext("2d");
      const w = this.wave.width,
        h = this.wave.height,
        dpr = this.dpr || 1;
      const col = H.tint().c;
      g.clearRect(0, 0, w, h);
      // graticule: 10×6 grid + brighter centre cross with minor ticks, like a bench oscilloscope
      g.strokeStyle = rgba(col, 0.13);
      g.lineWidth = 1;
      g.beginPath();
      for (let i = 1; i < 10; i++) {
        const x = Math.round((w * i) / 10) + 0.5;
        g.moveTo(x, 0);
        g.lineTo(x, h);
      }
      for (let i = 1; i < 6; i++) {
        const y = Math.round((h * i) / 6) + 0.5;
        g.moveTo(0, y);
        g.lineTo(w, y);
      }
      g.stroke();
      g.strokeStyle = rgba(col, 0.3);
      g.beginPath();
      g.moveTo(0, h / 2);
      g.lineTo(w, h / 2);
      g.moveTo(w / 2, 0);
      g.lineTo(w / 2, h);
      for (let i = 0; i <= 50; i++) {
        const x = (w * i) / 50;
        g.moveTo(x, h / 2 - 3 * dpr);
        g.lineTo(x, h / 2 + 3 * dpr);
      }
      g.stroke();
      g.strokeStyle = col;
      g.lineWidth = 2 * dpr;
      g.shadowColor = col;
      g.shadowBlur = 8 * dpr;
      g.lineJoin = "round";
      g.beginPath();
      if (this.on) {
        const amp = h * 0.32;
        for (let x = 0; x <= w; x += 2 * dpr) {
          const u = x / w;
          let y =
            Math.sin(u * 22 + this.t * 9) * 0.5 +
            Math.sin(u * 51 - this.t * 13) * 0.25 +
            Math.sin(u * 7 + this.t * 3) * 0.25;
          y *= (0.6 + 0.4 * Math.sin(this.t * 2.3 + u * 3)) * amp;
          x ? g.lineTo(x, h / 2 + y) : g.moveTo(x, h / 2 + y);
        }
      } else {
        // idle: a flat trace with faint hiss and the odd static blip drifting across
        const blip = ((this.t * 0.35) % 1.4) * w;
        for (let x = 0; x <= w; x += 3 * dpr) {
          const d = (x - blip) / (w * 0.03);
          const y =
            (Math.random() - 0.5) * h * 0.018 +
            Math.exp(-d * d) * Math.sin(x * 0.25) * h * 0.08;
          x ? g.lineTo(x, h / 2 + y) : g.moveTo(x, h / 2 + y);
        }
      }
      g.stroke();
      g.shadowBlur = 0;
      if (!this.on) {
        g.fillStyle = rgba(
          col,
          0.55 + 0.3 * (Math.sin(this.t * 3) > 0 ? 1 : 0),
        );
        g.font =
          "600 " + Math.round(h * 0.11) + 'px "Share Tech Mono", monospace';
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("N O   S I G N A L", w / 2, h * 0.3);
      }
    },
  });
