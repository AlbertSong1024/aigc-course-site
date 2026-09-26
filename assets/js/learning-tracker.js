/* ==========================================================================
   learning-tracker.js —— 学情采集（本地为底座 + 可选匿名上报）
   --------------------------------------------------------------------------
   设计原则（必须与本站「零 CDN / 断网可用」一致）：
     · 纯前端、无外部依赖，自带样式；由 site.js 注入，不改 32 个课时页
     · **本地优先**：所有采集先写 localStorage，断网照常记录，永不丢数据
     · **上报可选**：只有老师配置了上报端点时才联网；未配置或断网 = 纯本地，静默降级
     · **默认匿名**：只有随机 ID，不含姓名/学号。要实名由学生自己在档案里填
     · 全程 try/catch，任何异常都不影响正常浏览
   采集信号：
     visit 进入课时 / dwell 停留时长 / demo 演示交互 / quiz 自测自评
     ask   问了 AI 助教 / hw 展开作业 / video 视频进入视野
   ========================================================================== */
(function () {
  "use strict";

  var K_LOG = "lt_log_v1", K_SID = "lt_sid_v1", K_NAME = "lt_name_v1", K_EP = "lt_endpoint_v1";
  var MAX = 800;                       // 本地事件上限，超出丢最旧的

  function sget(k) { try { return window.localStorage ? localStorage.getItem(k) : null; } catch (e) { return null; } }
  function sset(k, v) { try { if (window.localStorage) localStorage.setItem(k, v); } catch (e) {} }
  function jget(k, d) { try { var v = sget(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }

  function sid() {
    var s = sget(K_SID);
    if (!s) {
      s = "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      sset(K_SID, s);
    }
    return s;
  }
  function curNo() { return parseInt((document.body && document.body.getAttribute("data-lesson")) || "0", 10); }

  var log = jget(K_LOG, []);

  function track(type, data) {
    try {
      log.push({ t: Date.now(), type: type, lesson: curNo(), data: data || null });
      if (log.length > MAX) log = log.slice(-MAX);
      sset(K_LOG, JSON.stringify(log));
    } catch (e) {}
  }

  /* ---------- 汇总：把事件流算成学情指标 ---------- */
  function summary() {
    var byLesson = {}, totalDwell = 0, asks = 0, quizN = 0, quizSum = 0, demos = 0, hw = 0;
    log.forEach(function (e) {
      var n = e.lesson || 0;
      if (!byLesson[n]) byLesson[n] = { visit: 0, dwell: 0, demo: 0, quiz: null };
      var b = byLesson[n];
      if (e.type === "visit") { b.visit++; if (n > 0) { } }
      else if (e.type === "dwell") { b.dwell += (e.data && e.data.ms) || 0; totalDwell += (e.data && e.data.ms) || 0; }
      else if (e.type === "demo") { b.demo++; demos++; }
      else if (e.type === "quiz") { b.quiz = e.data; quizN++; quizSum += (e.data && e.data.correct) || 0; }
      else if (e.type === "ask") { asks++; }
      else if (e.type === "hw") { hw++; }
    });
    var lessonsDone = Object.keys(byLesson).filter(function (k) { return parseInt(k, 10) > 0; }).length;
    return {
      sid: sid(),
      name: sget(K_NAME) || "",
      lessonsVisited: lessonsDone,
      totalDwellMs: totalDwell,
      demoRuns: demos,
      askCount: asks,
      hwOpened: hw,
      quizTimes: quizN,
      quizAvg: quizN ? Math.round((quizSum / quizN) * 10) / 10 : null,
      byLesson: byLesson,
      events: log.length,
      firstAt: log.length ? log[0].t : null,
      lastAt: log.length ? log[log.length - 1].t : null
    };
  }

  function fmtMs(ms) {
    var s = Math.round((ms || 0) / 1000);
    if (s < 60) return s + " 秒";
    var m = Math.floor(s / 60);
    if (m < 60) return m + " 分 " + (s % 60) + " 秒";
    return Math.floor(m / 60) + " 小时 " + (m % 60) + " 分";
  }

  /* ---------- 可选匿名上报（未配置端点 = 完全不联网） ---------- */
  function endpoint() { return sget(K_EP) || ""; }
  function canReport() { return !!endpoint() && typeof fetch === "function"; }
  function report() {
    if (!canReport()) return;
    try {
      fetch(endpoint(), {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid: sid(), name: sget(K_NAME) || "", at: Date.now(), summary: summary() })
      }).catch(function () { /* 断网/未配置：静默，本地数据不丢 */ });
    } catch (e) {}
  }

  /* ---------- 导出（交作业用） ---------- */
  function exportJSON() {
    var data = { v: 1, course: "AIGC应用与实践", exportedAt: new Date().toISOString(), summary: summary(), log: log };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    var nm = (sget(K_NAME) || sid()).replace(/[^\w\u4e00-\u9fa5-]/g, "");
    a.href = URL.createObjectURL(blob);
    a.download = "学情档案_" + (nm || "匿名") + "_" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  /* ---------- 面板 ---------- */
  function buildUI() {
    var st = document.createElement("style");
    st.textContent = [
      ".lt-fab{position:fixed;right:88px;bottom:22px;z-index:9999;width:54px;height:54px;border:none;border-radius:50%;",
      "background:#F59E0B;color:#fff;font-size:15px;cursor:pointer;box-shadow:0 6px 18px rgba(245,158,11,.35);}",
      ".lt-fab:hover{background:#d97706;}",
      ".lt-panel{position:fixed;right:18px;bottom:18px;z-index:10000;width:390px;max-width:calc(100vw - 24px);",
      "max-height:calc(100vh - 36px);overflow-y:auto;background:#fff;border-radius:14px;",
      "box-shadow:0 12px 40px rgba(15,23,42,.3);display:none;padding:16px;font-size:13.5px;color:#0f172a;}",
      ".lt-panel h3{margin:0 0 10px;font-size:15px;}",
      ".lt-hd{background:linear-gradient(135deg,#F59E0B,#2563EB);color:#fff;margin:-16px -16px 12px;padding:12px 16px;border-radius:14px 14px 0 0;font-weight:700;}",
      ".lt-kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px;}",
      ".lt-kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:8px 10px;}",
      ".lt-kpi b{display:block;font-size:18px;color:#2563EB;}",
      ".lt-kpi span{font-size:11.5px;color:#64748b;}",
      ".lt-bar{height:8px;background:#e2e8f0;border-radius:5px;overflow:hidden;margin:6px 0 12px;}",
      ".lt-bar i{display:block;height:100%;background:#2563EB;}",
      ".lt-row{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;}",
      ".lt-row button{flex:1;min-width:96px;padding:9px;border:none;border-radius:8px;cursor:pointer;font-size:12.5px;}",
      ".lt-b1{background:#2563EB;color:#fff;}",
      ".lt-b2{background:#e2e8f0;color:#334155;}",
      ".lt-b3{background:#FEF2F2;color:#B91C1C;}",
      ".lt-note{font-size:11.5px;color:#64748b;line-height:1.6;margin-top:10px;}",
      ".lt-list{font-size:12px;color:#475569;max-height:150px;overflow-y:auto;border-top:1px solid #e2e8f0;padding-top:8px;}",
      ".lt-list div{padding:2px 0;}"
    ].join("");
    document.head.appendChild(st);

    var fab = document.createElement("button");
    fab.className = "lt-fab"; fab.type = "button"; fab.textContent = "学情";
    fab.title = "我的学习档案";
    fab.setAttribute("aria-label", "我的学习档案");

    var panel = document.createElement("div");
    panel.className = "lt-panel";
    panel.id = "lt-panel";

    fab.addEventListener("click", function () {
      var show = panel.style.display !== "block";
      panel.style.display = show ? "block" : "none";
      if (show) render();
    });

    document.body.appendChild(fab);
    document.body.appendChild(panel);
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function render() {
    var p = document.getElementById("lt-panel");
    if (!p) return;
    var s = summary();
    var TOTAL = 32;
    var pct = Math.min(100, Math.round((s.lessonsVisited / TOTAL) * 100));
    var recent = log.slice(-8).reverse().map(function (e) {
      var d = new Date(e.t);
      var who = e.lesson > 0 ? ("第 " + e.lesson + " 次课") : "首页";
      var what = { visit: "打开页面", dwell: "停留 " + fmtMs((e.data && e.data.ms) || 0), demo: "跑了演示",
        quiz: "自测自评 " + ((e.data && e.data.correct) || 0) + "/" + ((e.data && e.data.total) || 0),
        ask: "问了 AI 助教", hw: "查看作业", video: "看了视频" }[e.type] || e.type;
      return "<div>" + d.toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) +
        "　" + who + "　" + esc(what) + "</div>";
    }).join("");

    p.innerHTML =
      '<div class="lt-hd">我的学习档案</div>' +
      '<div class="lt-kpis">' +
        '<div class="lt-kpi"><b>' + s.lessonsVisited + " / " + TOTAL + "</b><span>已学课时</span></div>" +
        '<div class="lt-kpi"><b>' + fmtMs(s.totalDwellMs) + "</b><span>累计停留</span></div>" +
        '<div class="lt-kpi"><b>' + (s.quizAvg === null ? "—" : s.quizAvg) + "</b><span>自测平均对（题）</span></div>" +
        '<div class="lt-kpi"><b>' + s.askCount + "</b><span>问过 AI 助教</span></div>" +
      "</div>" +
      '<div class="lt-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="lt-note">还跑了 <b>' + s.demoRuns + "</b> 次演示，展开作业 <b>" + s.hwOpened + "</b> 次。</div>" +
      '<div class="lt-note"><b>姓名/学号（可空）</b><br><input id="lt-name" type="text" value="' + esc(s.name) +
        '" placeholder="交给老师时才需要填" style="width:100%;padding:7px;border:1px solid #cbd5e1;border-radius:8px;margin-top:4px"></div>' +
      '<div class="lt-row">' +
        '<button class="lt-b1" id="lt-exp" type="button">导出档案（交作业）</button>' +
        '<button class="lt-b2" id="lt-rep" type="button">立即上报</button>' +
        '<button class="lt-b3" id="lt-clr" type="button">清空本机记录</button>' +
      "</div>" +
      '<div class="lt-list" style="margin-top:12px"><b style="font-size:11.5px;color:#64748b">最近记录</b>' + recent + "</div>" +
      '<div class="lt-note">数据只存在你自己的浏览器里，不上传任何人。' +
      (endpoint() ? "已配置上报端点，点「立即上报」会把汇总结果匿名发出。" : "老师未配置上报端点，当前为纯本地模式（断网也能记）。") +
      "</div>";

    var nm = p.querySelector("#lt-name");
    nm.addEventListener("change", function () { sset(K_NAME, nm.value.trim()); });
    p.querySelector("#lt-exp").addEventListener("click", exportJSON);
    p.querySelector("#lt-rep").addEventListener("click", function () {
      if (!canReport()) { alert("老师还没有配置上报端点，当前是纯本地模式。\n请用「导出档案」把文件交给老师。"); return; }
      report(); alert("已上报（匿名，仅汇总指标）。");
    });
    p.querySelector("#lt-clr").addEventListener("click", function () {
      if (!confirm("确定清空本机学习记录？此操作不可恢复。")) return;
      try { localStorage.removeItem(K_LOG); } catch (e) {}
      log = []; render();
    });
  }

  /* ---------- 自动采集（事件委托，不改动课时页） ---------- */
  var t0 = Date.now();
  function bindAuto() {
    /* 进入课时 */
    track("visit", { path: location.pathname.split("/").pop() });

    /* 停留时长：页面隐藏 / 关闭时结算 */
    function flushDwell() {
      var ms = Date.now() - t0;
      if (ms > 3000) track("dwell", { ms: ms });   // <3 秒不算有效学习
      t0 = Date.now();
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) flushDwell(); });
    window.addEventListener("pagehide", flushDwell);
    window.addEventListener("beforeunload", flushDwell);

    /* 演示按钮、自测「查看答案」、作业展开 —— 全部事件委托 */
    document.addEventListener("click", function (ev) {
      var el = ev.target;
      if (!el || !el.closest) return;
      if (el.closest(".demo")) track("demo", { id: (el.closest(".demo") || {}).id || "" });
      else if (el.classList.contains("quiz__reveal")) track("quiz", { opened: true });
      else if (el.classList.contains("fold__hd")) track("hw", {});
    }, true);

    /* 视频进入视野（懒加载触发即算看过） */
    try {
      var fr = document.querySelector(".video-embed iframe");
      if (fr && "IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { track("video", {}); io.disconnect(); } });
        });
        io.observe(fr);
      }
    } catch (e) {}

    /* 自测自评：动态插到 .quiz 末尾（零改动 32 个页面） */
    try {
      var q = document.querySelector(".quiz");
      if (q && !q.querySelector(".lt-self")) {
        var box = document.createElement("div");
        box.className = "lt-self";
        box.style.cssText = "margin-top:12px;padding:10px;border:1px dashed #cbd5e1;border-radius:10px;font-size:12.5px;color:#475569";
        box.innerHTML = "<b>自测自评（只记在本机，不计分）</b><br>这节题我大概对了" +
          '<select id="lt-sc" style="margin:6px 6px 0 4px;padding:4px 8px;border:1px solid #cbd5e1;border-radius:6px">' +
          "<option value=''>选一下</option><option>0</option><option>1</option><option>2</option><option>3</option>" +
          "<option>4</option><option>5</option><option>6</option></select> 题　" +
          '<button type="button" id="lt-scb" style="padding:5px 12px;border:none;border-radius:6px;background:#2563EB;color:#fff;cursor:pointer">记一下</button>' +
          '<span id="lt-sct" style="margin-left:8px;color:#059669"></span>';
        q.appendChild(box);
        box.querySelector("#lt-scb").addEventListener("click", function () {
          var v = box.querySelector("#lt-sc").value;
          if (v === "") { box.querySelector("#lt-sct").textContent = "先选个数字"; return; }
          track("quiz", { correct: parseInt(v, 10), total: 6, self: true });
          box.querySelector("#lt-sct").textContent = "已记录：对了 " + v + " 题";
        });
      }
    } catch (e) {}

    /* 离开页面时顺带上报一次（若配置了端点） */
    window.addEventListener("pagehide", function () { flushDwell(); report(); });
  }

  function init() {
    try {
      sid();
      buildUI();
      bindAuto();
    } catch (e) { /* 任何异常都静默，不影响浏览 */ }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* 暴露给 AI 助教：学生提问时记一笔 */
  window.LT = { track: track, summary: summary, sid: sid };
})();
