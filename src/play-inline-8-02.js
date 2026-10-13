// play-inline-8 02 — ctx
// Lines 186-422 of readable/play-inline-8.pretty.js (statement-aligned).
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
