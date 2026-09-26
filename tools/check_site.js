#!/usr/bin/env node
/* ==========================================================================
   check_site.js —— 课程教程站质量校验（批量转化时的守门人）
   --------------------------------------------------------------------------
   用法（在 tutorial-site 目录下执行）：
     node tools/check_site.js                 # 校验全部已上线课时
     node tools/check_site.js 7               # 只校验第 7 次课
     node tools/check_site.js --quiet         # 只输出失败项

   检查项：
     A. 结构   —— course-map 里 status=ready 的课时，文件必须存在
     B. 契约   —— <body data-lesson> 与课次一致、data-root 正确、脚本标签齐全
     C. 锚点   —— 页内 #锚点 全部有对应 id；小节 id 唯一
     D. 索引   —— search-index.js 与页面小节 id 双向一致
     E. 语法   —— 每个内联 <script> 与 assets/js/*.js 过一遍语法检查
     F. 冒烟   —— jsdom 真跑：侧栏/目录/复制按钮/图表渲染；遍历点击所有 button、
                  拖动所有 range，全程不出现 JS 运行时错误
     G. 版式   —— 代码块必须有 data-lang；表格必须包在 .tablewrap 里
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM, VirtualConsole, requestInterceptor } = require("jsdom");

/* 冒烟环境只放行本地（file:）资源。页面允许放「需联网」的外部嵌入（如 B 站视频 iframe），
   但冒烟测试不访问外网：http(s) 子资源一律返回空内容，
   避免把外部站点的脚本错误（如播放器 JS 在 jsdom 里崩掉）算到本页面头上。（2026-09-26） */
const BLOCK_EXTERNAL = requestInterceptor((request) => {
  if (/^https?:/i.test(request.url)) {
    return new Response("", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  // file: 等本地请求照常放行
});

const ROOT = path.resolve(__dirname, "..");
const QUIET = process.argv.includes("--quiet");
const ONLY = parseInt(process.argv.filter((a) => /^\d+$/.test(a))[0] || "0", 10);

let fails = 0, warns = 0, oks = 0;
const log = (...a) => { if (!QUIET) console.log(...a); };
function ok(m) { oks++; log("  ✓ " + m); }
function warn(m) { warns++; console.log("  ! WARN " + m); }
function fail(m) { fails++; console.log("  ✗ FAIL " + m); }
function head(m) { console.log("\n" + m); }

/* ---------- 载入 course-map.js / search-index.js ---------- */
function loadData() {
  const sandbox = { window: {}, console };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  for (const f of ["assets/js/course-map.js", "assets/js/search-index.js"]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
  }
  const CM = sandbox.window.COURSE_MAP;
  CM.flat = CM.flat.bind(CM);
  return { CM, FLAT: CM.flat(), SECTIONS: sandbox.window.SITE_SECTION_INDEX || [] };
}

/* ---------- 提取页面内的脚本 ---------- */
function extractScripts(html) {
  // 先剥掉 HTML 注释：注释里出现的字面 <script> 会干扰匹配
  const clean = html.replace(/<!--[\s\S]*?-->/g, "");
  const out = [];
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(clean))) out.push(m[1]);
  return out;
}

/* ---------- 静态检查 ---------- */
function staticCheck(html, lesson) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // B. 契约
  const body = doc.body;
  if (parseInt(body.getAttribute("data-lesson"), 10) !== lesson.no) {
    fail(`data-lesson=${body.getAttribute("data-lesson")}，与 course-map 的 ${lesson.no} 不一致`);
  } else ok("data-lesson 与 course-map 一致");

  if (body.getAttribute("data-root") !== "../") fail("data-root 应为 \"../\"（课时页在 lessons/ 下）");
  else ok("data-root 正确");

  for (const id of ["site-topbar", "site-sidebar", "main", "site-crumb", "site-head", "site-toc", "site-pager", "site-foot"]) {
    if (!doc.getElementById(id)) fail(`缺少必需容器 #${id}`);
  }
  for (const src of ["../assets/js/course-map.js", "../assets/js/search-index.js", "../assets/js/site.js"]) {
    if (!html.includes(src)) fail(`缺少脚本引用 ${src}`);
  }
  for (const href of ["../assets/css/site.css"]) {
    if (!html.includes(href)) fail(`缺少样式引用 ${href}`);
  }

  // C. 锚点与 id 唯一性
  const ids = [...doc.querySelectorAll("[id]")].map((n) => n.id);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dup.length) fail("重复 id：" + [...new Set(dup)].join(", "));
  else ok(`id 唯一（共 ${ids.length} 个）`);

  const secs = [...doc.querySelectorAll("main section.sec")];
  if (secs.length < 6) fail(`main 内 section.sec 只有 ${secs.length} 个，内容疑似不完整`);
  else ok(`内容小节 ${secs.length} 个`);

  const brokenAnchors = [];
  doc.querySelectorAll('a[href^="#"]').forEach((a) => {
    const h = a.getAttribute("href");
    if (h === "#" || h.length < 2) return;
    if (!doc.getElementById(h.slice(1))) brokenAnchors.push(h);
  });
  if (brokenAnchors.length) fail("页内锚点无对应 id：" + [...new Set(brokenAnchors)].join(", "));
  else ok("页内锚点全部有效");

  // 小节 id 命名规范
  secs.forEach((s) => {
    if (!/^s-[a-z0-9-]+$/.test(s.id)) warn(`小节 id 不符合 s-xxx 规范：${s.id}`);
    if (!s.querySelector("h2")) warn(`小节 #${s.id} 没有 h2 标题`);
  });

  // 演示编号：id 必须按页面出现顺序递增，可见的 ①②③ 必须与 id 数字一致
  const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];
  const demos = [...doc.querySelectorAll("main .demo")];
  const demoNames = demos.map((n) => n.id);
  const expectNames = demos.map((_, i) => "demo" + (i + 1));
  if (demoNames.join(",") !== expectNames.join(",")) {
    fail(`演示容器 id 未按页面顺序：${demoNames.join(", ")}　应为：${expectNames.join(", ")}`);
  } else if (demos.length) ok(`演示 ${demos.length} 个，id 按页面顺序`);

  demos.forEach((node, i) => {
    const tip = node.querySelector(".demo__title");
    if (!tip) { warn(`${node.id} 缺少 .demo__title`); return; }
    const txt = tip.textContent.trim();
    const m = CIRCLED.findIndex((c) => txt.startsWith(c));
    if (m < 0) warn(`${node.id} 的标题没写 ①②③ 编号：${txt.slice(0, 20)}`);
    else if (m !== i) fail(`${node.id} 是第 ${i + 1} 个演示，标题却编号为 ${CIRCLED[m]}`);
    // 演示内元素 id / 函数名前缀一致性
    const pfx = "d" + (i + 1) + "-";
    const badIds = [...node.querySelectorAll("[id]")].map((n) => n.id).filter((id) => !id.startsWith(pfx) && /^d\d-/.test(id));
    if (badIds.length) warn(`${node.id} 内有前缀不符的元素 id：${badIds.join(", ")}（应为 ${pfx}xxx）`);
  });

  // G. 版式
  doc.querySelectorAll(".codeblock").forEach((b, i) => {
    if (!b.getAttribute("data-lang")) warn(`第 ${i + 1} 个 .codeblock 缺 data-lang`);
    if (!b.querySelector("pre")) fail(`第 ${i + 1} 个 .codeblock 没有 pre`);
  });
  const loose = [...doc.querySelectorAll("table.data")].filter((t) => !t.closest(".tablewrap"));
  if (loose.length) warn(`${loose.length} 个 table.data 未包在 .tablewrap 里（窄屏会溢出）`);

  // 内联样式只允许出现在演示组件里
  const bodyInline = [...doc.querySelectorAll("main .sec :not(.demo) *[style]")]
    .filter((n) => !n.closest(".demo"));
  if (bodyInline.length) warn(`${bodyInline.length} 处正文元素写了行内 style，建议改用类名`);

  // 关键内容密度
  const words = doc.querySelector("main").textContent.replace(/\s/g, "").length;
  if (words < 2500) warn(`正文只有 ${words} 字，作为教程页偏薄`);
  else ok(`正文 ${words} 字`);

  return { doc, scriptCount: extractScripts(html).length };
}

/* ---------- E. 语法检查 ---------- */
function syntaxCheck(html, file) {
  const scripts = extractScripts(html);
  let bad = 0;
  scripts.forEach((s, i) => {
    try { new vm.Script(s, { filename: `${file}#inline-${i + 1}` }); }
    catch (e) { bad++; fail(`内联脚本 #${i + 1} 语法错误：${e.message}`); }
  });
  if (!bad) ok(`内联脚本 ${scripts.length} 段语法通过`);
  for (const f of ["assets/js/course-map.js", "assets/js/site.js", "assets/js/search-index.js"]) {
    try { new vm.Script(fs.readFileSync(path.join(ROOT, f), "utf8"), { filename: f }); }
    catch (e) { fail(`${f} 语法错误：${e.message}`); }
  }
}

/* ---------- D. 索引一致性 ---------- */
function indexCheck(doc, lesson, SECTIONS) {
  const pageIds = new Set([...doc.querySelectorAll("main [id]")].map((n) => n.id));
  const idx = SECTIONS.filter((s) => s.lesson === lesson.no);
  if (!idx.length) { warn(`search-index 没有第 ${lesson.no} 次课的章节条目`); return; }
  const missing = idx.filter((s) => !pageIds.has(s.id));
  if (missing.length) fail(`search-index 指向页面上不存在的 id：${missing.map((s) => s.id).join(", ")}`);
  else ok(`search-index ${idx.length} 条章节全部命中`);

  const secIds = [...doc.querySelectorAll("main section.sec[id]")].map((n) => n.id);
  const unindexed = secIds.filter((id) => !idx.some((s) => s.id === id));
  if (unindexed.length) warn(`有 ${unindexed.length} 个小节未进搜索索引：${unindexed.join(", ")}`);
}

/* ---------- F. jsdom 冒烟 ---------- */
async function smokeCheck(file, opts) {
  const o = Object.assign({ minLinks: 20, minToc: 6, minQuiz: 0 }, opts || {});
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errors.push(e.message));
  vc.on("error", (...a) => errors.push(a.join(" ")));

  const dom = await JSDOM.fromFile(file, {
    runScripts: "dangerously",
    resources: { interceptors: [BLOCK_EXTERNAL] },
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(w) {
      w.alert = () => {};
      w.confirm = () => false;
      w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
      w.Element.prototype.scrollIntoView = () => {};
      w.scrollTo = () => {};
      w.document.execCommand = () => true;
    },
  });

  await new Promise((r) => setTimeout(r, 900));
  const w = dom.window, d = w.document;

  // 真正崩溃的判定：脚本没执行完（容器仍为空）
  const sb = d.getElementById("site-sidebar");
  if (!sb || sb.children.length === 0) {
    fail("侧边栏未渲染 —— 页面脚本可能抛错中断");
    errors.slice(0, 4).forEach((e) => console.log("      " + e.split("\n")[0]));
    return;
  }

  const links = sb.querySelectorAll("a").length;
  if (links < o.minLinks) fail(`侧边栏只有 ${links} 个课时链接`);
  else ok(`侧边栏渲染 ${links} 个课时链接`);

  const toc = d.querySelectorAll("#site-toc a").length;
  if (toc < o.minToc) fail(`本页目录只有 ${toc} 条`);
  else ok(`本页目录 ${toc} 条`);

  const cops = d.querySelectorAll(".codeblock__copy").length;
  const blocks = d.querySelectorAll(".codeblock").length;
  if (cops !== blocks) fail(`代码块 ${blocks} 个，但复制按钮只有 ${cops} 个`);
  else ok(`代码块 ${blocks} 个，复制按钮齐全`);

  if (blocks) {
    const hl = d.querySelectorAll(".codeblock code span[class^='tk-']").length;
    if (hl < o.minHl) warn(`语法高亮命中 ${hl} 处，疑似高亮失效`);
    else ok(`语法高亮命中 ${hl} 处`);
  }

  const pager = d.querySelectorAll("#site-pager a").length;
  if (pager !== 2) warn(`上下课导航只有 ${pager} 个`);
  else ok("上下课导航 2 个");

  const quiz = d.querySelectorAll(".quiz__reveal").length;
  if (quiz < o.minQuiz) fail(`随堂自测只有 ${quiz} 题`);
  else ok(`随堂自测 ${quiz} 题`);

  // 遍历点击所有 button
  const btns = [...d.querySelectorAll("button")];
  let clicked = 0;
  for (const b of btns) {
    try { b.click(); clicked++; } catch (e) { fail(`点击按钮出错（${b.textContent.trim().slice(0, 14)}）：${e.message}`); }
  }
  ok(`遍历点击 ${clicked} 个按钮`);

  // 拖动所有 range 到 min / 中值 / max
  const ranges = [...d.querySelectorAll('input[type="range"]')];
  for (const r of ranges) {
    const min = +r.min || 0, max = +r.max || 100;
    for (const v of [min, Math.round((min + max) / 2), max]) {
      try {
        r.value = String(v);
        r.dispatchEvent(new w.Event("input", { bubbles: true }));
        r.dispatchEvent(new w.Event("change", { bubbles: true }));
      } catch (e) { fail(`拖动滑块到 ${v} 出错：${e.message}`); }
    }
  }
  ok(`遍历拖动 ${ranges.length} 个滑块（min/中值/max）`);

  // 展开所有折叠区
  d.querySelectorAll(".fold__hd").forEach((b) => { try { b.click(); } catch (e) {} });

  // 搜索框试跑
  const si = d.getElementById("site-search");
  if (si) {
    for (const q of ["ollama", "模式", "知识库", "asdfgh"]) {
      si.value = q;
      si.dispatchEvent(new w.Event("input", { bubbles: true }));
    }
    ok("搜索框 4 组关键词无异常");
  }

  const real = errors.filter((e) => !/Could not parse CSS|Not implemented|css/i.test(e));
  if (real.length) {
    fail(`冒烟期出现 ${real.length} 条运行时错误`);
    real.slice(0, 6).forEach((e) => console.log("      " + e.split("\n")[0]));
  } else ok("冒烟期无运行时错误");

  dom.window.close();
}

/* ---------- 主流程 ---------- */
(async function main() {
  console.log("=".repeat(72));
  console.log("AIGC应用与实践 · 课程教程站  质量校验");
  console.log("=".repeat(72));

  const { CM, FLAT, SECTIONS } = loadData();

  head("【A】course-map 数据完整性");
  if (FLAT.length !== 32) fail(`课时数 ${FLAT.length}，应为 32（第 1–32 次课）`);
  else ok("课时数 32");
  const nos = FLAT.map((l) => l.no);
  if (new Set(nos).size !== nos.length) fail("存在重复课次号");
  else ok("课次号无重复");
  const hours = FLAT.reduce((s, l) => s + l.theory + l.practice, 0);
  if (hours !== 64) warn(`学时合计 ${hours}，全 32 课应为 64`);
  else ok("学时合计 54");

  const targets = FLAT.filter((l) => l.status === "ready" && (!ONLY || l.no === ONLY));
  if (!targets.length) { fail("没有 status=ready 的课时可校验"); return summary(); }
  log(`  待校验课时：${targets.map((l) => l.no).join(", ")}`);

  for (const l of targets) {
    const file = path.join(ROOT, l.file);
    head(`【第 ${l.no} 次课】${l.title}`);
    if (!fs.existsSync(file)) { fail(`文件不存在：${l.file}`); continue; }
    const html = fs.readFileSync(file, "utf8");
    ok(`文件存在（${(Buffer.byteLength(html) / 1024).toFixed(1)} KB）`);
    const { doc } = staticCheck(html, l);
    syntaxCheck(html, l.file);
    indexCheck(doc, l, SECTIONS);
    await smokeCheck(file, { minQuiz: 4 });
  }

  head("【H】站点外壳页（首页 / 页面模板）");
  for (const f of ["index.html", "templates/lesson-template.html"]) {
    head(`  ${f}`);
    const html = fs.readFileSync(path.join(ROOT, f), "utf8");
    syntaxCheck(html, f);
    await smokeCheck(path.join(ROOT, f), { minToc: 1, minLinks: 20 });
  }

  head("【B】未上线课时占位检查");
  const pendingMissing = FLAT.filter((l) => l.status === "pending" && fs.existsSync(path.join(ROOT, l.file)));
  if (pendingMissing.length) warn(`${pendingMissing.length} 个课时文件已存在但 course-map 仍标记 pending：${pendingMissing.map((l) => l.no).join(", ")}`);
  else ok("pending 课时均无遗留文件");

  summary();
})();

function summary() {
  console.log("\n" + "=".repeat(72));
  console.log(`结果：通过 ${oks}　警告 ${warns}　失败 ${fails}`);
  console.log(fails ? "→ 存在失败项，请修复后重新校验。" : (warns ? "→ 无失败项，警告可按需处理。" : "→ 全部通过。"));
  console.log("=".repeat(72));
  process.exit(fails ? 1 : 0);
}
