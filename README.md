# AIGC应用与实践 · 课程教程站

把《AIGC应用与实践》**第 6 次课至第 32 次课**（共 27 课、54 课时）的课程内容，
重排成一份类似菜鸟教程的**可照着做的教程站**：结构清晰、含代码示例与可运行演示。

- **纯静态**：HTML + CSS + 原生 JS，**零外部依赖**，`file://` 双击即可打开，**断网可用**；
- **单一数据源**：全部导航（左侧目录、首页课程地图、顶部课次下拉、上一课/下一课、全站搜索）由 `assets/js/course-map.js` 驱动；
- **统一设计系统**：全站只用两个主色（蓝 `#2563EB` + 橙 `#F59E0B`），样式集中在 `assets/css/site.css`，课时页不写行内样式；
- **可校验**：`tools/check_site.js` 做结构、锚点、索引、语法、冒烟、版式六类检查。

---

## 快速开始

```
直接双击 index.html
```

不需要起服务器、不需要安装任何东西。左侧目录点课次即可进入对应页面。

如果想让地址栏有真实路径（便于截图、分享同一局域网内的同事），起一个本地服务器：

```bash
# 在 tutorial-site/ 目录下执行
python tools/serve.py          # 默认 8806，只监听本机
python tools/serve.py 9000     # 或指定端口
# 然后访问 http://127.0.0.1:8806/index.html
```

> ⚠️ **请用 `tools/serve.py`，不要用 `python -m http.server`。**
> 后者会让浏览器缓存 `course-map.js` / `site.js`，改了数据源后刷新页面仍可能拿到旧版，
> 典型症状是**「新课明明做完了，侧栏里那几课还是点不动」**，很费时间。
> `tools/serve.py` 给所有响应加了 `Cache-Control: no-store`，刷新即生效。
>
> 两种方式效果一致——本站零外部依赖、没有跨域请求，`file://` 与 `http://` 下都能完整运行。
> 注意只监听 `127.0.0.1`，不要绑 `0.0.0.0`（会把课件暴露到局域网）。

**怎么确认自己看到的是最新版？** 看页面**页脚**：

```
AIGC应用与实践 · 广州城建职业学院 · 2026-2027 学年第 1 学期 | 课程教程站 v1.0 | 已上线 5 / 27 课
资料版本 2026-09-17 · …
```

「已上线 N / 27」与「资料版本」对得上，就是最新的；数字偏小说明加载的是缓存。
按一次 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> 强制刷新即可。
>
> 用 **VS Code + Live Server** 打开体验更好（热重载），但非必需。

---

## 目录结构

```
tutorial-site/
├── index.html                     首页 · 课程地图
├── CONVERSION-SPEC.md             ★ 批量转化规范（新增课时前必读）
├── README.md                      本文件
├── assets/
│   ├── css/site.css               全站设计系统（唯一）
│   ├── js/course-map.js           ★ 全课程数据源
│   ├── js/search-index.js         章节级搜索索引
│   └── js/site.js                 运行时引擎
├── lessons/
│   ├── lesson-06-ollama.html      基准模板 A · 实操课
│   ├── lesson-07-workbuddy.html   基准模板 B · 理论课
│   ├── lesson-08-skill.html       Skill（实操）
│   ├── lesson-09-experts.html     专家与专家团（实操）
│   └── lesson-10-word.html        Word 文档生成与批量处理（理论）
├── templates/lesson-template.html 页面骨架
└── tools/
    ├── check_site.js              质量校验
    └── new-lesson.js              一键新建课时
```

---

## 当前进度

**已上线 5 / 27 课**（第 7–10 课已于 2026-09-18 按「蓝皮书为主线 + 穿插式实操」重构）：

| 课次 | 标题 | 类型 | 说明 |
|---|---|---|---|
| 第 6 次课 | Ollama 实战 | 实操 | 基准模板 A：4 个可运行演示 + 完整 Python 调用脚本 |
| 第 7 次课 | WorkBuddy 入门与第一个任务 | 理论 | **含完整下载安装教程**（官网→Win/Mac 安装→登录→更新，17 张截图）+ **6 个实操**；共 27 张配图 |
| 第 8 次课 | Skill——给 AI 装操作手册 | 实操 | **4 个实操**：装技能用起来 → 改 AI 味稿子 → 验证关闭≠卸载 → 造一个技能 |
| 第 9 次课 | 专家与专家团 | 实操 | **4 个实操**：召唤专家审协议 → 专家团做宣传材料 → 造自己的专家 → 审自己交的成果 |
| 第 10 次课 | 办公实战——Word 文档生成与批量处理 | 理论 | **4 个实操**：生成通知 → 1500 字总结（大纲先行）→ 改到能用 → 批量生成邀请函 |

四课统一为 **10 个小节 / 4–6 个任务型实操 / 6 题客观题作业（含解析、一键复制）**。

其余 22 课在课程地图里显示为<sup>待转化</sup>（灰显、暂不可点），按规范转化后自动变为可访问。

---

## 怎么新增一课

```bash
# 1. 生成页面骨架
node tools/new-lesson.js 8

# 2. 写内容（按 CONVERSION-SPEC.md 第三节的结构）
#    编辑 lessons/lesson-08-*.html

# 3. 登记数据源
#    assets/js/course-map.js    → 把第 8 次课的 status 改为 "ready"
#    assets/js/search-index.js  → 追加该课全部小节

# 4. 过校验（必须「失败 0」）
node tools/check_site.js 8
```

校验脚本依赖 `jsdom`。若报「Cannot find module 'jsdom'」：

```bash
cd "C:/Users/Albert/.workbuddy/binaries/node/workspace" && npm i jsdom
NODE_PATH="C:/Users/Albert/.workbuddy/binaries/node/workspace/node_modules" \
  node tools/check_site.js
```

---

## 设计系统速查

| 项目 | 值 |
|---|---|
| 主色 | 蓝 `#2563EB`（浅底 `#EFF6FF`，边框 `#BFDBFE`） |
| 强调色 | 橙 `#F59E0B`（浅底 `#FFFBEB`，边框 `#FDE68A`） |
| 正文 / 次级 / 边框 / 页面底 | `#1F2937` / `#64748B` / `#E5E7EB` / `#F8FAFC` |
| 代码块 | 深底 `#0F172A` + 浅字 `#E2E8F0` |
| 字体 | 系统字体栈 + 等宽 `Consolas`；正文 15px / 行高 1.75 |
| 顶栏渐变 | `linear-gradient(135deg, #2563EB 0%, #F59E0B 100%)` |

版面：三栏（左侧课程目录 268px / 正文自适应 / 右侧本页目录 196px）。
≤1180px 收掉右栏，≤900px 左栏变抽屉。

---

## 两个基准模板各示范了什么

**基准模板 A · 第 6 次课（实操课）**

- 4 个可运行演示：数据流向图（含断网开关）、按内存选档位（滑块）、API 调用流程（打字机输出）、Modelfile 生成器（人设切换 + 模拟对话）；
- 代码展示覆盖 `bash` / `powershell` / `python` / `json` / `modelfile` 五种语言，含一份完整可运行的 `ask_local.py`；
- 展示了「示意数据必须标注」「出处必须写明」的写法。

**基准模板 B · 第 7 次课（理论课）**

- 界面导览演示（按官方口径分**三区**：侧边栏 / 对话区 / 结果区，点击分区看说明）、三模式对比、四要素任务描述组装器、Plan 模式计划生成器；
- 代码展示覆盖 `text` 模板与一份**只读不写**的 `scan_and_plan.py`——示范「破坏性操作默认写成预演版」；
- 展示了「产品事实必须联网核实并标注核对日期」的写法（三种模式的名称与边界均取自官方文档）。

---

## 说明

- 本站是**教程站**，不是课堂投屏底本。学习通题号、计分口径、时间账、环节编号等课堂要素一律不在此呈现，那部分以 `05_正式教案.md`、`课堂材料包/逐字稿.md` 为准。
- 教学内容与教案保持一致；两份材料对同一件事的说法不能打架。
- 已发现的待确认事项见 `CONVERSION-SPEC.md` 第十节。
