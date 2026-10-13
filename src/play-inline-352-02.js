// play-inline-352 02 — location
// Lines 26-31 of readable/play-inline-352.pretty.js (statement-aligned).
  let on = false;
  try {
    on = new URLSearchParams(location.search).has("pcprobe");
  } catch (e) {
    /* */
  }
