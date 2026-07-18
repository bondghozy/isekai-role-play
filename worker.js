import { DurableObject } from "cloudflare:workers";

const encoder = new TextEncoder();
const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8", ...headers } });
const cookie = request => Object.fromEntries((request.headers.get("cookie") || "").split(";").map(v => v.trim().split("=")).filter(v => v.length === 2));
const hex = bytes => [...new Uint8Array(bytes)].map(v => v.toString(16).padStart(2, "0")).join("");
const randomHex = size => { const value = new Uint8Array(size); crypto.getRandomValues(value); return hex(value); };
async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: encoder.encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256));
}

export class IsekaiServer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env); this.ctx = ctx;
    this.sql = ctx.storage.sql;
    for (const statement of [
      "CREATE TABLE IF NOT EXISTS accounts(id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT UNIQUE NOT NULL,username TEXT NOT NULL,password_hash TEXT NOT NULL,password_salt TEXT NOT NULL,user_json TEXT NOT NULL,updated_at TEXT NOT NULL)",
      "CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,account_id INTEGER NOT NULL,created_at TEXT NOT NULL)",
      "CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY AUTOINCREMENT,sender_id INTEGER NOT NULL,recipient_id INTEGER NOT NULL,body TEXT NOT NULL,sent_at TEXT NOT NULL,media_type TEXT,media_data TEXT,read_at TEXT)",
      "CREATE TABLE IF NOT EXISTS friendships(user_one INTEGER NOT NULL,user_two INTEGER NOT NULL,created_at TEXT NOT NULL,UNIQUE(user_one,user_two))",
      "CREATE TABLE IF NOT EXISTS friend_requests(id INTEGER PRIMARY KEY AUTOINCREMENT,sender_id INTEGER NOT NULL,recipient_id INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL,UNIQUE(sender_id,recipient_id))"
    ]) this.sql.exec(statement);
  }
  one(query, ...args) { return [...this.sql.exec(query, ...args)][0] || null; }
  all(query, ...args) { return [...this.sql.exec(query, ...args)]; }
  account(request) { const token = cookie(request).isekai_session; return token ? this.one("SELECT a.* FROM sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token=?", token) : null; }
  friends(a, b) { return this.one("SELECT 1 ok FROM friendships WHERE user_one=? AND user_two=?", Math.min(a,b), Math.max(a,b)); }
  sockets() { return this.ctx.getWebSockets(); }
  sendTo(id, value) { for (const ws of this.sockets()) { const info = ws.deserializeAttachment(); if (info?.accountId === id) try { ws.send(JSON.stringify(value)); } catch {} } }
  broadcast(value = { type: "presence" }) { for (const ws of this.sockets()) try { ws.send(JSON.stringify(value)); } catch {} }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/presence" && request.headers.get("upgrade") === "websocket") return this.websocket(request);
    if (!url.pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);
    try { return await this.api(request, url); } catch (error) { console.error(error); return json({ error: "Kesalahan server.", details: String(error?.message || error) }, 500); }
  }
  async api(request, url) {
    const method = request.method, path = url.pathname, value = method === "POST" || method === "DELETE" ? await request.json().catch(() => ({})) : {};
    let user = this.account(request);
    if (method === "POST" && path === "/api/register") {
      const profile = value.user || {}, email = String(profile.email || "").trim().toLowerCase(), username = String(profile.username || "").trim(), password = String(value.password || "");
      if (!username) return json({ ok:false,error:"Nama pengguna wajib diisi." },400);
      if (!/^\S+@\S+\.\S+$/.test(email)) return json({ok:false,error:"Format email tidak valid."},400);
      if (password.length < 6) return json({ok:false,error:"Password minimal 6 karakter."},400);
      if (this.one("SELECT id FROM accounts WHERE email=?",email)) return json({ok:false,error:"Email sudah terdaftar. Silakan login."},409);
      profile.email=email; profile.username=username; const salt=randomHex(16), now=new Date().toISOString(), hash=await passwordHash(password,salt);
      this.sql.exec("INSERT INTO accounts(email,username,password_hash,password_salt,user_json,updated_at) VALUES(?,?,?,?,?,?)",email,username,hash,salt,JSON.stringify(profile),now);
      user=this.one("SELECT * FROM accounts WHERE email=?",email); const token=randomHex(32); this.sql.exec("INSERT INTO sessions VALUES(?,?,?)",token,user.id,now);
      return json({ok:true,user:profile},200,{"set-cookie":`isekai_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`});
    }
    if (method === "POST" && path === "/api/login") {
      const row=this.one("SELECT * FROM accounts WHERE email=?",String(value.email||"").toLowerCase());
      if (!row || await passwordHash(String(value.password||""),row.password_salt)!==row.password_hash) return json({ok:false,error:"Email atau password salah."},401);
      const token=randomHex(32),now=new Date().toISOString(); this.sql.exec("INSERT INTO sessions VALUES(?,?,?)",token,row.id,now); this.sql.exec("UPDATE accounts SET updated_at=? WHERE id=?",now,row.id);
      return json({ok:true,user:JSON.parse(row.user_json)},200,{"set-cookie":`isekai_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`});
    }
    if (method === "GET" && path === "/api/session") return json(user ? JSON.parse(user.user_json) : null);
    if (!user) return json({error:"Sesi berakhir."},401);
    if (method === "POST" && path === "/api/save") { this.sql.exec("UPDATE accounts SET username=?,user_json=?,updated_at=? WHERE id=?",value.username,JSON.stringify(value),new Date().toISOString(),user.id); this.broadcast(); return json(true); }
    if (method === "POST" && path === "/api/logout") { const token=cookie(request).isekai_session; this.sql.exec("DELETE FROM sessions WHERE token=?",token); return json(true,200,{"set-cookie":"isekai_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"}); }
    if (method === "DELETE" && path === "/api/account") { this.sql.exec("DELETE FROM messages WHERE sender_id=? OR recipient_id=?",user.id,user.id); this.sql.exec("DELETE FROM friend_requests WHERE sender_id=? OR recipient_id=?",user.id,user.id); this.sql.exec("DELETE FROM friendships WHERE user_one=? OR user_two=?",user.id,user.id); this.sql.exec("DELETE FROM sessions WHERE account_id=?",user.id); this.sql.exec("DELETE FROM accounts WHERE id=?",user.id); this.broadcast(); return json(true,200,{"set-cookie":"isekai_session=; Path=/; Max-Age=0"}); }
    if (method === "GET" && path === "/api/users") { const online=new Set(this.sockets().map(ws=>ws.deserializeAttachment()?.accountId)); return json(this.all("SELECT id,user_json,updated_at FROM accounts WHERE id<>?",user.id).map(row=>{ const incoming=this.one("SELECT 1 ok FROM friend_requests WHERE sender_id=? AND recipient_id=? AND status='pending'",row.id,user.id),outgoing=this.one("SELECT 1 ok FROM friend_requests WHERE sender_id=? AND recipient_id=? AND status='pending'",user.id,row.id),unread=this.one("SELECT COUNT(*) count FROM messages WHERE sender_id=? AND recipient_id=? AND read_at IS NULL",row.id,user.id); return {...JSON.parse(row.user_json),lastActive:row.updated_at,online:online.has(row.id),unreadCount:unread?.count||0,friendship:this.friends(user.id,row.id)?"friends":incoming?"incoming":outgoing?"outgoing":"none"}; })); }
    if (method === "POST" && path === "/api/friends/request") { const recipient=this.one("SELECT id FROM accounts WHERE email=?",String(value.email||"").toLowerCase()); if(!recipient||recipient.id===user.id||this.friends(user.id,recipient.id)) return json({ok:false,error:"Permintaan tidak valid."},400); const reverse=this.one("SELECT id FROM friend_requests WHERE sender_id=? AND recipient_id=? AND status='pending'",recipient.id,user.id),now=new Date().toISOString(); if(reverse){this.sql.exec("INSERT OR IGNORE INTO friendships VALUES(?,?,?)",Math.min(user.id,recipient.id),Math.max(user.id,recipient.id),now);this.sql.exec("UPDATE friend_requests SET status='accepted' WHERE id=?",reverse.id);this.broadcast();return json({ok:true,accepted:true});} this.sql.exec("INSERT INTO friend_requests(sender_id,recipient_id,status,created_at) VALUES(?,?,'pending',?) ON CONFLICT(sender_id,recipient_id) DO UPDATE SET status='pending',created_at=excluded.created_at",user.id,recipient.id,now); const p=JSON.parse(user.user_json);this.sendTo(recipient.id,{type:"signal",signalType:"friend-request",senderEmail:user.email,senderName:p.nickname||p.username,payload:{}});this.broadcast();return json({ok:true,accepted:false}); }
    if (method === "POST" && path === "/api/friends/respond") { const sender=this.one("SELECT id FROM accounts WHERE email=?",String(value.email||"").toLowerCase()); const req=sender&&this.one("SELECT id FROM friend_requests WHERE sender_id=? AND recipient_id=? AND status='pending'",sender.id,user.id);if(!req)return json({ok:false,error:"Permintaan tidak ditemukan."},404);if(value.accept)this.sql.exec("INSERT OR IGNORE INTO friendships VALUES(?,?,?)",Math.min(user.id,sender.id),Math.max(user.id,sender.id),new Date().toISOString());this.sql.exec("UPDATE friend_requests SET status=? WHERE id=?",value.accept?"accepted":"rejected",req.id);this.broadcast();return json({ok:true}); }
    if (method === "GET" && path === "/api/messages") { const recipient=this.one("SELECT id FROM accounts WHERE email=?",url.searchParams.get("email"));if(!recipient||!this.friends(user.id,recipient.id))return json({ok:false,error:"Chat hanya tersedia untuk teman."},403);const rows=this.all("SELECT sender_id,body,sent_at,media_type,media_data FROM messages WHERE (sender_id=? AND recipient_id=?) OR (sender_id=? AND recipient_id=?) ORDER BY id",user.id,recipient.id,recipient.id,user.id);this.sql.exec("UPDATE messages SET read_at=? WHERE sender_id=? AND recipient_id=? AND read_at IS NULL",new Date().toISOString(),recipient.id,user.id);return json(rows.map(r=>({from:r.sender_id===user.id?"me":"them",text:r.body,time:r.sent_at,mediaType:r.media_type,media:r.media_data}))); }
    if (method === "POST" && path === "/api/messages") { const recipient=this.one("SELECT id FROM accounts WHERE email=?",String(value.recipientEmail||"").toLowerCase()),message=String(value.body||"").trim(),mediaType=String(value.mediaType||""),mediaData=String(value.mediaData||"");if(!recipient||!this.friends(user.id,recipient.id))return json({ok:false,error:"Tambahkan sebagai teman sebelum mengirim chat."},403);if(!message&&!mediaData)return json({ok:false,error:"Pesan kosong."},400);if(mediaData.length>10000000||(mediaType&&!/^(image|video)\//.test(mediaType)))return json({ok:false,error:"Media tidak valid atau terlalu besar."},400);this.sql.exec("INSERT INTO messages(sender_id,recipient_id,body,sent_at,media_type,media_data) VALUES(?,?,?,?,?,?)",user.id,recipient.id,message,new Date().toISOString(),mediaType,mediaData);const p=JSON.parse(user.user_json);this.sendTo(recipient.id,{type:"chat",senderEmail:user.email,senderName:p.nickname||p.username,preview:message||(mediaType.startsWith("video/")?"Mengirim video":"Mengirim foto"),mediaType});return json({ok:true}); }
    return json({error:"API tidak ditemukan"},404);
  }
  websocket(request) { const user=this.account(request);if(!user)return new Response("Unauthorized",{status:401});const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.serializeAttachment({accountId:user.id,email:user.email});this.ctx.acceptWebSocket(server,[`account:${user.id}`]);server.send(JSON.stringify({type:"ready"}));this.broadcast();return new Response(null,{status:101,webSocket:client}); }
  webSocketMessage(ws, raw) { try { const message=JSON.parse(String(raw)),info=ws.deserializeAttachment();if(!["party-invite","party-response","call-offer","call-answer","call-ice","call-end"].includes(message.type))return;const user=this.one("SELECT * FROM accounts WHERE id=?",info.accountId),recipient=this.one("SELECT id FROM accounts WHERE email=?",String(message.recipientEmail||"").toLowerCase());if(!user||!recipient)return;const p=JSON.parse(user.user_json);this.sendTo(recipient.id,{type:"signal",signalType:message.type,senderEmail:user.email,senderName:p.nickname||p.username,payload:message.payload||{}});}catch{} }
  webSocketClose() { this.broadcast(); }
  webSocketError() { this.broadcast(); }
}

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(url.pathname.startsWith("/api/")||url.pathname==="/presence") return env.ISEKAI.getByName("global").fetch(request);
    return env.ASSETS.fetch(request);
  }
};
