const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const GIFEncoder = require("gif-encoder-2");
const { PNG } = require("pngjs");

function resizeRgba(source, sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const target = Buffer.allocUnsafe(targetWidth * targetHeight * 4);
  for (let y = 0; y < targetHeight; y++) {
    const sourceY = Math.min(sourceHeight - 1, Math.floor(y * sourceHeight / targetHeight));
    for (let x = 0; x < targetWidth; x++) {
      const sourceX = Math.min(sourceWidth - 1, Math.floor(x * sourceWidth / targetWidth));
      const sourceOffset = (sourceY * sourceWidth + sourceX) * 4;
      const targetOffset = (y * targetWidth + x) * 4;
      source.copy(target, targetOffset, sourceOffset, sourceOffset + 4);
    }
  }
  return target;
}

(async () => {
  const root = path.resolve(__dirname, "../dist");
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return res.writeHead(404).end();
    const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };
    res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    res.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-readme-"));
  const edgePath = process.env.EDGE_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
  const edge = spawn(edgePath, ["--headless=new", "--disable-gpu", "--no-first-run", "--remote-debugging-port=0", "--user-data-dir=" + profile, "about:blank"], { windowsHide: true, stdio: "ignore" });
  let ws;
  try {
    const portFile = path.join(profile, "DevToolsActivePort");
    for (let attempt = 0; !fs.existsSync(portFile) && attempt < 100; attempt++) await new Promise(resolve => setTimeout(resolve, 100));
    const port = fs.readFileSync(portFile, "utf8").split("\n")[0];
    const tabs = await (await fetch("http://127.0.0.1:" + port + "/json")).json();
    ws = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
    await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));

    let id = 0;
    const pending = new Map();
    ws.addEventListener("message", event => {
      const reply = JSON.parse(event.data);
      if (pending.has(reply.id)) {
        pending.get(reply.id)(reply);
        pending.delete(reply.id);
      }
    });
    async function command(method, params = {}) {
      const commandId = ++id;
      const response = new Promise(resolve => pending.set(commandId, resolve));
      ws.send(JSON.stringify({ id: commandId, method, params }));
      const reply = await response;
      if (reply.error) throw new Error(JSON.stringify(reply.error));
      return reply.result;
    }
    async function evaluate(expression) {
      const result = await command("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    }

    const width = 1366;
    const height = 768;
    const outputWidth = 900;
    const captureScale = outputWidth / width;
    const outputHeight = Math.round(height * captureScale);
    await command("Page.enable");
    await command("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await command("Page.navigate", { url: "http://127.0.0.1:" + server.address().port });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate('document.readyState === "complete" && !!document.querySelector(".portrait img")?.complete')) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    const frameDelay = 200;
    const totalFrames = 40;
    const encoder = new GIFEncoder(outputWidth, outputHeight, "octree", true, totalFrames);
    encoder.setRepeat(0);
    encoder.setThreshold(94);
    encoder.setDelay(frameDelay);
    encoder.start();

    // Reload after the warm-up navigation so fonts and images are cached, then
    // record the real Home entrance and a complete typing/deleting cycle.
    await command("Page.reload");
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        if (await evaluate('document.readyState === "complete" && !!document.querySelector(".portrait img")?.complete')) break;
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    const recordingStartedAt = performance.now();
    for (let index = 0; index < totalFrames; index++) {
      const frame = await command("Page.captureScreenshot", { format: "png", fromSurface: true });
      const image = PNG.sync.read(Buffer.from(frame.data, "base64"));
      if (image.width !== width || image.height !== height) {
        throw new Error(`Unexpected frame size: ${image.width}x${image.height}; expected ${width}x${height}`);
      }
      encoder.addFrame(resizeRgba(image.data, width, height, outputWidth, outputHeight));
      const remaining = recordingStartedAt + (index + 1) * frameDelay - performance.now();
      if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining));
    }
    encoder.finish();
    const outputDirectory = path.resolve(__dirname, "../assets/README");
    fs.mkdirSync(outputDirectory, { recursive: true });
    const output = path.join(outputDirectory, "portfolio-home.gif");
    fs.writeFileSync(output, encoder.out.getData());
    console.log("Generated " + path.relative(path.resolve(__dirname, ".."), output) + " (" + Math.round(fs.statSync(output).size / 1024) + " KB)");
  } finally {
    ws?.close();
    edge.kill();
    server.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
