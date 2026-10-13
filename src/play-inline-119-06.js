// play-inline-119 06 — news
// Lines 1154-1188 of readable/play-inline-119.pretty.js (statement-aligned).
  const NEWS = {
    items: [
      "THE NEON: ALL FOLKS WELCOME · NO CENSUS, NO CARDS",
      "CONVOY IN FROM GRAND CENTRAL AT 07:30 · MIND THE OXEN",
      'NEON OPRY: "NEON NIGHTS" — NIGHTLY AT 8, 10 SCRIP',
      "GUARD CAPTAIN KINCAID: HOLSTER IT OR LOSE IT",
      "DOC BROADWAY: BURNS DRESSED WHILE-U-WAIT",
      "WEATHER: DUST, THEN MORE DUST · RADS MODERATE",
      'LOST: ONE PACK OX, ONE HORN, ANSWERS TO "GERALD"',
    ],
    player: [],
    version: 0,
  };
  function pushNews(t, player) {
    if (!t) return;
    t = String(t)
      .replace(/\{[^}]*\}/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
    if (!t) return;
    if (t.length > 110) t = t.slice(0, 107) + "…";
    const arr = player ? NEWS.player : NEWS.items;
    if (arr.indexOf(t) >= 0) return;
    arr.push(t);
    if (arr.length > 8) arr.shift();
    NEWS.version++;
  }
  function headlines() {
    return NEWS.player.slice().reverse().concat(NEWS.items);
  }

  // ------------------------------------------------------------------
  // BUILD (called from 40_times_square.js)
  // ------------------------------------------------------------------
