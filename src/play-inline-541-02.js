// play-inline-541 02 — alive
// Lines 33-912 of readable/play-inline-541.pretty.js (statement-aligned).
  function create(api) {
    const A = api.audio,
      pal = api.pal,
      rnd = api.rnd,
      N = A.N;
    const g = {
      score: 0,
      over: false,
      won: false,
      champion: false,
      wave: 0,
      phase: "intro",
      pt: 0,
      mult: 1,
      spawnLeft: 0,
      spawnT: 0,
      interval: 1.5,
      speed: 30,
      mirv: 0,
      bombers: false,
      nextBonus: 10000,
      msg: "",
      msgT: 0,
      t: 0,
      aiT: 0.5,
      shake: 0,
      tally: { i: 0, t: 0, ammo: 0, cities: 0, stage: 0 },
    };
    const cur = { x: W / 2, y: 230 };
    const cities = CITY_X.map((x, i) => ({
      x,
      kind: CITY_KIND[i],
      s: CITY_S[i],
      alive: true,
      deadT: 0,
    }));
    const bats = BAT_X.map((x, i) => ({
      x,
      y: GROUND - 16,
      ammo: 10,
      alive: true,
      speed: i === 1 ? 760 : 500,
    }));
    const en = [];
    for (let i = 0; i < MAX_E; i++)
      en.push({
        alive: false,
        x0: 0,
        y0: 0,
        x: 0,
        y: 0,
        tx: 0,
        ty: 0,
        vx: 0,
        vy: 0,
        splitY: -1,
        tk: 0,
        ti: 0,
        claimed: false,
      });
    const shots = [];
    for (let i = 0; i < MAX_S; i++)
      shots.push({
        alive: false,
        sx: 0,
        sy: 0,
        x: 0,
        y: 0,
        tx: 0,
        ty: 0,
        dist: 0,
        trav: 0,
        speed: 0,
      });
    const booms = [];
    for (let i = 0; i < MAX_B; i++)
      booms.push({
        alive: false,
        x: 0,
        y: 0,
        t: 0,
        max: 0,
        player: false,
        r: 0,
      });
    const bomber = { alive: false, x: 0, y: 0, vx: 0, dropT: 0 };
    const stars = new Float32Array(60 * 3);
    for (let i = 0; i < 60; i++) {
      stars[i * 3] = rnd() * W;
      stars[i * 3 + 1] = 30 + rnd() * 300;
      stars[i * 3 + 2] = rnd();
    }
    // ground profile (mounds under the batteries)
    const ground = [];
    for (let x = 0; x <= W; x += 8) {
      let y = GROUND;
      for (const b of BAT_X) {
        const d = Math.abs(x - b);
        if (d < 44)
          y = Math.min(y, GROUND - 16 * Math.cos(((d / 44) * Math.PI) / 2));
      }
      y += Math.sin(x * 0.11) * 1.5;
      ground.push(x, y);
    }

    // ------------------------------------------------------------------
    function aliveCities() {
      let n = 0;
      for (const c of cities) if (c.alive) n++;
      return n;
    }
    function pickTarget(e) {
      // 70 % landmarks, 30 % batteries; dead targets still get hit (rubble)
      if (rnd() < 0.7) {
        const i = (rnd() * 6) | 0;
        e.tk = 0;
        e.ti = i;
        e.tx = cities[i].x + (rnd() - 0.5) * 16;
        e.ty = GROUND - 2;
      } else {
        const i = (rnd() * 3) | 0;
        e.tk = 1;
        e.ti = i;
        e.tx = bats[i].x;
        e.ty = bats[i].y;
      }
    }
    function spawnEnemy(x0, y0, keepTarget, speed) {
      for (const e of en) {
        if (e.alive) continue;
        e.alive = true;
        e.claimed = false;
        e.x0 = e.x = x0;
        e.y0 = e.y = y0;
        if (!keepTarget) pickTarget(e);
        else {
          e.tk = keepTarget.tk;
          e.ti = keepTarget.ti;
          e.tx = keepTarget.tx;
          e.ty = keepTarget.ty;
        }
        const dx = e.tx - x0,
          dy = e.ty - y0,
          d = Math.hypot(dx, dy) || 1;
        e.vx = (dx / d) * speed;
        e.vy = (dy / d) * speed;
        e.splitY =
          !keepTarget && g.mirv > 0 && rnd() < g.mirv ? 110 + rnd() * 130 : -1;
        return e;
      }
      return null;
    }
    function boom(x, y, max, player) {
      for (const b of booms) {
        if (b.alive) continue;
        b.alive = true;
        b.x = x;
        b.y = y;
        b.t = 0;
        b.max = max;
        b.player = player;
        b.r = 0;
        return b;
      }
      return null;
    }
    function nearestBat(tx) {
      let best = -1,
        bd = 1e9;
      for (let i = 0; i < 3; i++) {
        const b = bats[i];
        if (!b.alive || b.ammo <= 0) continue;
        const d = Math.abs(b.x - tx) - (i === 1 ? 60 : 0);
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
      return best;
    }
    function fire(bi, tx, ty) {
      if (g.phase !== "wave" && g.phase !== "intro") return false;
      const b = bats[bi];
      if (!b || !b.alive || b.ammo <= 0) {
        A.beep({ f: 120, dur: 0.06, vol: 0.2 });
        return false;
      }
      ty = Math.min(ty, GROUND - 34);
      for (const s of shots) {
        if (s.alive) continue;
        s.alive = true;
        s.sx = b.x;
        s.sy = b.y - 6;
        s.x = s.sx;
        s.y = s.sy;
        s.tx = tx;
        s.ty = ty;
        s.dist = Math.hypot(tx - s.sx, ty - s.sy);
        s.trav = 0;
        s.speed = b.speed;
        b.ammo--;
        A.beep({ f: 300, f2: 1400, dur: 0.12, vol: 0.22, type: "sawtooth" });
        return true;
      }
      return false;
    }
    function fireNearest() {
      const bi = nearestBat(cur.x);
      if (bi >= 0) fire(bi, cur.x, cur.y);
      else A.beep({ f: 110, dur: 0.08, vol: 0.2 });
    }

    function startWave() {
      g.wave++;
      const w = g.wave;
      g.spawnLeft = Math.min(34, 10 + w * 2);
      g.speed = Math.min(95, 26 + w * 7);
      g.interval = Math.max(0.45, 1.7 - w * 0.13);
      g.mirv = w >= 2 ? Math.min(0.4, 0.06 * w) : 0;
      g.bombers = w >= 3;
      g.mult = Math.min(6, Math.ceil(w / 2));
      g.spawnT = 1.6;
      for (const b of bats) {
        b.alive = true;
        b.ammo = 10;
      }
      g.phase = "intro";
      g.pt = 0;
      g.msg = "WAVE " + w + "    " + g.mult + "X POINTS";
      g.msgT = 2.2;
      A.seq(
        [
          [N(-2), 0.1],
          [N(3), 0.1],
          [N(7), 0.1],
          [N(10), 0.18],
        ],
        { vol: 0.25 },
      );
    }

    function hitTarget(e) {
      boom(e.x, e.y, 24, false);
      A.noise({ dur: 0.5, f: 1200, f2: 90, vol: 0.55 });
      g.shake = Math.max(g.shake, 4);
      if (e.tk === 0) {
        const c = cities[e.ti];
        if (c.alive && Math.abs(e.x - c.x) < c.s * 0.8) {
          c.alive = false;
          c.deadT = 0;
          A.noise({ dur: 1.2, f: 600, f2: 40, vol: 0.7 });
          g.shake = 8;
        }
      } else {
        const b = bats[e.ti];
        if (b.alive) {
          b.alive = false;
          b.ammo = 0;
        }
      }
    }

    function killEnemy(e, byBoom) {
      e.alive = false;
      g.score += 25 * g.mult;
      boom(e.x, e.y, 28, true);
      A.noise({ dur: 0.25, f: 2600, f2: 300, vol: 0.35 });
      if (byBoom) A.beep({ f: 900 + rnd() * 400, dur: 0.04, vol: 0.12 });
    }

    // ------------------------------------------------------------------
    function update(dt) {
      g.t += dt;
      if (g.shake > 0) g.shake = Math.max(0, g.shake - dt * 18);
      if (g.msgT > 0) g.msgT -= dt;
      for (const c of cities) if (!c.alive) c.deadT += dt;
      if (g.over) {
        updateBooms(dt);
        return;
      }

      // cursor
      if (!api.demo) {
        const m = api.mouse,
          k = api.held;
        let mx = 0,
          my = 0;
        if (k("ArrowLeft") || k("KeyA")) mx -= 1;
        if (k("ArrowRight") || k("KeyD")) mx += 1;
        if (k("ArrowUp") || k("KeyW")) my -= 1;
        if (k("ArrowDown") || k("KeyS")) my += 1;
        cur.x += mx * 380 * dt;
        cur.y += my * 380 * dt;
        if (m.inside && (m.moved || m.down)) {
          cur.x = m.x;
          cur.y = m.y;
        }
        if (m.pressed) fireNearest();
      } else demoAI(dt);
      cur.x = Math.max(6, Math.min(W - 6, cur.x));
      cur.y = Math.max(40, Math.min(GROUND - 40, cur.y));

      if (g.phase === "start") {
        startWave();
      }
      if (g.phase === "intro") {
        g.pt += dt;
        if (g.pt > 1.4) g.phase = "wave";
      }

      if (g.phase === "wave") {
        g.spawnT -= dt;
        if (g.spawnT <= 0 && g.spawnLeft > 0) {
          const burst = Math.min(
            g.spawnLeft,
            1 + ((rnd() * (g.wave >= 3 ? 3 : 2)) | 0),
          );
          for (let i = 0; i < burst; i++) {
            if (
              spawnEnemy(
                20 + rnd() * (W - 40),
                -4,
                null,
                g.speed * (0.85 + rnd() * 0.3),
              )
            )
              g.spawnLeft--;
          }
          g.spawnT = g.interval * (0.6 + rnd() * 0.8);
        }
        if (
          g.bombers &&
          !bomber.alive &&
          g.spawnLeft > 2 &&
          rnd() < dt * 0.09
        ) {
          bomber.alive = true;
          const left = rnd() < 0.5;
          bomber.x = left ? -30 : W + 30;
          bomber.vx = (left ? 1 : -1) * (50 + g.wave * 4);
          bomber.y = 90 + rnd() * 90;
          bomber.dropT = 1.2;
        }
      }
      if (bomber.alive) {
        bomber.x += bomber.vx * dt;
        bomber.dropT -= dt;
        if (
          bomber.dropT <= 0 &&
          g.spawnLeft > 0 &&
          bomber.x > 40 &&
          bomber.x < W - 40
        ) {
          bomber.dropT = 1.5 + rnd();
          if (spawnEnemy(bomber.x, bomber.y + 6, null, g.speed * 1.1))
            g.spawnLeft--;
          A.beep({ f: 220, f2: 160, dur: 0.1, vol: 0.15 });
        }
        if (bomber.x < -40 || bomber.x > W + 40) bomber.alive = false;
        if (((g.t * 6) | 0) % 2 === 0 && rnd() < dt * 20)
          A.beep({
            f: 180 + Math.sin(g.t * 20) * 40,
            dur: 0.05,
            vol: 0.05,
            type: "triangle",
          });
      }

      // enemies
      for (const e of en) {
        if (!e.alive) continue;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (e.splitY > 0 && e.y >= e.splitY) {
          e.splitY = -1;
          const kids = 1 + ((rnd() * 2) | 0);
          const sp = Math.hypot(e.vx, e.vy);
          for (let i = 0; i < kids; i++) spawnEnemy(e.x, e.y, null, sp);
          A.beep({ f: 700, f2: 300, dur: 0.12, vol: 0.12 });
        }
        if (e.y >= e.ty) {
          e.alive = false;
          hitTarget(e);
        }
      }
      // interceptors
      for (const s of shots) {
        if (!s.alive) continue;
        s.trav += s.speed * dt;
        const u = Math.min(1, s.trav / (s.dist || 1));
        s.x = s.sx + (s.tx - s.sx) * u;
        s.y = s.sy + (s.ty - s.sy) * u;
        if (u >= 1) {
          s.alive = false;
          boom(s.tx, s.ty, 36, true);
          A.noise({ dur: 0.35, f: 2200, f2: 200, vol: 0.4 });
        }
      }
      updateBooms(dt);

      // game over / wave end
      if (g.phase !== "end" && aliveCities() === 0) {
        g.phase = "end";
        g.pt = 0;
        A.noise({ dur: 2.4, f: 400, f2: 30, vol: 0.8 });
      }
      if (g.phase === "end") {
        g.pt += dt;
        if (g.pt > 3.2) g.over = true;
        return;
      }
      if (
        g.phase === "wave" &&
        g.spawnLeft <= 0 &&
        !bomber.alive &&
        !anyAlive(en) &&
        !anyAlive(shots) &&
        !anyAlive(booms)
      ) {
        g.phase = "tally";
        const T = g.tally;
        T.i = 0;
        T.t = 0;
        T.stage = 0;
        T.ammo = 0;
        T.cities = 0;
      }
      if (g.phase === "tally") updateTally(dt);
    }
    function anyAlive(arr) {
      for (const o of arr) if (o.alive) return true;
      return false;
    }

    function updateBooms(dt) {
      for (const b of booms) {
        if (!b.alive) continue;
        b.t += dt;
        const grow = 0.45,
          hold = 0.25,
          shrink = 0.5;
        b.r =
          b.max *
          (b.t < grow
            ? b.t / grow
            : b.t < grow + hold
              ? 1
              : Math.max(0, 1 - (b.t - grow - hold) / shrink));
        if (b.t > grow + hold + shrink) {
          b.alive = false;
          continue;
        }
        if (!b.player || g.over) continue;
        const r2 = b.r * b.r;
        for (const e of en) {
          if (!e.alive) continue;
          const dx = e.x - b.x,
            dy = e.y - b.y;
          if (dx * dx + dy * dy < r2) killEnemy(e, true);
        }
        if (bomber.alive) {
          const dx = bomber.x - b.x,
            dy = bomber.y - b.y;
          if (dx * dx + dy * dy < r2 + 120) {
            bomber.alive = false;
            g.score += 150 * g.mult;
            boom(bomber.x, bomber.y, 34, true);
            A.noise({ dur: 0.6, f: 1800, f2: 80, vol: 0.5 });
            g.msg = "MOTHERSHIP DOWN  +" + 150 * g.mult;
            g.msgT = 1.4;
          }
        }
      }
    }

    function updateTally(dt) {
      const T = g.tally;
      T.t += dt;
      if (T.stage === 0) {
        // flak shells left
        if (T.t > 0.06) {
          T.t = 0;
          let found = false;
          for (const b of bats)
            if (b.ammo > 0) {
              b.ammo--;
              T.ammo++;
              g.score += 5 * g.mult;
              found = true;
              A.beep({ f: 1200, dur: 0.03, vol: 0.12 });
              break;
            }
          if (!found) {
            T.stage = 1;
            T.t = -0.3;
          }
        }
      } else if (T.stage === 1) {
        // surviving buildings
        if (T.t > 0.22) {
          T.t = 0;
          if (T.i < 6) {
            if (cities[T.i].alive) {
              T.cities++;
              g.score += 100 * g.mult;
              A.beep({ f: 520 + T.cities * 70, dur: 0.1, vol: 0.2 });
            }
            T.i++;
          } else {
            T.stage = 2;
            T.t = 0;
          }
        }
      } else if (T.stage === 2 && T.t > 1.3) {
        while (g.score >= g.nextBonus) {
          g.nextBonus += 10000;
          const dead = cities.find((c) => !c.alive);
          if (dead) {
            dead.alive = true;
            g.msg = "LANDMARK REBUILT!";
            g.msgT = 2;
            A.seq(
              [
                [N(15), 0.08],
                [N(19), 0.08],
                [N(22), 0.16],
              ],
              { vol: 0.25 },
            );
          }
        }
        if (g.wave >= 5 && !g.champion) g.champion = true;
        startWave();
      }
    }

    // Attract-mode AI: targets the lowest falling bomb with a lead.
    function demoAI(dt) {
      g.aiT -= dt;
      if (g.phase === "end") return;
      let best = null;
      for (const e of en)
        if (e.alive && !e.claimed && e.y > 40 && (!best || e.y > best.y))
          best = e;
      if (best) {
        cur.x += (best.x - cur.x) * Math.min(1, dt * 8);
        cur.y += (best.y + 40 - cur.y) * Math.min(1, dt * 8);
      }
      if (g.aiT > 0 || !best) return;
      g.aiT = 0.3 + rnd() * 0.35;
      const bi = nearestBat(best.x);
      if (bi < 0) return;
      const b = bats[bi];
      let px = best.x,
        py = best.y;
      for (let k = 0; k < 2; k++) {
        const t = Math.hypot(px - b.x, py - b.y) / b.speed + 0.25;
        px = best.x + best.vx * t;
        py = best.y + best.vy * t;
      }
      best.claimed = true;
      cur.x = px;
      cur.y = py;
      fire(bi, px + (rnd() - 0.5) * 12, py);
    }

    function key(code, rep) {
      if (code === "Space" || code === "Enter" || code === "KeyF") {
        if (!rep) fireNearest();
        return true;
      }
      if (code === "Digit1" || code === "KeyZ") {
        if (!rep) fire(0, cur.x, cur.y);
        return true;
      }
      if (code === "Digit2" || code === "KeyX") {
        if (!rep) fire(1, cur.x, cur.y);
        return true;
      }
      if (code === "Digit3" || code === "KeyC") {
        if (!rep) fire(2, cur.x, cur.y);
        return true;
      }
      return false;
    }

    // ------------------------------------------------------------------
    function draw(c, t) {
      const sx = g.shake ? (rnd() - 0.5) * g.shake : 0,
        sy = g.shake ? (rnd() - 0.5) * g.shake : 0;
      c.setTransform(1, 0, 0, 1, sx, sy);
      // night sky glow band + stars
      c.fillStyle = pal.A.purple[1];
      c.fillRect(0, GROUND - 140, W, 140);
      c.fillStyle = pal.A.magenta[1];
      c.fillRect(0, GROUND - 60, W, 60);
      for (let i = 0; i < 60; i++) {
        const tw = stars[i * 3 + 2];
        c.fillStyle = (
          i % 7 === 0 ? pal.A.yellow : i % 5 === 0 ? pal.A.cyan : pal.A.white
        )[3 + (((t * 2 + tw * 10) | 0) % 4)];
        c.fillRect(stars[i * 3], stars[i * 3 + 1], 1.5, 1.5);
      }
      // landmarks: steel-blue bodies, cyan outlines, lit yellow windows
      for (let i = 0; i < 6; i++) {
        const ct = cities[i];
        if (ct.alive)
          AR.drawLandmark(
            c,
            ct.kind,
            ct.x,
            GROUND,
            ct.s,
            pal.A.blue[4],
            pal.cyan,
            { detail: pal.yellow, lw: 1.3, seed: i },
          );
        else drawRubble(c, ct, t);
      }
      // ground
      c.beginPath();
      c.moveTo(0, H);
      for (let i = 0; i < ground.length; i += 2)
        c.lineTo(ground[i], ground[i + 1]);
      c.lineTo(W, H);
      c.closePath();
      c.fillStyle = pal.A.brown[6];
      c.fill();
      c.strokeStyle = pal.orange;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(ground[0], ground[1]);
      for (let i = 2; i < ground.length; i += 2)
        c.lineTo(ground[i], ground[i + 1]);
      c.stroke();
      // batteries + ammo pyramids
      for (let i = 0; i < 3; i++) {
        const b = bats[i];
        if (!b.alive) {
          c.strokeStyle = pal.grey;
          c.beginPath();
          c.moveTo(b.x - 8, b.y - 8);
          c.lineTo(b.x + 8, b.y + 4);
          c.moveTo(b.x + 8, b.y - 8);
          c.lineTo(b.x - 8, b.y + 4);
          c.stroke();
          continue;
        }
        let k = 0;
        c.fillStyle = pal.yellow;
        for (let row = 0; row < 4; row++)
          for (let j = 0; j <= row; j++) {
            if (k++ >= b.ammo) continue;
            c.fillRect(
              b.x - row * 5 + j * 10 - 1.5,
              b.y + 2 + row * 6 - 12,
              3,
              5,
            );
          }
      }
      // bomb trails (hot magenta) + flickering heads
      c.lineWidth = 1.6;
      c.strokeStyle = pal.A.magenta[7];
      c.beginPath();
      for (const e of en) {
        if (!e.alive) continue;
        c.moveTo(e.x0, e.y0);
        c.lineTo(e.x, e.y);
      }
      c.stroke();
      c.fillStyle = ((t * 16) | 0) % 2 ? pal.white : pal.red;
      for (const e of en) if (e.alive) c.fillRect(e.x - 2, e.y - 2, 4, 4);
      // interceptors (cyan)
      c.strokeStyle = pal.cyan;
      c.lineWidth = 1.2;
      c.beginPath();
      for (const s of shots) {
        if (!s.alive) continue;
        c.moveTo(s.sx, s.sy);
        c.lineTo(s.x, s.y);
        c.moveTo(s.tx - 4, s.ty - 4);
        c.lineTo(s.tx + 4, s.ty + 4);
        c.moveTo(s.tx + 4, s.ty - 4);
        c.lineTo(s.tx - 4, s.ty + 4);
      }
      c.stroke();
      // the mothership: silver saucer, glass dome, chasing rim lights
      if (bomber.alive) {
        const x = bomber.x,
          y = bomber.y;
        c.fillStyle = pal.A.cyan[6];
        c.beginPath();
        c.ellipse(x, y - 5, 7, 6, 0, Math.PI, 0);
        c.fill();
        c.fillStyle = pal.silver;
        c.strokeStyle = pal.white;
        c.lineWidth = 1;
        c.beginPath();
        c.ellipse(x, y, 18, 5, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        for (let k = 0; k < 5; k++) {
          c.fillStyle =
            (((t * 10) | 0) + k) % 3 === 0 ? pal.yellow : pal.magenta;
          c.fillRect(x - 12 + k * 6 - 1, y - 1, 2.5, 2.5);
        }
      }
      // explosions: yellow / orange / white flicker with a hot core
      for (const b of booms) {
        if (!b.alive || b.r <= 0.5) continue;
        const f = ((t * 24 + b.x) | 0) % 3;
        c.beginPath();
        c.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        c.fillStyle = f === 0 ? pal.yellow : f === 1 ? pal.orange : pal.white;
        c.fill();
        if (b.r > 6) {
          c.beginPath();
          c.arc(b.x, b.y, b.r * 0.45, 0, Math.PI * 2);
          c.fillStyle = pal.A.white[8];
          c.fill();
        }
      }
      // cursor
      if (g.phase !== "end") {
        c.strokeStyle = pal.white;
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(cur.x - 10, cur.y);
        c.lineTo(cur.x - 3, cur.y);
        c.moveTo(cur.x + 3, cur.y);
        c.lineTo(cur.x + 10, cur.y);
        c.moveTo(cur.x, cur.y - 10);
        c.lineTo(cur.x, cur.y - 3);
        c.moveTo(cur.x, cur.y + 3);
        c.lineTo(cur.x, cur.y + 10);
        c.stroke();
      }
      c.setTransform(1, 0, 0, 1, 0, 0);
      // HUD
      c.font = api.fonts.m;
      c.textBaseline = "top";
      c.fillStyle = pal.white;
      c.textAlign = "left";
      c.fillText("SCORE " + g.score, 12, 8);
      c.fillStyle = pal.yellow;
      c.textAlign = "center";
      c.fillText(
        "HI " + Math.max(g.score, AR.allTimeBest("skypatrol")),
        W / 2,
        8,
      );
      c.fillStyle = pal.cyan;
      c.textAlign = "right";
      c.fillText(
        "WAVE " + Math.max(1, g.wave) + "  " + g.mult + "X",
        W - 12,
        8,
      );
      c.textBaseline = "middle";
      c.textAlign = "center";
      if (g.msgT > 0 && g.phase !== "tally") {
        c.font = api.fonts.l;
        c.fillStyle = ((t * 5) | 0) % 2 ? pal.yellow : pal.magenta;
        c.fillText(g.msg, W / 2, 190);
      }
      if (g.phase === "tally") {
        c.font = api.fonts.l;
        c.fillStyle = pal.yellow;
        c.fillText("BONUS POINTS", W / 2, 150);
        c.font = api.fonts.m;
        c.fillStyle = pal.cyan;
        c.fillText(
          "FLAK SHELLS " + g.tally.ammo + " x " + 5 * g.mult,
          W / 2,
          196,
        );
        c.fillText(
          "LANDMARKS " + g.tally.cities + " x " + 100 * g.mult,
          W / 2,
          222,
        );
      }
      if (g.phase === "end") drawEnd(c, t);
    }
    function drawRubble(c, ct, t) {
      const x = ct.x,
        w = ct.s * 0.9;
      c.fillStyle = pal.A.grey[5];
      c.strokeStyle = pal.orange;
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(x - w, GROUND);
      c.lineTo(x - w * 0.6, GROUND - 6);
      c.lineTo(x - w * 0.3, GROUND - 3);
      c.lineTo(x, GROUND - 9);
      c.lineTo(x + w * 0.35, GROUND - 4);
      c.lineTo(x + w * 0.7, GROUND - 7);
      c.lineTo(x + w, GROUND);
      c.closePath();
      c.fill();
      c.stroke();
      // smoke column
      for (let i = 0; i < 4; i++) {
        const k = (ct.deadT * 0.5 + i / 4) % 1;
        c.beginPath();
        c.arc(
          x + Math.sin(t + i * 2) * 3,
          GROUND - 10 - k * 50,
          3 + k * 7,
          0,
          Math.PI * 2,
        );
        c.fillStyle = pal.A.grey[Math.max(1, 5 - ((k * 4) | 0))];
        c.fill();
      }
    }
    function drawEnd(c, t) {
      const k = Math.min(1, g.pt / 1.8),
        x = W / 2,
        base = GROUND;
      // the invasion lands: the mothership's beam sweeps the empty city
      c.fillStyle = pal.A.cyan[3];
      c.beginPath();
      c.moveTo(x - 10, base - 260 * k);
      c.lineTo(x - 90 * k - 10, base);
      c.lineTo(x + 90 * k + 10, base);
      c.lineTo(x + 10, base - 260 * k);
      c.closePath();
      c.fill();
      c.fillStyle = pal.silver;
      c.beginPath();
      c.ellipse(
        x,
        base - 262 * k - 8,
        40 + 30 * k,
        10 + 6 * k,
        0,
        0,
        Math.PI * 2,
      );
      c.fill();
      c.fillStyle = ((t * 10) | 0) % 2 ? pal.magenta : pal.yellow;
      for (let i = -3; i <= 3; i++)
        c.fillRect(x + i * (10 + 7 * k) - 2, base - 262 * k - 10, 4, 4);
      if (g.pt > 1.6) {
        c.font = api.fonts.xl;
        c.fillStyle = pal.magenta;
        c.textAlign = "center";
        c.fillText("THE END", W / 2, 120);
      }
    }

    g.phase = "start";
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
      _fire: fireNearest,
      _cities: cities,
      _bats: bats,
    };
  }

