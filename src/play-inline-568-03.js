// play-inline-568 03 — the
// Lines 570-887 of readable/play-inline-568.pretty.js (statement-aligned).
  const LENS_NAME = {
    rock: "the long-range scope on the Top of the Rock",
    skyeye: "the Sky-Eye monitor room at the UN Plaza",
    chrysler: "the sniper's nest in the Chrysler crown",
  };
  function rockScopePos() {
    const LI = G._li;
    const W = LI && LI.rockWorld;
    if (W && W.anchors && W.anchors.scope) {
      const s = W.anchors.scope;
      return { x: s.x + 1.0, y: s.y, z: s.z - 1.2, high: true };
    }
    return null;
  }
  function lensPos(kind) {
    if (kind === "rock")
      return (
        rockScopePos() ||
        L.anchor(
          "rockefeller",
          ["scope", "observation_deck", "rooftop", "roof"],
          { x: 80, z: -306 },
        )
      );
    if (kind === "skyeye") {
      const a = L.anchor("un_hq", ["sky_eye_room", "command", "terminal"], {
        x: UN.x - 22,
        z: UN.z + 12,
      });
      return a ? { x: a.x + 1.6, y: a.y, z: a.z + 1.2 } : null;
    }
    if (kind === "chrysler") {
      const n = L.anchor("chrysler", ["sniper", "crown"], null);
      return n
        ? { x: n.x - 0.8, y: n.y, z: n.z + 0.8, high: n.y > 30 }
        : L.anchor("chrysler", ["rooftop", "entrance"], { x: 303, z: -186 });
    }
    return null;
  }
  function lensMarker(p, label) {
    if (p.high && L.chryslerMarker && Math.hypot(p.x - 309, p.z + 208) < 40)
      return L.chryslerMarker(p, label);
    // rooftops: a plan position (the engine points a street-level marker inside a building at its door)
    if (p.high && G.player.pos.y < p.y - 20) return { x: p.x, z: p.z, label };
    return { x: p.x, z: p.z, y: p.y, label, exact: true };
  }
  const pathLens = () =>
    faction() === "covenant"
      ? "rock"
      : faction() === "continuity"
        ? "skyeye"
        : "chrysler";
  function lensText() {
    const k = pathLens();
    if (k === "rock") {
      const v = Q.get("li_rock_scope");
      if (v && v.active && v.stageText) return v.stageText;
      return "Get a long lens on Liberty: the Covenant's scope on the Top of the Rock (Lancer Dalca, the war room) needs recalibrating.";
    }
    if (k === "skyeye")
      return ms.f("skyeye_room_ok")
        ? "Get a long lens on Liberty: Lieutenant Hale has signed you into the Sky-Eye monitor room at the UN Plaza."
        : "Get a long lens on Liberty: ask Lieutenant Hale for the Sky-Eye monitor room at the UN Plaza.";
    return "Get a long lens on Liberty: Deadeye Dolores's nest in the Chrysler crown has the best view in Manhattan (service elevator in the lobby).";
  }
  function lensMarkers() {
    const k = pathLens();
    if (k === "rock") {
      if (Q.isActive("li_rock_scope")) {
        const m = L.questMarkers("li_rock_scope");
        if (m && m.length)
          return m.map((x) => ({
            x: x.x,
            z: x.z,
            y: x.y,
            label: x.label,
            exact: true,
            interior: x.interior,
          }));
      }
      if (Q.get("li_rock_scope") && !Q.isStarted("li_rock_scope"))
        return [{ npc: "li_cov_dalca", label: "Lancer Dalca", x: 80, z: -320 }];
    }
    if (k === "skyeye" && !ms.f("skyeye_room_ok"))
      return [{ npc: "con_hale", label: "Lieutenant Hale" }];
    const p = lensPos(k);
    return p ? [lensMarker(p, LENS_NAME[k])] : [];
  }
  function setLens(kind) {
    if (!at("mq19", "lens")) return;
    ms.set("mq19_lens", kind);
    L.notify(
      "A long lens on Liberty: " +
        LENS_NAME[kind] +
        ". The boats move after midnight.",
      { duration: 5 },
    );
    Q.setStage("mq19", "watch");
  }
  function placeRoseAtLens() {
    if (
      rose.mode() === "follow" ||
      (rose.mode() === "gone" && !L.flag("ms_rose_met"))
    )
      return;
    const k = ms.f("mq19_lens");
    if (k === "skyeye") return; // she won't set foot on Continuity ground: she watches from her own roof
    const p = lensPos(k);
    if (!p) return;
    rose.place("at", { fallback: { x: p.x + 1.1, z: p.z + 0.9, y: p.y } });
  }
  function skyeyeAllowed() {
    return (
      !L.flag("con_hostile") &&
      !L.flag("hale_dead") &&
      (faction() === "continuity" || ms.f("skyeye_room_ok"))
    );
  }
  function useLens(kind) {
    if (at("mq19", "lens")) {
      if (kind === "skyeye" && !skyeyeAllowed()) {
        L.notify(
          'A Continuity sentry puts a gauntlet across the door. "Monitor room. Lieutenant Hale\'s authorisation, citizen. In writing."',
        );
        L.sfx("ui_error");
        return;
      }
      if (
        kind === "rock" &&
        Q.get("li_rock_scope") &&
        !(
          Q.reached("li_rock_scope", "watch") ||
          Q.reached("li_rock_scope", "report") ||
          Q.isComplete("li_rock_scope")
        )
      ) {
        L.notify(
          "The scope's image is a smear of yellow haze. It needs recalibrating first.",
        );
        return;
      }
      setLens(kind);
      return;
    }
    if (at("mq19", "watch") && ms.f("mq19_lens") === kind) startWatch();
  }
  function startWatch() {
    const h = hourNow();
    if (h >= 1.75 && h < 4.5) {
      ms.talk("dlg_ms_mq19_watch", "Liberty Island", "w1");
      return;
    }
    ms.talk("dlg_ms_mq19_watch", "Liberty Island", "wait");
  }
  function watchDone() {
    if (!at("mq19", "watch")) return;
    ms.set("mq19_watch_done");
    ms.set("teague_seen");
    L.setFlag("teague_seen");
    L.xp(60, "Night watch on Liberty");
    Q.setStage("mq19", "report");
  }
  function reportTo() {
    const out = [];
    if (faction() === "covenant" && !L.flag("stroud_dead"))
      out.push("Lancer-Commander Stroud");
    if (!L.flag("hale_dead") && !L.flag("con_hostile"))
      out.push("Lieutenant Hale");
    out.push("or Rocky Delgado, on the air");
    return out.join(", ");
  }
  function reportMarkers() {
    const m = [];
    if (faction() === "covenant" && !L.flag("stroud_dead"))
      m.push({ npc: "cov_stroud", label: "Lancer-Commander Stroud" });
    if (!L.flag("hale_dead") && !L.flag("con_hostile"))
      m.push({ npc: "con_hale", label: "Lieutenant Hale" });
    m.push({ npc: "rc_rocky", label: "Rocky Delgado" });
    m.push(...rose.marker("Rose"));
    return m;
  }
  function teagueReported(who) {
    if (!at("mq19", "report")) return;
    ms.set("teague", "arrested");
    L.setFlag("teague_arrested");
    L.later(3, () =>
      L.news(
        "Harbour gossip, folks: the Continuity hauled one of its own off the Liberty pier this morning. A private, they say, name of Teague. Rumour is he was selling candles. Rumour is the candles were selling him.",
      ),
    );
    Q.complete("mq19");
    if (who) L.xp(30, "Reported the skiff");
  }
  function teagueKept() {
    if (!at("mq19", "report")) return;
    ms.set("teague", "free");
    L.setFlag("teague_free");
    Q.complete("mq19");
  }
  // the lenses (examine spots); the Top of the Rock spot sits beside landmark_interiors' own calibration scope
  // (with landmark_interiors present its own scope interactable does the calibration AND the 02:00 watch: no second spot)
  ms.spot({
    id: "ms_lens_rock",
    label: "Long-Range Scope (night watch)",
    verb: "Look",
    when: () =>
      !rockScopePos() &&
      ((at("mq19", "lens") && pathLens() === "rock") ||
        (at("mq19", "watch") && ms.f("mq19_lens") === "rock")),
    get at() {
      const p = lensPos("rock");
      return p ? { x: p.x, y: p.y, z: p.z } : null;
    },
    use() {
      useLens("rock");
    },
  });
  ms.spot({
    id: "ms_lens_skyeye",
    label: "Sky-Eye Monitor Bank",
    verb: "Watch",
    when: () =>
      at("mq19", "lens") ||
      (at("mq19", "watch") && ms.f("mq19_lens") === "skyeye"),
    get at() {
      const p = lensPos("skyeye");
      return p ? { x: p.x, y: p.y, z: p.z } : null;
    },
    use() {
      useLens("skyeye");
    },
  });
  ms.spot({
    id: "ms_lens_chrysler",
    label: "The Long View (Liberty Island)",
    verb: "Look",
    when: () =>
      at("mq19", "lens") ||
      (at("mq19", "watch") && ms.f("mq19_lens") === "chrysler"),
    get at() {
      const p = lensPos("chrysler");
      return p ? { x: p.x, y: p.y, z: p.z } : null;
    },
    use() {
      useLens("chrysler");
    },
  });
  // the Covenant variant: calibrating the Top of the Rock scope (li_rock_scope) is the lens
  let lensT = 0;
  L.hook("update", function (dt, realDt) {
    lensT -= realDt;
    if (lensT > 0) return;
    lensT = 1.0;
    if (
      at("mq19", "lens") &&
      Q.get("li_rock_scope") &&
      (Q.reached("li_rock_scope", "watch") ||
        Q.reached("li_rock_scope", "report") ||
        Q.isComplete("li_rock_scope"))
    )
      setLens("rock");
    // the Covenant scope's own 02:00 watch (landmark_interiors sets ms_teague_seen): Rose's part of it
    const dlgOpen = () =>
      !!(
        G.dialogue &&
        typeof G.dialogue.isActive === "function" &&
        G.dialogue.isActive()
      );
    if (
      at("mq19", "watch") &&
      ms.f("mq19_li_watch") &&
      !ms.f("mq19_watch_done") &&
      G.time &&
      G.time.elapsed - ms.f("mq19_li_watch") > 8 &&
      !dlgOpen()
    ) {
      // the scene was closed early: finish the watch, Rose tells her part later
      ms.set("mq19_rose_taper_pending");
      watchDone();
    }
    if (
      at("mq19", "watch") &&
      L.flag("ms_teague_seen") &&
      !ms.f("mq19_watch_done") &&
      !ms.f("mq19_li_watch")
    ) {
      ms.set("mq19_li_watch", G.time ? G.time.elapsed || 0.001 : 0.001);
      const p = lensPos(ms.f("mq19_lens"));
      const near =
        p && Math.hypot(G.player.pos.x - p.x, G.player.pos.z - p.z) < 18;
      if (near)
        L.later(2.5, () => {
          if (at("mq19", "watch"))
            ms.talk("dlg_ms_mq19_watch", "Liberty Island", "w2");
        });
      else {
        ms.set("mq19_rose_taper_pending");
        watchDone();
      }
    }
    mq21Poll();
    mq22Poll();
    mq24Poll();
  });

  const lensDesc = () =>
    ({
      rock: "[You put your eye to the Covenant's brass scope. The prisms are true now, and the harbour comes up close enough to touch.]",
      skyeye: ms.f("skyeye_jammed")
        ? "[The monitor bank hums. Static's jamming has blinded most of the net; one drone still circles Liberty on a backup channel, its picture full of snow. The anthem plays very quietly from a speaker nobody can find the switch for.]"
        : '[The monitor bank hums. A drone\'s grey picture of the harbour wobbles on the centre screen: the "PATRIOT" unit, circling Liberty on its night loop. The anthem plays very quietly from a speaker nobody can find the switch for.]',
      chrysler:
        "[You lie flat on the gargoyle's steel neck seventy floors up and put your eye to the long scope bolted there. The whole harbour fits in the glass.]",
    })[ms.f("mq19_lens")] || "[You put your eye to the lens.]";
  const roseVia = () =>
    ms.f("mq19_lens") === "skyeye"
      ? "[Rose, over the VIGIL radio band from her own roof, where she has her own scope on the same water:] "
      : "[Rose has her own scope up beside you. She lowers it.] ";
