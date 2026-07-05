export function batchLabel(batch) {
  if (batch === "now") return "立即启动";
  if (batch === "0830") return "08:30 初版";
  if (batch === "0900") return "09:00 刷新版";
  return batch || "未知批次";
}

export function formatAmount(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "0";
  if (Math.abs(amount) >= 100000000) return `${(amount / 100000000).toFixed(2)}亿`;
  if (Math.abs(amount) >= 10000) return `${(amount / 10000).toFixed(2)}万`;
  return amount.toFixed(0);
}

export function formatDateTime(value) {
  if (!value) return "未知时间";
  return String(value).replace("T", " ").replace(/\.\d+/, "").replace(/\+.*$/, "");
}

export function formatPercent(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return "0.00%";
  return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
}

export function formatScore(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return "0";
  return number.toFixed(number % 1 === 0 ? 0 : 1);
}

export function moveClass(value) {
  const number = Number(value || 0);
  if (number > 0) return "is-up";
  if (number < 0) return "is-down";
  return "is-flat";
}

export function summarizeDiff(previous, latest) {
  const previousByCode = new Map((previous?.candidates || []).map((item) => [item.code, item]));
  const latestByCode = new Map((latest?.candidates || []).map((item) => [item.code, item]));
  const added = [...latestByCode.values()]
    .filter((item) => !previousByCode.has(item.code))
    .map((item) => item.name);
  const removed = [...previousByCode.values()]
    .filter((item) => !latestByCode.has(item.code))
    .map((item) => item.name);
  return { added, removed };
}
