// play-inline-598 02 — def
// Lines 288-379 of readable/play-inline-598.pretty.js (statement-aligned).
  function kindFor(def) {
    if (!def) return "misc";
    const id = String(def.id || "").toLowerCase(),
      nm = String(def.name || "").toLowerCase();
    const tags = def.tags || [];
    const w = def.weapon;
    const has = (re) => re.test(id) || re.test(nm);
    if (def.type === "weapon") {
      const vm = String((w && (w.viewmodel || w.kind)) || "");
      const sk = String((w && w.skill) || "");
      if (has(/mortar/)) return "mortar";
      if (has(/missile|rocket|launcher|recoilless/)) return "launcher";
      if (has(/minigun|gatling|flamer|incinerator|heavy|machine gun|belt_fed/))
        return "heavy";
      if (has(/grenade/)) return "grenade";
      if (has(/mine/)) return "mine";
      if (has(/arc_|arc rifle|tesla/)) return "arc";
      if (has(/ray|beam/)) return "ray";
      if (has(/torch/)) return "torch";
      if (has(/chain|saber|saw/)) return "saber";
      if (has(/knife|blade|machete|sword|cleaver|switchblade|bayonet/))
        return "knife";
      if (has(/sledge|hammer|maul/)) return "hammer";
      if (has(/bat|pipe|cue|club|board|wrench|rolling|crowbar/)) return "bat";
      if (has(/fist|knuckle|glove|gauntlet/) || /unarmed/.test(sk))
        return "fist";
      if (has(/shotgun/)) return "shotgun";
      if (has(/smg|submachine|tommy/)) return "smg";
      if (has(/magnum|\.44|revolver/)) return "revolver";
      if (has(/rifle|carbine|bb.?gun|sniper/) || /rifle|carbine/.test(vm))
        return "rifle";
      if (has(/pistol|10mm|\.32|colt|handgun/)) return "pistol";
      if (/melee/.test(sk)) return "bat";
      if (/energy/.test(sk)) return "ray";
      if (/explosive/.test(sk)) return "grenade";
      return "pistol";
    }
    if (def.type === "apparel") {
      if (def.exoRig || has(/exo|rig_mk|exo-rig/)) return "exorig";
      if (has(/cryo|long.?winter/)) return "cryosuit";
      if (has(/goggle/)) return "goggles";
      if (def.slot === "eyes" || has(/glasses|shades/)) return "glasses";
      if (def.slot === "mouth" || has(/mask|gas/)) return "mask";
      if (def.slot === "head")
        return has(/hat|cap|fedora|beret|bonnet/) ? "hat" : "helmet";
      return "armor";
    }
    if (def.type === "aid") {
      if (has(/rally.?tonic/)) return "bottle";
      if (has(/blood.?pack|doctor|bandage|inject/)) return "injector";
      if (has(/prussian/)) return "pills";
      if (has(/morphine|syrette/)) return "syrette";
      if (has(/iodine|focus|bull|pill|tab/)) return "pills";
      if (has(/rush|rage|inhaler/)) return "inhaler";
      if (
        tags.indexOf("drink") >= 0 ||
        has(/cola|fizzo|water|root beer|beer|whiskey|scotch|vodka|wine|milk/)
      )
        return "bottle";
      if (has(/meat|steak|iguana|brain|leg|jerky/)) return "meat";
      if (has(/beans|mac|spud|can|noodle|ration|soup/)) return "can";
      return "box";
    }
    if (def.type === "ammo") {
      if (has(/power.?pack|light.?cell|cell|charge|battery/)) return "cell";
      if (has(/shell|12ga|gauge/)) return has(/mortar/) ? "mshell" : "shell";
      if (has(/missile|rocket/)) return "rocket";
      return "ammo";
    }
    if (def.type === "note") return "note";
    if (def.type === "tape" || def.reel || has(/tape|reel/)) return "reel";
    if (def.type === "key") return has(/card/) ? "keycard" : "key";
    if (def.medallion || has(/medallion/)) return "medallion";
    if (def.book || has(/book|manual|magazine|comics/)) return "book";
    if (id === "scrip" || has(/scrip/)) return "scrip";
    if (has(/teddy/)) return "teddy";
    if (has(/goggle/)) return "goggles";
    if (def.type === "junk" || tags.indexOf("junk") >= 0) return "junk";
    return "misc";
  }

  H.itemKind = kindFor;
  H.itemIcon = function (def) {
    const k = kindFor(def);
    return (
      '<svg class="gg-icon" viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      (K[k] || K.misc) +
      "</svg>"
    );
  };
  G.hud.itemIcon = H.itemIcon;
  G.hud.glyph = H.glyph;
