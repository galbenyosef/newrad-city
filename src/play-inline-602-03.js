// play-inline-602 03 — right
// Lines 633-850 of readable/play-inline-602.pretty.js (statement-aligned).
  H.ggPage("status", "skills", {
    render(body) {
      const cols = H.el("div", "gg-cols", body);
      const left = H.el("div", "gg-col-l", cols);
      const right = H.el("div", "gg-col-r", cols);
      const list = skillList();
      const items = list.map((s) => {
        const v = RPG.skill(s[0]);
        return {
          label: s[1],
          right: v === null ? "--" : String(Math.round(v)),
        };
      });
      H.ggList(left, items, "status/skills", {
        onSelect(i) {
          const s = list[i],
            v = RPG.skill(s[0]),
            prog = RPG.skillProgress(s[0]);
          right.innerHTML =
            '<div class="gg-dtitle">' +
            H.esc(H.up(s[1])) +
            ' <span class="gg-dval">' +
            (v === null ? "--" : Math.round(v)) +
            "</span></div>" +
            '<div class="gg-vrow"><span class="k">LEVEL</span><span>' +
            H.ggSeg((v || 0) / 100, 25) +
            '</span><span class="v">' +
            (v === null ? "--" : Math.round(v)) +
            "/100</span></div>" +
            (prog !== null
              ? '<div class="gg-vrow"><span class="k">NEXT POINT</span><span>' +
                H.ggBar(prog) +
                '</span><span class="v">' +
                Math.round(prog * 100) +
                "%</span></div>"
              : "") +
            '<div class="gg-desc">' +
            H.esc(s[2]) +
            "</div>" +
            (s[3]
              ? '<div class="gg-hint-sm">&#9656; ' + H.esc(s[3]) + "</div>"
              : "");
        },
      });
    },
  });

  // ------------------------------------------------------------------
  // TALENTS
  // ------------------------------------------------------------------
  H.ggPage("status", "talents", {
    render(body) {
      const cols = H.el("div", "gg-cols", body);
      const left = H.el("div", "gg-col-l", cols);
      const right = H.el("div", "gg-col-r", cols);
      const tal = RPG.talents();
      const nm = (t) =>
        (typeof t.name === "function" ? t.name() : t.name) || t.id;
      const ds = (t) =>
        (typeof t.desc === "function" ? t.desc() : t.desc) || "";
      H.ggList(
        left,
        tal.map((t) => ({
          label: nm(t),
          right: (t.ranks || 1) > 1 ? "R" + (t.rank || 1) + "/" + t.ranks : "",
        })),
        "status/talents",
        {
          empty: "No talents yet. Each promotion grants one.",
          onSelect(i) {
            const t = tal[i];
            right.innerHTML =
              '<svg class="gg-art" viewBox="0 0 200 120"><path class="fl" d="M100 10 L114 48 L154 50 L122 74 L134 112 L100 90 L66 112 L78 74 L46 50 L86 48 Z"/><circle class="dm" cx="100" cy="62" r="56"/></svg>' +
              '<div class="gg-dtitle">' +
              H.esc(H.up(nm(t))) +
              '</div><div class="gg-desc">' +
              H.esc(ds(t)) +
              "</div>";
          },
        },
      );
      if (!tal.length)
        right.innerHTML =
          '<div class="gg-empty">' +
          H.glyph("talent") +
          " TALENTS ARE CHOSEN ON PROMOTION.</div>";
    },
  });

  // ------------------------------------------------------------------
  // EFFECTS
  // ------------------------------------------------------------------
  const BAD =
    /radiation|addiction|limb|withdrawal|sick|poison|bleed|crippled|hunger|thirst|fatigue/;
  H.ggPage("status", "effects", {
    render(body) {
      const eff = RPG.effects();
      const w = H.el("div", "gg-col-r", body);
      if (!eff.length) {
        w.innerHTML =
          H.ggHead("Active effects") +
          '<div class="gg-empty">NO ACTIVE EFFECTS.<br>AID, FOOD, RADIATION AND APPAREL BONUSES APPEAR HERE.</div>';
        return;
      }
      let html = H.ggHead("Active effects");
      for (const e of eff) {
        const rem = e.remaining > 0 ? H.fmtTime(e.remaining) : "";
        html +=
          '<div class="gg-eff-row' +
          (BAD.test(String(e.kind || "") + " " + String(e.id || ""))
            ? " bad"
            : "") +
          '"><div class="gg-eff-name"><span>' +
          H.esc(H.up(e.name || e.id)) +
          "</span>" +
          (rem ? '<span class="gg-eff-t">' + rem + "</span>" : "") +
          '</div><div class="gg-desc sm">' +
          H.esc(e.desc || "") +
          "</div></div>";
      }
      w.innerHTML = html;
    },
    hints() {
      return [];
    },
  });

  // ------------------------------------------------------------------
  // RECORD  (level, XP, standing, statistics)
  // ------------------------------------------------------------------
  H.ggPage("status", "record", {
    render(body) {
      const r = R();
      const lv = H.level();
      const xp = (r && r.xp) || 0;
      const cur = H.call("rpg", "xpForLevel", [lv], 0),
        next = H.call("rpg", "xpForLevel", [lv + 1], 0);
      const prog =
        r && typeof r.levelProgress === "function"
          ? r.levelProgress()
          : next > cur
            ? (xp - cur) / (next - cur)
            : 1;
      const sv = RPG.standing(),
        stt = RPG.standingTitle();
      const st =
        r && r.stats
          ? typeof r.stats === "function"
            ? r.stats()
            : r.stats
          : {};
      const hs = H.stats;
      const pick = (a, b) => (a !== undefined ? a : b);
      const rows = [
        ["Quests completed", pick(st.questsCompleted, hs.questsDone)],
        [
          "Locations discovered",
          G.discovered ? G.discovered.size : hs.locations,
        ],
        ["People killed", pick(st.humanKills, hs.kills)],
        ["Creatures killed", st.creatureKills || 0],
        ["Machines destroyed", st.robotKills || 0],
        [
          "Codes found",
          st.codesFound !== undefined
            ? st.codesFound
            : H.knownCodes
              ? H.knownCodes().length
              : 0,
        ],
        ["Locks opened", st.locksOpened || 0],
        [
          "Persuasion successes",
          st.persuasionSuccesses || st.speechSuccesses || 0,
        ],
        ["TONICS taken", pick(st.tonicsUsed, hs.tonics)],
        ["Critical hits", pick(st.criticalHits, hs.crits)],
        ["Sneak attacks", st.sneakAttacks || 0],
        ["World's Fair medallions", st.medallions || 0],
        ["Scrip found", st.scripFound || 0],
        ["Days in the city", (G.time && G.time.day) || 1],
        ["Time awake", H.fmtTime(hs.playSeconds)],
      ];
      const cols = H.el("div", "gg-cols", body);
      const left = H.el("div", "gg-col-r", cols);
      left.style.flex = "0 0 40%";
      left.innerHTML =
        H.ggHead("Personnel file") +
        H.ggStat("Name", H.heroName()) +
        H.ggStat("Program", "Project Long Winter") +
        H.ggStat("Status", "Sleeper / revived 1989") +
        '<div class="gg-rule"></div>' +
        H.ggStat("Level", lv) +
        H.ggStat("Experience", Math.round(xp) + " / " + Math.round(next || 0)) +
        H.ggBar(prog) +
        '<div class="gg-rule"></div>' +
        (sv !== null || stt
          ? H.ggHead("Standing") +
            '<div class="gg-dtitle">' +
            H.esc(H.up(stt || "Unknown")) +
            "</div>" +
            (sv !== null
              ? '<div class="gg-vrow"><span class="k">FEARED</span><span>' +
                H.ggBar((H.clamp(sv, -1000, 1000) + 1000) / 2000) +
                '</span><span class="v">TRUSTED</span></div>'
              : "")
          : "");
      const right = H.el("div", "gg-col-l", cols);
      right.style.flex = "1";
      H.el("div", "gg-h", right, "[ FIELD STATISTICS ]");
      H.ggList(
        right,
        rows.map((x) => ({ label: x[0], right: String(x[1]) })),
        "status/record",
        {},
      );
    },
  });
