// play-inline-597 06 — hud
// Lines 1560-1738 of readable/play-inline-597.pretty.js (statement-aligned).
  function updateLocationName(realDt) {
    if (HUD.locSuppress > 0) HUD.locSuppress -= realDt;
    if (HUD.restoreT > 0) HUD.restoreT -= realDt;
    if (locT > 0) {
      locT -= realDt;
      if (locT <= 0) HUD.locName.classList.remove("in");
    }
    if (locHeld) {
      locHeld.age += realDt;
      if (locHeld.age > 12) locHeld = null;
      else if (!bannerBusy()) {
        const h = locHeld;
        locHeld = null;
        showLocationName(h.name, h.sub);
      }
    }
    locPoll -= realDt;
    if (locPoll > 0) return;
    locPoll = 0.5;
    const P = G.player,
      L = G.LAYOUT;
    if (L.isInterior(P.pos.x)) return;
    const l = L.locationAt(P.pos.x, P.pos.z);
    const id = l ? l.id : null;
    if (id !== HUD.lastLoc) {
      if (
        l &&
        HUD.lastLoc !== undefined &&
        !(HUD.locSuppress > 0) &&
        G.discovered &&
        G.discovered.has(l.id)
      ) {
        const dn = H.DISTRICT_NAMES[L.districtAt(l.x, l.z)] || "";
        const cleared =
          l.hostile && H.call("combat", "isLocationCleared", [l.id], false);
        showLocationName(
          l.name,
          cleared ? (dn ? dn + "  ·  CLEARED" : "CLEARED") : dn,
        );
      }
      HUD.lastLoc = id;
    }
  }

  // ------------------------------------------------------------------
  // Visibility per state
  // ------------------------------------------------------------------
  function updateVisibility() {
    const s = G.state;
    const inGame = s === "play";
    const hidden = H.hudForcedHidden;
    H.toggle(
      HUD.root,
      "off",
      !(
        inGame ||
        s === "container" ||
        s === "barter" ||
        s === "dialogue" ||
        s === "terminal" ||
        s === "keypad" ||
        s === "cutscene"
      ) || hidden,
    );
    H.toggle(HUD.root, "mode-menu", !inGame);
    H.toggle(HUD.root, "mode-dead", s === "dead" || !G.player.alive);
    const topOn = !hidden && s === "play" && G.player.alive;
    H.toggle(HUD.top, "off", !topOn);
    const lockHint =
      s === "play" &&
      !G.input.locked &&
      !G.SMOKE &&
      !G.SHOT &&
      H.stateAge > 0.4;
    H.toggle(HUD.lockHint, "on", lockHint);
  }

  /** Screenshot review hook (?hudDemo=1|level|low): fills the HUD with representative content. */
  function hudDemo(kind) {
    const P = G.player;
    if (G.state === "goggles") {
      pushNotify("You can't fast travel while enemies are nearby.");
      return;
    } // message box
    if (kind === "level") {
      showLevelNote(2);
    } else {
      pushBanner({
        kind: "quest",
        title: "Quest added",
        sub: "Below the Municipal Building",
      });
      const D = { duration: 600 }; // review shots simulate many seconds before capture: keep the demo notes up
      pushNotify(
        "Rally Tonic added.",
        Object.assign({ kind: "item", id: "rally_tonic" }, D),
      );
      pushNotify("Find the facility exit before the reactor fails.", {
        sub: "Below the Municipal Building",
        duration: 600,
      });
      onXP(25, "Quest objective");
    }
    if (kind === "low") {
      P.hp = P.maxHp * 0.12;
      P.radRate = 4;
      P.sneaking = true;
    }
    const yawBack = P.yaw + Math.PI * 0.6;
    onDamaged(18, {
      pos: {
        x: P.pos.x - Math.sin(yawBack) * 10,
        z: P.pos.z - Math.cos(yawBack) * 10,
      },
    });
  }

  // ------------------------------------------------------------------
  // Part registration
  // ------------------------------------------------------------------
  H.part({
    name: "hud",
    order: 10,
    init() {
      build();
      wire();
    },
    update(dt, realDt) {
      if (
        G.SHOT &&
        !HUD.demoDone &&
        G.QS &&
        G.QS.get("hudDemo") &&
        G.player &&
        G.player.alive &&
        (G.state !== "goggles" || (H.GG && H.GG.open && H.stateAge > 0.3))
      ) {
        HUD.demoDone = true;
        hudDemo(G.QS.get("hudDemo"));
      }
      updateVisibility();
      const s = G.state;
      updateNotify(realDt);
      updateGgMsg(realDt);
      updateBanners(realDt, s !== "play" || !!H.hudForcedHidden);
      updateXP(realDt);
      if (s !== "play" && s !== "dead") return;
      updateBars(realDt);
      updateDirs(realDt);
      if (s === "play") {
        updateCenter(realDt);
        updateMinimap(realDt);
        updateObjective(realDt);
        updateLocationName(realDt);
      }
    },
  });

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  Object.assign(G.hud, {
    /** Queue a top-centre message. opts: {icon|glyph: glyph name (25_icons.js), sub, sound, color:'red', kind, hint, duration} */
    notify(text, opts) {
      pushNotify(text, opts);
    },
    /** Bracketed banner. {title, sub, glyph?, sound?, extra?, life?} */
    banner(b) {
      pushBanner(Object.assign({}, b));
    },
    showLocationName,
    hitMarker(kill) {
      hitMark(!!kill);
    },
    damageFrom(pos, amount) {
      onDamaged(amount || 10, { pos });
    },
    xp: onXP,
  });
