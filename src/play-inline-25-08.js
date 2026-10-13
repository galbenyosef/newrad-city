// play-inline-25 08 — tail_of
// Lines 2211-2233 of readable/play-inline-25.pretty.js (statement-aligned).
  const TAIL_OF = {
    gun_pistol: "s",
    gun_smg: "s",
    gun_pipe: "s",
    gun_minigun: "s",
    gun_magnum: "m",
    gun_rifle: "m",
    gun_shotgun: "m",
    gun_hunting: "l",
    gun_sniper: "l",
    gun_recoilless: "l",
    gun_laser: "e",
    gun_gyrojet: "e",
    gun_rivet: "e",
  };
  Object.keys(TAIL_OF).forEach((n) => {
    const r = S.R[n];
    if (!r) return;
    const c = TAIL_OF[n];
    r.tail = c === "e" ? "s" : c;
    r.tailGain =
      c === "e" ? 0.45 : n === "gun_minigun" || n === "gun_smg" ? 0.7 : 1;
  });
