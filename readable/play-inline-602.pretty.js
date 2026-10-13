/* src/ui_hud/31_gg_status.js */
/* =====================================================================
 * NEW RAD CITY — UI_HUD : GOGGLES  STATUS
 *   VITALS      health, radiation, limb scan (wire schematic), needs,
 *               quick aid, pending level-up
 *   ATTRIBUTES  Brawn · Reflex · Grit · Wits · Senses · Presence (1–10)
 *   SKILLS      ten use-based skills (0–100) with growth progress
 *   TALENTS     talents taken
 *   EFFECTS     active effects (aid, radiation, apparel, conditions)
 *   RECORD      level, XP, standing, field statistics
 *
 * Reads G.rpg defensively through H.RPG (accepts several method names so
 * the pages keep working while the progression module changes).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const H = G.hud._;

  const R = () => (G.rpg && !G.rpg.__stub ? G.rpg : null);

  // ------------------------------------------------------------------
  // Progression data (names from the rulebook; rpg may override text)
  // ------------------------------------------------------------------
  const ATTRS = [
    [
      "brawn",
      "Brawn",
      "Raw strength. Melee damage and how much gear you can haul through the ruins.",
    ],
    [
      "reflex",
      "Reflex",
      "Hands and feet. Reload speed, sprinting and how well you hold a weapon on target under recoil.",
    ],
    ["grit", "Grit", "Toughness. Maximum health and resistance to radiation."],
    [
      "wits",
      "Wits",
      "A trained mind. Skills grow faster with use, and crafting goes further.",
    ],
    [
      "senses",
      "Senses",
      "Eyes and ears. Accuracy, how early you notice threats, and the odds of a critical hit.",
    ],
    [
      "presence",
      "Presence",
      "Bearing and voice. Persuasion, the prices traders give you, and who will follow you.",
    ],
  ];
  const SKILLS = [
    [
      "firearms",
      "Firearms",
      "Pistols, rifles, shotguns and gyrojets.",
      "Grows when you shoot at enemies.",
    ],
    [
      "melee",
      "Melee",
      "Blades, clubs, hammers and bare fists.",
      "Grows when your blows land.",
    ],
    [
      "explosives",
      "Explosives",
      "Grenades, mines, mortars and launchers.",
      "Grows when you detonate charges near enemies.",
    ],
    [
      "medicine",
      "Medicine",
      "How much a med-jet injector or a bandage restores, and how well you treat radiation and injuries.",
      "Grows when you heal yourself or others.",
    ],
    [
      "mechanics",
      "Mechanics",
      "Repairing weapons and gear, and getting the most from a workbench.",
      "Grows when you repair or craft.",
    ],
    [
      "electronics",
      "Electronics",
      "Teletype terminals, keypads, radios and old-world circuitry.",
      "Grows when you use terminals, keypads and radios.",
    ],
    [
      "stealth",
      "Stealth",
      "Moving unseen and unheard, and striking before you are noticed.",
      "Grows while you sneak past people undetected.",
    ],
    [
      "persuasion",
      "Persuasion",
      "Talking your way into and out of trouble.",
      "Grows when you win a persuasion check.",
    ],
    [
      "trade",
      "Trade",
      "Haggling with traders; better prices both ways.",
      "Grows when you buy and sell.",
    ],
    [
      "survival",
      "Survival",
      "Living off the city: food, water, shelter and finding your way.",
      "Grows when you eat, craft and explore.",
    ],
  ];
  /** Live attribute/skill lists (rpg may publish its own with names/descriptions). */
  function attrList() {
    const r = R(),
      l = r && (r.ATTRIBUTES || r.ATTRS),
      info = (r && r.ATTR_INFO) || {};
    if (Array.isArray(l) && l.length) {
      return l.map((a) => {
        if (Array.isArray(a)) return a;
        const id = typeof a === "string" ? a : a.id,
          i = info[id] || (typeof a === "object" ? a : {}),
          fb = ATTRS.find((x) => x[0] === id) || [];
        return [id, i.name || fb[1] || id, i.desc || fb[2] || ""];
      });
    }
    return ATTRS;
  }
  function skillList() {
    const r = R(),
      l = r && (r.SKILL_LIST || (Array.isArray(r.SKILLS) ? r.SKILLS : null)),
      info = (r && r.SKILL_INFO) || {};
    if (Array.isArray(l) && l.length) {
      return l.map((sk) => {
        const id = typeof sk === "string" ? sk : sk.id,
          i = info[id] || (typeof sk === "object" ? sk : {}),
          fb = SKILLS.find((x) => x[0] === id) || [];
        return [
          id,
          i.name || fb[1] || id,
          i.desc || fb[2] || "",
          i.grow || i.growth || fb[3] || "",
        ];
      });
    }
    return SKILLS;
  }
  H.ATTRS = ATTRS;
  H.SKILL_DEFS = SKILLS;
  H.attrList = attrList;
  H.skillList = skillList;

  /** Defensive progression adapter shared with the level-up screen. */
  const RPG = {
    attr(id) {
      const r = R();
      if (!r) return null;
      for (const fn of ["attr", "getAttr", "getAttribute", "attribute"])
        if (typeof r[fn] === "function") {
          try {
            const v = r[fn](id);
            if (typeof v === "number") return v;
          } catch (e) {
            /* next */
          }
        }
      const o = r.attributes || r.attrs;
      if (o && typeof o === "object" && typeof o[id] === "number") return o[id];
      return null;
    },
    attrBase(id) {
      const r = R();
      if (!r) return null;
      for (const fn of ["attrBase", "baseAttr", "attributeBase"])
        if (typeof r[fn] === "function") {
          try {
            const v = r[fn](id);
            if (typeof v === "number") return v;
          } catch (e) {
            /* next */
          }
        }
      return RPG.attr(id);
    },
    skill(id) {
      const v = H.call("rpg", "skill", [id], null);
      return typeof v === "number" ? v : null;
    },
    skillProgress(id) {
      const v = H.callAny("rpg", ["skillProgress", "skillXP"], [id], null);
      return typeof v === "number" ? H.clamp(v > 1 ? v / 100 : v, 0, 1) : null;
    },
    talents() {
      const v = H.callAny(
        "rpg",
        ["talents", "playerTalents", "ownedTalents", "takenTalents"],
        [],
        null,
      );
      if (Array.isArray(v))
        return v.map((t) =>
          typeof t === "string"
            ? H.callAny("rpg", ["talentDef", "getTalent"], [t], null) || {
                id: t,
                name: t,
              }
            : t,
        );
      return [];
    },
    talentList() {
      const v = H.callAny(
        "rpg",
        ["talentList", "availableTalents", "talentsAvailable"],
        [],
        null,
      );
      return Array.isArray(v) ? v : [];
    },
    talentPoints() {
      const v = H.callAny(
        "rpg",
        ["talentPoints", "unspentTalents", "talentPicks"],
        [],
        0,
      );
      return Number(v) || 0;
    },
    takeTalent(id, choice) {
      return H.callAny(
        "rpg",
        ["takeTalent", "pickTalent", "addTalent"],
        [id, choice],
        false,
      );
    },
    attrPoints() {
      const v = H.callAny(
        "rpg",
        ["attrPoints", "attributePoints", "unspentAttributePoints"],
        [],
        0,
      );
      return Number(v) || 0;
    },
    spendAttr(id) {
      return H.callAny(
        "rpg",
        [
          "spendAttrPoint",
          "spendAttributePoint",
          "raiseAttribute",
          "addAttrPoint",
        ],
        [id],
        false,
      );
    },
    standing() {
      const v = H.callAny("rpg", ["standing", "getStanding"], [], null);
      return typeof v === "number"
        ? v
        : R() && typeof R().standing === "number"
          ? R().standing
          : null;
    },
    standingTitle() {
      return H.callAny("rpg", ["standingTitle", "standingLabel"], [], null);
    },
    effects() {
      const v = H.call("rpg", "activeEffects", [], null);
      if (Array.isArray(v)) return v;
      const r = R();
      return r && Array.isArray(r.effects) ? r.effects : [];
    },
  };
  H.RPG = RPG;

  // ------------------------------------------------------------------
  // VITALS
  // ------------------------------------------------------------------
  const LIMBS = [
    ["head", "Head"],
    ["torso", "Torso"],
    ["leftArm", "L. Arm"],
    ["rightArm", "R. Arm"],
    ["leftLeg", "L. Leg"],
    ["rightLeg", "R. Leg"],
  ];
  function limbValues() {
    const out = {};
    const r = R();
    let all = null;
    if (r && typeof r.limbCondition === "function") {
      try {
        all = r.limbCondition();
      } catch (e) {
        all = null;
      }
    }
    if (!all && r && r.limbs) all = r.limbs;
    for (const l of LIMBS) {
      let v = all && all[l[0]] !== undefined ? all[l[0]] : 100;
      if (all && v <= 1 && v > 0) v *= 100;
      out[l[0]] = H.clamp(v / 100, 0, 1);
    }
    return out;
  }
  /** Wire schematic of the body (a scan, not a portrait): limbs outlined by condition. */
  function bodySVG(lv) {
    const st = (k) =>
      lv[k] <= 0.001 ? "bd crip" : lv[k] < 0.5 ? "bd hurt" : "bd";
    let grid = "";
    for (let y = 10; y <= 290; y += 20)
      grid += '<path class="grid" d="M10 ' + y + ' H190"/>';
    for (let x = 10; x <= 190; x += 20)
      grid += '<path class="grid" d="M' + x + ' 10 V290"/>';
    const pctT = (k) => Math.round(lv[k] * 100) + "%";
    const lab = (x, y, t, k, anchor, lx, ly) =>
      '<path class="lead" d="M' +
      lx +
      " " +
      ly +
      " L" +
      (anchor === "end" ? x + 4 : x - 4) +
      " " +
      y +
      '"/>' +
      '<text class="lbl" x="' +
      x +
      '" y="' +
      (y - 3) +
      '" text-anchor="' +
      anchor +
      '">' +
      t +
      '</text><text class="lbl dim" x="' +
      x +
      '" y="' +
      (y + 9) +
      '" text-anchor="' +
      anchor +
      '">' +
      pctT(k) +
      "</text>";
    return (
      '<svg class="gg-body-svg" viewBox="-70 0 340 300" preserveAspectRatio="xMidYMid meet">' +
      grid +
      // head: an ellipse with a sensor crosshair, no face
      '<ellipse class="' +
      st("head") +
      '" cx="100" cy="36" rx="17" ry="21"/><path class="grid" d="M83 36 H117 M100 15 V57"/>' +
      '<path class="' +
      st("torso") +
      '" d="M84 60 H116 L132 74 L126 150 L116 166 H84 L74 150 L68 74 Z"/><path class="grid" d="M100 62 V164 M74 110 H126"/>' +
      '<path class="' +
      st("leftArm") +
      '" d="M66 76 L52 82 L40 150 L36 196 L46 198 L54 152 L70 96 Z"/>' +
      '<path class="' +
      st("rightArm") +
      '" d="M134 76 L148 82 L160 150 L164 196 L154 198 L146 152 L130 96 Z"/>' +
      '<path class="' +
      st("leftLeg") +
      '" d="M84 168 L98 168 L96 230 L94 286 L80 286 L78 230 Z"/>' +
      '<path class="' +
      st("rightLeg") +
      '" d="M102 168 L116 168 L122 230 L120 286 L106 286 L104 230 Z"/>' +
      '<line class="scan" x1="20" x2="180" y1="0" y2="0"><animate attributeName="y1" values="12;288;12" dur="4.5s" repeatCount="indefinite"/><animate attributeName="y2" values="12;288;12" dur="4.5s" repeatCount="indefinite"/></line>' +
      lab(-66, 30, "HEAD", "head", "start", 82, 34) +
      lab(266, 104, "TORSO", "torso", "end", 126, 104) +
      lab(-66, 150, "L.ARM", "leftArm", "start", 44, 150) +
      lab(266, 168, "R.ARM", "rightArm", "end", 158, 160) +
      lab(-66, 250, "L.LEG", "leftLeg", "start", 82, 250) +
      lab(266, 250, "R.LEG", "rightLeg", "end", 118, 250) +
      "</svg>"
    );
  }
  function quickAid() {
    const ids = [
      ["rally_tonic", "Rally Tonic"],
      ["prussian_blue", "Prussian Blue"],
      ["iodine_tabs", "Iodine Tabs"],
      ["morphine_syrette", "Morphine Syrette"],
    ];
    return ids
      .map((x) => ({
        id: x[0],
        name: H.call("items", "get", [x[0]], null) ? H.itemName(x[0]) : x[1],
        n: H.call("inventory", "count", [x[0]], 0),
      }))
      .filter((x, i) => x.n > 0 || i < 2);
  }
  function needsRows() {
    let n = H.callAny("rpg", ["needs", "getNeeds"], [], null);
    if (!n && R() && R().needs && typeof R().needs === "object") n = R().needs;
    if (!n || n.on === false) return [];
    const row = (k, lab) => {
      let v = Number(n[k]) || 0;
      if (v > 1.001) v /= 1000;
      return [lab, v];
    };
    return [
      row("food", "Hunger"),
      row("water", "Thirst"),
      row("sleep", "Fatigue"),
    ];
  }

  H.ggPage("status", "vitals", {
    render(body, GG) {
      const P = G.player;
      const lv = limbValues();
      const wrap = H.el("div", "gg-vitals", body);
      const fig = H.el("div", "gg-figure", wrap);
      fig.innerHTML = H.ggHead("Biometric scan") + bodySVG(lv);
      const right = H.el("div", "gg-col-r", wrap);
      let lvPending = false;
      try {
        lvPending = !!(G.hud.levelUpPending && G.hud.levelUpPending());
      } catch (e) {
        lvPending = false;
      }
      let html = "";
      if (lvPending)
        html +=
          '<div class="gg-pending" data-act="levelup">&#9650; PROMOTION PENDING &middot; ENTER TO REVIEW</div>';
      const hp = H.pct(P.hp, P.maxHp);
      const radv = H.radsOf(),
        rate = P.radRate || 0;
      const res = H.callAny("rpg", ["radResist", "radResistance"], [], null);
      const sick = H.callAny(
        "rpg",
        ["radSicknessName", "radiationLevelName"],
        [],
        null,
      );
      const vr = (k, bar, v, cls) =>
        '<div class="gg-vrow ' +
        (cls || "") +
        '"><span class="k">' +
        H.esc(k) +
        "</span><span>" +
        bar +
        '</span><span class="v">' +
        H.esc(v) +
        "</span></div>";
      html +=
        H.ggHead("Vital signs") +
        '<div class="gg-vrows">' +
        vr(
          "HEALTH",
          H.ggSeg(hp, 24, hp < 0.25 ? "red" : hp < 0.5 ? "amber" : ""),
          Math.max(0, Math.round(P.hp)) + "/" + Math.round(P.maxHp),
          hp < 0.25 ? "red" : "",
        ) +
        vr(
          "RADIATION",
          H.ggSeg(radv / 1000, 24, radv >= 600 ? "red" : "amber"),
          Math.round(radv) + " RAD",
          radv >= 400 ? "red" : radv >= 200 ? "amber" : "",
        ) +
        vr(
          "EXPOSURE",
          H.ggSeg(H.clamp(rate / 10, 0, 1), 24, "amber"),
          rate.toFixed(1) + "/S",
          rate > 0.05 ? "amber" : "",
        ) +
        needsRows()
          .map((n) =>
            vr(
              H.up(n[0]),
              H.ggSeg(n[1], 24, n[1] > 0.6 ? "amber" : ""),
              Math.round(n[1] * 100) + "%",
              n[1] > 0.8 ? "red" : n[1] > 0.6 ? "amber" : "",
            ),
          )
          .join("") +
        "</div>" +
        (typeof res === "number"
          ? H.ggStat("Radiation resistance", Math.round(res) + "%")
          : "") +
        '<div class="gg-hint-sm">' +
        H.esc(
          sick ||
            (radv > 0
              ? "Mild exposure. No symptoms."
              : "No radiation sickness."),
        ) +
        "</div>";
      right.innerHTML = html;
      const pend = right.querySelector('[data-act="levelup"]');
      if (pend) pend.addEventListener("click", () => openLevelUp());
      const q = H.el("div", "gg-quick", right, H.ggHead("Field aid"));
      const aid = quickAid();
      this.aid = aid;
      H.ggList(
        q,
        aid.map((a) => ({ label: a.name, right: "x" + a.n, dim: a.n <= 0 })),
        "status/vitals",
        {
          empty: "No aid carried.",
          onActivate(i) {
            const a = aid[i];
            if (H.call("inventory", "count", [a.id], 0) <= 0) {
              H.sfx("ui_error");
              return;
            }
            H.call("inventory", "use", [a.id]);
            H.sfx("ui_select");
            GG.rerender();
          },
        },
      );
      this.pending = lvPending;
    },
    onKey(code) {
      if ((code === "KeyL" || code === "KeyU") && this.pending) {
        openLevelUp();
        return true;
      }
      return false;
    },
    hints() {
      return this.pending
        ? [
            ["Enter", "Use aid"],
            ["U", "Promotion"],
          ]
        : [["Enter", "Use aid"]];
    },
  });
  function openLevelUp() {
    if (H.combatActive()) {
      H.sfx("ui_error");
      G.notify("Not while enemies are nearby.");
      return;
    }
    H.sfx("ui_select");
    if (G.goggles && G.goggles.close) G.goggles.close();
    setTimeout(() => {
      if (G.state === "play" && G.hud.openLevelUp) G.hud.openLevelUp();
    }, 0);
  }

  // ------------------------------------------------------------------
  // ATTRIBUTES
  // ------------------------------------------------------------------
  /** Vector emblem per attribute (line art, no figures). */
  const ATTR_ART = {
    brawn:
      '<path class="fl" d="M40 70 h120 v20 h-120 z"/><path class="ln" d="M20 62 h20 v36 h-20 z M160 62 h20 v36 h-20 z M8 72 h12 v16 h-12 z M180 72 h12 v16 h-12 z"/>',
    reflex:
      '<path class="ln" d="M30 80 h40 l10 -30 l14 60 l12 -40 l8 10 h56"/><circle class="dm" cx="100" cy="80" r="46"/>',
    grit: '<path class="fl" d="M100 20 l60 22 v36 c0 34 -28 54 -60 66 c-32 -12 -60 -32 -60 -66 v-36 z"/><path class="ln" d="M100 44 v70 M70 80 h60"/>',
    wits: '<circle class="ln" cx="100" cy="80" r="54"/><circle class="dm" cx="100" cy="80" r="34"/><circle class="dm" cx="100" cy="80" r="14"/><path class="ln" d="M100 26 v108 M46 80 h108 M62 42 l76 76 M138 42 l-76 76"/>',
    senses:
      '<path class="ln" d="M24 80 c30 -46 122 -46 152 0 c-30 46 -122 46 -152 0 z"/><circle class="fl" cx="100" cy="80" r="22"/><path class="dm" d="M100 20 v20 M100 120 v20 M40 40 l12 12 M160 40 l-12 12"/>',
    presence:
      '<path class="ln" d="M40 100 h30 l50 30 v-100 l-50 30 h-30 z"/><path class="dm" d="M136 60 q16 20 0 40 M150 46 q30 34 0 68 M164 32 q44 48 0 96"/>',
  };
  H.ggPage("status", "attributes", {
    render(body) {
      const cols = H.el("div", "gg-cols", body);
      const left = H.el("div", "gg-col-l", cols);
      const right = H.el("div", "gg-col-r", cols);
      const list = attrList();
      const pts = RPG.attrPoints();
      if (pts > 0)
        H.el(
          "div",
          "gg-pending",
          left,
          "&#9650; " +
            pts +
            " ATTRIBUTE POINT" +
            (pts > 1 ? "S" : "") +
            " UNSPENT",
        );
      const items = list.map((a) => {
        const v = RPG.attr(a[0]),
          b = RPG.attrBase(a[0]);
        return {
          label: a[1],
          right:
            v === null
              ? "--"
              : String(v) +
                (b !== null && v !== b
                  ? " (" + (v > b ? "+" : "") + (v - b) + ")"
                  : ""),
        };
      });
      H.ggList(left, items, "status/attributes", {
        onSelect(i) {
          const a = list[i],
            v = RPG.attr(a[0]),
            b = RPG.attrBase(a[0]);
          let meter = '<div class="gg-attr-meter">';
          for (let k = 1; k <= 10; k++)
            meter +=
              '<i class="' +
              (v !== null && k <= Math.min(v, b === null ? v : b)
                ? "on"
                : v !== null && k <= v
                  ? "mod"
                  : "") +
              '"></i>';
          meter +=
            '</div><div class="gg-hint-sm" style="display:flex;justify-content:space-between"><span>1</span><span>5</span><span>10</span></div>';
          right.innerHTML =
            '<svg class="gg-art" viewBox="0 0 200 160">' +
            (ATTR_ART[a[0]] || ATTR_ART.wits) +
            "</svg>" +
            '<div class="gg-dtitle">' +
            H.esc(H.up(a[1])) +
            ' <span class="gg-dval">' +
            (v === null ? "--" : v) +
            "</span></div>" +
            meter +
            '<div class="gg-desc">' +
            H.esc(a[2]) +
            "</div>";
        },
      });
    },
  });

  // ------------------------------------------------------------------
  // SKILLS
  // ------------------------------------------------------------------
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
})();
