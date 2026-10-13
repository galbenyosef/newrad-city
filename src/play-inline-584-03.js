// play-inline-584 03 — done
// Lines 762-771 of readable/play-inline-584.pretty.js (statement-aligned).
  QX.selfTest = run;

  if (ON) {
    let done = false;
    G.events.on("newGame", () => {
      if (done) return;
      done = true;
      QX.later(0.5, run);
    });
  }
