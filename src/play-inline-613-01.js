// play-inline-613 01 — check
// Lines 24-339 of readable/play-inline-613.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const X = G._uix;

  const trees = {};
  let A = null; // active conversation
  let cam = null; // camera animation state
  let ui = null; // DOM refs
  // persisted: chosen responses, failed checks, passed checks, standing already granted
  const memory = { used: {}, failed: {}, passed: {}, standing: {} };

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  const val = (v, actor) => (typeof v === "function" ? v(actor, A) : v);
  function standingTitle() {
    try {
      if (X.live("rpg")) {
        if (typeof G.rpg.standingTitle === "function")
          return G.rpg.standingTitle();
      }
    } catch (e) {
      /* ignore */
    }
    return "Stranger";
  }
  function subst(s) {
    const name = X.heroName();
    return String(s == null ? "" : s)
      .replace(/\{(player|name|hero)\}/g, name)
      .replace(/\{standing\}/g, standingTitle);
  }
  function nodeText(node, actor) {
    let t = val(node.text, actor);
    if (Array.isArray(t)) t = t[Math.floor(Math.random() * t.length)];
    return subst(t || "...");
  }
  function respKey(r, idx) {
    return (
      A.id +
      ":" +
      A.nodeId +
      ":" +
      (r.id ||
        idx +
          ":" +
          String(typeof r.text === "string" ? r.text : "").slice(0, 24))
    );
  }
  function rpgCall(fn, def) {
    try {
      if (X.live("rpg") && typeof G.rpg[fn] === "function") return G.rpg[fn]();
    } catch (e) {
      /* ignore */
    }
    return def;
  }

  /** Copy of a check spec with attr / skill ids normalised (case, display names). */
  function normCheck(c) {
    if (!c) return c;
    const o = Object.assign({}, c);
    if (o.attr) o.attr = X.attrId(o.attr);
    if (o.skill) o.skill = X.skillId(o.skill);
    return o;
  }
  const respStanding = (r) => r.standing;

  /**
   * Non-skill gates. Hidden replies return {hide:true}:
   *   {talent:'id'}                 → "[Talent Name]" — only shown when the hero has it.
   *   {item:'id', count:2, take?}   → "[Item x2]" — red & unselectable when missing; take removes them.
   *   {scrip:100, pay?:true}        → "[100 Scrip]" — red & unselectable when you can't pay; pay spends it.
   *   {standing:'trusted'|...}      → "[Trusted]" — only shown at that standing.
   *   {gender:'m'|'f'}              → hero gender gate (the hero is male), no tag.
   *   {level:n}                     → "[Level n]" threshold.
   */
  function evalGate(check, r) {
    if (check.gender)
      return String(check.gender)[0].toLowerCase() === "m"
        ? { kind: "gate", ok: true, label: "", cls: "", locked: false }
        : { hide: true };
    if (check.talent) {
      const id = check.talent;
      let has = false,
        nm = X.prettify(id);
      try {
        if (X.live("rpg")) {
          has = !!(G.rpg.hasTalent && G.rpg.hasTalent(id));
          const d = G.rpg.talentDef && G.rpg.talentDef(id);
          if (d && d.name) nm = d.name;
        }
      } catch (e) {
        /* ignore */
      }
      if (!has) return { hide: true };
      return {
        kind: "gate",
        ok: true,
        label: "[" + (check.label || nm) + "]",
        cls: "talent",
        locked: false,
      };
    }
    if (check.standing !== undefined && typeof check.standing === "string") {
      const want = String(check.standing).toLowerCase();
      const lab = String(rpgCall("standingLabel", "Neutral")).toLowerCase();
      if (lab.indexOf(want) < 0) return { hide: true };
      return {
        kind: "gate",
        ok: true,
        label: "[" + X.prettify(want.replace(/ /g, "_")) + "]",
        cls: "talent",
        locked: false,
      };
    }
    if (check.item) {
      const n = check.count || 1,
        have = X.invCount(check.item);
      const ok = have >= n;
      if (!ok && check.hideIfMissing) return { hide: true };
      return {
        kind: "gate",
        ok,
        label: "[" + X.itemName(check.item) + (n > 1 ? " x" + n : "") + "]",
        cls: ok ? "item" : "bad",
        locked: !ok,
        consume: check.take ? { id: check.item, n } : null,
      };
    }
    if (check.scrip !== undefined) {
      const n = check.scrip,
        ok = X.scrip() >= n;
      return {
        kind: "gate",
        ok,
        label: "[" + n + " Scrip]",
        cls: ok ? "item" : "bad",
        locked: !ok,
        consume: check.pay ? { id: X.CUR, n } : null,
      };
    }
    if (check.level) {
      const ok = X.level() >= check.level;
      return {
        kind: "threshold",
        ok,
        label: "[Level " + check.level + "]",
        cls: ok ? "" : "bad",
        locked: !ok && !r.failNext,
      };
    }
    return null;
  }
  /** Skills rolled as a chance (talking people round) rather than a hard threshold. */
  const CHANCE_SKILLS = { persuasion: 1, trade: 1 };
  function evalCheck(raw, r) {
    if (!raw) return null;
    const check = normCheck(raw);
    if (
      check.talent ||
      check.item ||
      check.scrip !== undefined ||
      typeof check.standing === "string" ||
      check.gender ||
      check.level
    )
      return evalGate(check, r);
    if (check.attr) {
      const k = check.attr;
      const have = X.attr(k),
        need = check.value || 5;
      const ok = have >= need;
      return {
        kind: "threshold",
        ok,
        attr: k,
        need,
        label: "[" + (X.ATTR_NAMES[k] || X.prettify(k)) + " " + need + "]",
        cls: ok ? "" : "bad",
        locked: !ok && !r.failNext,
      };
    }
    const sk = check.skill || "persuasion";
    const have = X.skill(sk),
      need = check.value || 50;
    const name = X.SKILL_NAMES[sk] || X.prettify(sk);
    if (CHANCE_SKILLS[sk] || check.chance) {
      let chance =
        have >= need
          ? 100
          : Math.round((have / need) * 100 + (X.attr("presence") - 5) * 2);
      chance = X.clamp(chance, 2, 100);
      return {
        kind: "chance",
        chance,
        skill: sk,
        need,
        label: "[" + name + " " + chance + "%]",
        cls: chance >= 75 ? "" : chance >= 40 ? "hard" : "bad",
        locked: false,
      };
    }
    const ok = have >= need;
    return {
      kind: "threshold",
      ok,
      skill: sk,
      need,
      label: "[" + name + " " + need + "]",
      cls: ok ? "" : "bad",
      locked: !ok && !r.failNext,
    };
  }
  /** Resolve a skill/attribute check: rpg's check API when present (it also grows Persuasion), else locally. */
  function rollCheck(ck) {
    try {
      if (X.live("rpg") && typeof G.rpg.check === "function") {
        const q = ck.attr
          ? { attr: ck.attr, value: ck.need }
          : { skill: ck.skill, value: ck.need };
        const res = G.rpg.check(q, {
          random: ck.kind === "chance",
          chance: ck.kind === "chance" ? ck.chance / 100 : undefined,
          source: "dialogue",
        });
        if (res && typeof res.success === "boolean") return res.success;
      }
    } catch (e) {
      G.reportError("dialogue:check", e);
    }
    return ck.kind === "chance" ? Math.random() * 100 < ck.chance : !!ck.ok;
  }
  function actorGender(actor) {
    if (!actor) return "m";
    const g =
      actor.gender ||
      (actor.def && actor.def.gender) ||
      (actor.char && actor.char.gender) ||
      (actor.opts && actor.opts.gender);
    if (g) return String(g)[0].toLowerCase() === "f" ? "f" : "m";
    return "m";
  }
  void actorGender;

  // ------------------------------------------------------------------
  // Camera framing
  // ------------------------------------------------------------------
  const _v1 = new THREE.Vector3(),
    _v2 = new THREE.Vector3(),
    _look = new THREE.PerspectiveCamera();
  const _q = new THREE.Quaternion();
  const _box = new THREE.Box3();
  const _side = new THREE.Vector3();
  let headSize = 0; // height of the NPC's head bounds (m) from the last actorHead() call, 0 = unknown
  const DLG_FOV = 42; // close-up: narrow lens, face fills the upper-centre third
  const _eyeTmp = new THREE.Vector3();
  /**
   * World-space point to frame (the NPC's eyes). characters exposes `char.sockets.eyes` and a
   * `char.parts.head` hit-zone marker at the head centre with `userData.radius`; older/other rigs fall
   * back to the head's mesh bounds, then to body height. Sets `headSize` (m) for shot distance.
   */
  function actorHead(actor, out) {
    headSize = 0;
    if (!actor) return null;
    const ch = actor.char;
    try {
      const head = ch && ch.parts && ch.parts.head;
      const hr = head && head.userData && head.userData.radius;
      if (hr && !(ch.parts.torso === head))
        headSize = X.clamp(hr * 2, 0.12, 0.9);
      const eyes = ch && ch.sockets && ch.sockets.eyes;
      if (eyes && eyes.getWorldPosition) {
        eyes.updateWorldMatrix(true, false); // parents only — cheap
        eyes.getWorldPosition(out);
        if (head && head.getWorldPosition) {
          head.updateWorldMatrix(true, false);
          // eyes socket sits at the face surface; pull the aim point back toward the head centre
          head.getWorldPosition(_eyeTmp);
          out.x = out.x * 0.5 + _eyeTmp.x * 0.5;
          out.z = out.z * 0.5 + _eyeTmp.z * 0.5;
        }
        if (isFinite(out.x)) return out;
      }
      if (head && head.updateWorldMatrix) {
        head.updateWorldMatrix(true, true);
        _box.setFromObject(head);
        if (!_box.isEmpty()) {
          _box.getCenter(out);
          if (!headSize) headSize = X.clamp(_box.max.y - _box.min.y, 0.12, 0.9);
          out.y += (_box.max.y - _box.min.y) * 0.12; // eyes sit a little above the centre
          if (isFinite(out.x)) return out;
        }
        head.getWorldPosition(out); // marker = head centre
        out.y += (headSize || 0.24) * 0.12;
        if (isFinite(out.x)) return out;
      }
    } catch (e) {
      /* fall through */
    }
    const p = actor.pos || (ch && ch.root && ch.root.position);
    if (!p) return null;
    const hgt = (ch && ch.height) || actor.height || 1.8;
    return out.set(p.x, p.y + hgt * 0.93, p.z);
  }
  function actorHeight(actor) {
    return (
      (actor && ((actor.char && actor.char.height) || actor.height)) || 1.8
    );
  }
  /**
   * Dialogue close-up. The camera sits ~0.85 m in front of the NPC's face (scaled by the
   * head's size, so brutes/robots still fit), a touch off-axis, and aims slightly below the
   * eyes so they sit ~30% from the top of the frame — above the dialogue box at the bottom.
   */
