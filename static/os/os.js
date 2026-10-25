/* DL-OS: all site content lives in PROFILE below. Edit it to change what the monitor shows. */
(function () {
  'use strict';

  var PROFILE = null; // loaded from profile.json before the desktop is built

  // ---------- helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function link(url, text) {
    return '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(text) + '</a>';
  }
  function $(id) { return document.getElementById(id); }

  // ---------- app content ----------
  var APPS = {
    workstation: {
      title: 'Workstation', glyph: '🖥', w: 860, h: 520, cls: 'ws',
      render: renderWorkstation,
      mount: mountWorkstation
    },
    about: {
      title: 'About Me', glyph: '👤', w: 720, h: 500,
      render: function () {
        return '<div class="hero"><h1>' + esc(PROFILE.name) + '</h1>' +
          '<p class="role">' + esc(PROFILE.role) + '</p>' +
          '<p class="tagline">' + esc(PROFILE.tagline) + '</p>' +
          '<p>' + esc(PROFILE.summary) + '</p>' +
          '<div class="links">' + PROFILE.links.map(function (l) { return link(l.url, l.label); }).join('') + '</div>' +
          '<p class="stats">' + PROFILE.stats.map(function (x) { return esc(x.label + ': ' + x.value); }).join(' · ') + '<br>Snapshot from my GitHub profile, ' + esc(PROFILE.statsDate) + '.</p></div>';
      }
    },
    skills: {
      title: 'Skills', glyph: '🛠️', w: 600, h: 440,
      render: function () {
        return Object.keys(PROFILE.skills).map(function (group) {
          return '<h3>' + esc(group) + '</h3>' + PROFILE.skills[group].map(function (s) {
            return '<span class="tag">' + esc(s) + '</span>';
          }).join('');
        }).join('');
      }
    },
    projects: {
      title: 'Projects', glyph: '📁', w: 640, h: 460,
      render: function () {
        return '<ul>' + PROFILE.projects.map(function (p) {
          return '<li><b>' + link(p.url, p.title) + '</b><br>' + esc(p.desc) +
            '<br><span class="muted">' + esc(p.tech) + '</span><br><br></li>';
        }).join('') + '</ul>';
      }
    },
    contact: {
      title: 'Links', glyph: '🔗', w: 420, h: 280,
      render: function () {
        return '<h2>Find me online</h2><ul>' + PROFILE.links.map(function (l) {
          return '<li>' + link(l.url, l.label) + '</li>';
        }).join('') + '</ul><p class="muted">Links open in a new tab.</p>';
      }
    },
    terminal: {
      title: 'Terminal', glyph: '⌨️', w: 600, h: 400, cls: 'terminal',
      render: function () { return '<div id="term-out"></div><div>&gt; <input id="term-in" autocomplete="off" spellcheck="false" aria-label="Terminal input"></div>'; },
      mount: mountTerminal
    }
  };

  // ---------- window manager ----------
  var zTop = 10, openWins = {}, offset = 0;

  function focusWin(id) {
    Object.keys(openWins).forEach(function (k) { openWins[k].el.classList.toggle('active', k === id); });
    openWins[id].el.style.zIndex = ++zTop;
    renderTasks();
  }

  function closeWin(id) {
    if (!openWins[id]) return;
    openWins[id].el.remove();
    delete openWins[id];
    renderTasks();
  }

  function openApp(id) {
    if (openWins[id]) { focusWin(id); return; }
    var app = APPS[id], el = document.createElement('section');
    el.className = 'win ' + (app.cls || '');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', app.title);
    el.style.width = app.w + 'px';
    el.style.height = app.h + 'px';
    el.style.left = (id === 'workstation' ? 40 : 260 + offset) + 'px';
    el.style.top = (id === 'workstation' ? 24 : 60 + offset) + 'px';
    offset = (offset + 28) % 140;
    el.innerHTML = '<div class="bar"><span>' + esc(app.glyph + ' ' + app.title) +
      '</span><button type="button" aria-label="Close">×</button></div><div class="body">' + app.render() + '</div>';
    $('windows').appendChild(el);
    openWins[id] = { el: el };
    el.addEventListener('mousedown', function () { focusWin(id); });
    el.querySelector('button').addEventListener('click', function () { closeWin(id); });
    makeDraggable(el, el.querySelector('.bar'));
    if (app.mount) app.mount(el);
    focusWin(id);
  }

  function makeDraggable(win, handle) {
    handle.addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'BUTTON') return;
      var sx = e.clientX, sy = e.clientY, ox = win.offsetLeft, oy = win.offsetTop;
      function move(ev) {
        var maxX = window.innerWidth - 80, maxY = window.innerHeight - 70;
        win.style.left = Math.max(-win.offsetWidth + 80, Math.min(maxX, ox + ev.clientX - sx)) + 'px';
        win.style.top = Math.max(0, Math.min(maxY, oy + ev.clientY - sy)) + 'px';
      }
      function up() {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      }
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
  }

  function renderTasks() {
    var box = $('tasks');
    box.textContent = '';
    Object.keys(openWins).forEach(function (id) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = APPS[id].glyph + ' ' + APPS[id].title;
      b.className = openWins[id].el.classList.contains('active') ? 'on' : '';
      b.addEventListener('click', function () { focusWin(id); });
      box.appendChild(b);
    });
  }

  // ---------- terminal ----------
  function mountTerminal(el) {
    var out = el.querySelector('#term-out'), input = el.querySelector('#term-in');
    function print(text) {
      var d = document.createElement('div');
      d.className = 'line';
      d.textContent = text;
      out.appendChild(d);
      el.querySelector('.body').scrollTop = 1e9;
    }
    var commands = {
      help: function () { return 'Commands: about, skills, projects, links, clear, help'; },
      about: function () { return PROFILE.name + '\n' + PROFILE.tagline + '\n\n' + PROFILE.summary; },
      skills: function () {
        return Object.keys(PROFILE.skills).map(function (g) { return g + ': ' + PROFILE.skills[g].join(', '); }).join('\n');
      },
      projects: function () {
        return PROFILE.projects.map(function (p) { return '- ' + p.title + '  ' + p.url; }).join('\n');
      },
      links: function () {
        return PROFILE.links.map(function (l) { return l.label + ': ' + l.url; }).join('\n');
      },
      clear: function () { out.textContent = ''; return null; }
    };
    print('DL-OS terminal. Type "help".');
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var cmd = input.value.trim().toLowerCase();
      input.value = '';
      if (!cmd) return;
      print('> ' + cmd);
      var fn = Object.prototype.hasOwnProperty.call(commands, cmd) ? commands[cmd] : null;
      var res = fn ? fn() : 'Unknown command: ' + cmd;
      if (res !== null) print(res);
    });
    input.focus();
  }

  // ---------- desktop, start menu, clock ----------
  function buildDesktop() {
    var desk = $('desktop'), menu = $('start-menu');
    Object.keys(APPS).forEach(function (id) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'icon';
      b.innerHTML = '<span class="glyph" aria-hidden="true">' + APPS[id].glyph + '</span><span>' + esc(APPS[id].title) + '</span>';
      b.addEventListener('dblclick', function () { openApp(id); });
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter') openApp(id); });
      desk.appendChild(b);

      var m = document.createElement('button');
      m.type = 'button';
      m.textContent = APPS[id].glyph + '  ' + APPS[id].title;
      m.addEventListener('click', function () { menu.hidden = true; openApp(id); });
      menu.appendChild(m);
    });
    $('start').addEventListener('click', function (e) { e.stopPropagation(); menu.hidden = !menu.hidden; });
    document.addEventListener('mousedown', function (e) {
      if (!menu.contains(e.target) && e.target !== $('start')) menu.hidden = true;
    });
  }

  function tick() {
    $('clock').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ---------- bridge to the 3D scene ----------
  // The parent page turns these messages into camera movement and keyboard sounds.
  // Same-origin only; ignored when the page is opened on its own.
  function bridge() {
    if (window.parent === window) return;
    var target = window.location.origin === 'null' ? '*' : window.location.origin;
    function send(msg) { window.parent.postMessage(msg, target); }
    ['mousedown', 'mouseup'].forEach(function (t) {
      document.addEventListener(t, function () { send({ type: t }); });
    });
    document.addEventListener('mousemove', function (e) {
      send({ type: 'mousemove', clientX: e.clientX, clientY: e.clientY });
    });
    ['keydown', 'keyup'].forEach(function (t) {
      document.addEventListener(t, function (e) { send({ type: t, key: e.key }); });
    });
  }

  function init() {
  buildDesktop();
  tick();
  setInterval(tick, 30000);
  bridge();
  openApp('workstation');
  }

  // Escape inside the iframe can't reach the parent's key handler, so forward it.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && window.parent !== window) {
      window.parent.postMessage({ type: 'dlos-escape' }, window.location.origin === 'null' ? '*' : window.location.origin);
    }
  });
  document.addEventListener('dlos:open', function (e) { if (APPS[e.detail] && PROFILE) openApp(e.detail); });

  // The parent page (React nav) asks DL-OS to open an app. Same-origin only.
  window.addEventListener('message', function (e) {
    if (e.origin !== window.location.origin && window.location.origin !== 'null') return;
    var d = e.data;
    if (d && d.type === 'dlos-open' && APPS[d.app] && PROFILE) openApp(d.app);
  });

  fetch('profile.json').then(function (r) { return r.json(); }).then(function (data) {
    PROFILE = data;
    init();
  }).catch(function () {
    document.body.textContent = 'Could not load profile.json';
  });
})();
