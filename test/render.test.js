import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("index includes required report mount points", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /id="generated-at"/);
  assert.match(html, /id="trade-date"/);
  assert.match(html, /id="run-now"/);
  assert.match(html, /bouquett\/stock-research-engine\/actions\/workflows\/morning-research\.yml/);
  assert.match(html, /data-batch-option="now"/);
  assert.match(html, /data-batch-option="0830"/);
  assert.match(html, /id="themes"/);
  assert.match(html, /id="candidates"/);
  assert.match(html, /id="warnings"/);
  assert.match(html, /src="\.\/src\/app\.js"/);
});
