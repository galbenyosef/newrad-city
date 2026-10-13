// play-inline-544 01 — fillstyle
// Lines 30-348 of readable/play-inline-544.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const AR = G.arcade._;

  const WORLD = {
    entries: [],
    placed: false,
    t: 0,
    live: null,
    liveT: 0,
    liveDt: 0,
    liveHolder: { inst: null, t: 0 },
  };
  AR.world = WORLD;
  let M = null; // materials
  const GEO = {}; // shared geometries
  const PI = Math.PI;

  // ------------------------------------------------------------------
  // Canvas textures
  // ------------------------------------------------------------------
  function canvasEl(w, h, fn) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    fn(c.getContext("2d"), w, h);
    return c;
  }
  function canvasTex(w, h, fn) {
    const t = new THREE.CanvasTexture(canvasEl(w, h, fn));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  /** "THE KEYS COME HOME" flyer (Office of the Mayor, February 1967): cream stock, navy and gold, a drawn key. */
  function flyerTex() {
    return canvasTex(384, 512, (x, w, h) => {
      const r = G.util.rng(1967);
      x.fillStyle = "#ece4cc";
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#1e2f5a";
      x.lineWidth = 6;
      x.strokeRect(10, 10, w - 20, h - 20);
      x.lineWidth = 1.5;
      x.strokeRect(19, 19, w - 38, h - 38);
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillStyle = "#1e2f5a";
      x.font = 'bold 15px Georgia, "Times New Roman", serif';
      x.fillText("THE OFFICE OF THE MAYOR", w / 2, 46);
      x.font = "italic 13px Georgia, serif";
      x.fillText("requests the pleasure of your company", w / 2, 66);
      x.font = 'bold 46px Georgia, "Times New Roman", serif';
      x.fillText("THE KEYS", w / 2, 112);
      x.fillText("COME HOME", w / 2, 160, w - 50);
      // a big ceremonial key across the middle
      const ky = 232;
      x.fillStyle = "#b8862a";
      x.strokeStyle = "#6a4a14";
      x.lineWidth = 2;
      x.beginPath();
      x.arc(92, ky, 30, 0, Math.PI * 2);
      x.fill();
      x.stroke();
      for (const a of [-1, 0, 1]) {
        x.beginPath();
        x.arc(
          92 + Math.cos(Math.PI + a * 1.2) * 34,
          ky + Math.sin(Math.PI + a * 1.2) * 34,
          11,
          0,
          Math.PI * 2,
        );
        x.fill();
        x.stroke();
      }
      x.fillStyle = "#ece4cc";
      x.beginPath();
      x.arc(92, ky, 13, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = "#b8862a";
      x.fillRect(122, ky - 6, 168, 12);
      x.strokeRect(122, ky - 6, 168, 12);
      x.fillRect(128, ky - 10, 8, 20);
      x.fillRect(140, ky - 9, 6, 18);
      x.fillRect(254, ky + 6, 36, 24);
      x.fillStyle = "#ece4cc";
      x.fillRect(262, ky + 18, 8, 12);
      x.fillStyle = "#b01e22";
      x.fillRect(74, ky + 30, 6, 46);
      x.fillStyle = "#f4f0e4";
      x.fillRect(80, ky + 30, 6, 52);
      x.fillStyle = "#1e2f5a";
      x.fillRect(86, ky + 30, 6, 44);
      x.fillStyle = "#1e2f5a";
      x.font = "15px Georgia, serif";
      const lines = [
        "Sixteen Keys to the City, presented by the",
        "Mayors of New York, 1954 to 1967,",
        "shown together for the first time.",
      ];
      lines.forEach((l, i) => x.fillText(l, w / 2, 330 + i * 21, w - 50));
      x.font = "bold 19px Georgia, serif";
      x.fillText("GRACIE MANSION", w / 2, 410);
      x.font = "bold 15px Georgia, serif";
      x.fillText("SUNDAY, MARCH 12, 1967 · TWO O'CLOCK", w / 2, 436, w - 40);
      x.font = "italic 14px Georgia, serif";
      x.fillText("Francis X. Delahunt, Mayor", w / 2, 470);
      // age: foxing, a damp tide line, a torn corner, a pencilled note
      for (let i = 0; i < 30; i++) {
        const px = r() * w,
          py = r() * h,
          rr = 2 + r() * 10;
        const g = x.createRadialGradient(px, py, 0, px, py, rr);
        g.addColorStop(0, "rgba(120,80,30,0.35)");
        g.addColorStop(1, "rgba(120,80,30,0)");
        x.fillStyle = g;
        x.fillRect(px - rr, py - rr, rr * 2, rr * 2);
      }
      x.fillStyle = "rgba(110,80,40,0.16)";
      x.fillRect(0, h * 0.86, w, h * 0.14);
      x.save();
      x.translate(w - 70, 286);
      x.rotate(-0.12);
      x.fillStyle = "rgba(60,60,70,0.7)";
      x.font = 'italic 12px "Comic Sans MS", cursive, sans-serif';
      x.fillText("16 bits, 16 locks", 0, 0);
      x.restore();
      x.globalCompositeOperation = "destination-out";
      x.beginPath();
      x.moveTo(w, 0);
      x.lineTo(w - 46, 0);
      x.lineTo(w, 52);
      x.fill();
      x.globalCompositeOperation = "source-over";
    });
  }
  /** Brass plaque inside a presentation box's lid. */
  function plaqueTex() {
    return canvasTex(128, 64, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#e2c068");
      g.addColorStop(0.5, "#b88a30");
      g.addColorStop(1, "#d8b458");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#6a4a14";
      x.lineWidth = 2;
      x.strokeRect(3, 3, w - 6, h - 6);
      x.fillStyle = "#3a2808";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.font = "bold 13px Georgia, serif";
      x.fillText("THE KEY", w / 2, 21);
      x.fillText("TO THE CITY", w / 2, 38);
      x.font = "8px Georgia, serif";
      x.fillText("CITY OF NEW YORK", w / 2, 53);
    });
  }
  function glintTex() {
    return canvasTex(64, 64, (x, w, h) => {
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.2, "rgba(220,235,255,0.5)");
      g.addColorStop(1, "rgba(200,220,255,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.fillStyle = "rgba(255,255,255,0.8)";
      x.fillRect(31, 4, 2, 56);
      x.fillRect(4, 31, 56, 2);
    });
  }

  /** Old-world street-vendor cart panel: "GREETINGS FROM NEW YORK" with a big red apple. Faded, rusted, scratched. */
  function souvenirTex() {
    return canvasTex(512, 192, (x, w, h) => {
      const r = G.util.rng(771);
      x.fillStyle = "#e6dcc0";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#a92a22";
      x.fillRect(0, 0, w, 36);
      x.fillStyle = "#1f3f76";
      x.fillRect(0, h - 30, w, 30);
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillStyle = "#f3ead2";
      x.font = 'bold 25px "Arial Black", Arial, sans-serif';
      x.fillText("GENUINE NEW YORK SOUVENIRS", w / 2, 19, w - 20);
      x.fillStyle = "#181818";
      x.font = 'bold 54px Georgia, "Times New Roman", serif';
      x.fillText("GREETINGS", w * 0.3, 78);
      x.fillText("FROM N.Y.", w * 0.3, 128);
      // the Big Apple
      const ax = w * 0.78,
        ay = 104;
      x.fillStyle = "#c0281e";
      x.beginPath();
      x.arc(ax - 16, ay, 34, 0, PI * 2);
      x.arc(ax + 16, ay, 34, 0, PI * 2);
      x.fill();
      x.fillStyle = "#5a3a1a";
      x.fillRect(ax - 3, ay - 52, 6, 20);
      x.fillStyle = "#4a7a2a";
      x.beginPath();
      x.ellipse(ax + 16, ay - 44, 16, 7, -0.4, 0, PI * 2);
      x.fill();
      x.fillStyle = "rgba(255,255,255,0.35)";
      x.beginPath();
      x.ellipse(ax - 26, ay - 14, 8, 14, 0.4, 0, PI * 2);
      x.fill();
      x.fillStyle = "#f3ead2";
      x.font = "bold 16px Arial, sans-serif";
      x.fillText(
        "MINIATURES  ·  POSTCARDS  ·  PENNANTS  ·  ALL 25¢",
        w / 2,
        h - 15,
        w - 20,
      );
      // weathering: sun-fade, rust blooms, streaks, scratches
      x.fillStyle = "rgba(255,248,225,0.18)";
      x.fillRect(0, 0, w, h * 0.55);
      for (let i = 0; i < 38; i++) {
        const px = r() * w,
          py = r() * h,
          rr = 3 + r() * 16;
        const g = x.createRadialGradient(px, py, 0, px, py, rr);
        g.addColorStop(0, "rgba(96,48,20,0.75)");
        g.addColorStop(0.6, "rgba(140,80,40,0.35)");
        g.addColorStop(1, "rgba(140,80,40,0)");
        x.fillStyle = g;
        x.fillRect(px - rr, py - rr, rr * 2, rr * 2);
      }
      for (let i = 0; i < 26; i++) {
        const px = r() * w;
        x.fillStyle = "rgba(90,50,25," + (0.12 + r() * 0.2) + ")";
        x.fillRect(px, r() * h * 0.5, 1 + r() * 3, 30 + r() * 90);
      }
      x.strokeStyle = "rgba(40,30,20,0.35)";
      x.lineWidth = 1;
      for (let i = 0; i < 40; i++) {
        const px = r() * w,
          py = r() * h;
        x.beginPath();
        x.moveTo(px, py);
        x.lineTo(px + (r() - 0.5) * 40, py + (r() - 0.5) * 8);
        x.stroke();
      }
      x.fillStyle = "rgba(30,24,18,0.35)";
      x.fillRect(0, h - 10, w, 10);
    });
  }
  /** A cabinet's marquee (the game's title art, back-lit). */
  function marqueeTex(def) {
    return canvasTex(512, 176, (x, w, h) => {
      AR.drawMarquee(x, w, h, def);
    });
  }
  /** A cabinet monitor's idle picture: a frame of the game's attract demo + PRESS START band. */
  function screenTex(def) {
    return canvasTex(256, 192, (x, w, h) => {
      x.fillStyle = "#000";
      x.fillRect(0, 0, w, h);
      try {
        const holder = { inst: null, t: 0 };
        for (let i = 0; i < 70; i++) AR.tickDemo(holder, def.id, 1 / 20);
        holder.clock = 0;
        AR.renderAttract(holder, def.id, 0, x, w, h);
      } catch (e) {
        G.reportError("arcade:screenTex", e);
      }
    });
  }

  /** Neutral grime overlay for vertex-coloured props: white with rust blooms & dirt pooling at the bottom (UV v=0). */
  function grimeTex() {
    return canvasTex(256, 256, (x, w, h) => {
      const r = G.util.rng(4242);
      x.fillStyle = "#ffffff";
      x.fillRect(0, 0, w, h);
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.7, "rgba(70,55,40,0.12)");
      g.addColorStop(1, "rgba(50,38,26,0.5)");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) {
        const px = r() * w,
          py = r() * h,
          rr = 2 + r() * 14;
        const gg = x.createRadialGradient(px, py, 0, px, py, rr);
        gg.addColorStop(0, "rgba(120,62,28,0.38)");
        gg.addColorStop(1, "rgba(120,62,28,0)");
        x.fillStyle = gg;
        x.fillRect(px - rr, py - rr, rr * 2, rr * 2);
      }
      for (let i = 0; i < 40; i++) {
        x.fillStyle = "rgba(80,50,30," + (0.08 + r() * 0.15) + ")";
        x.fillRect(r() * w, r() * h * 0.6, 1 + r() * 2, 20 + r() * 70);
      }
      for (let i = 0; i < 400; i++) {
        x.fillStyle = "rgba(0,0,0," + r() * 0.12 + ")";
        x.fillRect(r() * w, r() * h, 1, 1);
      }
    });
  }

  // ------------------------------------------------------------------
  // Materials & geometries (built once)
  // ------------------------------------------------------------------
  function std(o) {
    const m = new THREE.MeshStandardMaterial(o);
    m.userData.shared = true;
    return m;
  }
  function basic(o) {
    const m = new THREE.MeshBasicMaterial(o);
    m.userData.shared = true;
    return m;
  }
