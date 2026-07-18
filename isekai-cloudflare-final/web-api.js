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
    requestFriend: (email) => request("/api/friends/request", { method: "POST", body: JSON.stringify({ email }) }),
    respondFriend: (email, accept) => request("/api/friends/respond", { method: "POST", body: JSON.stringify({ email, accept }) })
  };
  let socket, shouldConnect = false;
  window.realtime = {
    send: (type, recipientEmail, payload = {}) => {
      if (socket?.readyState !== WebSocket.OPEN) return false;
      socket.send(JSON.stringify({ type, recipientEmail, payload }));
      return true;
    }
  };
  function connect() {
    if (!shouldConnect || socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) return;
    socket = new WebSocket(`${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/presence`);
    socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      const eventName = message.type === "chat" ? "chat:update" : message.type === "signal" ? "realtime:signal" : "presence:update";
      window.dispatchEvent(new CustomEvent(eventName, { detail: message }));
    });
    socket.addEventListener("close", () => { socket = null; if (shouldConnect) setTimeout(connect, 2000); });
  }
  window.addEventListener("account:connected", () => { shouldConnect = true; connect(); });
  window.addEventListener("account:disconnected", () => { shouldConnect = false; socket?.close(); });
})();
