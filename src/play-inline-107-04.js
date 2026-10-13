// play-inline-107 04 — fillstyle
// Lines 601-1348 of readable/play-inline-107.pretty.js (statement-aligned).
  function drawMotif(x, m, cx, cy, s, a) {
    x.save();
    x.translate(cx, cy);
    x.scale(s / 100, s / 100);
    x.fillStyle = a.ac;
    x.strokeStyle = a.fg;
    x.lineWidth = 6;
    const circle = (px, py, r) => {
      x.beginPath();
      x.arc(px, py, r, 0, Math.PI * 2);
    };
    switch (m) {
      case "bottle":
      case "bottle_glow": // tall, straight-sided ribbed bottle with a long neck
        if (m === "bottle_glow") {
          x.shadowColor = a.ac;
          x.shadowBlur = 40;
        }
        x.fillStyle = m === "bottle_glow" ? a.ac : "#3a1a14";
        x.beginPath();
        x.moveTo(-10, -96);
        x.lineTo(10, -96);
        x.lineTo(11, -52);
        x.quadraticCurveTo(26, -40, 26, -20);
        x.lineTo(26, 92);
        x.lineTo(-26, 92);
        x.lineTo(-26, -20);
        x.quadraticCurveTo(-26, -40, -11, -52);
        x.closePath();
        x.fill();
        x.shadowBlur = 0;
        x.strokeStyle = "rgba(255,255,255,0.35)";
        x.lineWidth = 3;
        for (let i = -2; i <= 2; i++) {
          x.beginPath();
          x.moveTo(i * 9, -14);
          x.lineTo(i * 9, 86);
          x.stroke();
        }
        x.fillStyle = a.fg;
        x.fillRect(-26, 18, 52, 22);
        x.fillStyle = "#c8c8c8";
        x.fillRect(-11, -102, 22, 8);
        break;
      case "cd": // civil defense triangle in a ring
        x.strokeStyle = a.fg;
        x.lineWidth = 10;
        circle(0, 0, 80);
        x.stroke();
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(0, -64);
        x.lineTo(56, 34);
        x.lineTo(-56, 34);
        x.closePath();
        x.fill();
        x.fillStyle = "#fff";
        x.font = 'bold 34px "Arial Black", sans-serif';
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("CD", 0, 6);
        break;
      case "teletype":
        x.fillStyle = "#5a5248";
        x.fillRect(-70, -10, 140, 70);
        x.fillStyle = "#2a2620";
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 9; j++)
            x.fillRect(-60 + j * 14, 2 + i * 13, 10, 9);
        x.fillStyle = "#f0e8d0";
        x.fillRect(-45, -90, 90, 82);
        x.fillStyle = a.fg;
        for (let i = 0; i < 6; i++)
          x.fillRect(-36, -80 + i * 12, 30 + ((i * 23) % 40), 4);
        break;
      case "bolt":
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(15, -95);
        x.lineTo(-40, 10);
        x.lineTo(-2, 10);
        x.lineTo(-20, 95);
        x.lineTo(45, -15);
        x.lineTo(6, -15);
        x.closePath();
        x.fill();
        break;
      case "plane":
        x.fillStyle = a.fg;
        x.fillRect(-90, -8, 180, 16);
        x.beginPath();
        x.moveTo(-20, 0);
        x.lineTo(20, -70);
        x.lineTo(34, -70);
        x.lineTo(20, 0);
        x.lineTo(34, 70);
        x.lineTo(20, 70);
        x.closePath();
        x.fill();
        x.beginPath();
        x.moveTo(-90, 0);
        x.lineTo(-100, -30);
        x.lineTo(-84, -30);
        x.lineTo(-70, 0);
        x.fill();
        break;
      case "clock":
        x.fillStyle = a.ac;
        circle(0, 0, 70);
        x.fill();
        x.fillStyle = a.bg;
        circle(0, 0, 58);
        x.fill();
        x.strokeStyle = a.fg;
        x.lineWidth = 6;
        x.beginPath();
        x.moveTo(0, 0);
        x.lineTo(0, -44);
        x.moveTo(0, 0);
        x.lineTo(30, 10);
        x.stroke();
        x.fillStyle = a.ac;
        x.fillRect(-18, -100, 36, 30);
        x.fillRect(-18, 70, 36, 30);
        break;
      case "wheel":
        x.strokeStyle = a.fg;
        x.lineWidth = 6;
        circle(0, -10, 78);
        x.stroke();
        for (let i = 0; i < 8; i++) {
          const an = (i * Math.PI) / 4;
          x.beginPath();
          x.moveTo(0, -10);
          x.lineTo(Math.cos(an) * 78, -10 + Math.sin(an) * 78);
          x.stroke();
          x.fillStyle = a.ac;
          circle(Math.cos(an) * 78, -10 + Math.sin(an) * 78, 9);
          x.fill();
        }
        x.beginPath();
        x.moveTo(0, -10);
        x.lineTo(-40, 95);
        x.moveTo(0, -10);
        x.lineTo(40, 95);
        x.stroke();
        break;
      case "sun":
        for (let i = 0; i < 12; i++) {
          x.save();
          x.rotate((i * Math.PI) / 6);
          x.fillStyle = a.ac;
          x.fillRect(-6, -95, 12, 40);
          x.restore();
        }
        x.fillStyle = a.ac;
        circle(0, 0, 50);
        x.fill();
        break;
      case "robot": // boxy domestic robot: square head with a visor slot, barrel torso, two arms, treads
        x.fillStyle = "#9aa0a0";
        x.fillRect(-30, -80, 60, 40);
        x.fillStyle = a.ac;
        x.fillRect(-22, -66, 44, 9);
        x.fillStyle = "#9aa0a0";
        x.fillRect(-40, -34, 80, 80);
        x.fillStyle = "#5a6060";
        x.fillRect(-46, 50, 92, 22);
        x.strokeStyle = "#9aa0a0";
        x.lineWidth = 9;
        x.beginPath();
        x.moveTo(-40, -20);
        x.lineTo(-74, 20);
        x.lineTo(-64, 46);
        x.moveTo(40, -20);
        x.lineTo(74, 20);
        x.lineTo(64, 46);
        x.stroke();
        break;
      case "trident":
        x.fillStyle = a.fg;
        x.fillRect(-6, -60, 12, 150);
        x.fillRect(-50, -30, 100, 10);
        for (const px of [-50, 0, 50]) {
          x.beginPath();
          x.moveTo(px - 10, -30);
          x.lineTo(px, -90);
          x.lineTo(px + 10, -30);
          x.fill();
        }
        break;
      case "bowl":
        x.fillStyle = a.fg;
        x.beginPath();
        x.arc(0, 10, 70, 0, Math.PI);
        x.fill();
        for (let i = 0; i < 9; i++) {
          x.fillStyle = i % 2 ? "#fff" : a.ac;
          circle(-50 + i * 12, 0 - (i % 3) * 8, 12);
          x.fill();
        }
        break;
      case "cake":
        x.fillStyle = "#f5e0a0";
        x.fillRect(-60, -10, 120, 50);
        x.fillStyle = "#ff8ab0";
        x.fillRect(-60, -24, 120, 18);
        x.fillStyle = "#c01e3a";
        circle(0, -34, 12);
        x.fill();
        break;
      case "tv":
        x.fillStyle = "#5a3a22";
        x.fillRect(-70, -60, 140, 110);
        x.fillStyle = "#9adfc8";
        x.fillRect(-55, -48, 90, 80);
        x.strokeStyle = "#333";
        x.lineWidth = 4;
        x.beginPath();
        x.moveTo(-20, -60);
        x.lineTo(-45, -95);
        x.moveTo(20, -60);
        x.lineTo(45, -95);
        x.stroke();
        x.fillStyle = a.fg;
        x.beginPath();
        x.moveTo(-30, -95);
        x.lineTo(-15, -120);
        x.lineTo(0, -100);
        x.lineTo(15, -120);
        x.lineTo(30, -95);
        x.fill();
        break;
      case "box":
      case "can":
        x.fillStyle = a.ac;
        x.fillRect(-45, -70, 90, 140);
        x.fillStyle = a.fg;
        x.fillRect(-45, -20, 90, 40);
        if (m === "can") {
          x.fillStyle = "#bbb";
          x.fillRect(-45, -76, 90, 8);
          x.fillRect(-45, 68, 90, 8);
        }
        break;
      case "axe":
        x.fillStyle = "#8a6a4a";
        x.fillRect(-5, -80, 10, 170);
        x.fillStyle = "#c8c8c8";
        x.beginPath();
        x.moveTo(5, -70);
        x.quadraticCurveTo(70, -60, 60, 0);
        x.quadraticCurveTo(30, -20, 5, -20);
        x.fill();
        break;
      case "car":
        x.fillStyle = a.fg;
        x.beginPath();
        x.moveTo(-90, 30);
        x.quadraticCurveTo(-85, -10, -40, -15);
        x.quadraticCurveTo(-20, -55, 30, -50);
        x.quadraticCurveTo(60, -20, 90, -10);
        x.lineTo(95, 30);
        x.closePath();
        x.fill();
        x.fillStyle = "#222";
        circle(-50, 32, 18);
        x.fill();
        circle(55, 32, 18);
        x.fill();
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(95, -8);
        x.lineTo(110, -40);
        x.lineTo(100, 0);
        x.fill();
        break;
      case "inhaler":
        x.fillStyle = a.ac;
        x.fillRect(-25, -60, 50, 90);
        x.fillStyle = a.fg;
        x.fillRect(-15, 30, 30, 50);
        break;
      case "target":
        for (let i = 4; i > 0; i--) {
          x.fillStyle = i % 2 ? a.fg : a.bg;
          circle(0, 0, i * 22);
          x.fill();
        }
        break;
      case "star":
        x.fillStyle = a.fg;
        x.beginPath();
        for (let i = 0; i < 10; i++) {
          const rr = i % 2 ? 38 : 90,
            an = -Math.PI / 2 + (i * Math.PI) / 5;
          x.lineTo(Math.cos(an) * rr, Math.sin(an) * rr);
        }
        x.fill();
        break;
      case "missile":
        x.strokeStyle = a.fg;
        x.lineWidth = 4;
        for (let i = 0; i < 4; i++) {
          x.beginPath();
          x.moveTo(-80 + i * 50, -90);
          x.lineTo(-40 + i * 30, 60);
          x.stroke();
        }
        x.fillStyle = a.ac;
        circle(-20, 60, 22);
        x.fill();
        break;
      case "pill":
        x.fillStyle = a.fg;
        x.beginPath();
        x.ellipse(0, 0, 70, 30, -0.5, 0, Math.PI * 2);
        x.fill();
        x.fillStyle = "#fff";
        x.fillRect(-4, -35, 8, 70);
        break;
      case "news": // a folded newspaper: masthead, headline bars, columns
        x.fillStyle = "#f4f0e4";
        x.save();
        x.rotate(-0.12);
        x.fillRect(-70, -85, 140, 170);
        x.fillStyle = a.fg;
        x.fillRect(-60, -75, 120, 18);
        x.fillStyle = a.ac;
        x.fillRect(-60, -50, 120, 12);
        x.fillStyle = "#555";
        for (let c2 = 0; c2 < 3; c2++)
          for (let i = 0; i < 9; i++)
            x.fillRect(-60 + c2 * 42, -28 + i * 11, 34, 4);
        x.restore();
        break;
      case "pizza": // a slice with a ringed planet behind it
        x.fillStyle = a.ac;
        circle(30, -40, 40);
        x.fill();
        x.strokeStyle = a.fg;
        x.lineWidth = 6;
        x.beginPath();
        x.ellipse(30, -40, 70, 16, -0.3, 0, Math.PI * 2);
        x.stroke();
        x.fillStyle = "#f0c060";
        x.beginPath();
        x.moveTo(-70, -10);
        x.lineTo(40, 90);
        x.quadraticCurveTo(-50, 110, -80, 10);
        x.closePath();
        x.fill();
        x.fillStyle = "#e8b030";
        x.beginPath();
        x.moveTo(-70, -10);
        x.lineTo(40, 90);
        x.lineTo(32, 98);
        x.lineTo(-78, -2);
        x.fill();
        x.fillStyle = "#c0281e";
        for (const [px, py] of [
          [-40, 40],
          [-10, 66],
          [-58, 66],
        ]) {
          circle(px, py, 11);
          x.fill();
        }
        break;
      case "beer": // a foaming glass stein
        x.fillStyle = "#e8a828";
        x.fillRect(-40, -50, 80, 130);
        x.fillStyle = "rgba(255,255,255,0.3)";
        x.fillRect(-30, -40, 10, 110);
        x.fillStyle = "#fff8e8";
        for (const [px, py, rr] of [
          [-30, -56, 18],
          [-6, -64, 22],
          [22, -58, 18],
          [36, -50, 12],
        ]) {
          circle(px, py, rr);
          x.fill();
        }
        x.strokeStyle = "#e8a828";
        x.lineWidth = 12;
        x.beginPath();
        x.arc(46, 14, 26, -1.3, 1.3);
        x.stroke();
        break;
      case "torch": // a raised torch: silver handle, gold flame
        x.fillStyle = "#c8ccd0";
        x.beginPath();
        x.moveTo(-14, -20);
        x.lineTo(14, -20);
        x.lineTo(8, 90);
        x.lineTo(-8, 90);
        x.closePath();
        x.fill();
        x.fillStyle = "#9aa0a8";
        x.fillRect(-26, -34, 52, 16);
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(0, -100);
        x.quadraticCurveTo(34, -64, 20, -36);
        x.lineTo(-20, -36);
        x.quadraticCurveTo(-34, -64, 0, -100);
        x.fill();
        x.fillStyle = "#fff4c0";
        x.beginPath();
        x.moveTo(0, -76);
        x.quadraticCurveTo(14, -56, 8, -40);
        x.lineTo(-8, -40);
        x.quadraticCurveTo(-14, -56, 0, -76);
        x.fill();
        break;
      case "burger":
        x.fillStyle = "#e0a048";
        x.beginPath();
        x.ellipse(0, -30, 80, 44, 0, Math.PI, 0);
        x.fill();
        x.fillStyle = "#fff4d0";
        for (let i = 0; i < 7; i++) {
          x.beginPath();
          x.ellipse(
            -48 + i * 16,
            -50 + (i % 2) * 10,
            3,
            5,
            0.4,
            0,
            Math.PI * 2,
          );
          x.fill();
        }
        x.fillStyle = "#4ab040";
        x.fillRect(-84, -30, 168, 10);
        x.fillStyle = "#5a2a14";
        x.fillRect(-80, -20, 160, 26);
        x.fillStyle = "#ffd23f";
        x.beginPath();
        x.moveTo(-80, -22);
        x.lineTo(80, -22);
        x.lineTo(56, -8);
        x.lineTo(30, -16);
        x.lineTo(0, -4);
        x.lineTo(-40, -16);
        x.closePath();
        x.fill();
        x.fillStyle = "#e0a048";
        x.beginPath();
        x.ellipse(0, 12, 80, 20, 0, 0, Math.PI);
        x.fill();
        x.fillRect(-80, 6, 160, 8);
        break;
      case "castle": // turreted castle gate under a pennant
        x.fillStyle = a.fg;
        x.fillRect(-70, -30, 140, 110);
        for (const px of [-80, 50]) {
          x.fillRect(px, -70, 30, 150);
          for (let i = 0; i < 3; i++) x.fillRect(px + i * 11, -82, 8, 12);
          x.beginPath();
          x.moveTo(px - 4, -70);
          x.lineTo(px + 15, -110);
          x.lineTo(px + 34, -70);
          x.fill();
        }
        for (let i = 0; i < 6; i++) x.fillRect(-70 + i * 26, -42, 14, 12);
        x.fillStyle = a.bg;
        x.beginPath();
        x.moveTo(-24, 80);
        x.lineTo(-24, 20);
        x.arc(0, 20, 24, Math.PI, 0);
        x.lineTo(24, 80);
        x.fill();
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(-65, -110);
        x.lineTo(-30, -100);
        x.lineTo(-65, -90);
        x.fill();
        break;
      case "rocket": // a toy rocket on its launch rail with an exhaust plume
        x.save();
        x.rotate(0.35);
        x.fillStyle = "#f4f0e4";
        x.beginPath();
        x.moveTo(0, -100);
        x.quadraticCurveTo(26, -60, 22, 40);
        x.lineTo(-22, 40);
        x.quadraticCurveTo(-26, -60, 0, -100);
        x.fill();
        x.fillStyle = a.fg;
        x.beginPath();
        x.moveTo(0, -100);
        x.quadraticCurveTo(14, -78, 16, -62);
        x.lineTo(-16, -62);
        x.quadraticCurveTo(-14, -78, 0, -100);
        x.fill();
        x.fillStyle = a.ac;
        circle(0, -30, 10);
        x.fill();
        x.fillStyle = a.fg;
        for (const sg of [-1, 1]) {
          x.beginPath();
          x.moveTo(sg * 20, 10);
          x.lineTo(sg * 46, 56);
          x.lineTo(sg * 20, 40);
          x.fill();
        }
        x.fillStyle = "#ffb040";
        x.beginPath();
        x.moveTo(-14, 42);
        x.lineTo(0, 100);
        x.lineTo(14, 42);
        x.fill();
        x.restore();
        break;
      case "tonic": // a tall apothecary bottle with a label and stopper
        x.fillStyle = "#5a2a14";
        x.beginPath();
        x.moveTo(-10, -80);
        x.lineTo(10, -80);
        x.lineTo(10, -50);
        x.lineTo(40, -26);
        x.lineTo(40, 90);
        x.lineTo(-40, 90);
        x.lineTo(-40, -26);
        x.lineTo(-10, -50);
        x.closePath();
        x.fill();
        x.fillStyle = a.ac;
        x.fillRect(-14, -98, 28, 20);
        x.fillStyle = "#f4ecd8";
        x.fillRect(-34, -4, 68, 64);
        x.fillStyle = a.bg;
        x.font = "bold 22px Georgia, serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("Dr.T", 0, 18);
        x.fillRect(-26, 38, 52, 4);
        break;
      case "apple":
        x.fillStyle = "#f4ecd8";
        circle(0, 0, 90);
        x.fill();
        x.strokeStyle = a.fg;
        x.lineWidth = 8;
        x.stroke();
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(0, -30);
        x.bezierCurveTo(34, -60, 72, -18, 54, 26);
        x.bezierCurveTo(40, 64, 12, 64, 0, 54);
        x.bezierCurveTo(-12, 64, -40, 64, -54, 26);
        x.bezierCurveTo(-72, -18, -34, -60, 0, -30);
        x.fill();
        x.strokeStyle = "#4a2a10";
        x.lineWidth = 6;
        x.beginPath();
        x.moveTo(0, -30);
        x.lineTo(6, -58);
        x.stroke();
        x.fillStyle = "#3a8a2a";
        x.beginPath();
        x.ellipse(22, -52, 18, 8, -0.5, 0, Math.PI * 2);
        x.fill();
        break;
      case "pump": // a round-shouldered gas pump with a globe on top
        x.fillStyle = a.fg;
        x.fillRect(-36, -40, 72, 130);
        x.beginPath();
        x.ellipse(0, -40, 36, 14, 0, Math.PI, 0);
        x.fill();
        x.fillStyle = "#f4f0e4";
        circle(0, -76, 24);
        x.fill();
        x.fillStyle = a.fg;
        x.font = "bold 22px Georgia, serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("H", 0, -75);
        x.fillStyle = "#f4f0e4";
        x.fillRect(-24, -24, 48, 34);
        x.fillStyle = a.ac;
        for (let i = 0; i < 3; i++) x.fillRect(-18, -18 + i * 10, 36, 4);
        x.strokeStyle = a.ac;
        x.lineWidth = 6;
        x.beginPath();
        x.moveTo(36, 10);
        x.quadraticCurveTo(70, 20, 60, 70);
        x.stroke();
        break;
      case "goggles": // a pair of field goggles with amber lenses on a strap
        x.strokeStyle = "#3a4a5a";
        x.lineWidth = 12;
        x.beginPath();
        x.moveTo(-100, -4);
        x.lineTo(100, -4);
        x.stroke();
        for (const sg of [-1, 1]) {
          x.fillStyle = "#5a6a78";
          circle(sg * 42, 0, 38);
          x.fill();
          x.fillStyle = a.ac;
          circle(sg * 42, 0, 26);
          x.fill();
          x.fillStyle = "rgba(255,255,255,0.4)";
          circle(sg * 42 - 8, -8, 8);
          x.fill();
        }
        x.fillStyle = "#5a6a78";
        x.fillRect(-10, -8, 20, 14);
        break;
      case "zeppelin": // a chocolate airship with a cream-filled stripe
        x.fillStyle = a.ac;
        x.beginPath();
        x.ellipse(0, -10, 96, 42, 0, 0, Math.PI * 2);
        x.fill();
        x.fillStyle = "#fff4e0";
        x.fillRect(-90, -14, 180, 10);
        x.fillStyle = a.ac;
        for (const sg of [-1, 1]) {
          x.beginPath();
          x.moveTo(78, sg * 6 - 10);
          x.lineTo(104, sg * 40 - 10);
          x.lineTo(90, sg * 4 - 10);
          x.fill();
        }
        x.fillStyle = "#3a2418";
        x.fillRect(-24, 32, 48, 16);
        x.strokeStyle = "#3a2418";
        x.lineWidth = 3;
        x.beginPath();
        x.moveTo(-20, 32);
        x.lineTo(-30, 24);
        x.moveTo(20, 32);
        x.lineTo(30, 24);
        x.stroke();
        break;
      case "plain": // the sun on the horizon over the open plain, a winding trail
        for (let i = 0; i < 9; i++) {
          x.save();
          x.rotate(-Math.PI + ((i + 0.5) * Math.PI) / 9);
          x.fillStyle = a.ac;
          x.fillRect(-5, -100, 10, 36);
          x.restore();
        }
        x.fillStyle = a.ac;
        x.beginPath();
        x.arc(0, 0, 54, Math.PI, 0);
        x.fill();
        x.fillStyle = a.fg;
        x.fillRect(-100, 0, 200, 8);
        x.fillStyle = "rgba(74,36,16,0.45)";
        x.beginPath();
        x.moveTo(-8, 8);
        x.quadraticCurveTo(40, 40, -20, 70);
        x.lineTo(20, 96);
        x.lineTo(-50, 96);
        x.quadraticCurveTo(10, 50, -18, 8);
        x.fill();
        break;
      case "chevrons": // sergeant's stripes on an olive sleeve patch
        x.fillStyle = a.ac;
        x.fillRect(-70, -84, 140, 168);
        x.strokeStyle = a.fg;
        x.lineWidth = 5;
        x.strokeRect(-64, -78, 128, 156);
        x.strokeStyle = a.bg;
        x.lineWidth = 14;
        x.lineJoin = "miter";
        for (let i = 0; i < 3; i++) {
          const y = -46 + i * 30;
          x.beginPath();
          x.moveTo(-54, y + 30);
          x.lineTo(0, y);
          x.lineTo(54, y + 30);
          x.stroke();
        }
        break;
      case "franks": // the Forever Franks mascot: a frank in a top hat holding an hourglass
        x.scale(0.78, 0.78);
        x.translate(-12, 8);
        x.fillStyle = "#b8482c";
        x.beginPath();
        x.moveTo(-26, -40);
        x.arc(0, -40, 26, Math.PI, 0);
        x.lineTo(26, 50);
        x.arc(0, 50, 26, 0, Math.PI);
        x.closePath();
        x.fill();
        x.fillStyle = "#fff";
        circle(-10, -26, 8);
        x.fill();
        circle(10, -26, 8);
        x.fill();
        x.fillStyle = "#111";
        circle(-9, -25, 4);
        x.fill();
        circle(11, -25, 4);
        x.fill();
        x.strokeStyle = "#3a0e08";
        x.lineWidth = 4;
        x.beginPath();
        x.arc(0, -10, 14, 0.2, Math.PI - 0.2);
        x.stroke();
        x.fillStyle = "#151515";
        x.fillRect(-20, -106, 40, 44);
        x.beginPath();
        x.ellipse(0, -62, 36, 8, 0, 0, Math.PI * 2);
        x.fill();
        x.fillStyle = "#c8281e";
        x.fillRect(-20, -76, 40, 7);
        x.strokeStyle = "#2a1a10";
        x.lineWidth = 6;
        x.beginPath();
        x.moveTo(24, 10);
        x.lineTo(54, -4);
        x.stroke();
        x.fillStyle = "#7a4a22";
        x.fillRect(48, -40, 30, 6);
        x.fillRect(48, 14, 30, 6);
        x.fillStyle = "rgba(220,235,240,0.95)";
        x.beginPath();
        x.moveTo(52, -34);
        x.lineTo(74, -34);
        x.lineTo(66, -10);
        x.lineTo(74, 14);
        x.lineTo(52, 14);
        x.lineTo(60, -10);
        x.closePath();
        x.fill();
        x.fillStyle = a.ac;
        x.beginPath();
        x.moveTo(53, 14);
        x.lineTo(73, 14);
        x.lineTo(63, 0);
        x.fill();
        break;
      default:
        circle(0, 0, 60);
        x.fill();
    }
    x.restore();
  }

  /** Original fallback billboard art for a brand (original names and designs). */
