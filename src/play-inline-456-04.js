// play-inline-456 04 — actor
// Lines 891-1014 of readable/play-inline-456.pretty.js (statement-aligned).
  L.FaceCtl = FaceCtl;
  L.FACE_VISEMES = Object.keys(VIS);

  // ------------------------------------------------------------------
  // Dialogue hook (ui_interact emits dialogueStart / dialogueNode / dialogueEnd)
  // ------------------------------------------------------------------
  // The line to lip-sync, best source first: text passed WITH the event
  // (ui_interact: emit('dialogueNode', id, nodeId, actor, {text, emotion}) or
  // a string), the rendered line, and only then the tree node (whose text()
  // may be randomised and so differ from what is on screen).
  function lineFor(id, nodeId, actor, info) {
    if (typeof info === "string" && info) return info;
    if (info && typeof info.text === "string" && info.text) return info.text;
    try {
      const el = document.querySelector(".dlg-wrap .dlg-line");
      if (el && el.textContent) return el.textContent;
    } catch (e) {
      /* no DOM */
    }
    try {
      const tree = G.dialogue && G.dialogue.get && G.dialogue.get(id);
      const n = tree && tree.nodes && tree.nodes[nodeId];
      if (n)
        return typeof n.text === "function"
          ? String(n.text(actor) || "")
          : String(n.text || "");
    } catch (e) {
      /* ignore */
    }
    return "";
  }
  /** Comparable form of a line: letters only, lower case, first 40. */
  const normLine = (t) =>
    String(t || "")
      .toLowerCase()
      .replace(/\*[^*]*\*/g, "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/[^a-z]/g, "")
      .slice(0, 40);
  function nodeEmotion(id, nodeId, actor, info) {
    if (info && typeof info === "object" && info.emotion)
      return typeof info.emotion === "function"
        ? info.emotion(actor)
        : info.emotion;
    try {
      const tree = G.dialogue && G.dialogue.get && G.dialogue.get(id);
      const n = tree && tree.nodes && tree.nodes[nodeId];
      if (!n) return null;
      let e = n.emotion || n.mood || n.face || n.expression;
      if (typeof e === "function") e = e(actor);
      return e || null;
    } catch (e) {
      return null;
    }
  }
  const charOf = (actor) =>
    actor &&
    (actor.char ||
      (actor.root && actor.root.userData && actor.root.userData.character) ||
      (actor.isCharacter ? actor : null));
  L.hookFaceEvents = function () {
    if (L._faceHooked || !G.events || !G.events.on) return;
    L._faceHooked = true;
    G.events.on("dialogueStart", (actor) => {
      const ch = charOf(actor);
      if (!ch || !ch.face) return;
      ch.face.focusOn(G.camera || null);
      if (ch.ensureFaceTexture) ch.ensureFaceTexture();
    });
    G.events.on("dialogueNode", (id, nodeId, actor, info) => {
      const ch = charOf(actor);
      if (!ch || !ch.face) return;
      let text = lineFor(id, nodeId, actor, info);
      let u = L.takeRecentUtterance(400);
      // only bind an utterance that is voicing THIS line (a late/previous
      // node's utterance would drive the wrong mouth shapes)
      if (u && text) {
        let ut = "";
        try {
          ut = u.text || "";
        } catch (e) {
          ut = "";
        }
        const a = normLine(ut),
          b = normLine(text);
        if (a && b && a.slice(0, 16) !== b.slice(0, 16)) u = null;
      }
      // the voiced text is the reference for boundary charIndex values
      // (ui_interact strips *actions* / [notes] and collapses whitespace)
      if (u) {
        try {
          if (u.text) text = u.text;
        } catch (e) {
          /* keep */
        }
      }
      let rate = 1;
      try {
        if (u && u.rate) rate = u.rate;
      } catch (e) {
        /* ignore */
      }
      ch.face.focusOn(G.camera || null);
      ch.face.say(text, {
        emotion: nodeEmotion(id, nodeId, actor, info),
        utterance: u,
        rate,
      });
      if (ch.face.speech)
        ch.face.speech.node = String(id) + ":" + String(nodeId);
    });
    G.events.on("dialogueEnd", (actor) => {
      const ch = charOf(actor);
      if (!ch || !ch.face) return;
      ch.face.stop();
      ch.face.focusOn(null);
      if (ch.face.emo) ch.face.emoHold = Math.min(ch.face.emoHold, 1.5);
    });
  };
  try {
    L.hookFaceEvents();
  } catch (e) {
    /* events hooked again from init */
  }
