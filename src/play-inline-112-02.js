// play-inline-112 02 — three
// Lines 24-178 of readable/play-inline-112.pretty.js (statement-aligned).
  const K = G.LMA.kit;

  const FZ = -192; // façade front plane
  const X0 = 212,
    X1 = 268; // outer walls
  const IX0 = 213.5,
    IX1 = 266.5; // interior faces
  const WR = { z0: -206, z1: -193.6 }; // waiting room (inside façade block)
  const CZ0 = -244.5,
    CZ1 = -207.5; // concourse interior z
  const CZC = (CZ0 + CZ1) / 2; // -226
  const SPRING = 24,
    CROWN = 31;
  const BAL_Y = 6.5;
  const BAYS = [226, 240, 254];
  const HOLE = { x0: 249, x1: 256, z0: -223, z1: -215 };

  function textures() {
    // Arched window glazing: steel mullion grid with dirty + missing panes (alpha-cut), 8×8 panes per tile
    const c = K.canvas(512, 512),
      x = c.getContext("2d");
    const r = K.rng(4242);
    x.clearRect(0, 0, 512, 512);
    x.scale(0.5, 0.5);
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 8; j++) {
        const roll = r();
        if (roll < 0.22 + (j < 3 ? 0.15 : 0)) continue; // missing pane (see-through), more near the bottom
        const g = x.createLinearGradient(
          i * 128,
          j * 128,
          i * 128 + 128,
          j * 128 + 128,
        );
        const base =
          roll < 0.5
            ? [58, 66, 58]
            : roll < 0.8
              ? [96, 108, 94]
              : [140, 150, 128];
        g.addColorStop(
          0,
          "rgba(" + base.map((v) => v + 30).join(",") + ",0.95)",
        );
        g.addColorStop(1, "rgba(" + base.join(",") + ",0.95)");
        x.fillStyle = g;
        x.fillRect(i * 128, j * 128, 128, 128);
        if (roll > 0.88) {
          x.save();
          x.globalCompositeOperation = "destination-out";
          x.beginPath();
          x.moveTo(i * 128 + 20, j * 128 + 128);
          x.lineTo(i * 128 + 90, j * 128 + 40);
          x.lineTo(i * 128 + 128, j * 128 + 128);
          x.fill();
          x.restore();
        }
      }
    x.fillStyle = "#2a2c28";
    for (let i = 0; i <= 8; i++) {
      x.fillRect(i * 128 - 5, 0, 10, 1024);
      x.fillRect(0, i * 128 - 5, 1024, 10);
    }
    for (let i = 0; i < 8; i++) {
      x.fillRect(i * 128 + 62, 0, 4, 1024);
      x.fillRect(0, i * 128 + 62, 1024, 4);
    }
    K.stains(x, 1024, 1024, 16, 4243, 0.3);
    K.defineMat("gc_glass", {
      map: K.texFromCanvas(c),
      color: 0xffffff,
      tile: [9.6, 12],
      rough: 0.3,
      metal: 0.3,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });

    K.interior("grand_central:textures"); // zodiac ceiling material — 20_grand_central_interior.js

    K.defineMat("flags_static", {
      map: K.atlases.flags.tex,
      color: 0xffffff,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      rough: 1,
      noShadow: true,
    });

    // painted signs
    K.paint("gc_banner", 1024, 160, (x, W2, H2) =>
      K.signText(x, W2, H2, "GRAND CENTRAL MARKET", {
        bg: "#3c5a7a",
        fg: "#f0d890",
        border: "#e8c860",
        size: 96,
        spacing: 6,
      }),
    );
    K.paint("gc_welcome", 512, 160, (x, W2, H2) => {
      K.signText(x, W2, H2, "ALL TRADERS WELCOME", {
        bg: "#d8ccb0",
        fg: "#2a3a5a",
        size: 52,
      });
      x.fillStyle = "#9a1a12";
      x.font = "bold 34px Impact, sans-serif";
      x.textAlign = "center";
      x.fillText(
        "NO RAIDERS · NO BRUTES · NO MANIACS",
        W2 / 2,
        H2 - 14,
        W2 - 16,
      );
    });
    K.interior("grand_central:paints"); // interior signs (tracks, mayor, clinic, stalls, booth clock)
    K.paint("gc_tiffany", 256, 256, (x, W2, H2) =>
      K.clockFace(x, W2, H2, {
        glass: true,
        face: "#e8dcb0",
        rim: "#8a6a2a",
        seed: 9,
      }),
    );
    K.neon("gc_neon", "GRAND CENTRAL MARKET", 0x5aff9a, {
      font: 'bold 72px "Arial Black", Impact, sans-serif',
      h: 120,
      border: true,
    });
    K.interior("grand_central:neon"); // THE WHISTLE STOP, OPEN
  }

  // Additive light shaft: two crossed quads from p along dir (unit) for len, widening w0→w1.
  function shaft(b, p, dir, len, w0, w1, tint) {
    const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const up =
      Math.abs(d.y) > 0.95
        ? new THREE.Vector3(1, 0, 0)
        : new THREE.Vector3(0, 1, 0);
    const s1 = new THREE.Vector3().crossVectors(d, up).normalize();
    const s2 = new THREE.Vector3().crossVectors(d, s1).normalize();
    const e = [p[0] + d.x * len, p[1] + d.y * len, p[2] + d.z * len];
    for (const s of [s1, s2]) {
      const a0 = [p[0] - s.x * w0, p[1] - s.y * w0, p[2] - s.z * w0],
        a1 = [p[0] + s.x * w0, p[1] + s.y * w0, p[2] + s.z * w0];
      const b1 = [e[0] + s.x * w1, e[1] + s.y * w1, e[2] + s.z * w1],
        b0 = [e[0] - s.x * w1, e[1] - s.y * w1, e[2] - s.z * w1];
      b.quad("shaft", b0, b1, a1, a0, {
        rect: [0, 0, 1, 1],
        tint: tint || 0xffffff,
      });
    }
  }
  K.shaft = shaft;

