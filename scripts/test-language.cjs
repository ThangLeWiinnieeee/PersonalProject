const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

(async () => {
  const root = path.resolve(__dirname, "../dist");
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
    const types = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".svg": "image/svg+xml" };
    res.setHeader("Content-Type", (types[path.extname(file)] || "application/octet-stream") + "; charset=utf-8");
    res.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-language-"));
  const edgePath = process.env.EDGE_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
  const edge = spawn(edgePath, ["--headless=new", "--disable-gpu", "--no-first-run", "--remote-debugging-port=0", "--user-data-dir=" + profile, "about:blank"], { windowsHide: true, stdio: "ignore" });
  let ws;
  try {
    const portFile = path.join(profile, "DevToolsActivePort");
    for (let n = 0; !fs.existsSync(portFile) && n < 100; n++) await new Promise(r => setTimeout(r, 100));
    const port = fs.readFileSync(portFile, "utf8").split("\n")[0];
    const tabs = await (await fetch("http://127.0.0.1:" + port + "/json")).json();
    ws = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
    await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
    let id = 0;
    const pending = new Map();
    ws.addEventListener("message", event => {
      const reply = JSON.parse(event.data);
      if (pending.has(reply.id)) { pending.get(reply.id)(reply); pending.delete(reply.id); }
    });
    async function command(method, params = {}) {
      const next = ++id;
      const result = new Promise(resolve => pending.set(next, resolve));
      ws.send(JSON.stringify({ id: next, method, params }));
      const reply = await result;
      if (reply.error) throw new Error(JSON.stringify(reply.error));
      return reply.result;
    }
    async function evaluate(expression) {
      const result = await command("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    }
    async function ready(expectedPath = "/") {
      for (let n = 0; n < 100; n++) {
        if (await evaluate('location.pathname === ' + JSON.stringify(expectedPath) + ' && document.readyState === "complete" && !!document.querySelector(".language-toggle")')) return;
        await new Promise(r => setTimeout(r, 100));
      }
      throw new Error("Language control did not initialize");
    }
    await command("Page.enable");
    await command("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    // Tests use reduced motion and stub contact submission: never send an email.
    await command("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    await command("Page.navigate", { url: base });
    await ready();
    assert.equal(await evaluate("document.documentElement.lang"), "en");
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".theme-toggle")).viewTransitionName'), "none");
    await evaluate('document.querySelector("#contact-message").value = "Keep this draft"; document.querySelector(".language-toggle").click()');
    assert.equal(await evaluate("document.documentElement.lang"), "vi");
    assert.equal(await evaluate('document.querySelector("#skills h2").textContent'), "Kỹ năng chuyên môn");
    assert.equal(await evaluate('document.querySelector("#about h2").textContent'), "Xây dựng từ giao diện đến trí tuệ.");
    assert.equal(await evaluate('document.querySelector("#dynamic-role").textContent'), "Lập trình viên Full-stack");
    assert.match(await evaluate('document.querySelector("[data-experience-start]").textContent'), /tháng/);
    assert.equal(await evaluate('document.querySelector("#contact-message").value'), "Keep this draft");
    await evaluate('document.querySelector(".theme-toggle").click()');
    assert.match(await evaluate('document.querySelector(".theme-label").textContent'), /Giao diện/);
    const theme = await evaluate("document.documentElement.dataset.theme");
    await command("Page.reload");
    await ready();
    assert.equal(await evaluate("document.documentElement.lang"), "vi");
    assert.equal(await evaluate("document.documentElement.dataset.theme"), theme);
    await evaluate('document.querySelector("#contact-email").value="test@example.com"; window.fetch=async()=>({ok:true,json:async()=>({success:true})}); document.querySelector("#contact-message").value="Local test"; document.querySelector(".contact-form").requestSubmit()');
    assert.equal(await evaluate('document.querySelector(".contact-success").hidden'), false);
    assert.equal(await evaluate('document.querySelector(".contact-success h3").textContent'), "Đã gửi lời nhắn!");
    await evaluate('document.querySelector(".language-toggle").click()');
    assert.equal(await evaluate('document.querySelector(".contact-success h3").textContent'), "Message sent!");
    await evaluate('document.querySelector(".language-toggle").click()');
    for (const page of ["web-tutor-center", "wedding-service", "pharmacy-management"]) {
      await command("Page.navigate", { url: base + "/projects/" + page + ".html" });
      await ready("/projects/" + page + ".html");
      assert.equal(await evaluate("document.documentElement.lang"), "vi");
      assert.equal(await evaluate('document.querySelector(".case-study h2").textContent'), "Giới thiệu dự án");
      await evaluate('document.querySelector(".language-toggle").click()');
      assert.equal(await evaluate('document.querySelector(".case-study h2").textContent'), "The project");
      const missing = await evaluate(`(() => {
        const walker = document.createTreeWalker(document.querySelector("main"), NodeFilter.SHOW_TEXT);
        const missing = [];
        while(walker.nextNode()) {
          const text = walker.currentNode.nodeValue.trim();
          if(text.split(/\\s+/).length > 6 && !Object.hasOwn(window.portfolioVietnamese, text)) missing.push(text);
        }
        return missing;
      })()`);
      assert.deepEqual(missing, [], "Missing project translations: " + page);
      await evaluate('document.querySelector(".language-toggle").click()');
    }
    await command("Page.navigate", { url: base });
    await ready();
    const report = [];
    for (const width of [1440, 1100, 768, 390, 320]) {
      await command("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
      const bounds = await evaluate('({width:innerWidth, scroll:document.documentElement.scrollWidth, header:document.querySelector(".site-header").getBoundingClientRect().height})');
      report.push(bounds);
      assert.ok(bounds.scroll <= width + 1, JSON.stringify(bounds));
      if (width >= 641) {
        const navOffset = await evaluate('Math.abs((document.querySelector("#main-nav").getBoundingClientRect().left + document.querySelector("#main-nav").getBoundingClientRect().width / 2) - document.documentElement.clientWidth / 2)');
        assert.ok(navOffset < 2, "Navigation is not centered: " + navOffset);
      }
      if (width === 390) {
        const shot = await command("Page.captureScreenshot", { format: "png" });
        const screenshot = path.join(profile, "home-vi-mobile.png");
        fs.writeFileSync(screenshot, Buffer.from(shot.data, "base64"));
        console.log("Screenshot: " + screenshot);
      }
    }
    console.log("PASS: EN/VI, role, duration, saved language/theme, form draft, mocked success, all project pages, responsive widths.");
    console.log(JSON.stringify(report));
  } finally {
    ws?.close();
    edge.kill();
    server.close();
    // Keep the isolated profile in the OS temp folder; no user browser data is touched.
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
