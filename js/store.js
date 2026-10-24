/* =========================================================
 * FILM GAZETTE · localStorage 持久化层
 * - 首次打开：写入 DEFAULT_MOVIES 种子数据
 * - 之后以 localStorage 中的用户数据为准，不再用种子覆盖
 * - 解析失败：备份损坏数据，回退到种子数据，保证页面可用
 * =======================================================*/

const Store = {
  KEY: "filmGazette.movies.v1",
  CORRUPT_KEY: "filmGazette.movies.corrupt.v1",

  /** true = 检测到存档损坏，当前展示的是内存中的种子数据（未写回） */
  degraded: false,

  seed() {
    return DEFAULT_MOVIES.map(m => ({ ...m }));
  },

  /** 读取电影列表；任何异常都回退到种子数据，不抛出错误 */
  load() {
    this.degraded = false;
    let raw = null;
    try {
      raw = localStorage.getItem(this.KEY);
    } catch (e) {
      // 隐私模式等场景 localStorage 不可用时，仅用内存数据
      return this.seed();
    }

    // 首次打开：写入种子数据
    if (raw === null) {
      const data = this.seed();
      this.save(data);
      return data;
    }

    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error("not an array");
      // 过滤掉缺 id / 片名的脏数据，避免渲染崩溃
      return data.filter(m => m && typeof m.id === "string" && typeof m.titleCN === "string");
    } catch (e) {
      // 数据损坏：备份原文（不覆盖已有备份），仅在内存中回退种子，
      // 不写回 KEY，不静默覆盖用户数据；由页面提示用户决定如何处理
      this.degraded = true;
      try {
        if (localStorage.getItem(this.CORRUPT_KEY) === null) {
          localStorage.setItem(this.CORRUPT_KEY, raw);
        }
      } catch (_) {}
      return this.seed();
    }
  },

  /** 保存；失败（如超出配额）时静默降级，不打断当前操作 */
  save(movies) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(movies));
    } catch (e) { /* 忽略写入失败 */ }
  },

  /** 用户主动重置：写入种子数据并清除损坏备份 */
  reset() {
    const data = this.seed();
    try { localStorage.removeItem(this.CORRUPT_KEY); } catch (_) {}
    this.save(data);
    this.degraded = false;
    return data;
  },

  /** 损坏备份的原始内容（供用户导出/排查），无则返回 null */
  corruptBackup() {
    try { return localStorage.getItem(this.CORRUPT_KEY); } catch (_) { return null; }
  }
};
