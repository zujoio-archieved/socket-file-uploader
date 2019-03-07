"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http_1 = require("http");
const socket = require("socket.io");
class App {
    constructor() {
        this.app = express();
        this.server = new http_1.Server(this.app);
        this.io = socket(this.server);
    }
}
exports.default = new App();
//# sourceMappingURL=app.js.map