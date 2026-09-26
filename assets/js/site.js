/* ==========================================================================
   site.js —— 课程教程站运行时引擎 v1.0
   --------------------------------------------------------------------------
   职责（页面里不需要重复写这些 HTML，全部由本文件生成，保证 27 课完全一致）：
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

      var tags = "";
      if (CUR.tags && CUR.tags.length) {
        tags = '<div class="knav" style="margin-top:16px">' +
          CUR.tags.map(function (t, i) {
            return '<a href="#s-' + cataSlug(t) + '"><b>关键词 ' + (i + 1) + "</b>" + esc(t) + "</a>";
          }).join("") + "</div>";
        tags = ""; // 关键词卡默认不渲染（避免与正文小节锚点不符），如需启用删掉本行
      }

      head.className = "page-head";
      head.innerHTML =
        '<span class="page-head__no">第 ' + CUR.no + " 次课 · " + esc(CUR.moduleNo) + "</span>" +
        "<h1>" + esc(CUR.title) + "<small>" + esc(CUR.subtitle) + "</small></h1>" +
        '<p style="color:#64748B;font-size:13.5px;margin:12px 0 0">' + esc(CUR.summary) + "</p>" +
        '<div class="meta">' + chips.join("") + "</div>" + tags;
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
        // （首页课程地图有 27 张课次卡片，标题也是 h3，靠这条挡掉）
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
     ====================================================================== */
  function renderFoot() {
    var host = $("site-foot");
    if (!host) return;
    var ready = FLAT.filter(function (l) { return l.status === "ready"; }).length;
    host.innerHTML =
      "<span>" + esc(CM.meta.course) + " · " + esc(CM.meta.school) + " · " + esc(CM.meta.term) +
      "　|　课程教程站 v1.0　|　已上线 " + ready + " / " + FLAT.length + " 课</span>" +
      "<span>资料版本 " + esc(CM.meta.updated) + "　·　" + esc(CM.meta.scopeNote) + "</span>";
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
  function bindQuiz() {
    document.querySelectorAll(".quiz__reveal").forEach(function (b) {
      b.addEventListener("click", function () {
        var ans = b.parentNode.querySelector(".quiz__ans");
        if (!ans) return;
        var on = ans.classList.toggle("on");
        b.textContent = on ? "收起答案" : "查看答案";
      });
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

    function run() {
      var q = input.value.trim().toLowerCase();
      if (!q) { hit.classList.remove("on"); hit.innerHTML = ""; return; }
      var res = IDX.filter(function (r) {
        return (r.title + " " + r.sub).toLowerCase().indexOf(q) >= 0;
      }).slice(0, 14);
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

  // 注入课程 AI 助教浮窗（独立文件，自动加载，无需改各课时页）
  try {
    var atScript = document.createElement("script");
    atScript.src = ROOT + "assets/js/ai-tutor.js";
    atScript.async = true;
    document.head.appendChild(atScript);
  } catch (e) {}

})();
