// play-inline-543 01 — girders
// Lines 14-143 of readable/play-inline-543.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const AR = G.arcade._;
  const W = 640,
    H = 480;
  // girders: x0,y0 → x1,y1 (surface line). index 0 = street level, 6 = the topping-out beam
  const GIRDERS = [
    [16, 466, 624, 456],
    [16, 396, 584, 408],
    [56, 340, 624, 328],
    [16, 272, 584, 284],
    [56, 216, 624, 204],
    [16, 142, 470, 150],
    [232, 86, 372, 86],
  ];
  // ladders: x, lower girder index, broken
  const LADDERS = [
    [560, 0, 0],
    [262, 0, 1],
    [92, 1, 0],
    [312, 1, 1],
    [532, 2, 0],
    [250, 2, 1],
    [102, 3, 0],
    [362, 3, 0],
    [440, 4, 0],
    [202, 4, 1],
    [338, 5, 0],
  ];
  const POWERUPS = [
    [500, 2],
    [150, 4],
  ];
  const MAX_KEGS = 14,
    MAX_SLAG = 3,
    DRUM_X = 30;

  const SPR = {
    stand: [
      ".yyy....",
      "yyyyy...",
      ".knkn...",
      "..kkk...",
      ".bbbbb..",
      "k.bbb.k.",
      "..b.b...",
      ".nn.nn..",
    ],
    walk: [
      ".yyy....",
      "yyyyy...",
      ".knkn...",
      "..kkk...",
      ".bbbbb..",
      "..bbbb..",
      ".b...b..",
      "nn...nn.",
    ],
    climb: [
      "k.yyy.k.",
      "k.yyy.k.",
      ".bbbbb..",
      "..bbb...",
      "..bbb...",
      "..b.b...",
      ".b..b...",
      ".n...n..",
    ],
    jump: [
      ".yyy....",
      "yyyyy.k.",
      ".knknk..",
      "..kkk...",
      "bbbbbb..",
      "..bbb...",
      ".b...b..",
      "n.....n.",
    ],
    foreman: [
      "..www...",
      ".wwwww..",
      ".knkn.k.",
      "..kkk.k.",
      ".ccccc..",
      "ccccccc.",
      ".ggggg..",
      "..g.g...",
    ],
    slag: [
      "........",
      "...yy...",
      "..yooy..",
      ".oryyro.",
      ".oooooo.",
      "oooooooo",
      "r.o..o.r",
      "........",
    ],
    hammer: [
      "ssssss..",
      "ssssss..",
      "ssssss..",
      "..nn....",
      "..nn....",
      "..nn....",
      "..nn....",
      "..nn....",
    ],
  };

  function gy(i, x) {
    const g = GIRDERS[i];
    return g[1] + ((g[3] - g[1]) * (x - g[0])) / (g[2] - g[0]);
  }
  function onGirderX(i, x) {
    const g = GIRDERS[i];
    return x >= g[0] && x <= g[2];
  }
  function downhill(i) {
    const g = GIRDERS[i];
    return g[3] > g[1] ? 1 : g[3] < g[1] ? -1 : 0;
  }
  const LAD = LADDERS.map((l) => ({
    x: l[0],
    g: l[1],
    broken: !!l[2],
    yB: gy(l[1], l[0]),
    yT: gy(l[1] + 1, l[0]),
  }));

