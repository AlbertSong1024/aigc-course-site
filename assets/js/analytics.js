/* ==========================================================================
   analytics.js —— 全站真实访客统计（Umami，可选启用）
   --------------------------------------------------------------------------
   为什么单独一个文件：
     本站核心卖点是「零 CDN / 断网可用」。外部统计是**唯一的可选项**，
     所以必须与主逻辑彻底隔离——没配置就一个字节都不发出去，
     绝不因为第三方挂了拖慢或拖垮课程页面。

   启用办法（两步，老师自己做）：
     1. 去 https://umami.is 注册（官方云免费版够用），或自托管 Umami
     2. 在下面 CONFIG 里填两个值（第 30 行附近）：
          scriptUrl : 你的 umami.js 地址，如 https://cloud.umami.is/script.js
          websiteId : Umami 后台「网站」里那串 UUID
     填完刷新即生效。**留空 = 完全静默，不联网。**

   不想改代码也能临时启用/关闭（控制台执行，立即生效）：
       localStorage.setItem('an_cfg_v1', JSON.stringify({
         scriptUrl:"https://cloud.umami.is/script.js",
         websiteId:"你的-UUID"
       }))
     清除： localStorage.removeItem('an_cfg_v1')

   怎么看数据：登录 Umami 后台看真实 PV / UV（独立访客数）/ 各课热度 / 来源 / 设备。
     注意「UV」就是你要的「多少人访问过」——Umami 按匿名访客去重，不是按设备计数。
     本页面只负责上报，不负责展示；展示请到 Umami 后台。

   与 learning-tracker.js 的区别（两套口径，别混算）：
     · 本文件（外部统计）：全站真实访客 —— 含没交档案的匿名访问者，
       能看到 PV/UV/来源/设备/地区。但看不到「停留时长」细节。
     · learning-tracker.js（本地学情）：只有交了档案的学生，
       能看到停留时长、自测、提问明细。数据不出学生电脑。
     两者相加没有意义，各有各的用途。

   隐私：Umami 默认不写 Cookie、不采集个人身份信息，符合常见隐私合规要求。
   本文件额外调用 identify() 时**只发随机匿名 ID**，不含姓名学号。
   ========================================================================== */
(function () {
  "use strict";

  /* ===================== 配置位（老师填这里） ===================== */
  var CONFIG = {
    /* 例： "https://cloud.umami.is/script.js"  留空则不启用 */
    scriptUrl: "",
    /* 例： "94db1cb1-74f4-4a40-ad6c-962362670409" */
    websiteId: "",
    /* 只在正式站点统计，避免本地预览污染数据（留空 = 不限制） */
    domains: "",
    /* 自定义事件开关：课时浏览/搜索/提问/演示/标记已学 */
    trackEvents: true
  };
  /* ============================================================== */

  var LS_CFG = "an_cfg_v1";

  function sget(k) { try { return window.localStorage ? localStorage.getItem(k) : null; } catch (e) { return null; } }

  /* 允许老师不发版就改配置：控制台执行
       localStorage.setItem('an_cfg_v1', JSON.stringify({scriptUrl:"...",websiteId:"..."}))
     再刷新。方便临时切换或紧急关闭。 */
  function cfg() {
    var raw = sget(LS_CFG);
    if (raw) {
      try {
        var o = JSON.parse(raw);
        return {
          scriptUrl: o.scriptUrl || "",
          websiteId: o.websiteId || "",
          domains: o.domains != null ? o.domains : CONFIG.domains,
          trackEvents: o.trackEvents !== false
        };
      } catch (e) {}
    }
    return CONFIG;
  }

  function enabled() {
    var c = cfg();
    return !!(c.scriptUrl && c.websiteId);
  }

  /* ---------- 载入 Umami 脚本 ---------- */
  function load() {
    var c = cfg();
    if (!enabled()) return;                      // 未配置：直接返回，零网络请求

    /* 域名白名单：不在名单里就不统计（本地预览不会污染线上数据） */
    if (c.domains) {
      var ok = String(c.domains).split(",").some(function (d) {
        return location.hostname === d.trim();
      });
      if (!ok) return;
    }

    /* 避免重复注入 */
    if (document.querySelector("script[data-website-id]")) return;

    try {
      var s = document.createElement("script");
      s.src = c.scriptUrl;
      s.defer = true;
      s.setAttribute("data-website-id", c.websiteId);
      /* 关键：关闭自动上报，改由本站自己在合适的时机发—— */
      /* 我们需要给事件带上「第几次课」，自动 PV 带不了这个维度。 */
      s.setAttribute("data-auto-track", "false");
      s.setAttribute("data-do-not-track", "true");   // 尊重浏览器 DNT
      s.onerror = function () { /* 加载失败静默，不影响课程站点 */ };
      document.head.appendChild(s);
    } catch (e) {}
  }

  /* ---------- 上报封装：Umami 没就绪就静默丢弃 ---------- */
  function ready() {
    return !!(window.umami && typeof window.umami.track === "function");
  }

  function ev(name, data) {
    if (!enabled() || !cfg().trackEvents) return;
    try {
      if (!ready()) return;
      if (data) window.umami.track(name, data);
      else window.umami.track(name);
    } catch (e) {}
  }

  /* 页面浏览：手动发，带上课次维度，比自动 PV 更有用 */
  function pageview() {
    if (!enabled()) return;
    try {
      if (!ready()) return;
      var no = parseInt((document.body && document.body.getAttribute("data-lesson")) || "0", 10);
      var isIndex = !document.body.getAttribute("data-lesson");
      window.umami.track(function (props) {
        var out = { website: props.website, url: props.url, title: props.title, referrer: props.referrer,
          hostname: props.hostname, language: props.language, screen: props.screen };
        out.name = "pageview";
        out.data = { lesson: isIndex ? "home" : String(no) };
        return out;
      });
    } catch (e) {}
  }

  /* 匿名身份：让老师能看出「同一个人看了几课」，但认不出是谁 */
  function identify() {
    if (!enabled()) return;
    try {
      if (window.umami && typeof window.umami.identify === "function") {
        var sid = sget("lt_sid_v1");                 // 复用学情的随机 ID（本就匿名）
        if (sid) window.umami.identify(sid);
      }
    } catch (e) {}
  }

  /* 站点自定义事件 —— 与 learning-tracker 的采集点一一对应，
     但走线上统计，用来回答「全站范围内，大家卡在哪个环节」。 */
  var EVENTS = {
    lessonView: function (no, title) { ev("课时浏览", { lesson: String(no || 0), title: String(title || "").slice(0, 60) }); },
    search: function (kw, hit) { ev("站内搜索", { kw: String(kw || "").slice(0, 50), hit: hit ? "命中" : "未命中" }); },
    askTutor: function (mode, q) { ev("AI 助教提问", { mode: mode || "offline", q: String(q || "").slice(0, 50) }); },
    demoRun: function (id) { ev("演示交互", { demo: String(id || "") }); },
    quizReveal: function (no) { ev("自测查看答案", { lesson: String(no || 0) }); },
    hwOpen: function (no) { ev("展开作业", { lesson: String(no || 0) }); },
    videoPlay: function (no) { ev("观看视频", { lesson: String(no || 0) }); },
    exportArchive: function () { ev("导出学情档案"); },
    lessonDone: function (no) { ev("标记已学", { lesson: String(no || 0) }); },
    progressOpen: function () { ev("打开学习中心"); }
  };

  /* ---------- 自动挂载 ---------- */
  function init() {
    try {
      load();
      if (!enabled()) return;
      /* Umami 是 defer 加载，可能比本站脚本晚就绪：轮询几次再发首屏 PV */
      var tries = 0;
      (function wait() {
        if (ready()) { identify(); pageview(); return; }
        if (++tries > 40) return;                  // 最多等 ~10 秒，等不到就算了
        setTimeout(wait, 250);
      })();
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* 暴露给其它模块与老师调试 */
  window.AN = {
    events: EVENTS,
    enabled: enabled,
    config: cfg,
    setConfig: function (o) { try { localStorage.setItem(LS_CFG, JSON.stringify(o || {})); } catch (e) {} },
    clearConfig: function () { try { localStorage.removeItem(LS_CFG); } catch (e) {} },
    pageview: pageview
  };
})();
