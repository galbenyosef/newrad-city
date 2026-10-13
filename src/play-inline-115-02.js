// play-inline-115 02 — math
// Lines 17-205 of readable/play-inline-115.pretty.js (statement-aligned).
  const K = G.LMA.kit;

  K.defineInterior("chrysler:paints_mural", function () {
    K.paint("chrysler_mural", 512, 512, (x2, W, H) => {
      const g2 = x2.createRadialGradient(
        W / 2,
        H / 2,
        20,
        W / 2,
        H / 2,
        W * 0.7,
      );
      g2.addColorStop(0, "#e0a050");
      g2.addColorStop(1, "#6a3a1a");
      x2.fillStyle = g2;
      x2.fillRect(0, 0, W, H);
      x2.strokeStyle = "rgba(40,20,10,0.6)";
      x2.lineWidth = 3;
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI) / 8;
        x2.beginPath();
        x2.moveTo(W / 2, H / 2);
        x2.lineTo(W / 2 + Math.cos(a) * W, H / 2 + Math.sin(a) * H);
        x2.stroke();
      }
      // stylised figures / aeroplane / zeppelin ("transport & endeavour")
      x2.fillStyle = "rgba(50,30,20,0.75)";
      x2.beginPath();
      x2.ellipse(W * 0.3, H * 0.25, 70, 18, -0.2, 0, 7);
      x2.fill();
      x2.fillRect(W * 0.62, H * 0.2, 90, 10);
      x2.fillRect(W * 0.66, H * 0.14, 12, 50);
      for (let i = 0; i < 5; i++) {
        const px = W * (0.15 + i * 0.17),
          py = H * 0.72;
        x2.beginPath();
        x2.arc(px, py - 40, 10, 0, 7);
        x2.fill();
        x2.fillRect(px - 8, py - 30, 16, 50);
      }
      K.stains(x2, W, H, 14, 13, 0.5);
      K.streaks(x2, W, H, 30, 14, 0.3);
      // raider graffiti over it
      x2.strokeStyle = "rgba(200,30,20,0.85)";
      x2.lineWidth = 8;
      x2.font = "bold 60px Impact, sans-serif";
      x2.fillStyle = "rgba(200,30,20,0.85)";
      x2.save();
      x2.translate(W * 0.55, H * 0.55);
      x2.rotate(-0.2);
      x2.fillText("KINGS OF THE SPIRE", -200, 0);
      x2.restore();
    });
  });

  K.defineInterior("chrysler:paints_elev", function () {
    K.paint("chrysler_elev", 256, 320, (x2, W, H) => {
      x2.fillStyle = "#4a2a18";
      x2.fillRect(0, 0, W, H);
      x2.strokeStyle = "#d8b878";
      x2.lineWidth = 3;
      for (let i = 0; i < 11; i++) {
        x2.beginPath();
        x2.moveTo(W / 2, H * 0.85);
        x2.lineTo((W * i) / 10, H * 0.1);
        x2.stroke();
      }
      x2.fillStyle = "#d8b878";
      x2.beginPath();
      x2.arc(W / 2, H * 0.85, 30, Math.PI, 0);
      x2.fill();
      x2.fillStyle = "#1a0e08";
      x2.fillRect(W / 2 - 2, 0, 4, H);
      K.stains(x2, W, H, 4, 15, 0.4);
    });
  });

  K.defineInterior("chrysler", function (ctx) {
    const { rec, b, d, glows, P, A, L, CZ } = ctx;
    // ---- lobby (raider den) ----
    b.boxMM("marble", L.x0, -0.2, L.z0, L.x1, 0.04, L.z1, {
      faces: "t",
      tint: 0xc8b090,
    });
    b.boxMM("marble", A.x0, -0.2, -209.5, L.x0, 0.04, -205.5, {
      faces: "t",
      tint: 0xc8b090,
    });
    for (const w of [
      [L.x0, L.z0, L.x1, L.z0 + 0.02, "s"],
      [L.x0, L.z1 - 0.02, L.x1, L.z1, "n"],
      [L.x1 - 0.02, L.z0, L.x1, L.z1, "w"],
    ])
      b.boxMM("marble_warm", w[0], 0, w[1], w[2], L.h, w[3], {
        faces: w[4],
        tint: 0xb04a38,
        grime: 0.5,
      });
    b.boxMM("marble_warm", L.x0, 0, L.z0, L.x0 + 0.02, L.h, -209.5, {
      faces: "e",
      tint: 0xb04a38,
    });
    b.boxMM("marble_warm", L.x0, 0, -205.5, L.x0 + 0.02, L.h, L.z1, {
      faces: "e",
      tint: 0xb04a38,
    });
    b.quad(
      "atlas_paint",
      [L.x0, L.h, L.z0],
      [L.x1, L.h, L.z0],
      [L.x1, L.h, L.z1],
      [L.x0, L.h, L.z1],
      { rect: K.paint("chrysler_mural", 512, 512) },
    );
    // art-deco light strips (some dead)
    for (let x = L.x0 + 2; x < L.x1 - 1; x += 3.2)
      for (const z of [L.z0 + 0.05, L.z1 - 0.05]) {
        if ((x * 3) % 7 < 2) continue;
        b.panel("lit_warm", x, 4.5, z, 0.35, 2.6, z < CZ ? 0 : Math.PI, {
          off: 0.01,
        });
        glows.add(x, 4.5, z + (z < CZ ? 0.3 : -0.3), 0xffc070, "m");
      }
    const er = K.paint("chrysler_elev", 256, 320);
    for (let z = L.z0 + 2.5; z < L.z1 - 1; z += 3)
      d.panel("atlas_paint", L.x1 - 0.06, 1.5, z, 1.6, 3.0, -Math.PI / 2, {
        rect: er,
      });
    // raiders' rope-and-winch service lift (quests hook a door here → the sniper nest): scrap cage + sign
    K.paint("chrysler_lift", 256, 96, (x2, W, H) => {
      x2.fillStyle = "#5a4a32";
      x2.fillRect(0, 0, W, H);
      x2.fillStyle = "#e8d8b0";
      x2.font = "bold 44px Impact, sans-serif";
      x2.textAlign = "center";
      x2.textBaseline = "middle";
      x2.fillText("LIFT \u2191 NEST", W / 2, H / 2 + 2);
      K.stains(x2, W, H, 4, 16, 0.4);
    });
    const lz = -202.5,
      lx = L.x1 - 0.9;
    for (const c of [
      [-0.7, -1.1],
      [0.7, -1.1],
      [-0.7, 1.1],
      [0.7, 1.1],
    ])
      d.beam("rust", lx + c[0], 0, lz + c[1], lx + c[0], 3.2, lz + c[1], 0.08);
    for (const y of [0.05, 1.1, 3.2]) {
      d.beam("rust", lx - 0.7, y, lz - 1.1, lx - 0.7, y, lz + 1.1, 0.06);
      d.beam("rust", lx - 0.7, y, lz - 1.1, lx + 0.7, y, lz - 1.1, 0.06);
      d.beam("rust", lx - 0.7, y, lz + 1.1, lx + 0.7, y, lz + 1.1, 0.06);
    }
    d.cable("rust", lx, 3.2, lz, lx, L.h, lz, 0, 0.03, 2);
    d.cyl("rust", lx, L.h - 0.6, lz, 0.35, 0.35, 0.15, 10, {});
    d.panel("atlas_paint", lx - 0.72, 2.5, lz, 1.4, 0.52, -Math.PI / 2, {
      rect: K.paint("chrysler_lift", 256, 96),
    });
    glows.add(lx - 0.8, 3.0, lz, 0xffa050, "s");
    // raider junk: throne, mattresses, fire barrel, cages, gore, graffiti
    P.crate(d, L.x1 - 2.5, 0, CZ, 1.2, 0.1);
    P.crate(d, L.x1 - 2.5, 1.0, CZ, 1.0, 0.3);
    P.chair(d, L.x1 - 2.5, 1.95, CZ, -Math.PI / 2, { mat: "carpet" });
    P.barrel(d, 308, 0, CZ + 1, "fire", { glows, collide: true });
    for (const m of [
      [303, -212.5, 0.3],
      [305, -202.5, 1.7],
      [312, -212.8, 0.1],
      [313.5, -202.3, 1.3],
    ])
      P.mattress(d, m[0], 0.05, m[1], m[2]);
    P.cage(d, 301.5, -212.3, 1.6, 2.2, {});
    P.meatBag(d, 306, L.h, -210.5, { len: 2.5 });
    P.meatBag(d, 310.5, L.h, -204, { len: 2.2 });
    P.skeleton(d, 302, 0.05, -203, 2.0);
    P.tire(d, 315, 0, -212.5, true);
    P.tire(d, 315.3, 0.25, -212.4, true);
    P.table(d, 311, 0, CZ - 2.5, 0.3, {});
    P.chair(d, 312, 0, CZ - 2.5, -1.2);
    P.chair(d, 310, 0, CZ - 2.3, 1.8, { fallen: true });
    b.burn(308, 1, CZ + 1, 3, 0.5);
    // lobby anchors
    rec.anchor("boss", L.x1 - 2.5, 0, CZ + 1.6, -Math.PI / 2);
    rec.anchor("throne", L.x1 - 2.5, 1.95, CZ, -Math.PI / 2);
    rec.anchor("spawn1", 303, 0, CZ - 3, Math.PI / 2);
    rec.anchor("spawn2", 312, 0, CZ + 3.5, Math.PI / 2);
    rec.anchor("spawn3", 295.5, 0, -207.5, Math.PI / 2);
    rec.anchor("loot1", 315.5, 0, -212.8, 0);
  });
