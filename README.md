# stock-research-pages

8 点半启动的公开页面。这个仓库只读取已经发布出来的公开 JSON，不保存任何 API key。

## 本地预览

```bash
npm test
python3 -m http.server 4173
```

打开 `http://localhost:4173` 查看页面。

## First release checklist

- `npm test` passes.
- `data/latest.json` follows version 1 of the public report contract.
- The page can be served by GitHub Pages without a server process.
- The page reads only public JSON and does not require login.
