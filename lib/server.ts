import app from './app';
import { SocketUpload } from './socketHandlers/file.sockethandler';
import {join} from 'path';

let port = 3000;

app.io.on('connection', (socket: any) => {
    console.log('User connected');

    let su = new SocketUpload(socket);
    su.uploadPath = join(__dirname, '../public/files');
    su.thumbPath = join(__dirname, '../public/files/thumbnails');
})



app.server.listen(port , ()=> console.log(`server is up ${port}`));