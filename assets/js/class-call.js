/* ==========================================================================
   class-call.js —— 课堂点名互动（上課环节）
   --------------------------------------------------------------------------
   解决什么问题：
     教程站原本只能自学。老师上课想要「抽一位同学回答这题」这种课堂互动，
     就得另外准备材料。这个模块把它做进页面里：点名 → 口头回答 → 展开对答案。

   设计要点：
     · 零改动课时页：由 site.js 注入后，运行时在 s-quiz 之前插入 s-call 小节；
       没配置提问的课自动跳过，不留空壳。
     · 提问内容存在 course-map.js 的 ask 字段里（每课 1–2 题），内容源唯一。
     · 名单由老师粘贴，存在本机 localStorage，全站通用；没名单就退化成抽序号。
     · 答案默认折叠，用站点现成的 .fold 组件，不另造样式语言。
     · 全程 try/catch，任何异常都不影响正常浏览。

   怎么用（老师）：
     上课前点「名单」把班级名单粘进去（支持「学号 姓名」或只写姓名，一行一个 / 逗号分隔）；
     上课时点「开始点名」，抽到谁谁回答；答完点问题下的「看参考答案」对一下。
   ========================================================================== */
(function () {
  "use strict";

  var K_ROSTER = "cc_roster_v1";
  var DEFAULT_SEATS = 45;          // 没名单时，按 45 个学号随机抽

  function sget(k) { try { return window.localStorage ? localStorage.getItem(k) : null; } catch (e) { return null; } }
  function sset(k, v) { try { if (window.localStorage) localStorage.setItem(k, v); } catch (e) {} }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function root() { return (document.body && document.body.getAttribute("data-root")) || "./"; }
  function curNo() { return parseInt((document.body && document.body.getAttribute("data-lesson")) || "0", 10); }

  function curLesson() {
    var CM = window.COURSE_MAP;
    if (!CM || typeof CM.flat !== "function") return null;
    var f = CM.flat(), n = curNo();
    for (var i = 0; i < f.length; i++) if (f[i].no === n) return f[i];
    return null;
  }

  /* ---------- 名单 ---------- */
  function roster() {
    var raw = sget(K_ROSTER);
    if (!raw) return [];
    try {
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter(function (x) { return !!x; }) : [];
    } catch (e) { return []; }
  }
  function saveRoster(list) { sset(K_ROSTER, JSON.stringify(list || [])); }

  /* 把粘贴的文本切成名单：支持换行、逗号、顿号、分号分隔；「学号 姓名」原样保留 */
  function parseRoster(text) {
    var out = [];
    String(text || "").split(/[\n\r,，、;；]+/).forEach(function (line) {
      var t = line.replace(/\s+/g, " ").trim();
      if (t) out.push(t);
    });
    return out;
  }

  /* ---------- 点名状态（本轮已抽，避免连着点同一个人） ---------- */
  var picked = {};

  function drawOne(again) {
    var list = roster();
    var pool, label;
    if (list.length) {
      pool = again ? list : list.filter(function (x) { return !picked[x]; });
      /* 全抽过一遍就清空记录重新开始 */
      if (!pool.length) { picked = {}; pool = list; }
      label = list[Math.floor(Math.random() * pool.length)];
    } else {
      var n = 1 + Math.floor(Math.random() * DEFAULT_SEATS);
      label = String(n).padStart(2, "0") + " 号";
    }
    picked[label] = 1;
    return { who: label, hasRoster: list.length > 0 };
  }

  /* ---------- 样式（只给本模块新元素用，不污染 site.css） ---------- */
  var STYLE = [
    ".cc-roll{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px;}",
    ".cc-who{font-size:15px;font-weight:700;color:#2563EB;min-height:22px;}",
    ".cc-who.empty{font-weight:400;color:#94A3B8;font-size:13px;}",
    ".cc-qs{margin:0;padding-left:0;list-style:none;counter-reset:ccq;}",
    ".cc-qs>li{border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;margin-bottom:10px;background:#fff;}",
    ".cc-q{font-size:14px;color:#0F172A;line-height:1.7;margin-bottom:8px;}",
    ".cc-q .cc-n{display:inline-block;background:#DBEAFE;color:#1D4ED8;border-radius:6px;",
    "padding:1px 8px;font-size:12px;font-weight:700;margin-right:8px;}",
    ".cc-a{font-size:13.5px;color:#334155;line-height:1.75;}",
    ".cc-a b{color:#0F172A;}",
    ".cc-mask{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:10010;display:none;align-items:center;justify-content:center;}",
    ".cc-mask.show{display:flex;}",
    ".cc-box{width:420px;max-width:calc(100vw - 32px);background:#fff;border-radius:14px;padding:18px;}",
    ".cc-box h3{margin:0 0 6px;font-size:15px;color:#0F172A;}",
    ".cc-box p.hint{font-size:12px;color:#64748B;margin:0 0 10px;}",
    ".cc-box textarea{width:100%;height:150px;padding:9px;border:1px solid #CBD5E1;border-radius:8px;",
    "font-size:12.5px;font-family:inherit;box-sizing:border-box;resize:vertical;}",
    ".cc-box .row{display:flex;gap:8px;margin-top:12px;}",
    ".cc-box button{flex:1;padding:9px;border:none;border-radius:8px;cursor:pointer;font-size:13px;}",
    ".cc-cancel{background:#E2E8F0;color:#334155;}",
    ".cc-clear{background:#FEF2F2;color:#B91C1C;}",
    ".cc-save{background:#2563EB;color:#fff;}"
  ].join("");

  /* ---------- 构建 ---------- */
  function build(lesson) {
    var asks = lesson && lesson.ask;
    if (!asks || !asks.length) return;                 // 没配提问的课，跳过

    var quiz = document.getElementById("s-quiz");
    if (!quiz) return;
    if (document.getElementById("s-call")) return;     // 已插入过

    var st = document.createElement("style");
    st.textContent = STYLE;
    document.head.appendChild(st);

    /* 提问列表：问题常显，答案用 .fold 折叠 */
    var items = asks.map(function (a, i) {
      return '<li>' +
        '<div class="cc-q"><span class="cc-n">问题 ' + (i + 1) + '</span>' + esc(a.q) + "</div>" +
        '<div class="fold"><button class="fold__hd" type="button">点开看参考答案</button>' +
        '<div class="fold__bd"><div class="cc-a">' + esc(a.a) + "</div></div></div>" +
      "</li>";
    }).join("");

    var sec = document.createElement("section");
    sec.className = "sec";
    sec.id = "s-call";
    sec.innerHTML =
      '<h2>课堂点名<span class="sec__tag">上课环节 · 随机抽人</span></h2>' +
      '<p class="lead">上课点一下，抽一位同学口头回答。答完再展开对一下，看漏了哪一块。</p>' +
      '<div class="callout callout--tip">' +
        '<span class="callout__t">点名</span>' +
        '<div class="cc-roll">' +
          '<button class="btn btn--main" id="cc-go" type="button">开始点名</button>' +
          '<span class="cc-who empty" id="cc-who">还没开始</span>' +
          '<button class="btn btn--ghost" id="cc-roster" type="button">名单设置</button>' +
        "</div>" +
      "</div>" +
      '<ol class="cc-qs" id="cc-qs">' + items + "</ol>";

    /* 插到随堂自测之前：先课堂互动，再个人自检 */
    quiz.parentNode.insertBefore(sec, quiz);

    /* 名单弹窗 */
    var mask = document.createElement("div");
    mask.className = "cc-mask";
    mask.id = "cc-mask";
    mask.innerHTML =
      '<div class="cc-box"><h3>班级名单</h3>' +
      '<p class="hint">一行一个，支持「学号 姓名」或只写姓名，也可用逗号分隔。名单只存在这台电脑的浏览器里，不上传。</p>' +
      '<textarea id="cc-text" placeholder="2023110101 张三&#10;2023110102 李四&#10;2023110103 王五"></textarea>' +
      '<div class="row">' +
        '<button class="cc-cancel" id="cc-cancel" type="button">取消</button>' +
        '<button class="cc-clear" id="cc-clear" type="button">清空</button>' +
        '<button class="cc-save" id="cc-save" type="button">保存</button>' +
      "</div></div>";
    document.body.appendChild(mask);

    bind(lesson);
  }

  function bind(lesson) {
    var who = document.getElementById("cc-who");
    var mask = document.getElementById("cc-mask");
    var text = document.getElementById("cc-text");

    function show(r) {
      var list = roster();
      who.className = "cc-who";
      who.innerHTML = "抽到：" + esc(r.who) +
        (r.hasRoster ? "" : "　<span style=\"font-size:12px;color:#94A3B8\">（还没设名单，先按学号抽）</span>");
      /* 已点过的人，本次课不再重复 */
      var left = list.length ? list.length - Object.keys(picked).length : 0;
      if (list.length && left > 0) {
        who.innerHTML += '　<span style="font-size:12px;color:#94A3B8">还剩 ' + left + " 人没点</span>";
      }
    }

    document.getElementById("cc-go").addEventListener("click", function () { show(drawOne(false)); });

    document.getElementById("cc-roster").addEventListener("click", function () {
      text.value = roster().join("\n");
      mask.classList.add("show");
    });
    document.getElementById("cc-cancel").addEventListener("click", function () { mask.classList.remove("show"); });
    document.getElementById("cc-clear").addEventListener("click", function () {
      saveRoster([]); text.value = ""; picked = {};
      who.className = "cc-who empty"; who.textContent = "名单已清空，现在按学号随机抽";
    });
    document.getElementById("cc-save").addEventListener("click", function () {
      saveRoster(parseRoster(text.value));
      picked = {};
      mask.classList.remove("show");
      var n = roster().length;
      who.className = n ? "cc-who" : "cc-who empty";
      who.textContent = n ? ("名单已保存，共 " + n + " 人") : "没名单，按学号随机抽";
    });
  }

  /* ---------- 入口 ---------- */
  function init() {
    try {
      build(curLesson());
    } catch (e) { /* 静默，不影响页面 */ }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();