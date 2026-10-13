// play-inline-22 02 — src
// Lines 31-83 of readable/play-inline-22.pretty.js (statement-aligned).
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

