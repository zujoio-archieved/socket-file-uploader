"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_thumbnail_1 = require("node-thumbnail");
exports.generateThumb = (source, destination) => {
    node_thumbnail_1.thumb({
        source,
        destination,
        concurrency: 4,
        width: 200
    }, (files, err, stdout, stderr) => {
        console.log(files);
    });
};
//# sourceMappingURL=file.thumbnail.js.map