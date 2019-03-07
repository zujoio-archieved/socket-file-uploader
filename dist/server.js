"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const file_sockethandler_1 = require("./fileHandlers/file.sockethandler");
const path_1 = require("path");
let port = 3000;
app_1.default.io.on('connection', (socket) => {
    console.log('User connected');
    let su = new file_sockethandler_1.SocketUpload(socket);
    su.uploadPath = path_1.join(__dirname, '../public/files');
    su.thumbPath = path_1.join(__dirname, '../public/files/thumbnails');
});
app_1.default.server.listen(port, () => console.log(`server is up ${port}`));
//# sourceMappingURL=server.js.map