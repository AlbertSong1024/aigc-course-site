/* ==========================================================================
   analytics.js —— 全站真实访客统计（不蒜子 busuanzi，可关闭）
   --------------------------------------------------------------------------
   为什么单独一个文件：
     本站核心卖点是「零 CDN / 断网可用」。外部统计是**唯一的可选项**，
     所以必须与主逻辑彻底隔离——没启用就一个字节都不发出去，
     绝不因为第三方挂了拖慢或拖垮课程页面。

   为什么用不蒜子：
     免费、不用注册、不用后端，纯静态站插一段脚本就能显示
     「累计访问次数（PV）」和「访客人数（UV）」。

   启用办法（默认已开，老师可关）：
     · 关掉：把下面 CONFIG.enabled 改成 false
     · 也可控制台临时关： localStorage.setItem('an_cfg_v1','{"enabled":false}')
     · domains 用来限制只在正式域名统计，避免本地预览污染线上数据

   怎么看数据：
     页面上的 span 会被不蒜子自动填数字：
       #busuanzi_value_site_pv  全站累计访问次数
       #busuanzi_value_site_uv  全站访客人数（按独立访客去重，就是「多少人访问过」）
       #busuanzi_value_page_pv  本页访问次数
     本站只在首页显示前两项。

   降级：脚本加载失败 / 断网 / 不在白名单 → 统计区保持隐藏，页面照常用。
     不蒜子不提供自定义事件（课时浏览、搜索等），所以 AN.events 是空实现，
     只为兼容 learning-tracker.js 的调用，不会报错。

   隐私提醒：不蒜子是第三方服务，会记录访客 IP 用于 UV 去重。
     若学校对第三方统计有要求，把 enabled 设为 false 即可完全关闭。
   ========================================================================== */
(function () {
  "use strict";

  /* ===================== 配置位（老师可改这里） ===================== */
  var CONFIG = {
    /* 总开关：false = 完全不加载、不联网 */
    enabled: true,
    /* 不蒜子脚本地址（官方） */
    scriptUrl: "//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js",
    /* 只在这些域名统计，留空 = 不限制。
       填了之后，本地 file:// 或 127.0.0.1 预览不会污染线上数据。 */
    domains: "albertsong1024.github.io"
  };
  /* ============================================================== */

  var LS_CFG = "an_cfg_v1";

  function sget(k) { try { return window.localStorage ? localStorage.getItem(k) : null; } catch (e) { return null; } }

  /* 允许老师不发版就改配置：控制台执行
       localStorage.setItem('an_cfg_v1', JSON.stringify({enabled:false}))  // 关闭
       localStorage.removeItem('an_cfg_v1')                                 // 恢复默认
     再刷新。 */
  function cfg() {
    var raw = sget(LS_CFG);
    if (raw) {
      try {
        var o = JSON.parse(raw);
        return {
          enabled: o.enabled !== false,
          scriptUrl: o.scriptUrl || CONFIG.scriptUrl,
          domains: o.domains != null ? o.domains : CONFIG.domains
        };
      } catch (e) {}
    }
    return CONFIG;
  }

  function enabled() {
    var c = cfg();
    if (!c.enabled || !c.scriptUrl) return false;
    /* 域名白名单 */
    if (c.domains) {
      var ok = String(c.domains).split(",").some(function (d) {
        return location.hostname === d.trim();
      });
      if (!ok) return false;
    }
    return true;
  }

  /* ---------- 显示统计区（本来 hidden，加载成功才显示） ---------- */
  function reveal() {
    try {
      var box = document.getElementById("busuanzi-box");
      if (box) box.hidden = false;
    } catch (e) {}
  }

  /* ---------- 载入不蒜子 ---------- */
  function load() {
    if (!enabled()) return;                       // 未启用：零网络请求
    /* 页面里没有任何统计位就没必要加载 */
    if (!document.getElementById("busuanzi_value_site_pv") &&
        !document.getElementById("busuanzi_value_page_pv")) return;
    if (document.querySelector("script[data-bsz]")) return;   // 避免重复注入

    try {
      var s = document.createElement("script");
      s.src = cfg().scriptUrl;
      s.async = true;
      s.setAttribute("data-bsz", "1");
      s.onload = function () {
        /* 不蒜子脚本会自己找 span 填数；填完再把隐藏的统计区显示出来 */
        setTimeout(reveal, 300);
      };
      s.onerror = function () { /* 加载失败：统计区保持隐藏，静默 */ };
      document.head.appendChild(s);
    } catch (e) {}
  }

  /* ---------- 兼容接口：不蒜子不支持自定义事件，空实现即可 ----------
     learning-tracker.js 会调 AN.events.*，这里保留同名函数避免报错。 */
  function noop() {}
  var EVENTS = {
    lessonView: noop, search: noop, askTutor: noop, demoRun: noop,
    quizReveal: noop, hwOpen: noop, videoPlay: noop,
    exportArchive: noop, lessonDone: noop, progressOpen: noop
  };

  function init() {
    try {
      load();
    } catch (e) {}
  }

  window.AN = {
    events: EVENTS,
    enabled: enabled,
    reload: init
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
