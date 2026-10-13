// play-inline-543 02 — pal
// Lines 144-1105 of readable/play-inline-543.pretty.js (statement-aligned).
  function create(api) {
    const A = api.audio,
      pal = api.pal,
      rnd = api.rnd,
      N = A.N;
    const p = {
      x: 110,
      y: 0,
      g: 0,
      st: "walk",
      vy: 0,
      vx: 0,
      face: 1,
      lad: null,
      fallY: 0,
      anim: 0,
      hammer: 0,
      deadT: 0,
    };
    const kegs = [];
    for (let i = 0; i < MAX_KEGS; i++)
      kegs.push({
        alive: false,
        x: 0,
        y: 0,
        g: 0,
        dir: 1,
        st: "roll",
        vy: 0,
        lad: null,
        rot: 0,
        jumped: false,
      });
    const slags = [];
    for (let i = 0; i < MAX_SLAG; i++)
      slags.push({
        alive: false,
        x: 0,
        y: 0,
        g: 0,
        dir: 1,
        st: "walk",
        lad: null,
        t: 0,
      });
    const pows = POWERUPS.map((q) => ({ x: q[0], g: q[1], taken: false }));
    const g = {
      score: 0,
      over: false,
      won: false,
      champion: false,
      lives: 3,
      level: 1,
      cleared: 0,
      bonus: 5000,
      bonusT: 0,
      throwT: 2,
      throwAnim: 0,
      phase: "play",
      pt: 0,
      t: 0,
      jumpReq: false,
      msg: "",
      msgT: 0,
      speed: 84,
      ladderChance: 0.3,
      drumFire: 0,
    };
    const input = { l: false, r: false, u: false, d: false };
    const SC = {};
    for (const k in SPR)
      SC[k] = [
        AR.sprite("sw_" + k, SPR[k], 2, pal, false),
        AR.sprite("sw_" + k, SPR[k], 2, pal, true),
      ];

    function resetStage() {
      p.x = 110;
      p.g = 0;
      p.y = gy(0, p.x);
      p.st = "walk";
      p.vy = 0;
      p.vx = 0;
      p.face = 1;
      p.lad = null;
      p.hammer = 0;
      p.deadT = 0;
      for (const b of kegs) b.alive = false;
      for (const o of slags) o.alive = false;
      for (const q of pows) q.taken = false;
      g.bonus = Math.min(8000, 4000 + g.level * 1000);
      g.bonusT = 0;
      g.throwT = 1.6;
      g.throwAnim = 0;
      g.phase = "play";
      g.pt = 0;
      g.drumFire = 0;
      g.speed = 78 + g.level * 12;
      g.ladderChance = Math.min(0.55, 0.22 + g.level * 0.08);
      g.msg = "LEVEL " + g.level + " — TOP OUT THE TOWER!";
      g.msgT = 2;
    }

    // ------------------------------------------------------------------
    function throwKeg() {
      for (const b of kegs) {
        if (b.alive) continue;
        b.alive = true;
        b.g = 5;
        b.x = 96;
        b.y = gy(5, 96) - 7;
        b.dir = 1;
        b.st = "roll";
        b.vy = 0;
        b.lad = null;
        b.rot = 0;
        b.jumped = false;
        A.beep({ f: 180, f2: 90, dur: 0.14, vol: 0.2, type: "square" });
        return;
      }
    }
    function spawnSlag() {
      let n = 0;
      for (const o of slags) if (o.alive) n++;
      if (n >= Math.min(MAX_SLAG, g.level - 1)) return;
      for (const o of slags)
        if (!o.alive) {
          o.alive = true;
          o.g = 0;
          o.x = DRUM_X + 16;
          o.y = gy(0, o.x);
          o.dir = 1;
          o.st = "walk";
          o.lad = null;
          o.t = 0;
          A.beep({ f: 90, f2: 300, dur: 0.3, vol: 0.2, type: "sawtooth" });
          return;
        }
    }
    function die() {
      if (p.st === "dead") return;
      p.st = "dead";
      p.deadT = 0;
      A.seq(
        [
          [N(7), 0.1],
          [N(5), 0.1],
          [N(3), 0.1],
          [N(2), 0.1],
          [N(0), 0.1],
          [N(-5), 0.3],
        ],
        { vol: 0.28 },
      );
    }

    function updateKeg(b, dt) {
      if (b.st === "roll") {
        const d = downhill(b.g) || b.dir;
        b.dir = d;
        const ox = b.x;
        b.x += d * g.speed * dt;
        b.rot += d * dt * 8;
        // may take a ladder down
        if (b.g > 0)
          for (const l of LAD) {
            if (l.broken || l.g !== b.g - 1) continue;
            if ((ox - l.x) * (b.x - l.x) <= 0 && rnd() < g.ladderChance) {
              b.st = "ladder";
              b.lad = l;
              b.x = l.x;
              break;
            }
          }
        if (b.st === "roll") {
          if (!onGirderX(b.g, b.x)) {
            if (b.g === 0) {
              b.alive = false;
              g.drumFire = 1.2;
              A.noise({ dur: 0.5, f: 900, f2: 120, vol: 0.35 });
              if (g.level >= 2) spawnSlag();
              return;
            }
            b.st = "fall";
            b.vy = 20;
          } else b.y = gy(b.g, b.x) - 7;
        }
      } else if (b.st === "ladder") {
        b.y += 70 * dt;
        if (b.y >= b.lad.yB - 7) {
          b.g = b.lad.g;
          b.y = b.lad.yB - 7;
          b.st = "roll";
          b.lad = null;
        }
      } else if (b.st === "fall") {
        b.vy += 600 * dt;
        const oy = b.y;
        b.y += b.vy * dt;
        b.x += b.dir * 30 * dt;
        for (let i = b.g - 1; i >= 0; i--) {
          if (!onGirderX(i, b.x)) continue;
          const s = gy(i, b.x) - 7;
          if (oy <= s && b.y >= s) {
            b.g = i;
            b.y = s;
            b.st = "roll";
            A.beep({ f: 120, dur: 0.05, vol: 0.1, type: "triangle" });
            break;
          }
        }
        if (b.y > H + 20) b.alive = false;
      }
    }
    function updateSlag(o, dt) {
      o.t += dt;
      if (o.st === "walk") {
        if (rnd() < dt * 0.6) o.dir = p.x > o.x ? 1 : -1;
        o.x += o.dir * (26 + g.level * 4) * dt;
        const gg = GIRDERS[o.g];
        if (o.x < gg[0] + 4) {
          o.x = gg[0] + 4;
          o.dir = 1;
        }
        if (o.x > gg[2] - 4) {
          o.x = gg[2] - 4;
          o.dir = -1;
        }
        o.y = gy(o.g, o.x);
        for (const l of LAD) {
          if (l.broken || Math.abs(l.x - o.x) > 1.5 || rnd() > dt * 3) continue;
          if (l.g === o.g && o.g < 5 && (p.g > o.g || rnd() < 0.3)) {
            o.st = "up";
            o.lad = l;
            o.x = l.x;
            break;
          }
          if (l.g === o.g - 1 && p.g < o.g) {
            o.st = "down";
            o.lad = l;
            o.x = l.x;
            break;
          }
        }
      } else if (o.st === "up") {
        o.y -= 30 * dt;
        if (o.y <= o.lad.yT) {
          o.g = o.lad.g + 1;
          o.st = "walk";
          o.y = o.lad.yT;
        }
      } else if (o.st === "down") {
        o.y += 30 * dt;
        if (o.y >= o.lad.yB) {
          o.g = o.lad.g;
          o.st = "walk";
          o.y = o.lad.yB;
        }
      }
    }

    function ladderAt(x, lowerG, upward) {
      for (const l of LAD) {
        if (Math.abs(l.x - x) > 7) continue;
        if (upward && l.g === lowerG) return l;
        if (!upward && l.g === lowerG - 1) return l;
      }
      return null;
    }

    function updatePlayer(dt) {
      if (p.st === "dead") {
        p.deadT += dt;
        if (p.deadT > 2) {
          g.lives--;
          if (g.lives <= 0) {
            g.over = true;
            return;
          }
          resetStage();
        }
        return;
      }
      if (p.hammer > 0) {
        p.hammer -= dt;
        if (p.hammer <= 0) A.beep({ f: 400, f2: 200, dur: 0.15, vol: 0.15 });
      }
      const mv = (input.r ? 1 : 0) - (input.l ? 1 : 0);
      if (p.st === "walk") {
        if (mv) p.face = mv;
        p.x += mv * 82 * dt;
        const gg = GIRDERS[p.g];
        p.x = Math.max(gg[0] + 5, Math.min(gg[2] - 5, p.x));
        p.y = gy(p.g, p.x);
        if (mv) {
          p.anim += dt;
          if (
            ((p.anim * 8) | 0) !== (((p.anim - dt) * 8) | 0) &&
            ((p.anim * 8) | 0) % 2 === 0
          )
            A.beep({ f: 240, dur: 0.02, vol: 0.05, type: "triangle" });
        }
        // climbing (no climbing while swinging the sledgehammer — house rules)
        if (p.hammer <= 0) {
          if (input.u) {
            const l = ladderAt(p.x, p.g, true);
            if (l) {
              p.st = "climb";
              p.lad = l;
              p.x = l.x;
            }
          } else if (input.d) {
            const l = ladderAt(p.x, p.g, false);
            if (l && !l.broken) {
              p.st = "climb";
              p.lad = l;
              p.x = l.x;
            }
          }
        }
        if (g.jumpReq && p.st === "walk" && p.hammer <= 0) {
          p.st = "jump";
          p.vy = -178;
          p.vx = mv * 82;
          p.fallY = p.y;
          for (const b of kegs) b.jumped = false;
          A.beep({ f: 300, f2: 700, dur: 0.12, vol: 0.18 });
        }
      } else if (p.st === "climb") {
        const l = p.lad;
        const topLimit = l.broken ? l.yB - (l.yB - l.yT) * 0.42 : l.yT;
        if (input.u) {
          p.y -= 56 * dt;
          p.anim += dt;
        } else if (input.d) {
          p.y += 56 * dt;
          p.anim += dt;
        }
        if (p.y <= topLimit) {
          if (l.broken) p.y = topLimit;
          else {
            p.y = l.yT;
            p.g = l.g + 1;
            p.st = "walk";
            p.lad = null;
          }
        }
        if (p.st === "climb" && p.y >= l.yB) {
          p.y = l.yB;
          p.g = l.g;
          p.st = "walk";
          p.lad = null;
        }
      } else if (p.st === "jump" || p.st === "fall") {
        p.vy += 560 * dt;
        const oy = p.y;
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        p.x = Math.max(20, Math.min(W - 20, p.x));
        if (p.vy < 0) p.fallY = p.y;
        // land on a girder crossing from above
        if (p.vy > 0)
          for (let i = GIRDERS.length - 1; i >= 0; i--) {
            if (!onGirderX(i, p.x)) continue;
            const s = gy(i, p.x);
            if (oy <= s + 0.5 && p.y >= s) {
              p.y = s;
              p.g = i;
              if (p.y - p.fallY > 38) die();
              else {
                p.st = "walk";
                A.beep({ f: 150, dur: 0.04, vol: 0.1, type: "triangle" });
              }
              break;
            }
          }
        if (p.y > H + 30) die();
      }
      g.jumpReq = false;
      // power-ups
      for (const q of pows) {
        if (
          q.taken ||
          q.g !== p.g ||
          Math.abs(q.x - p.x) > 10 ||
          p.st !== "walk"
        )
          continue;
        q.taken = true;
        p.hammer = 9;
        A.seq(
          [
            [N(12), 0.06],
            [N(16), 0.06],
            [N(19), 0.06],
            [N(24), 0.12],
          ],
          { vol: 0.22 },
        );
        g.msg = "SLEDGEHAMMER!";
        g.msgT = 1.2;
      }
      // goal
      if (p.g === 6 && p.st === "walk") {
        g.phase = "clear";
        g.pt = 0;
        A.victory();
      }
    }

    function collide() {
      if (p.st === "dead") return;
      const pcx = p.x,
        pcy = p.y - 8;
      for (const b of kegs) {
        if (!b.alive) continue;
        const dx = b.x - pcx,
          dy = b.y - pcy;
        if (
          p.hammer > 0 &&
          Math.abs(dy) < 16 &&
          dx * p.face > -6 &&
          dx * p.face < 24
        ) {
          b.alive = false;
          g.score += 300;
          floatMsg("300");
          A.noise({ dur: 0.2, f: 3000, f2: 500, vol: 0.4 });
          continue;
        }
        if (Math.abs(dx) < 10 && Math.abs(dy) < 12) {
          die();
          return;
        }
        // jump-over bonus: airborne, keg right below on the girder we took off from
        if (
          (p.st === "jump" || p.st === "fall") &&
          !b.jumped &&
          b.st === "roll" &&
          Math.abs(dx) < 8 &&
          dy > 8 &&
          dy < 40
        ) {
          b.jumped = true;
          g.score += 100;
          floatMsg("100");
          A.beep({ f: 1100, f2: 1500, dur: 0.07, vol: 0.18 });
        }
      }
      for (const o of slags) {
        if (!o.alive) continue;
        const dx = o.x - pcx,
          dy = o.y - 7 - pcy;
        if (
          p.hammer > 0 &&
          Math.abs(dy) < 16 &&
          dx * p.face > -6 &&
          dx * p.face < 24
        ) {
          o.alive = false;
          g.score += 500;
          floatMsg("500");
          A.noise({ dur: 0.3, f: 1500, f2: 200, vol: 0.4 });
          continue;
        }
        if (Math.abs(dx) < 10 && Math.abs(dy) < 12) {
          die();
          return;
        }
      }
    }
    let fm = "",
      fmT = 0,
      fmX = 0,
      fmY = 0;
    function floatMsg(s) {
      fm = s;
      fmT = 0.8;
      fmX = p.x;
      fmY = p.y - 26;
    }

    // ------------------------------------------------------------------
    // Attract-mode AI
    // ------------------------------------------------------------------
    function demoInput() {
      input.l = input.r = input.u = input.d = false;
      if (p.st === "climb") {
        input.u = true;
        return;
      }
      if (p.st !== "walk") return;
      // danger: keg rolling at us on our girder → jump
      for (const b of kegs) {
        if (!b.alive || b.st !== "roll" || b.g !== p.g) continue;
        const dx = b.x - p.x;
        if (
          Math.abs(dx) < 34 &&
          Math.abs(dx) > 12 &&
          Math.sign(dx) === -b.dir &&
          p.hammer <= 0
        ) {
          g.jumpReq = true;
          return;
        }
      }
      let best = null,
        bd = 1e9;
      for (const l of LAD)
        if (!l.broken && l.g === p.g) {
          const d = Math.abs(l.x - p.x);
          if (d < bd) {
            bd = d;
            best = l;
          }
        }
      if (!best) {
        input.r = true;
        return;
      }
      if (p.hammer > 0) {
        input[p.x < 320 ? "r" : "l"] = true;
        return;
      }
      if (bd < 2) input.u = true;
      else if (best.x > p.x) input.r = true;
      else input.l = true;
    }

    // ------------------------------------------------------------------
    function update(dt) {
      g.t += dt;
      if (g.msgT > 0) g.msgT -= dt;
      if (fmT > 0) {
        fmT -= dt;
        fmY -= dt * 20;
      }
      if (g.drumFire > 0) g.drumFire -= dt;
      if (g.over) return;
      if (g.phase === "clear") {
        g.pt += dt;
        if (g.pt > 1.2 && g.bonus > 0) {
          const k = Math.min(g.bonus, 200);
          g.bonus -= k;
          g.score += k;
          if (((g.pt * 20) | 0) % 2) A.beep({ f: 1400, dur: 0.02, vol: 0.08 });
        }
        if (g.pt > 3.4 && g.bonus <= 0) {
          g.cleared++;
          g.level++;
          if (g.cleared >= 3) g.champion = true;
          resetStage();
        }
        return;
      }
      if (api.demo) demoInput();
      else {
        const k = api.held;
        input.l = k("ArrowLeft") || k("KeyA");
        input.r = k("ArrowRight") || k("KeyD");
        input.u = k("ArrowUp") || k("KeyW");
        input.d = k("ArrowDown") || k("KeyS");
      }
      // Goliath
      if (p.st !== "dead") {
        g.throwT -= dt;
        if (g.throwT <= 0.45 && g.throwAnim <= 0) g.throwAnim = 0.45;
        if (g.throwAnim > 0) {
          g.throwAnim -= dt;
          if (g.throwAnim <= 0) {
            throwKeg();
            g.throwT =
              Math.max(1.05, 2.7 - g.level * 0.3) * (0.75 + rnd() * 0.5);
          }
        }
        // bonus timer
        g.bonusT += dt;
        if (g.bonusT >= 2) {
          g.bonusT -= 2;
          g.bonus = Math.max(0, g.bonus - 100);
          if (g.bonus <= 0) die();
        }
      }
      for (const b of kegs) if (b.alive) updateKeg(b, dt);
      for (const o of slags) if (o.alive) updateSlag(o, dt);
      updatePlayer(dt);
      collide();
    }
    function key(code, rep) {
      if (code === "Space" || code === "KeyJ" || code === "Enter") {
        if (!rep) g.jumpReq = true;
        return true;
      }
      return false;
    }

    // ------------------------------------------------------------------
    function draw(c, t) {
      c.lineCap = "butt";
      // dusk glow + skyline far behind (depth), a few lit windows
      c.fillStyle = pal.A.magenta[1];
      c.fillRect(0, H - 170, W, 170);
      c.fillStyle = pal.A.orange[1];
      c.fillRect(0, H - 80, W, 80);
      c.fillStyle = pal.A.purple[3];
      for (let i = 0; i < 9; i++) {
        const x = 20 + i * 72,
          hh = 60 + ((i * 53) % 90);
        c.fillRect(x, H - hh, 46, hh);
      }
      c.fillStyle = pal.A.yellow[5];
      for (let i = 0; i < 9; i++) {
        const x = 20 + i * 72,
          hh = 60 + ((i * 53) % 90);
        for (let k = 0; k < 4; k++)
          if ((i + k) % 3)
            c.fillRect(x + 6 + (k % 2) * 24, H - hh + 10 + k * 12, 5, 4);
      }
      // girders
      for (let i = 0; i < GIRDERS.length; i++) {
        const gg = GIRDERS[i],
          x0 = gg[0],
          y0 = gg[1],
          x1 = gg[2],
          y1 = gg[3];
        c.strokeStyle = pal.red;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x0, y0);
        c.lineTo(x1, y1);
        c.moveTo(x0, y0 + 7);
        c.lineTo(x1, y1 + 7);
        c.stroke();
        c.strokeStyle = pal.A.orange[7];
        c.lineWidth = 1;
        c.beginPath();
        const n = Math.floor((x1 - x0) / 12);
        for (let k = 0; k < n; k++) {
          const xa = x0 + k * 12,
            xb = xa + 6,
            xc = xa + 12;
          c.moveTo(xa, gy(i, xa) + 7);
          c.lineTo(xb, gy(i, xb));
          c.lineTo(xc, gy(i, xc) + 7);
        }
        c.stroke();
      }
      // ladders
      c.strokeStyle = pal.A.cyan[8];
      c.lineWidth = 1.5;
      c.beginPath();
      for (const l of LAD) {
        const top = l.yT + 7,
          bot = l.yB;
        if (l.broken) {
          const m1 = top + (bot - top) * 0.3,
            m2 = top + (bot - top) * 0.62;
          c.moveTo(l.x - 5, top);
          c.lineTo(l.x - 5, m1);
          c.moveTo(l.x + 5, top);
          c.lineTo(l.x + 5, m1);
          c.moveTo(l.x - 5, m2);
          c.lineTo(l.x - 5, bot);
          c.moveTo(l.x + 5, m2);
          c.lineTo(l.x + 5, bot);
          for (let y = top + 4; y < bot; y += 7)
            if (y < m1 || y > m2) {
              c.moveTo(l.x - 5, y);
              c.lineTo(l.x + 5, y);
            }
        } else {
          c.moveTo(l.x - 5, top);
          c.lineTo(l.x - 5, bot);
          c.moveTo(l.x + 5, top);
          c.lineTo(l.x + 5, bot);
          for (let y = top + 4; y < bot; y += 7) {
            c.moveTo(l.x - 5, y);
            c.lineTo(l.x + 5, y);
          }
        }
      }
      c.stroke();
      // the rivet forge (a coal drum)
      const dy = gy(0, DRUM_X);
      c.fillStyle = pal.A.grey[6];
      c.strokeStyle = pal.silver;
      c.lineWidth = 1.5;
      c.fillRect(DRUM_X - 10, dy - 22, 20, 22);
      c.strokeRect(DRUM_X - 10, dy - 22, 20, 22);
      c.beginPath();
      c.moveTo(DRUM_X - 10, dy - 15);
      c.lineTo(DRUM_X + 10, dy - 15);
      c.moveTo(DRUM_X - 10, dy - 7);
      c.lineTo(DRUM_X + 10, dy - 7);
      c.stroke();
      const fh = 6 + (g.drumFire > 0 ? 10 : 0) + Math.sin(t * 17) * 3;
      c.fillStyle = ((t * 12) | 0) % 2 ? pal.yellow : pal.orange;
      c.beginPath();
      c.moveTo(DRUM_X - 8, dy - 22);
      c.lineTo(DRUM_X - 4, dy - 22 - fh);
      c.lineTo(DRUM_X, dy - 24);
      c.lineTo(DRUM_X + 4, dy - 22 - fh * 0.8);
      c.lineTo(DRUM_X + 8, dy - 22);
      c.closePath();
      c.fill();
      // sledgehammers
      for (const q of pows)
        if (!q.taken)
          c.drawImage(SC.hammer[((t * 3) | 0) % 2], q.x - 8, gy(q.g, q.x) - 20);
      // the foreman on the topping-out beam (+ the bell and the flag pole)
      const ly = gy(6, 300);
      c.drawImage(SC.foreman[1], 292, ly - 16);
      c.strokeStyle = pal.silver;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(352, ly);
      c.lineTo(352, ly - 40);
      c.stroke();
      c.fillStyle = pal.yellow;
      c.beginPath();
      c.moveTo(250, ly - 22);
      c.quadraticCurveTo(250, ly - 32, 256, ly - 32);
      c.quadraticCurveTo(262, ly - 32, 262, ly - 22);
      c.closePath();
      c.fill();
      c.strokeStyle = pal.yellow;
      c.beginPath();
      c.moveTo(256, ly - 32);
      c.lineTo(256, ly - 36);
      c.stroke();
      const fk = g.phase === "clear" ? Math.min(1, g.pt / 1.2) : 0,
        fy = ly - 10 - fk * 28,
        wave = Math.sin(t * 9) * 2;
      c.fillStyle = pal.red;
      c.fillRect(353, fy - 10, 16, 4);
      c.fillStyle = pal.white;
      c.fillRect(353, fy - 6, 16 + wave * 0.5, 3);
      c.fillStyle = pal.blue;
      c.fillRect(353, fy - 3, 16 + wave, 4);
      if (g.phase !== "clear" && ((t * 2) | 0) % 2) {
        c.font = api.fonts.s;
        c.fillStyle = pal.yellow;
        c.textAlign = "center";
        c.textBaseline = "bottom";
        c.fillText("UP HERE!", 300, ly - 18);
      }
      if (g.phase === "clear" && ((t * 6) | 0) % 2) {
        c.font = api.fonts.s;
        c.fillStyle = pal.yellow;
        c.textAlign = "center";
        c.textBaseline = "bottom";
        c.fillText("DING! DING!", 256, ly - 38);
      }
      drawGoliath(c, t);
      // red-hot rivet kegs: wood staves, glowing iron hoops, a rolling bung
      for (const b of kegs) {
        if (!b.alive) continue;
        c.beginPath();
        c.arc(b.x, b.y, 7, 0, Math.PI * 2);
        c.fillStyle = pal.brown;
        c.fill();
        c.strokeStyle = ((t * 8) | 0) % 2 ? pal.orange : pal.yellow;
        c.lineWidth = 1.5;
        c.stroke();
        c.strokeStyle = pal.A.orange[8];
        c.lineWidth = 1;
        for (let k = 0; k < 2; k++) {
          const a = b.rot + k * Math.PI;
          c.beginPath();
          c.moveTo(b.x + Math.cos(a) * 6.5, b.y + Math.sin(a) * 6.5);
          c.lineTo(b.x - Math.cos(a) * 6.5, b.y - Math.sin(a) * 6.5);
          c.stroke();
        }
        c.fillStyle = pal.yellow;
        c.fillRect(
          b.x + Math.cos(b.rot + 1.6) * 3.5 - 1.5,
          b.y + Math.sin(b.rot + 1.6) * 3.5 - 1.5,
          3,
          3,
        );
      }
      for (const o of slags)
        if (o.alive)
          c.drawImage(
            SC.slag[((t * 5) | 0) % 2],
            o.x - 8,
            o.y - 15 + Math.sin(o.t * 9),
          );
      drawPlayer(c, t);
      if (fmT > 0) {
        c.font = api.fonts.s;
        c.fillStyle = pal.yellow;
        c.textAlign = "center";
        c.textBaseline = "bottom";
        c.fillText(fm, fmX, fmY);
      }
      // HUD
      c.font = api.fonts.m;
      c.textBaseline = "top";
      c.textAlign = "left";
      c.fillStyle = pal.white;
      c.fillText("SCORE " + g.score, 10, 6);
      c.fillStyle = pal.cyan;
      c.textAlign = "right";
      c.fillText("L=" + g.level, W - 10, 6);
      for (let i = 0; i < g.lives - 1 && i < 6; i++)
        c.drawImage(SC.stand[1], W - 70 - i * 18, 8);
      c.strokeStyle = pal.magenta;
      c.lineWidth = 1.5;
      c.strokeRect(518.5, 30.5, 110, 38);
      c.fillStyle = pal.magenta;
      c.textAlign = "center";
      c.font = api.fonts.s;
      c.fillText("BONUS", 573, 32);
      c.font = api.fonts.m;
      c.fillStyle = g.bonus <= 1000 && ((t * 4) | 0) % 2 ? pal.red : pal.yellow;
      c.fillText(String(g.bonus), 573, 46);
      if (g.msgT > 0) {
        c.font = api.fonts.l;
        c.textBaseline = "middle";
        c.fillStyle = ((t * 5) | 0) % 2 ? pal.yellow : pal.cyan;
        c.fillText(g.msg, W / 2, 250);
      }
    }
    function drawPlayer(c, t) {
      let spr,
        flip = p.face < 0,
        blink = false;
      if (p.st === "dead") {
        spr = "jump";
        flip = ((p.deadT * 8) | 0) % 2 === 0;
        blink = p.deadT > 1.2 && ((t * 10) | 0) % 2;
      } else if (p.st === "climb") {
        spr = "climb";
        flip = ((p.anim * 6) | 0) % 2 === 0;
      } else if (p.st === "jump" || p.st === "fall") spr = "jump";
      else
        spr = ((p.anim * 8) | 0) % 2 && (input.l || input.r) ? "walk" : "stand";
      if (blink) return;
      const img = SC[spr][1];
      c.save();
      c.translate(p.x, p.y - 16);
      if (flip) c.scale(-1, 1);
      c.drawImage(img, -7, 0);
      if (p.hammer > 0 && p.st === "walk") {
        const up = ((t * 8) | 0) % 2;
        c.drawImage(
          SC.hammer[p.hammer < 2 && ((t * 8) | 0) % 2 ? 0 : 1],
          6,
          up ? -10 : 2,
          10,
          10,
        );
      }
      c.restore();
    }
    // Goliath: a riveted steam boiler on stumpy legs, smokestack, pressure gauge, glowing firebox eyes
    function drawGoliath(c, t) {
      const x = 48,
        base = gy(5, 48),
        arms = g.throwAnim > 0 ? -1 : 0,
        stomp = Math.sin(t * 3) > 0.9 ? 1 : 0;
      c.fillStyle = pal.A.grey[8];
      c.strokeStyle = pal.silver;
      c.lineWidth = 1.5;
      // legs
      c.fillRect(x - 12, base - 14, 8, 14 - stomp);
      c.fillRect(x + 4, base - 14 + stomp, 8, 14 - stomp);
      c.strokeRect(x - 12, base - 14, 8, 14 - stomp);
      c.strokeRect(x + 4, base - 14 + stomp, 8, 14 - stomp);
      // boiler body + rivet rows + pressure gauge
      c.fillStyle = pal.A.blue[6];
      c.fillRect(x - 17, base - 42, 34, 28);
      c.strokeRect(x - 17, base - 42, 34, 28);
      c.fillStyle = pal.silver;
      for (let k = 0; k < 6; k++) {
        c.fillRect(x - 15 + k * 6, base - 40, 1.5, 1.5);
        c.fillRect(x - 15 + k * 6, base - 17, 1.5, 1.5);
      }
      c.fillStyle = pal.white;
      c.beginPath();
      c.arc(x, base - 28, 6, 0, Math.PI * 2);
      c.fill();
      const nd = -2.2 + Math.sin(t * 2) * 0.6 + (arms ? 1.4 : 0);
      c.strokeStyle = pal.red;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(x, base - 28);
      c.lineTo(x + Math.cos(nd) * 5, base - 28 + Math.sin(nd) * 5);
      c.stroke();
      // head (firebox) + smokestack + puffs
      c.strokeStyle = pal.silver;
      c.fillStyle = pal.A.grey[8];
      c.fillRect(x - 10, base - 58, 20, 16);
      c.strokeRect(x - 10, base - 58, 20, 16);
      c.fillStyle = ((t * 3) | 0) % 2 ? pal.yellow : pal.orange;
      c.fillRect(x - 6, base - 53, 4, 4);
      c.fillRect(x + 2, base - 53, 4, 4);
      c.fillStyle = pal.red;
      c.fillRect(x - 5, base - 46, 10, 2);
      c.fillStyle = pal.A.grey[9];
      c.fillRect(x + 3, base - 70, 5, 12);
      for (let k = 0; k < 3; k++) {
        const q = (t * 0.9 + k / 3) % 1;
        c.fillStyle = pal.A.white[Math.max(1, Math.round((1 - q) * 5))];
        c.beginPath();
        c.arc(x + 6 + q * 10, base - 72 - q * 22, 2 + q * 5, 0, Math.PI * 2);
        c.fill();
      }
      // arms (raised when throwing)
      c.strokeStyle = pal.silver;
      c.lineWidth = 4;
      c.beginPath();
      if (arms) {
        c.moveTo(x - 17, base - 38);
        c.lineTo(x - 24, base - 56);
        c.moveTo(x + 17, base - 38);
        c.lineTo(x + 24, base - 56);
      } else {
        c.moveTo(x - 17, base - 38);
        c.lineTo(x - 26, base - 22);
        c.moveTo(x + 17, base - 38);
        c.lineTo(x + 28, base - 24);
      }
      c.stroke();
      c.lineWidth = 1.5;
      if (arms) {
        c.beginPath();
        c.arc(x, base - 68, 7, 0, Math.PI * 2);
        c.fillStyle = pal.brown;
        c.fill();
        c.strokeStyle = pal.orange;
        c.stroke();
      }
    }

    resetStage();
    return {
      update,
      draw,
      key,
      get score() {
        return g.score;
      },
      get over() {
        return g.over;
      },
      set over(v) {
        g.over = !!v;
      },
      get won() {
        return false;
      },
      get champion() {
        return g.champion;
      },
      _g: g,
      _p: p,
      _kegs: kegs,
    };
  }

