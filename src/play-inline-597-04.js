// play-inline-597 04 — hud
// Lines 997-1234 of readable/play-inline-597.pretty.js (statement-aligned).
  let targetPoll = 0,
    lastTarget = null,
    enemyLagV = 1,
    enemyShowT = 0;
  function updateCenter(realDt) {
    const I = G.input;
    const f = G.world.getFocusLabel ? G.world.getFocusLabel() : null;
    // build the prompt markup only when the focus changes
    const fkey = f
      ? (f.label || "") +
        "|" +
        (f.verb || "") +
        "|" +
        (f.locked || "") +
        "|" +
        !!(G.world.focus && (G.world.focus.owned || G.world.focus.steal))
      : "";
    if (fkey !== HUD.promptKey) {
      HUD.promptKey = fkey;
      let promptHTML = "";
      if (f) {
        const label = f.label ? String(f.label) : "";
        const verb = f.verb || "Activate";
        const steal =
          /^steal/i.test(verb) ||
          (G.world.focus && (G.world.focus.owned || G.world.focus.steal));
        let lock = "";
        if (f.locked)
          lock = typeof f.locked === "number" ? "Locked" : String(f.locked);
        promptHTML =
          (label
            ? '<div class="hud-pr-label">' + H.esc(H.up(label)) + "</div>"
            : "") +
          '<div class="hud-pr-verb' +
          (steal ? " steal" : "") +
          '"><span class="hud-key">E</span>' +
          H.esc(H.up(verb)) +
          "</div>" +
          (lock
            ? '<div class="hud-pr-lock">' +
              H.glyph("lock") +
              " " +
              H.esc(H.up(lock)) +
              "</div>"
            : "");
      }
      H.setHTML(HUD.prompt, promptHTML);
      H.toggle(HUD.prompt, "on", !!f);
    }

    // target under the crosshair (throttled)
    targetPoll -= realDt;
    if (targetPoll <= 0) {
      targetPoll = 0.08;
      const t = H.call("combat", "targetUnderCrosshair", [], null);
      const a = t && t.actor;
      if (a && !a.dead && a.hp > 0) {
        lastTarget = a;
        enemyShowT = 1.2;
      } else if (lastTarget && lastTarget.dead) {
        enemyShowT = Math.min(enemyShowT, 0.5);
      }
    }
    enemyShowT -= realDt;
    const a = lastTarget;
    const showEnemy = !!(a && enemyShowT > 0);
    if (showEnemy) {
      const frac = H.pct(Math.max(0, a.hp), a.maxHp || 100);
      let hostile = false;
      try {
        hostile = typeof a.hostile === "function" ? a.hostile() : !!a.hostile;
      } catch (e) {
        hostile = false;
      }
      H.setText(
        HUD.enemyName,
        H.up((a.name || a.type || "Unknown").toString().replace(/_/g, " ")),
      );
      H.setStyle(HUD.enemyFill, "width", (frac * 100).toFixed(1) + "%");
      if (HUD._enemyRef !== a) {
        HUD._enemyRef = a;
        enemyLagV = frac;
      }
      enemyLagV =
        frac > enemyLagV
          ? frac
          : H.lerp(enemyLagV, frac, 1 - Math.exp(-3 * realDt));
      H.setStyle(HUD.enemyLag, "width", (enemyLagV * 100).toFixed(1) + "%");
      H.toggle(HUD.enemy, "hostile", hostile);
      H.toggle(HUD.cross, "enemy", hostile && enemyShowT > 1.0);
    } else H.toggle(HUD.cross, "enemy", false);
    H.toggle(HUD.enemy, "on", showEnemy);

    // crosshair spread
    const P = G.player;
    const aiming =
      I.action("aim") && !H.call("weapons", "isHolstered", [], false);
    HUD.bloom = Math.max(0, (HUD.bloom || 0) - realDt * 2.2);
    const spread =
      H.clamp(P.moveSpeed / 7, 0, 1) * 9 +
      (P.onGround ? 0 : 8) +
      HUD.bloom * 12 -
      (P.sneaking ? 2 : 0);
    H.setStyle(HUD.cross, "--gap", (6 + spread).toFixed(1) + "px");
    H.toggle(HUD.cross, "interact", !!f);
    H.toggle(HUD.cross, "hidden", !H.settings.crosshair || (aiming && !f));

    if (hitT > 0) {
      hitT -= realDt;
      if (hitT <= 0) HUD.hit.classList.remove("on");
    }

    // stealth state
    if (P.sneaking) {
      let det = H.call("combat", "detection", [], "hidden");
      det = String(det || "hidden").toLowerCase();
      H.setText(HUD.sneak, "[ " + det.toUpperCase() + " ]");
      HUD.sneak.className = "hud-sneak on " + det;
    } else if (HUD.sneak.className !== "hud-sneak")
      HUD.sneak.className = "hud-sneak";
  }

  // ------------------------------------------------------------------
  // Ring minimap (heading-up)
  // ------------------------------------------------------------------
  const MM = { css: 190, zoom: 0.68 }; // css px; px per metre
  function resizeMinimap() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const s = window.innerWidth < 700 ? 132 : MM.css;
    HUD.mm.width = s * dpr;
    HUD.mm.height = s * dpr;
    HUD.mm.style.width = s + "px";
    HUD.mm.style.height = s + "px";
    HUD.mmS = s;
    HUD.mmDpr = dpr;
    HUD.mmDirty = true;
    // resizing clears the canvas: redraw right away (review shots resize after the frame loop has stopped)
    if (G.player && G.state === "play") {
      try {
        drawMinimap();
      } catch (e) {
        /* first frame */
      }
    }
  }
  let markerPoll = 0,
    markerCache = [];
  function collectMarkers() {
    const P = G.player,
      L = G.LAYOUT;
    const out = [];
    const inside = L.isInterior(P.pos.x);
    const qm = H.call("quests", "activeMarkers", [], []) || [];
    const tracked = H.call("quests", "tracked", [], null);
    const trackedId = tracked && (tracked.id || tracked);
    for (const m of qm) {
      if (!m || m.x === undefined) continue;
      if (inside !== L.isInterior(m.x)) continue; // quests resolve door-aware markers themselves
      out.push({
        kind: "quest",
        x: m.x,
        z: m.z,
        tracked: !trackedId || m.questId === trackedId,
        label: m.label,
      });
    }
    if (!inside && H.settings.minimapLocations) {
      for (const l of L.LOCATIONS) {
        if (l.interior) continue;
        const d = Math.hypot(l.x - P.pos.x, l.z - P.pos.z);
        if (d > 260 || d < 6) continue;
        out.push({
          kind: "loc",
          x: l.x,
          z: l.z,
          icon: H.locIconKind ? H.locIconKind(l) : null,
          disc: !!(G.discovered && G.discovered.has(l.id)),
          d,
        });
      }
    }
    // Hostiles: Senses sets how far they register (unaware ones only inside 55 % of that range)
    if (H.has("actors", "list")) {
      const sen = H.clamp(Number(H.RPG ? H.RPG.attr("senses") : 5) || 5, 1, 10);
      const range = 20 + sen * 10;
      HUD.enemyRange = range;
      const list = H.call("actors", "list", [], []) || [];
      for (const a of list) {
        if (!a || a.dead || !a.pos || a.inScene === false || a.burrowed)
          continue;
        const d = Math.hypot(a.pos.x - P.pos.x, a.pos.z - P.pos.z);
        if (d > range) continue;
        let hostile = false;
        try {
          hostile = typeof a.hostile === "function" ? a.hostile() : !!a.hostile;
        } catch (e) {
          /* ignore */
        }
        if (hostile) {
          const st = String(a.aiState || a.state || a.mode || "");
          const alerted =
            /combat|attack|alert|search|chase/.test(st) ||
            a.inCombat ||
            a.alerted ||
            a.detectedPlayer ||
            (a.awareness || 0) > 0.2;
          if (alerted || d < range * 0.55)
            out.push({
              kind: "enemy",
              x: a.pos.x,
              z: a.pos.z,
              d,
              alerted: !!alerted,
            });
        } else if (
          d < 40 &&
          (a.following === "player" || a.companion || (a.td && a.td.human))
        )
          out.push({ kind: "friend", x: a.pos.x, z: a.pos.z, d });
      }
    }
    out.sort((a, b) => (a.kind === "quest") - (b.kind === "quest"));
    return out;
  }
  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return (
      "rgba(" +
      ((n >> 16) & 255) +
      "," +
      ((n >> 8) & 255) +
      "," +
      (n & 255) +
      "," +
      a +
      ")"
    );
  }
