import test from "node:test";
import assert from "node:assert/strict";

import { batchLabel, formatAmount, formatDateTime, summarizeDiff } from "../src/format.js";

test("batchLabel formats known batches", () => {
  assert.equal(batchLabel("now"), "立即启动");
  assert.equal(batchLabel("0830"), "08:30 初版");
  assert.equal(batchLabel("0900"), "09:00 刷新版");
});

test("formatAmount uses Chinese units", () => {
  assert.equal(formatAmount(123456789), "1.23亿");
  assert.equal(formatAmount(1234567), "123.46万");
});

test("formatDateTime trims timezone and fractional seconds", () => {
  assert.equal(formatDateTime("2026-07-05T22:04:08.243441+08:00"), "2026-07-05 22:04:08");
});

test("summarizeDiff detects added and removed candidates", () => {
  const previous = { candidates: [{ code: "300750", name: "宁德时代" }] };
  const latest = { candidates: [{ code: "688981", name: "中芯国际" }] };

  const diff = summarizeDiff(previous, latest);

  assert.deepEqual(diff.added, ["中芯国际"]);
  assert.deepEqual(diff.removed, ["宁德时代"]);
});
