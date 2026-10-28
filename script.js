(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Three.js particle hero ---------- */
  var canvas = document.getElementById('bg');
  if (window.THREE && canvas) {
    var hero = canvas.parentElement;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 6;

    var COUNT = window.innerWidth < 700 ? 1500 : 3500;
    var pos = new Float32Array(COUNT * 3);
    var col = new Float32Array(COUNT * 3);
    var palette = [0x7C5CFF, 0x22D3EE, 0xF472B6].map(function (h) { return new THREE.Color(h); });
    for (var i = 0; i < COUNT; i++) {
      var r = 2 + Math.random() * 7;
      var a = Math.random() * Math.PI * 2;
      var b = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(b) * Math.cos(a);
      pos[i * 3 + 1] = r * Math.sin(b) * Math.sin(a);
      pos[i * 3 + 2] = r * Math.cos(b);
      var c = palette[i % 3];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var mat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
    var points = new THREE.Points(geo, mat);
    scene.add(points);

    var mx = 0, my = 0;
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    function resize() {
      var w = hero.clientWidth, h = hero.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    var visible = true;
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);
    var clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      var t = clock.getElapsedTime();
      if (!reduce) {
        points.rotation.y = t * 0.05 + mx * 0.3;
        points.rotation.x = t * 0.02 + my * 0.2;
        camera.position.z = 6 + Math.sin(t * 0.3) * 0.4;
      }
      renderer.render(scene, camera);
    })();
  }

  /* ---------- Typing effect ---------- */
  var words = ['Web Developer', 'Problem Solver', 'Creative Coder', 'Lifelong Learner'];
  var el = document.getElementById('typed');
  var wi = 0, ci = 0, del = false;
  function type() {
    var w = words[wi];
    el.textContent = w.slice(0, ci);
    if (!del && ci === w.length) { del = true; return setTimeout(type, 1500); }
    if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
    ci += del ? -1 : 1;
    setTimeout(type, del ? 40 : 85);
  }
  if (reduce) { el.textContent = words[0]; } else { type(); }

  /* ---------- Scroll reveal + counters ---------- */
  function count(node) {
    var target = +node.dataset.count, start = performance.now(), dur = 1600;
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(count);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (n) { io.observe(n); });

  /* ---------- Nav + progress bar ---------- */
  var nav = document.getElementById('nav'), bar = document.getElementById('progress');
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', y > 40);
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.getElementById('year').textContent = new Date().getFullYear();
})();
