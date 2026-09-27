/* ==========================================================================
   progress.js —— 学习进度与完成度（学生端）
   --------------------------------------------------------------------------
   解决什么问题：
     原来学生看完一课，页面不留任何痕迹，下次打开不知道「我学到哪了」。
     本站 32 课，没有进度标记等于每次都要自己回忆——这是课后自学最大的摩擦。

   做什么：
     · 每课页顶部一个「标记已学 / 已学 ✓」按钮，点一下即完成该课
     · 右侧浮出一个进度环，显示 32 课总完成度
     · 页面里自动给每个正文小节打「读过」标记（滚过即算），用于细粒度续学
     · 记录「上次学到哪」，首页与学习中心可一键续学

   设计原则（与全站一致）：
     · 纯前端、零依赖、断网可用；进度只存 localStorage，不上传
     · 不是「考核」——标记与否只影响学生自己的视图，老师看不到「谁没点」
     · 与 learning-tracker.js 共用 lt_sid_v1（同一匿名身份），但存储键独立

   存储：
     pg_done_v1  { "1": 时间戳, "2": 时间戳, ... }     已学完的课次
     pg_read_v1  { "19": ["s-role","s-kb",...] }       已读过的小节 id
     pg_last_v1  { no, sec, at }                       上次学到哪
   ========================================================================== */
(function () {
  "use strict";

  var K_DONE = "pg_done_v1", K_READ = "pg_read_v1", K_LAST = "pg_last_v1";
  var TOTAL = 32;

  function sget(k) { try { return window.localStorage ? localStorage.getItem(k) : null; } catch (e) { return null; } }
  function sset(k, v) { try { if (window.localStorage) localStorage.setItem(k, v); } catch (e) {} }
  function jget(k, d) { try { var v = sget(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function curNo() { return parseInt((document.body && document.body.getAttribute("data-lesson")) || "0", 10); }
  function courseTotal() {
    var m = window.COURSE_MAP && window.COURSE_MAP.meta;
    return (m && m.totalSessions) || TOTAL;
  }
  function flat() {
    return (window.COURSE_MAP && window.COURSE_MAP.flat) ? window.COURSE_MAP.flat() : [];
  }
  function root() { return (document.body && document.body.getAttribute("data-root")) || "./"; }

  /* ---------- 读 / 写 ---------- */
  function getDone() { return jget(K_DONE, {}); }
  function isDone(no) { return !!getDone()[String(no)]; }

  function markDone(no, on) {
    var d = getDone();
    if (on === false) delete d[String(no)];
    else d[String(no)] = Date.now();
    sset(K_DONE, JSON.stringify(d));
    return d;
  }

  function getRead() { return jget(K_READ, {}); }

  function markRead(no, secId) {
    var r = getRead();
    var arr = r[String(no)] || (r[String(no)] = []);
    if (arr.indexOf(secId) < 0) { arr.push(secId); sset(K_READ, JSON.stringify(r)); }
  }

  function setLast(no, secId) {
    sset(K_LAST, JSON.stringify({ no: no, sec: secId || "", at: Date.now() }));
  }
  function getLast() { return jget(K_LAST, null); }

  /* ---------- 统计 ---------- */
  function stats() {
    var done = getDone(), read = getRead();
    var total = courseTotal();
    var doneCount = Object.keys(done).filter(function (k) { return parseInt(k, 10) > 0; }).length;
    var readCount = Object.keys(read).reduce(function (a, k) { return a + (read[k] || []).length; }, 0);
    return {
      total: total,
      doneCount: doneCount,
      pct: total ? Math.round(doneCount / total * 100) : 0,
      readSections: readCount,
      done: done,
      read: read,
      last: getLast()
    };
  }

  /* 按模块分组的完成情况（学习中心与老师端复用） */
  function byModule() {
    var done = getDone();
    var mods = (window.COURSE_MAP && window.COURSE_MAP.modules) || [];
    return mods.map(function (m) {
      var ls = (m.lessons || []).filter(function (l) { return l && l.no; });
      var d = ls.filter(function (l) { return done[String(l.no)]; }).length;
      return {
        id: m.id, name: m.name, range: m.range,
        total: ls.length, done: d,
        pct: ls.length ? Math.round(d / ls.length * 100) : 0,
        lessons: ls
      };
    });
  }

  /* ---------- UI：进度环（右下角，顶部可点开学习中心） ---------- */
  function buildRing() {
    var st = document.createElement("style");
    st.textContent = [
      ".pg-ring{position:fixed;right:22px;bottom:22px;z-index:9998;width:56px;height:56px;border-radius:50%;",
      "background:conic-gradient(#2563EB var(--pg,0%),#E2E8F0 0);cursor:pointer;border:none;padding:0;",
      "box-shadow:0 6px 18px rgba(37,99,235,.3);display:flex;align-items:center;justify-content:center;}",
      ".pg-ring:hover{box-shadow:0 8px 24px rgba(37,99,235,.42);}",
      ".pg-ring i{width:42px;height:42px;border-radius:50%;background:#fff;display:flex;align-items:center;",
      "justify-content:center;font-style:normal;font-size:13px;font-weight:700;color:#2563EB;}",
      ".pg-ring:focus-visible{outline:3px solid #2563EB;outline-offset:2px;}",
      ".pg-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:10px 0 4px;padding:11px 14px;",
      "background:#EFF6FF;border:1px solid #BFDBFE;border-radius:11px;font-size:13px;color:#1E3A8A;}",
      ".pg-bar b{color:#2563EB;}",
      ".pg-btn{padding:7px 14px;border:none;border-radius:8px;background:#2563EB;color:#fff;cursor:pointer;font-size:12.5px;}",
      ".pg-btn:hover{background:#1D4ED8;}",
      ".pg-btn.on{background:#059669;}",
      ".pg-btn.ghost{background:#fff;color:#1E3A8A;border:1px solid #BFDBFE;}",
      ".pg-btn.ghost:hover{background:#DBEAFE;}",
      ".sec.pg-read > .sec__read{display:inline-block;}",
      ".sec__read{display:none;font-size:11px;color:#059669;margin-left:8px;font-weight:600;}"
    ].join("");
    document.head.appendChild(st);

    var ring = document.createElement("button");
    ring.className = "pg-ring"; ring.type = "button";
    ring.title = "学习进度 · 点击打开学习中心";
    ring.setAttribute("aria-label", "学习进度");
    ring.innerHTML = "<i>0%</i>";
    ring.addEventListener("click", function () {
      try { if (window.AN) window.AN.events.progressOpen(); } catch (e) {}
      location.href = root() + "tools/my-progress.html";
    });
    document.body.appendChild(ring);
    ring._i = ring.querySelector("i");
    return ring;
  }

  function paintRing(ring) {
    if (!ring || !ring._i) return;
    var p = stats().pct;
    ring.style.setProperty("--pg", p + "%");
    ring._i.textContent = p + "%";
  }

  /* ---------- UI：课时页顶部进度条 + 标记按钮 ---------- */
  function buildLessonBar() {
    var main = document.getElementById("main");
    if (!main) return;
    var no = curNo();
    if (!no) return;                                   // 首页/工具页不显示

    var head = document.getElementById("site-head");
    var bar = document.createElement("div");
    bar.className = "pg-bar";
    bar.id = "pg-bar";
    head && head.parentNode ? head.parentNode.insertBefore(bar, head.nextSibling) : main.insertBefore(bar, main.firstChild);
    return bar;
  }

  function paintLessonBar(bar) {
    if (!bar) return;
    var no = curNo();
    var st = stats();
    var done = st.done[String(no)];
    var flatArr = flat();
    var idx = flatArr.findIndex ? flatArr.findIndex(function (l) { return l.no === no; }) : -1;
    var prev = idx > 0 ? flatArr[idx - 1] : null;
    var next = (idx >= 0 && idx < flatArr.length - 1) ? flatArr[idx + 1] : null;

    var lastTxt = "";
    var last = st.last;
    if (last && last.no && last.no !== no) {
      var lt = flatArr.filter(function (l) { return l.no === last.no; })[0];
      if (lt) lastTxt = '　<span>上次学到：<b>第 ' + last.no + ' 次课</b> ' +
        '<a href="' + root() + lt.file + '" style="color:#2563EB">接着看 →</a></span>';
    }

    bar.innerHTML =
      '<span>本课进度：' + (done ? '<b>已学完 ✓</b>' : '<b>未标记</b>') +
        '　总进度 <b>' + st.doneCount + '/' + st.total + '</b>（' + st.pct + '%）</span>' + lastTxt +
      '<span style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">' +
        '<button class="pg-btn' + (done ? " on" : "") + '" id="pg-toggle" type="button">' +
          (done ? "已学 ✓（点击取消）" : "标记本课已学") + "</button>" +
        (prev ? '<button class="pg-btn ghost" id="pg-prev" type="button">← 上一课未标记</button>' : "") +
      "</span>";

    var tg = bar.querySelector("#pg-toggle");
    tg && tg.addEventListener("click", function () {
      var now = isDone(no);
      markDone(no, !now);
      if (!now) { try { if (window.AN) window.AN.events.lessonDone(no); } catch (e) {} }
      paintLessonBar(bar); paintRing(ring);
    });
    var pv = bar.querySelector("#pg-prev");
    pv && pv.addEventListener("click", function () {
      if (idx > 0) location.href = root() + flatArr[idx - 1].file;
    });
  }

  /* ---------- 小节「读过」标记 ---------- */
  function bindSections() {
    var no = curNo();
    if (!no) return;
    var secs = document.querySelectorAll("main .sec[id]");
    if (!secs.length) return;
    var read = getRead()[String(no)] || [];

    /* 给已读小节加标记 */
    secs.forEach(function (s) {
      if (read.indexOf(s.id) >= 0) {
        s.classList.add("pg-read");
        if (!s.querySelector(".sec__read")) {
          var h = s.querySelector("h2");
          if (h) {
            var tag = document.createElement("span");
            tag.className = "sec__read"; tag.textContent = "已读";
            h.appendChild(tag);
          }
        }
      }
    });

    if (!("IntersectionObserver" in window)) return;
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var s = e.target;
        if (seen[s.id]) return;
        seen[s.id] = 1;
        markRead(no, s.id);
        setLast(no, s.id);
        if (read.indexOf(s.id) < 0 && !s.querySelector(".sec__read")) {
          s.classList.add("pg-read");
          var h = s.querySelector("h2");
          if (h) {
            var tag = document.createElement("span");
            tag.className = "sec__read"; tag.textContent = "已读";
            h.appendChild(tag);
          }
        }
      });
    }, { threshold: 0.35 });                     // 一节看过 35% 才算读过

    /* 只观察正文小节，跳过首尾的导读/作业？不跳——
       导读与作业也是学习内容，学生划过同样算。 */
    secs.forEach(function (s) { io.observe(s); });
  }

  /* ---------- 标记「上次学到哪」的兜底：离开页面时记当前位置 ---------- */
  function bindLastSeen() {
    var no = curNo();
    if (!no) return;
    window.addEventListener("pagehide", function () {
      /* 找当前视口内最靠上的小节 */
      var best = null, bestTop = Infinity;
      document.querySelectorAll("main .sec[id]").forEach(function (s) {
        var t = s.getBoundingClientRect().top;
        if (t < window.innerHeight * 0.4 && t > -s.offsetHeight && t < bestTop) { bestTop = t; best = s; }
      });
      setLast(no, best ? best.id : "");
    });
  }

  /* ---------- 初始化 ---------- */
  var ring = null;
  function init() {
    try {
      ring = buildRing();
      paintRing(ring);
      var bar = buildLessonBar();
      paintLessonBar(bar);
      bindSections();
      bindLastSeen();
    } catch (e) { /* 任何异常都静默，不影响阅读 */ }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* 暴露给学习中心与老师端复用 */
  window.PG = {
    stats: stats, byModule: byModule, isDone: isDone, markDone: markDone,
    getDone: getDone, getRead: getRead, getLast: getLast,
    KEYS: { done: K_DONE, read: K_READ, last: K_LAST },
    /* 供学习中心导入用 */
    importAll: function (obj) {
      if (!obj || typeof obj !== "object") return false;
      try {
        if (obj.done && typeof obj.done === "object") sset(K_DONE, JSON.stringify(obj.done));
        if (obj.read && typeof obj.read === "object") sset(K_READ, JSON.stringify(obj.read));
        if (obj.last && typeof obj.last === "object") sset(K_LAST, JSON.stringify(obj.last));
        return true;
      } catch (e) { return false; }
    },
    exportAll: function () { return { v: 1, exportedAt: new Date().toISOString(), done: getDone(), read: getRead(), last: getLast() }; },
    reset: function () { [K_DONE, K_READ, K_LAST].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} }); },
    refresh: function () { paintRing(ring); }
  };
})();
