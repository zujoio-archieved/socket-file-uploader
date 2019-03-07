"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class SocketUpload {
    constructor(socket) {
        this.files = {};
        this.socket = socket;
        this.socket.on('START', (file) => {
            var fileName = file.name;
            this.files[fileName] = {
                fileSize: file.size,
                data: '',
                downloaded: 0
            };
            let place = 0;
            try {
                let stat = fs_1.statSync(`${this.uploadPath}/${fileName}`);
                if (stat.isFile()) {
                    this.files[fileName]['downloaded'] = stat.size;
                    place = stat.size / 524288;
                }
            }
            catch (err) {
                console.log('New file arrived');
            }
            fs_1.open(`${this.uploadPath}/${fileName}`, 'a', 0o755, (err, fd) => {
                if (err)
                    return console.log(err);
                this.files[fileName]['handler'] = fd;
                socket.emit('MORE_DATA', { place, percent: 0 });
            });
        });
        this.socket.on('UPLOAD', (file) => {
            let fileName = file.name;
            this.files[fileName]['downloaded'] += file.data.length;
            this.files[fileName]['data'] += file.data;
            if (this.files[fileName]['downloaded'] == this.files[fileName]['fileSize']) { //file fully uploaded
                fs_1.write(this.files[fileName]['handler'], this.files[fileName]['data'], null, 'Binary', (err, written) => {
                    //Thumbnail
                    //generateThumb(`${this.uploadPath}/${fileName}`, `${this.thumbPath}/`)
                    // let inStream = createReadStream(`${tempPath}/${fileName}`);
                    // let outStream = createWriteStream(`${this.uploadPath}/${fileName}`);
                    // inStream.pipe(outStream);
                    // inStream.on('end', ()=> {
                    //     console.log('file copied');
                    //     unlink(`${tempPath}/${fileName}`, ()=>{
                    //         console.log('file Moved');
                    //         socket.emit('DONE', { thumb: 0 }); //succecss response
                    //     })
                    // })
                    socket.emit('DONE', { thumb: 0 }); //succecss response
                });
            }
            else if (this.files[fileName]['data'].length > 10485760) { //If the Data Buffer reaches 10MB
                fs_1.write(this.files[fileName]['handler'], this.files[fileName]['data'], null, 'Binary', (err, written) => {
                    this.files[fileName]['data'] = ''; //resetting buffer
                    let place = this.files[fileName]['downloaded'] / 524288;
                    let percent = (this.files[fileName]['downloaded'] / this.files[fileName]['fileSize']) * 100;
                    socket.emit('MORE_DATA', { place, percent });
                });
            }
            else {
                let place = this.files[fileName]['downloaded'] / 524288;
                let percent = (this.files[fileName]['downloaded'] / this.files[fileName]['fileSize']) * 100;
                socket.emit('MORE_DATA', { place, percent });
            }
        });
        this.socket.on('cancel', async (data) => {
            let count = 0;
            try {
                let filesArr = data.files;
                for (let i = 0; i < filesArr.length; i++) {
                    let stat = fs_1.statSync(`${this.uploadPath}/${filesArr[i]}`);
                    if (stat.isFile()) {
                        await new Promise((resolve, reject) => {
                            fs_1.unlink(`${this.uploadPath}/${filesArr[i]}`, () => {
                                count = count + 1;
                                console.log('Delete ', count);
                                resolve();
                            });
                        }).catch(() => console.log('deletion err'));
                    }
                    if (i === filesArr.length - 1) {
                        console.log('All files cancel done');
                        socket.emit('cancel-done', { count });
                    }
                }
            }
            catch (e) {
                console.log('No such file');
                socket.emit('cancel-done', { count });
            }
        });
        this.socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    }
}
exports.SocketUpload = SocketUpload;
//# sourceMappingURL=file.sockethandler.js.map