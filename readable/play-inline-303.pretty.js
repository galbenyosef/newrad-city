/* src/poi_eastside/05_dress.js */
/* =====================================================================
 * NEW RAD CITY — POI EASTSIDE · 05 set dressing kit (adapted from poi_uptown)
 * Procedural furniture, sculpture and natural-history specimens shared
 * by the east-side POIs. Everything goes into a P.Batch (local coords).
 *   skeletons (dinosaurs / ripjaw), mounted animals, elephant, whale,
 *   human statues / horse, chairs, tables, theatre seats, sofas, beds,
 *   grand piano, organ pipes, chandeliers, bookshelves, crib, rocking
 *   chair, bathtub, display cases, palms, paintings, rugs, fireplaces,
 *   bar counters + bottle shelves, rubble, paper drifts, glass shards.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pe) return;
  const P = G._pe,
    U = G.util;
  const TAU = P.TAU,
    PI = P.PI,
    HP = P.HP;
  const D = (P.dress = {});

  // ---------------------------------------------------------------
  // Paintings atlas (8 cells, 4×2) — original art, 1950s-museum mood
  // ---------------------------------------------------------------
  D.paintingTex = function () {
    return P.canvasTex("pe_paintings", 1024, 512, (ctx, w, h) => {
      const r = P.rng("paint");
      const cw = w / 4,
        ch = h / 2;
      const scenes = [
        (x, y) => {
          // Central Park in autumn
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#9ab4c8");
          g.addColorStop(0.55, "#e8d8a8");
          g.addColorStop(0.56, "#6a7a3a");
          g.addColorStop(1, "#3a4420");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 26; i++) {
            ctx.fillStyle = ["#c86a28", "#d8a030", "#8a3a1a", "#b88a30"][i % 4];
            ctx.beginPath();
            ctx.arc(
              x + r() * cw,
              y + ch * (0.45 + r() * 0.2),
              10 + r() * 22,
              0,
              TAU,
            );
            ctx.fill();
          }
          ctx.fillStyle = "#6a7a8a";
          ctx.fillRect(x + cw * 0.1, y + ch * 0.62, cw * 0.8, ch * 0.08);
        },
        (x, y) => {
          // portrait of a stern patron
          ctx.fillStyle = "#2a2016";
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#1a1410";
          ctx.beginPath();
          ctx.ellipse(
            x + cw / 2,
            y + ch * 0.95,
            cw * 0.36,
            ch * 0.4,
            0,
            0,
            TAU,
          );
          ctx.fill();
          ctx.fillStyle = "#c89a78";
          ctx.beginPath();
          ctx.ellipse(
            x + cw / 2,
            y + ch * 0.42,
            cw * 0.14,
            ch * 0.2,
            0,
            0,
            TAU,
          );
          ctx.fill();
          ctx.fillStyle = "#d8d0c0";
          ctx.fillRect(x + cw * 0.44, y + ch * 0.62, cw * 0.12, ch * 0.1);
          ctx.fillStyle = "#3a2a1a";
          ctx.fillRect(x + cw * 0.38, y + ch * 0.2, cw * 0.24, ch * 0.08);
        },
        (x, y) => {
          // harbour with liners
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#d8b888");
          g.addColorStop(0.6, "#8aa0a8");
          g.addColorStop(1, "#3a5060");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#2a2a2a";
          ctx.fillRect(x + cw * 0.2, y + ch * 0.5, cw * 0.5, ch * 0.1);
          ctx.fillStyle = "#a83a2a";
          ctx.fillRect(x + cw * 0.3, y + ch * 0.38, cw * 0.06, ch * 0.12);
          ctx.fillRect(x + cw * 0.45, y + ch * 0.38, cw * 0.06, ch * 0.12);
          ctx.fillStyle = "#6a6a70";
          for (let i = 0; i < 5; i++)
            ctx.fillRect(
              x + cw * (0.72 + i * 0.05),
              y + ch * (0.3 - i * 0.02),
              cw * 0.04,
              ch * (0.3 + i * 0.02),
            );
        },
        (x, y) => {
          // still life
          ctx.fillStyle = "#3a2e22";
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#6a4a2a";
          ctx.fillRect(x, y + ch * 0.7, cw, ch * 0.3);
          ctx.fillStyle = "#a82a20";
          ctx.beginPath();
          ctx.arc(x + cw * 0.35, y + ch * 0.62, 22, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#d8b040";
          ctx.beginPath();
          ctx.arc(x + cw * 0.55, y + ch * 0.64, 18, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#8ab0a0";
          ctx.fillRect(x + cw * 0.62, y + ch * 0.3, cw * 0.1, ch * 0.4);
        },
        (x, y) => {
          // savanna sketch
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#e8c888");
          g.addColorStop(0.6, "#d8a860");
          g.addColorStop(1, "#8a6a3a");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#3a2a1a";
          ctx.fillRect(x + cw * 0.6, y + ch * 0.35, 5, ch * 0.3);
          ctx.beginPath();
          ctx.ellipse(x + cw * 0.61, y + ch * 0.33, 50, 12, 0, 0, TAU);
          ctx.fill();
        },
        (x, y) => {
          // abstract modern
          ctx.fillStyle = "#e8e0d0";
          ctx.fillRect(x, y, cw, ch);
          const cols = ["#b8302a", "#1a3a8a", "#e8c030", "#1a1a1a"];
          for (let i = 0; i < 7; i++) {
            ctx.fillStyle = cols[i % 4];
            ctx.fillRect(
              x + r() * cw * 0.8,
              y + r() * ch * 0.8,
              20 + r() * 80,
              10 + r() * 60,
            );
          }
        },
        (x, y) => {
          // skyline at night
          ctx.fillStyle = "#10182a";
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 14; i++) {
            const bw = 12 + r() * 20,
              bh = 30 + r() * 140;
            ctx.fillStyle = "#1e2436";
            ctx.fillRect(x + (i * cw) / 14, y + ch - bh, bw, bh);
            for (let k = 0; k < 8; k++) {
              ctx.fillStyle = r() < 0.5 ? "#e8c870" : "#2a2a3a";
              ctx.fillRect(
                x + (i * cw) / 14 + 3 + r() * (bw - 6),
                y + ch - bh + r() * bh,
                2,
                3,
              );
            }
          }
        },
        (x, y) => {
          // lady with parasol
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#bcd0d8");
          g.addColorStop(1, "#8aa060");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#f0e8e0";
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.5, y + ch * 0.35);
          ctx.lineTo(x + cw * 0.4, y + ch * 0.95);
          ctx.lineTo(x + cw * 0.6, y + ch * 0.95);
          ctx.fill();
          ctx.fillStyle = "#c86a6a";
          ctx.beginPath();
          ctx.arc(x + cw * 0.46, y + ch * 0.28, 36, PI, TAU);
          ctx.fill();
        },
      ];
      scenes.forEach((f, i) => {
        const x = (i % 4) * cw,
          y = Math.floor(i / 4) * ch;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cw, ch);
        ctx.clip();
        f(x, y);
        P.blotches(ctx, cw, ch, r, 0);
        ctx.restore();
      });
      // varnish yellowing + craquelure
      ctx.fillStyle = "rgba(120,90,30,0.18)";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(30,20,10,0.25)";
      ctx.lineWidth = 0.6;
      for (let i = 0; i < 400; i++) {
        const x = r() * w,
          y = r() * h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (r() - 0.5) * 16, y + (r() - 0.5) * 16);
        ctx.stroke();
      }
    });
  };
  /** Framed painting (cell 0..7), facing ry (0 → +z). */
  D.painting = function (b, x, y, z, w, h, ry, cell, o) {
    o = o || {};
    const k = P.texMat("paintings", D.paintingTex(), { rough: 0.6 });
    const cx = cell % 4,
      cy = Math.floor(cell / 4);
    const m = P.m4(x, y, z, ry);
    b.geo(
      k,
      new THREE.PlaneGeometry(w, h),
      m.clone().multiply(P.m4(0, 0, 0.035)),
      {
        uv: "keep",
        uvRect: [cx / 4, 1 - (cy + 1) / 2, (cx + 1) / 4, 1 - cy / 2],
        noAO: true,
        grime: 0.05,
      },
    );
    const fk = o.frame || "gold",
      ft = o.ft || 0.09;
    for (const s of [-1, 1]) {
      b.geo(
        fk,
        new THREE.BoxGeometry(w + ft * 2, ft, 0.07),
        m.clone().multiply(P.m4(0, s * (h / 2 + ft / 2), 0.035)),
        { noAO: true },
      );
      b.geo(
        fk,
        new THREE.BoxGeometry(ft, h, 0.07),
        m.clone().multiply(P.m4(s * (w / 2 + ft / 2), 0, 0.035)),
        { noAO: true },
      );
    }
  };

  // ---------------------------------------------------------------
  // Skeletons: generic vertebrate from a spine polyline
  // ---------------------------------------------------------------
  /**
   * spec: {pts:[[x,y,z]...] tail tip → neck end, v (vertebra size), ribs:[t0,t1], ribLen, skull:{len,h,w,open, horns},
   *        legs:[{t, femur, tibia, meta, spread, fwd (knee dir sign)}], arms:[{t, upper, lower, hand, claws}], mount (steel rods), key}
   */
  D.skeleton = function (b, spec) {
    const key = spec.key || "bone";
    const curve = new THREE.CatmullRomCurve3(
      spec.pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
    );
    const N = spec.n || 40,
      v = spec.v || 0.15;
    const at = (t) => curve.getPointAt(Math.max(0, Math.min(1, t)));
    const tan = (t) => curve.getTangentAt(Math.max(0, Math.min(1, t)));
    const scaleAt = (t) =>
      spec.taper
        ? spec.taper(t)
        : 0.35 + 0.65 * Math.sin(Math.min(1, t * 1.2) * PI * 0.5);
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < N; i++) {
      const t = (i + 0.5) / N,
        p = at(t),
        d = tan(t),
        s = v * scaleAt(t);
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        d,
      );
      const m = new THREE.Matrix4().compose(p, q, new THREE.Vector3(1, 1, 1));
      b.geo(
        key,
        new THREE.CylinderGeometry(
          s * 0.8,
          s,
          (curve.getLength() / N) * 0.72,
          6,
        ),
        m,
        { grime: 0.3, noAO: true },
      );
      // neural spine (dorsal) + transverse processes
      const side = new THREE.Vector3().crossVectors(d, up).normalize();
      const dors = new THREE.Vector3().crossVectors(side, d).normalize();
      const sp = spec.spine === undefined ? 1.8 : spec.spine;
      if (s > 0.02) {
        b.rod(key, p, p.clone().addScaledVector(dors, s * sp), s * 0.22, 4, {
          noAO: true,
          grime: 0.3,
        });
        if (t > 0.2) {
          b.rod(
            key,
            p.clone().addScaledVector(side, -s * 1.2),
            p.clone().addScaledVector(side, s * 1.2),
            s * 0.15,
            4,
            { noAO: true },
          );
        }
      }
      // ribs
      if (
        spec.ribs &&
        t >= spec.ribs[0] &&
        t <= spec.ribs[1] &&
        i % (spec.ribStep || 1) === 0
      ) {
        const f = (t - spec.ribs[0]) / (spec.ribs[1] - spec.ribs[0]);
        const L =
          (spec.ribLen || 1) *
          Math.sin(0.25 + f * 2.6) *
          (spec.ribScale ? spec.ribScale(f) : 1);
        for (const sg of [-1, 1]) {
          const a = p.clone(),
            b1 = p
              .clone()
              .addScaledVector(side, sg * L * 0.45)
              .addScaledVector(dors, -L * 0.1),
            c = p
              .clone()
              .addScaledVector(side, sg * L * 0.55)
              .addScaledVector(dors, -L * 0.6),
            e = p
              .clone()
              .addScaledVector(side, sg * L * 0.3)
              .addScaledVector(dors, -L * 1.0);
          b.rod(key, a, b1, s * 0.24, 4, { noAO: true });
          b.rod(key, b1, c, s * 0.2, 4, { noAO: true });
          b.rod(key, c, e, s * 0.14, 4, { noAO: true });
        }
      }
    }
    // legs
    const floorY = spec.floor || 0;
    for (const L of spec.legs || []) {
      const hip = at(L.t),
        d = tan(L.t),
        side = new THREE.Vector3().crossVectors(d, up).normalize();
      const fwd = new THREE.Vector3(d.x, 0, d.z)
        .normalize()
        .multiplyScalar(L.fwd === undefined ? 1 : L.fwd);
      for (const sg of [-1, 1]) {
        const h0 = hip.clone().addScaledVector(side, sg * (L.spread || 0.4));
        const pose = (L.pose && L.pose[sg < 0 ? 0 : 1]) || [0, 0];
        const knee = h0
          .clone()
          .addScaledVector(fwd, L.femur * (0.35 + pose[0]))
          .add(new THREE.Vector3(0, -L.femur * 0.9, 0));
        let ankle = knee
          .clone()
          .addScaledVector(fwd, -L.tibia * (0.35 - pose[1]))
          .add(new THREE.Vector3(0, -L.tibia * 0.92, 0));
        if (L.plant !== false)
          ankle.y = Math.max(floorY + (L.meta || 0.3) * 0.6, ankle.y);
        const foot = ankle.clone().addScaledVector(fwd, (L.meta || 0.3) * 0.8);
        foot.y = floorY + 0.06;
        const r0 = L.r || 0.12;
        b.rod(key, h0, knee, r0, 6, { noAO: true, grime: 0.3 });
        b.sphere(key, knee.x, knee.y, knee.z, r0 * 1.3, {
          ws: 6,
          hs: 4,
          noAO: true,
        });
        b.rod(key, knee, ankle, r0 * 0.8, 6, { noAO: true });
        b.rod(key, ankle, foot, r0 * 0.6, 5, { noAO: true });
        for (let k = -1; k <= 1; k++) {
          const toe = foot
            .clone()
            .addScaledVector(fwd, (L.meta || 0.3) * 0.5)
            .addScaledVector(side, k * r0 * 1.2);
          toe.y = floorY + 0.03;
          b.rod(key, foot, toe, r0 * 0.3, 4, { noAO: true });
        }
      }
      // pelvis plate
      b.sphere(key, hip.x, hip.y - 0.1, hip.z, (L.spread || 0.4) * 1.1, {
        sx: 1,
        sy: 0.6,
        sz: 1,
        ws: 8,
        hs: 5,
        noAO: true,
      });
    }
    for (const A of spec.arms || []) {
      const sh = at(A.t),
        d = tan(A.t),
        side = new THREE.Vector3().crossVectors(d, up).normalize();
      const fwd = new THREE.Vector3(d.x, 0, d.z).normalize();
      for (const sg of [-1, 1]) {
        const s0 = sh
          .clone()
          .addScaledVector(side, sg * (A.spread || 0.3))
          .add(new THREE.Vector3(0, -0.1, 0));
        const el = s0
          .clone()
          .addScaledVector(fwd, A.upper * (A.reach || 0.5))
          .addScaledVector(side, sg * A.upper * 0.3)
          .add(new THREE.Vector3(0, -A.upper * (A.drop || 0.7), 0));
        const wr = el
          .clone()
          .addScaledVector(fwd, A.lower * 0.8)
          .add(new THREE.Vector3(0, (A.raise || 0) * A.lower, 0));
        b.rod(key, s0, el, A.r || 0.06, 5, { noAO: true });
        b.rod(key, el, wr, (A.r || 0.06) * 0.8, 5, { noAO: true });
        const nc = A.claws || 3;
        for (let k = 0; k < nc; k++) {
          const cl = wr
            .clone()
            .addScaledVector(fwd, A.hand || 0.2)
            .addScaledVector(side, (k - (nc - 1) / 2) * 0.05)
            .add(new THREE.Vector3(0, -(A.hand || 0.2) * 0.6, 0));
          b.rod(key, wr, cl, (A.r || 0.06) * 0.35, 4, {
            noAO: true,
            rTop: 0.004,
          });
        }
      }
    }
    // skull at the head end
    if (spec.skull) {
      const S = spec.skull,
        p = at(1),
        d = tan(1);
      const yaw = Math.atan2(d.x, d.z),
        pitch = -Math.asin(Math.max(-1, Math.min(1, d.y))) + (S.pitch || 0);
      const m = new THREE.Matrix4().compose(
        p,
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(pitch, yaw, 0, "YXZ"),
        ),
        new THREE.Vector3(1, 1, 1),
      );
      const L = S.len,
        H = S.h,
        Wd = S.w;
      // cranium + tapering snout
      b.geo(
        key,
        new THREE.CylinderGeometry(Wd * 0.28, Wd * 0.5, L, 7, 2)
          .rotateX(HP)
          .translate(0, 0, L * 0.5),
        m,
        { noAO: true, grime: 0.35 },
      );
      b.geo(
        key,
        new THREE.BoxGeometry(Wd * 0.9, H * 0.7, L * 0.45).translate(
          0,
          H * 0.1,
          L * 0.22,
        ),
        m,
        { noAO: true },
      );
      // eye sockets (dark)
      for (const sg of [-1, 1])
        b.geo(
          "iron",
          new THREE.SphereGeometry(Wd * 0.14, 6, 4).translate(
            sg * Wd * 0.42,
            H * 0.22,
            L * 0.28,
          ),
          m,
          { noAO: true },
        );
      // lower jaw
      const jm = m.clone().multiply(P.m4(0, -H * 0.3, 0, 0, S.open || 0.25));
      b.geo(
        key,
        new THREE.CylinderGeometry(Wd * 0.2, Wd * 0.38, L * 0.95, 6, 1)
          .rotateX(HP)
          .translate(0, -H * 0.15, L * 0.47),
        jm,
        { noAO: true },
      );
      // teeth
      const nT = S.teeth || 10;
      for (let k = 0; k < nT; k++) {
        const zz = L * (0.35 + (0.6 * k) / nT);
        for (const sg of [-1, 1]) {
          b.geo(
            key,
            new THREE.ConeGeometry(0.018 * L, 0.09 * L, 4)
              .rotateX(PI)
              .translate(sg * Wd * (0.36 - (0.18 * k) / nT), -0.02, zz),
            m,
            { noAO: true },
          );
          b.geo(
            key,
            new THREE.ConeGeometry(0.016 * L, 0.08 * L, 4).translate(
              sg * Wd * (0.3 - (0.14 * k) / nT),
              -H * 0.05,
              zz,
            ),
            jm,
            { noAO: true },
          );
        }
      }
      if (S.horns)
        for (const hn of S.horns)
          b.geo(
            key,
            new THREE.ConeGeometry(hn.r, hn.l, 6)
              .rotateX(hn.rx || -0.6)
              .rotateZ(hn.rz || 0)
              .translate(hn.x, hn.y, hn.z),
            m,
            { noAO: true },
          );
      if (S.frill)
        b.geo(
          key,
          new THREE.CylinderGeometry(
            S.frill,
            S.frill * 0.9,
            0.08,
            14,
            1,
            false,
            -HP * 1.2,
            PI * 1.2,
          )
            .rotateX(-0.9)
            .translate(0, H * 0.4, -L * 0.05),
          m,
          { noAO: true },
        );
    }
    // museum mount: steel rods to the floor + label
    if (spec.mount !== false) {
      for (const t of spec.mountT || [0.35, 0.65]) {
        const p = at(t);
        b.rod("iron", [p.x, floorY, p.z], [p.x, p.y, p.z], 0.035, 5, {
          noAO: true,
        });
      }
    }
    return curve;
  };

  // ---------------------------------------------------------------
  // Taxidermy / sculpture creatures (diorama animals)
  // ---------------------------------------------------------------
  /** Four-legged mount. o: {len, h, key, head:'cat'|'horse'|'antelope'|'bear', mane, horns, tail, neck (0..1 raise)} */
  D.animal = function (b, x, y, z, ry, o) {
    o = o || {};
    const L = o.len || 2,
      H = o.h || 1.2,
      k = o.key || "hide_tan";
    const M = P.m4(x, y, z, ry);
    const add = (geo, m, key) =>
      b.geo(key || k, geo, M.clone().multiply(m || new THREE.Matrix4()), {
        grime: 0.2,
        noAO: true,
      });
    const bodyR = H * 0.28;
    add(
      new THREE.SphereGeometry(1, 10, 7),
      P.m4(
        0,
        H * 0.72,
        0,
        0,
        0,
        0,
        bodyR * (o.girth || 1),
        bodyR * 1.05,
        L * 0.5,
      ),
    );
    // legs
    for (const [lx, lz] of [
      [-1, 1],
      [1, 1],
      [-1, -1],
      [1, -1],
    ]) {
      const px = lx * bodyR * 0.6,
        pz = lz * L * 0.32;
      add(
        new THREE.CylinderGeometry(
          bodyR * 0.22,
          bodyR * 0.14,
          H * 0.62,
          6,
        ).translate(0, H * 0.31, 0),
        P.m4(px, 0.02, pz, 0, o.walk ? lz * 0.15 * (lx > 0 ? 1 : -1) : 0),
      );
      add(
        new THREE.CylinderGeometry(bodyR * 0.16, bodyR * 0.18, 0.08, 6),
        P.m4(px, 0.0, pz),
        o.hoof || k,
      );
    }
    // neck + head
    const nr = o.neck === undefined ? 0.5 : o.neck;
    const neckBase = [0, H * 0.82, L * 0.42],
      headP = [0, H * (0.85 + nr * 0.45), L * (0.5 + 0.2 * (1 - nr))];
    b.rod(
      k,
      [
        x + Math.sin(ry) * neckBase[2],
        y + neckBase[1],
        z + Math.cos(ry) * neckBase[2],
      ],
      [x + Math.sin(ry) * headP[2], y + headP[1], z + Math.cos(ry) * headP[2]],
      bodyR * 0.45,
      7,
      { rTop: bodyR * 0.3, noAO: true },
    );
    const hs =
      o.head === "cat"
        ? [0.7, 0.62, 0.8]
        : o.head === "bear"
          ? [0.6, 0.6, 0.9]
          : [0.45, 0.5, 1.1];
    add(
      new THREE.SphereGeometry(bodyR * 0.6, 8, 6),
      P.m4(0, headP[1], headP[2] + bodyR * 0.3, 0, 0.2, 0, hs[0], hs[1], hs[2]),
    );
    if (o.head !== "cat" && o.head !== "bear")
      add(
        new THREE.CylinderGeometry(
          bodyR * 0.18,
          bodyR * 0.24,
          bodyR * 0.7,
          6,
        ).rotateX(HP + 0.4),
        P.m4(0, headP[1] - bodyR * 0.12, headP[2] + bodyR * 0.75),
      );
    for (const s of [-1, 1])
      add(
        new THREE.ConeGeometry(bodyR * 0.12, bodyR * 0.3, 4),
        P.m4(
          s * bodyR * 0.22,
          headP[1] + bodyR * 0.36,
          headP[2] + bodyR * 0.1,
          0,
          -0.2,
          s * 0.3,
        ),
      );
    if (o.mane)
      add(
        new THREE.SphereGeometry(bodyR * 0.95, 8, 6),
        P.m4(
          0,
          headP[1] - 0.05,
          headP[2] + bodyR * 0.05,
          0,
          0,
          0,
          1,
          1.05,
          0.85,
        ),
        o.mane,
      );
    if (o.horns)
      for (const s of [-1, 1])
        b.geo(
          "bone_dark",
          new THREE.ConeGeometry(bodyR * 0.06, bodyR * (o.hornL || 1.4), 5)
            .rotateX(-0.5)
            .rotateZ(s * 0.25)
            .translate(s * bodyR * 0.15, headP[1] + bodyR * 0.8, headP[2]),
          M,
          { noAO: true },
        );
    // tail
    if (o.tail !== false)
      add(
        new THREE.CylinderGeometry(bodyR * 0.05, bodyR * 0.08, L * 0.35, 4)
          .rotateX(0.5)
          .translate(0, H * 0.55, -L * 0.62),
      );
    // eyes (glass)
    for (const s of [-1, 1])
      b.geo(
        "glass_dark",
        new THREE.SphereGeometry(bodyR * 0.07, 5, 4).translate(
          s * bodyR * 0.26,
          headP[1] + bodyR * 0.12,
          headP[2] + bodyR * 0.55,
        ),
        M,
        { noAO: true },
      );
  };
  /** Upright ape (gorilla) mount. */
  D.ape = function (b, x, y, z, ry, s) {
    s = s || 1;
    const M = P.m4(x, y, z, ry, 0, 0, s);
    const k = "hide_dark";
    const add = (g, m) =>
      b.geo(k, g, M.clone().multiply(m), { noAO: true, grime: 0.2 });
    add(
      new THREE.SphereGeometry(0.5, 9, 7),
      P.m4(0, 1.15, 0, 0, 0.35, 0, 1.1, 1.2, 0.8),
    );
    add(
      new THREE.SphereGeometry(0.26, 8, 6),
      P.m4(0, 1.75, 0.22, 0, 0, 0, 1, 1.05, 1),
    );
    add(new THREE.BoxGeometry(0.34, 0.12, 0.1), P.m4(0, 1.82, 0.4));
    for (const sd of [-1, 1]) {
      add(
        new THREE.CylinderGeometry(0.13, 0.1, 1.05, 6),
        P.m4(sd * 0.55, 0.95, 0.2, 0, -0.35, sd * 0.25),
      );
      add(
        new THREE.CylinderGeometry(0.15, 0.12, 0.7, 6),
        P.m4(sd * 0.25, 0.35, -0.1, 0, 0.2, 0),
      );
    }
  };
  /** African elephant (Akeley group). */
  D.elephant = function (b, x, y, z, ry, s, o) {
    o = o || {};
    s = s || 1;
    const M = P.m4(x, y, z, ry, 0, 0, s);
    const k = "hide_grey";
    const add = (g, m, key) =>
      b.geo(key || k, g, M.clone().multiply(m), { noAO: true, grime: 0.25 });
    add(
      new THREE.SphereGeometry(1, 12, 9),
      P.m4(0, 2.35, 0, 0, 0, 0, 1.2, 1.25, 2.1),
    );
    for (const [lx, lz] of [
      [-1, 1],
      [1, 1],
      [-1, -1],
      [1, -1],
    ])
      add(
        new THREE.CylinderGeometry(0.36, 0.33, 2.0, 8).translate(0, 1.0, 0),
        P.m4(lx * 0.62, 0, lz * 1.25, 0, o.charge && lz > 0 ? -0.12 : 0),
      );
    // head, ears, trunk, tusks
    const hy = 2.9 + (o.raise ? 0.35 : 0);
    add(
      new THREE.SphereGeometry(0.75, 10, 8),
      P.m4(0, hy, 2.05, 0, 0.3, 0, 1, 1.05, 0.95),
    );
    for (const sd of [-1, 1])
      add(
        new THREE.SphereGeometry(0.85, 8, 6),
        P.m4(
          sd * 0.8,
          hy - 0.05,
          1.8,
          sd * (o.flare ? 0.9 : 0.4),
          0,
          sd * 0.15,
          1.05,
          1.25,
          0.12,
        ),
      );
    const trunk = [
      [0, hy - 0.2, 2.6],
      [0, hy - 0.9, 2.95],
      [0, hy - 1.6, 3.0],
      [0, hy - (o.raise ? 0.3 : 2.1), o.raise ? 3.5 : 2.85],
    ];
    if (o.raise) {
      trunk[2] = [0, hy + 0.1, 3.3];
    }
    for (const sd of [-1, 1])
      add(
        new THREE.ConeGeometry(0.08, 1.3, 6)
          .rotateX(-2.1)
          .translate(sd * 0.32, hy - 0.8, 2.75),
        new THREE.Matrix4(),
        "bone",
      );
    add(
      new THREE.CylinderGeometry(0.03, 0.06, 1.0, 4)
        .rotateX(0.3)
        .translate(0, 2.0, -2.1),
      new THREE.Matrix4(),
    );
    // trunk: rods through the group matrix
    for (let i = 0; i < trunk.length - 1; i++) {
      const a = new THREE.Vector3().fromArray(trunk[i]).applyMatrix4(M),
        c = new THREE.Vector3().fromArray(trunk[i + 1]).applyMatrix4(M);
      b.rod(k, [a.x, a.y, a.z], [c.x, c.y, c.z], (0.22 - i * 0.05) * s, 7, {
        rTop: (0.18 - i * 0.05) * s,
        noAO: true,
      });
    }
  };
  /** Blue whale (hanging model), length L along +z at local (x,y,z), yaw ry. */
  D.whale = function (b, x, y, z, ry, L) {
    const prof = [];
    const R = L * 0.075;
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const r =
        t < 0.12
          ? R * Math.sin((t / 0.12) * HP) * 0.85
          : R *
            (1 - Math.pow((t - 0.25) / 0.75, 2) * 0.88) *
            (t < 0.25 ? 0.85 + (0.15 * (t - 0.12)) / 0.13 : 1);
      prof.push([Math.max(0.02, r), t * L]);
    }
    const M = P.m4(x, y, z, ry, -HP).multiply(P.m4(0, -L / 2, 0));
    const g = new THREE.LatheGeometry(
      prof.map((p) => new THREE.Vector2(p[0], p[1])),
      16,
    );
    // flatten underside slightly
    g.scale(1, 1, 0.8);
    b.geo("whale", g, M, { noAO: true, grime: 0.15, uvScale: 3 });
    // pale throat grooves (lighter underside strip)
    const g2 = new THREE.LatheGeometry(
      prof.slice(14).map((p) => new THREE.Vector2(p[0] * 1.01, p[1])),
      16,
      PI * 0.75,
      PI * 0.5,
    );
    g2.scale(1, 1, 0.8);
    b.geo("whale_belly", g2, M, { noAO: true, grime: 0.3 });
    const W = (lx, ly, lz) =>
      new THREE.Vector3(lx, ly, lz).applyMatrix4(P.m4(x, y, z, ry));
    // flukes
    const fl = new THREE.Shape();
    fl.moveTo(0, 0);
    fl.quadraticCurveTo(L * 0.1, -L * 0.02, L * 0.14, -L * 0.07);
    fl.quadraticCurveTo(L * 0.06, -L * 0.05, 0, -L * 0.02);
    fl.quadraticCurveTo(-L * 0.06, -L * 0.05, -L * 0.14, -L * 0.07);
    fl.quadraticCurveTo(-L * 0.1, -L * 0.02, 0, 0);
    b.geo(
      "whale",
      new THREE.ExtrudeGeometry(fl, {
        depth: 0.15,
        bevelEnabled: false,
      }).rotateX(HP),
      P.m4(x, y, z, ry).multiply(P.m4(0, 0.05, -L / 2 + 0.2)),
      { noAO: true },
    );
    // flippers
    for (const s of [-1, 1])
      b.geo(
        "whale",
        new THREE.SphereGeometry(1, 8, 5),
        P.m4(x, y, z, ry).multiply(
          P.m4(
            s * R * 1.2,
            -R * 0.45,
            L * 0.22,
            s * 0.5,
            0,
            s * 0.35,
            L * 0.07,
            0.08,
            L * 0.025,
          ),
        ),
        { noAO: true },
      );
    // dorsal fin + eye
    b.geo(
      "whale",
      new THREE.ConeGeometry(0.3, 0.9, 5).rotateX(-0.9),
      P.m4(x, y, z, ry).multiply(P.m4(0, R * 0.55, -L * 0.28)),
      { noAO: true },
    );
    for (const s of [-1, 1])
      b.geo(
        "glass_dark",
        new THREE.SphereGeometry(0.12, 5, 4),
        P.m4(x, y, z, ry).multiply(P.m4(s * R * 0.62, -R * 0.12, L * 0.33)),
        { noAO: true },
      );
    void W;
  };
  /** Stylised human statue / mannequin. pose: 'stand'|'atlas'|'rider'|'pomona'|'arm'|'sit'|'dance'. */
  D.figure = function (b, key, x, y, z, ry, s, pose, o) {
    o = o || {};
    s = s || 1;
    const M = P.m4(x, y, z, ry, 0, 0, s);
    const add = (g, m, k2) =>
      b.geo(k2 || key, g, M.clone().multiply(m), {
        noAO: true,
        grime: o.grime === undefined ? 0.35 : o.grime,
      });
    const kneel = pose === "atlas",
      sit = pose === "rider" || pose === "sit";
    const hipY = kneel ? 0.55 : sit ? 0.5 : 0.95;
    // legs
    if (kneel) {
      add(
        new THREE.CylinderGeometry(0.09, 0.07, 0.5, 6).rotateX(HP),
        P.m4(-0.13, 0.12, -0.2),
      );
      add(
        new THREE.CylinderGeometry(0.1, 0.08, 0.5, 6),
        P.m4(-0.13, 0.3, 0.05, 0, 0.9),
      );
      add(
        new THREE.CylinderGeometry(0.1, 0.08, 0.5, 6),
        P.m4(0.13, 0.42, 0.18, 0, -0.4),
      );
      add(
        new THREE.CylinderGeometry(0.09, 0.07, 0.45, 6),
        P.m4(0.13, 0.22, 0.32, 0, 0.15),
      );
    } else if (sit) {
      for (const sd of [-1, 1]) {
        add(
          new THREE.CylinderGeometry(0.1, 0.08, 0.5, 6).rotateX(HP),
          P.m4(
            sd * (pose === "rider" ? 0.28 : 0.13),
            hipY,
            0.2,
            0,
            0,
            sd * (pose === "rider" ? 0.5 : 0),
          ),
        );
        add(
          new THREE.CylinderGeometry(0.08, 0.06, 0.48, 6),
          P.m4(sd * (pose === "rider" ? 0.38 : 0.13), hipY - 0.26, 0.42),
        );
      }
    } else {
      const spread = pose === "dance" ? 0.25 : 0.1;
      for (const sd of [-1, 1])
        add(
          new THREE.CylinderGeometry(0.1, 0.07, 0.95, 6).translate(0, 0.47, 0),
          P.m4(sd * 0.12, 0, 0, 0, 0, sd * spread * 0.4),
        );
    }
    // torso, head
    add(
      new THREE.CylinderGeometry(0.2, 0.16, 0.62, 8).translate(0, 0.31, 0),
      P.m4(0, hipY, kneel ? 0.05 : 0, 0, kneel ? 0.15 : 0),
    );
    add(
      new THREE.SphereGeometry(0.12, 8, 6),
      P.m4(0, hipY + 0.78, kneel ? 0.1 : 0, 0, 0, 0, 1, 1.15, 1),
    );
    if (o.hat)
      add(
        new THREE.CylinderGeometry(0.1, 0.16, 0.14, 8),
        P.m4(0, hipY + 0.9, 0),
        o.hat,
      );
    if (o.robe)
      add(
        new THREE.CylinderGeometry(0.2, 0.36, 0.95, 10, 1, true).translate(
          0,
          0.47,
          0,
        ),
        P.m4(0, 0, 0),
        o.robe === true ? key : o.robe,
      );
    // arms
    const sh = hipY + 0.58;
    if (pose === "atlas" || pose === "pomona") {
      for (const sd of [-1, 1]) {
        add(
          new THREE.CylinderGeometry(0.06, 0.05, 0.4, 6).translate(0, 0.2, 0),
          P.m4(sd * 0.24, sh, 0.05, 0, 0, -sd * 0.5),
        );
        add(
          new THREE.CylinderGeometry(0.05, 0.045, 0.38, 6).translate(
            0,
            0.19,
            0,
          ),
          P.m4(sd * 0.4, sh + 0.32, 0.05, 0, 0, -sd * 0.1),
        );
      }
    } else if (pose === "arm") {
      add(
        new THREE.CylinderGeometry(0.06, 0.05, 0.62, 6).translate(0, -0.31, 0),
        P.m4(-0.25, sh, 0),
      );
      add(
        new THREE.CylinderGeometry(0.06, 0.05, 0.62, 6).translate(0, 0.31, 0),
        P.m4(0.25, sh, 0, 0, -0.9, -0.3),
      );
    } else {
      for (const sd of [-1, 1])
        add(
          new THREE.CylinderGeometry(0.06, 0.05, 0.62, 6).translate(
            0,
            -0.31,
            0,
          ),
          P.m4(
            sd * 0.25,
            sh,
            0,
            0,
            sit ? -0.6 : 0,
            sd * (pose === "dance" ? 0.9 : 0.08),
          ),
        );
    }
  };
  /** Horse (bronze equestrian / carousel). Local +z forward. */
  D.horse = function (b, key, x, y, z, ry, s, o) {
    o = o || {};
    s = s || 1;
    const M = P.m4(x, y, z, ry, 0, 0, s);
    const add = (g, m) =>
      b.geo(key, g, M.clone().multiply(m), { noAO: true, grime: 0.4 });
    add(
      new THREE.SphereGeometry(1, 10, 8),
      P.m4(0, 1.45, 0, 0, 0, 0, 0.42, 0.48, 1.0),
    );
    const rear = o.rear ? 0.35 : 0;
    for (const [lx, lz, lift] of [
      [-1, 1, o.stride ? 0.5 : 0],
      [1, 1, 0],
      [-1, -1, 0],
      [1, -1, o.stride ? -0.25 : 0],
    ]) {
      add(
        new THREE.CylinderGeometry(0.1, 0.07, 1.05, 6).translate(0, -0.52, 0),
        P.m4(lx * 0.22, 1.2, lz * 0.7, 0, lift),
      );
      add(
        new THREE.CylinderGeometry(0.09, 0.1, 0.1, 6).translate(0, -1.05, 0),
        P.m4(lx * 0.22, 1.2, lz * 0.7, 0, lift),
      );
    }
    add(
      new THREE.CylinderGeometry(0.2, 0.3, 0.95, 8).translate(0, 0.47, 0),
      P.m4(0, 1.6, 0.75, 0, 0.75 + rear),
    );
    add(
      new THREE.CylinderGeometry(0.12, 0.2, 0.62, 8).rotateX(HP),
      P.m4(0, 2.22 + rear, 1.3, 0, 0.35),
    );
    for (const sd of [-1, 1])
      add(
        new THREE.ConeGeometry(0.05, 0.15, 4),
        P.m4(sd * 0.08, 2.45 + rear, 1.12),
      );
    add(
      new THREE.CylinderGeometry(0.04, 0.1, 0.9, 5).translate(0, -0.45, 0),
      P.m4(0, 1.6, -0.95, 0, -0.4),
    );
  };

  // ---------------------------------------------------------------
  // Furniture
  // ---------------------------------------------------------------
  D.chair = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry, 0, 0, 1),
      wk = o.wood || "wood_dark",
      fk = o.seat || "velvet";
    const add = (k, g, m) =>
      b.geo(k, g, M.clone().multiply(m || new THREE.Matrix4()), {
        noAO: true,
        grime: 0.3,
      });
    if (o.toppled) {
      M.multiply(P.m4(0, 0.22, 0, 0, HP * 0.95));
    }
    for (const [lx, lz] of [
      [-0.2, -0.2],
      [0.2, -0.2],
      [-0.2, 0.2],
      [0.2, 0.2],
    ])
      add(wk, new THREE.BoxGeometry(0.04, 0.45, 0.04).translate(lx, 0.225, lz));
    add(fk, new THREE.BoxGeometry(0.46, 0.07, 0.46).translate(0, 0.48, 0));
    add(wk, new THREE.BoxGeometry(0.44, 0.5, 0.04).translate(0, 0.78, -0.21));
    if (o.arms)
      for (const s of [-1, 1])
        add(
          wk,
          new THREE.BoxGeometry(0.05, 0.05, 0.42).translate(s * 0.23, 0.68, 0),
        );
  };
  /** Round café / dining table. */
  D.table = function (b, x, y, z, o) {
    o = o || {};
    const r = o.r || 0.45,
      h = o.h || 0.75,
      tk = o.top || "marble",
      lk = o.leg || "iron";
    if (o.rect) {
      b.box(
        tk,
        x - o.rect[0] / 2,
        y + h - 0.05,
        z - o.rect[1] / 2,
        x + o.rect[0] / 2,
        y + h,
        z + o.rect[1] / 2,
        { seg: false, noAO: true },
      );
      for (const [lx, lz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        b.box(
          lk,
          x + lx * (o.rect[0] / 2 - 0.08) - 0.03,
          y,
          z + lz * (o.rect[1] / 2 - 0.08) - 0.03,
          x + lx * (o.rect[0] / 2 - 0.08) + 0.03,
          y + h - 0.05,
          z + lz * (o.rect[1] / 2 - 0.08) + 0.03,
          { seg: false },
        );
      if (o.cloth)
        b.box(
          o.cloth,
          x - o.rect[0] / 2 - 0.05,
          y + h - 0.35,
          z - o.rect[1] / 2 - 0.05,
          x + o.rect[0] / 2 + 0.05,
          y + h + 0.01,
          z + o.rect[1] / 2 + 0.05,
          { seg: false, noAO: true },
        );
    } else {
      b.cyl(tk, x, y + h - 0.04, z, r, r, 0.04, 16, { noAO: true });
      b.cyl(lk, x, y, z, 0.03, 0.05, h - 0.04, 6);
      b.cyl(lk, x, y, z, 0.25, 0.28, 0.03, 10);
      if (o.cloth)
        b.cyl(o.cloth, x, y + h - 0.3, z, r + 0.04, r + 0.12, 0.32, 16, {
          open: true,
          noAO: true,
        });
    }
  };
  /** Theatre seat row along ±x starting at (x0,z) facing -z (toward the stage) unless ry given. */
  D.seatRow = function (b, x0, x1, y, z, ry, o) {
    o = o || {};
    const n = Math.floor(Math.abs(x1 - x0) / 0.56);
    const r = P.rng(x0 * 3.1 + z * 7.7 + y);
    for (let i = 0; i < n; i++) {
      const x = Math.min(x0, x1) + 0.28 + i * 0.56;
      if (r() < (o.missing || 0.08)) continue;
      const tip = r() < 0.12 ? 0.6 : 0;
      const M = P.m4(x, y, z, ry || 0);
      b.geo(
        "iron",
        new THREE.BoxGeometry(0.05, 0.62, 0.5).translate(-0.27, 0.31, 0),
        M,
        { noAO: true },
      );
      b.geo(
        o.seat || "velvet",
        new THREE.BoxGeometry(0.46, 0.1, 0.44)
          .rotateX(tip)
          .translate(0, 0.44, 0.02),
        M,
        { noAO: true, grime: 0.35 },
      );
      b.geo(
        o.seat || "velvet",
        new THREE.BoxGeometry(0.48, 0.55, 0.08)
          .rotateX(-0.12)
          .translate(0, 0.72, -0.22),
        M,
        { noAO: true, grime: 0.35 },
      );
      b.geo(
        "wood_dark",
        new THREE.BoxGeometry(0.05, 0.05, 0.4).translate(0.27, 0.64, -0.02),
        M,
        { noAO: true },
      );
    }
  };
  D.sofa = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      fk = o.fabric || "velvet",
      w = o.w || 1.9;
    b.geo(fk, new THREE.BoxGeometry(w, 0.42, 0.8).translate(0, 0.26, 0), M, {
      noAO: true,
      grime: 0.35,
    });
    b.geo(
      fk,
      new THREE.BoxGeometry(w, 0.55, 0.2)
        .translate(0, 0.66, -0.32)
        .rotateX(-0.1),
      M,
      { noAO: true, grime: 0.35 },
    );
    for (const s of [-1, 1])
      b.geo(
        fk,
        new THREE.BoxGeometry(0.18, 0.28, 0.8).translate(
          s * (w / 2 - 0.09),
          0.58,
          0,
        ),
        M,
        { noAO: true },
      );
    for (const s of [-1, 1])
      for (const t of [-1, 1])
        b.geo(
          "wood_dark",
          new THREE.BoxGeometry(0.06, 0.08, 0.06).translate(
            s * (w / 2 - 0.08),
            0.02,
            t * 0.34,
          ),
          M,
          { noAO: true },
        );
  };
  /** Bed (single/double, optional four-poster). */
  D.bed = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      w = o.w || 1.5,
      L = 2.05,
      wk = o.wood || "wood_dark";
    b.geo(wk, new THREE.BoxGeometry(w, 0.3, L).translate(0, 0.25, 0), M, {
      noAO: true,
    });
    b.geo(
      o.sheet || "fabric_white",
      new THREE.BoxGeometry(w - 0.08, 0.18, L - 0.1).translate(0, 0.49, 0.02),
      M,
      { noAO: true, grime: 0.55 },
    );
    b.geo(
      o.cover || "velvet",
      new THREE.BoxGeometry(w - 0.02, 0.06, L * 0.6)
        .translate(0, 0.6, 0.35)
        .rotateX(0.02),
      M,
      { noAO: true, grime: 0.4 },
    );
    for (const s of [-1, 1])
      b.geo(
        "fabric_white",
        new THREE.BoxGeometry(w * 0.4, 0.12, 0.35).translate(
          s * w * 0.22,
          0.64,
          -L / 2 + 0.3,
        ),
        M,
        { noAO: true, grime: 0.5 },
      );
    b.geo(
      wk,
      new THREE.BoxGeometry(w + 0.1, 1.0, 0.08).translate(0, 0.6, -L / 2),
      M,
      { noAO: true },
    );
    b.geo(
      wk,
      new THREE.BoxGeometry(w + 0.1, 0.6, 0.08).translate(0, 0.4, L / 2),
      M,
      { noAO: true },
    );
    if (o.posts)
      for (const s of [-1, 1])
        for (const t of [-1, 1]) {
          b.geo(
            wk,
            new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6).translate(
              s * (w / 2 + 0.02),
              1.1,
              (t * L) / 2,
            ),
            M,
            { noAO: true },
          );
          if (o.canopy)
            b.geo(
              o.canopy,
              new THREE.BoxGeometry(w + 0.2, 0.3, L + 0.1).translate(0, 2.1, 0),
              M,
              { noAO: true },
            );
        }
  };
  /** Grand piano (lid propped). */
  D.piano = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      k = o.key || "paint_black";
    const sh = new THREE.Shape();
    sh.moveTo(-0.72, 0);
    sh.lineTo(0.72, 0);
    sh.lineTo(0.72, 0.6);
    sh.bezierCurveTo(0.72, 1.4, 0.2, 1.3, 0.05, 1.9);
    sh.lineTo(-0.72, 2.0);
    sh.closePath();
    const body = new THREE.ExtrudeGeometry(sh, {
      depth: 0.32,
      bevelEnabled: false,
      curveSegments: 8,
    })
      .rotateX(HP)
      .translate(0, 1.0, 0);
    b.geo(k, body, M, { noAO: true, grime: 0.25 });
    // lid (propped open)
    const lid = new THREE.ExtrudeGeometry(sh, {
      depth: 0.03,
      bevelEnabled: false,
      curveSegments: 8,
    }).rotateX(HP);
    b.geo(
      k,
      lid,
      M.clone()
        .multiply(P.m4(0.72, 1.0, 0, 0, 0, o.lidOpen === false ? 0 : 0.55))
        .multiply(P.m4(-0.72, 0, 0)),
      { noAO: true },
    );
    b.geo(
      "iron",
      new THREE.BoxGeometry(0.02, 0.9, 0.02)
        .translate(0.6, 1.4, 1.1)
        .rotateZ(0.1),
      M,
      { noAO: true },
    );
    for (const [lx, lz] of [
      [-0.6, 0.12],
      [0.6, 0.12],
      [-0.3, 1.7],
    ])
      b.geo(
        k,
        new THREE.CylinderGeometry(0.06, 0.05, 0.68, 6).translate(lx, 0.34, lz),
        M,
        { noAO: true },
      );
    // keyboard
    b.geo(
      "paint_white",
      new THREE.BoxGeometry(1.3, 0.04, 0.16).translate(0, 0.72, -0.08),
      M,
      { noAO: true },
    );
    for (let i = 0; i < 18; i++)
      b.geo(
        "paint_black",
        new THREE.BoxGeometry(0.03, 0.02, 0.09).translate(
          -0.6 + i * 0.07,
          0.75,
          -0.04,
        ),
        M,
        { noAO: true },
      );
    b.geo(
      k,
      new THREE.BoxGeometry(1.44, 0.1, 0.3).translate(0, 0.66, -0.05),
      M,
      { noAO: true },
    );
    if (o.bench !== false) {
      b.geo(
        k,
        new THREE.BoxGeometry(0.8, 0.08, 0.36).translate(0, 0.5, -0.65),
        M,
        { noAO: true },
      );
      for (const s of [-1, 1])
        b.geo(
          k,
          new THREE.BoxGeometry(0.05, 0.5, 0.3).translate(
            s * 0.35,
            0.25,
            -0.65,
          ),
          M,
          { noAO: true },
        );
    }
  };
  /** Organ pipe rank on a wall: centred at x, back at z, facing +z. */
  D.organ = function (b, x, y, z, w, h, ry) {
    const M = P.m4(x, y, z, ry || 0);
    const n = Math.floor(w / 0.32);
    for (let i = 0; i < n; i++) {
      const u = -w / 2 + ((i + 0.5) * w) / n,
        t = Math.abs(u) / (w / 2);
      const L =
        h * (0.45 + 0.55 * (1 - t * t)) * (0.9 + 0.1 * Math.sin(i * 1.7));
      const r = 0.1 + 0.05 * (1 - t);
      b.geo(
        "gold",
        new THREE.CylinderGeometry(r, r, L, 8).translate(u, 0.6 + L / 2, 0.35),
        M,
        { noAO: true, grime: 0.45 },
      );
      b.geo(
        "gold",
        new THREE.ConeGeometry(r, 0.4, 8).rotateX(PI).translate(u, 0.4, 0.35),
        M,
        { noAO: true },
      );
      b.geo(
        "iron",
        new THREE.BoxGeometry(r * 1.2, 0.08, 0.02).translate(u, 0.95, 0.35 + r),
        M,
        { noAO: true },
      );
    }
    b.geo(
      "wood_dark",
      new THREE.BoxGeometry(w + 0.6, 0.6, 0.7).translate(0, 0.3, 0.3),
      M,
      { noAO: true },
    );
    b.geo(
      "wood_dark",
      new THREE.BoxGeometry(w + 0.6, 0.25, 0.5).translate(0, h + 0.8, 0.25),
      M,
      { noAO: true },
    );
  };
  /** Chandelier: tiers of crystal rings + arms + candle bulbs; adds a baked light + glow via S. */
  D.chandelier = function (S, x, y, z, r, o) {
    o = o || {};
    const b = S.b,
      tiers = o.tiers || 3;
    b.rod("iron", [x, y, z], [x, y + (o.chain || 2), z], 0.025, 4, {
      noAO: true,
    });
    for (let t = 0; t < tiers; t++) {
      const rr = r * (1 - t * 0.28),
        yy = y - t * 0.45;
      b.torus("gold", x, yy, z, rr, 0.03, TAU, {
        rx: HP,
        ts: 20,
        rs: 4,
        noAO: true,
      });
      const n = Math.max(6, Math.round(rr * 10));
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU,
          px = x + Math.cos(a) * rr,
          pz = z + Math.sin(a) * rr;
        if (!o.broken || k % 3)
          b.box(
            "crystal",
            px - 0.015,
            yy - 0.28,
            pz - 0.015,
            px + 0.015,
            yy - 0.02,
            pz + 0.015,
            { seg: false, noAO: true, noBake: true },
          );
        if (k % 2 === 0) {
          b.cyl(
            o.dark ? "glass_dark" : "candle",
            px,
            yy,
            pz,
            0.025,
            0.03,
            0.12,
            5,
            { noAO: true },
          );
        }
      }
      b.rod("gold", [x, yy, z], [x, yy + 0.45, z], 0.03, 5, { noAO: true });
    }
    b.sphere("crystal", x, y - tiers * 0.45, z, 0.12, {
      ws: 8,
      hs: 6,
      noAO: true,
    });
    if (!o.dark) {
      S.light(x, y - 0.4, z, o.color || 0xffd89a, o.lr || r * 9, o.li || 1.0);
      S.glow(x, y - 0.4, z, o.color || 0xffd89a, o.glow || r * 1.4);
    }
  };
  /** Bookcase full of books (against a wall, facing ry). */
  D.bookcase = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      w = o.w || 1.6,
      h = o.h || 2.2,
      wk = o.wood || "wood_dark";
    const r = P.rng(x * 11 + z * 3);
    b.geo(wk, new THREE.BoxGeometry(w, h, 0.05).translate(0, h / 2, -0.18), M, {
      noAO: true,
    });
    for (const s of [-1, 1])
      b.geo(
        wk,
        new THREE.BoxGeometry(0.05, h, 0.4).translate((s * w) / 2, h / 2, 0),
        M,
        { noAO: true },
      );
    const shelves = o.shelves || 5;
    for (let i = 0; i <= shelves; i++) {
      const sy = 0.05 + (i * (h - 0.1)) / shelves;
      b.geo(wk, new THREE.BoxGeometry(w, 0.04, 0.4).translate(0, sy, 0), M, {
        noAO: true,
      });
      if (i === shelves) break;
      let u = -w / 2 + 0.05;
      while (u < w / 2 - 0.1) {
        const bw = 0.03 + r() * 0.05,
          bh = 0.2 + r() * 0.14;
        if (r() < (o.empty || 0.15)) {
          u += 0.12;
          continue;
        }
        const lean = r() < 0.1 ? 0.3 : 0;
        const keys = [
          "leather",
          "paint_red",
          "paint_green",
          "paint_blue",
          "fabric",
          "paper",
        ];
        b.geo(
          keys[Math.floor(r() * keys.length)],
          new THREE.BoxGeometry(bw, bh, 0.25)
            .translate(0, bh / 2, 0)
            .rotateZ(lean),
          M.clone().multiply(P.m4(u + bw / 2, sy + 0.02, 0.02)),
          { noAO: true, grime: 0.4 },
        );
        u += bw + 0.005;
      }
    }
  };
  D.crib = function (b, x, y, z, ry) {
    const M = P.m4(x, y, z, ry);
    b.geo(
      "paint_white",
      new THREE.BoxGeometry(0.7, 0.08, 1.25).translate(0, 0.45, 0),
      M,
      { noAO: true, grime: 0.6 },
    );
    b.geo(
      "fabric_pink",
      new THREE.BoxGeometry(0.62, 0.1, 1.15).translate(0, 0.52, 0),
      M,
      { noAO: true, grime: 0.6 },
    );
    for (const s of [-1, 1]) {
      b.geo(
        "paint_white",
        new THREE.BoxGeometry(0.72, 0.05, 0.05).translate(0, 1.0, s * 0.62),
        M,
        { noAO: true },
      );
      b.geo(
        "paint_white",
        new THREE.BoxGeometry(0.05, 0.05, 1.28).translate(s * 0.35, 1.0, 0),
        M,
        { noAO: true },
      );
      for (let i = 0; i < 9; i++)
        b.geo(
          "paint_white",
          new THREE.CylinderGeometry(0.012, 0.012, 0.55, 4).translate(
            s * 0.35,
            0.72,
            -0.55 + i * 0.137,
          ),
          M,
          { noAO: true },
        );
      for (let i = 0; i < 4; i++)
        b.geo(
          "paint_white",
          new THREE.CylinderGeometry(0.012, 0.012, 0.55, 4).translate(
            -0.24 + i * 0.16,
            0.72,
            s * 0.62,
          ),
          M,
          { noAO: true },
        );
      for (const t of [-1, 1])
        b.geo(
          "paint_white",
          new THREE.BoxGeometry(0.05, 1.0, 0.05).translate(
            s * 0.35,
            0.5,
            t * 0.62,
          ),
          M,
          { noAO: true },
        );
    }
    // mobile
    b.geo(
      "iron",
      new THREE.CylinderGeometry(0.008, 0.008, 0.6, 3).translate(0.35, 1.3, 0),
      M,
      { noAO: true },
    );
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU;
      b.geo(
        ["paint_blue", "paint_red", "gold", "paint_green"][i],
        new THREE.OctahedronGeometry(0.05).translate(
          0.15 + Math.cos(a) * 0.18,
          1.35,
          Math.sin(a) * 0.18,
        ),
        M,
        { noAO: true },
      );
    }
  };
  D.rockingChair = function (b, x, y, z, ry) {
    const M = P.m4(x, y, z, ry);
    for (const s of [-1, 1]) {
      b.geo(
        "wood_dark",
        new THREE.TorusGeometry(0.9, 0.025, 4, 12, 0.9)
          .rotateY(HP)
          .rotateX(PI + 0.45)
          .translate(s * 0.24, 0.92, 0.05),
        M,
        { noAO: true },
      );
      b.geo(
        "wood_dark",
        new THREE.BoxGeometry(0.04, 1.05, 0.04)
          .translate(s * 0.24, 0.62, -0.28)
          .rotateX(-0.12),
        M,
        { noAO: true },
      );
      b.geo(
        "wood_dark",
        new THREE.BoxGeometry(0.04, 0.4, 0.04).translate(s * 0.24, 0.26, 0.2),
        M,
        { noAO: true },
      );
    }
    b.geo(
      "wood_dark",
      new THREE.BoxGeometry(0.5, 0.05, 0.5).translate(0, 0.46, 0),
      M,
      { noAO: true },
    );
    for (let i = 0; i < 5; i++)
      b.geo(
        "wood_dark",
        new THREE.BoxGeometry(0.02, 0.6, 0.02)
          .translate(-0.18 + i * 0.09, 0.85, -0.3)
          .rotateX(-0.12),
        M,
        { noAO: true },
      );
    b.geo(
      "wood_dark",
      new THREE.BoxGeometry(0.52, 0.06, 0.05).translate(0, 1.15, -0.34),
      M,
      { noAO: true },
    );
  };
  D.tub = function (b, x, y, z, ry) {
    const M = P.m4(x, y, z, ry);
    const g = new THREE.CylinderGeometry(0.38, 0.32, 0.55, 12, 1, true)
      .scale(1, 1, 2.1)
      .translate(0, 0.42, 0);
    b.geo("paint_white", g, M, { noAO: true, grime: 0.7 });
    b.geo(
      "paint_white",
      new THREE.CylinderGeometry(0.32, 0.32, 0.04, 12)
        .scale(1, 1, 2.1)
        .translate(0, 0.16, 0),
      M,
      { noAO: true, grime: 0.8 },
    );
    for (const [lx, lz] of [
      [-0.25, -0.6],
      [0.25, -0.6],
      [-0.25, 0.6],
      [0.25, 0.6],
    ])
      b.geo(
        "gold",
        new THREE.SphereGeometry(0.06, 5, 4).translate(lx, 0.1, lz),
        M,
        { noAO: true },
      );
  };
  /** Jewellery / museum display case: base cabinet + steel-framed glass top (optionally smashed). */
  D.case = function (b, x, y, z, w, d, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry);
    b.geo(
      o.base || "wood_dark",
      new THREE.BoxGeometry(w, 0.9, d).translate(0, 0.45, 0),
      M,
      { noAO: true, grime: 0.3 },
    );
    b.geo(
      o.velvet || "velvet",
      new THREE.BoxGeometry(w - 0.08, 0.02, d - 0.08).translate(0, 0.91, 0),
      M,
      { noAO: true },
    );
    const fk = o.frame || "chrome";
    for (const s of [-1, 1])
      for (const t of [-1, 1])
        b.geo(
          fk,
          new THREE.BoxGeometry(0.03, 0.4, 0.03).translate(
            s * (w / 2 - 0.015),
            1.1,
            t * (d / 2 - 0.015),
          ),
          M,
          { noAO: true },
        );
    for (const t of [-1, 1])
      b.geo(
        fk,
        new THREE.BoxGeometry(w, 0.03, 0.03).translate(
          0,
          1.3,
          t * (d / 2 - 0.015),
        ),
        M,
        { noAO: true },
      );
    for (const s of [-1, 1])
      b.geo(
        fk,
        new THREE.BoxGeometry(0.03, 0.03, d).translate(
          s * (w / 2 - 0.015),
          1.3,
          0,
        ),
        M,
        { noAO: true },
      );
    if (!o.smashed)
      b.geo(
        "glass",
        new THREE.BoxGeometry(w - 0.04, 0.38, d - 0.04).translate(0, 1.1, 0),
        M,
        { noAO: true, grime: 0.2 },
      );
    else {
      const r = P.rng(x * 5 + z * 9);
      for (let i = 0; i < 6; i++)
        b.geo(
          "glass",
          new THREE.BufferGeometry()
            .setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0.1 + r() * 0.2, 0, r() * 0.1),
              new THREE.Vector3(r() * 0.1, 0, 0.1 + r() * 0.2),
            ])
            .translate(
              (r() - 0.5) * w * 1.6,
              0.012 - y + (y || 0),
              (r() - 0.5) * d * 2.4,
            ),
          M,
          { noAO: true },
        );
    }
    if (o.goods) {
      const r = P.rng(x * 3 + z * 13);
      for (let i = 0; i < o.goods; i++)
        b.geo(
          r() < 0.5 ? "gold" : "chrome",
          new THREE.TorusGeometry(0.03, 0.008, 4, 8)
            .rotateX(HP)
            .translate((r() - 0.5) * (w - 0.3), 0.93, (r() - 0.5) * (d - 0.2)),
          M,
          { noAO: true },
        );
    }
  };
  /** Planter with a dead palm. */
  D.palm = function (b, x, y, z, h, o) {
    o = o || {};
    const r = P.rng(x * 7 + z * 11);
    b.lathe(
      o.pot || "terracotta",
      [
        [0.001, 0],
        [0.4, 0],
        [0.48, 0.1],
        [0.55, 0.7],
        [0.6, 0.78],
        [0.001, 0.72],
      ],
      10,
      x,
      y,
      z,
    );
    b.cyl("dirt", x, y + 0.68, z, 0.5, 0.5, 0.06, 10, { noAO: true });
    let px = x,
      pz = z,
      py = y + 0.72;
    const lean = (r() - 0.5) * 0.5,
      la = r() * TAU;
    const top = [
      x + Math.cos(la) * lean * h * 0.4,
      y + 0.72 + h,
      z + Math.sin(la) * lean * h * 0.4,
    ];
    b.rod("wood_rotten", [px, py, pz], top, 0.09, 6, {
      rTop: 0.07,
      noAO: true,
    });
    const n = o.fronds || 11;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + r() * 0.4,
        up = i < 3 ? 0.35 : 0,
        L = h * (0.4 + r() * 0.25),
        dead = r() < 0.55;
      const pts = [];
      for (let k = 0; k <= 4; k++) {
        const t = k / 4;
        pts.push([
          top[0] + Math.cos(a) * L * t,
          top[1] + (up + 0.35) * L * t - (0.9 + r() * 0.3) * L * t * t,
          top[2] + Math.sin(a) * L * t,
        ]);
      }
      for (let k = 0; k < 4; k++) {
        b.rod(
          dead ? "wood_rotten" : o.frond || "grass",
          pts[k],
          pts[k + 1],
          0.012,
          3,
          { noAO: true },
        );
        // leaflets: a flat blade either side of the rib
        const mx = (pts[k][0] + pts[k + 1][0]) / 2,
          my = (pts[k][1] + pts[k + 1][1]) / 2,
          mz = (pts[k][2] + pts[k + 1][2]) / 2,
          w2 = 0.16 * (1 - k / 5);
        b.box(
          dead ? "wood_rotten" : o.frond || "grass",
          mx - w2,
          my - 0.01,
          mz - 0.03,
          mx + w2,
          my + 0.01,
          mz + 0.03,
          { ry: -a + HP, rz: k % 2 ? 0.4 : -0.4, seg: false, noAO: true },
        );
      }
    }
    void px;
    void py;
    void pz;
  };
  D.rug = function (b, x0, z0, x1, z1, y, key) {
    b.box(key || "carpet_red", x0, y, z0, x1, y + 0.015, z1, {
      seg: false,
      noAO: true,
      grime: 0.5,
    });
  };
  /** Fireplace against a wall (back at z, facing ry). */
  D.fireplace = function (b, S, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      k = o.key || "marble";
    b.geo(
      k,
      new THREE.BoxGeometry(0.3, 1.2, 0.3).translate(-0.75, 0.6, 0.15),
      M,
      { noAO: true },
    );
    b.geo(
      k,
      new THREE.BoxGeometry(0.3, 1.2, 0.3).translate(0.75, 0.6, 0.15),
      M,
      { noAO: true },
    );
    b.geo(
      k,
      new THREE.BoxGeometry(2.0, 0.2, 0.42).translate(0, 1.25, 0.18),
      M,
      { noAO: true },
    );
    b.geo(
      "concrete_dark",
      new THREE.BoxGeometry(1.2, 1.0, 0.1).translate(0, 0.5, 0.02),
      M,
      { noAO: true, grime: 0.9 },
    );
    b.geo(
      "iron",
      new THREE.BoxGeometry(1.0, 0.05, 0.4).translate(0, 0.1, 0.2),
      M,
      { noAO: true },
    );
    if (o.lit && S) {
      const p = new THREE.Vector3(0, 0.35, 0.25).applyMatrix4(M);
      b.geo(
        "fire",
        new THREE.ConeGeometry(0.2, 0.4, 5).translate(0, 0.35, 0.22),
        M,
        { noAO: true },
      );
      S.light(p.x, p.y + 0.3, p.z, 0xff9a40, 7, 1.1);
      S.glow(p.x, p.y, p.z, 0xff8a30, 1.1);
    }
  };
  /** Bar counter along x from x0..x1 at z (front face +z), with a back shelf of bottles at zb. */
  D.bar = function (b, x0, x1, y, z, zb, o) {
    o = o || {};
    const wk = o.wood || "wood_oak",
      r = P.rng(x0 + z * 13);
    b.box(wk, x0, y, z - 0.6, x1, y + 1.05, z, { segLen: 2 });
    b.box(
      o.top || "marble_dark",
      x0 - 0.05,
      y + 1.05,
      z - 0.65,
      x1 + 0.05,
      y + 1.12,
      z + 0.05,
      { seg: false, noAO: true },
    );
    b.box("gold", x0, y + 0.12, z + 0.02, x1, y + 0.16, z + 0.08, {
      seg: false,
      noAO: true,
    });
    if (zb !== undefined) {
      for (let s = 0; s < 3; s++) {
        const sy = y + 1.2 + s * 0.45;
        b.box(wk, x0, sy, zb, x1, sy + 0.04, zb + 0.3 * Math.sign(z - zb), {
          seg: false,
          noAO: true,
        });
        for (let u = x0 + 0.12; u < x1 - 0.1; u += 0.14 + r() * 0.1) {
          if (r() < 0.3) continue;
          const bz = zb + 0.15 * Math.sign(z - zb),
            hh = 0.2 + r() * 0.12;
          b.cyl(
            r() < 0.5 ? "glass_dark" : "glass",
            u,
            sy + 0.04,
            bz,
            0.035,
            0.04,
            hh,
            6,
            { noAO: true },
          );
          b.cyl("glass_dark", u, sy + 0.04 + hh, bz, 0.012, 0.02, 0.07, 4, {
            noAO: true,
          });
        }
      }
      b.box(
        "glass",
        x0 + 0.2,
        y + 2.6,
        zb + 0.01,
        x1 - 0.2,
        y + 3.3,
        zb + 0.03,
        { seg: false, noAO: true },
      );
    }
  };
  /** Rubble heap (visual + optional collider mound). */
  D.rubble = function (S, x, y, z, r, o) {
    o = o || {};
    const rn = P.rng(x * 17.3 + z * 5.1 + y);
    const n = o.n || Math.round(r * 5);
    for (let i = 0; i < n; i++) {
      const a = rn() * TAU,
        d = rn() * r * 0.8,
        s = (0.2 + rn() * 0.5) * (1 - (d / r) * 0.5) * (o.scale || 1);
      S.b.rock(
        o.key || "rubble",
        x + Math.cos(a) * d,
        y + s * 0.3,
        z + Math.sin(a) * d,
        s,
        { flat: 0.6, seed: i * 3.7 + x },
      );
    }
    if (o.slab)
      S.b.box(
        o.slabKey || "concrete",
        x - r * 0.4,
        y,
        z - r * 0.25,
        x + r * 0.5,
        y + 0.25,
        z + r * 0.3,
        { ry: rn() * 3, rz: 0.2, seg: false },
      );
    if (o.rebar)
      for (let i = 0; i < 4; i++)
        S.b.rod(
          "rust",
          [x + (rn() - 0.5) * r, y + 0.2, z + (rn() - 0.5) * r],
          [
            x + (rn() - 0.5) * r * 1.5,
            y + 0.6 + rn() * 1.2,
            z + (rn() - 0.5) * r * 1.5,
          ],
          0.015,
          3,
          { noAO: true },
        );
    if (o.col)
      S.col(
        x - r * 0.5,
        y,
        z - r * 0.5,
        x + r * 0.5,
        y + (o.colH || 0.4),
        z + r * 0.5,
        { surface: "rubble" },
      );
  };
  /** Paper / debris drift on a floor. */
  D.papers = function (b, x, y, z, r, n) {
    const rn = P.rng(x * 3.3 + z * 1.7);
    for (let i = 0; i < (n || 12); i++) {
      const a = rn() * TAU,
        d = Math.sqrt(rn()) * r;
      b.box(
        "paper",
        x + Math.cos(a) * d - 0.12,
        y + 0.005 + rn() * 0.01,
        z + Math.sin(a) * d - 0.16,
        x + Math.cos(a) * d + 0.12,
        y + 0.01 + rn() * 0.01,
        z + Math.sin(a) * d + 0.16,
        { ry: rn() * 3, seg: false, noAO: true, grime: 0.6 },
      );
    }
  };
  D.shards = function (b, x, y, z, r, n) {
    const rn = P.rng(x * 9.1 + z * 4.3);
    for (let i = 0; i < (n || 10); i++) {
      const a = rn() * TAU,
        d = Math.sqrt(rn()) * r,
        s = 0.05 + rn() * 0.14;
      const g = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(s, 0, s * 0.3),
        new THREE.Vector3(s * 0.2, 0, s),
      ]);
      g.setIndex([0, 2, 1]);
      g.computeVertexNormals();
      b.geo(
        "glass",
        g,
        P.m4(x + Math.cos(a) * d, y + 0.01, z + Math.sin(a) * d, rn() * TAU),
        { noAO: true },
      );
    }
  };
  /** Wall lamp / sconce (visual + baked light + glow). */
  D.sconce = function (S, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry);
    S.b.geo(
      "gold",
      new THREE.BoxGeometry(0.12, 0.25, 0.04).translate(0, 0, 0.02),
      M,
      { noAO: true },
    );
    S.b.geo(
      "gold",
      new THREE.CylinderGeometry(0.015, 0.015, 0.2, 4)
        .rotateX(HP)
        .translate(0, 0, 0.12),
      M,
      { noAO: true },
    );
    S.b.geo(
      o.dark ? "glass_dark" : "lamp_dim",
      new THREE.CylinderGeometry(0.06, 0.1, 0.16, 8, 1, true).translate(
        0,
        0.08,
        0.22,
      ),
      M,
      { noAO: true },
    );
    if (!o.dark) {
      const p = new THREE.Vector3(0, 0.1, 0.25).applyMatrix4(M);
      S.light(p.x, p.y, p.z, o.color || 0xffc880, o.r || 5, o.i || 0.7);
      if (o.glow !== false)
        S.glow(p.x, p.y, p.z, o.color || 0xffc880, o.size || 0.45);
    }
  };
  /** Candles cluster (light + glow). */
  D.candles = function (S, x, y, z, n, o) {
    o = o || {};
    const rn = P.rng(x * 5 + z * 7);
    for (let i = 0; i < (n || 3); i++) {
      const px = x + (rn() - 0.5) * 0.3,
        pz = z + (rn() - 0.5) * 0.3,
        h = 0.08 + rn() * 0.14;
      S.b.cyl("paint_cream", px, y, pz, 0.025, 0.028, h, 6, { noAO: true });
      S.b.cyl("candle", px, y + h, pz, 0.006, 0.014, 0.05, 4, { noAO: true });
    }
    S.light(x, y + 0.3, z, 0xffb060, o.r || 4.5, o.i || 0.8);
    S.glow(x, y + 0.2, z, 0xffa850, o.size || 0.5);
  };
  /** Wall-mounted exhibit / info label (brass plaque) facing ry. */
  D.label = function (b, key, lines, x, y, z, w, h, ry, style) {
    const k = P.texMat(
      "lbl_" + key,
      P.signTex(
        "lbl_" + key,
        lines,
        style || "label",
        512,
        Math.round((512 * h) / w),
      ),
      { rough: 0.7 },
    );
    b.quad(k, x, y, z, w, h, { ry });
  };
})();
