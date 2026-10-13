// play-inline-536 03 — cnt
// Lines 195-662 of readable/play-inline-536.pretty.js (statement-aligned).
  function run() {
    const res = [];
    const t = (name, fn) => {
      try {
        const r = fn();
        res.push([name, r === false ? "FAIL" : "ok"]);
        if (r === false) G.reportError("crafttest", name + " failed");
      } catch (e) {
        res.push([name, "ERR " + e.message]);
        G.reportError("crafttest:" + name, e);
      }
    };
    const inv = () => !G.isStub("inventory");
    const add = (id, n, o) =>
      G.inventory.add(id, n, Object.assign({ silent: true }, o || {}));
    const cnt = (id) => G.inventory.count(id) || 0;
    X.testSkill = 100;
    const day0 = G.time.day;

    t(
      "items registered",
      () =>
        !!X.def("cr_weapon_repair_kit") &&
        !!X.def("cr_lunchbox_mine") &&
        !!X.def("schematic_cr_lunchbox_mine") &&
        !!X.def("cr_ashbloom"),
    );
    t(
      "weapon defs visible to weapons",
      () => G.isStub("weapons") || !!G.weapons.getDef("cr_lunchbox_mine"),
    );
    t(
      "no missing recipe items",
      () =>
        X.missingIds.length === 0 ||
        (console.warn("[crafttest] missing", X.missingIds), false),
    );
    t("blueprints render", () =>
      Object.keys(X.ART).every(
        (k) => X.blueprint(k, { title: k, parts: 4 }).length > 400,
      ),
    );
    if (!inv()) {
      report(res);
      return;
    }

    // --- schematic learning + mine build (copies → count per batch) ---
    t("learn lunchbox mine schematic", () => {
      add("schematic_cr_lunchbox_mine", 1);
      return (X.S.schem.schematic_cr_lunchbox_mine | 0) === 1;
    });
    t("schematic consumed next frame", () => {
      X.flushLearned();
      return (
        cnt("schematic_cr_lunchbox_mine") === 0 &&
        (X.S.schem.schematic_cr_lunchbox_mine | 0) >= 1
      );
    });
    t("build lunchbox mine", () => {
      const row = X.recipes("workbench", "schematics").find(
        (r) => r.key === "schematic_cr_lunchbox_mine",
      );
      for (const [id, n] of row.parts) {
        const have = cnt(id);
        if (have < n) add(id, n - have);
      }
      const before = cnt("cr_lunchbox_mine");
      const r = X.craft(row, 1, "workbench");
      return (
        r.ok &&
        cnt("cr_lunchbox_mine") === before + row.n &&
        cnt("frag_mine") === 0
      );
    });
    t("missing parts refused", () => {
      const row = X.recipes("workbench", "schematics").find(
        (r) => r.key === "schematic_cr_lunchbox_mine",
      );
      return !X.craft(row, 1).ok;
    });
    // --- a weapons-owned schematic built through G.weapons.craft ---
    t("weapons schematic via crafting UI rows", () => {
      if (G.isStub("weapons")) return true;
      add("schematic_rivet_gun", 1);
      const row = X.recipes("workbench", "schematics").find(
        (r) => r.src === "wpn" && r.makes === "rivet_gun",
      );
      if (!row) return false;
      for (const [id, n] of row.parts) add(id, n);
      const before = cnt("rivet_gun");
      return X.craft(row, 1, "workbench").ok && cnt("rivet_gun") === before + 1;
    });
    t("workshop lists weapons + own", () => {
      const rows = X.recipes("workbench", "workshop");
      return (
        rows.some((r) => r.src === "cr") &&
        (G.isStub("weapons") || rows.some((r) => r.src === "wpn"))
      );
    });
    // --- chemistry / cooking / remedies ---
    // (recipe rows carry the real output / part ids, so the tests read them instead of naming shared item ids)
    const recipe = (key) => X.RECIPES.find((r) => r.id === key);
    const stock = (key, times) => {
      for (const [id, n] of recipe(key).parts) add(id, n * (times || 1));
    };
    t("chem: rally tonic", () => {
      const k = "cr_ch_rally_tonic",
        out = recipe(k).makes;
      stock(k);
      const b = cnt(out);
      return C.craft(k).ok && cnt(out) === b + 1;
    });
    t("cook: ox steak x2 (build max)", () => {
      const k = "cr_ck_ox_steak",
        out = recipe(k).makes,
        inp = recipe(k).parts[0][0];
      const c0 = cnt(inp);
      if (c0) G.inventory.remove(inp, c0, { silent: true });
      stock(k, 2);
      const b = cnt(out);
      const row = X.recipes("campfire", "cooking").find((r) => r.key === k);
      return (
        X.maxTimes(row) === 2 &&
        X.craft(row, 2, "campfire").ok &&
        cnt(out) === b + 2
      );
    });
    t("remedy: root poultice from forage", () => {
      const k = "cr_rm_root_poultice",
        out = recipe(k).makes;
      add("cr_ashbloom", 1);
      add("cr_knotroot", 1);
      const b = cnt(out);
      return C.craft(k).ok && cnt(out) === b + 1;
    });
    t("skill gate refuses", () => {
      X.testSkill = 0;
      stock("cr_ck_ripjaw_steak");
      const r = C.craft("cr_ck_ripjaw_steak");
      X.testSkill = 100;
      return !r.ok && /Survival/.test(r.reason);
    });
    t("workshop: gunsmith kit", () => {
      stock("cr_wk_repair_kit");
      return C.craft("cr_wk_repair_kit").ok && cnt("cr_weapon_repair_kit") >= 1;
    });
    // --- repair ---
    t("repair: duplicate cannibalise", () => {
      add("pistol_10mm", 2, { cond: 0.3 });
      G.inventory.setCondition("pistol_10mm", 0.15); // the starting pistol may already sit above the player's Mechanics cap
      const row = X.repairRows().find((r) => r.id === "pistol_10mm");
      const m = X.repairMethods(row).find((x) => x.key === "dup");
      const before = G.inventory.condition("pistol_10mm");
      const r = X.repair(row, m);
      return r.ok && G.inventory.condition("pistol_10mm") > before;
    });
    t("repair: kit at workbench", () => {
      add("cr_weapon_repair_kit", 1);
      G.inventory.setCondition("pistol_10mm", 0.3);
      const row = X.repairRows().find((r) => r.id === "pistol_10mm");
      const m = X.repairMethods(row).find((x) => x.key === "kit");
      const k0 = cnt("cr_weapon_repair_kit");
      const r = X.repair(row, m);
      return (
        r.ok &&
        cnt("cr_weapon_repair_kit") === k0 - 1 &&
        G.inventory.condition("pistol_10mm") > 0.49
      );
    });
    t("repair: kit from the inventory (use)", () => {
      G.inventory.equip("pistol_10mm");
      G.inventory.setCondition("pistol_10mm", 0.25);
      add("cr_weapon_repair_kit", 1);
      const k0 = cnt("cr_weapon_repair_kit");
      G.inventory.use("cr_weapon_repair_kit");
      return (
        cnt("cr_weapon_repair_kit") === k0 - 1 &&
        G.inventory.condition("pistol_10mm") > 0.44
      );
    });
    t("repair: kit refunded when nothing to fix", () => {
      G.inventory.setCondition("pistol_10mm", 1);
      const k0 = cnt("cr_weapon_repair_kit");
      G.inventory.use("cr_weapon_repair_kit");
      return cnt("cr_weapon_repair_kit") === k0;
    });
    // --- mods ---
    t("mod install", () => {
      if (G.isStub("weapons") || !X.def("mod_10mm_silencer")) return true;
      add("mod_10mm_silencer", 1);
      const row = X.modRows().find(
        (r) =>
          r.modId === "mod_10mm_silencer" &&
          r.wid === "pistol_10mm" &&
          !r.installed,
      );
      if (!row) return false;
      return (
        X.installMod(row).ok &&
        X.modsOf("pistol_10mm").indexOf("mod_10mm_silencer") >= 0
      );
    });
    // --- weapons-owned workshop batch: capped, one toast ---
    t("weapons workshop batch is capped and quiet", () => {
      if (G.isStub("weapons")) return true;
      const row = X.recipes("workbench", "workshop").find(
        (r) =>
          r.src === "wpn" &&
          r.parts.length &&
          r.parts.every(([id]) => X.def(id)) &&
          !Object.keys(r.req || {}).length,
      ); // weapons checks the real Mechanics skill
      if (!row) return true;
      for (const [id, n] of row.parts) add(id, n * 14);
      const n0 = G.notify;
      let toasts = 0;
      G.notify = function () {
        toasts++;
        return n0.apply(this, arguments);
      };
      let r;
      try {
        r = X.craft(row, 14, "workbench");
      } finally {
        G.notify = n0;
      }
      const ok = r.ok && r.n <= X.WPN_BATCH * (row.n || 1) && toasts <= 2;
      if (!ok)
        G.reportError(
          "crafttest",
          "batch detail " +
            row.key +
            " " +
            JSON.stringify(r) +
            " toasts=" +
            toasts +
            " parts=" +
            JSON.stringify(row.parts) +
            " blk=" +
            X.blocker(row, 14),
        );
      return ok;
    });
    // --- modify view (slots + stat preview) ---
    t("modify view rows + preview", () => {
      if (G.isStub("weapons")) return true;
      add("assault_rifle", 1);
      add("mod_rifle_ext_mag", 1);
      const row = X.modWeaponRows().find((r) => r.wid === "assault_rifle");
      if (!row) return false;
      const m = row.mods.find((x) => x.id === "mod_rifle_ext_mag");
      const pv = X.modPreview("assault_rifle", "mod_rifle_ext_mag");
      if (
        !m ||
        !m.can ||
        !pv ||
        !pv.next ||
        !(pv.next.magSize > pv.now.magSize)
      )
        return false;
      return (
        X.installModRow(row, m).ok &&
        X.modsOf("assault_rifle").indexOf("mod_rifle_ext_mag") >= 0
      );
    });
    t("modify lists every gun, condition-scaled damage", () => {
      if (G.isStub("weapons")) return true;
      add("hunting_rifle", 1, { cond: 0.5 });
      const rows = X.modWeaponRows();
      const hr = rows.find((r) => r.wid === "hunting_rifle");
      const pv = X.modPreview("hunting_rifle", null);
      return (
        !!hr &&
        !!pv &&
        pv.cond < 0.99 &&
        X.condMults("hunting_rifle", 0.5).damage < 1
      );
    });
    // --- reloading bench ---
    t(
      "reloading recipes valid",
      () =>
        X.recipes("reloading", "handload").length >= 5 &&
        X.RECIPES.filter((r) => r.tab === "breakdown" && !r.invalid).length >=
          7 &&
        X.recipes("reloading", "recycle").length >= 2,
    );
    t("break down never pays more than the round", () => {
      const v = (id) => {
        const d = X.def(id);
        return d ? d.value || 0 : 0;
      };
      const bad = [];
      for (const r of X.RECIPES)
        if (r.breakdown) {
          let sum = 0;
          for (const [id, n] of r.gives) sum += v(id) * n;
          if (sum > v(r.makes))
            bad.push(r.makes + " " + sum + ">" + v(r.makes));
        }
      return (
        !bad.length ||
        (console.warn("[crafttest] break-down exploit", bad), false)
      );
    });
    t("break down lists only carried ammo", () => {
      const c = cnt("ammo_44");
      if (c) G.inventory.remove("ammo_44", c, { silent: true });
      const none = !X.recipes("reloading", "breakdown").some(
        (r) => r.makes === "ammo_44",
      );
      add("ammo_44", 2);
      const some = X.recipes("reloading", "breakdown").some(
        (r) => r.makes === "ammo_44",
      );
      G.inventory.remove("ammo_44", 2, { silent: true });
      if (c) add("ammo_44", c);
      return none && some;
    });
    t("break down 5mm", () => {
      add("ammo_5mm", 10);
      const row = X.recipes("reloading", "breakdown").find(
        (r) => r.makes === "ammo_5mm",
      );
      const p0 = cnt("cr_primer_rifle"),
        l0 = cnt("cr_lead");
      const r = X.craft(row, 10, "reloading");
      return (
        r.ok &&
        cnt("ammo_5mm") === 0 &&
        cnt("cr_primer_rifle") === p0 + 10 &&
        cnt("cr_lead") === l0 + 10
      );
    });
    t("hand load 10mm", () => {
      add("cr_case_10mm", 4);
      add("cr_primer_pistol", 4);
      add("cr_powder", 8);
      add("cr_lead", 4);
      const row = X.recipes("reloading", "handload").find(
        (r) => r.makes === "ammo_10mm",
      );
      const b = cnt("ammo_10mm");
      return (
        X.maxTimes(row, 500) === 4 &&
        X.craft(row, 4, "reloading").ok &&
        cnt("ammo_10mm") === b + 4 &&
        cnt("cr_case_10mm") === 0
      );
    });
    t("recycle dead batteries", () => {
      const k = "cr_rc_dry_cell",
        out = recipe(k).makes;
      stock(k);
      const b = cnt(out);
      return C.craft(k).ok && cnt(out) === b + 4;
    });
    t("brass recovery from firing", () => {
      const def = G.isStub("weapons")
        ? { weapon: { ammo: "ammo_10mm" } }
        : G.weapons.getDef("pistol_10mm");
      const b = cnt("cr_case_10mm");
      for (let i = 0; i < 30; i++) G.events.emit("weaponFired", def);
      X.flushBrass(5);
      const got = cnt("cr_case_10mm") - b;
      return got >= 15 && got <= 30;
    });
    t("pending brass survives a save", () => {
      const b = cnt("cr_case_308");
      X.restoreBrass({ cr_case_308: 3 });
      X.flushBrass(0, true);
      return cnt("cr_case_308") === b + 3 && !!(X.S.tips && X.S.tips.brass);
    });
    t(
      "reloading benches have supply crates",
      () =>
        G.isStub("containers") ||
        !X.reloadBenches.length ||
        X.reloadBenches.every((b) => !!b.container) ||
        (console.warn(
          "[crafttest] benches without crates",
          JSON.stringify(C.reloadBenches()),
        ),
        false),
    );
    t(
      "reloading bench placed",
      () =>
        G.isStub("props") ||
        X.reloadBenches.length >= 1 ||
        (console.warn("[crafttest] no reloading bench"), false),
    );
    t("reloading screen opens", () => {
      const ok =
        C.open("reloading", { force: true }) && C.station() === "reloading";
      C.close();
      return ok;
    });
    // --- plants ---
    t(
      "plants built",
      () =>
        X.plants.length >= 20 ||
        (console.warn("[crafttest] plants", X.plants.length), false),
    );
    t("harvest + regrow", () => {
      const p = X.plants[0];
      if (!p) return false;
      const b = cnt("cr_ashbloom") + cnt("cr_knotroot");
      X.harvest(p);
      const got = cnt("cr_ashbloom") + cnt("cr_knotroot") > b && p.harvested;
      G.time.day += 4;
      X.syncPlants();
      const regrown = !p.harvested;
      G.time.day = day0;
      return got && regrown;
    });
    // --- stations & UI ---
    t("campfires found", () => G.isStub("props") || X.scanStations() > 0);
    t("workbench event opens crafting (not weapons)", () => {
      G.events.emit("workbench", null);
      const ok =
        C.isOpen() &&
        G.state === "crafting" &&
        !(G.weapons.isWorkbenchOpen && G.weapons.isWorkbenchOpen());
      return ok;
    });
    t("every tab renders + keys", () => {
      const ev = (code) =>
        G.events.emit("keydown", code, {
          code,
          repeat: false,
          preventDefault() {},
        });
      for (let i = 0; i < X.TABS.workbench.length; i++) {
        X.setTab(i);
        ev("ArrowDown");
        ev("ArrowUp");
        if (!X.ui.infoEl) return false;
      }
      X.setTab(4);
      ev("Digit1"); // repair method 1
      C.open("campfire");
      for (let i = 0; i < X.TABS.campfire.length; i++) {
        X.setTab(i);
        ev("KeyS");
      }
      ev("Escape");
      return !C.isOpen() && G.state === "play";
    });
    t("save/load roundtrip", () => {
      const had = X.S.schem.schematic_cr_lunchbox_mine | 0;
      const harvested = Object.keys(X.S.harvested).length;
      G.save.saveGame("crafttest", "crafttest");
      X.S = X.freshState();
      G.save.loadGame("crafttest");
      G.save.deleteSlot("crafttest");
      return (
        had > 0 &&
        (X.S.schem.schematic_cr_lunchbox_mine | 0) === had &&
        Object.keys(X.S.harvested).length === harvested
      );
    });
    X.testSkill = null;
    if (G.state !== "play") G.setState("play");
    report(res);
  }
