// play-inline-608 03 — the
// Lines 711-1057 of readable/play-inline-608.pretty.js (statement-aligned).
  const LOAD_LABELS = {
    textures: "Painting the city",
    sound: "Tuning the city's sounds",
    atmosphere: "Setting the sky & weather",
    render_lighting: "Hanging the streetlights",
    map: "Laying out Manhattan",
    landmarks_a: "Midtown landmarks",
    landmarks_b: "Downtown & park landmarks",
    poi_uptown: "Central Park West & 57th Street",
    poi_midtown: "Midtown locations",
    poi_village: "The Village & Chinatown",
    poi_financial: "Financial District",
    poi_harbor: "Harbor & Ellis Island",
    poi_roosevelt: "Blackwell's Island",
    poi_bridges: "The East River bridges",
    poi_ues: "Upper East Side",
    poi_theater: "Theater District",
    poi_eastside: "Tudor City & the East Side",
    poi_herald: "Herald Square",
    poi_chelsea: "Chelsea",
    poi_eastvillage: "East Village",
    poi_civic: "Civic Center",
    poi_wallst: "Wall Street",
    poi_midtown3: "Park Avenue",
    poi_penn: "Penn Station & the Post Office",
    poi_village3: "Greenwich Village",
    poi_fidi3: "Lower Manhattan",
    poi_harbor2: "The ferry piers",
    poi_park: "Central Park locations",
    poi_uws: "Upper West Side",
    poi_midtown2: "Midtown museums & hotels",
    landmark_interiors: "Furnishing landmark interiors",
    props: "Dressing the streets",
    characters: "Casting New Yorkers",
    rpg: "Stocking the shelves",
    weapons: "Oiling the armory",
    combat: "Letting the dangers loose",
    ambient_life: "Filling the streets with life",
    crafting: "Setting up the workbenches",
    arcade: "Plugging in the arcade cabinets",
    poi_sandbox: "Finishing touches",
    quests: "Writing the main story",
    quests_extra: "Writing the side stories",
    lair: "Keeping a few secrets",
    ui_interact: "Wiring doors, safes & terminals",
    ui_hud: "Calibrating VIGIL optics",
    core_thirdperson: "Adjusting the camera",
    render_perf: "Warming up the graphics",
    cheats: "Final checks",
  };
  const MAP_LABELS = {
    "shoreline & streets": "Paving the streets",
    "Central Park": "Planting Central Park",
    "street details": "Placing street details",
    buildings: "Raising the skyline",
    billboards: "Pasting up the billboards",
    "twenty-two years of decay": "Adding twenty-two years of decay",
    "Cryo Unit C-9": "Sealing Cryo Unit C-9",
    subway: "Digging the subway",
    dungeons: "Opening the cellars & hideouts",
    meshes: "Assembling the city",
  };
  function loadLabel(text) {
    const t = String(text);
    let m = /^Initializing (\S+?)…?$/.exec(t);
    if (m) return LOAD_LABELS[m[1]] || "Preparing the city";
    m = /^Map: (.+)$/.exec(t);
    if (m) return MAP_LABELS[m[1]] || m[1];
    m = /^Furnishing (.+?)…?$/.exec(t);
    if (m)
      return (
        "Furnishing " + m[1].replace(/\b\w/g, (c) => c.toUpperCase()) + "…"
      );
    return t; // "Raising the Empire State Building…", "Restoring …", "Ready." are already readable
  }
  function buildLoading() {
    const l = H.el("div", "menu-loading", document.body);
    // the logo gets its own SVG ids so its filters never resolve to the (hidden) title-screen copy
    const art = logoHTML()
      .replace(/id="nl/g, 'id="nlL')
      .replace(/url\(#nl/g, "url(#nlL");
    // The radar ping, sweep and triangle glow are plain HTML layers animated with transform/opacity only,
    // so the compositor keeps them moving smoothly while module init blocks the main thread.
    const fx =
      '<i class="ml-disc"></i><i class="ml-sweep"></i><i class="ml-ping"></i><i class="ml-ping p2"></i><i class="ml-glow"><b></b></i>';
    l.innerHTML =
      '<div class="menu-loading-logo">' +
      fx +
      art +
      '</div><div class="menu-loading-div"></div>' +
      '<div class="menu-loading-side"><div class="menu-loading-h">SYSTEMS</div>' +
      '<div class="menu-loading-chk">' +
      LOAD_STEPS.map(
        (st) =>
          '<div class="wait"><span>' +
          st[0] +
          "</span><b>&middot;&middot;&middot;</b></div>",
      ).join("") +
      "</div>" +
      '<div class="menu-loading-dest"><small>TRAVELLING TO</small><div class="menu-loading-dname"></div></div>' +
      '<div class="menu-loading-bar"><i></i></div><div class="menu-loading-text"></div>' +
      '<div class="menu-loading-tip"></div></div><div class="menu-loading-scan"></div>';
    return {
      el: l,
      tip: l.querySelector(".menu-loading-tip"),
      bar: l.querySelector(".menu-loading-bar i"),
      text: l.querySelector(".menu-loading-text"),
      rows: Array.from(l.querySelectorAll(".menu-loading-chk > div")),
      dname: l.querySelector(".menu-loading-dname"),
      dhead: l.querySelector(".menu-loading-dest small"),
      step: 0,
    };
  }
  function setLoadingStep(L, k, done) {
    L.step = Math.max(L.step, k);
    L.rows.forEach((r, i) => {
      const st = done || i < L.step ? "ok" : i === L.step ? "now" : "wait";
      if (r.className !== st) {
        r.className = st;
        r.lastChild.textContent =
          st === "ok" ? "OK" : st === "now" ? ">>" : "···";
      }
    });
  }
  function buildScreens() {
    // ---- TITLE ----
    const t = H.el("div", "menu-screen menu-title", H.uiRoot);
    t.innerHTML =
      '<div class="menu-letterbox top"></div><div class="menu-letterbox bot"></div>' +
      '<div class="menu-grain"></div><div class="menu-title-shade"></div><div class="menu-title-scan"></div>' +
      '<div class="menu-logo">' +
      logoHTML() +
      "</div>" +
      '<div class="menu-press">[ PRESS ANY KEY ]</div>' +
      '<div class="menu-title-menu"></div>' +
      '<div class="menu-title-foot"><span>V' +
      H.esc(G.VERSION || "0.1") +
      "</span></div>";
    SCR.title = {
      el: t,
      host: H.menuHost(t.querySelector(".menu-title-menu")),
      press: t.querySelector(".menu-press"),
    };
    t.addEventListener("mousedown", () => {
      if (SCR.title.waiting) titleProceed();
    });
    // ---- PAUSE ----
    const p = H.el("div", "menu-screen menu-pause", H.uiRoot);
    p.innerHTML =
      '<div class="menu-pause-bg"></div><div class="menu-crt"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><div class="menu-crt-in"></div><div class="menu-crt-fx"></div></div>';
    SCR.pause = { el: p, host: H.menuHost(p.querySelector(".menu-crt-in")) };
    // ---- DEATH ----
    const d = H.el("div", "menu-screen menu-death", H.uiRoot);
    d.innerHTML =
      '<div class="menu-death-fade"></div><div class="menu-death-body"><svg class="menu-death-line" viewBox="0 0 600 80" preserveAspectRatio="none"><path d="M0 40 H220 L238 14 L256 66 L272 30 L284 40 H600"/></svg>' +
      '<div class="menu-death-title">SIGNAL LOST</div><div class="menu-death-quote"></div><div class="menu-death-menu"></div></div>';
    SCR.dead = { el: d, host: H.menuHost(d.querySelector(".menu-death-menu")) };
    // ---- LOADING ----
    SCR.loading = buildLoading();
    for (const k of ["title", "pause", "dead"])
      SCR[k].el.style.display = "none";
  }
  function hideAllScreens() {
    for (const k of ["title", "pause", "dead"])
      if (SCR[k]) {
        SCR[k].el.style.display = "none";
        SCR[k].host.clear();
      }
  }

  /**
   * Title logo: civil-defense siren rings with a slow sonar ping and sweep, the red CD triangle behind
   * the name, in the VIGIL palette with a CRT finish (bloom, colour fringing, flicker, noise).
   */
  function logoHTML() {
    const name = H.esc(H.up(H.gameName()));
    let rings = "";
    for (let i = 1; i < 5; i++)
      rings +=
        '<circle class="nl-ring" cx="800" cy="450" r="' +
        (170 + i * 150) +
        '" stroke-width="2"/>';
    return (
      '<svg class="nrc-logo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' +
      name +
      '">' +
      '<defs><filter id="nlBloom" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<filter id="nlNoise"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .8  0 0 0 0 .93  0 0 0 0 .98  0 0 0 1.2 -.35"/></filter>' +
      '<radialGradient id="nlSweep" cx="0" cy="0" r="1"><stop offset="0" stop-color="#cfeefa" stop-opacity=".18"/><stop offset="1" stop-color="#cfeefa" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="nlBand" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#04080b" stop-opacity="0"/><stop offset=".18" stop-color="#04080b" stop-opacity=".92"/><stop offset=".82" stop-color="#04080b" stop-opacity=".92"/><stop offset="1" stop-color="#04080b" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="nlRule" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#cfeefa" stop-opacity="0"/><stop offset=".2" stop-color="#cfeefa" stop-opacity=".55"/><stop offset=".8" stop-color="#cfeefa" stop-opacity=".55"/><stop offset="1" stop-color="#cfeefa" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="nlDisc" cx=".5" cy=".5" r=".5"><stop offset=".45" stop-color="#04080b" stop-opacity=".78"/><stop offset="1" stop-color="#04080b" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse cx="800" cy="450" rx="900" ry="520" fill="url(#nlDisc)"/>' +
      "<g>" +
      rings +
      "</g>" +
      '<g class="nl-sweep"><path d="M800,450 L1800,450 A1000,1000 0 0 0 1666,-50 Z" fill="url(#nlSweep)"/></g>' +
      '<circle class="nl-ping" cx="800" cy="450" r="820"/><circle class="nl-ping p2" cx="800" cy="450" r="820"/>' +
      '<g class="nl-tri"><polygon points="800,150 1080,640 520,640" fill="rgba(255,90,74,.16)" stroke="#ff5a4a" stroke-width="10" stroke-linejoin="round"/>' +
      "</g>" +
      '<rect x="150" y="384" width="1300" height="150" fill="url(#nlBand)"/>' +
      '<rect x="150" y="383" width="1300" height="2" fill="url(#nlRule)"/><rect x="150" y="533" width="1300" height="2" fill="url(#nlRule)"/>' +
      '<g font-size="96" text-anchor="middle"><text class="nl-t nl-fr" x="800" y="494">' +
      name +
      '</text><text class="nl-t nl-fb" x="800" y="494">' +
      name +
      "</text>" +
      '<text class="nl-t nl-glow" x="800" y="494">' +
      name +
      "</text></g>" +
      '<rect width="1600" height="900" filter="url(#nlNoise)" class="nl-noise"/>' +
      "</svg>"
    );
  }

  // ---------------- TITLE ----------------
  function showTitle() {
    hideAllScreens();
    const T = SCR.title;
    T.el.style.display = "";
    T.el.classList.remove("menu-open");
    T.waiting = !(G.SHOT || G.SMOKE || H.titleSeen);
    if (!T.waiting) titleMenu();
    else {
      T.press.style.display = "";
    }
    try {
      if (G.music && G.music.setMood) G.music.setMood("title");
    } catch (e) {
      /* stub */
    }
    H.titleCam.start();
  }
  function titleProceed() {
    const T = SCR.title;
    if (!T.waiting) return;
    T.waiting = false;
    H.titleSeen = true;
    H.sfx("ui_select");
    try {
      if (G.music && G.music.play) G.music.play("title");
    } catch (e) {
      /* stub */
    }
    titleMenu();
  }
  function titleMenu() {
    const T = SCR.title;
    T.press.style.display = "none";
    T.el.classList.add("menu-open");
    T.host.clear();
    const hasSave = G.save.hasAny();
    T.host.push({
      cls: "menu-main",
      items: [
        {
          label: "Continue",
          disabled: !hasSave,
          action: () => {
            const s = G.save.listSlots()[0];
            if (s) doLoad(s.slot);
          },
        },
        { label: "New game", action: newGame },
        { label: "Load", disabled: !hasSave, action: () => loadPanel(T.host) },
        { label: "Settings", action: () => settingsPanel(T.host) },
        { label: "Credits", action: () => creditsPanel(T.host) },
      ],
      onBack: () => true,
    });
  }
  /** New game: straight into the opening (no character creation). */
  function newGame() {
    const go = () => {
      hideAllScreens();
      H.titleCam.stop();
      if (G.intro && typeof G.intro.start === "function") {
        G.intro.start();
        return;
      }
      // the opening sequence currently lives in the 'chargen' state of ui_interact
      if (!G.isStub("dialogue") && !G.isStub("ui")) G.setState("chargen");
      else G.newGame({ name: H.heroName() });
    };
    if (G.save.hasAny())
      confirmPanel(
        SCR.title.host,
        "Start a new game?",
        go,
        "New game",
        "Cancel",
      );
    else go();
  }
  // Remove core's fallback "click to start" overlay if it was created
  function killCoreFallback() {
    for (const d of Array.from(document.body.children)) {
      if (
        d.tagName === "DIV" &&
        /core fallback title/.test(d.textContent || "") &&
        d.id !== "ui-root"
      )
        d.remove();
    }
  }

  // ---------------- TITLE CAMERA (flyover) ----------------
  // Fixed order: the bridge opens the loop, then Times Square, Liberty, then the rest.
  const SHOTS = [
    {
      from: [470, 28, 540],
      to: [430, 34, 590],
      look0: [330, 45, 640],
      look1: [300, 50, 640],
      dur: 15,
    }, // East River: Brooklyn Bridge towers
    {
      from: [-150, 95, -330],
      to: [-80, 80, -250],
      look0: [80, 110, -72],
      look1: [90, 100, -72],
      dur: 16,
    }, // over Times Square toward the Empire State
    {
      from: [-260, 30, 1120],
      to: [-300, 40, 1170],
      look0: [-420, 70, 1250],
      look1: [-420, 75, 1250],
      dur: 15,
    }, // Statue of Liberty from the bay
    {
      from: [-40, 170, 520],
      to: [30, 150, 420],
      look0: [70, 70, -150],
      look1: [80, 60, -200],
      dur: 17,
    }, // aerial skyline from the south
    {
      from: [60, 110, -380],
      to: [10, 90, -500],
      look0: [-20, 10, -720],
      look1: [-40, 10, -760],
      dur: 16,
    }, // over Central Park, north toward the blast
  ];
  const TC = { on: false, t: 0, i: 0, fade: null };
  H.titleCam = TC;
