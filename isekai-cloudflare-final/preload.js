const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("accountDB", {
  getSession: () => ipcRenderer.invoke("account:get-session"),
  register: (user, password) => ipcRenderer.invoke("account:register", { user, password }),
  login: (email, password) => ipcRenderer.invoke("account:login", { email, password }),
  save: (user) => ipcRenderer.invoke("account:save", user),
  logout: () => ipcRenderer.invoke("account:logout"),
  delete: () => ipcRenderer.invoke("account:delete"),
  listUsers: () => ipcRenderer.invoke("account:list-users"),
  getMessages: (recipientEmail) => ipcRenderer.invoke("chat:get", recipientEmail),
  sendMessage: (recipientEmail, body) => ipcRenderer.invoke("chat:send", { recipientEmail, body })
});
