// play-inline-602 01 — callany
// Lines 16-311 of readable/play-inline-602.pretty.js (statement-aligned).
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
