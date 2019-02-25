import { FileController } from './controllers/file.controller'

export class Routes{

    private fileController: FileController = new FileController();
    
    public route(app): void{
        app.route('/upload')
            .post(this.fileController.fileUpload);    //http file upload

        app.route('/')
            .get(this.fileController.test);
    }
}