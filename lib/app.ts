import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Routes } from './routes';
import * as expressFileUpload from 'express-fileupload';
import * as cors from 'cors';
import { Server } from 'http'
import * as socket from 'socket.io';

class App{
    private app: any;
    public server: any;
    private routePrv: Routes = new Routes();
    public io: any;

    constructor(){
        this.app = express();
        this.server = new Server(this.app);
        this.io = socket(this.server);
        this.config();
        this.routePrv.route(this.app);
    }

    private config(): void {
        this.app.use(expressFileUpload());
        this.app.use(bodyParser.json());
        this.app.use(cors());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }
}

export default new App();