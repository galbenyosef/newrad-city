// play-inline-536 02 — add
// Lines 18-194 of readable/play-inline-536.pretty.js (statement-aligned).
  let armed = false,
    done = false,
    wait = 0;
  G.events.on("newGame", () => {
    armed = true;
    wait = 3;
  });

  X.testTick = function () {
    if (!armed || done || G.state !== "play") return;
    if (--wait > 0) return;
    done = true;
    if (G.QS.has("craftdemo")) demo(G.QS.get("craftdemo") || "workbench");
    else run();
  };

  /**
   * ?craftdemo=<station>[:<tab>] — screenshot helper: stocks the pockets with a
   * plausible mid-game haul and opens the station on that tab.
   */
  function demo(spec) {
    const [station, tab] = String(spec).split(":");
    if (station === "view") {
      // stand in front of reloading bench #tab, looking at it (world screenshot)
      const bch = X.reloadBenches[+tab || 0];
      if (!bch) {
        console.warn("[craftdemo] no reloading bench");
        return;
      }
      const fx = -Math.sin(bch.yaw),
        fz = -Math.cos(bch.yaw);
      // 3.2 m out in front, a little to the crate side, looking back at the bench; gun holstered
      const rx = Math.cos(bch.yaw),
        rz = -Math.sin(bch.yaw);
      let back = 3.2;
      try {
        const h = G.world.raycast(
          new THREE.Vector3(bch.x + fx * 0.5, bch.y + 1.2, bch.z + fz * 0.5),
          new THREE.Vector3(fx, 0, fz),
          3.5,
        );
        if (h) back = Math.max(1.6, h.dist - 0.1);
      } catch (e) {
        /* ignore */
      }
      G.player.teleport(
        bch.x + fx * back + rx * 0.6,
        bch.y,
        bch.z + fz * back + rz * 0.6,
        bch.yaw + Math.PI + 0.2,
      );
      G.player.pitch = -0.3;
      try {
        if (!G.isStub("weapons") && G.weapons.holster) G.weapons.holster(true);
      } catch (e) {
        /* ignore */
      }
      console.log("[craftdemo] bench", JSON.stringify(C.reloadBenches()));
      // &craftdump: surface every bench's placement in the shot result (tools/shot.py only prints G.errors)
      if (G.QS.has("craftdump"))
        G.errors.push(
          "[craftdump] " +
            JSON.stringify(
              C.reloadBenches().map((b) => [
                b.note,
                b.anchor,
                +b.x.toFixed(1),
                +b.y.toFixed(2),
                +b.z.toFixed(1),
                +((b.yaw / Math.PI) * 2).toFixed(0),
                X.reloadBenches[
                  X.reloadBenches.findIndex((r) => r.note === b.note)
                ].fit,
              ]),
            ) +
            " warn=" +
            JSON.stringify(
              (G.warnings || []).filter((w) => /crafting/.test(w)),
            ),
        );
      return;
    }
    const add = (id, n, o) => {
      try {
        if (X.def(id))
          G.inventory.add(id, n, Object.assign({ silent: true }, o || {}));
      } catch (e) {
        /* ignore */
      }
    };
    X.testSkill = 55;
    add("pistol_10mm", 1, { cond: 0.46 });
    add("assault_rifle", 1, { cond: 0.7 });
    add("hunting_rifle", 1, { cond: 0.35 });
    add("hunting_rifle", 1, { cond: 0.6 });
    try {
      G.inventory.equip("pistol_10mm");
    } catch (e) {
      /* ignore */
    }
    add("mod_10mm_silencer", 1);
    add("mod_rifle_scope", 1);
    add("cr_weapon_repair_kit", 2);
    add("ammo_10mm", 64);
    add("ammo_556", 90);
    add("ammo_308", 20);
    add("ammo_12ga", 16);
    add("ammo_5mm", 240);
    add("ammo_44", 12);
    add("cr_case_10mm", 37);
    add("cr_case_308", 9);
    add("cr_hull_12ga", 11);
    add("cr_primer_pistol", 25);
    add("cr_primer_rifle", 8);
    add("cr_powder", 60);
    add("cr_lead", 30);
    add("cr_drained_dry_cell", 14);
    add("dry_cell", 2);
    add("scrap_metal", 6);
    add("duct_tape", 3);
    add("tuff_bond", 2);
    add("tin_can", 4);
    add("surgical_tubing", 2);
    add("root_poultice", 3);
    add("dirty_water", 4);
    add("cr_ashbloom", 3);
    add("cr_knotroot", 2);
    add("purified_water", 2);
    add("beer", 1);
    add("schematic_cr_lunchbox_mine", 2);
    add("schematic_rivet_gun", 1);
    add("frag_mine", 2);
    add("lunchbox", 1);
    add("relay_board", 1);
    add("scrap_metal", 4);
    X.flushLearned();
    C.open(station || "workbench", { tab: tab || undefined, force: true });
    if (G.QS.has("craftsel")) {
      X.ui.sel = +G.QS.get("craftsel") || 0;
      if (G.QS.has("craftsub")) X.ui.sub = +G.QS.get("craftsub") || 0;
      if (G.QS.has("craftqty")) X.ui.qty = +G.QS.get("craftqty") || 1;
      X.render();
    }
    // &craftinfodump: surface the info column's scroll geometry in the shot result (debug only)
    if (G.QS.has("craftinfodump")) {
      try {
        const b = document.querySelector(".craft-scroll"),
          br = b.getBoundingClientRect();
        G.errors.push(
          "[craftinfodump] box " +
            Math.round(br.top) +
            "-" +
            Math.round(br.bottom) +
            " sh=" +
            b.scrollHeight +
            " ch=" +
            b.clientHeight +
            " " +
            Array.from(b.children)
              .map(
                (c) =>
                  c.tagName +
                  "." +
                  c.className +
                  "@" +
                  Math.round(c.getBoundingClientRect().top) +
                  "-" +
                  Math.round(c.getBoundingClientRect().bottom),
              )
              .join(" | "),
        );
      } catch (e) {
        G.errors.push("[craftinfodump] " + e);
      }
    }
  }

