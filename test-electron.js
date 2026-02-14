const { app } = require("electron"); console.log("Electron works\!"); app.whenReady().then(() => { console.log("App ready\!"); app.quit(); });
