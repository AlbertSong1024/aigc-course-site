/* ==========================================================================
   agnes-proxy-worker.js —— Agnes 代理（Cloudflare Worker）
   --------------------------------------------------------------------------
   为什么需要它：两件事必须靠代理解决，缺一不可。

   1) Agnes 未开放跨域（CORS）
      实测：请求 api.agnes-ai.cn 不返回任何 Access-Control-Allow-* 头，
      所以浏览器直连会被拦（fetch 报 CORS 错误），AI 助教在网页里根本调不通。

   2) API Key 不能进代码
      本站仓库是 public（GitHub Pages）。Key 一旦写进 ai-tutor.js 推上去就是公开泄露，
      会被人拿去刷额度。代理把 Key 存在 Worker 的环境变量里，前端只拿得到代理地址。

   代理做的事：
     · 补 CORS 头 → 浏览器能连
     · 注入 Authorization → 学生不用填 Key，也不会看到 Key
     · 只放行 POST /chat/completions，其他一律拒绝

   部署步骤（老师做一次，约 5 分钟）：
     1. 注册 https://dash.cloudflare.com（免费）
     2. Workers 和 Pages → 创建 Worker → 粘贴本文件全部内容 → 部署
     3. 该 Worker 的「设置 → 变量和机密」里添加两个环境变量：
          AGNES_API_KEY   = 你的 Agnes Key（sk-...）
          ALLOWED_ORIGIN  = https://albertsong1024.github.io
        （AGNES_API_KEY 要点「加密」，这样连你自己之后也看不到明文）
     4. 拿到 Worker 地址，例如 https://agnes-proxy.xxx.workers.dev
     5. 把地址填进 ai-tutor.js 的 PROVIDERS.agnes.url（末尾加 /v1/chat/completions）
        或在 AI 助教设置里选「自定义 OpenAI 兼容」填入。

   免费额度参考：Cloudflare Workers 免费版 10 万请求/天，一门课够用。
   ========================================================================== */

export default {
  async fetch(request, env) {
    /* ---------- 跨域预检 ---------- */
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    /* ---------- 只放行聊天接口，且必须 POST ---------- */
    const url = new URL(request.url);
    if (request.method !== "POST" || !url.pathname.endsWith("/chat/completions")) {
      return json({ error: "只支持 POST /chat/completions" }, 405, env, request);
    }

    if (!env.AGNES_API_KEY) {
      return json({ error: "服务端未配置 AGNES_API_KEY" }, 500, env, request);
    }

    /* ---------- 读取前端请求体 ---------- */
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: "请求体不是合法 JSON" }, 400, env, request);
    }

    /* 只允许改模型名，其余参数原样转发；不传就默认 agnes-2.5-flash */
    const model = typeof body.model === "string" && body.model ? body.model : "agnes-2.5-flash";

    /* ---------- 转发到 Agnes（中国服务端点） ---------- */
    const upstream = "https://api.agnes-ai.cn/v1/chat/completions";
    let upstreamResp;
    try {
      upstreamResp = await fetch(upstream, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + env.AGNES_API_KEY
        },
        body: JSON.stringify({ ...body, model })
      });
    } catch (e) {
      return json({ error: "连接 Agnes 失败：" + String(e) }, 502, env, request);
    }

    /* ---------- 原样返回，补上跨域头 ---------- */
    const text = await upstreamResp.text();
    return new Response(text, {
      status: upstreamResp.status,
      headers: {
        ...corsHeaders(env, request),
        "Content-Type": upstreamResp.headers.get("Content-Type") || "application/json"
      }
    });
  }
};

function corsHeaders(env, request) {
  const origin = request.headers.get("Origin");
  /* 配置了白名单就只放行该来源，否则放行全部 */
  const allowed = env.ALLOWED_ORIGIN
    ? (origin === env.ALLOWED_ORIGIN ? origin : "null")
    : "*";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}

function json(obj, status, env, request) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders(env, request), "Content-Type": "application/json" }
  });
}
