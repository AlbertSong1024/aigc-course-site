/* ==========================================================================
   course-map.js —— 全课程数据结构（本站唯一导航数据源）
   --------------------------------------------------------------------------
   用途：左侧栏目录、首页课程地图、顶部"课次选择"、上一课/下一课、全站搜索
        全部由本文件驱动。新增课时只需：① 改 status/file/summary  ② 建同名 html。
   硬约定：
     1. no 必须等于授课计划表中的实际课次号（第1次课=1 … 第32次课=32）。
     2. status: "ready" = 已转化完成、可访问；"pending" = 待转化（列表灰显、不可点）。
     3. file 用相对站点根目录的路径，全部放在 lessons/ 下。
     4. 本文件用 UTF-8 无 BOM 保存，站点不依赖任何外部网络资源。
   --------------------------------------------------------------------------
   数据口径来源：
     · 《AIGC应用与实践》授课计划表.docx（周次 / 教学内容 / 理论·实操课时 / 备注）
     · AIGC应用与实践_32次课授课安排.docx（三大模块划分、考核方式、每课教学要点）
   本站收录范围：第6次课（基准模板 A）— 第32次课，共 27 课。
   ========================================================================== */

window.COURSE_MAP = {
  meta: {
    course: "AIGC应用与实践",
    school: "广州城建职业学院",
    term: "2026-2027 学年第 1 学期",
    audience: "人工智能专业 · 大三（高职）",
    totalSessions: 32,
    totalHours: 64,
    sessionMinutes: 80,
    scopeNote: "本站收录第 6 次课及之后的内容，共 27 课；模块一前 5 课为原理导入，见备课材料原文件。",
    updated: "2026-09-17",
  },

  /* 模块划分沿用《32次课授课安排.docx》的三大模块课时分配表：
     模块一 第1-6次（12课时）｜模块二 第7-23次（34课时）｜模块三 第24-32次（18课时） */
  modules: [
    {
      id: "m1",
      no: "模块一",
      name: "AIGC 理论基础",
      range: "第 1–6 次课",
      note: "讲清原理，为工具实战打底。本站只收录模块收尾的第 6 次课。",
      lessons: [
        {
          no: 6,
          week: 2,
          title: "Ollama 实战",
          subtitle: "部署本地模型，打造 AI 助手本地算力",
          type: "实操", theory: 0, practice: 2,
          sections: "暂无对应学习通章节",
          lms: "",
          status: "ready",
          file: "lessons/lesson-06-ollama.html",
          summary: "把大模型装进自己的电脑：装—改目录—选档位—三种调用方式—用 Modelfile 定人设。",
          tags: ["本地部署", "命令行", "API", "Modelfile"],
        },
      ],
    },

    {
      id: "m2",
      no: "模块二",
      name: "WorkBuddy 智能体实战",
      range: "第 7–23 次课",
      note: "全课程重心：从入门到 Skill、专家、办公三件套、知识库、MCP、多 Agent 与综合项目。",
      lessons: [
        {
          no: 7, week: 3,
          title: "WorkBuddy 入门与第一个任务",
          subtitle: "认识桌面智能体，跑通第一个任务",
          type: "理论", theory: 2, practice: 0,
          sections: "学习通 2.1", lms: "2.1",
          status: "ready",
          file: "lessons/lesson-07-workbuddy.html",
          summary: "桌面智能体是什么、界面三大区域（侧边栏/对话区/结果区）、Ask/Plan/Craft 三模式、第一个任务怎么开。",
          tags: ["桌面智能体", "三模式", "任务描述"],
        },
        {
          no: 8, week: 3,
          title: "Skill——给 AI 装操作手册",
          subtitle: "把专业做法固化成可复用技能",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 2.2", lms: "2.2",
          status: "ready", file: "lessons/lesson-08-skill.html",
          summary: "技能是什么、SKILL.md 写什么、四种拿到技能的方式、触发与调用、关闭≠卸载、装机前的权限审查。",
          tags: ["Skill", "SKILL.md", "技能市场"],
        },
        {
          no: 9, week: 3,
          title: "专家与专家团",
          subtitle: "用专业角色和项目组补齐能力短板",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 2.3", lms: "2.3",
          status: "ready", file: "lessons/lesson-09-experts.html",
          summary: "专家是角色切换、专家团是协作执行，三要素配置、交接单怎么写、审校点必须由人守。",
          tags: ["专家", "专家团", "审校"],
        },
        {
          no: 10, week: 4,
          title: "办公实战——Word 文档生成与批量处理",
          subtitle: "从大纲到成稿，从单份到批量",
          type: "理论", theory: 2, practice: 0,
          sections: "学习通 2.4", lms: "2.4",
          status: "ready", file: "lessons/lesson-10-word.html",
          summary: "文档指令五要素、大纲先行、润色审校与去 AI 味、模板+变量批量生成、人机双写与选区精调。",
          tags: ["Word", "批量处理", "润色"],
        },
        {
          no: 11, week: 4,
          title: "办公实战——Excel 数据处理（上）",
          subtitle: "发票报销自动整理",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 2.5", lms: "2.5",
          status: "ready", file: "lessons/lesson-11-excel-a.html",
          summary: "本地沙盒原理、发票字段提取、数据清洗、汇总与效率对比。",
          tags: ["Excel", "数据清洗", "公式"],
        },
        {
          no: 12, week: 4,
          title: "办公实战——Excel 数据处理（下）",
          subtitle: "数据汇总分析与可视化",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 2.6", lms: "2.6",
          status: "ready", file: "lessons/lesson-12-excel-b.html",
          summary: "多表合并（纵向追加 / 来源列）、透视四要素与聚合方式、图表选型五问、异常值四类与只标不改的对账流程。",
          tags: ["透视表", "图表", "分析报告"],
        },
        {
          no: 13, week: 5,
          title: "办公实战——PPT 自动生成",
          subtitle: "竞品分析 PPT 全链路",
          type: "理论", theory: 2, practice: 0,
          sections: "学习通 2.7", lms: "2.7",
          status: "ready", file: "lessons/lesson-13-ppt.html",
          summary: "联网调研→对比整理→生成 PPT、指令要点、排版美化四原则、迭代优化。",
          tags: ["PPT", "竞品分析", "排版"],
        },
        {
          no: 14, week: 5,
          title: "文件管理与会议记录",
          subtitle: "把杂乱文件夹和会议转写变成可检索资产",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 2.8", lms: "2.8",
          status: "ready", file: "lessons/lesson-14-files.html",
          summary: "文件分类与命名规范、批量重命名、纪要结构化、待办提取。",
          tags: ["文件管理", "会议纪要", "待办"],
        },
        {
          no: 15, week: 5,
          title: "RAG 原理与 IMA 知识库入门",
          subtitle: "从凭记忆回答，到查资料回答",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 2.9", lms: "2.9",
          status: "ready", file: "lessons/lesson-15-rag.html",
          summary: "三大痛点、RAG 四步流程、向量化直觉、切片效果、引用与拒答。",
          tags: ["RAG", "向量化", "引用溯源"],
        },
        {
          no: 16, week: 6,
          title: "WorkBuddy 连接 IMA 知识库实战",
          subtitle: "让桌面智能体调用你的私有资料",
          type: "理论", theory: 2, practice: 0,
          sections: "学习通 2.10", lms: "2.10",
          status: "ready", file: "lessons/lesson-16-ima.html",
          summary: "API Key 配置、绑定知识库、带引用问答、权限边界与拒答策略。",
          tags: ["IMA", "API Key", "权限"],
        },
        {
          no: 17, week: 6,
          title: "LLM Wiki 实战",
          subtitle: "创建自己的 AI 知识库",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 2.11", lms: "2.11",
          status: "ready", file: "lessons/lesson-17-wiki.html",
          summary: "Wiki 知识库的价值、创建流程、目录结构组织、检索与持续迭代。",
          tags: ["LLM Wiki", "知识沉淀", "目录组织"],
        },
        {
          no: 18, week: 6,
          title: "MCP 连接器与自动化任务",
          subtitle: "给 AI 接上外部工具和数据",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 2.12", lms: "2.12",
          status: "ready", file: "lessons/lesson-18-mcp.html",
          summary: "MCP 是什么、连接器工作流程、最小权限原则、定时自动化任务。",
          tags: ["MCP", "连接器", "自动化"],
        },
        {
          no: 19, week: 7,
          title: "多 Agent 协作",
          subtitle: "组建你的 AI 团队",
          type: "理论", theory: 2, practice: 0,
          sections: "学习通 2.13", lms: "2.13",
          status: "ready", file: "lessons/lesson-19-multiagent.html",
          summary: "三个 AI 员工场景、各自的知识库与技能配置、协同价值与串联流程。",
          tags: ["多 Agent", "AI 员工", "协作"],
        },
        {
          no: 20, week: 7,
          title: "自媒体运营实战",
          subtitle: "公众号 / 小红书 / GEO 内容生产",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 2.14", lms: "2.14",
          status: "ready", file: "lessons/lesson-20-media.html",
          summary: "公众号全流程、小红书笔记、GEO 搜索可见度优化、指令模板沉淀。",
          tags: ["自媒体", "GEO", "指令模板"],
        },
        {
          no: 21, week: 7,
          title: "模块二综合项目",
          subtitle: "办公自动化方案设计",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 2.15", lms: "2.15",
          status: "ready", file: "lessons/lesson-21-project2.html",
          summary: "需求分析→方案设计→实现→测试→项目文档与展示，模块二知识整合。",
          tags: ["综合项目", "方案设计", "项目文档"],
        },
        {
          no: 22, week: 8,
          title: "AI 视频制作与资讯整合实战",
          subtitle: "从脚本到成片，从信息到简报",
          type: "理论", theory: 2, practice: 0,
          sections: "学习通 2.16", lms: "2.16",
          status: "ready", file: "lessons/lesson-22-video.html",
          summary: "多模态视频生产流程、资讯搜集与简报整合、视频场景应用。",
          tags: ["AI 视频", "资讯整合", "多模态"],
        },
        {
          no: 23, week: 8,
          title: "岗位与行业实战",
          subtitle: "把你的岗位做成 AI 工作流",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 2.17", lms: "2.17",
          status: "ready", file: "lessons/lesson-23-role.html",
          summary: "岗位高频任务清单、典型行业工作流、把重复任务沉淀成 Skill 与自动化。",
          tags: ["工作流", "岗位实战", "自动化沉淀"],
        },
      ],
    },

    {
      id: "m3",
      no: "模块三",
      name: "AI 赋能职场与生活 + 前沿 AI 工具",
      range: "第 24–32 次课",
      note: "职业规划、简历面试、编程搭档、前沿 Agent 框架与综合项目答辩。",
      lessons: [
        {
          no: 24, week: 8,
          title: "AI 辅助职业规划与岗位调研",
          subtitle: "SWOT、行业调研、JD 拆解与行动计划",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 3.1", lms: "3.1",
          status: "ready", file: "lessons/lesson-24-career.html",
          summary: "SWOT 分析、行业调研、JD 关键词拆解、能力地图与 SMART 行动计划。",
          tags: ["职业规划", "SWOT", "JD 拆解"],
        },
        {
          no: 25, week: 9,
          title: "AI 简历优化",
          subtitle: "一页纸讲清你的价值",
          type: "理论", theory: 2, practice: 0,
          sections: "学习通 3.2", lms: "3.2",
          status: "ready", file: "lessons/lesson-25-resume.html",
          summary: "HR 6 秒法则、STAR 法则改写经历、ATS 关键词优化、真实性原则。",
          tags: ["简历", "STAR", "ATS"],
        },
        {
          no: 26, week: 9,
          title: "AI 模拟面试",
          subtitle: "把回答练到条件反射",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 3.3", lms: "3.3",
          status: "ready", file: "lessons/lesson-26-interview.html",
          summary: "自我介绍公式、三类高频面试题、STAR 应答、压力面试与 AI 点评。",
          tags: ["模拟面试", "行为面试", "STAR"],
        },
        {
          no: 27, week: 9,
          title: "Codex 入门",
          subtitle: "你的 AI 编程搭档",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 3.4", lms: "3.4",
          status: "pending", file: "lessons/lesson-27-codex.html",
          summary: "Codex 定位与登录、标准工作流、零基础用法、跑测试与审查结果。",
          tags: ["Codex", "AI 编程", "CLI"],
        },
        {
          no: 28, week: 10,
          title: "Hermes-Agent",
          subtitle: "会成长的开源个人 AI 助手",
          type: "理论", theory: 2, practice: 0,
          sections: "学习通 3.5", lms: "3.5",
          status: "pending", file: "lessons/lesson-28-hermes.html",
          summary: "持久记忆、自动技能创建、多平台接入与部署方式。",
          tags: ["Hermes-Agent", "持久记忆", "开源"],
        },
        {
          no: 29, week: 10,
          title: "DeepSeek-Harness",
          subtitle: "一切皆插件的 Agent 框架",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 3.6", lms: "3.6",
          status: "pending", file: "lessons/lesson-29-harness.html",
          summary: "插件化内核、一条命令启动、三档权限、四种模式与轨迹回放。",
          tags: ["DeepSeek Harness", "插件", "轨迹回放"],
        },
        {
          no: 30, week: 10,
          title: "AI 学习助手与知识管理",
          subtitle: "用 AI 学得快、记得牢、不依赖",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 3.7", lms: "3.7",
          status: "pending", file: "lessons/lesson-30-learning.html",
          summary: "AI 辅助学习五场景、费曼学习法、出题与总结、避免依赖。",
          tags: ["学习方法", "费曼", "知识管理"],
        },
        {
          no: 31, week: 11,
          title: "综合项目——AI 求职包制作",
          subtitle: "把模块三的成果串成一套材料",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 3.8", lms: "3.8",
          status: "pending", file: "lessons/lesson-31-jobpack.html",
          summary: "求职包构成、评价标准、材料统一性、展示答辩准备。",
          tags: ["综合项目", "求职包", "答辩"],
        },
        {
          no: 32, week: 12,
          title: "课程总结与项目答辩",
          subtitle: "结课展示与知识体系回顾",
          type: "实操", theory: 0, practice: 2,
          sections: "学习通 3.9", lms: "3.9",
          status: "pending", file: "lessons/lesson-32-defense.html",
          summary: "项目答辩流程、三大模块知识回顾、AIGC 学习闭环与 AI 职场生存法则。",
          tags: ["课程总结", "答辩", "知识体系"],
        },
      ],
    },
  ],

  /* 首页/规范页用的口径说明，避免学生误读 */
  grading: {
    formative: "形成性评价 60%（出勤与课堂参与 10% + 模块一作业 15% + 模块二综合项目 35%）",
    summative: "终结性评价 40%（模块三综合项目 30% + 期末答辩 10%）",
  },
};

/* 展平工具：返回按课次排序的全部课时（供 site.js 复用） */
window.COURSE_MAP.flat = function () {
  var out = [];
  window.COURSE_MAP.modules.forEach(function (m) {
    m.lessons.forEach(function (l) {
      out.push(Object.assign({ moduleId: m.id, moduleNo: m.no, moduleName: m.name }, l));
    });
  });
  return out.sort(function (a, b) { return a.no - b.no; });
};
