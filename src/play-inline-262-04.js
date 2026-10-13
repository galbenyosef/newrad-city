// play-inline-262 04 — ctx
// Lines 651-970 of readable/play-inline-262.pretty.js (statement-aligned).
  D.master = function (b, x, y, z, w, h, ry, cell, o) {
    o = o || {};
    const k = P.texMat("ues_masters", D.masterTex(), { rough: 0.55 });
    const cx = cell % 4,
      cy = Math.floor(cell / 4);
    const m = P.m4(x, y, z, ry);
    b.geo(
      k,
      new THREE.PlaneGeometry(w, h),
      m.clone().multiply(P.m4(0, 0, 0.04)),
      {
        uv: "keep",
        uvRect: [cx / 4, 1 - (cy + 1) / 4, (cx + 1) / 4, 1 - cy / 4],
        noAO: true,
        grime: 0.05,
      },
    );
    const fk = o.frame || "gold",
      ft = o.ft || Math.max(0.08, Math.min(w, h) * 0.08),
      fd = o.deep || 0.09;
    for (const s of [-1, 1]) {
      b.geo(
        fk,
        new THREE.BoxGeometry(w + ft * 2, ft, fd),
        m.clone().multiply(P.m4(0, s * (h / 2 + ft / 2), fd / 2)),
        { noAO: true },
      );
      b.geo(
        fk,
        new THREE.BoxGeometry(ft, h, fd),
        m.clone().multiply(P.m4(s * (w / 2 + ft / 2), 0, fd / 2)),
        { noAO: true },
      );
      // inner bead
      b.geo(
        fk,
        new THREE.BoxGeometry(w, 0.025, 0.03),
        m.clone().multiply(P.m4(0, s * (h / 2 - 0.01), 0.055)),
        { noAO: true },
      );
    }
  };
  /** An empty gilt frame (for stolen works) — canvas missing, faded patch on the wall behind. */
  D.emptyFrame = function (b, x, y, z, w, h, ry, o) {
    o = o || {};
    const m = P.m4(x, y, z, ry),
      ft = Math.max(0.08, Math.min(w, h) * 0.08);
    b.geo(
      o.patch || "plaster_cream",
      new THREE.PlaneGeometry(w + 0.1, h + 0.1),
      m.clone().multiply(P.m4(0, 0, 0.012)),
      { noAO: true, grime: 0, c: 0xfff4dc },
    );
    for (const s of [-1, 1]) {
      b.geo(
        "gold",
        new THREE.BoxGeometry(w + ft * 2, ft, 0.09),
        m.clone().multiply(P.m4(0, s * (h / 2 + ft / 2), 0.045)),
        { noAO: true },
      );
      b.geo(
        "gold",
        new THREE.BoxGeometry(ft, h, 0.09),
        m.clone().multiply(P.m4(s * (w / 2 + ft / 2), 0, 0.045)),
        { noAO: true },
      );
    }
  };

  // ------------------------------------------------------------------
  // posters & banners
  // ------------------------------------------------------------------
  P.uesPoster = function (key) {
    const defs = {
      frick_hours: [
        [
          "THE FRICK COLLECTION",
          "Open 10 to 6",
          "Closed Mondays",
          "Children under ten not admitted",
        ],
        "#e4dcc4",
        "#3a2a1a",
      ],
      frick_robot: [
        [
          "NOTICE TO VISITORS",
          "Your Visit Is Supervised by",
          "American Automaton Attendants",
          "Please Do Not Touch The Art",
          "Or The Attendants",
        ],
        "#d8d0b8",
        "#6a1a14",
      ],
      cooper_streamline: [
        [
          "STREAMLINE!",
          "The Shape of Tomorrow",
          "Cooper-Hewitt Museum",
          "Fall 1967",
        ],
        "#e8c860",
        "#1a2a4a",
      ],
      cooper_cryo: [
        [
          "THE LONG WINTER",
          "Design for the",
          "Sleeper Suite",
          "Gallery 3 — Now Open",
        ],
        "#d4d2c8",
        "#c8562a",
      ],
      cooper_chairs: [
        ["SIT DOWN, AMERICA", "A Century of Chairs", "1867 — 1967"],
        "#c85a3a",
        "#f4ead0",
      ],
      vote_1: [
        [
          "VOTE!",
          "Election Day",
          "November 2, 1965",
          "Your Ballot Is Your Bomb Shelter",
        ],
        "#e8e0cc",
        "#1a3a7a",
      ],
      vote_2: [
        ["RE-ELECT", "WHITCOMBE", "Steady Hands", "For Uncertain Times"],
        "#1a3a7a",
        "#f0e8d0",
      ],
      vote_3: [
        ["DELGADO", "For Mayor", "The Future Is", "Everyone's"],
        "#b8402a",
        "#f4ecd8",
      ],
      polling: [
        [
          "POLLING PLACE",
          "Election District 73",
          "Assembly District 66",
          "Enter Here",
        ],
        "#f0ece0",
        "#1a1a1a",
      ],
      seventh: [
        ["SEVENTH REGIMENT", "N.Y.N.G.", "Pro Patria et Gloria"],
        "#8a8a8a",
        "#1a1a1a",
      ],
      hired: [
        ["THE SEVENTH", "Hiring Guns", "Paying Scrip", "Asking Nothing"],
        "#3a3a2a",
        "#d8c060",
      ],
      mayor: [
        [
          "CITY OF NEW YORK",
          "OFFICE OF THE MAYOR",
          "Temporary Seat of Government",
        ],
        "#e8e0cc",
        "#1a3a7a",
      ],
    };
    const d = defs[key] || [["NOTICE"], "#ddd", "#222"];
    return P.signTex("ues_poster_" + key, d[0], "poster", 320, 480, {
      bg: d[1],
      fg: d[2],
      art: (ctx, w, h, r) => {
        ctx.fillStyle = d[2];
        if (key.indexOf("vote") === 0 || key === "polling" || key === "mayor") {
          // stars & stripes band
          for (let i = 0; i < 5; i++) {
            ctx.fillStyle = i % 2 ? "#b82a22" : "#f4ecd8";
            ctx.fillRect(0, h * 0.78 + i * 10, w, 10);
          }
          ctx.fillStyle = "#1a3a7a";
          ctx.fillRect(0, h * 0.78, w * 0.3, 50);
        } else if (key.indexOf("cooper") === 0) {
          ctx.strokeStyle = d[2];
          ctx.lineWidth = 5;
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(30, h * 0.66 + i * 16);
            ctx.lineTo(w - 30 - i * 30, h * 0.66 + i * 16);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.ellipse(w * 0.6, h * 0.72, 60, 22, -0.1, 0, TAU);
          ctx.stroke();
        } else if (key === "seventh" || key === "hired") {
          ctx.beginPath();
          ctx.moveTo(w / 2, h * 0.6);
          ctx.lineTo(w / 2 + 40, h * 0.7);
          ctx.lineTo(w / 2 + 25, h * 0.86);
          ctx.lineTo(w / 2 - 25, h * 0.86);
          ctx.lineTo(w / 2 - 40, h * 0.7);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = key === "hired" ? "#d8c060" : "#f4ecd8";
          ctx.font = "bold 40px serif";
          ctx.textAlign = "center";
          ctx.fillText("VII", w / 2, h * 0.78);
        } else {
          ctx.strokeStyle = d[2];
          ctx.lineWidth = 3;
          ctx.strokeRect(20, h * 0.62, w - 40, h * 0.3);
        }
        void r;
      },
    });
  };
  /** Wall poster quad (portrait 0.64×0.96 by default). */
  D.poster = function (b, key, x, y, z, ry, s) {
    s = s || 1;
    const k = P.texMat("ues_poster_" + key, P.uesPoster(key), {
      rough: 0.9,
      transparent: false,
    });
    b.quad(k, x, y, z, 0.64 * s, 0.96 * s, { ry });
  };
  /** Painted/engraved sign quad. */
  D.sign = function (b, key, lines, style, x, y, z, w, h, ry, o) {
    const k = P.texMat(
      "ues_s_" + key,
      P.signTex(
        "ues_s_" + key,
        lines,
        style,
        (o && o.tw) || 1024,
        (o && o.th) || Math.max(64, Math.round((1024 * h) / w)),
        o,
      ),
      {
        rough: 0.8,
        transparent: style === "raider" || style === "bronze",
        emissive: o && o.emissive,
      },
    );
    b.quad(k, x, y, z, w, h, Object.assign({ ry }, o && o.q));
  };

  // ------------------------------------------------------------------
  // extra surfaces
  // ------------------------------------------------------------------
  const C = P.CUSTOM,
    B = P.blotches,
    SP = P.speckle;
  C.ashlar = [
    512,
    512,
    (ctx, w, h) => {
      // Indiana limestone ashlar, 4 courses × 2 blocks
      const r = P.rng("ashlar");
      ctx.fillStyle = "#cfc6b2";
      ctx.fillRect(0, 0, w, h);
      const rows = 4,
        rh = h / rows;
      for (let j = 0; j < rows; j++) {
        const off = ((j % 2) * w) / 4;
        for (let i = -1; i < 3; i++) {
          const x0 = (i * w) / 2 + off,
            c = 190 + r() * 26;
          ctx.fillStyle =
            "rgb(" +
            (c | 0) +
            "," +
            ((c * 0.96) | 0) +
            "," +
            ((c * 0.86) | 0) +
            ")";
          ctx.fillRect(x0 + 2, j * rh + 2, w / 2 - 4, rh - 4);
        }
        ctx.fillStyle = "rgba(70,60,45,0.55)";
        ctx.fillRect(0, j * rh, w, 2);
        for (let i = -1; i < 3; i++)
          ctx.fillRect((i * w) / 2 + off, j * rh, 2, rh);
      }
      B(ctx, w, h, r, 40, 0.12);
      SP(ctx, w, h, r, 2600, 0.18, 0.1);
      for (let i = 0; i < 8; i++) {
        const x = r() * w;
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "rgba(50,44,30,0.18)");
        g.addColorStop(1, "rgba(50,44,30,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, 3 + r() * 14, h);
      }
    },
  ];
  C.rustic = [
    512,
    512,
    (ctx, w, h) => {
      // rusticated base: deep channelled joints
      const r = P.rng("rustic");
      ctx.fillStyle = "#c4bba6";
      ctx.fillRect(0, 0, w, h);
      const rows = 4,
        rh = h / rows;
      for (let j = 0; j < rows; j++) {
        const g = ctx.createLinearGradient(0, j * rh, 0, (j + 1) * rh);
        g.addColorStop(0, "rgba(255,250,235,0.18)");
        g.addColorStop(0.85, "rgba(0,0,0,0)");
        g.addColorStop(1, "rgba(30,24,16,0.45)");
        ctx.fillStyle = g;
        ctx.fillRect(0, j * rh, w, rh);
        ctx.fillStyle = "rgba(40,32,22,0.8)";
        ctx.fillRect(0, j * rh, w, 6);
      }
      B(ctx, w, h, r, 40, 0.16);
      SP(ctx, w, h, r, 3000, 0.2, 0.1);
    },
  ];
