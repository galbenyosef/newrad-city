/* src/ui_interact/10_dialogue.js */
/* =====================================================================
 * NEW RAD CITY — ui_interact / 10_dialogue.js
 * G.dialogue — dialogue ENGINE + UI (goggle style).
 *
 *  - Camera eases in to frame the NPC's face (G.player.camOverride),
 *    letterbox bars, vignette, NPC name + subtitle, numbered responses.
 *  - Checks: [Persuasion 45%] / [Trade 60%] (chance roll), [Electronics 50] /
 *    [Wits 7] thresholds, tagged [PASSED]/[FAILED]; a failed check can't be
 *    retried. Resolved through G.rpg.check when rpg provides it.
 *  - Standing feedback, barter hand-off (returns to the conversation),
 *    previously chosen lines greyed out (remembered across saves).
 *  - `learn: 'lock_id'|[...]` on a node (when shown) or a response (when
 *    chosen and passed) logs that code with G.locks (Goggles → NOTES → CODES).
 *  - No spoken voice: dialogue is text only.
 *
 * Tree format:
 *  { start:'id'|fn, nodes:{ id:{ speaker?, text:str|fn|[variants], onEnter?(actor)→nodeId?, learn?,
 *      responses:[{ text, next?, cond?, action?, check?, failNext?, standing?, barter?, end?, retry?, learn? }] } } }
 *  check: {skill:'persuasion'|'trade'|'electronics'|..., value} | {attr:'presence'|'wits'|..., value}
 *       | {talent:id} | {item:id, count?, take?} | {scrip:n, pay?} | {standing:'trusted'|...} | {level:n}
 * ===================================================================== */
(function () {
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
  function computeShot(actor, outPos, outQuat) {
    const face = actorHead(actor, _v1);
    if (!face) return false;
    // direction from NPC face toward the player (horizontal)
    _v2.set(A.eyeX - face.x, 0, A.eyeZ - face.z);
    let d = _v2.length();
    if (d < 0.01) {
      _v2.set(0, 0, 1);
      d = 1;
    }
    _v2.divideScalar(d);
    const hgt = actorHeight(actor);
    const hs = headSize || X.clamp(hgt * 0.14, 0.2, 0.6); // unknown rig → estimate from body height
    let dist = X.clamp(hs * 3.4, 0.72, 2.0);
    // don't let the camera slide into a wall behind the player
    try {
      const hit = G.world.raycast(face, _v2, dist + 0.2, {
        ignoreTags: ["actor", "interactable_self"],
      });
      if (hit && hit.dist < dist + 0.2) dist = Math.max(0.42, hit.dist - 0.2);
    } catch (e) {
      /* raycast optional */
    }
    const side = _side.set(-_v2.z, 0, _v2.x);
    const off = dist * 0.1; // slight 3/4 angle, like the games
    outPos.set(
      face.x + _v2.x * dist + side.x * off,
      face.y + hs * 0.04,
      face.z + _v2.z * dist + side.z * off,
    );
    // keep the camera above the NPC's floor (small creatures) — never relative to the player
    const feetY =
      actor.pos && isFinite(actor.pos.y) ? actor.pos.y : G.player.pos.y || 0;
    outPos.y = Math.max(outPos.y, feetY + 0.35);
    // aim below the eyes so they land ≈20% above screen centre (≈30% from the top) at FOV 42 — the face
    // (mouth included) clears the reply box, which sits under the chin
    const drop = dist * Math.tan((DLG_FOV * 0.5 * Math.PI) / 180) * 0.4;
    _look.position.copy(outPos);
    _look.lookAt(
      face.x + side.x * off * 0.4,
      face.y - drop,
      face.z + side.z * off * 0.4,
    );
    outQuat.copy(_look.quaternion);
    return true;
  }
  function playerViewQuat(out) {
    const e = new THREE.Euler(G.player.pitch, G.player.yaw, 0, "YXZ");
    return out.setFromEuler(e);
  }
  function camUpdate(realDt) {
    if (!cam) return;
    const C = G.camera;
    if (!C) return;
    cam.t += realDt;
    if (cam.mode === "in") {
      const k = G.util.smoothstep(0, cam.dur, cam.t);
      if (A && A.actor && computeShot(A.actor, cam.toPos, cam.toQuat)) {
        // once framed, a barely-there handheld drift keeps the close-up alive (≈1 cm; aim unchanged)
        if (k >= 1 && !G.SHOT) {
          const t = cam.t,
            amp = 0.011;
          cam.toPos.x += _side.x * Math.sin(t * 0.37) * amp;
          cam.toPos.z += _side.z * Math.sin(t * 0.37) * amp;
          cam.toPos.y += Math.sin(t * 0.29 + 1.3) * amp * 0.6;
        }
        C.position.lerpVectors(cam.fromPos, cam.toPos, k);
        _q.copy(cam.fromQuat).slerp(cam.toQuat, k);
        C.quaternion.copy(_q);
      }
      const fov = G.util.lerp(cam.fromFov, DLG_FOV, k);
      if (Math.abs(C.fov - fov) > 0.01) {
        C.fov = fov;
        C.updateProjectionMatrix();
      }
    } else if (cam.mode === "out") {
      const k = G.util.smoothstep(0, cam.dur, cam.t);
      const P = G.player;
      _v2.set(
        P.pos.x,
        P.pos.y + (P.sneaking ? P.sneakEyeHeight : P.eyeHeight),
        P.pos.z,
      );
      C.position.lerpVectors(cam.fromPos, _v2, k);
      playerViewQuat(cam.toQuat);
      _q.copy(cam.fromQuat).slerp(cam.toQuat, k);
      C.quaternion.copy(_q);
      const fov = G.util.lerp(cam.fromFov, P.fovCurrent || P.fovBase || 72, k);
      C.fov = fov;
      C.updateProjectionMatrix();
      if (cam.t >= cam.dur) {
        P.camOverride = false;
        cam = null;
        if (P.applyCamera) P.applyCamera(0);
      }
    }
  }
  function camBegin() {
    const C = G.camera;
    if (!C || !A.actor) return;
    G.player.camOverride = true;
    cam = {
      mode: "in",
      t: 0,
      dur: 0.6,
      fromPos: C.position.clone(),
      fromQuat: C.quaternion.clone(),
      toPos: new THREE.Vector3(),
      toQuat: new THREE.Quaternion(),
      fromFov: C.fov,
    };
  }
  function camEnd() {
    const C = G.camera;
    if (!C || !G.player.camOverride || !cam) {
      G.player.camOverride = false;
      cam = null;
      return;
    }
    cam = {
      mode: "out",
      t: 0,
      dur: 0.35,
      fromPos: C.position.clone(),
      fromQuat: C.quaternion.clone(),
      toQuat: new THREE.Quaternion(),
      fromFov: C.fov,
    };
  }

  function faceActor(actor) {
    if (!actor) return;
    try {
      const eye = G.player.eye;
      if (typeof actor.faceTowards === "function")
        actor.faceTowards(eye.x, eye.z);
      else if (typeof actor.faceToward === "function") actor.faceToward(eye);
      else if (typeof actor.faceTo === "function") actor.faceTo(eye);
      else if (typeof actor.face === "function") actor.face(eye);
      else if (actor.pos) {
        const dx = eye.x - actor.pos.x,
          dz = eye.z - actor.pos.z;
        actor.yaw = Math.atan2(-dx, -dz); // global yaw convention (CONTRACT §1)
        if (typeof actor.applyYaw === "function") actor.applyYaw();
      }
      if (actor.char && actor.char.lookAt) actor.char.lookAt(eye);
      if (actor.char && actor.char.setAnim)
        actor.char.setAnim("talk", { loop: true });
    } catch (e) {
      G.reportError("dialogue:face", e);
    }
  }
  function releaseActor(actor) {
    if (!actor || !actor.char) return;
    try {
      if (actor.char.lookAt) actor.char.lookAt(null);
      if (actor.char.setAnim && !actor.dead)
        actor.char.setAnim("idle", { loop: true });
    } catch (e) {
      /* ignore */
    }
  }

  // ------------------------------------------------------------------
  // UI
  // ------------------------------------------------------------------
  function buildUI() {
    const root = G.ui.el("div", "ui-screen dlg-wrap");
    root.innerHTML =
      // (depth of field behind the speaker is atmosphere's post-fx: 44_post_dof.js, profile 'dialogue')
      '<div class="dlg-vignette"></div><div class="dlg-bar top"></div><div class="dlg-bar bot"></div>' +
      // one translucent box low on screen — NPC line on top, a rule, then the numbered replies.
      '<div class="dlg-box">' +
      '<div class="dlg-said"></div>' +
      '<div class="dlg-npc"><div class="dlg-name"></div><div class="dlg-line"></div><div class="dlg-standing"></div></div>' +
      '<div class="dlg-rule"></div>' +
      '<div class="dlg-resp"><ol></ol></div>' +
      "</div>" +
      '<div class="dlg-foot ui-keys"><span><b>1-9</b>Choose</span><span><b>W/S</b>Select</span><span><b>E</b>Say</span><span><b>TAB</b>Leave</span></div>';
    ui = {
      root,
      said: root.querySelector(".dlg-said"),
      name: root.querySelector(".dlg-name"),
      line: root.querySelector(".dlg-line"),
      standing: root.querySelector(".dlg-standing"),
      list: root.querySelector(".dlg-resp ol"),
      resp: root.querySelector(".dlg-resp"),
    };
    requestAnimationFrame(() => root.classList.add("on"));
    setTimeout(() => root.classList.add("on"), 30);
  }
  function destroyUI() {
    if (ui) {
      ui.root.remove();
      ui = null;
    }
  }

  /**
   * renderNode(tag) — tag = {ok, label, text} describes the reply the player just picked when it
   * carried a check. That line is echoed above the NPC's answer with its result:
   *   "[Speech 56%] [FAILED] Lower your prices."
   */
  function renderNode(tag) {
    if (!A || !ui) return;
    const node = A.node;
    const speaker = subst(
      val(node.speaker, A.actor) ||
        (A.actor && A.actor.name) ||
        A.opts.name ||
        "",
    );
    ui.name.textContent = speaker;
    if (tag && tag.text) {
      ui.said.innerHTML =
        '<span class="chk">' +
        X.esc(tag.label || "") +
        "</span>" +
        (tag.gate
          ? ""
          : '<span class="dlg-tag ' +
            (tag.ok ? "ok" : "bad") +
            '">[' +
            (tag.ok ? "PASSED" : "FAILED") +
            "]</span>") +
        X.esc(tag.text);
      ui.said.classList.remove("show");
      void ui.said.offsetWidth;
      ui.said.classList.add("show");
    } else {
      ui.said.innerHTML = "";
      ui.said.classList.remove("show");
    }
    const text = A.lineText;
    ui.line.classList.remove("show");
    ui.line.textContent = text;
    void ui.line.offsetWidth; // restart transition
    ui.line.classList.add("show");
    if (A.standingMsg) {
      ui.standing.className =
        "dlg-standing " + (A.standingMsg.good ? "good" : "bad");
      ui.standing.textContent = A.standingMsg.text;
    } else {
      ui.standing.className = "dlg-standing";
      ui.standing.textContent = "";
    }
    // responses
    ui.list.innerHTML = "";
    A.visible.forEach((v, i) => {
      const li = document.createElement("li");
      const r = v.r;
      let html = '<span class="n">' + (i + 1) + ".</span>";
      if (v.check)
        html +=
          '<span class="chk ' +
          v.check.cls +
          '">' +
          X.esc(v.check.label) +
          "</span>";
      if (r.barter && !/barter|trade/i.test(v.text))
        html += '<span class="chk">[Trade]</span>';
      html += X.esc(v.text);
      li.innerHTML = html;
      if (v.used) li.classList.add("used");
      if (v.check && v.check.locked) li.classList.add("locked");
      li.onmouseenter = () => {
        if (A && A.sel !== i) {
          A.sel = i;
          paintSel();
          X.sfx("ui_hover", { volume: 0.25 });
        }
      };
      li.onclick = () => choose(i);
      ui.list.appendChild(li);
    });
    paintSel();
  }
  function paintSel() {
    if (!ui || !A) return;
    const lis = ui.list.children;
    for (let i = 0; i < lis.length; i++)
      lis[i].classList.toggle("sel", i === A.sel);
    const cur = lis[A.sel];
    if (cur && cur.scrollIntoView) {
      try {
        cur.scrollIntoView({ block: "nearest" });
      } catch (e) {
        /* ignore */
      }
    }
  }

  // ------------------------------------------------------------------
  // Engine
  // ------------------------------------------------------------------
  function fallbackTree(actor) {
    const lines =
      actor && actor.barks && actor.barks.length
        ? actor.barks
        : [
            "Keep walking, stranger. Nothing here worth dying over.",
            "You've got that just-thawed look. Won't last.",
            "Scrip talks. Everything else just makes noise.",
            "Watch the rooftops out there. Something up there watches back.",
          ];
    const hasShop = !!(actor && actor.merchant);
    return {
      start: "hello",
      nodes: {
        hello: {
          text: () => lines[Math.floor(Math.random() * lines.length)],
          responses: [
            hasShop
              ? {
                  text: "Let's see what you've got for sale.",
                  barter: true,
                  next: "hello",
                }
              : null,
            { text: "What can you tell me about this place?", next: "place" },
            { text: "Goodbye.", end: true },
          ].filter(Boolean),
        },
        place: {
          text: () => {
            const loc = G.LAYOUT.locationAt(G.player.pos.x, G.player.pos.z);
            return loc
              ? "This is " +
                  loc.name +
                  ". Folks around here mind their own business. You'd do well to follow suit."
              : "Ruins, mostly. Ruins and the things that live in them.";
          },
          responses: [
            { text: "Thanks.", next: "hello" },
            { text: "Goodbye.", end: true },
          ],
        },
      },
    };
  }

  function gotoNode(nodeId, tag) {
    if (!A) return;
    const convo = A;
    let guard = 0;
    while (guard++ < 12) {
      if (nodeId === null || nodeId === undefined || nodeId === "__end") {
        D.end();
        return;
      }
      // the generic rebuff lives on the session, never inside the (shared) registered tree
      const node =
        (nodeId === "__fail" && A.failNode) ||
        (A.tree.nodes && A.tree.nodes[nodeId]);
      if (!node) {
        G.reportError(
          "dialogue",
          new Error('Missing node "' + nodeId + '" in dialogue "' + A.id + '"'),
        );
        D.end();
        return;
      }
      A.nodeId = nodeId;
      A.node = node;
      if (node.onEnter) {
        let redirect;
        try {
          redirect = node.onEnter(A.actor, A);
        } catch (e) {
          G.reportError("dialogue:onEnter:" + A.id + ":" + nodeId, e);
        }
        if (A !== convo) return; // onEnter ended (or replaced) the conversation
        if (typeof redirect === "string" && redirect !== nodeId) {
          nodeId = redirect;
          continue;
        }
      }
      break;
    }
    A.lineText = nodeText(A.node, A.actor);
    if (A.node.learn)
      G.locks.learn(
        A.node.learn,
        "Heard from " +
          ((A.actor && A.actor.name) || A.opts.name || "a stranger"),
      );
    buildVisible();
    A.sel = firstSelectable();
    renderNode(tag);
    if (A.actor && A.actor.char && A.actor.char.playOneShot) {
      try {
        A.actor.char.playOneShot("talk");
      } catch (e) {
        /* ignore */
      }
    }
    G.events.emit("dialogueNode", A.id, A.nodeId, A.actor);
    A.standingMsg = null;
  }

  function buildVisible() {
    const out = [];
    const rs = val(A.node.responses, A.actor) || [];
    rs.forEach((r, idx) => {
      if (!r) return;
      try {
        if (r.cond && !r.cond(A.actor, A)) return;
      } catch (e) {
        G.reportError("dialogue:cond:" + A.id, e);
        return;
      }
      const key = respKey(r, idx);
      if (r.check && memory.failed[key] && !r.retry) return; // a blown check is gone for good
      // a check you already won is resolved — the line disappears (no XP / reward farming).
      // Writers can opt out with repeatable:true (then it re-rolls and pays out again, by design).
      if (r.check && memory.passed[key] && !r.repeatable) return;
      let text = val(r.text, A.actor);
      if (!text)
        text = r.barter
          ? "Let's trade."
          : r.end || r.next == null
            ? "Goodbye."
            : "...";
      const ck = evalCheck(r.check, r);
      if (ck && ck.hide) return;
      out.push({
        r,
        idx,
        key,
        text: subst(text),
        check: ck,
        used: !!memory.used[key] && !r.end,
      });
    });
    if (!out.length)
      out.push({
        r: { end: true },
        idx: 0,
        key: "end",
        text: "Goodbye.",
        check: null,
        used: false,
      });
    A.visible = out.slice(0, 9);
  }
  function firstSelectable() {
    for (let i = 0; i < A.visible.length; i++)
      if (!(A.visible[i].check && A.visible[i].check.locked)) return i;
    return 0;
  }

  function choose(i) {
    if (!A || A.busy) return;
    if (G.time.real - A.openedAt < 0.25) return;
    const v = A.visible[i];
    if (!v) return;
    if (v.check && v.check.locked) {
      X.sfx("ui_error", { volume: 0.6 });
      flashLocked(i);
      return;
    }
    const r = v.r;
    const convo = A; // actions may end this conversation or start another one
    memory.used[v.key] = 1;
    X.sfx("ui_select", { volume: 0.55 });
    let next = r.next;
    let tag = null;
    // ---- talent / item / scrip / standing gate (always passes; may consume) ----
    if (v.check && v.check.kind === "gate") {
      const c = v.check.consume;
      if (c && c.n > 0) {
        X.invRemove(c.id, c.n);
        try {
          G.notify &&
            G.notify(
              X.isCurrency(c.id)
                ? c.n + " Scrip removed."
                : X.itemName(c.id) +
                    (c.n > 1 ? " (" + c.n + ")" : "") +
                    " removed.",
            );
        } catch (e) {
          /* ignore */
        }
      }
      if (v.check.label)
        tag = { gate: true, ok: true, label: v.check.label, text: v.text };
    } else
      // ---- skill / attribute check ----
      if (v.check) {
        const pass = rollCheck(v.check);
        tag = { ok: pass, label: v.check.label, text: v.text };
        if (pass) memory.passed[v.key] = 1;
        if (!pass) {
          memory.failed[v.key] = 1;
          next = r.failNext !== undefined ? r.failNext : "__fail";
          X.sfx("ui_error", { volume: 0.5 });
        }
        // rpg listens (XP, Persuasion growth): payload {success, skill|attr, value}
        const info = {
          success: pass,
          skill: v.check.skill || null,
          attr: v.check.attr || null,
          value: v.check.need || 0,
          chance: v.check.chance,
          dialogue: A.id,
          node: A.nodeId,
          actor: A.actor,
        };
        G.events.emit("skillCheck", info);
      }
    // ---- codes heard in conversation ----
    if (r.learn && (!tag || tag.ok))
      G.locks.learn(
        r.learn,
        "Heard from " +
          ((A.actor && A.actor.name) || A.opts.name || "a stranger"),
      );
    // ---- standing ----
    const sd = respStanding(r);
    if (
      typeof sd === "number" &&
      sd &&
      (!memory.standing[v.key] || r.repeatStanding) &&
      (!tag || tag.ok || r.standingOnFail)
    ) {
      memory.standing[v.key] = 1;
      X.standing(sd, "Dialogue");
      A.standingMsg = {
        good: sd > 0,
        text: sd > 0 ? "Your standing rose." : "Your standing fell.",
      };
    }
    // ---- action ----
    if (r.action && (!tag || tag.ok)) {
      let ret;
      try {
        ret = r.action(A.actor, A);
      } catch (e) {
        G.reportError("dialogue:action:" + convo.id, e);
      }
      if (A !== convo) return; // action ended this dialogue (fight, other conversation, terminal...)
      if (typeof ret === "string" && (next === undefined || next === null))
        next = ret;
    }
    if (typeof next === "function") {
      try {
        next = next(A.actor, A);
      } catch (e) {
        G.reportError("dialogue:next", e);
        next = null;
      }
      if (A !== convo) return;
    }
    // ---- barter hand-off ----
    if (r.barter && (!tag || tag.ok)) {
      const resume = next !== undefined && next !== null ? next : A.nodeId;
      suspendForBarter(resume);
      return;
    }
    if (r.end || next === undefined || next === null) {
      if (A.standingMsg) {
        ui.standing.className =
          "dlg-standing " + (A.standingMsg.good ? "good" : "bad");
        ui.standing.textContent = A.standingMsg.text;
      }
      D.end();
      return;
    }
    if (next === "__fail") {
      failBeat(tag);
      return;
    }
    gotoNode(next, tag);
  }

  /** Generic "you blew it" beat when the writer gave no failNext. */
  function failBeat(tag) {
    const lines = [
      "Nice try. I wasn't born yesterday. Or back in '67, for that matter.",
      "Heh. No.",
      "You talk a big game for someone who still smells like a freezer.",
      "Was that supposed to convince me?",
    ];
    const back = A.nodeId;
    A.failNode = {
      text: lines[Math.floor(Math.random() * lines.length)],
      responses: [
        { text: "Fine. Let's talk about something else.", next: back },
        { text: "Goodbye.", end: true },
      ],
    };
    gotoNode("__fail", tag);
  }
  function flashLocked(i) {
    const li = ui && ui.list.children[i];
    if (!li) return;
    li.style.transition = "none";
    li.style.background = "rgba(255,90,60,.25)";
    setTimeout(() => {
      li.style.transition = "background .4s";
      li.style.background = "";
    }, 60);
  }

  function suspendForBarter(resumeNode) {
    const actor = A.actor;
    A.suspended = true;
    if (ui) ui.root.classList.add("ui-hidden");
    const reopen = () => {
      if (!A || !A.suspended) return;
      A.suspended = false;
      if (ui) ui.root.classList.remove("ui-hidden");
      if (G.state !== "dialogue") G.setState("dialogue");
      X.pushScreen(screen);
      gotoNode(resumeNode);
    };
    X.popScreen(screen);
    if (X.live("barter") || (G.barter && G.barter.open)) {
      const ok = G.barter.open(actor, { onClose: reopen, fromDialogue: true });
      if (ok === false) reopen();
    } else reopen();
  }

  const screen = {
    id: "dialogue",
    onKey(code) {
      if (!A || A.suspended) return false;
      const K = X.K;
      const n = K.digit(code);
      if (n >= 1 && n <= 9) {
        if (n - 1 < A.visible.length) {
          A.sel = n - 1;
          paintSel();
          choose(n - 1);
        }
        return true;
      }
      if (K.up(code)) {
        A.sel = (A.sel + A.visible.length - 1) % A.visible.length;
        paintSel();
        X.sfx("ui_hover", { volume: 0.3 });
        return true;
      }
      if (K.down(code)) {
        A.sel = (A.sel + 1) % A.visible.length;
        paintSel();
        X.sfx("ui_hover", { volume: 0.3 });
        return true;
      }
      if (
        code === "Enter" ||
        code === "NumpadEnter" ||
        code === "KeyE" ||
        code === "Space"
      ) {
        choose(A.sel);
        return true;
      }
      if (code === "Tab" || code === "Escape") {
        if (A.node && A.node.noExit) {
          X.sfx("ui_error", { volume: 0.4 });
          return true;
        }
        X.sfx("ui_back", { volume: 0.5 });
        D.end();
        return true;
      }
      return true; // swallow everything else while talking
    },
  };

  // ------------------------------------------------------------------
  // PUBLIC API
  // ------------------------------------------------------------------
  // ---- where a conversation returns to ----------------------------------
  // Dialogue normally ends in 'play'. One started from a scripted 'cutscene' (quest intro, ending)
  // returns to that cutscene instead of grabbing pointer lock mid-scene. opts.returnState overrides.
  const RETURNABLE = { play: 1, cutscene: 1 };
  let restartPrev = null; // prevState carried across dialogue → dialogue hand-offs
  function A0prev() {
    const p = restartPrev || G.state;
    restartPrev = null;
    return p;
  }
  function returnStateFor(a) {
    const want = (a.opts && a.opts.returnState) || a.prevState;
    return RETURNABLE[want] ? want : "play";
  }
  function saveCam() {
    const C = G.camera;
    if (!C) return null;
    return { pos: C.position.clone(), quat: C.quaternion.clone(), fov: C.fov };
  }
  function restoreCam(s) {
    const C = G.camera;
    if (!C || !s) return;
    C.position.copy(s.pos);
    C.quaternion.copy(s.quat);
    if (C.fov !== s.fov) {
      C.fov = s.fov;
      C.updateProjectionMatrix();
    }
  }

  const D = {
    voiceEnabled: false, // no spoken voice-overs: dialogue is text only
    /** Register a dialogue tree. */
    register(id, tree) {
      if (!id || !tree) return;
      if (!tree.nodes) {
        G.reportError(
          "dialogue",
          new Error('Dialogue "' + id + '" has no nodes'),
        );
        return;
      }
      trees[id] = tree;
    },
    has(id) {
      return !!trees[id];
    },
    get(id) {
      return trees[id] || null;
    },
    list() {
      return Object.keys(trees);
    },
    /**
     * Start a conversation. actor may be null (intercoms, radios, notes).
     * opts: {node: startNodeId, name: speakerName (when no actor), noCamera,
     *        returnState: 'play'|'cutscene' (default: the state dialogue was started from, if returnable)}
     */
    start(id, actor, opts) {
      opts = opts || {};
      if (A) {
        if (A.suspended) return false;
        restartPrev = A.prevState;
        D.end(true);
      }
      let tree = trees[id];
      if (!tree) {
        if (id)
          console.warn(
            '[dialogue] unknown dialogue id "' +
              id +
              '" — using generic fallback',
          );
        tree = fallbackTree(actor);
      }
      A = {
        id: id || "__generic",
        tree,
        actor: actor || null,
        opts,
        node: null,
        nodeId: null,
        visible: [],
        sel: 0,
        prevState: A0prev(),
        hadCamOverride: !!(G.player && G.player.camOverride),
        camSaved: saveCam(),
        openedAt: G.time.real,
        eyeX: G.player.eye.x || G.player.pos.x,
        eyeZ: G.player.eye.z || G.player.pos.z,
      };
      let startId =
        opts.node || val(tree.start, actor) || Object.keys(tree.nodes)[0];
      buildUI();
      X.pushScreen(screen);
      if (G.state !== "dialogue") G.setState("dialogue");
      if (actor && !opts.noCamera) {
        faceActor(actor);
        camBegin();
      }
      G.viewmodelVisible = false;
      G.events.emit("dialogueStart", actor || null, A.id);
      gotoNode(startId);
      return true;
    },
    /** End the conversation (returns to play). */
    end(silent) {
      if (!A) return;
      const a = A;
      A = null;
      X.popScreen(screen);
      if (ui) {
        const r = ui.root;
        ui = null;
        r.classList.remove("on");
        r.style.transition = "opacity .25s";
        r.style.opacity = "0";
        setTimeout(() => r.remove(), 280);
      }
      releaseActor(a.actor);
      const back = returnStateFor(a);
      if (back === "cutscene" && a.hadCamOverride) {
        // a scripted scene owns the camera: hand it back exactly as we found it
        cam = null;
        restoreCam(a.camSaved);
        G.player.camOverride = true;
      } else camEnd();
      if (back === "play") G.viewmodelVisible = true;
      if (!silent) X.returnToPlay("dialogue", back);
      G.events.emit("dialogueEnd", a.actor, a.id);
    },
    isActive() {
      return !!A;
    },
    current() {
      return A ? { id: A.id, node: A.nodeId, actor: A.actor } : null;
    },
    /** Jump to a node of the active conversation (for scripted actions). */
    goto(nodeId) {
      if (A) gotoNode(nodeId);
    },
    /** Preview how a check would be displayed/resolved: {label, chance?, ok?} */
    checkInfo(check) {
      return evalCheck(check, {});
    },
    /** Forget remembered choices (e.g. for a fresh game). */
    resetMemory() {
      memory.used = {};
      memory.failed = {};
      memory.passed = {};
      memory.standing = {};
    },
    _memory: memory,
  };
  G.dialogue = D;

  // ------------------------------------------------------------------
  // Hooks for the module registration file
  // ------------------------------------------------------------------
  /** Lock ids taught by registered dialogue (node or response `learn`): Map id → [labels] (for G.locks.audit). */
  function learnSources() {
    const out = new Map();
    const add = (lid, l) => {
      if (!out.has(lid)) out.set(lid, []);
      out.get(lid).push(l);
    };
    const each = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
    for (const id in trees) {
      const nodes = trees[id].nodes || {};
      for (const nid in nodes) {
        const n = nodes[nid];
        if (!n) continue;
        for (const lid of each(n.learn))
          add(lid, "dialogue " + id + " / " + nid);
        const rs = Array.isArray(n.responses) ? n.responses : [];
        for (const r of rs)
          if (r)
            for (const lid of each(r.learn))
              add(lid, "dialogue " + id + " / " + nid + " (reply)");
      }
    }
    return out;
  }

  X.dialogue = {
    learnSources,
    lateUpdate(realDt) {
      if (cam) camUpdate(realDt);
      // keep the NPC alive while the world is paused
      if (A && A.actor && A.actor.char && !A.suspended && !G.worldRunning()) {
        try {
          if (A.actor.char.update) A.actor.char.update(realDt);
        } catch (e) {
          /* ignore */
        }
      }
    },
    onState(s) {
      // Something else yanked the state (death, load, cutscene...) → close quietly.
      if (A && s !== "dialogue" && !(A.suspended && s === "barter")) {
        const a = A;
        A = null;
        X.popScreen(screen);
        destroyUI();
        releaseActor(a.actor);
        G.player.camOverride = false;
        cam = null;
        G.viewmodelVisible = true;
        G.events.emit("dialogueEnd", a.actor, a.id);
      }
    },
    reset() {
      if (A) {
        X.popScreen(screen);
        destroyUI();
        A = null;
      }
      cam = null;
      if (G.player) G.player.camOverride = false;
      G.viewmodelVisible = true;
      memory.used = {};
      memory.failed = {};
      memory.passed = {};
      memory.standing = {};
    },
    save() {
      return {
        used: memory.used,
        failed: memory.failed,
        passed: memory.passed,
        standing: memory.standing,
      };
    },
    load(d) {
      memory.used = (d && d.used) || {};
      memory.failed = (d && d.failed) || {};
      memory.passed = (d && d.passed) || {};
      memory.standing = (d && d.standing) || {};
    },
  };
})();
