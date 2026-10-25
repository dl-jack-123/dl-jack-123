/* DL-OS Workstation: Code / Architecture / Monitoring views.
 * Everything here is an illustrative example or static demo data. Nothing is live. */
(function () {
  'use strict';

  var CODE = [
    '# Illustrative example, not production code.',
    'from datetime import datetime',
    '',
    'from airflow.decorators import dag, task',
    '',
    '',
    '@dag(schedule="@daily", start_date=datetime(2026, 1, 1), catchup=False)',
    'def daily_etl():',
    '    @task(retries=2)',
    '    def extract() -> list[dict]:',
    '        """Pull yesterday\'s rows from the source system."""',
    '        return [{"id": 1, "amount": 120}]',
    '',
    '    @task',
    '    def transform(rows: list[dict]) -> list[dict]:',
    '        return [r for r in rows if r["amount"] > 0]',
    '',
    '    @task',
    '    def load(rows: list[dict]) -> None:',
    '        print(f"loaded {len(rows)} rows")',
    '',
    '    load(transform(extract()))',
    '',
    '',
    'daily_etl()'
  ].join('\n');

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Single-pass highlighter: comments, strings, decorators, keywords, numbers.
  function highlight(src) {
    var re = /(#.*$)|("""[\s\S]*?"""|f?"[^"\n]*"|f?'[^'\n]*')|(@\w+)|\b(from|import|def|return|for|in|if|else|None|True|False)\b|\b(\d+)\b/gm;
    var out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      var cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'd' : m[4] ? 'k' : 'n';
      out += '<span class="t-' + cls + '">' + esc(m[0]) + '</span>';
      last = m.index + m[0].length;
    }
    return out + esc(src.slice(last));
  }

  function lineNumbers(src) {
    return src.split('\n').map(function (_, i) { return i + 1; }).join('\n');
  }

  function node(x, y, w, h, label, sub, kind) {
    return '<g class="nd ' + (kind || '') + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" rx="8"/><text x="' + (x + w / 2) + '" y="' + (y + h / 2 - (sub ? 2 : -5)) + '" text-anchor="middle" class="nl">' + esc(label) + '</text>' +
      (sub ? '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 14) + '" text-anchor="middle" class="ns">' + esc(sub) + '</text>' : '') + '</g>';
  }
  function arrow(x1, y1, x2, y2) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="ar" marker-end="url(#ah)"/>';
  }

  function architecture() {
    return '<svg viewBox="0 0 700 330" role="img" aria-label="Example architecture: client, API, database, Airflow scheduler and worker, Grafana, inside a Kubernetes cluster">' +
      '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah"/></marker></defs>' +
      '<rect x="150" y="14" width="536" height="302" rx="12" class="cluster"/>' +
      '<text x="166" y="36" class="cl">Kubernetes cluster (example)</text>' +
      node(14, 120, 100, 56, 'Client', 'browser / bot') +
      node(190, 60, 130, 56, 'API service', 'FastAPI', 'acc') +
      node(400, 60, 130, 56, 'PostgreSQL', 'application data') +
      node(190, 200, 130, 56, 'Airflow scheduler', 'DAG runs') +
      node(400, 200, 130, 56, 'Airflow worker', 'ETL tasks') +
      node(560, 130, 112, 56, 'Grafana', 'dashboards', 'acc') +
      arrow(114, 140, 190, 98) + arrow(320, 88, 400, 88) +
      arrow(320, 228, 400, 228) + arrow(465, 200, 465, 116) +
      arrow(530, 96, 590, 130) + arrow(530, 220, 590, 186) +
      '</svg>';
  }

  var SERIES = [32, 35, 31, 38, 36, 34, 41, 39, 37, 35, 33, 36, 34, 32, 35, 38, 36, 34, 33, 35];
  function sparkline() {
    var w = 300, h = 70, max = 50, pts = SERIES.map(function (v, i) {
      return (i * (w / (SERIES.length - 1))).toFixed(1) + ',' + (h - (v / max) * h).toFixed(1);
    }).join(' ');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="spark" role="img" aria-label="Demo latency series, about 31 to 41 milliseconds"><polyline points="' + pts + '"/></svg>';
  }

  var SERVICES = [
    ['api', 'ok', 'healthy', '35 ms p50'],
    ['postgres', 'ok', 'healthy', '2.1 ms query'],
    ['airflow-scheduler', 'ok', 'healthy', 'last run 02:00'],
    ['airflow-worker', 'warn', 'degraded', '1 retry']
  ];

  function monitoring() {
    return '<div class="mon"><div class="card"><h4>Request latency (demo)</h4>' + sparkline() +
      '<p class="muted">Static sample series.</p></div><div class="card"><h4>Service health (demo)</h4><ul class="svc">' +
      SERVICES.map(function (s) {
        return '<li><span class="dot ' + s[1] + '" aria-hidden="true"></span><b>' + esc(s[0]) + '</b><span>' + esc(s[2]) + '</span><span class="muted">' + esc(s[3]) + '</span></li>';
      }).join('') + '</ul></div></div>';
  }

  var TABS = [
    { id: 'code', label: 'Code', note: 'Example snippet', html: function () {
      return '<div class="code"><pre class="ln" aria-hidden="true">' + lineNumbers(CODE) + '</pre><pre class="src"><code>' + highlight(CODE) + '</code></pre></div>';
    } },
    { id: 'arch', label: 'Architecture', note: 'Illustrative diagram', html: architecture },
    { id: 'mon', label: 'Monitoring', note: 'DEMO DATA, not live', html: monitoring }
  ];

  window.renderWorkstation = function () {
    return '<div class="wsbar" role="tablist" aria-label="Workstation views">' +
      TABS.map(function (t, i) {
        return '<button type="button" role="tab" id="wst-' + t.id + '" aria-controls="wsp-' + t.id + '" aria-selected="' + (i === 0) +
          '" tabindex="' + (i === 0 ? 0 : -1) + '">' + t.label + '</button>';
      }).join('') + '<span class="wsnote" id="ws-note"></span></div>' +
      TABS.map(function (t, i) {
        return '<div class="wspanel' + (i === 0 ? ' on' : '') + '" role="tabpanel" id="wsp-' + t.id + '" aria-labelledby="wst-' + t.id + '"' + (i === 0 ? '' : ' hidden') + '>' + t.html() + '</div>';
      }).join('') +
      '<div class="wsfoot"><button type="button" data-open="projects">View projects</button><button type="button" data-open="skills">Tech stack</button></div>';
  };

  window.mountWorkstation = function (el) {
    var tabs = [].slice.call(el.querySelectorAll('[role=tab]'));
    var panels = [].slice.call(el.querySelectorAll('.wspanel'));
    var note = el.querySelector('#ws-note');
    function select(i, focus) {
      tabs.forEach(function (t, j) {
        t.setAttribute('aria-selected', String(i === j));
        t.tabIndex = i === j ? 0 : -1;
      });
      panels.forEach(function (p, j) {
        if (j === i) { p.hidden = false; void p.offsetWidth; p.classList.add('on'); }
        else { p.classList.remove('on'); p.hidden = true; }
      });
      note.textContent = TABS[i].note;
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : -1;
        if (n >= 0) { e.preventDefault(); select(n, true); }
      });
    });
    [].forEach.call(el.querySelectorAll('[data-open]'), function (b) {
      b.addEventListener('click', function () {
        document.dispatchEvent(new CustomEvent('dlos:open', { detail: b.getAttribute('data-open') }));
      });
    });
    select(0);
  };
})();
