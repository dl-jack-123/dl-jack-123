/* DL-OS: all site content lives in PROFILE below. Edit it to change what the monitor shows. */
(function () {
  'use strict';

  var PROFILE = {
    name: 'DL.Chiu',
    tagline: "A great product starts with a single line of code, but it's the deployment that makes it real.",
    summary: 'Python developer focused on backend services, data pipelines and automated trading tools. I like shipping things end to end: code, containers, CI and monitoring.',
    // Snapshot copied from the WakaTime block of the profile README (25 Oct 2026).
    stats: [
      'Code time: 664 hrs',
      'Lines written: 508K+',
      'Public repos: 14',
      'Contributions in 2026: 1,187',
      'Night owl: 57% of commits in the evening'
    ],
    skills: {
      'Languages': ['Python', 'Markdown'],
      'Web': ['Django', 'Flask', 'FastAPI', 'HTML', 'CSS', 'JavaScript'],
      'Database': ['SQL Server', 'PostgreSQL', 'MySQL', 'SQLite'],
      'Deploy & Cloud': ['Docker', 'Kubernetes', 'GitHub Actions'],
      'Data & Tools': ['NumPy', 'Pandas', 'Apache Airflow', 'Streamlit', 'PyQt5'],
      'TradeBot': ['Capital (群益)', 'Shioaji (永豐)'],
      'Studying': ['React', 'Grafana', 'Azure', 'GCP', 'AWS']
    },
    projects: [
      { title: 'AI Role Talk (Telegram bot)', desc: 'Role-play chat channel built on Google Gemini.', url: 'https://github.com/dl-jack-123/AIRole_TgBot', tech: 'Python, Telegram, Gemini' },
      { title: 'LLM + RAG Learning', desc: 'Notes and experiments on retrieval-augmented generation.', url: 'https://github.com/dl-jack-123/llm_rag', tech: 'Python, Gemini' },
      { title: 'ETL with Airflow', desc: 'Scheduled data pipelines.', url: 'https://github.com/dl-jack-123/Airflow/tree/main', tech: 'Python, Airflow, Celery, PostgreSQL' },
      { title: 'Streamlit Dashboard', desc: 'Live dashboard.', url: 'https://dashboard-jd.streamlit.app/', tech: 'Python, Streamlit' },
      { title: 'MCP Server: Airbnb + Cursor IDE', desc: 'Write-up on connecting an MCP server to Cursor.', url: 'https://medium.com/@jick1550443/mcp-server-airbnb-cursor-ide-3a405356d4f9', tech: 'MCP' },
      { title: 'GitHub profile page', desc: 'The README you came from, with auto-updated stats.', url: 'https://github.com/dl-jack-123/dl-jack-123', tech: 'GitHub Actions, WakaTime' }
    ],
    links: [
      { label: 'GitHub', url: 'https://github.com/dl-jack-123' },
      { label: 'Medium', url: 'https://medium.com/@jick1550443' },
      { label: 'LeetCode', url: 'https://leetcode.com/u/jick155/' }
    ]
  };

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
    about: {
      title: 'About Me', glyph: '👤', w: 560, h: 420,
      render: function () {
        return '<h2>' + esc(PROFILE.name) + '</h2><p><i>' + esc(PROFILE.tagline) + '</i></p><p>' +
          esc(PROFILE.summary) + '</p><h3>Snapshot</h3><ul>' +
          PROFILE.stats.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') +
          '</ul><p class="muted">Stats copied from my GitHub profile on 25 Oct 2026.</p>';
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
    el.style.left = 120 + offset + 'px';
    el.style.top = 40 + offset + 'px';
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

  buildDesktop();
  tick();
  setInterval(tick, 30000);
  bridge();
  openApp('about');
})();
