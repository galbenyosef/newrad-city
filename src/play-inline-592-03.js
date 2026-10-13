// play-inline-592 03 — out
// Lines 319-462 of readable/play-inline-592.pretty.js (statement-aligned).
  function slidesB(v) {
    const i = K.in(),
      out = [];
    out.push(
      S(
        "09:47",
        "Nothing happened. A hundred Glowkeepers heard their Dawn laugh for the first time anyone could remember.",
        "cathedral",
      ),
    );
    const n = noon("B");
    if (n) out.push(n);
    out.push(
      S(
        "THE WEAPON",
        join([
          "SIROCCO 2 was walled into M42 behind forty feet of concrete.",
          alive("zeke") ? "Zeke supervised;" : null,
          i.calloway || alive("calloway") ? "Calloway signed the form;" : null,
          alive("tinder")
            ? "Brother Tinder cried."
            : "Nobody cried; Tinder would have.",
        ]),
        "cryo",
      ),
    );
    out.push(
      S(
        "THE GLOWKEEPERS",
        join([
          "In April they left on foot, north along the Hudson. They teach the river towns to read a dosimeter and boil water, keep a candle for those who sleep, and never ask anyone for a card.",
          i.childrenSent ? "Noonday's children walked at the front." : null,
          alive("hollowell")
            ? "Hollowell kept St. Patrick's open to anyone."
            : null,
        ]),
        "cathedral",
      ),
    );
    out.push(
      S(
        "NICOLE",
        "She lived three more winters and walked every mile of them.",
        "park",
      ),
    );
    const r = {
      B1: "Rose walked with them, a rifle on her back that she never used, arguing doctrine with her mother every mile.",
      B2: "Rose stayed in the city and kept the sign lit. Her mother's letters came every month, signed with a sun.",
      B3: "Rose went west alone. Years later a letter came with only a twelve-ray sun on it. Nicole kept it in her robe until the end.",
    }[v];
    out.push(S("ROSE", r, "skyline"));
    out.push(
      S(
        K.heroFirst().toUpperCase(),
        "He never got used to the sky. It grew on him.",
        "park",
      ),
    );
    for (const s of worldSlides()) out.push(s);
    out.push(factions("B"));
    if (alive("rocky"))
      out.push(
        S(
          "ROCKY",
          "Rocky read a letter from the road on the air, signed with a twelve-ray sun and, under it, " +
            (v === "B1" ? "three names." : "two names.") +
            ' "Keep the lights on, New Rad City. Somebody has to."',
          "radio",
        ),
      );
    return out;
  }

  // ------------------------------------------------------------------
  // C — Join Her: The Second Sun
  // ------------------------------------------------------------------
  function slidesC(v) {
    const i = K.in(),
      out = [];
    out.push(
      S(
        "09:47",
        "On a Sunday morning, for the second time in twenty-two years, the sun rose twice over New York.",
        "skyline",
      ),
    );
    out.push(
      S(
        "FROM THE JERSEY SHORE",
        "Travellers saw it from forty miles out and turned their ox-carts round. In the river towns they call it the City That Burned Twice.",
        "bridge",
      ),
    );
    out.push(
      S(
        "THE MARKET",
        join([
          i.evacuation
            ? "Half of Grand Central had left on Rocky's word, and half is a lot of people."
            : "It was a Sunday. The market was full.",
          i.zekeFree && alive("zeke")
            ? "Zeke was at the Oyster Bar, on the stool with his name scratched in it."
            : null,
        ]),
        "skyline",
      ),
    );
    out.push(
      S(
        "RADIO FREE MANHATTAN",
        "Radio Free Manhattan went off the air at 09:47. The good song was playing.",
        "radio",
      ),
    );
    const n = noon("C");
    if (n) out.push(n);
    out.push(
      S(
        "ROSE",
        v === "C1"
          ? "A girl walked out of the Harlem portal of the Park Avenue tunnel that afternoon. She has never told anyone her name. She lights no candles."
          : "There was a cradle in the Sun Room, and for a moment, at the end, there were three people beside it.",
        "park",
      ),
    );
    out.push(
      S(
        "THE GLOWKEEPERS",
        i.childrenSent
          ? "Upriver, a few dozen children carried the Book of the Kindling north. They tell it as a love story."
          : "Nobody carried the Book anywhere.",
        "cathedral",
      ),
    );
    out.push(S("", "Nobody was ever chosen again.", "skyline"));
    return out;
  }

  K.epilogue = function (variant) {
    const v = variant || K.fin().variant || "A1";
    const e = v[0];
    return e === "A" ? slidesA(v) : e === "B" ? slidesB(v) : slidesC(v);
  };
