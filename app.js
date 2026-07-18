const storageKey = "isekai-role-play-user";
const postsKey = "isekai-role-play-posts";

const jobConfig = {
  STR: {
    name: "Strength",
    colorClass: "str",
    weights: {
      atk: 1,
      magicAtk: 0,
      def: 2,
      magicDef: 2,
      spd: 0,
      crt: 0,
      efc: 0,
      vit: 3,
      rst: 1
    }
  },
  INT: {
    name: "Intelligence",
    colorClass: "int",
    weights: {
      atk: 0,
      magicAtk: 3,
      def: 0,
      magicDef: 1,
      spd: 0,
      crt: 0,
      efc: 2,
      vit: 1,
      rst: 2
    }
  },
  AGI: {
    name: "Agility",
    colorClass: "agi",
    weights: {
      atk: 3,
      magicAtk: 0,
      def: 0,
      magicDef: 0,
      spd: 2,
      crt: 2,
      efc: 0,
      vit: 1,
      rst: 1
    }
  }
};

const statLabels = {
  atk: "ATK",
  magicAtk: "M. ATK",
  def: "DEF",
  magicDef: "M. DEF",
  spd: "SPD",
  crt: "CRT",
  efc: "EFC",
  vit: "VIT",
  rst: "RST"
};

const statDescriptions = {
  atk: "Damage Physical",
  magicAtk: "Damage Magis",
  def: "Pertahanan Damage Physical",
  magicDef: "Pertahanan Damage Magis",
  spd: "Kecepatan serang dan kemungkinan menghindar",
  crt: "Peluang kritikal atau bonus damage tambahan",
  efc: "Peluang debuff, status buruk, dan CC",
  vit: "Status kesehatan",
  rst: "Kekebalan tubuh dari status buruk"
};

const starterPosts = [];

const authView = document.querySelector("#authView");
const authChoice = document.querySelector("#authChoice");
const jobView = document.querySelector("#jobView");
const setupView = document.querySelector("#setupView");
const dashboardView = document.querySelector("#dashboardView");
const taskbar = document.querySelector("#taskbar");
const authForm = document.querySelector("#authForm");
const profileForm = document.querySelector("#profileForm");
const postForm = document.querySelector("#postForm");
const settingsForm = document.querySelector("#settingsForm");
const authSubmit = document.querySelector("#authSubmit");
const authHint = document.querySelector("#authHint");
const backToAuthChoice = document.querySelector("#backToAuthChoice");
const tabButtons = document.querySelectorAll("[data-auth-mode]");
const authStartButtons = document.querySelectorAll("[data-auth-start]");
const jobGrid = document.querySelector("#jobGrid");
const resetFromJob = document.querySelector("#resetFromJob");
const logoutButton = document.querySelector("#logoutButton");
const rerollButton = document.querySelector("#rerollButton");
const profilePhoto = document.querySelector("#profilePhoto");
const settingsPhoto = document.querySelector("#settingsPhoto");
const postMedia = document.querySelector("#postMedia");
const portalButton = document.querySelector("#portalButton");
const portalProgressLabel = document.querySelector("#portalProgressLabel");
const portalQuestLabel = document.querySelector("#portalQuestLabel");
const portalModal = document.querySelector("#portalModal");
const closePortalButton = document.querySelector("#closePortalButton");
const whiterunButton = document.querySelector("#whiterunButton");
const citySelection = document.querySelector("#citySelection");
const questBoard = document.querySelector("#questBoard");
const backToCities = document.querySelector("#backToCities");
const questList = document.querySelector("#questList");
const questRefreshTime = document.querySelector("#questRefreshTime");
const activeQuest = document.querySelector("#activeQuest");
const partyFighters = document.querySelector("#partyFighters");
const chatLauncher = document.querySelector("#chatLauncher");
const chatWindow = document.querySelector("#chatWindow");
const chatContacts = document.querySelector("#chatContacts");
const chatHistory = document.querySelector("#chatHistory");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const chatUnread = document.querySelector("#chatUnread");
const questCountdown = document.querySelector("#questCountdown");
const countdownValue = document.querySelector("#countdownValue");
const countdownPartyText = document.querySelector("#countdownPartyText");
const cancelQuestCountdown = document.querySelector("#cancelQuestCountdown");
const refreshOnlineUsers = document.querySelector("#refreshOnlineUsers");
const battleTaskbar = document.querySelector("#battleTaskbar");
const battleHero = document.querySelector("#battleHero");
const battleEnemy = document.querySelector("#battleEnemy");
const heroBattleHp = document.querySelector("#heroBattleHp");
const enemyBattleHp = document.querySelector("#enemyBattleHp");
const battleEnemyName = document.querySelector("#battleEnemyName");
const battleQuestName = document.querySelector("#battleQuestName");
const battleProgress = document.querySelector("#battleProgress");
const battleProgressBar = document.querySelector("#battleProgressBar");
const storageButton = document.querySelector("#storageButton");
const musicButton = document.querySelector("#musicButton");
const soundtrackAudio = document.querySelector("#soundtrackAudio");
const musicVolume = document.querySelector("#musicVolume");
const musicVolumeValue = document.querySelector("#musicVolumeValue");
const musicSettingsKey = "isekai-role-play-sound";
const storageModal = document.querySelector("#storageModal");
const closeStorageButton = document.querySelector("#closeStorageButton");
const settingsButton = document.querySelector("#settingsButton");
const profileSettingsButton = document.querySelector("#profileSettingsButton");
const profileDrawer = document.querySelector("#profileDrawer");
const openProfileDrawer = document.querySelector("#openProfileDrawer");
const closeProfileDrawer = document.querySelector("#closeProfileDrawer");
const settingsModal = document.querySelector("#settingsModal");
const closeSettingsButton = document.querySelector("#closeSettingsButton");
const createPartyButton = document.querySelector("#createPartyButton");
const partyCount = document.querySelector("#partyCount");
const partySlots = document.querySelectorAll(".party-slots span");
let partyInviteButtons = document.querySelectorAll("[data-party-player]");
partyInviteButtons.forEach((button) => { button.disabled = true; });

let authMode = "register";
let currentUser = null;
let selectedProfilePhoto = "";
let selectedSettingsPhoto = "";
let selectedPostMedia = null;
let selectedChatMedia = null;
const unreadMessages = new Map();
let pendingFriendRequests = 0;
let notificationAudioContext = null;
let partyCreated = false;
let partyMemberCount = 0;
let partyMembers = [];
let activeChatPlayer = null;
let questCountdownTimer = null;

let socialPlayers = {};
let peerConnection = null;
let localCallStream = null;
let activeCall = null;
let pendingCall = null;
let queuedIceCandidates = [];
let feedPosts = [];
let feedHasMore = false;
let feedLoading = false;
let feedSignature = "";
let feedPollTimer = null;
const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

const whiterunQuests = [
  { id: "slime-gate", title: "Membersihkan Slime di Gerbang Kerajaan", gold: [35, 100], item: "Benih Slime", amount: [3, 7], xp: 30, duration: 60_000 },
  { id: "royal-wood", title: "Menebang Kayu di Hutan Kerajaan", gold: [35, 100], item: "Kayu", amount: [3, 5], xp: 25, duration: 60_000 },
  { id: "royal-stone", title: "Menambang Batu di Gua Kerajaan", gold: [35, 100], item: "Batu", amount: [3, 5], xp: 25, duration: 60_000 },
  { id: "gate-guard", title: "Menjaga Gerbang Kerajaan", gold: [100, 500], xp: 25, duration: 150_000 },
  { id: "goblin-hunt", title: "Berburu Goblin di Hutan tempat Sarang Goblin", gold: [300, 500], item: "Tulang Goblin", amount: [2, 7], xp: 100, duration: 300_000 }
];

const combatQuestConfig = {
  "slime-gate": { hp: 24, attack: 3.2, defense: 1.2, magicDefense: 1.5, speed: 2, resistance: 1, baseKills: 4, bonusGold: 1 },
  "goblin-hunt": { hp: 38, attack: 4.8, defense: 2.4, magicDefense: 1.8, speed: 3.2, resistance: 2, baseKills: 3, bonusGold: 2 }
};

function createCombatResult(user, questId) {
  const enemy = combatQuestConfig[questId];
  if (!enemy) return null;
  const s = user.stats || {};
  const helpers = partyMembers.map((name) => socialPlayers[name]).filter(Boolean);
  const helperStat = (stat) => helpers.reduce((total, member) => total + (member.stats[stat] || 0) * .32, 0);
  const levelBonus = Math.max(0, (user.level || 1) - 1) * 1.5;
  const offense = (s.atk || 0) * 1.15 + (s.magicAtk || 0) * 1.15 + (s.spd || 0) * .7 + (s.crt || 0) * .8 + (s.efc || 0) * .55 + helperStat("atk") + helperStat("magicAtk") + helperStat("spd") * .5 + helperStat("crt") * .5 + levelBonus + 8;
  const survival = (s.def || 0) * 1.05 + (s.magicDef || 0) * .9 + (s.vit || 0) * 1.25 + (s.rst || 0) * .7 + (s.spd || 0) * .35 + helperStat("def") + helperStat("magicDef") + helperStat("vit") + helperStat("rst") * .5 + levelBonus + 10;
  const attackScore = offense / (enemy.hp + enemy.defense + enemy.magicDefense);
  const defenseScore = survival / (enemy.attack * 4.2 + enemy.speed);
  const winChance = Math.max(.72, Math.min(.98, .72 + attackScore * .13 + defenseScore * .1));
  const won = Math.random() < winChance;
  const killPotential = enemy.baseKills + Math.floor(offense / (enemy.hp * .55));
  const kills = Math.max(1, won ? killPotential + Math.floor(Math.random() * 3) : Math.ceil(killPotential * (.3 + Math.random() * .35)));
  const endHeroHp = won ? Math.max(18, Math.round(42 + defenseScore * 24 + Math.random() * 20)) : 0;
  const redAppeared = questId === "goblin-hunt" && Math.random() < .3;
  const redKilled = redAppeared && (won || Math.random() < Math.min(.85, offense / 45));
  return {
    won,
    kills,
    endHeroHp: Math.min(100, endHeroHp),
    rewardRate: won ? 1 : .2 + Math.random() * .3,
    bonusGold: kills * enemy.bonusGold + (redKilled ? 5 : 0),
    redAppeared,
    redKilled,
    party: partyMembers.map((name) => ({ name, ...socialPlayers[name] }))
  };
}

function createGatherResult(user, questId) {
  const resources = {
    "royal-stone": { durability: 20, item: "Batu" },
    "royal-wood": { durability: 18, item: "Kayu" }
  };
  const resource = resources[questId];
  if (!resource) return null;
  const s = user.stats || {};
  const helpers = partyMembers.map((name) => socialPlayers[name]).filter(Boolean);
  const helperWork = helpers.reduce((total, member) => total + ((member.stats.atk || 0) * .7 + (member.stats.magicAtk || 0) * .35 + (member.stats.spd || 0) * .4 + (member.stats.crt || 0) * .3), 0);
  const workPower = 9 + (s.atk || 0) * 1.2 + (s.magicAtk || 0) * .45 + (s.spd || 0) * .75 + (s.crt || 0) * .65 + (s.efc || 0) * .25 + helperWork + Math.max(0, (user.level || 1) - 1);
  const objects = Math.max(2, Math.floor(2 + workPower / resource.durability * 3 + Math.random() * 2));
  return { objects, item: resource.item };
}

function openSettings() {
  prefillSettingsForm();
  settingsModal.classList.remove("hidden");
  document.querySelector("#settingsNickname").focus();
}

function closeSettings() {
  settingsModal.classList.add("hidden");
}

function loadPosts() {
  const rawPosts = localStorage.getItem(postsKey);
  return rawPosts ? JSON.parse(rawPosts).filter((post) => !String(post.id).startsWith("npc-")) : starterPosts;
}

function saveUser(user) {
  currentUser = user;
  window.accountDB?.save(user).catch((error) => console.error("Gagal menyimpan akun", error));
}

function savePosts(posts) {
  localStorage.setItem(postsKey, JSON.stringify(posts));
}

function showView(view) {
  authView.classList.toggle("hidden", view !== "auth");
  jobView.classList.toggle("hidden", view !== "job");
  setupView.classList.toggle("hidden", view !== "setup");
  dashboardView.classList.toggle("hidden", view !== "dashboard");
  taskbar.classList.toggle("hidden", view !== "dashboard");
  storageButton.classList.toggle("hidden", view !== "dashboard");
  chatLauncher.classList.add("hidden");
  if (view !== "dashboard") battleTaskbar.classList.add("hidden");
  else updatePortalStatus();
  document.body.classList.toggle("scene-active", view === "auth");
}

function showAuthChoice() {
  authChoice.classList.remove("hidden");
  authForm.classList.add("hidden");
}

function showAuthForm(mode) {
  setAuthMode(mode);
  authChoice.classList.add("hidden");
  authForm.classList.remove("hidden");
}

function syncRoute() {
  if (!currentUser) {
    showView("auth");
    showAuthChoice();
    return;
  }

  if (!currentUser.job) {
    showView("job");
    return;
  }

  if (!currentUser.profileComplete) {
    prefillProfileForm();
    showView("setup");
    return;
  }

  renderDashboard();
  showView("dashboard");
}

function setAuthMode(mode) {
  authMode = mode;
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === mode);
  });
  authSubmit.textContent = mode === "register" ? "Daftar Akun" : "Masuk";
  document.querySelector("#username").required = mode === "register";
  document.querySelector("#password").autocomplete = mode === "register" ? "new-password" : "current-password";
  authHint.textContent = mode === "register"
    ? "Akun dan progres akan disimpan permanen dalam database lokal."
    : "Masukkan email dan password akun untuk melanjutkan progres.";
}

function createUser(username, email) {
  return {
    username,
    email,
    level: 1,
    xp: 0,
    xpNeeded: 100,
    job: null,
    stats: null,
    realName: "",
    address: "",
    nickname: username,
    photo: "",
    gold: 0,
    inventory: {},
    questRotation: null,
    activeQuest: null,
    profileComplete: false,
    createdAt: new Date().toISOString()
  };
}

function weightedStatRoll(jobCode) {
  const weights = jobConfig[jobCode].weights;
  const stats = Object.fromEntries(Object.keys(weights).map((key) => [key, 0]));
  const weightedPool = Object.entries(weights).flatMap(([stat, weight]) => {
    return Array.from({ length: weight }, () => stat);
  });

  for (let point = 0; point < 15; point += 1) {
    const stat = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    stats[stat] += 1;
  }

  return stats;
}

function chooseJob(jobCode) {
  saveUser({
    ...currentUser,
    job: jobCode,
    level: 1,
    stats: weightedStatRoll(jobCode),
    unspentStatPoints: 5
  });
  syncRoute();
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function renderAvatar(target, user = currentUser) {
  const initials = (user.nickname || user.username || "IR").slice(0, 2).toUpperCase();
  target.innerHTML = user.photo ? `<img src="${user.photo}" alt="Foto profil ${escapeHtml(user.nickname)}">` : escapeHtml(initials);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function prefillProfileForm() {
  document.querySelector("#nickname").value = currentUser.nickname || currentUser.username;
  document.querySelector("#realName").value = currentUser.realName || "";
  document.querySelector("#address").value = currentUser.address || "";
  renderAvatar(document.querySelector("#setupAvatar"));
}

function prefillSettingsForm() {
  document.querySelector("#settingsNickname").value = currentUser.nickname || "";
  document.querySelector("#settingsRealName").value = currentUser.realName || "";
  document.querySelector("#settingsAddress").value = currentUser.address || "";
}

function renderDashboard() {
  const job = jobConfig[currentUser.job];
  const expectedStats = Object.keys(job.weights);
  if (!currentUser.stats || expectedStats.some((stat) => !(stat in currentUser.stats))) {
    saveUser({ ...currentUser, stats: weightedStatRoll(currentUser.job), unspentStatPoints: 5, xp: currentUser.xp || 0, xpNeeded: currentUser.xpNeeded || 100 });
  } else if (typeof currentUser.unspentStatPoints !== "number" || typeof currentUser.xp !== "number" || typeof currentUser.xpNeeded !== "number") {
    saveUser({ ...currentUser, unspentStatPoints: typeof currentUser.unspentStatPoints === "number" ? currentUser.unspentStatPoints : 5, xp: currentUser.xp || 0, xpNeeded: currentUser.xpNeeded || 100 });
  }
  document.querySelector("#characterName").textContent = currentUser.nickname;
  document.querySelector("#accountEmail").textContent = currentUser.email;
  document.querySelector("#profileRealName").textContent = currentUser.realName || "Belum diisi";
  document.querySelector("#profileAddress").textContent = currentUser.address || "Belum diisi";
  document.querySelector("#miniCharacterName").textContent = currentUser.nickname;
  document.querySelector("#miniLevelValue").textContent = currentUser.level;
  document.querySelector("#levelValue").textContent = currentUser.level;
  const xpPercent = Math.min(100, (currentUser.xp / currentUser.xpNeeded) * 100);
  document.querySelector("#xpProgress").style.width = `${xpPercent}%`;
  document.querySelector("#xpValue").textContent = `${currentUser.xp} / ${currentUser.xpNeeded} XP`;
  document.querySelector("#jobLabel").textContent = `${job.name} (${currentUser.job})`;
  document.querySelector("#profileGold").textContent = currentUser.gold || 0;
  document.querySelector("#profileItemCount").textContent = Object.keys(currentUser.inventory || {}).length;

  const avatar = document.querySelector("#avatar");
  avatar.className = `avatar profile-photo ${job.colorClass}`;
  renderAvatar(avatar);
  const profileJobCharacter = document.querySelector("#profileJobCharacter");
  profileJobCharacter.className = `profile-job-character ${job.colorClass}`;
  profileJobCharacter.setAttribute("aria-label", `Karakter ${job.name} (${currentUser.job})`);
  document.querySelector("#miniProfileJob").className = `mini-profile-job ${job.colorClass}`;

  renderStats();
  void renderFeed(true);
  if(!feedPollTimer)feedPollTimer=window.setInterval(()=>{if(currentUser&&!document.hidden)void renderFeed(true,true);},4000);
  prefillSettingsForm();
  void refreshRealUsers();
}

async function refreshRealUsers() {
  const users = await window.accountDB.listUsers();
  const registeredUsers = users.filter((user) => user.email !== currentUser?.email && user.profileComplete && user.job && user.stats);
  const others = [...registeredUsers].sort((a, b) => Number(b.online) - Number(a.online)).slice(0, 30);
  pendingFriendRequests = others.filter(user => user.friendship === "incoming").length;
  others.forEach(user => { if (user.unreadCount) unreadMessages.set(user.email,user.unreadCount); else unreadMessages.delete(user.email); });
  socialPlayers = Object.fromEntries(others.map((user) => [user.nickname || user.username, { level: user.level, job: user.job, stats: user.stats, email: user.email, photo: user.photo || "", offline: !user.online, friendship: user.friendship || "none" }]));
  const list = document.querySelector("#realUserList");
  document.querySelector("#realUserCount").textContent = others.length ? `${others.filter(user => user.online).length} online · ${others.length} akun terdaftar` : "Belum ada pengguna lain";
  list.innerHTML = others.length ? others.map((user) => {
    const name = user.nickname || user.username;
    return `<li class="player-entry" data-player="${escapeHtml(name)}"><span class="mini-avatar teal">${escapeHtml(name.slice(0,2).toUpperCase())}</span><span>${escapeHtml(name)}<small>Lv. ${user.level} · ${user.job} · <i class="online-dot"></i> Terdaftar</small></span><div class="invite-status" aria-live="polite"></div></li>`;
  }).join("") : `<li class="empty-social">Daftarkan akun lain agar muncul di sini.</li>`;
  renderSocialFeatures();
  updateUnreadBadge(false);
}

function renderSocialFeatures() {
  document.querySelectorAll(".player-entry[data-player]").forEach((entry) => {
    const player = socialPlayers[entry.dataset.player];
    if (!player) return;
    const detail = entry.querySelector("small");
    detail.innerHTML = `Lv. ${player.level} · ${player.job} · ${player.offline ? '<i class="offline-dot"></i> Offline' : '<i class="online-dot"></i> Online'}`;
    if (!entry.querySelector(".player-actions")) {
      const actions = document.createElement("div");
      actions.className = "player-actions";
      const friendControl = player.friendship === "friends" ? `<span class="friend-badge">✓ Teman</span>` : player.friendship === "incoming" ? `<span class="friend-badge">Permintaan di Message</span>` : player.friendship === "outgoing" ? `<span class="friend-badge">Menunggu konfirmasi</span>` : `<button class="friend-action" type="button" data-add-friend="${escapeHtml(entry.dataset.player)}">＋ Teman</button>`;
      actions.innerHTML = `<button type="button" data-view-stats="${escapeHtml(entry.dataset.player)}">STAT</button>${player.friendship === "friends" ? `<button type="button" data-open-chat="${escapeHtml(entry.dataset.player)}">CHAT</button>` : ""}${friendControl}`;
      entry.append(actions);
      const stats = document.createElement("div");
      stats.className = "player-stat-popover hidden";
      stats.innerHTML = Object.entries(player.stats).map(([key, value]) => `<span>${statLabels[key]} <b>${value}</b></span>`).join("");
      entry.append(stats);
    }
  });
  const friends = Object.entries(socialPlayers).filter(([, player]) => player.friendship === "friends");
  const requests = Object.entries(socialPlayers).filter(([, player]) => player.friendship === "incoming");
  const requestBoxes = requests.map(([name]) => `<div class="friend-request-box"><span><strong>${escapeHtml(name)}</strong><small>Ingin menambahkanmu sebagai teman</small></span><div class="friend-request-actions"><button class="accept" type="button" data-friend-accept="${escapeHtml(name)}">Terima</button><button class="reject" type="button" data-friend-reject="${escapeHtml(name)}">Tolak</button></div></div>`).join("");
  const friendContacts = friends.map(([name, player]) => { const unread = unreadMessages.get(player.email) || 0; return `<button type="button" data-chat-contact="${escapeHtml(name)}"><span class="online-dot ${player.offline ? "is-offline" : ""}"></span>${escapeHtml(name)}${unread ? `<b class="chat-contact-unread">${unread}</b>` : ""}<small>Lv.${player.level} ${player.job}</small></button>`; }).join("");
  chatContacts.innerHTML = requestBoxes + friendContacts || `<span class="chat-locked">Belum ada pesan atau permintaan teman.</span>`;
  document.querySelector("#friendUserList").innerHTML = friends.length ? friends.map(([name, player]) => `<li><span class="mini-avatar friend-photo">${player.photo ? `<img src="${escapeHtml(player.photo)}" alt="Foto profil ${escapeHtml(name)}">` : escapeHtml(name.slice(0,2).toUpperCase())}</span><span>${escapeHtml(name)}<small>${player.offline ? "Offline" : "Online"} · Lv.${player.level} ${player.job}</small></span><button type="button" data-open-chat="${escapeHtml(name)}">Chat</button></li>`).join("") : `<li class="empty-social">Belum ada teman. Kirim permintaan dari Player Online.</li>`;
  partyInviteButtons = document.querySelectorAll("[data-party-player]");
  partyInviteButtons.forEach((button) => {
    button.disabled = !partyCreated || partyMemberCount >= 5;
    button.addEventListener("click", () => inviteRealPlayer(button));
  });
}

function inviteRealPlayer(button) {
  const player = button.dataset.partyPlayer;
  if (!partyCreated || partyMemberCount >= 5 || !player) return;
  if (socialPlayers[player]?.offline) { setInviteStatus(player, "Pemain sedang offline.", "rejected"); return; }
  button.dataset.invited = "true";
  button.disabled = true;
  const sent = window.realtime?.send("party-invite", socialPlayers[player].email, { inviter: currentUser.nickname });
  setInviteStatus(player, sent ? `Undangan realtime dikirim ke ${escapeHtml(player)}.` : "Koneksi realtime belum siap.", sent ? "" : "rejected");
}

async function openChat(player) {
  if (!player || !socialPlayers[player]) return;
  if (socialPlayers[player].friendship !== "friends") return;
  activeChatPlayer = player;
  unreadMessages.delete(socialPlayers[player].email);
  updateUnreadBadge();
  document.querySelectorAll(`.message-toast[data-sender-email="${CSS.escape(socialPlayers[player].email)}"]`).forEach(toast => toast.remove());
  chatWindow.classList.remove("hidden");
  document.querySelector("#chatTitle").textContent = player;
  document.querySelector("#chatPresence").textContent = socialPlayers[player]?.offline ? "Offline · Riwayat tetap tersedia" : `Online · Lv.${socialPlayers[player].level} ${socialPlayers[player].job}`;
  document.querySelector("#voiceCallButton").disabled = Boolean(socialPlayers[player]?.offline);
  document.querySelector("#videoCallButton").disabled = Boolean(socialPlayers[player]?.offline);
  chatInput.removeAttribute("disabled");
  chatForm.querySelector(".chat-send-button").removeAttribute("disabled");
  await renderChatHistory();
  window.setTimeout(() => chatInput.focus(), 0);
}
async function renderChatHistory() {
  const messages = activeChatPlayer ? await window.accountDB.getMessages(socialPlayers[activeChatPlayer].email) : [];
  if (!Array.isArray(messages)) { chatHistory.innerHTML = `<p class="chat-locked">${escapeHtml(messages?.error || "Chat hanya tersedia untuk teman.")}</p>`; return; }
  chatHistory.innerHTML = messages.length ? messages.map((message) => { const media = message.media ? (message.mediaType?.startsWith("video/") ? `<video class="chat-message-media" src="${escapeHtml(message.media)}" controls playsinline></video>` : `<img class="chat-message-media" src="${escapeHtml(message.media)}" alt="Foto dalam chat">`) : ""; return `<div class="chat-message ${message.from === "me" ? "mine" : "theirs"}">${media}${message.text ? `<span>${escapeHtml(message.text)}</span>` : ""}<small>${new Date(message.time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</small></div>`; }).join("") : `<p class="chat-empty">Belum ada pesan. Mulai percakapan dengan ${escapeHtml(activeChatPlayer)}.</p>`;
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function renderStats() {
  const statList = document.querySelector("#statList");
  statList.innerHTML = "";

  const allocation = document.createElement("div");
  allocation.className = "stat-allocation";
  allocation.innerHTML = `<span>Status Point tersedia</span><strong id="unspentStatPoints">${currentUser.unspentStatPoints}</strong>`;
  statList.append(allocation);

  Object.entries(currentUser.stats).forEach(([stat, value]) => {
    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `
      <span class="stat-name" data-tooltip="${escapeHtml(statDescriptions[stat])}">${statLabels[stat]}</span>
      <span class="stat-value">${value}</span>
      <button class="stat-add-button" type="button" data-add-stat="${stat}" ${currentUser.unspentStatPoints === 0 ? "disabled" : ""} aria-label="Tambah ${statLabels[stat]}">+</button>
      <span class="stat-bar"><span class="stat-fill" style="width: ${Math.min(value * 10, 100)}%"></span></span>
    `;
    statList.append(row);
  });
}

function postTimeLabel(value) {
  const created = new Date(value),seconds=Math.round((created.getTime()-Date.now())/1000),relative=new Intl.RelativeTimeFormat("id-ID",{numeric:"auto"});
  return Math.abs(seconds)<60?relative.format(seconds,"second"):Math.abs(seconds)<3600?relative.format(Math.round(seconds/60),"minute"):Math.abs(seconds)<86400?relative.format(Math.round(seconds/3600),"hour"):relative.format(Math.round(seconds/86400),"day");
}
async function renderFeed(reset = true, silent = false) {
  if (feedLoading) return;
  feedLoading = true;
  const feedList = document.querySelector("#feedList");
  if (reset) { feedPosts = []; if(!silent)feedList.innerHTML = `<p class="feed-loading">Memuat status terbaru...</p>`; }
  const result = await window.accountDB.getPosts(feedPosts.length, 10);
  if (!result?.posts) { feedList.innerHTML = `<p class="feed-loading">${escapeHtml(result?.error || "Status belum dapat dimuat.")}</p>`; feedLoading = false; return; }
  feedPosts.push(...result.posts);
  feedHasMore = Boolean(result.hasMore);
  const signature=JSON.stringify(feedPosts.map(post=>[post.id,post.likeCount,post.liked,post.comments?.length]));
  if(silent&&signature===feedSignature){document.querySelectorAll("[data-post-time]").forEach(node=>node.textContent=postTimeLabel(node.dataset.postTime));feedLoading=false;return;}
  feedSignature=signature;
  feedList.innerHTML = "";
  feedPosts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "post-card";
    const media = renderPostMedia(post);
    const timeLabel=postTimeLabel(post.createdAt),comments=(post.comments||[]).map(comment=>`<div class="post-comment"><span>${comment.avatar?`<img src="${escapeHtml(comment.avatar)}" alt="">`:escapeHtml(comment.author.slice(0,2).toUpperCase())}</span><p><strong>${escapeHtml(comment.author)}</strong>${escapeHtml(comment.text)}<small>${escapeHtml(postTimeLabel(comment.createdAt))}</small></p></div>`).join("");
    card.dataset.postId=post.id;
    card.innerHTML = `
      <div class="post-head">
        ${post.avatar ? `<img class="post-avatar" src="${post.avatar}" alt="Foto profil ${escapeHtml(post.author)}">` : `<span class="post-avatar">${escapeHtml(post.author.slice(0, 2).toUpperCase())}</span>`}
        <div>
          <strong>${escapeHtml(post.author)}</strong>
          <p class="private-note">Lv. ${post.level} ${escapeHtml(post.job)} · <span data-post-time="${escapeHtml(post.createdAt)}" title="${new Date(post.createdAt).toLocaleString("id-ID")}">${escapeHtml(timeLabel)}</span>${post.isFriend ? " · Teman" : ""}</p>
        </div>
      </div>
      ${post.sharedFrom?`<p class="shared-label">↻ Membagikan status ${escapeHtml(post.sharedFrom)}</p>`:""}<p>${escapeHtml(post.text)}</p>
      ${media}
      <div class="post-actions"><button type="button" class="${post.liked?"liked":""}" data-post-like="${post.id}">♥ <span>${post.likeCount||0}</span></button><button type="button" data-post-comment-toggle="${post.id}">💬 <span>${post.comments?.length||0}</span></button><button type="button" data-post-share="${post.id}">↻ Bagikan</button></div>
      <div class="post-comments">${comments}<form data-post-comment-form="${post.id}"><input maxlength="500" placeholder="Tulis komentar..." aria-label="Komentar"><button type="submit">Kirim</button></form></div>
    `;
    feedList.append(card);
  });
  if (!feedPosts.length) feedList.innerHTML = `<p class="feed-loading">Belum ada status. Jadilah yang pertama membagikan petualangan.</p>`;
  if (feedHasMore) {
    const more = document.createElement("button"); more.type="button"; more.className="feed-load-more"; more.textContent="Muat status lainnya";
    more.addEventListener("click", () => void renderFeed(false)); feedList.append(more);
    const observer = new IntersectionObserver(entries => { if (entries[0]?.isIntersecting) { observer.disconnect(); void renderFeed(false); } }, { rootMargin: "240px" }); observer.observe(more);
  }
  feedLoading = false;
}

function renderPostMedia(post) {
  if (!post.media) return "";
  if (post.mediaType && post.mediaType.startsWith("video/")) {
    return `<video class="post-media" src="${post.media}" controls></video>`;
  }
  return `<img class="post-media" src="${post.media}" alt="Media status">`;
}
document.querySelector("#feedList").addEventListener("click",async event=>{
  const like=event.target.closest("[data-post-like]");if(like){like.disabled=true;await window.accountDB.togglePostLike(like.dataset.postLike);await renderFeed(true,true);return;}
  const share=event.target.closest("[data-post-share]");if(share){share.disabled=true;const result=await window.accountDB.sharePost(share.dataset.postShare);if(!result?.ok)window.alert(result?.error||"Status gagal dibagikan.");await renderFeed(true,true);}
});
document.querySelector("#feedList").addEventListener("submit",async event=>{
  const form=event.target.closest("[data-post-comment-form]");if(!form)return;event.preventDefault();const input=form.querySelector("input"),text=input.value.trim();if(!text)return;form.querySelector("button").disabled=true;const result=await window.accountDB.commentPost(form.dataset.postCommentForm,text);if(!result?.ok)window.alert(result?.error||"Komentar gagal dikirim.");await renderFeed(true,true);
});
window.addEventListener("feed:update",()=>{if(currentUser)void renderFeed(true,true);});

async function resetAccount() {
  await window.accountDB.logout();
  window.dispatchEvent(new Event("account:disconnected"));
  currentUser = null;
  selectedProfilePhoto = "";
  selectedSettingsPhoto = "";
  selectedPostMedia = null;
  authForm.reset();
  setAuthMode("login");
  syncRoute();
}

async function logoutAccount() {
  await window.accountDB.logout();
  window.dispatchEvent(new Event("account:disconnected"));
  currentUser = null;
  selectedProfilePhoto = "";
  selectedSettingsPhoto = "";
  selectedPostMedia = null;
  closeSettings();
  closePortal();
  closeStorage();
  authForm.reset();
  setAuthMode("login");
  syncRoute();
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes ? `${minutes} menit${seconds ? ` ${seconds} detik` : ""}` : `${seconds} detik`;
}

function randomReward([min, max]) {
  // Nilai tinggi tetap dapat muncul, tetapi peluangnya sedikit lebih kecil untuk quest pemula.
  return min + Math.floor(Math.pow(Math.random(), 1.3) * (max - min + 1));
}

function getQuestRotation() {
  const now = Date.now();
  const rotation = currentUser.questRotation;
  if (rotation && rotation.resetAt > now && rotation.ids.length === 3) return rotation;
  const ids = [...whiterunQuests].sort(() => Math.random() - 0.5).slice(0, 3).map((quest) => quest.id);
  const next = { ids, resetAt: now + 300_000, completedIds: [] };
  saveUser({ ...currentUser, questRotation: next });
  return next;
}

function openPortal() {
  portalModal.classList.remove("hidden");
  citySelection.classList.remove("hidden");
  questBoard.classList.add("hidden");
}

function closePortal() { portalModal.classList.add("hidden"); }
function closeStorage() { storageModal.classList.add("hidden"); }

function openWhiterun() {
  citySelection.classList.add("hidden");
  questBoard.classList.remove("hidden");
  renderQuestBoard();
}

function renderQuestBoard() {
  if (!currentUser) return;
  const rotation = getQuestRotation();
  const visibleQuests = rotation.ids.map((id) => whiterunQuests.find((quest) => quest.id === id));
  let active = currentUser.activeQuest;
  if (active && combatQuestConfig[active.id] && !active.combat) {
    active = { ...active, combat: createCombatResult(currentUser, active.id) };
    saveUser({ ...currentUser, activeQuest: active });
  }
  if (active && ["royal-stone", "royal-wood"].includes(active.id) && !active.gathering) {
    active = { ...active, gathering: createGatherResult(currentUser, active.id) };
    saveUser({ ...currentUser, activeQuest: active });
  }
  const now = Date.now();
  const freshActive = active;
  activeQuest.classList.toggle("hidden", !freshActive);
  if (freshActive) {
    const quest = whiterunQuests.find((item) => item.id === freshActive.id);
    const remaining = Math.max(0, freshActive.endsAt - Date.now());
    const total = freshActive.endsAt - freshActive.startedAt;
    const progress = Math.min(100, ((total - remaining) / total) * 100);
    activeQuest.innerHTML = `<strong>Sedang mengerjakan: ${escapeHtml(quest.title)}</strong><span>${formatDuration(remaining)} tersisa</span><div class="quest-progress"><span style="width:${progress}%"></span></div>`;
  }
  questList.innerHTML = visibleQuests.map((quest) => {
    const completed = rotation.completedIds?.includes(quest.id);
    return `
    <button class="quest-card" type="button" data-quest-id="${quest.id}" ${freshActive || completed ? "disabled" : ""}>
      <strong>${escapeHtml(quest.title)}</strong>
      <span>Hadiah: ${quest.gold[0]}–${quest.gold[1]} Gold${quest.item ? ` · ${quest.item} ${quest.amount[0]}–${quest.amount[1]}` : ""} · ${quest.xp} XP</span>
      <small>Durasi: ${formatDuration(quest.duration)} · Tidak ada syarat level${completed ? " · Selesai" : ""}</small>
    </button>`;
  }).join("");
  questRefreshTime.textContent = `Quest baru dalam ${formatDuration(Math.max(0, rotation.resetAt - Date.now()))}`;
}

function startQuest(id) {
  if (currentUser.activeQuest) return;
  const quest = whiterunQuests.find((item) => item.id === id);
  if (!quest || !window.confirm("Kerjakan quest ini?")) return;
  if (partyMembers.length) {
    beginPartyCountdown(quest);
    return;
  }
  beginQuest(quest);
}

function beginPartyCountdown(quest) {
  let seconds = 5;
  questCountdown.classList.remove("hidden");
  countdownValue.textContent = String(seconds);
  countdownPartyText.textContent = `${partyMembers.length} anggota Party akan ikut ke ${quest.title}.`;
  questCountdownTimer = window.setInterval(() => {
    seconds -= 1;
    countdownValue.textContent = String(seconds);
    if (seconds > 0) return;
    cancelPartyCountdown();
    beginQuest(quest);
  }, 1000);
}

function cancelPartyCountdown() {
  if (questCountdownTimer) window.clearInterval(questCountdownTimer);
  questCountdownTimer = null;
  questCountdown.classList.add("hidden");
}

function beginQuest(quest) {
  const startedAt = Date.now();
  saveUser({ ...currentUser, activeQuest: {
    id: quest.id,
    startedAt,
    endsAt: startedAt + quest.duration,
    party: partyMembers.map((name) => ({ name, ...socialPlayers[name] })),
    combat: createCombatResult(currentUser, quest.id),
    gathering: createGatherResult(currentUser, quest.id)
  } });
  closePortal();
  updatePortalStatus();
}

function completeQuest(active) {
  const quest = whiterunQuests.find((item) => item.id === active.id);
  if (!quest) return;
  const combat = active.combat || createCombatResult(currentUser, active.id);
  const gathering = active.gathering || createGatherResult(currentUser, active.id);
  const won = combat?.won !== false;
  const rewardRate = combat?.rewardRate || 1;
  const baseGold = randomReward(quest.gold);
  const gold = Math.max(0, Math.floor(baseGold * rewardRate)) + (combat?.bonusGold || 0);
  const gatheredBonus = gathering?.objects || 0;
  const specialGoblinBones = combat?.redKilled ? 5 : 0;
  const itemAmount = quest.item ? Math.max(0, Math.floor(randomReward(quest.amount) * rewardRate)) + gatheredBonus + specialGoblinBones : 0;
  const earnedXp = won ? quest.xp : Math.ceil(quest.xp / 2);
  const experience = grantExperience(currentUser, earnedXp);
  const inventory = { ...(currentUser.inventory || {}) };
  if (quest.item) inventory[quest.item] = (inventory[quest.item] || 0) + itemAmount;
  const rotation = getQuestRotation();
  saveUser({
    ...currentUser,
    gold: (currentUser.gold || 0) + gold,
    inventory,
    level: experience.level,
    xp: experience.xp,
    xpNeeded: experience.xpNeeded,
    unspentStatPoints: experience.unspentStatPoints,
    activeQuest: null,
    questRotation: { ...rotation, completedIds: [...new Set([...(rotation.completedIds || []), quest.id])] }
  });
  updatePortalStatus();
  renderDashboard();
  if (!portalModal.classList.contains("hidden") && !questBoard.classList.contains("hidden")) renderQuestBoard();
  const redSummary = combat?.redKilled ? " Goblin Merah dikalahkan: +5 Gold dan +5 Tulang Goblin." : combat?.redAppeared ? " Goblin Merah muncul tetapi lolos." : "";
  const combatSummary = combat ? ` ${combat.kills} musuh dikalahkan, termasuk bonus ${combat.bonusGold} Gold.${redSummary}` : gathering ? ` ${gathering.objects} ${gathering.item} berhasil dikumpulkan sebagai bonus.` : "";
  window.alert(won
    ? `Quest selesai!${combatSummary} Kamu mendapatkan ${gold} Gold${quest.item ? `, ${itemAmount} ${quest.item}` : ""}, dan ${earnedXp} XP.`
    : `Karakter gugur dan quest gagal.${combatSummary} Hadiah dikurangi menjadi ${Math.round(rewardRate * 100)}%: ${gold} Gold${quest.item ? `, ${itemAmount} ${quest.item}` : ""}, dan ${earnedXp} XP.`);
}

function grantExperience(user, amount) {
  let xp = (user.xp || 0) + amount;
  let xpNeeded = user.xpNeeded || 100;
  let level = user.level || 1;
  let unspentStatPoints = typeof user.unspentStatPoints === "number" ? user.unspentStatPoints : 5;
  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level += 1;
    xpNeeded = Math.ceil(xpNeeded * 1.7);
    unspentStatPoints += 1;
  }
  return { xp, xpNeeded, level, unspentStatPoints };
}

function updatePortalStatus() {
  if (!currentUser?.activeQuest) {
    battleTaskbar.classList.add("hidden");
    portalButton.classList.remove("portal-working", "portal-ready");
    portalProgressLabel.textContent = "Portal";
    portalQuestLabel.textContent = "";
    portalQuestLabel.classList.add("hidden");
    portalButton.setAttribute("aria-label", "Portal");
    return;
  }
  let active = currentUser.activeQuest;
  if (combatQuestConfig[active.id] && !active.combat) {
    active = { ...active, combat: createCombatResult(currentUser, active.id) };
    saveUser({ ...currentUser, activeQuest: active });
  }
  if (["royal-stone", "royal-wood"].includes(active.id) && !active.gathering) {
    active = { ...active, gathering: createGatherResult(currentUser, active.id) };
    saveUser({ ...currentUser, activeQuest: active });
  }
  const quest = whiterunQuests.find((item) => item.id === active.id);
  const total = active.endsAt - active.startedAt;
  const remaining = Math.max(0, active.endsAt - Date.now());
  const progress = Math.min(100, Math.floor(((total - remaining) / total) * 100));
  const ready = remaining === 0;
  updateBattleTaskbar(active, quest, progress, ready);
  portalButton.classList.toggle("portal-working", !ready);
  portalButton.classList.toggle("portal-ready", ready);
  portalProgressLabel.textContent = ready ? "Klaim!" : `${progress}%`;
  portalQuestLabel.textContent = quest ? quest.title : "Quest sedang dikerjakan";
  portalQuestLabel.classList.remove("hidden");
  portalButton.setAttribute("aria-label", ready ? "Quest selesai, klik untuk klaim hadiah" : `Quest sedang berjalan, ${progress}%`);
}

function updateBattleTaskbar(active, quest, progress, ready) {
  const questScenes = {
    "goblin-hunt": { type: "goblin", name: "Goblin Sarang", mode: "combat" },
    "slime-gate": { type: "slime", name: "Slime Gerbang", mode: "combat" },
    "royal-stone": { type: "rock", name: "Batu Tambang", mode: "gather" },
    "royal-wood": { type: "tree", name: "Pohon Kerajaan", mode: "gather" },
    "gate-guard": { type: "gate", name: "Gerbang Kerajaan", mode: "patrol" }
  };
  const scene = questScenes[active.id];
  const enemyType = scene?.type;
  if (!enemyType || !quest) {
    battleTaskbar.classList.add("hidden");
    return;
  }

  const isCombat = scene.mode === "combat";
  const combat = active.combat;
  const gathering = active.gathering;
  const isResource = scene.mode === "gather";
  const heroHp = isCombat && combat ? Math.max(0, Math.round(100 - (100 - combat.endHeroHp) * progress / 100)) : 100;
  const encounters = Math.max(1, combat?.kills || gathering?.objects || 1);
  const encounterProgress = (progress * encounters) % 100;
  const enemyHp = isCombat
    ? (ready ? (combat?.won ? 0 : 35) : Math.max(5, 100 - encounterProgress))
    : isResource ? (ready ? 0 : Math.max(5, 100 - encounterProgress)) : 100;
  battleTaskbar.classList.remove("hidden");
  battleTaskbar.classList.toggle("battle-ready", ready);
  battleTaskbar.classList.toggle("battle-failed", ready && combat?.won === false);
  battleTaskbar.classList.toggle("battle-patrol", scene.mode === "patrol");
  battleTaskbar.classList.toggle("battle-gather", scene.mode === "gather");
  battleTaskbar.classList.toggle("battle-combat", isCombat);
  battleTaskbar.classList.toggle("battle-resource", isResource);
  battleTaskbar.style.setProperty("--target-cycle", `${Math.max(1.8, (active.endsAt - active.startedAt) / encounters / 1000)}s`);
  battleHero.className = `battle-hero ${(currentUser.job || "STR").toLowerCase()}`;
  const redGoblinActive = enemyType === "goblin" && combat?.redAppeared && progress >= 42 && progress <= 68;
  battleEnemy.className = `battle-enemy ${enemyType}${redGoblinActive ? " red-goblin" : ""}`;
  battleEnemyName.textContent = redGoblinActive ? "Goblin Merah Elite" : scene.name;
  const questParty = active.party || combat?.party || [];
  partyFighters.innerHTML = questParty.slice(0, 4).map((member, index) => `<span class="party-fighter ${member.job.toLowerCase()}" style="--party-index:${index}" title="${escapeHtml(member.name)} · Lv.${member.level} ${member.job}"></span>`).join("");
  battleQuestName.textContent = quest.title;
  if (isCombat || isResource) {
    const defeatedNow = Math.min(encounters, Math.floor(progress * encounters / 100));
    battleProgress.textContent = ready
      ? (combat?.won === false ? "Gagal" : isResource ? `${encounters} Pecah` : "Menang!")
      : `${progress}% · ${defeatedNow} ${isResource ? "Pecah" : "KO"}`;
  } else {
    battleProgress.textContent = ready ? "Selesai!" : `${progress}%`;
  }
  heroBattleHp.style.width = `${heroHp}%`;
  enemyBattleHp.style.width = `${enemyHp}%`;
  battleProgressBar.style.width = `${progress}%`;
}

function openStorage() {
  const inventory = currentUser.inventory || {};
  document.querySelector("#storageGold").textContent = currentUser.gold || 0;
  document.querySelector("#inventoryList").innerHTML = Object.keys(inventory).length
    ? Object.entries(inventory).map(([item, amount]) => `<div class="inventory-item"><span>🎒 ${escapeHtml(item)}</span><strong>${amount}</strong></div>`).join("")
    : `<p class="empty-inventory">Storage masih kosong. Selesaikan quest untuk memperoleh item.</p>`;
  storageModal.classList.remove("hidden");
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(authForm);
  const username = String(formData.get("username")).trim();
  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password"));

  if (!email || password.length < 6 || (authMode === "register" && !username)) { authHint.textContent = "Lengkapi data akun dengan benar."; return; }
  authSubmit.disabled = true;
  authSubmit.textContent = authMode === "register" ? "Mendaftarkan..." : "Memuat...";
  try {
    const result = authMode === "login" ? await window.accountDB.login(email, password) : await window.accountDB.register(createUser(username, email), password);
    if (!result?.ok) { authHint.textContent = result?.error || "Pendaftaran gagal. Silakan coba lagi."; return; }
    currentUser = result.user;
    window.dispatchEvent(new Event("account:connected"));
    await refreshRealUsers();
    syncRoute();
  } catch (_error) {
    authHint.textContent = "Server tidak dapat dihubungi. Coba muat ulang aplikasi.";
  } finally {
    authSubmit.disabled = false;
    authSubmit.textContent = authMode === "register" ? "Daftar Akun" : "Masuk";
  }
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
});

authStartButtons.forEach((button) => {
  button.addEventListener("click", () => showAuthForm(button.dataset.authStart));
});

backToAuthChoice.addEventListener("click", showAuthChoice);

jobGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-job]");
  if (card) chooseJob(card.dataset.job);
});

jobGrid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-job]");
  if (card) chooseJob(card.dataset.job);
});

profilePhoto.addEventListener("change", async (event) => {
  selectedProfilePhoto = await fileToDataUrl(event.target.files[0]);
  renderAvatar(document.querySelector("#setupAvatar"), {
    ...currentUser,
    photo: selectedProfilePhoto
  });
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(profileForm);
  saveUser({
    ...currentUser,
    realName: String(formData.get("realName")).trim(),
    address: String(formData.get("address")).trim(),
    nickname: String(formData.get("nickname")).trim(),
    photo: selectedProfilePhoto || currentUser.photo,
    profileComplete: true
  });
  syncRoute();
});

postMedia.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file && file.size > 7_000_000) { event.target.value = ""; selectedPostMedia = null; document.querySelector("#mediaName").textContent = "Gambar/video maksimal 7 MB."; return; }
  selectedPostMedia = file
    ? { data: await fileToDataUrl(file), type: file.type, name: file.name }
    : null;
  document.querySelector("#mediaName").textContent = selectedPostMedia
    ? `Media dipilih: ${selectedPostMedia.name}`
    : "Belum ada media dipilih.";
});

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = document.querySelector("#postText").value.trim();
  if (!text && !selectedPostMedia) return;

  const result = await window.accountDB.createPost(text, selectedPostMedia?.type || "", selectedPostMedia?.data || "");
  if (!result?.ok) { document.querySelector("#mediaName").textContent = result?.error || "Status gagal dikirim."; return; }
  postForm.reset();
  selectedPostMedia = null;
  document.querySelector("#mediaName").textContent = "Belum ada media dipilih.";
  await renderFeed(true);
});

settingsPhoto.addEventListener("change", async (event) => {
  selectedSettingsPhoto = await fileToDataUrl(event.target.files[0]);
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(settingsForm);
  saveUser({
    ...currentUser,
    nickname: String(formData.get("settingsNickname")).trim(),
    realName: String(formData.get("settingsRealName")).trim(),
    address: String(formData.get("settingsAddress")).trim(),
    photo: selectedSettingsPhoto || currentUser.photo
  });
  selectedSettingsPhoto = "";
  renderDashboard();
  closeSettings();
});

rerollButton.addEventListener("click", () => {
  saveUser({
    ...currentUser,
    stats: weightedStatRoll(currentUser.job)
  });
  renderDashboard();
});

document.querySelector("#statList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-stat]");
  if (!button || currentUser.unspentStatPoints <= 0) return;

  const stat = button.dataset.addStat;
  saveUser({
    ...currentUser,
    stats: { ...currentUser.stats, [stat]: currentUser.stats[stat] + 1 },
    unspentStatPoints: currentUser.unspentStatPoints - 1
  });
  renderStats();
});

settingsButton.addEventListener("click", openSettings);
profileSettingsButton.addEventListener("click", () => { profileDrawer.classList.add("hidden"); openSettings(); });
openProfileDrawer.addEventListener("click", () => profileDrawer.classList.remove("hidden"));
closeProfileDrawer.addEventListener("click", () => profileDrawer.classList.add("hidden"));
profileDrawer.addEventListener("click", (event) => { if (event.target === profileDrawer) profileDrawer.classList.add("hidden"); });
closeSettingsButton.addEventListener("click", closeSettings);
settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) closeSettings();
});
document.querySelector("#settingsLogoutButton").addEventListener("click", logoutAccount);
document.querySelector("#deleteAccountButton").addEventListener("click", async () => {
  if (!window.confirm("Hapus akun ini? Semua data karakter, Gold, dan Storage akan hilang.")) return;
  closeSettings();
  await window.accountDB.delete();
  window.dispatchEvent(new Event("account:disconnected"));
  currentUser = null;
  syncRoute();
});

function renderParty() {
  partyCount.textContent = `${partyMemberCount}/5`;
  partySlots.forEach((slot, index) => slot.classList.toggle("filled", index < partyMemberCount));
  createPartyButton.textContent = partyCreated ? "Keluar dari Party" : "Buat Party";
  partyInviteButtons.forEach((button) => {
    button.disabled = !partyCreated || partyMemberCount >= 5 || button.dataset.invited === "true";
  });
}

function setInviteStatus(player, text, state = "") {
  const entry = [...document.querySelectorAll(".player-entry[data-player]")].find(item => item.dataset.player === player);
  if (!entry) return;
  const status = entry.querySelector(".invite-status");
  status.className = `invite-status ${state}`;
  status.innerHTML = text;
}

createPartyButton.addEventListener("click", () => {
  partyCreated = !partyCreated;
  partyMemberCount = partyCreated ? 1 : 0;
  partyMembers = [];
  document.querySelectorAll(".invite-status").forEach((status) => { status.textContent = ""; status.className = "invite-status"; });
  partyInviteButtons.forEach((button) => { button.dataset.invited = "false"; button.textContent = "+"; });
  renderParty();
});

partyInviteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const player = button.dataset.partyPlayer;
    if (!partyCreated || partyMemberCount >= 5 || !player) return;
    button.dataset.invited = "true";
    button.disabled = true;
    setInviteStatus(player, `Sedang mengundang ${escapeHtml(player)}... <span class="invite-response"><button class="accept" type="button">Terima</button><button class="reject" type="button">Tolak</button></span>`);

    const entry = document.querySelector(`.player-entry[data-player="${player}"]`);
    entry.querySelector(".accept").addEventListener("click", () => {
      partyMemberCount += 1;
      if (!partyMembers.includes(player)) partyMembers.push(player);
      setInviteStatus(player, "Sudah masuk party", "accepted");
      renderParty();
    });
    entry.querySelector(".reject").addEventListener("click", () => {
      setInviteStatus(player, "Ditolak", "rejected");
    });
  });
});

resetFromJob.addEventListener("click", resetAccount);
logoutButton.addEventListener("click", logoutAccount);

portalButton.addEventListener("click", () => {
  if (currentUser?.activeQuest && currentUser.activeQuest.endsAt <= Date.now()) {
    completeQuest(currentUser.activeQuest);
    return;
  }
  portalButton.classList.remove("portal-active");
  void portalButton.offsetWidth;
  portalButton.classList.add("portal-active");
  openPortal();
});

closePortalButton.addEventListener("click", closePortal);
portalModal.addEventListener("click", (event) => { if (event.target === portalModal) closePortal(); });
whiterunButton.addEventListener("click", openWhiterun);
backToCities.addEventListener("click", () => { questBoard.classList.add("hidden"); citySelection.classList.remove("hidden"); });
questList.addEventListener("click", (event) => {
  const quest = event.target.closest("[data-quest-id]");
  if (quest) startQuest(quest.dataset.questId);
});
storageButton.addEventListener("click", openStorage);
closeStorageButton.addEventListener("click", closeStorage);
storageModal.addEventListener("click", (event) => { if (event.target === storageModal) closeStorage(); });

document.addEventListener("click", async (event) => {
  const statsButton = event.target.closest("[data-view-stats]");
  if (statsButton) statsButton.closest(".player-entry").querySelector(".player-stat-popover").classList.toggle("hidden");
  const chatButton = event.target.closest("[data-open-chat], [data-chat-contact]");
  if (chatButton) openChat(chatButton.dataset.openChat || chatButton.dataset.chatContact);
  const addFriend = event.target.closest("[data-add-friend]");
  if (addFriend) {
    const player = socialPlayers[addFriend.dataset.addFriend];
    if (player && !addFriend.disabled) {
      const originalText = addFriend.textContent; addFriend.disabled = true; addFriend.textContent = "Mengirim...";
      const result = await window.accountDB.requestFriend(player.email);
      if (!result?.ok) { addFriend.disabled = false; addFriend.textContent = originalText; window.alert(result?.error || "Permintaan teman gagal dikirim."); }
      else { addFriend.textContent = result.accepted ? "✓ Berteman" : "Terkirim ✓"; await refreshRealUsers(); }
    }
  }
  const acceptFriend = event.target.closest("[data-friend-accept]");
  if (acceptFriend) { const player = socialPlayers[acceptFriend.dataset.friendAccept]; if (player) void window.accountDB.respondFriend(player.email,true).then(() => refreshRealUsers()); }
  const rejectFriend = event.target.closest("[data-friend-reject]");
  if (rejectFriend) { const player = socialPlayers[rejectFriend.dataset.friendReject]; if (player) void window.accountDB.respondFriend(player.email,false).then(() => refreshRealUsers()); }
});
const callOverlay = document.querySelector("#callOverlay");
const localVideo = document.querySelector("#localVideo");
const remoteVideo = document.querySelector("#remoteVideo");
const incomingCallActions = document.querySelector("#incomingCallActions");

function showCall(peerName, mode, status) {
  callOverlay.classList.remove("hidden");
  callOverlay.classList.toggle("voice-only", mode === "voice");
  document.querySelector("#callPeerName").textContent = peerName;
  document.querySelector("#callModeLabel").textContent = mode === "video" ? "Video call" : "Panggilan suara";
  document.querySelector("#callStatus").textContent = status;
}

async function acquireCallMedia(mode) {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("Perangkat tidak mendukung panggilan media.");
  localCallStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: mode === "video" });
  localVideo.srcObject = localCallStream;
}

function createPeer(recipientEmail) {
  peerConnection?.close();
  peerConnection = new RTCPeerConnection(rtcConfig);
  localCallStream?.getTracks().forEach(track => peerConnection.addTrack(track, localCallStream));
  peerConnection.ontrack = event => { remoteVideo.srcObject = event.streams[0]; document.querySelector("#callStatus").textContent = "Terhubung"; };
  peerConnection.onicecandidate = event => { if (event.candidate) window.realtime?.send("call-ice", recipientEmail, { candidate: event.candidate }); };
  peerConnection.onconnectionstatechange = () => { if (["failed", "disconnected"].includes(peerConnection?.connectionState)) document.querySelector("#callStatus").textContent = "Koneksi terputus"; };
}

async function startCall(mode) {
  const player = socialPlayers[activeChatPlayer];
  if (!player || player.offline) { document.querySelector("#chatPresence").textContent = "Pengguna harus online untuk menerima panggilan"; return; }
  activeCall = { email: player.email, name: activeChatPlayer, mode };
  showCall(activeChatPlayer, mode, "Meminta akses kamera/mikrofon...");
  incomingCallActions.classList.add("hidden");
  try {
    await acquireCallMedia(mode); createPeer(player.email);
    const offer = await peerConnection.createOffer(); await peerConnection.setLocalDescription(offer);
    window.realtime.send("call-offer", player.email, { mode, description: peerConnection.localDescription });
    document.querySelector("#callStatus").textContent = "Memanggil...";
  } catch (error) { document.querySelector("#callStatus").textContent = error.message || "Akses media ditolak."; }
}

function endCall(notify = true) {
  if (notify && activeCall) window.realtime?.send("call-end", activeCall.email);
  localCallStream?.getTracks().forEach(track => track.stop());
  peerConnection?.close(); peerConnection = null; localCallStream = null; activeCall = null; pendingCall = null; queuedIceCandidates = [];
  localVideo.srcObject = null; remoteVideo.srcObject = null; callOverlay.classList.add("hidden"); incomingCallActions.classList.add("hidden");
}

document.querySelector("#voiceCallButton").addEventListener("click", () => void startCall("voice"));
document.querySelector("#videoCallButton").addEventListener("click", () => void startCall("video"));
document.querySelector("#endCallButton").addEventListener("click", () => endCall());
document.querySelector("#rejectCallButton").addEventListener("click", () => { if (pendingCall) window.realtime?.send("call-end", pendingCall.email); endCall(false); });
document.querySelector("#acceptCallButton").addEventListener("click", async () => {
  if (!pendingCall) return;
  activeCall = pendingCall; incomingCallActions.classList.add("hidden");
  try { await acquireCallMedia(activeCall.mode); createPeer(activeCall.email); await peerConnection.setRemoteDescription(activeCall.description); for (const candidate of queuedIceCandidates.splice(0)) await peerConnection.addIceCandidate(candidate).catch(() => {}); const answer = await peerConnection.createAnswer(); await peerConnection.setLocalDescription(answer); window.realtime.send("call-answer", activeCall.email, { description: peerConnection.localDescription }); document.querySelector("#callStatus").textContent = "Menghubungkan..."; } catch (error) { document.querySelector("#callStatus").textContent = error.message || "Panggilan gagal."; }
});

window.addEventListener("realtime:signal", async event => {
  const { signalType, senderEmail, senderName, payload } = event.detail;
  if (signalType === "friend-request") { playMessageNotification(); showMessageToast({ senderEmail, senderName, preview:"Mengirim permintaan teman. Buka Message untuk merespons." }); await refreshRealUsers(); return; }
  if (signalType === "party-invite") {
    const accepted = window.confirm(`${senderName} mengundangmu masuk Party. Terima?`);
    window.realtime.send("party-response", senderEmail, { accepted });
    if (accepted && !partyMembers.includes(senderName)) { partyCreated = true; partyMembers.push(senderName); partyMemberCount = 1 + partyMembers.length; renderParty(); }
    return;
  }
  if (signalType === "party-response") {
    if (payload.accepted && !partyMembers.includes(senderName)) { partyMembers.push(senderName); partyMemberCount = 1 + partyMembers.length; renderParty(); setInviteStatus(senderName, "Sudah masuk party", "accepted"); }
    else setInviteStatus(senderName, "Undangan ditolak", "rejected");
    return;
  }
  if (signalType === "call-offer") { if (activeCall || pendingCall) { window.realtime.send("call-end", senderEmail); return; } pendingCall = { email: senderEmail, name: senderName, mode: payload.mode, description: payload.description }; showCall(senderName, payload.mode, "Panggilan masuk"); incomingCallActions.classList.remove("hidden"); return; }
  if (signalType === "call-answer" && peerConnection) { await peerConnection.setRemoteDescription(payload.description); return; }
  if (signalType === "call-ice" && payload.candidate) { if (peerConnection?.remoteDescription) await peerConnection.addIceCandidate(payload.candidate).catch(() => {}); else queuedIceCandidates.push(payload.candidate); return; }
  if (signalType === "call-end") endCall(false);
});

chatLauncher.addEventListener("click", () => {
  const opening = chatWindow.classList.contains("hidden");
  chatWindow.classList.toggle("hidden");
  if (opening) openChat(activeChatPlayer || Object.keys(socialPlayers)[0]);
});
document.querySelector("#closeChatButton").addEventListener("click", () => chatWindow.classList.add("hidden"));
cancelQuestCountdown.addEventListener("click", cancelPartyCountdown);
refreshOnlineUsers.addEventListener("click", () => void refreshRealUsers());
window.addEventListener("presence:update", () => { if (currentUser) void refreshRealUsers(); });
function updateUnreadBadge(refreshContacts = true) {
  const total = [...unreadMessages.values()].reduce((sum, count) => sum + count, 0) + pendingFriendRequests;
  chatUnread.textContent = total > 99 ? "99+" : String(total);
  chatUnread.dataset.count = String(total);
  const navBadge = document.querySelector("#messageNavUnread");
  navBadge.textContent = total > 99 ? "99+" : String(total);
  navBadge.dataset.count = String(total);
  if (refreshContacts) renderSocialFeatures();
}

function playMessageNotification() {
  try {
    notificationAudioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (notificationAudioContext.state === "suspended") void notificationAudioContext.resume();
    const now = notificationAudioContext.currentTime;
    [0, .12].forEach((delay, index) => { const oscillator = notificationAudioContext.createOscillator(), gain = notificationAudioContext.createGain(); oscillator.type = "sine"; oscillator.frequency.setValueAtTime(index ? 880 : 660, now + delay); gain.gain.setValueAtTime(.0001, now + delay); gain.gain.exponentialRampToValueAtTime(.16, now + delay + .012); gain.gain.exponentialRampToValueAtTime(.0001, now + delay + .16); oscillator.connect(gain).connect(notificationAudioContext.destination); oscillator.start(now + delay); oscillator.stop(now + delay + .18); });
  } catch (_error) {}
}

function showMessageToast(message) {
  const stack = document.querySelector("#messageToastStack"), toast = document.createElement("div");
  toast.className = "message-toast"; toast.dataset.senderEmail = message.senderEmail;
  toast.innerHTML = `<span class="message-toast-avatar">${escapeHtml((message.senderName || "TM").slice(0,2).toUpperCase())}</span><span class="message-toast-copy"><strong>${escapeHtml(message.senderName || "Pesan baru")}</strong><span>${escapeHtml(message.preview || "Mengirim media")}</span></span><button class="message-toast-close" type="button" aria-label="Tutup notifikasi">×</button>`;
  toast.addEventListener("click", event => { if (event.target.closest(".message-toast-close")) { toast.remove(); return; } const player = Object.keys(socialPlayers).find(name => socialPlayers[name].email === message.senderEmail); if (player && socialPlayers[player].friendship === "friends") void openChat(player); else chatWindow.classList.remove("hidden"); toast.remove(); });
  stack.prepend(toast); window.setTimeout(() => toast.remove(), 7000);
}

window.addEventListener("chat:update", event => {
  const message = event.detail || {}, player = Object.keys(socialPlayers).find(name => socialPlayers[name].email === message.senderEmail);
  playMessageNotification();
  if (!chatWindow.classList.contains("hidden") && activeChatPlayer === player) { void renderChatHistory(); return; }
  unreadMessages.set(message.senderEmail, (unreadMessages.get(message.senderEmail) || 0) + 1);
  updateUnreadBadge(); showMessageToast(message);
});
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if ((!text && !selectedChatMedia) || !activeChatPlayer || socialPlayers[activeChatPlayer]?.friendship !== "friends") return;
  const sent = await window.accountDB.sendMessage(socialPlayers[activeChatPlayer].email, text, selectedChatMedia?.type || "", selectedChatMedia?.data || "");
  if (!sent?.ok) { document.querySelector("#chatPresence").textContent = sent?.error || "Pesan gagal dikirim"; return; }
  chatInput.value = "";
  selectedChatMedia = null; document.querySelector("#chatMedia").value = ""; document.querySelector("#chatMediaPreview").classList.add("hidden");
  await renderChatHistory();
});
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

const chatEmoji = ["😀","😃","😄","😁","😂","🤣","😊","😍","🥰","😘","😎","🥳","😭","😢","😡","🤔","🫡","🤗","😴","🤩","👍","👎","👏","🙏","💪","🔥","✨","🎉","❤️","💛","💚","💙","💜","💯","✅","⚔️","🛡️","🧙","🐉","🏰"];
const emojiPicker = document.querySelector("#emojiPicker");
emojiPicker.innerHTML = chatEmoji.map(emoji => `<button type="button" data-chat-emoji="${emoji}" aria-label="Emoji ${emoji}">${emoji}</button>`).join("");
document.querySelector("#emojiToggle").addEventListener("click", () => emojiPicker.classList.toggle("hidden"));
emojiPicker.addEventListener("click", event => { const button = event.target.closest("[data-chat-emoji]"); if (!button) return; chatInput.value += button.dataset.chatEmoji; chatInput.focus(); });
document.querySelector("#chatMedia").addEventListener("change", async event => {
  const file = event.target.files[0]; const preview = document.querySelector("#chatMediaPreview");
  if (!file) { selectedChatMedia = null; preview.classList.add("hidden"); return; }
  if (file.size > 7_000_000) { event.target.value = ""; document.querySelector("#chatPresence").textContent = "Foto/video maksimal 7 MB"; return; }
  selectedChatMedia = { type:file.type, data:await fileToDataUrl(file), name:file.name };
  preview.innerHTML = `<span>📎 ${escapeHtml(file.name)}</span><button type="button" aria-label="Hapus lampiran">×</button>`; preview.classList.remove("hidden"); emojiPicker.classList.add("hidden");
  preview.querySelector("button").addEventListener("click", () => { selectedChatMedia = null; event.target.value = ""; preview.classList.add("hidden"); });
});

document.querySelectorAll("[data-nav]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.nav;
    if (target === "message") { chatWindow.classList.remove("hidden"); if (activeChatPlayer) void openChat(activeChatPlayer); }
    if (target === "feed") document.querySelector(".feed-panel").scrollIntoView({ behavior: "smooth" });
    if (target === "profile") document.querySelector(".profile-sidebar").scrollIntoView({ behavior: "smooth" });
    if (target === "settings") openSettings();
  });
});

let soundSettings = { enabled: true, volume: 60 };
try {
  soundSettings = { ...soundSettings, ...JSON.parse(localStorage.getItem(musicSettingsKey) || "{}") };
} catch (error) {
  console.warn("Pengaturan suara tidak dapat dibaca.", error);
}

soundSettings.volume = Math.max(0, Math.min(100, Number(soundSettings.volume) || 0));
musicVolume.value = String(soundSettings.volume);

function saveSoundSettings() {
  localStorage.setItem(musicSettingsKey, JSON.stringify(soundSettings));
}

function renderSoundControls() {
  musicButton.setAttribute("aria-pressed", String(soundSettings.enabled));
  musicButton.classList.toggle("is-muted", !soundSettings.enabled);
  musicButton.setAttribute("aria-label", soundSettings.enabled ? "Matikan soundtrack" : "Nyalakan soundtrack");
  musicButton.title = soundSettings.enabled ? "Matikan soundtrack" : "Nyalakan soundtrack";
  musicVolumeValue.value = `${soundSettings.volume}%`;
}

function applySoundSettings(shouldPlay = false) {
  soundtrackAudio.volume = soundSettings.volume / 100;
  soundtrackAudio.muted = !soundSettings.enabled;
  if (shouldPlay && soundSettings.enabled) {
    soundtrackAudio.play().catch(() => {
      // Browser biasa dapat meminta satu interaksi pengguna sebelum memutar audio.
    });
  }
}

musicButton.addEventListener("click", () => {
  soundSettings.enabled = !soundSettings.enabled;
  applySoundSettings(soundSettings.enabled);
  renderSoundControls();
  saveSoundSettings();
});

musicVolume.addEventListener("input", () => {
  soundSettings.volume = Number(musicVolume.value);
  soundSettings.enabled = soundSettings.volume > 0;
  applySoundSettings(soundSettings.enabled);
  renderSoundControls();
  saveSoundSettings();
});

document.addEventListener("pointerdown", () => applySoundSettings(true), { once: true });
renderSoundControls();
applySoundSettings(true);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !profileDrawer.classList.contains("hidden")) profileDrawer.classList.add("hidden");
  if (event.key === "Escape" && !settingsModal.classList.contains("hidden")) closeSettings();
  if (event.key === "Escape" && !portalModal.classList.contains("hidden")) closePortal();
  if (event.key === "Escape" && !storageModal.classList.contains("hidden")) closeStorage();
});

setInterval(() => {
  if (!currentUser) return;
  updatePortalStatus();
  if (!portalModal.classList.contains("hidden") && !questBoard.classList.contains("hidden")) renderQuestBoard();
}, 1000);

setAuthMode("register");
async function bootstrapApp() {
  if (!window.accountDB) {
    authHint.textContent = "Database hanya tersedia saat aplikasi dijalankan melalui Electron.";
    syncRoute();
    return;
  }
  currentUser = await window.accountDB.getSession();
  if (currentUser) { window.dispatchEvent(new Event("account:connected")); await refreshRealUsers(); }
  syncRoute();
  updatePortalStatus();
}
void bootstrapApp();
