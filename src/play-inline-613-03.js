// play-inline-613 03 — check
// Lines 681-1028 of readable/play-inline-613.pretty.js (statement-aligned).
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
