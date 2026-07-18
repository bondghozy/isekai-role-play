const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");
const { WebSocketServer } = require("ws");

const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".mp3": "audio/mpeg", ".svg": "image/svg+xml" };
const hash = (password, salt) => crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
const cookies = (req) => Object.fromEntries((req.headers.cookie || "").split(";").map(value => value.trim().split("=")).filter(pair => pair.length === 2));

function startServer({ port = Number(process.env.PORT) || 4173, host = process.env.HOST || "0.0.0.0", databasePath = process.env.ISEKAI_DB } = {}) {
  const dbFile = databasePath || path.join(__dirname, "data", "isekai-server.db");
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  const db = new DatabaseSync(dbFile);
  db.exec(`PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS accounts(id INTEGER PRIMARY KEY,email TEXT UNIQUE NOT NULL,username TEXT NOT NULL,password_hash TEXT NOT NULL,password_salt TEXT NOT NULL,user_json TEXT NOT NULL,updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,account_id INTEGER NOT NULL,created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY,sender_id INTEGER NOT NULL,recipient_id INTEGER NOT NULL,body TEXT NOT NULL,sent_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS friendships(user_one INTEGER NOT NULL,user_two INTEGER NOT NULL,created_at TEXT NOT NULL,UNIQUE(user_one,user_two));
    CREATE TABLE IF NOT EXISTS friend_requests(id INTEGER PRIMARY KEY,sender_id INTEGER NOT NULL,recipient_id INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL,UNIQUE(sender_id,recipient_id));`);
  try { db.exec("ALTER TABLE messages ADD COLUMN media_type TEXT"); } catch (_error) {}
  try { db.exec("ALTER TABLE messages ADD COLUMN media_data TEXT"); } catch (_error) {}
  try { db.exec("ALTER TABLE messages ADD COLUMN read_at TEXT"); } catch (_error) {}
  const clients = new Map();
  const accountFor = (req) => {
    const token = cookies(req).isekai_session;
    return token ? db.prepare("SELECT a.* FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token=?").get(token) : null;
  };
  const json = (res, status, value, headers = {}) => { res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers }); res.end(JSON.stringify(value)); };
  const body = (req) => new Promise((resolve, reject) => { let data = ""; req.on("data", chunk => { data += chunk; if (data.length > 15_000_000) reject(new Error("Payload terlalu besar")); }); req.on("end", () => { try { resolve(data ? JSON.parse(data) : {}); } catch (error) { reject(error); } }); });
  const broadcast = (type, payload = {}) => clients.forEach((_id, socket) => socket.readyState === 1 && socket.send(JSON.stringify({ type, ...payload })));
  const onlineIds = () => new Set(clients.values());
  const friendship = (first, second) => db.prepare("SELECT 1 FROM friendships WHERE user_one=? AND user_two=?").get(Math.min(first, second), Math.max(first, second));

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname.startsWith("/api/")) {
        const user = accountFor(req);
        if (req.method === "POST" && url.pathname === "/api/register") {
          const { user: newUser, password } = await body(req);
          const email = String(newUser?.email || "").trim().toLowerCase();
          const username = String(newUser?.username || "").trim();
          if (!username) return json(res, 400, { ok: false, error: "Nama pengguna wajib diisi." });
          if (!/^\S+@\S+\.\S+$/.test(email)) return json(res, 400, { ok: false, error: "Format email tidak valid." });
          if (!password || password.length < 6) return json(res, 400, { ok: false, error: "Password minimal 6 karakter." });
          if (db.prepare("SELECT id FROM accounts WHERE email=?").get(email)) return json(res, 409, { ok: false, error: "Email sudah terdaftar. Silakan login." });
          newUser.email = email; newUser.username = username;
          const salt = crypto.randomBytes(16).toString("hex"), now = new Date().toISOString();
          const result = db.prepare("INSERT INTO accounts(email,username,password_hash,password_salt,user_json,updated_at) VALUES(?,?,?,?,?,?)").run(email, username, hash(password, salt), salt, JSON.stringify(newUser), now);
          const token = crypto.randomBytes(32).toString("hex"); db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(token, result.lastInsertRowid, now);
          return json(res, 200, { ok: true, user: newUser }, { "Set-Cookie": `isekai_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000` });
        }
        if (req.method === "POST" && url.pathname === "/api/login") {
          const { email, password } = await body(req); const row = db.prepare("SELECT * FROM accounts WHERE email=?").get(String(email).toLowerCase());
          if (!row || hash(password, row.password_salt) !== row.password_hash) return json(res, 401, { ok: false, error: "Email atau password salah." });
          const token = crypto.randomBytes(32).toString("hex"), now = new Date().toISOString(); db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(token, row.id, now); db.prepare("UPDATE accounts SET updated_at=? WHERE id=?").run(now, row.id);
          return json(res, 200, { ok: true, user: JSON.parse(row.user_json) }, { "Set-Cookie": `isekai_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000` });
        }
        if (req.method === "GET" && url.pathname === "/api/session") return json(res, 200, user ? JSON.parse(user.user_json) : null);
        if (!user) return json(res, 401, { error: "Sesi berakhir." });
        if (req.method === "POST" && url.pathname === "/api/save") { const value = await body(req); db.prepare("UPDATE accounts SET username=?,user_json=?,updated_at=? WHERE id=?").run(value.username, JSON.stringify(value), new Date().toISOString(), user.id); broadcast("presence"); return json(res, 200, true); }
        if (req.method === "POST" && url.pathname === "/api/logout") { const token = cookies(req).isekai_session; db.prepare("DELETE FROM sessions WHERE token=?").run(token); return json(res, 200, true, { "Set-Cookie": "isekai_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" }); }
        if (req.method === "DELETE" && url.pathname === "/api/account") { db.prepare("DELETE FROM messages WHERE sender_id=? OR recipient_id=?").run(user.id, user.id); db.prepare("DELETE FROM friend_requests WHERE sender_id=? OR recipient_id=?").run(user.id,user.id); db.prepare("DELETE FROM friendships WHERE user_one=? OR user_two=?").run(user.id,user.id); db.prepare("DELETE FROM sessions WHERE account_id=?").run(user.id); db.prepare("DELETE FROM accounts WHERE id=?").run(user.id); broadcast("presence"); return json(res, 200, true, { "Set-Cookie": "isekai_session=; Path=/; Max-Age=0" }); }
        if (req.method === "GET" && url.pathname === "/api/users") { const online = onlineIds(); return json(res, 200, db.prepare("SELECT id,user_json,updated_at FROM accounts WHERE id<>?").all(user.id).map(row => { const incoming = db.prepare("SELECT 1 FROM friend_requests WHERE sender_id=? AND recipient_id=? AND status='pending'").get(row.id,user.id); const outgoing = db.prepare("SELECT 1 FROM friend_requests WHERE sender_id=? AND recipient_id=? AND status='pending'").get(user.id,row.id); const unreadCount = db.prepare("SELECT COUNT(*) count FROM messages WHERE sender_id=? AND recipient_id=? AND read_at IS NULL").get(row.id,user.id).count; return ({ ...JSON.parse(row.user_json), lastActive: row.updated_at, online: online.has(row.id), unreadCount, friendship: friendship(user.id,row.id) ? "friends" : incoming ? "incoming" : outgoing ? "outgoing" : "none" }); })); }
        if (req.method === "POST" && url.pathname === "/api/friends/request") { const value = await body(req); const recipient = db.prepare("SELECT id FROM accounts WHERE email=?").get(String(value.email || "").toLowerCase()); if (!recipient || recipient.id === user.id || friendship(user.id,recipient.id)) return json(res,400,{ok:false,error:"Permintaan tidak valid."}); const reverse = db.prepare("SELECT id FROM friend_requests WHERE sender_id=? AND recipient_id=? AND status='pending'").get(recipient.id,user.id); if (reverse) { db.prepare("INSERT OR IGNORE INTO friendships(user_one,user_two,created_at) VALUES(?,?,?)").run(Math.min(user.id,recipient.id),Math.max(user.id,recipient.id),new Date().toISOString()); db.prepare("UPDATE friend_requests SET status='accepted' WHERE id=?").run(reverse.id); broadcast("presence"); return json(res,200,{ok:true,accepted:true}); } db.prepare("INSERT INTO friend_requests(sender_id,recipient_id,status,created_at) VALUES(?,?, 'pending',?) ON CONFLICT(sender_id,recipient_id) DO UPDATE SET status='pending',created_at=excluded.created_at").run(user.id,recipient.id,new Date().toISOString()); const senderProfile = JSON.parse(user.user_json); clients.forEach((accountId,peer) => { if (accountId === recipient.id && peer.readyState === 1) peer.send(JSON.stringify({type:"signal",signalType:"friend-request",senderEmail:user.email,senderName:senderProfile.nickname || senderProfile.username,payload:{}})); }); broadcast("presence"); return json(res,200,{ok:true,accepted:false}); }
        if (req.method === "POST" && url.pathname === "/api/friends/respond") { const value = await body(req); const sender = db.prepare("SELECT id FROM accounts WHERE email=?").get(String(value.email || "").toLowerCase()); if (!sender) return json(res,404,{ok:false}); const request = db.prepare("SELECT id FROM friend_requests WHERE sender_id=? AND recipient_id=? AND status='pending'").get(sender.id,user.id); if (!request) return json(res,404,{ok:false,error:"Permintaan tidak ditemukan."}); if (value.accept) db.prepare("INSERT OR IGNORE INTO friendships(user_one,user_two,created_at) VALUES(?,?,?)").run(Math.min(user.id,sender.id),Math.max(user.id,sender.id),new Date().toISOString()); db.prepare("UPDATE friend_requests SET status=? WHERE id=?").run(value.accept ? "accepted" : "rejected",request.id); broadcast("presence"); return json(res,200,{ok:true}); }
        if (req.method === "GET" && url.pathname === "/api/messages") { const recipient = db.prepare("SELECT id FROM accounts WHERE email=?").get(url.searchParams.get("email")); if (!recipient || !friendship(user.id,recipient.id)) return json(res,403,{ok:false,error:"Chat hanya tersedia untuk teman."}); const rows = db.prepare("SELECT sender_id,body,sent_at,media_type,media_data FROM messages WHERE (sender_id=? AND recipient_id=?) OR (sender_id=? AND recipient_id=?) ORDER BY id").all(user.id, recipient.id, recipient.id, user.id); db.prepare("UPDATE messages SET read_at=? WHERE sender_id=? AND recipient_id=? AND read_at IS NULL").run(new Date().toISOString(),recipient.id,user.id); return json(res,200,rows.map(row => ({ from: row.sender_id === user.id ? "me" : "them", text: row.body, time: row.sent_at, mediaType:row.media_type, media:row.media_data }))); }
        if (req.method === "POST" && url.pathname === "/api/messages") { const value = await body(req); const recipient = db.prepare("SELECT id FROM accounts WHERE email=?").get(String(value.recipientEmail || "").toLowerCase()); const message = String(value.body || "").trim(), mediaType = String(value.mediaType || ""), mediaData = String(value.mediaData || ""); if (!recipient || !friendship(user.id,recipient.id)) return json(res,403,{ok:false,error:"Tambahkan sebagai teman sebelum mengirim chat."}); if (!message && !mediaData) return json(res,400,{ok:false,error:"Pesan kosong."}); if (mediaData.length > 10_000_000 || (mediaType && !/^(image|video)\//.test(mediaType))) return json(res,400,{ok:false,error:"Media tidak valid atau terlalu besar."}); db.prepare("INSERT INTO messages(sender_id,recipient_id,body,sent_at,media_type,media_data) VALUES(?,?,?,?,?,?)").run(user.id,recipient.id,message,new Date().toISOString(),mediaType,mediaData); const senderProfile = JSON.parse(user.user_json); clients.forEach((accountId,peer) => { if (accountId === recipient.id && peer.readyState === 1) peer.send(JSON.stringify({ type:"chat", senderEmail:user.email, senderName:senderProfile.nickname || senderProfile.username, preview:message || (mediaType.startsWith("video/") ? "Mengirim video" : "Mengirim foto"), mediaType })); }); return json(res,200,{ok:true}); }
        return json(res, 404, { error: "API tidak ditemukan" });
      }
      const dist = path.join(__dirname, "dist"); let file = url.pathname === "/" ? path.join(dist, "index.html") : path.join(dist, decodeURIComponent(url.pathname));
      if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, "index.html");
      res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream", "Cache-Control": path.extname(file) === ".html" ? "no-cache" : "public, max-age=3600" }); fs.createReadStream(file).pipe(res);
    } catch (error) { console.error(error); json(res, 500, { error: "Kesalahan server." }); }
  });
  const wss = new WebSocketServer({ noServer: true });
  server.on("upgrade", (req, socket, head) => { if (new URL(req.url, "http://localhost").pathname !== "/presence") return socket.destroy(); const user = accountFor(req); if (!user) return socket.destroy(); wss.handleUpgrade(req, socket, head, ws => { clients.set(ws, user.id); ws.on("message", raw => { try { const message = JSON.parse(String(raw)); const recipient = db.prepare("SELECT id FROM accounts WHERE email=?").get(String(message.recipientEmail || "").toLowerCase()); if (!recipient || !["party-invite","party-response","call-offer","call-answer","call-ice","call-end"].includes(message.type)) return; const sender = JSON.parse(user.user_json); clients.forEach((accountId, peer) => { if (accountId === recipient.id && peer.readyState === 1) peer.send(JSON.stringify({ type: "signal", signalType: message.type, senderEmail: user.email, senderName: sender.nickname || sender.username, payload: message.payload || {} })); }); } catch (_error) {} }); ws.on("close", () => { clients.delete(ws); broadcast("presence"); }); ws.send(JSON.stringify({ type: "ready" })); broadcast("presence"); }); });
  return new Promise(resolve => server.listen(port, host, () => { const actualPort = server.address().port; console.log(`Isekai server: http://localhost:${actualPort}`); resolve({ server, wss, db, port: actualPort }); }));
}

if (require.main === module) startServer();
module.exports = { startServer };
