"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const chai_1 = require("chai");
const fs_1 = require("fs");
const path_1 = require("path");
const fileGenerator_1 = require("./fileGenerator");
let socket = null, emit = true;
let socketUrl = 'http://192.168.0.175:3000/';
let socketOptions = {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket']
};
let fsFile = null;
let fileName = 'dummy-file.mp4';
let filePath = path_1.resolve(__dirname, `../../test-feed-files/${fileName}`);
describe('read files', () => {
    beforeEach((done) => {
        socket = socket_io_client_1.connect(socketUrl, socketOptions);
        socket.on('connect', () => {
            console.log('conncted to server');
        });
        done(null);
    });
    it('Should read file', (done) => {
        fileGenerator_1.generateFile(14)
            .then(() => {
            console.log('File Generated');
            fs_1.readFile(filePath, 'binary', (err, data) => {
                fsFile = data;
                console.log('File Size', fs_1.statSync(filePath).size);
                done();
            });
        }).catch((err) => console.log(err));
    });
    it('Should Upload the File', (done) => {
        socket.emit('START', { name: fileName, size: fsFile.length });
        socket.on('MORE_DATA', (data) => {
            emit && moreData(data);
        });
        const moreData = (data) => {
            console.log(data);
            let place = data.place * 524288;
            let newFile = fsFile.slice(place, place + Math.min(524288, (fsFile.length - place)));
            socket.emit('UPLOAD', { name: fileName, data: newFile });
        };
        socket.on('DONE', (data) => {
            console.log('Upload complete', data);
            chai_1.expect(data.thumb).to.equal(0);
            fs_1.unlink(path_1.resolve(__dirname, `../../public/files/${fileName}`), () => {
                console.log('File Deleted');
                done();
            });
        });
    });
    it('Should Cancel the Upload', (done) => {
        socket.emit('START', { name: fileName, size: fsFile.length });
        socket.on('MORE_DATA', (data) => {
            emit && moreData(data);
        });
        const moreData = (data) => {
            console.log(data);
            let place = data.place * 524288;
            let newFile = fsFile.slice(place, place + Math.min(524288, (fsFile.length - place)));
            socket.emit('UPLOAD', { name: fileName, data: newFile });
        };
        setTimeout(() => socket.emit('cancel', { files: [fileName, 'nothing.png'] }), 700);
        socket.on('cancel-done', (data) => {
            chai_1.expect(data.count).to.equal(1);
            emit = false;
            done();
        });
    });
});
//# sourceMappingURL=socket.test.js.map