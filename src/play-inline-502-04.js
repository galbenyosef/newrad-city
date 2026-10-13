// play-inline-502 04 — sway
// Lines 975-1324 of readable/play-inline-502.pretty.js (statement-aligned).
  P.updateScopeSway = function (dt, w, v) {
    const pl = G.player;
    const active = !!(
      v &&
      v.ads &&
      w &&
      w.scope &&
      v.adsT > 0.6 &&
      G.state === "play" &&
      pl.alive !== false
    );
    let target = 0;
    if (active) {
      const skill = rpgReal()
        ? G.util.clamp(G.rpg.skill(w.skill) || 0, 0, 100)
        : 50;
      target = 0.018 * (1.25 - skill / 130); // ~0.016 rad at 50 skill; high skill = steadier
      if (pl.sneaking) target *= 0.65; // crouched = steadier
      target *= 1 + 0.3 * P.strDeficit(w); // too heavy for you
      target *= 1 + Math.min(1.5, (pl.moveSpeed || 0) * 0.35); // walking = shakier
      if (G.rpg && typeof G.rpg.hasTalent === "function") {
        try {
          if (G.rpg.hasTalent("steady_hands")) target *= 0.75;
        } catch (e) {
          /* ignore */
        }
      }
      // hold breath: sprint key while scoped (sprint itself needs movement, so standing still is free)
      const shift = G.input.action("sprint");
      if (!shift) SWAY.needRelease = false; // must let go after running out of breath
      const wantHold =
        shift &&
        !SWAY.needRelease &&
        (pl.moveSpeed || 0) < 0.5 &&
        SWAY.winded <= 0;
      if (wantHold && SWAY.breath > 0) {
        if (!SWAY.holding) {
          SWAY.holding = true;
          if (P.hasSfx("breath_hold"))
            P.snd("breath_hold", null, { volume: 0.5 });
        }
        SWAY.breath = Math.max(0, SWAY.breath - dt / 4.5); // ~4.5 s of held breath
        target *= 0.08;
        if (SWAY.breath <= 0) {
          SWAY.winded = 2.2;
          SWAY.holding = false;
          SWAY.needRelease = true;
          if (P.hasSfx("breath_exhale"))
            P.snd("breath_exhale", null, { volume: 0.6 });
        }
      } else {
        // released early: a softer exhale (only with a dedicated recipe — silence beats a wrong sound)
        if (SWAY.holding && P.hasSfx("breath_exhale"))
          P.snd("breath_exhale", null, { volume: 0.3 });
        SWAY.holding = false;
        SWAY.breath = Math.min(1, SWAY.breath + dt / 3.5);
      }
    } else {
      SWAY.holding = false;
      SWAY.breath = Math.min(1, SWAY.breath + dt / 3.5);
    }
    if (SWAY.winded > 0) {
      SWAY.winded -= dt;
      target *= 1.8;
    }
    SWAY.amp = G.util.damp ? G.util.damp(SWAY.amp, target, 4, dt) : target;
    // lissajous drift (figure-8 like the classic scope sway) with a slower breathing component
    SWAY.t += dt * (SWAY.winded > 0 ? 1.6 : 1);
    const t = SWAY.t;
    const np = active
      ? SWAY.amp * (Math.sin(t * 1.3) * 0.8 + Math.sin(t * 0.47 + 1.1) * 0.5)
      : 0;
    const ny = active
      ? SWAY.amp * (Math.sin(t * 0.65 + 0.4) * 1.0 + Math.sin(t * 0.29) * 0.4)
      : 0;
    const dp = np - SWAY.p,
      dy = ny - SWAY.y;
    if (dp || dy) {
      pl.pitch = G.util.clamp(pl.pitch + dp, -1.5, 1.5);
      pl.yaw += dy;
    }
    SWAY.p = np;
    SWAY.y = ny;
  };
  /** 0..1 held-breath reserve (HUD may draw it), and whether breath is being held now. */
  P.breathState = () => ({
    breath: SWAY.breath,
    holding: SWAY.holding,
    winded: SWAY.winded > 0,
  });

  P.stopLoops = function () {
    if (S.flameSnd) {
      try {
        S.flameSnd.stop();
      } catch (e) {
        /* ignore */
      }
      S.flameSnd = null;
    }
    if (S.spinSnd) {
      try {
        S.spinSnd.stop();
      } catch (e) {
        /* ignore */
      }
      S.spinSnd = null;
    }
  };

  // ------------------------------------------------------------------
  // Per-frame input & logic (G.state === 'play')
  // ------------------------------------------------------------------
  P.fireHeldT = 0;
  P.logic = function (dt) {
    const cur = S.cur;
    const v = V();
    S.rofT -= dt;
    S.bloom = Math.max(0, S.bloom - dt * 0.12);
    // auto-reload of an emptied weapon: waits while holstered / mid-swap / lowered (it is re-armed
    // on draw too, see P.armAutoReload), so it never plays on a hidden weapon or gets lost
    if (S.autoReloadT > 0) {
      S.autoReloadT -= dt;
      if (S.autoReloadT <= 0) {
        const ready =
          !S.holstered &&
          v.pendingKind === null &&
          v.lowerT < 0.5 &&
          G.state === "play";
        if (!ready) S.autoReloadT = 0.1;
        else {
          S.autoReloadT = -1;
          if (!P.action) P.reload();
          else if (P.action.name !== "reload") S.autoReloadT = 0.2;
        }
      }
    }
    const I = G.input;
    const playing = G.state === "play" && G.player.alive !== false;
    P.updateScopeSway(
      dt,
      cur && cur.def.weapon,
      playing && !S.holstered && !G.player.camOverride ? v : null,
    );
    if (!cur || !playing) {
      v.triggerHeld = false;
      v.spin = Math.max(0, v.spin - dt * 1.5);
      if (!playing) P.stopLoops();
      return;
    }
    const def = cur.def,
      w = def.weapon;

    // --- hotkeys
    for (let i = 1; i <= 8; i++)
      if (I.actionPressed("fav" + i)) {
        G.weapons.useFavorite(i);
      }
    if (I.actionPressed("holster")) G.weapons.holster(!S.holstered);
    if (I.actionPressed("grenade")) {
      const g = P.bestThrowable();
      if (!g) {
        G.notify("You have no grenades.");
        G.sfx.play("ui_error", { volume: 0.4 });
      } else {
        // the grenade hotkey throws immediately, even from holstered
        if (S.holstered) {
          G.weapons.holster(false);
          v.lowerT = Math.min(v.lowerT, 0.35);
        }
        if (P.action && !P.isBusy()) P.cancelAction(); // idle inspect / cycle tail
        if (!P.startThrow(g, w.reloadType !== "throw" || g !== cur.id, null))
          G.sfx.play("ui_error", { volume: 0.3 });
      }
    }
    if (I.actionPressed("reload") && !S.holstered) P.reload();

    const firePressed = I.actionPressed("fire"),
      fireHeld = I.action("fire"),
      fireReleased = I.actionReleased("fire") || (!fireHeld && P.fireHeldT > 0);
    P.fireHeldT = fireHeld ? P.fireHeldT + dt : 0;
    v.triggerHeld = fireHeld && !S.holstered && w.reloadType !== "melee";

    // holstered: attack draws the weapon
    if (S.holstered) {
      if (firePressed) G.weapons.holster(false);
      v.ads = false;
      v.blocking = false;
      P.stopLoops();
      return;
    }
    if (v.pendingKind !== null || v.lowerT > 0.5) {
      v.ads = false;
      return;
    }

    const isMelee = w.reloadType === "melee";
    // --- idle inspect after a while standing still; any input cancels it
    const anyInput =
      fireHeld ||
      I.action("aim") ||
      (G.player.moveSpeed || 0) > 0.3 ||
      I.actionPressed("reload") ||
      I.mouse.dx * I.mouse.dx + I.mouse.dy * I.mouse.dy > 400;
    if (P.action && P.action.name === "inspect" && anyInput) P.cancelAction();
    if (anyInput || P.action) S.idleT = 0;
    else S.idleT = (S.idleT || 0) + dt;
    if (
      S.idleT > 16 &&
      !P.action &&
      v.model &&
      !v.model.parts.fistR &&
      w.reloadType !== "throw"
    ) {
      S.idleT = -10;
      P.startAction(P.inspectAction(v.model));
    }
    // --- aim / block
    if (isMelee) {
      v.blocking = I.action("aim") && !P.isBusy();
      v.ads = false;
    } else {
      v.blocking = false;
      v.ads =
        I.action("aim") && !G.player.sprinting && w.reloadType !== "throw";
      v.scoped = !!w.scope;
    }

    // --- ADS FOV
    const wantFov = v.ads
      ? G.player.fovBase * (w.scope ? 1 / w.scope : w.adsFov || 0.82)
      : null;
    if (wantFov !== S.lastFov) {
      if (wantFov) G.player.setFov(wantFov);
      else if (S.lastFov) G.player.setFov(G.player.fovBase);
      S.lastFov = wantFov;
    }

    // --- per-round reload interrupt: fire during a shell-by-shell reload stops it
    if (
      P.action &&
      P.action.name === "reload" &&
      P.action.phase === "round" &&
      firePressed &&
      cur.mag > 0
    )
      P.action.stopReq = true;

    // --- melee
    if (isMelee) {
      if (firePressed && !P.isBusy() && S.rofT <= 0 && !G.player.sprinting) {
        P.startMelee(false);
        S.rofT = 1 / (w.rof || 1.5);
      }
      if (S.meleeAct && P.action === S.meleeAct && !fireHeld)
        P.meleeRelease(S.meleeAct);
      return;
    }
    // --- thrown
    if (w.reloadType === "throw") {
      if (firePressed && !P.isBusy()) P.startThrow(cur.id, false, null);
      return;
    }

    // --- minigun spin
    if (w.spinUp) {
      const want =
        fireHeld && !P.isBusy() && (cur.mag > 0 || P.reserve(def) > 0) ? 1 : 0;
      v.spin = G.util.clamp(
        v.spin + (want ? dt / w.spinUp : -dt / (w.spinUp * 1.8)),
        0,
        1,
      );
      // dedicated spin-up / spin loop / spin-down recipes when the sound module has them
      const rich = P.hasSfx("minigun_spin");
      if (want && !S.spinWant && v.spin < 0.6 && rich)
        P.snd("minigun_spinup", null, { volume: 0.75 });
      if (!want && S.spinWant && v.spin > 0.3 && rich)
        P.snd("minigun_spindown", null, { volume: 0.7 * v.spin });
      S.spinWant = want;
      if (v.spin > 0.05 && !S.spinSnd)
        S.spinSnd = rich
          ? P.snd("minigun_spin", null, { loop: true, volume: 0.05 })
          : G.sfx.play("hum_electric", { loop: true, volume: 0.5, pitch: 0.6 });
      if (S.spinSnd) {
        if (rich) {
          if (S.spinSnd.setVolume) S.spinSnd.setVolume(0.6 * v.spin * v.spin);
          if (S.spinSnd.setPitch) S.spinSnd.setPitch(0.7 + v.spin * 0.3);
        } else if (S.spinSnd.setPitch) S.spinSnd.setPitch(0.6 + v.spin * 0.9);
      }
      if (v.spin <= 0.02 && S.spinSnd) {
        try {
          S.spinSnd.stop();
        } catch (e) {
          /* ignore */
        }
        S.spinSnd = null;
      }
    }
    // --- flamer loop
    const flaming =
      w.flash === "flame" &&
      fireHeld &&
      cur.mag > 0 &&
      !P.isBusy() &&
      !G.player.sprinting;
    if (flaming) {
      v.flameEmit(dt);
      if (!S.flameSnd) {
        // ignition whoomph + pressurised roar loop (contract fire_loop as fallback)
        const ss = P.shotSound(w);
        if (ss.name !== "fire_loop")
          G.sfx.play(ss.name, { volume: 0.8 * ss.volume, pitch: ss.pitch });
        S.flameSnd = P.hasSfx("flamer_loop")
          ? P.snd("flamer_loop", null, {
              loop: true,
              volume: 0.85,
              pitch: ss.pitch,
            })
          : G.sfx.play("fire_loop", { loop: true, volume: 0.8, pitch: 1.3 });
      }
    } else if (S.flameSnd) {
      try {
        S.flameSnd.stop();
      } catch (e) {
        /* ignore */
      }
      S.flameSnd = null;
    }

    // --- fire
    const wantShot = w.automatic ? fireHeld : firePressed;
    if (wantShot && !G.player.sprinting) {
      if (P.action && P.action.name === "cycle") return;
      if (P.isBusy()) return;
      if (w.spinUp && v.spin < 0.95) return;
      if (w.magSize > 0 && cur.mag <= 0) {
        if (firePressed || S.emptyClickT <= 0) {
          G.sfx.play("empty_click", { volume: 0.7 });
          S.emptyClickT = 0.4;
          if (P.reserve(def) > 0) P.reload();
        }
        S.emptyClickT -= dt;
        return;
      }
      if (S.rofT > 0) return;
      S.rofT = Math.max(S.rofT, -0.02) + 1 / (w.rof || 3);
      P.fireOnce();
    } else S.emptyClickT = 0;
  };
