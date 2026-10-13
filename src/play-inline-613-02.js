// play-inline-613 02 — actor
// Lines 340-680 of readable/play-inline-613.pretty.js (statement-aligned).
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

