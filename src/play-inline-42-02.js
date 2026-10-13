// play-inline-42 02 — cls
// Lines 363-578 of readable/play-inline-42.pretty.js (statement-aligned).
  R("rl_break_open", 0.6, (k) => {
    click(k, 0, 2400, 0.6);
    clack(k, 0.04, 700, 0.8);
    thump(k, 0.04, 0.5);
    k.tone({
      type: "sine",
      start: 0.13,
      f: 900,
      f2: 600,
      glide: 0.04,
      a: 0.001,
      d: 0.04,
      peak: 0.2,
    });
    scrape(k, 0.15, 0.05, 2000, 1500, 0.3);
    k.burst({
      kind: "pink",
      start: 0.35,
      a: 0.001,
      d: 0.03,
      peak: 0.3,
      type: "bandpass",
      f: 600,
      q: 1.2,
    });
    k.burst({
      kind: "pink",
      start: 0.43,
      a: 0.001,
      d: 0.03,
      peak: 0.22,
      type: "bandpass",
      f: 650,
      q: 1.2,
    });
  });
  R("rl_break_close", 0.4, (k) => {
    clack(k, 0.01, 800, 1);
    thump(k, 0.01, 1);
    click(k, 0.02, 3000, 0.5);
  });
  // --- battery / canister (siren horn's lantern battery; flamer fuel)
  R("rl_cell_in", 0.5, (k) => {
    scrape(k, 0, 0.06, 1600, 2200, 0.3);
    click(k, 0.07, 3200, 0.8);
    clack(k, 0.07, 1500, 0.5);
    k.tone({
      type: "square",
      start: 0.13,
      f: 1760,
      f2: 2350,
      glide: 0.02,
      a: 0.002,
      d: 0.05,
      peak: 0.1,
      filter: ["lowpass", 3000],
    });
    k.tone({
      type: "sine",
      start: 0.19,
      f: 3520,
      a: 0.002,
      d: 0.04,
      peak: 0.08,
    });
  });
  // --- lever action cycle (BB gun)
  R(
    "rl_lever",
    0.35,
    (k) => {
      scrape(k, 0, 0.05, 2000, 2800, 0.35);
      clack(k, 0.06, 1300, 0.8);
    },
    { variants: 3 },
  );
  // --- the floor
  R(
    "rl_mag_drop",
    0.7,
    (k) => {
      clack(k, 0, 1600, 0.8);
      clack(k, k.rr(0.1, 0.14), 1700, 0.4);
      scrape(k, 0.2, 0.08, 1400, 900, 0.2);
    },
    { wet: 0.8 },
  );
  R(
    "rl_brass_drop",
    1.2,
    (k) => {
      const n = 4 + ((k.r() * 3) | 0);
      for (let i = 0; i < n; i++)
        casing(k, k.rr(0, 0.35), k.rr(3000, 4600), k.rr(0.5, 1));
    },
    { wet: 0.8, gain: 0.4 },
  );

  // ------------------------------------------------------------------
  // Bridge: the weapons module's pitch-marked 'reload' steps → phase recipes
  // ------------------------------------------------------------------
  const CLASS_SETS = {
    pistol: ["rl_pistol_out", "rl_pistol_in", "rl_pistol_slide", "rl_mag_drop"],
    rifle: ["rl_rifle_out", "rl_rifle_in", "rl_rifle_charge", "rl_mag_drop"],
    heavy: ["rl_heavy_out", "rl_heavy_in", "rl_rifle_charge"],
    revolver: [
      "rl_revolver_open",
      "rl_revolver_in",
      "rl_revolver_close",
      "rl_brass_drop",
    ],
    bolt: ["rl_bolt_open", "rl_round_in", "rl_bolt_close", "rl_lever"],
    launcher: ["rl_launcher_open", "rl_launcher_load", "rl_launcher_close"],
    breakaction: ["rl_break_open", "rl_break_close"],
    cell: ["rl_cell_in"],
  };
  function weaponClass(cur) {
    const w = cur.weapon || {},
      rt = w.reloadType || "mag",
      vm = String(w.viewmodel || cur.id || "");
    if (rt === "melee" || rt === "throw") return null;
    if (rt === "revolver") return "revolver";
    if (rt === "breakaction") return "breakaction";
    if (rt === "cell") return "cell";
    if (rt === "single" || rt === "bb")
      return /missile|recoilless/.test(vm) ? "launcher" : "bolt";
    if (rt === "drum" || /minigun|belt_fed/.test(vm)) return "heavy";
    return /pistol|rivet/.test(vm) ? "pistol" : "rifle";
  }
  function current() {
    try {
      return !G.isStub("weapons") && G.weapons.current
        ? G.weapons.current()
        : null;
    } catch (e) {
      return null;
    }
  }
  /**
   * Resolve a player (non-positional) 'reload' / reload-time 'ricochet' to the phase recipe. Returns the recipe name
   * or null to leave the call alone. Pitch markers used by src/weapons/55_actions.js: mag 1.15 out · 0.92 in · 1.35
   * charge (jam: 1.2 charge); revolver 1.35 open · 0.95 in · 1.5 close; single 1.4 open · 1.25–1.35 round · 1.0 close;
   * break 1.2 open · 0.85 close; lever cycle 1.8 / 2.0.
   */
  S.reloadFoley = function (name, opts) {
    if (opts.pos || opts._exact) return null;
    const cur = current();
    if (!cur || !cur.weapon) return null;
    const cls = weaponClass(cur);
    if (!cls) return null;
    const p = opts.pitch || 1;
    let reloading = true;
    try {
      if (G.weapons.isReloading) reloading = !!G.weapons.isReloading();
    } catch (e) {
      /* */
    }
    if (name === "ricochet") {
      if (!reloading || (opts.volume === undefined ? 1 : opts.volume) > 0.2)
        return null;
      return cls === "revolver"
        ? "rl_brass_drop"
        : cls === "pistol" || cls === "rifle"
          ? "rl_mag_drop"
          : null;
    }
    if (name !== "reload") return null;
    if (cur.weapon.cycle === "lever" && p >= 1.7) return "rl_lever";
    switch (cls) {
      case "revolver":
        return p >= 1.45
          ? "rl_revolver_close"
          : p >= 1.2
            ? "rl_revolver_open"
            : "rl_revolver_in";
      case "bolt":
        return p >= 1.38
          ? "rl_bolt_open"
          : p >= 1.15
            ? "rl_round_in"
            : "rl_bolt_close";
      case "launcher":
        return p >= 1.38
          ? "rl_launcher_open"
          : p >= 1.15
            ? "rl_launcher_load"
            : "rl_launcher_close";
      case "breakaction":
        return p >= 1.05 ? "rl_break_open" : "rl_break_close";
      case "cell":
        return "rl_cell_in";
      default: {
        const set = CLASS_SETS[cls];
        if (!reloading || p >= 1.25)
          return cls === "pistol" ? "rl_pistol_slide" : "rl_rifle_charge"; // charging / jam clear
        return p >= 1.05 ? set[0] : set[1];
      }
    }
  };
  /** Bake the equipped weapon's handling set ahead of the first reload. */
  function hintFor(cur) {
    const cls = cur && weaponClass(cur),
      set = cls && CLASS_SETS[cls];
    if (set)
      for (const n of set) {
        S.hintBake(n, 1);
        S.pinned.add(n);
      }
  }
  G.events.on("weaponEquipped", () => {
    // unpin the previous weapon's set (the report pins are handled elsewhere); pin the new one
    for (const c in CLASS_SETS)
      for (const n of CLASS_SETS[c]) S.pinned.delete(n);
    setTimeout(() => hintFor(current()), 0);
  });
  S.RELOAD_SETS = CLASS_SETS;
