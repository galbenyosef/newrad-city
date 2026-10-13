// play-inline-542 02 — math
// Lines 265-1160 of readable/play-inline-542.pretty.js (statement-aligned).
  function create(api) {
    const A = api.audio,
      pal = api.pal,
      rnd = api.rnd,
      N = A.N;
    const tiles = new Uint8Array(COLS * ROWS),
      edge = new Uint8Array(COLS * ROWS),
      seen = new Uint8Array(COLS * ROWS),
      vis = new Uint8Array(COLS * ROWS);
    const bfsD = new Int16Array(COLS * ROWS),
      bfsQ = new Int16Array(COLS * ROWS);
    const mons = [];
    for (let i = 0; i < MAX_M; i++)
      mons.push({
        alive: false,
        x: 0,
        y: 0,
        hp: 0,
        max: 0,
        def: null,
        alert: 0,
        flash: 0,
        summonT: 0,
      });
    const items = [];
    for (let i = 0; i < MAX_I; i++)
      items.push({ alive: false, x: 0, y: 0, kind: "", v: 0, name: "" });
    const floats = [];
    for (let i = 0; i < MAX_F; i++)
      floats.push({ alive: false, x: 0, y: 0, t: 0, text: "" });
    const log = ["", "", "", ""];
    const rooms = [];
    const P = {
      x: 0,
      y: 0,
      hp: 20,
      max: 20,
      atk: 3,
      def: 0,
      lvl: 1,
      xp: 0,
      next: 8,
      potions: 1,
      gold: 0,
      flash: 0,
      weapon: "BARE FISTS",
      armor: "PADDED TUNIC",
    };
    const g = {
      score: 0,
      over: false,
      won: false,
      champion: false,
      depth: 0,
      t: 0,
      endT: -1,
      lastMove: 0,
      turns: 0,
      aiT: 0.5,
      kills: 0,
      kingSeen: false,
      dead: false,
    };

    const idx = (x, y) => y * COLS + x;
    const tileAt = (x, y) =>
      x < 0 || y < 0 || x >= COLS || y >= ROWS ? WALL : tiles[idx(x, y)];
    function say(s) {
      log[3] = log[2];
      log[2] = log[1];
      log[1] = log[0];
      log[0] = s;
    }
    function floatText(x, y, text) {
      for (const f of floats)
        if (!f.alive) {
          f.alive = true;
          f.x = x * TS + TS / 2;
          f.y = y * TS;
          f.t = 0;
          f.text = text;
          return;
        }
    }
    function monAt(x, y) {
      for (const m of mons) if (m.alive && m.x === x && m.y === y) return m;
      return null;
    }
    function itemAt(x, y) {
      for (const it of items)
        if (it.alive && it.x === x && it.y === y) return it;
      return null;
    }
    const ri = (a, b) => a + ((rnd() * (b - a + 1)) | 0);

    // ------------------------------------------------------------------
    // Level generation
    // ------------------------------------------------------------------
    function carve(x0, y0, x1, y1) {
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) tiles[idx(x, y)] = FLOOR;
    }
    function genLevel() {
      g.depth++;
      tiles.fill(WALL);
      seen.fill(0);
      vis.fill(0);
      for (const m of mons) m.alive = false;
      for (const it of items) it.alive = false;
      rooms.length = 0;
      for (let tries = 0; tries < 80 && rooms.length < 9; tries++) {
        const w = ri(4, 9),
          h = ri(3, 6),
          x = ri(1, COLS - w - 2),
          y = ri(1, ROWS - h - 2);
        let ok = true;
        for (const r of rooms)
          if (
            x - 1 <= r.x + r.w &&
            x + w + 1 >= r.x &&
            y - 1 <= r.y + r.h &&
            y + h + 1 >= r.y
          ) {
            ok = false;
            break;
          }
        if (!ok) continue;
        carve(x, y, x + w - 1, y + h - 1);
        const r = { x, y, w, h, cx: x + (w >> 1), cy: y + (h >> 1) };
        if (rooms.length) {
          // L corridor to the previous room
          const p = rooms[rooms.length - 1];
          if (rnd() < 0.5) {
            carve(Math.min(p.cx, r.cx), p.cy, Math.max(p.cx, r.cx), p.cy);
            carve(r.cx, Math.min(p.cy, r.cy), r.cx, Math.max(p.cy, r.cy));
          } else {
            carve(p.cx, Math.min(p.cy, r.cy), p.cx, Math.max(p.cy, r.cy));
            carve(Math.min(p.cx, r.cx), r.cy, Math.max(p.cx, r.cx), r.cy);
          }
        }
        rooms.push(r);
      }
      // a loop or two so it is not a pure chain
      if (rooms.length > 4) {
        const a = rooms[0],
          b = rooms[rooms.length - 2];
        carve(Math.min(a.cx, b.cx), a.cy, Math.max(a.cx, b.cx), a.cy);
        carve(b.cx, Math.min(a.cy, b.cy), b.cx, Math.max(a.cy, b.cy));
      }
      const r0 = rooms[0],
        rl = rooms[rooms.length - 1];
      P.x = r0.cx;
      P.y = r0.cy;
      const boss = g.depth >= 5;
      if (!boss) tiles[idx(rl.cx, rl.cy)] = STAIRS;
      // monsters
      const n = 3 + g.depth * 2;
      for (let i = 0; i < n; i++) placeMonster(pickMonster(), true);
      if (boss) {
        spawnMon("king", rl.cx, rl.cy);
        spawnMon("skel", rl.cx - 1, rl.cy);
        spawnMon("skel", rl.cx + 1, rl.cy);
      }
      // items
      const golds = ri(4, 6);
      for (let i = 0; i < golds; i++) placeItem("gold", ri(4, 12) * g.depth);
      const pots = ri(1, 2) + (g.depth >= 3 ? 1 : 0);
      for (let i = 0; i < pots; i++) placeItem("potion", 10);
      if (rnd() < 0.6 && g.depth - 1 < WEAPONS.length)
        placeItem("weapon", Math.min(WEAPONS.length - 1, g.depth - 1));
      if (rnd() < 0.45 && g.depth - 1 < ARMORS.length)
        placeItem("armor", Math.min(ARMORS.length - 1, g.depth - 1));
      for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++)
          edge[idx(x, y)] =
            tiles[idx(x, y)] === WALL && borderFloor(x, y) ? 1 : 0;
      computeFOV();
      say("DEPTH " + g.depth + ": " + DEPTH_NAMES[Math.min(5, g.depth)]);
      if (g.depth > 1) g.score += 100;
      A.seq(
        [
          [N(-9), 0.08],
          [N(-5), 0.08],
          [N(-2), 0.08],
          [N(3), 0.16],
        ],
        { vol: 0.22, type: "triangle" },
      );
    }
    function pickMonster() {
      let tot = 0;
      for (const k in MONS) {
        const m = MONS[k];
        if (!m.boss && g.depth >= m.minD && g.depth <= m.maxD) tot += m.w;
      }
      let r = rnd() * tot;
      for (const k in MONS) {
        const m = MONS[k];
        if (m.boss || g.depth < m.minD || g.depth > m.maxD) continue;
        r -= m.w;
        if (r <= 0) return k;
      }
      return "rat";
    }
    function randomFloorInRoom(avoidFirst) {
      for (let k = 0; k < 40; k++) {
        const r =
          rooms[
            avoidFirst && rooms.length > 1
              ? 1 + ((rnd() * (rooms.length - 1)) | 0)
              : (rnd() * rooms.length) | 0
          ];
        const x = r.x + ((rnd() * r.w) | 0),
          y = r.y + ((rnd() * r.h) | 0);
        if (
          tiles[idx(x, y)] === FLOOR &&
          !monAt(x, y) &&
          !itemAt(x, y) &&
          !(x === P.x && y === P.y)
        )
          return idx(x, y);
      }
      return -1;
    }
    function spawnMon(kind, x, y) {
      if (tileAt(x, y) === WALL || monAt(x, y)) return null;
      for (const m of mons)
        if (!m.alive) {
          const d = MONS[kind];
          m.alive = true;
          m.x = x;
          m.y = y;
          m.def = d;
          m.hp = m.max = d.hp + (d.boss ? 0 : (g.depth - (d.minD || 1)) >> 1);
          m.alert = 0;
          m.flash = 0;
          m.summonT = 5;
          return m;
        }
      return null;
    }
    function placeMonster(kind, avoidFirst) {
      const k = randomFloorInRoom(avoidFirst);
      if (k >= 0) spawnMon(kind, k % COLS, (k / COLS) | 0);
    }
    function placeItem(kind, v) {
      const k = randomFloorInRoom(false);
      if (k < 0) return;
      for (const it of items)
        if (!it.alive) {
          it.alive = true;
          it.x = k % COLS;
          it.y = (k / COLS) | 0;
          it.kind = kind;
          it.v = v;
          return;
        }
    }

    // ------------------------------------------------------------------
    // Field of view (Bresenham rays to every tile in range)
    // ------------------------------------------------------------------
    function los(x0, y0, x1, y1) {
      let dx = Math.abs(x1 - x0),
        dy = -Math.abs(y1 - y0),
        sx = x0 < x1 ? 1 : -1,
        sy = y0 < y1 ? 1 : -1,
        err = dx + dy;
      let x = x0,
        y = y0;
      while (!(x === x1 && y === y1)) {
        if (!(x === x0 && y === y0) && tiles[idx(x, y)] === WALL) return false;
        const e2 = 2 * err;
        if (e2 >= dy) {
          err += dy;
          x += sx;
        }
        if (e2 <= dx) {
          err += dx;
          y += sy;
        }
      }
      return true;
    }
    function computeFOV() {
      vis.fill(0);
      for (
        let y = Math.max(0, P.y - VIEW_R);
        y <= Math.min(ROWS - 1, P.y + VIEW_R);
        y++
      ) {
        for (
          let x = Math.max(0, P.x - VIEW_R);
          x <= Math.min(COLS - 1, P.x + VIEW_R);
          x++
        ) {
          const dx = x - P.x,
            dy = y - P.y;
          if (dx * dx + dy * dy > VIEW_R * VIEW_R + 2) continue;
          if (los(P.x, P.y, x, y)) {
            vis[idx(x, y)] = 1;
            seen[idx(x, y)] = 1;
          }
        }
      }
    }

    // ------------------------------------------------------------------
    // Turns
    // ------------------------------------------------------------------
    function attackMon(m) {
      const crit = rnd() < 0.1;
      let dmg = P.atk + ri(0, 2) - (m.def.def || 0);
      if (crit) dmg *= 2;
      dmg = Math.max(1, dmg);
      m.hp -= dmg;
      m.flash = 0.2;
      m.alert = 6;
      floatText(m.x, m.y, (crit ? "!" : "") + dmg);
      A.noise({ dur: 0.08, f: crit ? 3000 : 1800, f2: 300, vol: 0.35 });
      if (m.hp <= 0) {
        m.alive = false;
        g.kills++;
        g.score += m.def.xp * 10;
        say(
          "BRAN " + (crit ? "CRUSHES" : "SLAYS") + " THE " + m.def.name + "!",
        );
        A.seq(
          [
            [N(7), 0.05],
            [N(0), 0.08],
          ],
          { vol: 0.2 },
        );
        gainXP(m.def.xp);
        if (m.def.boss) {
          g.champion = true;
          g.score += 1000;
          say("THE BONE KING FALLS APART! THE SUNSTONE CROWN LIES THERE...");
          for (const it of items)
            if (!it.alive) {
              it.alive = true;
              it.x = m.x;
              it.y = m.y;
              it.kind = "crown";
              it.v = 0;
              break;
            }
          A.seq(
            [
              [N(3), 0.12],
              [N(10), 0.12],
              [N(15), 0.12],
              [N(22), 0.3],
            ],
            { vol: 0.3 },
          );
        }
      } else
        say(
          "BRAN " +
            (crit ? "CLEAVES" : "HITS") +
            " THE " +
            m.def.name +
            " (" +
            dmg +
            ")",
        );
    }
    function gainXP(n) {
      P.xp += n;
      while (P.xp >= P.next) {
        P.lvl++;
        P.next += P.lvl * P.lvl * 4 + 4;
        P.max += 5;
        P.hp = P.max;
        P.atk += 1;
        say("SIR BRAN GROWS STRONGER! LEVEL " + P.lvl + ".");
        A.seq(
          [
            [N(3), 0.07],
            [N(7), 0.07],
            [N(10), 0.07],
            [N(15), 0.14],
          ],
          { vol: 0.25 },
        );
      }
    }
    function pickup(it) {
      it.alive = false;
      if (it.kind === "gold") {
        P.gold += it.v;
        g.score += it.v;
        say("BRAN TAKES " + it.v + " GOLD.");
        A.beep({ f: 1320, f2: 1760, dur: 0.07, vol: 0.18 });
      } else if (it.kind === "potion") {
        P.potions++;
        say("A HEALING DRAUGHT. (E TO DRINK)");
        A.beep({ f: 700, f2: 900, dur: 0.1, vol: 0.18 });
      } else if (it.kind === "weapon") {
        const w = WEAPONS[it.v];
        P.atk += w[1];
        P.weapon = w[0];
        g.score += 50;
        say("BRAN WIELDS THE " + w[0] + "! ATTACK +" + w[1]);
        A.seq(
          [
            [N(10), 0.06],
            [N(17), 0.12],
          ],
          { vol: 0.2 },
        );
      } else if (it.kind === "armor") {
        const a = ARMORS[it.v];
        P.def += a[1];
        P.armor = a[0];
        g.score += 50;
        say("BRAN DONS THE " + a[0] + ". DEFENCE +" + a[1]);
        A.seq(
          [
            [N(5), 0.06],
            [N(12), 0.12],
          ],
          { vol: 0.2 },
        );
      } else if (it.kind === "crown") {
        g.won = true;
        g.champion = true;
        g.score += 1000 + P.hp * 10;
        g.endT = 0;
        say("SIR BRAN LIFTS THE SUNSTONE CROWN! VICTORY!");
        A.victory();
      }
    }
    function quaff() {
      if (g.dead || g.won) return;
      if (P.potions <= 0) {
        say("NO DRAUGHTS LEFT.");
        A.beep({ f: 150, dur: 0.08, vol: 0.15 });
        return;
      }
      if (P.hp >= P.max) {
        say("BRAN IS ALREADY HALE.");
        return;
      }
      P.potions--;
      const h = Math.min(P.max - P.hp, 10 + P.lvl * 2);
      P.hp += h;
      say("GLUG GLUG. +" + h + " HP");
      floatText(P.x, P.y, "+" + h);
      A.seq(
        [
          [N(0), 0.05],
          [N(4), 0.05],
          [N(7), 0.05],
          [N(12), 0.1],
        ],
        { vol: 0.18, type: "triangle" },
      );
      endTurn();
    }
    function tryMove(dx, dy) {
      if (g.dead || g.won) return;
      const nx = P.x + dx,
        ny = P.y + dy;
      const m = monAt(nx, ny);
      if (m) {
        attackMon(m);
        endTurn();
        return;
      }
      if (tileAt(nx, ny) === WALL) {
        A.beep({ f: 90, dur: 0.04, vol: 0.08 });
        return;
      }
      P.x = nx;
      P.y = ny;
      A.beep({
        f: 160 + (g.turns % 2) * 30,
        dur: 0.025,
        vol: 0.06,
        type: "triangle",
      });
      const it = itemAt(nx, ny);
      if (it) pickup(it);
      if (tiles[idx(nx, ny)] === STAIRS) {
        say("BRAN DESCENDS...");
        genLevel();
        return;
      }
      endTurn();
    }
    function endTurn() {
      g.turns++;
      computeFOV();
      for (const m of mons) {
        if (!m.alive || g.dead) continue;
        const d = m.def;
        const dx = P.x - m.x,
          dy = P.y - m.y,
          man = Math.abs(dx) + Math.abs(dy);
        if (vis[idx(m.x, m.y)]) m.alert = 6;
        else if (m.alert > 0) m.alert--;
        if (d.boss) {
          if (!g.kingSeen && vis[idx(m.x, m.y)]) {
            g.kingSeen = true;
            say('THE BONE KING: "KNEEL, LITTLE KNIGHT. JOIN MY COURT."');
            A.seq(
              [
                [N(-12), 0.2],
                [N(-13), 0.3],
              ],
              { vol: 0.3, type: "sawtooth" },
            );
          }
          if (m.alert > 0 && --m.summonT <= 0) {
            m.summonT = 6;
            let n = 0;
            for (const o of mons) if (o.alive && o.def === MONS.skel) n++;
            if (n < 4)
              for (let k = 0; k < 4; k++) {
                const sx = m.x + (k === 0 ? 1 : k === 1 ? -1 : 0),
                  sy = m.y + (k === 2 ? 1 : k === 3 ? -1 : 0);
                if (spawnMon("skel", sx, sy)) {
                  say("THE BONE KING CALLS HIS GUARD!");
                  break;
                }
              }
          }
        }
        if (man === 1) {
          monsterAttack(m);
          continue;
        }
        if (m.alert > 0 && !(d.erratic && rnd() < 0.5)) stepToward(m, dx, dy);
        else if (rnd() < (d.erratic ? 0.8 : 0.25)) {
          const r = (rnd() * 4) | 0;
          tryMonMove(
            m,
            r === 0 ? 1 : r === 1 ? -1 : 0,
            r === 2 ? 1 : r === 3 ? -1 : 0,
          );
        }
      }
      if (P.hp <= 0 && !g.dead) {
        g.dead = true;
        g.endT = 0;
        say("SIR BRAN HAS FALLEN. THE KING GAINS A COURTIER.");
        A.gameOver();
      }
    }
    function tryMonMove(m, dx, dy) {
      const nx = m.x + dx,
        ny = m.y + dy;
      if (
        tileAt(nx, ny) === WALL ||
        monAt(nx, ny) ||
        (nx === P.x && ny === P.y)
      )
        return false;
      if (tiles[idx(nx, ny)] === STAIRS) return false;
      m.x = nx;
      m.y = ny;
      return true;
    }
    function stepToward(m, dx, dy) {
      const sx = Math.sign(dx),
        sy = Math.sign(dy);
      if (Math.abs(dx) >= Math.abs(dy)) {
        if (!(sx && tryMonMove(m, sx, 0))) if (sy) tryMonMove(m, 0, sy);
      } else if (!(sy && tryMonMove(m, 0, sy))) if (sx) tryMonMove(m, sx, 0);
    }
    function monsterAttack(m) {
      if (rnd() < 0.18) {
        say("THE " + m.def.name + " MISSES.");
        return;
      }
      const dmg = Math.max(1, m.def.atk + ri(-1, 1) - P.def);
      P.hp -= dmg;
      P.flash = 0.25;
      floatText(P.x, P.y, "-" + dmg);
      say("THE " + m.def.name + " HITS BRAN (" + dmg + ")");
      A.noise({ dur: 0.12, f: 700, f2: 120, vol: 0.4 });
    }

    // ------------------------------------------------------------------
    // Attract-mode AI: BFS toward monsters / loot / stairs
    // ------------------------------------------------------------------
    function demoStep() {
      if (P.hp < P.max * 0.4 && P.potions > 0) {
        quaff();
        return;
      }
      for (const m of mons)
        if (m.alive && Math.abs(m.x - P.x) + Math.abs(m.y - P.y) === 1) {
          tryMove(m.x - P.x, m.y - P.y);
          return;
        }
      // BFS from player
      bfsD.fill(-1);
      let qh = 0,
        qt = 0;
      const s = idx(P.x, P.y);
      bfsD[s] = 0;
      bfsQ[qt++] = s;
      let goal = -1,
        goalScore = 1e9;
      while (qh < qt) {
        const k = bfsQ[qh++],
          x = k % COLS,
          y = (k / COLS) | 0,
          d = bfsD[k];
        let sc = 1e9;
        const mm = monAt(x, y),
          it = itemAt(x, y);
        if (mm && d > 0) sc = d * (mm.def.boss && P.hp < 25 ? 3 : 1);
        else if (it) sc = d + 2;
        else if (tiles[k] === STAIRS) sc = d + 30;
        if (sc < goalScore) {
          goalScore = sc;
          goal = k;
        }
        if (mm && d > 0) continue;
        for (let dir = 0; dir < 4; dir++) {
          const nx = x + (dir === 0 ? 1 : dir === 1 ? -1 : 0),
            ny = y + (dir === 2 ? 1 : dir === 3 ? -1 : 0);
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
          const nk = idx(nx, ny);
          if (bfsD[nk] >= 0 || tiles[nk] === WALL) continue;
          bfsD[nk] = d + 1;
          bfsQ[qt++] = nk;
        }
      }
      if (goal < 0) {
        tryMove(rnd() < 0.5 ? 1 : -1, 0);
        return;
      }
      // walk back from goal to the first step
      let k = goal;
      for (let guard = 0; guard < 2000 && bfsD[k] > 1; guard++) {
        const x = k % COLS,
          y = (k / COLS) | 0,
          d = bfsD[k];
        let moved = false;
        for (let dir = 0; dir < 4 && !moved; dir++) {
          const nx = x + (dir === 0 ? 1 : dir === 1 ? -1 : 0),
            ny = y + (dir === 2 ? 1 : dir === 3 ? -1 : 0);
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
          const nk = idx(nx, ny);
          if (bfsD[nk] === d - 1) {
            k = nk;
            moved = true;
          }
        }
        if (!moved) break;
      }
      tryMove((k % COLS) - P.x, ((k / COLS) | 0) - P.y);
    }

    // ------------------------------------------------------------------
    function update(dt) {
      g.t += dt;
      if (P.flash > 0) P.flash -= dt;
      for (const m of mons) if (m.alive && m.flash > 0) m.flash -= dt;
      for (const f of floats)
        if (f.alive) {
          f.t += dt;
          f.y -= dt * 22;
          if (f.t > 0.9) f.alive = false;
        }
      if (g.endT >= 0) {
        g.endT += dt;
        if (g.endT > (g.won ? 2.6 : 2.0)) g.over = true;
        return;
      }
      if (api.demo) {
        g.aiT -= dt;
        if (g.aiT <= 0) {
          g.aiT = 0.16;
          demoStep();
        }
      }
    }
    function key(code, rep) {
      if (g.endT >= 0) return false;
      if (rep && g.t - g.lastMove < 0.085) return true;
      let dx = 0,
        dy = 0;
      if (code === "ArrowLeft" || code === "KeyA" || code === "Numpad4")
        dx = -1;
      else if (code === "ArrowRight" || code === "KeyD" || code === "Numpad6")
        dx = 1;
      else if (code === "ArrowUp" || code === "KeyW" || code === "Numpad8")
        dy = -1;
      else if (code === "ArrowDown" || code === "KeyS" || code === "Numpad2")
        dy = 1;
      else if (code === "Space" || code === "Period" || code === "Numpad5") {
        g.lastMove = g.t;
        say("BRAN WAITS. BRAN IS PATIENT.");
        endTurn();
        return true;
      } else if (code === "KeyE" || code === "KeyQ" || code === "KeyH") {
        if (!rep) quaff();
        return true;
      } else return false;
      g.lastMove = g.t;
      tryMove(dx, dy);
      return true;
    }

    // ------------------------------------------------------------------
    function draw(c, t) {
      // tiles
      for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++) {
          const k = idx(x, y);
          if (!seen[k]) continue;
          const v = vis[k],
            px = x * TS,
            py = y * TS,
            tt = tiles[k];
          if (tt === WALL) {
            if (!edge[k]) continue; // only walls that border floor (outline look)
            c.fillStyle = v ? pal.A.brown[7] : pal.A.brown[3];
            c.fillRect(px, py, TS, TS);
            c.fillStyle = v ? pal.A.orange[5] : pal.A.grey[3];
            c.fillRect(px, py + 7, TS, 1);
            c.fillRect(px + (y & 1 ? 4 : 11), py, 1, 7);
            c.fillRect(px + (y & 1 ? 11 : 4), py + 8, 1, 8);
          } else if (tt === STAIRS)
            c.drawImage(v ? hiSpr("stairs") : dimSpr("stairs"), px, py);
          else {
            c.fillStyle = v ? pal.A.grey[7] : pal.A.grey[3];
            c.fillRect(px + 7, py + 7, 2, 2);
          }
        }
      // items + monsters (visible only)
      for (const it of items)
        if (it.alive && vis[idx(it.x, it.y)])
          c.drawImage(
            it.kind === "crown" && ((t * 4) | 0) % 2
              ? dimSpr(it.kind)
              : hiSpr(it.kind),
            it.x * TS,
            it.y * TS,
          );
      for (const m of mons) {
        if (!m.alive || !vis[idx(m.x, m.y)]) continue;
        const bob = Math.sin(t * 6 + m.x) > 0.6 ? -1 : 0;
        c.drawImage(
          m.flash > 0 && ((t * 20) | 0) % 2
            ? dimSpr(m.def.spr)
            : hiSpr(m.def.spr),
          m.x * TS,
          m.y * TS + bob,
        );
        if (m.hp < m.max) {
          c.fillStyle = pal.red;
          c.fillRect(
            m.x * TS + 1,
            m.y * TS - 2,
            Math.max(1, (14 * m.hp) / m.max),
            1.5,
          );
        }
      }
      // Sir Bran
      if (!g.dead || ((t * 4) | 0) % 2)
        c.drawImage(
          P.flash > 0 && ((t * 20) | 0) % 2 ? dimSpr("bran") : hiSpr("bran"),
          P.x * TS,
          P.y * TS,
        );
      // floating numbers
      c.font = api.fonts.s;
      c.textAlign = "center";
      c.textBaseline = "bottom";
      for (const f of floats)
        if (f.alive) {
          c.fillStyle =
            f.text[0] === "+"
              ? pal.cyan
              : f.text[0] === "-"
                ? pal.red
                : f.t < 0.5
                  ? pal.yellow
                  : pal.orange;
          c.fillText(f.text, f.x, f.y);
        }
      // HUD
      c.fillStyle = pal.bg;
      c.fillRect(0, MAPH, W, H - MAPH);
      c.strokeStyle = pal.orange;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(0, MAPH + 1);
      c.lineTo(W, MAPH + 1);
      c.stroke();
      c.textAlign = "left";
      c.textBaseline = "top";
      c.font = api.fonts.m;
      c.fillStyle = pal.cyan;
      c.fillText("BRAN LV" + P.lvl, 8, MAPH + 5);
      // hp bar
      c.strokeStyle = pal.white;
      c.lineWidth = 1;
      c.strokeRect(118.5, MAPH + 9.5, 100, 11);
      c.fillStyle =
        P.hp < P.max * 0.3 && ((t * 4) | 0) % 2 ? pal.orange : pal.red;
      c.fillRect(120, MAPH + 11, Math.max(0, (97 * P.hp) / P.max), 8);
      c.fillStyle = pal.white;
      c.fillText(Math.max(0, P.hp) + "/" + P.max, 226, MAPH + 5);
      c.fillStyle = pal.yellow;
      c.fillText(
        "ATK " +
          P.atk +
          " DEF " +
          P.def +
          "  GOLD " +
          P.gold +
          "  POT " +
          P.potions +
          "  DEPTH " +
          g.depth,
        300,
        MAPH + 5,
      );
      c.font = api.fonts.s;
      for (let i = 0; i < 3; i++) {
        c.fillStyle = i === 0 ? pal.white : pal.A.grey[9 - i * 2];
        c.fillText(log[i], 8, MAPH + 30 + i * 16);
      }
      c.textAlign = "right";
      c.fillStyle = pal.cyan;
      c.fillText("SCORE " + g.score, W - 8, MAPH + 62);
      if (g.won && g.endT >= 0) {
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = api.fonts.xl;
        c.fillStyle = ((t * 4) | 0) % 2 ? pal.yellow : pal.magenta;
        c.fillText("LONG LIVE SIR BRAN!", W / 2, 150);
      }
    }
    function borderFloor(x, y) {
      for (let j = -1; j <= 1; j++)
        for (let i = -1; i <= 1; i++) {
          if (!i && !j) continue;
          if (tileAt(x + i, y + j) !== WALL) return true;
        }
      return false;
    }

    // sprite canvases for this run (palette is fixed per run)
    const SC = {};
    for (const k in SPR)
      SC[k] = [
        AR.sprite("cc_" + k, SPR[k], 2, pal, false),
        AR.sprite("cc_" + k, SPR[k], 2, pal, true),
      ];
    function dimSpr(k) {
      return SC[k][0];
    }
    function hiSpr(k) {
      return SC[k][1];
    }

    genLevel();
    say("SIR BRAN ENTERS THE CATACOMBS OF GREYHOLLOW.");
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
        return g.won;
      },
      get champion() {
        return g.champion;
      },
      _g: g,
      _P: P,
      _mons: mons,
      _demoStep: demoStep,
      _gen: genLevel,
    };
  }

