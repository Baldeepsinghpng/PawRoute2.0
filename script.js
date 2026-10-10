/* ============ PawRoute — shared script ============ */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav + footer (edit the pages array to add a page) ---------- */
  const pages = [['index.html', 'Home'], ['features.html', 'Features'], ['routes.html', 'Route Lab'],
    ['pricing.html', 'Pricing'], ['story.html', 'Our story'], ['contact.html', 'Contact']];
  const here = location.pathname.split('/').pop() || 'index.html';
  const paw = `<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e3a0"/><stop offset="1" stop-color="#c39a3f"/></linearGradient></defs>
    <circle cx="20" cy="20" r="19" fill="url(#gg)"/><g fill="#1b2350"><ellipse cx="12.5" cy="17" rx="2.4" ry="3.2"/><ellipse cx="18" cy="12.5" rx="2.4" ry="3.4"/><ellipse cx="24" cy="12.5" rx="2.4" ry="3.4"/><ellipse cx="29.5" cy="17" rx="2.4" ry="3.2"/>
    <path d="M20 19c-4 0-8 4.2-8 7.4 0 2.4 2 3.2 4 3.2 1.6 0 2.8-.7 4-.7s2.4.7 4 .7c2 0 4-.8 4-3.2 0-3.2-4-7.4-8-7.4z"/></g></svg>`;
  document.body.insertAdjacentHTML('afterbegin', `
    <a class="skip" href="#main">Skip to content</a>
    <nav id="nav" aria-label="Main">
      <a href="index.html" class="logo" aria-label="PawRoute home">${paw}PawRoute</a>
      <div class="links" id="links">${pages.map(([h, t]) => `<a href="${h}" ${h === here ? 'class="active" aria-current="page"' : ''}>${t}</a>`).join('')}</div>
      <a href="contact.html" class="btn sm">Join the waitlist</a>
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg></button>
    </nav>`);
  document.body.insertAdjacentHTML('beforeend', `
    <footer><div class="wrap">
      <div class="fgrid">
        <div><a href="index.html" class="logo">${paw}PawRoute</a>
          <p style="margin-top:1rem;max-width:300px">Smart route planning for mobile pet groomers. More dogs, less driving, calmer days.</p></div>
        <div><h4>Product</h4><a href="features.html">Features</a><a href="routes.html">Route Lab</a><a href="pricing.html">Pricing</a></div>
        <div><h4>Company</h4><a href="story.html">Our story</a><a href="contact.html">Contact</a></div>
        <div><h4>Say hello</h4><a href="mailto:hello@pawroute.example">hello@pawroute.example</a><a href="contact.html">Join the waitlist</a></div>
      </div>
      <p class="copy">© ${new Date().getFullYear()} PawRoute. Made with care for people who drive to dogs.</p>
    </div></footer>`);
  const burger = $('#burger'), links = $('#links');
  burger.onclick = () => { const o = links.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Soft sparkles in the sky (a few, not a swarm) ---------- */
  $$('.sparks').forEach(box => {
    for (let i = 0; i < 14; i++) {
      const b = document.createElement('b');
      b.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 80}%;animation-delay:${-Math.random() * 5}s;animation-duration:${4 + Math.random() * 4}s`;
      box.appendChild(b);
    }
  });

  /* ---------- Golden thread: grows as you scroll, lights each step ---------- */
  $$('.thread').forEach(th => {
    const steps = $$('.tstep', th);
    const upd = () => {
      const r = th.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * .6 - r.top) / r.height));
      th.style.setProperty('--p', p);
      steps.forEach(s => s.classList.toggle('lit', s.getBoundingClientRect().top < vh * .6));
    };
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  });

  /* ---------- Counters ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
    const tick = t => { const k = reduce ? 1 : Math.min(1, (t - t0) / 1600); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))) + suf; if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); cio.unobserve(el);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- Route optimiser (nearest neighbour + 2-opt) ---------- */
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const length = r => r.reduce((s, p, i) => i ? s + dist(r[i - 1], p) : 0, 0);
  const nearest = (stops, start) => {
    const left = stops.slice(), route = [start];
    while (left.length) { const last = route[route.length - 1]; left.sort((a, b) => dist(last, a) - dist(last, b)); route.push(left.shift()); }
    return route;
  };
  const twoOpt = r => {
    let best = r.slice(), improved = true;
    while (improved) {
      improved = false;
      for (let i = 1; i < best.length - 1; i++) for (let j = i + 1; j < best.length; j++) {
        const cand = best.slice(0, i).concat(best.slice(i, j + 1).reverse(), best.slice(j + 1));
        if (length(cand) < length(best) - 1e-6) { best = cand; improved = true; }
      }
    }
    return best;
  };
  const svg = $('#route-svg');
  if (svg) {
    const NS = 'http://www.w3.org/2000/svg', VW = 600, VH = 400;
    const names = ['Biscuit', 'Luna', 'Max', 'Milo', 'Daisy', 'Coco', 'Rocky', 'Bella', 'Charlie', 'Ruby', 'Teddy', 'Nala'];
    let n = +svg.dataset.stops || 9;
    const statEl = $('#demo-stats');
    if (!$('#pop-kf')) document.head.insertAdjacentHTML('beforeend', '<style id="pop-kf">@keyframes pop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:none}}@keyframes draw{to{stroke-dashoffset:0}}svg g.stop{transform-box:fill-box;transform-origin:center}</style>');
    const draw = () => {
      svg.innerHTML = `<defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#e6c46a"/><stop offset="1" stop-color="#b58a2c"/></linearGradient>
        <filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
      for (let g = 50; g < VW; g += 50) svg.insertAdjacentHTML('beforeend', `<line x1="${g}" y1="0" x2="${g}" y2="${VH}" stroke="#1b2350" stroke-opacity=".05"/>`);
      for (let g = 50; g < VH; g += 50) svg.insertAdjacentHTML('beforeend', `<line x1="0" y1="${g}" x2="${VW}" y2="${g}" stroke="#1b2350" stroke-opacity=".05"/>`);
      const home = { x: 60 + Math.random() * 60, y: 60 + Math.random() * 280 };
      const stops = Array.from({ length: n }, (_, i) => ({ x: 130 + Math.random() * 430, y: 40 + Math.random() * 320, name: names[i % names.length] }));
      const naive = [home, ...stops], smart = twoOpt(nearest(stops, home));
      const a = length(naive), b = length(smart), saved = Math.max(0, Math.round((1 - b / a) * 100));
      const poly = (r, attrs) => { const p = document.createElementNS(NS, 'polyline'); p.setAttribute('points', r.map(q => q.x + ',' + q.y).join(' ')); p.setAttribute('fill', 'none'); for (const k in attrs) p.setAttribute(k, attrs[k]); return p; };
      svg.appendChild(poly(naive, { stroke: '#1b2350', 'stroke-opacity': .22, 'stroke-width': 2, 'stroke-dasharray': '4 7' }));
      const line = poly(smart, { stroke: 'url(#rg)', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'url(#gl)', pathLength: 1 });
      line.style.cssText = reduce ? '' : 'stroke-dasharray:1;stroke-dashoffset:1;animation:draw 2.4s .2s ease-out forwards';
      svg.appendChild(line);
      smart.forEach((p, i) => {
        const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'stop');
        if (!reduce) g.style.cssText = `opacity:0;animation:pop .5s ${.12 * i}s forwards`;
        g.innerHTML = i === 0
          ? `<circle cx="${p.x}" cy="${p.y}" r="22" fill="#efd68a" opacity=".5"/><circle cx="${p.x}" cy="${p.y}" r="14" fill="#c39a3f"/><text x="${p.x}" y="${p.y + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#1b2350">V</text>`
          : `<circle cx="${p.x}" cy="${p.y}" r="12" fill="#fff" stroke="#c39a3f" stroke-width="2"/><text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#1b2350">${i}</text><text x="${p.x}" y="${p.y - 18}" text-anchor="middle" font-size="11" fill="#4b5380">${p.name}</text>`;
        svg.appendChild(g);
      });
      if (statEl) statEl.innerHTML = `<span class="pill">Unplanned <b>${Math.round(a / 10)} km</b></span><span class="pill gold">PawRoute <b>${Math.round(b / 10)} km</b></span><span class="pill">Saved <b>${saved}%</b></span>`;
    };
    draw();
    $('#shuffle')?.addEventListener('click', draw);
    $('#stops')?.addEventListener('input', e => { $('#stops-val').textContent = e.target.value; n = +e.target.value; draw(); });
  }

  /* ---------- Pricing toggle ---------- */
  $$('.toggle button').forEach(btn => btn.addEventListener('click', () => {
    $$('.toggle button').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('on'); btn.setAttribute('aria-pressed', 'true');
    const yearly = btn.dataset.mode === 'yearly';
    $$('[data-m]').forEach(el => el.textContent = yearly ? el.dataset.y : el.dataset.m);
  }));

  /* ---------- Savings calculator ---------- */
  const calc = $('#calc');
  if (calc) {
    const upd = () => {
      const dogs = +$('#c-dogs').value, km = +$('#c-km').value, price = +$('#c-price').value;
      $('#c-dogs-v').textContent = dogs; $('#c-km-v').textContent = km + ' km'; $('#c-price-v').textContent = '€' + price;
      const savedKm = km * .27 * 5 * 4.3, fuel = savedKm * .11;
      const hours = savedKm / 38 + dogs * .05 * 4.3, extra = Math.floor(hours / 1.5);
      $('#o-rev').textContent = '€' + Math.round(extra * price + fuel).toLocaleString();
      $('#o-hrs').textContent = Math.round(hours) + ' hours';
      $('#o-dogs').textContent = '+' + extra;
    };
    $$('input', calc).forEach(i => i.addEventListener('input', upd)); upd();
  }

  /* ---------- Contact form (opens mail app; swap for Formspree later) ---------- */
  const form = $('#contact-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const body = encodeURIComponent(`Name: ${d.name}\nEmail: ${d.email}\nSalon/van: ${d.biz || '-'}\n\n${d.msg}`);
    location.href = `mailto:hello@pawroute.example?subject=${encodeURIComponent('PawRoute waitlist: ' + d.name)}&body=${body}`;
    form.innerHTML = '<div class="center" style="padding:2.5rem 0"><h3 style="font-size:2.4rem">Almost there.</h3><p class="lead" style="margin-top:1rem">Your mail app should have opened. Press send and you are on the waitlist.</p></div>';
  });
})();
