/* ==========================================================================
   class-call.js —— 课堂提问（上课环节）
   --------------------------------------------------------------------------
   干什么：
     老师用**学习通**抽人回答，页面不负责点名。
     这里只备题：每课 1 个问题 + 参考答案（默认收起，答完点开对），
     插在正文中间，老师讲到那儿在学习通上点人就行。

   位置：
     插在**正文第 2 个小节之后**，课讲了一半的位置。
     不放课末——下课了来不及用。

   设计要点：
     · 零改动课时页：由 site.js 注入后运行时插入；没配提问的课自动跳过。
     · 提问内容存在 course-map.js 的 ask 字段里，内容源唯一。
     · 答案自己控制展开，**不用站点的 .fold 组件**——那个由 site.js 在加载时
       统一绑定，运行时插入的节点绑不上，会点不开（已踩过这个坑）。
     · 全程 try/catch，异常不影响正常浏览。
   ========================================================================== */
(function () {
  "use strict";

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

  var STYLE = [
    ".cc-qs{margin:14px 0 0;padding-left:0;list-style:none;}",
    ".cc-qs>li{border:1px solid #E2E8F0;border-left:3px solid #F59E0B;border-radius:8px;",
    "padding:11px 14px;margin-bottom:8px;background:#fff;}",
    ".cc-q{font-size:14.5px;color:#0F172A;line-height:1.65;}",
    ".cc-ab{margin-top:8px;padding:4px 12px;border:1px solid #BFDBFE;border-radius:7px;",
    "background:#EFF6FF;color:#1D4ED8;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;}",
    ".cc-ab:hover{background:#DBEAFE;}",
    ".cc-ans{display:none;margin-top:8px;padding:9px 12px;background:#F8FAFC;border-radius:8px;",
    "font-size:13.5px;color:#334155;line-height:1.75;}",
    ".cc-ans.on{display:block;}"
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
      '<h2>课堂提问<span class="sec__tag">老师备着，课上抽人时用</span></h2>' +
      '<p class="lead">选人在学习通上做，这里只备题。答案先藏着，同学答完再点开对一下。</p>' +
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
  }

  function init() {
    try { build(curLesson()); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();