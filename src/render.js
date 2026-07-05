import {
  batchLabel,
  formatAmount,
  formatDateTime,
  formatPercent,
  formatScore,
  moveClass,
} from "./format.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function itemText(item) {
  if (typeof item === "string") return item;
  return item?.text || "";
}

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function safeHttpUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function evidenceLink(item) {
  const text = escapeHtml(itemText(item));
  const href = safeHttpUrl(item?.url);
  if (!href) return `<span>${text}</span>`;
  return `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${text}</a>`;
}

function renderSparkline(candidates) {
  const scores = normalizeList(candidates)
    .map((item) => Number(item.score || 0))
    .filter((score) => Number.isFinite(score));
  if (scores.length < 2) {
    return '<span class="sparkline-empty">暂无曲线</span>';
  }
  const width = 160;
  const height = 44;
  const points = scores
    .map((score, index) => {
      const x = (index / Math.max(scores.length - 1, 1)) * width;
      const y = height - 8 - (Math.max(0, Math.min(score, 100)) / 100) * 30;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="候选股票综合强度曲线">
      <polyline class="sparkline-grid" points="0,34 ${width},34" />
      <polyline class="sparkline-line" points="${points}" />
    </svg>
  `;
}

function statusLabel(status) {
  if (status === "ok") return "正常";
  if (status === "insufficient_data") return "样本不足";
  return status || "未知";
}

function renderThemes(themes) {
  if (!themes.length) {
    return '<p class="empty-state">暂无主题结果</p>';
  }
  return themes
    .slice(0, 6)
    .map((theme, index) => {
      const signals = normalizeList(theme.signals).slice(0, 2);
      return `
        <article class="theme-card ${index === 0 ? "is-selected" : ""}">
          <div class="theme-card-header">
            <div>
              <span class="rank">${index + 1}</span>
              <h3>${escapeHtml(theme.name)}</h3>
            </div>
            <strong>${formatScore(theme.score)}</strong>
          </div>
          <p>${escapeHtml(theme.summary || "暂无主题摘要")}</p>
          <div class="signal-copy">
            <span>触发信号</span>
            ${signals.map((signal) => `<p>${escapeHtml(signal)}</p>`).join("") || "<p>暂无触发信号</p>"}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSnapshot(snapshot = {}) {
  const pctChange = Number(snapshot.pct_change || 0);
  return `
    <div class="snapshot-grid">
      <span class="${moveClass(pctChange)}">涨跌幅 ${formatPercent(pctChange)}</span>
      <span>成交额 ${formatAmount(snapshot.amount)}</span>
      <span>换手 ${formatPercent(snapshot.turnover_rate)}</span>
      <span>量比 ${Number(snapshot.volume_ratio || 0).toFixed(2)}</span>
    </div>
  `;
}

function renderCandidateRow(candidate, index) {
  const themes = normalizeList(candidate.themes).map(escapeHtml).join(" / ") || "未归类";
  const evidence = normalizeList(candidate.evidence).slice(0, 3);
  const risks = normalizeList(candidate.risks).slice(0, 3);
  const signal = evidence[0]?.text || candidate.reason || "暂无触发信号";

  return `
    <tr>
      <td data-label="代码/名称">
        <div class="stock-id">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>${escapeHtml(candidate.name)}</strong>
            <small>${escapeHtml(candidate.code)}</small>
          </div>
        </div>
      </td>
      <td data-label="市场">${escapeHtml(candidate.market || "未知")}</td>
      <td data-label="所属主题">${themes}</td>
      <td data-label="综合强度"><strong class="score">${formatScore(candidate.score)}</strong></td>
      <td data-label="行情快照">${renderSnapshot(candidate.snapshot)}</td>
      <td data-label="触发信号">
        <ol class="signal-list">
          <li>${escapeHtml(signal)}</li>
          <li>${escapeHtml(candidate.reason || "等待更多验证")}</li>
        </ol>
      </td>
      <td data-label="证据与风险">
        <details>
          <summary>证据与风险</summary>
          <h4>证据</h4>
          <ul>${evidence.map((item) => `<li>${evidenceLink(item)}</li>`).join("") || "<li>暂无证据</li>"}</ul>
          <h4>风险</h4>
          <ul>${risks.map((item) => `<li>${escapeHtml(itemText(item))}</li>`).join("") || "<li>暂无风险</li>"}</ul>
        </details>
      </td>
    </tr>
  `;
}

function renderCandidates(candidates) {
  if (!candidates.length) {
    return '<tr><td colspan="7"><p class="empty-state">暂无候选股票</p></td></tr>';
  }
  return candidates.slice(0, 10).map(renderCandidateRow).join("");
}

export function renderReport(report, root = document) {
  const meta = report?.meta || {};
  const themes = normalizeList(report?.themes);
  const candidates = normalizeList(report?.candidates);
  const warnings = normalizeList(report?.warnings);

  root.querySelector("#generated-at").textContent = formatDateTime(meta.generated_at);
  root.querySelector("#trade-date").textContent = meta.trade_date || "未知交易日";
  root.querySelector("#data-status").textContent = statusLabel(meta.data_status);
  root.querySelector("#status-note").textContent = `${batchLabel(meta.batch)} · ${formatDateTime(meta.generated_at)}`;
  root.querySelector("#theme-count").textContent = String(themes.length);
  root.querySelector("#candidate-count").textContent = String(candidates.length);
  root.querySelector("#score-sparkline").innerHTML = renderSparkline(candidates);
  root.querySelector("#themes").innerHTML = renderThemes(themes);
  root.querySelector("#candidates").innerHTML = renderCandidates(candidates);
  root.querySelector("#candidate-summary").textContent = `共 ${candidates.length} 支，按综合强度排序`;
  root.querySelector("#warnings").innerHTML = warnings
    .map((warning) => `<p>${escapeHtml(warning)}</p>`)
    .join("");
  root.querySelector("#disclaimer").textContent = meta.disclaimer || "仅供研究参考，不构成投资建议。";

  root.querySelectorAll("[data-batch-option]").forEach((element) => {
    element.classList.toggle("is-active", element.dataset.batchOption === meta.batch);
  });
}

export function renderReportError(error, root = document) {
  root.querySelector("#warnings").innerHTML = `<p>最新报告读取失败：${escapeHtml(error?.message || error)}</p>`;
  root.querySelector("#data-status").textContent = "读取失败";
  root.querySelector("#status-note").textContent = "请稍后刷新";
}
