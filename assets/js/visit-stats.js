/* ==========================================================================
   visit-stats.js —— 访问统计聚合（本地口径，零依赖、断网可用）
   --------------------------------------------------------------------------
   干什么：把一批学生档案（learning-tracker.js 导出的 JSON）汇总成
     · 访客总数 / 总访问次数 / 人均访问次数
     · 各课次访问人数排行（哪次课人最多）
     · 各课次累计停留排行（哪次课总用时最长）
     · 各课次人均停留排行（哪次课单次看得最久）
     · 各课次被打开次数排行（使用次数 / 热度）

   为什么在本机算：本站是纯静态站，没有后端，也拿不到服务器访问日志。
   所以「访客统计」靠学生各自导出的档案，老师在本机合并——
   数据不出老师电脑，断网也能用，与本站「零 CDN / 断网可用」原则一致。

   口径说明（必须看清，别和外部统计服务混为一谈）：
     · 这里的「访客」= 一份档案 = 一位学生的浏览器（按 sid 去重）
     · 「访问次数」= 该学生打开页面的累计次数，不是独立 IP 数
     · 若学生没导出档案，这里统计不到他——本模块只反映「已交档案的人」
   ========================================================================== */
(function (root) {
  "use strict";

  function num(v, d) { var n = parseInt(v, 10); return isNaN(n) ? d : n; }
  function ms(v) { return num(v, 0); }

  /* 把一份档案规整成统一结构，坏字段一律兜底，绝不抛异常 */
  function norm(doc) {
    var s = (doc && doc.summary) || {};
    var log = Array.isArray(doc && doc.log) ? doc.log : [];
    return {
      sid: s.sid || "",
      name: s.name || "",
      lessonsVisited: num(s.lessonsVisited, 0),
      totalDwellMs: ms(s.totalDwellMs),
      visits: num(s.visits, 0),
      sessionCount: num(s.sessionCount, 0),
      pageHits: s.pageHits && typeof s.pageHits === "object" ? s.pageHits : null,
      byLesson: s.byLesson && typeof s.byLesson === "object" ? s.byLesson : {},
      firstVisitAt: num(s.firstVisitAt, 0) || null,
      lastVisitAt: num(s.lastVisitAt, 0) || null,
      quizAvg: (s.quizAvg === 0 || s.quizAvg) ? s.quizAvg : null,
      askCount: num(s.askCount, 0),
      demoRuns: num(s.demoRuns, 0),
      hwOpened: num(s.hwOpened, 0),
      log: log
    };
  }

  /* 从事件流里兜底推算：老版本档案没有 pageHits / sessionCount 时用得上 */
  function derive(doc) {
    var hits = {}, sessions = 0, dwellByLesson = {}, visitByLesson = {};
    doc.log.forEach(function (e) {
      var n = num(e && e.lesson, 0);
      if (!n) return;
      var k = String(n);
      if (e.type === "visit") { hits[k] = (hits[k] || 0) + 1; visitByLesson[k] = (visitByLesson[k] || 0) + 1; }
      else if (e.type === "dwell") { dwellByLesson[k] = (dwellByLesson[k] || 0) + ms(e.data && e.data.ms); }
      else if (e.type === "session") { sessions++; }
    });
    return { hits: hits, sessions: sessions, dwellByLesson: dwellByLesson, visitByLesson: visitByLesson };
  }

  /**
   * 汇总一批档案。
   * @param {Array} docs 学生导出的 JSON 数组（可含 summary 为空的老档案）
   * @param {Object} [courseMap] 可选：window.COURSE_MAP，用来给课次补标题
   * @returns {Object} 统计结果
   */
  function aggregate(docs, courseMap) {
    docs = Array.isArray(docs) ? docs : [];
    var students = docs.map(norm);

    /* sid 去重：同一份档案被重复拖进来只算一个人 */
    var seen = {}, uniq = [];
    students.forEach(function (s) {
      var key = s.sid || ("_" + uniq.length);
      if (seen[key]) return;
      seen[key] = 1; uniq.push(s);
    });

    var lessonTitle = {};
    try {
      var mods = (courseMap && courseMap.modules) || [];
      mods.forEach(function (m) {
        (m.lessons || []).forEach(function (l) { if (l && l.no) lessonTitle[num(l.no, 0)] = l.title || ""; });
      });
    } catch (e) {}

    var byLesson = {};        // no -> 统计桶
    var totalVisits = 0, totalDwell = 0;

    uniq.forEach(function (s) {
      var d = derive(s);
      var hits = s.pageHits || d.hits;          // 优先用新版 pageHits，缺则从 log 推
      var sess = s.sessionCount || d.sessions;

      var vSum = 0;
      Object.keys(hits).forEach(function (k) { vSum += num(hits[k], 0); });
      /* 老档案连 log 都没有时，用 byLesson 的 visit 次数兜底 */
      if (!vSum) {
        Object.keys(s.byLesson).forEach(function (k) { vSum += num((s.byLesson[k] || {}).visit, 0); });
      }
      s._visits = s.visits || vSum;
      s._sessions = sess;
      totalVisits += s._visits;
      totalDwell += s.totalDwellMs;

      /* 该生各课的访问次数与停留 */
      Object.keys(hits).forEach(function (k) {
        var no = num(k, 0); if (!no) return;
        if (!byLesson[no]) byLesson[no] = newLesson(no);
        byLesson[no].opens += num(hits[k], 0);
      });
      Object.keys(s.byLesson).forEach(function (k) {
        var no = num(k, 0); if (!no) return;
        var b = s.byLesson[k] || {};
        if (!byLesson[no]) byLesson[no] = newLesson(no);
        var bucket = byLesson[no];
        bucket.people += 1;                                  // 这个人学过这课
        bucket.dwell += ms(b.dwell);                         // 累计停留
        bucket.demo += num(b.demo, 0);
        bucket.video += num(b.video, 0);
        bucket.hw += num(b.hw, 0);
        bucket.ask += num(b.ask, 0);
        /* 打开次数：pageHits（若存在）已算过；缺失时用 log 里的 visit 次数补上。
           两者不叠加，避免同一台设备的同一个动作被算两次。 */
        if (!s.pageHits) bucket.opens += num(b.visit, 0);
      });
    });

    var list = Object.keys(byLesson).map(function (k) { return byLesson[k]; }).filter(function (r) { return r.lesson > 0; });
    list.forEach(function (r) {
      r.title = lessonTitle[r.lesson] || "";
      r.avgDwell = r.people ? Math.round(r.dwell / r.people) : 0;
    });

    /* 排序结果（各给一份独立副本，避免调用方互相影响） */
    var byPeople = list.slice().sort(function (a, b) { return b.people - a.people || b.dwell - a.dwell; });
    var byDwell = list.slice().sort(function (a, b) { return b.dwell - a.dwell; });
    var byAvg = list.slice().sort(function (a, b) { return b.avgDwell - a.avgDwell; });
    var byOpens = list.slice().sort(function (a, b) { return b.opens - a.opens; });

    /* 学生排行：谁来得最多、谁停留最久 */
    var topStudents = uniq.slice().sort(function (a, b) { return b.totalDwellMs - a.totalDwellMs; })
      .map(function (s) {
        return { sid: s.sid, name: s.name, visits: s._visits, sessions: s._sessions,
          dwell: s.totalDwellMs, lessons: s.lessonsVisited };
      });

    return {
      people: uniq.length,
      totalVisits: totalVisits,
      avgVisits: uniq.length ? Math.round(totalVisits / uniq.length * 10) / 10 : 0,
      totalDwellMs: totalDwell,
      avgDwellMs: uniq.length ? Math.round(totalDwell / uniq.length) : 0,
      lessonsTouched: list.length,
      byLesson: list,
      rank: { people: byPeople, dwell: byDwell, avg: byAvg, opens: byOpens },
      students: uniq.map(function (s) {
        return { sid: s.sid, name: s.name, visits: s._visits, sessions: s._sessions,
          dwell: s.totalDwellMs, lessons: s.lessonsVisited, quizAvg: s.quizAvg,
          ask: s.askCount, demo: s.demoRuns, hw: s.hwOpened,
          firstVisitAt: s.firstVisitAt, lastVisitAt: s.lastVisitAt };
      }).sort(function (a, b) { return b.dwell - a.dwell; }),
      topStudents: topStudents
    };
  }

  function newLesson(no) {
    return { lesson: no, title: "", people: 0, opens: 0, dwell: 0, avgDwell: 0, demo: 0, video: 0, hw: 0, ask: 0 };
  }

  function fmtMs(v) {
    var s = Math.round(ms(v) / 1000);
    if (s < 60) return s + " 秒";
    var m = Math.floor(s / 60);
    if (m < 60) return m + " 分 " + (s % 60) + " 秒";
    return Math.floor(m / 60) + " 小时 " + (m % 60) + " 分";
  }

  function fmtDate(t) {
    if (!t) return "—";
    var d = new Date(t);
    return d.toLocaleString("zh-CN", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  root.VisitStats = { aggregate: aggregate, fmtMs: fmtMs, fmtDate: fmtDate, norm: norm };
})(typeof window !== "undefined" ? window : this);
