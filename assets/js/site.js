/* ==========================================================================
   site.js —— 课程教程站运行时引擎 v1.0
   --------------------------------------------------------------------------
   职责（页面里不需要重复写这些 HTML，全部由本文件生成，保证 32 课完全一致）：
     1. 顶栏（品牌 + 搜索 + 课次选择）
     2. 左侧栏课程目录（按模块分组、可折叠、当前课高亮）
     3. 面包屑 + 页面标题区（课次号 / 标题 / 副标题 / 元信息 chips）
     4. 右侧"本页目录"（自动扫描 #main 内的 h2/h3）
     5. 上一课 / 下一课
     6. 页脚
     7. 代码块：语言标签、一键复制、轻量语法高亮
     8. 随堂小测展开、折叠区、移动端侧栏
     9. 全站搜索（课程级 + 章节级）

   页面契约（每课必须满足）：
     <body data-lesson="7" data-root="../">      ← data-lesson 必须与 course-map 的 no 一致
     <main class="main" id="main">…内容…</main>  ← 内容小节一律 <section class="sec" id="s-xxx">
     内容小节内的 h2/h3 请务必带 id，格式 s-<语义名>，供本页目录与搜索引用。
   ========================================================================== */
(function () {
  "use strict";

  var CM = window.COURSE_MAP;
  if (!CM) { console.warn("[site] 未找到 course-map.js"); return; }
  var FLAT = CM.flat();

  var BODY = document.body;
  var ROOT = BODY.getAttribute("data-root") || "./";
  var CUR_NO = parseInt(BODY.getAttribute("data-lesson") || "0", 10);
  var CUR_IDX = FLAT.findIndex(function (l) { return l.no === CUR_NO; });
  var CUR = CUR_IDX >= 0 ? FLAT[CUR_IDX] : null;

  function $(id) { return document.getElementById(id); }
  function link(file) { return ROOT + file; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function typeBadge(l) {
    return l.type === "实操"
      ? '<span class="badge badge--a">实操 ' + l.practice + " 课时</span>"
      : '<span class="badge badge--p">理论 ' + l.theory + " 课时</span>";
  }
  function statusBadge(l) {
    return l.status === "ready"
      ? '<span class="badge badge--ok">已上线</span>'
      : '<span class="badge badge--todo">待转化</span>';
  }

  /* ======================================================================
     1. 顶栏
     ====================================================================== */
  function renderTopbar() {
    var host = $("site-topbar");
    if (!host) return;
    var opts = FLAT.map(function (l) {
      return '<option value="' + link(l.file) + '"' + (l.no === CUR_NO ? " selected" : "") +
        (l.status === "ready" ? "" : " disabled") + ">" +
        "第 " + l.no + " 次课 · " + esc(l.title) + (l.status === "ready" ? "" : "（待转化）") +
        "</option>";
    }).join("");

    host.className = "topbar";
    host.innerHTML =
      '<div class="topbar__in">' +
        '<button class="menu-btn" id="site-menu" type="button" aria-label="目录"><span></span></button>' +
        '<a class="brand" href="' + link("index.html") + '">' +
          '<span class="brand__mark">AI</span>' +
          '<span class="brand__txt"><b>' + esc(CM.meta.course) + "</b><span>课程教程站 · " + esc(CM.meta.term) + "</span></span>" +
        "</a>" +
        '<div class="searchbox">' +
          '<svg class="searchbox__ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
          '<input type="search" id="site-search" placeholder="搜索课次 / 知识点 / 命令…" autocomplete="off">' +
          "<kbd>/</kbd>" +
          '<div class="searchbox__hit" id="site-search-hit"></div>' +
        "</div>" +
        '<nav class="topbar__nav">' +
          '<a class="tlink" href="' + link("index.html") + '">课程地图</a>' +
          '<select class="sel-lesson" id="site-lesson-select" title="跳转到指定课次">' + opts + "</select>" +
        "</nav>" +
      "</div>";

    $("site-menu").addEventListener("click", function () {
      var sb = $("site-sidebar"); if (sb) sb.classList.toggle("open");
    });
    $("site-lesson-select").addEventListener("change", function () {
      var v = this.value; if (v && v !== "#") window.location.href = v;
    });
  }

  /* ======================================================================
     2. 左侧栏课程目录
     ====================================================================== */
  function renderSidebar() {
    var host = $("site-sidebar");
    if (!host) return;
    var h = '<div class="sidebar__hd">课程目录 · 共 ' + FLAT.length + " 课</div>";
    CM.modules.forEach(function (m) {
      var ready = m.lessons.filter(function (l) { return l.status === "ready"; }).length;
      var hasCur = m.lessons.some(function (l) { return l.no === CUR_NO; });
      var opened = hasCur || m.id === "m2" || (CUR_NO === 0 && m.id === "m1");
      h += '<div class="mod' + (opened ? "" : " closed") + '" data-mod="' + m.id + '">';
      h += '<button class="mod__hd" type="button">' +
             '<span class="mod__no ' + (m.id === "m3" ? "m3" : "") + '">' + esc(m.no) + "</span>" +
             "<span>" + esc(m.name) + "</span>" +
             '<span class="mod__cnt">' + ready + "/" + m.lessons.length + '</span>' +
             '<span class="mod__arrow"></span>' +
           "</button>";
      h += '<ul class="mod__list">';
      m.lessons.forEach(function (l) {
        var cls = (l.no === CUR_NO ? "on " : "") + (l.status === "ready" ? "" : "pending");
        var dot = l.status === "ready" ? "ok" : "todo";
        var inner = '<span class="lno">' + l.no + '</span><span class="dot ' + dot + '"></span><span>' + esc(l.title) + "</span>";
        if (l.status === "ready") {
          h += '<li><a class="' + cls + '" href="' + link(l.file) + '">' + inner + "</a></li>";
        } else {
          h += '<li><a class="' + cls + '" href="#" data-todo="' + l.no + '" title="该课尚未转化，转化后自动可点">' + inner + "</a></li>";
        }
      });
      h += "</ul></div>";
    });
    host.innerHTML = h;

    host.querySelectorAll(".mod__hd").forEach(function (b) {
      b.addEventListener("click", function () { b.parentNode.classList.toggle("closed"); });
    });
    host.querySelectorAll("[data-todo]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        alert("第 " + a.getAttribute("data-todo") + " 次课还没有转化上线。\n按《转化规范》完成该课内容后，把 course-map.js 里的 status 改成 ready 即可。");
      });
    });
  }

  /* ======================================================================
     3. 面包屑 + 页面标题区
     ====================================================================== */
  function renderHead() {
    var crumb = $("site-crumb");
    var head = $("site-head");
    if (!CUR) {
      if (crumb) crumb.innerHTML = '<a href="' + link("index.html") + '">首页</a>';
      return;
    }
    if (crumb) {
      crumb.innerHTML =
        '<a href="' + link("index.html") + '">首页</a>' +
        '<span class="sep">/</span>' +
        "<span>" + esc(CUR.moduleNo) + " " + esc(CUR.moduleName) + "</span>" +
        '<span class="sep">/</span>' +
        '<span>第 ' + CUR.no + " 次课</span>";
    }
    if (head) {
      var chips = [];
      chips.push('<span class="k">' + esc(CUR.moduleNo) + " · 第 " + CUR.no + " 次课</span>");
      chips.push("<span>第 " + CUR.week + " 周</span>");
      chips.push("<span>" + (CUR.type === "实操" ? "实操 2 课时" : "理论 2 课时") + "</span>");
      chips.push("<span>80 分钟</span>");
      if (CUR.lms) chips.push('<span class="a">对应学习通 ' + esc(CUR.lms) + "</span>");
      else chips.push('<span class="a">' + esc(CUR.sections) + "</span>");
      chips.push(statusBadge(CUR));

      var extras = BODY.getAttribute("data-meta");
      if (extras) {
        extras.split("|").forEach(function (x) {
          if (x.trim()) chips.push("<span>" + esc(x.trim()) + "</span>");
        });
      }

      /* 关键词卡（course-map 的 tags）不在此渲染：tags 是「检索关键词」，
         与小节锚点并非一一对应，硬拼成 #s-<关键词> 只会产生点不动的死锚点。
         需要按关键词检索，请走顶部搜索（由 search-index.js 驱动）。 */

      head.className = "page-head";
      head.innerHTML =
        '<span class="page-head__no">第 ' + CUR.no + " 次课 · " + esc(CUR.moduleNo) + "</span>" +
        "<h1>" + esc(CUR.title) + "<small>" + esc(CUR.subtitle) + "</small></h1>" +
        '<p style="color:#64748B;font-size:13.5px;margin:12px 0 0">' + esc(CUR.summary) + "</p>" +
        '<div class="meta">' + chips.join("") + "</div>";
    }
    document.title = "第" + CUR.no + "次课 " + CUR.title + "｜" + CM.meta.course;

    // 若正文第一段带了"本课导读"，则把它抬进标题区下方不再重复
  }
  function cataSlug(s) { return String(s).replace(/[^\w\u4e00-\u9fa5]+/g, "-").toLowerCase(); }

  /* ======================================================================
     4. 本页目录（section.sec 的 h2 + 全部 h3）
     规则：小节的锚点 id 落在 <section class="sec" id="s-xxx"> 上，
           小节标题取该 section 里第一个直属 h2（去掉 .sec__tag 徽标）；
           标题里的序号（「一、」「1.」）**原样保留**，不再剥掉；
           二级标题（h3）一律收录：页面里没写 id 的由本函数现场补一个锚点，
           并按所属小节自动编号（h3 自己已带序号的，不重复编）。
     ====================================================================== */
  function tocTitle(node) {
    if (!node) return "";
    var c = node.cloneNode(true);
    c.querySelectorAll(".sec__tag").forEach(function (t) { t.remove(); });
    return c.textContent.replace(/\s+/g, " ").trim();
  }

  /* h3 文本里已经自带序号的情况：1. / 1.1 / ① / 一、 / （一） / (1)
     这类不再自动编号，否则会变成「3. 坑位① …」 */
  function hasOwnIndex(text) {
    return /^\s*(\d+(\.\d+)*[、.．]?|[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]|[一二三四五六七八九十]+[、.]|（[一二三四五六七八九十]+）|[（(]\d+[)）])/.test(text);
  }

  /* 动手做（div.task）的标题：去掉末尾的 <em>约 X 分钟</em>，只留标题本身 */
  function taskTitle(hd) {
    if (!hd) return "";
    var c = hd.cloneNode(true);
    c.querySelectorAll("em").forEach(function (t) { t.remove(); });
    return c.textContent.replace(/\s+/g, " ").trim();
  }

  function collectTOCNodes() {
    var main = $("main");
    if (!main) return [];
    var out = [];

    function ensureId(n, txt) {
      // 页面里没写 id 的 h3 / 动手做块：用标题文字生成一个稳定锚点，
      // 保证目录点得动（课时页源码始终不需要手写这些 id）
      if (n.id) return n.id;
      var base = "s-" + String(cataSlug(txt)).replace(/^-+|-+$/g, "").slice(0, 30);
      if (base === "s-") base = "s-sec";
      var cand = base, k = 2;
      while (document.getElementById(cand)) { cand = base + "-" + (k++); }
      n.id = cand;
      return cand;
    }

    // 按文档顺序扫描全部 h2 / h3 / 动手做
    main.querySelectorAll("h2, h3, .task").forEach(function (n) {
      var sec = n.closest("section.sec");
      var txt;
      if (n.tagName === "H2") {
        // 锚点优先用小节 id；没有小节 id 时退回 h2 自己的 id
        txt = tocTitle(n);
        var id = (sec && sec.id) || n.id || "";
        if (!id) return;
        out.push({ id: id, lvl: 2, text: txt || id, node: sec && sec.id ? sec : n });
      } else if (n.tagName === "H3") {
        // 只收「小节直属的 h3」和「完全不在小节内的 h3」。
        // 卡片、折叠面板、演示区等嵌套结构里的 h3 不算页面小节，不进目录
        // （首页课程地图有 32 张课次卡片，标题也是 h3，靠这条挡掉）
        if (sec && n.parentNode !== sec) return;
        txt = tocTitle(n);
        out.push({ id: ensureId(n, txt), lvl: 3, text: txt, node: n });
      } else {
        // 动手做：单独作为一条列出来，学生可以直接从目录跳到实操，不用滚页面
        var hd = n.querySelector(".task__hd");
        txt = taskTitle(hd);
        if (!txt) return;
        out.push({ id: ensureId(n, txt), lvl: 3, type: "task", text: txt, node: n });
      }
    });

    // h3 自动编号：在每个一级小节内从 1 开始重数；动手做自带「①②③」不参与编号
    var seq = 0;
    out.forEach(function (x) {
      if (x.lvl === 2) { seq = 0; return; }
      if (x.type === "task") return;
      seq++;
      if (!hasOwnIndex(x.text)) x.text = seq + ". " + x.text;
    });

    return out.filter(function (x) { return x.id && x.text; });
  }

  function renderTOC() {
    var host = $("site-toc");
    if (!host) return;
    var items = collectTOCNodes();
    if (!items.length) { host.innerHTML = ""; return; }

    host.className = "sidebar toc";
    host.innerHTML =
      '<div class="sidebar__hd" style="padding-left:12px">本页目录</div>' +
      '<ul class="toc__list">' +
      items.map(function (x) {
        return '<li class="toc__i toc__i--' + x.lvl + (x.type === "task" ? " toc__i--task" : "") +
          '"><a href="#' + x.id + '">' + esc(x.text) + "</a></li>";
      }).join("") +
      "</ul>";

    var links = Array.prototype.slice.call(host.querySelectorAll("a"));
    var targets = items.map(function (x) { return x.node; });
    function spy() {
      var y = window.scrollY + 130, best = targets[0];
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].getBoundingClientRect().top + window.scrollY <= y) best = targets[i];
      }
      links.forEach(function (a) {
        a.classList.toggle("on", !!best && a.getAttribute("href") === "#" + best.id);
      });
    }
    window.addEventListener("scroll", spy, { passive: true });
    spy();
  }

  /* ======================================================================
     5. 上一课 / 下一课
     ====================================================================== */
  function renderPager() {
    var host = $("site-pager");
    if (!host) return;
    function side(l, dir) {
      if (!l) return '<a class="dis"><span>' + (dir === "prev" ? "上一课" : "下一课") + "</span><b>——</b></a>";
      var cls = (dir === "next" ? "nx" : "") + (l.status === "ready" ? "" : " dis");
      var label = dir === "prev" ? "← 上一课" : "下一课 →";
      var body = "<span>" + label + "</span><b>第 " + l.no + " 次课 · " + esc(l.title) + "</b>";
      if (l.status === "ready") return '<a class="' + cls + '" href="' + link(l.file) + '">' + body + "</a>";
      return '<a class="' + cls + '"><span>' + label + "（待转化）</span><b>第 " + l.no + " 次课 · " + esc(l.title) + "</b></a>";
    }
    host.innerHTML = side(FLAT[CUR_IDX - 1], "prev") + side(FLAT[CUR_IDX + 1], "next");
  }

  /* ======================================================================
     6. 页脚
     ----------------------------------------------------------------------
     · 上半：课程/学校/学期、版本、上线进度、资料版本
     · 下半：版权声明 + 访问统计（本机口径）
     访问人次来自 learning-tracker.js 的 localStorage，该脚本是异步注入的，
     所以先用占位符渲染，再由 pollVisitStats() 到位后回填。
     ====================================================================== */
  var BUILD_YEAR = 2026;

  function fmtDateTime(ts) {
    if (!ts) return "—";
    try {
      var d = new Date(ts);
      var p = function (n) { return (n < 10 ? "0" : "") + n; };
      return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
        " " + p(d.getHours()) + ":" + p(d.getMinutes());
    } catch (e) { return "—"; }
  }

  /* 渲染页脚。有 LT 时直接带真实数据，没有则先占位。 */
  function renderFoot() {
    var host = $("site-foot");
    if (!host) return;
    var ready = FLAT.filter(function (l) { return l.status === "ready"; }).length;
    var meta = CM.meta || {};
    var year = new Date().getFullYear();
    var yearTxt = (year > BUILD_YEAR) ? (BUILD_YEAR + "–" + year) : String(BUILD_YEAR);

    host.innerHTML =
      '<div class="foot__row foot__row--top">' +
        "<span>" + esc(meta.course) + " · " + esc(meta.school) + " · " + esc(meta.term) +
        "　|　课程教程站 v1.0　|　已上线 " + ready + " / " + FLAT.length + " 课</span>" +
        "<span>资料版本 " + esc(meta.updated) + "　·　" + esc(meta.scopeNote) + "</span>" +
      "</div>" +
      '<div class="foot__row foot__row--btm">' +
        '<span class="foot__copy">© ' + yearTxt + " " + esc(meta.school) + " · " + esc(meta.course) + "课程组" +
          "　|　本站为教学用途，仅供课程学习，非商业使用。" +
          (meta.audience ? "　|　适用对象：" + esc(meta.audience) : "") +
        "</span>" +
        '<span class="foot__stat" id="foot-stat" title="本机浏览器统计，换设备/清缓存会重新计数">' +
          '<span class="foot__stat-item">本机访问人次 <b id="fs-visits">—</b></span>' +
          '<span class="foot__stat-item">来访次数 <b id="fs-sess">—</b></span>' +
          '<span class="foot__stat-item">首次访问 <b id="fs-first">—</b></span>' +
          '<span class="foot__stat-item">最近访问 <b id="fs-last">—</b></span>' +
        "</span>" +
      "</div>";

    pollVisitStats();
  }

  /* 等 learning-tracker 注入完成后回填访问统计（最多等 ~10 秒）。 */
  function pollVisitStats() {
    var tries = 0, MAX = 40;                 // 40 × 250ms = 10s
    (function tick() {
      var lt = window.LT;
      if (lt && typeof lt.summary === "function") {
        var s;
        try { s = lt.summary(); } catch (e) { s = null; }
        if (s) {
          var set = function (id, txt) { var el = $(id); if (el) el.textContent = txt; };
          set("fs-visits", String(s.visits == null ? 0 : s.visits));
          set("fs-sess", String(s.sessionCount == null ? 0 : s.sessionCount));
          set("fs-first", fmtDateTime(s.firstVisitAt));
          set("fs-last", fmtDateTime(s.lastVisitAt));
          return;
        }
      }
      if (++tries <= MAX) setTimeout(tick, 250);
    })();
  }

  /* ======================================================================
     7. 代码块：语言标签 + 复制 + 轻量高亮
     ====================================================================== */
  var LANG_NAME = {
    bash: "shell", shell: "shell", powershell: "powershell", cmd: "cmd",
    python: "python", py: "python", json: "json", text: "text", md: "markdown",
    sql: "sql", ini: "配置", modelfile: "modelfile",
  };

  function highlight(raw, lang) {
    var store = [];
    function stash(cls, text) {
      store.push('<span class="' + cls + '">' + esc(text) + "</span>");
      return "\u0001" + String(store.length - 1).split("").map(function (d) { return "abcdefghij"[+d]; }).join("") + "\u0002";
    }
    var code = raw, l = (lang || "").toLowerCase();

    if (l === "bash" || l === "shell" || l === "powershell" || l === "cmd") {
      code = code.replace(/(^|\n)> ?/g, function (m, nl) { return nl + stash("prompt", ">") + " "; });
      code = code.replace(/(^|\n)(\s*)(#[^\n]*)/g, function (m, nl, sp, c) { return nl + sp + stash("tk-c", c); });
      code = code.replace(/"(?:\\.|[^"\\])*"|'[^']*'/g, function (m) { return stash("tk-s", m); });
      code = code.replace(/(^|\n)(\s*)([\w.\-\/\\:]+)/g, function (m, nl, sp, w) { return nl + sp + stash("tk-cmd", w); });
      code = code.replace(/(\s)(--?[A-Za-z][\w-]*)/g, function (m, s, f) { return s + stash("tk-flg", f); });
    } else if (l === "python" || l === "py") {
      code = code.replace(/(^|\n)(\s*)(#[^\n]*)/g, function (m, nl, sp, c) { return nl + sp + stash("tk-c", c); });
      code = code.replace(/"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, function (m) { return stash("tk-s", m); });
      code = code.replace(/\b(def|return|if|elif|else|for|while|in|not|and|or|import|from|as|class|try|except|finally|with|lambda|None|True|False|break|continue|pass|raise|yield|global|assert|del|is|async|await)\b/g, function (m) { return stash("tk-k", m); });
      code = code.replace(/\b([A-Za-z_]\w*)(?=\s*\()/g, function (m) { return stash("tk-f", m); });
      code = code.replace(/\b(\d+(?:\.\d+)?)\b/g, function (m) { return stash("tk-n", m); });
    } else if (l === "json") {
      code = code.replace(/"(?:\\.|[^"\\])*"(\s*:)?/g, function (m) { return stash(/:\s*$/.test(m) ? "tk-k" : "tk-s", m); });
      code = code.replace(/\b(true|false|null)\b/g, function (m) { return stash("tk-k", m); });
      code = code.replace(/\b(-?\d+(?:\.\d+)?)\b/g, function (m) { return stash("tk-n", m); });
    } else if (l === "ini" || l === "modelfile" || l === "toml") {
      code = code.replace(/(^|\n)(\s*)(#[^\n]*)/g, function (m, nl, sp, c) { return nl + sp + stash("tk-c", c); });
      code = code.replace(/(^|\n)([A-Z_][A-Z0-9_]*)(=|\s|$)/g, function (m, nl, k, t) { return nl + stash("tk-k", k) + t; });
      code = code.replace(/"""/g, function (m) { return stash("tk-s", m); });
    } else if (l === "sql") {
      code = code.replace(/(--[^\n]*)/g, function (m) { return stash("tk-c", m); });
      code = code.replace(/\b(SELECT|FROM|WHERE|GROUP|BY|ORDER|HAVING|SUM|COUNT|AVG|AS|JOIN|LEFT|ON|LIMIT|UPDATE|SET|INSERT|INTO|VALUES|DISTINCT|CASE|WHEN|THEN|END|ELSE)\b/gi, function (m) { return stash("tk-k", m); });
      code = code.replace(/'[^']*'/g, function (m) { return stash("tk-s", m); });
    } else {
      return esc(raw);
    }

    code = esc(code);
    code = code.replace(/\u0001([a-j]+)\u0002/g, function (m, enc) {
      var i = parseInt(enc.split("").map(function (c) { return "abcdefghij".indexOf(c); }).join(""), 10);
      return store[i] || "";
    });
    return code;
  }

  function bindCode() {
    document.querySelectorAll(".codeblock").forEach(function (blk) {
      var pre = blk.querySelector("pre");
      if (!pre) return;
      var code = pre.querySelector("code") || pre;
      var lang = blk.getAttribute("data-lang") || "";
      var raw = code.getAttribute("data-raw");
      if (raw === null) { raw = code.textContent.replace(/^\n/, ""); code.setAttribute("data-raw", raw); }
      code.innerHTML = highlight(raw, lang);

      // 语言标签 / 文件名
      var bar = blk.querySelector(".codeblock__bar");
      if (bar) {
        var nm = blk.getAttribute("data-name") || "";
        bar.innerHTML =
          '<span class="codeblock__lang">' + esc(LANG_NAME[lang] || lang || "code") + "</span>" +
          (nm ? '<span class="codeblock__name">' + esc(nm) + "</span>" : "") +
          '<button class="codeblock__copy" type="button">复制</button>';
        var btn = bar.querySelector(".codeblock__copy");
        btn.addEventListener("click", function () {
          var txt = code.getAttribute("data-raw");
          var done = function () {
            btn.textContent = "已复制 ✓"; btn.classList.add("ok");
            setTimeout(function () { btn.textContent = "复制"; btn.classList.remove("ok"); }, 1600);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt).then(done, function () { fallback(txt, done); });
          } else { fallback(txt, done); }
        });
      }
    });
    function fallback(txt, done) {
      var ta = document.createElement("textarea");
      ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { alert("复制失败，请手动选中复制"); }
      document.body.removeChild(ta);
    }
  }

  /* ======================================================================
     8. 交互：小测 / 折叠 / 选项卡
     ====================================================================== */
  /* ======================================================================
     随堂自测：把「列选项 + 点按钮看答案」升级为「点选项即时判分」
     ----------------------------------------------------------------------
     设计约束：
       · 课时页正文**不改**——题干、选项、解析都保持原来的 HTML；
         交互全部由本函数在运行时接管，避免批量改写 163 道题的正文出错。
       · 正确答案从 `.quiz__ans` 里的「答案：X」解析出来（支持单选 A、
         多选 ABC、判断「正确/错误」、以及「A（正确）」这种带备注的写法）。
       · 题型判定：选项数 >= 3 视为多选候选（答案多字母即多选），
         选项恰为「正确/错误」两项则视为判断题。
       · 判分只在本页当场显示，不写 localStorage、不进学情档案。
     ====================================================================== */

  /* 把选项文字里的「A. 」前缀剥掉，返回 {letter, text} */
  function splitOpt(raw) {
    var s = String(raw).replace(/\s+/g, " ").trim();
    var m = s.match(/^([A-Da-d])\s*[.、．)）:：]\s*(.+)$/);
    if (m) return { letter: m[1].toUpperCase(), text: m[2].trim() };
    return { letter: "", text: s };
  }

  /* 从解析区文本里解析正确答案：返回 {letters:[], judge:boolean, isMulti:boolean} */
  function parseAnswer(ansEl) {
    if (!ansEl) return null;
    var txt = (ansEl.textContent || "").replace(/\s+/g, " ");
    var m = txt.match(/答案\s*[:：]\s*([A-Da-d]{1,4}|正确|错误)/);
    if (!m) {
      // 「答案：A（正确）」这类：先抓字母，再抓括号里的备注
      m = txt.match(/答案\s*[:：]\s*([A-Da-d])\s*[（(]\s*(正确|错误)\s*[)）]/);
      if (m) return { letters: [m[1].toUpperCase()], judge: true, isMulti: false, note: m[2] };
      return null;
    }
    var v = m[1];
    if (v === "正确" || v === "错误") return { letters: [], judge: true, judgeVal: v, isMulti: false };
    var letters = v.toUpperCase().split("");
    return { letters: letters, judge: false, isMulti: letters.length > 1 };
  }

  function bindQuiz() {
    document.querySelectorAll(".quiz").forEach(function (quiz) {
      var items = quiz.querySelectorAll(".quiz__item");
      var scored = 0, total = 0;

      items.forEach(function (item) {
        var optsBox = item.querySelector(".quiz__opts");
        var ansBox = item.querySelector(".quiz__ans");
        var btn = item.querySelector(".quiz__reveal");
        if (!optsBox || !ansBox) return;                 // 无解析的题不接管

        var answer = parseAnswer(ansBox);
        if (!answer) return;                             // 解析里没有「答案：X」→ 退回「看答案」模式

        /* 收集选项：li 或 p，两种方言都要吃 */
        var nodes = optsBox.querySelectorAll("li");
        if (!nodes.length) nodes = optsBox.querySelectorAll("p");
        if (!nodes.length) return;

        var opts = [];
        var LETTERS = "ABCDEFGH";
        nodes.forEach(function (n, i) {
          var parsed = splitOpt(n.textContent);
          // 选项没写「A. 」前缀时（如 <p>正确</p>），按出现顺序补字母，
          // 否则后续判分拿不到稳定的 key。
          if (!parsed.letter) parsed.letter = LETTERS.charAt(i) || ("#" + i);
          opts.push(parsed);
          // 一律换成按钮，保留原文字（去掉「A. 」前缀，字母由 CSS 画）
          n.innerHTML = '<button class="quiz__opt" type="button" data-letter="' +
            parsed.letter + '">' + esc(parsed.text) + "</button>";
        });
        optsBox.classList.add("quiz__opts--interactive");

        /* 判断题：答案只写了「正确/错误」，把它映射到对应选项的字母 */
        var correctSet = {};
        if (answer.judge && answer.judgeVal) {
          opts.forEach(function (o) {
            if (o.text.replace(/^[A-D][.、．)）]\s*/, "").trim() === answer.judgeVal) correctSet[o.letter] = 1;
          });
          // 兜底：选项文字里含「正确」/「错误」二字的也算
          if (!Object.keys(correctSet).length) {
            opts.forEach(function (o) {
              if (o.text.indexOf(answer.judgeVal) === 0) correctSet[o.letter] = 1;
            });
          }
        } else {
          answer.letters.forEach(function (L) { correctSet[L] = 1; });
        }
        var isMulti = answer.isMulti;

        /* 多选需要「提交」按钮 */
        var submit = null;
        if (isMulti) {
          submit = document.createElement("button");
          submit.type = "button";
          submit.className = "quiz__submit";
          submit.textContent = "提交答案";
          submit.disabled = true;
          optsBox.parentNode.insertBefore(submit, optsBox.nextSibling);
        }

        var picked = {}, locked = false;
        var tip = document.createElement("div");
        tip.className = "quiz__tip";
        (submit || btn).parentNode.insertBefore(tip, (submit || btn).nextSibling);

        var btns = optsBox.querySelectorAll(".quiz__opt");

        function markPicked() {
          btns.forEach(function (b) {
            b.classList.toggle("on", !!picked[b.getAttribute("data-letter")]);
          });
          if (submit) {
            var n = Object.keys(picked).filter(function (k) { return picked[k]; }).length;
            submit.disabled = n === 0;
            submit.textContent = n ? ("提交答案（已选 " + n + " 项）") : "提交答案";
          }
        }

        function judge() {
          if (locked) return;
          var keys = Object.keys(picked).filter(function (k) { return picked[k]; });
          if (!keys.length) return;
          locked = true;

          var allRight = keys.length === Object.keys(correctSet).length &&
            keys.every(function (k) { return correctSet[k]; });

          btns.forEach(function (b) {
            var L = b.getAttribute("data-letter");
            b.disabled = true;
            b.classList.remove("on");
            if (correctSet[L]) b.classList.add("right");
            else if (picked[L]) b.classList.add("wrong");
          });

          total++; if (allRight) scored++;

          var wantTxt = answer.judgeVal || answer.letters.join("");
          // 判断题：同时给出「正确/错误」与对应字母，避免选项没印字母时看不懂
          if (answer.judgeVal) {
            var L2 = Object.keys(correctSet)[0] || "";
            wantTxt = answer.judgeVal + (L2 && /^[A-D]$/.test(L2) ? "（" + L2 + "）" : "");
          }
          tip.className = "quiz__tip " + (allRight ? "ok" : "no");
          tip.textContent = (allRight ? "✓ 答对了。" : "✗ 答错了。") +
            "正确答案：" + wantTxt + "。" +
            (isMulti && !allRight ? "本题为多选。" : "");
          tip.hidden = false;

          ansBox.classList.add("on");
          if (submit) { submit.disabled = true; submit.textContent = "已提交"; }
          if (btn) { btn.hidden = true; }
          updateBar();
        }

        btns.forEach(function (b) {
          b.addEventListener("click", function () {
            if (locked) return;
            var L = b.getAttribute("data-letter");
            if (isMulti) {
              picked[L] = !picked[L];
              markPicked();
            } else {
              picked = {}; picked[L] = 1;
              markPicked();
              judge();
            }
          });
        });
        if (submit) submit.addEventListener("click", judge);
      });

      /* 顶部进度条：答对 N / 已答 M */
      var bar = quiz.querySelector(".quiz__bar");
      function updateBar() {
        if (!bar) return;
        var span = bar.querySelector(".quiz__score") || (function () {
          var s = document.createElement("span");
          s.className = "quiz__score";
          bar.appendChild(s); return s;
        })();
        span.textContent = "已答 " + total + " 题 · 答对 " + scored + " 题";
      }
    });
  }
  function bindFold() {
    document.querySelectorAll(".fold__hd").forEach(function (b) {
      b.addEventListener("click", function () { b.parentNode.classList.toggle("on"); });
    });
  }
  function bindTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (grp) {
      var btns = grp.querySelectorAll("button[data-tab]");
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          var key = b.getAttribute("data-tab");
          grp.querySelectorAll("button[data-tab]").forEach(function (x) { x.classList.toggle("on", x === b); });
          var scope = document.getElementById(grp.getAttribute("data-tabs"));
          if (scope) {
            scope.querySelectorAll("[data-tabpanel]").forEach(function (p) {
              p.style.display = p.getAttribute("data-tabpanel") === key ? "" : "none";
            });
          }
        });
      });
    });
  }

  /* ======================================================================
     9. 全站搜索
     ====================================================================== */
  function buildIndex() {
    var idx = [];
    FLAT.forEach(function (l) {
      idx.push({
        no: l.no, title: "第" + l.no + "次课 " + l.title, sub: l.subtitle + " · " + l.summary,
        url: l.status === "ready" ? link(l.file) : "", kind: "课时",
      });
      (l.tags || []).forEach(function (t) {
        idx.push({ no: l.no, title: t, sub: "关键词 · 第" + l.no + "次课 " + l.title, url: l.status === "ready" ? link(l.file) : "", kind: "关键词" });
      });
    });
    if (window.SITE_SECTION_INDEX && window.SITE_SECTION_INDEX.length) {
      window.SITE_SECTION_INDEX.forEach(function (s) {
        var l = FLAT.find(function (x) { return x.no === s.lesson; });
        idx.push({
          no: s.lesson, title: s.title, sub: "第" + s.lesson + "次课 · " + (s.hint || s.title),
          url: l && l.status === "ready" ? link(l.file) + "#" + s.id : "", kind: "知识点",
        });
      });
    }
    return idx;
  }

  /* .steps 的编号是 CSS counter 画的（.steps{counter-reset:st} + li::before{content:counter(st)}），
     原生 ol 的 start 属性对它不生效——所以「拆成两个 ol 续号」时，后一段会从 1 重新数。
     这里把 start 换算成 counter-reset 补上：start="4" → counter-reset:st 3（下一项即第 4 项）。
     页面源码照常写 start="N"（语义正确），展示细节由引擎兜住。 */
  function bindStepsStart() {
    document.querySelectorAll("ol.steps[start]").forEach(function (ol) {
      var n = parseInt(ol.getAttribute("start"), 10);
      if (isNaN(n) || n < 2) return;
      ol.style.counterReset = "st " + (n - 1);
    });
  }

  function bindSearch() {
    var input = $("site-search");
    var hit = $("site-search-hit");
    if (!input || !hit) return;
    var IDX = buildIndex();

    var _lastQ = "", _lastT = 0;
    function run() {
      var q = input.value.trim().toLowerCase();
      if (!q) { hit.classList.remove("on"); hit.innerHTML = ""; return; }
      var res = IDX.filter(function (r) {
        return (r.title + " " + r.sub).toLowerCase().indexOf(q) >= 0;
      }).slice(0, 14);
      /* 外部统计：只上报「稳定下来的输入」（防抖 800ms + 同一关键词不重复），
         且仅在 analytics.js 的 Umami 配置非空时才会真正发请求。 */
      try {
        var now = Date.now();
        if (q.length >= 2 && q !== _lastQ && now - _lastT > 800) {
          _lastQ = q; _lastT = now;
          if (window.AN && window.AN.events) window.AN.events.search(q, res.length);
        }
      } catch (e) {}
      if (!res.length) { hit.innerHTML = '<div class="sr__empty">没找到「' + esc(q) + "」</div>"; hit.classList.add("on"); return; }
      hit.innerHTML = res.map(function (r) {
        if (!r.url) {
          return '<a class="sr" href="#" data-todo="' + r.no + '"><b>' + esc(r.title) +
            '　<span class="badge badge--todo">待转化</span></b><span>' + esc(r.sub) + "</span></a>";
        }
        return '<a class="sr" href="' + r.url + '"><b>' + esc(r.title) +
          '　<span class="badge">' + esc(r.kind) + "</span></b><span>" + esc(r.sub) + "</span></a>";
      }).join("");
      hit.classList.add("on");
      hit.querySelectorAll("[data-todo]").forEach(function (a) {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          alert("第 " + a.getAttribute("data-todo") + " 次课还没有转化上线。");
        });
      });
    }
    input.addEventListener("input", run);
    input.addEventListener("focus", run);
    input.addEventListener("keydown", function (e) { if (e.key === "Escape") { hit.classList.remove("on"); input.blur(); } });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".searchbox")) hit.classList.remove("on");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== input &&
          !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); input.focus();
      }
    });
  }

  /* ======================================================================
     9b. 课次引用（正文里不要写死课次链接）
     ----------------------------------------------------------------------
     课时页正文里只写课次号，标题与链接全部由 course-map 生成：
       <a class="xref" data-lesson="8"></a>
         → 自动填「第 8 次课 Skill——给 AI 装操作手册」并接上链接
       <a class="xref" data-lesson="18">数据源那一课</a>
         → 用你自己写的文字，链接仍自动接
     已上线的课 → 可点链接；未上线的课 → 退化成带「待上线」标记的纯文字，不会产生死链。
     这样以后调整课次标题或上线新课时，正文一个字都不用改。
     ====================================================================== */
  function renderXref() {
    var map = {};
    FLAT.forEach(function (l) { map[l.no] = l; });
    var nodes = document.querySelectorAll("a.xref");
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      var no = parseInt(a.getAttribute("data-lesson"), 10);
      var l = map[no];
      if (!a.textContent.replace(/\s/g, "")) {
        a.textContent = l ? "第 " + l.no + " 次课 " + l.title : "第 " + no + " 次课";
      }
      if (!l) { a.className = "xref xref--missing"; a.removeAttribute("href"); continue; }
      if (l.status === "ready") {
        a.setAttribute("href", link(l.file));
        a.className = "xref xref--ready";
        a.setAttribute("title", l.title + " —— " + l.subtitle);
      } else {
        a.removeAttribute("href");
        a.className = "xref xref--pending";
        a.setAttribute("title", "第 " + l.no + " 次课尚未转化上线");
      }
    }
  }

  /* ======================================================================
     10. 启动
     ====================================================================== */
  function boot() {
    renderTopbar();
    renderSidebar();
    renderHead();
    bindCode();
    bindQuiz();
    bindFold();
    bindTabs();
    bindStepsStart();
    renderXref();
    renderTOC();
    renderPager();
    renderFoot();
    bindSearch();
    BODY.classList.add("site-ready");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // 供页面内演示脚本复用
  window.Site = {
    esc: esc, link: link, highlight: highlight,
    flat: FLAT, current: CUR,
    // 演示用：把一个 DOM 节点当终端输出，逐行打字
    type: function (node, lines, done) {
      node.innerHTML = "";
      var i = 0;
      (function step() {
        if (i >= lines.length) { if (done) done(); return; }
        var d = document.createElement("div");
        d.innerHTML = lines[i];
        node.appendChild(d);
        node.scrollTop = node.scrollHeight;
        i++;
        setTimeout(step, 130);
      })();
    },
  };

  // 注入学情采集（独立文件，本地为底座；未配置上报端点时完全不联网）
  try {
    var ltScript = document.createElement("script");
    ltScript.src = ROOT + "assets/js/learning-tracker.js";
    ltScript.async = true;
    document.head.appendChild(ltScript);
  } catch (e) {}

  // 注入学习进度（独立文件，学生端「标记已学」与完成度）
  try {
    var pgScript = document.createElement("script");
    pgScript.src = ROOT + "assets/js/progress.js";
    pgScript.async = true;
    document.head.appendChild(pgScript);
  } catch (e) {}

  // 注入课程 AI 助教浮窗（独立文件，自动加载，无需改各课时页）
  try {
    var atScript = document.createElement("script");
    atScript.src = ROOT + "assets/js/ai-tutor.js";
    atScript.async = true;
    document.head.appendChild(atScript);
  } catch (e) {}

  // 注入外部统计（Umami，**未填配置则完全不联网**；详见 analytics.js 顶部说明）。
  // 放在最后加载：主课程功能不依赖它，网络慢也拖不慢页面。
  try {
    var anScript = document.createElement("script");
    anScript.src = ROOT + "assets/js/analytics.js";
    anScript.async = true;
    document.head.appendChild(anScript);
  } catch (e) {}

})();
