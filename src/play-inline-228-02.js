// play-inline-228 02 — state
// Lines 22-72 of readable/play-inline-228.pretty.js (statement-aligned).
  const LI = G._li,
    Q = LI.q;
  const QID = "li_un_records";

  /** The player is the Continuity's "guest" (same rule as the UN Plaza truce) or has joined them.
   *  (Faction / flag ids below are the shared ids of src/quests.) */
  function guest() {
    if (!Q.live()) return false;
    if (
      Q.flag("con_hostile") ||
      Q.flag("li_keel_hostile") ||
      Q.flag("ending_played")
    )
      return false;
    return Q.active("mq04") || Q.flag("mq_faction") === "continuity";
  }
  LI.unGuest = guest;

  const state = { turretsOff: false };
  LI.saveHooks.un = {
    save: () => ({
      field: LI.unField ? LI.unField.on : true,
      turretsOff: state.turretsOff,
    }),
    load(d) {
      d = d || {};
      if (LI.setUnField) LI.setUnField(d.field !== false);
      state.turretsOff = !!d.turretsOff;
      applyTurrets(true);
    },
    reset() {
      if (LI.setUnField) LI.setUnField(true);
      state.turretsOff = false;
    },
  };

  function applyTurrets(force) {
    if (G.isStub("props") || !G.props.setTurrets) return;
    const want = state.turretsOff ? "off" : guest() ? "friendly" : "hostile";
    if (!force && want === state._turrets) return;
    state._turrets = want;
    try {
      G.props.setTurrets("li_un_sec", want);
    } catch (e) {
      /* */
    }
  }

  // ------------------------------------------------------------------
  // initDone: items, terminals, dialogue, quest, interactables, radiation
  // ------------------------------------------------------------------
