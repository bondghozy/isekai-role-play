const { startServer } = require("../server");
const { WebSocket } = require("ws");

(async () => {
  const runtime = await startServer({ port: 0, host: "127.0.0.1", databasePath: ":memory:" });
  const base = `http://127.0.0.1:${runtime.port}`;
  const makeUser = (name, email) => ({ username:name,email,level:1,xp:0,xpNeeded:100,job:"STR",stats:{atk:3,magicAtk:0,def:3,magicDef:2,spd:1,crt:1,efc:0,vit:4,rst:1},unspentStatPoints:5,realName:name,address:"Test",nickname:name,photo:"",gold:0,inventory:{},questRotation:null,activeQuest:null,profileComplete:true });
  const register = async (name, email) => { const response = await fetch(`${base}/api/register`, { method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({user:makeUser(name,email),password:"rahasia"}) }); return { value:await response.json(), cookie:response.headers.get("set-cookie").split(";")[0] }; };
  const a = await register("Arka","arka@test.local"), b = await register("Bima","bima@test.local");
  const wsA = new WebSocket(`ws://127.0.0.1:${runtime.port}/presence`, { headers:{ Cookie:a.cookie } });
  const wsB = new WebSocket(`ws://127.0.0.1:${runtime.port}/presence`, { headers:{ Cookie:b.cookie } });
  await Promise.all([wsA,wsB].map(ws => new Promise((resolve,reject) => { ws.once("open",resolve); ws.once("error",reject); })));
  await new Promise(resolve => setTimeout(resolve,50));
  const signalPromise = new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error("Signaling timeout")), 1000); wsB.on("message", raw => { const value = JSON.parse(String(raw)); if (value.type === "signal") { clearTimeout(timer); resolve(value); } }); });
  wsA.send(JSON.stringify({ type:"party-invite", recipientEmail:"bima@test.local", payload:{ inviter:"Arka" } }));
  const signal = await signalPromise;
  const users = await fetch(`${base}/api/users`,{headers:{Cookie:a.cookie}}).then(r=>r.json());
  const friendSignalPromise = new Promise((resolve,reject) => { const timer=setTimeout(()=>reject(new Error("Friend signal timeout")),1000); wsB.on("message",raw => { const value=JSON.parse(String(raw)); if(value.type === "signal" && value.signalType === "friend-request") { clearTimeout(timer); resolve(value); } }); });
  const friendRequest = await fetch(`${base}/api/friends/request`,{method:"POST",headers:{Cookie:a.cookie,"content-type":"application/json"},body:JSON.stringify({email:"bima@test.local"})}).then(r=>r.json());
  const friendSignal = await friendSignalPromise;
  const friendAccept = await fetch(`${base}/api/friends/respond`,{method:"POST",headers:{Cookie:b.cookie,"content-type":"application/json"},body:JSON.stringify({email:"arka@test.local",accept:true})}).then(r=>r.json());
  const sent = await fetch(`${base}/api/messages`,{method:"POST",headers:{Cookie:a.cookie,"content-type":"application/json"},body:JSON.stringify({recipientEmail:"bima@test.local",body:"Halo realtime",mediaType:"image/png",mediaData:"data:image/png;base64,dGVzdA=="})}).then(r=>r.json());
  const messages = await fetch(`${base}/api/messages?email=arka%40test.local`,{headers:{Cookie:b.cookie}}).then(r=>r.json());
  const passed = a.value.ok && b.value.ok && users.some(user => user.email === "bima@test.local" && user.online) && signal.signalType === "party-invite" && signal.senderEmail === "arka@test.local" && friendSignal.signalType === "friend-request" && friendRequest.ok && friendAccept.ok && sent.ok && messages.some(message => message.text === "Halo realtime" && message.mediaType === "image/png");
  console.log(JSON.stringify({ registered:a.value.ok && b.value.ok, presence:users[0]?.online, signaling:signal.signalType, friendship:friendAccept.ok, message:messages[0]?.text, passed }));
  wsA.close(); wsB.close(); runtime.wss.close(); runtime.server.close(); runtime.db.close();
  if (!passed) process.exitCode = 1;
})().catch(error => { console.error(error); process.exit(1); });
