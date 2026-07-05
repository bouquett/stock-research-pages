import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("pages workflow enables GitHub Pages on fresh repositories", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/pages.yml", import.meta.url),
    "utf8",
  );

  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /enablement:\s*true/);
});
