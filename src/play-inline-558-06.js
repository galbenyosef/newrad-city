// play-inline-558 06 — hook
// Lines 1815-1901 of readable/play-inline-558.pretty.js (statement-aligned).
  function buyMarquee() {
    const st = { owned: true, mode: "follow" };
    L.setFlag("neon_marquee", st);
    const near = G.player.pos;
    const a = spawnMarquee({ x: near.x + 1.5, y: near.y, z: near.z + 1.5 });
    if (a) {
      a.follow("player");
      a.say(
        "Oh, splendid! A new employer! I shall endeavour not to set you on fire!",
        4,
      );
    }
    L.notify("Marquee has joined you.");
  }

  L.hook("world", function () {
    try {
      buildWorld();
    } catch (e) {
      G.reportError("quests:neon world", e);
    }
  });
  L.hook("spawn", function () {
    // a rented locker always comes with its key (older saves rented it before the key existed)
    if (L.flag("neon_locker") && !L.has(LOCKER_LOCK.key))
      L.give(LOCKER_LOCK.key, 1, true);
    const st = L.flag("neon_marquee");
    if (st && st.owned) {
      const a = spawnMarquee();
      if (a && st.mode === "follow") a.follow("player");
    }
    const champ = L.flag("neon_gallery_champ");
    if (champ) {
      const a = L.npc("neon_annie");
      if (a && a.merchant) a.merchant.markup = 0.85;
    }
    if (L.flag("broadway_under")) {
      const a = L.npc("neon_broadway");
      if (a && a.merchant) {
        const st2 = a.merchant.stock || (a.merchant.stock = []);
        for (const s of L.resolveStock(UNDER))
          if (!st2.some((e) => e[0] === s[0])) st2.push(s);
      }
    }
  });
  L.hook("reset", function () {
    endGallery(true);
    RJ.over = true;
  });
  L.hook("update", function (dt) {
    if (GAL.active) {
      try {
        galleryUpdate(dt);
      } catch (e) {
        G.reportError("quests:neon gallery", e);
        endGallery(true);
      }
    }
  });
  G.events.on("weaponFired", () => {
    if (GAL.active) {
      try {
        galleryShot();
      } catch (e) {
        G.reportError("quests:neon gallery shot", e);
      }
    }
  });

  /** Black-out hook (49_ "Power to the People"): the Oracle's lamp dies with the grid. */
  function lamps(on) {
    for (const m of W.oracleMats || []) {
      if (m.userData.i0 === undefined) m.userData.i0 = m.emissiveIntensity;
      m.emissiveIntensity = on ? m.userData.i0 : m.userData.i0 * 0.08;
    }
    if (W.oracleGlow) W.oracleGlow.visible = !!on;
  }
  L.neonServices = {
    startGallery,
    endGallery,
    gallery: () => GAL,
    marquee,
    buyMarquee,
    RJ,
    score,
    lamps,
  };
