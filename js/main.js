/* =========================================================
 * FILM GAZETTE · 渲染与交互
 * 数据来源：Store.load()（localStorage，首次为种子数据）
 * 栏目派生规则：
 *   最近看过 = status 已看，按观影日期倒序
 *   待看清单 = status 想看
 *   我的精选 = favorite === true，按评分倒序
 *   观影手记 = 已看且有短评或台词的电影（与电影一一关联）
 * =======================================================*/

"use strict";

let MOVIES = Store.load();
let confirmCallback = null;

const $ = s => document.querySelector(s);

/* ---------- 工具 ---------- */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function uid() {
  return "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayISO() {
  const t = new Date();
  const p = n => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
}

function fmtMD(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  return parts.length === 3 ? `${parts[1]}.${parts[2]}` : "";
}

function weekdayCN(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return "";
  return "周" + "日一二三四五六"[d.getDay()];
}

const isWatched = m => m.status === "已看";
const findMovie = id => MOVIES.find(m => m.id === id);
const byWatchDateDesc = (a, b) =>
  (b.watchDate || b.createdAt || "").localeCompare(a.watchDate || a.createdAt || "");

function starsHTML(score) {
  const n = Number(score) / 2;
  if (!n) return "";
  let s = "";
  for (let i = 1; i <= 5; i++) {
    if (n >= i) s += "★";
    else if (n >= i - 0.5) s += "⯨";
    else s += "☆";
  }
  return `<span class="stars">${s}</span>`;
}

function figureHTML(src, caption, cls) {
  return `
    <figure class="ph ${cls || ""}">
      <img src="${src}" alt="${esc(caption) || "电影剧照"}"
           onerror="this.closest('.ph').classList.add('ph--broken');this.remove()">
      ${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}
    </figure>`;
}

/* 无海报时的纯 CSS 占位图 */
function figureFor(m, cls) {
  if (m.image) return figureHTML(m.image, "", cls);
  return `
    <figure class="ph ${cls || ""} ph--empty">
      <span class="ph-empty-tag">FILM GAZETTE</span>
      <span class="ph-empty-title">${esc(m.titleCN)}</span>
    </figure>`;
}

function statusLabel(m) {
  if (!isWatched(m)) return "想看";
  const d = fmtMD(m.watchDate);
  return d ? `已看 ${d}` : "已看";
}

/* ---------- 报头 ---------- */
function renderMasthead() {
  const d = new Date();
  const week = "日一二三四五六"[d.getDay()];
  $("#mastheadDate").textContent =
    `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 星期${week}`;
  $("#mastheadIssue").textContent = `${GAZETTE.volume} · ${GAZETTE.issue}`;
  $("#mastheadCount").textContent = MOVIES.length + 1; // +1 = 本期主打
}

/* ---------- 本期主打（静态编辑内容） ---------- */
function renderFeature() {
  const f = FEATURED;
  $("#feature").innerHTML = `
    <div class="feature-figure">
      <p class="sec-en feature-kicker">${f.kicker}</p>
      ${figureHTML(f.image, f.caption, "ph--feature")}
      <div class="stamp" aria-label="评分 ${f.rating}">
        <span class="stamp-num">${f.rating}</span>
        <span class="stamp-label">GAZETTE<br>RATED</span>
      </div>
    </div>
    <div class="feature-body">
      <p class="feature-meta mono">${f.year} · 导演 ${f.director} · ${f.status}</p>
      <h2 class="feature-title">
        ${f.titleCN}
        <span class="feature-title-en">${f.titleEN}</span>
      </h2>
      <p class="dropcap">${f.review}</p>
      <p class="feature-extra">${f.reviewExtra}</p>
      <p class="feature-action">
        <a class="btn-record" href="#journal">${f.cta}</a>
        <span class="feature-footnote">† 收录于第 ${GAZETTE.issue.replace("NO. ", "")} 期编辑手记</span>
      </p>
    </div>`;
}

/* ---------- 电影档案 ---------- */
function actionsHTML(m) {
  return `
    <p class="ink-actions mono">
      <button type="button" data-action="edit" data-id="${m.id}">修订</button>
      <button type="button" data-action="toggle" data-id="${m.id}">${isWatched(m) ? "移回待看" : "标记已看"}</button>
      <button type="button" data-action="del" data-id="${m.id}">撤下</button>
    </p>`;
}

function rateHTML(m) {
  if (m.score === "" || m.score == null) return "";
  return `<p class="rate">${starsHTML(m.score)}<b class="score">${esc(m.score)}</b></p>`;
}

function itemPoster(m, big) {
  return `
    <article class="item ${big ? "item--poster" : "item--mini"}">
      ${figureFor(m, big ? "ph--poster" : "ph--thumb")}
      <div class="item-body">
        <h4>${esc(m.titleCN)} <span class="en">${esc(m.titleEN)}</span></h4>
        <p class="meta mono">${esc(m.year)} · ${esc(m.director)}</p>
        <div class="rate-line">${rateHTML(m)}<span class="tag tag--done">${statusLabel(m)}</span></div>
        <p class="note">${esc(m.note)}</p>
        ${actionsHTML(m)}
      </div>
    </article>`;
}

function itemList(m, i) {
  const no = String(i + 1).padStart(2, "0");
  return `
    <article class="item item--list">
      <span class="item-no">${no}</span>
      ${figureFor(m, "ph--thumb")}
      <div class="item-body">
        <h4>${esc(m.titleCN)} <span class="en">${esc(m.titleEN)}</span></h4>
        <p class="meta mono">${m.year || "——"} · ${esc(m.director) || "导演不详"}</p>
        <p class="note">${esc(m.note)}</p>
        ${actionsHTML(m)}
      </div>
      <span class="tag tag--want">${statusLabel(m)}</span>
    </article>`;
}

function itemRank(m, i) {
  return `
    <article class="item item--rank">
      <span class="item-rank">${["I", "II", "III"][i] || i + 1}</span>
      ${figureFor(m, "ph--poster")}
      <div class="item-body">
        <h4>${esc(m.titleCN)} <span class="en">${esc(m.titleEN)}</span></h4>
        <p class="meta mono">${esc(m.year)} · ${esc(m.director)} · ${statusLabel(m)}</p>
        ${rateHTML(m)}
        <p class="note">${esc(m.note)}</p>
        ${actionsHTML(m)}
      </div>
    </article>`;
}

const COLUMNS = [
  {
    key: "recent", labelCN: "最近看过", labelEN: "RECENTLY WATCHED", layout: "poster",
    pick: ms => ms.filter(isWatched).sort(byWatchDateDesc)
  },
  {
    key: "watchlist", labelCN: "待看清单", labelEN: "THE WATCHLIST", layout: "list",
    pick: ms => ms.filter(m => !isWatched(m))
  },
  {
    key: "favorites", labelCN: "我的精选", labelEN: "EDITOR'S CHOICE", layout: "rank",
    pick: ms => ms.filter(m => m.favorite).sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
  }
];

function emptyHintHTML(text) {
  return `<p class="empty-hint">—— ${text} ——</p>`;
}

function renderArchive() {
  $("#archiveGrid").innerHTML = COLUMNS.map(col => {
    const list = col.pick(MOVIES);
    let items = "";
    if (!list.length) {
      items = emptyHintHTML("本栏暂无收录，可在「新增电影」中补充");
    } else if (col.layout === "poster") {
      items = list.map((m, i) => itemPoster(m, i === 0)).join("");
    } else if (col.layout === "list") {
      items = list.map((m, i) => itemList(m, i)).join("");
    } else {
      items = list.map((m, i) => itemRank(m, i)).join("");
    }
    return `
      <div class="archive-col archive-col--${col.key}">
        <header class="col-head">
          <p class="sec-en">${col.labelEN}</p>
          <h3>${col.labelCN}</h3>
        </header>
        ${items}
      </div>`;
  }).join("");
}

/* ---------- 观影手记（派生自已看电影的短评与台词） ---------- */
function renderJournal() {
  const notes = MOVIES
    .filter(m => isWatched(m) && ((m.note || "").trim() || (m.quote || "").trim()))
    .sort(byWatchDateDesc);

  $("#journalList").innerHTML = notes.length ? notes.map((m, i) => `
    <article class="journal-entry">
      <div class="journal-date">
        <span class="jd-day mono">${fmtMD(m.watchDate) || "——"}</span>
        <span class="jd-week">${m.watchDate ? weekdayCN(m.watchDate) : ""}</span>
        <span class="jd-no mono">NOTE ${String(i + 1).padStart(2, "0")}</span>
      </div>
      <div class="journal-body">
        <h4>《${esc(m.titleCN)}》<span class="en">${esc(m.titleEN)}</span></h4>
        ${m.note ? `<p>${esc(m.note)}</p>` : ""}
        ${m.quote ? `
          <blockquote>
            <p>“${esc(m.quote)}”</p>
            ${m.quoteFrom ? `<cite>${esc(m.quoteFrom)}</cite>` : ""}
          </blockquote>` : ""}
        <p class="ink-actions mono">
          <button type="button" data-action="edit" data-id="${m.id}">修订本条</button>
          <button type="button" data-action="clear-note" data-id="${m.id}">删除本条</button>
        </p>
      </div>
    </article>`).join("")
  : `<p class="empty-hint empty-hint--wide">暂无线手记 —— 为一部已看的电影写下短评或台词，即可生成第一篇手记。</p>`;
}

/* ---------- 弹窗 ---------- */
const movieModal = () => $("#movieModal");
const confirmModal = () => $("#confirmModal");

function openModal(el) {
  el.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModals() {
  movieModal().hidden = true;
  confirmModal().hidden = true;
  document.body.style.overflow = "";
  confirmCallback = null;
}

function openConfirm(title, text, onConfirm) {
  $("#confirmTitle").textContent = title;
  $("#confirmText").textContent = text;
  confirmCallback = onConfirm;
  openModal(confirmModal());
}

/* ---------- 电影表单 ---------- */
const form = () => $("#movieForm");

function syncWatchDateRow() {
  const watched = form().elements.status.value === "已看";
  const row = $("#watchDateField");
  row.classList.toggle("is-hidden", !watched);
  const input = form().elements.watchDate;
  input.disabled = !watched;
  if (watched && !input.value) input.value = todayISO();
}

function showFormError(msg) {
  const el = $("#formError");
  el.textContent = msg;
  el.hidden = false;
}

function openMovieForm(id) {
  const f = form();
  f.reset();
  $("#formError").hidden = true;
  const m = id ? findMovie(id) : null;

  $("#movieModalKicker").textContent = m ? "REVISE · 修订档案" : "NEW ENTRY · 收录新片";
  $("#movieModalTitle").textContent = m ? `修订《${m.titleCN}》` : "新增电影";

  f.elements.movieId.value = m ? m.id : "";
  if (m) {
    f.elements.titleCN.value = m.titleCN || "";
    f.elements.titleEN.value = m.titleEN || "";
    f.elements.year.value = m.year || "";
    f.elements.director.value = m.director || "";
    f.elements.status.value = m.status === "想看" ? "想看" : "已看";
    f.elements.score.value = m.score === "" || m.score == null ? "" : m.score;
    f.elements.watchDate.value = m.watchDate || "";
    f.elements.note.value = m.note || "";
    f.elements.quote.value = m.quote || "";
    f.elements.quoteFrom.value = m.quoteFrom || "";
    f.elements.favorite.checked = !!m.favorite;
  }
  syncWatchDateRow();
  openModal(movieModal());
  f.elements.titleCN.focus();
}

function validateMovie(d) {
  if (!d.titleCN) return "请填写电影名称（必填）。";
  if (d.year && (d.year < 1888 || d.year > 2100)) return "上映年份需在 1888–2100 之间。";
  if (d.score !== "" && (isNaN(Number(d.score)) || Number(d.score) < 0 || Number(d.score) > 10))
    return "个人评分需在 0–10 之间。";
  return "";
}

function submitMovie(e) {
  e.preventDefault();
  const el = form().elements;
  const status = el.status.value === "想看" ? "想看" : "已看";
  const data = {
    titleCN: el.titleCN.value.trim(),
    titleEN: el.titleEN.value.trim(),
    year: el.year.value ? Number(el.year.value) : "",
    director: el.director.value.trim(),
    status,
    score: el.score.value === "" ? "" : Number(el.score.value),
    watchDate: status === "已看" ? (el.watchDate.value || todayISO()) : "",
    note: el.note.value.trim(),
    quote: el.quote.value.trim(),
    quoteFrom: el.quoteFrom.value.trim(),
    favorite: el.favorite.checked
  };

  const err = validateMovie(data);
  if (err) { showFormError(err); return; }

  const id = el.movieId.value;
  if (id) {
    // 编辑：原地更新，保留 id / image / createdAt
    const m = findMovie(id);
    if (!m) { showFormError("未找到该电影，可能已被撤下。"); return; }
    Object.assign(m, data);
  } else {
    MOVIES.push({ id: uid(), image: "", createdAt: new Date().toISOString(), ...data });
  }
  Store.save(MOVIES);
  closeModals();
  renderAll();
}

/* ---------- 操作 ---------- */
function toggleStatus(id) {
  const m = findMovie(id);
  if (!m) return;
  m.status = isWatched(m) ? "想看" : "已看";
  if (isWatched(m) && !m.watchDate) m.watchDate = todayISO();
  Store.save(MOVIES);
  renderAll();
}

function deleteMovie(id) {
  const m = findMovie(id);
  if (!m) return;
  openConfirm("撤下档案",
    `确认将《${m.titleCN}》从档案中撤下？其观影手记将一并移除。`,
    () => {
      MOVIES = MOVIES.filter(x => x.id !== id);
      Store.save(MOVIES);
      renderAll();
    });
}

function clearNote(id) {
  const m = findMovie(id);
  if (!m) return;
  openConfirm("删除手记",
    `确认删除《${m.titleCN}》的这条手记？电影档案仍会保留。`,
    () => {
      m.note = "";
      m.quote = "";
      m.quoteFrom = "";
      Store.save(MOVIES);
      renderAll();
    });
}

/* ---------- 存档异常提示 ---------- */
function renderNotice() {
  $("#noticeBar").hidden = !Store.degraded;
}

/* ---------- 事件绑定 ---------- */
document.addEventListener("click", e => {
  const actBtn = e.target.closest("[data-action]");
  if (actBtn) {
    const { action, id } = actBtn.dataset;
    if (action === "edit") openMovieForm(id);
    else if (action === "toggle") toggleStatus(id);
    else if (action === "del") deleteMovie(id);
    else if (action === "clear-note") clearNote(id);
    return;
  }
  if (e.target.closest("[data-close]")) { closeModals(); return; }
  if (e.target.classList && e.target.classList.contains("modal")) closeModals();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModals();
});

/* ---------- 启动 ---------- */
function renderAll() {
  renderMasthead();
  renderFeature();
  renderArchive();
  renderJournal();
}

$("#btnAddMovie").addEventListener("click", () => openMovieForm());
form().addEventListener("submit", submitMovie);
form().addEventListener("change", e => {
  if (e.target.name === "status") syncWatchDateRow();
});
$("#confirmYes").addEventListener("click", () => {
  const cb = confirmCallback;
  closeModals();
  if (cb) cb();
});
$("#btnResetData").addEventListener("click", () => {
  openConfirm("重置存档",
    "将清除当前存档（含损坏备份）并恢复为示例数据。此操作不可撤销，确认继续？",
    () => {
      MOVIES = Store.reset();
      $("#noticeBar").hidden = true;
      renderAll();
    });
});
$("#btnDismissNotice").addEventListener("click", () => {
  $("#noticeBar").hidden = true;
});

renderNotice();
renderAll();
