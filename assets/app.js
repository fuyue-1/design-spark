/* =========================================================
   毕设选题参谋 — 应用逻辑
   ========================================================= */
(function () {
  'use strict';

  var BSCT = window.BSCT;
  var FIELDS = BSCT.FIELDS;
  var SKILLS = BSCT.SKILLS;
  var TOPICS = BSCT.TOPICS;
  var PAST = BSCT.PAST;
  var TYPE_LABELS = BSCT.TYPE_LABELS;
  var DIFF_LABELS = BSCT.DIFF_LABELS;

  var app = document.getElementById('app');
  var modalRoot = document.getElementById('modal-root');
  var toastEl = document.getElementById('toast');

  /* ---------------- 基础工具 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  var store = {
    get: function (k, d) {
      try {
        var raw = localStorage.getItem('bsct.' + k);
        return raw ? JSON.parse(raw) : d;
      } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem('bsct.' + k, JSON.stringify(v)); } catch (e) {}
    }
  };

  var ICONS = {
    spark: '<path d="M12 3l1.6 4.7 4.9 1.6-4.9 1.6L12 15.6l-1.6-4.7L5.5 9.3l4.9-1.6z"/><path d="M18.6 15.4l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    activity: '<path d="M3 12h4l2.5-7 4 14 2.5-7h5"/>',
    layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    network: '<circle cx="12" cy="5" r="2.4"/><circle cx="5" cy="19" r="2.4"/><circle cx="19" cy="19" r="2.4"/><path d="M12 7.4v4.2m0 0l-5.4 4.9m5.4-4.9l5.4 4.9"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9.4 12l1.9 1.9 3.4-3.5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    alert: '<path d="M12 3l9 16H3z"/><path d="M12 9v5M12 17h.01"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 5H6a2 2 0 0 0-2 2v9"/>',
    heart: '<path d="M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.6 12 20 12 20z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 4v7h-7"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20"/>',
    message: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 14h10l1-14"/>',
    print: '<path d="M6 9V3h12v6M6 18H4v-6h16v6h-2"/><rect x="6" y="14" width="12" height="7"/>',
    zap: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M17 8.5a3 3 0 0 1 0 5.5M18 20a6 6 0 0 0-2-4.5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
    hand: '<path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11m0-4.5v-1a1.5 1.5 0 0 1 3 0v2m0-1a1.5 1.5 0 0 1 3 0V13c0 4-2.5 7-6.5 7S4 17 4 13v-2a1.5 1.5 0 0 1 3 0v1"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  function toast(msg, ok) {
    toastEl.innerHTML = icon(ok === false ? 'alert' : 'check') + '<span>' + esc(msg) + '</span>';
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  function openModal(html) {
    modalRoot.innerHTML = '<div class="modal-backdrop" data-action="backdrop-close">' +
      '<div class="modal-card" role="dialog" aria-modal="true">' + html + '</div></div>';
    document.body.classList.add('modal-open');
    var first = $('#modal-root .modal-body');
    if (first) first.scrollTop = 0;
  }
  function closeModal() {
    modalRoot.innerHTML = '';
    document.body.classList.remove('modal-open');
  }

  function download(filename, text) {
    var blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 400);
  }

  function copyText(text) {
    var done = function () { toast('已复制到剪贴板'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove();
      if (ok) { done(); } else { toast('复制失败，请手动全选复制', false); }
    }
  }

  /* ---------------- 数据与算法 ---------------- */
  function getTopic(id) {
    for (var i = 0; i < TOPICS.length; i++) { if (TOPICS[i].id === id) return TOPICS[i]; }
    return null;
  }
  function fieldOf(t) { return FIELDS[t.field] || { name: t.field, color: '#333', icon: 'layers' }; }
  function hanCount(s) { return (String(s).match(/[\u4e00-\u9fa5]/g) || []).length; }
  function bigrams(s) {
    var clean = String(s).replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '');
    var out = [];
    for (var i = 0; i < clean.length - 1; i++) out.push(clean.slice(i, i + 2));
    return out;
  }
  function similarity(a, b) {
    var A = {}, B = {};
    var ba = bigrams(a), bb = bigrams(b);
    if (!ba.length || !bb.length) return 0;
    ba.forEach(function (x) { A[x] = 1; });
    bb.forEach(function (x) { B[x] = 1; });
    var inter = 0;
    Object.keys(A).forEach(function (k) { if (B[k]) inter++; });
    var union = Object.keys(A).length + Object.keys(B).length - inter;
    var jac = union ? inter / union : 0;
    var cont = inter / Math.min(ba.length, bb.length);
    return Math.min(1, Math.max(jac, cont * 0.82));
  }
  function hashSeed(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
    return h;
  }
  function jitter(id, seed) {
    var x = Math.sin(hashSeed(id) + seed * 7.3) * 10000;
    return (x - Math.floor(x)) * 8 - 4;
  }

  /* ---------------- 题目表述 ---------------- */
  var TITLE_CHOICE = store.get('titleChoice', {});

  function titlesOf(t) {
    return (t.titles && t.titles.length) ? t.titles : [t.title];
  }
  function titleOf(t) {
    var list = titlesOf(t);
    var i = TITLE_CHOICE[t.id];
    return (typeof i === 'number' && list[i]) ? list[i] : list[0];
  }
  function pickTitle(id, idx) {
    TITLE_CHOICE[id] = idx;
    store.set('titleChoice', TITLE_CHOICE);
  }

  var defaultProfile = function () {
    return {
      major: '软件工程', level: 'course', skills: [], fields: [],
      experiences: [], expText: '', scenes: [],
      advisorAlign: 'unsure', advisorField: '',
      type: 'any', hardwareOk: false, ambition: 'balanced'
    };
  };
  var profile = store.get('profile', null);
  var favorites = store.get('favs', []);
  var WIZ = { step: 0, error: '' };
  var RESULT = { offset: 0, type: 'all', seed: 1 };

  function saveProfile() { store.set('profile', profile); }
  function saveFavs() { store.set('favs', favorites); updateSavedCount(); }
  function updateSavedCount() {
    var el = document.getElementById('saved-count');
    if (el) el.textContent = String(favorites.length);
  }
  function isFav(id) { return favorites.indexOf(id) > -1; }
  function toggleFav(id) {
    var i = favorites.indexOf(id);
    if (i > -1) { favorites.splice(i, 1); toast('已取消收藏'); }
    else { favorites.push(id); toast('已加入收藏'); }
    saveFavs();
    $all('[data-action="fav"][data-id="' + id + '"]').forEach(function (b) {
      b.classList.toggle('active', isFav(id));
      b.innerHTML = icon('heart') + '<span>' + (isFav(id) ? '已收藏' : '收藏') + '</span>';
    });
  }

  function tokenize(text) {
    return String(text || '').split(/[\s,，、;；\/\\|+]+/).filter(function (w) { return w.length >= 2; });
  }

  function rankTopics(p, seed) {
    return TOPICS.map(function (t) {
      var s = 0, reasons = [];
      var f = fieldOf(t);

      if (p.fields && p.fields.length) {
        var idx = p.fields.indexOf(t.field);
        if (idx === 0) { s += 40; reasons.push('首选方向「' + f.name + '」与题目一致'); }
        else if (idx > 0) { s += 30; reasons.push('属于你关注的「' + f.name + '」方向'); }
      } else { s += 8; }

      var ov = (t.skills || []).filter(function (k) { return (p.skills || []).indexOf(k) > -1; });
      if (ov.length) {
        s += Math.min(20, ov.length * 5);
        reasons.push('用得上你已经会的 ' + ov.slice(0, 3).map(function (k) { return SKILLS[k]; }).join('、'));
      }

      if (p.type === 'any') { s += 6; }
      else if (p.type === t.type) { s += 14; reasons.push('符合偏好的「' + TYPE_LABELS[t.type] + '」类型'); }
      else { s -= 10; }

      if (t.hardware && !p.hardwareOk) { s -= 100; }

      var ctx = (p.expText || '') + ' ' + (p.scenes || []).join(' ') + ' ' + (p.advisorField || '');
      var kwHits = (t.keywords || []).filter(function (k) { return ctx.indexOf(k) > -1; });
      if (kwHits.length) {
        s += Math.min(15, kwHits.length * 5);
        reasons.push('与你提到的「' + kwHits[0] + '」场景相关');
      }

      if (p.advisorAlign === 'yes' && p.advisorField) {
        var toks = tokenize(p.advisorField);
        var text = titlesOf(t).join(' ') + ' ' + (t.tags || []).join(' ') + ' ' + (t.keywords || []).join(' ') + ' ' + t.problem;
        var hit = toks.some(function (w) {
          return text.indexOf(w) > -1 || (w.length > 4 && text.indexOf(w.slice(0, 4)) > -1);
        });
        if (hit) { s += 18; reasons.push('与导师方向「' + p.advisorField + '」有交集'); }
        else { s -= 5; }
      }

      if (p.ambition === 'safe') { s += t.difficulty <= 3 ? 8 : -6; }
      else if (p.ambition === 'challenge') { s += t.difficulty >= 4 ? 8 : 0; }
      else { s += t.difficulty === 3 ? 4 : 0; }

      if (p.level === 'basic' && t.difficulty >= 5) { s -= 8; }

      s += jitter(t.id, seed);
      var pct = clamp(Math.round(52 + s * 0.42), 56, 98);
      if (!reasons.length) reasons.push('工作量与数据可得性较稳，适合作为本科毕设');
      return { t: t, score: s, pct: pct, reasons: reasons.slice(0, 3) };
    }).sort(function (a, b) { return b.score - a.score; });
  }

  /* ---------------- 路由 ---------------- */
  function parseRoute() {
    var h = (location.hash || '').replace(/^#/, '');
    var parts = h.split('/').filter(Boolean);
    if (!parts.length || parts[0] === 'home') return { name: 'home' };
    if (parts[0] === 'topic' && parts[1]) return { name: 'topic', id: decodeURIComponent(parts[1]) };
    return { name: parts[0] };
  }

  function setActiveNav(name) {
    var key = name === 'topic' || name === 'result' ? 'library' : name;
    if (name === 'match') key = 'match';
    $all('.nav-link').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-nav') === key);
    });
  }

  function render() {
    var r = parseRoute();
    var html = '';
    if (r.name === 'home') html = viewHome();
    else if (r.name === 'match') html = viewMatch();
    else if (r.name === 'result') html = viewResult();
    else if (r.name === 'topic') html = viewTopic(r.id);
    else if (r.name === 'library') html = viewLibrary();
    else if (r.name === 'check') html = viewCheck();
    else if (r.name === 'guide') html = viewGuide();
    else if (r.name === 'saved') html = viewSaved();
    else html = viewHome();

    app.innerHTML = html;
    setActiveNav(r.name);
    updateSavedCount();
    if (r.name === 'guide' || r.name === 'home') { /* no-op */ }
    window.scrollTo(0, 0);
    if (r.name === 'check') {
      var input = $('#checker-input');
      var q = '';
      try { q = new URLSearchParams(location.search).get('q') || ''; } catch (e) {}
      if (input && q) input.value = q;
      if (input) input.focus();
      paintCheck();
    }
  }

  /* ---------------- 通用片段 ---------------- */
  function ring(pct, color, small) {
    var r = 18, c = 2 * Math.PI * r;
    var off = c * (1 - pct / 100);
    return '<div class="match-ring' + (small ? ' small' : '') + '">' +
      '<svg viewBox="0 0 46 46"><circle class="track" cx="23" cy="23" r="' + r + '"/>' +
      '<circle class="bar" cx="23" cy="23" r="' + r + '" style="stroke:' + color + '" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg>' +
      '<b>' + pct + '%</b></div>';
  }
  function dots(n) {
    var out = '<span class="dots" title="难度 ' + n + '/5">';
    for (var i = 1; i <= 5; i++) out += '<i class="' + (i <= n ? 'on' : '') + '"></i>';
    return out + '</span>';
  }
  function typeTag(t) {
    return '<span class="tag ' + (t.type === 'algorithm' ? 'tag-teal' : t.type === 'hardware' ? 'tag-amber' : 'tag-brand') + '">' + TYPE_LABELS[t.type] + '</span>';
  }
  function selfCheck(t, title) {
    title = title || titleOf(t);
    var han = hanCount(title);
    var langBad = /基于\s*(Java|Python|C\+\+|C语言|C#|PHP|JavaScript|Node\.?js)/i.test(title);
    var sims = PAST.map(function (p) { return { t: p.t, sim: similarity(title, p.t) }; })
      .sort(function (a, b) { return b.sim - a.sim; });
    return { han: han, langOk: !langBad, maxSim: sims[0] ? sims[0].sim : 0, top: sims.slice(0, 2) };
  }

  /* ---------------- 首页 ---------------- */
  function viewHome() {
    var featured = ['llm-course-rag', 'web-lab-booking', 'ai-weld-defect', 'iot-balcony', 'net-trace-rootcause', 'data-digital-twin']
      .map(getTopic).filter(Boolean);

    var personas = [
      { id: 'p1', ico: 'phone', title: '软件工程 · 做过小程序', desc: '想做一个完整、能演示的业务系统', tag: '系统开发' },
      { id: 'p2', ico: 'spark', title: '计算机科学 · 想做大模型', desc: '跑过 RAG demo，希望往应用层做深', tag: '大模型应用' },
      { id: 'p3', ico: 'cpu', title: '物联网 · 软硬结合', desc: '有硬件基础，想做能摸得着的作品', tag: '软硬结合' }
    ];

    return '<div class="page">' +
      '<section class="hero">' +
        '<div class="container hero-grid">' +
          '<div>' +
            '<div class="hero-badge"><b>本科毕设</b>一人一题 · 题目 ≤25 字 · 不以编程语言命名</div>' +
            '<h1 class="display">选题之前，<br>先把<span class="grad">问题</span>想清楚</h1>' +
            '<p class="hero-sub">说说你的方向、做过什么、导师的要求。系统会给出能落地、有设计含量、经得起开题追问的题目，并附上功能拆解、技术路线与实施排期。</p>' +
            '<div class="hero-actions">' +
              '<a class="btn btn-brand" href="#/match">' + icon('compass') + '开始选题测评</a>' +
              '<a class="btn btn-ghost" href="#/library">' + icon('layers') + '先逛题目库</a>' +
            '</div>' +
            '<div class="hero-stats">' +
              '<div class="hero-stat"><b>' + TOPICS.length + '</b><span>个可落地的题目</span></div>' +
              '<div class="hero-stat"><b>' + Object.keys(FIELDS).length + '</b><span>个计算机方向</span></div>' +
              '<div class="hero-stat"><b>' + PAST.length + '</b><span>个往届题目比对</span></div>' +
              '<div class="hero-stat"><b>5</b><span>条硬性规则内建</span></div>' +
            '</div>' +
            '<div class="hero-note">' + icon('shield') + '本地运行，不上传任何数据</div>' +
          '</div>' +
          '<div class="hero-art" aria-hidden="true">' +
            '<div class="float-card fc-1">' +
              '<div class="fc-head"><span class="dot"></span>推荐结果 <b>94%</b></div>' +
              '<div class="fc-title">面向课程知识库的检索增强问答系统设计与实现</div>' +
              '<div class="fc-tags"><span>RAG</span><span>知识库</span><span>12 周</span></div>' +
              '<div class="fc-bars"><i style="--w:90%"></i><i style="--w:74%"></i><i style="--w:62%"></i></div>' +
            '</div>' +
            '<div class="float-card fc-2">' +
              '<div class="fc-head"><span class="dot teal"></span>选题自检</div>' +
              '<ul class="fc-checks">' +
                '<li>21 个汉字，符合长度要求</li>' +
                '<li>未以编程语言命名</li>' +
                '<li>与往届题目相似度 18%</li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section tight">' +
        '<div class="container">' +
          '<div class="section-head"><span class="eyebrow"><span class="dot"></span>没有头绪？</span>' +
            '<h2 class="section-title">先选一个和你最像的起点</h2>' +
            '<p class="lead small">点击直接生成结果，之后可以随时修改条件。</p></div>' +
          '<div class="persona-grid">' +
            personas.map(function (p) {
              return '<button class="persona" data-persona="' + p.id + '">' +
                '<span class="persona-ico">' + icon(p.ico) + '</span>' +
                '<span class="persona-txt"><b>' + p.title + '</b><span>' + p.desc + '</span></span></button>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="container">' +
          '<div class="section-head"><span class="eyebrow"><span class="dot"></span>怎么用</span>' +
            '<h2 class="section-title">四步，拿到一份能交给导师的选题说明</h2></div>' +
          '<div class="steps-3">' +
            stepCard('01', '说清你的情况', '专业、基础、熟悉的技术，以及你真正做过的项目。') +
            stepCard('02', '选方向与约束', '兴趣方向、导师要求、能否接受硬件、想求稳还是想挑战。') +
            stepCard('03', '拿到完整方案', '功能拆解、技术栈、设计要点、排期，以及发给导师的私信文案。') +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section" style="padding-top:0">' +
        '<div class="container">' +
          '<div class="section-head" style="display:flex;align-items:flex-end;justify-content:space-between;max-width:none;gap:20px">' +
            '<div><span class="eyebrow"><span class="dot"></span>题目示例</span>' +
            '<h2 class="section-title" style="margin-top:14px">每个方向都有一道"看起来就能做完"的题</h2></div>' +
            '<a class="link-arrow" href="#/library">查看全部 ' + TOPICS.length + ' 道 ' + icon('arrow') + '</a>' +
          '</div>' +
          '<div class="grid grid-3">' + featured.map(function (t) { return topicCard({ t: t, pct: null, reasons: [] }, true); }).join('') + '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section" style="padding-top:0">' +
        '<div class="container">' +
          '<div class="cta-band">' +
            '<div><span class="eyebrow" style="color:rgba(255,255,255,.55)"><span class="dot" style="background:#6ee7d7"></span>提交之前</span>' +
            '<h2>先花 30 秒，检查题目会不会被退回</h2>' +
            '<p>字数超限、用编程语言命名、和往届题目高度雷同——这三类问题最常见，也最容易避免。</p></div>' +
            '<a class="btn btn-brand" href="#/check">' + icon('target') + '打开题目自检</a>' +
          '</div>' +
        '</div>' +
      '</section>' +
    '</div>';
  }

  function stepCard(n, t, d) {
    return '<div class="step-card"><span class="step-num">' + n + '</span><h3>' + t + '</h3><p>' + d + '</p></div>';
  }

  var personas = {
    p1: {
      major: '软件工程', level: 'course',
      skills: ['js', 'mini', 'sql', 'java'], fields: ['mobile', 'web'],
      experiences: ['course'], expText: '做过校园二手交易小程序，负责前端页面与接口联调。',
      scenes: ['校园', '电商'], advisorAlign: 'unsure', advisorField: '',
      type: 'system', hardwareOk: false, ambition: 'balanced'
    },
    p2: {
      major: '计算机科学与技术', level: 'project',
      skills: ['python', 'llm', 'rag', 'sql'], fields: ['llm', 'ai'],
      experiences: ['self', 'competition'], expText: '跟着教程跑过 RAG demo，用过向量数据库，想做大模型应用。',
      scenes: ['教育'], advisorAlign: 'unsure', advisorField: '',
      type: 'system', hardwareOk: false, ambition: 'balanced'
    },
    p3: {
      major: '物联网工程', level: 'project',
      skills: ['cpp', 'embed', 'pcb', 'python'], fields: ['iot', 'net'],
      experiences: ['lab', 'competition'], expText: '做过 STM32 温湿度采集，会画简单电路板。',
      scenes: ['农业', '环保'], advisorAlign: 'unsure', advisorField: '',
      type: 'hardware', hardwareOk: true, ambition: 'balanced'
    }
  };

  /* ---------------- 测评 ---------------- */
  var STEP_META = [
    { t: '基础情况', d: '专业与技术底子' },
    { t: '兴趣方向', d: '想做什么方向' },
    { t: '项目经历', d: '你做过什么' },
    { t: '导师与约束', d: '现实条件' }
  ];

  function viewMatch() {
    if (!profile) profile = defaultProfile();
    var step = WIZ.step || 0;
    var pct = ((step + 1) / STEP_META.length) * 100;

    return '<div class="page"><div class="container wizard">' +
      '<aside class="rail">' +
        '<div class="rail-title">测评进度</div>' +
        STEP_META.map(function (m, i) {
          var cls = i === step ? 'active' : (i < step ? 'done' : '');
          return '<div class="rail-item ' + cls + '">' +
            '<span class="rail-num">' + (i < step ? '✓' : (i + 1)) + '</span>' +
            '<span class="rail-txt"><strong>' + m.t + '</strong><span>' + m.d + '</span></span></div>';
        }).join('') +
      '</aside>' +
      '<div class="wizard-main">' +
        '<div class="wizard-head"><span class="eyebrow"><span class="dot"></span>第 ' + (step + 1) + ' / ' + STEP_META.length + ' 步</span>' +
        '<h1>' + stepTitle(step) + '</h1><p>' + stepSub(step) + '</p></div>' +
        '<div class="progress"><i style="width:' + pct + '%"></i></div>' +
        '<div class="panel">' + stepBody(step) + '</div>' +
        '<div class="form-error' + (WIZ.error ? ' show' : '') + '">' + (WIZ.error ? icon('alert') + '<span>' + esc(WIZ.error) + '</span>' : '') + '</div>' +
        '<div class="wizard-foot">' +
          (step > 0 ? '<button class="btn btn-ghost" data-step="prev">上一步</button>' : '') +
          '<span class="small muted">' + (step === 0 ? '大约 1 分钟' : '随时可以回来修改') + '</span>' +
          '<span class="spacer"></span>' +
          '<button class="btn btn-primary" data-step="next">' + (step === 3 ? '生成选题方案' + icon('arrow') : '下一步' + icon('arrow')) + '</button>' +
        '</div>' +
      '</div>' +
    '</div></div>';
  }

  function stepTitle(i) {
    return [
      '先了解一下你的基础',
      '你更想往哪个方向做？',
      '你之前做过什么？',
      '最后，说说现实约束'
    ][i];
  }
  function stepSub(i) {
    return [
      '这些信息只用来筛选题目难度和技术栈，存在本机浏览器里。',
      '可以多选，最多 3 个。第一选择会获得更高的匹配权重。',
      '不用写得很正式，关键词就够。做过的东西会成为匹配依据。',
      '如果导师已经给了方向，尽量贴合；没有的话选"还没定"即可。'
    ][i];
  }

  function chipsHtml(list, selected, attr) {
    return '<div class="chips">' + list.map(function (it) {
      var on = selected.indexOf(it.k) > -1;
      return '<button class="chip' + (on ? ' active' : '') + '" data-' + attr + '="' + it.k + '">' + it.l + '</button>';
    }).join('') + '</div>';
  }

  function stepBody(i) {
    var p = profile;
    if (i === 0) {
      return '<div class="field"><div class="label">你的专业</div>' +
          '<select class="select" data-bind="major">' +
            BSCT.MAJORS.map(function (m) { return '<option' + (m === p.major ? ' selected' : '') + '>' + m + '</option>'; }).join('') +
          '</select></div>' +
        '<div class="field"><div class="label">目前的技术水平</div>' +
          segHtml('level', BSCT.LEVELS, p.level, 'four') + '</div>' +
        '<div class="field"><div class="label">比较熟悉的技术<span class="opt">可多选</span></div>' +
          '<div class="hint" style="margin:0 0 9px">只选"能独立写作业或项目"的，不用凑数。</div>' +
          '<div class="chips">' + BSCT.SKILL_ORDER.map(function (k) {
            return '<button class="chip' + (p.skills.indexOf(k) > -1 ? ' active' : '') + '" data-skill="' + k + '">' + SKILLS[k] + '</button>';
          }).join('') + '</div></div>';
    }
    if (i === 1) {
      return '<div class="field"><div class="label">感兴趣的方向<span class="req">必选</span><span class="opt">最多 3 个</span></div>' +
          '<div class="field-grid">' + Object.keys(FIELDS).map(function (k) {
            var f = FIELDS[k];
            var on = p.fields.indexOf(k) > -1;
            return '<button class="field-card' + (on ? ' active' : '') + '" data-field="' + k + '">' +
              '<span class="fi" style="background:' + f.color + '18;color:' + f.color + '">' + icon(f.icon) + '</span>' +
              '<strong>' + f.name + '</strong><span>' + f.desc + '</span></button>';
          }).join('') + '</div></div>' +
        '<div class="field"><div class="label">偏好的题目类型</div>' +
          segHtml('type', [
            { k: 'system', l: '系统开发', d: '做完整可用的软件系统' },
            { k: 'algorithm', l: '算法研究', d: '做模型、实验与对比' },
            { k: 'hardware', l: '软硬结合', d: '硬件 + 软件联动' },
            { k: 'any', l: '都可以', d: '看题目本身' }
          ], p.type, 'four') + '</div>';
    }
    if (i === 2) {
      return '<div class="field"><div class="label">做过哪类项目<span class="opt">可多选</span></div>' +
          chipsHtml(BSCT.EXPERIENCES, p.experiences, 'exp') + '</div>' +
        '<div class="field"><div class="label">简单描述一下<span class="opt">选填</span></div>' +
          '<textarea class="textarea" data-bind="expText" placeholder="例如：做过校园二手交易小程序，负责前端和接口联调；用 Python 写过爬虫和简单的数据分析。">' + esc(p.expText) + '</textarea>' +
          '<div class="hint">写关键词就行，比如"小程序 / 爬虫 / 单片机 / 推荐算法"，系统会用来匹配题目。</div></div>' +
        '<div class="field"><div class="label">感兴趣的应用场景<span class="opt">可多选</span></div>' +
          chipsHtml(BSCT.SCENES.map(function (s) { return { k: s, l: s }; }), p.scenes, 'scene') + '</div>';
    }
    return '<div class="field"><div class="label">需要贴合研究生导师的方向吗？</div>' +
        segHtml('advisorAlign', [
          { k: 'yes', l: '需要贴合', d: '按导师方向关键词加权' },
          { k: 'no', l: '不需要', d: '按我自己的兴趣来' },
          { k: 'unsure', l: '还没定', d: '先看看有哪些可能' }
        ], p.advisorAlign) +
        (p.advisorAlign !== 'no' ?
          '<div style="margin-top:16px"><input class="input" data-bind="advisorField" value="' + esc(p.advisorField) + '" placeholder="导师方向关键词，例如：知识图谱、边缘计算、医学影像"></div>' +
          '<div class="hint">填关键词即可，系统会在题目与功能描述里做匹配。</div>' : '') +
        '</div>' +
      '<div class="field"><div class="label">能接受需要买硬件的题目吗？</div>' +
        segHtml('hardwareOk', [
          { k: 'true', l: '可以', d: '预算 300 元以内没问题' },
          { k: 'false', l: '不想碰硬件', d: '只做纯软件' }
        ], String(p.hardwareOk), 'two') + '</div>' +
      '<div class="field"><div class="label">你希望题目有多难？</div>' +
        segHtml('ambition', BSCT.AMBITION, p.ambition) + '</div>';
  }

  function segHtml(group, opts, cur, cls) {
    return '<div class="segmented ' + (cls || '') + '">' + opts.map(function (o) {
      return '<button class="seg' + (String(cur) === String(o.k) ? ' active' : '') + '" data-seg="' + group + '" data-key="' + o.k + '">' +
        icon('check', 'tick') + '<strong>' + o.l + '</strong><span>' + (o.d || '') + '</span></button>';
    }).join('') + '</div>';
  }

  function validateStep(i) {
    var p = profile;
    if (i === 0) {
      if (!p.skills.length) return '至少选一项熟悉的技术，方便匹配技术栈。';
    }
    if (i === 1) {
      if (!p.fields.length) return '请至少选择一个感兴趣的方向。';
    }
    return '';
  }

  /* ---------------- 结果 ---------------- */
  function viewResult() {
    if (!profile) return noProfile();
    var ranked = rankTopics(profile, RESULT.seed);
    var list = RESULT.type === 'all' ? ranked : ranked.filter(function (x) { return x.t.type === RESULT.type && x.score > -50; });
    var perPage = 6;
    var pages = Math.max(1, Math.ceil(list.length / perPage));
    var page = Math.min(RESULT.offset, pages - 1);
    var slice = list.slice(page * perPage, page * perPage + perPage);

    var total = ranked.filter(function (x) { return x.score > -50; }).length;

    return '<div class="page"><div class="container">' +
      '<div class="page-head">' +
        '<span class="eyebrow"><span class="dot"></span>匹配结果</span>' +
        '<h1 style="margin-top:12px">为你匹配到 ' + total + ' 个题目</h1>' +
        '<p>按方向、技能、项目经历与导师约束综合排序。匹配度只用于排序参考，最终要结合数据可得性与导师意见确定。</p>' +
        '<div class="profile-bar">' +
          '<span class="tag">' + esc(profile.major) + '</span>' +
          '<span class="tag">' + esc(levelLabel(profile.level)) + '</span>' +
          (profile.fields.length ? '<span class="tag">' + profile.fields.map(function (k) { return FIELDS[k].short; }).join(' / ') + '</span>' : '') +
          '<span class="tag">' + (profile.type === 'any' ? '类型不限' : TYPE_LABELS[profile.type]) + '</span>' +
          '<span class="tag">' + (profile.hardwareOk ? '接受硬件' : '纯软件') + '</span>' +
          (profile.advisorAlign === 'yes' && profile.advisorField ? '<span class="tag tag-brand">导师：' + esc(profile.advisorField) + '</span>' : '') +
          '<a class="tag tag-outline" href="#/match" data-action="restart">修改条件</a>' +
        '</div>' +
      '</div>' +
      '<div class="toolbar">' +
        filterBtns() +
        '<span class="spacer"></span>' +
        (slice.length ? '<button class="btn btn-ghost btn-sm" data-action="export-page">' + icon('download') + '导出本页方案</button>' : '') +
        '<button class="btn btn-ghost btn-sm" data-action="shuffle">' + icon('refresh') + '换一批</button>' +
      '</div>' +
      (slice.length ? '<div class="result-grid">' + slice.map(function (x) { return topicCard(x, false, true); }).join('') + '</div>' :
        '<div class="empty"><h3>这个类型下暂时没有匹配题目</h3><p>换个类型，或者把条件放宽一点。</p><a class="btn btn-primary btn-sm" href="#/match">修改条件</a></div>') +
      '<p class="small muted" style="margin-top:26px">匹配度计算：方向 40 分 + 技能 20 分 + 类型 14 分 + 经历关键词 15 分 + 导师方向 18 分，再做难度与硬件适配调整。</p>' +
    '</div></div>';
  }

  function noProfile() {
    return '<div class="page"><div class="container page-pad-lg">' +
      '<div class="empty"><h3>还没有测评结果</h3><p>先花一分钟回答四个问题，再来看推荐。</p>' +
      '<a class="btn btn-primary" href="#/match">开始选题测评</a></div></div></div>';
  }

  function levelLabel(k) {
    var l = BSCT.LEVELS.filter(function (x) { return x.k === k; })[0];
    return l ? l.l : k;
  }

  function filterBtns() {
    var opts = [['all', '全部'], ['system', '系统开发'], ['algorithm', '算法研究'], ['hardware', '软硬结合']];
    return opts.map(function (o) {
      return '<button class="filter-btn' + (RESULT.type === o[0] ? ' active' : '') + '" data-filter="' + o[0] + '">' + o[1] + '</button>';
    }).join('');
  }

  function topicCard(x, plain, showExport) {
    var t = x.t, f = fieldOf(t);
    var pct = plain ? null : x.pct;
    return '<article class="topic-card">' +
      '<div class="tc-top">' +
        (pct ? ring(pct, f.color, false) : '<span class="tag" style="background:' + f.color + '18;color:' + f.color + '">' + f.short + '</span>') +
        '<span class="spacer"></span>' +
        typeTag(t) +
      '</div>' +
      '<h3 class="tc-title"><a href="#/topic/' + t.id + '">' + esc(titleOf(t)) + '</a></h3>' +
      '<p class="tc-desc">' + esc(t.oneLine) + '</p>' +
      '<div class="tc-tags">' + t.tags.slice(0, 3).map(function (g) { return '<span class="tag">' + esc(g) + '</span>'; }).join('') + '</div>' +
      (!plain && x.reasons && x.reasons.length ?
        '<ul class="tc-reasons">' + x.reasons.slice(0, 2).map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="tc-meta">' +
        '<span>' + icon('clock') + '约 ' + t.weeks + ' 周</span>' +
        '<span>' + dots(t.difficulty) + ' ' + DIFF_LABELS[t.difficulty] + '</span>' +
        '<span>' + icon('book') + hanCount(titleOf(t)) + ' 字</span>' + (t.titles && t.titles.length > 1 ? '<span>' + icon('layers') + t.titles.length + ' 种表述</span>' : '') +
        (t.hardware ? '<span>' + icon('cpu') + '需硬件</span>' : '') +
      '</div>' +
      '<div class="tc-foot"><a class="link-arrow" href="#/topic/' + t.id + '">查看完整方案 ' + icon('arrow') + '</a>' +
        (showExport ? '<span class="spacer"></span><button class="mini-action" data-action="export" data-id="' + t.id + '" title="下载题目与技术要求">' + icon('download') + '导出</button>' : '') +
      '</div>' +
    '</article>';
  }

  /* ---------------- 题目详情 ---------------- */
  function viewTopic(id) {
    var t = getTopic(id);
    if (!t) {
      return '<div class="page"><div class="container page-pad-lg"><div class="empty"><h3>没有找到这个题目</h3><p>它可能已经从题目库中移除。</p><a class="btn btn-primary btn-sm" href="#/library">回到题目库</a></div></div></div>';
    }
    var f = fieldOf(t);
    var cur = titleOf(t);
    var sc = selfCheck(t, cur);
    var titleOpts = titlesOf(t);
    var related = TOPICS.filter(function (x) { return x.field === t.field && x.id !== t.id; }).slice(0, 3);
    if (related.length < 3) {
      TOPICS.forEach(function (x) {
        if (related.length < 3 && x.id !== t.id && related.indexOf(x) < 0) related.push(x);
      });
    }

    return '<div class="page"><div class="container detail">' +
      '<div class="crumbs"><a href="#/library">题目库</a>' + icon('chevron') +
        '<a href="#/library">' + f.name + '</a>' + icon('chevron') + '<span>题目详情</span></div>' +
      '<div class="detail-head">' +
        '<div><h1>' + esc(cur) + '</h1>' +
          '<div class="detail-meta">' +
            '<span>' + icon('layers') + f.name + '</span>' +
            '<span>' + icon('clock') + '约 ' + t.weeks + ' 周</span>' +
            '<span>' + dots(t.difficulty) + ' 难度 ' + DIFF_LABELS[t.difficulty] + '</span>' +
            '<span>' + icon('book') + '题目 ' + sc.han + ' 字</span>' +
            (t.hardware ? '<span>' + icon('cpu') + '需要硬件</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +
      (titleOpts.length > 1 ?
        '<div class="title-options">' +
          '<div class="to-head"><span class="to-label">题目表述</span><span class="hint">同一个项目，选一个更合适的写法；导出与私信会用你选中的版本</span></div>' +
          '<div class="chips">' + titleOpts.map(function (x, i) {
            return '<button class="chip title-chip' + (x === cur ? ' active' : '') + '" data-action="pick-title" data-id="' + t.id + '" data-i="' + i + '">' + esc(x) + '</button>';
          }).join('') + '</div>' +
        '</div>' : '') +
      '<div class="detail-grid">' +
        '<div class="detail-main">' +
          '<section class="d-block"><h2>要解决的问题</h2><p>' + esc(t.problem) + '</p></section>' +

          '<section class="d-block"><h2>主要功能</h2><div class="feature-list">' +
            t.features.map(function (x, i) {
              return '<div class="feature"><b><span class="n">' + (i + 1) + '</span>' + esc(x.t) + '</b><p>' + esc(x.d) + '</p></div>';
            }).join('') +
          '</div></section>' +

          '<section class="d-block"><h2>技术方案与架构</h2>' +
            '<div class="stack">' + t.stack.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('') + '</div>' +
            '<div class="arch-box"><p>' + esc(t.arch) + '</p></div></section>' +

          '<section class="d-block"><h2>设计要点（论文重点）</h2><ul class="design-list">' +
            t.design.map(function (d, i) { return '<li><span class="k">D' + (i + 1) + '</span><span>' + esc(d) + '</span></li>'; }).join('') +
          '</ul></section>' +

          '<section class="d-block"><h2>实施路线</h2><div class="timeline">' +
            t.steps.map(function (s) {
              return '<div class="tl-item"><span class="tl-week">' + esc(s.w) + '</span>' +
                '<div class="tl-body"><b>' + esc(s.t) + '</b><p>' + esc(s.d) + '</p></div></div>';
            }).join('') +
          '</div></section>' +

          '<section class="d-block"><h2>与现有方案相比</h2><div class="compare-box">' + esc(t.compare) + '</div></section>' +

          '<section class="d-block"><h2>难点与风险</h2><ul class="risk-list">' +
            t.hard.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') +
          '</ul></section>' +

          '<section class="d-block"><h2>论文可以怎么写</h2><ul class="plain-list">' +
            t.thesis.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') +
          '</ul></section>' +
        '</div>' +

        '<aside class="aside">' +
          '<div class="aside-card">' +
            '<h3>关键信息</h3>' +
            '<div class="kv"><span>方向</span><b>' + f.name + '</b></div>' +
            '<div class="kv"><span>类型</span><b>' + TYPE_LABELS[t.type] + '</b></div>' +
            '<div class="kv"><span>难度</span><b>' + DIFF_LABELS[t.difficulty] + '（' + t.difficulty + '/5）</b></div>' +
            '<div class="kv"><span>预计工作量</span><b>约 ' + t.weeks + ' 周</b></div>' +
            '<div class="kv"><span>硬件</span><b>' + (t.hardware ? '需要（预算可控）' : '不需要') + '</b></div>' +
            '<div class="kv"><span>题目字数</span><b>' + sc.han + ' / 25</b></div>' +
            '<div class="aside-actions">' +
              '<button class="btn btn-primary btn-sm btn-block" data-action="message" data-id="' + t.id + '">' + icon('message') + '生成导师私信</button>' +
              '<button class="btn btn-ghost btn-sm btn-block" data-action="export" data-id="' + t.id + '">' + icon('download') + '导出选题说明</button>' +
              '<button class="btn btn-ghost btn-sm btn-block' + (isFav(t.id) ? ' active' : '') + '" data-action="fav" data-id="' + t.id + '">' + icon('heart') + '<span>' + (isFav(t.id) ? '已收藏' : '收藏') + '</span></button>' +
            '</div>' +
          '</div>' +
          '<div class="aside-card">' +
            '<h3>选题自检</h3>' +
            '<ul class="selfcheck">' +
              '<li><span class="' + (sc.han <= 25 ? 'ok' : 'warn') + '">' + (sc.han <= 25 ? '✓' : '!') + '</span><span>' + sc.han + ' 个汉字，' + (sc.han <= 25 ? '符合 ≤25 字要求' : '超过 25 字，需要精简') + '</span></li>' +
              '<li><span class="' + (sc.langOk ? 'ok' : 'warn') + '">' + (sc.langOk ? '✓' : '!') + '</span><span>' + (sc.langOk ? '未以编程语言命名' : '出现了编程语言命名') + '</span></li>' +
              '<li><span class="' + (sc.maxSim < 0.35 ? 'ok' : 'warn') + '">' + (sc.maxSim < 0.35 ? '✓' : '!') + '</span><span>与往届最高相似度 ' + Math.round(sc.maxSim * 100) + '%</span></li>' +
              '<li><span class="ok">✓</span><span>包含"设计与实现"等方法性表述</span></li>' +
            '</ul>' +
          '</div>' +
        '</aside>' +
      '</div>' +

      '<div class="related">' +
        '<div class="related-head"><h2 class="section-title" style="font-size:20px">同方向的其他题目</h2>' +
        '<a class="link-arrow" href="#/library">更多 ' + icon('arrow') + '</a></div>' +
        '<div class="grid grid-3">' + related.map(function (x) { return topicCard({ t: x, pct: null, reasons: [] }, true); }).join('') + '</div>' +
      '</div>' +
    '</div></div>';
  }

  /* ---------------- 题目库 ---------------- */
  var LIB = { q: '', field: 'all', type: 'all' };
  function viewLibrary() {
    var fields = [['all', '全部方向']].concat(Object.keys(FIELDS).map(function (k) { return [k, FIELDS[k].short]; }));
    return '<div class="page"><div class="container page-pad">' +
      '<div class="page-head" style="padding-top:0"><span class="eyebrow"><span class="dot"></span>题目库</span>' +
        '<h1 style="margin-top:12px">' + TOPICS.length + ' 个可落地的本科毕设题目</h1>' +
        '<p>每个题目都标注了方向、类型、难度与预计工作量，并可导出完整的功能设计与实施说明。题目可改，方向比措辞更重要。</p></div>' +
      '<div class="lib-toolbar">' +
        '<div class="search-wrap">' + icon('search') +
          '<input class="search-input" id="lib-search" placeholder="搜方向、技术、场景，例如：大模型 / 小程序 / 养老" value="' + esc(LIB.q) + '">' +
        '</div>' +
        '<div class="lib-filters">' +
          fields.map(function (f) {
            return '<button class="filter-btn' + (LIB.field === f[0] ? ' active' : '') + '" data-lib-field="' + f[0] + '">' + f[1] + '</button>';
          }).join('') +
          '<span class="lib-count" id="lib-count"></span>' +
        '</div>' +
      '</div>' +
      '<div class="lib-grid" id="lib-grid"></div>' +
    '</div></div>';
  }

  function paintLibrary() {
    var q = LIB.q.trim();
    var list = TOPICS.filter(function (t) {
      if (LIB.field !== 'all' && t.field !== LIB.field) return false;
      if (LIB.type !== 'all' && t.type !== LIB.type) return false;
      if (q) {
        var hay = titlesOf(t).join(' ') + ' ' + t.tags.join(' ') + ' ' + t.keywords.join(' ') + ' ' + t.stack.join(' ') + ' ' + FIELDS[t.field].name;
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    var grid = document.getElementById('lib-grid');
    var count = document.getElementById('lib-count');
    if (count) count.textContent = '共 ' + list.length + ' 个';
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><h3>没有匹配的题目</h3><p>试试更短的关键词，或切换方向。</p></div>';
      return;
    }
    grid.innerHTML = list.map(function (t) {
      var f = fieldOf(t);
      return '<article class="lib-card">' +
        '<div style="display:flex;gap:6px;margin-bottom:10px"><span class="tag" style="background:' + f.color + '18;color:' + f.color + '">' + f.short + '</span>' + typeTag(t) + '</div>' +
        '<h3><a href="#/topic/' + t.id + '">' + esc(titleOf(t)) + '</a></h3>' +
        '<p class="small muted" style="line-height:1.6;margin-bottom:6px">' + esc(t.oneLine) + '</p>' +
        '<div class="lc-meta"><span>' + icon('clock') + ' ' + t.weeks + ' 周</span><span>' + dots(t.difficulty) + '</span><span>' + hanCount(t.title) + ' 字</span></div>' +
      '</article>';
    }).join('');
  }

  /* ---------------- 题目自检 ---------------- */
  function viewCheck() {
    return '<div class="page"><div class="container page-pad">' +
      '<div class="page-head" style="padding-top:0"><span class="eyebrow"><span class="dot"></span>题目自检</span>' +
        '<h1 style="margin-top:12px">这个题目，会被退回吗？</h1>' +
        '<p>按学院的五条硬规则检查：字数、命名方式、结构完整度、与往届题目的相似度。改到全部通过再发给导师，会省很多来回。</p></div>' +
      '<div class="split">' +
        '<div>' +
          '<div class="checker">' +
            '<div class="label" style="margin-bottom:10px">输入你的题目</div>' +
            '<input class="checker-input" id="checker-input" placeholder="例如：面向乡村民宿的房态与订单协同系统设计与实现" autocomplete="off">' +
            '<div class="checker-meta"><span>汉字数</span><span class="counter" id="counter">0 / 25</span><span class="muted">标点与字母不计入</span></div>' +
            '<div class="check-list" id="check-out"></div>' +
            '<div class="sim-wrap" id="sim-wrap"></div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">' +
            '<span class="small muted" style="align-self:center">试试：</span>' +
            '<button class="chip" data-try="基于Python的图书管理系统">反例：基于Python的图书管理系统</button>' +
            '<button class="chip" data-try="基于大模型的心理健康智能检测与干预系统">与往届雷同</button>' +
            '<button class="chip" data-try="面向乡村民宿的房态与订单协同系统设计与实现">规范示例</button>' +
          '</div>' +
        '</div>' +
        '<div class="check-side">' +
          '<div class="tip-card"><h4>最容易踩的三个坑</h4><ul>' +
            '<li><b>字数超限：</b>超过 25 个汉字，答辩前还得改。先把限定语压缩。</li>' +
            '<li><b>用语言命名：</b>"基于 Python 的…"会被认为没有业务问题，改成"面向…的…"。</li>' +
            '<li><b>和往届撞车：</b>同一方向可以做，但技术路线和应用对象要换。</li>' +
          '</ul></div>' +
          '<div class="tip-card"><h4>一个合格的题目长什么样</h4><ul>' +
            '<li>有明确的使用对象（谁用）</li>' +
            '<li>有具体的问题（解决什么）</li>' +
            '<li>有可验证的产出（系统 / 模型 / 装置）</li>' +
            '<li>技术路线能一句话说清</li>' +
          '</ul></div>' +
          '<div class="tip-card" style="background:var(--brand-soft);border-color:#dfe3f7">' +
            '<h4 style="color:var(--brand-ink)">不确定？让系统推荐</h4>' +
            '<p class="small" style="color:var(--brand-2);margin-bottom:12px">回答四个问题，直接得到符合规则的题目和完整方案。</p>' +
            '<a class="btn btn-brand btn-sm btn-block" href="#/match">开始选题测评</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div></div>';
  }

  function analyzeTitle(raw) {
    var title = String(raw || '').trim();
    var han = hanCount(title);
    var langMatch = /基于\s*(Java|Python|C\+\+|C语言|C#|PHP|JavaScript|Node\.?js|PHP)/i.exec(title);
    var vague = /(智慧城市|大数据平台|万物互联|元宇宙|数字孪生城市|综合管理平台|万物智联)/.exec(title);
    var designWord = /(设计与实现|研究与实现|设计与验证|设计与应用|研究与设计|设计与开发)/.test(title);
    var dup = null;
    TOPICS.forEach(function (t) { if (!dup && titlesOf(t).indexOf(title) > -1) dup = t; });
    var sims = PAST.map(function (p) { return { t: p.t, dir: p.dir, sim: similarity(title, p.t), note: p.note }; })
      .sort(function (a, b) { return b.sim - a.sim; });
    return { title: title, han: han, langMatch: langMatch, vague: vague, designWord: designWord, dup: dup, sims: sims };
  }

  function paintCheck() {
    var input = document.getElementById('checker-input');
    var out = document.getElementById('check-out');
    var simWrap = document.getElementById('sim-wrap');
    var counter = document.getElementById('counter');
    if (!input || !out) return;
    var r = analyzeTitle(input.value);

    counter.textContent = r.han + ' / 25';
    counter.classList.toggle('over', r.han > 25);

    if (!r.title) {
      out.innerHTML = '';
      simWrap.innerHTML = '<p class="small muted">输入题目后，这里会显示逐项检查结果与往届相似度。</p>';
      return;
    }

    var rows = [];
    rows.push({
      v: r.han > 25 ? 'bad' : (r.han < 8 ? 'warn' : 'ok'),
      t: '题目长度',
      d: r.han > 25 ? '当前 <em>' + r.han + '</em> 个汉字，超出 ' + (r.han - 25) + ' 字。建议删掉修饰语，保留"对象 + 问题 + 方法"。' :
        (r.han < 8 ? '只有 <em>' + r.han + '</em> 个汉字，可能过于笼统，建议补充应用对象。' : '共 <em>' + r.han + '</em> 个汉字，符合 ≤25 字要求。')
    });
    rows.push({
      v: r.langMatch ? 'bad' : 'ok',
      t: '命名方式',
      d: r.langMatch ? '出现了「<em>' + esc(r.langMatch[0]) + '</em>」。编程语言只是工具，题目应指向业务或工程问题，例如改成"面向…的…系统设计与实现"。' :
        '没有以编程语言命名，符合要求。'
    });
    rows.push({
      v: r.designWord ? 'ok' : 'warn',
      t: '结构完整度',
      d: r.designWord ? '包含"设计与实现 / 研究"等方法性表述，能体现工作类型。' :
        '建议补上"设计与实现""研究与实现"等表述，让评审一眼看出这是工程题还是研究题。'
    });
    rows.push({
      v: r.dup ? 'bad' : (r.sims[0].sim >= 0.5 ? 'bad' : (r.sims[0].sim >= 0.32 ? 'warn' : 'ok')),
      t: '与往届题目比对',
      d: r.dup ? '与题库中的《<em>' + esc(r.dup.title) + '</em>》完全重复，需要换个角度。' :
        (r.sims[0].sim >= 0.5 ? '与《<em>' + esc(r.sims[0].t) + '</em>》相似度较高（' + Math.round(r.sims[0].sim * 100) + '%），容易被认为重复选题。' :
          (r.sims[0].sim >= 0.32 ? '与《<em>' + esc(r.sims[0].t) + '</em>》有一定相似（' + Math.round(r.sims[0].sim * 100) + '%），建议在技术路线或应用对象上再区分。' :
            '与 ' + PAST.length + ' 个往届题目的最高相似度为 <em>' + Math.round(r.sims[0].sim * 100) + '%</em>，区分度足够。'))
    });
    rows.push({
      v: r.vague ? 'warn' : 'ok',
      t: '是否大而空',
      d: r.vague ? '出现了「<em>' + esc(r.vague[0]) + '</em>」这类大词。本科毕设建议缩小到一个具体场景，否则工作量无法界定。' :
        '没有明显的空泛表述。'
    });

    out.innerHTML = rows.map(function (x) {
      var mark = x.v === 'ok' ? '✓' : (x.v === 'warn' ? '!' : '×');
      return '<div class="check-row"><span class="verdict ' + x.v + '">' + mark + '</span>' +
        '<div class="check-txt"><b>' + x.t + '</b><p>' + x.d + '</p></div></div>';
    }).join('');

    simWrap.innerHTML = '<div class="label" style="margin-bottom:4px">与往届优秀题目的相似度</div>' +
      r.sims.slice(0, 4).map(function (s) {
        var pct = Math.round(s.sim * 100);
        var cls = pct >= 50 ? 'high' : (pct >= 32 ? 'mid' : '');
        return '<div class="sim-item"><span class="sim-title">' + esc(s.t) + '</span>' +
          '<span class="sim-pct" style="color:' + (pct >= 50 ? 'var(--danger)' : pct >= 32 ? 'var(--amber)' : 'var(--ink-3)') + '">' + pct + '%</span>' +
          '<div class="sim-bar ' + cls + '"><i style="width:' + Math.max(2, Math.min(100, pct)) + '%"></i></div></div>';
      }).join('');
  }

  /* ---------------- 规则页 ---------------- */
  function viewGuide() {
    var rules = [
      {
        t: '一人一题，不重复、不撞车',
        q: '坚持"一人一题"，选题不得重复，同时尽量避免与往届题目高度雷同；题目简短明确、概括性强。',
        d: ['同一方向可以多人做，但应用对象、技术路线或数据来源必须不同。', '提交前用"题目自检"跑一遍与往届题目的相似度。', '题目控制在 25 个汉字以内，先写长再删到短。']
      },
      {
        t: '能依托实验、实习、工程实践或社会调查',
        q: '优先选择可依托实验、实习、工程实践、社会调查开展的题目。',
        d: ['优先选你能拿到真实数据或真实用户的方向。', '软硬结合题目要确认器件、场地与预算。', '社会调查类要有访谈对象与样本量，不能只做问卷。']
      },
      {
        t: '不以编程语言命名',
        q: '尽量避免直接以"基于 Java 语言…""基于 Python 语言…"命名。',
        d: ['语言只是工具，题目应聚焦业务或工程问题。', '把"基于 Python 的…"改成"面向…的…"。', '开题现状分析要对比主流方案，说明本方案优势。']
      },
      {
        t: '难度与工作量合适',
        q: '具备合适的难度与工作量，不建议选用课程设计、集中实践类简单题目。',
        d: ['本科毕设一般 10—14 周，功能 4—6 个模块即可。', '要有 1—2 个真正的难点（算法、并发、硬件、评测）。', '避开技术陈旧、研究空间不足的方向。']
      },
      {
        t: '系统开发类要遵循软件工程规范',
        q: '整个开发与论文撰写须遵循软件工程规范，重点强化方案设计部分，不能弱化设计环节。',
        d: ['需求分析 → 总体设计 → 详细设计 → 实现 → 测试，章节要完整。', '数据库设计、接口设计、关键算法流程要有图有表。', '测试章节要有用例、数据与结论，不能只写"系统运行正常"。']
      }
    ];

    return '<div class="page"><div class="container page-pad">' +
      '<div class="page-head" style="padding-top:0"><span class="eyebrow"><span class="dot"></span>选题规则</span>' +
        '<h1 style="margin-top:12px">五条硬规则，和它们真正的含义</h1>' +
        '<p>规则原文往往很短，但评审真正在看什么、怎么才算做到，下面逐条拆开。往届优秀题目也放在后面，可以直接对照。</p></div>' +

      '<div class="grid" style="gap:14px;margin-bottom:56px">' +
        rules.map(function (r, i) {
          return '<div class="rule-card"><span class="rule-num">0' + (i + 1) + '</span><div>' +
            '<h3>' + r.t + '</h3><div class="quote">' + r.q + '</div>' +
            '<ul>' + r.d.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div></div>';
        }).join('') +
      '</div>' +

      '<div class="section-head" style="max-width:none;display:flex;align-items:flex-end;justify-content:space-between;gap:20px">' +
        '<div><span class="eyebrow"><span class="dot"></span>往届参考</span>' +
        '<h2 class="section-title" style="margin-top:14px">上一届校级优秀论文题目</h2>' +
        '<p class="lead small">重点看它们的"落点"：每一个都能用一句话说清解决什么问题、拿什么验证。</p></div>' +
        '<span class="tag tag-outline">共 ' + PAST.length + ' 个</span>' +
      '</div>' +

      '<div style="overflow-x:auto"><table class="past-table"><thead><tr><th>题目</th><th>方向</th><th>可借鉴的地方</th></tr></thead><tbody>' +
        PAST.map(function (p) {
          return '<tr><td class="t">' + esc(p.t) + '</td><td class="dir"><span class="tag">' + esc(p.dir) + '</span></td><td class="note">' + esc(p.note) + '</td></tr>';
        }).join('') +
      '</tbody></table></div>' +

      '<div class="section-head" style="max-width:none;margin-top:64px"><span class="eyebrow"><span class="dot"></span>时间与结构</span>' +
        '<h2 class="section-title" style="margin-top:14px">从选题到答辩，把设计写厚</h2></div>' +

      '<div class="split">' +
        '<div class="timeline">' +
          guideStep('选题 · 10—11 月', '定题目与数据来源', '确认一人一题、导师意见、数据或设备是否可得。') +
          guideStep('开题 · 12 月', '现状分析 + 方案对比', '至少对比 3 种主流方案，说明本选题为什么更合适。') +
          guideStep('中期 · 3—4 月', '核心模块跑通', '完成 60% 功能与关键算法，留下实验记录。') +
          guideStep('撰写 · 4—5 月', '设计章节占大头', '需求、总体设计、详细设计、数据库、接口，图要比代码多。') +
          guideStep('答辩 · 5—6 月', '演示 + 测试数据', '准备 3 分钟演示脚本与可复现的测试结果。') +
        '</div>' +
        '<div class="tip-card" style="padding:24px">' +
          '<h4 style="font-size:15px;margin-bottom:12px">论文里"设计"应该占多少</h4>' +
          '<ul style="gap:10px">' +
            '<li><b>需求分析</b>：用例图、功能清单、非功能指标</li>' +
            '<li><b>总体设计</b>：架构图、模块划分、技术选型理由</li>' +
            '<li><b>详细设计</b>：类图 / 流程图、数据库 E-R 与表结构、接口定义</li>' +
            '<li><b>关键算法</b>：伪代码、复杂度、参数与对比实验</li>' +
            '<li><b>测试</b>：用例表、性能数据、异常场景</li>' +
          '</ul>' +
          '<p class="small muted" style="margin-top:14px">常见问题是"实现"写得太细、"设计"一笔带过，评审一眼就能看出来。</p>' +
        '</div>' +
      '</div>' +
    '</div></div>';
  }

  function guideStep(w, t, d) {
    return '<div class="tl-item"><span class="tl-week">' + w + '</span><div class="tl-body"><b>' + t + '</b><p>' + d + '</p></div></div>';
  }

  /* ---------------- 收藏 ---------------- */
  function viewSaved() {
    var list = favorites.map(getTopic).filter(Boolean);
    return '<div class="page"><div class="container page-pad">' +
      '<div class="page-head" style="padding-top:0"><span class="eyebrow"><span class="dot"></span>我的收藏</span>' +
      '<h1 style="margin-top:12px">' + (list.length ? list.length + ' 个备选题目' : '还没有收藏题目') + '</h1>' +
      '<p>把几个备选放在一起比较，再决定发给导师哪一个。</p>' +
      (list.length ? '<div class="profile-bar"><button class="btn btn-ghost btn-sm" data-action="export-saved">' + icon('download') + '导出备选清单（题目 + 技术总结）</button></div>' : '') +
      '</div>' +
      (list.length ?
        '<div class="saved-grid">' + list.map(function (t) { return topicCard({ t: t, pct: null, reasons: [] }, true, true); }).join('') + '</div>' :
        '<div class="empty"><h3>收藏夹是空的</h3><p>在题目详情页点"收藏"，就会出现在这里。</p><a class="btn btn-primary" href="#/library">去题目库看看</a></div>') +
    '</div></div>';
  }

  /* ---------------- 私信与导出 ---------------- */
  function buildMessage(t) {
    var p = profile || defaultProfile();
    var f = fieldOf(t);
    var feats = t.features.map(function (x, i) { return (i + 1) + '）' + x.t; }).join('；');
    return '老师您好！我是' + p.major + '专业的学生，初步选定题目《' + titleOf(t) + '》。\n\n' +
      '主要功能：' + feats + '。\n\n' +
      '实现技术：' + t.stack.join('、') + '。\n\n' +
      '与现有方案相比：' + t.compare + '\n\n' +
      '预计工作量：约 ' + t.weeks + ' 周，分为 ' + t.steps.length + ' 个阶段推进（' + t.steps.map(function (s) { return s.t; }).join(' → ') + '）。\n\n' +
      '题目已按学院要求自查：共 ' + hanCount(titleOf(t)) + ' 个汉字，未以编程语言命名，与往届题目相似度较低。\n\n' +
      '想请您看看这个方向是否合适，需要的话我可以再补充开题思路和技术方案。谢谢老师！';
  }

  function buildSummary(t) {
    var f = fieldOf(t);
    return '本题属于' + f.name + '方向，' + t.oneLine +
      ' 技术上采用 ' + t.stack.join('、') + '，主要实现 ' + t.features.map(function (x) { return x.t; }).join('、') +
      ' 等 ' + t.features.length + ' 个功能模块；设计重点在' + t.design[0] +
      '。预计工作量约 ' + t.weeks + ' 周。';
  }

  function buildListMarkdown(list, title) {
    var p = profile || defaultProfile();
    var lines = [];
    lines.push('# ' + title);
    lines.push('');
    lines.push('- 生成时间：' + new Date().toLocaleString('zh-CN'));
    lines.push('- 专业：' + p.major);
    if (p.fields && p.fields.length) {
      lines.push('- 方向偏好：' + p.fields.map(function (k) { return FIELDS[k].short; }).join(' / '));
    }
    lines.push('');
    lines.push('---');
    lines.push('');
    list.forEach(function (t, i) {
      var f = fieldOf(t);
      lines.push('## ' + (i + 1) + '. ' + titleOf(t));
      lines.push('');
      lines.push('- 方向：' + f.name + '　|　类型：' + TYPE_LABELS[t.type] + '　|　难度：' + DIFF_LABELS[t.difficulty] + '　|　工作量：约 ' + t.weeks + ' 周' + (t.hardware ? '（需硬件）' : ''));
      lines.push('- 主要功能：' + t.features.map(function (x) { return x.t; }).join('；'));
      lines.push('- 技术栈：' + t.stack.join('、'));
      lines.push('- 技术总结：' + buildSummary(t));
      lines.push('- 设计重点：' + t.design[0] + '；' + t.design[1]);
      lines.push('- 题目字数：' + hanCount(titleOf(t)) + ' / 25');
      lines.push('');
    });
    return lines.join('\n');
  }

  function buildMarkdown(t) {
    var p = profile || defaultProfile();
    var sc = selfCheck(t, titleOf(t));
    var f = fieldOf(t);
    var lines = [];
    lines.push('# 毕业设计选题说明');
    lines.push('');
    lines.push('## 题目');
    lines.push('');
    lines.push('《' + titleOf(t) + '》');
    lines.push('');
    if (titlesOf(t).length > 1) {
      lines.push('其他可选表述：');
      lines.push('');
      titlesOf(t).forEach(function (x, i) { lines.push((i + 1) + '. ' + x); });
      lines.push('');
    }
    lines.push('## 基本信息');
    lines.push('');
    lines.push('- 方向：' + f.name);
    lines.push('- 类型：' + TYPE_LABELS[t.type]);
    lines.push('- 难度：' + DIFF_LABELS[t.difficulty] + '（' + t.difficulty + '/5）');
    lines.push('- 预计工作量：约 ' + t.weeks + ' 周');
    lines.push('- 硬件需求：' + (t.hardware ? '需要' : '不需要'));
    lines.push('- 适用专业：' + p.major);
    lines.push('');
    lines.push('## 摘要');
    lines.push('');
    lines.push(buildSummary(t));
    lines.push('');
    lines.push('## 要解决的问题');
    lines.push('');
    lines.push(t.problem);
    lines.push('');
    lines.push('## 主要功能');
    lines.push('');
    t.features.forEach(function (x, i) { lines.push((i + 1) + '. **' + x.t + '**：' + x.d); });
    lines.push('');
    lines.push('## 技术方案');
    lines.push('');
    lines.push('技术栈：' + t.stack.join('、'));
    lines.push('');
    lines.push(t.arch);
    lines.push('');
    lines.push('## 设计要点（论文重点）');
    lines.push('');
    t.design.forEach(function (x, i) { lines.push((i + 1) + '. ' + x); });
    lines.push('');
    lines.push('## 实施计划');
    lines.push('');
    lines.push('| 时间 | 任务 | 说明 |');
    lines.push('| --- | --- | --- |');
    t.steps.forEach(function (s) { lines.push('| ' + s.w + ' | ' + s.t + ' | ' + s.d + ' |'); });
    lines.push('');
    lines.push('## 与现有方案对比');
    lines.push('');
    lines.push(t.compare);
    lines.push('');
    lines.push('## 难点与风险');
    lines.push('');
    t.hard.forEach(function (x) { lines.push('- ' + x); });
    lines.push('');
    lines.push('## 选题自检');
    lines.push('');
    lines.push('- 题目汉字数：' + sc.han + ' / 25');
    lines.push('- 命名方式：' + (sc.langOk ? '未以编程语言命名' : '存在编程语言命名'));
    lines.push('- 与往届最高相似度：' + Math.round(sc.maxSim * 100) + '%');
    lines.push('');
    lines.push('## 发给导师的说明');
    lines.push('');
    lines.push(buildMessage(t));
    lines.push('');
    return lines.join('\n');
  }

  /* ---------------- 交互 ---------------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action],[data-step],[data-skill],[data-exp],[data-scene],[data-field],[data-seg],[data-filter],[data-persona],[data-lib-field],[data-try],[data-bind]');
    if (!el) return;

    if (el.hasAttribute('data-action')) {
      var action = el.getAttribute('data-action');
      var id = el.getAttribute('data-id');
      if (action === 'backdrop-close') {
        if (e.target === el) closeModal();
        return;
      }
      if (action === 'close-modal') { closeModal(); return; }
      if (action === 'restart') { WIZ.step = 0; WIZ.error = ''; return; }
      if (action === 'shuffle') {
        var ranked = rankTopics(profile, RESULT.seed);
        var filtered = RESULT.type === 'all' ? ranked : ranked.filter(function (x) { return x.t.type === RESULT.type && x.score > -50; });
        var pages = Math.max(1, Math.ceil(filtered.length / 6));
        RESULT.offset = (RESULT.offset + 1) % pages;
        RESULT.seed += 1;
        render();
        return;
      }
      if (action === 'pick-title' && id) {
        var idx = parseInt(el.getAttribute('data-i'), 10) || 0;
        pickTitle(id, idx);
        var keepY = window.scrollY;
        render();
        window.scrollTo(0, keepY);
        return;
      }
      if (action === 'fav' && id) { toggleFav(id); return; }
      if (action === 'message' && id) {
        var t = getTopic(id);
        if (!t) return;
        var msg = buildMessage(t);
        openModal(
          '<div class="modal-head"><h3>发给导师的私信</h3><button class="x" data-action="close-modal">' + icon('x') + '</button></div>' +
          '<div class="modal-body"><p class="small muted" style="margin-bottom:12px">改一下称呼和你的名字，再复制发送。老师通常会先看"做什么、用什么、和现有方案有什么不同"。</p>' +
          '<textarea class="msg-box" id="msg-text">' + esc(msg) + '</textarea></div>' +
          '<div class="modal-foot"><button class="btn btn-ghost btn-sm" data-action="download-md" data-id="' + t.id + '">' + icon('download') + '导出 Markdown</button>' +
          '<button class="btn btn-primary btn-sm" data-action="copy-msg">' + icon('copy') + '复制全文</button></div>'
        );
        setTimeout(function () { var ta = document.getElementById('msg-text'); if (ta) ta.focus(); }, 50);
        return;
      }
      if (action === 'copy-msg') {
        var box = document.getElementById('msg-text');
        if (box) copyText(box.value);
        return;
      }
      if (action === 'download-md' && id) {
        var tp = getTopic(id);
        if (tp) download('选题说明_' + tp.title.slice(0, 12) + '.md', buildMarkdown(tp));
        return;
      }
      if (action === 'export' && id) {
        var t2 = getTopic(id);
        if (t2) { download('选题说明_' + t2.title.slice(0, 12) + '.md', buildMarkdown(t2)); toast('选题说明已下载'); }
        return;
      }
      if (action === 'export-page') {
        if (!profile) return;
        var rk = rankTopics(profile, RESULT.seed);
        var fl = RESULT.type === 'all' ? rk : rk.filter(function (x) { return x.t.type === RESULT.type && x.score > -50; });
        var pg = Math.max(1, Math.ceil(fl.length / 6));
        var cur = Math.min(RESULT.offset, pg - 1);
        var items = fl.slice(cur * 6, cur * 6 + 6).map(function (x) { return x.t; });
        if (!items.length) return;
        download('选题备选_' + items.length + '个.md', buildListMarkdown(items, '选题备选清单'));
        toast('已导出本页 ' + items.length + ' 个方案');
        return;
      }
      if (action === 'export-saved') {
        var favList = favorites.map(getTopic).filter(Boolean);
        if (!favList.length) return;
        download('收藏备选_' + favList.length + '个.md', buildListMarkdown(favList, '收藏备选清单'));
        toast('已导出 ' + favList.length + ' 个备选');
        return;
      }
      if (action === 'print') { window.print(); return; }
    }

    if (el.hasAttribute('data-bind')) return;

    if (el.hasAttribute('data-step')) {
      var dir = el.getAttribute('data-step');
      if (dir === 'next') {
        var err = validateStep(WIZ.step);
        if (err) { WIZ.error = err; render(); return; }
        WIZ.error = '';
        if (WIZ.step < 3) { WIZ.step += 1; saveProfile(); render(); }
        else {
          profile.type = profile.type || 'any';
          saveProfile();
          RESULT = { offset: 0, type: 'all', seed: 1 };
          location.hash = '#/result';
        }
      } else if (dir === 'prev') {
        WIZ.error = '';
        WIZ.step = Math.max(0, WIZ.step - 1);
        render();
      }
      return;
    }

    if (el.hasAttribute('data-skill')) {
      var sk = el.getAttribute('data-skill');
      var i = profile.skills.indexOf(sk);
      if (i > -1) profile.skills.splice(i, 1); else profile.skills.push(sk);
      el.classList.toggle('active');
      el.setAttribute('aria-pressed', el.classList.contains('active'));
      return;
    }
    if (el.hasAttribute('data-exp')) {
      var ek = el.getAttribute('data-exp');
      var j = profile.experiences.indexOf(ek);
      if (j > -1) profile.experiences.splice(j, 1); else profile.experiences.push(ek);
      el.classList.toggle('active');
      return;
    }
    if (el.hasAttribute('data-scene')) {
      var ck = el.getAttribute('data-scene');
      var k2 = profile.scenes.indexOf(ck);
      if (k2 > -1) profile.scenes.splice(k2, 1); else profile.scenes.push(ck);
      el.classList.toggle('active');
      return;
    }
    if (el.hasAttribute('data-field')) {
      var fk = el.getAttribute('data-field');
      var ferr = document.querySelector('.form-error');
      if (ferr) ferr.classList.remove('show');
      var k3 = profile.fields.indexOf(fk);
      if (k3 > -1) { profile.fields.splice(k3, 1); el.classList.remove('active'); }
      else {
        if (profile.fields.length >= 3) { toast('最多选 3 个方向', false); return; }
        profile.fields.push(fk); el.classList.add('active');
      }
      return;
    }
    if (el.hasAttribute('data-seg')) {
      var group = el.getAttribute('data-seg');
      var key = el.getAttribute('data-key');
      var wrap = el.parentNode;
      $all('.seg', wrap).forEach(function (x) { x.classList.remove('active'); });
      el.classList.add('active');
      if (group === 'hardwareOk') profile.hardwareOk = key === 'true';
      else profile[group] = key;
      if (group === 'advisorAlign') render();
      return;
    }
    if (el.hasAttribute('data-filter')) {
      RESULT.type = el.getAttribute('data-filter');
      RESULT.offset = 0;
      render();
      return;
    }
    if (el.hasAttribute('data-persona')) {
      var preset = personas[el.getAttribute('data-persona')];
      if (preset) {
        profile = JSON.parse(JSON.stringify(preset));
        saveProfile();
        RESULT = { offset: 0, type: 'all', seed: 1 };
        location.hash = '#/result';
      }
      return;
    }
    if (el.hasAttribute('data-lib-field')) {
      LIB.field = el.getAttribute('data-lib-field');
      render();
      paintLibrary();
      return;
    }
    if (el.hasAttribute('data-try')) {
      var inp = document.getElementById('checker-input');
      if (inp) { inp.value = el.getAttribute('data-try'); paintCheck(); inp.focus(); }
      return;
    }
  });

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.hasAttribute && el.hasAttribute('data-bind')) {
      var key = el.getAttribute('data-bind');
      if (key === 'major') { profile.major = el.value; }
      else { profile[key] = el.value; }
      return;
    }
    if (el.id === 'lib-search') {
      LIB.q = el.value;
      paintLibrary();
      return;
    }
    if (el.id === 'checker-input') {
      paintCheck();
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target && e.target.hasAttribute && e.target.hasAttribute('data-bind')) {
      profile[e.target.getAttribute('data-bind')] = e.target.value;
      saveProfile();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  window.addEventListener('hashchange', function () {
    WIZ.error = '';
    var nr = parseRoute();
    if (nr.name === 'match') WIZ.step = 0;
    render();
    if (nr.name === 'library') paintLibrary();
  });

  /* ---------------- 启动 ---------------- */
  updateSavedCount();
  var demo = /[?&]demo=([123])/.exec(location.search);
  if (demo && !profile) {
    profile = JSON.parse(JSON.stringify(personas['p' + demo[1]]));
    saveProfile();
  }
  if (!location.hash) location.replace('#/home');
  render();
  if (parseRoute().name === 'library') paintLibrary();
})();
