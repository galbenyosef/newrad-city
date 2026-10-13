// play-inline-19 08 — stroke
// Lines 2345-3180 of readable/play-inline-19.pretty.js (statement-aligned).
  const ICONS = {
    injector(c) {
      c.save();
      c.translate(64, 64);
      c.rotate(-Math.PI / 4);
      c.strokeRect(-12, -40, 24, 66);
      L(c, [
        [-6, -40],
        [-6, -50],
        [6, -50],
        [6, -40],
      ]);
      L(c, [
        [0, 26],
        [0, 46],
      ]);
      L(c, [
        [-12, -12],
        [12, -12],
      ]);
      L(c, [
        [0, -24],
        [0, 0],
      ]);
      L(c, [
        [-9, -12],
        [9, -12],
      ]);
      c.restore();
    },
    rally_tonic(c) {
      c.beginPath();
      c.moveTo(56, 14);
      c.lineTo(72, 14);
      c.lineTo(72, 34);
      c.quadraticCurveTo(94, 42, 94, 62);
      c.lineTo(94, 110);
      c.lineTo(34, 110);
      c.lineTo(34, 62);
      c.quadraticCurveTo(34, 42, 56, 34);
      c.closePath();
      c.stroke();
      c.strokeRect(42, 64, 44, 30);
      L(c, [
        [64, 70],
        [64, 88],
      ]);
      L(c, [
        [55, 79],
        [73, 79],
      ]);
    },
    prussian_blue(c) {
      c.beginPath();
      c.moveTo(52, 18);
      c.lineTo(76, 18);
      c.lineTo(76, 18);
      c.lineTo(76, 36);
      c.quadraticCurveTo(96, 44, 96, 64);
      c.lineTo(96, 104);
      c.lineTo(32, 104);
      c.lineTo(32, 64);
      c.quadraticCurveTo(32, 44, 52, 36);
      c.closePath();
      c.stroke();
      X.trefoil(c, 64, 76, 14, ICOL);
    },
    iodine_tabs(c) {
      c.beginPath();
      c.roundRect ? c.roundRect(40, 34, 48, 74, 8) : c.rect(40, 34, 48, 74);
      c.stroke();
      c.strokeRect(36, 20, 56, 16);
      L(c, [
        [52, 60],
        [76, 60],
      ]);
      L(c, [
        [64, 60],
        [64, 88],
      ]);
      L(c, [
        [52, 88],
        [76, 88],
      ]);
    },
    morphine(c) {
      c.save();
      c.translate(64, 64);
      c.rotate(Math.PI / 4);
      c.strokeRect(-8, -36, 16, 48);
      L(c, [
        [0, 12],
        [0, 40],
      ]);
      L(c, [
        [-14, -36],
        [14, -36],
      ]);
      c.beginPath();
      c.arc(0, -46, 8, 0, TAU);
      c.stroke();
      c.restore();
    },
    focus_pills(c) {
      c.beginPath();
      c.ellipse(48, 64, 22, 12, -0.6, 0, TAU);
      c.stroke();
      L(c, [
        [36, 74],
        [60, 54],
      ]);
      c.beginPath();
      c.arc(84, 70, 14, 0, TAU);
      c.stroke();
      c.beginPath();
      c.arc(84, 70, 5, 0, TAU);
      c.stroke();
    },
    bull_tabs(c) {
      c.beginPath();
      c.arc(64, 70, 30, 0, TAU);
      c.stroke();
      L(c, [
        [38, 50],
        [24, 30],
        [46, 42],
      ]);
      L(c, [
        [90, 50],
        [104, 30],
        [82, 42],
      ]);
      L(c, [
        [52, 84],
        [76, 84],
      ]);
    },
    rush(c) {
      c.strokeRect(46, 30, 36, 74);
      L(c, [
        [46, 30],
        [56, 16],
        [72, 16],
        [82, 30],
      ]);
      L(c, [
        [58, 50],
        [70, 62],
        [58, 74],
        [70, 86],
      ]);
    },
    rage(c) {
      c.strokeRect(40, 40, 48, 64);
      L(c, [
        [48, 40],
        [48, 28],
        [80, 28],
        [80, 40],
      ]);
      L(c, [
        [52, 60],
        [62, 70],
      ]);
      L(c, [
        [76, 60],
        [66, 70],
      ]);
      L(c, [
        [54, 88],
        [74, 88],
      ]);
    },
    shade_field(c) {
      c.beginPath();
      c.arc(64, 64, 36, 0, TAU);
      c.stroke();
      c.setLineDash ? c.setLineDash([8, 8]) : 0;
      c.beginPath();
      c.arc(64, 64, 22, 0, TAU);
      c.stroke();
      c.setLineDash ? c.setLineDash([]) : 0;
      L(c, [
        [64, 28],
        [64, 14],
      ]);
    },
    fizzo_cola(c) {
      c.beginPath();
      c.moveTo(58, 14);
      c.lineTo(70, 14);
      c.lineTo(70, 40);
      c.quadraticCurveTo(82, 48, 82, 58);
      c.lineTo(82, 112);
      c.lineTo(46, 112);
      c.lineTo(46, 58);
      c.quadraticCurveTo(46, 48, 58, 40);
      c.closePath();
      c.stroke();
      for (let k = 0; k < 4; k++)
        L(c, [
          [46, 72 + k * 10],
          [82, 72 + k * 10],
        ]);
    },
    fizzo_blue(c) {
      ICONS.fizzo_cola(c);
      for (const x of [30, 98])
        L(c, [
          [x, 60],
          [x, 90],
        ]);
    },
    scrip(c) {
      L(
        c,
        [
          [22, 40],
          [94, 30],
          [106, 84],
          [34, 94],
        ],
        true,
      );
      L(c, [
        [58, 35],
        [70, 89],
      ]);
      c.beginPath();
      c.arc(84, 58, 9, 0, TAU);
      c.stroke();
      L(c, [
        [30, 54],
        [50, 51],
      ]);
      L(c, [
        [32, 66],
        [52, 63],
      ]);
    },
    ammo(c) {
      for (let k = 0; k < 3; k++) {
        const x = 38 + k * 22;
        c.beginPath();
        c.moveTo(x, 100);
        c.lineTo(x, 50);
        c.quadraticCurveTo(x + 7, 26, x + 14, 50);
        c.lineTo(x + 14, 100);
        c.closePath();
        c.stroke();
        L(c, [
          [x, 60],
          [x + 14, 60],
        ]);
      }
    },
    pistol(c) {
      L(
        c,
        [
          [20, 46],
          [104, 46],
          [104, 60],
          [58, 60],
          [52, 96],
          [34, 96],
          [40, 60],
          [20, 60],
        ],
        true,
      );
      L(c, [
        [58, 60],
        [64, 74],
        [52, 74],
      ]);
    },
    rifle(c) {
      L(
        c,
        [
          [8, 70],
          [30, 60],
          [70, 58],
          [120, 56],
          [120, 62],
          [70, 66],
          [60, 76],
          [30, 76],
          [8, 84],
        ],
        true,
      );
      c.strokeRect(50, 46, 30, 8);
    },
    shotgun(c) {
      L(
        c,
        [
          [8, 72],
          [34, 62],
          [118, 60],
          [118, 70],
          [40, 72],
          [30, 82],
          [8, 86],
        ],
        true,
      );
      L(c, [
        [60, 70],
        [90, 70],
      ]);
    },
    laser(c) {
      L(
        c,
        [
          [20, 50],
          [96, 50],
          [110, 56],
          [96, 62],
          [56, 62],
          [50, 94],
          [34, 94],
          [40, 62],
          [20, 62],
        ],
        true,
      );
      for (let k = 0; k < 3; k++)
        L(c, [
          [62 + k * 10, 50],
          [62 + k * 10, 62],
        ]);
    },
    plasma(c) {
      c.beginPath();
      c.arc(64, 56, 16, 0, TAU);
      c.stroke();
      L(c, [
        [20, 56],
        [48, 56],
      ]);
      L(c, [
        [80, 56],
        [112, 56],
      ]);
      L(c, [
        [50, 70],
        [44, 98],
        [30, 98],
        [38, 66],
      ]);
    },
    recoilless_rifle(c) {
      c.save();
      c.translate(64, 64);
      c.rotate(-Math.PI / 5);
      c.strokeRect(-46, -12, 92, 24);
      L(c, [
        [-20, 12],
        [-30, 40],
      ]);
      L(c, [
        [10, 12],
        [20, 40],
      ]);
      c.restore();
    },
    recoilless_round(c) {
      c.beginPath();
      c.moveTo(64, 14);
      c.quadraticCurveTo(88, 34, 86, 76);
      c.lineTo(42, 76);
      c.quadraticCurveTo(40, 34, 64, 14);
      c.closePath();
      c.stroke();
      c.strokeRect(54, 76, 20, 16);
      L(c, [
        [44, 112],
        [54, 92],
        [74, 92],
        [84, 112],
      ]);
    },
    grenade(c) {
      c.beginPath();
      c.ellipse(60, 74, 24, 30, 0, 0, TAU);
      c.stroke();
      c.strokeRect(52, 34, 16, 12);
      c.beginPath();
      c.arc(80, 36, 10, 0, TAU);
      c.stroke();
      for (let k = 0; k < 3; k++)
        L(c, [
          [38, 62 + k * 12],
          [82, 62 + k * 12],
        ]);
    },
    mine(c) {
      c.beginPath();
      c.ellipse(64, 76, 42, 16, 0, 0, TAU);
      c.stroke();
      c.beginPath();
      c.ellipse(64, 66, 18, 8, 0, 0, TAU);
      c.stroke();
      L(c, [
        [64, 58],
        [64, 44],
      ]);
    },
    knife(c) {
      L(
        c,
        [
          [20, 100],
          [44, 76],
          [52, 84],
          [28, 108],
        ],
        true,
      );
      L(c, [
        [44, 76],
        [100, 20],
        [104, 24],
        [56, 84],
      ]);
      L(c, [
        [38, 70],
        [58, 90],
      ]);
    },
    bat(c) {
      c.save();
      c.translate(64, 64);
      c.rotate(-Math.PI / 4);
      c.beginPath();
      c.moveTo(-50, -4);
      c.lineTo(10, -8);
      c.quadraticCurveTo(52, -14, 52, 0);
      c.quadraticCurveTo(52, 14, 10, 8);
      c.lineTo(-50, 4);
      c.closePath();
      c.stroke();
      c.restore();
    },
    armor(c) {
      L(
        c,
        [
          [40, 24],
          [30, 30],
          [22, 60],
          [36, 64],
          [38, 106],
          [90, 106],
          [92, 64],
          [106, 60],
          [98, 30],
          [88, 24],
          [76, 32],
          [52, 32],
        ],
        true,
      );
      L(c, [
        [64, 32],
        [64, 106],
      ]);
    },
    helmet(c) {
      c.beginPath();
      c.arc(64, 70, 38, Math.PI, 0);
      c.lineTo(110, 78);
      c.lineTo(18, 78);
      c.closePath();
      c.stroke();
      L(c, [
        [40, 70],
        [88, 70],
      ]);
    },
    exo_rig(c) {
      c.strokeRect(36, 30, 56, 50);
      c.strokeRect(46, 44, 36, 14);
      L(c, [
        [36, 80],
        [44, 104],
        [84, 104],
        [92, 80],
      ]);
      c.beginPath();
      c.arc(54, 51, 5, 0, TAU);
      c.arc(74, 51, 5, 0, TAU);
      c.stroke();
    },
    food(c) {
      c.beginPath();
      c.moveTo(34, 40);
      c.lineTo(34, 100);
      c.ellipse(64, 100, 30, 10, 0, Math.PI, 0, true);
      c.lineTo(94, 40);
      c.stroke();
      c.beginPath();
      c.ellipse(64, 40, 30, 10, 0, 0, TAU);
      c.stroke();
      L(c, [
        [34, 60],
        [94, 60],
      ]);
      L(c, [
        [34, 84],
        [94, 84],
      ]);
    },
    water(c) {
      c.beginPath();
      c.moveTo(64, 18);
      c.bezierCurveTo(30, 60, 30, 104, 64, 104);
      c.bezierCurveTo(98, 104, 98, 60, 64, 18);
      c.stroke();
    },
    chem(c) {
      c.beginPath();
      c.moveTo(54, 20);
      c.lineTo(54, 50);
      c.lineTo(30, 100);
      c.lineTo(98, 100);
      c.lineTo(74, 50);
      c.lineTo(74, 20);
      c.stroke();
      L(c, [
        [46, 20],
        [82, 20],
      ]);
      L(c, [
        [40, 80],
        [88, 80],
      ]);
    },
    book(c) {
      L(
        c,
        [
          [64, 30],
          [20, 22],
          [20, 96],
          [64, 104],
          [108, 96],
          [108, 22],
        ],
        true,
      );
      L(c, [
        [64, 30],
        [64, 104],
      ]);
    },
    tape_reel(c) {
      for (const x of [42, 86]) {
        c.beginPath();
        c.arc(x, 60, 22, 0, TAU);
        c.stroke();
        c.beginPath();
        c.arc(x, 60, 6, 0, TAU);
        c.stroke();
      }
      L(c, [
        [42, 82],
        [86, 82],
      ]);
      L(c, [
        [20, 100],
        [108, 100],
      ]);
    },
    note(c) {
      L(
        c,
        [
          [34, 18],
          [80, 18],
          [96, 34],
          [96, 110],
          [34, 110],
        ],
        true,
      );
      for (let k = 0; k < 5; k++)
        L(c, [
          [44, 44 + k * 13],
          [86, 44 + k * 13],
        ]);
    },
    key(c) {
      c.beginPath();
      c.arc(40, 64, 16, 0, TAU);
      c.stroke();
      L(c, [
        [56, 64],
        [108, 64],
        [108, 78],
      ]);
      L(c, [
        [92, 64],
        [92, 76],
      ]);
    },
    keycard(c) {
      c.beginPath();
      c.roundRect ? c.roundRect(24, 34, 80, 56, 8) : c.rect(24, 34, 80, 56);
      c.stroke();
      L(c, [
        [24, 50],
        [104, 50],
      ]);
      c.strokeRect(34, 62, 20, 16);
      L(c, [
        [64, 70],
        [92, 70],
      ]);
    },
    junk(c) {
      c.beginPath();
      c.arc(50, 70, 20, 0, TAU);
      c.stroke();
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        L(c, [
          [50 + Math.cos(a) * 20, 70 + Math.sin(a) * 20],
          [50 + Math.cos(a) * 27, 70 + Math.sin(a) * 27],
        ]);
      }
      L(c, [
        [74, 30],
        [104, 100],
      ]);
      L(c, [
        [84, 26],
        [110, 88],
      ]);
    },
    worlds_fair_medallion(c) {
      c.beginPath();
      c.arc(64, 64, 42, 0, TAU);
      c.stroke();
      c.beginPath();
      c.arc(64, 64, 20, 0, TAU);
      c.stroke();
      c.beginPath();
      c.ellipse(64, 64, 8, 20, 0, 0, TAU);
      c.stroke();
      c.beginPath();
      c.ellipse(64, 64, 32, 10, -0.4, 0, TAU);
      c.stroke();
    },
    cryo(c) {
      c.beginPath();
      c.arc(64, 64, 46, 0, TAU);
      c.stroke();
      NEON_ICONS.snowflake(c, 64, 64, 30);
      c.stroke();
    },
    settlement(c) {
      L(
        c,
        [
          [20, 104],
          [20, 60],
          [64, 26],
          [108, 60],
          [108, 104],
        ],
        true,
      );
      c.strokeRect(54, 76, 20, 28);
    },
    landmark(c) {
      L(
        c,
        [
          [64, 14],
          [78, 44],
          [78, 110],
          [50, 110],
          [50, 44],
        ],
        true,
      );
      L(c, [
        [50, 64],
        [78, 64],
      ]);
      L(c, [
        [50, 84],
        [78, 84],
      ]);
    },
    skull(c) {
      NEON_ICONS.skull(c, 64, 60, 40);
      c.stroke();
    },
    radiation(c) {
      X.trefoil(c, 64, 64, 40, ICOL);
    },
    quest(c) {
      c.beginPath();
      c.moveTo(64, 110);
      c.lineTo(36, 54);
      c.arc(64, 44, 30, Math.PI * 0.8, Math.PI * 0.2);
      c.closePath();
      c.stroke();
      c.beginPath();
      c.arc(64, 44, 10, 0, TAU);
      c.stroke();
    },
    marker(c) {
      ICONS.quest(c);
    },
    talent(c) {
      X.starPath(c, 64, 64, 44, 18, 5);
      c.stroke();
    },
    vigil(c) {
      for (const x of [42, 86]) {
        c.beginPath();
        c.arc(x, 64, 20, 0, TAU);
        c.stroke();
      }
      L(c, [
        [62, 64],
        [66, 64],
      ]);
      L(c, [
        [22, 60],
        [10, 50],
      ]);
      L(c, [
        [106, 60],
        [118, 50],
      ]);
      c.strokeRect(30, 32, 22, 10);
    },
    lantern_battery(c) {
      c.strokeRect(36, 30, 56, 76);
      c.strokeRect(46, 20, 10, 10);
      c.strokeRect(72, 20, 10, 10);
      L(c, [
        [64, 46],
        [54, 68],
        [72, 68],
        [62, 92],
      ]);
    },
    rig_battery(c) {
      c.beginPath();
      c.arc(64, 64, 34, 0, TAU);
      c.stroke();
      c.strokeRect(54, 22, 20, 12);
      L(c, [
        [64, 44],
        [56, 64],
        [70, 64],
        [62, 84],
      ]);
    },
    gyrojet(c) {
      ICONS.pistol(c);
      for (let k = 0; k < 3; k++) {
        c.beginPath();
        c.arc(70 + k * 12, 53, 2, 0, TAU);
        c.stroke();
      }
    },
    sneak(c) {
      c.beginPath();
      c.moveTo(14, 64);
      c.quadraticCurveTo(64, 20, 114, 64);
      c.quadraticCurveTo(64, 108, 14, 64);
      c.stroke();
      c.beginPath();
      c.arc(64, 64, 16, 0, TAU);
      c.stroke();
    },
    missile(c) {
      c.save();
      c.translate(64, 64);
      c.rotate(-Math.PI / 4);
      L(
        c,
        [
          [-44, -8],
          [30, -8],
          [48, 0],
          [30, 8],
          [-44, 8],
        ],
        true,
      );
      L(c, [
        [-44, -8],
        [-54, -18],
        [-54, 18],
        [-44, 8],
      ]);
      c.restore();
    },
    melee(c) {
      ICONS.bat(c);
    },
    apparel(c) {
      ICONS.armor(c);
    },
    aid(c) {
      c.strokeRect(24, 36, 80, 64);
      L(c, [
        [64, 50],
        [64, 86],
      ]);
      L(c, [
        [46, 68],
        [82, 68],
      ]);
      L(c, [
        [50, 36],
        [50, 26],
        [78, 26],
        [78, 36],
      ]);
    },
    misc(c) {
      ICONS.junk(c);
    },
  };
