(function () {
  const FX = {};
  let raf = 0, io = null, opts = {}, els = {}, st = {};
  const q = s => Array.from(document.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function cache() {
    els = {
      par: q('[data-parallax]'), flo: q('[data-float]'), mou: q('[data-mouse]'), spin: q('[data-spin]'),
      mar: q('[data-marquee]'), sld: q('[data-slide]'), zm: q('[data-zoom]'), tilt: q('[data-tilt3d]'),
      steps: q('[data-steps]'), hgal: q('[data-hgal]'), heroBg: q('[data-herobg]'), heroOut: q('[data-heroout]')
    };
  }
  function reveal() {
    if (!st.full) return;
    const T = { up: 'translate3d(0,44px,0)', word: 'translate3d(0,110%,0)', fly: 'translate3d(0,90px,0) rotate(-4deg)', scale: 'scale(.94)', left: 'translate3d(-60px,0,0)', right: 'translate3d(60px,0,0)', fade: 'none' };
    const list = q('[data-reveal]:not([data-rv])');
    list.forEach(el => {
      el.setAttribute('data-rv', '1');
      const k = el.dataset.reveal, d = el.dataset.delay || 0;
      el.style.opacity = k === 'word' ? '1' : '0';
      el.style.transform = T[k] || T.up;
      el.style.transition = `opacity .9s cubic-bezier(.2,.7,.2,1) ${d}ms, transform ${k === 'word' ? 1.2 : 1.1}s cubic-bezier(.16,.84,.24,1) ${d}ms`;
      io.observe(el);
    });
  }
  function setCursor(el) {
    const c = st.cur, l = st.curLabel; if (!c) return;
    if (el) {
      const t = '';
      l.textContent = t; l.style.opacity = t ? '1' : '0';
      c.style.width = t ? (t.length * 8.5 + 32) + 'px' : '14px'; c.style.height = t ? '34px' : '12px'; c.style.borderRadius = t ? '8px' : '3.5px';
    } else { l.style.opacity = '0'; c.style.width = '10px'; c.style.height = '9px'; c.style.borderRadius = '2.5px'; }
  }
  function frame() {
    const y = window.scrollY, vh = window.innerHeight, t = (performance.now() - st.t0) / 1000;
    const v = y - st.last; st.last = y;
    if (st.pb) { const H = document.documentElement.scrollHeight - vh; st.pb.style.transform = 'scaleX(' + (H > 0 ? y / H : 0) + ')'; }
    if (st.cur) { st.px += (st.cx - st.px) * .2; st.py += (st.cy - st.py) * .2; st.cur.style.transform = `translate3d(${st.px + 14}px,${st.py + 16}px,0)`; }
    for (const g of els.hgal) {
      const tr = g.querySelector('[data-htrack]'); if (!tr) continue;
      const r = g.getBoundingClientRect(), tot = g.offsetHeight - vh, p = clamp(-r.top / tot, 0, 1);
      tr.style.transform = `translate3d(${(-p * Math.max(0, tr.scrollWidth - innerWidth)).toFixed(1)}px,0,0)`;
    }
    for (const s of els.steps) {
      const n = +s.dataset.steps, r = s.getBoundingClientRect(), tot = s.offsetHeight - vh, p = clamp(-r.top / tot, 0, .999);
      const bar = s.querySelector('[data-stepbar]'); if (bar) bar.style.transform = `scaleY(${p.toFixed(3)})`;
      const i = Math.floor(p * n); if (s._i !== i) { s._i = i; opts.onStep && opts.onStep(s.id, i); }
    }
    if (!st.full) return;
    st.skew += (clamp(v * .3, -10, 10) - st.skew) * .1;
    st.mx += (st.tmx - st.mx) * .06; st.my += (st.tmy - st.my) * .06;
    for (const el of els.par) { const r = el.parentElement.getBoundingClientRect(); el.style.transform = `translate3d(0,${(-(r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax)).toFixed(1)}px,0)`; }
    for (const el of els.flo) { const a = +el.dataset.float, s = +(el.dataset.floatSpeed || 1); el.style.transform = `translate3d(0,${(Math.sin(t * s * 2) * a).toFixed(2)}px,0) rotate(${(Math.sin(t * s * 1.3) * 1.2).toFixed(2)}deg)`; }
    for (const el of els.mou) { const a = +el.dataset.mouse; el.style.transform = `translate3d(${(st.mx * a).toFixed(1)}px,${(st.my * a).toFixed(1)}px,0)`; }
    for (const el of els.spin) el.style.transform = `rotate(${(t * +el.dataset.spin + y * .04).toFixed(2)}deg)`;
    for (const el of els.mar) {
      el._x = (el._x || 0) - (1 + Math.min(Math.abs(v), 40) * .12) * (+el.dataset.marquee);
      const half = el.scrollWidth / 2; if (half > 0) { if (el._x <= -half) el._x += half; if (el._x > 0) el._x -= half; }
      el.style.transform = `translate3d(${el._x.toFixed(1)}px,0,0) skewX(${(-st.skew).toFixed(2)}deg)`;
    }
    for (const el of els.sld) { const r = el.parentElement.getBoundingClientRect(); el.style.transform = `translate3d(${((r.top - vh) * +el.dataset.slide).toFixed(1)}px,0,0)`; }
    for (const el of els.zm) { const r = el.parentElement.getBoundingClientRect(); const p = clamp((vh - r.top) / (vh + r.height), 0, 1); el.style.transform = `scale(${(1.18 - p * .18).toFixed(3)}) translate3d(0,${((p - .5) * -40).toFixed(1)}px,0)`; }
    for (const el of els.heroBg) el.style.transform = `translate3d(${(st.mx * -20).toFixed(1)}px,${(y * .32 + st.my * -14).toFixed(1)}px,0) scale(${(1.05 + Math.sin(t * .18) * .025 + y * .00015).toFixed(4)})`;
    for (const el of els.heroOut) { el.style.opacity = Math.max(0, 1 - y / (vh * .75)).toFixed(3); el.style.transform = `translate3d(0,${(y * .2).toFixed(1)}px,0)`; }
    for (const el of els.tilt) {
      const r = el.parentElement.getBoundingClientRect(), p = clamp((vh - r.top) / (vh * .85), 0, 1);
      el.style.transform = `perspective(1600px) rotateX(${((1 - p) * 34 + st.my * -3).toFixed(2)}deg) rotateY(${(st.mx * 5).toFixed(2)}deg) scale(${(.84 + p * .16).toFixed(3)}) translate3d(0,${((1 - p) * 60).toFixed(1)}px,0)`;
      el.style.opacity = (.35 + p * .65).toFixed(3);
    }
  }
  FX.start = function (o) {
    FX.stop();
    opts = o || {};
    st = { t0: performance.now(), last: scrollY, skew: 0, mx: 0, my: 0, tmx: 0, tmy: 0, cx: -100, cy: -100, px: -100, py: -100 };
    st.full = opts.motion !== 'Sutil' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(pointer: fine)').matches;
    st.pb = document.createElement('div');
    st.pb.style.cssText = 'position:fixed;left:0;top:0;height:3px;width:100%;background:#FF411D;transform-origin:0 50%;transform:scaleX(0);z-index:300;pointer-events:none';
    document.body.appendChild(st.pb);
    if (opts.cursor !== false && fine) {
            st.cur = document.createElement('div');
      st.cur.style.cssText = 'position:fixed;left:0;top:0;width:10px;height:9px;border-radius:2.5px;background:#FF411D;pointer-events:none;z-index:9999;display:flex;align-items:center;justify-content:center;color:#FFFFFF;font:500 13px "Neue Montreal",sans-serif;transform:translate3d(-100px,-100px,0);transition:width .35s cubic-bezier(.2,.8,.2,1),height .35s cubic-bezier(.2,.8,.2,1),border-radius .35s';
      st.curLabel = document.createElement('div'); st.curLabel.style.cssText = 'opacity:0;transition:opacity .2s;white-space:nowrap';
      st.cur.appendChild(st.curLabel); document.body.appendChild(st.cur);
    }
    st.move = e => { st.tmx = e.clientX / innerWidth - .5; st.tmy = e.clientY / innerHeight - .5; st.cx = e.clientX; st.cy = e.clientY; };
    st.over = e => { const el = e.target && e.target.closest ? e.target.closest('a,button,[data-cursor]') : null; setCursor(el); };
    addEventListener('mousemove', st.move); addEventListener('mouseover', st.over);
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    const boot = () => { cache(); reveal(); };
    requestAnimationFrame(boot); setTimeout(boot, 600); st.recache = setInterval(boot, 1500);
    cache();
    const loop = () => { try { frame(); } catch (e) { } raf = requestAnimationFrame(loop); }; loop();
  };
  FX.stop = function () {
    cancelAnimationFrame(raf); if (io) io.disconnect();
    if (st.recache) clearInterval(st.recache);
    if (st.move) { removeEventListener('mousemove', st.move); removeEventListener('mouseover', st.over); }
    ['pb', 'cur', 'css'].forEach(k => st[k] && st[k].remove());
  };
  window.FisclyFX = FX;
})();
