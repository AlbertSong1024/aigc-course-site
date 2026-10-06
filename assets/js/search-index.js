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
  /* ---------------- 第 1 次课 ---------------- */
  { lesson: 1, id: "s-chain", title: "二、它不是在查库，是在猜下一个字",       hint: "文字接龙 猜下一个字 不是查库 概率 语言模型 生成原理" },
  { lesson: 1, id: "s-first", title: "四、第一次正式用 AI：把话说清楚，把署名写规范", hint: "第一次用AI 提示词 把话说清楚 署名规范 学术诚信 标注规范 提问公式" },
  { lesson: 1, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接 神经网络" },
  { lesson: 1, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块一开局 从背规则到猜下一个字 这课解决什么" },
  { lesson: 1, id: "s-history", title: "一、AI 的 70 年：从背规则到全民普及",  hint: "AI 70年 发展史 里程碑 图灵测试 专家系统 深蓝 AlphaGo 背规则 机器学习 全民普及" },
  { lesson: 1, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通" },
  { lesson: 1, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检" },
  { lesson: 1, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },
  { lesson: 1, id: "s-trio", title: "三、大模型三件套：积木、骰子、旋钮",      hint: "三件套 积木 骰子 旋钮 Token 概率采样 温度 temperature 参数" },

  /* ---------------- 第 2 次课 ---------------- */
  { lesson: 2, id: "s-attention", title: "四、注意力机制：给重要词打高分",        hint: "注意力机制 attention 打分 QKV 重要词 权重 上下文" },
  { lesson: 2, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接 预训练" },
  { lesson: 2, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块一 AI 的大脑结构" },
  { lesson: 2, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通" },
  { lesson: 2, id: "s-neuron", title: "一、一个神经元，就是一次小组投票",       hint: "神经元 权重 偏置 激活函数 投票 神经网络基本结构 输入层 隐藏层" },
  { lesson: 2, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检" },
  { lesson: 2, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },
  { lesson: 2, id: "s-rnn", title: "二、传话游戏：老一代模型的困境",        hint: "RNN 循环神经网络 传话游戏 长距离依赖 遗忘 老一代模型困境 序列" },
  { lesson: 2, id: "s-transformer", title: "三、Transformer：从排队传话到开会讨论", hint: "Transformer 并行 自注意力 开会讨论 破局 编码器 解码器" },

  /* ---------------- 第 3 次课 ---------------- */
  { lesson: 3, id: "s-bound", title: "三、涌现与知识截止：它会一本正经地编",     hint: "涌现 emergence 知识截止 knowledge cutoff 幻觉 一本正经地编 实测 追问" },
  { lesson: 3, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接 RLHF" },
  { lesson: 3, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块一 大模型的「教育」" },
  { lesson: 3, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通" },
  { lesson: 3, id: "s-pre", title: "一、预训练：把互联网洗成一本教材",       hint: "预训练 pretrain 语料 互联网 清洗 教材 参数 规模" },
  { lesson: 3, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检 幻觉" },
  { lesson: 3, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },
  { lesson: 3, id: "s-selfsup", title: "二、自监督：完形填空不需要老师给答案",     hint: "自监督 完形填空 预测下一个词 无需标注 训练目标" },
  { lesson: 3, id: "s-sft", title: "四、后训练：SFT 岗前培训与最终分工",    hint: "后训练 SFT 监督微调 岗前培训 演示 指令微调 分工 对齐" },

  /* ---------------- 第 4 次课 ---------------- */
  { lesson: 4, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接" },
  { lesson: 4, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块一 训练原理 DeepSeek R1" },
  { lesson: 4, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通" },
  { lesson: 4, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检 三阶段" },
  { lesson: 4, id: "s-r1", title: "三、思维链与 DeepSeek R1：会「先想再说」的模型", hint: "思维链 CoT chain of thought DeepSeek R1 先想再说 推理 蒸馏" },
  { lesson: 4, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },
  { lesson: 4, id: "s-rl", title: "一、强化学习：只看结果，不教步骤",       hint: "强化学习 reinforcement learning 奖励 试错 只看结果不教步骤 策略" },
  { lesson: 4, id: "s-rlhf", title: "二、RLHF 三阶段：裁判是怎么训出来的",   hint: "RLHF 三阶段 SFT 奖励模型 reward model 强化优化 PPO 人类偏好 裁判 对齐" },
  { lesson: 4, id: "s-safety", title: "四、安全对齐：拒答是训出来的，过度拒绝是代价", hint: "安全对齐 拒答 训练出来的 过度拒绝 代价 红队 边界" },

  /* ---------------- 第 5 次课 ---------------- */
  { lesson: 5, id: "s-diffuse", title: "一、扩散模型：AI 不是在画图，是在猜噪声",  hint: "扩散模型 diffusion DDPM 加噪 去噪 猜噪声 潜空间 latent 不是画图" },
  { lesson: 5, id: "s-experiment", title: "三、控制变量实验：只改一个地方",        hint: "控制变量 实验 只改一个地方 归因 对照 记录表 提示词实验" },
  { lesson: 5, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接" },
  { lesson: 5, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块一 Stable Diffusion 深度解析" },
  { lesson: 5, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通" },
  { lesson: 5, id: "s-knobs", title: "二、看不见的旋钮与唯一的旋钮",         hint: "参数 步数 steps 采样器 sampler 引导强度 CFG seed 随机种子 看不见的旋钮" },
  { lesson: 5, id: "s-models", title: "四、换了模型，提示词要重新试",         hint: "换模型 提示词 重新试 模型差异 迁移 通用性" },
  { lesson: 5, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检 扩散" },
  { lesson: 5, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },

  /* ---------------- 第 6 次课 ---------------- */
  { lesson: 6, id: "s-api", title: "用程序调用本地模型",              hint: "Python requests /api/generate /v1/chat/completions OpenAI 兼容 base_url" },
  { lesson: 6, id: "s-bound", title: "边界与权衡",                  hint: "该用本地还是上云 判断三问 敏感 联网 能力要求" },
  { lesson: 6, id: "s-cmd", title: "五条命令",                   hint: "ollama --version pull run list rm 命令卡片 常用命令 PS 终端" },
  { lesson: 6, id: "s-goal", title: "学习目标",                   hint: "目标 先修 后续衔接" },
  { lesson: 6, id: "s-guide", title: "本课导读",                   hint: "云端与本地：断网即废、数据外传、高峰排队三个痛点" },
  { lesson: 6, id: "s-hw", title: "课后作业",                   hint: "选型说明 Modelfile 对话截图 分析 情绪树洞 活动策划" },
  { lesson: 6, id: "s-install", title: "安装与环境核查",                hint: "官网安装包 Windows Mac Linux 三步自查 环境兜底 降级" },
  { lesson: 6, id: "s-mf", title: "Modelfile 定人设",          hint: "FROM SYSTEM ollama create 自定义模型 mybot 人设 家规" },
  { lesson: 6, id: "s-ollama", title: "Ollama 是什么",             hint: "运行时 runtime 一条命令下载模型 不用 CUDA Docker Python" },
  { lesson: 6, id: "s-pit", title: "四个必知坑位",                 hint: "坑位 模型默认装C盘 OLLAMA_MODELS 环境变量 卡顿 命令找不到 拉太大" },
  { lesson: 6, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 自检" },
  { lesson: 6, id: "s-recap", title: "本课要点回顾",                 hint: "小结 链条 回到主线" },
  { lesson: 6, id: "s-run", title: "拉模型与第一次对话",              hint: "pull list run 首次加载慢 统一问题横向对比" },
  { lesson: 6, id: "s-speed", title: "速度体感与硬件",                hint: "CPU 推理 无独显 慢是正常 字每秒 降档位 不要重装" },
  { lesson: 6, id: "s-tier", title: "按内存选档位",                 hint: "档位 参数量 qwen3:0.6b 1.7b 4b 内存 量化 Q4 文件大小 选模型" },
  { lesson: 6, id: "s-usage", title: "三种调用方式",                 hint: "交互式 一次性提问 脚本 批处理 API localhost 11434 curl" },
  { lesson: 6, id: "s-why", title: "为什么要本地模型",               hint: "本地 vs 云端 数据流向 电话线 断网 隐私 离线" },

  /* ---------------- 第 7 次课 ---------------- */
  { lesson: 7, id: "s-do", title: "完成第一个任务：整理文件",           hint: "整理文件夹 分类重命名 先给方案 确认后执行 inventory proposed-actions 变更 验收 三条红线" },
  { lesson: 7, id: "s-goal", title: "学习目标",                   hint: "目标 先修 后续衔接 Skill" },
  { lesson: 7, id: "s-guide", title: "本课导读",                   hint: "从回答问题到动手干活 第一个由AI完成的任务 边讲边做" },
  { lesson: 7, id: "s-hw", title: "课后作业",                   hint: "客观题 单选 多选 判断 一键复制 六题 含答案解析" },
  { lesson: 7, id: "s-install", title: "下载与安装",                  hint: "官网 codebuddy.cn work 下载页 自动识别设备 Mac ARM64 x64 Windows x64 安装向导 安全提示 发布者 安装位置 环境准备 macOS dmg 拖入应用程序 登录 微信扫码 手机号 检查更新 常见问题 实操①" },
  { lesson: 7, id: "s-more", title: "再试两个任务",                 hint: "会议纪要 会议记录整理 待办负责人截止日期 待确认 不自行补全 Word转PPT 逐页清单 数字核对" },
  { lesson: 7, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 解析 本质区别 工作目录 六要素 验收" },
  { lesson: 7, id: "s-recap", title: "本课要点回顾",                 hint: "小结 下一步 Skill 技能" },
  { lesson: 7, id: "s-say", title: "任务说明怎么写：六要素",            hint: "目标 输入 动作 约束 输出 验收 最容易漏约束和验收 Plan模式对比" },
  { lesson: 7, id: "s-start", title: "开一个新任务：8 步走完",           hint: "新建任务 工作目录 模式 模型 任务说明 发送 结果区验收 试验文件夹 wb-试验 input" },
  { lesson: 7, id: "s-what", title: "WorkBuddy 是什么",          hint: "聊天机器人给建议 WorkBuddy交结果 读写文件 三个区 侧边栏 对话区 结果区" },

  /* ---------------- 第 8 次课 ---------------- */
  { lesson: 8, id: "s-find", title: "在 WorkBuddy 里找到 Skill",  hint: "技能页 技能市场 已安装 市场安装 查找技能 上传技能 创建技能 添加技能 权限 来源 官方推荐" },
  { lesson: 8, id: "s-goal", title: "学习目标",                   hint: "目标 先修 后续衔接 专家与专家团" },
  { lesson: 8, id: "s-guide", title: "本课导读",                   hint: "同一件事讲第二遍 把做法写成文件 以动手为主" },
  { lesson: 8, id: "s-how", title: "它是怎么工作的",                hint: "渐进式披露 三层加载 元数据 描述 按需加载 上下文 为什么 description 要写具体" },
  { lesson: 8, id: "s-hw", title: "课后作业",                   hint: "客观题 单选 多选 判断 一键复制 学习通 六题 参考答案" },
  { lesson: 8, id: "s-manage", title: "关闭与卸载",                  hint: "启用 关闭 开启 卸载 开关 批量卸载 只启用当前任务需要的技能" },
  { lesson: 8, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 解析 SKILL.md 渐进式披露 没触发 关闭与卸载" },
  { lesson: 8, id: "s-recap", title: "本课要点回顾",                 hint: "小结 下一步 专家与专家团" },
  { lesson: 8, id: "s-use", title: "实操：用一个技能改一篇稿子",          hint: "去 AI 味 安装 斜杠唤起 引用技能 执行过程 前后对比 待改稿子 先自己改再技能改 参考答案 技能没反应怎么排查" },
  { lesson: 8, id: "s-what", title: "Skill 是什么",              hint: "可复用的说明 脚本 参考资料 SKILL.md 必需 scripts references assets 可选 frontmatter name description Anthropic 开放标准" },

  /* ---------------- 第 9 次课 ---------------- */
  { lesson: 9, id: "s-choose", title: "怎么选：四种方式",               hint: "普通任务 技能 专家 专家团 四层对比 决策三句" },
  { lesson: 9, id: "s-duty", title: "这三关必须人来守",               hint: "事实核验 隐私检查 对外确认 免责声明 不构成专业意见 实操④ 审自己交的成果" },
  { lesson: 9, id: "s-goal", title: "学习目标",                   hint: "目标 先修 后续衔接 办公实战" },
  { lesson: 9, id: "s-guide", title: "本课导读",                   hint: "角色化 岗位和立场 专家 专家团 边讲边做" },
  { lesson: 9, id: "s-hw", title: "课后作业",                   hint: "客观题 单选 多选 判断 一键复制 六题 含答案解析" },
  { lesson: 9, id: "s-make", title: "自己造一个专家",                hint: "我的专家 创建专家 显示名称 人设身份 擅长领域 提示词 配置模板 实操③ 名称创建后无法修改" },
  { lesson: 9, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 解析 机制区别 怎么选 专家配置 人的责任" },
  { lesson: 9, id: "s-recap", title: "本课要点回顾",                 hint: "小结 下一步 办公实战 Word" },
  { lesson: 9, id: "s-team", title: "专家团：会自己分工的队伍",           hint: "协作执行 团长拆解 并行 整合交付 专家 vs 专家团 积分3到5倍 实操② 招新材料" },
  { lesson: 9, id: "s-what", title: "专家：有岗位的 AI 同事",          hint: "角色切换 人设 方法论 工具链 普通 vs 专家 销售数据 小红书 专家中心 召唤 实操① 实习协议审阅" },

  /* ---------------- 第 10 次课 ---------------- */
  { lesson: 10, id: "s-batch", title: "批量生成：模板 + 变量",           hint: "模板 变量 邀请函 实操④ 名单xlsx 抽查 字段错位 首份末份 文件命名 转PDF不能代替核验" },
  { lesson: 10, id: "s-fix", title: "把初稿改到能用",                hint: "润色 审校 去AI味 三件事分开 删空话 补具体 换语气 空话词清单 实操③ 初稿修订稿" },
  { lesson: 10, id: "s-goal", title: "学习目标",                   hint: "目标 先修 后续 Excel PPT 同一流程" },
  { lesson: 10, id: "s-guide", title: "本课导读",                   hint: "办公实战第一站 Word 通知总结方案 一眼假 边讲边做" },
  { lesson: 10, id: "s-hw", title: "课后作业",                   hint: "客观题 单选 多选 判断 一键复制 六题 含答案解析" },
  { lesson: 10, id: "s-inapp", title: "在 WorkBuddy 里直接改",       hint: "人机双写 手动编辑 不消耗积分 AI编辑 选区精调 权限边界 另存为新文件 变更面板" },
  { lesson: 10, id: "s-outline", title: "长文档：先要大纲",               hint: "大纲先行 先搭骨架再填肉 有没有漏 顺序对不对 实操② 1500字实习总结 待确认" },
  { lesson: 10, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 解析 AI味 大纲先行 去AI味顺序 转PDF" },
  { lesson: 10, id: "s-recap", title: "本课要点回顾",                 hint: "小结 下一步 Excel 数据处理" },
  { lesson: 10, id: "s-what", title: "为什么 AI 写的文档一眼假",         hint: "AI味 空话堆砌 信息缺失 结构均等 信息问题不是文笔问题 五要素 类型主题 对象 结构 字数语气 兜底 实操① 生成旧书交换通知" },

  /* ---------------- 第 11 次课 ---------------- */
  { lesson: 11, id: "s-check", title: "验收：三道只有你能把的关",           hint: "核行数 核口径 核合计数 实操④ 实训成绩一条龙 两个工作表 读不了文件 模型不支持 输出格式" },
  { lesson: 11, id: "s-clean", title: "脏数据的六张面孔与清洗规则",          hint: "重复行 空值 文字混进数字列 日期格式 多余空格 一物多名 数据源 规则 输出 待核 实操② 考勤表清洗" },
  { lesson: 11, id: "s-goal", title: "学习目标",                   hint: "目标 先修 Word 后续 数据汇总 可视化" },
  { lesson: 11, id: "s-guide", title: "本课导读",                   hint: "从文字到表格 难点变成数字对不对 成绩表 考勤表 实训数据 边讲边做" },
  { lesson: 11, id: "s-hw", title: "课后作业",                   hint: "客观题 单选 多选 判断 一键复制 六题 含答案解析 评分三条" },
  { lesson: 11, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 解析 摸底 空格 缺考 删行 口径差异" },
  { lesson: 11, id: "s-read", title: "表格交出去之前，先让它摸底",          hint: "本地执行不上传 沙箱隔离 授权目录 官方口径 拖入对话 告知路径 实操① 摸底报告 成绩表csv" },
  { lesson: 11, id: "s-recap", title: "本课要点回顾",                 hint: "小结 下一步 分类汇总 透视表 图表" },
  { lesson: 11, id: "s-stat", title: "基础统计：口径你定，公式它写",         hint: "平均分 三种口径 空值跳过 当0分 去重 权重 总评 及格率 排名 实操③ 成绩统计" },

  /* ---------------- 第 12 次课 ---------------- */
  { lesson: 12, id: "s-chart", title: "图表：选对比做对重要",             hint: "比大小 柱形图 看趋势 折线图 看占比 饼图环形图 看关系 散点图 看分布 直方图 数据标签 不要3D 不要双轴 实操③" },
  { lesson: 12, id: "s-check", title: "异常值对账：让 AI 算，让人判",       hint: "重复 越界 逻辑冲突 缺漏格式不一致 先总量后逐行 只标不改 需人工确认 实操④ 考勤异常清单 核查结论" },
  { lesson: 12, id: "s-goal", title: "学习目标",                   hint: "目标 先修 Excel上 Word 后续 PPT 透视四要素 图表选型 异常四类" },
  { lesson: 12, id: "s-guide", title: "本课导读",                   hint: "从一张表到多张表 多表合并 交叉统计 图表 异常值对账 input output 目录约定 边讲边做" },
  { lesson: 12, id: "s-hw", title: "课后作业",                   hint: "客观题 单选 多选 判断 一键复制 六题 含答案解析 实操成果 评分四条" },
  { lesson: 12, id: "s-merge", title: "多表合并：先对齐，再加起来",          hint: "纵向追加 横向关联 列名 口径 粒度 来源列 合并说明 实操① 三班成绩合成总表 16行" },
  { lesson: 12, id: "s-pivot", title: "透视：把明细压成结论",             hint: "行 列 值 聚合方式 求和 计数 平均 交叉表 合计行合计列 百分比 人机双写 Excel 官方口径 实操② 耗材透视 282件" },
  { lesson: 12, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 解析 追加关联 聚合方式 图表选型 对账顺序 来源列" },
  { lesson: 12, id: "s-recap", title: "本课要点回顾",                 hint: "小结 下一步 PPT 先有结论再排页面" },

  /* ---------------- 第 13 次课 ---------------- */
  { lesson: 13, id: "s-audit", title: "审校、修改与交付",               hint: "事实 阅读 版式 文件 文字溢出 字号 留白 人机双写 选页编辑 PPTX 导出 实操④" },
  { lesson: 13, id: "s-goal", title: "学习目标",                   hint: "目标 先修 Word Excel 后续 文件管理 结论式标题 一页一任务" },
  { lesson: 13, id: "s-guide", title: "本课导读",                   hint: "PPT 自动生成 实训汇报 项目答辩 主题班会 大纲 分页 配图 审校 交付 产品口径核对" },
  { lesson: 13, id: "s-hw", title: "课后作业",                   hint: "学习通 客观题 单选 多选 判断 六题 答案解析 一键复制 产品事实" },
  { lesson: 13, id: "s-outline", title: "先把材料变成演示大纲",             hint: "材料分类 背景任务 过程方法 成果证据 问题边界 叙事 实操① 实训汇报 八页大纲" },
  { lesson: 13, id: "s-pages", title: "分页：一页只完成一个任务",           hint: "逐页脚本 结论标题 主要证据 阅读负担 项目答辩 实操② 生成八页PPTX" },
  { lesson: 13, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案解析 大纲 结论式标题 配图 留白 四层检查" },
  { lesson: 13, id: "s-recap", title: "本课要点回顾",                 hint: "小结 大纲 分页 配图 留白 质量门 下一步 文件管理" },
  { lesson: 13, id: "s-visual", title: "配图与版式：每个元素都要有用",         hint: "流程图 数据图表 截图 图标 对齐 对比 重复 留白 防诈骗班会 实操③" },

  /* ---------------- 第 14 次课 ---------------- */
  { lesson: 14, id: "s-archive", title: "批量归档：确认后才动手",            hint: "按类型分类 方案在前执行在后 五类 变更 inventory.xlsx 验收四条 文件总数 无删除 抽查首中末 串行 实操③" },
  { lesson: 14, id: "s-bound", title: "先划边界：工作空间与权限",           hint: "工作空间 只放副本 默认权限 完全访问权限 全局开关 输入框底部 弹窗确认看三点 操作内容 影响范围 执行理由 三条红线 实操① 建工作目录 12个示例文件" },
  { lesson: 14, id: "s-goal", title: "学习目标",                   hint: "目标 先修 第7课 后续 RAG 知识库 检索" },
  { lesson: 14, id: "s-guide", title: "本课导读",                   hint: "桌面一堆实训照片 文件名乱码 会议录音转写稿 先划边界再动手 边讲边做" },
  { lesson: 14, id: "s-hw", title: "课后作业",                   hint: "客观题 单选 多选 判断 一键复制 六题 含答案解析" },
  { lesson: 14, id: "s-minutes", title: "会议记录转纪要与待办",             hint: "口语转写稿 纪要五块 关键结论 未决事项 待办四要素 负责人 截止 验收 待补 不许推测 实操④ meeting.txt" },
  { lesson: 14, id: "s-naming", title: "命名规则：让文件名会说话",           hint: "日期-主题-类型-版本 YYYYMMDD 不用空格 序号补零 不写最终版 v1 v2 待确认 对照表 实操② rename-plan" },
  { lesson: 14, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 解析 工作空间 默认权限 对照表 回头再定 验收四条" },
  { lesson: 14, id: "s-recap", title: "本课要点回顾",                 hint: "小结 下一步 知识库检索 命名差检索也差" },

  /* ---------------- 第 15 次课 ---------------- */
  { lesson: 15, id: "s-chunk", title: "切片与向量化",                 hint: "为什么切片 上下文窗口 向量 意思相近 三档对照 太大 太小 适中 按标题切 不要按字数硬切 10到20条 主题知识库 实操③ 资料清单" },
  { lesson: 15, id: "s-goal", title: "学习目标",                   hint: "目标 先修 后续衔接 第7课六要素 第14课文件命名 第16课接入" },
  { lesson: 15, id: "s-guide", title: "本课导读",                   hint: "幻觉 瞎编 凭记忆回答 内部规定 三个现象 RAG 检索增强生成 换掉回答的依据" },
  { lesson: 15, id: "s-hallu", title: "AI 为什么会瞎编",              hint: "幻觉 三个来源 训练数据没有 记忆模糊 必须给答案 闭卷考试 实操① 亲手造一次幻觉 追问出处" },
  { lesson: 15, id: "s-hw", title: "课后作业",                   hint: "客观题 单选 多选 判断 一键复制 六题 含答案解析" },
  { lesson: 15, id: "s-ima", title: "IMA 知识库入门",              hint: "ima 腾讯AI知识管家 个人 共享 订阅 知识库 上传文件 网页 公众号 图片 录音 腾讯文档 三查 查引用 查原文 查边界 溯源 拒答 实操④ 建库 提问 核溯源 资料库入口 解除绑定" },
  { lesson: 15, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 解析 幻觉 RAG四步 知识库不消灭幻觉 切片太小 三查" },
  { lesson: 15, id: "s-rag", title: "RAG：把闭卷改成开卷",            hint: "检索增强生成 Retrieval-Augmented Generation 四步 切片 向量化 检索 增强生成 2020 Meta Patrick Lewis NeurIPS 闭卷 vs 开卷 实操② 同一问题问两遍 手动版RAG" },
  { lesson: 15, id: "s-recap", title: "本课要点回顾",                 hint: "小结 下一步 第16课 WorkBuddy 连接 IMA" },

  /* ---------------- 第 16 次课 ---------------- */
  { lesson: 16, id: "s-ask", title: "三、带引用问答：让它照着你的资料说",      hint: "带引用问答 三要素 文件名 位置 原句 三查 查引用 查原文 查边界 溯源 RAG" },
  { lesson: 16, id: "s-bind", title: "二、绑定知识库：让它看见你有几个库",      hint: "绑定知识库 资料库入口 微信扫码 三项权限 看列表 搜索读内容 添加保存文件 企业版 解绑" },
  { lesson: 16, id: "s-edge", title: "四、权限边界与拒答策略",            hint: "权限边界 拒答策略 独立授权 不主动定时抓取 不超出已有权限 限定范围 写死红线 给退路" },
  { lesson: 16, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接 权限边界" },
  { lesson: 16, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块二 接上你的资料 让 WorkBuddy 伸进知识库" },
  { lesson: 16, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通 连接器" },
  { lesson: 16, id: "s-key", title: "一、API Key 配置：把钥匙领出来，放对地方", hint: "API Key 凭证 扫码授权 临时工牌 安全红线 不硬编码 不贴对话 不交第三方 ima 开放接口" },
  { lesson: 16, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检 凭证" },
  { lesson: 16, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },

  /* ---------------- 第 17 次课 ---------------- */
  { lesson: 17, id: "s-build", title: "二、创建流程与目录结构组织",          hint: "创建流程 盘点 定目录 入库出清单 三步 分类从资料里长出来 移动对照表" },
  { lesson: 17, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接 目录结构" },
  { lesson: 17, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块二 知识是散的 找一条三个月前记的东西" },
  { lesson: 17, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通 资料清单" },
  { lesson: 17, id: "s-iter", title: "四、持续迭代：知识库是长出来的",        hint: "持续迭代 触发点 补资料 修内容 拆大文件 同一问题问两遍 常驻文档 踩坑记录" },
  { lesson: 17, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检 目录结构" },
  { lesson: 17, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },
  { lesson: 17, id: "s-search", title: "三、检索：让知识库答得准",           hint: "检索 三类问题 事实题 归纳题 拒答 库里没有的题 通用知识硬答 只根据知识库" },
  { lesson: 17, id: "s-value", title: "一、一堆文件 ≠ 知识库",           hint: "一堆文件不是知识库 找得到 用得上 能长 目录结构 资料清单 新旧版本 迭代记录" },

  /* ---------------- 第 18 次课 ---------------- */
  { lesson: 18, id: "s-auto", title: "四、定时自动化任务：没人盯着也在干活的 AI", hint: "定时自动化任务 cron 按时间自己跑 不在场 产出位置写死 失败留痕 三条铁律" },
  { lesson: 18, id: "s-flow", title: "二、连接器工作流程：装、授权、用",       hint: "连接器 接入流程 装 授权 用 三步 权限侦察四问 范围缩小 凭证放哪 API Key" },
  { lesson: 18, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接 自动化任务" },
  { lesson: 18, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块二 圈子里 圈子外面 最小权限原则贯穿全课" },
  { lesson: 18, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通 权限侦察" },
  { lesson: 18, id: "s-perm", title: "三、最小权限原则：能少给就少给",        hint: "最小权限原则 只读够用不给写 目录限定 用完即收 损失可控 只标不改 权限对比" },
  { lesson: 18, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检 MCP" },
  { lesson: 18, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },
  { lesson: 18, id: "s-what", title: "一、MCP 是什么：给 AI 装插座",     hint: "MCP Model Context Protocol 模型上下文协议 标准接口 插座 连接器 即插即用 统一规格" },

  /* ---------------- 第 19 次课 ---------------- */
  { lesson: 19, id: "s-chain", title: "四、把它们串成一条流水线",           hint: "流水线 串联 交接物必须是文件 上一站产出等于下一站输入 落盘 人拍板 协同" },
  { lesson: 19, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接 专家团区别" },
  { lesson: 19, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块二 三个 AI 员工 自己搭的班底" },
  { lesson: 19, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通 AI 团队" },
  { lesson: 19, id: "s-kb", title: "二、给每个员工配知识库",            hint: "一岗一库 知识库 资料隔离 互相污染 子目录 MD CSV 唯一数据源 谁读哪份" },
  { lesson: 19, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检 专家团" },
  { lesson: 19, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },
  { lesson: 19, id: "s-role", title: "一、先定岗位：三个 AI 员工各自干什么",   hint: "先定岗位 三个 AI 员工 一个对话包干 岗位卡 负责什么 不做什么 输入 输出 3到5个 上下文稀释" },
  { lesson: 19, id: "s-skill", title: "三、给每个员工配技能",             hint: "技能 Skill 特定工具能力 技能市场 已安装 上传技能 查找技能 创建技能 只启用当前所需" },

  /* ---------------- 第 20 次课 ---------------- */
  { lesson: 20, id: "s-geo", title: "三、GEO：让 AI 引用你的内容",      hint: "GEO 生成式引擎优化 Generative Engine Optimization 与SEO区别 可被AI引用 可见度" },
  { lesson: 20, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接 指令模板" },
  { lesson: 20, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块二 内容生产 重复劳动标准化 平台数据为模拟" },
  { lesson: 20, id: "s-gzh", title: "一、公众号全流程：从素材到成稿",        hint: "公众号 素材到成稿 排版 标题 开头 结构 配图 发布 全流程" },
  { lesson: 20, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通 指令模板" },
  { lesson: 20, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检 GEO" },
  { lesson: 20, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },
  { lesson: 20, id: "s-tpl", title: "四、指令模板沉淀：把好用的指令变成资产",    hint: "指令模板 沉淀 可复用 资产 模板文档 填空 标准化 生产流程" },
  { lesson: 20, id: "s-xhs", title: "二、小红书笔记：同一份素材换平台",       hint: "小红书 笔记 标签 emoji 口语化 封面 平台风格差异 同一素材换版本" },

  /* ---------------- 第 21 次课 ---------------- */
  { lesson: 21, id: "s-accept", title: "四、测试、项目文档与展示",           hint: "行数 合计 事实 串档 四项检查 AI自测 结论由人下 项目文档六块 遗留 90秒讲稿 实操④" },
  { lesson: 21, id: "s-build", title: "三、实现：在一条主线上做出三份真文件",     hint: "流水 汇总表 简报 一页汇报 清洗口径表 只标不改 去重 待核实 两位小数 实操③ 报销流水csv 3951.50" },
  { lesson: 21, id: "s-goal", title: "学习目标",                   hint: "学完能做到什么 六要素任务说明 选型依据 三件套产出 四项检查 90秒讲稿 先修第7到20课" },
  { lesson: 21, id: "s-guide", title: "本课导读",                   hint: "模块二综合项目 需求分析 方案设计 实现 测试 项目文档 展示 五阶段 学生会报销 月度简报 一页汇报 模拟数据" },
  { lesson: 21, id: "s-hw", title: "课后作业",                   hint: "单选 多选 判断 6题 需求分析第一步 选型依据 知识库存什么 方案不许视情况而定 人验收 项目文档读者" },
  { lesson: 21, id: "s-need", title: "一、需求分析：把一句话问成一份任务说明",    hint: "模糊需求 含糊版 可执行版 目标 输入 动作 约束 输出 验收 六要素 缺什么清单 不许替我猜 实操① 任务说明md" },
  { lesson: 21, id: "s-plan", title: "二、方案设计：这一步到底该用什么",       hint: "选型三问 输入是什么 输出给谁看 多久跑一次 表格 文档 幻灯片 知识库 连接器 自动化 不用什么也要写理由 实操② 方案设计md" },
  { lesson: 21, id: "s-quiz", title: "随堂自测",                   hint: "5题 需求分析第一步 选型三问 知识库存什么 自测结论必须人验收 项目文档写给三个月后的自己" },
  { lesson: 21, id: "s-recap", title: "本课要点回顾",                 hint: "六要素任务说明 选型三问 先拿口径表 四项检查 文档六块 讲稿结构 下一步棋 第23课岗位工作流" },

  /* ---------------- 第 22 次课 ---------------- */
  { lesson: 22, id: "s-apply", title: "四、视频场景应用与合规",            hint: "视频场景应用 合规 版权 肖像 平台规则 内容审核 风险" },
  { lesson: 22, id: "s-brief", title: "三、简报整合与剪辑合成",            hint: "简报 剪辑合成 时间轴 字幕 转场 输出 成片" },
  { lesson: 22, id: "s-flow", title: "一、多模态视频生产流程",            hint: "多模态 视频生产流程 脚本 分镜 画面 配音 剪辑 合成 全链路" },
  { lesson: 22, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接" },
  { lesson: 22, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块二 AI 视频 从脚本到成片" },
  { lesson: 22, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通" },
  { lesson: 22, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检 多模态" },
  { lesson: 22, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },
  { lesson: 22, id: "s-source", title: "二、资讯搜集与画面素材",            hint: "资讯搜集 简报整合 素材来源 版权 画面素材 信息提炼" },

  /* ---------------- 第 23 次课 ---------------- */
  { lesson: 23, id: "s-flow", title: "二、典型行业工作流：把一件活写成四段",     hint: "典型行业工作流 四段 输入 处理 输出 验收 拆解 标准化" },
  { lesson: 23, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接 沉淀" },
  { lesson: 23, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块二 把岗位做成 AI 工作流" },
  { lesson: 23, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通 岗位" },
  { lesson: 23, id: "s-keep", title: "四、沉淀之后怎么维护",             hint: "维护 版本 更新 失效 定期检查 交接 团队共享" },
  { lesson: 23, id: "s-list", title: "一、岗位高频任务清单：先看清你一周到底在忙什么", hint: "岗位高频任务清单 一周到底在忙什么 重复任务 记录 频次 耗时 优先级" },
  { lesson: 23, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检 工作流" },
  { lesson: 23, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },
  { lesson: 23, id: "s-split", title: "三、哪些沉淀成 Skill，哪些做成自动化",  hint: "沉淀成 Skill 做成自动化 判断标准 复用频率 稳定性 自动化条件" },

  /* ---------------- 第 24 次课 ---------------- */
  { lesson: 24, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接 简历" },
  { lesson: 24, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块三 职业规划 岗位调研" },
  { lesson: 24, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通 行动计划" },
  { lesson: 24, id: "s-jd", title: "三、JD 拆解：重点是找出自己缺什么",     hint: "JD 拆解 关键词 岗位描述 能力要求 缺什么 对照 差距" },
  { lesson: 24, id: "s-plan", title: "四、能力地图与 SMART 行动计划",     hint: "能力地图 SMART 行动计划 具体 可衡量 可达成 相关 有时限 补齐路径" },
  { lesson: 24, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检 SWOT" },
  { lesson: 24, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },
  { lesson: 24, id: "s-research", title: "二、行业调研：结论后面必须跟着来源",      hint: "行业调研 来源 结论后面跟来源 数据 报告 趋势 岗位需求" },
  { lesson: 24, id: "s-swot", title: "一、SWOT：四格里填的是证据，不是形容词",  hint: "SWOT 优势 劣势 机会 威胁 证据不是形容词 四格 自评" },

  /* ---------------- 第 25 次课 ---------------- */
  { lesson: 25, id: "s-ats", title: "三、ATS 关键词：先让机器看见你",      hint: "ATS 关键词 机器筛选 岗位匹配 关键词密度 格式 可解析" },
  { lesson: 25, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接 模拟面试" },
  { lesson: 25, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块三 简历 一页纸讲清你的价值" },
  { lesson: 25, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通 简历" },
  { lesson: 25, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检 STAR" },
  { lesson: 25, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },
  { lesson: 25, id: "s-six", title: "一、HR 6 秒法则：你的简历到底被怎么看",  hint: "HR 6秒法则 简历怎么看 第一眼 关键信息 布局 一页纸" },
  { lesson: 25, id: "s-star", title: "二、STAR 法则：把「我做过」写成「我做成了什么」", hint: "STAR 法则 情境 任务 行动 结果 我做过变成我做成了什么 量化 数据" },
  { lesson: 25, id: "s-truth", title: "四、真实性原则：一句假话毁掉整份简历",     hint: "真实性原则 一句假话毁掉整份简历 背调 诚信 面试追问" },

  /* ---------------- 第 26 次课 ---------------- */
  { lesson: 26, id: "s-goal", title: "学习目标",                   hint: "学习目标 先修 后续衔接" },
  { lesson: 26, id: "s-guide", title: "本课导读",                   hint: "本课导读 模块三 把回答练到条件反射" },
  { lesson: 26, id: "s-hw", title: "课后作业",                   hint: "课后作业 单选 多选 判断 学习通 模拟面试" },
  { lesson: 26, id: "s-intro", title: "一、自我介绍公式：60 秒里该装什么",     hint: "自我介绍 公式 60秒 装什么 结构 亮点 岗位匹配 开场" },
  { lesson: 26, id: "s-pressure", title: "四、压力面试与 AI 点评：被追问还能站住，才算会", hint: "压力面试 追问 AI 点评 站得住 应变 坦诚 反问 收尾" },
  { lesson: 26, id: "s-quiz", title: "随堂自测",                   hint: "随堂自测 自测题 答案 自检 自我介绍" },
  { lesson: 26, id: "s-recap", title: "本课要点回顾",                 hint: "小结 要点回顾 回到主线" },
  { lesson: 26, id: "s-star", title: "三、STAR 应答：把一件事说圆、说到位",   hint: "STAR 应答 说圆说到位 情境 任务 行动 结果 复盘 量化" },
  { lesson: 26, id: "s-types", title: "二、三类高频面试题：每类想听的不是同一件事",  hint: "三类高频面试题 行为 技术 情境 每类想听什么 提问动机" },

  /* ---------------- 第 27 次课 ---------------- */
  { lesson: 27, id: "s-ask", title: "三、一条能验收的指令怎么写",          hint: "指令 先说改哪个文件 验收标准 计划 实操 Codex TraeWork" },
  { lesson: 27, id: "s-check", title: "四、跑测试与复核：它说做完了不算",       hint: "运行测试 审查 diff 改动范围 打开页面确认 测试通过不等于完成" },
  { lesson: 27, id: "s-forms", title: "一、同一个搭档的两张脸：CLI 与桌面端",   hint: "CLI 命令行 桌面端 可视界面 两种形态 终端 文字命令 怎么选" },
  { lesson: 27, id: "s-goal", title: "学习目标",                   hint: "目标 先修 后续衔接" },
  { lesson: 27, id: "s-guide", title: "本课导读",                   hint: "Codex 是什么 从聊天到改代码 安全副本 小任务 这课解决什么" },
  { lesson: 27, id: "s-hw", title: "课后作业",                   hint: "小脚本 使用体验 提交截图与验收结论" },
  { lesson: 27, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 自检" },
  { lesson: 27, id: "s-recap", title: "本课要点回顾",                 hint: "小结 链条 回到主线" },
  { lesson: 27, id: "s-repo", title: "二、仓库—结构—小任务：先看清再开口",     hint: "仓库 目录结构 找目标文件 小任务 只改一处 可回滚 影响范围" },
  { lesson: 27, id: "s-risk", title: "五、三条红线与数据边界",            hint: "红线 安全副本 不提交密钥 Cookie 个人路径 不装依赖 不联网发布" },

  /* ---------------- 第 28 次课 ---------------- */
  { lesson: 28, id: "s-auto", title: "三、消息接入、cron 与工具：从「你问它答」到「它按时干」", hint: "消息接入 即时通讯 cron 定时任务 定时提醒 工具调用 主动干活" },
  { lesson: 28, id: "s-bound", title: "四、本地 / VPS 与数据边界：装在哪，谁负责", hint: "本地部署 VPS 云服务器 数据边界 隐私 谁负责 运维成本" },
  { lesson: 28, id: "s-goal", title: "学习目标",                   hint: "目标 先修 后续衔接" },
  { lesson: 28, id: "s-guide", title: "本课导读",                   hint: "Hermes-Agent 开源 个人助手 会成长 跨会话记忆 为什么需要" },
  { lesson: 28, id: "s-hw", title: "课后作业",                   hint: "记忆与技能 部署方案 数据边界说明" },
  { lesson: 28, id: "s-memory", title: "一、跨会话记忆：它凭什么「越用越懂你」",    hint: "持久记忆 跨会话 记住偏好 记忆文件 MEMORY.md 越用越懂你" },
  { lesson: 28, id: "s-practice", title: "五、动手做：三张卡验证三个概念",        hint: "动手做 记忆卡 提醒卡 隐私边界 三张卡 验证 实操" },
  { lesson: 28, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 自检" },
  { lesson: 28, id: "s-recap", title: "本课要点回顾",                 hint: "小结 链条 回到主线" },
  { lesson: 28, id: "s-skill", title: "二、自动技能创建：把重复做的事沉淀下来",    hint: "自动技能 沉淀 SKILL.md 重复任务 复用 技能创建" },

  /* ---------------- 第 29 次课 ---------------- */
  { lesson: 29, id: "s-goal", title: "学习目标",                   hint: "目标 先修 后续衔接" },
  { lesson: 29, id: "s-guide", title: "本课导读",                   hint: "DeepSeek-Harness 插件化 Agent 框架 一条命令启动" },
  { lesson: 29, id: "s-hw", title: "课后作业",                   hint: "插件配置 权限档位 轨迹回放截图" },
  { lesson: 29, id: "s-mode", title: "三、四种模式：按任务换组合",          hint: "四种模式 任务模式 切换 组合 适用场景" },
  { lesson: 29, id: "s-perm", title: "二、三档权限：按任务给最低那一档",       hint: "三档权限 最小权限 只读 写文件 执行命令 授权 安全" },
  { lesson: 29, id: "s-plugin", title: "一、插件化内核：能力是拼出来的",        hint: "插件化 内核 一切皆插件 能力拼接 扩展 架构" },
  { lesson: 29, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 自检" },
  { lesson: 29, id: "s-recap", title: "本课要点回顾",                 hint: "小结 链条 回到主线" },
  { lesson: 29, id: "s-trace", title: "四、事件流与轨迹回放：查错不查功",       hint: "事件流 轨迹回放 排查 查错 日志 复现" },

  /* ---------------- 第 30 次课 ---------------- */
  { lesson: 30, id: "s-drill", title: "四、出题自测：检验，不是炫耀",         hint: "出题自测 让它出题 错题 解析 检验" },
  { lesson: 30, id: "s-explain", title: "二、四种讲法：拆解、类比、举例、练习",     hint: "四种讲法 拆解 类比 举例 练习 换个讲法" },
  { lesson: 30, id: "s-feynman", title: "三、费曼学习法：它讲完，你讲回去",       hint: "费曼学习法 讲回去 复述 听众 追问 检验真懂" },
  { lesson: 30, id: "s-goal", title: "学习目标",                   hint: "目标 先修 后续衔接" },
  { lesson: 30, id: "s-guide", title: "本课导读",                   hint: "AI 学习助手 学得快 记得牢 不依赖 知识管理" },
  { lesson: 30, id: "s-hw", title: "课后作业",                   hint: "费曼复述 出题自测 知识沉淀" },
  { lesson: 30, id: "s-manage", title: "五、避免依赖与知识管理：留下能复用的",     hint: "避免依赖 知识管理 沉淀 笔记 可复用 不照抄答案" },
  { lesson: 30, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 自检" },
  { lesson: 30, id: "s-recap", title: "本课要点回顾",                 hint: "小结 链条 回到主线" },
  { lesson: 30, id: "s-scene", title: "一、五类学习场景：先说清你要哪种帮助",     hint: "五类场景 预习 理解 练习 复习 检索 你要哪种帮助" },

  /* ---------------- 第 31 次课 ---------------- */
  { lesson: 31, id: "s-check", title: "五、提交前四项检查：真实性 / 隐私 / 格式 / 岗位一致", hint: "提交前检查 真实性 隐私 格式 岗位一致 自查清单" },
  { lesson: 31, id: "s-consist", title: "二、材料一致性：四份材料要互相作证",      hint: "一致性 互相作证 时间线 数字对不上 矛盾 AI核查" },
  { lesson: 31, id: "s-goal", title: "学习目标",                   hint: "目标 先修 后续衔接" },
  { lesson: 31, id: "s-guide", title: "本课导读",                   hint: "综合项目 求职包 把模块三成果串成一套材料" },
  { lesson: 31, id: "s-hw", title: "课后作业",                   hint: "求职包 材料一致性 展示大纲" },
  { lesson: 31, id: "s-pack", title: "一、求职包装什么：五份材料与四把尺",      hint: "求职包 五份材料 简历 作品集 展示 评价标准 四把尺" },
  { lesson: 31, id: "s-qa", title: "四、5 道真实问答：每题都要能被材料证明",   hint: "问答 预设问题 被材料证明 回答 证据" },
  { lesson: 31, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 自检" },
  { lesson: 31, id: "s-recap", title: "本课要点回顾",                 hint: "小结 链条 回到主线" },
  { lesson: 31, id: "s-show", title: "三、5 页展示大纲与 3 分钟答辩结构",    hint: "展示大纲 5页 答辩结构 3分钟 怎么讲" },

  /* ---------------- 第 32 次课 ---------------- */
  { lesson: 32, id: "s-cards", title: "四、4 页展示卡：每页不超过 3 点",     hint: "展示卡 4页 每页不超过3点 PPT 精简" },
  { lesson: 32, id: "s-closed", title: "三、AIGC 学习闭环：每件作品都能说清走到哪一步", hint: "学习闭环 五步 走到哪一步 复盘" },
  { lesson: 32, id: "s-defense", title: "一、3 分钟展示 + 2 分钟问答：答辩到底考什么", hint: "答辩 3分钟展示 2分钟问答 考什么 评分视角" },
  { lesson: 32, id: "s-goal", title: "学习目标",                   hint: "目标 先修 后续衔接" },
  { lesson: 32, id: "s-guide", title: "本课导读",                   hint: "课程总结 项目答辩 结课展示 知识体系回顾" },
  { lesson: 32, id: "s-hw", title: "课后作业",                   hint: "答辩稿 展示卡 成果包" },
  { lesson: 32, id: "s-map", title: "二、三模块知识体系：复盘要用作品证明",     hint: "三模块 知识体系 复盘 作品证明 模块一 模块二 模块三" },
  { lesson: 32, id: "s-next", title: "五、人机协作与持续关注前沿",          hint: "人机协作 AI职场生存法则 持续关注前沿 下一步" },
  { lesson: 32, id: "s-quiz", title: "随堂自测",                   hint: "自测题 答案 自检" },
  { lesson: 32, id: "s-recap", title: "本课要点回顾",                 hint: "小结 链条 回到主线" },


  /* ── 课后实训（整合进 8 个课次） ── */
  { lesson: 14, id: "s-training", title: "课后实训《实训三 文件整理与会议纪要》", hint: "文件归档 会议纪要 待办 对照表 实训报告" },
  { lesson: 17, id: "s-training", title: "课后实训《实训四 知识库搭建与带引用问答》", hint: "知识库 带引用问答 出处 切片 实训报告" },
  { lesson: 20, id: "s-training", title: "课后实训《实训六 公众号内容生产》", hint: "公众号 内容生产 选题 排版 实训报告" },
  { lesson: 21, id: "s-training", title: "课后实训《实训五 竞品分析 PPT 全链路》", hint: "竞品分析 PPT 全链路 演示文稿 实训报告" },
  { lesson: 22, id: "s-training", title: "课后实训《实训二 长文档生成与批量处理》", hint: "长文档 批量生成 周报 模板变量 实训报告" },
  { lesson: 23, id: "s-training", title: "课后实训《实训一 票据清洗与报销汇总》", hint: "票据清洗 报销汇总 脏数据 口径 实训报告" },
  { lesson: 31, id: "s-training", title: "课后实训《实训七 AI 求职包制作》", hint: "求职包 简历 作品集 材料一致性 实训报告" },
  { lesson: 32, id: "s-training", title: "课后实训《实训八 综合项目答辩包》", hint: "答辩包 展示卡 答辩稿 证据 实训报告" },
];
