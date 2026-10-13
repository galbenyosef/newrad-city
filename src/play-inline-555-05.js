// play-inline-555 05 — tree
// Lines 1578-1613 of readable/play-inline-555.pretty.js (statement-aligned).
  L.hook("register", function () {
    // Extra response injected into Reyes' and Hollowell's trees at runtime: selling the Neon's battery.
    const addSell = (dlgId, nodeId, text, how, scrip, standing) => {
      const tree = L.DIALOGUES.get(dlgId);
      if (!tree || !tree.nodes[nodeId]) return;
      const rs = tree.nodes[nodeId].responses;
      if (!Array.isArray(rs) || rs.some((r) => r._neonSell)) return;
      rs.splice(rs.length - 1, 0, {
        _neonSell: true,
        text,
        cond: () => L.has("q_neon_core") && !L.flag("neon_core_resolved"),
        standing,
        action: () => {
          L.take("q_neon_core", 1);
          L.giveScrip(scrip);
          neonResolve(how);
        },
      });
    };
    addSell(
      "dlg_cov_reyes",
      "hello",
      "I have a rig battery to sell. (400 scrip)",
      "sold",
      400,
      -100,
    );
    addSell(
      "dlg_glow_ezra",
      "again",
      "I have the Neon's rig battery. Let the Neon sit in the dark. (250 scrip)",
      "glow",
      250,
      -150,
    );
  });
