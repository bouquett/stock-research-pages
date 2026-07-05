import { renderReport, renderReportError } from "./render.js";

async function loadLatest() {
  const response = await fetch("./data/latest.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`latest.json 读取失败：${response.status}`);
  }
  return response.json();
}

try {
  const report = await loadLatest();
  renderReport(report);
} catch (error) {
  renderReportError(error);
}
