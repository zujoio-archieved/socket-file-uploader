import app from './app';
import { SocketUpload } from './socketHandlers/file.sockethandler';
import {join} from 'path';

let port = 3000;

let sp = new SocketUpload(app.io);
sp.uploadPath = join(__dirname, './public/files');
sp.thumbPath = join(__dirname, './public/files/thumbnails');


app.server.listen(port , ()=> console.log(`server is up ${port}`));