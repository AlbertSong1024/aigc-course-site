#!/usr/bin/env node
/* ==========================================================================
   new-lesson.js —— 一键新建课时页脚手架
   --------------------------------------------------------------------------
   用法（在 tutorial-site 目录下执行）：
     node tools/new-lesson.js 8                        # 按 course-map 自动取名
     node tools/new-lesson.js 10 --file lesson-10-word # 指定文件名
     node tools/new-lesson.js 10 --dry                 # 只看会生成什么，不落盘

   它会做三件事：
     1. 从 templates/lesson-template.html 复制一份，替换课次号 / 标题 / 副标题
     2. 生成 lessons/lesson-NN-<slug>.html
     3. 打印「需要你手工做」的清单（含 course-map 与 search-index 的待填片段）
   注意：本脚本【不】自动改 course-map.js 与 search-index.js ——
        数据源改动一律人工确认，避免批量脚本写坏站点导航。
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const no = parseInt(args.find((a) => /^\d+$/.test(a)) || "", 10);
const dry = args.includes("--dry");
const fileArg = (() => { const i = args.indexOf("--file"); return i >= 0 ? args[i + 1] : null; })();

if (!no) {
  console.log("用法：node tools/new-lesson.js <课次号> [--file 文件名] [--dry]");
  process.exit(1);
}

/* 读 course-map */
const sb = { window: {}, console };
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, "assets/js/course-map.js"), "utf8"), sb);
const CM = sb.window.COURSE_MAP;
CM.flat = CM.flat.bind(CM);
const lesson = CM.flat().find((l) => l.no === no);

if (!lesson) {
  console.log(`course-map 里没有第 ${no} 次课。请先在 assets/js/course-map.js 里把它补上。`);
  process.exit(1);
}

const slug = (fileArg || lesson.file || `lessons/lesson-${String(no).padStart(2, "0")}.html`).replace(/\\/g, "/");
const dest = path.join(ROOT, slug.startsWith("lessons/") ? slug : "lessons/" + slug);
const tplPath = path.join(ROOT, "templates/lesson-template.html");

if (fs.existsSync(dest) && !dry) {
  console.log(`文件已存在，未覆盖：${path.relative(ROOT, dest)}`);
  console.log("如果确实要重建，请先手动删除或改名。");
  process.exit(1);
}

const html = fs
  .readFileSync(tplPath, "utf8")
  .replace(/\{\{NO\}\}/g, String(no))
  .replace(/\{\{TITLE\}\}/g, lesson.title)
  .replace(/\{\{SUBTITLE\}\}/g, lesson.subtitle);

const rel = path.relative(ROOT, dest).replace(/\\/g, "/");
console.log("─".repeat(70));
console.log(`第 ${no} 次课　${lesson.title} —— ${lesson.subtitle}`);
console.log(`${lesson.moduleNo} ${lesson.moduleName}　|　第 ${lesson.week} 周　|　${lesson.type} ${lesson.type === "实操" ? lesson.practice : lesson.theory} 课时`);
console.log("─".repeat(70));
console.log(dry ? `[--dry] 将生成：${rel}` : `已生成：${rel}`);

if (!dry) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, "utf8");
}

console.log(`
接下来需要你手工完成（三步，缺一不可）：

① 编辑 ${rel}
   把 6 个小节（s-guide / s-goal / s-… / s-quiz / s-recap / s-hw）的内容写实。
   正文小节数量控制在 2–8 个之间，一节讲透一个概念。

② 编辑 assets/js/course-map.js
   把第 ${no} 次课的 status 从 "pending" 改为 "ready"：
     no: ${no}, … status: "ready", file: "${rel}"

③ 编辑 assets/js/search-index.js
   在本课位置追加小节索引（每一条都要能在页面上找到对应 id）：
     { lesson: ${no}, id: "s-guide", title: "本课导读", hint: "关键词 便于搜索命中" },
     …

最后跑校验：
   node tools/check_site.js ${no}
`);
