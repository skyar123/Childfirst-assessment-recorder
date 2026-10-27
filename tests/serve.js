#!/usr/bin/env node
// Minimal static server for the test suite. The pages are plain HTML, so this
// is all the "build" they need. Serves the repository root.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 8125);
const VENDOR = process.env.VENDOR_DIR ? path.resolve(process.env.VENDOR_DIR) : null;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

function serve() {
  return http
    .createServer((req, res) => {
      const url = decodeURIComponent(req.url.split("?")[0]);
      const rel = url.replace(/^\/+/, "");
      const file = url.startsWith("/__vendor/")
        ? path.join(VENDOR || "", path.basename(url))
        : path.join(ROOT, rel || "index.html");
      if (url.startsWith("/__vendor/") && !VENDOR) {
        res.writeHead(404);
        res.end("no vendor dir");
        return;
      }
      if (!file.startsWith(ROOT) && !(VENDOR && file.startsWith(path.resolve(VENDOR)))) {
        res.writeHead(403);
        res.end("forbidden");
        return;
      }
      fs.readFile(file, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("not found");
          return;
        }
        let body = data;
        // Offline mode. The pages load React, Babel and Tailwind from CDNs;
        // point them at local copies when VENDOR_DIR is set, so the suite runs
        // on a machine or runner without outbound network.
        if (VENDOR && path.extname(file) === ".html") {
          body = Buffer.from(
            data
              .toString("utf8")
              .replace(/https:\/\/unpkg\.com\/react@[^"']+/g, "/__vendor/react.js")
              .replace(/https:\/\/unpkg\.com\/react-dom@[^"']+/g, "/__vendor/react-dom.js")
              .replace(/https:\/\/unpkg\.com\/@babel\/standalone@[^"']+/g, "/__vendor/babel.js")
              .replace(/https:\/\/cdn\.tailwindcss\.com/g, "/__vendor/tailwind.js")
              .replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/g, "")
          );
        }
        res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
        res.end(body);
      });
    })
    .listen(PORT, "127.0.0.1");
}

module.exports = { serve, PORT, ROOT };

if (require.main === module) {
  serve();
  console.log("serving " + ROOT + " on http://127.0.0.1:" + PORT);
}
