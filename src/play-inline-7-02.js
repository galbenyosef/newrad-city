// play-inline-7 02 — mobile
// Lines 18-24 of readable/play-inline-7.pretty.js (statement-aligned).
  const ua = navigator.userAgent;
  const mobile =
    /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle/i.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) || // iPadOS reports itself as a Mac
    (matchMedia("(pointer: coarse)").matches &&
      !matchMedia("(any-pointer: fine)").matches);
  G.isMobileDevice = mobile;
