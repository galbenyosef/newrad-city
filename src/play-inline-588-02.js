// play-inline-588 02 — math
// Lines 26-112 of readable/play-inline-588.pretty.js (statement-aligned).
  const HP = K.HP,
    PI = K.PI;

  const D = (K.SUN = {
    X0: -22,
    X1: 22,
    Z0: -26,
    Z1: 26,
    YS: 8,
    RISE: 9,
    BOMB: { x: 0, y: 1.25, z: 0 }, // flatcar deck centre
    TABLE: { x: -3.3, z: 2.4 }, // card table: firing set + the mask
    PLATE: { x: -2.3, z: -0.8 }, // brass plate: cipher wheel + keyways
    CRADLE: { x: -3.2, z: 6.4 },
    CHAIR: { x: -5.4, z: 6.0 },
    RECORD: { x: -7.0, z: 9.4 },
    DOSI: { x: -2.6, z: -4.6 },
    BATTERY: { x: -5.4, z: 1.2 },
    BREAKER: { x: 8, z: -25.7 },
    SPUR: { x: 22, z: 10 },
    CONVERTERS: [20, 60, 95, 128, 160, 200, 232, 265, 300].map((a) => {
      const t = (a * PI) / 180;
      return { a, x: 13 * Math.cos(t), z: -13 * Math.sin(t) };
    }),
  });
  K.sun = K.sun || {};

  /** Draw the information-booth clock face for 09:MM. */
  function drawClock(c, min) {
    const x = c.getContext("2d"),
      S = c.width,
      R = S / 2;
    x.clearRect(0, 0, S, S);
    const g = x.createRadialGradient(R, R * 0.9, R * 0.1, R, R, R);
    g.addColorStop(0, "#fbf3dc");
    g.addColorStop(1, "#d8c89c");
    x.fillStyle = g;
    x.beginPath();
    x.arc(R, R, R - 2, 0, K.TAU);
    x.fill();
    x.strokeStyle = "#2a2014";
    x.lineWidth = S * 0.012;
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * K.TAU,
        l = i % 5 ? 0.06 : 0.13;
      x.lineWidth = i % 5 ? S * 0.006 : S * 0.016;
      x.beginPath();
      x.moveTo(R + Math.sin(a) * R * 0.86, R - Math.cos(a) * R * 0.86);
      x.lineTo(
        R + Math.sin(a) * R * (0.86 - l),
        R - Math.cos(a) * R * (0.86 - l),
      );
      x.stroke();
    }
    x.fillStyle = "#2a2014";
    x.font = "700 " + Math.round(S * 0.1) + "px Georgia, serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    for (let h = 1; h <= 12; h++) {
      const a = (h / 12) * K.TAU;
      x.fillText(
        String(h),
        R + Math.sin(a) * R * 0.62,
        R - Math.cos(a) * R * 0.62,
      );
    }
    const hand = (a, len, w) => {
      x.lineWidth = w;
      x.lineCap = "round";
      x.beginPath();
      x.moveTo(R, R);
      x.lineTo(R + Math.sin(a) * len, R - Math.cos(a) * len);
      x.stroke();
    };
    hand(((9 + min / 60) / 12) * K.TAU, R * 0.45, S * 0.035);
    hand((min / 60) * K.TAU, R * 0.72, S * 0.022);
    x.fillStyle = "#7a1a10";
    x.beginPath();
    x.arc(R, R, S * 0.03, 0, K.TAU);
    x.fill();
    x.strokeStyle = "rgba(80,60,20,0.35)";
    x.lineWidth = S * 0.02;
    x.beginPath();
    x.arc(R, R, R - S * 0.02, 0, K.TAU);
    x.stroke();
  }

