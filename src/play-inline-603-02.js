// play-inline-603 02 — cat
// Lines 353-506 of readable/play-inline-603.pretty.js (statement-aligned).
  function activate(e, GG) {
    if (!e) return;
    const d = e.def || {};
    if (d.type === "weapon" || d.type === "apparel") {
      if (e.equipped) {
        H.call("inventory", "unequip", [e.id]);
        if (d.type === "weapon" && !H.has("inventory"))
          H.call("weapons", "equip", [null]);
        H.sfx("ui_back", { volume: 0.6 });
      } else {
        const ok = H.has("inventory", "equip")
          ? H.call("inventory", "equip", [e.id], true)
          : H.call("weapons", "equip", [e.id], true);
        H.sfx(
          ok === false
            ? "ui_error"
            : d.type === "weapon"
              ? "weapon_draw"
              : "pickup_armor",
          { volume: 0.7 },
        );
      }
    } else if (d.type === "aid" || d.book || d.type === "misc") {
      const r = H.call("inventory", "use", [e.id], null);
      if (r === false && d.type !== "aid") H.sfx("ui_error");
      if (d.type === "aid" && /rally_tonic/.test(e.id)) H.stats.tonics++;
    } else {
      H.sfx("ui_error");
      return;
    }
    GG.rerender();
  }
  function drop(e, all, GG) {
    if (!e) return;
    const d = e.def || {};
    if (d.quest || H.call("inventory", "canDrop", [e.id], true) === false) {
      G.notify("You can't drop that.");
      H.sfx("ui_error");
      return;
    }
    const doIt = () => {
      H.call("inventory", "drop", [e.id, all ? e.count : 1]);
      H.sfx("ui_click");
      GG.rerender();
    };
    if (all && e.count > 1)
      GG.confirm(
        "Drop all " + e.count + " " + nameOf(e) + "?",
        doIt,
        "Drop",
        "Cancel",
      );
    else if (e.equipped && d.type !== "ammo")
      GG.confirm(
        "Drop your equipped " + nameOf(e) + "?",
        doIt,
        "Drop",
        "Cancel",
      );
    else doIt();
  }

  function makePage(cat) {
    return {
      digits: cat === "weapons" || cat === "aid", // 1-8 assign quick slots here (not tab jumps)
      render(body, GG) {
        // review hook (screenshots only): &giveItems=1 stocks a representative kit
        if (G.SHOT && G.QS && G.QS.get("giveItems") && !H._gaveItems) {
          H._gaveItems = true;
          [
            "pistol_10mm",
            "pistol_10mm",
            "hunting_rifle",
            "combat_shotgun",
            "frag_grenade",
            "combat_armor",
            "leather_armor",
            "lab_coat",
            "fizzo_cola",
            "rally_tonic",
            "prussian_blue",
            "ammo_10mm",
            "teddy_bear",
          ].forEach((id) =>
            H.call("inventory", "add", [id, 1, { silent: true }]),
          );
          H.call("inventory", "equip", ["pistol_10mm"]);
          H.call("inventory", "setCondition", ["pistol_10mm", 0.38]);
          const sel = G.QS.get("ggSel");
          if (sel) GG.sel["inventory/" + cat] = Number(sel) || 0;
        }
        const items = listItems(cat);
        this.items = items;
        const cols = H.el("div", "gg-cols", body);
        const left = H.el("div", "gg-col-l", cols);
        const right = H.el("div", "gg-col-r", cols);
        H.ggList(
          left,
          items.map((e) => ({
            label: nameOf(e) + (e.count > 1 ? " (" + e.count + ")" : ""),
            mark: e.equipped ? "eq" : "",
            cls: e.def && e.def.quest ? "quest" : "",
          })),
          "inventory/" + cat,
          {
            empty: CATS[cat].empty,
            onSelect(i) {
              detail(right, items[i]);
            },
            onActivate(i) {
              activate(items[i], GG);
            },
          },
        );
        if (!items.length) detail(right, null);
      },
      hints() {
        const act =
          cat === "weapons" || cat === "apparel"
            ? "Equip"
            : cat === "aid" || cat === "misc"
              ? "Use"
              : "";
        const h = [];
        if (act) h.push(["Enter", act]);
        h.push(["R", "Drop"]);
        if (cat === "weapons" || cat === "apparel") h.push(["F", "Repair"]);
        if (cat === "weapons" || cat === "aid") h.push(["1-8", "Quick slot"]);
        return h;
      },
      onKey(code, e, GG) {
        const L = GG.activeList;
        const it = L && this.items ? this.items[L.sel] : null;
        if (code === "KeyR") {
          drop(it, e && e.shiftKey, GG);
          return true;
        }
        if (code === "KeyF" && it && (cat === "weapons" || cat === "apparel")) {
          repair(it, GG);
          return true;
        }
        const m = /^Digit([1-8])$/.exec(code);
        if (m && it && (cat === "weapons" || cat === "aid")) {
          H.call("weapons", "setFavorite", [Number(m[1]), it.id]);
          G.notify(nameOf(it) + " assigned to quick slot " + m[1] + ".");
          H.sfx("ui_select");
          GG.rerender();
          return true;
        }
        return false;
      },
    };
  }
  for (const c in CATS) H.ggPage("inventory", c, makePage(c));
