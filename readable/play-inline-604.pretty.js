/* src/ui_hud/33_gg_quests.js */
/* =====================================================================
 * NEW RAD CITY — UI_HUD : GOGGLES  QUESTS
 *   sections   ALL / MAIN / SIDE / MISC                  (A/D)
 *   filter     ACTIVE / COMPLETED / FAILED               (Z / X / C or click)
 *   each quest description, current objective, the full objective history
 *              with ticks, location, giver, rewards, a TRACK button (Enter)
 *              and SHOW ON MAP (M).
 * Category: q.category ('main'|'side'|'misc') if the quest defines one,
 * else main → MAIN, q.misc → MISC, everything else SIDE.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const H = G.hud._;

  const ST = { filter: "active" };
  function catOf(q) {
    const c = String(q.category || q.kind || "").toLowerCase();
    if (c === "main" || c === "side" || c === "misc") return c;
    return q.main ? "main" : q.misc ? "misc" : "side";
  }
  function statusOf(q) {
    return q.completed || q.status === "completed"
      ? "completed"
      : q.failed || q.status === "failed"
        ? "failed"
        : "active";
  }
  function allQuests() {
    return (H.call("quests", "list", [], []) || []).filter(Boolean);
  }
  function objectives(q) {
    if (Array.isArray(q.objectives)) return q.objectives;
    if (Array.isArray(q.stages)) {
      const cur = q.stage;
      let seen = false;
      const out = [];
      for (const s of q.stages) {
        const isCur = s.id === cur;
        out.push({
          text: typeof s.text === "function" ? s.text() : s.text,
          done: !!s.done || (!isCur && !seen && !!cur) || q.completed,
          current: isCur && !q.completed,
        });
        if (isCur) {
          seen = true;
          if (!q.completed) break;
        }
      }
      return out;
    }
    return [];
  }
  function markersOf(q) {
    return (H.call("quests", "activeMarkers", [true], []) || []).filter(
      (m) => m && m.questId === q.id,
    );
  }
  function locationOf(q) {
    if (q.location) return q.location;
    const m = markersOf(q).find((x) => !G.LAYOUT.isInterior(x.x));
    const l = m && G.LAYOUT.locationAt ? G.LAYOUT.locationAt(m.x, m.z) : null;
    if (l) return l.name;
    if (m) {
      const d = G.LAYOUT.districtAt(m.x, m.z);
      return H.DISTRICT_NAMES[d] || "";
    }
    return "";
  }
  function rewardsOf(q) {
    const r = q.rewards || {},
      out = [];
    if (r.xp) out.push("+" + r.xp + " XP");
    const money = r.scrip || r.money;
    if (money) out.push(money + " SCRIP");
    const items = r.items || r.item;
    if (items)
      (Array.isArray(items) ? items : [items]).forEach((it) => {
        const id = typeof it === "string" ? it : it && (it.id || it[0]);
        const n = it && (it.count || it[1]);
        if (id) out.push(H.up(H.itemName(id)) + (n > 1 ? " x" + n : ""));
      });
    if (r.standing)
      out.push((r.standing > 0 ? "+" : "") + r.standing + " STANDING");
    if (r.talent) out.push("TALENT");
    if (r.text) out.push(H.up(r.text));
    return out;
  }
  H.questCategory = catOf;

  function page(cat) {
    return {
      render(body, GG) {
        const all = allQuests().filter(
          (q) => cat === "all" || catOf(q) === cat,
        );
        const counts = { active: 0, completed: 0, failed: 0 };
        for (const q of all) counts[statusOf(q)]++;
        const qs = all.filter((q) => statusOf(q) === ST.filter);
        // grouped by category when showing ALL (main first)
        const order = { main: 0, side: 1, misc: 2 };
        qs.sort(
          (a, b) =>
            order[catOf(a)] - order[catOf(b)] ||
            (b.startedAt || 0) - (a.startedAt || 0),
        );
        const tracked = H.call("quests", "tracked", [], null);
        const cols = H.el("div", "gg-cols", body);
        const left = H.el("div", "gg-col-l", cols);
        const right = H.el("div", "gg-col-r", cols);
        const fl = H.el("div", "gg-qfilter", left);
        [
          ["active", "Active", "Z"],
          ["completed", "Completed", "X"],
          ["failed", "Failed", "C"],
        ].forEach((f) => {
          const b = H.el(
            "div",
            "gg-qf" + (ST.filter === f[0] ? " on" : ""),
            fl,
            H.esc(H.up(f[1])) + '<span class="n">' + counts[f[0]] + "</span>",
          );
          b.addEventListener("click", () => {
            ST.filter = f[0];
            H.sfx("ui_click", { volume: 0.5 });
            GG.rerender();
          });
        });
        const items = [];
        this.qs = [];
        let lastCat = null;
        for (const q of qs) {
          const c = catOf(q);
          if (cat === "all" && c !== lastCat) {
            items.push({
              head: true,
              label: c === "main" ? "Main" : c === "side" ? "Side" : "Misc",
            });
            this.qs.push(null);
            lastCat = c;
          }
          const st = statusOf(q);
          items.push({
            label: q.name,
            mark: q.id === tracked && st === "active" ? "track" : "",
            dim: st !== "active",
            cls: (c === "main" ? "main" : "") + (st === "failed" ? " red" : ""),
            right:
              st === "completed" ? "DONE" : st === "failed" ? "FAILED" : "",
          });
          this.qs.push(q);
        }
        const self = this;
        H.ggList(left, items, "quests/" + cat + "/" + ST.filter, {
          empty:
            ST.filter === "active"
              ? "NO ACTIVE QUESTS."
              : ST.filter === "completed"
                ? "NOTHING COMPLETED YET."
                : "NO FAILED QUESTS.",
          onSelect(i) {
            const q = self.qs[i];
            if (q) detail(right, q, GG);
          },
          onActivate(i) {
            const q = self.qs[i];
            if (q) toggleTrack(q, GG);
          },
        });
        if (!qs.length)
          right.innerHTML =
            '<div class="gg-empty">' +
            H.glyph("quest") +
            " QUEST LOG &middot; " +
            H.esc(H.up(ST.filter)) +
            " &middot; " +
            H.esc(H.up(cat)) +
            "</div>";
      },
      current(GG) {
        const L = GG.activeList;
        return L && this.qs ? this.qs[L.sel] : null;
      },
      onKey(code, e, GG) {
        const f = { KeyZ: "active", KeyX: "completed", KeyC: "failed" }[code];
        if (f) {
          if (ST.filter !== f) {
            ST.filter = f;
            H.sfx("ui_click", { volume: 0.5 });
            GG.rerender();
          }
          return true;
        }
        if (code === "KeyM") {
          showOnMap(this.current(GG), GG);
          return true;
        }
        if (code === "KeyT") {
          const q = this.current(GG);
          if (q) toggleTrack(q, GG);
          return true;
        }
        return false;
      },
      hints() {
        return [
          ["Enter", "Track"],
          ["M", "Show on map"],
          ["Z/X/C", "Active/Done/Failed"],
        ];
      },
    };
  }
  function toggleTrack(q, GG) {
    if (statusOf(q) !== "active") {
      H.sfx("ui_error");
      return;
    }
    const tr = H.call("quests", "tracked", [], null);
    H.call("quests", "setTracked", [tr === q.id ? null : q.id]);
    H.sfx("ui_select");
    GG.rerender();
  }
  function showOnMap(q, GG) {
    const m = q && markersOf(q).find((x) => !G.LAYOUT.isInterior(x.x));
    const wp = GG.pages["map/city"];
    if (m && wp) {
      wp.view = { cx: m.x, cz: m.z, zoom: 1.1 };
      wp.selected = null;
    }
    GG.setTab("map", "city");
  }
  function detail(el, q, GG) {
    const st = statusOf(q),
      c = catOf(q);
    const obj = objectives(q);
    const cur = obj.filter((o) => o.current && !o.done);
    const tracked = H.call("quests", "tracked", [], null) === q.id;
    const loc = locationOf(q);
    const rew = rewardsOf(q);
    const tick = (o) =>
      o.failed
        ? "[!]"
        : o.done
          ? "[&#10003;]"
          : o.current
            ? "[&#9656;]"
            : "[ ]";
    el.innerHTML =
      '<div class="gg-dtitle">' +
      H.esc(H.up(q.name)) +
      '<span class="gg-tag">' +
      H.up(c) +
      "</span>" +
      (st !== "active"
        ? '<span class="gg-tag ' +
          (st === "failed" ? "red" : "") +
          '">' +
          H.up(st) +
          "</span>"
        : "") +
      "</div>" +
      '<div class="gg-qmeta">' +
      '<span class="k">GIVER</span><span>' +
      H.esc(H.up(q.giver || "—")) +
      "</span>" +
      '<span class="k">LOCATION</span><span>' +
      H.esc(H.up(loc || "—")) +
      "</span>" +
      '<span class="k">REWARDS</span><span class="gg-rewards">' +
      (rew.length
        ? rew.map((r) => "<span>" + H.esc(r) + "</span>").join("")
        : "<i>—</i>") +
      "</span>" +
      "</div>" +
      (st === "active" && cur.length
        ? '<div class="gg-qnow"><div class="k">CURRENT OBJECTIVE</div>' +
          cur
            .map(
              (o) =>
                '<div class="t">' +
                H.esc(o.text) +
                (o.optional ? ' <span class="opt">(optional)</span>' : "") +
                "</div>",
            )
            .join("") +
          "</div>"
        : "") +
      (q.desc ? '<div class="gg-desc">' + H.esc(q.desc) + "</div>" : "") +
      H.ggHead("Objective log") +
      '<div class="gg-objs">' +
      (obj.length
        ? obj
            .map(
              (o) =>
                '<div class="gg-obj' +
                (o.done ? " done" : "") +
                (o.failed ? " failed" : "") +
                (o.current && !o.done ? " cur" : "") +
                '"><span class="bx">' +
                tick(o) +
                '</span><span class="tx">' +
                H.esc(o.text) +
                (o.optional ? ' <span class="opt">(optional)</span>' : "") +
                "</span></div>",
            )
            .join("")
        : '<div class="gg-empty">NO ENTRIES.</div>') +
      "</div>" +
      (st === "active"
        ? '<div class="gg-trackbtn' +
          (tracked ? " on" : "") +
          '">[ ' +
          (tracked ? "TRACKED &middot; ENTER TO UNTRACK" : "TRACK QUEST") +
          ' ]</div> <div class="gg-trackbtn gg-mapbtn">[ SHOW ON MAP ]</div>'
        : "");
    const tb = el.querySelector(".gg-trackbtn:not(.gg-mapbtn)");
    if (tb) tb.addEventListener("click", () => toggleTrack(q, GG));
    const mb = el.querySelector(".gg-mapbtn");
    if (mb) mb.addEventListener("click", () => showOnMap(q, GG));
  }
  for (const c of ["all", "main", "side", "misc"])
    H.ggPage("quests", c, page(c));
})();
