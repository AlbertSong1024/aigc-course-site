/* ==========================================================================
   search-index.js —— 章节级搜索索引（人工维护，按课时递增）
   --------------------------------------------------------------------------
   作用：让顶部搜索框不仅能搜到「课时」，还能搜到「某一节知识点」并直接跳锚点。
   规则：
     · lesson 必须是 course-map.js 里的实际课次号；
     · id 必须是该课页面里真实存在的 <section class="sec" id="..."> 或 h2/h3 的 id；
     · title 写小节标题原文；hint 写这一节到底讲什么（关键词堆给搜索引擎，但保持可读）；
     · 每转化一课，就在本文件对应位置追加该课的全部小节。
   注意：本文件只服务于「搜索命中」，不是内容源。内容源永远是 lessons/*.html。
   ========================================================================== */

window.SITE_SECTION_INDEX = [

  /* ---------------- 第 6 次课　Ollama 实战 ---------------- */
  { lesson: 6, id: "s-guide",   title: "本课导读",             hint: "云端与本地：断网即废、数据外传、高峰排队三个痛点" },
  { lesson: 6, id: "s-goal",    title: "学习目标",             hint: "目标 先修 后续衔接" },
  { lesson: 6, id: "s-why",     title: "为什么要本地模型",     hint: "本地 vs 云端 数据流向 电话线 断网 隐私 离线" },
  { lesson: 6, id: "s-ollama",  title: "Ollama 是什么",        hint: "运行时 runtime 一条命令下载模型 不用 CUDA Docker Python" },
  { lesson: 6, id: "s-install", title: "安装与环境核查",       hint: "官网安装包 Windows Mac Linux 三步自查 环境兜底 降级" },
  { lesson: 6, id: "s-cmd",     title: "五条命令",             hint: "ollama --version pull run list rm 命令卡片 常用命令 PS 终端" },
  { lesson: 6, id: "s-pit",     title: "四个必知坑位",         hint: "坑位 模型默认装C盘 OLLAMA_MODELS 环境变量 卡顿 命令找不到 拉太大" },
  { lesson: 6, id: "s-tier",    title: "按内存选档位",         hint: "档位 参数量 qwen3:0.6b 1.7b 4b 内存 量化 Q4 文件大小 选模型" },
  { lesson: 6, id: "s-run",     title: "拉模型与第一次对话",   hint: "pull list run 首次加载慢 统一问题横向对比" },
  { lesson: 6, id: "s-usage",   title: "三种调用方式",         hint: "交互式 一次性提问 脚本 批处理 API localhost 11434 curl" },
  { lesson: 6, id: "s-api",     title: "用程序调用本地模型",   hint: "Python requests /api/generate /v1/chat/completions OpenAI 兼容 base_url" },
  { lesson: 6, id: "s-speed",   title: "速度体感与硬件",       hint: "CPU 推理 无独显 慢是正常 字每秒 降档位 不要重装" },
  { lesson: 6, id: "s-mf",      title: "Modelfile 定人设",     hint: "FROM SYSTEM ollama create 自定义模型 mybot 人设 家规" },
  { lesson: 6, id: "s-bound",   title: "边界与权衡",           hint: "该用本地还是上云 判断三问 敏感 联网 能力要求" },
  { lesson: 6, id: "s-quiz",    title: "随堂自测",             hint: "自测题 答案 自检" },
  { lesson: 6, id: "s-recap",   title: "本课要点回顾",         hint: "小结 链条 回到主线" },
  { lesson: 6, id: "s-hw",      title: "课后作业",             hint: "选型说明 Modelfile 对话截图 分析 情绪树洞 活动策划" },

  /* ── 第 7 次课 · WorkBuddy 入门与第一个任务（理论课） ── */
  { lesson: 7, id: "s-guide",   title: "本课导读",             hint: "从回答问题到动手干活 第一个由AI完成的任务 边讲边做" },
  { lesson: 7, id: "s-goal",    title: "学习目标",             hint: "目标 先修 后续衔接 Skill" },
  { lesson: 7, id: "s-what",    title: "WorkBuddy 是什么",     hint: "聊天机器人给建议 WorkBuddy交结果 读写文件 三个区 侧边栏 对话区 结果区" },
  { lesson: 7, id: "s-install", title: "下载与安装",           hint: "官网 codebuddy.cn work 下载页 自动识别设备 Mac ARM64 x64 Windows x64 安装向导 安全提示 发布者 安装位置 环境准备 macOS dmg 拖入应用程序 登录 微信扫码 手机号 检查更新 常见问题 实操①" },
  { lesson: 7, id: "s-start",   title: "开一个新任务：8 步走完", hint: "新建任务 工作目录 模式 模型 任务说明 发送 结果区验收 试验文件夹 wb-试验 input" },
  { lesson: 7, id: "s-say",     title: "任务说明怎么写：六要素", hint: "目标 输入 动作 约束 输出 验收 最容易漏约束和验收 Plan模式对比" },
  { lesson: 7, id: "s-do",      title: "完成第一个任务：整理文件", hint: "整理文件夹 分类重命名 先给方案 确认后执行 inventory proposed-actions 变更 验收 三条红线" },
  { lesson: 7, id: "s-more",    title: "再试两个任务",         hint: "会议纪要 会议记录整理 待办负责人截止日期 待确认 不自行补全 Word转PPT 逐页清单 数字核对" },
  { lesson: 7, id: "s-quiz",    title: "随堂自测",             hint: "自测题 答案 解析 本质区别 工作目录 六要素 验收" },
  { lesson: 7, id: "s-recap",   title: "本课要点回顾",         hint: "小结 下一步 Skill 技能" },
  { lesson: 7, id: "s-hw",      title: "课后作业",             hint: "客观题 单选 多选 判断 一键复制 六题 含答案解析" },

  /* ── 第 8 次课 · Skill——给 AI 装操作手册（实操课） ── */
  { lesson: 8, id: "s-guide",   title: "本课导读",             hint: "同一件事讲第二遍 把做法写成文件 以动手为主" },
  { lesson: 8, id: "s-goal",    title: "学习目标",             hint: "目标 先修 后续衔接 专家与专家团" },
  { lesson: 8, id: "s-what",    title: "Skill 是什么",         hint: "可复用的说明 脚本 参考资料 SKILL.md 必需 scripts references assets 可选 frontmatter name description Anthropic 开放标准" },
  { lesson: 8, id: "s-how",     title: "它是怎么工作的",       hint: "渐进式披露 三层加载 元数据 描述 按需加载 上下文 为什么 description 要写具体" },
  { lesson: 8, id: "s-find",    title: "在 WorkBuddy 里找到 Skill", hint: "技能页 技能市场 已安装 市场安装 查找技能 上传技能 创建技能 添加技能 权限 来源 官方推荐" },
  { lesson: 8, id: "s-use",     title: "实操：用一个技能改一篇稿子", hint: "去 AI 味 安装 斜杠唤起 引用技能 执行过程 前后对比 待改稿子 先自己改再技能改 参考答案 技能没反应怎么排查" },
  { lesson: 8, id: "s-manage",  title: "关闭与卸载",           hint: "启用 关闭 开启 卸载 开关 批量卸载 只启用当前任务需要的技能" },
  { lesson: 8, id: "s-quiz",    title: "随堂自测",             hint: "自测题 答案 解析 SKILL.md 渐进式披露 没触发 关闭与卸载" },
  { lesson: 8, id: "s-recap",   title: "本课要点回顾",         hint: "小结 下一步 专家与专家团" },
  { lesson: 8, id: "s-hw",      title: "课后作业",             hint: "客观题 单选 多选 判断 一键复制 学习通 六题 参考答案" },

  /* ── 第 9 次课 · 专家与专家团（实操课） ── */
  { lesson: 9, id: "s-guide",   title: "本课导读",             hint: "角色化 岗位和立场 专家 专家团 边讲边做" },
  { lesson: 9, id: "s-goal",    title: "学习目标",             hint: "目标 先修 后续衔接 办公实战" },
  { lesson: 9, id: "s-what",    title: "专家：有岗位的 AI 同事", hint: "角色切换 人设 方法论 工具链 普通 vs 专家 销售数据 小红书 专家中心 召唤 实操① 实习协议审阅" },
  { lesson: 9, id: "s-team",    title: "专家团：会自己分工的队伍", hint: "协作执行 团长拆解 并行 整合交付 专家 vs 专家团 积分3到5倍 实操② 招新材料" },
  { lesson: 9, id: "s-choose",  title: "怎么选：四种方式",     hint: "普通任务 技能 专家 专家团 四层对比 决策三句" },
  { lesson: 9, id: "s-make",    title: "自己造一个专家",       hint: "我的专家 创建专家 显示名称 人设身份 擅长领域 提示词 配置模板 实操③ 名称创建后无法修改" },
  { lesson: 9, id: "s-duty",    title: "这三关必须人来守",     hint: "事实核验 隐私检查 对外确认 免责声明 不构成专业意见 实操④ 审自己交的成果" },
  { lesson: 9, id: "s-quiz",    title: "随堂自测",             hint: "自测题 答案 解析 机制区别 怎么选 专家配置 人的责任" },
  { lesson: 9, id: "s-recap",   title: "本课要点回顾",         hint: "小结 下一步 办公实战 Word" },
  { lesson: 9, id: "s-hw",      title: "课后作业",             hint: "客观题 单选 多选 判断 一键复制 六题 含答案解析" },

  /* ── 第 10 次课 · 办公实战 Word 文档生成与批量处理（理论课） ── */
  { lesson: 10, id: "s-guide",   title: "本课导读",             hint: "办公实战第一站 Word 通知总结方案 一眼假 边讲边做" },
  { lesson: 10, id: "s-goal",    title: "学习目标",             hint: "目标 先修 后续 Excel PPT 同一流程" },
  { lesson: 10, id: "s-what",    title: "为什么 AI 写的文档一眼假", hint: "AI味 空话堆砌 信息缺失 结构均等 信息问题不是文笔问题 五要素 类型主题 对象 结构 字数语气 兜底 实操① 生成旧书交换通知" },
  { lesson: 10, id: "s-outline", title: "长文档：先要大纲",     hint: "大纲先行 先搭骨架再填肉 有没有漏 顺序对不对 实操② 1500字实习总结 待确认" },
  { lesson: 10, id: "s-fix",     title: "把初稿改到能用",       hint: "润色 审校 去AI味 三件事分开 删空话 补具体 换语气 空话词清单 实操③ 初稿修订稿" },
  { lesson: 10, id: "s-batch",   title: "批量生成：模板 + 变量", hint: "模板 变量 邀请函 实操④ 名单xlsx 抽查 字段错位 首份末份 文件命名 转PDF不能代替核验" },
  { lesson: 10, id: "s-inapp",   title: "在 WorkBuddy 里直接改", hint: "人机双写 手动编辑 不消耗积分 AI编辑 选区精调 权限边界 另存为新文件 变更面板" },
  { lesson: 10, id: "s-quiz",    title: "随堂自测",             hint: "自测题 答案 解析 AI味 大纲先行 去AI味顺序 转PDF" },
  { lesson: 10, id: "s-recap",   title: "本课要点回顾",         hint: "小结 下一步 Excel 数据处理" },
  { lesson: 10, id: "s-hw",      title: "课后作业",             hint: "客观题 单选 多选 判断 一键复制 六题 含答案解析" },

];
