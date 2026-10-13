// play-inline-479 05 — color
// Lines 1977-2183 of readable/play-inline-479.pretty.js (statement-aligned).
  function uvCell(g, name, filter, flipU) {
    const r = cell(name);
    const uv = g.attributes.uv;
    if (!uv) return uvWhite(g);
    const n = uv.count,
      a = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      if (filter && !filter(i)) {
        a[i * 2] = WHITE.u;
        a[i * 2 + 1] = WHITE.v;
        continue;
      }
      let u = U.clamp(uv.getX(i), 0, 1),
        v = U.clamp(uv.getY(i), 0, 1);
      if (flipU) u = 1 - u;
      a[i * 2] = r.u0 + u * (r.u1 - r.u0);
      a[i * 2 + 1] = r.v0 + v * (r.v1 - r.v0);
    }
    g.setAttribute("uv", new THREE.BufferAttribute(a, 2));
    return g;
  }
  // BoxGeometry(1 segment) face order: +x, -x, +y, -y, +z, -z — 4 vertices each
  const FACE = { x: 0, X: 1, y: 2, Y: 3, z: 4, Z: 5 };
  function boxFaceFilter(faces) {
    if (!faces || faces === "all") return null;
    const on = {};
    for (const ch of faces) if (FACE[ch] !== undefined) on[FACE[ch]] = true;
    return (i) => !!on[Math.floor(i / 4)];
  }

  function kit() {
    const parts = [];
    const push = (g, pos, ry, scale, rx, rz) => {
      parts.push(
        U.bake(
          g,
          pos,
          ry || 0,
          scale === undefined ? 1 : scale,
          rx || 0,
          rz || 0,
        ),
      );
    };
    const P = (x, y, z) => ({ x: x || 0, y: y || 0, z: z || 0 });
    const K = {
      parts,
      box(w, h, d, color, x, y, z, ry, rx, rz) {
        push(
          uvWhite(paintVar(new THREE.BoxGeometry(w, h, d), color)),
          P(x, y, z),
          ry,
          1,
          rx,
          rz,
        );
        return K;
      },
      cyl(rt, rb, h, color, x, y, z, seg, rx, rz, ry) {
        push(
          uvWhite(
            paintVar(new THREE.CylinderGeometry(rt, rb, h, seg || 12), color),
          ),
          P(x, y, z),
          ry,
          1,
          rx,
          rz,
        );
        return K;
      },
      sph(r, color, x, y, z, sx, sy, sz, seg) {
        push(
          uvWhite(
            paintVar(
              new THREE.SphereGeometry(
                r,
                seg || 10,
                Math.max(6, (seg || 10) - 2),
              ),
              color,
            ),
          ),
          P(x, y, z),
          0,
          new THREE.Vector3(sx || 1, sy || 1, sz || 1),
        );
        return K;
      },
      lathe(pts, color, x, y, z, seg, rx, rz) {
        push(
          uvWhite(
            paintVar(
              new THREE.LatheGeometry(
                pts.map((p) => new THREE.Vector2(p[0], p[1])),
                seg || 14,
              ),
              color,
            ),
          ),
          P(x, y, z),
          0,
          1,
          rx,
          rz,
        );
        return K;
      },
      torus(r, t, color, x, y, z, rx, ry, arc) {
        push(
          uvWhite(
            paintVar(
              new THREE.TorusGeometry(r, t, 6, 14, arc || Math.PI * 2),
              color,
            ),
          ),
          P(x, y, z),
          ry,
          1,
          rx,
        );
        return K;
      },
      cone(r, h, color, x, y, z, seg, rx, rz) {
        push(
          uvWhite(paintVar(new THREE.ConeGeometry(r, h, seg || 10), color)),
          P(x, y, z),
          0,
          1,
          rx,
          rz,
        );
        return K;
      },
      /** Box with a cell on some faces ('z' front, 'Z' back, 'y' top, 'all'…). Colour tints the whole box. */
      boxL(w, h, d, color, cellName, faces, x, y, z, ry, rx, rz) {
        push(
          uvCell(
            paintVar(new THREE.BoxGeometry(w, h, d), color, 0.04),
            cellName,
            boxFaceFilter(faces || "z"),
          ),
          P(x, y, z),
          ry,
          1,
          rx,
          rz,
        );
        return K;
      },
      /** Cylinder whose side wears the cell (wrap-around label); ends white. */
      cylL(rt, rb, h, color, cellName, x, y, z, seg, rx, rz, ry) {
        const g = new THREE.CylinderGeometry(rt, rb, h, seg || 14, 1, true);
        push(
          uvCell(paintVar(g, color, 0.03), cellName),
          P(x, y, z),
          ry,
          1,
          rx,
          rz,
        );
        return K;
      },
      /** Flat disc facing +y (can lids, cap tops, dials) wearing the cell. */
      discL(r, color, cellName, x, y, z, rx, rz, seg) {
        const g = new THREE.CircleGeometry(r, seg || 16);
        g.rotateX(-Math.PI / 2);
        push(
          uvCell(paintVar(g, color, 0.02), cellName),
          P(x, y, z),
          0,
          1,
          rx,
          rz,
        );
        return K;
      },
      /** Flat rectangle facing +z (decals, stickers) wearing the cell. */
      planeL(w, h, color, cellName, x, y, z, ry, rx) {
        const g = new THREE.PlaneGeometry(w, h);
        push(uvCell(paintVar(g, color, 0.02), cellName), P(x, y, z), ry, 1, rx);
        return K;
      },
      build() {
        const g = U.mergeGeometries(parts);
        parts.forEach((p) => p.dispose());
        return g;
      },
    };
    return K;
  }

  G.items._art = {
    texture: build,
    cell,
    kit,
    CELLS,
    paintVar,
    uvWhite,
    uvCell,
    COVERS,
    /** The atlas canvas (debug: G.items._art.canvas() → document.body.appendChild(...)). */
    canvas: () => {
      build();
      return canvas;
    },
  };
