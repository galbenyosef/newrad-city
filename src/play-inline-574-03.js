// play-inline-574 03 — src
// Lines 405-421 of readable/play-inline-574.pretty.js (statement-aligned).
  function personalise() {
    if (!QX.live("items") || !G.items.get) return;
    const nm = QX.pname();
    for (const src of DEFS) {
      if (!/\{NAME\}/.test((src.text || "") + (src.title || ""))) continue;
      const d = G.items.get(src.id);
      if (!d) continue;
      if (src.text)
        d.text = src.text
          .split("{NAME}")
          .join(src.id === "qx_citation" ? nm.toUpperCase() : nm);
      if (src.title) d.title = src.title.split("{NAME}").join(nm);
    }
  }
  QX.hook("spawn", personalise);

  QX.ITEM_IDS = DEFS.map((d) => d.id);
