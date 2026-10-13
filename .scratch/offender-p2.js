/* src/textures/95_debug.js */
/* =====================================================================
 * NEW RAD CITY — TEXTURES: debug contact sheets (dev only)
 * Owned by: textures.
 *
 * Active ONLY when the URL contains ?texdebug=<page>. Never runs in the
 * normal game. Pages:
 *   texdebug=surfaces&p=0|1|2   raw tileable surfaces (shown 2×2 tiled to reveal seams)
 *   texdebug=normals            normal maps
 *   texdebug=facades            facade atlases (+ storefronts)
 *   texdebug=masks              façade window masks (R glass, G hole, B charred / wall field)
 *   texdebug=billboards&v=0|1   every brand billboard
 *   texdebug=posters            posters
 *   texdebug=signs              signs / neon
 *   texdebug=decals             decals (on a checker so alpha is visible)
 *   texdebug=icons              UI icons
 *   texdebug=3d                 lit material spheres/boxes placed at (0,300,-8) — use a shot at 0 300 0 yaw 0
 *   &night=0..1                 force the glow night factor (any page)
 *   ?autowin=0 disables the automatic window-grid detection on foreign façades; ?txwin=0 disables the whole façade shader
 *   texdebug=probe&perf=1 times this view (ms/frame, CPU rasteriser) — A/B with &txwin=0
 *   texdebug=probe also reports shaderErrs (three.js shader compile errors) in TXJSON
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const X = G._tx;
  const page = G.QS ? G.QS.get("texdebug") : null;
  if (!page) return;
  // &windebug=albedo|normal|room : override the façade shader output (set before the first façade compiles)
  const wd = G.QS.get("windebug");
  if (wd)
    X.winDebug =
      {
        albedo: "gl_FragColor = vec4( diffuseColor.rgb, 1.0 );",
        normal: "gl_FragColor = vec4( normal * 0.5 + 0.5, 1.0 );",
        room: "gl_FragColor = vec4( txWinRad * 6.0, 1.0 );",
      }[wd] || null;

  function sheet(items, cols, cell, tiled, checker) {
    const root = document.createElement("div");
    root.style.cssText =
      "position:fixed;inset:0;z-index:5000;background:#222;overflow:hidden;display:grid;gap:6px;padding:6px;" +
      "grid-template-columns:repeat(" +
      cols +
      "," +
      cell +
      "px);font:11px monospace;color:#ddd;align-content:start";
    for (const it of items) {
      const box = document.createElement("div");
      const cv = document.createElement("canvas");
      const src = it.canvas;
      if (!src) continue;
      const aspect = src.height / src.width;
      cv.width = cell;
      cv.height = Math.round(cell * Math.min(aspect, 2));
      const c = cv.getContext("2d");
      if (checker) {
        for (let y = 0; y < cv.height; y += 12)
          for (let x = 0; x < cv.width; x += 12) {
            c.fillStyle = ((x + y) / 12) % 2 ? "#777" : "#999";
            c.fillRect(x, y, 12, 12);
          }
      }
      if (tiled) {
        const pat = c.createPattern(src, "repeat");
        const k = cell / 2 / src.width;
        pat.setTransform(
          new DOMMatrix([k, 0, 0, cv.height / 2 / src.height, 0, 0]),
        );
        c.fillStyle = pat;
        c.fillRect(0, 0, cv.width, cv.height);
      } else c.drawImage(src, 0, 0, cv.width, cv.height);
      box.appendChild(cv);
      const lab = document.createElement("div");
      lab.textContent = it.label;
      box.appendChild(lab);
      root.appendChild(box);
    }
    document.body.appendChild(root);
  }
  const texCanvas = (t) => (t && t.image) || null;

  X.debugInit = function () {
    const p = Number(G.QS.get("p") || 0),
      v = Number(G.QS.get("v") || 0);
    if (G.QS.has("night")) G.mats.setNight(Number(G.QS.get("night"))); // e.g. &night=1 to check glow on the 3d page
    const t0 = performance.now();
    if (page === "surfaces") {
      const names = G.tex
        .names()
        .filter((n) => !/^(facade_|storefront_|paint_)/.test(n));
      const per = 24,
        list = names.slice(p * per, p * per + per);
      sheet(
        list.map((n) => ({ label: n, canvas: G.tex.canvas(n) })),
        6,
        205,
        true,
      );
    } else if (page === "normals") {
      const names = G.tex
        .names()
        .filter((n) => G.tex.info(n).normal)
        .slice(p * 24, p * 24 + 24);
      sheet(
        names.map((n) => ({
          label: n + "_n",
          canvas: texCanvas(G.tex.normal(n)),
        })),
        6,
        205,
        true,
      );
    } else if (page === "paints") {
      sheet(
        G.mats.paints().map((n) => ({
          label: "paint_" + n,
          canvas: G.tex.canvas("paint_" + n),
        })),
        7,
        175,
        true,
      );
    } else if (page === "facades") {
      const names = G.tex
        .names()
        .filter((n) => /^(facade_|storefront_)/.test(n))
        .slice(p * 16, p * 16 + 16);
      sheet(
        names.map((n) => ({ label: n, canvas: G.tex.canvas(n) })),
        8,
        152,
        false,
      );
    } else if (page === "masks") {
      // façade window masks: R see-through, G hole, B charred (windows) / wall field (elsewhere)
      const names = G.tex
        .names()
        .filter((n) => /^facade_[a-z]+_\d+$/.test(n))
        .slice(p * 16, p * 16 + 16);
      sheet(
        names.map((n) => {
          const t = X.facadeMask(n);
          return { label: n + "_win", canvas: t && t.image };
        }),
        8,
        152,
        false,
      );
    } else if (page === "billboards") {
      const brands = G.tex.brands().slice(p * 12, p * 12 + 12);
      sheet(
        brands.map((b) => {
          const t = G.tex.billboard(b, v),
            q = t.userData.textQA;
          return {
            label:
              b +
              " v" +
              v +
              (q
                ? "  text:" +
                  q.boxes +
                  (q.out ? " OUT:" + q.out : "") +
                  (q.overlap ? " OVERLAP:" + q.overlap : "")
                : ""),
            canvas: texCanvas(t),
          };
        }),
        3,
        410,
        false,
      );
    } else if (page === "posters") {
      const ids = X.posterIds().slice(p * 16, p * 16 + 16);
      sheet(
        ids.map((b) => ({ label: b, canvas: texCanvas(G.tex.poster(b, v)) })),
        8,
        150,
        true && false,
        true,
      );
    } else if (page === "signs") {
      const items = [];
      const S = X.debugSigns ? X.debugSigns() : [];
      for (const s of S)
        items.push({ label: s.label, canvas: texCanvas(s.tex) });
      sheet(items, 4, 300, false, true);
    } else if (page === "decals") {
      const names = X.DECALS ? Object.keys(X.DECALS) : [];
      sheet(
        names
          .slice(p * 30, p * 30 + 30)
          .map((n) => ({ label: n, canvas: texCanvas(G.tex.decal(n)) })),
        8,
        150,
        false,
        true,
      );
    } else if (page === "icons") {
      const names = X.ICONS ? Object.keys(X.ICONS) : [];
      sheet(
        names.map((n) => ({ label: n, canvas: texCanvas(G.tex.icon(n)) })),
        10,
        110,
        false,
        true,
      );
    } else if (page === "one") {
      // one or more textures at 1:1 — &names=a,b,c (billboard:<brand>:<v>, poster:<brand>, decal:<n>, normal:<n> allowed)
      const names = (G.QS.get("names") || "concrete").split(",");
      const items = names.map((n) => {
        const [k, a, b] = n.split(":");
        const c =
          k === "billboard"
            ? texCanvas(G.tex.billboard(a, Number(b || 0)))
            : k === "poster"
              ? texCanvas(G.tex.poster(a, Number(b || 0)))
              : k === "decal"
                ? texCanvas(G.tex.decal(a))
                : k === "normal"
                  ? texCanvas(G.tex.normal(a))
                  : k === "icon"
                    ? texCanvas(G.tex.icon(a))
                    : G.tex.canvas(n);
        return { label: n, canvas: c };
      });
      const cell = Number(G.QS.get("cell") || 512);
      sheet(
        items,
        Math.max(1, Math.floor(1400 / (cell + 6))),
        cell,
        false,
        true,
      );
    } else if (page === "3d") {
      G.events.on("newGame", build3d);
    } else if (page === "probe") {
      // collect shader compile / link errors (three logs them with console.error) into the probe result
      const shaderErrs = [];
      const ce = console.error.bind(console);
      console.error = function () {
        try {
          const t = Array.from(arguments).join(" ");
          if (/Shader Error|shader|ERROR:/.test(t) && shaderErrs.length < 4)
            shaderErrs.push(t.slice(0, 1500));
        } catch (e) {
          /* ignore */
        }
        return ce.apply(null, arguments);
      };
      // Integration probe for the full game: which scene materials came from G.mats (name 'tx:'), glow/macro
      // registration and measured texture memory, written to the DOM as TXJSON…TXEND (read with --dump-dom).
      const probe = () => {
        const seen = new Set(),
          by = { tx: 0, other: 0 },
          names = {},
          others = {};
        G.scene.traverse((o) => {
          const ms = Array.isArray(o.material)
            ? o.material
            : o.material
              ? [o.material]
              : [];
          for (const m of ms) {
            if (seen.has(m)) continue;
            seen.add(m);
            const n = m.name || "";
            if (n.indexOf("tx:") === 0) {
              by.tx++;
              const k = n.split(":").slice(0, 2).join(":");
              names[k] = (names[k] || 0) + 1;
            } else {
              by.other++;
              const k = (m.userData && m.userData.mapKey) || n || m.type;
              others[k] = (others[k] || 0) + 1;
            }
          }
        });
        const top = (o) =>
          Object.entries(o)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 40);
        let img = null;
        if (G.QS.has("probeShot")) {
          try {
            G.renderer.render(G.scene, G.camera);
            img = G.renderer.domElement.toDataURL("image/jpeg", 0.85);
          } catch (e) {
            img = "ERR " + e.message;
          }
        }
        // &pick=x,y;x,y… (NDC −1..1): what material sits under those screen points
        const picks = [];
        if (G.QS.has("pick")) {
          const rc = new THREE.Raycaster();
          for (const pr of G.QS.get("pick").split(";")) {
            const [px, py] = pr.split(",").map(Number);
            rc.setFromCamera(new THREE.Vector2(px, py), G.camera);
            const hit = rc
              .intersectObjects(G.scene.children, true)
              .find((h) => h.object.visible && h.object.material);
            if (!hit) {
              picks.push([pr, null]);
              continue;
            }
            const m = Array.isArray(hit.object.material)
              ? hit.object.material[hit.face ? hit.face.materialIndex : 0]
              : hit.object.material;
            picks.push([
              pr,
              {
                name: m.name,
                key: m.userData && m.userData.mapKey,
                obj: hit.object.name,
                dist: +hit.distance.toFixed(1),
                macro: m.userData && m.userData.txMacro,
                uv: hit.uv && [+hit.uv.x.toFixed(3), +hit.uv.y.toFixed(3)],
              },
            ]);
          }
        }
        // &perf=1: CPU-side ms per frame of this exact view (SwiftShader rasterises on the CPU, so A/B runs with
        // &txwin=0 measure the façade shader's fragment cost); synchronised with a 1-px readPixels per frame
        let perf = null;
        if (G.QS.has("perf")) {
          try {
            const gl = G.renderer.getContext(),
              px = new Uint8Array(4),
              sync = () =>
                gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
            for (let i = 0; i < 3; i++) {
              G.renderer.render(G.scene, G.camera);
              sync();
            }
            // virtual time stands still during this loop: wall-clock timing comes from Chrome's console log timestamps.
            // Levels are interleaved in one session (X.perfLvl → uniform, no recompiles) so machine-load noise hits all alike:
            // 0 full façade shader, 1 no rooms, 2 + no wall detail, 3 + no reveals, 4 + no window branch.
            const n =
              Number(G.QS.get("perf")) > 1 ? Number(G.QS.get("perf")) : 4;
            for (let rep = 0; rep < 3; rep++)
              for (const lv of [0, 1, 2, 3, 4]) {
                X.perfLvl = lv;
                G.renderer.render(G.scene, G.camera);
                sync();
                console.log("TXPERF_L" + lv + "_B");
                for (let i = 0; i < n; i++) {
                  G.renderer.render(G.scene, G.camera);
                  sync();
                }
                console.log("TXPERF_L" + lv + "_E");
              }
            X.perfLvl = 0;
            const info = G.renderer.info.render;
            perf = { frames: n, calls: info.calls, tris: info.triangles };
          } catch (e) {
            perf = "ERR " + e.message;
          }
        }
        const res = {
          perf,
          autoWin: X.autoWin,
          autoWinRej: X.autoWinRej,
          winMats: X.winCount,
          shaderErrs,
          img,
          picks,
          materials: by,
          txNames: top(names),
          otherNames: top(others),
          stats: G.tex.stats(),
          mem: G.tex.memoryReport().slice(0, 25),
          night: G.mats.nightFactor(),
        };
        const pre = document.createElement("pre");
        pre.style.display = "none";
        pre.textContent = "TXJSON" + JSON.stringify(res) + "TXEND";
        document.body.appendChild(pre);
      };
      G.events.on("initDone", () =>
        setTimeout(probe, Number(G.QS.get("probeMs") || 8000)),
      );
      return;
    }
    const info = document.createElement("div");
    info.style.cssText =
      "position:fixed;right:6px;bottom:6px;z-index:5001;color:#ff0;font:12px monospace;background:#000a;padding:4px";
    info.textContent =
      "texdebug " +
      page +
      " p" +
      p +
      "  " +
      Math.round(performance.now() - t0) +
      "ms  " +
      JSON.stringify(G.tex.stats());
    document.body.appendChild(info);
  };

  function build3d() {
    const names = (
      G.QS.get("mats") ||
      "brick_red,brick_brown,brick_tan,concrete,concrete_dark,asphalt,sidewalk,stone_limestone,granite,rust,metal_panel,corrugated,wood_planks,wood_rotten,tile_cryo,cryo_wall,chrome,glass,cryo_grey,cryo_suit_grey,paint_red,neon_pink,copper_patina,rubble,dirt"
    ).split(",");
    const grp = new THREE.Group();
    const geoS = new THREE.SphereGeometry(0.9, 32, 20),
      geoB = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    names.forEach((n, i) => {
      const col = i % 8,
        row = (i / 8) | 0;
      const m = new THREE.Mesh(i % 2 ? geoS : geoB, G.mats.get(n));
      m.position.set((col - 3.5) * 2.2, 300 + 2.2 - row * 2.2, -9);
      m.rotation.y = 0.5;
      grp.add(m);
    });
    G.scene.add(grp);
  }
})();
