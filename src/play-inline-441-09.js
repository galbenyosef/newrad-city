// play-inline-441 09 — ctx
// Lines 2515-2795 of readable/play-inline-441.pretty.js (statement-aligned).
  const BB_STYLE = {
    fizzo_cola: [
      "#c0141a",
      "#fff",
      "Fizzo Cola",
      "Fizz Up, America!",
      "bottle",
    ],
    fizzo_blue: [
      "#0c2a4a",
      "#8ae8ff",
      "FIZZO BLUE",
      "The Electric Refresher",
      "bottle_blue",
    ],
    long_winter: [
      "#dcdad0",
      "#c8601e",
      "CIVIL DEFENSE",
      "Enrol Today. Carry Your Card.",
      "winter",
    ],
    prairie_root_beer: [
      "#e8d8a8",
      "#7a3a18",
      "Prairie Root Beer",
      "Old-time flavor, poured cold.",
      "star",
    ],
    liberty_jetliner: [
      "#1c2f5c",
      "#f2eee2",
      "LIBERTY JETLINER",
      "Fly the flag. Fly Liberty.",
      "star",
    ],
    first_journal: [
      "#ece6d6",
      "#1e3a66",
      "THE FIRST JOURNAL",
      "You heard it here first.",
      "star",
    ],
    pizza_galaxy: [
      "#20103a",
      "#ffcf40",
      "PIZZA GALAXY",
      "Out of this world. Into your mouth in 30 minutes.",
      "star",
    ],
    empire_brew: [
      "#1e4a34",
      "#f0e0b0",
      "EMPIRE BREW HOUSE",
      "Brewed in Brooklyn. Poured everywhere.",
      "star",
    ],
    silver_torch: [
      "#26323e",
      "#e8eaee",
      "SILVER TORCH",
      "Light up like the lady in the harbor.",
      "star",
    ],
    burger_brigade: [
      "#c8281e",
      "#fff0c8",
      "BURGER BRIGADE",
      "Fifteen cents. Fifteen seconds.",
      "star",
    ],
    excalibur_gardens: [
      "#3a2a6a",
      "#f0d070",
      "EXCALIBUR GARDENS",
      "COMING SOON · Summer 1967. Your kingdom awaits.",
      "star",
    ],
    junior_rocketeer: [
      "#e8e4d8",
      "#c8281e",
      "JUNIOR ROCKETEER CO.",
      "Real science. Real rockets.",
      "star",
    ],
    miracle_mane: [
      "#2a4a3a",
      "#f0e0b0",
      "DR. THATCHER'S MIRACLE MANE",
      "Grows hair on anything. Anything.",
      "star",
    ],
    big_apple_cab: [
      "#e0b020",
      "#151515",
      "BIG APPLE MOTOR CAB",
      "Just get in already!",
      "apple",
    ],
    mama_marinara: [
      "#c42a1e",
      "#f6ead0",
      "MAMA MARINARA'S",
      "Just add water. Mama will never know.",
      "star",
    ],
    hi_octane: [
      "#f0e6d0",
      "#c8281e",
      "HI-OCTANE HARRY'S",
      "Full service. Full tank. Full speed ahead.",
      "star",
    ],
    vigil: [
      "#13263a",
      "#cfeefa",
      "VIGIL DEFENSE",
      "Protecting America Always",
      "star",
    ],
    freedom_flakes: [
      "#1e3f86",
      "#f6eedc",
      "FREEDOM FLAKES",
      "The breakfast of a free nation.",
      "star",
    ],
    chocolate_zeppelin: [
      "#5a3420",
      "#f0e4c8",
      "CHOCOLATE ZEPPELIN",
      "Lighter than air. Sweeter than pie.",
      "star",
    ],
    golden_plain: [
      "#d8a838",
      "#4a2410",
      "GOLDEN PLAIN JERKY",
      "Tough enough for any trail.",
      "star",
    ],
    homeguard: [
      "#e8e4d8",
      "#1a3a6a",
      "HOMEGUARD",
      "Defending the American kitchen.",
      "star",
    ],
    lonly_tv: [
      "#2a2a2a",
      "#e8c860",
      "LONLY",
      "The best company in the house.",
      "star",
    ],
    eagle_motors: [
      "#16324a",
      "#f0e8d0",
      "EAGLE MOTORS",
      "Freedom to Explore",
      "star",
    ],
    super_sergeant: [
      "#f0d040",
      "#b8261c",
      "SUPER SERGEANT",
      "America's finest fighting man!",
      "chevrons",
    ],
    american_automaton: [
      "#d6e0e4",
      "#1a3a4a",
      "AMERICAN AUTOMATON CO.",
      "Built in America, to serve America.",
      "star",
    ],
    forever_franks: [
      "#f0e4c4",
      "#b01a14",
      "FOREVER FRANKS",
      "So good they'll outlive you!",
      "franks",
    ],
    sky_patrol: [
      "#0a0a2a",
      "#ffb347",
      "SKY PATROL",
      "Now in Every Arcade!",
      "star",
    ],
    worlds_fair: [
      "#1a3a6a",
      "#f0e8d0",
      "1964 WORLD'S FAIR",
      "Flushing Meadows, Queens",
      "star",
    ],
  };
  const BB_LIST = Object.keys(BB_STYLE);
  const BB_CACHE = {};
  X.billboardMaterial = function (brand) {
    // prefer the textures module's shared billboard material
    if (!G.isStub("mats") && G.mats && typeof G.mats.billboard === "function") {
      try {
        const m = G.mats.billboard(brand);
        if (m && m.isMaterial) return m;
      } catch (e) {
        /* fallback */
      }
    }
    if (BB_CACHE[brand]) return BB_CACHE[brand];
    const st =
      BB_STYLE[brand] ||
      BB_STYLE[BB_LIST[U.hashStr(String(brand)) % BB_LIST.length]];
    const c = X.makeCanvas(512, 256),
      ctx = c.getContext("2d"),
      r = U.rng(U.hashStr(brand));
    ctx.fillStyle = st[0];
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    for (let i = 0; i < 10; i++) ctx.fillRect(0, i * 26, 512, 12);
    if (st[4] === "bottle" || st[4] === "bottle_blue")
      fizzoBottle(
        ctx,
        440,
        130,
        1.4,
        st[4] === "bottle_blue" ? "#1a8ad0" : "#3a0c08",
      );
    else if (st[4] === "winter") winterMark(ctx, 440, 128, 70, st[1]);
    else if (st[4] === "apple") appleMark(ctx, 440, 128, 70);
    else if (st[4] === "chevrons") {
      ctx.fillStyle = "#5a6234";
      ctx.fillRect(385, 50, 110, 156);
      ctx.strokeStyle = st[0];
      ctx.lineWidth = 14;
      for (let i = 0; i < 3; i++) {
        const y = 84 + i * 30;
        ctx.beginPath();
        ctx.moveTo(398, y + 28);
        ctx.lineTo(440, y);
        ctx.lineTo(482, y + 28);
        ctx.stroke();
      }
    } else if (st[4] === "franks") {
      rays(ctx, 440, 128, 12, 100, "rgba(232,192,64,0.5)");
      franksMascot(ctx, 432, 132, 2.3);
    } else {
      rays(ctx, 440, 128, 12, 90, "rgba(255,255,255,0.12)");
      ctx.fillStyle = st[1];
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5,
          rr = i % 2 ? 24 : 58;
        ctx.lineTo(440 + Math.cos(a) * rr, 128 + Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    }
    txt(ctx, st[2], 200, 100, st[2].length > 14 ? 44 : 64, st[1], {
      maxW: 360,
      stroke: "rgba(0,0,0,0.35)",
    });
    txt(ctx, st[3], 200, 170, st[3].length > 30 ? 22 : 28, st[1], {
      font: F_SCRIPT,
      weight: "normal",
      maxW: 360,
    });
    weather(ctx, 512, 256, r, 1.0);
    const t = X.finishTex(c, false);
    const m = new THREE.MeshStandardMaterial({
      map: t,
      roughness: 0.8,
      metalness: 0,
      emissive: 0x111111,
      emissiveMap: t,
    });
    m.userData.shared = true;
    BB_CACHE[brand] = m;
    return m;
  };
