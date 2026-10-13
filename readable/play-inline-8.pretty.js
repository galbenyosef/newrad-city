/* src/core/survey.js */
/* =====================================================================
 * NEW RAD CITY — SURVEY SHEETS (layout QA photo tool)
 * Owned by: CORE.   URL: index.html?survey=x,z[,radius]&hour=12&cut=Y&label=Text
 *
 * One page load renders a contact sheet of an area:
 *   [ big top-down map with a 2D debug overlay ] [ oblique aerial SE | oblique aerial NW ]
 *                                                [ street N         | street E           ]
 *                                                [ street S         | street W           ]
 * Overlay legend: yellow = road corridors (avenue/street/Broadway, incl. sidewalks),
 * orange = roundabouts/circles, magenta = landmark/POI SITES footprints (+id),
 * cyan = colliders, green dot = doors (+label), white dot = other interactables,
 * red = problems (collider inside a road carriageway, door blocked by a collider).
 * `cut=Y` clips geometry above world height Y in the top-down (see inside buildings).
 * Used by tools/survey.py.  Also exposes G.survey.lint(x0,z0,x1,z1) → problem list.
 * ===================================================================== */
(function () {
  "use strict";
  const G = (window.G = window.G || {});
  const THREE = window.THREE;

  const SHEET_W = 1940,
    SHEET_H = 900;
  const TOP = { x: 0, y: 0, w: 900, h: 900 };
  const CELL_W = 520,
    CELL_H = 300;

  /** Problems in an XZ rect: colliders intruding on road carriageways, blocked doors. */
  function lint(x0, z0, x1, z1) {
    const L = G.LAYOUT,
      W = G.world,
      out = [];
    // colliders standing in the drivable carriageway (not sidewalks) — tall ones only (cars/rubble are fine)
    for (const c of W.query(x0, z0, x1, z1)) {
      if (c.maxY - c.minY < 2.5 || c.minY > 3) continue;
      if (c.cx < x0 || c.cx > x1 || c.cz < z0 || c.cz > z1) continue;
      if (/actor|island|monument|car|vehicle|bus|truck|wreck/.test(c.tag || ""))
        continue; // wrecked vehicles belong on roads
      const onRoad = L.isRoad(c.cx, c.cz, true);
      if (onRoad && c.hx * c.hz > 4)
        out.push({
          kind: "collider_on_road",
          x: c.cx,
          z: c.cz,
          tag: c.tag,
          w: c.hx * 2,
          d: c.hz * 2,
        });
    }
    // doors whose approach (1.5 m in front) is inside a collider taller than a step
    for (const d of W.doors) {
      const p = d.pos || (d.getPos && d.getPos());
      if (!p || p.x < x0 || p.x > x1 || p.z < z0 || p.z > z1) continue;
      let blocked = 0,
        n = 0;
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2,
          qx = p.x + Math.sin(ang) * 1.4,
          qz = p.z + Math.cos(ang) * 1.4;
        n++;
        for (const c of W.query(qx - 0.1, qz - 0.1, qx + 0.1, qz + 0.1)) {
          if (
            c.maxY > (p.y || 0) + 0.6 &&
            c.minY < (p.y || 0) + 1.8 &&
            W.pointInCollider(c, qx, qz, 0.05)
          ) {
            blocked++;
            break;
          }
        }
      }
      if (blocked >= 7)
        out.push({
          kind: "door_blocked",
          x: p.x,
          z: p.z,
          label: d.def && d.def.label,
        });
    }
    // sites straddling road carriageways (sampled)
    for (const s of L.SITES) {
      if (
        s.x1 < x0 ||
        s.x0 > x1 ||
        s.z1 < z0 ||
        s.z0 > z1 ||
        s.plaza ||
        s.deckY ||
        s.owner === "map"
      )
        continue;
      let hits = 0;
      for (let i = 1; i < 8; i++)
        for (let j = 1; j < 8; j++) {
          if (
            L.isRoad(
              s.x0 + ((s.x1 - s.x0) * i) / 8,
              s.z0 + ((s.z1 - s.z0) * j) / 8,
              true,
            )
          )
            hits++;
        }
      if (hits > 2)
        out.push({
          kind: "site_on_road",
          id: s.id,
          x: (s.x0 + s.x1) / 2,
          z: (s.z0 + s.z1) / 2,
          samples: hits,
        });
    }
    return out;
  }

  function hideUI() {
    const st = document.createElement("style");
    st.textContent =
      "body > *:not(#survey-sheet):not(#game-root){visibility:hidden!important} #game-root{visibility:hidden!important}";
    document.head.appendChild(st);
  }

  function makeCam(fov) {
    const c = new THREE.PerspectiveCamera(
      fov || 62,
      CELL_W / CELL_H,
      0.1,
      4000,
    );
    c.rotation.order = "YXZ";
    return c;
  }

  /** Move the player to (x,z) so LOD/interior visibility/atmosphere follow, then settle a few frames. */
  function settleAt(x, y, z) {
    const P = G.player;
    P.fly = true;
    P.noclip = true;
    P.pos.set(x, y, z);
    P.vel.set(0, 0, 0);
    for (let i = 0; i < 9; i++) G._step(1 / 30);
  }

  function renderView(cam, opts) {
    opts = opts || {};
    const r = G.renderer,
      sc = G.scene;
    const fog = sc.fog;
    if (opts.noFog) sc.fog = null;
    r.clippingPlanes = opts.clip ? [opts.clip] : [];
    r.setRenderTarget(null);
    r.render(sc, cam);
    r.clippingPlanes = [];
    sc.fog = fog;
  }

  function streetViewPoint(cx, cz, dirX, dirZ, dist) {
    // walk outward and keep the farthest spot up to `dist` that isn't inside a collider at eye height (prefer roads)
    const W = G.world,
      L = G.LAYOUT;
    let best = null;
    for (let t = dist; t >= 6; t -= 2) {
      const x = cx + dirX * t,
        z = cz + dirZ * t;
      const gy = W.groundHeight(x, z, 60);
      let inside = false;
      for (const c of W.query(x - 0.3, z - 0.3, x + 0.3, z + 0.3)) {
        if (
          c.maxY > gy + 0.6 &&
          c.minY < gy + 1.8 &&
          W.pointInCollider(c, x, z, 0.3)
        ) {
          inside = true;
          break;
        }
      }
      if (inside) continue;
      if (L.isRoad(x, z) || !best) {
        best = { x, z, y: gy };
        if (L.isRoad(x, z)) break;
      }
    }
    return best || { x: cx + dirX * dist, z: cz + dirZ * dist, y: 0 };
  }

  G.runSurvey = function () {
    const QS = G.QS;
    const v = String(G.SURVEY).split(",").map(Number);
    const cx = v[0],
      cz = v[1],
      R = v[2] || 60;
    const cut = QS.has("cut") ? Number(QS.get("cut")) : null;
    G.newGame({ name: "Survey", skipIntro: true });
    G.time.hour = QS.has("hour") ? Number(QS.get("hour")) : 12.5;
    hideUI();

    const sheet = document.createElement("canvas");
    sheet.id = "survey-sheet";
    sheet.width = SHEET_W;
    sheet.height = SHEET_H;
    sheet.style.cssText =
      "position:fixed;left:0;top:0;z-index:99999;background:#111";
    document.body.appendChild(sheet);
    const ctx = sheet.getContext("2d");
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, SHEET_W, SHEET_H);

    const r = G.renderer,
      canvas = r.domElement;
    const oldHook = G.renderHook;
    G.renderHook = null;
    r.localClippingEnabled = true;
    const L = G.LAYOUT,
      W = G.world;
    const gy = W.groundHeight(cx, cz, 80);

    // ---------- 1) top-down ----------
    settleAt(cx, gy + 60, cz);
    r.setSize(TOP.w, TOP.h, false);
    const ortho = new THREE.OrthographicCamera(-R, R, R, -R, 1, 3000);
    ortho.position.set(cx, (cut !== null ? cut : gy) + 400, cz);
    ortho.up.set(0, 0, -1);
    ortho.lookAt(cx, gy, cz);
    renderView(ortho, {
      noFog: true,
      clip:
        cut !== null ? new THREE.Plane(new THREE.Vector3(0, -1, 0), cut) : null,
    });
    ctx.drawImage(canvas, TOP.x, TOP.y, TOP.w, TOP.h);

    // 2D overlay
    const px = (x) => TOP.x + (((x - cx) / R) * 0.5 + 0.5) * TOP.w;
    const pz = (z) => TOP.y + (((z - cz) / R) * 0.5 + 0.5) * TOP.h;
    const sx = TOP.w / (2 * R);
    ctx.save();
    ctx.beginPath();
    ctx.rect(TOP.x, TOP.y, TOP.w, TOP.h);
    ctx.clip();
    ctx.lineWidth = 1.5;
    // roads
    ctx.strokeStyle = "rgba(255,230,60,0.9)";
    ctx.setLineDash([6, 4]);
    for (const a of L.avenues) {
      ctx.strokeRect(
        px(a.x - a.width / 2),
        pz(a.z0),
        a.width * sx,
        (a.z1 - a.z0) * sx,
      );
    }
    for (const s of L.streets) {
      ctx.strokeRect(
        px(s.x0),
        pz(s.z - s.width / 2),
        (s.x1 - s.x0) * sx,
        s.width * sx,
      );
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(255,200,40,0.95)";
    ctx.lineWidth = L.BROADWAY_W * sx;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    L.BROADWAY.forEach((p, i) =>
      i ? ctx.lineTo(px(p[0]), pz(p[1])) : ctx.moveTo(px(p[0]), pz(p[1])),
    );
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    L.BROADWAY.forEach((p, i) =>
      i ? ctx.lineTo(px(p[0]), pz(p[1])) : ctx.moveTo(px(p[0]), pz(p[1])),
    );
    ctx.stroke();
    for (const c of L.CIRCLES || []) {
      ctx.strokeStyle = "rgba(255,140,30,0.95)";
      ctx.beginPath();
      ctx.arc(px(c.x), pz(c.z), c.rOuter * sx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px(c.x), pz(c.z), c.rIsland * sx, 0, Math.PI * 2);
      ctx.stroke();
    }
    // colliders
    ctx.strokeStyle = "rgba(80,220,255,0.55)";
    ctx.lineWidth = 1;
    for (const c of W.query(cx - R, cz - R, cx + R, cz + R)) {
      if (c.maxY < gy + 0.4) continue;
      const cs = Math.cos(c.yaw),
        sn = Math.sin(c.yaw);
      ctx.beginPath();
      [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].forEach(([a, b], i) => {
        const lx = a * c.hx,
          lz = b * c.hz;
        const wx = c.cx + lx * cs + lz * sn,
          wz = c.cz - lx * sn + lz * cs;
        i ? ctx.lineTo(px(wx), pz(wz)) : ctx.moveTo(px(wx), pz(wz));
      });
      ctx.closePath();
      ctx.stroke();
    }
    // sites
    ctx.font = "bold 13px monospace";
    ctx.lineWidth = 2.5;
    for (const s of L.SITES) {
      if (s.x1 < cx - R || s.x0 > cx + R || s.z1 < cz - R || s.z0 > cz + R)
        continue;
      ctx.strokeStyle = "rgba(255,60,220,0.95)";
      ctx.strokeRect(
        px(s.x0),
        pz(s.z0),
        (s.x1 - s.x0) * sx,
        (s.z1 - s.z0) * sx,
      );
      ctx.fillStyle = "#ff5ce0";
      ctx.fillText(s.id, px(s.x0) + 3, pz(s.z0) + 14);
    }
    // interactables & doors
    for (const it of W.interactables) {
      const p = it.getPos ? it.getPos() : it.pos;
      if (!p || Math.abs(p.x - cx) > R || Math.abs(p.z - cz) > R) continue;
      const isDoor = W.doors.includes(it);
      ctx.fillStyle = isDoor ? "#3dff6a" : "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(px(p.x), pz(p.z), isDoor ? 5 : 2.2, 0, Math.PI * 2);
      ctx.fill();
      if (isDoor) {
        ctx.fillStyle = "#3dff6a";
        ctx.font = "12px monospace";
        ctx.fillText(
          String(
            typeof it.label === "function" ? it.label() : it.label || "door",
          ).slice(0, 28),
          px(p.x) + 7,
          pz(p.z) + 4,
        );
      }
    }
    // problems
    const problems = lint(cx - R, cz - R, cx + R, cz + R);
    ctx.strokeStyle = "#ff2a2a";
    ctx.lineWidth = 3;
    for (const pb of problems) {
      ctx.beginPath();
      ctx.arc(px(pb.x), pz(pb.z), 11, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    // grid ticks + label
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(TOP.x, TOP.y, TOP.w, 24);
    ctx.fillStyle = "#fff";
    ctx.font = "14px monospace";
    ctx.fillText(
      `${QS.get("label") || "SURVEY"}  centre (${cx}, ${cz})  radius ${R} m  N↑  problems: ${problems.length}${cut !== null ? "  cut y<" + cut : ""}`,
      TOP.x + 8,
      TOP.y + 17,
    );

    // ---------- 2) oblique aerials + 4 street views ----------
    r.setSize(CELL_W, CELL_H, false);
    const cells = [];
    const aerial = (dx, dz, name) => {
      const cam = makeCam(55);
      const h = R * 0.95 + 25;
      cam.position.set(cx + dx * R * 1.05, gy + h, cz + dz * R * 1.05);
      cam.lookAt(cx, gy + 4, cz);
      cells.push({ name, cam, pos: cam.position.clone(), noFog: true });
    };
    aerial(0.85, 0.85, "aerial from SE");
    aerial(-0.85, -0.85, "aerial from NW");
    for (const [name, dx, dz] of [
      ["street, looking S (from N)", 0, -1],
      ["street, looking W (from E)", 1, 0],
      ["street, looking N (from S)", 0, 1],
      ["street, looking E (from W)", -1, 0],
    ]) {
      const p = streetViewPoint(cx, cz, dx, dz, Math.min(R * 0.8, 70));
      const cam = makeCam(70);
      cam.position.set(p.x, p.y + 1.7, p.z);
      cam.lookAt(cx, p.y + 5, cz);
      cells.push({ name, cam, pos: cam.position.clone() });
    }
    cells.forEach((c, i) => {
      settleAt(c.pos.x, c.pos.y - 1.64, c.pos.z);
      renderView(c.cam, { noFog: c.noFog });
      const col = i % 2,
        row = Math.floor(i / 2);
      const X = TOP.w + 10 + col * (CELL_W + 0),
        Y = row * CELL_H;
      ctx.drawImage(canvas, X, Y, CELL_W, CELL_H);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(X, Y, CELL_W, 20);
      ctx.fillStyle = "#fff";
      ctx.font = "13px monospace";
      ctx.fillText(
        `${c.name}  @(${c.pos.x.toFixed(0)}, ${c.pos.z.toFixed(0)})`,
        X + 6,
        Y + 14,
      );
    });

    G.renderHook = oldHook;
    const pre = document.createElement("pre");
    pre.id = "smoke-result";
    pre.style.display = "none";
    pre.textContent =
      "SMOKE_JSON" +
      "_BEGIN" +
      JSON.stringify({ problems, errors: G.errors.slice(0, 30) }) +
      "SMOKE_JSON" +
      "_END";
    document.body.appendChild(pre);
    document.title = "SURVEY_READY";
  };

  G.survey = { lint };
})();
