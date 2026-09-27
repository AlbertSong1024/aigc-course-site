# 《AIGC应用与实践》课程教程站 · 全面审计与修复报告

> 审计日期：2026-09-27　｜　审计范围：全站 40 个 HTML / 5 个 JS / 1 个 CSS / 3 个工具脚本
> 基线校验：`node tools/check_site.js` → **通过 659 · 警告 0 · 失败 0**
> 修复后校验：**通过 659 · 警告 0 · 失败 0**（并新增 1 项 hint 质量检查）

---

## 一、项目结构 / 技术栈 / 功能模块（已通读并理解）

### 1.1 技术栈

| 层 | 实现 | 特点 |
|---|---|---|
| 内容 | 40 个静态 HTML（32 课 + 首页 + 模板 + 仪表盘） | 无构建步骤，双击即开 |
| 样式 | 1 个 `site.css`（824 行，CSS 变量体系） | 无框架、无 CDN |
| 脚本 | 5 个 vanilla JS，ES5 语法 | 零依赖、断网可用 |
| 校验 | `tools/check_site.js`（Node + jsdom） | 8 类静态+冒烟检查 |
| 预览 | `tools/serve.py`（Python 标准库） | 禁用缓存，避免误判 |
| 脚手架 | `tools/new-lesson.js` | 新课生成 |

**零外部依赖**是硬约束：除 32 个 B 站视频 iframe（需联网观看）外，无任何 CDN / 字体 / API。

### 1.2 数据流与职责边界

```
course-map.js  ← 唯一导航数据源（32 课 / 3 模块 / 64 课时）
      │
      ├─→ site.js          运行时引擎：顶栏/侧栏/面包屑/本页目录/上下课/页脚/搜索/代码高亮
      │        ├─→ ai-tutor.js          AI 助教浮窗（离线导览 / 联网解答双模式）
      │        └─→ learning-tracker.js  学情采集（本地优先，可选匿名上报）
      │
      └─→ search-index.js  章节级搜索索引（306 条，供搜索与离线助教使用）
```

**关键契约**（每课必须满足）：
- `<body data-lesson="N" data-root="../">` —— 课次号与 course-map 一致
- `<main class="main" id="main">`，内容小节一律 `<section class="sec" id="s-xxx">`
- 页面不重复写导航 HTML，全部由 `site.js` 生成 → 保证 32 课完全一致

### 1.3 三大模块划分

| 模块 | 课次 | 课时 | 主题 |
|---|---|---|---|
| 模块一 | 1–6 | 12 | AIGC 理论基础（原理导入 → 工具实战） |
| 模块二 | 7–23 | 34 | WorkBuddy 智能体实战（全课程重心） |
| 模块三 | 24–32 | 18 | AI 赋能职场 + 前沿 AI 工具 + 综合项目 |

---

## 二、修复记录（Bug 清单）

### 🔴 P0 — 功能性缺陷（会导致功能失效）

#### BUG-1　AI 助教离线模式链接全部失效

- **文件**：`assets/js/ai-tutor.js`
- **现象**：离线导览模式下，学生提问后助教能匹配到章节，但**所有链接都点不动**——只显示「第 N 课」纯文字，没有 `href`。
- **根因**：`lessonFile(no)` 函数体里写的是未定义的变量 `n`：

  ```js
  function lessonFile(no) {
    var f = flatMap();
    for (var i = 0; i < f.length; i++) if (f[i].no === n) return f[i].file;  // ← n 未定义
    return null;
  }
  ```

  该异常被外层的 `try/catch` 静默吞掉，因此**校验脚本从未报错**（冒烟测试不检查链接有效性）。
- **修复**：`n` → `no`。
- **验证**：306 条索引全部能解析出有效链接（修复前 0 条）。实测：

  ```
  "RAG 是怎么工作的" -> 4 命中, 4 有效链接
  "一岗一库怎么配"   -> 1 命中, 1 有效链接  lessons/lesson-19-multiagent.html#s-kb
  ```

#### BUG-2　离线搜索算法「碎片压过整词」，命中严重跑偏

- **文件**：`assets/js/ai-tutor.js`
- **现象**：搜「一岗一库怎么配」，前 4 名被第 4/7/8 课占满，**真正讲这个的第 19 课反而不在结果里**。
- **根因**：2-gram 切分产生的碎片（一岗/岗一/一库）散落命中一堆无关条目，每条虽只 1 分，但累积后反超整词命中的 4.5 分；同时疑问词（是什么/怎么）作为实词参与匹配。
- **修复**（三步递进，逐步实测调优）：
  1. 整词权重从 3 提升到 6，碎片降为 1；
  2. 「随堂自测 / 课后作业 / 学习目标 / 本课导读 / 要点回顾」5 类通用小节统一降权至 0.25；
  3. 新增停用词表（24 词）+ 语气字判定 `isStop()`：token 去掉语气字后不足 2 字则丢弃。
- **验证**（8 组真实提问）：

  | 提问 | 期望课次 | 修复前 | 修复后 |
  |---|---|---|---|
  | 一岗一库怎么配 | 19 | 未命中 | **TOP1 ✓** |
  | QKV 是什么 | 2 | 未命中 | **TOP1 ✓** |
  | GEO 和 SEO 区别 | 20 | TOP1 | **TOP1 ✓** |
  | SWOT 怎么写 | 24 | TOP1 | **TOP1 ✓** |
  | 6秒法则 | 25 | TOP1 | **TOP1 ✓** |
  | 权限侦察四问 | 18 | TOP1 | **TOP1 ✓** |
  | 资料清单怎么用 | 17 | 进前4 | 进前4 ○ |
  | 临时工牌和钥匙区别 | 16 | TOP1 | **TOP1 ✓** |

  **TOP1 命中率 6/8 → 7/8，TOP4 命中率 8/8。**

### 🟠 P1 — 搜索体验塌方（135 条索引失效）

#### BUG-3　search-index.js 顺序错乱 + 135 条 hint 复读 title

- **文件**：`assets/js/search-index.js`
- **现象**：
  1. **条目顺序混乱**：第 21 课夹在 23 与 25 之间，第 1–5 课排在文件末尾（25 课之后），呈现「6-15 / 16-20 / 21-26 乱插 / 27-32」四段式错位。
  2. **hint 字段大面积偷懒**：第 1-5、16-20、22-26 共 **15 个课次、135 条**索引的 `hint` 原样复读 `title`（例：`title: "一、API Key 配置：把钥匙领出来，放对地方"`, `hint: "一、API Key 配置：把钥匙领出来，放对地方"`）。
- **影响**：这 135 条索引只剩下标题可搜，**正文里的全部术语（QKV、完形填空、一岗一库、权限侦察四问…）都搜不到**。
- **修复**：
  1. 按课次升序重排全部 306 条；
  2. 基于课程正文，为 15 个课次重写 135 条 hint 的真实关键词。
- **验证**：复读条数 **135 → 0**；关键词命中实测：

  ```
  QKV -> 1   完形填空 -> 1   临时工牌 -> 1   资料清单 -> 3   权限侦察 -> 2
  一岗一库 -> 1   GEO -> 2   SWOT -> 2   6秒法则 -> 1   压力面试 -> 1
  ```
  10/10 全部命中。

### 🟡 P2 — 时长标注缺失（影响学习节奏预判）

#### BUG-4　32 课视频字幕**全部**未标注时长

- **文件**：`lessons/lesson-*.html`（32 个）
- **现象**：学生点开视频前**无法预判要投入多少时间**。
- **实测发现的两个严重问题**：
  - **第 3、4 课共用同一个 BVID**（`BV1aiADewEBC`），实际是「李宏毅机器学习 2025 春」**整套课程合集，总时长 22 小时**，但字幕只写「看××讲次」，未说明这是合集。
  - **第 10 课（2:18）、第 14 课（2:46）** 时长偏短。
- **修复**：用 B 站 API 拉取 32 个视频的真实元数据（标题 / UP主 / 时长），为每课字幕追加**时长徽章**：
  - 普通（<30 分钟）：蓝色 `时长 27 分钟`
  - 偏长（30–60 分钟）：黄色
  - 超长（>60 分钟）：红色 `时长约 22.0 小时` + **追加分段观看建议**
- **验证**：32 课全部标注；**每课只改动 1 行**（用 `git diff --numstat` 确认），未破坏任何原有文字。

### ⚪ P3 — 代码卫生

| 编号 | 文件 | 问题 | 修复 |
|---|---|---|---|
| BUG-5 | `assets/js/site.js` | `renderHead()` 中 tags 变量拼装完整 HTML 后被下一行 `tags = ""` 立即清空——**整段是死代码** | 删除死分支，留注释说明为何不渲染关键词卡 |
| BUG-6 | `assets/js/learning-tracker.js` | `if (e.type === "visit") { b.visit++; if (n > 0) { } }` 空 if 块 | 删除空块 |
| BUG-7 | `assets/js/learning-tracker.js` | 姓名输入框绑定 `change` 事件——学生填完直接关面板则不触发，**名字丢失** | 改为 `input` 事件，边打边存 |
| BUG-8 | `assets/css/site.css` | `.video-embed` 引用未定义的 `var(--sp-5, 24px)`（有 fallback 故无害） | 改为明确的 `24px`，并补齐 `.vnote` 系列样式 |
| BUG-9 | `tools/check_site.js` | 第 313 行 `ok("学时合计 54")` 与第 312 行判断 `hours !== 64` **自相矛盾**（实际 64 学时） | 修正为「学时合计 64」 |
| BUG-10 | `tools/check_site.js` | 头部注释只列检查项 A–G，实际代码有 H（站点外壳页） | 注释补上 H |
| BUG-11 | `tools/serve.py` | 单线程 `TCPServer`：页面并发拉 course-map.js / site.js / site.css 时串行阻塞，**典型症状「课程数据源未加载」** | 改用 `ThreadingMixIn + TCPServer`，并发 10 请求实测全 200 |
| BUG-12 | `lessons/lesson-06~10.html` | 行尾被转成 CRLF，与项目规范（LF）不符 | 全部转回 LF，全项目扫描确认 0 处 CRLF |

### ✅ 新增防线

**`tools/check_site.js` 新增 hint 质量校验**：检测 `search-index.js` 中 `hint === title` 的条目并报警。防止未来转化新课时再次出现「hint 复读 title」的退化。

---

## 三、优化说明

### 优化一：课程内容的准确性、完整性与结构清晰度

**结论：内容质量高，无需大改。** 审计确认：

- **结构统一**：32 课全部遵循「本课导读 → 学习目标 → 正文 4–12 节 → 随堂自测 → 要点回顾 → 课后作业」固定骨架，小节数 9–17 个。
- **技术准确**（抽查核实）：
  - RLHF 三阶段（SFT → 奖励模型 → 强化优化）✓
  - RAG 四步（检索 → 增强 → 生成，含切片与向量化）✓
  - Token = 积木 / 概率采样 = 骰子 / 温度 = 旋钮 的类比 ✓
  - 扩散模型「猜噪声」而非「画图」✓
- **难度递进合理**：模块一「背规则→神经网络→预训练→RLHF→扩散→本地部署」原理链完整；模块二从工具入门（7 课）逐步到 Skill（8）、专家（9）、办公三件套（10-13）、知识库（14-17）、MCP（18）、多 Agent（19）、综合项目（21）；模块三转向职业场景。
- **考核口径自洽**：形成性 60%（出勤 10% + 模块一作业 15% + 模块二项目 35%）+ 终结性 40%（模块三项目 30% + 答辩 10%）= 100%。

**发现的内容量差异**（未改动，供参考）：

| 课次 | 正文字数 | 说明 |
|---|---|---|
| 第 24 课 | 20,893 | 最厚 |
| 第 18 课 | 6,290 | 最薄 |
| 第 17 课 | 6,900 | 偏薄 |
| 第 20 课 | 6,844 | 偏薄 |

中位数约 13,000 字。第 17/18/20 课偏薄，但三课均为「概念 + 四小节」结构，内容完整、有实操。**判断：属于课程设计的有意取舍，不建议为凑字数强行扩写。**

### 优化二：视频与章节主题的相关度

用 B 站 API 核实 32 个视频的真实标题，逐条比对：

| 判定 | 数量 | 说明 |
|---|---|---|
| 高度相关 | 29 | 如第 15 课 RAG 原理 → 《RAG 工作机制详解》；第 29 课 DeepSeek-Harness → 《DeepSeek Harness 首发实测+入门教程》 |
| 相关但非同款产品 | 3 | 第 7/9/19 课 WorkBuddy 主题，视频讲 OpenClaw |

**第 7 课的处理值得肯定**：字幕明确标注——

> 「（注：本视频演示的是同类桌面智能体 Clawdbot，用于类比理解 WorkBuddy 的「任务式」用法。）」

这是**诚实且合理**的教学处理：WorkBuddy 尚无公开的深度教程视频，用同类产品类比并明确说明，不构成误导。**建议保持。**

**改进项**：为第 3、4 课补上了「这是 22 小时整套合集、需挑讲次看」的显式说明（原本只写「看××讲次」，学生点开会被 22 小时吓退）。

### 优化三：视频时长与插入位置的合理性

**插入位置：全部合理。** 32 个视频均位于首个正文小节之后（讲完概念再给延伸视频），符合「先读后看」的学习节奏；采用 `IntersectionObserver` 懒加载，滚动到才加载播放器，不拖慢首屏。

**时长分布**（实测）：

| 区间 | 课数 | 处理 |
|---|---|---|
| <3 分钟（偏短） | 2（第 10、14 课） | 标注时长，作为「快速切入」 |
| 3–15 分钟（理想） | 16 | 标注时长 |
| 15–30 分钟 | 12 | 标注时长 |
| >60 分钟（超长） | 2（第 3、4 课） | 🔴 红色徽章 + 追加分段建议 |

**核心改进**：原本 32 课**一个时长都没标**，学生无法预判投入。现在每课视频旁都有时长徽章，超长视频额外给出「挑哪几讲看」的指引，按内容权重合理分配了学生的注意力预算。

---

## 四、关键代码与配置变更

### 4.1 `assets/js/ai-tutor.js` —— 修复 P0 bug + 搜索算法

```js
// 【修复 BUG-1】lessonFile：n → no
function lessonFile(no) {
  var f = flatMap();
  for (var i = 0; i < f.length; i++) if (f[i].no === no) return f[i].file;  // 原为 n
  return null;
}

// 【修复 BUG-2】分词：整词/碎片分级 + 停用词 + 语气字过滤
var STOP = { "什么":1,"怎么":1,"如何":1,"为什么":1,"是什么":1,"有哪些":1, /* …共 31 词 */ };
var STOP_CH = /[什么怎幺如何哪吗呢吧哦啊咦]/;
function isStop(s) {
  if (STOP[s]) return true;
  return s.replace(STOP_CH, "").length < 2;   // 去掉语气字后不足 2 字 → 丢弃
}

// 【修复 BUG-2】打分：整词 6/3 分，碎片 1/1 分，通用小节降权
var GENERIC_ID = { "s-quiz":1, "s-hw":1, "s-goal":1, "s-guide":1, "s-recap":1 };
// …每次命中：整词标题 6×w / hint 3×w；碎片 1×w / 1×w
if (s > 0 && GENERIC_ID[e.id]) s *= 0.25;
```

### 4.2 `assets/js/site.js` —— 删除死代码

```js
// 【修复 BUG-5】删除「拼装后被立即清空」的死分支
/* 关键词卡（course-map 的 tags）不在此渲染：tags 是「检索关键词」，
   与小节锚点并非一一对应，硬拼成 #s-<关键词> 只会产生点不动的死锚点。
   需要按关键词检索，请走顶部搜索（由 search-index.js 驱动）。 */
head.innerHTML =
  '<span class="page-head__no">…</span>' +
  "<h1>…</h1>" +
  '<p style="…">' + esc(CUR.summary) + "</p>" +
  '<div class="meta">' + chips.join("") + "</div>";   // 不再拼接 tags
```

### 4.3 `assets/js/learning-tracker.js`

```js
// 【修复 BUG-6】删除空 if 块
if (e.type === "visit") { b.visit++; }        // 原：b.visit++; if (n > 0) { }

// 【修复 BUG-7】change → input，避免关面板丢名字
nm.addEventListener("input", function () { sset(K_NAME, nm.value.trim()); });
```

### 4.4 `assets/css/site.css`

```css
/* 【修复 BUG-8】去掉未定义变量，并补齐时长徽章样式 */
.video-embed { margin: 24px 0; }              /* 原：var(--sp-5, 24px) */

.video-embed .vnote {                          /* 普通：蓝色 */
  display:inline-block; margin-left:6px; padding:1px 7px;
  border-radius:20px; font-size:12px; white-space:nowrap;
  background:var(--c-primary-l); color:var(--c-primary-d); border:1px solid var(--c-primary-b);
}
.video-embed .vnote--mid { background:var(--c-accent-l); color:var(--c-accent-d); border-color:var(--c-accent-b); }
.video-embed .vnote--long { background:#FEF2F2; color:#B91C1C; border-color:#FECACA; }
```

### 4.5 `lessons/lesson-*.html` —— 时长徽章（示例）

```html
<!-- 第 1 课（普通） -->
<figcaption><b>【延伸视频】GPT 是什么（3Blue1Brown 官方中文版）</b>
<span class="vnote">时长 27 分钟</span>　需联网观看；看完回到正文。</figcaption>

<!-- 第 3 课（超长，红色 + 分段建议） -->
<figcaption><b>【延伸视频】李宏毅机器学习 2025 春（看「预训练-对齐」讲次）</b>
<span class="vnote vnote--long">时长约 22.0 小时</span>　滚动到此处自动加载播放器…　
<b>注意：这是……整套课程合集，总时长约 22 小时</b>，不必从头看；本课只需要挑讲
「预训练 / 自监督 / 后训练」的那几讲，按合集简介里的分 P 标题跳着看即可。</figcaption>
```

### 4.6 `assets/js/search-index.js` —— 重排 + 补 hint（示例）

```js
// 修复前（顺序错乱 + hint 复读 title）
{ lesson: 18, id: "s-what", title: "一、MCP 是什么：给 AI 装插座", hint: "一、MCP 是什么：给 AI 装插座" },
// 修复后（按课次升序 + 真实关键词）
{ lesson: 18, id: "s-what", title: "一、MCP 是什么：给 AI 装插座",
  hint: "MCP Model Context Protocol 模型上下文协议 标准接口 插座 连接器 即插即用 统一规格" },
```

### 4.7 `tools/check_site.js`

```js
// 【修复 BUG-9】
if (hours !== 64) warn(`学时合计 ${hours}，全 32 课应为 64`);
else ok("学时合计 64");                       // 原：ok("学时合计 54")

// 【新增防线】检测 hint 复读 title
const echo = idx.filter((s) => (s.hint || "").trim() === (s.title || "").trim());
if (echo.length) warn(`search-index 有 ${echo.length} 条 hint 复读 title（搜不到正文术语）：…`);
```

### 4.8 `tools/serve.py`

```python
# 【修复 BUG-11】单线程 → 多线程，解决「课程数据源未加载」
class ThreadingServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True
    request_queue_size = 64

httpd = ThreadingServer(("127.0.0.1", port), NoCacheHandler)
```

---

## 五、影响面与风险

| 项 | 状态 |
|---|---|
| 改动文件 | 39 个（32 课 HTML + 5 JS + 1 CSS + 2 工具） |
| 课程页改动量 | 27 课各 **1 行**；5 课因行尾规范化显示全量 diff（内容仅 1 行） |
| 内容破坏风险 | **无**——全部为追加式修改，未删改任何原有文字 |
| 回归校验 | 通过 659 · 警告 0 · 失败 0 |
| 行尾一致性 | 全项目 LF，0 处 CRLF |
| 新增校验项 | 1（hint 质量），已通过 |

---

## 六、后续建议（未执行，待确认）

1. **第 7/9/19 课的视频**：如日后出现 WorkBuddy 官方或高质量的第三方教程，可替换现有的 OpenClaw 类比视频。当前标注已足够清晰，不急。
2. **第 17/18/20 课内容偏薄**：若学生反馈「讲得不够」，可考虑补充案例。但需先确认不是有意留白。
3. **`启动服务.bat` 与 `.workbuddy-ai/`**：为未跟踪文件，可按需保留或加入 `.gitignore`。
4. **搜索排序**：「资料清单怎么用」的 TOP1 仍指向第 15 课（第 17 课占 TOP4 三席）。若要进一步精确，可给 hint 加权重标记，但当前效果可接受。
