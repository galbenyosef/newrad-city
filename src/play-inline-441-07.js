// play-inline-441 07 — fillstyle
// Lines 1979-2325 of readable/play-inline-441.pretty.js (statement-aligned).
  function harryMark(ctx, cx, cy, s, o) {
    o = o || {};
    ctx.save();
    ctx.translate(cx, cy);
    // wings: three swept feathers each side
    ctx.fillStyle = o.wing || "#c8281e";
    for (const sd of [-1, 1])
      for (let i = 0; i < 3; i++) {
        const y0 = -s * 0.55 + i * s * 0.36,
          len = s * (1.15 - i * 0.22);
        ctx.beginPath();
        ctx.moveTo(sd * s * 0.8, y0);
        ctx.lineTo(sd * (s * 0.8 + len), y0 - s * 0.16);
        ctx.lineTo(sd * (s * 0.8 + len * 0.86), y0 + s * 0.16);
        ctx.lineTo(sd * s * 0.8, y0 + s * 0.24);
        ctx.closePath();
        ctx.fill();
      }
    // tyre, rim, spokes
    ctx.fillStyle = o.tyre || "#151515";
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, X.TAU);
    ctx.fill();
    ctx.fillStyle = o.rim || "#f2e8d0";
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.78, 0, X.TAU);
    ctx.fill();
    ctx.strokeStyle = o.tyre || "#151515";
    ctx.lineWidth = Math.max(1, s * 0.08);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5);
      ctx.lineTo(Math.cos(a) * s * 0.76, Math.sin(a) * s * 0.76);
      ctx.stroke();
    }
    ctx.fillStyle = o.hub || "#c8281e";
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.5, 0, X.TAU);
    ctx.fill();
    txt(ctx, "H", 0, s * 0.04, Math.round(s * 0.78), o.letter || "#f2e8d0");
    ctx.restore();
  }
  X.harryMark = harryMark;
  function checker(ctx, x, y, w, h, n) {
    const cs = h / n;
    for (let j = 0; j < n; j++)
      for (let i = 0; i * cs < w; i++) {
        ctx.fillStyle = (i + j) % 2 ? "#f2e8d0" : "#151515";
        ctx.fillRect(x + i * cs, y + j * cs, cs + 0.5, cs + 0.5);
      }
  }
  // canopy / office fascia: checker bands over a red field, the mark at both ends
  R("hioctane_fascia", 512, 64, (c, w, h, r) => {
    c.fillStyle = "#c0261c";
    c.fillRect(0, 0, w, h);
    checker(c, 0, 0, w, 10, 2);
    checker(c, 0, h - 10, w, 10, 2);
    harryMark(c, 56, h / 2, 15, { wing: "#f2e8d0" });
    harryMark(c, w - 56, h / 2, 15, { wing: "#f2e8d0" });
    txt(c, "HI-OCTANE HARRY'S", w / 2, h / 2 + 1, 34, "#f2e8d0", {
      maxW: w - 200,
      stroke: "rgba(40,0,0,0.5)",
    });
    weather(c, w, h, r, 0.9);
  });
  // plain fascia run (checker bands over red) for the rest of the canopy edge
  R("hioctane_band", 256, 32, (c, w, h, r) => {
    c.fillStyle = "#c0261c";
    c.fillRect(0, 0, w, h);
    checker(c, 0, 0, w, 6, 1);
    checker(c, 0, h - 6, w, 6, 1);
    weather(c, w, h, r, 1.0);
  });
  // tall pole sign: the mark, the name, the slogan, a checker foot
  R("hioctane_pole", 256, 320, (c, w, h, r) => {
    c.fillStyle = "#f2e8d0";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#151515";
    c.lineWidth = 8;
    c.strokeRect(4, 4, w - 8, h - 8);
    harryMark(c, w / 2, 74, 44);
    txt(c, "HI-OCTANE", w / 2, 152, 40, "#c0261c", {
      maxW: w - 30,
      stroke: "rgba(60,0,0,0.3)",
    });
    txt(c, "HARRY'S", w / 2, 192, 38, "#151515", { maxW: w - 40 });
    txt(c, "Full service. Full tank.", w / 2, 232, 18, "#2a2a26", {
      font: F_SERIF,
      weight: "italic bold",
      maxW: w - 30,
    });
    txt(c, "Full speed ahead.", w / 2, 256, 18, "#2a2a26", {
      font: F_SERIF,
      weight: "italic bold",
      maxW: w - 30,
    });
    checker(c, 8, h - 40, w - 16, 32, 2);
    weather(c, w, h, r, 1.0);
  });
  // price board hung under the pole sign
  R("hioctane_price", 256, 96, (c, w, h, r) => {
    c.fillStyle = "#151515";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#f2e8d0";
    c.lineWidth = 3;
    c.strokeRect(5, 5, w - 10, h - 10);
    txt(c, "HI-OCTANE  33.9¢", w / 2, 32, 24, "#ffcf40", { maxW: w - 24 });
    txt(c, "REGULAR  29.9¢", w / 2, 66, 24, "#f2e8d0", { maxW: w - 24 });
    weather(c, w, h, r, 1.0);
  });
  // pump face: name band, gallons / sale windows, the mark, grade plate
  R("hioctane_pump", 96, 160, (c, w, h, r) => {
    c.fillStyle = "#c0261c";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#f2e8d0";
    c.fillRect(0, 0, w, 26);
    txt(c, "HI-OCTANE", w / 2, 14, 15, "#151515", { maxW: w - 8 });
    c.fillStyle = "#e8e2d0";
    c.fillRect(10, 34, w - 20, 50);
    c.fillStyle = "#151515";
    c.fillRect(16, 40, w - 32, 16);
    c.fillRect(16, 62, w - 32, 16);
    txt(c, "0 0 4 . 2", w / 2, 48, 12, "#e8e2d0", {
      font: F_MONO,
      weight: "normal",
    });
    txt(c, "1 . 4 2", w / 2, 70, 12, "#e8e2d0", {
      font: F_MONO,
      weight: "normal",
    });
    harryMark(c, w / 2, 108, 14, { wing: "#f2e8d0" });
    c.fillStyle = "#f2e8d0";
    c.fillRect(14, 132, w - 28, 18);
    txt(c, "ETHYL", w / 2, 141, 12, "#c0261c");
    weather(c, w, h, r, 1.1);
  });
  // office window lettering + an oil-can label
  R("hioctane_office", 256, 48, (c, w, h, r) => {
    c.fillStyle = "#f2e8d0";
    c.fillRect(0, 0, w, h);
    checker(c, 0, 0, w, 8, 2);
    txt(c, "OFFICE · ROAD MAPS · REST ROOMS", w / 2, 29, 17, "#151515", {
      maxW: w - 16,
    });
    weather(c, w, h, r, 1.0);
  });
  R("hioctane_oil", 48, 64, (c, w, h, r) => {
    c.fillStyle = "#e8b830";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#c0261c";
    c.fillRect(0, 18, w, 26);
    harryMark(c, w / 2, 31, 8, { wing: "#151515" });
    txt(c, "MOTOR OIL", w / 2, 54, 8, "#151515", { maxW: w - 4 });
    weather(c, w, h, r, 1.0);
  });

  // ---------- street vendors, newsstands, fire alarm boxes, Army medical (27_streetlife.js) ----------
  /** The Forever Franks mascot: a cheerful frank in a top hat, waving, an hourglass in his other hand. */
  function franksMascot(c, x, y, s) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.lineCap = "round";
    c.lineJoin = "round";
    // legs + shoes
    c.strokeStyle = "#2a1a10";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-5, 28);
    c.lineTo(-7, 38);
    c.moveTo(5, 28);
    c.lineTo(7, 38);
    c.stroke();
    c.fillStyle = "#1a1a18";
    c.beginPath();
    c.ellipse(-9, 39, 5, 2.6, 0, 0, X.TAU);
    c.ellipse(9, 39, 5, 2.6, 0, 0, X.TAU);
    c.fill();
    // arms: the left one waves, the right one holds the hourglass up
    c.beginPath();
    c.moveTo(-11, 6);
    c.quadraticCurveTo(-22, 2, -24, -10);
    c.moveTo(11, 6);
    c.quadraticCurveTo(20, 10, 24, 2);
    c.stroke();
    c.fillStyle = "#f4ecd8";
    c.beginPath();
    c.arc(-24, -12, 3.6, 0, X.TAU);
    c.arc(25, 1, 3.4, 0, X.TAU);
    c.fill();
    // the hourglass: wooden caps, glass bulbs, sand running down
    c.save();
    c.translate(31, -4);
    c.fillStyle = "#7a4a22";
    c.fillRect(-7, -14, 14, 3);
    c.fillRect(-7, 11, 14, 3);
    c.fillStyle = "rgba(220,235,240,0.9)";
    c.beginPath();
    c.moveTo(-5, -11);
    c.lineTo(5, -11);
    c.lineTo(1, 0);
    c.lineTo(5, 11);
    c.lineTo(-5, 11);
    c.lineTo(-1, 0);
    c.closePath();
    c.fill();
    c.fillStyle = "#e8b848";
    c.beginPath();
    c.moveTo(-3, -6);
    c.lineTo(3, -6);
    c.lineTo(0.6, -1);
    c.lineTo(-0.6, -1);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(-4.5, 11);
    c.lineTo(4.5, 11);
    c.lineTo(0, 5);
    c.closePath();
    c.fill();
    c.fillRect(-0.4, -1, 0.8, 7);
    c.strokeStyle = "#5a3418";
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(-6, -11);
    c.lineTo(-6, 11);
    c.moveTo(6, -11);
    c.lineTo(6, 11);
    c.stroke();
    c.restore();
    // the frank: plump rounded body with a shine
    c.fillStyle = "#b8482c";
    rrect(c, -12, -22, 24, 52, 12);
    c.fill();
    c.strokeStyle = "#6a2214";
    c.lineWidth = 1.6;
    c.stroke();
    c.fillStyle = "rgba(255,220,190,0.35)";
    rrect(c, -8, -16, 5, 30, 2.5);
    c.fill();
    // face: bright eyes and a big grin
    c.fillStyle = "#fff";
    c.beginPath();
    c.ellipse(-4.5, -9, 3.2, 3.8, 0, 0, X.TAU);
    c.ellipse(4.5, -9, 3.2, 3.8, 0, 0, X.TAU);
    c.fill();
    c.fillStyle = "#1a1a18";
    c.beginPath();
    c.arc(-4, -8.4, 1.6, 0, X.TAU);
    c.arc(5, -8.4, 1.6, 0, X.TAU);
    c.fill();
    c.strokeStyle = "#3a0e08";
    c.lineWidth = 1.8;
    c.beginPath();
    c.arc(0, -2, 6.5, 0.2, Math.PI - 0.2);
    c.stroke();
    c.fillStyle = "#e88a6a";
    c.beginPath();
    c.arc(-8, -1, 2.2, 0, X.TAU);
    c.arc(8, -1, 2.2, 0, X.TAU);
    c.fill();
    // mustard stripe down the front
    c.strokeStyle = "#f0d020";
    c.lineWidth = 2.2;
    c.beginPath();
    c.moveTo(0, 8);
    for (let i = 1; i <= 5; i++) c.lineTo(i % 2 ? 3 : -3, 8 + i * 3.6);
    c.stroke();
    // the top hat, tipped at a jaunty angle
    c.save();
    c.translate(1, -21);
    c.rotate(-0.16);
    c.fillStyle = "#151515";
    c.beginPath();
    c.ellipse(0, 0, 15, 3.4, 0, 0, X.TAU);
    c.fill();
    c.fillRect(-9, -20, 18, 20);
    c.fillStyle = "#c8281e";
    c.fillRect(-9, -6, 18, 3.4);
    c.restore();
    c.restore();
  }
  // Forever Franks cart livery: big and bright enough to read from across the street
  R("cart_side", 256, 128, (c, w, h, r) => {
    c.fillStyle = "#f0e4c4";
    c.fillRect(0, 0, w, h);
    // red & cream awning stripes along the top, red kick band along the bottom
    for (let x = 0; x < w; x += 32) {
      c.fillStyle = "#c8281e";
      c.fillRect(x, 0, 16, 20);
    }
    c.fillStyle = "#c8281e";
    for (let x = 0; x < w; x += 16) {
      c.beginPath();
      c.arc(x + 8, 20, 8, 0, Math.PI);
      c.fill();
    }
    c.fillStyle = "#c8281e";
    c.fillRect(0, h - 16, w, 16);
    c.fillStyle = "#e8c040";
    c.fillRect(0, h - 19, w, 3);
    txt(c, "FOREVER", 80, 42, 24, "#b01a14", {
      maxW: 148,
      stroke: "rgba(60,10,0,0.3)",
    });
    txt(c, "FRANKS", 80, 70, 36, "#b01a14", {
      maxW: 152,
      stroke: "rgba(60,10,0,0.35)",
    });
    txt(c, "So good they'll outlive you!", 80, 92, 13, "#2a2a26", {
      font: F_SCRIPT,
      weight: "normal",
      maxW: 150,
    });
    txt(c, "Now with Miracle-Keep", 80, 104, 8, "#5a4a30", {
      weight: "normal",
      maxW: 140,
    });
    // the mascot on a mustard sunburst
    c.save();
    c.translate(204, 66);
    c.fillStyle = "#e8c040";
    c.beginPath();
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12,
        rr = i % 2 ? 32 : 46;
      c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath();
    c.fill();
    c.restore();
    franksMascot(c, 200, 68, 1.0);
    weather(c, w, h, r, 0.8);
  });
  R("cart_menu", 192, 64, (c, w, h, r) => {
    c.fillStyle = "#c8281e";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#f0e4c4";
    c.lineWidth = 3;
    c.strokeRect(4, 4, w - 8, h - 8);
    txt(c, "FOREVER FRANKS 10¢", w / 2, 26, 22, "#f0e4c4", { maxW: 176 });
    txt(c, "FRANK-IN-A-BUN · ICE COLD FIZZO", w / 2, 48, 12, "#f0d040", {
      maxW: 170,
    });
    weather(c, w, h, r, 0.9);
  });
