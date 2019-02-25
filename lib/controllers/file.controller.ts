import { Request, Response } from 'express';
import {join} from 'path'

let uploadPath = join(__dirname, '../public/files')

export class FileController {
    //http file upload
    public fileUpload = (req: Request, res: Response) => {
        let uploadFile = <any> req.files.file;
        let fileName: String = uploadFile.name;
        console.log(uploadFile)
        uploadFile.mv(`${uploadPath}/${fileName}`, (err)=> {
            if(err) {
                console.log(err);
                return res.status(500).send(err)};

            res.json({
                file: `public/${fileName}`
            })
        })
    }

    public test = (req: Request, res: Response) => {
        res.send('<h1>Worked</h1>');
    }
}