// play-inline-457 07 — the
// Lines 1367-1702 of readable/play-inline-457.pretty.js (statement-aligned).
  H.hair = function (R, b, style, color, C, RX, RY, RZ, face) {
    const hs = b.headS;
    const mat = {
      color,
      region: "fur",
      rough: 0.9,
      noise: 0.15,
      grad: [0.85, 1.1],
    };
    if (face && face.hairStreak) {
      // grey through dark hair + one white streak from the left temple (story cast: Sister Dawn)
      const gc = L.col(face.streakColor || 0x9a968e),
        amt = face.hairStreak;
      mat.paint = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
        const fa = Math.atan2(-(x - C[0]), -(z - C[2])); // 0 = front, + toward the character's left
        let t =
          amt * (L.hash3(wx * 400, wy * 400, wz * 400) > 0.6 ? 0.4 : 0.06); // a little salt & pepper
        // the streak: a broad band swept back from the left temple (plateau, soft edges), down the hanging hair too
        const da = Math.abs(fa - 0.55),
          band = da < 0.26 ? 1 : Math.max(0, 1 - (da - 0.26) / 0.24);
        if (band > 0)
          t = Math.max(
            t,
            Math.min(1, amt * 1.2) * band * (y - C[1] > -0.06 * hs ? 1 : 0.85),
          );
        t = Math.min(1, t);
        out[0] = lerp(out[0], gc.r, t);
        out[1] = lerp(out[1], gc.g, t);
        out[2] = lerp(out[2], gc.b, t);
      };
    }
    // Shell over the skull. Vertices outside the style's hairline collapse
    // inside the skull; the kept ring next to the hairline is pulled down
    // onto the scalp (and the next ring half way), so the hair THINS OUT to a
    // natural hairline instead of ending in a helmet-like cliff.
    const shell = (inflate, keep, ws, hsg, vol, covK) => {
      vol = vol === undefined ? 0.04 : vol; // extra loft on the crown (real hair has volume on top, not a painted-on cap)
      ws = ws || 28;
      hsg = hsg || 20;
      covK = covK === undefined ? 1 : covK;
      if (face && !face._hairKeep && covK >= 1) face._hairKeep = keep; // the face texture paints a matching soft hairline under it
      const g = P.sphere(1, 1, 1, ws, hsg);
      const pos = g.attributes.position,
        n = pos.count,
        W = ws + 1;
      const ok = new Uint8Array(n);
      for (let i = 0; i < n; i++)
        ok[i] = keep(pos.getX(i), pos.getY(i), pos.getZ(i)) ? 1 : 0;
      // distance (in grid steps, ≤2) from the nearest collapsed vertex
      const edge = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        if (!ok[i]) continue;
        const r = Math.floor(i / W),
          c = i % W;
        let d = 3;
        for (let dr = -2; dr <= 2; dr++)
          for (let dc = -2; dc <= 2; dc++) {
            const rr = r + dr;
            if (rr < 0 || rr > hsg) continue;
            const cc = (((c + dc) % ws) + ws) % ws; // wrap round the seam
            if (!ok[rr * W + cc])
              d = Math.min(d, Math.max(Math.abs(dr), Math.abs(dc)));
          }
        edge[i] = d;
      }
      // the first ring OUTSIDE the hairline lies on the scalp too (coverage 0):
      // the fringe fades out over it instead of stopping at a polygon edge
      const out1 = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        if (ok[i]) continue;
        const r = Math.floor(i / W),
          c = i % W;
        for (let dr = -1; dr <= 1 && !out1[i]; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr;
            if (rr < 0 || rr > hsg) continue;
            if (ok[rr * W + ((((c + dc) % ws) + ws) % ws)]) {
              out1[i] = 1;
              break;
            }
          }
      }
      const cov = new Float32Array(n);
      const skull = face && face._skull,
        so = [0, 0, 0, 0, 0, 0];
      for (let i = 0; i < n; i++) {
        let x = pos.getX(i),
          y = pos.getY(i),
          z = pos.getZ(i);
        const e = edge[i],
          thin = e === 1 ? 0.12 : e === 2 ? 0.55 : 1;
        let k = ok[i] ? lerp(0.975, inflate, thin) : 0.88;
        cov[i] = (ok[i] ? (e === 1 ? 0.34 : e === 2 ? 0.78 : 1) : 0) * covK;
        if (skull) {
          // follow the sculpted skull surface; the edge ring sits ON the scalp
          // (+1.5 mm) and the shell thickens to `inflate` two rings in
          skull(x, y, z, so);
          x = so[0];
          y = so[1];
          z = so[2];
          if (ok[i])
            k = lerp(
              1.012,
              inflate + 0.01 + vol * Math.max(0, y) * Math.max(0, y),
              thin,
            );
          else if (out1[i] && covK >= 1) k = 1.006;
        } else if (z > 0) z *= 1.07;
        pos.setXYZ(
          i,
          C[0] + x * RX * k,
          C[1] + y * RY * k + (ok[i] && !skull ? 0.004 * hs * thin : 0),
          C[2] + z * RZ * k,
        );
      }
      g.computeVertexNormals();
      g.userData.hairCov = cov;
      return g;
    };
    // FUZZ: a second, sparser shell a few mm out (coverage ≈ 0.5) — strand
    // gaps break the helmet-smooth silhouette into loose hair; only on the
    // close-up LOD budget (≈1.1k tris)
    const fuzz = (inflate, keep, vol, k) =>
      R.add(
        "head",
        shell(inflate + 0.04, keep, 28, 20, vol, k === undefined ? 0.5 : k),
        Object.assign({}, mat, { rough: Math.min(1, mat.rough + 0.05) }),
      );
    // hairline: front at y>front (receding at the temples, a slight widow's
    // peak), sides above the ears, back down to the nape
    const fem = !!(face && face.gender === "f");
    const hairline = (front, side, back) => (x, y, z) => {
      const fz = clamp((-z + 1) / 2, 0, 1); // 1 at front, 0 at back
      const ax = Math.abs(x);
      // men: temple recession + slight widow's peak; women: a rounded arch (no recession — it read as a flat cap line)
      const shape = fem
        ? fz *
          fz *
          (0.035 * Math.exp(-(x * x) / 0.03) - 0.03 * L.smooth(0.2, 0.55, ax))
        : fz *
          fz *
          (0.09 * L.smooth(0.12, 0.42, ax) * (1 - L.smooth(0.55, 0.8, ax)) -
            0.035 * Math.exp(-(x * x) / 0.01));
      const lim =
        lerp(back, front, fz) +
        shape +
        (L.noise3(x * 9 + 1, y * 9, z * 9) - 0.5) * 0.03;
      const sideLim = ax > 0.7 ? Math.max(lim, side) : lim;
      return y > sideLim;
    };
    const thinning = face && face.maniac && face.hair === "patchy";
    const patchy = (fn) =>
      thinning
        ? (x, y, z) => fn(x, y, z) && L.noise3(x * 4 + 3, y * 4, z * 4) > 0.55
        : fn;
    switch (style) {
      case "buzz":
        R.add(
          "head",
          shell(1.02, patchy(hairline(0.62, 0.1, -0.35)), 0, 0, 0.01),
          mat,
        );
        break;
      case "short":
        R.add("head", shell(1.05, patchy(hairline(0.6, 0.08, -0.45))), mat);
        fuzz(1.05, patchy(hairline(0.6, 0.08, -0.45)));
        break;
      case "balding": {
        const kb = (x, y, z) =>
          hairline(0.5, 0.02, -0.45)(x, y, z) && !(y > 0.55 && z < 0.4);
        R.add("head", shell(1.035, kb, 0, 0, 0.01), mat);
        fuzz(1.02, kb, 0.01, 0.4);
        break;
      }
      case "slick": // 50s slicked-back
        R.add(
          "head",
          shell(1.06, hairline(0.63, 0.1, -0.4)),
          Object.assign({}, mat, { rough: 0.35 }),
        );
        break;
      case "pompadour": {
        R.add(
          "head",
          shell(1.06, hairline(0.63, 0.1, -0.4)),
          Object.assign({}, mat, { rough: 0.4 }),
        );
        const q = P.sphere(0.07 * hs, 0.042 * hs, 0.065 * hs, 12, 8);
        P.xf(q, C[0], C[1] + 0.1 * hs, C[2] - 0.04 * hs, -0.35, 0, 0);
        R.add("head", q, Object.assign({}, mat, { rough: 0.4 }));
        break;
      }
      case "mohawk": {
        // centre strip only: from the top of the forehead over the crown to the nape
        const strip = hairline(0.62, -0.2, -0.3);
        R.add(
          "head",
          shell(1.02, (x, y, z) => Math.abs(x) < 0.22 && strip(x, y, z)),
          mat,
        );
        for (let i = 0; i < 7; i++) {
          const a = lerp(-0.45, 1.75, i / 6); // front (−Z) → back (+Z) over the crown
          const px = 0,
            py = Math.cos(a) * RY * 1.02,
            pz = Math.sin(a) * RZ * 1.05;
          const tip = [
            px,
            py + Math.cos(a) * 0.075 * hs,
            pz + Math.sin(a) * 0.075 * hs,
          ];
          R.add(
            "head",
            P.sweep(
              [
                [px + C[0], py + C[1], pz + C[2]],
                [tip[0] + C[0], tip[1] + C[1], tip[2] + C[2]],
              ],
              (t) => (1 - t) * 0.016 * hs + 0.002,
              { seg: 3, rs: 5 },
            ),
            mat,
          );
        }
        break;
      }
      case "long":
      case "bob": {
        R.add(
          "head",
          shell(
            1.085,
            hairline(0.6, style === "bob" ? -0.45 : -0.6, -0.8),
            0,
            0,
            0.07,
          ),
          mat,
        );
        fuzz(
          1.085,
          hairline(0.6, style === "bob" ? -0.45 : -0.6, -0.8),
          0.07,
          0.55,
        );
        if (style === "long") {
          const rings = [];
          for (let i = 0; i <= 5; i++) {
            const t = i / 5;
            rings.push({
              y: C[1] - 0.02 * hs - t * 0.2 * hs,
              rx: lerp(0.088, 0.075, t) * hs,
              rz: lerp(0.07, 0.035, t) * hs,
              oz: C[2] + lerp(0.035, 0.07, t) * hs,
              n: 2,
            });
          }
          rings.reverse();
          R.add(
            "head",
            P.loft(rings, {
              seg: 14,
              a0: PI * 0.45,
              a1: PI * 1.55,
              capBottom: false,
            }),
            mat,
          );
        }
        break;
      }
      case "ponytail":
      case "bun": {
        R.add("head", shell(1.075, hairline(0.6, 0.0, -0.5), 0, 0, 0.07), mat);
        fuzz(1.075, hairline(0.6, 0.0, -0.5), 0.07, 0.45);
        if (style === "bun")
          R.add(
            "head",
            P.xf(
              P.sphere(0.042 * hs, 0.04 * hs, 0.04 * hs, 10, 8),
              C[0],
              C[1] + 0.07 * hs,
              C[2] + 0.1 * hs,
            ),
            mat,
          );
        else
          R.add(
            "head",
            P.sweep(
              [
                [C[0], C[1] + 0.04 * hs, C[2] + 0.1 * hs],
                [C[0], C[1] - 0.04 * hs, C[2] + 0.14 * hs],
                [C[0], C[1] - 0.16 * hs, C[2] + 0.12 * hs],
              ],
              (t) => (0.026 - t * 0.018) * hs,
              { seg: 6, rs: 7 },
            ),
            mat,
          );
        break;
      }
      case "afro":
        R.add(
          "head",
          shell(1.28, hairline(0.58, 0.1, -0.35)),
          Object.assign({}, mat, { rough: 1 }),
        );
        fuzz(1.29, hairline(0.58, 0.1, -0.35), 0.04, 0.6);
        break;
      case "wild": {
        // matted, unkempt hair
        const g = shell(1.12, hairline(0.56, -0.1, -0.7));
        P.deform(g, (v) => {
          const n = L.noise3(v.x * 60, v.y * 60, v.z * 60);
          v.x += (n - 0.5) * 0.02 * hs;
          v.y += (n - 0.5) * 0.015 * hs;
        });
        R.add("head", g, mat);
        fuzz(1.13, hairline(0.56, -0.1, -0.7), 0.04, 0.6);
        break;
      }
      case "patchy": {
        // thin hair in tufts: only inside a normal hairline (never across the face)
        const hl = hairline(0.6, 0.05, -0.5),
          kp = (x, y, z) =>
            hl(x, y, z) && L.noise3(x * 4 + 3, y * 4, z * 4) > 0.5;
        R.add("head", shell(1.035, kp, 0, 0, 0.02), mat);
        fuzz(1.04, kp, 0.02, 0.5);
        break;
      }
      default:
        R.add("head", shell(1.05, hairline(0.6, 0.08, -0.45)), mat);
        fuzz(1.05, hairline(0.6, 0.08, -0.45));
    }
  };

