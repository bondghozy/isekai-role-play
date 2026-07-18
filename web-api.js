(function () {
  const request = async (url, options = {}) => {
    try {
      const response = await fetch(url, { credentials: "same-origin", headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
      const value = await response.json().catch(() => ({}));
      if (!response.ok && typeof value === "object" && value) value.ok = false;
      return value;
    } catch (_error) {
      return { ok: false, error: "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi." };
    }
  };
  window.accountDB = {
    getSession: () => request("/api/session"),
    register: (user, password) => request("/api/register", { method: "POST", body: JSON.stringify({ user, password }) }),
    login: (email, password) => request("/api/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    save: (user) => request("/api/save", { method: "POST", body: JSON.stringify(user) }),
    logout: () => request("/api/logout", { method: "POST" }),
    delete: () => request("/api/account", { method: "DELETE" }),
    listUsers: () => request("/api/users"),
    getMessages: (email) => request(`/api/messages?email=${encodeURIComponent(email)}`),
    sendMessage: (recipientEmail, body, mediaType = "", mediaData = "") => request("/api/messages", { method: "POST", body: JSON.stringify({ recipientEmail, body, mediaType, mediaData }) }),
    getPosts: (offset = 0, limit = 10) => request(`/api/posts?offset=${offset}&limit=${limit}`),
    createPost: (body, mediaType = "", mediaData = "") => request("/api/posts", { method: "POST", body: JSON.stringify({ body, mediaType, mediaData }) }),
    togglePostLike: (postId) => request(`/api/posts/${postId}/like`, { method: "POST", body: "{}" }),
    commentPost: (postId, body) => request(`/api/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ body }) }),
    sharePost: (postId) => request(`/api/posts/${postId}/share`, { method: "POST", body: "{}" }),
    deletePost: (postId) => request(`/api/posts/${postId}`, { method: "DELETE", body: "{}" }),
    getNotifications: () => request("/api/notifications"),
    readNotifications: () => request("/api/notifications/read", { method: "POST", body: "{}" }),
    sendSignal: (type, recipientEmail, payload = {}) => request("/api/signals", { method: "POST", body: JSON.stringify({ type, recipientEmail, payload }) }),
    getSignals: (after = 0) => request(`/api/signals?after=${after}`),
    requestFriend: (email) => request("/api/friends/request", { method: "POST", body: JSON.stringify({ email }) }),
    respondFriend: (email, accept) => request("/api/friends/respond", { method: "POST", body: JSON.stringify({ email, accept }) })
  };
  let socket, shouldConnect = false;
  window.realtime = {
    send: (type, recipientEmail, payload = {}) => {
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type, recipientEmail, payload }));
      else void window.accountDB.sendSignal(type, recipientEmail, payload);
      return true;
    }
  };
  function connect() {
    if (!shouldConnect || socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) return;
    socket = new WebSocket(`${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/presence`);
    socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      const eventName = message.type === "chat" ? "chat:update" : message.type === "signal" ? "realtime:signal" : message.type === "feed" ? "feed:update" : message.type === "notification" ? "notification:update" : "presence:update";
      window.dispatchEvent(new CustomEvent(eventName, { detail: message }));
    });
    socket.addEventListener("close", () => { socket = null; if (shouldConnect) setTimeout(connect, 2000); });
  }
  window.addEventListener("account:connected", () => { shouldConnect = true; connect(); });
  window.addEventListener("account:disconnected", () => { shouldConnect = false; socket?.close(); });
  let lastSignalId = 0;
  window.setInterval(async () => {
    if (!shouldConnect) return;
    const messages = await window.accountDB.getSignals(lastSignalId);
    if (!Array.isArray(messages)) return;
    messages.forEach(message => {
      lastSignalId = Math.max(lastSignalId, Number(message.id) || 0);
      const eventName = message.type === "chat" ? "chat:update" : "realtime:signal";
      window.dispatchEvent(new CustomEvent(eventName, { detail: message }));
    });
  }, 2000);
})();
