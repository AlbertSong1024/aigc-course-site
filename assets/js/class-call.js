/* ==========================================================================
   class-call.js —— 课堂点名互动（上課环节）
   --------------------------------------------------------------------------
   干什么：
     教程站原本只能自学。老师上课想要「抽一位同学回答这题」这种互动，
     就在正文中间插一节：点名 → 口头回答 → 点开对答案。

   位置：
     插在**正文第 2 个小节之后**，也就是课讲了一半的时候。
     不放课末——下课了来不及点；放太前学生还没进入状态。

   设计要点：
     · 零改动课时页：由 site.js 注入后，运行时插入；没配提问的课自动跳过。
     · 提问内容存在 course-map.js 的 ask 字段里（每课 1 题），内容源唯一。
     · 答案自己控制展开，**不用站点的 .fold 组件**——那个由 site.js 在加载时
       统一绑定，运行时插入的节点绑不上，会点不开（已踩过这个坑）。
     · 名单由老师粘贴，存本机 localStorage；没名单就退化成抽学号。
     · 全程 try/catch，异常不影响正常浏览。
   ========================================================================== */
(function () {
  "use strict";

  var K_ROSTER = "cc_roster_v1";
  var SEATS = 45;                       // 没名单时按 45 个学号抽

  function sget(k) { try { return window.localStorage ? localStorage.getItem(k) : null; } catch (e) { return null; } }
  function sset(k, v) { try { if (window.localStorage) localStorage.setItem(k, v); } catch (e) {} }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
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
    try { var a = JSON.parse(raw); return Array.isArray(a) ? a.filter(Boolean) : []; } catch (e) { return []; }
  }
  function saveRoster(l) { sset(K_ROSTER, JSON.stringify(l || [])); }
  function parseRoster(text) {
    var out = [];
    String(text || "").split(/[\n\r,，、;；]+/).forEach(function (line) {
      var t = line.replace(/\s+/g, " ").trim();
      if (t) out.push(t);
    });
    return out;
  }

  /* 本轮已抽，避免连着点同一个人 */
  var picked = {};
  function drawOne() {
    var list = roster();
    if (list.length) {
      var pool = list.filter(function (x) { return !picked[x]; });
      if (!pool.length) { picked = {}; pool = list; }
      var name = pool[Math.floor(Math.random() * pool.length)];
      picked[name] = 1;
      return { who: name, left: list.length - Object.keys(picked).length };
    }
    var n = String(1 + Math.floor(Math.random() * SEATS)).padStart(2, "0");
    return { who: n + " 号", left: 0 };
  }

  /* ---------- 样式 ---------- */
  var STYLE = [
    ".cc-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:2px 0 4px;}",
    ".cc-who{font-size:15px;font-weight:700;color:#2563EB;}",
    ".cc-who.dim{font-weight:400;color:#94A3B8;font-size:13.5px;}",
    ".cc-who small{font-weight:400;color:#94A3B8;font-size:12px;margin-left:8px;}",
    ".cc-qs{margin:14px 0 0;padding-left:0;list-style:none;}",
    ".cc-qs>li{border:1px solid #E2E8F0;border-left:3px solid #F59E0B;border-radius:8px;",
    "padding:11px 14px;margin-bottom:8px;background:#fff;}",
    ".cc-q{font-size:14.5px;color:#0F172A;line-height:1.65;}",
    ".cc-ab{margin-top:8px;padding:4px 12px;border:1px solid #BFDBFE;border-radius:7px;",
    "background:#EFF6FF;color:#1D4ED8;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;}",
    ".cc-ab:hover{background:#DBEAFE;}",
    ".cc-ans{display:none;margin-top:8px;padding:9px 12px;background:#F8FAFC;border-radius:8px;",
    "font-size:13.5px;color:#334155;line-height:1.75;}",
    ".cc-ans.on{display:block;}",
    ".cc-mask{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:10010;display:none;align-items:center;justify-content:center;}",
    ".cc-mask.show{display:flex;}",
    ".cc-box{width:400px;max-width:calc(100vw - 32px);background:#fff;border-radius:14px;padding:18px;}",
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

  /* ---------- 插入位置：正文第 2 个小节之后 ---------- */
  function anchorFor() {
    var skip = { "s-guide": 1, "s-goal": 1, "s-quiz": 1, "s-recap": 1, "s-hw": 1, "s-training": 1, "s-call": 1 };
    var all = Array.prototype.slice.call(document.querySelectorAll("main .sec"));
    var bodySecs = all.filter(function (s) { return !skip[s.id]; });
    if (bodySecs.length >= 2) return bodySecs[1];
    if (bodySecs.length === 1) return bodySecs[0];
    return document.getElementById("s-guide");
  }

  /* ---------- 构建 ---------- */
  function build(lesson) {
    var asks = lesson && lesson.ask;
    if (!asks || !asks.length) return;
    if (document.getElementById("s-call")) return;
    var anchor = anchorFor();
    if (!anchor || !anchor.parentNode) return;

    var st = document.createElement("style");
    st.textContent = STYLE;
    document.head.appendChild(st);

    var items = asks.map(function (a) {
      return "<li>" +
        '<div class="cc-q">' + esc(a.q) + "</div>" +
        '<button class="cc-ab" type="button">看答案</button>' +
        '<div class="cc-ans">' + esc(a.a) + "</div>" +
      "</li>";
    }).join("");

    var sec = document.createElement("section");
    sec.className = "sec";
    sec.id = "s-call";
    sec.innerHTML =
      '<h2>课堂点名<span class="sec__tag">抽一位同学回答</span></h2>' +
      '<div class="cc-bar">' +
        '<button class="btn btn--main" id="cc-go" type="button">点名</button>' +
        '<span class="cc-who dim" id="cc-who">点一下，抽一个人</span>' +
        '<button class="btn btn--ghost" id="cc-roster" type="button">名单</button>' +
      "</div>" +
      '<ol class="cc-qs">' + items + "</ol>";
    anchor.parentNode.insertBefore(sec, anchor.nextSibling);

    /* 答案展开（自己控制，不依赖 site.js 的 .fold 绑定） */
    Array.prototype.forEach.call(sec.querySelectorAll(".cc-ab"), function (btn) {
      btn.addEventListener("click", function () {
        var box = btn.nextElementSibling;
        var open = box.classList.toggle("on");
        btn.textContent = open ? "收起答案" : "看答案";
      });
    });

    var mask = document.createElement("div");
    mask.className = "cc-mask";
    mask.id = "cc-mask";
    mask.innerHTML =
      '<div class="cc-box"><h3>班级名单</h3>' +
      '<p class="hint">一行一个，支持「学号 姓名」或只写姓名，也可用逗号分隔。只存在这台电脑，不上传。</p>' +
      '<textarea id="cc-text" placeholder="2023110101 张三&#10;2023110102 李四&#10;2023110103 王五"></textarea>' +
      '<div class="row">' +
        '<button class="cc-cancel" id="cc-cancel" type="button">取消</button>' +
        '<button class="cc-clear" id="cc-clear" type="button">清空</button>' +
        '<button class="cc-save" id="cc-save" type="button">保存</button>' +
      "</div></div>";
    document.body.appendChild(mask);

    bind();
  }

  function bind() {
    var who = document.getElementById("cc-who");
    var mask = document.getElementById("cc-mask");
    var text = document.getElementById("cc-text");

    document.getElementById("cc-go").addEventListener("click", function () {
      var r = drawOne();
      who.className = "cc-who";
      who.innerHTML = "抽到：" + esc(r.who) +
        (r.left > 0 ? "<small>还剩 " + r.left + " 人</small>" : "");
    });
    document.getElementById("cc-roster").addEventListener("click", function () {
      text.value = roster().join("\n");
      mask.classList.add("show");
    });
    document.getElementById("cc-cancel").addEventListener("click", function () { mask.classList.remove("show"); });
    document.getElementById("cc-clear").addEventListener("click", function () {
      saveRoster([]); text.value = ""; picked = {};
      mask.classList.remove("show");
      who.className = "cc-who dim"; who.textContent = "没名单，按学号抽";
    });
    document.getElementById("cc-save").addEventListener("click", function () {
      saveRoster(parseRoster(text.value)); picked = {};
      mask.classList.remove("show");
      var n = roster().length;
      who.className = n ? "cc-who" : "cc-who dim";
      who.textContent = n ? ("名单 " + n + " 人") : "没名单，按学号抽";
    });
  }

  function init() {
    try { build(curLesson()); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();