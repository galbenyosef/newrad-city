// play-inline-33 02 — tok
// Lines 382-665 of readable/play-inline-33.pretty.js (statement-aligned).
  function spellNumber(s) {
    const n = parseInt(s, 10);
    if (!(n >= 0)) return s;
    const two = (x) =>
      x < 10
        ? NUM[x]
        : x < 20
          ? TEENS[x]
          : TENS[(x / 10) | 0] + (x % 10 ? " " + NUM[x % 10] : "");
    if (n < 100) return two(n);
    const hundreds = (x) =>
      x >= 100
        ? NUM[(x / 100) | 0] + " hundred" + (x % 100 ? " " + two(x % 100) : "")
        : two(x);
    if (n >= 1000 && n < 1e6 && !(n >= 1100 && n < 2100 && n % 1000))
      return (
        hundreds((n / 1000) | 0) +
        " thousand" +
        (n % 1000 ? " " + hundreds(n % 1000) : "")
      );
    if (s.length === 4)
      return (
        two((n / 100) | 0) +
        " " +
        (n % 100 === 0
          ? "hundred"
          : n % 100 < 10
            ? "oh " + NUM[n % 100]
            : two(n % 100))
      );
    if (n < 1000)
      return (
        NUM[(n / 100) | 0] + " hundred" + (n % 100 ? " " + two(n % 100) : "")
      );
    return s
      .split("")
      .map((d) => NUM[+d] || "")
      .join(" ");
  }

  // ------------------------------------------------------------------
  // Grapheme → phone rules (rough, digraph-aware English)
  // Returns [{p:'AE'|phone, k:'V'|'D'|cons, v:[vowel(s)]}] per word.
  // ------------------------------------------------------------------
  // Common irregular words (the rules get these badly wrong). Lowercase = vowel (a-b = diphthong), upper = consonant.
  const EXC = {
    the: "DH schwa",
    a: "schwa",
    i: "a-ih",
    you: "Y oo",
    to: "T oo",
    do: "D oo",
    of: "uh V",
    one: "W uh N",
    two: "T oo",
    are: "a R",
    was: "W uh Z",
    is: "ih Z",
    what: "W uh T",
    your: "Y o R",
    our: "a-uu R",
    said: "S e D",
    have: "H ae V",
    be: "B i",
    he: "H i",
    we: "W i",
    me: "M i",
    she: "SH i",
    they: "DH e-ih",
    there: "DH e R",
    where: "W e R",
    here: "H i R",
    who: "H oo",
    new: "N oo",
    york: "Y o R K",
    radio: "R e-ih D i o-uu",
    manhattan: "M ae N H ae T schwa N",
    america: "schwa M e R ih K schwa",
    american: "schwa M e R ih K schwa N",
    people: "P i P schwa L",
    friends: "F R e N D Z",
    good: "G uu D",
    could: "K uu D",
    would: "W uu D",
    should: "SH uu D",
    from: "F R uh M",
    some: "S uh M",
    come: "K uh M",
    done: "D uh N",
    love: "L uh V",
    only: "o-uu N L i",
    any: "e N i",
    many: "M e N i",
    been: "B ih N",
    theres: "DH e R Z",
    music: "M ih-oo Z ih K",
    world: "W er L D",
    city: "S ih T i",
    listening: "L ih S schwa N ih NG",
    tech: "T e K",
    president: "P R e Z ih D schwa N T",
    station: "S T e-ih SH schwa N",
    broadcast: "B R aw D K ae S T",
    mister: "M ih S T er",
    ok: "o-uu K e-ih",
    okay: "o-uu K e-ih",
    oh: "o-uu",
    hey: "H e-ih",
    so: "S o-uu",
    no: "N o-uu",
    go: "G o-uu",
    my: "M a-ih",
  };
  // More irregular words (lyrics and patter) the spelling rules mangle. Apostrophes are stripped before lookup.
  Object.assign(EXC, {
    above: "schwa B uh V",
    all: "aw L",
    alone: "schwa L o-uu N",
    among: "schwa M uh NG",
    anyway: "e N i W e-ih",
    around: "schwa R a-uu N D",
    atomic: "schwa T a M ih K",
    away: "schwa W e-ih",
    before: "B ih F o R",
    bomb: "B a M",
    bombs: "B a M Z",
    boogie: "B uu G i",
    bowl: "B o-uu L",
    breath: "B R e TH",
    broadway: "B R aw D W e-ih",
    bury: "B e R i",
    by: "B a-ih",
    call: "K aw L",
    chase: "T SH e-ih S",
    chorus: "K o R schwa S",
    chryslers: "K R a-ih S L er Z",
    chrysler: "K R a-ih S L er",
    citys: "S ih T i Z",
    close: "K L o-uu S",
    closing: "K L o-uu Z ih NG",
    comes: "K uh M Z",
    concrete: "K a N K R i T",
    cousin: "K uh Z ih N",
    cover: "K uh V er",
    dare: "D e R",
    dial: "D a-ih schwa L",
    diamond: "D a-ih M schwa N D",
    doctor: "D a K T er",
    dont: "D o-uu N T",
    wont: "W o-uu N T",
    door: "D o R",
    earl: "er L",
    eye: "a-ih",
    eyes: "a-ih Z",
    every: "e V R i",
    everything: "e V R i TH ih NG",
    everyone: "e V R i W uh N",
    fades: "F e-ih D Z",
    fall: "F aw L",
    fellas: "F e L schwa Z",
    ferry: "F e R i",
    ferrys: "F e R i Z",
    flare: "F L e R",
    forever: "F er e V er",
    full: "F uu L",
    fusion: "F ih-oo ZH schwa N",
    geiger: "G a-ih G er",
    get: "G e T",
    glow: "G L o-uu",
    glowing: "G L o-uu ih NG",
    gone: "G aw N",
    gonna: "G uh N schwa",
    hair: "H e R",
    half: "H ae F",
    harbor: "H a R B er",
    head: "H e D",
    heart: "H a R T",
    hell: "H i L",
    hold: "H o-uu L D",
    honey: "H uh N i",
    hudson: "H uh D S schwa N",
    hundred: "H uh N D R schwa D",
    id: "a-ih D",
    ill: "a-ih L",
    im: "a-ih M",
    illusion: "ih L oo ZH schwa N",
    itll: "ih T schwa L",
    kiss: "K ih S",
    know: "N o-uu",
    ladys: "L e-ih D i Z",
    liberty: "L ih B er T i",
    libertys: "L ih B er T i Z",
    lonely: "L o-uu N L i",
    long: "L aw NG",
    lost: "L aw S T",
    lovely: "L uh V L i",
    low: "L o-uu",
    maybe: "M e-ih B i",
    measured: "M e ZH er D",
    minute: "M ih N ih T",
    miss: "M ih S",
    nothing: "N uh TH ih NG",
    off: "aw F",
    old: "o-uu L D",
    on: "aw N",
    once: "W uh N S",
    ones: "W uh N Z",
    places: "P L e-ih S ih Z",
    pour: "P o R",
    practice: "P R ae K T ih S",
    put: "P uu T",
    radiation: "R e-ih D i e-ih SH schwa N",
    riding: "R a-ih D ih NG",
    ruins: "R oo ih N Z",
    says: "S e Z",
    shelter: "SH e L T er",
    shining: "SH a-ih N ih NG",
    sirens: "S a-ih R schwa N Z",
    siren: "S a-ih R schwa N",
    sky: "S K a-ih",
    slow: "S L o-uu",
    smiling: "S M a-ih L ih NG",
    soft: "S aw F T",
    sold: "S o-uu L D",
    somewhere: "S uh M W e R",
    son: "S uh N",
    song: "S aw NG",
    soul: "S o-uu L",
    sugar: "SH uu G er",
    sweetheart: "S W i T H a R T",
    thats: "DH ae T S",
    theyre: "DH e R",
    though: "DH o-uu",
    thousand: "TH a-uu Z schwa N D",
    through: "TH R oo",
    tomorrow: "T schwa M a R o-uu",
    tonight: "T schwa N a-ih T",
    took: "T uu K",
    tubes: "T oo B Z",
    use: "Y oo Z",
    walk: "W aw K",
    walked: "W aw K T",
    walking: "W aw K ih NG",
    want: "W aw N T",
    watch: "W a T SH",
    water: "W aw T er",
    were: "W er",
    whole: "H o-uu L",
    why: "W a-ih",
    worth: "W er TH",
    youll: "Y oo L",
    youre: "Y o R",
    electron: "ih L e K T R a N",
    electrons: "ih L e K T R a N Z",
    defense: "D ih F e N S",
    cue: "K Y oo",
    better: "B e T er",
    rocky: "R a K i",
    delgado: "D e L G a D o-uu",
    rockette: "R a K e T",
    pal: "P ae L",
    folks: "F o-uu K S",
    listening: "L ih S schwa N ih NG",
    kong: "K aw NG",
    zeke: "Z i K",
  });
  function excPhones(str) {
    return str
      .split(" ")
      .map((tok) =>
        tok === tok.toUpperCase() && !/^[a-z]/.test(tok)
          ? { k: "C", p: tok }
          : tok.indexOf("-") > 0
            ? { k: "D", v: tok.split("-") }
            : { k: "V", v: [tok] },
      );
  }
  const isV = (ch) =>
    ch === "a" ||
    ch === "e" ||
    ch === "i" ||
    ch === "o" ||
    ch === "u" ||
    ch === "y";
