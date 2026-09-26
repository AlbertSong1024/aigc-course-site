/* ==========================================================================
   ai-tutor.js —— 《AIGC应用与实践》课程 AI 助教（浮窗）
   --------------------------------------------------------------------------
   设计原则（与本站「断网可用 / 零 CDN」一致）：
     · 纯前端、无外部依赖；自带样式，不污染 site.css
     · 由 site.js 动态注入，无需改动 26 个课时页
     · 两种模式：
       1) LLM 模式：学生填自己的 API Key（DeepSeek / 通义千问 / 自定义 OpenAI 兼容），
          基于「当前课时正文」做 RAG 后回答；Key 只存本机 localStorage
       2) 离线模式：无 Key 或断网时，用 search-index.js 做关键词匹配，
          返回「去第 N 课某一节」的链接，保证断网也能用
     · 全程 try/catch 防御：在 jsdom 冒烟环境下绝不抛错
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 安全存储（兼容无 localStorage 的环境，如冒烟测试） ---------- */
  function storeGet(k) { try { return window.localStorage ? localStorage.getItem(k) : null; } catch (e) { return null; } }
  function storeSet(k, v) { try { if (window.localStorage) localStorage.setItem(k, v); } catch (e) {} }
  function storeDel(k) { try { if (window.localStorage) localStorage.removeItem(k); } catch (e) {} }

  /* ---------- 服务商配置（OpenAI 兼容协议） ---------- */
  var PROVIDERS = {
    deepseek: {
      name: "DeepSeek",
      url: "https://api.deepseek.com/chat/completions",
      model: "deepseek-chat",
      doc: "https://platform.deepseek.com/"
    },
    qwen: {
      name: "通义千问",
      url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
      model: "qwen-plus",
      doc: "https://help.aliyun.com/zh/model-studio/"
    },
    custom: { name: "自定义 OpenAI 兼容", url: "", model: "", doc: "" }
  };

  var CFG_KEY = "at_cfg_v1";
  function loadCfg() {
    try { return JSON.parse(storeGet(CFG_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveCfg(c) { storeSet(CFG_KEY, JSON.stringify(c)); }

  /* ---------- 课程上下文 ---------- */
  function root() { return (document.body && document.body.getAttribute("data-root")) || "./"; }
  function curNo() { return parseInt((document.body && document.body.getAttribute("data-lesson")) || "0", 10); }
  function flatMap() { return (window.COURSE_MAP && window.COURSE_MAP.flat) ? window.COURSE_MAP.flat() : []; }
  function curLesson() {
    var n = curNo(), f = flatMap();
    for (var i = 0; i < f.length; i++) if (f[i].no === n) return f[i];
    return null;
  }
  function lessonFile(no) {
    var f = flatMap();
    for (var i = 0; i < f.length; i++) if (f[i].no === n) return f[i].file;
    return null;
  }

  /* ---------- 取当前课时正文（RAG 素材） ---------- */
  function lessonContext() {
    var main = document.getElementById("main");
    var txt = main ? (main.innerText || main.textContent || "") : "";
    txt = txt.replace(/\s+/g, " ").trim();
    if (txt.length > 8000) txt = txt.slice(0, 8000) + " …（已截断，完整内容请在本页阅读）";
    var c = curLesson();
    var head = c ? ("课程：AIGC应用与实践。当前是第 " + c.no + " 次课《" + c.title + "》" +
      (c.subtitle ? "（" + c.subtitle + "）" : "") + "。") : "课程：AIGC应用与实践。";
    return head + "\n\n【当前课时正文】\n" + txt;
  }

  /* ---------- 离线关键词匹配（search-index.js） ---------- */
  function offlineSearch(q) {
    var idx = window.SITE_SECTION_INDEX || [];
    if (!idx.length) return [];
    var toks = (q.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, " ").match(/[\u4e00-\u9fa5]+|[a-zA-Z0-9]+/g) || [])
      .filter(function (t) { return t.length > 1; });
    if (!toks.length) return [];
    var out = idx.map(function (e) {
      var title = (e.title || "").toLowerCase();
      var hint = (e.hint || "").toLowerCase();
      var hay = title + " " + hint + " 第" + e.lesson + "课";
      var s = 0;
      toks.forEach(function (t) {
        t = t.toLowerCase();
        if (title.indexOf(t) >= 0) s += 3;
        else if (hint.indexOf(t) >= 0) s += 1;
      });
      return { e: e, s: s };
    }).filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 4)
      .map(function (x) { return x.e; });
    return out;
  }

  function sectionLink(e) {
    var file = lessonFile(e.lesson);
    if (!file) return null;
    return root() + file + "#" + e.id;
  }

  /* ---------- DOM 构建 ---------- */
  var el = {};
  function buildUI() {
    var style = document.createElement("style");
    style.textContent = [
      ".at-fab{position:fixed;right:22px;bottom:22px;z-index:9999;width:54px;height:54px;border:none;border-radius:50%;",
      "background:#2563EB;color:#fff;font-size:20px;cursor:pointer;box-shadow:0 6px 18px rgba(37,99,235,.35);}",
      ".at-fab:hover{background:#1d4ed8;}",
      ".at-ov{position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:9998;display:none;}",
      ".at-ov.show{display:block;}",
      ".at-panel{position:fixed;right:18px;bottom:18px;z-index:10000;width:380px;max-width:calc(100vw - 24px);",
      "height:580px;max-height:calc(100vh - 36px);background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(15,23,42,.3);",
      "display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,'Segoe UI','Microsoft YaHei',sans-serif;color:#0f172a;}",
      ".at-head{background:linear-gradient(135deg,#2563EB,#F59E0B);color:#fff;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;}",
      ".at-head b{font-size:15px;}",
      ".at-head .at-gear{background:rgba(255,255,255,.2);border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:15px;}",
      ".at-msgs{flex:1;overflow-y:auto;padding:14px;background:#f8fafc;}",
      ".at-msg{margin-bottom:12px;max-width:90%;padding:9px 12px;border-radius:12px;line-height:1.6;font-size:13.5px;white-space:pre-wrap;word-break:break-word;}",
      ".at-msg.u{margin-left:auto;background:#2563EB;color:#fff;border-bottom-right-radius:4px;}",
      ".at-msg.a{margin-right:auto;background:#fff;border:1px solid #e2e8f0;border-bottom-left-radius:4px;}",
      ".at-msg.a a{color:#2563EB;}",
      ".at-chips{display:flex;flex-wrap:wrap;gap:6px;padding:8px 10px;border-top:1px solid #e2e8f0;background:#fff;}",
      ".at-chip{font-size:12px;border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:14px;padding:5px 10px;cursor:pointer;}",
      ".at-chip:hover{background:#eff6ff;border-color:#2563EB;color:#2563EB;}",
      ".at-in{display:flex;border-top:1px solid #e2e8f0;}",
      ".at-in textarea{flex:1;border:none;resize:none;padding:11px;font-size:13.5px;font-family:inherit;outline:none;max-height:90px;}",
      ".at-in button{width:64px;border:none;background:#2563EB;color:#fff;cursor:pointer;font-size:14px;}",
      ".at-in button:disabled{background:#94a3b8;}",
      ".at-priv{font-size:11px;color:#64748b;padding:4px 12px 8px;text-align:center;background:#fff;}",
      ".at-setmask{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:10001;display:none;align-items:center;justify-content:center;}",
      ".at-setmask.show{display:flex;}",
      ".at-set{width:340px;background:#fff;border-radius:14px;padding:18px;font-size:13.5px;color:#0f172a;}",
      ".at-set h3{margin:0 0 10px;font-size:15px;}",
      ".at-set label{display:block;margin:10px 0 4px;font-weight:600;}",
      ".at-set select,.at-set input{width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;box-sizing:border-box;}",
      ".at-set .at-hint{font-size:11.5px;color:#64748b;margin-top:6px;line-height:1.5;}",
      ".at-set .at-rows{display:flex;gap:8px;margin-top:14px;}",
      ".at-set .at-rows button{flex:1;padding:9px;border:none;border-radius:8px;cursor:pointer;font-size:13px;}",
      ".at-save{background:#2563EB;color:#fff;}",
      ".at-cancel{background:#e2e8f0;color:#334155;}",
      ".at-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#94a3b8;margin-right:5px;}",
      ".at-dot.on{background:#22c55e;}"
    ].join("");
    document.head.appendChild(style);

    var ov = document.createElement("div"); ov.className = "at-ov"; ov.id = "at-ov";
    var fab = document.createElement("button");
    fab.className = "at-fab"; fab.id = "at-fab"; fab.type = "button"; fab.textContent = "AI";
    fab.title = "课程 AI 助教"; fab.setAttribute("aria-label", "课程 AI 助教");

    var panel = document.createElement("div"); panel.className = "at-panel"; panel.id = "at-panel"; panel.style.display = "none";
    panel.innerHTML =
      '<div class="at-head"><b>课程 AI 助教</b>' +
      '<button class="at-gear" id="at-gear" type="button" title="设置">⚙</button></div>' +
      '<div class="at-msgs" id="at-msgs"></div>' +
      '<div class="at-chips" id="at-chips"></div>' +
      '<div class="at-priv">你的 Key 只存本机浏览器；对话只发往你选的服务商，不经任何中间服务器。AI 可能出错，以课程资料和老师为准。</div>' +
      '<div class="at-in"><textarea id="at-input" rows="2" placeholder="问点什么，或贴上你卡住的步骤 / 报错…"></textarea>' +
      '<button id="at-send" type="button">发送</button></div>';

    var setmask = document.createElement("div"); setmask.className = "at-setmask"; setmask.id = "at-setmask";
    setmask.innerHTML =
      '<div class="at-set"><h3>AI 助教设置</h3>' +
      '<label>服务商</label><select id="at-prov">' +
      '<option value="deepseek">DeepSeek</option>' +
      '<option value="qwen">通义千问</option>' +
      '<option value="custom">自定义 OpenAI 兼容</option></select>' +
      '<label>API Key</label><input id="at-key" type="password" placeholder="粘贴你自己的 Key，不会上传给任何人" autocomplete="off">' +
      '<div id="at-custom-box" style="display:none">' +
      '<label>接口地址（自定义）</label><input id="at-curl" type="text" placeholder="https://你的-base-url/chat/completions">' +
      '<label>模型名（自定义）</label><input id="at-cmodel" type="text" placeholder="model-id"></div>' +
      '<div class="at-hint" id="at-sethint"></div>' +
      '<div class="at-rows"><button class="at-cancel" id="at-cset" type="button">取消</button>' +
      '<button class="at-save" id="at-ssave" type="button">保存</button></div></div>';

    document.body.appendChild(ov);
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    document.body.appendChild(setmask);

    el = { ov: ov, fab: fab, panel: panel, msgs: panel.querySelector("#at-msgs"),
      chips: panel.querySelector("#at-chips"), input: panel.querySelector("#at-input"),
      send: panel.querySelector("#at-send"), gear: panel.querySelector("#at-gear"),
      setmask: setmask, prov: setmask.querySelector("#at-prov"), key: setmask.querySelector("#at-key"),
      curl: setmask.querySelector("#at-curl"), cmodel: setmask.querySelector("#at-cmodel"),
      customBox: setmask.querySelector("#at-custom-box"), sethint: setmask.querySelector("#at-sethint"),
      cset: setmask.querySelector("#at-cset"), ssave: setmask.querySelector("#at-ssave") };

    bind();
    renderChips();
    greet();
  }

  function bind() {
    el.fab.addEventListener("click", function () { togglePanel(true); });
    el.ov.addEventListener("click", function () { togglePanel(false); });
    el.send.addEventListener("click", send);
    el.input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    });
    el.gear.addEventListener("click", openSettings);
    el.cset.addEventListener("click", function () { el.setmask.classList.remove("show"); });
    el.ssave.addEventListener("click", saveSettings);
    el.prov.addEventListener("change", function () {
      el.customBox.style.display = el.prov.value === "custom" ? "block" : "none";
    });
  }

  function togglePanel(show) {
    el.panel.style.display = show ? "flex" : "none";
    el.ov.classList.toggle("show", show);
    if (show) el.input.focus();
  }

  function renderChips() {
    var c = curLesson();
    var qs = c ? [
      "用一句话总结本课讲什么",
      "本课的实操我卡住了，怎么排查",
      "帮我解释本课最核心的一个概念",
      "下一课是什么、我要提前准备什么"
    ] : [
      "这门课一共多少课、怎么安排",
      "前 5 课（AI 原理）讲什么",
      "找工作模块（24–26 课）能帮我做什么",
      "我没填 API Key，也能用吗"
    ];
    el.chips.innerHTML = "";
    qs.forEach(function (q) {
      var b = document.createElement("button");
      b.className = "at-chip"; b.type = "button"; b.textContent = q;
      b.addEventListener("click", function () { ask(q); });
      el.chips.appendChild(b);
    });
  }

  function greet() {
    var c = curLesson();
    var txt = c
      ? ("我是本课程的 AI 助教。" + (hasKey() ? "已检测到你的 API Key，我会基于《" + c.title + "》的正文回答你的问题。" : "你还没填 API Key，我先以「离线导览」模式帮你——用关键词匹配到对应章节的链接。") + "\n想问什么直接说；卡在实操步骤，把那一步贴给我也行。")
      : "我是本课程的 AI 助教。当前在首页，我可以帮你了解课程安排，或带你跳到具体章节。填了 API Key 后能基于课时正文详细解答。";
    addMsg("a", txt);
  }

  function hasKey() {
    var cfg = loadCfg();
    return !!(cfg.provider && cfg.key) && (cfg.provider !== "custom" || (cfg.customUrl && cfg.customModel));
  }

  function addMsg(role, html) {
    var d = document.createElement("div");
    d.className = "at-msg " + role;
    d.innerHTML = html;
    el.msgs.appendChild(d);
    el.msgs.scrollTop = el.msgs.scrollHeight;
    return d;
  }
  function escHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function linkHtml(e) {
    var href = sectionLink(e);
    if (!href) return "第 " + e.lesson + " 课";
    return '<a href="' + href + '" target="_blank" rel="noopener">第 ' + e.lesson + ' 课 · ' + escHtml(e.title) + "</a>";
  }

  /* ---------- 离线回答 ---------- */
  function offlineReply(q) {
    var hits = offlineSearch(q);
    if (!hits.length) {
      return "离线模式下我只能按关键词定位章节。你可以换个说法，或直接点下面的快捷问题；" +
        "也可以到「设置」里填一个自己的 API Key，我就能基于课时正文详细解答了。";
    }
    var lines = hits.map(function (e) { return "· " + linkHtml(e); });
    return "我按关键词找到这些相关章节（点开直达）：\n" + lines.join("\n") +
      "\n\n想让我基于正文细讲，去「设置」填你的 API Key 即可开启联网解答。";
  }

  /* ---------- LLM 调用 ---------- */
  function callLLM(messages, onDone, onErr) {
    var cfg = loadCfg();
    var p = PROVIDERS[cfg.provider];
    if (!p) return onErr("未选择服务商");
    var url = cfg.provider === "custom" ? cfg.customUrl : p.url;
    var model = cfg.provider === "custom" ? cfg.customModel : p.model;
    if (!url || !model) return onErr("接口地址或模型名为空");
    if (typeof fetch === "undefined") return onErr("当前环境不支持联网调用");

    var body = JSON.stringify({ model: model, messages: messages, temperature: 0.3, stream: false });
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + cfg.key },
      body: body
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error("HTTP " + r.status + " " + t.slice(0, 120)); });
      return r.json();
    }).then(function (j) {
      var c = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      onDone(c || "（模型返回为空）");
    }).catch(function (e) {
      onErr("调用失败：" + (e && e.message ? e.message : e) +
        "。常见原因：Key 无效、服务商不允许浏览器跨域（CORS）、或网络不通。可改用本地预览服务打开本站，或先用离线导览。");
    });
  }

  function systemPrompt() {
    return "你是《AIGC应用与实践》课程的 AI 助教，面向高职人工智能专业学生，讲解风格口语化、简短（一次不超过 6 句话）。" +
      "规则：1) 只依据下面提供的「课程资料」回答；资料里没有的，明确说「这个课程资料里没写」，并给出合理的自学建议，绝不编造。" +
      "2) 学生卡在实操时，先帮他定位到具体步骤，再给排查思路，不直接代写答案。3) 可引导学生去看具体第几课哪一节。" +
      "4) 用中文回答。";
  }

  /* ---------- 发送 ---------- */
  var history = [];
  function ask(text) {
    text = (text || "").trim();
    if (!text) return;
    addMsg("u", escHtml(text));
    el.input.value = "";
    el.send.disabled = true;
    var thinking = addMsg("a", '<span class="at-dot"></span>思考中…');

    if (!hasKey()) {
      setTimeout(function () {
        thinking.innerHTML = escHtml(offlineReply(text));
        el.send.disabled = false;
      }, 120);
      return;
    }

    var ctx = lessonContext();
    var msgs = [
      { role: "system", content: systemPrompt() + "\n\n【课程资料】\n" + ctx }
    ];
    history.slice(-8).forEach(function (m) { msgs.push(m); });
    msgs.push({ role: "user", content: text });

    callLLM(msgs, function (ans) {
      thinking.innerHTML = escHtml(ans);
      history.push({ role: "user", content: text });
      history.push({ role: "assistant", content: ans });
      el.send.disabled = false;
    }, function (err) {
      thinking.innerHTML = escHtml(err);
      el.send.disabled = false;
    });
  }
  function send() { ask(el.input.value); }

  /* ---------- 设置 ---------- */
  function openSettings() {
    var cfg = loadCfg();
    el.prov.value = cfg.provider || "deepseek";
    el.key.value = cfg.key || "";
    el.curl.value = cfg.customUrl || "";
    el.cmodel.value = cfg.customModel || "";
    el.customBox.style.display = el.prov.value === "custom" ? "block" : "none";
    var p = PROVIDERS[el.prov.value];
    el.sethint.innerHTML = "填你自己的 Key 即可开启联网解答（基于当前课时正文）。" +
      (p && p.doc ? ' 申请入口：<a href="' + p.doc + '" target="_blank" rel="noopener">' + p.name + " 官网</a>。" : "") +
      " Key 只存在你本机浏览器，不会上传给任何中间服务器。";
    el.setmask.classList.add("show");
  }
  function saveSettings() {
    var cfg = loadCfg();
    cfg.provider = el.prov.value;
    cfg.key = el.key.value.trim();
    if (cfg.provider === "custom") {
      cfg.customUrl = el.curl.value.trim();
      cfg.customModel = el.cmodel.value.trim();
    }
    saveCfg(cfg);
    el.setmask.classList.remove("show");
    if (hasKey()) addMsg("a", "已保存，联网解答已开启。现在可以问我本课的任何问题了。");
    else addMsg("a", "已保存（未填 Key 或自定义地址不全）。我先以离线导览模式帮你，填全后自动切到联网解答。");
  }

  /* ---------- 入口（防御：任何异常静默，不干扰页面） ---------- */
  function init() {
    try {
      if (document.getElementById("at-root")) return;
      var wrap = document.createElement("div"); wrap.id = "at-root";
      document.body.appendChild(wrap);
      buildUI();
    } catch (e) { /* 冒烟/特殊环境：静默 */ }
  }

  if (document.readyState === "loading") {
    if (document.addEventListener) document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
