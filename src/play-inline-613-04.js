// play-inline-613 04 — actor
// Lines 1029-1254 of readable/play-inline-613.pretty.js (statement-aligned).
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
