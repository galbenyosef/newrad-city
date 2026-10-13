// play-inline-592 02 — push
// Lines 16-318 of readable/play-inline-592.pretty.js (statement-aligned).
  const alive = (w) => K.alive(w);
  const join = (parts) => parts.filter(Boolean).join(" ");
  const S = (title, text, scene) => ({
    title,
    text,
    scene: scene || undefined,
    art: scene || null,
  });

  function noon(endingId) {
    const t = K.in().torch;
    if (endingId === "B") {
      if (t === "reclamation")
        return S(
          "NOON",
          "They came up the Waldorf stairs into a blue sky. The Long Noon was over. She called it the Second Dawn, and nobody argued theology.",
          "skyline",
        );
      return S(
        "NOON",
        "They came up into the same grey ash. She said it would do; the Light was never in the sky.",
        "skyline",
      );
    }
    if (endingId === "C") {
      if (t === "reclamation")
        return S(
          "NOON",
          "At noon the torch scrubbed the sky clean over a city with no one left to breathe it.",
          "liberty",
        );
      if (t === "selective")
        return S(
          "NOON",
          "At noon the torch counted the survivors. It didn't take long.",
          "liberty",
        );
      return null;
    }
    if (t === "reclamation")
      return S(
        "NOON",
        join([
          "At noon the sky turned blue.",
          alive("rocky")
            ? "Rocky said the word on the air and didn't apologise."
            : "Somebody on the old Radio City roof cried, and somebody else laughed at him, and then they both stopped.",
        ]),
        "skyline",
      );
    if (t === "selective")
      return S(
        "NOON",
        "At noon the torch did what it was told. The Neon went dark for good.",
        "liberty",
      );
    if (t === "charter")
      return S("NOON", "Nothing happened at noon, by design.", "liberty");
    if (t === "destroyed")
      return S("NOON", "There was no torch left to fire.", "liberty");
    return null;
  }

  function factions(endingId) {
    const m = K.flag("ms_crane");
    const out = [];
    if (!alive("crane"))
      out.push(
        "Liberty's garrison buried Colonel Crane facing the city he meant to sort.",
      );
    else if (m === "surrendered")
      out.push(
        "Colonel Crane surrendered his sidearm on Liberty and spent the spring writing his account of it, in triplicate.",
      );
    else
      out.push(
        "Colonel Crane went south on the last Continuity Rotorcraft, still filing reports.",
      );
    if (alive("hale"))
      out.push(
        "Lieutenant Hale opened a school in the Secretariat. Nobody there is asked for a card.",
      );
    else
      out.push(
        "Someone keeps leaving a library book on Vesper Hale's grave on Tudor Place.",
      );
    if (alive("stroud"))
      out.push(
        K.in().torch === "charter" || K.in().faction === "covenant"
          ? "Lancer-Commander Stroud held Rockefeller Center for the Charter."
          : "Lancer-Commander Stroud held Rockefeller Center and, for once, answered the mountain's recall: no.",
      );
    else
      out.push(
        "The Covenant buried Stroud under the gilded Prometheus, with his rank bars and without ceremony.",
      );
    if (alive("keel"))
      out.push(
        K.in().keel === "defects"
          ? "Major Keel read her 1968 ledger aloud in the Market and asked for no pardon."
          : "Major Keel kept her ledger, and her silence.",
      );
    if (alive("kong"))
      out.push(
        endingId === "B"
          ? "KONG waved the Long Walk out of the city from the observation deck, and roared until they were out of sight."
          : "KONG kept his telescope on Grand Central for a year, waiting for the sun lady to come out.",
      );
    else
      out.push(
        "The Empire State's observation deck belongs to the pigeons now.",
      );
    if (alive("kincaid"))
      out.push(
        "Captain Kincaid's Neon Guard kept the lights on in Times Square.",
      );
    else
      out.push("The Neon Guard named their night watch after Mercy Kincaid.");
    if (alive("lys"))
      out.push(
        "Mademoiselle Lys sent a postcard from a city she would not name. It said LUMIERE, and nothing else.",
      );
    if (alive("corbeau"))
      out.push("Corbeau sailed for Brest on the first spring tide.");
    if (!alive("lys") && !alive("corbeau"))
      out.push(
        "Bureau Sept's post under the Golden Dragon was bricked up. Nobody asked by whom.",
      );
    if (alive("delphine"))
      out.push(
        endingId === "B"
          ? 'Stationmaster Okafor reopened the lower level as "Dawn\'s Platform", and wound the concourse clock to the right time for the first time in twenty-two years.'
          : "Stationmaster Okafor wound the concourse clock to the right time, for the first time in twenty-two years.",
      );
    else
      out.push(
        "The Market elected a new stationmaster. The clock stayed stopped, for Delphine.",
      );
    if (alive("betty")) out.push("Bear Market Betty went long on candles.");
    if (alive("tony"))
      out.push(
        endingId === "B"
          ? "Tollbooth Tony charged the Long Walk a toll on the bridge and then, to everyone's surprise, waived it."
          : "Tollbooth Tony raised the bridge toll again.",
      );
    return S("FACTIONS", out.join(" "), "skyline");
  }

  function worldSlides() {
    const ms = K.msLib();
    if (!ms || typeof ms.worldSlides !== "function") return [];
    const ws = K.safe("worldSlides", () => ms.worldSlides()) || [];
    return ws.map((s) =>
      S(
        s.title,
        s.text,
        s.art &&
          /cryo|neon|liberty|cathedral|empire|bridge|radio|park|skyline/.test(
            s.art,
          )
          ? s.art
          : undefined,
      ),
    );
  }

  // ------------------------------------------------------------------
  // A — Kill Her: The Light Goes Out
  // ------------------------------------------------------------------
  function slidesA(v) {
    const f = K.fin(),
      i = K.in(),
      trust = i.roseTrust,
      out = [];
    const method = f.disarmed || K.flag("ms_disarm_method");
    out.push(
      S(
        "THE SECOND SUN",
        join([
          "At 09:46 the firing set went dark.",
          method === "zeke"
            ? '"Statue," Zeke said, and sat down on the floor.'
            : null,
          method === "rose"
            ? "Rose dialled the wheel to a word that meant nothing, and kept dialling long after it was safe."
            : null,
          method === "battery"
            ? K.heroFirst() +
              " carried the battery out himself; Doc Hollis spent a week on his blood."
            : null,
          method === "breaker"
            ? "The M42 main breaker was thrown for the first time since 1967, by a man who had been a records clerk."
            : null,
        ]),
        "cathedral",
      ),
    );
    out.push(
      S(
        "NICOLE MEAD",
        join([
          v === "A1"
            ? "He carried her up Track 61 himself."
            : v === "A2"
              ? "They carried her up together."
              : "Father and daughter came up Track 61 one at a time; he went back down for the second.",
          "She was buried in the Kindling Garden under the stone that already had her name on it. This time the ground was dug.",
        ]),
        "cathedral",
      ),
    );
    const g = [];
    if (K.mustered("lancers"))
      g.push(
        "The Lancers walked the tunnels with flamers for three days, and the Charter has a word for it.",
      );
    if (K.mustered("hale"))
      g.push(
        "Hale's people brought the children up and wrote every name in Wren's Register first.",
      );
    if (K.mustered("neon"))
      g.push("The Neon Guard gave the cathedral back to its saints.");
    if (!g.length) g.push("Leaderless, the cult drifted into the Ruins.");
    if (alive("hollowell"))
      g.push("Hollowell preached to the rats in the Tombs, gently.");
    if (i.childrenSent)
      g.push(
        "Noonday's children reached the river towns and never talk about the Dawn.",
      );
    out.push(S("THE GLOWKEEPERS", g.join(" "), "cathedral"));
    const covenant = i.torch === "charter" || i.faction === "covenant";
    if (covenant)
      out.push(
        S(
          "THE WEAPON",
          "The Covenant took SIROCCO 2 to the mountain Hold.",
          "skyline",
        ),
      );
    else if (alive("zeke") && (i.calloway || alive("calloway")))
      out.push(
        S(
          "THE WEAPON",
          "Zeke and Calloway dropped the core into M42's deepest flooded sump and poured the concrete. Calloway signed the form.",
          "cryo",
        ),
      );
    else if (alive("zeke"))
      out.push(
        S(
          "THE WEAPON",
          "Zeke dropped the core into M42's deepest flooded sump and poured the concrete himself, and filled in the form, because somebody had to.",
          "cryo",
        ),
      );
    else
      out.push(
        S(
          "THE WEAPON",
          "The core went into M42's deepest flooded sump under forty feet of concrete. The form was never filed.",
          "cryo",
        ),
      );
    const n = noon("A");
    if (n) out.push(n);
    for (const s of worldSlides()) out.push(s);
    out.push(factions("A"));
    let r;
    if (v === "A1")
      r =
        trust >= 3
          ? "Rose took the roof under the TUDOR CITY sign, and a father who cooks badly. She keeps the sign lit."
          : "Rose left by the Queensboro Bridge in April and didn't say goodbye.";
    else if (v === "A2")
      r =
        "Rose never fired a rifle again. She runs the Track 61 shelter Delphine reopened, and nobody there is asked for a card.";
    else
      r =
        "Rose is buried beside her mother. " +
        K.heroFirst() +
        " tends both stones.";
    out.push(S("ROSE", r, "cathedral"));
    out.push(
      S(
        K.heroFirst().toUpperCase(),
        "Every twentieth of February someone leaves a candle at a service door under the Municipal Building. Now it's him.",
        "cryo",
      ),
    );
    if (alive("rocky"))
      out.push(
        S(
          "ROCKY",
          '"This is Radio Free Manhattan. Keep the lights on, New Rad City. Somebody has to."',
          "radio",
        ),
      );
    return out;
  }

  // ------------------------------------------------------------------
  // B — Join Her: The Long Walk
  // ------------------------------------------------------------------
