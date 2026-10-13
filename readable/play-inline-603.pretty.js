/* src/ui_hud/32_gg_items.js */
/* =====================================================================
 * NEW RAD CITY — UI_HUD : GOGGLES  INVENTORY  (Weapons / Apparel / Aid /
 * Misc / Ammo)
 *   Enter/click  equip · unequip · use
 *   R            drop one   (Shift+R drop all)
 *   F            repair (uses a duplicate; Mechanics skill)
 *   1-8          assign a quick slot (weapons & aid)
 * The selected item shows a vector render of its real model
 * (27_itemrender.js) or a line-art plate (25_icons.js).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const H = G.hud._;

  const CATS = {
    weapons: { types: ["weapon"], empty: "No weapons carried." },
    apparel: { types: ["apparel"], empty: "No apparel carried." },
    aid: { types: ["aid"], empty: "No aid carried." },
    misc: { types: ["misc", "junk", "key"], empty: "No miscellaneous items." },
    ammo: { types: ["ammo"], empty: "No ammunition." },
  };
  const MONEY = { scrip: 1 };

  function listItems(cat) {
    const types = CATS[cat].types;
    let arr = [];
    for (const t of types)
      arr = arr.concat(H.call("inventory", "list", [t], []) || []);
    arr = arr.filter((x) => x && !MONEY[x.id] && x.count > 0);
    arr.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
    return arr;
  }
  function nameOf(e) {
    return (e.def && e.def.name) || H.itemName(e.id);
  }
  function cond(e) {
    let c = e.condition;
    if (c === undefined || c === null)
      c = H.call("inventory", "condition", [e.id], null);
    if (typeof c !== "number") return null;
    if (c > 1.001) c /= 100;
    return H.clamp(c, 0, 1);
  }
  function weaponBlock(e) {
    const d = e.def || {};
    if (d.weapon) return d.weapon;
    const w = H.call("weapons", "getDef", [e.id], null);
    return (w && (w.weapon || w)) || {};
  }
  function fmt(n) {
    return (Math.round(n * 10) / 10).toString();
  }
  function favSlotOf(id) {
    const favs = H.call("weapons", "favorites", [], null);
    if (!favs) return 0;
    if (Array.isArray(favs)) {
      const i = favs.indexOf(id);
      return i >= 0 ? i + 1 : 0;
    }
    for (const k in favs) if (favs[k] === id) return Number(k) || 0;
    return 0;
  }
  const ATTR_NAME = (k) => {
    const a = (H.attrList ? H.attrList() : []).find((x) => x[0] === k);
    return a ? a[1] : k;
  };

  function aidEffects(d) {
    const e = d.effects || {};
    const out = [];
    if (e.hp) out.push((e.hp > 0 ? "+" : "") + e.hp + " HP");
    if (e.hpOverTime)
      out.push("+" + e.hpOverTime[0] + " HP over " + e.hpOverTime[1] + "s");
    const rv = H.radsOf(e);
    if (rv) out.push((rv > 0 ? "+" : "") + rv + " RAD");
    if (e.radResist) out.push("Radiation resistance +" + e.radResist + "%");
    if (e.dr || e.armor) out.push("Armor +" + (e.dr || e.armor));
    const at = e.attrs || e.attributes;
    if (at)
      for (const k in at)
        out.push(ATTR_NAME(k) + " " + (at[k] > 0 ? "+" : "") + at[k]);
    if (e.skills)
      for (const k in e.skills)
        out.push(
          k.replace(/_/g, " ") +
            " " +
            (e.skills[k] > 0 ? "+" : "") +
            e.skills[k],
        );
    if (e.duration) out.push("for " + H.fmtTime(e.duration));
    if (e.addiction) out.push("Habit-forming");
    return out;
  }
  function apparelMods(d) {
    const m = {
      attrs: d.attrs || d.attributes,
      skills: d.skills,
      radResist: d.radResist,
      carry: d.carry,
      crit: d.crit,
      speedMult: d.speedMult,
    };
    let s = H.call("rpg", "modsSummary", [m], null);
    if (s === null) {
      const parts = [];
      if (m.attrs)
        for (const k in m.attrs)
          parts.push(
            ATTR_NAME(k) + " " + (m.attrs[k] > 0 ? "+" : "") + m.attrs[k],
          );
      if (d.radResist) parts.push("Radiation resistance +" + d.radResist + "%");
      s = parts.join(", ");
    }
    return s;
  }

  /** The equipped item this one would replace (same weapon slot / same apparel slot), or null. */
  function equippedRival(e, d) {
    if (!e || e.equipped || !d || (d.type !== "weapon" && d.type !== "apparel"))
      return null;
    const all = H.call("inventory", "list", [d.type], []) || [];
    for (const o of all) {
      if (!o || !o.equipped || o.id === e.id) continue;
      const od = o.def || H.call("items", "get", [o.id], {}) || {};
      if (d.type === "weapon") return o;
      if ((od.slot || "body") === (d.slot || "body")) return o;
    }
    return null;
  }
  /** Numeric stats used for the display + comparison: [label, value, higherIsBetter]. */
  function numStats(e, d) {
    const c = cond(e),
      out = [];
    if (d.type === "weapon") {
      const w = weaponBlock(e);
      const dmg = (w.damage || 0) * (w.pellets || 1);
      out.push(["DMG", dmg, true]);
      if (w.rof)
        out.push(["DPS", dmg * w.rof * (c === null ? 1 : 0.5 + c * 0.5), true]);
      out.push(
        ["WT", d.weight || 0, false],
        ["VAL", Math.round(d.value || 0), true],
      );
      const req = w.brawnReq || w.strReq;
      if (req) out.push(["BRAWN", req, false]);
    } else if (d.type === "apparel") {
      out.push(
        ["ARMOR", d.dr || d.armor || 0, true],
        ["WT", d.weight || 0, false],
        ["VAL", Math.round(d.value || 0), true],
      );
    } else {
      out.push(
        ["WT", d.weight || 0, false],
        ["VAL", Math.round(d.value || 0), true],
      );
      if (d.type === "ammo") out.push(["QTY", e.count, true]);
    }
    return out;
  }
  /** Comparison tag against the equipped item: ▲ better / ▼ worse. */
  function cmpTag(v, ov, better) {
    if (ov === undefined || ov === null) return "";
    const dlt = Math.round((v - ov) * 10) / 10;
    if (!dlt) return "";
    const good = better ? dlt > 0 : dlt < 0;
    return (
      '<span class="gg-cmp ' +
      (good ? "up" : "dn") +
      '">' +
      (good ? "&#9650;" : "&#9660;") +
      (dlt > 0 ? "+" : "") +
      fmt(dlt) +
      "</span>"
    );
  }

  function detail(el, e) {
    if (!e) {
      el._artTok = (el._artTok || 0) + 1;
      el.innerHTML =
        '<div class="gg-itemplate">' + H.glyph("item", "big") + "</div>";
      return;
    }
    const d = e.def || H.call("items", "get", [e.id], {}) || {};
    const c = cond(e);
    const rival = equippedRival(e, d);
    const rd = rival
      ? rival.def || H.call("items", "get", [rival.id], {}) || {}
      : null;
    const rstats = rival ? numStats(rival, rd) : [];
    const rmap = {};
    for (const r of rstats) rmap[r[0]] = r[1];
    const stats = numStats(e, d).map((st) => [
      st[0],
      fmt(st[1]) + (rival ? cmpTag(st[1], rmap[st[0]], st[2]) : ""),
    ]);
    let extra = "";
    if (d.type === "weapon") {
      const w = weaponBlock(e);
      if (w.ammo)
        extra += H.ggStat(
          "Ammunition",
          H.itemName(w.ammo) +
            " (" +
            H.call("inventory", "count", [w.ammo], 0) +
            ")",
        );
      if (w.skill)
        extra +=
          '<div class="gg-hint-sm">SKILL: ' +
          H.esc(H.up(String(w.skill).replace(/_/g, " "))) +
          "</div>";
    } else if (d.type === "apparel") {
      const mods = apparelMods(d);
      if (mods) extra += '<div class="gg-effects">' + H.esc(mods) + "</div>";
    } else if (d.type === "aid") {
      const ef = aidEffects(d);
      if (ef.length)
        extra +=
          '<div class="gg-effects">' +
          ef.map((x) => "&#9656; " + H.esc(x)).join("<br>") +
          "</div>";
    }
    if (
      c !== null &&
      (d.type === "weapon" || d.type === "apparel") &&
      d.hasCondition !== false
    ) {
      const rc = rival ? cond(rival) : null;
      stats.push([
        "COND",
        Math.round(c * 100) +
          "%" +
          (rc !== null && rival
            ? cmpTag(Math.round(c * 100), Math.round(rc * 100), true)
            : ""),
      ]);
    }
    if (rival)
      extra =
        '<div class="gg-cmpnote">COMPARED WITH EQUIPPED: ' +
        H.esc(H.up(nameOf(rival))) +
        "</div>" +
        extra;
    const fav = favSlotOf(e.id);
    // vector render of the real model; rendered on the next tick the first time so list scrolling never stalls
    const art = H.itemRender ? H.itemRender(d, e.id, true) : null;
    const tok = (el._artTok = (el._artTok || 0) + 1);
    if (art === undefined) {
      setTimeout(() => {
        if (el._artTok !== tok || !el.isConnected) return;
        const url = H.itemRender(d, e.id);
        const box = el.querySelector(".gg-itemplate");
        if (url && box && el._artTok === tok)
          box.innerHTML =
            '<img class="gg-itemrender" alt="" src="' + url + '">';
      }, 30);
    }
    el.innerHTML =
      '<div class="gg-itemplate">' +
      (art
        ? '<img class="gg-itemrender" alt="" src="' + art + '">'
        : H.itemIcon(d, e.id)) +
      "</div>" +
      '<div class="gg-dtitle">' +
      H.esc(H.up(nameOf(e))) +
      (e.count > 1 ? " (" + e.count + ")" : "") +
      (fav ? '<span class="gg-favtag">SLOT ' + fav + "</span>" : "") +
      (e.equipped ? '<span class="gg-favtag">EQUIPPED</span>' : "") +
      "</div>" +
      '<div class="gg-statgrid">' +
      stats
        .map(
          (s) =>
            '<div class="gg-sg"><span class="k">' +
            s[0] +
            "</span><span>" +
            s[1] +
            "</span></div>",
        )
        .join("") +
      "</div>" +
      (c !== null &&
      (d.type === "weapon" || d.type === "apparel") &&
      d.hasCondition !== false
        ? '<div style="margin:.3em 0">' +
          H.ggSeg(c, 20, c < 0.25 ? "red" : c < 0.5 ? "amber" : "") +
          "</div>"
        : "") +
      extra +
      (d.desc ? '<div class="gg-desc sm">' + H.esc(d.desc) + "</div>" : "") +
      (d.quest ? '<div class="gg-hint-sm">[ QUEST ITEM ]</div>' : "");
  }

  /** Repair: confirm with the condition before → after (Mechanics skill) and the duplicate it uses up. */
  function repair(it, GG) {
    if (!it) return;
    const d = it.def || {};
    if (!(d.type === "weapon" || d.type === "apparel")) {
      H.sfx("ui_error");
      return;
    }
    if (!H.call("inventory", "canRepair", [it.id], false)) {
      H.sfx("ui_error");
      const capv = H.call("inventory", "repairCap", [], null);
      const cur = cond(it);
      if (it.count >= 2 && cur !== null && cur >= 0.99)
        G.notify("The " + nameOf(it) + " is already in perfect condition.");
      else if (it.count >= 2 && typeof capv === "number")
        G.notify(
          "Your Mechanics skill is too low to repair the " +
            nameOf(it) +
            " any further.",
        );
      else G.notify("You need a duplicate " + nameOf(it) + " to repair it.");
      return;
    }
    const before = cond(it);
    const gain = H.call("inventory", "repairGain", [it.id], null);
    const doIt = () => {
      H.call("inventory", "repair", [it.id]);
      G.notify(nameOf(it) + " repaired.");
      GG.rerender();
    };
    if (before === null || typeof gain !== "number") {
      doIt();
      return;
    }
    const after = H.clamp(before + gain, 0, 1);
    const bar = (f, lab) =>
      '<div class="gg-rep-row"><span>' +
      lab +
      "</span>" +
      H.ggSeg(f, 20, f < 0.25 ? "red" : "") +
      "<span>" +
      Math.round(f * 100) +
      "%</span></div>";
    const sk = H.call("rpg", "skill", ["mechanics"], null);
    const html =
      '<div class="gg-rep">' +
      bar(before, "NOW") +
      bar(after, "AFTER") +
      '<div class="gg-rep-note">USES 1 ' +
      H.esc(H.up(nameOf(it))) +
      (typeof sk === "number" ? " &middot; MECHANICS " + Math.round(sk) : "") +
      "</div></div>";
    GG.confirm("Repair " + nameOf(it) + "?", doIt, "Repair", "Cancel", html);
  }

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
})();
