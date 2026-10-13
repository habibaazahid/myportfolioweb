(function () {
  'use strict';
  var root = document.documentElement;
  var header = document.getElementById('siteHeader');
  var nav = document.getElementById('mainNav');
  var menuToggle = document.getElementById('menuToggle');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-section]'));

  /* ---------- Theme toggle ---------- */
  document.getElementById('themeToggle').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Header: solid after hero, active link ---------- */
  var hero = document.getElementById('home');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var heroEnd = hero.offsetHeight - header.offsetHeight - 10;
    header.classList.toggle('solid', y > heroEnd);

    var probe = y + header.offsetHeight + window.innerHeight * 0.25;
    var current = 'home';
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= probe) current = sections[i].getAttribute('data-section');
    }
    if (y + window.innerHeight >= document.documentElement.scrollHeight - 4) current = 'contact';
    navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === current); });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { onScroll(); ticking = false; }); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
  }
  menuToggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  navLinks.forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Portfolio filter ---------- */
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.filters button'));
  var works = Array.prototype.slice.call(document.querySelectorAll('#workGrid .work'));
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) { b.classList.toggle('active', b === btn); });
      works.forEach(function (w) {
        var show = f === 'all' || w.getAttribute('data-cat') === f;
        if (show) {
          w.hidden = false;
          requestAnimationFrame(function () { w.classList.remove('fade-out'); });
        } else {
          w.classList.add('fade-out');
          setTimeout(function () { if (w.classList.contains('fade-out')) w.hidden = true; }, 300);
        }
      });
    });
  });

  /* ---------- Certifications: show all ---------- */
  var certToggle = document.getElementById('certToggle');
  var extras = Array.prototype.slice.call(document.querySelectorAll('#certGrid [data-extra]'));
  certToggle.addEventListener('click', function () {
    var open = certToggle.getAttribute('aria-expanded') === 'true';
    extras.forEach(function (c) { c.hidden = open; });
    certToggle.setAttribute('aria-expanded', String(!open));
    certToggle.textContent = open ? 'Show All Certifications' : 'Show Fewer';
  });

  /* ---------- Contact form (opens the visitor's email app) ---------- */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), email = form.email.value.trim(), phone = form.phone.value.trim(), msg = form.message.value.trim();
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !ok || !msg) {
      note.textContent = 'Please add your name, a valid email and a message.';
      (!name ? form.name : !ok ? form.email : form.message).focus();
      return;
    }
    var body = msg + '\n\n— ' + name + '\n' + email + (phone ? '\n' + phone : '');
    window.location.href = 'mailto:habibaazahid@gmail.com?subject=' + encodeURIComponent('Portfolio enquiry from ' + name) + '&body=' + encodeURIComponent(body);
    note.textContent = 'Opening your email app… if nothing opens, write to habibaazahid@gmail.com directly.';
  });


  /* ======================================================================
     Polish layer
     ====================================================================== */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Stagger siblings automatically (replaces manual delays) */
  var groups = new Map();
  reveals.forEach(function (el) {
    var parent = el.parentElement;
    var i = groups.get(parent) || 0;
    groups.set(parent, i + 1);
    el.style.transitionDelay = Math.min(i, 5) * 0.09 + 's';
  });
  // once revealed, drop the delay so hover lifts respond instantly
  reveals.forEach(function (el) {
    el.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'opacity') el.style.transitionDelay = '0s';
    });
  });

  /* Scroll progress, back-to-top, hero parallax */
  var progress = document.getElementById('progress');
  var toTop = document.getElementById('toTop');
  var heroInner = document.getElementById('heroInner');
  function onScrollFx() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    toTop.classList.toggle('show', y > window.innerHeight * 0.8);
    if (!reduce && y < window.innerHeight * 1.2) {
      heroInner.style.transform = 'translate3d(0,' + (y * 0.22) + 'px,0)';
      heroInner.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.75)));
    }
  }
  window.addEventListener('scroll', function () { requestAnimationFrame(onScrollFx); }, { passive: true });
  onScrollFx();
  toTop.addEventListener('click', function () { smoothTo(0); });

  /* Eased anchor scrolling */
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function smoothTo(targetY) {
    if (reduce) { window.scrollTo(0, targetY); return; }
    var startY = window.scrollY || window.pageYOffset;
    var dist = targetY - startY;
    var dur = Math.min(1200, Math.max(550, Math.abs(dist) * 0.5));
    var t0 = null;
    root.style.scrollBehavior = 'auto';
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      window.scrollTo(0, startY + dist * ease(p));
      if (p < 1) requestAnimationFrame(step); else root.style.scrollBehavior = '';
    }
    requestAnimationFrame(step);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = id === '#home' ? 0 : header.offsetHeight - 20;
      // "portfolio" anchor sits on the tools strip; land with a little air
      smoothTo(Math.max(0, target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - (id === '#home' ? 0 : offset)));
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* Cursor spotlight on cards */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* Count-up numbers in the About panel */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  function runCount(el) {
    var end = parseInt(el.getAttribute('data-count'), 10), t0 = null, dur = 1400;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!reduce && 'IntersectionObserver' in window) {
    counters.forEach(function (c) { c.textContent = '0'; });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* Hero: interactive "neural network" background */
  var canvas = document.getElementById('heroCanvas');
  if (canvas && canvas.getContext && !reduce) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1, nodes = [], mouse = { x: -9999, y: -9999 }, running = true;
    function sizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(28, Math.min(90, Math.round(W * H / 17000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28, r: Math.random() * 1.4 + .8 });
      }
    }
    var LINK = 140;
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < -10) a.x = W + 10; else if (a.x > W + 10) a.x = -10;
        if (a.y < -10) a.y = H + 10; else if (a.y > H + 10) a.y = -10;
        var mdx = a.x - mouse.x, mdy = a.y - mouse.y, md = mdx * mdx + mdy * mdy;
        if (md < 18000 && md > 1) { var f = (1 - md / 18000) * .6; a.x += mdx / Math.sqrt(md) * f; a.y += mdy / Math.sqrt(md) * f; }
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            var al = (1 - Math.sqrt(d2) / LINK) * .35;
            ctx.strokeStyle = 'rgba(140,165,255,' + al + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(205,216,255,.75)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    hero.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    // pause when the hero is off-screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting;
        if (vis && !running) { running = true; requestAnimationFrame(frame); } else if (!vis) { running = false; }
      }).observe(hero);
    }
    requestAnimationFrame(frame);
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
