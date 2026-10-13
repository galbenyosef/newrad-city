// play-inline-605 07 — view
// Lines 1548-1889 of readable/play-inline-605.pretty.js (statement-aligned).
  H.ggPage("map", "city", {
    view: null,
    render(body) {
      const self = this;
      const cols = H.el("div", "gg-worldcols", body);
      const wrap = H.el("div", "gg-mapwrap", cols);
      const side = H.el("div", "gg-mapside", cols);
      this.cv = setupCanvas(wrap);
      this.wrap = wrap;
      const pp = playerMapPos();
      // review hook (screenshots only): &discoverAll=1 marks every other location discovered
      if (G.SHOT && G.QS && G.QS.get("discoverAll") && G.discovered)
        G.LAYOUT.LOCATIONS.forEach((l, i) => {
          if (i % 2 === 0) G.discovered.add(l.id);
        });
      // the city map opens on the whole city; zoom/drag from there
      if (!this.view || this.view.fit) this.view = this.fitView();
      if (G.SHOT && G.QS && G.QS.get("mapZoom") && this.view.fit)
        this.view = {
          cx: pp.x,
          cz: pp.z,
          zoom: Number(G.QS.get("mapZoom")) || 1,
        }; // review hook
      this.info = H.el("div", "gg-mapinfo", wrap);
      this.key = null;
      this.infoHTML = null;
      // discovered locations list
      const locs = G.LAYOUT.LOCATIONS.filter(
        (l) => !l.interior && G.discovered && G.discovered.has(l.id),
      ).sort((a, b) => a.name.localeCompare(b.name));
      this.locs = locs;
      H.el("div", "gg-h", side, "[ FAST TRAVEL ]");
      const icol = H.tint().c;
      const iconMark = (l) => {
        const u =
          H.mapIconURL && H.locIconKind
            ? H.mapIconURL(H.locIconKind(l), icol, true)
            : "";
        return u ? '<img class="gg-lic" alt="" src="' + u + '">' : "";
      };
      this.list = H.ggList(
        side,
        locs.map((l) => ({
          label: shortName(l.name),
          mark: iconMark(l),
          right: Math.round(Math.hypot(l.x - pp.x, l.z - pp.z) / 10) * 10 + "m",
        })),
        "map/city",
        {
          empty: "No locations discovered yet.",
          onSelect(i, it) {
            const l = locs[i];
            self.selected = l.id;
            if (self.view && !self.view.fit) self.panTo(l.x, l.z);
            self.draw();
          },
          onActivate(i) {
            self.travel(locs[i]);
          },
        },
      );
      // mouse: drag to pan, wheel zoom, click marker select, double-click travel
      let drag = null;
      this.cv.addEventListener("mousedown", (e) => {
        drag = {
          x: e.clientX,
          y: e.clientY,
          cx: self.view.cx,
          cz: self.view.cz,
          moved: false,
        };
      });
      if (self._up) window.removeEventListener("mouseup", self._up); // re-renders must not stack listeners
      self._up = () => {
        drag = null;
      };
      window.addEventListener("mouseup", self._up);
      this.cv.addEventListener("mousemove", (e) => {
        // offsetX/Y are in the canvas' own (untransformed) space
        const mx = e.offsetX,
          my = e.offsetY;
        if (drag) {
          const dx = e.clientX - drag.x,
            dy = e.clientY - drag.y;
          if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
          self.view.cx = drag.cx - dx / self.view.zoom;
          self.view.cz = drag.cz - dy / self.view.zoom;
          self.view.fit = false;
          self.clampView();
          self.draw();
          return;
        }
        const h = self.pick(mx, my);
        const id = h ? h.loc.id : null;
        if (id !== self.hover) {
          self.hover = id;
          self.draw();
        }
      });
      this.cv.addEventListener("click", (e) => {
        if (drag && drag.moved) return;
        const h = self.pick(e.offsetX, e.offsetY);
        if (h) {
          const i = locs.indexOf(h.loc);
          if (i >= 0) self.list.setSel(i, true);
          else {
            self.selected = h.loc.id;
            self.draw();
            H.sfx("ui_hover", { volume: 0.35 });
          }
        }
      });
      this.cv.addEventListener("dblclick", (e) => {
        const h = self.pick(e.offsetX, e.offsetY);
        if (h) self.travel(h.loc);
      });
      this.draw();
    },
    leave() {
      if (this._up) {
        window.removeEventListener("mouseup", this._up);
        this._up = null;
      }
      this.view = null;
      this.selected = null;
      this.hover = null; // reopen on the whole-city view
    },
    /** zoom that fits the whole playable world (Manhattan, Brooklyn shore, the bay and islands) */
    fitZoom() {
      const w = W(),
        cw = (this.cv && this.cv.width / (this.cv._dpr || 1)) || 600,
        ch = (this.cv && this.cv.height / (this.cv._dpr || 1)) || 420;
      return Math.min(cw / (w.maxX - w.minX), ch / (w.maxZ - w.minZ)) * 0.98;
    },
    fitView() {
      const w = W();
      return {
        cx: (w.minX + w.maxX) / 2,
        cz: (w.minZ + w.maxZ) / 2,
        zoom: this.fitZoom(),
        fit: true,
      };
    },
    minZoom() {
      return Math.min(0.22, this.fitZoom() * 0.95);
    },
    pick(mx, my) {
      let best = null,
        bd = 16;
      for (const h of this.hits || []) {
        const d = Math.hypot(h.x - mx, h.y - my);
        if (d < bd) {
          bd = d;
          best = h;
        }
      }
      return best;
    },
    panTo(x, z) {
      this.view.cx = x;
      this.view.cz = z;
      this.clampView();
    },
    clampView() {
      const w = W();
      this.view.cx = H.clamp(this.view.cx, w.minX, w.maxX);
      this.view.cz = H.clamp(this.view.cz, w.minZ, w.maxZ);
    },
    setZoom(z) {
      this.view.zoom = H.clamp(z, this.minZoom(), 4);
      this.view.fit = false;
      this.draw();
    },
    /** redraw key: anything that changes the picture (the world is paused while the goggles are up) */
    viewKey() {
      const v = this.view,
        p = G.player.pos;
      return (
        v.cx.toFixed(1) +
        "," +
        v.cz.toFixed(1) +
        "," +
        v.zoom.toFixed(4) +
        "|" +
        this.selected +
        "|" +
        this.hover +
        "|" +
        Math.round(p.x) +
        "," +
        Math.round(p.z) +
        "," +
        Math.round(G.player.yaw * 20) +
        "|" +
        (this.cv ? this.cv.width + "x" + this.cv.height : "") +
        "|" +
        (G.discovered ? G.discovered.size : 0) +
        "|" +
        H.settings.tint
      );
    },
    draw() {
      if (!this.cv) return;
      // the info box (top-left) is a DOM overlay: keep map labels out from under it
      const ib = this.info,
        reserve =
          ib && ib.offsetWidth
            ? [
                [
                  ib.offsetLeft - 4,
                  ib.offsetTop - 4,
                  ib.offsetLeft + ib.offsetWidth + 4,
                  ib.offsetTop + ib.offsetHeight + 4,
                ],
              ]
            : [];
      this.hits = drawMap(this.cv, this.view, {
        selected: this.selected,
        hover: this.hover,
        labelZoom: 0.95,
        showAll: true,
        reserve,
      });
      this.key = this.viewKey();
      const l = G.LAYOUT.getLocation(this.selected || this.hover);
      let html;
      if (l) {
        const disc = G.discovered && G.discovered.has(l.id);
        const kind = H.locIconKind ? H.locIconKind(l) : "";
        const kl =
          kind && H.locKindLabel
            ? H.locKindLabel(kind)
            : (l.type || "").toUpperCase();
        html =
          "<b>" +
          H.esc(H.up(l.name)) +
          "</b><br>" +
          H.esc(kl) +
          (disc && l.hostile
            ? H.call("combat", "isLocationCleared", [l.id], false)
              ? " · CLEARED"
              : " · HOSTILE"
            : "") +
          (disc && l.level ? " · LVL " + H.esc(l.level) : "") +
          (disc
            ? '<br><span class="gg-hint-sm">ENTER / DOUBLE-CLICK: FAST TRAVEL</span>'
            : '<br><span class="gg-hint-sm">UNDISCOVERED &middot; REACH IT ON FOOT</span>');
      } else
        html =
          H.esc(H.up(H.placeName())) +
          '<br><span class="gg-hint-sm">' +
          H.gameDate() +
          " · " +
          H.gameClock() +
          "</span>";
      if (html !== this.infoHTML) {
        this.infoHTML = html;
        H.setHTML(this.info, html);
      }
    },
    travel(l) {
      if (!l) return;
      if (!(G.discovered && G.discovered.has(l.id))) {
        H.sfx("ui_error");
        return;
      }
      const why = canFastTravel();
      if (why) {
        G.notify(why);
        H.sfx("ui_error");
        return;
      }
      GG.confirm(
        "Fast travel to " + l.name + "?",
        () => fastTravel(l),
        "Travel",
        "Cancel",
      );
    },
    t: 0,
    update(dt) {
      // redraw only when something visible changed (was: full redraw every 0.12 s)
      this.t -= dt;
      if (this.t > 0 || !this.view) return;
      this.t = 0.12;
      if (this.view.fit) {
        const z = this.fitZoom();
        if (Math.abs(z - this.view.zoom) > 1e-4) this.view.zoom = z;
      }
      if (this.viewKey() !== this.key) this.draw();
    },
    onWheel(e) {
      this.setZoom(this.view.zoom * (e.deltaY > 0 ? 0.85 : 1.18));
      return true;
    },
    onKey(code) {
      const v = this.view;
      if (code === "Equal" || code === "NumpadAdd") {
        this.setZoom(v.zoom * 1.25);
        return true;
      }
      if (code === "Minus" || code === "NumpadSubtract") {
        this.setZoom(v.zoom / 1.25);
        return true;
      }
      if (code === "KeyF") {
        this.view = this.fitView();
        this.draw();
        H.sfx("ui_hover", { volume: 0.35 });
        return true;
      }
      if (code === "KeyC") {
        const pp = playerMapPos();
        this.panTo(pp.x, pp.z);
        if (v.zoom < 0.6) v.zoom = 0.6;
        v.fit = false;
        this.selected = null;
        this.draw();
        return true;
      }
      return false;
    },
    hints() {
      return [
        ["Enter", "Travel"],
        ["Drag", "Pan"],
        ["+/-", "Zoom"],
        ["C", "Centre"],
        ["F", "Whole city"],
      ];
    },
  });

  // Track last outdoor position every frame (for the map arrow while indoors)
  H.part({
    name: "ggmap",
    order: 31,
    update() {
      playerMapPos();
    },
  });
  H.playerMapPos = playerMapPos;
