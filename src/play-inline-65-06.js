// play-inline-65 06 — math
// Lines 1261-1616 of readable/play-inline-65.pretty.js (statement-aligned).
  function explodeNuke(p, R) {
    const S = Math.max(10, R);
    const gy = A.groundAt(p.x, p.z, p.y + 1);
    const g = new THREE.Vector3(p.x, gy, p.z);
    const H = S * 4.2; // final cap height
    // blinding flash
    FX.flash(p, 0xfff0d0, 14, 2.6, { range: S * 30, curve: "hold" });
    if (G.atmos.screenFlash) {
      const d = A.camDist(p);
      G.atmos.screenFlash(clamp(1.1 - d / (S * 40), 0.25, 0.95), 0xfff6e8, 1.4);
    }
    if (A.weather)
      A.weather.flashes.push({ t0: A.animTime, amp: 1.5, decay: 1.4 });
    A.psAdd.spawn({
      pos: p,
      size: S * 9,
      size1: S * 14,
      life: 0.7,
      color: 0xfff0d0,
      intensity: 5,
      frame: FR.GLOW,
      fadeIn: 0.01,
      fadeOut: 0.1,
    });
    A.psAdd.spawn({
      pos: p,
      size: S * 5,
      life: 0.25,
      color: 0xffffff,
      intensity: 8,
      frame: FR.STAR,
      fadeIn: 0.01,
    });
    // the rising fireball that becomes the cap: dense, noise-displaced, billowing
    const capMat = makeCloudMat("fire", 0x7c6c5c);
    const cu = capMat.uniforms;
    cu.uAmp.value = 0.55;
    cu.uFreq.value = 2.3;
    cu.uHotRange.value = S * 1.3;
    cu.uEdge.value = 1;
    cu.uUnder.value = 1.1;
    cu.uRimDark.value = 1;
    const cap = new THREE.Group();
    cap.name = "atmos_nuke_cap";
    const ball = new THREE.Mesh(geoBallXL, capMat);
    cap.add(ball);
    // the rolling toroidal vortex under the cap (own material: lumpier, hotter underside)
    const torMat = makeCloudMat("fire", 0x6e6052);
    const tu = torMat.uniforms;
    tu.uAmp.value = 0.5;
    tu.uFreq.value = 3.1;
    tu.uHotRange.value = S * 0.9;
    tu.uEdge.value = 1;
    tu.uUnder.value = 1.5;
    tu.uRimDark.value = 0.8;
    const torus = new THREE.Mesh(geoTorus, torMat);
    torus.visible = false;
    cap.add(torus);
    cap.position.copy(p);
    cap.renderOrder = 24;
    cap.traverse((o) => {
      o.renderOrder = 24;
      o.frustumCulled = false;
    });
    // stem: thicker column with rising churn
    const stemMat = makeCloudMat("fire", 0x6c6056);
    const su = stemMat.uniforms;
    su.uAmp.value = 0.3;
    su.uFreq.value = 3.6;
    su.uScroll.value.set(0, -1.0, 0);
    su.uHotY.value = gy;
    su.uHotRange.value = S * 1.4;
    su.uEdge.value = 1;
    su.uUnder.value = 0.4;
    su.uRimDark.value = 0.6;
    const stem = new THREE.Mesh(geoStem, stemMat);
    stem.position.copy(g);
    stem.scale.set(0.01, 0.01, 0.01);
    stem.renderOrder = 23;
    // condensation collar (Wilson ring) around the stem
    const skirtMat = makeCloudMat("fire", 0xdcd8cc);
    skirtMat.uniforms.uHeat.value = 0;
    skirtMat.uniforms.uAmp.value = 0.12;
    skirtMat.uniforms.uFreq.value = 4.0;
    skirtMat.uniforms.uEdge.value = 1;
    const skirt = new THREE.Mesh(geoSkirt, skirtMat);
    skirt.visible = false;
    skirt.renderOrder = 22;
    const dur = 26;
    const capState = { y: p.y, s: S, ts: S, h: S };
    let puffT = 0,
      stemPuffT = 0,
      collarT = 0;
    addPiece(stem, dur, (t, dt) => {
      const rise = 1 - Math.pow(1 - Math.min(1, t / 6.5), 2.2);
      const h = S * 0.6 + (H - S * 0.6) * rise;
      const w = S * (0.62 + 0.45 * Math.min(1, t / 3.5));
      stem.scale.set(w, Math.max(0.01, h - S * 0.35), w);
      capState.h = h;
      su.uTime.value += dt;
      su.uHeat.value = clamp(1.1 * Math.exp(-t / 3.0), 0.1, 1);
      su.uAlpha.value =
        t < 0.5 ? t / 0.5 : t > 15 ? Math.max(0, 1 - (t - 15) / 11) : 1;
      // rising puffs hugging the column: breaks up the lathe silhouette, reads as churning volume
      stemPuffT -= dt;
      if (stemPuffT <= 0 && t > 0.6 && t < 16 && A.psAlpha) {
        stemPuffT = 0.07;
        const a = rr(0, 6.28),
          yy = rr(0.05, 0.9) * h,
          rad = w * rr(0.25, 0.45);
        A.psAlpha.spawn({
          x: g.x + Math.cos(a) * rad,
          y: g.y + yy,
          z: g.z + Math.sin(a) * rad,
          vx: Math.cos(a) * 0.6,
          vy: rr(2, 5) * Math.sqrt(S / 10),
          vz: Math.sin(a) * 0.6,
          size: S * rr(0.45, 0.7),
          size1: S * rr(0.9, 1.4),
          life: rr(3.5, 6),
          color: 0x5e554c,
          alpha: 0.42,
          frame: FR.SMOKE1 + ((Math.random() * 3) | 0),
          drag: 0.35,
          wind: 0.12,
          rotv: rr(-0.25, 0.25),
          fadeIn: 0.15,
          fadeOut: 0.5,
          lit: 1,
        });
      }
    });
    addPiece(cap, dur, (t, dt) => {
      const rise = 1 - Math.pow(1 - Math.min(1, t / 6.5), 2.2);
      const y = gy + S * 0.6 + (H - S * 0.6) * rise;
      cap.position.set(p.x, y, p.z);
      const grow = 1 - Math.pow(1 - Math.min(1, t / 0.7), 3);
      const s = S * (0.4 + 1.05 * grow) * (1 + 0.1 * t);
      // flattens from a ball into a mushroom cap as the vortex forms
      const flat = t < 1.2 ? 0.9 : Math.max(0.58, 0.9 - (t - 1.2) * 0.2);
      ball.scale.set(s, s * flat, s);
      let ts = s;
      if (t > 0.9) {
        torus.visible = true;
        const k = Math.min(1, (t - 0.9) / 2.5);
        ts = s * (0.6 + 0.62 * k);
        torus.scale.set(ts, ts * 0.85, ts);
        torus.position.y = -s * 0.22;
        tu.uTime.value += dt;
        tu.uScroll.value.set(0, 0.5 + 0.3 * k, 0); // underside rolls upward and outward
        tu.uHeat.value = clamp(1.25 * Math.exp(-(t - 0.9) / 5.5), 0.3, 1.2);
        tu.uHotY.value = y - s * 0.2;
        tu.uAlpha.value =
          t > 14 ? Math.max(0, 1 - (t - 14) / 12) : Math.min(1, (t - 0.9) * 2);
      }
      capState.y = y;
      capState.s = s;
      capState.ts = ts;
      cu.uTime.value += dt;
      cu.uScroll.value.set(0, -0.35 - 0.4 * Math.min(1, t / 3), 0); // rolling churn
      cu.uHeat.value =
        t < 1.0 ? 1.15 : clamp(1.15 * Math.exp(-(t - 1.0) / 4.5), 0.18, 1.15);
      cu.uHotY.value = y - s * 0.7;
      cu.uAlpha.value = t > 14 ? Math.max(0, 1 - (t - 14) / 12) : 1;
      cu.uAmp.value = 0.55 + t * 0.012;
      // volume billboards: lit puffs rolling around the cap's rim + fiery glow under it
      puffT -= dt;
      if (puffT <= 0 && t > 0.8 && t < 17 && A.psAlpha) {
        puffT = 0.045;
        const a = rr(0, 6.28),
          rad = ts * rr(0.8, 1.25),
          yy = y + rr(-0.35, 0.25) * s;
        A.psAlpha.spawn({
          x: p.x + Math.cos(a) * rad,
          y: yy,
          z: p.z + Math.sin(a) * rad,
          vx: Math.cos(a) * rr(0.5, 2),
          vy: rr(0.8, 2.5),
          vz: Math.sin(a) * rr(0.5, 2),
          size: S * rr(0.6, 1.0),
          size1: S * rr(1.4, 2.1),
          life: rr(5, 8),
          color: Math.random() < 0.5 ? 0x6a5e52 : 0x4c443c,
          alpha: 0.4,
          frame: FR.SMOKE1 + ((Math.random() * 3) | 0),
          drag: 0.4,
          wind: 0.18,
          rotv: rr(-0.2, 0.2),
          fadeIn: 0.12,
          fadeOut: 0.55,
          lit: 1,
        });
        if (t < 7 && A.psAdd && Math.random() < 0.6) {
          const a2 = rr(0, 6.28),
            r2 = ts * rr(0.2, 0.9);
          A.psAdd.spawn({
            x: p.x + Math.cos(a2) * r2,
            y: y - s * rr(0.25, 0.5),
            z: p.z + Math.sin(a2) * r2,
            vy: rr(0.5, 2),
            size: S * rr(0.5, 0.9),
            size1: S * rr(0.9, 1.4),
            life: rr(0.8, 1.6),
            color: 0xffa040,
            intensity: 1.6 * (1 - t / 7),
            color1: 0x8a2008,
            intensity1: 0.3,
            frame: FR.FLAME,
            rot: rr(0, 6.28),
            rotv: rr(-0.5, 0.5),
            fadeIn: 0.2,
            fadeOut: 0.6,
          });
        }
      }
    });
    addPiece(skirt, 10, (t, dt) => {
      if (t < 2.2) return;
      skirt.visible = true;
      const u = (t - 2.2) / 7.8;
      const r = S * (1.1 + 2.0 * u);
      const cy = gy + capState.h * 0.5;
      skirt.scale.set(r, r * 0.55, r);
      skirt.position.set(p.x, cy, p.z);
      skirtMat.uniforms.uTime.value += dt;
      skirtMat.uniforms.uAlpha.value = Math.sin(Math.min(1, u) * Math.PI) * 0.6;
      // wispy condensation puffs along the collar
      collarT -= dt;
      if (collarT <= 0 && u < 0.7 && A.psAlpha) {
        collarT = 0.05;
        const a = rr(0, 6.28);
        A.psAlpha.spawn({
          x: p.x + Math.cos(a) * r,
          y: cy + rr(-0.15, 0.15) * S,
          z: p.z + Math.sin(a) * r,
          vx: Math.cos(a) * S * 0.25,
          vy: 0.2,
          vz: Math.sin(a) * S * 0.25,
          size: S * 0.5,
          size1: S * rr(1.0, 1.5),
          life: rr(2.5, 4),
          color: 0xe4e0d6,
          alpha: 0.3,
          frame: FR.SMOKE2,
          drag: 0.8,
          wind: 0.2,
          rotv: rr(-0.2, 0.2),
          fadeIn: 0.2,
          fadeOut: 0.6,
          lit: 1,
        });
      }
    });
    // ground shockwaves & shell
    shockRing(g, S * 14, 1.6, 0xffe0b0, 2);
    shockRing(g, S * 7, 0.8, 0xffffff, 2.5);
    blastShell(p, S * 6, 0.8, 0xfff0d0);
    // base surge: rolling dust
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2 + rr(-0.1, 0.1),
        sp = rr(14, 30) * Math.sqrt(S / 10);
      A.psAlpha.spawn({
        x: g.x + Math.cos(a) * S * 0.5,
        y: g.y + rr(0.5, 2),
        z: g.z + Math.sin(a) * S * 0.5,
        vx: Math.cos(a) * sp,
        vy: rr(0.5, 2.5),
        vz: Math.sin(a) * sp,
        size: S * 0.8,
        size1: S * rr(2.2, 3.5),
        life: rr(4, 7),
        color: 0x8a7e68,
        alpha: 0.5,
        frame: FR.DUST,
        drag: 0.9,
        wind: 0.2,
        rotv: rr(-0.4, 0.4),
        fadeIn: 0.03,
        fadeOut: 0.5,
      });
    }
    // fire storm + sparks + debris
    for (let i = 0; i < 40; i++) {
      A.randDir(_d);
      _d.y = Math.abs(_d.y) + 0.2;
      const sp = rr(15, 45);
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.08,
        life: rr(1, 3),
        color: 0xffd080,
        intensity: 7,
        color1: 0xff3a08,
        intensity1: 2,
        frame: FR.STREAK,
        stretch: 0.04,
        grav: 1,
        bounce: true,
        drag: 0.3,
      });
    }
    spawnDebris(g, 30, 22, { burn: 0.7, scale: 1.4 });
    FX.decal(g, new THREE.Vector3(0, 1, 0), "scorch", {
      size: S * 3.2,
      heat: 0.5,
      life: 900,
    });
    FX.decal(
      new THREE.Vector3(g.x + 0.3, g.y + 0.01, g.z - 0.2),
      new THREE.Vector3(0, 1, 0),
      "rad_puddle",
      { size: S * 1.4, life: 900 },
    );
    for (let i = 0; i < 5; i++) {
      const a = rr(0, 6.28),
        r = rr(0.3, 1.1) * S;
      const f = FX.fire(
        new THREE.Vector3(
          g.x + Math.cos(a) * r,
          A.groundAt(g.x + Math.cos(a) * r, g.z + Math.sin(a) * r, g.y + 2),
          g.z + Math.sin(a) * r,
        ),
        rr(0.8, 1.6),
        { sound: i === 0 },
      );
      if (f) f.expire(rr(18, 26));
    }
    // smoke that keeps feeding the column
    const col = FX.smoke(new THREE.Vector3(g.x, g.y + 1, g.z), S * 0.35, {
      rate: 6,
      rise: 1.6,
    });
    if (col) col.expire(18);
    // radiation zone that decays
    if (G.world && G.world.addRadSource) {
      const src = G.world.addRadSource({
        x: g.x,
        y: g.y + 1,
        z: g.z,
        radius: S * 3.5,
        strength: 30,
        tag: "nuke_rad",
      });
      nukeRads.push({ src, t: 0, dur: 60, s0: 30 });
    }
    // camera: big shake, delayed rumble
    cameraKick(p, S * 3, 1.6);
    const d = A.camDist(p);
    A.after(Math.min(1.5, d / 343), () => {
      if (G.player && G.player.shake && d < 600)
        G.player.shake(clamp(1.2 - d / 500, 0.2, 1.2), 1.4);
    });
  }
