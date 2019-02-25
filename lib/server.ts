import app from './app';
import { SocketInit } from './socketHandlers/file.sockethandler';

let port = 3000;
new SocketInit();

app.server.listen(port , ()=> console.log(`server is up ${port}`));