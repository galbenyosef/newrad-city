// play-inline-479 03 — beginpath
// Lines 1300-1629 of readable/play-inline-479.pretty.js (statement-aligned).
  const PICTO = {
    padlock(c, cx, cy, s, fg) {
      c.strokeStyle = fg;
      c.lineWidth = s * 0.12;
      c.beginPath();
      c.arc(cx, cy - s * 0.18, s * 0.28, Math.PI, 0);
      c.stroke();
      c.fillStyle = fg;
      c.fillRect(cx - s * 0.42, cy - s * 0.18, s * 0.84, s * 0.62);
      c.fillStyle = "rgba(0,0,0,0.55)";
      c.beginPath();
      c.arc(cx, cy + s * 0.05, s * 0.08, 0, Math.PI * 2);
      c.fill();
      c.fillRect(cx - s * 0.03, cy + s * 0.05, s * 0.06, s * 0.22);
    },
    pistol(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.fillRect(cx - s * 0.5, cy - s * 0.2, s * 0.95, s * 0.2);
      c.fillRect(cx - s * 0.5, cy - s * 0.26, s * 0.12, s * 0.08);
      c.beginPath();
      c.moveTo(cx + s * 0.1, cy);
      c.lineTo(cx + s * 0.42, cy);
      c.lineTo(cx + s * 0.5, cy + s * 0.46);
      c.lineTo(cx + s * 0.22, cy + s * 0.46);
      c.closePath();
      c.fill();
      c.strokeStyle = fg;
      c.lineWidth = s * 0.05;
      c.beginPath();
      c.arc(cx + s * 0.02, cy + s * 0.06, s * 0.1, 0, Math.PI);
      c.stroke();
    },
    rifle(c, cx, cy, s, fg) {
      c.save();
      c.translate(cx, cy);
      c.rotate(-0.35);
      c.fillStyle = fg;
      c.fillRect(-s * 0.6, -s * 0.06, s * 1.2, s * 0.1);
      c.fillRect(s * 0.1, -s * 0.06, s * 0.5, s * 0.16);
      c.beginPath();
      c.moveTo(s * 0.35, s * 0.04);
      c.lineTo(s * 0.62, s * 0.04);
      c.lineTo(s * 0.66, s * 0.26);
      c.lineTo(s * 0.45, s * 0.2);
      c.closePath();
      c.fill();
      c.fillRect(-s * 0.2, -s * 0.16, s * 0.3, s * 0.08);
      c.restore();
    },
    bolt(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.beginPath();
      c.moveTo(cx + s * 0.1, cy - s * 0.55);
      c.lineTo(cx - s * 0.3, cy + s * 0.05);
      c.lineTo(cx - s * 0.02, cy + s * 0.05);
      c.lineTo(cx - s * 0.15, cy + s * 0.55);
      c.lineTo(cx + s * 0.3, cy - s * 0.1);
      c.lineTo(cx + s * 0.02, cy - s * 0.1);
      c.closePath();
      c.fill();
    },
    orbit(c, cx, cy, s, fg) {
      c.strokeStyle = fg;
      c.lineWidth = s * 0.06;
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.ellipse(cx, cy, s * 0.5, s * 0.18, (i * Math.PI) / 3, 0, Math.PI * 2);
        c.stroke();
      }
      c.fillStyle = fg;
      c.beginPath();
      c.arc(cx, cy, s * 0.1, 0, Math.PI * 2);
      c.fill();
    },
    mushroom(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy - s * 0.25, s * 0.42, s * 0.24, 0, 0, Math.PI * 2);
      c.fill();
      c.fillRect(cx - s * 0.1, cy - s * 0.1, s * 0.2, s * 0.5);
      c.beginPath();
      c.ellipse(cx, cy + s * 0.42, s * 0.5, s * 0.1, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(cx, cy + s * 0.08, s * 0.24, s * 0.06, 0, 0, Math.PI * 2);
      c.fill();
    },
    turtle(c, cx, cy, s, fg, bg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy, s * 0.42, s * 0.28, 0, Math.PI, 0);
      c.fill();
      c.fillRect(cx - s * 0.46, cy - s * 0.02, s * 0.92, s * 0.08);
      c.beginPath();
      c.arc(cx + s * 0.52, cy - s * 0.02, s * 0.1, 0, Math.PI * 2);
      c.fill();
      c.fillRect(cx - s * 0.32, cy + s * 0.04, s * 0.1, s * 0.14);
      c.fillRect(cx + s * 0.22, cy + s * 0.04, s * 0.1, s * 0.14);
      c.strokeStyle = bg;
      c.lineWidth = s * 0.03;
      c.beginPath();
      c.moveTo(cx - s * 0.2, cy - s * 0.22);
      c.lineTo(cx, cy - s * 0.1);
      c.lineTo(cx + s * 0.2, cy - s * 0.22);
      c.stroke();
    },
    chevron(c, cx, cy, s, fg) {
      c.save();
      c.strokeStyle = fg;
      c.lineWidth = s * 0.12;
      c.lineCap = "round";
      c.lineJoin = "round";
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.moveTo(cx - s * 0.36, cy - s * 0.05 + i * s * 0.2);
        c.lineTo(cx, cy - s * 0.3 + i * s * 0.2);
        c.lineTo(cx + s * 0.36, cy - s * 0.05 + i * s * 0.2);
        c.stroke();
      }
      c.restore();
    },
    glove(c, cx, cy, s, fg, bg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy - s * 0.08, s * 0.36, s * 0.32, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(
        cx - s * 0.32,
        cy + s * 0.02,
        s * 0.14,
        s * 0.2,
        0.4,
        0,
        Math.PI * 2,
      );
      c.fill();
      c.fillRect(cx - s * 0.26, cy + s * 0.18, s * 0.5, s * 0.3);
      c.fillStyle = bg;
      c.fillRect(cx - s * 0.26, cy + s * 0.24, s * 0.5, s * 0.05);
    },
    cross(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.fillRect(cx - s * 0.13, cy - s * 0.42, s * 0.26, s * 0.84);
      c.fillRect(cx - s * 0.42, cy - s * 0.13, s * 0.84, s * 0.26);
    },
    tube(c, cx, cy, s, fg, bg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy - s * 0.1, s * 0.22, s * 0.36, 0, 0, Math.PI * 2);
      c.fill();
      c.fillRect(cx - s * 0.24, cy + s * 0.2, s * 0.48, s * 0.2);
      c.strokeStyle = bg;
      c.lineWidth = s * 0.04;
      c.beginPath();
      c.moveTo(cx - s * 0.1, cy + s * 0.15);
      c.lineTo(cx - s * 0.1, cy - s * 0.2);
      c.lineTo(cx + s * 0.1, cy - s * 0.2);
      c.lineTo(cx + s * 0.1, cy + s * 0.15);
      c.stroke();
      for (const dx of [-0.16, -0.05, 0.05, 0.16])
        c.fillRect(cx + dx * s - s * 0.02, cy + s * 0.4, s * 0.04, s * 0.14);
    },
    wrench(c, cx, cy, s, fg, bg) {
      c.save();
      c.translate(cx, cy);
      c.rotate(-0.8);
      c.fillStyle = fg;
      c.fillRect(-s * 0.07, -s * 0.3, s * 0.14, s * 0.8);
      c.beginPath();
      c.arc(0, -s * 0.36, s * 0.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = bg;
      c.fillRect(-s * 0.07, -s * 0.6, s * 0.14, s * 0.26);
      c.restore();
    },
    dome(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.beginPath();
      c.arc(cx, cy, s * 0.32, Math.PI, 0);
      c.fill();
      c.fillRect(cx - s * 0.5, cy, s, s * 0.1);
      for (let i = -3; i <= 3; i++)
        c.fillRect(
          cx + i * s * 0.13 - s * 0.03,
          cy + s * 0.1,
          s * 0.06,
          s * 0.28,
        );
      c.fillRect(cx - s * 0.55, cy + s * 0.38, s * 1.1, s * 0.1);
      c.fillRect(cx - s * 0.03, cy - s * 0.5, s * 0.06, s * 0.2);
    },
    star(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5,
          r = i % 2 ? s * 0.2 : s * 0.5;
        c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      c.closePath();
      c.fill();
    },
    hat(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy + s * 0.15, s * 0.55, s * 0.12, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.moveTo(cx - s * 0.3, cy + s * 0.12);
      c.quadraticCurveTo(cx - s * 0.3, cy - s * 0.42, cx, cy - s * 0.3);
      c.quadraticCurveTo(
        cx + s * 0.3,
        cy - s * 0.42,
        cx + s * 0.3,
        cy + s * 0.12,
      );
      c.fill();
    },
    compass(c, cx, cy, s, fg, bg) {
      c.strokeStyle = fg;
      c.lineWidth = s * 0.08;
      c.beginPath();
      c.arc(cx, cy, s * 0.42, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = fg;
      c.beginPath();
      c.moveTo(cx, cy - s * 0.36);
      c.lineTo(cx + s * 0.1, cy);
      c.lineTo(cx, cy + s * 0.36);
      c.lineTo(cx - s * 0.1, cy);
      c.closePath();
      c.fill();
      c.fillStyle = bg;
      c.beginPath();
      c.arc(cx, cy, s * 0.05, 0, Math.PI * 2);
      c.fill();
    },
    mask(c, cx, cy, s, fg, bg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy, s * 0.5, s * 0.22, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = bg;
      c.beginPath();
      c.ellipse(cx - s * 0.2, cy, s * 0.1, s * 0.07, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(cx + s * 0.2, cy, s * 0.1, s * 0.07, 0, 0, Math.PI * 2);
      c.fill();
    },
    dollar(c, cx, cy, s, fg) {
      text(c, "$", cx, cy, Math.round(s * 1.1), fg, { font: "Georgia, serif" });
    },
    handshake(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.save();
      c.translate(cx, cy);
      c.rotate(-0.25);
      c.fillRect(-s * 0.55, -s * 0.1, s * 0.5, s * 0.2);
      c.fillRect(s * 0.05, -s * 0.1, s * 0.5, s * 0.2);
      c.beginPath();
      c.ellipse(0, 0, s * 0.2, s * 0.16, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    },
    sword(c, cx, cy, s, fg) {
      c.save();
      c.translate(cx, cy);
      c.rotate(0.7);
      c.fillStyle = fg;
      c.fillRect(-s * 0.04, -s * 0.55, s * 0.08, s * 0.8);
      c.fillRect(-s * 0.2, s * 0.22, s * 0.4, s * 0.06);
      c.fillRect(-s * 0.035, s * 0.28, s * 0.07, s * 0.2);
      c.restore();
    },
    tent(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.beginPath();
      c.moveTo(cx - s * 0.5, cy + s * 0.35);
      c.lineTo(cx, cy - s * 0.4);
      c.lineTo(cx + s * 0.5, cy + s * 0.35);
      c.closePath();
      c.fill();
      for (const dx of [-0.35, 0.4]) {
        c.beginPath();
        c.moveTo(cx + dx * s - s * 0.12, cy + s * 0.35);
        c.lineTo(cx + dx * s, cy - s * 0.05);
        c.lineTo(cx + dx * s + s * 0.12, cy + s * 0.35);
        c.closePath();
        c.fill();
      }
    },
    grenade(c, cx, cy, s, fg, bg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy + s * 0.08, s * 0.3, s * 0.36, 0, 0, Math.PI * 2);
      c.fill();
      c.fillRect(cx - s * 0.12, cy - s * 0.4, s * 0.24, s * 0.14);
      c.strokeStyle = fg;
      c.lineWidth = s * 0.05;
      c.beginPath();
      c.arc(cx + s * 0.22, cy - s * 0.36, s * 0.1, 0, Math.PI * 2);
      c.stroke();
      c.strokeStyle = bg;
      c.lineWidth = s * 0.03;
      for (const dy of [-0.08, 0.1, 0.28]) {
        c.beginPath();
        c.moveTo(cx - s * 0.28, cy + dy * s);
        c.lineTo(cx + s * 0.28, cy + dy * s);
        c.stroke();
      }
    },
    eye(c, cx, cy, s, fg, bg) {
      c.fillStyle = fg;
      c.beginPath();
      c.moveTo(cx - s * 0.5, cy);
      c.quadraticCurveTo(cx, cy - s * 0.4, cx + s * 0.5, cy);
      c.quadraticCurveTo(cx, cy + s * 0.4, cx - s * 0.5, cy);
      c.fill();
      c.fillStyle = bg;
      c.beginPath();
      c.arc(cx, cy, s * 0.14, 0, Math.PI * 2);
      c.fill();
    },
  };
  /**
   * Cover recipes. style: 'mag' (masthead band + art + price bubble), 'comic' (burst + big title),
   * 'hard' (cloth binding with gold frame), 'journal' (white academic), 'pamphlet' (civil-defence).
   */
