// play-inline-6 03 — prevstate
// Lines 661-680 of readable/play-inline-6.pretty.js (statement-aligned).
  G.events.on("state", (s) => {
    if (s !== "cheats" && el) {
      el.remove();
      el = null;
    }
    updateBadge();
  });

  G.cheatMenu = {
    open,
    close,
    skipToOutside,
    _prevState: () => prevState,
    _detach() {
      if (el) {
        el.remove();
        el = null;
      }
    }, // bug reporter takes over the screen (state stays 'cheats')
  };
