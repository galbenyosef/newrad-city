// play-inline-605 06 — zoom
// Lines 1440-1547 of readable/play-inline-605.pretty.js (statement-aligned).
  H.ggPage("map", "local", {
    render(body) {
      const wrap = H.el("div", "gg-mapwrap", body);
      this.cv = setupCanvas(wrap);
      this.inside = G.LAYOUT.isInterior(G.player.pos.x);
      this.zoom = this.zoom || 1.4;
      this.izoom = this.izoom || 4.5;
      const cap = H.el("div", "gg-mapcap", wrap);
      this.cap = cap;
      this.wrap = wrap;
      this.note = null;
      this.t = 0;
      this.key = null;
      this.draw();
    },
    draw() {
      const W2 = this.wrap.offsetWidth,
        H2 = this.wrap.offsetHeight;
      const reserve = [[0, this.cap.offsetTop - 3, W2, H2]];
      const inside = G.LAYOUT.isInterior(G.player.pos.x);
      if (inside !== this.inside) {
        this.inside = inside;
      }
      if (inside) {
        const p = G.player.pos;
        const r = drawInterior(
          this.cv,
          { cx: p.x, cz: p.z, zoom: this.izoom },
          { reserve },
        );
        // storey: 0 = entrance level (the floor is added for tall interiors)
        const fl = Math.round(p.y / 3.6);
        H.setText(
          this.cap,
          H.up(interiorName()) +
            (fl
              ? "  ·  " + (fl > 0 ? "LEVEL " + (fl + 1) : "BASEMENT " + -fl)
              : "") +
            (r && !r.walls ? "  ·  NO SCHEMATIC DATA" : ""),
        );
        return;
      }
      const pp = playerMapPos();
      drawMap(
        this.cv,
        { cx: pp.x, cz: pp.z, zoom: this.zoom },
        { labelZoom: 0, reserve, doors: this.zoom >= 1.2 },
      );
      H.setText(
        this.cap,
        H.up(H.placeName()) +
          "  ·  GRID " +
          Math.round(pp.x) +
          " / " +
          Math.round(-pp.z),
      );
    },
    update(dt) {
      // redraw when the player moves/turns (the world is paused while the goggles are up, so this is mostly idle)
      this.t -= dt;
      if (this.t > 0) return;
      this.t = 0.2;
      const p = G.player.pos,
        key =
          Math.round(p.x * 2) +
          "," +
          Math.round(p.z * 2) +
          "," +
          Math.round(p.y) +
          "," +
          Math.round(G.player.yaw * 20) +
          "," +
          this.zoom +
          "," +
          this.izoom;
      if (key !== this.key) {
        this.key = key;
        this.draw();
      }
    },
    zoomBy(f) {
      if (this.inside) this.izoom = H.clamp(this.izoom * f, 1.5, 14);
      else this.zoom = H.clamp(this.zoom * f, 0.8, 6);
      this.draw();
    },
    onWheel(e) {
      this.zoomBy(e.deltaY > 0 ? 0.85 : 1.18);
      return true;
    },
    onKey(code) {
      if (code === "KeyW" || code === "ArrowUp" || code === "Equal") {
        this.zoomBy(1.2);
        return true;
      }
      if (code === "KeyS" || code === "ArrowDown" || code === "Minus") {
        this.zoomBy(1 / 1.2);
        return true;
      }
      return false;
    },
    hints() {
      return [["W/S", "Zoom"]];
    },
  });

  // ------------------------------------------------------------------
  // CITY MAP (pan / zoom / select / fast travel)
  // ------------------------------------------------------------------
