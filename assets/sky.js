/* Emberline gökyüzü: Samanyolu bandı, Andromeda, yıldızlar, ara sıra kayan yıldız.
   Statik katman bir kez çizilir; yalnızca parıltı ve kayan yıldız canlandırılır. */
(function () {
  var canvas = document.getElementById('sky');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var calm = document.body.hasAttribute('data-calm-sky');
  var base = document.createElement('canvas');
  var bctx = base.getContext('2d');
  var W = 0, H = 0, dpr = 1, twinklers = [], meteor = null, nextMeteor = 0, raf = 0;

  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

  function drawBase() {
    var r = rng(1729);
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // derin gece degradesi
    var g = bctx.createLinearGradient(0, 0, W * 0.4, H);
    g.addColorStop(0, '#0A0D22'); g.addColorStop(0.55, '#05060F'); g.addColorStop(1, '#03040B');
    bctx.fillStyle = g; bctx.fillRect(0, 0, W, H);

    // Samanyolu bandı: -52° döndürülmüş, katmanlı bulutsu
    var diag = Math.hypot(W, H);
    bctx.save();
    bctx.translate(W * 0.55, H * 0.45);
    bctx.rotate(-52 * Math.PI / 180);
    var clouds = [
      ['rgba(120,110,170,0.10)', 0.30], ['rgba(244,162,89,0.045)', 0.18],
      ['rgba(150,170,230,0.06)', 0.22], ['rgba(255,211,163,0.035)', 0.12]
    ];
    for (var c = 0; c < 70; c++) {
      var spec = clouds[c % clouds.length];
      var x = (r() - 0.5) * diag * 1.2;
      var y = (r() - 0.5) * diag * spec[1] * (0.4 + r());
      var rad = diag * (0.05 + r() * 0.12);
      var rg = bctx.createRadialGradient(x, y, 0, x, y, rad);
      rg.addColorStop(0, spec[0]); rg.addColorStop(1, 'rgba(0,0,0,0)');
      bctx.fillStyle = rg; bctx.beginPath(); bctx.arc(x, y, rad, 0, Math.PI * 2); bctx.fill();
    }
    // toz şeridi
    for (var d = 0; d < 26; d++) {
      var dx = (r() - 0.5) * diag; var dy = (r() - 0.5) * diag * 0.04;
      var dr = diag * (0.03 + r() * 0.05);
      var dg = bctx.createRadialGradient(dx, dy, 0, dx, dy, dr);
      dg.addColorStop(0, 'rgba(3,4,11,0.35)'); dg.addColorStop(1, 'rgba(3,4,11,0)');
      bctx.fillStyle = dg; bctx.beginPath(); bctx.arc(dx, dy, dr, 0, Math.PI * 2); bctx.fill();
    }
    // bant içi yoğun yıldızlar
    for (var s = 0; s < Math.min(1400, W * H / 900); s++) {
      var sx = (r() - 0.5) * diag * 1.2;
      var sy = (r() + r() + r() - 1.5) * diag * 0.09;
      bctx.fillStyle = 'rgba(235,230,255,' + (0.15 + r() * 0.45) + ')';
      bctx.fillRect(sx, sy, r() < 0.9 ? 0.7 : 1.2, r() < 0.9 ? 0.7 : 1.2);
    }
    bctx.restore();

    // genel yıldız alanı
    var count = Math.min(900, W * H / 1500);
    for (var i = 0; i < count; i++) {
      var px = r() * W, py = r() * H, a = 0.2 + r() * 0.6, sz = r() < 0.85 ? 0.8 : 1.4;
      var tint = r();
      bctx.fillStyle = tint < 0.12 ? 'rgba(255,211,163,' + a + ')' : tint < 0.22 ? 'rgba(180,200,255,' + a + ')' : 'rgba(243,238,228,' + a + ')';
      bctx.beginPath(); bctx.arc(px, py, sz * 0.6, 0, Math.PI * 2); bctx.fill();
    }
    // birkaç ışınlı parlak yıldız
    for (var k = 0; k < 7; k++) {
      var kx = r() * W, ky = r() * H, kl = 6 + r() * 10;
      var kg = bctx.createRadialGradient(kx, ky, 0, kx, ky, kl);
      kg.addColorStop(0, 'rgba(255,245,230,0.9)'); kg.addColorStop(0.25, 'rgba(255,220,180,0.25)'); kg.addColorStop(1, 'rgba(0,0,0,0)');
      bctx.fillStyle = kg; bctx.beginPath(); bctx.arc(kx, ky, kl, 0, Math.PI * 2); bctx.fill();
      bctx.strokeStyle = 'rgba(255,240,220,0.35)'; bctx.lineWidth = 0.6;
      bctx.beginPath(); bctx.moveTo(kx - kl * 1.6, ky); bctx.lineTo(kx + kl * 1.6, ky);
      bctx.moveTo(kx, ky - kl * 1.6); bctx.lineTo(kx, ky + kl * 1.6); bctx.stroke();
    }

    // Andromeda: eğik disk, sıcak çekirdek, toz kolları, iki uydu gökada
    var ax = W * (W < 700 ? 0.78 : 0.8), ay = H * (W < 700 ? 0.16 : 0.24);
    var aR = Math.max(90, Math.min(W, H) * 0.2);
    bctx.save();
    bctx.translate(ax, ay); bctx.rotate(-0.62); bctx.scale(1, 0.32);
    var halo = bctx.createRadialGradient(0, 0, 0, 0, 0, aR * 1.25);
    halo.addColorStop(0, 'rgba(255,236,210,0.55)'); halo.addColorStop(0.12, 'rgba(255,205,160,0.35)');
    halo.addColorStop(0.45, 'rgba(170,165,215,0.12)'); halo.addColorStop(1, 'rgba(0,0,0,0)');
    bctx.fillStyle = halo; bctx.beginPath(); bctx.arc(0, 0, aR * 1.25, 0, Math.PI * 2); bctx.fill();
    bctx.lineWidth = aR * 0.07;
    bctx.filter = 'blur(' + Math.max(2, aR * 0.025) + 'px)';
    for (var lane = 0; lane < 3; lane++) {
      bctx.strokeStyle = 'rgba(5,6,15,' + (0.22 - lane * 0.06) + ')';
      bctx.beginPath(); bctx.ellipse(0, aR * 0.06, aR * (0.48 + lane * 0.2), aR * (0.4 + lane * 0.18), 0, Math.PI * 1.05, Math.PI * 1.95); bctx.stroke();
    }
    bctx.filter = 'none';
    for (var kn = 0; kn < 40; kn++) {
      var ang = r() * Math.PI * 2, rr = aR * (0.35 + r() * 0.7);
      bctx.fillStyle = r() < 0.5 ? 'rgba(255,170,200,0.14)' : 'rgba(160,190,255,0.14)';
      bctx.beginPath(); bctx.arc(Math.cos(ang) * rr, Math.sin(ang) * rr, 0.6 + r() * 0.9, 0, Math.PI * 2); bctx.fill();
    }
    var core = bctx.createRadialGradient(0, 0, 0, 0, 0, aR * 0.16);
    core.addColorStop(0, 'rgba(255,248,235,0.95)'); core.addColorStop(1, 'rgba(255,220,180,0)');
    bctx.fillStyle = core; bctx.beginPath(); bctx.arc(0, 0, aR * 0.16, 0, Math.PI * 2); bctx.fill();
    bctx.restore();
    [[0.35, 0.28, 0.05], [-0.55, -0.42, 0.08]].forEach(function (m) {
      var mx = ax + aR * m[0], my = ay + aR * m[1], mr = aR * m[2];
      var mg = bctx.createRadialGradient(mx, my, 0, mx, my, mr);
      mg.addColorStop(0, 'rgba(255,235,215,0.55)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
      bctx.fillStyle = mg; bctx.beginPath(); bctx.arc(mx, my, mr, 0, Math.PI * 2); bctx.fill();
    });

    // parıldayanlar
    twinklers = [];
    for (var t = 0; t < 46; t++) twinklers.push({ x: r() * W, y: r() * H, p: r() * 6.28, s: 0.6 + r() * 1.4, sz: 0.8 + r() * 1.1 });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    [canvas, base].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    drawBase(); paint(performance.now());
  }

  function spawnMeteor(now) {
    var fromLeft = Math.random() < 0.5;
    var x = fromLeft ? W * (0.05 + Math.random() * 0.4) : W * (0.55 + Math.random() * 0.4);
    meteor = { x: x, y: H * Math.random() * 0.35, vx: (fromLeft ? 1 : -1) * (0.9 + Math.random() * 0.5), vy: 0.38 + Math.random() * 0.2, t0: now, life: 900 + Math.random() * 500 };
  }

  function paint(now) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(base, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduce) return;
    for (var i = 0; i < twinklers.length; i++) {
      var tw = twinklers[i]; var a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(now / 1000 * tw.s + tw.p));
      ctx.fillStyle = 'rgba(255,240,225,' + a + ')';
      ctx.beginPath(); ctx.arc(tw.x, tw.y, tw.sz, 0, Math.PI * 2); ctx.fill();
    }
    if (calm) return;
    if (!meteor && now > nextMeteor) spawnMeteor(now);
    if (meteor) {
      var k = (now - meteor.t0) / meteor.life;
      if (k >= 1) { meteor = null; nextMeteor = now + 6000 + Math.random() * 9000; return; }
      var dist = k * 520, hx = meteor.x + meteor.vx * dist, hy = meteor.y + meteor.vy * dist;
      var tail = 140 * Math.sin(Math.PI * Math.min(1, k * 1.2));
      var tx = hx - meteor.vx * tail, ty = hy - meteor.vy * tail;
      var fade = k < 0.15 ? k / 0.15 : 1 - Math.max(0, (k - 0.7) / 0.3);
      var lg = ctx.createLinearGradient(tx, ty, hx, hy);
      lg.addColorStop(0, 'rgba(255,211,163,0)'); lg.addColorStop(1, 'rgba(255,236,214,' + 0.85 * fade + ')');
      ctx.strokeStyle = lg; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      var hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 6);
      hg.addColorStop(0, 'rgba(255,248,235,' + fade + ')'); hg.addColorStop(1, 'rgba(255,211,163,0)');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx, hy, 6, 0, Math.PI * 2); ctx.fill();
    }
  }

  var last = 0;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < 33) return; // ~30 fps yeter
    last = now; paint(now);
  }

  window.addEventListener('resize', function () { clearTimeout(resize._t); resize._t = setTimeout(resize, 150); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cancelAnimationFrame(raf); else if (!reduce) raf = requestAnimationFrame(loop);
  });
  nextMeteor = performance.now() + 2500;
  resize();
  if (!reduce) raf = requestAnimationFrame(loop);
})();
