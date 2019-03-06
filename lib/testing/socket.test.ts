// import {} from 'supertest';
import { connect } from 'socket.io-client';
import { expect } from 'chai';
import { readFile, unlink } from 'fs';
import {resolve} from 'path';

let socket = null, emit = true;
let socketUrl = 'http://192.168.0.175:3000/';
let socketOptions = {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket']
}
let fsFile = null;

// let fileName = 'abstract-reasoning-test-3-en.jpg';
let fileName = 'large-test-file.zip';
let filePath = resolve(__dirname, `../../test-feed-files/${fileName}`);

describe('read files', ()=>{
    beforeEach((done) => {
        socket = connect(socketUrl, socketOptions);
        socket.on('connect', ()=> {
            console.log('conncted to server');
        })
        done(null);
    })

    it('Should read file', (done) => {
        readFile(filePath, 'binary', (err, data)=>{
            fsFile = data;
            done();
        })
    })

    it('Should Upload the File',  (done) => {
                
            socket.emit('START', { name: fileName, size: fsFile.length });
            socket.on('MORE_DATA', (data) => {
                emit && moreData(data);
            })

            const moreData = (data) => {
                console.log(data);
                let place = data.place * 524288;
                let newFile = fsFile.slice(place, place + Math.min(524288, (fsFile.length - place)));
                socket.emit('UPLOAD', { name: fileName, data: newFile})
            }
            
            socket.on('DONE', (data)=>{
                console.log('Upload complete', data);
                expect(data.thumb).to.equal(0);

                unlink(resolve(__dirname, `../../public/files/${fileName}`), () =>{
                    console.log('File Deleted')
                    done();
                })
            })
        })

    it('Should Cancel the Upload', (done) => {
        socket.emit('START', { name: fileName, size: fsFile.length });
        socket.on('MORE_DATA', (data) => {
            emit && moreData(data);
        })

        const moreData = (data) => {
            console.log(data);
            let place = data.place * 524288;
            let newFile = fsFile.slice(place, place + Math.min(524288, (fsFile.length - place)));
            socket.emit('UPLOAD', { name: fileName, data: newFile})
        }

        setTimeout(() => socket.emit('cancel', { files: [fileName]}), 2000);

        socket.on('cancel-done', (data) => {
            expect(data.count).to.equal(1);
            emit = false;
            done();
        })
    })     
})