import * as express from 'express';
import { Server } from 'http'
import * as socket from 'socket.io';

class App{
    private app: any;
    public server: any;
    public io: any;

    constructor(){
        this.app = express();
        this.server = new Server(this.app);
        this.io = socket(this.server);
    }
}

export default new App();