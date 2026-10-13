// play-inline-553 10 — the
// Lines 2843-2976 of readable/play-inline-553.pretty.js (statement-aligned).
  L.companionSlides = function (choice, N) {
    const out = [];
    const f = (x) => L.flag(x);
    // Malone
    const m = st("malone");
    if (m.hired || f("malone_quest_done")) {
      let t;
      if (choice === "selective")
        t =
          '"Gentleman" Jim Malone was at the end of the bar in the Neon when the torch turned sour. He had never been enrolled; in March \'67 he was in a burn ward when the census men came round. It did not matter how many rounds he had gone; the census did not go the distance. It never has to.';
      else if (m.left)
        t =
          '"Gentleman" Jim Malone walked away from ' +
          N +
          " the day he decided the sleeper from Cryo Unit C-9 had become a monster. He went back to the end of the bar in the Neon and never spoke the name again, not even for money.";
      else if (f("malone_belt_given"))
        t =
          '"Gentleman" Jim Malone hung the Garden championship belt over the bar at the Rad-Lounge, with a name finally scratched into the plate: DANNY KEARNS. He opened a boxing gym under Times Square, where Neon kids and topsider kids learned to keep their chins down and their hands up. He never took another paid job.';
      else if (f("malone_belt_kept") || f("malone_belt_sold"))
        t =
          '"Gentleman" Jim Malone went back to selling his fists by the hour. When anybody asked about the Garden, he said the fight was never finished, and changed the subject. ' +
          (f("malone_belt_kept")
            ? "The belt turned up years later in a Brooklyn pawn shop."
            : "");
      else
        t =
          '"Gentleman" Jim Malone kept walking the Ruins for scrip, a heavyweight without a title. Somewhere west of 7th Avenue, a Maniac in shamrock trunks is still throwing hooks at nothing, still waiting for round seven.';
      if (m.rec && choice !== "selective")
        t +=
          " He was standing beside " +
          N +
          " at the foot of Liberty when the torch lit, hands up, chin down, as always.";
      out.push({ title: "JIM MALONE", text: t, art: "companion" });
    }
    // Tull
    const t0 = st("tull");
    if (t0.hired || f("tull_library") || f("tull_press_kept")) {
      let t;
      if (t0.left)
        t =
          "Ambrose Tull finished his account of his travels with " +
          N +
          " and then, for the first time in his life, burned a book. He went back to his bench in Grand Central and copied water-purification manuals for anyone who asked, and never wrote about the sleeper again.";
      else if (f("tull_library")) {
        t =
          "The Grand Central Free Reading Room printed its ten-thousandth book in 1999. Ambrose Tull taught half of Manhattan to read, and the other half to argue about what they had read. ";
        t +=
          choice === "covenant" || L.flag("mq_faction") === "covenant"
            ? "In time the Iron Covenant quietly reinstated him, rank and sigil. He sewed the sigil on the inside of his robe, where only he could see it."
            : "The Iron Covenant never forgave him. He never asked them to.";
      } else if (f("tull_press_kept"))
        t =
          "Ambrose Tull never got his library. He copied books by hand on a bench in Grand Central until his eyes gave out, and then he dictated them to children, who wrote them down wrong, beautifully.";
      else
        t =
          "Ambrose Tull catalogued every ruin, machine and marvel he saw at " +
          N +
          '\'s side. The manuscript, "A Field Guide to Manhattan, Annotated," is still passed from hand to hand in the markets. Nobody has ever found the end of the footnotes.';
      out.push({ title: "AMBROSE TULL", text: t, art: "companion" });
    }
    // Rook
    const r = st("rook");
    if (r.hired || f("rook_paid") || f("rook_stolen") || f("rook_lied")) {
      let t;
      if (f("rook_stolen"))
        t =
          "Rook put a price on " +
          N +
          "'s head: three hundred and twelve scrip, the exact amount. Nobody ever collected. Some say she never really wanted them to.";
      else if (r.left)
        t =
          "Rook went back under the Washington Square Arch and told anyone who'd listen that " +
          N +
          ' had "gone saint." She meant it as the worst insult she knew. Chess Charlie swears she sounded sad about it.';
      else if (f("rook_lied"))
        t =
          "Rook found out about the lockbox three years later, from a fence in Brooklyn who had the skull-painted box on his shelf. She laughed until she cried, then she robbed him. She never said a word to " +
          N +
          " about it. She didn't have to.";
      else if (f("rook_paid"))
        t =
          "With her severance paid, Rook bought the Woolworth Building's ground floor outright — at knifepoint, but still. She ran the most honest dishonest crew in Lower Manhattan: they only robbed people who could afford it, and they always paid their own.";
      else
        t =
          "Rook stayed as sharp as her knives. She drifted between crews and cities, and never stayed anywhere long — except, for a while, at the side of the sleeper from Cryo Unit C-9.";
      out.push({ title: "ROOK", text: t, art: "companion" });
    }
    return out;
  };

  // ------------------------------------------------------------------
  // Debug
  // ------------------------------------------------------------------
  G.quests.debug.companion = function (k, opts) {
    k = k || "malone";
    const a = actor(k);
    if (!a) return "no actor";
    if (opts === "tp") {
      const p = a.pos;
      G.player.teleport(p.x + 1.5, p.y, p.z + 1.5, 0);
      return "tp";
    }
    if (opts === "recruit") {
      for (const o of KEYS) if (o !== k && st(o).rec) release(o, "dismiss");
      recruit(k, "debug");
      return "recruited";
    }
    const s = st(k);
    return {
      rec: s.rec,
      wait: s.wait,
      far: s.far,
      melee: s.melee,
      passive: s.passive,
      weapon: a.weaponId,
      state: a.state,
      dist: +a.distToPlayer().toFixed(1),
      inv: s.inv,
    };
  };
  L.companions = {
    dbg: () => ({ farewellFor, tickT, slowT }),
    cfg,
    st,
    current,
    following,
    recruit,
    release,
    doWait,
    doFollow,
    openInventory,
    ensureWeapon,
    KEYS,
  };
