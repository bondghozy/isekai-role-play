const { app, BrowserWindow } = require("electron");
const { startServer } = require("./server");

app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
let localServer;

async function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "Isekai Role Play",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, backgroundThrottling: false }
  });
  await window.loadURL("http://127.0.0.1:4173");
}

app.whenReady().then(async () => {
  localServer = await startServer({ port: 4173, host: "0.0.0.0" });
  await createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) void createWindow(); });
});

app.on("before-quit", () => localServer?.server.close());
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
